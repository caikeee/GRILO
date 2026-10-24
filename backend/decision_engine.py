"""
Decision Engine para Voice Chat - Classificação Inteligente de Requisições
Reduz consumo de tokens ao rotear requisições para o caminho mais eficiente.
"""

import re
from typing import Optional
from backend.schemas import ChatRequest

# Classificações de requisição (rota de processamento)
NO_LLM = "no_llm"              # 0 tokens API, resposta local (10-30ms)
LIGHT_LLM = "light_llm"        # contexto mínimo (histórico curto)
FULL_LLM = "full_llm"          # contexto completo (regras por nível + histórico)

# Utterances ultra-curtas que sempre retornam NO_LLM
COMPLETE_SHORT_UTTERANCES = {
    # English
    "hi", "hello", "hey", "yes", "no", "maybe", "sure", "ok", "okay",
    "thanks", "thank you", "good morning", "good afternoon", "good evening",
    "i do", "i don't", "i dont", "not yet", "me too", "same",
    "cool", "awesome", "nice", "yep", "nope", "really", "seriously",
    "what", "huh", "excuse me",
    # Portuguese
    "oi", "ola", "olá", "sim", "não", "talvez", "claro", "obrigado",
    "obrigada", "bom dia", "boa tarde", "boa noite", "eu sei", "ainda não",
    "ainda nao", "eu também", "eu tambem", "bacana", "legal", "blz", "blz",
    "isso", "isso mesmo", "certo", "beleza", "ok",
}

# Keywords que indicam modo conversação complexa
CONTEXT_REQUIRED_KEYWORDS = {
    "want", "like", "because", "although", "if", "when", "remember",
    "yesterday", "tomorrow", "about", "think", "feel", "believe",
    "quero", "gosto", "porque", "embora", "se", "quando", "lembro",
    "ontem", "amanhã", "sobre", "penso", "sinto", "acho",
}


def classify_voice_request(request: ChatRequest) -> str:
    """
    Classifica requisição em 0-2ms.
    Heurísticas determinísticas para máxima performance.
    """
    text = (request.message or "").strip().lower()
    word_count = len(text.split())
    level = (getattr(request, "level", None) or "b1").lower()

    # =========== HEURÍSTICA 1: Ultra-curtas ===========
    if word_count <= 2:
        normalized = re.sub(r"[^\w\s]", "", text)
        if normalized in COMPLETE_SHORT_UTTERANCES:
            return NO_LLM

    # =========== HEURÍSTICA 2: Opening turn ===========
    if text == "__voice_session_start__":
        return NO_LLM

    # =========== HEURÍSTICA 3: Modo shadow/dictation ===========
    voice_mode = (getattr(request, "voice_mode", None) or "free").lower()
    if voice_mode in ("shadow", "dictation"):
        return FULL_LLM

    # =========== HEURÍSTICA 4: STT baixa confiança → modelo MELHOR ===========
    # Filosofia "assume e flui": quando o STT esteve incerto, mandamos para o
    # FULL_LLM (70B) — é onde a IA tem mais chance de acertar a intenção provável
    # e responder com naturalidade, em vez de um palpite genérico do 8B.
    # (0.0 = "sem sinal de confiança"; não tratamos como incerteza aqui.)
    _stt_raw = getattr(request, "stt_confidence", None)
    stt_confidence = float(_stt_raw) if _stt_raw is not None else 0.0
    if 0.0 < stt_confidence < 0.72:
        return FULL_LLM

    # =========== HEURÍSTICA 5: Level-aware word count thresholds ===========
    # Adjust thresholds based on proficiency level to avoid mismatch
    # (A1 learner saying 3 words slowly ≠ C2 learner saying 3 words quickly)
    word_count_threshold = {
        "a1": 2, "a2": 3, "b1": 4, "b2": 5, "c1": 6, "c2": 7
    }.get(level, 4)

    if word_count < word_count_threshold:
        # Below threshold for level → LIGHT_LLM (fast + context-aware)
        return LIGHT_LLM

    # At or above threshold → FULL_LLM (better context matching)
    return FULL_LLM


def get_model_for_classification(
    classification: str,
    groq_tokens_remaining: Optional[int] = None
) -> str:
    """
    Retorna modelo Groq apropriado para classificação.
    Implementa downgrade elegante quando quota baixa.
    """
    # Fala de tutor é curta (≤12-30 palavras): modelo sem raciocínio responde em
    # ~0.25s contra ~0.6-1s do gpt-oss-120b, sem o risco de o raciocínio comer o
    # max_tokens e devolver vazio. Medido em 2026-10-24 na conta Groq do projeto.
    # Se o primário falhar, chat_concise_voice cai para VOICE_FALLBACK_MODEL.
    if classification == NO_LLM:
        return "LOCAL"
    return VOICE_PRIMARY_MODEL


VOICE_PRIMARY_MODEL = "qwen/qwen3.8-27b"
VOICE_FALLBACK_MODEL = "openai/gpt-oss-20b"
