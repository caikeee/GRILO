# Prompt — Redesenho mobile de Aulas, Shadowing e Ditação (GRILO)

> Use este texto como instrução para quem for implementar, seja um agente (Claude Code) ou uma pessoa.
> Referências visuais: `docs/ux-mobile/redesign.html` (como vai ficar) e `docs/ux-mobile/index.html` (auditoria do estado atual, com prints).

---

## 1. Papel e objetivo

Você é o designer-engenheiro de produto do GRILO, um app web de inglês para brasileiros (vanilla HTML/CSS/JS no `frontend/`, FastAPI no `backend/`). Sua missão é **redesenhar a experiência mobile** das três práticas centrais (**Aulas** no sistema das 4 pontas, **Shadowing** e **Ditação**) para que aprender no celular fique mais fácil, mais rápido e mais gostoso, **sem mudar a pedagogia** que já funciona.

O resultado deve parecer **um só produto**: as três práticas compartilham o mesmo casco (topbar de sessão, dock de ação, sheet de feedback, tela de resultado), a mesma tipografia e as mesmas regras de cor.

## 2. Diagnóstico que motiva o redesenho

Medido em 390×844 (iPhone), ver `docs/ux-mobile/index.html`:

1. **Os heróis comem a primeira tela.** Nos hubs, o aluno rola uma tela inteira de texto antes de ver uma aula ou faixa. O hub de aulas tem cerca de 20.000 px.
2. **Bugs de layout.** Capa e transição das aulas deslocadas à direita; input de escrita vazando do cartão; "Devagar" da ditação passando da coluna; textos truncados nos cartões; atalho cortado no preview do shadowing; pílula "treino do dia" quebrando em 3 linhas.
3. **Ação longe do polegar.** "Continuar", "Verificar" e "Próxima frase" ficam no meio da tela ou no fim de um scroll, e metade inferior fica vazia.
4. **Shadowing pede decisões técnicas antes de ouvir.** Casual × Ranqueada, calibração e a faixa inteira em cinza claro. Sem fone, termina em erro vermelho.
5. **Ditação ignora o teclado.** HUD, barra, áudio, blocos, campo e dica empilhados; com o teclado aberto, Dica e Verificar somem.
6. **Resultados punitivos.** Círculo vermelho com nota baixa e palavras riscadas convivem com "+XP".
7. **Inconsistências.** Fonte pesada diferente nos botões do shadowing, bolha branca do botão de tema sobre o conteúdo, ícone 🏁 sem cor, título escuro sobre verde no hub de aulas.

## 3. Princípios (valem para toda decisão)

1. **Ação no polegar.** A ação principal mora sempre no mesmo lugar: o **dock** fixo no rodapé.
2. **Uma coisa por tela.** Cada tela tem um único foco: uma pergunta, uma palavra, uma frase.
3. **Ouvir é herói.** Em toda etapa de escuta, o botão de áudio é o maior elemento interativo da tela.
4. **Errar não pune.** Erro vem em tom âmbar/rosado suave, com a resposta certa e o caminho de volta. Vermelho forte nunca é usado para nota.
5. **Explicar sob demanda.** Textos de "como funciona" saem do caminho e vão para um sheet aberto por link.
6. **Mostrar o progresso, não a burocracia.** Barra segmentada pelas fases; contadores só onde mudam decisões.
7. **Funcionar no pior cenário.** Sem fone, sem reconhecimento de voz, teclado aberto, tela de 360 px: a experiência degrada com elegância.

## 4. Sistema visual (tokens)

Use os tokens existentes. Não invente paleta nova.

| Papel | Token / valor | Uso |
|---|---|---|
| Tinta | `#1f3b2d` (`--lp-text`) | títulos, texto principal |
| Verde primário | `#4a7c5e` (`--lp-green`) | botão primário, progresso, acerto |
| Verde escuro | `#3a5e47` (`--lp-green-dark`) | pressed, hero compacto |
| Fundo | `#f4f7f5` (`--lp-bg`) | fundo de sessão |
| Superfície | `#ffffff` | cartões, sheet |
| Borda | `#d9e7dc` (`--lp-border`) | divisórias, inputs |
| Muted | `#6a7b71` (`--lp-muted`) | texto secundário (mínimo AA 4.5:1) |
| Lima | `#C9E86A` (`--hm-lime`) / tinta `#4E6B12` | **só "agora"**: palavra tocando, item atual, combo |
| Âmbar | `#d9832e` (`--lp-warm`) | kicker de fase, "quase", atenção |
| Erro suave | `#c0554d` sobre `#f8ecea` | feedback de erro (nunca nota) |
| Estrutura (ditação) | `--dt-subject`, `--dt-verb`, `--dt-object`, `--dt-complement`, `--dt-adverbial`, `--dt-connector` | blocos de frase |

- **Tipografia:** Manrope 700/800 para títulos e botões; Space Grotesk 400/500 para corpo. **Proibido** Arial Black ou fonte pesada genérica, e **proibido** CAIXA ALTA em botões. Caixa alta só em kickers de 11–12 px com espaçamento de 0,1em.
- **Escala:** 28/22/18/16/14/12. Corpo 16 px, nunca menor que 14 px para conteúdo.
- **Raios:** 14 (input, opção), 20 (cartão), 26 (sheet), pílula para botões.
- **Alvos:** mínimo 44×44 px; botão primário com 52 px de altura.
- **Ícones:** SVG inline de traço 2 px. Emojis só como tempero de conteúdo, nunca como ícone de sistema (o 🏁 sai).
- **Tema escuro:** todos os componentes novos precisam dos dois temas via `:root[data-theme="dark"]`.

## 5. O casco comum (componentes compartilhados)

Crie em `frontend/assets/css/session-shell.css` + `frontend/assets/js/session-shell.js` e use nas três práticas.

### 5.1 Topbar de sessão (dentro de um exercício)
- Altura de 56 px + safe-area-top. Da esquerda para a direita: **X** (44 px, fecha com confirmação se houver progresso não salvo), **barra de progresso**, **contador** compacto (`3/12`, ou `⭐ 120 · 🔥2` na ditação).
- **Aulas:** barra segmentada em 5 fases (Aula · Checar · Escrever · Falar · Fecho). A fase atual preenche proporcionalmente, as anteriores ficam cheias. O nome da fase aparece como kicker no conteúdo, não na topbar.
- Nada de título da aula na topbar (ele aparece na capa e no recap).

### 5.2 Dock de ação
- Fixo no rodapé, com gutter de 16 px, padding-bottom de `max(16px, env(safe-area-inset-bottom))` e fundo com fade do `--lp-bg`.
- Layout: **ação secundária** opcional à esquerda (botão-texto ou ícone 52 px: "Pular", "💡 Dica", "🔁") + **primário** que ocupa o resto.
- O primário fica **desabilitado** (opacidade .45, sem sombra) até haver resposta.
- **Com teclado aberto:** o dock se acopla ao topo do teclado usando `window.visualViewport` (`resize`/`scroll` → `transform: translateY(...)`). Obrigatório na ditação e na escrita das aulas.

### 5.3 Sheet de feedback
- Sobe de dentro do dock (240 ms, ease-out) e ocupa só o necessário (máximo de 45% da altura).
- Três tons:
  - **acerto:** fundo verde-claro, título "Isso!" ou "Perfeito!";
  - **quase:** âmbar, "Quase lá";
  - **erro:** rosado suave, "Não foi essa".
- Conteúdo: título (Manrope 18), uma linha de explicação, **resposta certa** em destaque, ação opcional "🔊 ouvir de novo".
- O botão primário do dock vira **Continuar** no mesmo lugar, para o polegar não se mover.
- Leitor de tela: `role="status"` + `aria-live="polite"`.

### 5.4 Botão de áudio herói
- Círculo de 72 px (etapas de ouvir) ou pílula de 52 px (etapas mistas), com onda animada enquanto toca.
- Toggle **🐢 0,75×** ao lado quando a prática permite (ditação e escrita).

### 5.5 Hub compacto (Aulas, Shadowing, Ditação)
- **Cabeçalho** de no máximo 30% da primeira tela: kicker + título em 1–2 linhas + anel de progresso de 44 px à direita + link "Como funciona" (abre sheet com o texto que hoje está no hero).
- **Primeiro item:** cartão **Continuar** (aula/faixa atual), com CTA no próprio cartão.
- **Lista** compacta (linhas de 72 px) com estado à esquerda (✓ feita / ● atual / número / 🔒) e meta curta. Nada de parágrafo de objetivo na lista: o objetivo vai para a capa.
- A pílula "treino do dia" vira um **chip de uma linha** (`🔥 3 dias`) e nunca quebra.

### 5.6 Tela de resultado
- Três faixas de desempenho, com textos diferentes:
  - **Mandou bem** (≥ meta): anel verde, título comemorativo;
  - **No caminho** (≥ 40% da meta): anel âmbar, "Faltam X pontos para liberar a próxima";
  - **Primeira volta** (< 40%): anel neutro (cinza-verde), "Você ouviu tudo — agora é repetir".
- **Nunca** usar círculo vermelho. XP aparece como "ganhou" e fica separado da meta.
- Bloco **O que levar**: até 3 itens para revisar, com 🔊.
- Dock: **primário** (próximo passo natural) + **secundário** ("Repetir").

### 5.7 Limpeza global
- O botão de tema flutuante sai das páginas de prática e dos hubs (vai para o menu/perfil da home).
- Corrigir o overflow horizontal: nenhuma tela de prática pode ter `scrollWidth > innerWidth` em 360 px.
- Atalhos de teclado (Enter, Ctrl+Espaço, Ctrl+H) só aparecem com `@media (pointer: fine)`.

## 6. Aulas (sistema das 4 pontas)

Arquivos: `frontend/lessons.html`, `frontend/assets/js/lessons-4p.js`, `frontend/assets/css/lessons-4p.css`.
**Não alterar:** `buildSteps`, checkpoints em `localStorage`, `markSkill`, sync com o backend e a escada aprendida → dominada.

| Tela | Novo comportamento |
|---|---|
| **Hub** | Hub compacto (5.5). Cartão "Continuar: Aula 02 · Apresentações". Blocos A1/A2 como seções recolhíveis; o bloco atual vem aberto. Cada linha mostra `8 palavras · 12 min` e o status da escada (`3/13 no vocabulário`) **sem truncar**. |
| **Capa** | Ícone da aula, título, objetivo (máx. 2 linhas), meta `8 palavras · 5 frases · ~12 min` e mini-legenda das 4 pontas. Dock: **Começar aula**. Conteúdo centralizado sem deslocamento. |
| **Teoria** | Texto quebrado em **cartões de até 3 frases** (dividir o parágrafo atual por frase, até ~280 caracteres por cartão). A "pegadinha" vira callout âmbar. Exemplos com ▶ inline visíveis já na primeira tela. Dock: **Entendi**. |
| **Checar · ver** | Kicker 👁 Identificar, pergunta e opções (A/B/C, 56 px). Ao tocar: sheet de feedback. Dock: Continuar. |
| **Checar · ouvir** | Áudio herói de 72 px centralizado com toque automático, "O que você ouviu?" e opções. |
| **Checar · ordenar** | Frase-alvo em pt, área de montagem e banco de palavras. "Limpar" vira ícone ↺ no canto da área de montagem. Dock: **Conferir**. |
| **Checar · contraste** | Mesmo padrão das opções, com as duas formas lado a lado. |
| **Pontes** ("Agora escreve.", "Agora fala.") | **Deixam de ser telas.** Viram um **selo de fase** (toast de 1,6 s no topo: "✍️ Agora você escreve") sobre o primeiro exercício da fase, sem toque extra. |
| **Escrever palavra** | Áudio herói, "Significa: **manhã**", input de 56 px dentro da coluna e 3 pontinhos de tentativas. Dock: 🐢 + **Verificar**, acoplado ao teclado. Feedback no sheet ("Quase! uma letra fora do lugar" / "Era *morning* · MOR-ning — volta em outra rodada"). |
| **Escrever frase** | Igual à palavra; feedback com diff por palavra no sheet. |
| **Ouvir e falar** | **Uma tela, dois tempos.** Tempo 1: áudio herói + "O que essa frase quer dizer?" + opções. Ao responder, o sheet confirma o sentido e a tela **se transforma** em tempo 2: frase grande (Manrope 28) com fonética, e as palavras acendem em verde conforme o reconhecimento as captura. Dock: **🔊** (ouvir de novo, ícone) + **🎙 Falar** (primário, vira "Ouvindo…" com onda enquanto grava) + "Pular" (texto). Depois de falar, o diff por palavra aparece no sheet. |
| **Recap** | Tela de resultado (5.6) adaptada: contadores "no vocabulário / dominadas / itens"; faixa "Primeira volta" quando vocabulário = 0 ("As 8 palavras voltam na próxima rodada"). Ícone SVG de bandeira no lugar do 🏁. Dock: **Próxima aula** + "Revisar". |
| **Retomar** | Sheet na abertura: "Você parou em Escrever (60%)", com **Continuar** e "Recomeçar". |

## 7. Shadowing

Arquivos: `frontend/shadowing.html`, `frontend/assets/js/shadowing.js`, `frontend/assets/css/shadowing.css`, `frontend/assets/js/shadowing-data.js`.

| Tela | Novo comportamento |
|---|---|
| **Hub** | Hub compacto. Cartão Continuar com a próxima faixa. Lista de faixas com nível, nº de frases e melhor nota. |
| **Escolha de modo** | **Removida.** Tocar numa faixa leva direto ao preview. |
| **Preview "Primeiro, ouça"** | Frase a frase em lista com ▶ por frase, com a faixa inteira tocável. No rodapé, a linha **"🏆 Valer nota"** (toggle). Desligado = treino livre (o atual Casual); ligado = conta para a trilha (a atual Ranqueada). Dock: **Começar a falar junto**. |
| **Calibração** | Só roda se "Valer nota" estiver ligado, em um **sheet**, não numa tela. O resultado fica salvo por aparelho por 7 dias. Se falhar: "Sem fone, sua voz se mistura ao áudio. Treine livre agora e ligue a nota quando estiver de fone." com o botão **Treinar livre**. Sem links sublinhados soltos. |
| **Ao vivo (karaokê por frase)** | Mostra **uma frase por vez**, grande (Manrope 26/32): a palavra que o nativo está dizendo acende em **lima**; as que você acompanhou ficam em tinta verde; as próximas ficam em `--lp-muted`, sempre legíveis. A próxima frase aparece em prévia pequena embaixo. Ondas **nativo × você** compactas (28 px cada). Topbar: X + progresso por frase (`2/6`). Dock: **↺ repetir frase** · **⏸ pausar** (central, 64 px) · **⏭ próxima**. Usa o `onboundary` que já existe e o fallback `WORD_MS_FALLBACK`. |
| **Resultado** | Tela de resultado (5.6). Lista por frase com nota e ▶ "ouvir nativo". **Caso especial** se não detectarmos fala ou o reconhecimento estiver indisponível: nada de nota. Mostrar "Não ouvimos sua voz", com um checklist de microfone e o botão **Tentar de novo**. No treino livre, mostrar "Treino livre — não conta para a trilha" como nota de rodapé discreta, não como caixa. |

## 8. Ditação

Arquivos: `frontend/dictation.html`, `frontend/assets/js/dictation.js`, `frontend/assets/css/dictation.css`, `frontend/assets/js/dictation-data.js`.
**Não alterar:** `judgeSentence`, pontuação, combo e regra da dica (a frase com dica sai do combo).

| Tela | Novo comportamento |
|---|---|
| **Hub** | Hub compacto, com hero próprio (não copiado do shadowing). |
| **Intro da faixa** | Título, tema, "8 frases · meta 70 pts" e uma **legenda visual dos blocos** (Sujeito, Verbo, …) com exemplo real. Atalhos só em `pointer: fine`. Dock: **Começar**. |
| **Frase (teclado primeiro)** | Topbar: X · progresso · `⭐ 100 · 🔥2`. Primeira linha: **▶ Ouvir (pílula de 52 px)** + **🐢 0,75×** (toggle), sem vazar da coluna. Abaixo, os **blocos de estrutura** em uma linha (scroll horizontal se precisar) com traços do tamanho de cada palavra, preenchendo ao vivo como hoje. Depois, o **input de 56 px**. Dock acoplado ao teclado: **💡 Dica** (secundário) + **Verificar**. O tempo sai da topbar e vai para o resultado. |
| **Dica** | A palavra revelada aparece **dentro do bloco** (amarelada) e uma linha curta acima do dock: "Dica usada · esta frase sai do combo". |
| **Feedback** | Sheet (5.3) com o veredito e o **diff em uma linha**: palavras certas em verde, faltantes sublinhadas em vermelho suave e digitadas erradas riscadas antes da certa. Abaixo, a tradução. Acerto limpo: sheet verde "Perfeito! Combo 2 🔥" com micro-animação no contador. Dock: **Próxima frase**. Os chips duplicados e a caixa "Sobrou" saem; o "sobrou" entra no diff. |
| **Resultado** | Tela de resultado (5.6). Métricas: pontos/meta, frases perfeitas, maior combo, tempo. Lista de frases com ▶ e diff. Dock: **Próxima faixa** (se liberou) ou **Repetir faixa** + "Voltar à trilha". |

## 9. Critérios de aceite

- [ ] Em 360×740 e 390×844, nenhuma tela de prática tem scroll horizontal (`document.documentElement.scrollWidth === innerWidth`).
- [ ] Em todos os hubs, o primeiro item acionável (Continuar) aparece sem scroll.
- [ ] Em toda tela de exercício, a ação principal fica no dock, a no máximo 100 px da borda inferior (ou do teclado).
- [ ] Com o teclado aberto (iOS Safari e Chrome Android), Dica e Verificar continuam visíveis.
- [ ] Contraste AA (4.5:1) para todo texto de conteúdo, incluindo as palavras futuras no karaokê.
- [ ] Nenhuma nota aparece em vermelho, e o shadowing sem fala detectada não mostra nota.
- [ ] As telas de ponte das aulas não existem mais como passo (`buildSteps` pode mantê-las, mas o render as pula para um toast).
- [ ] Progresso, checkpoints, XP e gates continuam idênticos (testar uma aula, uma faixa de cada prática e conferir o payload enviado ao backend).
- [ ] Os temas claro e escuro funcionam em todos os componentes novos.
- [ ] `prefers-reduced-motion` desliga as animações do sheet, do karaokê e do toast.

## 10. Ordem de entrega

1. **Casco comum** (seção 5) + limpeza global. Já melhora as três práticas.
2. **Ditação** (maior risco real: teclado).
3. **Aulas** (maior volume de uso).
4. **Shadowing** (depende da decisão D1).

Cada etapa sai em um commit próprio, com prints antes/depois em 390 px.

## 11. Decisões em aberto (o produto decide antes de implementar)

- **D1 — Nota no Shadowing:** manter um gate de fone para "Valer nota" ou aceitar nota sem fone com aviso de precisão menor?
- **D2 — Teoria em cartões:** dividir automaticamente por frase (rápido) ou reescrever o conteúdo das 20 aulas em cartões (melhor, mais trabalho)?
- **D3 — HUD da ditação:** o tempo sai da sessão e fica só no resultado. Ok?
- **D4 — Hub de aulas:** lista compacta (proposta) ou trilha de nós estilo mapa (opção B da auditoria)?

## 12. Fora de escopo

Chat de voz, landing, comunidade, painel admin, conteúdo pedagógico novo, mudanças no backend além do que já existe.
