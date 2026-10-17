# GRILO — Raio-X do Produto

**Atualizado em:** 2026-10-07, por leitura direta do código no branch `main` (inclui mudanças ainda não commitadas na home). Versão anterior: 2026-07-22.
**Objetivo:** retrato factual do que existe hoje, para basear estratégia, marketing e vendas. A estratégia em si está em [PLAYBOOK-ESTRATEGICO.md](PLAYBOOK-ESTRATEGICO.md).
Onde é fato observado no código, está afirmado direto. Onde é interpretação ou zona cinzenta, está marcado.

---

## Sumário executivo

GRILO é um produto web de treino de inglês para brasileiros, com **5 frentes**: Sessão de voz (o centro), Aulas 4 pontas, Shadowing, Ditação e Comunidade. Tudo é amarrado por um sistema de nível CEFR baseado em evidência (não em XP) e por uma home com "Treino de hoje". O backend nasceu instrumentado com métricas de PMF com metas no código. **Não há cobrança:** beta gratuita, sem checkout. Termos de Uso e Política de Privacidade (LGPD) publicados.

**Números rápidos:**
- **44 aulas** 4 pontas em 9 grupos, 2 blocos (A1 "Fundamentos" = 20, A2 "Conectando ideias" = 24)
- **10 faixas** de Shadowing (7 A1, 3 A2)
- **4 faixas** de Ditação (2 A1, 2 A2)
- **5 cenários** guiados de voz + modo livre
- **25 modelos de dados**, **~60 endpoints** de API em 14 controllers
- **6 métricas de PMF** com meta cravada no código
- Landing com tour das 5 frentes, publicada

### O que mudou desde julho
| Data | Mudança |
|---|---|
| 13/09 | Voz migrada de Llama (descontinuado no Groq) para **gpt-oss** (120b/20b); captura de voz com **Silero VAD**; prompt simplificado para respostas mais naturais; hero da landing redesenhado |
| 20/09 | **Comunidade** (fórum de pauta com votos e status) |
| 21/09 | Aulas 4 pontas retomam do ponto exato; topbar da home vira cápsula de comando |
| 22/09 | Login passa a cair ao fechar a aba (token em `sessionStorage`) |
| 03/10 | **Ditação**; landing vira vitrine das 5 frentes (tour, Ponte, escada de níveis) |
| em andamento | Home com **"Treino de hoje"** (aula → ditação → shadowing) e "Use o que aprendeu" (voz, comunidade) — não commitado |

A tensão de julho ("landing só-voz" vs. multiproduto) está resolvida pelos fatos: a landing mostra as 5 frentes com a voz como promessa da hero. Ver Parte 1 do playbook.

---

## 1. Landing (`frontend/index.html`) — copy literal

- **Title/OG:** "GRILO — Fale inglês. A gente cuida do resto." · OG: *"Misturou português no meio da frase? O GRILO entende, responde em inglês e te devolve a palavra que faltou. Beta aberta e gratuita."*
- **Tag:** "Beta aberta e gratuita"
- **H1:** *"Fale inglês. A gente cuida do resto."*
- **Sub:** *"Uma IA que conversa com você e corrige sem interromper. Aulas, shadowing e ditação pra fixar o que você falou. E um mapa honesto do seu nível."*
- **Demo no hero** com 3 cenas: Pronúncia (*"I tink"* → *"Think." A língua entre os dentes*), Mistura PT/EN, Gramática.
- **Cadastro embutido** no hero (link `/?cadastro` abre direto em "Criar conta").
- **Tour "Por dentro do GRILO"** — *"A conversa é o centro. O resto existe pra que o que você falou hoje ainda esteja lá amanhã."* 5 abas com mockup: Sessão de voz, Aulas 4 pontas, Shadowing, Ditação, Comunidade.
- **A Ponte:** *"Travou no meio da frase? Fala em português mesmo."* — exemplo animado *I prefer the frango → chicken*, com pronúncia tocável.
- **Níveis:** *"Nível aqui é conquista, não pontinho."* Escada A0→C2 (B1+ "em breve") e 4 portões do A1: vocabulário 500, frases 50, aulas 20, shadowing ranqueado 10. Rodapé: *"Ninguém sobe de nível por ter aberto o app."* ⚠️ ver seção 9.
- **CTA final:** *"Dez minutos hoje. Uma frase a mais amanhã."* · selos "grátis na beta", "sem cartão", "menos de 2 min".
- **Footer:** *"Prática diária de verdade, construída junto com quem usa."* · Instagram @griloai.
- **Esqueci a senha:** modal diz que a redefinição é manual e manda contatar pelo Instagram.

Guia de marca: `docs/BRAND-VOICE.md` (tom "amigo bilíngue", glossário, microcopy). Continua válido; o playbook propõe trocar a plataforma "cheat code" por "Inglês sem grilo".

---

## 2. As 5 frentes

### 2.1 Sessão de voz (`voice.html`)
Interface imersiva tela cheia (orbe), tema claro/escuro.
- **Modos na UI:** Livre e Guiado (Restaurante, Aeroporto, Entrevista, Viagem, Médico). Shadow e Ditado existem no motor de voz, mas só aparecem contextualmente no painel de Ajuda.
- **Ponte (code-switching PT→EN):** aluno mistura português (*"I prefer the frango"*), a IA entende, responde 100% em inglês e mostra um card com os pares pt→en e pronúncia por palavra — **sem chamada extra de IA**. Se o aluno fala só português, o backend traduz antes de mandar ao modelo.
- **Correção implícita ("assume e flui"):** a IA nunca para a conversa para apontar erro; modela a forma certa na resposta. Com confiança baixa no reconhecimento, assume o palpite mais provável em vez de pedir repetição.
- **Painel de Ajuda:** respostas sugeridas, pontos para revisar ao vivo, frases salvas.
- **Recap por IA:** nota 0–100 (gramática 40 + vocabulário 20 + fluência 20 + tentativas 20), radar de 5 eixos, melhor frase, correções ancoradas na transcrição, sugestão de estudo e próximo tópico.
- **Captura:** Silero VAD (detecção de fala) desde 13/09.

### 2.2 Aulas 4 pontas (`lessons.html`)
Cada item de vocabulário é avaliado em **ver, ouvir, escrever, falar**. Escreveu certo → "aprendida"; + ouviu + falou → "dominada".

| Bloco | Grupos | Aulas | Escopo/aula |
|---|---|---|---|
| **A1 · Fundamentos** | Sobrevivência (6) · Estrutura da frase (6) · Rotina e tempo (5) · Passado e desejos (3) | 20 | 8 palavras + 5 frases |
| **A2 · Conectando ideias** | Passado e narrativa (5) · Futuro e planos (5) · Comparar e descrever (5) · Opinião e conectores (4) · Situações reais (5) | 24 | 10 palavras + 6 frases |

Player: capa → teoria com áudio → checkpoints (múltipla escolha, contraste, monte-a-frase) → produção (ditado de palavra, tradução PT→EN, compreensão + fala com reconhecimento de voz, até 3 tentativas) → recap. **Retoma do ponto exato** se o aluno sair. Gate A1→A2: completar as 20 aulas. Tira-dúvidas em português sobre a aula aberta (`/api/lessons/ask`).

### 2.3 Shadowing (`shadowing.html`)
Técnica de intérprete ("usada até hoje pela ONU e pela União Europeia", na copy). 10 faixas lineares de narração em 1ª pessoa, 6 frases cada, com tradução.
- **Casual:** sem fone, não pontua.
- **Ranqueada:** exige calibração de fone (detecção de eco), alinhamento palavra a palavra ao vivo com waveform nativo vs. aluno; meta de score sobe de 70 a 76 ao longo da trilha; só esta credita progresso.
- Credita vocabulário (mesmo pool da voz) e frases dominadas. XP: 5/palavra, 8/frase, +15 ao destravar faixa.

### 2.4 Ditação (`dictation.html`) — nova
Ouvir uma frase e digitar exatamente o que ouviu. 4 faixas: *Nice to Meet You*, *Text Me Later* (A1), *Work and Study*, *Last Weekend* (A2).
- Andaime gramatical colorido que revela as palavras certas ao vivo.
- Correção estrita palavra a palavra (homófonos não passam).
- Combo de frases perfeitas.
- Credita vocabulário e frases dominadas com XP (lógica de vocabulário compartilhada com o Shadowing).

### 2.5 Comunidade (`community.html`) — nova
**Fórum de pauta, não comunidade de prática.** Alunos abrem tópicos (sugestão, correção de conteúdo, bug, recurso, dúvida), votam (só upvote) e acompanham o status (aberto → em andamento → resolvido/recusado). Cooldown de 6h entre tópicos, detecção de duplicata, correções ancoradas no slug da aula, ranking de contribuidores, notificações. Cada mudança de status deixa comentário de sistema.
- `scripts/seed_community.py` cria **usuários e tópicos fictícios** para demonstração local. Não usar esses números como se fossem reais.
- Não existe pareamento, sala de conversa ou "gente online pra praticar".

### 2.6 Chat de texto
Controller e endpoint existem (`chat_text_controller.py`, `controllers/chat/chat-text-controller.js`) com correção gramatical explícita e resumo de sessão. Não aparece como frente na landing nem no "Treino de hoje".

---

## 3. Nível CEFR por evidência

- Escada na home e na landing: A0 → A1 → A2 → B1 → B2 → C1 → C2, com descritores CEFR e estimativa de vocabulário do Cambridge English Profile (A1 ≈ 500 → C2 ≈ 8000+), com aviso de que é guia, não verdade absoluta.
- **Certificação A0→A1 no backend** (`lessons_controller.py`): `vocab_mastered_total ≥ 500` **E** `phrases_mastered_total ≥ 50` **E** `20 aulas A1 completas`. **Shadowing não entra nessa conta**, embora a UI e a landing o mostrem como 4º portão obrigatório.
- Só o A1 tem lógica de certificação; A2+ ainda não.

---

## 4. Home e hábito

- Saudação dinâmica, cápsula de comando (navegação), card "Sua próxima aula" com objetivo e barra de progresso.
- **Treino de hoje** (em construção): aula → ditação → shadowing, cada passo aponta para o conteúdo da vez e marca ✓ quando feito no dia.
- **Use o que aprendeu:** atalhos para Sessão de voz e Comunidade.
- Faixa da semana, desafio semanal de dificuldades, sidebar de progresso (fonema da semana, nível CEFR, palavras dominadas, próxima conquista).
- Onboarding pós-cadastro: motivo (Viagem / Trabalho / Entretenimento / Estudos) e interesse (Tecnologia / Negócios / Saúde / Arte).

**Gamificação:** níveis 1–6 por XP (0/200/600/1400/2800/5000), streak diário, badges, desafio semanal, desbloqueio progressivo de modos de voz. Toda ação grava em `UserActivity`.

---

## 5. Diferenciais observados no código

1. **Ponte** — nenhum concorrente trata a mistura PT/EN como mecânica de ensino.
2. **Correção sem interrupção** — escolha deliberada e documentada no código.
3. **Nível por evidência**, com fontes reais (CEFR, Cambridge English Profile).
4. **Treino em 5 estações** (voz, aulas, shadowing, ditação, comunidade), todas creditando o mesmo mapa de vocabulário e frases.
5. **Custo de IA engenheirado:** roteamento em 3 camadas (sem LLM → modelo pequeno → modelo grande), cache compartilhado entre usuários, Whisper só quando a confiança do navegador é baixa.
6. **PMF instrumentado** desde o início.

---

## 6. Métricas e analytics

**`/api/admin/pmf/metrics`** — metas no código: ativação D0 50% · retenção D7 35% / D30 20% · 2,5 sessões de voz por ativo/semana · 15 min de voz por ativo/semana · conversão de paywall 3% · elegibilidade Sean Ellis (≥3 sessões de voz; pesquisa quando houver 30 elegíveis).

**`/api/analytics/dashboard`** — saúde (MAU/DAU, stickiness, D7/D30, churn), aprendizado, voz, padrões de uso, funil de onboarding, técnico (latência/erro de IA), alertas automáticos. Mais coortes de 12 semanas e motor de alertas.

O painel `pmf.html` avisa que o evento `paywall_viewed` **nunca foi disparado no frontend**.

---

## 7. Monetização

- **Nenhuma cobrança ativa.** Beta gratuita comunicada na landing e nos Termos.
- Endpoints existentes: `paywall-viewed`, `payment-completed` (autorregistro), `admin/pmf/payment-record` (registro manual com plano, valor e método).
- Planos nomeados só no admin: Pro Mensal, Pro Anual, Founders (R$ 49). Sem página de planos nem checkout.

---

## 8. Arquitetura

- **Stack:** FastAPI + SQLAlchemy, frontend em JS puro (sem framework), SQLite local / Postgres em produção (`DATABASE_URL`, normalizado para psycopg2). Migrações manuais por introspecção.
- **IA (Groq):** modelo padrão `openai/gpt-oss-120b`; classificador escolhe `gpt-oss-20b` (rápido/barato) ou `120b` (completo). Respostas triviais sem LLM.
- **Voz:** STT do navegador + Groq Whisper `whisper-large-v3` condicional; Silero VAD; TTS ElevenLabs `eleven_multilingual_v2` com fallback para a voz do navegador.
- **RAG:** `backend/rag/` existe no `main` (ChromaDB + PDFs de gramática indexados); o contexto entra no prompt "silenciosamente" quando o índice está disponível. *Não verificado se o índice está ativo em produção.*
- **Cache:** LRU+TTL em memória, compartilhado entre usuários. Rate limit em memória (`slowapi`). Funciona com uma instância; escalar horizontalmente exige Redis ou similar.
- **Segurança:** JWT (8h) + refresh (30 dias) com rotação e detecção de replay, bcrypt, bloqueio após 8 falhas, CSP restritiva. Token do frontend em `sessionStorage` desde 22/09.
- **Sem:** envio de e-mail, push, service worker/PWA.

---

## 9. Pronto vs. fachada vs. lacuna

| Item | Estado | Impacto |
|---|---|---|
| Checkout / gateway de pagamento | **Não existe** | Impede qualquer receita |
| Login persistente | Cai ao fechar a aba (`sessionStorage`) | Atrito diário num produto de hábito |
| Redefinição de senha | Manual, via DM no Instagram | Não escala; passa amadorismo |
| E-mail / push / lembretes | Não existem | Nenhum canal para trazer o aluno de volta |
| PWA / app instalável | Não existe | Concorrentes estão na tela inicial do celular |
| 4º portão do A1 (shadowing) | Mostrado na landing e na UI, **não contado** no backend | Contradiz a promessa "nível honesto" |
| Comunidade de prática (pares, salas) | Não existe; a Comunidade é fórum de pauta | Não prometer "gente pra praticar" |
| Dados de demonstração da Comunidade | Script cria usuários fictícios | Não apresentar como reais |
| Modos Shadow/Ditado na sessão de voz | Só contextuais no painel de Ajuda | Baixo |
| Certificação A2+ | Não implementada | Baixo agora; necessário quando alunos chegarem ao fim do A2 |
| Admin | Usuário único hardcoded (`caike`) | Baixo agora |
| Tabelas da trilha clássica antiga | Ainda no banco, lidas com resultado vazio | Limpeza técnica |

---

## 10. Compliance

- **Termos de Uso** (`termos.html`, mai/2026): "ampliador de aprendizado de inglês baseado em IA", fase beta, idade mínima 13 anos, reembolsos pelo CDC, `contato@grilo.app`.
- **Política de Privacidade** (`privacidade.html`): LGPD completa, `privacidade@grilo.app`.
- Quando houver cobrança, revisar os Termos para incluir planos, renovação automática, cancelamento e o direito de arrependimento de 7 dias.

---

## 11. Outros documentos do repositório

| Documento | Estado |
|---|---|
| `docs/GRILO-STARTUP/PLAYBOOK-ESTRATEGICO.md` | **Atual (out/2026)** — estratégia vigente |
| `docs/GRILO-STARTUP/KIT-DE-VENDAS.md` | **Atual (out/2026)** — textos e roteiros prontos |
| `docs/GRILO-STARTUP/PLANO-DE-ACAO-CEO.md` | Jul/2026. Referências de growth seguem válidas; plano de ação e regra "landing só-voz" superados pelo playbook |
| `BUSINESS-STRATEGY.md` (raiz) | Abr/2026, voice-first. Histórico |
| `docs/BRAND-VOICE.md` | Válido para tom, glossário e microcopy. Plataforma "cheat code" em revisão (ver playbook 3.1) |
| `docs/SYSTEM_MAP.md`, `ARCHITECTURE_OVERVIEW.md` | Obsoletos (jun/2026) |
| `FEATURES_CHECKLIST.md`, `TESTE_MELHORIAS.md`, `VISUAL_PREVIEW.md` | Obsoletos |

---

*Fontes: leitura de `backend/` (config, decision_engine, services, controllers, db_models), `frontend/` (páginas, dados de aulas/shadowing/ditação, home-today), `scripts/` e `git log` desde 2026-07-20.*
