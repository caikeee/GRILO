"""Difficulties Session Controller — meta semanal 7/7 + sessão focada.

Endpoints:
    GET  /api/difficulties/summary                  → pool atual + progresso semanal (X/7)
    POST /api/difficulties/session/start            → cria sessão e devolve fila intercalada
    POST /api/difficulties/session/item-result      → marca acerto/erro de UM item
    POST /api/difficulties/session/complete         → encerra sessão, retorna totais

Regra de meta semanal:
    - 7 quadradinhos por semana (segunda → domingo, timezone Brasília UTC-3).
    - Cada item dominado durante uma sessão (acerto na 1ª OU na revisita) incrementa
      ``User.weekly_difficulty_count`` em 1, cap em 7.
    - Reset acontece **lazy**: na primeira chamada de qualquer endpoint após virar a
      semana, ``_ensure_current_week`` detecta e zera o contador.
"""

from datetime import datetime, timedelta, timezone
import logging
from typing import Optional, List, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.auth import get_current_user_id
from backend.database import get_db
from backend.db_models import (
    DifficultySessionLog,
    LessonPhraseBank,
    LessonQuizError,
    PhraseError,
    ShadowModeAnalytic,
    User,
)
from backend.utils import award_xp

router = APIRouter(tags=["difficulties-session"])
logger = logging.getLogger(__name__)


# ============================================================
# Constantes
# ============================================================

WEEKLY_TARGET = 7
SESSION_CAP = 10                # máximo de itens por sessão
XP_PER_ITEM = 10
XP_WEEKLY_COMPLETE_BONUS = 50
BRT_OFFSET_HOURS = -3           # timezone fixo de Brasília (UTC-3)


# ============================================================
# Schemas
# ============================================================

ItemSource = Literal["voice", "quiz", "shadow"]


class _ItemResultBody(BaseModel):
    session_id: int
    source: ItemSource
    item_id: int                 # PhraseError.id, LessonQuizError.id ou ShadowModeAnalytic.id
    correct: bool
    first_try: bool = True       # False quando o item voltou pro fim da fila e foi reapresentado


class _CompleteBody(BaseModel):
    session_id: int


# ============================================================
# Helpers de semana (timezone Brasília fixo)
# ============================================================

def _now_brt() -> datetime:
    """Retorna o instante atual em Brasília (UTC-3), naive (pra casar com colunas
    DateTime que estão em utcnow naive no resto do projeto)."""
    return datetime.utcnow() + timedelta(hours=BRT_OFFSET_HOURS)


def _current_week_start(now_brt: Optional[datetime] = None) -> datetime:
    """Segunda-feira 00:00 da semana corrente em BRT."""
    now = now_brt or _now_brt()
    monday = now - timedelta(days=now.weekday())
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)


def _days_left_in_week(now_brt: Optional[datetime] = None) -> int:
    """Quantos dias restam até o reset (segunda-feira 00:00 da próxima semana)."""
    now = now_brt or _now_brt()
    next_monday = _current_week_start(now) + timedelta(days=7)
    diff = next_monday - now
    return max(0, diff.days + (1 if diff.seconds > 0 else 0))


def _ensure_current_week(user: User, db: Session) -> None:
    """Se a semana virou desde a última atualização do usuário, reseta o contador.
    Idempotente — pode ser chamado em todo endpoint sem custo extra."""
    current_start = _current_week_start()
    stored = user.weekly_difficulty_week_start
    if stored is None or stored < current_start:
        user.weekly_difficulty_count = 0
        user.weekly_difficulty_week_start = current_start
        user.weekly_difficulty_completed_at = None
        db.add(user)
        db.commit()


# ============================================================
# Helpers de pool — buscam itens "difíceis" das 3 fontes
# ============================================================

def _fetch_voice_items(db: Session, user_id: int, limit: int) -> list[dict]:
    """Erros de pronúncia (PhraseError com status='dificil')."""
    rows = (
        db.query(PhraseError, LessonPhraseBank)
        .join(LessonPhraseBank, PhraseError.phrase_id == LessonPhraseBank.id)
        .filter(PhraseError.user_id == user_id, PhraseError.status == "dificil")
        .order_by(PhraseError.attempts.desc(), PhraseError.last_attempted_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "source": "voice",
            "item_id": err.id,
            "phrase_en": phrase.phrase_en,
            "phrase_pt": phrase.phrase_pt or "",
            "hint": phrase.warning_pt or "",
            "lesson_id": phrase.lesson_id,
            "wrong_count": max(0, err.attempts - err.correct_sessions),
            "attempts": err.attempts,
        }
        for err, phrase in rows
    ]


def _fetch_quiz_items(db: Session, user_id: int, limit: int) -> list[dict]:
    """Erros de exercícios MC (LessonQuizError com wrong_count > 0)."""
    rows = (
        db.query(LessonQuizError)
        .filter(LessonQuizError.user_id == user_id, LessonQuizError.wrong_count > 0)
        .order_by(LessonQuizError.wrong_count.desc(), LessonQuizError.last_attempted_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "source": "quiz",
            "item_id": r.id,
            "question_text": r.question_text,
            "correct_answer": r.correct_answer,
            "wrong_answers": r.wrong_answers or [],
            "lesson_id": r.lesson_id,
            "wrong_count": r.wrong_count,
            "attempts": r.attempts,
        }
        for r in rows
    ]


def _fetch_shadow_items(db: Session, user_id: int, limit: int) -> list[dict]:
    """Frases mal pronunciadas no chat de voz (final_score < 70)."""
    rows = (
        db.query(ShadowModeAnalytic)
        .filter(
            ShadowModeAnalytic.user_id == user_id,
            ShadowModeAnalytic.final_score < 70,
        )
        .order_by(ShadowModeAnalytic.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "source": "shadow",
            "item_id": r.id,
            "phrase_en": r.expected_text,
            "phrase_pt": "",
            "hint": ", ".join(r.pronunciation_errors or []) if r.pronunciation_errors else "",
            "lesson_id": None,
            "wrong_count": 1,
            "attempts": r.user_attempts or 1,
        }
        for r in rows
    ]


def _interleave_pool(voice: list, quiz: list, shadow: list, cap: int) -> list[dict]:
    """Intercala 1 voz → 1 quiz → 1 shadow → repeat, parando no cap."""
    out: list[dict] = []
    buckets = [voice, quiz, shadow]
    while len(out) < cap and any(buckets):
        for b in buckets:
            if b and len(out) < cap:
                out.append(b.pop(0))
    return out


def _count_pool(db: Session, user_id: int) -> dict:
    voice = (
        db.query(PhraseError)
        .filter(PhraseError.user_id == user_id, PhraseError.status == "dificil")
        .count()
    )
    quiz = (
        db.query(LessonQuizError)
        .filter(LessonQuizError.user_id == user_id, LessonQuizError.wrong_count > 0)
        .count()
    )
    shadow = (
        db.query(ShadowModeAnalytic)
        .filter(
            ShadowModeAnalytic.user_id == user_id,
            ShadowModeAnalytic.final_score < 70,
        )
        .count()
    )
    return {"voice": voice, "quiz": quiz, "shadow": shadow, "total": voice + quiz + shadow}


# ============================================================
# GET /api/difficulties/summary
# ============================================================

@router.get("/api/difficulties/summary")
async def get_difficulties_summary(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Resumo para o painel da home: pool total + meta semanal."""
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        _ensure_current_week(user, db)

        pool = _count_pool(db, user.id)
        weekly_count = int(user.weekly_difficulty_count or 0)
        week_completed = weekly_count >= WEEKLY_TARGET

        return {
            "success": True,
            "pool": pool,
            "weekly_count": weekly_count,
            "weekly_target": WEEKLY_TARGET,
            "week_completed": week_completed,
            "days_left_in_week": _days_left_in_week(),
            "session_cap": SESSION_CAP,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("[DIF-SUMMARY] %s", exc)
        raise HTTPException(status_code=500, detail="Error loading difficulties summary")


# ============================================================
# POST /api/difficulties/session/start
# ============================================================

@router.post("/api/difficulties/session/start")
async def start_difficulties_session(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Cria uma sessão nova e devolve a fila intercalada de itens (até SESSION_CAP)."""
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        _ensure_current_week(user, db)

        # Se já completou a semana, bloqueia abrir sessão (modo desafiado).
        if (user.weekly_difficulty_count or 0) >= WEEKLY_TARGET:
            return {
                "success": False,
                "reason": "week_completed",
                "message": "Você já superou suas dificuldades dessa semana.",
            }

        voice = _fetch_voice_items(db, user.id, SESSION_CAP)
        quiz = _fetch_quiz_items(db, user.id, SESSION_CAP)
        shadow = _fetch_shadow_items(db, user.id, SESSION_CAP)
        items = _interleave_pool(voice, quiz, shadow, SESSION_CAP)

        if not items:
            return {
                "success": False,
                "reason": "empty_pool",
                "message": "Sem dificuldades para treinar agora.",
            }

        log = DifficultySessionLog(
            user_id=user.id,
            started_at=datetime.utcnow(),
            total_items=len(items),
            items_attempted=0,
            items_mastered_count=0,
            items_wrong_first_try=[],
            xp_earned=0,
            week_completed_in_this_session=False,
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        return {
            "success": True,
            "session_id": log.id,
            "items": items,
            "weekly_count": int(user.weekly_difficulty_count or 0),
            "weekly_target": WEEKLY_TARGET,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("[DIF-START] %s", exc)
        raise HTTPException(status_code=500, detail="Error starting session")


# ============================================================
# POST /api/difficulties/session/item-result
# ============================================================

@router.post("/api/difficulties/session/item-result")
async def post_item_result(
    body: _ItemResultBody,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Registra resultado de UM item. Se correct=True: marca item como dominado e
    incrementa quadradinho semanal. Se False: registra erro e o frontend deve enfileirar
    o item de novo (backend não controla a fila)."""
    try:
        uid = int(user_id)
        user = db.query(User).filter(User.id == uid).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        _ensure_current_week(user, db)

        log = (
            db.query(DifficultySessionLog)
            .filter(DifficultySessionLog.id == body.session_id, DifficultySessionLog.user_id == uid)
            .first()
        )
        if not log:
            raise HTTPException(status_code=404, detail="Session not found")
        if log.completed_at is not None:
            raise HTTPException(status_code=400, detail="Session already completed")

        week_just_completed = False
        item_was_mastered = False

        # ── Caso 1: errou ──────────────────────────────────────────
        if not body.correct:
            if body.first_try:
                wrong_ids = list(log.items_wrong_first_try or [])
                key = f"{body.source}:{body.item_id}"
                if key not in wrong_ids:
                    wrong_ids.append(key)
                log.items_wrong_first_try = wrong_ids
            # Marca tentativa adicional no item da fonte
            if body.source == "voice":
                err = db.query(PhraseError).filter(PhraseError.id == body.item_id).first()
                if err:
                    err.attempts = (err.attempts or 0) + 1
                    err.last_attempted_at = datetime.utcnow()
            elif body.source == "quiz":
                row = db.query(LessonQuizError).filter(LessonQuizError.id == body.item_id).first()
                if row:
                    row.attempts = (row.attempts or 0) + 1
                    row.last_attempted_at = datetime.utcnow()
            db.commit()
            return {
                "success": True,
                "correct": False,
                "weekly_count": int(user.weekly_difficulty_count or 0),
                "weekly_target": WEEKLY_TARGET,
                "week_just_completed": False,
            }

        # ── Caso 2: acertou → marca como dominado + pinta quadradinho ──────
        if body.source == "voice":
            err = db.query(PhraseError).filter(PhraseError.id == body.item_id).first()
            if err and err.user_id == uid:
                err.status = "dominada"
                err.correct_sessions = (err.correct_sessions or 0) + 1
                err.attempts = (err.attempts or 0) + 1
                err.last_attempted_at = datetime.utcnow()
                item_was_mastered = True
        elif body.source == "quiz":
            row = db.query(LessonQuizError).filter(LessonQuizError.id == body.item_id).first()
            if row and row.user_id == uid:
                row.wrong_count = max(0, (row.wrong_count or 0) - 1)
                row.attempts = (row.attempts or 0) + 1
                row.last_attempted_at = datetime.utcnow()
                item_was_mastered = True
        elif body.source == "shadow":
            row = db.query(ShadowModeAnalytic).filter(ShadowModeAnalytic.id == body.item_id).first()
            if row and row.user_id == uid:
                # Considera "dominada" subindo final_score acima do threshold.
                row.final_score = max(int(row.final_score or 0), 80)
                item_was_mastered = True

        if item_was_mastered:
            log.items_attempted = (log.items_attempted or 0) + 1
            log.items_mastered_count = (log.items_mastered_count or 0) + 1

            # Incrementa quadradinho semanal (cap em WEEKLY_TARGET)
            current = int(user.weekly_difficulty_count or 0)
            if current < WEEKLY_TARGET:
                user.weekly_difficulty_count = current + 1
                if user.weekly_difficulty_count >= WEEKLY_TARGET:
                    user.weekly_difficulty_completed_at = datetime.utcnow()
                    log.week_completed_in_this_session = True
                    week_just_completed = True

        db.commit()

        return {
            "success": True,
            "correct": True,
            "item_was_mastered": item_was_mastered,
            "weekly_count": int(user.weekly_difficulty_count or 0),
            "weekly_target": WEEKLY_TARGET,
            "week_just_completed": week_just_completed,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("[DIF-ITEM] %s", exc)
        db.rollback()
        raise HTTPException(status_code=500, detail="Error recording item result")


# ============================================================
# POST /api/difficulties/session/complete
# ============================================================

@router.post("/api/difficulties/session/complete")
async def complete_difficulties_session(
    body: _CompleteBody,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Fecha a sessão: grava completed_at, calcula XP e devolve totais."""
    try:
        uid = int(user_id)
        user = db.query(User).filter(User.id == uid).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        _ensure_current_week(user, db)

        log = (
            db.query(DifficultySessionLog)
            .filter(DifficultySessionLog.id == body.session_id, DifficultySessionLog.user_id == uid)
            .first()
        )
        if not log:
            raise HTTPException(status_code=404, detail="Session not found")
        if log.completed_at is not None:
            return {
                "success": True,
                "already_completed": True,
                "xp_earned": log.xp_earned,
                "items_mastered": log.items_mastered_count,
            }

        mastered = int(log.items_mastered_count or 0)
        xp = mastered * XP_PER_ITEM
        if log.week_completed_in_this_session:
            xp += XP_WEEKLY_COMPLETE_BONUS

        log.completed_at = datetime.utcnow()
        log.xp_earned = xp

        if xp > 0:
            award_xp(db, uid, xp, source="difficulty_session")

        db.commit()

        return {
            "success": True,
            "session_id": log.id,
            "items_mastered": mastered,
            "xp_earned": xp,
            "weekly_count": int(user.weekly_difficulty_count or 0),
            "weekly_target": WEEKLY_TARGET,
            "week_completed": (user.weekly_difficulty_count or 0) >= WEEKLY_TARGET,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("[DIF-COMPLETE] %s", exc)
        db.rollback()
        raise HTTPException(status_code=500, detail="Error completing session")
