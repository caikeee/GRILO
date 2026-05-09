/* ============================================================
 *  Phrase Voice Trainer — Exercício de voz pós-aula
 *  ============================================================
 *  Fluxo:
 *    1. GET /api/lessons/{id}/phrases  → 5 frases para a sessão
 *    2. Modal abre, timer roda (60s), TTS toca, Web Speech ouve
 *    3. Cada frase: verde por palavra acertada, vermelha por palavra errada
 *    4. Pular ou timeout → marca como difícil
 *    5. POST /api/lessons/{id}/phrases/result com resumo final
 *    6. Tela de resultado com card compartilhável
 * ============================================================ */
(function () {
  'use strict';

  const API_BASE_URL = window.location.origin;
  const PHRASE_TIME_PER_PHRASE_SEC = 25; // por frase (ajuste fino)
  const TOTAL_TIME_SEC = 90;             // teto total da sessão (5 frases)
  const RECOGNITION_LANG = 'en-US';
  const MATCH_THRESHOLD = 0.7;           // 70% das palavras = acerto
  const MIN_WORDS_TO_PASS = 2;           // mínimo de palavras-chave certas

  let state = null;

  // ─── Util ────────────────────────────────────────────────────
  function getAuthToken() {
    try { return localStorage.getItem('grilo_token'); } catch (e) { return null; }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function normalizeWord(w) {
    return String(w || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}'-]/gu, '')
      .trim();
  }

  function tokenize(s) {
    return String(s || '')
      .toLowerCase()
      .split(/\s+/)
      .map(normalizeWord)
      .filter(Boolean);
  }

  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // ─── Comparação palavra a palavra ────────────────────────────
  // Retorna { matched:[bool…], wrongWords:[…], score: 0..1, passed: bool }
  function wordLevelCompare(expected, spoken) {
    const expTokens = tokenize(expected);
    const heardSet = new Set(tokenize(spoken));
    const matched = expTokens.map(t => heardSet.has(t));
    const correctCount = matched.filter(Boolean).length;
    const score = expTokens.length ? correctCount / expTokens.length : 0;
    const wrongWords = expTokens.filter((t, i) => !matched[i]);
    const passed = score >= MATCH_THRESHOLD && correctCount >= Math.min(MIN_WORDS_TO_PASS, expTokens.length);
    return { matched, wrongWords, score, passed, expTokens, correctCount };
  }

  // ─── DOM ─────────────────────────────────────────────────────
  function buildModalDom() {
    if (document.getElementById('pvtRoot')) return;
    const root = document.createElement('div');
    root.id = 'pvtRoot';
    root.innerHTML = `
      <div class="pvt-overlay" id="pvtOverlay" hidden>
        <div class="pvt-shell" role="dialog" aria-labelledby="pvtTitle">

          <!-- Header -->
          <div class="pvt-head">
            <div>
              <span class="pvt-kicker">🎙 Prove que aprendeu</span>
              <h2 class="pvt-title" id="pvtTitle">Aula</h2>
            </div>
            <div class="pvt-meta">
              <span class="pvt-timer" id="pvtTimer">00:00</span>
              <button class="pvt-close" id="pvtClose" type="button" aria-label="Fechar">×</button>
            </div>
          </div>

          <!-- Card central da frase atual -->
          <div class="pvt-card" id="pvtCard">
            <div class="pvt-card-pos" id="pvtPos">Frase 1 de 5</div>

            <div class="pvt-phrase-en" id="pvtPhraseEn"></div>
            <div class="pvt-phrase-pt" id="pvtPhrasePt"></div>
            <div class="pvt-phrase-phon" id="pvtPhrasePhon"></div>

            <div class="pvt-warning" id="pvtWarning" hidden></div>

            <div class="pvt-actions">
              <button class="pvt-btn pvt-btn-listen" id="pvtListen" type="button">
                <span aria-hidden="true">🔊</span> Ouvir pronúncia
              </button>
              <button class="pvt-btn pvt-btn-mic" id="pvtMic" type="button">
                <span aria-hidden="true">🎙</span> <span id="pvtMicLabel">Falar</span>
              </button>
            </div>

            <div class="pvt-status" id="pvtStatus" aria-live="polite">Toque em <strong>Ouvir pronúncia</strong> e depois em <strong>Falar</strong>.</div>
            <div class="pvt-feedback" id="pvtFeedback" hidden></div>
          </div>

          <!-- Checklist lateral -->
          <aside class="pvt-checklist" id="pvtChecklist"></aside>

          <!-- Footer com ações -->
          <div class="pvt-foot">
            <button class="pvt-btn-ghost" id="pvtSkip" type="button">⏭ Pular — marcar como difícil</button>
            <button class="pvt-btn-ghost" id="pvtAbort" type="button">🔴 Encerrar sessão</button>
          </div>

        </div>
      </div>

      <!-- Tela de resultado -->
      <div class="pvt-overlay" id="pvtResultOverlay" hidden>
        <div class="pvt-result">
          <div class="pvt-result-head">
            <span class="pvt-kicker">Resultado</span>
            <h2 class="pvt-result-title" id="pvtResultTitle">Aula</h2>
          </div>
          <div class="pvt-result-summary" id="pvtResultSummary"></div>
          <ul class="pvt-result-list" id="pvtResultList"></ul>
          <div class="pvt-result-foot" id="pvtResultFoot"></div>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    // Bind events
    document.getElementById('pvtClose').onclick = () => {
      if (state && Object.keys(state.results || {}).length > 0) {
        if (!confirm('Encerrar a sessão? O progresso desta sessão será salvo.')) return;
      }
      closeAll(true);
    };
    document.getElementById('pvtAbort').onclick = () => {
      if (!confirm('Encerrar a sessão e ver o resultado?')) return;
      // Encerrar manual = vai pra tela de resultado (não fecha tudo)
      finalizeSession();
    };
    document.getElementById('pvtSkip').onclick  = () => skipCurrentPhrase();
    document.getElementById('pvtListen').onclick = () => speakCurrentPhrase();
    document.getElementById('pvtMic').onclick    = () => toggleMic();
  }

  // Esconde TODOS os overlays do PVT (mesmo sem state ativo)
  function hideAllOverlays() {
    const main = document.getElementById('pvtOverlay');
    const result = document.getElementById('pvtResultOverlay');
    if (main) { main.hidden = true; main.classList.add('pvt-is-hidden'); }
    if (result) { result.hidden = true; result.classList.add('pvt-is-hidden'); }
  }
  function showOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = false;
    el.classList.remove('pvt-is-hidden');
  }

  // ─── Estilos ─────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('pvtStyles')) return;
    const css = `
.pvt-overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(20, 20, 18, 0.55);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: pvtFadeIn 0.25s ease;
  font-family: 'Manrope', system-ui, -apple-system, sans-serif;
}
/* Garante que [hidden] ganhe sobre display:flex */
.pvt-overlay[hidden],
.pvt-overlay.pvt-is-hidden {
  display: none !important;
}
@keyframes pvtFadeIn { from { opacity: 0; } to { opacity: 1; } }

.pvt-shell {
  width: min(880px, 96vw);
  max-height: 92vh;
  background: #fcfbf8;
  border: 1px solid rgba(15, 15, 15, 0.08);
  border-radius: 16px;
  display: grid;
  grid-template-columns: 1fr 280px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "head head"
    "card check"
    "foot foot";
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(15,15,15,0.25);
}
@media (max-width: 760px) {
  .pvt-shell {
    grid-template-columns: 1fr;
    grid-template-areas: "head" "card" "check" "foot";
  }
}

.pvt-head {
  grid-area: head;
  padding: 18px 22px 14px;
  border-bottom: 1px solid rgba(15,15,15,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.pvt-kicker {
  display: block;
  font-size: 0.66rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #c44a2c;
  font-weight: 700;
  margin-bottom: 4px;
}
.pvt-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.12rem;
  margin: 0;
  font-weight: 700;
  color: #1c1c1c;
}
.pvt-meta { display: flex; align-items: center; gap: 14px; }
.pvt-timer {
  font-variant-numeric: tabular-nums;
  font-size: 1.08rem;
  font-weight: 700;
  color: #1c1c1c;
  background: rgba(196, 74, 44, 0.08);
  padding: 6px 12px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}
.pvt-timer.is-low { color: #c44a2c; animation: pvtPulse 1.1s ease infinite; }
@keyframes pvtPulse { 50% { transform: scale(1.06); } }
.pvt-close {
  width: 34px; height: 34px;
  border: 1px solid rgba(15,15,15,0.12);
  background: #fff; color: #1c1c1c;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
}

.pvt-card {
  grid-area: card;
  padding: 28px 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 360px;
}
.pvt-card-pos {
  font-size: 0.72rem;
  color: #9a8b7a;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
}
.pvt-phrase-en {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.0rem;
  line-height: 1.25;
  font-weight: 600;
  color: #1c1c1c;
  letter-spacing: -0.01em;
  margin-top: 4px;
}
.pvt-phrase-en .w {
  display: inline-block;
  padding: 0 2px;
  border-radius: 4px;
  transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease;
}
.pvt-phrase-en .w.is-correct {
  background: rgba(34, 139, 90, 0.16);
  color: #14532d;
}
.pvt-phrase-en .w.is-wrong {
  background: rgba(196, 74, 44, 0.18);
  color: #7a1c12;
  text-decoration: underline wavy rgba(196, 74, 44, 0.5);
  text-underline-offset: 4px;
  animation: pvtShake 0.4s ease;
}
@keyframes pvtShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
.pvt-phrase-pt {
  font-size: 0.95rem;
  color: #6b6b6b;
  font-style: italic;
}
.pvt-phrase-phon {
  font-family: 'Manrope', sans-serif;
  font-size: 0.86rem;
  color: #9a8b7a;
  letter-spacing: 0.04em;
}

.pvt-warning {
  margin-top: 6px;
  padding: 10px 12px;
  background: rgba(255, 196, 0, 0.12);
  border-left: 3px solid #d97706;
  border-radius: 6px;
  font-size: 0.82rem;
  color: #78350f;
  line-height: 1.5;
}

.pvt-actions {
  display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;
}
.pvt-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 18px;
  font-size: 0.9rem; font-weight: 600;
  border: 1px solid rgba(15,15,15,0.12);
  background: #fff; color: #1c1c1c;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.18s ease, border-color 0.18s ease;
}
.pvt-btn:hover { transform: translateY(-1px); background: #faf9f7; }
.pvt-btn-listen { border-color: rgba(2, 132, 199, 0.3); color: #0369a1; }
.pvt-btn-listen:hover { background: rgba(56, 189, 248, 0.08); }
.pvt-btn-mic {
  background: #c44a2c; color: #fff; border-color: #c44a2c;
}
.pvt-btn-mic:hover { background: #a23a1f; border-color: #a23a1f; }
.pvt-btn-mic.is-listening {
  animation: pvtMicPulse 1.1s ease infinite;
  background: #228b5a; border-color: #228b5a;
}
@keyframes pvtMicPulse { 50% { box-shadow: 0 0 0 8px rgba(34, 139, 90, 0.18); } }

.pvt-status {
  margin-top: 10px;
  font-size: 0.84rem;
  color: #6b6b6b;
  line-height: 1.5;
}
.pvt-feedback {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.86rem;
  font-weight: 500;
  line-height: 1.5;
}
.pvt-feedback.is-success {
  background: rgba(34, 139, 90, 0.10);
  color: #14532d;
  border: 1px solid rgba(34, 139, 90, 0.2);
}
.pvt-feedback.is-warning {
  background: rgba(196, 74, 44, 0.08);
  color: #7a1c12;
  border: 1px solid rgba(196, 74, 44, 0.2);
}

/* Checklist */
.pvt-checklist {
  grid-area: check;
  padding: 22px 18px;
  background: #f6f3ec;
  border-left: 1px solid rgba(15,15,15,0.06);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pvt-check-title {
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9a8b7a;
  font-weight: 700;
  margin-bottom: 6px;
}
.pvt-check-item {
  padding: 9px 10px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid rgba(15,15,15,0.04);
  border-left: 3px solid rgba(15,15,15,0.10);
  font-size: 0.84rem;
  color: #1c1c1c;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  line-height: 1.4;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.pvt-check-icon {
  flex-shrink: 0;
  font-weight: 700;
  width: 16px;
  text-align: center;
}
.pvt-check-text {
  flex: 1;
  word-break: break-word;
}
.pvt-check-item.is-current {
  border-left-color: #c44a2c;
  background: #fffaf6;
}
.pvt-check-item.is-current .pvt-check-icon::before { content: '▶'; color: #c44a2c; }
.pvt-check-item.is-done {
  border-left-color: #228b5a;
  color: #4a4a4a;
}
.pvt-check-item.is-done .pvt-check-icon::before { content: '✓'; color: #228b5a; }
.pvt-check-item.is-failed {
  border-left-color: #c44a2c;
  color: #7a1c12;
  background: rgba(196, 74, 44, 0.04);
}
.pvt-check-item.is-failed .pvt-check-icon::before { content: '⚠'; color: #c44a2c; }
.pvt-check-item:not(.is-current):not(.is-done):not(.is-failed) .pvt-check-icon::before { content: '☐'; color: #c4b8a8; }

.pvt-foot {
  grid-area: foot;
  padding: 14px 22px;
  border-top: 1px solid rgba(15,15,15,0.06);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  background: #faf9f7;
}
.pvt-btn-ghost {
  background: transparent;
  border: 1px solid rgba(15,15,15,0.10);
  padding: 8px 14px;
  font-size: 0.82rem;
  color: #6b6b6b;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}
.pvt-btn-ghost:hover { background: #fff; color: #1c1c1c; border-color: rgba(15,15,15,0.18); }

/* ── Tela de Resultado ─── */
.pvt-result {
  width: min(560px, 96vw);
  background: #fcfbf8;
  border: 1px solid rgba(15,15,15,0.08);
  border-radius: 16px;
  padding: 28px 30px 22px;
  box-shadow: 0 30px 80px rgba(15,15,15,0.25);
  font-family: 'Manrope', sans-serif;
}
.pvt-result-head { margin-bottom: 18px; }
.pvt-result-title {
  font-family: 'Space Grotesk', sans-serif;
  margin: 4px 0 0;
  font-size: 1.4rem;
  color: #1c1c1c;
}
.pvt-result-summary {
  font-size: 1.04rem;
  font-weight: 600;
  color: #1c1c1c;
  margin-bottom: 6px;
}
.pvt-result-bar {
  height: 8px;
  background: rgba(15,15,15,0.06);
  border-radius: 999px;
  overflow: hidden;
  margin: 6px 0 16px;
}
.pvt-result-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #228b5a 0%, #65b88a 100%);
  border-radius: 999px;
  transition: width 0.6s ease;
}
.pvt-result-list {
  list-style: none; padding: 0; margin: 0 0 18px;
  display: flex; flex-direction: column; gap: 8px;
}
.pvt-result-list li {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 10px 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid rgba(15,15,15,0.04);
  font-size: 0.88rem;
  line-height: 1.4;
}
.pvt-result-list li .ri { flex-shrink: 0; font-weight: 700; }
.pvt-result-list li.r-pass { border-left: 3px solid #228b5a; }
.pvt-result-list li.r-fail { border-left: 3px solid #c44a2c; color: #7a1c12; }
.pvt-result-foot {
  display: flex; gap: 10px; justify-content: flex-end; margin-top: 6px;
}
.pvt-result-foot .pvt-btn { padding: 9px 16px; }
.pvt-result-dominated {
  margin-top: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 600;
  color: #78350f;
  text-align: center;
  letter-spacing: 0.02em;
}
`;
    const tag = document.createElement('style');
    tag.id = 'pvtStyles';
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // ─── TTS ─────────────────────────────────────────────────────
  function speakCurrentPhrase() {
    if (!state || !state.currentPhrase) return;
    speakText(state.currentPhrase.phrase_en);
  }

  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = RECOGNITION_LANG;
      u.rate = 0.92;
      u.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => /en[-_]?(US|GB)/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
      if (enVoice) u.voice = enVoice;
      window.speechSynthesis.speak(u);
    } catch (e) { console.warn('[PVT] TTS error', e); }
  }

  // ─── Web Speech API ──────────────────────────────────────────
  function ensureRecognition() {
    if (state.recognition) return state.recognition;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setStatus('Seu navegador não suporta reconhecimento de voz. Tente no Chrome.', 'warning');
      return null;
    }
    const rec = new SR();
    rec.lang = RECOGNITION_LANG;
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 3;

    rec.onresult = (event) => {
      let transcript = '';
      // pega a melhor alternativa
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal && r[0]) {
          transcript += ' ' + r[0].transcript;
        }
      }
      // se não veio "final", pega tudo
      if (!transcript) {
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i][0]) transcript += ' ' + event.results[i][0].transcript;
        }
      }
      handleTranscript(transcript.trim());
    };
    rec.onend = () => {
      state.listening = false;
      const btn = document.getElementById('pvtMic');
      if (btn) {
        btn.classList.remove('is-listening');
        document.getElementById('pvtMicLabel').textContent = 'Falar';
      }
    };
    rec.onerror = (e) => {
      state.listening = false;
      console.warn('[PVT] Recognition error', e);
      const btn = document.getElementById('pvtMic');
      if (btn) {
        btn.classList.remove('is-listening');
        document.getElementById('pvtMicLabel').textContent = 'Falar';
      }
      if (e && e.error === 'not-allowed') {
        setStatus('Permissão de microfone negada. Habilite no navegador para continuar.', 'warning');
      } else if (e && e.error === 'no-speech') {
        setStatus('Não ouvimos nada. Toque em Falar e tente novamente.', 'warning');
      }
    };

    state.recognition = rec;
    return rec;
  }

  function toggleMic() {
    if (!state) return;
    const rec = ensureRecognition();
    if (!rec) return;

    if (state.listening) {
      try { rec.stop(); } catch (e) {}
      return;
    }

    try {
      rec.start();
      state.listening = true;
      const btn = document.getElementById('pvtMic');
      if (btn) {
        btn.classList.add('is-listening');
        document.getElementById('pvtMicLabel').textContent = 'Ouvindo…';
      }
      setStatus('Fale a frase em voz alta agora.', '');
    } catch (e) {
      console.warn('[PVT] Could not start recognition', e);
    }
  }

  // ─── Lógica de avaliação ─────────────────────────────────────
  function handleTranscript(transcript) {
    if (!state || !state.currentPhrase) return;
    const phrase = state.currentPhrase;
    const result = wordLevelCompare(phrase.phrase_en, transcript);

    // Atualiza visual da frase com palavras certas/erradas
    renderPhraseWithFeedback(phrase, result);

    // Fala dita
    state.lastTranscript = transcript;

    if (result.passed) {
      markPhraseResult('dominada', { wrong_words: [], transcript });
      setFeedback(`✓ Excelente! ${result.correctCount}/${result.expTokens.length} palavras corretas.`, 'success');
      setTimeout(() => advanceToNext(), 1100);
    } else {
      // Não passou — incrementa tentativas locais
      state.attemptsOnCurrent = (state.attemptsOnCurrent || 0) + 1;
      const wrongDisplay = result.wrongWords.slice(0, 4).map(w => `<strong>${escapeHtml(w)}</strong>`).join(', ');
      setFeedback(
        result.correctCount > 0
          ? `Quase! Errou: ${wrongDisplay}. Ouça e tente de novo.`
          : `Ainda não captamos. Toque em Ouvir pronúncia e tente outra vez.`,
        'warning'
      );
      // Após 3 tentativas falhas, marca como difícil e avança
      if (state.attemptsOnCurrent >= 3) {
        markPhraseResult('dificil', { wrong_words: result.wrongWords, transcript });
        setTimeout(() => advanceToNext(), 1400);
      }
    }
  }

  function renderPhraseWithFeedback(phrase, result) {
    const target = document.getElementById('pvtPhraseEn');
    if (!target) return;
    const tokens = phrase.phrase_en.split(/(\s+)/); // mantém os espaços
    const expIdxByNorm = (() => {
      const out = [];
      let cursor = 0;
      tokens.forEach(t => {
        const norm = normalizeWord(t);
        if (norm) { out.push({ raw: t, idx: cursor++ }); } else { out.push({ raw: t, idx: -1 }); }
      });
      return out;
    })();

    const html = expIdxByNorm.map(({ raw, idx }) => {
      if (idx < 0) return raw;
      const ok = result.matched[idx];
      const cls = ok ? 'is-correct' : 'is-wrong';
      return `<span class="w ${cls}">${escapeHtml(raw)}</span>`;
    }).join('');

    target.innerHTML = html;
  }

  function renderPhraseClean(phrase) {
    const target = document.getElementById('pvtPhraseEn');
    if (!target) return;
    target.innerHTML = phrase.phrase_en
      .split(/(\s+)/)
      .map(part => {
        if (/^\s+$/.test(part)) return part;
        return `<span class="w">${escapeHtml(part)}</span>`;
      }).join('');
  }

  // ─── Marcação de resultado por frase ─────────────────────────
  function markPhraseResult(result, extra) {
    if (!state || !state.currentPhrase) return;
    const phrase = state.currentPhrase;
    state.results[phrase.id] = {
      phrase_id: phrase.id,
      result,
      wrong_words: (extra && extra.wrong_words) || [],
      transcript: (extra && extra.transcript) || '',
    };

    // Atualiza checklist UI
    const item = document.querySelector(`.pvt-check-item[data-id="${phrase.id}"]`);
    if (item) {
      item.classList.remove('is-current', 'is-done', 'is-failed');
      item.classList.add(result === 'dominada' ? 'is-done' : 'is-failed');
    }
  }

  function skipCurrentPhrase() {
    if (!state || !state.currentPhrase) return;
    markPhraseResult('pulada', { wrong_words: [] });
    setFeedback('Frase marcada como difícil. Vai aparecer no painel para revisão.', 'warning');
    setTimeout(() => advanceToNext(), 600);
  }

  function advanceToNext() {
    if (!state) return;
    state.currentIdx += 1;
    state.attemptsOnCurrent = 0;

    if (state.currentIdx >= state.phrases.length) {
      finalizeSession();
      return;
    }
    state.currentPhrase = state.phrases[state.currentIdx];
    renderCurrentPhrase();
  }

  function renderCurrentPhrase() {
    const phrase = state.currentPhrase;
    document.getElementById('pvtPos').textContent = `Frase ${state.currentIdx + 1} de ${state.phrases.length}`;
    document.getElementById('pvtPhrasePt').textContent = phrase.phrase_pt || '';
    document.getElementById('pvtPhrasePhon').textContent = phrase.phonetic || '';

    const warning = document.getElementById('pvtWarning');
    if (phrase.warning_pt) {
      warning.hidden = false;
      warning.innerHTML = `⚠ ${escapeHtml(phrase.warning_pt)}`;
    } else {
      warning.hidden = true;
    }

    renderPhraseClean(phrase);

    // Reset feedback
    setFeedback('', '');
    setStatus('Toque em <strong>Ouvir pronúncia</strong> e depois em <strong>Falar</strong>.', '');

    // Atualiza checklist
    document.querySelectorAll('.pvt-check-item').forEach(el => el.classList.remove('is-current'));
    const cur = document.querySelector(`.pvt-check-item[data-id="${phrase.id}"]`);
    if (cur && !cur.classList.contains('is-done') && !cur.classList.contains('is-failed')) {
      cur.classList.add('is-current');
    }

    // Auto play TTS na primeira aparição
    if (!state.spokenIds.has(phrase.id)) {
      state.spokenIds.add(phrase.id);
      setTimeout(() => speakText(phrase.phrase_en), 280);
    }
  }

  function setStatus(html, level) {
    const el = document.getElementById('pvtStatus');
    if (!el) return;
    el.innerHTML = html;
    el.className = 'pvt-status' + (level ? ' is-' + level : '');
  }

  function setFeedback(html, level) {
    const el = document.getElementById('pvtFeedback');
    if (!el) return;
    if (!html) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    el.innerHTML = html;
    el.className = 'pvt-feedback' + (level ? ' is-' + level : '');
  }

  // ─── Timer ───────────────────────────────────────────────────
  function startTimer() {
    state.startedAt = Date.now();
    state.remaining = TOTAL_TIME_SEC;
    updateTimerUI();
    state.timerInterval = setInterval(() => {
      state.remaining = Math.max(0, TOTAL_TIME_SEC - Math.round((Date.now() - state.startedAt) / 1000));
      updateTimerUI();
      if (state.remaining <= 0) {
        clearInterval(state.timerInterval);
        // Marca todas as restantes como puladas
        state.phrases.forEach(p => {
          if (!state.results[p.id]) {
            state.results[p.id] = { phrase_id: p.id, result: 'pulada', wrong_words: [], transcript: '' };
            const item = document.querySelector(`.pvt-check-item[data-id="${p.id}"]`);
            if (item) item.classList.add('is-failed');
          }
        });
        finalizeSession();
      }
    }, 250);
  }

  function updateTimerUI() {
    const el = document.getElementById('pvtTimer');
    if (!el) return;
    el.textContent = fmtTime(state.remaining);
    el.classList.toggle('is-low', state.remaining <= 15);
  }

  // ─── Finalização ─────────────────────────────────────────────
  async function finalizeSession() {
    if (!state || state.finalizing) return;
    state.finalizing = true;
    if (state.timerInterval) clearInterval(state.timerInterval);
    if (state.recognition) {
      try { state.recognition.stop(); } catch (e) {}
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    // Garante que toda frase tem um resultado (frases não-tocadas viram puladas)
    state.phrases.forEach(p => {
      if (!state.results[p.id]) {
        state.results[p.id] = { phrase_id: p.id, result: 'pulada', wrong_words: [], transcript: '' };
      }
    });

    const phrasesPayload = state.phrases.map(p => state.results[p.id]);
    const duration = Math.round((Date.now() - state.startedAt) / 1000);

    let backendData = null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/lessons/${state.lessonId}/phrases/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          lesson_id: state.lessonId,
          phrases: phrasesPayload,
          duration_seconds: duration,
        }),
      });
      if (res.ok) backendData = await res.json();
    } catch (e) {
      console.error('[PVT] Save error', e);
    }

    showResult(phrasesPayload, backendData);
  }

  function showResult(phrasesPayload, backendData) {
    // Garante que o modal de exercício some — só o resultado fica visível
    const mainO = document.getElementById('pvtOverlay');
    if (mainO) { mainO.hidden = true; mainO.classList.add('pvt-is-hidden'); }
    showOverlay('pvtResultOverlay');

    const dominated = phrasesPayload.filter(p => p.result === 'dominada').length;
    const total = state.phrases.length;
    const attempted = phrasesPayload.filter(p => p.result === 'dominada' || p.result === 'dificil').length;
    const pct = total > 0 ? Math.round((dominated / total) * 100) : 0;

    const lessonTitle = state.lessonTitle || `Aula ${state.lessonId}`;
    document.getElementById('pvtResultTitle').textContent = lessonTitle;

    const summaryEl = document.getElementById('pvtResultSummary');
    if (attempted === 0) {
      // Encerrou antes de tentar qualquer frase — mostra mensagem clara
      summaryEl.innerHTML = `
        <div style="font-size:0.94rem;color:#6b6b6b;font-weight:500;">
          Nenhuma frase foi avaliada nesta sessão.<br>
          Volte quando quiser e tente de novo.
        </div>
      `;
    } else {
      summaryEl.innerHTML = `
        ${dominated} de ${total} frases dominadas
        <div class="pvt-result-bar"><div class="pvt-result-bar-fill" style="width:${pct}%"></div></div>
      `;
    }

    const listEl = document.getElementById('pvtResultList');
    listEl.innerHTML = state.phrases.map(p => {
      const r = state.results[p.id];
      const ok = r && r.result === 'dominada';
      return `
        <li class="${ok ? 'r-pass' : 'r-fail'}">
          <span class="ri">${ok ? '✓' : '⚠'}</span>
          <div>
            <div><strong>${escapeHtml(p.phrase_en)}</strong></div>
            <div style="font-size:0.78rem;color:#6b6b6b;">${escapeHtml(p.phrase_pt || '')}</div>
            ${ok ? '' : '<div style="font-size:0.74rem;color:#9a8b7a;margin-top:2px;">→ adicionada às dificuldades para revisão</div>'}
          </div>
        </li>
      `;
    }).join('');

    let dominatedBlock = '';
    if (backendData && backendData.just_dominated_lesson) {
      dominatedBlock = `<div class="pvt-result-dominated">★ Aula DOMINADA — ${backendData.dominated_in_lesson}/${backendData.total_in_lesson} frases</div>`;
    } else if (backendData && backendData.dominated_in_lesson != null) {
      dominatedBlock = `<div class="pvt-result-dominated" style="background:rgba(34,139,90,0.10);color:#14532d;">${backendData.dominated_in_lesson}/${backendData.total_in_lesson} frases dominadas nesta aula</div>`;
    }

    const xpEarned = (backendData && backendData.xp_earned) || 0;
    const footEl = document.getElementById('pvtResultFoot');
    footEl.innerHTML = `
      ${dominatedBlock}
      ${xpEarned > 0 ? `<div style="margin-top:8px; text-align:right; color:#228b5a; font-weight:600;">+${xpEarned} XP</div>` : ''}
      <button class="pvt-btn-ghost" id="pvtResultClose" type="button">Continuar</button>
      <button class="pvt-btn pvt-btn-listen" id="pvtResultRetry" type="button">Tentar de novo</button>
    `;

    document.getElementById('pvtResultClose').onclick = () => {
      closeAll(false);
      try {
        if (typeof window.loadUserDifficulties === 'function') window.loadUserDifficulties();
        if (typeof window.loadLessonProgress === 'function') window.loadLessonProgress();
        if (typeof window.loadUserStats === 'function') window.loadUserStats();
      } catch (e) {}
    };
    document.getElementById('pvtResultRetry').onclick = () => {
      closeAll(false);
      window.openPhraseVoiceTrainer(state.lessonId, state.lessonTitle);
    };
  }

  function closeAll(doRefresh) {
    if (state) {
      if (state.timerInterval) clearInterval(state.timerInterval);
      if (state.recognition) {
        try { state.recognition.stop(); } catch (e) {}
      }
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    hideAllOverlays();
    if (doRefresh) {
      try {
        if (typeof window.loadUserDifficulties === 'function') window.loadUserDifficulties();
        if (typeof window.loadLessonProgress === 'function') window.loadLessonProgress();
      } catch (e) {}
    }
    state = null;
  }

  // ─── Boot da sessão ──────────────────────────────────────────
  async function open(lessonId, lessonTitle) {
    if (!lessonId) return;

    injectStyles();
    buildModalDom();

    // Reset agressivo: garante que NENHUM resíduo de sessão anterior aparece
    if (state) {
      if (state.timerInterval) clearInterval(state.timerInterval);
      if (state.recognition) { try { state.recognition.stop(); } catch (e) {} }
      state = null;
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    hideAllOverlays();

    const token = getAuthToken();
    if (!token) {
      alert('Você precisa estar logado para fazer o exercício de voz.');
      return;
    }

    // Carrega frases
    let payload = null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/phrases`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) payload = await res.json();
    } catch (e) {
      console.error('[PVT] Load phrases error', e);
    }

    if (!payload || !Array.isArray(payload.phrases) || payload.phrases.length === 0) {
      alert('Esta aula ainda não tem frases para o exercício de voz.');
      return;
    }

    state = {
      lessonId,
      lessonTitle: lessonTitle || `Aula ${lessonId}`,
      phrases: payload.phrases,
      currentIdx: 0,
      currentPhrase: payload.phrases[0],
      results: {},
      attemptsOnCurrent: 0,
      spokenIds: new Set(),
      listening: false,
      recognition: null,
      timerInterval: null,
      remaining: TOTAL_TIME_SEC,
      finalizing: false,
    };

    // Render checklist
    const cl = document.getElementById('pvtChecklist');
    cl.innerHTML = `
      <div class="pvt-check-title">Checklist · ${state.phrases.length} frases</div>
      ${state.phrases.map(p => `
        <div class="pvt-check-item" data-id="${p.id}">
          <span class="pvt-check-icon"></span>
          <span class="pvt-check-text">${escapeHtml(p.phrase_en)}</span>
        </div>
      `).join('')}
    `;

    // Marca primeira como atual
    const first = cl.querySelector('.pvt-check-item');
    if (first) first.classList.add('is-current');

    // Set título no head
    document.getElementById('pvtTitle').textContent = state.lessonTitle;

    // Garante que o resultado anterior fica escondido e mostra só o exercício
    const resO = document.getElementById('pvtResultOverlay');
    if (resO) { resO.hidden = true; resO.classList.add('pvt-is-hidden'); }
    showOverlay('pvtOverlay');

    renderCurrentPhrase();
    startTimer();

    // Garante voices carregadas
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }

  // Expor API
  window.openPhraseVoiceTrainer = open;
  window.closePhraseVoiceTrainer = () => closeAll(true);

})();
