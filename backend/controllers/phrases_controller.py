"""Difficulties panel controller.

A Trilha A1 clássica (exercício de voz por aula, banco de frases) foi removida
em favor do sistema "4 pontas". Este arquivo mantém só o painel de Dificuldades
da home, hoje alimentado exclusivamente pelas dificuldades de pronúncia do
chat de voz (ShadowModeAnalytic) — as fontes de voz/quiz da trilha clássica
saíram junto com ela.

Endpoints:
    GET  /api/user/difficulties  → dificuldades de pronúncia para o painel da home
"""
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.auth import get_current_user_id
from backend.database import get_db
from backend.db_models import ShadowModeAnalytic

router = APIRouter(tags=["phrases"])
logger = logging.getLogger(__name__)


@router.get("/api/user/difficulties")
async def get_user_difficulties(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    limit: int = 10,
):
    """Retorna dificuldades de pronúncia do usuário (chat de voz)."""
    try:
        uid = int(user_id)

        shadow_rows = (
            db.query(ShadowModeAnalytic)
            .filter(
                ShadowModeAnalytic.user_id == uid,
                (ShadowModeAnalytic.final_score < 70) | (ShadowModeAnalytic.auto_progressed == True),
            )
            .order_by(ShadowModeAnalytic.created_at.desc())
            .limit(max(1, limit))
            .all()
        )

        shadow_items = [
            {
                "source": "shadow",
                "phrase_id": None,
                "shadow_id": row.id,
                "phrase_en": row.expected_text,
                "phrase_pt": "",
                "phonetic": "",
                "warning_pt": ", ".join(row.pronunciation_errors or []),
                "lesson_id": None,
                "lesson_title": f"{row.conversation_topic or 'Chat de voz'} · {row.voice_mode or 'livre'}",
                "attempts": row.user_attempts,
                "wrong_count": 0 if (row.final_score or 0) >= 70 else 1,
                "skipped_count": 1 if row.skipped else 0,
                "last_wrong_words": row.pronunciation_errors or [],
                "last_attempted_at": row.created_at.isoformat() if row.created_at else None,
                "score": row.final_score,
            }
            for row in shadow_rows
        ]

        total_shadow = (
            db.query(ShadowModeAnalytic)
            .filter(
                ShadowModeAnalytic.user_id == uid,
                (ShadowModeAnalytic.final_score < 70) | (ShadowModeAnalytic.auto_progressed == True),
            )
            .count()
        )

        return {
            "success": True,
            "total_difficult": total_shadow,
            "total_voice": 0,
            "total_quiz": 0,
            "total_shadow": total_shadow,
            "phrases": shadow_items[:limit],
        }
    except Exception as exc:
        logger.error("[DIFFICULTIES] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error loading difficulties")
