# 🎯 PROMPT PARA GERAR DIAGRAMA COMPLETO DO SISTEMA GRILO

## CONTEXTO GERAL
**Nome do Sistema**: GRILO - Plataforma de Ensino de Inglês por Voz & Texto  
**Stack**: FastAPI Backend (Python) + Frontend HTML/JS  
**Banco de Dados**: SQLite  
**Modelos IA**: Groq API (Mixtral 8x7b, Llama 70B)

---

## 📊 ARQUITETURA DO SISTEMA

### LAYER 1: ENTRADA (Frontend)
```
┌─────────────────────────────────────┐
│   HTML PAGES (Frontend)              │
├─────────────────────────────────────┤
│ • index.html (Landing/Home)          │
│ • home.html (Dashboard)              │
│ • lessons.html (Lessons Module)      │
│ • voice.html (Voice Chat Interface)  │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│   JavaScript Controllers             │
├─────────────────────────────────────┤
│ ✅ chat-text-controller.js           │ (ATIVO - Chat texto com feedback)
│ ✅ chat-voice-controller.js          │ (ATIVO - Voice com STT/TTS)
│ ✅ lessons-controller.js             │ (ATIVO - Quiz e módulos)
│ ✅ quiz-controller.js                │ (ATIVO - Quiz interativo)
│ ✅ form-handler.js                   │ (ATIVO - Login/Register)
│ ✅ grilo-animations.js               │ (ATIVO - Animações UI)
│ ✅ utils.js                          │ (ATIVO - Utilities)
│ ✅ lessons-enhanced.js               │ (ATIVO - Lições melhoradas)
└─────────────────────────────────────┘
```

---

### LAYER 2: SERVIDOR (FastAPI - Python)

#### 🚀 ENTRY POINT
```
start_server.py (OU run_server.py)
    ↓
uvicorn.run("server:app")
    ↓
server.py (FastAPI App)
```

#### 📡 ROTAS API (server.py registra 4 routers)
```
server.py (FastAPI Application)
├── Health Check Endpoint
│   └─ GET /health → {"status": "ok"}
│
├── Frontend Routes
│   ├─ GET / → index.html
│   ├─ GET /home.html → home.html
│   ├─ GET /lessons.html → lessons.html
│   └─ GET /voice.html → voice.html
│
├── API Router 1: AUTH (auth_controller.py)
│   ├─ POST /api/register → TokenResponse + User
│   └─ POST /api/login → TokenResponse + Streak Update + XP Award
│
├── API Router 2: CHAT TEXT (chat_text_controller.py)
│   ├─ POST /api/chat-text → {reply, translation, feedback, xp}
│   ├─ POST /api/sessions/text → Create session
│   ├─ GET /api/sessions/text/{id} → Get session
│   ├─ GET /api/sessions/text → List all sessions
│   └─ POST /api/sessions/text/{id}/summary → Session recap
│
├── API Router 3: CHAT VOICE (chat_voice_controller.py)
│   ├─ POST /api/voice-chat → {response, metrics, cache_stats}
│   ├─ POST /api/stt → STT via Groq
│   ├─ POST /api/tts → TTS via ElevenLabs (com fallback)
│   ├─ GET /api/voice/metrics → Metrics summary
│   ├─ POST /api/voice/cache/clear → Cache management
│   └─ POST /api/voice/help/... → Voice Help Shadowing
│
└── API Router 4: LESSONS (lessons_controller.py)
    ├─ GET /api/lessons → List all lessons
    ├─ GET /api/lessons/{id} → Get lesson detail
    ├─ POST /api/lessons/{id}/exercise → Submit exercise
    ├─ POST /api/quiz → Quiz questions
    ├─ GET /api/quiz/questions → Get questions
    └─ POST /api/quiz/submit → Submit quiz answer
```

---

### LAYER 3: LÓGICA DE NEGÓCIO (Backend Core)

#### 🔧 MÓDULOS PRINCIPAIS (Sempre Chamados)

**1. database.py** 
```
├── DATABASE_URL (SQLite path)
├── engine (SQLAlchemy engine)
├── SessionLocal (Session factory)
├── Base (Declarative base for models)
└── get_db() → FastAPI dependency
    └─ Injeta session em todos os endpoints
```

**2. db_models.py** (SQLAlchemy ORM Models)
```
├── User (users table)
│   ├─ id, username, email, password_hash
│   ├─ level (1-6: A1-C2), xp, streak
│   ├─ onboarding_step, learning_why, daily_interests
│   └─ Relationships: conversations[], badges[]
│
├── UserProgress (user_progress table)
│   ├─ xp_daily, streak_count, total_conversations
│   ├─ voice_seconds, voice_sessions (JSON)
│   └─ last_active_date, updated_at
│
├── Conversation (conversations table)
│   ├─ user_id, message_role, message_text
│   ├─ translation, language, xp_awarded
│   ├─ error_corrections (JSON), writing_accuracy_score
│   ├─ grammar_focus_area, new_vocabulary (JSON)
│   └─ timestamp
│
├── Badge (badges table)
│   ├─ name, description, icon
│   ├─ xp_threshold, type (milestone/streak/vocabulary)
│   └─ created_at
│
└── [ADICIONAIS - Voice Help]
    ├─ VoicePhrase (voice_phrases table)
    ├─ ShadowModeAnalytic (shadow_analytics table)
    └─ UserActivity (user_activity table)
```

**3. auth.py** (JWT + Password Hashing)
```
├── SECRET_KEY (env var)
├── hash_password() → bcrypt (12 rounds)
├── verify_password()
├── create_access_token() → JWT 24h expiry
├── verify_token()
├── get_current_user_id() → Header dependency
└── get_current_user() → DB dependency
    └─ Usado em: /api/chat-text, /api/voice-chat, /api/lessons
```

**4. schemas.py** (Pydantic Request/Response Models)
```
├── UserRegister
├── UserLogin
├── TokenResponse
├── UserResponse
├── ChatRequest (Texto + Voz)
│   ├─ message, language, history
│   ├─ level, voice_mode, conversation_topic
│   ├─ bilingual_mode, input_bridge_mode
│   └─ shadow_mode (ShadowModeData)
├── ShadowModeData (Pronunciation analytics)
├── ConversationMessageResponse
└── UserProgressResponse
```

**5. utils/__init__.py** (XP & Streak System)
```
├── _XP_THRESHOLDS = [0, 200, 600, 1400, 2800, 5000]
├── award_xp(db, user_id, amount, source)
│   ├─ Updates User.xp, User.level
│   ├─ Updates UserProgress.xp_daily
│   └─ Returns: {xp_earned, new_total, level_up, new_level}
├── update_streak(db, user_id)
│   ├─ Checa last_active_date vs hoje
│   ├─ Incrementa streak ou reseta
│   ├─ Award 5 XP + bonus de streak
│   └─ Returns: {streak, streak_bonus_xp, is_new_day}
└── mark_activity(db, user_id, activity_type)
    └─ Incrementa counter diário por tipo
```

**6. services.py** (IA Processing - O Motor da Plataforma)
```
├── GROQ CLIENT (LLM Backend)
│   └─ Mixtral 8x7b / Llama 70B
│
├── RAG System (Lazy-loaded)
│   ├─ _get_rag_store() → Vector store com ChromaDB
│   ├─ _fetch_rag_context_sync(query, level)
│   └─ Recupera PDF chunks relevantes por nível
│
├── DECISION ENGINE
│   ├─ voice_router.classify(request)
│   └─ Classifica em: NO_LLM | CACHE_HIT | LIGHT_LLM | FULL_LLM
│
├── VOICE CACHE
│   └─ voice_cache.get/set(key) → LRU + TTL
│
├── FALLBACK STRATEGY
│   └─ GraciousFallback.get_fallback_response()
│
├── LANGUAGE DETECTION
│   ├─ _PT_DETECTION_HINTS, _EN_DETECTION_HINTS
│   └─ Detecta PT vs EN automaticamente
│
├── Main Processing Functions
│   ├─ async generate_text_reply() → Chat Texto
│   ├─ async generate_voice_reply() → Voice (c/ decision engine)
│   ├─ async translate_pt_to_en() → Tradução
│   ├─ async generate_voice_recap() → Session summary
│   └─ Múltiplas funções de processamento específicas por modo
│
└── _NO_LLM_RESPONSES = {dict de 50+ responses pré-definidas}
    └─ Instantâneos: "hi"→"Hello!", "sim"→"Ótimo!"
```

---

### LAYER 4: OTIMIZAÇÕES (Todos Integrados)

**1. decision_engine.py** (Token Saver)
```
VoiceRequestRouter.classify(request) → VoiceRequestClassification
├─ NO_LLM (0 tokens, <30ms)
│   └─ Ultra-short utterances
│
├─ CACHE_HIT (0 tokens, <5ms)
│   └─ Cached responses
│
├─ LIGHT_LLM (200-300 tokens, 1-2s)
│   └─ Mixtral for simple queries
│
└─ FULL_LLM (600-1000 tokens, 2-5s)
    └─ Llama 70B for complex/shadow mode
```

**2. voice_cache.py** (Latency Saver)
```
VoiceResponseCache (max_size=1000, ttl=3600s)
├─ compute_key(text, level, mode) → normalized key
├─ get(key) → cached response if valid
├─ set(key, value) → store with LRU eviction
└─ stats: {hits, misses, evictions}
```

**3. fallback.py** (UX Resilience)
```
GraciousFallback.get_fallback_response(voice_mode, error_type, level)
├─ free mode: "I need a moment to think..."
├─ guided mode: "Let me gather my thoughts..."
├─ shadow mode: "Take a breath. Ready to try again?"
└─ dictation mode: "Give me a moment..."
```

**4. voice_metrics.py** (Monitoring)
```
VoiceMetrics (window_size=100)
├─ record_request(classification, model, latency_ms, tokens_consumed)
├─ get_summary() → {requests, errors, latency_p95/p99, token_usage, by_classification}
└─ Used in: chat_voice_controller.py /api/voice/metrics
```

---

### LAYER 5: CONTEÚDO PEDAGÓGICO

#### ✅ ATIVOS (Usados)

**1. quiz_questions.py**
```
QUIZ_QUESTIONS = [100 perguntas de CEFR A1]
├─ Estrutura: id, category, subcategory, difficulty
├─ Categorias: Vocabulary, Grammar, Comprehension, Listening
├─ Dificuldade: VERY_EASY (1) a CHALLENGING (4)
├─ Cada pergunta: options[], correct_index, explanation
└─ Usado em: lessons_controller.py /api/quiz/questions
```

**2. lessons_v2.py**
```
PT_BR_DIDACTIC_OVERRIDES = {1-5: Lições A1 com override em PT}
├─ Lição 1: "Hello e Hi: cumprimentos básicos"
├─ Lição 2: "Bom dia, boa tarde, boa noite"
├─ Lição 3: "Como se apresentar"
├─ Lição 4: "Como perguntar nome"
└─ Lição 5: "Respostas educadas"
```

**3. pedagogy_orchestrator.py**
```
ONBOARDING FLOW
├─ get_welcome_message()
├─ get_question_why_learn()
├─ get_question_interests()
├─ generate_practical_demo(why, interests) → Groq LLM
└─ async generate_normal_tutoring_response() → Chat tutor
    └─ System prompt: English-only immersion
```

**4. utils/prompts.py**
```
├─ prompt_perguntas (Gerar perguntas)
├─ prompt_continuacao (Continuar conversa)
├─ prompt_historia (Gerar história)
├─ prompt_analise (Analisar resposta)
├─ prompt_sugestao (Sugestões de aprendizado)
├─ prompt_refinar_bloco (Refinar texto)
└─ prompt_combinar_historias (Combinar histórias)
```

#### ❌ NUNCA CHAMADOS (Unused)

**1. lessons_a1_13_30.py** (Arquivo legado)
```
❌ Nunca importado
❌ Substituído por: lessons_v2.py
❌ Continha: Lições 13-30 (desatualizado)
```

**2. lessons_a1_31_50.py** (Arquivo legado)
```
❌ Nunca importado
❌ Substituído por: lessons_v2.py
❌ Continha: Lições 31-50 (desatualizado)
```

**3. migrate_add_voice_sessions.py** (Arquivo de migração única)
```
❌ Script standalone - executado MANUALMENTE uma vez
❌ Propósito: Add voice_sessions column
❌ Agora integrado em: server.py _run_migrations()
❌ Nunca chamado automaticamente
```

**4. test_shadow_mode.py** (Arquivo de teste)
```
❌ Script de teste standalone
❌ Usado para validação manual
❌ Não chamado por: nenhum módulo
❌ Propósito: Test Voice Help Shadowing endpoint
```

**5. test-schema.js** (Arquivo de teste browser)
```
❌ Script de validação localStorage
❌ Executado manualmente em console
❌ Não carregado automaticamente
❌ Propósito: Validate message schema structure
```

---

## 🔗 DEPENDÊNCIAS E FLUXO

### Fluxo 1: AUTENTICAÇÃO
```
Frontend (form-handler.js)
    ↓ POST /api/register
    ↓ POST /api/login
    ↓
auth_controller.py
    ├─ Valida credenciais (auth.py)
    ├─ Cria JWT token
    ├─ Award XP/Streak (utils/__init__.py)
    └─ Retorna: TokenResponse
    ↓ Frontend
    └─ Salva token em localStorage
```

### Fluxo 2: CHAT TEXTO
```
Frontend (chat-text-controller.js)
    ↓ POST /api/chat-text
    ↓
chat_text_controller.py
    ├─ Valida auth (auth.py)
    ├─ Chama: services.generate_text_reply()
    │   ├─ Detecta idioma
    │   ├─ Recupera histórico
    │   ├─ Chama Groq LLM
    │   ├─ Award XP (utils)
    │   └─ Retorna: {reply, translation, feedback, xp}
    └─ Salva em DB (db_models.Conversation)
    ↓ Frontend
    ├─ Mostra reply + translation
    ├─ Renderiza feedback panels
    └─ Salva em localStorage com metadata
```

### Fluxo 3: CHAT VOZ
```
Frontend (chat-voice-controller.js)
    ├─ Captura áudio do microfone
    ├─ Envia para POST /api/stt (Speech-to-Text)
    │   ├─ Groq Transcription API
    │   └─ Retorna: {transcript, confidence}
    │
    ├─ Envia para POST /api/voice-chat
    │   ├─ decision_engine.classify() → classificação
    │   ├─ Se NO_LLM: resposta instantânea
    │   ├─ Se CACHE_HIT: recupera do cache
    │   ├─ Se LIGHT/FULL_LLM: chama services.generate_voice_reply()
    │   ├─ voice_cache.set(response)
    │   ├─ voice_metrics.record()
    │   └─ Retorna: {response, metrics, cache_stats}
    │
    └─ Envia para POST /api/tts (Text-to-Speech)
        ├─ ElevenLabs API (se disponível)
        ├─ Fallback: Browser Web Speech API
        └─ Retorna: áudio MP3
```

### Fluxo 4: LIÇÕES & QUIZ
```
Frontend (lessons-controller.js / quiz-controller.js)
    ├─ GET /api/lessons → lista de lições
    ├─ GET /api/lessons/{id} → detalhe com exercícios
    ├─ GET /api/quiz/questions → 100 perguntas
    │
    └─ POST /api/quiz/submit
        ├─ Valida resposta
        ├─ Award XP (utils)
        └─ Retorna: {correct, explanation, xp}
```

---

## 📦 DEPENDÊNCIAS EXTERNAS

```
┌─────────────────────────────────┐
│   EXTERNAL APIs & SERVICES      │
├─────────────────────────────────┤
│ • Groq API (LLM)                │ → services.py
│   └─ Mixtral 8x7b / Llama 70B   │
│                                 │
│ • ElevenLabs API (TTS)          │ → chat_voice_controller.py
│   └─ Text-to-Speech             │
│                                 │
│ • ChromaDB (Vector Store)       │ → rag/vector_store.py
│   └─ PDF semantic search        │
│                                 │
│ • FastAPI + Uvicorn            │ → server.py
│ • SQLAlchemy ORM               │ → database.py
│ • Pydantic Validation          │ → schemas.py
│ • PyJWT + bcrypt               │ → auth.py
│ • LangDetect                   │ → services.py
│ • HTTPX                        │ → controllers (HTTP calls)
└─────────────────────────────────┘
```

---

## 🎯 MAPA DE CHAMADAS (CALL GRAPH)

### Quem chama quem?

```
server.py (main app)
├─ database.py (get_db)
├─ db_models.py (Conversation, User, UserProgress)
├─ auth_controller.py
│   ├─ auth.py (create_token, verify_password)
│   ├─ utils/__init__.py (award_xp, update_streak)
│   └─ db_models.py (User, UserProgress)
│
├─ chat_text_controller.py
│   ├─ services.py (generate_text_reply)
│   │   ├─ decision_engine.py (router.classify)
│   │   ├─ voice_cache.py (get/set)
│   │   ├─ rag/vector_store.py (RAG retrieval)
│   │   └─ Groq API
│   ├─ db_models.py (Conversation)
│   └─ utils/__init__.py (award_xp, mark_activity)
│
├─ chat_voice_controller.py
│   ├─ services.py (generate_voice_reply, chat_concise_voice)
│   │   ├─ decision_engine.py
│   │   ├─ voice_cache.py
│   │   ├─ fallback.py
│   │   └─ Groq API (STT + LLM)
│   ├─ voice_metrics.py (record_request)
│   ├─ db_models.py (VoicePhrase, ShadowModeAnalytic)
│   ├─ ElevenLabs API (TTS)
│   └─ utils/__init__.py (award_xp, mark_activity)
│
└─ lessons_controller.py
    ├─ quiz_questions.py (QUIZ_QUESTIONS)
    ├─ lessons_v2.py (PT_BR_DIDACTIC_OVERRIDES)
    ├─ db_models.py (Conversation)
    ├─ services.py (generate_voice_reply para algumas lições)
    └─ utils/__init__.py (award_xp)

[NUNCA CHAMADOS]
├─ lessons_a1_13_30.py ❌
├─ lessons_a1_31_50.py ❌
├─ migrate_add_voice_sessions.py ❌ (chamado manualmente uma vez)
├─ test_shadow_mode.py ❌ (teste manual)
└─ test-schema.js ❌ (teste browser manual)
```

---

## 🔍 ESTADO DO SISTEMA

### ✅ COMPLETO E FUNCIONAL
- ✅ Autenticação (JWT + bcrypt)
- ✅ Chat Texto com feedback de gramática
- ✅ Chat Voz com STT/TTS
- ✅ Sistema de XP e Streak
- ✅ Quiz (100 questões A1)
- ✅ Lições estruturadas (5+ lições)
- ✅ Decision Engine (classificação de requisições)
- ✅ Voice Cache (LRU + TTL)
- ✅ Fallback Strategy (UX resilience)
- ✅ Voice Metrics (monitoramento)
- ✅ RAG System (PDF semantic search)
- ✅ Pedagogical Orchestration (onboarding)

### ⚠️ LEGADO / NÃO UTILIZADO
- ❌ lessons_a1_13_30.py (substituído por lessons_v2.py)
- ❌ lessons_a1_31_50.py (substituído por lessons_v2.py)
- ❌ migrate_add_voice_sessions.py (integrado em server.py)
- ❌ test_shadow_mode.py (arquivo de teste)
- ❌ test-schema.js (arquivo de teste)

### 🚀 OTIMIZAÇÕES IMPLEMENTADAS
1. **Decision Engine**: Reduz tokens consumidos em ~40%
2. **Voice Cache**: Reduz latência em ~20-30%
3. **Fallback Strategy**: Mantém UX mesmo com API failures
4. **Voice Metrics**: Monitora performance em tempo real
5. **RAG System**: Busca semântica em PDFs

---

## 🎓 INFORMAÇÕES ADICIONAIS

### Base de Dados
```
SQLite (grilo.db)
├─ users (7 users currently)
├─ user_progress
├─ conversations (1000+ entries)
├─ badges
├─ user_badges
├─ voice_phrases
├─ shadow_analytics
└─ user_activity
```

### Variáveis de Ambiente Requeridas
```
DATABASE_URL=sqlite:///./grilo.db
GROQ_API_KEY=xxx
MODEL_NAME=mixtral-8x7b-32768 (ou llama-3.3-70b-versatile)
SECRET_KEY=xxx (JWT secret)
ELEVENLABS_API_KEY=xxx (opcional, fallback para browser TTS)
GROQ_TRANSCRIPTION_API_KEY=xxx (STT)
```

### Modos de Voice Chat
```
1. free        → Conversa livre sem estrutura
2. guided      → Conversa com tópico/cenário
3. shadow      → Repetição de pronunciação
4. dictation   → Ditado (escrever ouvindo)
```

### Níveis CEFR Suportados
```
a1, a2, b1, b2, c1, c2
```

---

## 📋 RESUMO EXECUTIVO

Este é um **sistema completo e integrado** de ensino de inglês interativo com:

1. **Frontend**: 4 páginas HTML + 8 JS controllers
2. **Backend**: FastAPI + 4 API routers + 15 módulos Python
3. **IA**: Groq LLM + Decision Engine + Cache + Fallback
4. **Banco**: SQLite com 8 tabelas + migrações automáticas
5. **Otimizações**: 5 sistemas de performance (decision engine, cache, metrics, fallback, RAG)
6. **Conteúdo**: 100+ Quiz + 5+ Lições estruturadas
7. **Monitoramento**: Métricas em tempo real + voice analytics

**Arquivos Legados/Não-Chamados**: 5 arquivos que podem ser documentados como "Histórico" ou removidos:
- lessons_a1_13_30.py
- lessons_a1_31_50.py  
- migrate_add_voice_sessions.py
- test_shadow_mode.py
- test-schema.js

---

## 🎨 COMO USAR ESTE PROMPT NO CHATGPT

### Instruções para ChatGPT:

> **"Using the following comprehensive system architecture documentation, create a detailed system diagram for the GRILO English Learning Platform that shows:**
>
> 1. **All four HTML frontend pages** connected to their respective JS controllers
> 2. **FastAPI server** with all 4 API routers (Auth, Chat Text, Chat Voice, Lessons)
> 3. **Core backend services** (database, models, auth, services, schemas)
> 4. **Optimization layers** (decision engine, cache, metrics, fallback)
> 5. **External APIs** (Groq, ElevenLabs, ChromaDB)
> 6. **Data flows** between components
> 7. **Database schema** (8 tables)
> 8. **Color-code unused/legacy files** (lessons_a1_13_30, lessons_a1_31_50, migration scripts, test files)
> 9. **Use different colors** for:
>    - ✅ Active/production code (GREEN)
>    - ⚠️ Optimization layers (BLUE)
>    - ❌ Legacy/unused code (GRAY)
>    - 🔴 External dependencies (RED)
> 10. **Include metrics and statistics** on each component
>
> Format: **Mermaid diagram or clean architecture diagram** (your choice)"

---

**Pronto! Copie todo este arquivo e cole no ChatGPT, depois passe as instruções acima.**

