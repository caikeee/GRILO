/* ============================================================
 *  Shadowing Lab — DADOS (piloto: 3 faixas)
 *  ============================================================
 *  Trilha LINEAR: a faixa N só libera após completar a N-1 em
 *  modo Ranqueada (RANKED) com score >= score mínimo vigente.
 *
 *  Cada faixa é uma NARRAÇÃO EM PRIMEIRA PESSOA — um único
 *  falante contando uma micro-rotina, num fluxo contínuo de
 *  fala. NÃO é diálogo de turnos (isso quebra a prosódia e o
 *  ritmo que o shadowing treina): sem troca de interlocutor,
 *  as ideias encadeiam com conectores (so, then, because, and).
 *  Pensado pra shadowing SIMULTÂNEO (o áudio nativo toca e o
 *  aluno fala por cima, sem pausar).
 *
 *  sentences[]: cada item é uma "respiração" do texto corrido
 *  (inglês + tradução), na ordem em que aparece no áudio. A
 *  quebra em frases é só pra tradução/leitura — o áudio é lido
 *  emendado, como um monólogo natural.
 * ============================================================ */
(function () {
  'use strict';

  window.GriloShadow = window.GriloShadow || {};

  window.GriloShadow.TRACKS = [
    {
      slug: 'sh-01-same-coffee',
      order: 1,
      level: 'A1',
      title: 'The Same Coffee',
      theme: 'Rotina · presente simples',
      minScoreToUnlock: 70,
      sentences: [
        { en: "I get the same coffee every single day.",              pt: "Eu peço o mesmo café todo santo dia." },
        { en: "It's always a small one, with milk and no sugar.",     pt: "É sempre um pequeno, com leite e sem açúcar." },
        { en: "Some people think that's boring.",                     pt: "Algumas pessoas acham isso chato." },
        { en: "But I like knowing exactly how my morning starts.",    pt: "Mas eu gosto de saber exatamente como minha manhã começa." },
        { en: "In a day full of things I can't control,",             pt: "Num dia cheio de coisas que eu não controlo," },
        { en: "this one small cup is mine.",                          pt: "essa xícara pequena é minha." },
      ],
    },
    {
      slug: 'sh-02-ten-minutes',
      order: 2,
      level: 'A1',
      title: 'Ten Minutes Awake',
      theme: 'Rotina · horas e sequência',
      minScoreToUnlock: 70,
      sentences: [
        { en: "My alarm goes off at seven every morning.",           pt: "Meu despertador toca às sete toda manhã." },
        { en: "First, I open the window and look outside.",          pt: "Primeiro, abro a janela e olho pra fora." },
        { en: "Then I drink some water and wash my face.",           pt: "Depois bebo um pouco de água e lavo o rosto." },
        { en: "I try not to check my phone right away.",             pt: "Tento não olhar o celular logo de cara." },
        { en: "The first ten minutes are always the hardest.",       pt: "Os primeiros dez minutos são sempre os mais difíceis." },
        { en: "But how I start the day changes everything.",         pt: "Mas como eu começo o dia muda tudo." },
      ],
    },
    {
      slug: 'sh-03-small-place',
      order: 3,
      level: 'A1',
      title: 'A Small Place',
      theme: 'Casa · there is / there are',
      minScoreToUnlock: 70,
      sentences: [
        { en: "I live in a very small apartment.",                   pt: "Eu moro num apartamento bem pequeno." },
        { en: "There is one room, a tiny kitchen, and a bathroom.",  pt: "Tem um cômodo, uma cozinha minúscula e um banheiro." },
        { en: "There are no big windows and not much light.",        pt: "Não tem janelas grandes nem muita luz." },
        { en: "At first, I wanted something bigger.",                pt: "No começo, eu queria algo maior." },
        { en: "But now I think a small place is enough.",            pt: "Mas agora acho que um lugar pequeno é suficiente." },
        { en: "When you have less, you notice more.",                pt: "Quando você tem menos, você repara em mais." },
      ],
    },
    {
      slug: 'sh-04-long-way',
      order: 4,
      level: 'A1',
      title: 'The Long Way',
      theme: 'Direções · transporte e tempo',
      minScoreToUnlock: 72,
      sentences: [
        { en: "I can take the bus straight to work.",                pt: "Eu posso pegar o ônibus direto pro trabalho." },
        { en: "It only takes about fifteen minutes.",                pt: "Leva só uns quinze minutos." },
        { en: "But sometimes I walk the long way instead.",          pt: "Mas às vezes eu vou a pé pelo caminho mais longo." },
        { en: "I go past the park and down a quiet street.",         pt: "Passo pelo parque e desço uma rua tranquila." },
        { en: "It takes more time, and I don't mind.",               pt: "Leva mais tempo, e eu não me importo." },
        { en: "Those extra minutes are just for me.",                pt: "Aqueles minutos a mais são só meus." },
      ],
    },
    {
      slug: 'sh-05-dont-eat',
      order: 5,
      level: 'A1',
      title: "What I Don't Eat",
      theme: 'Comida · like / don\'t like',
      minScoreToUnlock: 72,
      sentences: [
        { en: "People always ask me what food I like.",              pt: "As pessoas sempre me perguntam de que comida eu gosto." },
        { en: "But I think what you don't eat says a lot too.",      pt: "Mas acho que o que você não come também diz muito." },
        { en: "I don't eat meat, and I don't drink soda.",           pt: "Eu não como carne e não bebo refrigerante." },
        { en: "It's not a rule; it's just a choice.",                pt: "Não é uma regra; é só uma escolha." },
        { en: "Every small choice becomes a habit.",                 pt: "Cada pequena escolha vira um hábito." },
        { en: "And in the end, our habits become us.",               pt: "E no fim, nossos hábitos se tornam a gente." },
      ],
    },
    {
      slug: 'sh-06-someday',
      order: 6,
      level: 'A1',
      title: 'Someday',
      theme: 'Futuro · going to / want to',
      minScoreToUnlock: 74,
      sentences: [
        { en: "For years I've said the same thing.",                 pt: "Faz anos que eu digo a mesma coisa." },
        { en: "Someday I'm going to learn to play the guitar.",      pt: "Um dia eu vou aprender a tocar violão." },
        { en: "Someday I want to travel across the country.",        pt: "Um dia eu quero viajar pelo país." },
        { en: "But someday is not a real day on the calendar.",      pt: "Mas \"um dia\" não é um dia de verdade no calendário." },
        { en: "This week I'm going to pick a date and start.",       pt: "Essa semana eu vou escolher uma data e começar." },
        { en: "Because a plan with no date is just a wish.",         pt: "Porque um plano sem data é só um desejo." },
      ],
    },
    {
      slug: 'sh-07-names',
      order: 7,
      level: 'A1',
      title: 'The Names I Know',
      theme: 'Pessoas · profissões e possessivos',
      minScoreToUnlock: 74,
      sentences: [
        { en: "So many people pass through my day.",                 pt: "Tanta gente passa pelo meu dia." },
        { en: "The driver, the woman at the shop, my neighbor.",     pt: "O motorista, a mulher da loja, meu vizinho." },
        { en: "I see their faces almost every day.",                 pt: "Vejo o rosto deles quase todo dia." },
        { en: "But I don't know most of their names.",               pt: "Mas não sei o nome da maioria." },
        { en: "This month I want to learn one new name.",            pt: "Esse mês eu quero aprender um nome novo." },
        { en: "A name is a small way to really see someone.",        pt: "Um nome é um jeito pequeno de enxergar alguém de verdade." },
      ],
    },
    {
      slug: 'sh-08-wrong-size',
      order: 8,
      level: 'A2',
      title: 'The Wrong Size',
      theme: 'Compras · passado simples',
      minScoreToUnlock: 74,
      sentences: [
        { en: "Last week I bought a jacket at a small store.",       pt: "Semana passada comprei uma jaqueta numa loja pequena." },
        { en: "When I got home, I saw it was the wrong size.",       pt: "Quando cheguei em casa, vi que era o tamanho errado." },
        { en: "I almost kept it just to avoid the trouble.",         pt: "Quase fiquei com ela só pra evitar o transtorno." },
        { en: "I didn't want to bother anyone at the store.",        pt: "Eu não queria incomodar ninguém na loja." },
        { en: "But I went back, and they changed it with a smile.",  pt: "Mas voltei, e trocaram com um sorriso." },
        { en: "Asking for help is not the same as being a problem.", pt: "Pedir ajuda não é a mesma coisa que ser um problema." },
      ],
    },
    {
      slug: 'sh-09-bad-day',
      order: 9,
      level: 'A2',
      title: 'A Bad Day',
      theme: 'Saúde · corpo e conselhos (should)',
      minScoreToUnlock: 76,
      sentences: [
        { en: "Yesterday I woke up with a headache and a sore throat.", pt: "Ontem acordei com dor de cabeça e dor de garganta." },
        { en: "I felt tired, so I stayed in bed all morning.",       pt: "Me senti cansado, então fiquei na cama a manhã toda." },
        { en: "I know I should rest when my body asks for it.",      pt: "Sei que deveria descansar quando meu corpo pede." },
        { en: "But doing nothing is harder than it sounds.",         pt: "Mas não fazer nada é mais difícil do que parece." },
        { en: "Being sick forces you to finally slow down.",         pt: "Ficar doente te obriga a finalmente ir mais devagar." },
        { en: "Maybe that's the body's way of saying stop.",         pt: "Talvez seja o jeito do corpo dizer pare." },
      ],
    },
    {
      slug: 'sh-10-if-i-could-go',
      order: 10,
      level: 'A2',
      title: 'If I Could Go',
      theme: 'Desejo · want to / condicional leve',
      minScoreToUnlock: 76,
      sentences: [
        { en: "If I could go anywhere in the world,",                pt: "Se eu pudesse ir a qualquer lugar do mundo," },
        { en: "I would choose a small town near the sea.",           pt: "eu escolheria uma cidadezinha perto do mar." },
        { en: "I want to wake up to the sound of the water.",        pt: "Eu quero acordar com o som da água." },
        { en: "I don't need anything big or expensive.",             pt: "Não preciso de nada grande ou caro." },
        { en: "The place we dream about says who we are.",           pt: "O lugar com que a gente sonha diz quem a gente é." },
        { en: "And I think mine is asking me to be calm.",           pt: "E acho que o meu está me pedindo pra ter calma." },
      ],
    },
  ];

  // Ordem canônica de progressão da trilha (por `order`)
  window.GriloShadow.getTrackOrder = function () {
    return window.GriloShadow.TRACKS.slice().sort((a, b) => a.order - b.order);
  };

  window.GriloShadow.getTrackBySlug = function (slug) {
    return window.GriloShadow.TRACKS.find(t => t.slug === slug) || null;
  };
})();
