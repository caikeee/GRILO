"""
Decision Engine para Voice Chat - Classificação Inteligente de Requisições
Reduz consumo de tokens ao rotear requisições para o caminho mais eficiente.
"""

import re
from enum import Enum
from typing import Optional, Dict, Any
from backend.schemas import ChatRequest


class VoiceRequestClassification(Enum):
    """Classificação de requisição para determinar rota de processamento."""
    NO_LLM = "no_llm"              # 0 tokens API, resposta local (10-30ms)
    CACHE_HIT = "cache_hit"        # Resposta em cache (0 tokens, <5ms)
    LIGHT_LLM = "light_llm"        # Mixtral 8x7b (200-300 tokens, 1-2s)
    FULL_LLM = "full_llm"          # Llama 70B (600-1000 tokens, 2-5s)


class VoiceRequestRouter:
    """
    Classifica requisições de voice chat antes de chamar LLM.
    Overhead: 0-2ms de processamento local.
    """
    
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
    
    # Filler words que indicam hesitação
    HESITATION_WORDS = {
        "um", "uh", "uhh", "hmm", "hm", "ah", "er", "erm", "like",
        "well", "so", "you know", "i mean",
        "tipo", "assim", "entao", "então", "sabe", "quer dizer",
    }
    
    def classify(self, request: ChatRequest) -> VoiceRequestClassification:
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
            if normalized in self.COMPLETE_SHORT_UTTERANCES:
                return VoiceRequestClassification.NO_LLM
        
        # =========== HEURÍSTICA 2: Opening turn ===========
        if text == "__voice_session_start__":
            return VoiceRequestClassification.NO_LLM
        
        # =========== HEURÍSTICA 3: Modo shadow/dictation ===========
        voice_mode = (getattr(request, "voice_mode", None) or "free").lower()
        if voice_mode in ("shadow", "dictation"):
            return VoiceRequestClassification.FULL_LLM
        
        # =========== HEURÍSTICA 4: STT baixa confiança ===========
        stt_confidence = getattr(request, "stt_confidence", None) or 1.0
        if stt_confidence < 0.72:
            return VoiceRequestClassification.LIGHT_LLM
        
        # =========== HEURÍSTICA 5: Level-aware word count thresholds ===========
        # Adjust thresholds based on proficiency level to avoid mismatch
        # (A1 learner saying 3 words slowly ≠ C2 learner saying 3 words quickly)
        word_count_threshold = {
            "a1": 2, "a2": 3, "b1": 4, "b2": 5, "c1": 6, "c2": 7
        }.get(level, 4)
        
        if word_count < word_count_threshold:
            # Below threshold for level → LIGHT_LLM (fast + context-aware)
            return VoiceRequestClassification.LIGHT_LLM
        
        elif word_count <= word_count_threshold + 3:
            # At or slightly above threshold → FULL_LLM (better context matching)
            return VoiceRequestClassification.FULL_LLM
        
        else:
            # Well above threshold (verbose) → always FULL
            return VoiceRequestClassification.FULL_LLM
    
    def get_model_for_classification(
        self, 
        classification: VoiceRequestClassification,
        groq_tokens_remaining: Optional[int] = None
    ) -> str:
        """
        Retorna modelo Groq apropriado para classificação.
        Implementa downgrade elegante quando quota baixa.
        """
        groq_tokens_remaining = groq_tokens_remaining or 100000
        
        if classification == VoiceRequestClassification.NO_LLM:
            return "LOCAL"
        
        elif classification == VoiceRequestClassification.LIGHT_LLM:
            return "llama-3.1-8b-instant"  # Rápido + barato

        elif classification == VoiceRequestClassification.FULL_LLM:
            if groq_tokens_remaining > 50000:
                return "llama-3.3-70b-versatile"  # Premium
            else:
                return "llama-3.1-8b-instant"  # Fallback rápido

        else:
            return "llama-3.1-8b-instant"  # Default seguro


# Instância global
voice_router = VoiceRequestRouter()
