/* ============================================================
 *  Shadowing Lab — ENGINE
 *  ============================================================
 *  Trilha linear de shadowing SIMULTÂNEO real (o áudio nativo
 *  toca e o aluno fala por cima, sem pausar).
 *
 *  Dois modos, derivados do setup de áudio — nunca escolhidos
 *  livremente pelo usuário como um toggle de resultado:
 *    CASUAL   — sem fone, repete à vontade, zero métrica.
 *    RANKED   — fone confirmado por calibração ativa de eco,
 *               feedback palavra-a-palavra ao vivo: alinhador
 *               guloso com resync sobre o fluxo contínuo do
 *               reconhecedor (finais + parciais), limitado pelo
 *               cursor do áudio nativo (nada fica vermelho antes
 *               de o TTS ter falado a palavra). Único modo que
 *               avança a trilha.
 *
 *  Reusa GriloVR (voice-recognition-utils.js): evaluate() por
 *  frase e MicLevelMonitor para waveform/nível de áudio.
 *
 *  Progresso em localStorage (mesmo padrão do piloto lessons-4p,
 *  frontend-only nesta fase — integração de backend/gate CEFR
 *  fica para uma fase futura).
 * ============================================================ */
(function () {
  'use strict';

  const LS_KEY = 'grilo_shadow_progress_v1';
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

  function markDailyDone() {
    const today = new Date().toISOString().slice(0, 10);
    if (PROGRESS.streakDate === today) return;
    PROGRESS.streakDate = today;
    saveProgress(PROGRESS);
    try {
      if (window.GriloStreak && typeof window.GriloStreak.markToday === 'function') {
        window.GriloStreak.markToday('shadowing');
      }
    } catch (e) { /* streak global é opcional nesta fase */ }
  }

  // ─── Utilidades ────────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function fullText(track) {
    return track.sentences.map(s => s.en).join(' ');
  }

  function VR() { return window.GriloVR || null; }

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

  // ============================================================
  //  HUB — trilha linear
  // ============================================================
  function renderHub() {
    const order = window.GriloShadow.getTrackOrder();
    const root = document.getElementById('shadowHubBody');
    if (!root) return;

    let rankedDoneCount = 0;
    order.forEach(t => { if (trackState(t.slug).rankedDone) rankedDoneCount++; });

    // anel do hero
    const ringFill = document.getElementById('shadowRingFill');
    const ringNum = document.getElementById('shadowRingNum');
    if (ringFill) {
      const pct = order.length ? rankedDoneCount / order.length : 0;
      ringFill.style.strokeDashoffset = String(251 - 251 * pct);
    }
    if (ringNum) ringNum.textContent = String(rankedDoneCount);
    const ringHint = document.getElementById('shadowRingHint');
    if (ringHint) ringHint.textContent = 'de ' + order.length + ' disponíveis';

    // treino do dia: primeira faixa não concluída em ranked
    const dailyTrack = order.find(t => !trackState(t.slug).rankedDone) || order[0];
    const dailyEl = document.getElementById('shadowDailyTrack');
    if (dailyEl && dailyTrack) {
      dailyEl.querySelector('b').textContent = dailyTrack.title;
      dailyEl.dataset.slug = dailyTrack.slug;
    }

    const list = order.map(t => {
      const st = trackState(t.slug);
      const unlocked = isUnlocked(t, order);
      const state = st.rankedDone ? 'done' : (unlocked ? 'available' : 'locked');
      const badge = `<span class="shadow-track-badge is-ranked">${t.level}</span>`;
      const scoreHtml = st.bestScore > 0
        ? `<div class="shadow-track-score">melhor<b>${st.bestScore}</b></div>`
        : (state === 'locked'
            ? `<div class="shadow-track-lock-ico">🔒</div>`
            : `<div class="shadow-track-score" style="color:var(--sh-text-light)">novo</div>`);
      const numIco = st.rankedDone ? '✓' : String(t.order).padStart(2, '0');
      return `
        <div class="shadow-track-card" data-state="${state}" data-slug="${t.slug}">
          <div class="shadow-track-num">${numIco}</div>
          <div class="shadow-track-info">
            <p class="shadow-track-title">${escapeHtml(t.title)}</p>
            <div class="shadow-track-meta">${badge}<span>${t.sentences.length} frases</span><span>·</span><span>${escapeHtml(t.theme)}</span></div>
          </div>
          ${scoreHtml}
        </div>`;
    }).join('');

    root.innerHTML = list;

    root.querySelectorAll('.shadow-track-card[data-state="available"], .shadow-track-card[data-state="done"]').forEach(card => {
      card.addEventListener('click', () => openTrack(card.dataset.slug));
    });
  }

  // ============================================================
  //  PLAYER — máquina de estados de uma sessão
  // ============================================================
  let P = null; // { track, mode, sentenceResults[], mic, calib }

  function openTrack(slug) {
    const track = window.GriloShadow.getTrackBySlug(slug);
    if (!track) return;
    P = { track, mode: null, sentenceResults: [], mic: null };
    renderPlayerShell();
    renderModeSelect();
  }

  function closePlayer() {
    if (P && P._live) {
      P._live.active = false;
      if (P._live.paintTimer) clearInterval(P._live.paintTimer);
    }
    if (P && P.mic) { try { P.mic.stop(); } catch (e) {} }
    if (P && P._rec) { try { P._rec.abort(); } catch (e) {} }
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    P = null;
    document.getElementById('shadowPlayerOverlay').hidden = true;
    renderHub();
  }

  function renderPlayerShell() {
    const overlay = document.getElementById('shadowPlayerOverlay');
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="shadow-player-card">
        <div class="shadow-player-head">
          <span id="shadowPlayerModeTag"></span>
          <button class="shadow-player-close" id="shadowPlayerClose" aria-label="Fechar">✕</button>
        </div>
        <div class="shadow-player-body" id="shadowPlayerBody"></div>
      </div>`;
    document.getElementById('shadowPlayerClose').addEventListener('click', closePlayer);
  }

  function setModeTag(mode) {
    const tag = document.getElementById('shadowPlayerModeTag');
    if (!tag) return;
    if (!mode) { tag.innerHTML = ''; return; }
    tag.innerHTML = mode === 'ranked'
      ? `<span class="shadow-player-mode is-ranked">🏆 Ranqueada</span>`
      : `<span class="shadow-player-mode is-casual">🎮 Casual</span>`;
  }

  // ─── Tela 1: escolha de modo ───────────────────────────────────
  function renderModeSelect() {
    setModeTag(null);
    const body = document.getElementById('shadowPlayerBody');
    body.innerHTML = `
      <p class="shadow-modeselect-title">${escapeHtml(P.track.title)}</p>
      <p class="shadow-modeselect-sub">🎧 Detectamos fone conectado? Shadowing simultâneo de verdade — fala junto com o áudio, sem pausar.</p>
      <div class="shadow-modeselect-grid">
        <button class="shadow-mode-card is-casual" id="shadowPickCasual">
          <span class="shadow-mode-ico">🎮</span>
          <span class="shadow-mode-name">Casual</span>
          <ul class="shadow-mode-list">
            <li>repita à vontade, sem limite</li>
            <li>sem fone necessário</li>
            <li>não conta progresso nem gate</li>
          </ul>
          <span class="shadow-mode-btn">JOGAR</span>
        </button>
        <button class="shadow-mode-card is-ranked" id="shadowPickRanked">
          <span class="shadow-mode-ico">🏆</span>
          <span class="shadow-mode-name">Ranqueada</span>
          <ul class="shadow-mode-list">
            <li>feedback ao vivo, palavra a palavra</li>
            <li>🎧 fone obrigatório (calibramos)</li>
            <li>libera o próximo texto da trilha</li>
          </ul>
          <span class="shadow-mode-btn">CALIBRAR E IR</span>
        </button>
      </div>`;
    document.getElementById('shadowPickCasual').addEventListener('click', () => startPreview('casual'));
    document.getElementById('shadowPickRanked').addEventListener('click', () => renderCalibration());
  }

  // ─── Tela 2 (só Ranqueada): calibração de eco/ruído ────────────
  function renderCalibration() {
    setModeTag('ranked');
    const body = document.getElementById('shadowPlayerBody');
    body.innerHTML = `
      <div class="shadow-calib">
        <div class="shadow-calib-ico">🎧</div>
        <p class="shadow-calib-title">Calibrando seu áudio</p>
        <p class="shadow-calib-sub">Vamos tocar um som de teste. Fique em silêncio por um instante — isso confirma que seu fone está isolando o som direito.</p>
        <div class="shadow-calib-meter"><div class="shadow-calib-meter-fill" id="shadowCalibMeterFill"></div></div>
        <div class="shadow-calib-status is-checking" id="shadowCalibStatus">🔎 verificando…</div>
        <div class="shadow-calib-fallback" id="shadowCalibFallback" hidden>
          Não deu pra confirmar. <button id="shadowCalibRetry">tentar de novo</button> ou
          <button id="shadowCalibToCasual">seguir em Casual</button>
        </div>
      </div>`;
    document.getElementById('shadowCalibToCasual').addEventListener('click', () => startPreview('casual'));
    document.getElementById('shadowCalibRetry').addEventListener('click', () => runCalibration());
    runCalibration();
  }

  function runCalibration() {
    const fill = document.getElementById('shadowCalibMeterFill');
    const status = document.getElementById('shadowCalibStatus');
    const fallback = document.getElementById('shadowCalibFallback');
    fallback.hidden = true;
    status.className = 'shadow-calib-status is-checking';
    status.textContent = '🔎 verificando…';
    fill.style.width = '0%';

    const vr = VR();
    if (!vr || !vr.MicLevelMonitor) { return failCalibration(); }

    const mic = new vr.MicLevelMonitor();
    let maxDuringPlayback = 0;
    let noiseFloor = 0;
    let samples = 0;
    const DURATION_MS = 3200;
    const startedAt = Date.now();

    mic.onLevel = function (rms, isAudible) {
      const t = Date.now() - startedAt;
      const pct = Math.min(100, (t / DURATION_MS) * 100);
      fill.style.width = pct.toFixed(0) + '%';
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
        evaluateCalibration();
      }, DURATION_MS);
    }).catch(function () {
      failCalibration();
    });

    function evaluateCalibration() {
      // eco/vazamento: energia alta e sustentada durante o playback do bipe
      const echoDetected = maxDuringPlayback > 0.5 && samples > 3;
      // ruído alto de ambiente (não bloqueia Ranqueada, mas avisa)
      const noisy = noiseFloor > 0.12;

      if (echoDetected) {
        status.className = 'shadow-calib-status is-bad';
        status.innerHTML = '🔇 detectamos som saindo de caixa — conecte um fone para continuar';
        fallback.hidden = false;
        return;
      }
      status.className = 'shadow-calib-status is-good';
      status.innerHTML = noisy ? '🟡 fone ok, ambiente um pouco barulhento' : '🟢 sinal limpo — fone confirmado';
      setTimeout(function () { startPreview('ranked'); }, 700);
    }
  }

  function failCalibration() {
    const status = document.getElementById('shadowCalibStatus');
    const fallback = document.getElementById('shadowCalibFallback');
    if (!status) return;
    status.className = 'shadow-calib-status is-bad';
    status.textContent = '⚠️ não conseguimos acessar o microfone';
    fallback.hidden = false;
  }

  // ─── Tela 3: primeira audição (preview, karaokê) ───────────────
  function startPreview(mode) {
    P.mode = mode;
    setModeTag(mode);
    const body = document.getElementById('shadowPlayerBody');
    const sentencesHtml = P.track.sentences.map((s, i) =>
      `<span class="shadow-sent" data-i="${i}">${escapeHtml(s.en)}</span>`).join(' ');
    body.innerHTML = `
      <p class="shadow-preview-title">Primeiro, ouça</p>
      <p class="shadow-preview-sub">Sem falar ainda — só se familiarize com o ritmo. Pode ouvir de novo quantas vezes quiser.</p>
      <div class="shadow-preview-text" id="shadowPreviewText">${sentencesHtml}</div>
      <div class="shadow-preview-controls">
        <button class="shadow-play-btn" id="shadowPreviewPlay">🔊 Ouvir a faixa</button>
        <button class="shadow-ghost-btn" id="shadowPreviewSkip">já conheço, começar →</button>
      </div>`;
    document.getElementById('shadowPreviewPlay').addEventListener('click', playPreview);
    document.getElementById('shadowPreviewSkip').addEventListener('click', () => startLiveSession());
  }

  // Toca a faixa inteira; ao terminar, avança SOZINHA pro shadowing ao vivo
  // — nenhum botão novo aparece (evita o antigo bug de 2 CTAs de "começar"
  // coexistindo). Quem quiser ouvir de novo antes de ir precisa reabrir a
  // faixa; "já conheço, começar →" continua sendo o atalho pra quem não
  // quer nem essa 1ª audição.
  function playPreview() {
    const spans = Array.from(document.querySelectorAll('#shadowPreviewText .shadow-sent'));
    const btn = document.getElementById('shadowPreviewPlay');
    const skipBtn = document.getElementById('shadowPreviewSkip');
    btn.disabled = true;
    if (skipBtn) skipBtn.disabled = true;
    let i = 0;
    spans.forEach(s => s.classList.remove('is-active', 'is-played'));

    function next() {
      if (i > 0) spans[i - 1].classList.add('is-played');
      if (i >= P.track.sentences.length) {
        if (P && P.mode) startLiveSession();
        return;
      }
      spans[i].classList.add('is-active');
      spans[i].scrollIntoView({ block: 'nearest' });
      speak(P.track.sentences[i].en, function () {
        spans[i].classList.remove('is-active');
        i++;
        next();
      });
    }
    next();
  }

  // ─── Tela 4: sessão AO VIVO (shadowing simultâneo) ─────────────
  function startLiveSession() {
    P.sentenceResults = P.track.sentences.map(() => null);
    const body = document.getElementById('shadowPlayerBody');
    const isCasual = P.mode === 'casual';
    const wordsHtml = P.track.sentences.map((s, si) =>
      s.en.split(/\s+/).map((w, wi) =>
        `<span class="shadow-word is-pending" data-si="${si}" data-wi="${wi}">${escapeHtml(w)}</span>`
      ).join(' ')
    ).join(' &nbsp; ');

    const badge = isCasual
      ? `<span class="shadow-live-badge"><span class="shadow-live-dot"></span> acompanhando</span>`
      : `<span class="shadow-live-badge"><span class="shadow-live-dot"></span> AO VIVO — fale junto com o áudio</span>`;

    const waveforms = isCasual
      ? ''
      : `<div class="shadow-waveforms">
        <div class="shadow-wave-row"><span class="shadow-wave-label">🔊 nativo</span><canvas class="shadow-wave-canvas" id="shadowWaveNative"></canvas></div>
        <div class="shadow-wave-row"><span class="shadow-wave-label">🎙 você</span><canvas class="shadow-wave-canvas" id="shadowWaveUser"></canvas></div>
      </div>`;

    body.innerHTML = `
      ${badge}
      <div class="shadow-progressbar"><div class="shadow-progressbar-fill" id="shadowLiveProgress"></div></div>
      <div class="shadow-live-text" id="shadowLiveText">${wordsHtml}</div>
      ${waveforms}
      <div class="shadow-live-controls">
        <button class="shadow-ghost-btn" id="shadowLiveStop">⏸ encerrar</button>
      </div>`;

    document.getElementById('shadowLiveStop').addEventListener('click', () => finishLiveSession());

    runLiveSession();
  }

  function runLiveSession() {
    const vr = VR();
    const isCasual = P.mode === 'casual';

    const els = Array.from(document.querySelectorAll('#shadowLiveText .shadow-word'));
    P._live = {
      active: true,
      words: els.map(function (el, gi) {
        return { gi, si: +el.dataset.si, wi: +el.dataset.wi, tok: vr.normalizeWord(el.textContent), el };
      }),
      committed: '',
      interim: '',
      status: [],
      alignCursor: 0,
      lastResultAt: 0,
      paintTimer: null,
    };
    P._live.paintTimer = setInterval(paintLiveWords, 450);

    if (isCasual) {
      playTrackAudioSimultaneous();
      return;
    }

    // === RANKED: com reconhecimento de voz ===
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (vr && vr.MicLevelMonitor) {
      P.mic = new vr.MicLevelMonitor();
      const canvas = document.getElementById('shadowWaveUser');
      P.mic.onWaveform = function (buf) { drawWave(canvas, buf); };
      P.mic.start().catch(function () {});
    }

    if (!SR) {
      playTrackAudioOnly();
      return;
    }

    const rec = new SR();
    P._rec = rec;
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let lastFinalIndex = 0;

    rec.onresult = function (event) {
      const live = P && P._live;
      if (!live || !live.active) return;
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
      paintLiveWords();
    };
    rec.onerror = function () { /* segue tentando — não interrompe a sessão */ };
    rec.onend = function () {
      if (P && P._rec === rec && P._live && P._live.active) {
        lastFinalIndex = 0;
        try { rec.start(); } catch (e) {}
      }
    };

    try { rec.start(); } catch (e) {}

    playTrackAudioSimultaneous();
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

  function audioWordCursor() {
    const a = P && P._audio;
    if (!a) return 0;
    if (a.ended) return a.totalWords;
    if (a.sawBoundary) return a.boundaryWordIdx;
    const elapsed = Date.now() - a.startedAt;
    return Math.min(a.totalWords, Math.floor(elapsed / WORD_MS_FALLBACK));
  }

  function alignLive() {
    const vr = VR();
    const live = P._live;
    const heardText = (live.committed + ' ' + live.interim).trim();
    const heard = heardText ? vr.tokenize(heardText) : [];
    const audioCur = audioWordCursor();
    const cap = Math.min(live.words.length, audioCur + 1 + AUDIO_AHEAD_MARGIN);
    const r = computeAlignment(vr, live.words.map(w => w.tok), heard, cap);
    live.status = r.status;
    live.alignCursor = r.cursor;
    return { status: r.status, cursor: r.cursor, audioCur };
  }

  function paintLiveWords() {
    if (!P || !P._live) return;
    const live = P._live;
    const r = alignLive();
    live.words.forEach(function (w, idx) {
      const el = w.el;
      el.classList.remove('is-pending', 'is-current', 'is-good', 'is-bad');
      if (r.status[idx] === 'good') el.classList.add('is-good');
      else if (r.status[idx] === 'skip' && idx <= r.audioCur) el.classList.add('is-bad');
      else if (idx === r.cursor && live.active) el.classList.add('is-current');
      else el.classList.add('is-pending');
    });
  }

  function playTrackAudioSimultaneous() {
    // toca a faixa inteira, texto corrido, sem pausar entre frases —
    // é o que torna isto shadowing simultâneo de verdade
    const text = fullText(P.track);

    // offset de char → índice de palavra, pro onboundary do TTS
    const starts = [];
    const re = /\S+/g;
    let m;
    while ((m = re.exec(text))) starts.push(m.index);

    P._audio = {
      startedAt: Date.now(),
      totalWords: starts.length,
      boundaryWordIdx: 0,
      sawBoundary: false,
      ended: false,
    };

    speak(text, function () {
      if (!P || !P._audio) return;
      P._audio.ended = true;
      waitTailThenFinish();
    }, function (e) {
      // Chrome dispara onboundary por palavra: cursor de áudio exato.
      // Sem esses eventos, audioWordCursor() cai na estimativa por tempo.
      if (!P || !P._audio || typeof e.charIndex !== 'number') return;
      let idx = 0;
      while (idx + 1 < starts.length && starts[idx + 1] <= e.charIndex) idx++;
      P._audio.boundaryWordIdx = idx;
      P._audio.sawBoundary = true;
    });
    // avança a barra de progresso pelo tempo estimado de fala
    animateProgress(Math.max(2000, starts.length * WORD_MS_FALLBACK));
  }

  // O usuário fala com 1–2s de atraso natural — a sessão não pode cortar
  // junto com o áudio. Espera a cauda: fecha quando o aluno alinhou tudo,
  // quando ficar quieto, ou no teto de segurança.
  //
  // Bug corrigido: lastResultAt nasce em 0 (ou fica "velho" se a pessoa só
  // começa a falar a cauda quando o TTS termina, sem overlap de eventos
  // recentes) — isso fazia idleMs parecer estourado já na 1ª checagem e
  // cortava a sessão ANTES do onresult da fala final chegar (reconhecimento
  // tem latência de processamento, não é instantâneo). Resetar lastResultAt
  // aqui dá à pessoa o benefício da dúvida: o relógio de silêncio só conta
  // a partir de quando a cauda de fato começa a ser observada.
  function waitTailThenFinish() {
    const startedWait = Date.now();
    if (P && P._live) P._live.lastResultAt = startedWait;
    (function check() {
      if (!P || !P._live || !P._live.active) return;
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

  function playTrackAudioOnly() {
    const text = fullText(P.track);
    speak(text, function () { setTimeout(finishLiveSession, 500); });
    animateProgress(Math.max(2000, text.split(/\s+/).length * 380));
  }

  function animateProgress(ms) {
    const bar = document.getElementById('shadowLiveProgress');
    if (!bar) return;
    const start = Date.now();
    (function tick() {
      if (!document.body.contains(bar)) return;
      const pct = Math.min(100, ((Date.now() - start) / ms) * 100);
      bar.style.width = pct + '%';
      if (pct < 100) requestAnimationFrame(tick);
    })();
  }

  function drawWave(canvas, buf) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.clientWidth || 300;
    const h = canvas.height = 34;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    const slice = w / buf.length;
    for (let i = 0; i < buf.length; i++) {
      const v = (buf[i] - 128) / 128;
      const y = h / 2 + v * (h / 2 - 2);
      if (i === 0) ctx.moveTo(0, y); else ctx.lineTo(i * slice, y);
    }
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--sh-accent') || '#7a9e84';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  // ─── Tela 5: resultado + recap comparativo ─────────────────────
  function finishLiveSession() {
    if (!P) return;
    if (P._live) {
      P._live.active = false;
      if (P._live.paintTimer) { clearInterval(P._live.paintTimer); P._live.paintTimer = null; }
    }
    if (P._rec) { try { P._rec.abort(); } catch (e) {} P._rec = null; }
    if (P.mic) { try { P.mic.stop(); } catch (e) {} P.mic = null; }
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}

    // consolida o resultado por frase a partir do status por palavra do
    // alinhador (o áudio já acabou → o cap libera o texto inteiro)
    if (P._live && P._live.words.length) {
      if (P._audio) P._audio.ended = true;
      const fin = alignLive();
      P.sentenceResults = P.track.sentences.map(() => null);
      P._live.words.forEach(function (w) {
        if (!P.sentenceResults[w.si]) P.sentenceResults[w.si] = { matched: [] };
        P.sentenceResults[w.si].matched[w.wi] = fin.status[w.gi] === 'good';
      });
      paintLiveWords();
      P._live = null;
    }

    const results = P.sentenceResults.filter(Boolean);
    const totalWords = P.track.sentences.reduce((s, sent) => s + sent.en.split(/\s+/).length, 0);
    const correctWords = results.reduce((s, r) => s + (r.matched ? r.matched.filter(Boolean).length : 0), 0);
    const score = totalWords ? Math.round((correctWords / totalWords) * 100) : 0;

    const st = trackState(P.track.slug);
    const attempts = st.attempts + 1;
    const isNewRecord = score > st.bestScore;

    let unlocked = false;
    if (P.mode === 'ranked') {
      const relaxedMin = Math.max(MIN_SCORE_FLOOR, P.track.minScoreToUnlock - Math.max(0, attempts - RELAX_AFTER_ATTEMPT) * RELAX_STEP);
      const passed = score >= relaxedMin;
      setTrackState(P.track.slug, {
        bestScore: Math.max(st.bestScore, score),
        attempts,
        rankedDone: st.rankedDone || passed,
      });
      unlocked = passed && !st.rankedDone;
      if (passed) markDailyDone();

      // credita o vocabulário falado certo no MESMO pool da home (WordProfile)
      // — decisão de produto: um histórico só por palavra, não importa a fonte.
      // Só sessões Ranqueadas enviam; Casual não tem prova de qualidade de áudio.
      syncWordsToBackend(P.track, P.sentenceResults, score, unlocked);
    }

    renderResult(score, isNewRecord, unlocked, attempts);
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
      console.log('[SHADOW] vocabulário sincronizado:', track.slug, res);
    }).catch(function (err) {
      console.warn('[SHADOW] sync falhou (progresso local preservado):', err.message);
    });
  }

  function renderResult(score, isNewRecord, unlocked, attempts) {
    const body = document.getElementById('shadowPlayerBody');
    const isRanked = P.mode === 'ranked';
    const low = score < 60;

    const recapHtml = P.track.sentences.map((s, si) => {
      const r = P.sentenceResults[si];
      if (!r) return `<span>${escapeHtml(s.en)}</span>`;
      const words = s.en.split(/\s+/).map((w, wi) => {
        const ok = r.matched && r.matched[wi];
        return `<span class="shadow-word is-${ok ? 'good' : 'bad'}">${escapeHtml(w)}</span>`;
      }).join(' ');
      return words;
    }).join(' ');

    let trainingNote = '';
    if (!isRanked) {
      trainingNote = `<p class="shadow-result-training-note">Treino visual — não conta pra progressão. 📊 Para contabilizar de verdade, entra em Ranqueada com fone conectado.</p>`;
    } else if (attempts >= RELAX_TRIES_BEFORE_CASUAL_CTA && !unlocked && score < P.track.minScoreToUnlock) {
      trainingNote = `<p class="shadow-result-training-note">Já são ${attempts} tentativas nesta faixa. Que tal treinar mais um pouco em Casual antes da próxima Ranqueada?</p>`;
    }

    body.innerHTML = `
      <div class="shadow-result-head">
        <div class="shadow-result-score ${low ? 'is-low' : ''}"><b>${score}</b></div>
        ${isNewRecord ? `<div class="shadow-result-record">🏆 novo recorde!</div>` : ''}
        ${isRanked && unlocked ? `<p style="color:var(--sh-good);font-weight:800;margin-top:8px;">✅ próximo texto liberado!</p>` : ''}
      </div>
      ${trainingNote}
      <p class="shadow-recap-title">Seu texto completo</p>
      <div class="shadow-recap-text">${recapHtml}</div>
      <div class="shadow-loot">
        <div class="shadow-loot-item"><b>${isRanked ? '+' + (score >= 70 ? 40 : 20) : '+10'}</b><span>XP</span></div>
        <div class="shadow-loot-item"><b>${P.track.sentences.length}</b><span>frases</span></div>
        <div class="shadow-loot-item"><b>${isRanked ? 'sim' : 'não'}</b><span>conta progresso</span></div>
      </div>
      <div class="shadow-result-actions">
        <button class="shadow-play-btn" id="shadowResultRetry">🔁 outro take</button>
        <button class="shadow-ghost-btn" id="shadowResultBack">← voltar à trilha</button>
      </div>`;

    document.getElementById('shadowResultRetry').addEventListener('click', () => {
      P.sentenceResults = P.track.sentences.map(() => null);
      startLiveSession();
    });
    document.getElementById('shadowResultBack').addEventListener('click', closePlayer);
  }

  // ─── Init ────────────────────────────────────────────────────
  // ─── Modal "Como funciona o Laboratório" ────────────────────────
  function openHowItWorks() {
    const modal = document.getElementById('shadowHowModal');
    if (modal) modal.hidden = false;
  }
  function closeHowItWorks() {
    const modal = document.getElementById('shadowHowModal');
    if (modal) modal.hidden = true;
  }

  function init() {
    renderHub();
    const dailyEl = document.getElementById('shadowDailyTrack');
    if (dailyEl) {
      dailyEl.addEventListener('click', () => {
        if (dailyEl.dataset.slug) openTrack(dailyEl.dataset.slug);
      });
    }
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
  }

  document.addEventListener('DOMContentLoaded', init);

  window.GriloShadowLab = {
    openTrack, closePlayer,
    _computeAlignment: computeAlignment,
  };
})();
