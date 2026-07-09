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

  function speak(text, btnEl) {
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
    try { return localStorage.getItem('grilo_token'); } catch (e) { return null; }
  }

  // Envia o escopo completo da aula (estado de cada ponta) ao backend.
  // O servidor faz merge monotônico e soma no /api/user/stats. Tolerante a
  // falha: se não houver token ou a rede cair, o progresso local não se perde.
  function syncLessonToBackend(lesson) {
    const token = getAuthToken();
    if (!token) return; // deslogado (ex.: piloto aberto direto) — só local

    const build = (arr, type) => arr.map(it => {
      const st = itemState(lesson.slug, it.en);
      return {
        item_type: type, en: it.en, pt: it.pt,
        written_ok: !!st.writtenOk, heard_ok: !!st.heardOk, spoken_ok: !!st.spokenOk,
      };
    });
    const payload = {
      lesson_group: lesson.group || null,
      completed: true,
      items: build(lesson.scope.words, 'word').concat(build(lesson.scope.phrases, 'phrase')),
    };

    fetch(`/api/scope4p/lessons/${encodeURIComponent(lesson.slug)}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(payload),
    }).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(res => {
      // Marca como sincronizada para não reenviar à toa
      try {
        const lp = lessonProg(lesson.slug);
        lp.syncedAt = new Date().toISOString();
        saveProgress(progress);
      } catch (e) {}
      console.log('[4P] aula sincronizada:', lesson.slug, res);
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
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
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

  // ─── Feedback rico (acerto/erro com ícone + título + detalhe) ─
  function setFeedback(el, kind, title, detailHtml) {
    if (!el) return;
    const icon = kind === 'good' ? '✓' : kind === 'warn' ? '!' : '✗';
    el.className = 'g4p-feedback is-' + kind;
    el.innerHTML = `
      <span class="g4p-feedback-ico" aria-hidden="true">${icon}</span>
      <span class="g4p-feedback-body">
        <b>${escapeHtml(title)}</b>
        ${detailHtml ? `<span>${detailHtml}</span>` : ''}
      </span>`;
    el.hidden = false;
  }

  // ─── Estado do player ────────────────────────────────────────
  let S = null; // sessão da aula aberta

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
    S = { lesson, steps: buildSteps(lesson), idx: 0 };
    buildPlayerDom();
    const overlay = $('g4pPlayer');
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    renderStep();
  }

  function closePlayer() {
    stopListening();
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    const overlay = $('g4pPlayer');
    if (overlay) overlay.hidden = true;
    document.body.style.overflow = '';
    S = null;
    renderGrid();
  }

  function next() {
    if (!S) return;
    if (S.idx < S.steps.length - 1) { S.idx++; renderStep(); }
  }

  function buildPlayerDom() {
    if ($('g4pPlayer')) return;
    const railHtml = PHASES.map((p, i) => `
      ${i > 0 ? '<span class="g4p-rail-link" aria-hidden="true"></span>' : ''}
      <span class="g4p-rail-node" data-phase="${p.id}">
        <i aria-hidden="true">${p.icon}</i><em>${p.label}</em>
      </span>`).join('');

    const root = document.createElement('div');
    root.id = 'g4pPlayer';
    root.hidden = true;
    root.innerHTML = `
      <div class="g4p-shell" role="dialog" aria-modal="true" aria-label="Aula — novo sistema">
        <div class="g4p-head">
          <div class="g4p-head-info">
            <span class="g4p-head-kicker" id="g4pHeadKicker">4 pontas</span>
            <span class="g4p-head-title" id="g4pHeadTitle"></span>
          </div>
          <div class="g4p-rail" id="g4pRail" aria-hidden="true">${railHtml}</div>
          <button class="g4p-close" id="g4pClose" type="button" aria-label="Fechar aula">×</button>
          <div class="g4p-progressbar"><span class="g4p-progressfill" id="g4pProgressFill"></span></div>
        </div>
        <div class="g4p-stage" id="g4pStage"></div>
      </div>`;
    document.body.appendChild(root);
    $('g4pClose').addEventListener('click', closePlayer);
  }

  function updateRail(activePhase) {
    const rail = $('g4pRail');
    if (!rail) return;
    const order = PHASES.map(p => p.id);
    const activeIdx = order.indexOf(activePhase);
    rail.querySelectorAll('.g4p-rail-node').forEach(node => {
      const idx = order.indexOf(node.dataset.phase);
      node.classList.toggle('is-active', idx === activeIdx);
      node.classList.toggle('is-done', idx < activeIdx);
    });
  }

  function renderStep() {
    const step = S.steps[S.idx];
    const grp = groupOf(S.lesson);
    $('g4pHeadTitle').textContent = S.lesson.title;
    $('g4pHeadKicker').textContent = grp ? `Grupo ${grp.id} · ${grp.label}` : 'Sistema 4 pontas';
    $('g4pProgressFill').style.width = `${Math.round((S.idx / (S.steps.length - 1)) * 100)}%`;
    updateRail(phaseOfStep(step));

    const stage = $('g4pStage');
    stage.scrollTop = 0;

    switch (step.t) {
      case 'cover':        return renderCover(stage);
      case 'theory':       return renderTheory(stage, step);
      case 'check':        return renderCheck(stage, step);
      case 'bridge':       return renderBridge(stage, step);
      case 'write-word':   return renderWriteWord(stage, step);
      case 'write-phrase': return renderWritePhrase(stage, step);
      case 'listen-speak': return renderListenSpeak(stage, step);
      case 'recap':        return renderRecap(stage);
    }
  }

  // ─── Telas ───────────────────────────────────────────────────
  function renderCover(stage) {
    const L = S.lesson;
    stage.innerHTML = `
      <div class="g4p-screen g4p-screen--wide g4p-cover">
        <span class="g4p-cover-icon">${escapeHtml(L.icon)}</span>
        <h2 class="g4p-cover-title">${escapeHtml(L.title)}</h2>
        <p class="g4p-cover-objective">${escapeHtml(L.objective)}</p>
        <div class="g4p-cover-chips">
          <span class="g4p-chip">${L.scope.words.length} palavras</span>
          <span class="g4p-chip">${L.scope.phrases.length} frases</span>
          <span class="g4p-chip">~${L.minutes} min</span>
        </div>
        <div class="g4p-cover-route" aria-hidden="true">
          <span>📖 aprende</span><i>→</i>
          <span>👁👂 checa</span><i>→</i>
          <span>✍️ escreve</span><i>→</i>
          <span>🎙 fala</span>
        </div>
        <p class="g4p-cover-note">Cada palavra e frase desta aula passa pelas 4 pontas. O que você escrever certo entra no seu vocabulário — o que você também ouvir e falar fica <b>dominado</b>.</p>
        <button class="g4p-btn g4p-btn-primary g4p-btn-lg" id="g4pNext" type="button">Começar aula</button>
      </div>`;
    $('g4pNext').addEventListener('click', next);
  }

  function renderTheory(stage, step) {
    const sec = S.lesson.sections[step.si];
    stage.innerHTML = `
      <div class="g4p-screen g4p-screen--wide g4p-theory">
        <span class="g4p-step-kicker">📖 Seção ${step.si + 1} de ${S.lesson.sections.length}</span>
        <h3 class="g4p-theory-title">${escapeHtml(sec.title)}</h3>
        <div class="g4p-theory-cols">
          <div class="g4p-theory-copy">
            <p class="g4p-theory-text">${sec.explanation}</p>
          </div>
          <div class="g4p-theory-side">
            <span class="g4p-side-label">Ouça e repita</span>
            <div class="g4p-examples">
              ${sec.examples.map((ex, i) => `
                <button class="g4p-example" type="button" data-speak-idx="${i}">
                  <span class="g4p-example-play" aria-hidden="true">▶</span>
                  <span class="g4p-example-body">
                    <span class="g4p-example-en">${escapeHtml(ex.en)}</span>
                    <span class="g4p-example-pt">${escapeHtml(ex.pt)}</span>
                  </span>
                </button>`).join('')}
            </div>
          </div>
        </div>
        <div class="g4p-screen-foot">
          <p class="g4p-tip">🔊 Toque nas frases para ouvir a pronúncia — quantas vezes quiser.</p>
          <button class="g4p-btn g4p-btn-primary" id="g4pNext" type="button">Continuar</button>
        </div>
      </div>`;
    stage.querySelectorAll('[data-speak-idx]').forEach(btn => {
      btn.addEventListener('click', () => speak(sec.examples[+btn.dataset.speakIdx].en, btn));
    });
    $('g4pNext').addEventListener('click', next);
  }

  function optionsHtml(options) {
    const letters = 'ABCD';
    return options.map((opt, i) => `
      <button class="g4p-option" type="button" data-opt="${i}">
        <span class="g4p-option-letter" aria-hidden="true">${letters[i] || ''}</span>
        <span class="g4p-option-text">${escapeHtml(opt)}</span>
        <span class="g4p-option-mark" aria-hidden="true"></span>
      </button>`).join('');
  }

  function renderCheck(stage, step) {
    const sec = S.lesson.sections[step.si];
    const cp = sec.checkpoint[step.ci];
    const isOuvir = cp.kind === 'ouvir';
    const mix = shuffleWithCorrect(cp.options, cp.correct);

    stage.innerHTML = `
      <div class="g4p-screen g4p-check">
        <span class="g4p-step-kicker">${isOuvir ? '👂 Ouvir — sem ler, só de ouvido' : '👁 Identificar'}</span>
        ${isOuvir ? `
          <button class="g4p-audio-big" id="g4pPlayAudio" type="button" aria-label="Ouvir áudio">
            <span class="g4p-audio-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            Ouvir
          </button>` : ''}
        <h3 class="g4p-check-prompt">${escapeHtml(cp.prompt)}</h3>
        <div class="g4p-options">${optionsHtml(mix.options)}</div>
        <div class="g4p-feedback" id="g4pFeedback" hidden></div>
        <div class="g4p-screen-foot g4p-screen-foot--end">
          <button class="g4p-btn g4p-btn-primary" id="g4pNext" type="button" hidden>Continuar</button>
        </div>
      </div>`;

    if (isOuvir) {
      const playBtn = $('g4pPlayAudio');
      playBtn.addEventListener('click', () => speak(cp.audio, playBtn));
      setTimeout(() => speak(cp.audio, playBtn), 350);
    }

    let answered = false;
    stage.querySelectorAll('.g4p-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const chosen = +btn.dataset.opt;
        const ok = chosen === mix.correct;
        const fb = $('g4pFeedback');
        stage.querySelectorAll('.g4p-option').forEach((b, i) => {
          b.disabled = true;
          if (i === mix.correct) b.classList.add('is-correct');
          else if (i === chosen && !ok) b.classList.add('is-wrong');
        });
        if (ok) {
          if (isOuvir) markSkill(S.lesson.slug, cp.item, 'heard');
          setFeedback(fb, 'good',
            isOuvir ? 'Entendeu de ouvido!' : 'Certo!',
            isOuvir ? 'Compreensão registrada para esta palavra.' : '');
        } else {
          setFeedback(fb, 'bad', 'Não foi essa.',
            `A resposta certa era: <b>${escapeHtml(cp.options[cp.correct])}</b>`);
        }
        $('g4pNext').hidden = false;
        $('g4pNext').focus();
      });
    });
    $('g4pNext').addEventListener('click', next);
  }

  function renderBridge(stage, step) {
    const isWrite = step.variant === 'write';
    stage.innerHTML = `
      <div class="g4p-screen g4p-bridge ${isWrite ? 'g4p-bridge--write' : 'g4p-bridge--speak'}">
        <span class="g4p-bridge-icon">${isWrite ? '✍️' : '🎙'}</span>
        <h3 class="g4p-bridge-title">${isWrite ? 'Agora escreve.' : 'Agora fala.'}</h3>
        <p class="g4p-bridge-text">${isWrite
          ? 'Você vai ouvir cada palavra e escrever o que ouviu — depois, escrever as frases da aula em inglês. O que você escrever certo entra no seu vocabulário.'
          : 'Última ponta: ouvir cada frase, mostrar que entendeu e falar em voz alta. É isso que transforma palavra aprendida em palavra dominada.'}</p>
        ${!isWrite && !speechSupported() ? '<p class="g4p-warn">Seu navegador não suporta reconhecimento de voz — esta etapa será mostrada, mas sem avaliação da fala. Tente o Chrome para a experiência completa.</p>' : ''}
        <button class="g4p-btn g4p-btn-primary g4p-btn-lg" id="g4pNext" type="button">${isWrite ? 'Vamos lá' : 'Bora falar'}</button>
      </div>`;
    $('g4pNext').addEventListener('click', next);
  }

  // ✍ Palavra — ditado: ouve o áudio (com dica em PT) e digita em inglês
  function renderWriteWord(stage, step) {
    const w = S.lesson.scope.words[step.wi];
    let attempts = 0;

    stage.innerHTML = `
      <div class="g4p-screen g4p-write">
        <span class="g4p-step-kicker">✍️ Escrever · palavra ${step.wi + 1} de ${S.lesson.scope.words.length}</span>
        <div class="g4p-panel">
          <button class="g4p-audio-big" id="g4pPlayAudio" type="button" aria-label="Ouvir palavra">
            <span class="g4p-audio-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            Ouvir
          </button>
          <p class="g4p-write-hint">Significa: <b>${escapeHtml(w.pt)}</b></p>
          <input class="g4p-input" id="g4pInput" type="text" autocomplete="off" autocapitalize="off"
                 spellcheck="false" placeholder="Escreva o que você ouviu" aria-label="Escreva a palavra em inglês">
          <div class="g4p-feedback" id="g4pFeedback" hidden></div>
        </div>
        <div class="g4p-write-actions">
          <button class="g4p-btn g4p-btn-primary" id="g4pSubmit" type="button">Verificar</button>
          <button class="g4p-btn g4p-btn-ghost" id="g4pNext" type="button" hidden>Continuar</button>
        </div>
      </div>`;

    const playBtn = $('g4pPlayAudio');
    playBtn.addEventListener('click', () => speak(w.en, playBtn));
    setTimeout(() => speak(w.en, playBtn), 350);

    const input = $('g4pInput');
    const fb = $('g4pFeedback');
    input.focus();

    function finish(pass) {
      input.disabled = true;
      input.classList.add(pass ? 'is-pass' : 'is-fail');
      $('g4pSubmit').hidden = true;
      $('g4pNext').hidden = false;
      $('g4pNext').focus();
      if (pass) {
        markSkill(S.lesson.slug, w.en, 'written');
        markSkill(S.lesson.slug, w.en, 'heard'); // ditado: escreveu o que ouviu
      }
    }

    function check() {
      const res = compareWord(input.value, w.en);
      if (res === 'empty') return;
      attempts++;
      if (res === 'pass') {
        setFeedback(fb, 'good', 'No vocabulário!',
          `<b>${escapeHtml(w.en)}</b> · ${escapeHtml(w.phonetic)} — ${escapeHtml(w.pt)}`);
        finish(true);
      } else if (res === 'almost' && attempts < MAX_WRITE_ATTEMPTS) {
        setFeedback(fb, 'warn', 'Quase!',
          'Uma letra fora do lugar — confira a grafia e tente de novo.');
        input.select();
      } else if (attempts < MAX_WRITE_ATTEMPTS) {
        setFeedback(fb, 'bad', 'Ainda não.',
          `Ouça de novo — dica de leitura: <b>${escapeHtml(w.phonetic)}</b>`);
        speak(w.en, playBtn);
        input.select();
      } else {
        setFeedback(fb, 'bad', `Era "${w.en}".`,
          `${escapeHtml(w.pt)} · ${escapeHtml(w.phonetic)} — ela volta em outra rodada, sem stress.`);
        finish(false);
      }
    }

    $('g4pSubmit').addEventListener('click', check);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    $('g4pNext').addEventListener('click', next);
  }

  // ✍ Frase — tradução digitada: PT na tela, digita em inglês
  function renderWritePhrase(stage, step) {
    const p = S.lesson.scope.phrases[step.pi];
    let attempts = 0;

    stage.innerHTML = `
      <div class="g4p-screen g4p-write">
        <span class="g4p-step-kicker">✍️ Escrever · frase ${step.pi + 1} de ${S.lesson.scope.phrases.length}</span>
        <div class="g4p-panel">
          <p class="g4p-write-pt">“${escapeHtml(p.pt)}”</p>
          <p class="g4p-write-hint">Escreva em inglês. Precisa de ajuda? <button class="g4p-linkbtn" id="g4pPlayAudio" type="button">🔊 ouça a frase</button></p>
          <input class="g4p-input" id="g4pInput" type="text" autocomplete="off" autocapitalize="off"
                 spellcheck="false" placeholder="Digite a frase em inglês" aria-label="Escreva a frase em inglês">
          <div class="g4p-worddiff" id="g4pWordDiff" hidden></div>
          <div class="g4p-feedback" id="g4pFeedback" hidden></div>
        </div>
        <div class="g4p-write-actions">
          <button class="g4p-btn g4p-btn-primary" id="g4pSubmit" type="button">Verificar</button>
          <button class="g4p-btn g4p-btn-ghost" id="g4pNext" type="button" hidden>Continuar</button>
        </div>
      </div>`;

    $('g4pPlayAudio').addEventListener('click', function () { speak(p.en, this); });

    const input = $('g4pInput');
    const fb = $('g4pFeedback');
    const diffEl = $('g4pWordDiff');
    input.focus();

    function showDiff(res) {
      diffEl.innerHTML = res.expTokens.map((t, i) =>
        `<span class="g4p-wchip ${res.matchedFlags[i] ? 'is-ok' : 'is-miss'}">${escapeHtml(t)}</span>`
      ).join('');
      diffEl.hidden = false;
    }

    function finish(pass, res) {
      input.disabled = true;
      input.classList.add(pass ? 'is-pass' : 'is-fail');
      $('g4pSubmit').hidden = true;
      $('g4pNext').hidden = false;
      $('g4pNext').focus();
      if (pass) {
        markSkill(S.lesson.slug, p.en, 'written');
        // palavras do escopo digitadas certo dentro da frase também contam como escritas
        const okTokens = new Set(res.expTokens.filter((_, i) => res.matchedFlags[i]));
        creditWordsViaPhrase(S.lesson, p.en, 'written', okTokens);
      }
    }

    function check() {
      if (!input.value.trim()) return;
      attempts++;
      const res = comparePhrase(input.value, p.en);
      showDiff(res);
      if (res.pass) {
        setFeedback(fb, 'good', 'Frase no vocabulário!',
          `<b>${escapeHtml(p.en)}</b> · ${escapeHtml(p.phonetic)}`);
        finish(true, res);
      } else if (attempts < MAX_WRITE_ATTEMPTS) {
        setFeedback(fb, 'warn', `${res.correct} de ${res.expTokens.length} palavras no lugar.`,
          'As vermelhas faltaram ou vieram diferentes — ajuste e tente de novo.');
        input.select();
      } else {
        setFeedback(fb, 'bad', 'Essa era difícil mesmo.',
          `A frase era: <b>${escapeHtml(p.en)}</b> · ${escapeHtml(p.phonetic)}`);
        finish(false, res);
      }
    }

    $('g4pSubmit').addEventListener('click', check);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    $('g4pNext').addEventListener('click', next);
  }

  // 👂🎙 Frase — dois tempos: (1) ouve sem ler e mostra que entendeu;
  // (2) fala a frase com reconhecimento de voz.
  function renderListenSpeak(stage, step) {
    const L = S.lesson;
    const p = L.scope.phrases[step.pi];

    // distratores: PT das outras frases da aula
    const others = L.scope.phrases.filter((_, i) => i !== step.pi).map(x => x.pt);
    const opts = [p.pt].concat(others.slice(0, 2));
    const mix = shuffleWithCorrect(opts, 0);

    stage.innerHTML = `
      <div class="g4p-screen g4p-speak">
        <span class="g4p-step-kicker">👂🎙 Ouvir e falar · frase ${step.pi + 1} de ${L.scope.phrases.length}</span>

        <div class="g4p-speak-stage1" id="g4pStage1">
          <button class="g4p-audio-big" id="g4pPlayAudio" type="button" aria-label="Ouvir frase">
            <span class="g4p-audio-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            Ouvir
          </button>
          <h3 class="g4p-check-prompt">O que essa frase quer dizer?</h3>
          <div class="g4p-options">${optionsHtml(mix.options)}</div>
          <div class="g4p-feedback" id="g4pFeedback1" hidden></div>
        </div>

        <div class="g4p-speak-stage2" id="g4pStage2" hidden>
          <div class="g4p-panel g4p-panel--speak">
            <p class="g4p-speak-phrase" id="g4pSpeakPhrase">${escapeHtml(p.en)}</p>
            <p class="g4p-speak-phon">${escapeHtml(p.phonetic)}</p>
            <div class="g4p-worddiff" id="g4pWordDiff" hidden></div>
            <div class="g4p-feedback" id="g4pFeedback2" hidden></div>
          </div>
          <div class="g4p-speak-actions">
            <button class="g4p-btn g4p-btn-mic" id="g4pMic" type="button">🎙 Falar agora</button>
            <button class="g4p-btn g4p-btn-ghost" id="g4pReplay" type="button">🔊 Ouvir de novo</button>
            <button class="g4p-btn g4p-btn-ghost" id="g4pSkip" type="button">Pular</button>
          </div>
          <div class="g4p-screen-foot g4p-screen-foot--end">
            <button class="g4p-btn g4p-btn-primary" id="g4pNext" type="button" hidden>Continuar</button>
          </div>
        </div>
      </div>`;

    const playBtn = $('g4pPlayAudio');
    playBtn.addEventListener('click', () => speak(p.en, playBtn));
    setTimeout(() => speak(p.en, playBtn), 350);

    // ── Tempo 1: compreensão ──
    let answered = false;
    stage.querySelectorAll('#g4pStage1 .g4p-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const chosen = +btn.dataset.opt;
        const ok = chosen === mix.correct;
        const fb = $('g4pFeedback1');
        stage.querySelectorAll('#g4pStage1 .g4p-option').forEach((b, i) => {
          b.disabled = true;
          if (i === mix.correct) b.classList.add('is-correct');
          else if (i === chosen && !ok) b.classList.add('is-wrong');
        });
        if (ok) {
          markSkill(L.slug, p.en, 'heard');
          creditWordsViaPhrase(L, p.en, 'heard', null);
          setFeedback(fb, 'good', 'Entendeu de ouvido!', 'Agora é a sua vez de falar.');
        } else {
          setFeedback(fb, 'bad', 'Não era essa.',
            `Essa frase quer dizer: <b>${escapeHtml(p.pt)}</b>. Agora fala ela aí.`);
        }
        setTimeout(() => {
          $('g4pStage1').hidden = true;
          $('g4pStage2').hidden = false;
        }, 1500);
      });
    });

    // ── Tempo 2: fala ──
    let speakAttempts = 0;
    const micBtn = $('g4pMic');
    const fb2 = $('g4pFeedback2');
    const diffEl = $('g4pWordDiff');

    $('g4pReplay').addEventListener('click', function () { speak(p.en, this); });

    function showSpeakDiff(ev) {
      diffEl.innerHTML = ev.expTokens.map((t, i) =>
        `<span class="g4p-wchip ${ev.matched[i] ? 'is-ok' : 'is-miss'}">${escapeHtml(t)}</span>`
      ).join('');
      diffEl.hidden = false;
    }

    function finishSpeak() {
      micBtn.disabled = true;
      $('g4pSkip').hidden = true;
      $('g4pNext').hidden = false;
      $('g4pNext').focus();
    }

    micBtn.addEventListener('click', () => {
      if (!speechSupported()) {
        setFeedback(fb2, 'warn', 'Sem reconhecimento de voz.',
          'Este navegador não suporta — tente o Chrome para a experiência completa.');
        finishSpeak();
        return;
      }
      micBtn.classList.add('is-listening');
      micBtn.textContent = '👂 Ouvindo…';
      fb2.hidden = true;

      startListening(alts => {
        micBtn.classList.remove('is-listening');
        micBtn.textContent = '🎙 Falar agora';
        speakAttempts++;
        const vr = VR();
        const ev = vr && vr.evaluate ? vr.evaluate(p.en, alts) : null;
        if (!ev) { finishSpeak(); return; }
        showSpeakDiff(ev);
        if (ev.passed) {
          markSkill(L.slug, p.en, 'spoken');
          const matchedTokens = new Set(ev.expTokens.filter((_, i) => ev.matched[i]));
          creditWordsViaPhrase(L, p.en, 'spoken', matchedTokens);
          setFeedback(fb2, 'good', 'Mandou bem!', 'Frase falada e registrada.');
          finishSpeak();
        } else if (speakAttempts < MAX_SPEAK_ATTEMPTS) {
          setFeedback(fb2, 'warn', `Ouvi: “${escapeHtml(ev.bestTranscript || '…')}”`,
            'As palavras vermelhas escaparam — ouça de novo e repita.');
        } else {
          setFeedback(fb2, 'bad', 'Essa ainda tá crua.',
            'Ela volta na revisão — segue o jogo.');
          finishSpeak();
        }
      }, errCode => {
        micBtn.classList.remove('is-listening');
        micBtn.textContent = '🎙 Falar agora';
        setFeedback(fb2, 'warn',
          errCode === 'not-allowed' ? 'Sem acesso ao microfone.' : 'Não consegui te ouvir.',
          errCode === 'not-allowed'
            ? 'Libere a permissão do microfone no navegador.'
            : 'Fala um pouco mais perto do microfone.');
      });
    });

    $('g4pSkip').addEventListener('click', next);
    $('g4pNext').addEventListener('click', next);
  }

  function renderRecap(stage) {
    const L = S.lesson;
    const lp = lessonProg(L.slug);
    if (!lp.completedAt) lp.completedAt = new Date().toISOString();
    saveProgress(progress);

    // Persiste no backend → alimenta o painel CEFR da home (vocab/frases/4 pontas)
    syncLessonToBackend(L);

    const sum = lessonSummary(L);

    function chipRow(items) {
      return items.map(it => {
        const s = itemStatus(itemState(L.slug, it.en));
        return `<span class="g4p-recap-chip is-${s}" title="${escapeHtml(it.pt)}">${escapeHtml(it.en)}</span>`;
      }).join('');
    }

    stage.innerHTML = `
      <div class="g4p-screen g4p-screen--wide g4p-recap">
        <span class="g4p-bridge-icon">🏁</span>
        <h3 class="g4p-recap-title">Aula concluída!</h3>
        <p class="g4p-recap-lead">Isso conta para o seu bloco A1 — e o que você conquistou fica registrado:</p>

        <div class="g4p-recap-stats">
          <div class="g4p-stat">
            <b>${sum.aprendidas}</b>
            <span>no vocabulário</span>
          </div>
          <div class="g4p-stat is-hero">
            <b>${sum.dominadas}</b>
            <span>dominadas<br>(escreveu + ouviu + falou)</span>
          </div>
          <div class="g4p-stat">
            <b>${sum.total}</b>
            <span>itens da aula</span>
          </div>
        </div>

        <div class="g4p-recap-cols">
          <div class="g4p-recap-group">
            <span class="g4p-recap-label">Palavras</span>
            <div class="g4p-recap-chips">${chipRow(L.scope.words)}</div>
          </div>
          <div class="g4p-recap-group">
            <span class="g4p-recap-label">Frases</span>
            <div class="g4p-recap-chips">${chipRow(L.scope.phrases)}</div>
          </div>
        </div>

        <div class="g4p-recap-legend">
          <span><i class="g4p-dot is-dominada"></i> dominada</span>
          <span><i class="g4p-dot is-aprendida"></i> aprendida (falta ouvir/falar)</span>
          <span><i class="g4p-dot is-nova"></i> a revisar</span>
        </div>

        <button class="g4p-btn g4p-btn-primary g4p-btn-lg" id="g4pFinish" type="button">Voltar às aulas</button>
      </div>`;
    $('g4pFinish').addEventListener('click', closePlayer);
  }

  // ─── Grid de cards (visão "Novo sistema") ───────────────────
  function cardHtml(L, num, isNext) {
    const sum = lessonSummary(L);
    const pct = sum.total ? Math.round((sum.aprendidas / sum.total) * 100) : 0;
    const done = !!sum.completedAt;
    const cta = done ? 'Revisar' : (sum.aprendidas > 0 ? 'Continuar' : 'Começar');
    const flag = done
      ? '<span class="g4p-card-flag is-done">✓ concluída</span>'
      : (isNext ? '<span class="g4p-card-flag is-next">▶ comece aqui</span>' : '');
    return `
      <article class="g4p-card ${done ? 'is-completed' : ''} ${isNext ? 'is-next' : ''}" data-slug="${escapeHtml(L.slug)}" tabindex="0" role="button"
               aria-label="Abrir aula ${escapeHtml(L.title)}">
        ${flag}
        <div class="g4p-card-top">
          <span class="g4p-card-icon">${escapeHtml(L.icon)}</span>
          <span class="g4p-card-order">Aula ${String(num).padStart(2, '0')}</span>
        </div>
        <h3 class="g4p-card-title">${escapeHtml(L.title)}</h3>
        <p class="g4p-card-meta">${L.scope.words.length} palavras · ${L.scope.phrases.length} frases · ~${L.minutes} min</p>
        <p class="g4p-card-objective">${escapeHtml(L.objective)}</p>
        <div class="g4p-card-foot">
          <span class="g4p-card-track"><span class="g4p-card-fill" style="width:${pct}%"></span></span>
          <div class="g4p-card-foot-row">
            <span class="g4p-card-stats">${sum.aprendidas}/${sum.total} no vocabulário · ${sum.dominadas} dominadas</span>
            <span class="g4p-card-cta">${cta} <i aria-hidden="true">→</i></span>
          </div>
        </div>
      </article>`;
  }

  function renderGrid() {
    const grid = $('g4pGrid');
    if (!grid) return;
    const lessons = window.Grilo4P.LESSONS || [];
    const groups = window.Grilo4P.GROUPS || [];

    // Progresso do bloco (gate A1→A2 = 20 aulas) — anel do hero
    const totalPlanned = groups.reduce((n, g) => {
      const built = lessons.filter(l => l.group === g.id).length;
      return n + Math.max(built, (g.planned || []).length);
    }, 0);
    const completed = lessons.filter(l => lessonProg(l.slug).completedAt).length;
    const ringFill = $('g4pRingFill');
    if (ringFill) {
      const CIRC = 2 * Math.PI * 40; // r=40 do SVG
      ringFill.style.strokeDasharray = String(CIRC);
      ringFill.style.strokeDashoffset = String(CIRC * (1 - (totalPlanned ? completed / totalPlanned : 0)));
    }
    const ringNum = $('g4pRingNum');
    if (ringNum) ringNum.textContent = completed;
    const ringTotal = $('g4pRingTotal');
    if (ringTotal) ringTotal.textContent = `de ${totalPlanned}`;
    const topbarPill = $('lessonsTopbarProgress');
    if (topbarPill) topbarPill.textContent = `${completed} de ${totalPlanned} concluídas`;

    // Numeração corrida das 20 aulas + próxima aula sugerida
    let counter = 1;
    let nextAssigned = false;

    grid.innerHTML = groups.map(g => {
      const ls = lessons.filter(l => l.group === g.id);
      const doneInGroup = ls.filter(l => lessonProg(l.slug).completedAt).length;
      const countLabel = ls.length
        ? `${doneInGroup}/${ls.length} concluídas`
        : `${(g.planned || []).length} aulas · em construção`;

      let inner;
      if (ls.length) {
        inner = `<div class="g4p-group-cards">${ls.map(L => {
          const num = counter++;
          const done = !!lessonProg(L.slug).completedAt;
          let isNext = false;
          if (!done && !nextAssigned) { isNext = true; nextAssigned = true; }
          return cardHtml(L, num, isNext);
        }).join('')}</div>`;
      } else {
        inner = `<div class="g4p-group-soon">
          ${(g.planned || []).map(t =>
            `<span class="g4p-soon-item"><i>${String(counter++).padStart(2, '0')}</i>${escapeHtml(t)}<em aria-hidden="true">🔒</em></span>`
          ).join('')}
        </div>`;
      }

      return `
        <section class="g4p-group ${ls.length ? '' : 'is-soon'}" data-group="${escapeHtml(g.id)}">
          <header class="g4p-group-head">
            <div class="g4p-group-id" aria-hidden="true">${escapeHtml(g.id)}</div>
            <div class="g4p-group-copy">
              <h2 class="g4p-group-title">${escapeHtml(g.label)}</h2>
              <p class="g4p-group-desc">${escapeHtml(g.desc)}</p>
            </div>
            <span class="g4p-group-count">${countLabel}</span>
          </header>
          ${inner}
        </section>`;
    }).join('');

    grid.querySelectorAll('.g4p-card').forEach(card => {
      const open = () => openLesson(card.dataset.slug);
      card.addEventListener('click', open);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
  }

  function init() {
    renderGrid();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
