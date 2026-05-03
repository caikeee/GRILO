from datetime import datetime
import json
import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.auth import get_current_user_id
from backend.database import get_db
from backend.utils import mark_activity
from backend.schemas import (
    ChatWriteResponse,
    WritingChatRequest,
)

router = APIRouter(tags=["chat-text"])
logger = logging.getLogger(__name__)

_ERROR_TYPE_LABELS = {
    "article": "Artigos (a / an / the)",
    "gerund_after_verb": "Gerúndio (-ing após verbos)",
    "verb_tense": "Tempo verbal",
    "word_choice": "Escolha de palavras",
    "preposition": "Preposições (in / on / at)",
    "subject_verb_agreement": "Concordância verbal",
    "capitalization": "Letras maiúsculas",
    "spelling": "Ortografia",
    "unknown": "Gramática geral",
}


@router.post("/api/chat/write", response_model=ChatWriteResponse)
async def write_chat(
    request: WritingChatRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Writing mode chat - user writes in English, gets natural response + grammar feedback.
    """
    from services import evaluate_writing_response

    logger.info("[WRITE-CHAT] START | user_id=%s", user_id)
    start_time = datetime.now()

    try:
        result = await evaluate_writing_response(request, user_id, db)
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.info("[WRITE-CHAT] SUCCESS | user_id=%s | %.2fs", user_id, elapsed)
        mark_activity(db, int(user_id), "chat")
        return result
    except Exception as exc:
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.error("[WRITE-CHAT] ERROR | user_id=%s | %.2fs | %s", user_id, elapsed, str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


class TranslationImmersionRequest(BaseModel):
    text: str
    from_lang: str = "pt"
    to_lang: str = "en"


class LanguageDetectionRequest(BaseModel):
    text: str


@router.post("/api/translate/")
async def translate_immersion(
    request: TranslationImmersionRequest,
    user_id: int = Depends(get_current_user_id),
):
    """
    Translate immersion text between configured source and target languages.
    """
    from services import translate_with_direction

    logger.info(
        "[TRANSLATE-IMMERSION] START | user_id=%s | %s -> %s",
        user_id,
        request.from_lang,
        request.to_lang,
    )

    try:
        translation = await translate_with_direction(
            request.text,
            from_lang=request.from_lang,
            to_lang=request.to_lang,
        )
        return {
            "translated_text": translation,
            "original_text": request.text,
            "from_lang": request.from_lang,
            "to_lang": request.to_lang,
        }
    except Exception as exc:
        logger.error("[TRANSLATE-IMMERSION] ERROR | %s", str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/detect-language/")
async def detect_language(
    request: LanguageDetectionRequest,
    user_id: int = Depends(get_current_user_id),
):
    """Detect language for short user inputs when frontend confidence is low."""
    from services import detect_language_from_text

    logger.info("[LANG-DETECT] START | user_id=%s", user_id)

    try:
        return detect_language_from_text(request.text)
    except Exception as exc:
        logger.error("[LANG-DETECT] ERROR | %s", str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


class SessionSummaryRequest(BaseModel):
    session_start: str  # ISO datetime string (e.g. "2026-04-21T10:00:00")


@router.post("/api/chat/session-summary")
async def get_session_summary(
    request: SessionSummaryRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Returns a learning summary for the current chat session.
    Includes accuracy trend, top errors, related lessons, vocabulary learned, and improvement vs historical.
    """
    from db_models import Conversation
    from datetime import timedelta
    from lessons_v2 import find_lessons_for_error_type

    logger.info("[SESSION-SUMMARY] user_id=%s session_start=%s", user_id, request.session_start)

    try:
        # Parse session start (support both 'Z' and '+00:00' suffixes)
        session_start_str = request.session_start.replace("Z", "+00:00")
        try:
            session_start = datetime.fromisoformat(session_start_str)
            # Strip timezone info for comparison with naive DB datetimes
            if session_start.tzinfo is not None:
                session_start = session_start.replace(tzinfo=None)
        except ValueError:
            session_start = datetime.utcnow() - timedelta(hours=2)

        uid = int(user_id)

        # ---- User messages in this session ----
        session_user_convs = (
            db.query(Conversation)
            .filter(
                Conversation.user_id == uid,
                Conversation.message_role == "user",
                Conversation.timestamp >= session_start,
            )
            .all()
        )

        if not session_user_convs:
            return {"has_data": False}

        messages_sent = len(session_user_convs)
        accuracies = [c.writing_accuracy_score for c in session_user_convs if c.writing_accuracy_score is not None]
        session_accuracy = round(sum(accuracies) / len(accuracies)) if accuracies else None
        xp_earned = sum(c.xp_awarded for c in session_user_convs)

        # ---- Error frequency ----
        error_counts: dict[str, int] = {}
        for conv in session_user_convs:
            if conv.error_corrections:
                corrections = (
                    json.loads(conv.error_corrections)
                    if isinstance(conv.error_corrections, str)
                    else conv.error_corrections
                )
                for c in (corrections or []):
                    et = c.get("error_type", "unknown")
                    error_counts[et] = error_counts.get(et, 0) + 1

        top_errors = sorted(error_counts.items(), key=lambda x: x[1], reverse=True)[:3]

        # ---- Vocabulary collected in this session (stored on assistant messages) ----
        session_assistant_convs = (
            db.query(Conversation)
            .filter(
                Conversation.user_id == uid,
                Conversation.message_role == "assistant",
                Conversation.timestamp >= session_start,
                Conversation.new_vocabulary.isnot(None),
            )
            .all()
        )

        vocab_seen: set[str] = set()
        vocabulary: list[dict] = []
        for conv in session_assistant_convs:
            if conv.new_vocabulary:
                vlist = (
                    json.loads(conv.new_vocabulary)
                    if isinstance(conv.new_vocabulary, str)
                    else conv.new_vocabulary
                )
                for v in (vlist or []):
                    expr = v.get("expression", "").strip()
                    if expr and expr not in vocab_seen:
                        vocab_seen.add(expr)
                        vocabulary.append(v)

        # ---- 7-day accuracy trend ----
        today = datetime.utcnow().date()
        trend = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_start = datetime(day.year, day.month, day.day)
            day_end = datetime(day.year, day.month, day.day, 23, 59, 59)
            day_convs = (
                db.query(Conversation)
                .filter(
                    Conversation.user_id == uid,
                    Conversation.message_role == "user",
                    Conversation.writing_accuracy_score.isnot(None),
                    Conversation.timestamp >= day_start,
                    Conversation.timestamp <= day_end,
                )
                .all()
            )
            avg = None
            if day_convs:
                avg = round(sum(c.writing_accuracy_score for c in day_convs) / len(day_convs))
            trend.append({"date": str(day), "accuracy": avg, "is_today": i == 0})

        # ---- Historical accuracy (all time before this session) ----
        past_convs = (
            db.query(Conversation)
            .filter(
                Conversation.user_id == uid,
                Conversation.message_role == "user",
                Conversation.writing_accuracy_score.isnot(None),
                Conversation.timestamp < session_start,
            )
            .all()
        )
        historical_accuracy = None
        if past_convs:
            historical_accuracy = round(
                sum(c.writing_accuracy_score for c in past_convs) / len(past_convs)
            )

        improvement = None
        if session_accuracy is not None and historical_accuracy is not None:
            diff = session_accuracy - historical_accuracy
            improvement = f"+{diff}%" if diff >= 0 else f"{diff}%"
            improvement_positive = diff >= 0
        else:
            improvement_positive = True

        # ---- Related lessons for top errors ----
        related_lessons = []
        seen_lesson_ids: set[int] = set()
        for error_type, count in top_errors:
            lessons = find_lessons_for_error_type(error_type, max_results=1)
            for lesson in lessons:
                lid = lesson.get("id")
                if lid and lid not in seen_lesson_ids:
                    seen_lesson_ids.add(lid)
                    related_lessons.append({
                        "lesson_id": lid,
                        "title": lesson.get("title", ""),
                        "error_type": error_type,
                        "error_label": _ERROR_TYPE_LABELS.get(error_type, error_type),
                        "error_count": count,
                    })

        logger.info(
            "[SESSION-SUMMARY] user_id=%s msgs=%s accuracy=%s vocab=%s errors=%s",
            user_id, messages_sent, session_accuracy, len(vocabulary), len(error_counts),
        )

        return {
            "has_data": True,
            "session_stats": {
                "messages_sent": messages_sent,
                "accuracy_avg": session_accuracy,
                "xp_earned": xp_earned,
                "corrections_total": sum(error_counts.values()),
            },
            "top_errors": [
                {
                    "error_type": et,
                    "count": cnt,
                    "label": _ERROR_TYPE_LABELS.get(et, et),
                }
                for et, cnt in top_errors
            ],
            "accuracy_trend": trend,
            "historical_accuracy": historical_accuracy,
            "improvement": improvement,
            "improvement_positive": improvement_positive,
            "related_lessons": related_lessons,
            "vocabulary": vocabulary[:10],
            "vocab_count": len(vocabulary),
        }

    except Exception as exc:
        logger.error("[SESSION-SUMMARY] ERROR | user_id=%s | %s", user_id, str(exc))
        raise HTTPException(status_code=500, detail=str(exc))
