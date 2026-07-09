/* ============================================================================
 * CEFR Level Modal — "Seu progresso" clicável na home
 * ----------------------------------------------------------------------------
 * Painel que explica como o aluno conquista o próximo nível CEFR.
 *
 * Gates com DADO REAL (contam hoje):
 *   • Vocabulário   → stats.vocab_mastered_total   (WordProfile.mastered)
 *   • Frases        → stats.phrases_mastered_total (PhraseError.status="dominada")
 *
 * Gates EM CONSTRUÇÃO (grupo separado, sem número):
 *   • Shadowing · As 4 pontas · Descritores can-do
 *
 * Autocontido: injeta seu próprio markup e CSS, liga o clique no card #sideCefr.
 * Lê de window._lastUserStats (populado por lessons-controller.js).
 * Design: segue o sistema da home (Manrope/Space Grotesk, paleta sage) — light-only
 * como o resto do app.
 *
 * Metodologia e metas: ver docs/cefr-sistema-niveis.html
 * As metas numéricas são proxies correlatas (CEFR / Cambridge English Profile),
 * comunicadas como aproximação — calibrar com uso real.
 * ========================================================================== */
(function () {
    'use strict';

    // ── Metas por nível (proxies correlatas — calibrar depois) ──────────────
    // Faixas de vocabulário ancoradas no Cambridge English Profile.
    var LEVEL_TARGETS = {
        A1: { vocab: 500,  phrases: 50 },
        A2: { vocab: 1500, phrases: 120 },
        B1: { vocab: 2500, phrases: 250 },
        B2: { vocab: 4000, phrases: 400 },
        C1: { vocab: 6000, phrases: 600 },
        C2: { vocab: 8000, phrases: 800 }
    };

    var LADDER = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    // Rótulo visível no pill da escada. "A0" não é nomenclatura oficial do CEFR
    // (a escala começa em A1) — chamamos de "Ponto de partida" para não soar
    // como um nível fraco, só o estágio antes de haver progresso mensurável.
    var LADDER_LABEL = { A0: 'Início' };

    // O que cada instituição considera válido para o nível — resumo simples.
    // Fonte é sempre citada; a régua numérica do GRILO é nossa, não delas.
    var LEVEL_INFO = {
        A0: {
            title: 'Ponto de partida',
            desc: 'Ainda não há um nível reconhecido — é aqui que todo aluno começa.',
            source: null
        },
        A1: {
            title: 'Iniciante',
            desc: '"Consigo me apresentar e fazer perguntas pessoais simples com frases básicas do dia a dia."',
            source: 'CEFR (Council of Europe) · ≈ 500 palavras essenciais, segundo o English Profile (Cambridge)'
        },
        A2: {
            title: 'Básico',
            desc: '"Consigo descrever minha rotina, necessidades imediatas e fazer trocas simples e diretas."',
            source: 'CEFR (Council of Europe) · ≈ 1.000–1.500 palavras, segundo o English Profile (Cambridge)'
        },
        B1: {
            title: 'Intermediário',
            desc: '"Consigo lidar com situações de viagem, dar opiniões e narrar experiências."',
            source: 'CEFR (Council of Europe) · ≈ 2.500 palavras, segundo o English Profile (Cambridge)'
        },
        B2: {
            title: 'Intermediário superior',
            desc: '"Consigo argumentar, interagir com fluência e entender textos complexos."',
            source: 'CEFR (Council of Europe) · ≈ 4.000 palavras, segundo o English Profile (Cambridge)'
        },
        C1: {
            title: 'Avançado',
            desc: '"Consigo me expressar com flexibilidade, espontaneidade e precisão em contextos exigentes."',
            source: 'CEFR (Council of Europe) · ≈ 6.000 palavras, segundo o English Profile (Cambridge)'
        },
        C2: {
            title: 'Proficiente',
            desc: '"Consigo entender e me expressar com domínio quase nativo, em qualquer contexto."',
            source: 'CEFR (Council of Europe) · ≈ 8.000+ palavras, segundo o English Profile (Cambridge)'
        }
    };
    var LEVEL_DISCLAIMER = 'O GRILO usa isso como guia — não como verdade absoluta. As metas são nossa própria régua, inspirada nessas fontes.';

    // Gates ainda em construção. "As 4 pontas" saiu daqui — agora tem dado real
    // (aulas do sistema lessons-4p → stats.scope4p), renderizado como gate ativo.
    var GATES_WIP = [
        { icon: '🎙️', title: 'Sessões de shadowing', sub: 'Treino de fala guiado do nível' },
        { icon: '✅', title: 'Consigo fazer (can-do)', sub: 'Descritores do CEFR marcados por evidência' }
    ];

    // Circunferência do anel de progresso (r = 24)
    var RING_C = 2 * Math.PI * 24;

    // ── Helpers ─────────────────────────────────────────────────────────────
    function pct(cur, target) {
        if (!target) return 0;
        return Math.max(0, Math.min(100, Math.round((cur / target) * 100)));
    }

    function stateFor(p) {
        if (p >= 100) return 'done';
        if (p > 0) return 'going';
        return 'zero';
    }

    function fmt(n) {
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    // % geral do próximo nível = média dos gates com dado real.
    // Retorna null quando o payload não tem os campos (backend antigo) —
    // nesse caso o caller mantém o valor heurístico.
    function computeOverall(stats) {
        if (!stats) return null;
        if (stats.vocab_mastered_total == null && stats.phrases_mastered_total == null) return null;
        var next = ((stats.cefr || {}).next) || 'A2';
        var target = LEVEL_TARGETS[next] || LEVEL_TARGETS.A2;
        var vp = pct(stats.vocab_mastered_total || 0, target.vocab);
        var pp = pct(stats.phrases_mastered_total || 0, target.phrases);
        return Math.round((vp + pp) / 2);
    }

    // ── CSS (injetado uma vez) ──────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('cefrModalStyles')) return;
        var css = '' +

        /* ── Overlay: backdrop verde-tintado, assinatura do produto ── */
        '.cefr-modal{position:fixed;inset:0;background:rgba(31,59,45,.45);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;animation:cefrFade .22s ease;}' +
        '.cefr-modal[hidden]{display:none;}' +
        '@keyframes cefrFade{from{opacity:0}to{opacity:1}}' +
        '@keyframes cefrPop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}' +
        '@keyframes cefrRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}' +

        /* ── Shell ──
         * overflow:hidden só nos cantos (border-radius via clipping do próprio
         * fundo branco); head e ladder ficam overflow:visible para o popover
         * poder escapar sem ser cortado. */
        '.cefr-shell{background:#fff;color:#1F3B2D;width:min(540px,100%);max-height:92vh;border-radius:20px;box-shadow:0 24px 70px rgba(31,59,45,.35);display:flex;flex-direction:column;font-family:"Space Grotesk",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;animation:cefrPop .3s cubic-bezier(.22,1,.36,1);}' +

        /* ── Header: gradiente profundo, o momento da conquista ──
         * O glow decorativo vive num ::before recortado pelo próprio
         * border-radius do topo — não precisa que o .cefr-head tenha
         * overflow:hidden (que cortaria o popover do nível). */
        '.cefr-head{position:relative;border-radius:20px 20px 0 0;background:linear-gradient(135deg,#4A7058 0%,#3A5E47 55%,#2C4A37 100%);color:#fff;padding:24px 26px 22px;}' +
        '.cefr-head::before{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(circle at 92% -18%,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 42%);pointer-events:none;z-index:0;}' +
        '.cefr-head>*{position:relative;z-index:1;}' +
        '.cefr-eyebrow{font-family:"Manrope",sans-serif;font-size:.64rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.66);margin:0 0 10px;}' +
        '.cefr-head-row{display:flex;align-items:center;justify-content:space-between;gap:18px;}' +
        '.cefr-head-lvl{font-family:"Manrope",sans-serif;font-weight:800;font-size:2rem;letter-spacing:-.02em;line-height:1;display:flex;align-items:center;gap:12px;}' +
        '.cefr-head-lvl .arw{font-weight:400;font-size:1.3rem;color:rgba(255,255,255,.55);}' +
        '.cefr-head-sub{font-size:.8rem;color:rgba(255,255,255,.75);margin-top:8px;max-width:30ch;line-height:1.45;}' +

        /* Anel de progresso */
        '.cefr-ring{flex:none;position:relative;width:66px;height:66px;}' +
        '.cefr-ring svg{transform:rotate(-90deg);display:block;}' +
        '.cefr-ring .track{fill:none;stroke:rgba(255,255,255,.18);stroke-width:5;}' +
        '.cefr-ring .fill{fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round;transition:stroke-dashoffset .9s cubic-bezier(.22,1,.36,1);}' +
        '.cefr-ring .val{position:absolute;inset:0;display:grid;place-items:center;font-family:"Manrope",sans-serif;font-weight:800;font-size:.92rem;letter-spacing:-.02em;font-variant-numeric:tabular-nums;}' +

        /* Escada CEFR — overflow visível para o popover poder escapar do header */
        '.cefr-ladder{display:flex;gap:6px;margin-top:18px;position:relative;overflow:visible;}' +
        '.cefr-step{flex:1;text-align:center;font-family:"Manrope",sans-serif;font-weight:800;font-size:.68rem;letter-spacing:.04em;padding:5px 0;border-radius:99px;border:1px solid transparent;cursor:default;position:relative;transition:background .15s ease,color .15s ease;}' +
        '.cefr-step.won{background:rgba(255,255,255,.22);color:#fff;}' +
        '.cefr-step.now{background:#fff;color:#2C4A37;box-shadow:0 2px 8px rgba(0,0,0,.18);}' +
        '.cefr-step.next{border-color:rgba(255,255,255,.55);border-style:dashed;color:rgba(255,255,255,.9);}' +
        '.cefr-step.far{background:rgba(255,255,255,.07);color:rgba(255,255,255,.4);}' +
        '.cefr-step:hover,.cefr-step:focus-visible{background:rgba(255,255,255,.34);color:#fff;outline:none;z-index:25;}' +
        '.cefr-step.now:hover,.cefr-step.now:focus-visible{background:#fff;color:#2C4A37;}' +

        /* ── Popover de nível (tooltip institucional) ──
         * Abre para BAIXO do pill (há espaço de sobra no corpo do modal).
         * O header precisa de overflow visível para o popover escapar dele —
         * o glow decorativo (::before) é contido à parte via clip-path no shell. */
        '.cefr-pop{position:absolute;left:50%;top:calc(100% + 12px);transform:translateX(-50%) translateY(-6px);width:264px;max-width:calc(100vw - 56px);background:#1A2B21;color:#fff;border-radius:14px;padding:16px 18px 14px;box-shadow:0 18px 40px rgba(0,0,0,.38),0 0 0 1px rgba(255,255,255,.06);z-index:30;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .16s ease,transform .16s ease,visibility .16s;text-align:left;}' +
        '.cefr-step:hover .cefr-pop,.cefr-step:focus-visible .cefr-pop{opacity:1;visibility:visible;pointer-events:auto;transform:translateX(-50%) translateY(0);}' +
        '.cefr-pop::before{content:"";position:absolute;bottom:100%;left:50%;transform:translateX(-50%);border:8px solid transparent;border-bottom-color:#1A2B21;}' +
        '.cefr-pop-lvl{display:flex;align-items:center;gap:7px;font-size:.68rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#8FE3A0;margin:0 0 9px;white-space:nowrap;}' +
        '.cefr-pop-lvl .dot{width:6px;height:6px;border-radius:50%;background:#8FE3A0;flex:none;}' +
        '.cefr-pop-desc{display:block;font-size:.83rem;line-height:1.55;color:#F1F7F2;font-weight:500;font-style:italic;white-space:normal;word-wrap:break-word;}' +
        '.cefr-pop-src{display:block;margin:11px 0 0;padding-top:11px;border-top:1px solid rgba(255,255,255,.15);font-size:.71rem;line-height:1.5;color:#A9CFB0;white-space:normal;}' +
        '.cefr-pop-note{display:flex;align-items:flex-start;gap:7px;margin:9px 0 0;font-size:.68rem;line-height:1.5;color:rgba(255,255,255,.62);white-space:normal;}' +
        '.cefr-pop-note .ic{flex:none;width:14px;height:14px;margin-top:1px;border-radius:50%;background:rgba(255,255,255,.14);color:rgba(255,255,255,.75);font-size:.6rem;font-weight:800;font-style:normal;display:flex;align-items:center;justify-content:center;line-height:1;}' +
        /* Extremidades da escada: o popover não pode sair da tela */ +
        '.cefr-ladder .cefr-step:nth-child(-n+2) .cefr-pop{left:0;transform:translateX(0) translateY(-6px);}' +
        '.cefr-ladder .cefr-step:nth-child(-n+2) .cefr-pop::before{left:22px;transform:translateX(-50%);}' +
        '.cefr-ladder .cefr-step:nth-child(-n+2):hover .cefr-pop,.cefr-ladder .cefr-step:nth-child(-n+2):focus-visible .cefr-pop{transform:translateX(0) translateY(0);}' +
        '.cefr-ladder .cefr-step:nth-last-child(-n+2) .cefr-pop{left:auto;right:0;transform:translateX(0) translateY(-6px);}' +
        '.cefr-ladder .cefr-step:nth-last-child(-n+2) .cefr-pop::before{left:auto;right:22px;transform:translateX(50%);}' +
        '.cefr-ladder .cefr-step:nth-last-child(-n+2):hover .cefr-pop,.cefr-ladder .cefr-step:nth-last-child(-n+2):focus-visible .cefr-pop{transform:translateX(0) translateY(0);}' +
        '@media (max-width:480px){.cefr-pop{width:224px;padding:14px 15px 12px;}.cefr-pop-desc{font-size:.79rem;}}' +

        /* Fechar */
        '.cefr-close{position:absolute;top:14px;right:14px;appearance:none;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.14);border:none;color:#fff;font-size:.95rem;line-height:1;cursor:pointer;display:grid;place-items:center;transition:background .15s ease;}' +
        '.cefr-close:hover{background:rgba(255,255,255,.28);}' +
        '.cefr-close:focus-visible{outline:2px solid #fff;outline-offset:2px;}' +

        /* ── Corpo ── */
        '.cefr-body{flex:1 1 auto;min-height:0;padding:6px 26px 10px;overflow-y:auto;background:#fff;}' +
        '.cefr-intro{font-size:.82rem;color:#6C8274;line-height:1.55;margin:16px 0 4px;}' +
        '.cefr-intro b{color:#3A5E47;font-weight:600;}' +

        /* Linha de requisito (dado real) */
        '.cefr-req{padding:16px 0 14px;border-bottom:1px solid #EDF3EE;animation:cefrRise .38s ease both;animation-delay:calc(var(--i,0)*60ms);}' +
        '.cefr-req:last-child{border-bottom:none;}' +
        '.cefr-req-top{display:flex;align-items:center;gap:12px;}' +
        '.cefr-req-ico{flex:none;position:relative;width:38px;height:38px;border-radius:11px;display:grid;place-items:center;font-size:1.05rem;background:#F1F6F2;}' +
        '.cefr-req.done .cefr-req-ico{background:#DFF0E2;}' +
        '.cefr-req.going .cefr-req-ico{background:#EAF3EC;}' +
        '.cefr-req-ico .tick{position:absolute;top:-5px;right:-5px;width:17px;height:17px;border-radius:50%;background:linear-gradient(135deg,#7A9E84,#3A5E47);color:#fff;font-size:.6rem;font-weight:800;display:grid;place-items:center;box-shadow:0 2px 6px rgba(58,94,71,.4);}' +
        '.cefr-req-txt{flex:1;min-width:0;}' +
        '.cefr-req-t{font-family:"Manrope",sans-serif;font-weight:700;font-size:.92rem;color:#1F3B2D;letter-spacing:-.01em;}' +
        '.cefr-req-s{font-size:.75rem;color:#8FA396;margin-top:1px;}' +
        '.cefr-req-num{flex:none;text-align:right;font-family:"Manrope",sans-serif;font-variant-numeric:tabular-nums;line-height:1.1;}' +
        '.cefr-req-num .cur{font-weight:800;font-size:1.22rem;color:#1F3B2D;letter-spacing:-.02em;}' +
        '.cefr-req-num .tgt{font-weight:600;font-size:.72rem;color:#A9B8AD;display:block;margin-top:1px;}' +
        '.cefr-req.done .cefr-req-num .cur{color:#3A5E47;}' +

        /* Barra full-width */
        '.cefr-bar{margin-top:11px;height:6px;border-radius:99px;background:#E9F1EA;overflow:hidden;}' +
        '.cefr-bar>i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,#7A9E84,#3A5E47);transition:width .9s cubic-bezier(.22,1,.36,1);}' +

        /* ── Grupo "em construção" ── */
        '.cefr-wip-label{font-family:"Manrope",sans-serif;font-size:.62rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#B08A3C;margin:20px 0 2px;display:flex;align-items:center;gap:8px;animation:cefrRise .38s ease both;animation-delay:calc(var(--i,0)*60ms);}' +
        '.cefr-wip-label::after{content:"";flex:1;height:1px;background:#F0E8D5;}' +
        '.cefr-req.wip{border-bottom:none;padding:13px 0 4px;}' +
        '.cefr-req.wip .cefr-req-ico{background:#F7F5EE;filter:saturate(.55);opacity:.75;}' +
        '.cefr-req.wip .cefr-req-t{color:#7d8a80;}' +
        '.cefr-req.wip .cefr-req-s{color:#A9B3AA;}' +
        '.cefr-chip-wip{flex:none;font-family:"Manrope",sans-serif;font-size:.58rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#B08A3C;border:1px dashed #D9C489;background:#FDFAF2;padding:3px 9px;border-radius:99px;white-space:nowrap;}' +
        '.cefr-bar.ghost{background:repeating-linear-gradient(45deg,rgba(176,138,60,.14) 0 7px,rgba(176,138,60,.04) 7px 14px);}' +

        /* ── Rodapé ── */
        '.cefr-foot{flex:none;padding:14px 26px 18px;border-top:1px solid #EDF3EE;background:#FBFDFB;border-radius:0 0 20px 20px;font-size:.7rem;color:#8FA396;line-height:1.55;}' +
        '.cefr-foot b{color:#5A7E66;font-weight:700;}' +

        /* ── Card da home: affordance de clique ── */
        '#sideCefr{cursor:pointer;position:relative;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease;}' +
        '#sideCefr::after{content:"›";position:absolute;top:12px;right:16px;font-size:1.05rem;font-weight:700;color:#A9B8AD;transition:transform .15s ease,color .15s ease;}' +
        '#sideCefr:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(58,94,71,.14);border-color:#B5CDB0;}' +
        '#sideCefr:hover::after{transform:translateX(3px);color:#3A5E47;}' +
        '#sideCefr:focus-visible{outline:2px solid #7A9E84;outline-offset:3px;}' +

        /* Mobile */
        '@media (max-width:480px){' +
          '.cefr-head{padding:20px 20px 18px;}' +
          '.cefr-body{padding:4px 20px 8px;}' +
          '.cefr-foot{padding:12px 20px 16px;}' +
          '.cefr-head-lvl{font-size:1.6rem;}' +
          '.cefr-ring{width:56px;height:56px;}' +
          '.cefr-ring svg{width:56px;height:56px;}' +
        '}' +

        /* Reduced motion */
        '@media (prefers-reduced-motion:reduce){' +
          '.cefr-modal,.cefr-shell,.cefr-req,.cefr-wip-label{animation:none;}' +
          '.cefr-bar>i,.cefr-ring .fill,#sideCefr{transition:none;}' +
        '}';

        var style = document.createElement('style');
        style.id = 'cefrModalStyles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ── Markup (injetado uma vez) ───────────────────────────────────────────
    function ensureModal() {
        var existing = document.getElementById('cefrModal');
        if (existing) return existing;

        var overlay = document.createElement('div');
        overlay.className = 'cefr-modal';
        overlay.id = 'cefrModal';
        overlay.hidden = true;
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'cefrModalLvl');
        overlay.innerHTML =
            '<div class="cefr-shell">' +
              '<div class="cefr-head">' +
                '<button type="button" class="cefr-close" id="cefrModalClose" aria-label="Fechar">✕</button>' +
                '<p class="cefr-eyebrow">Rumo ao próximo nível</p>' +
                '<div class="cefr-head-row">' +
                  '<div>' +
                    '<div class="cefr-head-lvl" id="cefrModalLvl">A1 <span class="arw">→</span> A2</div>' +
                    '<p class="cefr-head-sub">O que você precisa cumprir — medido pelo que você realmente faz.</p>' +
                  '</div>' +
                  '<div class="cefr-ring" id="cefrModalRing" role="img" aria-label="Progresso geral">' +
                    '<svg width="66" height="66" viewBox="0 0 66 66" aria-hidden="true">' +
                      '<circle class="track" cx="33" cy="33" r="24"></circle>' +
                      '<circle class="fill" id="cefrRingFill" cx="33" cy="33" r="24" stroke-dasharray="' + RING_C.toFixed(1) + '" stroke-dashoffset="' + RING_C.toFixed(1) + '"></circle>' +
                    '</svg>' +
                    '<span class="val" id="cefrRingVal">0%</span>' +
                  '</div>' +
                '</div>' +
                '<div class="cefr-ladder" id="cefrModalLadder" aria-label="Escala de níveis CEFR"></div>' +
              '</div>' +
              '<div class="cefr-body" id="cefrModalBody"></div>' +
              '<div class="cefr-foot">' +
                'Método ancorado no <b>CEFR</b> (Council of Europe) e no <b>English Profile</b> (Cambridge). ' +
                'Metas aproximadas, em calibração com uso real.' +
              '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        // Fechar: botão, clique fora, ESC
        overlay.querySelector('#cefrModalClose').addEventListener('click', closeModal);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeModal();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !overlay.hidden) closeModal();
        });

        return overlay;
    }

    // ── Render ──────────────────────────────────────────────────────────────
    function levelPopHtml(lvl, popId) {
        var info = LEVEL_INFO[lvl];
        if (!info) return '';
        var shownLvl = LADDER_LABEL[lvl] || lvl;
        var lvlHeading = LADDER_LABEL[lvl] ? shownLvl : (shownLvl + ' · ' + info.title);
        var html = '<span class="cefr-pop" role="tooltip" id="' + popId + '">' +
            '<span class="cefr-pop-lvl"><span class="dot" aria-hidden="true"></span>' + lvlHeading + '</span>' +
            '<span class="cefr-pop-desc">' + info.desc + '</span>';
        if (info.source) {
            html += '<span class="cefr-pop-src">Segundo ' + info.source + '.</span>' +
                '<span class="cefr-pop-note"><span class="ic" aria-hidden="true">i</span><span>' + LEVEL_DISCLAIMER + '</span></span>';
        }
        html += '</span>';
        return html;
    }

    function renderLadder(current, next) {
        var el = document.getElementById('cefrModalLadder');
        if (!el) return;
        var curIdx = LADDER.indexOf(current);
        var nextIdx = LADDER.indexOf(next);
        el.innerHTML = LADDER.map(function (lvl, i) {
            var cls = 'far';
            if (i < curIdx) cls = 'won';
            else if (i === curIdx) cls = 'now';
            else if (i === nextIdx) cls = 'next';
            var popId = 'cefrPop' + lvl;
            return '<span class="cefr-step ' + cls + '" tabindex="0" aria-describedby="' + popId + '">' +
                (LADDER_LABEL[lvl] || lvl) + levelPopHtml(lvl, popId) +
                '</span>';
        }).join('');
    }

    function realRow(idx, opts) {
        // opts: {icon,title,sub,cur,target}
        var p = pct(opts.cur, opts.target);
        var st = stateFor(p);
        return '' +
        '<div class="cefr-req ' + st + '" style="--i:' + idx + '">' +
          '<div class="cefr-req-top">' +
            '<span class="cefr-req-ico">' + opts.icon +
              (st === 'done' ? '<span class="tick">✓</span>' : '') +
            '</span>' +
            '<div class="cefr-req-txt">' +
              '<div class="cefr-req-t">' + opts.title + '</div>' +
              '<div class="cefr-req-s">' + opts.sub + '</div>' +
            '</div>' +
            '<div class="cefr-req-num">' +
              '<span class="cur">' + fmt(opts.cur) + '</span>' +
              '<span class="tgt">de ' + fmt(opts.target) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="cefr-bar"><i data-w="' + p + '"></i></div>' +
        '</div>';
    }

    function wipRow(idx, g) {
        return '' +
        '<div class="cefr-req wip" style="--i:' + idx + '">' +
          '<div class="cefr-req-top">' +
            '<span class="cefr-req-ico">' + g.icon + '</span>' +
            '<div class="cefr-req-txt">' +
              '<div class="cefr-req-t">' + g.title + '</div>' +
              '<div class="cefr-req-s">' + g.sub + '</div>' +
            '</div>' +
            '<span class="cefr-chip-wip">em construção</span>' +
          '</div>' +
          '<div class="cefr-bar ghost"></div>' +
        '</div>';
    }

    function render(stats) {
        var cefr = (stats && stats.cefr) || {};
        var current = cefr.current || 'A1';
        var next = cefr.next || 'A2';
        var target = LEVEL_TARGETS[next] || LEVEL_TARGETS.A2;

        var vocabCur = (stats && stats.vocab_mastered_total) || 0;
        var phrasesCur = (stats && stats.phrases_mastered_total) || 0;

        // Cabeçalho
        var lvlEl = document.getElementById('cefrModalLvl');
        if (lvlEl) lvlEl.innerHTML = current + ' <span class="arw">→</span> ' + next;
        renderLadder(current, next);

        // % geral = média dos gates com dado real
        var overall = computeOverall(stats);
        if (overall == null) overall = 0;
        var ringVal = document.getElementById('cefrRingVal');
        if (ringVal) ringVal.textContent = overall + '%';
        var ring = document.getElementById('cefrModalRing');
        if (ring) ring.setAttribute('aria-label', 'Progresso geral: ' + overall + '% do ' + next);

        // Corpo
        var body = document.getElementById('cefrModalBody');
        if (!body) return;
        var html = '<p class="cefr-intro" style="--i:0">Sem pontos vazios: cada requisito conta o que você <b>viu, ouviu, escreveu e falou</b> de verdade.</p>';
        html += realRow(1, {
            icon: '📖', title: 'Vocabulário essencial',
            sub: 'Palavras dominadas', cur: vocabCur, target: target.vocab
        });
        html += realRow(2, {
            icon: '💬', title: 'Frases e estruturas',
            sub: 'Frases dominadas nas aulas', cur: phrasesCur, target: target.phrases
        });

        // Gate "As 4 pontas" — dado real do sistema de aulas lessons-4p.
        // Conta aulas concluídas do bloco (gate estrutural A1→A2).
        var sc = (stats && stats.scope4p) || null;
        var rowIdx = 3;
        if (sc && sc.block_total) {
            html += realRow(rowIdx++, {
                icon: '🔄', title: 'As 4 pontas',
                sub: 'Aulas concluídas (ver · ouvir · escrever · falar)',
                cur: sc.lessons_completed || 0, target: sc.block_total
            });
        }

        html += '<div class="cefr-wip-label" style="--i:' + rowIdx + '">Próximos requisitos</div>';
        GATES_WIP.forEach(function (g, i) {
            html += wipRow(rowIdx + 1 + i, g);
        });
        body.innerHTML = html;

        // Animações de preenchimento (barras + anel) após o primeiro frame
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                body.querySelectorAll('.cefr-bar > i[data-w]').forEach(function (bar) {
                    bar.style.width = bar.getAttribute('data-w') + '%';
                });
                var fill = document.getElementById('cefrRingFill');
                if (fill) fill.style.strokeDashoffset = String(RING_C * (1 - overall / 100));
            });
        });
    }

    // ── Abrir / fechar ──────────────────────────────────────────────────────
    var _lastFocus = null;

    function openModal() {
        injectStyles();
        var overlay = ensureModal();
        // Reseta o anel para a animação recomeçar a cada abertura
        var fill = document.getElementById('cefrRingFill');
        if (fill) fill.style.strokeDashoffset = String(RING_C);
        render(window._lastUserStats || {});
        _lastFocus = document.activeElement;
        overlay.hidden = false;
        var closeBtn = overlay.querySelector('#cefrModalClose');
        if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
        var overlay = document.getElementById('cefrModal');
        if (overlay) overlay.hidden = true;
        if (_lastFocus && typeof _lastFocus.focus === 'function') _lastFocus.focus();
    }

    // ── Ligar o card #sideCefr ──────────────────────────────────────────────
    function bindCard() {
        var card = document.getElementById('sideCefr');
        if (!card || card.__cefrBound) return;
        card.__cefrBound = true;
        injectStyles();

        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-haspopup', 'dialog');
        card.setAttribute('aria-label', 'Ver requisitos para o próximo nível');

        card.addEventListener('click', openModal);
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal();
            }
        });
    }

    // ── Coerência de números: card da home mostra o MESMO % do modal ────────
    // lessons-controller pinta o card com um % heurístico (acurácia+voz+lições).
    // Sobrescrevemos o render para usar o % real dos gates — um número só,
    // em todo lugar. Se o payload não tiver os campos, mantém o heurístico.
    function overrideSideCardRender() {
        if (typeof window._renderCefrCard !== 'function') return;
        if (window._renderCefrCard.__cefrSynced) return;
        var orig = window._renderCefrCard;
        window._renderCefrCard = function (cefr) {
            orig(cefr); // labels A1→A2 + fallback heurístico
            var overall = computeOverall(window._lastUserStats);
            if (overall == null) return;
            var pctEl = document.getElementById('sideCefrPct');
            if (pctEl) pctEl.textContent = overall;
            var fillEl = document.getElementById('sideCefrFill');
            if (fillEl) fillEl.style.width = overall + '%';
        };
        window._renderCefrCard.__cefrSynced = true;
    }

    // O card só existe depois que o painel de progresso monta; tentamos algumas vezes.
    function boot() {
        overrideSideCardRender();
        bindCard();
        if (document.getElementById('sideCefr') && document.getElementById('sideCefr').__cefrBound) return;
        var tries = 0;
        var iv = setInterval(function () {
            bindCard();
            tries++;
            if (tries > 40 || (document.getElementById('sideCefr') || {}).__cefrBound) clearInterval(iv);
        }, 300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    // Exports (úteis para debug / chamadas externas)
    window.openCefrModal = openModal;
    window.closeCefrModal = closeModal;
})();
