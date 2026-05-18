/**
 * lesson-editorial-renderer.js
 *
 * Layouts editoriais customizados por aula. Cada aula pode usar uma
 * combinação diferente dos componentes definidos em lesson-editorial-v4.css.
 *
 * Hookea o _griloOpenLesson exposto pelo lessons-enhanced.js para
 * substituir o conteúdo do modal pelas versões editoriais quando
 * disponíveis. Aulas sem layout editorial mantêm o renderer padrão.
 */

(function() {
    'use strict';

    // ============================================================
    // HELPERS
    // ============================================================

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    function moduleOf(slug) {
        if (slug.startsWith('soa1-')) return '01';
        if (slug.startsWith('soa2-')) return '02';
        if (slug === 'pronomes') return '02';
        if (slug.startsWith('soa3-')) return '03';
        if (slug === 'perguntas' || slug === 'negativa') return '03';
        if (slug.startsWith('soa4-')) return '04';
        if (slug === 'preposicoes') return '04';
        if (slug.startsWith('soa5-')) return '05';
        if (slug === 'passado') return '05';
        if (slug.startsWith('soa6-')) return '06';
        if (slug === 'verbos') return '06';
        return '00';
    }

    // Renderiza o CTA de treino de voz (Mock 1) — padrão em todas
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
            ${curiosities.map(c => `<p class="le-curiosity">${c}</p>`).join('')}
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
                        <span class="le-example-en">${en}</span>
                        ${pt ? `<span class="le-example-pt">${escapeHtml(pt)}</span>` : ''}
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    }

    // ============================================================
    // LAYOUTS POR AULA — Módulo 1
    // ============================================================

    const LAYOUTS = {

        // ─────────────────────────────────────────────
        // AULA 01 — ALFABETO E SONS
        // ─────────────────────────────────────────────
        'soa1-alfabeto': function(lesson) {
            return `
            <article class="le-aula" data-module="01">

                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 01 · primeiros passos</p>
                    <h1 class="le-manifesto-text">O inglês começa pelos <em>sons</em> que sua boca ainda não conhece.</h1>
                    <p class="le-manifesto-sub">Não é decorar 26 letras. É descobrir três coisas: como as vogais mudam de comprimento, por que o <strong>TH</strong> existe, e como o <strong>R</strong> americano fica preso no céu da boca.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">As letras se chamam diferente.</h2>
                    </header>
                    <p class="le-copy">No português, o <span class="le-inline-en">A</span> é "á". No inglês, vira "ei". O <span class="le-inline-en">E</span> vira "i". O <span class="le-inline-en">I</span> vira "ai". Soletrar em inglês — algo que você faz por telefone, em e-mail, em formulário — exige saber esses nomes novos.</p>
                    <blockquote class="le-pullquote">Soletrar destrava telefone, e-mail e cadastro. É a primeira ferramenta prática que o inglês te dá.</blockquote>

                    <div class="le-soundboard">
                        <button class="le-sound-btn" onclick="(function(){if('speechSynthesis' in window){var u=new SpeechSynthesisUtterance('A'); u.lang='en-US'; speechSynthesis.speak(u);}})()">
                            <span class="le-sound-btn-play">▶</span>
                            <span class="le-sound-btn-body">
                                <span class="le-sound-btn-word">A</span>
                                <span class="le-sound-btn-pron">/ ei /</span>
                            </span>
                        </button>
                        <button class="le-sound-btn" onclick="(function(){if('speechSynthesis' in window){var u=new SpeechSynthesisUtterance('E'); u.lang='en-US'; speechSynthesis.speak(u);}})()">
                            <span class="le-sound-btn-play">▶</span>
                            <span class="le-sound-btn-body">
                                <span class="le-sound-btn-word">E</span>
                                <span class="le-sound-btn-pron">/ i /</span>
                            </span>
                        </button>
                        <button class="le-sound-btn" onclick="(function(){if('speechSynthesis' in window){var u=new SpeechSynthesisUtterance('I'); u.lang='en-US'; speechSynthesis.speak(u);}})()">
                            <span class="le-sound-btn-play">▶</span>
                            <span class="le-sound-btn-body">
                                <span class="le-sound-btn-word">I</span>
                                <span class="le-sound-btn-pron">/ ai /</span>
                            </span>
                        </button>
                        <button class="le-sound-btn" onclick="(function(){if('speechSynthesis' in window){var u=new SpeechSynthesisUtterance('G'); u.lang='en-US'; speechSynthesis.speak(u);}})()">
                            <span class="le-sound-btn-play">▶</span>
                            <span class="le-sound-btn-body">
                                <span class="le-sound-btn-word">G</span>
                                <span class="le-sound-btn-pron">/ dji /</span>
                            </span>
                        </button>
                        <button class="le-sound-btn" onclick="(function(){if('speechSynthesis' in window){var u=new SpeechSynthesisUtterance('H'); u.lang='en-US'; speechSynthesis.speak(u);}})()">
                            <span class="le-sound-btn-play">▶</span>
                            <span class="le-sound-btn-body">
                                <span class="le-sound-btn-word">H</span>
                                <span class="le-sound-btn-pron">/ eitch /</span>
                            </span>
                        </button>
                        <button class="le-sound-btn" onclick="(function(){if('speechSynthesis' in window){var u=new SpeechSynthesisUtterance('W'); u.lang='en-US'; speechSynthesis.speak(u);}})()">
                            <span class="le-sound-btn-play">▶</span>
                            <span class="le-sound-btn-body">
                                <span class="le-sound-btn-word">W</span>
                                <span class="le-sound-btn-pron">/ dabôl-iu /</span>
                            </span>
                        </button>
                        <button class="le-sound-btn" onclick="(function(){if('speechSynthesis' in window){var u=new SpeechSynthesisUtterance('Y'); u.lang='en-US'; speechSynthesis.speak(u);}})()">
                            <span class="le-sound-btn-play">▶</span>
                            <span class="le-sound-btn-body">
                                <span class="le-sound-btn-word">Y</span>
                                <span class="le-sound-btn-pron">/ uái /</span>
                            </span>
                        </button>
                        <button class="le-sound-btn" onclick="(function(){if('speechSynthesis' in window){var u=new SpeechSynthesisUtterance('Z'); u.lang='en-US'; speechSynthesis.speak(u);}})()">
                            <span class="le-sound-btn-play">▶</span>
                            <span class="le-sound-btn-body">
                                <span class="le-sound-btn-word">Z</span>
                                <span class="le-sound-btn-pron">/ zi (US) / zed (UK) /</span>
                            </span>
                        </button>
                    </div>
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Os três sons que travam o brasileiro.</h2>
                    </header>
                    <p class="le-copy">São três obstáculos previsíveis. Quase todo brasileiro tropeça neles, quase ninguém treina especificamente. Quem treina, destrava.</p>

                    <div class="le-compare">
                        <div class="le-compare-side le-compare-side--pt">
                            <span class="le-compare-flag">brasileiro tende a dizer</span>
                            <span class="le-compare-text">"<strong>tchink</strong>" ou "<strong>fink</strong>"</span>
                            <p class="le-compare-note">Vira T ou F porque a língua não sabe sair entre os dentes.</p>
                        </div>
                        <div class="le-compare-side le-compare-side--en">
                            <span class="le-compare-flag">o que o nativo diz</span>
                            <span class="le-compare-text">"<strong>think</strong>" / θɪŋk /</span>
                            <p class="le-compare-note">Língua entre os dentes, sopra suave. O TH é o som novo.</p>
                        </div>
                    </div>

                    <div class="le-error">
                        <div class="le-error-label">cuidado com isso</div>
                        <p class="le-error-text">"Ship" (navio) e "sheep" (ovelha) parecem a mesma palavra — mas não são.</p>
                        <p class="le-error-fix">A diferença não é só o I: é o <strong>comprimento</strong> da vogal. <code>ship</code> é curto e seco. <span class="ok">sheep</span> é longo, a língua vai mais à frente. Trocar um pelo outro pode mudar a frase inteira: <em>"I see a ship"</em> vira <em>"I see a sheep"</em>.</p>
                    </div>

                    ${renderExamples(lesson.sections[1].examples)}
                </section>

                ${renderTrainCTA('soa1-alfabeto', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}

            </article>`;
        },

        // ─────────────────────────────────────────────
        // AULA 02 — NÚMEROS, HORAS E DATAS
        // ─────────────────────────────────────────────
        'soa1-numeros': function(lesson) {
            return `
            <article class="le-aula" data-module="01">

                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 02 · primeiros passos</p>
                    <h1 class="le-manifesto-text"><em>Contar</em> é a primeira coisa que você faz num país novo.</h1>
                    <p class="le-manifesto-sub">Pagar uma conta. Pegar um táxi. Marcar uma reunião. Tudo passa por número. A boa notícia: depois de 20, o inglês fica previsível.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">A base — de 1 a 12 cada um tem nome próprio.</h2>
                    </header>
                    <p class="le-copy">Os primeiros doze números são <em>todos</em> palavras únicas — você precisa decorar uma por uma. A partir do 13, começa o padrão. A partir do 20, vira pura regra.</p>

                    <div class="le-map">
                        <div class="le-map-head">
                            <h3 class="le-map-title">1 a 12 — palavras únicas</h3>
                        </div>
                        <div class="le-map-grid">
                            <div class="le-map-cell"><div class="le-map-cell-label">1</div><div class="le-map-cell-sub">one</div></div>
                            <div class="le-map-cell"><div class="le-map-cell-label">2</div><div class="le-map-cell-sub">two</div></div>
                            <div class="le-map-cell"><div class="le-map-cell-label">3</div><div class="le-map-cell-sub">three</div></div>
                            <div class="le-map-cell"><div class="le-map-cell-label">4</div><div class="le-map-cell-sub">four</div></div>
                            <div class="le-map-cell"><div class="le-map-cell-label">5</div><div class="le-map-cell-sub">five</div></div>
                            <div class="le-map-cell"><div class="le-map-cell-label">6</div><div class="le-map-cell-sub">six</div></div>
                            <div class="le-map-cell"><div class="le-map-cell-label">7</div><div class="le-map-cell-sub">seven</div></div>
                            <div class="le-map-cell"><div class="le-map-cell-label">8</div><div class="le-map-cell-sub">eight</div></div>
                            <div class="le-map-cell"><div class="le-map-cell-label">9</div><div class="le-map-cell-sub">nine</div></div>
                            <div class="le-map-cell"><div class="le-map-cell-label">10</div><div class="le-map-cell-sub">ten</div></div>
                            <div class="le-map-cell"><div class="le-map-cell-label">11</div><div class="le-map-cell-sub">eleven</div></div>
                            <div class="le-map-cell"><div class="le-map-cell-label">12</div><div class="le-map-cell-sub">twelve</div></div>
                        </div>
                    </div>

                    <blockquote class="le-pullquote">Depois do 12, só duas regras: termina em <em>-teen</em> de 13 a 19, e em <em>-ty</em> de 20 a 90.</blockquote>
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">A armadilha do TEEN vs TY.</h2>
                    </header>
                    <p class="le-copy">É aqui que brasileiro perde dinheiro em restaurante. <span class="le-inline-en">Thirteen</span> (13) e <span class="le-inline-en">thirty</span> (30) parecem iguais — mas a sílaba forte muda. Quem ouve, decide na sílaba forte.</p>

                    <div class="le-compare">
                        <div class="le-compare-side le-compare-side--pt">
                            <span class="le-compare-flag">13 — força no fim</span>
                            <span class="le-compare-text">thir<strong>TEEN</strong></span>
                            <p class="le-compare-note">A última sílaba é longa. "tcher-TÍÍÍN".</p>
                        </div>
                        <div class="le-compare-side le-compare-side--en">
                            <span class="le-compare-flag">30 — força no começo</span>
                            <span class="le-compare-text"><strong>THIR</strong>-ty</span>
                            <p class="le-compare-note">A primeira sílaba é forte, a última cai. "THÉR-ti".</p>
                        </div>
                    </div>

                    <div class="le-error">
                        <div class="le-error-label">erro clássico</div>
                        <p class="le-error-text">No restaurante o garçom diz <code>fifty</code>, você ouve <code>fifteen</code> — e paga 50 quando esperava 15. Ou o contrário.</p>
                        <p class="le-error-fix">Truque: peça pra repetir e foque na sílaba forte. "Fifteen?" → <span class="ok">"Yes, one-five"</span> resolve qualquer dúvida.</p>
                    </div>
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">03</span>
                        <h2 class="le-section-title">Que horas são? Que dia é?</h2>
                    </header>
                    <p class="le-copy">Para dizer as horas, três palavras resolvem 80% das frases: <span class="le-inline-en">o'clock</span> (em ponto), <span class="le-inline-en">half past</span> (e meia), <span class="le-inline-en">quarter past/to</span> (15 depois/antes).</p>

                    <div class="le-examples">
                        <div class="le-example">
                            <span class="le-example-num">3:00</span>
                            <div class="le-example-body">
                                <span class="le-example-en">It's <strong>three o'clock</strong>.</span>
                                <span class="le-example-pt">São três em ponto.</span>
                            </div>
                        </div>
                        <div class="le-example">
                            <span class="le-example-num">3:30</span>
                            <div class="le-example-body">
                                <span class="le-example-en">It's <strong>half past three</strong>.</span>
                                <span class="le-example-pt">Três e meia.</span>
                            </div>
                        </div>
                        <div class="le-example">
                            <span class="le-example-num">3:15</span>
                            <div class="le-example-body">
                                <span class="le-example-en">It's a <strong>quarter past three</strong>.</span>
                                <span class="le-example-pt">Três e quinze.</span>
                            </div>
                        </div>
                        <div class="le-example">
                            <span class="le-example-num">3:45</span>
                            <div class="le-example-body">
                                <span class="le-example-en">It's a <strong>quarter to four</strong>.</span>
                                <span class="le-example-pt">Um quarto pras quatro (3:45).</span>
                            </div>
                        </div>
                    </div>
                </section>

                ${renderTrainCTA('soa1-numeros', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}

            </article>`;
        },

        // ─────────────────────────────────────────────
        // AULA 03 — CUMPRIMENTOS E APRESENTAÇÃO
        // ─────────────────────────────────────────────
        'soa1-cumprimentos': function(lesson) {
            return `
            <article class="le-aula" data-module="01">

                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 03 · primeiros passos</p>
                    <h1 class="le-manifesto-text">O "How are you?" não pede resposta. Pede o <em>protocolo</em>.</h1>
                    <p class="le-manifesto-sub">A primeira armadilha de quem aprende inglês: travar nas saudações achando que precisa contar a vida. Na prática, é só um ping-pong social. Você responde, segue.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">A escala da formalidade.</h2>
                    </header>
                    <p class="le-copy">Três palavras pra abrir conversa, três níveis de proximidade. <span class="le-inline-en">Hi</span> serve pra todo mundo. <span class="le-inline-en">Hello</span> é mais reservado — telefone, balcão. <span class="le-inline-en">Hey</span> é entre amigos e colegas.</p>

                    <div class="le-dialog">
                        <div class="le-dialog-head">
                            <span class="le-dialog-head-icon">💬</span>
                            <span class="le-dialog-head-title">Encontro casual</span>
                        </div>
                        <div class="le-dialog-bubble le-dialog-bubble--a">
                            Hi, how are you?
                            <span class="le-dialog-bubble-pt">Oi, tudo bem?</span>
                        </div>
                        <div class="le-dialog-bubble le-dialog-bubble--b">
                            Good, thanks. And you?
                            <span class="le-dialog-bubble-pt">Tô bem, valeu. E você?</span>
                        </div>
                        <div class="le-dialog-bubble le-dialog-bubble--a">
                            Not bad, you?
                            <span class="le-dialog-bubble-pt">Tô numa boa. E você?</span>
                        </div>
                    </div>
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">A apresentação em três frases.</h2>
                    </header>
                    <p class="le-copy">Uma boa apresentação curta sustenta 90% dos primeiros contatos. Três blocos, nessa ordem: <strong>nome</strong>, <strong>origem</strong>, <strong>ocupação</strong>. Termina com "Nice to meet you" e o outro toma a vez.</p>

                    <blockquote class="le-pullquote">Não é decorar texto. É ter três frases prontas pra não congelar.</blockquote>

                    <div class="le-examples">
                        <div class="le-example">
                            <span class="le-example-num">01</span>
                            <div class="le-example-body">
                                <span class="le-example-en">My name is <strong>Lucas</strong>.</span>
                                <span class="le-example-pt">Meu nome é Lucas.</span>
                            </div>
                        </div>
                        <div class="le-example">
                            <span class="le-example-num">02</span>
                            <div class="le-example-body">
                                <span class="le-example-en">I'm <strong>from Brazil</strong>, from São Paulo.</span>
                                <span class="le-example-pt">Eu sou do Brasil, de São Paulo.</span>
                            </div>
                        </div>
                        <div class="le-example">
                            <span class="le-example-num">03</span>
                            <div class="le-example-body">
                                <span class="le-example-en">I <strong>work as a designer</strong>.</span>
                                <span class="le-example-pt">Eu trabalho como designer.</span>
                            </div>
                        </div>
                        <div class="le-example">
                            <span class="le-example-num">04</span>
                            <div class="le-example-body">
                                <span class="le-example-en"><strong>Nice to meet you.</strong></span>
                                <span class="le-example-pt">Prazer em te conhecer.</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">03</span>
                        <h2 class="le-section-title">A armadilha do "How are you?".</h2>
                    </header>

                    <div class="le-error">
                        <div class="le-error-label">erro de tradução literal</div>
                        <p class="le-error-text">Brasileiro responde "How are you?" contando que tá cansado, que dormiu mal, que tá com problema no trabalho.</p>
                        <p class="le-error-fix">O americano não quer relatório — é só ping social. A resposta padrão é <span class="ok">"Good, thanks"</span> ou <span class="ok">"Not bad"</span>. Contar problema na primeira frase soa estranho. Reserve isso pra próxima rodada de conversa.</p>
                    </div>

                    <div class="le-case">
                        <span class="le-case-kicker">caso real</span>
                        <p class="le-case-scene">Você acabou de ser apresentado num evento. A pessoa diz <em>"How are you?"</em>.</p>
                        <p class="le-case-line">Você responde <strong>"Good, thanks. And you?"</strong> mesmo se tiver tido um dia ruim. O ping-pong é ritual. Conta o dia ruim na próxima fala, se vier o gancho.</p>
                    </div>
                </section>

                ${renderTrainCTA('soa1-cumprimentos', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}

            </article>`;
        },

        // ─────────────────────────────────────────────
        // AULA 04 — TO BE EM AFIRMATIVA
        // ─────────────────────────────────────────────
        'soa1-tobe-afirm': function(lesson) {
            return `
            <article class="le-aula" data-module="01">

                <header class="le-manifesto">
                    <p class="le-manifesto-kicker">aula 04 · primeiros passos</p>
                    <h1 class="le-manifesto-text">"Ser" e "estar" usam <em>a mesma palavra</em>. Isso é uma boa notícia.</h1>
                    <p class="le-manifesto-sub">O verbo <strong>TO BE</strong> carrega quase tudo no inglês: identidade, estado, localização, perguntas, negativas e até tempos contínuos. Dominar essas três formas — <span class="le-inline-en">am, is, are</span> — destrava metade do idioma.</p>
                </header>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">01</span>
                        <h2 class="le-section-title">As três formas — sem mistério.</h2>
                    </header>
                    <p class="le-copy">Cada pronome puxa uma forma fixa. Não tem variação extra: você decora uma vez e usa pra sempre.</p>

                    <div class="le-map">
                        <div class="le-map-head">
                            <h3 class="le-map-title">a regra das três formas</h3>
                        </div>
                        <div class="le-map-grid" style="grid-template-columns: 1fr 1fr 1fr;">
                            <div class="le-map-cell">
                                <div class="le-map-cell-label">am</div>
                                <div class="le-map-cell-sub">I am</div>
                            </div>
                            <div class="le-map-cell">
                                <div class="le-map-cell-label">is</div>
                                <div class="le-map-cell-sub">he / she / it</div>
                            </div>
                            <div class="le-map-cell">
                                <div class="le-map-cell-label">are</div>
                                <div class="le-map-cell-sub">you / we / they</div>
                            </div>
                        </div>
                    </div>

                    <blockquote class="le-pullquote">Na fala real, ninguém diz "I am". Vira <em>I'm</em>. <em>He is</em> vira <em>he's</em>. As contrações são quem soa nativo.</blockquote>
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">02</span>
                        <h2 class="le-section-title">Ser ou estar? O inglês não escolhe.</h2>
                    </header>
                    <p class="le-copy">No português você decide entre <em>ser</em> (permanente) e <em>estar</em> (temporário). No inglês, é a mesma palavra. O contexto fala por si.</p>

                    <div class="le-compare">
                        <div class="le-compare-side le-compare-side--pt">
                            <span class="le-compare-flag">português separa</span>
                            <span class="le-compare-text">"Eu <strong>sou</strong> brasileiro"<br>"Eu <strong>estou</strong> cansado"</span>
                            <p class="le-compare-note">Dois verbos pra duas ideias diferentes.</p>
                        </div>
                        <div class="le-compare-side le-compare-side--en">
                            <span class="le-compare-flag">inglês funde</span>
                            <span class="le-compare-text">"I <strong>am</strong> Brazilian"<br>"I <strong>am</strong> tired"</span>
                            <p class="le-compare-note">Mesmo verbo. O contexto decide o sentido.</p>
                        </div>
                    </div>

                    ${renderExamples(lesson.sections[1].examples)}
                </section>

                <section class="le-section">
                    <header class="le-section-head">
                        <span class="le-section-num">03</span>
                        <h2 class="le-section-title">Onde o TO BE vai aparecer.</h2>
                    </header>
                    <p class="le-copy">Esta aula é só a afirmativa. Mas o TO BE ainda vai te seguir em quase tudo. Mapa do que vem:</p>

                    <div class="le-timeline">
                        <div class="le-timeline-step">
                            <p class="le-timeline-when">agora · aula 04</p>
                            <h4 class="le-timeline-text">Afirmativa</h4>
                            <p class="le-timeline-detail">"I am Brazilian", "She is happy". A base.</p>
                        </div>
                        <div class="le-timeline-step">
                            <p class="le-timeline-when">próximo módulo · aula 07</p>
                            <h4 class="le-timeline-text">Perguntas e negações</h4>
                            <p class="le-timeline-detail">"Are you ready?", "I'm not tired". A inversão e o "not".</p>
                        </div>
                        <div class="le-timeline-step">
                            <p class="le-timeline-when">depois · A2</p>
                            <h4 class="le-timeline-text">Passado: was, were</h4>
                            <p class="le-timeline-detail">"I was there", "They were friends". As versões no passado.</p>
                        </div>
                    </div>
                </section>

                ${renderTrainCTA('soa1-tobe-afirm', lesson.title)}
                ${renderCuriosities(lesson.curiosities)}

            </article>`;
        }
    };

    // ============================================================
    // HOOK NO _griloOpenLesson
    // ============================================================

    function applyEditorialIfAvailable(slug) {
        const layout = LAYOUTS[slug];
        if (!layout) return false;

        const main = document.getElementById('lessonModalMain');
        if (!main) return false;

        const lesson = (window._lessonsData || {})[slug];
        if (!lesson) return false;

        try {
            main.innerHTML = layout(lesson);
            main.dataset.editorial = '1';
            // Scroll para o topo
            main.scrollTop = 0;
            return true;
        } catch (e) {
            console.error('[editorial-renderer] erro renderizando', slug, e);
            return false;
        }
    }

    // Aguarda lessons-enhanced.js expor _griloOpenLesson e envelopa
    function installHook() {
        const original = window._griloOpenLesson;
        if (typeof original !== 'function') {
            setTimeout(installHook, 200);
            return;
        }
        if (original._editorialHookInstalled) return;

        window._griloOpenLesson = function(slug, triggerEl) {
            // Roda o original (que monta aside, modal etc.)
            original(slug, triggerEl);
            // Substitui o conteúdo do main se houver layout editorial
            requestAnimationFrame(() => applyEditorialIfAvailable(slug));
        };
        window._griloOpenLesson._editorialHookInstalled = true;

        console.log('[editorial-renderer] hook instalado · layouts:', Object.keys(LAYOUTS).length);
    }

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(installHook, 300);
    });
})();
