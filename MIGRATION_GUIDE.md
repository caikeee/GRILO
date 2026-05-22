# GRILO — Guia de Migração Railway → Vercel + Render + Supabase

## Visão Geral da Mudança

```
ANTES (Railway)                    DEPOIS
─────────────────────              ────────────────────────────────────
Um único servidor                  Vercel    → frontend (HTML/CSS/JS)
├── Serve os HTMLs do /frontend    Render    → backend FastAPI
├── Serve todos os /api/*          Supabase  → PostgreSQL
└── PostgreSQL interno             
```

**Ponto mais crítico:** hoje o frontend usa `fetch('/api/...')` com caminhos relativos
porque frontend e backend são o MESMO servidor. Ao separar os dois, todas as chamadas
de API vão quebrar — esse é o primeiro bug a corrigir.

---

## Checklist Geral

- [ ] Fase 1 — Backend no Render
- [ ] Fase 2 — Banco no Supabase
- [ ] Fase 3 — Código do frontend atualizado
- [ ] Fase 4 — Frontend no Vercel
- [ ] Fase 5 — Desligar Railway

---

## FASE 1 — Backend no Render

### 1.1 Criar o serviço no Render

1. Acesse [render.com](https://render.com) → **New Web Service**
2. Conecte ao repositório GitHub do GRILO
3. Configurações:
   - **Name:** `grilo-api` (ou o que quiser)
   - **Root Directory:** deixe vazio (raiz do projeto)
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

### 1.2 Variáveis de Ambiente no Render

Copie exatamente os valores que estão no Railway hoje.

| Variável | Valor |
|---|---|
| `DATABASE_URL` | Por enquanto: URL do Railway (vai mudar na Fase 2) |
| `GROQ_API_KEY` | Mesmo do Railway |
| `SECRET_KEY` | **EXATAMENTE o mesmo do Railway** — se mudar, todos os 10 usuários serão deslogados |
| `GROQ_TRANSCRIPTION_API_KEY` | Mesmo do Railway |
| `ELEVENLABS_API_KEY` | Mesmo do Railway |
| `MODEL_NAME` | `llama-3.3-70b-versatile` |
| `HOST` | `0.0.0.0` |
| `PORT` | `8000` (Render injeta automaticamente, mas não custa setar) |
| `DEBUG` | `false` |
| `LOG_LEVEL` | `INFO` |
| `ENVIRONMENT` | `production` |
| `CORS_ORIGINS` | preencher depois (Fase 3) |

### 1.3 Ajustar server.py para o Render

No arquivo `backend/server.py`, o `TrustedHostMiddleware` tem uma lista hardcoded
de hosts permitidos. Adicione o domínio do Render:

```python
# Procure esta seção (~linha 328) e adicione as linhas marcadas com (+)
_default_hosts = _cors_hosts + [
    "localhost",
    "127.0.0.1",
    "testserver",
    "web-production-6ecc2.up.railway.app",
    "*.up.railway.app",
    "*.railway.app",
    "*.onrender.com",          # (+) adicionar
    "SEU-APP.onrender.com",    # (+) substituir pelo nome real
]
```

Também no mesmo arquivo, atualize a diretiva `connect-src` do CSP (~linha 289):

```python
# ANTES
"connect-src 'self' https://api.elevenlabs.io https://api.groq.com; "

# DEPOIS
"connect-src 'self' https://api.elevenlabs.io https://api.groq.com https://SEU-APP.onrender.com; "
```

### 1.4 Testar o backend no Render

Após o primeiro deploy, acesse:
```
https://SEU-APP.onrender.com/health
```
Deve retornar:
```json
{"status": "healthy", "components": {"database": "ok", "groq_api": "ok"}}
```

---

## FASE 2 — Banco de Dados no Supabase

### 2.1 Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Anote a **Database Password** (você vai precisar)
3. Vá em **Settings → Database → Connection String → URI**
4. Copie a URL — vai parecer com:
   ```
   postgresql://postgres:[SENHA]@db.xxxx.supabase.co:5432/postgres
   ```

### 2.2 Exportar banco do Railway

No terminal, com as credenciais do Railway:

```bash
# Pegue a DATABASE_URL do painel do Railway e rode:
pg_dump "postgresql://USER:SENHA@HOST:PORT/DBNAME" \
  --no-owner \
  --no-acl \
  --format=plain \
  -f grilo_backup.sql

# Verifique o tamanho do arquivo gerado:
ls -lh grilo_backup.sql
```

> **Dica Railway:** vá em seu serviço → **Variables** → copie a variável `DATABASE_URL`
> ou vá em **Database** → **Connect** para pegar as credenciais individuais.

### 2.3 Importar no Supabase

```bash
# Use a URL do Supabase (passo 2.1):
psql "postgresql://postgres:[SENHA]@db.xxxx.supabase.co:5432/postgres" \
  < grilo_backup.sql
```

Se der erro de SSL, adicione `?sslmode=require` no final da URL.

### 2.4 Validar os dados

```bash
# Conecte ao Supabase e confira:
psql "postgresql://postgres:[SENHA]@db.xxxx.supabase.co:5432/postgres"

-- Dentro do psql:
SELECT COUNT(*) FROM users;            -- deve bater com o Railway
SELECT username, email FROM users;     -- confira os 10 usuários MVP
SELECT COUNT(*) FROM conversations;
\q
```

### 2.5 Apontar Render para o Supabase

No painel do Render → **Environment** → Altere:
```
DATABASE_URL = postgresql://postgres:[SENHA]@db.xxxx.supabase.co:5432/postgres
```

Faça **Manual Deploy** no Render e acesse `/health` novamente para confirmar `"database": "ok"`.

> **Atenção:** O Supabase tem connection pooling. Se o banco ficar com muitas conexões
> abertas, use a URL de **Pooler** (Transaction Mode) que aparece no mesmo painel do Supabase.
> Para o FastAPI com SQLAlchemy, o Pooler funciona bem.

---

## FASE 3 — Código do Frontend para funcionar separado

### 3.1 Atualizar `getApiBaseUrl()` em utils.js

Arquivo: `frontend/assets/js/utils.js` — linha ~21

```js
// ANTES
function getApiBaseUrl() {
  return '';
}

// DEPOIS
function getApiBaseUrl() {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') {
    return 'http://127.0.0.1:8000';
  }
  return 'https://SEU-APP.onrender.com'; // substitua pelo URL real do Render
}
```

### 3.2 Corrigir `fetch` hardcoded nos HTMLs

Alguns arquivos fazem `fetch('/api/...')` sem usar `API_BASE_URL`. Isso vai quebrar.

**frontend/home.html** — busque estas linhas e corrija:
```js
// ANTES
fetch('/api/user/onboarding', {
fetch('/api/user/profile', {

// DEPOIS
fetch(API_BASE_URL + '/api/user/onboarding', {
fetch(API_BASE_URL + '/api/user/profile', {
```

**frontend/pmf.html** — busque e corrija:
```js
// ANTES
const res = await fetch('/api/admin/pmf/metrics', {
const res = await fetch('/api/admin/pmf/payment-record', {

// DEPOIS
const res = await fetch(API_BASE_URL + '/api/admin/pmf/metrics', {
const res = await fetch(API_BASE_URL + '/api/admin/pmf/payment-record', {
```

**frontend/voice.html** — busque e corrija:
```js
// ANTES
fetch('/api/voice/phrasebook', {

// DEPOIS
fetch(API_BASE_URL + '/api/voice/phrasebook', {
```

> **Como verificar:** depois de atualizar, abra o DevTools do navegador → Network →
> filtre por `/api/` → todas as requests devem ir para `onrender.com`, não para `vercel.app`.

### 3.3 Criar frontend/vercel.json

O Vercel por padrão não sabe que `/home` deve servir `home.html`. Crie este arquivo:

Arquivo: `frontend/vercel.json`
```json
{
  "rewrites": [
    { "source": "/home", "destination": "/home.html" },
    { "source": "/lessons", "destination": "/lessons.html" },
    { "source": "/dashboard", "destination": "/dashboard.html" },
    { "source": "/voice", "destination": "/voice.html" },
    { "source": "/pmf", "destination": "/pmf.html" }
  ]
}
```

### 3.4 Atualizar CORS no Render

Depois de fazer o deploy no Vercel (passo 4), você terá a URL definitiva. Então:

No painel do Render → **Environment** → Adicione/Atualize:
```
CORS_ORIGINS=https://SEU-APP.vercel.app,https://grilo.app
```

Refaça o deploy do Render.

### 3.5 Remover o servidor de arquivos estáticos do backend (opcional mas recomendado)

Quando o frontend estiver no Vercel, o `server.py` não precisa mais servir os HTMLs.
Isso reduz complexidade e evita conflitos de rota.

Arquivo `backend/server.py` — remova ou comente:
- As rotas `@app.get("/")`, `@app.get("/home.html")`, etc. (linhas 400-470)
- O `app.mount("/", StaticFiles(...))` (última linha antes do `if __name__`)

Mantenha apenas o `/health` e os `include_router`.

> **Cuidado:** faça isso DEPOIS que o Vercel estiver funcionando. Nunca remova antes.

---

## FASE 4 — Frontend no Vercel

### 4.1 Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com) → **New Project**
2. Importe o repositório GitHub do GRILO
3. Configurações:
   - **Framework Preset:** Other
   - **Root Directory:** `frontend`
   - **Build Command:** (deixe vazio — são arquivos estáticos)
   - **Output Directory:** (deixe vazio)
4. Clique em **Deploy**

### 4.2 Variáveis de Ambiente no Vercel

O frontend não tem variáveis de ambiente no servidor — tudo é client-side.
A URL do backend fica hardcoded no `utils.js` (você já fez isso no passo 3.1).

> **Alternativa mais flexível (opcional):** Se quiser evitar hardcode, crie um arquivo
> `frontend/config.js` com:
> ```js
> window.GRILO_API_URL = 'https://SEU-APP.onrender.com';
> ```
> E inclua ele nos HTMLs antes do `utils.js`.

### 4.3 Testar o fluxo completo

1. Acesse `https://SEU-APP.vercel.app` → landing page carrega
2. Cadastre um novo usuário → deve funcionar
3. Faça login com um usuário existente (dos 10 do MVP)
4. Acesse `/home` → carrega sem erro
5. Acesse `/voice.html` → chat de voz inicializa
6. Acesse `/lessons.html` → lista de aulas carrega
7. Acesse `/dashboard.html` → dashboard carrega com dados

Abra o **DevTools → Network** e confirme que as chamadas `/api/*` estão indo para
`onrender.com`, não para `vercel.app`.

---

## FASE 5 — Desligar Railway

Só faça isso após 24-48h de operação estável no novo stack.

1. No Railway: pause o serviço (não delete ainda)
2. Monitore erros por 2 dias
3. Se tudo estiver ok: delete o serviço e o banco no Railway

---

## Cold Start — Render Gratuito

O Render "adormece" o servidor após ~15 minutos sem requisições.
O wake-up leva 30-60 segundos. Isso pode silenciosamente "quebrar" o chat de voz.

### Adicionar banner de aviso no frontend

Adicione este HTML nos arquivos `home.html` e `voice.html`, antes do `</body>`:

```html
<div id="warming-up-banner" style="
  display:none; position:fixed; bottom:20px; left:50%;
  transform:translateX(-50%); background:#3A5E47; color:white;
  padding:12px 24px; border-radius:12px; font-family:'Space Grotesk',sans-serif;
  font-size:0.9rem; font-weight:500; z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,.3);
  white-space:nowrap;">
  ⏳ Servidor iniciando — aguarde alguns segundos...
</div>
```

### Adicionar função de warm-up em utils.js

Adicione após a declaração de `API_BASE_URL`:

```js
async function ensureBackendAwake(onWaiting) {
  const url = API_BASE_URL + '/health';
  for (let i = 0; i < 8; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const banner = document.getElementById('warming-up-banner');
        if (banner) banner.style.display = 'none';
        return true;
      }
    } catch (_) {}
    if (i === 1 && onWaiting) onWaiting(); // chama callback após 1a falha
    await new Promise(r => setTimeout(r, 8000));
  }
  return false;
}
```

### Chamar a função no carregamento

Em `home.html` e `voice.html`, no início do script principal:

```js
ensureBackendAwake(() => {
  const b = document.getElementById('warming-up-banner');
  if (b) b.style.display = 'block';
});
```

> **Alternativa paga:** O Render tem plano "Starter" por ~$7/mês que não dorme.
> Para MVP com 10 usuários o free está ok, mas considere ao crescer.

---

## Resumo de Riscos

| O que pode quebrar | Por quê | Como evitar |
|---|---|---|
| Todas as chamadas de API | fetch usa URL relativa `/api/...` | Atualizar `getApiBaseUrl()` + todos os fetch hardcoded |
| CORS bloqueado | Frontend em domínio diferente do backend | Configurar `CORS_ORIGINS` no Render antes do go-live |
| Render rejeitando requisições | TrustedHostMiddleware não tem `*.onrender.com` | Atualizar `server.py` |
| CSP bloqueando chamadas | `connect-src` não inclui `onrender.com` | Atualizar CSP no `server.py` |
| Usuários deslogados | SECRET_KEY diferente invalida os JWTs | Usar exatamente o mesmo SECRET_KEY do Railway |
| Perda dos 10 usuários | Dump/import mal feito | Validar `SELECT COUNT(*) FROM users` antes e depois |
| Chat de voz "falha" sem aviso | Cold start no Render | Banner de aviso + função warm-up |

---

## Estimativa de Tempo

| Tarefa | Tempo |
|---|---|
| Configurar Render (vars + deploy inicial) | 30 min |
| Ajustar `server.py` (hosts + CSP) | 20 min |
| Dump + import PostgreSQL | 1h |
| Validar dados no Supabase | 30 min |
| Atualizar `utils.js` + fetch hardcoded | 30 min |
| Criar `vercel.json` | 10 min |
| Implementar banner cold start | 20 min |
| Deploy Vercel + testes finais | 1h |
| **Total** | **~4-5h** |

---

## Comandos Úteis

```bash
# Testar conexão com Supabase localmente
DATABASE_URL="postgresql://..." python -c "
from sqlalchemy import create_engine, text
e = create_engine('$DATABASE_URL')
with e.connect() as c:
    print(c.execute(text('SELECT COUNT(*) FROM users')).fetchone())
"

# Iniciar backend localmente apontando para Supabase (para testar antes do Render)
DATABASE_URL="postgresql://..." GROQ_API_KEY="..." SECRET_KEY="..." \
  uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload

# Verificar health do backend no Render
curl https://SEU-APP.onrender.com/health
```

---

*Gerado em 2026-05-20 após análise completa do código-fonte.*
