# Voice Help Shadowing - Backend Implementation Guide

## Overview

O frontend agora envia um novo campo `shadow_mode` no payload `/api/voice-chat` quando o usuário:
1. Clica em "Usar resposta" no help panel
2. Passa por uma sessão de shadowing com até 3 tentativas de pronunciação
3. Sucede, pula ou auto-progride (esgota as 3 tentativas)

## New Payload Structure

### Request: POST `/api/voice-chat`

```json
{
  "message": "Yes, I do.",
  "language": "en",
  "history": [...],
  "stt_confidence": 1.0,
  "level": "b1",
  "voice_mode": "free",
  "conversation_topic": null,
  "bilingual_mode": false,
  
  // ← NEW FIELD (quando em help suggestion mode)
  "shadow_mode": {
    "expected_text": "Yes, I do",
    "user_attempts": 2,
    "final_score": 87,
    "pronunciation_errors": [],
    "auto_progressed": false,
    "skipped": false,
    "reason": null
  }
}
```

## Shadow Mode Field Reference

| Field | Type | Description |
|---|---|---|
| `expected_text` | string | Texto esperado que o usuário foi instruído a falar |
| `user_attempts` | int (1-3) | Número de tentativas realizadas |
| `final_score` | int (0-100) | Score final de similaridade com o texto esperado |
| `pronunciation_errors` | array | Palavras que o usuário errou (vazio se sucesso) |
| `auto_progressed` | bool | `true` se esgotou 3 tentativas, `false` se sucesso/skip |
| `skipped` | bool | `true` se usuário clicou "Pular" |
| `reason` | string | Motivo de auto-progrede: `"max_attempts_exhausted"` |

## Scenarios

### ✅ Success (85%+ score, 1-3 attempts)
```json
{
  "shadow_mode": {
    "expected_text": "Yes, I do",
    "user_attempts": 1,
    "final_score": 91,
    "pronunciation_errors": [],
    "auto_progressed": false
  }
}
```

### ⏭️ Skipped (user clicked "Pular")
```json
{
  "shadow_mode": {
    "expected_text": "Yes, I do",
    "user_attempts": 2,
    "final_score": 62,
    "pronunciation_errors": [],
    "auto_progressed": false,
    "skipped": true
  }
}
```

### ❌ Auto-Progressed (3 attempts, <85% final score)
```json
{
  "shadow_mode": {
    "expected_text": "Yes, I do",
    "user_attempts": 3,
    "final_score": 58,
    "pronunciation_errors": [],
    "auto_progressed": true,
    "reason": "max_attempts_exhausted"
  }
}
```

## Backend Implementation Checklist

### 1. **Parse and Store Shadow Mode Data**

```python
# backend/schemas.py
class ShadowModeData(BaseModel):
    expected_text: str
    user_attempts: int
    final_score: int
    pronunciation_errors: List[str] = []
    auto_progressed: bool = False
    skipped: bool = False
    reason: Optional[str] = None

class VoiceChatRequest(BaseModel):
    message: str
    language: str
    history: List[Dict]
    stt_confidence: float
    level: str
    voice_mode: str
    conversation_topic: Optional[str]
    bilingual_mode: bool
    shadow_mode: Optional[ShadowModeData] = None  # ← NEW
```

### 2. **Log Analytics/Pedagogy Data**

```python
# backend/services.py or pedagogy_orchestrator.py

async def process_shadow_mode_data(user_id: str, shadow_data: ShadowModeData):
    """
    Registra dados de pronuncia para análise pedagógica posterior.
    """
    analytics = {
        "user_id": user_id,
        "expected_text": shadow_data.expected_text,
        "attempts": shadow_data.user_attempts,
        "score": shadow_data.final_score,
        "auto_progressed": shadow_data.auto_progressed,
        "skipped": shadow_data.skipped,
        "timestamp": datetime.now().isoformat()
    }
    
    # Armazena em DB (novo schema)
    await db.shadow_mode_analytics.insert_one(analytics)
    
    # Se auto-progressed, anota como dificuldade
    if shadow_data.auto_progressed:
        await mark_pronunciation_difficulty(
            user_id=user_id,
            phrase=shadow_data.expected_text,
            severity="high"
        )
```

### 3. **Modify Voice Chat Handler**

```python
# backend/controllers/chat_voice_controller.py

@router.post("/api/voice-chat")
async def voice_chat(request: VoiceChatRequest, user_id: str = Depends(get_user_id)):
    
    # ... existing code ...
    
    # ← NEW: Process shadow mode if present
    if request.shadow_mode:
        await process_shadow_mode_data(user_id, request.shadow_mode)
    
    # Continue with normal AI response
    ai_response = await orchestrator.get_voice_response(...)
    
    return {
        "response": ai_response,
        "translation_pt": translation,
        ...
    }
```

### 4. **New DB Schema**

```python
# backend/db_models.py

class ShadowModeAnalytic(Document):
    user_id: str
    expected_text: str
    attempts: int
    final_score: int
    auto_progressed: bool
    skipped: bool
    phrase_type: str  # "positiva", "negativa", "mudar_rumo"
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        collection = "shadow_mode_analytics"
```

### 5. **Future: Pedagogy Dashboard Query**

```python
async def get_pronunciation_difficulty_report(user_id: str):
    """
    Retorna relatório de dificuldades de pronuncia para feedback pedagógico.
    """
    failed_phrases = await db.shadow_mode_analytics.find(
        {
            "user_id": user_id,
            "auto_progressed": True
        }
    ).to_list(length=None)
    
    return {
        "total_failed": len(failed_phrases),
        "common_struggles": list(set(f["expected_text"] for f in failed_phrases)),
        "success_rate": calculate_success_rate(user_id)
    }
```

## Response Behavior

**Importante**: A resposta da IA é sempre enviada normalmente. O `shadow_mode` é **metadados pedagógicos**, não afeta o fluxo conversacional.

```json
{
  "response": "Ótimo! E então, o que você comeu no fim de semana?",
  "translation_pt": "Great! So what did you eat over the weekend?",
  "correction": null,
  "session_stats": {...}
}
```

## Monitoring & Metrics

Rastrear:
- **Pronunciation Success Rate**: % de shadows com score >= 85 em attempt 1
- **Average Attempts**: Média de tentativas até sucesso
- **Auto-Progression Rate**: % de usuários que esgotam 3 tentativas
- **Response Type Difficulty**: Qual tipo (positiva/negativa/mudar_rumo) é mais difícil

## Timeline for Future Use

Estes dados servirão para:
1. **Immediate (Sprint 1)**: Dashboard de progresso com radar de competências
2. **Week 2-3**: Desafios direcionados para frases mal pronunciadas
3. **Month 2**: Recomendações de modo (switch para "dictation" se muitos falhos)
4. **Month 3+**: Feedback adaptativo da IA sobre o sotaque do usuário

---

## Testing

### Test 1: Success Path
```bash
curl -X POST http://localhost:8000/api/voice-chat \
  -H "Authorization: Bearer {token}" \
  -d '{
    "message": "Yes, I do",
    "shadow_mode": {
      "expected_text": "Yes, I do",
      "user_attempts": 1,
      "final_score": 91,
      "auto_progressed": false
    }
  }'
```

### Test 2: Auto-Progressed Path
```bash
curl -X POST http://localhost:8000/api/voice-chat \
  -H "Authorization: Bearer {token}" \
  -d '{
    "message": "Yes, I do",
    "shadow_mode": {
      "expected_text": "Yes, I do",
      "user_attempts": 3,
      "final_score": 45,
      "auto_progressed": true,
      "reason": "max_attempts_exhausted"
    }
  }'
```

Expected: Ambas retornam resposta de IA normalmente + dados armazenados no DB
