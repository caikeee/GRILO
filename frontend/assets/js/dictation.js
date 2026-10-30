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
 *
 *  Layout: casco comum (session-shell.js/.css). A tela da frase é
 *  pensada com o teclado aberto: dock (Dica · Verificar) colado no
 *  teclado e o pós-resposta inteiro num sheet com o diff em 1 linha.
 * ============================================================ */
(function () {
  'use strict';

  const LS_KEY = 'grilo_dictation_progress_v1';
  const LS_SCAFFOLD = 'grilo_dictation_scaffold_v1';
  const NORMAL_RATE = 0.92;
  const SLOW_RATE = 0.7;

  const Shell = window.GriloShell;
  const icon = Shell.icon;

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

  function todayKey() { return new Date().toISOString().slice(0, 10); }

  function markDailyDone() {
    const today = todayKey();
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
  const escapeHtml = Shell.escapeHtml;

  function fmtTime(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function comboMultiplier(combo) {
    return 1 + Math.min(0.5, Math.floor(combo / 3) * 0.1);
  }

  function speak(text, rate) {
    const btn = document.getElementById('dtPlay');
    try {
      if (btn) btn.classList.add('is-playing');
      const off = function () { if (btn) btn.classList.remove('is-playing'); };
      if (window.GriloTTS) {
        window.GriloTTS.speak(text, { rate: rate || NORMAL_RATE, onend: off });
        return;
      }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = rate || NORMAL_RATE;
      u.onend = u.onerror = off;
      window.speechSynthesis.speak(u);
    } catch (e) {
      if (btn) btn.classList.remove('is-playing');
    }
  }

  function currentRate() { return P && P.slow ? SLOW_RATE : NORMAL_RATE; }

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
  function blockLabels(track) {
    const seen = [];
    track.sentences.forEach(s => s.blocks.forEach(b => { if (seen.indexOf(b.label) < 0) seen.push(b.label); }));
    return seen.slice(0, 3);
  }

  function renderHub() {
    const order = window.GriloDictation.getTrackOrder();
    const root = document.getElementById('dtHubBody');
    if (!root) return;

    const doneCount = order.filter(t => trackState(t.slug).done).length;
    Shell.hubRing(document.getElementById('dtRing'), doneCount, order.length);
    const countEl = document.getElementById('dtTrackCount');
    if (countEl) countEl.textContent = `${doneCount} de ${order.length}`;

    const chip = document.getElementById('dtStreakChip');
    if (chip) chip.textContent = PROGRESS.streakDate === todayKey() ? '✓ treino de hoje feito' : '🔥 treino do dia';

    // Próxima faixa: a primeira ainda não concluída (ou a 1ª, para repetir)
    const next = order.find(t => !trackState(t.slug).done) || order[0];
    const cont = document.getElementById('dtContinue');
    if (cont && next) {
      const st = trackState(next.slug);
      const allDone = doneCount === order.length;
      cont.innerHTML = `
        <div class="gs-cont" data-slug="${next.slug}">
          <span class="gs-cont-k">${allDone ? 'Trilha concluída · repetir' : 'Próxima faixa'} · ${escapeHtml(next.level)}</span>
          <h2 class="gs-cont-t">${escapeHtml(next.title)}</h2>
          <span class="gs-cont-m">${next.sentences.length} frases · ${escapeHtml(next.theme)}</span>
          <div class="gs-cont-chips" aria-hidden="true">${blockLabels(next).map(l => `<span>${escapeHtml(l)}</span>`).join('')}</div>
          <button class="gs-cont-go" type="button">${st.attempts ? 'Tentar de novo' : 'Começar'} ${icon('play')}</button>
        </div>`;
      cont.querySelector('.gs-cont').addEventListener('click', () => openTrack(next.slug));
    }

    root.innerHTML = order.map(function (t, i) {
      const st = trackState(t.slug);
      const state = st.done ? 'done' : (isUnlocked(t, order) ? 'available' : 'locked');
      const isCur = t === next && state !== 'done';
      const prev = order[i - 1];
      const sub = state === 'locked'
        ? `faça ${prev.minScoreToUnlock} em ${escapeHtml(prev.title)}`
        : `${t.sentences.length} frases · meta ${t.minScoreToUnlock}`;
      const right = st.bestScore > 0
        ? `<span class="gs-row-r">melhor<em>${st.bestScore}</em></span>`
        : (state === 'locked' ? '' : `<span class="gs-row-r">${isCur ? 'agora' : 'novo'}</span>`);
      const badge = state === 'done' ? icon('check') : state === 'locked' ? icon('lock') : String(i + 1).padStart(2, '0');
      const open = state !== 'locked';
      return `
        <div class="gs-row is-${state === 'locked' ? 'locked' : state}${isCur ? ' is-cur' : ''}" data-slug="${t.slug}"${open ? ' role="button" tabindex="0"' : ' aria-disabled="true"'}>
          <span class="gs-rs">${badge}</span>
          <span class="gs-row-t"><b>${escapeHtml(t.title)}</b><small>${sub}</small></span>
          ${right}
        </div>`;
    }).join('');

    root.querySelectorAll('.gs-row[role="button"]').forEach(function (row) {
      const open = () => openTrack(row.dataset.slug);
      row.addEventListener('click', open);
      row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
  }

  // ============================================================
  //  PLAYER
  // ============================================================
  let P = null;
  let unfitViewport = null;

  function session() { return document.querySelector('#dtPlayerOverlay .gs-session'); }

  function openTrack(slug) {
    const track = window.GriloDictation.getTrackBySlug(slug);
    if (!track) return;
    P = { track, phase: 'intro', slow: false };
    const overlay = document.getElementById('dtPlayerOverlay');
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="gs-session" role="dialog" aria-modal="true" aria-label="Ditação — ${escapeHtml(track.title)}">
        <div class="gs-top">
          <button class="gs-x" id="dtPlayerClose" type="button" aria-label="Fechar">${icon('x')}</button>
          <div class="gs-prog" id="dtProg">${Shell.progHtml([0])}</div>
          <div class="gs-hud" id="dtHud" hidden></div>
          <span class="gs-cnt" id="dtCnt">${track.sentences.length} frases</span>
        </div>
        <div class="gs-body" id="dtPlayerBody"></div>
        <div class="gs-dock" id="dtDock"></div>
      </div>`;
    document.getElementById('dtPlayerClose').addEventListener('click', requestClose);
    Shell.lockScroll(true);
    unfitViewport = Shell.fitViewport(overlay);
    renderIntro();
  }

  function closePlayer() {
    try { window.GriloTTS ? window.GriloTTS.stop() : window.speechSynthesis.cancel(); } catch (e) {}
    if (unfitViewport) { unfitViewport(); unfitViewport = null; }
    Shell.lockScroll(false);
    P = null;
    const overlay = document.getElementById('dtPlayerOverlay');
    overlay.hidden = true;
    overlay.innerHTML = '';
    renderHub();
  }

  // Sair no meio da faixa perde a sessão (o progresso só é gravado no
  // resultado), então pede confirmação. Na intro e no resultado, fecha direto.
  function requestClose() {
    if (!P || (P.phase !== 'typing' && P.phase !== 'checked')) { closePlayer(); return; }
    const s = session();
    const input = document.getElementById('dtInput');
    if (input) input.blur();
    Shell.openSheet(s, {
      tone: 'plain',
      icon: null,
      scrim: true,
      stack: true,
      title: 'Sair desta faixa?',
      html: `<p class="gs-sheet-text gs-muted">Você está na frase ${P.idx + 1} de ${P.track.sentences.length}. A pontuação desta tentativa não é salva.</p>`,
      actions: [
        { label: 'Continuar treinando', kind: 'pri', onClick: () => {
          if (P.phase === 'checked') showSentenceSheet(); else { Shell.closeSheet(s); focusInput(); }
        } },
        { label: 'Sair da faixa', kind: 'txt', onClick: closePlayer },
      ],
    });
  }

  function setDock(html) {
    const dock = document.getElementById('dtDock');
    if (dock) dock.innerHTML = html;
    return dock;
  }

  function setTopForSession(on) {
    const hud = document.getElementById('dtHud');
    const cnt = document.getElementById('dtCnt');
    if (hud) hud.hidden = !on;
    if (cnt) cnt.hidden = on;
  }

  function setProgress(frac) {
    Shell.setProg(document.getElementById('dtProg'), [frac]);
  }

  // ─── Intro da faixa ────────────────────────────────────────────
  function renderIntro() {
    P.phase = 'intro';
    const t = P.track;
    setTopForSession(false);
    setProgress(0);
    const body = document.getElementById('dtPlayerBody');
    body.innerHTML = `
      <span class="gs-kick">${escapeHtml(t.theme)} · ${escapeHtml(t.level)}</span>
      <h2 class="gs-h1">${escapeHtml(t.title)}</h2>
      <p class="gs-p">Ouça cada frase e escreva exatamente o que ouviu. Faça <b>${t.minScoreToUnlock} pontos</b> para liberar a próxima faixa.</p>
      <div class="dt-legend">
        <span class="gs-lbl">Como ler os blocos</span>
        <div class="dt-scaffold">
          <div class="dt-block" data-tag="subject"><span class="dt-block-label">Sujeito</span><span class="dt-block-slots"><span class="dt-slot is-ok">I</span></span></div>
          <div class="dt-block" data-tag="verb"><span class="dt-block-label">Verbo</span><span class="dt-block-slots"><span class="dt-slot is-ok">am</span></span></div>
          <div class="dt-block" data-tag="complement"><span class="dt-block-label">Complemento</span><span class="dt-block-slots"><span class="dt-slot">from</span><span class="dt-slot">Brazil.</span></span></div>
        </div>
        <p class="gs-p dt-legend-note">Cada traço tem o <b>tamanho da palavra</b>. O que você acerta aparece no lugar dela.</p>
      </div>
      <ul class="dt-tips">
        <li><span aria-hidden="true">🔊</span>Ouça quantas vezes quiser.</li>
        <li><span aria-hidden="true">🐢</span>“Devagar” toca a frase mais lenta.</li>
        <li><span aria-hidden="true">💡</span>A dica revela uma palavra, mas a frase sai do combo.</li>
      </ul>
      <ul class="dt-keys" aria-label="Atalhos de teclado">
        <li><kbd>Enter</kbd> verificar / avançar</li>
        <li><kbd>Ctrl</kbd>+<kbd>Espaço</kbd> ouvir de novo</li>
        <li><kbd>Ctrl</kbd>+<kbd>H</kbd> dica</li>
      </ul>`;
    setDock(`<button class="gs-btn is-pri" id="dtStart" type="button">Começar</button>`);
    const start = document.getElementById('dtStart');
    start.addEventListener('click', startSession);
    start.focus({ preventScroll: true });
  }

  function startSession() {
    Shell.closeSheet(session());
    Object.assign(P, {
      idx: 0,
      results: [],
      combo: 0,
      comboMax: 0,
      points: 0,
      startedAt: Date.now(),
    });
    setTopForSession(true);
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

  function renderHud(bump) {
    const hud = document.getElementById('dtHud');
    if (!hud) return;
    const mult = P.combo >= 3 ? ` <small>×${comboMultiplier(P.combo).toFixed(1)}</small>` : '';
    hud.innerHTML = `
      <span title="Pontos">⭐ ${P.points}</span>
      <span class="${P.combo >= 1 ? 'is-hot' : ''}${bump ? ' is-bump' : ''}" title="Frases perfeitas seguidas">🔥 ${P.combo}${mult}</span>`;
  }

  function focusInput() {
    const input = document.getElementById('dtInput');
    if (input && !input.readOnly) input.focus({ preventScroll: true });
  }

  function renderSentence() {
    P.phase = 'typing';
    const sent = P.track.sentences[P.idx];
    P.cur = { hinted: false, hintIdx: new Set() };
    const total = P.track.sentences.length;
    const showScaffold = scaffoldOn();

    Shell.closeSheet(session());
    renderHud(false);
    setProgress(P.idx / total);

    const body = document.getElementById('dtPlayerBody');
    body.innerHTML = `
      <div class="dt-head">
        <span class="gs-kick">Frase ${P.idx + 1} de ${total}</span>
        <button class="dt-scaffold-toggle" id="dtScaffoldToggle" type="button" aria-pressed="${showScaffold}">🧩 Estrutura</button>
      </div>

      <div class="gs-arow">
        <button class="gs-apill" id="dtPlay" type="button" aria-label="Ouvir a frase de novo">
          <span class="gs-apill-pl">${icon('play')}</span><span>Ouvir</span>
          <span class="gs-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        </button>
        <button class="gs-slow" id="dtPlaySlow" type="button" aria-pressed="${P.slow ? 'true' : 'false'}">🐢 Devagar</button>
      </div>

      <div class="dt-scaffold ${showScaffold ? '' : 'is-hidden'}" id="dtScaffold">${scaffoldHtml(sent)}</div>

      <input class="gs-input" id="dtInput" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="Digite o que você ouviu…" aria-label="Digite a frase que você ouviu">
      <p class="dt-hint-line" id="dtHintLine" hidden></p>`;

    setDock(`
      <button class="gs-btn is-sec is-sm" id="dtHint" type="button">💡 Dica</button>
      <button class="gs-btn is-pri is-sm" id="dtCheck" type="button">Verificar</button>`);

    document.getElementById('dtPlay').addEventListener('click', () => speak(sent.en, currentRate()));
    document.getElementById('dtPlaySlow').addEventListener('click', toggleSlow);
    document.getElementById('dtScaffoldToggle').addEventListener('click', toggleScaffold);
    // pointerdown + preventDefault: tocar no dock não tira o foco do campo,
    // então o teclado do celular não fecha e reabre a cada toque.
    ['dtHint', 'dtCheck'].forEach(id => {
      document.getElementById(id).addEventListener('pointerdown', e => e.preventDefault());
    });
    document.getElementById('dtHint').addEventListener('click', giveHint);
    document.getElementById('dtCheck').addEventListener('click', checkSentence);
    const input = document.getElementById('dtInput');
    input.addEventListener('input', paintLiveScaffold);
    input.focus({ preventScroll: true });

    speak(sent.en, currentRate());
  }

  function toggleSlow() {
    if (!P) return;
    P.slow = !P.slow;
    const btn = document.getElementById('dtPlaySlow');
    if (btn) btn.setAttribute('aria-pressed', String(P.slow));
    speak(P.track.sentences[P.idx].en, currentRate());
    focusInput();
  }

  function toggleScaffold() {
    const on = !scaffoldOn();
    setScaffoldOn(on);
    const row = document.getElementById('dtScaffold');
    const btn = document.getElementById('dtScaffoldToggle');
    if (row) row.classList.toggle('is-hidden', !on);
    if (btn) btn.setAttribute('aria-pressed', String(on));
    if (P && P.phase === 'typing') focusInput();
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
    if (next < 0) { focusInput(); return; }
    const firstHint = !P.cur.hinted;
    P.cur.hinted = true;
    P.cur.hintIdx.add(next);
    const word = sent.en.split(/\s+/)[next];
    const line = document.getElementById('dtHintLine');
    line.hidden = false;
    line.innerHTML = `💡 Palavra ${next + 1}: <b>${escapeHtml(word)}</b> · esta frase sai do combo`;
    paintLiveScaffold();
    // O combo zera na hora — a consequência da dica fica visível na topbar.
    if (firstHint && P.combo > 0) { P.combo = 0; renderHud(false); }
    focusInput();
  }

  function diffHtml(sent, r) {
    const display = sent.en.split(/\s+/);
    const words = display.map(function (w, i) {
      const st = r.states[i];
      if (st === 'ok') return `<span class="is-ok">${escapeHtml(w)}</span>`;
      const typed = r.matched[i] >= 0 ? `<span class="is-del">${escapeHtml(r.got[r.matched[i]])}</span>` : '';
      return `${typed}<span class="is-fix">${escapeHtml(w)}</span>`;
    });
    const extras = r.extras.map(w => `<span class="is-del">${escapeHtml(w)}</span>`);
    return `<div class="dt-diff" aria-label="Correção palavra a palavra">${words.concat(extras).join(' ')}</div>`;
  }

  function checkSentence() {
    if (!P || P.phase !== 'typing') return;
    const sent = P.track.sentences[P.idx];
    const input = document.getElementById('dtInput');
    if (!input.value.trim()) {
      input.classList.remove('is-shake');
      void input.offsetWidth;
      input.classList.add('is-shake');
      focusInput();
      return;
    }

    P.phase = 'checked';
    const r = judgeSentence(input.value, sent.en);
    const clean = r.perfect && !P.cur.hinted;
    P.combo = clean ? P.combo + 1 : 0;
    P.comboMax = Math.max(P.comboMax, P.combo);
    const gained = Math.round(r.score * comboMultiplier(P.combo));
    P.points += gained;
    P.results[P.idx] = Object.assign({ hinted: P.cur.hinted, clean, gained }, r);

    input.readOnly = true;
    input.blur();
    input.classList.add(r.perfect ? 'is-pass' : (r.score >= 70 ? 'is-warn' : 'is-fail'));

    slotEls().forEach(function (el, i) {
      el.classList.remove('is-ok', 'is-hint');
      el.classList.add('is-' + r.states[i], 'is-final');
    });
    document.getElementById('dtHintLine').hidden = true;

    renderHud(clean && P.combo >= 2);
    setProgress((P.idx + 1) / P.track.sentences.length);
    showSentenceSheet();
  }

  function showSentenceSheet() {
    const sent = P.track.sentences[P.idx];
    const r = P.results[P.idx];
    const last = P.idx === P.track.sentences.length - 1;

    let tone, title;
    if (r.clean) {
      tone = 'good';
      title = P.combo >= 2 ? `Perfeito! Combo ${P.combo} 🔥` : 'Perfeito!';
    } else if (r.perfect) {
      tone = 'good';
      title = 'Certo, com dica';
    } else if (r.score >= 70) {
      tone = 'warn';
      title = 'Quase lá';
    } else {
      tone = 'bad';
      title = 'Essa foi difícil';
    }

    Shell.openSheet(session(), {
      tone,
      title,
      pts: '+' + r.gained,
      html: `${r.clean ? '' : diffHtml(sent, r)}
        <p class="gs-sheet-text${r.clean ? '' : ' gs-muted'}">${escapeHtml(sent.pt)}${r.perfect && r.hinted ? ' <span class="gs-muted">· o combo zerou</span>' : ''}</p>`,
      again: r.clean ? null : { label: 'ouvir de novo', onClick: () => speak(sent.en, currentRate()) },
      actions: [{ label: last ? 'Ver resultado' : 'Próxima frase', kind: 'pri', id: 'dtNext', onClick: nextSentence }],
    });
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
    try { window.GriloTTS ? window.GriloTTS.stop() : window.speechSynthesis.cancel(); } catch (e) {}
    Shell.closeSheet(session());
    P.phase = 'result';
    const t = P.track;
    const elapsed = Date.now() - P.startedAt;
    const score = Math.round(P.results.reduce((s, r) => s + r.score, 0) / t.sentences.length);

    const order = window.GriloDictation.getTrackOrder();
    const st = trackState(t.slug);
    const passed = score >= t.minScoreToUnlock;
    const isNewRecord = score > st.bestScore && st.attempts > 0;
    const nextTrack = order[order.indexOf(t) + 1] || null;
    const unlocked = passed && !st.done && !!nextTrack;
    setTrackState(t.slug, {
      bestScore: Math.max(st.bestScore, score),
      attempts: st.attempts + 1,
      done: st.done || passed,
    });
    markDailyDone();

    const tone = Shell.tone(score, t.minScoreToUnlock);
    const title = tone === 'good' ? (unlocked ? 'Faixa concluída!' : 'Mandou bem!')
      : tone === 'warn' ? 'No caminho!'
      : 'Primeira volta feita';
    const sub = passed
      ? (unlocked ? `Próxima faixa liberada: <b>${escapeHtml(nextTrack.title)}</b>.` : 'Você bateu a meta desta faixa.')
      : tone === 'warn'
        ? `Faltam <b>${t.minScoreToUnlock - score} pontos</b> para liberar a próxima faixa.`
        : `Você ouviu as ${t.sentences.length} frases. Na segunda volta o ouvido já conhece o ritmo.`;

    const perfectCount = P.results.filter(r => r.clean).length;
    const toTrain = t.sentences.map((s, si) => ({ s, r: P.results[si] })).filter(x => !x.r.perfect);
    const recap = t.sentences.map(function (s, si) {
      const r = P.results[si];
      const words = s.en.split(/\s+/).map((w, i) => `<span class="dt-wchip is-${r.states[i]}">${escapeHtml(w)}</span>`).join('');
      return `<div class="dt-recap-line">${r.clean ? '<span class="dt-recap-star" title="Perfeita">★</span>' : '<span class="dt-recap-star is-empty"></span>'}<div class="dt-chips">${words}</div></div>`;
    }).join('');

    const body = document.getElementById('dtPlayerBody');
    body.innerHTML = `
      <div class="gs-center">
        ${Shell.resultRing(score, t.minScoreToUnlock)}
        ${isNewRecord ? '<span class="dt-record">🏆 novo recorde</span>' : ''}
        <h2 class="gs-h2">${title}</h2>
        <p class="gs-p">${sub}</p>
        <span class="gs-xp" id="dtXp">ganhou … XP</span>
        <div class="gs-mets">
          <div><b>${perfectCount}/${t.sentences.length}</b><small>perfeitas</small></div>
          <div><b>${P.comboMax}</b><small>maior combo</small></div>
          <div><b>${fmtTime(elapsed)}</b><small>tempo</small></div>
        </div>
        ${toTrain.length ? `
          <div class="gs-take">
            <span class="gs-lbl">Para treinar</span>
            <div class="gs-take-list">${toTrain.slice(0, 4).map((x, i) => `<button class="gs-chipbtn" type="button" data-say="${i}">${icon('play')}${escapeHtml(x.s.en)}</button>`).join('')}</div>
          </div>` : ''}
      </div>
      <span class="gs-lbl dt-recap-title">Suas frases</span>
      <div class="dt-recap">${recap}</div>`;

    body.querySelectorAll('[data-say]').forEach(b => {
      b.addEventListener('click', () => speak(toTrain[+b.dataset.say].s.en, NORMAL_RATE));
    });
    body.scrollTop = 0;
    setTopForSession(false);
    const cnt = document.getElementById('dtCnt');
    if (cnt) cnt.textContent = 'fim';

    const goNext = passed && nextTrack;
    setDock(`
      <button class="gs-btn is-sec" id="dtBack" type="button">Trilha</button>
      <button class="gs-btn is-pri" id="dtAgain" type="button">${goNext ? 'Próxima faixa' : 'Repetir faixa'}</button>`);
    document.getElementById('dtBack').addEventListener('click', closePlayer);
    document.getElementById('dtAgain').addEventListener('click', () => {
      if (goNext) { const slug = nextTrack.slug; closePlayer(); openTrack(slug); }
      else { setTopForSession(true); startSession(); }
    });

    syncToBackend(t, P.results, score, P.comboMax, unlocked);
  }

  function getAuthToken() {
    try { return sessionStorage.getItem('grilo_token'); } catch (e) { return null; }
  }

  function setXpLabel(xp) {
    const el = document.getElementById('dtXp');
    if (!el) return;
    if (xp == null) { el.hidden = true; return; }
    el.textContent = `ganhou +${xp} XP`;
  }

  function syncToBackend(track, results, score, comboMax, unlockedNext) {
    const token = getAuthToken();
    if (!token) { setXpLabel(null); return; }

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
      setXpLabel(res.xp_earned || 0);
    }).catch(function (err) {
      setXpLabel(null);
      console.warn('[DICTATION] sync falhou (progresso local preservado):', err.message);
    });
  }

  // ─── Teclado ───────────────────────────────────────────────────
  function onKeyDown(e) {
    if (!P) return;
    const inSession = P.phase === 'typing' || P.phase === 'checked';
    if (inSession && e.ctrlKey && (e.code === 'Space' || e.key === ' ')) {
      e.preventDefault();
      speak(P.track.sentences[P.idx].en, currentRate());
      return;
    }
    if (P.phase === 'typing' && e.ctrlKey && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      giveHint();
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); requestClose(); return; }
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
    const howModal = document.getElementById('dtHowModal');
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    bind('dtHowBtn', () => setHowOpen(true));
    bind('dtHowClose', () => setHowOpen(false));
    bind('dtHowGotIt', () => setHowOpen(false));
    if (howModal) howModal.addEventListener('click', e => { if (e.target === howModal) setHowOpen(false); });
    document.addEventListener('keydown', onKeyDown);
    openFromUrl();
  }

  // Link direto: dictation.html?faixa=<slug> (destino do "Treino de hoje"
  // da home). Faixa trancada não abre — o aluno cai no hub, como sempre.
  function openFromUrl() {
    let slug = null;
    try { slug = new URLSearchParams(location.search).get('faixa'); } catch (e) {}
    if (!slug) return;
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    const order = window.GriloDictation.getTrackOrder();
    const track = window.GriloDictation.getTrackBySlug(slug);
    if (track && isUnlocked(track, order)) openTrack(slug);
  }

  document.addEventListener('DOMContentLoaded', init);

  window.GriloDictationLab = { openTrack, closePlayer, _judgeSentence: judgeSentence };
})();
