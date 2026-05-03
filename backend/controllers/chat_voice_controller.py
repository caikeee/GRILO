from datetime import datetime
import logging
import os
import base64
import tempfile
import json as _json
import time as _time
from collections import defaultdict
from typing import List, Dict, Optional, Any

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from auth import get_current_user_id
from database import get_db
from db_models import UserProgress, VoicePhrase, ShadowModeAnalytic
from utils import mark_activity, award_xp
from schemas import ChatRequest, ShadowModeData
from services import chat_concise_voice, generate_voice_recap
from voice_metrics import voice_metrics
from voice_cache import voice_cache
from fallback import GraciousFallback, ErrorScenario

router = APIRouter(tags=["chat-voice"])
logger = logging.getLogger(__name__)

_VOICE_ERROR_TYPE_LABELS = {
    "article": "Artigos",
    "gerund_after_verb": "Gerúndio",
    "verb_tense": "Tempo verbal",
    "word_choice": "Escolha de palavras",
    "preposition": "Preposições",
    "subject_verb_agreement": "Concordância verbal",
    "capitalization": "Maiúsculas",
    "spelling": "Ortografia",
    "unknown": "Gramática geral",
}


def _normalize_voice_turn_language(value: str | None) -> str:
    normalized = str(value or "").strip().lower()
    return "pt" if normalized.startswith("pt") else "en"


def _normalize_voice_error_type(value: str | None) -> str:
    normalized = str(value or "unknown").strip().lower()
    return normalized if normalized in _VOICE_ERROR_TYPE_LABELS else "unknown"


def _count_words(text: str | None) -> int:
    return len([part for part in str(text or "").strip().split() if part])


def _summarize_voice_turn_analytics(
    turns: list[dict] | None,
    help_summary: dict | None = None,
) -> dict:
    turn_list = [t for t in (turns or []) if isinstance(t, dict)]
    if not turn_list:
        return {
            "turns_total": 0,
            "pt_turns": 0,
            "en_turns": 0,
            "mixed_turns": 0,
            "bridge_turns": 0,
            "clarification_turns": 0,
            "english_turns_with_correction": 0,
            "english_turns_without_correction": 0,
            "english_accuracy_ratio": 0,
            "avg_words_per_turn": 0,
            "avg_stt_confidence": None,
            "top_error_types": [],
            "latest_correction": None,
            "help": {
                "panel_opens": int((help_summary or {}).get("panel_opens", 0) or 0),
                "suggestion_uses": int((help_summary or {}).get("suggestion_uses", 0) or 0),
                "pronunciation_plays": int((help_summary or {}).get("pronunciation_plays", 0) or 0),
                "shadow_successes": int((help_summary or {}).get("shadow_successes", 0) or 0),
                "shadow_skips": int((help_summary or {}).get("shadow_skips", 0) or 0),
                "shadow_auto_progressed": int((help_summary or {}).get("shadow_auto_progressed", 0) or 0),
            },
        }

    pt_turns = 0
    en_turns = 0
    mixed_turns = 0
    bridge_turns = 0
    clarification_turns = 0
    english_turns_with_correction = 0
    english_turns_without_correction = 0
    total_words = 0
    confidence_values: list[float] = []
    error_counts: dict[str, int] = defaultdict(int)
    latest_correction = None

    for index, turn in enumerate(turn_list, start=1):
        language = _normalize_voice_turn_language(turn.get("language") or turn.get("user_language"))
        had_correction = bool(turn.get("had_correction"))
        correction = turn.get("correction") if isinstance(turn.get("correction"), dict) else {}
        correction_type = _normalize_voice_error_type(
            turn.get("correction_type") or correction.get("error_type")
        )

        if language == "pt":
            pt_turns += 1
        elif language == "mixed":
            mixed_turns += 1
        else:
            en_turns += 1
            if had_correction:
                english_turns_with_correction += 1
            else:
                english_turns_without_correction += 1

        if turn.get("clarification_needed"):
            clarification_turns += 1

        if turn.get("used_bridge"):
            bridge_turns += 1

        total_words += _count_words(turn.get("final_text") or turn.get("heard_text"))

        confidence = turn.get("stt_confidence")
        if isinstance(confidence, (int, float)):
            confidence_values.append(float(confidence))

        if had_correction:
            error_counts[correction_type] += 1
            latest_correction = {
                "turn_index": int(turn.get("turn_index") or index),
                "language": language,
                "error_type": correction_type,
                "error_label": _VOICE_ERROR_TYPE_LABELS.get(correction_type, "Gramática geral"),
                "wrong": correction.get("wrong") or turn.get("wrong") or "",
                "correct": correction.get("correct") or turn.get("correct") or "",
                "tip": correction.get("tip") or turn.get("tip") or "",
            }

    top_error_types = [
        {
            "error_type": error_type,
            "label": _VOICE_ERROR_TYPE_LABELS.get(error_type, "Gramática geral"),
            "count": count,
        }
        for error_type, count in sorted(error_counts.items(), key=lambda item: item[1], reverse=True)[:4]
    ]

    avg_confidence = None
    if confidence_values:
        avg_confidence = round(sum(confidence_values) / len(confidence_values), 2)

    english_accuracy_ratio = round(
        (english_turns_without_correction / en_turns) if en_turns else 0,
        2,
    )

    return {
        "turns_total": len(turn_list),
        "pt_turns": pt_turns,
        "en_turns": en_turns,
        "mixed_turns": mixed_turns,
        "bridge_turns": bridge_turns,
        "clarification_turns": clarification_turns,
        "english_turns_with_correction": english_turns_with_correction,
        "english_turns_without_correction": english_turns_without_correction,
        "english_accuracy_ratio": english_accuracy_ratio,
        "avg_words_per_turn": round(total_words / len(turn_list), 1) if turn_list else 0,
        "avg_stt_confidence": avg_confidence,
        "top_error_types": top_error_types,
        "latest_correction": latest_correction,
        "help": {
            "panel_opens": int((help_summary or {}).get("panel_opens", 0) or 0),
            "suggestion_uses": int((help_summary or {}).get("suggestion_uses", 0) or 0),
            "pronunciation_plays": int((help_summary or {}).get("pronunciation_plays", 0) or 0),
            "shadow_successes": int((help_summary or {}).get("shadow_successes", 0) or 0),
            "shadow_skips": int((help_summary or {}).get("shadow_skips", 0) or 0),
            "shadow_auto_progressed": int((help_summary or {}).get("shadow_auto_progressed", 0) or 0),
        },
    }

# ==================== SHADOW MODE ANALYTICS ====================

async def process_shadow_mode_analytics(
    user_id: int,
    shadow_data: ShadowModeData,
    request: ChatRequest,
    db: Session
) -> None:
    """
    Processa e armazena dados de Voice Help Shadowing para análise pedagógica.
    
    - Registra tentativas, scores e dificuldades
    - Marca como dificuldade se auto-progressed
    - Usa para recomendações futuras
    """
    try:
        # Criar registro no DB
        analytic = ShadowModeAnalytic(
            user_id=user_id,
            expected_text=shadow_data.expected_text,
            user_attempts=shadow_data.user_attempts,
            final_score=shadow_data.final_score,
            pronunciation_errors=shadow_data.pronunciation_errors or [],
            auto_progressed=shadow_data.auto_progressed,
            skipped=shadow_data.skipped,
            reason=shadow_data.reason,
            response_kind=None,  # Será setado se possível extrair do contexto
            voice_mode=request.voice_mode,
            user_level=request.level,
            conversation_topic=request.conversation_topic,
        )
        
        db.add(analytic)
        db.commit()
        
        logger.info(
            "[SHADOW-MODE] User %d | Frase: '%s' | Tentativas: %d | Score: %d%% | Auto-progressed: %s",
            user_id,
            shadow_data.expected_text[:50],
            shadow_data.user_attempts,
            shadow_data.final_score,
            shadow_data.auto_progressed,
        )
    except Exception as e:
        logger.error("[SHADOW-MODE] Erro ao processar: %s", str(e))
        db.rollback()
        # Não falha a conversa; apenas loga o erro


# Simple in-memory rate limiter for TTS endpoint
from collections import defaultdict
import time as _time
_tts_call_log: dict = defaultdict(list)  # {user_id: [timestamps]}
TTS_RATE_LIMIT = 30       # max calls
TTS_RATE_WINDOW = 60      # per N seconds


def _check_tts_rate_limit(user_id: int) -> bool:
    """Return True if allowed, False if rate limit exceeded."""
    now = _time.monotonic()
    window_start = now - TTS_RATE_WINDOW
    calls = _tts_call_log[user_id]
    # Purge old entries
    _tts_call_log[user_id] = [t for t in calls if t > window_start]
    if len(_tts_call_log[user_id]) >= TTS_RATE_LIMIT:
        return False
    _tts_call_log[user_id].append(now)
    return True


# ElevenLabs config
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_EN = os.getenv("ELEVENLABS_VOICE_EN", "EXAVITQu4vr4xnSDxMaL")   # "Bella" — clear, friendly
ELEVENLABS_VOICE_PT = os.getenv("ELEVENLABS_VOICE_PT", "pNInz6obpgDQGcFmaJgB")   # "Adam" — warm male
ELEVENLABS_MODEL = "eleven_multilingual_v2"


class _VoiceSessionEnd(BaseModel):
    duration_seconds: int
    quality_score: Optional[int] = None
    corrections_count: Optional[int] = None
    exchanges: Optional[int] = None
    radar: Optional[Dict[str, int]] = None
    analytics_summary: Optional[Dict[str, Any]] = None


_ALLOWED_AUDIO_MIME = {"audio/webm", "audio/ogg", "audio/mp4", "audio/wav", "audio/mpeg"}
_MAX_AUDIO_BYTES = 5 * 1024 * 1024  # 5 MB


class _TranscribeRequest(BaseModel):
    audio_base64: str
    mime_type: str = "audio/webm"

    @field_validator("mime_type")
    @classmethod
    def validate_mime(cls, v: str) -> str:
        base = v.split(";")[0].strip().lower()
        if base not in _ALLOWED_AUDIO_MIME:
            raise ValueError(f"mime_type must be one of {_ALLOWED_AUDIO_MIME}")
        return base


class _TTSRequest(BaseModel):
    text: str
    lang: str = "en"   # "en" or "pt"
    speed: float = 1.0  # 0.5 (slow) – 1.5 (fast)

    @field_validator("lang")
    @classmethod
    def validate_lang(cls, v: str) -> str:
        if v not in ("en", "pt"):
            raise ValueError("lang must be 'en' or 'pt'")
        return v


@router.post("/api/voice-chat")
async def voice_chat(
    request: ChatRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Voice chat endpoint optimized for concise, fast responses."""
    logger.info("[VOICE-CHAT] START | user_id=%s", user_id)
    start_time = datetime.now()

    try:
        # ← NEW: Process shadow mode if present
        if request.shadow_mode:
            await process_shadow_mode_analytics(
                user_id=int(user_id),
                shadow_data=request.shadow_mode,
                request=request,
                db=db
            )

        result = await chat_concise_voice(request)

        # Award XP for each voice message exchange
        xp_result = award_xp(db, int(user_id), 8, source="voice")
        mark_activity(db, int(user_id), "voice")

        elapsed = (datetime.now() - start_time).total_seconds()
        logger.info(
            "[VOICE-CHAT] SUCCESS | user_id=%s | %.2fs | xp=%s | total_xp=%s",
            user_id, elapsed, xp_result["xp_earned"], xp_result["new_total"],
        )

        return {
            "response": result.get("reply", ""),
            "translation_pt": result.get("translation_pt"),
            "correction": result.get("correction"),  # {wrong, correct, tip} or null
            "understanding": result.get("understanding"),
            "detected_input": result.get("detected_input"),
            "voice_mode": getattr(request, "voice_mode", "free") or "free",
            "success": True,
            "execution_time_ms": int(elapsed * 1000),
            "xp_earned": xp_result["xp_earned"],
            "total_xp": xp_result["new_total"],
            "level_up": xp_result["level_up"],
            "new_level": xp_result["new_level"],
        }
    except Exception as exc:
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.error("[VOICE-CHAT] ERROR | user_id=%s | %.2fs | %s", user_id, elapsed, str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/api/voice/session-end")
async def voice_session_end(
    body: _VoiceSessionEnd,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Record accumulated voice session duration and quality snapshot."""
    try:
        duration = max(0, body.duration_seconds)
        uid = int(user_id)
        up = db.query(UserProgress).filter(UserProgress.user_id == uid).first()
        if not up:
            up = UserProgress(user_id=uid, voice_seconds=0)
            db.add(up)
        up.voice_seconds = (up.voice_seconds or 0) + duration

        # Persist session snapshot if quality data provided
        if body.quality_score is not None:
            snapshot = {
                "quality": body.quality_score,
                "corrections_count": body.corrections_count or 0,
                "exchanges": body.exchanges or 0,
                "radar": body.radar or {},
                "analytics": body.analytics_summary or {},
                "duration_seconds": duration,
                "ts": int(_time.time()),
            }
            sessions = list(up.voice_sessions or [])
            sessions.append(snapshot)
            if len(sessions) > 20:
                sessions = sessions[-20:]
            up.voice_sessions = sessions

        db.commit()
        logger.info("[VOICE-SESSION] User %s +%ds | quality=%s", uid, duration, body.quality_score)
        mark_activity(db, uid, "voice")
        return {"success": True}
    except Exception as exc:
        logger.error("[VOICE-SESSION] Error: %s", exc)
        raise HTTPException(status_code=500, detail="Error recording voice session")


@router.get("/api/voice/history")
async def get_voice_history(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return last 10 voice session snapshots for sparkline and progress comparison."""
    uid = int(user_id)
    up = db.query(UserProgress).filter(UserProgress.user_id == uid).first()
    sessions = list(up.voice_sessions or []) if up else []
    return {"sessions": sessions[-10:]}


@router.get("/api/voice/metrics")
async def get_voice_metrics(user_id: int = Depends(get_current_user_id)):
    """Return voice chat metrics (latency, tokens, error rate, etc).
    Requires admin or monitoring role in production.
    """
    metrics = voice_metrics.get_summary()
    return {
        "status": "ok",
        "metrics": metrics,
        "cache_stats": voice_cache.stats_summary(),
    }


@router.get("/api/voice/shadow-difficulties")
async def get_shadow_difficulties(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Retorna frases que o usuário teve dificuldade (auto-progressed).
    Usado para recomendações futuras e desafios direcionados.
    """
    uid = int(user_id)
    
    # Buscar records onde auto_progressed=True (esgotou 3 tentativas)
    struggles = db.query(ShadowModeAnalytic).filter(
        ShadowModeAnalytic.user_id == uid,
        ShadowModeAnalytic.auto_progressed == True
    ).order_by(ShadowModeAnalytic.created_at.desc()).limit(20).all()
    
    result = [
        {
            "phrase": s.expected_text,
            "attempts": s.user_attempts,
            "score": s.final_score,
            "reason": s.reason,
            "difficulty_type": s.response_kind,
            "timestamp": s.created_at.isoformat() if s.created_at else None,
        }
        for s in struggles
    ]
    
    return {"difficulties": result, "total": len(result)}


@router.get("/api/voice/shadow-analytics")
async def get_shadow_analytics(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Retorna estatísticas agregadas do shadow mode para o usuário.
    - Total de tentativas de shadowing
    - Taxa de sucesso (≥85% em primeira tentativa)
    - Frases mais difíceis
    - Distribuição por tipo
    """
    uid = int(user_id)
    
    # Todos os records
    all_records = db.query(ShadowModeAnalytic).filter(
        ShadowModeAnalytic.user_id == uid
    ).all()
    
    if not all_records:
        return {
            "total_attempts": 0,
            "success_rate": 0,
            "avg_score": 0,
            "auto_progressed_count": 0,
            "skipped_count": 0,
            "most_difficult_phrases": [],
        }
    
    # Estatísticas
    total = len(all_records)
    success_count = len([r for r in all_records if r.final_score >= 85 and r.user_attempts == 1])
    avg_score = sum([r.final_score for r in all_records]) / total if total > 0 else 0
    auto_progressed = len([r for r in all_records if r.auto_progressed])
    skipped = len([r for r in all_records if r.skipped])
    
    # Frases mais difíceis (tentativas altas, scores baixos)
    difficulty_map = {}
    for r in all_records:
        key = r.expected_text
        if key not in difficulty_map:
            difficulty_map[key] = {"attempts": [], "scores": []}
        difficulty_map[key]["attempts"].append(r.user_attempts)
        difficulty_map[key]["scores"].append(r.final_score)
    
    difficult_phrases = sorted(
        [
            {
                "phrase": phrase,
                "avg_attempts": sum(data["attempts"]) / len(data["attempts"]),
                "avg_score": sum(data["scores"]) / len(data["scores"]),
                "occurrences": len(data["attempts"]),
            }
            for phrase, data in difficulty_map.items()
        ],
        key=lambda x: x["avg_attempts"] * (1 - x["avg_score"] / 100),  # Score de dificuldade
        reverse=True
    )[:5]
    
    return {
        "total_shadow_attempts": total,
        "success_rate": round((success_count / total * 100), 2) if total > 0 else 0,
        "average_score": round(avg_score, 2),
        "auto_progressed_count": auto_progressed,
        "skipped_count": skipped,
        "most_difficult_phrases": difficult_phrases,
    }


@router.post("/api/voice/transcribe")
async def voice_transcribe(
    body: _TranscribeRequest,
    user_id: int = Depends(get_current_user_id),
):
    """
    Transcribe audio using Groq Whisper large-v3.
    Falls back to {transcript: null, fallback: true} if unavailable.
    """
    import groq as _groq

    try:
        raw_bytes = base64.b64decode(body.audio_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 audio data")

    if len(raw_bytes) > _MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio too large (max 5 MB)")
    if len(raw_bytes) < 500:
        return JSONResponse({"transcript": None, "fallback": True, "reason": "audio_too_short"})

    groq_key = os.getenv("GROQ_API_KEY", "")
    if not groq_key:
        return JSONResponse({"transcript": None, "fallback": True, "reason": "no_api_key"})

    # Map mime to file extension
    ext_map = {"audio/webm": ".webm", "audio/ogg": ".ogg", "audio/mp4": ".mp4",
               "audio/wav": ".wav", "audio/mpeg": ".mp3"}
    ext = ext_map.get(body.mime_type, ".webm")

    try:
        import groq as _groq_lib
        client_w = _groq_lib.Groq(api_key=groq_key)
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(raw_bytes)
            tmp_path = tmp.name
        try:
            with open(tmp_path, "rb") as audio_file:
                result = client_w.audio.transcriptions.create(
                    model="whisper-large-v3",
                    file=(f"audio{ext}", audio_file, body.mime_type),
                    response_format="verbose_json",
                )
            transcript = (result.text or "").strip()
            # verbose_json may include avg_logprob as confidence proxy
            confidence = None
            if hasattr(result, "segments") and result.segments:
                import math
                avg_lp = sum(s.get("avg_logprob", -1) for s in result.segments) / len(result.segments)
                confidence = round(min(1.0, max(0.0, math.exp(avg_lp))), 3)
            logger.info("[WHISPER] user=%s | chars=%d | conf=%s", user_id, len(transcript), confidence)
            return JSONResponse({"transcript": transcript, "confidence": confidence, "fallback": False})
        finally:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
    except Exception as exc:
        logger.warning("[WHISPER] Failed for user=%s: %s", user_id, str(exc))
        return JSONResponse({"transcript": None, "fallback": True, "reason": "transcription_error"})


@router.post("/api/tts")
async def text_to_speech(
    body: _TTSRequest,
    user_id: int = Depends(get_current_user_id),
):
    """
    Convert text to speech using ElevenLabs neural TTS.
    Falls back to {fallback: true} when API key is not set or quota is exceeded,
    so the frontend can use the browser's Web Speech API instead.
    """
    if not _check_tts_rate_limit(int(user_id)):
        logger.warning("[TTS] Rate limit exceeded for user_id=%s", user_id)
        raise HTTPException(status_code=429, detail="Too many TTS requests. Please slow down.")

    text = (body.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    # lang is already validated by the Pydantic field_validator

    if not ELEVENLABS_API_KEY:
        logger.info("[TTS] No ElevenLabs API key — fallback to browser TTS")
        return JSONResponse({"fallback": True, "reason": "no_api_key"})

    voice_id = ELEVENLABS_VOICE_EN if body.lang == "en" else ELEVENLABS_VOICE_PT
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "Accept": "audio/mpeg",
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }
    speed = max(0.5, min(1.5, float(body.speed or 1.0)))
    payload = {
        "text": text[:500],  # cap at 500 chars per call
        "model_id": ELEVENLABS_MODEL,
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "speed": speed},
    }

    try:
        async with httpx.AsyncClient(timeout=12.0) as client_http:
            resp = await client_http.post(url, json=payload, headers=headers)

        if resp.status_code == 200:
            audio_b64 = base64.b64encode(resp.content).decode("utf-8")
            logger.info("[TTS] SUCCESS | lang=%s | chars=%d", body.lang, len(text))
            return JSONResponse({
                "fallback": False,
                "audio_base64": audio_b64,
                "content_type": "audio/mpeg",
            })
        elif resp.status_code == 429:
            logger.warning("[TTS] ElevenLabs quota exceeded — fallback")
            return JSONResponse({"fallback": True, "reason": "quota_exceeded"})
        else:
            logger.error("[TTS] ElevenLabs error %d: %s", resp.status_code, resp.text[:200])
            return JSONResponse({"fallback": True, "reason": "api_error"})

    except Exception as exc:
        logger.error("[TTS] Request error: %s", str(exc))
        return JSONResponse({"fallback": True, "reason": "network_error"})


# ==================== VOICE SESSION RECAP ====================

class _RecapRequest(BaseModel):
    history: List[Dict[str, str]]
    duration_seconds: int = 0
    turn_analytics: Optional[List[Dict[str, Any]]] = None
    help_summary: Optional[Dict[str, Any]] = None


# ==================== PHRASEBOOK ====================

class _PhraseRequest(BaseModel):
    phrase_en: str
    translation_pt: Optional[str] = None
    topic: Optional[str] = None


@router.post("/api/voice/phrase")
async def save_voice_phrase(
    body: _PhraseRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Save a phrase from a voice session to the user's phrasebook."""
    phrase_en = (body.phrase_en or "").strip()
    if not phrase_en:
        raise HTTPException(status_code=400, detail="phrase_en cannot be empty")
    phrase = VoicePhrase(
        user_id=int(user_id),
        phrase_en=phrase_en[:500],
        translation_pt=(body.translation_pt or "").strip()[:500] or None,
        topic=(body.topic or "").strip()[:50] or None,
    )
    db.add(phrase)
    db.commit()
    db.refresh(phrase)
    logger.info("[PHRASEBOOK] Saved phrase id=%s for user_id=%s", phrase.id, user_id)
    return {"success": True, "phrase_id": phrase.id}


@router.get("/api/voice/phrasebook")
async def get_phrasebook(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return the last 50 saved phrases for the authenticated user."""
    uid = int(user_id)
    phrases = (
        db.query(VoicePhrase)
        .filter(VoicePhrase.user_id == uid)
        .order_by(VoicePhrase.created_at.desc())
        .limit(50)
        .all()
    )
    return {
        "phrases": [
            {
                "id": p.id,
                "phrase_en": p.phrase_en,
                "translation_pt": p.translation_pt,
                "topic": p.topic,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in phrases
        ]
    }


@router.post("/api/voice/recap")
async def voice_recap(
    body: _RecapRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Generate a structured recap for a completed voice session and persist session snapshot."""
    try:
        uid = int(user_id)
        # Fetch previous session for progress comparison
        up = db.query(UserProgress).filter(UserProgress.user_id == uid).first()
        sessions = list(up.voice_sessions or []) if up else []
        previous_session = sessions[-1] if sessions else None

        result = await generate_voice_recap(
            body.history,
            body.duration_seconds,
            previous_session=previous_session,
        )
        session_analytics = _summarize_voice_turn_analytics(body.turn_analytics, body.help_summary)
        result["session_analytics"] = session_analytics

        # Persist this session snapshot to DB
        snapshot = {
            "quality": result.get("quality_score", 50),
            "corrections_count": len(result.get("corrections", [])),
            "exchanges": result.get("exchanges", 0),
            "radar": result.get("radar", {}),
            "analytics": session_analytics,
            "duration_seconds": body.duration_seconds,
            "ts": int(_time.time()),
        }
        if not up:
            up = UserProgress(user_id=uid, voice_seconds=0)
            db.add(up)
        sessions.append(snapshot)
        if len(sessions) > 20:
            sessions = sessions[-20:]
        up.voice_sessions = sessions
        db.commit()

        logger.info(
            "[VOICE-RECAP] Generated | user=%s | exchanges=%s | quality=%s",
            user_id, result.get("exchanges"), result.get("quality_score"),
        )
        return result
    except Exception as exc:
        logger.error("[VOICE-RECAP] Error for user_id=%s: %s", user_id, str(exc))
        raise HTTPException(status_code=500, detail="Error generating session recap")
