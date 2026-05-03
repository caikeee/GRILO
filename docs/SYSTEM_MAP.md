# Mapa do Sistema GRILO

Resumo atualizado da arquitetura apos a reorganizacao por dominio.

## Visao Geral
- Backend: FastAPI com composicao em `backend/server.py` e controladores por dominio em `backend/controllers/`.
- Frontend: duas paginas ativas (`frontend/index.html` e `frontend/home.html`).
- Servicos ativos do produto: chat por texto, chat por voz e aulas/quiz.

## Backend
### Entrada principal
- `backend/server.py`: cria app, registra CORS, inclui controladores e serve arquivos estaticos do frontend.

### Controladores
- `backend/controllers/auth_controller.py`: login, registro, perfil e progresso geral do usuario.
- `backend/controllers/chat_text_controller.py`: `/api/chat`, `/api/chat/write`, `/api/translate/`, bonus de conclusao.
- `backend/controllers/chat_voice_controller.py`: `/api/voice-chat`.
- `backend/controllers/lessons_controller.py`: aulas V1/V2, progresso de aula e quiz (`/api/quiz/*`).
- Endpoints legados de compatibilidade foram removidos para manter somente rotas atuais do produto.

### Camada de dominio e dados
- `backend/services.py`: integracao com LLM, traducao, avaliacao de escrita e pedagogia.
- `backend/pedagogy_orchestrator.py`: orquestracao de resposta pedagogica.
- `backend/lessons_v2.py`, `backend/lessons_a1_13_30.py`, `backend/lessons_a1_31_50.py`: conteudo e helpers de aulas (v2 canônico, 50 lições A1).
- `backend/quiz_questions.py`: banco e regras do quiz.
- `backend/db_models.py`, `backend/database.py`: modelos e sessao do banco.

## Frontend
### Paginas
- `frontend/index.html`: landing, autenticacao inicial e animacoes de marketing.
- `frontend/home.html`: dashboard do aluno com chat texto, voz e aulas/quiz.

### Controladores (home)
- `frontend/controllers/chat/chat-text-controller.js`: estado global de sessao, auth local, chat escrito e UI de mensagens.
- `frontend/controllers/voice/chat-voice-controller.js`: reconhecimento/sintese de voz e ciclo de conversa por voz.
- `frontend/controllers/lessons/lessons-controller.js`: aulas (grid, detalhe, exercicios, progresso).
- `frontend/controllers/lessons/quiz-controller.js`: fluxo de quiz independente dentro da aba de aulas.

### Assets ativos (index)
- CSS: `frontend/assets/css/variables.css`, `frontend/assets/css/base.css`, `frontend/assets/css/grilo-v3.css`.
- JS: `frontend/assets/js/utils.js`, `frontend/assets/js/form-handler.js`, `frontend/assets/js/grilo-animations.js`.

## Fluxo de Alto Nivel
1. `index.html` autentica o usuario e redireciona para `home.html`.
2. `chat-text-controller.js` valida token, restaura sessoes e coordena a UI principal.
3. Controladores de chat/voz/aulas chamam API FastAPI em `127.0.0.1:8000`.
4. `backend/server.py` encaminha para controlador de dominio e, quando necessario, para `services.py`.
5. Banco SQLite (`grilo.db`) persiste usuario, conversas e progresso.
