# GRILO — Kit de Vendas

**Data:** 2026-10-07
**Para que serve:** textos prontos para copiar, adaptar e usar. A estratégia por trás de cada peça está no [PLAYBOOK-ESTRATEGICO.md](PLAYBOOK-ESTRATEGICO.md).
**Filtro obrigatório:** todo texto aqui segue `docs/BRAND-VOICE.md` (amigo bilíngue, direto, sem infantilizar) e a lista "O que nunca dizer" do playbook (seção 3.5).

---

## 1. Pitches

### Em uma frase
> O GRILO é o treino diário de inglês pra quem trava na hora de falar: se faltar a palavra, fala em português mesmo, que a gente devolve em inglês sem parar a conversa.

### Em 30 segundos (conversa, evento, vídeo)
> Quase todo brasileiro que estudou inglês entende alguma coisa e trava na hora de falar. Os apps tratam isso como erro. O GRILO trata como ponto de partida: você conversa com uma IA por voz, e se travar, mistura português — *"I prefer the frango"* — e ela responde em inglês e te devolve a palavra, com pronúncia, sem interromper. Em volta disso tem aulas, shadowing e ditação pra fixar, e um nível que você só sobe quando prova, alinhado ao quadro europeu que escolas e empresas usam. Inglês sem grilo.

### Em 2 minutos (investidor, parceiro, imprensa)
1. **Problema:** só 5% dos brasileiros se comunicam em inglês. Não falta conteúdo, falta coragem: um terço tem medo de falar mesmo sabendo o conteúdo.
2. **Por que os outros não resolvem:** Duolingo é jogo de pontos; tutores de IA gringos esperam que você já fale; cursos vendem aula, não prática.
3. **O que o GRILO faz:** treino diário de fala com uma IA que deixa misturar português (a Ponte), corrige sem interromper e mede nível por evidência.
4. **Por que agora:** IA de voz ficou barata o suficiente para conversa ilimitada por menos que uma aula particular; contratação de brasileiros por empresas de fora cresceu 53% em um ano.
5. **Tração:** [preencher: cadastros, ativos semanais, retenção D7, pagantes].
6. **Eficiência:** produto completo com 5 frentes construído por um fundador técnico, com custo de IA por aluno de [preencher] centavos.
7. **Pedido:** [preencher conforme o interlocutor: parceria, investimento, matéria].

---

## 2. One-pager (texto para PDF, Notion ou site)

**GRILO — Inglês sem grilo.**

**Pra quem é:** adulto que já estudou inglês, entende um pouco e trava na hora de falar.

**O que você faz lá dentro:**
- **Conversa por voz** com uma IA, livre ou em 5 cenários (restaurante, aeroporto, entrevista, viagem, médico).
- **Mistura português quando travar.** A IA responde em inglês e te devolve a palavra, com pronúncia.
- **É corrigido sem ser interrompido.** A forma certa vem na resposta; os pontos para revisar ficam no recap.
- **Fixa com treino curto:** aulas que passam cada palavra por ver, ouvir, escrever e falar; shadowing com áudio nativo; ditação.
- **Sobe de nível quando prova.** Escada do A0 ao C2, alinhada ao CEFR. Ninguém sobe por ter aberto o app.
- **Decide o que vem a seguir** na Comunidade: sugestões votadas viram recurso.

**Quanto custa:** grátis para começar. Pro por R$ 34,90/mês ou R$ 239/ano. Founders: R$ 149/ano, preço travado, só 300 vagas.

**Começar:** [link com ?cadastro]

---

## 3. Mensagens de prospecção

### 3.1 Professor particular (DM no Instagram ou WhatsApp)

> Oi, [nome]! Vi seus vídeos sobre [tema específico de um post dele]. Muito bom o jeito que você explicou [detalhe].
>
> Sou o Caike, construí o GRILO, um treino de fala em inglês com IA. Te escrevo porque ele foi feito pra *complementar* professor, não substituir: o aluno treina fala entre uma aula e outra, e se travar pode misturar português que a IA devolve a palavra em inglês.
>
> Tô montando um grupo pequeno de Professores Parceiros: você ganha o Pro de graça, seus alunos têm 20% de desconto e você recebe 30% do que eles pagarem, todo mês.
>
> Posso te mandar um acesso pra você testar 5 minutos? Se não fizer sentido pros seus alunos, sem problema nenhum.

**Regras:** personalizar a primeira linha sempre (mensagem genérica é ignorada). Mandar no máximo 10 por dia e responder rápido. Se a pessoa testar, perguntar 3 dias depois: "o que você mudaria antes de indicar pra um aluno?".

### 3.2 Criador de conteúdo pequeno (1–20 mil seguidores)

> Oi, [nome]! Curto muito o [quadro/série específica]. Fiz um app de inglês com uma mecânica que acho que rende conteúdo pro seu perfil: você fala uma frase misturando português ("I want a sobremesa") e a IA responde em inglês e te devolve a palavra.
>
> Queria te dar acesso Pro vitalício pra brincar com isso. Se render um vídeo, ótimo; se não render, fica de presente. Topa?

### 3.3 Post de lançamento em comunidade tech (TabNews, LinkedIn, r/brdev)

> **Construí sozinho um app de inglês com IA de voz. O que aprendi sobre latência, custo e brasileiro travando.**
>
> Há [X] meses comecei o GRILO, um treino de fala em inglês. Três decisões técnicas que fizeram diferença:
>
> 1. **Roteamento por custo:** frase trivial não chama modelo nenhum (10–30 ms); frase curta vai pro modelo pequeno; o resto vai pro grande. [Resultado em números.]
> 2. **Whisper só quando precisa:** se o reconhecimento do navegador já tem confiança alta, pula a transcrição no servidor e economiza 0,5–1,5 s por turno.
> 3. **"Assume e flui":** com confiança baixa, a IA nunca pede pra repetir. Assume o palpite mais provável e segue. Pedir pra repetir é o que faz o brasileiro desistir.
>
> E a mecânica que mais gosto: se você trava e fala português no meio da frase, a IA entende, responde em inglês e te devolve a palavra, sem chamada extra de IA.
>
> Tá em beta: [link]. Feedback técnico ou de produto é muito bem-vindo.

### 3.4 E-mail para RH de empresa (só depois de 100 pagantes)

> **Assunto:** Treino de fala em inglês pro time, por menos que uma aula por pessoa
>
> Oi, [nome]. Sou o Caike, do GRILO.
>
> Quem trabalha com cliente ou time de fora geralmente entende inglês e trava na hora de falar em reunião. O GRILO é um treino diário de 10 minutos por voz com IA, que corrige sem interromper e mostra a evolução de cada pessoa num nível alinhado ao CEFR.
>
> Hoje [N] pessoas treinam com a gente e [dado de evolução]. Proponho um piloto de 30 dias com 10 pessoas do seu time, sem custo, com relatório de evolução no fim.
>
> Faz sentido uma conversa de 15 minutos?

---

## 4. Objeções e respostas

| Objeção | Resposta |
|---|---|
| "Já uso o Duolingo." | Ótimo pra vocabulário. Aqui é onde você *fala* o que aprendeu lá. Quantas frases você falou em voz alta no Duolingo essa semana? |
| "IA não substitui professor." | Concordo. O GRILO não substitui — é o treino entre as aulas, que nenhum professor consegue estar presente pra fazer. |
| "Não tenho tempo." | O treino de hoje leva 10 minutos. Fluência vem de dias comuns repetidos, não de maratona. |
| "Meu inglês é muito ruim pra conversar com IA." | É exatamente pra você. Se travar, fala em português que a IA devolve a palavra em inglês. Ninguém vai te interromper. |
| "Tenho vergonha do meu sotaque." | Três de cada quatro pessoas que falam inglês no mundo têm sotaque. A meta é ser entendido, não soar americano. E aqui ninguém está ouvindo além do grilo. |
| "Por que pagar se tem grátis?" | O grátis continua grátis. O Pro libera conversa sem limite, o recap completo e o certificado do seu nível. Custa menos que uma aula particular por mês. |
| "E se eu não gostar?" | [Definir garantia: recomendo 7 dias com reembolso total, sem perguntas — o Código de Defesa do Consumidor já dá 7 dias para compra online, então anunciar isso não custa nada e tira o risco da decisão.] |

---

## 5. Oferta Founders

### Faixa na landing (substitui "Beta aberta e gratuita")
> **Founders: R$ 149/ano, pra sempre.** Só para as primeiras 300 pessoas. Restam [N].

### Bloco de oferta (fim do recap ou página de planos)
> **Seja Founder do GRILO.**
> Conversa sem limite, recap completo, certificado de nível e o seu nome na lista de quem construiu o GRILO desde o começo.
> **R$ 149 por ano — e esse preço não sobe enquanto você renovar.**
> Só 300 vagas. Depois disso, o anual volta pra R$ 239.
> [Quero ser Founder]
> *7 dias pra testar. Não curtiu, devolvemos tudo.*

### E-mail para a base atual
> **Assunto:** Você chegou antes. Isso vale alguma coisa.
>
> Oi, [nome].
>
> Você entrou no GRILO quando ele ainda era beta, e foi gente como você que decidiu boa parte do que ele virou (a Comunidade não é enfeite).
>
> A partir de [data] o GRILO vai ter plano pago. Antes de abrir pra todo mundo, quero oferecer pra quem chegou primeiro: **R$ 149 por ano, travado pra sempre.** São 300 vagas, e quem está na base tem prioridade até [data].
>
> O grátis continua existindo. O Founders é pra quem quer conversar sem limite e ajudar o GRILO a continuar de pé.
>
> [Garantir minha vaga]
>
> Valeu por chegar antes,
> Caike

---

## 6. Conteúdo: 12 roteiros de Reels/TikTok (4 semanas, 3 por semana)

Formato: vertical, 15–30 s, legenda sempre ligada, gancho nos 2 primeiros segundos.

| # | Série | Gancho (primeiros 2 s) | Desenvolvimento | Fecho |
|---|---|---|---|---|
| 1 | Como se diz | "Você já falou *portinglês* e nem percebeu." | Tela da Ponte: *"I want a sobremesa"* → *dessert*, áudio da pronúncia | "Travou? Mistura. O GRILO devolve em inglês." |
| 2 | Travas brasileiras | "*I have went.* Você já falou isso." | Por que o brasileiro erra (tradução do "eu tenho ido"), forma certa, exemplo na sessão de voz | "A IA corrige sem te cortar." |
| 3 | Bastidores | "Construí um app de inglês sozinho. Isso aqui custou R$ [X]." | Tela do código + o que cada parte faz em uma frase | "Link na bio se quiser testar." |
| 4 | Como se diz | "3 palavras que todo brasileiro trava no restaurante." | *sobremesa, garçom, a conta* → *dessert, waiter, the check* via Ponte | "Treina o cenário Restaurante antes da viagem." |
| 5 | Travas brasileiras | "Não é *tink*. Olha a sua língua." | O "th": língua entre os dentes (demo do hero da landing) | "O GRILO ouve e te mostra." |
| 6 | Prova de treino | "Meu score de shadowing de segunda a sexta." | Gravação de tela: 62% → 84%, palavras que descolaram ficando verdes | "Shadowing: a técnica de intérprete da ONU, no seu celular." |
| 7 | Como se diz | "Seu chefe em inglês não é *chefe*." | *My chefe is very nice* → *boss* | "Pode misturar. A gente devolve." |
| 8 | Bastidores | "Vocês votaram, eu fiz." | Tópico da Comunidade com votos → recurso pronto | "A Comunidade decide o que vem a seguir." |
| 9 | Prova de treino | "Ninguém sobe de nível aqui por abrir o app." | Os 4 portões do A1 enchendo | "Nível é conquista, não pontinho." |
| 10 | Travas brasileiras | "Por que você entende tudo e não consegue falar?" | Entender (passivo) ≠ falar (ativo); só treina fala falando | "10 minutos por dia, em voz alta." |
| 11 | Como se diz | "Ditado: escreve o que ouvir. Valendo." | Frase da Ditação tocando, pausa de 3 s, resposta com a palavra que todos erram (*photo* com ph) | "Comenta quantas você acertou." |
| 12 | Bastidores | "Por que meu app de inglês se chama GRILO." | "Grilo" = preocupação; Grilo Falante = voz no ouvido | "Inglês sem grilo." |

**Medição:** cada vídeo com link de cadastro + `utm_content=reel-NN`. Depois de 4 semanas, repetir os formatos dos 3 melhores e cortar os 3 piores.

---

## 7. Roteiros de validação

### 7.1 Entrevista com usuário (20 minutos, método *The Mom Test*)

Regras: falar 20% do tempo. Perguntar sobre o passado e o comportamento real, nunca sobre o futuro ("você usaria?" e "você pagaria?" geram mentiras educadas). Gravar com permissão.

1. Me conta da última vez que você precisou falar inglês. O que aconteceu?
2. O que você já tentou pra melhorar? Por que parou?
3. Quanto você já gastou com inglês no último ano? Com o quê?
4. Como você descobriu o GRILO? O que te fez criar a conta?
5. Me mostra (compartilhando a tela) como foi sua última sessão. Onde você travou?
6. Teve algum momento em que você pensou "isso aqui é bom"? E "isso aqui é ruim"?
7. Se o GRILO sumisse amanhã, o que você usaria no lugar?
8. Quem mais você conhece que trava no inglês? *(se citar alguém: "posso te mandar um convite pra essa pessoa?")*

**Teste de preço (fim da entrevista, 4 perguntas Van Westendorp):**
- A partir de que preço por mês o GRILO seria tão barato que você desconfiaria da qualidade?
- Em que preço seria uma pechincha?
- Em que preço começaria a ficar caro, mas você ainda pensaria?
- A partir de que preço seria caro demais, nem pensaria?

### 7.2 Pesquisa Sean Ellis (enviar quando o painel marcar 30 elegíveis)

1. Como você se sentiria se não pudesse mais usar o GRILO? (Muito decepcionado / Um pouco decepcionado / Não decepcionado / Já não uso)
2. Que tipo de pessoa você acha que mais aproveitaria o GRILO?
3. Qual é o principal benefício que você tem com o GRILO?
4. Como podemos melhorar o GRILO pra você?
5. (Van Westendorp: as 4 perguntas acima)

**Leitura:** ≥40% "muito decepcionado" = sinal de PMF. Ler as respostas 2 e 3 *só* de quem marcou "muito" — é a descrição do seu cliente ideal nas palavras dele, e vira copy da landing.

### 7.3 Pesquisa de cancelamento (1 tela, quando houver checkout)
> Antes de ir: o que mais pesou?
> ( ) Caro pra mim agora · ( ) Não tive tempo de usar · ( ) Não senti evolução · ( ) Achei outra coisa: ___ · ( ) Outro: ___
> Se pudesse mudar uma coisa no GRILO, o que seria? ___

---

## 8. Mensagens de retenção (e-mail D1, D3, D7)

Hoje o GRILO não envia nenhum e-mail. Estes são os três primeiros a implementar.

**D1 — dia seguinte ao cadastro, se não voltou**
> **Assunto:** Ontem você falou [N] frases em inglês
> Hoje são 10 minutos: uma aula, uma ditação, um shadowing. O treino de hoje já está montado.
> [Treinar agora]

**D3 — se fez pelo menos 1 sessão**
> **Assunto:** A palavra que você mais travou essa semana
> Você misturou *"[palavra pt]"* na conversa. Em inglês é **[palavra en]** — [link de pronúncia].
> Treina ela falando hoje, que amanhã ela já sai sozinha.
> [Falar agora]

**D7 — primeira semana completa**
> **Assunto:** Sua primeira semana no GRILO
> [N] dias de treino · [N] palavras dominadas · [N] de 500 rumo ao A1.
> Fluência não nasce de maratona. Nasce disso aqui, repetido.
> [Ver meu mapa]

---

## 9. Variações de hero para teste A/B na landing

A atual ("Fale inglês. A gente cuida do resto.") é boa e deve ser o controle. Variações para testar uma de cada vez, por 2 semanas, medindo cadastro por visita:

| Variação | H1 | Subtítulo |
|---|---|---|
| A — Ponte | Travou no inglês? Fala em português mesmo. | O GRILO entende a mistura, responde em inglês e te devolve a palavra que faltou. A conversa não para. |
| B — Sem grilo | Inglês sem grilo. | Uma IA que conversa com você, deixa misturar português quando travar e corrige sem interromper. |
| C — Prova | Você entende inglês. Agora fala. | 10 minutos por dia de conversa por voz, com uma IA que corrige sem te cortar e um nível que só sobe quando você prova. |
