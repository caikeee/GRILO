from pydantic import BaseModel, field_validator, Field
from typing import List, Dict, Optional, Any
from datetime import datetime


# Auth Schemas
class UserRegister(BaseModel):
    """User registration with validation (QW6)"""
    username: str = Field(..., min_length=3, max_length=50, description="3-50 characters")
    email: str = Field(..., pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")  # Email regex
    password: str = Field(..., min_length=8, max_length=255, description="Min 8 characters")
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        if not v.isalnum() and '_' not in v:
            raise ValueError('username must be alphanumeric with optional underscores')
        return v


class UserLogin(BaseModel):
    """User login with validation (QW6)"""
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=255)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str  # QW9: Refresh token
    token_type: str
    user: dict


class RefreshTokenRequest(BaseModel):  # QW9: Request model para refresh
    """Request body para POST /api/auth/refresh"""
    refresh_token: str = Field(..., min_length=10)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    level: int
    xp: int
    streak: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserProgressResponse(BaseModel):
    xp_daily: int
    streak_count: int
    total_conversations: int
    last_active_date: datetime
    
    class Config:
        from_attributes = True


# Learning Schemas
class ConversationMessageResponse(BaseModel):
    role: str  # "user" or "assistant"
    message: str
    translation: Optional[str] = None
    language: str
    xp: int
    timestamp: datetime
    
    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    """Chat request with input validation (QW6)"""
    message: str = Field(..., min_length=1, max_length=1000)
    language: Optional[str] = Field("pt", pattern="^(pt|en)$")  # "pt" or "en" only
    history: Optional[List[Dict[str, str]]] = None
    stt_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)  # 0-1 range
    
    # Voice chat advanced fields
    level: Optional[str] = Field("b1", pattern="^(a1|a2|b1|b2|c1|c2)$")  # CEFR levels only
    voice_mode: Optional[str] = Field("free", pattern="^(free|guided|shadow|dictation)$")
    conversation_topic: Optional[str] = Field(None, max_length=50)
    bilingual_mode: Optional[bool] = False
    input_bridge_mode: Optional[bool] = False
    shadow_mode: Optional["ShadowModeData"] = None
    
    @field_validator('message')
    @classmethod
    def validate_message_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty or whitespace only')
        return v.strip()
    
    @field_validator('conversation_topic')
    @classmethod
    def validate_topic_with_mode(cls, v, info):
        voice_mode = info.data.get('voice_mode')
        if voice_mode == 'guided' and not v:
            raise ValueError('conversation_topic MUST be set when voice_mode=guided (required: restaurant|airport|job|travel|doctor)')
        return v


class ShadowModeData(BaseModel):
    """Voice Help Shadowing - Pronunciation practice analytics."""
    expected_text: str  # Frase que o usuário foi instruído a falar
    user_attempts: int  # 1-3
    final_score: int  # 0-100
    pronunciation_errors: Optional[List[str]] = None  # Palavras com erro
    auto_progressed: bool = False  # True se esgotou 3 tentativas
    skipped: bool = False  # True se usuário clicou "Pular"
    reason: Optional[str] = None  # "max_attempts_exhausted" | None

    @field_validator("user_attempts")
    @classmethod
    def validate_attempts(cls, v):
        if not 1 <= v <= 3:
            raise ValueError("user_attempts deve estar entre 1 e 3")
        return v

    @field_validator("final_score")
    @classmethod
    def validate_score(cls, v):
        if not 0 <= v <= 100:
            raise ValueError("final_score deve estar entre 0 e 100")
        return v


class ChatResponse(BaseModel):
    response: str  # Response in opposite language
    translation: Optional[str] = None  # Translation (only when different from response)
    xp_earned: int
    vocabulary: Optional[List[Dict[str, str]]] = None  # Key words with translations
    level_up: Optional[bool] = False


class CompleteConversationRequest(BaseModel):
    bonus_xp: Optional[int] = 50


# Badge Schemas
class BadgeResponse(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    xp_threshold: int
    type: str
    
    class Config:
        from_attributes = True


class UserBadgeResponse(BaseModel):
    badge: BadgeResponse
    earned_at: datetime
    
    class Config:
        from_attributes = True


# Leaderboard Schemas
class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    level: int
    xp: int


class LessonQuestion(BaseModel):
    question: str
    correct_answer: str
    options: List[str]


class LessonResponse(BaseModel):
    id: int
    title: str
    description: str
    questions: List[Dict[str, Any]]
    status: str
    score: int = 0
    xp_earned: int = 0
    
    class Config:
        from_attributes = True


class LessonSubmitRequest(BaseModel):
    lesson_id: int
    answers: List[str]


class AnswerDetail(BaseModel):
    question: str
    user_answer: str
    correct_answer: str
    is_correct: bool


class LessonResultResponse(BaseModel):
    score: int
    xp_earned: int
    correct_answers: int
    total_questions: int
    answers_detail: List[AnswerDetail]


# ==================== NEW LESSON SCHEMAS (V2 - Rich Content Format) ====================

class ExerciseOption(BaseModel):
    label: str


class Exercise(BaseModel):
    type: str  # multiple_choice, fill_blank, translate, reorder_sentence, true_false
    question: str
    question_pt: Optional[str] = None  # PT-BR instruction hint shown to learner above EN question
    options: List[str]
    correct: Optional[int] = None
    answer: Optional[str] = None
    explanation: Optional[str] = None


class VocabularyItem(BaseModel):
    word: str
    translation: str
    example: Optional[str] = None


class Example(BaseModel):
    english: str
    portuguese: str


class LessonContent(BaseModel):
    learning_goal: Optional[str] = None
    story_context: Optional[str] = None
    why_it_matters: Optional[str] = None        # "Por que você vai usar isso na vida real"
    real_world_scenario: Optional[str] = None   # Mini-cena de abertura contextualizada
    introduction: str
    explanation: str
    cultural_insight: Optional[str] = None
    common_mistakes: Optional[List[str]] = None # Erros específicos de brasileiros neste ponto
    pronunciation_tip: Optional[str] = None     # Fonética informal em português
    examples: List[Example]
    vocabulary: List[VocabularyItem]
    notes: List[str]
    pro_tips: Optional[List[str]] = None
    exercises: List[Exercise]
    summary: List[str]


# ==================== WRITING MODE CHAT (Real-time Grammar Feedback) ====================

class CorrectionItem(BaseModel):
    """Single grammar/vocabulary correction"""
    original: str  # What user wrote
    corrected: str  # What they should have written
    error_type: str  # gerund_after_verb, article, tense, vocabulary, etc.
    explanation: str  # Why it's wrong + what rule applies
    severity: str = "medium"  # low, medium, high


class WritingFeedback(BaseModel):
    """Pedagogical feedback on user's writing"""
    title: str = "Dica natural"  # Always "Dica natural"
    emoji: str = "📝"  # Emoji for feedback card
    corrections: List[CorrectionItem]  # List of corrections
    accuracy_score: int  # 0-100 (based on error count vs message length)
    focus_area: Optional[str] = None  # e.g., "Gerunds", "Articles", "Tense"
    

class ChatWriteResponse(BaseModel):
    """Response for writing mode chat with feedback"""
    reply: str  # Natural conversational response from AI
    feedback: WritingFeedback  # Grammar/vocabulary corrections
    context: Optional[Dict[str, str]] = None  # metadata (topic, level, etc)
    xp_earned: int = 5  # XP for attempting to write
    total_xp: int = 0  # Updated total XP
    level_up: bool = False  # Whether user leveled up
    new_level: int = 1  # Current level after this message
    conversation_theme: Optional[str] = None  # Detected or confirmed conversation theme


class WritingChatRequest(BaseModel):
    """Request for writing mode chat"""
    message: str  # User's message in English
    level: str = "intermediate"  # beginner, intermediate, advanced
    history: Optional[List[Dict[str, str]]] = None  # Previous messages for context
    session_id: Optional[int] = None  # Conversation session ID
    focus_area: Optional[str] = None  # Last detected grammar focus area (for pedagogical continuity)
    conversation_theme: Optional[str] = None  # Detected conversation theme (travel, food, work, etc)
    message_count: int = 0  # Number of messages in this session (for micro-lesson trigger)

class UserStatsResponse(BaseModel):
    """Aggregated learning statistics for the authenticated user."""
    lessons_completed: int
    total_lessons: int
    avg_lesson_accuracy: float          # 0-100
    best_lesson_accuracy: Optional[float] = None   # 0-100
    total_xp: int
    level: int
    streak: int
    total_conversations: int
    writing_accuracy_avg: Optional[float] = None   # 0-100
    top_grammar_area: Optional[str] = None
    text_messages_sent: int = 0
    voice_minutes: float = 0.0


class LessonV2(BaseModel):
    id: int
    title: str
    level: str  # A1, A2, B1, etc
    lesson_type: str  # vocabulary, grammar, dialogue, etc
    categories: List[str]
    content: LessonContent


class LessonV2Response(BaseModel):
    success: bool
    lesson: LessonV2


class LessonListResponse(BaseModel):
    success: bool
    total: int
    lessons: List[LessonV2]


class CategoriesResponse(BaseModel):
    success: bool
    total_categories: int
    total_lessons: int
    categories: List[str]


class ExerciseSubmitRequest(BaseModel):
    exercise_index: int
    answer: str


class ExerciseSubmitResponse(BaseModel):
    success: bool
    correct: bool
    user_answer: str
    correct_answer: str
    xp_earned: int
    user_total_xp: int


# Translation & Legacy Schemas
class PerguntasRequest(BaseModel):
    texto_inicial: str


class ContinuacaoRequest(BaseModel):
    texto_inicial: str
    respostas: List[str]


class HistoriaRequest(BaseModel):
    inputs: List[str]


class BlocoRequest(BaseModel):
    bloco: str
    conteudo: str


class CombinarRequest(BaseModel):
    personagens: List[str]
    cenarios: List[str]
    contexto: List[str]
    conflitos: List[str]


class TranslationRequest(BaseModel):
    text: str
