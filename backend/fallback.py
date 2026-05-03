"""
Graceful Fallback Strategy - Mantém UX mesmo quando APIs falham.
Implementa fallback responses predefinidas para scenarios de erro.
"""

import logging
from typing import Dict, Any, Optional
from enum import Enum

logger = logging.getLogger(__name__)


class ErrorScenario(Enum):
    """Tipos de erro que podem ocorrer."""
    RATE_LIMIT = "rate_limit"       # HTTP 429
    TIMEOUT = "timeout"              # Connection timeout
    API_ERROR = "api_error"           # 500+ errors
    UNKNOWN = "unknown"               # Unexpected error


class GraciousFallback:
    """
    Fornece respostas predefinidas para manter UX quando APIs falham.
    Cada modo (free, guided, shadow, dictation) tem suas respostas.
    """
    
    # Respostas predefinidas por modo
    FALLBACK_RESPONSES = {
        "free": {
            "rate_limit": "Give me a moment to think. Try again in a few seconds!",
            "timeout": "I'm thinking about what you said. Can you say it again?",
            "api_error": "I didn't quite get that. Can you repeat?",
            "unknown": "Sorry, I didn't catch that clearly. Say it again?",
        },
        "guided": {
            "rate_limit": "Let me gather my thoughts. One moment please!",
            "timeout": "I'm processing. Go ahead with your next answer!",
            "api_error": "Let me continue. What's your response?",
            "unknown": "Let's keep going. Try your next answer.",
        },
        "shadow": {
            "rate_limit": "Take a breath. Ready to try again?",
            "timeout": "Try repeating that phrase once more.",
            "api_error": "Listen and repeat carefully: ",
            "unknown": "Let's try again. Repeat after me: ",
        },
        "dictation": {
            "rate_limit": "Give me a moment. I'm ready for you!",
            "timeout": "I'm ready now. Listen carefully: ",
            "api_error": "Let me prepare. Here's what to write: ",
            "unknown": "Sorry, try listening again. Write: ",
        }
    }
    
    # Frases de shadowing para fallback (pre-gravadas ou simples)
    SHADOW_FALLBACK_PHRASES = {
        "a1": [
            "Hello. Your turn — repeat after me: Hello.",
            "I like coffee. Your turn — repeat after me: I like coffee.",
            "Good morning! Your turn — repeat after me: Good morning!",
            "My name is Sarah. Your turn — repeat after me: My name is Sarah.",
            "I'm happy. Your turn — repeat after me: I'm happy.",
        ],
        "a2": [
            "I went to the store. Your turn — repeat after me: I went to the store.",
            "She likes to read books. Your turn — repeat after me: She likes to read books.",
            "We have a big house. Your turn — repeat after me: We have a big house.",
            "They are playing outside. Your turn — repeat after me: They are playing outside.",
            "Yesterday I played tennis. Your turn — repeat after me: Yesterday I played tennis.",
        ],
        "b1": [
            "Although it was raining, we decided to go for a walk. Your turn — repeat after me: Although it was raining, we decided to go for a walk.",
            "I would have gone if I had known about it. Your turn — repeat after me: I would have gone if I had known about it.",
            "Unless you practice regularly, you won't improve. Your turn — repeat after me: Unless you practice regularly, you won't improve.",
            "If I were you, I would take this opportunity. Your turn — repeat after me: If I were you, I would take this opportunity.",
            "She's been living here for five years. Your turn — repeat after me: She's been living here for five years.",
        ],
        "b2": [
            "Not only did he pass the exam, but he scored the highest mark. Your turn — repeat after me: Not only did he pass the exam, but he scored the highest mark.",
            "Had I known the consequences, I would have made a different choice. Your turn — repeat after me: Had I known the consequences, I would have made a different choice.",
            "It's imperative that we address this issue immediately. Your turn — repeat after me: It's imperative that we address this issue immediately.",
            "The phenomenon of climate change is becoming increasingly evident. Your turn — repeat after me: The phenomenon of climate change is becoming increasingly evident.",
        ],
        "c1": [
            "The ambiguity inherent in the philosophical text necessitates careful exegesis. Your turn — repeat after me: The ambiguity inherent in the philosophical text necessitates careful exegesis.",
            "Notwithstanding the apparent contradictions, the author maintains thematic coherence. Your turn — repeat after me: Notwithstanding the apparent contradictions, the author maintains thematic coherence.",
        ],
        "c2": [
            "The esoteric nature of the discourse precludes facile comprehension. Your turn — repeat after me: The esoteric nature of the discourse precludes facile comprehension.",
            "Such obfuscatory rhetoric obfuscates rather than elucidates. Your turn — repeat after me: Such obfuscatory rhetoric obfuscates rather than elucidates.",
        ]
    }
    
    # Frases de dictation para fallback
    DICTATION_FALLBACK = {
        "a1": "Write: I like coffee.",
        "a2": "Write: She went to the store yesterday.",
        "b1": "Write: Although I studied hard, the exam was difficult.",
        "b2": "Write: Not only is he intelligent, but he's also very creative.",
        "c1": "Write: The phenomenon necessitates comprehensive analysis.",
        "c2": "Write: The obfuscatory rhetoric precludes perspicuous comprehension.",
    }
    
    @staticmethod
    def get_fallback_response(
        voice_mode: str,
        scenario: ErrorScenario,
        level: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retorna resposta fallback apropriada.
        
        Args:
            voice_mode: "free", "guided", "shadow", "dictation"
            scenario: Tipo de erro (RATE_LIMIT, TIMEOUT, etc)
            level: Level do usuário (a1-c2), necessário para shadow/dictation
        
        Returns:
            Dict com resposta fallback e metadata
        """
        mode = voice_mode.lower() or "free"
        scenario_key = scenario.value
        
        # Respostas padrão por modo
        if mode == "shadow":
            phrases = GraciousFallback.SHADOW_FALLBACK_PHRASES.get(level or "b1", 
                      GraciousFallback.SHADOW_FALLBACK_PHRASES["b1"])
            fallback_phrase = phrases[0]  # Usar primeira frase como fallback
            return {
                "response": fallback_phrase,
                "fallback": True,
                "error_scenario": scenario_key,
                "retry_after_ms": 2000 if scenario == ErrorScenario.RATE_LIMIT else 1000,
            }
        
        elif mode == "dictation":
            fallback_text = GraciousFallback.DICTATION_FALLBACK.get(level or "b1",
                           GraciousFallback.DICTATION_FALLBACK["b1"])
            return {
                "response": fallback_text,
                "fallback": True,
                "error_scenario": scenario_key,
                "retry_after_ms": 2000 if scenario == ErrorScenario.RATE_LIMIT else 1000,
            }
        
        else:
            # Free ou Guided mode
            responses = GraciousFallback.FALLBACK_RESPONSES.get(mode,
                       GraciousFallback.FALLBACK_RESPONSES["free"])
            fallback_msg = responses.get(scenario_key, responses["unknown"])
            
            return {
                "response": fallback_msg,
                "fallback": True,
                "error_scenario": scenario_key,
                "retry_after_ms": 5000 if scenario == ErrorScenario.RATE_LIMIT else 3000,
            }
    
    @staticmethod
    def log_fallback_usage(
        user_id: int,
        voice_mode: str,
        scenario: ErrorScenario,
        level: Optional[str] = None
    ):
        """Log de fallback para monitoramento."""
        logger.warning(
            f"[FALLBACK] user_id={user_id} | mode={voice_mode} | "
            f"scenario={scenario.value} | level={level}"
        )
