# Análise Completa: Sistema de Chat de Voz - GRILO

## 1. PIPELINE DE ENTRADA (Como a Voz é Processada)

### Fluxo End-to-End
```
Usuário fala → Navegador (Web Speech API) → Audio Base64 → Backend (/api/voice/transcribe)
    ↓
Groq Whisper Large-v3 → Transcrição + Confidence → Análise de Linguagem
    ↓
Detecção PT/EN (langdetect + keywords) → Compreensão da intenção
    ↓
Roteador de Classificação (Decision Engine) → Decisão de modelo (NO_LLM/CACHE/LIGHT/FULL)
    ↓
Geração de resposta (LLM) → Tradução bilíngue (se ativada)
    ↓
Retorno ao Frontend com contexto pedagógico
```

### Estágios Principais

#### **1.1 Transcrição de Áudio** (`/api/voice/transcribe`)
- **Modelo**: Groq Whisper Large-v3
- **Input**: Audio em Base64 (WebM, OGG, MP4, WAV, MPEG)
- **Output**:
  - `transcript`: texto reconhecido
  - `confidence`: calculada via `avg_logprob` dos segmentos (0-1)
  - `fallback`: true se erro (sem API key, áudio curto, etc.)

**Thresholds importantes**:
- Áudio < 500 bytes → fallback
- Áudio > 5 MB → erro 413
- Sem Groq API key → fallback silencioso

#### **1.2 Detecção de Linguagem** (`detect_language_from_text()`)
Usa **3 estratégias** em cascata:

1. **Análise Léxica** (dicionários PT/EN):
   - Conta palavras conhecidas em cada idioma
   - Ex: "amor", "gato" → português; "love", "cat" → inglês

2. **Detecção Probabilística** (`langdetect` library):
   - Retorna confiança de probabilidade para cada idioma
   - Aplica boost/penalidade baseado no resultado léxico

3. **Heurísticas Finais**:
   - Se PT e EN ambos presentes → `"mixed"`
   - Se confiança alta em um idioma (gap > 0.12) → seguro
   - Se ambíguo → recorre ao contexto anterior

**Decisões Produzidas**:
```python
{
    "language": "pt" | "en" | "mixed" | "unknown",
    "confidence": 0.0-1.0,
    "primary_language": "pt" | "en" | None,
    "word_count": int,
    "mixed_ratio": 0.0-1.0  # proporção PT vs EN
}
```

#### **1.3 Análise de Compreensão** (`_analyze_voice_understanding()`)

Avalia se o sistema **realmente entendeu** a frase:

| Condição | Status | Clarificação Necessária | Ação |
|----------|--------|------------------------|------|
| Áudio vazio | `unclear` | Sim | Pede repetição |
| STT confidence < 0.74 | `unclear` | Sim | "Não entendi com segurança" |
| Linguagem desconhecida + conf < 0.9 | `unclear` | Sim | "Frase ambígua" |
| Frase em dicionário (YES, NO, OK) | `clear` | Não | Processa normalmente |
| 1 palavra + fora de dicionário | `partial` | Sim | "Entendi só um pedaço" |
| Última palavra incompleta (is, be, with) | `partial` | Sim | "Pareceu incompleta" |
| PT + EN misturados | `mixed` | Não | Responde em EN, modelo interlingue |

**Output**:
```python
{
    "status": "clear" | "unclear" | "partial" | "mixed" | "error",
    "clarification_needed": bool,
    "understood_fragment": str,  # palavras-chave extraídas
    "note_pt": str,  # mensagem em português pro usuário
    "primary_language": "pt" | "en" | None
}
```

---

## 2. PROCESSAMENTO E ROTEAMENTO

### Decision Engine - Classificação de Requisição

O `voice_router` classifica cada mensagem em 4 categorias:

```
NO_LLM (0 tokens)
  ↓ Respostas pré-configuradas (YES, NO, OK, etc.)
  ↓ Latência: <50ms, custo: zero

CACHE_HIT (0 tokens)
  ↓ Resposta idêntica já gerada antes
  ↓ Key: hash(message + level + voice_mode)
  ↓ Latência: <10ms, custo: zero

LIGHT_LLM (200-300 tokens) - Mixtral 8x7B
  ↓ Respostas simples, contexto mínimo
  ↓ Mini-histórico (últimos 2 turnos)
  ↓ Latência: <1s, custo: baixo

FULL_LLM (600-1000 tokens) - Llama 70B
  ↓ Respostas complexas, contexto completo
  ↓ Histórico completo (últimos 10 turnos)
  ↓ Latência: <2s, custo: alto
```

**Critérios de Decisão**:
- Abertura de sessão (`__voice_session_start__`) → FULL_LLM (kickoff personalizado)
- Entrada muito curta (1-2 palavras) → LIGHT_LLM
- Entrada padrão com histórico → LIGHT_LLM (80% dos casos)
- Entrada complexa (multi-turno, opinião) → FULL_LLM

### Level-Aware Prompting

Cada nível recebe **instruções customizadas**:

| Nível | Regra |
|-------|-------|
| **A1** | Presente simples, max 10 palavras/frase, echo de 1 palavra |
| **A2** | Presente + passado simples, max 15 palavras/frase |
| **B1** | Conversação natural, 1-2 frases, sem repetição |
| **B2** | Idiomas e colocações naturais, desafio suave |
| **C1** | Fluência nativa, discussão de nuances |
| **C2** | Sofisticação total, sem simplificação |

### Intent Detection & Dynamic Prompting

O sistema **detecta a intenção** do usuário e injeta guidance específica:

```python
detect_user_intent(message) → "disagreement" | "opinion" | "explanation" 
                              | "question" | "emotion" | "correction" 
                              | "agreement" | "neutral"
```

**Exemplo**: Se B1 faz uma opinião, o prompt fica:
```
"User shared an opinion. Explore it naturally: 'What leads you to that 
conclusion?' or 'Have you always felt that way?' (don't repeat their words)"
```

---

## 3. PAINEL DE ESTATÍSTICAS & RECAP DE SESSÃO

### Fluxo de Coleta (`/api/voice/recap`)

```
Usuário termina sessão
    ↓
Frontend envia: history[], turn_analytics[], help_summary[], duration_seconds
    ↓
Backend chama: generate_voice_recap()
    ↓
Função _summarize_voice_turn_analytics() processa cada turno
    ↓
LLM analisa qualidade geral + gera recomendações
    ↓
Retorna painel completo com radar + sugestões
```

### Estrutura de Métricas Calculadas

#### **A. Contagem de Turnos**

```python
{
    "turns_total": 15,              # Total de exchanges
    "pt_turns": 3,                  # Turnos em português (desvios)
    "en_turns": 11,                 # Turnos em inglês (esperado)
    "mixed_turns": 1,               # Turnos mistos PT+EN
    "bridge_turns": 2,              # Turnos usando Bridge Mode
    "clarification_turns": 1        # Turnos que precisaram clarificação
}
```

**Fórmula**:
- Incrementa `en_turns` se `language == "en"`
- Incrementa `pt_turns` se `language == "pt"`
- Incrementa `mixed_turns` se `language == "mixed"`
- Verifica flag `clarification_needed` em cada turno
- Verifica flag `used_bridge` em cada turno

#### **B. Acurácia em Inglês**

```python
english_accuracy_ratio = (turnos_en_sem_correção / total_en_turnos)
```

**Interpretação**:
- 0.95 = 95% de acurácia (excelente)
- 0.75 = 75% de acurácia (bom)
- 0.50 = 50% de acurácia (precisa melhorar)

**Cálculo Por Turno**:
```
Se had_correction == True e language == "en"
    → english_turns_with_correction++
Senão se language == "en"
    → english_turns_without_correction++
```

#### **C. Erros Mais Comuns (Top 4)**

```python
error_counts = {
    "preposition": 4,      # "in" vs "on"
    "verb_tense": 3,       # Simple past vs present
    "article": 2,          # "a" vs "the"
    "spelling": 1          # "recieve" vs "receive"
}
```

**Tipos de Erro Mapeados**:
- `article` → Artigos
- `gerund_after_verb` → Gerúndio
- `verb_tense` → Tempo verbal
- `word_choice` → Escolha de palavras
- `preposition` → Preposições
- `subject_verb_agreement` → Concordância verbal
- `capitalization` → Maiúsculas
- `spelling` → Ortografia
- `unknown` → Gramática geral

#### **D. Confiança de Reconhecimento (STT)**

```python
avg_stt_confidence = mean([conf1, conf2, conf3, ...])
```

**Range**: 0.0 - 1.0
- 0.9+ = Áudio muito claro
- 0.7-0.9 = Áudio normal
- <0.7 = Áudio com ruído/sotaque difícil

#### **E. Média de Palavras por Turno**

```python
avg_words_per_turn = total_palavras / num_turnos
```

**Interpretação**:
- 3 palavras = respostas muito curtas (iniciante)
- 8-10 palavras = respostas naturais (intermediário)
- 15+ palavras = conversação fluida (avançado)

#### **F. Última Correção (Contexto)**

```python
latest_correction = {
    "turn_index": 5,
    "language": "en",
    "error_type": "verb_tense",
    "error_label": "Tempo verbal",
    "wrong": "I go yesterday",
    "correct": "I went yesterday",
    "tip": "Use 'went' (past simple) para ações completas no passado"
}
```

---

### Painel Visual (Radar Chart)

O sistema calcula **5 dimensões** de qualidade:

```python
radar = {
    "fluency": 0-100,       # Fluidez (palavras/min, hesitações)
    "grammar": 0-100,       # Gramática (taxa de erros)
    "vocabulary": 0-100,    # Vocabulário (diversidade + complexidade)
    "rhythm": 0-100,        # Ritmo (naturalidade da pronúncia)
    "progress": 0-100       # Progresso (vs. sessão anterior)
}
```

**Cálculo de cada dimensão** (realizado pelo LLM no `generate_voice_recap()`):

```
fluency = (exchanges * 10) + (avg_words_per_turn / 20) 
          - (clarification_turns * 15)
          [capped 0-100]

grammar = max(0, 100 - (error_count * 10))
          + (english_accuracy_ratio * 20)
          [capped 0-100]

vocabulary = (unique_words / total_words * 100)
             + (complex_word_ratio * 30)
             [capped 0-100]

rhythm = (avg_stt_confidence * 80) 
         + (absence_of_repeated_phrases * 20)
         [capped 0-100]

progress = compare(current_session_radar vs previous_session_radar)
           [% melhoria, -100 a +100]
```

### Painel de Ajuda (Help Panel)

Se o usuário clicou no **voice help panel** durante a sessão:

```python
help = {
    "panel_opens": 3,              # Vezes que abriu painel
    "suggestion_uses": 2,          # Usou sugestões
    "pronunciation_plays": 5,      # Clicou em "pronúncia"
    "shadow_successes": 1,         # Completou shadow com sucesso (≥85%)
    "shadow_skips": 1,             # Pulou shadow
    "shadow_auto_progressed": 1    # Esgotou tentativas (3x) e avançou
}
```

**Interpretação**:
- Alta use de ajuda = usuário teve dificuldade
- Altos shadow_auto_progressed = conteúdo muito difícil (necessita review)

---

## 4. SHADOW MODE ANALYTICS

Registra cada tentativa de **repetir uma frase** (shadowing):

```python
# Por turno no Shadow Mode
{
    "expected_text": "I would like a coffee",
    "user_attempts": 2,            # Quantas vezes tentou
    "final_score": 92,             # Score final (0-100)
    "pronunciation_errors": ["coffee → coffe"],
    "auto_progressed": False,      # Esgotou 3 tentativas?
    "skipped": False               # Usuário pulou?
}
```

**Score Calculation** (`compute_shadow_score()`):
```
score = difflib.SequenceMatcher(original, transcript).ratio() * 100
```

Normaliza ambas strings (minúscula, sem pontuação) e compara.

**Métricas Agregadas** (`/api/voice/shadow-analytics`):
```python
{
    "total_shadow_attempts": 45,
    "success_rate": 73.3,          # Score ≥85% em 1ª tentativa
    "average_score": 81.5,
    "auto_progressed_count": 3,    # Frases muito difíceis
    "skipped_count": 2,
    "most_difficult_phrases": [    # Ranked por dificuldade
        {
            "phrase": "pronunciation",
            "avg_attempts": 2.5,
            "avg_score": 65.0,
            "occurrences": 4
        }
    ]
}
```

---

## 5. FLUXO COMPLETO DO RECAP (from `generate_voice_recap()`)

```python
async def generate_voice_recap(history, duration_seconds, previous_session):
    # 1. Contar exchanges
    exchanges = len(history) // 2
    
    # 2. Construir transcript legível
    transcript_lines = []
    for msg in history:
        transcript_lines.append(f"[{msg['role']}] {msg['content']}")
    
    # 3. Chamar LLM com transcript
    prompt = f"""
    Analise esta sessão de prática de inglês por voz:
    {'\n'.join(transcript_lines)}
    
    Retorne JSON com:
    - highlights: [lista de 2-3 pontos positivos]
    - corrections: [lista de erros principais com dicas]
    - study_suggestion: str (sugestão pedagógica)
    - next_topic: str (tema recomendado)
    - best_phrase: str (frase mais natural dita)
    - quality_score: 0-100
    - radar: {{fluency, grammar, vocabulary, rhythm, progress}}
    """
    
    # 4. LLM retorna análise estruturada
    response = client.chat.completions.create(
        model="llama-70b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=800
    )
    
    # 5. Parse e validar
    data = json.loads(response.content)
    
    # 6. Persistir no DB
    snapshot = {
        "quality": data['quality_score'],
        "corrections_count": len(data['corrections']),
        "exchanges": exchanges,
        "radar": data['radar'],
        "analytics": session_analytics,
        "duration_seconds": duration_seconds,
        "ts": int(time.time())
    }
    
    return data
```

---

## 6. PONTOS DE MELHORIA & PARAMETRIZAÇÃO

### 6.1 Compreensão de Voz

#### Problema Atual
- Confiança STT baixa (< 0.74) força clarificação mesmo se a intenção é clara
- Detecção de linguagem pode ser ambígua em Portuguese/Spanish misturado

#### Soluções de Parametrização
```python
# backend/controllers/chat_voice_controller.py

# KNOB 1: Threshold de confiança STT
_VOICE_UNDERSTANDING_CONFIG = {
    "stt_confidence_threshold": 0.74,  # ← PARAMETRIZÁVEL (tente 0.68)
    "low_confidence_clarification": True,
    "confidence_boost_for_short_input": 0.05,
}

# KNOB 2: Dicionários de detecção
_PORTUGUESE_WORDS = {"amor", "gato", "python", ...}  # ← Adicionar regionalismos
_ENGLISH_WORDS = {"love", "cat", "python", ...}

# KNOB 3: Heurísticas de gap
LANGUAGE_SCORE_GAP_THRESHOLD = 0.12  # ← Aumentar para 0.18 se muita confusão PT/EN
```

#### Recomendação
1. Rastreie em logs: quantas vezes `clarification_needed` foi acionada
2. Se > 20% das requisições, diminua `stt_confidence_threshold` para 0.68
3. Monitore accuracy: frase realmente ambígua vs false positive?

---

### 6.2 Cálculo de Métricas de Sessão

#### Problema Atual
- `english_accuracy_ratio` é binário: ou teve correção ou não
- Não diferencia severidade do erro (typo vs estrutura gramatical errada)
- Radar é calculado pelo LLM, sem rastreabilidade clara

#### Soluções de Parametrização

```python
# backend/controllers/chat_voice_controller.py

# KNOB 1: Ponderação de erros por tipo
_ERROR_SEVERITY_WEIGHTS = {
    "spelling": 1,           # Baixa severidade
    "article": 3,            # Média
    "verb_tense": 5,         # Alta
    "preposition": 4,        # Média-alta
    "subject_verb_agreement": 5,
    "word_choice": 3,
    "capitalization": 1,
    "gerund_after_verb": 4,
    "unknown": 2
}

# Uso:
weighted_error_count = sum(
    _ERROR_SEVERITY_WEIGHTS.get(error_type, 1) 
    for error_type in error_types
)
```

```python
# KNOB 2: Componentes do Radar com pesos explícitos
_RADAR_FORMULA = {
    "fluency": {
        "exchanges_weight": 0.3,
        "words_per_turn_weight": 0.4,
        "clarification_penalty": 0.3,
        "formula": "exchanges*exchanges_weight + (words_per_turn/20)*words_weight - clarif*clarif_penalty"
    },
    "grammar": {
        "accuracy_ratio_weight": 0.5,
        "weighted_error_penalty_weight": 0.5,
        "formula": "accuracy_ratio*50 - weighted_errors*0.5"
    },
    # ... etc
}
```

#### Recomendação
1. Export logs: `turn_analytics` para cada sessão
2. Analise correlação entre `english_accuracy_ratio` e `quality_score` do LLM
3. Se correlação fraca, calibre `_ERROR_SEVERITY_WEIGHTS` via regression

---

### 6.3 Detecção de Intencionalidade (Intent Detection)

#### Problema Atual
- Intent detection é baseado em regras simples (regex)
- Não captura ironia, sarcasmo, ou intenções implícitas
- Mesmo prompt para todos os níveis pode ser genérico

#### Soluções de Parametrização

```python
# backend/services.py

# KNOB 1: Pesos de palavras-chave por intent
_INTENT_KEYWORDS = {
    "disagreement": {
        "words": ["don't", "disagree", "nope"],
        "weight": 1.0,
        "requires_confirmation": False  # Se True, pede LLM pra confirmar
    },
    "opinion": {
        "words": ["think", "believe"],
        "weight": 1.0,
        "requires_confirmation": False
    },
    # ... etc
}

# KNOB 2: Intent-specific adjustments por nivel
_INTENT_RESPONSE_ADJUSTMENT = {
    "b1": {
        "disagreement": {
            "echo_penalty": 0.5,      # Não repita tanto
            "engagement_boost": 1.3   # Mais perguntas abertas
        }
    }
}
```

#### Recomendação
1. Trace `detect_user_intent()` output em cada turno
2. Compare com human evaluation (1% das sessões)
3. Se acurácia < 80%, migre para LLM-based classification

---

### 6.4 Roteamento de Modelo (Decision Engine)

#### Problema Atual
- Decisão LIGHT vs FULL é estática baseada em comprimento
- Não considera complexidade semântica
- Overhead de classificação pode ser otimizado

#### Soluções de Parametrização

```python
# backend/controllers/chat_voice_controller.py

# KNOB 1: Thresholds de tamanho para roteamento
_ROUTING_THRESHOLDS = {
    "no_llm_max_words": 1,           # Se <= 1 palavra, try NO_LLM
    "light_llm_max_tokens": 150,     # Se <= 150 tokens, try LIGHT
    "full_llm_min_tokens": 151,      # Caso contrário, FULL
}

# KNOB 2: Histórico máximo por roteamento
_ROUTING_HISTORY_SIZE = {
    "light_llm": 2,      # Últimos 2 turnos (~30-50 tokens)
    "full_llm": 10       # Últimos 10 turnos (~200-300 tokens)
}

# KNOB 3: Temperature por roteamento
_ROUTING_TEMPERATURE = {
    "no_llm": 0.0,       # Determinístico
    "light_llm": 0.5,    # Equilibrado
    "full_llm": 0.3      # Mais conservador (qualidade > criatividade)
}

# Uso:
model = "mixtral-8x7b" if classification == LIGHT_LLM else "llama-70b"
temp = _ROUTING_TEMPERATURE[classification]
```

#### Recomendação
1. Monitore latência por roteamento:
   ```
   SELECT classification, AVG(latency_ms), COUNT(*) 
   FROM voice_requests 
   GROUP BY classification
   ```
2. Se FULL_LLM latência > 3s, reduza `full_llm_history_size` para 8 ou 6
3. Se cache hit rate < 10%, aumentar `no_llm_max_words` para 2

---

### 6.5 Qualidade de Resposta (LLM Output)

#### Problema Atual
- Respostas podem violar constraints (muito longas, markdown, etc.)
- Sem feedback explícito sobre "naturalidade" de pronúncia
- Correções muitas vezes não aparecem quando deveriam

#### Soluções de Parametrização

```python
# backend/services.py

# KNOB 1: Constraints de resposta
_RESPONSE_CONSTRAINTS = {
    "max_tokens": {
        "a1": 70,
        "a2": 90,
        "b1": 120,
        "b2": 150,
        "c1": 170,
        "c2": 190
    },
    "no_markdown": True,            # Proíbe *, ##, etc.
    "no_lists": True,
    "single_paragraph": True,
    "min_naturalness_score": 0.7    # 0-1 escala (LLM-evaluated)
}

# KNOB 2: Correction insertion policy
_CORRECTION_POLICY = {
    "always_correct": False,         # Só corrige se claro
    "correction_threshold": 0.85,    # Confidence threshold
    "max_corrections_per_turn": 1,   # Não overwhelm
    "correction_embedding_style": "natural",  # vs "explicit"
}

# KNOB 3: Echo strategy por stage
_ECHO_STRATEGY = {
    "early_stage": {
        "turns_threshold": 3,        # Primeiros 3 turnos
        "echo_probability": 0.8,     # Echo em 80% das vezes
        "echo_words_limit": 1        # Max 1 palavra
    },
    "mid_stage": {
        "turns_threshold": 10,
        "echo_probability": 0.5,
        "echo_words_limit": 0        # Não repita
    },
    "late_stage": {
        "turns_threshold": 999,
        "echo_probability": 0.2,
        "echo_words_limit": 0
    }
}
```

#### Recomendação
1. Log todas as respostas + `naturalness_score` do LLM
2. Filtre logs com score < 0.7 e analise padrões
3. Refine `_LEVEL_VOICE_RULES` com exemplos reais

---

### 6.6 Persistência de Sessões & Comparação de Progresso

#### Problema Atual
- Armazena apenas últimas 20 sessões (limite de memória)
- Progresso é calculado vs sessão anterior apenas
- Sem decomposição de progresso por habilidade

#### Soluções de Parametrização

```python
# backend/db_models.py

class VoiceSession(Model):
    # Aumentar limite de histórico
    max_sessions_per_user = 100  # ← Parametrizável
    
    # Decompor radar por contexto
    radar = {
        "overall": {...},
        "by_topic": {
            "restaurant": {...},
            "job_interview": {...}
        },
        "by_level": {
            "a1_patterns": {...}
        }
    }
    
    # Trend analysis
    trend = {
        "fluency_trend": 1.2,      # % melhoria 7 dias
        "grammar_trend": 0.8,      # % queda 7 dias
        "consistency": 0.85        # Std dev de scores
    }
```

#### Recomendação
1. Implemente limpeza + archive de sessões antigas para S3/data warehouse
2. Crie view `user_learning_trajectory` agregando ultimas 50 sessões
3. Compare trends vs coorte (usuários do mesmo level/contexto)

---

## 7. DEBUGGING & OBSERVABILIDADE

### Logs Principais para Monitorar

```
[VOICE-CHAT] START | user_id | timestamp
[CLASSIFICATION] classification_type | message_length
[CLARIFICATION] Needed | reason (empty_input, low_confidence, etc.)
[LANGUAGE-DETECTION] language | confidence | pt_hits | en_hits
[INTENT-DETECTION] intent_type | level | guidance_applied
[API-CALL] model | num_messages | max_tokens | latency_ms
[CORRECTION] error_type | confidence
[CACHE-HIT] ou [CACHE-SET] cache_key
[SHADOW-MODE] phrase | attempts | score | auto_progressed
[VOICE-RECAP] quality_score | exchanges | duration
```

### Queries Úteis de Análise

```sql
-- Acurácia de detecção de linguagem por hora
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    detected_language,
    AVG(stt_confidence) as avg_confidence,
    COUNT(*) as requests
FROM voice_requests
GROUP BY hour, detected_language
ORDER BY hour DESC
LIMIT 24;

-- Taxa de clarificação necessária
SELECT 
    user_level,
    ROUND(100.0 * SUM(CASE WHEN clarification_needed THEN 1 ELSE 0 END) 
          / COUNT(*), 2) as clarification_rate_pct,
    COUNT(*) as total_requests
FROM voice_requests
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_level;

-- Distribuição de roteamento de modelos
SELECT 
    classification,
    COUNT(*) as count,
    AVG(latency_ms) as avg_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency_ms
FROM voice_requests
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY classification;

-- Top erros gramaticais
SELECT 
    error_type,
    COUNT(*) as frequency,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as pct
FROM (
    SELECT unnest(top_error_types) as error_type
    FROM voice_sessions
) errors
GROUP BY error_type
ORDER BY frequency DESC;
```

---

## 8. CHECKLIST DE OTIMIZAÇÃO

- [ ] Ajuste `stt_confidence_threshold` baseado em taxa de clarificação
- [ ] Validate `error_severity_weights` vs human feedback
- [ ] Profile latência por modelo (LIGHT vs FULL)
- [ ] Monitore cache hit rate (target: 15-25%)
- [ ] Implemente early exit para respostas muito longas (truncate + retentativa)
- [ ] Adicione A/B test para `_LEVEL_VOICE_RULES` variações
- [ ] Measure `naturalness_score` consistently
- [ ] Setup alertas para failure rate > 5% por classificação
- [ ] Archive sessões antigas para data warehouse
- [ ] Implemente progressive shadow mode difficulty (fácil → médio → difícil)

---

## Resumo Executivo

O sistema de voz do GRILO é **arquitetonicamente sólido** mas possui **oportunidades de parametrização** para diferentes contextos de aprendizado:

1. **Input**: Whisper+langdetect+intent → análise em cascata, resiliente
2. **Roteamento**: Decision engine eficiente, economiza tokens
3. **Métricas**: Completas mas **cálculos não auditáveis** (LLM-dependent)
4. **Progresso**: Armazenado, mas comparação limitada

**Principais recomendações**:
- Desacoplar cálculos de radar do LLM (criar fórmulas explícitas)
- Rastrear intent detection accuracy vs human labels
- Implementar progressive difficulty no shadow mode
- Adicionar observabilidade de correções (quando aparecem, quando não)
