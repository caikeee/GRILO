/* ============================================================
 *  Eco — ENGINE (ouvir a frase → repetir em voz alta)
 *  ============================================================
 *  Sucessor do Laboratório de Shadowing. O aluno não fala mais por
 *  cima do áudio: cada frase é um turno.
 *
 *    OUVIR    a voz do app fala a frase (GriloTTS → /api/tts)
 *    SUA VEZ  o microfone abre sozinho e fecha no silêncio (~1,5 s),
 *             ou no "Terminei"
 *    ANALISAR a gravação vai para /api/voice/transcribe (Whisper) e
 *             a transcrição é alinhada com a frase (GriloVR)
 *    RETORNO  palavra por palavra, com 🔊 nativo × ▶ você
 *
 *  Quem está começando não acerta de primeira, então cada frase tem
 *  uma escada de ajuda:
 *    1ª tentativa  normal
 *    2ª tentativa  mais devagar + leitura em português (ph)
 *    3ª tentativa  por partes, de trás pra frente (backchaining):
 *                  "day" → "single day" → frase inteira
 *    depois disso  a frase entra na rodada de revisão do fim da faixa
 *  "Não te ouvi" (microfone/silêncio) não gasta tentativa.
 *
 *  Pontuação: palavras de conteúdo valem mais que as de ligação (o
 *  reconhecedor engole "the", "a"); passa com 70% do peso.
 *
 *  Separar ouvir de falar acaba com o eco do alto-falante no
 *  microfone, então não há mais calibração nem modo "valendo nota".
 *
 *  A gravação fica só no aparelho (para o ▶ você); ao backend sobem
 *  só a transcrição e o resultado por palavra.
 * ============================================================ */
(function () {
  'use strict';

  const LS_KEY = 'grilo_shadow_progress_v1';
  const MAX_TRIES = 3;
  const PASS_WEIGHT = 0.7;
  const FUNCTION_WEIGHT = 0.4;
  const SLOW_RATE = 0.8;          // menor velocidade que a voz neural aceita bem

  // Microfone: detecção de fala e de fim de fala
  const VOICE_FRAMES_TO_START = 4;  // quadros audíveis seguidos para contar como fala
  const SILENCE_END_MS = 1500;      // silêncio depois da fala que encerra a vez
  const NO_SPEECH_MS = 7000;        // ninguém falou: encerra sem gastar tentativa
  const MAX_TURN_MS = 12000;        // teto de uma gravação

  // Palavras de ligação: valem menos na nota (FUNCTION_WEIGHT)
  const FUNCTION_WORDS = new Set([
    'a', 'an', 'the', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'and', 'or', 'but',
    'is', 'am', 'are', 'was', 'were', 'be', 'it', 'its', 'my', 'your', 'i', 'you',
    'he', 'she', 'we', 'they', 'this', 'that', 'do', 'does', 'did', 'has', 'have',
  ]);

  const KIND_LABEL = {
    aula: n => `Da aula ${String(n).padStart(2, '0')}`,
    novo: () => 'Nova',
    ciencia: () => 'Ciência',
    literatura: (_, src) => `Literatura · ${src}`,
    ditado: () => 'Ditado popular',
  };

  const Shell = window.GriloShell;
  const icon = Shell.icon;
  const escapeHtml = Shell.escapeHtml;

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

  // `rankedDone` mantém o nome antigo: a home (home-today.js) lê esse campo
  // para saber se a faixa foi concluída.
  function trackState(slug) {
    return PROGRESS.tracks[slug] || { bestDominated: 0, attempts: 0, rankedDone: false };
  }

  function setTrackState(slug, patch) {
    PROGRESS.tracks[slug] = Object.assign({}, trackState(slug), patch);
    saveProgress(PROGRESS);
  }

  function isUnlocked(track, order) {
    const i = order.indexOf(track);
    return i <= 0 || !!trackState(order[i - 1].slug).rankedDone;
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
    } catch (e) {}
  }

  function getAuthToken() {
    try { return sessionStorage.getItem('grilo_token'); } catch (e) { return null; }
  }

  function VR() { return window.GriloVR || null; }

  // ─── Áudio do app ─────────────────────────────────────────────
  // GriloTTS procura o MP3 pré-gerado e, sem ele, chama /api/tts (voz
  // Orpheus). Resolve quando a fala termina; o teto de segurança cobre
  // o caso de o navegador nunca disparar o fim (voz nativa sem vozes).
  let speakSeq = 0;

  function speak(text, rate, el) {
    const my = ++speakSeq;
    const words = String(text).split(/\s+/).length;
    const ceiling = (words * 0.6 + 3) * 1000 / (rate || 1);
    if (el) el.classList.add('is-playing');
    return new Promise(resolve => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        if (el) el.classList.remove('is-playing');
        resolve(my === speakSeq);
      };
      setTimeout(finish, ceiling);
      try {
        if (window.GriloTTS) {
          window.GriloTTS.speak(text, { rate: rate || 1, onend: finish }).then(finish, finish);
        } else {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'en-US';
          u.rate = rate || 1;
          u.onend = u.onerror = finish;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        }
      } catch (e) { finish(); }
    });
  }

  function stopSpeech() {
    speakSeq++;
    try { window.GriloTTS ? window.GriloTTS.stop() : window.speechSynthesis.cancel(); } catch (e) {}
  }

  // ─── Avaliação ────────────────────────────────────────────────
  // Palavras como aparecem na tela + quais tokens do avaliador cada uma
  // cobre (contrações viram 2 tokens: "I'm" → "i am").
  function displayMap(text) {
    const vr = VR();
    const words = String(text).split(/\s+/).filter(Boolean);
    let k = 0;
    const map = words.map(w => {
      const n = vr.tokenize(w).length;
      const range = [k, k + n];
      k += n;
      return { w, range };
    });
    return { words: map, tokenCount: k };
  }

  function judge(expected, transcript) {
    const vr = VR();
    const ev = vr.evaluate(expected, [{ transcript, confidence: 0.9 }]);
    let total = 0, got = 0;
    ev.expTokens.forEach((t, i) => {
      const w = FUNCTION_WORDS.has(t) ? FUNCTION_WEIGHT : 1;
      total += w;
      if (ev.matched[i]) got += w;
    });
    const weighted = total ? got / total : 0;
    const okCount = ev.matched.filter(Boolean).length;
    return {
      ev,
      weighted,
      passed: weighted >= PASS_WEIGHT,
      okCount,
      total: ev.expTokens.length,
      heardNothing: !ev.heardTokens.length,
    };
  }

  // Estado de cada palavra da tela a partir do alinhamento por token
  function wordStates(text, result) {
    const dm = displayMap(text);
    if (!result || dm.tokenCount !== result.ev.expTokens.length) {
      return dm.words.map(() => (result ? (result.passed ? 'ok' : '') : ''));
    }
    return dm.words.map(({ range }) => {
      const flags = result.ev.matched.slice(range[0], range[1]);
      if (!flags.length) return 'ok';
      if (flags.every(Boolean)) return 'ok';
      return flags.some(Boolean) ? 'almost' : 'miss';
    });
  }

  // Partes para a 3ª tentativa: blocos de ~3 palavras, praticados do fim
  // para o começo, cada um somando o anterior (backchaining).
  function backchainSteps(text) {
    const words = String(text).split(/\s+/).filter(Boolean);
    if (words.length < 5) return [text];
    const k = Math.ceil(words.length / 3);
    const size = Math.ceil(words.length / k);
    const starts = [];
    for (let i = 0; i < words.length; i += size) starts.push(i);
    return starts.slice().reverse().map(s => words.slice(s).join(' '));
  }

  // ============================================================
  //  HUB
  // ============================================================
  function lessonLabel(t) {
    return t.lesson ? `Aula ${String(t.lesson.num).padStart(2, '0')} · ${t.theme}` : t.theme;
  }

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

    const next = order.find(t => !trackState(t.slug).rankedDone) || order[0];
    const cont = document.getElementById('shadowContinue');
    if (cont && next) {
      const allDone = doneCount === order.length;
      const kinds = [...new Set(next.sentences.map(s => s.kind))].filter(k => k !== 'aula');
      const chips = [`${next.sentences.filter(s => s.kind === 'aula').length} da aula ${String(next.lesson.num).padStart(2, '0')}`]
        .concat(kinds.map(k => ({ novo: 'novas', ciencia: 'ciência', literatura: 'literatura', ditado: 'ditado' }[k])));
      cont.innerHTML = `
        <div class="gs-cont" data-slug="${next.slug}">
          <span class="gs-cont-k">${allDone ? 'Trilha concluída · repetir' : 'Próxima faixa'} · ${escapeHtml(next.level)}</span>
          <h2 class="gs-cont-t">${escapeHtml(next.title)}</h2>
          <span class="gs-cont-m">${next.sentences.length} frases · ${escapeHtml(lessonLabel(next))}</span>
          <div class="gs-cont-chips" aria-hidden="true">${chips.map(c => `<span>${escapeHtml(c)}</span>`).join('')}</div>
          <button class="gs-cont-go" type="button">Ouvir e repetir ${icon('play')}</button>
        </div>`;
      cont.querySelector('.gs-cont').addEventListener('click', () => openTrack(next.slug));
    }

    root.innerHTML = order.map((t, i) => {
      const st = trackState(t.slug);
      const state = st.rankedDone ? 'done' : (isUnlocked(t, order) ? 'available' : 'locked');
      const isCur = t === next && state !== 'done';
      const prev = order[i - 1];
      const sub = state === 'locked' && prev
        ? `domine ${prev.minDominated} frases de ${escapeHtml(prev.title)}`
        : `${t.sentences.length} frases · ${escapeHtml(lessonLabel(t))}`;
      const right = st.bestDominated > 0
        ? `<span class="gs-row-r">melhor<em>${st.bestDominated}/${t.sentences.length}</em></span>`
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
  //  SESSÃO
  // ============================================================
  let P = null;
  let unfitViewport = null;

  function session() { return document.querySelector('#shadowPlayerOverlay .gs-session'); }
  function $(id) { return document.getElementById(id); }

  function openTrack(slug) {
    const track = window.GriloShadow.getTrackBySlug(slug);
    if (!track) return;
    P = {
      track,
      phase: 'intro',
      slow: false,
      queue: [],            // índices das frases a fazer nesta rodada
      review: [],           // frases que vão para a revisão do fim
      inReview: false,
      results: track.sentences.map(() => ({ tries: 0, dominated: false, best: null })),
      mic: null,
      blobUrl: null,
    };
    const overlay = $('shadowPlayerOverlay');
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="gs-session" role="dialog" aria-modal="true" aria-label="Eco — ${escapeHtml(track.title)}">
        <div class="gs-top">
          <button class="gs-x" id="shadowPlayerClose" type="button" aria-label="Fechar">${icon('x')}</button>
          <div class="gs-prog" id="shadowProg" aria-hidden="true">${Shell.progHtml(track.sentences.map(() => 0))}</div>
          <span class="gs-cnt" id="shadowCnt">${track.sentences.length} frases</span>
        </div>
        <div class="gs-body" id="shadowPlayerBody"></div>
        <div class="gs-dock" id="shadowDock"></div>
      </div>`;
    $('shadowPlayerClose').addEventListener('click', requestClose);
    Shell.lockScroll(true);
    unfitViewport = Shell.fitViewport(overlay);
    renderIntro();
  }

  function releaseMic() {
    if (!P) return;
    if (P.recorder && P.recorder.state !== 'inactive') { try { P.recorder.stop(); } catch (e) {} }
    P.recorder = null;
    if (P.mic) { try { P.mic.stop(); } catch (e) {} P.mic = null; }
  }

  function closePlayer() {
    stopSpeech();
    if (P) {
      P.closed = true;
      releaseMic();
      if (P.blobUrl) URL.revokeObjectURL(P.blobUrl);
    }
    if (unfitViewport) { unfitViewport(); unfitViewport = null; }
    Shell.lockScroll(false);
    P = null;
    const overlay = $('shadowPlayerOverlay');
    overlay.hidden = true;
    overlay.innerHTML = '';
    renderHub();
  }

  // No meio da faixa o resultado ainda não foi salvo: confirma antes de sair.
  function requestClose() {
    if (!P || P.phase === 'intro' || P.phase === 'result') { closePlayer(); return; }
    stopSpeech();
    abortTurn();
    Shell.openSheet(session(), {
      tone: 'plain',
      icon: null,
      scrim: true,
      stack: true,
      title: 'Sair desta faixa?',
      html: '<p class="gs-sheet-text gs-muted">O que você treinou nesta rodada ainda não foi salvo.</p>',
      actions: [
        { label: 'Continuar treinando', kind: 'pri', onClick: () => { Shell.closeSheet(session()); runTurn(); } },
        { label: 'Sair da faixa', kind: 'txt', onClick: closePlayer },
      ],
    });
  }

  function setDock(html) { const d = $('shadowDock'); if (d) d.innerHTML = html; }
  function setCount(text) { const el = $('shadowCnt'); if (el) el.textContent = text; }

  function updateProgress() {
    const fracs = P.track.sentences.map((_, i) => {
      const r = P.results[i];
      if (r.dominated) return 1;
      if (r.finished) return 0.5;
      return 0;
    });
    Shell.setProg($('shadowProg'), fracs);
  }

  // ─── Intro da faixa ───────────────────────────────────────────
  function tagHtml(s) {
    const lbl = (KIND_LABEL[s.kind] || KIND_LABEL.novo)(P.track.lesson ? P.track.lesson.num : 0, s.src || '');
    return `<span class="eco-tag is-${s.kind}">${escapeHtml(lbl)}</span>`;
  }

  function renderIntro() {
    P.phase = 'intro';
    const t = P.track;
    const body = $('shadowPlayerBody');
    body.scrollTop = 0;
    body.innerHTML = `
      <span class="gs-kick">Eco · ${escapeHtml(lessonLabel(t))}</span>
      <h2 class="gs-h1">${escapeHtml(t.title)}</h2>
      <p class="gs-p">Ouça cada frase e repita em voz alta. Domine <b>${t.minDominated} de ${t.sentences.length}</b> para liberar a próxima faixa.</p>
      <ol class="eco-loop" aria-label="Como funciona">
        <li><span>${icon('sound')}</span>Ouça</li>
        <li><span>${icon('mic')}</span>Repita</li>
        <li><span>${icon('play')}</span>Compare</li>
      </ol>
      <div class="sh-sents" id="shadowSents">
        ${t.sentences.map((s, i) => `
          <button class="sh-sent" type="button" data-i="${i}">
            <span class="sh-sent-pp">${icon('play')}</span>
            <span class="sh-sent-t"><b>${escapeHtml(s.en)}</b><small>${escapeHtml(s.pt)}</small>${tagHtml(s)}</span>
          </button>`).join('')}
      </div>
      <p class="gs-p eco-note">Errou? Tudo bem: na 2ª tentativa a frase vem mais devagar e com a leitura; na 3ª, por partes.</p>`;
    body.querySelectorAll('.sh-sent').forEach(b => {
      b.addEventListener('click', () => {
        body.querySelectorAll('.sh-sent').forEach(x => x.classList.remove('is-playing'));
        b.classList.add('is-playing');
        speak(t.sentences[+b.dataset.i].en, 1).then(() => b.classList.remove('is-playing'));
      });
    });
    setDock(`<button class="gs-btn is-pri" id="shadowStart" type="button">Começar</button>`);
    $('shadowStart').addEventListener('click', startSession);
  }

  async function ensureMic() {
    if (P.mic && P.mic.running) return true;
    const vr = VR();
    if (!vr || !vr.MicLevelMonitor || !window.MediaRecorder) return false;
    const mic = new vr.MicLevelMonitor();
    try { await mic.start(); } catch (e) { return false; }
    if (!P || P.closed) { mic.stop(); return false; }
    P.mic = mic;
    return true;
  }

  function startSession() {
    stopSpeech();
    P.queue = P.track.sentences.map((_, i) => i);
    P.review = [];
    P.inReview = false;
    P.results = P.track.sentences.map(() => ({ tries: 0, dominated: false, best: null, finished: false }));
    nextSentence();
  }

  function nextSentence() {
    Shell.closeSheet(session());
    updateProgress();
    if (!P.queue.length) {
      if (!P.inReview && P.review.length) { startReview(); return; }
      finishSession();
      return;
    }
    P.idx = P.queue.shift();
    P.steps = null;
    P.stepIdx = 0;
    runTurn();
  }

  // Rodada de revisão: as frases que não passaram voltam uma vez, devagar.
  function startReview() {
    P.inReview = true;
    P.queue = P.review.slice();
    P.review = [];
    const body = $('shadowPlayerBody');
    body.innerHTML = `
      <div class="gs-center">
        <span class="eco-review-ico" aria-hidden="true">${icon('replay')}</span>
        <h2 class="gs-h2">Rodada de revisão</h2>
        <p class="gs-p">${P.queue.length === 1 ? 'Uma frase volta' : `${P.queue.length} frases voltam`} para mais uma chance — agora mais devagar e com a leitura.</p>
      </div>`;
    setCount('revisão');
    setDock(`<button class="gs-btn is-pri" id="shadowGoReview" type="button">Bora</button>`);
    $('shadowGoReview').addEventListener('click', nextSentence);
  }

  // ─── Turno de uma frase ───────────────────────────────────────
  function currentText() {
    const s = P.track.sentences[P.idx];
    return P.steps ? P.steps[P.stepIdx] : s.en;
  }

  function tryNumber() { return P.results[P.idx].tries + 1; }

  function renderTurnScreen(text) {
    const s = P.track.sentences[P.idx];
    const n = P.track.sentences.length;
    const helping = P.inReview || tryNumber() >= 2;
    const partial = P.steps && P.stepIdx < P.steps.length - 1;
    setCount(P.inReview ? 'revisão' : `${P.idx + 1}/${n}`);

    const body = $('shadowPlayerBody');
    body.scrollTop = 0;
    body.innerHTML = `
      <div class="eco-head">
        <span class="gs-kick">${P.inReview ? 'Revisão' : `Frase ${P.idx + 1} de ${n}`}${partial ? ' · por partes' : ''}</span>
        ${tagHtml(s)}
      </div>
      <div class="eco-card">
        <p class="eco-phrase" id="ecoPhrase">${renderPhraseHtml(s.en, text)}</p>
        <p class="eco-pt">${escapeHtml(s.pt)}</p>
        ${helping && s.ph ? `<p class="eco-ph">${escapeHtml(s.ph)}</p>` : ''}
      </div>
      <div class="eco-stage" id="ecoStage"></div>
      <div class="eco-tries" aria-label="Tentativas">${Array.from({ length: MAX_TRIES }, (_, i) =>
        `<i class="${i < P.results[P.idx].tries ? 'is-used' : ''}"></i>`).join('')}<span>${P.inReview ? 'última chance' : `tentativa ${Math.min(tryNumber(), MAX_TRIES)} de ${MAX_TRIES}`}</span></div>`;
  }

  // Na prática por partes, só o trecho da vez fica aceso.
  function renderPhraseHtml(full, focus) {
    const words = full.split(/\s+/);
    const focusWords = focus.split(/\s+/).length;
    const from = words.length - focusWords;
    return words.map((w, i) => `<span class="${i < from ? 'is-off' : ''}">${escapeHtml(w)}</span>`).join(' ');
  }

  function paintPhrase(states, focusFrom) {
    const spans = document.querySelectorAll('#ecoPhrase span');
    spans.forEach((sp, i) => {
      if (i < focusFrom) return;
      const st = states[i - focusFrom];
      sp.className = st ? `is-${st}` : '';
    });
  }

  function setStage(kind, extra) {
    const st = $('ecoStage');
    if (!st) return;
    if (kind === 'listen') {
      st.innerHTML = `
        <button class="gs-ah eco-ah" id="ecoPlay" type="button" aria-label="Ouvir de novo">${icon('sound')}</button>
        <span class="eco-stage-cap">Ouça${P.slow || tryNumber() >= 2 || P.inReview ? ' · mais devagar' : ''}</span>`;
    } else if (kind === 'turn') {
      st.innerHTML = `
        <span class="eco-mic" id="ecoMic"><i id="ecoMicLevel"></i>${icon('mic')}</span>
        <span class="eco-stage-cap is-turn">Sua vez — fale a frase</span>`;
    } else if (kind === 'eval') {
      st.innerHTML = `<span class="eco-spinner" aria-hidden="true"></span><span class="eco-stage-cap">Analisando…</span>`;
    } else if (kind === 'error') {
      st.innerHTML = `<span class="eco-stage-cap">${extra || ''}</span>`;
    }
  }

  function rateForTurn() {
    return (P.slow || tryNumber() >= 2 || P.inReview) ? SLOW_RATE : 1;
  }

  async function runTurn() {
    if (!P || P.closed) return;
    P.phase = 'listen';
    const text = currentText();
    renderTurnScreen(text);
    setStage('listen');
    setDock(`
      <button class="gs-btn is-sec is-ic" id="ecoSlow" type="button" aria-pressed="${P.slow}" aria-label="Mais devagar">🐢</button>
      <button class="gs-btn is-pri" type="button" disabled>${icon('sound')}Ouvindo…</button>`);
    $('ecoSlow').addEventListener('click', () => { P.slow = !P.slow; runTurn(); });
    $('ecoPlay').addEventListener('click', () => runTurn());

    const turnId = (P.turnId = (P.turnId || 0) + 1);
    const finished = await speak(text, rateForTurn(), $('ecoPlay'));
    if (!P || P.closed || P.turnId !== turnId || !finished) return;
    startListening(turnId);
  }

  function abortTurn() {
    if (!P) return;
    P.turnId = (P.turnId || 0) + 1;
    if (P.recorder && P.recorder.state !== 'inactive') {
      P.recorder.onstop = null;
      try { P.recorder.stop(); } catch (e) {}
    }
    P.recorder = null;
    if (P.mic) P.mic.onLevel = null;
  }

  function pickMime() {
    const c = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'];
    return c.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
  }

  async function startListening(turnId) {
    const ok = await ensureMic();
    if (!P || P.closed || P.turnId !== turnId) return;
    if (!ok) { micUnavailable(); return; }

    P.phase = 'turn';
    setStage('turn');
    setDock(`
      <button class="gs-btn is-sec is-ic" id="ecoReplay" type="button" aria-label="Ouvir de novo">${icon('sound')}</button>
      <button class="gs-btn is-rec is-playing" id="ecoDone" type="button"><span class="gs-wave" aria-hidden="true" style="margin:0"><i></i><i></i><i></i><i></i><i></i></span>Terminei</button>`);

    const mime = pickMime();
    let recorder;
    try { recorder = mime ? new MediaRecorder(P.mic.stream, { mimeType: mime }) : new MediaRecorder(P.mic.stream); }
    catch (e) { micUnavailable(); return; }
    P.recorder = recorder;
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };

    const startedAt = Date.now();
    let voiced = 0, speechStarted = false, lastVoiceAt = 0, stopped = false;
    const levelEl = $('ecoMicLevel');

    const stop = (reason) => {
      if (stopped) return;
      stopped = true;
      if (P && P.mic) P.mic.onLevel = null;
      recorder.onstop = () => {
        if (!P || P.closed || P.turnId !== turnId) return;
        const type = (recorder.mimeType || mime || 'audio/webm').split(';')[0];
        const blob = new Blob(chunks, { type });
        if (P.blobUrl) URL.revokeObjectURL(P.blobUrl);
        P.blobUrl = URL.createObjectURL(blob);
        if (reason === 'no-speech' || !speechStarted) { noSpeech(); return; }
        evaluateTurn(blob, type, turnId);
      };
      try { recorder.stop(); } catch (e) { noSpeech(); }
    };

    P.mic.onLevel = (level, audible) => {
      if (levelEl) levelEl.style.transform = `scale(${1 + Math.min(1, level) * 0.9})`;
      const now = Date.now();
      if (audible) {
        voiced++;
        if (voiced >= VOICE_FRAMES_TO_START) { speechStarted = true; lastVoiceAt = now; }
      } else {
        voiced = 0;
      }
      if (speechStarted && now - lastVoiceAt > SILENCE_END_MS) stop('silence');
      else if (!speechStarted && now - startedAt > NO_SPEECH_MS) stop('no-speech');
      else if (now - startedAt > MAX_TURN_MS) stop('max');
    };

    $('ecoDone').addEventListener('click', () => { speechStarted = speechStarted || Date.now() - startedAt > 600; stop('button'); });
    $('ecoReplay').addEventListener('click', () => { abortTurn(); runTurn(); });
    recorder.start(100);
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1] || '');
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  async function transcribe(blob, type) {
    const token = getAuthToken();
    if (!token) return { error: 'auth' };
    try {
      const audio_base64 = await blobToBase64(blob);
      const r = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        // Sem a frase esperada no contexto: dar a resposta ao Whisper o
        // faria "ouvir" a frase certa mesmo quando ela não foi dita.
        body: JSON.stringify({ audio_base64, mime_type: type }),
      });
      if (!r.ok) return { error: 'http' };
      const d = await r.json();
      if (d.fallback) return { error: d.reason || 'fallback' };
      return { transcript: d.transcript || '' };
    } catch (e) {
      return { error: 'network' };
    }
  }

  async function evaluateTurn(blob, type, turnId) {
    P.phase = 'eval';
    setStage('eval');
    setDock(`<button class="gs-btn is-pri" type="button" disabled>Analisando…</button>`);
    const res = await transcribe(blob, type);
    if (!P || P.closed || P.turnId !== turnId) return;
    if (res.error) { transcribeFailed(); return; }

    const text = currentText();
    const result = judge(text, res.transcript);
    if (result.heardNothing) { noSpeech(); return; }

    const s = P.track.sentences[P.idx];
    const full = !P.steps || P.stepIdx === P.steps.length - 1;
    const focusFrom = s.en.split(/\s+/).length - text.split(/\s+/).length;
    paintPhrase(wordStates(text, result), focusFrom);

    if (!full) {
      // Prática por partes: não gasta tentativa — mostra o resultado e segue.
      setStage('error', result.passed ? 'Isso! Agora um pedaço maior.' : 'Boa. Agora um pedaço maior.');
      setTimeout(() => { if (P && P.turnId === turnId) { P.stepIdx++; runTurn(); } }, 1400);
      return;
    }

    const r = P.results[P.idx];
    r.tries++;
    if (!r.best || result.weighted > r.best.weighted) r.best = result;
    if (result.passed) {
      r.dominated = true;
      r.finished = true;
      updateProgress();
      showFeedback('pass', result);
    } else if (!P.inReview && r.tries < MAX_TRIES) {
      showFeedback('retry', result);
    } else {
      r.finished = true;
      if (!P.inReview) P.review.push(P.idx);
      updateProgress();
      showFeedback('later', result);
    }
  }

  function compareButtons() {
    return `
      <div class="eco-compare">
        <button class="gs-chipbtn" type="button" data-cmp="native">${icon('sound')}Nativo</button>
        <button class="gs-chipbtn" type="button" data-cmp="you"${P.blobUrl ? '' : ' disabled'}>${icon('play')}Você</button>
      </div>`;
  }

  function bindCompare(sheet) {
    const s = P.track.sentences[P.idx];
    const nat = sheet.querySelector('[data-cmp="native"]');
    const you = sheet.querySelector('[data-cmp="you"]');
    if (nat) nat.addEventListener('click', () => speak(s.en, rateForTurn()));
    if (you && P.blobUrl) {
      you.addEventListener('click', () => {
        stopSpeech();
        try { new Audio(P.blobUrl).play(); } catch (e) {}
      });
    }
  }

  function missedWordsHtml(text, result) {
    const words = text.split(/\s+/);
    const states = wordStates(text, result);
    const missed = words.filter((_, i) => states[i] && states[i] !== 'ok').slice(0, 2);
    return missed.map(w => `<b>${escapeHtml(w.replace(/[.,!?;:]+$/, ''))}</b>`).join(' e ');
  }

  function showFeedback(kind, result) {
    const s = P.track.sentences[P.idx];
    const count = `${result.okCount} de ${result.total} palavras claras`;
    const tip = result.ev.brPatterns && result.ev.brPatterns[0];
    const tipHtml = tip ? `<p class="gs-sheet-text gs-muted eco-tip">💡 ${escapeHtml(tip.tip)}</p>` : '';
    const missed = missedWordsHtml(s.en, result);
    const nextTry = P.results[P.idx].tries + 1;
    const willChunk = nextTry === MAX_TRIES && backchainSteps(s.en).length > 1;

    let opts;
    if (kind === 'pass') {
      opts = {
        tone: 'good',
        title: P.results[P.idx].tries === 1 && !P.inReview ? 'Isso! De primeira.' : 'Isso! Frase dominada.',
        html: `<p class="gs-sheet-text">${count}.</p>${compareButtons()}`,
        actions: [{ label: P.queue.length ? 'Próxima frase' : 'Continuar', kind: 'pri', id: 'ecoNext', onClick: nextSentence }],
      };
    } else if (kind === 'retry') {
      opts = {
        tone: 'warn',
        title: 'Quase lá',
        html: `<p class="gs-sheet-text">${count}.${missed ? ` Repare em ${missed}.` : ''}</p>${tipHtml}
          <p class="gs-sheet-text gs-muted">${willChunk ? 'Na próxima, vamos por partes.' : 'Na próxima, mais devagar e com a leitura.'}</p>${compareButtons()}`,
        actions: [
          { label: 'Tentar de novo', kind: 'pri', icon: 'mic', id: 'ecoRetry', onClick: () => {
            Shell.closeSheet(session());
            if (willChunk) { P.steps = backchainSteps(s.en); P.stepIdx = 0; }
            runTurn();
          } },
          { label: 'Pular', kind: 'txt', onClick: () => {
            const r = P.results[P.idx];
            r.finished = true;
            if (!P.inReview) P.review.push(P.idx);
            nextSentence();
          } },
        ],
      };
    } else {
      opts = {
        tone: 'plain',
        icon: null,
        title: P.inReview ? 'Fica para a próxima rodada' : 'Essa volta no fim',
        html: `<p class="gs-sheet-text">${count}. ${P.inReview ? 'Ela continua na sua trilha para treinar de novo.' : 'Sem stress — ela entra na rodada de revisão.'}</p>${tipHtml}${compareButtons()}`,
        actions: [{ label: 'Seguir', kind: 'pri', id: 'ecoNext', onClick: nextSentence }],
      };
    }
    P.phase = 'feedback';
    const sheet = Shell.openSheet(session(), opts);
    bindCompare(sheet);
  }

  function noSpeech() {
    if (!P || P.closed) return;
    P.phase = 'feedback';
    const sheet = Shell.openSheet(session(), {
      tone: 'warn',
      title: 'Não te ouvi',
      html: '<p class="gs-sheet-text">Fale um pouco mais perto do microfone. Essa não contou como tentativa.</p>',
      actions: [{ label: 'Tentar de novo', kind: 'pri', icon: 'mic', id: 'ecoRetry', onClick: () => { Shell.closeSheet(session()); runTurn(); } }],
    });
    return sheet;
  }

  function micUnavailable() {
    if (!P || P.closed) return;
    P.phase = 'feedback';
    Shell.openSheet(session(), {
      tone: 'warn',
      title: 'Sem acesso ao microfone',
      html: '<p class="gs-sheet-text">Libere o microfone para este site nas configurações do navegador e tente de novo.</p>',
      actions: [
        { label: 'Tentar de novo', kind: 'pri', onClick: () => { Shell.closeSheet(session()); runTurn(); } },
        { label: 'Sair', kind: 'txt', onClick: closePlayer },
      ],
    });
  }

  function transcribeFailed() {
    if (!P || P.closed) return;
    P.phase = 'feedback';
    Shell.openSheet(session(), {
      tone: 'warn',
      title: 'Não consegui analisar agora',
      html: '<p class="gs-sheet-text">A conexão falhou no meio do caminho. Essa não contou como tentativa.</p>',
      actions: [{ label: 'Tentar de novo', kind: 'pri', onClick: () => { Shell.closeSheet(session()); runTurn(); } }],
    });
  }

  // ─── Resultado ────────────────────────────────────────────────
  function countRing(done, total, goal) {
    const R = 64, C = 2 * Math.PI * R;
    const tone = Shell.tone(done, goal);
    return `
      <div class="gs-rring is-${tone}" role="img" aria-label="${done} de ${total} frases dominadas">
        <svg viewBox="0 0 150 150" aria-hidden="true">
          <circle class="gs-rring-track" cx="75" cy="75" r="${R}"/>
          <circle class="gs-rring-fill" cx="75" cy="75" r="${R}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - done / total)).toFixed(1)}"/>
        </svg>
        <b>${done}/${total}<small>dominadas</small></b>
      </div>`;
  }

  function finishSession() {
    stopSpeech();
    releaseMic();
    P.phase = 'result';
    const t = P.track;
    const n = t.sentences.length;
    const dominated = P.results.filter(r => r.dominated).length;
    const st = trackState(t.slug);
    const passed = dominated >= t.minDominated;
    const order = window.GriloShadow.getTrackOrder();
    const nextT = order[order.indexOf(t) + 1] || null;
    const unlocked = passed && !st.rankedDone && !!nextT;
    setTrackState(t.slug, {
      bestDominated: Math.max(st.bestDominated || 0, dominated),
      attempts: (st.attempts || 0) + 1,
      rankedDone: st.rankedDone || passed,
    });
    markDailyDone();
    Shell.setProg($('shadowProg'), t.sentences.map(() => 1));
    setCount('fim');

    const tone = Shell.tone(dominated, t.minDominated);
    const title = tone === 'good' ? (unlocked ? 'Faixa dominada!' : 'Mandou bem!')
      : tone === 'warn' ? 'Quase lá!' : 'Primeira rodada feita';
    const sub = passed
      ? (unlocked ? `Próxima faixa liberada: <b>${escapeHtml(nextT.title)}</b>.` : 'Você bateu a meta desta faixa.')
      : `Domine <b>${t.minDominated}</b> para liberar a próxima — falta${t.minDominated - dominated > 1 ? 'm' : ''} <b>${t.minDominated - dominated}</b>.`;

    const body = $('shadowPlayerBody');
    body.scrollTop = 0;
    body.innerHTML = `
      <div class="gs-center">
        ${countRing(dominated, n, t.minDominated)}
        <h2 class="gs-h2">${title}</h2>
        <p class="gs-p">${sub}</p>
        <span class="gs-xp" id="shadowXp" hidden></span>
      </div>
      <span class="gs-lbl sh-frs-title">Suas frases · toque para ouvir de novo</span>
      <div class="sh-frs">${t.sentences.map((s, i) => {
        const r = P.results[i];
        return `
          <button class="sh-fr" type="button" data-say="${i}">
            <span class="sh-fr-sc is-${r.dominated ? 'good' : 'neutral'}">${r.dominated ? icon('check') : icon('replay')}</span>
            <b>${escapeHtml(s.en)}</b><span class="sh-fr-pp">${icon('sound')}</span>
          </button>`;
      }).join('')}</div>`;
    body.querySelectorAll('[data-say]').forEach(b => b.addEventListener('click', () => speak(t.sentences[+b.dataset.say].en, 1)));

    const goNext = passed && nextT;
    setDock(`
      <button class="gs-btn is-sec" id="shadowBack" type="button">Trilha</button>
      <button class="gs-btn is-pri" id="shadowAgain" type="button">${goNext ? 'Próxima faixa' : 'Treinar de novo'}</button>`);
    $('shadowBack').addEventListener('click', closePlayer);
    $('shadowAgain').addEventListener('click', () => {
      if (goNext) { const slug = nextT.slug; closePlayer(); openTrack(slug); }
      else startSession();
    });

    syncToBackend(t, dominated, unlocked);
  }

  // Credita o vocabulário falado certo no mesmo pool da home (WordProfile)
  // e as frases dominadas (ShadowLabPhrase) — endpoint do antigo Shadowing.
  function syncToBackend(track, dominated, unlockedNext) {
    const token = getAuthToken();
    if (!token) return;
    const words = [];
    const sentences = [];
    track.sentences.forEach((s, i) => {
      const r = P.results[i];
      if (r.best) r.best.ev.expTokens.forEach((w, k) => words.push({ word: w, correct: !!r.best.ev.matched[k] }));
      sentences.push({ index: i, en: s.en, all_correct: r.dominated });
    });
    fetch(`/api/shadowing/tracks/${encodeURIComponent(track.slug)}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        score: Math.round((dominated / track.sentences.length) * 100),
        words,
        sentences,
        unlocked_next: !!unlockedNext,
      }),
    }).then(r => (r.ok ? r.json() : null)).then(res => {
      const xp = $('shadowXp');
      if (xp && res && res.xp_earned) { xp.textContent = `ganhou +${res.xp_earned} XP`; xp.hidden = false; }
    }).catch(err => console.warn('[ECO] sync falhou (progresso local preservado):', err && err.message));
  }

  // ─── Modal "Como funciona" ────────────────────────────────────
  function setHowOpen(open) {
    const modal = $('shadowHowModal');
    if (modal) modal.hidden = !open;
  }

  function init() {
    renderHub();
    const bind = (id, fn) => { const el = $(id); if (el) el.addEventListener('click', fn); };
    bind('shadowHowItWorksBtn', () => setHowOpen(true));
    bind('shadowHowClose', () => setHowOpen(false));
    bind('shadowHowGotIt', () => setHowOpen(false));
    const howModal = $('shadowHowModal');
    if (howModal) howModal.addEventListener('click', e => { if (e.target === howModal) setHowOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && P) requestClose(); });
    openFromUrl();
  }

  // Link direto: shadowing.html?faixa=<slug> (destino do "Treino de hoje"
  // da home). Faixa trancada não abre — o aluno cai no hub.
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

  window.GriloShadowLab = { openTrack, closePlayer, _judge: judge, _backchainSteps: backchainSteps };
})();
