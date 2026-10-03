/* ============================================================
 *  Ditação — ENGINE
 *  ============================================================
 *  Ouça uma frase (TTS) e digite exatamente o que ouviu.
 *  Fluxo: hub → intro da faixa → frase a frase → resultado.
 *
 *  Andaime gramatical (blocks[] de dictation-data.js) acima do
 *  campo: mostra a categoria de cada pedaço e revela ao vivo as
 *  palavras já digitadas certo.
 *
 *  Avaliação: GriloVR.wordAlign só ALINHA; cada par é julgado de
 *  forma estrita aqui (wordMatches aceita homófonos/morfologia,
 *  o que é certo pra fala mas frouxo demais pra escrita).
 *
 *  Combo: frase perfeita sem dica → +1; qualquer outra → 0.
 *  Multiplicador de pontos é só visual; XP real vem do backend.
 * ============================================================ */
(function () {
  'use strict';

  const LS_KEY = 'grilo_dictation_progress_v1';
  const LS_SCAFFOLD = 'grilo_dictation_scaffold_v1';
  const NORMAL_RATE = 0.92;
  const SLOW_RATE = 0.7;

  // ─── Estado / storage ─────────────────────────────────────────
  function loadProgress() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : { tracks: {}, streakDate: null };
    } catch (e) { return { tracks: {}, streakDate: null }; }
  }

  function saveProgress(p) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch (e) {}
  }

  let PROGRESS = loadProgress();

  function trackState(slug) {
    return PROGRESS.tracks[slug] || { bestScore: 0, attempts: 0, done: false };
  }

  function setTrackState(slug, patch) {
    PROGRESS.tracks[slug] = Object.assign({}, trackState(slug), patch);
    saveProgress(PROGRESS);
  }

  function isUnlocked(track, order) {
    const i = order.indexOf(track);
    return i <= 0 || !!trackState(order[i - 1].slug).done;
  }

  function markDailyDone() {
    const today = new Date().toISOString().slice(0, 10);
    if (PROGRESS.streakDate === today) return;
    PROGRESS.streakDate = today;
    saveProgress(PROGRESS);
    try {
      if (window.GriloStreak && typeof window.GriloStreak.markToday === 'function') {
        window.GriloStreak.markToday('dictation');
      }
    } catch (e) {}
  }

  function scaffoldOn() {
    try { return localStorage.getItem(LS_SCAFFOLD) !== '0'; } catch (e) { return true; }
  }

  function setScaffoldOn(on) {
    try { localStorage.setItem(LS_SCAFFOLD, on ? '1' : '0'); } catch (e) {}
  }

  // ─── Utilidades ────────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function fmtTime(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function comboMultiplier(combo) {
    return 1 + Math.min(0.5, Math.floor(combo / 3) * 0.1);
  }

  function speak(text, rate) {
    const btn = document.getElementById('dtPlay');
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = rate || NORMAL_RATE;
      u.onend = u.onerror = function () { if (btn) btn.classList.remove('is-playing'); };
      if (btn) btn.classList.add('is-playing');
      window.speechSynthesis.speak(u);
    } catch (e) {
      if (btn) btn.classList.remove('is-playing');
    }
  }

  // ─── Avaliação ─────────────────────────────────────────────────
  function judgeSentence(typed, expected) {
    const vr = window.GriloVR;
    const exp = vr.tokenize(expected);
    const got = vr.tokenize(String(typed || '').replace(/[’‘`´]/g, "'"));
    const matched = vr.wordAlign(exp, got).matched;
    const states = exp.map(function (w, i) {
      if (matched[i] < 0) return 'miss';
      const g = got[matched[i]];
      if (g === w) return 'ok';
      return vr.editDistance(g, w) <= 1 ? 'almost' : 'miss';
    });
    const used = new Set(matched.filter(j => j >= 0));
    const extras = got.filter((_, j) => !used.has(j));
    const ok = states.filter(s => s === 'ok').length;
    const almost = states.filter(s => s === 'almost').length;
    const score = exp.length ? Math.round(((ok + 0.5 * almost) / exp.length) * 100) : 0;
    const perfect = ok === exp.length && got.length === exp.length;
    return { exp, got, matched, states, extras, score, perfect };
  }

  // ============================================================
  //  HUB
  // ============================================================
  function renderHub() {
    const order = window.GriloDictation.getTrackOrder();
    const root = document.getElementById('dtHubBody');
    if (!root) return;

    const doneCount = order.filter(t => trackState(t.slug).done).length;
    const ringFill = document.getElementById('dtRingFill');
    if (ringFill) ringFill.style.strokeDashoffset = String(251 - 251 * (order.length ? doneCount / order.length : 0));
    const ringNum = document.getElementById('dtRingNum');
    if (ringNum) ringNum.textContent = String(doneCount);
    const ringHint = document.getElementById('dtRingHint');
    if (ringHint) ringHint.textContent = 'de ' + order.length + ' disponíveis';

    const daily = order.find(t => !trackState(t.slug).done) || order[0];
    const dailyEl = document.getElementById('dtDailyTrack');
    if (dailyEl && daily) {
      dailyEl.querySelector('b').textContent = daily.title;
      dailyEl.dataset.slug = daily.slug;
    }

    root.innerHTML = order.map(function (t, i) {
      const st = trackState(t.slug);
      const state = st.done ? 'done' : (isUnlocked(t, order) ? 'available' : 'locked');
      const scoreHtml = st.bestScore > 0
        ? `<div class="shadow-track-score">melhor<b>${st.bestScore}</b></div>`
        : (state === 'locked'
            ? `<div class="shadow-track-lock-ico">🔒</div>`
            : `<div class="shadow-track-score" style="color:var(--sh-text-light)">novo</div>`);
      return `
        <div class="shadow-track-card" data-state="${state}" data-slug="${t.slug}">
          <div class="shadow-track-num">${st.done ? '✓' : String(i + 1).padStart(2, '0')}</div>
          <div class="shadow-track-info">
            <p class="shadow-track-title">${escapeHtml(t.title)}</p>
            <div class="shadow-track-meta"><span class="shadow-track-badge is-ranked">${t.level}</span><span>${t.sentences.length} frases</span><span>·</span><span>${escapeHtml(t.theme)}</span></div>
          </div>
          ${scoreHtml}
        </div>`;
    }).join('');

    root.querySelectorAll('.shadow-track-card[data-state="available"], .shadow-track-card[data-state="done"]').forEach(function (card) {
      card.addEventListener('click', () => openTrack(card.dataset.slug));
    });
  }

  // ============================================================
  //  PLAYER
  // ============================================================
  let P = null;

  function openTrack(slug) {
    const track = window.GriloDictation.getTrackBySlug(slug);
    if (!track) return;
    P = { track, phase: 'intro' };
    const overlay = document.getElementById('dtPlayerOverlay');
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="shadow-player-card">
        <div class="shadow-player-head">
          <span class="shadow-player-mode dt-mode-tag">✎ Ditação · ${escapeHtml(track.level)}</span>
          <button class="shadow-player-close" id="dtPlayerClose" aria-label="Fechar">✕</button>
        </div>
        <div class="shadow-player-body" id="dtPlayerBody"></div>
      </div>`;
    document.getElementById('dtPlayerClose').addEventListener('click', closePlayer);
    renderIntro();
  }

  function stopTimer() {
    if (P && P.timer) { clearInterval(P.timer); P.timer = null; }
  }

  function closePlayer() {
    stopTimer();
    try { window.speechSynthesis.cancel(); } catch (e) {}
    P = null;
    document.getElementById('dtPlayerOverlay').hidden = true;
    renderHub();
  }

  // ─── Intro da faixa ────────────────────────────────────────────
  function renderIntro() {
    P.phase = 'intro';
    const t = P.track;
    const body = document.getElementById('dtPlayerBody');
    body.innerHTML = `
      <div class="dt-intro">
        <p class="dt-intro-kicker">${escapeHtml(t.theme)}</p>
        <h2 class="dt-intro-title">${escapeHtml(t.title)}</h2>
        <p class="dt-intro-sub">${t.sentences.length} frases. Ouça cada uma e digite exatamente o que ouviu. Os blocos coloridos mostram a estrutura da frase. Faça ${t.minScoreToUnlock} pontos ou mais para liberar a próxima faixa.</p>
        <ul class="dt-keys">
          <li><kbd>Enter</kbd> verificar / avançar</li>
          <li><kbd>Ctrl</kbd>+<kbd>Espaço</kbd> ouvir de novo</li>
          <li><kbd>Ctrl</kbd>+<kbd>H</kbd> dica (a frase sai do combo)</li>
        </ul>
        <button class="shadow-play-btn" id="dtStart">▶ Começar</button>
      </div>`;
    const start = document.getElementById('dtStart');
    start.addEventListener('click', startSession);
    start.focus();
  }

  function startSession() {
    stopTimer();
    Object.assign(P, {
      idx: 0,
      results: [],
      combo: 0,
      comboMax: 0,
      points: 0,
      startedAt: Date.now(),
    });
    P.timer = setInterval(function () {
      const el = document.getElementById('dtTime');
      if (el && P) el.textContent = fmtTime(Date.now() - P.startedAt);
    }, 1000);
    renderSentence();
  }

  // ─── Sessão: uma frase ─────────────────────────────────────────
  function scaffoldHtml(sentence) {
    let gi = 0;
    return sentence.blocks.map(function (b) {
      const slots = b.words.map(function (w) {
        return `<span class="dt-slot" data-i="${gi++}">${escapeHtml(w)}</span>`;
      }).join('');
      return `<div class="dt-block" data-tag="${b.tag}"><span class="dt-block-label">${escapeHtml(b.label)}</span><span class="dt-block-slots">${slots}</span></div>`;
    }).join('');
  }

  function hudHtml() {
    return `
      <div class="dt-hud">
        <span class="dt-hud-item" title="Tempo de prática">⏱ <b id="dtTime">${fmtTime(Date.now() - P.startedAt)}</b></span>
        <span class="dt-hud-item" title="Pontos">⭐ <b id="dtPoints">${P.points}</b></span>
        <span class="dt-hud-item dt-combo ${P.combo >= 2 ? 'is-hot' : ''}" id="dtCombo" title="Frases perfeitas seguidas">🔥 <b>${P.combo}</b>${P.combo >= 3 ? ` <small>×${comboMultiplier(P.combo).toFixed(1)}</small>` : ''}</span>
      </div>`;
  }

  function renderSentence() {
    P.phase = 'typing';
    const sent = P.track.sentences[P.idx];
    P.cur = { hinted: false, hintIdx: new Set() };
    const total = P.track.sentences.length;
    const showScaffold = scaffoldOn();

    const body = document.getElementById('dtPlayerBody');
    body.innerHTML = `
      ${hudHtml()}
      <div class="shadow-progressbar"><div class="shadow-progressbar-fill" style="width:${(P.idx / total) * 100}%"></div></div>
      <p class="dt-counter">Frase ${P.idx + 1} de ${total}</p>

      <div class="dt-audio-row">
        <button class="dt-audio" id="dtPlay" type="button" aria-label="Ouvir a frase">
          <span class="dt-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
          <span>Ouvir de novo</span>
        </button>
        <button class="dt-audio-slow" id="dtPlaySlow" type="button">🐢 Devagar</button>
      </div>

      <div class="dt-scaffold-wrap">
        <button class="dt-scaffold-toggle" id="dtScaffoldToggle" type="button" aria-pressed="${showScaffold}">🧩 Estrutura ${showScaffold ? 'ligada' : 'desligada'}</button>
        <div class="dt-scaffold ${showScaffold ? '' : 'is-hidden'}" id="dtScaffold">${scaffoldHtml(sent)}</div>
      </div>

      <input class="dt-input" id="dtInput" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Digite o que você ouviu…" aria-label="Digite a frase que você ouviu">
      <p class="dt-hint-line" id="dtHintLine" hidden></p>
      <div id="dtFeedback"></div>

      <div class="dt-controls" id="dtControls">
        <button class="shadow-ghost-btn" id="dtHint" type="button">💡 Dica</button>
        <button class="shadow-play-btn" id="dtCheck" type="button">Verificar</button>
      </div>`;

    document.getElementById('dtPlay').addEventListener('click', () => speak(sent.en, NORMAL_RATE));
    document.getElementById('dtPlaySlow').addEventListener('click', () => speak(sent.en, SLOW_RATE));
    document.getElementById('dtScaffoldToggle').addEventListener('click', toggleScaffold);
    document.getElementById('dtHint').addEventListener('click', giveHint);
    document.getElementById('dtCheck').addEventListener('click', checkSentence);
    const input = document.getElementById('dtInput');
    input.addEventListener('input', paintLiveScaffold);
    input.focus();

    speak(sent.en, NORMAL_RATE);
  }

  function toggleScaffold() {
    const on = !scaffoldOn();
    setScaffoldOn(on);
    const row = document.getElementById('dtScaffold');
    const btn = document.getElementById('dtScaffoldToggle');
    if (row) row.classList.toggle('is-hidden', !on);
    if (btn) {
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = '🧩 Estrutura ' + (on ? 'ligada' : 'desligada');
    }
    const input = document.getElementById('dtInput');
    if (input && P && P.phase === 'typing') input.focus();
  }

  function slotEls() {
    return Array.from(document.querySelectorAll('#dtScaffold .dt-slot'));
  }

  function paintLiveScaffold() {
    if (!P || P.phase !== 'typing') return;
    const input = document.getElementById('dtInput');
    const r = judgeSentence(input.value, P.track.sentences[P.idx].en);
    slotEls().forEach(function (el, i) {
      const ok = r.states[i] === 'ok';
      el.classList.toggle('is-ok', ok);
      el.classList.toggle('is-hint', !ok && P.cur.hintIdx.has(i));
    });
  }

  function giveHint() {
    if (!P || P.phase !== 'typing') return;
    const sent = P.track.sentences[P.idx];
    const input = document.getElementById('dtInput');
    const r = judgeSentence(input.value, sent.en);
    const next = r.states.findIndex((s, i) => s !== 'ok' && !P.cur.hintIdx.has(i));
    if (next < 0) { input.focus(); return; }
    P.cur.hinted = true;
    P.cur.hintIdx.add(next);
    const word = sent.en.split(/\s+/)[next];
    const line = document.getElementById('dtHintLine');
    line.hidden = false;
    line.innerHTML = `💡 Palavra ${next + 1}: <b>${escapeHtml(word)}</b> <span>· esta frase não conta pro combo</span>`;
    paintLiveScaffold();
    input.focus();
  }

  function checkSentence() {
    if (!P || P.phase !== 'typing') return;
    const sent = P.track.sentences[P.idx];
    const input = document.getElementById('dtInput');
    if (!input.value.trim()) {
      input.classList.remove('is-shake');
      void input.offsetWidth;
      input.classList.add('is-shake');
      input.focus();
      return;
    }

    P.phase = 'checked';
    const r = judgeSentence(input.value, sent.en);
    const clean = r.perfect && !P.cur.hinted;
    P.combo = clean ? P.combo + 1 : 0;
    P.comboMax = Math.max(P.comboMax, P.combo);
    P.points += Math.round(r.score * comboMultiplier(P.combo));
    P.results[P.idx] = Object.assign({ hinted: P.cur.hinted, clean }, r);

    input.readOnly = true;
    input.classList.add(r.perfect ? 'is-pass' : 'is-fail');

    slotEls().forEach(function (el, i) {
      el.classList.remove('is-ok', 'is-hint');
      el.classList.add('is-' + r.states[i], 'is-final');
    });

    const display = sent.en.split(/\s+/);
    const chips = display.map(function (w, i) {
      const st = r.states[i];
      if (st !== 'ok' && r.matched[i] >= 0) {
        const typed = escapeHtml(r.got[r.matched[i]]);
        return `<span class="dt-wchip is-${st}" title="Você digitou: ${typed}"><s>${typed}</s> ${escapeHtml(w)}</span>`;
      }
      return `<span class="dt-wchip is-${st}">${escapeHtml(w)}</span>`;
    }).join('');

    let verdict, tone;
    if (clean) {
      tone = 'good';
      verdict = P.combo >= 2 ? `✓ Perfeito! Combo de ${P.combo} 🔥` : '✓ Perfeito!';
    } else if (r.perfect) {
      tone = 'good';
      verdict = '✓ Certo, mas com dica. O combo zerou.';
    } else if (r.score >= 70) {
      tone = 'warn';
      verdict = 'Quase lá. Confira as palavras marcadas.';
    } else {
      tone = 'bad';
      verdict = 'Essa foi difícil. Ouça de novo e compare com a frase.';
    }

    const last = P.idx === P.track.sentences.length - 1;
    document.getElementById('dtHintLine').hidden = true;
    document.getElementById('dtFeedback').innerHTML = `
      <div class="dt-verdict is-${tone}">${verdict}</div>
      <div class="dt-chips">${chips}</div>
      ${r.extras.length ? `<p class="dt-extras">Sobrou: ${r.extras.map(w => `<s>${escapeHtml(w)}</s>`).join(' ')}</p>` : ''}
      <p class="dt-pt"><b>Tradução</b>${escapeHtml(sent.pt)}</p>`;

    const controls = document.getElementById('dtControls');
    controls.innerHTML = `<button class="shadow-play-btn" id="dtNext" type="button">${last ? 'Ver resultado' : 'Próxima frase →'}</button>`;
    const nextBtn = document.getElementById('dtNext');
    nextBtn.addEventListener('click', nextSentence);
    nextBtn.focus();

    const hud = document.querySelector('.dt-hud');
    if (hud) hud.outerHTML = hudHtml();
    if (clean && P.combo >= 2) {
      const c = document.getElementById('dtCombo');
      if (c) c.classList.add('is-bump');
    }
  }

  function nextSentence() {
    if (!P || P.phase !== 'checked') return;
    if (P.idx < P.track.sentences.length - 1) {
      P.idx++;
      renderSentence();
    } else {
      finishSession();
    }
  }

  // ─── Resultado ─────────────────────────────────────────────────
  function finishSession() {
    stopTimer();
    try { window.speechSynthesis.cancel(); } catch (e) {}
    P.phase = 'result';
    const t = P.track;
    const elapsed = Date.now() - P.startedAt;
    const score = Math.round(P.results.reduce((s, r) => s + r.score, 0) / t.sentences.length);

    const order = window.GriloDictation.getTrackOrder();
    const st = trackState(t.slug);
    const passed = score >= t.minScoreToUnlock;
    const isNewRecord = score > st.bestScore;
    const hasNext = order.indexOf(t) < order.length - 1;
    const unlocked = passed && !st.done && hasNext;
    setTrackState(t.slug, {
      bestScore: Math.max(st.bestScore, score),
      attempts: st.attempts + 1,
      done: st.done || passed,
    });
    markDailyDone();

    const perfectCount = P.results.filter(r => r.clean).length;
    const recap = t.sentences.map(function (s, si) {
      const r = P.results[si];
      const words = s.en.split(/\s+/).map((w, i) => `<span class="dt-wchip is-${r.states[i]}">${escapeHtml(w)}</span>`).join('');
      return `<div class="dt-recap-line">${r.clean ? '<span class="dt-recap-star" title="Perfeita">★</span>' : '<span class="dt-recap-star is-empty"></span>'}<div class="dt-chips">${words}</div></div>`;
    }).join('');

    const body = document.getElementById('dtPlayerBody');
    body.innerHTML = `
      <div class="shadow-result-head">
        <div class="shadow-result-score ${score < 60 ? 'is-low' : ''}"><b>${score}</b></div>
        ${isNewRecord ? `<div class="shadow-result-record">🏆 novo recorde!</div>` : ''}
        ${unlocked ? `<p class="dt-result-unlock">✅ Próxima faixa liberada!</p>` : ''}
        ${!passed ? `<p class="dt-result-hint">Faça ${t.minScoreToUnlock} pontos para concluir esta faixa.</p>` : ''}
      </div>
      <div class="shadow-loot dt-loot">
        <div class="shadow-loot-item"><b id="dtXp">…</b><span>XP</span></div>
        <div class="shadow-loot-item"><b>${P.comboMax}</b><span>maior combo</span></div>
        <div class="shadow-loot-item"><b>${perfectCount}/${t.sentences.length}</b><span>perfeitas</span></div>
        <div class="shadow-loot-item"><b>${fmtTime(elapsed)}</b><span>tempo</span></div>
      </div>
      <p class="shadow-recap-title">Suas frases</p>
      <div class="dt-recap">${recap}</div>
      <div class="shadow-result-actions">
        <button class="shadow-play-btn" id="dtRetry">🔁 repetir faixa</button>
        <button class="shadow-ghost-btn" id="dtBack">← voltar à trilha</button>
      </div>`;

    document.getElementById('dtRetry').addEventListener('click', startSession);
    document.getElementById('dtBack').addEventListener('click', closePlayer);

    syncToBackend(t, P.results, score, P.comboMax, unlocked);
  }

  function getAuthToken() {
    try { return sessionStorage.getItem('grilo_token'); } catch (e) { return null; }
  }

  function setXpLabel(text) {
    const el = document.getElementById('dtXp');
    if (el) el.textContent = text;
  }

  function syncToBackend(track, results, score, comboMax, unlockedNext) {
    const token = getAuthToken();
    if (!token) { setXpLabel('—'); return; }

    const words = [];
    const sentences = [];
    track.sentences.forEach(function (s, si) {
      const r = results[si];
      r.exp.forEach((w, i) => words.push({ word: w, correct: r.states[i] === 'ok' }));
      sentences.push({ index: si, en: s.en, all_correct: r.clean });
    });

    fetch(`/api/dictation/tracks/${encodeURIComponent(track.slug)}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ score, words, sentences, combo_max: comboMax, unlocked_next: !!unlockedNext }),
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (res) {
      setXpLabel('+' + (res.xp_earned || 0));
    }).catch(function (err) {
      setXpLabel('—');
      console.warn('[DICTATION] sync falhou (progresso local preservado):', err.message);
    });
  }

  // ─── Teclado ───────────────────────────────────────────────────
  function onKeyDown(e) {
    if (!P) return;
    const inSession = P.phase === 'typing' || P.phase === 'checked';
    if (inSession && e.ctrlKey && (e.code === 'Space' || e.key === ' ')) {
      e.preventDefault();
      speak(P.track.sentences[P.idx].en, NORMAL_RATE);
      return;
    }
    if (P.phase === 'typing' && e.ctrlKey && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      giveHint();
      return;
    }
    if (e.key === 'Enter' && !e.isComposing && e.target.tagName !== 'BUTTON') {
      if (P.phase === 'typing') { e.preventDefault(); checkSentence(); }
      else if (P.phase === 'checked') { e.preventDefault(); nextSentence(); }
    }
  }

  // ─── Modal "Como funciona" ─────────────────────────────────────
  function setHowOpen(open) {
    const modal = document.getElementById('dtHowModal');
    if (modal) modal.hidden = !open;
  }

  function init() {
    renderHub();
    const dailyEl = document.getElementById('dtDailyTrack');
    if (dailyEl) {
      const openDaily = () => { if (dailyEl.dataset.slug) openTrack(dailyEl.dataset.slug); };
      dailyEl.addEventListener('click', openDaily);
      dailyEl.addEventListener('keydown', e => { if (e.key === 'Enter' && !P) openDaily(); });
    }
    const howModal = document.getElementById('dtHowModal');
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    bind('dtHowBtn', () => setHowOpen(true));
    bind('dtHowClose', () => setHowOpen(false));
    bind('dtHowGotIt', () => setHowOpen(false));
    if (howModal) howModal.addEventListener('click', e => { if (e.target === howModal) setHowOpen(false); });
    document.addEventListener('keydown', onKeyDown);
  }

  document.addEventListener('DOMContentLoaded', init);

  window.GriloDictationLab = { openTrack, closePlayer, _judgeSentence: judgeSentence };
})();
