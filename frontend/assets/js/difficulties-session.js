/* ============================================================
 *  Difficulties Session — modal fullscreen, meta semanal 7/7
 *  ============================================================
 *  Reusa o markup #difModal já presente em home.html.
 *  - Fila de itens (voice/quiz/shadow) intercalados; backend manda ordem inicial.
 *  - Aluno NÃO sai sem acertar tudo. Errou → feedback com resposta + dica → item vai pro fim da fila.
 *  - Cada acerto chama /api/difficulties/session/item-result e atualiza quadradinho.
 *  - No fim: tela de celebração (com bônus se completou 7/7).
 *
 *  API pública: window.openDifficultiesSession({ onClose })
 * ============================================================ */
(function () {
  'use strict';

  const API_BASE = '';
  const RECOGNITION_LANG = 'en-US';
  const MATCH_THRESHOLD = 0.7;  // % de palavras esperadas corretas
  const MIN_WORDS_TO_PASS = 2;

  let state = null;

  // ── Util ─────────────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }

  function token() {
    try { return sessionStorage.getItem('grilo_token'); } catch (_) { return null; }
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function toast(msg, type = 'info') {
    if (window.showGriloToast) window.showGriloToast(msg, type);
    else console.log('[DIF]', type, msg);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── TTS ──────────────────────────────────────────────────────
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    try { window.speechSynthesis.cancel(); } catch (_) {}
    const u = new SpeechSynthesisUtterance(text);
    u.lang = RECOGNITION_LANG;
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  }

  function stopSpeak() {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
  }

  // ── Web Speech ───────────────────────────────────────────────
  function getRecognition() {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = RECOGNITION_LANG;
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    return rec;
  }

  function normalizeWord(w) {
    if (window.GriloVR && window.GriloVR.normalizeWord) return window.GriloVR.normalizeWord(w);
    return String(w || '').toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, '').trim();
  }

  function tokenize(s) {
    if (window.GriloVR && window.GriloVR.tokenize) return window.GriloVR.tokenize(s);
    return String(s || '').toLowerCase().split(/\s+/).map(normalizeWord).filter(Boolean);
  }

  function compareVoice(expected, spoken) {
    const exp = tokenize(expected);
    const heard = new Set(tokenize(spoken));
    const correct = exp.filter(t => heard.has(t)).length;
    const ratio = exp.length ? correct / exp.length : 0;
    const passed = ratio >= MATCH_THRESHOLD && correct >= Math.min(MIN_WORDS_TO_PASS, exp.length);
    return { passed, correct, ratio };
  }

  // ── Modal lifecycle ──────────────────────────────────────────
  function showModal() {
    const m = $('difModal');
    if (!m) return;
    m.hidden = false;
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    const m = $('difModal');
    if (!m) return;
    m.hidden = true;
    m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    stopSpeak();
    if (state && state.recognition) {
      try { state.recognition.abort(); } catch (_) {}
    }
  }

  function bindClose() {
    const closeBtn = $('difModalClose');
    if (!closeBtn) return;
    closeBtn.onclick = () => {
      if (!state) { hideModal(); return; }
      // Mid-session: confirma sair (perde apenas a fila atual, acertos já contam)
      const abandoned = state.queue.length > 0 && !state.celebrated;
      if (abandoned) {
        if (!confirm('Sair da sessão? Seus acertos até aqui já valeram quadradinhos.')) return;
      }
      finishSession(true);
    };
  }

  function updateProgressUI() {
    if (!state) return;
    const progressFill = $('difModalProgressFill');
    const progressText = $('difModalProgressText');
    const progressWeek = $('difModalProgressWeek');
    const total = state.totalAtStart;
    const remaining = state.queue.length + (state.currentItem ? 1 : 0);
    const done = total - remaining;
    const pct = total ? Math.round((done / total) * 100) : 0;
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressText) progressText.textContent = `${done}/${total}`;
    if (progressWeek) progressWeek.textContent = `Semana: ${state.weeklyCount}/${state.weeklyTarget}`;
  }

  // ── API calls ────────────────────────────────────────────────
  async function apiStart() {
    const t = token();
    if (!t) throw new Error('no-token');
    const res = await fetch(`${API_BASE}/api/difficulties/session/start`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('start-failed');
    return res.json();
  }

  async function apiItemResult({ sessionId, source, itemId, correct, firstTry }) {
    const t = token();
    const res = await fetch(`${API_BASE}/api/difficulties/session/item-result`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        source,
        item_id: itemId,
        correct,
        first_try: firstTry,
      }),
    });
    if (!res.ok) throw new Error('item-result-failed');
    return res.json();
  }

  async function apiComplete(sessionId) {
    const t = token();
    const res = await fetch(`${API_BASE}/api/difficulties/session/complete`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });
    if (!res.ok) throw new Error('complete-failed');
    return res.json();
  }

  // ── Render: item card ────────────────────────────────────────
  function renderItem(item) {
    const body = $('difModalBody');
    if (!body) return;
    if (item.source === 'quiz') renderQuiz(item);
    else renderVoice(item);  // voice e shadow usam o mesmo trainer simples
  }

  // -- Voice / Shadow --
  function renderVoice(item) {
    const body = $('difModalBody');
    const sourceLabel = item.source === 'shadow' ? '🗣 Chat de voz' : '🎙 Pronúncia';
    body.innerHTML = `
      <div class="dif-item-card">
        <span class="dif-item-source dif-item-source--${item.source}">${sourceLabel}</span>
        <p class="dif-item-prompt">"${esc(item.phrase_en)}"</p>
        ${item.phrase_pt ? `<p class="dif-item-pt">${esc(item.phrase_pt)}</p>` : ''}
        <div class="dif-voice-recorder">
          <button type="button" class="dif-voice-mic" id="difVoiceMic" aria-label="Falar">🎙</button>
          <div class="dif-voice-status" id="difVoiceStatus">Ouça primeiro e depois repita.</div>
          <div class="dif-voice-transcript" id="difVoiceTranscript">—</div>
        </div>
        <div class="dif-item-actions">
          <button type="button" class="dif-btn dif-btn--ghost" id="difVoiceListen">🔊 Ouvir de novo</button>
        </div>
      </div>
    `;
    // Toca TTS na entrada
    setTimeout(() => speak(item.phrase_en), 350);

    $('difVoiceListen').onclick = () => speak(item.phrase_en);
    $('difVoiceMic').onclick = () => startListening(item);
  }

  function startListening(item) {
    const mic = $('difVoiceMic');
    const status = $('difVoiceStatus');
    const transcript = $('difVoiceTranscript');
    const rec = getRecognition();
    if (!rec) {
      status.textContent = 'Reconhecimento de voz não suportado neste navegador.';
      return;
    }
    state.recognition = rec;
    mic.classList.add('is-listening');
    status.textContent = 'Ouvindo… fale agora';
    transcript.textContent = '—';

    let captured = '';
    rec.onresult = (ev) => {
      const r = ev.results && ev.results[0] && ev.results[0][0];
      if (r) captured = r.transcript || '';
    };
    rec.onerror = (ev) => {
      console.warn('[DIF] rec error', ev.error);
      mic.classList.remove('is-listening');
      status.textContent = 'Não consegui ouvir. Tente de novo.';
    };
    rec.onend = () => {
      mic.classList.remove('is-listening');
      state.recognition = null;
      if (!captured) {
        status.textContent = 'Não captei nada — toque no microfone pra tentar de novo.';
        return;
      }
      transcript.textContent = `"${captured}"`;
      const cmp = compareVoice(item.phrase_en, captured);
      if (cmp.passed) {
        status.textContent = `✅ ${cmp.correct} palavra(s) acertadas. Boa!`;
        handleAnswer(item, true);
      } else {
        status.textContent = `❌ Não foi dessa vez (${cmp.correct} palavra(s) corretas).`;
        handleAnswer(item, false);
      }
    };
    try { rec.start(); } catch (e) {
      mic.classList.remove('is-listening');
      status.textContent = 'Erro ao iniciar microfone.';
    }
  }

  // -- Quiz (MCQ) --
  function renderQuiz(item) {
    const body = $('difModalBody');
    const options = shuffle([item.correct_answer].concat(item.wrong_answers || []).filter(Boolean));
    // Garante 4 opções se possível (não adiciona vazias)
    const dedup = Array.from(new Set(options));
    body.innerHTML = `
      <div class="dif-item-card">
        <span class="dif-item-source dif-item-source--quiz">📝 Exercício</span>
        <p class="dif-item-prompt">${esc(item.question_text)}</p>
        <div class="dif-item-actions" id="difQuizOptions">
          ${dedup.map((opt, i) => `
            <button type="button" class="dif-btn" data-opt="${esc(opt)}" data-idx="${i}">
              ${esc(opt)}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    const wrap = $('difQuizOptions');
    wrap.querySelectorAll('.dif-btn').forEach(btn => {
      btn.onclick = () => {
        const picked = btn.getAttribute('data-opt');
        const ok = picked === item.correct_answer;
        // marca botão
        wrap.querySelectorAll('.dif-btn').forEach(b => {
          b.disabled = true;
          if (b.getAttribute('data-opt') === item.correct_answer) b.classList.add('is-correct');
          else if (b === btn) b.classList.add('is-wrong');
        });
        setTimeout(() => handleAnswer(item, ok), 600);
      };
    });
  }

  // ── Fluxo principal ──────────────────────────────────────────
  async function handleAnswer(item, correct) {
    if (!state || !item) return;

    // Detecta se é 1ª tentativa do item (key = source:id; tracked em state.seenIds)
    const key = `${item.source}:${item.item_id}`;
    const firstTry = !state.seenIds.has(key);
    state.seenIds.add(key);

    let resp;
    try {
      resp = await apiItemResult({
        sessionId: state.sessionId,
        source: item.source,
        itemId: item.item_id,
        correct,
        firstTry,
      });
    } catch (e) {
      console.error('[DIF] item-result error', e);
      toast('Erro ao salvar resultado.', 'error');
      return;
    }

    if (resp && typeof resp.weekly_count === 'number') {
      state.weeklyCount = resp.weekly_count;
      state.weeklyTarget = resp.weekly_target || state.weeklyTarget;
    }

    if (correct) {
      // Item sai da fila (já foi removido de state.currentItem). Animar avanço e seguir.
      animateWeeklyTick();
      state.currentItem = null;
      updateProgressUI();
      if (resp && resp.week_just_completed) {
        // Pula direto pra celebração mesmo se ainda houver itens — semana cumprida.
        return finishSession(false, { weekJustCompleted: true });
      }
      advance();
    } else {
      // Mostra feedback e empurra item pro fim da fila
      showWrongFeedback(item);
    }
  }

  function animateWeeklyTick() {
    // Só visual no modal — o painel da home é re-rendered no close
    const week = $('difModalProgressWeek');
    if (!week) return;
    week.style.transform = 'scale(1.15)';
    setTimeout(() => { week.style.transform = ''; }, 300);
  }

  function showWrongFeedback(item) {
    const body = $('difModalBody');
    const correctAnswer = item.source === 'quiz'
      ? item.correct_answer
      : item.phrase_en;
    const hint = item.hint || '';
    const ptLine = (item.phrase_pt && item.source !== 'quiz')
      ? `<div class="dif-feedback-row">
           <span class="dif-feedback-label">Tradução</span>
           <span class="dif-feedback-value">${esc(item.phrase_pt)}</span>
         </div>` : '';
    body.innerHTML = `
      <div class="dif-feedback-card">
        <h3 class="dif-feedback-title">❌ Não foi dessa vez</h3>
        <div class="dif-feedback-row">
          <span class="dif-feedback-label">A resposta certa era</span>
          <span class="dif-feedback-value">"${esc(correctAnswer)}"</span>
        </div>
        ${ptLine}
        ${hint ? `<p class="dif-feedback-hint">💡 ${esc(hint)}</p>` : ''}
        <p class="dif-feedback-hint">Sem stress — esse item volta no final da fila. Você acerta na próxima.</p>
        <button type="button" class="dif-btn dif-btn--primary" id="difWrongContinue">Continuar</button>
      </div>
    `;
    if (item.source === 'voice' || item.source === 'shadow') {
      setTimeout(() => speak(item.phrase_en), 300);
    }
    $('difWrongContinue').onclick = () => {
      // Re-enfileira o item no fim
      const requeued = { ...item, __requeued: true };
      state.queue.push(requeued);
      state.currentItem = null;
      updateProgressUI();
      advance();
    };
  }

  function advance() {
    if (!state) return;
    if (state.queue.length === 0) {
      return finishSession(false);
    }
    const next = state.queue.shift();
    state.currentItem = next;
    updateProgressUI();
    renderItem(next);
  }

  async function finishSession(abandoned, opts = {}) {
    if (!state || state.finalizing) return;
    state.finalizing = true;
    state.celebrated = true;

    let resp = null;
    try {
      resp = await apiComplete(state.sessionId);
    } catch (e) {
      console.warn('[DIF] complete error', e);
    }

    renderCelebration({
      abandoned,
      weekJustCompleted: opts.weekJustCompleted || (resp && resp.week_completed),
      xp: (resp && resp.xp_earned) || 0,
      mastered: (resp && resp.items_mastered) || 0,
      weeklyCount: (resp && resp.weekly_count) || state.weeklyCount,
      weeklyTarget: (resp && resp.weekly_target) || state.weeklyTarget,
    });
  }

  function renderCelebration({ abandoned, weekJustCompleted, xp, mastered, weeklyCount, weeklyTarget }) {
    const body = $('difModalBody');
    let title, emoji, text, titleClass = '';

    if (weekJustCompleted) {
      emoji = '🏆';
      title = 'Modo Desafiado desbloqueado!';
      titleClass = 'dif-celebration-week-title';
      text = 'Você superou todas as dificuldades dessa semana. Está acima das expectativas — descanse até domingo.';
    } else if (abandoned) {
      emoji = '👋';
      title = 'Até logo';
      text = 'Seus acertos já foram salvos. Volte quando quiser pra continuar a meta semanal.';
    } else if (mastered > 0) {
      emoji = '✨';
      title = 'Boa sessão!';
      text = 'Cada acerto te aproxima do Modo Desafiado.';
    } else {
      emoji = '🌱';
      title = 'Sessão encerrada';
      text = 'Tente de novo quando puder — você vai acertar.';
    }

    body.innerHTML = `
      <div class="dif-celebration">
        <div class="dif-celebration-emoji">${emoji}</div>
        <h2 class="dif-celebration-title ${titleClass}">${esc(title)}</h2>
        <p class="dif-celebration-text">${esc(text)}</p>
        <div class="dif-celebration-stats">
          <div class="dif-celebration-stat">
            <span class="dif-celebration-stat-value">${mastered}</span>
            <span class="dif-celebration-stat-label">Dominadas</span>
          </div>
          <div class="dif-celebration-stat">
            <span class="dif-celebration-stat-value">+${xp}</span>
            <span class="dif-celebration-stat-label">XP</span>
          </div>
          <div class="dif-celebration-stat">
            <span class="dif-celebration-stat-value">${weeklyCount}/${weeklyTarget}</span>
            <span class="dif-celebration-stat-label">Semana</span>
          </div>
        </div>
        <button type="button" class="dif-btn dif-btn--primary" id="difCelebrationClose" style="margin-top:8px;">Fechar</button>
      </div>
    `;
    $('difCelebrationClose').onclick = () => {
      const cb = state && state.onClose;
      state = null;
      hideModal();
      if (typeof cb === 'function') cb({ ok: true });
    };
  }

  // ── API pública ──────────────────────────────────────────────
  async function open(opts = {}) {
    if (state && !state.finalizing) {
      console.warn('[DIF] session already open');
      return;
    }
    if (!token()) {
      toast('Entre na sua conta para abrir a sessão de dificuldades.', 'error');
      return;
    }

    // Estado inicial e UI de loading
    state = {
      sessionId: null,
      queue: [],
      currentItem: null,
      seenIds: new Set(),
      totalAtStart: 0,
      weeklyCount: 0,
      weeklyTarget: 7,
      onClose: opts.onClose,
      recognition: null,
      finalizing: false,
      celebrated: false,
    };

    bindClose();
    const body = $('difModalBody');
    if (body) body.innerHTML = `<p style="text-align:center; color:#888; padding:40px 0;">Carregando sessão…</p>`;
    showModal();

    let data;
    try {
      data = await apiStart();
    } catch (e) {
      console.error('[DIF] start error', e);
      if (body) body.innerHTML = `<p style="text-align:center; color:#a83220; padding:40px 0;">Erro ao iniciar a sessão. Feche e tente de novo.</p>`;
      return;
    }

    if (!data || !data.success) {
      const reason = data && data.reason;
      let msg = (data && data.message) || 'Não foi possível iniciar a sessão.';
      if (reason === 'week_completed') {
        msg = 'Você já superou suas dificuldades dessa semana. Volte na próxima!';
      } else if (reason === 'empty_pool') {
        msg = 'Sem dificuldades acumuladas. Continue praticando para gerar novos itens.';
      }
      if (body) body.innerHTML = `<p style="text-align:center; color:#5a5a5a; padding:40px 0;">${esc(msg)}</p>`;
      // Marca state como finalizing pra um close limpo
      state.finalizing = true;
      return;
    }

    state.sessionId = data.session_id;
    state.queue = (data.items || []).slice();
    state.totalAtStart = state.queue.length;
    state.weeklyCount = Number(data.weekly_count || 0);
    state.weeklyTarget = Number(data.weekly_target || 7);

    updateProgressUI();
    advance();
  }

  window.openDifficultiesSession = open;
})();
