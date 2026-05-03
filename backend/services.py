import os
import re
import unicodedata
import asyncio
import time as _time
from dotenv import load_dotenv
from fastapi import HTTPException
from groq import Groq
from backend.utils.prompts import prompt_perguntas, prompt_continuacao, prompt_historia, prompt_analise, prompt_sugestao, prompt_refinar_bloco, prompt_combinar_historias
from backend.schemas import ChatRequest
from backend.db_models import Conversation, User
from datetime import datetime
from sqlalchemy.orm import Session
import langdetect
import logging

# Import new optimization modules
from backend.decision_engine import voice_router, VoiceRequestClassification
from backend.voice_cache import voice_cache
from backend.fallback import GraciousFallback, ErrorScenario

logger = logging.getLogger(__name__)

# ==================== RAG — LAZY INITIALISATION ====================
# The vector store is loaded only after `python rag/ingest.py` has run.
# If the index is empty or libs are missing, RAG silently returns "".

_rag_store = None
_rag_store_loaded = False


def _get_rag_store():
    global _rag_store, _rag_store_loaded
    if _rag_store_loaded:
        return _rag_store
    _rag_store_loaded = True
    try:
        from rag.vector_store import RAGVectorStore
        store = RAGVectorStore()
        if store.is_indexed():
            _rag_store = store
            print(f"[RAG] Store ready — {store.stats()['total_chunks']} chunks")
        else:
            print("[RAG] Store empty — run 'python rag/ingest.py' to index PDFs")
    except Exception as e:
        print(f"[RAG] Unavailable (will skip): {e}")
    return _rag_store


def _fetch_rag_context_sync(query: str, level: str, k: int = 2) -> str:
    """Synchronous RAG retrieval — called via asyncio.to_thread."""
    store = _get_rag_store()
    if store is None:
        return ""
    try:
        results = store.search_by_level(query, level, k=k)
        relevant = [r for r in results if r["similarity_score"] >= 0.30]
        if not relevant:
            return ""
        return "\n\n".join(r["text"][:500] for r in relevant)
    except Exception as e:
        print(f"[RAG] Context fetch error: {e}")
        return ""

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = os.getenv("MODEL_NAME", "mixtral-8x7b-32768")

_PT_DETECTION_HINTS = {
    "oi", "ola", "tudo", "bem", "voce", "voces", "nao", "sim", "isso", "sobre", "comida", "comidas",
    "porque", "para", "pra", "obrigado", "obrigada", "tambem", "entao", "aqui", "agora", "fazer",
    "quero", "preciso", "gostaria", "tenho", "estou", "sou", "vou", "aprendi", "ingles", "portugues",
    "como", "posso", "praticar", "aprendendo", "ajuda", "meu", "minha", "seu", "sua", "assunto", "tema",
    "falar", "estudar", "estudo", "texto", "frase",
}

_EN_DETECTION_HINTS = {
    "the", "is", "are", "you", "your", "hello", "thanks", "thank", "please", "how", "can", "practice",
    "english", "what", "when", "where", "why", "this", "that", "my", "i", "me", "we", "they", "to",
    "for", "with", "do", "did", "does", "am", "was", "were", "have", "has", "about", "food", "foods",
    "study", "learn", "topic", "text", "sentence",
}

_VOICE_SHORT_COMPLETE_UTTERANCES = {
    "hi", "hello", "hey", "yes", "no", "maybe", "sure", "ok", "okay", "thanks", "thank you",
    "good morning", "good afternoon", "good evening", "i do", "i dont", "i don't", "not yet", "me too",
    "oi", "ola", "olá", "sim", "nao", "não", "talvez", "claro", "obrigado", "obrigada", "bom dia",
    "boa tarde", "boa noite", "eu sei", "ainda nao", "ainda não", "eu tambem", "eu também",
}

_VOICE_INCOMPLETE_TRAILING_WORDS = {
    "and", "but", "because", "so", "if", "when", "that", "with", "for", "to",
    "e", "mas", "porque", "entao", "então", "se", "quando", "que", "com", "para", "pra",
}

_VOICE_FILLER_WORDS = {
    "um", "uh", "hmm", "ah", "er", "like", "well", "so", "tipo", "assim", "entao", "então",
}

# ==================== NO_LLM RESPONSES (Decision Engine) ====================
# Respostas predefinidas para utterances ultra-curtas - 0 API tokens consumidos
_NO_LLM_RESPONSES = {
    # English greetings
    "hi": "Hello! How can I help you practice today?",
    "hello": "Hi there! Ready to learn?",
    "hey": "Hey! What would you like to practice?",
    "thanks": "You're welcome!",
    "thank you": "Happy to help!",
    "yes": "Awesome!",
    "no": "No problem, try again.",
    "maybe": "Let's give it a try!",
    "sure": "Great! Let's go.",
    "ok": "Perfect! Ready?",
    "okay": "Wonderful! Let's begin.",
    "good morning": "Good morning! Ready to practice?",
    "good afternoon": "Good afternoon! Shall we begin?",
    "good evening": "Good evening! Let's learn together.",
    "i don't know": "No pressure! Use simple words.",
    "i dont know": "No pressure! Use simple words.",
    "not sure": "Take your time. What would you like to say?",
    "um": "Go ahead, I'm listening.",
    "uh": "I'm here. What's on your mind?",
    # Portuguese greetings
    "oi": "Oi! Vamos praticar inglês agora?",
    "ola": "Olá! Pronto para aprender?",
    "olá": "Olá! Pronto para aprender?",
    "sim": "Ótimo!",
    "não": "Sem problema, tenta de novo.",
    "nao": "Sem problema, tenta de novo.",
    "talvez": "Vamos tentar sim!",
    "claro": "Perfeito! Vamos?",
    "obrigado": "De nada!",
    "obrigada": "De nada!",
    "bom dia": "Bom dia! Pronto para praticar?",
    "boa tarde": "Boa tarde! Vamos começar?",
    "boa noite": "Boa noite! Aprendemos juntos?",
    "não sei": "Sem pressa! Use palavras simples.",
    "nao sei": "Sem pressa! Use palavras simples.",
}

_ROMANCE_LANG_CODES = {"es", "fr", "it", "ca", "gl", "ro"}
_VOICE_CORRECTION_ERROR_TYPES = {
    "article",
    "gerund_after_verb",
    "verb_tense",
    "word_choice",
    "preposition",
    "subject_verb_agreement",
    "capitalization",
    "spelling",
    "unknown",
}

async def translate_pt_to_en(text: str):
    """
    Translate Portuguese text to English for immersion mode
    Using Groq API with a direct prompt
    """
    try:
        prompt = f"""Translate this Portuguese sentence to English. 
Return ONLY the translated text, nothing else.

Portuguese: "{text}"
English:"""
        
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=150
        )
        
        translation = response.choices[0].message.content.strip()
        return translation
    except Exception as e:
        print(f"[TRANSLATE-PT-EN ERROR] {str(e)}")
        # Fallback: return original text if translation fails
        return text


def _normalize_language_code(lang: str) -> str:
    """Normalize language codes and aliases to short internal codes."""
    value = (lang or "").strip().lower().replace("_", "-")

    if value in ("pt", "pt-br", "pt-pt", "portuguese", "portugues", "português", "br"):
        return "pt"
    if value in ("en", "en-us", "en-gb", "english", "ingles", "inglês"):
        return "en"

    if "pt" in value:
        return "pt"
    if "en" in value:
        return "en"

    return value[:2] if value else "en"


def _language_display_name(lang_code: str) -> str:
    if lang_code == "pt":
        return "Brazilian Portuguese"
    if lang_code == "en":
        return "English"
    return lang_code


def _normalize_voice_correction_type(value: str | None) -> str:
    normalized = (value or "unknown").strip().lower()
    return normalized if normalized in _VOICE_CORRECTION_ERROR_TYPES else "unknown"


def _normalize_for_language_detection(text: str) -> str:
    normalized = unicodedata.normalize("NFD", text.lower())
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn")


def detect_language_from_text(text: str) -> dict:
    """Detect language code and confidence from raw text input."""
    sample = (text or "").strip()
    if not sample:
        return {
            "language": "unknown",
            "confidence": 0.0,
            "is_portuguese": False,
            "primary_language": None,
            "word_count": 0,
            "mixed_ratio": 0.0,
        }

    normalized_text = _normalize_for_language_detection(sample)
    words = re.findall(r"[a-z]+", normalized_text)
    word_count = len(words)
    pt_hits = sum(1 for word in words if word in _PT_DETECTION_HINTS)
    en_hits = sum(1 for word in words if word in _EN_DETECTION_HINTS)

    has_pt_accents = bool(re.search(r"[àáâãçéêíóôõú]", sample.lower()))
    if has_pt_accents:
        accented_language = "mixed" if en_hits > 0 else "pt"
        return {
            "language": accented_language,
            "confidence": 0.99,
            "is_portuguese": accented_language == "pt",
            "pt_hits": pt_hits,
            "en_hits": en_hits,
            "primary_language": "pt",
            "word_count": word_count,
            "mixed_ratio": round(min(pt_hits, en_hits) / max(pt_hits, en_hits), 4) if pt_hits > 0 and en_hits > 0 else 0.0,
        }

    try:
        candidates = langdetect.detect_langs(sample)
    except Exception:
        candidates = []

    if not candidates:
        return {
            "language": "unknown",
            "confidence": 0.0,
            "is_portuguese": False,
            "primary_language": None,
            "word_count": word_count,
            "mixed_ratio": 0.0,
        }

    lang_scores = {}
    for candidate in candidates:
        normalized_candidate = _normalize_language_code(getattr(candidate, "lang", ""))
        confidence_candidate = float(getattr(candidate, "prob", 0.0) or 0.0)
        if not normalized_candidate:
            continue
        previous = lang_scores.get(normalized_candidate, 0.0)
        if confidence_candidate > previous:
            lang_scores[normalized_candidate] = confidence_candidate

    top_candidate = candidates[0]
    detected_language = _normalize_language_code(getattr(top_candidate, "lang", ""))
    detected_confidence = float(getattr(top_candidate, "prob", 0.0) or 0.0)

    pt_prob = lang_scores.get("pt", 0.0)
    en_prob = lang_scores.get("en", 0.0)

    pt_score = pt_prob + (min(pt_hits, 4) * 0.17) - (min(en_hits, 3) * 0.08)
    en_score = en_prob + (min(en_hits, 4) * 0.17) - (min(pt_hits, 3) * 0.08)

    if pt_hits >= 1 and en_hits == 0 and word_count <= 3:
        pt_score += 0.28
    if en_hits >= 1 and pt_hits == 0 and word_count <= 3:
        en_score += 0.2
    if detected_language in _ROMANCE_LANG_CODES and pt_hits >= 1 and en_hits == 0:
        pt_score += 0.18

    score_gap = abs(pt_score - en_score)
    mixed_ratio = 0.0
    if pt_hits > 0 and en_hits > 0:
        mixed_ratio = round(min(pt_hits, en_hits) / max(pt_hits, en_hits), 4)

    if pt_hits > 0 and en_hits > 0 and score_gap < 0.18:
        normalized = "mixed"
        primary_language = "pt" if pt_score > en_score else ("en" if en_score > pt_score else None)
        confidence = min(0.98, max(pt_score, en_score, detected_confidence))
    elif pt_score >= en_score + 0.12:
        normalized = "pt"
        primary_language = "pt"
        confidence = min(1.0, max(pt_score, detected_confidence))
    elif en_score >= pt_score + 0.12:
        normalized = "en"
        primary_language = "en"
        confidence = min(1.0, max(en_score, detected_confidence))
    else:
        normalized = detected_language
        primary_language = normalized if normalized in {"pt", "en"} else None
        confidence = detected_confidence
        if normalized not in {"pt", "en"} and pt_hits >= 2 and en_hits == 0:
            normalized = "pt"
            primary_language = "pt"
            confidence = max(confidence, 0.62)
        elif normalized not in {"pt", "en"} and pt_hits > 0 and en_hits > 0:
            normalized = "mixed"
            primary_language = "pt" if pt_hits > en_hits else ("en" if en_hits > pt_hits else None)
            confidence = max(confidence, 0.62)

    return {
        "language": normalized,
        "confidence": round(confidence, 4),
        "is_portuguese": normalized == "pt",
        "pt_hits": pt_hits,
        "en_hits": en_hits,
        "primary_language": primary_language,
        "word_count": word_count,
        "mixed_ratio": mixed_ratio,
    }


def _extract_voice_focus_fragment(text: str, limit: int = 4) -> str:
    normalized_text = _normalize_for_language_detection(text or "")
    words = re.findall(r"[a-z]+", normalized_text)
    relevant_words = [
        word for word in words
        if word not in _VOICE_FILLER_WORDS and word not in _VOICE_INCOMPLETE_TRAILING_WORDS
    ]
    return " ".join(relevant_words[:limit]).strip()


def _analyze_voice_understanding(text: str, detected_input: dict, stt_confidence: float) -> dict:
    sample = (text or "").strip()
    normalized_sample = _normalize_for_language_detection(sample)
    words = re.findall(r"[a-z]+", normalized_sample)
    word_count = detected_input.get("word_count") or len(words)
    language = detected_input.get("language") or "unknown"
    primary_language = detected_input.get("primary_language")
    confidence = float(stt_confidence or 0.0)
    normalized_phrase = " ".join(words).strip()
    trailing_word = words[-1] if words else ""
    focus_fragment = _extract_voice_focus_fragment(sample)

    if not sample:
        return {
            "status": "unclear",
            "reason": "empty_input",
            "clarification_needed": True,
            "input_language": "unknown",
            "primary_language": None,
            "understood_fragment": "",
            "note_pt": "Nao entendi nada da frase. Repita em uma frase curta.",
        }

    if confidence < 0.74:
        return {
            "status": "unclear",
            "reason": "low_confidence",
            "clarification_needed": True,
            "input_language": language,
            "primary_language": primary_language,
            "understood_fragment": focus_fragment,
            "note_pt": "Nao entendi com seguranca. Repita em uma frase curta.",
        }

    if language == "unknown" and confidence < 0.9:
        return {
            "status": "unclear",
            "reason": "unknown_language",
            "clarification_needed": True,
            "input_language": language,
            "primary_language": primary_language,
            "understood_fragment": focus_fragment,
            "note_pt": "A frase ficou ambigua. Repita em uma frase curta.",
        }

    if normalized_phrase in _VOICE_SHORT_COMPLETE_UTTERANCES:
        return {
            "status": "clear",
            "reason": None,
            "clarification_needed": False,
            "input_language": language,
            "primary_language": primary_language,
            "understood_fragment": focus_fragment,
            "note_pt": "",
        }

    if word_count <= 1 and normalized_phrase not in _VOICE_SHORT_COMPLETE_UTTERANCES:
        return {
            "status": "partial",
            "reason": "short_fragment",
            "clarification_needed": True,
            "input_language": language,
            "primary_language": primary_language,
            "understood_fragment": focus_fragment,
            "note_pt": "Entendi so um pedaco. Repita a ideia inteira em uma frase curta.",
        }

    if trailing_word in _VOICE_INCOMPLETE_TRAILING_WORDS:
        return {
            "status": "partial",
            "reason": "unfinished_phrase",
            "clarification_needed": True,
            "input_language": language,
            "primary_language": primary_language,
            "understood_fragment": focus_fragment,
            "note_pt": "A frase pareceu incompleta. Repita a ideia inteira em uma frase curta.",
        }

    if language == "mixed":
        return {
            "status": "mixed",
            "reason": "mixed_languages",
            "clarification_needed": False,
            "input_language": language,
            "primary_language": primary_language,
            "understood_fragment": focus_fragment,
            "note_pt": "Frase mista PT + EN detectada. Entendi a ideia e segui em ingles.",
        }

    return {
        "status": "clear",
        "reason": None,
        "clarification_needed": False,
        "input_language": language,
        "primary_language": primary_language,
        "understood_fragment": focus_fragment,
        "note_pt": "",
    }


async def _build_voice_clarification_result(understanding: dict, bilingual_mode: bool) -> dict:
    fragment = (understanding.get("understood_fragment") or "").strip()
    status = understanding.get("status")

    if status == "partial" and fragment:
        reply = f'I caught "{fragment}". Say the full idea in one short sentence.'
    elif status == "partial":
        reply = "I only caught part of that. Say the full idea in one short sentence."
    else:
        reply = "I did not catch that clearly. Say it again in one short sentence."

    translation_pt = None
    if bilingual_mode:
        translation_pt = await translate_with_direction(reply, "en", "pt")

    return {
        "reply": reply,
        "translation_pt": translation_pt,
        "correction": None,
        "understanding": understanding,
        "detected_input": {
            "language": understanding.get("input_language") or "unknown",
            "primary_language": understanding.get("primary_language"),
        },
    }


async def translate_with_direction(text: str, from_lang: str = "pt", to_lang: str = "en") -> str:
    """
    Translate text using explicit source/target language direction.
    Supports immersion use-cases such as PT->EN and EN->PT.
    """
    try:
        if not text:
            return text

        source = _normalize_language_code(from_lang)
        target = _normalize_language_code(to_lang)

        if source == target:
            return text

        # Keep existing specialized path for the most common immersion direction.
        if source == "pt" and target == "en":
            return await translate_pt_to_en(text)

        source_name = _language_display_name(source)
        target_name = _language_display_name(target)

        prompt = f"""Translate the text below from {source_name} to {target_name}.
Return ONLY the translated text, nothing else.

Text: \"{text}\"
Translation:"""

        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=220
        )

        translation = response.choices[0].message.content.strip()
        return translation or text
    except Exception as e:
        print(f"[TRANSLATE-DIRECTION ERROR] {str(e)}")
        return text


# ==================== VOICE CHAT - CONCISE RESPONSES ====================

# ---------- MINIMAL SYSTEM PROMPTS (optimized for token usage) ----------
MINIMAL_SYSTEM_PROMPT = """You are a friendly English tutor for beginners.
Your job:
1. Respond in English only.
2. Keep it short: 1-2 sentences max (40-80 words).
3. ALWAYS acknowledge what the student just said - echo one key word or idea.
4. Continue naturally about THAT topic they mentioned.
5. Ask one simple follow-up question about what they said.
6. Be warm and encouraging.
7. Correct errors naturally by modeling the right form.
Example: If student says "I like pizza", you say "Pizza is delicious! Do you like..." NOT "Food is fun. Choose...". Always show you understood FIRST.
Respond conversationally, as if chatting with a friend."""

# Inject level context dynamically (20-30 tokens instead of 200)
_LEVEL_CONTEXT_INJECTION = {
    "a1": "[LEVEL: A1 BEGINNER] Use only present tense and simple vocabulary. Max 10 words per sentence.",
    "a2": "[LEVEL: A2 ELEMENTARY] Use present & past simple. Max 15 words per sentence.",
    "b1": "[LEVEL: B1 INTERMEDIATE] Natural conversation. 1-2 sentences, natural pace.",
    "b2": "[LEVEL: B2 UPPER-INT] Use idioms naturally. Can discuss opinions.",
    "c1": "[LEVEL: C1 ADVANCED] Native-like. Discuss nuances and complex ideas.",
    "c2": "[LEVEL: C2 FLUENT] No simplification. Sophisticated discourse.",
}

# ---------- Level-aware instruction sets (FULL_LLM only) ----------
_LEVEL_VOICE_RULES: dict = {
    "a1": (
        "You are coaching an absolute beginner (A1) in a voice lesson.\n"
        "STRICT MICRO-TURN RULES:\n"
        "1. FIRST - Echo one key word from what they said to show understanding.\n"
        "2. Keep replies very short: 1-2 sentences, max 10 words each.\n"
        "3. Use simple present and very common vocabulary only.\n"
        "4. Ask one simple follow-up about what they just said.\n"
        "5. Be encouraging. Do not lecture.\n"
        "6. Never overload: one objective per turn.\n"
        "EXAMPLE: Student: 'I like cats'. You: 'Cats! Nice! Do you have a cat?'"
    ),
    "a2": (
        "You are coaching an elementary learner (A2) in a voice lesson.\n"
        "RULES:\n"
        "1. Keep replies concise: 1-2 short sentences.\n"
        "2. Use present and past simple only.\n"
        "3. Ask only one short question per turn.\n"
        "4. If user hesitates, offer two short options to pick from.\n"
        "5. Keep momentum high and corrections minimal."
    ),
    "b1": (
        "You are a friendly English conversation partner helping an intermediate learner (B1 level).\n"
        "RULES:\n"
        "1. ALWAYS respond in English only — this is immersion practice.\n"
        "2. Keep responses to 1-2 short sentences (max 120 tokens). You will be read aloud.\n"
        "3. No markdown, no lists, no bullet points — natural spoken language only.\n"
        "4. If the user speaks Portuguese, respond in English and naturally model the correct English phrase.\n"
        "5. Be warm and conversational. Correct errors by modeling the right form in double quotes.\n"
        "6. If asked to explain something complex, give the short essential answer and offer to elaborate."
    ),
    "b2": (
        "You are an engaging English conversation partner for an upper-intermediate learner (B2 level).\n"
        "RULES:\n"
        "1. Respond in English only. Natural conversational pace and vocabulary.\n"
        "2. 1-3 sentences per reply. Use idioms and collocations naturally where appropriate.\n"
        "3. Correct errors subtly — rephrase their idea correctly in your reply without drawing attention to it.\n"
        "4. Challenge the learner gently: ask follow-up questions that require opinion or reasoning.\n"
        "5. No markdown or bullet points — pure spoken English."
    ),
    "c1": (
        "You are a sophisticated English conversation partner for an advanced learner (C1 level).\n"
        "RULES:\n"
        "1. Respond in natural, fluent English. Use varied vocabulary including phrasal verbs, idioms, nuanced expressions.\n"
        "2. 1-3 sentences. Engage intellectually — discuss nuances, opinions, hypotheticals.\n"
        "3. Only correct significant errors; focus on flow and sophistication over accuracy.\n"
        "4. Push the learner to express complex ideas clearly. Ask open-ended questions.\n"
        "IDIOM/PHRASAL VERB EXAMPLES:\n"
        "- Student: 'I'm fed up with studying' → You: 'Fed up? That happens when coursework feels relentless. What subject is draining you most?'\n"
        "- Student: 'I'll give it a shot' → You: 'Give it a shot—I appreciate that determination. What's your strategy if it doesn't work initially?'"
    ),
    "c2": (
        "You are a native-level English conversation partner for a near-fluent learner (C2 level).\n"
        "RULES:\n"
        "1. Speak as you would to a native speaker. No simplification.\n"
        "2. Use full range of vocabulary including formal, informal, literary, and colloquial registers as fits context.\n"
        "3. Engage in sophisticated discourse — debate, storytelling, abstract analysis.\n"
        "4. Only flag truly rare or stylistic errors; treat the learner as a peer.\n"
        "SOPHISTICATED EXAMPLES:\n"
        "- Student: 'The pandemic fundamentally altered our perception of remote work' → You: 'Altered—but did it?" Some argue it merely expedited an inevitable shift. How do you assess the permanence of these changes?'\n"
        "- Student: 'I find linguistic nuances fascinating' → You: 'Absolutely—that's the hallmark of someone moving beyond competence into genuine fluency. What language phenomenon captivates you most lately?'"
    ),
}

# ---------- Guided topic scripts ----------
_GUIDED_TOPIC_SCRIPTS: dict = {
    "restaurant": (
        "SCENARIO: You are a friendly waiter/waitress at a restaurant. The learner is a customer.\n"
        "SCRIPT PROGRESSION (follow this order, advancing when user responds adequately):\n"
        "Step 1: Greet and ask if they have a reservation.\n"
        "Step 2: Show them to a table and hand them the menu.\n"
        "Step 3: Take their drink order.\n"
        "Step 4: Ask if they are ready to order food.\n"
        "Step 5: Confirm the order, ask about allergies.\n"
        "Step 6: Ask if they enjoyed the meal.\n"
        "Step 7: Bring the bill and say goodbye.\n"
        "IMPORTANT: If the learner seems stuck, gently provide a vocabulary hint in parentheses."
    ),
    "airport": (
        "SCENARIO: You are a friendly airport check-in agent. The learner is a passenger.\n"
        "SCRIPT PROGRESSION:\n"
        "Step 1: Ask for their passport and booking reference.\n"
        "Step 2: Ask about checked luggage (number of bags, weight).\n"
        "Step 3: Ask preferred seat (window/aisle).\n"
        "Step 4: Explain boarding gate and time.\n"
        "Step 5: Ask if they have any liquids or prohibited items.\n"
        "Step 6: Wish them a pleasant flight.\n"
        "IMPORTANT: Use real airport vocabulary naturally (boarding pass, departure lounge, customs)."
    ),
    "job": (
        "SCENARIO: You are a friendly HR interviewer. The learner is the job candidate.\n"
        "SCRIPT PROGRESSION:\n"
        "Step 1: Welcome them, ask them to tell you about themselves.\n"
        "Step 2: Ask about their previous work experience.\n"
        "Step 3: Ask why they want this position.\n"
        "Step 4: Ask about a challenge they faced and how they solved it.\n"
        "Step 5: Ask about their strengths and one area to improve.\n"
        "Step 6: Ask if they have any questions for the company.\n"
        "Step 7: Thank them and explain next steps.\n"
        "IMPORTANT: Use professional but conversational English. Praise well-structured answers."
    ),
    "travel": (
        "SCENARIO: You are a helpful local giving directions and travel tips to a tourist (the learner).\n"
        "SCRIPT PROGRESSION:\n"
        "Step 1: Ask where they are trying to go.\n"
        "Step 2: Give simple directions using landmarks.\n"
        "Step 3: Recommend a nearby attraction.\n"
        "Step 4: Suggest local food to try.\n"
        "Step 5: Warn about any travel tips (e.g., closing times, busy periods).\n"
        "Step 6: Ask if they need any other help.\n"
        "IMPORTANT: Use natural directional language (turn left, go straight, take the second right)."
    ),
    "doctor": (
        "SCENARIO: You are a calm and professional doctor. The learner is the patient.\n"
        "SCRIPT PROGRESSION:\n"
        "Step 1: Welcome the patient, ask what brings them in today.\n"
        "Step 2: Ask about their symptoms (when did it start, how severe).\n"
        "Step 3: Ask if they have any allergies or take any medication.\n"
        "Step 4: Do a simple verbal examination (does it hurt here? any fever?).\n"
        "Step 5: Explain your diagnosis in simple terms.\n"
        "Step 6: Prescribe treatment and explain dosage.\n"
        "Step 7: Tell them to come back if symptoms worsen.\n"
        "IMPORTANT: Use simple medical vocabulary. Always be calm and reassuring."
    ),
}

# Simple in-memory cache for voice chat responses (shared across users)
_voice_chat_cache = {}


def compute_shadow_score(original: str, transcript: str) -> float:
    """
    Compare a target phrase (original) with user's repetition (transcript).
    Returns similarity 0.0–1.0 using difflib SequenceMatcher.
    """
    import difflib
    if not original or not transcript:
        return 0.0
    import re as _re
    def _norm(s: str) -> str:
        return _re.sub(r"[^a-z0-9 ]", "", s.lower().strip())
    return round(difflib.SequenceMatcher(None, _norm(original), _norm(transcript)).ratio(), 3)


async def chat_concise_voice(request: ChatRequest) -> dict:
    """
    Chat optimizado para voz com Decision Engine:
    - NO_LLM: 0 tokens (respostas locais ultra-rápidas)
    - CACHE_HIT: 0 tokens (cache inteligente)
    - LIGHT_LLM: 200-300 tokens (Mixtral rápido)
    - FULL_LLM: 600-1000 tokens (Llama 70B complexo)
    
    Target: <2s latência, -66% tokens vs baseline
    """
    try:
        # ======== EXTRAIR FIELDS BÁSICOS ========
        level = (getattr(request, "level", None) or "b1").lower().strip()
        if level not in _LEVEL_VOICE_RULES:
            level = "b1"
        voice_mode = (getattr(request, "voice_mode", None) or "free").lower().strip()
        bilingual_mode = bool(getattr(request, "bilingual_mode", False))
        stt_confidence = getattr(request, "stt_confidence", None) or 1.0
        is_opening_turn = (request.message or "").strip() == "__voice_session_start__"
        
        # ======== DECISION ENGINE: Classificar requisição ========
        classification = voice_router.classify(request)
        logger.info(f"[CLASSIFICATION] {classification.value} | text: {request.message[:40]}...")
        
        # ======== ROTA 1: NO_LLM (Resposta local - 0 API tokens) ========
        if classification == VoiceRequestClassification.NO_LLM:
            normalized = request.message.strip().lower()
            if normalized in _NO_LLM_RESPONSES:
                reply = _NO_LLM_RESPONSES[normalized]
                logger.info(f"[NO-LLM] Resposta local: {reply[:40]}...")
                
                translation_pt = None
                if bilingual_mode:
                    try:
                        translation_pt = await translate_with_direction(reply, "en", "pt")
                    except Exception as e:
                        logger.warning(f"[TRANSLATION-ERROR] {str(e)}")
                
                return {
                    "reply": reply,
                    "translation_pt": translation_pt,
                    "correction": None,
                    "understanding": {"status": "clear", "clarification_needed": False},
                    "detected_input": {"language": "en"},
                }
        
        # ======== ROTA 2: CACHE HIT (0 API tokens) ========
        cache_key = voice_cache.compute_key(
            request.message or "",
            level,
            voice_mode
        )
        
        cached_response = await voice_cache.get(cache_key)  # Now async with latency
        if cached_response and not bilingual_mode and not is_opening_turn:
            logger.info(f"[CACHE-HIT] Usando resposta em cache | key: {cache_key[:40]}...")
            return cached_response
        
        # ======== Análise comum para LIGHT_LLM e FULL_LLM ========
        detected_input = detect_language_from_text(request.message or "")
        request_language = _normalize_language_code(getattr(request, "language", "") or "")
        detected_input_language = detected_input.get("language") or "unknown"
        primary_input_language = detected_input.get("primary_language")
        user_input_language = detected_input_language
        if user_input_language not in {"pt", "en", "mixed"}:
            user_input_language = request_language if request_language in {"pt", "en"} else "unknown"
        understanding = _analyze_voice_understanding(request.message or "", detected_input, stt_confidence)
        
        if not is_opening_turn and understanding.get("clarification_needed"):
            logger.info(f"[CLARIFICATION] Needed | reason: {understanding.get('reason')}")
            return await _build_voice_clarification_result(understanding, bilingual_mode)

        
        if not is_opening_turn and understanding.get("clarification_needed"):
            logger.info(f"[CLARIFICATION] Needed | reason: {understanding.get('reason')}")
            return await _build_voice_clarification_result(understanding, bilingual_mode)
        
        # ======== ROTA 3 & 4: LLM CALLS (LIGHT ou FULL) ========
        # Force FULL_LLM for opening turn to enable personalized kickoff
        if is_opening_turn:
            classification = VoiceRequestClassification.FULL_LLM
            logger.info(f"[CLASSIFICATION-OVERRIDE] Opening turn forced to FULL_LLM for personalized kickoff")
        
        # Selecionar modelo baseado em classificação
        model_name = voice_router.get_model_for_classification(classification, groq_tokens_remaining=100000)
        logger.info(f"[MODEL-SELECTION] {model_name} | classification: {classification.value}")
        
        # ======== BUILD CONTEXT: Sistema Prompt + Histórico ========
        input_bridge_mode = bool(getattr(request, "input_bridge_mode", False))
        conversation_topic = getattr(request, "conversation_topic", None)
        is_beginner = level in ("a1", "a2")
        
        # Estratégia de histórico diferente por classificação
        messages = []
        
        if classification == VoiceRequestClassification.LIGHT_LLM:
            # LIGHT_LLM: Último turno de histórico para contexto mínimo (mantém naturalidade)
            system_msg = MINIMAL_SYSTEM_PROMPT
            
            # Vary echo pattern based on conversation length to avoid monotony
            # After 3+ exchanges, allow bot to sometimes assume known context
            turn_count = len(request.history or [])
            if turn_count > 6:  # After ~3 exchanges
                system_msg += "\n[VARIATION] After acknowledging context is clear, sometimes assume known information to avoid repetition."
            
            # Injetar contexto de level dinamicamente
            if level in _LEVEL_CONTEXT_INJECTION:
                system_msg += "\n" + _LEVEL_CONTEXT_INJECTION[level]
            
            # Adicionar último turno do histórico para manter continuidade (3-5 turnos = ~30-50 tokens)
            if request.history and len(request.history) > 0:
                last_turns = request.history[-2:] if len(request.history) > 1 else request.history[-1:]
                for item in last_turns:
                    messages.append({"role": item.get("role", "user"), "content": item.get("content", "")})
                logger.info(f"[LIGHT-LLM] Com mini-histórico ({len(last_turns)} turno(s)) | tokens: ~80-130")
            else:
                logger.info(f"[LIGHT-LLM] Sem histórico disponível | tokens: ~50-100")
        else:
            # FULL_LLM: Histórico limitado (últimas 10 turns)
            if request.history:
                history_slice = request.history[-10:] if len(request.history) > 10 else request.history
                for item in history_slice:
                    messages.append({"role": item.get("role", "user"), "content": item.get("content", "")})
                logger.info(f"[FULL-LLM] Com histórico: {len(history_slice)} turns")
            
            # FULL_LLM: Use detailed system prompt
            system_msg = _LEVEL_VOICE_RULES.get(level, _LEVEL_VOICE_RULES["b1"])
            
            # Vary echo pattern based on conversation length to avoid monotony
            turn_count = len(request.history or [])
            if turn_count > 6:  # After ~3 exchanges, already established context
                system_msg += "\n[VARIATION] You can now assume context is understood. Mix strategies: sometimes echo, sometimes build on what's known. Avoid repetition."
            else:  # Early in conversation, echo is important
                system_msg += "\n[EARLY-STAGE] Echo and acknowledge to build clarity. First-turn clarity is critical."
            
            # Injetar scripts de modo
            if voice_mode == "guided" and conversation_topic:
                script = _GUIDED_TOPIC_SCRIPTS.get(conversation_topic)
                if script:
                    system_msg += f"\n\n--- GUIDED SCENARIO ---\n{script}"
            elif voice_mode == "free":
                system_msg += "\n\nFREE MODE: Conversação aberta, responda em English naturalmente."
            elif voice_mode == "shadow":
                system_msg += "\n\nSHADOW MODE: Fale uma frase clara em English. Depois diga 'Your turn — repeat after me:' e repita."
            elif voice_mode == "dictation":
                system_msg += "\n\nDICTATION MODE: Dite uma frase clara para o aluno escrever. Começa com 'Write what you hear:'"
        
        # Bridge mode: traduzir português input para english para Groq
        user_payload = request.message
        if input_bridge_mode and detected_input_language == "pt" and not is_opening_turn:
            try:
                translated = await translate_with_direction(request.message, "pt", "en")
                user_payload = f"[Student spoke PT] {request.message}\n[Intent in EN] {translated}"
                system_msg += "\n\n[BRIDGE MODE] Entenda a intenção, mas responda em English natural."
            except Exception as e:
                logger.warning(f"[BRIDGE-TRANSLATE-ERROR] {str(e)}")
        
        if is_opening_turn:
            user_payload = "Start the voice lesson now."
        
        messages.insert(0, {"role": "system", "content": system_msg})
        messages.append({"role": "user", "content": user_payload})
        
        # Max tokens by level e mode
        max_tokens_map = {
            "a1": 70, "a2": 90, "b1": 120, "b2": 150, "c1": 170, "c2": 190
        }
        max_tokens = max_tokens_map.get(level, 120)
        if voice_mode in ("shadow", "dictation"):
            max_tokens = min(max_tokens, 90)
        if is_opening_turn:
            max_tokens = min(max_tokens, 60 if is_beginner else 90)
        
        logger.info(f"[API-CALL] model={model_name} | messages={len(messages)} | max_tokens={max_tokens}")
        
        # ======== CALL GROQ com RETRY LOGIC ========
        reply = await _call_groq_with_retry(
            messages=messages,
            model=model_name,
            max_tokens=max_tokens,
            temperature=0.5,
            max_retries=2
        )

        
        # ======== EXTRAIR CORREÇÃO E PROCESSAR ========
        correction: dict | None = None
        import json as _json_corr
        corr_match = re.search(r'\[CORRECTION:\s*(\{.*?\})\]', reply, re.DOTALL)
        if corr_match:
            try:
                correction = _json_corr.loads(corr_match.group(1))
                if isinstance(correction, dict):
                    correction["error_type"] = _normalize_voice_correction_type(correction.get("error_type"))
                reply = reply[:corr_match.start()].rstrip()
                logger.info(f"[CORRECTION] Extracted: {correction.get('error_type')}")
            except Exception:
                correction = None
        
        # ======== TRADUÇÃO BILÍNGUE (se necessário) ========
        translation_pt: str | None = None
        if bilingual_mode:
            try:
                translation_pt = await translate_with_direction(reply, "en", "pt")
                logger.info(f"[BILINGUAL] Tradução gerada: {len(translation_pt)} chars")
            except Exception as e:
                logger.warning(f"[TRANSLATION-ERROR] {str(e)}")
        
        # ======== MONTAR RESULTADO E CACHE ========
        result = {
            "reply": reply,
            "translation_pt": translation_pt,
            "correction": correction,
            "understanding": understanding,
            "detected_input": {
                "language": detected_input_language,
                "primary_language": primary_input_language,
                "confidence": detected_input.get("confidence"),
            },
        }
        
        # ======== VALIDAÇÃO FINAL: Nunca retornar resposta vazia ========
        if not result.get("reply") or not result.get("reply").strip():
            logger.error("[CRITICAL] Result reply is empty! Falling back...")
            fallback = GraciousFallback.get_fallback_response(voice_mode, ErrorScenario.API_ERROR, level)
            return {
                "reply": fallback.get("response", "I couldn't generate a response. Try again?"),
                "translation_pt": None,
                "correction": None,
                "understanding": {"status": "error", "clarification_needed": False},
                "detected_input": {"language": "unknown"},
                "fallback": True,
                "error_scenario": "empty_response",
            }
        
        # Cachear apenas se apropriado
        if not bilingual_mode and correction is None and not is_opening_turn:
            voice_cache.set(cache_key, result)
            logger.info(f"[CACHE-SET] Armazenado: {cache_key[:40]}...")
        
        logger.info(f"[SUCCESS] Latência total | reply: {len(reply)} chars | correction: {correction is not None}")
        return result

    except asyncio.TimeoutError:
        logger.error("[TIMEOUT] Groq API timeout")
        fallback = GraciousFallback.get_fallback_response(voice_mode, ErrorScenario.TIMEOUT, level)
        GraciousFallback.log_fallback_usage(0, voice_mode, ErrorScenario.TIMEOUT, level)
        # Convert fallback format to standard result format
        return {
            "reply": fallback.get("response", ""),
            "translation_pt": None,
            "correction": None,
            "understanding": {"status": "error", "clarification_needed": False},
            "detected_input": {"language": "unknown"},
            "fallback": True,
            "error_scenario": fallback.get("error_scenario"),
        }
    
    except Exception as e:
        error_msg = str(e)
        logger.error(f"[ERROR] {error_msg}")
        
        # Detectar tipo de erro para fallback apropriado
        if "429" in error_msg or "rate" in error_msg.lower():
            scenario = ErrorScenario.RATE_LIMIT
        elif "timeout" in error_msg.lower():
            scenario = ErrorScenario.TIMEOUT
        else:
            scenario = ErrorScenario.API_ERROR
        
        fallback = GraciousFallback.get_fallback_response(voice_mode, scenario, level)
        GraciousFallback.log_fallback_usage(0, voice_mode, scenario, level)
        # Convert fallback format to standard result format
        return {
            "reply": fallback.get("response", ""),
            "translation_pt": None,
            "correction": None,
            "understanding": {"status": "error", "clarification_needed": False},
            "detected_input": {"language": "unknown"},
            "fallback": True,
            "error_scenario": fallback.get("error_scenario"),
        }


# ======== HELPER: Retry logic com exponential backoff ========
async def _call_groq_with_retry(
    messages: list,
    model: str,
    max_tokens: int,
    temperature: float = 0.5,
    max_retries: int = 2
) -> str:
    """Chama Groq com retry automático e exponential backoff."""
    
    for attempt in range(max_retries):
        try:
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    lambda: client.chat.completions.create(
                        model=model,
                        messages=messages,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        top_p=0.9,
                        timeout=10
                    )
                ),
                timeout=12.0
            )
            result = response.choices[0].message.content.strip()
            
            # Validação: garante que nunca retorna string vazia
            if not result:
                logger.warning(f"[API-EMPTY] Groq retornou resposta vazia, tentando novamente...")
                if attempt < max_retries - 1:
                    await asyncio.sleep(0.5)
                    continue
                else:
                    raise ValueError("Groq API returned empty response after all retries")
            
            return result
        
        except asyncio.TimeoutError:
            logger.warning(f"[RETRY] Attempt {attempt+1}/{max_retries} - Timeout")
            if attempt < max_retries - 1:
                wait_time = 0.5 * (2 ** attempt)
                await asyncio.sleep(wait_time)
            else:
                raise
        
        except Exception as e:
            error_str = str(e)
            logger.warning(f"[RETRY] Attempt {attempt+1}/{max_retries} - {error_str[:50]}")
            
            # Se rate limit, esperar
            if "429" in error_str or "rate" in error_str.lower():
                if attempt < max_retries - 1:
                    await asyncio.sleep(2.0)
                else:
                    raise
            else:
                raise


# ==================== VOICE SESSION RECAP ====================

async def generate_voice_recap(
    history: list,
    duration_seconds: int,
    previous_session: dict | None = None,
) -> dict:
    """
    Analyse a completed voice session and return structured feedback.
    All quality metrics (quality_score, radar) are LLM-evaluated from the real transcript.
    previous_session: last saved session snapshot for progress comparison.
    """
    import json as _json

    exchanges = len(history) // 2
    _FALLBACK = {
        "highlights": ["Ótimo trabalho praticando inglês falado hoje!"],
        "corrections": [],
        "study_suggestion": "Continue praticando conversas diárias para ganhar fluência.",
        "next_topic": "Frases do cotidiano",
        "best_phrase": None,
        "quality_score": 50,
        "radar": {"fluency": 50, "grammar": 50, "vocabulary": 50, "rhythm": 50, "progress": 50},
        "exchanges": exchanges,
        "duration_seconds": duration_seconds,
    }

    if not history or exchanges < 1:
        return _FALLBACK

    # Build readable transcript for the LLM
    transcript_lines = []
    for msg in history:
        role = msg.get("role", "user")
        content = msg.get("content", "").strip()
        label = "Student" if role == "user" else "AI Tutor"
        transcript_lines.append(f"{label}: {content}")
    transcript = "\n".join(transcript_lines)

    prev_context = ""
    if previous_session:
        prev_score = previous_session.get("quality", previous_session.get("quality_score", 50))
        prev_context = f"\nSessão anterior: score={prev_score}, trocas={previous_session.get('exchanges', 0)}"

    recap_prompt = f"""Você é um coach especialista em língua inglesa revisando uma sessão de prática de conversação por voz.

TRANSCRIÇÃO COMPLETA:
{transcript}

Duração da sessão: {duration_seconds} segundos ({duration_seconds // 60}m {duration_seconds % 60}s)
Número de trocas completas: {exchanges}{prev_context}

Analise esta sessão com base EXCLUSIVAMENTE no conteúdo da transcrição acima e responda SOMENTE com um objeto JSON válido (sem markdown, sem explicação) seguindo exatamente este schema:
{{
  "quality_score": <inteiro 0-100. Base: gramática correta=40pts, vocabulário variado=20pts, fluência/continuidade=20pts, tentativas corajosas=20pts>,
  "highlights": ["<1-2 observações específicas e encorajadoras em português sobre o que o aluno demonstrou BEM nesta transcrição>"],
  "best_phrase": "<a frase mais bem construída do aluno nesta sessão, em inglês, ou null se não houver>",
  "corrections": [
    {{
      "wrong": "<exatamente como o aluno disse — extraído da transcrição>",
      "correct": "<a forma correta em inglês>",
      "tip": "<dica curta em português, máximo 12 palavras, explicando a regra>"
    }}
  ],
  "study_suggestion": "<ação de estudo ESPECÍFICA baseada nos erros observados nesta sessão, máximo 25 palavras, em português>",
  "next_topic": "<próximo tópico ideal para praticar baseado nas fraquezas observadas, em português, ex: 'Verbos no passado'>",
  "radar": {{
    "fluency": <0-100. Avalie: o aluno manteve o fluxo da conversa? Pausas longas? Frases incompletas?>,
    "grammar": <0-100. Avalie: quantos erros gramaticais houve vs total de frases do aluno?>,
    "vocabulary": <0-100. Avalie: o aluno usou palavras variadas ou repetiu as mesmas sempre?>,
    "rhythm": <0-100. Avalie: as respostas do aluno foram naturais em comprimento e tempo?>,
    "progress": <0-100. {f"Sessão anterior score={prev_score}. " if previous_session else ""}Se não há histórico, use 50. Se melhorou, use > 60. Se piorou, use < 40.>
  }}
}}

Regras CRÍTICAS:
- corrections: inclua APENAS erros que aparecem textualmente na transcrição (0-4 itens). Não invente.
- highlights: cite ALGO ESPECÍFICO da transcrição, não frases genéricas.
- quality_score: calcule objetivamente. Não infle — 50 é mediano, 80+ é realmente bom.
- radar: cada eixo deve refletir evidências reais da transcrição.
- Responda SOMENTE com o JSON, absolutamente nada fora dele."""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "Você é um coach de inglês que analisa transcrições e responde APENAS com JSON válido. Todos os campos de feedback ao usuário devem estar em português brasileiro. Nunca inclua texto fora do JSON."},
                {"role": "user", "content": recap_prompt},
            ],
            temperature=0.2,
            max_tokens=800,
        )
        raw = response.choices[0].message.content.strip()

        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        data = _json.loads(raw)

        # Enforce schema — fill missing/invalid fields with fallback
        data.setdefault("quality_score", 50)
        data.setdefault("radar", {"fluency": 50, "grammar": 50, "vocabulary": 50, "rhythm": 50, "progress": 50})
        data.setdefault("highlights", _FALLBACK["highlights"])
        data.setdefault("corrections", [])
        data.setdefault("best_phrase", None)
        data.setdefault("study_suggestion", _FALLBACK["study_suggestion"])
        data.setdefault("next_topic", _FALLBACK["next_topic"])

        # Clamp quality_score and radar values 0–100
        data["quality_score"] = max(0, min(100, int(data["quality_score"])))
        for axis in ("fluency", "grammar", "vocabulary", "rhythm", "progress"):
            data["radar"][axis] = max(0, min(100, int(data["radar"].get(axis, 50))))

        data["exchanges"] = exchanges
        data["duration_seconds"] = duration_seconds
        print(f"[VOICE-RECAP] Generated | score={data['quality_score']} | corrections={len(data['corrections'])}")
        return data
    except Exception as e:
        print(f"[VOICE-RECAP] Error: {e}")
        return _FALLBACK


# ==================== WRITING MODE CHAT - EVALUATION WITH FEEDBACK ====================

import json
import asyncio

async def evaluate_writing_response(request, user_id: int, db: Session):
    """
    Process user's English message with grammar/vocabulary feedback.
    Returns conversational reply + structured corrections.
    Both LLM calls run in parallel for ~50% latency reduction.
    """
    try:
        from utils.prompts import prompt_continue_conversation, prompt_evaluate_writing

        message = request.message
        level = request.level or "intermediate"
        history = request.history or []
        focus_area = getattr(request, "focus_area", None)
        conversation_theme = getattr(request, "conversation_theme", None)
        message_count = getattr(request, "message_count", 0)

        print(f"[WRITE-CHAT] user_id={user_id} | message={message[:60]}... | level={level} | focus={focus_area} | theme={conversation_theme}")

        # ===== RAG context (non-blocking thread) =====
        rag_context = await asyncio.to_thread(_fetch_rag_context_sync, message, level)
        if rag_context:
            print(f"[RAG] Injecting {len(rag_context)} chars of context")

        # ===== Build prompts =====
        prompt1 = prompt_continue_conversation(
            message, history, level,
            focus_area=focus_area,
            conversation_theme=conversation_theme,
            message_count=message_count,
            rag_context=rag_context,
        )
        prompt2 = prompt_evaluate_writing(message, level)

        # ===== PARALLEL: run both LLM calls simultaneously =====
        def call_conversation():
            return client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt1}],
                temperature=0.7,
                max_tokens=200
            )

        def call_evaluation():
            return client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt2}],
                temperature=0.3,
                max_tokens=500
            )

        response1, response2 = await asyncio.gather(
            asyncio.to_thread(call_conversation),
            asyncio.to_thread(call_evaluation)
        )

        reply = response1.choices[0].message.content.strip()
        print(f"[WRITE-CHAT] Reply: {reply[:80]}...")

        analysis_text = response2.choices[0].message.content.strip()
        print(f"[WRITE-CHAT] Analysis: {analysis_text[:100]}...")

        # Parse JSON response
        try:
            analysis = json.loads(analysis_text)
        except json.JSONDecodeError:
            print(f"[WRITE-CHAT] Failed to parse JSON, attempting cleanup...")
            start = analysis_text.find('{')
            end = analysis_text.rfind('}') + 1
            if start >= 0 and end > start:
                analysis = json.loads(analysis_text[start:end])
            else:
                analysis = {
                    "corrections": [],
                    "accuracy_score": 75,
                    "focus_area": None
                }

        # ===== Build response structure =====
        corrections = [
            {
                "original": c.get("original", ""),
                "corrected": c.get("corrected", ""),
                "error_type": c.get("error_type", "unknown"),
                "explanation": c.get("explanation", ""),
                "severity": "medium"
            }
            for c in analysis.get("corrections", [])
        ]

        accuracy_score = analysis.get("accuracy_score", 80)
        detected_theme = analysis.get("conversation_theme") or conversation_theme
        new_vocabulary = analysis.get("new_vocabulary") or []
        # Normalize vocabulary items
        clean_vocabulary = [
            {
                "expression": v.get("expression", ""),
                "meaning_pt": v.get("meaning_pt", ""),
                "example": v.get("example", ""),
            }
            for v in new_vocabulary
            if v.get("expression")
        ]

        feedback = {
            "title": "Dica natural",
            "emoji": "📝" if corrections else "✅",
            "corrections": corrections,
            "accuracy_score": accuracy_score,
            "focus_area": analysis.get("focus_area")
        }

        # ===== Dynamic XP: based on accuracy score =====
        # score 100 → 20 XP, score 50 → 10 XP, minimum 5 XP
        xp_earned = max(5, min(20, int(accuracy_score / 5)))

        # ===== Save to database =====
        user_conv = Conversation(
            user_id=user_id,
            message_role="user",
            message_text=message,
            language="en",
            xp_awarded=xp_earned,
            error_corrections=json.dumps(corrections),
            writing_accuracy_score=accuracy_score,
            grammar_focus_area=feedback["focus_area"]
        )
        db.add(user_conv)

        ai_conv = Conversation(
            user_id=user_id,
            message_role="assistant",
            message_text=reply,
            language="en",
            xp_awarded=0,
            new_vocabulary=clean_vocabulary if clean_vocabulary else None,
        )
        db.add(ai_conv)

        db.commit()

        # Update XP via centralized engine (handles level-up + xp_daily)
        from utils import award_xp
        xp_result = award_xp(db, user_id, xp_earned, source="writing_chat")

        print(f"[WRITE-CHAT] Saved to DB | corrections={len(corrections)} | xp={xp_earned} | level_up={xp_result['level_up']}")

        return {
            "reply": reply,
            "feedback": feedback,
            "context": {
                "topic": "conversational_writing",
                "level": level
            },
            "xp_earned": xp_result["xp_earned"],
            "total_xp": xp_result["new_total"],
            "level_up": xp_result["level_up"],
            "new_level": xp_result["new_level"],
            "conversation_theme": detected_theme,
            "new_vocabulary": clean_vocabulary,
        }

    except Exception as e:
        print(f"[WRITE-CHAT ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao avaliar escrita: {str(e)}")


def gerar_perguntas(texto):
    prompt = prompt_perguntas(texto)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=1.0  # mais liberdade criativa
    )
    return response.choices[0].message.content


def gerar_continuacao(texto, respostas):
    prompt = prompt_continuacao(texto, respostas)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=1.0
    )
    return response.choices[0].message.content


def gerar_historia_e_analise(inputs):
    # Gerar história
    prompt_h = prompt_historia(inputs)
    response_h = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt_h}],
        temperature=1.0
    )
    historia = response_h.choices[0].message.content

    # Gerar análise
    prompt_a = prompt_analise(inputs, historia)
    response_a = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt_a}],
        temperature=0.7
    )
    analise = response_a.choices[0].message.content

    return historia, analise


def gerar_sugestao(inputs):
    prompt = prompt_sugestao(inputs)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8
    )
    return response.choices[0].message.content


def refinar_bloco(bloco, conteudo):
    prompt = prompt_refinar_bloco(bloco, conteudo)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.9
    )
    return response.choices[0].message.content


def combinar_historias(blocos):
    prompt = prompt_combinar_historias(blocos)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=1.0
    )
    historia = response.choices[0].message.content

    # For now, no separate analysis, but we can add later
    analise = "História criada com sucesso! Refina os blocos para mais detalhes."
    return historia, analise
