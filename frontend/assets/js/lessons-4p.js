/* ============================================================
 *  Lessons 4 Pontas — ENGINE (piloto)
 *  ============================================================
 *  Player do novo sistema de lições: cada aula tem um escopo
 *  (8 palavras + 5 frases) que passa pelas 4 pontas:
 *
 *    👁 VER      — checkpoints de identificação nas seções
 *    👂 OUVIR    — áudio sem texto + compreensão
 *    ✍ ESCREVER — ditado (palavras) e tradução digitada (frases)
 *    🎙 FALAR    — reconhecimento de voz (GriloVR)
 *
 *  Escada por item: escreveu certo → APRENDIDA (entra no vocabulário)
 *                   + falou + ouviu-e-entendeu → DOMINADA
 *
 *  Gate A1→A2 (decisão 2026-07-07): completar as 20 aulas do
 *  bloco (chegar ao recap) — itens dominados são métrica de
 *  qualidade, não trava de promoção.
 *
 *  Dependências (já carregadas na lessons.html):
 *    - lessons-4p-data.js   → window.Grilo4P.LESSONS / .GROUPS
 *    - voice-recognition-utils.js → window.GriloVR (fuzzy match, evaluate)
 *  TTS usa window._griloSpeak se disponível (voz selecionada), senão cai em
 *  speechSynthesis puro — a trilha clássica não é dependência obrigatória.
 *
 *  Persistência do piloto: localStorage (sem backend).
 * ============================================================ */
(function () {
  'use strict';

  const LS_KEY = 'grilo4p_progress_v1';
  const MAX_WRITE_ATTEMPTS = 3;
  const MAX_SPEAK_ATTEMPTS = 3;

  window.Grilo4P = window.Grilo4P || {};

  // ─── Utils ───────────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function VR() { return window.GriloVR || null; }

  function norm(w) {
    const vr = VR();
    if (vr && vr.normalizeWord) return vr.normalizeWord(w);
    return String(w || '').toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, '').trim();
  }

  function tokenize(s) {
    const vr = VR();
    if (vr && vr.tokenize) return vr.tokenize(s);
    return String(s || '').toLowerCase().split(/\s+/).map(norm).filter(Boolean);
  }

  function editDistance(a, b) {
    const vr = VR();
    if (vr && vr.editDistance) return vr.editDistance(a, b);
    if (a === b) return 0;
    return Math.max(a.length, b.length); // fallback grosseiro: só igualdade exata
  }

  // rate só é passado no modo "devagar" (🐢): aí vai direto ao GriloTTS,
  // que toca o MP3 pré-gerado com playbackRate e o tom preservado.
  function speak(text, btnEl, rate) {
    if (rate && window.GriloTTS) {
      window.GriloTTS.speak(text, {
        rate,
        onstart: btnEl ? () => btnEl.classList.add('is-playing') : null,
        onend: btnEl ? () => btnEl.classList.remove('is-playing') : null,
      });
      return;
    }
    if (typeof window._griloSpeak === 'function') {
      window._griloSpeak(text, btnEl || null);
      return;
    }
    if (!('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'en-US';
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    } catch (e) { /* sem TTS, segue sem áudio */ }
  }

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function shuffleWithCorrect(options, correctIdx) {
    const idxs = options.map((_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    return {
      options: idxs.map(i => options[i]),
      correct: idxs.indexOf(correctIdx),
    };
  }

  // ─── Progresso (localStorage) ────────────────────────────────
  function loadProgress() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function saveProgress(p) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch (e) { /* quota/priv */ }
  }

  let progress = loadProgress();

  function lessonProg(slug) {
    if (!progress[slug]) progress[slug] = { items: {}, completedAt: null };
    if (!progress[slug].items) progress[slug].items = {};
    return progress[slug];
  }

  function itemKey(en) { return tokenize(en).join(' '); }

  function itemState(slug, en) {
    const lp = lessonProg(slug);
    const k = itemKey(en);
    if (!lp.items[k]) lp.items[k] = { heardOk: false, writtenOk: false, spokenOk: false };
    return lp.items[k];
  }

  function markSkill(slug, en, skill) {
    const st = itemState(slug, en);
    if (skill === 'heard') st.heardOk = true;
    if (skill === 'written') st.writtenOk = true;
    if (skill === 'spoken') st.spokenOk = true;
    saveProgress(progress);
  }

  function itemStatus(st) {
    if (st.writtenOk && st.heardOk && st.spokenOk) return 'dominada';
    if (st.writtenOk) return 'aprendida';
    return 'nova';
  }

  // ─── Retomada: onde o aluno parou dentro da aula ─────────────
  // Só o estado das 4 pontas era salvo; a posição no roteiro vivia em
  // memória (S.idx), então qualquer queda — PC desligado, aba fechada,
  // navegador crashado — jogava o aluno de volta na capa e ele refazia
  // a aula inteira. Aqui gravamos um marcador leve por aula.
  //
  // `stepFingerprint` protege contra o roteiro mudar sob um marcador
  // antigo (aula editada, item novo no escopo): se a assinatura não
  // bate, o marcador é descartado e a aula recomeça do zero.
  function stepFingerprint(lesson) {
    return [
      lesson.sections.length,
      (lesson.sections || []).reduce((n, s) => n + ((s.checkpoint || []).length), 0),
      lesson.scope.words.length,
      lesson.scope.phrases.length,
    ].join('.');
  }

  function saveCheckpoint(lesson, idx, totalSteps) {
    const lp = lessonProg(lesson.slug);
    // O recap é o último passo: chegou lá, a aula acabou — não há o que retomar.
    if (idx >= totalSteps - 1) {
      delete lp.resume;
    } else if (idx <= 0) {
      delete lp.resume; // ainda na capa: retomar não economiza nada
    } else {
      lp.resume = {
        idx,
        total: totalSteps,
        fp: stepFingerprint(lesson),
        at: new Date().toISOString(),
      };
    }
    saveProgress(progress);
  }

  function readCheckpoint(lesson, totalSteps) {
    const r = lessonProg(lesson.slug).resume;
    if (!r || typeof r.idx !== 'number') return null;
    if (r.fp !== stepFingerprint(lesson)) return null;   // roteiro mudou
    if (r.idx <= 0 || r.idx >= totalSteps - 1) return null;
    return r;
  }

  function clearCheckpoint(slug) {
    const lp = lessonProg(slug);
    if (lp.resume) { delete lp.resume; saveProgress(progress); }
  }

  function lessonSummary(lesson) {
    const all = lesson.scope.words.concat(lesson.scope.phrases);
    let aprendidas = 0, dominadas = 0;
    all.forEach(it => {
      const s = itemStatus(itemState(lesson.slug, it.en));
      if (s === 'dominada') { dominadas++; aprendidas++; }
      else if (s === 'aprendida') aprendidas++;
    });
    return { total: all.length, aprendidas, dominadas, completedAt: lessonProg(lesson.slug).completedAt };
  }

  // API pública — futura integração com a home / backend
  window.Grilo4P.getVocabSummary = function () {
    const out = { words: [], phrases: [] };
    (window.Grilo4P.LESSONS || []).forEach(lesson => {
      lesson.scope.words.forEach(w => {
        const s = itemStatus(itemState(lesson.slug, w.en));
        if (s !== 'nova') out.words.push({ en: w.en, pt: w.pt, status: s, lesson: lesson.slug });
      });
      lesson.scope.phrases.forEach(p => {
        const s = itemStatus(itemState(lesson.slug, p.en));
        if (s !== 'nova') out.phrases.push({ en: p.en, pt: p.pt, status: s, lesson: lesson.slug });
      });
    });
    return out;
  };

  // ─── Sincronização com o backend (alimenta o painel CEFR da home) ──
  function getAuthToken() {
    try { return sessionStorage.getItem('grilo_token'); } catch (e) { return null; }
  }

  // Envia o escopo da aula (estado de cada ponta) ao backend.
  // O servidor faz merge monotônico e soma no /api/user/stats. Tolerante a
  // falha: se não houver token ou a rede cair, o progresso local não se perde.
  //
  // `opts.completed` distingue as duas chamadas:
  //   true  → recap: credita XP de conclusão e fecha o gate da aula
  //   false → checkpoint parcial (meio da aula): só sobe as pontas já
  //           conquistadas + onde o aluno parou, para a retomada sobreviver
  //           a troca de máquina / limpeza de cache.
  function syncLessonToBackend(lesson, opts) {
    const token = getAuthToken();
    if (!token) return; // deslogado (ex.: piloto aberto direto) — só local

    const o = opts || {};
    const completed = o.completed !== false;

    const build = (arr, type) => arr.map(it => {
      const st = itemState(lesson.slug, it.en);
      return {
        item_type: type, en: it.en, pt: it.pt,
        written_ok: !!st.writtenOk, heard_ok: !!st.heardOk, spoken_ok: !!st.spokenOk,
      };
    });
    const resume = lessonProg(lesson.slug).resume || null;
    const payload = {
      lesson_group: lesson.group || null,
      completed,
      resume_step: completed ? null : (resume ? resume.idx : null),
      resume_total: completed ? null : (resume ? resume.total : null),
      resume_fp: completed ? null : (resume ? resume.fp : null),
      items: build(lesson.scope.words, 'word').concat(build(lesson.scope.phrases, 'phrase')),
    };

    return fetch(`/api/scope4p/lessons/${encodeURIComponent(lesson.slug)}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(payload),
      // Checkpoint parcial pode sair durante o unload da página: keepalive
      // deixa o browser terminar o envio mesmo com a aba fechando.
      keepalive: !completed,
    }).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(res => {
      // Marca como sincronizada para não reenviar à toa (só na conclusão —
      // um parcial não "fecha" a aula e precisa continuar reenviando).
      try {
        if (completed) {
          const lp = lessonProg(lesson.slug);
          lp.syncedAt = new Date().toISOString();
          saveProgress(progress);
        }
      } catch (e) {}
      console.log('[4P] aula sincronizada:', lesson.slug, completed ? '(concluída)' : '(parcial)', res);
      return res;
    }).catch(err => {
      console.warn('[4P] sync falhou (progresso local preservado):', err.message);
    });
  }

  // ─── Crédito de palavras via frases ──────────────────────────
  // Palavras do escopo ganham "falou"/"ouviu"/"escreveu" quando a
  // frase que as contém passa na respectiva ponta.
  function scopeWordsInPhrase(lesson, phraseEn) {
    const tokens = new Set(tokenize(phraseEn));
    return lesson.scope.words.filter(w => tokens.has(norm(w.en)));
  }

  function creditWordsViaPhrase(lesson, phraseEn, skill, matchedTokens) {
    scopeWordsInPhrase(lesson, phraseEn).forEach(w => {
      if (matchedTokens && !matchedTokens.has(norm(w.en))) return;
      markSkill(lesson.slug, w.en, skill);
    });
  }

  // ─── Comparadores (ponta ESCREVER) ───────────────────────────
  // Palavra: exato (normalizado) passa; 1 letra de distância = "quase"
  // (pede pra corrigir, não conta como erro). Frase: alinhamento
  // palavra-a-palavra com tolerância fuzzy do GriloVR.
  function compareWord(input, expected) {
    const a = norm(input), b = norm(expected);
    if (!a) return 'empty';
    if (a === b) return 'pass';
    if (editDistance(a, b) <= 1) return 'almost';
    return 'fail';
  }

  function comparePhrase(input, expected) {
    const expTokens = tokenize(expected);
    const gotTokens = tokenize(input);
    const vr = VR();
    let matchedFlags;
    if (vr && vr.wordAlign) {
      const align = vr.wordAlign(expTokens, gotTokens);
      matchedFlags = expTokens.map((_, i) => align.matched[i] >= 0);
    } else {
      matchedFlags = expTokens.map((t, i) => gotTokens[i] === t);
    }
    const correct = matchedFlags.filter(Boolean).length;
    return {
      expTokens,
      matchedFlags,
      pass: correct === expTokens.length && gotTokens.length <= expTokens.length + 1,
      correct,
    };
  }

  // ─── Reconhecimento de voz (ponta FALAR) ─────────────────────
  function speechSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  let _rec = null;

  function stopListening() {
    if (_rec) { try { _rec.abort(); } catch (e) {} _rec = null; }
  }

  function startListening(onResult, onError) {
    stopListening();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { onError('unsupported'); return; }
    try { window.GriloTTS ? window.GriloTTS.stop() : window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    const rec = new SR();
    _rec = rec;
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    let got = false;
    rec.onresult = function (event) {
      got = true;
      const vr = VR();
      const alts = vr && vr.extractAlternatives
        ? vr.extractAlternatives(event)
        : [{ transcript: (event.results[0] && event.results[0][0] && event.results[0][0].transcript) || '', confidence: 0 }];
      onResult(alts);
    };
    rec.onerror = function (e) { got = true; onError(e && e.error ? e.error : 'error'); };
    rec.onend = function () { if (!got) onError('no-speech'); _rec = null; };
    try { rec.start(); } catch (e) { onError('start-failed'); }
  }

  // ─── Casco comum (session-shell.js) ──────────────────────────
  // A home carrega este arquivo só pela API de dados; sem o casco o player
  // não abre, mas o módulo precisa carregar sem quebrar.
  const Shell = window.GriloShell || {};
  const icon = name => (Shell.icon ? Shell.icon(name) : '');
  const SLOW_RATE = 0.7;

  // ─── Estado do player ────────────────────────────────────────
  let S = null; // sessão da aula aberta
  let unfitViewport = null;

  const PHASES = [
    { id: 'teoria',   icon: '📖', label: 'Aula' },
    { id: 'checar',   icon: '👁', label: 'Checkpoints' },
    { id: 'escrever', icon: '✍️', label: 'Escrever' },
    { id: 'falar',    icon: '🎙', label: 'Falar' },
    { id: 'recap',    icon: '🏁', label: 'Fecho' },
  ];

  function phaseOfStep(step) {
    switch (step.t) {
      case 'cover':
      case 'theory':       return 'teoria';
      case 'check':        return 'checar';
      case 'write-word':
      case 'write-phrase': return 'escrever';
      case 'listen-speak': return 'falar';
      case 'recap':        return 'recap';
      case 'bridge':       return step.variant === 'write' ? 'escrever' : 'falar';
    }
    return 'teoria';
  }

  function buildSteps(lesson) {
    const steps = [{ t: 'cover' }];
    lesson.sections.forEach((sec, si) => {
      steps.push({ t: 'theory', si });
      (sec.checkpoint || []).forEach((_, ci) => steps.push({ t: 'check', si, ci }));
    });
    steps.push({ t: 'bridge', variant: 'write' });
    lesson.scope.words.forEach((_, wi) => steps.push({ t: 'write-word', wi }));
    lesson.scope.phrases.forEach((_, pi) => steps.push({ t: 'write-phrase', pi }));
    steps.push({ t: 'bridge', variant: 'speak' });
    lesson.scope.phrases.forEach((_, pi) => steps.push({ t: 'listen-speak', pi }));
    steps.push({ t: 'recap' });
    return steps;
  }

  function groupOf(lesson) {
    return (window.Grilo4P.GROUPS || []).find(g => g.id === lesson.group) || null;
  }

  function openLesson(slug) {
    const lesson = (window.Grilo4P.LESSONS || []).find(l => l.slug === slug);
    if (!lesson) return;
    const steps = buildSteps(lesson);
    S = { lesson, steps, idx: 0, slow: false };
    buildPlayerDom();
    const overlay = $('g4pPlayer');
    overlay.hidden = false;
    $('g4pSession').setAttribute('aria-label', `Aula — ${lesson.title}`);
    Shell.lockScroll(true);
    if (unfitViewport) unfitViewport(); // "Próxima aula" reabre sem fechar
    unfitViewport = Shell.fitViewport(overlay);

    // Parou no meio antes? Oferece retomar — sem decidir pelo aluno:
    // rever a aula do começo é uma escolha legítima de estudo. A capa fica
    // por trás do sheet SEM gravar posição (senão o marcador seria apagado).
    const cp = readCheckpoint(lesson, steps.length);
    renderStep({ keepCheckpoint: !!cp });
    if (cp) renderResumePrompt(cp);
  }

  // Sobe o parcial (pontas já conquistadas + posição) para a retomada
  // sobreviver a troca de máquina ou limpeza de cache. Silencioso: o
  // localStorage já garantiu a retomada neste navegador.
  function flushPartialProgress() {
    if (!S) return;
    const lp = lessonProg(S.lesson.slug);
    if (lp.completedAt) return;              // já concluída: o sync de conclusão manda
    if (!lp.resume) return;                  // nada a retomar (capa / recap)
    syncLessonToBackend(S.lesson, { completed: false });
  }

  function closePlayer() {
    stopListening();
    try { window.GriloTTS ? window.GriloTTS.stop() : window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    flushPartialProgress();
    if (unfitViewport) { unfitViewport(); unfitViewport = null; }
    const overlay = $('g4pPlayer');
    if (overlay) overlay.hidden = true;
    Shell.closeSheet($('g4pSession'));
    Shell.lockScroll(false);
    S = null;
    renderGrid();
  }

  function next() {
    if (!S) return;
    stopListening();
    if (S.idx < S.steps.length - 1) { S.idx++; renderStep(); }
  }

  // ─── Retomada (sheet na abertura) ────────────────────────────
  function resumeAgo(iso) {
    const t = Date.parse(iso || '');
    if (!t) return '';
    const mins = Math.round((Date.now() - t) / 60000);
    if (mins < 2) return 'agora há pouco';
    if (mins < 60) return `há ${mins} min`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `há ${hrs} h`;
    const days = Math.round(hrs / 24);
    return days === 1 ? 'ontem' : `há ${days} dias`;
  }

  function renderResumePrompt(cp) {
    const L = S.lesson;
    const phase = PHASES.find(p => p.id === phaseOfStep(S.steps[cp.idx]));
    const pct = Math.round((cp.idx / (S.steps.length - 1)) * 100);
    const when = resumeAgo(cp.at);

    Shell.openSheet($('g4pSession'), {
      tone: 'plain',
      icon: null,
      scrim: true,
      stack: true,
      title: `Você parou em ${phase ? escapeHtml(phase.label) : 'Aula'} (${pct}%)`,
      html: `<p class="gs-sheet-text gs-muted">Seu progresso ficou salvo${when ? ` ${escapeHtml(when)}` : ''}. O que você já acertou continua registrado nos dois caminhos.</p>`,
      actions: [
        { label: 'Continuar de onde parei', kind: 'pri', id: 'g4pResumeGo', onClick: () => {
          Shell.closeSheet($('g4pSession'));
          S.idx = cp.idx;
          renderStep();
        } },
        { label: 'Começar do início', kind: 'txt', id: 'g4pResumeRestart', onClick: () => {
          clearCheckpoint(L.slug);
          Shell.closeSheet($('g4pSession'));
          S.idx = 0;
          renderStep();
        } },
      ],
    });
  }

  // ─── Casco do player ─────────────────────────────────────────
  function buildPlayerDom() {
    if ($('g4pPlayer')) return;
    const root = document.createElement('div');
    root.id = 'g4pPlayer';
    root.className = 'gs-overlay';
    root.hidden = true;
    root.innerHTML = `
      <div class="gs-session" id="g4pSession" role="dialog" aria-modal="true" aria-label="Aula">
        <div class="gs-top">
          <button class="gs-x" id="g4pClose" type="button" aria-label="Fechar aula">${icon('x')}</button>
          <div class="gs-prog" id="g4pProg" aria-hidden="true">${Shell.progHtml(PHASES.map(() => 0))}</div>
          <span class="gs-cnt" id="g4pCnt"></span>
        </div>
        <div class="gs-body" id="g4pStage"></div>
        <div class="gs-dock" id="g4pDock"></div>
      </div>`;
    document.body.appendChild(root);
    $('g4pClose').addEventListener('click', closePlayer);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && S && !$('g4pPlayer').hidden) closePlayer();
    });
  }

  function session() { return $('g4pSession'); }

  // Barra da topbar: um segmento por fase, cheio na proporção dos passos já feitos.
  function updateTop() {
    const step = S.steps[S.idx];
    const last = S.steps.length - 1;
    const fracs = PHASES.map(p => {
      const idxs = [];
      S.steps.forEach((st, i) => { if (phaseOfStep(st) === p.id) idxs.push(i); });
      if (!idxs.length) return 0;
      if (p.id === 'recap') return S.idx >= last ? 1 : 0;
      return idxs.filter(i => i < S.idx).length / idxs.length;
    });
    Shell.setProg($('g4pProg'), fracs);

    const visible = S.steps.filter(st => st.t !== 'bridge');
    const pos = S.steps.slice(0, S.idx + 1).filter(st => st.t !== 'bridge').length;
    $('g4pCnt').textContent = step.t === 'cover' ? `~${S.lesson.minutes} min`
      : step.t === 'recap' ? 'fim'
      : `${pos - 1}/${visible.length - 2}`;
  }

  function setDock(html) {
    const dock = $('g4pDock');
    dock.innerHTML = html;
    return dock;
  }

  // Botões do dock não roubam o foco do campo: o teclado do celular não fecha.
  function keepFocus(...ids) {
    ids.forEach(id => { const el = $(id); if (el) el.addEventListener('pointerdown', e => e.preventDefault()); });
  }

  function renderStep(opts) {
    const step = S.steps[S.idx];

    // Telas de ponte ("Agora escreve.") viraram um selo de fase sobre o
    // primeiro exercício — sem toque extra. O passo continua no roteiro
    // (buildSteps / checkpoints não mudam), só não é desenhado.
    if (step.t === 'bridge') {
      S.toast = step.variant === 'write' ? '✍️ Agora você escreve' : '🎙 Agora você fala';
      S.idx++;
      return renderStep(opts);
    }

    // Marca a posição ANTES de desenhar: se a máquina cair no meio do
    // passo, o aluno volta para o início deste passo — nunca para a capa.
    if (!(opts && opts.keepCheckpoint)) saveCheckpoint(S.lesson, S.idx, S.steps.length);

    Shell.closeSheet(session());
    updateTop();
    const stage = $('g4pStage');
    stage.scrollTop = 0;

    switch (step.t) {
      case 'cover':        renderCover(stage); break;
      case 'theory':       renderTheory(stage, step); break;
      case 'check':        renderCheck(stage, step); break;
      case 'write-word':   renderWriteWord(stage, step); break;
      case 'write-phrase': renderWritePhrase(stage, step); break;
      case 'listen-speak': renderListenSpeak(stage, step); break;
      case 'recap':        renderRecap(stage); break;
    }

    if (S && S.toast) { Shell.toast(session(), S.toast); S.toast = null; }
  }

  // Feedback padrão das telas de exercício: sheet + "Continuar" no lugar do dock.
  function feedback(opts) {
    return Shell.openSheet(session(), Object.assign({
      actions: [{ label: 'Continuar', kind: 'pri', id: 'g4pNext', onClick: next }],
    }, opts));
  }

  // ─── Telas ───────────────────────────────────────────────────
  function lessonNumber(L) {
    const p = lessonPlaces().find(x => x.lesson.slug === L.slug);
    return p ? p.num : null;
  }

  function renderCover(stage) {
    const L = S.lesson;
    const grp = groupOf(L);
    const num = lessonNumber(L);
    stage.innerHTML = `
      <div class="gs-center g4p-cover">
        <span class="g4p-tile" aria-hidden="true">${escapeHtml(L.icon)}</span>
        <span class="gs-kick">${num ? `Aula ${String(num).padStart(2, '0')}` : 'Aula'}${grp ? ` · Grupo ${escapeHtml(grp.id)}` : ''}</span>
        <h2 class="gs-h1">${escapeHtml(L.title)}</h2>
        <p class="gs-p">${escapeHtml(L.objective)}</p>
        <div class="g4p-meta">
          <span>${L.scope.words.length} palavras</span><span>${L.scope.phrases.length} frases</span><span>4 pontas</span>
        </div>
        <div class="g4p-four" aria-label="As 4 pontas">
          <span><i aria-hidden="true">👁</i>ver</span><span><i aria-hidden="true">👂</i>ouvir</span>
          <span><i aria-hidden="true">✍️</i>escrever</span><span><i aria-hidden="true">🎙</i>falar</span>
        </div>
        <p class="gs-p g4p-cover-rule">Escreveu certo → entra no vocabulário.<br>Ouviu e falou também → <b>dominada</b>.</p>
      </div>`;
    setDock(`<button class="gs-btn is-pri" id="g4pNext" type="button">Começar aula</button>`);
    $('g4pNext').addEventListener('click', next);
  }

  // Teoria em cartões: o parágrafo vira cartões de até ~280 caracteres,
  // quebrados por frase. A "pegadinha" sai do texto e vira um callout.
  const CARD_CHARS = 280;
  const TRAP_RE = /pegadinha|armadilha|cuidado/i;

  function splitSentences(html) {
    const parts = String(html || '').split(/(?<=[.!?…]["”']?(?:<\/[bi]>)?["”']?)\s+(?=["“(]?(?:<[bi]>)?["“]?[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/);
    // Junta pedaços que deixaram uma tag <b>/<i> aberta (quebra dentro do negrito)
    const out = [];
    parts.forEach(p => {
      const prev = out[out.length - 1];
      const open = s => (s.match(/<[bi]>/g) || []).length - (s.match(/<\/[bi]>/g) || []).length;
      if (prev && open(prev) > 0) out[out.length - 1] = prev + ' ' + p;
      else out.push(p);
    });
    return out;
  }

  function theoryCards(html) {
    const sentences = splitSentences(html);
    const trap = sentences.filter(s => TRAP_RE.test(s));
    const body = sentences.filter(s => !TRAP_RE.test(s));
    const cards = [];
    body.forEach(s => {
      const cur = cards[cards.length - 1];
      if (cur && (cur + ' ' + s).replace(/<[^>]+>/g, '').length <= CARD_CHARS) cards[cards.length - 1] = cur + ' ' + s;
      else cards.push(s);
    });
    return { cards: cards.length ? cards : [html], trap: trap.join(' ') };
  }

  function renderTheory(stage, step) {
    const sec = S.lesson.sections[step.si];
    const { cards, trap } = theoryCards(sec.explanation);
    let ci = 0;

    stage.innerHTML = `
      <span class="gs-kick">📖 Aula · seção ${step.si + 1} de ${S.lesson.sections.length}</span>
      <h2 class="gs-h2">${escapeHtml(sec.title)}</h2>
      <div class="g4p-tcard" id="g4pCard" aria-live="polite">
        <p class="g4p-tcard-text" id="g4pCardText"></p>
        ${cards.length > 1 ? `<div class="g4p-dots" id="g4pDots" aria-hidden="true">${cards.map(() => '<i></i>').join('')}</div>` : ''}
      </div>
      ${trap ? `<div class="g4p-trap"><span aria-hidden="true">⚠️</span><p>${trap}</p></div>` : ''}
      <span class="gs-lbl">Ouça e repita</span>
      <div class="g4p-examples">
        ${sec.examples.map((ex, i) => `
          <button class="g4p-example" type="button" data-speak-idx="${i}">
            <span class="g4p-example-play">${icon('play')}</span>
            <span class="g4p-example-body"><b>${escapeHtml(ex.en)}</b><small>${escapeHtml(ex.pt)}</small></span>
          </button>`).join('')}
      </div>`;

    stage.querySelectorAll('[data-speak-idx]').forEach(btn => {
      btn.addEventListener('click', () => speak(sec.examples[+btn.dataset.speakIdx].en, btn));
    });

    function paint() {
      $('g4pCardText').innerHTML = cards[ci];
      const dots = $('g4pDots');
      if (dots) Array.from(dots.children).forEach((d, i) => d.classList.toggle('is-on', i <= ci));
      const last = ci === cards.length - 1;
      setDock(`
        ${ci > 0 ? `<button class="gs-btn is-sec is-ic" id="g4pPrevCard" type="button" aria-label="Cartão anterior">${icon('back')}</button>` : ''}
        <button class="gs-btn is-pri" id="g4pNext" type="button">${last ? 'Entendi' : 'Próximo cartão'}</button>`);
      $('g4pNext').addEventListener('click', () => {
        if (last) next();
        else { ci++; paint(); }
      });
      const prev = $('g4pPrevCard');
      if (prev) prev.addEventListener('click', () => { ci--; paint(); });
    }
    paint();
  }

  function optionsHtml(options) {
    const letters = 'ABCD';
    return options.map((opt, i) => `
      <button class="gs-opt" type="button" data-opt="${i}">
        <span class="gs-opt-l" aria-hidden="true">${letters[i] || ''}</span>
        <span>${escapeHtml(opt)}</span>
      </button>`).join('');
  }

  function markOptions(container, correctIdx, chosenIdx) {
    container.querySelectorAll('.gs-opt').forEach((b, i) => {
      b.disabled = true;
      if (i === correctIdx) b.classList.add('is-correct');
      else if (i === chosenIdx) b.classList.add('is-wrong');
      else b.classList.add('is-dim');
    });
  }

  function audioHero(label) {
    return `
      <div class="gs-ah-wrap">
        <button class="gs-ah" id="g4pPlayAudio" type="button" aria-label="Ouvir áudio">${icon('sound')}</button>
        <span class="gs-ah-cap">${label}</span>
      </div>`;
  }

  function waitingDock() {
    setDock(`<button class="gs-btn is-pri" type="button" disabled>Continuar</button>`);
  }

  function renderCheck(stage, step) {
    const sec = S.lesson.sections[step.si];
    const cp = sec.checkpoint[step.ci];
    // Novos tipos do A2 (produção). ver/ouvir seguem no caminho clássico.
    if (cp.kind === 'contraste') return renderCheckContrast(stage, cp);
    if (cp.kind === 'ordenar')   return renderCheckOrder(stage, cp);
    return renderCheckChoice(stage, cp);
  }

  // 👁/👂 ver e ouvir — múltipla escolha
  function renderCheckChoice(stage, cp) {
    const isOuvir = cp.kind === 'ouvir';
    const mix = shuffleWithCorrect(cp.options, cp.correct);

    stage.innerHTML = `
      <span class="gs-kick">${isOuvir ? '👂 Ouvir — sem ler' : '👁 Identificar'}</span>
      ${isOuvir ? audioHero('toque para ouvir de novo') : ''}
      <h2 class="gs-h2">${escapeHtml(cp.prompt)}</h2>
      <div class="gs-opts" id="g4pOpts">${optionsHtml(mix.options)}</div>`;
    waitingDock();

    if (isOuvir) {
      const playBtn = $('g4pPlayAudio');
      playBtn.addEventListener('click', () => speak(cp.audio, playBtn));
      setTimeout(() => speak(cp.audio, playBtn), 350);
    }

    let answered = false;
    stage.querySelectorAll('.gs-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const chosen = +btn.dataset.opt;
        const ok = chosen === mix.correct;
        markOptions($('g4pOpts'), mix.correct, chosen);
        const heard = isOuvir && cp.audio ? `Você ouviu <b>“${escapeHtml(cp.audio)}”</b>` : '';
        if (ok) {
          if (isOuvir) markSkill(S.lesson.slug, cp.item, 'heard');
          feedback({
            tone: 'good',
            title: isOuvir ? 'Entendeu de ouvido!' : 'Isso!',
            html: heard ? `<p class="gs-sheet-text">${heard}</p>` : '',
          });
        } else {
          feedback({
            tone: 'bad',
            title: 'Não foi essa',
            html: `<p class="gs-sheet-text">${heard ? heard + ' — ' : 'A certa era '}<b>${escapeHtml(cp.options[cp.correct])}</b>.</p>`,
            again: isOuvir ? { label: 'ouvir de novo', onClick: () => speak(cp.audio) } : null,
          });
        }
      });
    });
  }

  // ⚖️ Contraste — escolher entre duas estruturas EN×EN (a/b).
  // Conta como reconhecimento (ponta "ouvir"/ver) para o item.
  function renderCheckContrast(stage, cp) {
    // Embaralha qual opção aparece em cima, preservando qual é a correta.
    const pair = [{ key: 'a', text: cp.a }, { key: 'b', text: cp.b }];
    if (Math.random() < 0.5) pair.reverse();
    const correctIdx = pair.findIndex(p => p.key === cp.correct);

    stage.innerHTML = `
      <span class="gs-kick">⚖️ Qual soa certo?</span>
      <h2 class="gs-h2">${escapeHtml(cp.prompt)}</h2>
      <div class="gs-opts" id="g4pOpts">${optionsHtml(pair.map(p => p.text))}</div>
      <p class="gs-p">As duas parecem quase iguais — repare na diferença.</p>`;
    waitingDock();

    let answered = false;
    stage.querySelectorAll('.gs-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const chosen = +btn.dataset.opt;
        const ok = chosen === correctIdx;
        markOptions($('g4pOpts'), correctIdx, chosen);
        const why = cp.why ? `<p class="gs-sheet-text">${escapeHtml(cp.why)}</p>` : '';
        if (ok) {
          if (cp.item) markSkill(S.lesson.slug, cp.item, 'heard');
          feedback({ tone: 'good', title: 'Isso!', html: why });
        } else {
          const right = cp.correct === 'a' ? cp.a : cp.b;
          feedback({ tone: 'bad', title: 'A outra estava certa', html: `<p class="gs-sheet-text"><b>${escapeHtml(right)}</b></p>${why}` });
        }
      });
    });
  }

  // 🧩 Ordenar — montar a frase a partir de tokens embaralhados.
  // Conta como produção (ponta "escrever") para o item.
  function renderCheckOrder(stage, cp) {
    const bank = shuffleArray(cp.tokens.map((t, i) => ({ t, i })));

    stage.innerHTML = `
      <span class="gs-kick">🧩 Monte a frase</span>
      <h2 class="gs-h2">${escapeHtml(cp.prompt)}</h2>
      <div class="g4p-build" aria-label="Frase montada">
        <div class="g4p-build-row" id="g4pOrderSlot"></div>
        <button class="g4p-build-reset" id="g4pOrderClear" type="button" aria-label="Limpar a frase">${icon('reset')}</button>
      </div>
      <div class="g4p-bank" id="g4pOrderBank">
        ${bank.map(b => `<button class="g4p-token" type="button" data-tid="${b.i}">${escapeHtml(b.t)}</button>`).join('')}
      </div>
      <p class="gs-p g4p-order-tip">Toque numa palavra montada para devolvê-la.</p>`;
    setDock(`<button class="gs-btn is-pri" id="g4pOrderCheck" type="button" disabled>Conferir</button>`);

    const slot = $('g4pOrderSlot');
    const bankEl = $('g4pOrderBank');
    const checkBtn = $('g4pOrderCheck');
    const built = []; // ordem escolhida: [{ tid, t }]
    let answered = false;

    function syncCheckBtn() {
      checkBtn.disabled = built.length !== cp.tokens.length || answered;
    }
    function renderSlot() {
      slot.innerHTML = built.map(b =>
        `<button class="g4p-token is-placed" type="button" data-tid="${b.tid}">${escapeHtml(b.t)}</button>`).join('')
        || '<span class="g4p-build-ph">toque nas palavras abaixo…</span>';
      slot.querySelectorAll('.is-placed').forEach(tk => {
        tk.addEventListener('click', () => {
          if (answered) return;
          const tid = +tk.dataset.tid;
          const pos = built.findIndex(b => b.tid === tid);
          if (pos >= 0) built.splice(pos, 1);
          const src = bankEl.querySelector(`[data-tid="${tid}"]`);
          if (src) { src.classList.remove('is-used'); src.disabled = false; }
          renderSlot(); syncCheckBtn();
        });
      });
    }

    bankEl.querySelectorAll('.g4p-token').forEach(tk => {
      tk.addEventListener('click', () => {
        if (answered || tk.classList.contains('is-used')) return;
        tk.classList.add('is-used');
        tk.disabled = true;
        built.push({ tid: +tk.dataset.tid, t: tk.textContent });
        renderSlot(); syncCheckBtn();
      });
    });

    $('g4pOrderClear').addEventListener('click', () => {
      if (answered) return;
      built.length = 0;
      bankEl.querySelectorAll('.g4p-token').forEach(t => { t.classList.remove('is-used'); t.disabled = false; });
      renderSlot(); syncCheckBtn();
    });

    checkBtn.addEventListener('click', () => {
      if (answered || built.length !== cp.tokens.length) return;
      answered = true;
      const got = built.map(b => b.t).join(' ');
      const ok = norm(got.replace(/\s+/g, '')) === norm(cp.correct.replace(/\s+/g, ''))
        || tokenize(got).join(' ') === tokenize(cp.correct).join(' ');
      slot.querySelectorAll('.is-placed').forEach(t => { t.classList.add(ok ? 'is-correct' : 'is-wrong'); t.disabled = true; });
      $('g4pOrderClear').hidden = true;
      if (ok) {
        if (cp.item) markSkill(S.lesson.slug, cp.item, 'written');
        feedback({ tone: 'good', title: 'Frase certa!', html: '<p class="gs-sheet-text">Produção registrada — isso é o que vira palavra dominada.</p>' });
      } else {
        feedback({ tone: 'bad', title: 'A ordem certa é', html: `<p class="gs-sheet-text"><b>${escapeHtml(cp.correct)}</b></p>` });
      }
    });

    renderSlot();
  }

  // Pontinhos de tentativa (escrever): mostram quanto falta antes de revelar.
  function triesHtml(used) {
    const left = MAX_WRITE_ATTEMPTS - used;
    return `${Array.from({ length: MAX_WRITE_ATTEMPTS }, (_, i) => `<i class="${i < used ? 'is-used' : ''}"></i>`).join('')}
      <span>${left > 1 ? `${left} tentativas` : left === 1 ? 'última tentativa' : 'sem tentativas'}</span>`;
  }

  function audioRow(id) {
    return `
      <div class="gs-arow">
        <button class="gs-apill" id="${id}" type="button" aria-label="Ouvir">
          <span class="gs-apill-pl">${icon('play')}</span><span>Ouvir</span>
          <span class="gs-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        </button>
        <button class="gs-slow" id="g4pSlow" type="button" aria-pressed="${S.slow ? 'true' : 'false'}">🐢 Devagar</button>
      </div>`;
  }

  function bindAudioRow(id, text, input) {
    const playBtn = $(id);
    const play = () => speak(text, playBtn, S.slow ? SLOW_RATE : null);
    playBtn.addEventListener('click', play);
    $('g4pSlow').addEventListener('click', () => {
      S.slow = !S.slow;
      $('g4pSlow').setAttribute('aria-pressed', String(S.slow));
      play();
      if (input && !input.disabled) input.focus({ preventScroll: true });
    });
    return play;
  }

  // ✍ Palavra — ditado: ouve o áudio (com dica em PT) e digita em inglês
  function renderWriteWord(stage, step) {
    const w = S.lesson.scope.words[step.wi];
    let attempts = 0;

    stage.innerHTML = `
      <span class="gs-kick">✍️ Escrever · palavra ${step.wi + 1} de ${S.lesson.scope.words.length}</span>
      ${audioRow('g4pPlayAudio')}
      <p class="gs-p g4p-means">Significa: <b>${escapeHtml(w.pt)}</b></p>
      <input class="gs-input" id="g4pInput" type="text" autocomplete="off" autocapitalize="off" autocorrect="off"
             spellcheck="false" enterkeyhint="done" placeholder="Escreva o que você ouviu" aria-label="Escreva a palavra em inglês">
      <div class="g4p-tries" id="g4pTries">${triesHtml(0)}</div>
      <p class="g4p-inline" id="g4pInline" hidden></p>`;
    setDock(`
      <button class="gs-btn is-sec is-sm" id="g4pGiveUp" type="button">Não sei</button>
      <button class="gs-btn is-pri is-sm" id="g4pSubmit" type="button">Verificar</button>`);
    keepFocus('g4pGiveUp', 'g4pSubmit');

    const input = $('g4pInput');
    const play = bindAudioRow('g4pPlayAudio', w.en, input);
    setTimeout(play, 350);
    input.focus({ preventScroll: true });

    function inline(kind, html) {
      const el = $('g4pInline');
      el.className = 'g4p-inline is-' + kind;
      el.innerHTML = html;
      el.hidden = false;
    }

    function finish(pass) {
      input.disabled = true;
      input.blur();
      input.classList.add(pass ? 'is-pass' : 'is-fail');
      $('g4pInline').hidden = true;
      if (pass) {
        markSkill(S.lesson.slug, w.en, 'written');
        markSkill(S.lesson.slug, w.en, 'heard'); // ditado: escreveu o que ouviu
        feedback({ tone: 'good', title: 'No vocabulário!',
          html: `<p class="gs-sheet-text"><b>${escapeHtml(w.en)}</b> · ${escapeHtml(w.phonetic)} — ${escapeHtml(w.pt)}</p>` });
      } else {
        feedback({ tone: 'bad', title: `Era “${escapeHtml(w.en)}”`,
          html: `<p class="gs-sheet-text">${escapeHtml(w.pt)} · <b>${escapeHtml(w.phonetic)}</b>. Ela volta numa próxima rodada — sem stress.</p>`,
          again: { label: 'ouvir de novo', onClick: () => speak(w.en) } });
      }
    }

    function check() {
      if (input.disabled) return;
      const res = compareWord(input.value, w.en);
      if (res === 'empty') { input.focus(); return; }
      attempts++;
      $('g4pTries').innerHTML = triesHtml(attempts);
      if (res === 'pass') {
        finish(true);
      } else if (attempts >= MAX_WRITE_ATTEMPTS) {
        finish(false);
      } else if (res === 'almost') {
        input.classList.add('is-warn');
        inline('warn', '<b>Quase!</b> Uma letra fora do lugar — confira a grafia.');
        input.select();
      } else {
        input.classList.add('is-warn');
        inline('bad', `<b>Ainda não.</b> Ouça de novo — dica de leitura: <b>${escapeHtml(w.phonetic)}</b>`);
        play();
        input.select();
      }
    }

    $('g4pSubmit').addEventListener('click', check);
    $('g4pGiveUp').addEventListener('click', () => { if (!input.disabled) finish(false); });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    input.addEventListener('input', () => input.classList.remove('is-warn'));
  }

  function wordDiffHtml(tokens, flags) {
    return `<div class="g4p-diff">${tokens.map((t, i) =>
      `<span class="${flags[i] ? 'is-ok' : 'is-miss'}">${escapeHtml(t)}</span>`).join(' ')}</div>`;
  }

  // ✍ Frase — tradução digitada: PT na tela, digita em inglês
  function renderWritePhrase(stage, step) {
    const p = S.lesson.scope.phrases[step.pi];
    let attempts = 0;

    stage.innerHTML = `
      <span class="gs-kick">✍️ Escrever · frase ${step.pi + 1} de ${S.lesson.scope.phrases.length}</span>
      <h2 class="gs-h2 g4p-pt">“${escapeHtml(p.pt)}”</h2>
      <p class="gs-p">Escreva em inglês. Travou? <button class="g4p-linkbtn" id="g4pPlayAudio" type="button">${icon('sound')}ouça a frase</button></p>
      <input class="gs-input" id="g4pInput" type="text" autocomplete="off" autocapitalize="off" autocorrect="off"
             spellcheck="false" enterkeyhint="done" placeholder="Digite a frase em inglês" aria-label="Escreva a frase em inglês">
      <div class="g4p-tries" id="g4pTries">${triesHtml(0)}</div>
      <div class="g4p-inline-diff" id="g4pInlineDiff" hidden></div>`;
    setDock(`
      <button class="gs-btn is-sec is-sm" id="g4pGiveUp" type="button">Não sei</button>
      <button class="gs-btn is-pri is-sm" id="g4pSubmit" type="button">Verificar</button>`);
    keepFocus('g4pGiveUp', 'g4pSubmit', 'g4pPlayAudio');

    $('g4pPlayAudio').addEventListener('click', function () { speak(p.en, this); });

    const input = $('g4pInput');
    input.focus({ preventScroll: true });

    function finish(pass, res) {
      input.disabled = true;
      input.blur();
      input.classList.add(pass ? 'is-pass' : 'is-fail');
      $('g4pInlineDiff').hidden = true;
      if (pass) {
        markSkill(S.lesson.slug, p.en, 'written');
        // palavras do escopo digitadas certo dentro da frase também contam como escritas
        const okTokens = new Set(res.expTokens.filter((_, i) => res.matchedFlags[i]));
        creditWordsViaPhrase(S.lesson, p.en, 'written', okTokens);
        feedback({ tone: 'good', title: 'Frase no vocabulário!',
          html: `<p class="gs-sheet-text"><b>${escapeHtml(p.en)}</b> · ${escapeHtml(p.phonetic)}</p>` });
      } else {
        feedback({ tone: 'bad', title: 'Essa era difícil mesmo',
          html: `${res ? wordDiffHtml(res.expTokens, res.matchedFlags) : ''}<p class="gs-sheet-text">A frase era <b>${escapeHtml(p.en)}</b> · ${escapeHtml(p.phonetic)}</p>`,
          again: { label: 'ouvir a frase', onClick: () => speak(p.en) } });
      }
    }

    function check() {
      if (input.disabled) return;
      if (!input.value.trim()) { input.focus(); return; }
      attempts++;
      $('g4pTries').innerHTML = triesHtml(attempts);
      const res = comparePhrase(input.value, p.en);
      if (res.pass) {
        finish(true, res);
      } else if (attempts >= MAX_WRITE_ATTEMPTS) {
        finish(false, res);
      } else {
        input.classList.add('is-warn');
        const el = $('g4pInlineDiff');
        el.innerHTML = `<b>${res.correct} de ${res.expTokens.length} palavras no lugar.</b> As vermelhas faltaram ou vieram diferentes. ${wordDiffHtml(res.expTokens, res.matchedFlags)}`;
        el.hidden = false;
        input.select();
      }
    }

    $('g4pSubmit').addEventListener('click', check);
    $('g4pGiveUp').addEventListener('click', () => {
      if (input.disabled) return;
      finish(false, input.value.trim() ? comparePhrase(input.value, p.en) : null);
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    input.addEventListener('input', () => input.classList.remove('is-warn'));
  }

  // 👂🎙 Frase — dois tempos na MESMA tela: (1) ouve sem ler e mostra que
  // entendeu; (2) a tela se transforma na fala, com reconhecimento de voz.
  function renderListenSpeak(stage, step) {
    const L = S.lesson;
    const p = L.scope.phrases[step.pi];
    const n = `frase ${step.pi + 1} de ${L.scope.phrases.length}`;

    // distratores: PT das outras frases da aula
    const others = L.scope.phrases.filter((_, i) => i !== step.pi).map(x => x.pt);
    const opts = [p.pt].concat(others.slice(0, 2));
    const mix = shuffleWithCorrect(opts, 0);

    // ── Tempo 1: compreensão ──
    stage.innerHTML = `
      <span class="gs-kick">👂🎙 Ouvir e falar · ${n}</span>
      ${audioHero('1º entenda, depois fale')}
      <h2 class="gs-h2">O que essa frase quer dizer?</h2>
      <div class="gs-opts" id="g4pOpts">${optionsHtml(mix.options)}</div>`;
    waitingDock();

    const playBtn = $('g4pPlayAudio');
    playBtn.addEventListener('click', () => speak(p.en, playBtn));
    setTimeout(() => speak(p.en, playBtn), 350);

    let answered = false;
    stage.querySelectorAll('.gs-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const chosen = +btn.dataset.opt;
        const ok = chosen === mix.correct;
        markOptions($('g4pOpts'), mix.correct, chosen);
        if (ok) {
          markSkill(L.slug, p.en, 'heard');
          creditWordsViaPhrase(L, p.en, 'heard', null);
        }
        Shell.openSheet(session(), {
          tone: ok ? 'good' : 'bad',
          title: ok ? 'Isso! Agora fala ela.' : 'Não era essa',
          html: `<p class="gs-sheet-text"><b>${escapeHtml(p.en)}</b><br>${ok ? '' : 'Ela quer dizer: '}${escapeHtml(p.pt)}</p>`,
          actions: [{ label: 'Ir para a fala', kind: 'pri', icon: 'mic', id: 'g4pToSpeak', onClick: renderSpeak }],
        });
      });
    });

    // ── Tempo 2: fala ──
    let speakAttempts = 0;
    const words = p.en.split(/\s+/);

    function renderSpeak() {
      Shell.closeSheet(session());
      stage.scrollTop = 0;
      stage.innerHTML = `
        <div class="g4p-speak">
          <span class="gs-kick">🎙 Falar · ${n}</span>
          <p class="g4p-phrase" id="g4pPhrase">${words.map(wd => `<span>${escapeHtml(wd)}</span>`).join(' ')}</p>
          <p class="g4p-phon">${escapeHtml(p.phonetic)}</p>
          <p class="g4p-listen" id="g4pListen">Toque em <b>Falar</b> e diga a frase no seu ritmo.</p>
          ${speechSupported() ? '' : '<p class="g4p-inline is-warn">Este navegador não reconhece voz — a fala não será avaliada. No Chrome a experiência é completa.</p>'}
        </div>`;
      setDock(`
        <button class="gs-btn is-sec is-ic" id="g4pReplay" type="button" aria-label="Ouvir de novo">${icon('sound')}</button>
        <button class="gs-btn is-pri" id="g4pMic" type="button">${icon('mic')}Falar</button>
        <button class="gs-btn is-txt" id="g4pSkip" type="button">Pular</button>`);
      $('g4pReplay').addEventListener('click', function () { speak(p.en, this); });
      $('g4pSkip').addEventListener('click', next);
      $('g4pMic').addEventListener('click', listen);
    }

    function paintWords(ev) {
      const spans = Array.from(document.querySelectorAll('#g4pPhrase span'));
      if (!ev || spans.length !== ev.expTokens.length) return false;
      spans.forEach((s, i) => { s.className = ev.matched[i] ? 'is-ok' : 'is-miss'; });
      return true;
    }

    function setListening(on) {
      const mic = $('g4pMic');
      const status = $('g4pListen');
      if (!mic) return;
      mic.className = on ? 'gs-btn is-rec' : 'gs-btn is-pri';
      mic.innerHTML = on
        ? '<span class="gs-wave" aria-hidden="true" style="margin:0"><i></i><i></i><i></i><i></i><i></i></span>Ouvindo…'
        : `${icon('mic')}Falar`;
      mic.classList.toggle('is-playing', on);
      if (status) status.innerHTML = on ? '<span class="g4p-rec-dot"></span>Ouvindo… fale no seu ritmo' : 'Toque em <b>Falar</b> e diga a frase no seu ritmo.';
    }

    function retrySheet(tone, title, text) {
      Shell.openSheet(session(), {
        tone, title,
        html: `<p class="gs-sheet-text">${text}</p>`,
        again: { label: 'ouvir a frase', onClick: () => speak(p.en) },
        actions: [
          { label: 'Tentar de novo', kind: 'pri', icon: 'mic', onClick: () => { Shell.closeSheet(session()); listen(); } },
          { label: 'Pular', kind: 'txt', onClick: next },
        ],
      });
    }

    function listen() {
      if (!speechSupported()) {
        feedback({ tone: 'warn', title: 'Sem reconhecimento de voz',
          html: '<p class="gs-sheet-text">Este navegador não suporta — tente o Chrome para a experiência completa.</p>' });
        return;
      }
      setListening(true);

      startListening(alts => {
        setListening(false);
        speakAttempts++;
        const vr = VR();
        const ev = vr && vr.evaluate ? vr.evaluate(p.en, alts) : null;
        if (!ev) { next(); return; }
        const painted = paintWords(ev);
        const diff = painted ? '' : wordDiffHtml(ev.expTokens, ev.matched);
        if (ev.passed) {
          markSkill(L.slug, p.en, 'spoken');
          const matchedTokens = new Set(ev.expTokens.filter((_, i) => ev.matched[i]));
          creditWordsViaPhrase(L, p.en, 'spoken', matchedTokens);
          feedback({ tone: 'good', title: 'Mandou bem!', html: `${diff}<p class="gs-sheet-text">Frase falada e registrada.</p>` });
        } else if (speakAttempts < MAX_SPEAK_ATTEMPTS) {
          retrySheet('warn', `Ouvi: “${escapeHtml(ev.bestTranscript || '…')}”`,
            `${diff}As palavras em cinza escaparam — ouça de novo e repita.`);
        } else {
          feedback({ tone: 'bad', title: 'Essa ainda tá crua', html: `${diff}<p class="gs-sheet-text">Ela volta na revisão — segue o jogo.</p>` });
        }
      }, errCode => {
        setListening(false);
        retrySheet('warn',
          errCode === 'not-allowed' ? 'Sem acesso ao microfone' : 'Não consegui te ouvir',
          errCode === 'not-allowed'
            ? 'Libere a permissão do microfone no navegador e tente de novo.'
            : 'Fale um pouco mais perto do microfone.');
      });
    }
  }

  function renderRecap(stage) {
    const L = S.lesson;
    const lp = lessonProg(L.slug);
    if (!lp.completedAt) lp.completedAt = new Date().toISOString();
    delete lp.resume; // chegou ao fim: não há mais o que retomar
    saveProgress(progress);

    // Persiste no backend → alimenta o painel CEFR da home (vocab/frases/4 pontas)
    syncLessonToBackend(L, { completed: true });

    const sum = lessonSummary(L);
    const place = lessonPlaces().find(x => x.lesson.slug === L.slug);
    const firstLap = sum.aprendidas === 0;
    const all = L.scope.words.concat(L.scope.phrases);
    const toTake = all.filter(it => itemStatus(itemState(L.slug, it.en)) !== 'dominada').slice(0, 6);

    function chipRow(items) {
      return items.map(it => {
        const s = itemStatus(itemState(L.slug, it.en));
        return `<span class="g4p-recap-chip is-${s}" title="${escapeHtml(it.pt)}">${escapeHtml(it.en)}</span>`;
      }).join('');
    }

    stage.innerHTML = `
      <div class="gs-center">
        <span class="g4p-flag" aria-hidden="true">${icon('flag')}</span>
        <h2 class="gs-h1">${firstLap ? 'Primeira volta feita' : 'Aula concluída!'}</h2>
        <p class="gs-p">${firstLap
          ? `As ${sum.total} palavras e frases voltam numa próxima rodada — agora você já conhece o caminho.`
          : `${escapeHtml(L.title)} · conta para o bloco ${place ? place.level : 'A1'}.`}</p>
        <div class="gs-mets">
          <div><b>${sum.aprendidas}</b><small>no vocabulário</small></div>
          <div><b class="is-green">${sum.dominadas}</b><small>dominadas</small></div>
          <div><b>${sum.total}</b><small>itens da aula</small></div>
        </div>
        ${toTake.length ? `
          <div class="gs-take">
            <span class="gs-lbl">O que levar desta aula</span>
            <div class="gs-take-list">${toTake.map((it, i) => `<button class="gs-chipbtn" type="button" data-take="${i}">${icon('play')}${escapeHtml(it.en)}</button>`).join('')}</div>
          </div>` : ''}
      </div>
      <div class="g4p-recap-groups">
        <span class="gs-lbl">Palavras</span>
        <div class="g4p-recap-chips">${chipRow(L.scope.words)}</div>
        <span class="gs-lbl">Frases</span>
        <div class="g4p-recap-chips">${chipRow(L.scope.phrases)}</div>
        <div class="g4p-recap-legend">
          <span><i class="is-dominada"></i>dominada</span>
          <span><i class="is-aprendida"></i>aprendida (falta ouvir/falar)</span>
          <span><i class="is-nova"></i>a revisar</span>
        </div>
      </div>`;

    stage.querySelectorAll('[data-take]').forEach(b => {
      b.addEventListener('click', () => speak(toTake[+b.dataset.take].en, b));
    });

    const nextL = window.Grilo4P.getNextLesson();
    const hasNext = nextL && nextL.slug !== L.slug;
    setDock(`
      <button class="gs-btn is-sec" id="g4pReview" type="button">${hasNext ? 'Revisar' : 'Aulas'}</button>
      <button class="gs-btn is-pri" id="g4pFinish" type="button">${hasNext ? 'Próxima aula' : 'Voltar às aulas'}</button>`);
    $('g4pReview').addEventListener('click', () => {
      if (!hasNext) { closePlayer(); return; }
      const slug = L.slug;
      clearCheckpoint(slug);
      openLesson(slug);
    });
    $('g4pFinish').addEventListener('click', () => {
      if (!hasNext) { closePlayer(); return; }
      openLesson(nextL.slug);
    });
  }

  // ─── Hub: lista compacta ─────────────────────────────────────
  // Metadados dos blocos de nível CEFR. Um grupo pertence ao bloco pelo seu
  // campo `level` ('A2', …); sem `level` = A1 (bloco original). A ordem aqui é
  // a ordem de exibição.
  const LEVEL_BLOCKS = [
    { level: 'A1', label: 'Bloco A1 · Fundamentos',
      tagline: 'O inglês do dia a dia — de cumprimentar a contar o que você fez.' },
    { level: 'A2', label: 'Bloco A2 · Conectando ideias',
      tagline: 'Narrar, planejar, comparar e opinar — o inglês que já flui.' },
  ];

  function levelOfGroup(g) { return g.level || 'A1'; }

  // ─── Colapso de blocos (A1/A2) e grupos ──────────────────────
  // Estado persistido: { [level]: bool, ['g:' + groupId]: bool } → true = recolhido.
  // Sem entrada = padrão inteligente: bloco do gate aberto, blocos 100%
  // concluídos recolhidos; dentro do bloco, só o grupo da próxima aula aberto.
  const COLLAPSE_KEY = 'grilo4p_blocks_collapsed_v1';

  function loadCollapsed() {
    try {
      const raw = localStorage.getItem(COLLAPSE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveCollapsed(map) {
    try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(map)); } catch (e) {}
  }

  function rowHtml(L, num, nextSlug) {
    const sum = lessonSummary(L);
    const done = !!sum.completedAt;
    const resume = done ? null : readCheckpoint(L, buildSteps(L).length);
    const isCur = L.slug === nextSlug;
    const state = done ? 'is-done' : isCur ? 'is-cur' : '';
    const sub = done
      ? `${sum.aprendidas}/${sum.total} no vocabulário · ${sum.dominadas} dominadas`
      : resume
        ? `parou em ${Math.round((resume.idx / (resume.total - 1)) * 100)}% · ${sum.aprendidas}/${sum.total} no vocabulário`
        : `${L.scope.words.length} palavras · ${L.scope.phrases.length} frases · ~${L.minutes} min`;
    const right = isCur ? '<span class="gs-row-r">agora</span>' : resume ? '<span class="gs-row-r">↩</span>' : '';
    return `
      <div class="gs-row ${state}" data-slug="${escapeHtml(L.slug)}" role="button" tabindex="0"
           aria-label="${resume ? 'Continuar' : 'Abrir'} aula ${num}: ${escapeHtml(L.title)}">
        <span class="gs-rs">${done ? icon('check') : String(num).padStart(2, '0')}</span>
        <span class="gs-row-t"><b>${escapeHtml(L.title)}</b><small>${sub}</small></span>
        ${right}
      </div>`;
  }

  function renderContinue(heroBlock) {
    const box = $('g4pContinue');
    if (!box) return;
    const resumable = window.Grilo4P.getResumable()[0];
    const target = resumable ? window.Grilo4P.describeLesson(resumable.slug) : window.Grilo4P.getNextLesson();
    if (!target) { box.innerHTML = ''; return; }
    const L = (window.Grilo4P.LESSONS || []).find(l => l.slug === target.slug);
    const sum = lessonSummary(L);
    const pct = sum.total ? Math.round((sum.aprendidas / sum.total) * 100) : 0;
    const kicker = resumable
      ? `Continuar · ${resumable.percent}% feito`
      : `${sum.aprendidas > 0 ? 'Continuar' : 'Próxima'} · Aula ${String(target.num).padStart(2, '0')}`;
    box.innerHTML = `
      <div class="gs-cont" data-slug="${escapeHtml(L.slug)}">
        <span class="gs-cont-k">${kicker}${heroBlock && target.level !== heroBlock.level ? ` · ${target.level}` : ''}</span>
        <h2 class="gs-cont-t">${escapeHtml(L.title)}</h2>
        <span class="gs-cont-m">${L.scope.words.length} palavras · ${L.scope.phrases.length} frases · ~${L.minutes} min</span>
        <div class="gs-cont-ladder"><span><i style="width:${pct}%"></i></span>${sum.aprendidas}/${sum.total} no vocabulário</div>
        <button class="gs-cont-go" type="button">${resumable ? 'Continuar' : 'Começar'} ${icon('play')}</button>
      </div>`;
    box.querySelector('.gs-cont').addEventListener('click', () => openLesson(L.slug));
  }

  function renderGrid() {
    const grid = $('g4pGrid');
    if (!grid) return;
    const lessons = window.Grilo4P.LESSONS || [];
    const groups = window.Grilo4P.GROUPS || [];

    const builtIn = g => lessons.filter(l => l.group === g.id);
    const doneIn = arr => arr.filter(l => lessonProg(l.slug).completedAt).length;

    // Anel + chip: refletem o GATE VIGENTE, não a soma de todos os blocos.
    // O gate vigente é o primeiro bloco ainda não 100% concluído (A1 até fechar,
    // depois A2…). Assim "X de 20" continua verdadeiro para quem está no A1.
    let heroBlock = LEVEL_BLOCKS[0];
    for (const blk of LEVEL_BLOCKS) {
      const blkLessons = groups.filter(g => levelOfGroup(g) === blk.level).flatMap(builtIn);
      heroBlock = blk;
      if (blkLessons.length && doneIn(blkLessons) < blkLessons.length) break;
    }
    const heroLessons = groups.filter(g => levelOfGroup(g) === heroBlock.level).flatMap(builtIn);
    const heroTotal = heroLessons.length;
    const heroDone = doneIn(heroLessons);
    Shell.hubRing($('g4pRing'), heroDone, heroTotal);
    const topbarPill = $('lessonsTopbarProgress');
    if (topbarPill) topbarPill.textContent = `${heroBlock.level} · ${heroDone} de ${heroTotal}`;
    const heroKicker = $('g4pHeroKicker');
    if (heroKicker) heroKicker.textContent = `Bloco ${heroBlock.level} · 4 pontas`;

    renderContinue(heroBlock);

    // "Agora": a 1ª aula não concluída do produto inteiro (atravessa blocos).
    const nextP = window.Grilo4P.getNextLesson();
    const nextSlug = nextP ? nextP.slug : null;
    const nextGroup = nextP ? nextP.groupId : null;

    const saved = loadCollapsed() || {};
    const isCollapsed = (key, dflt) => (key in saved ? !!saved[key] : dflt);

    grid.innerHTML = LEVEL_BLOCKS.map(blk => {
      const blkGroups = groups.filter(g => levelOfGroup(g) === blk.level);
      if (!blkGroups.length) return '';

      const blkLessons = blkGroups.flatMap(builtIn);
      const blkDone = doneIn(blkLessons);
      const blkTotal = blkLessons.length;
      const isComplete = blkTotal > 0 && blkDone === blkTotal;
      const blkCollapsed = isCollapsed(blk.level, isComplete && blk.level !== heroBlock.level);

      // Numeração REINICIA a cada bloco (A2 começa em "Aula 01").
      let counter = 1;

      const groupsHtml = blkGroups.map(g => {
        const ls = builtIn(g);
        const key = 'g:' + g.id;
        const gDone = doneIn(ls);
        const hasNext = ls.some(l => l.slug === nextSlug);
        const gCollapsed = isCollapsed(key, !hasNext && !(nextGroup == null && g === blkGroups[0]));
        const listId = `g4pGroup-${escapeHtml(g.id)}`;

        let rows;
        if (ls.length) {
          rows = ls.map(L => rowHtml(L, counter++, nextSlug)).join('');
        } else {
          rows = (g.planned || []).map(t => `
            <div class="gs-row is-locked" aria-disabled="true">
              <span class="gs-rs">${icon('lock')}</span>
              <span class="gs-row-t"><b>${escapeHtml(t)}</b><small>Aula ${String(counter++).padStart(2, '0')} · em construção</small></span>
            </div>`).join('');
        }

        return `
          <div class="g4p-group" role="group" aria-label="Grupo ${escapeHtml(g.id)}" data-group="${escapeHtml(g.id)}">
            <button class="gs-secth g4p-group-head" type="button" data-collapse="${key}" aria-expanded="${gCollapsed ? 'false' : 'true'}" aria-controls="${listId}">
              <span>Grupo ${escapeHtml(g.id)} · ${escapeHtml(g.label)}</span>
              <small>${ls.length ? `${gDone} de ${ls.length}` : 'em breve'} ${icon('down')}</small>
            </button>
            <div class="gs-list" id="${listId}"${gCollapsed ? ' hidden' : ''}>${rows}</div>
          </div>`;
      }).join('');

      const bodyId = `g4pBlockBody-${escapeHtml(blk.level)}`;
      return `
        <div class="g4p-block${isComplete ? ' is-complete' : ''}" data-level="${escapeHtml(blk.level)}">
          <button class="g4p-block-head" type="button" data-collapse="${escapeHtml(blk.level)}" aria-expanded="${blkCollapsed ? 'false' : 'true'}" aria-controls="${bodyId}">
            <span class="g4p-block-badge">${escapeHtml(blk.level)}</span>
            <span class="g4p-block-copy"><b>${escapeHtml(blk.label)}</b><small>${escapeHtml(blk.tagline)}</small></span>
            <span class="g4p-block-count">${blkDone}/${blkTotal}</span>
            ${icon('down')}
          </button>
          <div class="g4p-block-body" id="${bodyId}"${blkCollapsed ? ' hidden' : ''}>${groupsHtml}</div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.gs-row[role="button"]').forEach(row => {
      const open = () => openLesson(row.dataset.slug);
      row.addEventListener('click', open);
      row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });

    // ── Recolher / expandir blocos e grupos ──
    grid.querySelectorAll('[data-collapse]').forEach(head => {
      head.addEventListener('click', () => {
        const target = $(head.getAttribute('aria-controls'));
        if (!target) return;
        const willCollapse = !target.hidden;
        target.hidden = willCollapse;
        head.setAttribute('aria-expanded', willCollapse ? 'false' : 'true');
        const map = loadCollapsed() || {};
        map[head.dataset.collapse] = willCollapse;
        saveCollapsed(map);
      });
    });
  }

  function bindHowModal() {
    const modal = $('g4pHowModal');
    if (!modal) return;
    const set = open => { modal.hidden = !open; };
    const btn = $('g4pHowBtn');
    if (btn) btn.addEventListener('click', () => set(true));
    modal.querySelectorAll('[data-how-close]').forEach(b => b.addEventListener('click', () => set(false)));
    modal.addEventListener('click', e => { if (e.target === modal) set(false); });
  }

  // Reenvia ao backend aulas concluídas que ficaram só no localStorage —
  // ex.: completadas deslogado, offline, ou antes de /api/scope4p existir.
  // Sem isso, uma falha de sync deixa a aula "presa" (renderRecap só dispara
  // o sync ao completar pela 1ª vez), e o contador da home nunca reflete.
  function resyncPendingLessons() {
    if (!getAuthToken()) return; // deslogado: nada a reenviar agora
    (window.Grilo4P.LESSONS || []).forEach(lesson => {
      const lp = lessonProg(lesson.slug);
      if (lp.completedAt && !lp.syncedAt) syncLessonToBackend(lesson);
    });
  }

  // Traz do servidor as aulas com progresso parcial (e as concluídas) —
  // é o que faz a retomada funcionar em OUTRO navegador/máquina, onde o
  // localStorage está vazio. Merge conservador: só preenche buracos, nunca
  // rebaixa uma ponta já conquistada localmente nem atrasa o marcador.
  function hydrateFromBackend() {
    if (!getAuthToken()) return Promise.resolve();
    return fetch('/api/scope4p/progress', {
      headers: { 'Authorization': 'Bearer ' + getAuthToken() },
    }).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(data => {
      let touched = false;
      (data.lessons || []).forEach(row => {
        const lesson = (window.Grilo4P.LESSONS || []).find(l => l.slug === row.lesson_slug);
        if (!lesson) return;
        const lp = lessonProg(lesson.slug);

        (row.items || []).forEach(it => {
          const st = itemState(lesson.slug, it.en);
          if (it.written_ok && !st.writtenOk) { st.writtenOk = true; touched = true; }
          if (it.heard_ok && !st.heardOk) { st.heardOk = true; touched = true; }
          if (it.spoken_ok && !st.spokenOk) { st.spokenOk = true; touched = true; }
        });

        if (row.completed_at && !lp.completedAt) {
          lp.completedAt = row.completed_at;
          lp.syncedAt = row.completed_at;
          delete lp.resume;
          touched = true;
        }

        // Marcador remoto só entra se for válido para o roteiro atual e
        // estiver ADIANTE do local (ou não houver local).
        if (!lp.completedAt && row.resume_step) {
          const total = buildSteps(lesson).length;
          const fpOk = !row.resume_fp || row.resume_fp === stepFingerprint(lesson);
          const ahead = !lp.resume || row.resume_step > lp.resume.idx;
          if (fpOk && ahead && row.resume_step > 0 && row.resume_step < total - 1) {
            lp.resume = {
              idx: row.resume_step,
              total,
              fp: stepFingerprint(lesson),
              at: row.resume_at || new Date().toISOString(),
            };
            touched = true;
          }
        }
      });
      if (touched) { saveProgress(progress); renderGrid(); }
    }).catch(err => {
      console.warn('[4P] hydrate falhou (usando progresso local):', err.message);
    });
  }

  // API pública do player — usada pela home ("continuar de onde parou"),
  // por testes e para depurar uma aula direto do console.
  window.Grilo4P.openLesson = openLesson;
  window.Grilo4P.buildSteps = buildSteps;

  // Aulas começadas e não terminadas, da mais recente para a mais antiga.
  window.Grilo4P.getResumable = function () {
    return (window.Grilo4P.LESSONS || [])
      .map(L => {
        const lp = lessonProg(L.slug);
        if (lp.completedAt) return null;
        const steps = buildSteps(L);
        const cp = readCheckpoint(L, steps.length);
        if (!cp) return null;
        return {
          slug: L.slug, title: L.title, icon: L.icon,
          step: cp.idx, total: steps.length,
          percent: Math.round((cp.idx / (steps.length - 1)) * 100),
          phase: phaseOfStep(steps[cp.idx]),
          at: cp.at,
        };
      })
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.at || 0) - Date.parse(a.at || 0));
  };

  // Lugar de cada aula na trilha, na mesma ordem e numeração da grade
  // (grupos em sequência; "Aula NN" reinicia a cada bloco de nível).
  function lessonPlaces() {
    const lessons = window.Grilo4P.LESSONS || [];
    const groups = window.Grilo4P.GROUPS || [];
    const out = [];
    LEVEL_BLOCKS.forEach(blk => {
      const blkGroups = groups.filter(g => levelOfGroup(g) === blk.level);
      const blkLessons = blkGroups.flatMap(g => lessons.filter(l => l.group === g.id));
      blkLessons.forEach((L, i) => {
        out.push({ lesson: L, group: groupOf(L), level: blk.level, num: i + 1, blockTotal: blkLessons.length });
      });
    });
    return out;
  }

  function describePlace(p) {
    const L = p.lesson;
    return {
      slug: L.slug, title: L.title, icon: L.icon, minutes: L.minutes || null,
      objective: L.objective || '',
      level: p.level, num: p.num, blockTotal: p.blockTotal,
      groupId: p.group ? p.group.id : null, groupLabel: p.group ? p.group.label : '',
      completed: !!lessonProg(L.slug).completedAt,
    };
  }

  window.Grilo4P.describeLesson = function (slug) {
    const p = lessonPlaces().find(x => x.lesson.slug === slug);
    return p ? describePlace(p) : null;
  };

  // A aula "comece aqui" da grade: a 1ª não concluída do produto inteiro.
  window.Grilo4P.getNextLesson = function () {
    const p = lessonPlaces().find(x => !lessonProg(x.lesson.slug).completedAt);
    return p ? describePlace(p) : null;
  };

  window.Grilo4P.countCompleted = function () {
    return (window.Grilo4P.LESSONS || []).filter(L => lessonProg(L.slug).completedAt).length;
  };

  window.Grilo4P.phaseInfo = function (id) {
    return PHASES.find(p => p.id === id) || null;
  };

  // Link direto: lessons.html?aula=<slug> abre o player naquela aula
  // (com a tela de retomada, se houver marcador). É o destino do herói
  // da home. Espera a hidratação para a retomada valer entre máquinas.
  function openFromUrl() {
    let slug = null;
    try { slug = new URLSearchParams(location.search).get('aula'); } catch (e) {}
    if (!slug) return;
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    if ($('g4pGrid')) openLesson(slug);
  }

  function init() {
    renderGrid();
    bindHowModal();
    // `ready`: resolve quando o progresso remoto já foi mesclado — a home
    // espera isso para mostrar a aula certa em outro navegador.
    window.Grilo4P.ready = hydrateFromBackend().then(openFromUrl);
    resyncPendingLessons();

    // Rede de segurança para o caso do aluno: aba fechada, navegador
    // encerrado, PC desligado no tranco. O localStorage já foi gravado a
    // cada passo; aqui só tentamos empurrar o parcial para o servidor.
    window.addEventListener('pagehide', flushPartialProgress);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushPartialProgress();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
