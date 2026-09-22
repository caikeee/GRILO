"""User stats & activity controller.

A Trilha A1 clássica (grid de 27 aulas, exercícios de múltipla escolha, quiz)
foi removida em favor do sistema "4 pontas" (ver backend/controllers/scope_4p_controller.py).
Este arquivo mantém só os endpoints genéricos que alimentam o painel da home
e não são exclusivos de nenhum sistema de lições.
"""
from datetime import datetime
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.auth import get_current_user_id
from backend.database import get_db
from backend.db_models import (
    Badge,
    Conversation,
    LessonScopeItem,
    LessonScopeCompletion,
    ShadowLabPhrase,
    ShadowLabResult,
    ShadowModeAnalytic,
    User,
    UserActivity,
    UserBadge,
    UserProgress,
    WordProfile,
)

router = APIRouter(tags=["lessons"])
logger = logging.getLogger(__name__)


@router.get("/api/user/stats")
async def get_user_stats(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return aggregated learning statistics for the authenticated user."""
    try:
        from collections import Counter
        from sqlalchemy import func
        from datetime import date, timedelta

        uid = int(user_id)

        # User stats
        user = db.query(User).filter(User.id == uid).first()
        total_xp = user.xp if user else 0
        level = user.level if user else 1
        streak = user.streak if user else 0

        # Conversation stats
        up = db.query(UserProgress).filter(UserProgress.user_id == uid).first()
        total_conversations = up.total_conversations if up else 0
        voice_sessions = list(up.voice_sessions or []) if up and up.voice_sessions else []

        writing_rows = (
            db.query(Conversation.writing_accuracy_score)
            .filter(
                Conversation.user_id == uid,
                Conversation.writing_accuracy_score.isnot(None),
            )
            .all()
        )
        scores = [row[0] for row in writing_rows if row[0] is not None]
        writing_accuracy_avg = round(sum(scores) / len(scores), 1) if scores else None

        grammar_rows = (
            db.query(Conversation.grammar_focus_area)
            .filter(
                Conversation.user_id == uid,
                Conversation.grammar_focus_area.isnot(None),
            )
            .all()
        )
        grammar_areas = [row[0] for row in grammar_rows if row[0]]
        top_grammar_area = Counter(grammar_areas).most_common(1)[0][0] if grammar_areas else None

        # Text messages sent by user (only user-role rows in Conversation)
        text_messages_sent = (
            db.query(func.count(Conversation.id))
            .filter(Conversation.user_id == uid, Conversation.message_role == "user")
            .scalar()
        ) or 0

        # Voice usage — accumulated seconds stored in UserProgress
        voice_minutes = round((up.voice_seconds or 0) / 60.0, 1) if up else 0.0

        # Voice quality and session insights
        voice_sessions_count = len(voice_sessions)
        quality_values = [int(s.get("quality", 0)) for s in voice_sessions if s.get("quality") is not None]
        last_voice_quality = quality_values[-1] if quality_values else None
        avg_voice_quality = round(sum(quality_values) / len(quality_values), 1) if quality_values else None
        best_voice_quality = max(quality_values) if quality_values else None
        total_voice_exchanges = sum(int(s.get("exchanges", 0) or 0) for s in voice_sessions)
        total_voice_corrections = sum(int(s.get("corrections_count", 0) or 0) for s in voice_sessions)

        # Challenge and consistency (last 7 days voice activity)
        today = date.today()
        week_days = [(today - timedelta(days=i)).isoformat() for i in range(6, -1, -1)]
        activity_rows = (
            db.query(UserActivity)
            .filter(
                UserActivity.user_id == uid,
                UserActivity.activity_type == "voice",
                UserActivity.date >= week_days[0],
                UserActivity.date <= week_days[-1],
            )
            .all()
        )
        voice_day_set = {r.date for r in activity_rows if (r.count or 0) > 0}
        challenge_days_completed = sum(1 for d in week_days if d in voice_day_set)
        challenge_completion_percent = round((challenge_days_completed / 7) * 100)

        # Voice mode progression gate (voice-first roadmap)
        unlocked_modes = ["guided"]
        if challenge_days_completed >= 2 or voice_sessions_count >= 4:
            unlocked_modes.append("free")
        if challenge_days_completed >= 4 or voice_sessions_count >= 8:
            unlocked_modes.append("shadow")
        if challenge_days_completed >= 6 or voice_sessions_count >= 12:
            unlocked_modes.append("dictation")

        all_modes = ["guided", "free", "shadow", "dictation"]
        next_mode_unlock = None
        for mode in all_modes:
            if mode not in unlocked_modes:
                if mode == "free":
                    next_mode_unlock = {
                        "mode": "free",
                        "requires": "2 dias ativos no desafio ou 4 sessoes de voz"
                    }
                elif mode == "shadow":
                    next_mode_unlock = {
                        "mode": "shadow",
                        "requires": "4 dias ativos no desafio ou 8 sessoes de voz"
                    }
                else:
                    next_mode_unlock = {
                        "mode": "dictation",
                        "requires": "6 dias ativos no desafio ou 12 sessoes de voz"
                    }
                break

        # ── ENRICHED FIELDS for the redesigned learning panel ───────────

        # Profile snippets (for personalized greeting)
        learning_why = (user.learning_why or "").strip() if user else ""
        daily_interests = (user.daily_interests or "").strip() if user else ""
        username = user.username if user else ""

        # Voice quality sparkline — last 14 sessions, ascending
        sparkline_values = quality_values[-14:] if quality_values else []

        # Vocabulary mastered (lifetime) + delta vs. 7 days ago
        from datetime import datetime as _dt
        seven_days_ago = _dt.utcnow() - timedelta(days=7)
        vocab_mastered_total = (
            db.query(func.count(WordProfile.id))
            .filter(WordProfile.user_id == uid, WordProfile.mastered.is_(True))
            .scalar()
        ) or 0
        vocab_mastered_week = (
            db.query(func.count(WordProfile.id))
            .filter(
                WordProfile.user_id == uid,
                WordProfile.mastered.is_(True),
                WordProfile.last_seen_at >= seven_days_ago,
            )
            .scalar()
        ) or 0
        phrases_mastered_total = 0  # frases dominadas — hoje só o sistema 4 pontas alimenta (abaixo)

        # ── Sistema 4 pontas (lessons-4p) ──────────────────────────────
        # Palavra "aprendida" (escreveu) conta no vocabulário; frase "dominada"
        # (4 pontas) conta nas frases — regra de produto (2026-07-08).
        scope4p_words_learned = (
            db.query(func.count(LessonScopeItem.id))
            .filter(
                LessonScopeItem.user_id == uid,
                LessonScopeItem.item_type == "word",
                LessonScopeItem.status.in_(["aprendida", "dominada"]),
            )
            .scalar()
        ) or 0
        scope4p_words_dominated = (
            db.query(func.count(LessonScopeItem.id))
            .filter(
                LessonScopeItem.user_id == uid,
                LessonScopeItem.item_type == "word",
                LessonScopeItem.status == "dominada",
            )
            .scalar()
        ) or 0
        scope4p_phrases_dominated = (
            db.query(func.count(LessonScopeItem.id))
            .filter(
                LessonScopeItem.user_id == uid,
                LessonScopeItem.item_type == "phrase",
                LessonScopeItem.status == "dominada",
            )
            .scalar()
        ) or 0
        scope4p_items_dominated = scope4p_words_dominated + scope4p_phrases_dominated
        # completed_at IS NOT NULL: a tabela também guarda aulas apenas
        # COMEÇADAS (marcador de retomada), que não contam para o gate.
        scope4p_lessons_completed = (
            db.query(func.count(LessonScopeCompletion.id))
            .filter(
                LessonScopeCompletion.user_id == uid,
                LessonScopeCompletion.completed_at.isnot(None),
            )
            .scalar()
        ) or 0
        # Bloco A1 = 20 aulas (gate de promoção A1→A2)
        scope4p_block_total = 20

        # Laboratório de Shadowing — frases inteiras dominadas (>=2 sessões
        # Ranqueadas distintas 100% certas). Soma com scope4p, mesmo campo.
        shadow_phrases_dominated = (
            db.query(func.count(ShadowLabPhrase.id))
            .filter(ShadowLabPhrase.user_id == uid, ShadowLabPhrase.dominated.is_(True))
            .scalar()
        ) or 0
        # Sessões Ranqueadas de shadowing — 1 registro por sessão (ShadowLabResult).
        # Gate "Meu Progresso": 10 sessões concluídas.
        shadowing_sessions_completed = (
            db.query(func.count(ShadowLabResult.id))
            .filter(ShadowLabResult.user_id == uid)
            .scalar()
        ) or 0

        # Soma nos gates que a home já mostra
        vocab_mastered_total += scope4p_words_learned
        phrases_mastered_total += scope4p_phrases_dominated + shadow_phrases_dominated
        vocab_total_seen = (
            db.query(func.count(WordProfile.id))
            .filter(WordProfile.user_id == uid)
            .scalar()
        ) or 0
        vocab_total_seen_week = (
            db.query(func.count(WordProfile.id))
            .filter(
                WordProfile.user_id == uid,
                WordProfile.first_seen_at >= seven_days_ago,
            )
            .scalar()
        ) or 0

        vocab_mastered_rows = (
            db.query(WordProfile.word, WordProfile.total_uses, WordProfile.correct_uses, WordProfile.last_seen_at, WordProfile.first_seen_at)
            .filter(WordProfile.user_id == uid, WordProfile.mastered.is_(True))
            .order_by(WordProfile.last_seen_at.desc().nullslast())
            .limit(200)
            .all()
        )
        vocab_mastered_list = [
            {
                "word": r[0],
                "uses": int(r[1] or 0),
                "accuracy": round((float(r[2] or 0) / float(r[1])) * 100) if r[1] else 0,
                "last_seen": r[3].isoformat() if r[3] else None,
                "first_seen": r[4].isoformat() if r[4] else None,
            }
            for r in vocab_mastered_rows
        ]

        # CEFR progression — modelo A0 → A1 → … por VALIDAÇÃO (ver [[cefr-level-system]]).
        #
        # O nível NÃO vem de user.level (XP de gamificação). Regras do modelo:
        #   • Todo aluno começa em A0 ("Início") — ainda NÃO validou o A1.
        #   • A1 é a primeira conquista CERTIFICÁVEL: só é atingido quando o aluno
        #     cumpre o QUADRO DE REQUISITOS do A1 (o mesmo gate do certificado).
        #   • Os requisitos incluem a régua de vocabulário do A1 (≈ 500 palavras,
        #     ancorada no Cambridge English Profile), além do bloco de aulas.
        #
        # Requisitos do A1 (gate único, usado tanto pelo rótulo quanto pelo cert):
        A1_REQ_VOCAB = 500        # palavras dominadas (régua Cambridge p/ A1)
        A1_REQ_PHRASES = 50       # frases dominadas
        A1_REQ_LESSONS = scope4p_block_total  # 20 aulas do bloco A1
        a1_validated = (
            vocab_mastered_total >= A1_REQ_VOCAB
            and phrases_mastered_total >= A1_REQ_PHRASES
            and scope4p_lessons_completed >= A1_REQ_LESSONS
        )
        # Índice na escada: 0=A0, 1=A1, … (só A0→A1 tem gate real hoje; A2+ pendente
        # até esses blocos e seus requisitos existirem).
        cefr_ladder = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"]
        effective_idx = 1 if a1_validated else 0
        cefr_current = cefr_ladder[effective_idx]
        cefr_next = cefr_ladder[min(effective_idx + 1, len(cefr_ladder) - 1)]
        # Rough progression heuristic: blend of accuracy + voice quality + aulas 4p concluídas
        progression_signal = 0.0
        if avg_voice_quality:
            progression_signal += min(avg_voice_quality, 100) * 0.3    # 0..30
        progression_signal += min(scope4p_lessons_completed * 2, 20)    # 0..20
        cefr_progress_percent = max(0, min(100, round(progression_signal)))

        # Top phoneme issue (from shadow mode analytics)
        from collections import Counter as _Counter
        phoneme_rows = (
            db.query(ShadowModeAnalytic.pronunciation_errors)
            .filter(
                ShadowModeAnalytic.user_id == uid,
                ShadowModeAnalytic.pronunciation_errors.isnot(None),
                ShadowModeAnalytic.created_at >= _dt.utcnow() - timedelta(days=30),
            )
            .all()
        )
        phoneme_counter: _Counter = _Counter()
        for (errs,) in phoneme_rows:
            if isinstance(errs, list):
                for e in errs:
                    if isinstance(e, str) and e.strip():
                        phoneme_counter[e.strip()] += 1
                    elif isinstance(e, dict):
                        key = e.get("phoneme") or e.get("symbol") or e.get("word")
                        if key:
                            phoneme_counter[str(key)] += 1
        top_phoneme = None
        if phoneme_counter:
            sym, occ = phoneme_counter.most_common(1)[0]
            top_phoneme = {"symbol": sym, "occurrences": occ}

        # Next badge — closest unearned badge by xp_threshold
        earned_badge_ids = {
            b.badge_id for b in db.query(UserBadge).filter(UserBadge.user_id == uid).all()
        }
        all_badges = db.query(Badge).order_by(Badge.xp_threshold.asc()).all()
        next_badge = None
        earned_count = 0
        for b in all_badges:
            if b.id in earned_badge_ids:
                earned_count += 1
                continue
            if next_badge is None and b.xp_threshold and b.xp_threshold > total_xp:
                progress_pct = round((total_xp / b.xp_threshold) * 100) if b.xp_threshold else 0
                next_badge = {
                    "name": b.name,
                    "icon": b.icon or "🎖",
                    "description": b.description or "",
                    "xp_required": b.xp_threshold,
                    "xp_current": total_xp,
                    "progress_percent": max(0, min(100, progress_pct)),
                }

        # Week-over-week deltas
        prev_week_start = _dt.utcnow() - timedelta(days=14)
        prev_week_end = _dt.utcnow() - timedelta(days=7)
        prev_week_voice_count = (
            db.query(func.count(UserActivity.id))
            .filter(
                UserActivity.user_id == uid,
                UserActivity.activity_type == "voice",
                UserActivity.date >= prev_week_start.date().isoformat(),
                UserActivity.date < prev_week_end.date().isoformat(),
            )
            .scalar()
        ) or 0
        curr_week_voice_count = (
            db.query(func.count(UserActivity.id))
            .filter(
                UserActivity.user_id == uid,
                UserActivity.activity_type == "voice",
                UserActivity.date >= prev_week_end.date().isoformat(),
            )
            .scalar()
        ) or 0
        sessions_delta = curr_week_voice_count - prev_week_voice_count

        return {
            "success": True,
            # Trilha clássica removida — estes campos ficam neutros até o 4 pontas
            # ganhar um equivalente (ex: retomar aula do bloco A1).
            "lessons_completed": scope4p_lessons_completed,
            "total_lessons": scope4p_block_total,
            "avg_lesson_accuracy": 0.0,
            "best_lesson_accuracy": None,
            "total_xp": total_xp,
            "level": level,
            "streak": streak,
            "total_conversations": total_conversations,
            "writing_accuracy_avg": writing_accuracy_avg,
            "top_grammar_area": top_grammar_area,
            "text_messages_sent": text_messages_sent,
            "voice_minutes": voice_minutes,
            "voice_sessions_count": voice_sessions_count,
            "last_voice_quality": last_voice_quality,
            "avg_voice_quality": avg_voice_quality,
            "best_voice_quality": best_voice_quality,
            "total_voice_exchanges": total_voice_exchanges,
            "total_voice_corrections": total_voice_corrections,
            "challenge_days_completed": challenge_days_completed,
            "challenge_completion_percent": challenge_completion_percent,
            "challenge_days": week_days,
            "voice_modes_unlocked": unlocked_modes,
            "next_mode_unlock": next_mode_unlock,
            # ── Enriched payload for redesigned panel ──
            "profile": {
                "username": username,
                "learning_why": learning_why,
                "daily_interests": daily_interests,
            },
            "voice_quality_sparkline": sparkline_values,
            "vocab_mastered_total": vocab_mastered_total,
            "phrases_mastered_total": phrases_mastered_total,
            "vocab_mastered_week": vocab_mastered_week,
            "vocab_total_seen": vocab_total_seen,
            "vocab_total_seen_week": vocab_total_seen_week,
            "vocab_mastered_list": vocab_mastered_list,
            "shadowing_sessions_completed": shadowing_sessions_completed,
            "cefr": {
                "current": cefr_current,
                "next": cefr_next,
                "progress_percent": cefr_progress_percent,
                # Status de VALIDAÇÃO do A1 — mesma régua do certificado.
                # A UI usa para distinguir "em curso" de "validado/certificável".
                "a1_validated": a1_validated,
                "a1_requirements": {
                    "vocab": {"current": vocab_mastered_total, "target": A1_REQ_VOCAB},
                    "phrases": {"current": phrases_mastered_total, "target": A1_REQ_PHRASES},
                    "lessons": {"current": scope4p_lessons_completed, "target": A1_REQ_LESSONS},
                },
            },
            # Gate "As 4 pontas" do painel CEFR (sistema lessons-4p)
            "scope4p": {
                "lessons_completed": scope4p_lessons_completed,
                "block_total": scope4p_block_total,
                "words_learned": scope4p_words_learned,
                "words_dominated": scope4p_words_dominated,
                "phrases_dominated": scope4p_phrases_dominated,
                "items_dominated": scope4p_items_dominated,
            },
            "top_phoneme": top_phoneme,
            "today_focus_phrases": [],
            "lesson_rings": [],
            "next_badge": next_badge,
            "badges_earned_count": earned_count,
            "sessions_week_delta": sessions_delta,
            "resume_lesson": None,
        }
    except Exception as exc:
        logger.error("[USER-STATS] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error loading user stats")


@router.get("/api/user/activity")
async def get_user_activity(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return daily activity broken down by type for the current calendar year."""
    try:
        from datetime import date
        uid = int(user_id)
        year = date.today().year
        start = f"{year}-01-01"
        end   = f"{year}-12-31"
        rows = (
            db.query(UserActivity)
            .filter(
                UserActivity.user_id == uid,
                UserActivity.date >= start,
                UserActivity.date <= end,
            )
            .all()
        )
        result: dict = {}
        for r in rows:
            if r.date not in result:
                result[r.date] = {"lesson": 0, "chat": 0, "voice": 0, "total": 0}
            key = r.activity_type if r.activity_type in ("lesson", "chat", "voice") else "total"
            result[r.date][key] = result[r.date].get(key, 0) + r.count
            result[r.date]["total"] += r.count
        return {"success": True, "activity": result}
    except Exception as exc:
        logger.error("[USER-ACTIVITY] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error loading activity")


@router.get("/api/user/lesson-calendar")
async def get_lesson_calendar(
    year: int | None = None,
    month: int | None = None,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return per-day lesson completion counts for a given month (default: current month).

    Fonte: LessonScopeCompletion (sistema 4 pontas). A trilha clássica (LessonProgress)
    foi removida.
    """
    try:
        from calendar import monthrange

        uid = int(user_id)
        today = datetime.utcnow().date()
        y = year or today.year
        m = month or today.month

        if not (1 <= m <= 12):
            raise HTTPException(status_code=400, detail="Invalid month")

        last_day = monthrange(y, m)[1]
        start = datetime(y, m, 1)
        end = datetime(y, m, last_day, 23, 59, 59)

        rows = (
            db.query(LessonScopeCompletion)
            .filter(
                LessonScopeCompletion.user_id == uid,
                LessonScopeCompletion.completed_at.isnot(None),
                LessonScopeCompletion.completed_at >= start,
                LessonScopeCompletion.completed_at <= end,
            )
            .all()
        )

        days: dict[str, int] = {}
        for r in rows:
            ds = r.completed_at.strftime("%Y-%m-%d")
            days[ds] = days.get(ds, 0) + 1

        return {
            "success": True,
            "year": y,
            "month": m,
            "days": days,
            "total_days_practiced": len(days),
            "total_lessons_in_month": sum(days.values()),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("[LESSON-CALENDAR] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error loading lesson calendar")
