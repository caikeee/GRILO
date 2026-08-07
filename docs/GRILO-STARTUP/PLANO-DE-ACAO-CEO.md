# GRILO — Plano de Ação do CEO

**Data:** 2026-07-22
**Base factual:** `RAIO-X-PRODUTO.md` (mesma pasta) — tudo que cito sobre o produto vem de lá, não é invenção.
**Objetivo deste documento:** parar de analisar e decidir. Isto não é mais "matéria-prima" — é a chamada.

---

## 0. A decisão que estava pendente — está tomada

O Raio-X levantou uma tensão e recusou resolvê-la. Eu resolvo agora, como CEO:

**Voz continua sendo a promessa de aquisição. Lições e Shadowing são a infraestrutura de retenção por trás do login.**

Não é meio-termo covarde — é a leitura que os dados de código já suportam:

- A landing inteira (`index.html`) já vende **voz** como prova ("100% da sessão é a sua voz, não um quiz", o exemplo de correção no hero é de fala). Ninguém precisa reescrever copy.
- Mas o sistema de nível CEFR — o diferencial *real* do produto ("nível por evidência, não por XP") — já exige vocabulário, frases, aulas e shadowing como portões. Um produto "só voz" não consegue certificar A1 sozinho hoje, tecnicamente. Fingir que lições/shadowing não existem seria mentir pro próprio funil.
- O investimento de junho-julho (44 aulas, Shadowing Lab inteiro) não é desperdício a ser revertido — é o **conteúdo que dá substância ao "mapa 360" e ao selo CEFR**, que são a segunda e terceira promessa da landing ("Conteúdo no padrão internacional", "Seus dados viram direção").

**O que isso muda na prática:**
- Landing, hero, primeira sessão do onboarding: **só voz**. Ninguém vê aula ou shadowing antes de terminar a primeira conversa.
- Lições e Shadowing entram **depois**, como o motivo de o aluno voltar no dia 2 — vendidos internamente como "seu mapa está incompleto", não anunciados como produto à parte.
- `BUSINESS-STRATEGY.md` (abril) fica **superado por este documento** nesse ponto específico. Não precisa apagar — é histórico de decisão, mas para de valer como norte.

---

## 1. Por que não vou copiar o playbook das "bigs"

Duolingo, Babbel, Cambly — todos competem com orçamento de mídia paga de 8 dígitos e uma marca que já venceu a categoria. Copiar a *forma* do que eles fazem hoje (app store ads, mascote viral, parcerias com Netflix) é copiar o resultado de anos de capital, não a estratégia que os fez decolar. Além disso, comportamento de "big" é público e visível — se eu fizer igual, ninguém nota o GRILO no meio do ruído.

O que decola rápido, historicamente, quase nunca nasce imitando o líder de categoria. Nasce estudando **outra bolha** que já resolveu o mesmo problema estrutural (crescer sem orçamento, reter sem comunidade construída, converter sem tabela de preço pronta) e trazendo o mecanismo escondido — não a estética — para dentro de um produto diferente. É esse tipo de referência que segue.

---

## 2. Referências escolhidas — fora do mainstream de growth de tech

Cada uma tem: a bolha de origem, o mecanismo específico (não a marca), a fonte comprovável, e por que ela é utilizável aqui.

### 2.1 CrossFit — o modelo de "afiliados" (bolha: fitness, não tech)
CrossFit virou uma das marcas fitness mais rápidas da história **sem dono central de academia nenhuma**: eles licenciam a marca e a metodologia para "boxes" independentes por uma taxa fixa baixa, e cada dono de box vira o vendedor local, o rosto, o evangelista. O crescimento é distribuído, não centralizado — o CrossFit HQ nunca precisou vender para o consumidor final.
**Mecanismo transferível:** distribuição via terceiros que ganham identidade/status ao carregar sua marca, não via mídia paga central.

### 2.2 Grupos de célula (bolha: movimentos religiosos/comunidades de recuperação — AA, igrejas de célula)
Alcoólicos Anônimos e o modelo de "igreja em células" (usado por movimentos evangélicos que multiplicaram de centenas para milhões de membros em poucas décadas, documentado em *"Natural Church Development"*, Christian Schwarz) crescem por **grupos pequenos e fixos com responsabilidade mútua** — 5 a 12 pessoas, encontro recorrente, um padrinho/madrinha. O grupo pequeno gera retenção que nenhum app sozinho gera, porque sair do grupo tem custo social, não só custo de hábito.
**Mecanismo transferível:** retenção via **accountability de par/grupo pequeno fixo**, não via streak sozinho contra uma tela.

### 2.3 Airbnb — "faça coisas que não escalam" (Paul Graham, ensaio homônimo; *The Airbnb Story*, Chesky)
Antes de qualquer automação, os fundadores do Airbnb foram pessoalmente fotografar apartamentos de anfitriões em Nova York porque fotos ruins matavam conversão. Não escalava — e foi exatamente isso que validou o produto antes de construir infraestrutura.
**Mecanismo transferível:** validar manualmente o que a landing promete e o código ainda não tem (comunidade, duplas de estudo) antes de construir a feature de verdade.

### 2.4 Superhuman — motor de PMF (case do First Round Review, "How Superhuman Built an Engine to Find Product/Market Fit")
Superhuman rodou a **pesquisa Sean Ellis** ("como você se sentiria se não pudesse mais usar o produto?") de forma disciplinada, segmentou quem respondeu "muito decepcionado", e **construiu o roadmap só para esse segmento**, ignorando pedidos da maioria. Cresceu com lista de espera artificial e virou case de crescimento sem CAC pago relevante no início.
**Coincidência que é vantagem:** o GRILO **já tem essa métrica implementada** (`/api/admin/pmf/metrics`, elegibilidade Sean Ellis a partir de 3 sessões de voz, meta de 30 elegíveis). Isso não é teoria a adotar — é infraestrutura ociosa a ativar.

### 2.5 Gabriel Weinberg — "Traction" (livro, Bullseye Framework)
Metodologia (não anedota) para testar sistematicamente 19 canais de aquisição possíveis com pouco dinheiro em cada um, antes de apostar tudo em um. O ponto central do livro: fundadores subestimam canais fora do óbvio (ex.: comunidades de nicho, parcerias não-óbvias, PR de nicho) porque só olham para o que o concorrente grande está fazendo.
**Mecanismo transferível:** testar 3-5 canais pequenos e baratos em paralelo por 2 semanas cada, medir, matar o que não performa — não escolher um canal "porque é o que todo mundo faz".

### 2.6 Alex Hormozi — "$100M Offers" (livro)
Empresas que ele documenta cresceram rápido não por marketing melhor, mas por **oferta boa demais para recusar** — reformulando preço/risco/garantia até a decisão de compra ficar óbvia, sem precisar convencer ninguém com discurso. O mecanismo central: aumentar valor percebido e reduzir risco percebido simultaneamente, quase sempre incluindo garantia agressiva.
**Mecanismo transferível:** a fase beta gratuita do GRILO já remove risco (R$0, sem cartão) — falta empacotar isso como **oferta com prazo/escassez real**, não "beta genérica para sempre".

### 2.7 Gymshark — sementeira por micro-criadores (bolha: fitness/e-commerce, não SaaS)
Gymshark não pagou por celebridade nem por mídia tradicional nos primeiros anos — mandou produto de graça para **microinfluenciadores de fitness ainda pequenos** (não macro, não celebridade), que cresceram junto com a marca e sentiram a marca como própria conquista, não como patrocínio.
**Mecanismo transferível:** dar acesso/reconhecimento especial a usuários de nicho (professores de inglês independentes, criadores de conteúdo de aprendizado de idiomas com audiência pequena) antes que eles sejam "grandes", em troca de embaixada orgânica.

### 2.8 Strava/Peloton — prova social de pares, não de marca (bolha: fitness digital)
O mecanismo que reteve usuários nesses produtos não foi o conteúdo (treino/rota) — foi **ver o esforço de gente parecida com você** (segmentos, kudos, leaderboard de grupo pequeno). A landing do GRILO já desenhou isso ("praticando agora · 12 online", "Dupla de past simple") como mockup — é o único pilar da landing que ainda não tem back-end nenhum.
**Mecanismo transferível:** direto — é literalmente o que a landing já promete e o código ainda não entrega (seção 10 do Raio-X: "comunidade é copy, não feature").

### 2.9 AJATT / comunidades obsessivas de nicho em aprendizado de idiomas (bolha: subcultura de aprendizado de japonês/imersão)
"All Japanese All The Time" e comunidades irmãs (r/LearnJapanese, Refold) cresceram sem budget de marketing nenhum — só um **método com identidade forte e uma comunidade que se autodefine pelo método**, não pelo produto. Quem segue o método vira evangelista do método, e o produto/ferramenta vem depois.
**Mecanismo transferível:** o GRILO já tem isso em embrião — "Ponte" (code-switching) e "assume e flui" são filosofias com nome e identidade, não features genéricas. Isso pode virar bandeira de comunidade ("gente que aprende no método Ponte"), não só copy de produto.

---

## 3. Como camuflar cada estratégia no case do GRILO (adaptação concreta, sem "fazer igual")

| Referência | O que o GRILO faz igual, mas com outra cara |
|---|---|
| **CrossFit (afiliados)** | Não abrir franquia — mas identificar professores de inglês/criadores de conteúdo independentes no Brasil e dar a eles um **selo "GRILO Partner"** informal (acesso antecipado a features, menção no produto) em troca de recomendarem o app pros próprios alunos. Zero custo de mídia, distribuição via autoridade de terceiro. |
| **Grupos de célula (AA)** | Antes de construir "salas" de verdade (que não existem no banco hoje), montar manualmente 5-10 grupos fixos de WhatsApp/Discord de 6-8 alunos por nível CEFR, curados à mão, e só depois decidir se vira feature no produto — validando a demanda de "comunidade" antes de gastar engenharia nela. |
| **Airbnb (não escala)** | O mesmo grupo acima: o CEO (você) entra manualmente nos primeiros grupos, modera, entende o que gera retenção antes de automatizar qualquer coisa de "sala de conversação". |
| **Superhuman (motor de PMF)** | Ativar o que já existe: rodar a pesquisa Sean Ellis assim que baterem os 30 elegíveis (`≥3 sessões de voz`), isolar os "muito decepcionados" e perguntar a eles, especificamente, o que fariam se o GRILO sumisse amanhã — usar a resposta como filtro de prioridade de roadmap, não pedidos da média dos usuários. |
| **Traction (Bullseye)** | Rodar em paralelo, por 2 semanas cada, com orçamento quase zero: (1) grupos de Discord/Telegram de aprendizado de inglês já existentes, (2) parceria com 3-5 professores/criadores pequenos (ligado ao Gymshark abaixo), (3) posts de nicho em comunidades de linguística/expat/intercâmbio. Matar o que não gerar cadastro em 2 semanas. |
| **$100M Offers** | Reformular "Beta grátis" para **"Founders — R$0 até [data ou nº de vagas], depois vira Founders R$49/mês vitalício"** (o plano "Founders" já existe no admin, só não é comunicado). Escassez real + trava de preço = motivo concreto de agir agora, não "beta eterna". |
| **Gymshark (microinfluenciadores)** | Mesmo grupo do CrossFit — mas o gancho de oferta é: acesso antecipado ao Shadowing Lab/aulas novas + citar o criador no produto ("trilha recomendada por X"), não pagamento em dinheiro (que a empresa não tem hoje). |
| **Strava/Peloton (prova social de pares)** | É o Pilar 1 da landing ("Comunidade") que hoje é só mockup. Antes de construir o back-end de salas, simular manualmente com os grupos de WhatsApp/Discord acima — se funcionar, aí sim justifica construir `sala`/`pareamento` como modelo de dado real. |
| **AJATT (identidade de método)** | "Ponte" e "assume e flui" já são filosofias nomeadas no produto. Transformar isso em conteúdo de aquisição orgânica: posts/vídeos curtos explicando *o método*, não o app — quem concorda com o método vira usuário por afinidade ideológica, não por anúncio. |

---

## 4. Ações da companhia — próximos 30/60/90 dias

**Prioridade: validar canais e comunidade sem gastar em engenharia nova até algo comprovar tração.**

### Primeiros 30 dias
1. ~~Resolver a tensão de posicionamento na prática~~ **Feito em 2026-07-22:** landing/onboarding seguem só-voz (já estavam). Revisão adicional encontrou um overclaim real na landing e corrigiu: o Pilar 1 "Comunidade" (`frontend/index.html`) prometia estado "ao vivo" fictício ("12 online", "sala às 19h", "2 vagas") sem nenhum back-end por trás — contradizia a própria seção "Prova social · 3 números honestos" da página. **Removido da landing** até os grupos-piloto do item 2 abaixo rodarem e gerarem número real; página ficou com 2 pilares (Conteúdo, Mapa 360). Também corrigida a frase do Pilar "Mapa 360" que prometia revisão de "profissionais" humanos — hoje é só recap por IA.
2. **Montar 3-5 grupos-piloto de accountability** (WhatsApp ou Discord, 6-8 pessoas por nível), curadoria manual do CEO. Meta: medir retenção desses alunos vs. média geral depois de 3 semanas.
3. **Recrutar 5-10 "GRILO Partners"** (professores/criadores pequenos de inglês) — oferta: acesso antecipado + menção, não dinheiro. Pedir para cada um trazer os próprios alunos/seguidores para o beta.
4. **Rodar o Bullseye de canais**: 3 canais de baixo custo em paralelo (comunidades de nicho existentes, os partners acima, posts de método "Ponte"/"assume e flui" como conteúdo), 2 semanas, medir cadastro por canal.

### 30-60 dias
5. **Ativar a régua Sean Ellis já existente no código**: assim que baterem 30 elegíveis, rodar a pesquisa e usar a resposta para decidir o que constrói a seguir — não decidir roadmap por intuição.
6. **Decidir, com dado real dos grupos-piloto**, se "comunidade" (Pilar 1 da landing) vira modelo de dado de verdade no produto ou continua sendo curadoria manual por mais um tempo.
7. **Lançar a oferta "Founders" com prazo/vaga real** (não beta eterna) — usa o plano que já existe no admin, só precisa virar comunicado público com prazo.

### 60-90 dias
8. **Reavaliar os 3-5 canais testados**: matar os que não performaram, dobrar aposta no que performou — sem adicionar canal novo antes de matar o que não funciona.
9. **Se os grupos-piloto retiveram melhor**, desenhar o modelo de dado mínimo de "sala"/"dupla" real (hoje não existe nenhum dos 20 modelos do banco para isso) — só depois da validação manual, nunca antes.
10. **Revisitar o ICP de abril (`BUSINESS-STRATEGY.md`)** contra os dados reais de onboarding (motivo de aprender / interesse do dia a dia) que já são coletados — confirmar ou descartar a hipótese "18-40, trava na fala" com dado, não com suposição de 3 meses atrás.

---

## 5. O que eu, como CEO, não vou fazer agora

- **Não vou construir back-end de comunidade** (salas, pareamento, feed) antes de validar manualmente com grupos piloto — CrossFit e Airbnb ensinam a mesma coisa: prove a demanda com esforço manual antes de automatizar.
- **Não vou fazer mídia paga.** Nenhuma das referências acima cresceu rápido gastando em anúncio central — todas usaram distribuição via terceiros ou comunidade. Mídia paga entra depois de um canal orgânico provar CAC baixo, não antes.
- **Não vou finalizar tabela de preço pública** antes da pesquisa Sean Ellis rodar — preço definido sem saber quem está "muito decepcionado" sem o produto é chute.
- **Não vou reverter o investimento em Lições/Shadowing.** A decisão da seção 0 preserva esse trabalho como retenção, não como erro a corrigir.

---

## 6. Métricas que decidem o próximo movimento

Todas já existem no código (`/api/admin/pmf/metrics`, `/api/analytics/dashboard`) — não precisa instrumentar nada novo para começar:

- **Elegibilidade Sean Ellis** (meta: 30 elegíveis) → dispara a pesquisa PMF.
- **Retenção D7/D30** dos grupos-piloto de accountability vs. média geral → decide se "comunidade" vira feature real.
- **Cadastro por canal** no teste Bullseye → decide em qual canal dobrar aposta nos 60-90 dias.
- **Conversão de paywall** pós-oferta Founders com prazo → valida se a reformulação de oferta ($100M Offers) funcionou.

---

*Este documento é uma decisão, não uma lista de opções. Se algo aqui não fizer sentido depois de rodar, o CEO revisita — mas a próxima ação é executar, não continuar analisando.*
