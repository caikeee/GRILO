from datetime import datetime
import hashlib
import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.auth import get_current_user_id
from backend.database import get_db
from backend.db_models import (
    Badge,
    Conversation,
    LessonPhraseBank,
    LessonProgress,
    LessonQuizError,
    PhraseError,
    ShadowModeAnalytic,
    User,
    UserActivity,
    UserBadge,
    UserProgress,
    WordProfile,
)
from backend.utils import mark_activity, award_xp, track_metric_event
from backend.lessons import LESSON_REGISTRY, SLUG_TO_ID, get_lesson_by_id as get_lesson_from_registry

router = APIRouter(tags=["lessons"])
logger = logging.getLogger(__name__)

# Slug lookup for all 27 lessons (used to resolve analytics slug label)
_STANDALONE_LESSON_SLUGS = {
    lesson_id: slug for lesson_id, (slug, _) in LESSON_REGISTRY.items()
}


def _exercise_option_to_text(option):
    if isinstance(option, str):
        return option
    if isinstance(option, dict):
        label = option.get("label")
        if label is not None:
            return str(label)
        english_word = option.get("english_word")
        portuguese_word = option.get("portuguese_word")
        if english_word is not None and portuguese_word is not None:
            return f"{english_word} = {portuguese_word}"
        return str(option)
    return str(option)


def _question_hash(question_text: str) -> str:
    return hashlib.sha256(question_text.encode()).hexdigest()[:16]


def _upsert_quiz_error(
    db: Session,
    user_id: int,
    lesson_id: int,
    exercise: dict,
    correct_answer_text: str,
    wrong_answer_text: str,
    is_correct: bool,
):
    """Cria ou atualiza um registro de erro de questão MC para o painel de Dificuldades."""
    q_text = exercise.get("q") or exercise.get("question") or ""
    q_hash = _question_hash(q_text)

    existing = (
        db.query(LessonQuizError)
        .filter(
            LessonQuizError.user_id == user_id,
            LessonQuizError.lesson_id == lesson_id,
            LessonQuizError.question_hash == q_hash,
        )
        .first()
    )

    if existing:
        existing.attempts += 1
        existing.last_attempted_at = datetime.utcnow()
        existing.updated_at = datetime.utcnow()
        if not is_correct:
            existing.wrong_count += 1
            wrongs = list(existing.wrong_answers or [])
            if wrong_answer_text not in wrongs:
                wrongs.append(wrong_answer_text)
            existing.wrong_answers = wrongs[-10:]  # mantém até 10 erros distintos
    else:
        db.add(LessonQuizError(
            user_id=user_id,
            lesson_id=lesson_id,
            question_hash=q_hash,
            question_text=q_text,
            correct_answer=correct_answer_text,
            wrong_answers=[wrong_answer_text] if not is_correct else [],
            wrong_count=0 if is_correct else 1,
            attempts=1,
        ))
    db.commit()


def _resolve_correct_index(exercise):
    options = exercise.get("options") or []
    if not isinstance(options, list):
        options = []

    correct_index = exercise.get("correct")
    if isinstance(correct_index, int) and 0 <= correct_index < len(options):
        return correct_index

    answer = str(exercise.get("answer", "")).strip().lower()
    if answer:
        for idx, opt in enumerate(options):
            if _exercise_option_to_text(opt).strip().lower() == answer:
                return idx

    return 0 if options else -1


def _get_exercise_at_index(lesson_data: dict, exercise_index: int) -> dict | None:
    """Resolve um exercício pelo índice linear usado pelo frontend.

    Mapeamento de índices (definido no frontend lessons-enhanced.js):
      0..N-1   → section_exercises (EXERCISE_MC via _griloAnswer)
      100+     → anchor_blanks (sem 'correct' — ignorados)
      200+exIndex → scaffolded_exercises (checkScaffoldedAnswer)
      300+qIdx → final_test (checkFinalTest)
    """
    scaffolded = lesson_data.get("scaffolded_exercises") or []
    final_test = lesson_data.get("final_test") or []

    if exercise_index >= 300:
        idx = exercise_index - 300
        if 0 <= idx < len(final_test):
            ex = final_test[idx]
            if isinstance(ex, dict):
                return ex

    elif exercise_index >= 200:
        idx = exercise_index - 200
        if 0 <= idx < len(scaffolded):
            ex = scaffolded[idx]
            if isinstance(ex, dict):
                return ex

    elif exercise_index >= 100:
        # anchor_blank — sem campo 'correct', não registramos
        return None

    # else: índice 0-99 → section exercises (EXERCISE_MC) vivem só no frontend
    # backend não tem esses dados; o caller usa body.question_text como fallback

    return None


class _ExerciseSubmitBody(BaseModel):
    exercise_index: int
    selected_index: int
    is_correct: bool | None = None
    source: str | None = None
    time_spent_ms: int | None = None      # ms desde que o exercício apareceu até submit
    hint_used: bool | None = None         # usuário clicou em dica antes de responder
    # campos opcionais para exercícios de seção (EXERCISE_MC — dados só no frontend)
    question_text: str | None = None
    correct_answer: str | None = None
    wrong_answer: str | None = None
    # retomar exato (hero da home): posição linear 1-based no fluxo + total
    exercise_position: int | None = None
    total_exercises: int | None = None


class _SaveProgressBody(BaseModel):
    correct_answers: int
    total_questions: int
    time_spent_ms: int | None = None      # ms totais na aula (lesson_abandoned se não salvar)


class _LessonsPageViewBody(BaseModel):
    source: str | None = None


class _LessonAbandonBody(BaseModel):
    lesson_id: int
    exercise_index_reached: int | None = None   # última questão que viu
    time_spent_ms: int | None = None
    # retomar exato (hero da home): posição linear 1-based no fluxo + total
    exercise_position: int | None = None
    total_exercises: int | None = None


def _persist_resume_position(db: Session, user_id: int, lesson_id: int, position: int | None, total: int | None) -> None:
    """Guarda a posição do último exercício respondido para o hero da home
    ("você parou no exercício X de Y"). Cria o registro de progresso se a aula
    ainda não tem um (0/0 — não conta como concluída em nenhuma métrica)."""
    if position is None:
        return
    try:
        prog = (
            db.query(LessonProgress)
            .filter(LessonProgress.user_id == user_id, LessonProgress.lesson_id == lesson_id)
            .first()
        )
        if prog:
            prog.last_exercise_index = int(position)
            if total:
                prog.total_exercises = int(total)
            prog.updated_at = datetime.utcnow()
        else:
            db.add(
                LessonProgress(
                    user_id=user_id,
                    lesson_id=lesson_id,
                    correct_answers=0,
                    total_questions=0,
                    last_exercise_index=int(position),
                    total_exercises=int(total) if total else None,
                )
            )
        db.commit()
    except Exception as pos_err:
        db.rollback()
        logger.warning("[LESSON-RESUME] position persist failed: %s", pos_err)


def _get_standalone_lesson_slug(lesson_id: int) -> str | None:
    return _STANDALONE_LESSON_SLUGS.get(int(lesson_id))


@router.post("/api/lessons/page-view")
async def track_lessons_page_view(
    body: _LessonsPageViewBody | None = None,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Persist each lessons page access so the dashboard reflects page visits."""
    try:
        uid = int(user_id)
        mark_activity(db, uid, "lesson")
        track_metric_event(
            db,
            uid,
            "lesson",
            "lessons_page_view",
            details={"source": (body.source if body and body.source else "lessons_page")},
        )
        return {"success": True}
    except Exception as exc:
        logger.error("[LESSONS-PAGE] Error tracking page view: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error tracking lessons page view")


@router.get("/api/lessons/all")
async def get_all_lessons_v2(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get all A1 lessons from the registry."""
    try:
        lessons = [
            {"id": lid, "slug": slug}
            for lid, (slug, _) in LESSON_REGISTRY.items()
        ]
        logger.info("[LESSONS] Retrieved %s lessons for user %s", len(lessons), user_id)
        return {"success": True, "total": len(lessons), "lessons": lessons}
    except Exception as exc:
        logger.error("[LESSONS] Error loading lessons: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error loading lessons")


@router.get("/api/lessons/categories")
async def get_lesson_categories(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get lesson module groupings."""
    try:
        from collections import defaultdict
        by_module = defaultdict(list)
        for lid, (slug, lesson_data) in LESSON_REGISTRY.items():
            m = lesson_data.get("module", 1)
            by_module[m].append({"id": lid, "slug": slug, "title": lesson_data.get("title", slug)})
        categories = [{"module": m, "lessons": items} for m, items in sorted(by_module.items())]
        return {
            "success": True,
            "total_categories": len(categories),
            "total_lessons": len(LESSON_REGISTRY),
            "categories": categories,
        }
    except Exception as exc:
        logger.error("[LESSONS] Error loading categories: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error loading categories")


@router.get("/api/lessons/progress")
async def get_lesson_progress(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return lesson progress records for the authenticated user."""
    try:
        records = db.query(LessonProgress).filter(LessonProgress.user_id == int(user_id)).all()
        progress_map = {
            record.lesson_id: {
                "lesson_id": record.lesson_id,
                "correct_answers": record.correct_answers,
                "total_questions": record.total_questions,
                "attempts": record.attempts,
                "completed_at": record.completed_at.isoformat() if record.completed_at else None,
            }
            for record in records
        }
        return {"success": True, "progress": progress_map}
    except Exception as exc:
        logger.error("[LESSON-PROGRESS] Error fetching progress: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error fetching progress")


@router.post("/api/lessons/{lesson_id}/track-access")
async def track_lesson_access(
    lesson_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Persist every lesson open so dashboard access counters reflect real usage."""
    try:
        standalone_slug = _get_standalone_lesson_slug(lesson_id)
        if not standalone_slug:
            raise HTTPException(status_code=404, detail="Lesson not found")

        uid = int(user_id)
        mark_activity(db, uid, "lesson")
        track_metric_event(
            db,
            uid,
            "lesson",
            "lesson_access",
            lesson_id=lesson_id,
            details={
                "source": "standalone",
                "standalone_slug": standalone_slug,
            },
        )
        return {"success": True, "lesson_id": lesson_id}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("[LESSON-ACCESS] Error tracking access: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error tracking lesson access")


@router.post("/api/lessons/{lesson_id}/submit-exercise")
async def submit_lesson_exercise(
    lesson_id: int,
    body: _ExerciseSubmitBody,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Submit answer to a lesson exercise using selected option index."""
    try:
        standalone_slug = _get_standalone_lesson_slug(lesson_id)
        if not standalone_slug:
            raise HTTPException(status_code=404, detail="Lesson not found")

        # All lessons are standalone — frontend manages exercise display and validation.
        # Backend receives is_correct from the client (trusted for XP/analytics only).
        is_correct = body.is_correct
        xp_earned = 0

        xp_result = {"xp_earned": 0, "new_total": 0, "level_up": False, "new_level": 1}

        # Registra erro no painel Dificuldades a cada resposta (certo ou errado atualiza tentativas)
        try:
            lesson_data = get_lesson_from_registry(lesson_id)
            if lesson_data:
                exercise = _get_exercise_at_index(lesson_data, body.exercise_index)
                if exercise:
                    # scaffolded / final_test — dados completos no registry
                    options = exercise.get("options") or []
                    correct_idx = _resolve_correct_index(exercise)
                    correct_text = _exercise_option_to_text(options[correct_idx]) if 0 <= correct_idx < len(options) else ""
                    wrong_text = _exercise_option_to_text(options[body.selected_index]) if 0 <= body.selected_index < len(options) else ""
                    _upsert_quiz_error(db, int(user_id), lesson_id, exercise, correct_text, wrong_text, bool(is_correct))
                elif body.question_text and body.correct_answer is not None:
                    # section exercises (EXERCISE_MC) — frontend envia os dados
                    synthetic = {"q": body.question_text, "options": [], "correct": -1}
                    _upsert_quiz_error(
                        db, int(user_id), lesson_id, synthetic,
                        body.correct_answer,
                        body.wrong_answer or "",
                        bool(is_correct),
                    )
        except Exception as _quiz_err:
            logger.warning("[LESSON-EXERCISE] quiz error upsert failed: %s", _quiz_err)

        # Retomar exato — persiste a posição para o hero da home
        _persist_resume_position(db, int(user_id), lesson_id, body.exercise_position, body.total_exercises)

        track_metric_event(
            db,
            int(user_id),
            "lesson",
            "lesson_exercise_submitted",
            lesson_id=lesson_id,
            details={
                "exercise_index": body.exercise_index,
                "is_correct": is_correct,
                "source": body.source or "standalone",
                "standalone_slug": standalone_slug,
                "time_spent_ms": body.time_spent_ms,
                "hint_used": body.hint_used or False,
            },
        )
        if body.hint_used:
            track_metric_event(
                db,
                int(user_id),
                "lesson",
                "exercise_hint_used",
                lesson_id=lesson_id,
                details={"exercise_index": body.exercise_index, "source": body.source},
            )

        logger.info(
            "[LESSON-EXERCISE] User %s - Lesson %s, Ex %s: %s | xp=%s",
            user_id,
            lesson_id,
            body.exercise_index,
            "✓" if is_correct else "✗",
            xp_earned,
        )

        return {
            "success": True,
            "correct": is_correct,
            "xp_earned": xp_result["xp_earned"],
            "user_total_xp": xp_result["new_total"],
            "level_up": xp_result["level_up"],
            "new_level": xp_result["new_level"],
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("[LESSON-EXERCISE] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error submitting exercise")


@router.post("/api/lessons/{lesson_id}/save-progress")
async def save_lesson_progress(
    lesson_id: int,
    body: _SaveProgressBody,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Save (or update) the user's exercise score for a lesson."""
    try:
        existing = (
            db.query(LessonProgress)
            .filter(LessonProgress.user_id == int(user_id), LessonProgress.lesson_id == lesson_id)
            .first()
        )

        # Registro pode existir só pela posição de retomada (0/0, sem learned_at) —
        # "primeira conclusão" é definida por learned_at, não pela existência da linha.
        was_learned = bool(existing and existing.learned_at)

        if existing:
            existing.correct_answers = body.correct_answers
            existing.total_questions = body.total_questions
            existing.attempts += 1
            existing.updated_at = datetime.utcnow()
            # Aula concluída — limpa a posição de retomada (hero volta ao fallback)
            existing.last_exercise_index = None
            # Se ainda não tinha learned_at, marca agora (1ª vez que conclui)
            if not existing.learned_at:
                existing.learned_at = datetime.utcnow()
        else:
            db.add(
                LessonProgress(
                    user_id=int(user_id),
                    lesson_id=lesson_id,
                    correct_answers=body.correct_answers,
                    total_questions=body.total_questions,
                    learned_at=datetime.utcnow(),
                )
            )

        db.commit()

        # Award lesson completion XP only on first completion
        xp_result = {"xp_earned": 0, "new_total": 0, "level_up": False, "new_level": 1}
        if not was_learned:
            # 50 XP flat for completing the lesson
            xp_result = award_xp(db, int(user_id), 50, source="lesson_complete")

        mark_activity(db, int(user_id), "lesson")
        track_metric_event(
            db,
            int(user_id),
            "lesson",
            "lesson_progress_saved",
            lesson_id=lesson_id,
            details={
                "correct_answers": body.correct_answers,
                "total_questions": body.total_questions,
                "is_first_completion": not was_learned,
                "time_spent_ms": body.time_spent_ms,
            },
        )
        logger.info(
            "[LESSON-PROGRESS] User %s - Lesson %s: %s/%s | xp=%s",
            user_id,
            lesson_id,
            body.correct_answers,
            body.total_questions,
            xp_result["xp_earned"],
        )
        return {
            "success": True,
            "lesson_id": lesson_id,
            "correct_answers": body.correct_answers,
            "total_questions": body.total_questions,
            "xp_earned": xp_result["xp_earned"],
            "total_xp": xp_result["new_total"],
            "level_up": xp_result["level_up"],
            "new_level": xp_result["new_level"],
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("[LESSON-PROGRESS] Error saving progress: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error saving progress")


@router.post("/api/lessons/abandon")
async def track_lesson_abandoned(
    body: _LessonAbandonBody,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Track when user leaves a lesson mid-way without saving progress."""
    try:
        # Retomar exato — persiste a posição para o hero da home
        _persist_resume_position(db, int(user_id), body.lesson_id, body.exercise_position, body.total_exercises)

        track_metric_event(
            db,
            int(user_id),
            "lesson",
            "lesson_abandoned",
            lesson_id=body.lesson_id,
            details={
                "exercise_index_reached": body.exercise_index_reached,
                "time_spent_ms": body.time_spent_ms,
            },
        )
        return {"success": True}
    except Exception as exc:
        logger.error("[LESSON-ABANDON] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Error tracking lesson abandon")


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

        # Lesson progress
        lesson_records = db.query(LessonProgress).filter(LessonProgress.user_id == uid).all()
        # Concluídas = learned_at marcado (ou legado com questões salvas).
        # Registros criados só pela posição de retomada (0/0) não contam.
        lessons_completed = len([
            r for r in lesson_records
            if r.learned_at is not None or (r.total_questions or 0) > 0
        ])
        total_lessons = 50

        accuracies = [
            (r.correct_answers / r.total_questions * 100)
            for r in lesson_records
            if r.total_questions and r.total_questions > 0
        ]
        avg_lesson_accuracy = round(sum(accuracies) / len(accuracies), 1) if accuracies else 0.0
        best_lesson_accuracy = round(max(accuracies), 1) if accuracies else None

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
        vocab_total_seen = (
            db.query(func.count(WordProfile.id))
            .filter(WordProfile.user_id == uid)
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

        # CEFR progression (1=A1 .. 6=C2)
        cefr_labels = {1: "A1", 2: "A2", 3: "B1", 4: "B2", 5: "C1", 6: "C2"}
        cefr_current = cefr_labels.get(level, "A1")
        cefr_next = cefr_labels.get(min(level + 1, 6), "C2")
        # Rough progression heuristic: blend of accuracy + sessions completed toward next level
        progression_signal = 0.0
        if avg_lesson_accuracy:
            progression_signal += min(avg_lesson_accuracy, 100) * 0.5  # 0..50
        if avg_voice_quality:
            progression_signal += min(avg_voice_quality, 100) * 0.3    # 0..30
        progression_signal += min(lessons_completed * 2, 20)            # 0..20
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

        # Today focus phrases (status=dificil OR last_attempted older than 4 days with attempts>0)
        focus_cutoff = _dt.utcnow() - timedelta(days=4)
        focus_rows = (
            db.query(PhraseError, LessonPhraseBank)
            .join(LessonPhraseBank, PhraseError.phrase_id == LessonPhraseBank.id)
            .filter(
                PhraseError.user_id == uid,
                PhraseError.attempts > 0,
                PhraseError.status != "dominada",
            )
            .order_by(PhraseError.last_attempted_at.asc())
            .limit(4)
            .all()
        )
        today_focus = []
        for err, phrase in focus_rows:
            days_since = None
            if err.last_attempted_at:
                days_since = max(0, (_dt.utcnow() - err.last_attempted_at).days)
            today_focus.append({
                "phrase_en": phrase.phrase_en,
                "phrase_pt": phrase.phrase_pt,
                "lesson_id": phrase.lesson_id,
                "status": err.status,
                "days_since": days_since,
            })

        # Lesson rings (per-lesson dominated_phrases_count / 100)
        lesson_rings = []
        for r in lesson_records:
            ratio = max(0, min(100, int(r.dominated_phrases_count or 0)))
            lesson_rings.append({
                "lesson_id": r.lesson_id,
                "dominated": ratio,
                "accuracy": round((r.correct_answers / r.total_questions * 100), 1) if r.total_questions else None,
                "is_dominated": r.dominated_at is not None,
            })
        # Sort: in-progress first (highest progress), then dominated
        lesson_rings.sort(key=lambda x: (x["is_dominated"], -x["dominated"]))
        lesson_rings = lesson_rings[:6]

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

        # Resume-where-you-stopped (most recently touched lesson with progress < 100)
        resume = None
        in_progress_records = sorted(
            [r for r in lesson_records if (r.dominated_phrases_count or 0) < 100],
            key=lambda r: r.updated_at or r.completed_at or _dt.min,
            reverse=True,
        )
        if in_progress_records:
            r = in_progress_records[0]
            lesson_meta = get_lesson_from_registry(r.lesson_id) or {}
            resume = {
                "lesson_id": r.lesson_id,
                "title": lesson_meta.get("title", f"Aula {r.lesson_id}"),
                "dominated": int(r.dominated_phrases_count or 0),
                # Retomar exato — "você parou no exercício X de Y" (null se não houver)
                "last_exercise_index": r.last_exercise_index,
                "total_exercises": r.total_exercises,
            }

        return {
            "success": True,
            "lessons_completed": lessons_completed,
            "total_lessons": total_lessons,
            "avg_lesson_accuracy": avg_lesson_accuracy,
            "best_lesson_accuracy": best_lesson_accuracy,
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
            "vocab_mastered_week": vocab_mastered_week,
            "vocab_total_seen": vocab_total_seen,
            "vocab_mastered_list": vocab_mastered_list,
            "cefr": {
                "current": cefr_current,
                "next": cefr_next,
                "progress_percent": cefr_progress_percent,
            },
            "top_phoneme": top_phoneme,
            "today_focus_phrases": today_focus,
            "lesson_rings": lesson_rings,
            "next_badge": next_badge,
            "badges_earned_count": earned_count,
            "sessions_week_delta": sessions_delta,
            "resume_lesson": resume,
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
    """Return per-day lesson completion counts for a given month (default: current month)."""
    try:
        from datetime import date
        from calendar import monthrange

        uid = int(user_id)
        today = date.today()
        y = year or today.year
        m = month or today.month

        if not (1 <= m <= 12):
            raise HTTPException(status_code=400, detail="Invalid month")

        last_day = monthrange(y, m)[1]
        start = datetime(y, m, 1)
        end = datetime(y, m, last_day, 23, 59, 59)

        rows = (
            db.query(LessonProgress)
            .filter(
                LessonProgress.user_id == uid,
                LessonProgress.learned_at.isnot(None),
                LessonProgress.learned_at >= start,
                LessonProgress.learned_at <= end,
            )
            .all()
        )

        days: dict[str, int] = {}
        for r in rows:
            ds = r.learned_at.strftime("%Y-%m-%d")
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


# ==================== QUIZ ENDPOINTS ====================

@router.get("/api/quiz/questions")
async def get_all_quiz_questions():
    """Get all quiz questions."""
    try:
        questions = get_all_questions()
        logger.info("[QUIZ] Retrieved %s questions", len(questions))
        return {"success": True, "total": len(questions), "questions": questions}
    except Exception as exc:
        logger.error("[QUIZ] Error retrieving questions: %s", str(exc))
        raise HTTPException(status_code=500, detail="Quiz unavailable. Please try again.")


@router.get("/api/quiz/questions/category/{category}")
async def get_quiz_by_category(category: str):
    """Get questions filtered by category."""
    try:
        questions = get_questions_by_category(category)
        logger.info("[QUIZ] Retrieved %s questions for category: %s", len(questions), category)
        return {
            "success": True,
            "category": category,
            "total": len(questions),
            "questions": questions,
        }
    except ValueError as exc:
        logger.error("[QUIZ] Invalid category: %s", category)
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.error("[QUIZ] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Quiz unavailable. Please try again.")


@router.get("/api/quiz/random")
async def get_random_quiz(count: int = 10, category: str = None, difficulty: int = None):
    """Get random questions with optional filters."""
    try:
        questions = get_random_questions(count=count, category=category, difficulty=difficulty)
        logger.info("[QUIZ] Generated random quiz with %s questions", len(questions))
        return {"success": True, "total": len(questions), "questions": questions}
    except ValueError as exc:
        logger.error("[QUIZ] Invalid parameters: %s", str(exc))
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.error("[QUIZ] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Quiz unavailable. Please try again.")


@router.post("/api/quiz/submit-answer")
async def submit_quiz_answer(
    question_id: int,
    answer_index: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Submit an answer to a quiz question and award XP."""
    try:
        is_correct, result = validate_answer(question_id, answer_index)

        xp_earned = 50 if is_correct else 0

        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.xp += xp_earned
            db.commit()

        logger.info(
            "[QUIZ-SUBMIT] User %s - Question %s: %s",
            user_id,
            question_id,
            "✓" if is_correct else "✗",
        )

        try:
            # Record user activity and analytics event for quiz submissions
            mark_activity(db, int(user_id), "quiz")
            track_metric_event(
                db,
                int(user_id),
                "quiz",
                "quiz_question_submitted",
                lesson_id=None,
                count=1,
                details={"question_id": question_id, "answer_index": answer_index, "is_correct": is_correct},
            )
        except Exception:
            logger.warning("[QUIZ-TRACK] Could not record analytics for quiz submission")

        return {
            "success": True,
            "correct": is_correct,
            "xp_earned": xp_earned,
            "user_total_xp": user.xp if user else 0,
            "result": result,
        }
    except ValueError as exc:
        logger.error("[QUIZ-SUBMIT] Invalid question: %s", str(exc))
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.error("[QUIZ-SUBMIT] Error: %s", str(exc))
        raise HTTPException(status_code=500, detail="Could not submit answer. Please try again.")
