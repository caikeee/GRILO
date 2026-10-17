# GRILO — Playbook Estratégico

**Data:** 2026-10-07
**Base factual do produto:** [RAIO-X-PRODUTO.md](RAIO-X-PRODUTO.md) (atualizado na mesma data).
**Material pronto para usar** (pitches, mensagens, roteiros, scripts de entrevista): [KIT-DE-VENDAS.md](KIT-DE-VENDAS.md).
**Substitui como norte:** `BUSINESS-STRATEGY.md` (abril, voice-first) e as seções 3–4 do `PLANO-DE-ACAO-CEO.md` (julho). As referências de growth do plano de julho continuam valendo e são reaproveitadas aqui.

> Como ler: cada seção termina com uma **decisão** ou **ação**. Onde é dado de mercado, tem fonte no fim. Onde é estimativa minha, está escrito "estimativa". Termos de negócio são explicados na primeira vez que aparecem.

---

## Sumário em 10 linhas

1. **O mercado é enorme e mal resolvido:** idiomas movimentam R$ 25–35 bi/ano no Brasil, só ~5% da população se comunica em inglês e o país é 75º de 123 no EF EPI 2025.
2. **A dor não é falta de conteúdo, é trava.** 33% dos brasileiros têm medo de falar inglês em público mesmo sabendo o conteúdo. Conteúdo é commodity; coragem não é.
3. **A concorrência é forte e bem financiada** (Speak vale US$ 1 bi, BeConfident captou R$ 85 mi, Duolingo tem videochamada com IA e o Brasil é o 2º maior mercado dela). Brigar por "conversa com IA" de frente é perder.
4. **O GRILO tem uma arma que ninguém tem: a Ponte.** É o único produto que *deixa* o aluno falar português no meio da frase e transforma isso em aula. Todo o resto do mercado trata a mistura como erro.
5. **E tem um nome que é um presente de marketing:** "grilo" é gíria para preocupação ("tá com grilo?", "sem grilo"). O produto existe pra tirar o grilo do inglês. **Plataforma de marca: "Inglês sem grilo."**
6. **Cliente de entrada (beachhead):** o *falso iniciante que trava* — adulto de 22 a 40 anos que já estudou, entende alguma coisa e congela na hora de falar. É exatamente o nível que o conteúdo do GRILO cobre hoje (A0–A2).
7. **Canal mais forte e menos óbvio:** aliar-se aos professores particulares em vez de competir com eles. Todos os concorrentes vendem "substitua seu professor"; o GRILO vende "seu professor + o treino entre as aulas".
8. **Preço:** Pro a R$ 34,90/mês ou R$ 239/ano, com oferta Founders de R$ 149/ano travado para as primeiras 300 pessoas. Abaixo de Speak e Duolingo Max, acima de nada.
9. **Antes de qualquer marketing, consertar 4 vazamentos de receita:** sem checkout, login que some ao fechar a aba, senha esquecida resolvida por DM no Instagram, e uma promessa da landing que o backend não cumpre.
10. **Meta de 90 dias:** 100 assinantes pagantes e pesquisa de PMF rodada. Meta de 12 meses: 1.000 pagantes (~R$ 25–30 mil de receita recorrente/mês), o ponto em que o GRILO paga um fundador.

---

## Parte 1 — Situação atual (o que mudou desde julho)

Detalhes completos no Raio-X. O que importa para estratégia:

| Frente | Estado em out/2026 | Papel no negócio |
|---|---|---|
| **Sessão de voz** | Livre + 5 cenários guiados, Ponte, correção sem interromper, recap com nota 0–100. Modelo trocado para gpt-oss (Groq) + captura com Silero VAD | **Aquisição**: é o "uau" da primeira sessão e a demo da landing |
| **Aulas 4 pontas** | 44 aulas (A1 20, A2 24), retomada exata do ponto onde parou | **Retenção**: o mapa de progresso |
| **Shadowing** | 10 faixas, modo ranqueado com calibração de fone | **Retenção + prova**: score que dá pra compartilhar |
| **Ditação** (nova, 03/10) | 4 faixas A1–A2, correção palavra a palavra, combo | **Retenção**: treino rápido, bom pra celular |
| **Comunidade** (nova, 20/09) | Fórum de pauta: sugerir, votar, corrigir conteúdo, status visível | **Marca**: "o GRILO é construído com quem usa". *Não* é pareamento entre alunos |
| **Níveis CEFR** | A0→A1 por evidência; landing mostra a escada e os portões | **Diferencial e produto pagável**: prova de nível |
| **Home** | "Treino de hoje" (aula → ditação → shadowing) em construção | Hábito diário |
| **Landing** | Vitrine com tour das 5 frentes, Ponte em destaque, escada de níveis | Pronta para tráfego |
| **Monetização** | Zero. Beta grátis, sem checkout, sem paywall exibido | **O maior buraco** |

### A tensão de julho foi resolvida pelos fatos

O plano de julho decidiu "landing só-voz". Em outubro a landing passou a mostrar as 5 frentes. Isso está certo e este playbook formaliza: **a voz é a porta, o treino completo é a casa.** A mensagem de aquisição continua sendo fala ("Fale inglês. A gente cuida do resto."), mas o produto vendido é um *treino diário de fala* com várias estações — não um chatbot.

### Quatro vazamentos de receita para consertar antes de investir em aquisição

Você é técnico, então estes são os itens de maior retorno por hora de trabalho no plano inteiro:

1. **Não existe como pagar.** Sem checkout, toda conversa de venda morre no "e como eu assino?". Integrar um gateway com **Pix e cartão recorrente** (Mercado Pago, Asaas ou Stripe — todos aceitam Pix no Brasil; o Pix Automático do Banco Central também já existe para cobrança recorrente). Ligar o evento `paywall_viewed` que o painel de PMF já espera.
2. **O login some ao fechar a aba** (commit `34f741a` trocou o token para `sessionStorage`). Para um produto de hábito diário, obrigar login toda vez é atrito todo dia, e cada atrito custa retenção. O problema original (home "quebrada" com token vencido) se resolve validando o token no carregamento e usando o refresh token que o backend já tem, não apagando a sessão.
3. **"Esqueci minha senha" manda o aluno para o Instagram.** Funciona com 20 usuários, quebra com 2.000 e passa sensação de amadorismo justamente no momento de confiança. Reset por e-mail com link de uso único.
4. **A landing promete o que o backend não cumpre.** Ela diz "pra conquistar o A1, os quatro portões precisam fechar juntos" e lista Shadowing ranqueado. O backend (`lessons_controller.py`) certifica o A1 com 3 portões (vocabulário, frases, aulas) — shadowing não entra na conta. Ou soma no backend, ou ajusta a landing. "Nível honesto" é a sua promessa; ela não pode ter asterisco.

**Bônus de alto impacto:** tornar o site instalável como app (PWA: manifest + service worker). Os concorrentes estão na loja de apps; o GRILO não. Um ícone na tela inicial do celular é a diferença entre lembrar e esquecer.

---

## Parte 2 — Análise de mercado

### 2.1 Tamanho (do maior para o que dá pra pegar)

| Camada | Número | Como chegamos |
|---|---|---|
| **TAM** — mercado total de idiomas no Brasil | R$ 25–35 bi/ano | Fonte: setor de idiomas/cursos livres (escolas, franquias, online, particulares) |
| **SAM** — inglês digital autodidata para adultos brasileiros | Estimativa: R$ 1–3 bi/ano | Estimativa de ordem de grandeza: só a BeConfident (~200 mil pagantes × ~R$ 400/ano ≈ R$ 80 mi) e a Fluency (meta de ~R$ 200 mi de receita recorrente) já somam perto de R$ 300 mi; somando Duolingo, Speak, ELSA, Open English e afins no Brasil, R$ 1–3 bi é uma faixa razoável |
| **SOM** — o que o GRILO pode capturar em 3 anos | Estimativa: R$ 3 mi/ano | 10 mil assinantes × ~R$ 25/mês. É 0,1–0,3% do SAM — conservador de propósito |

**Tradução:** o GRILO não precisa ganhar o mercado. Precisa de 1.000 pessoas pagando para se sustentar e de 10.000 para virar empresa. O mercado comporta isso com folga; o desafio é ser *escolhido*, não haver demanda.

### 2.2 Demanda: quem precisa e por quê

- **Só ~5% dos brasileiros se comunicam em inglês; ~1% com fluência** (British Council). O Brasil é 75º de 123 países no EF EPI 2025, com proficiência "baixa" — mas subiu 6 posições.
- **Mais de 7 milhões de pessoas** estão matriculadas em algum curso de idiomas no país.
- **Buscas por cursos de idiomas cresceram 50% em dois anos** (Preply, 2024).
- **Gatilho de carreira:** contratação de brasileiros por empresas estrangeiras cresceu 53% em 2024 (Deel); quem trabalha para fora pode ganhar até 160% mais (TechFX). O inglês virou literalmente dinheiro.
- **A dor real é emocional:** 33% dos brasileiros têm medo de falar inglês em público mesmo dominando o conteúdo (Cambridge English). O vilão é o medo de errar e a vergonha do sotaque.

**Insight central:** o mercado está saturado de *conteúdo* e carente de *permissão para errar*. Quem resolve o medo ganha o aluno que todos os outros perdem na primeira semana.

### 2.3 Concorrência

| Concorrente | Preço no Brasil | O que vende | Fala português no meio? | Ameaça para o GRILO |
|---|---|---|---|---|
| **Duolingo (Max)** | R$ 33,33/mês ou R$ 399,90/ano | Jogo, hábito, mascote. Max inclui videochamada com IA (Lily) | Não | **Alta** em atenção, baixa em fala real. Brasil é o 2º maior mercado da Lily |
| **Speak** | R$ 59,90/mês ou ~R$ 29,90/mês no anual | Tutor de IA polido, cursos guiados. US$ 1 bi de valuation, apoio da OpenAI | Não | Alta para quem já fala um pouco e paga caro |
| **BeConfident** (brasileira) | ~R$ 398/ano | Inglês com IA pelo WhatsApp. 4 mi de usuários, ~200 mil pagantes, R$ 85 mi captados em 2026 | Parcial (é brasileira) | **A mais direta.** Mesmo público, mesma faixa de preço, muito mais dinheiro |
| **ELSA Speak** | R$ 37/mês ou R$ 289/ano | Pronúncia fonema a fonema; 90 mi de downloads | Não | Média — nicho de sotaque |
| **Fluency Academy** | Assinatura (curso) | Personalidade do Rhavi, método "Fluency Hacking", 400 mil alunos | — | Média — vende curso e marca pessoal, não treino |
| **Open English** | Curso com professor | Aulas ao vivo + tutora de IA (FluentIA, fev/2026) | — | Baixa — público e preço diferentes |
| **Cambly / professores particulares** | US$ ~20/mês (60 min) / R$ 20–150 por hora | Gente de verdade | Às vezes | **Não é concorrente: é canal** (ver Parte 4) |

**Leitura:** todo mundo está correndo para "conversar com IA". Em 12 meses, conversar com IA vai ser item de série, como corretor ortográfico. O que **não** vira commodity:
1. **Entender o brasileiro especificamente** — a mistura PT/EN, os erros típicos ("I have went", "tink"), a vergonha cultural. A Ponte é isso.
2. **Prova de progresso confiável** — nível por evidência, não streak.
3. **Relação e comunidade** — ninguém cancela o lugar onde é conhecido.

### 2.4 SWOT

| | Positivo | Negativo |
|---|---|---|
| **Interno** | **Forças:** Ponte (única no mercado) · correção sem interromper · nível por evidência alinhado ao CEFR · 5 frentes de treino já prontas · custo de IA baixo (Groq + cache compartilhado) · fundador técnico que entrega rápido · produto instrumentado para medir PMF | **Fraquezas:** zero receita e zero checkout · fundador solo e sem experiência de vendas · só web (sem loja de apps) · conteúdo vai só até A2 · sem prova social real ainda · base de usuários pequena |
| **Externo** | **Oportunidades:** demanda crescente por inglês de carreira · medo de falar não resolvido por ninguém · professores particulares precisam de ferramenta de retenção · cansaço com apps gamificados · dados da Ponte viram conteúdo e PR únicos | **Ameaças:** BeConfident com R$ 85 mi para gastar · Duolingo/Speak adicionando qualquer feature em semanas · dependência de Groq e ElevenLabs (preço/termos) · custo de voz por minuto se o uso explodir |

---

## Parte 3 — Posicionamento e marca

### 3.1 A ideia: "Inglês sem grilo."

O nome GRILO carrega dois significados que todo brasileiro conhece e que o produto ainda não usa:

1. **"Grilo" = preocupação, encucação.** "Tá com grilo?", "fiquei grilado", "sem grilo" (= sem problema). É exatamente o sentimento de quem trava no inglês.
2. **O Grilo Falante** (do Pinóquio, de Collodi — 1883, domínio público) = a voz amiga no ouvido que te guia. É exatamente o papel da IA na sessão de voz. *(Cuidado: usar o conceito e a referência literária, nunca o desenho da Disney.)*

Juntando: **o GRILO tira o grilo do seu inglês — e fica no seu ouvido enquanto você fala.**

Isso também resolve uma tensão no guia de marca atual (`docs/BRAND-VOICE.md`): ele posiciona o GRILO como "cheat code do seu inglês". "Cheat code" sugere atalho sem esforço, e isso contradiz a promessa mais forte da landing ("Nível aqui é conquista, não pontinho. Ninguém sobe de nível por ter aberto o app."). "Sem grilo" mantém o tom leve sem prometer facilidade: o esforço continua, o medo sai.

**Decisão pendente sua:** trocar "cheat code" por "sem grilo" como plataforma de marca. Recomendo trocar. O tom de voz (amigo bilíngue, direto, sem infantilizar) continua igual.

### 3.2 Declaração de posicionamento

> **Para** adultos brasileiros que entendem um pouco de inglês mas travam na hora de falar,
> **o GRILO é** o treino diário de fala que deixa você misturar português quando travar — e devolve a palavra certa em inglês na hora, sem parar a conversa.
> **Diferente** do Duolingo (que é um jogo de pontos) e dos tutores de IA gringos (que esperam que você já fale), **o GRILO foi feito para o primeiro "travei"** — e mede seu nível por evidência, não por ofensiva.

### 3.3 Os três pilares da mensagem (em ordem de força)

| Pilar | Mensagem | Prova no produto | Frase de campanha |
|---|---|---|---|
| **1. Pode misturar** (emoção) | Travar é normal. Aqui o português é ponte, não erro. | A Ponte | *"Travou? Mistura. A gente devolve em inglês."* |
| **2. Ninguém te interrompe** (alívio) | A IA corrige falando certo junto com você, sem apontar o dedo. | Correção implícita, "assume e flui" | *"Corrige sem te cortar."* |
| **3. Nível de verdade** (razão) | Você sobe quando prova, e o mapa é o mesmo que escolas e empresas usam. | Escada CEFR com portões | *"Nível aqui é conquista, não pontinho."* (já está na landing) |

### 3.4 Território verbal e criativo

- **"Portinglês"** como palavra-bandeira. Portunhol é piada nacional; o "portinglês" (*I prefer the frango*) é o jeito real como o brasileiro começa. O GRILO é o único que trata isso como ponto de partida. Bom para hashtag, para série de conteúdo e para PR.
- **O grilo no ouvido** como imagem visual: fones, ondas sonoras, a orbe da sessão de voz — não um mascote fofo (isso é território do Duolingo e contradiz o guia de marca).
- **Linguagem de treino**, que o produto já usa: "Treino de hoje", "ranqueada", "combo". O aluno é tratado como quem treina, não como criança que ganha estrelinha.

### 3.5 O que nunca dizer

- "Fluente em X dias", "sem esforço", "fácil" — promessa falsa e contra o guia de marca.
- "Comunidade de gente pra praticar com você" — a comunidade hoje é fórum de pauta, não pareamento.
- "Certificado oficial" — o nível do GRILO é **alinhado** ao CEFR, não emitido por Cambridge ou EF. Dizer "certificado de nível GRILO, alinhado ao CEFR".
- Números de usuários ou votos que vêm do banco de demonstração (`scripts/seed_community.py` cria usuários fictícios). Usar em vídeo de produto é ok; apresentar como gente real não é.

---

## Parte 4 — Cliente ideal (ICP)

**ICP** = o perfil de cliente que mais rápido percebe valor, paga e indica. Não é "quem pode usar", é "por quem começar".

### 4.1 Beachhead: o falso iniciante que trava

- 22 a 40 anos, ensino superior ou cursando, renda de classe média.
- Já estudou inglês (escola, curso abandonado, Duolingo por uns meses). Entende devagar, lê alguma coisa, **congela para falar**.
- Nível real: A1–A2. É exatamente onde está o conteúdo do GRILO hoje (44 aulas A1–A2, shadowing e ditação A1–A2) e onde a Ponte mais ajuda (quanto menor o nível, mais a pessoa mistura).
- Paga R$ 30–40/mês por coisas que acredita (streaming, academia, apps), mas já gastou com curso que não terminou — então desconfia de promessa.

### 4.2 Dois gatilhos de compra para segmentar mensagem (mesmo produto)

| Persona | Gatilho | Prazo | O que vender | Onde encontrar |
|---|---|---|---|---|
| **"Carreira travada"** | Vaga pede inglês, reunião com cliente de fora, quer trabalhar remoto em dólar | Difuso, mas dor alta | Cenário Entrevista, nível comprovado para o currículo/LinkedIn | LinkedIn, comunidades de tech e carreira, TabNews, grupos de vagas remotas |
| **"Viagem marcada"** | Viagem em 1–6 meses | **Data fixa** (ótimo para oferta com prazo) | Cenários Aeroporto, Restaurante, Viagem, Médico + "Pacote viagem" | Grupos de viagem/intercâmbio, agências, Instagram de viagem |

O onboarding já pergunta o motivo (Viagem / Trabalho / Entretenimento / Estudos). **Ação:** antes de escolher entre as duas personas, puxar a distribuição real dessas respostas e cruzar com retenção D7 de cada grupo. A persona que mais volta é a de entrada.

### 4.3 Segmento de expansão (não agora): times de empresas

Empresas pagam inglês para o time como benefício (Voxy, Slang atuam aqui). Ticket maior, ciclo de venda mais longo. Entra quando o produto tiver conteúdo B1 e prova de evolução com alunos reais — ver Parte 7.

---

## Parte 5 — Modelo de negócio e preço

### 5.1 Lógica: o que é caro fica no pago, o que vicia fica no grátis

| | **Grátis (sempre)** | **GRILO Pro** |
|---|---|---|
| Aulas 4 pontas | Todas | Todas |
| Ditação e Shadowing casual | Sim | Sim |
| Shadowing ranqueado | 3 por semana | Ilimitado |
| Sessão de voz com Ponte | 10 min por dia | Ilimitada (com uso justo) |
| Recap da sessão | Nota + 1 ponto para revisar | Completo (radar, melhor frase, todas as correções, histórico) |
| Nível e escada CEFR | Ver o progresso | **Certificado de nível compartilhável** (LinkedIn/Instagram) |
| Comunidade | Sim | Sim + selo de apoiador |

Por quê: a **voz** é o que custa (ElevenLabs por caractere + modelo de linguagem), então é ela que tem limite. As **aulas** custam quase nada por aluno e são o que cria hábito, então ficam livres. O **certificado** é o resultado que as pessoas querem mostrar — prova é o que se paga.

### 5.2 Preços

| Plano | Preço | Âncora |
|---|---|---|
| **Pro mensal** | R$ 34,90 | Quase igual ao Duolingo Max, bem abaixo do Speak (R$ 59,90) |
| **Pro anual** | R$ 239 (≈ R$ 19,90/mês) | Mais barato que ELSA (R$ 289) e BeConfident (~R$ 398) |
| **Founders** | **R$ 149/ano, preço travado enquanto renovar**, só para as primeiras **300 pessoas** | Oferta de lançamento com escassez real |
| *Teste opcional:* Pacote viagem | R$ 69 por 60 dias, pagamento único | Para a persona com data marcada |

**Âncora de comunicação:** *"Menos que uma aula particular por mês."* (aula particular online custa de R$ 20 a R$ 150 por hora).

**Sobre o "Founders R$ 49" do plano de julho:** R$ 49/mês fica acima de todos os concorrentes para um produto que ainda vai só até o A2. R$ 149/ano travado gera caixa adiantado, compromisso de 12 meses e as primeiras 300 histórias reais — que é o que você mais precisa agora.

**Regra do plano de julho que continua valendo:** rodar a pesquisa Sean Ellis (Parte 6) antes de fixar a tabela pública. Os números acima são o ponto de partida do teste, não a resposta final.

### 5.3 Contas que você precisa ter na cabeça

- **Custo por aluno ativo** = (custo de IA + voz + infraestrutura do mês) ÷ alunos ativos. **Ação:** puxar dos logs o custo por minuto de voz (tokens do Groq + chamadas condicionais do Whisper + caracteres do ElevenLabs). Regra: custo variável por pagante abaixo de 20% do preço. Se o ElevenLabs passar disso, o plano grátis usa a voz do navegador (o fallback já existe) e só o Pro usa ElevenLabs.
- **LTV** (quanto um assinante deixa ao longo da vida) = receita média por mês × margem ÷ churn mensal (percentual que cancela por mês).
  Exemplo: R$ 25 × 80% ÷ 8% = **R$ 250**.
- **CAC máximo** (quanto pode custar trazer um pagante) ≈ LTV ÷ 3 = **~R$ 80**. Mídia paga só entra quando um canal provar CAC abaixo disso, com retorno em menos de 4 meses.

### 5.4 Metas em números (funil reverso)

| Marco | Pagantes | Receita recorrente/mês | Cadastros necessários a 3% de conversão | a 5% |
|---|---|---|---|---|
| Validação | 100 | ~R$ 2,5 mil | 3.300 | 2.000 |
| Fundador pago | 1.000 | ~R$ 25 mil | 33.000 | 20.000 |
| Empresa com time | 10.000 | ~R$ 250 mil | 330.000 | 200.000 |

A meta de conversão de 3% já está cravada no painel de PMF. Para chegar a 100 pagantes, os primeiros vêm de forma manual (Founders + professores parceiros + sua rede), não de volume.

---

## Parte 6 — Validação com usuários

Tudo que segue usa o que já existe no código. Roteiros completos no [KIT-DE-VENDAS.md](KIT-DE-VENDAS.md#7-roteiros-de-validação).

1. **10 entrevistas em 2 semanas** com usuários atuais (prioridade: quem voltou 3+ vezes e quem sumiu depois do dia 1). Método *The Mom Test*: perguntar sobre o passado e comportamento real, nunca "você pagaria?".
2. **Pesquisa Sean Ellis** ("como você se sentiria se não pudesse mais usar o GRILO?") assim que o painel marcar 30 elegíveis (≥3 sessões de voz). Se ≥40% responder "muito decepcionado", há PMF. Abaixo disso, entrevistar quem respondeu "muito" e construir só para eles.
3. **Teste de paywall real:** quando o checkout existir, mostrar a oferta Founders no fim do 3º recap de voz (momento de maior valor percebido). O evento `paywall_viewed` já tem endpoint; a conversão aparece no painel PMF.
4. **Teste de preço barato:** 4 perguntas de Van Westendorp ("a partir de que preço seria caro demais?" etc.) no fim das entrevistas e na pesquisa Sean Ellis.
5. **Coorte por persona:** retenção D7/D30 de quem respondeu "Viagem" vs. "Trabalho" no onboarding. Decide a persona de entrada com dado, não com intuição.

---

## Parte 7 — Go-to-market: canais

Princípio do plano de julho mantido: **testar poucos canais baratos em paralelo, medir, matar o que não funciona** (método Bullseye, do livro *Traction*). Abaixo, em ordem de prioridade.

### Canal 1 — Programa Professor Parceiro (o canal que ninguém está usando)

**A ideia:** Speak, BeConfident, Duolingo e Fluency vendem "você não precisa de professor". O GRILO é o único que pode dizer "seu professor + o treino entre as aulas", e isso já está escrito na marca ("Não substitui seu curso. Acelera ele.").

O professor particular tem um problema que o GRILO resolve: o aluno não pratica entre uma aula e outra e desiste em 3 meses. Um professor com 15 alunos que adota o GRILO como "dever de casa" traz 15 usuários de alta intenção com uma conversa só.

- **Oferta ao professor:** Pro grátis para ele, cupom de 20% para os alunos, **30% de comissão recorrente** sobre o que os alunos pagarem. Selo "Professor Parceiro GRILO".
- **Mais tarde (se funcionar):** painel do professor para ver o progresso dos alunos (os dados já existem — palavras dominadas, nível, pontos para revisar). Isso transforma o GRILO em ferramenta de trabalho do professor, que é muito mais difícil de cancelar.
- **Meta:** 10 professores em 30 dias, 30 em 90.
- **Onde achar:** Superprof, GetNinjas, Instagram/TikTok de professores pequenos (1–20 mil seguidores), grupos de professores no Facebook e WhatsApp.

### Canal 2 — Motor de conteúdo "Portinglês" (Instagram Reels / TikTok / Shorts)

A Ponte se demonstra em 3 segundos: alguém fala *"I want a sobremesa"*, a palavra vira *"dessert"* na tela com o áudio. Ninguém mais consegue fazer esse vídeo porque ninguém mais tem a mecânica. Você já tem vídeos de Ditação e Comunidade prontos para o @griloai.

- **4 séries fixas:** (1) *Como se diz* — a Ponte ao vivo; (2) *Travas brasileiras* — os erros típicos (th, "I have went", -ed) sem humilhar; (3) *Prova de treino* — score de shadowing subindo, escada de nível; (4) *Bastidores* — o fundador técnico construindo.
- **Ritmo:** 3 vídeos por semana, 12 roteiros prontos no kit.
- **Medida:** cadastros com `?cadastro` + UTM por vídeo.

### Canal 3 — Fundador técnico construindo em público (LinkedIn, TabNews, comunidades dev)

Você é o diferencial nesse canal. Posts como "construí sozinho um app de inglês com IA, e cada sessão de voz custa X centavos — aqui está a arquitetura" performam muito bem em comunidade de tecnologia **e** atingem a persona "carreira travada" (dev que precisa de inglês para vaga remota). É vender sem parecer venda, que é o tipo de venda mais fácil para quem é técnico.

- **Ritmo:** 1 post por semana. Alternar técnico (custo de IA, VAD, alinhamento palavra a palavra) e produto (a Ponte, nível por evidência).
- **Bônus:** a Comunidade do GRILO (sugestões votadas que viram feature) é ótimo material: "vocês votaram, eu entreguei".

### Canal 4 — SEO programático com dados da Ponte

Toda vez que alguém usa a Ponte, o GRILO aprende uma palavra que brasileiros não sabem dizer em inglês. Isso vira páginas como "Como se diz *sobremesa* em inglês" — com pronúncia em áudio, frase de exemplo e um botão "treine falando agora". É o tipo de busca que milhões de pessoas fazem, e você consegue gerar centenas de páginas boas com código.

- **Ação técnica:** se ainda não grava, guardar agregados anônimos da Ponte (par pt→en + contagem, sem dado pessoal — tranquilo na LGPD).
- **Piloto:** 50 páginas das palavras mais misturadas. Medir indexação e cliques em 60 dias.

### Canal 5 — PR com dado próprio: "Relatório Portinglês"

Com os mesmos agregados: *"As 50 palavras em que o brasileiro mais trava no inglês"*. Imprensa de educação, carreira e tecnologia publica esse tipo de dado (é o mesmo motivo de o EF EPI sair todo ano em todo jornal). Custo: zero. Resultado: menção de marca e autoridade. Fazer quando houver volume suficiente para o dado ser crível (alguns milhares de usos da Ponte).

### Canal 6 — Certificado de nível compartilhável (viral embutido no produto)

Quando o aluno conquista o A1, gerar um cartão bonito ("Conquistei o nível A1 no GRILO — 500 palavras, 50 frases, 20 aulas, comprovado escrevendo, ouvindo e falando") pronto para LinkedIn e Stories, com link de indicação. Cada conquista vira propaganda feita pelo próprio aluno. Funciona também com score de shadowing e "semana completa de treino".

### Canal 7 — Indique uma dupla

"Traga alguém para treinar com você: os dois ganham 1 mês de Pro." Simples, e prepara o terreno para a comunidade de prática (pareamento) se os grupos-piloto do plano de julho mostrarem que funciona.

### O que não fazer agora

- **Mídia paga** antes de um canal orgânico provar CAC abaixo de ~R$ 80.
- **App nativo** antes do PWA mostrar que instalação muda retenção.
- **Venda para empresas** antes de 100 pagantes e conteúdo B1.
- **Competir em preço com a BeConfident** — ela tem R$ 85 mi para queimar. Competir em *ser diferente*.

---

## Parte 8 — Retenção (o produto como vendedor)

Assinatura se ganha na primeira semana e se perde no primeiro mês. O que fazer com o que já existe:

1. **Primeira sessão em menos de 2 minutos** (a landing promete). Medir: ativação D0 — meta de 50% já no painel.
2. **"Treino de hoje"** (em construção na home) é a peça certa: um percurso curto, sempre o mesmo, com ✓. Manter em até 10 minutos.
3. **Lembrete fora do app:** hoje não existe nenhum (sem e-mail, sem push, sem WhatsApp). Começar com e-mail de D1, D3 e D7 (textos no kit). Depois testar push via PWA.
4. **Recap como gancho de volta:** "Amanhã: 3 pontos para revisar do que você falou hoje."
5. **Pesquisa de cancelamento** obrigatória e curta quando o checkout existir — cada cancelamento é uma entrevista grátis.

**Métrica Norte proposta:** *alunos que treinaram fala em 3 ou mais dias na semana* (voz, shadowing ou fala nas aulas). Mede hábito de fala, que é a promessa da marca — melhor do que contar só sessões de voz.

---

## Parte 9 — Plano de 90 dias

### Dias 1–30: consertar e lançar a oferta

| # | Ação | Tipo | Critério de pronto |
|---|---|---|---|
| 1 | Checkout com Pix + cartão (Pro mensal, anual, Founders) | Engenharia | Primeiro pagamento real sem intervenção manual |
| 2 | Login persistente (validar token + refresh) | Engenharia | Fechar e reabrir o navegador mantém a sessão |
| 3 | Reset de senha por e-mail | Engenharia | Fluxo funciona sem DM no Instagram |
| 4 | Alinhar portão de shadowing (backend ou landing) | Engenharia | Landing e backend dizem a mesma coisa |
| 5 | PWA instalável | Engenharia | "Adicionar à tela inicial" funciona no Android e iOS |
| 6 | Trocar "Beta aberta e gratuita" pela oferta Founders (300 vagas, contador real) | Marca | Landing com a oferta e o contador |
| 7 | 10 entrevistas com usuários | Validação | Notas em um arquivo, padrões listados |
| 8 | Recrutar os 10 primeiros Professores Parceiros | Vendas | 10 cupons ativos |
| 9 | Começar as 4 séries de conteúdo (3/semana) e 1 post de fundador/semana | Marketing | 12 vídeos e 4 posts publicados |

### Dias 31–60: medir e aprofundar

10. Rodar Sean Ellis assim que houver 30 elegíveis.
11. E-mails de retenção D1/D3/D7.
12. Cartão de conquista compartilhável (A1, shadowing, semana completa).
13. Piloto de SEO: 50 páginas "como se diz X em inglês".
14. Coorte por persona (Viagem vs. Trabalho) → escolher a persona principal.

### Dias 61–90: dobrar a aposta no que funcionou

15. Matar os 1–2 canais com pior custo por cadastro; dobrar esforço no melhor.
16. Fechar a tabela de preço pública com base em Sean Ellis + conversão real da Founders.
17. Se professores parceiros trouxerem alunos que retêm acima da média: começar o painel do professor.
18. Começar o conteúdo B1 se os primeiros alunos estiverem chegando ao fim do A2.
19. Relatório Portinglês, se houver volume de dado.

**Metas do trimestre:** 100 pagantes · 30+ respostas Sean Ellis · 10+ professores parceiros ativos · ativação D0 ≥ 50% · retenção D7 ≥ 35%.

---

## Parte 10 — Riscos e como se proteger

| Risco | Probabilidade | Proteção |
|---|---|---|
| Fundador solo dividido entre código e vendas | Alta | Bloco fixo na agenda: manhãs código, 2 tardes por semana só vendas/conteúdo. O plano acima tem 5 itens de engenharia e o resto é venda — de propósito |
| Duolingo ou Speak copiam a Ponte | Média | A Ponte é a demonstração, não o fosso. O fosso é marca ("sem grilo"), rede de professores e dados de onde o brasileiro trava. Construir esses três rápido |
| Custo de voz explode com uso | Média | Medir custo por minuto já; voz do navegador no grátis; uso justo no Pro |
| Groq/ElevenLabs mudam preço ou termos | Média | A camada de IA já é isolada (decision_engine/services); manter um segundo fornecedor testado |
| Alunos chegam ao fim do A2 sem conteúdo B1 | Baixa nos próximos 6 meses | Monitorar quantos passam da aula 30 do A2; começar B1 com antecedência |
| Prometer o que não existe (comunidade de prática, certificado oficial) | Média | Seção 3.5 deste documento como checklist antes de publicar qualquer peça |

---

## Parte 11 — Captação: quando faz sentido

O mercado é investível — a BeConfident captou R$ 85 mi em abril de 2026 e a Speak vale US$ 1 bi. Mas **captar agora seria vender barato:** sem receita e sem prova de retenção, o valuation é baixo e a diluição é alta.

O momento de conversar com investidores é com **~1.000 pagantes, retenção D30 comprovada e um canal com CAC conhecido**. Até lá, a história mais forte é a eficiência: um produto completo, com 5 frentes, construído por uma pessoa, com custo de IA por aluno muito baixo. Isso se mostra com números, não com deck — então o trabalho de agora já é a preparação.

---

## Decisões que só você pode tomar

1. **Plataforma de marca "Inglês sem grilo"** no lugar de "cheat code"? (recomendo sim)
2. **Persona principal:** Carreira ou Viagem? (recomendo decidir com os dados de onboarding + retenção, em até 30 dias)
3. **Preço da Founders:** R$ 149/ano travado para 300 vagas? (recomendo sim)
4. **Comissão do Professor Parceiro:** 30% recorrente? (recomendo começar em 30% e rever em 90 dias)
5. **Portão de shadowing no A1:** entra na certificação ou sai da landing?

## Números que eu preciso de você para afinar o plano

Estes ficam no banco de produção e não no repositório: total de cadastros, ativos na semana, ativação D0, retenção D7/D30, distribuição de respostas do onboarding (motivo e interesse), custo mensal de Groq e ElevenLabs. Com eles, a Parte 5 deixa de ser estimativa.

---

## Fontes

- Mercado de idiomas no Brasil (R$ 25–35 bi, 7 mi de alunos, buscas +50%): [MoveEdu](https://moveedu.com.br/blog/franquias-de-idiomas-mercado-de-linguas-brasil/), [Portal do Franchising](https://www.portaldofranchising.com.br/noticias/franquias-de-escolas-de-ingles/)
- EF EPI 2025 (Brasil 75º/123, nota 482): [InfoMoney](https://www.infomoney.com.br/minhas-financas/brasil-melhora-proficiencia-no-ingles-mas-pais-segue-na-lanterna-da-america-latina/amp/), [EF fact sheet](https://www.ef.com/assetscdn/WIBIwq6RdJvcD9bc8RMd/cefcom-epi-site/fact-sheets/2025/ef-epi-fact-sheet-brazil-english.pdf)
- 5% falam inglês (British Council): [Mundo RH](https://mundorh.com.br/apenas-5-da-populacao-brasileira-fala-ingles)
- Medo de falar (33%, Cambridge): [Universidade do Intercâmbio](https://www.universidadedointercambio.com/sotaque-nao-e-barreira-para-falar-ingles/), [CNN Brasil](https://www.cnnbrasil.com.br/blogs/leonardo-reis/educacao/por-que-brasileiros-tem-vergonha-de-falar-ingles/)
- Duolingo Max preço e Lily no Brasil: [Fast Company Brasil](https://fastcompanybrasil.com/news/duolingo-lanca-recursos-de-ia-em-plano-max-veja-quanto-custa-no-brasil/), [IstoÉ Dinheiro](https://istoedinheiro.com.br/brasil-duolingo-2o-mercado-apenas-uma)
- Speak (preço, US$ 1 bi, receita): [Tolky](https://tolky.to/descobrir-ia/speak-app), [CO/AI](https://getcoai.com/news/openai-backed-language-tutor-startup-hits-1b-valuation), [Clay](https://clay.com/dossier/speak-funding)
- BeConfident (R$ 85 mi, usuários, preço): [Muito Saber](https://muitosaber.com.br/2026/04/14/beconfident-levanta-r-85-milhoes-e-aposta-em-ensino-de-ingles-com-inteligencia-artificial/), [Projeto Draft](https://www.projetodraft.com/que-tal-aprender-ingles-pelo-whatsapp-a-beconfident-usa-ia-para-ajudar-os-alunos-a-ganhar-fluencia-no-idioma/)
- ELSA Speak preço no Brasil: [SpeakShark](https://speakshark.com/blog/elsa-speak-price-brazil-2026)
- Fluency Academy: [Startups.com.br](https://startups.com.br/negocios/ma/fluency-academy-adquire-awari-e-preve-receita-de-r-200m/), [Startups — IA vs Duolingo](https://startups.com.br/negocios/edtech/com-ai-na-manga-fluency-quer-brigar-com-o-duolingo/)
- Open English FluentIA: [Open English](https://www.openenglish.com.br/blog/open-english-lanca-metodologia-exclusiva/)
- Cambly/ELSA comparação: [learnenglish.life](https://learnenglish.life/compare/cambly-vs-elsa-speak/)
- Aula particular (R$ 20–150/h): [Cronoshare](https://www.cronoshare.com.br/quanto-custa/preco-aula-particular-ingles), [Superprof](https://www.superprof.com.br/aulas/ingles/brasil/)
- Trabalho remoto para o exterior (Deel +53%, TechFX +160%): [Olhar Digital](https://olhardigital.com.br/2025/03/20/pro/brasileiros-podem-triplicar-salarios-trabalhando-para-o-exterior-diz-pesquisa/), [Baguete](https://www.baguete.com.br/noticias/estrangeiros-recrutam-ativamente-no-brasil)
- Inglês corporativo (Voxy, Slang): [ABC da Comunicação](https://www.abcdacomunicacao.com.br/empresas-apostam-em-sistema-de-ensino-profissional-de-ingles-para-qualificacao-dos-funcionarios/), [Baguete — Voxy](https://www.baguete.com.br/noticias/cit-tem-ingles-para-funcionarios-com-voxy)
- Mercado global de apps de idiomas e churn: [Meticulous Research](https://www.meticulousresearch.com/product/online-language-learning-market-5025), [Sensor Tower](https://sensortower.com/blog/duolingo-redefining-engagement-in-the-ed-tech-space), [pupuweb — saída dos apps gamificados](https://pupuweb.com/why-are-language-learners-moving-away-from-gamified-apps-to-hybrid-ai-tools/)
- EF SET gratuito / certificações CEFR: [EF SET](https://www.ef.com/wwpt/certificados-ingles/efset/), [Cambridge English Brasil](https://cambridgeenglish.org/br/exams-and-tests/preliminary/why-take-the-exam)
- Professores influenciadores: [CNN Brasil](https://www.cnnbrasil.com.br/educacao/6-professores-no-tiktok-que-ensinam-com-bom-humor/)
