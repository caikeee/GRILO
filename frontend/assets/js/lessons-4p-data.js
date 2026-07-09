/* ============================================================
 *  Lessons 4 Pontas — DADOS (piloto: 3 aulas)
 *  ============================================================
 *  Formato do novo sistema de lições em 4 pontas:
 *  ver/identificar · escrever · ouvir · falar.
 *
 *  Cada aula declara um ESCOPO (8 palavras + 5 frases) que é a
 *  moeda da aula: o conteúdo é autorado a partir dele e a
 *  avaliação rastreia cada item individualmente.
 *
 *  Regras de autoria:
 *   - toda palavra do escopo aparece em ≥1 frase do escopo
 *     (é assim que ela ganha crédito de "falada" via voz);
 *   - toda palavra do escopo aparece ≥2x na teoria/exemplos;
 *   - checkpoints VER/OUVIR de cada seção cobrem os itens
 *     daquela seção.
 *
 *  Escada de domínio por item (decidida em 2026-07-06):
 *   escreveu certo               → APRENDIDA (entra no vocabulário)
 *   + falou + ouviu-e-entendeu   → DOMINADA
 * ============================================================ */
(function () {
  'use strict';

  window.Grilo4P = window.Grilo4P || {};

  /* Bloco A1 — 20 aulas em 4 grupos, ordenados por SOBREVIVÊNCIA
   * (decisão 2026-07-07). Gate A1→A2 = completar as 20 aulas. */
  window.Grilo4P.GROUPS = [
    { id: 'A', label: 'Sobrevivência',
      desc: 'O inglês do primeiro dia: cumprimentar, se apresentar, números, horas, preços e pedir comida. Zero gramática formal — só frases que você usa de cara.' },
    { id: 'B', label: 'Estrutura da frase',
      desc: 'A gramática que sustenta o que você já fala: to be, pronomes, possessivos e as primeiras perguntas.' },
    { id: 'C', label: 'Rotina e tempo',
      desc: 'Falar da sua vida real: rotina, frequência e as perguntas abertas do dia a dia.' },
    { id: 'D', label: 'Passado e desejos',
      desc: 'Contar o que aconteceu e dizer o que você quer — o fecho do A1.' },
  ];

  window.Grilo4P.LESSONS = [

    /* ────────────────────────────────────────────────────────
     *  AULA 1 — Cumprimentos
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-cumprimentos',
      group: 'A',
      title: 'Cumprimentos — do bom dia ao boa noite',
      icon: 'HI',
      minutes: 12,
      objective: 'Sair desta aula cumprimentando qualquer pessoa, em qualquer hora do dia — e respondendo bem quando cumprimentarem você.',
      scope: {
        words: [
          { en: 'morning',   pt: 'manhã',                 phonetic: 'MOR-ning' },
          { en: 'afternoon', pt: 'tarde',                 phonetic: 'af-ter-NUN' },
          { en: 'evening',   pt: 'noite (ao chegar)',     phonetic: 'IV-ning' },
          { en: 'night',     pt: 'noite (ao se despedir)', phonetic: 'nait' },
          { en: 'meet',      pt: 'conhecer (alguém)',     phonetic: 'mit' },
          { en: 'welcome',   pt: 'bem-vindo',             phonetic: 'UEL-kâm' },
          { en: 'fine',      pt: 'bem',                   phonetic: 'fain' },
          { en: 'thanks',    pt: 'obrigado(a)',           phonetic: 'thénks' },
        ],
        phrases: [
          { en: 'Good morning! How are you?',        pt: 'Bom dia! Como você está?',            phonetic: 'gud MOR-ning · rau ar iu' },
          { en: 'Good afternoon! Nice to meet you.', pt: 'Boa tarde! Prazer em conhecer você.', phonetic: 'gud af-ter-NUN · nais tu MIT iu' },
          { en: 'Good evening! Welcome!',            pt: 'Boa noite! Bem-vindo!',               phonetic: 'gud IV-ning · UEL-kâm' },
          { en: 'Good night! Sleep well.',           pt: 'Boa noite! Durma bem.',               phonetic: 'gud NAIT · slip uel' },
          { en: "I'm fine, thanks. And you?",        pt: 'Estou bem, obrigado. E você?',        phonetic: 'aim FAIN thénks · end IU' },
        ],
      },
      sections: [
        {
          title: 'As quatro saudações do dia',
          explanation: 'O inglês divide o dia em quatro momentos — e cada um tem sua saudação. Até o meio-dia é <b>morning</b> (Good morning). Do meio-dia até umas 18h é <b>afternoon</b> (Good afternoon). Quando anoitece e você CHEGA em algum lugar, é <b>evening</b> (Good evening). E quando você vai embora ou vai dormir, aí sim é <b>night</b> (Good night). A pegadinha clássica do brasileiro: "Good night" não serve para cumprimentar — é só despedida.',
          examples: [
            { en: 'Good morning! Did you sleep well?',   pt: 'Bom dia! Você dormiu bem?' },
            { en: 'Good afternoon! How is your day?',    pt: 'Boa tarde! Como está o seu dia?' },
            { en: 'Good evening! Come in, please.',      pt: 'Boa noite! Entre, por favor. (chegando)' },
            { en: 'Good night! See you tomorrow.',       pt: 'Boa noite! Até amanhã. (indo embora)' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'morning',
              prompt: 'São 8 da manhã e você encontra um colega. Qual palavra completa a saudação: "Good ___"?',
              options: ['morning', 'night', 'evening'], correct: 0 },
            { kind: 'ouvir', item: 'evening', audio: 'Good evening! Welcome!',
              prompt: 'O que você ouviu?',
              options: ['Boa noite, ao receber alguém', 'Boa noite, ao se despedir', 'Boa tarde'], correct: 0 },
            { kind: 'ver', item: 'night',
              prompt: '"Good night" se usa quando…',
              options: ['você vai embora ou vai dormir', 'você chega numa festa à noite', 'é qualquer hora depois das 18h'], correct: 0 },
            { kind: 'ouvir', item: 'afternoon', audio: 'Good afternoon!',
              prompt: 'Que momento do dia é esse cumprimento?',
              options: ['Entre meio-dia e ~18h', 'Antes do meio-dia', 'Depois que anoitece'], correct: 0 },
          ],
        },
        {
          title: 'Conhecer alguém e responder bem',
          explanation: 'Ao conhecer alguém pela primeira vez, a frase é <b>Nice to meet you</b> — "meet" é conhecer, não "encontrar de novo". Se a pessoa chega na sua casa ou no seu trabalho, receba com <b>Welcome!</b>. E quando perguntarem "How are you?", a resposta educada e natural é <b>I\'m fine, thanks</b> — "fine" é o seu "estou bem", e "thanks" é o obrigado curto que os nativos usam o tempo todo. Devolva a pergunta com "And you?" e a conversa flui.',
          examples: [
            { en: 'Nice to meet you, Carlos!',       pt: 'Prazer em conhecer você, Carlos!' },
            { en: 'Welcome to our house!',           pt: 'Bem-vindo à nossa casa!' },
            { en: "I'm fine, thanks. And you?",      pt: 'Estou bem, obrigado. E você?' },
            { en: 'Thanks for the coffee!',          pt: 'Obrigado pelo café!' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'meet',
              prompt: 'Você acabou de ser apresentado a alguém. O que dizer?',
              options: ['Nice to meet you.', 'Good night.', 'I am fine.'], correct: 0 },
            { kind: 'ouvir', item: 'fine', audio: "I'm fine, thanks. And you?",
              prompt: 'A pessoa que falou isso está…',
              options: ['bem, e agradeceu', 'com pressa', 'se despedindo'], correct: 0 },
            { kind: 'ver', item: 'welcome',
              prompt: 'Alguém chega na sua casa. Qual palavra recebe bem?',
              options: ['Welcome!', 'Thanks!', 'Fine!'], correct: 0 },
            { kind: 'ouvir', item: 'thanks', audio: 'Thanks for everything!',
              prompt: 'O que a pessoa fez?',
              options: ['Agradeceu', 'Pediu desculpa', 'Cumprimentou'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 2 — Apresentações
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-apresentacoes',
      group: 'A',
      title: 'Apresentações — quem é você em inglês',
      icon: 'EU',
      minutes: 12,
      objective: 'Sair desta aula se apresentando por completo: nome, de onde vem, onde mora e o que faz — as 4 frases que abrem qualquer conversa.',
      scope: {
        words: [
          { en: 'name',    pt: 'nome',       phonetic: 'neim' },
          { en: 'from',    pt: 'de (origem)', phonetic: 'from' },
          { en: 'live',    pt: 'morar',      phonetic: 'liv' },
          { en: 'city',    pt: 'cidade',     phonetic: 'CI-ti' },
          { en: 'work',    pt: 'trabalhar',  phonetic: 'uôrk' },
          { en: 'teacher', pt: 'professor(a)', phonetic: 'TI-tcher' },
          { en: 'student', pt: 'estudante',  phonetic: 'STU-dent' },
          { en: 'friend',  pt: 'amigo(a)',   phonetic: 'frend' },
        ],
        phrases: [
          { en: 'My name is Ana.',                  pt: 'Meu nome é Ana.',                 phonetic: 'mai NEIM iz A-na' },
          { en: "I'm from Brazil.",                 pt: 'Eu sou do Brasil.',               phonetic: 'aim from brâ-ZIU' },
          { en: 'I live in a big city.',            pt: 'Eu moro numa cidade grande.',     phonetic: 'ai LIV in â big CI-ti' },
          { en: 'I work as a teacher.',             pt: 'Eu trabalho como professor.',     phonetic: 'ai UÔRK éz â TI-tcher' },
          { en: 'This is my friend. He is a student.', pt: 'Este é meu amigo. Ele é estudante.', phonetic: 'dis iz mai FREND · ri iz â STU-dent' },
        ],
      },
      sections: [
        {
          title: 'Quem é você: nome e origem',
          explanation: 'Toda apresentação começa com duas informações: seu nome e de onde você vem. Para o nome: <b>My name is…</b> — "name" soa como "nêim". Para a origem, o inglês usa <b>from</b>: "I\'m from Brazil" (eu sou DO Brasil). Repare que "from" já carrega o "do/da" — não precisa de mais nada. Para perguntar de volta: "What\'s your name?" e "Where are you from?".',
          examples: [
            { en: 'My name is Carlos.',        pt: 'Meu nome é Carlos.' },
            { en: "What's your name?",         pt: 'Qual é o seu nome?' },
            { en: "I'm from Brazil.",          pt: 'Eu sou do Brasil.' },
            { en: 'Where are you from?',       pt: 'De onde você é?' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'name',
              prompt: 'Para dizer seu nome, você começa com…',
              options: ['My name is…', 'I live in…', "I'm from…"], correct: 0 },
            { kind: 'ouvir', item: 'from', audio: "I'm from Brazil.",
              prompt: 'O que a pessoa disse?',
              options: ['De onde ela é', 'Onde ela mora', 'O nome dela'], correct: 0 },
            { kind: 'ver', item: 'from',
              prompt: '"Eu sou do Brasil" em inglês é…',
              options: ["I'm from Brazil.", "I'm of Brazil.", "I'm in Brazil."], correct: 0 },
            { kind: 'ouvir', item: 'name', audio: 'My name is Ana. Nice to meet you.',
              prompt: 'Qual é o nome da pessoa?',
              options: ['Ana', 'Nina', 'Ela não disse'], correct: 0 },
          ],
        },
        {
          title: 'Sua vida: onde mora e o que faz',
          explanation: 'A segunda metade da apresentação: onde você mora e o que você faz. Morar é <b>live</b>: "I live in São Paulo" — e se a sua cidade é grande, "a big <b>city</b>". Trabalhar é <b>work</b>: "I work as a <b>teacher</b>" (trabalho como professor). Se você estuda, é <b>student</b>: "I am a student". E para apresentar alguém do seu lado: "This is my <b>friend</b>" — simples assim, sem tradução literal de "esse aqui é".',
          examples: [
            { en: 'I live in a small city.',      pt: 'Eu moro numa cidade pequena.' },
            { en: 'She works as a teacher.',      pt: 'Ela trabalha como professora.' },
            { en: 'I am a student at UFMG.',      pt: 'Eu sou estudante na UFMG.' },
            { en: 'This is my friend Pedro.',     pt: 'Este é meu amigo Pedro.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'live',
              prompt: '"Eu moro em Recife" em inglês é…',
              options: ['I live in Recife.', 'I work in Recife.', 'I am from in Recife.'], correct: 0 },
            { kind: 'ouvir', item: 'work', audio: 'I work as a teacher in a big city.',
              prompt: 'O que a pessoa contou?',
              options: ['O trabalho e onde ele acontece', 'Onde ela nasceu', 'O nome do amigo dela'], correct: 0 },
            { kind: 'ver', item: 'student',
              prompt: 'Quem estuda é…',
              options: ['a student', 'a teacher', 'a friend'], correct: 0 },
            { kind: 'ouvir', item: 'friend', audio: 'This is my friend. He is a student.',
              prompt: 'Quem foi apresentado?',
              options: ['Um amigo que é estudante', 'Um professor', 'Um vizinho'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 3 — Números do dia a dia
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-numeros',
      group: 'A',
      title: 'Números do dia a dia — idade, telefone e pedidos',
      icon: '10',
      minutes: 12,
      objective: 'Sair desta aula usando números onde eles realmente aparecem: dizer sua idade, ditar seu telefone e pedir "três cafés" sem travar.',
      scope: {
        words: [
          { en: 'one',    pt: 'um',        phonetic: 'uân' },
          { en: 'two',    pt: 'dois',      phonetic: 'tchu' },
          { en: 'three',  pt: 'três',      phonetic: 'thri' },
          { en: 'five',   pt: 'cinco',     phonetic: 'faiv' },
          { en: 'ten',    pt: 'dez',       phonetic: 'tén' },
          { en: 'number', pt: 'número',    phonetic: 'NÂM-ber' },
          { en: 'years',  pt: 'anos',      phonetic: 'íers' },
          { en: 'old',    pt: 'velho / de idade', phonetic: 'ould' },
        ],
        phrases: [
          { en: 'I am ten years old.',                 pt: 'Eu tenho dez anos.',                     phonetic: 'ai ém TÉN íers ould' },
          { en: 'My phone number is five five one.',   pt: 'Meu número de telefone é cinco cinco um.', phonetic: 'mai FOUN nâm-ber iz faiv faiv uân' },
          { en: 'I have two brothers.',                pt: 'Eu tenho dois irmãos.',                  phonetic: 'ai rév TCHU BRÂ-ders' },
          { en: 'Three coffees, please.',              pt: 'Três cafés, por favor.',                 phonetic: 'THRI KÓ-fis pliz' },
          { en: 'How old are you?',                    pt: 'Quantos anos você tem?',                 phonetic: 'rau OULD ar iu' },
        ],
      },
      sections: [
        {
          title: 'Números que você usa toda hora',
          explanation: 'Você não precisa decorar até o cem hoje — precisa dos números que aparecem na vida real. <b>One</b> (1), <b>two</b> (2), <b>three</b> (3), <b>five</b> (5) e <b>ten</b> (10) resolvem café, mesa de restaurante, quantidade de filhos e nota de avaliação. Atenção à pronúncia: "three" tem o th com a língua entre os dentes (não é "tri" nem "fri"), e "two" soa "tchu" — igual "too".',
          examples: [
            { en: 'Three coffees, please.',        pt: 'Três cafés, por favor.' },
            { en: 'A table for two, please.',      pt: 'Uma mesa para dois, por favor.' },
            { en: 'I have one question.',          pt: 'Eu tenho uma pergunta.' },
            { en: 'Five stars! Ten out of ten.',   pt: 'Cinco estrelas! Dez de dez.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'three',
              prompt: 'Você quer pedir TRÊS cafés. Qual número usar?',
              options: ['three', 'ten', 'five'], correct: 0 },
            { kind: 'ouvir', item: 'two', audio: 'A table for two, please.',
              prompt: 'A mesa é para quantas pessoas?',
              options: ['Duas', 'Dez', 'Cinco'], correct: 0 },
            { kind: 'ver', item: 'ten',
              prompt: '"Dez de dez" (nota máxima) em inglês é…',
              options: ['Ten out of ten', 'Two out of two', 'Five out of five'], correct: 0 },
            { kind: 'ouvir', item: 'five', audio: 'It costs five dollars.',
              prompt: 'Quanto custa?',
              options: ['Cinco dólares', 'Um dólar', 'Três dólares'], correct: 0 },
          ],
        },
        {
          title: 'Idade e telefone',
          explanation: 'Aqui mora a diferença mais famosa entre português e inglês: idade não se TEM, se É. "Eu tenho dez anos" vira <b>I am ten years old</b> — literalmente "eu sou dez anos velho". A pergunta segue a mesma lógica: <b>How old are you?</b>. E telefone: <b>number</b> é número, e nativos ditam dígito por dígito — "five five one" — nunca "quinhentos e cinquenta e um".',
          examples: [
            { en: 'I am ten years old.',                pt: 'Eu tenho dez anos.' },
            { en: 'How old are you?',                   pt: 'Quantos anos você tem?' },
            { en: 'My phone number is five five one.',  pt: 'Meu telefone é cinco cinco um.' },
            { en: 'She is five years old.',             pt: 'Ela tem cinco anos.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'old',
              prompt: '"Eu tenho 10 anos" em inglês é…',
              options: ['I am ten years old.', 'I have ten years.', 'I am ten age.'], correct: 0 },
            { kind: 'ouvir', item: 'years', audio: 'She is five years old.',
              prompt: 'Qual a idade dela?',
              options: ['Cinco anos', 'Dez anos', 'Ela não disse'], correct: 0 },
            { kind: 'ver', item: 'number',
              prompt: 'Para ditar seu telefone, os nativos falam…',
              options: ['dígito por dígito: "five five one"', 'o número inteiro: "quinhentos e cinquenta e um"', 'só os dois últimos dígitos'], correct: 0 },
            { kind: 'ouvir', item: 'one', audio: 'My phone number is five five one.',
              prompt: 'Qual é o último dígito do telefone?',
              options: ['Um', 'Cinco', 'Dez'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 4 — Horas
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-horas',
      group: 'A',
      title: 'Horas — que horas são, sem pânico',
      icon: '🕐',
      minutes: 12,
      objective: 'Sair desta aula perguntando e entendendo horários — e sabendo dizer "estou atrasado" quando (inevitavelmente) precisar.',
      scope: {
        words: [
          { en: 'time',    pt: 'hora / tempo',        phonetic: 'taim' },
          { en: 'now',     pt: 'agora',               phonetic: 'nau' },
          { en: "o'clock", pt: 'em ponto',            phonetic: 'ou-KLÓK' },
          { en: 'half',    pt: 'meia (metade)',       phonetic: 'réf' },
          { en: 'past',    pt: 'passado(a) de (hora)', phonetic: 'pést' },
          { en: 'quarter', pt: 'quinze minutos (um quarto)', phonetic: 'KUÓR-ter' },
          { en: 'late',    pt: 'atrasado',            phonetic: 'leit' },
          { en: 'early',   pt: 'adiantado / cedo',    phonetic: 'ÊR-li' },
        ],
        phrases: [
          { en: 'What time is it now?',              pt: 'Que horas são agora?',              phonetic: 'uót TAIM iz it NAU' },
          { en: "It's ten o'clock.",                 pt: 'São dez em ponto.',                 phonetic: 'its tén ou-KLÓK' },
          { en: "It's half past seven.",             pt: 'São sete e meia.',                  phonetic: 'its RÉF pést SÉ-ven' },
          { en: "It's a quarter to nine.",           pt: 'São quinze para as nove.',          phonetic: 'its â KUÓR-ter tu NAIN' },
          { en: "Sorry, I'm late! — No, you're early!", pt: 'Desculpa, estou atrasado! — Não, você chegou cedo!', phonetic: 'SÓ-ri aim LEIT · nou ior ÊR-li' },
        ],
      },
      sections: [
        {
          title: 'Perguntar a hora e a hora cheia',
          explanation: 'A pergunta mais útil do seu dia: <b>What time is it?</b> — literalmente "que hora é?". Se quiser soar ainda mais natural, cola um <b>now</b> no final: "What time is it now?". Para responder na hora cheia, o inglês tem uma palavrinha exclusiva: <b>o\'clock</b> — que só existe para hora EXATA. "It\'s ten o\'clock" = dez em ponto. Curiosidade que ajuda a memorizar: o\'clock é abreviação de "of the clock" (do relógio), herança de quando se precisava dizer se a hora era do relógio ou do sol.',
          examples: [
            { en: 'What time is it now?',       pt: 'Que horas são agora?' },
            { en: "It's ten o'clock.",          pt: 'São dez em ponto.' },
            { en: 'The meeting is at two.',     pt: 'A reunião é às duas.' },
            { en: 'Time flies!',                pt: 'O tempo voa!' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'time',
              prompt: 'Você quer saber as horas. Qual pergunta usar?',
              options: ['What time is it?', 'How time is it?', 'What hour is it?'], correct: 0 },
            { kind: 'ouvir', item: "o'clock", audio: "It's ten o'clock.",
              prompt: 'Que horas são?',
              options: ['Dez em ponto', 'Dez e meia', 'Quase dez'], correct: 0 },
            { kind: 'ver', item: "o'clock",
              prompt: '"O\'clock" só pode ser usado quando…',
              options: ['a hora é exata (em ponto)', 'já passou da meia-noite', 'você está atrasado'], correct: 0 },
            { kind: 'ouvir', item: 'now', audio: 'What time is it now?',
              prompt: 'O que a pessoa quer saber?',
              options: ['A hora, agora', 'O preço', 'O dia da semana'], correct: 0 },
          ],
        },
        {
          title: 'E meia, quinze minutos… e o atraso',
          explanation: 'Sete e meia = <b>half past seven</b> — "meia (hora) passada das sete". O <b>past</b> marca minutos que já passaram da hora. Para os quinze minutos, o inglês usa <b>quarter</b> (um quarto de hora): "quarter past nine" = nove e quinze; "quarter to nine" = quinze PARA as nove. Dica de sobrevivência: se enrolar, fale como relógio digital — "seven thirty" funciona sempre. E o vocabulário social do horário: chegou depois da hora, você está <b>late</b>; chegou antes, está <b>early</b> — e "Sorry, I\'m late!" é provavelmente a frase mais falada em escritórios do mundo inteiro.',
          examples: [
            { en: "It's half past seven.",         pt: 'São sete e meia.' },
            { en: "It's a quarter past nine.",     pt: 'São nove e quinze.' },
            { en: "Sorry, I'm late!",              pt: 'Desculpa, estou atrasado!' },
            { en: "Relax, you're early.",          pt: 'Relaxa, você chegou cedo.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'half',
              prompt: '"Sete e meia" em inglês é…',
              options: ['half past seven', 'seven and half', 'half to seven'], correct: 0 },
            { kind: 'ouvir', item: 'quarter', audio: "It's a quarter to nine.",
              prompt: 'Que horas são?',
              options: ['Quinze para as nove', 'Nove e quinze', 'Nove e meia'], correct: 0 },
            { kind: 'ver', item: 'late',
              prompt: 'A reunião era às 10h e você chegou 10h20. Você está…',
              options: ['late', 'early', 'now'], correct: 0 },
            { kind: 'ouvir', item: 'early', audio: "You're early! The meeting is at ten.",
              prompt: 'O que aconteceu?',
              options: ['A pessoa chegou antes da hora', 'A pessoa chegou atrasada', 'A reunião foi cancelada'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 5 — Preços e compras
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-precos',
      group: 'A',
      title: 'Preços e compras — quanto custa isso?',
      icon: '💰',
      minutes: 12,
      objective: 'Sair desta aula perguntando preço, entendendo a resposta, achando caro (ou barato) e pagando — no cartão ou em dinheiro.',
      scope: {
        words: [
          { en: 'price',     pt: 'preço',        phonetic: 'prais' },
          { en: 'money',     pt: 'dinheiro',     phonetic: 'MÂ-ni' },
          { en: 'dollars',   pt: 'dólares',      phonetic: 'DÓ-lars' },
          { en: 'cheap',     pt: 'barato',       phonetic: 'tchip' },
          { en: 'expensive', pt: 'caro',         phonetic: 'eks-PÉN-siv' },
          { en: 'buy',       pt: 'comprar',      phonetic: 'bai' },
          { en: 'pay',       pt: 'pagar',        phonetic: 'pei' },
          { en: 'card',      pt: 'cartão',       phonetic: 'kard' },
        ],
        phrases: [
          { en: 'How much is it? — Ten dollars.',    pt: 'Quanto custa? — Dez dólares.',        phonetic: 'rau MÂTCH iz it · tén DÓ-lars' },
          { en: "The price is good. It's cheap!",    pt: 'O preço está bom. É barato!',         phonetic: 'dâ PRAIS iz gud · its TCHIP' },
          { en: 'This is too expensive.',            pt: 'Isso é caro demais.',                 phonetic: 'dis iz tchu eks-PÉN-siv' },
          { en: 'I want to buy a gift.',             pt: 'Eu quero comprar um presente.',       phonetic: 'ai uónt tu BAI â ghift' },
          { en: 'Can I pay with card or money?',     pt: 'Posso pagar com cartão ou dinheiro?', phonetic: 'kén ai PEI uif KARD or MÂ-ni' },
        ],
      },
      sections: [
        {
          title: 'Quanto custa? — perguntando o preço',
          explanation: 'A pergunta de ouro das compras: <b>How much is it?</b> — "quanto é?". Nada de traduzir palavra por palavra; esse bloco vem pronto. A resposta vem em <b>dollars</b> (ou na moeda local): "ten dollars", "twenty dollars". Se quiser a palavra exata para "preço", ela é <b>price</b> — cuidado com a pegadinha: <i>prize</i> (com Z) é prêmio, não preço. E <b>money</b> é o dinheiro em geral: "I have no money" é o lamento universal do fim do mês.',
          examples: [
            { en: 'How much is it?',                pt: 'Quanto custa?' },
            { en: "It's twenty dollars.",           pt: 'São vinte dólares.' },
            { en: 'The price is on the tag.',       pt: 'O preço está na etiqueta.' },
            { en: 'I have no money this month!',    pt: 'Estou sem dinheiro esse mês!' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'price',
              prompt: '"Preço" em inglês é…',
              options: ['price', 'prize', 'pay'], correct: 0 },
            { kind: 'ouvir', item: 'dollars', audio: "It's twenty dollars.",
              prompt: 'Quanto custa?',
              options: ['Vinte dólares', 'Doze dólares', 'Dois dólares'], correct: 0 },
            { kind: 'ver', item: 'money',
              prompt: 'Você quer perguntar o preço de algo. Qual frase usar?',
              options: ['How much is it?', 'How many is it?', 'How money is it?'], correct: 0 },
            { kind: 'ouvir', item: 'price', audio: 'The price is good today.',
              prompt: 'Sobre o que a pessoa falou?',
              options: ['O preço está bom', 'A loja está fechada', 'O produto acabou'], correct: 0 },
          ],
        },
        {
          title: 'Barato, caro e a hora de pagar',
          explanation: 'Achou em conta? É <b>cheap</b> — e não, não tem nada a ver com "chip" de celular, apesar do som parecido. Achou um absurdo? É <b>expensive</b> — e o intensificador favorito dos indignados é o <b>too</b>: "too expensive" = caro DEMAIS. Comprar é <b>buy</b> (soa igual "bye", o tchau!) e pagar é <b>pay</b>. Na hora H, a pergunta que resolve: "Can I <b>pay</b> with <b>card</b>?" — posso pagar com cartão? Nos Estados Unidos praticamente tudo aceita cartão; a pergunta inversa ("cash only?") é que assusta.',
          examples: [
            { en: "It's so cheap! I'll take two.",   pt: 'Tá tão barato! Vou levar dois.' },
            { en: 'This is too expensive for me.',   pt: 'Isso é caro demais pra mim.' },
            { en: 'I want to buy a gift for my mom.', pt: 'Quero comprar um presente pra minha mãe.' },
            { en: 'Can I pay with card?',            pt: 'Posso pagar com cartão?' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'cheap',
              prompt: 'Custa quase nada. Está…',
              options: ['cheap', 'expensive', 'early'], correct: 0 },
            { kind: 'ouvir', item: 'expensive', audio: 'Wow, this is too expensive!',
              prompt: 'O que a pessoa achou?',
              options: ['Achou caro demais', 'Achou barato', 'Quer comprar dois'], correct: 0 },
            { kind: 'ver', item: 'pay',
              prompt: '"Posso pagar com cartão?" em inglês é…',
              options: ['Can I pay with card?', 'Can I price with card?', 'Can I money with card?'], correct: 0 },
            { kind: 'ouvir', item: 'buy', audio: 'I want to buy a gift for my friend.',
              prompt: 'O que a pessoa quer fazer?',
              options: ['Comprar um presente', 'Vender um presente', 'Pedir a conta'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 6 — Restaurante e café
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-restaurante',
      group: 'A',
      title: 'Restaurante e café — pedir sem apontar pro cardápio',
      icon: '☕',
      minutes: 12,
      objective: 'Sair desta aula entrando num café ou restaurante, pedindo mesa, comida e a conta — a experiência completa, do "good evening" ao "the check, please".',
      scope: {
        words: [
          { en: 'table',     pt: 'mesa',            phonetic: 'TEI-bâl' },
          { en: 'menu',      pt: 'cardápio',        phonetic: 'MÉ-niu' },
          { en: 'order',     pt: 'pedir (o pedido)', phonetic: 'ÓR-der' },
          { en: 'coffee',    pt: 'café',            phonetic: 'KÓ-fi' },
          { en: 'water',     pt: 'água',            phonetic: 'UÓ-ter' },
          { en: 'food',      pt: 'comida',          phonetic: 'fud' },
          { en: 'delicious', pt: 'delicioso',       phonetic: 'di-LÍ-shâs' },
          { en: 'check',     pt: 'a conta',         phonetic: 'tchék' },
        ],
        phrases: [
          { en: 'A table for two, please.',              pt: 'Uma mesa para dois, por favor.',       phonetic: 'â TEI-bâl for TCHU pliz' },
          { en: 'Can I see the menu?',                   pt: 'Posso ver o cardápio?',                phonetic: 'kén ai SI dâ MÉ-niu' },
          { en: 'I want to order a coffee and water.',   pt: 'Quero pedir um café e uma água.',      phonetic: 'ai uónt tu ÓR-der â KÓ-fi énd UÓ-ter' },
          { en: 'The food is delicious!',                pt: 'A comida está deliciosa!',             phonetic: 'dâ FUD iz di-LÍ-shâs' },
          { en: 'The check, please.',                    pt: 'A conta, por favor.',                  phonetic: 'dâ TCHÉK pliz' },
        ],
      },
      sections: [
        {
          title: 'Chegando: mesa, cardápio e pedido',
          explanation: 'A sequência clássica começa na porta: <b>"A table for two, please"</b> — mesa para dois. Repare que não se traduz o "de": é "table FOR two". Sentou? Hora do <b>menu</b> — mesma palavra do português, pronúncia diferente: "MÉ-niu". E para pedir, o verbo é <b>order</b>: "I want to order…". Dica de ouro: <b>"Can I have…?"</b> também funciona para pedir qualquer coisa e soa super educado. Os dois itens que salvam qualquer pedido: <b>coffee</b> (cuidado — "KÓ-fi", não "cofí") e <b>water</b> (nos EUA soa "UÓ-rer", com o T virando quase um R).',
          examples: [
            { en: 'A table for two, please.',          pt: 'Uma mesa para dois, por favor.' },
            { en: 'Can I see the menu?',               pt: 'Posso ver o cardápio?' },
            { en: 'I want to order a coffee, please.', pt: 'Quero pedir um café, por favor.' },
            { en: 'A water for me, please.',           pt: 'Uma água pra mim, por favor.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'table',
              prompt: 'Você chega no restaurante em dois. O que dizer?',
              options: ['A table for two, please.', 'A menu for two, please.', 'Two foods, please.'], correct: 0 },
            { kind: 'ouvir', item: 'menu', audio: 'Can I see the menu, please?',
              prompt: 'O que a pessoa pediu?',
              options: ['O cardápio', 'A conta', 'Uma água'], correct: 0 },
            { kind: 'ver', item: 'order',
              prompt: '"Fazer o pedido" usa qual verbo?',
              options: ['order', 'ask', 'buy'], correct: 0 },
            { kind: 'ouvir', item: 'water', audio: 'A coffee and a water, please.',
              prompt: 'O que foi pedido?',
              options: ['Café e água', 'Café e chá', 'Água e suco'], correct: 0 },
          ],
        },
        {
          title: 'Elogiar a comida e pedir a conta',
          explanation: 'A comida chegou boa? Solta um <b>"The food is delicious!"</b> — garçons adoram, e é o elogio mais natural que existe. <b>Food</b> é comida em geral (cuidado com a pegadinha: <i>foot</i> com T é pé!). Na hora de ir embora, nos Estados Unidos a conta é <b>the check</b>: "The check, please". Na Inglaterra dizem "the bill" — as duas funcionam, mas check é o que você mais vai ouvir em filmes e séries. Curiosidade cultural que evita perrengue: nos EUA a gorjeta (tip) não é opcional de verdade — 15% a 20% é o esperado, e ela não vem inclusa na conta.',
          examples: [
            { en: 'The food is delicious!',       pt: 'A comida está deliciosa!' },
            { en: 'Everything was great, thanks.', pt: 'Estava tudo ótimo, obrigado.' },
            { en: 'The check, please.',           pt: 'A conta, por favor.' },
            { en: 'Is the tip included?',         pt: 'A gorjeta está inclusa?' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'check',
              prompt: 'Terminou de comer e quer pagar. Você pede…',
              options: ['the check', 'the menu', 'the table'], correct: 0 },
            { kind: 'ouvir', item: 'delicious', audio: 'The food is delicious!',
              prompt: 'O que a pessoa fez?',
              options: ['Elogiou a comida', 'Reclamou da comida', 'Pediu mais comida'], correct: 0 },
            { kind: 'ver', item: 'food',
              prompt: '"Comida" em inglês é…',
              options: ['food', 'foot', 'feed'], correct: 0 },
            { kind: 'ouvir', item: 'check', audio: 'The check, please.',
              prompt: 'O que a pessoa pediu?',
              options: ['A conta', 'O cardápio', 'Mais café'], correct: 0 },
          ],
        },
      ],
    },

    /* ════════════════════════════════════════════════════════
     *  GRUPO B — ESTRUTURA DA FRASE
     * ════════════════════════════════════════════════════════ */

    /* ────────────────────────────────────────────────────────
     *  AULA 7 — To be (am/is/are)
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-to-be',
      group: 'B',
      title: 'To be — o verbo que diz quem você é',
      icon: 'BE',
      minutes: 13,
      objective: 'Sair desta aula montando a base de quase toda frase em inglês: eu sou, ela é, nós estamos — e entendendo por que o inglês exige esse verbo onde o português dispensa.',
      scope: {
        words: [
          { en: 'am',      pt: 'sou / estou (com I)',    phonetic: 'ém' },
          { en: 'is',      pt: 'é / está (he, she, it)', phonetic: 'iz' },
          { en: 'are',     pt: 'é/são/está (you, we, they)', phonetic: 'ar' },
          { en: 'happy',   pt: 'feliz',                  phonetic: 'RÉ-pi' },
          { en: 'tired',   pt: 'cansado',                phonetic: 'TÁI-erd' },
          { en: 'ready',   pt: 'pronto',                 phonetic: 'RÉ-di' },
          { en: 'here',    pt: 'aqui',                   phonetic: 'rír' },
          { en: 'together', pt: 'juntos',                phonetic: 'tu-GUÉ-der' },
        ],
        phrases: [
          { en: 'I am happy today.',        pt: 'Eu estou feliz hoje.',       phonetic: 'ai ÉM RÉ-pi tu-DÉI' },
          { en: 'She is very tired.',       pt: 'Ela está muito cansada.',    phonetic: 'chi IZ vé-ri TÁI-erd' },
          { en: 'Are you ready?',           pt: 'Você está pronto?',          phonetic: 'ar iu RÉ-di' },
          { en: 'We are here together.',    pt: 'Nós estamos aqui juntos.',   phonetic: 'ui ar RÍR tu-GUÉ-der' },
          { en: 'He is my friend.',         pt: 'Ele é meu amigo.',           phonetic: 'ri iz mai FREND' },
        ],
      },
      sections: [
        {
          title: 'Am, is, are — um verbo, três formas',
          explanation: 'Em português, "ser" e "estar" mudam de forma o tempo todo (sou, é, somos…). O inglês junta os dois num só verbo — o <b>to be</b> — que tem só três formas no presente. Com "I" (eu), use <b>am</b>: "I <b>am</b> happy". Com he, she, it (ele, ela, isso), use <b>is</b>: "She <b>is</b> here". Com you, we, they (você, nós, eles), use <b>are</b>: "We <b>are</b> ready". Decore o trio pelo pronome e metade da gramática do inglês já está resolvida — porque quase toda descrição ("estou cansado", "ela é minha amiga") passa por aqui.',
          examples: [
            { en: 'I am happy today.',      pt: 'Eu estou feliz hoje.' },
            { en: 'He is my friend.',       pt: 'Ele é meu amigo.' },
            { en: 'You are very kind.',     pt: 'Você é muito gentil.' },
            { en: 'They are here.',         pt: 'Eles estão aqui.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'am',
              prompt: 'Complete: "I ___ happy." (eu estou feliz)',
              options: ['am', 'is', 'are'], correct: 0 },
            { kind: 'ver', item: 'is',
              prompt: 'Complete: "She ___ my friend." (ela é minha amiga)',
              options: ['is', 'am', 'are'], correct: 0 },
            { kind: 'ouvir', item: 'happy', audio: 'I am happy today.',
              prompt: 'Como a pessoa está?',
              options: ['Feliz', 'Cansada', 'Com pressa'], correct: 0 },
            { kind: 'ouvir', item: 'here', audio: 'We are here together.',
              prompt: 'O que a pessoa disse?',
              options: ['Que estão aqui juntos', 'Que vão embora', 'Que estão cansados'], correct: 0 },
          ],
        },
        {
          title: 'Por que o inglês não deixa o verbo cair',
          explanation: 'O maior erro do brasileiro é sumir com o to be. "Estou cansado" vira, na cabeça, "I tired" — mas em inglês tem que ser "I <b>am</b> tired". O verbo é obrigatório. Repare nos estados que sempre pedem ele: <b>tired</b> (cansado), <b>ready</b> (pronto), <b>happy</b> (feliz). E para dizer que está tudo mundo no mesmo lugar, junte <b>here</b> (aqui) e <b>together</b> (juntos): "We are here together". Regra de ouro: se em português você usaria "sou/é/está/estão", em inglês obrigatoriamente entra am/is/are.',
          examples: [
            { en: 'She is very tired.',      pt: 'Ela está muito cansada.' },
            { en: 'Are you ready?',          pt: 'Você está pronto?' },
            { en: 'We are here together.',   pt: 'Nós estamos aqui juntos.' },
            { en: 'I am ready to start.',    pt: 'Estou pronto para começar.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'are',
              prompt: 'Complete: "___ you ready?" (você está pronto?)',
              options: ['Are', 'Is', 'Am'], correct: 0 },
            { kind: 'ouvir', item: 'tired', audio: 'She is very tired.',
              prompt: 'Como ela está?',
              options: ['Muito cansada', 'Muito feliz', 'Pronta'], correct: 0 },
            { kind: 'ver', item: 'ready',
              prompt: '"Estou pronto" em inglês é…',
              options: ['I am ready', 'I ready', 'I am readys'], correct: 0 },
            { kind: 'ouvir', item: 'together', audio: 'We are here together.',
              prompt: 'A palavra "together" significa…',
              options: ['juntos', 'cansados', 'prontos'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 8 — Pronomes sujeito
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-pronomes',
      group: 'B',
      title: 'Pronomes — eu, você, ele, ela sem repetir o nome',
      icon: 'EU',
      minutes: 12,
      objective: 'Sair desta aula usando os 7 pronomes que abrem qualquer frase — e sabendo que, ao contrário do português, o inglês nunca deixa o "eu/ele/nós" sumir.',
      scope: {
        words: [
          { en: 'I',    pt: 'eu',            phonetic: 'ai' },
          { en: 'you',  pt: 'você / vocês',  phonetic: 'iu' },
          { en: 'he',   pt: 'ele',           phonetic: 'ri' },
          { en: 'she',  pt: 'ela',           phonetic: 'chi' },
          { en: 'it',   pt: 'isso (coisa/animal)', phonetic: 'it' },
          { en: 'we',   pt: 'nós',           phonetic: 'ui' },
          { en: 'they', pt: 'eles / elas',   phonetic: 'dei' },
          { en: 'people', pt: 'pessoas',     phonetic: 'PÍ-pol' },
        ],
        phrases: [
          { en: 'I work and you study.',    pt: 'Eu trabalho e você estuda.',     phonetic: 'ai UÔRK end iu STÂ-di' },
          { en: 'He is here, she is not.',  pt: 'Ele está aqui, ela não.',        phonetic: 'ri iz RÍR chi iz NÓT' },
          { en: 'It is a good day.',        pt: 'É um bom dia.',                  phonetic: 'it iz â gud DÉI' },
          { en: 'We are happy people.',     pt: 'Nós somos pessoas felizes.',     phonetic: 'ui ar RÉ-pi PÍ-pol' },
          { en: 'They speak English.',      pt: 'Eles falam inglês.',             phonetic: 'dei SPÍK ÍN-glich' },
        ],
      },
      sections: [
        {
          title: 'As pessoas: I, you, he, she',
          explanation: 'Todo pronome sujeito responde "quem faz?". <b>I</b> (eu) é sempre maiúsculo em inglês, em qualquer posição da frase — é regra, não ênfase. <b>You</b> serve para "você" E "vocês" (o inglês não separa): "you speak" pode ser um ou vários. Para a terceira pessoa, o inglês separa por gênero: <b>he</b> (ele) e <b>she</b> (ela) — cuidado, é o erro nº 1 do brasileiro trocar os dois. Dica de pronúncia: "he" soa "ri" e "she" soa "chi".',
          examples: [
            { en: 'I work every day.',      pt: 'Eu trabalho todo dia.' },
            { en: 'You speak very well.',   pt: 'Você fala muito bem.' },
            { en: 'He is my brother.',      pt: 'Ele é meu irmão.' },
            { en: 'She is a teacher.',      pt: 'Ela é professora.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'he',
              prompt: 'Para falar de um homem (ele), use…',
              options: ['he', 'she', 'it'], correct: 0 },
            { kind: 'ver', item: 'she',
              prompt: '"Ela é professora" começa com…',
              options: ['She', 'He', 'They'], correct: 0 },
            { kind: 'ouvir', item: 'you', audio: 'You speak very well.',
              prompt: 'Sobre quem a pessoa falou?',
              options: ['Sobre você', 'Sobre ele', 'Sobre eles'], correct: 0 },
            { kind: 'ouvir', item: 'I', audio: 'I work and you study.',
              prompt: 'O que a pessoa contou?',
              options: ['Que ela trabalha e você estuda', 'Que ele estuda', 'Que eles trabalham'], correct: 0 },
          ],
        },
        {
          title: 'It, we, they — e por que o pronome nunca cai',
          explanation: 'Para coisas, animais e o clima, o inglês usa <b>it</b>: "It is a good day" (é um bom dia). <b>We</b> é "nós" e <b>they</b> é "eles/elas" (sem gênero no plural). O ponto que trava o brasileiro: em português a gente solta o sujeito ("está chovendo", "somos amigos"), mas em inglês o pronome é obrigatório — "<b>It</b> is raining", "<b>We</b> are friends". E uma palavra que anda muito com esses plurais: <b>people</b> (pessoas), que já é plural — "they are good people".',
          examples: [
            { en: 'It is a good day.',        pt: 'É um bom dia.' },
            { en: 'We are happy people.',     pt: 'Nós somos pessoas felizes.' },
            { en: 'They speak English.',      pt: 'Eles falam inglês.' },
            { en: 'It is raining now.',       pt: 'Está chovendo agora.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'it',
              prompt: 'Para falar do clima ("está chovendo"), o inglês usa…',
              options: ['It is raining', 'Is raining', 'He is raining'], correct: 0 },
            { kind: 'ver', item: 'we',
              prompt: '"Nós somos amigos" começa com…',
              options: ['We', 'They', 'You'], correct: 0 },
            { kind: 'ouvir', item: 'they', audio: 'They speak English.',
              prompt: 'Sobre quem a pessoa falou?',
              options: ['Sobre eles', 'Sobre nós', 'Sobre ela'], correct: 0 },
            { kind: 'ouvir', item: 'people', audio: 'We are happy people.',
              prompt: 'A palavra "people" significa…',
              options: ['pessoas', 'felizes', 'amigos'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 9 — Possessivos
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-possessivos',
      group: 'B',
      title: 'De quem é? — my, your, his, her',
      icon: 'MY',
      minutes: 12,
      objective: 'Sair desta aula dizendo de quem é cada coisa — meu, seu, dele, dela — sem cair na armadilha de usar "his" para mulher.',
      scope: {
        words: [
          { en: 'my',    pt: 'meu / minha',   phonetic: 'mai' },
          { en: 'your',  pt: 'seu / sua',     phonetic: 'iór' },
          { en: 'his',   pt: 'dele',          phonetic: 'riz' },
          { en: 'her',   pt: 'dela',          phonetic: 'rêr' },
          { en: 'our',   pt: 'nosso / nossa', phonetic: 'áuer' },
          { en: 'their', pt: 'deles / delas', phonetic: 'dér' },
          { en: 'name',  pt: 'nome',          phonetic: 'neim' },
          { en: 'family', pt: 'família',      phonetic: 'FÉ-mi-li' },
        ],
        phrases: [
          { en: 'My name is Ana.',           pt: 'Meu nome é Ana.',              phonetic: 'mai NEIM iz A-na' },
          { en: 'What is your name?',        pt: 'Qual é o seu nome?',           phonetic: 'uót iz iór NEIM' },
          { en: 'His car is new.',           pt: 'O carro dele é novo.',         phonetic: 'riz KAR iz niu' },
          { en: 'Her family is big.',        pt: 'A família dela é grande.',     phonetic: 'rêr FÉ-mi-li iz big' },
          { en: 'This is our house, and that is their house.', pt: 'Esta é a nossa casa, e aquela é a casa deles.', phonetic: 'dis iz áuer RÁUS end dét iz dér RÁUS' },
        ],
      },
      sections: [
        {
          title: 'Meu e seu: my e your',
          explanation: 'Possessivo é a palavra que gruda antes da coisa e diz de quem ela é. <b>My</b> é "meu/minha" — e não muda no plural nem no feminino: "my car", "my house", "my friends". <b>Your</b> é "seu/sua/de vocês", igualzinho: serve para um ou vários donos. A frase que você vai mais usar na vida: "<b>My name</b> is…" (meu nome é…) e a pergunta "What is <b>your name</b>?". Guarde a palavra <b>name</b> (nome) — ela aparece em toda apresentação.',
          examples: [
            { en: 'My name is Ana.',        pt: 'Meu nome é Ana.' },
            { en: 'What is your name?',     pt: 'Qual é o seu nome?' },
            { en: 'My car is old.',         pt: 'Meu carro é velho.' },
            { en: 'Is this your bag?',      pt: 'Esta é a sua bolsa?' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'my',
              prompt: '"Meu nome é João" começa com…',
              options: ['My', 'Your', 'His'], correct: 0 },
            { kind: 'ver', item: 'your',
              prompt: 'Para perguntar "qual é o SEU nome?", use…',
              options: ['your', 'my', 'their'], correct: 0 },
            { kind: 'ouvir', item: 'name', audio: 'My name is Ana.',
              prompt: 'O que a pessoa disse?',
              options: ['O nome dela', 'A idade dela', 'A cidade dela'], correct: 0 },
            { kind: 'ouvir', item: 'your', audio: 'What is your name?',
              prompt: 'O que a pessoa perguntou?',
              options: ['O seu nome', 'A sua idade', 'O seu trabalho'], correct: 0 },
          ],
        },
        {
          title: 'Dele, dela, nosso, deles — e a grande armadilha',
          explanation: 'Aqui mora o erro nº 1: o inglês escolhe o possessivo pelo DONO, não pela coisa. <b>His</b> é sempre de um homem (dele): "his car", "his family" — mesmo com palavra feminina. <b>Her</b> é sempre de uma mulher (dela): "her car", "her name". Então "a família DELE" é "<b>his</b> family" e "o carro DELA" é "<b>her</b> car" — o gênero vem de quem possui. Complete o quadro com <b>our</b> (nosso) e <b>their</b> (deles/delas). Guarde também <b>family</b> (família), que aparece muito nessas frases.',
          examples: [
            { en: 'His car is new.',         pt: 'O carro dele é novo.' },
            { en: 'Her family is big.',      pt: 'A família dela é grande.' },
            { en: 'This is our house.',      pt: 'Esta é a nossa casa.' },
            { en: 'Their dog is friendly.',  pt: 'O cachorro deles é amigável.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'her',
              prompt: '"O carro DELA" (de uma mulher) é…',
              options: ['her car', 'his car', 'your car'], correct: 0 },
            { kind: 'ver', item: 'his',
              prompt: '"A família DELE" é… (atenção: o gênero vem do dono!)',
              options: ['his family', 'her family', 'their family'], correct: 0 },
            { kind: 'ouvir', item: 'our', audio: 'This is our house.',
              prompt: 'De quem é a casa?',
              options: ['Nossa', 'Dela', 'Deles'], correct: 0 },
            { kind: 'ouvir', item: 'family', audio: 'Her family is big.',
              prompt: 'O que a pessoa falou sobre a família dela?',
              options: ['Que é grande', 'Que é pequena', 'Que mora longe'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 10 — This / that / these / those
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-this-that',
      group: 'B',
      title: 'This, that — apontando o que está perto e o que está longe',
      icon: '👉',
      minutes: 12,
      objective: 'Sair desta aula apontando qualquer coisa em inglês — perto ou longe, uma ou várias — sem gaguejar entre this, that, these e those.',
      scope: {
        words: [
          { en: 'this',  pt: 'este/isto (perto)',   phonetic: 'dis' },
          { en: 'that',  pt: 'aquele/aquilo (longe)', phonetic: 'dét' },
          { en: 'these', pt: 'estes (perto, plural)', phonetic: 'díz' },
          { en: 'those', pt: 'aqueles (longe, plural)', phonetic: 'dôuz' },
          { en: 'thing', pt: 'coisa',                phonetic: 'thing' },
          { en: 'here',  pt: 'aqui',                 phonetic: 'rír' },
          { en: 'there', pt: 'ali / lá',             phonetic: 'dér' },
          { en: 'look',  pt: 'olhar / olha',         phonetic: 'luk' },
        ],
        phrases: [
          { en: 'This is my phone.',        pt: 'Este é meu celular.',          phonetic: 'dis iz mai FÔUN' },
          { en: 'That thing over there.',   pt: 'Aquela coisa ali.',            phonetic: 'dét THING ôu-ver DÉR' },
          { en: 'These are my books.',      pt: 'Estes são meus livros.',       phonetic: 'díz ar mai BUKS' },
          { en: 'Look at those cars!',      pt: 'Olha aqueles carros!',         phonetic: 'luk ét dôuz KARS' },
          { en: 'Is this here for me?',     pt: 'Isto aqui é para mim?',        phonetic: 'iz dis RÍR for MI' },
        ],
      },
      sections: [
        {
          title: 'Perto ou longe: this e that',
          explanation: 'O inglês decide a palavra pela distância. Está PERTO, na sua mão ou do seu lado? Use <b>this</b> (este/isto): "This is my phone". Está LONGE, do outro lado da sala? Use <b>that</b> (aquele/aquilo): "That car is fast". A dica que nunca falha: <b>this</b> anda com <b>here</b> (aqui), <b>that</b> anda com <b>there</b> (ali/lá). E a palavra curinga quando você não sabe o nome de algo: <b>thing</b> (coisa) — "that thing over there" tira você de qualquer apuro.',
          examples: [
            { en: 'This is my phone.',       pt: 'Este é meu celular.' },
            { en: 'That car is fast.',       pt: 'Aquele carro é rápido.' },
            { en: 'This here is for you.',   pt: 'Isto aqui é para você.' },
            { en: 'What is that thing?',     pt: 'Que coisa é aquela?' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'this',
              prompt: 'Você segura um objeto na mão. Para apresentá-lo, use…',
              options: ['This is...', 'That is...', 'Those are...'], correct: 0 },
            { kind: 'ver', item: 'that',
              prompt: 'Um carro do outro lado da rua. Você diz…',
              options: ['That car', 'This car', 'These car'], correct: 0 },
            { kind: 'ouvir', item: 'here', audio: 'Is this here for me?',
              prompt: 'O que a pessoa perguntou?',
              options: ['Se isto aqui é para ela', 'Onde fica a saída', 'Quanto custa'], correct: 0 },
            { kind: 'ouvir', item: 'thing', audio: 'That thing over there.',
              prompt: 'A palavra "thing" significa…',
              options: ['coisa', 'aqui', 'olhar'], correct: 0 },
          ],
        },
        {
          title: 'No plural: these e those',
          explanation: 'Quando é mais de um, o inglês troca a palavra inteira. O plural de <b>this</b> é <b>these</b> (estes, perto): "These are my books". O plural de <b>that</b> é <b>those</b> (aqueles, longe): "Look at those cars!". Repare no verbo <b>look</b> (olhar) — "look at" é "olha para", uma das combinações mais úteis do inglês. Resumindo o quadro: perto → this/these; longe → that/those. Pronúncia que confunde: <b>these</b> (díz, com som de Z longo) x <b>this</b> (dis, curto).',
          examples: [
            { en: 'These are my books.',     pt: 'Estes são meus livros.' },
            { en: 'Look at those cars!',     pt: 'Olha aqueles carros!' },
            { en: 'These shoes are new.',    pt: 'Estes sapatos são novos.' },
            { en: 'Those people are nice.',  pt: 'Aquelas pessoas são legais.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'these',
              prompt: 'Vários livros na sua frente. Você diz…',
              options: ['These are my books', 'This is my books', 'Those are my books'], correct: 0 },
            { kind: 'ver', item: 'those',
              prompt: 'Carros lá longe. "Olha ___ carros!"',
              options: ['those', 'these', 'this'], correct: 0 },
            { kind: 'ouvir', item: 'look', audio: 'Look at those cars!',
              prompt: 'O que a pessoa pediu?',
              options: ['Para olhar os carros', 'Para comprar um carro', 'Para dirigir'], correct: 0 },
            { kind: 'ouvir', item: 'these', audio: 'These are my books.',
              prompt: 'Os livros estão…',
              options: ['perto (estes)', 'longe (aqueles)', 'na loja'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 11 — To be negativo
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-to-be-negativo',
      group: 'B',
      title: 'Dizer que NÃO — não sou, não está, não é',
      icon: 'NO',
      minutes: 12,
      objective: 'Sair desta aula negando com naturalidade — "não estou cansado", "ela não é brasileira" — usando as contrações que os nativos realmente falam.',
      scope: {
        words: [
          { en: 'not',      pt: 'não (negação)',       phonetic: 'nót' },
          { en: "isn't",    pt: 'não é / não está',    phonetic: 'Í-zent' },
          { en: "aren't",   pt: 'não é/são/está',      phonetic: 'ÁR-ent' },
          { en: 'wrong',    pt: 'errado',              phonetic: 'róng' },
          { en: 'busy',     pt: 'ocupado',             phonetic: 'BÍ-zi' },
          { en: 'sure',     pt: 'certo / com certeza', phonetic: 'chúr' },
          { en: 'open',     pt: 'aberto',              phonetic: 'ÔU-pen' },
          { en: 'sick',     pt: 'doente',              phonetic: 'sik' },
        ],
        phrases: [
          { en: "I am not sure.",           pt: 'Eu não tenho certeza.',        phonetic: 'ai ém NÓT chúr' },
          { en: "She isn't sick.",          pt: 'Ela não está doente.',         phonetic: 'chi Í-zent SIK' },
          { en: "We aren't busy today.",    pt: 'Nós não estamos ocupados hoje.', phonetic: 'ui ÁR-ent BÍ-zi tu-DÉI' },
          { en: "The store isn't open.",    pt: 'A loja não está aberta.',      phonetic: 'dâ STÓR Í-zent ÔU-pen' },
          { en: "That answer is wrong.",    pt: 'Aquela resposta está errada.', phonetic: 'dét ÉN-ser iz RÓNG' },
        ],
      },
      sections: [
        {
          title: 'A regra de ouro: to be + not',
          explanation: 'Negar com o to be é a coisa mais fácil do inglês: você só coloca <b>not</b> depois do verbo. "I am happy" → "I am <b>not</b> happy". "She is here" → "She is <b>not</b> here". Não precisa de "don\'t" nem nada — o to be nega sozinho, só pedindo o "not" na cola. Isso vale para os três: am not, is not, are not. Palavras que combinam muito com negação: <b>sure</b> (certo/certeza) — "I\'m not sure" é a frase mais educada para "não sei"; e <b>wrong</b> (errado) — "that is wrong".',
          examples: [
            { en: 'I am not sure.',          pt: 'Eu não tenho certeza.' },
            { en: 'He is not happy.',        pt: 'Ele não está feliz.' },
            { en: 'That answer is wrong.',   pt: 'Aquela resposta está errada.' },
            { en: 'You are not wrong.',      pt: 'Você não está errado.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'not',
              prompt: 'Para negar "I am happy", você coloca "not"…',
              options: ['depois do am: I am not happy', 'antes do I: not I am happy', 'no fim: I am happy not'], correct: 0 },
            { kind: 'ver', item: 'sure',
              prompt: '"Não tenho certeza" em inglês é…',
              options: ["I am not sure", "I not sure", "I don't sure"], correct: 0 },
            { kind: 'ouvir', item: 'wrong', audio: 'That answer is wrong.',
              prompt: 'O que a pessoa disse sobre a resposta?',
              options: ['Que está errada', 'Que está certa', 'Que é difícil'], correct: 0 },
            { kind: 'ouvir', item: 'not', audio: 'I am not sure.',
              prompt: 'A pessoa está…',
              options: ['sem certeza', 'com certeza', 'com pressa'], correct: 0 },
          ],
        },
        {
          title: "Isn't e aren't — como os nativos falam",
          explanation: 'Na vida real, ninguém fica falando "is not" e "are not" separado — os nativos contraem. "is not" vira <b>isn\'t</b> (usa com he, she, it): "She <b>isn\'t</b> sick". "are not" vira <b>aren\'t</b> (usa com you, we, they): "We <b>aren\'t</b> busy". Só o "am not" não tem contração natural — fica "I\'m not". Guarde os estados que mais aparecem negados: <b>busy</b> (ocupado), <b>sick</b> (doente) e <b>open</b> (aberto) — "the store isn\'t open" é frase de porta de loja no mundo todo.',
          examples: [
            { en: "She isn't sick.",         pt: 'Ela não está doente.' },
            { en: "We aren't busy today.",   pt: 'Nós não estamos ocupados hoje.' },
            { en: "The store isn't open.",   pt: 'A loja não está aberta.' },
            { en: "They aren't ready.",      pt: 'Eles não estão prontos.' },
          ],
          checkpoint: [
            { kind: 'ver', item: "isn't",
              prompt: 'Contração de "is not":',
              options: ["isn't", "amn't", "aren't"], correct: 0 },
            { kind: 'ver', item: "aren't",
              prompt: 'Complete: "We ___ busy." (nós não estamos ocupados)',
              options: ["aren't", "isn't", "am not"], correct: 0 },
            { kind: 'ouvir', item: 'open', audio: "The store isn't open.",
              prompt: 'O que a pessoa avisou?',
              options: ['Que a loja não está aberta', 'Que a loja é cara', 'Que a loja é longe'], correct: 0 },
            { kind: 'ouvir', item: 'busy', audio: "We aren't busy today.",
              prompt: 'Como eles estão hoje?',
              options: ['Não estão ocupados', 'Estão ocupados', 'Estão doentes'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 12 — Perguntas sim ou não
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-perguntas-sim-nao',
      group: 'B',
      title: 'Perguntas de sim ou não — Do, Does, Is',
      icon: '?',
      minutes: 13,
      objective: 'Sair desta aula fazendo perguntas que qualquer um responde com sim ou não — e sabendo a diferença entre perguntar com o to be e perguntar com um verbo de ação.',
      scope: {
        words: [
          { en: 'do',    pt: 'faz (auxiliar de pergunta)', phonetic: 'du' },
          { en: 'does',  pt: 'faz (com he/she/it)',    phonetic: 'dâz' },
          { en: 'yes',   pt: 'sim',                    phonetic: 'iés' },
          { en: 'no',    pt: 'não',                    phonetic: 'nôu' },
          { en: 'like',  pt: 'gostar de',              phonetic: 'laik' },
          { en: 'live',  pt: 'morar',                  phonetic: 'liv' },
          { en: 'speak', pt: 'falar',                  phonetic: 'spík' },
          { en: 'coffee', pt: 'café',                  phonetic: 'KÓ-fi' },
        ],
        phrases: [
          { en: 'Do you like coffee?',       pt: 'Você gosta de café?',          phonetic: 'du iu LAIK KÓ-fi' },
          { en: 'Does she speak English?',   pt: 'Ela fala inglês?',             phonetic: 'dâz chi SPÍK ÍN-glich' },
          { en: 'Yes, I do.',                pt: 'Sim. (eu gosto/faço)',         phonetic: 'iés ai DU' },
          { en: 'No, she does not.',         pt: 'Não. (ela não)',               phonetic: 'nôu chi dâz NÓT' },
          { en: 'Do they live here?',        pt: 'Eles moram aqui?',             phonetic: 'du dei LIV rír' },
        ],
      },
      sections: [
        {
          title: 'Do e Does abrem a pergunta',
          explanation: 'Com verbos de AÇÃO (gostar, morar, falar), o inglês abre a pergunta com um ajudante na frente: <b>Do</b> ou <b>Does</b>. Com I, you, we, they, use <b>Do</b>: "<b>Do</b> you like coffee?". Com he, she, it, use <b>Does</b>: "<b>Does</b> she speak English?". O verbo principal fica no jeito básico depois (nunca "does she speaks"). Guarde os verbos que mais aparecem em pergunta: <b>like</b> (gostar), <b>live</b> (morar), <b>speak</b> (falar) — e a palavra <b>coffee</b> (café), tema da pergunta social nº 1 do planeta.',
          examples: [
            { en: 'Do you like coffee?',      pt: 'Você gosta de café?' },
            { en: 'Does she speak English?',  pt: 'Ela fala inglês?' },
            { en: 'Do they live here?',       pt: 'Eles moram aqui?' },
            { en: 'Does he like music?',      pt: 'Ele gosta de música?' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'do',
              prompt: 'Complete: "___ you like coffee?" (você gosta?)',
              options: ['Do', 'Does', 'Is'], correct: 0 },
            { kind: 'ver', item: 'does',
              prompt: 'Complete: "___ she speak English?" (ela fala?)',
              options: ['Does', 'Do', 'Are'], correct: 0 },
            { kind: 'ouvir', item: 'coffee', audio: 'Do you like coffee?',
              prompt: 'O que a pessoa perguntou?',
              options: ['Se você gosta de café', 'Que horas são', 'Onde você mora'], correct: 0 },
            { kind: 'ouvir', item: 'live', audio: 'Do they live here?',
              prompt: 'O que a pessoa quis saber?',
              options: ['Se eles moram aqui', 'Se eles gostam daqui', 'Se eles trabalham'], correct: 0 },
          ],
        },
        {
          title: 'Responder e perguntar com to be',
          explanation: 'Para responder rápido, o inglês repete o ajudante: "Do you like coffee?" → "<b>Yes</b>, I do" / "<b>No</b>, I don\'t". Guarde <b>yes</b> (sim) e <b>no</b> (não) — óbvios, mas a resposta natural quase sempre vem com o "I do / she does" colado. Um detalhe importante: quando a pergunta é com o TO BE (am/is/are), você NÃO usa do/does — só inverte: "<b>Is</b> she happy?", "<b>Are</b> you ready?". Regra: verbo de ação pede Do/Does; to be pergunta sozinho, virando de cabeça pra baixo.',
          examples: [
            { en: 'Yes, I do.',              pt: 'Sim. (eu gosto/faço)' },
            { en: 'No, she does not.',       pt: 'Não. (ela não)' },
            { en: 'Is she your friend?',     pt: 'Ela é sua amiga?' },
            { en: 'Are you a student?',      pt: 'Você é estudante?' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'yes',
              prompt: '"Do you like coffee?" — resposta curta afirmativa:',
              options: ['Yes, I do.', 'Yes, I like.', 'Yes, I am.'], correct: 0 },
            { kind: 'ver', item: 'no',
              prompt: 'Para perguntar "ela é sua amiga?" (com to be), use…',
              options: ['Is she your friend?', 'Does she your friend?', 'Do she is friend?'], correct: 0 },
            { kind: 'ouvir', item: 'speak', audio: 'Does she speak English?',
              prompt: 'O que a pessoa perguntou?',
              options: ['Se ela fala inglês', 'Se ela gosta de inglês', 'Onde ela estudou'], correct: 0 },
            { kind: 'ouvir', item: 'like', audio: 'Do you like coffee?',
              prompt: 'A pergunta é sobre…',
              options: ['gostar de café', 'fazer café', 'comprar café'], correct: 0 },
          ],
        },
      ],
    },

    /* ════════════════════════════════════════════════════════
     *  GRUPO C — ROTINA E TEMPO
     * ════════════════════════════════════════════════════════ */

    /* ────────────────────────────────────────────────────────
     *  AULA 13 — Present simple (rotina)
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-present-simple',
      group: 'C',
      title: 'Present simple — falar da sua rotina',
      icon: '☀️',
      minutes: 13,
      objective: 'Sair desta aula contando o que você faz todo dia — trabalho, estudo, refeições — com a estrutura que descreve qualquer hábito em inglês.',
      scope: {
        words: [
          { en: 'work',   pt: 'trabalhar',   phonetic: 'uôrk' },
          { en: 'study',  pt: 'estudar',     phonetic: 'STÂ-di' },
          { en: 'eat',    pt: 'comer',       phonetic: 'ít' },
          { en: 'sleep',  pt: 'dormir',      phonetic: 'slíp' },
          { en: 'every',  pt: 'todo / cada', phonetic: 'É-vri' },
          { en: 'day',    pt: 'dia',         phonetic: 'dei' },
          { en: 'morning', pt: 'manhã',      phonetic: 'MOR-ning' },
          { en: 'breakfast', pt: 'café da manhã', phonetic: 'BRÉK-fâst' },
        ],
        phrases: [
          { en: 'I work every day.',            pt: 'Eu trabalho todo dia.',          phonetic: 'ai UÔRK É-vri DÉI' },
          { en: 'I eat breakfast in the morning.', pt: 'Eu tomo café da manhã de manhã.', phonetic: 'ai ÍT BRÉK-fâst in dâ MOR-ning' },
          { en: 'We study English together.',   pt: 'Nós estudamos inglês juntos.',   phonetic: 'ui STÂ-di ÍN-glich tu-GUÉ-der' },
          { en: 'They sleep eight hours.',      pt: 'Eles dormem oito horas.',        phonetic: 'dei SLÍP eit ÁU-ers' },
          { en: 'I do not work on Sunday.',     pt: 'Eu não trabalho no domingo.',    phonetic: 'ai du nót UÔRK on SÂN-dei' },
        ],
      },
      sections: [
        {
          title: 'A fórmula do hábito: sujeito + verbo',
          explanation: 'O present simple é o tempo dos hábitos — o que você faz sempre, de rotina. A fórmula é a mais direta possível: sujeito + verbo, sem enfeite. "I <b>work</b>", "We <b>study</b>", "They <b>eat</b>". Os quatro verbos que sustentam qualquer relato de rotina: <b>work</b> (trabalhar), <b>study</b> (estudar), <b>eat</b> (comer) e <b>sleep</b> (dormir). Diferente do português, o verbo não muda de forma com I/you/we/they — é sempre a forma base. "I work", "you work", "we work", "they work": um verbo só, sem conjugação.',
          examples: [
            { en: 'I work every day.',        pt: 'Eu trabalho todo dia.' },
            { en: 'We study English.',        pt: 'Nós estudamos inglês.' },
            { en: 'They eat a lot.',          pt: 'Eles comem muito.' },
            { en: 'I sleep late on weekends.', pt: 'Eu durmo até tarde nos fins de semana.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'work',
              prompt: '"Eu trabalho todo dia" — qual o verbo de "trabalhar"?',
              options: ['work', 'study', 'sleep'], correct: 0 },
            { kind: 'ver', item: 'study',
              prompt: 'Complete: "We ___ English." (nós estudamos)',
              options: ['study', 'studies', 'studying'], correct: 0 },
            { kind: 'ouvir', item: 'sleep', audio: 'They sleep eight hours.',
              prompt: 'O que eles fazem por oito horas?',
              options: ['Dormem', 'Trabalham', 'Estudam'], correct: 0 },
            { kind: 'ouvir', item: 'eat', audio: 'I eat breakfast in the morning.',
              prompt: 'O que a pessoa faz de manhã?',
              options: ['Toma café da manhã', 'Trabalha', 'Dorme'], correct: 0 },
          ],
        },
        {
          title: 'Marcar a rotina: every day, in the morning',
          explanation: 'O que transforma uma frase em rotina são as marcas de tempo. <b>Every</b> (todo/cada) + <b>day</b> (dia) = "every day", a expressão de hábito nº 1. Para as partes do dia, use "in the <b>morning</b>" (de manhã). E o vocabulário que gruda na rotina matinal: <b>breakfast</b> (café da manhã) — literalmente "quebrar o jejum" (break + fast). Para negar a rotina, você já sabe: "I <b>do not</b> work on Sunday" — o do/does aparece de novo, agora fora da pergunta.',
          examples: [
            { en: 'I work every day.',            pt: 'Eu trabalho todo dia.' },
            { en: 'I eat breakfast in the morning.', pt: 'Eu tomo café da manhã de manhã.' },
            { en: 'She studies every morning.',   pt: 'Ela estuda toda manhã.' },
            { en: 'I do not work on Sunday.',     pt: 'Eu não trabalho no domingo.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'every',
              prompt: '"Todo dia" em inglês é…',
              options: ['every day', 'all day', 'each days'], correct: 0 },
            { kind: 'ver', item: 'breakfast',
              prompt: '"Café da manhã" em inglês é…',
              options: ['breakfast', 'morning coffee', 'first food'], correct: 0 },
            { kind: 'ouvir', item: 'day', audio: 'I work every day.',
              prompt: 'Com que frequência a pessoa trabalha?',
              options: ['Todo dia', 'Só de manhã', 'Aos domingos'], correct: 0 },
            { kind: 'ouvir', item: 'morning', audio: 'I eat breakfast in the morning.',
              prompt: 'Quando a pessoa come?',
              options: ['De manhã', 'À noite', 'À tarde'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 14 — Terceira pessoa (o S)
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-terceira-pessoa',
      group: 'C',
      title: 'A terceira pessoa pega o S — he works, she likes',
      icon: '+S',
      minutes: 12,
      objective: 'Sair desta aula sem cometer o erro mais famoso do brasileiro: esquecer o S quando ele, ela ou isso faz a ação.',
      scope: {
        words: [
          { en: 'works',  pt: 'trabalha (ele/ela)',  phonetic: 'uôrks' },
          { en: 'lives',  pt: 'mora (ele/ela)',      phonetic: 'livz' },
          { en: 'likes',  pt: 'gosta (ele/ela)',     phonetic: 'laiks' },
          { en: 'goes',   pt: 'vai (ele/ela)',       phonetic: 'gôuz' },
          { en: 'watches', pt: 'assiste (ele/ela)',  phonetic: 'UÓT-chiz' },
          { en: 'school', pt: 'escola',              phonetic: 'skúl' },
          { en: 'movie',  pt: 'filme',               phonetic: 'MÚ-vi' },
          { en: 'city',   pt: 'cidade',              phonetic: 'CI-ti' },
        ],
        phrases: [
          { en: 'He works in a big city.',      pt: 'Ele trabalha numa cidade grande.', phonetic: 'ri UÔRKS in â big CI-ti' },
          { en: 'She lives near the school.',   pt: 'Ela mora perto da escola.',        phonetic: 'chi LIVZ nír dâ SKÚL' },
          { en: 'He likes action movies.',      pt: 'Ele gosta de filmes de ação.',     phonetic: 'ri LAIKS ÉK-chân MÚ-viz' },
          { en: 'She goes to school by bus.',   pt: 'Ela vai para a escola de ônibus.', phonetic: 'chi GÔUZ tu SKÚL bai bâs' },
          { en: 'He watches a movie every night.', pt: 'Ele assiste um filme toda noite.', phonetic: 'ri UÓT-chiz â MÚ-vi É-vri nait' },
        ],
      },
      sections: [
        {
          title: 'A regra do S — só na terceira pessoa',
          explanation: 'Aqui está a única exceção do present simple, e o erro nº 1 do brasileiro. Quando quem faz a ação é <b>he, she ou it</b>, o verbo ganha um <b>-s</b> no final. "I work" mas "he <b>works</b>". "I live" mas "she <b>lives</b>". "I like" mas "he <b>likes</b>". Só nessas três pessoas — em todas as outras (I, you, we, they) o verbo fica limpo. Pense assim: ele, ela e isso "roubam" o S do sujeito e colam no verbo. Guarde também <b>city</b> (cidade) e <b>school</b> (escola), cenários dessas frases.',
          examples: [
            { en: 'He works in a big city.',    pt: 'Ele trabalha numa cidade grande.' },
            { en: 'She lives near the school.', pt: 'Ela mora perto da escola.' },
            { en: 'He likes action movies.',    pt: 'Ele gosta de filmes de ação.' },
            { en: 'She works from home.',       pt: 'Ela trabalha de casa.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'works',
              prompt: 'Complete: "He ___ in a bank." (ele trabalha)',
              options: ['works', 'work', 'working'], correct: 0 },
            { kind: 'ver', item: 'likes',
              prompt: '"Ela gosta de café" em inglês é…',
              options: ['She likes coffee', 'She like coffee', 'She likes coffees'], correct: 0 },
            { kind: 'ouvir', item: 'lives', audio: 'She lives near the school.',
              prompt: 'O que a pessoa contou sobre ela?',
              options: ['Onde ela mora', 'Onde ela trabalha', 'O que ela estuda'], correct: 0 },
            { kind: 'ouvir', item: 'city', audio: 'He works in a big city.',
              prompt: 'Onde ele trabalha?',
              options: ['Numa cidade grande', 'Numa escola', 'Em casa'], correct: 0 },
          ],
        },
        {
          title: 'Quando o S vira -es: goes, watches',
          explanation: 'Alguns verbos precisam de um empurrãozinho a mais. Quando o verbo termina em som "sh, ch, s, x, o", em vez de só -s ele ganha <b>-es</b> para ficar pronunciável. "go" vira <b>goes</b> (não "gos"), "watch" vira <b>watches</b> (não "watchs"). É só uma questão de conseguir falar — tente dizer "watchs" e você vai sentir por que o inglês inventou o -es. Guarde <b>goes</b> (vai), <b>watches</b> (assiste) e a palavra <b>movie</b> (filme) — "he watches a movie" é a frase da noite de todo mundo.',
          examples: [
            { en: 'She goes to school by bus.',      pt: 'Ela vai para a escola de ônibus.' },
            { en: 'He watches a movie every night.', pt: 'Ele assiste um filme toda noite.' },
            { en: 'She goes to work early.',         pt: 'Ela vai trabalhar cedo.' },
            { en: 'He watches the news.',            pt: 'Ele assiste o noticiário.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'goes',
              prompt: '"Ir" (go) na terceira pessoa vira…',
              options: ['goes', 'gos', 'going'], correct: 0 },
            { kind: 'ver', item: 'watches',
              prompt: 'Por que "watch" vira "watches" e não "watchs"?',
              options: ['Para ficar pronunciável (som -ch)', 'É opcional', 'Está errado, é watchs'], correct: 0 },
            { kind: 'ouvir', item: 'movie', audio: 'He watches a movie every night.',
              prompt: 'O que ele assiste?',
              options: ['Um filme', 'O jornal', 'Um jogo'], correct: 0 },
            { kind: 'ouvir', item: 'school', audio: 'She goes to school by bus.',
              prompt: 'Como ela vai para a escola?',
              options: ['De ônibus', 'A pé', 'De carro'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 15 — Frequência
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-frequencia',
      group: 'C',
      title: 'Frequência — sempre, às vezes, nunca',
      icon: '🔁',
      minutes: 12,
      objective: 'Sair desta aula dizendo COM QUE frequência você faz as coisas — e colocando essas palavrinhas no lugar certo da frase, que não é o mesmo do português.',
      scope: {
        words: [
          { en: 'always',    pt: 'sempre',      phonetic: 'ÓL-uêiz' },
          { en: 'usually',   pt: 'geralmente',  phonetic: 'IÚ-ju-a-li' },
          { en: 'sometimes', pt: 'às vezes',    phonetic: 'SÂM-taimz' },
          { en: 'never',     pt: 'nunca',       phonetic: 'NÉ-ver' },
          { en: 'often',     pt: 'frequentemente', phonetic: 'ÓF-en' },
          { en: 'late',      pt: 'tarde / atrasado', phonetic: 'leit' },
          { en: 'early',     pt: 'cedo',        phonetic: 'ÊR-li' },
          { en: 'tea',       pt: 'chá',         phonetic: 'tí' },
        ],
        phrases: [
          { en: 'I always drink coffee.',       pt: 'Eu sempre bebo café.',            phonetic: 'ai ÓL-uêiz drink KÓ-fi' },
          { en: 'She usually wakes up early.',  pt: 'Ela geralmente acorda cedo.',     phonetic: 'chi IÚ-ju-a-li uêiks ÂP ÊR-li' },
          { en: 'We sometimes drink tea.',      pt: 'Nós às vezes bebemos chá.',       phonetic: 'ui SÂM-taimz drink TÍ' },
          { en: 'He never arrives late.',       pt: 'Ele nunca chega atrasado.',       phonetic: 'ri NÉ-ver a-RÁIVZ leit' },
          { en: 'I often work early.',          pt: 'Eu frequentemente trabalho cedo.', phonetic: 'ai ÓF-en uôrk ÊR-li' },
        ],
      },
      sections: [
        {
          title: 'A escala: always, usually, sometimes, never',
          explanation: 'As palavras de frequência formam uma escala do 100% ao 0%. No topo, <b>always</b> (sempre). Um pouco abaixo, <b>usually</b> (geralmente) e <b>often</b> (frequentemente). No meio, <b>sometimes</b> (às vezes). E lá no fundo, <b>never</b> (nunca). Um detalhe que confunde: em inglês, "never" já é a negação — você NÃO usa "not" junto. "He <b>never</b> arrives late" (não é "doesn\'t never"). Dizer "I don\'t never" é erro clássico — o never sozinho já nega tudo.',
          examples: [
            { en: 'I always drink coffee.',      pt: 'Eu sempre bebo café.' },
            { en: 'She usually wakes up early.', pt: 'Ela geralmente acorda cedo.' },
            { en: 'We sometimes go out.',        pt: 'Nós às vezes saímos.' },
            { en: 'He never arrives late.',      pt: 'Ele nunca chega atrasado.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'always',
              prompt: '100% das vezes — que palavra usar?',
              options: ['always', 'never', 'sometimes'], correct: 0 },
            { kind: 'ver', item: 'never',
              prompt: '"Ele nunca chega atrasado" — como se diz "nunca"?',
              options: ['He never arrives', "He doesn't never arrives", 'He not never arrives'], correct: 0 },
            { kind: 'ouvir', item: 'sometimes', audio: 'We sometimes drink tea.',
              prompt: 'Com que frequência eles bebem chá?',
              options: ['Às vezes', 'Sempre', 'Nunca'], correct: 0 },
            { kind: 'ouvir', item: 'usually', audio: 'She usually wakes up early.',
              prompt: 'A palavra "usually" significa…',
              options: ['geralmente', 'nunca', 'às vezes'], correct: 0 },
          ],
        },
        {
          title: 'Onde colocar: antes do verbo, depois do to be',
          explanation: 'A regra de posição derruba muito brasileiro. Com verbo normal, a palavra de frequência vem ANTES do verbo: "I <b>always</b> drink coffee" (não "I drink always"). Com o to be, ela vem DEPOIS: "She is <b>always</b> late". Guarde: verbo comum → frequência antes; to be → frequência depois. Vocabulário útil para completar as frases: <b>early</b> (cedo), <b>late</b> (tarde/atrasado) e <b>tea</b> (chá), o parceiro do café nas rotinas. <b>Often</b> (frequentemente) também segue a mesma regra de posição.',
          examples: [
            { en: 'I often work early.',         pt: 'Eu frequentemente trabalho cedo.' },
            { en: 'He is always late.',          pt: 'Ele está sempre atrasado.' },
            { en: 'We sometimes drink tea.',     pt: 'Nós às vezes bebemos chá.' },
            { en: 'She never wakes up late.',    pt: 'Ela nunca acorda tarde.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'often',
              prompt: 'Onde vai "often" com verbo comum? "I ___ work"',
              options: ['I often work (antes do verbo)', 'I work often (no fim)', 'Often I work often'], correct: 0 },
            { kind: 'ver', item: 'late',
              prompt: '"Ele está sempre atrasado" (com to be) — onde vai o "always"?',
              options: ['He is always late (depois do is)', 'He always is late', 'Always he is late'], correct: 0 },
            { kind: 'ouvir', item: 'early', audio: 'She usually wakes up early.',
              prompt: 'Quando ela acorda?',
              options: ['Cedo', 'Tarde', 'Ao meio-dia'], correct: 0 },
            { kind: 'ouvir', item: 'tea', audio: 'We sometimes drink tea.',
              prompt: 'O que eles bebem às vezes?',
              options: ['Chá', 'Café', 'Água'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 16 — Lugares e rotina completa
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-lugares-rotina',
      group: 'C',
      title: 'Lugares e rotina — para onde você vai o dia todo',
      icon: '🏠',
      minutes: 13,
      objective: 'Sair desta aula descrevendo um dia inteiro — de casa ao trabalho, do almoço à volta pra casa — juntando lugares e a preposição certa para chegar em cada um.',
      scope: {
        words: [
          { en: 'home',   pt: 'casa (lar)',    phonetic: 'rôum' },
          { en: 'work',   pt: 'trabalho',      phonetic: 'uôrk' },
          { en: 'gym',    pt: 'academia',      phonetic: 'djim' },
          { en: 'store',  pt: 'loja / mercado', phonetic: 'stór' },
          { en: 'go',     pt: 'ir',            phonetic: 'gôu' },
          { en: 'come',   pt: 'vir / voltar',  phonetic: 'kâm' },
          { en: 'stay',   pt: 'ficar',         phonetic: 'stêi' },
          { en: 'lunch',  pt: 'almoço',        phonetic: 'lântch' },
        ],
        phrases: [
          { en: 'I go to work in the morning.', pt: 'Eu vou trabalhar de manhã.',      phonetic: 'ai GÔU tu UÔRK in dâ MOR-ning' },
          { en: 'She goes to the gym after work.', pt: 'Ela vai à academia depois do trabalho.', phonetic: 'chi GÔUZ tu dâ DJIM áf-ter uôrk' },
          { en: 'We have lunch at the store.',  pt: 'Nós almoçamos na loja.',          phonetic: 'ui rév LÂNTCH ét dâ STÓR' },
          { en: 'I come home late.',            pt: 'Eu volto para casa tarde.',       phonetic: 'ai kâm RÔUM leit' },
          { en: 'They stay home on Sunday.',    pt: 'Eles ficam em casa no domingo.',  phonetic: 'dei STÊI RÔUM on SÂN-dei' },
        ],
      },
      sections: [
        {
          title: 'Os lugares do dia e a mágica do "home"',
          explanation: 'Os lugares que preenchem qualquer rotina: <b>work</b> (trabalho), <b>gym</b> (academia), <b>store</b> (loja/mercado) e <b>home</b> (casa). Quase todos pedem "to the" para chegar: "to the gym", "to the store". Mas <b>home</b> é a estrela rebelde: com ele você NÃO usa "to the" — é só "go <b>home</b>" (não "go to the home"). Home é ao mesmo tempo o lugar e a direção. Guarde: "I go <b>home</b>" (vou pra casa), mas "I go <b>to the</b> gym" (vou à academia).',
          examples: [
            { en: 'I go to work in the morning.',   pt: 'Eu vou trabalhar de manhã.' },
            { en: 'She goes to the gym.',           pt: 'Ela vai à academia.' },
            { en: 'I go home after work.',          pt: 'Eu vou pra casa depois do trabalho.' },
            { en: 'We go to the store on Saturday.', pt: 'Vamos ao mercado no sábado.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'home',
              prompt: '"Vou pra casa" em inglês é…',
              options: ['I go home', 'I go to the home', 'I go at home'], correct: 0 },
            { kind: 'ver', item: 'gym',
              prompt: '"Vou à academia" em inglês é…',
              options: ['I go to the gym', 'I go gym', 'I go home gym'], correct: 0 },
            { kind: 'ouvir', item: 'work', audio: 'I go to work in the morning.',
              prompt: 'Para onde a pessoa vai de manhã?',
              options: ['Para o trabalho', 'Para a academia', 'Para o mercado'], correct: 0 },
            { kind: 'ouvir', item: 'store', audio: 'We have lunch at the store.',
              prompt: 'Onde eles almoçam?',
              options: ['Na loja', 'Em casa', 'Na academia'], correct: 0 },
          ],
        },
        {
          title: 'Ir, vir, ficar: go, come, stay',
          explanation: 'Três verbos movimentam o dia todo. <b>Go</b> (ir) afasta de você: "I go to work". <b>Come</b> (vir/voltar) aproxima: "I <b>come</b> home" (venho/volto pra casa). A diferença é o ponto de vista — go sai, come chega. E <b>stay</b> (ficar) é o oposto de mover: "They <b>stay</b> home on Sunday". Uma refeição fecha o vocabulário do dia: <b>lunch</b> (almoço) — "have lunch" é a forma certa (o inglês "tem" as refeições, não "come" elas literalmente).',
          examples: [
            { en: 'I come home late.',           pt: 'Eu volto para casa tarde.' },
            { en: 'They stay home on Sunday.',   pt: 'Eles ficam em casa no domingo.' },
            { en: 'We have lunch at noon.',      pt: 'Nós almoçamos ao meio-dia.' },
            { en: 'Come here, please.',          pt: 'Venha aqui, por favor.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'come',
              prompt: '"Eu volto para casa" usa qual verbo?',
              options: ['come home', 'go home', 'stay home'], correct: 0 },
            { kind: 'ver', item: 'stay',
              prompt: '"Ficar em casa" em inglês é…',
              options: ['stay home', 'go home', 'come home'], correct: 0 },
            { kind: 'ouvir', item: 'lunch', audio: 'We have lunch at the store.',
              prompt: 'O que eles fazem na loja?',
              options: ['Almoçam', 'Dormem', 'Compram roupa'], correct: 0 },
            { kind: 'ouvir', item: 'go', audio: 'I go to work in the morning.',
              prompt: 'O verbo "go" significa…',
              options: ['ir', 'ficar', 'voltar'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 17 — WH questions
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-wh-questions',
      group: 'C',
      title: 'WH questions — o quê, onde, quando, por quê',
      icon: 'WH',
      minutes: 13,
      objective: 'Sair desta aula fazendo perguntas abertas de verdade — as que não se respondem com sim ou não — para puxar conversa com qualquer pessoa.',
      scope: {
        words: [
          { en: 'what',  pt: 'o que / qual',  phonetic: 'uót' },
          { en: 'where', pt: 'onde',          phonetic: 'uér' },
          { en: 'when',  pt: 'quando',        phonetic: 'uén' },
          { en: 'who',   pt: 'quem',          phonetic: 'ru' },
          { en: 'why',   pt: 'por quê',       phonetic: 'uái' },
          { en: 'how',   pt: 'como',          phonetic: 'rau' },
          { en: 'because', pt: 'porque',      phonetic: 'bi-KÓZ' },
          { en: 'want',  pt: 'querer',        phonetic: 'uónt' },
        ],
        phrases: [
          { en: 'What do you want?',           pt: 'O que você quer?',              phonetic: 'uót du iu UÓNT' },
          { en: 'Where do you live?',          pt: 'Onde você mora?',               phonetic: 'uér du iu LIV' },
          { en: 'When and how does the store open?', pt: 'Quando e como a loja abre?', phonetic: 'uén end RAU dâz dâ STÓR ÔU-pen' },
          { en: 'Who is here and why?',        pt: 'Quem está aqui e por quê?',     phonetic: 'RU iz rír end UÁI' },
          { en: 'Because I want to learn.',    pt: 'Porque eu quero aprender.',     phonetic: 'bi-KÓZ ai UÓNT tu LÔRN' },
        ],
      },
      sections: [
        {
          title: 'As seis palavras que abrem tudo',
          explanation: 'As WH questions são as perguntas abertas — pedem informação, não um sim/não. São seis: <b>what</b> (o quê), <b>where</b> (onde), <b>when</b> (quando), <b>who</b> (quem), <b>why</b> (por quê) e a intrusa <b>how</b> (como, que não tem WH mas entra no grupo). A estrutura é: palavra WH + do/does + resto. "<b>What</b> do you want?", "<b>Where</b> do you live?". Com he/she/it, entra o does: "<b>When</b> <b>does</b> she work?". A palavra WH vem sempre na frente, puxando a pergunta.',
          examples: [
            { en: 'What do you want?',        pt: 'O que você quer?' },
            { en: 'Where do you live?',       pt: 'Onde você mora?' },
            { en: 'Who is that man?',         pt: 'Quem é aquele homem?' },
            { en: 'How are you?',             pt: 'Como você está?' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'where',
              prompt: 'Para perguntar ONDE alguém mora, comece com…',
              options: ['Where', 'What', 'When'], correct: 0 },
            { kind: 'ver', item: 'what',
              prompt: '"O que você quer?" começa com…',
              options: ['What', 'Who', 'Why'], correct: 0 },
            { kind: 'ouvir', item: 'who', audio: 'Who is that man?',
              prompt: 'O que a pessoa quer saber?',
              options: ['Quem é o homem', 'Onde ele está', 'O que ele faz'], correct: 0 },
            { kind: 'ouvir', item: 'how', audio: 'How are you?',
              prompt: 'A pergunta "how are you" quer saber…',
              options: ['como você está', 'onde você está', 'quando você chega'], correct: 0 },
          ],
        },
        {
          title: 'Perguntar por quê e responder com because',
          explanation: '<b>Why</b> (por quê) é a WH que puxa explicação — e a resposta natural vem com <b>because</b> (porque). "<b>Why</b> are you here?" → "<b>Because</b> I want to learn". Repare que "why" (por quê, pergunta) e "because" (porque, resposta) são pares fixos, igual em português. E surge o verbo <b>want</b> (querer), que aparece em toda conversa de intenção: "what do you <b>want</b>?", "I <b>want</b> to learn". Guarde a dupla: pergunta com why, responde com because.',
          examples: [
            { en: 'Why are you here?',           pt: 'Por que você está aqui?' },
            { en: 'Because I want to learn.',    pt: 'Porque eu quero aprender.' },
            { en: 'Why do you study English?',   pt: 'Por que você estuda inglês?' },
            { en: 'I want coffee.',              pt: 'Eu quero café.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'why',
              prompt: 'Para perguntar o MOTIVO de algo, use…',
              options: ['Why', 'When', 'Where'], correct: 0 },
            { kind: 'ver', item: 'because',
              prompt: 'A resposta para "Why?" geralmente começa com…',
              options: ['Because', 'Why', 'What'], correct: 0 },
            { kind: 'ouvir', item: 'want', audio: 'What do you want?',
              prompt: 'O que a pessoa perguntou?',
              options: ['O que você quer', 'Onde você está', 'Quem é você'], correct: 0 },
            { kind: 'ouvir', item: 'because', audio: 'Because I want to learn.',
              prompt: 'A pessoa está…',
              options: ['dando um motivo', 'fazendo uma pergunta', 'se despedindo'], correct: 0 },
          ],
        },
      ],
    },

    /* ════════════════════════════════════════════════════════
     *  GRUPO D — PASSADO E DESEJOS
     * ════════════════════════════════════════════════════════ */

    /* ────────────────────────────────────────────────────────
     *  AULA 18 — Passado regular (-ed)
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-passado',
      group: 'D',
      title: 'Passado — contar o que você fez',
      icon: 'ED',
      minutes: 13,
      objective: 'Sair desta aula contando o que aconteceu ontem — trabalhei, estudei, joguei — com a regra do -ed e os poucos verbos irregulares que você não escapa de usar.',
      scope: {
        words: [
          { en: 'worked',  pt: 'trabalhei/trabalhou', phonetic: 'uôrkt' },
          { en: 'studied', pt: 'estudei/estudou',     phonetic: 'STÂ-did' },
          { en: 'played',  pt: 'joguei/brinquei',     phonetic: 'pleid' },
          { en: 'went',    pt: 'fui/foi (ir)',        phonetic: 'uént' },
          { en: 'saw',     pt: 'vi/viu (ver)',        phonetic: 'só' },
          { en: 'yesterday', pt: 'ontem',             phonetic: 'IÉS-ter-dei' },
          { en: 'ago',     pt: 'atrás (tempo)',       phonetic: 'a-GÔU' },
          { en: 'last',    pt: 'último / passado',    phonetic: 'lést' },
        ],
        phrases: [
          { en: 'I worked yesterday.',          pt: 'Eu trabalhei ontem.',            phonetic: 'ai UÔRKT IÉS-ter-dei' },
          { en: 'She studied last night.',      pt: 'Ela estudou ontem à noite.',     phonetic: 'chi STÂ-did lést nait' },
          { en: 'We played two hours ago.',     pt: 'Nós jogamos duas horas atrás.',  phonetic: 'ui PLEID tchu ÁU-ers a-GÔU' },
          { en: 'I went to the store.',         pt: 'Eu fui à loja.',                 phonetic: 'ai UÉNT tu dâ STÓR' },
          { en: 'He saw a good movie.',         pt: 'Ele viu um bom filme.',          phonetic: 'ri SÓ â gud MÚ-vi' },
        ],
      },
      sections: [
        {
          title: 'A regra do -ed: passado dos verbos comuns',
          explanation: 'Para colocar quase qualquer verbo no passado, o inglês faz uma coisa só: adiciona <b>-ed</b> no final. "work" → <b>worked</b>, "play" → <b>played</b>, "study" → <b>studied</b> (o y vira i antes do -ed). E o melhor: vale para TODAS as pessoas, sem exceção. "I worked", "she worked", "they worked" — o mesmo -ed para todo mundo, sem o S da terceira pessoa. As marcas de tempo confirmam que é passado: <b>yesterday</b> (ontem) é a mais comum — "I worked <b>yesterday</b>".',
          examples: [
            { en: 'I worked yesterday.',       pt: 'Eu trabalhei ontem.' },
            { en: 'She studied a lot.',        pt: 'Ela estudou muito.' },
            { en: 'They played football.',     pt: 'Eles jogaram futebol.' },
            { en: 'We worked together.',       pt: 'Nós trabalhamos juntos.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'worked',
              prompt: '"Trabalhar" (work) no passado é…',
              options: ['worked', 'worket', 'worksed'], correct: 0 },
            { kind: 'ver', item: 'studied',
              prompt: '"Estudar" (study) no passado é…',
              options: ['studied', 'studyed', 'studed'], correct: 0 },
            { kind: 'ouvir', item: 'yesterday', audio: 'I worked yesterday.',
              prompt: 'Quando a pessoa trabalhou?',
              options: ['Ontem', 'Hoje', 'Amanhã'], correct: 0 },
            { kind: 'ouvir', item: 'played', audio: 'We played two hours ago.',
              prompt: 'O que eles fizeram?',
              options: ['Jogaram', 'Estudaram', 'Trabalharam'], correct: 0 },
          ],
        },
        {
          title: 'Os irregulares que você não escapa: went, saw',
          explanation: 'Alguns verbos são teimosos: não seguem o -ed e mudam de forma. São poucos, mas os mais usados do mundo. "go" (ir) no passado é <b>went</b> (não "goed"): "I <b>went</b> to the store". "see" (ver) vira <b>saw</b> (não "seed"): "He <b>saw</b> a movie". Não tem regra — é decorar os principais, e esses dois estão no topo. Mais marcas de tempo passado: <b>ago</b> (atrás) — "two hours <b>ago</b>" — e <b>last</b> (último/passado) — "<b>last</b> night" (ontem à noite), "last week" (semana passada).',
          examples: [
            { en: 'I went to the store.',      pt: 'Eu fui à loja.' },
            { en: 'He saw a good movie.',      pt: 'Ele viu um bom filme.' },
            { en: 'She studied last night.',   pt: 'Ela estudou ontem à noite.' },
            { en: 'We went home an hour ago.', pt: 'Fomos pra casa uma hora atrás.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'went',
              prompt: '"Ir" (go) no passado é…',
              options: ['went', 'goed', 'gone'], correct: 0 },
            { kind: 'ver', item: 'saw',
              prompt: '"Ver" (see) no passado é…',
              options: ['saw', 'seed', 'sawed'], correct: 0 },
            { kind: 'ouvir', item: 'last', audio: 'She studied last night.',
              prompt: 'Quando ela estudou?',
              options: ['Ontem à noite', 'Esta manhã', 'Agora'], correct: 0 },
            { kind: 'ouvir', item: 'ago', audio: 'We played two hours ago.',
              prompt: '"Two hours ago" significa…',
              options: ['duas horas atrás', 'daqui a duas horas', 'por duas horas'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 19 — Passado: perguntas e negações
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-passado-perguntas',
      group: 'D',
      title: 'Passado — perguntar e negar com "did"',
      icon: 'D?',
      minutes: 13,
      objective: 'Sair desta aula perguntando e negando no passado com uma palavra mágica só: did. E entendendo por que o verbo volta ao normal quando ela aparece.',
      scope: {
        words: [
          { en: 'did',     pt: 'fez (auxiliar de passado)', phonetic: 'did' },
          { en: "didn't",  pt: 'não fez',        phonetic: 'DÍ-dent' },
          { en: 'call',    pt: 'ligar / chamar', phonetic: 'kól' },
          { en: 'finish',  pt: 'terminar',       phonetic: 'FÍ-nich' },
          { en: 'sleep',   pt: 'dormir',         phonetic: 'slíp' },
          { en: 'enjoy',   pt: 'curtir / gostar', phonetic: 'in-DJÓI' },
          { en: 'trip',    pt: 'viagem',         phonetic: 'trip' },
          { en: 'well',    pt: 'bem',            phonetic: 'uél' },
        ],
        phrases: [
          { en: 'Did you call her?',            pt: 'Você ligou para ela?',           phonetic: 'did iu KÓL rêr' },
          { en: "I didn't finish the work.",    pt: 'Eu não terminei o trabalho.',    phonetic: 'ai DÍ-dent FÍ-nich dâ uôrk' },
          { en: 'Did they enjoy the trip?',     pt: 'Eles curtiram a viagem?',        phonetic: 'did dei in-DJÓI dâ TRIP' },
          { en: "She didn't sleep well.",       pt: 'Ela não dormiu bem.',            phonetic: 'chi DÍ-dent SLÍP uél' },
          { en: 'Did you sleep well?',          pt: 'Você dormiu bem?',               phonetic: 'did iu SLÍP uél' },
        ],
      },
      sections: [
        {
          title: 'Perguntar no passado: did abre tudo',
          explanation: 'No passado, perguntar fica surpreendentemente fácil: uma palavra só, <b>did</b>, abre qualquer pergunta — para todas as pessoas. "<b>Did</b> you call her?", "<b>Did</b> they enjoy the trip?". E aqui vem o pulo do gato: quando o "did" aparece, o verbo VOLTA à forma base, sem -ed. É "Did you <b>call</b>?" (não "did you called"). O "did" já carrega o passado, então o verbo relaxa. Guarde os verbos <b>call</b> (ligar/chamar), <b>enjoy</b> (curtir) e a palavra <b>trip</b> (viagem), tema clássico de "did you enjoy...?".',
          examples: [
            { en: 'Did you call her?',         pt: 'Você ligou para ela?' },
            { en: 'Did they enjoy the trip?',  pt: 'Eles curtiram a viagem?' },
            { en: 'Did he finish the work?',   pt: 'Ele terminou o trabalho?' },
            { en: 'Did you sleep well?',       pt: 'Você dormiu bem?' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'did',
              prompt: 'Para perguntar no passado, comece com…',
              options: ['Did', 'Do', 'Does'], correct: 0 },
            { kind: 'ver', item: 'call',
              prompt: 'Certo: "Did you ___ her?" (você ligou?)',
              options: ['call', 'called', 'calls'], correct: 0 },
            { kind: 'ouvir', item: 'trip', audio: 'Did they enjoy the trip?',
              prompt: 'A pergunta é sobre…',
              options: ['a viagem', 'o trabalho', 'a comida'], correct: 0 },
            { kind: 'ouvir', item: 'enjoy', audio: 'Did they enjoy the trip?',
              prompt: 'O que a pessoa quis saber?',
              options: ['Se eles curtiram', 'Quando eles voltaram', 'Quanto custou'], correct: 0 },
          ],
        },
        {
          title: "Negar no passado: didn't",
          explanation: 'Para negar no passado, o "did" vira <b>didn\'t</b> (did + not) — e serve para todas as pessoas, sem exceção. "I <b>didn\'t</b> finish", "she <b>didn\'t</b> sleep", "they <b>didn\'t</b> call". Mesma regra da pergunta: com o didn\'t, o verbo volta ao básico, sem -ed. É "she <b>didn\'t sleep</b>" (não "didn\'t slept"). Guarde <b>finish</b> (terminar), <b>sleep</b> (dormir) e o advérbio <b>well</b> (bem) — "didn\'t sleep well" (não dormiu bem) é reclamação matinal universal.',
          examples: [
            { en: "I didn't finish the work.",  pt: 'Eu não terminei o trabalho.' },
            { en: "She didn't sleep well.",     pt: 'Ela não dormiu bem.' },
            { en: "They didn't call me.",       pt: 'Eles não me ligaram.' },
            { en: "He didn't enjoy the movie.", pt: 'Ele não curtiu o filme.' },
          ],
          checkpoint: [
            { kind: 'ver', item: "didn't",
              prompt: 'Para negar no passado, use…',
              options: ["didn't", "doesn't", "isn't"], correct: 0 },
            { kind: 'ver', item: 'finish',
              prompt: 'Certo: "I didn\'t ___ the work." (não terminei)',
              options: ['finish', 'finished', 'finishes'], correct: 0 },
            { kind: 'ouvir', item: 'well', audio: "She didn't sleep well.",
              prompt: 'Como ela dormiu?',
              options: ['Não dormiu bem', 'Dormiu muito bem', 'Dormiu cedo'], correct: 0 },
            { kind: 'ouvir', item: 'sleep', audio: 'Did you sleep well?',
              prompt: 'O que a pessoa perguntou?',
              options: ['Se você dormiu bem', 'Se você comeu', 'Se você trabalhou'], correct: 0 },
          ],
        },
      ],
    },

    /* ────────────────────────────────────────────────────────
     *  AULA 20 — Want to / like + ing
     * ──────────────────────────────────────────────────────── */
    {
      slug: '4p-want-like',
      group: 'D',
      title: 'Querer e gostar — want to e like + ing',
      icon: '💚',
      minutes: 13,
      objective: 'Sair desta aula dizendo o que você quer fazer e o que você gosta de fazer — as duas estruturas que expressam vontade e preferência, cada uma com sua regra.',
      scope: {
        words: [
          { en: 'want',   pt: 'querer',       phonetic: 'uónt' },
          { en: 'like',   pt: 'gostar',       phonetic: 'laik' },
          { en: 'love',   pt: 'amar / adorar', phonetic: 'lâv' },
          { en: 'need',   pt: 'precisar',     phonetic: 'níd' },
          { en: 'learn',  pt: 'aprender',     phonetic: 'lôrn' },
          { en: 'travel', pt: 'viajar',       phonetic: 'TRÉ-vel' },
          { en: 'cook',   pt: 'cozinhar',     phonetic: 'kuk' },
          { en: 'dance',  pt: 'dançar',       phonetic: 'déns' },
        ],
        phrases: [
          { en: 'I want to learn and travel.',  pt: 'Eu quero aprender e viajar.',    phonetic: 'ai UÓNT tu LÔRN end TRÉ-vel' },
          { en: 'I like to cook every day.',    pt: 'Eu gosto de cozinhar todo dia.', phonetic: 'ai LAIK tu KUK É-vri dei' },
          { en: 'We love to dance together.',   pt: 'Nós amamos dançar juntos.',      phonetic: 'ui LÂV tu DÉNS tu-GUÉ-der' },
          { en: 'I need to work today.',        pt: 'Eu preciso trabalhar hoje.',     phonetic: 'ai NÍD tu UÔRK tu-DÉI' },
          { en: 'She likes cooking.',           pt: 'Ela gosta de cozinhar.',         phonetic: 'chi LAIKS KÚ-king' },
        ],
      },
      sections: [
        {
          title: 'Vontade e necessidade: want to, need to',
          explanation: 'Para dizer que você QUER ou PRECISA fazer algo, o inglês usa o verbo + <b>to</b> + outro verbo. <b>want</b> (querer) + to: "I <b>want to</b> learn" (quero aprender). <b>need</b> (precisar) + to: "I <b>need to</b> work" (preciso trabalhar). O "to" aqui é a ponte obrigatória entre os dois verbos — não some. Cuidado com o erro clássico: não é "I want learn", é "I want <b>to</b> learn". Guarde os verbos que vêm depois: <b>learn</b> (aprender) e <b>travel</b> (viajar) — "I want to travel" é o sonho mais dito do planeta.',
          examples: [
            { en: 'I want to learn English.',  pt: 'Eu quero aprender inglês.' },
            { en: 'I need to work today.',     pt: 'Eu preciso trabalhar hoje.' },
            { en: 'She wants to travel.',      pt: 'Ela quer viajar.' },
            { en: 'We need to go now.',        pt: 'Precisamos ir agora.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'want',
              prompt: '"Eu quero aprender" em inglês é…',
              options: ['I want to learn', 'I want learn', 'I want learning'], correct: 0 },
            { kind: 'ver', item: 'need',
              prompt: 'Certo: "I ___ to work today." (preciso)',
              options: ['need', 'want to need', 'needing'], correct: 0 },
            { kind: 'ouvir', item: 'learn', audio: 'I want to learn English.',
              prompt: 'O que a pessoa quer fazer?',
              options: ['Aprender inglês', 'Ensinar inglês', 'Viajar'], correct: 0 },
            { kind: 'ouvir', item: 'travel', audio: 'She wants to travel.',
              prompt: 'O que ela quer?',
              options: ['Viajar', 'Trabalhar', 'Cozinhar'], correct: 0 },
          ],
        },
        {
          title: 'Preferência: like, love + verbo com -ing',
          explanation: 'Aqui muda a regra! Para dizer o que você GOSTA ou AMA de fazer, o jeito mais natural é o verbo seguinte com <b>-ing</b>. <b>like</b> (gostar): "I like <b>cooking</b>". <b>love</b> (amar/adorar): "I love <b>dancing</b>". Compare com o grupo anterior: "want <b>to</b> travel" (querer viajar), mas "love <b>cooking</b>" (amar cozinhar). Um alívio: com like e love, o inglês também aceita o "to" ("I like <b>to</b> cook") — as duas formas são corretas. Já com want e need, só o "to" funciona. Guarde os verbos de prazer: <b>cook</b> (cozinhar) e <b>dance</b> (dançar).',
          examples: [
            { en: 'She likes cooking.',        pt: 'Ela gosta de cozinhar.' },
            { en: 'I like to cook every day.', pt: 'Eu gosto de cozinhar todo dia.' },
            { en: 'We love to dance together.', pt: 'Nós amamos dançar juntos.' },
            { en: 'I love learning English.',  pt: 'Eu adoro aprender inglês.' },
          ],
          checkpoint: [
            { kind: 'ver', item: 'like',
              prompt: '"Ela gosta de cozinhar" em inglês é…',
              options: ['She likes cooking', 'She likes to cooking', 'She like cook'], correct: 0 },
            { kind: 'ver', item: 'love',
              prompt: 'Depois de "love", o verbo vem com…',
              options: ['-ing (love traveling)', 'to (love to)', 'nada'], correct: 0 },
            { kind: 'ouvir', item: 'cook', audio: 'She likes cooking.',
              prompt: 'Do que ela gosta?',
              options: ['De cozinhar', 'De dançar', 'De viajar'], correct: 0 },
            { kind: 'ouvir', item: 'dance', audio: 'They like dancing.',
              prompt: 'Do que eles gostam?',
              options: ['De dançar', 'De cozinhar', 'De cantar'], correct: 0 },
          ],
        },
      ],
    },

  ];
})();
