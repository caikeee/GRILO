# GRILO — Raio-X do Produto

**Gerado em:** 2026-07-22, por leitura direta do código-fonte (branch `refactor/home-css-js-voice-pipeline`).
**Objetivo:** matéria-prima factual para plano de negócio / estratégia de marketing — não é um documento de estratégia em si. Onde algo é fato observado no código, está afirmado direto; onde é interpretação ou zona cinzenta, está marcado.

---

## Sumário executivo

GRILO é um produto de aprendizado de inglês para falantes de português do Brasil, hoje estruturado em 3 pilares de prática (Chat de Voz, Lições "4 Pontas", Shadowing Lab), amarrados por um sistema de nível CEFR baseado em evidência (não em XP) e uma camada de gamificação transversal. O backend já nasce instrumentado com analytics de produto e métricas de PMF com metas numéricas embutidas no código — isto é incomum para o estágio do produto e é um ativo em si. Monetização existe só como conceito + registro manual de pagamento (sem gateway integrado). Termos de Uso e Política de Privacidade (LGPD) já estão prontos.

**Números rápidos:**
- **44 aulas** do sistema "4 Pontas", em **9 grupos**, formando **2 blocos de nível** (A1 "Fundamentos" = 20 aulas, A2 "Conectando ideias" = 24 aulas)
- **10 faixas** de Shadowing Lab (7 em A1, 3 em A2), trilha linear com desbloqueio progressivo
- **20 modelos de dados** no backend, **~50 endpoints de API** distribuídos em 12 controllers
- **3 tiers de IA** por custo/latência (sem LLM → 8B → 70B), com meta declarada no código de **-66% tokens** e **&lt;2s de latência**
- **6 métricas de PMF** já calculadas com meta numérica cravada no código (ativação, retenção, sessões/usuário, minutos/usuário, conversão de paywall, elegibilidade Sean Ellis)
- **6 níveis de gamificação** por XP, streak diário, badges, e um funil de onboarding com 5 estágios já rastreado
- Legal: Termos de Uso e Política de Privacidade (LGPD) já publicados no domínio

---

## ⚠️ Tensão estratégica para resolver antes de escrever o plano

Existe um documento (`BUSINESS-STRATEGY.md`, raiz do repo) datado de **abril/2026** que declara um pivot para **"Voice-First"**: chat de voz como único produto de vitrine, com lições/quiz/chat de texto explicitamente **retirados da home e da landing**, "movidos para backlog de reativação".

Isso **contradiz o estado atual do código**: desde então (junho–julho/2026) houve investimento pesado justamente nas Lições (redesign completo em "4 pontas", 44 aulas escritas, sistema de blocos A1/A2) e um pilar **novo** inteiro (Shadowing Lab) — nenhum dos dois compatível com uma landing/vitrine "só voz". O sistema de níveis CEFR também passou a depender de aulas *e* shadowing como portões (gates), não só de voz.

Duas leituras possíveis, e só quem decide isso é você:
1. O pivot voice-first foi **abandonado na prática** (mesmo sem um novo documento formalizando isso) e o produto real hoje é multiproduto (voz + lições + shadowing) sob o guarda-chuva do sistema de níveis CEFR.
2. O pivot **segue valendo** para a vitrine/marketing (voz continua sendo a porta de entrada e a landing), e lições/shadowing são construídos como **conteúdo de retenção/aprofundamento por trás do login**, não como mensagem de aquisição.

Este documento descreve **o que existe**, sem tentar resolver essa tensão — mas qualquer plano de negócio novo precisa declarar explicitamente qual das duas leituras (ou uma terceira) é a vigente, porque isso muda quem é o ICP, o funil de aquisição e a mensagem da landing.

---

## 1. O produto em uma frase

Da própria landing page (`frontend/index.html`, já em produção/beta aberta):

> **"GRILO — Inglês que vira hábito antes de virar nota"**

E do guia de marca (`docs/BRAND-VOICE.md`, parece atual e alinhado com a copy viva):

> **"GRILO é o cheat code do seu inglês."** Não substitui curso, escola ou imersão — amplia. [...] "O que NÃO somos: curso, professor, app de gamificação, Duolingo."

Persona de marca: fala como "um amigo bilíngue mais experiente" — direto, confiante sem arrogância, trata o usuário como adulto inteligente com pouco tempo. Ver `docs/BRAND-VOICE.md` para o guia completo de tom/glossário/microcopy — está pronto para uso, não precisa ser refeito.

---

## 2. Copy e posicionamento já escritos na landing (literal)

Vale ouro para o plano de marketing — isto já foi escrito e testado visualmente, não precisa ser inventado do zero. `frontend/index.html`, estrutura: navbar → Hero → Manifesto → 3 Pilares → Prova social → CTA final → Footer.

- **Tag do hero:** "Beta aberta · grátis"
- **H1:** *"Ninguém aprende inglês por você."*
- **Subheadline:** *"Mas ninguém deveria aprender sozinho. Prática de voz com IA, gente atrás do mesmo objetivo e um mapa honesto do seu nível. Sem medalha, sem ofensiva, sem culpa."*
- **Segunda linha:** *"Não substitui seu curso. Acelera ele."*
- **Prova de produto embutida no hero** (exemplo real de correção): usuário diz *"I have went to the store yesterday."* → GRILO responde *"I **went** to the store yesterday." Past simple não usa "have."*
- **Manifesto** (kicker: "constância vence intensidade"): *"Fluência não nasce de maratona. Nasce de dias comuns, repetidos: dez minutos hoje, uma frase a mais amanhã, gente do seu lado a semana inteira."*
- **Título dos 3 pilares:** *"Três coisas. Bem feitas."* — *"Comunidade de verdade, conteúdo no padrão internacional e um mapa 360 do seu aprendizado. Nada além disso."*
  1. **Comunidade** — "Você não estuda sozinho." Mockup de chips: "praticando agora · 12 online", "Sala de conversação · B1", "Dupla de past simple", "Desafio da semana: small talk · 4/7 dias". *(ver nota na seção 11 — isso hoje é ilustrativo, não há back-end de comunidade real)*
  2. **Conteúdo** — "O padrão que o mundo reconhece." — referência explícita ao CEFR.
  3. **Mapa 360** — "Seus dados viram direção." — referência à IA lendo dificuldades.
- **Prova social — 3 números "honestos":** "5 min" (*"por dia já mudam onde você trava"*) · "100%" (*"da sessão é a sua voz, não um quiz"*) · "R$ 0" (*"na beta. Você cresce junto com o produto"*)
- **CTA final:** *"Sua próxima frase começa aqui."* — *"Conta criada em menos de dois minutos. Na primeira sessão você já sai falando. E amanhã tem gente esperando você voltar."* Botão: "Criar minha conta →". Selos: "gratuito na beta", "sem cartão", "menos de 2 min".
- **Footer:** *"Prática diária de verdade, construída junto com quem usa."*

Auth embutido no hero: toggle Entrar/Criar conta, usuário/senha (mín. 10 caracteres), badge "conexão segura". Tema claro/escuro já suportado em todas as páginas públicas e logadas.

---

## 3. Funcionalidades por pilar

### 3.1 Chat de Voz ("Estúdio de Escuta")

A prática central do produto. Interface imersiva tela cheia (orbe visual como "o espaço", não um card), tema claro/escuro completo.

- **Modos hoje acessíveis na UI** (`voice.html`): **Livre** (conversa aberta) e **Guiado** (5 cenários: Restaurante, Aeroporto, Entrevista, Viagem, Médico). O motor por trás também suporta `shadow` e `dictation` como modos de voz (usados hoje só contextualmente dentro do painel de Ajuda da sessão, não como modo principal selecionável — ver seção 11).
- **Mecânica "Ponte" (code-switching PT→EN)** — diferencial central: quando o aluno mistura português numa frase em inglês ("I prefer the *frango*"), a IA entende, responde 100% em inglês e devolve um card "legenda viva" com os pares `pt → en` (com pronúncia tocável por palavra) — sem quebrar o fluxo da conversa e **sem chamada extra de IA** (extraído da mesma resposta). Existe também o caminho inverso: se o aluno fala só em português, o backend traduz antes de mandar pro modelo, para a IA "entender" mesmo assim.
- **Correção implícita ("assume e flui"):** a IA nunca para a conversa para apontar erro. Ela modela a forma certa dentro da própria resposta falada; o erro registrado (tipo, errado→certo, dica em PT) vai para analytics/recap, não interrompe o turno. Filosofia aplicada em todo o pipeline: gate de entendimento não pede repetição mesmo com confiança baixa de reconhecimento de voz — assume o palpite mais provável e segue.
- **Painel de Ajuda ao vivo:** respostas rápidas sugeridas, "Pontos para revisar" atualizado durante a sessão, phrasebook pessoal (frases salvas).
- **Recap de sessão** (por IA): `quality_score` (0-100, rubrica gramática 40 + vocabulário 20 + fluência 20 + tentativas 20), radar de 5 eixos (fluência, gramática, vocabulário, ritmo, progresso), melhor frase da sessão, correções ancoradas na transcrição real (anti-alucinação), sugestão de estudo e próximo tópico.
- Cada mensagem de voz concede **8 XP fixos**.

### 3.2 Lições "4 Pontas"

Sistema de lições redesenhado para avaliar cada item do vocabulário em 4 frentes: **ver, ouvir, escrever, falar**. Escada de domínio por item: escreveu certo → **"aprendida"**; + ouviu + falou → **"dominada"** (entra no contador de vocabulário da home).

- **44 aulas em 9 grupos, 2 blocos de nível:**

| Bloco | Grupos | Aulas | Escopo/aula |
|---|---|---|---|
| **A1 · "Fundamentos"** | A Sobrevivência (6) · B Estrutura da frase (6) · C Rotina e tempo (5) · D Passado e desejos (3) | 20 | 8 palavras + 5 frases |
| **A2 · "Conectando ideias"** | E Passado e narrativa (5) · F Futuro e planos (5) · G Comparar e descrever (5) · H Opinião e conectores (4) · I Situações reais (5) | 24 | 10 palavras + 6 frases |

  Temas do A1: cumprimentos, apresentações, números, horas, preços/compras, restaurante, to be, pronomes, possessivos, this/that, perguntas sim/não, present simple, frequência, WH-questions, passado, want/like. Temas do A2: past continuous, used to, going to, will, comparativos, superlativos, conectores, opinião, viagem, saúde, direções, trabalho.

- **Fluxo do player:** capa (objetivo da aula) → teoria (exemplos com TTS) → checkpoints intercalados (múltipla escolha ver/ouvir; exercícios novos do A2: "contraste" ⚖️ EN×EN e "ordenar" 🧩 monte-a-frase) → bloco de produção ("Agora escreve" / "Agora fala"): ditado de palavra, tradução PT→EN digitada, compreensão auditiva + fala com reconhecimento de voz (até 3 tentativas, fuzzy match) → recap final com contagem de itens aprendidos/dominados.
- **Gate de bloco:** A1→A2 é só **completar as 20 aulas** (chegar ao recap de cada uma) — não exige 100% de domínio de item, fricção baixa por design.
- Progresso sincroniza com o backend a cada aula concluída (upsert monotônico — uma vez marcada uma ponta como certa, nunca regride).
- **XP:** 3 por item aprendido + 5 por item dominado + 10 de bônus por aula concluída.

### 3.3 Shadowing Lab (pilar novo, ainda não documentado em ciclos anteriores)

Técnica de "sombreamento" (repetir em tempo real por cima do áudio nativo) — copy do produto cita explicitamente a origem histórica: *"a técnica que forma intérpretes simultâneos desde os anos 1950, usada até hoje pela ONU e pela União Europeia."*

- **10 faixas** em trilha linear (só destrava a próxima ao passar a atual em modo Ranqueada): 7 de nível A1 (`sh-01`–`sh-07`), 3 de A2 (`sh-08`–`sh-10`). Cada faixa = 6 frases em narração contínua de 1ª pessoa (não diálogo), com tradução PT lado a lado. Meta de score para destravar sobe de 70 para 76 ao longo da trilha.
- **2 modos de sessão:**
  - **🎮 Casual** — sem fone exigido, sem limite, não pontua nem credita progresso.
  - **🏆 Ranqueada** — exige calibração de fone (detecção de eco via microfone) antes de liberar; ao vivo, alinhador palavra-a-palavra em tempo real com waveform nativo vs. usuário; só esta sincroniza com o backend.
- Fluxo: escolher modo → calibração (só ranqueada) → prévia "karaokê" (ouvir o texto inteiro) → sessão ao vivo → resultado (score 0–100%, recap com palavras certas/erradas destacadas).
- **Credita as mesmas fontes que a home já lê:** o mesmo pool `WordProfile` de vocabulário do chat de voz (mesma regra de domínio: ≥85% acurácia + ≥5 usos) e um pool próprio de frases dominadas (`ShadowLabPhrase` — hoje só **1 sessão aprovada já domina a frase**, já que cada faixa tem texto único).
- **XP:** 5/palavra nova dominada + 8/frase nova dominada + 15 de bônus ao destravar a próxima faixa.
- Meta de 10 sessões ranqueadas aparece como um dos "gates" do modal de nível CEFR na home (ver 3.5).

### 3.4 Chat de Texto

Modo escrita: aluno digita em inglês, recebe resposta natural **+ correção gramatical explícita** (diferente da correção implícita do chat de voz — aqui o erro é mostrado, não só modelado). Resumo de sessão traz `accuracy_avg`, XP ganho, top 3 tipos de erro em PT, vocabulário novo da sessão, e um **trend de acurácia dos últimos 7 dias** comparado ao histórico — granularidade de série temporal que o chat de voz (radar de 5 eixos por sessão) não tem. Existe também um "tira-dúvidas" (`/api/lessons/ask`) onde o aluno pergunta em português sobre a aula que está aberta.

### 3.5 Sistema de Níveis CEFR (baseado em evidência, não em XP)

Diferencial de posicionamento explícito: nível não é XP acumulado, é **conquista validada**. Aluno começa em **A0** e sobe por **portões (gates) em AND**, não por pontuação.

- **Escada exibida na home:** A0 ("Início") → A1 → A2 → B1 → B2 → C1 → C2, com popover por nível citando descritor CEFR ("Consigo me apresentar e fazer perguntas pessoais simples...") + estimativa de vocabulário do Cambridge English Profile (A1≈500 palavras → C2≈8000+), com disclaimer explícito: *"O GRILO usa isso como guia — não como verdade absoluta."*
- **4 portões exibidos no modal:** 📖 Vocabulário essencial · 💬 Frases e estruturas · 📘 Conteúdo pedagógico (aulas do bloco) · 🎙️ Sessões de Shadowing (meta 10 ranqueadas).
- **Regra codificada hoje para A0→A1** (única com lógica de certificação confirmada no backend): `vocab_mastered_total ≥ 500` **E** `phrases_mastered_total ≥ 50` **E** `20 aulas do bloco A1 completas`. *(Nota: a UI já mostra o portão de shadowing como um dos "4 reais" — vale confirmar se ele já está de fato somado à conta de certificação do A1 no backend ou se ainda é só informativo; os dois agentes de pesquisa bateram em números ligeiramente diferentes aqui.)*
- Modelo de certificado: ser **exibido** com um nível ≠ ter o nível **certificado** — A1 é a primeira conquista certificável, no mesmo gate acima.

### 3.6 Gamificação transversal

| Mecanismo | Regra |
|---|---|
| Níveis (1–6) | por XP acumulado — thresholds 0 / 200 / 600 / 1400 / 2800 / 5000 |
| Streak diário | bônus de XP 5 + 5/dia, cap em 30 |
| Badges | por `xp_threshold`, com "próxima conquista" sempre visível na home |
| XP por ação | voz 8 fixos · escrita 5–20 dinâmico (accuracy/5) · 4 pontas 3/5/+10 · shadowing 5/8/+15 · desafio semanal 10/item +50 bônus |
| Desafio semanal "Dificuldades" | 7 "quadradinhos" (seg–dom, fuso de Brasília), agrega itens difíceis de 3 fontes (frases, quiz legado, shadowing do chat de voz) |
| Desbloqueio progressivo de modo de voz | Guiado sempre liberado · Livre a partir de 2 dias de desafio OU 4 sessões · Shadow com 4 dias/8 sessões · Dictation com 6 dias/12 sessões |

Toda ação relevante grava em `UserActivity` (heatmap estilo GitHub) e alimenta o funil de analytics admin (seção 6).

### 3.7 Painel/Home do aluno

Saudação dinâmica, card "Continue de onde parou", faixa semanal de atividade, e sidebar "Seu progresso" com 4 cards clicáveis: insight de pronúncia (fonema da semana), nível CEFR (abre modal), palavras dominadas (abre modal com busca/abas/ranking por acurácia), próxima conquista. Onboarding pós-cadastro em 2 passos: "Por que quer aprender inglês?" (Viagem ✈️ / Trabalho 💼 / Entretenimento 🎮 / Estudos 📚) e "O que você faz no dia a dia?" (Tecnologia 💻 / Negócios 📈 / Saúde 🏃 / Arte 🎵) — chips fixos, guardados como texto no perfil.

---

## 4. Diferenciais competitivos observados no código

1. **"Ponte" code-switching** — nenhum concorrente listado no guia de marca (Duolingo é citado nominalmente como o que o GRILO *não* é) resolve o "travei e troquei pro português no meio da frase" como mecânica central de ensino em vez de erro a evitar.
2. **Correção por modelagem, nunca por interrupção** — filosofia "assume e flui": o produto deliberadamente nunca pede para repetir, nunca marca "errado" ao vivo. Isso é uma escolha de UX rara e bem documentada no código (comentários explicam o *porquê*).
3. **Nível por evidência, não por XP** — 4 portões citando fontes reais (CEFR do Conselho da Europa, Cambridge English Profile), com certificado atrelado ao mesmo gate. Se comparado a apps de pontuação pura, isso é uma tese de produto defensável ("medir habilidade real, não pontos").
4. **Engenharia de custo de IA já madura para o estágio:** roteamento em 3 tiers (sem LLM → modelo pequeno → modelo grande) por sinais de confiança/tamanho/modo, cache compartilhado entre usuários, chamadas condicionais de STT — meta declarada no próprio código de **-66% tokens** e **latência &lt;2s**. Isso é relevante para qualquer discussão de unit economics/margem por usuário ativo.
5. **Instrumentação de PMF embutida no produto**, não só no código de negócio — ver seção 6.

---

## 5. Métricas e analytics já instrumentados

Isto é um ativo pouco comum para o estágio — o produto já nasce medido. Dois painéis admin (protegidos por token), nenhum voltado ao usuário final:

### `/api/admin/pmf/metrics` — as "6 métricas norteadoras", cada uma com meta cravada no código:

| Métrica | O que mede | Meta embutida |
|---|---|---|
| Ativação D0 | % de cadastros com sessão de voz completa no mesmo dia | 50% |
| Retenção (cohort semanal) | D7 / D30 médios, heatmap W0–W8 | 35% / 20% |
| Sessões por usuário ativo/semana | uso de voz | 2.5 |
| Minutos por usuário ativo/semana | uso de voz | 15 min |
| Conversão de paywall | payment/paywall-viewed, + MRR estimado do período + total de pagantes | 3% |
| Elegibilidade Sean Ellis | usuários com ≥3 sessões de voz, prontos para pesquisa "ficaria muito decepcionado sem o produto" quando ≥30 elegíveis | — |

### `/api/analytics/dashboard` — painel geral, 7 blocos:
**Saúde** (MAU/DAU, stickiness%, retenção D7/D30, churn, XP médio, logins) · **Aprendizado** (conclusão de aulas, distribuição de dificuldade, top 5 aulas) · **Voz** (adoção%, minutos, tópicos mais falados) · **Padrões de uso** (série diária 30 dias, usuários consistentes ≥5 dias) · **Funil** (onboarding em 5 estágios, taxa de 1º uso, adoção de voz) · **Técnico** (latência/erro de IA) · **Insights** (até 5 alertas automáticos em texto).

Mais `/api/analytics/cohorts` (cohort de 12 semanas por signup) e `/api/analytics/alerts` (motor de alertas com severidade — queda de DAU, spike de erro/latência, zero cadastros em 48h, streaks em risco, retenção D7 crítica).

**Implicação prática:** o plano de negócio pode citar metas de ativação/retenção/conversão que **já existem em produção**, não precisa criá-las do zero — só decidir se ainda são as metas certas.

---

## 6. Monetização — estado atual

Estágio **MVP/manual**, sem gateway de pagamento integrado:

- `POST /api/pmf/paywall-viewed` — evento de exibição de paywall.
- `POST /api/pmf/payment-completed` — auto-registro pelo próprio usuário (comentário no código indica "fluxo MVP").
- `POST /api/admin/pmf/payment-record` — registro **manual** pelo admin (plano + valor em R$ + método), sugerindo cobrança hoje feita fora do produto (ex.: PIX) e depois lançada à mão.
- Planos nomeados na ferramenta de admin: **Pro Mensal**, **Pro Anual**, **Founders (R$ 49)** — sem tabela de preços pública nem checkout no frontend do usuário.
- Landing e Termos de Uso comunicam explicitamente fase **BETA gratuita** ("R$ 0 na beta. Você cresce junto com o produto"), com aviso de que preços/condições serão exibidos antes de qualquer cobrança futura.

---

## 7. Arquitetura técnica (para quem for pensar em custo, escala ou levantar investimento)

**Stack:** FastAPI + SQLAlchemy (Python), frontend vanilla JS sem framework (sem React/Vue), SQLite local por padrão (`grilo.db`), Postgres suportado via `DATABASE_URL` para produção. Migrações manuais via `ALTER TABLE` guardado por introspecção — não usa Alembic.

**IA — 3 tiers de custo/latência** (`decision_engine.py` + `services.py`, provedor único **Groq**):
- **Sem LLM** (0 tokens, 10-30ms): respostas fixas para utterances triviais (cumprimentos, etc.) ou marcador de início de sessão.
- **Modelo leve** — `llama-3.1-8b-instant`: 200-300 tokens, até 4 turnos de histórico.
- **Modelo completo** — `llama-3.3-70b-versatile`: 600-1000 tokens, até 10 turnos, prompt completo por nível CEFR (A1–C2).
- Sinais de roteamento: tamanho da frase (limiar varia por nível — A1 aceita frases mais curtas como "completas" que C2), modo de voz (shadow/dictation sempre força modelo completo), e **confiança do reconhecimento de voz** (abaixo de 0.72, força modelo completo em vez de pedir repetição — mesma filosofia "assume e flui").
- Existe lógica de downgrade automático por cota restante da API, mas está **inerte hoje** (valor de cota é passado fixo no código em vez de ler o consumo real).

**Voz:** STT via Groq Whisper (`whisper-large-v3`, chamado só condicionalmente quando a confiança do navegador é baixa, economizando 0.5–1.5s por turno); TTS via ElevenLabs (`eleven_multilingual_v2`, vozes fixas para EN/PT, com fallback automático para a Web Speech API do navegador se a chave faltar ou a cota estourar).

**Cache:** LRU+TTL em memória de processo (não Redis), 1000 entradas, TTL de 1h, compartilhado entre **todos os usuários** (efeito de rede: fica melhor conforme a base cresce), com atraso artificial de 250-350ms injetado em hits de cache para não parecer robótico.

**Segurança:** JWT (HS256), access token de 8h + refresh de 30 dias com rotação e detecção de replay, hash do refresh token no banco (não texto puro), bcrypt (12 rounds), bloqueio de conta após 8 tentativas falhas (15min), CSP restritiva (só libera chamadas para `api.elevenlabs.io` e `api.groq.com`), rate limiting por rota via `slowapi`.

**RAG (busca vetorial sobre material de gramática):** código já escreve a integração (`RAGVectorStore`), mas a pasta `backend/rag/` **não existe neste checkout** — feature ainda não implementada de fato. Há 3 PDFs de gramática em português na raiz do repo que parecem ser o material-fonte planejado para isso.

---

## 8. Segurança, dados e compliance

- **Termos de Uso** (`termos.html`) — atualizado maio/2026. Define GRILO como "ampliador de aprendizado de inglês baseado em IA", fase **BETA**, idade mínima 13 anos, reembolsos seguem o Código de Defesa do Consumidor, contato `contato@grilo.app`.
- **Política de Privacidade** (`privacidade.html`) — conforme **LGPD** (Lei 13.709/2018): controlador definido, tabela de dados coletados, bases legais, retenção (30 dias pós-exclusão de conta, logs por 6 meses), direitos do titular, menção à ANPD, contato `privacidade@grilo.app`.
- Ambos prontos para lançamento público — não são pendência de compliance.

---

## 9. O que o próprio produto já pergunta sobre o usuário

Cadastro coleta só `username` / `email` / `senha`. Onboarding pós-cadastro (funil de 4 passos rastreado individualmente) coleta, via chips fixos: **motivo de aprender** (viagem/trabalho/entretenimento/estudos) e **interesse do dia a dia** (tecnologia/negócios/saúde/arte/cultura). Não há captura estruturada de idade, profissão ou autoavaliação de nível — a personalização depende do modelo de IA lendo esse contexto, não de segmentação por formulário.

*(O documento antigo `BUSINESS-STRATEGY.md` propõe um ICP — "brasileiro 18-40 que precisa falar inglês para trabalho/entrevista/viagem, já tentou estudar por conteúdo mas trava na fala", com subsegmentos TI/tech e atendimento/vendas. Isso é uma **hipótese estratégica de abril**, não um dado coletado — vale re-validar com os dados de onboarding/analytics que já existem antes de reafirmar no novo plano.)*

---

## 10. Estado do código — pronto vs. fachada vs. morto

Seção de honestidade técnica — importante para não prometer no plano de negócio algo que ainda não existe de fato:

- **"Comunidade" é copy, não feature ainda.** A landing promete "Comunidade de verdade" (Pilar 1) com mockups de "praticando agora · 12 online", salas de conversação, duplas de estudo. Não há nenhum modelo de dados (dos 20 existentes) para salas, pareamento ou amigos — é posicionamento à frente da engenharia.
- **Migração da trilha clássica está parcialmente concluída.** As 27 aulas antigas (grade clássica) foram removidas do produto, mas as tabelas `LessonProgress`, `LessonPhraseBank`, `PhraseError`, `LessonQuizError` continuam no banco e ainda são lidas por `difficulties_session_controller.py` (funcionam com resultado vazio/zero, não quebram, mas são candidatas a limpeza).
- **Modos Shadow/Ditado do chat de voz** existem no motor e no CSS de `voice.html`, mas não aparecem no seletor de modo da UI atual (só Livre/Guiado são escolhíveis) — hoje só acionados contextualmente dentro do painel de Ajuda.
- **RAG não implementado** (pasta ausente, ver seção 7) — a personalização por busca em material de gramática é aspiracional hoje.
- Há funções de um recurso antigo de "gerador de histórias" (fim de `services.py`) sem nenhuma chamada ativa — código morto.
- `GROQ_TRANSCRIPTION_API_KEY` existe como variável de ambiente documentada mas nunca é lida no código.
- **Admin é hardcoded**, não um sistema de papéis: um único usuário (`caike`) é promovido automaticamente a admin no startup — não há gestão genérica de equipe/permissões ainda.
- Cache e rate-limit vivem em memória do processo — funcionam bem para uma instância, mas não sobrevivem a múltiplas instâncias/escala horizontal sem migrar para um store compartilhado (Redis, por exemplo).

---

## 11. Outros documentos do repositório — o que já existe e o que está desatualizado

| Documento | Estado | O que fazer |
|---|---|---|
| `docs/BRAND-VOICE.md` | Parece atual, alinhado com a copy viva da landing | Usar como está — guia de tom, glossário e microcopy pronto |
| `BUSINESS-STRATEGY.md` | Abril/2026, pivot "Voice-First" | **Contradiz o estado atual** (ver seção "Tensão estratégica" no topo) — precisa de decisão explícita, não arquivamento silencioso |
| `docs/SYSTEM_MAP.md` / `ARCHITECTURE_OVERVIEW.md` | 14/06/2026 — descrevem a trilha clássica de 27 aulas, `quiz_questions.py`, `pedagogy_orchestrator.py`, só 2 páginas de frontend | Obsoletos — nada disso existe mais no código. Este documento os substitui como retrato técnico atual |
| `FEATURES_CHECKLIST.md`, `TESTE_MELHORIAS.md`, `VISUAL_PREVIEW.md` | Documentam um modal de aula (`modal-interactions.js` / `modal-ux-enhancement.css`) já deletado na limpeza da trilha clássica | Obsoletos, sem valor de referência |
| `docs/GRILO-STARTUP/README.md` | Atual | Este arquivo é o primeiro conteúdo da pasta além do README |

---

*Fontes: leitura direta de `backend/` (server, controllers, db_models, services, decision_engine, auth, config) e `frontend/` (todas as páginas, controllers e assets de dados) nesta data. Memórias de sessões anteriores (redesign de aulas, sistema CEFR, redesign de voz) foram usadas só como contexto histórico e cruzadas com o código atual antes de entrar aqui.*
