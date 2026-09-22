"""Controller do sistema de lições "4 pontas" (frontend/assets/js/lessons-4p-*).

Persiste o escopo (palavras + frases) de cada aula e por qual das 4 pontas
cada item já passou — ver/ouvir/escrever/falar. Alimenta o painel CEFR da home
(via /api/user/stats, que soma estes itens ao vocabulário e às frases).

Fica separado de WordProfile/PhraseError de propósito: são fontes com regras
diferentes (chat de voz vs. aulas). Ver LessonScopeItem em db_models.py.

Endpoints:
    POST /api/scope4p/lessons/{slug}/result  → upsert do escopo da aula concluída
    GET  /api/scope4p/summary                 → agregados p/ debug e integrações
"""
import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.auth import get_current_user_id
from backend.database import get_db
from backend.db_models import LessonScopeItem, LessonScopeCompletion
from backend.utils import mark_activity, award_xp, track_metric_event

router = APIRouter(tags=["scope4p"])
logger = logging.getLogger(__name__)


# ── Payload ──────────────────────────────────────────────────────────────
class _ScopeItemBody(BaseModel):
    item_type: str                      # "word" | "phrase"
    en: str
    pt: Optional[str] = None
    written_ok: bool = False
    heard_ok: bool = False
    spoken_ok: bool = False


class _ScopeResultBody(BaseModel):
    lesson_group: Optional[str] = None
    completed: bool = True              # chegou ao recap
    items: List[_ScopeItemBody]

    # Marcador de RETOMADA — enviado quando completed=False (aluno fechou ou
    # caiu no meio da aula). Guarda onde ele parou para que a retomada
    # sobreviva a troca de máquina / limpeza de cache.
    resume_step: Optional[int] = None   # índice do passo no roteiro
    resume_total: Optional[int] = None  # total de passos quando salvou
    resume_fp: Optional[str] = None     # assinatura do roteiro (invalida se a aula mudar)


def _derive_status(written: bool, heard: bool, spoken: bool) -> str:
    if written and heard and spoken:
        return "dominada"
    if written:
        return "aprendida"
    return "nova"


@router.post("/api/scope4p/lessons/{lesson_slug}/result")
async def submit_scope_result(
    lesson_slug: str,
    body: _ScopeResultBody,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Upsert do escopo de uma aula 4 pontas concluída.

    O cliente é a fonte da verdade das pontas (rastreia ver/ouvir/escrever/falar
    durante a aula). O merge é MONOTÔNICO: uma ponta já marcada como True nunca
    volta a False — proteção contra reenvio de sessão incompleta.
    """
    try:
        uid = int(user_id)
        now = datetime.utcnow()

        existing = {
            it.item_en: it
            for it in db.query(LessonScopeItem)
            .filter(
                LessonScopeItem.user_id == uid,
                LessonScopeItem.lesson_slug == lesson_slug,
            )
            .all()
        }

        newly_learned = 0
        newly_dominated = 0

        for item in body.items:
            if item.item_type not in ("word", "phrase"):
                continue
            row = existing.get(item.en)
            if row is None:
                row = LessonScopeItem(
                    user_id=uid,
                    lesson_slug=lesson_slug,
                    lesson_group=body.lesson_group,
                    item_type=item.item_type,
                    item_en=item.en,
                    item_pt=item.pt,
                )
                db.add(row)
                existing[item.en] = row

            was_learned = bool(row.written_ok)
            was_dominated = row.status == "dominada"

            # merge monotônico das pontas
            row.written_ok = bool(row.written_ok) or bool(item.written_ok)
            row.heard_ok = bool(row.heard_ok) or bool(item.heard_ok)
            row.spoken_ok = bool(row.spoken_ok) or bool(item.spoken_ok)
            row.item_pt = item.pt or row.item_pt
            row.lesson_group = body.lesson_group or row.lesson_group

            new_status = _derive_status(row.written_ok, row.heard_ok, row.spoken_ok)
            row.status = new_status
            row.updated_at = now

            if new_status in ("aprendida", "dominada") and not row.first_learned_at:
                row.first_learned_at = now
            if new_status == "dominada" and not row.dominated_at:
                row.dominated_at = now

            if not was_learned and row.written_ok:
                newly_learned += 1
            if not was_dominated and new_status == "dominada":
                newly_dominated += 1

        # Estado da aula: conclusão (gate A1→A2) e/ou marcador de retomada.
        # A mesma linha serve aos dois: completed_at nulo = começada e não
        # terminada. Um envio parcial NUNCA apaga uma conclusão já registrada
        # (rever uma aula concluída não a "desconclui").
        just_completed = False
        comp = (
            db.query(LessonScopeCompletion)
            .filter(
                LessonScopeCompletion.user_id == uid,
                LessonScopeCompletion.lesson_slug == lesson_slug,
            )
            .first()
        )
        if comp is None:
            comp = LessonScopeCompletion(
                user_id=uid,
                lesson_slug=lesson_slug,
                lesson_group=body.lesson_group,
            )
            db.add(comp)

        comp.lesson_group = body.lesson_group or comp.lesson_group
        comp.updated_at = now

        if body.completed:
            if comp.completed_at is None:
                comp.completed_at = now
                just_completed = True
            # Concluída: não há mais o que retomar.
            comp.resume_step = None
            comp.resume_total = None
            comp.resume_fp = None
            comp.resume_at = None
        elif comp.completed_at is None:
            # Parcial numa aula ainda não concluída: atualiza o marcador.
            # resume_step nulo/0 = voltou para a capa: limpa o marcador.
            if body.resume_step:
                comp.resume_step = body.resume_step
                comp.resume_total = body.resume_total
                comp.resume_fp = body.resume_fp
                comp.resume_at = now
            else:
                comp.resume_step = None
                comp.resume_total = None
                comp.resume_fp = None
                comp.resume_at = None

        db.commit()

        # XP: 3 por item novo aprendido + 5 por item novo dominado + 10 se concluiu a aula
        xp_amount = (3 * newly_learned) + (5 * newly_dominated) + (10 if just_completed else 0)
        xp_result = {"xp_earned": 0, "new_total": 0, "level_up": False, "new_level": 1}
        if xp_amount > 0:
            xp_result = award_xp(db, uid, xp_amount, source="scope_4p_lesson")

        mark_activity(db, uid, "lesson")
        track_metric_event(
            db, uid, "lesson", "scope4p_lesson_result",
            details={
                "lesson_slug": lesson_slug,
                "lesson_group": body.lesson_group,
                "items": len(body.items),
                "newly_learned": newly_learned,
                "newly_dominated": newly_dominated,
                "just_completed": just_completed,
                "partial": not body.completed,
                "resume_step": body.resume_step,
            },
        )

        return {
            "success": True,
            "lesson_slug": lesson_slug,
            "newly_learned": newly_learned,
            "newly_dominated": newly_dominated,
            "just_completed": just_completed,
            "xp_earned": xp_result.get("xp_earned", 0),
            "user_total_xp": xp_result.get("new_total", 0),
            "level_up": xp_result.get("level_up", False),
        }
    except Exception as exc:
        logger.error("[SCOPE4P-RESULT] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error saving scope result")


@router.get("/api/scope4p/progress")
async def get_scope_progress(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Progresso detalhado por aula — o que o cliente usa para se HIDRATAR.

    É isto que faz o aluno reencontrar seu progresso em outro navegador ou
    depois de limpar o cache: devolve, por aula, o estado das 4 pontas de
    cada item, a conclusão e o marcador de retomada (onde ele parou).
    """
    try:
        uid = int(user_id)

        by_slug: dict = {}

        for it in (
            db.query(LessonScopeItem)
            .filter(LessonScopeItem.user_id == uid)
            .all()
        ):
            entry = by_slug.setdefault(it.lesson_slug, {
                "lesson_slug": it.lesson_slug,
                "lesson_group": it.lesson_group,
                "completed_at": None,
                "resume_step": None,
                "resume_total": None,
                "resume_fp": None,
                "resume_at": None,
                "items": [],
            })
            entry["items"].append({
                "en": it.item_en,
                "pt": it.item_pt,
                "item_type": it.item_type,
                "written_ok": bool(it.written_ok),
                "heard_ok": bool(it.heard_ok),
                "spoken_ok": bool(it.spoken_ok),
                "status": it.status,
            })

        for comp in (
            db.query(LessonScopeCompletion)
            .filter(LessonScopeCompletion.user_id == uid)
            .all()
        ):
            entry = by_slug.setdefault(comp.lesson_slug, {
                "lesson_slug": comp.lesson_slug,
                "lesson_group": comp.lesson_group,
                "items": [],
            })
            entry["completed_at"] = comp.completed_at.isoformat() if comp.completed_at else None
            entry["resume_step"] = comp.resume_step
            entry["resume_total"] = comp.resume_total
            entry["resume_fp"] = comp.resume_fp
            entry["resume_at"] = comp.resume_at.isoformat() if comp.resume_at else None

        return {"success": True, "lessons": list(by_slug.values())}
    except Exception as exc:
        logger.error("[SCOPE4P-PROGRESS] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error loading scope progress")


@router.get("/api/scope4p/summary")
async def get_scope_summary(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Agregados do sistema 4 pontas para o usuário (debug / integrações)."""
    try:
        uid = int(user_id)
        items = (
            db.query(LessonScopeItem)
            .filter(LessonScopeItem.user_id == uid)
            .all()
        )
        completions = (
            db.query(LessonScopeCompletion.lesson_slug)
            .filter(
                LessonScopeCompletion.user_id == uid,
                # a tabela também guarda aulas apenas COMEÇADAS (retomada)
                LessonScopeCompletion.completed_at.isnot(None),
            )
            .all()
        )
        words_learned = sum(1 for i in items if i.item_type == "word" and i.status in ("aprendida", "dominada"))
        words_dominated = sum(1 for i in items if i.item_type == "word" and i.status == "dominada")
        phrases_learned = sum(1 for i in items if i.item_type == "phrase" and i.status in ("aprendida", "dominada"))
        phrases_dominated = sum(1 for i in items if i.item_type == "phrase" and i.status == "dominada")

        return {
            "success": True,
            "lessons_completed": len(completions),
            "completed_slugs": [c[0] for c in completions],
            "words_learned": words_learned,
            "words_dominated": words_dominated,
            "phrases_learned": phrases_learned,
            "phrases_dominated": phrases_dominated,
        }
    except Exception as exc:
        logger.error("[SCOPE4P-SUMMARY] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error loading scope summary")
