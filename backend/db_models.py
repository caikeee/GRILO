from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from backend.database import Base
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
    is_admin = Column(Boolean, default=False)  # Admin flag (only "caike")
    
    # QW9: JWT Refresh Token
    refresh_token = Column(String(500), nullable=True)
    refresh_token_expiry = Column(DateTime, nullable=True)
    # token_version: bumped on logout / password reset to revoke outstanding access tokens
    token_version = Column(Integer, nullable=False, default=0)
    # Lockout fields for failed login throttling
    failed_login_count = Column(Integer, nullable=False, default=0)
    locked_until = Column(DateTime, nullable=True)
    
    # ONBOARDING & PROFILING
    onboarding_step = Column(Integer, default=0)  # 0=welcome, 1=why_learn, 2=interests, 3=practical_demo, 4=done
    learning_why = Column(Text, nullable=True)  # Por que quer aprender
    daily_interests = Column(Text, nullable=True)  # O que gosta de fazer no dia a dia

    # SESSÃO DE DIFICULDADES (meta semanal 7/7)
    weekly_difficulty_count = Column(Integer, default=0)            # 0–7 quadradinhos verdes na semana
    weekly_difficulty_week_start = Column(DateTime, nullable=True)  # Segunda-feira (BRT) da semana corrente
    weekly_difficulty_completed_at = Column(DateTime, nullable=True)  # Quando bateu 7/7 (None se ainda não bateu)
    
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

    # ── Aprendida x Dominada ─────────────────────────────────────────
    learned_at = Column(DateTime, nullable=True)              # 1ª vez que concluiu (desbloqueia próxima)
    dominated_phrases_count = Column(Integer, default=0)      # 0..100 — contador de frases dominadas
    dominated_at = Column(DateTime, nullable=True)            # timestamp quando atingiu 100/100

    # ── Retomar exato (hero da home: "você parou no exercício X de Y") ──
    last_exercise_index = Column(Integer, nullable=True)      # posição linear (1-based) do último exercício respondido
    total_exercises = Column(Integer, nullable=True)          # total de exercícios do fluxo quando registrado


class LessonPhraseBank(Base):
    """Banco de frases por aula — alimenta o exercício de voz.
    Cada aula tem várias frases (alvo: 100). Início: 5 frases reais por aula."""
    __tablename__ = "lesson_phrase_bank"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, nullable=False, index=True)
    phrase_en = Column(Text, nullable=False)
    phrase_pt = Column(Text, nullable=True)
    phonetic = Column(String(255), nullable=True)              # "may · neym · iz · KAR-los"
    warning_pt = Column(Text, nullable=True)                   # alerta de pronúncia (opcional)
    difficulty_level = Column(Integer, default=1)              # 1=básico, 2=variação, 3=contexto, 4=fluência
    source = Column(String(40), default="exercise_answer")     # exercise_answer | example | vocabulary | ai_generated
    order_hint = Column(Integer, default=0)                    # ordem sugerida dentro da aula
    created_at = Column(DateTime, default=datetime.utcnow)


class PhraseError(Base):
    """Histórico por usuário/frase — usado pelo painel Dificuldades e remediação."""
    __tablename__ = "phrase_errors"
    __table_args__ = (UniqueConstraint("user_id", "phrase_id", name="unique_user_phrase"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(Integer, nullable=False, index=True)
    phrase_id = Column(Integer, ForeignKey("lesson_phrase_bank.id"), nullable=False, index=True)
    status = Column(String(20), default="em_progresso")        # dominada | em_progresso | dificil
    attempts = Column(Integer, default=0)                      # total de tentativas
    correct_sessions = Column(Integer, default=0)              # sessões em que acertou (>=2 = dominada)
    skipped_count = Column(Integer, default=0)                 # quantas vezes pulou
    last_wrong_words = Column(JSON, nullable=True)             # palavras erradas na última tentativa
    last_attempted_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
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


class AnalyticsEvent(Base):
    """Tracks exact product events for dashboards that need per-action counters."""
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    category = Column(String(30), nullable=False, index=True)   # lesson | chat | voice | funnel
    event_name = Column(String(60), nullable=False, index=True)
    lesson_id = Column(Integer, nullable=True, index=True)
    count = Column(Integer, default=1)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class LessonQuizError(Base):
    """Rastreia erros de exercícios de múltipla escolha por usuário/questão.
    Uma linha por questão distinta — upsert a cada nova tentativa errada."""
    __tablename__ = "lesson_quiz_errors"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", "question_hash", name="unique_user_lesson_question"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(Integer, nullable=False, index=True)
    question_hash = Column(String(64), nullable=False)       # SHA256[:16] do question text — identifica a questão
    question_text = Column(Text, nullable=False)              # Texto da pergunta
    correct_answer = Column(Text, nullable=False)             # Resposta correta
    wrong_answers = Column(JSON, nullable=True)               # Lista de respostas erradas dadas
    wrong_count = Column(Integer, default=1)                  # Vezes que errou
    attempts = Column(Integer, default=1)                     # Total de tentativas (incluindo acertos)
    last_attempted_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DifficultySessionLog(Base):
    """Log de cada sessão de Dificuldades concluída (ou abandonada).
    Usado para análise; o estado vivo está em User.weekly_difficulty_*."""
    __tablename__ = "difficulty_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)
    total_items = Column(Integer, default=0)                # itens enfileirados no início
    items_attempted = Column(Integer, default=0)            # acertos + erros (cada item conta 1 vez no fim)
    items_mastered_count = Column(Integer, default=0)       # quantos itens dominados (todos no fim, se completou)
    items_wrong_first_try = Column(JSON, nullable=True)     # ids dos que erraram na 1ª tentativa
    xp_earned = Column(Integer, default=0)
    week_completed_in_this_session = Column(Boolean, default=False)


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


class WordOccurrence(Base):
    """Atomic record: one row per distinct word used in a voice turn."""
    __tablename__ = "word_occurrences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    session_id = Column(String(36), nullable=False, index=True)  # UUID da sessão de voz
    word = Column(String(100), nullable=False, index=True)
    was_correct = Column(Boolean, nullable=False, default=True)
    error_type = Column(String(50), nullable=True)  # verb_tense, article, preposition, etc.
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class WordProfile(Base):
    """Aggregated per-user vocabulary stats — upserted at recap time."""
    __tablename__ = "word_profiles"
    __table_args__ = (UniqueConstraint("user_id", "word", name="unique_user_word"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    word = Column(String(100), nullable=False)
    total_uses = Column(Integer, default=0)
    correct_uses = Column(Integer, default=0)
    last_error_type = Column(String(50), nullable=True)
    first_seen_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    mastered = Column(Boolean, default=False)  # True quando accuracy >= 0.85 com >= 5 usos


class LessonScopeItem(Base):
    """Item do escopo (palavra ou frase) de uma aula do sistema "4 pontas".

    Tabela DEDICADA ao novo sistema de lições (frontend/assets/js/lessons-4p-*).
    Fica separada de WordProfile/PhraseError de propósito: aqueles são
    alimentados pelo chat de voz com regra própria (accuracy>=0.85). Aqui a
    "escada" é por ponta explícita — escreveu / ouviu-e-entendeu / falou:

        written_ok            → "aprendida" (entra no vocabulário da home)
        written + heard + spoken → "dominada"

    Um registro por (user, lesson_slug, item). Upsert a cada conclusão de aula.
    """
    __tablename__ = "lesson_scope_items"
    __table_args__ = (
        UniqueConstraint("user_id", "lesson_slug", "item_en", name="unique_user_scope_item"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_slug = Column(String(60), nullable=False, index=True)   # ex: "4p-cumprimentos"
    lesson_group = Column(String(4), nullable=True)                # A | B | C | D
    item_type = Column(String(10), nullable=False)                 # "word" | "phrase"
    item_en = Column(Text, nullable=False)                         # forma canônica em inglês
    item_pt = Column(Text, nullable=True)

    written_ok = Column(Boolean, default=False)                    # ponta ESCREVER
    heard_ok = Column(Boolean, default=False)                      # ponta OUVIR (compreensão)
    spoken_ok = Column(Boolean, default=False)                     # ponta FALAR

    status = Column(String(12), default="nova")                    # nova | aprendida | dominada
    first_learned_at = Column(DateTime, nullable=True)             # 1ª vez que virou "aprendida"
    dominated_at = Column(DateTime, nullable=True)                 # 1ª vez que virou "dominada"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LessonScopeCompletion(Base):
    """Marca quando o aluno CONCLUIU uma aula 4 pontas (chegou ao recap).

    O gate A1→A2 é "completar as N aulas do bloco" — conclusão = chegar ao
    recap, independente de quantos itens ficaram dominados. Um registro por
    (user, lesson_slug); upsert idempotente."""
    __tablename__ = "lesson_scope_completions"
    __table_args__ = (
        UniqueConstraint("user_id", "lesson_slug", name="unique_user_scope_completion"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_slug = Column(String(60), nullable=False, index=True)
    lesson_group = Column(String(4), nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ShadowLabResult(Base):
    """Um registro por sessão RANQUEADA de shadowing (não upsert — histórico).

    A trilha é linear e client-side (localStorage decide unlock); este
    registro é só a prova de sessão que credita XP e alimenta WordProfile
    (ver shadowing_controller.py). Sessões CASUAL nunca chegam aqui."""
    __tablename__ = "shadow_lab_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    track_slug = Column(String(60), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    words_correct = Column(Integer, default=0)
    words_total = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class ShadowLabPhrase(Base):
    """Domínio por FRASE dentro de uma faixa de shadowing (não por palavra).

    Uma frase aprovada (dentro do limiar de conclusão da faixa, não 100%
    perfeita — o reconhecimento ainda está em ajuste) numa sessão Ranqueada
    já vira "dominada" (PHRASE_SESSIONS_TO_MASTER=1 em shadowing_controller.py
    — cada faixa tem um único texto fixo hoje, então repetir a mesma sessão
    não é prova de domínio mais forte). Latch: uma vez dominada, não reverte.
    correct_sessions fica registrado para o dia em que houver variação real
    de texto por faixa e a régua puder subir de novo.

    Separada de LessonScopeItem de propósito — não é uma aula do bloco A1/A2,
    é uma faixa própria do Laboratório de Shadowing (textos corridos, não o
    escopo 8+5/10+6 das aulas). "dominada" aqui soma em phrases_mastered_total
    junto com scope4p_phrases_dominated, ver lessons_controller.py."""
    __tablename__ = "shadow_lab_phrases"
    __table_args__ = (
        UniqueConstraint("user_id", "track_slug", "sentence_index", name="unique_user_shadow_phrase"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    track_slug = Column(String(60), nullable=False, index=True)
    sentence_index = Column(Integer, nullable=False)     # posição da frase dentro de track.sentences
    sentence_en = Column(Text, nullable=False)
    correct_sessions = Column(Integer, default=0)        # sessões distintas com a frase 100% certa
    dominated = Column(Boolean, default=False)            # latch — não reverte
    last_correct_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ── Comunidade ────────────────────────────────────────────────────────
# Espaço público de tópicos: sugestões, correções de conteúdo, bugs,
# recursos e dúvidas. Não é chat — cada tópico é um item de pauta que a
# comunidade prioriza por voto e o time move pelos estados.

COMMUNITY_TYPES = ("feature", "correction", "bug", "resource", "question")
COMMUNITY_STATUSES = ("open", "in_progress", "resolved", "declined")


class CommunityTopic(Base):
    __tablename__ = "community_topics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(20), nullable=False, index=True)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="open", index=True)
    # Âncora opcional: correções apontam para o slug da aula (lessons-4p-data.js)
    lesson_slug = Column(String(60), nullable=True, index=True)
    tags = Column(JSON, nullable=True)
    # Contadores desnormalizados — o feed ordena por vote_count sem agregar votes
    vote_count = Column(Integer, nullable=False, default=0, index=True)
    comment_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    author = relationship("User")
    votes = relationship("CommunityVote", back_populates="topic", cascade="all, delete-orphan")
    comments = relationship("CommunityComment", back_populates="topic", cascade="all, delete-orphan")


class CommunityVote(Base):
    __tablename__ = "community_votes"
    __table_args__ = (
        UniqueConstraint("topic_id", "user_id", name="unique_community_vote"),
    )

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("community_topics.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("CommunityTopic", back_populates="votes")


class CommunityComment(Base):
    __tablename__ = "community_comments"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("community_topics.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(String(500), nullable=False)
    # Comentário gerado pelo sistema ao mudar de status — renderizado como nota, não fala de usuário
    is_system = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    topic = relationship("CommunityTopic", back_populates="comments")
    author = relationship("User")
