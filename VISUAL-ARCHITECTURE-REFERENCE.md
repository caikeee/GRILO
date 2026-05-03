# 🎨 DIAGRAMA VISUAL SIMPLIFICADO - GRILO System

## VERSÃO SIMPLIFICADA PARA REFERÊNCIA RÁPIDA

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    GRILO - ENGLISH LEARNING PLATFORM                        ║
╚══════════════════════════════════════════════════════════════════════════════╝


                           ┌─────────────────────────────────┐
                           │    🌐 FRONTEND (HTML/JS)        │
                           └─────────────────────────────────┘
                                        │
         ┌──────────────┬───────────────┼───────────────┬──────────────┐
         │              │               │               │              │
      ┌──────┐    ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌───────┐
      │index │    │  home    │   │ lessons  │   │  voice   │   │  css  │
      └──────┘    └──────────┘   └──────────┘   └──────────┘   └───────┘
         │              │               │               │
         └──────────────┼───────────────┼───────────────┘
                        │
         ┌──────────────┴───────────────┬──────────────┐
         │                              │              │
    ┌─────────────┐  ┌────────────────┐  ┌───────────┐
    │  form-      │  │  chat-text-    │  │  lessons- │
    │ handler.js  │  │ controller.js  │  │controller │
    └─────────────┘  └────────────────┘  └───────────┘
         │                  │                  │
         │                  │                  │
         │          ┌────────────────────────┐ │
         │          │  chat-voice-      │      │
         │          │ controller.js  │      │
         │          │                │      │
         └──────────┴────────────────┼──────┘
                    │                │
                    │                │
                    ▼                ▼
           ╔═══════════════════════════════╗
           ║   🚀 FASTAPI BACKEND SERVER   ║
           ║        (Python)               ║
           ║  Server: http://127.0.0.1:8000║
           ╚═══════════════════════════════╝
                    │
    ┌───────────────┼───────────────┬─────────────────┐
    │               │               │                 │
    ▼               ▼               ▼                 ▼
┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐
│ Health  │   │ Frontend │   │ Static   │   │   API Routes │
│ Endpoint│   │  Routes  │   │  Files   │   │   (4 routers)│
└─────────┘   └──────────┘   └──────────┘   └──────────────┘
                                                    │
                    ┌───────────────────────────────┼────────────────────────┬──────────┐
                    │                               │                        │          │
                    ▼                               ▼                        ▼          ▼
         ┌────────────────────┐   ┌────────────────────┐   ┌─────────┐  ┌────────┐
         │    AUTH Router     │   │  CHAT TEXT Router  │   │ CHAT    │  │LESSONS │
         │ • POST /register   │   │ • POST /chat-text  │   │ VOICE   │  │ Router │
         │ • POST /login      │   │ • GET sessions     │   │ Router  │  │        │
         │ • Update streak    │   │ • POST summary     │   │         │  │        │
         │ • Award XP         │   │                    │   │         │  │        │
         └────────────────────┘   └────────────────────┘   └─────────┘  └────────┘


           ╔════════════════════════════════════════════════════════════════╗
           ║             🔧 CORE BACKEND MODULES (ALWAYS CALLED)           ║
           ╠════════════════════════════════════════════════════════════════╣
           │                                                                │
           │  ┌────────────┐  ┌──────────┐  ┌─────────┐  ┌────────────┐   │
           │  │ database   │  │ db_      │  │ auth    │  │ schemas    │   │
           │  │ .py        │  │ models   │  │ .py     │  │ .py        │   │
           │  │            │  │ .py      │  │ (JWT +  │  │ (Pydantic) │   │
           │  │ • engine   │  │ (ORM     │  │ bcrypt) │  │            │   │
           │  │ • session  │  │ Models)  │  │         │  │ • User     │   │
           │  │   factory  │  │          │  │         │  │   models   │   │
           │  │            │  │ • User   │  │         │  │ • Chat     │   │
           │  │            │  │ • Convo  │  │         │  │   request  │   │
           │  │            │  │ • Badge  │  │         │  │            │   │
           │  │            │  │ • Voice  │  │         │  │            │   │
           │  └────────────┘  └──────────┘  └─────────┘  └────────────┘   │
           │                                                                │
           └────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
           ╔════════════════════════════════════════════════════════════════╗
           ║          🧠 MAIN PROCESSING ENGINE - services.py             ║
           ║        (Heart of the Platform - LLM Processing)              ║
           ╠════════════════════════════════════════════════════════════════╣
           │                                                                │
           │  ┌─────────────────────────────────────────────────────────┐  │
           │  │ GROQ LLM Client (Mixtral 8x7b / Llama 70B)             │  │
           │  └─────────────────────────────────────────────────────────┘  │
           │                  │                                             │
           │    ┌─────────────┼─────────────┐                             │
           │    │             │             │                             │
           │    ▼             ▼             ▼                             │
           │  generate_   generate_    translate_                         │
           │  text_       voice_       pt_to_en()                         │
           │  reply()     reply()                                         │
           │    │             │                                           │
           │    └─────────────┴────────────┐                             │
           │                              ▼                              │
           │                   Language Detection                        │
           │                   + RAG (ChromaDB)                          │
           │                                                             │
           └─────────────────────────────────────────────────────────────┘


           ╔════════════════════════════════════════════════════════════════╗
           ║        ⚡ OPTIMIZATION LAYERS (Voice Chat Performance)        ║
           ╠════════════════════════════════════════════════════════════════╣
           │                                                                │
           │  ┌──────────────────────┐  ┌────────────────────────────┐    │
           │  │  DECISION ENGINE     │  │    VOICE CACHE (LRU+TTL)   │    │
           │  │ decision_engine.py   │  │ voice_cache.py             │    │
           │  │                      │  │                            │    │
           │  │ Classifies request   │  │ • compute_key()            │    │
           │  │ into 4 routes:       │  │ • get() / set()            │    │
           │  │                      │  │ • LRU eviction             │    │
           │  │ 1. NO_LLM (0ms)      │  │ • TTL expiry               │    │
           │  │    ↓                 │  │ • Hit/miss tracking        │    │
           │  │ 2. CACHE_HIT (<5ms)  │  │                            │    │
           │  │    ↓                 │  │ Result: 20-30% latency     │    │
           │  │ 3. LIGHT_LLM (1-2s)  │  │ reduction + 15% hit rate   │    │
           │  │    ↓                 │  │                            │    │
           │  │ 4. FULL_LLM (2-5s)   │  │                            │    │
           │  │                      │  │                            │    │
           │  │ Result: 40% token    │  └────────────────────────────┘    │
           │  │ reduction            │                                     │
           │  └──────────────────────┘                                     │
           │                                                                │
           │  ┌──────────────────────┐  ┌────────────────────────────┐    │
           │  │  FALLBACK STRATEGY   │  │   VOICE METRICS            │    │
           │  │ fallback.py          │  │ voice_metrics.py           │    │
           │  │                      │  │                            │    │
           │  │ Graceful fallback    │  │ • record_request()         │    │
           │  │ when APIs fail       │  │ • classification tracking  │    │
           │  │                      │  │ • latency percentiles      │    │
           │  │ • Rate limit         │  │ • token usage monitoring   │    │
           │  │ • Timeout            │  │ • error rate analysis      │    │
           │  │ • API error          │  │                            │    │
           │  │ • Unknown error      │  │ Used in: /api/voice/       │    │
           │  │                      │  │          metrics endpoint   │    │
           │  │ Maintains UX even    │  │                            │    │
           │  │ during failures      │  │                            │    │
           │  └──────────────────────┘  └────────────────────────────┘    │
           │                                                                │
           └────────────────────────────────────────────────────────────────┘


           ╔════════════════════════════════════════════════════════════════╗
           ║          📚 PEDAGOGICAL CONTENT & ONBOARDING                  ║
           ╠════════════════════════════════════════════════════════════════╣
           │                                                                │
           │  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐   │
           │  │  QUIZ QUESTIONS  │  │  LESSONS         │  │ PEDAGOGY   │   │
           │  │ quiz_questions   │  │ lessons_v2.py    │  │ ORCHESTRA  │   │
           │  │ .py              │  │                  │  │ TOR        │   │
           │  │                  │  │ PT_BR_DIDACTIC   │  │ pedagogy   │   │
           │  │ • 100 questions  │  │ OVERRIDES        │  │ _orchestra │   │
           │  │ • CEFR A1 level  │  │                  │  │ .py        │   │
           │  │ • 4 categories   │  │ Lessons 1-5:     │  │            │   │
           │  │ • 4 difficulties │  │ • Greetings      │  │ Onboarding │   │
           │  │                  │  │ • Time phrases   │  │ Flow:      │   │
           │  │ Used by:         │  │ • Self-intro     │  │ 1. Welcome │   │
           │  │ /api/quiz/q...   │  │ • Ask name       │  │ 2. Why?    │   │
           │  │                  │  │ • Politeness     │  │ 3. Interest│   │
           │  │                  │  │                  │  │ 4. Demo    │   │
           │  │                  │  │ Each with:       │  │            │   │
           │  │                  │  │ • Real scenario  │  │ Output:    │   │
           │  │                  │  │ • Culture notes  │  │ Groq LLM   │   │
           │  │                  │  │ • Common errors  │  │ prompt     │   │
           │  │                  │  │ • Pronunciation  │  │            │   │
           │  └──────────────────┘  └──────────────────┘  └────────────┘   │
           │                                                                │
           │          ❌ LEGACY (Never Called):                           │
           │          • lessons_a1_13_30.py (replaced by lessons_v2)      │
           │          • lessons_a1_31_50.py (replaced by lessons_v2)      │
           │                                                                │
           └────────────────────────────────────────────────────────────────┘


           ╔════════════════════════════════════════════════════════════════╗
           ║             🗄️  DATABASE SCHEMA (SQLite)                     ║
           ╠════════════════════════════════════════════════════════════════╣
           │                                                                │
           │  ┌─────────────────────────────────────────────────────────┐  │
           │  │ users                    user_progress                 │  │
           │  │ • id (PK)                • id (PK)                     │  │
           │  │ • username               • user_id (FK)               │  │
           │  │ • email                  • xp_daily                   │  │
           │  │ • password_hash          • streak_count               │  │
           │  │ • level (1-6)            • voice_seconds              │  │
           │  │ • xp, streak             • voice_sessions (JSON)      │  │
           │  │ • onboarding_step        • last_active_date           │  │
           │  │ • learning_why           • updated_at                 │  │
           │  │ • daily_interests        └─────────────────────────────┘  │
           │  │ • created_at                                           │  │
           │  │                                                        │  │
           │  │ conversations            badges                      │  │
           │  │ • id (PK)                • id (PK)                   │  │
           │  │ • user_id (FK)           • name                      │  │
           │  │ • message_role           • description               │  │
           │  │ • message_text           • icon                      │  │
           │  │ • translation            • xp_threshold              │  │
           │  │ • language               • type                      │  │
           │  │ • xp_awarded             • created_at                │  │
           │  │ • error_corrections      └────────────────────────────┘  │
           │  │ • accuracy_score                                      │  │
           │  │ • grammar_focus          + voice_phrases             │  │
           │  │ • new_vocabulary         + shadow_analytics          │  │
           │  │ • timestamp              + user_activity             │  │
           │  │                                                        │  │
           │  └─────────────────────────────────────────────────────────┘  │
           │                                                                │
           └────────────────────────────────────────────────────────────────┘


           ╔════════════════════════════════════════════════════════════════╗
           ║        🔴 EXTERNAL DEPENDENCIES & API INTEGRATIONS           ║
           ╠════════════════════════════════════════════════════════════════╣
           │                                                                │
           │  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐   │
           │  │  GROQ API        │  │  ELEVENLABS API  │  │ CHROMADB   │   │
           │  │  (LLM)           │  │  (TTS)           │  │ (Vector DB)│   │
           │  │                  │  │                  │  │            │   │
           │  │ Models:          │  │ • Text-to-Speech │  │ • PDF      │   │
           │  │ • Mixtral 8x7b   │  │ • Voice options  │  │   ingestion│   │
           │  │ • Llama 70B      │  │ • Fallback to    │  │ • Semantic │   │
           │  │                  │  │   Web Speech API │  │   search   │   │
           │  │ Used by:         │  │                  │  │ • Level-   │   │
           │  │ • services.py    │  │ Used by:         │  │   based    │   │
           │  │   (main LLM)     │  │ /api/tts         │  │   retrieval│   │
           │  │ • chat_voice_    │  │                  │  │            │   │
           │  │   controller     │  │                  │  │ Used by:   │   │
           │  │   (STT)          │  │                  │  │ services.py│   │
           │  │ • RAG context    │  │                  │  │ (lazy-load)│   │
           │  │                  │  │                  │  │            │   │
           │  └──────────────────┘  └──────────────────┘  └────────────┘   │
           │                                                                │
           └────────────────────────────────────────────────────────────────┘


           ╔════════════════════════════════════════════════════════════════╗
           ║           ❌ TEST FILES & MIGRATION SCRIPTS (NOT CALLED)      ║
           ╠════════════════════════════════════════════════════════════════╣
           │                                                                │
           │  1. migrate_add_voice_sessions.py                             │
           │     └─ Script para executar UMA VEZ (migração de DB)         │
           │        └─ Agora integrado em: server.py _run_migrations()   │
           │        └─ Nunca chamado automaticamente                      │
           │                                                                │
           │  2. test_shadow_mode.py                                       │
           │     └─ Script de teste standalone                            │
           │        └─ Valida Voice Help Shadowing endpoint               │
           │        └─ Nunca chamado pelo sistema                         │
           │        └─ Uso: python test_shadow_mode.py --user-token XXX  │
           │                                                                │
           │  3. test-schema.js                                            │
           │     └─ Script de validação em browser console                 │
           │        └─ Valida estrutura de messages em localStorage        │
           │        └─ Executado manualmente em console                    │
           │                                                                │
           │  4. lessons_a1_13_30.py                                       │
           │     └─ Arquivo legado (lições 13-30)                         │
           │        └─ Substituído por: lessons_v2.py                     │
           │        └─ Nunca importado                                    │
           │                                                                │
           │  5. lessons_a1_31_50.py                                       │
           │     └─ Arquivo legado (lições 31-50)                         │
           │        └─ Substituído por: lessons_v2.py                     │
           │        └─ Nunca importado                                    │
           │                                                                │
           └────────────────────────────────────────────────────────────────┘


╔══════════════════════════════════════════════════════════════════════════════╗
║                      DATA FLOW DIAGRAM (Voice Chat)                          ║
╚══════════════════════════════════════════════════════════════════════════════╝

User speaks → Mic → JavaScript   
                        ↓
                   chat-voice-controller.js
                        ↓
     ┌──────────────────┴──────────────────┐
     ↓                                      ↓
POST /api/stt                         POST /api/voice-chat
(Groq Transcription)                        ↓
     ↓                          ┌───────────┴────────────┐
{transcript, confidence}         ↓                        ↓
     ↓                    decision_engine.py       voice_cache.py
     └────────────────────→ .classify()  ─────→  .get(key)?
                                 ↓                     │
                    ┌────────────┴─────────────┐      │
                    ↓                          ↓      │
                NO_LLM              (0 tokens) ←─────┘
             (instantaneous)        OR
             response                CACHE_HIT
             returned                (cached)
                    ↓                ↓
                    └────────────────┴──→ Groq LLM
                                         (LIGHT_LLM or FULL_LLM)
                                         ↓
                                    {reply, metadata}
                                         ↓
                                   voice_cache.py
                                      .set(key)
                                         ↓
                                    Frontend
                                         ↓
                         POST /api/tts (ElevenLabs)
                                         ↓
                              Audio MP3 → Speaker


╔══════════════════════════════════════════════════════════════════════════════╗
║                        COMPONENTE DETAILS - QUICK REFERENCE                  ║
╚══════════════════════════════════════════════════════════════════════════════╝

DECISION ENGINE (decision_engine.py)
├─ NO_LLM:        0 tokens,  ~30ms   (Greetings, yes/no)
├─ CACHE_HIT:     0 tokens,   ~5ms   (Cached responses)
├─ LIGHT_LLM:   200 tokens,  1-2s    (Mixtral)
└─ FULL_LLM:    600 tokens,  2-5s    (Llama 70B)
   Result: 40% token reduction

VOICE CACHE (voice_cache.py)
├─ Max size:     1000 entries
├─ TTL:          3600s (1 hour)
├─ Strategy:     LRU eviction
└─ Performance:  15-20% hit rate, 20-30% latency reduction

FALLBACK STRATEGY (fallback.py)
├─ Rate limit:   "I need a moment..."
├─ Timeout:      "My brain is thinking..."
├─ API error:    "Let me gather my thoughts..."
└─ Unknown:      "Sorry, didn't catch that..."
   Result: Graceful UX even when APIs fail

VOICE METRICS (voice_metrics.py)
├─ Latency:      average, p95, p99
├─ Tokens:       per request, total, by classification
├─ Errors:       count, rate, types
└─ Classifications: breakdown by router decision

XP & STREAK SYSTEM (utils/__init__.py)
├─ Levels:       1-6 (A1-C2)
├─ XP progress:  [0, 200, 600, 1400, 2800, 5000]
├─ Daily login:  5 XP base + streak bonus
└─ Activity:     Tracked by type (text, voice, quiz, etc)

RAG SYSTEM (rag/vector_store.py)
├─ Vector DB:    ChromaDB (SQLite)
├─ Documents:    PDFs in rag/chromadb_data/
├─ Chunks:       Stored by CEFR level
├─ Retrieval:    Semantic search + level filtering
└─ Usage:        Lazy-loaded in services.py

AUTH SYSTEM (auth.py)
├─ Password:     bcrypt (12 rounds)
├─ JWT:          24h expiry
├─ Verification: Token from header (Bearer token)
└─ Dependency:   Injected into protected endpoints
```

---

## 📊 Legenda de Cores (Para Diagrama em ChatGPT)

```
✅ GREEN   - Componentes ativos e em produção
⚡ BLUE    - Camadas de otimização (decision engine, cache, metrics)
🔴 RED     - APIs externas (Groq, ElevenLabs, ChromaDB)
⚠️ GRAY    - Arquivos legados / não chamados (lessons_a1_*, migrate_*, test_*)
🟡 YELLOW  - Dependências críticas (database, models, auth)
🟣 PURPLE  - Pedagogical content (lessons, quiz, pedagogy orchestrator)
```

---

## 🎯 Próximos Passos

1. **Copie o arquivo SYSTEM-DIAGRAM-PROMPT.md completo**
2. **Cole no ChatGPT com a prompt:**
   ```
   "Create a comprehensive system architecture diagram for GRILO platform using this documentation. 
   Format: Mermaid or clean SVG diagram. Show all layers, data flows, and color-code components as specified."
   ```
3. **Peça para ChatGPT gerar em:**
   - Mermaid diagram (copiar para mermaid.live)
   - SVG (salvar como imagem)
   - ASCII art melhorado
   - Ou qualquer formato que preferir

---

**Arquivo criado em:** `SYSTEM-DIAGRAM-PROMPT.md`  
**Tamanho:** ~8KB de análise completa e estruturada
**Uso:** Cole integralmente no ChatGPT para gerar diagramas profissionais

