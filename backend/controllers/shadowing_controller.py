"""Controller do Laboratório de Shadowing (frontend/assets/js/shadowing.js).

Persiste o resultado de sessões RANQUEADAS de shadowing e credita DUAS
fontes que a home já lê:
  • palavras faladas certo → MESMO pool de vocabulário do chat de voz
    (WordProfile) — mesma regra de domínio (>=85% acurácia, >=5 usos,
    latch monotônico).
  • frases faladas dentro do limiar de aceitação → ShadowLabPhrase, que
    soma em phrases_mastered_total (modal "Meu Progresso" da home) junto
    com scope4p_phrases_dominated. `all_correct` no payload não exige 100%
    das palavras — o frontend já aplica o mesmo threshold de conclusão da
    faixa (minScoreToUnlock) por frase antes de mandar; o reconhecimento
    ainda está em ajuste, então exigir perfeição descartaria acertos reais.
    Uma frase aprovada numa sessão Ranqueada já vira "dominada" (sem
    exigir repetição — cada faixa hoje tem um único texto fixo, então
    "repetir em outra sessão" seria reler a mesma frase, não uma prova
    de domínio mais forte que a primeira aprovação).

Sessões CASUAL (sem fone confirmado) não chegam aqui — não têm garantia
de qualidade de áudio suficiente pra virar prova de pronúncia.

Endpoints:
    POST /api/shadowing/tracks/{slug}/result  → registra sessão ranqueada,
                                                 credita WordProfile +
                                                 ShadowLabPhrase, XP
    GET  /api/shadowing/summary                → agregados p/ debug
"""
import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import and_
from sqlalchemy.orm import Session

from backend.auth import get_current_user_id
from backend.database import get_db
from backend.db_models import WordProfile, ShadowLabResult, ShadowLabPhrase
from backend.utils import mark_activity, award_xp, track_metric_event

router = APIRouter(tags=["shadowing"])
logger = logging.getLogger(__name__)

# Sessões aprovadas necessárias pra uma frase virar "dominada". 1 por ora —
# cada faixa tem um único texto fixo hoje, então exigir repetição não prova
# domínio adicional (ver nota no topo do arquivo). Subir isso exige antes
# ter variação real de conteúdo por faixa.
PHRASE_SESSIONS_TO_MASTER = 1


# ── Payload ──────────────────────────────────────────────────────────────
class _ShadowWordBody(BaseModel):
    word: str
    correct: bool


class _ShadowSentenceBody(BaseModel):
    index: int
    en: str
    all_correct: bool


class _ShadowResultBody(BaseModel):
    score: int
    words: List[_ShadowWordBody]
    sentences: List[_ShadowSentenceBody] = []
    unlocked_next: bool = False


@router.post("/api/shadowing/tracks/{track_slug}/result")
async def submit_shadow_result(
    track_slug: str,
    body: _ShadowResultBody,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Registra uma sessão Ranqueada de shadowing e credita o vocabulário.

    Só palavras com `correct=True` contam como uso correto; palavras que
    ficaram pendentes/erradas no alinhador ao vivo são ignoradas aqui —
    silêncio não é penalidade, mas também não é prova de acerto.
    """
    try:
        uid = int(user_id)
        now = datetime.utcnow()

        # dedup de palavras dentro do mesmo payload (o alinhador pode repetir
        # a mesma palavra em frases diferentes da faixa)
        word_stats: dict[str, dict] = {}
        for w in body.words:
            token = (w.word or "").strip().lower()
            if not token or len(token) < 2:
                continue
            stats = word_stats.setdefault(token, {"uses": 0, "correct": 0})
            stats["uses"] += 1
            if w.correct:
                stats["correct"] += 1

        existing_profiles: dict[str, WordProfile] = {}
        if word_stats:
            existing_profiles = {
                p.word: p
                for p in db.query(WordProfile).filter(
                    and_(WordProfile.user_id == uid, WordProfile.word.in_(word_stats.keys()))
                ).all()
            }

        newly_mastered = 0
        for word, stats in word_stats.items():
            if word in existing_profiles:
                prof = existing_profiles[word]
                was_mastered_before = prof.mastered
                prof.total_uses += stats["uses"]
                prof.correct_uses += stats["correct"]
                prof.last_seen_at = now
            else:
                was_mastered_before = False
                prof = WordProfile(
                    user_id=uid,
                    word=word,
                    total_uses=stats["uses"],
                    correct_uses=stats["correct"],
                    first_seen_at=now,
                    last_seen_at=now,
                )
                db.add(prof)
                existing_profiles[word] = prof

            acc = prof.correct_uses / prof.total_uses if prof.total_uses else 1.0
            reached_mastery = acc >= 0.85 and prof.total_uses >= 5
            # latch: mesma regra do chat de voz — uma vez dominada, não reverte
            if reached_mastery and not was_mastered_before:
                newly_mastered += 1
            prof.mastered = was_mastered_before or reached_mastery

        # ── Frases: só as 100% certas nesta sessão avançam o contador ──
        newly_dominated_phrases = 0
        if body.sentences:
            existing_phrases = {
                p.sentence_index: p
                for p in db.query(ShadowLabPhrase).filter(
                    ShadowLabPhrase.user_id == uid,
                    ShadowLabPhrase.track_slug == track_slug,
                ).all()
            }
            for sent in body.sentences:
                if not sent.all_correct:
                    continue
                row = existing_phrases.get(sent.index)
                if row is None:
                    row = ShadowLabPhrase(
                        user_id=uid,
                        track_slug=track_slug,
                        sentence_index=sent.index,
                        sentence_en=sent.en,
                        correct_sessions=0,
                        dominated=False,
                    )
                    db.add(row)
                    existing_phrases[sent.index] = row

                was_dominated = row.dominated
                # só conta 1x por sessão (mesmo índice não dobra no mesmo payload)
                row.correct_sessions += 1
                row.last_correct_at = now
                row.dominated = was_dominated or (row.correct_sessions >= PHRASE_SESSIONS_TO_MASTER)
                if row.dominated and not was_dominated:
                    newly_dominated_phrases += 1

        db.add(ShadowLabResult(
            user_id=uid,
            track_slug=track_slug,
            score=body.score,
            words_correct=sum(s["correct"] for s in word_stats.values()),
            words_total=sum(s["uses"] for s in word_stats.values()),
            created_at=now,
        ))

        db.commit()

        # XP: 5/palavra nova dominada + 8/frase nova dominada + 15 se destravou a próxima faixa
        xp_amount = (5 * newly_mastered) + (8 * newly_dominated_phrases) + (15 if body.unlocked_next else 0)
        xp_result = {"xp_earned": 0, "new_total": 0, "level_up": False, "new_level": 1}
        if xp_amount > 0:
            xp_result = award_xp(db, uid, xp_amount, source="shadowing_lab")

        mark_activity(db, uid, "shadowing")
        track_metric_event(
            db, uid, "shadowing", "shadow_track_result",
            details={
                "track_slug": track_slug,
                "score": body.score,
                "words": len(word_stats),
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
        logger.error("[SHADOWING-RESULT] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error saving shadowing result")


@router.get("/api/shadowing/summary")
async def get_shadow_summary(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Agregados do Laboratório de Shadowing para o usuário (debug / integrações)."""
    try:
        uid = int(user_id)
        results = (
            db.query(ShadowLabResult)
            .filter(ShadowLabResult.user_id == uid)
            .all()
        )
        tracks_done = {r.track_slug for r in results}
        phrases_dominated = (
            db.query(ShadowLabPhrase)
            .filter(ShadowLabPhrase.user_id == uid, ShadowLabPhrase.dominated.is_(True))
            .count()
        )
        return {
            "success": True,
            "tracks_completed": len(tracks_done),
            "completed_slugs": sorted(tracks_done),
            "sessions_logged": len(results),
            "phrases_dominated": phrases_dominated,
        }
    except Exception as exc:
        logger.error("[SHADOWING-SUMMARY] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error loading shadowing summary")
