/* ============================================================
 *  Ditação — DADOS
 *  ============================================================
 *  Trilha LINEAR: a faixa N libera quando a N-1 termina com
 *  score >= minScoreToUnlock. Cada frase é ouvida (TTS) e
 *  digitada pelo aluno.
 *
 *  blocks[]: andaime gramatical exibido acima do campo. Cada
 *  bloco agrupa palavras consecutivas sob uma categoria.
 *  Invariante: blocks.flatMap(b => b.words).join(' ') === en
 *  (checado no carregamento, warn no console se divergir).
 *
 *  tag (define a cor): subject | verb | object | adverbial |
 *                      complement | connector
 *  label (texto exibido, PT): livre — "Quando", "Onde", etc.
 * ============================================================ */
(function () {
  'use strict';

  const S = (...words) => ({ tag: 'subject', label: 'Sujeito', words });
  const V = (...words) => ({ tag: 'verb', label: 'Verbo', words });
  const O = (...words) => ({ tag: 'object', label: 'Objeto', words });
  const C = (...words) => ({ tag: 'complement', label: 'Complemento', words });
  const K = (...words) => ({ tag: 'connector', label: 'Conector', words });
  const A = (label, ...words) => ({ tag: 'adverbial', label, words });

  window.GriloDictation = window.GriloDictation || {};

  window.GriloDictation.TRACKS = [
    {
      slug: 'dt-01-nice-to-meet-you',
      order: 1,
      level: 'A1',
      title: 'Nice to Meet You',
      theme: 'Apresentações · verbo to be',
      minScoreToUnlock: 70,
      sentences: [
        { en: 'My name is Ana.', pt: 'Meu nome é Ana.',
          blocks: [S('My', 'name'), V('is'), C('Ana.')] },
        { en: 'I am from Brazil.', pt: 'Eu sou do Brasil.',
          blocks: [S('I'), V('am'), A('De onde', 'from', 'Brazil.')] },
        { en: 'I live in this city.', pt: 'Eu moro nesta cidade.',
          blocks: [S('I'), V('live'), A('Onde', 'in', 'this', 'city.')] },
        { en: 'I work at a bank.', pt: 'Eu trabalho num banco.',
          blocks: [S('I'), V('work'), A('Onde', 'at', 'a', 'bank.')] },
        { en: 'My sister is a teacher.', pt: 'Minha irmã é professora.',
          blocks: [S('My', 'sister'), V('is'), C('a', 'teacher.')] },
        { en: 'We have two cats.', pt: 'Nós temos dois gatos.',
          blocks: [S('We'), V('have'), O('two', 'cats.')] },
        { en: 'I speak a little English.', pt: 'Eu falo um pouco de inglês.',
          blocks: [S('I'), V('speak'), O('a', 'little', 'English.')] },
        { en: 'It is nice to meet you.', pt: 'É um prazer te conhecer.',
          blocks: [S('It'), V('is'), C('nice'), V('to', 'meet'), O('you.')] },
      ],
    },
    {
      slug: 'dt-02-text-me-later',
      order: 2,
      level: 'A1',
      title: 'Text Me Later',
      theme: 'Celular e mensagens · presente contínuo',
      minScoreToUnlock: 70,
      sentences: [
        { en: 'I am reading your message now.', pt: 'Estou lendo sua mensagem agora.',
          blocks: [S('I'), V('am', 'reading'), O('your', 'message'), A('Quando', 'now.')] },
        { en: 'She is calling her mother.', pt: 'Ela está ligando pra mãe dela.',
          blocks: [S('She'), V('is', 'calling'), O('her', 'mother.')] },
        { en: 'My phone is on the table.', pt: 'Meu celular está na mesa.',
          blocks: [S('My', 'phone'), V('is'), A('Onde', 'on', 'the', 'table.')] },
        { en: 'Can you send me the photo?', pt: 'Você pode me mandar a foto?',
          blocks: [V('Can'), S('you'), V('send'), O('me'), O('the', 'photo?')] },
        { en: 'We are waiting for the bus.', pt: 'Estamos esperando o ônibus.',
          blocks: [S('We'), V('are', 'waiting'), O('for', 'the', 'bus.')] },
        { en: 'He never answers my texts.', pt: 'Ele nunca responde minhas mensagens.',
          blocks: [S('He'), A('Frequência', 'never'), V('answers'), O('my', 'texts.')] },
        { en: 'I am busy, but I can talk later.', pt: 'Estou ocupado, mas posso falar depois.',
          blocks: [S('I'), V('am'), C('busy,'), K('but'), S('I'), V('can', 'talk'), A('Quando', 'later.')] },
        { en: 'Text me when you get home.', pt: 'Me manda mensagem quando chegar em casa.',
          blocks: [V('Text'), O('me'), K('when'), S('you'), V('get'), A('Onde', 'home.')] },
      ],
    },
    {
      slug: 'dt-03-work-and-study',
      order: 3,
      level: 'A2',
      title: 'Work and Study',
      theme: 'Trabalho e estudo · have to / can',
      minScoreToUnlock: 72,
      sentences: [
        { en: 'I have to finish this report today.', pt: 'Tenho que terminar este relatório hoje.',
          blocks: [S('I'), V('have', 'to', 'finish'), O('this', 'report'), A('Quando', 'today.')] },
        { en: 'My boss wants the numbers before lunch.', pt: 'Meu chefe quer os números antes do almoço.',
          blocks: [S('My', 'boss'), V('wants'), O('the', 'numbers'), A('Quando', 'before', 'lunch.')] },
        { en: 'Can you help me with this email?', pt: 'Você pode me ajudar com este e-mail?',
          blocks: [V('Can'), S('you'), V('help'), O('me'), A('Com o quê', 'with', 'this', 'email?')] },
        { en: 'She studies at night because she works all day.', pt: 'Ela estuda à noite porque trabalha o dia todo.',
          blocks: [S('She'), V('studies'), A('Quando', 'at', 'night'), K('because'), S('she'), V('works'), A('Quando', 'all', 'day.')] },
        { en: "We don't have to wear a suit.", pt: 'Não precisamos usar terno.',
          blocks: [S('We'), V("don't", 'have', 'to', 'wear'), O('a', 'suit.')] },
        { en: "The meeting starts at nine o'clock.", pt: 'A reunião começa às nove horas.',
          blocks: [S('The', 'meeting'), V('starts'), A('Quando', 'at', 'nine', "o'clock.")] },
        { en: "I can't open the file on my computer.", pt: 'Não consigo abrir o arquivo no meu computador.',
          blocks: [S('I'), V("can't", 'open'), O('the', 'file'), A('Onde', 'on', 'my', 'computer.')] },
        { en: 'Our teacher gives us homework every week.', pt: 'Nosso professor passa lição de casa toda semana.',
          blocks: [S('Our', 'teacher'), V('gives'), O('us'), O('homework'), A('Quando', 'every', 'week.')] },
      ],
    },
    {
      slug: 'dt-04-last-weekend',
      order: 4,
      level: 'A2',
      title: 'Last Weekend',
      theme: 'Fim de semana · passado simples',
      minScoreToUnlock: 75,
      sentences: [
        { en: 'Last Saturday I visited my grandparents.', pt: 'Sábado passado visitei meus avós.',
          blocks: [A('Quando', 'Last', 'Saturday'), S('I'), V('visited'), O('my', 'grandparents.')] },
        { en: 'We took the train to the coast.', pt: 'Pegamos o trem para o litoral.',
          blocks: [S('We'), V('took'), O('the', 'train'), A('Para onde', 'to', 'the', 'coast.')] },
        { en: 'It rained all morning, so we stayed inside.', pt: 'Choveu a manhã toda, então ficamos dentro de casa.',
          blocks: [S('It'), V('rained'), A('Quando', 'all', 'morning,'), K('so'), S('we'), V('stayed'), A('Onde', 'inside.')] },
        { en: 'My cousin made a huge chocolate cake.', pt: 'Meu primo fez um bolo de chocolate enorme.',
          blocks: [S('My', 'cousin'), V('made'), O('a', 'huge', 'chocolate', 'cake.')] },
        { en: "I didn't sleep well on Saturday night.", pt: 'Não dormi bem no sábado à noite.',
          blocks: [S('I'), V("didn't", 'sleep'), A('Como', 'well'), A('Quando', 'on', 'Saturday', 'night.')] },
        { en: 'We watched an old movie together.', pt: 'Assistimos a um filme antigo juntos.',
          blocks: [S('We'), V('watched'), O('an', 'old', 'movie'), A('Como', 'together.')] },
        { en: 'On Sunday we walked along the beach.', pt: 'No domingo caminhamos pela praia.',
          blocks: [A('Quando', 'On', 'Sunday'), S('we'), V('walked'), A('Onde', 'along', 'the', 'beach.')] },
        { en: 'I came back home tired but happy.', pt: 'Voltei pra casa cansado, mas feliz.',
          blocks: [S('I'), V('came', 'back'), A('Onde', 'home'), C('tired'), K('but'), C('happy.')] },
      ],
    },
  ];

  window.GriloDictation.TRACKS.forEach(function (t) {
    t.sentences.forEach(function (s, i) {
      const joined = s.blocks.flatMap(b => b.words).join(' ');
      if (joined !== s.en) console.warn('[DICTATION] blocks ≠ en em', t.slug, '#' + i, '→', joined);
    });
  });

  window.GriloDictation.getTrackOrder = function () {
    return window.GriloDictation.TRACKS.slice().sort((a, b) => a.order - b.order);
  };

  window.GriloDictation.getTrackBySlug = function (slug) {
    return window.GriloDictation.TRACKS.find(t => t.slug === slug) || null;
  };
})();
