/**
 * lessons-enhanced.js
 * Enhanced lesson page with animations, scroll effects, and improved interactivity
 * Works with the redesigned lesson.html structure
 */

(function() {
  'use strict';

  const UI_ICONS = {
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"></path></svg>',
    tip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a7 7 0 0 0-4 12.7c.6.4 1 1 1.2 1.8h5.6c.2-.8.6-1.4 1.2-1.8A7 7 0 0 0 12 3z"></path></svg>',
    lesson: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5v-16zM7.5 3v16"></path></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path></svg>',
    target: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12l7-7M19 5h-5M19 5v5M20 12a8 8 0 1 1-8-8"></path></svg>',
    practice: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16l-4 4 1-5 10-10a2.8 2.8 0 1 1 4 4L9 19l-5 1 1-4z"></path></svg>'
  };

  const LESSON_ICON_MAP = {
    PR: '<span class="lp-glyph lp-glyph--scene" aria-hidden="true"><svg viewBox="0 0 48 48"><ellipse cx="24" cy="38.5" rx="14" ry="4" fill="#c7d7f8"></ellipse><path d="M9 30.5c0-5.3 4.4-9.5 9.8-9.5S29 25.2 29 30.5V33H9z" fill="#f2b36f" stroke="#1f2b8c" stroke-width="2.5" stroke-linejoin="round"></path><circle cx="18.8" cy="15.8" r="6.6" fill="#ffd7b8" stroke="#1f2b8c" stroke-width="2.5"></circle><path d="M12.7 14.7c.7-4.4 3.5-7 7.5-7 3.1 0 5.3 1.2 6.8 3.7-1.6.8-2.8 2-3.7 3.7-2.2-.8-4.3-.8-6.5 0l-1.4 1.6z" fill="#f08d49" stroke="#1f2b8c" stroke-width="2.5" stroke-linejoin="round"></path><path d="M27.4 31.8l2.8-2.8" stroke="#1f2b8c" stroke-width="2.5" stroke-linecap="round"></path><circle cx="33.6" cy="26.1" r="5.3" fill="#eef4ff" stroke="#1f2b8c" stroke-width="2.5"></circle><circle cx="33.6" cy="26.1" r="2.3" fill="#c7d7f8"></circle></svg></span>',
    'Q?': '<span class="lp-glyph lp-glyph--scene" aria-hidden="true"><svg viewBox="0 0 48 48"><ellipse cx="22" cy="39" rx="14" ry="4" fill="#c7d7f8"></ellipse><path d="M8 10h21c4.4 0 8 3.6 8 8v8.3c0 4.4-3.6 8-8 8H18.8L10 39v-4.7H8c-4.4 0-8-3.6-8-8V18c0-4.4 3.6-8 8-8z" transform="translate(5 1)" fill="#dbe9ff" stroke="#1f2b8c" stroke-width="2.5" stroke-linejoin="round"></path><path d="M25.5 18.6c0-3.2-2.4-5.4-6-5.4-3.5 0-5.9 2-6.2 5.1" fill="none" stroke="#1f2b8c" stroke-width="2.5" stroke-linecap="round"></path><path d="M19.4 23.7c0-2.2 2.2-2.9 3.5-4.2.8-.8 1.2-1.7 1.2-2.9" fill="none" stroke="#1f2b8c" stroke-width="2.5" stroke-linecap="round"></path><circle cx="19.3" cy="30.6" r="1.8" fill="#1f2b8c"></circle><circle cx="35.3" cy="14.5" r="5.6" fill="#ff6b88" stroke="#1f2b8c" stroke-width="2.5"></circle><path d="M35.3 11.7v5.6M32.5 14.5H38" stroke="#fff7f7" stroke-width="2.4" stroke-linecap="round"></path></svg></span>',
    NO: '<span class="lp-glyph lp-glyph--scene" aria-hidden="true"><svg viewBox="0 0 48 48"><ellipse cx="24" cy="38.8" rx="12.5" ry="4" fill="#c7d7f8"></ellipse><path d="M13.5 31c0-5.7 4.2-10 10.2-10 6 0 10.3 4.3 10.3 10v2.8H13.5z" fill="#6f7e99" stroke="#1f2b8c" stroke-width="2.5"></path><path d="M15.8 18.8c0-4.8 3.5-8.2 8.2-8.2 4.6 0 8.1 3.4 8.1 8.2 0 2.8-.9 5.2-2.8 7.3L24 32l-5.3-5.9c-1.9-2.1-2.9-4.5-2.9-7.3z" fill="#ffd6b7" stroke="#1f2b8c" stroke-width="2.5" stroke-linejoin="round"></path><path d="M17.7 17.3c1.1-4 4-6.2 8.2-6.2 3.5 0 6 1.4 7.6 4.2l-4.6 2.1c-2.2-1.1-4.6-1.2-7.1-.3l-4.1 2.4z" fill="#c58a52" stroke="#1f2b8c" stroke-width="2.5" stroke-linejoin="round"></path><path d="M14.3 34.2l19.4-16.7" stroke="#ff6b88" stroke-width="3.2" stroke-linecap="round"></path></svg></span>',
    PA: '<span class="lp-glyph lp-glyph--scene" aria-hidden="true"><svg viewBox="0 0 48 48"><ellipse cx="24" cy="39" rx="13.5" ry="4" fill="#c7d7f8"></ellipse><path d="M10.5 13h20.8c3.6 0 6.5 2.9 6.5 6.5v14c0 2.5-2 4.5-4.5 4.5H10.5c-2.5 0-4.5-2-4.5-4.5V17.5c0-2.5 2-4.5 4.5-4.5z" fill="#edf5ff" stroke="#1f2b8c" stroke-width="2.5"></path><path d="M13 9.5v7M30.5 9.5v7" stroke="#1f2b8c" stroke-width="2.5" stroke-linecap="round"></path><path d="M6 20.4h31.8" stroke="#1f2b8c" stroke-width="2.5"></path><circle cx="21.8" cy="28.2" r="6.6" fill="#ffdf73" stroke="#1f2b8c" stroke-width="2.5"></circle><path d="M21.8 24.6v4.4l3.2 1.8" stroke="#1f2b8c" stroke-width="2.5" stroke-linecap="round"></path><path d="M31 28.4l2.2-2.2" stroke="#1f2b8c" stroke-width="2.5" stroke-linecap="round"></path><circle cx="35.2" cy="24.4" r="4.8" fill="#ff6b88" stroke="#1f2b8c" stroke-width="2.5"></circle></svg></span>',
    FU: '<span class="lp-glyph lp-glyph--scene" aria-hidden="true"><svg viewBox="0 0 48 48"><ellipse cx="22" cy="39" rx="13.5" ry="4" fill="#c7d7f8"></ellipse><path d="M31.7 8.3c5.3 3 8.1 8.4 8.3 15.8l-7.4 2.3-5.8-5.8 2.4-7.3z" fill="#ffd7b8" stroke="#1f2b8c" stroke-width="2.5" stroke-linejoin="round"></path><path d="M17.8 20.8L29 9.7c3 .3 5.8 1.2 8.5 2.8L23.6 26.4l-7.3-.3z" fill="#ff6b88" stroke="#1f2b8c" stroke-width="2.5" stroke-linejoin="round"></path><circle cx="31.2" cy="16.9" r="2.7" fill="#e8f2ff" stroke="#1f2b8c" stroke-width="2.3"></circle><path d="M12.6 28.4c2.7-1.1 5.1-1.1 7.4.1-.7 2.2-.2 4.5 1.4 6.8-3.8.3-6.7-.6-8.8-2.7z" fill="#ffd95e" stroke="#1f2b8c" stroke-width="2.5" stroke-linejoin="round"></path><path d="M12.1 17.8l4.5 4.5" stroke="#1f2b8c" stroke-width="2.5" stroke-linecap="round"></path></svg></span>',
    IG: '<span class="lp-glyph lp-glyph--scene" aria-hidden="true"><svg viewBox="0 0 48 48"><ellipse cx="24" cy="38.8" rx="14" ry="4" fill="#c7d7f8"></ellipse><path d="M10.2 12.5h27.6c2.9 0 5.2 2.3 5.2 5.2v14.1c0 2.9-2.3 5.2-5.2 5.2H10.2C7.3 37 5 34.7 5 31.8V17.7c0-2.9 2.3-5.2 5.2-5.2z" fill="#dbe9ff" stroke="#1f2b8c" stroke-width="2.5"></path><path d="M15 19.2c2-2 5.2-2 7.3 0M13 25.2c3.2-3.2 8.3-3.2 11.5 0M11.2 31.2c4.1-4.1 10.7-4.1 14.8 0" fill="none" stroke="#1f2b8c" stroke-width="2.5" stroke-linecap="round"></path><path d="M30 18.4l4.8 4.8" stroke="#1f2b8c" stroke-width="2.5" stroke-linecap="round"></path><circle cx="36.8" cy="25.1" r="6.2" fill="#ffd95e" stroke="#1f2b8c" stroke-width="2.5"></circle><circle cx="36.8" cy="25.1" r="2.5" fill="#ff6b88"></circle></svg></span>',
    IN: '<span class="lp-glyph lp-glyph--scene" aria-hidden="true"><svg viewBox="0 0 48 48"><ellipse cx="24" cy="39" rx="12.5" ry="4" fill="#c7d7f8"></ellipse><path d="M24 39.8s10.6-8.4 10.6-17.2A10.6 10.6 0 0 0 24 12 10.6 10.6 0 0 0 13.4 22.6C13.4 31.4 24 39.8 24 39.8z" fill="#f4b06c" stroke="#1f2b8c" stroke-width="2.5"></path><circle cx="24" cy="22.5" r="4.7" fill="#e9f2ff" stroke="#1f2b8c" stroke-width="2.5"></circle><path d="M31.2 13l1.1 2.1 2.1 1.1-2.1 1.1-1.1 2.1-1.1-2.1-2.1-1.1 2.1-1.1z" fill="#ffd95e" stroke="#1f2b8c" stroke-width="1.8"></path><path d="M10.3 34.2h8.2" stroke="#ff6b88" stroke-width="3" stroke-linecap="round"></path></svg></span>',
    VB: '<span class="lp-glyph lp-glyph--scene" aria-hidden="true"><svg viewBox="0 0 48 48"><ellipse cx="24" cy="39" rx="13.5" ry="4" fill="#c7d7f8"></ellipse><path d="M10.5 10.8h19.7c3.2 0 5.8 2.6 5.8 5.8v18.2H16.7c-3.4 0-6.2 2.8-6.2 6.2z" fill="#dbe9ff" stroke="#1f2b8c" stroke-width="2.5" stroke-linejoin="round"></path><path d="M16 17.8h11.8M16 23.3h11.8M16 28.8h7.4" stroke="#1f2b8c" stroke-width="2.5" stroke-linecap="round"></path><path d="M30.6 11.7l6.7 6.7-4.7 4.7-5.5 1.5 1.4-5.5z" fill="#ff6b88" stroke="#1f2b8c" stroke-width="2.5" stroke-linejoin="round"></path><path d="M35.6 9l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#ffd95e" stroke="#1f2b8c" stroke-width="1.8"></path></svg></span>'
  };

  function renderUiIcon(name) {
    return `<span class="lp-ui-icon lp-ui-icon--${name}">${UI_ICONS[name] || ''}</span>`;
  }

  function renderLessonIcon(token) {
    return LESSON_ICON_MAP[token] || `<span class="lp-glyph lp-glyph--mono">${token}</span>`;
  }

  // ========== LESSONS DATABASE ==========

  const lessons = {
    pronomes: {
      title: 'Eu, você, ele… Como não repetir o nome toda hora',
      objective: 'Aprenda a usar as palavras que substituem nomes em inglês — aquelas que deixam a fala mais natural e fluida, como "he", "she", "them" e "mine".',
      icon: 'PR',
      highlight: 'I / you / he / she • me / him / her • my / mine',
      teachingPoints: [
        'Entender quando usar "I" e quando usar "me" — e por que eles não são a mesma coisa.',
        'Saber dizer "meu", "seu", "dela" de dois jeitos diferentes em inglês.',
        'Evitar o erro mais comum do brasileiro: dizer "me" quando deveria ser "I".',
        'Usar "they" para uma pessoa só — algo aceito no inglês moderno.',
        'Montar frases completas sem repetir o nome da pessoa o tempo todo.'
      ],
      sections: [
        {
          id: 'quem-faz',
          title: 'Quem faz a ação: I, you, he, she, it, we, they',
          explanation: 'Em inglês, toda frase precisa de uma palavra para indicar quem está fazendo algo. Essas palavras são: I (eu), you (você/vocês), he (ele), she (ela), it (para coisas e animais), we (nós) e they (eles/elas). Elas sempre vêm antes da ação. Pense assim: se você pode substituir pelo nome da pessoa antes do que ela faz, use esse grupo.',
          examples: [
            { en: 'I work every day.', pt: 'Eu trabalho todo dia.' },
            { en: 'You speak very fast.', pt: 'Você fala muito rápido.' },
            { en: 'He lives in Rio.', pt: 'Ele mora no Rio.' },
            { en: 'She loves coffee.', pt: 'Ela adora café.' },
            { en: 'It is very cold today.', pt: 'Está muito frio hoje. (sobre o clima)' },
            { en: 'We are a team.', pt: 'Nós somos uma equipe.' },
            { en: 'They eat lunch together.', pt: 'Eles almoçam juntos.' }
          ],
          exercises: [
            'Traduza: "Ela mora em São Paulo." — use she.',
            'Complete com a palavra certa: ___ am Brazilian. (eu)',
            'Qual usar? "Carlos works here." → "___ is my friend." (He ou Him?)',
            'Monte a frase: [nós] + [estudamos] + [inglês] em inglês.',
            'Por que em inglês dizemos "It is raining" e não só "Is raining"?'
          ]
        },
        {
          id: 'quem-recebe',
          title: 'Quem recebe a ação: me, you, him, her, it, us, them',
          explanation: 'Quando alguém não está fazendo a ação, mas sim recebendo ela — como quando alguém te liga, te ajuda ou te chama — usamos um segundo grupo: me (me/mim), you (continua igual), him (ele/o), her (ela/a), it (continua igual), us (nós/nos) e them (eles/os). No Brasil muita gente erra dizendo "ligou para eu" — em inglês seria "called me". A regra é simples: se vem depois de uma ação ou de palavras como "for", "to", "with", use esse segundo grupo.',
          examples: [
            { en: 'She called me yesterday.', pt: 'Ela me ligou ontem.' },
            { en: 'Can you help us?', pt: 'Você pode nos ajudar?' },
            { en: 'I saw him at the store.', pt: 'Eu o vi no mercado.' },
            { en: 'He gave her a gift.', pt: 'Ele deu um presente pra ela.' },
            { en: 'They invited them to the party.', pt: 'Eles convidaram eles para a festa.' },
            { en: 'This is between you and me.', pt: 'Isso é entre você e eu. (me, não I!)' },
            { en: 'Tell him the truth.', pt: 'Fala a verdade pra ele.' }
          ],
          exercises: [
            'Corrija o erro: "She called I." → correto: ___',
            'Traduza: "Eu vi ela no parque." (use saw + her)',
            'Complete: Can you help ___? (nós)',
            'Escolha: "This is for ___ (I / me)."',
            'Qual grupo usar em "with you and ___"? (I ou me?)'
          ]
        },
        {
          id: 'de-quem-e',
          title: 'De quem é isso? my/your/his/her vs mine/yours/his/hers',
          explanation: 'Para dizer que algo pertence a alguém, o inglês tem dois jeitos. O primeiro é colocar uma palavra antes do objeto: "my bag" (minha bolsa), "his car" (o carro dele). O segundo é substituir o objeto inteiro: "the bag is mine" (a bolsa é minha), "the car is his". A diferença prática: se o objeto aparece na frase, use o primeiro jeito (my, your, his, her, its, our, their). Se o objeto já foi mencionado ou está claro no contexto, use o segundo (mine, yours, his, hers, ours, theirs). "Its" não tem forma separada — não existe "its own" no sentido possessivo isolado.',
          examples: [
            { en: 'This is my phone.', pt: 'Esse é o meu celular.' },
            { en: 'This phone is mine.', pt: 'Esse celular é meu.' },
            { en: 'Her jacket is on the chair.', pt: 'A jaqueta dela está na cadeira.' },
            { en: 'That jacket is hers.', pt: 'Aquela jaqueta é dela.' },
            { en: 'Our house is small, but theirs is huge.', pt: 'Nossa casa é pequena, mas a deles é enorme.' },
            { en: 'Is this your coffee? — Yes, it\'s mine.', pt: 'Esse café é seu? — Sim, é meu.' },
            { en: 'The dog hurt its paw.', pt: 'O cachorro machucou a pata dele.' }
          ],
          exercises: [
            'Escolha: "This is ___ (my / mine) bag."',
            'Complete: "The bag is ___." (dela — hers)',
            'Transforme: "Her car is fast." → "The car is ___."',
            'Qual a diferença entre "your" e "yours"? Crie um exemplo de cada.',
            'Corrija: "This book is your." → correto: ___'
          ]
        }
      ],
      curiosities: [
        '"They" no singular: em inglês moderno, "they" é usado para uma pessoa só quando você não sabe o gênero ou quando a pessoa prefere esse termo. "Someone left their bag here" — alguém esqueceu a bolsa aqui.',
        'No inglês americano informal, "you guys" (vocês caras) é usado para qualquer grupo, independente de gênero. No sul dos EUA, "y\'all" é o equivalente regional.',
        '"It" para bebês: quando o sexo de um bebê não é conhecido, os falantes nativos frequentemente usam "it" — algo que parece estranho para o brasileiro mas é completamente natural em inglês.',
        'O inglês perdeu o "thou" (tu/vós) no século XVII. Por isso "you" serve para tudo: singular, plural, formal e informal.'
      ]
    },

    perguntas: {
      title: 'Como fazer perguntas em inglês sem travar',
      objective: 'Aprenda a montar perguntas com clareza e ritmo natural — das mais diretas às que pedem informação específica ou confirmação no fim da frase.',
      icon: 'Q?',
      highlight: 'Do / Does / Did • What / Where / Who / How • Isn\'t it?',
      teachingPoints: [
        'Perceber que, em inglês, pergunta não depende só de entonação: ela precisa de estrutura visível.',
        'Dominar a base do do, does e did para abrir perguntas simples sem tropeçar na ordem da frase.',
        'Guiar a conversa com what, where, who, when e how sem desmontar a lógica que veio antes.',
        'Usar tag questions para soar mais natural em conversa, no lugar do nosso "né?" automático.',
        'Distinguir quando "who" funciona como sujeito e quando entra como parte da pergunta sobre outra pessoa.'
      ],
      sections: [
        {
          id: 'pergunta-simou-nao',
          title: 'Quando a pergunta precisa nascer montada — do, does e did',
          explanation: 'No português, pra fazer uma pergunta basta mudar o tom de voz: "você gosta de café" vira "você gosta de café?" só com a entonação. Em inglês isso não funciona assim. É obrigatório colocar uma "palavrinha de apoio" antes de tudo. Essa palavrinha é "do" (para eu, você, nós, eles) ou "does" (para ele, ela, isso). No passado, usa-se "did" para qualquer pessoa. Depois dessa palavra, o restante da frase fica na forma base — sem o "-s" que aparece no "he likes".',
          examples: [
            { en: 'Do you like coffee? — Yes, I do.', pt: 'Você gosta de café? — Sim, gosto.' },
            { en: 'Does she work here? — No, she doesn\'t.', pt: 'Ela trabalha aqui? — Não, ela não trabalha.' },
            { en: 'Do they have a dog?', pt: 'Eles têm um cachorro?' },
            { en: 'Did you sleep well?', pt: 'Você dormiu bem?' },
            { en: 'Did he call you?', pt: 'Ele te ligou?' },
            { en: 'Does it hurt?', pt: 'Dói?' },
            { en: 'Do we need an umbrella today?', pt: 'A gente precisa de guarda-chuva hoje?' }
          ],
          exercises: [
            'Forme a pergunta: "você fala inglês?" (speak / you / do)',
            'Corrija: "She does likes pizza?" → correto: ___',
            'Transforme em pergunta: "They eat dinner at 8pm."',
            'Responda negativamente: "Do you drink beer?" → No, ___.',
            'Qual usar, do ou does? "___ your brother live in São Paulo?"'
          ]
        },
        {
          id: 'palavras-de-pergunta',
          title: 'Puxando a informação certa — what, where, who, when e how',
          explanation: 'As palavras de pergunta em inglês são: What (o quê / qual), Where (onde), Who (quem), When (quando), Why (por quê), How (como), How much/many (quanto/s), Which (qual entre opções). Elas sempre vêm no começo da frase. Depois delas, a estrutura segue o mesmo padrão das perguntas de sim/não: palavra de apoio (do/does/did/is/are) + pessoa + ação. Atenção: quando "who" ou "what" são a resposta da pergunta (o sujeito), não precisa do "do/does" — a estrutura muda!',
          examples: [
            { en: 'What do you want for dinner?', pt: 'O que você quer pro jantar?' },
            { en: 'Where does she live?', pt: 'Onde ela mora?' },
            { en: 'When did they arrive?', pt: 'Quando eles chegaram?' },
            { en: 'Why are you laughing?', pt: 'Por que você está rindo?' },
            { en: 'How do you say this in English?', pt: 'Como se fala isso em inglês?' },
            { en: 'Who called you? (quem ligou = sujeito, sem "do")', pt: 'Quem te ligou?' },
            { en: 'Who did you call? (você ligou pra quem = objeto, com "did")', pt: 'Pra quem você ligou?' },
            { en: 'How many people were there?', pt: 'Quantas pessoas estavam lá?' }
          ],
          exercises: [
            'Monte a pergunta: "onde você trabalha?" (where / do / work / you)',
            'Por que "Who called you?" não tem "did"? Explique com suas palavras.',
            'Traduza: "Como você aprende inglês?"',
            'Complete: "___ did you go yesterday?" (onde)',
            'Qual a diferença entre "How much" e "How many"? Crie um exemplo de cada.'
          ]
        },
        {
          id: 'perguntinhas-ne',
          title: 'O inglês confirmando no final — o equivalente do nosso "né?"',
          explanation: 'O português tem o "né?" que coloca no final de qualquer frase para pedir confirmação. O inglês tem o equivalente, mas ele muda dependendo do que veio antes. A lógica é sempre a oposta: se a frase foi positiva, a perguntinha é negativa. Se foi negativa, é positiva. E a palavrinha usada espelha o que já apareceu na frase — se usou "is", repete "is"; se usou "can", repete "can". Parece complicado, mas depois que você pega o ritmo, vira automático.',
          examples: [
            { en: 'It\'s cold today, isn\'t it?', pt: 'Tá frio hoje, né?' },
            { en: 'You like pizza, don\'t you?', pt: 'Você gosta de pizza, né?' },
            { en: 'She can drive, can\'t she?', pt: 'Ela sabe dirigir, né?' },
            { en: 'They didn\'t call, did they?', pt: 'Eles não ligaram, né?' },
            { en: 'You\'re from Brazil, aren\'t you?', pt: 'Você é do Brasil, né?' },
            { en: 'He won\'t come, will he?', pt: 'Ele não vai vir, vai?' }
          ],
          exercises: [
            'Complete: "She is a teacher, ___ ___?"',
            'Complete: "You don\'t smoke, ___ ___?"',
            'Monte: "Ele pode nadar, né?" (He / can / swim)',
            'Por que a perguntinha é negativa quando a frase é positiva?',
            'Complete: "They arrived late, ___ ___?"'
          ]
        }
      ],
      curiosities: [
        'Em inglês americano informal, é muito comum fazer perguntas com entonação crescente sem inverter a ordem: "You\'re coming tonight?" — funciona no cotidiano, mas não é a forma gramaticalmente correta.',
        '"How come?" significa "por quê?" mas de forma mais casual. Curiosamente, a ordem depois de "how come" não inverte: "How come you didn\'t call?" (e não "how come didn\'t you call?").',
        '"What" e "which": "what" é aberto (qualquer coisa), "which" é fechado (uma entre opções específicas). "What\'s your favorite color?" vs "Which color do you prefer, blue or red?"'
      ]
    },

    negativa: {
      title: 'Como dizer "não" em inglês sem confundir',
      objective: 'Entenda como o inglês organiza a negação em cada tipo de frase, para parar de aplicar uma única lógica onde o idioma trabalha com mecanismos diferentes.',
      icon: 'NO',
      highlight: 'don\'t / doesn\'t / didn\'t • isn\'t / aren\'t • never / nobody',
      teachingPoints: [
        'Separar com clareza a negação de "ser/estar" da negação de ações comuns.',
        'Usar don\'t, doesn\'t e didn\'t sem duplicar marca de tempo ou de pessoa no verbo principal.',
        'Adotar as contrações que realmente aparecem na fala natural, em vez de montar frases duras e literais.',
        'Entender por que palavras como never, nobody e nothing já negam a frase sozinhas.',
        'Evitar a dupla negação que parece natural para quem pensa em português, mas quebra a lógica do inglês padrão.'
      ],
      sections: [
        {
          id: 'negar-ser-estar',
          title: 'Quando o próprio verbo já segura o não — am not, isn\'t, aren\'t',
          explanation: 'Quando a frase envolve "ser" ou "estar" em inglês (am, is, are), a negação é simples: você coloca "not" logo depois. "I am not" → "I\'m not". "She is not" → "She isn\'t". "They are not" → "They aren\'t". Não precisa de nenhuma palavra de apoio extra — o próprio "am/is/are" já faz o trabalho. Nas formas contraídas — que é como todo mundo fala no dia a dia — "am not" não tem contração para "amn\'t" (exceto em algumas variantes do inglês britânico). O jeito comum é "I\'m not".',
          examples: [
            { en: 'I\'m not ready yet.', pt: 'Eu ainda não estou pronto.' },
            { en: 'She isn\'t at home.', pt: 'Ela não está em casa.' },
            { en: 'They aren\'t from here.', pt: 'Eles não são daqui.' },
            { en: 'It isn\'t raining.', pt: 'Não está chovendo.' },
            { en: 'We aren\'t hungry.', pt: 'A gente não está com fome.' },
            { en: 'He\'s not my boss.', pt: 'Ele não é meu chefe.' },
            { en: 'That\'s not what I meant.', pt: 'Não foi isso que eu quis dizer.' }
          ],
          exercises: [
            'Transforme em negativa: "She is a doctor."',
            'Complete com a forma contraída: "I ___ tired." (am not)',
            'Corrija: "They not are from Brazil." → correto: ___',
            'Qual a diferença entre "He\'s not" e "He isn\'t"? (são iguais ou diferentes?)',
            'Traduza: "A gente não está atrasado."'
          ]
        },
        {
          id: 'negar-acoes-presente',
          title: 'O não das ações comuns — don\'t e doesn\'t em uso real',
          explanation: 'Pra negar qualquer ação no presente (que não seja "ser/estar"), você precisa de "don\'t" ou "doesn\'t" antes da ação na forma base. Use "don\'t" para I, you, we e they. Use "doesn\'t" para he, she e it. Importante: quando você usa "doesn\'t", o verbo principal PERDE o "-s" que ele normalmente teria. Então "she likes" vira "she doesn\'t like" — e não "she doesn\'t likes". O "-s" vai pra palavrinha de apoio, não pro verbo principal.',
          examples: [
            { en: 'I don\'t eat meat.', pt: 'Eu não como carne.' },
            { en: 'She doesn\'t like loud music.', pt: 'Ela não gosta de música alta.' },
            { en: 'They don\'t have a car.', pt: 'Eles não têm carro.' },
            { en: 'He doesn\'t work on weekends.', pt: 'Ele não trabalha nos fins de semana.' },
            { en: 'We don\'t need help.', pt: 'A gente não precisa de ajuda.' },
            { en: 'It doesn\'t make sense.', pt: 'Não faz sentido.' },
            { en: 'You don\'t have to go.', pt: 'Você não precisa ir.' }
          ],
          exercises: [
            'Negue: "He plays guitar every day."',
            'Corrija: "She doesn\'t likes coffee." → correto: ___',
            'Qual usar, don\'t ou doesn\'t? "___ your sister study English?"',
            'Traduza: "Eu não entendo essa palavra."',
            'Complete: "They ___ have time for this."'
          ]
        },
        {
          id: 'negar-passado',
          title: 'O passado que não aconteceu — a lógica limpa do didn\'t',
          explanation: 'Para negar ações no passado, usa-se "didn\'t" (a forma curta de "did not") para qualquer pessoa — I, you, he, she, it, we, they. Depois de "didn\'t", o verbo principal volta à forma base, sem "-ed" ou forma irregular. Então "she went" vira "she didn\'t go", não "she didn\'t went". Pense assim: o "didn\'t" já carrega toda a informação de passado + negação. O verbo principal fica "neutro".',
          examples: [
            { en: 'I didn\'t sleep well.', pt: 'Eu não dormi bem.' },
            { en: 'He didn\'t call me back.', pt: 'Ele não me retornou a ligação.' },
            { en: 'We didn\'t go to the party.', pt: 'A gente não foi pra festa.' },
            { en: 'She didn\'t finish the report.', pt: 'Ela não terminou o relatório.' },
            { en: 'They didn\'t know about it.', pt: 'Eles não sabiam disso.' },
            { en: 'I didn\'t mean to hurt you.', pt: 'Eu não quis te machucar.' },
            { en: 'It didn\'t work out.', pt: 'Não deu certo.' }
          ],
          exercises: [
            'Corrija: "She didn\'t went home." → correto: ___',
            'Negue no passado: "They visited the museum."',
            'Traduza: "Eu não sabia que você estava aqui."',
            'Complete: "He ___ ___ (not/understand) the question."',
            'Por que "I didn\'t ate" está errado? Explique a lógica.'
          ]
        },
        {
          id: 'never-nobody-nothing',
          title: 'Quando a própria palavra já nega a frase — never, nobody, nothing',
          explanation: 'O inglês tem palavras que já carregam negação dentro delas: "never" (nunca), "nobody/no one" (ninguém), "nothing" (nada), "nowhere" (em lugar nenhum), "no longer" (não mais). A diferença crucial com o português: em inglês, quando você usa essas palavras, a frase fica POSITIVA — sem o "don\'t" ou "doesn\'t". No português dizemos "eu não faço nada" — duas negações. Em inglês, é "I do nothing" ou "I don\'t do anything". Nunca "I don\'t do nothing" — isso é dupla negação e soa errado.',
          examples: [
            { en: 'I never drink soda.', pt: 'Eu nunca bebo refrigerante.' },
            { en: 'Nobody called while you were out.', pt: 'Ninguém ligou enquanto você estava fora.' },
            { en: 'There\'s nothing in the fridge.', pt: 'Não tem nada na geladeira.' },
            { en: 'I have nothing to say.', pt: 'Não tenho nada a dizer.' },
            { en: 'She never complains.', pt: 'Ela nunca reclama.' },
            { en: 'No one knew the answer.', pt: 'Ninguém sabia a resposta.' }
          ],
          exercises: [
            'Traduza sem dupla negação: "Eu não faço nada aos domingos."',
            'Corrija: "I don\'t never eat sugar." → correto: ___',
            'Complete: "___ answered the door." (ninguém)',
            'Qual a diferença entre "nothing" e "anything" nesse contexto?',
            'Monte: "Ela nunca chega no horário." em inglês.'
          ]
        }
      ],
      curiosities: [
        'Dupla negação: em inglês padrão, duas negações se cancelam. "I don\'t know nothing" tecnicamente significa "I know something". Mas em inglês informal americano (e em muitos dialetos), a dupla negação é usada para reforçar — exatamente o contrário da gramática formal.',
        '"Won\'t" é a contração de "will not". Curiosamente, não segue o padrão "will" → "willn\'t". É uma forma histórica que sobreviveu.',
        'Em inglês britânico formal, "needn\'t" (need not) ainda é usado: "You needn\'t worry." No inglês americano, isso soa antiquado — usaria "you don\'t need to worry".'
      ]
    },

    passado: {
      title: 'Falar sobre o que já aconteceu — ontem, semana passada, antes',
      objective: 'Aprenda a narrar o passado em inglês com mais precisão, separando ação concluída, cena em andamento e verbos que fogem do padrão sem depender de chute.',
      icon: 'PA',
      highlight: 'worked / went / saw • was doing • had done',
      teachingPoints: [
        'Reconhecer quando o passado simples resolve a frase e quando ele não dá conta sozinho.',
        'Distinguir uma ação concluída de uma ação que estava em andamento em um momento do passado.',
        'Ganhar segurança com os verbos irregulares mais frequentes, sem misturar forma afirmativa, negativa e pergunta.',
        'Combinar uma cena em progresso com outra ação que entra e interrompe o fluxo.',
        'Perceber como o inglês empacota sequência temporal para contar o que veio antes e o que veio depois.'
      ],
      sections: [
        {
          id: 'passado-simples-regular',
          title: 'Quando o passado fecha a cena — o caminho regular do -ed',
          explanation: 'Para ações que aconteceram e terminaram no passado, usamos o passado simples. Nos verbos regulares, você só adiciona "-ed" no final — sem se importar com quem fez. "I worked", "she worked", "they worked" — é tudo igual. Atenção: se o verbo já termina em "e", só adicione "d": "love" → "loved". Se termina em consoante + vogal + consoante curta, dobra a última: "stop" → "stopped". Se termina em "y" precedido de consoante, troca por "-ied": "study" → "studied".',
          examples: [
            { en: 'I walked to work yesterday.', pt: 'Eu fui caminhando pro trabalho ontem.' },
            { en: 'She cooked dinner last night.', pt: 'Ela cozinhou o jantar ontem à noite.' },
            { en: 'They played football on Saturday.', pt: 'Eles jogaram futebol no sábado.' },
            { en: 'He called me this morning.', pt: 'Ele me ligou essa manhã.' },
            { en: 'We watched a movie together.', pt: 'A gente assistiu um filme juntos.' },
            { en: 'She studied all night.', pt: 'Ela estudou a noite toda.' },
            { en: 'It stopped raining around noon.', pt: 'Parou de chover por volta do meio-dia.' }
          ],
          exercises: [
            'Coloque no passado: "She works at the hospital."',
            'Qual a forma passada de "study"? Por que muda?',
            'Complete: "They ___ (arrive) late to the meeting."',
            'Crie uma frase sobre o que você fez ontem usando 3 verbos regulares.',
            'Corrija: "He stoped the car." → correto: ___'
          ]
        },
        {
          id: 'verbos-irregulares',
          title: 'Os verbos que escapam do padrão — o núcleo dos irregulares',
          explanation: 'Cerca de 200 verbos em inglês são irregulares: eles não ganham "-ed" no passado — mudam de forma. Não há regra única, mas os mais usados aparecem tanto que você vai absorvendo naturalmente. Alguns ficam completamente diferentes (go → went, buy → bought), outros ficam iguais (cut → cut, put → put). A boa notícia: no negativo e na pergunta de todos eles, você usa "didn\'t + forma base", então não precisa se preocupar com a forma irregular nesses casos.',
          examples: [
            { en: 'I went to the mall. (go → went)', pt: 'Eu fui ao shopping.' },
            { en: 'She bought a new phone. (buy → bought)', pt: 'Ela comprou um celular novo.' },
            { en: 'He saw her at the gym. (see → saw)', pt: 'Ele a viu na academia.' },
            { en: 'We ate pizza for lunch. (eat → ate)', pt: 'A gente comeu pizza no almoço.' },
            { en: 'They came home late. (come → came)', pt: 'Eles chegaram em casa tarde.' },
            { en: 'I told you! (tell → told)', pt: 'Eu te falei!' },
            { en: 'She didn\'t go. (negativa — sem "went")', pt: 'Ela não foi.' }
          ],
          exercises: [
            'Qual o passado de: go / buy / see / eat / come / tell / get?',
            'Monte a frase: "Eu comprei isso ontem." (buy)',
            'Por que "She didn\'t went" está errado?',
            'Crie 3 frases sobre o seu fim de semana usando verbos irregulares.',
            'Complete: "He ___ (get) home at midnight."'
          ]
        },
        {
          id: 'estava-acontecendo',
          title: 'A cena em andamento que é cortada por outra ação',
          explanation: 'Às vezes queremos dizer que algo estava em andamento — um processo em curso — quando outra coisa aconteceu. Em inglês, isso é expresso com "was/were + ação com -ing". "Was" para I, he, she, it. "Were" para you, we, they. O padrão clássico combina dois eventos: o que estava acontecendo (was/were + -ing) e o que interrompeu (passado simples). É exatamente o "estava fazendo algo quando X aconteceu" do português.',
          examples: [
            { en: 'I was sleeping when the alarm went off.', pt: 'Eu estava dormindo quando o alarme tocou.' },
            { en: 'She was cooking when he arrived.', pt: 'Ela estava cozinhando quando ele chegou.' },
            { en: 'They were playing outside when it started to rain.', pt: 'Eles estavam brincando do lado de fora quando começou a chover.' },
            { en: 'I was watching TV at 9pm.', pt: 'Eu estava assistindo TV às 21h.' },
            { en: 'What were you doing when I called?', pt: 'O que você estava fazendo quando eu liguei?' },
            { en: 'We were having dinner when the power went out.', pt: 'A gente estava jantando quando a luz foi embora.' }
          ],
          exercises: [
            'Complete: "She ___ ___ (read) when I knocked." (estava lendo)',
            'Combine as ações: "I study / the phone rings" → usando was/were + -ing.',
            'Traduza: "O que você estava fazendo às 10h da noite?"',
            'Corrija: "They was working." → correto: ___',
            'Crie uma frase com "was + -ing" sobre um momento específico da sua vida.'
          ]
        }
      ],
      curiosities: [
        'O inglês tinha mais tempos verbais no passado — o Old English (falado há mais de 1000 anos) tinha um sistema de conjugação tão complexo quanto o português. Ao longo dos séculos, foi simplificando.',
        '"Just" com passado: no inglês britânico, "I\'ve just arrived" (com present perfect). No inglês americano, "I just arrived" (com passado simples) é igualmente aceito.',
        'Alguns verbos irregulares são iguais no presente e no passado: "I cut the bread today" e "I cut the bread yesterday" são idênticos. O contexto (today / yesterday) indica o tempo.'
      ]
    },

    futuro: {
      title: 'Falar sobre o que vai acontecer — planos, decisões e previsões',
      objective: 'Aprenda a escolher a forma de futuro que combina com a intenção da frase — decisão do momento, plano já pensado ou compromisso que já parece marcado.',
      icon: 'FU',
      highlight: 'will • going to • am/is/are doing',
      teachingPoints: [
        'Entender por que "will" não é sinônimo automático de futuro em inglês.',
        'Usar "will" quando a frase pede decisão imediata, promessa ou previsão sem evidência concreta.',
        'Usar "going to" quando a intenção já existia antes ou quando há um sinal claro diante de você.',
        'Usar o presente contínuo para compromissos que já soam agendados, combinados ou confirmados.',
        'Escolher a forma de futuro pelo contexto, e não por tradução literal do português.'
      ],
      sections: [
        {
          id: 'will-na-hora',
          title: 'O futuro que nasce no instante — decisões, promessas e will',
          explanation: '"Will" é usado para três situações principais. Primeira: você acabou de tomar uma decisão na hora — não estava planejado. "The phone is ringing." "I\'ll get it!" (Vou atender! — decisão tomada agora). Segunda: promessas e ofertas espontâneas. "I\'ll help you with that." Terceira: previsões sobre o futuro sem evidência concreta — palpites. "I think it will rain tomorrow." Estrutura: will + verbo na forma base. Negativa: won\'t (will not). Para qualquer pessoa — I will, you will, he will — nunca muda.',
          examples: [
            { en: 'I\'ll call you later. (decidi agora)', pt: 'Eu te ligo mais tarde.' },
            { en: 'Don\'t worry, I\'ll help you.', pt: 'Não se preocupa, eu te ajudo.' },
            { en: 'I think it will be cold tomorrow.', pt: 'Acho que vai fazer frio amanhã.' },
            { en: 'She won\'t like this idea.', pt: 'Ela não vai gostar dessa ideia.' },
            { en: 'Will you marry me?', pt: 'Você quer casar comigo?' },
            { en: 'I\'ll have the chicken, please.', pt: 'Vou querer o frango, por favor. (num restaurante)' },
            { en: 'He\'ll probably be late again.', pt: 'Ele provavelmente vai se atrasar de novo.' }
          ],
          exercises: [
            'Você está em casa e o telefone toca. O que você diz em inglês? (pegar / answer)',
            'Faça uma promessa em inglês: "eu te ligo amanhã cedo."',
            'Complete com will/won\'t: "I\'m sure she ___ pass the exam."',
            'Qual é a contração de "will not"?',
            'Crie uma previsão sobre o tempo usando "will".'
          ]
        },
        {
          id: 'going-to-plano',
          title: 'Quando o plano já existe antes da fala — going to',
          explanation: '"Going to" é usado quando você já tinha a intenção ou o plano antes de falar. Não é uma decisão nova — é algo que você já pensou. "Are you busy this weekend?" "Yes, I\'m going to visit my parents." (Já estava planejado). Também é usado para previsões quando você tem uma evidência na sua frente: "Look at those clouds — it\'s going to rain." Você está vendo as nuvens escuras — não é um palpite, é uma conclusão. Estrutura: am/is/are + going to + verbo base. Para qualquer pessoa, o que muda é só o am/is/are.',
          examples: [
            { en: 'I\'m going to study tonight.', pt: 'Eu vou estudar hoje à noite. (já planejei)' },
            { en: 'She\'s going to start a new job next month.', pt: 'Ela vai começar um emprego novo no mês que vem.' },
            { en: 'We\'re going to move to a bigger apartment.', pt: 'A gente vai se mudar pra um apartamento maior.' },
            { en: 'Look at those clouds — it\'s going to rain!', pt: 'Olha essas nuvens — vai chover! (evidência)' },
            { en: 'Are you going to tell him the truth?', pt: 'Você vai falar a verdade pra ele?' },
            { en: 'He\'s not going to like this.', pt: 'Ele não vai gostar disso.' },
            { en: 'They\'re going to get married in December.', pt: 'Eles vão se casar em dezembro.' }
          ],
          exercises: [
            'Qual usar — will ou going to? "Já decidi: ___ viajar nas férias."',
            'Qual usar? Você vê alguém prestes a cair. O que diz?',
            'Complete: "She ___ ___ ___ (be going to / study) medicine."',
            'Crie uma frase sobre um plano seu para este mês.',
            'Qual a diferença entre "I think it will rain" e "Look! It\'s going to rain"?'
          ]
        },
        {
          id: 'compromissos-marcados',
          title: 'O futuro que já parece marcado no calendário',
          explanation: 'Em inglês, quando algo está firmemente agendado — você já marcou, comprou passagem, fez reserva — você pode usar a forma de "estar fazendo" (am/is/are + -ing) para falar de futuro. Isso é comum para eventos que têm hora, local e confirmação: "I\'m meeting John at 3pm tomorrow." (já está marcado no calendário). É diferente de "going to" porque implica que já tem tudo combinado — não é só intenção. No dia a dia, é muito usada para viagens, reuniões, consultas e eventos.',
          examples: [
            { en: 'I\'m flying to New York next Tuesday.', pt: 'Vou voar para Nova York na próxima terça. (passagem comprada)' },
            { en: 'She\'s having lunch with her boss tomorrow.', pt: 'Ela vai almoçar com o chefe amanhã. (já marcado)' },
            { en: 'We\'re starting the new project on Monday.', pt: 'A gente começa o projeto novo na segunda.' },
            { en: 'Are you doing anything tonight?', pt: 'Você tem alguma coisa hoje à noite?' },
            { en: 'They\'re getting married in June.', pt: 'Eles vão se casar em junho. (já está tudo organizado)' }
          ],
          exercises: [
            'Qual das três formas usar para dizer "já comprei a passagem para o Rio"?',
            'Complete com a forma correta: "___ you ___ anything this weekend?" (tem planos?)',
            'Crie uma frase sobre algo que você tem marcado na próxima semana.',
            'Qual a diferença prática entre "I\'m going to the gym" e "I\'ll go to the gym"?',
            'Traduza: "Ela está se encontrando com o cliente na sexta."'
          ]
        }
      ],
      curiosities: [
        'O inglês não tem um "tempo verbal do futuro" de verdade — "will" é na verdade um verbo modal, não uma conjugação temporal. É por isso que ele nunca muda: "I will", "he will" — sem "wills".',
        '"Shall" era o futuro formal do inglês britânico para "I" e "we". Hoje em dia está quase desaparecendo, aparecendo só em perguntas educadas: "Shall we go?" (Vamos embora?).',
        '"I\'m going to" na fala rápida vira "I\'m gonna" — você vai ouvir muito isso em músicas, filmes e séries. Não é errado, é só informal.'
      ]
    },

    gerundio: {
      title: 'A forma -ING e o "to" — quando usar cada uma depois de uma ação',
      objective: 'Aprenda a decidir entre -ing e to com mais critério, entendendo quando a escolha segue padrão e quando ela muda o sentido inteiro da frase.',
      icon: 'IG',
      highlight: 'enjoy + -ing • want + to • stop + -ing vs stop + to',
      teachingPoints: [
        'Separar os usos mais comuns da forma -ing antes de tentar decorar listas de verbos.',
        'Reconhecer os verbos que naturalmente puxam -ing na ação seguinte.',
        'Reconhecer os verbos que exigem "to + verbo base" e não aceitam troca livre.',
        'Perceber os casos em que trocar -ing por to muda o que a frase quer dizer.',
        'Usar -ing com segurança depois de preposições e em blocos que aparecem o tempo todo na fala real.'
      ],
      sections: [
        {
          id: 'o-que-e-ing',
          title: 'Antes de escolher, entenda o que a forma -ing está fazendo',
          explanation: 'A forma -ing no inglês aparece em três situações diferentes e é fácil confundir. Primeira: no "está fazendo" — quando a ação está em andamento agora. "She is working." Segunda: como um jeito de nomear uma ação — transformando ela num "conceito". "Swimming is fun" (Nadar é divertido). Terceira: depois de certas palavras e depois de preposições. Nessa aula, o foco é no segundo e terceiro casos. Regras de formação: verbo + -ing. Se termina em "e", tira o "e": "write" → "writing". Se termina em consoante curta + vogal + consoante, dobra: "run" → "running".',
          examples: [
            { en: 'Swimming is great exercise.', pt: 'Nadar é um ótimo exercício. (-ing como conceito)' },
            { en: 'I love cooking for friends.', pt: 'Adoro cozinhar para os amigos.' },
            { en: 'Smoking is not allowed here.', pt: 'É proibido fumar aqui.' },
            { en: 'She is good at singing.', pt: 'Ela é boa em cantar. (depois de "at")' },
            { en: 'He\'s thinking about moving abroad.', pt: 'Ele está pensando em se mudar para o exterior.' },
            { en: 'Before leaving, check your bag.', pt: 'Antes de sair, cheque sua bolsa.' }
          ],
          exercises: [
            'Qual a forma -ing de: write / run / come / play / swim?',
            'Complete: "___ (run) every day is good for your health."',
            'Crie uma frase usando -ing depois de "before".',
            'Qual a diferença entre "I am eating" e "Eating is important"?',
            'Complete: "She\'s interested in ___ (learn) Japanese."'
          ]
        },
        {
          id: 'verbos-que-pedem-ing',
          title: 'Os verbos que puxam naturalmente o -ing',
          explanation: 'Alguns verbos, quando seguidos de outra ação, exigem o -ing. Não há uma lógica perfeita — é questão de memorizar os mais usados. Os principais: enjoy (curtir), love/like/hate (quando expressam sentimento geral), finish (terminar), avoid (evitar), suggest (sugerir), consider (considerar), keep (continuar), mind (se importar), deny (negar), practice (praticar), miss (sentir saudade de), risk (arriscar), imagine (imaginar), can\'t stand (não suportar), stop (parar uma ação), remember (lembrar de algo que já aconteceu).',
          examples: [
            { en: 'I enjoy running in the morning.', pt: 'Eu curto correr de manhã.' },
            { en: 'He finished reading the book.', pt: 'Ele terminou de ler o livro.' },
            { en: 'Avoid eating too much sugar.', pt: 'Evite comer açúcar demais.' },
            { en: 'She keeps talking about her trip.', pt: 'Ela fica falando da viagem dela.' },
            { en: 'Do you mind waiting a moment?', pt: 'Você se importa de esperar um momento?' },
            { en: 'I miss living in Rio.', pt: 'Sinto saudades de morar no Rio.' },
            { en: 'I can\'t stand waiting in line.', pt: 'Não suporto ficar na fila.' }
          ],
          exercises: [
            'Complete: "I enjoy ___ (cook) on Sundays."',
            'Corrija: "She finished to read the book." → correto: ___',
            'Crie uma frase com "avoid" ou "keep".',
            'Traduza: "Ele não suporta acordar cedo."',
            'Complete: "Would you mind ___ (open) the window?"'
          ]
        },
        {
          id: 'verbos-que-pedem-to',
          title: 'Os verbos que abrem espaço para o to + verbo',
          explanation: 'Outros verbos pedem "to + verbo base" depois deles. Os mais usados: want (querer), need (precisar), would like (gostar de), hope (esperar), decide (decidir), plan (planejar), promise (prometer), agree (concordar), refuse (recusar), manage (conseguir), afford (poder financeiramente), seem (parecer), expect (esperar/prever), learn (aprender), try (tentar — com sentido de esforço), forget (esquecer de fazer algo), remember (lembrar de fazer algo no futuro).',
          examples: [
            { en: 'I want to learn English.', pt: 'Eu quero aprender inglês.' },
            { en: 'She decided to quit her job.', pt: 'Ela decidiu largar o emprego.' },
            { en: 'He promised to call back.', pt: 'Ele prometeu retornar a ligação.' },
            { en: 'They refused to sign the contract.', pt: 'Eles se recusaram a assinar o contrato.' },
            { en: 'I can\'t afford to travel right now.', pt: 'Não tenho condições de viajar agora.' },
            { en: 'Remember to lock the door.', pt: 'Lembra de trancar a porta. (no futuro)' },
            { en: 'She managed to finish on time.', pt: 'Ela conseguiu terminar a tempo.' }
          ],
          exercises: [
            'Complete: "I need ___ (talk) to you."',
            'Corrija: "He wants going to the gym." → correto: ___',
            'Qual a diferença entre "remember doing" e "remember to do"?',
            'Crie uma frase com "decide" ou "plan".',
            'Traduza: "Ela se recusou a responder."'
          ]
        },
        {
          id: 'mudanca-de-significado',
          title: 'Quando trocar a forma troca o sentido inteiro da frase',
          explanation: 'Quatro verbos têm significados completamente diferentes dependendo de usar -ing ou to: STOP: "stop + -ing" = parar de fazer algo ("He stopped smoking" = ele parou de fumar). "stop + to" = parar para fazer outra coisa ("He stopped to smoke" = ele parou para fumar — ou seja, estava fazendo outra coisa e parou para acender um cigarro). REMEMBER: "-ing" = lembrar de algo que já aconteceu ("I remember meeting her" = lembro de quando a conheci). "to" = lembrar de fazer algo ainda ("Remember to send the email" = não esqueça de mandar). TRY: "-ing" = experimentar algo para ver o resultado. "to" = tentar com esforço. FORGET: "-ing" = não consegue esquecer algo do passado. "to" = esquecer de fazer algo.',
          examples: [
            { en: 'She stopped smoking. (parou de fumar)', pt: 'Ela parou de fumar.' },
            { en: 'She stopped to smoke. (parou para acender um cigarro)', pt: 'Ela parou para fumar.' },
            { en: 'I remember locking the door. (lembro que fiz isso)', pt: 'Lembro de ter trancado a porta.' },
            { en: 'Remember to lock the door. (não esqueça de fazer)', pt: 'Lembra de trancar a porta.' },
            { en: 'Try adding salt — maybe it improves. (experimente)', pt: 'Tenta colocar sal — talvez melhore.' },
            { en: 'I tried to open it, but it was stuck. (tentei com esforço)', pt: 'Tentei abrir, mas estava emperrado.' }
          ],
          exercises: [
            'Qual o significado de "He stopped to eat" vs "He stopped eating"?',
            'Complete corretamente: "I forgot ___ (send) the email." (não mandei)',
            'Complete: "I\'ll never forget ___ (meet) you for the first time."',
            'Traduza: "Tenta dormir mais cedo — talvez ajude."',
            'Crie um par de frases com "remember + -ing" e "remember + to".'
          ]
        }
      ],
      curiosities: [
        '"I like swimming" vs "I like to swim" — nos EUA, ambas são aceitas com pouca diferença. No inglês britânico, "I like to swim" pode indicar um hábito deliberado, enquanto "I like swimming" é um prazer geral.',
        'A forma -ing é chamada de "gerund" em inglês, mas os próprios nativos nunca pensam nessa categoria. Eles simplesmente sabem quais verbos pedem qual forma por exposição.',
        '"Used to + -ing" (estar acostumado) vs "used to + verb base" (costumava fazer). "I\'m used to waking up early" (estou acostumado) vs "I used to wake up early" (eu costumava acordar cedo, mas não mais).'
      ]
    },

    preposicoes: {
      title: 'In, on, at, to — as palavrinhas que indicam onde, quando e para onde',
      objective: 'Aprenda a usar as preposições mais confusas do inglês pela lógica de espaço, tempo e direção, em vez de depender de tradução solta palavra por palavra.',
      icon: 'IN',
      highlight: 'in / on / at para lugar • in / on / at para tempo • to / into / from',
      teachingPoints: [
        'Visualizar a lógica de in, on e at como níveis diferentes de localização, e não como equivalentes diretos de "em".',
        'Reaplicar essa mesma lógica quando a conversa sai do espaço e entra no tempo.',
        'Distinguir destino, origem e entrada em movimento com to, from, into e out of.',
        'Reconhecer expressões fixas em que a preposição precisa ser aprendida como bloco.',
        'Reduzir as trocas automáticas que nascem da interferência do português.'
      ],
      sections: [
        {
          id: 'lugar-in-on-at',
          title: 'Localizar no espaço sem traduzir no automático — in, on, at',
          explanation: 'A lógica das três preposições de lugar: IN é para espaços com volume — você está dentro de algo: dentro de um país, cidade, sala, caixa, bolsa. ON é para superfícies — algo está sobre ou em contato com uma superfície: em cima da mesa, na parede, no ônibus (você está sobre o assento), na rua (você está sobre o asfalto). AT é para pontos específicos — um endereço, uma localização precisa, um evento: no aeroporto, na escola, no trabalho, no médico. Dica: quanto mais específico o lugar, mais provável que seja "at".',
          examples: [
            { en: 'I live in Brazil. / She\'s in the kitchen.', pt: 'Eu moro no Brasil. / Ela está na cozinha.' },
            { en: 'The cup is on the table.', pt: 'A xícara está na mesa.' },
            { en: 'There\'s a fly on the wall.', pt: 'Tem uma mosca na parede.' },
            { en: 'I\'m at the airport.', pt: 'Estou no aeroporto.' },
            { en: 'She\'s at work / at school / at the doctor\'s.', pt: 'Ela está no trabalho / na escola / no médico.' },
            { en: 'He\'s on the bus / on the train / on the plane.', pt: 'Ele está no ônibus / no trem / no avião.' },
            { en: 'Meet me at the corner of the street.', pt: 'Me encontra na esquina da rua.' }
          ],
          exercises: [
            'Complete: "I saw her ___ the supermarket." (in ou at?)',
            'Complete: "The keys are ___ the table." (in ou on?)',
            'Por que usamos "on the bus" e não "in the bus"?',
            'Complete: "She works ___ a hospital ___ the city center."',
            'Crie uma frase descrevendo onde você está agora usando in, on ou at.'
          ]
        },
        {
          id: 'tempo-in-on-at',
          title: 'Organizando o tempo com a mesma lógica de espaço',
          explanation: 'A mesma lógica dos três níveis funciona para tempo. IN é para períodos longos: meses (in March), anos (in 2024), décadas (in the 90s), estações (in summer), partes do dia (in the morning, in the afternoon, in the evening). ON é para dias: dias da semana (on Monday), datas (on March 15th), feriados que têm "day" (on Christmas Day). AT é para momentos precisos: horas (at 3pm), refeições (at lunch, at dinner), momentos específicos (at the weekend — britânico, at night, at noon, at midnight). Exceção: "at night" mas "in the morning/afternoon/evening".',
          examples: [
            { en: 'I was born in 1995.', pt: 'Eu nasci em 1995.' },
            { en: 'The meeting is on Friday.', pt: 'A reunião é na sexta-feira.' },
            { en: 'She called at 7pm.', pt: 'Ela ligou às 19h.' },
            { en: 'We always go out on weekends.', pt: 'A gente sempre sai nos fins de semana.' },
            { en: 'It\'s cold in winter here.', pt: 'Faz frio no inverno aqui.' },
            { en: 'I study in the morning and work in the afternoon.', pt: 'Estudo de manhã e trabalho de tarde.' },
            { en: 'See you at noon! / at midnight!', pt: 'Te vejo ao meio-dia! / à meia-noite!' }
          ],
          exercises: [
            'Complete: "She was born ___ July ___ 1990."',
            'Complete: "___ Monday morning, I have a meeting."',
            'Por que "at night" e não "in the night"?',
            'Traduza: "Nos anos 80, as pessoas dançavam muito."',
            'Complete: "The show starts ___ 8pm ___ Saturday."'
          ]
        },
        {
          id: 'movimento-to-from',
          title: 'Destino, origem e entrada em movimento — to, from, into, out of',
          explanation: 'Para indicar destino ou direção, use TO: "I\'m going to the store", "She walked to school". Para indicar origem, use FROM: "She\'s from Brazil", "He came from the meeting". A diferença entre ON e INTO: "on" é estático (está em cima), "into" implica movimento para dentro. "He walked into the room" (entrou no quarto — movimento). Compare com "He is in the room" (está dentro). OUT OF é o oposto de INTO: "She walked out of the building". Atenção: "go home" — sem "to"! Em inglês, "home" funciona diferente.',
          examples: [
            { en: 'I\'m going to the gym.', pt: 'Estou indo para a academia.' },
            { en: 'She\'s from São Paulo.', pt: 'Ela é de São Paulo.' },
            { en: 'He walked into the office.', pt: 'Ele entrou no escritório (andando).' },
            { en: 'The cat jumped out of the box.', pt: 'O gato pulou para fora da caixa.' },
            { en: 'I\'m going home. (sem "to"!)', pt: 'Estou indo para casa.' },
            { en: 'She commutes from Campinas to São Paulo.', pt: 'Ela vai de Campinas para São Paulo todo dia.' },
            { en: 'Come to me.', pt: 'Vem até mim.' }
          ],
          exercises: [
            'Por que "go home" e não "go to home"?',
            'Complete: "She drove ___ work." (para o trabalho)',
            'Qual a diferença: "He\'s in the car" vs "He got into the car"?',
            'Traduza: "Ela saiu do apartamento às 8h."',
            'Complete: "I\'m originally ___ Minas Gerais."'
          ]
        }
      ],
      curiosities: [
        'No inglês americano: "on the weekend" (no fim de semana). No inglês britânico: "at the weekend". As duas estão corretas — é só diferença regional.',
        '"In time" (a tempo, com margem) vs "on time" (pontualmente, na hora exata): "I arrived in time to catch the bus" (cheguei a tempo de pegar o ônibus) vs "The train arrived on time" (o trem chegou no horário).',
        'Algumas preposições são fixas em expressões e não seguem lógica: "interested IN", "good AT", "afraid OF", "responsible FOR", "married TO", "depend ON". Melhor memorizar como bloco do que tentar encontrar a regra.'
      ]
    },

    verbos: {
      title: 'Os verbos mais poderosos do inglês — ser, poder, ter que e muito mais',
      objective: 'Domine os verbos que sustentam o inglês do cotidiano — os que montam identidade, obrigação, possibilidade e também aqueles que mudam de sentido quando aparecem em bloco.',
      icon: 'VB',
      highlight: 'to be • can / must / should • get up / give up / look up',
      teachingPoints: [
        'Ganhar domínio sobre o "to be", que aparece em identidade, estado, pergunta e várias estruturas centrais do idioma.',
        'Usar verbos modais para ajustar habilidade, obrigação, conselho e possibilidade com o peso certo.',
        'Entender que modais pedem verbo base e por isso mudam a montagem da frase inteira.',
        'Ler phrasal verbs como blocos de sentido, e não como soma literal de duas palavras isoladas.',
        'Evitar erros clássicos que soam traduzidos do português e travam a naturalidade da fala.'
      ],
      sections: [
        {
          id: 'to-be',
          title: 'O verbo que sustenta o idioma inteiro — to be',
          explanation: '"To be" significa ser E estar — o inglês não distingue. "I am tired" (Estou cansado) e "I am Brazilian" (Sou brasileiro) usam o mesmo verbo. As formas são: I am, you are, he/she/it is, we are, you are, they are. Passado: I was, you were, he/she/it was, we were, they were. Forma negativa: am not, is not (isn\'t), are not (aren\'t). "To be" não usa "do/does/did" — ele mesmo se inverte para fazer pergunta: "Are you ready?" "Is she here?" É também o auxiliar das formas contínuas e passivas.',
          examples: [
            { en: 'I\'m 28 years old.', pt: 'Tenho 28 anos. (em inglês: "sou de 28 anos")' },
            { en: 'She\'s a nurse.', pt: 'Ela é enfermeira.' },
            { en: 'Are you tired? — Yes, I am.', pt: 'Você está cansado? — Sim, estou.' },
            { en: 'It\'s 3pm.', pt: 'São 15h.' },
            { en: 'We were at home last night.', pt: 'A gente estava em casa ontem à noite.' },
            { en: 'He\'s not feeling well.', pt: 'Ele não está se sentindo bem.' },
            { en: 'They were surprised by the news.', pt: 'Eles ficaram surpresos com a notícia.' }
          ],
          exercises: [
            'Corrija: "She is agree with you." → correto: ___',
            'Conjugue to be no presente: I / she / we / they.',
            'Transforme em negativa: "He is ready."',
            'Transforme em pergunta: "They are from Japan."',
            'Qual a diferença entre "I am hungry" e "I was hungry"?'
          ]
        },
        {
          id: 'can-must-should',
          title: 'Ajustando força, obrigação e possibilidade com modais',
          explanation: 'Esses verbos especiais (chamados "modais") modificam o sentido da ação. CAN = habilidade ("I can swim" — sei nadar) ou permissão ("Can I sit here?"). COULD = passado de can ou pedido mais educado ("Could you help me?" — mais gentil que "can you"). MUST = obrigação forte, regra ("You must wear a seatbelt") ou certeza ("She must be tired" — ela deve estar cansada). SHOULD = conselho, o que seria ideal ("You should see a doctor"). MAY/MIGHT = possibilidade ("It may rain" — pode ser que chova). Regra importante: depois de todos eles, o verbo vem na forma base — sem -s, sem -ing, sem -ed.',
          examples: [
            { en: 'I can speak three languages.', pt: 'Eu sei falar três idiomas.' },
            { en: 'Can I open the window?', pt: 'Posso abrir a janela?' },
            { en: 'You must show your ID here.', pt: 'Você deve mostrar sua identidade aqui.' },
            { en: 'You should drink more water.', pt: 'Você devia beber mais água.' },
            { en: 'She might be late.', pt: 'Ela pode estar atrasada (talvez).' },
            { en: 'Could you repeat that, please?', pt: 'Você poderia repetir isso, por favor?' },
            { en: 'You don\'t have to come if you don\'t want to.', pt: 'Você não precisa vir se não quiser.' }
          ],
          exercises: [
            'Corrija: "She cans swim very well." → correto: ___',
            'Qual usar — must ou should? "Isso é lei: você ___ usar cinto."',
            'Qual usar — can ou could? Para um pedido educado ao seu chefe.',
            'Traduza: "Talvez ela chegue cedo."',
            'Qual a diferença entre "must not" (must + not) e "don\'t have to"?'
          ]
        },
        {
          id: 'phrasal-verbs',
          title: 'Quando o verbo vem em bloco e o sentido vira outro',
          explanation: 'Um dos maiores desafios do inglês para brasileiros: verbos que ganham uma segunda palavra (como "up", "out", "on", "off", "in", "away") e mudam completamente de sentido. "Give" sozinho = dar. "Give up" = desistir. "Give out" = distribuir. "Look" sozinho = olhar. "Look up" = pesquisar (num dicionário ou no Google). "Look after" = cuidar de. "Look for" = procurar. Não há como adivinhar — é aprender como expressão fixa. A boa notícia: eles seguem padrões que você vai perceber com o tempo. Os mais importantes para o dia a dia estão abaixo.',
          examples: [
            { en: 'Wake up! It\'s 8am! (acordar)', pt: 'Acorda! São 8h!' },
            { en: 'I give up — this puzzle is impossible. (desistir)', pt: 'Desisti — esse quebra-cabeça é impossível.' },
            { en: 'Can you look after my dog this weekend? (cuidar)', pt: 'Você pode cuidar do meu cachorro nesse fim de semana?' },
            { en: 'I\'m looking for my keys. (procurar)', pt: 'Estou procurando minhas chaves.' },
            { en: 'Look it up on Google. (pesquisar)', pt: 'Pesquisa no Google.' },
            { en: 'Turn off the lights before you leave. (desligar)', pt: 'Apague as luzes antes de sair.' },
            { en: 'She turned down the job offer. (recusar)', pt: 'Ela recusou a proposta de emprego.' },
            { en: 'He showed up two hours late. (aparecer)', pt: 'Ele apareceu duas horas atrasado.' },
            { en: 'Let\'s figure this out together. (resolver/descobrir)', pt: 'Vamos resolver isso juntos.' }
          ],
          exercises: [
            'O que significa "give up"? E "give out"? Crie uma frase para cada.',
            'Complete: "Can you ___ ___ the music? It\'s too loud." (desligar)',
            'Traduza: "Ela recusou a oferta."',
            'O que significa "show up"? Use numa frase do cotidiano.',
            'Pesquise (look up) o significado de: "run out of", "put off" e "break up".'
          ]
        }
      ],
      curiosities: [
        '"To be or not to be" é a frase mais famosa em inglês, de Hamlet de Shakespeare — escrita por volta de 1600. Cinco séculos depois, esse verbo ainda domina o idioma.',
        'O inglês não tem o equivalente do "saudade" português, mas tem "to miss" — que mistura sentir falta de uma pessoa E lamentar ter perdido algo: "I missed the train" (perdi o trem) e "I miss you" (sinto sua falta). Mesma palavra, dois sentidos.',
        'Existem mais de 5.000 phrasal verbs catalogados em inglês. Impossível aprender todos — mas os 50 mais comuns cobrem cerca de 80% das situações do cotidiano. Foque neles.'
      ]
    }
  };

  // ========== PEDAGOGICAL DATA STRUCTURES ==========
  // 5-layer system: Anchor → Table → Glossary → Exercises → Test

  const ANCHOR_DIALOGS = {
    pronomes: {
      dialogue: 'I see that ___1___ are going to the park. Can ___2___ come with me?',
      blanks: [
        { answer: 'you', hint: 'Quem vai? "_____ são". Sujeito = você.' },
        { answer: 'me', hint: 'Depois de preposição: "come with _____".' }
      ]
    }
  };

  const INTERACTIVE_TABLES = {
    pronomes: {
      rows: [
        { pt: 'Eu', en: 'I', category: 'subject', example: 'I work every day.' },
        { pt: 'Você', en: 'You', category: 'subject', example: 'You speak English.' },
        { pt: 'Ele', en: 'He', category: 'subject', example: 'He lives in Rio.' },
        { pt: 'Ela', en: 'She', category: 'subject', example: 'She loves coffee.' },
        { pt: 'Me/mim', en: 'Me', category: 'object', example: 'She called me yesterday.' },
        { pt: 'Você (objeto)', en: 'You', category: 'object', example: 'I saw you at the store.' },
        { pt: 'O/O dele', en: 'Him', category: 'object', example: 'I saw him.' },
        { pt: 'A/A dela', en: 'Her', category: 'object', example: 'I helped her.' }
      ]
    }
  };

  const GLOSSARY_TERMS = {
    sujeito: { pt: 'Quem faz a ação', en: 'Subject - who performs the action', highlight: 'I, you, he, she, we, they' },
    objeto: { pt: 'Quem recebe a ação', en: 'Object - who receives the action', highlight: 'me, you, him, her, us, them' },
    pronome: { pt: 'Palavra que substitui um nome', en: 'Pronoun - word that replaces a noun' },
    verbo: { pt: 'Ação ou estado', en: 'Verb - action or state', highlight: 'work, go, be, have' }
  };

  const SCAFFOLDED_EXERCISES = {
    pronomes: [
      { difficulty: 'easy', q: 'Complete: "___ am Brazilian."', options: ['I', 'Me', 'My'], correct: 0, hints: ['Use sujeito antes do verbo', 'I = I act. Me = someone acts on me.', 'Resposta: I'] },
      { difficulty: 'easy', q: 'Complete: "She called ___"', options: ['I', 'Me', 'My'], correct: 1, hints: ['Use objeto depois do verbo', 'After a verb = object', 'Resposta: Me'] },
      { difficulty: 'moderate', q: '"with you and ___" — qual usar?', options: ['I', 'Me', 'My'], correct: 1, hints: ['Preposição (with) + objeto', 'Teste: "with me" vs "with I"', 'Resposta: Me'] },
      { difficulty: 'moderate', q: 'Qual frase está correta?', options: ['Her lives here.', 'She lives here.', 'Her is here.'], correct: 1, hints: ['Quem faz a ação? → subject', 'Subject: I, you, he, she', 'Resposta: She lives here.'] },
      { difficulty: 'hard', q: 'Complete a frase: "___ enjoy cooking. Can you help ___?"', options: ['I / I', 'Me / me', 'I / me'], correct: 2, hints: ['1ª lacuna: sujeito antes do verbo', '2ª lacuna: objeto depois do verbo', 'Resposta: I / me'] }
    ]
  };

  const FINAL_TESTS = {
    pronomes: [
      { q: 'Em "She calls me", qual é a função de "me"?', options: ['Sujeito', 'Objeto', 'Possessivo'], correct: 1 },
      { q: '"This is for I" — o que está errado?', options: ['Nada, está correto', 'Deveria ser "for me"', 'Falta o verbo'], correct: 1 },
      { q: 'Complete: "___ am going to the party."', options: ['Me', 'I', 'My'], correct: 1 }
    ]
  };

  const PEDAGOGICAL_EDITORIAL = {
    pronomes: {
      kicker: 'Trilha guiada',
      headline: 'Pronomes sem atrito: quem faz, quem recebe e de quem e cada coisa.',
      intro: 'Em vez de decorar listas soltas, esta aula organiza os pronomes pelo uso real. Primeiro voce identifica o papel da palavra na frase. Depois compara, testa e fixa com pratica curta.',
      journey: ['Quem faz a acao', 'Quem recebe a acao', 'Como mostrar posse'],
      sections: [
        {
          label: 'Bloco 1',
          focus: 'Sujeito',
          summary: 'Comece pelo papel mais importante da frase: quem executa a acao. Se a palavra vem antes do verbo e carrega a acao, ela precisa estar no grupo de sujeito.'
        },
        {
          label: 'Bloco 2',
          focus: 'Objeto',
          summary: 'Agora muda a lente: a pessoa nao faz a acao, ela recebe. E aqui que brasileiros costumam travar ao trocar I por me, he por him, she por her.'
        },
        {
          label: 'Bloco 3',
          focus: 'Posse',
          summary: 'Por fim, voce separa duas ideias que parecem iguais em portugues: dizer que algo e meu antes do objeto e dizer que aquilo e meu sem repetir o objeto.'
        }
      ],
      phases: {
        anchor: {
          kicker: 'Aquecimento',
          title: 'Leia a cena e complete como quem ja entendeu o papel de cada pronome.',
          copy: 'Aqui a ideia nao e acertar por acaso. E olhar para a frase e decidir: quem esta fazendo a acao e quem esta entrando depois da preposicao?'
        },
        table: {
          kicker: 'Mapa rapido',
          title: 'Veja o quadro completo antes de avancar para a pratica.',
          copy: 'Use esta tabela como folha de apoio. Ela junta significado em portugues, forma em ingles e um exemplo curto para voce bater o olho e comparar.'
        },
        exercises: {
          kicker: 'Pratica guiada',
          title: 'Agora a teoria vira decisao rapida.',
          copy: 'As questoes foram organizadas do mais direto para o mais traiçoeiro. A ideia e ganhar criterio, nao apenas pontuar.'
        },
        test: {
          kicker: 'Fechamento',
          title: 'Valide se a logica ficou clara sem depender da tabela.',
          copy: 'Se voce passa aqui, significa que ja consegue distinguir funcao na frase e escolher a forma certa com mais naturalidade.'
        }
      }
    },
    perguntas: {
      kicker: 'Trilha guiada',
      headline: 'Perguntas em inglês sem congelar: estrutura primeiro, naturalidade depois.',
      intro: 'Esta aula reorganiza as perguntas do inglês como uma progressão de uso real. Você começa pela engrenagem do do e does, abre o leque com what, where e who, e fecha com o equivalente do nosso "né?".',
      journey: ['Abrir perguntas simples', 'Guiar a pergunta com a palavra certa', 'Fechar com confirmação natural'],
      sections: [
        {
          label: 'Bloco 1',
          focus: 'Estrutura base',
          summary: 'O primeiro passo é aceitar uma diferença central entre português e inglês: a pergunta não nasce só da entonação. Ela precisa de uma engrenagem visível.'
        },
        {
          label: 'Bloco 2',
          focus: 'Perguntas abertas',
          summary: 'Depois da base, você aprende a conduzir a conversa. Aqui entram as palavras que puxam informação específica sem desmontar a ordem da frase.'
        },
        {
          label: 'Bloco 3',
          focus: 'Confirmação',
          summary: 'Por fim, a aula entra no inglês mais conversado. Essas perguntinhas curtas dão tom de naturalidade e mostram como o idioma pede espelhamento e contraste.'
        }
      ]
    },
    negativa: {
      kicker: 'Trilha guiada',
      headline: 'Negação sem ruído: como o inglês diz não em cada tipo de frase.',
      intro: 'Em vez de tratar toda negação como se fosse igual, esta aula separa quatro situações que o inglês resolve de modos diferentes. Isso reduz erro mecânico e dá muito mais controle na hora de falar.',
      journey: ['Negar ser e estar', 'Negar ações no presente', 'Negar o passado e limpar a dupla negação', 'Usar palavras que já negam sozinhas'],
      sections: [
        {
          label: 'Bloco 1',
          focus: 'Ser e estar',
          summary: 'A entrada mais direta da aula mostra que am, is e are já carregam a negação sem pedir ajuda externa. Aqui o foco é simplicidade e forma natural.'
        },
        {
          label: 'Bloco 2',
          focus: 'Ações no presente',
          summary: 'Depois entra o ponto em que mais gente escorrega: negar ações comuns com don\'t e doesn\'t sem duplicar marca de pessoa no verbo principal.'
        },
        {
          label: 'Bloco 3',
          focus: 'Passado',
          summary: 'No passado, a lógica fica até mais limpa. O didn\'t assume o tempo e libera o verbo para voltar ao formato base.'
        },
        {
          label: 'Bloco 4',
          focus: 'Never, nobody, nothing',
          summary: 'A aula fecha mostrando que algumas palavras já nascem negativas. É aqui que o inglês se distancia do português e obriga você a abandonar a dupla negação.'
        }
      ]
    },
    passado: {
      kicker: 'Trilha guiada',
      headline: 'Passado com clareza: terminou, estava acontecendo ou já tinha acontecido?',
      intro: 'Esta lição organiza o passado do inglês em cenas, não em tabelas soltas. Primeiro você aprende a encerrar ações, depois lida com verbos que mudam de forma e, por fim, monta situações em andamento que são interrompidas.',
      journey: ['Encerrar ações', 'Lidar com verbos irregulares', 'Narrar uma cena em andamento'],
      sections: [
        {
          label: 'Bloco 1',
          focus: 'Passado simples',
          summary: 'O começo da aula fixa a ideia mais útil: quando o fato terminou, o inglês o empacota no passado simples. A discussão aqui é forma, padrão e acabamento.'
        },
        {
          label: 'Bloco 2',
          focus: 'Irregulares',
          summary: 'Depois vem o grupo que não segue o -ed. Em vez de tentar forçar regra onde não existe, a aula aproxima esses verbos pelos usos mais frequentes.'
        },
        {
          label: 'Bloco 3',
          focus: 'Cena interrompida',
          summary: 'O fechamento troca lista por narrativa. Você aprende a contar o que estava rolando quando outra ação entrou em cena e cortou o fluxo.'
        }
      ]
    },
    futuro: {
      kicker: 'Trilha guiada',
      headline: 'Futuro em inglês sem chute: decisão da hora, plano ou compromisso marcado.',
      intro: 'A ideia desta aula é desmontar o mito de que will resolve tudo. O inglês distribui futuro por intenção, evidência e grau de compromisso, e essa distinção muda o que você soa para quem ouve.',
      journey: ['Decidir na hora', 'Falar de planos já pensados', 'Mostrar compromisso que já está no calendário'],
      sections: [
        {
          label: 'Bloco 1',
          focus: 'Will',
          summary: 'A primeira camada da aula trata do futuro mais espontâneo. Aqui entram decisão imediata, promessa e previsão sem evidência concreta.'
        },
        {
          label: 'Bloco 2',
          focus: 'Going to',
          summary: 'Depois a aula desloca o foco para intenção prévia. Você não decide agora; você já vinha com isso na cabeça ou está reagindo a um sinal visível.'
        },
        {
          label: 'Bloco 3',
          focus: 'Agenda confirmada',
          summary: 'O último bloco mostra o inglês mais concreto do futuro: aquilo que já parece compromisso, reserva ou encontro marcado e por isso usa a forma de presente contínuo.'
        }
      ]
    },
    gerundio: {
      kicker: 'Trilha guiada',
      headline: 'ING ou to: a escolha pequena que muda o ritmo e o sentido da frase.',
      intro: 'Esta aula organiza um dos pontos mais traiçoeiros do inglês em quatro movimentos. Primeiro você entende o que é a forma -ing, depois separa os verbos que pedem -ing, os que pedem to e os casos em que a escolha muda tudo.',
      journey: ['Entender a forma -ing', 'Reconhecer verbos que puxam -ing', 'Reconhecer verbos que puxam to', 'Perceber quando a escolha muda o sentido'],
      sections: [
        {
          label: 'Bloco 1',
          focus: 'Forma -ing',
          summary: 'A abertura limpa a confusão inicial. A mesma terminação aparece em lugares diferentes, e a aula separa esses usos antes de exigir memorização.'
        },
        {
          label: 'Bloco 2',
          focus: 'Verbos com -ing',
          summary: 'Aqui o foco sai da teoria e entra no padrão de combinação. Alguns verbos puxam naturalmente a ação seguinte em -ing, e o ouvido precisa começar a reconhecer isso.'
        },
        {
          label: 'Bloco 3',
          focus: 'Verbos com to',
          summary: 'Na sequência, a aula coloca em contraste os verbos que exigem to antes da próxima ação. O ganho aqui é parar de misturar duas lógicas diferentes.'
        },
        {
          label: 'Bloco 4',
          focus: 'Mudança de sentido',
          summary: 'O fechamento é o mais fino: alguns verbos aceitam as duas formas, mas dizem coisas diferentes. É aqui que o inglês deixa de ser fórmula e vira nuance.'
        }
      ]
    },
    preposicoes: {
      kicker: 'Trilha guiada',
      headline: 'In, on, at, to: menos tradução literal, mais lógica de espaço, tempo e direção.',
      intro: 'Esta aula reorganiza as preposições mais confusas do inglês por uma lógica visual. Em vez de decorar caso por caso, você aprende a pensar em nível, superfície, ponto e movimento.',
      journey: ['Localizar no espaço', 'Posicionar no tempo', 'Marcar direção e origem'],
      sections: [
        {
          label: 'Bloco 1',
          focus: 'Lugar',
          summary: 'O primeiro bloco transforma preposição em imagem mental. A pergunta deixa de ser “qual palavra combina?” e vira “estou dentro, sobre ou num ponto específico?”.'
        },
        {
          label: 'Bloco 2',
          focus: 'Tempo',
          summary: 'Depois a aula reaproveita a mesma lógica para o calendário. O que era espaço vira escala temporal: período amplo, dia marcado ou momento exato.'
        },
        {
          label: 'Bloco 3',
          focus: 'Movimento',
          summary: 'O fechamento entra na ideia de deslocamento. Você passa a distinguir destino, origem e entrada em um espaço em vez de traduzir tudo como “para” ou “em”.'
        }
      ]
    },
    verbos: {
      kicker: 'Trilha guiada',
      headline: 'Os verbos que sustentam quase toda conversa: identidade, obrigação, possibilidade e ação em bloco.',
      intro: 'Esta aula junta verbos que aparecem o tempo todo, mas por razões diferentes. Primeiro vem o to be, depois os modais que mudam o peso da frase e, por fim, os phrasal verbs que exigem leitura por bloco.',
      journey: ['Dominar o verbo base do idioma', 'Ajustar força e intenção com modais', 'Aprender verbos que mudam ao ganhar uma partícula'],
      sections: [
        {
          label: 'Bloco 1',
          focus: 'To be',
          summary: 'A aula começa pelo verbo mais estrutural do inglês. Ele serve para identidade, estado, pergunta e várias outras construções que se espalham pelo idioma inteiro.'
        },
        {
          label: 'Bloco 2',
          focus: 'Modais',
          summary: 'Em seguida entram os verbos que ajustam poder, obrigação, conselho e possibilidade. O ponto central aqui é perceber que eles mexem no tom da frase inteira.'
        },
        {
          label: 'Bloco 3',
          focus: 'Phrasal verbs',
          summary: 'O fechamento assume um fato importante do inglês real: muitas ações do cotidiano aparecem em blocos de duas peças. O sentido não se deduz palavra por palavra.'
        }
      ]
    }
  };

  function shortenEditorialSentence(text) {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return '';

    const firstPeriod = normalized.indexOf('. ');
    if (firstPeriod >= 0) {
      return normalized.slice(0, firstPeriod + 1).trim();
    }

    return normalized.length > 180 ? `${normalized.slice(0, 177).trim()}...` : normalized;
  }

  function getSectionFocus(title) {
    const normalized = String(title || '').trim();
    if (!normalized) return 'Conceito';

    const focus = normalized.split(':')[0].split('—')[0].trim();
    return focus.length > 34 ? `${focus.slice(0, 31).trim()}...` : focus;
  }

  function getPedagogicalEditorial(slug, lesson) {
    const base = PEDAGOGICAL_EDITORIAL[slug] || {};
    const defaultSections = (lesson?.sections || []).map((section, index) => ({
      label: `Bloco ${index + 1}`,
      focus: getSectionFocus(section.title),
      summary: shortenEditorialSentence(section.explanation)
    }));

    return {
      kicker: base.kicker || 'Roteiro editorial',
      headline: base.headline || lesson?.title || '',
      intro: base.intro || lesson?.objective || '',
      journey: base.journey || defaultSections.map((section) => section.focus).slice(0, 4),
      sections: defaultSections.map((section, index) => ({
        ...section,
        ...(base.sections?.[index] || {})
      })),
      phases: base.phases || {}
    };
  }

  function escapePedagogicalHtml(text) {
    return String(text ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function renderAnchorDialog(slug) {
    const anchor = ANCHOR_DIALOGS[slug];
    if (!anchor) return '';
    const editorial = getPedagogicalEditorial(slug, lessons[slug]);
    const phase = editorial.phases?.anchor || {};

    let dialogue = escapePedagogicalHtml(anchor.dialogue);
    anchor.blanks.forEach((blank, blankIndex) => {
      dialogue = dialogue.replace(
        `___${blankIndex + 1}___`,
        `<span class="lp-anchor-blank" id="blank-${slug}-${blankIndex}">_____</span>`
      );
    });

    const buttons = anchor.blanks.map((blank, blankIndex) => {
      const options = Array.from(new Set([
        blank.answer,
        ...anchor.blanks.map(item => item.answer),
        'I',
        'me',
        'my',
        'you',
        'him',
        'her'
      ])).slice(0, 6);

      return `
        <div class="lp-anchor-buttons" id="buttons-${slug}-${blankIndex}">
          <span class="lp-blank-label">Lacuna ${blankIndex + 1}</span>
          ${options.map((option) => `<button class="lp-anchor-option" type="button" onclick="window.checkAnchorBlank('${slug}', ${blankIndex}, '${escapePedagogicalHtml(option)}', this)">${escapePedagogicalHtml(option)}</button>`).join('')}
        </div>`;
    }).join('');

    return `
      <div class="lp-anchor-wrap">
        <div class="lp-phase-head">
          <span class="lp-phase-kicker">${escapePedagogicalHtml(phase.kicker || 'Aquecimento')}</span>
          <h3 class="lp-phase-title">${escapePedagogicalHtml(phase.title || 'Complete a cena com os pronomes certos.')}</h3>
          <p class="lp-phase-copy">${escapePedagogicalHtml(phase.copy || '')}</p>
        </div>
        <div class="lp-anchor-dialogue">
          <div class="lp-anchor-text">${dialogue}</div>
        </div>
        ${buttons}
        <button class="lp-anchor-continue" id="anchor-continue-${slug}" type="button" onclick="window.nextPhase('${slug}', 'table')" disabled>Ir para a tabela de apoio</button>
      </div>`;
  }

  function renderPedagogicalOverview(slug, lesson, options = {}) {
    if (!lesson) return '';
    const editorial = getPedagogicalEditorial(slug, lesson);
    const sectionIdPrefix = options.sectionIdPrefix || 'concept';

    const sectionCards = (lesson.sections || []).map((section, index) => {
      const sectionEditorial = editorial.sections?.[index] || {};
      const example = Array.isArray(section.examples) && section.examples.length > 0 ? section.examples[0] : null;
      const exampleHtml = example
        ? `<div class="lp-peda-example"><strong>${escapePedagogicalHtml(typeof example === 'string' ? example : example.en)}</strong>${typeof example === 'object' && example.pt ? `<span>${escapePedagogicalHtml(example.pt)}</span>` : ''}</div>`
        : '';

      return `
        <article class="lp-peda-section-card" id="${sectionIdPrefix}-${slug}-${index}">
          <div class="lp-peda-section-top">
            <div class="lp-peda-section-index">${escapePedagogicalHtml(sectionEditorial.label || `Bloco ${index + 1}`)}</div>
            <div class="lp-peda-section-chip">${escapePedagogicalHtml(sectionEditorial.focus || 'Conceito')}</div>
          </div>
          <h3 class="lp-peda-section-title">${escapePedagogicalHtml(section.title)}</h3>
          ${sectionEditorial.summary ? `<p class="lp-peda-section-lead">${escapePedagogicalHtml(sectionEditorial.summary)}</p>` : ''}
          <p class="lp-peda-section-copy">${escapePedagogicalHtml(section.explanation || '')}</p>
          ${exampleHtml}
        </article>`;
    }).join('');

    return `
      <section class="lp-peda-overview" id="overview-${slug}">
        <div class="lp-peda-overview-hero">
          <span class="lp-peda-kicker">${escapePedagogicalHtml(editorial.kicker || 'Antes de praticar')}</span>
          <h2 class="lp-peda-overview-title">${escapePedagogicalHtml(editorial.headline || lesson.title)}</h2>
          <p class="lp-peda-overview-copy">${escapePedagogicalHtml(editorial.intro || lesson.objective || '')}</p>
          ${lesson.highlight ? `<div class="lp-card-tag">${escapePedagogicalHtml(lesson.highlight)}</div>` : ''}
          ${(editorial.journey || []).length ? `<div class="lp-peda-journey">${editorial.journey.map((item, index) => `<span class="lp-peda-journey-step">${index + 1}. ${escapePedagogicalHtml(item)}</span>`).join('')}</div>` : ''}
        </div>
        <div class="lp-peda-section-stack">${sectionCards}</div>
      </section>`;
  }

  function renderInteractiveTable(slug) {
    const table = INTERACTIVE_TABLES[slug];
    if (!table) return '';
    const editorial = getPedagogicalEditorial(slug, lessons[slug]);
    const phase = editorial.phases?.table || {};

    return `
      <div class="lp-table-wrap" id="table-${slug}">
        <div class="lp-phase-head">
          <span class="lp-phase-kicker">${escapePedagogicalHtml(phase.kicker || 'Mapa rapido')}</span>
          <h3 class="lp-phase-title">${escapePedagogicalHtml(phase.title || 'Tabela de apoio')}</h3>
          <p class="lp-phase-copy">${escapePedagogicalHtml(phase.copy || '')}</p>
        </div>
        <div class="lp-table-shell">
          <table class="lp-interactive-table">
            <thead>
              <tr>
                <th>Função</th>
                <th>Pronome</th>
                <th>Exemplo</th>
              </tr>
            </thead>
            <tbody>
              ${table.rows.map((row) => `
                <tr class="${row.category === 'subject' ? 'lp-table-subject' : 'lp-table-object'}">
                  <td><span class="lp-glossary-trigger" onmouseenter="window.showGlossary('${row.category === 'subject' ? 'sujeito' : 'objeto'}', event)" onmouseleave="window.hideGlossary()">${escapePedagogicalHtml(row.pt)}</span></td>
                  <td>${escapePedagogicalHtml(row.en)}</td>
                  <td>${escapePedagogicalHtml(row.example)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
          <aside class="lp-table-side-note">
            <div class="lp-table-side-kicker">Leitura pratica</div>
            <p>Se a palavra vem antes do verbo, pense em sujeito. Se aparece depois do verbo ou de uma preposição, pense em objeto.</p>
          </aside>
        </div>
        <button class="lp-anchor-continue" type="button" onclick="window.nextPhase('${slug}', 'exercises')">Ir para a pratica guiada</button>
      </div>`;
  }

  function renderScaffoldedExercises(slug) {
    const exercises = SCAFFOLDED_EXERCISES[slug] || [];
    const editorial = getPedagogicalEditorial(slug, lessons[slug]);
    const phase = editorial.phases?.exercises || {};

    return `
      <div class="lp-exercises-wrap" id="exercises-${slug}">
        <div class="lp-phase-head">
          <span class="lp-phase-kicker">${escapePedagogicalHtml(phase.kicker || 'Pratica guiada')}</span>
          <h3 class="lp-phase-title">${escapePedagogicalHtml(phase.title || 'Aplique a logica da aula')}</h3>
          <p class="lp-phase-copy">${escapePedagogicalHtml(phase.copy || '')}</p>
        </div>
        ${exercises.map((exercise, exIndex) => `
          <div class="lp-exercise lp-difficulty-${escapePedagogicalHtml(exercise.difficulty)}" id="exercise-${slug}-${exIndex}">
            <div class="lp-exercise-q">${exIndex + 1}. ${escapePedagogicalHtml(exercise.q)}</div>
            <div class="lp-exercise-meta-row">
              <div class="lp-glossary-highlight">Nível: ${escapePedagogicalHtml(({ easy: 'Fácil', moderate: 'Médio', hard: 'Desafio' }[exercise.difficulty] || exercise.difficulty))}</div>
              <div class="lp-exercise-meta-copy">Decida primeiro a função da palavra. Depois escolha a forma.</div>
            </div>
            <div class="lp-exercise-options" id="options-${slug}-${exIndex}">
              ${exercise.options.map((option, optionIndex) => `<button class="lp-exercise-option" type="button" onclick="window.checkScaffoldedAnswer('${slug}', ${exIndex}, ${optionIndex}, this)">${escapePedagogicalHtml(option)}</button>`).join('')}
            </div>
            <div class="lp-exercise-hints" id="hints-${slug}-${exIndex}" style="display:none;"></div>
            <div class="lp-exercise-feedback" id="feedback-${slug}-${exIndex}" style="display:none;"></div>
          </div>`).join('')}
        <button class="lp-exercises-continue" type="button" onclick="window.nextPhase('${slug}', 'test')">Ir para a validação final</button>
      </div>`;
  }

  function renderFinalTest(slug) {
    const tests = FINAL_TESTS[slug] || [];
    const editorial = getPedagogicalEditorial(slug, lessons[slug]);
    const phase = editorial.phases?.test || {};

    return `
      <div class="lp-test-wrap" id="test-${slug}">
        <div class="lp-phase-head">
          <span class="lp-phase-kicker">${escapePedagogicalHtml(phase.kicker || 'Fechamento')}</span>
          <div class="lp-test-header">${escapePedagogicalHtml(phase.title || 'Validação final')}</div>
          <p class="lp-phase-copy">${escapePedagogicalHtml(phase.copy || '')}</p>
        </div>
        ${tests.map((test, qIdx) => `
          <div class="lp-test-question" id="test-q-${slug}-${qIdx}">
            <div class="lp-test-q-label">${qIdx + 1}. ${escapePedagogicalHtml(test.q)}</div>
            ${test.options.map((option, optionIndex) => `<button class="lp-test-option" type="button" onclick="window.checkFinalTest('${slug}', ${qIdx}, ${optionIndex}, this)">${escapePedagogicalHtml(option)}</button>`).join('')}
          </div>`).join('')}
        <div class="lp-test-result" id="test-result-${slug}" style="display:none;"></div>
        <button class="lp-test-complete" id="test-complete-${slug}" type="button" onclick="window.completeLesson('${slug}')" style="display:none;">Concluir lição</button>
      </div>`;
  }

  function showGlossary(term, event) {
    const entry = GLOSSARY_TERMS[term];
    if (!entry) return;

    hideGlossary();
    const tooltip = document.createElement('div');
    tooltip.id = 'lpGlossaryTooltip';
    tooltip.className = 'lp-glossary-tooltip';
    tooltip.innerHTML = `
      <div class="lp-glossary-pt">${escapePedagogicalHtml(entry.pt)}</div>
      <div class="lp-glossary-en">${escapePedagogicalHtml(entry.en)}</div>
      ${entry.highlight ? `<div class="lp-glossary-highlight">${escapePedagogicalHtml(entry.highlight)}</div>` : ''}
    `;
    document.body.appendChild(tooltip);
    tooltip.style.left = `${(event?.clientX ?? 0) + 12}px`;
    tooltip.style.top = `${(event?.clientY ?? 0) + 12}px`;
  }

  function hideGlossary() {
    document.getElementById('lpGlossaryTooltip')?.remove();
  }

  // ========== EXERCISE ANSWERS ==========

  // ========== MULTIPLE-CHOICE EXERCISE DATA ==========
  // Structure: EXERCISE_MC[slug][sectionIdx][exerciseIdx] = { options[], correct, explanation, tip }

  const EXERCISE_MC = {
    pronomes: [
      [ // section 0: I, you, he, she, it, we, they
        { options: ['She live in São Paulo.', 'She lives in São Paulo.', 'Her lives in São Paulo.'], correct: 1,
          explanation: '"She lives" — "she" é sujeito (quem mora), não "her". Com she/he/it, o verbo ganha -s.',
          tip: '"Her" é objeto. "She" é sempre sujeito. Teste: se vem antes do verbo, é she.' },
        { options: ['Me am Brazilian.', 'My am Brazilian.', 'I am Brazilian.'], correct: 2,
          explanation: 'Antes do verbo "am", precisamos do sujeito: "I". "Me" e "my" nunca vêm antes de verbos.',
          tip: 'I → age. Me → recebe a ação. My → possui algo.' },
        { options: ['Him is my friend.', 'His is my friend.', 'He is my friend.'], correct: 2,
          explanation: '"He" é o sujeito (quem é amigo). "Him" seria objeto; "His" é possessivo.',
          tip: 'Antes do verbo → sujeito → he/she/I. Nunca him/her/me antes de verbo.' },
        { options: ['Us study English.', 'Our study English.', 'We study English.'], correct: 2,
          explanation: '"We" é o sujeito (quem estuda). "Us" é objeto; "Our" é possessivo.',
          tip: 'We → nós agimos. Us → agem sobre nós. Our → é nosso.' },
        { options: ['É um hábito sem regra específica.', '"It" preenche a posição de sujeito, obrigatória em toda frase.', '"It" se refere ao céu.'], correct: 1,
          explanation: 'O inglês exige sujeito em toda frase. "It" é o sujeito vazio para clima e situações impessoais.',
          tip: 'Inglês = sujeito + verbo sempre. Sem sujeito real? Use "it".' }
      ],
      [ // section 1: me, you, him, her, it, us, them
        { options: ['She called I.', 'She called my.', 'She called me.'], correct: 2,
          explanation: 'Depois de verbo (called), usamos objeto: "me", não "I". "I" é sujeito.',
          tip: 'Depois de verbo → objeto: me/him/her/us/them. Nunca I/he/she/we/they.' },
        { options: ['I saw she at the park.', 'I saw her at the park.', 'I saw hers at the park.'], correct: 1,
          explanation: '"Her" é o objeto (quem eu vi). "She" seria sujeito; "hers" é possessivo.',
          tip: 'Vi alguém → recebeu a ação → objeto: her, não she.' },
        { options: ['Can you help we?', 'Can you help our?', 'Can you help us?'], correct: 2,
          explanation: '"Us" é o objeto de "help". "We" é sujeito; "our" é possessivo.',
          tip: '"Help" é verbo → quem recebe é objeto → us, não we.' },
        { options: ['This is for I.', 'This is for me.', 'This is for my.'], correct: 1,
          explanation: 'Depois de preposição (for, with, to, by), sempre objeto: "me", não "I".',
          tip: 'Preposição + pronome → sempre objeto: for me, with him, to her.' },
        { options: ['with you and I', 'with you and my', 'with you and me'], correct: 2,
          explanation: '"With" é preposição → objeto → me. Truque: retire "you and" — "with I" soa errado; "with me" soa certo.',
          tip: 'Teste retirando a outra pessoa: "with I" vs "with me" — fica claro.' }
      ],
      [ // section 2: my/mine etc.
        { options: ['This is mine bag.', 'This is my bag.', 'This is hers bag.'], correct: 1,
          explanation: 'Antes de substantivo (bag), use "my". "Mine" substitui o substantivo — não vem antes dele.',
          tip: 'my + substantivo. Mine = substitui o substantivo. "My bag" vs "The bag is mine."' },
        { options: ['The bag is her.', 'The bag is she.', 'The bag is hers.'], correct: 2,
          explanation: '"Hers" substitui "her bag" — possessivo independente, sem substantivo depois.',
          tip: 'her bag → hers. my bag → mine. your bag → yours.' },
        { options: ['The car is her.', 'The car is hers.', 'The car is she.'], correct: 1,
          explanation: '"Her car" → removendo o substantivo, "her" vira "hers".',
          tip: 'Retire o substantivo: her→hers, my→mine, your→yours, his permanece.' },
        { options: ['São intercambiáveis — mesma coisa.', '"your" vem antes de substantivo; "yours" substitui o substantivo.', '"your" é informal; "yours" é formal.'], correct: 1,
          explanation: '"Your bag is here" (your + substantivo). "The bag is yours" (yours substitui "your bag").',
          tip: 'Antes de objeto → your/my/his. Substitui o objeto todo → yours/mine/his.' },
        { options: ['This book is your.', 'This book is you.', 'This book is yours.'], correct: 2,
          explanation: '"Your" precisa de substantivo depois. Sem substantivo, use "yours".',
          tip: 'Nunca termine frase com "your" — precisa de substantivo. Fim de frase → yours.' }
      ]
    ],
    perguntas: [
      [ // section 0: Do/Does
        { options: ['You speak English?', 'Does you speak English?', 'Do you speak English?'], correct: 2,
          explanation: '"Do" é o auxiliar para perguntas com I/you/we/they no presente simples.',
          tip: 'Pergunta no presente → Do (I/you/we/they) ou Does (he/she/it).' },
        { options: ['Does she likes pizza?', 'Do she like pizza?', 'Does she like pizza?'], correct: 2,
          explanation: '"Does" para he/she/it. Verbo fica na base (like, sem -s) — o -s já está em "does".',
          tip: 'Does + verbo base (sem -s). O -s "migrou" para o auxiliar.' },
        { options: ['Do they eat dinner at 8pm?', 'Does they eat dinner at 8pm?', 'Do they eats dinner at 8pm?'], correct: 0,
          explanation: '"They" é plural → "do". Verbo base "eat" sem -s. "Does they" está errado.',
          tip: 'They/we/you/I → "do". He/she/it → "does". Nunca "does they".' },
        { options: ['No, I don\'t.', 'No, I doesn\'t.', 'No, I not like.'], correct: 0,
          explanation: 'Resposta curta negativa: No + sujeito + don\'t/doesn\'t.',
          tip: 'Do → don\'t. Does → doesn\'t. Simétrico ao auxiliar da pergunta.' },
        { options: ['Do', 'Am', 'Does'], correct: 2,
          explanation: '"Your brother" = he (3ª pessoa singular) → "Does".',
          tip: 'Substitua por "he/she" — Does he? → usa "Does". They? → "Do".' }
      ],
      [ // section 1: Wh-questions
        { options: ['Where you work?', 'Where do you work?', 'Where does you work?'], correct: 1,
          explanation: '"Where" + do/does + sujeito + verbo base. Sem "do", a frase é incorreta.',
          tip: 'Wh- + do/does + sujeito + verbo. Where do you…? What does she…?' },
        { options: ['"Who" é sujeito — fez a ação, dispensa o auxiliar.', '"call" é irregular e não precisa de "did".', 'No inglês britânico não se usa "did" com "who".'], correct: 0,
          explanation: '"Who called?" — "who" é o sujeito (quem ligou). Sujeito-pergunta dispensa "did/do".',
          tip: 'Who faz a ação → Who + verbo direto. Quem fez isso? → Who did this? (who = objeto).' },
        { options: ['How you learn English?', 'How does you learn English?', 'How do you learn English?'], correct: 2,
          explanation: '"You" → auxiliar "do". Estrutura: How + do + you + verbo base.',
          tip: 'How do you = como você. How does she = como ela.' },
        { options: ['What você mora?', 'How você mora?', 'Where você mora?'], correct: 2,
          explanation: '"Where" = onde (lugar). "What" = o quê; "How" = como.',
          tip: 'Where = lugar. When = tempo. What = coisa. Who = pessoa. Why = razão. How = modo.' },
        { options: ['São sinônimos — intercambiáveis.', '"How much" para incontáveis (água, dinheiro); "How many" para contáveis (pessoas, copos).', '"How much" é formal; "How many" é informal.'], correct: 1,
          explanation: '"How much water?" (incontável). "How many glasses?" (contável).',
          tip: 'Dá pra contar um a um? How many. Não dá? How much.' }
      ],
      [ // section 2: Question tags
        { options: ['She is a teacher, is she?', 'She is a teacher, isn\'t it?', 'She is a teacher, isn\'t she?'], correct: 2,
          explanation: 'A tag usa o mesmo auxiliar (is) na forma oposta + mesmo sujeito pronominal (she).',
          tip: 'Tag = auxiliar oposto + mesmo sujeito. Is → isn\'t she. Are → aren\'t they.' },
        { options: ['You don\'t smoke, do you?', 'You don\'t smoke, don\'t you?', 'You don\'t smoke, are you?'], correct: 0,
          explanation: 'Frase negativa (don\'t) → tag positiva (do you). Sempre oposto.',
          tip: 'Frase negativa → tag positiva. Frase positiva → tag negativa.' },
        { options: ['He can swim, can he?', 'He can swim, can\'t he?', 'He can swim, isn\'t he?'], correct: 1,
          explanation: 'Frase positiva com "can" → tag negativa: can\'t + he.',
          tip: 'Identifique o auxiliar e inverta: can → can\'t he? is → isn\'t she?' },
        { options: ['Para soar mais educado.', 'Para pedir confirmação — o contraste cria expectativa de concordância.', 'É um hábito sem função lógica.'], correct: 1,
          explanation: 'A tag pede confirmação. O oposto cria tensão que convida à concordância.',
          tip: 'Tag = "né?" em inglês. O oposto cria o gancho para a resposta esperada.' },
        { options: ['They arrived late, arrived they?', 'They arrived late, did they?', 'They arrived late, didn\'t they?'], correct: 2,
          explanation: 'Frase positiva no passado simples → tag negativa: didn\'t + they.',
          tip: 'Passado simples → did/didn\'t na tag. "Arrived" usa "did" como auxiliar.' }
      ]
    ],
    negativa: [
      [ // section 0: to be negativo
        { options: ['She not is a doctor.', 'She isn\'t a doctor.', 'She don\'t be a doctor.'], correct: 1,
          explanation: 'Com "to be", a negativa é: is/am/are + not (ou contração). Nunca "don\'t" com to be.',
          tip: 'To be negativo: isn\'t / aren\'t / I\'m not. Nunca "don\'t" com to be.' },
        { options: ['I don\'t tired.', 'I amn\'t tired.', 'I\'m not tired.'], correct: 2,
          explanation: '"am" não tem contração "amn\'t". A única forma correta é "I\'m not".',
          tip: 'I\'m not = única forma. Não existe "amn\'t" em inglês.' },
        { options: ['They don\'t are from Brazil.', 'They aren\'t from Brazil.', 'They not are from Brazil.'], correct: 1,
          explanation: '"They are" → negativo: "they aren\'t" ou "they\'re not". Nunca "don\'t are".',
          tip: 'Are → aren\'t / \'re not. Is → isn\'t / \'s not. Am → \'m not.' },
        { options: ['"He isn\'t" é formal; "He\'s not" é informal.', 'São iguais em significado — diferem só na ênfase.', '"He isn\'t" é britânico; "He\'s not" é americano.'], correct: 1,
          explanation: 'Ambas significam "He is not". A diferença é de ênfase na fala.',
          tip: 'Mesma coisa. Use o que soar mais natural — nativos usam as duas formas.' },
        { options: ['We not late. / We no late.', 'We aren\'t late. / We\'re not late.', 'We don\'t late. / We not are late.'], correct: 1,
          explanation: '"We are" → negativo: "we aren\'t" ou "we\'re not". Ambas corretas.',
          tip: 'Are → aren\'t (une tudo) ou \'re not (nega depois da contração).' }
      ],
      [ // section 1: Do/Does negativo
        { options: ['He doesn\'t plays guitar every day.', 'He don\'t play guitar every day.', 'He doesn\'t play guitar every day.'], correct: 2,
          explanation: '"He" → "doesn\'t" + verbo base (sem -s). O -s está em "doesn\'t", não no verbo.',
          tip: 'Doesn\'t + verbo base. O -s migrou para o auxiliar. Nunca "doesn\'t plays".' },
        { options: ['O verbo sempre perde o -s em negativas.', 'O -s migrou para "doesn\'t", que já carrega a 3ª pessoa.', 'O verbo muda porque a frase é negativa.'], correct: 1,
          explanation: '"doesn\'t" = does + not. O "does" já marca a 3ª pessoa — duplicar o -s seria erro.',
          tip: '1 marcador de 3ª pessoa. Está no auxiliar → não vai no verbo.' },
        { options: ['Do / don\'t — "sister" é como they.', 'Does / doesn\'t — "sister" equivale a she.', 'Am / isn\'t — "sister" usa to be.'], correct: 1,
          explanation: '"My sister" = she (3ª pessoa singular) → Does/doesn\'t.',
          tip: 'Substitua o sujeito por he/she/it ou I/you/we/they para escolher do ou does.' },
        { options: ['I doesn\'t understand this word.', 'I not understand this word.', 'I don\'t understand this word.'], correct: 2,
          explanation: '"I" → "don\'t" (não "doesn\'t"). "Don\'t" = do + not.',
          tip: 'I/you/we/they → don\'t. He/she/it → doesn\'t.' },
        { options: ['doesn\'t', 'don\'t', 'isn\'t'], correct: 1,
          explanation: 'I, you, we, they → "don\'t". Apenas he/she/it → "doesn\'t".',
          tip: 'Se cabe "do" na pergunta, usa "don\'t" na negativa.' }
      ],
      [ // section 2: Did negativo
        { options: ['She didn\'t went home.', 'She not went home.', 'She didn\'t go home.'], correct: 2,
          explanation: '"didn\'t" + verbo base (go, não went). O passado está em "didn\'t".',
          tip: 'didn\'t + verbo BASE. Nunca "didn\'t went" — o passado já está no auxiliar.' },
        { options: ['They didn\'t visited the museum.', 'They not visited the museum.', 'They didn\'t visit the museum.'], correct: 2,
          explanation: '"didn\'t" + verbo base (visit, não visited).',
          tip: 'Passado negativo = didn\'t + base. "Visited" vira "visit" com didn\'t.' },
        { options: ['I didn\'t knew you were here.', 'I not know you were here.', 'I didn\'t know you were here.'], correct: 2,
          explanation: '"know" é a forma base de "knew". Com "didn\'t", volta ao infinitivo.',
          tip: 'knew → know (base). Irregular? Volta à forma infinitiva com didn\'t.' },
        { options: ['He didn\'t understood the question.', 'He not understand the question.', 'He didn\'t understand the question.'], correct: 2,
          explanation: '"understood" → forma base "understand" com "didn\'t".',
          tip: 'understood → understand. Com didn\'t, sempre = forma base.' },
        { options: ['"went" é irregular e não combina com "didn\'t".', '"didn\'t" já carrega o passado — verbo principal fica na base.', '"didn\'t" é mais forte e anula o passado do verbo.'], correct: 1,
          explanation: '"didn\'t" = did + not. O "did" já expressa o passado. "went" seria duplicar.',
          tip: 'Duas marcas de passado = erro. 1 auxiliar passado + 1 verbo base = correto.' }
      ],
      [ // section 3: Double negatives
        { options: ['I don\'t do nothing on Sundays.', 'I do nothing on Sundays.', 'I not do nothing on Sundays.'], correct: 1,
          explanation: 'Em inglês, duas negativas criam sentido positivo. "I do nothing" (verbo positivo + nothing).',
          tip: 'Português: "não faço nada". Inglês: "I do nothing" OU "I don\'t do anything" — nunca os dois juntos.' },
        { options: ['I don\'t never eat sugar.', 'I never don\'t eat sugar.', 'I never eat sugar.'], correct: 2,
          explanation: '"Never" já é negativo — não precisa de "don\'t".',
          tip: 'never / nothing / nobody = já são negativos. Não adicione "don\'t" na mesma frase.' },
        { options: ['Nobody answered the door.', 'No nobody answered the door.', 'Anybody not answered the door.'], correct: 0,
          explanation: '"Nobody" + verbo positivo. Não use "don\'t" ou "not" junto com "nobody".',
          tip: 'nobody/nothing/never + verbo POSITIVO. Sem "don\'t" na mesma frase.' },
        { options: ['São sinônimos — intercambiáveis.', '"nothing" usa verbo positivo; "anything" usa verbo negativo. Mesmo sentido.', '"nothing" é mais formal.'], correct: 1,
          explanation: '"There is nothing here" (positivo). "There isn\'t anything here" (negativo). Mesma ideia.',
          tip: 'nothing + verbo positivo = anything + verbo negativo. Escolha só um.' },
        { options: ['She doesn\'t never arrives on time.', 'She never arrives on time.', 'She never arrive on time.'], correct: 1,
          explanation: '"Never" + verbo positivo com -s (3ª pessoa: arrives). Sem "doesn\'t".',
          tip: 'never + verbo como se fosse afirmativo (com -s para she/he/it).' }
      ]
    ],
    passado: [
      [ // section 0: regular past
        { options: ['She work at the hospital.', 'She worked at the hospital.', 'She workes at the hospital.'], correct: 1,
          explanation: 'Passado de verbos regulares: + -ed. "Work" → "worked".',
          tip: 'Regular? + ed. No afirmativo o verbo muda de forma sozinho, sem auxiliar.' },
        { options: ['studyed', 'studied', 'studieded'], correct: 1,
          explanation: '"Study" termina em consoante + y → o y vira i antes do -ed: "studied".',
          tip: 'Consoante + y → troca y por i + ed. (study→studied, carry→carried)' },
        { options: ['arriveed', 'arriven', 'arrived'], correct: 2,
          explanation: '"Arrive" termina em -e silencioso → adiciona só -d: "arrived".',
          tip: 'Termina em -e? Só adiciona -d. (arrive→arrived, like→liked, love→loved)' },
        { options: ['watcht / cookt / walkt', 'watched / cooked / walked', 'watchs / cooks / walks'], correct: 1,
          explanation: 'Verbos regulares no passado: watch→watched, cook→cooked, walk→walked.',
          tip: 'Verbos regulares comuns: watch, cook, walk, talk, work, play, call — todos + ed.' },
        { options: ['stoped', 'stoppd', 'stopped'], correct: 2,
          explanation: '"Stop" = consoante-vogal-consoante curta → dobra a consoante + ed: "stopped".',
          tip: 'CVC curta → dobra: stop→stopped, plan→planned, drop→dropped.' }
      ],
      [ // section 1: irregular past
        { options: ['goed / buyed / seed / eated / comed', 'went / bought / saw / ate / came', 'wented / buyed / saw / eated / comed'], correct: 1,
          explanation: 'Esses 5 são todos irregulares — não seguem a regra do -ed.',
          tip: 'Irregulares precisam ser memorizados. Crie frases: "I went, bought, saw, ate, came."' },
        { options: ['I buyed this yesterday.', 'I buy this yesterday.', 'I bought this yesterday.'], correct: 2,
          explanation: '"buy" → "bought" (irregular). "Buyed" não existe.',
          tip: 'buy → bought. Think→thought, bring→brought — padrão -ought para esse grupo.' },
        { options: ['"went" é muito informal com "didn\'t".', '"didn\'t" já carrega o passado; o verbo fica na base: "didn\'t go".', 'Com negativa usa-se o infinitivo "go to".'], correct: 1,
          explanation: '"didn\'t" = did + not. O passado está no auxiliar. Verbo volta à base: go.',
          tip: 'didn\'t + BASE. Nunca: didn\'t + passado.' },
        { options: ['goed / seed / eated', 'went / saw / ate', 'Qualquer combinação com went/saw/ate/got/came é válida.'], correct: 2,
          explanation: 'Use verbos irregulares reais: went, saw, ate, got, came, told, bought, etc.',
          tip: 'Pratique numa frase de rotina: "I got up, ate breakfast, and went to work."' },
        { options: ['getted', 'gat', 'got'], correct: 2,
          explanation: '"get" → "got" (irregular). "Gotten" é o particípio em inglês americano.',
          tip: 'get → got → gotten. "I got home late." "I\'ve gotten better."' }
      ],
      [ // section 2: past continuous
        { options: ['She reading when I knocked.', 'She were reading when I knocked.', 'She was reading when I knocked.'], correct: 2,
          explanation: '"She" → "was" + -ing. "Were" seria para you, we, they.',
          tip: 'was + -ing: I/he/she/it. were + -ing: you/we/they.' },
        { options: ['I studying when the phone rang.', 'I was study when the phone rang.', 'I was studying when the phone rang.'], correct: 2,
          explanation: 'Past continuous = was/were + verbo-ing. "Study" → "studying".',
          tip: 'Ação em progresso no passado = was/were + -ing. Interrompida pelo simple past.' },
        { options: ['What you were doing at 10pm?', 'What were you doing at 10pm?', 'What you was doing at 10pm?'], correct: 1,
          explanation: 'Em perguntas, o auxiliar (were) vem antes do sujeito.',
          tip: 'Pergunta = auxiliar + sujeito. What were you / What was she doing?' },
        { options: ['They was working.', 'They were working.', 'They working.'], correct: 1,
          explanation: '"They" → "were" (não "was"). "Was" é apenas para I/he/she/it.',
          tip: 'they/we/you → were. I/he/she/it → was. "They was" = erro muito comum.' },
        { options: ['I was going to Rio when I met her.', 'I was living in Rio when I met her.', 'Qualquer frase com was/were + -ing é válida.'], correct: 2,
          explanation: 'Past continuous = cenário de fundo. Simple past = evento pontual que corta a ação.',
          tip: 'was/were + -ing = ação em andamento. Simple past = interrupção.' }
      ]
    ],
    futuro: [
      [ // section 0: will
        { options: ['I\'m going to answer it!', 'I answer it!', 'I\'ll answer it!'], correct: 2,
          explanation: 'Decisão tomada no momento da fala → "will". "Going to" seria para planos já feitos.',
          tip: 'Decidiu agora? will. Já tinha planejado? going to.' },
        { options: ['I\'m going to call you early tomorrow.', 'I will call you early tomorrow.', 'I call you early tomorrow.'], correct: 1,
          explanation: '"Will" para promessa/comprometimento feito na hora da conversa.',
          tip: 'Promessa espontânea → will. "I\'ll be there for you."' },
        { options: ['going to — para todas as situações futuras.', 'will — para decisões e promessas feitas na hora.', 'Os dois são iguais, sem diferença real.'], correct: 1,
          explanation: '"Will" é o auxiliar para promessas e decisões tomadas no momento.',
          tip: 'Decidiu AGORA → will. Já tinha decidido antes → going to.' },
        { options: ['willn\'t', 'won\'t', 'will not to'], correct: 1,
          explanation: '"will" + "not" = "won\'t" (contração irregular). "Willn\'t" não existe.',
          tip: 'will → won\'t. Não siga o padrão is/isn\'t. Memorize: will/won\'t.' },
        { options: ['I think it going to be rainy.', 'I think it are going to rain.', 'I think it will be rainy.'], correct: 2,
          explanation: 'Previsão sem evidência visual → "will". "Going to" seria para evidência concreta.',
          tip: 'Opinião/previsão abstrata → will. Evidência que você está vendo → going to.' }
      ],
      [ // section 1: going to
        { options: ['I will travel on vacation.', 'I\'m going to travel on vacation.', 'I travel on vacation.'], correct: 1,
          explanation: 'Plano já decidido antes de falar → "going to".',
          tip: 'Já estava nos planos → going to. Decidiu agora, falando → will.' },
        { options: ['will — é uma previsão abstrata.', 'going to — você vê a evidência (ele desequilibrado).', 'Os dois funcionam exatamente igual.'], correct: 1,
          explanation: 'Evidência visual clara → "going to". "He\'s going to fall!" = você está vendo acontecer.',
          tip: 'Vejo a evidência → going to. Só acho que vai acontecer → will.' },
        { options: ['She will studying medicine.', 'She going to study medicine.', 'She is going to study medicine.'], correct: 2,
          explanation: '"going to" precisa do verbo "to be": is/am/are + going to + verbo base.',
          tip: 'Não esqueça o "is/am/are"! Não é só "going to" — é "is going to".' },
        { options: ['will = futuro distante; going to = futuro próximo.', 'will = decisão espontânea; going to = plano ou evidência.', 'will = americano; going to = britânico.'], correct: 1,
          explanation: 'A diferença é conceitual: "will" para o que decide agora; "going to" para o que já estava planejado.',
          tip: 'will = flash de decisão. going to = plano já existente ou evidência visual.' },
        { options: ['I will finish my English course.', 'I\'m going to finish my English course.', 'Ambas corretas — going to é mais natural para planos definidos.'], correct: 2,
          explanation: '"Going to" é mais natural para planos pessoais já definidos.',
          tip: 'Para planos em conversa casual → going to é a escolha mais natural.' }
      ],
      [ // section 2: present continuous for future
        { options: ['I will fly to Rio tomorrow.', 'I\'m flying to Rio tomorrow.', 'I fly to Rio tomorrow.'], correct: 1,
          explanation: 'Presente contínuo + marcador de tempo futuro = compromisso já agendado.',
          tip: 'Já está no calendário → present continuous. I\'m meeting, I\'m flying, I\'m having.' },
        { options: ['Do you do anything this weekend?', 'Are you doing anything this weekend?', 'Will you do anything this weekend?'], correct: 1,
          explanation: '"Are you doing" = present continuous interrogativo para perguntar sobre planos.',
          tip: 'Are you + -ing + tempo futuro = planos/agenda. Natural e muito usado.' },
        { options: ['I\'m going to meet my dentist.', 'I\'m meeting my dentist on Thursday.', 'Ambas corretas — a segunda implica que já está agendado.'], correct: 2,
          explanation: '"I\'m meeting my dentist" indica compromisso já marcado. Present continuous é mais específico.',
          tip: 'Já tem hora marcada? Present continuous. Intenção sem data? Going to.' },
        { options: ['São sinônimos.', '"going to" = intenção/plano; present continuous = compromisso já agendado.', 'Present continuous é mais informal.'], correct: 1,
          explanation: '"I\'m going to meet him" = intenção. "I\'m meeting him at 3pm" = está no calendário.',
          tip: 'going to = intenção. present continuous = compromisso concreto com hora/lugar.' },
        { options: ['She will meet the client on Friday.', 'She meets the client on Friday.', 'She\'s meeting the client on Friday.'], correct: 2,
          explanation: 'Compromisso já agendado → present continuous.',
          tip: 'Meeting = compromisso marcado. Mais natural que will para eventos agendados.' }
      ]
    ],
    gerundio: [
      [ // section 0: -ing as noun
        { options: ['writting / runing / comeing / playing / swiming', 'writing / running / coming / playing / swimming', 'writeing / running / comming / playing / swimm'], correct: 1,
          explanation: '-e mudo cai (come→coming), CVC curta dobra (run→running, swim→swimming), play apenas + ing.',
          tip: '-e mudo cai (write→writing). CVC curta dobra (run→running). Resto: +ing.' },
        { options: ['To run every day is good for your health.', 'Run every day is good for your health.', 'Running every day is good for your health.'], correct: 2,
          explanation: '-ing como sujeito = gerúndio (substantivo verbal).',
          tip: '-ing no início da frase = substantivo/conceito. Ex: Swimming is fun.' },
        { options: ['Check your phone before leave.', 'Check your phone before to leave.', 'Check your phone before leaving.'], correct: 2,
          explanation: 'Depois de preposições (before, after, without, by), usa-se sempre -ing.',
          tip: 'Preposição + -ing sempre. Before leaving. After eating. Without saying.' },
        { options: ['Não há diferença — as duas expressam a mesma coisa.', '"I am eating" = ação em andamento agora; "Eating is important" = -ing como conceito/sujeito.', '"I am eating" é presente contínuo; a outra é futuro.'], correct: 1,
          explanation: '"I am eating" = ação acontecendo. "Eating is important" = -ing como substantivo/conceito geral.',
          tip: 'Am/is/are + -ing = ação agora. -ing no início = sujeito/conceito.' },
        { options: ['She\'s interested to learn Japanese.', 'She\'s interested in to learn Japanese.', 'She\'s interested in learning Japanese.'], correct: 2,
          explanation: '"Interested in" = preposição + -ing. "In" é preposição → obriga o -ing.',
          tip: 'Adjetivo + preposição → -ing. Interested in, good at, afraid of, tired of + -ing.' }
      ],
      [ // section 1: verbs + -ing
        { options: ['I enjoy to cook on Sundays.', 'I enjoy cook on Sundays.', 'I enjoy cooking on Sundays.'], correct: 2,
          explanation: '"enjoy" pertence ao grupo de verbos seguidos de -ing, nunca infinitivo.',
          tip: 'enjoy, finish, avoid, mind, consider, keep, miss, practice → sempre + -ing.' },
        { options: ['She finished to read the book.', 'She finished read the book.', 'She finished reading the book.'], correct: 2,
          explanation: '"finish" + -ing. "She finished reading" = ela completou a leitura.',
          tip: 'finish + -ing. "She finished eating, working, studying…"' },
        { options: ['Avoid to eat too much at night.', 'Avoid eat too much at night.', 'Avoid eating too much at night.'], correct: 2,
          explanation: '"avoid" + -ing. Nunca "avoid to".',
          tip: 'avoid + -ing. "Avoid making, avoid saying, avoid going."' },
        { options: ['He can\'t stand to wake up early.', 'He can\'t stand wake up early.', 'He can\'t stand waking up early.'], correct: 2,
          explanation: '"can\'t stand" + -ing. Também: can\'t help, can\'t resist + -ing.',
          tip: 'can\'t stand / can\'t help / can\'t resist → sempre + -ing.' },
        { options: ['Would you mind to open the window?', 'Would you mind open the window?', 'Would you mind opening the window?'], correct: 2,
          explanation: '"mind" + -ing. "Would you mind opening" = você se importaria de abrir.',
          tip: 'mind + -ing. "Do you mind waiting? Would you mind helping?" Sempre -ing.' }
      ],
      [ // section 2: verbs + to
        { options: ['I need talking to you.', 'I need talk to you.', 'I need to talk to you.'], correct: 2,
          explanation: '"need" + to + infinitivo.',
          tip: 'need, want, decide, plan, refuse, hope, learn → to + verbo base.' },
        { options: ['He wants going to the gym.', 'He wants to go to the gym.', 'He wants go to the gym.'], correct: 1,
          explanation: '"want" + to + infinitivo. "He wants to go" = ele quer ir.',
          tip: 'want to + verbo base. "She wants to eat, study, sleep."' },
        { options: ['São sinônimos.', '"remember doing" = lembrar de algo passado; "remember to do" = não esquecer de fazer no futuro.', '"remember doing" é britânico; "remember to do" é americano.'], correct: 1,
          explanation: '"I remember locking the door" (lembro que já fiz). "Remember to lock" (não esqueça de fazer).',
          tip: 'remember + -ing = memória do passado. remember + to = tarefa a não esquecer.' },
        { options: ['I decided learning English.', 'I decided to learn English.', 'I decide to learning English.'], correct: 1,
          explanation: '"decide" + to + verbo base: "decided to learn".',
          tip: 'decide to + base. "I decided to quit, to start, to call."' },
        { options: ['She refused answering.', 'She refused answer.', 'She refused to answer.'], correct: 2,
          explanation: '"refuse" + to + infinitivo: "refused to answer".',
          tip: 'refuse to + base. "He refused to eat, to go, to say."' }
      ],
      [ // section 3: dual meaning verbs
        { options: ['São sinônimos — mesma coisa.', '"stopped to eat" = parou para comer outra ação; "stopped eating" = parou de comer essa ação.', '"stopped eating" = passado; "stopped to eat" = presente.'], correct: 1,
          explanation: '"stopped to eat" = parou o que fazia e foi comer. "stopped eating" = a ação de comer foi encerrada.',
          tip: 'stop + to = para fazer outra coisa. stop + -ing = parou aquela ação.' },
        { options: ['I forgot sending the email.', 'I forgot the email to send.', 'I forgot to send the email.'], correct: 2,
          explanation: '"forgot to send" = não fiz algo que era para fazer.',
          tip: 'forgot + to = não fiz (tarefa futura). forgot + -ing = lembro que fiz, mas ocorreu.' },
        { options: ['I\'ll never forget to meet you.', 'I\'ll never forget meeting you.', 'I never forgot meeting you.'], correct: 1,
          explanation: '"forget + -ing" = memória de algo passado que aconteceu.',
          tip: 'forget + -ing = memória de evento real. forget + to = tarefa a não esquecer.' },
        { options: ['Try to go to bed earlier.', 'Try going to bed earlier.', 'Os dois têm sentidos próximos; "going" soa mais como sugestão.'], correct: 2,
          explanation: '"try + -ing" = experimente como sugestão casual. "try + to" = esforço deliberado.',
          tip: 'try + to = esforço deliberado. try + -ing = experimente, veja se funciona.' },
        { options: ['Remember to lock the door. / I remember locking the door.', 'Remember locking the door. / I remember to lock the door.', 'São a mesma coisa.'], correct: 0,
          explanation: '"Remember to lock" = não esqueça (futuro). "I remember locking" = lembro que já fiz (passado).',
          tip: 'to = tarefa futura a lembrar. -ing = memória de algo já ocorrido.' }
      ]
    ],
    preposicoes: [
      [ // section 0: in/on/at place
        { options: ['She\'s in the supermarket.', 'She\'s on the supermarket.', 'She\'s at the supermarket.'], correct: 2,
          explanation: '"at" para locais específicos/pontos (supermarket, school, work).',
          tip: 'at = ponto no mapa (at work, at school). in = dentro. on = superfície.' },
        { options: ['The keys are in the table.', 'The keys are at the table.', 'The keys are on the table.'], correct: 2,
          explanation: '"on" = sobre uma superfície. As chaves estão sobre a superfície da mesa.',
          tip: 'on = em cima de. in = dentro de. at = em (ponto/destino).' },
        { options: ['in — porque é veículo fechado.', 'on — porque você está sobre os assentos, como numa superfície.', 'at — porque é um destino.'], correct: 1,
          explanation: 'Transporte público (ônibus, avião, trem): "on". Veículos pequenos (carro, táxi): "in".',
          tip: 'on the bus/train/plane. in the car/taxi. Tamanho e tipo de transporte decidem.' },
        { options: ['She works in a hospital at the city center.', 'She works on a hospital in the city center.', 'She works at a hospital in the city center.'], correct: 2,
          explanation: '"at" para o local específico (hospital como ponto); "in" para a área (city center).',
          tip: 'at = ponto específico. in = área/região. "at the hospital, in the city."' },
        { options: ['Qualquer frase com in, on e at é válida.', 'Ex: I\'m at home, sitting on the couch, in my living room.', 'Ambas corretas.'], correct: 2,
          explanation: 'Exemplo: "I\'m at my desk on the 3rd floor in the building." Cada preposição com sua função.',
          tip: 'at (ponto), on (superfície/nível), in (interior/área). Use os três juntos.' }
      ],
      [ // section 1: in/on/at time
        { options: ['She was born on July in 1990.', 'She was born at July at 1990.', 'She was born in July in 1990.'], correct: 2,
          explanation: 'Mês → "in". Ano → "in". Ambos são períodos de tempo.',
          tip: 'in + mês/ano/estação/século. on + dia/data. at + hora específica.' },
        { options: ['In Monday morning I have a meeting.', 'At Monday morning I have a meeting.', 'On Monday morning I have a meeting.'], correct: 2,
          explanation: '"on" para dias da semana e datas. "On Monday".',
          tip: 'on + dia da semana ou data. On Monday, on Tuesday, on April 5th.' },
        { options: ['"night" é curto demais para "in".', '"at night" é expressão fixa — partes do dia usam "in" exceto night.', 'Noite é considerada um ponto, não um período.'], correct: 1,
          explanation: 'Parts of day: in the morning/afternoon/evening. Mas "night" é exceção — "at night" é expressão fixa.',
          tip: 'in the morning/afternoon/evening. AT night. Exceção a ser memorizada.' },
        { options: ['On the 80s people danced a lot.', 'At the 80s people danced a lot.', 'In the 80s people danced a lot.'], correct: 2,
          explanation: 'Décadas → "in": in the 80s, in the 90s.',
          tip: 'in the 80s/90s/2000s. Décadas são períodos → in.' },
        { options: ['The show starts on 8pm at Saturday.', 'The show starts at 8pm on Saturday.', 'The show starts in 8pm on Saturday.'], correct: 1,
          explanation: 'Hora específica → "at". Dia da semana → "on".',
          tip: 'at + hora. on + dia. in + período (mês, ano, estação).' }
      ],
      [ // section 2: movement
        { options: ['"home" é irregular.', '"home" funciona como advérbio de lugar — não precisa de preposição, como "here" e "there".', '"to home" soa feio.'], correct: 1,
          explanation: '"home", "here" e "there" são advérbios de lugar. Não precisam de preposição de movimento.',
          tip: 'go home / go there / go here — sem "to". Come home, stay home. Home = advérbio.' },
        { options: ['She drove at work.', 'She drove for work.', 'She drove to work.'], correct: 2,
          explanation: '"to" indica destino de movimento.',
          tip: 'Movimento em direção a um destino → to. Go to, drive to, walk to, fly to.' },
        { options: ['São sinônimos.', '"in the car" = dentro, estático; "got into the car" = entrou no carro, movimento.', '"got into" é mais informal.'], correct: 1,
          explanation: '"in" = estado (está dentro). "into" = movimento para dentro.',
          tip: 'in = estado dentro. into = movimento para dentro. on = sobre. onto = movimento para cima.' },
        { options: ['She walked from of the apartment at 8am.', 'She walked out the apartment at 8am.', 'She walked out of the apartment at 8am.'], correct: 2,
          explanation: '"out of" = movimento de dentro para fora. "out the" seria incorreto sem "of".',
          tip: 'out of = para fora de. into = para dentro de. Sempre "out of" junto.' },
        { options: ['to', 'at', 'from'], correct: 2,
          explanation: '"from" = origem/procedência. "She\'s from Brazil."',
          tip: 'from = de onde veio. to = para onde vai. from…to = de…para.' }
      ]
    ],
    verbos: [
      [ // section 0: to be
        { options: ['She is agree with you.', 'She be agree with you.', 'She agrees with you.'], correct: 2,
          explanation: '"agree" é verbo comum, não usa "to be". "She agrees" = 3ª pessoa com -s.',
          tip: 'agree, like, know, understand = verbos normais. Não combine com "to be".' },
        { options: ['I is / she am / we is / they am', 'I am / she is / we are / they are', 'I be / she be / we be / they be'], correct: 1,
          explanation: 'to be: I am, you are, he/she/it is, we are, they are.',
          tip: 'am = I. is = he/she/it. are = you/we/they. 3 formas, 3 grupos.' },
        { options: ['He not ready.', 'He don\'t ready.', 'He isn\'t ready. / He\'s not ready.'], correct: 2,
          explanation: '"to be" negativo = is + not → isn\'t ou \'s not. Nunca "don\'t" com to be.',
          tip: 'to be + not → isn\'t / \'s not. Nunca "don\'t be" ou "doesn\'t be".' },
        { options: ['Do they from Japan?', 'They are from Japan?', 'Are they from Japan?'], correct: 2,
          explanation: 'Perguntas com to be: inverta sujeito e verbo. Não use "do".',
          tip: 'To be em perguntas: inverta — Are they? Is she? Am I? Sem "do/does".' },
        { options: ['Não há diferença.', '"I am hungry" = presente (tenho fome agora). "I was hungry" = passado (tive fome antes).', '"I was hungry" é mais formal.'], correct: 1,
          explanation: '"am" = presente. "was" = passado. To be muda de forma: am/is → was; are → were.',
          tip: 'am/is → was (passado). are → were (passado). "I was, she was, they were."' }
      ],
      [ // section 1: modals
        { options: ['She cans swim very well.', 'She can to swim very well.', 'She can swim very well.'], correct: 2,
          explanation: 'Verbos modais não recebem -s e são seguidos do verbo base sem "to".',
          tip: 'Modal + verbo base. Nunca "cans" ou "can to". She can swim / he must go.' },
        { options: ['should — é uma obrigação legal.', 'must — é lei/obrigação absoluta.', 'could — é recomendação educada.'], correct: 1,
          explanation: '"must" = obrigação absoluta (lei). "should" = conselho/recomendação.',
          tip: 'must = lei/obrigação forte. should = deveria (conselho).' },
        { options: ['can — mais educado.', 'could — soa mais educado e indireto.', 'must — o mais polido.'], correct: 1,
          explanation: '"could" é a forma mais polida/educada. "Can" é direto; "could" adiciona cortesia.',
          tip: 'could = passado de can + mais educado. Use em pedidos: "Could you help me?"' },
        { options: ['She might to arrive early.', 'She mays arrive early.', 'She might arrive early.'], correct: 2,
          explanation: '"might" + verbo base (sem to). "mays" não existe.',
          tip: 'might/may + verbo base. "She might come. He may know."' },
        { options: ['São sinônimos.', '"must not" = proibido; "don\'t have to" = não é necessário (mas pode).', '"must not" é britânico; "don\'t have to" é americano.'], correct: 1,
          explanation: '"You must not smoke" = proibido. "You don\'t have to come" = não é obrigatório.',
          tip: 'must not = PROIBIDO. don\'t have to = OPCIONAL. Confundir pode causar mal-entendidos sérios.' }
      ],
      [ // section 2: phrasal verbs
        { options: ['São sinônimos — ambos significam desistir.', '"give up" = desistir; "give out" = distribuir ou parar de funcionar.', '"give up" é britânico; "give out" é americano.'], correct: 1,
          explanation: '"I gave up sugar" = desisti. "My phone gave out" = parou de funcionar.',
          tip: 'give up = desistir. give out = acabar/parar OU distribuir. Contexto decide.' },
        { options: ['Can you turn off the music? It\'s too loud.', 'Can you turn down the music? It\'s too loud.', 'Ambas corretas — turn off ou turn down dependem da intenção.'], correct: 2,
          explanation: '"turn off" = desligar completamente. "turn down" = abaixar o volume.',
          tip: 'turn off = desligar. turn down = abaixar. turn up = aumentar.' },
        { options: ['She turned off the offer.', 'She turned up the offer.', 'She turned down the offer.'], correct: 2,
          explanation: '"turn down" = rejeitar/recusar (oferta, convite, pedido).',
          tip: 'turn down = rejeitar. turn up = aparecer inesperadamente. turn off = desligar.' },
        { options: ['show up = mostrar algo publicamente.', 'show up = aparecer / chegar a um lugar.', 'show up = melhorar gradualmente.'], correct: 1,
          explanation: '"He showed up two hours late" = ele apareceu duas horas atrasado.',
          tip: 'show up = aparecer. "She always shows up early."' },
        { options: ['run out of = correr; put off = colocar; break up = quebrar.', 'run out of = ficar sem; put off = adiar; break up = terminar relacionamento.', 'run out of = sair correndo; put off = desligar; break up = partir.'], correct: 1,
          explanation: '"I ran out of coffee." "She put off the meeting." "They broke up."',
          tip: 'run out of = estoque acabou. put off = adiar. break up = fim de relacionamento.' }
      ]
    ]
  };

  // ========== PROGRESS MODULE ==========

  // ========== PEDAGOGICAL EVENT HANDLERS ==========

  function checkAnchorBlank(slug, blankIndex, selected, button) {
    const blank = ANCHOR_DIALOGS[slug].blanks[blankIndex];
    const buttonGroup = document.getElementById(`buttons-${slug}-${blankIndex}`);
    if (!blank || !buttonGroup) return;

    if (selected === blank.answer) {
      button.classList.add('is-correct');
      buttonGroup.querySelectorAll('.lp-anchor-option').forEach((optionBtn) => {
        optionBtn.disabled = true;
      });
      document.getElementById(`blank-${slug}-${blankIndex}`).textContent = selected;
      document.getElementById(`blank-${slug}-${blankIndex}`).classList.add('is-filled');
      const allCorrect = ANCHOR_DIALOGS[slug].blanks.every((_, index) =>
        document.getElementById(`blank-${slug}-${index}`)?.classList.contains('is-filled')
      );
      if (allCorrect) {
        document.getElementById(`anchor-continue-${slug}`).disabled = false;
      }
    } else {
      button.classList.add('is-wrong');
      button.disabled = true;
    }
  }

  function checkScaffoldedAnswer(slug, exIndex, optIdx, button) {
    const exercise = SCAFFOLDED_EXERCISES[slug][exIndex];
    const exEl = document.getElementById(`exercise-${slug}-${exIndex}`);
    if (!exercise || exEl.dataset.answered) return;
    exEl.dataset.answered = '1';

    const allBtns = document.querySelectorAll(`#options-${slug}-${exIndex} .lp-exercise-option`);
    allBtns.forEach(b => b.disabled = true);

    if (optIdx === exercise.correct) {
      button.classList.add('is-correct');
      const feedback = document.getElementById(`feedback-${slug}-${exIndex}`);
      feedback.innerHTML = '✓ Correto!';
      feedback.classList.add('is-visible');
      feedback.style.display = 'block';
    } else {
      button.classList.add('is-wrong');
      const hintsEl = document.getElementById(`hints-${slug}-${exIndex}`);
      hintsEl.style.display = 'block';
      hintsEl.innerHTML = `<div class="lp-hint"><strong>Dica:</strong> ${exercise.hints[0]}</div>`;
      if (!exEl.dataset.hintLevel) exEl.dataset.hintLevel = 1;
      else if (exEl.dataset.hintLevel < exercise.hints.length - 1) {
        exEl.dataset.hintLevel++;
        hintsEl.innerHTML += `<div class="lp-hint"><strong>Dica ${exEl.dataset.hintLevel}:</strong> ${exercise.hints[exEl.dataset.hintLevel]}</div>`;
      }
    }
  }

  function nextPhase(slug, phase) {
    const targetEl = document.getElementById(`${phase}-${slug}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function checkFinalTest(slug, qIdx, optIdx, button) {
    const test = FINAL_TESTS[slug][qIdx];
    const qEl = document.getElementById(`test-q-${slug}-${qIdx}`);
    if (!test || qEl.dataset.answered) return;
    qEl.dataset.answered = '1';

    const allBtns = document.querySelectorAll(`#test-q-${slug}-${qIdx} .lp-test-option`);
    allBtns.forEach(b => b.disabled = true);

    if (optIdx === test.correct) {
      button.classList.add('is-correct');
      window._testScore = (window._testScore || 0) + 1;
    } else {
      button.classList.add('is-wrong');
      const correct = allBtns[test.correct];
      if (correct) correct.classList.add('show-correct');
    }

    checkTestComplete(slug);
  }

  function checkTestComplete(slug) {
    const totalQ = FINAL_TESTS[slug].length;
    const answered = document.querySelectorAll(`[id^="test-q-${slug}-"][data-answered]`).length;
    if (answered === totalQ) showTestResult(slug);
  }

  function showTestResult(slug) {
    const totalQ = FINAL_TESTS[slug].length;
    const score = window._testScore || 0;
    const passing = Math.ceil(totalQ * 0.67);
    const passed = score >= passing;
    const resultEl = document.getElementById(`test-result-${slug}`);
    resultEl.innerHTML = `<div class="lp-result-box ${passed ? 'is-passed' : 'is-failed'}"><h3>${passed ? '🎉 Parabéns!' : '📚 Continue praticando'}</h3><p>Você acertou ${score} de ${totalQ}</p><p>${passed ? 'Você desbloqueou esta lição!' : 'Tente novamente!'}</p></div>`;
    resultEl.style.display = 'block';
    const completeBtn = document.getElementById(`test-complete-${slug}`);
    if (completeBtn) completeBtn.style.display = passed ? 'block' : 'none';
  }

  function completeLesson(slug) {
    window._griloMarkComplete && window._griloMarkComplete(slug);
  }

  const PROGRESS_KEY = 'grilo_lesson_progress';
  const LESSON_KEYS  = Object.keys(lessons);
  const exerciseScores = {};

  function getProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function saveProgress(p) {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch (e) {}
  }

  function setLessonVisited(slug) {
    const p = getProgress();
    if (!p[slug]) p[slug] = {};
    if (!p[slug].visited) {
      p[slug].visited = true;
      saveProgress(p);
      renderLessonsCards();
      updateHeroProgress();
    }
  }

  function setLessonCompleted(slug) {
    const p = getProgress();
    if (!p[slug]) p[slug] = {};
    p[slug].visited = true;
    p[slug].completed = true;
    saveProgress(p);
    renderLessonsCards();
    updateHeroProgress();
  }

  function getLessonStatus(slug) {
    return getProgress()[slug] || {};
  }

  function updateHeroProgress() {
    const p     = getProgress();
    const total = LESSON_KEYS.length;
    const done  = LESSON_KEYS.filter(k => p[k] && p[k].completed).length;
    const inProg = LESSON_KEYS.filter(k => p[k] && p[k].visited && !p[k].completed).length;

    const el    = document.getElementById('heroProgress');
    const fill  = document.getElementById('heroProgressFill');
    const label = document.getElementById('heroProgressLabel');
    if (!el || !fill || !label) return;

    if (done === 0 && inProg === 0) { el.style.display = 'none'; return; }
    el.style.display = 'flex';
    fill.style.width = Math.round((done / total) * 100) + '%';
    if (done === total) {
      label.innerHTML = `<strong>🏆 Todas as ${total} aulas concluídas!</strong>`;
    } else if (done > 0) {
      label.innerHTML = `<strong>${done}</strong> de ${total} aulas concluídas`;
    } else {
      label.innerHTML = `${inProg} aula${inProg > 1 ? 's' : ''} em progresso`;
    }
  }

  let lessonsRevealArmed = false;
  const LESSON_MODAL_ANIM_MS = 620;
  let lessonModalCloseTimer = null;
  let lastLessonTriggerRect = null;

  function revealLessonsStage() {
    const cosmos = document.getElementById('lessonsCosmos');
    const banner = document.getElementById('lessonsBanner');
    if (!cosmos || !banner) return;
    if (cosmos.classList.contains('is-revealed') || cosmos.classList.contains('is-revealing')) return;

    cosmos.classList.add('is-revealing');
    banner.setAttribute('aria-expanded', 'true');

    window.setTimeout(() => {
      cosmos.classList.remove('is-revealing');
      cosmos.classList.add('is-revealed');
    }, 760);
  }

  function updateLessonModalMotion(triggerEl) {
    const modal = document.getElementById('lessonContent');
    if (!modal) return;

    const rect = triggerEl && typeof triggerEl.getBoundingClientRect === 'function'
      ? triggerEl.getBoundingClientRect()
      : lastLessonTriggerRect;

    if (!rect) {
      modal.style.setProperty('--lp-modal-origin-x', '50%');
      modal.style.setProperty('--lp-modal-origin-y', '50%');
      modal.style.setProperty('--lp-modal-scale-x', '0.88');
      modal.style.setProperty('--lp-modal-scale-y', '0.9');
      modal.style.setProperty('--lp-modal-start-radius', '28px');
      return;
    }

    lastLessonTriggerRect = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    };

    const viewportWidth = Math.max(window.innerWidth || 1, 1);
    const viewportHeight = Math.max(window.innerHeight || 1, 1);
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);
    const scaleX = Math.min(0.96, Math.max(0.24, rect.width / viewportWidth));
    const scaleY = Math.min(0.96, Math.max(0.18, rect.height / viewportHeight));
    const radius = `${Math.round(Math.min(32, Math.max(20, rect.height * 0.12)))}px`;

    modal.style.setProperty('--lp-modal-origin-x', `${((centerX / viewportWidth) * 100).toFixed(2)}%`);
    modal.style.setProperty('--lp-modal-origin-y', `${((centerY / viewportHeight) * 100).toFixed(2)}%`);
    modal.style.setProperty('--lp-modal-scale-x', scaleX.toFixed(3));
    modal.style.setProperty('--lp-modal-scale-y', scaleY.toFixed(3));
    modal.style.setProperty('--lp-modal-start-radius', radius);
  }

  function closeLessonModal() {
    const modal = document.getElementById('lessonContent');
    if (!modal || modal.hasAttribute('hidden') || modal.classList.contains('is-closing')) return;
    modal.classList.remove('active');
    modal.classList.add('is-closing');
    document.title = 'Modulo - Licoes';

    window.clearTimeout(lessonModalCloseTimer);
    lessonModalCloseTimer = window.setTimeout(() => {
      modal.classList.remove('is-closing');
      modal.setAttribute('hidden', 'hidden');
      document.body.style.overflow = '';
    }, LESSON_MODAL_ANIM_MS);
  }

  function initLessonsChrome() {
    const banner = document.getElementById('lessonsBanner');
    const cosmos = document.getElementById('lessonsCosmos');
    const closeBtn = document.getElementById('lessonModalClose');
    const modal = document.getElementById('lessonContent');

    if (cosmos) {
      cosmos.classList.remove('is-revealing');
      cosmos.classList.add('is-revealed');
    }

    if (banner && !lessonsRevealArmed) {
      lessonsRevealArmed = true;
      banner.addEventListener('mouseenter', revealLessonsStage, { once: true });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeLessonModal);
    }

    if (modal) {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          closeLessonModal();
        }
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeLessonModal();
      }
    });
  }

  function updateSectionScore(slug, secIdx, isCorrect) {
    const key = `${slug}-${secIdx}`;
    if (!exerciseScores[key]) {
      const total = ((lessons[slug] || {}).sections || [])[secIdx]?.exercises?.length || 5;
      exerciseScores[key] = { correct: 0, total };
    }
    if (isCorrect) exerciseScores[key].correct++;
    const el = document.getElementById(`score-${slug}-${secIdx}`);
    if (el) {
      const { correct, total } = exerciseScores[key];
      el.textContent = `${correct}/${total}`;
      el.classList.toggle('has-score', correct > 0);
    }
  }

  // ========== RENDER LESSONS CARDS ==========

  function renderLessonsCards() {
    const container = document.getElementById('lessonsCardsContainer');
    if (!container) return;

    const progress = getProgress();
    container.innerHTML = '';

    LESSON_KEYS.forEach((key, index) => {
      const lesson  = lessons[key];
      const num     = String(index + 1).padStart(2, '0');
      const status  = progress[key] || {};
      const sectionCount = (lesson.sections || []).length;
      const progressPct = status.completed ? 100 : status.visited ? 42 : 0;
      const ctaText = status.completed ? 'Revisar aula' : status.visited ? 'Continuar aula' : 'Começar agora';
      const objectivePreview = lesson.objective.length > 84
        ? `${lesson.objective.substring(0, 84)}…`
        : lesson.objective;
      const card = document.createElement('div');
      card.className = 'lp-card' + (status.completed ? ' is-completed' : '');
      card.style.setProperty('--card-delay', `${index * 82}ms`);
      card.style.setProperty('--card-tilt', `${index % 2 === 0 ? '-1.2deg' : '1.2deg'}`);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Iniciar lição: ${lesson.title}`);

      let statusBadge = '';
      if (status.completed) {
        statusBadge = `<span class="lp-card-status lp-card-status--completed">✓ Concluída</span>`;
      } else if (status.visited) {
        statusBadge = `<span class="lp-card-status lp-card-status--visited">Em progresso</span>`;
      } else {
        statusBadge = `<span class="lp-card-status lp-card-status--new">Nova</span>`;
      }

      card.innerHTML = `
        <span class="lp-card-ambient"></span>
        <div class="lp-card-top">
          <span class="lp-card-kicker">LIÇÃO ${num}</span>
          <span class="lp-card-icon">${renderLessonIcon(lesson.icon)}</span>
        </div>
        <div class="lp-card-body">
          <div class="lp-card-brow">
            ${statusBadge}
            <span class="lp-card-chip">${sectionCount} seções</span>
          </div>
          <div class="lp-card-title">${lesson.title}</div>
          <div class="lp-card-desc">${objectivePreview}</div>
          ${lesson.highlight ? `<div class="lp-card-preview"><span class="lp-card-preview-label">Você vai praticar</span><div class="lp-card-tag">${lesson.highlight}</div></div>` : ''}
          <div class="lp-card-meta">
            <span class="lp-card-chip lp-card-chip--soft">A1 guiado</span>
            <span class="lp-card-chip lp-card-chip--soft">uso imediato</span>
          </div>
        </div>
        <div class="lp-card-footer">
          <div class="lp-card-progress-wrap">
            <span class="lp-card-cta">${ctaText}</span>
            <span class="lp-card-progress"><span class="lp-card-progress-fill" style="width:${progressPct}%"></span></span>
          </div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        showLessonContent(key, card);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showLessonContent(key, card);
        }
      });

      container.appendChild(card);
    });
  }

  // ========== SHOW LESSON CONTENT ==========

  function showLessonContent(slug, triggerEl) {
    const lesson = lessons[slug];
    if (!lesson) return;

    revealLessonsStage();

    const modal = document.getElementById('lessonContent');
    const aside = document.getElementById('lessonModalAside');
    const main  = document.getElementById('lessonModalMain');
    const crumb = document.getElementById('lessonModalCrumb');
    if (!modal) return;

    updateLessonModalMotion(triggerEl);
    window.clearTimeout(lessonModalCloseTimer);
    modal.classList.remove('is-closing');

    const index  = LESSON_KEYS.indexOf(slug);
    const num    = String(index + 1).padStart(2, '0');
    const status = getLessonStatus(slug);

    setLessonVisited(slug);

    // ── topbar breadcrumb ──
    if (crumb) {
      crumb.innerHTML = `Módulo A1 &rsaquo; <span>Lição ${num}</span>`;
    }

    // ── sidebar ──
    if (aside) {
      const editorialNav = slug === 'pronomes'
        ? [
            { id: `overview-${slug}`, label: 'Visão da aula' },
            { id: `concept-${slug}-0`, label: 'Quem faz a ação' },
            { id: `concept-${slug}-1`, label: 'Quem recebe a ação' },
            { id: `concept-${slug}-2`, label: 'Como mostrar posse' },
            { id: `table-${slug}`, label: 'Tabela de apoio' },
            { id: `exercises-${slug}`, label: 'Prática guiada' },
            { id: `test-${slug}`, label: 'Validação final' }
          ]
        : [{ id: `overview-${slug}`, label: 'Visão da aula' }, ...(lesson.sections || []).map((sec, i) => ({ id: `msec-${slug}-${i}`, label: sec.title }))];

      const navItems = editorialNav
        .map((item) => `
          <a class="lp-aside-nav-item" href="#${item.id}"
             onclick="event.preventDefault();document.getElementById('${item.id}')?.scrollIntoView({behavior:'smooth', block:'start'})">
            <span class="lp-aside-nav-dot"></span>${item.label}
          </a>`).join('');

      const points = (lesson.teachingPoints || [])
        .map(p => `<li class="lp-aside-point">${p}</li>`).join('');

      aside.innerHTML = `
        <span class="lp-aside-icon">${renderLessonIcon(lesson.icon)}</span>
        <span class="lp-aside-num">LIÇÃO ${num}</span>
        <div class="lp-aside-title">${lesson.title}</div>
        <p class="lp-aside-obj">${lesson.objective}</p>
        <div class="lp-aside-sep"></div>
        ${points ? `<span class="lp-aside-section-label">O que você vai aprender</span><ul class="lp-aside-points">${points}</ul><div class="lp-aside-sep"></div>` : ''}
        ${navItems ? `<span class="lp-aside-section-label">Seções desta aula</span><nav class="lp-aside-nav">${navItems}</nav>` : ''}
        <div class="lp-aside-btn-group">
          <button class="lp-aside-complete-btn${status.completed ? ' is-done' : ''}"
            ${status.completed ? 'disabled' : ''}
            data-slug="${slug}"
            onclick="window._griloMarkComplete && window._griloMarkComplete(this.dataset.slug, this)">
            ${status.completed ? '✓ Aula concluída' : '✓ Marcar como concluída'}
          </button>
          <button class="lp-aside-chat-btn" data-slug="${slug}"
            onclick="window._griloOpenChat && window._griloOpenChat(this.dataset.slug)">
            🤖 Perguntar ao GRILO
          </button>
        </div>
      `;
    }

    // ── main content ──
    if (main) {
      main.innerHTML = '';

      const hasPedagogicalRenderer = typeof renderAnchorDialog === 'function'
        && typeof renderInteractiveTable === 'function'
        && typeof renderScaffoldedExercises === 'function'
        && typeof renderFinalTest === 'function';

      if (slug === 'pronomes' && hasPedagogicalRenderer) {
        window._testScore = 0;
        main.innerHTML = `
          ${renderPedagogicalOverview(slug, lesson)}
          <div class="lp-peda-phase" id="anchor-${slug}">${renderAnchorDialog(slug)}</div>
          <div class="lp-peda-phase" id="table-${slug}">${renderInteractiveTable(slug)}</div>
          <div class="lp-peda-phase" id="exercises-${slug}">${renderScaffoldedExercises(slug)}</div>
          <div class="lp-peda-phase" id="test-${slug}">${renderFinalTest(slug)}</div>
        `;
      } else {
        if (slug === 'pronomes') {
          console.warn('[LESSONS] Pedagogical renderer unavailable for pronomes. Falling back to standard lesson view.');
        }

        main.innerHTML = renderPedagogicalOverview(slug, lesson, { sectionIdPrefix: 'overview-concept' });

        (lesson.sections || []).forEach((sec, idx) => {
          const secEl = document.createElement('div');
          secEl.className = 'lp-msec';
          secEl.id = `msec-${slug}-${idx}`;
          const editorialSection = getPedagogicalEditorial(slug, lesson).sections?.[idx] || {};

          let html = `
            <div class="lp-msec-header">
              <div class="lp-msec-num">${String(idx + 1).padStart(2, '0')}</div>
              <h2 class="lp-msec-title">${sec.title}</h2>
              <div class="lp-msec-score" id="score-${slug}-${idx}"></div>
            </div>
          `;

          if (editorialSection.summary) {
            html += `<p class="lp-peda-section-lead">${editorialSection.summary}</p>`;
          }

          if (sec.explanation) {
            html += `<p class="lp-msec-explanation">${sec.explanation}</p>`;
          }

          if (sec.examples && sec.examples.length) {
            html += `
              <div class="lp-mex">
                <div class="lp-mex-label">📝 Exemplos</div>
                <ul class="lp-mex-list">
                  ${sec.examples.map(ex => {
                    if (typeof ex === 'string') {
                      return `<li class="lp-mex-item"><span class="lp-ex-en">${ex}</span></li>`;
                    }
                    return `<li class="lp-mex-item"><span class="lp-ex-en">${ex.en}</span>${ex.pt ? `<span class="lp-ex-pt">${ex.pt}</span>` : ''}</li>`;
                  }).join('')}
                </ul>
              </div>`;
          }

          if (sec.exercises && sec.exercises.length) {
            const mcSec = (EXERCISE_MC[slug] || [])[idx] || [];
            const safeSlug = slug.replace(/'/g, "\\'");
            const items = sec.exercises.map((ex, ei) => {
              const mc = mcSec[ei];
              const optionsHtml = mc ? mc.options.map((opt, oi) =>
                `<button class="lp-exr-option" onclick="window._griloAnswer&&window._griloAnswer(this,'${safeSlug}',${idx},${ei},${oi})">${opt}</button>`
              ).join('') : '';
              const feedbackHtml = mc ? `
                <div class="lp-exr-feedback">
                  <div class="lp-exr-feedback-correct">✓ Correto: <strong>${mc.options[mc.correct]}</strong></div>
                  <div class="lp-exr-feedback-text">${mc.explanation}</div>
                  <div class="lp-exr-feedback-tip">💡 <strong>Como lembrar:</strong> ${mc.tip}</div>
                </div>` : '';
              return `
                <div class="lp-exr-interactive" data-sec="${idx}" data-ex="${ei}">
                  <div class="lp-exr-q">
                    <span class="lp-exr-num">${ei + 1}</span>
                    <span>${ex}</span>
                  </div>
                  ${mc ? `<div class="lp-exr-options">${optionsHtml}</div>${feedbackHtml}` : ''}
                </div>`;
            }).join('');

            html += `<div class="lp-mexr"><div class="lp-mexr-label">✏️ Pratique agora</div>${items}</div>`;
          }

          secEl.innerHTML = html;
          main.appendChild(secEl);
        });

        if (lesson.curiosities && lesson.curiosities.length) {
          const cur = document.createElement('div');
          cur.className = 'lp-mcur';
          cur.innerHTML = `
            <div class="lp-mcur-label">💡 Sabia que…</div>
            <ul class="lp-mcur-list">
              ${lesson.curiosities.map(c => `<li class="lp-mcur-item">${c}</li>`).join('')}
            </ul>
          `;
          main.appendChild(cur);
        }
      }
    }

    modal.removeAttribute('hidden');
    window.requestAnimationFrame(() => {
      modal.classList.add('active');
    });
    document.body.style.overflow = 'hidden';
    document.title = `${lesson.title} — GRILO`;
    if (main)  main.scrollTop = 0;
    if (aside) aside.scrollTop = 0;
  }

  // ========== INITIALIZE ==========

  window._griloAnswer = function(btn, slug, secIdx, exIdx, optIdx) {
    const item = btn.closest('.lp-exr-interactive');
    if (!item || item.dataset.answered) return;
    item.dataset.answered = '1';

    const mc = ((EXERCISE_MC[slug] || [])[secIdx] || [])[exIdx];
    if (!mc) return;

    const isCorrect = optIdx === mc.correct;
    const allBtns = item.querySelectorAll('.lp-exr-option');
    allBtns.forEach((b, i) => {
      b.disabled = true;
      if (i === mc.correct) b.classList.add('is-correct');
    });
    if (!isCorrect) {
      btn.classList.add('is-wrong');
      const feedback = item.querySelector('.lp-exr-feedback');
      if (feedback) feedback.classList.add('is-visible');
    }
    updateSectionScore(slug, secIdx, isCorrect);
  };

  window._griloMarkComplete = function(slug, btn) {
    setLessonCompleted(slug);
    if (btn) { btn.textContent = '✓ Aula concluída'; btn.classList.add('is-done'); btn.disabled = true; }
  };

  window._griloOpenChat = function(slug) {
    const lesson = lessons[slug];
    if (!lesson) return;
    try {
      sessionStorage.setItem('grilo_lesson_context', JSON.stringify({
        slug,
        title: lesson.title,
        objective: lesson.objective
      }));
    } catch (e) {}
    window.location.href = 'home.html';
  };

  renderLessonsCards();
  updateHeroProgress();
  initLessonsChrome();
  window.renderAnchorDialog = renderAnchorDialog;
  window.renderInteractiveTable = renderInteractiveTable;
  window.renderScaffoldedExercises = renderScaffoldedExercises;
  window.renderFinalTest = renderFinalTest;
  window.showGlossary = showGlossary;
  window.hideGlossary = hideGlossary;
  window.checkAnchorBlank = checkAnchorBlank;
  window.checkScaffoldedAnswer = checkScaffoldedAnswer;
  window.checkFinalTest = checkFinalTest;
  window.nextPhase = nextPhase;
  window.completeLesson = completeLesson;
  window.closeLessonModal = closeLessonModal;
  window.showLessonContent = showLessonContent;
})();
