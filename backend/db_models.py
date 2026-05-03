from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    level = Column(Integer, default=1)  # Language proficiency level (1-6: A1-C2)
    xp = Column(Integer, default=0)  # Total XP earned
    streak = Column(Integer, default=0)  # Days of consecutive learning
    last_active = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # QW9: JWT Refresh Token
    refresh_token = Column(String(500), nullable=True)
    refresh_token_expiry = Column(DateTime, nullable=True)
    
    # ONBOARDING & PROFILING
    onboarding_step = Column(Integer, default=0)  # 0=welcome, 1=why_learn, 2=interests, 3=practical_demo, 4=done
    learning_why = Column(Text, nullable=True)  # Por que quer aprender
    daily_interests = Column(Text, nullable=True)  # O que gosta de fazer no dia a dia
    
    # Relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan", uselist=False)
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    xp_daily = Column(Integer, default=0)
    streak_count = Column(Integer, default=0)
    total_conversations = Column(Integer, default=0)
    voice_seconds = Column(Integer, default=0)  # Accumulated voice chat seconds
    voice_sessions = Column(JSON, nullable=True)  # Last 20 session snapshots [{quality, corrections_count, exchanges, radar, duration_seconds, ts}]
    last_active_date = Column(DateTime, default=datetime.utcnow, index=True)  # QW7: Index for activity tracking
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="progress")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # QW7: Index for queries
    message_role = Column(String(20), nullable=False)  # "user" or "assistant"
    message_text = Column(Text, nullable=False)
    translation = Column(Text, nullable=True)  # Translated/bilingual version
    language = Column(String(10), default="pt", index=True)  # QW7: Index for language filtering
    xp_awarded = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)  # QW7: Index for sorting by date
    
    # Writing mode tracking (for grammar/vocabulary feedback)
    error_corrections = Column(JSON, nullable=True)  # List of corrections made
    writing_accuracy_score = Column(Integer, nullable=True)  # 0-100 score on writing quality
    grammar_focus_area = Column(String(100), nullable=True)  # e.g., "Gerunds", "Articles"
    new_vocabulary = Column(JSON, nullable=True)  # New vocabulary/expressions introduced this turn
    
    # Relationships
    user = relationship("User", back_populates="conversations")



class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(200))
    icon = Column(String(50))  # Emoji or icon name
    xp_threshold = Column(Integer)  # XP required to earn
    type = Column(String(20), default="milestone")  # milestone, streak, vocabulary, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    users = relationship("UserBadge", back_populates="badge", cascade="all, delete-orphan")


class UserBadge(Base):
    __tablename__ = "user_badges"
    __table_args__ = (UniqueConstraint("user_id", "badge_id", name="unique_user_badge"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="badges")
    badge = relationship("Badge", back_populates="users")


class LessonProgress(Base):
    """Tracks user progress/score per lesson (v2 static lessons)."""
    __tablename__ = "lesson_progress"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="unique_user_lesson"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, nullable=False)          # ID of the static lesson (not FK)
    correct_answers = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    attempts = Column(Integer, default=1)                # how many times the user redid the exercises
    completed_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class VoicePhrase(Base):
    """Saved phrases from voice chat sessions (user's personal phrasebook)."""
    __tablename__ = "voice_phrases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    phrase_en = Column(Text, nullable=False)
    translation_pt = Column(Text, nullable=True)
    topic = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserActivity(Base):
    """Tracks daily activity per type for the GitHub-style heatmap."""
    __tablename__ = "user_activity"
    __table_args__ = (UniqueConstraint("user_id", "date", "activity_type", name="unique_user_date_type"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String(10), nullable=False)           # "YYYY-MM-DD"
    activity_type = Column(String(20), nullable=False, default="general")  # lesson | chat | voice | general
    count = Column(Integer, default=1)


class ShadowModeAnalytic(Base):
    """Voice Help Shadowing - pronunciation practice analytics for pedagogical use."""
    __tablename__ = "shadow_mode_analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    expected_text = Column(Text, nullable=False)  # Frase esperada
    user_attempts = Column(Integer, nullable=False)  # 1-3
    final_score = Column(Integer, nullable=False)  # 0-100
    pronunciation_errors = Column(JSON, nullable=True)  # List[str]
    auto_progressed = Column(Boolean, default=False)  # Esgotou 3 tentativas
    skipped = Column(Boolean, default=False)  # Usuário clicou "Pular"
    reason = Column(String(100), nullable=True)  # "max_attempts_exhausted"
    response_kind = Column(String(50), nullable=True)  # "Positiva", "Negativa", "Mudar rumo"
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Derivado do request
    voice_mode = Column(String(20), nullable=True)  # "free", "guided", etc
    user_level = Column(String(5), nullable=True)  # "a1", "a2", "b1", etc
    conversation_topic = Column(String(50), nullable=True)  # "restaurant", "airport", etc
