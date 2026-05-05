"""
Analytics Controller - Observabilidade do GRILO
Agregação de métricas para dashboard de negócio e técnica.
"""

import logging
from datetime import datetime, timedelta, date
from typing import Dict, Any, List
from sqlalchemy import func, and_, text
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import get_db
from backend.db_models import (
    User, UserProgress, Conversation, LessonProgress, 
    UserActivity, UserBadge, Badge, VoicePhrase
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


def _get_business_health(db: Session) -> Dict[str, Any]:
    """Métricas críticas de negócio: usuários, retenção, engagement."""
    
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    seven_days_ago = now - timedelta(days=7)
    one_day_ago = now - timedelta(days=1)
    
    # Total de usuários
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    # Usuários ativos no mês (MAU)
    mau = db.query(func.count(func.distinct(Conversation.user_id)))\
        .filter(Conversation.timestamp >= thirty_days_ago).scalar() or 0
    
    # Usuários ativos no dia (DAU)
    dau = db.query(func.count(func.distinct(Conversation.user_id)))\
        .filter(Conversation.timestamp >= one_day_ago).scalar() or 0
    
    # DAU/MAU ratio (stickiness)
    stickiness = round((dau / mau * 100) if mau > 0 else 0, 2)
    
    # Novos usuários esta semana
    new_users_week = db.query(func.count(User.id))\
        .filter(User.created_at >= seven_days_ago).scalar() or 0
    
    # Usuários com streak > 0 (engaged)
    users_with_streak = db.query(func.count(User.id))\
        .filter(User.streak > 0).scalar() or 0
    
    # Média de XP por usuário (engajamento)
    avg_xp = db.query(func.avg(User.xp)).scalar() or 0
    avg_xp = round(avg_xp, 0)
    
    # Média de conversas por usuário
    user_convo_counts = db.query(
        Conversation.user_id,
        func.count(Conversation.id).label("count")
    ).group_by(Conversation.user_id).all()
    
    avg_conversations = round(
        sum([c[1] for c in user_convo_counts]) / len(user_convo_counts) if user_convo_counts else 0,
        1
    )
    
    # Retenção D7 (usuários que estavam ativos há 7 dias atrás e ainda estão)
    retention_d7 = _calculate_retention(db, days=7)
    
    # Retenção D30
    retention_d30 = _calculate_retention(db, days=30)
    
    # Churn rate (usuários inativos por 7 dias)
    churned_users = db.query(func.count(func.distinct(User.id))).filter(
        User.last_active < seven_days_ago,
        User.created_at < seven_days_ago  # Apenas contar se não é novo
    ).scalar() or 0
    
    churn_rate = round((churned_users / total_users * 100) if total_users > 0 else 0, 2)
    
    return {
        "total_users": int(total_users),
        "mau": int(mau),  # Monthly Active Users
        "dau": int(dau),  # Daily Active Users
        "stickiness_percent": stickiness,  # DAU/MAU %
        "new_users_week": int(new_users_week),
        "users_with_streak": int(users_with_streak),
        "avg_xp_per_user": int(avg_xp),
        "avg_conversations_per_user": avg_conversations,
        "retention_d7_percent": retention_d7,
        "retention_d30_percent": retention_d30,
        "churn_rate_percent": churn_rate,
    }


def _get_learning_metrics(db: Session) -> Dict[str, Any]:
    """Métricas de qualidade de aprendizado: lições, scores, completion."""
    
    # Número total de lições acessadas
    lessons_accessed = db.query(func.count(func.distinct(LessonProgress.lesson_id))).scalar() or 0
    
    # Lições completadas
    lessons_completed_total = db.query(func.count(LessonProgress.id))\
        .filter(LessonProgress.correct_answers > 0).scalar() or 0
    
    # Taxa de conclusão média por lição
    all_lesson_progress = db.query(
        LessonProgress.lesson_id,
        func.count(LessonProgress.id).label("attempts"),
        func.sum(LessonProgress.correct_answers).label("total_correct"),
        func.sum(LessonProgress.total_questions).label("total_questions"),
    ).group_by(LessonProgress.lesson_id).all()
    
    lesson_completion_rates = []
    for lp in all_lesson_progress:
        if lp.total_questions and lp.total_questions > 0:
            rate = (lp.total_correct or 0) / lp.total_questions * 100
            lesson_completion_rates.append(rate)
    
    avg_lesson_completion = round(
        sum(lesson_completion_rates) / len(lesson_completion_rates)
        if lesson_completion_rates else 0,
        1
    )
    
    # Score médio
    avg_score = round(avg_lesson_completion, 1)
    
    # Distribuição de dificuldade (heurística: lições com baixa taxa = difíceis)
    easy_lessons = len([r for r in lesson_completion_rates if r >= 80])
    medium_lessons = len([r for r in lesson_completion_rates if 50 <= r < 80])
    hard_lessons = len([r for r in lesson_completion_rates if r < 50])
    
    # Top 5 lições mais populares
    top_lessons = db.query(
        LessonProgress.lesson_id,
        func.count(LessonProgress.id).label("attempts")
    ).group_by(LessonProgress.lesson_id)\
     .order_by(func.count(LessonProgress.id).desc())\
     .limit(5).all()
    
    top_lessons_list = [
        {"lesson_id": l[0], "attempts": int(l[1])}
        for l in top_lessons
    ]
    
    # Badges ganhos
    total_badges_earned = db.query(func.count(UserBadge.id)).scalar() or 0
    unique_badges = db.query(func.count(func.distinct(Badge.id))).scalar() or 0
    
    return {
        "lessons_accessed": int(lessons_accessed),
        "lessons_completed": int(lessons_completed_total),
        "avg_completion_rate_percent": avg_lesson_completion,
        "avg_score_percent": avg_score,
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
    """Métricas de voice chat: uso, qualidade, naturalidade."""
    
    # Total de usuários que usaram voice
    voice_users = db.query(func.count(func.distinct(UserProgress.user_id)))\
        .filter(UserProgress.voice_seconds > 0).scalar() or 0
    
    # Tempo total de voice em minutos
    total_voice_minutes = db.query(func.sum(UserProgress.voice_seconds)).scalar() or 0
    total_voice_minutes = round((total_voice_minutes / 60) if total_voice_minutes else 0, 1)
    
    # Tempo médio de voice por usuário
    avg_voice_per_user = db.query(func.avg(UserProgress.voice_seconds)).scalar() or 0
    avg_voice_per_user = round((avg_voice_per_user / 60) if avg_voice_per_user else 0, 1)
    
    # Número de conversas de voice (contar mensagens "user" que vieram de voice)
    # Heurística: conversas com timestamps próximas = mesma sessão
    voice_conversations = db.query(func.count(func.distinct(Conversation.user_id)))\
        .filter(Conversation.message_role == "user").scalar() or 0
    
    # Vozes populares (palavras mais usadas em voice chats)
    top_phrases = db.query(
        VoicePhrase.topic,
        func.count(VoicePhrase.id).label("count")
    ).group_by(VoicePhrase.topic)\
     .order_by(func.count(VoicePhrase.id).desc())\
     .limit(5).all() if db.query(VoicePhrase).first() else []
    
    top_topics = [{"topic": p[0] or "general", "count": int(p[1])} for p in top_phrases]
    
    # Crescimento de voice (trend)
    last_week_voice_users = db.query(func.count(func.distinct(UserProgress.user_id)))\
        .join(User, User.id == UserProgress.user_id)\
        .filter(
            UserProgress.voice_seconds > 0,
            User.last_active >= datetime.utcnow() - timedelta(days=7)
        ).scalar() or 0
    
    voice_adoption_percent = round(
        (last_week_voice_users / voice_users * 100) if voice_users > 0 else 0,
        1
    )
    
    return {
        "users_with_voice": int(voice_users),
        "total_voice_minutes": total_voice_minutes,
        "avg_voice_minutes_per_user": avg_voice_per_user,
        "voice_conversations": int(voice_conversations),
        "top_topics": top_topics,
        "voice_adoption_percent": voice_adoption_percent,
    }


def _get_usage_patterns(db: Session) -> Dict[str, Any]:
    """Padrões de uso: horários, dias, consistência."""
    
    # Atividades por tipo
    activity_summary = db.query(
        UserActivity.activity_type,
        func.count(UserActivity.id).label("count")
    ).group_by(UserActivity.activity_type).all() if db.query(UserActivity).first() else []
    
    activities = {a[0]: int(a[1]) for a in activity_summary}
    
    # Dias mais ativos (baseado em conversas)
    now = datetime.utcnow()
    last_30_days = now - timedelta(days=30)
    
    daily_activity = db.query(
        func.date(Conversation.timestamp).label("day"),
        func.count(Conversation.id).label("count")
    ).filter(Conversation.timestamp >= last_30_days)\
     .group_by(func.date(Conversation.timestamp))\
     .order_by(func.date(Conversation.timestamp).desc())\
     .limit(30).all()
    
    daily_activity_dict = {
        str(d[0]): int(d[1]) for d in daily_activity
    }
    
    # Média de atividade por dia
    avg_daily_activity = round(
        sum([d[1] for d in daily_activity]) / len(daily_activity) if daily_activity else 0,
        1
    )
    
    # Consistência: usuários com atividade em 5+ dias do mês
    consistent_users = db.query(func.count(func.distinct(UserActivity.user_id)))\
        .filter(UserActivity.date >= str(last_30_days.date())).scalar() or 0
    
    return {
        "activity_by_type": activities,
        "daily_activity_last_30_days": daily_activity_dict,
        "avg_activity_per_day": avg_daily_activity,
        "consistent_users_last_30d": int(consistent_users),
    }


def _get_user_funnel(db: Session) -> Dict[str, Any]:
    """Jornada do usuário: onboarding, primeiras ações, retenção."""
    
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    # Onboarding completion stages
    step_0 = db.query(func.count(User.id)).filter(User.onboarding_step >= 0).scalar() or 0  # Todos
    step_1 = db.query(func.count(User.id)).filter(User.onboarding_step >= 1).scalar() or 0  # Passou de welcome
    step_2 = db.query(func.count(User.id)).filter(User.onboarding_step >= 2).scalar() or 0  # Passou de why_learn
    step_3 = db.query(func.count(User.id)).filter(User.onboarding_step >= 3).scalar() or 0  # Passou de interests
    step_4 = db.query(func.count(User.id)).filter(User.onboarding_step >= 4).scalar() or 0  # Completou
    
    onboarding_completion = round((step_4 / total_users * 100) if total_users > 0 else 0, 1)
    
    # Primeiro uso (usuários que fizeram primeira conversa)
    users_with_activity = db.query(func.count(func.distinct(Conversation.user_id))).scalar() or 0
    first_use_rate = round((users_with_activity / total_users * 100) if total_users > 0 else 0, 1)
    
    # Primeiro voice chat
    first_voice_users = db.query(func.count(func.distinct(UserProgress.user_id)))\
        .filter(UserProgress.voice_seconds > 0).scalar() or 0
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
    """
    Calcula retention rate: % de usuários que estavam ativos há N dias
    e ainda estão ativos hoje.
    """
    now = datetime.utcnow()
    retention_date = now - timedelta(days=days)
    
    # Usuários que eram ativos há N dias
    users_in_past = db.query(func.count(func.distinct(Conversation.user_id)))\
        .filter(
            Conversation.timestamp >= retention_date - timedelta(days=1),
            Conversation.timestamp < retention_date + timedelta(days=1)
        ).scalar() or 0
    
    if users_in_past == 0:
        return 0.0
    
    # Desses usuários, quantos ainda estão ativos hoje
    retained_users = db.query(func.count(func.distinct(Conversation.user_id)))\
        .filter(
            Conversation.user_id.in_(
                db.query(Conversation.user_id)
                .filter(
                    Conversation.timestamp >= retention_date - timedelta(days=1),
                    Conversation.timestamp < retention_date + timedelta(days=1)
                )
            ),
            Conversation.timestamp >= now - timedelta(days=1)
        ).scalar() or 0
    
    retention = round((retained_users / users_in_past * 100) if users_in_past > 0 else 0, 1)
    return retention
