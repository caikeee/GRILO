/* ============================================================================
 * Vocabulary Review Modal — "palavras dominadas" clicável na home
 * ----------------------------------------------------------------------------
 * Abre um review de TODO o vocabulário que o aluno praticou no chat de voz:
 * ranking por uso, acurácia de pronúncia por palavra e filtro dominada / em
 * progresso. É leitura — a pessoa revisa o que já falou.
 *
 * Fonte de dados: GET /api/voice/vocabulary
 *   → { words:[{word,uses,correct_uses,accuracy,mastered,status,
 *               last_error_label,first_seen,last_seen}], total_seen, total_mastered }
 *   Traz TODAS as palavras (WordProfile), não só mastered — as em progresso
 *   alimentam o reforço futuro.
 *
 * Regra de "dominada" (backend, recap de voz): acurácia >= 85% com >= 5 usos.
 * Uma vez dominada, não reverte (latch) — a acurácia segue registrada para
 * estimular reforço, mas não tira a palavra do vocabulário.
 *
 * Autocontido: injeta seu próprio markup e CSS, liga o clique no card
 * #sideVocab. Design casado com o cefr-modal (Manrope/Space Grotesk, paleta
 * sage), light-only como o resto do app.
 * ========================================================================== */
(function () {
    'use strict';

    var _data = null;        // último payload carregado
    var _loading = false;
    var _filter = 'all';     // 'all' | 'dominada' | 'em_progresso'
    var _query = '';
    var _lastFocus = null;

    // ── Helpers ─────────────────────────────────────────────────────────────
    function fmt(n) {
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function esc(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
    }

    // Faixa de acurácia → tom da barra. 3 níveis, sem virar semáforo agressivo.
    function accTone(acc) {
        if (acc >= 85) return 'high';
        if (acc >= 60) return 'mid';
        return 'low';
    }

    function relTime(iso) {
        if (!iso) return '';
        var then = new Date(iso).getTime();
        if (isNaN(then)) return '';
        var days = Math.floor((Date.now() - then) / 86400000);
        if (days <= 0) return 'hoje';
        if (days === 1) return 'ontem';
        if (days < 7) return 'há ' + days + ' dias';
        if (days < 30) return 'há ' + Math.floor(days / 7) + ' sem';
        if (days < 365) return 'há ' + Math.floor(days / 30) + ' meses';
        return 'há ' + Math.floor(days / 365) + ' anos';
    }

    // ── CSS (injetado uma vez) ──────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('vocabModalStyles')) return;
        var css = '' +

        '.vocab-modal{position:fixed;inset:0;background:rgba(31,59,45,.45);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;animation:vocabFade .22s ease;}' +
        '.vocab-modal[hidden]{display:none;}' +
        '@keyframes vocabFade{from{opacity:0}to{opacity:1}}' +
        '@keyframes vocabPop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}' +
        '@keyframes vocabRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +

        /* Shell */
        '.vocab-shell{background:#fff;color:#1F3B2D;width:min(560px,100%);max-height:92vh;border-radius:20px;box-shadow:0 24px 70px rgba(31,59,45,.35);display:flex;flex-direction:column;font-family:"Space Grotesk",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;animation:vocabPop .3s cubic-bezier(.22,1,.36,1);overflow:hidden;}' +

        /* Header */
        '.vocab-head{position:relative;background:linear-gradient(135deg,#4A7058 0%,#3A5E47 55%,#2C4A37 100%);color:#fff;padding:24px 26px 20px;}' +
        '.vocab-head::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 92% -18%,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 42%);pointer-events:none;}' +
        '.vocab-head>*{position:relative;z-index:1;}' +
        '.vocab-eyebrow{font-family:"Manrope",sans-serif;font-size:.64rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.66);margin:0 0 6px;}' +
        '.vocab-title{font-family:"Manrope",sans-serif;font-weight:800;font-size:1.5rem;letter-spacing:-.02em;line-height:1.1;margin:0;}' +
        '.vocab-head-sub{font-size:.8rem;color:rgba(255,255,255,.75);margin-top:7px;max-width:40ch;line-height:1.45;}' +

        /* Resumo (3 métricas) */
        '.vocab-stats{display:flex;gap:10px;margin-top:18px;}' +
        '.vocab-stat{flex:1;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.14);border-radius:13px;padding:11px 13px;}' +
        '.vocab-stat-v{font-family:"Manrope",sans-serif;font-weight:800;font-size:1.4rem;letter-spacing:-.02em;line-height:1;font-variant-numeric:tabular-nums;}' +
        '.vocab-stat-k{font-size:.66rem;font-weight:600;letter-spacing:.03em;color:rgba(255,255,255,.72);margin-top:5px;text-transform:uppercase;}' +

        /* Fechar */
        '.vocab-close{position:absolute;top:12px;right:12px;appearance:none;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.14);border:none;color:#fff;font-size:1.05rem;line-height:1;cursor:pointer;display:grid;place-items:center;transition:background .15s ease,transform .15s ease;z-index:2;padding:0;}' +
        '.vocab-close:hover{background:rgba(255,255,255,.30);transform:scale(1.06);}' +
        '.vocab-close:active{transform:scale(.94);}' +
        '.vocab-close:focus-visible{outline:2px solid #fff;outline-offset:2px;}' +

        /* Toolbar: busca + filtros */
        '.vocab-tools{flex:none;padding:14px 26px 12px;border-bottom:1px solid #EDF3EE;background:#FBFDFB;}' +
        '.vocab-search{width:100%;box-sizing:border-box;border:1px solid #D8E4DA;border-radius:11px;padding:9px 13px;font-family:inherit;font-size:.85rem;color:#1F3B2D;background:#fff;transition:border-color .15s ease,box-shadow .15s ease;}' +
        '.vocab-search::placeholder{color:#A9B8AD;}' +
        '.vocab-search:focus{outline:none;border-color:#7A9E84;box-shadow:0 0 0 3px rgba(122,158,132,.18);}' +
        '.vocab-tabs{display:flex;gap:7px;margin-top:11px;}' +
        '.vocab-tab{appearance:none;border:1px solid #D8E4DA;background:#fff;color:#5A7E66;font-family:"Manrope",sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.01em;padding:6px 13px;border-radius:99px;cursor:pointer;transition:all .15s ease;display:inline-flex;align-items:center;gap:6px;}' +
        '.vocab-tab:hover{border-color:#7A9E84;color:#3A5E47;}' +
        '.vocab-tab.active{background:#3A5E47;border-color:#3A5E47;color:#fff;}' +
        '.vocab-tab .cnt{font-variant-numeric:tabular-nums;font-size:.68rem;opacity:.75;}' +
        '.vocab-tab.active .cnt{opacity:.85;}' +

        /* Corpo / lista */
        '.vocab-body{flex:1 1 auto;min-height:0;padding:8px 16px 14px;overflow-y:auto;background:#fff;}' +
        '.vocab-list{display:flex;flex-direction:column;}' +
        '.vocab-row{display:grid;grid-template-columns:26px 1fr auto;align-items:center;gap:12px;padding:11px 10px;border-radius:12px;animation:vocabRise .3s ease both;}' +
        '.vocab-row:nth-child(even){background:#F8FBF8;}' +
        '.vocab-rank{font-family:"Manrope",sans-serif;font-weight:800;font-size:.78rem;color:#B4C4B8;text-align:right;font-variant-numeric:tabular-nums;}' +
        '.vocab-main{min-width:0;}' +
        '.vocab-word-row{display:flex;align-items:center;gap:8px;}' +
        '.vocab-word{font-family:"Manrope",sans-serif;font-weight:700;font-size:.98rem;color:#1F3B2D;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
        '.vocab-badge{flex:none;font-size:.58rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:2px 7px;border-radius:99px;font-family:"Manrope",sans-serif;}' +
        '.vocab-badge.is-dominada{background:#DFF0E2;color:#2E6B3E;}' +
        '.vocab-badge.is-progresso{background:#FBF3E2;color:#9A742B;}' +
        '.vocab-meta{display:flex;align-items:center;gap:8px;margin-top:4px;font-size:.7rem;color:#8FA396;}' +
        '.vocab-meta .dot{width:3px;height:3px;border-radius:50%;background:#C7D4C9;flex:none;}' +
        '.vocab-err{color:#B07A3C;font-weight:600;}' +
        '.vocab-right{text-align:right;flex:none;min-width:74px;}' +
        '.vocab-acc{font-family:"Manrope",sans-serif;font-weight:800;font-size:1.02rem;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1;}' +
        '.vocab-acc.high{color:#2E6B3E;}.vocab-acc.mid{color:#9A742B;}.vocab-acc.low{color:#B4552F;}' +
        '.vocab-accbar{margin-top:5px;height:4px;width:74px;border-radius:99px;background:#EAF1EB;overflow:hidden;margin-left:auto;}' +
        '.vocab-accbar>i{display:block;height:100%;border-radius:99px;transition:width .7s cubic-bezier(.22,1,.36,1);}' +
        '.vocab-accbar>i.high{background:linear-gradient(90deg,#7A9E84,#2E6B3E);}' +
        '.vocab-accbar>i.mid{background:linear-gradient(90deg,#E0C583,#B08A3C);}' +
        '.vocab-accbar>i.low{background:linear-gradient(90deg,#E0A183,#B4552F);}' +
        '.vocab-uses{font-size:.66rem;color:#A9B8AD;margin-top:4px;font-variant-numeric:tabular-nums;}' +

        /* Estados */
        '.vocab-state{padding:48px 26px;text-align:center;color:#8FA396;}' +
        '.vocab-state-ico{font-size:2rem;margin-bottom:10px;opacity:.8;}' +
        '.vocab-state-t{font-family:"Manrope",sans-serif;font-weight:700;font-size:.95rem;color:#5A7E66;margin-bottom:5px;}' +
        '.vocab-state-s{font-size:.8rem;line-height:1.5;max-width:34ch;margin:0 auto;}' +
        '.vocab-spinner{width:26px;height:26px;border-radius:50%;border:3px solid #E3EDE4;border-top-color:#3A5E47;margin:0 auto 14px;animation:vocabSpin .7s linear infinite;}' +
        '@keyframes vocabSpin{to{transform:rotate(360deg)}}' +

        /* Rodapé */
        '.vocab-foot{flex:none;padding:12px 26px 16px;border-top:1px solid #EDF3EE;background:#FBFDFB;font-size:.69rem;color:#8FA396;line-height:1.5;}' +
        '.vocab-foot b{color:#5A7E66;font-weight:700;}' +

        /* Card da home: affordance de clique */
        '#sideVocab{cursor:pointer;position:relative;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease;}' +
        '#sideVocab::after{content:"›";position:absolute;top:12px;right:16px;font-size:1.05rem;font-weight:700;color:#A9B8AD;transition:transform .15s ease,color .15s ease;}' +
        '#sideVocab:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(58,94,71,.14);border-color:#B5CDB0;}' +
        '#sideVocab:hover::after{transform:translateX(3px);color:#3A5E47;}' +
        '#sideVocab:focus-visible{outline:2px solid #7A9E84;outline-offset:3px;}' +

        '@media (max-width:480px){' +
          '.vocab-head{padding:20px 20px 16px;}' +
          '.vocab-tools{padding:12px 18px 10px;}' +
          '.vocab-body{padding:6px 8px 12px;}' +
          '.vocab-foot{padding:10px 18px 14px;}' +
          '.vocab-title{font-size:1.28rem;}' +
          '.vocab-stat-v{font-size:1.2rem;}' +
          '.vocab-right{min-width:64px;}.vocab-accbar{width:64px;}' +
        '}' +

        '@media (prefers-reduced-motion:reduce){' +
          '.vocab-modal,.vocab-shell,.vocab-row{animation:none;}' +
          '.vocab-accbar>i,#sideVocab{transition:none;}' +
          '.vocab-spinner{animation-duration:1.4s;}' +
        '}';

        var style = document.createElement('style');
        style.id = 'vocabModalStyles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ── Markup (injetado uma vez) ───────────────────────────────────────────
    function ensureModal() {
        var existing = document.getElementById('vocabModal');
        if (existing) return existing;

        var overlay = document.createElement('div');
        overlay.className = 'vocab-modal';
        overlay.id = 'vocabModal';
        overlay.hidden = true;
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'vocabModalTitle');
        overlay.innerHTML =
            '<div class="vocab-shell">' +
              '<div class="vocab-head">' +
                '<button type="button" class="vocab-close" id="vocabModalClose" aria-label="Fechar">✕</button>' +
                '<p class="vocab-eyebrow">Seu vocabulário de voz</p>' +
                '<h2 class="vocab-title" id="vocabModalTitle">Palavras que você já falou</h2>' +
                '<p class="vocab-head-sub">Tudo que passou pelo chat de voz — quanto usou e como está sua pronúncia em cada uma.</p>' +
                '<div class="vocab-stats" id="vocabModalStats"></div>' +
              '</div>' +
              '<div class="vocab-tools">' +
                '<input type="search" class="vocab-search" id="vocabModalSearch" placeholder="Buscar palavra…" autocomplete="off" spellcheck="false" aria-label="Buscar palavra">' +
                '<div class="vocab-tabs" id="vocabModalTabs" role="tablist"></div>' +
              '</div>' +
              '<div class="vocab-body" id="vocabModalBody"></div>' +
              '<div class="vocab-foot">' +
                'Uma palavra vira <b>dominada</b> com <b>85%+ de acerto</b> e <b>5+ usos</b> na voz — e não sai mais daqui. ' +
                'A acurácia continua sendo medida para sugerir reforço.' +
              '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        overlay.querySelector('#vocabModalClose').addEventListener('click', function (e) {
            e.stopPropagation();
            closeModal();
        });
        overlay.addEventListener('click', function (e) {
            if (!e.target.closest('.vocab-shell')) closeModal();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !overlay.hidden) closeModal();
        });

        var search = overlay.querySelector('#vocabModalSearch');
        search.addEventListener('input', function () {
            _query = this.value.trim().toLowerCase();
            renderBody();
        });
        search.addEventListener('click', function (e) { e.stopPropagation(); });

        return overlay;
    }

    // ── Render: cabeçalho de métricas ───────────────────────────────────────
    function renderStats() {
        var el = document.getElementById('vocabModalStats');
        if (!el || !_data) return;
        var words = _data.words || [];
        var mastered = _data.total_mastered != null
            ? _data.total_mastered
            : words.filter(function (w) { return w.mastered; }).length;
        var totalUses = words.reduce(function (s, w) { return s + (w.uses || 0); }, 0);
        // Acurácia média ponderada pelo nº de usos — reflete a experiência real.
        var totalCorrect = words.reduce(function (s, w) { return s + (w.correct_uses || 0); }, 0);
        var avgAcc = totalUses ? Math.round((totalCorrect / totalUses) * 100) : 0;

        el.innerHTML =
            '<div class="vocab-stat"><div class="vocab-stat-v">' + fmt(mastered) + '</div><div class="vocab-stat-k">Dominadas</div></div>' +
            '<div class="vocab-stat"><div class="vocab-stat-v">' + fmt(words.length) + '</div><div class="vocab-stat-k">Praticadas</div></div>' +
            '<div class="vocab-stat"><div class="vocab-stat-v">' + avgAcc + '%</div><div class="vocab-stat-k">Acurácia média</div></div>';
    }

    // ── Render: abas de filtro ──────────────────────────────────────────────
    function renderTabs() {
        var el = document.getElementById('vocabModalTabs');
        if (!el || !_data) return;
        var words = _data.words || [];
        var counts = {
            all: words.length,
            dominada: words.filter(function (w) { return w.mastered; }).length,
            em_progresso: words.filter(function (w) { return !w.mastered; }).length
        };
        var tabs = [
            { key: 'all', label: 'Todas' },
            { key: 'dominada', label: 'Dominadas' },
            { key: 'em_progresso', label: 'Em progresso' }
        ];
        el.innerHTML = tabs.map(function (t) {
            return '<button type="button" role="tab" class="vocab-tab' + (_filter === t.key ? ' active' : '') +
                '" data-filter="' + t.key + '" aria-selected="' + (_filter === t.key) + '">' +
                t.label + '<span class="cnt">' + counts[t.key] + '</span></button>';
        }).join('');
        el.querySelectorAll('.vocab-tab').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                _filter = this.getAttribute('data-filter');
                renderTabs();
                renderBody();
            });
        });
    }

    // ── Render: lista ───────────────────────────────────────────────────────
    function filteredWords() {
        var words = (_data && _data.words) || [];
        return words.filter(function (w) {
            if (_filter === 'dominada' && !w.mastered) return false;
            if (_filter === 'em_progresso' && w.mastered) return false;
            if (_query && String(w.word || '').toLowerCase().indexOf(_query) === -1) return false;
            return true;
        });
    }

    function rowHtml(w, rank) {
        var acc = w.accuracy != null ? w.accuracy : 0;
        var tone = accTone(acc);
        var badge = w.mastered
            ? '<span class="vocab-badge is-dominada">Dominada</span>'
            : '<span class="vocab-badge is-progresso">Em progresso</span>';
        var meta = [];
        if (w.last_seen) meta.push(esc(relTime(w.last_seen)));
        if (!w.mastered && w.last_error_label) {
            meta.push('<span class="vocab-err">tropeço: ' + esc(w.last_error_label) + '</span>');
        }
        var metaHtml = meta.length
            ? '<div class="vocab-meta">' + meta.map(function (m, i) {
                  return (i ? '<span class="dot"></span>' : '') + '<span>' + m + '</span>';
              }).join('') + '</div>'
            : '';
        var usesLabel = (w.uses || 0) + (w.uses === 1 ? ' uso' : ' usos');
        return '' +
        '<div class="vocab-row" style="animation-delay:' + Math.min(rank * 18, 400) + 'ms">' +
          '<div class="vocab-rank">' + rank + '</div>' +
          '<div class="vocab-main">' +
            '<div class="vocab-word-row"><span class="vocab-word">' + esc(w.word) + '</span>' + badge + '</div>' +
            metaHtml +
          '</div>' +
          '<div class="vocab-right">' +
            '<div class="vocab-acc ' + tone + '">' + acc + '%</div>' +
            '<div class="vocab-accbar"><i class="' + tone + '" style="width:' + acc + '%"></i></div>' +
            '<div class="vocab-uses">' + usesLabel + '</div>' +
          '</div>' +
        '</div>';
    }

    function stateHtml(ico, title, sub) {
        return '<div class="vocab-state">' +
            '<div class="vocab-state-ico">' + ico + '</div>' +
            '<div class="vocab-state-t">' + esc(title) + '</div>' +
            '<div class="vocab-state-s">' + esc(sub) + '</div></div>';
    }

    function renderBody() {
        var body = document.getElementById('vocabModalBody');
        if (!body) return;

        if (_loading) {
            body.innerHTML = '<div class="vocab-state"><div class="vocab-spinner"></div>' +
                '<div class="vocab-state-s">Carregando seu vocabulário…</div></div>';
            return;
        }
        if (!_data) {
            body.innerHTML = stateHtml('📡', 'Não deu para carregar', 'Tente abrir de novo em instantes.');
            return;
        }

        var words = _data.words || [];
        if (!words.length) {
            body.innerHTML = stateHtml('🎙️', 'Nenhuma palavra ainda',
                'Faça uma sessão no chat de voz — as palavras que você falar aparecem aqui com sua acurácia.');
            return;
        }

        var list = filteredWords();
        if (!list.length) {
            var msg = _query
                ? 'Nenhuma palavra combina com a busca.'
                : (_filter === 'dominada'
                    ? 'Você ainda não dominou nenhuma palavra. Fale 5+ vezes com 85%+ de acerto.'
                    : 'Nenhuma palavra em progresso — tudo dominado por aqui! 🎉');
            body.innerHTML = stateHtml('🔍', 'Nada para mostrar', msg);
            return;
        }

        body.innerHTML = '<div class="vocab-list">' +
            list.map(function (w, i) { return rowHtml(w, i + 1); }).join('') +
        '</div>';
    }

    function renderAll() {
        renderStats();
        renderTabs();
        renderBody();
    }

    // ── Fetch ───────────────────────────────────────────────────────────────
    function apiBase() {
        return (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : '';
    }

    function loadVocabulary() {
        _loading = true;
        renderBody();
        var token = (window.authToken) || sessionStorage.getItem('grilo_token');
        var url = apiBase() + '/api/voice/vocabulary';
        console.log('[VOCAB-MODAL] fetching', url, '| token?', !!token);
        fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(function (resp) {
            console.log('[VOCAB-MODAL] response status', resp.status);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.json();
        })
        .then(function (data) {
            console.log('[VOCAB-MODAL] words received:', (data && data.words ? data.words.length : 0), data);
            _data = data || { words: [] };
            _loading = false;
            renderAll();
        })
        .catch(function (err) {
            console.warn('[VOCAB-MODAL] fetch failed:', err.message);
            _loading = false;
            _data = null;
            renderBody();
        });
    }

    // ── Abrir / fechar ──────────────────────────────────────────────────────
    function openModal() {
        console.log('[VOCAB-MODAL] openModal() chamado — abrindo modal');
        injectStyles();
        var overlay = ensureModal();
        _filter = 'all';
        _query = '';
        var search = overlay.querySelector('#vocabModalSearch');
        if (search) search.value = '';
        _lastFocus = document.activeElement;
        overlay.hidden = false;
        var closeBtn = overlay.querySelector('#vocabModalClose');
        if (closeBtn) closeBtn.focus();
        loadVocabulary();
    }

    function closeModal() {
        var overlay = document.getElementById('vocabModal');
        if (overlay) overlay.hidden = true;
        if (_lastFocus && typeof _lastFocus.focus === 'function') _lastFocus.focus();
    }

    // ── Ligar o card #sideVocab ─────────────────────────────────────────────
    function bindCard() {
        var card = document.getElementById('sideVocab');
        if (!card || card.__vocabBound) return;
        card.__vocabBound = true;
        console.log('[VOCAB-MODAL] card #sideVocab ligado (clique habilitado)');
        injectStyles();

        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-haspopup', 'dialog');
        card.setAttribute('aria-label', 'Ver todas as palavras praticadas na voz');

        card.addEventListener('click', openModal);
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal();
            }
        });
    }

    // O card só existe depois que o painel de progresso monta; tentamos algumas vezes.
    function boot() {
        bindCard();
        if ((document.getElementById('sideVocab') || {}).__vocabBound) return;
        var tries = 0;
        var iv = setInterval(function () {
            bindCard();
            tries++;
            if (tries > 40 || (document.getElementById('sideVocab') || {}).__vocabBound) clearInterval(iv);
        }, 300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    // Exports (debug / chamadas externas)
    window.openVocabModal = openModal;
    window.closeVocabModal = closeModal;
})();
