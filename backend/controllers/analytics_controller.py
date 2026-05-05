"""
Analytics Controller - Observabilidade do GRILO
Agregação de métricas para dashboard de negócio e técnica.
"""

import logging
from collections import defaultdict
from datetime import datetime, timedelta, date
from typing import Dict, Any, List, Set
from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import get_db
from backend.db_models import (
    AnalyticsEvent,
    User,
    UserProgress,
    Conversation,
    LessonProgress,
    UserActivity,
    UserBadge,
    VoicePhrase,
)

router = APIRouter(tags=["analytics"])
logger = logging.getLogger(__name__)


@router.get("/api/analytics/dashboard")
async def get_dashboard_analytics(db: Session = Depends(get_db)):
    """
    Retorna agregação completa de métricas para o dashboard.
    Inclui: usuários, retenção, engagement, qualidade, padrões de uso, técnica.
    """
    try:
        analytics = {}
        
        # ===== 1. SAÚDE DO NEGÓCIO =====
        analytics["health"] = _get_business_health(db)
        
        # ===== 2. LIÇÕES & APRENDIZADO =====
        analytics["learning"] = _get_learning_metrics(db)
        
        # ===== 3. VOICE CHAT =====
        analytics["voice"] = _get_voice_metrics(db)
        
        # ===== 4. PADRÕES DE USO =====
        analytics["patterns"] = _get_usage_patterns(db)
        
        # ===== 5. JORNADA DO USUÁRIO =====
        analytics["funnel"] = _get_user_funnel(db)
        
        # ===== 6. SAÚDE TÉCNICA =====
        analytics["technical"] = _get_technical_health(db)
        
        # ===== 7. TOP INSIGHTS =====
        analytics["insights"] = _get_insights(db, analytics)
        
        return {
            "status": "ok",
            "timestamp": datetime.utcnow().isoformat(),
            "data": analytics
        }
        
    except Exception as e:
        logger.error(f"Analytics error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar analytics"
        )


def _activity_window(start_day: date, end_day: date) -> tuple[str, str, datetime, datetime]:
    start_str = start_day.isoformat()
    end_str = end_day.isoformat()
    start_dt = datetime.combine(start_day, datetime.min.time())
    end_dt = datetime.combine(end_day + timedelta(days=1), datetime.min.time())
    return start_str, end_str, start_dt, end_dt


def _get_active_user_ids(db: Session, start_day: date, end_day: date) -> Set[int]:
    start_str, end_str, start_dt, end_dt = _activity_window(start_day, end_day)
    user_ids: Set[int] = set()

    for user_id, in (
        db.query(UserActivity.user_id)
        .filter(UserActivity.date >= start_str, UserActivity.date <= end_str)
        .distinct()
        .all()
    ):
        if user_id is not None:
            user_ids.add(int(user_id))

    for user_id, in (
        db.query(Conversation.user_id)
        .filter(Conversation.timestamp >= start_dt, Conversation.timestamp < end_dt)
        .distinct()
        .all()
    ):
        if user_id is not None:
            user_ids.add(int(user_id))

    return user_ids


def _get_ever_active_user_ids(db: Session) -> Set[int]:
    user_ids: Set[int] = set()

    for user_id, in db.query(UserActivity.user_id).distinct().all():
        if user_id is not None:
            user_ids.add(int(user_id))

    for user_id, in db.query(Conversation.user_id).distinct().all():
        if user_id is not None:
            user_ids.add(int(user_id))

    return user_ids


def _get_active_days_by_user(db: Session, start_day: date, end_day: date) -> Dict[int, Set[str]]:
    start_str, end_str, start_dt, end_dt = _activity_window(start_day, end_day)
    active_days: Dict[int, Set[str]] = defaultdict(set)

    for user_id, activity_day in (
        db.query(UserActivity.user_id, UserActivity.date)
        .filter(UserActivity.date >= start_str, UserActivity.date <= end_str)
        .distinct()
        .all()
    ):
        if user_id is not None and activity_day:
            active_days[int(user_id)].add(str(activity_day))

    for user_id, activity_day in (
        db.query(Conversation.user_id, func.date(Conversation.timestamp))
        .filter(Conversation.timestamp >= start_dt, Conversation.timestamp < end_dt)
        .distinct()
        .all()
    ):
        if user_id is not None and activity_day:
            active_days[int(user_id)].add(str(activity_day))

    return active_days


def _get_last_seen_by_user(db: Session) -> Dict[int, date]:
    last_seen: Dict[int, date] = {}

    for user_id, last_day in (
        db.query(UserActivity.user_id, func.max(UserActivity.date))
        .group_by(UserActivity.user_id)
        .all()
    ):
        if user_id is not None and last_day:
            last_seen[int(user_id)] = date.fromisoformat(str(last_day))

    for user_id, last_ts in (
        db.query(Conversation.user_id, func.max(Conversation.timestamp))
        .group_by(Conversation.user_id)
        .all()
    ):
        if user_id is not None and last_ts:
            current_day = last_ts.date()
            existing = last_seen.get(int(user_id), current_day)
            last_seen[int(user_id)] = max(existing, current_day)

    for user_id, last_active in db.query(User.id, User.last_active).all():
        if user_id is not None and last_active:
            current_day = last_active.date() if hasattr(last_active, "date") else date.fromisoformat(str(last_active)[:10])
            existing = last_seen.get(int(user_id), current_day)
            last_seen[int(user_id)] = max(existing, current_day)

    return last_seen


def _get_event_count(
    db: Session,
    *,
    event_name: str | None = None,
    category: str | None = None,
    lesson_id: int | None = None,
    start_dt: datetime | None = None,
    end_dt: datetime | None = None,
) -> int:
    query = db.query(func.coalesce(func.sum(AnalyticsEvent.count), 0))
    if event_name:
        query = query.filter(AnalyticsEvent.event_name == event_name)
    if category:
        query = query.filter(AnalyticsEvent.category == category)
    if lesson_id is not None:
        query = query.filter(AnalyticsEvent.lesson_id == lesson_id)
    if start_dt:
        query = query.filter(AnalyticsEvent.created_at >= start_dt)
    if end_dt:
        query = query.filter(AnalyticsEvent.created_at < end_dt)
    return int(query.scalar() or 0)


def _get_voice_user_ids(db: Session, start_day: date | None = None, end_day: date | None = None) -> Set[int]:
    user_ids: Set[int] = set()

    if start_day and end_day:
        start_str, end_str, start_dt, end_dt = _activity_window(start_day, end_day)
        for user_id, in (
            db.query(UserActivity.user_id)
            .filter(
                UserActivity.activity_type == "voice",
                UserActivity.date >= start_str,
                UserActivity.date <= end_str,
            )
            .distinct()
            .all()
        ):
            if user_id is not None:
                user_ids.add(int(user_id))

        for user_id, in (
            db.query(AnalyticsEvent.user_id)
            .filter(
                AnalyticsEvent.category == "voice",
                AnalyticsEvent.created_at >= start_dt,
                AnalyticsEvent.created_at < end_dt,
            )
            .distinct()
            .all()
        ):
            if user_id is not None:
                user_ids.add(int(user_id))

        return user_ids

    for user_id, in db.query(UserProgress.user_id).filter(UserProgress.voice_seconds > 0).all():
        if user_id is not None:
            user_ids.add(int(user_id))

    for user_id, in db.query(AnalyticsEvent.user_id).filter(AnalyticsEvent.category == "voice").distinct().all():
        if user_id is not None:
            user_ids.add(int(user_id))

    return user_ids


def _get_voice_session_count(db: Session) -> int:
    tracked_sessions = _get_event_count(db, event_name="voice_session_ended")
    if tracked_sessions > 0:
        return tracked_sessions

    total_sessions = 0
    try:
        for voice_sessions, in db.query(UserProgress.voice_sessions).all():
            if isinstance(voice_sessions, list):
                total_sessions += len(voice_sessions)
    except Exception:
        return 0

    return total_sessions


def _get_business_health(db: Session) -> Dict[str, Any]:
    """Métricas críticas de negócio usando atividade persistida por usuário."""

    today = date.today()
    now = datetime.utcnow()
    month_start = today - timedelta(days=29)
    seven_days_ago = today - timedelta(days=7)

    total_users = db.query(func.count(User.id)).scalar() or 0
    mau = len(_get_active_user_ids(db, month_start, today))
    dau = len(_get_active_user_ids(db, today, today))
    stickiness = round((dau / mau * 100) if mau > 0 else 0, 2)

    new_users_week = db.query(func.count(User.id)).filter(User.created_at >= now - timedelta(days=7)).scalar() or 0
    users_with_streak = db.query(func.count(User.id)).filter(User.streak > 0).scalar() or 0

    avg_xp = db.query(func.avg(User.xp)).scalar() or 0
    avg_xp = round(avg_xp, 0)

    text_counts = {
        int(user_id): int(count)
        for user_id, count in (
            db.query(Conversation.user_id, func.count(Conversation.id))
            .filter(Conversation.message_role == "user")
            .group_by(Conversation.user_id)
            .all()
        )
        if user_id is not None
    }
    voice_counts = {
        int(user_id): int(count)
        for user_id, count in (
            db.query(AnalyticsEvent.user_id, func.coalesce(func.sum(AnalyticsEvent.count), 0))
            .filter(AnalyticsEvent.event_name == "voice_message_sent")
            .group_by(AnalyticsEvent.user_id)
            .all()
        )
        if user_id is not None
    }
    interaction_counts: Dict[int, int] = defaultdict(int)
    for user_id, count in text_counts.items():
        interaction_counts[user_id] += count
    for user_id, count in voice_counts.items():
        interaction_counts[user_id] += count

    avg_conversations = round(
        sum(interaction_counts.values()) / len(interaction_counts) if interaction_counts else 0,
        1,
    )

    retention_d7 = _calculate_retention(db, days=7)
    retention_d30 = _calculate_retention(db, days=30)

    last_seen = _get_last_seen_by_user(db)
    churned_users = 0
    for user_id, created_at in db.query(User.id, User.created_at).all():
        if user_id is None or not created_at:
            continue
        created_day = created_at.date()
        last_day = last_seen.get(int(user_id), created_day)
        if created_day < seven_days_ago and last_day < seven_days_ago:
            churned_users += 1

    churn_rate = round((churned_users / total_users * 100) if total_users > 0 else 0, 2)

    return {
        "total_users": int(total_users),
        "mau": int(mau),
        "dau": int(dau),
        "stickiness_percent": stickiness,
        "new_users_week": int(new_users_week),
        "users_with_streak": int(users_with_streak),
        "avg_xp_per_user": int(avg_xp),
        "avg_conversations_per_user": avg_conversations,
        "retention_d7_percent": retention_d7,
        "retention_d30_percent": retention_d30,
        "churn_rate_percent": churn_rate,
    }


def _get_learning_metrics(db: Session) -> Dict[str, Any]:
    """Métricas de aprendizado baseadas em acessos rastreados e progresso salvo."""

    lessons_accessed = _get_event_count(db, event_name="lesson_access")
    unique_lessons_accessed = (
        db.query(func.count(func.distinct(AnalyticsEvent.lesson_id)))
        .filter(
            AnalyticsEvent.event_name == "lesson_access",
            AnalyticsEvent.lesson_id.isnot(None),
        )
        .scalar()
        or 0
    )

    lesson_records = (
        db.query(LessonProgress)
        .filter(LessonProgress.total_questions > 0)
        .all()
    )
    lessons_completed_total = len(lesson_records)

    lesson_accuracies = [
        (record.correct_answers / record.total_questions * 100)
        for record in lesson_records
        if record.total_questions and record.total_questions > 0
    ]
    avg_score = round(sum(lesson_accuracies) / len(lesson_accuracies), 1) if lesson_accuracies else 0.0

    per_lesson_accuracy_rows = (
        db.query(
            LessonProgress.lesson_id,
            func.sum(LessonProgress.correct_answers).label("total_correct"),
            func.sum(LessonProgress.total_questions).label("total_questions"),
        )
        .filter(LessonProgress.total_questions > 0)
        .group_by(LessonProgress.lesson_id)
        .all()
    )
    lesson_completion_rates = []
    for lesson_id, total_correct, total_questions in per_lesson_accuracy_rows:
        if lesson_id is None or not total_questions:
            continue
        lesson_completion_rates.append((total_correct or 0) / total_questions * 100)

    easy_lessons = len([rate for rate in lesson_completion_rates if rate >= 80])
    medium_lessons = len([rate for rate in lesson_completion_rates if 50 <= rate < 80])
    hard_lessons = len([rate for rate in lesson_completion_rates if rate < 50])

    access_total = func.coalesce(func.sum(AnalyticsEvent.count), 0)
    top_lessons = (
        db.query(AnalyticsEvent.lesson_id, access_total.label("accesses"))
        .filter(
            AnalyticsEvent.event_name == "lesson_access",
            AnalyticsEvent.lesson_id.isnot(None),
        )
        .group_by(AnalyticsEvent.lesson_id)
        .order_by(access_total.desc())
        .limit(5)
        .all()
    )

    if top_lessons:
        top_lessons_list = [
            {"lesson_id": int(lesson_id), "accesses": int(accesses), "attempts": int(accesses)}
            for lesson_id, accesses in top_lessons
            if lesson_id is not None
        ]
    else:
        attempts_total = func.coalesce(func.sum(LessonProgress.attempts), 0)
        fallback_top_lessons = (
            db.query(LessonProgress.lesson_id, attempts_total.label("attempts"))
            .group_by(LessonProgress.lesson_id)
            .order_by(attempts_total.desc())
            .limit(5)
            .all()
        )
        top_lessons_list = [
            {"lesson_id": int(lesson_id), "accesses": 0, "attempts": int(attempts)}
            for lesson_id, attempts in fallback_top_lessons
            if lesson_id is not None
        ]

    total_badges_earned = db.query(func.count(UserBadge.id)).scalar() or 0
    unique_badges = db.query(func.count(func.distinct(UserBadge.badge_id))).scalar() or 0

    return {
        "lessons_accessed": int(lessons_accessed),
        "unique_lessons_accessed": int(unique_lessons_accessed),
        "lessons_completed": int(lessons_completed_total),
        "avg_completion_rate_percent": avg_score,
        "avg_score_percent": avg_score,
        "exercise_submissions": _get_event_count(db, event_name="lesson_exercise_submitted"),
        "difficulty_distribution": {
            "easy": int(easy_lessons),
            "medium": int(medium_lessons),
            "hard": int(hard_lessons),
        },
        "top_5_lessons": top_lessons_list,
        "total_badges_earned": int(total_badges_earned),
        "unique_badges": int(unique_badges),
    }


def _get_voice_metrics(db: Session) -> Dict[str, Any]:
    """Métricas reais de voice baseadas em sessões gravadas e uso acumulado."""

    today = date.today()
    month_start = today - timedelta(days=29)

    voice_users = len(_get_voice_user_ids(db))

    total_voice_seconds = db.query(func.coalesce(func.sum(UserProgress.voice_seconds), 0)).scalar() or 0
    total_voice_minutes = round((total_voice_seconds / 60) if total_voice_seconds else 0, 1)

    avg_voice_seconds = (
        db.query(func.avg(UserProgress.voice_seconds))
        .filter(UserProgress.voice_seconds > 0)
        .scalar()
        or 0
    )
    avg_voice_per_user = round((avg_voice_seconds / 60) if avg_voice_seconds else 0, 1)

    voice_sessions = _get_voice_session_count(db)

    top_phrases = (
        db.query(VoicePhrase.topic, func.count(VoicePhrase.id).label("count"))
        .group_by(VoicePhrase.topic)
        .order_by(func.count(VoicePhrase.id).desc())
        .limit(5)
        .all()
        if db.query(VoicePhrase.id).first()
        else []
    )
    top_topics = [{"topic": topic or "general", "count": int(count)} for topic, count in top_phrases]

    monthly_active_users = len(_get_active_user_ids(db, month_start, today))
    monthly_voice_users = len(_get_voice_user_ids(db, month_start, today))
    voice_adoption_percent = round(
        (monthly_voice_users / monthly_active_users * 100) if monthly_active_users > 0 else 0,
        1,
    )

    return {
        "users_with_voice": int(voice_users),
        "total_voice_minutes": total_voice_minutes,
        "avg_voice_minutes_per_user": avg_voice_per_user,
        "voice_conversations": int(voice_sessions),
        "voice_sessions": int(voice_sessions),
        "top_topics": top_topics,
        "voice_adoption_percent": voice_adoption_percent,
    }


def _get_usage_patterns(db: Session) -> Dict[str, Any]:
    """Padrões de uso baseados em contagem real de atividade diária."""

    today = date.today()
    month_start = today - timedelta(days=29)
    start_str, end_str, _, _ = _activity_window(month_start, today)

    activity_summary = (
        db.query(UserActivity.activity_type, func.coalesce(func.sum(UserActivity.count), 0).label("count"))
        .filter(UserActivity.date >= start_str, UserActivity.date <= end_str)
        .group_by(UserActivity.activity_type)
        .all()
    )
    activities = {activity_type: int(count) for activity_type, count in activity_summary if activity_type}

    daily_rows = (
        db.query(UserActivity.date, func.coalesce(func.sum(UserActivity.count), 0).label("count"))
        .filter(UserActivity.date >= start_str, UserActivity.date <= end_str)
        .group_by(UserActivity.date)
        .all()
    )
    raw_daily_counts = {str(activity_day): int(count) for activity_day, count in daily_rows if activity_day}

    daily_activity_dict: Dict[str, int] = {}
    for offset in range(30):
        current_day = month_start + timedelta(days=offset)
        day_key = current_day.isoformat()
        daily_activity_dict[day_key] = raw_daily_counts.get(day_key, 0)

    avg_daily_activity = round(sum(daily_activity_dict.values()) / len(daily_activity_dict), 1) if daily_activity_dict else 0

    active_days_by_user = _get_active_days_by_user(db, month_start, today)
    consistent_users = sum(1 for active_days in active_days_by_user.values() if len(active_days) >= 5)

    return {
        "activity_by_type": activities,
        "daily_activity_last_30_days": daily_activity_dict,
        "avg_activity_per_day": avg_daily_activity,
        "consistent_users_last_30d": int(consistent_users),
    }


def _get_user_funnel(db: Session) -> Dict[str, Any]:
    """Jornada do usuário com foco em onboarding e ativação real."""

    total_users = db.query(func.count(User.id)).scalar() or 0

    try:
        step_0 = db.query(func.count(User.id)).filter(User.onboarding_step >= 0).scalar() or 0
        step_1 = db.query(func.count(User.id)).filter(User.onboarding_step >= 1).scalar() or 0
        step_2 = db.query(func.count(User.id)).filter(User.onboarding_step >= 2).scalar() or 0
        step_3 = db.query(func.count(User.id)).filter(User.onboarding_step >= 3).scalar() or 0
        step_4 = db.query(func.count(User.id)).filter(User.onboarding_step >= 4).scalar() or 0
    except Exception:
        step_0 = total_users
        step_1 = 0
        step_2 = 0
        step_3 = 0
        step_4 = 0

    onboarding_completion = round((step_4 / total_users * 100) if total_users > 0 else 0, 1)

    users_with_activity = len(_get_ever_active_user_ids(db))
    first_use_rate = round((users_with_activity / total_users * 100) if total_users > 0 else 0, 1)

    first_voice_users = len(_get_voice_user_ids(db))
    voice_adoption_rate = round((first_voice_users / total_users * 100) if total_users > 0 else 0, 1)

    return {
        "onboarding_completion_percent": onboarding_completion,
        "onboarding_stages": {
            "started": int(step_0),
            "step_1": int(step_1),
            "step_2": int(step_2),
            "step_3": int(step_3),
            "completed": int(step_4),
        },
        "first_use_rate_percent": first_use_rate,
        "voice_adoption_rate_percent": voice_adoption_rate,
        "users_ever_active": int(users_with_activity),
    }


def _get_technical_health(db: Session) -> Dict[str, Any]:
    """Saúde técnica: vem do voice_metrics que já existe."""
    
    try:
        from backend.voice_metrics import voice_metrics
        metrics = voice_metrics.get_summary()
        return metrics
    except Exception as e:
        logger.warning(f"Could not get technical metrics: {e}")
        return {"status": "unavailable"}


def _get_insights(db: Session, analytics: Dict[str, Any]) -> List[Dict[str, str]]:
    """Insights automáticos baseado nos dados."""
    
    insights = []
    
    health = analytics.get("health", {})
    learning = analytics.get("learning", {})
    voice = analytics.get("voice", {})
    
    # Insight 1: Retenção crítica
    retention_d7 = health.get("retention_d7_percent", 0)
    if retention_d7 < 30:
        insights.append({
            "type": "warning",
            "title": "Retenção baixa no D7",
            "message": f"Apenas {retention_d7}% dos usuários voltam no 7º dia. Revisar onboarding e primeiras lições."
        })
    elif retention_d7 > 50:
        insights.append({
            "type": "success",
            "title": "Ótima retenção!",
            "message": f"Retenção de {retention_d7}% no D7 indica bom engajamento inicial."
        })
    
    # Insight 2: Lições difíceis
    hard_lessons = learning.get("difficulty_distribution", {}).get("hard", 0)
    if hard_lessons > 5:
        insights.append({
            "type": "info",
            "title": "Muitas lições difíceis",
            "message": f"{hard_lessons} lições com <50% de acurácia. Considere revisá-las."
        })
    
    # Insight 3: Voice adoção
    voice_adoption = voice.get("voice_adoption_percent", 0)
    if voice_adoption < 20:
        insights.append({
            "type": "info",
            "title": "Voice adoption baixa",
            "message": "Menos de 20% dos usuários ativos usam voice. Investigar barreiras."
        })
    
    # Insight 4: Churn
    churn = health.get("churn_rate_percent", 0)
    if churn > 20:
        insights.append({
            "type": "warning",
            "title": "Churn elevado",
            "message": f"{churn}% de usuários inativos por 7+ dias. Investigar causas."
        })
    
    # Insight 5: Stickiness
    stickiness = health.get("stickiness_percent", 0)
    if stickiness > 30:
        insights.append({
            "type": "success",
            "title": "Alta stickiness",
            "message": f"{stickiness}% de MAU voltam diariamente. Produto bem adesivo!"
        })
    
    return insights[:5]  # Retornar top 5 insights


def _calculate_retention(db: Session, days: int) -> float:
    """Retention = usuários ativos no dia N que também ficaram ativos hoje."""
    today = date.today()
    comparison_day = today - timedelta(days=days)

    users_in_past = _get_active_user_ids(db, comparison_day, comparison_day)
    if not users_in_past:
        return 0.0

    users_today = _get_active_user_ids(db, today, today)
    retained_users = len(users_in_past & users_today)

    return round((retained_users / len(users_in_past) * 100) if users_in_past else 0, 1)
