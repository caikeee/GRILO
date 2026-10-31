/* ============================================================
 *  Eco — DADOS (ouvir a frase → repetir em voz alta)
 *  ============================================================
 *  O antigo Laboratório de Shadowing virou o Eco: em vez de falar
 *  junto com o áudio, o aluno ouve a frase inteira e depois repete.
 *  O nome técnico (arquivo, rota shadowing.html, window.GriloShadow,
 *  localStorage e backend /api/shadowing) ficou igual para não perder
 *  progresso nem estatística.
 *
 *  Trilha LINEAR: a faixa N libera quando a N-1 termina com pelo
 *  menos `minDominated` frases dominadas.
 *
 *  Cada faixa acompanha uma aula do grupo A (`lesson`): quem acabou
 *  de fazer a aula reconhece parte das frases e encontra outras no
 *  mesmo contexto, mais uma "fora da caixinha" (ciência ou literatura).
 *
 *  sentences[]:
 *    en    frase falada (o áudio sai do /api/tts na hora; depois vira MP3
 *          pré-gerado pelo scripts/gen_lesson_audio.py)
 *    pt    tradução
 *    ph    leitura aproximada em português, sílaba tônica em CAIXA ALTA
 *          (mesma convenção das aulas) — aparece a partir da 2ª tentativa
 *    kind  aula | novo | ciencia | literatura | ditado
 *    src   autor/obra, quando for literatura ou ditado
 *
 *  Literatura só de obras em domínio público; fatos de ciência
 *  verificáveis e ditos de forma simples, no nível A1.
 * ============================================================ */
(function () {
  'use strict';

  window.GriloShadow = window.GriloShadow || {};

  window.GriloShadow.TRACKS = [
    {
      slug: 'eco-01-good-morning',
      order: 1,
      level: 'A1',
      title: 'Good Morning, World',
      theme: 'Cumprimentos',
      lesson: { slug: '4p-cumprimentos', num: 1 },
      minDominated: 5,
      sentences: [
        { kind: 'aula', en: 'Good morning! How are you?', pt: 'Bom dia! Como você está?', ph: 'gud MOR-ning · rau ar IU' },
        { kind: 'aula', en: "I'm fine, thanks. And you?", pt: 'Estou bem, obrigado. E você?', ph: 'aim FAIN thénks · énd IU' },
        { kind: 'novo', en: "Hello! It's nice to see you again.", pt: 'Olá! Que bom te ver de novo.', ph: 'rê-LOU · its NAIS tu SI iu â-GUÉN' },
        { kind: 'ciencia', en: 'The sun rises in the east every morning.', pt: 'O sol nasce no leste toda manhã.', ph: 'dâ SÂN RAI-ziz in di ÍST É-vri MOR-ning' },
        { kind: 'aula', en: 'Good night! Sleep well.', pt: 'Boa noite! Durma bem.', ph: 'gud NAIT · slip UÉL' },
        { kind: 'literatura', src: 'Shakespeare, Romeu e Julieta', en: 'Good night, good night! Parting is such sweet sorrow.', pt: 'Boa noite, boa noite! Partir é uma dor tão doce.', ph: 'gud NAIT gud NAIT · PAR-ting iz sâtch suít SÓ-rou' },
      ],
    },
    {
      slug: 'eco-02-whats-in-a-name',
      order: 2,
      level: 'A1',
      title: "What's in a Name?",
      theme: 'Apresentações',
      lesson: { slug: '4p-apresentacoes', num: 2 },
      minDominated: 5,
      sentences: [
        { kind: 'aula', en: 'My name is Ana.', pt: 'Meu nome é Ana.', ph: 'mai NEIM iz A-na' },
        { kind: 'aula', en: "I'm from Brazil.", pt: 'Eu sou do Brasil.', ph: 'aim from brâ-ZIU' },
        { kind: 'novo', en: "What's your name, and where are you from?", pt: 'Qual é o seu nome, e de onde você é?', ph: 'uóts iór NEIM · énd uér ar iu FRÓM' },
        { kind: 'aula', en: 'I live in a big city.', pt: 'Eu moro numa cidade grande.', ph: 'ai LIV in â big CI-ti' },
        { kind: 'ciencia', en: 'Brazil has more than two hundred million people.', pt: 'O Brasil tem mais de duzentos milhões de pessoas.', ph: 'brâ-ZIU réz MÓR dén tchu RÂN-dred MÍ-lion PÍ-pol' },
        { kind: 'literatura', src: 'Shakespeare, Romeu e Julieta', en: "What's in a name?", pt: 'O que há em um nome?', ph: 'uóts in â NEIM' },
      ],
    },
    {
      slug: 'eco-03-count-the-stars',
      order: 3,
      level: 'A1',
      title: 'Count the Stars',
      theme: 'Números',
      lesson: { slug: '4p-numeros', num: 3 },
      minDominated: 5,
      sentences: [
        { kind: 'aula', en: 'How old are you?', pt: 'Quantos anos você tem?', ph: 'rau OULD ar iu' },
        { kind: 'aula', en: 'I am ten years old.', pt: 'Eu tenho dez anos.', ph: 'ai ém TÉN íers OULD' },
        { kind: 'aula', en: 'Three coffees, please.', pt: 'Três cafés, por favor.', ph: 'THRI KÓ-fis pliz' },
        { kind: 'novo', en: 'I have two sisters and one brother.', pt: 'Eu tenho duas irmãs e um irmão.', ph: 'ai rév TCHU SÍS-ters énd uân BRÂ-der' },
        { kind: 'ciencia', en: 'An octopus has three hearts.', pt: 'Um polvo tem três corações.', ph: 'én ÓK-to-pâs réz THRI RARTS' },
        { kind: 'literatura', src: 'Robert Frost, The Road Not Taken', en: 'Two roads diverged in a wood.', pt: 'Dois caminhos se separavam num bosque.', ph: 'tchu ROUDS dai-VÊRDJD in â UÚD' },
      ],
    },
    {
      slug: 'eco-04-time-flies',
      order: 4,
      level: 'A1',
      title: 'Time Flies',
      theme: 'Horas',
      lesson: { slug: '4p-horas', num: 4 },
      minDominated: 5,
      sentences: [
        { kind: 'aula', en: 'What time is it now?', pt: 'Que horas são agora?', ph: 'uót TAIM iz it NAU' },
        { kind: 'aula', en: "It's half past seven.", pt: 'São sete e meia.', ph: 'its RÉF pést SÉ-ven' },
        { kind: 'aula', en: "Sorry, I'm late!", pt: 'Desculpa, estou atrasado!', ph: 'SÓ-ri aim LEIT' },
        { kind: 'novo', en: "Time flies when you're having fun.", pt: 'O tempo voa quando você está se divertindo.', ph: 'taim FLAIS uén iór RÉ-ving FÂN' },
        { kind: 'ciencia', en: 'Sunlight takes about eight minutes to reach the Earth.', pt: 'A luz do sol leva uns oito minutos para chegar à Terra.', ph: 'SÂN-lait TEIKS â-BAUT EIT MÍ-nits tu RITCH di ÊRTH' },
        { kind: 'literatura', src: 'Charles Dickens, Um Conto de Duas Cidades', en: 'It was the best of times, it was the worst of times.', pt: 'Era o melhor dos tempos, era o pior dos tempos.', ph: 'it uóz dâ BÉST óv TAIMS · it uóz dâ UÔRST óv TAIMS' },
      ],
    },
    {
      slug: 'eco-05-how-much',
      order: 5,
      level: 'A1',
      title: 'How Much Is It?',
      theme: 'Preços e compras',
      lesson: { slug: '4p-precos', num: 5 },
      minDominated: 5,
      sentences: [
        { kind: 'aula', en: 'How much is it?', pt: 'Quanto custa?', ph: 'rau MÂTCH iz it' },
        { kind: 'aula', en: 'This is too expensive.', pt: 'Isso é caro demais.', ph: 'dis iz tchu eks-PÉN-siv' },
        { kind: 'aula', en: 'I want to buy a gift.', pt: 'Eu quero comprar um presente.', ph: 'ai uónt tu BAI â GHIFT' },
        { kind: 'novo', en: 'Can I pay with card, please?', pt: 'Posso pagar com cartão, por favor?', ph: 'kén ai PEI uif KARD pliz' },
        { kind: 'ciencia', en: 'Honey never goes bad.', pt: 'O mel nunca estraga.', ph: 'RÂ-ni NÉ-ver gous BÉD' },
        { kind: 'ditado', src: 'ditado popular', en: 'The best things in life are free.', pt: 'As melhores coisas da vida são de graça.', ph: 'dâ BÉST things in LAIF ar FRI' },
      ],
    },
    {
      slug: 'eco-06-table-for-two',
      order: 6,
      level: 'A1',
      title: 'A Table for Two',
      theme: 'Restaurante e café',
      lesson: { slug: '4p-restaurante', num: 6 },
      minDominated: 5,
      sentences: [
        { kind: 'aula', en: 'A table for two, please.', pt: 'Uma mesa para dois, por favor.', ph: 'â TEI-bâl for TCHU pliz' },
        { kind: 'aula', en: 'Can I see the menu?', pt: 'Posso ver o cardápio?', ph: 'kén ai SI dâ MÉ-niu' },
        { kind: 'aula', en: 'The food is delicious!', pt: 'A comida está deliciosa!', ph: 'dâ FUD iz di-LÍ-shâs' },
        { kind: 'aula', en: 'The check, please.', pt: 'A conta, por favor.', ph: 'dâ TCHÉK pliz' },
        { kind: 'ciencia', en: 'Bananas are berries, but strawberries are not.', pt: 'Bananas são frutas do tipo baga, mas morangos não.', ph: 'bâ-NÉ-nâs ar BÉ-ris · bât STRÓ-bé-ris ar NÓT' },
        { kind: 'literatura', src: 'Lewis Carroll, Alice no País das Maravilhas', en: "It's always tea-time.", pt: 'É sempre hora do chá.', ph: 'its ÓL-ueis TI-taim' },
      ],
    },
  ];

  window.GriloShadow.getTrackOrder = function () {
    return window.GriloShadow.TRACKS.slice().sort((a, b) => a.order - b.order);
  };

  window.GriloShadow.getTrackBySlug = function (slug) {
    return window.GriloShadow.TRACKS.find(t => t.slug === slug) || null;
  };
})();
