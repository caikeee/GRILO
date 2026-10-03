"""Controller da Ditação (frontend/assets/js/dictation.js): ouvir uma frase e digitá-la.

Credita palavras digitadas certo no pool WordProfile (mesma regra do Shadowing)
e frases digitadas perfeitas (sem dica) em DictationPhrase.

Endpoints:
    POST /api/dictation/tracks/{slug}/result  → registra sessão, credita vocabulário + frases, XP
    GET  /api/dictation/summary                → agregados
"""
import logging
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.auth import get_current_user_id
from backend.controllers.shadowing_controller import credit_word_profiles
from backend.database import get_db
from backend.db_models import DictationResult, DictationPhrase
from backend.utils import mark_activity, award_xp, track_metric_event

router = APIRouter(tags=["dictation"])
logger = logging.getLogger(__name__)


class _DictationWordBody(BaseModel):
    word: str
    correct: bool


class _DictationSentenceBody(BaseModel):
    index: int
    en: str
    all_correct: bool


class _DictationResultBody(BaseModel):
    score: int
    words: List[_DictationWordBody]
    sentences: List[_DictationSentenceBody] = []
    combo_max: int = 0
    unlocked_next: bool = False


@router.post("/api/dictation/tracks/{track_slug}/result")
async def submit_dictation_result(
    track_slug: str,
    body: _DictationResultBody,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    try:
        uid = int(user_id)
        now = datetime.utcnow()
        score = max(0, min(100, body.score))
        # combo nunca passa do nº de frases enviadas — não confiar no cliente
        combo_max = max(0, min(body.combo_max, len(body.sentences)))

        word_stats, newly_mastered = credit_word_profiles(db, uid, body.words, now)

        newly_dominated_phrases = 0
        if body.sentences:
            existing = {
                p.sentence_index: p
                for p in db.query(DictationPhrase).filter(
                    DictationPhrase.user_id == uid,
                    DictationPhrase.track_slug == track_slug,
                ).all()
            }
            seen = set()
            for sent in body.sentences:
                if not sent.all_correct or sent.index in seen:
                    continue
                seen.add(sent.index)
                row = existing.get(sent.index)
                if row is None:
                    row = DictationPhrase(
                        user_id=uid,
                        track_slug=track_slug,
                        sentence_index=sent.index,
                        sentence_en=sent.en,
                        correct_sessions=0,
                        dominated=False,
                    )
                    db.add(row)
                    existing[sent.index] = row
                was_dominated = row.dominated
                row.correct_sessions += 1
                row.last_correct_at = now
                row.dominated = True
                if not was_dominated:
                    newly_dominated_phrases += 1

        db.add(DictationResult(
            user_id=uid,
            track_slug=track_slug,
            score=score,
            words_correct=sum(s["correct"] for s in word_stats.values()),
            words_total=sum(s["uses"] for s in word_stats.values()),
            combo_max=combo_max,
            created_at=now,
        ))
        db.commit()

        xp_amount = (
            5 * newly_mastered
            + 8 * newly_dominated_phrases
            + 2 * max(0, combo_max - 3)
            + (15 if body.unlocked_next else 0)
        )
        xp_result = {"xp_earned": 0, "new_total": 0, "level_up": False, "new_level": 1}
        if xp_amount > 0:
            xp_result = award_xp(db, uid, xp_amount, source="dictation")

        mark_activity(db, uid, "dictation")
        track_metric_event(
            db, uid, "dictation", "dictation_track_result",
            details={
                "track_slug": track_slug,
                "score": score,
                "words": len(word_stats),
                "combo_max": combo_max,
                "newly_mastered": newly_mastered,
                "newly_dominated_phrases": newly_dominated_phrases,
                "unlocked_next": body.unlocked_next,
            },
        )

        return {
            "success": True,
            "track_slug": track_slug,
            "newly_mastered": newly_mastered,
            "newly_dominated_phrases": newly_dominated_phrases,
            "xp_earned": xp_result.get("xp_earned", 0),
            "user_total_xp": xp_result.get("new_total", 0),
            "level_up": xp_result.get("level_up", False),
        }
    except Exception as exc:
        logger.error("[DICTATION-RESULT] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error saving dictation result")


@router.get("/api/dictation/summary")
async def get_dictation_summary(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    try:
        uid = int(user_id)
        results = db.query(DictationResult).filter(DictationResult.user_id == uid).all()
        tracks_done = {r.track_slug for r in results}
        phrases_dominated = (
            db.query(DictationPhrase)
            .filter(DictationPhrase.user_id == uid, DictationPhrase.dominated.is_(True))
            .count()
        )
        return {
            "success": True,
            "tracks_completed": len(tracks_done),
            "completed_slugs": sorted(tracks_done),
            "sessions_logged": len(results),
            "phrases_dominated": phrases_dominated,
            "best_combo": max((r.combo_max or 0 for r in results), default=0),
        }
    except Exception as exc:
        logger.error("[DICTATION-SUMMARY] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error loading dictation summary")
