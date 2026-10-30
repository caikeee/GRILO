/* GRILO — TTS compartilhado das aulas.
 *
 * Fala em inglês com a voz neural do backend (/api/tts, Orpheus) — a mesma do
 * Chat de Voz. A voz nativa do navegador é só o plano B (sem login, offline,
 * limite de uso ou erro do servidor): no iPhone ela soa como português lendo
 * inglês, por isso o fallback escolhe a melhor voz en-US instalada.
 *
 * API: window.GriloTTS.speak(text, { rate, onstart, onend }) → Promise
 *      window.GriloTTS.stop() / .preload([textos])
 *      window._griloSpeak(text, btnEl) — gancho usado por lessons-4p.js
 */
(function () {
  'use strict';

  const MAX_CACHE = 60;
  const cache = new Map();      // chave → blob URL do WAV
  const inflight = new Map();   // chave → Promise do fetch em andamento
  let seq = 0;                  // invalida falas canceladas/substituídas
  let audioEl = null;           // um único <audio>: o iOS só libera play() assíncrono nele
  let unlocked = false;
  let ttsDown = false;          // servidor sem TTS neural nesta sessão → vai direto ao fallback

  function token() {
    try { return window.authToken || sessionStorage.getItem('grilo_token'); } catch (e) { return null; }
  }

  function getAudio() {
    if (!audioEl) {
      audioEl = new Audio();
      audioEl.preload = 'auto';
      audioEl.setAttribute('playsinline', '');
    }
    return audioEl;
  }

  // iOS/Safari bloqueia audio.play() fora de um gesto; como o áudio chega depois
  // de um fetch, "destrava" o elemento no primeiro toque do aluno.
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    try {
      const a = getAudio();
      a.muted = true;
      a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      const p = a.play();
      const done = () => { a.pause(); a.muted = false; };
      if (p && p.then) p.then(done, done); else done();
    } catch (e) { /* segue sem destravar */ }
  }
  ['pointerdown', 'touchstart', 'keydown'].forEach(ev =>
    document.addEventListener(ev, unlock, { once: true, passive: true, capture: true }));

  // Áudios pré-gerados (scripts/gen_lesson_audio.py): texto → arquivo estático.
  // Sem custo, sem limite e sem depender de login. Se o manifesto não carregar
  // ou o texto não estiver nele, segue para /api/tts e depois voz nativa.
  const AUDIO_BASE = 'assets/audio/';
  let manifest = null;
  const manifestReady = fetch(AUDIO_BASE + 'manifest.json')
    .then(r => (r.ok ? r.json() : null))
    .then(m => { manifest = (m && m.files) || {}; })
    .catch(() => { manifest = {}; });

  function keyOf(text, rate) { return rate + '|' + text; }

  function remember(key, url) {
    cache.set(key, url);
    if (cache.size > MAX_CACHE) {
      const oldest = cache.keys().next().value;
      try { URL.revokeObjectURL(cache.get(oldest)); } catch (e) {}
      cache.delete(oldest);
    }
  }

  function b64ToBlobUrl(b64, type) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: type || 'audio/wav' }));
  }

  // Retorna blob URL, ou null quando deve cair no fallback do navegador.
  function fetchNeural(text, rate) {
    const key = keyOf(text, rate);
    if (cache.has(key)) return Promise.resolve(cache.get(key));
    if (inflight.has(key)) return inflight.get(key);
    const tk = token();
    if (!tk || ttsDown) return Promise.resolve(null);

    const p = fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk },
      body: JSON.stringify({ text: text.slice(0, 500), lang: 'en', speed: rate }),
      signal: (window.AbortSignal && AbortSignal.timeout) ? AbortSignal.timeout(10000) : undefined,
    }).then(r => {
      if (!r.ok) return null;
      return r.json();
    }).then(d => {
      if (!d) return null;
      if (d.fallback || !d.audio_base64) {
        if (d.reason === 'no_api_key') ttsDown = true;
        return null;
      }
      const url = b64ToBlobUrl(d.audio_base64, d.content_type);
      remember(key, url);
      return url;
    }).catch(() => null).finally(() => inflight.delete(key));

    inflight.set(key, p);
    return p;
  }

  // ── Fallback: melhor voz en-US que o aparelho tiver ──────────────
  let pickedVoice;
  function pickVoice() {
    if (pickedVoice !== undefined) return pickedVoice;
    const synth = window.speechSynthesis;
    const voices = synth && synth.getVoices ? synth.getVoices() : [];
    if (!voices.length) return null; // ainda carregando — tenta de novo na próxima fala
    const en = voices.filter(v => /^en[-_]US$/i.test(v.lang));
    const score = v => {
      const n = v.name.toLowerCase();
      let s = 0;
      if (/premium|enhanced/.test(n)) s += 6;
      if (/samantha|ava|allison|nicky|zoe|evan|nathan|siri/.test(n)) s += 4;
      if (/google|natural|neural/.test(n)) s += 3;
      if (!v.localService) s += 1;
      if (/compact|novelty|bad news|bahh|bells|boing|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox/.test(n)) s -= 10;
      return s;
    };
    en.sort((a, b) => score(b) - score(a));
    pickedVoice = en[0] || voices.find(v => /^en/i.test(v.lang)) || null;
    return pickedVoice;
  }
  if (window.speechSynthesis && window.speechSynthesis.addEventListener) {
    window.speechSynthesis.addEventListener('voiceschanged', () => { pickedVoice = undefined; });
  }

  function speakNative(text, rate, onstart, onend) {
    return new Promise(resolve => {
      const synth = window.speechSynthesis;
      if (!synth || !text) { if (onend) onend(); resolve(); return; }
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        const v = pickVoice();
        if (v) u.voice = v;
        u.rate = rate;
        u.onstart = () => { if (onstart) onstart(); };
        u.onend = u.onerror = () => { if (onend) onend(); resolve(); };
        synth.speak(u);
      } catch (e) { if (onend) onend(); resolve(); }
    });
  }

  function stop() {
    seq++;
    try { if (audioEl) { audioEl.pause(); audioEl.removeAttribute('src'); audioEl.load(); } } catch (e) {}
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  }

  function playUrl(url, mySeq, onstart, onend, playbackRate) {
    return new Promise(resolve => {
      const a = getAudio();
      a.preservesPitch = true;
      a.webkitPreservesPitch = true;
      const pr = playbackRate || 1;
      a.defaultPlaybackRate = pr; // trocar o src reseta o playbackRate para este valor
      const finish = () => { a.onended = a.onerror = null; if (mySeq === seq && onend) onend(); resolve(true); };
      a.onended = finish;
      // arquivo ausente/corrompido: devolve false para o chamador tentar o próximo plano
      a.onerror = () => { a.onended = a.onerror = null; resolve(false); };
      a.src = url;
      a.playbackRate = pr;
      a.currentTime = 0;
      const p = a.play();
      if (p && p.then) {
        p.then(() => { if (onstart && mySeq === seq) onstart(); }, () => {
          // play() bloqueado: devolve false para o chamador usar a voz nativa
          a.onended = a.onerror = null;
          resolve(false);
        });
      } else if (onstart) onstart();
    });
  }

  async function speak(text, opts) {
    const o = opts || {};
    text = String(text || '').replace(/\s+/g, ' ').trim();
    if (!text) { if (o.onend) o.onend(); return; }
    // Orpheus aceita 0.5–1.5; a nitidez cai abaixo de ~0.8
    const rate = Math.max(0.8, Math.min(1.2, o.rate || 1));

    stop();
    const mySeq = seq;
    await manifestReady;
    if (mySeq !== seq) return;

    // Arquivo pré-gerado: velocidade normal (≥ 0,85, onde a voz neural soa
    // melhor a 1x) ou "devagar" via playbackRate com o tom preservado — um único
    // MP3 por frase serve aos dois.
    const entry = manifest && manifest[text];
    if (entry) {
      const want = o.rate || 1;
      const pr = want < 0.85 ? Math.max(0.6, want) : 1;
      const played = await playUrl(AUDIO_BASE + entry.f, mySeq, o.onstart, o.onend, pr);
      if (played || mySeq !== seq) return;
    }

    const url = await fetchNeural(text, rate);
    if (mySeq !== seq) return; // outra fala assumiu enquanto buscava

    if (url) {
      const played = await playUrl(url, mySeq, o.onstart, o.onend);
      if (played || mySeq !== seq) return;
    }
    await speakNative(text, Math.min(rate, 0.95), o.onstart, o.onend);
  }

  function preload(texts) {
    (texts || []).forEach(t => {
      t = String(t || '').replace(/\s+/g, ' ').trim();
      if (t) fetchNeural(t, 1);
    });
  }

  window.GriloTTS = { speak, stop, preload };

  window._griloSpeak = function (text, btnEl) {
    speak(text, {
      rate: 1,
      onstart: btnEl ? () => btnEl.classList.add('is-playing') : null,
      onend: btnEl ? () => btnEl.classList.remove('is-playing') : null,
    });
  };
})();
