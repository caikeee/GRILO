/* ============================================================
 *  Shadowing Lab — ENGINE
 *  ============================================================
 *  Trilha linear de shadowing SIMULTÂNEO real (o áudio nativo
 *  toca e o aluno fala por cima, sem pausar).
 *
 *  Fluxo: hub → "Primeiro, ouça" (preview frase a frase) → ao vivo
 *  (karaokê por frase) → resultado. A escolha de modo não é mais a
 *  porta de entrada: é o interruptor "Valer nota" no preview.
 *
 *    TREINO LIVRE — sem fone, sem reconhecimento: o aluno fala junto
 *                   e o resultado NÃO tem nota (antes: "0" vermelho).
 *    VALER NOTA   — fone confirmado por calibração ativa de eco (sheet,
 *                   lembrada por aparelho), feedback palavra-a-palavra
 *                   ao vivo: alinhador guloso com resync sobre o fluxo
 *                   contínuo do reconhecedor (finais + parciais),
 *                   limitado pelo cursor do áudio nativo (nada fica
 *                   marcado antes de o TTS ter falado a palavra). Único
 *                   modo que avança a trilha. Se nenhuma fala chegar,
 *                   o resultado é uma tela de ajuda — não uma nota.
 *
 *  Reusa GriloVR (voice-recognition-utils.js): normalização, fuzzy
 *  match e MicLevelMonitor para waveform/nível de áudio. Casco da
 *  sessão: session-shell.js/.css.
 * ============================================================ */
(function () {
  'use strict';

  const LS_KEY = 'grilo_shadow_progress_v1';
  const LS_CALIB = 'grilo_shadow_calibrated_v1';   // { at: ISO } — fone confirmado neste aparelho
  const CALIB_TTL_MS = 7 * 24 * 3600 * 1000;
  const MIN_SCORE_FLOOR = 50;      // piso da régua adaptativa (cuidado #3 do plano)
  const RELAX_AFTER_ATTEMPT = 2;   // a partir da 3ª tentativa passa a relaxar
  const RELAX_STEP = 5;
  const RELAX_TRIES_BEFORE_CASUAL_CTA = 5;

  // ── Alinhador ao vivo ──
  const ALIGN_LOOKAHEAD = 8;       // até quantas palavras à frente o resync procura âncora
  const ANCHOR_NEAR_DIST = 2;      // salto curto: qualquer match serve
  const ANCHOR_MIN_LEN = 4;        // salto longo: só palavra "forte" (≥4 letras) ancora
  const AUDIO_AHEAD_MARGIN = 2;    // usuário pode estar no máx N palavras à frente do áudio
  const WORD_MS_FALLBACK = 380;    // estimativa de ritmo do TTS sem eventos onboundary
  const TAIL_MIN_MS = 2500;        // espera mínima após o áudio acabar (delay do shadowing)
  const TAIL_MAX_MS = 7000;        // teto da espera pela cauda da fala do usuário
  const TAIL_IDLE_MS = 1800;       // silêncio necessário (sem novo resultado do SR) pra considerar que a pessoa parou
  const PAINT_MS = 150;            // repintura do karaokê

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
    return PROGRESS.tracks[slug] || { bestScore: 0, attempts: 0, rankedDone: false, firstTakeSaved: false };
  }

  function setTrackState(slug, patch) {
    const cur = trackState(slug);
    PROGRESS.tracks[slug] = Object.assign({}, cur, patch);
    saveProgress(PROGRESS);
  }

  function isUnlocked(track, order) {
    if (track.order === 1) return true;
    const prev = order[track.order - 2]; // order é 1-based, array 0-based
    if (!prev) return true;
    return !!trackState(prev.slug).rankedDone;
  }

  function todayKey() { return new Date().toISOString().slice(0, 10); }

  function markDailyDone() {
    const today = todayKey();
    if (PROGRESS.streakDate === today) return;
    PROGRESS.streakDate = today;
    saveProgress(PROGRESS);
    try {
      if (window.GriloStreak && typeof window.GriloStreak.markToday === 'function') {
        window.GriloStreak.markToday('shadowing');
      }
    } catch (e) { /* streak global é opcional nesta fase */ }
  }

  function calibratedRecently() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_CALIB) || 'null');
      return !!(raw && raw.at && Date.now() - Date.parse(raw.at) < CALIB_TTL_MS);
    } catch (e) { return false; }
  }

  function rememberCalibration() {
    try { localStorage.setItem(LS_CALIB, JSON.stringify({ at: new Date().toISOString() })); } catch (e) {}
  }

  // ─── Utilidades ────────────────────────────────────────────────
  const escapeHtml = Shell.escapeHtml;

  function VR() { return window.GriloVR || null; }

  function speechSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // onboundary DEVE ser anexado antes de .speak() — no browser real os
  // eventos de palavra podem disparar imediatamente, e anexar depois
  // perderia os primeiros (o cursor de áudio nasceria atrasado).
  function speak(text, onend, onboundary) {
    try {
      window.speechSynthesis && window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.95;
      if (onend) u.onend = onend;
      if (onboundary) u.onboundary = onboundary;
      window.speechSynthesis.speak(u);
      return u;
    } catch (e) {
      if (onend) onend();
      return null;
    }
  }

  function stopSpeech() {
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  }

  function relaxedMin(track, attempts) {
    return Math.max(MIN_SCORE_FLOOR, track.minScoreToUnlock - Math.max(0, attempts - RELAX_AFTER_ATTEMPT) * RELAX_STEP);
  }

  // ============================================================
  //  HUB — trilha linear
  // ============================================================
  function renderHub() {
    const order = window.GriloShadow.getTrackOrder();
    const root = document.getElementById('shadowHubBody');
    if (!root) return;

    const doneCount = order.filter(t => trackState(t.slug).rankedDone).length;
    Shell.hubRing(document.getElementById('shadowRing'), doneCount, order.length);
    const countEl = document.getElementById('shadowTrackCount');
    if (countEl) countEl.textContent = `${doneCount} de ${order.length}`;
    const chip = document.getElementById('shadowStreakChip');
    if (chip) chip.textContent = PROGRESS.streakDate === todayKey() ? '✓ treino de hoje feito' : '🔥 treino do dia';

    // Próxima faixa: a primeira ainda não concluída valendo nota
    const next = order.find(t => !trackState(t.slug).rankedDone) || order[0];
    const cont = document.getElementById('shadowContinue');
    if (cont && next) {
      const allDone = doneCount === order.length;
      cont.innerHTML = `
        <div class="gs-cont" data-slug="${next.slug}">
          <span class="gs-cont-k">${allDone ? 'Trilha concluída · repetir' : 'Próxima faixa'} · ${escapeHtml(next.level)}</span>
          <h2 class="gs-cont-t">${escapeHtml(next.title)}</h2>
          <span class="gs-cont-m">${next.sentences.length} frases · ${escapeHtml(next.theme)}</span>
          <button class="gs-cont-go" type="button">Ouvir e treinar ${icon('play')}</button>
        </div>`;
      cont.querySelector('.gs-cont').addEventListener('click', () => openTrack(next.slug));
    }

    root.innerHTML = order.map(t => {
      const st = trackState(t.slug);
      const unlocked = isUnlocked(t, order);
      const state = st.rankedDone ? 'done' : (unlocked ? 'available' : 'locked');
      const isCur = t === next && state !== 'done';
      const prev = order[t.order - 2];
      const sub = state === 'locked' && prev
        ? `faça ${prev.minScoreToUnlock} valendo nota em ${escapeHtml(prev.title)}`
        : `${t.sentences.length} frases · ${escapeHtml(t.theme)}`;
      const right = st.bestScore > 0
        ? `<span class="gs-row-r">melhor<em>${st.bestScore}</em></span>`
        : (state === 'locked' ? '' : `<span class="gs-row-r">${isCur ? 'agora' : 'novo'}</span>`);
      const badge = state === 'done' ? icon('check') : state === 'locked' ? icon('lock') : String(t.order).padStart(2, '0');
      const open = state !== 'locked';
      return `
        <div class="gs-row is-${state === 'locked' ? 'locked' : state}${isCur ? ' is-cur' : ''}" data-slug="${t.slug}"${open ? ' role="button" tabindex="0"' : ' aria-disabled="true"'}>
          <span class="gs-rs">${badge}</span>
          <span class="gs-row-t"><b>${escapeHtml(t.title)}</b><small>${sub}</small></span>
          ${right}
        </div>`;
    }).join('');

    root.querySelectorAll('.gs-row[role="button"]').forEach(row => {
      const open = () => openTrack(row.dataset.slug);
      row.addEventListener('click', open);
      row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
  }

  // ============================================================
  //  PLAYER — máquina de estados de uma sessão
  // ============================================================
  let P = null; // { track, ranked, phase, sentenceResults[], mic, _live, _audio, _rec }
  let unfitViewport = null;

  function session() { return document.querySelector('#shadowPlayerOverlay .gs-session'); }

  function openTrack(slug) {
    const track = window.GriloShadow.getTrackBySlug(slug);
    if (!track) return;
    // "Valer nota" já vem ligado se o fone foi confirmado neste aparelho há pouco
    P = { track, ranked: calibratedRecently() && speechSupported(), phase: 'preview', sentenceResults: [], _previewSeq: 0 };
    const overlay = document.getElementById('shadowPlayerOverlay');
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="gs-session" role="dialog" aria-modal="true" aria-label="Shadowing — ${escapeHtml(track.title)}">
        <div class="gs-top">
          <button class="gs-x" id="shadowPlayerClose" type="button" aria-label="Fechar">${icon('x')}</button>
          <div class="gs-prog" id="shadowProg" aria-hidden="true">${Shell.progHtml(track.sentences.map(() => 0))}</div>
          <span class="gs-cnt" id="shadowCnt">${track.sentences.length} frases</span>
        </div>
        <div class="gs-body" id="shadowPlayerBody"></div>
        <div class="gs-dock" id="shadowDock"></div>
      </div>`;
    document.getElementById('shadowPlayerClose').addEventListener('click', closePlayer);
    Shell.lockScroll(true);
    unfitViewport = Shell.fitViewport(overlay);
    renderPreview();
  }

  function stopEverything() {
    if (!P) return;
    if (P._live) {
      P._live.active = false;
      if (P._live.paintTimer) clearInterval(P._live.paintTimer);
    }
    if (P.mic) { try { P.mic.stop(); } catch (e) {} P.mic = null; }
    if (P._calibMic) { try { P._calibMic.stop(); } catch (e) {} P._calibMic = null; }
    if (P._rec) { try { P._rec.abort(); } catch (e) {} P._rec = null; }
    P._audio = null;
    P._previewSeq = (P._previewSeq || 0) + 1;
    stopSpeech();
  }

  function closePlayer() {
    stopEverything();
    if (unfitViewport) { unfitViewport(); unfitViewport = null; }
    Shell.lockScroll(false);
    P = null;
    const overlay = document.getElementById('shadowPlayerOverlay');
    overlay.hidden = true;
    overlay.innerHTML = '';
    renderHub();
  }

  function setDock(html) {
    const dock = document.getElementById('shadowDock');
    if (dock) dock.innerHTML = html;
  }

  function setCount(text) {
    const el = document.getElementById('shadowCnt');
    if (el) el.textContent = text;
  }

  function setProg(fracs) {
    Shell.setProg(document.getElementById('shadowProg'), fracs);
  }

  // ─── Tela 1: "Primeiro, ouça" + interruptor "Valer nota" ───────
  function renderPreview() {
    stopEverything();
    P.phase = 'preview';
    Shell.closeSheet(session());
    setCount(`${P.track.sentences.length} frases`);
    setProg(P.track.sentences.map(() => 0));

    const body = document.getElementById('shadowPlayerBody');
    body.scrollTop = 0;
    body.innerHTML = `
      <span class="gs-kick">Primeiro, ouça</span>
      <h2 class="gs-h2">${escapeHtml(P.track.title)}</h2>
      <div class="gs-arow">
        <button class="gs-apill" id="shadowPreviewPlay" type="button">
          <span class="gs-apill-pl">${icon('play')}</span><span id="shadowPreviewLabel">Ouvir a faixa</span>
          <span class="gs-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        </button>
      </div>
      <div class="sh-sents" id="shadowSents">
        ${P.track.sentences.map((s, i) => `
          <button class="sh-sent" type="button" data-i="${i}">
            <span class="sh-sent-pp">${icon('play')}</span>
            <span class="sh-sent-t"><b>${escapeHtml(s.en)}</b>${s.pt ? `<small>${escapeHtml(s.pt)}</small>` : ''}</span>
          </button>`).join('')}
      </div>
      <label class="sh-toggle">
        <span class="sh-toggle-t"><b>🏆 Valer nota</b><small>${speechSupported() ? 'Conta para a trilha · precisa de fone' : 'Indisponível neste navegador — use o Chrome'}</small></span>
        <input type="checkbox" id="shadowRanked" role="switch" ${P.ranked ? 'checked' : ''} ${speechSupported() ? '' : 'disabled'}>
        <span class="sh-switch" aria-hidden="true"></span>
      </label>`;
    setDock(`<button class="gs-btn is-pri" id="shadowStart" type="button">Começar a falar junto</button>`);

    document.getElementById('shadowPreviewPlay').addEventListener('click', togglePreview);
    body.querySelectorAll('.sh-sent').forEach(btn => {
      btn.addEventListener('click', () => playPreviewFrom(+btn.dataset.i, true));
    });
    document.getElementById('shadowRanked').addEventListener('change', e => { P.ranked = e.target.checked; });
    document.getElementById('shadowStart').addEventListener('click', startFromPreview);
  }

  function markPreview(active) {
    document.querySelectorAll('#shadowSents .sh-sent').forEach((el, i) => el.classList.toggle('is-playing', i === active));
    const btn = document.getElementById('shadowPreviewPlay');
    const label = document.getElementById('shadowPreviewLabel');
    const playing = active >= 0;
    if (btn) {
      btn.classList.toggle('is-playing', playing);
      btn.querySelector('.gs-apill-pl').innerHTML = icon(playing ? 'pause' : 'play');
    }
    if (label) label.textContent = playing ? 'Tocando a faixa…' : 'Ouvir a faixa';
  }

  function togglePreview() {
    if (P && P._previewPlaying) { P._previewSeq++; P._previewPlaying = false; stopSpeech(); markPreview(-1); return; }
    playPreviewFrom(0, false);
  }

  // Toca a partir de uma frase. `only` = só aquela frase (toque na linha);
  // senão segue até o fim da faixa, destacando a frase da vez (lima = agora).
  function playPreviewFrom(i, only) {
    if (!P) return;
    const seq = ++P._previewSeq;
    P._previewPlaying = true;
    const sents = P.track.sentences;
    (function step(k) {
      if (!P || P._previewSeq !== seq) return;
      if (k >= sents.length || (only && k > i)) { P._previewPlaying = false; markPreview(-1); return; }
      markPreview(k);
      const row = document.querySelector(`#shadowSents .sh-sent[data-i="${k}"]`);
      if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      speak(sents[k].en, () => step(k + 1));
    })(i);
  }

  function startFromPreview() {
    P._previewSeq++;
    P._previewPlaying = false;
    stopSpeech();
    if (!P.ranked) { startLiveSession(); return; }
    if (calibratedRecently()) { startLiveSession(); return; }
    openCalibration();
  }

  // ─── Calibração de eco/ruído (sheet, só quando "Valer nota") ───
  function openCalibration() {
    Shell.openSheet(session(), {
      tone: 'plain',
      icon: null,
      scrim: true,
      center: true,
      top: `<div class="sh-calib-ico">${icon('headphones')}</div>`,
      title: 'Calibrando seu áudio',
      html: `
        <p class="gs-sheet-text gs-muted">Vamos tocar um som de teste. Fique em silêncio por um instante — isso confirma que o fone isola o som.</p>
        <div class="sh-meter"><i id="shadowCalibFill"></i></div>
        <p class="sh-calib-status" id="shadowCalibStatus">verificando…</p>`,
      actions: [{ label: 'Cancelar', kind: 'txt', onClick: () => { if (P._calibMic) { try { P._calibMic.stop(); } catch (e) {} } renderPreview(); } }],
    });
    runCalibration();
  }

  function calibrationFailed(reason) {
    const noMic = reason === 'mic';
    Shell.openSheet(session(), {
      tone: 'plain',
      icon: null,
      scrim: true,
      center: true,
      stack: true,
      top: `<div class="sh-calib-ico is-warn">${icon(noMic ? 'micoff' : 'headphones')}</div>`,
      title: noMic ? 'Sem acesso ao microfone' : 'Pra valer nota, use fone',
      html: `<p class="gs-sheet-text gs-muted">${noMic
        ? 'Libere o microfone no navegador para valer nota. Enquanto isso, dá para treinar livre.'
        : 'Sem fone, sua voz se mistura ao áudio e a nota sai errada. Treine livre agora e ligue a nota quando estiver de fone.'}</p>`,
      actions: [
        { label: 'Treinar livre agora', kind: 'pri', onClick: () => { P.ranked = false; Shell.closeSheet(session()); startLiveSession(); } },
        { label: noMic ? 'Tentar de novo' : 'Já coloquei o fone — testar de novo', kind: 'txt', onClick: openCalibration },
      ],
    });
  }

  function runCalibration() {
    const vr = VR();
    if (!vr || !vr.MicLevelMonitor) { calibrationFailed('mic'); return; }

    const mic = new vr.MicLevelMonitor();
    P._calibMic = mic;
    let maxDuringPlayback = 0;
    let noiseFloor = 0;
    let samples = 0;
    const DURATION_MS = 3200;
    const startedAt = Date.now();

    mic.onLevel = function (rms) {
      const t = Date.now() - startedAt;
      const fill = document.getElementById('shadowCalibFill');
      if (fill) fill.style.width = Math.min(100, (t / DURATION_MS) * 100).toFixed(0) + '%';
      // primeiros ~600ms: silêncio, mede o piso de ruído ambiente
      if (t < 600) {
        noiseFloor = Math.max(noiseFloor, rms);
      } else {
        // depois disso o bipe de teste está tocando: se o mic captar
        // energia correlata (forte) durante o playback, é vazamento/eco
        maxDuringPlayback = Math.max(maxDuringPlayback, rms);
        samples++;
      }
    };

    mic.start().then(function () {
      // toca um bipe curto de teste ~600ms após iniciar a escuta
      setTimeout(function () {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = 880;
          gain.gain.value = 0.25;
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.6);
        } catch (e) { /* segue sem o bipe — a leitura de ruído ainda vale */ }
      }, 600);

      setTimeout(function () {
        mic.stop();
        if (!P || P._calibMic !== mic) return; // cancelado
        P._calibMic = null;
        // eco/vazamento: energia alta e sustentada durante o playback do bipe
        const echoDetected = maxDuringPlayback > 0.5 && samples > 3;
        if (echoDetected) { calibrationFailed('echo'); return; }
        // ruído alto de ambiente não bloqueia, só avisa
        const noisy = noiseFloor > 0.12;
        const status = document.getElementById('shadowCalibStatus');
        if (status) {
          status.className = 'sh-calib-status is-good';
          status.textContent = noisy ? 'Fone ok — ambiente um pouco barulhento' : 'Sinal limpo — fone confirmado';
        }
        rememberCalibration();
        setTimeout(function () { if (P) { Shell.closeSheet(session()); startLiveSession(); } }, 800);
      }, DURATION_MS);
    }).catch(function () {
      if (P && P._calibMic === mic) { P._calibMic = null; calibrationFailed('mic'); }
    });
  }

  // ─── Tela 2: sessão AO VIVO — karaokê por frase ────────────────
  function startLiveSession() {
    stopEverything();
    P.phase = 'live';
    P.sentenceResults = P.track.sentences.map(() => null);
    P.heardAny = false;
    Shell.closeSheet(session());

    const body = document.getElementById('shadowPlayerBody');
    body.scrollTop = 0;
    const sentsHtml = P.track.sentences.map((s, si) =>
      `<p class="sh-kara" data-si="${si}" hidden>${s.en.split(/\s+/).map((w, wi) =>
        `<span class="sh-w" data-si="${si}" data-wi="${wi}">${escapeHtml(w)}</span>`).join(' ')}</p>`
    ).join('');

    body.innerHTML = `
      <div class="sh-live">
        <span class="sh-livetag${P.ranked ? ' is-ranked' : ''}"><i></i>${P.ranked ? 'Valendo nota · fale junto' : 'Treino livre · fale junto'}</span>
        <div class="sh-kara-box" id="shadowKara" aria-live="off">${sentsHtml}</div>
        <p class="sh-next" id="shadowNext"></p>
        ${P.ranked ? `
          <div class="sh-waves">
            <span>você</span><canvas class="sh-wave" id="shadowWaveUser"></canvas>
          </div>` : ''}
      </div>`;

    setDock(`
      <div class="sh-ctl">
        <button class="sh-ctl-b" id="shadowRepeat" type="button" aria-label="Repetir frase">${icon('replay')}<small>repetir</small></button>
        <button class="sh-ctl-b is-big" id="shadowPause" type="button" aria-label="Pausar">${icon('pause')}<small>pausar</small></button>
        <button class="sh-ctl-b" id="shadowSkip" type="button" aria-label="Próxima frase">${icon('next')}<small>próxima</small></button>
      </div>`);
    document.getElementById('shadowRepeat').addEventListener('click', () => jumpTo(currentSentence()));
    document.getElementById('shadowSkip').addEventListener('click', () => {
      const si = currentSentence();
      if (si >= P.track.sentences.length - 1) finishLiveSession();
      else jumpTo(si + 1);
    });
    document.getElementById('shadowPause').addEventListener('click', togglePause);

    runLiveSession();
  }

  function runLiveSession() {
    const vr = VR();

    const els = Array.from(document.querySelectorAll('#shadowKara .sh-w'));
    P._live = {
      active: true,
      paused: false,
      words: els.map(function (el, gi) {
        return { gi, si: +el.dataset.si, wi: +el.dataset.wi, tok: vr.normalizeWord(el.textContent), el };
      }),
      base: 0,          // 1ª palavra do trecho atual (muda ao repetir/pular frase)
      frozen: [],       // status congelado das palavras antes de `base`
      committed: '',
      interim: '',
      status: [],
      alignCursor: 0,
      lastResultAt: 0,
      paintTimer: null,
    };
    P._live.paintTimer = setInterval(paintLiveWords, PAINT_MS);

    if (P.ranked) {
      if (vr && vr.MicLevelMonitor) {
        P.mic = new vr.MicLevelMonitor();
        const canvas = document.getElementById('shadowWaveUser');
        P.mic.onWaveform = function (buf) { drawWave(canvas, buf); };
        P.mic.start().catch(function () {});
      }
      startRecognition();
    }
    playFrom(0);
  }

  // === Reconhecimento contínuo (só valendo nota) ===
  function startRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !P || !P._live) return;
    const rec = new SR();
    P._rec = rec;
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let lastFinalIndex = 0;

    rec.onresult = function (event) {
      const live = P && P._live;
      if (!live || !live.active || P._rec !== rec) return;
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        const transcript = res[0] ? res[0].transcript : '';
        if (res.isFinal) {
          if (i >= lastFinalIndex) {
            live.committed += ' ' + transcript;
            lastFinalIndex = i + 1;
          }
        } else {
          interim += ' ' + transcript;
        }
      }
      live.interim = interim;
      live.lastResultAt = Date.now();
      if ((live.committed + interim).trim()) P.heardAny = true;
      paintLiveWords();
    };
    rec.onerror = function () { /* segue tentando — não interrompe a sessão */ };
    rec.onend = function () {
      if (P && P._rec === rec && P._live && P._live.active && !P._live.paused) {
        lastFinalIndex = 0;
        try { rec.start(); } catch (e) {}
      }
    };

    try { rec.start(); } catch (e) {}
  }

  function stopRecognition() {
    if (P && P._rec) { const r = P._rec; P._rec = null; try { r.abort(); } catch (e) {} }
  }

  const FUZZY_MIN_LEN = 4; // fuzzy por edit-distance só vale para palavras com >= 4 letras

  // wordMatches aceita edit-distance<=1 (ex: "i"~"is", "a"~"as") — ótimo pra
  // erro de pronúncia numa palavra longa, mas em palavras curtíssimas essa
  // tolerância de 1 letra é proporcionalmente enorme e gera falso-positivo
  // (bug real: quando o SR reenvia a frase do zero, o "I" que abre a nova
  // cópia "engolia" um "is" real do alvo, pulando a palavra ANTES dele —
  // ex: "cup" virava vermelho porque "i" ancorou em "is" ignorando "cup").
  // Aqui só igualdade exata ou equivalência semântica (contrações/homófonos,
  // que expandEquivalents já resolve dentro de wordMatches) valem pra
  // palavras curtas — fuzzy por distância de edição exige tamanho mínimo.
  function reliableMatch(vr, expected, heard) {
    if (expected === heard) return true;
    if (expected.length < FUZZY_MIN_LEN && heard.length < FUZZY_MIN_LEN) {
      const equivs = vr.expandEquivalents(expected);
      return equivs.has(heard);
    }
    return vr.wordMatches(expected, heard);
  }

  // Alinhamento guloso com resync: para cada palavra ouvida, procura âncora
  // do cursor até LOOKAHEAD à frente (limitado pelo cursor do áudio — o
  // usuário não pode legitimamente estar além do que o TTS já falou).
  // Palavras entre o cursor e a âncora viram 'skip' (puladas de verdade,
  // com evidência: algo DEPOIS delas foi reconhecido).
  function computeAlignment(vr, tokens, heard, cap) {
    const n = tokens.length;
    const status = new Array(n).fill('pending');
    let cursor = 0;
    for (let h = 0; h < heard.length; h++) {
      while (cursor < n && !tokens[cursor]) { status[cursor] = 'good'; cursor++; }
      if (cursor >= cap) break;
      const end = Math.min(cursor + ALIGN_LOOKAHEAD, cap);
      let found = -1;
      for (let j = cursor; j < end; j++) {
        if (!tokens[j]) continue;
        if (!reliableMatch(vr, tokens[j], heard[h])) continue;
        // salto longo só com palavra forte — evita "a/i/the" ancorar longe
        if (j - cursor > ANCHOR_NEAR_DIST &&
            (heard[h].length < ANCHOR_MIN_LEN || tokens[j].length < ANCHOR_MIN_LEN)) continue;
        found = j;
        break;
      }
      if (found >= 0) {
        for (let k = cursor; k < found; k++) status[k] = tokens[k] ? 'skip' : 'good';
        status[found] = 'good';
        cursor = found + 1;
      }
      // não achou: palavra extra/errada — ignora e espera a próxima ancorar
    }
    return { status, cursor };
  }

  // Índice GLOBAL da palavra que o áudio nativo está dizendo agora.
  function audioWordCursor() {
    const a = P && P._audio;
    if (!a) return P && P._live ? P._live.base : 0;
    if (a.ended) return a.offset + a.totalWords;
    if (a.sawBoundary) return a.offset + a.boundaryWordIdx;
    const elapsed = Date.now() - a.startedAt;
    return a.offset + Math.min(a.totalWords, Math.floor(elapsed / WORD_MS_FALLBACK));
  }

  // Alinha só o trecho a partir de `base` (o que foi dito desde o último
  // repetir/pular); antes disso vale o status congelado.
  function alignLive() {
    const vr = VR();
    const live = P._live;
    const base = live.base;
    const heardText = (live.committed + ' ' + live.interim).trim();
    const heard = heardText ? vr.tokenize(heardText) : [];
    const audioCur = audioWordCursor();
    const cap = Math.min(live.words.length, audioCur + 1 + AUDIO_AHEAD_MARGIN) - base;
    const r = computeAlignment(vr, live.words.slice(base).map(w => w.tok), heard, Math.max(0, cap));
    live.status = live.frozen.slice(0, base).concat(r.status);
    live.alignCursor = base + r.cursor;
    return { status: live.status, cursor: live.alignCursor, audioCur };
  }

  function sentenceOfWord(gi) {
    const live = P._live;
    if (!live || !live.words.length) return 0;
    const w = live.words[Math.min(gi, live.words.length - 1)];
    return w ? w.si : 0;
  }

  function currentSentence() {
    if (!P || !P._live) return 0;
    return P._live.shownSi != null ? P._live.shownSi : sentenceOfWord(audioWordCursor());
  }

  // Karaokê: mostra só a frase da vez. Palavra que o nativo diz agora = lima;
  // reconhecida = verde; pulada (valendo nota) = cinza sublinhado; já tocada
  // sem reconhecimento (treino livre) = tinta; futura = cinza legível.
  function paintLiveWords() {
    if (!P || !P._live) return;
    const live = P._live;
    const r = P.ranked ? alignLive() : { status: [], audioCur: audioWordCursor() };
    const total = P.track.sentences.length;
    const si = live.paused && live.shownSi != null ? live.shownSi : sentenceOfWord(r.audioCur);
    live.words.forEach(function (w, idx) {
      const st = r.status[idx];
      let cls = 'sh-w';
      if (st === 'good') cls += ' is-good';
      else if (st === 'skip' && idx <= r.audioCur) cls += ' is-miss';
      else if (idx === r.audioCur && live.active && !live.paused && P._audio && !P._audio.ended) cls += ' is-now';
      else if (idx < r.audioCur) cls += ' is-said';
      if (w.el.className !== cls) w.el.className = cls;
    });

    if (live.shownSi !== si || live._paintedPause !== live.paused) {
      live.shownSi = si;
      live._paintedPause = live.paused;
      document.querySelectorAll('#shadowKara .sh-kara').forEach(p => { p.hidden = +p.dataset.si !== si; });
      const nextEl = document.getElementById('shadowNext');
      if (nextEl) nextEl.innerHTML = si + 1 < total ? `próxima: <b>${escapeHtml(P.track.sentences[si + 1].en)}</b>` : 'última frase';
      setCount(`${si + 1}/${total}`);
    }

    // barra da topbar: um segmento por frase
    const fracs = P.track.sentences.map((_, k) => {
      if (k < si) return 1;
      if (k > si) return 0;
      const ws = live.words.filter(w => w.si === k);
      const first = ws.length ? ws[0].gi : 0;
      return ws.length ? Math.max(0, Math.min(1, (r.audioCur - first) / ws.length)) : 0;
    });
    setProg(fracs);
  }

  // Toca a faixa a partir da frase `si`, texto corrido, sem pausar entre
  // frases — é o que torna isto shadowing simultâneo de verdade. Cada
  // reprodução tem um id: o onend de uma fala cancelada (repetir/pular/
  // pausar) não pode encerrar a sessão.
  function playFrom(si) {
    const live = P._live;
    const sents = P.track.sentences;
    const offset = live.words.findIndex(w => w.si === si);
    const text = sents.slice(si).map(s => s.en).join(' ');

    // offset de char → índice de palavra, pro onboundary do TTS
    const starts = [];
    const re = /\S+/g;
    let m;
    while ((m = re.exec(text))) starts.push(m.index);

    const audio = {
      id: (P._audio ? P._audio.id : 0) + 1,
      offset: Math.max(0, offset),
      startedAt: Date.now(),
      totalWords: starts.length,
      boundaryWordIdx: 0,
      sawBoundary: false,
      ended: false,
    };
    P._audio = audio;

    speak(text, function () {
      if (!P || P._audio !== audio || !P._live || P._live.paused) return;
      audio.ended = true;
      if (P.ranked) waitTailThenFinish(); else setTimeout(() => { if (P && P._audio === audio) finishLiveSession(); }, 600);
    }, function (e) {
      // Chrome dispara onboundary por palavra: cursor de áudio exato.
      // Sem esses eventos, audioWordCursor() cai na estimativa por tempo.
      if (!P || P._audio !== audio || typeof e.charIndex !== 'number') return;
      let idx = 0;
      while (idx + 1 < starts.length && starts[idx + 1] <= e.charIndex) idx++;
      audio.boundaryWordIdx = idx;
      audio.sawBoundary = true;
    });
  }

  // Repetir / pular / retomar: congela o que já foi julgado antes da frase,
  // zera o reconhecimento e toca de novo a partir dela.
  function jumpTo(si) {
    if (!P || !P._live) return;
    const live = P._live;
    if (P.ranked) {
      const cur = alignLive();
      live.frozen = cur.status.slice();
    }
    live.base = Math.max(0, live.words.findIndex(w => w.si === si));
    for (let k = live.base; k < live.words.length; k++) live.frozen[k] = 'pending';
    live.committed = '';
    live.interim = '';
    live.paused = false;
    live.shownSi = null;
    setPauseButton(false);
    if (P.ranked) { stopRecognition(); startRecognition(); }
    playFrom(si);
    paintLiveWords();
  }

  function setPauseButton(paused) {
    const btn = document.getElementById('shadowPause');
    if (!btn) return;
    btn.innerHTML = paused ? `${icon('play')}<small>continuar</small>` : `${icon('pause')}<small>pausar</small>`;
    btn.setAttribute('aria-label', paused ? 'Continuar' : 'Pausar');
  }

  // Pausar = parar o áudio e o reconhecimento; continuar = retomar do
  // começo da frase em que parou (pause() do speechSynthesis não é
  // confiável no Android, então não dependemos dele).
  function togglePause() {
    if (!P || !P._live) return;
    const live = P._live;
    if (live.paused) { jumpTo(live.shownSi || 0); return; }
    const si = currentSentence();
    live.paused = true;
    live.shownSi = si;
    P._audio = null;
    stopSpeech();
    stopRecognition();
    setPauseButton(true);
    paintLiveWords();
  }

  // O usuário fala com 1–2s de atraso natural — a sessão não pode cortar
  // junto com o áudio. Espera a cauda: fecha quando o aluno alinhou tudo,
  // quando ficar quieto, ou no teto de segurança.
  //
  // lastResultAt é resetado aqui: o relógio de silêncio só conta a partir
  // de quando a cauda de fato começa a ser observada (o reconhecimento tem
  // latência; sem isso a sessão cortava antes do onresult da fala final).
  function waitTailThenFinish() {
    const startedWait = Date.now();
    if (P && P._live) P._live.lastResultAt = startedWait;
    const audio = P._audio;
    (function check() {
      if (!P || !P._live || !P._live.active || P._audio !== audio) return;
      const idleMs = Date.now() - (P._live.lastResultAt || startedWait);
      const waited = Date.now() - startedWait;
      const allDone = P._live.alignCursor >= P._live.words.length;
      if (allDone || waited >= TAIL_MAX_MS || (waited >= TAIL_MIN_MS && idleMs > TAIL_IDLE_MS)) {
        finishLiveSession();
      } else {
        setTimeout(check, 350);
      }
    })();
  }

  function drawWave(canvas, buf) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.clientWidth || 300;
    const h = canvas.height = 28;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    const slice = w / buf.length;
    for (let i = 0; i < buf.length; i++) {
      const v = (buf[i] - 128) / 128;
      const y = h / 2 + v * (h / 2 - 2);
      if (i === 0) ctx.moveTo(0, y); else ctx.lineTo(i * slice, y);
    }
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--gs-warm') || '#d9832e';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  // ─── Tela 3: resultado ─────────────────────────────────────────
  function finishLiveSession() {
    if (!P || P.phase !== 'live') return;
    P.phase = 'result';

    // consolida o resultado por frase a partir do status por palavra do
    // alinhador (o áudio já acabou → o cap libera o texto inteiro)
    if (P.ranked && P._live && P._live.words.length) {
      if (P._audio) P._audio.ended = true;
      const fin = alignLive();
      P.sentenceResults = P.track.sentences.map(() => null);
      P._live.words.forEach(function (w) {
        if (!P.sentenceResults[w.si]) P.sentenceResults[w.si] = { matched: [] };
        P.sentenceResults[w.si].matched[w.wi] = fin.status[w.gi] === 'good';
      });
    }
    stopEverything();
    P._live = null;
    setProg(P.track.sentences.map(() => 1));
    setCount('fim');

    if (!P.ranked) { renderFreeResult(); return; }
    if (!P.heardAny) { renderNoVoice(); return; }

    const results = P.sentenceResults.filter(Boolean);
    const totalWords = P.track.sentences.reduce((s, sent) => s + sent.en.split(/\s+/).length, 0);
    const correctWords = results.reduce((s, r) => s + (r.matched ? r.matched.filter(Boolean).length : 0), 0);
    const score = totalWords ? Math.round((correctWords / totalWords) * 100) : 0;

    const st = trackState(P.track.slug);
    const attempts = st.attempts + 1;
    const isNewRecord = score > st.bestScore && st.attempts > 0;
    const goal = relaxedMin(P.track, attempts);
    const passed = score >= goal;
    setTrackState(P.track.slug, {
      bestScore: Math.max(st.bestScore, score),
      attempts,
      rankedDone: st.rankedDone || passed,
    });
    const unlocked = passed && !st.rankedDone;
    if (passed) markDailyDone();

    // credita o vocabulário falado certo no MESMO pool da home (WordProfile)
    // — decisão de produto: um histórico só por palavra, não importa a fonte.
    // Só sessões valendo nota enviam; o treino livre não tem prova de áudio.
    syncWordsToBackend(P.track, P.sentenceResults, score, unlocked);

    renderResult(score, goal, isNewRecord, unlocked, attempts);
  }

  function getAuthToken() {
    try { return sessionStorage.getItem('grilo_token'); } catch (e) { return null; }
  }

  function syncWordsToBackend(track, sentenceResults, score, unlockedNext) {
    const token = getAuthToken();
    if (!token) return; // deslogado — só progresso local, como no piloto lessons-4p

    const words = [];
    // frases: uma sentença conta como "acerto" quando a PRÓPRIA proporção de
    // palavras certas bate o limiar de aceitação da faixa (minScoreToUnlock —
    // o mesmo "score aceitável pra concluir" já usado pra liberar a próxima
    // faixa). Não exige 100%: o reconhecimento ainda está em ajuste, então
    // uma frase quase toda certa não deveria ficar de fora só por 1 palavra
    // capturada errado. Cada frase julgada pelo próprio desempenho — uma
    // frase ruim não é carregada pela média boa das outras na mesma sessão.
    const passThreshold = (track.minScoreToUnlock || 70) / 100;
    const sentences = [];
    track.sentences.forEach(function (sent, si) {
      const r = sentenceResults[si];
      if (!r || !r.matched) return;
      const tokens = sent.en.split(/\s+/);
      tokens.forEach(function (raw, wi) {
        const word = raw.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, '');
        if (!word || word.length < 2) return;
        words.push({ word, correct: !!r.matched[wi] });
      });
      const correctCount = tokens.reduce(function (n, _, wi) { return n + (r.matched[wi] ? 1 : 0); }, 0);
      const passedThreshold = tokens.length > 0 && (correctCount / tokens.length) >= passThreshold;
      sentences.push({ index: si, en: sent.en, all_correct: passedThreshold });
    });
    if (!words.length) return;

    fetch(`/api/shadowing/tracks/${encodeURIComponent(track.slug)}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ score, words, sentences, unlocked_next: !!unlockedNext }),
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (res) {
      const xp = document.getElementById('shadowXp');
      if (xp && res && res.xp_earned) { xp.textContent = `ganhou +${res.xp_earned} XP`; xp.hidden = false; }
      console.log('[SHADOW] vocabulário sincronizado:', track.slug, res);
    }).catch(function (err) {
      console.warn('[SHADOW] sync falhou (progresso local preservado):', err.message);
    });
  }

  function nextTrackOf(track) {
    const order = window.GriloShadow.getTrackOrder();
    return order[track.order] || null; // order é 1-based
  }

  function sentenceListHtml(withScores) {
    return `<div class="sh-frs">${P.track.sentences.map((s, si) => {
      const r = P.sentenceResults[si];
      let chip = '';
      if (withScores) {
        const n = s.en.split(/\s+/).length;
        const pct = r && r.matched ? Math.round((r.matched.filter(Boolean).length / n) * 100) : 0;
        chip = `<span class="sh-fr-sc is-${Shell.tone(pct, P.track.minScoreToUnlock)}">${pct}</span>`;
      }
      return `
        <button class="sh-fr" type="button" data-say="${si}" aria-label="Ouvir: ${escapeHtml(s.en)}">
          ${chip}<b>${escapeHtml(s.en)}</b><span class="sh-fr-pp">${icon('sound')}</span>
        </button>`;
    }).join('')}</div>`;
  }

  function bindSayButtons(body) {
    body.querySelectorAll('[data-say]').forEach(b => {
      b.addEventListener('click', () => speak(P.track.sentences[+b.dataset.say].en));
    });
  }

  function retryLive() { startLiveSession(); }

  // Valer nota, com nota
  function renderResult(score, goal, isNewRecord, unlocked, attempts) {
    const body = document.getElementById('shadowPlayerBody');
    const tone = Shell.tone(score, goal);
    const nextT = nextTrackOf(P.track);
    const passed = score >= goal;
    const title = tone === 'good' ? (unlocked ? 'Faixa concluída!' : 'Mandou bem!')
      : tone === 'warn' ? 'No caminho!' : 'Primeira volta feita';
    const sub = passed
      ? (unlocked && nextT ? `Próxima faixa liberada: <b>${escapeHtml(nextT.title)}</b>.` : 'Você bateu a meta desta faixa.')
      : `Faltam <b>${goal - score} pontos</b> para liberar ${nextT ? `<i>${escapeHtml(nextT.title)}</i>` : 'a próxima'}.`;
    const tryFree = attempts >= RELAX_TRIES_BEFORE_CASUAL_CTA && !passed
      ? `<p class="gs-p sh-note">Já são ${attempts} tentativas nesta faixa. Um treino livre antes da próxima pode ajudar.</p>` : '';

    body.scrollTop = 0;
    body.innerHTML = `
      <div class="gs-center">
        ${Shell.resultRing(score, goal)}
        ${isNewRecord ? '<span class="sh-record">🏆 novo recorde</span>' : ''}
        <h2 class="gs-h2">${title}</h2>
        <p class="gs-p">${sub}</p>
        <span class="gs-xp" id="shadowXp" hidden></span>
        ${tryFree}
      </div>
      <span class="gs-lbl sh-frs-title">Frase a frase · toque para ouvir o nativo</span>
      ${sentenceListHtml(true)}`;
    bindSayButtons(body);

    const goNext = passed && nextT;
    setDock(`
      <button class="gs-btn is-sec" id="shadowBack" type="button">Trilha</button>
      <button class="gs-btn is-pri" id="shadowAgain" type="button">${goNext ? 'Próxima faixa' : 'Tentar de novo'}</button>`);
    document.getElementById('shadowBack').addEventListener('click', closePlayer);
    document.getElementById('shadowAgain').addEventListener('click', () => {
      if (goNext) { const slug = nextT.slug; closePlayer(); openTrack(slug); }
      else retryLive();
    });
  }

  // Treino livre: sem reconhecimento, então sem nota (antes mostrava "0").
  function renderFreeResult() {
    const body = document.getElementById('shadowPlayerBody');
    body.scrollTop = 0;
    body.innerHTML = `
      <div class="gs-center">
        <span class="sh-done-ico" aria-hidden="true">${icon('check')}</span>
        <h2 class="gs-h2">Treino livre feito</h2>
        <p class="gs-p">Você acompanhou as ${P.track.sentences.length} frases. Repita até o ritmo ficar natural — e ligue <b>🏆 Valer nota</b> quando quiser avançar na trilha.</p>
        ${speechSupported() ? `<button class="gs-btn is-sec" id="shadowGoRanked" type="button">🏆 Tentar valendo nota</button>` : ''}
      </div>
      <span class="gs-lbl sh-frs-title">Toque numa frase para ouvir de novo</span>
      ${sentenceListHtml(false)}
      <p class="sh-foot">Treino livre — não conta para a trilha.</p>`;
    bindSayButtons(body);
    const goRanked = document.getElementById('shadowGoRanked');
    if (goRanked) goRanked.addEventListener('click', () => { P.ranked = true; renderPreview(); });

    setDock(`
      <button class="gs-btn is-sec" id="shadowBack" type="button">Trilha</button>
      <button class="gs-btn is-pri" id="shadowAgain" type="button">Mais uma vez</button>`);
    document.getElementById('shadowBack').addEventListener('click', closePlayer);
    document.getElementById('shadowAgain').addEventListener('click', retryLive);
  }

  // Valendo nota, mas nenhuma fala chegou: é o microfone, não o aluno.
  // Não grava tentativa nem nota.
  function renderNoVoice() {
    const body = document.getElementById('shadowPlayerBody');
    body.scrollTop = 0;
    body.innerHTML = `
      <div class="gs-center">
        <span class="sh-micoff" aria-hidden="true">${icon('micoff')}</span>
        <h2 class="gs-h2">Não ouvimos sua voz</h2>
        <p class="gs-p">Isso não é nota — é o microfone. Confira três coisas e tente de novo:</p>
        <ol class="sh-check">
          <li>Permitiu o microfone quando o navegador pediu?</li>
          <li>Está no Chrome (ou Edge) atualizado?</li>
          <li>Fale perto do celular, no ritmo do áudio.</li>
        </ol>
        <p class="sh-foot">Esta tentativa não foi contada.</p>
      </div>`;
    setDock(`
      <button class="gs-btn is-sec" id="shadowListen" type="button">Só ouvir</button>
      <button class="gs-btn is-pri" id="shadowAgain" type="button">Tentar de novo</button>`);
    document.getElementById('shadowListen').addEventListener('click', renderPreview);
    document.getElementById('shadowAgain').addEventListener('click', retryLive);
  }

  // ─── Modal "Como funciona o Laboratório" ────────────────────────
  function openHowItWorks() {
    const modal = document.getElementById('shadowHowModal');
    if (modal) modal.hidden = false;
  }
  function closeHowItWorks() {
    const modal = document.getElementById('shadowHowModal');
    if (modal) modal.hidden = true;
  }

  // ─── Init ────────────────────────────────────────────────────
  function init() {
    renderHub();
    const howBtn = document.getElementById('shadowHowItWorksBtn');
    const howClose = document.getElementById('shadowHowClose');
    const howGotIt = document.getElementById('shadowHowGotIt');
    const howModal = document.getElementById('shadowHowModal');
    if (howBtn) howBtn.addEventListener('click', openHowItWorks);
    if (howClose) howClose.addEventListener('click', closeHowItWorks);
    if (howGotIt) howGotIt.addEventListener('click', closeHowItWorks);
    if (howModal) howModal.addEventListener('click', function (e) {
      if (e.target === howModal) closeHowItWorks();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && P) closePlayer();
    });
    openFromUrl();
  }

  // Link direto: shadowing.html?faixa=<slug> (destino do "Treino de hoje"
  // da home). Faixa trancada não abre — o aluno cai no hub, como sempre.
  function openFromUrl() {
    let slug = null;
    try { slug = new URLSearchParams(location.search).get('faixa'); } catch (e) {}
    if (!slug) return;
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    const order = window.GriloShadow.getTrackOrder();
    const track = window.GriloShadow.getTrackBySlug(slug);
    if (track && isUnlocked(track, order)) openTrack(slug);
  }

  document.addEventListener('DOMContentLoaded', init);

  window.GriloShadowLab = {
    openTrack, closePlayer,
    _computeAlignment: computeAlignment,
  };
})();
