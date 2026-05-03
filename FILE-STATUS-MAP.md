# 📋 MAPA COMPLETO DE ARQUIVOS - GRILO SYSTEM

## 🎯 STATUS DE CADA ARQUIVO NO SISTEMA

```
GRILO/
│
├─ 📄 DOCUMENTATION (Arquivos de Referência)
│  ├─ SYSTEM-DIAGRAM-PROMPT.md ........................ ✅ NOVO (Use no ChatGPT)
│  ├─ VISUAL-ARCHITECTURE-REFERENCE.md .............. ✅ NOVO (Diagrama ASCII)
│  ├─ IMPLEMENTATION-SUMMARY.md ....................... ✅ Referência do sistema
│  ├─ BACKEND-IMPLEMENTATION-COMPLETE.md ............ ✅ Referência do backend
│  ├─ OPTIMIZATION-IMPLEMENTATION.md ................ ✅ Otimizações do sistema
│  ├─ READY.md ....................................... ✅ Status check
│  ├─ CHECKLIST.md ................................... ✅ Checklist features
│  ├─ TEST-GUIDE.md .................................. ✅ Guia de testes
│  ├─ TESTING-DEPLOYMENT-GUIDE.md ................... ✅ Deployment guide
│  ├─ VOICE-HELP-SHADOWING-BACKEND.md .............. ✅ Voice Help feature
│  ├─ VOICE-HELP-SHADOWING-FRONTEND.md ............. ✅ Voice Help UI
│  ├─ BUSINESS-STRATEGY.md ........................... ✅ Estratégia do negócio
│  ├─ Gramatica-Pratica-da-Lingua-Inglesa-*.pdf .... ✅ Material de referência
│  └─ INGLES*.pdf .................................... ✅ Material de referência
│
├─ 🗄️ DATABASE (SQLite)
│  └─ grilo.db ........................................ ✅ ATIVO (7 users, 1000+ conversations)
│
├─ 🔙 BACKEND/
│  │
│  ├─ ✅ ENTRY POINTS (Core Entry)
│  │  ├─ start_server.py .............................. ✅ ATIVO (Principal entry point)
│  │  └─ run_server.py ................................ ✅ ATIVO (Alternativo)
│  │
│  ├─ ✅ MAIN APPLICATION (FastAPI)
│  │  └─ server.py .................................... ✅ ATIVO (FastAPI app, 4 routers)
│  │
│  ├─ ✅ DATABASE LAYER
│  │  ├─ database.py .................................. ✅ ATIVO (Engine, SessionLocal)
│  │  ├─ db_models.py ................................. ✅ ATIVO (8 ORM models)
│  │  └─ auth.py ...................................... ✅ ATIVO (JWT + bcrypt)
│  │
│  ├─ ✅ API LAYER (Request/Response)
│  │  ├─ schemas.py ................................... ✅ ATIVO (Pydantic models)
│  │  └─ controllers/
│  │     ├─ auth_controller.py ........................ ✅ ATIVO (Register/Login)
│  │     ├─ chat_text_controller.py .................. ✅ ATIVO (Text chat API)
│  │     ├─ chat_voice_controller.py ................. ✅ ATIVO (Voice chat API + STT/TTS)
│  │     └─ lessons_controller.py .................... ✅ ATIVO (Lessons/Quiz API)
│  │
│  ├─ ✅ BUSINESS LOGIC (Core Processing)
│  │  ├─ services.py .................................. ✅ ATIVO (LLM processing engine)
│  │  ├─ pedagogy_orchestrator.py .................... ✅ ATIVO (Onboarding + tutoring)
│  │  ├─ quiz_questions.py ........................... ✅ ATIVO (100 quiz questions)
│  │  └─ lessons_v2.py ............................... ✅ ATIVO (5+ lições estruturadas)
│  │
│  ├─ ✅ OPTIMIZATION LAYERS
│  │  ├─ decision_engine.py .......................... ✅ ATIVO (40% token reduction)
│  │  ├─ voice_cache.py .............................. ✅ ATIVO (20-30% latency reduction)
│  │  ├─ fallback.py ................................. ✅ ATIVO (Graceful error handling)
│  │  └─ voice_metrics.py ............................ ✅ ATIVO (Performance monitoring)
│  │
│  ├─ ✅ UTILITIES
│  │  ├─ utils/__init__.py ........................... ✅ ATIVO (XP/Streak system)
│  │  └─ utils/prompts.py ............................ ✅ ATIVO (LLM system prompts)
│  │  └─ utils/teaching_policy.py ................... ✅ ATIVO (Teaching rules)
│  │
│  ├─ ✅ RAG SYSTEM (Knowledge Base)
│  │  ├─ rag/
│  │  │  ├─ __init__.py
│  │  │  ├─ vector_store.py .......................... ✅ ATIVO (ChromaDB semantic search)
│  │  │  ├─ ingest.py ................................ ✅ Script (PDF → chunks)
│  │  │  ├─ chunking.py .............................. ✅ ATIVO (Text chunking)
│  │  │  ├─ pdf_extractor.py ......................... ✅ ATIVO (PDF parsing)
│  │  │  └─ chromadb_data/
│  │  │     ├─ chroma.sqlite3 ........................ ✅ Vector DB with PDFs
│  │  │     └─ 95b31188-c606.../
│  │  │
│  │  └─ [Nota: RAG é lazy-loaded, só ativado se PDFs forem ingeridos]
│  │
│  ├─ ❌ LEGACY - LESSONS (Substituted by lessons_v2.py)
│  │  ├─ lessons_a1_13_30.py ......................... ❌ NUNCA CHAMADO (use lessons_v2)
│  │  └─ lessons_a1_31_50.py ......................... ❌ NUNCA CHAMADO (use lessons_v2)
│  │
│  ├─ ❌ MIGRATION SCRIPTS (Run Once)
│  │  └─ migrate_add_voice_sessions.py .............. ❌ MANUAL (integrado em server.py)
│  │     └─ Status: Migração de DB agora em _run_migrations()
│  │
│  ├─ ❌ TEST FILES
│  │  └─ test_shadow_mode.py ......................... ❌ TEST ONLY (CLI script)
│  │     └─ Uso: python test_shadow_mode.py --user-token XXX
│  │
│  ├─ 📦 REQUIREMENTS
│  │  └─ requirements.txt ............................ ✅ Python dependencies
│  │
│  └─ 🔧 CONFIG
│     └─ .env (não rastreado) ......................... ✅ SECRET_KEY, API keys
│
├─ 🌐 FRONTEND/
│  │
│  ├─ ✅ HTML PAGES
│  │  ├─ index.html .................................. ✅ ATIVO (Landing page)
│  │  ├─ home.html ................................... ✅ ATIVO (Dashboard)
│  │  ├─ lessons.html ................................ ✅ ATIVO (Lessons module)
│  │  └─ voice.html .................................. ✅ ATIVO (Voice chat UI)
│  │
│  ├─ ✅ CSS STYLING
│  │  ├─ assets/css/
│  │  │  ├─ base.css ................................. ✅ Base styles
│  │  │  ├─ variables.css ............................ ✅ CSS variables
│  │  │  ├─ grilo-v3.css ............................ ✅ Main theme
│  │  │  └─ lessons.css ............................. ✅ Lessons styling
│  │  │
│  │  └─ [Note: CSS imported inline in HTML files]
│  │
│  ├─ ✅ JAVASCRIPT CONTROLLERS
│  │  ├─ assets/js/
│  │  │  ├─ form-handler.js .......................... ✅ ATIVO (Auth forms)
│  │  │  ├─ utils.js ................................ ✅ ATIVO (Utility functions)
│  │  │  ├─ grilo-animations.js ..................... ✅ ATIVO (UI animations)
│  │  │  ├─ lessons-enhanced.js ..................... ✅ ATIVO (Lessons UI)
│  │  │  │
│  │  │  └─ controllers/
│  │  │     ├─ chat/
│  │  │     │  └─ chat-text-controller.js ........... ✅ ATIVO (Text chat logic)
│  │  │     │
│  │  │     ├─ voice/
│  │  │     │  └─ chat-voice-controller.js ......... ✅ ATIVO (Voice chat logic)
│  │  │     │     └─ Handles: Mic → STT → LLM → TTS → Speaker
│  │  │     │
│  │  │     └─ lessons/
│  │  │        ├─ lessons-controller.js ............ ✅ ATIVO (Lessons list/detail)
│  │  │        └─ quiz-controller.js .............. ✅ ATIVO (Quiz interaction)
│  │  │
│  │  └─ [All JS modules work together via HTML event listeners]
│  │
│  └─ 📁 assets/
│     ├─ css/ (3 files)
│     └─ js/ (7 files + 3 in controllers/)
│
├─ 📄 TEST FILE (Browser-based)
│  └─ test-schema.js .................................. ❌ MANUAL (console script)
│     └─ Propósito: Validate localStorage schema
│     └─ Uso: Paste in browser console manually
│
└─ 📚 DOCS/
   ├─ README.md ...................................... ✅ Project overview
   └─ SYSTEM_MAP.md .................................. ✅ System architecture


═══════════════════════════════════════════════════════════════════════════════

## 📊 RESUMO DE STATUS

### ✅ ARQUIVOS ATIVOS (27 files)
```
ENTRY:          2 (start_server.py, run_server.py)
CORE:           1 (server.py)
DATABASE:       3 (database.py, db_models.py, auth.py)
API:            6 (schemas.py + 4 controllers + __init__.py)
BUSINESS:       4 (services.py, pedagogy_orchestrator.py, quiz_questions.py, lessons_v2.py)
OPTIMIZATION:   4 (decision_engine.py, voice_cache.py, fallback.py, voice_metrics.py)
UTILITIES:      3 (utils/__init__.py, utils/prompts.py, utils/teaching_policy.py)
RAG:            4 (vector_store.py, ingest.py, chunking.py, pdf_extractor.py)
FRONTEND:      10 (4 HTML + 4 CSS + 2 JS core + 3 JS controllers)
REQUIREMENTS:   1 (requirements.txt)
────────────────────────────────────────────────────────
TOTAL:         41 arquivos ativos em produção
```

### ❌ ARQUIVOS NÃO UTILIZADOS (5 files)
```
LEGACY LESSONS:     2 (lessons_a1_13_30.py, lessons_a1_31_50.py)
                      └─ Substituído por: lessons_v2.py
                      └─ Nunca importados

MIGRATION:          1 (migrate_add_voice_sessions.py)
                      └─ Script de migração (executado uma vez)
                      └─ Agora integrado em: server.py _run_migrations()
                      └─ Nunca chamado automaticamente

TEST FILES:         2 (test_shadow_mode.py, test-schema.js)
                      └─ Scripts para validação manual
                      └─ Não carregados automaticamente
────────────────────────────────────────────────────────
TOTAL:             5 arquivos legados/não chamados
```

---

## 🔗 DEPENDENCY MATRIX

### Quem depende de quem?

```
         │ srv │ auth │ DB  │ sch │ svc │ orm │ ctl │ opt
─────────┼─────┼──────┼─────┼─────┼─────┼─────┼─────┼─────
server   │  X  │  ✓   │  ✓  │  ✓  │  ✓  │  ✓  │  ✓  │  -
auth     │  -  │  X   │  ✓  │  ✓  │  -  │  ✓  │  -  │  -
database │  -  │  -   │  X  │  -  │  -  │  ✓  │  -  │  -
schemas  │  -  │  -   │  -  │  X  │  -  │  -  │  -  │  -
services │  -  │  -  │  ✓  │  ✓  │  X  │  ✓  │  -  │  ✓
models   │  -  │  -   │  ✓  │  -  │  ✓  │  X  │  ✓  │  -
control  │  -  │  ✓   │  ✓  │  ✓  │  ✓  │  ✓  │  X  │  ✓
optimiz  │  -  │  -   │  -  │  -  │  ✓  │  -  │  ✓  │  X

Legend: X=self, ✓=depends, -=no dependency
```

---

## 🎯 ENTRY POINTS & EXECUTION FLOW

### Iniciar o Sistema

```
bash/powershell
    ↓
python start_server.py
    ↓ (loads .env)
    ↓
uvicorn.run("server:app")
    ↓
FastAPI initializes:
    ├─ Load environment
    ├─ Create DB engine
    ├─ Run migrations (_run_migrations)
    ├─ Register 4 API routers
    ├─ Mount static files
    └─ Ready on http://127.0.0.1:8000/
```

### Request Flow (Exemplo: Chat Texto)

```
User Browser
    ↓
chat-text-controller.js
    ↓
POST /api/chat-text
    ↓
chat_text_controller.py
    ├─ Validate auth (auth.py)
    ├─ Get DB session (database.py)
    ├─ Call services.generate_text_reply()
    │   ├─ Detect language
    │   ├─ RAG retrieval (if enabled)
    │   ├─ Groq LLM API call
    │   └─ Process response
    ├─ Save Conversation (db_models.py)
    ├─ Award XP (utils/__init__.py)
    └─ Return JSON
    ↓
Browser receives response
    ├─ Display message
    ├─ Show feedback panels
    ├─ Save to localStorage
    └─ Update UI
```

---

## 🛠️ MAINTENANCE & CLEANUP RECOMMENDATIONS

### 1. REMOVE (Seguro para deletar)
```
❌ lessons_a1_13_30.py    - Completamente substituído
❌ lessons_a1_31_50.py    - Completamente substituído
❌ test_shadow_mode.py    - Teste manual, não usado em produção
❌ test-schema.js         - Teste manual, não usado em produção

Razão: Não afetam o sistema, apenas ocupam espaço
```

### 2. KEEP (Necessário)
```
❌ migrate_add_voice_sessions.py
   Manter como: Histórico/Documentação
   Razão: Migração importante, pode precisar para referência
   Alternativa: Documentar no README.md como histórico
```

### 3. DOCUMENT (Adicionar comentários)
```
✅ decision_engine.py      - Add: "Classifies voice requests to reduce token usage"
✅ voice_cache.py          - Add: "LRU cache with TTL for voice responses"
✅ fallback.py             - Add: "Graceful error handling strategy"
✅ voice_metrics.py        - Add: "Performance monitoring for voice chat"
```

---

## 📈 STATISTICS

### Code Organization
```
Backend Lines of Code:
├─ services.py ...................... ~2500 lines (Largest - LLM processing)
├─ controllers/ ..................... ~2000 lines (4 API routers)
├─ db_models.py .................... ~150 lines
├─ schemas.py ...................... ~200 lines
├─ auth.py .......................... ~100 lines
├─ database.py ...................... ~25 lines
└─ utilities & optimization ........ ~1500 lines
   Total Backend: ~6500 lines Python

Frontend Lines of Code:
├─ JavaScript controllers ........... ~3000 lines
├─ HTML pages ....................... ~800 lines
├─ CSS files ........................ ~1200 lines
└─ Assets ........................... ~100 lines
   Total Frontend: ~5100 lines

Test & Documentation:
├─ MD documentation ................ ~5000 lines
├─ PDFs ............................ 3 books
└─ Test files ....................... ~200 lines

Total Project: ~16,400 lines of code + documentation
```

### Module Complexity
```
Most Complex:
1. services.py (LLM processing + decision engine + fallback)
2. chat_text_controller.py (Full chat workflow)
3. chat_voice_controller.py (Voice + STT + TTS)
4. lessons_v2.py (Pedagogical content)

Most Critical:
1. server.py (entry point)
2. auth.py (security)
3. database.py (data persistence)
4. services.py (business logic)
```

---

## 🔐 SECURITY & BEST PRACTICES

### Implemented ✅
- JWT authentication (24h expiry)
- Password hashing (bcrypt, 12 rounds)
- SQL injection prevention (SQLAlchemy ORM)
- CORS configured
- Rate limiting (via fallback strategy)
- Error logging
- API key management via .env

### Recommendations 🎯
1. Add rate limiting middleware
2. Add request logging/auditing
3. Add data validation on all inputs
4. Implement refresh token rotation
5. Add API versioning
6. Document API security model

---

## 🚀 DEPLOYMENT CHECKLIST

```
Before Production:
☐ Set SECRET_KEY env variable
☐ Set GROQ_API_KEY env variable
☐ Set DATABASE_URL (PostgreSQL for production)
☐ Set ELEVENLABS_API_KEY (optional)
☐ Run migrations: python migrate_add_voice_sessions.py
☐ Load RAG PDFs: python backend/rag/ingest.py
☐ Test endpoints: python backend/test_shadow_mode.py
☐ Run pytest: python -m pytest (if tests added)
☐ Build frontend: npm build (if using build step)
☐ Set production: DEBUG=False
☐ Configure HTTPS/SSL
☐ Set up monitoring/alerts
☐ Configure backups
☐ Load test the system
```

---

## 📞 CONTACT & SUPPORT

For questions about the architecture:
- Review: SYSTEM-DIAGRAM-PROMPT.md (Full documentation)
- Review: VISUAL-ARCHITECTURE-REFERENCE.md (Visual reference)
- Review: IMPLEMENTATION-SUMMARY.md (Implementation details)
- Review: OPTIMIZATION-IMPLEMENTATION.md (Optimization details)

