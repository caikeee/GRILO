"""Phrases Controller — Exercício de voz por aula + painel Dificuldades.

Endpoints:
    GET  /api/lessons/{lesson_id}/phrases          → 5 frases para a sessão de voz
    POST /api/lessons/{lesson_id}/phrases/result   → registra resultado por frase
    GET  /api/user/difficulties                    → frases difíceis para o painel da home
"""

from datetime import datetime
import logging
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.auth import get_current_user_id
from backend.database import get_db
from backend.db_models import (
    LessonPhraseBank,
    LessonProgress,
    PhraseError,
)
from backend.utils import award_xp, mark_activity, track_metric_event

router = APIRouter(tags=["phrases"])
logger = logging.getLogger(__name__)


# ============================================================
# Models
# ============================================================

class _PhraseResultBody(BaseModel):
    phrase_id: int
    result: str = Field(..., pattern="^(dominada|dificil|pulada)$")
    wrong_words: Optional[List[str]] = None        # palavras erradas no reconhecimento
    transcript: Optional[str] = None               # o que o usuário falou


class _SessionResultBody(BaseModel):
    """Salva o resumo final de uma sessão de exercício de voz."""
    lesson_id: int
    phrases: List[_PhraseResultBody]
    duration_seconds: Optional[int] = None


# ============================================================
# Helpers
# ============================================================

def _phrase_to_dict(phrase: LessonPhraseBank, error: Optional[PhraseError] = None) -> dict:
    return {
        "id": phrase.id,
        "lesson_id": phrase.lesson_id,
        "phrase_en": phrase.phrase_en,
        "phrase_pt": phrase.phrase_pt,
        "phonetic": phrase.phonetic,
        "warning_pt": phrase.warning_pt,
        "difficulty_level": phrase.difficulty_level,
        "source": phrase.source,
        "user_status": (error.status if error else "nova"),
        "user_attempts": (error.attempts if error else 0),
        "user_correct_sessions": (error.correct_sessions if error else 0),
    }


def _get_or_create_phrase_error(
    db: Session, user_id: int, phrase: LessonPhraseBank
) -> PhraseError:
    err = (
        db.query(PhraseError)
        .filter(
            PhraseError.user_id == user_id,
            PhraseError.phrase_id == phrase.id,
        )
        .first()
    )
    if err:
        return err

    err = PhraseError(
        user_id=user_id,
        lesson_id=phrase.lesson_id,
        phrase_id=phrase.id,
        status="em_progresso",
        attempts=0,
        correct_sessions=0,
        skipped_count=0,
    )
    db.add(err)
    db.flush()
    return err


def _recompute_dominated_count(db: Session, user_id: int, lesson_id: int) -> int:
    """Conta frases com status='dominada' nessa aula para o usuário."""
    return (
        db.query(PhraseError)
        .filter(
            PhraseError.user_id == user_id,
            PhraseError.lesson_id == lesson_id,
            PhraseError.status == "dominada",
        )
        .count()
    )


def _update_lesson_dominated_progress(
    db: Session, user_id: int, lesson_id: int
) -> dict:
    """Atualiza o contador no LessonProgress; retorna {count, total, just_dominated}."""
    count = _recompute_dominated_count(db, user_id, lesson_id)

    lp = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.user_id == user_id,
            LessonProgress.lesson_id == lesson_id,
        )
        .first()
    )

    just_dominated = False
    if lp:
        previous_count = lp.dominated_phrases_count or 0
        lp.dominated_phrases_count = count
        # Considera "dominada total" quando atinge 100 — para 5 frases iniciais,
        # também marcar quando atingir o total disponível na aula
        total_phrases_in_lesson = (
            db.query(LessonPhraseBank)
            .filter(LessonPhraseBank.lesson_id == lesson_id)
            .count()
        )
        target = max(100, total_phrases_in_lesson)  # alvo é 100 mas funciona para aulas em construção
        # Usa o total atual (5 hoje, 100 no futuro) como gate inicial
        gate = total_phrases_in_lesson if total_phrases_in_lesson < 100 else 100
        if count >= gate and not lp.dominated_at:
            lp.dominated_at = datetime.utcnow()
            just_dominated = True
        lp.updated_at = datetime.utcnow()
        db.commit()
        return {
            "count": count,
            "total": total_phrases_in_lesson,
            "gate": gate,
            "just_dominated": just_dominated,
            "previous_count": previous_count,
        }

    return {"count": count, "total": 0, "gate": 100, "just_dominated": False, "previous_count": 0}


# ============================================================
# GET /api/lessons/{lesson_id}/phrases
# ============================================================

@router.get("/api/lessons/{lesson_id}/phrases")
async def get_lesson_phrases(
    lesson_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Retorna até 5 frases para a sessão de voz da aula.

    Prioriza:
      1. Frases marcadas como 'dificil' do usuário (até 2)
      2. Frases ainda não dominadas (em_progresso ou nova)
      3. Completa com frases dominadas se faltar (revisão leve)
    """
    try:
        uid = int(user_id)

        all_phrases = (
            db.query(LessonPhraseBank)
            .filter(LessonPhraseBank.lesson_id == lesson_id)
            .order_by(LessonPhraseBank.order_hint.asc(), LessonPhraseBank.id.asc())
            .all()
        )
        if not all_phrases:
            return {
                "success": True,
                "lesson_id": lesson_id,
                "phrases": [],
                "total_in_lesson": 0,
                "dominated_in_lesson": 0,
            }

        errors_map = {
            e.phrase_id: e
            for e in db.query(PhraseError)
            .filter(PhraseError.user_id == uid, PhraseError.lesson_id == lesson_id)
            .all()
        }

        difficult_phrases = []
        in_progress_phrases = []
        dominated_phrases = []

        for p in all_phrases:
            err = errors_map.get(p.id)
            if err and err.status == "dificil":
                difficult_phrases.append((p, err))
            elif err and err.status == "dominada":
                dominated_phrases.append((p, err))
            else:
                in_progress_phrases.append((p, err))

        selected: List[tuple] = []
        for pair in difficult_phrases[:2]:
            selected.append(pair)
        for pair in in_progress_phrases:
            if len(selected) >= 5:
                break
            selected.append(pair)
        for pair in dominated_phrases:
            if len(selected) >= 5:
                break
            selected.append(pair)

        # Garante ordem estável: dificeis primeiro, depois ordem original
        seen_ids = set()
        ordered = []
        for pair in selected:
            if pair[0].id not in seen_ids:
                seen_ids.add(pair[0].id)
                ordered.append(pair)

        phrases_payload = [_phrase_to_dict(p, e) for p, e in ordered]
        dominated_count = sum(
            1 for p, e in [(p, errors_map.get(p.id)) for p in all_phrases]
            if e and e.status == "dominada"
        )

        return {
            "success": True,
            "lesson_id": lesson_id,
            "phrases": phrases_payload,
            "total_in_lesson": len(all_phrases),
            "dominated_in_lesson": dominated_count,
        }
    except Exception as exc:
        logger.error("[PHRASES-GET] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error loading lesson phrases")


# ============================================================
# POST /api/lessons/{lesson_id}/phrases/result
# ============================================================

@router.post("/api/lessons/{lesson_id}/phrases/result")
async def submit_phrase_result(
    lesson_id: int,
    body: _SessionResultBody,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Recebe o resumo de toda a sessão (5 frases) e atualiza PhraseError."""
    try:
        uid = int(user_id)
        if body.lesson_id != lesson_id:
            raise HTTPException(status_code=400, detail="lesson_id mismatch")

        per_phrase = []
        dominadas_now = []

        for item in body.phrases:
            phrase = (
                db.query(LessonPhraseBank)
                .filter(
                    LessonPhraseBank.id == item.phrase_id,
                    LessonPhraseBank.lesson_id == lesson_id,
                )
                .first()
            )
            if not phrase:
                continue

            err = _get_or_create_phrase_error(db, uid, phrase)
            err.attempts = (err.attempts or 0) + 1
            err.last_attempted_at = datetime.utcnow()
            err.last_wrong_words = item.wrong_words or []

            if item.result == "dominada":
                err.correct_sessions = (err.correct_sessions or 0) + 1
                # 1 acerto consolidado já marca como dominada (UX rápida no MVP).
                # Quando o banco crescer, podemos exigir 2 sessões.
                if err.status != "dominada":
                    err.status = "dominada"
                    dominadas_now.append(phrase.id)
            elif item.result == "pulada":
                err.skipped_count = (err.skipped_count or 0) + 1
                if err.status != "dominada":
                    err.status = "dificil"
            elif item.result == "dificil":
                if err.status != "dominada":
                    err.status = "dificil"

            per_phrase.append({
                "phrase_id": phrase.id,
                "phrase_en": phrase.phrase_en,
                "status": err.status,
                "attempts": err.attempts,
            })

        db.commit()

        # Atualiza contador de frases dominadas na aula
        progress = _update_lesson_dominated_progress(db, uid, lesson_id)

        # XP por sessão de voz das frases
        sessao_xp = 5 + (3 * len(dominadas_now))  # 5 base + 3 por frase dominada
        xp_result = award_xp(db, uid, sessao_xp, source="phrase_voice_session")

        mark_activity(db, uid, "voice")
        track_metric_event(
            db,
            uid,
            "voice",
            "phrase_voice_session_completed",
            lesson_id=lesson_id,
            details={
                "total_phrases": len(body.phrases),
                "dominated": len(dominadas_now),
                "duration_seconds": body.duration_seconds,
            },
        )

        return {
            "success": True,
            "lesson_id": lesson_id,
            "per_phrase": per_phrase,
            "dominated_in_lesson": progress["count"],
            "total_in_lesson": progress["total"],
            "just_dominated_lesson": progress["just_dominated"],
            "xp_earned": xp_result["xp_earned"],
            "user_total_xp": xp_result["new_total"],
            "level_up": xp_result["level_up"],
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("[PHRASES-RESULT] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error saving phrase results")


# ============================================================
# GET /api/user/difficulties
# ============================================================

@router.get("/api/user/difficulties")
async def get_user_difficulties(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    limit: int = 5,
):
    """Retorna as frases mais difíceis do usuário para o painel Dificuldades."""
    try:
        uid = int(user_id)

        rows = (
            db.query(PhraseError, LessonPhraseBank)
            .join(LessonPhraseBank, PhraseError.phrase_id == LessonPhraseBank.id)
            .filter(
                PhraseError.user_id == uid,
                PhraseError.status == "dificil",
            )
            .order_by(PhraseError.attempts.desc(), PhraseError.last_attempted_at.desc())
            .limit(max(1, limit))
            .all()
        )

        # Total de difíceis
        total_difficult = (
            db.query(PhraseError)
            .filter(PhraseError.user_id == uid, PhraseError.status == "dificil")
            .count()
        )

        # Resolver títulos das aulas (cache simples)
        from backend.lessons_v2 import get_lesson_by_id
        lesson_titles = {}
        items = []
        for err, phrase in rows:
            lid = phrase.lesson_id
            if lid not in lesson_titles:
                lesson = get_lesson_by_id(lid)
                lesson_titles[lid] = (lesson or {}).get("title", f"Aula {lid}")

            items.append({
                "phrase_id": phrase.id,
                "phrase_en": phrase.phrase_en,
                "phrase_pt": phrase.phrase_pt,
                "phonetic": phrase.phonetic,
                "warning_pt": phrase.warning_pt,
                "lesson_id": lid,
                "lesson_title": lesson_titles[lid],
                "attempts": err.attempts,
                "skipped_count": err.skipped_count,
                "last_wrong_words": err.last_wrong_words or [],
                "last_attempted_at": err.last_attempted_at.isoformat() if err.last_attempted_at else None,
            })

        return {
            "success": True,
            "total_difficult": total_difficult,
            "phrases": items,
        }
    except Exception as exc:
        logger.error("[DIFFICULTIES] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error loading difficulties")


# ============================================================
# GET /api/lessons/progress-extended  → progresso enriquecido p/ cards
# ============================================================

@router.get("/api/lessons/progress-extended")
async def get_lessons_progress_extended(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Progresso por aula incluindo: aprendida (learned_at), dominated_phrases_count, total."""
    try:
        uid = int(user_id)

        # progresso por aula (learn/dominate)
        records = (
            db.query(LessonProgress)
            .filter(LessonProgress.user_id == uid)
            .all()
        )

        # total de frases por aula
        from sqlalchemy import func
        totals_rows = (
            db.query(LessonPhraseBank.lesson_id, func.count(LessonPhraseBank.id))
            .group_by(LessonPhraseBank.lesson_id)
            .all()
        )
        totals = {lid: count for lid, count in totals_rows}

        progress_map = {}
        for record in records:
            total = totals.get(record.lesson_id, 0)
            progress_map[record.lesson_id] = {
                "lesson_id": record.lesson_id,
                "correct_answers": record.correct_answers,
                "total_questions": record.total_questions,
                "attempts": record.attempts,
                "completed_at": record.completed_at.isoformat() if record.completed_at else None,
                "learned_at": record.learned_at.isoformat() if record.learned_at else None,
                "learned": record.learned_at is not None,
                "dominated_phrases_count": record.dominated_phrases_count or 0,
                "total_phrases_in_lesson": total,
                "dominated_at": record.dominated_at.isoformat() if record.dominated_at else None,
                "dominated": record.dominated_at is not None,
            }

        return {
            "success": True,
            "progress": progress_map,
            "totals_by_lesson": totals,
        }
    except Exception as exc:
        logger.error("[LESSONS-PROGRESS-EXT] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error loading extended progress")
