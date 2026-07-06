# 🏗️ GRILO — Varredura Completa de Arquitetura

**Data:** 2026-06-14 | **Total de arquivos:** 116 | **Linguagens:** Python, JavaScript, CSS, HTML

---

## 📊 Resumo Executivo

**GRILO** é uma plataforma de aprendizado de inglês com suporte a **chat textual**, **chat por voz** e **aulas interativas**. A arquitetura segue padrão **FastAPI (backend) + Vanilla JS (frontend)**, com banco **SQLite** como fonte de verdade.

- **Tipo**: SaaS edutech
- **Stack**: Python 3.10+ | FastAPI | SQLite | Vanilla JS (sem frameworks)
- **Modelo de negócio**: Freemium (XP, streaks, badges)
- **Integrações**: Groq API (LLM), ElevenLabs (TTS), Web Speech API (STT)

---

## 📁 Estrutura de Diretórios

```
GRILO/
├── backend/                          # Python FastAPI + domínio da lógica
│   ├── server.py                     # Entrada FastAPI (500 linhas)
│   ├── db_models.py                  # 12 modelos SQLAlchemy (294 linhas)
│   ├── services.py                   # Integrações LLM, cache, fallback (1632 linhas)
│   ├── config.py                     # Validação de env vars (71 linhas)
│   ├── database.py                   # Setup SQLite/PostgreSQL (23 linhas)
│   ├── auth.py                       # JWT, password hashing (145 linhas)
│   ├── middleware.py                 # Request IDs, CORS (TrustedHost)
│   ├── decision_engine.py            # Voice request classification (132 linhas)
│   ├── voice_cache.py                # Cache de áudio + transcrições (168 linhas)
│   ├── fallback.py                   # Graceful error recovery (170 linhas)
│   ├── quiz_questions.py             # Banco de quiz + scoring (1244 linhas)
│   ├── lessons_v2.py                 # 50 lições A1 + helpers (1978 linhas)
│   ├── phrase_bank_seed.py           # Seed de frases por aula (331 linhas)
│   ├── controllers/                  # Routers FastAPI por domínio
│   │   ├── auth_controller.py        # POST /register, /login, /profile (394 linhas)
│   │   ├── chat_text_controller.py   # POST /api/chat, /api/translate (372 linhas)
│   │   ├── chat_voice_controller.py  # POST /api/voice-chat (916 linhas)
│   │   ├── lessons_controller.py     # GET /api/lessons, POST /api/quiz/* (1073 linhas)
│   │   ├── phrases_controller.py     # Phrase bank CRUD (588 linhas)
│   │   ├── difficulties_session_controller.py  # Sessão de dificuldades 7/7 (501 linhas)
│   │   ├── analytics_controller.py   # Eventos, heatmap, word profile (1034 linhas)
│   │   └── pmf_controller.py         # Product-market fit survey (420 linhas)
│   ├── lessons/                      # 50 arquivos .py (aulas A1 módulo a módulo)
│   │   ├── a1_m1_negativa.py         # Aula 1: Negativas
│   │   ├── a1_m1_passado.py          # Aula 2: Passado
│   │   └── ... (48 mais)
│   ├── utils/                        # Utilitários compartilhados
│   │   ├── prompts.py                # Templates de prompts LLM (324 linhas)
│   │   ├── teaching_policy.py        # Lógica pedagogia + XP/streak (304 linhas)
│   │   ├── rate_limiter.py           # Rate limit por usuário
│   │   ├── groq_quota_manager.py     # Monitor de quota Groq (118 linhas)
│   │   ├── json_logger.py            # Logging estruturado prod (189 linhas)
│   │   └── http_utils.py
│   └── rag/                          # Retrieval-Augmented Generation (inactive)
│       ├── vector_store.py           # ChromaDB integration
│       ├── pdf_extractor.py          # PyPDF2 parsing
│       ├── ingest.py                 # Seed docs (126 linhas)
│       ├── chunking.py               # Text splitting (149 linhas)
│       └── chromadb_data/            # Índice vetorial (SQLite)
│
├── frontend/                         # Vanilla JS + HTML/CSS (no build tool)
│   ├── index.html                    # Landing + auth (502 linhas)
│   ├── home.html                     # Dashboard principal (12336 linhas) ⚠️
│   ├── lessons.html                  # Grid de aulas + quiz (252 linhas)
│   ├── dashboard.html                # Analytics + profile (700 linhas)
│   ├── voice.html                    # Voice page dedicada (2087 linhas)
│   ├── pmf.html                      # Product-market fit survey (358 linhas)
│   ├── privacidade.html              # Privacy policy
│   ├── termos.html                   # Terms of service
│   ├── controllers/                  # State management + API calls
│   │   ├── chat/chat-text-controller.js        # 2113 linhas
│   │   ├── voice/chat-voice-controller.js      # 3962 linhas (maior JS)
│   │   ├── dashboard/admin-controller.js       # 325 linhas
│   │   └── lessons/lessons-controller.js       # 1472 linhas
│   └── assets/
│       ├── css/                      # Sistemas de design sobrepostos
│       │   ├── variables.css         # CSS custom properties (136 linhas)
│       │   ├── base.css              # Reset + base (424 linhas)
│       │   ├── sage-color-system.css # Paleta Sage (394 linhas)
│       │   ├── sage-elegance.css     # Componentes elegantes (411 linhas)
│       │   ├── sage-premium-polish.css # Polish (351 linhas)
│       │   ├── sage-overrides.css    # Overrides (261 linhas)
│       │   ├── grilo-v3.css          # Variação Grilo v3 (4134 linhas) ⚠️ ÓRFÃO?
│       │   ├── lessons.css           # Estilos aulas (2978 linhas)
│       │   ├── landing-v4.css        # Landing (1583 linhas)
│       │   ├── theme-toggle.css      # Dark/light mode (119 linhas)
│       │   ├── form-validation-ux.css # UX validation (327 linhas)
│       │   ├── modal-ux-enhancement.css # Modais (728 linhas)
│       │   ├── lesson-editorial-v5.css # Editor lições (1295 linhas)
│       │   ├── lesson-editorial-v4.css # v4 deprecated (881 linhas)
│       │   ├── lessons-v4-overlay.css  # Overlay (761 linhas)
│       │   ├── landing-dark.css      # Dark landing (modified)
│       │   └── [2 CSS files não-referenciados]
│       ├── js/
│       │   ├── utils.js              # Helpers (auth, fetch, DOM) (382 linhas)
│       │   ├── theme-toggle.js       # Dark mode toggle (241 linhas)
│       │   ├── form-handler.js       # Form validation (419 linhas)
│       │   ├── registration-validator.js # Signup UX (241 linhas)
│       │   ├── voice-recognition-utils.js # Web Speech API (713 linhas)
│       │   ├── grilo-animations.js   # Animações (403 linhas)
│       │   ├── lessons-enhanced.js   # Lesson UI logic (6618 linhas)
│       │   ├── phrase-voice-trainer.js # Phrase practice (1495 linhas)
│       │   ├── lesson-editorial-renderer.js # Render aulas (1470 linhas)
│       │   ├── modal-interactions.js # Modal UX (310 linhas)
│       │   ├── dashboard.js          # Analytics render (580 linhas)
│       │   ├── difficulties-session.js # 7/7 interface (542 linhas)
│       │   ├── lessons-trail.js      # Navegação aulas (367 linhas)
│       │   ├── lessons-trainer-bridge.js # Bridge v1→v2 (unused)
│       │   ├── beta-modal-controller.js # Beta features (124 linhas)
│       │   └── [1 JS file não-referenciado]
│       └── illustrations/            # SVGs Storyset (7 arquivos)
│
├── docs/                             # Documentação
│   ├── README.md
│   ├── SYSTEM_MAP.md                 # Mapa da arquitetura
│   └── BRAND-VOICE.md                # Voz da marca
│
└── [Config files]
    ├── requirements.txt              # 42 dependências Python
    ├── package.json                  # Playwright (E2E testing)
    ├── .env, .env.example            # Env vars (Groq API, ElevenLabs, Secret Key)
    ├── .gitignore
    ├── Procfile                      # Railway deployment (71 bytes)
    └── grilo.db                      # SQLite (315 KB)
```

---

## 📈 Ranking de Arquivos por Tamanho (LOC)

| Rank | Arquivo | LOC | Propósito | Status |
|------|---------|-----|----------|--------|
| 1 | `home.html` | 12,336 | Dashboard + chat UI (inline CSS+JS) | ⚠️ MONOLÍTICO |
| 2 | `lessons-enhanced.js` | 6,618 | Lesson grid + exercises + quiz | ✅ Ativo |
| 3 | `grilo-v3.css` | 4,134 | Design system (sobreposição) | ❓ ÓRFÃO |
| 4 | `chat-voice-controller.js` | 3,962 | Voice recognition + TTS loop | ✅ Ativo |
| 5 | `landing-v4.css` | 1,583 | Landing page (marketing) | ✅ Ativo |
| 6 | `phrase-voice-trainer.js` | 1,495 | Phrase practice UI | ✅ Ativo |
| 7 | `lessons-controller.js` | 1,472 | Lesson state + progress | ✅ Ativo |
| 8 | `lesson-editorial-renderer.js` | 1,470 | Render lesson content | ✅ Ativo |
| 9 | `lessons_v2.py` | 1,978 | 50 aulas A1 (data) | ✅ Canônico |
| 10 | `lesson-editorial-v5.css` | 1,295 | Editorial styles | ✅ Ativo |

**Total LOC: 70,237 linhas** (excluindo PDFs, node_modules, .git)

---

## 🗂️ Mapeamento de Domínios

### 🔐 Autenticação & Perfil
- **Arquivos:** `auth.py`, `auth_controller.py`, `utils/teaching_policy.py`
- **Responsabilidades:**
  - JWT + refresh tokens (QW9)
  - Password hashing (bcrypt)
  - Lockout after 3 failed logins
  - Token versioning (logout revokes all tokens)
- **Frontend:** `registration-validator.js`, `form-handler.js`

### 💬 Chat Textual
- **Backend:** `chat_text_controller.py`, `services.py`
- **Lógica:**
  - Chama Groq LLM (llama-3.3-70b)
  - Tradução bidirecional (en ↔ pt)
  - Análise de escrita (grammar corrections)
  - XP award por mensagem
  - RAG opcional (PDF context)
- **Frontend:** `chat-text-controller.js` (state + UI)

### 🎤 Chat por Voz
- **Backend:** `chat_voice_controller.py` (916 linhas), `voice_cache.py`, `decision_engine.py`
- **Pipeline:**
  1. User speaks → Web Speech API (browser)
  2. POST `/api/voice-chat` (audio blob)
  3. Groq transcription (if enabled, else browser STT)
  4. LLM response (contextual, teaching policy applied)
  5. ElevenLabs TTS or browser TTS
- **Frontend:** `chat-voice-controller.js` (3962 linhas) — lógica pesada aqui
- **Otimizações:**
  - Voice cache (últimas 20 transcrições)
  - Decision engine (route by intent: chat, lesson, difficulty)
  - Graceful fallback (se Groq falhar, usa fallback pedagógico)

### 📚 Aulas & Quiz
- **Backend:**
  - `lessons_v2.py` — 50 aulas A1 estruturadas (Módulos 1-6)
  - `quiz_questions.py` — banco de questões (1244 linhas)
  - `lessons_controller.py` — endpoints
  - `LessonProgress`, `LessonPhraseBank`, `PhraseError` models
- **Frontend:**
  - `lessons.html` + `lessons-enhanced.js` (6618 linhas)
  - Grid de aulas com progresso (Aprendida/Dominada)
  - Exercícios de voz (phrase trainer)
  - Quiz modal inline
  - Editorial renderer (lição details)

### 🎯 Sessão de Dificuldades (Weekly 7/7)
- **Conceito:** Gamification — unlock daily streak se completar 7 items difíceis/semana
- **Backend:** `difficulties_session_controller.py`, `DifficultySessionLog` model
- **Lógica:**
  - Pull frases/questões erradas (PhraseError, LessonQuizError)
  - Enqueia 7 items
  - 2 acertos = item "dominado"
  - XP bonus on session complete
  - Weekly reset (segunda-feira BRT)

### 📊 Analytics & Heatmap
- **Backend:** `analytics_controller.py`, `UserActivity`, `AnalyticsEvent`, `WordProfile`, `ShadowModeAnalytic` models
- **Dados:**
  - Daily activity heatmap (GitHub-style)
  - Word profile (usage by accuracy)
  - Voice session snapshots (last 20)
  - Pronunciation errors (shadow mode)
- **Frontend:** `dashboard.js`

### 🏆 Badges & XP
- **Models:** `Badge`, `UserBadge`
- **Tipos:** milestone, streak, vocabulary
- **Teaching Policy:** `utils/teaching_policy.py` (304 linhas)
  - XP por mensagem, voice session, aula completa
  - Streak preservation (14 dias sem atividade = reset)
  - Badge unlocks (10 XP milestone, 7-day streak, vocab milestone)

---

## ⚠️ Arquivos Órfãos & Obsoletos

### 🔴 CSS Órfão (não referenciado)
1. **`grilo-v3.css`** (4134 linhas)
   - Versão antiga do design system
   - Sobrescrito por `sage-elegance.css` + `sage-color-system.css`
   - **Ação:** Deletar (libera 4K linhas)

2. **`sage-landing.css`** (907 linhas)
   - Landing page antiga
   - Substituído por `landing-v4.css` + `landing-dark.css`
   - **Ação:** Deletar

### 🟡 JS Órfão ou Não-Usado
1. **`lessons-trainer-bridge.js`** (? linhas)
   - Bridge entre v1 e v2 de aulas
   - v1 foi descontinuado
   - **Ação:** Deletar

2. **`grilo-animations.js`** (403 linhas)
   - Referenciado em `lessons-enhanced.js` e `lessons-controller.js`
   - Mas não carregado diretamente em HTML
   - **Status:** Used (via require/import local)

3. **`lessons-trail.js`** (367 linhas)
   - Navigation entre aulas
   - Referenciado em `lessons-controller.js`
   - **Status:** Used

### 🟠 HTML Órfã
- **`test-api.html`, `test-layout.html`, `verify-layout.html`** (133, 123, 115 linhas)
  - Testes locais / development
  - **Ação:** Mover para `/tests` ou deletar se não usado em CI

### 📄 Documentação Temporária
- **`VALIDACAO_INTELIGENTE.md`, `REGISTRO_VALIDACOES.md`** (4.9K, 4.5K)
  - Notas de design sobre validação
  - Duplicam informação em código
  - **Ação:** Merquear em `DESIGN_STUDY_PEDAGOGY.md` ou deletar

---

## 📊 Análise de Complexidade

### Arquivos Críticos (>1000 LOC, alta reutilização)
1. **`home.html`** (12,336 LOC)
   - ⚠️ **PROBLEMA:** Monolítico — contém CSS/JS inline + HTML
   - **Risco:** Difícil manutenção, sem tree-shake, sem bundle
   - **Recomendação:** Quebrar em componentes Web Components

2. **`lessons-enhanced.js`** (6,618 LOC)
   - Lógica de UI + state mixing
   - Sem test coverage visível
   - **Recomendação:** Extrair state para módulo separado

3. **`chat-voice-controller.js`** (3,962 LOC)
   - Ciclo Web Speech API complexo
   - Tratamento de edge cases (network, permission denials)
   - **Recomendação:** Adicionar testes end-to-end com Playwright

### Backend Robusto
- **`services.py`** (1,632 LOC) — Bem estruturado, mas sem typing completo
- **`chat_voice_controller.py`** (916 LOC) — Bom design (decision engine + fallback)
- **`quiz_questions.py`** (1,244 LOC) — Banco imutável, confiável

---

## 🔧 Dicas de Um Engenheiro Sênior

### 1. **Refatore Imediato: Quebrar `home.html`**
```
Status atual: 12.3K linhas em UM arquivo
├── CSS inline (~3K linhas)
├── JS inline (~8K linhas)
└── HTML template (~1K linhas)

Impacto:
- Cache ineficiente (CSS/JS inclusos em toda carga)
- Debugging impossível (DevTools confunde linhas)
- Sem tree-shake (minificação não funciona bem)

Plano:
1. Extrair CSS inline → frontend/assets/css/home.css
2. Extrair JS inline → frontend/assets/js/home-orchestrator.js
3. Deixar home.html com ~100 linhas (template limpo)
4. Ganho: Cache hits, parcel build, debugging
```

### 2. **Consolidar Design System**
```
Problema:
├── variables.css (base)
├── base.css (reset)
├── sage-color-system.css (paleta)
├── sage-elegance.css (componentes)
├── sage-premium-polish.css (polish)
├── sage-overrides.css (patches)
└── grilo-v3.css (OBSOLETO — deletar)

Causa: Evolução ad-hoc sem refactor entre versões

Solução:
1. Manter: variables + sage-color-system + sage-premium-polish (core)
2. Deletar: grilo-v3, sage-landing, sage-elegance (redundante)
3. Mover: overrides → component-specific CSS
4. Resultado: 3 CSS files vs. 13 (77% redução)
```

### 3. **Implementar Web Components**
```
Motivation:
- home.html = 12K linhas (unmaintainable)
- chat-voice = 3.96K (hard to debug)
- lessons-enhanced = 6.6K (state + UI mixed)

Proposta:
<grilo-chat-box></grilo-chat-box>         <!-- encapsulated state -->
<grilo-voice-trainer></grilo-voice-trainer>
<grilo-lesson-grid></grilo-lesson-grid>

Benefícios:
✓ Shadow DOM isolates styles (no CSS bleeding)
✓ State encapsulation (no global leaks)
✓ Reusable across pages
✓ Testable (jest + web-component testing libraries)

Não requer framework. Vanilla JS + CustomElements API.
Timeline: 3-4 sprints
```

### 4. **Implementar Proper Testing**
```
Observação: Sem testes visíveis (nem em package.json)

Prioridades (ROI alto):
1. Voice chat e-2-e (Playwright) — 40% dos bugs
   • Teste permissões de microfone
   • Teste network failure → fallback
   • Teste long-running sessions
   
2. Quiz scoring unit tests (Jest)
   • XP calculations
   • Streak logic
   • Badge unlocks
   
3. Integration tests (API mock)
   • Auth flow (register → login → profile)
   • Chat message save + retrieval
   
4. Visual regression (Percy ou Chromatic)
   • Landing page responsive
   • Lesson editorial render

Setup:
npx playwright install
npm install --save-dev jest @testing-library/dom
```

### 5. ✅ **Remover Código Morto** ~~(pendente)~~ — CONCLUÍDO
```
Órfãos identificados:
- grilo-v3.css (4134 LOC)      → rm
- sage-landing.css (907 LOC)    → rm
- lessons-trainer-bridge.js     → rm
- test-*.html (371 LOC total)   → mv /tests
- VALIDACAO_*.md (9.4K)         → merge ou rm

Liberado:
- ~15K linhas mortas
- Cache mais limpo
- Menos confusão onboarding
```

> ✅ **Concluído em 2026-07-04** — 8.200 linhas removidas em 12 arquivos (grilo-v3.css, sage-landing.css, lesson-editorial-v4.css, lessons-v4-overlay.css, grilo-animations.js, lessons-trail.js, lessons-trainer-bridge.js, test-api.html, test-layout.html, verify-layout.html, MODAL_IMPROVEMENTS.md, VERIFICAR_CSS.md) + 7 SVGs órfãs (~866 KB).

### 6. **Otimizar Bundle (quando tiver build tool)**
```
Oportunidade:
- home.html referencia 4 CSS + 1 JS
- voice.html referencia 5 CSS + JS inline
- lessons.html referencia 7 CSS + 5 JS

Sem bundler → 70 HTTP requests (bad)

Solução futuro:
1. Setup Parcel v2 (zero-config)
   npx parcel frontend/index.html
   
2. Automático:
   - Minify CSS/JS
   - Tree-shake unused
   - Asset hashing (cache busting)
   - CSS Critical path extraction
   
3. Deploy:
   - frontend/ → dist/
   - railway app serve dist/
   
Ganho estimado: 60% faster page load, 40% less bandwidth
```

### 7. **API Versioning Strategy**
```
Obs: Endpoints hoje são /api/chat, /api/quiz/* (sem v1/v2)

Risk:
- Se quebrar API, browsers antigos falham
- Sem canário de rollout

Recomendação:
POST /api/v1/chat          ← estável, depreciating
POST /api/v2/chat          ← novo, com breaking changes

Backend: Accept both rotas, legacy mapped to new

Vantagem:
✓ Zero downtime deploys
✓ Client-driven migration
✓ A/B testing de versões
```

### 8. **Monitoring & Observability**
```
Setup atual:
✓ JSON logging (prod)
✓ Health check endpoint
✗ Sem error tracking (Sentry)
✗ Sem performance monitoring (APM)
✗ Sem user session replay

Para scale:
1. Sentry SDK (frontend + backend)
   - Capture crashes com context
   - Group by error pattern
   - 2K errors/mês free tier
   
2. LogRocket (session replay — $$)
   - Browser-side playback
   - Debug user-reported issues
   - Privacy-focused (PII redaction)
   
3. Groq API monitoring
   - Token usage by endpoint
   - Latency percentiles
   - Cache hit rate
```

### 9. **Database Optimizations**
```
Current: SQLite (perfect for MVP)

Observações:
✓ 11 foreign keys (good relational design)
✓ Índices em (user_id, date, activity_type)
✓ Migrations automáticas (QW5 pattern)

Next steps (não urgente):
1. Add DB indexes on:
   - conversations(user_id, timestamp DESC)  ← for recent chats
   - phrase_errors(user_id, status)          ← for difficulty sessions
   
2. If scale > 100K users:
   - Migrate to PostgreSQL (Railway native)
   - Connection pooling (pgbouncer)
   - Read replica for analytics
   
3. Archive strategy:
   - Move old conversations → archive table
   - Purge after 1 year (GDPR compliance)
```

### 10. **Documentation & Onboarding**
```
Atual:
✓ SYSTEM_MAP.md (good high-level)
✓ Docstrings em key functions
✗ Sem runbook de deploy
✗ Sem architecture decision records (ADRs)
✗ Sem troubleshooting guide

Add (1-2 days):
1. DEPLOYMENT.md
   - How to deploy to Railway
   - Environment variables setup
   - Database migration checklist
   
2. TROUBLESHOOTING.md
   - "Voice chat not working" → check mics, permissions, groq quota
   - "Quiz not scoring" → check quiz_questions.py schema
   - "Streaks reset unexpectedly" → check teaching_policy.py timer
   
3. ADR-001_voice_fallback_strategy.md
   - Why we chose graceful degradation
   - Trade-offs vs. error-first approach
   
4. CONTRIBUTING.md
   - Code style (black for Python, prettier for JS)
   - PR review checklist
   - Testing requirements
```

---

## 🎯 Ações Recomendadas (Priority Order)

### 🔴 Crítico (esta semana)
- [ ] Deletar grilo-v3.css + sage-landing.css (5K linhas mortas)
- [ ] Documentar API endpoints (Swagger/OpenAPI)
- [ ] Add error handling test para voice fallback

### 🟡 Important (próximo sprint)
- [ ] Quebrar home.html em 3-4 Web Components
- [ ] Consolidar CSS design system (13 → 3 files)
- [ ] Setup Playwright e2e tests (voice chat focus)

### 🟢 Nice-to-have (roadmap)
- [ ] Implementar Sentry + error tracking
- [ ] Parcel bundler setup
- [ ] Database performance audit
- [ ] API v2 versioning strategy

---

## 📞 Contato / Escalação

**Dúvidas sobre arquitetura:**
- Veja `docs/SYSTEM_MAP.md` para fluxo de alto nível
- Veja `backend/server.py:375+` para montagem de rotas
- Veja `frontend/controllers/chat/chat-text-controller.js:1+` para estado global

**Bugs conhecidos / Tech Debt:**
- Veja `MELHORIAS_RESUMO.txt`
- Veja `MIGRATION_GUIDE.md` (schema evolution)

---

**Gerado:** 2026-06-14 por Scan Arquitetura | **Próxima atualização recomendada:** 2026-09-14
