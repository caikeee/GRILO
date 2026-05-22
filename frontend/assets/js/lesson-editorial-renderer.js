/**
 * lesson-editorial-renderer.js
 *
 * Renderização editorial para todas as 26 aulas da trilha.
 * Cada aula usa componentes variados (le-map, le-soundboard, le-compare, etc.)
 * organizados conforme a natureza pedagógica do conteúdo.
 *
 * Hook: intercepts window._griloOpenLesson e aplica layout editorial via
 * applyEditorialIfAvailable(slug) quando disponível.
 */

(function() {
    'use strict';

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    function moduleOf(slug) {
        if (slug.startsWith('soa1-')) return '01';
        if (slug.startsWith('soa2-') || slug === 'pronomes') return '02';
        if (slug.startsWith('soa3-') || slug === 'perguntas' || slug === 'negativa') return '03';
        if (slug.startsWith('soa4-') || slug === 'preposicoes') return '04';
        if (slug.startsWith('soa5-') || slug === 'passado') return '05';
        if (slug.startsWith('soa6-') || slug === 'verbos') return '06';
        return '00';
    }

    function renderTrainCTA(slug, title) {
        return `
        <section class="le-train">
            <div class="le-train-inner">
                <p class="le-train-kicker">prove que aprendeu</p>
                <h2 class="le-train-title">Agora <em>fala</em>. Cinco frases. Sua voz.</h2>
                <p class="le-train-sub">O treino de voz pega o que você acabou de ler e pede pra você dizer em voz alta. Não é teste — é fixação real, no seu ritmo.</p>
                <button class="le-train-btn" onclick="(function(){const btn=document.getElementById('lessonPhraseVoiceBtn'); if(btn) btn.click();})()">Começar treino de voz</button>
            </div>
        </section>`;
    }

    function renderCuriosities(curiosities) {
        if (!Array.isArray(curiosities) || curiosities.length === 0) return '';
        return `
        <section class="le-curiosities">
            <h3 class="le-curiosities-title">Sabia que…</h3>
            ${curiosities.map(c => `<p class="le-curiosity">${escapeHtml(c)}</p>`).join('')}
        </section>`;
    }

    function renderExamples(examples, opts = {}) {
        if (!Array.isArray(examples) || examples.length === 0) return '';
        return `
        <div class="le-examples">
            ${examples.map((ex, i) => {
                const en = typeof ex === 'string' ? ex : ex.en;
                const pt = typeof ex === 'string' ? '' : ex.pt;
                return `
                <div class="le-example">
                    <span class="le-example-num">${String(i+1).padStart(2,'0')}</span>
                    <div class="le-example-body">
                        <span class="le-example-en">${escapeHtml(en)}</span>
                        ${pt ? `<span class="le-example-pt">${escapeHtml(pt)}</span>` : ''}
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    }

    // ============================================================
    // HELPERS NOVOS — Componentes customizados
    // ============================================================

    function renderSoundboard(items) {
        if (!Array.isArray(items) || items.length === 0) return '';
        return `
        <div class="le-soundboard">
            ${items.map(item => `
                <button class="le-sound-btn" onclick="(function(){if('speechSynthesis' in window){var u=new SpeechSynthesisUtterance('${item.speechText || item.word}'); u.lang='en-US'; speechSynthesis.speak(u);}})()">
                    <span class="le-sound-btn-play">▶</span>
                    <span class="le-sound-btn-body">
                        <span class="le-sound-btn-word">${escapeHtml(item.word)}</span>
                        <span class="le-sound-btn-pron">${escapeHtml(item.pron)}</span>
                    </span>
                </button>
            `).join('')}
        </div>`;
    }

    function renderCompare(ptObj, enObj) {
        return `
        <div class="le-compare">
            <div class="le-compare-side le-compare-side--pt">
                <span class="le-compare-flag">${escapeHtml(ptObj.flag)}</span>
                <span class="le-compare-text">${ptObj.text}</span>
                <p class="le-compare-note">${escapeHtml(ptObj.note)}</p>
            </div>
            <div class="le-compare-side le-compare-side--en">
                <span class="le-compare-flag">${escapeHtml(enObj.flag)}</span>
                <span class="le-compare-text">${enObj.text}</span>
                <p class="le-compare-note">${escapeHtml(enObj.note)}</p>
            </div>
        </div>`;
    }

    function renderMap(title, cells) {
        if (!Array.isArray(cells) || cells.length === 0) return '';
        return `
        <div class="le-map">
            <div class="le-map-head">
                <h3 class="le-map-title">${escapeHtml(title)}</h3>
            </div>
            <div class="le-map-grid">
                ${cells.map(cell => `
                    <div class="le-map-cell">
                        <div class="le-map-cell-label">${escapeHtml(cell.label)}</div>
                        ${cell.sub ? `<div class="le-map-cell-sub">${escapeHtml(cell.sub)}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>`;
    }

    function renderDialog(title, bubbles) {
        if (!Array.isArray(bubbles) || bubbles.length === 0) return '';
        return `
        <div class="le-dialog">
            <div class="le-dialog-head">
                <div class="le-dialog-head-icon">💬</div>
                <div class="le-dialog-head-title">${escapeHtml(title)}</div>
            </div>
            ${bubbles.map(b => `
                <div class="le-dialog-bubble le-dialog-bubble--${b.side}">
                    <span>${escapeHtml(b.en)}</span>
                    ${b.pt ? `<span class="le-dialog-bubble-pt">${escapeHtml(b.pt)}</span>` : ''}
                </div>
            `).join('')}
        </div>`;
    }

    function renderTimeline(steps) {
        if (!Array.isArray(steps) || steps.length === 0) return '';
        return `
        <div class="le-timeline">
            ${steps.map(step => `
                <div class="le-timeline-step">
                    ${step.when ? `<span class="le-timeline-when">${escapeHtml(step.when)}</span>` : ''}
                    <div class="le-timeline-text">${step.text}</div>
                    ${step.detail ? `<div class="le-timeline-detail">${escapeHtml(step.detail)}</div>` : ''}
                </div>
            `).join('')}
        </div>`;
    }

    function renderError(text, fix) {
        return `
        <div class="le-error">
            <div class="le-error-label">cuidado com isso</div>
            <p class="le-error-text">${escapeHtml(text)}</p>
            <p class="le-error-fix">${fix}</p>
        </div>`;
    }

    function renderCase(scene, lines) {
        if (!Array.isArray(lines)) lines = [];
        return `
        <div class="le-case">
            <div class="le-case-kicker">caso real</div>
            <div class="le-case-scene">${escapeHtml(scene)}</div>
            ${lines.map(line => `<div class="le-case-line">${line}</div>`).join('')}
        </div>`;
    }

    // ============================================================
    // LAYOUTS POR AULA — 26 Total (Módulos 01–06)
    // ============================================================

    const LAYOUTS = {

        // ─────────────────────────────────────────────────────────
        // MÓDULO 01 — Primeiros passos (âmbar #C9916B)
        // ─────────────────────────────────────────────────────────

        'soa1-alfabeto': function(lesson) {
            const allLetters = [
                { word: 'A', pron: '/ ei /', speechText: 'A' },
                { word: 'B', pron: '/ bi /', speechText: 'B' },
                { word: 'C', pron: '/ si /', speechText: 'C' },
                { word: 'D', pron: '/ di /', speechText: 'D' },
                { word: 'E', pron: '/ i /', speechText: 'E' },
                { word: 'F', pron: '/ ef /', speechText: 'F' },
                { word: 'G', pron: '/ dji /', speechText: 'G' },
                { word: 'H', pron: '/ eitch /', speechText: 'H' },
                { word: 'I', pron: '/ ai /', speechText: 'I' },
                { word: 'J', pron: '/ jei /', speechText: 'J' },
                { word: 'K', pron: '/ kei /', speechText: 'K' },
                { word: 'L', pron: '/ el /', speechText: 'L' },
                { word: 'M', pron: '/ em /', speechText: 'M' },
                { word: 'N', pron: '/ en /', speechText: 'N' },
                { word: 'O', pron: '/ ou /', speechText: 'O' },
                { word: 'P', pron: '/ pi /', speechText: 'P' },
                { word: 'Q', pron: '/ kiu /', speechText: 'Q' },
                { word: 'R', pron: '/ ar /', speechText: 'R' },
                { word: 'S', pron: '/ es /', speechText: 'S' },
                { word: 'T', pron: '/ ti /', speechText: 'T' },
                { word: 'U', pron: '/ iu /', speechText: 'U' },
                { word: 'V', pron: '/ vi /', speechText: 'V' },
                { word: 'W', pron: '/ dabôl-iu /', speechText: 'W' },
                { word: 'X', pron: '/ eks /', speechText: 'X' },
                { word: 'Y', pron: '/ uái /', speechText: 'Y' },
                { word: 'Z', pron: '/ zi (US) / zed (UK) /', speechText: 'Z' }
            ];

            return `
            <article class="le-aula" data-module="01">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 01 · primeiros passos</p>
                    <h1 class="le-manifesto-text">O inglês começa pelos <em>sons</em> que sua boca ainda não conhece.</h1>
                    <p class="le-manifesto-sub">Soletrar é a primeira ferramenta prática — em telefone, e-mail, formulário. Depois vêm os sons que travam o brasileiro: TH, R e as vogais.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">As 26 letras e seus nomes em inglês.</h2>
                    </header>
                    <p class="le-copy">As letras têm nomes próprios em inglês. O A não é "á", é "ei". O E não é "é", é "i". Aprenda a soletrar — você vai usar muito.</p>
                    ${renderSoundboard(allLetters)}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Os três sons que travam todo brasileiro.</h2>
                    </header>
                    <p class="le-copy">Existem sons que não temos em português. O TH, o R americano e as mudanças de comprimento das vogais são os maiores culpados.</p>
                    ${renderCompare(
                        { flag: 'brasileiro tende a dizer', text: '<strong>tchink</strong>', note: 'A língua não sai entre os dentes.' },
                        { flag: 'nativo diz', text: '<strong>think</strong> / θɪŋk /', note: 'Língua entre os dentes, som sorrateiro.' }
                    )}
                    ${renderError(
                        '"Ship" (navio) e "sheep" (ovelha) parecem iguais, mas a diferença é o comprimento da vogal.',
                        'A vogal em <code>ship</code> é curta e seca. Em <span class="ok">sheep</span>, é longa. Treinar a diferença é treinar percepção.'
                    )}
                </section>

                ${renderTrainCTA('soa1-alfabeto', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa1-numeros': function(lesson) {
            const numCells = [
                { label: '1', sub: 'one' }, { label: '2', sub: 'two' }, { label: '3', sub: 'three' },
                { label: '4', sub: 'four' }, { label: '5', sub: 'five' }, { label: '6', sub: 'six' },
                { label: '7', sub: 'seven' }, { label: '8', sub: 'eight' }, { label: '9', sub: 'nine' },
                { label: '10', sub: 'ten' }, { label: '11', sub: 'eleven' }, { label: '12', sub: 'twelve' },
                { label: '13', sub: 'thirteen' }, { label: '14', sub: 'fourteen' }, { label: '15', sub: 'fifteen' },
                { label: '16', sub: 'sixteen' }, { label: '17', sub: 'seventeen' }, { label: '18', sub: 'eighteen' },
                { label: '19', sub: 'nineteen' }, { label: '20', sub: 'twenty' }
            ];

            const ordinals = [
                { label: '1st', sub: 'first' }, { label: '2nd', sub: 'second' }, { label: '3rd', sub: 'third' },
                { label: '4th', sub: 'fourth' }, { label: '5th', sub: 'fifth' }, { label: '10th', sub: 'tenth' },
                { label: '20th', sub: 'twentieth' }, { label: '21st', sub: 'twenty-first' }
            ];

            return `
            <article class="le-aula" data-module="01">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 02 · primeiros passos</p>
                    <h1 class="le-manifesto-text"><em>Contar</em> é a primeira coisa que você faz num país novo.</h1>
                    <p class="le-manifesto-sub">Táxi, restaurante, data, preço — tudo passa por número. E depois do 20, o inglês fica previsível.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">De 1 a 20 — cada um tem nome próprio.</h2>
                    </header>
                    <p class="le-copy">Os primeiros doze números são todos únicos e precisam ser decorados. Depois vem um padrão: <span class="le-inline-en">thirteen</span> até <span class="le-inline-en">nineteen</span> seguem a mesma lógica.</p>
                    ${renderMap('Números de 1 a 20', numCells)}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Ordinais — primeiro, segundo, terceiro.</h2>
                    </header>
                    <p class="le-copy">Quando você quer indicar posição ou ordem, o número vira ordinal: <span class="le-inline-en">1st, 2nd, 3rd, 4th...</span> É comum em datas, rankings e instruções.</p>
                    ${renderMap('Números ordinais básicos', ordinals)}
                    ${renderCompare(
                        { flag: 'erro comum', text: 'thirteen <strong>teen</strong>', note: 'Misturar 13–19 com 20–90.' },
                        { flag: 'diferença crítica', text: '<strong>THIR</strong>teen vs twenty', note: 'O acento muda de sílaba.' }
                    )}
                </section>

                ${renderTrainCTA('soa1-numeros', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa1-cumprimentos': function(lesson) {
            return `
            <article class="le-aula" data-module="01">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 03 · primeiros passos</p>
                    <h1 class="le-manifesto-text">As primeiras 10 frases que você precisa de verdade.</h1>
                    <p class="le-manifesto-sub">Hello, goodbye, nice to meet you. As estruturas que abrem portas em qualquer situação.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Abertura — formal vs informal.</h2>
                    </header>
                    <p class="le-copy">Como você começa uma conversa depende do contexto. Com chefe: <span class="le-inline-en">Good morning</span>. Com amigo: <span class="le-inline-en">Hey, what's up?</span></p>
                    ${renderDialog('Formal vs informal', [
                        { side: 'a', en: 'Good morning. How are you?', pt: 'Bom dia. Como vai?' },
                        { side: 'b', en: 'I\'m doing well, thank you.', pt: 'Vou bem, obrigado.' },
                        { side: 'a', en: 'Hey, what\'s up?', pt: 'E aí, como vai?' },
                        { side: 'b', en: 'Not much, just chilling.', pt: 'Nada muito, só relaxando.' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Apresentação e despedida.</h2>
                    </header>
                    <p class="le-copy">Apresentar e despedir são rituais. <span class="le-inline-en">Nice to meet you</span> abre portas. <span class="le-inline-en">See you later</span> encerra com leveza.</p>
                    ${renderExamples([
                        { en: 'My name is Carlos.', pt: 'Meu nome é Carlos.' },
                        { en: 'Nice to meet you.', pt: 'Prazer em conhecer você.' },
                        { en: 'Where are you from?', pt: 'De onde você é?' },
                        { en: 'I\'m from Brazil.', pt: 'Sou do Brasil.' },
                        { en: 'It was nice talking to you.', pt: 'Foi legal conversar com você.' }
                    ])}
                    ${renderError(
                        '"Good bye" é escrito em 2 palavras e soa muito formal para despedidas do dia a dia.',
                        'Use <code>Bye!</code>, <span class="ok">See you!</span>, ou <span class="ok">See you later!</span> para soar natural.'
                    )}
                </section>

                ${renderTrainCTA('soa1-cumprimentos', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa1-tobe-afirm': function(lesson) {
            const tobeMap = [
                { label: 'I / you / we / they', sub: 'are' },
                { label: 'he / she / it', sub: 'is' },
                { label: 'I', sub: 'am' }
            ];

            return `
            <article class="le-aula" data-module="01">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 04 · primeiros passos</p>
                    <h1 class="le-manifesto-text">To be: ser, estar, idade, hora. <em>O verbo mais usado.</em></h1>
                    <p class="le-manifesto-sub">I am, you are, he is — é o verbo que você vai usar em praticamente toda frase.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">I am, you are, he is — três formas no presente.</h2>
                    </header>
                    <p class="le-copy">To be muda conforme a pessoa. Não é complexo — são só três formas: <span class="le-inline-en">am</span>, <span class="le-inline-en">are</span>, <span class="le-inline-en">is</span>.</p>
                    ${renderMap('Formas do verbo "to be"', tobeMap)}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Ser e estar em inglês é a mesma palavra.</h2>
                    </header>
                    <p class="le-copy">Em português separamos "sou" e "estou". Em inglês, "I am" cobre os dois. Aprenda a pensar neles juntos.</p>
                    ${renderCompare(
                        { flag: 'português (dois verbos)', text: '<strong>Sou</strong> professor. <strong>Estou</strong> feliz.', note: 'Identidade vs estado.' },
                        { flag: 'inglês (um verbo)', text: 'I <strong>am</strong> a teacher. I <strong>am</strong> happy.', note: 'Ambos usam "am".' }
                    )}
                    ${renderError(
                        '"I is", "he are", "you am" — combinar pessoa com forma errada é o erro número 1.',
                        'Decore a tabela: <code>I am</code>, <span class="ok">you are</span>, <span class="ok">he/she/it is</span>.'
                    )}
                </section>

                ${renderTrainCTA('soa1-tobe-afirm', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        // ─────────────────────────────────────────────────────────
        // MÓDULO 02 — Falar sobre você (sage #7A9E84)
        // ─────────────────────────────────────────────────────────

        'soa2-pronomes-sujeito': function(lesson) {
            return `
            <article class="le-aula" data-module="02">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 05 · identidade</p>
                    <h1 class="le-manifesto-text">Em inglês, toda frase precisa de um sujeito. Sem exceção.</h1>
                    <p class="le-manifesto-sub">Você não diz "Está chovendo" — tem que dizer "It is raining". Essa é a regra mais absoluta do idioma.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">I, you, he, she, it, we, they — o sujeito sempre aparece.</h2>
                    </header>
                    <p class="le-copy">Em português dizemos "Está frio" e pronto. Em inglês você precisa dizer <span class="le-inline-en">It is cold</span> — o "it" é obrigatório mesmo que não haja sujeito real.</p>
                    ${renderExamples([
                        { en: 'I work here.', pt: 'Eu trabalho aqui.' },
                        { en: 'You speak English.', pt: 'Você fala inglês.' },
                        { en: 'He lives in São Paulo.', pt: 'Ele mora em São Paulo.' },
                        { en: 'She loves coffee.', pt: 'Ela adora café.' },
                        { en: 'It is raining.', pt: 'Está chovendo.' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">O pronome "it" para coisas e fenômenos naturais.</h2>
                    </header>
                    <p class="le-copy">Coisas não têm gênero em inglês. Uma casa, um carro, um animal — todos usam "it".</p>
                    ${renderCompare(
                        { flag: 'português (tem gênero)', text: '<strong>A</strong> casa é grande. <strong>O</strong> carro é novo.', note: 'Casa é feminino, carro é masculino.' },
                        { flag: 'inglês (tudo é "it")', text: '<strong>It</strong> is a big house. <strong>It</strong> is a new car.', note: 'Ambos usam "it".' }
                    )}
                    ${renderError(
                        '"Is raining" ou "Are students" — deixar o sujeito fora é erro gramatical.',
                        'Sempre: <code>It is raining</code>, <span class="ok">The students are here</span>.'
                    )}
                </section>

                ${renderTrainCTA('soa2-pronomes-sujeito', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'pronomes': function(lesson) {
            return `
            <article class="le-aula" data-module="02">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 06 · identidade</p>
                    <h1 class="le-manifesto-text">Pronomes: I, me, my, mine. <em>Os quatro papéis da mesma palavra.</em></h1>
                    <p class="le-manifesto-sub">A mesma pessoa tem quatro formas diferentes conforme o papel na frase — nunca repita o nome se puder usar a forma correta.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Quem faz a ação: I, you, he, she, it, we, they</h2>
                    </header>
                    <p class="le-copy">Quando alguém faz a ação, usa este grupo. São os sujeitos que você colocou no início da aula anterior.</p>
                    ${renderMap('Pronomes de sujeito', [
                        { label: 'I', sub: 'eu' },
                        { label: 'you', sub: 'você' },
                        { label: 'he', sub: 'ele' },
                        { label: 'she', sub: 'ela' },
                        { label: 'it', sub: 'isso' },
                        { label: 'we', sub: 'nós' },
                        { label: 'they', sub: 'eles/elas' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Quem recebe: me, you, him, her, it, us, them</h2>
                    </header>
                    <p class="le-copy">Quando alguém recebe a ação — te liga, te ajuda, te chama — vira outro grupo. Aparecem depois da ação ou de preposições.</p>
                    ${renderMap('Pronomes de objeto', [
                        { label: 'me', sub: 'me/mim' },
                        { label: 'you', sub: 'te/você' },
                        { label: 'him', sub: 'o/ele' },
                        { label: 'her', sub: 'a/ela' },
                        { label: 'it', sub: 'isso' },
                        { label: 'us', sub: 'nos/nós' },
                        { label: 'them', sub: 'os/eles' }
                    ])}
                    ${renderError(
                        '"She called I" ou "Between you and I" — usar sujeito onde vai objeto é muito comum.',
                        'Lembre: <code>called me</code>, <span class="ok">between you and me</span>.'
                    )}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">03</span>
                        <h2 class="le-section-title">De quem é isso? my, your, his, her, its, our, their</h2>
                    </header>
                    <p class="le-copy">Quando você mostra posse — meu livro, seu carro, a casa dela — usa o possessivo adjetivo. Sempre acompanha o nome.</p>
                    ${renderMap('Possessivos adjetivos', [
                        { label: 'my', sub: 'meu/minha' },
                        { label: 'your', sub: 'seu/sua' },
                        { label: 'his', sub: 'dele' },
                        { label: 'her', sub: 'dela' },
                        { label: 'its', sub: 'do objeto' },
                        { label: 'our', sub: 'nosso/nossa' },
                        { label: 'their', sub: 'deles/delas' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">04</span>
                        <h2 class="le-section-title">Posse absoluta: mine, yours, his, hers, ours, theirs</h2>
                    </header>
                    <p class="le-copy">Quando o nome desaparece — "Este é meu" — você usa o possessivo pronome. Fica sozinho, sem acompanhar nada.</p>
                    ${renderMap('Possessivos pronomes', [
                        { label: 'mine', sub: 'meu/minha (coisa)' },
                        { label: 'yours', sub: 'seu/sua (coisa)' },
                        { label: 'his', sub: 'dele (coisa)' },
                        { label: 'hers', sub: 'dela (coisa)' },
                        { label: 'ours', sub: 'nosso/nossa (coisa)' },
                        { label: 'theirs', sub: 'deles/delas (coisa)' }
                    ])}
                </section>

                ${renderTrainCTA('pronomes', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa2-tobe-perg-neg': function(lesson) {
            return `
            <article class="le-aula" data-module="02">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 07 · identidade</p>
                    <h1 class="le-manifesto-text">Pergunta e negativa com to be — inversão e contração.</h1>
                    <p class="le-manifesto-sub">I am happy → Am I happy? → I am not happy. O verbo to be é o único que inverte de forma tão direta.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Afirmativa → Interrogativa: inversão simples.</h2>
                    </header>
                    <p class="le-copy">Com to be, você simplesmente inverte a ordem do verbo e do sujeito. Não precisa de ajudante.</p>
                    ${renderTimeline([
                        { when: 'Afirmativa', text: 'I am here', detail: 'Eu sou sujeito, "am" é verbo.' },
                        { when: 'Interrogativa', text: 'Am I here?', detail: 'O verbo vai para o início.' },
                        { when: 'Negativa', text: 'I am not here.', detail: 'Adicione "not" entre verbo e resto.' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Contração — I'm, you're, he's</h2>
                    </header>
                    <p class="le-copy">Em fala casual, contraímos: I'm = I am, you're = you are, he's = he is. Na negativa: I'm not, you're not, he's not.</p>
                    ${renderCompare(
                        { flag: 'forma longa (formal)', text: 'I am not tired.<br>You are not ready.', note: 'Documentos, emails formais.' },
                        { flag: 'contração (natural)', text: 'I\'m not tired.<br>You\'re not ready.', note: 'Conversas do dia a dia.' }
                    )}
                </section>

                ${renderTrainCTA('soa2-tobe-perg-neg', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa2-possessivos': function(lesson) {
            return `
            <article class="le-aula" data-module="02">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 08 · identidade</p>
                    <h1 class="le-manifesto-text">Possessivos: meu, seu, dele, dela — sempre antes do nome.</h1>
                    <p class="le-manifesto-sub">My book, your name, his car. Possessivo adjetivo nunca aparece sem o nome que acompanha.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Os sete possessivos adjetivos.</h2>
                    </header>
                    <p class="le-copy">Possessivo adjetivo sempre vem antes de um nome. Nunca sozinho, sempre em dupla.</p>
                    ${renderMap('Possessivos adjetivos', [
                        { label: 'my', sub: 'meu/a' },
                        { label: 'your', sub: 'seu/a' },
                        { label: 'his', sub: 'dele' },
                        { label: 'her', sub: 'dela' },
                        { label: 'its', sub: 'do objeto' },
                        { label: 'our', sub: 'nosso/a' },
                        { label: 'their', sub: 'deles/as' }
                    ])}
                    ${renderExamples([
                        { en: 'My name is Carlos.', pt: 'Meu nome é Carlos.' },
                        { en: 'Your phone is here.', pt: 'Seu telefone está aqui.' },
                        { en: 'His sister is a doctor.', pt: 'A irmã dele é médica.' },
                        { en: 'Her car is red.', pt: 'O carro dela é vermelho.' },
                        { en: 'Their house is big.', pt: 'A casa deles é grande.' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Cuidado: "his" e "her" com nomes de objetos.</h2>
                    </header>
                    <p class="le-copy">Em inglês, objetos não têm gênero. Um livro não é "dele" ou "dela" — é "its". Só pessoas usam "his" ou "her".</p>
                    ${renderError(
                        'Dizer "her book" quando o livro não tem dono específico, ou "his car" de forma genérica sem saber de quem é.',
                        'Use: <code>the book</code> (artigo simples), <span class="ok">my book</span> (possessivo claro), <span class="ok">the car\'s color</span> (construção com genitivo).'
                    )}
                </section>

                ${renderTrainCTA('soa2-possessivos', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa2-this-that': function(lesson) {
            return `
            <article class="le-aula" data-module="02">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 09 · identidade</p>
                    <h1 class="le-manifesto-text">This, that, these, those — perto ou longe, singular ou plural.</h1>
                    <p class="le-manifesto-sub">This book = aquele pertinho. That mountain = aquela lá no fundo. Distância e número definem qual usar.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Perto vs longe — this/that (singular).</h2>
                    </header>
                    <p class="le-copy">This é pertinho de você. That é distante. A diferença é espacial, não tão abstrata como parece.</p>
                    ${renderCompare(
                        { flag: 'perto', text: '<strong>This</strong> coffee is good.', note: 'O café que estou tomando agora.' },
                        { flag: 'longe', text: '<strong>That</strong> building is tall.', note: 'O prédio lá ao fundo.' }
                    )}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Plurais — these/those.</h2>
                    </header>
                    <p class="le-copy">Mude para plural e a lógica é a mesma: these = perto, those = longe.</p>
                    ${renderMap('This / That / These / Those', [
                        { label: 'this', sub: 'perto (sing)' },
                        { label: 'that', sub: 'longe (sing)' },
                        { label: 'these', sub: 'perto (plur)' },
                        { label: 'those', sub: 'longe (plur)' }
                    ])}
                </section>

                ${renderTrainCTA('soa2-this-that', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        // ─────────────────────────────────────────────────────────
        // MÓDULO 03 — Ações do dia a dia (#6B8E72)
        // ─────────────────────────────────────────────────────────

        'soa3-present-afirm': function(lesson) {
            return `
            <article class="le-aula" data-module="03">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 10 · present simple</p>
                    <h1 class="le-manifesto-text">Present simple: I work, you work, he works.</h1>
                    <p class="le-manifesto-sub">O tempo mais comum. Ações que você faz todo dia, hábitos, verdades gerais. Forma base para quase tudo em inglês.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Forma base: I, you, we, they + verbo puro.</h2>
                    </header>
                    <p class="le-copy">Na maioria dos casos, o verbo não muda. Você diz "I go", "you go", "they go" — sempre na forma base, do dicionário.</p>
                    ${renderExamples([
                        { en: 'I work here.', pt: 'Trabalho aqui.' },
                        { en: 'You like coffee.', pt: 'Você gosta de café.' },
                        { en: 'We study English.', pt: 'Estudamos inglês.' },
                        { en: 'They play football.', pt: 'Eles jogam futebol.' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Ações habituais e verdades gerais.</h2>
                    </header>
                    <p class="le-copy">Use present simple para rotina, hábitos e fatos que não mudam. "The sun rises in the east" — verdade geral.</p>
                    ${renderCompare(
                        { flag: 'ação única no passado', text: 'I went to the beach yesterday.', note: 'Passou, não é mais.' },
                        { flag: 'hábito e rotina', text: 'I go to the beach every weekend.', note: 'Acontece repetidamente.' }
                    )}
                </section>

                ${renderTrainCTA('soa3-present-afirm', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa3-third-person-s': function(lesson) {
            return `
            <article class="le-aula" data-module="03">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 11 · present simple</p>
                    <h1 class="le-manifesto-text">Regra do -s: he works, she goes, it costs.</h1>
                    <p class="le-manifesto-sub">Terceira pessoa singular pede -s no verbo. Parece simples, mas tem detalhes que todo brasileiro erra.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Quando aparece o -s: he/she/it sempre.</h2>
                    </header>
                    <p class="le-copy">Para he, she, it, você adiciona -s no final do verbo. Não é opcional — é obrigatório toda vez.</p>
                    ${renderTimeline([
                        { when: 'Eu, você, nós, eles', text: 'work', detail: 'Forma base, sem mudança.' },
                        { when: 'Ele, ela, isso', text: 'works', detail: 'Sempre leva o -s.' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Casos especiais: -ch, -sh, -x, -z, -o.</h2>
                    </header>
                    <p class="le-copy">Alguns verbos ganham -es no lugar de -s quando terminam em sons específicos.</p>
                    ${renderMap('Regras de adição', [
                        { label: '-ch, -sh, -x, -z', sub: '+es (watches, pushes)' },
                        { label: '-consoante + y', sub: 'muda para -ies (study → studies)' },
                        { label: '-vogal + y', sub: '+s normal (plays, stays)' }
                    ])}
                    ${renderError(
                        '"He go", "she like", "it have" — esquecer o -s é o erro de terceira pessoa mais comum.',
                        'Sempre: <code>he goes</code>, <span class="ok">she likes</span>, <span class="ok">it has</span>.'
                    )}
                </section>

                ${renderTrainCTA('soa3-third-person-s', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'perguntas': function(lesson) {
            return `
            <article class="le-aula" data-module="03">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 12 · present simple</p>
                    <h1 class="le-manifesto-text">Fazer perguntas em inglês: do, does, did.</h1>
                    <p class="le-manifesto-sub">Em português basta mudar a entonação. Em inglês você precisa de uma palavra de apoio — e essa palavra é do, does ou did.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Pergunta sim/não: Do you...? Does he...?</h2>
                    </header>
                    <p class="le-copy">No presente, toda pergunta começa com do ou does. Depois vem a pessoa e depois a ação em forma base — nunca com o -s.</p>
                    ${renderDialog('Exemplos de pergunta', [
                        { side: 'a', en: 'Do you like pizza?', pt: 'Você gosta de pizza?' },
                        { side: 'b', en: 'Yes, I do. / No, I don\'t.', pt: 'Sim, gosto. / Não, não gosto.' },
                        { side: 'a', en: 'Does he work here?', pt: 'Ele trabalha aqui?' },
                        { side: 'b', en: 'Yes, he does. / No, he doesn\'t.', pt: 'Sim, trabalha. / Não, não trabalha.' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Perguntas com question words: What, Where, Who, When, Why, How.</h2>
                    </header>
                    <p class="le-copy">A pergunta começa com a palavra-chave, depois vem do/does, depois pessoa e ação — mesma estrutura, só muda a ordem.</p>
                    ${renderMap('Question words', [
                        { label: 'What', sub: 'o quê' },
                        { label: 'Where', sub: 'onde' },
                        { label: 'Who', sub: 'quem' },
                        { label: 'When', sub: 'quando' },
                        { label: 'Why', sub: 'por quê' },
                        { label: 'How', sub: 'como' }
                    ])}
                </section>

                ${renderTrainCTA('perguntas', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'negativa': function(lesson) {
            return `
            <article class="le-aula" data-module="03">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 13 · present simple</p>
                    <h1 class="le-manifesto-text">Negar em inglês: don't, doesn't, didn't.</h1>
                    <p class="le-manifesto-sub">Assim como em pergunta, negativa precisa de uma palavra de apoio. E depois dela, o verbo volta sempre à forma base.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Presente: don't e doesn't carregam a negação.</h2>
                    </header>
                    <p class="le-copy">I don't like coffee. He doesn't like coffee. O verbo principal perde o -s quando vem com don't/doesn't.</p>
                    ${renderCompare(
                        { flag: 'afirmativa', text: 'I like coffee.<br>He likes coffee.', note: 'Verbo muda com terceira pessoa.' },
                        { flag: 'negativa', text: 'I don\'t like coffee.<br>He doesn\'t like coffee.', note: 'Verbo volta à base, don\'t/doesn\'t carregam tudo.' }
                    )}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Never, nobody, nothing — negação embutida.</h2>
                    </header>
                    <p class="le-copy">Essas palavras já nascem negativas. Quando elas aparecem, a frase não precisa de don't/doesn't junto.</p>
                    ${renderError(
                        '"I don\'t never go there" — dupla negação em inglês erra grosseiramente.',
                        'Escolha: <code>I never go there</code> ou <span class="ok">I don\'t go there</span> — não misture os dois.'
                    )}
                </section>

                ${renderTrainCTA('negativa', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa3-frequencia': function(lesson) {
            return `
            <article class="le-aula" data-module="03">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 14 · present simple</p>
                    <h1 class="le-manifesto-text">Advérbios de frequência: always, usually, sometimes, never.</h1>
                    <p class="le-manifesto-sub">Quanto você faz algo define se é hábito ou exceção. Sempre, geralmente, às vezes, nunca — cada palavra tem seu lugar na frase.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">A escala: always → usually → sometimes → rarely → never</h2>
                    </header>
                    <p class="le-copy">Essas palavras mostram intensidade. Always = 100%. Never = 0%. O resto fica no meio.</p>
                    ${renderTimeline([
                        { when: '100%', text: 'always', detail: 'Toda vez, sem exceção.' },
                        { when: '75%', text: 'usually / often', detail: 'A maioria das vezes.' },
                        { when: '50%', text: 'sometimes', detail: 'De vez em quando.' },
                        { when: '25%', text: 'rarely / seldom', detail: 'Muito raramente.' },
                        { when: '0%', text: 'never', detail: 'Nunca, jamais.' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Posição: antes do verbo (exceto to be).</h2>
                    </header>
                    <p class="le-copy">Em português você coloca no final: "Sempre vou". Em inglês vai antes: "I always go".</p>
                    ${renderCompare(
                        { flag: 'português (depois do verbo)', text: 'Eu <strong>nunca</strong> estudo.<br>Vou <strong>sempre</strong> ao cinema.', note: 'Advérbio no final ou no meio.' },
                        { flag: 'inglês (antes do verbo)', text: 'I <strong>never</strong> study.<br>I <strong>always</strong> go to the movies.', note: 'Advérbio bem antes da ação.' }
                    )}
                </section>

                ${renderTrainCTA('soa3-frequencia', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        // ─────────────────────────────────────────────────────────
        // MÓDULO 04 — Onde, quando, como (#8A9D6F)
        // ─────────────────────────────────────────────────────────

        'soa4-wh-questions': function(lesson) {
            return `
            <article class="le-aula" data-module="04">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 15 · contexto</p>
                    <h1 class="le-manifesto-text">Perguntas WH: What, Where, Who, When, Why, How.</h1>
                    <p class="le-manifesto-sub">Toda pergunta que pede informação — não apenas sim ou não — começa com uma delas. Aprenda a ordem.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">A ordem: WH word → do/does → pessoa → ação</h2>
                    </header>
                    <p class="le-copy">Não é "o que você faz", é "what do you do". A palavra-chave vai sempre em primeiro.</p>
                    ${renderDialog('Padrão de WH question', [
                        { side: 'a', en: 'What do you do?', pt: 'O que você faz?' },
                        { side: 'b', en: 'I\'m a teacher.', pt: 'Sou professor.' },
                        { side: 'a', en: 'Where do you live?', pt: 'Onde você mora?' },
                        { side: 'b', en: 'I live in São Paulo.', pt: 'Moro em São Paulo.' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Cada WH word tem seu significado específico.</h2>
                    </header>
                    <p class="le-copy">O mapa completo das 6 perguntas básicas.</p>
                    ${renderMap('WH Questions', [
                        { label: 'What', sub: 'coisa / assunto' },
                        { label: 'Where', sub: 'local' },
                        { label: 'Who', sub: 'pessoa' },
                        { label: 'When', sub: 'tempo' },
                        { label: 'Why', sub: 'razão' },
                        { label: 'How', sub: 'maneira' }
                    ])}
                </section>

                ${renderTrainCTA('soa4-wh-questions', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'preposicoes': function(lesson) {
            return `
            <article class="le-aula" data-module="04">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 16 · contexto</p>
                    <h1 class="le-manifesto-text">In, on, at — preposições de lugar E tempo.</h1>
                    <p class="le-manifesto-sub">Parecem simples, mas são usadas diferente do português. Em caixa (in), em cima (on), em ponto (at).</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Lugar: in (dentro), on (em cima), at (ponto específico).</h2>
                    </header>
                    <p class="le-copy">Pense em imagens. In = abrindo uma caixa. On = em cima de uma mesa. At = naquele ponto ali.</p>
                    ${renderCompare(
                        { flag: 'dentro de algo', text: 'in the house<br>in Brazil', note: 'Espaço que contém.' },
                        { flag: 'em cima de algo', text: 'on the table<br>on the floor', note: 'Superfície.' }
                    )}
                    ${renderCompare(
                        { flag: 'ponto exato', text: 'at the door<br>at the office', note: 'Local específico, não abrangente.' },
                        { flag: '(continua)', text: '', note: '' }
                    )}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Tempo: in (período), on (dia), at (hora).</h2>
                    </header>
                    <p class="le-copy">A mesma lógica serve para tempo. In se usa com períodos largos, on com dias específicos, at com horários exatos.</p>
                    ${renderMap('In / On / At (tempo)', [
                        { label: 'in May', sub: 'mês' },
                        { label: 'in 2026', sub: 'ano' },
                        { label: 'on Monday', sub: 'dia da semana' },
                        { label: 'on the 22nd', sub: 'data' },
                        { label: 'at 3pm', sub: 'hora' },
                        { label: 'at midnight', sub: 'momento específico' }
                    ])}
                    ${renderError(
                        '"On Monday" é correto, mas "in Monday" é erro clássico de brasileiro.',
                        'Dias da semana sempre usam <code>on</code>: <span class="ok">on Monday</span>, <span class="ok">on Tuesday</span>.'
                    )}
                </section>

                ${renderTrainCTA('preposicoes', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa4-prep-tempo': function(lesson) {
            return `
            <article class="le-aula" data-module="04">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 17 · contexto</p>
                    <h1 class="le-manifesto-text">Tempo: in (mês/ano), on (dia), at (hora).</h1>
                    <p class="le-manifesto-sub">Expansão da aula anterior focando só em tempo — como dizer quando algo acontece.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Estrutura da frase: V-O-T (Verbo-Objeto-Tempo).</h2>
                    </header>
                    <p class="le-copy">Em inglês, você coloca a informação de tempo no final: "I go to the beach on Sundays."</p>
                    ${renderTimeline([
                        { when: 'Período largo', text: 'in May, in summer, in 2026', detail: 'Mês, estação, ano.' },
                        { when: 'Dia da semana', text: 'on Monday, on Friday', detail: 'Sempre "on".' },
                        { when: 'Data exata', text: 'on the 22nd, on May 22nd', detail: '"on" também aqui.' },
                        { when: 'Hora específica', text: 'at 3pm, at midnight, at noon', detail: 'Sempre "at" para hora.' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Casos especiais: ago, during, before, after.</h2>
                    </header>
                    <p class="le-copy">Nem tudo é in/on/at. Algumas preposições de tempo têm lógica própria.</p>
                    ${renderExamples([
                        { en: 'Two years ago', pt: 'Dois anos atrás' },
                        { en: 'During the meeting', pt: 'Durante a reunião' },
                        { en: 'Before Monday', pt: 'Antes de segunda' },
                        { en: 'After 5pm', pt: 'Depois das 5' }
                    ])}
                </section>

                ${renderTrainCTA('soa4-prep-tempo', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa4-rotina': function(lesson) {
            return `
            <article class="le-aula" data-module="04">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 18 · contexto</p>
                    <h1 class="le-manifesto-text">Rotina diária: verbos de ação no dia a dia.</h1>
                    <p class="le-manifesto-sub">Wake up, have breakfast, go to work, come back home. A linguagem real de quem fala inglês todo dia.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Verbos de rotina em ordem cronológica.</h2>
                    </header>
                    <p class="le-copy">Da manhã até a noite, há um padrão de verbos que todo nativo usa constantemente.</p>
                    ${renderCase('Um dia típico', [
                        '<strong>Wake up</strong> (acordar) at 7am',
                        '<strong>Take a shower</strong> (tomar banho)',
                        '<strong>Have breakfast</strong> (tomar café)',
                        '<strong>Go to work</strong> (ir trabalhar)',
                        '<strong>Have lunch</strong> (almoçar)',
                        '<strong>Come back home</strong> (voltar pra casa)',
                        '<strong>Have dinner</strong> (jantar)',
                        '<strong>Go to bed</strong> (ir pra cama)'
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Como construir frase de rotina com present simple.</h2>
                    </header>
                    <p class="le-copy">Sujeito + verbo + tempo. "I wake up at 7am." "She goes to work at 8am."</p>
                    ${renderExamples([
                        { en: 'I wake up at 7 in the morning.', pt: 'Acordo às 7 da manhã.' },
                        { en: 'He takes a shower before breakfast.', pt: 'Ele toma banho antes do café.' },
                        { en: 'We have lunch at noon.', pt: 'Almoçamos ao meio-dia.' },
                        { en: 'They go to bed at 11pm.', pt: 'Eles vão pra cama às 11.' }
                    ])}
                </section>

                ${renderTrainCTA('soa4-rotina', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        // ─────────────────────────────────────────────────────────
        // MÓDULO 05 — Falar sobre ontem (#B58263)
        // ─────────────────────────────────────────────────────────

        'soa5-past-regular': function(lesson) {
            return `
            <article class="le-aula" data-module="05">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 19 · past simple</p>
                    <h1 class="le-manifesto-text">Passado regular: trabalhar → worked, ligar → called.</h1>
                    <p class="le-manifesto-sub">A maioria dos verbos fica no passado só adicionando -ed. Mas tem detalhes: double, drop, change.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Regra base: adicionar -ed ao verbo.</h2>
                    </header>
                    <p class="le-copy">Work → worked. Play → played. É o padrão. Mas alguns verbos têm regras especiais de escrita.</p>
                    ${renderTimeline([
                        { when: 'Maioria', text: 'verb + ed', detail: 'work → worked, call → called' },
                        { when: 'Termina em e', text: 'verb + d', detail: 'like → liked, love → loved' },
                        { when: '-consoante + y', text: 'y → ied', detail: 'study → studied, try → tried' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Casos especiais: dobrar consoante final.</h2>
                    </header>
                    <p class="le-copy">Verbos curtos com consoante no final às vezes dobram: stop → stopped, plan → planned.</p>
                    ${renderExamples([
                        { en: 'I stopped at the red light.', pt: 'Parei na luz vermelha.' },
                        { en: 'We planned the trip last month.', pt: 'Planejamos a viagem mês passado.' },
                        { en: 'She preferred coffee.', pt: 'Ela preferiu café.' }
                    ])}
                </section>

                ${renderTrainCTA('soa5-past-regular', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'passado': function(lesson) {
            return `
            <article class="le-aula" data-module="05">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 20 · past simple</p>
                    <h1 class="le-manifesto-text">Verbos irregulares: go → went, eat → ate, sleep → slept.</h1>
                    <p class="le-manifesto-sub">Uns verbos fogem da regra do -ed. Precisam ser decorados — mas a boa notícia é que são sempre os mesmos.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Top 20 verbos irregulares que todo mundo usa.</h2>
                    </header>
                    <p class="le-copy">Estes verbos são tão comuns que precisam estar na ponta da língua.</p>
                    ${renderMap('Top 20 irregular verbs', [
                        { label: 'be → was/were', sub: '(ser/estar)' },
                        { label: 'go → went', sub: '(ir)' },
                        { label: 'eat → ate', sub: '(comer)' },
                        { label: 'see → saw', sub: '(ver)' },
                        { label: 'come → came', sub: '(vir)' },
                        { label: 'get → got', sub: '(pegar/ficar)' },
                        { label: 'give → gave', sub: '(dar)' },
                        { label: 'know → knew', sub: '(conhecer)' },
                        { label: 'make → made', sub: '(fazer/criar)' },
                        { label: 'take → took', sub: '(levar)' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Was/were: to be no passado.</h2>
                    </header>
                    <p class="le-copy">I/he/she/it = was. You/we/they = were. Simples assim.</p>
                    ${renderCompare(
                        { flag: 'presente', text: 'I am<br>He is<br>They are', note: 'Am/is/are (hoje)' },
                        { flag: 'passado', text: 'I was<br>He was<br>They were', note: 'Was/were (antes)' }
                    )}
                </section>

                ${renderTrainCTA('passado', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa5-past-perguntas': function(lesson) {
            return `
            <article class="le-aula" data-module="05">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 21 · past simple</p>
                    <h1 class="le-manifesto-text">Perguntas no passado: Did you go? Where did you go?</h1>
                    <p class="le-manifesto-sub">No passado é tudo "did". Não importa o verbo — did vira a palavra-chave e o verbo volta ao base.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Pergunta sim/não: Did you...?</h2>
                    </header>
                    <p class="le-copy">Toda pergunta no passado começa com "Did". Depois vem a pessoa, depois a ação em forma base.</p>
                    ${renderDialog('Past simple questions', [
                        { side: 'a', en: 'Did you go to the beach?', pt: 'Você foi à praia?' },
                        { side: 'b', en: 'Yes, I did. / No, I didn\'t.', pt: 'Sim, fui. / Não, não fui.' },
                        { side: 'a', en: 'Did they eat lunch?', pt: 'Eles almoçaram?' },
                        { side: 'b', en: 'Yes, they did. / No, they didn\'t.', pt: 'Sim, almoçaram. / Não, não almoçaram.' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Perguntas WH no passado: Where did you go?</h2>
                    </header>
                    <p class="le-copy">Question word + did + pessoa + verbo base. A ordem é sempre a mesma.</p>
                    ${renderExamples([
                        { en: 'Where did you go yesterday?', pt: 'Aonde você foi ontem?' },
                        { en: 'What did she do?', pt: 'O que ela fez?' },
                        { en: 'When did they arrive?', pt: 'Quando eles chegaram?' },
                        { en: 'Who did you meet?', pt: 'Quem você conheceu?' }
                    ])}
                </section>

                ${renderTrainCTA('soa5-past-perguntas', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa5-past-negativa': function(lesson) {
            return `
            <article class="le-aula" data-module="05">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 22 · past simple</p>
                    <h1 class="le-manifesto-text">Negativa no passado: I didn't go, she didn't eat.</h1>
                    <p class="le-manifesto-sub">Didn't carrega toda a negação e o passado. O verbo depois volta sempre à forma base.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Construção: sujeito + didn't + verbo base.</h2>
                    </header>
                    <p class="le-copy">I didn't go. You didn't eat. She didn't sleep. Didn't funciona para todas as pessoas e verbos.</p>
                    ${renderCompare(
                        { flag: 'afirmativa', text: 'I went to the beach.<br>She ate pizza.', note: 'Verbos no passado.' },
                        { flag: 'negativa', text: 'I didn\'t go to the beach.<br>She didn\'t eat pizza.', note: 'Didn\'t + verbo base.' }
                    )}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Erro clássico: "didn't went" ou "didn't ate".</h2>
                    </header>
                    <p class="le-copy">Quando "didn't" aparece, o verbo não pode estar no passado. Ele volta sempre ao base.</p>
                    ${renderError(
                        '"I didn\'t went" ou "She didn\'t ate" — misturar did (passado) com verbo também no passado erra tudo.',
                        'Sempre: <code>I didn\'t go</code>, <span class="ok">She didn\'t eat</span>, <span class="ok">They didn\'t sleep</span>.'
                    )}
                </section>

                ${renderTrainCTA('soa5-past-negativa', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        // ─────────────────────────────────────────────────────────
        // MÓDULO 06 — Querer, poder, gostar (#5C8A78)
        // ─────────────────────────────────────────────────────────

        'soa6-can': function(lesson) {
            return `
            <article class="le-aula" data-module="06">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 23 · expressão</p>
                    <h1 class="le-manifesto-text">Can: habilidade, permissão e possibilidade.</h1>
                    <p class="le-manifesto-sub">Can = poder fazer algo. "I can swim" = consigo nadar. "Can I go?" = posso ir? Uma palavra, três significados conforme o contexto.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Can = consigo / permissão / é possível.</h2>
                    </header>
                    <p class="le-copy">I can swim (habilidade). Can I go? (permissão). It can be true (possibilidade). Mesma palavra, sentido muda pelo contexto.</p>
                    ${renderDialog('Can em contextos diferentes', [
                        { side: 'a', en: 'Can you swim?', pt: 'Você sabe nadar?' },
                        { side: 'b', en: 'Yes, I can.', pt: 'Sim, sei.' },
                        { side: 'a', en: 'Can I use your phone?', pt: 'Posso usar seu telefone?' },
                        { side: 'b', en: 'Yes, you can.', pt: 'Sim, pode.' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Can't e could: negativa e passado.</h2>
                    </header>
                    <p class="le-copy">I can't swim (não consigo). I could swim (conseguia antes). Modais tem formas próprias — não seguem o padrão de do/did.</p>
                    ${renderMap('Can conjugation', [
                        { label: 'can', sub: 'presente' },
                        { label: 'can\'t', sub: 'negativa presente' },
                        { label: 'could', sub: 'passado' },
                        { label: 'couldn\'t', sub: 'negativa passado' }
                    ])}
                </section>

                ${renderTrainCTA('soa6-can', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa6-like-ing': function(lesson) {
            return `
            <article class="le-aula" data-module="06">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 24 · expressão</p>
                    <h1 class="le-manifesto-text">Like + ing: gostar de fazer algo.</h1>
                    <p class="le-manifesto-sub">"I like playing football" — o verbo vira um substantivo terminado em -ing quando aparece depois de "like".</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Estrutura: like + verb + ing</h2>
                    </header>
                    <p class="le-copy">O verbo fica em forma de gerúndio (-ing) quando vem depois de like, enjoy, love, hate.</p>
                    ${renderExamples([
                        { en: 'I like playing football.', pt: 'Gosto de jogar futebol.' },
                        { en: 'She loves reading books.', pt: 'Ela adora ler livros.' },
                        { en: 'They enjoy watching movies.', pt: 'Eles gostam de assistir filmes.' },
                        { en: 'I hate waiting.', pt: 'Odeio esperar.' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Formação do -ing: regras de escrita.</h2>
                    </header>
                    <p class="le-copy">Maioria: play → playing. Mas some com -e: make → making. Alguns dobram consoante: run → running.</p>
                    ${renderTimeline([
                        { when: 'Maioria', text: 'verb + ing', detail: 'play → playing, work → working' },
                        { when: 'Termina em e', text: 'drop e + ing', detail: 'make → making, take → taking' },
                        { when: 'CVC (curto)', text: 'dobra consoante + ing', detail: 'run → running, stop → stopping' }
                    ])}
                </section>

                ${renderTrainCTA('soa6-like-ing', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'verbos': function(lesson) {
            return `
            <article class="le-aula" data-module="06">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 25 · expressão</p>
                    <h1 class="le-manifesto-text">Verbos modais: can, must, should, could, would.</h1>
                    <p class="le-manifesto-sub">Estes verbos não marcam tempo — marcam força. Habilidade, obrigação, conselho, probabilidade. Cada um tem seu peso.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Os 5 modais mais comuns.</h2>
                    </header>
                    <p class="le-copy">Estrutura: modal + verbo base. Nunca "to" depois do modal, nunca -s na terceira pessoa.</p>
                    ${renderMap('Modal verbs e seus significados', [
                        { label: 'can', sub: 'habilidade, permissão' },
                        { label: 'must', sub: 'obrigação forte' },
                        { label: 'should', sub: 'conselho, recomendação' },
                        { label: 'could', sub: 'possibilidade, passado' },
                        { label: 'would', sub: 'condicional, futuro' }
                    ])}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Phrasal verbs: blocos inteiros com significado próprio.</h2>
                    </header>
                    <p class="le-copy">Phrasal verb não é quebra-cabeça de palavra solta. "Give up" = render-se. "Pick up" = pegar. O sentido mora no bloco.</p>
                    ${renderExamples([
                        { en: 'give up = render-se', pt: 'I won\'t give up.' },
                        { en: 'pick up = pegar', pt: 'Can you pick me up?' },
                        { en: 'turn off = desligar', pt: 'Turn off the light.' },
                        { en: 'look after = cuidar', pt: 'I look after my sister.' }
                    ])}
                </section>

                ${renderTrainCTA('verbos', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        },

        'soa6-want-to': function(lesson) {
            return `
            <article class="le-aula" data-module="06">
                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 26 · expressão</p>
                    <h1 class="le-manifesto-text">Want, need, decide + to: intenção e objetivo.</h1>
                    <p class="le-manifesto-sub">"I want to learn English" — estes verbos vêm sempre seguidos de "to" e depois o verbo base.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">Estrutura: want/need/decide + to + verbo</h2>
                    </header>
                    <p class="le-copy">Verbos de intenção pedem sempre o "to" depois. "I want to go" não "I want go".</p>
                    ${renderCompare(
                        { flag: 'like + ing (atividade)', text: 'I like playing.<br>She enjoys reading.', note: 'Gosto da ação em si.' },
                        { flag: 'want to + verbo (objetivo)', text: 'I want to play.<br>She wants to read.', note: 'Quero alcançar algo.' }
                    )}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Verbos que seguem este padrão.</h2>
                    </header>
                    <p class="le-copy">Want, need, decide, hope, try, remember, forget, plan, refuse — todos pedem "to".</p>
                    ${renderExamples([
                        { en: 'I want to learn English.', pt: 'Quero aprender inglês.' },
                        { en: 'She needs to work.', pt: 'Ela precisa trabalhar.' },
                        { en: 'They decided to move.', pt: 'Eles decidiram mudar-se.' },
                        { en: 'I hope to see you soon.', pt: 'Espero vê-lo em breve.' }
                    ])}
                    ${renderError(
                        '"I want go" ou "She needs work" — esquecer o "to" é erro de sequência verbal.',
                        'Sempre: <code>I want to go</code>, <span class="ok">She needs to work</span>, <span class="ok">They want to learn</span>.'
                    )}
                </section>

                ${renderTrainCTA('soa6-want-to', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}
            </article>`;
        }
    };

    // ============================================================
    // HOOK — Integração com lessons-enhanced.js
    // ============================================================

    function applyEditorialIfAvailable(slug) {
        const layout = LAYOUTS[slug];
        if (!layout) {
            console.log('[editorial-renderer] layout não encontrado:', slug);
            return false;
        }

        const main = document.getElementById('lessonModalMain');
        if (!main) {
            console.log('[editorial-renderer] elemento main não encontrado');
            return false;
        }

        const lesson = (window._lessonsData || {})[slug];
        if (!lesson) {
            console.log('[editorial-renderer] dados da aula não encontrados:', slug);
            return false;
        }

        try {
            main.innerHTML = layout(lesson);
            main.dataset.editorial = '1';
            main.scrollTop = 0;
            console.log('[editorial-renderer] layout aplicado:', slug);
            return true;
        } catch (e) {
            console.error('[editorial-renderer] erro renderizando', slug, e);
            return false;
        }
    }

    window._applyEditorialLayout = applyEditorialIfAvailable;

    function installHook() {
        // Tenta wrappear showLessonContent (função que popula o modal)
        if (typeof window.showLessonContent === 'function' && !window.showLessonContent._editorialHookInstalled) {
            const originalShow = window.showLessonContent;
            window.showLessonContent = function(slug, triggerEl) {
                originalShow(slug, triggerEl);
                // Tenta renderizar imediatamente e depois com delay para garantir
                requestAnimationFrame(() => applyEditorialIfAvailable(slug));
                setTimeout(() => applyEditorialIfAvailable(slug), 50);
            };
            window.showLessonContent._editorialHookInstalled = true;
            console.log('[editorial-renderer] hook instalado · layouts:', Object.keys(LAYOUTS).length);
            return true;
        }

        // Fallback: tenta wrappear _griloOpenLesson se showLessonContent não existir ainda
        if (typeof window._griloOpenLesson === 'function' && !window._griloOpenLesson._editorialHookInstalled) {
            const original = window._griloOpenLesson;
            window._griloOpenLesson = function(slug, triggerEl) {
                original(slug, triggerEl);
                requestAnimationFrame(() => applyEditorialIfAvailable(slug));
                setTimeout(() => applyEditorialIfAvailable(slug), 50);
            };
            window._griloOpenLesson._editorialHookInstalled = true;
            console.log('[editorial-renderer] hook instalado (via _griloOpenLesson) · layouts:', Object.keys(LAYOUTS).length);
            return true;
        }

        return false;
    }

    // Tenta instalar imediatamente e periodicamente até conseguir
    const tryInstall = setInterval(() => {
        if (installHook()) {
            clearInterval(tryInstall);
        }
    }, 200);

    // Também aguarda DOMContentLoaded como fallback adicional
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            installHook();
        });
    }
})();
