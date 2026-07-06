/**
 * lessons-enhanced.js
 * Enhanced lesson page with animations, scroll effects, and improved interactivity
 * Works with the redesigned lesson.html structure
 */

(function() {
  'use strict';

  console.log('[LESSONS-ENHANCED] Script iniciando...');

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
    VB: '<span class="lp-glyph lp-glyph--scene" aria-hidden="true"><svg viewBox="0 0 48 48"><ellipse cx="24" cy="39" rx="13.5" ry="4" fill="#c7d7f8"></ellipse><path d="M10.5 10.8h19.7c3.2 0 5.8 2.6 5.8 5.8v18.2H16.7c-3.4 0-6.2 2.8-6.2 6.2z" fill="#dbe9ff" stroke="#1f2b8c" stroke-width="2.5" stroke-linejoin="round"></path><path d="M16 17.8h11.8M16 23.3h11.8M16 28.8h7.4" stroke="#1f2b8c" stroke-width="2.5" stroke-linecap="round"></path><path d="M30.6 11.7l6.7 6.7-4.7 4.7-5.5 1.5 1.4-5.5z" fill="#ff6b88" stroke="#1f2b8c" stroke-width="2.5" stroke-linejoin="round"></path><path d="M35.6 9l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#ffd95e" stroke="#1f2b8c" stroke-width="1.8"></path></svg></span>',
    SN: '<span class="lp-glyph lp-glyph--scene" aria-hidden="true"><svg viewBox="0 0 48 48"><ellipse cx="24" cy="39" rx="13" ry="4" fill="#c7d7f8"></ellipse><rect x="6" y="20" width="4" height="8" rx="2" fill="#6bc5f8" stroke="#1f2b8c" stroke-width="2"></rect><rect x="13" y="14" width="4" height="20" rx="2" fill="#6bc5f8" stroke="#1f2b8c" stroke-width="2"></rect><rect x="20" y="10" width="4" height="28" rx="2" fill="#4a9ef5" stroke="#1f2b8c" stroke-width="2.2"></rect><rect x="27" y="16" width="4" height="16" rx="2" fill="#6bc5f8" stroke="#1f2b8c" stroke-width="2"></rect><rect x="34" y="21" width="4" height="6" rx="2" fill="#6bc5f8" stroke="#1f2b8c" stroke-width="2"></rect><path d="M8 24 h32" stroke="#1f2b8c" stroke-width="1.2" stroke-dasharray="2 3" opacity="0.3"></path></svg></span>',
    NU: '<span class="lp-glyph lp-glyph--scene" aria-hidden="true"><svg viewBox="0 0 48 48"><ellipse cx="24" cy="39" rx="13" ry="4" fill="#c7d7f8"></ellipse><rect x="9" y="9" width="30" height="26" rx="4" fill="#eef4ff" stroke="#1f2b8c" stroke-width="2.5"></rect><text x="16" y="22" font-size="9" font-family="monospace" font-weight="bold" fill="#1f2b8c">1 2</text><text x="16" y="31" font-size="9" font-family="monospace" font-weight="bold" fill="#1f2b8c">3 4</text><circle cx="36" cy="12" r="5" fill="#ff6b88" stroke="#1f2b8c" stroke-width="2"></circle><path d="M34 12 h4 M36 10 v4" stroke="#fff" stroke-width="2" stroke-linecap="round"></path></svg></span>',
    GR: '<span class="lp-glyph lp-glyph--scene" aria-hidden="true"><svg viewBox="0 0 48 48"><ellipse cx="24" cy="39.5" rx="13" ry="3.5" fill="#c7d7f8"></ellipse><path d="M8 8h22c3.3 0 6 2.7 6 6v11c0 3.3-2.7 6-6 6H18l-6 5v-5H8c-3.3 0-6-2.7-6-6V14c0-3.3 2.7-6 6-6z" transform="translate(4 0)" fill="#dbe9ff" stroke="#1f2b8c" stroke-width="2.5" stroke-linejoin="round"></path><path d="M15 18 h14 M15 23 h9" stroke="#1f2b8c" stroke-width="2.2" stroke-linecap="round"></path><circle cx="37" cy="13" r="6" fill="#ffd95e" stroke="#1f2b8c" stroke-width="2.2"></circle><path d="M37 10.5 v5 M34.5 13 h5" stroke="#1f2b8c" stroke-width="2" stroke-linecap="round"></path></svg></span>'
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
          explanation: 'Quando alguém não está fazendo a ação, mas sim recebendo ela — como quando alguém te liga, te ajuda ou te chama — usamos um segundo grupo: me (me/mim), you (continua igual), him (ele/o), her (ela/a), it (continua igual), us (nós/nos) e them (eles/os). No Brasil muita gente erra dizendo "ligou para eu" — em inglês seria "called me". Dois casos chamam esse grupo: (a) depois do verbo como objeto direto — "She called me", "I saw him"; (b) depois de preposição — "with me", "for him", "to her". Se a palavra recebe a ação ou aparece depois de preposição, é hora do segundo grupo.',
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
          explanation: 'Para dizer que algo pertence a alguém, o inglês tem dois jeitos. O primeiro é colocar uma palavra antes do objeto: "my bag" (minha bolsa), "his car" (o carro dele). O segundo é substituir o objeto inteiro: "the bag is mine" (a bolsa é minha), "the car is his". A diferença prática: se o objeto aparece na frase, use o primeiro jeito (my, your, his, her, its, our, their). Se o objeto já foi mencionado ou está claro no contexto, use o segundo (mine, yours, his, hers, ours, theirs). "Its" não tem forma independente — em inglês não existe "the bag is its" (ao contrário de "mine", "yours", "hers").',
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
            'Complete: "She ___ ___ (cook) when I arrived." (estava cozinhando)',
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
          explanation: 'Um dos maiores desafios do inglês para brasileiros: verbos que ganham uma segunda palavra (como "up", "out", "on", "off", "in", "away") e mudam completamente de sentido. "Give" sozinho = dar. "Give up" = desistir. "Give out" = distribuir. "Look" sozinho = olhar. "Look up" = pesquisar (num dicionário ou no Google). "Look after" = cuidar de. "Look for" = procurar. Não há como adivinhar — é aprender como expressão fixa. A boa notícia: eles seguem padrões que você vai perceber com o tempo. Os mais importantes para o dia a dia estão abaixo. Os 10 mais usados no cotidiano: give up (desistir), find out (descobrir), look for (procurar), come back (voltar), go on (continuar), pick up (buscar), turn on/off (ligar/desligar), look up (pesquisar), put on (vestir), run out of (acabar com).',
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
        'O TO BE é o único verbo inglês com formas completamente diferentes no passado: am/is/are viram was/were. Nenhum outro verbo muda tanto. Isso é resíduo de quando o inglês era muito mais próximo do alemão.',
        'O inglês não tem o equivalente do "saudade" português, mas tem "to miss" — que mistura sentir falta de uma pessoa E lamentar ter perdido algo: "I missed the train" (perdi o trem) e "I miss you" (sinto sua falta). Mesma palavra, dois sentidos.',
        'Existem mais de 5.000 phrasal verbs catalogados em inglês. Impossível aprender todos — mas os 50 mais comuns cobrem cerca de 80% das situações do cotidiano. Foque neles.'
      ]
    },

    // ════════════════════════════════════════════════════════════
    // MÓDULO 1 — PRIMEIROS PASSOS
    // ════════════════════════════════════════════════════════════

    'soa1-alfabeto': {
      title: 'Alfabeto e sons que o português não tem',
      objective: 'Aprenda os sons do inglês que travam o brasileiro: o TH, o R retroflexo e a diferença entre vogais curtas e longas. Sem decorar, com a boca certa.',
      icon: 'SN',
      highlight: 'TH • R • short vs long vowels',
      teachingPoints: [
        'Pronunciar o TH em "think" e "this" sem trocar por T ou D.',
        'Sentir a diferença entre "ship" (curto) e "sheep" (longo) — muda a palavra inteira.',
        'Soar o R inicial sem rolar como em português ("red", não "hed").',
        'Reconhecer que as letras do alfabeto em inglês têm nomes diferentes ("A" vira "ei", "E" vira "i").'
      ],
      sections: [
        {
          id: 'alfabeto-nomes',
          title: 'Os nomes das letras: como soletrar em inglês',
          explanation: 'No inglês, soletrar é uma habilidade do dia a dia — você vai ouvir muito "Can you spell that?" Cada letra tem um nome próprio que não corresponde ao som do português. A vogal "A" se chama "ei". O "E" se chama "i". O "I" se chama "ai". O "Y" se chama "uai". As consoantes mais traiçoeiras: G se chama "dji", H se chama "eitch", J se chama "djei", W se chama "double-iu". Acostumar com isso destrava telefones, e-mails e nomes próprios.',
          soundboard: {
            title: '🔊 As 26 letras — clique para ouvir',
            items: [
              { word: 'A', pron: 'ei', speech: 'A' }, { word: 'B', pron: 'bi', speech: 'B' },
              { word: 'C', pron: 'si', speech: 'C' }, { word: 'D', pron: 'di', speech: 'D' },
              { word: 'E', pron: 'i', speech: 'E' }, { word: 'F', pron: 'ef', speech: 'F' },
              { word: 'G', pron: 'dji', speech: 'G' }, { word: 'H', pron: 'eitch', speech: 'H' },
              { word: 'I', pron: 'ai', speech: 'I' }, { word: 'J', pron: 'djei', speech: 'J' },
              { word: 'K', pron: 'kei', speech: 'K' }, { word: 'L', pron: 'el', speech: 'L' },
              { word: 'M', pron: 'em', speech: 'M' }, { word: 'N', pron: 'en', speech: 'N' },
              { word: 'O', pron: 'ou', speech: 'O' }, { word: 'P', pron: 'pi', speech: 'P' },
              { word: 'Q', pron: 'kiu', speech: 'Q' }, { word: 'R', pron: 'ar', speech: 'R' },
              { word: 'S', pron: 'es', speech: 'S' }, { word: 'T', pron: 'ti', speech: 'T' },
              { word: 'U', pron: 'iu', speech: 'U' }, { word: 'V', pron: 'vi', speech: 'V' },
              { word: 'W', pron: 'double-iu', speech: 'W' }, { word: 'X', pron: 'eks', speech: 'X' },
              { word: 'Y', pron: 'uái', speech: 'Y' }, { word: 'Z', pron: 'zi', speech: 'Z' }
            ]
          },
          examples: [
            { en: 'My name is Lucas. L-U-C-A-S.', pt: 'Meu nome é Lucas. Élle-U-Ci-A-Éss (em inglês: "él-iu-ssi-ei-éss").' },
            { en: 'How do you spell that?', pt: 'Como se soletra isso?' },
            { en: 'E-mail: J-A-N-E at gmail.', pt: 'E-mail: Djei-ei-en-i arroba gmail.' },
            { en: 'Is it with one R or two?', pt: 'É com um R ou dois?' },
            { en: 'The Wi-Fi password is uppercase.', pt: 'A senha do Wi-Fi é maiúscula.' }
          ],
          exercises: [
            'Como se soletra a letra "A" em inglês?',
            'Qual o nome da letra "G" em inglês?',
            'Como você pede para alguém soletrar o nome dela?',
            'O "W" se pronuncia como?',
            'Qual a diferença entre o nome da letra "E" em português e em inglês?'
          ]
        },
        {
          id: 'sons-dificeis',
          title: 'TH, R e vogais que mudam tudo',
          explanation: 'Três pontos que travam o brasileiro: (1) o TH é a língua entre os dentes — "think" não é "tchink" nem "fink", é o som de sopro com a língua aparecendo. (2) O R do inglês americano é retroflexo: a língua se curva pra trás sem encostar em nada. (3) Vogais curtas vs longas mudam o sentido: "ship" (navio) vs "sheep" (ovelha), "live" (viver) vs "leave" (partir). Treine devagar e o ouvido vai pegar.',
          soundboard: {
            title: '🔊 Pares que destravam o ouvido — compare e treine',
            items: [
              { word: 'think', pron: 'th-ink', speech: 'think' },
              { word: 'sink', pron: 's-ink', speech: 'sink' },
              { word: 'three', pron: 'th-ri', speech: 'three' },
              { word: 'tree', pron: 't-ri', speech: 'tree' },
              { word: 'ship', pron: 'i curto', speech: 'ship' },
              { word: 'sheep', pron: 'ii longo', speech: 'sheep' },
              { word: 'live', pron: 'i curto', speech: 'live' },
              { word: 'leave', pron: 'ii longo', speech: 'leave' },
              { word: 'red', pron: 'r retroflexo', speech: 'red' },
              { word: 'right', pron: 'r retroflexo', speech: 'right' }
            ]
          },
          examples: [
            { en: 'I think this is right.', pt: 'Eu acho que isso está certo.' },
            { en: 'Three brothers.', pt: 'Três irmãos. (TH duas vezes)' },
            { en: 'Red car, big tree.', pt: 'Carro vermelho, árvore grande. (R retroflexo)' },
            { en: 'I want to live in a quiet place.', pt: 'Eu quero viver num lugar quieto. (live curto)' },
            { en: 'I leave at 8.', pt: 'Eu saio às 8. (leave longo)' }
          ],
          exercises: [
            'Como o brasileiro normalmente erra a pronúncia de "think"?',
            'Qual a diferença entre "ship" (navio) e "sheep" (ovelha)?',
            'Como deve soar o R inicial de "red" no inglês americano?',
            'Qual o problema de pronunciar "three" como "tree"?',
            'Por que "live" e "leave" são confundidos pelo brasileiro?'
          ]
        }
      ],
      curiosities: [
        'O som do TH não existe na maioria das línguas do mundo. Holandês, alemão, espanhol — nenhum tem. Por isso é tão difícil pra todo mundo, não só brasileiro.',
        'O alfabeto fonético do inglês ("Alpha, Bravo, Charlie...") foi criado pra evitar confusão em rádios militares. Hoje atendentes de telefone usam ele todos os dias.',
        'A diferença entre "ship" e "sheep" não é só comprimento — a posição da língua muda. Em "sheep" a língua vai mais pra frente. Esse detalhe é o que destrava o ouvido.'
      ]
    },

    'soa1-numeros': {
      title: 'Números, horas e datas',
      objective: 'Aprenda a trabalhar com números em inglês — dos primeiros vinte até as dezenas, mais horas e datas. Os pontos que aparecem em qualquer conversa real.',
      icon: 'NU',
      highlight: '1 → 100 • What time is it? • datas',
      teachingPoints: [
        'Contar de 0 a 100 sem travar — base pra qualquer conversa sobre quantidade.',
        'Diferenciar 13/30, 14/40, 15/50 (que soam parecidos e confundem).',
        'Perguntar e dizer horas no formato natural ("It\'s half past three").',
        'Dizer datas no padrão americano (month/day) e britânico (day/month).'
      ],
      sections: [
        {
          id: 'numeros-base',
          title: 'Contagem de 0 a 100 — e os traiçoeiros',
          explanation: 'De 1 a 12 cada número tem nome próprio. De 13 a 19, todos terminam em -teen (thirteen, fourteen...). De 20 a 90, todos terminam em -ty (twenty, thirty...). O cuidado: a sílaba forte muda. "Thirteen" tem ênfase no "TEEN" (tcher-TIIN). "Thirty" tem ênfase no "thir" (THER-ti). Confundir 13 com 30 num restaurante muda a conta.',
          soundboard: {
            title: '🔊 Números 1 a 20 — clique e treine',
            items: [
              { word: '1', pron: 'one', speech: 'one' }, { word: '2', pron: 'two', speech: 'two' },
              { word: '3', pron: 'three', speech: 'three' }, { word: '4', pron: 'four', speech: 'four' },
              { word: '5', pron: 'five', speech: 'five' }, { word: '6', pron: 'six', speech: 'six' },
              { word: '7', pron: 'seven', speech: 'seven' }, { word: '8', pron: 'eight', speech: 'eight' },
              { word: '9', pron: 'nine', speech: 'nine' }, { word: '10', pron: 'ten', speech: 'ten' },
              { word: '11', pron: 'eleven', speech: 'eleven' }, { word: '12', pron: 'twelve', speech: 'twelve' },
              { word: '13', pron: 'thirTEEN', speech: 'thirteen' }, { word: '30', pron: 'THIRty', speech: 'thirty' },
              { word: '14', pron: 'fourTEEN', speech: 'fourteen' }, { word: '40', pron: 'FORty', speech: 'forty' },
              { word: '15', pron: 'fifTEEN', speech: 'fifteen' }, { word: '50', pron: 'FIFty', speech: 'fifty' },
              { word: '20', pron: 'twenty', speech: 'twenty' }, { word: '100', pron: 'hundred', speech: 'one hundred' }
            ]
          },
          examples: [
            { en: 'I am thirty years old.', pt: 'Eu tenho trinta anos.' },
            { en: 'She is thirteen.', pt: 'Ela tem treze.' },
            { en: 'The bill is fifty dollars.', pt: 'A conta é cinquenta dólares.' },
            { en: 'I need fifteen minutes.', pt: 'Eu preciso de quinze minutos.' },
            { en: 'There are one hundred people.', pt: 'Tem cem pessoas.' }
          ],
          exercises: [
            'Como você diz "trinta" em inglês?',
            'Qual a diferença entre "thirteen" e "thirty" na pronúncia?',
            'Complete: "I am ___ years old." (15)',
            'Como você diz "cinquenta dólares" em inglês?',
            'Como se escreve "vinte e cinco" em inglês?'
          ]
        },
        {
          id: 'horas-datas',
          title: 'Que horas são? Que dia é?',
          explanation: 'Para horas, o inglês usa "It\'s" + número. "It\'s five o\'clock" (5h em ponto). Meia hora vira "half past": "half past three" = 3:30. Quinze depois vira "quarter past": "quarter past two" = 2:15. Quinze antes vira "quarter to": "quarter to four" = 3:45. Datas: nos EUA escrevem month/day/year (May 17, 2026). Em qualquer lugar, falando, é comum dizer "the seventeenth of May" (dia 17 de maio) — note o "th" no número ordinal.',
          soundboard: {
            title: '🔊 Estruturas de horas e datas — ouça e absorva o ritmo',
            items: [
              { word: 'five o\'clock', pron: '5h em ponto', speech: 'five o clock' },
              { word: 'half past three', pron: '3:30', speech: 'half past three' },
              { word: 'quarter past two', pron: '2:15', speech: 'quarter past two' },
              { word: 'quarter to four', pron: '3:45', speech: 'quarter to four' },
              { word: 'noon', pron: 'meio-dia', speech: 'noon' },
              { word: 'midnight', pron: 'meia-noite', speech: 'midnight' },
              { word: 'May fifth', pron: '5 de maio', speech: 'May fifth' },
              { word: 'the tenth', pron: 'o dia 10', speech: 'the tenth' }
            ]
          },
          examples: [
            { en: 'What time is it?', pt: 'Que horas são?' },
            { en: 'It\'s half past three.', pt: 'São três e meia.' },
            { en: 'It\'s quarter to seven.', pt: 'É um quarto pras sete (6:45).' },
            { en: 'My birthday is on May fifth.', pt: 'Meu aniversário é cinco de maio.' },
            { en: 'See you on the tenth.', pt: 'Te vejo no dia dez.' }
          ],
          exercises: [
            'Como você pergunta "Que horas são?" em inglês?',
            'Como você diz "três e meia" em inglês?',
            'O que significa "quarter to seven"?',
            'Como se escreve a data 05/17/2026 nos EUA — qual dia é?',
            'Como você diz "meu aniversário é 10 de maio" em inglês?'
          ]
        }
      ],
      curiosities: [
        'Inglês americano e britânico usam ordens diferentes pra datas. 05/06/2026 nos EUA é 6 de maio. No Reino Unido é 5 de junho. Isso já causou muita confusão em viagens.',
        'O "o\'clock" é a forma curta de "of the clock" — uma expressão de 600 anos atrás. Hoje só sobrevive pra dizer "em ponto".',
        'Em inglês não existe "vinte e cinco" como uma palavra única (vinteicinco). É sempre "twenty-five" com hífen quando escrito. Esse pequeno detalhe ortográfico engana muita gente.'
      ]
    },

    'soa1-cumprimentos': {
      title: 'Cumprimentos e apresentação',
      objective: 'Saiba abrir conversa em inglês sem soar como livro de escola — desde o "Hello" no balcão até o "Nice to meet you" da primeira reunião.',
      icon: 'GR',
      highlight: 'Hi • Hello • Nice to meet you',
      teachingPoints: [
        'Escolher entre Hi, Hello e Hey conforme a formalidade.',
        'Responder a "How are you?" sem travar no automático ("Fine, thanks").',
        'Se apresentar em três frases curtas que sustentam qualquer primeiro contato.',
        'Despedir com naturalidade — não é só "Goodbye".'
      ],
      sections: [
        {
          id: 'abertura',
          title: 'Como abrir conversa',
          explanation: 'Hi é o cumprimento padrão, vale pra todo mundo. Hello é um pouco mais formal — você usa no telefone ou com alguém mais distante. Hey é informal, entre amigos ou colegas. Depois vem o "how are you?" — que na prática não é uma pergunta real, é só protocolo. Responda com "Good, thanks. And you?" e a conversa segue. Travar nessa parte é o erro mais comum: o nativo não quer um relatório, quer só o ping-pong social.',
          soundboard: {
            title: '🔊 Cumprimentos e respostas — ouça o tom natural',
            items: [
              { word: 'Hi', pron: 'cumprimento padrão', speech: 'Hi' },
              { word: 'Hello', pron: 'formal / telefone', speech: 'Hello' },
              { word: 'Hey', pron: 'amigos / colegas', speech: 'Hey' },
              { word: 'How are you?', pron: 'protocolo social', speech: 'How are you?' },
              { word: 'I\'m good, thanks', pron: 'resposta padrão', speech: 'I am good, thanks' },
              { word: 'And you?', pron: 'devolva a pergunta', speech: 'And you?' },
              { word: 'Not bad', pron: 'casual', speech: 'Not bad' },
              { word: 'How\'s it going?', pron: 'informal', speech: 'How is it going?' }
            ]
          },
          examples: [
            { en: 'Hi, how are you?', pt: 'Oi, tudo bem?' },
            { en: 'Hello, nice to meet you.', pt: 'Olá, prazer em conhecer você.' },
            { en: 'Hey, how\'s it going?', pt: 'E aí, beleza?' },
            { en: 'I\'m good, thanks. And you?', pt: 'Tô bem, valeu. E você?' },
            { en: 'Not bad, you?', pt: 'Não tô mal, e você?' }
          ],
          exercises: [
            'Qual a diferença entre "Hi", "Hello" e "Hey"?',
            'Alguém te pergunta "How are you?" — qual a melhor resposta?',
            'Você atende o telefone no trabalho. Qual cumprimento usar?',
            'Complete: "Good, thanks. ___?" (e você?)',
            'Por que travar contando seus problemas em "How are you?" é um erro?'
          ]
        },
        {
          id: 'apresentacao',
          title: 'Se apresentar em três frases',
          explanation: 'Uma boa apresentação curta tem três blocos: (1) nome — "My name is Lucas, but you can call me Luc", (2) origem — "I\'m from Brazil, from São Paulo", (3) ocupação — "I work as a designer" ou "I\'m studying English to travel". Termina com "Nice to meet you". Essas três frases bastam pra abrir 90% das conversas iniciais — sejam de trabalho, viagem ou socialização.',
          examples: [
            { en: 'My name is Lucas.', pt: 'Meu nome é Lucas.' },
            { en: 'I\'m from Brazil, from São Paulo.', pt: 'Eu sou do Brasil, de São Paulo.' },
            { en: 'I work as a designer.', pt: 'Eu trabalho como designer.' },
            { en: 'Nice to meet you.', pt: 'Prazer em te conhecer.' },
            { en: 'See you later.', pt: 'Até mais tarde.' }
          ],
          exercises: [
            'Como você diz "Meu nome é Carlos" em inglês?',
            'Como você diz que é do Brasil, mais especificamente do Rio?',
            'Quando você usa "Nice to meet you" e quando NÃO usa?',
            'Quais são os três blocos de uma apresentação curta?',
            'Como se despedir de forma natural (não só "Goodbye")?'
          ]
        }
      ],
      curiosities: [
        '"How are you?" no inglês americano funciona como o "tudo bem?" do brasileiro. Ninguém realmente quer saber. Responder com problemas de saúde pega o nativo de surpresa.',
        '"Nice to meet you" só se usa na PRIMEIRA vez. Da segunda em diante, é "Nice to see you again". Misturar isso revela que você não conhece a pessoa de antes.',
        'No Reino Unido, "How do you do?" não pede resposta real — você responde com a mesma frase. É praticamente um cumprimento ritualístico.'
      ]
    },

    'soa1-tobe-afirm': {
      title: 'Quem você é — TO BE em afirmativa',
      objective: 'Domine o verbo mais importante do inglês: o TO BE. Aprenda a dizer "eu sou", "ele está", "nós somos" sem confusão entre as três formas (am, is, are).',
      icon: 'VB',
      highlight: 'I am • He/She is • We/They are',
      teachingPoints: [
        'Saber que I usa AM, ele/ela/it usa IS, e os outros usam ARE.',
        'Entender que TO BE traduz "ser" e "estar" — mesma palavra pra dois sentidos do português.',
        'Usar as contrações (I\'m, he\'s, they\'re) que aparecem em 90% da fala natural.',
        'Construir frases de identidade, estado e localização sem travar.'
      ],
      sections: [
        {
          id: 'am-is-are',
          title: 'A regra das três formas',
          explanation: 'O TO BE muda de cara conforme quem fala: I am (eu sou/estou), you are (você é/está), he/she/it is (ele/ela é/está), we are (nós somos), they are (eles são). Não tem outra forma — é só decorar e usar. Na fala, ninguém diz "I am" — vira "I\'m". "He is" vira "he\'s". "We are" vira "we\'re". Soltar as contrações faz a diferença entre soar livro de escola e soar humano.',
          table: {
            title: 'Conjugação do TO BE no presente',
            headers: ['Sujeito', 'Forma', 'Contração', 'Exemplo'],
            rows: [
              { cells: ['I', 'am', "I'm", "I'm Brazilian."], speak: "I am Brazilian" },
              { cells: ['You', 'are', "You're", "You're tired."], speak: "You are tired" },
              { cells: ['He', 'is', "He's", "He's at home."], speak: "He is at home" },
              { cells: ['She', 'is', "She's", "She's my sister."], speak: "She is my sister" },
              { cells: ['It', 'is', "It's", "It's cold."], speak: "It is cold" },
              { cells: ['We', 'are', "We're", "We're ready."], speak: "We are ready" },
              { cells: ['They', 'are', "They're", "They're friends."], speak: "They are friends" }
            ]
          },
          examples: [
            { en: 'I am Brazilian.', pt: 'Eu sou brasileiro.' },
            { en: 'I\'m tired.', pt: 'Estou cansado.' },
            { en: 'She is my sister.', pt: 'Ela é minha irmã.' },
            { en: 'He\'s at home.', pt: 'Ele está em casa.' },
            { en: 'We\'re ready.', pt: 'Estamos prontos.' },
            { en: 'They are friends.', pt: 'Eles são amigos.' }
          ],
          exercises: [
            'Qual forma do TO BE usar com "I" — am, is ou are?',
            'Complete: "She ___ my sister." (am/is/are?)',
            'Qual a contração de "we are"?',
            'Corrija: "He are tired." → ___',
            'Por que "I am" praticamente nunca aparece sem contração na fala?'
          ]
        },
        {
          id: 'ser-estar',
          title: 'Ser e estar usam a mesma palavra',
          explanation: 'Diferente do português, o inglês não separa "ser" (permanente) de "estar" (temporário). "I am tired" significa "estou cansado" agora. "I am Brazilian" significa "sou brasileiro" pra sempre. O contexto fala por si. Isso facilita pro brasileiro decorar, mas dificulta na hora de saber se a frase é sobre um estado momentâneo ou uma característica.',
          examples: [
            { en: 'I am happy today.', pt: 'Estou feliz hoje. (temporário)' },
            { en: 'I am Brazilian.', pt: 'Sou brasileiro. (permanente)' },
            { en: 'The coffee is hot.', pt: 'O café está quente.' },
            { en: 'The Earth is round.', pt: 'A Terra é redonda.' },
            { en: 'My phone is in the bag.', pt: 'Meu celular está na bolsa.' }
          ],
          exercises: [
            'Como traduzir "Estou cansado" e "Sou cansado" em inglês?',
            'Em "The coffee is hot" — significa "é quente" ou "está quente"?',
            'Como você diz "Meu celular está na bolsa"?',
            'Por que o inglês não diferencia ser e estar?',
            'Traduza: "Estou feliz hoje." (use am)'
          ]
        }
      ],
      curiosities: [
        'O TO BE é o verbo mais antigo do inglês — e o único que tem formas tão diferentes (am, is, are, was, were). Todos os outros verbos seguem padrões previsíveis.',
        '"I am" é tão pesado que ninguém fala assim no dia a dia. Sempre vira "I\'m". Só aparece completo em discursos solenes ou pra dar ênfase: "I AM telling the truth".',
        'O verbo TO BE também é o que carrega TODAS as outras estruturas do inglês: negativas (I am not), perguntas (Are you?), tempos contínuos (I am working).'
      ]
    },

    // ════════════════════════════════════════════════════════════
    // MÓDULO 2 — FALAR SOBRE VOCÊ E OS OUTROS
    // ════════════════════════════════════════════════════════════

    'soa2-pronomes-sujeito': {
      title: 'Pronomes sujeito — quem está fazendo',
      objective: 'Aprofunde o uso dos pronomes que abrem qualquer frase: I, you, he, she, it, we, they. A base de toda comunicação em inglês.',
      icon: 'PR',
      highlight: 'I • you • he • she • it • we • they',
      teachingPoints: [
        'Identificar quem é o sujeito da frase antes de escolher o pronome.',
        'Usar "it" sem traduzir — para coisas, animais, clima, situações.',
        'Lembrar que "you" serve tanto pra "você" quanto "vocês".',
        'Não esquecer o pronome — em inglês toda frase precisa de sujeito.'
      ],
      sections: [
        {
          id: 'sujeito-obrigatorio',
          title: 'Em inglês, sujeito não é opcional',
          explanation: 'No português você pode dizer "tá chovendo" e está claro quem é o sujeito (ninguém — é o clima). No inglês isso não funciona: precisa de "It is raining". Toda frase em inglês precisa de um pronome ou nome no começo. Esse é o erro mais comum do brasileiro iniciante: começar uma frase sem sujeito. "Is hot today" não funciona — tem que ser "It is hot today".',
          soundboard: {
            title: '🔊 Os 7 pronomes sujeito — clique para ouvir',
            items: [
              { word: 'I', pron: 'ai', speech: 'I' },
              { word: 'You', pron: 'iu', speech: 'You' },
              { word: 'He', pron: 'ri', speech: 'He' },
              { word: 'She', pron: 'chi', speech: 'She' },
              { word: 'It', pron: 'it', speech: 'It' },
              { word: 'We', pron: 'ui', speech: 'We' },
              { word: 'They', pron: 'dei', speech: 'They' }
            ]
          },
          examples: [
            { en: 'It is raining.', pt: 'Está chovendo.' },
            { en: 'It is 8 o\'clock.', pt: 'São 8 horas.' },
            { en: 'They speak Portuguese.', pt: 'Falam português.' },
            { en: 'We are tired.', pt: 'Estamos cansados.' },
            { en: 'She works here.', pt: 'Ela trabalha aqui.' }
          ],
          exercises: [
            'Corrija: "Is raining." → frase completa em inglês.',
            'Como traduzir "Tá quente hoje" em inglês?',
            'Por que precisamos do "It" em "It is 8 o\'clock"?',
            'Complete: "___ speak Portuguese." (eles)',
            'Qual o erro em "Is my friend"? Como corrigir?'
          ]
        },
        {
          id: 'it-impessoal',
          title: 'O "it" que não representa nada — clima, hora e situação',
          explanation: 'Em português, você diz "está chovendo" sem sujeito. Em inglês, isso não existe: toda frase precisa de sujeito. Quando não há uma pessoa ou coisa real sendo referenciada, o inglês usa "it" como sujeito vazio. Isso acontece com clima ("It\'s raining", "It\'s cold"), com horas ("It\'s 8 o\'clock", "It\'s Monday") e com distâncias ("It\'s far from here"). Este "it" não se refere a nada — é só uma exigência da gramática inglesa. É uma diferença fundamental entre os dois idiomas.',
          examples: [
            { en: 'It\'s raining outside.', pt: 'Está chovendo lá fora.' },
            { en: 'It\'s very hot today.', pt: 'Está muito quente hoje.' },
            { en: 'It\'s 3 o\'clock.', pt: 'São 3 horas.' },
            { en: 'It\'s Monday again.', pt: 'É segunda de novo.' },
            { en: 'It\'s far from here.', pt: 'É longe daqui.' },
            { en: 'It\'s my birthday!', pt: 'É meu aniversário!' }
          ],
          exercises: [
            'Como você diz "está frio" em inglês? (sem sujeito real)',
            'Complete: "___ Monday today." (que dia é)',
            'Por que "Is raining" está errado em inglês?',
            'Traduza: "São 10 horas." (use it)',
            'Em "It\'s far from here" — o "it" se refere a quê?'
          ]
        }
      ],
      curiosities: [
        'O "it" pra clima e horas é uma das marcas registradas do inglês — quase nenhuma outra língua europeia faz isso.',
        '"They" no singular (pra pessoas de gênero não-especificado) virou comum nos anos 2010 e hoje é gramaticamente aceito em qualquer contexto.'
      ]
    },

    'soa2-tobe-perg-neg': {
      title: 'TO BE em perguntas e negações',
      objective: 'Aprenda a inverter o TO BE pra fazer perguntas e a negá-lo pra dizer "não sou", "não está". Estrutura simples, ritmo rápido.',
      icon: 'Q?',
      highlight: 'Are you? • I am not • Isn\'t / Aren\'t',
      teachingPoints: [
        'Perguntar invertendo: "You are" vira "Are you?"',
        'Negar adicionando "not": "I am not", "She is not".',
        'Usar as contrações: isn\'t, aren\'t (mas NUNCA "amn\'t" — não existe).',
        'Distinguir "I\'m not" de "I am" em contexto enfático.'
      ],
      sections: [
        {
          id: 'inversao',
          title: 'Pergunta no TO BE: inverte e pronto',
          explanation: 'Pra transformar uma afirmação em pergunta com TO BE, basta inverter a ordem. "You are tired" vira "Are you tired?". "She is at home" vira "Is she at home?". Não precisa de "do" ou "does" — o próprio TO BE faz o trabalho de abrir a pergunta. Essa simplicidade é uma das vantagens do verbo.',
          soundboard: {
            title: '🔊 Perguntas com TO BE — ouça a entonação',
            items: [
              { word: 'Are you?', pron: 'ar IU?', speech: 'Are you?' },
              { word: 'Is she?', pron: 'iz CHI?', speech: 'Is she?' },
              { word: 'Are they?', pron: 'ar DEI?', speech: 'Are they?' },
              { word: 'Am I?', pron: 'em AI?', speech: 'Am I?' },
              { word: 'Are you ready?', pron: 'ar iu RÉ-di?', speech: 'Are you ready?' },
              { word: 'Is it cold?', pron: 'iz it KOULD?', speech: 'Is it cold?' }
            ]
          },
          examples: [
            { en: 'Are you Brazilian?', pt: 'Você é brasileiro?' },
            { en: 'Is she at home?', pt: 'Ela está em casa?' },
            { en: 'Are they ready?', pt: 'Eles estão prontos?' },
            { en: 'Am I late?', pt: 'Estou atrasado?' },
            { en: 'Is it cold outside?', pt: 'Está frio lá fora?' }
          ],
          exercises: [
            'Transforme em pergunta: "You are tired" → ___',
            'Como perguntar "Ela está em casa?" em inglês?',
            'Por que NÃO precisamos de "do" pra perguntar com TO BE?',
            'Complete a pergunta: "___ they ready?" (são/estão)',
            'Como perguntar "Estou atrasado?" usando am?'
          ]
        },
        {
          id: 'negativa',
          title: 'Negar com "not"',
          explanation: 'Pra negar com TO BE, coloque "not" depois do verbo. "I am" vira "I am not" (ou "I\'m not"). "She is" vira "She is not" (ou "she isn\'t"). "They are" vira "they aren\'t". Cuidado com a primeira pessoa: NÃO existe "amn\'t" em inglês padrão — sempre "I\'m not" ou "I am not".',
          soundboard: {
            title: '🔊 Negativas com TO BE — contrações naturais',
            items: [
              { word: "I'm not", pron: 'aim NOT', speech: "I'm not" },
              { word: "isn't", pron: 'IZ-ent', speech: "isn't" },
              { word: "aren't", pron: 'AR-ent', speech: "aren't" },
              { word: "She isn't here.", pron: 'chi IZ-ent rir', speech: "She isn't here" },
              { word: "They aren't ready.", pron: 'dei AR-ent RÉ-di', speech: "They aren't ready" },
              { word: "It isn't cold.", pron: 'it IZ-ent KOULD', speech: "It isn't cold" }
            ]
          },
          examples: [
            { en: 'I am not tired.', pt: 'Não estou cansado.' },
            { en: 'I\'m not Brazilian.', pt: 'Não sou brasileiro.' },
            { en: 'She isn\'t here.', pt: 'Ela não está aqui.' },
            { en: 'They aren\'t my friends.', pt: 'Eles não são meus amigos.' },
            { en: 'It isn\'t cold.', pt: 'Não está frio.' }
          ],
          exercises: [
            'Como negar "I am tired" em inglês?',
            'Existe "amn\'t" em inglês padrão? Por quê?',
            'Qual a contração de "she is not"?',
            'Traduza: "Eles não são meus amigos." (use aren\'t)',
            'Corrija: "I amn\'t Brazilian." → ___'
          ]
        }
      ],
      curiosities: [
        'O "amn\'t" existe em alguns dialetos da Irlanda e da Escócia — mas em inglês padrão soa estranho. Use "I\'m not" sempre.',
        'Em perguntas curtas de confirmação, "Aren\'t I?" é o que se usa no lugar de "amn\'t I?" — uma irregularidade aceita há séculos.'
      ]
    },

    'soa2-possessivos': {
      title: 'Possessivos básicos — my, your, his, her',
      objective: 'Aprenda a dizer "meu", "seu", "dele", "dela" em inglês sem trocar as formas. Os adjetivos possessivos mais usados do dia a dia.',
      icon: 'PR',
      highlight: 'my • your • his • her • our • their',
      teachingPoints: [
        'Saber que possessivo vem ANTES do objeto: "my bag", não "bag my".',
        'Não confundir his (dele) com he (ele) — sons parecidos, funções diferentes.',
        '"Its" é possessivo de "it" — para coisas, animais, ideias.',
        'Usar "their" pra grupos ou pessoas sem gênero específico.'
      ],
      sections: [
        {
          id: 'lista-uso',
          title: 'Os seis possessivos e como usar',
          explanation: 'Cada pronome sujeito tem seu possessivo correspondente: I → my, you → your, he → his, she → her, it → its, we → our, they → their. Eles SEMPRE vêm antes do objeto possuído. Importante: no inglês, o possessivo concorda com o DONO, não com o objeto. "Her car" — o carro pertence a ela, mesmo que "car" seja singular ou plural. Em português a gente concorda com o objeto ("seu carro" / "seus carros"), em inglês não muda.',
          table: {
            title: 'Possessivos (adjetivos) — antes do objeto',
            headers: ['Pronome', 'Possessivo', 'Exemplo'],
            rows: [
              { cells: ['I', 'my', 'my phone'], speak: 'my phone' },
              { cells: ['You', 'your', 'your idea'], speak: 'your idea' },
              { cells: ['He', 'his', 'his name'], speak: 'his name' },
              { cells: ['She', 'her', 'her car'], speak: 'her car' },
              { cells: ['It', 'its', 'its paw'], speak: 'its paw' },
              { cells: ['We', 'our', 'our team'], speak: 'our team' },
              { cells: ['They', 'their', 'their house'], speak: 'their house' }
            ]
          },
          examples: [
            { en: 'This is my phone.', pt: 'Esse é meu celular.' },
            { en: 'Your idea is great.', pt: 'Sua ideia é ótima.' },
            { en: 'His name is John.', pt: 'O nome dele é John.' },
            { en: 'Her car is new.', pt: 'O carro dela é novo.' },
            { en: 'Our team is winning.', pt: 'Nosso time está ganhando.' },
            { en: 'Their house is huge.', pt: 'A casa deles é enorme.' }
          ],
          exercises: [
            'Qual o possessivo correspondente a "she"?',
            'Como você diz "o nome dele é John"?',
            'Por que "her cars" não muda quando o objeto fica plural?',
            'Complete: "___ team is winning." (nosso)',
            'Qual a diferença entre "its" (possessivo) e "it\'s" (it is)?'
          ]
        }
      ],
      curiosities: [
        'No inglês falado, "her" e "his" se confundem facilmente. Por isso o inglês escrito é mais preciso — pra evitar mal-entendidos de gênero.',
        '"Its" (possessivo) e "it\'s" (it is) são duas das palavras mais confundidas até por nativos. Um teste: substitua por "it is" — se não fizer sentido, é "its".'
      ]
    },

    'soa2-this-that': {
      title: 'This, That, These, Those — apontando objetos',
      objective: 'Aprenda a apontar pra coisas em inglês com a distância e quantidade certas: perto/longe, um/vários.',
      icon: 'PR',
      highlight: 'this/that (singular) • these/those (plural)',
      teachingPoints: [
        'Distinguir o que está perto (this/these) do que está longe (that/those).',
        'Lembrar do plural: these (perto plural), those (longe plural).',
        'Usar como adjetivo ("this book") ou pronome ("this is mine").',
        'Não confundir "this" com "the" — duas funções diferentes.'
      ],
      sections: [
        {
          id: 'quatro-formas',
          title: 'Quatro palavras, duas dimensões',
          explanation: 'O inglês marca duas coisas com esses pronomes: distância (perto vs longe) e quantidade (um vs muitos). This = singular perto. That = singular longe. These = plural perto. Those = plural longe. Funciona tanto pra apontar fisicamente ("this chair, that car") quanto pra referir conceitos ("that idea, these problems"). Pode estar acompanhado do objeto ou aparecer sozinho como pronome.',
          soundboard: {
            title: '🔊 This, that, these, those — ouça a pronúncia',
            items: [
              { word: 'this', pron: 'dis (perto, 1)', speech: 'this' },
              { word: 'that', pron: 'dét (longe, 1)', speech: 'that' },
              { word: 'these', pron: 'diz (perto, +)', speech: 'these' },
              { word: 'those', pron: 'douz (longe, +)', speech: 'those' },
              { word: 'This is mine.', pron: 'dis iz MAIN', speech: 'This is mine' },
              { word: 'That car.', pron: 'dét KAR', speech: 'That car' },
              { word: 'These shoes.', pron: 'diz CHUZ', speech: 'These shoes' },
              { word: 'Those people.', pron: 'douz PÍ-pol', speech: 'Those people' }
            ]
          },
          table: {
            title: 'A matriz: distância × quantidade',
            headers: ['', 'Perto ◉', 'Longe ◌'],
            rows: [
              { cells: ['Singular', 'this', 'that'], speak: 'this, that' },
              { cells: ['Plural', 'these', 'those'], speak: 'these, those' }
            ]
          },
          examples: [
            { en: 'This is my book.', pt: 'Esse é meu livro.' },
            { en: 'That car is fast.', pt: 'Aquele carro é rápido.' },
            { en: 'These shoes are new.', pt: 'Esses sapatos são novos.' },
            { en: 'Those people are friends.', pt: 'Aquelas pessoas são amigos.' },
            { en: 'I like this song.', pt: 'Eu gosto dessa música.' },
            { en: 'What is that?', pt: 'O que é aquilo?' }
          ],
          exercises: [
            'Você aponta pra um livro perto de você. Use this ou that?',
            'Aponta pra vários sapatos do outro lado da loja. Use these ou those?',
            'Como você diz "Esses sapatos são novos"?',
            'Complete: "What is ___?" (apontando pra algo longe)',
            'Qual a diferença entre "this" e "the"?'
          ]
        }
      ],
      curiosities: [
        'No telefone, "This is John speaking" significa "É o John falando" — uma das poucas vezes que o inglês usa "this" pra apresentar a si mesmo.',
        'O "that" no fim da frase ("I know that") tem outra função — é uma conjunção que liga ideias, não um apontador.'
      ]
    },

    // ════════════════════════════════════════════════════════════
    // MÓDULO 3 — AÇÕES DO DIA A DIA
    // ════════════════════════════════════════════════════════════

    'soa3-present-afirm': {
      title: 'Present simple — afirmativa',
      objective: 'Aprenda a contar suas ações cotidianas em inglês: I work, I study, I eat. O tempo verbal mais usado do idioma.',
      icon: 'VB',
      highlight: 'I work • You eat • We study',
      teachingPoints: [
        'Usar o verbo na forma base com I, you, we, they.',
        'Reconhecer que esse tempo descreve hábitos, rotinas e verdades gerais.',
        'Diferenciar do present continuous (que é pra ações em andamento).',
        'Não traduzir "do" automaticamente — em frases afirmativas ele desaparece.'
      ],
      sections: [
        {
          id: 'forma-base',
          title: 'Verbo + sujeito + complemento',
          explanation: 'O present simple em inglês é o mais limpo de todos: você pega o sujeito (I, you, we, they) e o verbo na forma base (work, eat, study, live). Não tem terminação especial. "I work in São Paulo". "We study English". "They eat lunch at noon". Esse tempo serve pra falar de coisas que acontecem habitualmente, não agora especificamente. Pra "estou trabalhando agora", usa-se outro tempo (present continuous).',
          examples: [
            { en: 'I work from home.', pt: 'Eu trabalho de casa.' },
            { en: 'You speak English well.', pt: 'Você fala bem inglês.' },
            { en: 'We live in Brazil.', pt: 'Nós moramos no Brasil.' },
            { en: 'They eat rice every day.', pt: 'Eles comem arroz todo dia.' },
            { en: 'I drink coffee in the morning.', pt: 'Eu bebo café de manhã.' }
          ],
          exercises: [
            'Como você diz "Eu trabalho de casa" em inglês?',
            'Qual a diferença entre "I work" (present simple) e "I am working"?',
            'Complete: "We ___ English every week." (estudamos)',
            'Traduza: "Eles comem arroz todo dia."',
            'Quando você usa o present simple — pra ações em andamento ou pra hábitos?'
          ]
        },
        {
          id: 'pratica-completa',
          title: 'Consolidando: sujeito, verbo, hábito',
          explanation: 'Agora você tem o kit completo do present simple: sujeito + verbo na forma base (ou +s na terceira pessoa) + complemento. Use este tempo para falar de rotinas, hábitos e verdades gerais. A pergunta de controle é: isso acontece regularmente? Se sim, present simple é o seu tempo.',
          examples: [
            { en: 'I drink coffee every morning.', pt: 'Eu bebo café toda manhã.' },
            { en: 'She reads before bed.', pt: 'Ela lê antes de dormir.' },
            { en: 'We go to the gym three times a week.', pt: 'Nós vamos à academia três vezes por semana.' },
            { en: 'The sun sets in the west.', pt: 'O sol se põe a oeste. (verdade geral)' }
          ],
          exercises: [
            'Crie uma frase sobre seu hábito matinal usando present simple.',
            'Qual destes describe uma rotina? "I am eating now" ou "I eat at noon"?',
            'Monte: [ela] + [estuda] + [inglês] + [todo dia] em inglês.',
            'Por que "The Earth orbits the sun" usa present simple e não outro tempo?',
            'Complete: "They ___ (live) in Rio and ___ (work) downtown."'
          ]
        }
      ],
      curiosities: [
        'O present simple é o tempo verbal mais frequente do inglês — aparece em ~40% de todos os enunciados falados.',
        'Em alguns dialetos do inglês britânico, "I work" pode soar quase como "I worrrk" com o R sonoro. No americano, esse R fica ainda mais retroflexo.'
      ]
    },

    'soa3-third-person-s': {
      title: 'Terceira pessoa pega o S',
      objective: 'Memorize a regra mais quebrada pelo brasileiro: ele/ela/isso (he/she/it) sempre adiciona um S no verbo. He works, she studies, it rains.',
      icon: 'VB',
      highlight: 'he workS • she liveS • it rainS',
      teachingPoints: [
        'Adicionar -s ao verbo quando o sujeito é he, she ou it.',
        'Trocar -y por -ies (study → studies) quando termina em consoante + y.',
        'Adicionar -es em verbos terminados em -ch, -sh, -ss, -o, -x (watch → watches).',
        'Nunca esquecer essa regra — é o erro #1 dos brasileiros.'
      ],
      sections: [
        {
          id: 'regra-do-s',
          title: 'A regra do S — sem exceções',
          explanation: 'Quando o sujeito é he, she ou it, o verbo SEMPRE pega um S no final no present simple. "I work" → "He works". "You eat" → "She eats". É a única alteração que o verbo sofre nesse tempo. Sem essa regra, sua frase fica gramaticalmente errada — e é o detalhe mais comum que denuncia o estudante brasileiro. Há pequenas variações na ortografia: study vira studies (y vira ies), watch vira watches (adiciona es).',
          table: {
            title: 'Regras ortográficas do -s na terceira pessoa',
            headers: ['Terminação', 'Regra', 'Verbo base', 'He/She/It'],
            rows: [
              { cells: ['Padrão', '+ s', 'work', 'works'], speak: 'works' },
              { cells: ['-ch / -sh / -ss', '+ es', 'watch', 'watches'], speak: 'watches' },
              { cells: ['-o', '+ es', 'go', 'goes'], speak: 'goes' },
              { cells: ['-x', '+ es', 'fix', 'fixes'], speak: 'fixes' },
              { cells: ['consoante + y', 'y → ies', 'study', 'studies'], speak: 'studies' },
              { cells: ['irregular', 'have → has', 'have', 'has'], speak: 'has' }
            ]
          },
          examples: [
            { en: 'He works at a bank.', pt: 'Ele trabalha em um banco.' },
            { en: 'She lives in Rio.', pt: 'Ela mora no Rio.' },
            { en: 'It rains a lot here.', pt: 'Chove muito aqui.' },
            { en: 'My brother studies Spanish.', pt: 'Meu irmão estuda espanhol.' },
            { en: 'She watches TV at night.', pt: 'Ela assiste TV à noite.' },
            { en: 'He goes to the gym.', pt: 'Ele vai à academia.' }
          ],
          exercises: [
            'Corrija: "He work at a bank." → ___',
            'O verbo "study" como fica na terceira pessoa? (he/she/it)',
            'Como fica o verbo "watch" com "she"?',
            'Por que dizemos "He goes" e não "He gos"?',
            'Qual o erro mais comum do brasileiro com present simple?'
          ]
        }
      ],
      curiosities: [
        'Linguistas calculam que o S da terceira pessoa é um resíduo de quando o inglês tinha conjugações completas como o português. Sobrou só esse pra atormentar estudantes.',
        '"Have" vira "has" na terceira pessoa — uma das únicas formas irregulares: he has, she has, it has.'
      ]
    },

    'soa3-present-continuous': {
      title: 'Present continuous — o que está acontecendo agora',
      objective: 'Aprenda a descrever ações em andamento — o que está rolando neste exato momento. Diferente do present simple (hábitos), o continuous é para o "agora".',
      icon: 'VB',
      highlight: 'I am working • She is cooking • They are studying',
      teachingPoints: [
        'Montar a estrutura: sujeito + to be + verbo -ing.',
        'Distinguir present continuous (agora) de present simple (hábito).',
        'Formar o -ing: regras de ortografia (swim → swimming, make → making).',
        'Perguntar e negar no continuous: "Are you working?" / "I\'m not working".'
      ],
      sections: [
        {
          id: 'estrutura-continuous',
          title: 'A fórmula: TO BE + verbo -ing',
          explanation: 'O present continuous usa to be (am/is/are) + o verbo com -ing no final. "I am working" = estou trabalhando agora. "She is cooking" = ela está cozinhando. "They are studying" = eles estão estudando. Este tempo é sempre sobre o momento presente — o que está acontecendo enquanto você fala. Regras do -ing: verbos terminados em -e muda para -ing sem o e (make → making). Verbos CVC curtos dobram a consoante (swim → swimming, run → running).',
          soundboard: {
            title: '🔊 Verbos com -ing — ouça e compare com a forma base',
            items: [
              { word: 'work → working', pron: 'UORK-ing', speech: 'working' },
              { word: 'study → studying', pron: 'STÁ-di-ing', speech: 'studying' },
              { word: 'make → making', pron: 'MEI-king', speech: 'making' },
              { word: 'swim → swimming', pron: 'SUÍM-ing', speech: 'swimming' },
              { word: 'run → running', pron: 'RÁN-ing', speech: 'running' },
              { word: 'I\'m working.', pron: 'aim UORK-ing', speech: "I'm working right now" },
              { word: 'She\'s cooking.', pron: "chiz KÚK-ing", speech: "She's cooking" },
              { word: 'They\'re studying.', pron: 'der STÁ-di-ing', speech: "They're studying" }
            ]
          },
          table: {
            title: 'Estrutura do present continuous',
            headers: ['Sujeito', 'To Be', 'Verbo -ing', 'Tradução'],
            rows: [
              { cells: ['I', 'am', 'working', 'Estou trabalhando'], speak: 'I am working' },
              { cells: ['You', 'are', 'studying', 'Você está estudando'], speak: 'You are studying' },
              { cells: ['He / She', 'is', 'cooking', 'Ele/ela está cozinhando'], speak: 'She is cooking' },
              { cells: ['We / They', 'are', 'sleeping', 'Nós/eles estão dormindo'], speak: 'They are sleeping' }
            ]
          },
          examples: [
            { en: 'I\'m watching a movie right now.', pt: 'Estou assistindo um filme agora.' },
            { en: 'She\'s cooking dinner.', pt: 'Ela está cozinhando o jantar.' },
            { en: 'They\'re playing soccer.', pt: 'Eles estão jogando futebol.' },
            { en: 'He\'s not working today.', pt: 'Ele não está trabalhando hoje.' },
            { en: 'Are you listening to me?', pt: 'Você está me ouvindo?' }
          ],
          exercises: [
            'Como você diz "Estou estudando inglês agora" em inglês?',
            'Complete: "She ___ ___ (cook) dinner."',
            'Qual é o -ing de "swim"? Por que a consoante dobra?',
            'Corrija: "I am work at home now."',
            'Quando usar "I work" vs "I am working"?'
          ]
        },
        {
          id: 'simple-vs-continuous',
          title: 'Simples × continuous: hábito vs agora',
          explanation: 'Esta é a distinção mais importante: present simple é para hábitos e rotinas ("I work from home" — é minha rotina). Present continuous é para o que está acontecendo agora ("I am working from home today" — está acontecendo neste momento). Palavras de pista: "every day", "always", "usually" → simple. "right now", "at the moment", "today", "currently" → continuous. A pergunta é: isso acontece habitualmente ou está rolando agora?',
          examples: [
            { en: 'I drink coffee every morning. (hábito)', pt: 'Eu bebo café toda manhã. (rotina)' },
            { en: 'I\'m drinking coffee right now. (agora)', pt: 'Estou bebendo café agora. (este momento)' },
            { en: 'She works at a hospital. (hábito)', pt: 'Ela trabalha num hospital. (emprego)' },
            { en: 'She\'s working late tonight. (agora)', pt: 'Ela está trabalhando até tarde hoje. (situação atual)' }
          ],
          exercises: [
            'Qual é o tempo certo? "Every day I ___ (walk) to work." (simple ou continuous?)',
            'Complete: "Look! She ___ ___ (dance)!" (agora)',
            'Corrija: "I am working every day." (troque para o tempo certo)',
            'Qual palavra-pista indica continuous? "right now", "always" ou "every day"?',
            'Crie uma frase sobre hábito (simple) e uma sobre o que está fazendo agora (continuous).'
          ]
        }
      ],
      curiosities: [
        'Em inglês, alguns verbos raramente aparecem no continuous: "know", "like", "love", "believe". Não dizemos "I am knowing" — apenas "I know". São os chamados "stative verbs" (verbos de estado).',
        'O present continuous também serve para falar de planos futuros confirmados: "I\'m meeting her tomorrow" = Vou encontrá-la amanhã (já está marcado). Duas funções, um tempo só.'
      ]
    },

    'soa3-frequencia': {
      title: 'Frequência — sempre, às vezes, nunca',
      objective: 'Aprenda a dizer com que frequência você faz cada coisa: always, often, sometimes, never. E onde colocar essas palavras na frase.',
      icon: 'NO',
      highlight: 'always • usually • often • sometimes • never',
      teachingPoints: [
        'Aprender 5 advérbios de frequência ordenados de "sempre" a "nunca".',
        'Colocar o advérbio ANTES do verbo principal (mas DEPOIS do TO BE).',
        'Usar "never" sem outra negação ("I never eat" — não "I don\'t never").',
        'Variar entre "always" e "every day" pra não soar repetitivo.'
      ],
      sections: [
        {
          id: 'escala',
          title: 'A escala dos advérbios',
          explanation: 'Os principais advérbios de frequência seguem uma escala: always (100% — sempre), usually (80% — geralmente), often (60% — frequentemente), sometimes (40% — às vezes), rarely (10% — raramente), never (0% — nunca). A posição padrão é ANTES do verbo principal: "I always drink coffee", "She never eats meat". "Sometimes" tem uma exceção aceita: pode aparecer no início da frase para dar ênfase — "Sometimes I work late" — mas a posição antes do verbo ("I sometimes work late") é a forma mais segura. Com TO BE, o advérbio vem depois: "She is always late". "Never" já carrega a negação — não combine com "don\'t".',
          soundboard: {
            title: '🔊 Advérbios de frequência — do 100% ao 0%',
            items: [
              { word: 'always', pron: 'OL-ueiz (100%)', speech: 'always' },
              { word: 'usually', pron: 'IU-ju-ê-li (80%)', speech: 'usually' },
              { word: 'often', pron: 'Ó-fen (60%)', speech: 'often' },
              { word: 'sometimes', pron: 'SAM-taimz (40%)', speech: 'sometimes' },
              { word: 'rarely', pron: 'RER-li (10%)', speech: 'rarely' },
              { word: 'never', pron: 'NÉ-ver (0%)', speech: 'never' },
              { word: 'I always drink coffee.', pron: 'ai OL-ueiz drink KÓ-fi', speech: 'I always drink coffee' },
              { word: 'She never eats meat.', pron: 'chi NÉ-ver its MIT', speech: 'She never eats meat' }
            ]
          },
          table: {
            title: 'Escala de frequência',
            headers: ['Frequência', 'Advérbio', 'Tradução', 'Exemplo'],
            rows: [
              { cells: ['100%', 'always', 'sempre', 'I always drink coffee.'], speak: 'I always drink coffee' },
              { cells: ['80%', 'usually', 'geralmente', 'She usually wakes up at 7.'], speak: 'She usually wakes up at seven' },
              { cells: ['60%', 'often', 'frequentemente', 'We often go to the beach.'], speak: 'We often go to the beach' },
              { cells: ['40%', 'sometimes', 'às vezes', 'Sometimes I work late.'], speak: 'Sometimes I work late' },
              { cells: ['10%', 'rarely', 'raramente', 'They rarely eat fast food.'], speak: 'They rarely eat fast food' },
              { cells: ['0%', 'never', 'nunca', 'He is never late.'], speak: 'He is never late' }
            ]
          },
          examples: [
            { en: 'I always brush my teeth.', pt: 'Eu sempre escovo os dentes.' },
            { en: 'She usually wakes up at 7.', pt: 'Ela geralmente acorda às 7.' },
            { en: 'We often go to the beach.', pt: 'Nós frequentemente vamos à praia.' },
            { en: 'Sometimes I work late.', pt: 'Às vezes eu trabalho até tarde.' },
            { en: 'He is never late.', pt: 'Ele nunca se atrasa.' },
            { en: 'They rarely eat fast food.', pt: 'Eles raramente comem fast food.' }
          ],
          exercises: [
            'Onde colocar "always" em "I drink coffee"?',
            'Por que NÃO se diz "I don\'t never eat meat"?',
            'Qual a diferença entre "always", "usually" e "sometimes"?',
            'Onde fica "always" com TO BE: "She always is late" ou "She is always late"?',
            'Traduza: "Ela nunca se atrasa." (use never)'
          ]
        }
      ],
      curiosities: [
        '"Sometimes" pode começar a frase ("Sometimes I work late") — uma das poucas exceções à regra de posição.',
        'No inglês informal, "I always do that" soa mais natural que "I do that always" — ordem fixa, mesmo soando estranho em português.'
      ]
    },

    // ════════════════════════════════════════════════════════════
    // MÓDULO 4 — ONDE, QUANDO, COMO
    // ════════════════════════════════════════════════════════════

    'soa4-wh-questions': {
      title: 'WH questions — perguntas abertas',
      objective: 'Aprenda a fazer as perguntas que puxam informação real: what, where, who, when, why, how. As seis que destravam qualquer conversa.',
      icon: 'Q?',
      highlight: 'What • Where • Who • When • How',
      teachingPoints: [
        'Identificar qual WH usar pra cada tipo de informação (lugar, tempo, pessoa, modo).',
        'Estruturar a pergunta: WH + auxiliar + sujeito + verbo.',
        'Usar "how" em combinações úteis: how much, how many, how often.',
        'Não esquecer o auxiliar do/does — sem ele a pergunta não soa correta.'
      ],
      sections: [
        {
          id: 'cinco-wh',
          title: 'Seis palavras, seis respostas',
          explanation: 'Cada WH puxa um tipo de informação. "What" — coisa/atividade. "Where" — lugar. "Who" — pessoa. "When" — tempo. "How" — modo/jeito. A estrutura é sempre a mesma: WH + auxiliar (do/does/did) + sujeito + verbo. "Where do you live?" — "Onde você mora?". "What does she do?" — "O que ela faz?". Sem o auxiliar a frase soa errada ou esquisita.',
          soundboard: {
            title: '🔊 As 6 palavras WH — clique para ouvir',
            items: [
              { word: 'What', pron: 'uot (o quê)', speech: 'What' },
              { word: 'Where', pron: 'uér (onde)', speech: 'Where' },
              { word: 'When', pron: 'uén (quando)', speech: 'When' },
              { word: 'Who', pron: 'ru (quem)', speech: 'Who' },
              { word: 'Why', pron: 'uai (por quê)', speech: 'Why' },
              { word: 'How', pron: 'rau (como)', speech: 'How' },
              { word: 'What is your name?', pron: 'uot iz ior NEIM?', speech: 'What is your name?' },
              { word: 'Where do you live?', pron: 'uér du iu LIV?', speech: 'Where do you live?' },
              { word: 'How do you say this?', pron: 'rau du iu SEI dis?', speech: 'How do you say this?' }
            ]
          },
          table: {
            title: 'As 6 perguntas WH essenciais',
            headers: ['WH', 'Sobre', 'Pergunta exemplo'],
            rows: [
              { cells: ['What', 'coisa / atividade', 'What is your name?'], speak: 'What is your name?' },
              { cells: ['Where', 'lugar', 'Where do you work?'], speak: 'Where do you work?' },
              { cells: ['When', 'tempo', 'When does the bus arrive?'], speak: 'When does the bus arrive?' },
              { cells: ['Who', 'pessoa', 'Who is that man?'], speak: 'Who is that man?' },
              { cells: ['Why', 'razão', 'Why are you late?'], speak: 'Why are you late?' },
              { cells: ['How', 'modo / jeito', 'How do you say this?'], speak: 'How do you say this?' }
            ]
          },
          examples: [
            { en: 'What is your name?', pt: 'Qual é o seu nome?' },
            { en: 'Where do you work?', pt: 'Onde você trabalha?' },
            { en: 'Who is that man?', pt: 'Quem é aquele homem?' },
            { en: 'When does the bus arrive?', pt: 'Quando o ônibus chega?' },
            { en: 'How do you say this in English?', pt: 'Como se diz isso em inglês?' },
            { en: 'How much does it cost?', pt: 'Quanto custa?' }
          ],
          exercises: [
            'Qual WH usar pra perguntar sobre um lugar?',
            'Como perguntar "Onde você trabalha?" em inglês?',
            'Qual a diferença entre "What" e "Which"?',
            'Como perguntar "Quanto custa?" em inglês?',
            'Por que precisa do "do" em "Where do you live?"'
          ]
        }
      ],
      curiosities: [
        'Por que se chama "WH question"? Porque quase todas começam com as letras W-H: what, where, when, who, why. A exceção é "how" — uma sobrevivente do inglês antigo.',
        'Em telefone, "Who is it?" e "Who is calling?" são as duas perguntas universais. Decorar essas duas resolve metade dos contatos por telefone.'
      ]
    },

    'soa4-prep-tempo': {
      title: 'Preposições de tempo — at, on, in',
      objective: 'Aprenda a lógica das três preposições que organizam o tempo em inglês: at pra horas, on pra dias, in pra meses e anos.',
      icon: 'IN',
      highlight: 'at 5pm • on Monday • in July',
      teachingPoints: [
        'Usar AT pra horas específicas (at 5pm, at noon, at midnight).',
        'Usar ON pra dias da semana e datas (on Monday, on May 5th).',
        'Usar IN pra meses, estações, anos, séculos (in July, in 2026).',
        'Memorizar exceções importantes: at night, on the weekend, in the morning.'
      ],
      sections: [
        {
          id: 'logica-tempo',
          title: 'A regra dos três níveis',
          explanation: 'Pense assim: AT é o ponto preciso (uma hora exata), ON é a superfície de um dia (um dia inteiro), IN é o recipiente que contém tudo (meses, anos, estações). "Meet me at 6pm" — momento específico. "Meet me on Friday" — em algum momento do dia. "I\'ll visit in July" — em algum dia do mês. Funciona pra ~95% dos casos. As exceções (at night, in the morning) precisam ser memorizadas separadamente.',
          table: {
            title: 'Preposições de tempo — a lógica dos 3 níveis',
            headers: ['Preposição', 'Quando usar', 'Exemplos'],
            rows: [
              { cells: ['AT', 'horas específicas, noon, midnight, night', 'at 6pm · at noon · at night'], speak: 'at six pm, at noon, at night' },
              { cells: ['ON', 'dias da semana, datas, fins de semana (US)', 'on Monday · on May 5th · on the weekend'], speak: 'on Monday, on May fifth' },
              { cells: ['IN', 'meses, anos, estações, séculos, partes do dia', 'in May · in 2026 · in the morning'], speak: 'in May, in twenty twenty six, in the morning' }
            ]
          },
          examples: [
            { en: 'The meeting is at 3pm.', pt: 'A reunião é às 3 da tarde.' },
            { en: 'I work on Monday.', pt: 'Eu trabalho na segunda.' },
            { en: 'My birthday is in May.', pt: 'Meu aniversário é em maio.' },
            { en: 'See you at noon.', pt: 'Te vejo ao meio-dia.' },
            { en: 'I exercise in the morning.', pt: 'Eu me exercito de manhã.' },
            { en: 'She arrives on the 10th.', pt: 'Ela chega no dia 10.' }
          ],
          exercises: [
            'Qual preposição usar antes de "3pm" — at, on ou in?',
            'Complete: "My birthday is ___ May." (at/on/in?)',
            'E pra "Monday"? "I work ___ Monday."',
            'Por que dizemos "at night" mas "in the morning"?',
            'Traduza: "A reunião é segunda às 3 da tarde."'
          ]
        }
      ],
      curiosities: [
        'No inglês americano se diz "on the weekend", no britânico "at the weekend". Mesma ideia, preposições diferentes — ponto que causa confusão até entre nativos.',
        '"At night" é a única exceção pro padrão "in the morning / in the afternoon / in the evening". Ninguém sabe por que — é só decorar.'
      ]
    },

    'soa4-rotina': {
      title: 'Vocabulário de rotina e lugares',
      objective: 'Construa o repertório de palavras que sustentam qualquer conversa sobre o dia a dia: home, work, gym, school + os verbos da rotina.',
      icon: 'PR',
      highlight: 'home • work • gym • wake up • go to',
      teachingPoints: [
        'Aprender os 10 lugares mais usados em rotinas (home, work, school, gym, store...).',
        'Combinar lugares com verbos básicos (go to work, stay home, leave the gym).',
        'Reconhecer "home" como exceção — não leva "to" (go home, não "go to home").',
        'Construir uma rotina narrada em 5 frases.'
      ],
      sections: [
        {
          id: 'lugares-verbos',
          title: 'Os lugares e os verbos que andam com eles',
          explanation: 'Pra descrever uma rotina, você precisa de dois conjuntos: lugares (home, work, school, gym, supermarket, restaurant, bus stop) e verbos de movimento/permanência (go to, leave, arrive at, stay, come back). A combinação faz sentido: "I go to work at 8" — "Eu vou pro trabalho às 8". "I leave the gym at 7pm" — "Eu saio da academia às 7". Uma irregularidade importante: "home" não leva preposição: diz-se "go home", "stay home" — nunca "go to home".',
          soundboard: {
            title: '🔊 Verbos de rotina — ouça as expressões completas',
            items: [
              { word: 'go to work', pron: 'gou tu UORK', speech: 'go to work' },
              { word: 'go home', pron: 'gou ROUM', speech: 'go home' },
              { word: 'stay home', pron: 'stei ROUM', speech: 'stay home' },
              { word: 'leave the gym', pron: 'liv dê DJIM', speech: 'leave the gym' },
              { word: 'arrive at the office', pron: 'ê-RAIV ét di Ó-fis', speech: 'arrive at the office' },
              { word: 'come back', pron: 'kam BÉK', speech: 'come back' },
              { word: 'wake up', pron: 'ueik AP', speech: 'wake up' },
              { word: 'I go to work at 8.', pron: 'ai gou tu uork ét EIT', speech: 'I go to work at eight' }
            ]
          },
          examples: [
            { en: 'I go to work at 8am.', pt: 'Eu vou pro trabalho às 8.' },
            { en: 'She goes home at 6.', pt: 'Ela vai pra casa às 6.' },
            { en: 'We stay home on Sundays.', pt: 'Ficamos em casa aos domingos.' },
            { en: 'He leaves the gym tired.', pt: 'Ele sai da academia cansado.' },
            { en: 'I arrive at the office at 9.', pt: 'Eu chego no escritório às 9.' },
            { en: 'They come back at night.', pt: 'Eles voltam à noite.' }
          ],
          exercises: [
            'Corrija: "I go to home." → ___',
            'Como você diz "Vou pra academia" em inglês?',
            'Qual a diferença entre "go to" e "arrive at"?',
            'Traduza: "Ficamos em casa aos domingos."',
            'Por que "home" não leva "to" antes?'
          ]
        },
        {
          id: 'descrevendo-rotina',
          title: 'Descrevendo um dia completo em inglês',
          explanation: 'Com os verbos de rotina e o present simple, você já consegue narrar um dia inteiro. A chave é encadear as ações com conectores de tempo: "first" (primeiro), "then" (depois), "after that" (depois disso), "finally" (por fim). Isso transforma frases soltas numa sequência natural de conversa.',
          examples: [
            { en: 'First, I wake up and make coffee.', pt: 'Primeiro, eu acordo e faço café.' },
            { en: 'Then I go to work.', pt: 'Depois vou trabalhar.' },
            { en: 'After that, I have lunch at noon.', pt: 'Depois disso, almoço ao meio-dia.' },
            { en: 'Finally, I go to bed at 11.', pt: 'Por fim, vou dormir às 11.' }
          ],
          exercises: [
            'Use "first", "then" e "finally" para descrever 3 ações da sua manhã.',
            'Como você diz "Primeiro acordo, depois tomo banho" em inglês?',
            'Complete: "After work, I ___ (come) home and ___ (have) dinner."',
            'Por que "wake up" e "get up" não são a mesma coisa?',
            'Monte a sua rotina em 4 frases usando os verbos da aula.'
          ]
        }
      ],
      curiosities: [
        '"Home" sem preposição é uma das peculiaridades do inglês — herança do anglo-saxão antigo, onde "ham" significava lar e tinha movimento embutido.',
        '"Work" pode ser verbo ou substantivo. "I work" (verbo) e "I go to work" (substantivo) usam a mesma palavra — uma economia típica do inglês.'
      ]
    },

    // ════════════════════════════════════════════════════════════
    // MÓDULO 5 — FALAR SOBRE ONTEM
    // ════════════════════════════════════════════════════════════

    'soa5-past-regular': {
      title: 'Past simple — verbos regulares (-ed)',
      objective: 'Aprenda a contar o que aconteceu ontem com a regra mais simples do passado: adicione -ed no verbo. Worked, studied, played.',
      icon: 'PA',
      highlight: 'worked • studied • played',
      teachingPoints: [
        'Adicionar -ed pra formar o passado dos verbos regulares.',
        'Variações ortográficas: -y vira -ied (study → studied), dobra consoante final (stop → stopped).',
        'Pronunciar o -ed de três formas (id, t, d) conforme o som anterior.',
        'Usar com expressões de tempo: yesterday, last week, two days ago.'
      ],
      sections: [
        {
          id: 'regra-ed',
          title: 'A regra principal: verbo + ED',
          explanation: 'Pra falar do passado em inglês com verbos regulares, basta adicionar -ed no final. "I work" → "I worked" (eu trabalhei). "She plays" → "She played" (ela jogou). "We talk" → "We talked" (nós conversamos). Simples assim. A regra cobre talvez 70% dos verbos do inglês. Os outros 30% são irregulares (próxima aula). Mudanças ortográficas: verbos em -y trocam o y por -ied (study → studied), e verbos curtos com vogal + consoante dobram a consoante (stop → stopped).',
          soundboard: {
            title: '🔊 A pronúncia do -ED: três sons da mesma letra',
            items: [
              { word: 'worked → /t/', pron: 'UORKT', speech: 'worked' },
              { word: 'watched → /t/', pron: 'UOTCHT', speech: 'watched' },
              { word: 'played → /d/', pron: 'PLEID', speech: 'played' },
              { word: 'studied → /d/', pron: 'STÁ-did', speech: 'studied' },
              { word: 'wanted → /id/', pron: 'UONT-id', speech: 'wanted' },
              { word: 'needed → /id/', pron: 'NÍD-id', speech: 'needed' },
              { word: 'I worked yesterday.', pron: 'ai UORKT IÉS-ter-dei', speech: 'I worked yesterday' },
              { word: 'She studied all night.', pron: 'chi STÁ-did ol NAIT', speech: 'She studied all night' }
            ]
          },
          examples: [
            { en: 'I worked yesterday.', pt: 'Eu trabalhei ontem.' },
            { en: 'She studied for the test.', pt: 'Ela estudou pra prova.' },
            { en: 'They played football.', pt: 'Eles jogaram futebol.' },
            { en: 'We talked for hours.', pt: 'Conversamos por horas.' },
            { en: 'He stopped at the red light.', pt: 'Ele parou no sinal vermelho.' }
          ],
          exercises: [
            'Como fica "work" no passado?',
            'Por que "study" vira "studied" e não "studyed"?',
            'Por que "stop" vira "stopped" com dois P?',
            'Traduza: "Eles jogaram futebol ontem."',
            'O -ed em "wanted" e "worked" soa igual? Por quê?'
          ]
        }
      ],
      curiosities: [
        'A pronúncia do -ed muda dependendo do som final do verbo: "worked" soa "uorkt", "played" soa "pleid", "wanted" soa "uontid". Três sons da mesma terminação escrita.',
        'No inglês antigo, o passado era feito mudando a vogal do verbo (sing/sang). O -ed é uma invenção mais recente pra simplificar.'
      ]
    },

    'soa5-past-perguntas': {
      title: 'Perguntas no passado — Did you?',
      objective: 'Aprenda a perguntar sobre o passado com "did" — o auxiliar que abre qualquer pergunta sobre o que aconteceu.',
      icon: 'Q?',
      highlight: 'Did you go? • Did she eat? • What did they say?',
      teachingPoints: [
        'Usar "did" no início pra qualquer pergunta no passado.',
        'Manter o verbo principal NA FORMA BASE (did you go, não did you went).',
        'Combinar com WH: What did you do? Where did she go?',
        'Responder com "Yes, I did" / "No, I didn\'t".'
      ],
      sections: [
        {
          id: 'did-base',
          title: 'O auxiliar "did" abre a pergunta',
          explanation: 'Pra perguntar sobre o passado, use "did" + sujeito + verbo na forma base. Atenção: o verbo NÃO fica no passado — fica na forma base. "Did you work yesterday?" (não "did you worked"). "Did she go to school?" (não "did she went"). Isso é difícil pro brasileiro porque parece redundante — mas o "did" já marca o passado, e o verbo fica neutro. Funciona pra todos os sujeitos: did I, did you, did he, did she, did we, did they.',
          examples: [
            { en: 'Did you sleep well?', pt: 'Você dormiu bem?' },
            { en: 'Did she call you?', pt: 'Ela te ligou?' },
            { en: 'Did they arrive?', pt: 'Eles chegaram?' },
            { en: 'What did you do yesterday?', pt: 'O que você fez ontem?' },
            { en: 'Where did he go?', pt: 'Onde ele foi?' }
          ],
          exercises: [
            'Corrija: "Did you went to school?" → ___',
            'Como perguntar "Ela te ligou?" em inglês?',
            'Por que o verbo fica na forma base depois de "did"?',
            'Como combinar "what" com "did" pra perguntar?',
            'Qual a resposta curta pra "Did you sleep well?" (positiva)'
          ]
        }
      ],
      curiosities: [
        'Sem o "did", a pergunta soa quebrada. "You went?" só funciona em contextos de surpresa ou intimidade — não como pergunta padrão.',
        'A resposta curta "Yes, I did" / "No, I didn\'t" é o equivalente do nosso "Sim" / "Não" expandido — soa mais natural que apenas "Yes" / "No".'
      ]
    },

    'soa5-past-negativa': {
      title: 'Negações no passado — didn\'t',
      objective: 'Diga o que NÃO aconteceu ontem usando "didn\'t" — a forma seca de negar no passado. Curta, prática, universal.',
      icon: 'NO',
      highlight: 'I didn\'t go • She didn\'t see',
      teachingPoints: [
        'Formar a negativa do passado com "didn\'t" + verbo na forma base.',
        'Não usar duas negações: "I didn\'t go" (não "I didn\'t went").',
        'Usar didn\'t como negativa universal pra todos os sujeitos (I, you, he, she, we, they).',
        'Distinguir didn\'t (passado) de don\'t/doesn\'t (presente).'
      ],
      sections: [
        {
          id: 'didnt',
          title: 'Didn\'t é o universal do passado',
          explanation: 'Pra negar no passado, basta usar "didn\'t" + verbo base. Funciona pra qualquer sujeito — não muda nada. "I didn\'t see her", "She didn\'t come", "They didn\'t arrive". Sempre o mesmo "didn\'t" e o verbo na forma base. Mesmo princípio das perguntas: o "did" carrega o passado, o verbo fica neutro. Isso simplifica muito — não precisa pensar em forma irregular nem em S de terceira pessoa.',
          examples: [
            { en: 'I didn\'t sleep well.', pt: 'Eu não dormi bem.' },
            { en: 'She didn\'t see the email.', pt: 'Ela não viu o e-mail.' },
            { en: 'We didn\'t go to the party.', pt: 'Não fomos à festa.' },
            { en: 'They didn\'t finish the work.', pt: 'Eles não terminaram o trabalho.' },
            { en: 'He didn\'t say a word.', pt: 'Ele não disse uma palavra.' }
          ],
          exercises: [
            'Corrija: "I didn\'t went to the party." → ___',
            'Como negar "I slept well" no passado?',
            'Qual a diferença entre "didn\'t" e "doesn\'t"?',
            'Traduza: "Ela não viu o e-mail."',
            'Por que "didn\'t" não muda na terceira pessoa (ele/ela)?'
          ]
        }
      ],
      curiosities: [
        'A contração "didn\'t" é tão comum que a forma completa "did not" praticamente só aparece em discursos formais ou pra dar ênfase: "I DID NOT do that!"',
        'Em alguns dialetos do sul dos EUA, "didn\'t" vira "ain\'t" no passado coloquial: "I ain\'t seen him" — não é gramaticalmente padrão, mas é comum.'
      ]
    },

    // ════════════════════════════════════════════════════════════
    // MÓDULO 6 — QUERER, PODER, GOSTAR
    // ════════════════════════════════════════════════════════════

    'soa6-can': {
      title: 'CAN — saber e poder fazer',
      objective: 'Use "can" pra dizer o que você sabe fazer, pode fazer ou pra pedir permissão. Um dos verbos mais úteis do inglês cotidiano.',
      icon: 'VB',
      highlight: 'I can swim • Can you help me?',
      teachingPoints: [
        'Usar "can" pra habilidade ("I can swim") e permissão ("Can I sit here?").',
        'Manter o verbo principal na forma base depois de "can".',
        'Formar a negativa com "can\'t" (sem -s na terceira pessoa).',
        'Diferenciar can (presente) de could (passado/educado).'
      ],
      sections: [
        {
          id: 'habilidade-permissao',
          title: 'Duas funções, uma palavra',
          explanation: 'O "can" tem duas funções principais. (1) Habilidade — "I can speak English" (eu sei falar inglês). (2) Permissão ou possibilidade — "Can I open the window?" (posso abrir a janela?). Em ambos os casos, o verbo depois fica na forma base — nada de adicionar -s ou -ed. Pra negar, usa-se "can\'t" (cannot). Pra perguntar, inverte: "Can you...?". Não confunda com "could" — esse é o passado ou versão mais educada de "can".',
          soundboard: {
            title: '🔊 CAN e CAN\'T — a diferença que muda tudo',
            items: [
              { word: 'can', pron: 'kén (fraco)', speech: 'can' },
              { word: "can't", pron: 'KÉANT (forte)', speech: "can't" },
              { word: 'I can swim.', pron: 'ai kén SUÍM', speech: 'I can swim' },
              { word: "I can't swim.", pron: 'ai KÉANT suím', speech: "I can't swim" },
              { word: 'Can you help me?', pron: 'kén iu RÉLP mi?', speech: 'Can you help me?' },
              { word: 'She can speak French.', pron: 'chi kén SPIK french', speech: 'She can speak French' },
              { word: "Can I sit here?", pron: 'kén ai SIT rir?', speech: 'Can I sit here?' },
              { word: "I can't come tomorrow.", pron: 'ai KÉANT kam tê-MÓ-rou', speech: "I can't come tomorrow" }
            ]
          },
          examples: [
            { en: 'I can swim.', pt: 'Eu sei nadar.' },
            { en: 'She can speak three languages.', pt: 'Ela fala três línguas.' },
            { en: 'Can you help me?', pt: 'Você pode me ajudar?' },
            { en: 'I can\'t come tomorrow.', pt: 'Não posso vir amanhã.' },
            { en: 'Can I open the window?', pt: 'Posso abrir a janela?' }
          ],
          exercises: [
            'Corrija: "She can speaks English." → ___',
            'Como pedir permissão pra abrir a janela em inglês?',
            'Qual a negação de "can"?',
            'Qual a diferença entre "can" e "could"?',
            'Traduza: "Eu não posso vir amanhã."'
          ]
        }
      ],
      curiosities: [
        'A negativa "cannot" pode aparecer junta ou separada (can not), mas a forma junta é mais comum em inglês padrão.',
        '"Could" é o passado de "can", mas no presente é mais educado: "Could you help me?" soa mais polido que "Can you help me?".'
      ]
    },

    'soa6-like-ing': {
      title: 'LIKE / LOVE / HATE + ING',
      objective: 'Aprenda a falar do que você gosta ou não gosta de FAZER — sempre com -ing no verbo que vem depois. I like running, I hate waiting.',
      icon: 'IG',
      highlight: 'I like reading • I love cooking • I hate waiting',
      teachingPoints: [
        'Saber que depois de like, love, hate, enjoy — o próximo verbo SEMPRE vai com -ing.',
        'Variar a intensidade: like (gosta) < love (adora) < be crazy about (apaixonado).',
        'Não traduzir literalmente: "I love cooking" não é "amo cozinhando", é "adoro cozinhar".',
        'Negar com don\'t/doesn\'t: "I don\'t like running".'
      ],
      sections: [
        {
          id: 'verbo-mais-ing',
          title: 'A regra do -ing depois desses verbos',
          explanation: 'Em inglês, quando você diz que gosta, ama, odeia ou aprecia uma ATIVIDADE, o verbo dessa atividade tem que vir com -ing. "I like read" não funciona — tem que ser "I like reading". "She loves dance" não — é "She loves dancing". Esse -ing transforma o verbo em uma espécie de substantivo (o ato de ler, o ato de dançar). É uma das regras mais quebradas pelo brasileiro iniciante, mas é simples: gostou de uma atividade? Põe -ing no verbo da atividade.',
          examples: [
            { en: 'I like reading.', pt: 'Eu gosto de ler.' },
            { en: 'She loves cooking.', pt: 'Ela adora cozinhar.' },
            { en: 'They hate waiting.', pt: 'Eles odeiam esperar.' },
            { en: 'I enjoy listening to music.', pt: 'Eu curto escutar música.' },
            { en: 'He doesn\'t like running.', pt: 'Ele não gosta de correr.' }
          ],
          exercises: [
            'Corrija: "I like read." → ___',
            'Como você diz "Ela adora cozinhar"?',
            'Por que "I love you" não pede -ing?',
            'Traduza: "Eles odeiam esperar."',
            'Quais verbos pedem -ing depois deles (cite 3)?'
          ]
        },
        {
          id: 'gostar-querer-precisar',
          title: 'Like, love, want, need — quando usar -ing e quando usar to',
          explanation: 'Aqui está o mapa: verbos de sentimento (like, love, enjoy, hate) pedem -ing depois deles. Verbos de intenção (want, need, decide, plan) pedem "to + base" depois. A única sobreposição é "like" — que aceita as duas formas sem mudar muito o sentido. Na prática: se você está descrevendo o que gosta de fazer, use -ing; se está dizendo o que pretende fazer, use "to + base".',
          examples: [
            { en: 'I love swimming in the ocean.', pt: 'Adoro nadar no oceano. (sentimento + -ing)' },
            { en: 'I want to learn guitar.', pt: 'Quero aprender violão. (intenção + to)' },
            { en: 'She hates waking up early.', pt: 'Ela odeia acordar cedo.' },
            { en: 'He needs to study more.', pt: 'Ele precisa estudar mais.' }
          ],
          exercises: [
            'Complete: "I enjoy ___ (cook) on weekends."',
            'Complete: "She wants ___ (travel) to Japan."',
            'Qual erro tem aqui? "I love to dancing." — corrija.',
            'Crie uma frase com "hate" e uma com "need" sobre estudar inglês.',
            'Qual frase é correta? "I like swim" ou "I like swimming"?'
          ]
        }
      ],
      curiosities: [
        'Você pode usar tanto "I like to run" quanto "I like running" — ambos são corretos. Mas com love, hate e enjoy, o -ing é muito mais comum.',
        '"I love you" não pede -ing porque "you" não é uma atividade — é uma pessoa. A regra do -ing vale só pra atividades.'
      ]
    },

    'soa6-want-to': {
      title: 'WANT + TO — expressar vontade',
      objective: 'Diga o que você quer fazer em inglês: "I want to learn", "I want to travel". A estrutura mais direta pra expressar intenção e desejo.',
      icon: 'VB',
      highlight: 'I want to • I don\'t want to',
      teachingPoints: [
        'Combinar want + to + verbo base ("I want to go", "I want to learn").',
        'Negar com don\'t want to ("I don\'t want to wait").',
        'Perguntar invertendo: "Do you want to leave?"',
        'Usar a forma contraída comum na fala: "wanna" (gonna for going to).'
      ],
      sections: [
        {
          id: 'want-to-base',
          title: 'Want + TO + verbo',
          explanation: 'A estrutura é fixa: WANT + TO + verbo na forma base. "I want to learn English" (quero aprender inglês). "She wants to go home" (ela quer ir pra casa — note o S de terceira pessoa em "wants"). O verbo depois de "to" sempre fica na forma base — não recebe -ing nem -ed. Pra negar, coloque don\'t/doesn\'t antes de want: "I don\'t want to wait". Na fala, "want to" frequentemente vira "wanna" — "I wanna go", "I wanna learn".',
          examples: [
            { en: 'I want to learn English.', pt: 'Quero aprender inglês.' },
            { en: 'She wants to travel.', pt: 'Ela quer viajar.' },
            { en: 'They want to eat pizza.', pt: 'Eles querem comer pizza.' },
            { en: 'I don\'t want to wait.', pt: 'Não quero esperar.' },
            { en: 'Do you want to come?', pt: 'Você quer vir?' }
          ],
          exercises: [
            'Corrija: "I want learn English." → ___',
            'Como você diz "Ela quer viajar"? (note o S em wants)',
            'O que significa "wanna" na fala americana?',
            'Como negar "I want to wait"?',
            'Como perguntar "Você quer vir?" em inglês?'
          ]
        },
        {
          id: 'planos-e-intencoes',
          title: 'Falar de planos e intenções com naturalidade',
          explanation: 'Combinando want, need, decide, try e plan, você tem um kit para falar de praticamente qualquer intenção ou projeto. Em conversa, encadeie: "I want to learn English, so I need to practice every day and I plan to take a course." Esses verbos funcionam juntos como âncoras de planos de curto e longo prazo.',
          examples: [
            { en: 'I want to improve my English.', pt: 'Quero melhorar meu inglês.' },
            { en: 'I need to practice speaking.', pt: 'Preciso praticar a fala.' },
            { en: 'I decided to take a course.', pt: 'Decidi fazer um curso.' },
            { en: 'I\'m trying to learn new words every day.', pt: 'Estou tentando aprender palavras novas todo dia.' }
          ],
          exercises: [
            'Una as frases: "I want / learn English / so / I need / practice every day."',
            'Complete: "She decided ___ (quit) her job and ___ (travel)."',
            'Crie 3 frases sobre seus planos usando want, need e plan.',
            'Qual erro? "I want learn guitar." — como corrigir?',
            'Monte: "Estou tentando acordar mais cedo todo dia" em inglês.'
          ]
        }
      ],
      curiosities: [
        'O "wanna" é a contração mais comum na fala americana — aparece em ~80% dos diálogos informais. Em contextos formais, sempre use "want to".',
        '"I want" sozinho soa muito direto — quase grosseiro. Pra educação extra, use "I would like" ou "I\'d like" no lugar.'
      ]
    }
  };

  // ========== PRONUNCIAÇÃO ESCRITA ==========
  // Fonética aproximada usando sons do português.
  // MAIÚSCULAS = sílaba tônica.
  // "d"/"t" = th | "ai" = I | "u" = oo/w | "ei" = ay | "ou" = long-o
  // "ch" = sh | "dj" = j | "tch" = ch

  const EXAMPLE_PRON = {
    // --- pronomes: quem faz a ação ---
    'I work every day.':                       'ai UORK Év-ri dei',
    'You speak very fast.':                    'iu SPIK vé-ri fest',
    'He lives in Rio.':                        'ri LIVZ in RÍ-ou',
    'She loves coffee.':                       'chi LAVZ KÓ-fi',
    'It is very cold today.':                  'it iz VÉ-ri kould tê-DEI',
    'We are a team.':                          'ui ar ê TIM',
    'They eat lunch together.':                'dei it LANTCH tê-GÉ-der',
    // --- pronomes: quem recebe a ação ---
    'She called me yesterday.':                'chi KOLD mi IÉS-ter-dei',
    'Can you help us?':                        'kén iu RÉLP as?',
    'I saw him at the store.':                 'ai so RIM ét dê STOR',
    'He gave her a gift.':                     'ri GHEIV rer ê gift',
    'They invited them to the party.':         'dei in-VAIT-id dém tu dê PAR-ti',
    'This is between you and me.':             'dis iz bi-TUÍN iu énd MI',
    'Tell him the truth.':                     'tél rim dê TRUTS',
    // --- pronomes: de quem é ---
    'This is my phone.':                       'dis iz mai FOUN',
    'This phone is mine.':                     'dis foun iz MAIN',
    'Her jacket is on the chair.':             'rer DJÉ-kit iz on dê TCHER',
    'That jacket is hers.':                    'dét djé-kit iz RERS',
    'Our house is small, but theirs is huge.': 'aur RAUS iz smol bat DERS iz riuDJ',
    "Is this your coffee? — Yes, it's mine.":  'iz dis ior KÓ-fi? iés, its MAIN',
    'The dog hurt its paw.':                   'dê dog RERT its po',
    // --- perguntas: sim ou não ---
    'Do you like coffee? — Yes, I do.':        'du iu LAIK kó-fi? iés, ai DU',
    "Does she work here? — No, she doesn't.":  'daz chi UORK rir? nou, chi DAZ-ent',
    'Do they have a dog?':                     'du dei RÉV ê dog?',
    'Did you sleep well?':                     'did iu SLIP uél?',
    'Did he call you?':                        'did ri KOL iu?',
    'Does it hurt?':                           'daz it RERT?',
    'Do we need an umbrella today?':           'du ui NID én am-BRÉ-lê tê-DEI?',
    // --- perguntas: palavras de pergunta ---
    'What do you want for dinner?':            'uot du iu UONT for DÍ-ner?',
    'Where does she live?':                    'uér daz chi LIV?',
    'When did they arrive?':                   'uén did dei ê-RAIV?',
    'Why are you laughing?':                   'uai ar iu LÉF-ing?',
    'How do you say this in English?':         'rau du iu SEI dis in ÍNG-glitch?',
    'Who called you? (quem ligou = sujeito, sem "do")':            'ru KOLD iu?',
    'Who did you call? (você ligou pra quem = objeto, com "did")': 'ru did iu KOL?',
    'How many people were there?':             'rau MÉ-ni PÍ-pol uor DER?',
    // --- perguntas: tag questions ---
    "It's cold today, isn't it?":              'its kold tê-DEI, IZ-ent it?',
    "You like pizza, don't you?":              'iu laik PÍT-zê, DONT iu?',
    "She can drive, can't she?":               'chi kén DRAIV, KÉANT chi?',
    "They didn't call, did they?":             'dei DID-ent kol, did DEI?',
    "You're from Brazil, aren't you?":         'ior from brê-ZIL, AR-ent iu?',
    "He won't come, will he?":                 'ri UONT kam, uil RI?',
    // --- negativa: ser e estar ---
    "I'm not ready yet.":                      'aim not RÉ-di iét',
    "She isn't at home.":                      'chi IZ-ent ét roum',
    "They aren't from here.":                  'dei AR-ent from rir',
    "It isn't raining.":                       'it IZ-ent REIN-ing',
    "We aren't hungry.":                       'ui AR-ent RANG-gri',
    "He's not my boss.":                       'riz not mai BOS',
    "That's not what I meant.":                'déts not uot ai MENT',
    // --- negativa: ações no presente ---
    "I don't eat meat.":                       'ai DONT it MIT',
    "She doesn't like loud music.":            'chi DAZ-ent laik laud MIÚ-zik',
    "They don't have a car.":                  'dei DONT rév ê kar',
    "He doesn't work on weekends.":            'ri DAZ-ent uork on UIK-endz',
    "We don't need help.":                     'ui DONT nid RÉLP',
    "It doesn't make sense.":                  'it DAZ-ent meik SENS',
    "You don't have to go.":                   'iu DONT rév tu GOU',
    // --- negativa: passado ---
    "I didn't sleep well.":                    'ai DID-ent slip UÉL',
    "He didn't call me back.":                 'ri DID-ent kol mi BÉK',
    "We didn't go to the party.":              'ui DID-ent gou tu dê PAR-ti',
    "She didn't finish the report.":           'chi DID-ent FÍ-nitch dê ri-PORT',
    "They didn't know about it.":              'dei DID-ent nou ê-BAUT it',
    "I didn't mean to hurt you.":              'ai DID-ent min tu RERT iu',
    "It didn't work out.":                     'it DID-ent uork AUT',
    // --- negativa: never / nobody / nothing ---
    'I never drink soda.':                     'ai NÉ-ver drink SÓU-dê',
    'Nobody called while you were out.':       'NOU-bo-di kold uail iu uor AUT',
    "There's nothing in the fridge.":          'ders NA-ting in dê FRIDJ',
    'I have nothing to say.':                  'ai rév NA-ting tu SEI',
    'She never complains.':                    'chi NÉ-ver kom-PLEINZ',
    'No one knew the answer.':                 'nou UAN niu di ÉN-ser',
    // --- passado: regular ---
    'I walked to work yesterday.':             'ai UOKT tu uork IÉS-ter-dei',
    'She cooked dinner last night.':           'chi KUKT DÍ-ner lest NAIT',
    'They played football on Saturday.':       'dei pleid FUT-bol on SÉ-ter-dei',
    'He called me this morning.':              'ri kold mi dis MOR-ning',
    'We watched a movie together.':            'ui UOTCHT ê MÚ-vi tê-GÉ-der',
    'She studied all night.':                  'chi STÁ-did ol NAIT',
    'It stopped raining around noon.':         'it STOPT REIN-ing ê-RAUND nun',
    // --- passado: irregulares ---
    'I went to the mall. (go → went)':         'ai UENT tu dê MOL',
    'She bought a new phone. (buy → bought)':  'chi BOT ê niu FOUN',
    'He saw her at the gym. (see → saw)':      'ri SO rer ét dê DJIM',
    'We ate pizza for lunch. (eat → ate)':     'ui EIT PÍT-zê for LANTCH',
    'They came home late. (come → came)':      'dei KEIM roum LEIT',
    'I told you! (tell → told)':               'ai TOULD iu!',
    // --- passado: estava acontecendo ---
    'I was sleeping when the alarm went off.':            'ai uoz SLÍ-ping uén di ê-LARM uent OF',
    'She was cooking when he arrived.':                   'chi uoz KÚK-ing uén ri ê-RAIVD',
    'They were playing outside when it started to rain.': 'dei uor PLEI-ing aut-SAID uén it STAR-tid tu rein',
    'I was watching TV at 9pm.':                          'ai uoz UOTCH-ing ti-VI ét nain pi-EM',
    'What were you doing when I called?':                 'uot uor iu DÚ-ing uén ai KOLD?',
    'We were having dinner when the power went out.':     'ui uor RÉV-ing DÍ-ner uén dê PAU-er uent AUT',
    // --- futuro: will ---
    "I'll call you later. (decidi agora)":     'ail KOL iu LEI-ter',
    "Don't worry, I'll help you.":             'dont UÓ-ri, ail RÉLP iu',
    'I think it will be cold tomorrow.':       'ai tink it uil bi KOULD tê-MÓ-rou',
    "She won't like this idea.":               'chi UONT laik dis ai-DÍ-ê',
    'Will you marry me?':                      'uil iu MÉ-ri mi?',
    "I'll have the chicken, please.":          'ail rév dê TCHÍ-ken, PLIZ',
    "He'll probably be late again.":           'ril PRÓ-ba-bli bi leit ê-GUEN',
    // --- futuro: going to ---
    "I'm going to study tonight.":                    'aim GÓU-ing tu STÁ-di tê-NAIT',
    "She's going to start a new job next month.":     'chiz GÓU-ing tu start ê niu djob nékst MANTCH',
    "We're going to move to a bigger apartment.":     'uir GÓU-ing tu muv tu ê BÍ-ger ê-PART-ment',
    "Look at those clouds — it's going to rain!":     'luk ét douz klaudz, its GÓU-ing tu REIN!',
    'Are you going to tell him the truth?':            'ar iu GÓU-ing tu tél rim dê TRUTS?',
    "He's not going to like this.":                   'riz not GÓU-ing tu LAIK dis',
    "They're going to get married in December.":      'der GÓU-ing tu guét MÉ-rid in di-SEM-ber',
    // --- futuro: compromissos marcados ---
    "I'm flying to New York next Tuesday.":           'aim FLAI-ing tu niu IORK nékst TIUZ-dei',
    "She's having lunch with her boss tomorrow.":     'chiz RÉV-ing LANTCH uit rer bos tê-MÓ-rou',
    "We're starting the new project on Monday.":      'uir STAR-ting dê niu PRÓ-djekt on MAN-dei',
    'Are you doing anything tonight?':                'ar iu DÚ-ing ÉNI-ting tê-NAIT?',
    "They're getting married in June.":               'der GÉT-ing MÉ-rid in DJUN',
    // --- gerúndio: o que é -ing ---
    'Swimming is great exercise.':             'SUÍM-ing iz greit ÉK-ser-saiz',
    'I love cooking for friends.':             'ai lav KÚK-ing for frendz',
    'Smoking is not allowed here.':            'SMÓK-ing iz not ê-LAUD rir',
    'She is good at singing.':                 'chi iz gud ét SÍN-ging',
    "He's thinking about moving abroad.":      'riz TÍN-king ê-BAUT MÚV-ing ê-BROOD',
    'Before leaving, check your bag.':         'bi-FOR LÍV-ing, tchék ior BÉG',
    // --- gerúndio: verbos que pedem -ing ---
    'I enjoy running in the morning.':         'ai en-DJÓI RAN-ing in dê MOR-ning',
    'He finished reading the book.':           'ri FÍ-nitcht RÍD-ing dê buk',
    'Avoid eating too much sugar.':            'ê-VOID ÍT-ing tu mátch CHÚ-ger',
    "She keeps talking about her trip.":       'chi kips TOK-ing ê-BAUT rer trip',
    'Do you mind waiting a moment?':           'du iu MAIND UEIT-ing ê MÓU-ment?',
    'I miss living in Rio.':                   'ai mis LÍV-ing in RÍ-ou',
    "I can't stand waiting in line.":          'ai kéant stend UEIT-ing in LAIN',
    // --- gerúndio: verbos que pedem to ---
    'I want to learn English.':                'ai UONT tu lern ÍNG-glitch',
    'She decided to quit her job.':            'chi di-SAI-did tu KUÍT rer djob',
    'He promised to call back.':               'ri PRÓ-mist tu kol BÉK',
    'They refused to sign the contract.':      'dei ri-FIUZD tu sain dê KON-trékt',
    "I can't afford to travel right now.":     'ai kéant ê-FORD tu TRÉ-vel rait NAU',
    'Remember to lock the door.':              'ri-MÉM-ber tu lok dê DOR',
    'She managed to finish on time.':          'chi MÉ-nedjd tu FÍ-nitch on TAIM',
    // --- gerúndio: mudança de significado ---
    'She stopped smoking. (parou de fumar)':                        'chi STOPT SMÓK-ing',
    'She stopped to smoke. (parou para acender um cigarro)':        'chi stopt tu SMOUK',
    'I remember locking the door. (lembro que fiz isso)':           'ai ri-MÉM-ber LÓK-ing dê dor',
    'Remember to lock the door. (não esqueça de fazer)':            'ri-MÉM-ber tu LOK dê DOR',
    'Try adding salt — maybe it improves. (experimente)':           'trai ÉD-ing solt, MÉI-bi it im-PRUVZ',
    'I tried to open it, but it was stuck. (tentei com esforço)':   'ai traid tu ÓU-pen it, bat it uoz STAK',
    // --- preposições: lugar ---
    "I live in Brazil. / She's in the kitchen.":     'ai liv in brê-ZIL / chiz in dê KÍ-tchin',
    'The cup is on the table.':                      'dê kap iz on dê TEI-bel',
    "There's a fly on the wall.":                    'ders ê flai on dê UOL',
    "I'm at the airport.":                           'aim ét di ÉR-port',
    "She's at work / at school / at the doctor's.":  'chiz ét UORK / ét SKUL / ét dê DOK-terz',
    "He's on the bus / on the train / on the plane.":'riz on dê BAS / on dê TREIN / on dê PLEIN',
    'Meet me at the corner of the street.':          'mit mi ét dê KOR-ner ov dê STRIT',
    // --- preposições: tempo ---
    'I was born in 1995.':                           'ai uoz born in nain-TIN-nain-ti-FAIV',
    'The meeting is on Friday.':                     'dê MÍT-ing iz on FRAI-dei',
    'She called at 7pm.':                            'chi kold ét SÉ-ven pi-EM',
    'We always go out on weekends.':                 'ui OL-ueiz gou aut on UIK-endz',
    "It's cold in winter here.":                     'its kold in UÍN-ter rir',
    'I study in the morning and work in the afternoon.': 'ai STÁ-di in dê MOR-ning énd uork in di éf-ter-NUN',
    'See you at noon! / at midnight!':               'si iu ét NUN! / ét MID-nait!',
    // --- preposições: movimento ---
    "I'm going to the gym.":                         'aim GÓU-ing tu dê DJIM',
    "She's from São Paulo.":                         'chiz from SAUM PÁU-lou',
    'He walked into the office.':                    'ri uokt ÍN-tu di Ó-fis',
    'The cat jumped out of the box.':                'dê két DJAMPT aut ov dê BOKS',
    'She commutes from Campinas to São Paulo.':      'chi kê-MIUTS from KAM-pi-naz tu saum PÁU-lou',
    'Come to me.':                                   'kam tu MI',
    // --- verbos: to be ---
    "I'm 28 years old.":                             'aim TUÉN-ti-eit iers OLD',
    "She's a nurse.":                                'chiz ê NERS',
    'Are you tired? — Yes, I am.':                   'ar iu TAIRD? iés, ai EM',
    "It's 3pm.":                                     'its TRI pi-EM',
    'We were at home last night.':                   'ui uor ét roum lest NAIT',
    "He's not feeling well.":                        'riz not FÍL-ing UÉL',
    'They were surprised by the news.':              'dei uor ser-PRAIZD bai dê NIUZ',
    // --- verbos: can / must / should ---
    'I can speak three languages.':                  'ai kén SPIK tri LÉNG-uê-djiz',
    'Can I open the window?':                        'kén ai ÓU-pen dê UÍN-dou?',
    'You must show your ID here.':                   'iu mast TCHOU ior ai-DI rir',
    'You should drink more water.':                  'iu TCHUD drink mor UÓ-ter',
    'She might be late.':                            'chi MAIT bi LEIT',
    'Could you repeat that, please?':                'kud iu ri-PIT DÉT, pliz?',
    "You don't have to come if you don't want to.":  'iu dont rév tu KAM if iu dont UONT tu',
    // --- verbos: phrasal verbs ---
    "Wake up! It's 8am! (acordar)":                        'UEIK AP! its eit ei-EM!',
    'I give up — this puzzle is impossible. (desistir)':    'ai GUIV AP, dis PÁ-zel iz im-PÓ-si-bel',
    'Can you look after my dog this weekend? (cuidar)':     'kén iu LUK ÉF-ter mai dog dis UIK-end?',
    "I'm looking for my keys. (procurar)":                  'aim LUK-ing for mai KIZ',
    'Look it up on Google. (pesquisar)':                    'luk it AP on GÚ-gel',
    'Turn off the lights before you leave. (desligar)':     'tern OF dê LAITS bi-FOR iu LIV',
    'She turned down the job offer. (recusar)':             'chi ternd DAUN dê djob Ó-fer',
    'He showed up two hours late. (aparecer)':              'ri TCHOUD AP tu AUERS leit',
    "Let's figure this out together. (resolver/descobrir)": 'lets FÍ-guer dis AUT tê-GÉ-der',
  };

  // ========== PEDAGOGICAL DATA STRUCTURES ==========
  // 5-layer system: Anchor → Table → Glossary → Exercises → Test

  const ANCHOR_DIALOGS = {
    pronomes: {
      dialogue: 'I see that ___1___ are going to the park. Can you come with ___2___?',
      blanks: [
        { answer: 'you', hint: 'Quem vai ao parque? Sujeito antes do verbo = você.' },
        { answer: 'me', hint: 'Depois de preposição "with": "come with _____".' }
      ]
    },
    perguntas: {
      dialogue: '___1___ you like coffee? Yes, I ___2___.',
      blanks: [
        { answer: 'Do', hint: 'Para montar a pergunta com "you", precisamos de "Do" ou "Does"?', options: ['Do', 'Does', 'Did', 'Is'] },
        { answer: 'do', hint: 'Resposta curta positiva com "I": "Yes, I ___"', options: ['do', 'does', 'did', "don't"] }
      ]
    },
    negativa: {
      dialogue: 'She ___1___ eat meat. They ___2___ happy.',
      blanks: [
        { answer: "doesn't", hint: 'Negar ação de "she" no presente: don\'t ou doesn\'t?', options: ["doesn't", "don't", "isn't", "wasn't"] },
        { answer: "aren't", hint: 'Negar estado com "they" usando to be: isn\'t ou aren\'t?', options: ["aren't", "isn't", "don't", "weren't"] }
      ]
    },
    passado: {
      dialogue: 'Yesterday I ___1___ to the store. She ___2___ there.',
      blanks: [
        { answer: 'went', hint: 'Passado de "go" (irregular): "go" → "_____"', options: ['went', 'goed', 'go', 'gone'] },
        { answer: "wasn't", hint: 'Negar "she was": forma contraída negativa.', options: ["wasn't", "weren't", "didn't", "isn't"] }
      ]
    },
    preposicoes: {
      dialogue: 'I live ___1___ Brazil. My meeting is ___2___ Monday.',
      blanks: [
        { answer: 'in', hint: 'País = dentro de → in, on ou at?', options: ['in', 'on', 'at', 'to'] },
        { answer: 'on', hint: 'Dia da semana = superfície → in, on ou at?', options: ['on', 'in', 'at', 'by'] }
      ]
    },
    verbos: {
      dialogue: 'She ___1___ a teacher. I ___2___ drive a car.',
      blanks: [
        { answer: 'is', hint: 'Conjugação de "to be" com "she": am, is ou are?', options: ['is', 'am', 'are', 'be'] },
        { answer: 'can', hint: 'Habilidade/possibilidade: qual modal usar?', options: ['can', 'must', 'should', 'will'] }
      ]
    },
    'soa1-alfabeto': {
      dialogue: 'The letter ___1___ sounds like "ei". ___2___ is pronounced "double-you".',
      blanks: [
        { answer: 'A', hint: 'Qual letra do alfabeto tem o som "ei"?', options: ['A', 'E', 'I', 'H'] },
        { answer: 'W', hint: 'Qual letra tem o nome incomum "double-you"?', options: ['W', 'V', 'U', 'Y'] }
      ]
    },
    'soa1-numeros': {
      dialogue: 'I have ___1___ brothers. My sister is ___2___ years old.',
      blanks: [
        { answer: 'two', hint: 'Como escrever o número 2 em inglês?', options: ['two', 'twelve', 'twenty', 'ten'] },
        { answer: 'fifteen', hint: 'Como escrever 15 em inglês? (atenção: teen ou ty?)', options: ['fifteen', 'fifty', 'fiveteen', 'fourteen'] }
      ]
    },
    'soa1-cumprimentos': {
      dialogue: '___1___ morning! How ___2___ you?',
      blanks: [
        { answer: 'Good', hint: 'Saudação pela manhã em inglês: "Good ___"', options: ['Good', 'Nice', 'Fine', 'Great'] },
        { answer: 'are', hint: 'Pergunta de cortesia: "How ___ you?" — qual forma do to be?', options: ['are', 'is', 'am', 'do'] }
      ]
    },
    'soa1-tobe-afirm': {
      dialogue: 'I ___1___ Brazilian. My friends ___2___ from São Paulo.',
      blanks: [
        { answer: 'am', hint: 'To be com "I": am, is ou are?', options: ['am', 'is', 'are', 'be'] },
        { answer: 'are', hint: 'To be com "my friends" (plural): am, is ou are?', options: ['are', 'is', 'am', 'were'] }
      ]
    },
    'soa2-pronomes-sujeito': {
      dialogue: '___1___ is my boss. ___2___ work together every day.',
      blanks: [
        { answer: 'He', hint: 'Pronome sujeito masculino singular: He, Him ou His?', options: ['He', 'Him', 'His', 'She'] },
        { answer: 'We', hint: 'Pronome sujeito para "eu e outros": I, We ou Us?', options: ['We', 'Us', 'They', 'I'] }
      ]
    },
    'soa2-tobe-perg-neg': {
      dialogue: '___1___ she from Brazil? No, she ___2___.',
      blanks: [
        { answer: 'Is', hint: 'Para perguntar com "she" usando to be, qual palavra vem primeiro?', options: ['Is', 'Are', 'Does', 'Do'] },
        { answer: "isn't", hint: 'Resposta negativa curta com "she": "No, she ___"', options: ["isn't", "aren't", "don't", "doesn't"] }
      ]
    },
    'soa2-possessivos': {
      dialogue: 'This is ___1___ phone. That car is ___2___.',
      blanks: [
        { answer: 'my', hint: 'Possessivo de "eu" antes de substantivo: my, mine ou me?', options: ['my', 'mine', 'me', 'I'] },
        { answer: 'hers', hint: 'Possessivo de "ela" sem substantivo depois: her ou hers?', options: ['hers', 'her', 'she', 'his'] }
      ]
    },
    'soa2-this-that': {
      dialogue: '___1___ is my bag (aqui). ___2___ are your keys (ali).',
      blanks: [
        { answer: 'This', hint: 'Coisa perto, singular: this ou these?', options: ['This', 'These', 'That', 'Those'] },
        { answer: 'Those', hint: 'Coisas longe, plural: that ou those?', options: ['Those', 'That', 'These', 'This'] }
      ]
    },
    'soa3-present-afirm': {
      dialogue: 'I ___1___ English every day. She ___2___ at 7am.',
      blanks: [
        { answer: 'study', hint: 'Com "I" no present simple, o verbo leva -s ou fica na base?', options: ['study', 'studies', 'studied', 'studying'] },
        { answer: 'wakes up', hint: 'Com "she", adiciona -s: "wake up" vira "_____"', options: ['wakes up', 'wake up', 'woke up', 'waking up'] }
      ]
    },
    'soa3-third-person-s': {
      dialogue: 'He ___1___ to music. She ___2___ French.',
      blanks: [
        { answer: 'listens', hint: 'listen + s/es/ies? "listen" termina em consoante comum.', options: ['listens', 'listen', 'listenes', 'listening'] },
        { answer: 'teaches', hint: '"teach" termina em -ch: teach + ___?', options: ['teaches', 'teachs', 'teach', 'teached'] }
      ]
    },
    'soa3-frequencia': {
      dialogue: 'She ___1___ wakes up early. I ___2___ forget my keys.',
      blanks: [
        { answer: 'always', hint: 'Frequência máxima, 100% das vezes: never, always ou sometimes?', options: ['always', 'never', 'sometimes', 'usually'] },
        { answer: 'never', hint: 'Frequência zero: always, never ou usually?', options: ['never', 'always', 'often', 'rarely'] }
      ]
    },
    'soa4-wh-questions': {
      dialogue: '___1___ do you live? ___2___ is your name?',
      blanks: [
        { answer: 'Where', hint: 'Pergunta de lugar: What, Where ou When?', options: ['Where', 'What', 'When', 'Who'] },
        { answer: 'What', hint: 'Pergunta de nome/coisa: What, Who ou How?', options: ['What', 'Who', 'How', 'Where'] }
      ]
    },
    'soa4-prep-tempo': {
      dialogue: 'My birthday is ___1___ July. The class is ___2___ 3pm.',
      blanks: [
        { answer: 'in', hint: 'Mês = período amplo: in, on ou at?', options: ['in', 'on', 'at', 'by'] },
        { answer: 'at', hint: 'Hora exata: in, on ou at?', options: ['at', 'in', 'on', 'for'] }
      ]
    },
    'soa4-rotina': {
      dialogue: 'I ___1___ up at 7am. Then I ___2___ breakfast.',
      blanks: [
        { answer: 'wake', hint: 'Verbo de rotina para começar o dia: wake ou woke?', options: ['wake', 'woke', 'get', 'stand'] },
        { answer: 'have', hint: '"Tomar café da manhã" em inglês: have ou eat breakfast?', options: ['have', 'eat', 'do', 'make'] }
      ]
    },
    'soa5-past-regular': {
      dialogue: 'Yesterday I ___1___ to the gym. She ___2___ the report.',
      blanks: [
        { answer: 'walked', hint: '"walk" no passado regular: walk + _____?', options: ['walked', 'walk', 'walkt', 'walking'] },
        { answer: 'finished', hint: '"finish" no passado regular: finish + _____?', options: ['finished', 'finish', 'finishs', 'finishing'] }
      ]
    },
    'soa5-past-perguntas': {
      dialogue: '___1___ you sleep well? No, I ___2___.',
      blanks: [
        { answer: 'Did', hint: 'Para perguntas no passado simples, qual auxiliar usar: Did ou Does?', options: ['Did', 'Does', 'Do', 'Was'] },
        { answer: "didn't", hint: 'Resposta negativa no passado: "No, I ___"', options: ["didn't", "don't", "doesn't", "wasn't"] }
      ]
    },
    'soa5-past-negativa': {
      dialogue: 'I ___1___ go to school. She ___2___ the answer.',
      blanks: [
        { answer: "didn't", hint: 'Negação de ação no passado com "I": didn\'t ou don\'t?', options: ["didn't", "don't", "doesn't", "wasn't"] },
        { answer: "didn't know", hint: '"know" no negativo passado: didn\'t know ou didn\'t knew?', options: ["didn't know", "didn't knew", "don't know", "wasn't know"] }
      ]
    },
    'soa6-can': {
      dialogue: 'I ___1___ swim. She ___2___ drive yet.',
      blanks: [
        { answer: 'can', hint: 'Habilidade positiva: can ou could?', options: ['can', 'could', 'must', 'should'] },
        { answer: "can't", hint: 'Habilidade negativa: can\'t ou doesn\'t can?', options: ["can't", "doesn't can", "don't can", "mustn't"] }
      ]
    },
    'soa6-like-ing': {
      dialogue: 'I ___1___ reading. She ___2___ to music every evening.',
      blanks: [
        { answer: 'love', hint: '"like/love" + verbo: o verbo leva -ing ou to + base?', options: ['love', 'want', 'need', 'decide'] },
        { answer: 'listens', hint: 'Ação habitual de "she" no presente simples: qual forma?', options: ['listens', 'listen', 'listened', 'listening'] }
      ]
    },
    'soa6-want-to': {
      dialogue: 'I ___1___ to learn English. She ___2___ to travel.',
      blanks: [
        { answer: 'want', hint: '"querer" em inglês: want + to ou want + ing?', options: ['want', 'wants', 'like', 'love'] },
        { answer: 'needs', hint: '"she" + "need": qual forma do presente simples?', options: ['needs', 'need', 'want', 'decide'] }
      ]
    }
  };

  const INTERACTIVE_TABLES = {
    pronomes: {
      headers: ['Português', 'Inglês', 'Exemplo'],
      rows: [
        { pt: 'Eu', en: 'I', category: 'subject', example: 'I work every day.' },
        { pt: 'Você', en: 'You', category: 'subject', example: 'You speak English.' },
        { pt: 'Ele', en: 'He', category: 'subject', example: 'He lives in Rio.' },
        { pt: 'Ela', en: 'She', category: 'subject', example: 'She loves coffee.' },
        { pt: 'Me/mim', en: 'Me', category: 'object', example: 'She called me yesterday.' },
        { pt: 'Você (objeto)', en: 'You', category: 'object', example: 'I saw you at the store.' },
        { pt: 'Ele (objeto)', en: 'Him', category: 'object', example: 'I saw him.' },
        { pt: 'Ela (objeto)', en: 'Her', category: 'object', example: 'I helped her.' }
      ]
    },
    perguntas: {
      headers: ['Sujeito', 'Auxiliar', 'Tipo', 'Exemplo'],
      rows: [
        { pt: 'I / You / We / They', en: 'do', category: 'subject', example: 'Do you like coffee?' },
        { pt: 'He / She / It', en: 'does', category: 'subject', example: 'Does she work here?' },
        { pt: 'Qualquer sujeito (passado)', en: 'did', category: 'subject', example: 'Did they arrive?' },
        { pt: 'O quê / qual', en: 'What', category: 'object', example: 'What do you want?' },
        { pt: 'Onde', en: 'Where', category: 'object', example: 'Where does she live?' },
        { pt: 'Quem', en: 'Who', category: 'object', example: 'Who called you?' },
        { pt: 'Quando', en: 'When', category: 'object', example: 'When did they arrive?' },
        { pt: 'Como', en: 'How', category: 'object', example: 'How do you say this?' }
      ]
    },
    negativa: {
      headers: ['Situação', 'Negação', 'Exemplo'],
      rows: [
        { pt: 'to be (I)', en: "I'm not", category: 'subject', example: "I'm not ready." },
        { pt: 'to be (she/he)', en: "isn't", category: 'subject', example: "She isn't home." },
        { pt: 'to be (they/we)', en: "aren't", category: 'subject', example: "They aren't here." },
        { pt: 'ação presente (I/you/we/they)', en: "don't", category: 'object', example: "I don't eat meat." },
        { pt: 'ação presente (he/she/it)', en: "doesn't", category: 'object', example: "She doesn't like loud music." },
        { pt: 'ação passado (qualquer)', en: "didn't", category: 'object', example: "I didn't sleep well." },
        { pt: 'nunca', en: 'never', category: 'object', example: 'I never drink soda.' },
        { pt: 'ninguém', en: 'nobody', category: 'object', example: 'Nobody called.' }
      ]
    },
    passado: {
      headers: ['Base', 'Passado', 'Português'],
      rows: [
        { pt: 'ir', en: 'go → went', category: 'subject', example: 'I went to the store.' },
        { pt: 'vir', en: 'come → came', category: 'subject', example: 'She came early.' },
        { pt: 'ver', en: 'see → saw', category: 'subject', example: 'I saw him yesterday.' },
        { pt: 'fazer', en: 'do → did', category: 'subject', example: 'He did the homework.' },
        { pt: 'ter', en: 'have → had', category: 'object', example: 'We had dinner at 7.' },
        { pt: 'obter', en: 'get → got', category: 'object', example: 'She got the job.' },
        { pt: 'saber', en: 'know → knew', category: 'object', example: "I knew the answer." },
        { pt: 'falar', en: 'say → said', category: 'object', example: 'He said goodbye.' }
      ]
    },
    preposicoes: {
      headers: ['Preposição', 'Uso', 'Exemplo'],
      rows: [
        { pt: 'in (lugar)', en: 'in', category: 'subject', example: 'I live in Brazil.' },
        { pt: 'on (superfície)', en: 'on', category: 'subject', example: 'The book is on the table.' },
        { pt: 'at (ponto)', en: 'at', category: 'subject', example: "She's at the office." },
        { pt: 'in (período)', en: 'in + mês/ano', category: 'object', example: 'In July. In 2024.' },
        { pt: 'on (dia)', en: 'on + dia', category: 'object', example: 'On Monday.' },
        { pt: 'at (hora)', en: 'at + hora', category: 'object', example: 'At 3pm.' },
        { pt: 'to (movimento)', en: 'to', category: 'object', example: 'I go to work.' },
        { pt: 'from (origem)', en: 'from', category: 'object', example: "I'm from Brazil." }
      ]
    },
    verbos: {
      headers: ['Verbo', 'Função', 'Exemplo'],
      rows: [
        { pt: 'To be — identidade', en: 'am/is/are', category: 'subject', example: "I'm a student." },
        { pt: 'To be — estado', en: 'am/is/are', category: 'subject', example: "She's tired." },
        { pt: 'Can — habilidade', en: 'can', category: 'subject', example: 'I can swim.' },
        { pt: 'Must — obrigação', en: 'must', category: 'subject', example: 'You must call.' },
        { pt: 'Should — conselho', en: 'should', category: 'object', example: 'You should rest.' },
        { pt: 'Would — desejo', en: 'would', category: 'object', example: "I'd love that." },
        { pt: 'Phrasal: look up', en: 'look up', category: 'object', example: 'Look it up online.' },
        { pt: 'Phrasal: give up', en: 'give up', category: 'object', example: "Don't give up." }
      ]
    },
    'soa1-alfabeto': {
      headers: ['Letra', 'Som em inglês', 'Dica'],
      rows: [
        { pt: 'A', en: 'ei', category: 'subject', example: 'April, Apple, Ace' },
        { pt: 'E', en: 'ii', category: 'subject', example: 'Easy, Even, Each' },
        { pt: 'I', en: 'ai', category: 'subject', example: 'Ice, Idea, Island' },
        { pt: 'G', en: 'djii', category: 'subject', example: 'George, Gym, Gene' },
        { pt: 'H', en: 'eitsh', category: 'object', example: 'Hotel, Hour, High' },
        { pt: 'R', en: 'ar', category: 'object', example: 'Red, Right, Rain' },
        { pt: 'W', en: 'double-you', category: 'object', example: 'Work, Water, Win' },
        { pt: 'Y', en: 'wai', category: 'object', example: 'Yes, Year, Young' }
      ]
    },
    'soa1-numeros': {
      headers: ['Número', 'Inglês', 'Dica'],
      rows: [
        { pt: '1–5', en: 'one / two / three / four / five', category: 'subject', example: 'one apple, two cars' },
        { pt: '6–10', en: 'six / seven / eight / nine / ten', category: 'subject', example: 'six days, ten minutes' },
        { pt: '11–12', en: 'eleven / twelve', category: 'subject', example: 'irregulares — decorar' },
        { pt: '13–19', en: '-teen: thirteen, fourteen…', category: 'subject', example: '13=thirteen, 15=fifteen' },
        { pt: '20–90', en: '-ty: twenty, thirty…', category: 'object', example: '20=twenty, 50=fifty' },
        { pt: 'teen vs ty', en: 'thirTEEN vs thirTY', category: 'object', example: 'Stress na sílaba errada!' },
        { pt: '1º / 2º / 3º', en: '1st / 2nd / 3rd', category: 'object', example: 'First, second, third' },
        { pt: '4º em diante', en: '4th, 5th, 6th…', category: 'object', example: 'fourth, fifth, sixth…' }
      ]
    },
    'soa1-cumprimentos': {
      headers: ['Situação', 'Inglês', 'Nível'],
      rows: [
        { pt: 'Bom dia', en: 'Good morning', category: 'subject', example: '(até ~12h)' },
        { pt: 'Boa tarde', en: 'Good afternoon', category: 'subject', example: '(12h~18h)' },
        { pt: 'Boa noite (encontrar)', en: 'Good evening', category: 'subject', example: 'ao encontrar alguém' },
        { pt: 'Boa noite (ir dormir)', en: 'Good night', category: 'subject', example: 'apenas ao se despedir' },
        { pt: 'Como vai? (formal)', en: 'How are you?', category: 'object', example: 'Fine, thanks. And you?' },
        { pt: 'E aí? (informal)', en: "What's up? / How's it going?", category: 'object', example: "Good, thanks!" },
        { pt: 'Tchau', en: 'Goodbye / Bye / See you', category: 'object', example: 'See you later!' },
        { pt: 'Prazer em conhecer', en: 'Nice to meet you', category: 'object', example: 'Nice to meet you too.' }
      ]
    },
    'soa1-tobe-afirm': {
      headers: ['Sujeito', 'To be', 'Contração', 'Exemplo'],
      rows: [
        { pt: 'I', en: 'am', category: 'subject', example: "I'm Brazilian." },
        { pt: 'You', en: 'are', category: 'subject', example: "You're a student." },
        { pt: 'He', en: 'is', category: 'subject', example: "He's my boss." },
        { pt: 'She', en: 'is', category: 'subject', example: "She's from Rio." },
        { pt: 'It', en: 'is', category: 'subject', example: "It's cold today." },
        { pt: 'We', en: 'are', category: 'object', example: "We're a team." },
        { pt: 'You (pl.)', en: 'are', category: 'object', example: "You're both right." },
        { pt: 'They', en: 'are', category: 'object', example: "They're from São Paulo." }
      ]
    },
    'soa2-pronomes-sujeito': {
      headers: ['Português', 'Inglês', 'Exemplo'],
      rows: [
        { pt: 'Eu', en: 'I', category: 'subject', example: 'I study every day.' },
        { pt: 'Você', en: 'You', category: 'subject', example: 'You speak very well.' },
        { pt: 'Ele', en: 'He', category: 'subject', example: 'He works downtown.' },
        { pt: 'Ela', en: 'She', category: 'subject', example: 'She is a doctor.' },
        { pt: 'Isso/aquilo', en: 'It', category: 'subject', example: "It's raining outside." },
        { pt: 'Nós', en: 'We', category: 'object', example: 'We are a team.' },
        { pt: 'Vocês', en: 'You', category: 'object', example: 'You are all welcome.' },
        { pt: 'Eles/Elas', en: 'They', category: 'object', example: 'They eat lunch together.' }
      ]
    },
    'soa2-tobe-perg-neg': {
      headers: ['Tipo', 'Estrutura', 'Exemplo'],
      rows: [
        { pt: 'Pergunta com I', en: 'Am I...?', category: 'subject', example: 'Am I late?' },
        { pt: 'Pergunta com he/she', en: 'Is he/she...?', category: 'subject', example: 'Is she home?' },
        { pt: 'Pergunta com we/they', en: 'Are we/they...?', category: 'subject', example: 'Are they ready?' },
        { pt: 'Negativa I', en: "I'm not", category: 'subject', example: "I'm not tired." },
        { pt: 'Negativa he/she', en: "isn't", category: 'object', example: "He isn't here." },
        { pt: 'Negativa we/they', en: "aren't", category: 'object', example: "They aren't from here." },
        { pt: 'Resposta curta sim', en: 'Yes, I am / she is', category: 'object', example: 'Yes, she is.' },
        { pt: 'Resposta curta não', en: "No, I'm not / she isn't", category: 'object', example: "No, I'm not." }
      ]
    },
    'soa2-possessivos': {
      headers: ['Sujeito', 'Antes do nome', 'Sozinho', 'Exemplo'],
      rows: [
        { pt: 'I → my / mine', en: 'my bag / mine', category: 'subject', example: "This is my bag. That's mine." },
        { pt: 'You → your / yours', en: 'your car / yours', category: 'subject', example: "Is this your coat? Yes, it's yours." },
        { pt: 'He → his / his', en: 'his book / his', category: 'subject', example: "His phone is new. That one is his." },
        { pt: 'She → her / hers', en: 'her jacket / hers', category: 'subject', example: "Her jacket is nice. That's hers." },
        { pt: 'We → our / ours', en: 'our house / ours', category: 'object', example: "Our house is small. But ours is cozy." },
        { pt: 'They → their / theirs', en: 'their dog / theirs', category: 'object', example: "Their dog is big. That dog is theirs." }
      ]
    },
    'soa2-this-that': {
      headers: ['Distância', 'Singular', 'Plural', 'Exemplo'],
      rows: [
        { pt: 'Perto — singular', en: 'this', category: 'subject', example: 'This is my phone.' },
        { pt: 'Perto — plural', en: 'these', category: 'subject', example: 'These are my keys.' },
        { pt: 'Longe — singular', en: 'that', category: 'subject', example: "That's his car." },
        { pt: 'Longe — plural', en: 'those', category: 'subject', example: 'Those are her shoes.' },
        { pt: 'Pergunta com this', en: 'What is this?', category: 'object', example: "What is this? — It's a pen." },
        { pt: 'Pergunta com those', en: 'Are those yours?', category: 'object', example: 'Are those your keys? Yes, they are.' }
      ]
    },
    'soa3-present-afirm': {
      headers: ['Sujeito', 'Verbo', 'Regra', 'Exemplo'],
      rows: [
        { pt: 'I', en: 'base', category: 'subject', example: 'I work here.' },
        { pt: 'You', en: 'base', category: 'subject', example: 'You speak English.' },
        { pt: 'We / They', en: 'base', category: 'subject', example: 'They eat lunch at noon.' },
        { pt: 'He / She / It', en: 'base + s', category: 'subject', example: 'She works here.' },
        { pt: 'He / She + -ch/-sh', en: 'base + es', category: 'object', example: 'He teaches English.' },
        { pt: 'He / She + consoante+y', en: '-y → ies', category: 'object', example: 'She studies hard.' },
        { pt: 'Uso: hábito', en: 'always / every day', category: 'object', example: 'I go to the gym on Mondays.' },
        { pt: 'Uso: fato geral', en: 'Water boils at 100°C.', category: 'object', example: 'The sun rises in the east.' }
      ]
    },
    'soa3-third-person-s': {
      headers: ['Terminação', 'Regra', 'Exemplo'],
      rows: [
        { pt: 'a maioria dos verbos', en: '+ s', category: 'subject', example: 'work → works, play → plays' },
        { pt: '-ss, -sh, -ch, -x, -o', en: '+ es', category: 'subject', example: 'teach → teaches, go → goes' },
        { pt: 'consoante + y', en: '-y → ies', category: 'subject', example: 'study → studies, carry → carries' },
        { pt: 'vogal + y', en: '+ s (normal)', category: 'object', example: 'play → plays, say → says' },
        { pt: 'have (irregular)', en: 'have → has', category: 'object', example: "She has a car." },
        { pt: 'do (irregular)', en: 'do → does', category: 'object', example: 'She does yoga.' }
      ]
    },
    'soa3-frequencia': {
      headers: ['Advérbio', 'Frequência', 'Posição', 'Exemplo'],
      rows: [
        { pt: 'always', en: '100%', category: 'subject', example: 'I always brush my teeth.' },
        { pt: 'usually', en: '~80%', category: 'subject', example: 'She usually wakes up early.' },
        { pt: 'often', en: '~60%', category: 'subject', example: 'They often eat out.' },
        { pt: 'sometimes', en: '~40%', category: 'subject', example: 'I sometimes take the bus.' },
        { pt: 'rarely / seldom', en: '~20%', category: 'object', example: 'He rarely complains.' },
        { pt: 'never', en: '0%', category: 'object', example: 'She never drinks coffee.' },
        { pt: 'Posição: antes do verbo', en: 'I always work late.', category: 'object', example: 'always / usually / never' },
        { pt: 'Posição: depois de to be', en: "She's always tired.", category: 'object', example: "He's never late." }
      ]
    },
    'soa4-wh-questions': {
      headers: ['Pergunta', 'Inglês', 'Exemplo'],
      rows: [
        { pt: 'O quê / qual', en: 'What', category: 'subject', example: "What's your name?" },
        { pt: 'Onde', en: 'Where', category: 'subject', example: 'Where do you live?' },
        { pt: 'Quem', en: 'Who', category: 'subject', example: 'Who is your teacher?' },
        { pt: 'Quando', en: 'When', category: 'subject', example: 'When does it start?' },
        { pt: 'Por quê', en: 'Why', category: 'object', example: 'Why are you late?' },
        { pt: 'Como', en: 'How', category: 'object', example: 'How do you say this?' },
        { pt: 'Quanto (incontável)', en: 'How much', category: 'object', example: 'How much does it cost?' },
        { pt: 'Quantos (contável)', en: 'How many', category: 'object', example: 'How many brothers do you have?' }
      ]
    },
    'soa4-prep-tempo': {
      headers: ['Preposição', 'Quando usar', 'Exemplo'],
      rows: [
        { pt: 'in', en: 'meses, anos, estações, períodos', category: 'subject', example: 'In July. In 2024. In the morning.' },
        { pt: 'on', en: 'dias da semana, datas', category: 'subject', example: 'On Monday. On July 4th.' },
        { pt: 'at', en: 'horas, momentos exatos', category: 'subject', example: 'At 3pm. At midnight. At noon.' },
        { pt: 'in the morning', en: 'durante a manhã', category: 'object', example: "I exercise in the morning." },
        { pt: 'in the afternoon', en: 'durante a tarde', category: 'object', example: 'Class is in the afternoon.' },
        { pt: 'at night', en: 'exceção: noite usa at', category: 'object', example: "I study at night." }
      ]
    },
    'soa4-rotina': {
      headers: ['Verbo', 'Significado', 'Exemplo de rotina'],
      rows: [
        { pt: 'wake up', en: 'acordar', category: 'subject', example: 'I wake up at 6am.' },
        { pt: 'get up', en: 'levantar da cama', category: 'subject', example: 'I get up at 6:30.' },
        { pt: 'have breakfast', en: 'tomar café', category: 'subject', example: 'She has breakfast at 7.' },
        { pt: 'go to work', en: 'ir ao trabalho', category: 'subject', example: 'He goes to work by bus.' },
        { pt: 'have lunch', en: 'almoçar', category: 'object', example: 'We have lunch at noon.' },
        { pt: 'come home', en: 'voltar pra casa', category: 'object', example: 'I come home at 6pm.' },
        { pt: 'have dinner', en: 'jantar', category: 'object', example: 'They have dinner at 8.' },
        { pt: 'go to bed', en: 'ir dormir', category: 'object', example: 'I go to bed at 11.' }
      ]
    },
    'soa5-past-regular': {
      headers: ['Base', 'Regra', 'Passado', 'Exemplo'],
      rows: [
        { pt: 'a maioria', en: '+ ed', category: 'subject', example: 'work → worked, play → played' },
        { pt: 'termina em -e', en: '+ d', category: 'subject', example: 'love → loved, live → lived' },
        { pt: 'consoante + y', en: '-y → ied', category: 'subject', example: 'study → studied, carry → carried' },
        { pt: 'vogal + consoante (breve)', en: 'dobrar + ed', category: 'subject', example: 'stop → stopped, plan → planned' },
        { pt: 'Pronúncia -ed como /t/', en: 'após sons surdos', category: 'object', example: 'walked, watched, cooked' },
        { pt: 'Pronúncia -ed como /d/', en: 'após sons sonoros', category: 'object', example: 'lived, played, called' },
        { pt: 'Pronúncia -ed como /id/', en: 'após t ou d', category: 'object', example: 'wanted, needed, waited' }
      ]
    },
    'soa5-past-perguntas': {
      headers: ['Tipo', 'Estrutura', 'Exemplo'],
      rows: [
        { pt: 'Pergunta sim/não', en: 'Did + sujeito + base?', category: 'subject', example: 'Did you sleep well?' },
        { pt: 'Resposta positiva', en: 'Yes, I/he/she did.', category: 'subject', example: 'Yes, I did.' },
        { pt: 'Resposta negativa', en: "No, I/he/she didn't.", category: 'subject', example: "No, she didn't." },
        { pt: 'Pergunta com wh-', en: "What/Where/When + did + base?", category: 'object', example: 'What did you do?' },
        { pt: 'Who como sujeito', en: 'Who + verbo passado?', category: 'object', example: 'Who called you?' },
        { pt: 'Was / Were', en: 'to be no passado', category: 'object', example: 'Was she there? Were they happy?' }
      ]
    },
    'soa5-past-negativa': {
      headers: ['Sujeito', 'Negação', 'Exemplo'],
      rows: [
        { pt: 'qualquer sujeito + ação', en: "didn't + base", category: 'subject', example: "I didn't go. She didn't call." },
        { pt: 'I / he / she / it', en: "wasn't", category: 'subject', example: "He wasn't at home." },
        { pt: 'we / you / they', en: "weren't", category: 'subject', example: "They weren't ready." },
        { pt: 'Erro comum', en: "❌ didn't went", category: 'object', example: "✅ didn't go (base form!)" },
        { pt: 'Erro comum', en: "❌ she didn't knows", category: 'object', example: "✅ she didn't know" }
      ]
    },
    'soa6-can': {
      headers: ['Uso', 'Forma', 'Exemplo'],
      rows: [
        { pt: 'habilidade', en: 'can + base', category: 'subject', example: 'I can swim.' },
        { pt: 'negação', en: "can't / cannot", category: 'subject', example: "She can't drive." },
        { pt: 'pergunta', en: 'Can + sujeito + base?', category: 'subject', example: 'Can you help me?' },
        { pt: 'resposta curta', en: 'Yes, I can. / No, I can\'t.', category: 'subject', example: 'Can you come? Yes, I can.' },
        { pt: 'possibilidade', en: 'can (informal)', category: 'object', example: "It can be cold in July." },
        { pt: 'pedido educado', en: "Can you...? / Could you...?", category: 'object', example: 'Can you open the window?' }
      ]
    },
    'soa6-like-ing': {
      headers: ['Verbo', 'Seguido de', 'Exemplo'],
      rows: [
        { pt: 'like', en: 'like + -ing', category: 'subject', example: 'I like reading.' },
        { pt: 'love', en: 'love + -ing', category: 'subject', example: 'She loves dancing.' },
        { pt: 'enjoy', en: 'enjoy + -ing', category: 'subject', example: 'They enjoy cooking.' },
        { pt: 'hate', en: 'hate + -ing', category: 'subject', example: "He hates waiting." },
        { pt: 'Erro: like + base', en: '❌ I like go', category: 'object', example: '✅ I like going' },
        { pt: 'want / need', en: 'want/need + to + base', category: 'object', example: 'I want to learn. I need to go.' }
      ]
    },
    'soa6-want-to': {
      headers: ['Verbo', 'Estrutura', 'Exemplo'],
      rows: [
        { pt: 'want', en: 'want + to + base', category: 'subject', example: 'I want to travel.' },
        { pt: 'need', en: 'need + to + base', category: 'subject', example: 'She needs to study.' },
        { pt: 'decide', en: 'decide + to + base', category: 'subject', example: 'He decided to quit.' },
        { pt: 'try', en: 'try + to + base', category: 'subject', example: "I'm trying to learn." },
        { pt: 'Erro: want + base', en: '❌ I want go', category: 'object', example: '✅ I want to go' },
        { pt: 'Erro: want + ing', en: '❌ I want going', category: 'object', example: '✅ I want to go' }
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
      { difficulty: 'hard', q: 'Complete a frase: "___ enjoy cooking. Can you help ___?"', options: ['I / I', 'Me / me', 'I / me'], correct: 2, hints: ['1ª lacuna: sujeito antes do verbo', '2ª lacuna: objeto depois do verbo', '1ª lacuna: antes do verbo = sujeito (I). 2ª: depois do verbo = objeto (me). → Resposta: I / me'] }
    ],
    perguntas: [
      { difficulty: 'easy', q: 'Qual palavra inicia a pergunta: "___ you speak English?"', options: ['Do', 'Does', 'Did'], correct: 0, hints: ['Sujeito: "you" — singular ou grupo I/you/we/they?', 'Do = I/you/we/they. Does = he/she/it.', 'Resposta: Do'] },
      { difficulty: 'easy', q: '"___ she live in Rio?" — qual auxiliar?', options: ['Do', 'Does', 'Did'], correct: 1, hints: ['Sujeito: "she" — 3ª pessoa singular', 'She/He/It = Does', 'Resposta: Does'] },
      { difficulty: 'moderate', q: '"___ they arrive yesterday?" — passado ou presente?', options: ['Do', 'Does', 'Did'], correct: 2, hints: ['Palavra-chave: "yesterday" = passado', 'Passado = Did, para qualquer sujeito', 'Resposta: Did'] },
      { difficulty: 'moderate', q: 'Qual frase está correta?', options: ['Where she lives?', 'Where does she live?', 'Where does she lives?'], correct: 1, hints: ['Pergunta com wh-: word + does/do + base', 'Depois de "does", o verbo volta à base (sem -s)', 'Resposta: Where does she live?'] },
      { difficulty: 'hard', q: '"Who called you?" — por que não há "did" aqui?', options: ['Erro de gramática', '"Who" é o sujeito da frase', '"Who" é sempre informal'], correct: 1, hints: ['Pergunta: quem fez a ação? Who = sujeito', 'Quando wh- é o sujeito, a estrutura muda: sem auxiliar', 'Resposta: Who é o sujeito'] }
    ],
    negativa: [
      { difficulty: 'easy', q: 'Negue: "She is a doctor."', options: ["She isn't a doctor.", "She don't a doctor.", "She doesn't a doctor."], correct: 0, hints: ['To be se nega sozinho: is + not', 'isn\'t = is not (forma contraída)', 'Resposta: She isn\'t a doctor.'] },
      { difficulty: 'easy', q: 'Complete: "I ___ eat meat." (presente, hábito)', options: ["don't", "doesn't", "isn't"], correct: 0, hints: ['Negar ação com "I": don\'t ou doesn\'t?', 'I/you/we/they = don\'t', 'Resposta: don\'t'] },
      { difficulty: 'moderate', q: 'Corrija: "She doesn\'t likes coffee."', options: ["She don't like coffee.", "She doesn't like coffee.", "She isn't like coffee."], correct: 1, hints: ['Depois de "doesn\'t", o verbo volta à base', '❌ doesn\'t likes → ✅ doesn\'t like', 'Resposta: She doesn\'t like coffee.'] },
      { difficulty: 'moderate', q: 'Negue no passado: "He went home."', options: ["He didn't went home.", "He doesn't go home.", "He didn't go home."], correct: 2, hints: ['Passado negativo: didn\'t + base', 'didn\'t já carrega o passado — verbo fica na base', 'Resposta: He didn\'t go home.'] },
      { difficulty: 'hard', q: 'Qual frase está correta em inglês padrão?', options: ["I don't know nothing.", "I never know nothing.", "I don't know anything."], correct: 2, hints: ['Inglês evita dupla negação', '"don\'t + anything" = negação correta', 'Resposta: I don\'t know anything.'] }
    ],
    passado: [
      { difficulty: 'easy', q: 'Qual é o passado de "go"?', options: ['goed', 'went', 'gone'], correct: 1, hints: ['"go" é irregular — não aceita -ed', 'go → went (decorar!)', 'Resposta: went'] },
      { difficulty: 'easy', q: 'Complete: "Yesterday she ___ to work." (walk, passado regular)', options: ['walks', 'walked', 'walking'], correct: 1, hints: ['"Walk" é regular: walk + ed', 'Passado regular = base + -ed', 'Resposta: walked'] },
      { difficulty: 'moderate', q: 'Qual é o passado de "have"?', options: ['haved', 'had', 'has'], correct: 1, hints: ['"have" é irregular', 'have → had', 'Resposta: had'] },
      { difficulty: 'moderate', q: 'Complete: "I ___ (not/go) to the party."', options: ["didn't went", "didn't go", "don't went"], correct: 1, hints: ['Negação passado: didn\'t + base', '❌ didn\'t went → ✅ didn\'t go', 'Resposta: didn\'t go'] },
      { difficulty: 'hard', q: '"She was working when I ___." (arrive)', options: ['arrive', 'arrived', 'was arriving'], correct: 1, hints: ['Ação que interrompeu = past simple', '"when I arrived" = ação pontual no passado', 'Resposta: arrived'] }
    ],
    preposicoes: [
      { difficulty: 'easy', q: 'Complete: "I live ___ Brazil."', options: ['in', 'on', 'at'], correct: 0, hints: ['País = área grande (dentro)', 'in = dentro de um espaço/área', 'Resposta: in'] },
      { difficulty: 'easy', q: 'Complete: "The book is ___ the table."', options: ['in', 'on', 'at'], correct: 1, hints: ['Sobre uma superfície plana', 'on = em cima de, sobre', 'Resposta: on'] },
      { difficulty: 'moderate', q: '"My meeting is ___ Monday." — qual preposição?', options: ['in', 'on', 'at'], correct: 1, hints: ['Dia da semana: in, on ou at?', 'on + dia da semana', 'Resposta: on'] },
      { difficulty: 'moderate', q: '"Class starts ___ 9am." — qual preposição?', options: ['in', 'on', 'at'], correct: 2, hints: ['Hora específica: in, on ou at?', 'at + hora exata', 'Resposta: at'] },
      { difficulty: 'hard', q: 'Qual frase usa a preposição ERRADA?', options: ["I'll see you in Monday.", "She was born in 1990.", "The party starts at midnight."], correct: 0, hints: ['Veja cada preposição e seu uso', 'Dia da semana usa "on", não "in"', 'Resposta: "in Monday" está errado → on Monday'] }
    ],
    verbos: [
      { difficulty: 'easy', q: 'Complete: "She ___ a teacher." (to be, presente)', options: ['am', 'is', 'are'], correct: 1, hints: ['To be com "she" (3ª pessoa)', 'she = is', 'Resposta: is'] },
      { difficulty: 'easy', q: '"I ___ swim." — qual modal para habilidade?', options: ['can', 'must', 'should'], correct: 0, hints: ['Habilidade/capacidade: can, must ou should?', 'can = conseguir fazer algo', 'Resposta: can'] },
      { difficulty: 'moderate', q: 'Qual frase expressa conselho?', options: ['You must stop.', 'You should rest.', 'You can go.'], correct: 1, hints: ['must = obrigação forte. can = possibilidade.', 'should = conselho suave', 'Resposta: You should rest.'] },
      { difficulty: 'moderate', q: '"Look ___ the word in the dictionary." (phrasal)', options: ['up', 'at', 'on'], correct: 0, hints: ['Phrasal verb: buscar informação = look ___', 'look up = pesquisar/consultar', 'Resposta: up'] },
      { difficulty: 'hard', q: 'Qual frase usa o modal corretamente?', options: ["She can to swim.", "She can swims.", "She can swim."], correct: 2, hints: ['Depois de modal (can/must/should), o verbo fica na base', '❌ can to swim / can swims → ✅ can swim', 'Resposta: She can swim.'] }
    ],
    'soa1-alfabeto': [
      { difficulty: 'easy', q: 'Qual é o som da letra "A" em inglês?', options: ['ah', 'ei', 'aa'], correct: 1, hints: ['Pense no nome da letra, não no som do português', '"A" se chama "ei" em inglês', 'Resposta: ei'] },
      { difficulty: 'easy', q: 'Como se soletra "Rio" em inglês? Qual letra vem primeiro?', options: ['R — ar', 'R — rr', 'R — re'], correct: 0, hints: ['A letra R em inglês tem som de "ar"', 'R = ar, I = ai, O = ou', 'Resposta: ar'] },
      { difficulty: 'moderate', q: 'Qual letra tem o nome "double-you"?', options: ['V', 'W', 'U'], correct: 1, hints: ['Letra incomum com nome composto', '"Double" = duplo. Pense na forma visual da letra.', 'Resposta: W'] },
      { difficulty: 'moderate', q: 'Como se pronuncia o som "TH" em inglês (think)?', options: ['d', 't', 'th (língua nos dentes)'], correct: 2, hints: ['TH não existe em português', 'É necessário colocar a ponta da língua entre os dentes', 'Resposta: th (língua nos dentes)'] },
      { difficulty: 'hard', q: 'Soletrar "Brazil" em inglês: qual a sequência correta?', options: ['B-R-A-Z-I-L', 'B-R-E-Z-I-L', 'B-R-A-S-I-L'], correct: 0, hints: ['Em inglês, Brazil tem Z (não S)', 'B(bi) R(ar) A(ei) Z(zi) I(ai) L(el)', 'Resposta: B-R-A-Z-I-L'] }
    ],
    'soa1-numeros': [
      { difficulty: 'easy', q: 'Como se escreve o número 5 em inglês?', options: ['fife', 'five', 'fíve'], correct: 1, hints: ['Número pequeno, 1-5', '5 = five (rima com "hive")', 'Resposta: five'] },
      { difficulty: 'easy', q: 'Como se escreve 13 em inglês?', options: ['thirty', 'thirten', 'thirteen'], correct: 2, hints: ['13 = teen (não "ty")', '13 = thir + teen', 'Resposta: thirteen'] },
      { difficulty: 'moderate', q: 'Qual a diferença entre "thirteen" e "thirty"?', options: ['São a mesma coisa', '13 vs 30', '30 vs 13'], correct: 1, hints: ['-teen = 13-19. -ty = 20/30/40…', 'thirTEEN = 13. THIRty = 30', 'Resposta: 13 vs 30'] },
      { difficulty: 'moderate', q: 'Como se diz "segundo" (ordinal) em inglês?', options: ['second', 'secondth', 'two'], correct: 0, hints: ['Ordinais: 1st, 2nd, 3rd, 4th…', '2nd = second (irregular)', 'Resposta: second'] },
      { difficulty: 'hard', q: 'Qual está escrito corretamente?', options: ['fourty', 'forty', 'fourtie'], correct: 1, hints: ['40 é exceção — não segue o padrão "four + ty"', '40 = forty (sem o "u"!)', 'Resposta: forty'] }
    ],
    'soa1-cumprimentos': [
      { difficulty: 'easy', q: 'Que saudação usar às 8 da manhã?', options: ['Good night', 'Good morning', 'Good evening'], correct: 1, hints: ['Manhã: até ~12h', 'Good morning = bom dia', 'Resposta: Good morning'] },
      { difficulty: 'easy', q: '"Good night" significa:', options: ['Boa noite (ao encontrar)', 'Boa noite (ao se despedir)', 'Boa tarde'], correct: 1, hints: ['"Good night" é despedida, não saudação ao chegar', '"Good evening" = ao encontrar alguém à noite', 'Resposta: ao se despedir'] },
      { difficulty: 'moderate', q: 'Como responder "How are you?"', options: ['I am fine, thanks.', 'I fine.', 'Yes, I am.'], correct: 0, hints: ['Resposta completa + educada', 'Fine / Good / Great + thanks', 'Resposta: I am fine, thanks.'] },
      { difficulty: 'moderate', q: '"Nice to meet you" — quando usar?', options: ['Ao se despedir', 'Ao conhecer alguém pela primeira vez', 'Para pedir desculpa'], correct: 1, hints: ['Esta frase é para apresentações', 'Ao conhecer = "Nice to meet you"', 'Resposta: ao conhecer alguém pela primeira vez'] },
      { difficulty: 'hard', q: 'Alguém diz "What\'s up?" — qual a melhor resposta casual?', options: ['I\'m fine, thank you very much.', 'Not much, you?', 'Good morning!'], correct: 1, hints: ['"What\'s up?" é informal', 'Resposta casual: "Not much", "Good", "Nothing much"', 'Resposta: Not much, you?'] }
    ],
    'soa1-tobe-afirm': [
      { difficulty: 'easy', q: 'Complete: "I ___ a student."', options: ['am', 'is', 'are'], correct: 0, hints: ['I + to be = ?', 'I am (única combinação possível)', 'Resposta: am'] },
      { difficulty: 'easy', q: 'Complete: "She ___ from Brazil."', options: ['am', 'is', 'are'], correct: 1, hints: ['She = 3ª pessoa singular', 'he/she/it = is', 'Resposta: is'] },
      { difficulty: 'moderate', q: 'Complete a contração: "They ___ ready."', options: ["They're", "Theyre", "They is"], correct: 0, hints: ['they + are = contração', "they're = they are", "Resposta: They're"] },
      { difficulty: 'moderate', q: 'Qual frase está correta?', options: ['He are my friend.', 'He am my friend.', 'He is my friend.'], correct: 2, hints: ['he/she/it = is', '❌ he are / he am → ✅ he is', 'Resposta: He is my friend.'] },
      { difficulty: 'hard', q: 'Traduza: "Nós somos uma equipe e eles são os melhores."', options: ["We are a team and they are the best.", "We is a team and they is the best.", "We are a team and they is the best."], correct: 0, hints: ['we = are, they = are', 'Ambos são plurais → are', 'Resposta: We are a team and they are the best.'] }
    ],
    'soa2-pronomes-sujeito': [
      { difficulty: 'easy', q: 'Qual pronome substitui "Carlos"?', options: ['He', 'She', 'They'], correct: 0, hints: ['Carlos = nome masculino', 'Masculino singular = He', 'Resposta: He'] },
      { difficulty: 'easy', q: 'Qual pronome para "o cachorro"?', options: ['He', 'She', 'It'], correct: 2, hints: ['Animal (gênero não especificado) = It', 'It = coisas e animais (gênero neutro)', 'Resposta: It'] },
      { difficulty: 'moderate', q: 'Complete: "___ is raining." — qual pronome?', options: ['He', 'It', 'They'], correct: 1, hints: ['Em inglês, frases impessoais PRECISAM de sujeito', '"It" é usado para clima e situações impessoais', 'Resposta: It'] },
      { difficulty: 'moderate', q: '"Ana e eu" = ?', options: ['I and Ana', 'Me and Ana', 'Ana and I'], correct: 2, hints: ['Em inglês, a educação pede que o outro venha primeiro', 'Ana and I (não "I and Ana")', 'Resposta: Ana and I'] },
      { difficulty: 'hard', q: 'Qual frase usa pronome ERRADO?', options: ["She goes to school.", "Him is my teacher.", "They study together."], correct: 1, hints: ['Pronome vem antes do verbo = sujeito', '"Him" é objeto, não sujeito', 'Resposta: Him is my teacher (errado — deveria ser "He")'] }
    ],
    'soa2-tobe-perg-neg': [
      { difficulty: 'easy', q: 'Como perguntar "Ela é professora?"', options: ['She is a teacher?', 'Is she a teacher?', 'Does she is a teacher?'], correct: 1, hints: ['Pergunta com to be: invertemos sujeito e verbo', 'Is + she + ...?', 'Resposta: Is she a teacher?'] },
      { difficulty: 'easy', q: 'Complete a negativa: "They ___ from here."', options: ["isn't", "aren't", "don't"], correct: 1, hints: ['They = plural → are/aren\'t', "aren't = are not", "Resposta: aren't"] },
      { difficulty: 'moderate', q: 'Responda negativamente: "Is he at home?"', options: ['No, he don\'t.', 'No, he isn\'t.', 'No, he aren\'t.'], correct: 1, hints: ['He = singular → is/isn\'t', "Short answer: No, he isn't.", "Resposta: No, he isn't."] },
      { difficulty: 'moderate', q: 'Qual pergunta está correta?', options: ['Are they happy?', 'They are happy?', 'Do they are happy?'], correct: 0, hints: ['Com to be, inverte sujeito e verbo', '"Do" não se usa com to be', 'Resposta: Are they happy?'] },
      { difficulty: 'hard', q: 'Traduza: "Você não está cansado, está?"', options: ["You aren't tired, are you?", "You aren't tired, isn't it?", "You don't tired, are you?"], correct: 0, hints: ['Tag question: frase negativa → tag positiva', '"aren\'t you?" espelha "you aren\'t"', "Resposta: You aren't tired, are you?"] }
    ],
    'soa2-possessivos': [
      { difficulty: 'easy', q: 'Complete: "This is ___ bag." (minha)', options: ['my', 'mine', 'me'], correct: 0, hints: ['Antes do substantivo (bag está na frase)', 'my + substantivo', 'Resposta: my'] },
      { difficulty: 'easy', q: 'Complete: "The bag is ___." (dela)', options: ['her', 'hers', 'she'], correct: 1, hints: ['O substantivo não aparece depois', 'Possessivo sozinho = hers (not her)', 'Resposta: hers'] },
      { difficulty: 'moderate', q: 'Complete: "___ car is fast." (dele)', options: ['Him', 'His', 'He'], correct: 1, hints: ['Possessivo de he: His + substantivo', '"Him" é objeto, não possessivo', 'Resposta: His'] },
      { difficulty: 'moderate', q: '"This coffee is ___." (seu, informal, de você)', options: ['your', 'yours', 'you'], correct: 1, hints: ['Possessivo sem substantivo = yours', 'your bag = yours (sem bag)', 'Resposta: yours'] },
      { difficulty: 'hard', q: 'Qual frase está correta?', options: ["That is their house.", "That is theirs house.", "That house is their."], correct: 0, hints: ['their + substantivo = possessivo adj', '"theirs" fica sozinho (sem substantivo depois)', 'Resposta: That is their house.'] }
    ],
    'soa2-this-that': [
      { difficulty: 'easy', q: 'Objeto perto de você, singular:', options: ['this', 'these', 'that'], correct: 0, hints: ['Perto = this (singular) ou these (plural)', 'Singular + perto = this', 'Resposta: this'] },
      { difficulty: 'easy', q: 'Coisas longe, no plural:', options: ['this', 'those', 'that'], correct: 1, hints: ['Longe plural = those', '"those" = plural de "that"', 'Resposta: those'] },
      { difficulty: 'moderate', q: '"___ are my keys." (aqui, plural)', options: ['This', 'These', 'Those'], correct: 1, hints: ['Perto + plural = these', '"keys" é plural', 'Resposta: These'] },
      { difficulty: 'moderate', q: '"___ is your car?" "The blue one." — qual demonstrativo?', options: ['What', 'Which', 'That'], correct: 1, hints: ['Escolha entre opções específicas = which', 'which = qual (entre opções)', 'Resposta: Which'] },
      { difficulty: 'hard', q: '"Is ___ your coffee?" "No, ___ is mine." (longe/perto)', options: ['that / this', 'this / that', 'those / these'], correct: 0, hints: ['1ª: longe (pointing at the cup) = that', '2ª: perto (pointing at yours) = this', 'Resposta: that / this'] }
    ],
    'soa3-present-afirm': [
      { difficulty: 'easy', q: 'Complete: "She ___ English." (speak, presente)', options: ['speak', 'speaks', 'is speak'], correct: 1, hints: ['She = 3ª pessoa singular', 'He/she/it + base + s', 'Resposta: speaks'] },
      { difficulty: 'easy', q: 'Complete: "I ___ to the gym every day." (go)', options: ['goes', 'go', 'going'], correct: 1, hints: ['I = 1ª pessoa → sem -s', 'I go (sem -s)', 'Resposta: go'] },
      { difficulty: 'moderate', q: '"She ___ French." (teach)', options: ['teachs', 'teached', 'teaches'], correct: 2, hints: ['teach termina em -ch → +es', 'teach → teaches', 'Resposta: teaches'] },
      { difficulty: 'moderate', q: '"He ___ to music every night." (listen)', options: ['listen', 'listens', 'listenes'], correct: 1, hints: ['listen: consoante + en → +s', 'listen → listens', 'Resposta: listens'] },
      { difficulty: 'hard', q: '"She ___ hard every day." (study)', options: ['studys', 'studies', 'studyes'], correct: 1, hints: ['study: consoante + y → -ies', 'study → studies', 'Resposta: studies'] }
    ],
    'soa3-third-person-s': [
      { difficulty: 'easy', q: '"work" com "he" no presente simples:', options: ['work', 'works', 'workies'], correct: 1, hints: ['work termina em consoante comum → +s', 'work → works', 'Resposta: works'] },
      { difficulty: 'easy', q: '"go" com "she" no presente simples:', options: ['gos', 'goes', 'go'], correct: 1, hints: ['go termina em -o → +es', 'go → goes', 'Resposta: goes'] },
      { difficulty: 'moderate', q: '"carry" com "he":', options: ['carrys', 'carries', 'carring'], correct: 1, hints: ['carry: consoante + y → ies', 'carry → carries', 'Resposta: carries'] },
      { difficulty: 'moderate', q: '"have" com "she":', options: ['haves', 'hase', 'has'], correct: 2, hints: ['"have" é irregular', 'have → has (único irregular)', 'Resposta: has'] },
      { difficulty: 'hard', q: '"She ___ (not/study) on Sundays."', options: ["doesn't studies", "doesn't study", "don't study"], correct: 1, hints: ['She = doesn\'t. Depois de doesn\'t: base form', '❌ doesn\'t studies → ✅ doesn\'t study', "Resposta: doesn't study"] }
    ],
    'soa3-frequencia': [
      { difficulty: 'easy', q: 'Onde vai o advérbio? "I ___ wake up early." (always)', options: ['always / antes do verbo', 'always / depois do verbo', 'always / no final'], correct: 0, hints: ['always/never/usually vão ANTES do verbo principal', 'I always wake up...', 'Resposta: antes do verbo'] },
      { difficulty: 'easy', q: '"She is ___ late." — onde vai "never"?', options: ['never / antes de is', 'never / depois de is', 'never / no início'], correct: 1, hints: ['Depois de to be, o advérbio vai depois', 'She is never late.', 'Resposta: depois de is'] },
      { difficulty: 'moderate', q: 'Qual frase está correta?', options: ['He goes always to the gym.', 'He always goes to the gym.', 'Always he goes to the gym.'], correct: 1, hints: ['Posição padrão: antes do verbo principal', 'He always goes', 'Resposta: He always goes to the gym.'] },
      { difficulty: 'moderate', q: '"I eat ___ at home." — frequência ~40%:', options: ['always', 'never', 'sometimes'], correct: 2, hints: ['~40% = sometimes', 'sometimes = às vezes', 'Resposta: sometimes'] },
      { difficulty: 'hard', q: 'Traduza: "Ela raramente reclama."', options: ['She always complains.', 'She rarely complains.', 'She not complains.'], correct: 1, hints: ['raramente = rarely / seldom', 'She rarely complains.', 'Resposta: She rarely complains.'] }
    ],
    'soa4-wh-questions': [
      { difficulty: 'easy', q: '"___ is your name?" — qual palavra de pergunta?', options: ['Where', 'What', 'Who'], correct: 1, hints: ['Nome = coisa/informação → What', 'What = o quê / qual', 'Resposta: What'] },
      { difficulty: 'easy', q: '"___ do you live?" — lugar', options: ['Where', 'When', 'Why'], correct: 0, hints: ['Lugar = Where', 'Where = onde', 'Resposta: Where'] },
      { difficulty: 'moderate', q: '"___ does the class start?" — horário', options: ['Where', 'When', 'Why'], correct: 1, hints: ['Tempo/horário = When', 'When = quando', 'Resposta: When'] },
      { difficulty: 'moderate', q: '"___ much does it cost?" — preço', options: ['How', 'What', 'Which'], correct: 0, hints: ['Quantidade incontável = How much', 'How much = quanto (preço, quantidade)', 'Resposta: How'] },
      { difficulty: 'hard', q: 'Qual frase está correta?', options: ['Where you live?', 'Where do you live?', 'Where does you live?'], correct: 1, hints: ['wh- + do/does + sujeito + base', '"you" = do (não does)', 'Estrutura wh- = palavra + do/does + sujeito + base. "You" usa "do". → Resposta: Where do you live?'] }
    ],
    'soa4-prep-tempo': [
      { difficulty: 'easy', q: '"My birthday is ___ July."', options: ['in', 'on', 'at'], correct: 0, hints: ['Mês = período amplo', 'in + mês', 'Resposta: in'] },
      { difficulty: 'easy', q: '"The meeting is ___ Monday."', options: ['in', 'on', 'at'], correct: 1, hints: ['Dia da semana = on', 'on + dia', 'Resposta: on'] },
      { difficulty: 'moderate', q: '"Class starts ___ 9am."', options: ['in', 'on', 'at'], correct: 2, hints: ['Hora específica = at', 'at + hora', 'Resposta: at'] },
      { difficulty: 'moderate', q: '"I study ___ the morning."', options: ['in', 'on', 'at'], correct: 0, hints: ['Período do dia: morning/afternoon/evening = in', 'in the morning / afternoon / evening', 'Resposta: in'] },
      { difficulty: 'hard', q: '"She works ___ night." — exceção!', options: ['in', 'on', 'at'], correct: 2, hints: ['night é exceção: usa "at" (não "in")', 'at night (exceção ao padrão)', 'Resposta: at'] }
    ],
    'soa4-rotina': [
      { difficulty: 'easy', q: '"Acordar" em inglês:', options: ['wake up', 'get up', 'stand up'], correct: 0, hints: ['Wake up = acordar (abrir os olhos)', 'wake up ≠ get up (get up = sair da cama)', 'Resposta: wake up'] },
      { difficulty: 'easy', q: '"Tomar café da manhã" em inglês:', options: ['eat breakfast', 'have breakfast', 'do breakfast'], correct: 1, hints: ['Em inglês, usa "have" para refeições', 'have breakfast / lunch / dinner', 'Resposta: have breakfast'] },
      { difficulty: 'moderate', q: '"She ___ to work at 8." (go, present simple, she)', options: ['go', 'goes', 'is going'], correct: 1, hints: ['She + go → goes (3ª pessoa)', 'Hábito de rotina = present simple', 'Resposta: goes'] },
      { difficulty: 'moderate', q: '"I ___ home at 6pm." (come)', options: ['come', 'comes', 'go'], correct: 0, hints: ['I = sem -s', 'come home (não go home — já estou vindo)', 'Resposta: come'] },
      { difficulty: 'hard', q: 'Descreva sua rotina: "Eu sempre _____ às 7h e _____ às 23h."', options: ['wake up / go to bed', 'wakes up / go to bed', 'wake up / sleep'], correct: 0, hints: ['I (sem -s) + wake up. go to bed = dormir formalmente.', 'I wake up... I go to bed', 'Resposta: wake up / go to bed'] }
    ],
    'soa5-past-regular': [
      { difficulty: 'easy', q: '"walk" no passado regular:', options: ['walkt', 'walked', 'walking'], correct: 1, hints: ['Verbo regular: base + ed', 'walk → walked', 'Resposta: walked'] },
      { difficulty: 'easy', q: '"love" no passado:', options: ['loved', 'loveed', 'lovet'], correct: 0, hints: ['Termina em -e: base + d (apenas d)', 'love → loved', 'Resposta: loved'] },
      { difficulty: 'moderate', q: '"stop" no passado (vogal+consoante breve):', options: ['stoped', 'stopped', 'stopd'], correct: 1, hints: ['CVC curto: dobrar a consoante + ed', 'stop → stopped', 'Resposta: stopped'] },
      { difficulty: 'moderate', q: '"study" no passado:', options: ['studyed', 'studid', 'studied'], correct: 2, hints: ['consoante + y → ied', 'study → studied', 'Resposta: studied'] },
      { difficulty: 'hard', q: '"walked" se pronuncia como:', options: ['/walkɛd/', '/walkt/', '/walkd/'], correct: 1, hints: ['Após som surdo (k), -ed soa /t/', 'walked = /walkt/', 'Resposta: /walkt/'] }
    ],
    'soa5-past-perguntas': [
      { difficulty: 'easy', q: '"___ you sleep well?" — passado', options: ['Do', 'Does', 'Did'], correct: 2, hints: ['Passado = Did, para todos', 'Did + sujeito + base', 'Resposta: Did'] },
      { difficulty: 'easy', q: '"___ she call you?" — passado', options: ['Do', 'Does', 'Did'], correct: 2, hints: ['Passado: always Did', 'Did (não Does) no passado', 'Resposta: Did'] },
      { difficulty: 'moderate', q: '"Where ___ you go yesterday?"', options: ['do', 'does', 'did'], correct: 2, hints: ['yesterday = passado', 'wh- + did + sujeito + base', 'Resposta: did'] },
      { difficulty: 'moderate', q: 'Resposta negativa a "Did he come?"', options: ["No, he didn't.", "No, he don't.", "No, he doesn't."], correct: 0, hints: ['Negativo passado = didn\'t', "No, he didn't.", "Resposta: No, he didn't."] },
      { difficulty: 'hard', q: '"Was she at the party?" — qual resposta curta positiva?', options: ['Yes, she was.', 'Yes, she did.', 'Yes, she is.'], correct: 0, hints: ['was/were = to be no passado', 'Curta: Yes, she was. (espelha o was da pergunta)', 'Resposta: Yes, she was.'] }
    ],
    'soa5-past-negativa': [
      { difficulty: 'easy', q: '"She ___ go home." (negação passado)', options: ["didn't", "don't", "doesn't"], correct: 0, hints: ['Negação passado = didn\'t (qualquer sujeito)', "she didn't go", "Resposta: didn't"] },
      { difficulty: 'easy', q: '"I didn\'t ___ there." (be)', options: ['was', 'be', 'am'], correct: 1, hints: ['Depois de didn\'t: verbo na base', "didn't + base (não passado)", 'Resposta: be'] },
      { difficulty: 'moderate', q: 'Corrija: "I didn\'t went to school."', options: ["I didn't go to school.", "I didn't gone to school.", "I not went to school."], correct: 0, hints: ['didn\'t + base (não passado)', '❌ didn\'t went → ✅ didn\'t go', "Resposta: I didn't go to school."] },
      { difficulty: 'moderate', q: '"He ___ at home." (was, negação)', options: ["wasn't", "weren't", "didn't was"], correct: 0, hints: ['To be no passado: was/wasn\'t (not didn\'t)', "wasn't = was not", "Resposta: wasn't"] },
      { difficulty: 'hard', q: '"They ___ ready." (were, negação)', options: ["wasn't", "weren't", "didn't were"], correct: 1, hints: ['They = plural → were/weren\'t', "weren't = were not", "Lembre: they/we/you usam were no passado, então a negação é weren't. → Resposta: weren't"] }
    ],
    'soa6-can': [
      { difficulty: 'easy', q: '"I ___ swim." (habilidade positiva)', options: ['can', 'cans', 'can to'], correct: 0, hints: ['Modal + base (sem to, sem -s)', 'can swim (não can to swim)', 'Resposta: can'] },
      { difficulty: 'easy', q: '"She ___ drive." (negação)', options: ["can not drive", "can't drive", "doesn't can drive"], correct: 1, hints: ["can't = cannot (forma contraída)", "can't + base", "Resposta: can't drive"] },
      { difficulty: 'moderate', q: '"___ you help me?" (pedido educado)', options: ['Do', 'Can', 'Should'], correct: 1, hints: ['Pedido = Can ou Could (mais educado)', 'Can you help me?', 'Resposta: Can'] },
      { difficulty: 'moderate', q: '"She can ___." (swim, forma correta)', options: ['swims', 'swimming', 'swim'], correct: 2, hints: ['Depois de modal: verbo na base', 'can + swim (não can + swims)', 'Resposta: swim'] },
      { difficulty: 'hard', q: 'Qual frase usa "can" INCORRETAMENTE?', options: ["I can't go.", "She can swims.", "Can you open this?"], correct: 1, hints: ['Modal nunca muda o verbo que vem depois', '❌ can swims → ✅ can swim', 'Modal nunca muda o verbo que segue — sem -s, sem -ed. → Resposta: She can swims. (a frase errada)'] }
    ],
    'soa6-like-ing': [
      { difficulty: 'easy', q: '"I like ___." (dance)', options: ['dance', 'dancing', 'to dance'], correct: 1, hints: ['like + -ing (não base)', 'I like dancing', 'Resposta: dancing'] },
      { difficulty: 'easy', q: '"She loves ___." (cook)', options: ['cook', 'cooks', 'cooking'], correct: 2, hints: ['love + -ing', 'She loves cooking', 'Resposta: cooking'] },
      { difficulty: 'moderate', q: 'Corrija: "I like go to the gym."', options: ['I like going to the gym.', 'I like to go to the gym.', 'Ambas estão corretas'], correct: 2, hints: ['like + -ing OU like + to + base — ambas são aceitas!', 'like going / like to go = ambas corretas', 'Resposta: Ambas estão corretas'] },
      { difficulty: 'moderate', q: '"He hates ___." (wait)', options: ['wait', 'waiting', 'to wait'], correct: 1, hints: ['hate + -ing (forma mais natural)', 'He hates waiting', 'Resposta: waiting'] },
      { difficulty: 'hard', q: '"I ___ to learn English." (want)', options: ['want', 'want to', 'wanting'], correct: 1, hints: ['want + to + base (não -ing!)', 'want to go, want to learn', 'Resposta: want to'] }
    ],
    'soa6-want-to': [
      { difficulty: 'easy', q: '"I ___ to travel." (want)', options: ['want', 'wants', 'wanting'], correct: 0, hints: ['I + want (sem -s)', 'want + to + base', 'Resposta: want'] },
      { difficulty: 'easy', q: '"She ___ to study." (need)', options: ['need', 'needs', 'needing'], correct: 1, hints: ['she/he = +s no present simple', 'She needs (3ª pessoa)', 'Resposta: needs'] },
      { difficulty: 'moderate', q: 'Corrija: "I want go home."', options: ['I want going home.', 'I want to go home.', 'I wants to go home.'], correct: 1, hints: ['want + to + base', '❌ want go → ✅ want to go', 'Resposta: I want to go home.'] },
      { difficulty: 'moderate', q: '"He decided ___ quit his job."', options: ['quit', 'to quit', 'quitting'], correct: 1, hints: ['decide + to + base', 'decided to quit', 'Resposta: to quit'] },
      { difficulty: 'hard', q: '"She is ___ to become a doctor." (try)', options: ['trying', 'try', 'tries'], correct: 0, hints: ['is + -ing = present continuous', 'She is trying', 'Resposta: trying'] }
    ]
  };

  const FINAL_TESTS = {
    pronomes: [
      { q: 'Em "She calls me", qual é a função de "me"?', options: ['Sujeito', 'Objeto', 'Possessivo'], correct: 1 },
      { q: '"This is for I" — o que está errado?', options: ['Nada, está correto', 'Deveria ser "for me"', 'Falta o verbo'], correct: 1 },
      { q: 'Complete: "___ am going to the party."', options: ['Me', 'I', 'My'], correct: 1 },
      { q: '"The bag is ___." (dela)', options: ['her', 'hers', 'she'], correct: 1 },
      { q: 'Qual frase está correta?', options: ['Him is my boss.', 'He is my boss.', 'His is my boss.'], correct: 1 }
    ],
    perguntas: [
      { q: 'Qual palavra abre uma pergunta de sim/não com "she"?', options: ['Do', 'Does', 'Did'], correct: 1 },
      { q: '"Where ___ she live?" — qual auxiliar?', options: ['do', 'does', 'did'], correct: 1 },
      { q: '"Who called you?" — por que sem "did"?', options: ['Erro gramatical', '"Who" é o sujeito', 'Regra antiga'], correct: 1 },
      { q: 'Forma correta de perguntar no passado:', options: ['Do you went?', 'Did you go?', 'Does you went?'], correct: 1 },
      { q: '"You\'re from Brazil, ___ ___?" — tag question', options: ["isn't it?", "aren't you?", "don't you?"], correct: 1 }
    ],
    negativa: [
      { q: '"She ___ like coffee." — presente, ação', options: ["don't", "doesn't", "isn't"], correct: 1 },
      { q: 'Corrija: "She doesn\'t likes pizza."', options: ["She don't like pizza.", "She doesn't like pizza.", "She isn't like pizza."], correct: 1 },
      { q: 'Negar no passado: "He went home."', options: ["He didn't went home.", "He didn't go home.", "He don't go home."], correct: 1 },
      { q: '"I ___ know anything." (nunca) — forma correta', options: ["don't never know", "never know", "never knew"], correct: 1 },
      { q: 'Qual usa dupla negação (errada em inglês padrão)?', options: ["I don't know anything.", "I never eat meat.", "I don't know nothing."], correct: 2 }
    ],
    passado: [
      { q: 'Passado de "go":', options: ['goed', 'went', 'gone'], correct: 1 },
      { q: '"I ___ (not/eat) breakfast today."', options: ["didn't ate", "didn't eat", "don't eat"], correct: 1 },
      { q: 'Passado de "have":', options: ['haved', 'had', 'has'], correct: 1 },
      { q: '"She ___ working when I arrived." (was/were)', options: ['were', 'was', 'is'], correct: 1 },
      { q: '"Did he call?" — resposta negativa curta:', options: ["No, he don't.", "No, he didn't.", "No, he doesn't."], correct: 1 }
    ],
    preposicoes: [
      { q: '"I live ___ Brazil."', options: ['on', 'in', 'at'], correct: 1 },
      { q: '"The meeting is ___ Monday."', options: ['in', 'on', 'at'], correct: 1 },
      { q: '"Class starts ___ 9am."', options: ['in', 'on', 'at'], correct: 2 },
      { q: '"She was born ___ 1990."', options: ['on', 'at', 'in'], correct: 2 },
      { q: 'Qual está ERRADA?', options: ["In the morning.", "At Monday.", "On July 4th."], correct: 1 }
    ],
    verbos: [
      { q: '"She ___ a doctor." (to be, presente)', options: ['am', 'is', 'are'], correct: 1 },
      { q: '"I ___ swim." (habilidade)', options: ['can', 'must', 'should'], correct: 0 },
      { q: '"You ___ rest." (conselho suave)', options: ['must', 'should', 'can'], correct: 1 },
      { q: '"Look ___ the word." (phrasal: pesquisar)', options: ['at', 'up', 'on'], correct: 1 },
      { q: 'Modal + verbo: qual está certo?', options: ["She can swims.", "She can swim.", "She cans swim."], correct: 1 }
    ],
    'soa1-alfabeto': [
      { q: 'Som da letra "A" em inglês:', options: ['ah', 'ei', 'aa'], correct: 1 },
      { q: 'Letra com nome "double-you":', options: ['V', 'W', 'U'], correct: 1 },
      { q: 'Som TH (think) em inglês:', options: ['d', 't', 'língua nos dentes'], correct: 2 },
      { q: '"Brazil" em inglês tem qual letra no lugar do S?', options: ['Z', 'C', 'SS'], correct: 0 },
      { q: 'Qual letra soa "ar" em inglês?', options: ['A', 'R', 'L'], correct: 1 }
    ],
    'soa1-numeros': [
      { q: 'Como escrever 13 em inglês?', options: ['thirty', 'thirteen', 'thirten'], correct: 1 },
      { q: 'Como escrever 40 em inglês? (atenção à grafia)', options: ['fourty', 'forty', 'forety'], correct: 1 },
      { q: 'O "segundo" em ordinal:', options: ['second', 'secondth', 'two'], correct: 0 },
      { q: 'Qual é a diferença entre "fifteen" e "fifty"?', options: ['São iguais', '15 vs 50', '50 vs 15'], correct: 1 },
      { q: 'Como se escreve 100?', options: ['a hundred', 'one hundred', 'Ambas corretas'], correct: 2 }
    ],
    'soa1-cumprimentos': [
      { q: 'Saudação para a tarde (12h–18h):', options: ['Good morning', 'Good afternoon', 'Good evening'], correct: 1 },
      { q: '"Good night" se usa:', options: ['Ao encontrar alguém à noite', 'Ao se despedir para dormir', 'Em qualquer horário'], correct: 1 },
      { q: 'Resposta para "How are you?":', options: ['I fine.', 'I am fine, thanks.', 'Yes, fine.'], correct: 1 },
      { q: '"Nice to meet you" — quando usar?', options: ['Ao se despedir', 'Ao conhecer alguém', 'Como agradecimento'], correct: 1 },
      { q: '"What\'s up?" é:', options: ['Formal', 'Ofensivo', 'Informal/casual'], correct: 2 }
    ],
    'soa1-tobe-afirm': [
      { q: '"I ___ Brazilian."', options: ['am', 'is', 'are'], correct: 0 },
      { q: '"She ___ from Rio."', options: ['am', 'is', 'are'], correct: 1 },
      { q: '"We ___ a team."', options: ['am', 'is', 'are'], correct: 2 },
      { q: 'Qual frase está correta?', options: ['He are my friend.', 'He is my friend.', 'He am my friend.'], correct: 1 },
      { q: 'Contração de "They are":', options: ["They're", "Theyre", "Their"], correct: 0 }
    ],
    'soa2-pronomes-sujeito': [
      { q: 'Pronome sujeito masculino singular:', options: ['Him', 'He', 'His'], correct: 1 },
      { q: 'Pronome para clima/situação: "___ is raining."', options: ['He', 'She', 'It'], correct: 2 },
      { q: '"Ana e eu" em inglês (ordem correta):', options: ['I and Ana', 'Me and Ana', 'Ana and I'], correct: 2 },
      { q: 'Pronome sujeito plural (eles/elas):', options: ['Them', 'Their', 'They'], correct: 2 },
      { q: 'Qual frase usa pronome errado?', options: ["She goes to school.", "Him is my teacher.", "They study together."], correct: 1 }
    ],
    'soa2-tobe-perg-neg': [
      { q: '"___ she at home?" (pergunta)', options: ['Do', 'Is', 'Are'], correct: 1 },
      { q: '"They ___ from here." (negativa)', options: ["isn't", "aren't", "don't"], correct: 1 },
      { q: 'Resposta negativa: "Is he tired?"', options: ["No, he don't.", "No, he isn't.", "No, he aren't."], correct: 1 },
      { q: '"Are you ready?" — resposta positiva curta:', options: ['Yes, I am.', 'Yes, I do.', 'Yes, I be.'], correct: 0 },
      { q: 'Qual pergunta está correta?', options: ['They are ready?', 'Are they ready?', 'Do they are ready?'], correct: 1 }
    ],
    'soa2-possessivos': [
      { q: '"This is ___ bag." (minha)', options: ['my', 'mine', 'me'], correct: 0 },
      { q: '"The bag is ___." (dela)', options: ['her', 'hers', 'she'], correct: 1 },
      { q: '"___ car is fast." (dele)', options: ['Him', 'His', 'He'], correct: 1 },
      { q: '"That coffee is ___." (seu, de você)', options: ['your', 'yours', 'you'], correct: 1 },
      { q: 'Qual está correto?', options: ["That is theirs house.", "That is their house.", "That house is their."], correct: 1 }
    ],
    'soa2-this-that': [
      { q: 'Objeto perto, singular:', options: ['this', 'these', 'that'], correct: 0 },
      { q: 'Objetos longe, plural:', options: ['this', 'that', 'those'], correct: 2 },
      { q: '"___ are my keys." (aqui, plural)', options: ['This', 'These', 'Those'], correct: 1 },
      { q: '"___ is your bag?" — escolha entre opções', options: ['What', 'Which', 'That'], correct: 1 },
      { q: '"Is ___ your car?" (longe)', options: ['this', 'these', 'that'], correct: 2 }
    ],
    'soa3-present-afirm': [
      { q: '"She ___ English." (speak)', options: ['speak', 'speaks', 'is speak'], correct: 1 },
      { q: '"He ___ French." (teach)', options: ['teachs', 'teaches', 'teached'], correct: 1 },
      { q: '"She ___ hard." (study)', options: ['studys', 'studies', 'studyes'], correct: 1 },
      { q: '"I ___ to the gym." (go, hábito)', options: ['goes', 'go', 'going'], correct: 1 },
      { q: '"She ___ not study on Sundays." (doesn\'t)', options: ["doesn't studies", "doesn't study", "don't study"], correct: 1 }
    ],
    'soa3-third-person-s': [
      { q: '"work" com "he":', options: ['work', 'works', 'workies'], correct: 1 },
      { q: '"go" com "she":', options: ['gos', 'goes', 'go'], correct: 1 },
      { q: '"carry" com "he":', options: ['carrys', 'carries', 'carrying'], correct: 1 },
      { q: '"have" com "she":', options: ['haves', 'have', 'has'], correct: 2 },
      { q: '"study" com "she" (negativa):', options: ["doesn't studies", "doesn't study", "don't studies"], correct: 1 }
    ],
    'soa3-frequencia': [
      { q: 'Posição de "always": "I ___ wake up early."', options: ['always (antes)', 'always (depois)', 'always (final)'], correct: 0 },
      { q: '"She is ___ late." — "never" vai:', options: ['antes de is', 'depois de is', 'no final'], correct: 1 },
      { q: 'Frequência ~40%:', options: ['always', 'never', 'sometimes'], correct: 2 },
      { q: '"She ___ complains." (raramente)', options: ['rarely complains', 'complains rarely', 'never complains'], correct: 0 },
      { q: 'Qual frase está correta?', options: ['He goes always to the gym.', 'He always goes to the gym.', 'Always he goes to the gym.'], correct: 1 }
    ],
    'soa4-wh-questions': [
      { q: '"___ is your name?"', options: ['Where', 'What', 'Who'], correct: 1 },
      { q: '"___ do you live?"', options: ['Where', 'When', 'Why'], correct: 0 },
      { q: '"___ does the class start?"', options: ['Where', 'When', 'Why'], correct: 1 },
      { q: '"___ much does it cost?"', options: ['How', 'What', 'Which'], correct: 0 },
      { q: 'Qual está correto?', options: ['Where you live?', 'Where do you live?', 'Where does you live?'], correct: 1 }
    ],
    'soa4-prep-tempo': [
      { q: '"My birthday is ___ July."', options: ['in', 'on', 'at'], correct: 0 },
      { q: '"The meeting is ___ Monday."', options: ['in', 'on', 'at'], correct: 1 },
      { q: '"Class starts ___ 9am."', options: ['in', 'on', 'at'], correct: 2 },
      { q: '"I study ___ the morning."', options: ['in', 'on', 'at'], correct: 0 },
      { q: '"She studies ___ night." (exceção!)', options: ['in', 'on', 'at'], correct: 2 }
    ],
    'soa4-rotina': [
      { q: '"Acordar" em inglês:', options: ['get up', 'wake up', 'stand up'], correct: 1 },
      { q: '"Tomar café" = have ou eat?', options: ['eat breakfast', 'have breakfast', 'do breakfast'], correct: 1 },
      { q: '"She ___ to work at 8." (go, presente, she)', options: ['go', 'goes', 'going'], correct: 1 },
      { q: '"I ___ home at 6." (come, presente, I)', options: ['come', 'comes', 'go'], correct: 0 },
      { q: '"Ir dormir" em inglês:', options: ['go to sleep', 'go to bed', 'Ambas corretas'], correct: 2 }
    ],
    'soa5-past-regular': [
      { q: '"walk" no passado:', options: ['walkt', 'walked', 'walking'], correct: 1 },
      { q: '"love" no passado:', options: ['loved', 'loveed', 'lovet'], correct: 0 },
      { q: '"stop" no passado:', options: ['stoped', 'stopped', 'stopd'], correct: 1 },
      { q: '"study" no passado:', options: ['studyed', 'studied', 'studid'], correct: 1 },
      { q: '"walked" se pronuncia como:', options: ['/walkɛd/', '/walkt/', '/walkd/'], correct: 1 }
    ],
    'soa5-past-perguntas': [
      { q: '"___ you sleep well?" (passado)', options: ['Do', 'Does', 'Did'], correct: 2 },
      { q: '"___ she call you?" (passado)', options: ['Do', 'Does', 'Did'], correct: 2 },
      { q: '"Where ___ you go yesterday?"', options: ['do', 'does', 'did'], correct: 2 },
      { q: 'Resposta negativa: "Did he come?"', options: ["No, he don't.", "No, he didn't.", "No, he doesn't."], correct: 1 },
      { q: '"Was she at the party?" — resposta positiva:', options: ['Yes, she was.', 'Yes, she did.', 'Yes, she is.'], correct: 0 }
    ],
    'soa5-past-negativa': [
      { q: '"She ___ go home." (negação passado)', options: ["didn't", "don't", "doesn't"], correct: 0 },
      { q: '"I didn\'t ___ there." (be, base)', options: ['was', 'be', 'am'], correct: 1 },
      { q: 'Corrija: "I didn\'t went to school."', options: ["I didn't go to school.", "I didn't gone to school.", "I not went to school."], correct: 0 },
      { q: '"He ___ at home." (was, negação)', options: ["wasn't", "weren't", "didn't was"], correct: 0 },
      { q: '"They ___ ready." (were, negação)', options: ["wasn't", "weren't", "didn't were"], correct: 1 }
    ],
    'soa6-can': [
      { q: '"I ___ swim."', options: ['can', 'cans', 'can to'], correct: 0 },
      { q: '"She ___ drive." (negação)', options: ["can not drive", "can't drive", "doesn't can drive"], correct: 1 },
      { q: '"___ you help me?" (pedido)', options: ['Do', 'Can', 'Should'], correct: 1 },
      { q: '"She can ___." (swim — forma correta)', options: ['swims', 'swimming', 'swim'], correct: 2 },
      { q: 'Qual usa "can" INCORRETAMENTE?', options: ["I can't go.", "She can swims.", "Can you open this?"], correct: 1 }
    ],
    'soa6-like-ing': [
      { q: '"I like ___." (dance)', options: ['dance', 'dancing', 'dances'], correct: 1 },
      { q: '"She loves ___." (cook)', options: ['cook', 'cooks', 'cooking'], correct: 2 },
      { q: '"I like go" → correto:', options: ['I like going.', 'I like to go.', 'Ambas corretas'], correct: 2 },
      { q: '"He hates ___." (wait)', options: ['wait', 'waiting', 'waits'], correct: 1 },
      { q: '"I ___ to learn." (want)', options: ['want', 'want to', 'wanting'], correct: 1 }
    ],
    'soa6-want-to': [
      { q: '"I ___ to travel." (want)', options: ['want', 'wants', 'wanting'], correct: 0 },
      { q: '"She ___ to study." (need)', options: ['need', 'needs', 'needing'], correct: 1 },
      { q: 'Corrija: "I want go home."', options: ['I want going home.', 'I want to go home.', 'I wants to go home.'], correct: 1 },
      { q: '"He decided ___ quit." (decide + to + base)', options: ['quit', 'to quit', 'quitting'], correct: 1 },
      { q: '"She is ___ to become a doctor." (try)', options: ['trying', 'try', 'tries'], correct: 0 }
    ]
  };

  const PEDAGOGICAL_EDITORIAL = {
    pronomes: {
      kicker: 'Trilha guiada',
      headline: 'Pronomes sem atrito: quem faz, quem recebe e de quem é cada coisa.',
      intro: 'Em vez de decorar listas soltas, esta aula organiza os pronomes pelo uso real. Primeiro você identifica o papel da palavra na frase. Depois compara, testa e fixa com prática curta.',
      journey: ['Quem faz a ação', 'Quem recebe a ação', 'Como mostrar posse'],
      sections: [
        {
          label: 'Bloco 1',
          focus: 'Sujeito',
          summary: 'Comece pelo papel mais importante da frase: quem executa a ação. Se a palavra vem antes do verbo e carrega a ação, ela precisa estar no grupo de sujeito.'
        },
        {
          label: 'Bloco 2',
          focus: 'Objeto',
          summary: 'Agora muda a lente: a pessoa não faz a ação, ela recebe. É aqui que brasileiros costumam travar ao trocar I por me, he por him, she por her.'
        },
        {
          label: 'Bloco 3',
          focus: 'Posse',
          summary: 'Por fim, você separa duas ideias que parecem iguais em português: dizer que algo é meu antes do objeto e dizer que aquilo é meu sem repetir o objeto.'
        }
      ],
      phases: {
        anchor: {
          kicker: 'Aquecimento',
          title: 'Leia a cena e complete como quem já entendeu o papel de cada pronome.',
          copy: 'Aqui a ideia não é acertar por acaso. É olhar para a frase e decidir: quem está fazendo a ação e quem está entrando depois da preposição?'
        },
        table: {
          kicker: 'Mapa rápido',
          title: 'Veja o quadro completo antes de avançar para a prática.',
          copy: 'Use esta tabela como folha de apoio. Ela junta significado em português, forma em inglês e um exemplo curto para você bater o olho e comparar.'
        },
        exercises: {
          kicker: 'Prática guiada',
          title: 'Agora a teoria vira decisão rápida.',
          copy: 'As questões foram organizadas do mais direto para o mais traiçoeiro. A ideia é ganhar critério, não apenas pontuar.'
        },
        test: {
          kicker: 'Fechamento',
          title: 'Valide se a lógica ficou clara sem depender da tabela.',
          copy: 'Se você passa aqui, significa que já consegue distinguir função na frase e escolher a forma certa com mais naturalidade. Quer ir além? Treine as frases em voz alta e conquiste o status Dominado.'
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
      ],
      phases: {
        anchor: {
          kicker: 'Aquecimento',
          title: 'Complete o diálogo de perguntas antes de ver a teoria.',
          copy: 'Tente identificar o auxiliar e a estrutura certa antes de consultar a tabela. Errar aqui é parte do processo.'
        },
        table: {
          kicker: 'Mapa rápido',
          title: 'Estrutura completa das perguntas em inglês.',
          copy: 'Compare as três situações: sim/não, perguntas abertas com wh- e tag questions. Veja o padrão em cada uma.'
        },
        exercises: {
          kicker: 'Prática guiada',
          title: 'Monte perguntas reais com os padrões aprendidos.',
          copy: 'Cada exercício testa uma decisão diferente: o auxiliar certo, a palavra certa, a ordem certa. Do automático ao reflexivo.'
        },
        test: {
          kicker: 'Fechamento',
          title: 'Valide se você consegue montar qualquer pergunta em inglês.',
          copy: 'Se você passa aqui, já sai desta aula capaz de abrir conversas sem travar na estrutura. Quer ir além? Treine as frases em voz alta.'
        }
      }
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
      ],
      phases: {
        anchor: {
          kicker: 'Aquecimento',
          title: 'Complete as cenas no passado antes de ver a explicação.',
          copy: 'Aqui você já vai encontrar verbos irregulares. Tente reconhecê-los pelo contexto antes de consultar a tabela.'
        },
        table: {
          kicker: 'Mapa rápido',
          title: 'Passado regular, irregular e continuous — lado a lado.',
          copy: 'Use esta tabela como referência enquanto pratica. Os irregulares mais frequentes estão aqui.'
        },
        exercises: {
          kicker: 'Prática guiada',
          title: 'Escolha a forma de passado correta em cada contexto.',
          copy: 'A chave é identificar: ação concluída (simple), verbo que foge do -ed (irregular) ou cena em andamento (was/were + -ing).'
        },
        test: {
          kicker: 'Fechamento',
          title: 'Valide se você navega os três tipos de passado sem consultar.',
          copy: 'Se você passa aqui, já consegue contar histórias no passado com naturalidade. Treine em voz alta para fixar os irregulares.'
        }
      }
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
        { label: 'Bloco 1', focus: 'To be', summary: 'A aula começa pelo verbo mais estrutural do inglês. Ele serve para identidade, estado, pergunta e várias outras construções que se espalham pelo idioma inteiro.' },
        { label: 'Bloco 2', focus: 'Modais', summary: 'Em seguida entram os verbos que ajustam poder, obrigação, conselho e possibilidade. O ponto central aqui é perceber que eles mexem no tom da frase inteira.' },
        { label: 'Bloco 3', focus: 'Phrasal verbs', summary: 'O fechamento assume um fato importante do inglês real: muitas ações do cotidiano aparecem em blocos de duas peças. O sentido não se deduz palavra por palavra.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete o diálogo com o verbo correto.', copy: 'Antes de ver a explicação, tente identificar qual verbo ou modal encaixa em cada lacuna.' },
        table: { kicker: 'Mapa rápido', title: 'Veja o quadro de verbos essenciais.', copy: 'Use esta tabela para comparar to be, modais e phrasal verbs lado a lado.' },
        exercises: { kicker: 'Prática guiada', title: 'Aplique o verbo certo em cada contexto.', copy: 'Cada exercício aumenta um pouco em complexidade. Pense na função do verbo antes de escolher.' },
        test: { kicker: 'Fechamento', title: 'Valide se você distingue to be, modais e phrasal verbs.', copy: 'Se você passa aqui, significa que já consegue escolher a estrutura verbal certa sem depender de tradução literal. Quer ir além? Treine as frases em voz alta e conquiste o status Dominado.' }
      }
    },
    'soa1-alfabeto': {
      kicker: 'Módulo 01 · PronúnciaMódulo 01 · Pronúncia',
      headline: 'As 26 letras que viram sons: o alfabeto inglês pelo nome e pela pronúncia.',
      intro: 'O nome de cada letra em inglês é diferente do português. Saber como cada uma soa é essencial para soletrar, entender siglas e reconhecer palavras de ouvido.',
      journey: ['Conhecer o nome de cada letra', 'Identificar os sons difíceis para brasileiros', 'Praticar soletrar nomes reais'],
      sections: [
        { label: 'Bloco 1', focus: 'As 26 letras', summary: 'Cada letra tem um nome fixo em inglês. Aqui você ouve e repete todas elas.' },
        { label: 'Bloco 2', focus: 'Sons difíceis', summary: 'Algumas letras enganam o brasileiro: G, H, J, R, W, Y e Z soam completamente diferentes do português.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete a frase com a letra correta.', copy: 'Tente identificar as letras pelo som antes de ver a tabela.' },
        table: { kicker: 'Mapa rápido', title: 'As letras mais confusas para brasileiros.', copy: 'Clique em cada linha para ouvir o nome da letra e um exemplo.' },
        exercises: { kicker: 'Prática guiada', title: 'Escolha a resposta correta sobre pronúncia.', copy: 'Do mais direto ao mais sutil — cada questão treina uma distinção real.' },
        test: { kicker: 'Fechamento', title: 'Valide seu conhecimento do alfabeto inglês.', copy: 'Se você passa aqui, já consegue soletrar e identificar letras no inglês real.' }
      }
    },
    'soa1-numeros': {
      kicker: 'Módulo 01 · Vocabulário',
      headline: 'De 1 a 100: números com pronúncia, ordinais e o detalhe que muda tudo.',
      intro: 'Números em inglês têm armadilhas reais: "fifteen" vs "fifty", "forty" sem o "u". Esta aula resolve esses pontos com clareza.',
      journey: ['Números de 1 a 20', 'Dezenas: twenty a hundred', 'Ordinais: first, second, third…'],
      sections: [
        { label: 'Bloco 1', focus: '1 a 20', summary: 'A base. 1-12 são irregulares, 13-19 seguem o padrão teen.' },
        { label: 'Bloco 2', focus: 'Dezenas e ordinais', summary: 'De 20 em diante com o padrão -ty, e os ordinais para sequências.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete com o número escrito por extenso.', copy: 'Tente escrever os números antes de ver a tabela.' },
        table: { kicker: 'Mapa rápido', title: 'Números com regras e exceções.', copy: 'Preste atenção em "forty" (sem u), "twelve" (irregular) e teen vs ty.' },
        exercises: { kicker: 'Prática guiada', title: 'Reconheça e diferencie os números.', copy: 'O foco aqui são as confusões mais comuns: teen/ty e grafia irregular.' },
        test: { kicker: 'Fechamento', title: 'Valide números e ordinais.', copy: 'Se você passa aqui, já consegue usar números em conversas reais.' }
      }
    },
    'soa1-cumprimentos': {
      kicker: 'Módulo 01 · Situações reais',
      headline: 'Bom dia, boa tarde, tchau: como cumprimentar sem errar o horário.',
      intro: 'Saudações em inglês variam pelo horário e contexto. Esta aula cobre todos os momentos: chegada, apresentação e despedida — formal e informal.',
      journey: ['Saudações por horário', 'Apresentação pessoal', 'Despedidas naturais'],
      sections: [
        { label: 'Bloco 1', focus: 'Cumprimentos por horário', summary: 'Good morning, Good afternoon, Good evening — cada um tem seu momento.' },
        { label: 'Bloco 2', focus: 'Apresentação e despedida', summary: 'How are you? Nice to meet you. See you later. — o ciclo completo de uma interação.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete o diálogo de saudação.', copy: 'Como você cumprimentaria alguém às 8h? Como responderia?' },
        table: { kicker: 'Mapa rápido', title: 'Saudações por situação.', copy: 'Cada linha cobre um momento diferente: chegada, cortesia e despedida.' },
        exercises: { kicker: 'Prática guiada', title: 'Escolha a saudação certa para cada cena.', copy: 'Contexto importa: "Good night" não é o mesmo que "Good evening".' },
        test: { kicker: 'Fechamento', title: 'Valide cumprimentos em inglês.', copy: 'Se você passa aqui, já sabe navegar desde a entrada até a despedida em qualquer horário.' }
      }
    },
    'soa1-tobe-afirm': {
      kicker: 'Módulo 01 · Gramática',
      headline: 'Am, is, are: o verbo que a maioria subestima mas usa todo segundo.',
      intro: 'To be é o verbo mais frequente do inglês. Ele une sujeito com identidade, estado e característica — e cada sujeito tem sua forma específica.',
      journey: ['Conjugação am/is/are', 'Formas contraídas', 'Uso em frases reais'],
      sections: [
        { label: 'Bloco 1', focus: 'Am / Is / Are', summary: 'I = am, he/she/it = is, you/we/they = are. A base do idioma.' },
        { label: 'Bloco 2', focus: 'Contrações', summary: "I'm, you're, he's, she's, it's, we're, they're — como falantes nativos realmente falam." }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete o diálogo com a forma correta de "to be".', copy: 'Antes de ver a tabela, tente lembrar qual forma vai com cada sujeito.' },
        table: { kicker: 'Mapa rápido', title: 'Conjugação completa do to be.', copy: 'Oito combinações possíveis — clique em cada linha para ouvir.' },
        exercises: { kicker: 'Prática guiada', title: 'Escolha am, is ou are.', copy: 'Do singular ao plural, do positivo ao erro clássico de brasileiro.' },
        test: { kicker: 'Fechamento', title: 'Valide to be no presente.', copy: 'Se você passa aqui, já usa am/is/are sem hesitar.' }
      }
    },
    'soa2-pronomes-sujeito': {
      kicker: 'Módulo 02 · Gramática',
      headline: 'I, you, he, she, it, we, they: os oito pronomes que puxam toda frase.',
      intro: 'Em inglês toda frase precisa de um sujeito explícito. Esta aula fixa os oito pronomes sujeito e explica por que "It is raining" existe onde o português diz apenas "Está chovendo".',
      journey: ['Os oito pronomes sujeito', 'Uso obrigatório em inglês', 'Diferença entre he/she e it'],
      sections: [
        { label: 'Bloco 1', focus: 'Os 8 pronomes', summary: 'I, you, he, she, it, we, you, they — cada um com seu uso específico.' },
        { label: 'Bloco 2', focus: 'Pronome obrigatório', summary: 'Diferente do português, inglês não admite frase sem sujeito explícito.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Qual pronome substitui esse nome?', copy: 'Antes de ver a tabela, tente identificar o pronome correto para cada sujeito.' },
        table: { kicker: 'Mapa rápido', title: 'Os oito pronomes sujeito em contexto.', copy: 'Cada linha mostra o pronome, o português e um exemplo de uso real.' },
        exercises: { kicker: 'Prática guiada', title: 'Escolha o pronome sujeito correto.', copy: 'Foco nos erros mais comuns: Him/He, It para tempo/clima, ordem "Ana and I".' },
        test: { kicker: 'Fechamento', title: 'Valide pronomes sujeito.', copy: 'Se você passa aqui, já substitui nomes por pronomes sem hesitar.' }
      }
    },
    'soa2-tobe-perg-neg': {
      kicker: 'Módulo 02 · Gramática',
      headline: 'Is she? Aren\'t they? To be em perguntas e negativas.',
      intro: 'Depois de afirmar com am/is/are, esta aula ensina a inverter a estrutura para perguntar e negar — com e sem contrações.',
      journey: ['Inversão para perguntar', 'Negação com not', 'Respostas curtas'],
      sections: [
        { label: 'Bloco 1', focus: 'Perguntas', summary: 'Basta inverter: Is she a teacher? Are they from Brazil?' },
        { label: 'Bloco 2', focus: 'Negativas', summary: "I'm not, she isn't, they aren't — três formas, todas úteis." }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete a pergunta e a resposta.', copy: 'Tente montar a estrutura antes de ver o padrão.' },
        table: { kicker: 'Mapa rápido', title: 'To be em perguntas e negativas.', copy: 'Lado a lado: afirmativa, interrogativa e negativa para cada sujeito.' },
        exercises: { kicker: 'Prática guiada', title: 'Forme perguntas e negativas corretamente.', copy: 'Do simples ao sutil — inclui respostas curtas e tag questions.' },
        test: { kicker: 'Fechamento', title: 'Valide to be interrogativo e negativo.', copy: 'Se você passa aqui, já consegue perguntar e negar com to be naturalmente.' }
      }
    },
    'soa2-possessivos': {
      kicker: 'Módulo 02 · Gramática',
      headline: 'Meu, teu, dele, dela: dois jeitos de mostrar posse em inglês.',
      intro: 'Inglês tem dois grupos de possessivos: um que fica antes do substantivo (my, your, his…) e um que fica sozinho (mine, yours, his…). Esta aula separa os dois com clareza.',
      journey: ['Possessivos adjetivos (my/your…)', 'Possessivos pronomes (mine/yours…)', 'Quando usar cada um'],
      sections: [
        { label: 'Bloco 1', focus: 'Antes do nome', summary: 'my bag, your car, his book — o possessivo "cola" no substantivo.' },
        { label: 'Bloco 2', focus: 'Sozinho', summary: 'mine, yours, his, hers, ours, theirs — quando o substantivo já foi dito.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete a frase de posse.', copy: 'Tente identificar se o substantivo aparece ou não na frase — isso determina qual forma usar.' },
        table: { kicker: 'Mapa rápido', title: 'Possessivos: antes do nome vs sozinhos.', copy: 'Seis sujeitos, dois grupos cada — o padrão fica claro nesta tabela.' },
        exercises: { kicker: 'Prática guiada', title: 'Escolha my/mine, your/yours…', copy: 'O segredo é ver se o substantivo ainda aparece na frase ou não.' },
        test: { kicker: 'Fechamento', title: 'Valide possessivos.', copy: 'Se você passa aqui, já não confunde "her" com "hers" nem "your" com "yours".' }
      }
    },
    'soa2-this-that': {
      kicker: 'Módulo 02 · Vocabulário',
      headline: 'This, that, these, those: perto ou longe, um ou vários.',
      intro: 'Demonstrativos em inglês funcionam por dois eixos: distância (perto/longe) e número (singular/plural). Esta aula organiza as quatro formas com exemplos do cotidiano.',
      journey: ['This/these (perto)', 'That/those (longe)', 'Uso em perguntas e apresentações'],
      sections: [
        { label: 'Bloco 1', focus: 'This / These', summary: 'Perto de você: this (singular) e these (plural).' },
        { label: 'Bloco 2', focus: 'That / Those', summary: 'Longe: that (singular) e those (plural).' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete com o demonstrativo correto.', copy: 'Perto ou longe? Singular ou plural? Tente antes de ver a tabela.' },
        table: { kicker: 'Mapa rápido', title: 'Quatro demonstrativos, dois eixos.', copy: 'Distância × número — simples e sistemático.' },
        exercises: { kicker: 'Prática guiada', title: 'Escolha this, that, these ou those.', copy: 'Cada questão ativa um eixo diferente: foco na lógica, não na memorização.' },
        test: { kicker: 'Fechamento', title: 'Valide demonstrativos.', copy: 'Se você passa aqui, já aponta coisas em inglês sem hesitar.' }
      }
    },
    'soa3-present-afirm': {
      kicker: 'Módulo 03 · Gramática',
      headline: 'Verbo no presente: hábitos, fatos e a regra do -s que brasileiros esquecem.',
      intro: 'O present simple afirmativo expressa hábitos e fatos. A única complicação é o -s na 3ª pessoa — mas mesmo aí existe lógica para quando adicionar -s, -es ou -ies.',
      journey: ['Forma base com I/you/we/they', 'A regra do -s/-es/-ies com he/she/it', 'Quando usar present simple'],
      sections: [
        { label: 'Bloco 1', focus: 'Base e 3ª pessoa', summary: 'A maioria dos verbos só ganha um -s. Mas -ch, -sh, -x, -o pedem -es e consoante+y vira -ies.' },
        { label: 'Bloco 2', focus: 'Quando usar', summary: 'Hábitos, rotinas, fatos científicos — o present simple é para o que é verdade de forma geral.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete com o verbo no present simple.', copy: 'Preste atenção no sujeito: I/you precisam de base, she/he precisam de +s.' },
        table: { kicker: 'Mapa rápido', title: 'Regras da 3ª pessoa.', copy: 'Cada linha mostra a terminação do verbo e a regra que se aplica.' },
        exercises: { kicker: 'Prática guiada', title: 'Conjuge o verbo no present simple.', copy: 'Do mais simples ao mais sutil — foco na 3ª pessoa e nas irregularidades.' },
        test: { kicker: 'Fechamento', title: 'Valide present simple afirmativo.', copy: 'Se você passa aqui, já aplica o -s/-es/-ies automaticamente.' }
      }
    },
    'soa3-third-person-s': {
      kicker: 'Módulo 03 · Gramática',
      headline: 'He works, she teaches, it flies: as regras do -s na 3ª pessoa.',
      intro: 'Detalhe que distingue iniciantes de intermediários: adicionar o -s/-es/-ies no lugar certo — e entender as exceções "have → has" e "do → does".',
      journey: ['+s (maioria)', '+es (terminações especiais)', '-y → ies e irregulares'],
      sections: [
        { label: 'Bloco 1', focus: '+s / +es / -ies', summary: 'Três regras, quase todos os verbos cobertas.' },
        { label: 'Bloco 2', focus: 'Irregulares', summary: '"have → has" e "do → does" são as únicas exceções relevantes.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Qual é a forma correta com "she"?', copy: 'Tente identificar a regra antes de ver a tabela.' },
        table: { kicker: 'Mapa rápido', title: 'Regras da 3ª pessoa: +s, +es, -ies.', copy: 'Cada linha mostra a terminação do verbo e o que acontece.' },
        exercises: { kicker: 'Prática guiada', title: 'Conjuge corretamente.', copy: 'Foco nos erros de brasileiro: -ch/-sh, -y e os dois irregulares.' },
        test: { kicker: 'Fechamento', title: 'Valide 3ª pessoa do present simple.', copy: 'Se você passa aqui, já conjuga sem pensar.' }
      }
    },
    'soa3-frequencia': {
      kicker: 'Módulo 03 · Vocabulário',
      headline: 'Always, never, sometimes: dizer com que frequência você faz algo.',
      intro: 'Advérbios de frequência em inglês têm uma posição fixa na frase. Esta aula ensina os seis principais e onde cada um deve ir.',
      journey: ['Os seis advérbios: always → never', 'Posição: antes do verbo principal', 'Exceção: depois de to be'],
      sections: [
        { label: 'Bloco 1', focus: 'Os advérbios', summary: 'always, usually, often, sometimes, rarely, never — do mais ao menos frequente.' },
        { label: 'Bloco 2', focus: 'Posição na frase', summary: 'Antes do verbo principal, mas depois de to be — regra simples, efeito imediato.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete com o advérbio correto.', copy: 'Identifique a frequência descrita e onde o advérbio deve ir na frase.' },
        table: { kicker: 'Mapa rápido', title: 'Frequência e posição na frase.', copy: 'Cada linha mostra o advérbio, a frequência percentual e um exemplo de posição.' },
        exercises: { kicker: 'Prática guiada', title: 'Posicione o advérbio corretamente.', copy: 'Foco na posição — erro mais comum do brasileiro neste tema.' },
        test: { kicker: 'Fechamento', title: 'Valide advérbios de frequência.', copy: 'Se você passa aqui, já usa always/never/sometimes no lugar certo.' }
      }
    },
    'soa4-wh-questions': {
      kicker: 'Módulo 04 · Gramática',
      headline: 'What, where, who, when, why, how: as perguntas que guiam conversas.',
      intro: 'Cada wh- word puxa um tipo de informação. Esta aula organiza as oito principais e mostra como montar a pergunta completa com a estrutura correta.',
      journey: ['What / Where / Who / When / Why / How', 'How much vs How many', 'Estrutura completa da pergunta'],
      sections: [
        { label: 'Bloco 1', focus: 'As 6 wh- principais', summary: 'What, Where, Who, When, Why, How — cada uma puxa um tipo de dado.' },
        { label: 'Bloco 2', focus: 'How much / many', summary: 'How much (incontável) vs How many (contável) — distinção importante para preço e quantidade.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Qual wh- word completa cada pergunta?', copy: 'Identifique que tipo de informação é pedida para escolher a palavra certa.' },
        table: { kicker: 'Mapa rápido', title: 'Oito wh- words com uso e exemplo.', copy: 'Clique em cada linha para ouvir a pergunta.' },
        exercises: { kicker: 'Prática guiada', title: 'Forme perguntas com wh- words.', copy: 'Do simples ao completo — cada questão exercita uma palavra diferente.' },
        test: { kicker: 'Fechamento', title: 'Valide wh- questions.', copy: 'Se você passa aqui, já abre perguntas abertas em inglês naturalmente.' }
      }
    },
    'soa4-prep-tempo': {
      kicker: 'Módulo 04 · Gramática',
      headline: 'In July, on Monday, at 3pm: as três preposições de tempo que nunca mudam.',
      intro: 'A lógica é simples: in para períodos amplos (meses, anos), on para dias, at para horas. Uma exceção: "at night".',
      journey: ['in + mês/ano/estação/período', 'on + dia', 'at + hora (exceção: at night)'],
      sections: [
        { label: 'Bloco 1', focus: 'In / On / At', summary: 'Três preposições, três níveis de especificidade no tempo.' },
        { label: 'Bloco 2', focus: 'Exceções', summary: '"at night" quebra o padrão de "in" para período. Mais nada para decorar.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Qual preposição de tempo encaixa?', copy: 'Identifique: é um mês (in), um dia (on) ou uma hora (at)?' },
        table: { kicker: 'Mapa rápido', title: 'In, on, at: quando usar cada um.', copy: 'Cada linha mostra a situação e o exemplo correspondente.' },
        exercises: { kicker: 'Prática guiada', title: 'Escolha in, on ou at.', copy: 'Foco nas distinções e na exceção "at night".' },
        test: { kicker: 'Fechamento', title: 'Valide preposições de tempo.', copy: 'Se você passa aqui, já usa in/on/at sem hesitar em datas e horários.' }
      }
    },
    'soa4-rotina': {
      kicker: 'Módulo 04 · Vocabulário',
      headline: 'Wake up, have breakfast, go to bed: os verbos da rotina diária.',
      intro: 'Esta aula junta os verbos que descrevem um dia típico em inglês — com as colocações certas (have breakfast, não do breakfast) e a ordem natural de apresentação.',
      journey: ['Da manhã até a noite', 'Colocações corretas (have vs do vs make)', 'Present simple para descrever rotina'],
      sections: [
        { label: 'Bloco 1', focus: 'Manhã e trabalho', summary: 'wake up, get up, have breakfast, go to work — as primeiras horas do dia.' },
        { label: 'Bloco 2', focus: 'Tarde e noite', summary: 'have lunch, come home, have dinner, go to bed — a segunda metade da rotina.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete a rotina.', copy: 'Qual verbo descreve cada momento do dia?' },
        table: { kicker: 'Mapa rápido', title: 'Verbos de rotina do início ao fim do dia.', copy: 'Oito verbos com significado e exemplo de uso.' },
        exercises: { kicker: 'Prática guiada', title: 'Escolha o verbo certo para cada momento.', copy: 'Foco nas colocações corretas e nas 3ªs pessoas.' },
        test: { kicker: 'Fechamento', title: 'Valide verbos de rotina.', copy: 'Se você passa aqui, já descreve sua rotina diária em inglês.' }
      }
    },
    'soa5-past-regular': {
      kicker: 'Módulo 05 · Gramática',
      headline: 'Walked, loved, stopped: as regras do passado regular.',
      intro: 'O passado em inglês parece simples — afinal, basta adicionar -ed. Mas há três variações ortográficas, três pronúncias diferentes para o -ed e um grupo inteiro de verbos que não seguem regra nenhuma. Esta lição organiza tudo isso em partes: primeiro a forma previsível, depois os irregulares mais usados.',
      journey: ['Base + ed (maioria)', 'Terminações especiais', 'Pronúncia de -ed'],
      sections: [
        { label: 'Bloco 1', focus: 'Regras de formação', summary: '+ed para a maioria, +d para verbos em -e, -ied para consoante+y, dobrar para CVC curto.' },
        { label: 'Bloco 2', focus: 'Pronúncia do -ed', summary: '/t/, /d/ ou /ɪd/ — depende do som final do verbo.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Coloque o verbo no passado.', copy: 'Tente aplicar a regra antes de ver a tabela.' },
        table: { kicker: 'Mapa rápido', title: 'Regras do passado regular.', copy: 'Cada linha mostra uma terminação e a regra que se aplica.' },
        exercises: { kicker: 'Prática guiada', title: 'Forme o passado regular corretamente.', copy: 'Do simples ao sutil — inclui pronúncia do -ed.' },
        test: { kicker: 'Fechamento', title: 'Valide passado regular.', copy: 'Se você passa aqui, já forma o passado regular sem errar.' }
      }
    },
    'soa5-past-perguntas': {
      kicker: 'Módulo 05 · Gramática',
      headline: 'Did you go? Where did she work? Perguntas no passado simples.',
      intro: '"Did" é o auxiliar do passado para perguntas — igual para todos os sujeitos. Depois de "did", o verbo principal volta à forma base.',
      journey: ['Did + sujeito + base?', 'Wh- + did + sujeito + base?', 'Respostas curtas com did/didn\'t'],
      sections: [
        { label: 'Bloco 1', focus: 'Estrutura com Did', summary: '"Did" abre a pergunta. Verbo principal fica na base.' },
        { label: 'Bloco 2', focus: 'Wh- + did', summary: 'What did you do? Where did she go? — wh- word + did + base.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete a pergunta no passado.', copy: 'Qual auxiliar abre uma pergunta de passado? E qual forma fica no verbo principal?' },
        table: { kicker: 'Mapa rápido', title: 'Estrutura de perguntas no passado.', copy: 'Sim/não e wh- questions lado a lado.' },
        exercises: { kicker: 'Prática guiada', title: 'Forme perguntas corretamente no passado.', copy: 'Foco em "did + base" e no uso de was/were para to be no passado.' },
        test: { kicker: 'Fechamento', title: 'Valide perguntas no passado.', copy: 'Se você passa aqui, já pergunta sobre o passado sem errar o auxiliar.' }
      }
    },
    'soa5-past-negativa': {
      kicker: 'Módulo 05 · Gramática',
      headline: 'Didn\'t go, wasn\'t there: negar no passado sem errar o verbo.',
      intro: '"Didn\'t" + base é a fórmula para negar ações no passado. "Wasn\'t / weren\'t" para to be. E o erro clássico "didn\'t went" se resolve aqui de uma vez.',
      journey: ["didn't + base (ações)", "wasn't / weren't (to be)", 'Erro clássico: didn\'t went → didn\'t go'],
      sections: [
        { label: 'Bloco 1', focus: "Didn't + base", summary: '"Didn\'t" já carrega passado. O verbo principal volta à base.' },
        { label: 'Bloco 2', focus: "Wasn't / weren't", summary: 'To be no passado tem sua própria negação: wasn\'t e weren\'t.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete a negação no passado.', copy: 'Tente identificar a estrutura correta antes de ver a tabela.' },
        table: { kicker: 'Mapa rápido', title: 'Negação no passado: ações e to be.', copy: 'Lado a lado: didn\'t e wasn\'t/weren\'t.' },
        exercises: { kicker: 'Prática guiada', title: 'Negue corretamente no passado.', copy: 'Foco no erro "didn\'t went" e na diferença entre didn\'t e wasn\'t.' },
        test: { kicker: 'Fechamento', title: 'Valide negação no passado.', copy: 'Se você passa aqui, já nega no passado sem cair no erro clássico.' }
      }
    },
    'soa6-can': {
      kicker: 'Módulo 06 · Gramática',
      headline: 'Can you swim? I can\'t drive: habilidade e possibilidade com can.',
      intro: 'Modais como "can" são ferramentas de ajuste de tom: a mesma ideia muda de peso dependendo do modal que você usa. "Can" abre possibilidade e habilidade. Entender como ele funciona — e que ele nunca leva -s nem "to" depois — é a base para usar todos os outros modais com segurança.',
      journey: ['can + base (habilidade)', "can't (negação)", 'Can...? (pedido e pergunta)'],
      sections: [
        { label: 'Bloco 1', focus: 'Can afirmativo e negativo', summary: 'I can swim. She can\'t drive. Mesma regra para todos.' },
        { label: 'Bloco 2', focus: 'Can em perguntas', summary: 'Can you help me? — pedido educado e pergunta de habilidade.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete com can ou can\'t.', copy: 'Habilidade positiva ou negativa? O verbo depois sempre fica na base.' },
        table: { kicker: 'Mapa rápido', title: 'Can: usos e estrutura.', copy: 'Afirmativo, negativo e interrogativo com exemplos reais.' },
        exercises: { kicker: 'Prática guiada', title: 'Use can corretamente.', copy: 'Foco em "can + base" (nunca can to swim ou can swims).' },
        test: { kicker: 'Fechamento', title: 'Valide can.', copy: 'Se você passa aqui, já usa can sem pensar.' }
      }
    },
    'soa6-like-ing': {
      kicker: 'Módulo 06 · Gramática',
      headline: 'I like dancing, she loves cooking: verbos seguidos de -ing.',
      intro: '"Like", "love", "enjoy" e "hate" são seguidos de verbo com -ing. Esta aula também mostra a fronteira com "want to", que segue a regra diferente.',
      journey: ['like/love/enjoy/hate + -ing', 'want/need/decide + to + base', 'Diferença de estrutura'],
      sections: [
        { label: 'Bloco 1', focus: 'Like/love + -ing', summary: 'I like reading. She loves dancing. They enjoy cooking.' },
        { label: 'Bloco 2', focus: 'Want/need + to', summary: 'I want to go. She needs to study. — estrutura diferente de like.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete com o verbo na forma correta.', copy: 'Like/love/enjoy → -ing. Want/need → to + base.' },
        table: { kicker: 'Mapa rápido', title: 'Verbos + -ing vs Verbos + to.', copy: 'Dois grupos com exemplos — clique para ouvir.' },
        exercises: { kicker: 'Prática guiada', title: 'Escolha -ing ou to + base.', copy: 'O segredo é saber de qual família o verbo principal faz parte.' },
        test: { kicker: 'Fechamento', title: 'Valide like + -ing.', copy: 'Se você passa aqui, já não confunde "I like go" com "I like going".' }
      }
    },
    'soa6-want-to': {
      kicker: 'Módulo 06 · Gramática',
      headline: 'I want to travel, she needs to study: verbos seguidos de to + base.',
      intro: '"Want", "need", "decide" e "try" pedem "to" antes do próximo verbo. Esta é a outra família — diferente de like/love que pedem -ing.',
      journey: ['want/need/decide/try + to + base', 'Erro: want + base ou want + -ing', 'Uso no cotidiano'],
      sections: [
        { label: 'Bloco 1', focus: 'Want/need + to', summary: 'I want to travel. She needs to call. He decided to leave.' },
        { label: 'Bloco 2', focus: 'Erro clássico', summary: '"I want go" ou "I want going" — ambos errados. "I want to go" é o único caminho.' }
      ],
      phases: {
        anchor: { kicker: 'Aquecimento', title: 'Complete com "to" ou "-ing".', copy: 'Want/need/decide sempre pedem "to". Like/love/enjoy sempre pedem "-ing".' },
        table: { kicker: 'Mapa rápido', title: 'Verbos + to + base.', copy: 'Quatro verbos principais dessa família com exemplos.' },
        exercises: { kicker: 'Prática guiada', title: 'Forme frases com want/need/decide.', copy: 'Foco no erro clássico: want + base vs want + to + base.' },
        test: { kicker: 'Fechamento', title: 'Valide want to + base.', copy: 'Se você passa aqui, já não diz "I want go" nem "I want going".' }
      }
    }
  };

  const GRILO_COACH_GUIDES = {
    pronomes: {
      anchor: 'Olhe só a posição da lacuna. Antes do verbo costuma morar quem faz; depois de "with" mora quem acompanha ou recebe a ação.',
      scaffolded: 'Antes de tocar nas opções, abra três gavetas na cabeça: quem faz, quem recebe e de quem é.',
      finalTest: [
        'Pergunte o papel de "me" na cena: ele não puxa o verbo, ele recebe a ligação.',
        'Depois de preposição como "for", o inglês chama a forma que recebe, não a forma que manda no verbo.',
        'Antes de "am", você precisa da forma que entra como sujeito. Objeto e posse não encaixam aí.'
      ],
      sections: {
        'quem-faz': {
          content: 'Brasileirando: aqui você caça o personagem principal da frase. Se a palavrinha empurra o verbo, ela entrou no time do sujeito.',
          exercise: 'Colinha: antes do verbo mora quem faz. Se uma opção parece posse ou alguém recebendo algo, ela já nasce suspeita.'
        },
        'quem-recebe': {
          content: 'Pensa no português falado: não é quem faz, é quem leva a ligação, a ajuda ou o convite. Esse pedaço do inglês gosta de aparecer depois do verbo ou da preposição.',
          exercise: 'Colinha: verbo ou preposição acendem alerta de objeto. Se a frase tiver "for", "with", "to" ou "help", procure a forma que recebe a ação.'
        },
        'de-quem-e': {
          content: 'Aqui a pergunta é só uma: o objeto ainda aparece na frase ou já sumiu? Se o nome está ali, a posse vai grudada nele; se sumiu, a posse anda sozinha.',
          exercise: 'Colinha: posse colada no substantivo é uma família; posse no fim da frase é outra. Primeiro veja se o objeto ainda está escrito.'
        }
      }
    },
    perguntas: {
      sections: {
        'pergunta-simou-nao': {
          content: 'Inglês não gosta de pergunta no improviso. Quase sempre ele abre a frase com uma muleta: do, does ou did.',
          exercise: 'Colinha: troque o sujeito pelo pronome-resumo antes de decidir o auxiliar. Depois deixe o verbo principal pelado, sem -s e sem -ed.'
        },
        'palavras-de-pergunta': {
          content: 'Primeiro escolha o tipo de informação que você quer puxar: lugar, tempo, motivo, pessoa ou quantidade. Depois encaixe o resto da frase no trilho.',
          exercise: 'Colinha: decida o assunto da pergunta antes de olhar para o auxiliar. Se "who" for a própria pessoa que faz a ação, ele pode ir direto no verbo.'
        },
        'perguntinhas-ne': {
          content: 'Isso aqui é o nosso "né?" com espelho. A frase fala uma coisa e o rabinho vem do lado oposto para pedir confirmação.',
          exercise: 'Colinha: não invente um auxiliar novo. Repita o que a frase já usou e só vire o sinal: positivo chama negativo, negativo chama positivo.'
        }
      }
    },
    negativa: {
      sections: {
        'negar-ser-estar': {
          content: 'Quando a frase usa am, is ou are, o inglês não pede ajudante. O próprio verbo já segura o não.',
          exercise: 'Colinha: com to be, o não cola no próprio verbo. Se apareceu don\'t/doesn\'t, desconfie na hora.'
        },
        'negar-acoes-presente': {
          content: 'Aqui o inglês joga o "não" num ajudante. O verbo principal fica magro, sem marca extra.',
          exercise: 'Colinha: don\'t e doesn\'t carregam o peso da negativa. O verbo depois deles volta para a forma base.'
        },
        'negar-passado': {
          content: 'Didn\'t já entrega passado e negação ao mesmo tempo. Por isso o verbo principal volta zerado, como no dicionário.',
          exercise: 'Colinha: se o passado já apareceu no auxiliar, não repita passado no verbo. Didn\'t + base é o caminho limpo.'
        },
        'never-nobody-nothing': {
          content: 'Essas palavras já nascem negativas. Quando elas entram, a frase não precisa de outro "não" junto.',
          exercise: 'Colinha: escolha entre "palavra negativa" ou "don\'t + anything". Os dois juntos pesam demais e viram erro no inglês padrão.'
        }
      }
    },
    passado: {
      sections: {
        'passado-simples-regular': {
          content: 'Se a cena acabou, o inglês costuma fechar com -ed. É o pacote básico para contar fato concluído.',
          exercise: 'Colinha: pense em ação encerrada. Se o verbo é regular, olhe se ele só ganhou -ed, trocou y por ied ou dobrou a consoante final.'
        },
        'verbos-irregulares': {
          content: 'Os irregulares fogem do -ed, mas não fogem da lógica. Na negativa e na pergunta, todos voltam para a base com did.',
          exercise: 'Colinha: no afirmativo você lembra a forma irregular; com did/didn\'t, a fantasia cai e o verbo volta ao normal.'
        },
        'estava-acontecendo': {
          content: 'Pensa em filme: uma ação era o fundo da cena e outra entrou cortando. O fundo vai em was/were + ing.',
          exercise: 'Colinha: ache primeiro o que estava rolando por mais tempo. Essa parte pede was/were + ing; o corte pontual fica no passado simples.'
        }
      }
    },
    preposicoes: {
      sections: {
        'lugar-in-on-at': {
          content: 'Imagine três cenas: dentro da caixa, em cima da superfície ou num pontinho do mapa. In, on e at seguem esse desenho mental.',
          exercise: 'Colinha: pergunte se o lugar parece interior, superfície ou ponto específico. A preposição quase sempre cai dessa imagem.'
        },
        'tempo-in-on-at': {
          content: 'A mesma lógica vira calendário: período grande, dia marcado ou hora exata. O inglês reaproveita o mesmo mapa.',
          exercise: 'Colinha: mês, ano e estação costumam abrir espaço para in; dias puxam on; relógio e momento exato puxam at.'
        },
        'movimento-to-from': {
          content: 'Pergunta de movimento é sempre isso: indo para, vindo de, entrando, saindo? Cada resposta chama uma preposição diferente.',
          exercise: 'Colinha: primeiro descubra a direção do movimento. Destino, origem, entrada e saída quase nunca usam a mesma palavrinha.'
        }
      }
    },
    verbos: {
      sections: {
        'to-be': {
          content: 'To be é o coringa do inglês: identidade, estado, idade, horário e pergunta. Ele faz muita coisa sozinho.',
          exercise: 'Colinha: se a frase fala de ser, estar, idade, hora ou condição, veja se o verbo principal já é o próprio to be.'
        },
        'can-must-should': {
          content: 'Aqui você não escolhe tempo; escolhe força. Pode, deve, deveria, talvez: o modal muda o peso da frase inteira.',
          exercise: 'Colinha: modal não leva -s e não chama to depois dele. Primeiro sinta a intenção: habilidade, obrigação, conselho ou possibilidade.'
        },
        'phrasal-verbs': {
          content: 'Phrasal verb não é quebra-cabeça de palavra solta. O sentido mora no bloco inteiro, como expressão pronta do dia a dia.',
          exercise: 'Colinha: não traduza cada pedaço sozinho. Compare a ideia em português com o bloco inteiro e pense na situação real da frase.'
        }
      }
    },
    'soa3-frequencia': {
      anchor: 'Olhe o contexto da frase. Se tem TO BE, o advérbio mora depois. Se não tem, mora antes do verbo principal.',
      scaffolded: 'Antes de escolher, se pergunte: qual é o verbo principal da frase? O advérbio de frequência quase sempre vai logo antes dele.',
      sections: {
        escala: {
          content: 'Pensa numa régua de 0% a 100%. Cada advérbio tem seu lugar fixo nela. Never é zero, always é cem, e os outros ficam no meio.',
          exercise: 'Colinha: cheque se a frase tem TO BE. Tem? Advérbio depois. Não tem? Advérbio antes do verbo principal. Never já nega — não combine com don\'t.'
        }
      }
    },
    'soa4-wh-questions': {
      anchor: 'Primeiro identifique qual informação a pergunta quer puxar: lugar, tempo, pessoa, razão ou modo. Depois encaixe a palavra certa.',
      scaffolded: 'Leia a pergunta e pergunte: o que a frase quer saber? A resposta aponta direto pra palavra de pergunta certa.',
      sections: {
        'seis-wh': {
          content: 'Cada palavra WH é uma seta que aponta pra um tipo de informação. What = coisa, Where = lugar, Who = pessoa, When = tempo, Why = razão, How = modo.',
          exercise: 'Colinha: pense na RESPOSTA que você espera. Se seria um lugar → Where. Uma pessoa → Who. Uma hora → When. Isso guia a escolha antes de pensar no auxiliar.'
        }
      }
    },
    'soa5-past-regular': {
      anchor: 'No passado, o verbo regular sempre ganha -ed no final. Cheque só se há variação ortográfica: y vira ied, e curto dobra a consoante.',
      scaffolded: 'Dois passos: (1) o verbo é regular? Então -ed. (2) tem regra ortográfica especial? Aplique. Se o verbo fugir do -ed, é irregular.',
      sections: {
        'passado-ed': {
          content: 'Verbos regulares são previsíveis: trabalham com -ed no passado, sem exceção de sujeito. A variação é só na grafia, não na lógica.',
          exercise: 'Colinha: regular = -ed. Se termina em -e, só o -d. Se consoante+y, vira ied. Se CVC curto, dobra a consoante. Fora isso, é só walk → walked.'
        }
      }
    },
    'soa5-past-perguntas': {
      anchor: 'Pergunta no passado = Did + sujeito + verbo base. O verbo volta à forma dicionário — o passado já tá no Did.',
      scaffolded: 'Dois sinais: se tem "yesterday", "last week" ou "ago" → passado. No passado, Did entra pra qualquer sujeito.',
      sections: {
        'did-questions': {
          content: 'Did é o passado de Do. Ele assume todo o peso do tempo verbal e o verbo principal vai descansar na forma base.',
          exercise: 'Colinha: Did + sujeito + base. Se a resposta for sim, repete o Did. Se não, usa didn\'t. O verbo principal nunca vai no passado depois do Did.'
        }
      }
    },
    'soa5-past-negativa': {
      anchor: 'Negação no passado: didn\'t + base. TO BE no passado se nega sozinho: wasn\'t / weren\'t.',
      scaffolded: 'Dois caminhos: verbo de ação → didn\'t + base. TO BE → wasn\'t (singular) ou weren\'t (plural). Nunca "didn\'t was".',
      sections: {
        'negativa-passado': {
          content: 'Didn\'t já carrega o passado inteiro. Ele dispensa o verbo de ir pro passado também — por isso o verbo fica na base.',
          exercise: 'Colinha: didn\'t + base. Wasn\'t = he/she/it. Weren\'t = we/they/you. Teste: "Didn\'t went" → errado. "Didn\'t go" → certo.'
        }
      }
    },
    'soa6-can': {
      anchor: 'Can é modal: não ganha -s, não pede "to", e o verbo depois dele sempre fica na base.',
      scaffolded: 'Antes de responder, verifique: o verbo depois de can está na base? Está sem -s, -ed ou -ing? Então está certo.',
      sections: {
        'can-habilidade': {
          content: 'Can funciona como uma chave de ignição: ele liga a possibilidade ou habilidade. Sozinho, sem to e sem marca de pessoa.',
          exercise: 'Colinha: modal + base. Can swim (não can swims, não can to swim). A pergunta inverte: Can you? Sim → Yes, I can. Não → No, I can\'t.'
        }
      }
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

  function formatGriloHintText(text) {
    return escapePedagogicalHtml(String(text || '').trim()).replace(/\n+/g, '<br>');
  }

  const GRILO_HINT_ICON = `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <g fill="none">
        <path fill="#86d72f" d="M7 10.85v1.685A4 4 0 0 1 9 12c1.8 0 3.984.663 4.733 2.53h1.818L15.5 14l4.742-2l2.448-2.75c.28-.31.75-.34 1.06-.06c.184.163.27.4.25.634V12l1 2.5l-.246.615a5.5 5.5 0 0 1 2.756 3.215c.26.83-.36 1.67-1.23 1.67H24v4.25c0 .41-.34.75-.75.75s-.75-.34-.75-.75V20h-4.48l-1.17 1.96A2.068 2.068 0 0 1 13.215 20H11.11v4.25a.749.749 0 1 1-1.5 0V20H9q-.255 0-.5-.03v1.49c0 .63-.25 1.22-.69 1.67L6.14 24.8c-.15.14-.34.21-.53.21s-.38-.07-.53-.22a.754.754 0 0 1 0-1.06l1.67-1.67a.84.84 0 0 0 .25-.6v-1.995a4 4 0 0 1-1-6.11V10.85C6 9.28 7.28 8 8.85 8H19.5c.28 0 .5.22.5.5s-.22.5-.5.5H8.85C7.83 9 7 9.83 7 10.85"></path>
        <path fill="#c3ef3c" d="M5.96 12c.57 0 1.04.47 1.04 1.05v5.9C7 19.53 6.53 20 5.96 20C3.77 20 2 18.21 2 16s1.77-4 3.96-4m3.17 0h11.112l-4.45 5h-2.918a4 4 0 0 0-3.744-4.998zm13.37 5h-2.692l2.692-4.513zm1.5-5v5h.28c2.27 0 4.37-1.19 5.54-3.14c.49-.82-.1-1.86-1.05-1.86z"></path>
        <path fill="#212121" d="M4.5 15c-.28 0-.5.22-.5.5v1c0 .28.22.5.5.5s.5-.22.5-.5v-1c0-.28-.22-.5-.5-.5"></path>
      </g>
    </svg>`;

  function renderGriloHint(text, options = {}) {
    const copy = String(text || '').trim();
    if (!copy) return '';

    const title = options.title || 'Ajuda do GRILO';
    const className = options.wide ? ' lp-grilo-hint--content' : '';

    return `
      <span class="lp-grilo-hint${className}" tabindex="0" aria-label="${escapePedagogicalHtml(options.ariaLabel || title)}">
        <span class="lp-grilo-hint__icon" aria-hidden="true">${GRILO_HINT_ICON}</span>
        <span class="lp-grilo-hint__tooltip" role="tooltip">
          <strong class="lp-grilo-hint__title">${escapePedagogicalHtml(title)}</strong>
          <span class="lp-grilo-hint__body">${formatGriloHintText(copy)}</span>
        </span>
      </span>`;
  }

  function getSectionCoachGuide(slug, sectionId) {
    return GRILO_COACH_GUIDES[slug]?.sections?.[sectionId] || null;
  }

  function cleanQuestionCue(token) {
    let cleaned = String(token || '').replace(/\s+/g, ' ').trim();
    cleaned = cleaned.split(/\s+—\s+/)[0].trim();
    cleaned = cleaned.split(/\s+-\s+/)[0].trim();
    cleaned = cleaned.replace(/^use\s+/i, '').trim();
    cleaned = cleaned.replace(/^correto:\s*/i, '').trim();

    if (cleaned.length > 72) {
      cleaned = `${cleaned.slice(0, 69).trim()}...`;
    }

    return cleaned;
  }

  function looksLikePortugueseCue(token) {
    const value = String(token || '').trim();
    if (!value) return false;

    if (/^(i|me|my|mine|you|your|yours|he|him|his|she|her|hers|we|us|our|ours|they|them|their|theirs|do|does|did|was|were|will|won't|can|could|should|must)$/i.test(value)) {
      return false;
    }

    if (/\b(use|going to|turn off|turn down|look up|saw|called|does|did)\b/i.test(value) && !/[áéíóúãõç]/i.test(value)) {
      return false;
    }

    return /[áéíóúãõç]/i.test(value)
      || /\b(eu|você|voce|ele|ela|nós|nos|dela|dele|onde|quando|como|ninguém|nada|nunca|talvez|trabalho|hospital|parque|verdade|inglês|ingles|desligar|estudar|horário|horario|plano|passado|frango|cadeira|professor|cliente)\b/i.test(value);
  }

  function extractQuestionCues(question) {
    const normalized = String(question || '').replace(/\s+/g, ' ').trim();
    const candidates = [];

    Array.from(normalized.matchAll(/\[([^\]]+)\]/g)).forEach((match) => candidates.push(match[1]));
    Array.from(normalized.matchAll(/\(([^)]+)\)/g)).forEach((match) => candidates.push(match[1]));
    Array.from(normalized.matchAll(/"([^"]+)"/g)).forEach((match) => candidates.push(match[1]));

    return Array.from(new Set(candidates
      .map(cleanQuestionCue)
      .filter(looksLikePortugueseCue)
    )).slice(0, 3);
  }

  function buildQuestionCueHint(question) {
    const cues = extractQuestionCues(question);
    if (!cues.length) return '';

    if (cues.length === 1) {
      return `Tradução-pista: pense em "${cues[0]}" antes de olhar para o inglês.`;
    }

    return `Pistas em português: ${cues.map((cue) => `"${cue}"`).join(' • ')}.`;
  }

  function buildOptionCoachHint(options = []) {
    const compact = options.join(' | ').toLowerCase();
    if (!compact) return '';

    if (options.some((option) => option.includes('/'))) {
      return 'Tem mais de uma lacuna disfarçada aí. Resolva um pedaço da frase por vez antes de montar o conjunto.';
    }

    if (/\b(i|he|she|we|they)\b/.test(compact) && /\b(me|him|her|us|them)\b/.test(compact)) {
      return 'As opções misturam quem faz com quem recebe. Primeiro descubra o papel da palavra na frase.';
    }

    if ((/\bmy\b/.test(compact) && /\bmine\b/.test(compact))
      || (/\byour\b/.test(compact) && /\byours\b/.test(compact))
      || (/\bher\b/.test(compact) && /\bhers\b/.test(compact))) {
      return 'Uma opção quer vir grudada no substantivo; a outra quer andar sozinha no fim da ideia.';
    }

    if ((/\bdo\b/.test(compact) && /\bdoes\b/.test(compact))
      || (/don't/.test(compact) && /doesn't/.test(compact))) {
      return 'Encolha o sujeito para um pronome na cabeça. He/she/it puxam um trilho; I/you/we/they puxam outro.';
    }

    if (/\bdid\b/.test(compact) || /didn't/.test(compact)) {
      return 'Se o auxiliar já trouxe o passado, o verbo principal volta para a forma base.';
    }

    if (/\bwas\b/.test(compact) && /\bwere\b/.test(compact)) {
      return 'Decida antes se o sujeito soa singular ou plural. A escolha do auxiliar vem daí.';
    }

    if (/\bwill\b/.test(compact) && /going to/.test(compact)) {
      return 'A briga aqui não é de futuro: é de intenção. Decisão da hora e plano antigo não soam iguais.';
    }

    if (/\bin\b/.test(compact) && /\bon\b/.test(compact) && /\bat\b/.test(compact)) {
      return 'Imagine a cena: dentro, em cima ou num ponto exato. A preposição costuma cair dessa imagem.';
    }

    if (/\b(can|could|must|should|might|may)\b/.test(compact)) {
      return 'Olhe o peso da frase: habilidade, obrigação, conselho ou possibilidade. O modal certo nasce dessa intenção.';
    }

    if (/turn off/.test(compact) && /turn down/.test(compact)) {
      return 'Uma opção corta de vez; a outra só abaixa. A pista em português diz qual intensidade a frase quer.';
    }

    if (/run out of|give up|give out|turn down|show up|break up|look after|look up/.test(compact)) {
      return 'Aqui o bloco inteiro manda mais do que cada palavra sozinha. Pense na situação, não na tradução literal.';
    }

    if (/\bto\b/.test(compact) && /ing\b/.test(compact)) {
      return 'A pista não está no verbo final; está no verbo anterior. Ele decide se a continuação vem em -ing ou em to + base.';
    }

    return '';
  }

  function getContentCoachHint(slug, section) {
    return getSectionCoachGuide(slug, section?.id)?.content
      || 'GRILO traduzindo: esqueça o nome técnico por um minuto e pergunte qual trabalho essa peça está fazendo na frase.';
  }

  function getExerciseCoachHint(slug, section, question, options = []) {
    const guide = getSectionCoachGuide(slug, section?.id);

    return [
      buildQuestionCueHint(question),
      guide?.exercise || 'Colinha: antes de comparar as alternativas, descubra o papel da palavra ou a lógica da estrutura pedida.',
      buildOptionCoachHint(options)
    ].filter(Boolean).join(' ');
  }

  function getScaffoldedCoachHint(slug, exercise) {
    const question = String(exercise?.q || '');
    let focusHint = GRILO_COACH_GUIDES[slug]?.scaffolded || '';

    if (/enjoy cooking.*help/i.test(question)) {
      focusHint = 'Colinha: a primeira lacuna faz a ação de cozinhar; a segunda entra depois de "help" e recebe a ajuda.';
    } else if (/called|with|help/i.test(question)) {
      focusHint = GRILO_COACH_GUIDES.pronomes.sections['quem-recebe'].exercise;
    } else if (/your|yours|mine|my|book is your|bag is/i.test(question)) {
      focusHint = GRILO_COACH_GUIDES.pronomes.sections['de-quem-e'].exercise;
    } else {
      focusHint = GRILO_COACH_GUIDES.pronomes.sections['quem-faz'].exercise;
    }

    return [
      buildQuestionCueHint(question),
      focusHint,
      buildOptionCoachHint(exercise?.options || [])
    ].filter(Boolean).join(' ');
  }

  function getFinalTestCoachHint(slug, test, questionIndex) {
    return [
      buildQuestionCueHint(test?.q || ''),
      GRILO_COACH_GUIDES[slug]?.finalTest?.[questionIndex] || 'Colinha: o teste continua cobrando a função da palavra e a lógica da estrutura, não a sua memória decorada.',
      buildOptionCoachHint(test?.options || [])
    ].filter(Boolean).join(' ');
  }

  function renderAnchorDialog(slug) {
    const anchor = ANCHOR_DIALOGS[slug];
    if (!anchor) return '';
    const editorial = getPedagogicalEditorial(slug, lessons[slug]);
    const phase = editorial.phases?.anchor || {};
    const coachHint = GRILO_COACH_GUIDES[slug]?.anchor || '';

    let dialogue = escapePedagogicalHtml(anchor.dialogue);
    anchor.blanks.forEach((blank, blankIndex) => {
      dialogue = dialogue.replace(
        `___${blankIndex + 1}___`,
        `<span class="lp-anchor-blank" id="blank-${slug}-${blankIndex}">_____</span>`
      );
    });

    const buttons = anchor.blanks.map((blank, blankIndex) => {
      // Se o blank tem opções customizadas, usa elas; senão gera automaticamente
      const options = blank.options
        ? blank.options
        : Array.from(new Set([
            blank.answer,
            ...anchor.blanks.map(item => item.answer)
          ])).slice(0, 4);

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
          ${renderGriloHint(coachHint, { wide: true, title: 'Ajuda do GRILO', ariaLabel: 'Ajuda do GRILO para o aquecimento' })}
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
      const coachHint = getContentCoachHint(slug, section);

      // ── Soundboard ──
      let soundboardHtml = '';
      if (section.soundboard && Array.isArray(section.soundboard.items) && section.soundboard.items.length) {
        const sbTitle = section.soundboard.title || '🔊 Pratique a pronúncia';
        soundboardHtml = `
          <div class="lp-soundboard">
            <div class="lp-soundboard-title">${escapePedagogicalHtml(sbTitle)}</div>
            <div class="lp-soundboard-grid">
              ${section.soundboard.items.map(item => {
                const safeSpeech = String(item.speech || item.word).replace(/'/g, "\\'");
                return `<button class="lp-sb-cell" type="button"
                    aria-label="Ouvir ${escapePedagogicalHtml(item.word)}"
                    onclick="window._griloSpeak&&window._griloSpeak('${safeSpeech}', this)">
                  <span class="lp-sb-cell-play">▶</span>
                  <span class="lp-sb-cell-word">${escapePedagogicalHtml(item.word)}</span>
                  ${item.pron ? `<span class="lp-sb-cell-pron">${escapePedagogicalHtml(item.pron)}</span>` : ''}
                </button>`;
              }).join('')}
            </div>
          </div>`;
      }

      // ── Tabela interna da seção ──
      let tableSectionHtml = '';
      if (section.table && Array.isArray(section.table.rows) && section.table.rows.length) {
        const tHeaders = Array.isArray(section.table.headers) ? section.table.headers : [];
        tableSectionHtml = `
          <div class="lp-comparetable">
            ${section.table.title ? `<div class="lp-comparetable-title">${escapePedagogicalHtml(section.table.title)}</div>` : ''}
            <div class="lp-comparetable-scroll">
              <table class="lp-comparetable-table">
                ${tHeaders.length ? `<thead><tr>${tHeaders.map(h => `<th>${escapePedagogicalHtml(h)}</th>`).join('')}<th aria-label="Áudio"></th></tr></thead>` : ''}
                <tbody>
                  ${section.table.rows.map(row => {
                    const cells = Array.isArray(row.cells) ? row.cells : [];
                    const safeSpeak = row.speak ? String(row.speak).replace(/'/g, "\\'") : '';
                    return `<tr>
                      ${cells.map((c, i) => `<td${i === 0 ? ' class="lp-ct-key"' : ''}>${escapePedagogicalHtml(c)}</td>`).join('')}
                      <td class="lp-ct-audio">${safeSpeak ? `<button class="lp-ct-play" type="button" aria-label="Ouvir linha" onclick="window._griloSpeak&&window._griloSpeak('${safeSpeak}', this)">▶</button>` : ''}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>`;
      }

      // ── Todos os exemplos ──
      let examplesHtml = '';
      if (Array.isArray(section.examples) && section.examples.length) {
        examplesHtml = `
          <div class="lp-mex">
            <div class="lp-mex-label">📝 Exemplos</div>
            <ul class="lp-mex-list">
              ${section.examples.map(ex => {
                if (typeof ex === 'string') {
                  const safeStr = ex.replace(/'/g, "\\'");
                  return `<li class="lp-mex-item"><button class="lp-ex-play" type="button" aria-label="Ouvir pronúncia" onclick="window._griloSpeak&&window._griloSpeak('${safeStr}', this)">▶</button><span class="lp-ex-en">${escapePedagogicalHtml(ex)}</span></li>`;
                }
                const _p = EXAMPLE_PRON[ex.en] || '';
                const safeEn = ex.en.replace(/'/g, "\\'");
                return `<li class="lp-mex-item"><button class="lp-ex-play" type="button" aria-label="Ouvir pronúncia de ${escapePedagogicalHtml(ex.en)}" onclick="window._griloSpeak&&window._griloSpeak('${safeEn}', this)">▶</button><div class="lp-ex-content"><span class="lp-ex-en"${_p ? ` title="/ ${escapePedagogicalHtml(_p)} /"` : ''}>${escapePedagogicalHtml(ex.en)}</span>${_p ? `<span class="lp-ex-pron">/ ${escapePedagogicalHtml(_p)} /</span>` : ''}${ex.pt ? `<span class="lp-ex-pt">${escapePedagogicalHtml(ex.pt)}</span>` : ''}</div></li>`;
              }).join('')}
            </ul>
          </div>`;
      }

      return `
        <article class="lp-peda-section-card" id="${sectionIdPrefix}-${slug}-${index}">
          <div class="lp-peda-section-top">
            <div class="lp-peda-section-index">${escapePedagogicalHtml(sectionEditorial.label || `Bloco ${index + 1}`)}</div>
            <div class="lp-peda-section-chip">${escapePedagogicalHtml(sectionEditorial.focus || 'Conceito')}</div>
            ${renderGriloHint(coachHint, { wide: true, title: 'Ajuda do GRILO', ariaLabel: 'Resumo simplificado do GRILO' })}
          </div>
          <h3 class="lp-peda-section-title">${escapePedagogicalHtml(section.title)}</h3>
          ${sectionEditorial.summary ? `<p class="lp-peda-section-lead">${escapePedagogicalHtml(sectionEditorial.summary)}</p>` : ''}
          <p class="lp-peda-section-copy">${escapePedagogicalHtml(section.explanation || '')}</p>
          ${soundboardHtml}
          ${tableSectionHtml}
          ${examplesHtml}
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
    const headers = table.headers || ['Português', 'Inglês', 'Exemplo'];

    const sideNote = slug === 'pronomes'
      ? '<aside class="lp-table-side-note"><div class="lp-table-side-kicker">Leitura prática</div><p>Se a palavra vem antes do verbo, pense em sujeito. Se aparece depois do verbo ou de uma preposição, pense em objeto.</p></aside>'
      : '';

    return `
      <div class="lp-table-wrap" id="table-${slug}">
        <div class="lp-phase-head">
          <span class="lp-phase-kicker">${escapePedagogicalHtml(phase.kicker || 'Mapa rápido')}</span>
          <h3 class="lp-phase-title">${escapePedagogicalHtml(phase.title || 'Tabela de apoio')}</h3>
          <p class="lp-phase-copy">${escapePedagogicalHtml(phase.copy || '')}</p>
        </div>
        <div class="lp-table-shell">
          <table class="lp-interactive-table">
            <thead>
              <tr>${headers.map(h => `<th>${escapePedagogicalHtml(h)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${table.rows.map((row) => {
                const speakText = (row.example || row.en || '').replace(/'/g, "\\'");
                const speakBtn = speakText ? `<button class="lp-ct-play" type="button" aria-label="Ouvir exemplo" onclick="window._griloSpeak&&window._griloSpeak('${speakText}',this)">▶</button>` : '';
                if (slug === 'pronomes') {
                  return `<tr class="${row.category === 'subject' ? 'lp-table-subject' : 'lp-table-object'}">
                    <td><span class="lp-glossary-trigger" onmouseenter="window.showGlossary('${row.category === 'subject' ? 'sujeito' : 'objeto'}', event)" onmouseleave="window.hideGlossary()">${escapePedagogicalHtml(row.pt)}</span></td>
                    <td>${escapePedagogicalHtml(row.en)}</td>
                    <td>${escapePedagogicalHtml(row.example)}${speakBtn}</td>
                  </tr>`;
                }
                return `<tr class="${row.category === 'subject' ? 'lp-table-subject' : 'lp-table-object'}">
                  <td>${escapePedagogicalHtml(row.pt)}</td>
                  <td><strong>${escapePedagogicalHtml(row.en)}</strong></td>
                  <td>${escapePedagogicalHtml(row.example)}${speakBtn}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
          ${sideNote}
        </div>
        <button class="lp-anchor-continue" type="button" onclick="window.nextPhase('${slug}', 'exercises')">Ir para a prática guiada</button>
      </div>`;
  }

  function renderScaffoldedExercises(slug) {
    const exercises = SCAFFOLDED_EXERCISES[slug] || [];
    const editorial = getPedagogicalEditorial(slug, lessons[slug]);
    const phase = editorial.phases?.exercises || {};

    return `
      <div class="lp-exercises-wrap" id="exercises-${slug}">
        <div class="lp-phase-head">
          <span class="lp-phase-kicker">${escapePedagogicalHtml(phase.kicker || 'Prática guiada')}</span>
          <h3 class="lp-phase-title">${escapePedagogicalHtml(phase.title || 'Aplique a lógica da aula')}</h3>
          <p class="lp-phase-copy">${escapePedagogicalHtml(phase.copy || '')}</p>
        </div>
        ${exercises.map((exercise, exIndex) => `
          <div class="lp-exercise lp-difficulty-${escapePedagogicalHtml(exercise.difficulty)}" id="exercise-${slug}-${exIndex}">
            <div class="lp-exercise-q-row">
              <div class="lp-exercise-q">${exIndex + 1}. ${escapePedagogicalHtml(exercise.q)}</div>
              ${renderGriloHint(getScaffoldedCoachHint(slug, exercise), { title: 'Ajuda do GRILO', ariaLabel: 'Dica do GRILO para o exercício' })}
            </div>
            <div class="lp-exercise-meta-row">
              <div class="lp-glossary-highlight">Nível: ${escapePedagogicalHtml(({ easy: 'Fácil', moderate: 'Médio', hard: 'Desafio' }[exercise.difficulty] || exercise.difficulty))}</div>
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
            <div class="lp-test-q-row">
              <div class="lp-test-q-label">${qIdx + 1}. ${escapePedagogicalHtml(test.q)}</div>
              ${renderGriloHint(getFinalTestCoachHint(slug, test, qIdx), { title: 'Ajuda do GRILO', ariaLabel: 'Dica do GRILO para a validação final' })}
            </div>
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
    preposicoes: [
      [ // section 0: in/on/at place
        { options: ['She\'s in the supermarket.', 'She\'s on the supermarket.', 'She\'s at the supermarket.'], correct: 2,
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
        { options: ['Can you turn off the music? It\'s too loud.', 'Can you turn down the music? It\'s too loud.', 'Ambas corretas — turn off ou turn down dependem da intenção.'], correct: 0,
          explanation: '"turn off" = desligar completamente. "turn down" = abaixar o volume. A questão pede "desligar", então a resposta correta é "turn off".',
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
    ],
    // ════════════════════════════════════════════════════════════
    // AULAS SOA — QUESTÕES MÚLTIPLA ESCOLHA
    // ════════════════════════════════════════════════════════════
    'soa1-alfabeto': [
      [ // section 0: alfabeto-nomes
        { options: ['"a" (igual em português)', '"ei"', '"á"'], correct: 1,
          explanation: 'Em inglês, a letra A se pronuncia "ei" — não como o "á" do português.',
          tip: 'A → ei. E → i. I → ai. Decore essas três vogais primeiro.' },
        { options: ['"gê" (igual português)', '"ji"', '"dji"'], correct: 2,
          explanation: 'O G em inglês soa "dji" — bem diferente do nosso "gê".',
          tip: 'G = "dji". J = "djei". Não confunda: J tem som parecido mas começa diferente.' },
        { options: ['"Can you say that?"', '"How do you spell that?"', '"What is your name?"'], correct: 1,
          explanation: '"Spell" significa soletrar. É a pergunta padrão para confirmar como se escreve.',
          tip: '"Can you spell that?" = pode soletrar isso? Use sempre que não pegar o nome.' },
        { options: ['"vê"', '"double-iu"', '"uí"'], correct: 1,
          explanation: 'W em inglês é "double-iu" (dois U). É uma das letras mais longas de soletrar.',
          tip: 'W = "double-iu". Foi originalmente "duplo V" mas virou "duplo U" no inglês.' },
        { options: ['Em português é "é"; em inglês é "i".', 'São iguais.', 'Em inglês é "ei", em português também.'], correct: 0,
          explanation: 'O E no português é "é" (aberto). Em inglês é "i" — quase igual ao nosso I.',
          tip: 'E em inglês = som de "i". E em português = som de "é". Cuidado com essa confusão.' }
      ],
      [ // section 1: sons-dificeis
        { options: ['Diz "fink" (com F).', 'Diz "tchink" (com T duro).', 'Diz corretamente "think".'], correct: 1,
          explanation: 'O brasileiro tipicamente troca o TH por T duro — "tchink" em vez de "think".',
          tip: 'TH = língua entre os dentes + sopro. Sem T, sem F. Treine no espelho.' },
        { options: ['Nenhuma diferença — são iguais.', '"Ship" tem vogal curta, "sheep" tem vogal longa.', '"Ship" é navio, "sheep" também.'], correct: 1,
          explanation: 'Ship = vogal curta "i" rápido. Sheep = vogal longa "ii" alongada. Mudam o sentido.',
          tip: 'i curto vs ii longo. Treine: ship-sheep, live-leave, bit-beat.' },
        { options: ['Como "rê" do português (vibrando).', 'Como "hed" (sem o R).', 'Retroflexo: língua curva sem encostar.'], correct: 2,
          explanation: 'O R americano é retroflexo — a língua se curva pra trás sem tocar nada.',
          tip: 'R inicial: não role como em "rato". Não some como "hed". Curve a língua pra trás.' },
        { options: ['Nenhum problema — "tree" é a forma certa.', 'Tira o TH e vira "três" (number 3) virando "árvore".', 'Soa mais natural.'], correct: 1,
          explanation: '"Three" = 3. "Tree" = árvore. Pronunciar igual confunde tudo no dia a dia.',
          tip: 'Three = TH + ree (com TH na frente). Tree = T + ree. Cuidado com a confusão.' },
        { options: ['Porque vogais curtas e longas mudam o significado.', 'Porque são verbos irregulares.', 'Porque têm escrita parecida.'], correct: 0,
          explanation: '"Live" = vogal curta "i" (viver). "Leave" = vogal longa "ii" (partir). Mudam tudo.',
          tip: 'Pares mínimos: live/leave, sit/seat, bit/beat. Vogal curta vs longa.' }
      ]
    ],
    'soa1-numeros': [
      [ // section 0: numeros-base
        { options: ['"thirty"', '"three-ten"', '"thirteen"'], correct: 0,
          explanation: '"Thirty" = 30. "Thirteen" = 13. Cuidado com a confusão!',
          tip: '30 = thirty (THER-ti). 13 = thirteen (tcher-TIIN). Ênfase muda a sílaba forte.' },
        { options: ['Soam igual.', '"Thirteen" tem ênfase no -TEEN; "thirty" tem ênfase no THIR-.', '"Thirteen" é informal.'], correct: 1,
          explanation: 'Thirteen = ênfase no final (tcher-TIIN). Thirty = ênfase no início (THER-ti).',
          tip: 'Confundir 13 com 30 no restaurante muda a conta. Treine a ênfase.' },
        { options: ['"fifty"', '"five-teen"', '"fifteen"'], correct: 2,
          explanation: '15 = fifteen. Note que é "fif" e não "five" — pequena mudança ortográfica.',
          tip: 'Fifteen (15) tem -teen. Fifty (50) tem -ty. Mesma diferença de 13/30.' },
        { options: ['"five-zero dollars"', '"fifty dollars"', '"fifteen dollars"'], correct: 1,
          explanation: '50 = fifty (ênfase em FIF-). Atenção pra não pagar 15 quando devia ser 50.',
          tip: '"Fifty" = 50. "Fifteen" = 15. Ouvir mal pode custar caro.' },
        { options: ['"twenty five"', '"twentyfive"', '"twenty-five"'], correct: 2,
          explanation: 'Em inglês, números compostos (21-99) usam hífen: twenty-five, thirty-seven.',
          tip: 'Use hífen: twenty-one, thirty-two, forty-three. Nunca junto, nunca separado sem hífen.' }
      ],
      [ // section 1: horas-datas
        { options: ['"What hour is it?"', '"What time is it?"', '"Which time?"'], correct: 1,
          explanation: '"What time is it?" é a pergunta padrão. "Hour" se usa pra duração, não horário.',
          tip: 'What time = que horas. Hour = duração (uma hora = one hour).' },
        { options: ['"three and half"', '"half past three"', '"three half"'], correct: 1,
          explanation: '3:30 = "half past three" (meia hora depois das 3). Não traduza literalmente.',
          tip: 'Meia hora = half past. Estrutura: half past + hora cheia que JÁ passou.' },
        { options: ['Quinze pras sete (6:45).', 'Sete e quinze (7:15).', 'Sete horas e um quarto.'], correct: 0,
          explanation: '"Quarter to seven" = um quarto pras sete = 6:45. "To" indica falta.',
          tip: 'Quarter to = falta um quarto. Quarter past = passou um quarto.' },
        { options: ['Dia 5 de junho.', 'Dia 17 de maio.', 'Dia 17 de junho.'], correct: 1,
          explanation: 'No padrão americano, formato é month/day/year. 05/17/2026 = May 17, 2026.',
          tip: 'EUA: month/day. UK: day/month. 05/06: nos EUA = 6 de maio; UK = 5 de junho.' },
        { options: ['"My birthday is in May ten."', '"My birthday is on May tenth."', '"My birthday is at ten May."'], correct: 1,
          explanation: 'Dias usam "on" e ordinal: May tenth (10º de maio), não "May ten".',
          tip: 'Datas: on + month + ordinal (tenth, fifteenth, twentieth). Não use número simples.' }
      ]
    ],
    'soa1-cumprimentos': [
      [ // section 0: abertura
        { options: ['Hi é formal; Hello é informal; Hey é neutro.', 'Hi é padrão; Hello é mais formal; Hey é informal.', 'Os três são iguais — só preferência regional.'], correct: 1,
          explanation: 'Hi = padrão geral. Hello = formal (telefone, desconhecidos). Hey = informal (amigos).',
          tip: 'Hi: serve sempre. Hello: situações formais. Hey: amigos/colegas próximos.' },
        { options: ['"Let me tell you about my problems..."', '"Good, thanks. And you?"', '"I am fine but yesterday was terrible."'], correct: 1,
          explanation: '"How are you?" é protocolo — responda curto e devolva. Não é hora de relatar problemas.',
          tip: 'Resposta padrão: "Good, thanks. And you?" Curto e bola pra frente.' },
        { options: ['"Hey buddy!"', '"Hello, how may I help you?"', '"Yo, what\'s up?"'], correct: 1,
          explanation: 'No trabalho/formal, "Hello" + frase profissional. "Hey" e "Yo" são informais demais.',
          tip: 'Telefone profissional: Hello. Pessoa próxima: Hi. Amigo: Hey.' },
        { options: ['"And you?"', '"Same thing?"', '"What about?"'], correct: 0,
          explanation: '"And you?" = e você? — devolve a pergunta de forma natural.',
          tip: 'Estrutura ping-pong: "Good, thanks. And you?" Sempre devolva.' },
        { options: ['Porque o nativo realmente quer saber.', 'Porque é só protocolo social — quer só o ping-pong.', 'Porque ele não fala português.'], correct: 1,
          explanation: '"How are you?" é como nosso "tudo bem?" — não pede resposta detalhada. Travar trava a conversa.',
          tip: 'É ritual social, não pergunta real. Responda curto pra fluir a conversa.' }
      ],
      [ // section 1: apresentacao
        { options: ['"I am Carlos."', '"My name is Carlos." / "I\'m Carlos."', '"Me Carlos."'], correct: 1,
          explanation: 'Duas formas naturais: "My name is..." (mais formal) ou "I\'m..." (mais casual).',
          tip: '"My name is" + nome. Ou "I\'m" + nome. Nunca "Me + nome".' },
        { options: ['"I am from Brazil, from Rio."', '"I am of Brazil, of Rio."', '"I from Brazil, Rio."'], correct: 0,
          explanation: 'Estrutura: "I\'m from + país, from + cidade". Sempre "from", nunca "of".',
          tip: 'Origem usa "from": "I\'m from + lugar". Funciona pra país, cidade, bairro.' },
        { options: ['Sempre que reencontra a pessoa.', 'Só na PRIMEIRA vez que encontra alguém.', 'Apenas em situações formais.'], correct: 1,
          explanation: '"Nice to meet you" é só pra primeiro contato. Depois vira "Nice to see you again".',
          tip: 'Primeira vez: "Nice to meet you". Reencontro: "Nice to see you again".' },
        { options: ['Saudação + clima + comida.', 'Nome + origem + ocupação.', 'Nome + idade + estado civil.'], correct: 1,
          explanation: 'Apresentação universal: (1) nome, (2) de onde é, (3) o que faz.',
          tip: 'Three blocks: name, origin, occupation. Funciona em qualquer contexto.' },
        { options: ['"Bye!" / "See you!" / "See you later!"', '"End!" / "Final!"', '"Out!" / "Done!"'], correct: 0,
          explanation: 'Despedidas naturais: Bye, See you, See you later, Take care, Catch you later.',
          tip: '"Goodbye" soa formal demais no dia. Use Bye, See you, See you later.' }
      ]
    ],
    'soa1-tobe-afirm': [
      [ // section 0: am-is-are
        { options: ['"is"', '"are"', '"am"'], correct: 2,
          explanation: 'Com "I", sempre AM. Não tem outra forma. "I am" — e na fala "I\'m".',
          tip: 'I → am. He/she/it → is. You/we/they → are. Fixo.' },
        { options: ['"is"', '"am"', '"are"'], correct: 0,
          explanation: 'Com "she/he/it", sempre IS. "She is my sister".',
          tip: 'She/he/it → is. Single people or things use IS.' },
        { options: ['"weare"', '"we\'re"', '"wear"'], correct: 1,
          explanation: 'Contração de "we are" é "we\'re" — com apóstrofo entre o e e o re.',
          tip: 'Contrações: I\'m, you\'re, he\'s, she\'s, it\'s, we\'re, they\'re.' },
        { options: ['"He are tired."', '"He is tired."', '"He am tired."'], correct: 1,
          explanation: 'Com "he", sempre "is". Não confunda com "are" (você/nós/eles).',
          tip: 'He/she/it usam IS. Decore: ele/ela/isso → IS.' },
        { options: ['Porque "I am" é muito formal.', 'Porque ninguém fala assim no dia a dia — sempre vira "I\'m".', 'Porque o "am" não existe na conversação.'], correct: 1,
          explanation: 'A contração "I\'m" aparece em ~95% da fala natural. "I am" só em ênfase ou formal.',
          tip: '"I am" cheio = formal/ênfase. "I\'m" = natural na fala diária.' }
      ],
      [ // section 1: ser-estar
        { options: ['"I am tired" / "I am tired"', 'Estados são diferentes em inglês também.', 'Não dá pra dizer ambas.'], correct: 0,
          explanation: 'Em inglês, "I am tired" cobre tanto "estou cansado" (agora) quanto "sou cansado" (sempre). Contexto decide.',
          tip: 'Inglês não diferencia ser/estar. Mesma frase, contexto define o sentido.' },
        { options: ['Sempre "é quente" (característica).', 'Pode ser "é quente" ou "está quente" — contexto define.', 'Sempre "está quente" (estado atual).'], correct: 1,
          explanation: '"The coffee is hot" pode ser permanente (café é sempre quente) ou momentâneo (este café tá quente agora).',
          tip: 'IS cobre ser e estar. Em "the coffee is hot", contexto da conversa decide qual.' },
        { options: ['"My phone is in the bag."', '"My phone stays in the bag."', '"My phone has in the bag."'], correct: 0,
          explanation: 'Localização usa TO BE: "is in", "is on", "is at". "My phone is in the bag".',
          tip: 'TO BE + lugar: I am here. She is there. The phone is in the bag.' },
        { options: ['Para economizar palavras.', 'Porque historicamente o inglês perdeu essa distinção.', 'Por preguiça.'], correct: 1,
          explanation: 'O inglês antigo tinha as duas formas, mas se fundiram. Hoje TO BE cobre os dois.',
          tip: 'O inglês simplificou. Pra brasileiro decora fácil, mas confunde no uso.' },
        { options: ['"I happy today."', '"I am happy today."', '"I happy am today."'], correct: 1,
          explanation: 'Inglês precisa do TO BE: "I am happy", não "I happy". Toda frase precisa de verbo.',
          tip: 'Estado/característica + sujeito → use TO BE: I am, you are, she is.' }
      ]
    ],
    'soa2-pronomes-sujeito': [
      [ // section 0: sujeito-obrigatorio
        { options: ['"Is raining today."', '"It is raining today."', '"Raining today."'], correct: 1,
          explanation: 'Toda frase em inglês precisa de sujeito. "It" preenche quando não há sujeito real (clima).',
          tip: 'Sem sujeito real (clima, hora) → use "it" como sujeito vazio.' },
        { options: ['"Hot today."', '"Is hot today."', '"It\'s hot today."'], correct: 2,
          explanation: '"It\'s hot today" = está quente hoje. "It" obrigatório pra clima.',
          tip: 'Clima sempre com "it": It\'s hot, it\'s cold, it\'s raining, it\'s sunny.' },
        { options: ['Porque o inglês exige sujeito em toda frase.', 'Porque "8 o\'clock" é estrangeiro.', 'Porque o inglês americano gosta de "it".'], correct: 0,
          explanation: 'Regra absoluta: toda frase precisa de sujeito. "It is 8 o\'clock" — "it" enche a posição.',
          tip: 'Hora, clima, distância, situação genérica → começa com "it".' },
        { options: ['"They"', '"It"', '"He"'], correct: 0,
          explanation: '"They speak Portuguese" = eles falam português. They para grupo.',
          tip: 'Grupo de pessoas (eles/elas) → they. Coisas (eles/elas) → também they.' },
        { options: ['Falta o sujeito — deveria ser "He is my friend" ou similar.', 'Não tem erro.', 'Falta o verbo.'], correct: 0,
          explanation: '"Is my friend" sem sujeito não funciona. Precisa "He is my friend" ou "She is...".',
          tip: 'Comece toda frase com sujeito (I, you, he, she, it, we, they) + verbo.' }
      ]
    ],
    'soa2-tobe-perg-neg': [
      [ // section 0: inversao
        { options: ['"You are tired?"', '"Are you tired?"', '"Do you are tired?"'], correct: 1,
          explanation: 'Pergunta com TO BE = inverter sujeito e verbo. "You are" → "Are you?"',
          tip: 'TO BE = inverte e pronto. Não precisa de "do"/"does".' },
        { options: ['"Is she at home?"', '"Does she at home?"', '"She is at home?"'], correct: 0,
          explanation: '"Is she at home?" — TO BE na frente, sem auxiliar do/does.',
          tip: 'Is/Am/Are + sujeito + resto: Is she...? Are they...? Am I...?' },
        { options: ['Porque o TO BE não é um verbo de verdade.', 'Porque o próprio TO BE faz o trabalho de auxiliar — não precisa de outro.', 'Por preguiça do inglês.'], correct: 1,
          explanation: 'TO BE é especial — abre pergunta sozinho. Verbos comuns precisam de do/does/did.',
          tip: 'TO BE → inverte. Verbo comum → do/does/did + sujeito + verbo base.' },
        { options: ['"Do"', '"Are"', '"Is"'], correct: 1,
          explanation: 'They → are. "Are they ready?" = eles estão prontos?',
          tip: 'They/we/you → are. Pergunta: Are they/we/you...?' },
        { options: ['"Am I late?"', '"Do I late?"', '"Are I late?"'], correct: 0,
          explanation: 'Com "I", sempre AM. Pergunta: "Am I...?" — única forma correta.',
          tip: 'I → am. Pergunta: "Am I...?" Nunca "are I" nem "do I be".' }
      ],
      [ // section 1: negativa
        { options: ['"I no tired."', '"I am not tired." / "I\'m not tired."', '"I not am tired."'], correct: 1,
          explanation: 'Negativa do TO BE = TO BE + not. "I am not" ou contração "I\'m not".',
          tip: 'TO BE + not. Sem do/does. "I am not", "she is not", "they are not".' },
        { options: ['Sim, é a forma padrão.', 'Não existe em inglês padrão — usa-se "I\'m not".', 'Só na escrita formal.'], correct: 1,
          explanation: '"Amn\'t" é considerado errado no inglês padrão. Sempre "I\'m not" ou "I am not".',
          tip: '1ª pessoa negativa: "I am not" ou "I\'m not". Nunca "amn\'t".' },
        { options: ['"shen\'t"', '"isn\'t"', '"isnt\'"'], correct: 1,
          explanation: 'Contração de "is not" = "isn\'t" (com apóstrofo antes do t).',
          tip: 'Contrações: isn\'t (is not), aren\'t (are not). Apóstrofo no lugar do "o".' },
        { options: ['"They aren\'t my friends."', '"They no my friends."', '"They don\'t be my friends."'], correct: 0,
          explanation: '"They are not" → "They aren\'t". Negativa do TO BE sem do/don\'t.',
          tip: 'They aren\'t = they are not. Contração padrão.' },
        { options: ['"I\'m not Brazilian."', '"I don\'t am Brazilian."', '"I no am Brazilian."'], correct: 0,
          explanation: '"Amn\'t" não existe. Use "I\'m not" ou "I am not".',
          tip: 'Negativa correta da 1ª pessoa: "I\'m not". Sempre.' }
      ]
    ],
    'soa2-possessivos': [
      [ // section 0: lista-uso
        { options: ['"hers"', '"she"', '"her"'], correct: 2,
          explanation: 'O possessivo de "she" é "her". "Her car", "her name", "her family".',
          tip: 'I→my, you→your, he→his, she→her, it→its, we→our, they→their.' },
        { options: ['"His name is John."', '"He name is John."', '"His is John name."'], correct: 0,
          explanation: '"His" = dele (possessivo). Vem antes do objeto: "his name".',
          tip: 'Possessivo + objeto: his name, her car, my phone.' },
        { options: ['Porque possessivo no inglês concorda com o DONO, não com o objeto.', 'Porque o plural muda.', 'Porque é uma exceção rara.'], correct: 0,
          explanation: 'No inglês, possessivo combina com o dono (ela), não com o objeto. "Her" não muda.',
          tip: 'Em português: "suas casas". Em inglês: "her houses" (sem mudar o her).' },
        { options: ['"My"', '"Our"', '"Your"'], correct: 1,
          explanation: 'Nós = we → our. "Our team" = nosso time.',
          tip: 'We → our. Memorize: our family, our team, our country.' },
        { options: ['"Its" = possessivo (dele). "It\'s" = it is (é/está).', 'São iguais.', '"Its" é informal.'], correct: 0,
          explanation: 'Its = possessivo (the dog and its bone). It\'s = it is (it\'s raining).',
          tip: 'Teste: substitua por "it is". Se faz sentido = "it\'s". Senão = "its".' }
      ]
    ],
    'soa2-this-that': [
      [ // section 0: quatro-formas
        { options: ['That', 'These', 'This'], correct: 2,
          explanation: 'Singular + perto = THIS. "This book" se está na sua mão.',
          tip: 'Perto + singular = this. Longe + singular = that.' },
        { options: ['These', 'Those', 'This'], correct: 1,
          explanation: 'Plural + longe = THOSE. "Those shoes over there".',
          tip: 'Perto: this/these. Longe: that/those. Singular: this/that. Plural: these/those.' },
        { options: ['"This shoes are new."', '"These shoes are new."', '"That shoes are new."'], correct: 1,
          explanation: 'Shoes é plural e está perto → these. "These shoes are new".',
          tip: 'Sapatos = plural → these (perto) ou those (longe).' },
        { options: ['this', 'that', 'these'], correct: 1,
          explanation: 'Longe = that (singular). "What is that?" pra coisa distante.',
          tip: 'Apontando pra algo longe = that. "What is that over there?"' },
        { options: ['"This" aponta; "the" só identifica.', 'São iguais.', '"This" é informal.'], correct: 0,
          explanation: '"This book" = ESTE livro específico (apontando). "The book" = O livro (já mencionado).',
          tip: 'This/that = apontam fisicamente. The = referência já estabelecida.' }
      ]
    ],
    'soa3-present-afirm': [
      [ // section 0: forma-base
        { options: ['"I working from home."', '"I work from home."', '"I am work from home."'], correct: 1,
          explanation: 'Present simple = sujeito + verbo base. "I work from home" para hábito.',
          tip: 'Hábitos/rotinas → present simple: I work, I eat, I study.' },
        { options: ['"I work" é agora; "I am working" é hábito.', '"I work" é hábito; "I am working" é agora.', 'São iguais.'], correct: 1,
          explanation: '"I work" = trabalho (geral, hábito). "I am working" = estou trabalhando agora.',
          tip: 'Simple = rotina. Continuous (am working) = agora, neste momento.' },
        { options: ['"studied"', '"are studying"', '"study"'], correct: 2,
          explanation: 'Com "we", verbo na forma base: "we study". Sem -s (s só pra he/she/it).',
          tip: 'I/you/we/they → verbo base. He/she/it → verbo + s.' },
        { options: ['"They eats rice every day."', '"They eat rice every day."', '"They are eat rice every day."'], correct: 1,
          explanation: '"They eat" — forma base porque they é plural (sem -s).',
          tip: 'They + verbo base. -s só pra he/she/it.' },
        { options: ['Pra ações em andamento.', 'Pra hábitos, rotinas e verdades gerais.', 'Pra passado.'], correct: 1,
          explanation: 'Present simple = hábitos ("eu trabalho de casa"), não ações em andamento.',
          tip: 'Hábito/rotina/verdade geral → present simple. Agora → present continuous.' }
      ]
    ],
    'soa3-third-person-s': [
      [ // section 0: regra-do-s
        { options: ['"He works at a bank."', '"He working at a bank."', '"He is work at a bank."'], correct: 0,
          explanation: 'Terceira pessoa (he/she/it) sempre adiciona -s ao verbo: "he works".',
          tip: 'He/she/it + verbo + S. Sem exceção (exceto modais).' },
        { options: ['"studys"', '"studies"', '"studyes"'], correct: 1,
          explanation: 'Verbos terminados em consoante + y → troca y por ies. Study → studies.',
          tip: 'Termina em y? Troca por ies: study/studies, try/tries, fly/flies.' },
        { options: ['"watchs"', '"watch"', '"watches"'], correct: 2,
          explanation: 'Verbos em -ch, -sh, -ss, -o, -x → adiciona -es. Watch → watches.',
          tip: '-ch/-sh/-ss/-o/-x + es: watches, washes, kisses, goes, fixes.' },
        { options: ['Porque verbos em -o pegam -es, não só -s.', 'Porque "go" é irregular.', 'Pra soar melhor.'], correct: 0,
          explanation: 'Verbos terminados em -o adicionam -es: go/goes, do/does.',
          tip: 'Termina em o → +es: goes, does. Não é "gos" nem "dos".' },
        { options: ['Esquecer o -s na terceira pessoa.', 'Usar muito o passado.', 'Confundir pronomes.'], correct: 0,
          explanation: 'Brasileiros frequentemente esquecem o -s em he/she/it works/lives/studies.',
          tip: 'Sempre pergunte: o sujeito é he, she ou it? Sim → adiciona -s.' }
      ]
    ],
    'soa3-frequencia': [
      [ // section 0: escala
        { options: ['Antes do verbo principal: "I always drink coffee".', 'Depois do verbo: "I drink always coffee".', 'No final: "I drink coffee always".'], correct: 0,
          explanation: 'Advérbios de frequência vão ANTES do verbo principal. "I always drink", não "I drink always".',
          tip: 'Always/usually/often + verbo. Posição fixa: antes do verbo principal.' },
        { options: ['É correto.', 'Porque "never" já é negativa — não combine com "don\'t".', 'Porque é gíria.'], correct: 1,
          explanation: 'Never já contém a negação. "I never eat meat" — sem don\'t.',
          tip: 'Never = nunca (já nega). Don\'t never = dupla negação errada.' },
        { options: ['Always = sempre; usually = geralmente; sometimes = às vezes.', 'São iguais.', 'Always é informal.'], correct: 0,
          explanation: 'Always (100%) > usually (80%) > often (60%) > sometimes (40%) > never (0%).',
          tip: 'Escala de frequência: always > usually > often > sometimes > rarely > never.' },
        { options: ['"She always is late."', '"She is always late."', '"Always she is late."'], correct: 1,
          explanation: 'Com TO BE, o advérbio vem DEPOIS do verbo: "She is always late".',
          tip: 'TO BE + advérbio: She is always, he is never, they are usually.' },
        { options: ['"She is never late."', '"She never is late."', '"She not is late never."'], correct: 0,
          explanation: 'Com TO BE: "She is never late" — never depois do is.',
          tip: 'TO BE + never (advérbio depois do verbo TO BE).' }
      ]
    ],
    'soa4-wh-questions': [
      [ // section 0: cinco-wh
        { options: ['What', 'Where', 'Who'], correct: 1,
          explanation: '"Where" = onde. "Where do you live?", "Where is the bank?"',
          tip: 'Where = lugar. When = tempo. What = coisa. Who = pessoa. How = modo.' },
        { options: ['"Where you work?"', '"Where do you work?"', '"You work where?"'], correct: 1,
          explanation: 'WH + auxiliar + sujeito + verbo: "Where do you work?" — sem o "do", soa errado.',
          tip: 'Estrutura: WH + do/does/did + sujeito + verbo base.' },
        { options: ['"What" = aberto (qualquer coisa); "Which" = limitado (escolha entre opções).', 'São iguais.', '"What" é formal; "which" informal.'], correct: 0,
          explanation: 'What → universo aberto ("what do you want?"). Which → escolha definida ("which one?").',
          tip: 'What sem opções definidas. Which com opções limitadas: which color? which one?' },
        { options: ['"How much does it cost?"', '"How many cost?"', '"What cost?"'], correct: 0,
          explanation: '"How much" + auxiliar + sujeito. "How much does it cost?"',
          tip: 'Preço: How much. Contável: How many. Both with verb.' },
        { options: ['Porque verbos em present simple precisam de "do" pra pergunta.', 'Porque é educação.', 'Porque é estrangeirismo.'], correct: 0,
          explanation: 'Verbos comuns no presente precisam de "do/does" pra pergunta. TO BE não precisa.',
          tip: 'Verbo comum + pergunta → do/does. TO BE → inversão direta.' }
      ]
    ],
    'soa4-prep-tempo': [
      [ // section 0: logica-tempo
        { options: ['"on"', '"at"', '"in"'], correct: 1,
          explanation: 'Horas específicas → at. "At 3pm", "at 6 o\'clock", "at noon".',
          tip: 'AT = ponto preciso de hora. AT 3pm, AT midnight, AT noon.' },
        { options: ['at', 'on', 'in'], correct: 2,
          explanation: 'Meses → in. "In May", "in July", "in December".',
          tip: 'IN = períodos amplos (mês, ano, estação, década).' },
        { options: ['at', 'on', 'in'], correct: 1,
          explanation: 'Dias da semana → on. "On Monday", "on Friday".',
          tip: 'ON = dias específicos (segunda, terça, datas).' },
        { options: ['Exceções históricas — só decorar.', 'Porque a noite é mais curta.', 'Erro do inglês britânico.'], correct: 0,
          explanation: '"At night" é exceção fixa. Outras partes do dia: "in the morning/afternoon/evening".',
          tip: 'AT night (exceção). IN the morning/afternoon/evening (regra).' },
        { options: ['"The meeting is on Monday at 3pm."', '"The meeting is at Monday on 3pm."', '"The meeting is in Monday at 3pm."'], correct: 0,
          explanation: 'Dia → on. Hora → at. "On Monday at 3pm".',
          tip: 'Combine: on + dia + at + hora. On Monday at 3pm. On Friday at noon.' }
      ]
    ],
    'soa4-rotina': [
      [ // section 0: lugares-verbos
        { options: ['"I go home."', '"I go at home."', '"I go in home."'], correct: 0,
          explanation: '"Home" é exceção — não leva preposição. "Go home", "stay home", "come home".',
          tip: 'Home sem preposição. Outros lugares: go to + lugar.' },
        { options: ['"I go to gym."', '"I go to the gym."', '"I go in gym."'], correct: 1,
          explanation: 'Lugares específicos → go to + the + lugar. "Go to the gym", "to the office".',
          tip: 'Go to + the + lugar. Exceção: home (sem to e sem the).' },
        { options: ['"Go to" = movimento pra lá; "arrive at" = chegada no destino.', 'São iguais.', '"Arrive at" é informal.'], correct: 0,
          explanation: 'Go to = começa o trajeto. Arrive at = chega no destino.',
          tip: 'Go TO (movimento). Arrive AT (chegada). "Go to work, arrive at the office."' },
        { options: ['"We stay home on Sundays."', '"We stay in home on Sundays."', '"We stay to home on Sundays."'], correct: 0,
          explanation: '"Stay home" — sem preposição (home é exceção).',
          tip: 'Stay home, go home, come home — home sem preposição.' },
        { options: ['Porque home é advérbio, não substantivo nesse uso.', 'Por preguiça.', 'Porque é palavra estrangeira.'], correct: 0,
          explanation: '"Home" funciona como advérbio de lugar (como "here", "there"). Não leva preposição.',
          tip: 'Home, here, there = advérbios. Não levam preposição de movimento.' }
      ]
    ],
    'soa5-past-regular': [
      [ // section 0: regra-ed
        { options: ['"work"', '"worked"', '"working"'], correct: 1,
          explanation: 'Verbos regulares no passado: adicione -ed. "Work → worked".',
          tip: 'Regular = verbo + ed: worked, played, talked, lived.' },
        { options: ['Porque verbos em consoante + y trocam y por ied.', 'Por erro.', 'Por sotaque britânico.'], correct: 0,
          explanation: 'Study termina em consoante + y → troca por ied. Study/studied, try/tried, cry/cried.',
          tip: 'Consoante + y → ied: study/studied, try/tried, marry/married.' },
        { options: ['Porque verbos curtos (vogal + consoante) dobram a consoante final.', 'Por erro de ortografia.', 'Não dobra — é "stoped".'], correct: 0,
          explanation: 'Stop é curto + vogal + consoante → dobra: stopped. Outros: planned, jogged.',
          tip: 'CVC curto (consoante-vogal-consoante) → dobra: stop/stopped, plan/planned.' },
        { options: ['"They play football yesterday."', '"They played football yesterday."', '"They are play football yesterday."'], correct: 1,
          explanation: 'Passado: play → played. "Yesterday" exige passado.',
          tip: 'Ontem (yesterday) → passado. Verbo regular + ed.' },
        { options: ['Não, são diferentes.', 'Sim, ambos soam "ed".', 'Worked = "uorkt"; wanted = "uontid".'], correct: 2,
          explanation: 'Sons diferentes: worked (-t), played (-d), wanted (-id). Depende do som anterior.',
          tip: 'Som final do verbo: surdo → /t/, sonoro → /d/, t/d → /id/.' }
      ]
    ],
    'soa5-past-perguntas': [
      [ // section 0: did-base
        { options: ['"Did you go to school?"', '"Did you went to school?"', '"You did went to school?"'], correct: 0,
          explanation: 'Did + sujeito + VERBO BASE. Nunca "did + verbo no passado".',
          tip: 'Did + base form. Did você ir, não did você foi.' },
        { options: ['"Does she called you?"', '"Did she call you?"', '"Did she called you?"'], correct: 1,
          explanation: 'Passado: did + sujeito + verbo base. "Did she call?" — sem -ed.',
          tip: 'Did + sujeito + verbo base. "Did she call/eat/go?"' },
        { options: ['Porque "did" já marca o passado — o verbo fica neutro.', 'Por erro do inglês.', 'Pra confundir o brasileiro.'], correct: 0,
          explanation: 'O "did" carrega o tempo passado. O verbo principal fica na forma base, neutra.',
          tip: 'Did marca o tempo. Verbo principal = forma base (sem ed, sem s).' },
        { options: ['"What you did yesterday?"', '"What did you do yesterday?"', '"What you do yesterday?"'], correct: 1,
          explanation: 'WH + did + sujeito + verbo base. "What did you do?"',
          tip: 'Pergunta WH no passado: WH + did + sujeito + verbo base.' },
        { options: ['"Yes, I did."', '"Yes, I was."', '"Yes, I do."'], correct: 0,
          explanation: 'Resposta curta usa o auxiliar da pergunta: did → "Yes, I did" / "No, I didn\'t".',
          tip: 'Pergunta com did → resposta com did. Yes, I did / No, I didn\'t.' }
      ]
    ],
    'soa5-past-negativa': [
      [ // section 0: didnt
        { options: ['"I didn\'t go to the party."', '"I didn\'t went to the party."', '"I no went to the party."'], correct: 0,
          explanation: 'Didn\'t + verbo BASE. "I didn\'t go", nunca "I didn\'t went".',
          tip: 'Didn\'t + base form. Não duplique a marca de passado.' },
        { options: ['"I no slept well."', '"I didn\'t slept well."', '"I didn\'t sleep well."'], correct: 2,
          explanation: 'Didn\'t + verbo base. Sleep, não slept. "I didn\'t sleep well".',
          tip: 'Didn\'t + verbo base. O "did" já marca o passado.' },
        { options: ['Didn\'t = passado; doesn\'t = presente (he/she/it).', 'São iguais.', 'Doesn\'t é formal.'], correct: 0,
          explanation: 'Didn\'t = passado (qualquer pessoa). Doesn\'t = presente (só he/she/it).',
          tip: 'Tempo passado → didn\'t. Tempo presente terceira pessoa → doesn\'t.' },
        { options: ['"She didn\'t see the email."', '"She didn\'t saw the email."', '"She no saw the email."'], correct: 0,
          explanation: 'Didn\'t + verbo base: "didn\'t see", não "didn\'t saw".',
          tip: 'Didn\'t + base form, sempre. See/saw → didn\'t see.' },
        { options: ['Porque didn\'t é universal — não muda por pessoa.', 'Porque é exceção.', 'Porque é informal.'], correct: 0,
          explanation: 'Didn\'t serve pra todas as pessoas — não tem "doesn\'tn\'t" nem variações.',
          tip: 'Didn\'t = universal: I didn\'t, you didn\'t, he didn\'t, they didn\'t.' }
      ]
    ],
    'soa6-can': [
      [ // section 0: habilidade-permissao
        { options: ['"She cans speak English."', '"She can speak English."', '"She can speaks English."'], correct: 1,
          explanation: 'Can + verbo BASE. Nunca "cans" nem "can speaks" — sem -s.',
          tip: 'Can é modal — não recebe -s. Verbo depois fica na forma base.' },
        { options: ['"Can I open the window?"', '"Do I can open the window?"', '"I can open the window?"'], correct: 0,
          explanation: 'Pedido de permissão: "Can I + verbo?" — direto, sem auxiliar.',
          tip: 'Pedido de permissão = "Can I" + verbo base.' },
        { options: ['"don\'t can"', '"cannot" / "can\'t"', '"no can"'], correct: 1,
          explanation: 'Negativa: "cannot" (junto) ou "can\'t" (contração).',
          tip: 'Can negativo: cannot (junto, formal) ou can\'t (contração, comum).' },
        { options: ['Can = passado; could = presente.', 'Could = passado de can / pedido mais educado.', 'São iguais.'], correct: 1,
          explanation: 'Could = passado de can OU presente mais educado ("Could you help me?").',
          tip: 'Could = passado (yesterday I could) ou educação (could you...?).' },
        { options: ['"I can\'t come tomorrow."', '"I no can come tomorrow."', '"I don\'t can come tomorrow."'], correct: 0,
          explanation: 'Negativa de can = can\'t (ou cannot). "I can\'t come".',
          tip: 'Can negativo = can\'t. Sem don\'t/doesn\'t.' }
      ]
    ],
    'soa6-like-ing': [
      [ // section 0: verbo-mais-ing
        { options: ['"I like read."', '"I like reading."', '"I like to read."'], correct: 1,
          explanation: 'Depois de like/love/hate/enjoy + verbo com -ing. "I like reading".',
          tip: 'Like + atividade → -ing. (To + verbo também aceito, mas -ing é mais comum).' },
        { options: ['"She loves cook."', '"She loves cooking."', '"She loves to cooking."'], correct: 1,
          explanation: 'Love + -ing. "She loves cooking" = ela adora cozinhar.',
          tip: 'Love + verbo + ing. Nunca "love to cooking".' },
        { options: ['Porque "you" não é uma atividade — é uma pessoa.', 'Porque é gíria.', 'Porque é exceção rara.'], correct: 0,
          explanation: 'A regra do -ing vale só pra atividades. "You" é uma pessoa, não ação.',
          tip: 'Like/love + ATIVIDADE → -ing. Like/love + PESSOA → forma normal.' },
        { options: ['"They hate to wait."', '"They hate waiting."', '"They hate wait."'], correct: 1,
          explanation: 'Hate + -ing. "They hate waiting" = eles odeiam esperar.',
          tip: 'Hate + verbo + ing. Mesmo padrão de like e love.' },
        { options: ['like, love, hate', 'go, work, study', 'be, have, do'], correct: 0,
          explanation: 'Like, love, hate, enjoy, mind, can\'t stand → pedem -ing.',
          tip: 'Verbos de sentimento por atividade: like, love, hate, enjoy, mind + -ing.' }
      ]
    ],
    'soa6-want-to': [
      [ // section 0: want-to-base
        { options: ['"I want learn English."', '"I want to learn English."', '"I want learning English."'], correct: 1,
          explanation: 'Want + TO + verbo base. "I want to learn", nunca "I want learn".',
          tip: 'Want + to + verbo base. Sempre com "to" no meio.' },
        { options: ['"She want to travel."', '"She wants to travel."', '"She wants travel."'], correct: 1,
          explanation: 'Terceira pessoa = wants (com -s). Depois "to + verbo base".',
          tip: 'She/he/it → wants (com -s). Depois: to + verbo base.' },
        { options: ['"want to" contraído na fala — comum em filmes e conversas.', 'Erro de inglês.', 'Forma britânica.'], correct: 0,
          explanation: '"Wanna" = "want to" contraído. Aparece em ~80% da fala informal americana.',
          tip: 'I wanna go = I want to go. Informal, mas universal na fala.' },
        { options: ['"I don\'t want to wait."', '"I no want wait."', '"I want not wait."'], correct: 0,
          explanation: 'Negativa: don\'t + want + to + verbo base. "I don\'t want to wait".',
          tip: 'Negativa: don\'t/doesn\'t + want + to + verbo base.' },
        { options: ['"You want to come?"', '"Do you want to come?"', '"Want you come?"'], correct: 1,
          explanation: 'Pergunta: do/does + sujeito + want to + verbo base. "Do you want to come?"',
          tip: 'Pergunta: Do you/Does she want to + verbo base?' }
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
      const selectedIndex = Array.isArray(blank.options) ? blank.options.indexOf(selected) : 0;
      try {
        void _submitStandaloneExerciseToBackend(slug, 100 + blankIndex, Math.max(selectedIndex, 0), {
          is_correct: true,
          source: 'anchor_blank'
        });
      } catch (e) {}
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
    const isCorrect = optIdx === exercise.correct;

    const allBtns = document.querySelectorAll(`#options-${slug}-${exIndex} .lp-exercise-option`);
    allBtns.forEach(b => b.disabled = true);

    if (isCorrect) {
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

    try {
      void _submitStandaloneExerciseToBackend(slug, 200 + exIndex, optIdx, {
        is_correct: isCorrect,
        source: 'scaffolded_exercise'
      });
    } catch (e) {}
  }

  function nextPhase(slug, phase) {
    const targetEl = document.getElementById(`phase-${phase}-${slug}`)
      || document.getElementById(`${phase}-${slug}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function checkFinalTest(slug, qIdx, optIdx, button) {
    const test = FINAL_TESTS[slug][qIdx];
    const qEl = document.getElementById(`test-q-${slug}-${qIdx}`);
    if (!test || qEl.dataset.answered) return;
    qEl.dataset.answered = '1';
    const isCorrect = optIdx === test.correct;

    const allBtns = document.querySelectorAll(`#test-q-${slug}-${qIdx} .lp-test-option`);
    allBtns.forEach(b => b.disabled = true);

    if (isCorrect) {
      button.classList.add('is-correct');
      window._testScore = (window._testScore || 0) + 1;
    } else {
      button.classList.add('is-wrong');
      const correct = allBtns[test.correct];
      if (correct) correct.classList.add('show-correct');
    }

    try {
      void _submitStandaloneExerciseToBackend(slug, 300 + qIdx, optIdx, {
        is_correct: isCorrect,
        source: 'final_test'
      });
    } catch (e) {}

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
    const wrong = totalQ - score;
    const pct = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;

    let emoji, headline;
    if (pct === 100)     { emoji = '🎉'; headline = 'Perfeito! Você acertou tudo!'; }
    else if (pct >= 70)  { emoji = '👍'; headline = 'Muito bom! Continue assim!'; }
    else if (pct >= 50)  { emoji = '📚'; headline = 'Bom esforço! Continue praticando.'; }
    else                 { emoji = '💪'; headline = 'Continue praticando! Você vai melhorar!'; }

    const resultEl = document.getElementById(`test-result-${slug}`);
    resultEl.innerHTML = `
      <div class="lp-result-box is-passed">
        <h3>${emoji} ${headline}</h3>
        <div class="lp-result-stats">
          <span class="lp-result-stat lp-result-correct">✓ ${score} certa${score !== 1 ? 's' : ''}</span>
          ${wrong > 0 ? `<span class="lp-result-stat lp-result-wrong">✗ ${wrong} errada${wrong !== 1 ? 's' : ''}</span>` : ''}
          <span class="lp-result-stat lp-result-pct">${pct}% de acerto</span>
        </div>
      </div>`;
    resultEl.style.display = 'block';

    // Marcar como concluída automaticamente ao responder todas as questões
    const completeBtn = document.getElementById(`test-complete-${slug}`);
    if (completeBtn) completeBtn.style.display = 'none';
    setLessonCompleted(slug);
    _updateAsideBtnAfterComplete(slug);
    showCompletionCelebration(slug);
  }

  function completeLesson(slug) {
    window._griloMarkComplete && window._griloMarkComplete(slug);
  }

  function _updateAsideBtnAfterComplete(slug) {
    const btn = document.querySelector(`.lp-aside-complete-btn[data-slug="${slug}"]`);
    if (!btn) return;
    btn.textContent = '✓ Aula concluída';
    btn.classList.add('is-done');
    btn.disabled = true;
  }

  const PROGRESS_KEY = 'grilo_lesson_progress';
  const LESSON_KEYS  = Object.keys(lessons);
  const exerciseScores = {};
  const API_BASE_URL = '';  // Use relative URLs (/api/...) instead of absolute origin

  // Debug: log the API URL being used
  console.log('[LESSONS] API_BASE_URL:', API_BASE_URL, 'window.location.origin:', window.location.origin);

  // ─── Utilitários de infraestrutura ──────────────────────────

  function safeLocalStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn('[GRILO] localStorage quota excedida — limpando entradas antigas');
        try {
          Object.keys(localStorage)
            .filter(k => k.startsWith('grilo_') && k !== 'grilo_token' && k !== 'grilo_user')
            .slice(0, 3)
            .forEach(k => localStorage.removeItem(k));
          localStorage.setItem(key, value);
          return true;
        } catch (e2) { return false; }
      }
      return false;
    }
  }

  async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    let delay = 300;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const res = await fetch(url, options);
        if (res.ok || res.status < 500) return res;
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
        }
        return res;
      } catch (e) {
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
        } else {
          throw e;
        }
      }
    }
  }

  const STANDALONE_BACKEND_IDS = {
    // Module 1
    'pronomes':              1,
    'perguntas':             2,
    'negativa':              3,
    'passado':               4,
    'preposicoes':           5,
    'verbos':                6,
    // Module 2
    'soa1-alfabeto':         7,
    'soa1-numeros':          8,
    'soa1-cumprimentos':     9,
    'soa1-tobe-afirm':       10,
    'soa2-pronomes-sujeito': 11,
    'soa2-tobe-perg-neg':    12,
    'soa2-possessivos':      13,
    'soa2-this-that':        14,
    // Module 3
    'soa3-present-afirm':     15,
    'soa3-third-person-s':    16,
    'soa3-present-continuous': 17,
    'soa3-frequencia':        18,
    // Module 4
    'soa4-wh-questions':     19,
    'soa4-prep-tempo':       20,
    'soa4-rotina':           21,
    // Module 5
    'soa5-past-regular':     22,
    'soa5-past-perguntas':   23,
    'soa5-past-negativa':    24,
    // Module 6
    'soa6-can':              25,
    'soa6-like-ing':         26,
    'soa6-want-to':          27,
  };

  // Expõe os dados das aulas pro lessons-trainer-bridge.js poder montar
  // frases locais para as aulas que ainda não têm backend ID.
  window._lessonsData = lessons;

  // Gateway para abrir aulas — usado pelo lessons-trail.js para reorganização visual.
  window._griloOpenLesson = function(slug, triggerEl) {
    showLessonContent(slug, triggerEl);
  };

  function getAuthToken() {
    try { return localStorage.getItem('grilo_token'); }
    catch (e) { return null; }
  }

  function getCurrentUserId() {
    try {
      const raw = localStorage.getItem('grilo_user');
      const user = raw ? JSON.parse(raw) : null;
      return user && user.id != null ? String(user.id) : null;
    } catch (e) {
      return null;
    }
  }

  async function trackLessonsPageView(source = 'lessons_html') {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/lessons/page-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ source })
      });

      if (response.ok) {
        safeLocalStorage('grilo_analytics_ping', String(Date.now()));
      }
    } catch (e) {
      console.warn('[LESSONS-STANDALONE] page-view error:', e);
    }
  }

  function getProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function saveProgress(p) {
    safeLocalStorage(PROGRESS_KEY, JSON.stringify(p));
  }

  function getStandaloneLessonScoreSummary(slug) {
    const lesson = lessons[slug];
    if (!lesson) {
      return { correct_answers: 0, total_questions: 1 };
    }

    if (ANCHOR_DIALOGS[slug] || SCAFFOLDED_EXERCISES[slug] || FINAL_TESTS[slug]) {
      const anchorBlanks = (ANCHOR_DIALOGS[slug] && ANCHOR_DIALOGS[slug].blanks) || [];
      const scaffoldedExercises = SCAFFOLDED_EXERCISES[slug] || [];
      const finalTests = FINAL_TESTS[slug] || [];

      const anchorCorrect = anchorBlanks.filter((_, index) =>
        document.getElementById(`blank-${slug}-${index}`)?.classList.contains('is-filled')
      ).length;
      const scaffoldedCorrect = scaffoldedExercises.filter((_, index) =>
        document.querySelector(`#exercise-${slug}-${index} .lp-exercise-option.is-correct`)
      ).length;
      const finalCorrect = Math.min(Number(window._testScore || 0), finalTests.length);

      const totalQuestions = anchorBlanks.length + scaffoldedExercises.length + finalTests.length;
      const correctAnswers = anchorCorrect + scaffoldedCorrect + finalCorrect;

      return {
        correct_answers: Math.max(correctAnswers, 0),
        total_questions: Math.max(totalQuestions, 1)
      };
    }

    const sectionScores = Object.entries(exerciseScores)
      .filter(([key]) => key.startsWith(`${slug}-`))
      .map(([, value]) => value);

    if (sectionScores.length > 0) {
      return {
        correct_answers: sectionScores.reduce((sum, value) => sum + (value.correct || 0), 0),
        total_questions: Math.max(sectionScores.reduce((sum, value) => sum + (value.total || 0), 0), 1)
      };
    }

    const totalQuestions = (lesson.sections || []).reduce(
      (sum, section) => sum + (((section && section.exercises) || []).length),
      0
    );

    return {
      correct_answers: 0,
      total_questions: Math.max(totalQuestions, 1)
    };
  }

  function markLessonBackendSynced(slug) {
    const p = getProgress();
    if (!p[slug]) return;
    p[slug].backendSynced = true;
    p[slug].backendSyncedAt = new Date().toISOString();
    saveProgress(p);
  }

  async function syncLessonCompletionToBackend(slug) {
    const lessonId = STANDALONE_BACKEND_IDS[slug];
    const authToken = getAuthToken();
    const currentUserId = getCurrentUserId();
    const status = getLessonStatus(slug);
    const scoreSummary = status.scoreSummary || getStandaloneLessonScoreSummary(slug);

    if (!lessonId || !authToken || !status.completed || status.backendSynced) return;
    if (status.ownerId && currentUserId && status.ownerId !== currentUserId) return;

    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/api/lessons/${lessonId}/save-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(scoreSummary)
      });

      if (res.ok) {
        markLessonBackendSynced(slug);
      }
    } catch (e) {
      console.error('[LESSONS-STANDALONE] Sync error:', e);
    }
  }

  function syncPendingLessonCompletions() {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    LESSON_KEYS.forEach((slug) => {
      const status = getLessonStatus(slug);
      if (!status.completed || status.backendSynced || status.ownerId !== currentUserId) return;
      void syncLessonCompletionToBackend(slug);
    });
  }

  function setLessonVisited(slug) {
    const p = getProgress();
    const currentUserId = getCurrentUserId();
    if (!p[slug]) p[slug] = {};
    if (currentUserId) p[slug].ownerId = currentUserId;
    if (!p[slug].visited) {
      p[slug].visited = true;
      saveProgress(p);
      renderLessonsCards();
      updateHeroProgress();
    }
  }

  function setLessonCompleted(slug) {
    const p = getProgress();
    const currentUserId = getCurrentUserId();
    const scoreSummary = getStandaloneLessonScoreSummary(slug);
    if (!p[slug]) p[slug] = {};
    p[slug].visited = true;
    p[slug].completed = true;
    p[slug].scoreSummary = scoreSummary;
    if (currentUserId) p[slug].ownerId = currentUserId;
    saveProgress(p);
    renderLessonsCards();
    updateHeroProgress();
    void syncLessonCompletionToBackend(slug);
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

    el.style.display = 'flex';
    const pct = Math.round((done / total) * 100);
    window.requestAnimationFrame(() => {
      fill.style.width = pct + '%';
      el.classList.add('is-loaded');
    });

    if (done === total) {
      label.innerHTML = `<strong>Todas as ${total} aulas concluídas!</strong>`;
    } else if (done > 0) {
      label.innerHTML = `<strong>${done}</strong> de ${total} aulas concluídas`;
    } else if (inProg > 0) {
      label.innerHTML = `${inProg} aula${inProg > 1 ? 's' : ''} em progresso`;
    } else {
      label.innerHTML = `<strong>${total}</strong> aulas disponíveis — comece quando quiser`;
    }
  }

  let lessonsRevealArmed = false;
  const LESSON_MODAL_ANIM_MS = 620;
  let lessonModalCloseTimer = null;
  let lastLessonTriggerRect = null;
  const lessonAsideCollapsed = false; // state owned by modal-interactions.js via localStorage

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

  function syncLessonAsideState() {
    // State is owned by modal-interactions.js — just re-apply it after aside re-render
    if (typeof window._applyAsideState === 'function') window._applyAsideState();
  }

  function toggleLessonAside() {
    const toggle = document.getElementById('lessonAsideToggle');
    if (toggle) toggle.click();
  }

  function closeLessonModal() {
    const modal = document.getElementById('lessonContent');
    if (!modal || modal.hasAttribute('hidden') || modal.classList.contains('is-closing')) return;
    modal.classList.remove('active');
    modal.classList.add('is-closing');
    document.title = 'Módulo A1 — GRILO';

    const griloFab = document.getElementById('griloFab');
    if (griloFab) { griloFab.hidden = true; griloFab.classList.remove('is-open'); }
    const griloPanel = document.getElementById('griloChatPanel');
    if (griloPanel) griloPanel.hidden = true;

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
    const asideToggle = document.getElementById('lessonAsideToggle');
    const modal = document.getElementById('lessonContent');

    if (cosmos) {
      cosmos.classList.remove('is-revealing');
      cosmos.classList.add('is-revealed');
    }

    if (banner && !lessonsRevealArmed) {
      lessonsRevealArmed = true;
      banner.addEventListener('mouseenter', revealLessonsStage, { once: true });
    }

    // Botão "🎙 Treinar 5 frases" — abre o phrase voice trainer da aula atual
    const phraseVoiceBtn = document.getElementById('lessonPhraseVoiceBtn');
    if (phraseVoiceBtn && !phraseVoiceBtn.dataset.bound) {
      phraseVoiceBtn.dataset.bound = '1';
      phraseVoiceBtn.addEventListener('click', () => {
        const slug = window._currentLessonSlug;
        const title = window._currentLessonTitle || 'Aula';
        const lessonRef = STANDALONE_BACKEND_IDS[slug] || slug;
        if (typeof window.openPhraseVoiceTrainer !== 'function') {
          (window.showGriloToast || alert)('O treinador de voz não carregou. Recarregue a página para tentar de novo.', 'error');
          return;
        }
        window.openPhraseVoiceTrainer(lessonRef, title);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeLessonModal);
    }

    if (asideToggle) {
      asideToggle.addEventListener('click', toggleLessonAside);
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

    syncLessonAsideState();
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

  // ========== PROGRESSO DE FRASES (X/100 nos cards) ==========

  // Mapa: backendLessonId (1001..1008) → { dominated, total }
  let phraseProgressMap = {};

  async function loadPhraseProgressForCards() {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/api/lessons/progress-extended`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.success) return;

      const out = {};
      const progress = data.progress || {};
      const totals = data.totals_by_lesson || {};
      // Cobre tanto IDs com progresso registrado quanto IDs só com banco populado
      const allIds = new Set([
        ...Object.keys(progress).map(k => parseInt(k, 10)),
        ...Object.keys(totals).map(k => parseInt(k, 10)),
      ]);
      allIds.forEach(id => {
        const p = progress[id] || {};
        out[id] = {
          dominated: Number(p.dominated_phrases_count || 0),
          total: Number(p.total_phrases_in_lesson || totals[id] || 0),
          dominated_at: p.dominated_at || null,
        };
      });
      phraseProgressMap = out;
      // Re-render para refletir
      renderLessonsCards();
    } catch (e) {
      console.warn('[LESSONS] phrase progress load error:', e);
    }
  }

  // ========== RENDER LESSONS CARDS ==========

  // Estrutura de módulos da trilha A1
  const TRAIL_MODULES = [
    { num: '01', title: 'Primeiros passos',              meta: '4 aulas · base inicial',    slugs: ['soa1-alfabeto','soa1-numeros','soa1-cumprimentos','soa1-tobe-afirm'] },
    { num: '02', title: 'Falar sobre você e os outros',  meta: '5 aulas · identidade',       slugs: ['soa2-pronomes-sujeito','pronomes','soa2-tobe-perg-neg','soa2-possessivos','soa2-this-that'] },
    { num: '03', title: 'Ações do dia a dia',            meta: '5 aulas · present simple',   slugs: ['soa3-present-afirm','soa3-third-person-s','perguntas','negativa','soa3-frequencia'] },
    { num: '04', title: 'Onde, quando, como',            meta: '4 aulas · contexto',         slugs: ['soa4-wh-questions','preposicoes','soa4-prep-tempo','soa4-rotina'] },
    { num: '05', title: 'Falar sobre ontem',             meta: '4 aulas · past simple',      slugs: ['soa5-past-regular','passado','soa5-past-perguntas','soa5-past-negativa'] },
    { num: '06', title: 'Querer, poder, gostar',         meta: '4 aulas · expressão',        slugs: ['soa6-can','soa6-like-ing','verbos','soa6-want-to'] },
  ];

  // Ordem oficial da trilha (achatada) — usada para numeração das aulas
  // Importante: usa esta ordem em vez de Object.keys(lessons) que segue a ordem de declaração
  const TRAIL_ORDER = TRAIL_MODULES.flatMap(mod => mod.slugs);

  function buildCard(key, globalNum, status, phraseStat, cardIndex = 0) {
    const lesson = lessons[key];
    if (!lesson) return null;

    const num = String(globalNum).padStart(2, '0');
    const sectionCount = (lesson.sections || []).length;
    const progressPct = status.completed ? 100 : status.visited ? 42 : 0;
    const objectivePreview = lesson.objective.length > 84
      ? lesson.objective.substring(0, 84) + '…'
      : lesson.objective;

    const PHRASE_TARGET = 100;
    const phraseDom = phraseStat.dominated || 0;
    const isDominated = phraseStat.dominated_at != null || phraseDom >= PHRASE_TARGET;
    const phrasePct = Math.min(100, Math.round((phraseDom / PHRASE_TARGET) * 100));

    let statusBadge = '';
    if (isDominated)       statusBadge = `<span class="lp-card-status lp-card-status--dominated">★ Dominada</span>`;
    else if (status.completed) statusBadge = `<span class="lp-card-status lp-card-status--completed">✓ Aprendida</span>`;
    else if (status.visited)   statusBadge = `<span class="lp-card-status lp-card-status--visited">Em progresso</span>`;
    else                       statusBadge = `<span class="lp-card-status lp-card-status--new">Nova</span>`;

    const phrasePill = phraseStat.total > 0
      ? `<span class="lp-card-phrase-pill ${isDominated ? 'is-full' : ''}" title="Frases dominadas">🎙 ${phraseDom}/${PHRASE_TARGET}</span>`
      : '';

    const highlightPreview = lesson.highlight
      ? `<div class="lp-card-tag"><span class="lp-card-tag-quote" aria-hidden="true">"</span>${lesson.highlight}</div>`
      : '';

    const phraseBarHTML = phraseStat.total > 0
      ? `<span class="lp-card-progress-label">${phraseDom}/${PHRASE_TARGET} frases</span>
         <span class="lp-card-progress"><span class="lp-card-progress-fill ${isDominated ? 'is-full' : ''}" style="width:${phrasePct}%"></span></span>`
      : `<span class="lp-card-progress-label">${progressPct > 0 ? Math.round(progressPct) + '%' : 'Iniciar'}</span>
         <span class="lp-card-progress"><span class="lp-card-progress-fill" style="width:${progressPct}%"></span></span>`;

    const card = document.createElement('div');
    card.className = 'lp-card' + (isDominated ? ' is-dominated' : status.completed ? ' is-learned is-completed' : '');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Abrir aula: ${lesson.title}`);
    card.setAttribute('data-lesson-key', key);
    card.style.setProperty('--card-delay', `${cardIndex * 82}ms`);
    card.innerHTML = `
      <div class="lp-card-top">
        <div class="lp-card-top-left">
          <span class="lp-card-icon">${renderLessonIcon(lesson.icon)}</span>
          <div>
            <span class="lp-card-kicker">Aula ${num}</span>
            <div class="lp-card-title">${lesson.title}</div>
          </div>
        </div>
        <span class="lp-card-num">${num}</span>
      </div>
      <div class="lp-card-body">
        <div class="lp-card-desc">${objectivePreview}</div>
        ${highlightPreview}
      </div>
      <div class="lp-card-footer">
        <div class="lp-card-meta">
          ${statusBadge}
          ${phrasePill}
          <span class="lp-card-chip">${sectionCount} seções</span>
        </div>
        <div class="lp-card-progress-wrap">${phraseBarHTML}</div>
        <span class="lp-card-cta" aria-hidden="true">→</span>
      </div>
    `;
    return card;
  }

  function renderLessonsCards() {
    const container = document.getElementById('lessonsCardsContainer');
    if (!container) return;

    const progress = getProgress();
    container.innerHTML = '';

    let globalNum = 1;
    let cardIndex = 0;
    TRAIL_MODULES.forEach(mod => {
      // Cabeçalho do módulo
      const head = document.createElement('div');
      head.className = 'lv4-module-head';
      head.innerHTML = `
        <div class="lv4-module-num">${mod.num}</div>
        <h2 class="lv4-module-title">${mod.title}</h2>
        <div class="lv4-module-line" aria-hidden="true"></div>
        <span class="lv4-module-meta">${mod.meta}</span>
      `;
      container.appendChild(head);

      // Cards do módulo
      mod.slugs.forEach(key => {
        if (!lessons[key]) { globalNum++; return; }
        const backendId = STANDALONE_BACKEND_IDS[key];
        const phraseStat = (backendId && phraseProgressMap[backendId]) || { dominated: 0, total: 0, dominated_at: null };
        const card = buildCard(key, globalNum, progress[key] || {}, phraseStat, cardIndex);
        if (card) container.appendChild(card);
        globalNum++;
        cardIndex++;
      });
    });
  }

  function initCardsEventDelegation() {
    // Único listener, no document, sem flags — simples e robusto
    document.addEventListener('click', (e) => {
      if (e.target.closest('button, a, input, textarea, select')) return;
      const card = e.target.closest('[data-lesson-key]');
      if (!card) return;
      showLessonContent(card.dataset.lessonKey, card);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('[data-lesson-key]');
      if (!card) return;
      e.preventDefault();
      showLessonContent(card.dataset.lessonKey, card);
    });
  }

  // ========== SHOW LESSON CONTENT ==========

  function showLessonContent(slug, triggerEl) {
    const lesson = lessons[slug];
    if (!lesson) {
      console.error('[LESSONS] Aula não encontrada:', slug);
      return;
    }

    console.log('[LESSONS] Abrindo aula:', slug, lesson.title);

    // Rastreia a aula aberta para o botão "Treinar 5 frases"
    window._currentLessonSlug = slug;
    window._currentLessonTitle = lesson.title;

    // Prepara contexto completo da aula para o chat do Grilo
    try {
      const griloCtx = (typeof _griloBuildLessonContext === 'function') ? _griloBuildLessonContext(slug) : null;
      if (griloCtx) sessionStorage.setItem('grilo_lesson_context', JSON.stringify(griloCtx));
      window._griloChatHistory = [];
      const msgs = document.getElementById('griloChatMessages');
      if (msgs) msgs.innerHTML = '';
    } catch (e) {}

    revealLessonsStage();

    const modal = document.getElementById('lessonContent');
    const aside = document.getElementById('lessonModalAside');
    const main  = document.getElementById('lessonModalMain');
    const crumb = document.getElementById('lessonModalCrumb');
    if (!modal) {
      console.error('[LESSONS] Modal não encontrado no DOM');
      return;
    }

    updateLessonModalMotion(triggerEl);
    window.clearTimeout(lessonModalCloseTimer);
    modal.classList.remove('is-closing');

    // Skeleton enquanto o conteúdo é montado
    if (aside) aside.classList.add('is-loading');
    if (main) main.classList.add('is-loading');

    // Usa a ordem oficial da trilha (não a ordem de declaração no objeto lessons)
    const trailIndex = TRAIL_ORDER.indexOf(slug);
    const index = trailIndex >= 0 ? trailIndex : LESSON_KEYS.indexOf(slug);
    const num    = String(index + 1).padStart(2, '0');
    const status = getLessonStatus(slug);

      setLessonVisited(slug);

      // Track access in backend for standalone lessons when authenticated
      try {
        const standaloneLessonId = STANDALONE_BACKEND_IDS[slug];
        const token = getAuthToken();
        if (standaloneLessonId && token) {
          fetch(`${API_BASE_URL}/api/lessons/${standaloneLessonId}/track-access`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          }).then((response) => {
            if (response.ok) {
              safeLocalStorage('grilo_analytics_ping', String(Date.now()));
            }
          }).catch(err => console.warn('[LESSONS-STANDALONE] track-access failed:', err));
        }
      } catch (e) {
        console.warn('[LESSONS-STANDALONE] track-access error:', e);
      }

    // ── topbar breadcrumb ──
    const crumbLesson = document.getElementById('lessonModalCrumbLesson');
    if (crumbLesson) crumbLesson.textContent = `Aula ${num} — ${lesson.title}`;

    // ── sidebar ──
    const hasPedagogical = !!(ANCHOR_DIALOGS[slug] || INTERACTIVE_TABLES[slug] || SCAFFOLDED_EXERCISES[slug] || FINAL_TESTS[slug]);
    if (aside) {
      const lessonSections = lesson.sections || [];
      const editorialNav = hasPedagogical
        ? [
            { id: `overview-${slug}`, label: 'Visão da aula' },
            ...lessonSections.map((sec, i) => ({ id: `concept-${slug}-${i}`, label: sec.title })),
            ...(ANCHOR_DIALOGS[slug] ? [{ id: `anchor-${slug}`, label: 'Aquecimento' }] : []),
            ...(INTERACTIVE_TABLES[slug] ? [{ id: `table-${slug}`, label: 'Tabela de apoio' }] : []),
            ...(SCAFFOLDED_EXERCISES[slug] ? [{ id: `exercises-${slug}`, label: 'Prática guiada' }] : []),
            ...(FINAL_TESTS[slug] ? [{ id: `test-${slug}`, label: 'Validação final' }] : [])
          ]
        : [{ id: `overview-${slug}`, label: 'Visão da aula' }, ...lessonSections.map((sec, i) => ({ id: `msec-${slug}-${i}`, label: sec.title }))];

      const navItems = editorialNav
        .map((item) => `
          <a class="lp-aside-nav-item" href="#${item.id}"
             onclick="event.preventDefault();document.getElementById('${item.id}')?.scrollIntoView({behavior:'smooth', block:'start'})">
            <span class="lp-aside-nav-dot"></span>${item.label}
          </a>`).join('');

      const points = (lesson.teachingPoints || [])
        .map(p => `<li class="lp-aside-point">${p}</li>`).join('');

      aside.classList.remove('is-loading');
      aside.innerHTML = `
        <button id="lessonAsideToggle" class="lp-aside-toggle-btn" type="button" aria-controls="lessonModalAside" aria-expanded="true" aria-label="Ocultar painel">
          <svg class="lp-aside-menu-icon" viewBox="0 0 18 14" width="16" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>
        </button>
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
        </div>
      `;
      syncLessonAsideState();
    }

    // ── main content ──
    if (main) {
      main.classList.remove('is-loading');
      main.innerHTML = '';

      if (hasPedagogical) {
        window._testScore = 0;
        const anchorHtml = ANCHOR_DIALOGS[slug] ? `<div class="lp-peda-phase" id="anchor-${slug}">${renderAnchorDialog(slug)}</div>` : '';
        const tableHtml = INTERACTIVE_TABLES[slug] ? `<div class="lp-peda-phase" id="phase-table-${slug}">${renderInteractiveTable(slug)}</div>` : '';
        const exercisesHtml = SCAFFOLDED_EXERCISES[slug] ? `<div class="lp-peda-phase" id="phase-exercises-${slug}">${renderScaffoldedExercises(slug)}</div>` : '';
        const testHtml = FINAL_TESTS[slug] ? `<div class="lp-peda-phase" id="phase-test-${slug}">${renderFinalTest(slug)}</div>` : '';
        main.innerHTML = `
          ${renderPedagogicalOverview(slug, lesson)}
          ${anchorHtml}
          ${tableHtml}
          ${exercisesHtml}
          ${testHtml}
        `;
      } else {
        main.innerHTML = renderPedagogicalOverview(slug, lesson, { sectionIdPrefix: 'overview-concept' });

        (lesson.sections || []).forEach((sec, idx) => {
          const secEl = document.createElement('div');
          secEl.className = 'lp-msec';
          secEl.id = `msec-${slug}-${idx}`;
          const editorialSection = getPedagogicalEditorial(slug, lesson).sections?.[idx] || {};
          const coachHint = getContentCoachHint(slug, sec);

          let html = `
            <div class="lp-msec-header">
              <div class="lp-msec-num">${String(idx + 1).padStart(2, '0')}</div>
              <h2 class="lp-msec-title">${sec.title}</h2>
              ${renderGriloHint(coachHint, { wide: true, title: 'Ajuda do GRILO', ariaLabel: 'Resumo simplificado do GRILO' }) || '<span></span>'}
              <div class="lp-msec-score" id="score-${slug}-${idx}"></div>
            </div>
          `;

          if (editorialSection.summary) {
            html += `<p class="lp-peda-section-lead">${editorialSection.summary}</p>`;
          }

          if (sec.explanation) {
            html += `<p class="lp-msec-explanation">${sec.explanation}</p>`;
          }

          // ── SOUNDBOARD (M2 Sprint 1) ──
          if (sec.soundboard && Array.isArray(sec.soundboard.items) && sec.soundboard.items.length) {
            const sbTitle = sec.soundboard.title || '🔊 Pratique a pronúncia';
            html += `
              <div class="lp-soundboard">
                <div class="lp-soundboard-title">${sbTitle}</div>
                <div class="lp-soundboard-grid">
                  ${sec.soundboard.items.map(item => {
                    const safeSpeech = String(item.speech || item.word).replace(/'/g, "\\'");
                    return `
                      <button class="lp-sb-cell" type="button"
                        aria-label="Ouvir ${item.word}"
                        onclick="window._griloSpeak&&window._griloSpeak('${safeSpeech}', this)">
                        <span class="lp-sb-cell-play">▶</span>
                        <span class="lp-sb-cell-word">${item.word}</span>
                        ${item.pron ? `<span class="lp-sb-cell-pron">${item.pron}</span>` : ''}
                      </button>`;
                  }).join('')}
                </div>
              </div>`;
          }

          // ── TABELA COMPARATIVA (M3 Sprint 1) ──
          if (sec.table && Array.isArray(sec.table.rows) && sec.table.rows.length) {
            const tHeaders = Array.isArray(sec.table.headers) ? sec.table.headers : [];
            html += `
              <div class="lp-comparetable">
                ${sec.table.title ? `<div class="lp-comparetable-title">${sec.table.title}</div>` : ''}
                <div class="lp-comparetable-scroll">
                  <table class="lp-comparetable-table">
                    ${tHeaders.length ? `<thead><tr>${tHeaders.map(h => `<th>${h}</th>`).join('')}${tHeaders.length ? '<th aria-label="Áudio"></th>' : ''}</tr></thead>` : ''}
                    <tbody>
                      ${sec.table.rows.map(row => {
                        const cells = Array.isArray(row.cells) ? row.cells : [];
                        const safeSpeak = row.speak ? String(row.speak).replace(/'/g, "\\'") : '';
                        return `<tr>
                          ${cells.map((c, i) => `<td${i === 0 ? ' class="lp-ct-key"' : ''}>${c}</td>`).join('')}
                          <td class="lp-ct-audio">${safeSpeak ? `<button class="lp-ct-play" type="button" aria-label="Ouvir linha" onclick="window._griloSpeak&&window._griloSpeak('${safeSpeak}', this)">▶</button>` : ''}</td>
                        </tr>`;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>`;
          }

          if (sec.examples && sec.examples.length) {
            html += `
              <div class="lp-mex">
                <div class="lp-mex-label">📝 Exemplos</div>
                <ul class="lp-mex-list">
                  ${sec.examples.map(ex => {
                    if (typeof ex === 'string') {
                      const safeStr = ex.replace(/'/g, "\\'");
                      return `<li class="lp-mex-item"><button class="lp-ex-play" type="button" aria-label="Ouvir pronúncia" onclick="window._griloSpeak&&window._griloSpeak('${safeStr}', this)">▶</button><span class="lp-ex-en" title="Clique para ouvir">${ex}</span></li>`;
                    }
                    const _p = EXAMPLE_PRON[ex.en] || '';
                    const safeEn = ex.en.replace(/'/g, "\\'");
                    const hoverTitle = _p ? `Clique para ouvir · / ${_p} /` : 'Clique para ouvir';
                    return `<li class="lp-mex-item"><button class="lp-ex-play" type="button" aria-label="Ouvir pronúncia de ${ex.en}" onclick="window._griloSpeak&&window._griloSpeak('${safeEn}', this)">▶</button><div class="lp-ex-content"><span class="lp-ex-en" title="${hoverTitle}">${ex.en}</span>${_p ? `<span class="lp-ex-pron">/ ${_p} /</span>` : ''}${ex.pt ? `<span class="lp-ex-pt">${ex.pt}</span>` : ''}</div></li>`;
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
                    <span class="lp-exr-q-text">${ex}</span>
                    ${mc ? renderGriloHint(getExerciseCoachHint(slug, sec, ex, mc.options), { title: 'Ajuda do GRILO', ariaLabel: 'Dica do GRILO para a questão' }) : ''}
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

    syncLessonAsideState();

    modal.removeAttribute('hidden');
    window.requestAnimationFrame(() => {
      modal.classList.add('active');
    });
    const griloFab = document.getElementById('griloFab');
    if (griloFab) griloFab.hidden = false;
    document.body.style.overflow = 'hidden';
    document.title = `${lesson.title} — GRILO`;
    if (main)  main.scrollTop = 0;
    if (aside) aside.scrollTop = 0;
  }

  // ========== INITIALIZE ==========

  function _getStandaloneSectionExerciseIndex(slug, secIdx, exIdx) {
    const lesson = lessons[slug];
    if (!lesson || !Array.isArray(lesson.sections)) return exIdx;
    let exerciseIndex = 0;
    for (let s = 0; s < secIdx; s++) {
      const secExercises = (lesson.sections[s] && lesson.sections[s].exercises) || [];
      exerciseIndex += secExercises.length;
    }
    return exerciseIndex + exIdx;
  }

  // Converte o índice codificado do fluxo (0-99 seção MC, 100+ anchor, 200+ scaffolded,
  // 300+ teste final) em posição linear 1-based — alimenta o hero da home
  // ("você parou no exercício X de Y").
  function _resumeFlowPosition(slug, codedIndex) {
    const mcSections = EXERCISE_MC[slug] || [];
    const mcTotal = mcSections.reduce((n, sec) => n + ((sec && sec.length) || 0), 0);
    const anchorTotal = ((ANCHOR_DIALOGS[slug] || {}).blanks || []).length;
    const scaffTotal = (SCAFFOLDED_EXERCISES[slug] || []).length;
    const testTotal = (FINAL_TESTS[slug] || []).length;
    const total = mcTotal + anchorTotal + scaffTotal + testTotal;
    let pos;
    if (codedIndex >= 300)      pos = mcTotal + anchorTotal + scaffTotal + (codedIndex - 300) + 1;
    else if (codedIndex >= 200) pos = mcTotal + anchorTotal + (codedIndex - 200) + 1;
    else if (codedIndex >= 100) pos = mcTotal + (codedIndex - 100) + 1;
    else                        pos = codedIndex + 1;
    return { position: Math.max(1, Math.min(pos, total)), total };
  }

  async function _submitStandaloneExerciseToBackend(slug, exerciseIndex, optIdx, extra = {}) {
    try {
      const lessonId = STANDALONE_BACKEND_IDS[slug];
      const token = getAuthToken();
      if (!lessonId || !token) return;
      const flow = _resumeFlowPosition(slug, exerciseIndex);
      await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/submit-exercise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          exercise_index: exerciseIndex,
          selected_index: optIdx,
          exercise_position: flow.position,
          total_exercises: flow.total,
          ...extra
        })
      });
    } catch (e) {
      console.warn('[LESSONS-STANDALONE] submit-exercise error:', e);
    }
  }

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

    // Fire-and-forget: submit exercise to backend so analytics reflect standalone submissions
    try {
      const _mcExtra = { is_correct: isCorrect, source: 'section_exercise' };
      if (!isCorrect && mc) {
        _mcExtra.question_text = typeof btn.closest('.lp-exr-interactive')?.querySelector('.lp-exr-q-text')?.textContent === 'string'
          ? btn.closest('.lp-exr-interactive').querySelector('.lp-exr-q-text').textContent.trim()
          : '';
        _mcExtra.correct_answer = mc.options[mc.correct] || '';
        _mcExtra.wrong_answer = mc.options[optIdx] || '';
      }
      void _submitStandaloneExerciseToBackend(
        slug,
        _getStandaloneSectionExerciseIndex(slug, secIdx, exIdx),
        optIdx,
        _mcExtra
      );
    } catch (e) {}
  };

  window._griloMarkComplete = function(slug, btn) {
    setLessonCompleted(slug);
    if (btn) { btn.textContent = '✓ Aula concluída'; btn.classList.add('is-done'); btn.disabled = true; }
    showCompletionCelebration(slug);
  };

  function showCompletionCelebration(slug) {
    const existing = document.getElementById('grilo-toast-completion');
    if (existing) existing.remove();

    const lesson = lessons[slug];
    const title = lesson ? lesson.title : 'Aula';
    const toast = document.createElement('div');
    toast.id = 'grilo-toast-completion';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.style.cssText = [
      'position:fixed', 'bottom:24px', 'right:24px', 'z-index:99999',
      'background:linear-gradient(135deg,#1eab6d,#2ec87d)', 'color:#fff',
      'padding:14px 20px', 'border-radius:14px',
      'box-shadow:0 8px 32px rgba(30,171,109,0.35)',
      'font-weight:700', 'font-size:0.9rem', 'font-family:inherit',
      'display:flex', 'align-items:center', 'gap:10px',
      'transform:translateY(80px)', 'opacity:0',
      'transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s ease',
      'max-width:320px', 'line-height:1.3'
    ].join(';');
    toast.innerHTML = `<span style="font-size:1.4rem" aria-hidden="true">&#127919;</span><span>Lição concluída!<br><small style="font-weight:500;opacity:0.88">${title}</small></span>`;
    document.body.appendChild(toast);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
      });
    });

    window.setTimeout(() => {
      toast.style.transform = 'translateY(80px)';
      toast.style.opacity = '0';
      window.setTimeout(() => toast.remove(), 400);
    }, 3500);

    updateHeroProgress();
  }

  // ========== HELPER GLOBAL DE TTS (Text-to-Speech) ==========
  // Usado por botões de áudio em exemplos, soundboards, tabelas, etc.

  // Volume persistido no localStorage (0.5 = padrão, 1.0 = máximo Web Speech)
  function _getTTSVolume() {
    try {
      const v = parseFloat(localStorage.getItem('grilo_tts_volume'));
      return (isFinite(v) && v >= 0 && v <= 1) ? v : 1.0;
    } catch (e) { return 1.0; }
  }
  function _setTTSVolume(v) {
    try { localStorage.setItem('grilo_tts_volume', String(v)); } catch (e) {}
  }
  function _getTTSRate() {
    try {
      const r = parseFloat(localStorage.getItem('grilo_tts_rate'));
      return (isFinite(r) && r >= 0.5 && r <= 2) ? r : 0.92;
    } catch (e) { return 0.92; }
  }
  function _setTTSRate(r) {
    try { localStorage.setItem('grilo_tts_rate', String(r)); } catch (e) {}
  }

  // Cache da melhor voz en-US disponível (priorizar Google/Microsoft que são mais altas)
  let _bestVoice = null;
  function _findBestEnVoice() {
    if (_bestVoice) return _bestVoice;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;

    // Prioriza vozes mais nítidas e altas (Google > Microsoft > Apple > resto)
    const priorities = [
      v => /Google.*US English/i.test(v.name),
      v => /Google.*English/i.test(v.name) && v.lang === 'en-US',
      v => /Microsoft.*Aria/i.test(v.name),
      v => /Microsoft.*Jenny/i.test(v.name),
      v => /Microsoft.*Guy/i.test(v.name),
      v => /Microsoft/i.test(v.name) && v.lang === 'en-US',
      v => /Samantha/i.test(v.name),
      v => v.lang === 'en-US',
      v => v.lang && v.lang.startsWith('en')
    ];

    for (const test of priorities) {
      const found = voices.find(test);
      if (found) { _bestVoice = found; break; }
    }
    return _bestVoice;
  }

  // Pré-carrega vozes (algumas plataformas só populam após onvoiceschanged)
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.getVoices(); } catch (e) {}
    window.speechSynthesis.onvoiceschanged = function() {
      _bestVoice = null;  // invalida cache
      _findBestEnVoice();
    };
  }

  window._griloSpeak = function(text, btnEl) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      // Cancela qualquer fala em andamento
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'en-US';
      u.rate = _getTTSRate();
      u.pitch = 1.0;
      u.volume = _getTTSVolume();

      const voice = _findBestEnVoice();
      if (voice) u.voice = voice;

      // Feedback visual no botão
      if (btnEl) {
        btnEl.classList.add('is-speaking');
        u.onend = function() {
          btnEl.classList.remove('is-speaking');
        };
        u.onerror = function() {
          btnEl.classList.remove('is-speaking');
        };
      }

      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('[LESSONS] TTS error:', e);
    }
  };

  // Expõe controles para o painel de áudio
  window._griloTTS = {
    getVolume: _getTTSVolume,
    setVolume: _setTTSVolume,
    getRate: _getTTSRate,
    setRate: _setTTSRate,
    testSpeak: function() {
      window._griloSpeak('Hello! This is the audio test.', null);
    }
  };

  // ========== DELEGAÇÃO GLOBAL — CLIQUE EM TEXTO INGLÊS FALA (M7 Sprint 1) ==========
  // Permite clicar em .lp-ex-en, .lp-inline-en e qualquer [data-speak] para ouvir.
  document.addEventListener('click', function(e) {
    // Ignora cliques em botões já tratados (evita duplo trigger)
    if (e.target.closest('.lp-ex-play, .lp-sb-cell, .lp-ct-play, button')) return;

    // Procura elemento "falável" mais próximo
    const speakable = e.target.closest('[data-speak], .lp-ex-en, .lp-inline-en');
    if (!speakable) return;

    // Texto: preferir data-speak (override) → textContent
    const text = speakable.getAttribute('data-speak') || speakable.textContent || '';
    if (!text.trim()) return;

    // Pulse visual ao clicar
    speakable.classList.add('is-speaking-inline');
    setTimeout(() => speakable.classList.remove('is-speaking-inline'), 800);

    window._griloSpeak(text.trim(), null);
  });

  function _griloBuildLessonContext(slug) {
    const lesson = lessons[slug];
    if (!lesson) return null;
    const sections = (lesson.sections || []).map(s => ({
      title: s.title || '',
      explanation: s.explanation || '',
      examples: (s.examples || []).map(e => ({ en: e.en || '', pt: e.pt || '' }))
    }));
    return {
      slug,
      title: lesson.title || '',
      objective: lesson.objective || '',
      teaching_points: lesson.teachingPoints || [],
      sections
    };
  }

  window._griloOpenChat = function(slug) {
    const ctx = _griloBuildLessonContext(slug);
    if (ctx) {
      try { sessionStorage.setItem('grilo_lesson_context', JSON.stringify(ctx)); } catch (e) {}
      window._griloChatHistory = [];
    }
    window._griloToggleChat && window._griloToggleChat(true);
  };

  window._griloToggleChat = function(forceOpen) {
    const panel = document.getElementById('griloChatPanel');
    const fab = document.getElementById('griloFab');
    if (!panel) return;
    const open = forceOpen !== undefined ? forceOpen : panel.hidden;
    panel.hidden = !open;
    if (fab) fab.classList.toggle('is-open', open);
    if (open) {
      const input = document.getElementById('griloChatInput');
      if (input) input.focus();
      const msgs = document.getElementById('griloChatMessages');
      if (msgs && msgs.children.length === 0) {
        const ctx = (() => { try { return JSON.parse(sessionStorage.getItem('grilo_lesson_context') || '{}'); } catch(e) { return {}; } })();
        _griloAppendMsg('assistant', ctx.title ? `Olá! Estou aqui pra te ajudar com a aula "${ctx.title}". Pode perguntar!` : 'Olá! Como posso te ajudar com esta aula?');
      }
    }
  };

  window._griloSendMessage = async function() {
    const input = document.getElementById('griloChatInput');
    const msg = input?.value?.trim();
    if (!msg) return;
    const sendBtn = document.getElementById('griloChatSend');
    if (sendBtn) sendBtn.disabled = true;
    const ctx = (() => { try { return JSON.parse(sessionStorage.getItem('grilo_lesson_context') || '{}'); } catch(e) { return {}; } })();
    if (!ctx || !ctx.slug) {
      _griloAppendMsg('assistant', 'Abra uma aula primeiro pra eu poder te ajudar com o conteúdo dela.');
      if (sendBtn) sendBtn.disabled = false;
      return;
    }
    _griloAppendMsg('user', msg);
    input.value = '';
    window._griloChatHistory = window._griloChatHistory || [];
    window._griloChatHistory.push({ role: 'user', content: msg });

    const visibleSectionTitle = (() => {
      try {
        const sections = document.querySelectorAll('#lessonContent .lesson-section, #lessonContent [data-section-title]');
        for (const el of sections) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top < window.innerHeight * 0.6) {
            return el.dataset.sectionTitle || el.querySelector('h2,h3')?.textContent?.trim() || '';
          }
        }
      } catch (e) {}
      return '';
    })();

    try {
      const token = getAuthToken();
      if (!token) {
        _griloAppendMsg('assistant', 'Você precisa estar logado para usar o assistente. Faça login e tente novamente.');
        return;
      }
      const res = await fetch('/api/lessons/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          question: msg,
          lesson_context: { ...ctx, current_section_title: visibleSectionTitle },
          history: window._griloChatHistory.slice(-6)
        })
      });
      if (res.status === 401) {
        _griloAppendMsg('assistant', 'Sessão expirada. Faça login novamente para continuar.');
        return;
      }
      if (!res.ok) {
        _griloAppendMsg('assistant', 'Erro ao processar sua pergunta. Tente novamente.');
        return;
      }
      const data = await res.json();
      const reply = data.reply || '...';
      _griloAppendMsg('assistant', reply);
      window._griloChatHistory.push({ role: 'assistant', content: reply });
    } catch (e) {
      _griloAppendMsg('assistant', 'Erro ao conectar. Verifique sua conexão e tente novamente.');
    } finally {
      if (sendBtn) sendBtn.disabled = false;
      input?.focus();
    }
  };

  function _griloAppendMsg(role, text) {
    const container = document.getElementById('griloChatMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `lp-grilo-chat__msg lp-grilo-chat__msg--${role}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('griloChatInput');
    if (chatInput) {
      chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window._griloSendMessage(); }
      });
    }
  });

  // ── Category bar ──────────────────────────────────────────
  function initCategoryBar() {
    const bar = document.getElementById('categoryBar');
    if (!bar) return;
    bar.addEventListener('click', (e) => {
      const tab = e.target.closest('.lp-cat-tab');
      if (!tab) return;
      bar.querySelectorAll('.lp-cat-tab').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      // category filtering is visual-only for now — cards come from backend per category
      // TODO: wire to backend category filter when API supports it
    });
  }

  // ── Lesson search ─────────────────────────────────────────
  function initLessonSearch() {
    const input = document.getElementById('lessonSearch');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      const container = document.getElementById('lessonsCardsContainer');
      if (!container) return;
      Array.from(container.children).forEach(card => {
        const title = (card.querySelector('.lp-card-title') || {}).textContent || '';
        const desc  = (card.querySelector('.lp-card-desc')  || {}).textContent || '';
        const match = !q || title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
        card.style.display = match ? '' : 'none';
      });
    });
  }

  // Expõe fetchWithRetry para outros módulos (ex: phrase-voice-trainer)
  window.GriloVR = window.GriloVR || {};
  window.GriloVR._fetchWithRetry = fetchWithRetry;

  renderLessonsCards();
  updateHeroProgress();
  initLessonsChrome();
  initCategoryBar();
  initLessonSearch();
  initCardsEventDelegation();
  syncPendingLessonCompletions();
  void trackLessonsPageView();

  // Carrega o progresso de frases (X/100) e re-renderiza
  void loadPhraseProgressForCards();
  // Expor para o phrase-voice-trainer chamar ao final da sessão
  window.loadLessonProgress = loadPhraseProgressForCards;
  window.loadPhraseProgressForCards = loadPhraseProgressForCards;
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
  window.toggleLessonAside = toggleLessonAside;

  console.log('[LESSONS-ENHANCED] Script carregado. window._griloOpenLesson disponível:', typeof window._griloOpenLesson === 'function');
})();
