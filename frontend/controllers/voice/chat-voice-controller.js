/**
 * Speech Handler - Voice Chat Integration
 * Handles: Speech Recognition (input) + Speech Synthesis (output)
 * Languages: Auto-detect Portuguese/English
 */

console.log("✅ [VOICE-CONTROLLER] Script loading...");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;

let recognizer = null;
let isListening = false;
let _voiceAuthFailureHandled = false;
// currentLanguage is defined in chat-text-controller.js to avoid duplication

// ==================== INIT ====================

function initSpeech() {
    if (!SpeechRecognition) {
        console.warn("💬 Speech Recognition não suportado neste navegador");
        const legacyToggle = document.getElementById("voiceToggle");
        if (legacyToggle) legacyToggle.disabled = true;
        return false;
    }

    recognizer = new SpeechRecognition();
    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.lang = currentLanguage;

    // Setup handlers
    recognizer.onstart = () => {
        isListening = true;
        updateVoiceButton(true);
        console.log("🎤 Listening...", currentLanguage);
    };

    recognizer.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalTranscript += transcript + " ";
            } else {
                interimTranscript += transcript;
            }
        }

        // Show interim results in input
        if (interimTranscript) {
            document.getElementById("chatInput").value = interimTranscript;
        }

        // If final result, send message
        if (finalTranscript) {
            console.log("✅ Final transcript:", finalTranscript);
            document.getElementById("chatInput").value = finalTranscript.trim();
            
            // Auto-detect language from transcript
            currentLanguage = detectLanguage(finalTranscript);
            console.log("🌐 Detected language:", currentLanguage);
        }
    };

    recognizer.onerror = (event) => {
        console.error("❌ Speech error:", event.error);
        isListening = false;
        updateVoiceButton(false);

        // Show error to user
        let errorMsg = "Erro ao reconhecer fala";
        switch (event.error) {
            case "no-speech":
                errorMsg = "Nenhuma fala detectada. Tente novamente.";
                break;
            case "audio-capture":
                errorMsg = "Microfone não encontrado.";
                break;
            case "network":
                errorMsg = "Erro de conexão.";
                break;
        }
        addMessageToChat("system", errorMsg);
    };

    recognizer.onend = () => {
        isListening = false;
        updateVoiceButton(false);
        console.log("🛑 Stopped listening");
    };

    return true;
}

// ==================== VOICE CONTROLS ====================

function startListening() {
    if (!recognizer) {
        if (!initSpeech()) {
            addMessageToChat("system", "❌ Speech Recognition não suportado");
            return;
        }
    }

    if (isListening) {
        stopListening();
        return;
    }

    // Auto-detect default language based on current context
    const chatHistory = document.getElementById("chatMessages");
    const lastMessage = chatHistory.lastElementChild?.textContent || "";

    // If last message has Portuguese words, use pt-BR
    const ptWords = ["português", "inglês", "aprender", "como", "qual", "você", "gostaria"];
    const hasPT = ptWords.some(word => lastMessage.toLowerCase().includes(word));

    currentLanguage = hasPT ? "pt-BR" : "en-US";
    recognizer.lang = currentLanguage;

    console.log("🎤 Starting recognition in", currentLanguage);
    recognizer.start();
}

function stopListening() {
    if (recognizer && isListening) {
        recognizer.stop();
        isListening = false;
        updateVoiceButton(false);
    }
}

function updateVoiceButton(active) {
    const btn = document.getElementById("voiceToggle");
    if (!btn) return;

    if (active) {
        btn.style.backgroundColor = "#FF6B6B";
        btn.style.transform = "scale(1.1)";
        btn.style.boxShadow = "0 0 15px rgba(255, 107, 107, 0.6)";
        btn.title = "Clique para parar";
    } else {
        btn.style.backgroundColor = "#4ECDC4";
        btn.style.transform = "scale(1)";
        btn.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
        btn.title = "Clique para falar";
    }
}

// ==================== SPEECH SYNTHESIS ====================

// Reference to the currently playing audio (ElevenLabs), used for cancellation
let _currentTTSAudio = null;

/**
 * Cancel any ongoing TTS audio (ElevenLabs or Web Speech)
 */
function cancelCurrentSpeech() {
    if (_currentTTSAudio) {
        _currentTTSAudio.pause();
        _currentTTSAudio.src = "";
        _currentTTSAudio = null;
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

function _handleVoiceUnauthorized(source = "voice") {
    if (_voiceAuthFailureHandled) return;
    _voiceAuthFailureHandled = true;

    console.warn(`[VOICE-AUTH] Unauthorized during ${source}`);

    try {
        localStorage.removeItem("grilo_token");
        localStorage.removeItem("grilo_user");
    } catch (error) {
        console.warn("[VOICE-AUTH] Failed to clear local auth state:", error.message);
    }

    window.authToken = null;
    cancelCurrentSpeech();

    try {
        stopVoiceChat({ suppressRecap: true, suppressSessionRecord: true });
    } catch (error) {
        console.warn("[VOICE-AUTH] Failed to stop voice chat cleanly:", error.message);
    }

    const statusEl = document.getElementById("voiceDimensionStatus");
    const statusText = statusEl ? (statusEl.querySelector(".voice-status-text") || statusEl) : null;
    const aiResponseText = document.getElementById("aiResponseText");
    const subtitle = document.getElementById("voiceDimensionSubtitle");

    if (statusEl) {
        statusEl.classList.remove("listening", "speaking", "processing", "waiting");
        statusEl.classList.add("error");
    }
    if (statusText) {
        statusText.innerHTML = '<span class="voice-indicator speaking"></span>Sessao expirada';
    }
    if (aiResponseText) {
        aiResponseText.innerHTML = "<p>Sua sessao expirou durante o treino de voz. Faca login novamente para continuar.</p>";
    }
    if (subtitle) {
        subtitle.textContent = "Redirecionando para a tela inicial para renovar sua autenticacao.";
    }

    showVoiceToast("Sessao expirada. Entrando novamente.");
    setTimeout(() => {
        window.location.replace("/");
    }, 1200);
}

/**
 * Speak AI response text.
 * Tries ElevenLabs neural TTS via /api/tts first.
 * Falls back to browser Web Speech API if the server returns {fallback: true}
 * or the request fails (offline, no API key, quota exceeded).
 */
async function speakResponse(text, language = "pt-BR") {
    console.log("🔊 [SPEAK] Speaking text:", text.substring(0, 50) + "...", "Language:", language);
    
    cancelCurrentSpeech();

    // Clean text from markdown
    const cleanText = text
        .replace(/\*\*/g, "")
        .replace(/\[.*?\]/g, "")
        .replace(/#+\s/g, "")
        .trim();

    if (!cleanText) {
        console.log("⚠️ [SPEAK] Empty text after cleaning, returning");
        return;
    }

    const lang = language.startsWith("en") ? "en" : "pt";

    // Try ElevenLabs via backend
    const authToken = window.authToken || localStorage.getItem("grilo_token");
    // API_BASE_URL is defined globally in utils.js
    
    if (authToken) {
        try {
            console.log("📡 [SPEAK] Attempting ElevenLabs TTS...");
            const resp = await fetch(`${API_BASE_URL}/api/tts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                },
                body: JSON.stringify({ text: cleanText.slice(0, 500), lang, speed: ttsSpeed }),
                signal: AbortSignal.timeout(10000),
            });
            console.log("✅ [SPEAK] ElevenLabs response status:", resp.status);

            if (resp.status === 401) {
                _handleVoiceUnauthorized("tts");
                return;
            }
            
            if (resp.ok) {
                const data = await resp.json();
                if (!data.fallback && data.audio_base64) {
                    console.log("🎵 [SPEAK] Got audio from ElevenLabs, playing...");
                    // Play ElevenLabs audio
                    await _playBase64Audio(data.audio_base64, data.content_type || "audio/mpeg", language);
                    console.log("✅ [SPEAK] ElevenLabs audio finished playing");
                    return;
                }
            }
        } catch (err) {
            console.warn("[SPEAK] ElevenLabs attempt failed, falling back to Web Speech:", err.message);
        }
    }

    // Fallback: browser Web Speech API
    console.log("📢 [SPEAK] Using Web Speech API fallback");
    await _speakWithWebSpeech(cleanText, language);
    console.log("✅ [SPEAK] Web Speech finished");
}

/**
 * Play base64-encoded audio and resolve when done.
 */
function _playBase64Audio(b64, contentType, language) {
    return new Promise((resolve) => {
        isAISpeaking = true;
        updateVoiceModalStatus("speaking");
        startPulsingAnimation();

        const audioData = `data:${contentType};base64,${b64}`;
        const audio = new Audio(audioData);
        _currentTTSAudio = audio;

        audio.playbackRate = 1.0;  // Neural TTS sounds better at 1x
        audio.onplay = () => console.log("🔊 ElevenLabs TTS playing...");
        audio.onended = () => {
            isAISpeaking = false;
            _currentTTSAudio = null;
            stopPulsingAnimation();
            resolve();
        };
        audio.onerror = (e) => {
            console.error("[TTS] Audio playback error:", e);
            isAISpeaking = false;
            _currentTTSAudio = null;
            stopPulsingAnimation();
            resolve();
        };
        audio.play().catch((e) => {
            console.warn("[TTS] Audio.play() blocked:", e.message);
            isAISpeaking = false;
            stopPulsingAnimation();
            resolve();
        });
    });
}

/**
 * Fallback: browser Web Speech API synthesis
 * Includes Chrome keepalive workaround: Chrome stops speechSynthesis after ~15s
 * unless we call pause()/resume() periodically to prevent it from cutting out.
 */
function _speakWithWebSpeech(cleanText, language) {
    return new Promise((resolve) => {
        if (!window.speechSynthesis) {
            console.warn("💬 Speech Synthesis not supported");
            resolve();
            return;
        }
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = language;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Chrome bug workaround: keepalive ping every 10s to prevent audio cutting mid-sentence
        let keepAliveInterval = null;

        utterance.onstart = () => {
            console.log("🔊 Web Speech AI Speaking...");
            isAISpeaking = true;
            updateVoiceModalStatus("speaking");
            startPulsingAnimation();

            keepAliveInterval = setInterval(() => {
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                } else {
                    clearInterval(keepAliveInterval);
                }
            }, 10000);
        };
        utterance.onend = () => {
            clearInterval(keepAliveInterval);
            isAISpeaking = false;
            stopPulsingAnimation();
            resolve();
        };
        utterance.onerror = (event) => {
            clearInterval(keepAliveInterval);
            console.error("❌ Web Speech synthesis error:", event.error);
            isAISpeaking = false;
            stopPulsingAnimation();
            resolve();
        };
        window.speechSynthesis.speak(utterance);
    });
}

// ==================== LANGUAGE AUTO-DETECTION ====================

function detectLanguage(text) {
    const analysis = analyzeVoiceInputLanguage(text);
    if (analysis.language === 'pt') return 'pt-BR';
    if (analysis.language === 'en') return 'en-US';
    if (currentLanguage && String(currentLanguage).toLowerCase().startsWith('en')) return 'en-US';
    return 'pt-BR';
}

function analyzeVoiceInputLanguage(text) {
    if (!text || text.length < 3) {
        const fallbackLanguage = currentLanguage && String(currentLanguage).toLowerCase().startsWith('en') ? 'en' : 'pt';
        return {
            language: fallbackLanguage,
            primaryLanguage: fallbackLanguage,
            locale: currentLanguage || 'pt-BR',
            ptCount: 0,
            enCount: 0,
        };
    }

    // Portuguese keywords
    const ptKeywords = [
        "português", "você", "como", "qual", "onde", "quando", "por que", "olá", "oi",
        "obrigado", "de nada", "tudo bem", "e você", "muito", "bom", "ruim", "grande",
        "pequeno", "quente", "frio", "dor", "alegria", "triste", "feliz", "amor",
        "casa", "escola", "trabalho", "comer", "beber", "dormir", "acordar", "sair"
    ];

    // English keywords
    const enKeywords = [
        "english", "hello", "hi", "how", "what", "where", "when", "why", "thank you",
        "you're welcome", "good", "bad", "big", "small", "hot", "cold", "pain",
        "happy", "sad", "love", "house", "school", "work", "eat", "drink", "sleep",
        "wake up", "go out", "excellent", "wonderful", "terrible", "please"
    ];

    const ptFunctionWords = new Set([
        'eu', 'voce', 'você', 'ele', 'ela', 'nos', 'nós', 'eles', 'elas', 'meu', 'minha', 'seu', 'sua',
        'estou', 'sou', 'tenho', 'quero', 'gosto', 'preciso', 'vou', 'moro', 'trabalho', 'estudo', 'nome',
        'com', 'para', 'pra', 'por', 'de', 'do', 'da', 'em', 'no', 'na', 'que', 'e', 'mas', 'porque', 'aqui'
    ]);

    const enFunctionWords = new Set([
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'our', 'their',
        'am', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'have', 'has', 'had', 'can', 'could',
        'would', 'will', 'should', 'like', 'want', 'need', 'go', 'going', 'work', 'study', 'live',
        'name', 'from', 'at', 'in', 'on', 'for', 'with', 'and', 'but', 'because', 'the', 'a', 'an'
    ]);

    const lowerText = text.toLowerCase();
    const normalizedText = lowerText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const tokens = normalizedText.match(/[a-z']+/g) || [];
    
    let ptCount = ptKeywords.filter(keyword => lowerText.includes(keyword)).length;
    let enCount = enKeywords.filter(keyword => lowerText.includes(keyword)).length;

    ptCount += tokens.filter(token => ptFunctionWords.has(token)).length;
    enCount += tokens.filter(token => enFunctionWords.has(token)).length;

    const hasPtAccent = /[àáâãçéêíóôõú]/i.test(lowerText);
    const hasEnglishContraction = /\b(?:i'm|you're|we're|they're|don't|doesn't|didn't|can't|won't|it's|that's)\b/.test(lowerText);

    if (hasPtAccent) ptCount += 2;
    if (hasEnglishContraction) enCount += 2;

    if (ptCount > 0 && enCount > 0 && Math.abs(ptCount - enCount) <= 1) {
        return {
            language: 'mixed',
            primaryLanguage: ptCount > enCount ? 'pt' : enCount > ptCount ? 'en' : null,
            locale: currentLanguage || 'pt-BR',
            ptCount,
            enCount,
        };
    }

    if (ptCount > enCount) {
        return { language: 'pt', primaryLanguage: 'pt', locale: 'pt-BR', ptCount, enCount };
    }
    if (enCount > ptCount) {
        return { language: 'en', primaryLanguage: 'en', locale: 'en-US', ptCount, enCount };
    }

    if (hasPtAccent) {
        return { language: 'pt', primaryLanguage: 'pt', locale: 'pt-BR', ptCount, enCount };
    }

    if (hasEnglishContraction) {
        return { language: 'en', primaryLanguage: 'en', locale: 'en-US', ptCount, enCount };
    }

    if (tokens.length >= 2) {
        const looksAscii = /^[\x00-\x7F\s'?!.,-]+$/.test(text);
        if (looksAscii) {
            return { language: 'en', primaryLanguage: 'en', locale: 'en-US', ptCount, enCount };
        }
    }

    const fallbackLanguage = currentLanguage && String(currentLanguage).toLowerCase().startsWith('en') ? 'en' : 'pt';
    return {
        language: fallbackLanguage,
        primaryLanguage: fallbackLanguage,
        locale: currentLanguage || 'pt-BR',
        ptCount,
        enCount,
    };
}

function normalizeVoiceInputLanguage(text) {
    const detected = analyzeVoiceInputLanguage(text || "");
    return detected.language || 'en';
}

function _getVoiceUnderstandingLabel(status) {
    return VOICE_UNDERSTANDING_LABELS[String(status || 'clear').toLowerCase()] || VOICE_UNDERSTANDING_LABELS.clear;
}

function renderVoiceResponseCard({
    heardText = "",
    heardLanguage = "en",
    englishText = "",
    portugueseText = "",
    turnHint = "",
    correctionPhrase = "",
    understandingStatus = "clear",
    understandingNote = "",
    understandingLabel = "",
}) {
    const container = document.getElementById("aiResponseText");
    if (!container) return;

    const heardLanguageLabel = heardLanguage === 'pt'
        ? 'em português'
        : heardLanguage === 'mixed'
            ? 'misturando português e inglês'
            : 'em inglês';

    const heardBlock = heardText
        ? `
            <div class="voice-input-recap">
                <span class="voice-card-eyebrow">Você falou ${heardLanguageLabel}</span>
                <p class="voice-input-recap-text">${_escapeHtml(heardText)}</p>
            </div>
        `
        : "";

    const understandingBlock = understandingStatus && understandingStatus !== 'clear'
        ? `
            <div class="voice-translation-card">
                <span class="voice-card-eyebrow">${_escapeHtml(understandingLabel || _getVoiceUnderstandingLabel(understandingStatus))}</span>
                <p class="voice-translation-text">${_escapeHtml(understandingNote || '')}</p>
            </div>
        `
        : "";

    const translationBlock = portugueseText
        ? `
            <div class="voice-translation-card">
                <span class="voice-card-eyebrow">Apoio em português</span>
                <p class="voice-translation-text">${_escapeHtml(portugueseText)}</p>
            </div>
        `
        : "";

    const correctionBlock = correctionPhrase
        ? `
            <div class="voice-correction-card">
                <div class="voice-correction-label">Say it out loud 🎤</div>
                <div class="voice-correction-phrase">${_escapeHtml(correctionPhrase)}</div>
                <div class="voice-correction-hint">Listen carefully, then repeat when you're ready.</div>
            </div>
        `
        : "";

    const turnBlock = turnHint
        ? `
            <div class="voice-turn-card">
                <span class="voice-turn-pill">Sua vez</span>
                <p class="voice-turn-text">${_escapeHtml(turnHint)}</p>
            </div>
        `
        : "";

    container.innerHTML = `
        ${heardBlock}
        ${understandingBlock}
        <div class="voice-response-card-main">
            <span class="voice-card-eyebrow">English first</span>
            <p class="voice-response-main-text">${_escapeHtml(englishText)}</p>
        </div>
        ${translationBlock}
        ${correctionBlock}
        ${turnBlock}
    `;
}

// ==================== CORRECTION DETECTION ====================

/**
 * Detect if the AI corrected a phrase and extract the correct form.
 * Returns the corrected phrase string or null if no correction found.
 */
function extractCorrectedPhrase(text) {
    if (!text) return null;

    const patterns = [
        /you should say\s+"([^"]+)"/i,
        /you should say\s+'([^']+)'/i,
        /try saying\s+"([^"]+)"/i,
        /try saying\s+'([^']+)'/i,
        /the correct (?:phrase|word|form|way) (?:is|would be)\s+"([^"]+)"/i,
        /the correct (?:phrase|word|form|way) (?:is|would be)\s+'([^']+)'/i,
        /i think you mean[t]?\s+"([^"]+)"/i,
        /i think you mean[t]?\s+'([^']+)'/i,
        /you meant\s+"([^"]+)"/i,
        /you meant\s+'([^']+)'/i,
        /it should be\s+"([^"]+)"/i,
        /it should be\s+'([^']+)'/i,
        /say\s+"([^"]{4,60})"\s+instead/i,
        /say\s+'([^']{4,60})'\s+instead/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim().length > 2) {
            return match[1].trim();
        }
    }
    return null;
}

/**
 * Format an AI voice chat message to highlight incorrect phrases (red) and
 * corrections (green) inside the text log.
 * XSS-safe: HTML is escaped first, spans are applied to already-escaped text.
 * @param {string} text - Raw AI message text
 * @returns {string} - HTML string with highlights applied
 */
function formatVoiceCorrectionMessage(text) {
    if (!text) return "";

    // 1. Escape HTML first to prevent XSS
    const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");

    // 2. Patterns for WRONG phrases (will be highlighted red)
    //    Matches: you said "X", you used "X", I heard "X", you wrote "X"
    const errorPatterns = [
        /(you said\s+&quot;)([^&]+?)(&quot;)/gi,
        /(you said\s+&#x27;)([^&]+?)(&#x27;)/gi,
        /(you used\s+&quot;)([^&]+?)(&quot;)/gi,
        /(you used\s+&#x27;)([^&]+?)(&#x27;)/gi,
        /(i heard\s+&quot;)([^&]+?)(&quot;)/gi,
        /(i heard\s+&#x27;)([^&]+?)(&#x27;)/gi,
        /(you wrote\s+&quot;)([^&]+?)(&quot;)/gi,
    ];

    // 3. Patterns for CORRECT phrases (will be highlighted green)
    //    Matches: should say "Y", try "Y", it should be "Y", correct form is "Y", say "Y" instead
    const correctPatterns = [
        /(should say\s+&quot;)([^&]+?)(&quot;)/gi,
        /(should say\s+&#x27;)([^&]+?)(&#x27;)/gi,
        /(try saying\s+&quot;)([^&]+?)(&quot;)/gi,
        /(try saying\s+&#x27;)([^&]+?)(&#x27;)/gi,
        /(try\s+&quot;)([^&]+?)(&quot;)/gi,
        /(it should be\s+&quot;)([^&]+?)(&quot;)/gi,
        /(it should be\s+&#x27;)([^&]+?)(&#x27;)/gi,
        /(correct(?:ly)? (?:form|phrase|word|way) (?:is|would be)\s+&quot;)([^&]+?)(&quot;)/gi,
        /(say\s+&quot;)([^&]{4,60}?)(&quot;\s+instead)/gi,
        /(say\s+&#x27;)([^&]{4,60}?)(&#x27;\s+instead)/gi,
    ];

    let result = escaped;

    // Apply error highlights first
    for (const pattern of errorPatterns) {
        result = result.replace(pattern, (_, pre, phrase, post) =>
            `${pre}<span class="voice-msg-error">${phrase}</span>${post}`
        );
    }

    // Apply correction highlights
    for (const pattern of correctPatterns) {
        result = result.replace(pattern, (_, pre, phrase, post) =>
            `${pre}<span class="voice-msg-correct">${phrase}</span>${post}`
        );
    }

    return result;
}

// Expose for use in chat-text-controller.js
window.VoiceFormatting = { formatVoiceCorrectionMessage };


// ==================== LIVE ERROR PANEL ====================

let _liveErrorCount = 0;
const VOICE_ERROR_TYPE_LABELS = {
    article: "Artigos",
    gerund_after_verb: "Gerúndio",
    verb_tense: "Tempo verbal",
    word_choice: "Escolha de palavras",
    preposition: "Preposições",
    subject_verb_agreement: "Concordância verbal",
    capitalization: "Maiúsculas",
    spelling: "Ortografia",
    unknown: "Gramática geral",
};

const VOICE_UNDERSTANDING_LABELS = {
    mixed: "Frase mista PT + EN",
    partial: "Entendimento parcial",
    unclear: "Precisa repetir",
    clear: "Entendido",
};

function _createEmptyVoiceSessionAnalytics() {
    return {
        startedAt: Date.now(),
        turns: [],
        corrections: [],
        help: {
            panel_opens: 0,
            suggestion_uses: 0,
            pronunciation_plays: 0,
            shadow_successes: 0,
            shadow_skips: 0,
            shadow_auto_progressed: 0,
        },
    };
}

function _normalizeVoiceCorrectionType(value) {
    const normalized = String(value || 'unknown').trim().toLowerCase();
    return VOICE_ERROR_TYPE_LABELS[normalized] ? normalized : 'unknown';
}

function _getVoiceErrorTypeLabel(value) {
    return VOICE_ERROR_TYPE_LABELS[_normalizeVoiceCorrectionType(value)] || VOICE_ERROR_TYPE_LABELS.unknown;
}

function _safeWordCount(text) {
    return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function _summarizeVoiceSessionAnalytics(durationSeconds = null) {
    const turns = Array.isArray(_voiceSessionAnalytics?.turns) ? _voiceSessionAnalytics.turns : [];
    const corrections = Array.isArray(_voiceSessionAnalytics?.corrections) ? _voiceSessionAnalytics.corrections : [];
    const turnCount = turns.length;
    const ptTurns = turns.filter((turn) => turn.language === 'pt').length;
    const enTurns = turns.filter((turn) => turn.language === 'en').length;
    const mixedTurns = turns.filter((turn) => turn.language === 'mixed').length;
    const clarificationTurns = turns.filter((turn) => turn.clarificationNeeded).length;
    const englishTurnsWithCorrection = turns.filter((turn) => turn.language === 'en' && turn.hadCorrection).length;
    const englishTurnsWithoutCorrection = turns.filter((turn) => turn.language === 'en' && !turn.hadCorrection).length;
    const bridgeTurns = turns.filter((turn) => turn.usedBridge).length;
    const totalWords = turns.reduce((sum, turn) => sum + _safeWordCount(turn.finalText || turn.heardText), 0);
    const confidenceValues = turns
        .map((turn) => Number(turn.sttConfidence))
        .filter((value) => Number.isFinite(value) && value > 0);
    const topErrorMap = corrections.reduce((acc, correction) => {
        const errorType = _normalizeVoiceCorrectionType(correction.errorType);
        acc[errorType] = (acc[errorType] || 0) + 1;
        return acc;
    }, {});
    const topErrorTypes = Object.entries(topErrorMap)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 4)
        .map(([errorType, count]) => ({
            error_type: errorType,
            label: _getVoiceErrorTypeLabel(errorType),
            count,
        }));

    const lastCorrection = corrections.length ? corrections[corrections.length - 1] : null;
    const elapsedSeconds = durationSeconds != null
        ? durationSeconds
        : (_voiceSessionStart ? Math.max(0, Math.round((Date.now() - _voiceSessionStart) / 1000)) : 0);

    return {
        turns_total: turnCount,
        pt_turns: ptTurns,
        en_turns: enTurns,
        mixed_turns: mixedTurns,
        bridge_turns: bridgeTurns,
        clarification_turns: clarificationTurns,
        english_turns_with_correction: englishTurnsWithCorrection,
        english_turns_without_correction: englishTurnsWithoutCorrection,
        english_accuracy_ratio: enTurns ? Number((englishTurnsWithoutCorrection / enTurns).toFixed(2)) : 0,
        avg_words_per_turn: turnCount ? Number((totalWords / turnCount).toFixed(1)) : 0,
        avg_stt_confidence: confidenceValues.length
            ? Number((confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length).toFixed(2))
            : null,
        top_error_types: topErrorTypes,
        latest_correction: lastCorrection,
        help: { ..._voiceSessionAnalytics.help },
        duration_seconds: elapsedSeconds,
    };
}

function _renderLiveErrorSummary() {
    const summaryEl = document.getElementById('liveErrorSummary');
    if (!summaryEl) return;

    const summary = _summarizeVoiceSessionAnalytics();
    const topError = summary.top_error_types[0];
    const englishPct = summary.en_turns
        ? Math.round(summary.english_accuracy_ratio * 100)
        : 0;
    const summaryNote = summary.clarification_turns
        ? `${summary.clarification_turns} fala(s) pediram repeticao por entendimento parcial ou incerto.`
        : summary.mixed_turns
            ? `${summary.mixed_turns} fala(s) misturaram PT + EN e foram interpretadas.`
            : summary.en_turns
                ? `${englishPct}% das respostas em inglês vieram sem ajuste detectado.`
                : 'Os próximos ajustes aparecem aqui conforme a conversa avança.';

    summaryEl.innerHTML = `
        <div class="live-error-summary-grid">
            <div class="live-error-summary-pill">
                <span class="live-error-summary-k">Trocas</span>
                <strong class="live-error-summary-v">${summary.turns_total}</strong>
            </div>
            <div class="live-error-summary-pill">
                <span class="live-error-summary-k">PT</span>
                <strong class="live-error-summary-v">${summary.pt_turns}</strong>
            </div>
            <div class="live-error-summary-pill">
                <span class="live-error-summary-k">EN</span>
                <strong class="live-error-summary-v">${summary.en_turns}</strong>
            </div>
            <div class="live-error-summary-pill ${topError ? 'is-focus' : ''}">
                <span class="live-error-summary-k">Foco</span>
                <strong class="live-error-summary-v">${_escapeHtml(topError ? topError.label : 'Sem ajuste')}</strong>
            </div>
        </div>
        <div class="live-error-language-bar">
            <div class="live-error-language-fill is-pt" style="width:${summary.turns_total ? Math.max(8, Math.round((summary.pt_turns / summary.turns_total) * 100)) : 0}%"></div>
            <div class="live-error-language-fill is-en" style="width:${summary.turns_total ? Math.max(8, Math.round((summary.en_turns / summary.turns_total) * 100)) : 0}%"></div>
        </div>
        <p class="live-error-summary-note">${summaryNote}</p>
    `;
}

function _recordVoiceTurnAnalytics(turn) {
    if (!_voiceSessionAnalytics) {
        _voiceSessionAnalytics = _createEmptyVoiceSessionAnalytics();
    }

    const normalizedLanguage = ['pt', 'en', 'mixed'].includes(turn.language) ? turn.language : 'en';
    const normalizedErrorType = turn.hadCorrection
        ? _normalizeVoiceCorrectionType(turn.correction?.error_type || turn.correctionType)
        : null;
    const nextTurnIndex = _voiceSessionAnalytics.turns.length + 1;
    const payload = {
        turnIndex: Number(turn.turnIndex || nextTurnIndex),
        source: turn.source || 'voice',
        heardText: String(turn.heardText || ''),
        finalText: String(turn.finalText || turn.heardText || ''),
        language: normalizedLanguage,
        sttConfidence: Number.isFinite(Number(turn.sttConfidence)) ? Number(turn.sttConfidence) : null,
        usedBridge: !!turn.usedBridge,
        hadCorrection: !!turn.hadCorrection,
        correctionType: normalizedErrorType,
        correction: turn.correction || null,
        aiResponse: String(turn.aiResponse || ''),
        translationPt: String(turn.translationPt || ''),
        understandingStatus: String(turn.understandingStatus || 'clear'),
        understandingReason: turn.understandingReason || null,
        clarificationNeeded: !!turn.clarificationNeeded,
        recognitionLatencyMs: Number.isFinite(Number(turn.recognitionLatencyMs)) ? Math.round(Number(turn.recognitionLatencyMs)) : null,
        apiLatencyMs: Number.isFinite(Number(turn.apiLatencyMs)) ? Math.round(Number(turn.apiLatencyMs)) : null,
        timestamp: Date.now(),
        helpMode: turn.helpMode || null,
    };

    _voiceSessionAnalytics.turns.push(payload);

    if (payload.hadCorrection && payload.correction) {
        _voiceSessionAnalytics.corrections.push({
            turnIndex: payload.turnIndex,
            language: payload.language,
            errorType: normalizedErrorType,
            wrong: String(payload.correction.wrong || ''),
            correct: String(payload.correction.correct || ''),
            tip: String(payload.correction.tip || ''),
        });
    }

    _renderLiveErrorSummary();
    return payload;
}

function _escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function dropLiveError(wrong, correct, tip, meta = {}) {
    const panel   = document.getElementById('liveErrorPanel');
    const list    = document.getElementById('liveErrorList');
    const empty   = document.getElementById('liveErrorEmpty');
    const counter = document.getElementById('liveErrorCount');
    const errorType = _normalizeVoiceCorrectionType(meta.errorType);
    const turnIndex = Number(meta.turnIndex || 0);
    const language = meta.language === 'pt' ? 'pt' : meta.language === 'mixed' ? 'mixed' : 'en';
    if (!panel || !list) return;
    _liveErrorCount++;
    panel.classList.add('has-errors');
    if (empty) empty.style.display = 'none';
    if (counter) {
        counter.textContent = _liveErrorCount;
        counter.classList.remove('bump');
        void counter.offsetWidth;
        counter.classList.add('bump');
    }
    let timeLabel = '';
    if (_voiceSessionStart) {
        const elapsed = Math.round((Date.now() - _voiceSessionStart) / 1000);
        const m = Math.floor(elapsed / 60), s = elapsed % 60;
        timeLabel = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    const card = document.createElement('div');
    card.className = 'live-error-card';
    const safeCorrect = _escapeHtml(correct || '');
    card.innerHTML = `
        <div class="live-error-card-meta">
            <span class="live-error-chip">${_escapeHtml(_getVoiceErrorTypeLabel(errorType))}</span>
            <span class="live-error-chip ${language === 'pt' ? 'is-pt' : 'is-en'}">${language === 'pt' ? 'Falou em PT' : language === 'mixed' ? 'Falou misto' : 'Falou em EN'}</span>
            ${turnIndex ? `<span class="live-error-chip">Troca ${turnIndex}</span>` : ''}
        </div>
        <div class="live-error-phrase-row">
            ${wrong ? `<span class="live-error-wrong">${_escapeHtml(wrong)}</span><span class="live-error-arrow">→</span>` : ''}
            <span class="live-error-correct">${safeCorrect}</span>
        </div>
        <div class="live-error-note">
            <span class="live-error-note-label">O que estudar</span>
            ${_escapeHtml(tip || '')}
        </div>
        ${correct ? `<button class="shadow-btn shadow-btn-next shadow-practice-btn" onclick="window.playPracticePhrase(${JSON.stringify(correct)})">Ouvir e praticar</button>` : ''}
        ${timeLabel ? `<div class="live-error-time">${timeLabel}</div>` : ''}`;
    list.appendChild(card);
    list.scrollTop = list.scrollHeight;
    _renderLiveErrorSummary();
}

function clearLiveErrors() {
    const panel   = document.getElementById('liveErrorPanel');
    const list    = document.getElementById('liveErrorList');
    const counter = document.getElementById('liveErrorCount');
    if (!panel) return;
    _liveErrorCount = 0;
    panel.classList.remove('has-errors');
    if (list) {
        list.innerHTML = '<div class="live-error-empty" id="liveErrorEmpty">Nenhum erro ainda</div>';
    }
    if (counter) counter.textContent = '0';
    _renderLiveErrorSummary();
}


// ==================== SESSION HISTORY (backend) ====================

async function _fetchSessionHistory() {
    try {
        // API_BASE_URL is defined globally in utils.js
        const resp = await fetch(API_BASE_URL + '/api/voice/history', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('grilo_token')}` },
        });
        if (!resp.ok) return [];
        const data = await resp.json();
        return data.sessions || [];
    } catch (e) {
        console.warn('[VOICE-HISTORY] fetch failed:', e);
        return [];
    }
}

function _getPerformanceComparison(history, currentScore) {
    if (!history || history.length < 1) return { label: 'Primeira sessão registrada.', delta: null, up: null };
    const prev = history[history.length - 1];
    const prevScore = prev?.quality ?? prev?.quality_score ?? null;
    if (prevScore == null) return { label: 'Veja como você foi hoje.', delta: null, up: null };
    const delta = currentScore - prevScore;
    if (delta > 5)  return { label: `↑ ${delta} pts a mais que na sessão anterior`, delta, up: true };
    if (delta < -5) return { label: `↓ ${Math.abs(delta)} pts a menos que na anterior`, delta, up: false };
    return { label: 'Desempenho estável em relação à sessão anterior', delta: 0, up: null };
}


// ==================== RADAR CHART ====================

function _buildRadarHTML(radarObj) {
    const cx = 80, cy = 80, maxR = 58;
    const labels = ['Fluência', 'Gramática', 'Vocab', 'Ritmo', 'Progresso'];
    const keys   = ['fluency', 'grammar', 'vocabulary', 'rhythm', 'progress'];
    const radarData = keys.map(k => Math.max(0, Math.min(100, radarObj[k] ?? 50)));

    function anglePts(values) {
        return values.map((v, i) => {
            const angle = (Math.PI * 2 * i / values.length) - Math.PI / 2;
            const r = (v / 100) * maxR;
            return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
        });
    }
    function polyPts(values) { return anglePts(values).map(p => p.join(',')).join(' '); }

    const gridHTML = [0.25, 0.5, 0.75, 1.0].map(level =>
        `<polygon class="radar-grid" points="${polyPts(Array(5).fill(level * 100))}"/>`
    ).join('');

    const axisHTML = labels.map((_, i) => {
        const angle = (Math.PI * 2 * i / labels.length) - Math.PI / 2;
        const x2 = cx + maxR * Math.cos(angle), y2 = cy + maxR * Math.sin(angle);
        return `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }).join('');

    const labelHTML = labels.map((label, i) => {
        const angle = (Math.PI * 2 * i / labels.length) - Math.PI / 2;
        const r = maxR + 15;
        return `<text class="radar-tick-label" x="${(cx + r*Math.cos(angle)).toFixed(1)}" y="${(cy + r*Math.sin(angle)).toFixed(1)}">${label}</text>`;
    }).join('');

    return `
        <div class="recap-radar-wrap stagger-in stagger-5">
            <div class="recap-radar-label-row">COMPETÊNCIAS</div>
            <svg class="radar-svg" viewBox="0 0 160 160">
                ${gridHTML}${axisHTML}
                <polygon class="radar-fill" points="${polyPts(radarData)}"/>
                ${labelHTML}
            </svg>
        </div>`;
}


// ==================== SPARKLINE ====================

function _buildSparklineHTML(history) {
    if (!history || history.length < 2) return '';
    const scores = history.slice(-7).map(h => h.quality ?? h.quality_score ?? 50);
    const w = 64, h = 28, pad = 3;
    const minV = Math.min(...scores), maxV = Math.max(...scores), range = maxV - minV || 1;
    const stepX = (w - pad * 2) / (scores.length - 1);
    const points = scores.map((s, i) => {
        const x = pad + i * stepX;
        const y = h - pad - ((s - minV) / range) * (h - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const last = points.split(' ').at(-1).split(',');
    return `
        <div class="recap-sparkline">
            <div class="recap-sparkline-label">${scores.length} sessões</div>
            <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
                <polyline points="${points}" fill="none" stroke="var(--accent-primary)" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
                <circle cx="${last[0]}" cy="${last[1]}" r="2.5" fill="var(--accent-primary)"/>
            </svg>
        </div>`;
}


// ==================== VOICE CHAT MODAL ====================

let voiceChatActive = false;
let voiceModalRecognizer = null;
let isAISpeaking = false;
let currentAIResponse = ""; // Store AI response to detect self-echo
let pendingVoiceMessage = null; // Debouncing pending message
let messageDebounceTimer = null;
const MESSAGE_DEBOUNCE_MS = 200; // Debounce user input
const API_TIMEOUT_MS = 25000; // 25 second timeout for API calls
const END_OF_SPEECH_GRACE_MS = 1300; // Wait a bit after pause to avoid cutting user speech
let _voiceTurnCommitTimer = null;
let _pendingVoiceConfidence = 1.0;

let _voiceSessionStart = null;

// ==================== MEDIA RECORDER (Whisper STT) ====================
let _mediaRecorder = null;
let _audioChunks = [];
let _micStream = null;
let _whisperPending = false; // guard: only one Whisper call in flight at a time

async function _startMicRecording() {
    if (_micStream) return; // already open
    try {
        _micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
        console.warn('[WHISPER] getUserMedia failed:', e.message);
    }
}

function _beginAudioCapture() {
    if (!_micStream) return;
    _audioChunks = [];
    try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/ogg';
        _mediaRecorder = new MediaRecorder(_micStream, { mimeType });
        _mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) _audioChunks.push(e.data); };
        _mediaRecorder.start(250); // collect in 250ms chunks
    } catch (e) {
        console.warn('[WHISPER] MediaRecorder init failed:', e.message);
        _mediaRecorder = null;
    }
}

function _stopAudioCapture() {
    return new Promise((resolve) => {
        if (!_mediaRecorder || _mediaRecorder.state === 'inactive') {
            resolve(null);
            return;
        }
        _mediaRecorder.onstop = () => {
            const mimeType = _mediaRecorder.mimeType.split(';')[0];
            const blob = new Blob(_audioChunks, { type: mimeType });
            _audioChunks = [];
            resolve({ blob, mimeType });
        };
        _mediaRecorder.stop();
    });
}

async function _transcribeWithWhisper(recording, browserTranscript, authToken) {
    if (!recording || _whisperPending) return browserTranscript;
    const { blob, mimeType } = recording;
    if (blob.size < 500) return browserTranscript;
    _whisperPending = true;
    try {
        const arrayBuf = await blob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));
        // API_BASE_URL is defined globally in utils.js
        const resp = await fetch(API_BASE_URL + '/api/voice/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ audio_base64: base64, mime_type: mimeType }),
            signal: AbortSignal.timeout(12000),
        });
        if (resp.status === 401) {
            _handleVoiceUnauthorized("transcribe");
            return browserTranscript;
        }
        if (!resp.ok) return browserTranscript;
        const result = await resp.json();
        if (result.fallback || !result.transcript || result.transcript.trim().length < 2) {
            return browserTranscript;
        }
        console.log(`[WHISPER] Transcript: "${result.transcript}" (conf=${result.confidence ?? 'n/a'})`);
        return result.transcript.trim();
    } catch (e) {
        console.warn('[WHISPER] Transcription failed, using browser STT:', e.message);
        return browserTranscript;
    } finally {
        _whisperPending = false;
    }
}

// ==================== ADVANCED VOICE FEATURES STATE ====================
let voiceMode = "free";            // "free" | "guided" | "shadow" | "dictation"
let voiceTopic = null;             // "restaurant" | "airport" | "job" | "travel" | "doctor"
let bilingualMode = false;         // show PT translation under AI bubble
let voiceBridgeMode = true;        // free mode: allow PT or EN input
let ttsSpeed = 1.0;                // 0.5–1.5, sent to ElevenLabs
let shadowPhraseTarget = null;     // original AI phrase for shadow comparison
let dictationPhraseTarget = null;  // original AI phrase for dictation comparison
let _lastTranslationPt = null;     // latest bilingual translation from API
let _voiceHelpOpen = false;
let _voiceHelpSuggestions = [];
const _voiceHelpTranslationCache = new Map();
let _voiceSessionAnalytics = _createEmptyVoiceSessionAnalytics();

// ---- Voice Help Shadowing (Pedagógico) ----
let _voiceHelpMode = null; // { expectedText, kind, attempts, maxAttempts, errors, turnData }
const _shadowModeAnalytics = {
    pronunciation_struggles: [],  // [{word, attempts, timestamp, kind}]
    total_attempts_per_response: 0,
    response_types_failed: {},
    auto_progressed_count: 0
};

function _modeLabelPt(mode) {
    const map = {
        free: "Livre",
        guided: "Guiado",
        shadow: "Repetição",
        dictation: "Ditado",
    };
    return map[mode] || mode;
}

function _topicLabelPt(topic) {
    const map = {
        restaurant: "Restaurante",
        airport: "Aeroporto",
        job: "Entrevista",
        travel: "Viagem",
        doctor: "Médico",
    };
    return map[topic] || "Situação guiada";
}

function _bridgeModeLabel() {
    return voiceBridgeMode ? "Ponte ON" : "Ponte OFF";
}

function _bridgeModeHint() {
    return voiceBridgeMode ? "PT + EN" : "English only";
}

function _voiceRecognizerLanguage() {
    if (voiceMode === "free" && voiceBridgeMode) return "pt-BR";
    return "en-US";
}

function _syncVoiceBridgeUi() {
    const toggle = document.getElementById("voiceBridgeToggle");
    const label = document.getElementById("voiceBridgeToggleLabel");
    const hint = document.getElementById("voiceBridgeToggleHint");
    const shouldShow = !voiceChatActive || voiceMode === "free";

    if (toggle) {
        toggle.classList.toggle("active", voiceBridgeMode);
        toggle.classList.toggle("hidden", !shouldShow);
        toggle.setAttribute("aria-pressed", voiceBridgeMode ? "true" : "false");
    }
    if (label) label.textContent = _bridgeModeLabel();
    if (hint) hint.textContent = _bridgeModeHint();
}

function _currentVoiceSetupSelections() {
    const modeBtn = document.querySelector(".voice-mode-btn.active");
    const topicBtn = document.querySelector(".topic-chip.active");
    const bilingualToggle = document.getElementById("bilingualToggle");
    const selectedMode = modeBtn ? modeBtn.dataset.mode : "free";
    return {
        mode: selectedMode,
        topic: selectedMode === "guided"
            ? (topicBtn ? topicBtn.dataset.topic : "restaurant")
            : null,
        bilingual: bilingualToggle ? bilingualToggle.checked : false,
    };
}

function _syncVoiceSetupUi(selectedMode) {
    const mode = selectedMode || "free";
    const topicSection = document.getElementById("voiceTopicSection");
    const bilingualSection = document.getElementById("voiceBilingualSection");

    if (topicSection) {
        topicSection.style.display = mode === "guided" ? "flex" : "none";
    }
    if (bilingualSection) {
        bilingualSection.style.display = mode === "guided" ? "flex" : "none";
    }
}

function _voiceJourneyStageText(challengeDays) {
    if (challengeDays >= 6) return "Etapa 3 · Consolidação de fluência";
    if (challengeDays >= 3) return "Etapa 2 · Consistência de rotina";
    return "Etapa 1 · Ativação do hábito de voz";
}


function _renderVoiceSetupOverview() {
    const stats = window._lastUserStats || {};
    const challengeDays = stats.challenge_days_completed || 0;
    const challengePct = Math.max(0, Math.min(100, stats.challenge_completion_percent || 0));
    const streak = stats.streak || 0;
    const nextUnlock = stats.next_mode_unlock;
    const unlockedCount = Array.isArray(stats.voice_modes_unlocked) ? stats.voice_modes_unlocked.length : 1;

    const stageEl = document.getElementById("voiceSetupMissionStage");
    const challengeEl = document.getElementById("voiceSetupMissionChallenge");
    const streakEl = document.getElementById("voiceSetupMissionStreak");
    const progressEl = document.getElementById("voiceSetupMissionBar");
    const unlockEl = document.getElementById("voiceSetupMissionUnlock");
    const progressLineEl = document.getElementById("voiceSetupMissionProgressLine");
    const modesEl = document.getElementById("voiceSetupMissionModes");

    if (stageEl) stageEl.textContent = _voiceJourneyStageText(challengeDays);
    if (challengeEl) challengeEl.textContent = `${challengeDays}/7 dias no desafio semanal`;
    if (streakEl) streakEl.textContent = `${streak} dias de sequência ativa`;
    if (progressEl) progressEl.style.width = `${challengePct}%`;
    if (progressLineEl) progressLineEl.textContent = `${challengePct}% do desafio concluído nesta semana`;
    if (modesEl) modesEl.textContent = `${unlockedCount} modo(s) disponíveis agora`;
    if (unlockEl) {
        unlockEl.textContent = nextUnlock
            ? `Próximo desbloqueio: ${_modeLabelPt(nextUnlock.mode)} · ${nextUnlock.requires}`
            : "Todos os modos de voz já estão desbloqueados.";
    }
}

function _renderVoiceSetupPreview() {
    const previewEl = document.getElementById("voiceSetupPreview");
    if (!previewEl) return;
    const s = _currentVoiceSetupSelections();
    const missionByMode = {
        guided: "Conduzir uma situação real e responder com naturalidade.",
        free: "Sustentar conversa aberta por vários turnos sem travar.",
    };
    const topicLine = s.mode === "guided" ? _topicLabelPt(s.topic) : "Conversa livre";
    const bilingualPreview = s.mode === "guided"
        ? `
            <div class="voice-setup-preview-item">
                <span class="voice-setup-preview-k">Apoio PT</span>
                <strong class="voice-setup-preview-v">${s.bilingual ? "Ligado" : "Desligado"}</strong>
            </div>`
        : "";

    previewEl.innerHTML = `
        <div class="voice-setup-preview-grid">
            <div class="voice-setup-preview-item">
                <span class="voice-setup-preview-k">Modo</span>
                <strong class="voice-setup-preview-v">${_escapeHtml(_modeLabelPt(s.mode))}</strong>
            </div>
            <div class="voice-setup-preview-item">
                <span class="voice-setup-preview-k">Foco</span>
                <strong class="voice-setup-preview-v">${_escapeHtml(topicLine)}</strong>
            </div>
            ${bilingualPreview}
        </div>
        <div class="voice-setup-preview-mission">
            <span class="voice-setup-preview-k">Missão da sessão</span>
            <p>${_escapeHtml(missionByMode[s.mode] || "Manter consistência no treino de voz diário.")}</p>
        </div>`;
}

window._renderVoiceSetupPreview = _renderVoiceSetupPreview;

function startVoiceChat({ autoListen = true } = {}) {
    console.log("🚀 Starting voice chat mode | autoListen:", autoListen);
    voiceChatActive = true;
    if (!_voiceSessionStart) {
        _voiceSessionStart = Date.now();
        window._voiceSessionStart = _voiceSessionStart;
    }
    _voiceSessionAnalytics = _createEmptyVoiceSessionAnalytics();
    clearLiveErrors();
    console.log("✅ Voice chat active");
    
    _startMicRecording().catch((err) => {
        console.warn("⚠️ Mic recording setup failed:", err);
    }); // pre-open mic stream (silent fail)
    
    console.log("📡 Initializing voice modal recognizer...");
    initializeVoiceModalRecognizer();
    
    if (autoListen) {
        console.log("⏱️ Setting 100ms timeout to start listening...");
        setTimeout(() => {
            console.log("🎤 Auto-starting voice listening");
            startVoiceListening();
        }, 100);
    } else {
        console.log("⏸️ Auto-listen disabled, updating status to 'processing'");
        updateVoiceModalStatus("processing");
    }
}

function _buildVoicePtGuidanceText() {
    const topicLabel = _topicLabelPt(voiceTopic);
    const modeLabel = _modeLabelPt(voiceMode);
    if (voiceMode === "free") {
        return "Modo livre. Comece com uma frase simples sobre qualquer assunto. Eu continuo a conversa em ingles.";
    }

    if (voiceMode === "shadow") {
        return `Modo ${modeLabel}. Vou falar uma frase em ingles e voce repete igual. Se precisar, toque em Ajuda.`;
    }
    if (voiceMode === "dictation") {
        return `Modo ${modeLabel}. Voce vai ouvir uma frase em ingles e escrever o que entendeu. Se travar, toque em Ajuda.`;
    }
    return `Cenario ${topicLabel}, modo ${modeLabel}. Eu falo primeiro em ingles. Depois voce responde com uma frase curta. Se precisar, toque em Ajuda.`;
}

function _getLastAssistantVoiceMessage() {
    for (let i = conversationHistoryVoice.length - 1; i >= 0; i--) {
        const turn = conversationHistoryVoice[i];
        if (turn && turn.role === "assistant" && turn.content) {
            return String(turn.content);
        }
    }
    return "";
}

function _inferVoiceHelpGoal(aiText) {
    const t = String(aiText || "").trim().toLowerCase();
    if (!t) return "Aguarde a proxima pergunta da IA para gerar ajuda contextual.";
    if (/^(do|does|did|are|is|am|was|were|have|has|had|can|could|would|will|should)\b/.test(t)) {
        return "A IA fez uma pergunta de confirmacao. Responda positivo, negativo ou redirecione o contexto.";
    }
    if (/^(what|which|where|when|who|why|how)\b/.test(t)) {
        return "A IA pediu informacao especifica. Responda com dado objetivo e uma frase curta de apoio.";
    }
    if (t.includes("reservation")) {
        return "A IA quer saber se voce ja tem reserva ou se precisa criar uma agora.";
    }
    if (t.includes("flight") || t.includes("gate") || t.includes("boarding")) {
        return "A IA quer detalhes de voo/embarque para orientar o proximo passo no aeroporto.";
    }
    if (t.includes("interview") || t.includes("experience")) {
        return "A IA quer uma resposta profissional curta com experiencia, habilidade ou exemplo.";
    }
    return "A IA quer que voce continue com uma resposta curta, clara e natural em ingles.";
}

function _toPronunciationPt(text) {
    const map = {
        you: "iu", do: "du", does: "dâz", have: "rév", has: "réz", had: "réd",
        a: "â", an: "én", reservation: "rézervêichan", table: "teibôu", name: "neim",
        yes: "iés", no: "nou", i: "ai", my: "mai", am: "ém", is: "iz", are: "ar",
        not: "nat", yet: "iét", could: "cud", can: "kén", would: "wud", please: "pliz",
        check: "tchék", available: "avêilabôu", flight: "flait", gate: "gueit",
        delayed: "dilêid", baggage: "béguidj", allowance: "aláuans", where: "uér",
        what: "uót", when: "uén", why: "uai", how: "rau", under: "ânder",
        your: "iór", this: "dis", me: "mi", for: "for", thanks: "ténks",
    };
    return String(text || "")
        .toLowerCase()
        .replace(/[.,!?;:]/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => map[w] || w)
        .join(" ");
}

async function _ensureVoiceHelpTranslation(aiText) {
    const text = String(aiText || "").trim();
    if (!text) return "Aguardando a pergunta da IA para traduzir.";

    if (_lastTranslationPt && text === _getLastAssistantVoiceMessage()) {
        return _lastTranslationPt;
    }
    if (_voiceHelpTranslationCache.has(text)) {
        return _voiceHelpTranslationCache.get(text);
    }

    const authToken = window.authToken || localStorage.getItem("grilo_token");
    if (!authToken) return "Sem autenticacao para buscar traducao desta frase.";

    try {
        // API_BASE_URL is defined globally in utils.js
        const resp = await fetch(API_BASE_URL + "/api/translate/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            },
            body: JSON.stringify({ text, from_lang: "en", to_lang: "pt" }),
        });
        if (!resp.ok) throw new Error(`translate failed ${resp.status}`);
        const data = await resp.json();
        const translated = (data.translated_text || "").trim();
        if (!translated) throw new Error("empty translation");
        _voiceHelpTranslationCache.set(text, translated);
        return translated;
    } catch (err) {
        console.warn("[VOICE-HELP] Translation fallback failed:", err.message);
        return "Traducao nao disponivel neste momento. Use a frase em ingles para seguir.";
    }
}

function _buildVoiceHelpSuggestions(aiText) {
    const text = String(aiText || "").trim();
    const lower = text.toLowerCase();
    let items;

    if (lower.includes("reservation")) {
        items = [
            { kind: "Positiva", text: "Yes, I have a reservation under my name." },
            { kind: "Negativa", text: "No, I do not have a reservation yet." },
            { kind: "Mudar rumo", text: "Could I make a reservation now, please?" },
            { kind: "Mudar rumo", text: "Can you check if there is a table available?" },
        ];
    } else if (lower.includes("flight") || lower.includes("gate") || lower.includes("boarding")) {
        items = [
            { kind: "Positiva", text: "Yes, my flight is on time and I know my gate." },
            { kind: "Negativa", text: "No, I still do not know my boarding gate." },
            { kind: "Mudar rumo", text: "Could you check if my flight is delayed?" },
            { kind: "Mudar rumo", text: "Can you help me with baggage information?" },
        ];
    } else if (/^(do|does|did|are|is|am|was|were|have|has|had|can|could|would|will|should)\b/.test(lower)) {
        items = [
            { kind: "Positiva", text: "Yes, I do." },
            { kind: "Negativa", text: "No, I do not." },
            { kind: "Mudar rumo", text: "Could you repeat that more slowly, please?" },
            { kind: "Mudar rumo", text: "Can we try another option in this context?" },
        ];
    } else if (/^(what|which|where|when|who|why|how)\b/.test(lower)) {
        items = [
            { kind: "Positiva", text: "My answer is: I usually do it in the morning." },
            { kind: "Negativa", text: "I am not sure yet, but I can explain my idea." },
            { kind: "Mudar rumo", text: "Could you give me an example answer first?" },
            { kind: "Mudar rumo", text: "Can I answer with a short sentence?" },
        ];
    } else {
        items = [
            { kind: "Positiva", text: "Yes, that works for me." },
            { kind: "Negativa", text: "No, that does not work for me." },
            { kind: "Mudar rumo", text: "Could you explain it in a simpler way?" },
            { kind: "Mudar rumo", text: "Can we continue with another example?" },
        ];
    }

    return items.map((item) => ({
        ...item,
        pronunciation: _toPronunciationPt(item.text),
    }));
}

function _buildVoiceHelpCoachMessage(summary) {
    if (!summary.turns_total) {
        return 'Quando a IA perguntar algo, eu monto respostas curtas e naturais para você usar.';
    }

    if (summary.clarification_turns) {
        return 'Quando a IA pedir repetição, responda com uma frase mais curta e completa.';
    }

    if (summary.mixed_turns) {
        return 'Você misturou PT + EN em alguns turnos. Se quiser mais fluidez, tente fechar a próxima resposta em um idioma só.';
    }

    if (summary.pt_turns > summary.en_turns) {
        return 'Você ainda está usando mais português. Tente virar a próxima resposta para inglês com uma frase curta.';
    }

    if (summary.top_error_types.length) {
        return `Seu ajuste recorrente agora é ${summary.top_error_types[0].label.toLowerCase()}. Use uma frase mais simples e limpa nesta próxima resposta.`;
    }

    return `Boa sequência: ${summary.english_turns_without_correction} respostas em inglês vieram sem ajuste detectado.`;
}

function _renderVoiceHelpInsights() {
    const insightsEl = document.getElementById('voiceHelpInsights');
    if (!insightsEl) return;

    const summary = _summarizeVoiceSessionAnalytics();
    const lastCorrection = summary.latest_correction;
    const coachMessage = _buildVoiceHelpCoachMessage(summary);
    const topError = summary.top_error_types[0];

    insightsEl.innerHTML = `
        <div class="voice-help-insights-grid">
            <div class="voice-help-stat">
                <span class="voice-help-stat-k">Trocas</span>
                <strong class="voice-help-stat-v">${summary.turns_total}</strong>
            </div>
            <div class="voice-help-stat">
                <span class="voice-help-stat-k">PT</span>
                <strong class="voice-help-stat-v">${summary.pt_turns}</strong>
            </div>
            <div class="voice-help-stat">
                <span class="voice-help-stat-k">EN</span>
                <strong class="voice-help-stat-v">${summary.en_turns}</strong>
            </div>
            <div class="voice-help-stat ${topError ? 'is-focus' : ''}">
                <span class="voice-help-stat-k">Foco</span>
                <strong class="voice-help-stat-v">${_escapeHtml(topError ? topError.label : 'Fluxo')}</strong>
            </div>
        </div>
        <div class="voice-help-coach-card">
            <span class="voice-help-coach-label">Coach da sessão</span>
            <p class="voice-help-coach-text">${_escapeHtml(coachMessage)}</p>
            ${lastCorrection && lastCorrection.correct ? `
                <div class="voice-help-last-fix">
                    <span class="voice-help-last-fix-k">Último ajuste</span>
                    <strong class="voice-help-last-fix-v">${_escapeHtml(lastCorrection.correct)}</strong>
                    ${lastCorrection.tip ? `<p class="voice-help-last-fix-tip">${_escapeHtml(lastCorrection.tip)}</p>` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

async function _renderVoiceHelpPanel() {
    const panel = document.getElementById("voiceHelpPanel");
    if (!panel) return;

    const aiText = _getLastAssistantVoiceMessage();
    const askedEl = document.getElementById("voiceHelpAskedLine");
    const askedPronEl = document.getElementById("voiceHelpAskedPron");
    const optionsEl = document.getElementById("voiceHelpOptions");
    const expandEl = document.getElementById("voiceHelpExpand");
    const summary = _summarizeVoiceSessionAnalytics();

    _voiceHelpSuggestions = _buildVoiceHelpSuggestions(aiText);
    if (summary.latest_correction && summary.latest_correction.correct) {
        _voiceHelpSuggestions = [
            {
                kind: 'Ajuste',
                text: summary.latest_correction.correct,
                pronunciation: _toPronunciationPt(summary.latest_correction.correct),
            },
            ..._voiceHelpSuggestions,
        ].slice(0, 5);
    }
    if (askedEl) {
        askedEl.textContent = aiText || "Aguardando pergunta da IA...";
    }
    if (askedPronEl) {
        const pron = _toPronunciationPt(aiText || "");
        askedPronEl.textContent = pron ? `(${pron})` : "";
    }

    if (optionsEl) {
        optionsEl.innerHTML = _voiceHelpSuggestions.map((opt, idx) => {
            const hidden = idx >= 2 ? "hidden" : "";
            const kindClass = opt.kind.toLowerCase().replace(/\s+/g, "");
            return `
            <article class="voice-help-option ${hidden}" data-idx="${idx}">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                    <span class="voice-help-option-kind ${kindClass}">${_escapeHtml(opt.kind)}</span>
                </div>
                <p class="voice-help-option-text">${_escapeHtml(opt.text)}</p>
                <div class="voice-help-option-controls">
                    <button class="voice-help-use-btn" type="button" onclick="window.voiceHelpUseSuggestion(${idx})">Usar</button>
                    <button class="voice-help-pron-btn" type="button" title="Ouvir pronúncia" onclick="window.playVoiceHelpPronunciation(${idx})">🔊</button>
                </div>
            </article>
        `;
        }).join("");
        if (expandEl && _voiceHelpSuggestions.length > 2) {
            expandEl.style.display = "block";
        } else if (expandEl) {
            expandEl.style.display = "none";
        }
    }

    _renderVoiceHelpInsights();

    void _ensureVoiceHelpTranslation(aiText);
}

function _setVoiceHelpOpen(nextOpen) {
    const panel = document.getElementById("voiceHelpPanel");
    const helpBtn = document.getElementById("voiceHelpBtn");
    const container = document.querySelector(".ai-response-container");
    if (!panel) return;

    _voiceHelpOpen = !!nextOpen;
    panel.classList.toggle("active", _voiceHelpOpen);
    if (container) container.classList.toggle("help-open", _voiceHelpOpen);
    if (helpBtn) {
        helpBtn.textContent = _voiceHelpOpen ? "Fechar ajuda" : "Ajuda";
    }

    if (_voiceHelpOpen) {
        void _renderVoiceHelpPanel();
    }
}

function _syncVoiceHelpPanelWithAI(aiResponse) {
    if (aiResponse && _lastTranslationPt) {
        _voiceHelpTranslationCache.set(aiResponse, _lastTranslationPt);
    }
    if (_voiceHelpOpen) {
        void _renderVoiceHelpPanel();
    }
}

function _ensureVoiceHelpButton() {
    const actionsEl = document.querySelector(".voice-dimension-actions");
    if (!actionsEl) return;
    if (document.getElementById("voiceHelpBtn")) return;

    const helpBtn = document.createElement("button");
    helpBtn.id = "voiceHelpBtn";
    helpBtn.className = "voice-help-btn";
    helpBtn.type = "button";
    helpBtn.title = "Ajuda por voz";
    helpBtn.textContent = "Ajuda";
    helpBtn.onclick = () => window.voiceHelpAction();
    actionsEl.appendChild(helpBtn);
}

window.voiceHelpAction = async function() {
    if (!voiceChatActive) return;
    const nextOpen = !_voiceHelpOpen;
    if (nextOpen && _voiceSessionAnalytics) {
        _voiceSessionAnalytics.help.panel_opens += 1;
    }
    _setVoiceHelpOpen(nextOpen);
};

async function _sendVoiceTextTurnFromHelp(userMessage, options = {}) {
    const authToken = window.authToken || localStorage.getItem("grilo_token");
    // API_BASE_URL is defined globally in utils.js
    const aiResponseText = document.getElementById("aiResponseText");

    if (!authToken) {
        console.error("❌ No auth token available");
        return;
    }

    if (isAISpeaking) {
        cancelCurrentSpeech();
        isAISpeaking = false;
        stopPulsingAnimation();
    }

    if (voiceModalRecognizer && isListening) {
        isListening = false;
        try { voiceModalRecognizer.stop(); } catch (e) { /* no-op */ }
    }

    updateVoiceModalStatus("processing");
    if (aiResponseText) {
        aiResponseText.innerHTML = `<p class="voice-user-heard-label">Resposta selecionada:</p><p class="voice-user-heard-text voice-user-heard-text-ok">"${_escapeHtml(userMessage)}"</p>`;
    }

    if (typeof addMessageToChat === "function") {
        addMessageToChat("user", userMessage, null, "Voice");
    }

    if (messageDebounceTimer) {
        clearTimeout(messageDebounceTimer);
        messageDebounceTimer = null;
    }
    messageDebounceTimer = setTimeout(() => {
        messageDebounceTimer = null;
    }, MESSAGE_DEBOUNCE_MS);

    try {
        const payload = {
            message: userMessage,
            language: "en",
            history: conversationHistoryVoice,
            stt_confidence: 1.0,
            level: window.userVoiceLevel || "b1",
            voice_mode: voiceMode,
            conversation_topic: voiceTopic,
            bilingual_mode: voiceMode === 'free' ? true : bilingualMode,
            input_bridge_mode: voiceMode === 'free' ? voiceBridgeMode : false,
        };

        // Adiciona shadow_mode se presente nas opções
        if (options.shadow_mode) {
            payload.shadow_mode = options.shadow_mode;
        }

        const response = await fetch(API_BASE_URL + "/api/voice-chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 401) {
            _handleVoiceUnauthorized("voice-help-turn");
            return;
        }

        if (!response.ok) {
            throw new Error(`Voice API returned ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.response || "Thanks. Please continue.";
        _lastTranslationPt = data.translation_pt || null;
        currentAIResponse = aiResponse;
        const understanding = data.understanding || null;
        const detectedInput = data.detected_input || null;
        const heardLanguage = understanding?.input_language || detectedInput?.language || 'en';

        const helpCorrection = data.correction && data.correction.correct ? data.correction : null;
        if (helpCorrection) {
            dropLiveError(helpCorrection.wrong, helpCorrection.correct, helpCorrection.tip, {
                errorType: helpCorrection.error_type,
                language: 'en',
                turnIndex: _voiceSessionAnalytics.turns.length + 1,
            });
        }

        const correctedPhrase = extractCorrectedPhrase(aiResponse);
        if (aiResponseText) {
            renderVoiceResponseCard({
                heardText: userMessage,
                heardLanguage,
                englishText: aiResponse,
                portugueseText: _lastTranslationPt,
                correctionPhrase: correctedPhrase,
                understandingStatus: understanding?.status || 'clear',
                understandingNote: understanding?.note_pt || '',
                understandingLabel: _getVoiceUnderstandingLabel(understanding?.status),
            });
        }

        conversationHistoryVoice.push({ role: "user", content: userMessage });
        conversationHistoryVoice.push({ role: "assistant", content: aiResponse });
        _recordVoiceTurnAnalytics({
            source: 'help_suggestion',
            heardText: userMessage,
            finalText: userMessage,
            language: heardLanguage,
            sttConfidence: 1.0,
            usedBridge: false,
            hadCorrection: !!helpCorrection,
            correction: helpCorrection,
            aiResponse,
            translationPt: _lastTranslationPt,
            understandingStatus: understanding?.status || 'clear',
            understandingReason: understanding?.reason || null,
            clarificationNeeded: !!understanding?.clarification_needed,
            helpMode: options.shadow_mode ? 'shadow_suggestion' : 'help_suggestion',
        });
        if (typeof saveCurrentVoiceSession === "function") saveCurrentVoiceSession();
        if (typeof addMessageToChat === "function") {
            addMessageToChat("assistant", aiResponse, null, "Voice");
        }

        _syncVoiceHelpPanelWithAI(aiResponse);

        isAISpeaking = true;
        updateVoiceModalStatus("speaking");

        if (voiceMode === "shadow") shadowPhraseTarget = aiResponse;
        if (voiceMode === "dictation") dictationPhraseTarget = aiResponse;

        await speakResponse(aiResponse, "en-US");
    } catch (e) {
        console.error("❌ Error sending help suggestion:", e);
        updateVoiceModalStatus("error");
    } finally {
        isAISpeaking = false;
        currentAIResponse = "";
        if (voiceMode === "shadow" && shadowPhraseTarget) {
            showShadowPrompt(shadowPhraseTarget);
            return;
        }
        if (voiceMode === "dictation" && dictationPhraseTarget) {
            showDictationPrompt(dictationPhraseTarget);
            return;
        }
        if (voiceChatActive) {
            updateVoiceModalStatus("listening");
            startVoiceListening();
        }
    }
}

window.voiceHelpUseSuggestion = async function(index) {
    if (!voiceChatActive) return;
    const i = Number(index);
    if (!Number.isInteger(i) || i < 0 || i >= _voiceHelpSuggestions.length) return;
    const selected = _voiceHelpSuggestions[i];
    if (!selected || !selected.text) return;
    if (_voiceSessionAnalytics) {
        _voiceSessionAnalytics.help.suggestion_uses += 1;
    }
    
    // START VOICE HELP SHADOW MODE (novo fluxo pedagógico)
    await _startVoiceHelpShadowMode(selected.text, selected.kind);
};

window.playVoiceHelpPronunciation = async function(index) {
    if (!voiceChatActive) return;
    const i = Number(index);
    if (!Number.isInteger(i) || i < 0 || i >= _voiceHelpSuggestions.length) return;
    const selected = _voiceHelpSuggestions[i];
    if (!selected || !selected.text) return;
    if (_voiceSessionAnalytics) {
        _voiceSessionAnalytics.help.pronunciation_plays += 1;
    }
    try {
        await speakResponse(selected.text, "en-US");
    } catch (e) {
        console.warn("[VOICE-HELP] Play pronunciation failed:", e.message);
    }
};

window.toggleVoiceHelpExpand = function() {
    const optionsEl = document.getElementById("voiceHelpOptions");
    const expandBtn = document.getElementById("voiceHelpExpandBtn");
    if (!optionsEl) return;

    const hiddenItems = optionsEl.querySelectorAll(".voice-help-option.hidden");
    const isExpanded = hiddenItems.length === 0;

    hiddenItems.forEach((item) => {
        if (isExpanded) {
            item.classList.add("hidden");
        } else {
            item.classList.remove("hidden");
        }
    });

    if (expandBtn) {
        expandBtn.textContent = isExpanded ? "+ Ver mais opções" : "- Ver menos opções";
    }
};

// ==================== VOICE HELP SHADOW MODE (PEDAGÓGICO) ====================

async function _startVoiceHelpShadowMode(responseText, responseKind) {
    _voiceHelpMode = {
        expectedText: responseText,
        kind: responseKind,
        attempts: 0,
        maxAttempts: 3,
        errors: [],
        timestamp: Date.now()
    };
    
    // Fecha o help panel
    _setVoiceHelpOpen(false);
    
    // Ativa shadow prompt com modo pedagógico
    _showShadowPromptPedagogico(responseText, { mode: "help_suggestion", kind: responseKind });
}

function _showShadowPromptPedagogico(originalPhrase, options = {}) {
    const overlay = document.getElementById("shadowScoreOverlay");
    const promptEl = document.getElementById("shadowPromptText");
    const scoreEl = document.getElementById("shadowScoreDisplay");
    const barEl = document.getElementById("shadowScoreBar");
    const retryBtn = document.getElementById("shadowRetryBtn");
    const nextBtn = document.getElementById("shadowNextBtn");
    const helpContext = document.getElementById("shadowHelpContext");
    const attemptCounter = document.getElementById("shadowAttemptNum");

    if (!overlay) return;

    // Reset visual
    if (scoreEl) { scoreEl.textContent = ""; scoreEl.className = "shadow-score-value"; }
    if (barEl) barEl.style.width = "0%";
    if (promptEl) promptEl.textContent = `Fale: "${originalPhrase}"`;
    if (retryBtn) retryBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";

    // Show pedagogical context if in help mode
    if (options.mode === "help_suggestion" && helpContext) {
        const guideText = document.getElementById("shadowGuideText");
        if (guideText) {
            guideText.textContent = _toPronunciationPt(originalPhrase);
        }
        helpContext.style.display = "block";
        
        // Show attempt counter
        if (attemptCounter && _voiceHelpMode) {
            attemptCounter.textContent = (_voiceHelpMode.attempts + 1);
        }
    } else if (helpContext) {
        helpContext.style.display = "none";
    }

    overlay.classList.add("active");

    // Start listening for repetition
    const tempRecognizer = new SpeechRecognition();
    tempRecognizer.lang = "en-US";
    tempRecognizer.continuous = false;
    tempRecognizer.interimResults = false;

    tempRecognizer.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const score = computeSimilarityScore(originalPhrase, transcript);
        const pct = Math.round(score * 100);

        // Processar resultado com lógica pedagógica se em help mode
        if (options.mode === "help_suggestion" && _voiceHelpMode) {
            _processShadowModeResultPedagogico(transcript, pct, originalPhrase);
        } else {
            // Comportamento padrão (não-pedagógico)
            if (scoreEl) {
                scoreEl.textContent = `${pct}%`;
                scoreEl.className = "shadow-score-value " + (pct >= 80 ? "score-great" : pct >= 50 ? "score-ok" : "score-low");
            }
            if (barEl) {
                barEl.style.width = pct + "%";
                barEl.style.background = pct >= 80 ? "var(--accent-success)" : pct >= 50 ? "var(--accent-warm)" : "var(--accent-danger)";
            }
            if (promptEl) {
                const label = pct >= 80 ? "Excelente!" : pct >= 50 ? "Quase lá! Tente mais uma vez." : "Continue praticando!";
                promptEl.textContent = label;
            }
            if (retryBtn) retryBtn.style.display = "inline-flex";
            if (nextBtn) nextBtn.style.display = "inline-flex";
        }
    };

    tempRecognizer.onerror = () => {
        if (options.mode === "help_suggestion" && _voiceHelpMode) {
            _processShadowModeResultPedagogico("", 0, originalPhrase, true);
        } else {
            if (retryBtn) retryBtn.style.display = "inline-flex";
            if (nextBtn) nextBtn.style.display = "inline-flex";
        }
    };

    tempRecognizer.start();
    updateVoiceModalStatus("listening");
}

function _processShadowModeResultPedagogico(userTranscript, score, expectedPhrase, isError = false) {
    const scoreEl = document.getElementById("shadowScoreDisplay");
    const barEl = document.getElementById("shadowScoreBar");
    const promptEl = document.getElementById("shadowPromptText");
    const retryBtn = document.getElementById("shadowRetryBtn");
    const nextBtn = document.getElementById("shadowNextBtn");

    if (!_voiceHelpMode) return;

    _voiceHelpMode.attempts++;
    _shadowModeAnalytics.total_attempts_per_response++;

    const pct = isError ? 0 : score;

    // Atualiza visualização
    if (scoreEl) {
        scoreEl.textContent = isError ? "⚠️" : `${pct}%`;
        scoreEl.className = "shadow-score-value shadow-result-" + 
            (pct >= 85 ? "excellent" : pct >= 75 ? "great" : pct >= 65 ? "good" : pct >= 50 ? "needs-repeat" : "too-low");
    }

    if (barEl) {
        barEl.style.width = pct + "%";
        barEl.style.background = pct >= 85 ? "#22c55e" : pct >= 75 ? "#3b82f6" : pct >= 50 ? "#f59e0b" : "#ef4444";
    }

    // Mensagem de feedback pedagógico
    let feedbackMsg = "";
    if (isError) {
        feedbackMsg = "Microfone não capturou. Tente novamente.";
    } else if (pct >= 85) {
        feedbackMsg = "🌟 Perfeito! Sua pronunciação está excelente!";
    } else if (pct >= 75) {
        feedbackMsg = "🎯 Muito bom! Sotaque natural. Quer tentar de novo?";
    } else if (pct >= 65) {
        feedbackMsg = "👍 Correto! Mas mais lento. Respire entre as palavras.";
    } else if (pct >= 50) {
        feedbackMsg = "🔄 Não conseguimos reconhecer bem. Repita mais alto ou mais lento.";
    } else {
        feedbackMsg = "🔊 Muito baixo ou muito rápido. Verifique o microfone.";
    }

    if (promptEl) {
        promptEl.textContent = feedbackMsg;
    }

    // Lógica de tentativas
    if (pct >= 85) {
        // ✅ SUCESSO: Envia a mensagem
        if (retryBtn) retryBtn.style.display = "none";
        if (nextBtn) {
            nextBtn.textContent = "✓ Continuar →";
            nextBtn.style.display = "inline-flex";
            nextBtn.onclick = async () => {
                await _progressVoiceHelpShadowSuccess();
            };
        }
    } else if (_voiceHelpMode.attempts < _voiceHelpMode.maxAttempts) {
        // 🔄 RETRY: Permite nova tentativa
        if (retryBtn) {
            retryBtn.textContent = `🔄 Tentar de novo (${_voiceHelpMode.maxAttempts - _voiceHelpMode.attempts} tentativas restantes)`;
            retryBtn.style.display = "inline-flex";
            retryBtn.onclick = () => {
                _showShadowPromptPedagogico(_voiceHelpMode.expectedText, { mode: "help_suggestion", kind: _voiceHelpMode.kind });
            };
        }
        if (nextBtn) {
            nextBtn.textContent = "⏭️ Pular";
            nextBtn.style.display = "inline-flex";
            nextBtn.onclick = async () => {
                await _progressVoiceHelpShadowSkipped();
            };
        }
    } else {
        // ❌ 3 TENTATIVAS ESGOTADAS: Auto-progride
        if (retryBtn) retryBtn.style.display = "none";
        if (nextBtn) {
            nextBtn.textContent = "⏭️ Continuar mesmo assim →";
            nextBtn.style.display = "inline-flex";
            nextBtn.onclick = async () => {
                await _progressVoiceHelpShadowAutoProgressed();
            };
        }
    }
}

async function _progressVoiceHelpShadowSuccess() {
    if (!_voiceHelpMode) return;
    if (_voiceSessionAnalytics) {
        _voiceSessionAnalytics.help.shadow_successes += 1;
    }
    
    // Fecha overlay
    const overlay = document.getElementById("shadowScoreOverlay");
    if (overlay) overlay.classList.remove("active");
    
    // Envia mensagem normalmente
    await _sendVoiceTextTurnFromHelp(_voiceHelpMode.expectedText, {
        shadow_mode: {
            expected_text: _voiceHelpMode.expectedText,
            user_attempts: _voiceHelpMode.attempts,
            final_score: 85,
            pronunciation_errors: [],
            auto_progressed: false
        }
    });
    
    _voiceHelpMode = null;
}

async function _progressVoiceHelpShadowSkipped() {
    if (!_voiceHelpMode) return;
    if (_voiceSessionAnalytics) {
        _voiceSessionAnalytics.help.shadow_skips += 1;
    }
    
    const overlay = document.getElementById("shadowScoreOverlay");
    if (overlay) overlay.classList.remove("active");
    
    // Envia com flag de skip
    await _sendVoiceTextTurnFromHelp(_voiceHelpMode.expectedText, {
        shadow_mode: {
            expected_text: _voiceHelpMode.expectedText,
            user_attempts: _voiceHelpMode.attempts,
            final_score: 0,
            skipped: true,
            auto_progressed: false
        }
    });
    
    _voiceHelpMode = null;
}

async function _progressVoiceHelpShadowAutoProgressed() {
    if (!_voiceHelpMode) return;
    if (_voiceSessionAnalytics) {
        _voiceSessionAnalytics.help.shadow_auto_progressed += 1;
    }
    
    const overlay = document.getElementById("shadowScoreOverlay");
    if (overlay) overlay.classList.remove("active");
    
    // Anota como dificuldade pedagógica
    _shadowModeAnalytics.auto_progressed_count++;
    if (!_shadowModeAnalytics.response_types_failed[_voiceHelpMode.kind]) {
        _shadowModeAnalytics.response_types_failed[_voiceHelpMode.kind] = 0;
    }
    _shadowModeAnalytics.response_types_failed[_voiceHelpMode.kind]++;
    
    // Envia com flag de auto-progrede
    await _sendVoiceTextTurnFromHelp(_voiceHelpMode.expectedText, {
        shadow_mode: {
            expected_text: _voiceHelpMode.expectedText,
            user_attempts: _voiceHelpMode.maxAttempts,
            final_score: 0,
            auto_progressed: true,
            reason: "max_attempts_exhausted"
        }
    });
    
    _voiceHelpMode = null;
}

function _closeVoiceHelpPanel() {
    _setVoiceHelpOpen(false);
}

async function startAIKickoffTurn() {
    console.log("🤖 [KICKOFF] Starting AI kickoff turn");
    
    const authToken = window.authToken || localStorage.getItem("grilo_token");
    // API_BASE_URL is defined globally in utils.js
    const aiResponseText = document.getElementById("aiResponseText");

    console.log("🤖 [KICKOFF] Auth token present:", !!authToken);
    console.log("🤖 [KICKOFF] API URL:", API_BASE_URL);

    if (aiResponseText) {
        aiResponseText.innerHTML = "<p>Vou iniciar a conversa para te guiar no primeiro passo.</p>";
    }
    updateVoiceModalStatus("processing");

    if (!authToken) {
        console.error("❌ No auth token for kickoff");
        if (voiceChatActive) {
            updateVoiceModalStatus("listening");
            startVoiceListening();
        }
        return;
    }

    try {
        console.log("📡 [KICKOFF] Sending kickoff request to backend...");
        const response = await fetch(API_BASE_URL + "/api/voice-chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                message: "__voice_session_start__",
                language: "en",
                history: conversationHistoryVoice,
                stt_confidence: 1.0,
                level: window.userVoiceLevel || "b1",
                voice_mode: voiceMode,
                conversation_topic: voiceTopic,
                bilingual_mode: voiceMode === 'free' ? true : bilingualMode,
                input_bridge_mode: voiceMode === 'free' ? voiceBridgeMode : false,
            })
        });

        if (response.status === 401) {
            _handleVoiceUnauthorized("kickoff");
            return;
        }

        console.log("✅ [KICKOFF] Response received, status:", response.status);
        
        if (!response.ok) {
            throw new Error(`Kickoff failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ [KICKOFF] Response data:", data);
        
        const aiResponse = data.response || "Hello. Let us start. Your turn: say Hello.";
        _lastTranslationPt = data.translation_pt || null;

        console.log("💬 [KICKOFF] AI Response:", aiResponse);

        renderVoiceResponseCard({
            englishText: aiResponse,
            portugueseText: _lastTranslationPt,
            turnHint: voiceMode === 'free' && voiceBridgeMode
                ? 'Responda do jeito que sair melhor: portugues ou ingles.'
                : 'Responda em ingles com uma frase curta.',
        });

        _syncVoiceHelpPanelWithAI(aiResponse);

        conversationHistoryVoice.push({ role: "assistant", content: aiResponse });
        if (typeof saveCurrentVoiceSession === "function") saveCurrentVoiceSession();
        if (typeof addMessageToChat === "function") {
            addMessageToChat("assistant", aiResponse, null, "Voice");
        }

        isAISpeaking = true;
        updateVoiceModalStatus("speaking");
        console.log("🔊 [KICKOFF] About to speak AI response...");
        await speakResponse(aiResponse, "en-US");
        console.log("✅ [KICKOFF] AI response spoken, ready for user input");
    } catch (error) {
        console.error("❌ [KICKOFF] Error:", error);
    } finally {
        isAISpeaking = false;
        currentAIResponse = "";
        if (voiceChatActive) {
            console.log("🎤 [KICKOFF] Starting voice listening...");
            updateVoiceModalStatus("listening");
            startVoiceListening();
        }
    }
}

function getDefaultVoiceSetupOptions() {
    return {
        mode: "free",
        topic: null,
        bilingual: true,
    };
}

window.startVoiceChatWithSetup = async function(opts = {}) {
    console.log("🚀 [VOICE-SETUP] Starting voice chat with options:", opts);
    
    if (voiceChatActive) {
        console.warn("⚠️ [VOICE-SETUP] Voice chat already active, aborting");
        return;
    }

    try {
        voiceMode = opts.mode || "free";
        voiceTopic = opts.topic || null;
        bilingualMode = voiceMode === "free" ? true : !!opts.bilingual;
        voiceBridgeMode = voiceMode === "free" ? true : false;
        // Restore bridge mode preference from localStorage if free mode
        if (voiceMode === "free") {
            const savedBridgeMode = localStorage.getItem('voiceBridgeMode');
            if (savedBridgeMode !== null) {
                voiceBridgeMode = savedBridgeMode === 'true';
                console.log("🔄 [VOICE-SETUP] Restored bridge mode from localStorage:", voiceBridgeMode);
            }
        }
        ttsSpeed = 1.0;
        shadowPhraseTarget = null;
        dictationPhraseTarget = null;
        console.log("✅ [VOICE-SETUP] Settings configured:", { voiceMode, voiceTopic, bilingualMode, voiceBridgeMode });

        // Close setup modal
        const setupModal = document.getElementById("voiceSetupModal");
        if (setupModal) setupModal.classList.remove("active");
        console.log("✅ [VOICE-SETUP] Setup modal closed");

        // Show stop button, hide start button
        const startBtn = document.getElementById("voiceStartBtn");
        const stopBtn = document.getElementById("voiceStopBtn");
        if (startBtn) startBtn.style.display = "none";
        if (stopBtn) stopBtn.style.display = "inline-flex";
        console.log("✅ [VOICE-SETUP] UI buttons updated");

        _syncVoiceBridgeUi();
        console.log("✅ [VOICE-SETUP] Voice bridge UI synced");

        const objectiveByMode = {
            guided: "seguir um cenário com respostas naturais",
            free: "conversar com liberdade e clareza",
        };
        const introByTopic = {
            restaurant: "Você está em um restaurante e precisa fazer seu pedido com confiança.",
            airport: "Você está no aeroporto resolvendo check-in, portão e embarque.",
            job: "Você está em uma entrevista e precisa explicar sua experiência.",
            travel: "Você está viajando e precisa pedir informações com clareza.",
            doctor: "Você está em uma consulta e precisa explicar sintomas.",
        };
        const subtitle = document.getElementById("voiceDimensionSubtitle");
        const aiResponseText = document.getElementById("aiResponseText");
        const currentModeLabel = _modeLabelPt(voiceMode);

        if (subtitle) {
            subtitle.textContent = voiceMode === "guided"
                ? `Cenário: ${_topicLabelPt(voiceTopic)} · Modo ${currentModeLabel} · Objetivo: ${objectiveByMode[voiceMode] || "praticar inglês com foco em progresso"}.`
                : `Modo ${currentModeLabel} · Fale como preferir e eu continuo em ingles.`;
        }
        if (aiResponseText) {
            const introText = voiceMode === "guided"
                ? (introByTopic[voiceTopic] || "Você está em uma situação prática de conversa.")
                : "Modo livre ativado. Comece com qualquer frase e eu continuo.";
            aiResponseText.innerHTML = `<p>${_escapeHtml(introText)}</p><p class="voice-subhint-line">A IA fala em inglês e você responde do jeito mais natural possível.</p>`;
        }
        console.log("✅ [VOICE-SETUP] Subtitle and intro text set");

        document.body.classList.add("voice-dimension-mode", "voice-dimension-live");
        clearLiveErrors();
        _ensureVoiceHelpButton();
        _setVoiceHelpOpen(false);
        console.log("✅ [VOICE-SETUP] Document classes and help panel updated");
        
        console.log("🎙️ [VOICE-SETUP] Starting voice chat...");
        startVoiceChat({ autoListen: false });

        if (voiceMode === "free") {
            console.log("🎤 [VOICE-SETUP] Free mode starts with user turn");
            updateVoiceModalStatus("listening");
            startVoiceListening();
        } else {
            console.log("🎤 [VOICE-SETUP] Speaking PT guidance...");
            await speakResponse(_buildVoicePtGuidanceText(), "pt-BR");
            
            console.log("🤖 [VOICE-SETUP] Starting AI kickoff turn...");
            await startAIKickoffTurn();
        }
        
        console.log("✅ [VOICE-SETUP] Voice chat initialization complete!");
    } catch (error) {
        console.error("❌ [VOICE-SETUP] Error during voice chat setup:", error);
        voiceChatActive = false;
        const startBtn = document.getElementById("voiceStartBtn");
        const stopBtn = document.getElementById("voiceStopBtn");
        if (startBtn) startBtn.style.display = "inline-flex";
        if (stopBtn) stopBtn.style.display = "none";
    }
};

window.toggleVoiceBridgeMode = function() {
    if (!voiceChatActive || voiceMode !== "free") return;
    voiceBridgeMode = !voiceBridgeMode;
    // Persist bridge mode preference
    localStorage.setItem('voiceBridgeMode', voiceBridgeMode);
    _syncVoiceBridgeUi();
    showVoiceToast(voiceBridgeMode ? "Ponte ligada: voce pode responder em PT ou EN." : "Ponte desligada: responda em ingles.");
};

window.startVoiceSession = function() {
    console.log("🎯 [VOICE-START] startVoiceSession called | active:", voiceChatActive);

    const recapModal = document.getElementById("voiceRecapModal");
    if (recapModal) recapModal.classList.remove("active");

    // Always allow opening setup from the main button.
    // Even if a previous session flag remained true, the user must see a response to click.
    if (typeof window.openVoiceSetupModal === 'function') {
        window.openVoiceSetupModal();
    } else {
        const modal = document.getElementById("voiceSetupModal");
        if (modal) modal.classList.add("active");
    }
};

window.openVoiceSetupModal = function() {
    console.log("🧩 [VOICE-SETUP] openVoiceSetupModal called");
    const modal = document.getElementById("voiceSetupModal");
    if (modal) {
        const level = parseInt(window.userLevel || 1);
        const bilingualToggle = document.getElementById("bilingualToggle");
        const modeButtons = Array.from(modal.querySelectorAll('.voice-mode-btn'));

        modeButtons.forEach((btn) => {
            btn.disabled = false;
            btn.classList.remove('locked');
            btn.title = '';
        });

        document.querySelectorAll(".voice-mode-btn").forEach((btn) => btn.classList.remove("active"));
        const freeBtn = modal.querySelector('.voice-mode-btn[data-mode="free"]');
        if (freeBtn) freeBtn.classList.add('active');

        const activeMode = modal.querySelector('.voice-mode-btn.active');
        _syncVoiceSetupUi(activeMode ? activeMode.dataset.mode : 'free');

        if (bilingualToggle) {
            bilingualToggle.checked = level <= 2;
            bilingualToggle.onchange = () => _renderVoiceSetupPreview();
        }
        modal.classList.add("active");
        console.log("✅ [VOICE-SETUP] modal active =", modal.classList.contains('active'));
        _renderVoiceSetupOverview();
        _renderVoiceSetupPreview();
    } else {
        console.error("❌ [VOICE-SETUP] voiceSetupModal not found in DOM");
    }
};

window.selectVoiceMode = function(btn) {
    if (btn.disabled) return;
    document.querySelectorAll(".voice-mode-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    _syncVoiceSetupUi(btn.dataset.mode);
    _renderVoiceSetupPreview();
};

window.selectVoiceTopic = function(btn) {
    document.querySelectorAll(".topic-chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    _renderVoiceSetupPreview();
};

window.confirmVoiceSetup = function() {
    console.log("🎯 [CONFIRM-SETUP] Button clicked!");
    
    const s = _currentVoiceSetupSelections();
    console.log("📋 [CONFIRM-SETUP] Current selections:", s);
    
    const modeBtn = document.querySelector(".voice-mode-btn.active");
    console.log("🔘 [CONFIRM-SETUP] Mode button:", modeBtn, "Disabled:", modeBtn ? modeBtn.disabled : 'N/A');
    
    if (!modeBtn || modeBtn.disabled) {
        console.warn("⚠️ [CONFIRM-SETUP] No active mode button or button is disabled!");
        return;
    }

    console.log("✅ [CONFIRM-SETUP] Calling startVoiceChatWithSetup with:", s);
    window.startVoiceChatWithSetup({
        mode: s.mode,
        topic: s.topic,
        bilingual: s.bilingual,
    });
};
console.log("✅ [VOICE-CONTROLLER] confirmVoiceSetup function defined");

window.playPracticePhrase = async function(phrase) {
    const text = (phrase || '').trim();
    if (!text) return;
    try {
        await speakResponse(text, 'en-US');
    } catch (e) {
        console.warn('[VOICE] Failed to play practice phrase:', e.message);
    }
};

function stopVoiceChat(options = {}) {
    const suppressRecap = !!options.suppressRecap;
    const suppressSessionRecord = !!options.suppressSessionRecord;
    console.log("⏹️ Stopping voice chat");
    voiceChatActive = false;
    if (voiceModalRecognizer && isListening) {
        console.log("Stopping recognizer");
        try {
            voiceModalRecognizer.stop();
        } catch (e) {
            console.log("Recognizer already stopped");
        }
        isListening = false;
    }
    // Release mic stream
    if (_micStream) {
        _micStream.getTracks().forEach(t => t.stop());
        _micStream = null;
        _mediaRecorder = null;
        _audioChunks = [];
    }
    speechSynthesis.cancel();
    isAISpeaking = false;

    if (_voiceTurnCommitTimer) {
        clearTimeout(_voiceTurnCommitTimer);
        _voiceTurnCommitTimer = null;
    }
    pendingVoiceMessage = null;
    _pendingVoiceConfidence = 1.0;

    // Capture duration before clearing start time
    let durationSeconds = 0;
    if (_voiceSessionStart) {
        durationSeconds = Math.round((Date.now() - _voiceSessionStart) / 1000);
        _voiceSessionStart = null;
        window._voiceSessionStart = null;
    }

    // Record session duration to backend (fire-and-forget).
    // quality_score is not available here (recap hasn't run yet) — session-end just stores duration.
    // The recap endpoint (/api/voice/recap) will persist the full quality snapshot.
    const sessionToken = window.authToken || localStorage.getItem("grilo_token");
    if (!suppressSessionRecord && durationSeconds > 5 && sessionToken) {
        fetch(`${API_BASE_URL}/api/voice/session-end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
            body: JSON.stringify({
                duration_seconds: durationSeconds,
                corrections_count: _liveErrorCount,
                exchanges: Math.floor(conversationHistoryVoice.length / 2),
                analytics_summary: _summarizeVoiceSessionAnalytics(durationSeconds),
            })
        }).catch(e => console.warn('[VOICE-SESSION] Failed to record duration:', e));
    }

    const startBtn = document.getElementById("voiceStartBtn");
    const stopBtn = document.getElementById("voiceStopBtn");
    const setupModal = document.getElementById("voiceSetupModal");
    const overlay = document.getElementById("aiResponseOverlay");
    const helpBtn = document.getElementById("voiceHelpBtn");

    if (startBtn) {
        startBtn.style.display = "inline-flex";
        startBtn.classList.remove("active", "listening", "speaking");
    }
    if (stopBtn) stopBtn.style.display = "none";
    if (setupModal) setupModal.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    if (helpBtn) helpBtn.remove();
    _setVoiceHelpOpen(false);
    _syncVoiceBridgeUi();

    document.body.classList.remove("voice-dimension-live");
    updateVoiceModalStatus("stopped");

    // Show recap whenever there was meaningful interaction in session.
    if (!suppressRecap && (conversationHistoryVoice.length >= 2 || durationSeconds >= 15)) {
        showVoiceRecap(durationSeconds);
    }
}

function queueVoiceTurnCommit(transcript, confidence) {
    const text = String(transcript || '').trim();
    if (!text) return;

    console.log('📝 Queueing voice turn commit:', text);

    pendingVoiceMessage = pendingVoiceMessage
        ? `${pendingVoiceMessage} ${text}`
        : text;
    _pendingVoiceConfidence = Math.min(_pendingVoiceConfidence, confidence || 1.0);

    if (_voiceTurnCommitTimer) {
        clearTimeout(_voiceTurnCommitTimer);
    }

    _voiceTurnCommitTimer = setTimeout(() => {
        _voiceTurnCommitTimer = null;
        const committedMessage = String(pendingVoiceMessage || '').replace(/\s+/g, ' ').trim();
        const committedConfidence = _pendingVoiceConfidence;
        pendingVoiceMessage = null;
        _pendingVoiceConfidence = 1.0;

        if (!committedMessage || !voiceChatActive) return;
        void processCommittedVoiceTurn(committedMessage, committedConfidence);
    }, END_OF_SPEECH_GRACE_MS);
}

async function processCommittedVoiceTurn(initialMessage, minConfidence) {
    console.log('✅ Final transcript committed after grace window:', initialMessage);

    // Stop MediaRecorder and attempt Whisper transcription
    const recordingPromise = _stopAudioCapture();

    // Debounce: don't send if we already have a pending message
    if (messageDebounceTimer) {
        console.log('⏳ Debouncing repeated input, ignoring...');
        return;
    }

    // If AI is speaking, interrupt it
    if (isAISpeaking) {
        console.log('🎤 User spoke while AI speaking - interrupting AI');
        speechSynthesis.cancel();
        isAISpeaking = false;
        stopPulsingAnimation();
    }

    // Immediately stop the recognizer
    console.log('🛑 Stopping recognizer to process message');
    isListening = false;
    try {
        voiceModalRecognizer.stop();
    } catch (e) {
        console.log('Stop recognizer error:', e.message);
    }

    // Update status — show what was heard so user can confirm recognition
    updateVoiceModalStatus('processing');
    let userMessage = initialMessage; // may be upgraded by Whisper below
    const aiResponseText = document.getElementById('aiResponseText');
    let userInputLanguage = normalizeVoiceInputLanguage(userMessage);
    if (aiResponseText) {
        const confidenceClass = minConfidence >= 0.75
            ? 'voice-user-heard-text-ok'
            : minConfidence >= 0.5
                ? 'voice-user-heard-text-mid'
                : 'voice-user-heard-text-low';
        const confidenceNote = minConfidence < 0.5 ? ' <em class="voice-user-heard-note">(baixa confianca)</em>' : '';
        aiResponseText.innerHTML = `<p class="voice-user-heard-label">Voce disse:${confidenceNote}</p><p class="voice-user-heard-text ${confidenceClass}">"${userMessage}"</p>`;
    }

    // Validate auth token
    const authToken = window.authToken || localStorage.getItem('grilo_token');
    if (!authToken) {
        console.error('❌ No auth token available');
        updateVoiceModalStatus('listening');
        setTimeout(() => startVoiceListening(), 1000);
        return;
    }

    try {
        // Attempt Whisper upgrade (awaits the recording that was stopped above)
        const recording = await recordingPromise;
        const whisperResult = await _transcribeWithWhisper(recording, userMessage, authToken);
        if (whisperResult && whisperResult !== userMessage) {
            userMessage = whisperResult;
            userInputLanguage = normalizeVoiceInputLanguage(userMessage);
            // Update the displayed "you said" text with Whisper's transcript
            if (aiResponseText) {
                aiResponseText.innerHTML = `<p class="voice-user-heard-label">Voce disse:</p><p class="voice-user-heard-text voice-user-heard-text-ok">"${userMessage}"</p>`;
            }
        }

        if (voiceMode === 'free' && userInputLanguage === 'en') {
            showVoiceToast('Boa. Voce respondeu em ingles.');
        }

        console.log('📤 Sending to voice chat API:', userMessage);
        const messageStartTime = performance.now();

        // Add user message to voice chat log (hidden container — for session persistence)
        if (typeof addMessageToChat === 'function') {
            addMessageToChat('user', userMessage, null, 'Voice');
        }
        // Set debounce timer to prevent rapid successive messages
        messageDebounceTimer = setTimeout(() => {
            messageDebounceTimer = null;
        }, MESSAGE_DEBOUNCE_MS);

        // Send to pure voice chat endpoint with proper API base
        // API_BASE_URL is defined globally in utils.js
        console.log('📡 Using API URL:', API_BASE_URL);

        // Create abort controller for request timeout
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), API_TIMEOUT_MS);

        const apiStartTime = performance.now();
        const response = await fetch(API_BASE_URL + '/api/voice-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                message: userMessage,
                language: userInputLanguage,
                history: conversationHistoryVoice,
                stt_confidence: Math.round(minConfidence * 100) / 100,
                level: window.userVoiceLevel || 'b1',
                voice_mode: voiceMode,
                conversation_topic: voiceTopic,
                bilingual_mode: voiceMode === 'free' ? true : bilingualMode,
                input_bridge_mode: voiceMode === 'free' ? voiceBridgeMode : false,
            }),
            signal: abortController.signal
        });

        if (response.status === 401) {
            clearTimeout(timeoutId);
            _handleVoiceUnauthorized("voice-turn");
            return;
        }

        const apiEndTime = performance.now();
        const apiLatency = apiEndTime - apiStartTime;

        // Clear timeout if request completes
        clearTimeout(timeoutId);

        console.log(`⏱️ API latency: ${apiLatency.toFixed(0)}ms`);
        console.log('📬 Response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            const aiResponse = data.response;
            _lastTranslationPt = data.translation_pt || null;
            currentAIResponse = aiResponse; // Store for echo detection
            const understanding = data.understanding || null;
            const detectedInput = data.detected_input || null;
            const heardLanguage = understanding?.input_language || detectedInput?.language || userInputLanguage;

            // Drop correction card — structured data from backend (no client-side regex)
            const turnCorrection = data.correction && data.correction.correct ? data.correction : null;
            if (turnCorrection) {
                dropLiveError(turnCorrection.wrong, turnCorrection.correct, turnCorrection.tip, {
                    errorType: turnCorrection.error_type,
                    language: heardLanguage,
                    turnIndex: _voiceSessionAnalytics.turns.length + 1,
                });
            }

            const recognitionLatency = apiStartTime - messageStartTime;
            console.log(`✅ Full AI Response (${aiResponse.length} chars)`);
            console.log(`⏱️ User speech->API: ${recognitionLatency.toFixed(0)}ms | API time: ${data.execution_time_ms || 'unknown'}ms`);

            // Show AI response modal overlay
            if (aiResponseText) {
                // Check if the AI corrected a phrase — show visual correction card if so
                const correctedPhrase = extractCorrectedPhrase(aiResponse);
                renderVoiceResponseCard({
                    heardText: userMessage,
                    heardLanguage,
                    englishText: aiResponse,
                    portugueseText: _lastTranslationPt,
                    turnHint: 'Escute a resposta. Quando eu terminar, a palavra volta para voce.',
                    correctionPhrase: correctedPhrase,
                    understandingStatus: understanding?.status || 'clear',
                    understandingNote: understanding?.note_pt || '',
                    understandingLabel: _getVoiceUnderstandingLabel(understanding?.status),
                });
                console.log('📱 AI Response Modal shown');
            }

            _syncVoiceHelpPanelWithAI(aiResponse);

            // Add to voice conversation history (separate from written chat)
            conversationHistoryVoice.push({ role: 'user', content: userMessage });
            conversationHistoryVoice.push({ role: 'assistant', content: aiResponse });
            _recordVoiceTurnAnalytics({
                source: 'voice',
                heardText: initialMessage,
                finalText: userMessage,
                language: heardLanguage,
                sttConfidence: minConfidence,
                usedBridge: voiceMode === 'free' && voiceBridgeMode && userInputLanguage === 'pt',
                hadCorrection: !!turnCorrection,
                correction: turnCorrection,
                aiResponse,
                translationPt: _lastTranslationPt,
                understandingStatus: understanding?.status || 'clear',
                understandingReason: understanding?.reason || null,
                clarificationNeeded: !!understanding?.clarification_needed,
                recognitionLatencyMs: recognitionLatency,
                apiLatencyMs: apiLatency,
            });
            if (typeof saveCurrentVoiceSession === 'function') saveCurrentVoiceSession();
            // Add AI message to voice chat UI
            if (typeof addMessageToChat === 'function') {
                addMessageToChat('assistant', aiResponse, null, 'Voice');
            }

            // Speak the response
            isAISpeaking = true;
            updateVoiceModalStatus('speaking');

            // Store phrase target for shadow/dictation modes
            if (voiceMode === 'shadow') shadowPhraseTarget = aiResponse;
            if (voiceMode === 'dictation') dictationPhraseTarget = aiResponse;

            // Ensure recognizer is stopped while AI speaks — prevents self-echo
            isListening = false;
            try { voiceModalRecognizer.stop(); } catch (e) { /* already stopped */ }

            // AI always responds in English — use English TTS voice
            await speakResponse(aiResponse, 'en-US');

            isAISpeaking = false;
            currentAIResponse = ''; // Clear echo buffer after TTS done

            // Post-TTS: shadow or dictation mode interactions
            if (voiceMode === 'shadow' && shadowPhraseTarget) {
                showShadowPrompt(shadowPhraseTarget);
                return; // don't auto-restart — shadow prompt will restart
            } else if (voiceMode === 'dictation' && dictationPhraseTarget) {
                showDictationPrompt(dictationPhraseTarget);
                return; // don't auto-restart — dictation input will take over
            }

            // Restart listening immediately after TTS ends
            if (voiceChatActive) {
                updateVoiceModalStatus('listening');
                startVoiceListening();
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Failed to get AI response:', response.status, errorData);

            updateVoiceModalStatus('error');
            setTimeout(() => {
                if (voiceChatActive) {
                    console.log('Retrying after error');
                    startVoiceListening();
                }
            }, 2000);
        }
    } catch (error) {
        // Clear debounce timer on error
        clearTimeout(messageDebounceTimer);
        messageDebounceTimer = null;

        // Check if error was timeout
        if (error.name === 'AbortError') {
            console.error('❌ API request timeout (25s exceeded)');
            updateVoiceModalStatus('error');
        } else {
            console.error('❌ Error in voice chat:', error);
            updateVoiceModalStatus('error');
        }

        if (voiceChatActive) {
            setTimeout(() => startVoiceListening(), 2000);
        }
    }
}

function initializeVoiceModalRecognizer() {
    if (voiceModalRecognizer) {
        console.log("✅ Voice modal recognizer already initialized");
        return;
    }

    if (!SpeechRecognition) {
        alert("❌ Speech Recognition não suportado neste navegador");
        return;
    }

    console.log("🔧 Initializing voice modal recognizer");
    voiceModalRecognizer = new SpeechRecognition();
    voiceModalRecognizer.continuous = false;
    voiceModalRecognizer.interimResults = true;
    voiceModalRecognizer.lang = _voiceRecognizerLanguage();
    voiceModalRecognizer.maxAlternatives = 5; // Top-5 hypotheses — GriloVR escolhe a melhor

    voiceModalRecognizer.onstart = () => {
        console.log("✅ Recognizer started, listening for speech");
        if (!voiceChatActive) return;
        isListening = true;
        _beginAudioCapture(); // start recording alongside browser STT
        updateVoiceModalStatus("listening");
    };

    voiceModalRecognizer.onsoundstart = () => {
        console.log("🔊 Sound detected");
    };

    voiceModalRecognizer.onspeechstart = () => {
        console.log("🗣️ Speech started");
        if (!voiceChatActive) return;
        updateVoiceModalStatus("listening");
    };

    voiceModalRecognizer.onspeechend = () => {
        console.log("🔇 Speech ended — processing...");
        if (!voiceChatActive) return;
        updateVoiceModalStatus("processing");
    };

    voiceModalRecognizer.onnomatch = () => {
        console.warn("⚠️ No match found for speech input");
        if (!voiceChatActive) return;
        const aiResponseText = document.getElementById("aiResponseText");
        if (aiResponseText) {
            aiResponseText.innerHTML = `<p class="voice-status-note voice-status-note-soft">Nao entendi bem. Repita com mais calma.</p>`;
        }
        setTimeout(() => { if (voiceChatActive) startVoiceListening(); }, 1500);
    };

    voiceModalRecognizer.onerror = (event) => {
        console.error("❌ Voice recognition error:", event.error);
        if (!voiceChatActive) return;

        if (event.error === "aborted") {
            // Expected when we call .stop() — silent
            return;
        }

        let errorMsg = "";
        let autoRestart = false;
        let restartDelay = 2000;

        switch (event.error) {
            case "no-speech":
                console.log("🔇 No speech detected — auto-restarting");
                autoRestart = true;
                restartDelay = 1500;
                break;
            case "audio-capture":
                errorMsg = "Microfone não encontrado. Verifique as permissões.";
                break;
            case "network":
                errorMsg = "Erro de conexão. Verifique sua internet.";
                autoRestart = true;
                restartDelay = 3000;
                break;
            case "not-allowed":
            case "service-not-allowed":
                errorMsg = "Permissão de microfone negada. Permita o acesso nas configurações do navegador.";
                break;
            default:
                errorMsg = "Erro de reconhecimento. Tentando novamente...";
                autoRestart = true;
                restartDelay = 2000;
        }

        if (errorMsg) {
            const aiResponseText = document.getElementById("aiResponseText");
            const aiResponseOverlay = document.getElementById("aiResponseOverlay");
            if (aiResponseText) {
                aiResponseText.innerHTML = `<p class="voice-status-note voice-status-note-error">${errorMsg}</p>`;
            }
        }

        isListening = false;
        if (autoRestart) {
            setTimeout(() => { if (voiceChatActive) startVoiceListening(); }, restartDelay);
        } else {
            updateVoiceModalStatus("error");
        }
    };

    voiceModalRecognizer.onresult = async (event) => {
        console.log("📨 Result event received");
        console.log("  resultIndex:", event.resultIndex);
        console.log("  results.length:", event.results.length);

        if (!voiceChatActive) {
            console.log("Voice chat not active, ignoring result");
            return;
        }

        let interimTranscript = "";
        let finalTranscript = "";
        let minConfidence = 1.0; // Track lowest confidence across final results

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const isFinal = event.results[i].isFinal;

            if (isFinal) {
                // Pick the alternative with the highest confidence from up to 5 candidates
                let bestTranscript = event.results[i][0].transcript;
                let bestConfidence = event.results[i][0].confidence || 0;
                for (let a = 1; a < event.results[i].length; a++) {
                    const altConf = event.results[i][a].confidence || 0;
                    if (altConf > bestConfidence) {
                        bestConfidence = altConf;
                        bestTranscript = event.results[i][a].transcript;
                    }
                }
                finalTranscript += bestTranscript + " ";
                console.log(`  Result[${i}]: "${bestTranscript}" (isFinal: true, best conf: ${bestConfidence.toFixed(2)}, alternatives: ${event.results[i].length})`);
                if (bestConfidence > 0) {
                    minConfidence = Math.min(minConfidence, bestConfidence);
                }
                // Atualiza indicador visual de confidence (nova melhoria)
                try { _updateVoiceConfidenceIndicator(bestConfidence); } catch (e) {}
            } else {
                const transcript = event.results[i][0].transcript;
                interimTranscript += transcript;
                console.log(`  Result[${i}]: "${transcript}" (isFinal: false)`);
            }
        }

        // Immersive mode intentionally avoids showing transcript text.
        if (interimTranscript) {
            updateVoiceModalStatus("listening");
        }

        // Process final transcript
        if (finalTranscript.trim().length > 0) {
            const trimmedMessage = finalTranscript.trim();
            const normalizedMessage = trimmedMessage.toLowerCase().replace(/[^a-z0-9à-ÿ' -]/gi, '').trim();
            const quickReplies = new Set([
                'hello', 'hi', 'hey', 'yes', 'no', 'ok', 'okay', 'thanks', 'thank you',
                'oi', 'ola', 'olá', 'sim', 'nao', 'não', 'obrigado', 'obrigada'
            ]);
            
            // Ignore very short transcripts - likely background noise
            const wordCount = trimmedMessage.split(/\s+/).length;
            const isFreeModeInput = voiceMode === 'free';
            const isValidInput = isFreeModeInput
                ? (trimmedMessage.length >= 2 && wordCount >= 1)
                    || quickReplies.has(normalizedMessage)
                : (trimmedMessage.length >= 5 && wordCount >= 2)
                    || quickReplies.has(normalizedMessage);
            
            if (!isValidInput) {
                console.log("⏭️ Ignoring short noise:", trimmedMessage);
                return;
            }
            
            // If AI is speaking, apply strict validation to avoid self-echo
            if (isAISpeaking) {
                const isSelfEcho = isSimilarText(trimmedMessage, currentAIResponse);
                if (isSelfEcho) {
                    console.log("🔊 Ignoring potential self-echo from speaker:", trimmedMessage.substring(0, 50));
                    return;
                }
                
                // When AI is speaking, require at least 8 chars or 3+ words (stricter threshold)
                if (trimmedMessage.length < 8 || wordCount < 3) {
                    console.log("⏭️ Ignoring short input while AI speaking (strict mode)");
                    return;
                }
            }
            
            console.log('✅ Final transcript detected, waiting grace window:', trimmedMessage);
            queueVoiceTurnCommit(trimmedMessage, minConfidence);
        }
    };

    voiceModalRecognizer.onend = () => {
        console.log("🛑 Recognizer ended event fired");
        isListening = false;
        if (!voiceChatActive) {
            console.log("Voice chat not active");
            return;
        }
        if (_voiceTurnCommitTimer || pendingVoiceMessage) {
            console.log("⏳ Recognizer ended with pending voice turn — waiting for commit");
            return;
        }
        // Only auto-restart for unexpected stops (not when AI is speaking or processing a message)
        if (!messageDebounceTimer && !isAISpeaking) {
            console.log("🔄 Recognizer ended unexpectedly — restarting");
            startVoiceListening(); // No delay: restart immediately to catch start of next utterance
        }
    };

    console.log("✅ Voice modal recognizer initialized");
}

function startVoiceListening() {
    if (!voiceChatActive) {
        console.log("⚠️ Voice chat not active, cannot start listening");
        return;
    }
    
    if (!voiceModalRecognizer) {
        console.log("⚠️ Recognizer not initialized, initializing...");
        initializeVoiceModalRecognizer();
    }

    if (isListening) {
        console.log("🎙️ Recognizer already listening in background");
        return;
    }

    try {
        console.log("🎤 Starting recognizer...");
        isListening = true;
        voiceModalRecognizer.lang = _voiceRecognizerLanguage();
        voiceModalRecognizer.start();
    } catch (e) {
        console.error("⚠️ Recognizer start error:", e.message);
        // Recognizer might already be running
        if (e.message.includes("already started")) {
            console.log("Recognizer already active, continuing");
            isListening = true;
        }
    }
}

function updateVoiceModalStatus(status) {
    const statusEl = document.getElementById("voiceDimensionStatus");
    if (!statusEl) return;

    const statusText = statusEl.querySelector(".voice-status-text") || statusEl;
    const voiceStartBtn = document.getElementById("voiceStartBtn");
    const aiResponseText = document.getElementById("aiResponseText");
    const subtitle = document.getElementById("voiceDimensionSubtitle");
    
    // Remove all previous status classes
    statusEl.classList.remove("listening", "speaking", "processing", "waiting", "error");
    if (voiceStartBtn) {
        voiceStartBtn.classList.remove("active", "listening", "speaking");
    }

    console.log("📊 Status updated to:", status);

    switch (status) {
        case "listening":
            statusEl.classList.add("listening");
            statusText.innerHTML = '<span class="voice-indicator animate-pulse"></span>Sua vez de falar';
            if (subtitle) subtitle.textContent = voiceMode === 'free' && voiceBridgeMode
                ? 'Modo livre com Ponte ligada: pode responder em portugues ou ingles.'
                : 'Responda em ingles com uma frase curta. Se travar, toque em Ajuda.';
            if (voiceStartBtn) voiceStartBtn.classList.add("active", "listening");
            break;
        case "speaking":
            statusEl.classList.add("speaking");
            statusText.innerHTML = '<span class="voice-indicator speaking"></span>IA respondendo';
            // aiResponseText already contains the actual response — don't overwrite it
            if (subtitle) subtitle.textContent = "Ouça com atenção e acompanhe para acelerar sua evolução.";
            if (voiceStartBtn) voiceStartBtn.classList.add("active", "speaking");
            break;
        case "processing":
            statusEl.classList.add("processing");
            statusText.innerHTML = '<span class="voice-indicator animate-pulse"></span>Processando...';
            if (subtitle) subtitle.textContent = "Conferindo o que voce disse e preparando a resposta.";
            if (voiceStartBtn) voiceStartBtn.classList.add("active");
            break;
        case "waiting":
            statusEl.classList.add("waiting");
            statusText.innerHTML = '<span class="voice-indicator"></span>Preparando audio';
            if (aiResponseText) aiResponseText.innerHTML = "<p>Calibrando o ambiente de voz.</p>";
            if (voiceStartBtn) voiceStartBtn.classList.add("active");
            break;
        case "error":
            statusEl.classList.add("error");
            statusText.innerHTML = '<span class="voice-indicator speaking"></span>Falha temporaria';
            if (aiResponseText) aiResponseText.innerHTML = "<p>Conexao instavel neste ciclo.</p>";
            if (subtitle) subtitle.textContent = "Aguarde um instante e tente novamente.";
            if (voiceStartBtn) voiceStartBtn.classList.remove("active");
            break;
        case "stopped":
            statusText.innerHTML = '<span class="voice-indicator"></span>Sessão finalizada';
            if (aiResponseText) aiResponseText.innerHTML = "<p>Sessão encerrada. Revise seu recap e comece novamente quando quiser.</p>";
            if (subtitle) subtitle.textContent = "Fluxo concluído com sucesso.";
            if (voiceStartBtn) voiceStartBtn.classList.remove("active");
            break;
        default:
            statusText.innerHTML = '<span class="voice-indicator"></span>Pronto';
            if (aiResponseText) aiResponseText.innerHTML = "<p>Modo de voz em espera. Inicie quando quiser.</p>";
            if (subtitle) subtitle.textContent = "Foco total na fala: voz, feedback e progresso.";
            if (voiceStartBtn) voiceStartBtn.classList.remove("active");
    }
}

// ==================== PULSING ANIMATION ====================

let pulsingAnimationId = null;
const PULSE_MIN = 0.3;
const PULSE_MAX = 1;

function startPulsingAnimation() {
    const modal = document.getElementById("voiceDimensionOrb");
    if (!modal) return;
    
    // Create smooth blue gradient animation that pulses
    let pulseScale = PULSE_MIN;
    let direction = 1; // 1 = increase, -1 = decrease
    const step = 0.02;
    
    function pulse() {
        pulseScale += direction * step;
        
        if (pulseScale >= PULSE_MAX) {
            pulseScale = PULSE_MAX;
            direction = -1;
        } else if (pulseScale <= PULSE_MIN) {
            pulseScale = PULSE_MIN;
            direction = 1;
        }
        
        const glowSize = 46 + pulseScale * 38;
        const glowOpacity = 0.26 + pulseScale * 0.28;
        const depthShadow = 56 + pulseScale * 20;

        modal.style.boxShadow = `
            inset -6px -8px 16px rgba(5, 10, 26, 0.4),
            inset 5px 6px 14px rgba(255, 255, 255, 0.24),
            0 0 ${glowSize}px rgba(170, 194, 255, ${glowOpacity}),
            0 24px ${depthShadow}px rgba(4, 11, 28, 0.56)
        `;
        modal.style.filter = `saturate(${1 + pulseScale * 0.25})`;
        
        if (voiceChatActive) {
            pulsingAnimationId = requestAnimationFrame(pulse);
        }
    }
    
    pulsingAnimationId = requestAnimationFrame(pulse);
}

function stopPulsingAnimation() {
    if (pulsingAnimationId) {
        cancelAnimationFrame(pulsingAnimationId);
        pulsingAnimationId = null;
    }
    
    // Reset dynamic visual overrides
    const modal = document.getElementById("voiceDimensionOrb");
    if (modal) {
        modal.style.boxShadow = "";
        modal.style.filter = "";
    }
    
    // Clear AI response when stopping
    currentAIResponse = "";
}

// ==================== SESSION RECAP ====================

function _buildLocalVoiceRecap(durationSeconds) {
    const duration = Math.max(0, Number(durationSeconds) || 0);
    const sessionAnalytics = _summarizeVoiceSessionAnalytics(duration);
    const exchanges = Math.max(1, Math.floor(conversationHistoryVoice.length / 2));
    const qualityFromDuration = Math.min(38, Math.floor(duration / 12));
    const qualityFromExchanges = Math.min(40, exchanges * 7);
    const penaltyFromErrors = Math.min(18, _liveErrorCount * 2);
    const qualityScore = Math.max(40, Math.min(92, 52 + qualityFromDuration + qualityFromExchanges - penaltyFromErrors));

    return {
        duration_seconds: duration,
        exchanges,
        quality_score: qualityScore,
        highlights: [
            sessionAnalytics.en_turns
                ? `Você sustentou ${sessionAnalytics.en_turns} resposta(s) em inglês na sessão.`
                : "Você concluiu a sessão de voz e manteve prática ativa.",
            sessionAnalytics.pt_turns
                ? `${sessionAnalytics.pt_turns} resposta(s) passaram pela ponte em português antes da continuidade em inglês.`
                : "Seu progresso já foi registrado para continuidade do desafio."
        ],
        corrections: (_voiceSessionAnalytics.corrections || []).slice(-3).reverse().map((item) => ({
            wrong: item.wrong,
            correct: item.correct,
            tip: item.tip,
        })),
        study_suggestion: sessionAnalytics.top_error_types.length
            ? `Faça uma nova sessão curta focando em ${sessionAnalytics.top_error_types[0].label.toLowerCase()}.`
            : "Faça uma nova sessão curta em seguida para consolidar o que acabou de praticar.",
        radar: {},
        session_analytics: sessionAnalytics,
    };
}

async function showVoiceRecap(durationSeconds) {
    const modal = document.getElementById("voiceRecapModal");
    if (!modal) return;

    const loadingSection = document.getElementById("recapLoading");
    const contentSection = document.getElementById("recapContent");
    // API_BASE_URL is defined globally in utils.js
    const recapToken = window.authToken || localStorage.getItem("grilo_token");

    if (loadingSection) loadingSection.style.display = "flex";
    if (contentSection) contentSection.style.display = "none";
    modal.classList.add("active");

    if (!recapToken) {
        renderVoiceRecap(_buildLocalVoiceRecap(durationSeconds));
        return;
    }

    try {
        const resp = await fetch(`${API_BASE_URL}/api/voice/recap`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${recapToken}`
            },
            body: JSON.stringify({
                history: conversationHistoryVoice,
                duration_seconds: durationSeconds,
                turn_analytics: (_voiceSessionAnalytics.turns || []).map((turn) => ({
                    turn_index: turn.turnIndex,
                    source: turn.source,
                    heard_text: turn.heardText,
                    final_text: turn.finalText,
                    language: turn.language,
                    stt_confidence: turn.sttConfidence,
                    used_bridge: turn.usedBridge,
                    had_correction: turn.hadCorrection,
                    correction_type: turn.correctionType,
                    correction: turn.correction,
                    ai_response: turn.aiResponse,
                    translation_pt: turn.translationPt,
                    recognition_latency_ms: turn.recognitionLatencyMs,
                    api_latency_ms: turn.apiLatencyMs,
                    help_mode: turn.helpMode,
                })),
                help_summary: { ..._voiceSessionAnalytics.help },
            }),
            signal: AbortSignal.timeout(20000)
        });
        if (resp.status === 401) {
            _handleVoiceUnauthorized("voice-recap");
            return;
        }
        if (!resp.ok) throw new Error(`Recap API returned ${resp.status}`);
        const data = await resp.json();
        renderVoiceRecap({ ...data, duration_seconds: durationSeconds });
    } catch (err) {
        console.error("[VOICE-RECAP] Failed:", err);
        renderVoiceRecap(_buildLocalVoiceRecap(durationSeconds));
    }
}

function renderVoiceRecap(data) {
    const loadingSection = document.getElementById("recapLoading");
    const contentSection = document.getElementById("recapContent");
    if (!contentSection) return;

    const duration = data.duration_seconds || 0;
    const minutes  = Math.floor(duration / 60);
    const secs     = duration % 60;
    const durationLabel = minutes > 0 ? `${minutes}m ${secs}s` : `${duration}s`;

    const corrections  = (data.corrections || []).slice(0, 3);
    const highlights   = (data.highlights || []).slice(0, 3);
    const exchanges    = data.exchanges    || 0;
    const qualityScore = data.quality_score ?? 50;
    const radarObj     = data.radar || {};
    const analytics = data.session_analytics || _summarizeVoiceSessionAnalytics(duration);
    const stats = window._lastUserStats || {};
    const challengeDays = stats.challenge_days_completed || 0;
    const challengePct = Math.max(0, Math.min(100, stats.challenge_completion_percent || 0));
    const unlockedModes = Array.isArray(stats.voice_modes_unlocked) && stats.voice_modes_unlocked.length
        ? stats.voice_modes_unlocked.map(_modeLabelPt)
        : ["Guiado"];

    let grade = "Em construção";
    if (qualityScore >= 85) grade = "Excelente sessão";
    else if (qualityScore >= 70) grade = "Sessão sólida";
    else if (qualityScore >= 55) grade = "Boa base";

    const nextUnlockLine = stats.next_mode_unlock
        ? `Próximo desbloqueio: ${_escapeHtml(_modeLabelPt(stats.next_mode_unlock.mode))} · ${_escapeHtml(stats.next_mode_unlock.requires || "")}`
        : "Todos os modos já estão liberados.";

    const qualityBar = Math.max(6, Math.min(100, qualityScore));

    // ======== VOCABULARY SNAPSHOT ========
    const vocabSnap = data.vocabulary_snapshot || null;
    const vocabSectionHTML = vocabSnap ? `
        <section class="recap-v4-card recap-vocab-card">
            <h3 class="recap-v4-card-title">Vocabulário desta sessão</h3>
            <div class="recap-vocab-chips">
                <div class="recap-vocab-chip">
                    <span class="recap-vocab-chip-value">${vocabSnap.new_words_count || 0}</span>
                    <span class="recap-vocab-chip-label">Palavras únicas</span>
                </div>
                <div class="recap-vocab-chip">
                    <span class="recap-vocab-chip-value">${vocabSnap.mastered_this_session || 0}</span>
                    <span class="recap-vocab-chip-label">Dominadas</span>
                </div>
                <div class="recap-vocab-chip">
                    <span class="recap-vocab-chip-value">${Math.round((vocabSnap.avg_word_accuracy || 0) * 100)}%</span>
                    <span class="recap-vocab-chip-label">Precisão média</span>
                </div>
            </div>
            ${vocabSnap.top_words && vocabSnap.top_words.length ? `
            <div class="recap-vocab-list">
                ${vocabSnap.top_words.map(w => `
                    <div class="recap-vocab-row">
                        <span class="recap-vocab-word">${_escapeHtml(w.word)}</span>
                        <div class="recap-vocab-bar"><span style="width:${Math.round(w.accuracy * 100)}%;background:${w.accuracy >= 0.85 ? '#16a34a' : w.accuracy >= 0.6 ? '#d97706' : '#dc2626'}"></span></div>
                        <span class="recap-vocab-acc">${Math.round(w.accuracy * 100)}%</span>
                        ${w.was_new ? '<span class="recap-vocab-new">nova</span>' : ''}
                    </div>`).join('')}
            </div>` : ''}
        </section>
    ` : '';

    const strengthsHTML = highlights.length
        ? highlights.map(h => `<li>${_escapeHtml(h)}</li>`).join("")
        : `<li>Você manteve consistência na prática hoje.</li>`;

    const correctionsHTML = corrections.length
        ? corrections.map((c) => `
            <div class="recap-v4-fix-item">
                <div class="recap-v4-fix-line">
                    ${c.wrong ? `<span class="recap-v4-fix-wrong">${_escapeHtml(c.wrong)}</span>` : ""}
                    ${c.wrong ? '<span class="recap-v4-fix-arrow">→</span>' : ""}
                    <span class="recap-v4-fix-correct">${_escapeHtml(c.correct || "")}</span>
                </div>
                ${c.tip ? `<p class="recap-v4-fix-tip">${_escapeHtml(c.tip)}</p>` : ""}
                ${c.correct ? `<button class="recap-v4-mini-btn" onclick="window.playPracticePhrase(${JSON.stringify(c.correct)})">Ouvir correção</button>` : ""}
            </div>`).join("")
        : `<div class="recap-v4-fix-item"><p class="recap-v4-fix-tip">Sem correções críticas nesta sessão. Continue aumentando o tempo de fala.</p></div>`;

    const radarHTML = Object.keys(radarObj).length >= 5 ? _buildRadarHTML(radarObj) : "";
    const topErrors = (analytics.top_error_types || []).slice(0, 3);
    const topErrorsHTML = topErrors.length
        ? topErrors.map((item) => `
            <div class="recap-breakdown-row">
                <span class="recap-breakdown-label">${_escapeHtml(item.label)}</span>
                <div class="recap-breakdown-bar"><span style="width:${Math.min(100, item.count * 22)}%"></span></div>
                <strong class="recap-breakdown-value">${item.count}</strong>
            </div>
        `).join('')
        : `<p class="recap-soft-note">Nenhum padrão forte de ajuste apareceu nesta sessão.</p>`;

    const languageBreakdownHTML = `
        <div class="recap-language-grid">
            <div class="recap-language-card is-pt">
                <span class="recap-language-k">Respostas em português</span>
                <strong class="recap-language-v">${analytics.pt_turns || 0}</strong>
                <p class="recap-language-note">Usadas para destravar via Ponte quando necessário.</p>
            </div>
            <div class="recap-language-card is-en">
                <span class="recap-language-k">Respostas em inglês</span>
                <strong class="recap-language-v">${analytics.en_turns || 0}</strong>
                <p class="recap-language-note">${analytics.english_turns_without_correction || 0} vieram sem ajuste detectado.</p>
            </div>
            <div class="recap-language-card">
                <span class="recap-language-k">Precisão em inglês</span>
                <strong class="recap-language-v">${Math.round((analytics.english_accuracy_ratio || 0) * 100)}%</strong>
                <p class="recap-language-note">Baseado nas respostas em inglês sem correção estruturada.</p>
            </div>
        </div>
    `;

    const realtimeStatsHTML = `
        <div class="recap-analytics-grid">
            <div class="recap-analytics-card">
                <span class="recap-analytics-k">Trocas reais</span>
                <strong class="recap-analytics-v">${analytics.turns_total || exchanges}</strong>
            </div>
            <div class="recap-analytics-card">
                <span class="recap-analytics-k">Média por resposta</span>
                <strong class="recap-analytics-v">${analytics.avg_words_per_turn || 0} palavras</strong>
            </div>
            <div class="recap-analytics-card">
                <span class="recap-analytics-k">Ponte usada</span>
                <strong class="recap-analytics-v">${analytics.bridge_turns || 0} vez(es)</strong>
            </div>
            <div class="recap-analytics-card">
                <span class="recap-analytics-k">Ajuda aberta</span>
                <strong class="recap-analytics-v">${analytics.help?.panel_opens || 0} vez(es)</strong>
            </div>
            <div class="recap-analytics-card">
                <span class="recap-analytics-k">Sugestões usadas</span>
                <strong class="recap-analytics-v">${analytics.help?.suggestion_uses || 0}</strong>
            </div>
            <div class="recap-analytics-card">
                <span class="recap-analytics-k">Pronúncias ouvidas</span>
                <strong class="recap-analytics-v">${analytics.help?.pronunciation_plays || 0}</strong>
            </div>
        </div>
    `;

    const coachingHTML = analytics.latest_correction && analytics.latest_correction.correct
        ? `
            <section class="recap-v4-card recap-focus-card">
                <h3 class="recap-v4-card-title">Ajuste mais recente</h3>
                <div class="recap-v4-fix-item">
                    <div class="recap-v4-fix-line">
                        ${analytics.latest_correction.wrong ? `<span class="recap-v4-fix-wrong">${_escapeHtml(analytics.latest_correction.wrong)}</span><span class="recap-v4-fix-arrow">→</span>` : ''}
                        <span class="recap-v4-fix-correct">${_escapeHtml(analytics.latest_correction.correct)}</span>
                    </div>
                    ${analytics.latest_correction.tip ? `<p class="recap-v4-fix-tip">${_escapeHtml(analytics.latest_correction.tip)}</p>` : ''}
                </div>
            </section>
        `
        : '';

    const safeLabel = durationLabel.replace(/'/g, "\\'");
    const shareHTML = `<button class="recap-v4-share" onclick="_openShareCard(${qualityScore}, ${exchanges}, '${safeLabel}')">Compartilhar resultado</button>`;

    contentSection.innerHTML = `
        <div class="recap-v4-shell">
            <div class="recap-v4-head">
                <span class="recap-v4-kicker">Voice Session Report</span>
                <h2 class="recap-v4-title">Sessão concluída</h2>
                <p class="recap-v4-subtitle">${_escapeHtml(grade)} · ${challengeDays}/7 dias no desafio</p>
                <span id="recapSparklinePlaceholder"></span>
            </div>
            <div class="recap-v4-journey">
                <p class="recap-v4-stage">${_voiceJourneyStageText(challengeDays)}</p>
                <div class="recap-v4-journey-track"><span style="width:${challengePct}%"></span></div>
                <p class="recap-v4-journey-meta" id="recapPerfNote">Carregando comparação com sessões anteriores...</p>
            </div>
            <div class="recap-v4-metrics">
                <div class="recap-v4-metric"><span class="recap-v4-metric-v">${qualityScore}</span><span class="recap-v4-metric-k">Qualidade</span></div>
                <div class="recap-v4-metric"><span class="recap-v4-metric-v">${exchanges}</span><span class="recap-v4-metric-k">Trocas</span></div>
                <div class="recap-v4-metric"><span class="recap-v4-metric-v">${durationLabel}</span><span class="recap-v4-metric-k">Duração</span></div>
            </div>
            <div class="recap-v4-quality-track"><span style="width:${qualityBar}%"></span></div>
            ${realtimeStatsHTML}
            ${languageBreakdownHTML}
            ${vocabSectionHTML}
            <div class="recap-v4-grid">
                <section class="recap-v4-card">
                    <h3 class="recap-v4-card-title">Pontos fortes</h3>
                    <ul class="recap-v4-list">${strengthsHTML}</ul>
                </section>
                <section class="recap-v4-card">
                    <h3 class="recap-v4-card-title">Ajustes recomendados</h3>
                    <div class="recap-v4-fix-list">${correctionsHTML}</div>
                </section>
            </div>
            <section class="recap-v4-card recap-breakdown-card">
                <h3 class="recap-v4-card-title">Padrões detectados na sessão</h3>
                ${topErrorsHTML}
            </section>
            ${coachingHTML}
            ${radarHTML}
            <section class="recap-v4-plan">
                <h3 class="recap-v4-card-title">Próxima missão</h3>
                <p>${_escapeHtml(data.study_suggestion || "Mantenha o ritmo com uma nova sessão curta amanhã.")}</p>
                ${data.next_topic ? `<p><strong>Foco sugerido:</strong> ${_escapeHtml(data.next_topic)}</p>` : ""}
                <p>${nextUnlockLine}</p>
                <p><strong>Modos ativos:</strong> ${_escapeHtml(unlockedModes.join(" · "))}</p>
            </section>
            <div class="recap-v4-actions">
                <button class="recap-v4-primary" onclick="closeVoiceRecap()">Nova sessão agora</button>
                <button class="recap-v4-secondary" onclick="closeVoiceRecap()">Fechar resumo</button>
            </div>
            ${shareHTML}
        </div>
    `;

    if (loadingSection) loadingSection.style.display = "none";
    contentSection.style.display = "block";

    // Async: fetch history from backend, update performance note and sparkline
    _fetchSessionHistory().then(history => {
        const perfComp   = _getPerformanceComparison(history, qualityScore);
        const sparkline  = _buildSparklineHTML(history);

        const perfNote = document.getElementById('recapPerfNote');
        if (perfNote) {
            perfNote.textContent = perfComp.label || "Continue comparando suas sessões para medir evolução.";
        }

        const sparklinePlaceholder = document.getElementById('recapSparklinePlaceholder');
        if (sparklinePlaceholder && sparkline) {
            sparklinePlaceholder.outerHTML = sparkline;
        } else if (sparklinePlaceholder) {
            sparklinePlaceholder.remove();
        }
    });
}

window.closeVoiceRecap = function () {
    const modal = document.getElementById("voiceRecapModal");
    if (modal) modal.classList.remove("active");
};

// ==================== SHARE CARD ====================

window._openShareCard = function(qualityScore, exchanges, durationLabel) {
    const existing = document.getElementById('shareCardOverlay');
    if (existing) existing.remove();

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

    const overlay = document.createElement('div');
    overlay.id = 'shareCardOverlay';
    overlay.className = 'share-card-overlay';
    overlay.innerHTML = `
        <div class="share-card">
            <div class="share-card-logo">GRILO · VOICE</div>
            <div class="share-card-score">${qualityScore}</div>
            <div class="share-card-score-label">QUALIDADE DA SESSÃO</div>
            <div class="share-card-stats">
                <div>
                    <span class="share-card-stat-val">${exchanges}</span>
                    <span class="share-card-stat-label">Trocas</span>
                </div>
                <div>
                    <span class="share-card-stat-val">${durationLabel}</span>
                    <span class="share-card-stat-label">Duração</span>
                </div>
            </div>
            <div class="share-card-date">${dateStr}</div>
        </div>
        <div class="share-actions">
            <button class="share-copy-btn" onclick="_copyShareText(${qualityScore}, ${exchanges}, '${durationLabel.replace(/'/g, "\\'")}')">COPIAR TEXTO</button>
            <button class="share-close-btn" onclick="document.getElementById('shareCardOverlay').remove()">FECHAR</button>
        </div>`;
    document.body.appendChild(overlay);
};

window._copyShareText = function(score, exchanges, duration) {
    const text = `Grilo Voice · Sessão de hoje\n📊 Qualidade: ${score}/100\n💬 ${exchanges} trocas · ${duration}\n\nPraticando inglês com IA todos os dias.`;
    navigator.clipboard.writeText(text)
        .then(() => showVoiceToast('Texto copiado!'))
        .catch(() => showVoiceToast('Não foi possível copiar.'));
};


// ==================== SHADOW MODE ====================

function showShadowPrompt(originalPhrase) {
    // Delegado para a versão pedagógica se em help mode
    if (_voiceHelpMode) {
        _showShadowPromptPedagogico(originalPhrase, { mode: "help_suggestion" });
    } else {
        _showShadowPromptNonPedagogico(originalPhrase);
    }
}

function _showShadowPromptNonPedagogico(originalPhrase) {
    const overlay = document.getElementById("shadowScoreOverlay");
    const promptEl = document.getElementById("shadowPromptText");
    const scoreEl = document.getElementById("shadowScoreDisplay");
    const barEl = document.getElementById("shadowScoreBar");
    const retryBtn = document.getElementById("shadowRetryBtn");
    const nextBtn = document.getElementById("shadowNextBtn");
    const helpContext = document.getElementById("shadowHelpContext");

    if (!overlay) return;

    // Reset
    if (scoreEl) { scoreEl.textContent = ""; scoreEl.className = "shadow-score-value"; }
    if (barEl) barEl.style.width = "0%";
    if (promptEl) promptEl.textContent = `Repita: "${originalPhrase}"`;
    if (retryBtn) retryBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    if (helpContext) helpContext.style.display = "none";

    overlay.classList.add("active");

    // Start listening for the repetition
    const tempRecognizer = new SpeechRecognition();
    tempRecognizer.lang = "en-US";
    tempRecognizer.continuous = false;
    tempRecognizer.interimResults = false;

    tempRecognizer.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const score = computeSimilarityScore(originalPhrase, transcript);
        const pct = Math.round(score * 100);

        if (scoreEl) {
            scoreEl.textContent = `${pct}%`;
            scoreEl.className = "shadow-score-value " + (pct >= 80 ? "score-great" : pct >= 50 ? "score-ok" : "score-low");
        }
        if (barEl) {
            barEl.style.width = pct + "%";
            barEl.style.background = pct >= 80 ? "var(--accent-success)" : pct >= 50 ? "var(--accent-warm)" : "var(--accent-danger)";
        }
        if (promptEl) {
            const label = pct >= 80 ? "Excelente!" : pct >= 50 ? "Quase lá! Tente mais uma vez." : "Continue praticando!";
            promptEl.textContent = label;
        }
        if (retryBtn) retryBtn.style.display = "inline-flex";
        if (nextBtn) nextBtn.style.display = "inline-flex";
    };

    tempRecognizer.onerror = () => {
        if (retryBtn) retryBtn.style.display = "inline-flex";
        if (nextBtn) nextBtn.style.display = "inline-flex";
    };

    tempRecognizer.start();
    updateVoiceModalStatus("listening");
}

function computeSimilarityScore(a, b) {
    const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    const na = norm(a), nb = norm(b);
    if (!na || !nb) return 0;
    // Simple character-level SequenceMatcher equivalent
    const longer = na.length > nb.length ? na : nb;
    const shorter = na.length > nb.length ? nb : na;
    let matches = 0;
    let i = 0, j = 0;
    while (i < shorter.length && j < longer.length) {
        if (shorter[i] === longer[j]) { matches++; i++; j++; }
        else { j++; }
    }
    return matches / longer.length;
}

window.closeShadowOverlay = function() {
    const overlay = document.getElementById("shadowScoreOverlay");
    if (overlay) overlay.classList.remove("active");
    shadowPhraseTarget = null;
    if (voiceChatActive) startVoiceListening();
};

window.retryShadow = function() {
    if (shadowPhraseTarget) showShadowPrompt(shadowPhraseTarget);
};

// ==================== DICTATION MODE ====================

function showDictationPrompt(originalPhrase) {
    const container = document.getElementById("dictationContainer");
    const input = document.getElementById("dictationInput");
    const feedback = document.getElementById("dictationFeedback");
    if (!container) return;

    dictationPhraseTarget = originalPhrase;
    container.classList.add("active");
    if (input) { input.value = ""; input.focus(); }
    if (feedback) { feedback.innerHTML = ""; feedback.style.display = "none"; }
}

window.submitDictation = function() {
    const input = document.getElementById("dictationInput");
    const feedback = document.getElementById("dictationFeedback");
    if (!input || !dictationPhraseTarget) return;

    const userText = input.value.trim();
    if (!userText) return;

    const targetWords = dictationPhraseTarget.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/);
    const userWords = userText.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/);

    let html = "";
    for (let i = 0; i < targetWords.length; i++) {
        const target = targetWords[i];
        const user = userWords[i] || "";
        let cls = "dict-word-missing";
        if (user === target) cls = "dict-word-correct";
        else if (user && computeSimilarityScore(user, target) >= 0.7) cls = "dict-word-close";
        else if (user) cls = "dict-word-wrong";
        html += `<span class="${cls}" title="${user || "(missing)"}">${target}</span> `;
    }

    if (feedback) {
        feedback.innerHTML = html;
        feedback.style.display = "block";
    }
};

window.closeDictation = function() {
    const container = document.getElementById("dictationContainer");
    if (container) container.classList.remove("active");
    dictationPhraseTarget = null;
    if (voiceChatActive) startVoiceListening();
};

function showVoiceToast(msg) {
    let toast = document.getElementById("voiceToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "voiceToast";
        toast.className = "voice-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
}

// ==================== LEVEL MAP ====================
// Maps user.level integer (1-6) to CEFR code sent to the backend
const LEVEL_MAP = { 1: "a1", 2: "a2", 3: "b1", 4: "b2", 5: "c1", 6: "c2" };
// Called by chat-text-controller.js after it loads the user profile
window.setUserVoiceLevel = function(levelInt) {
    window.userLevel = levelInt;
    window.userVoiceLevel = LEVEL_MAP[levelInt] || "b1";
    // Auto-enable bilingual for A1/A2 users
    if (levelInt <= 2) bilingualMode = true;
};


// Export functions (for use in chat-text-controller.js)
window.SpeechHandler = {
    init: initSpeech,
    startListening,
    stopListening,
    speakResponse,
    speakAIResponse,
    detectLanguage,
    startVoiceChat,
    stopVoiceChat,
    isListening: () => isListening,
    getCurrentLanguage: () => currentLanguage,
    setLanguage: (lang) => {
        currentLanguage = lang;
        if (recognizer) recognizer.lang = lang;
        if (voiceModalRecognizer) voiceModalRecognizer.lang = lang;
    }
};

console.log("✅ [VOICE-CONTROLLER] Script fully loaded! All functions available.");

document.addEventListener("DOMContentLoaded", () => {
    _syncVoiceBridgeUi();
});

// Called from chat-text-controller.js to speak the AI response
async function speakAIResponse(responseText) {
    // Determine language based on response content
    const responseLang = detectLanguage(responseText);
    
    // Speak with detected language
    await speakResponse(responseText, responseLang);
}

// ==================== ECHO DETECTION ====================

// ==================== IMPROVED ECHO DETECTION ====================
// Detects when microphone captures AI's own voice output (speaker scenarios)

function isSimilarText(text1, text2) {
    if (!text1 || !text2) return false;
    
    // Compare full text, not just first 5 words - captures real echoes better
    const similarity = calculateSimilarity(text1.toLowerCase(), text2.toLowerCase());
    
    // Higher threshold (75%) to reduce false positives
    const isEcho = similarity > 0.75;
    
    // Log with helpful debugging
    const similarity_pct = (similarity * 100).toFixed(1);
    console.log(`📊 Echo check: ${similarity_pct}% similar (${isEcho ? '🔇 BLOCKED' : '✅ INPUT'})`);
    
    return isEcho;
}

function calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = getEditDistance(longer, shorter);
    
    return (longer.length - editDistance) / longer.length;
}

function getEditDistance(s1, s2) {
    // Proper Levenshtein distance algorithm (corrected implementation)
    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(0));
    
    // Initialize first row and column
    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
    
    // Calculate distances
    for (let j = 1; j <= s2.length; j++) {
        for (let i = 1; i <= s1.length; i++) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }
    
    return matrix[s2.length][s1.length];
}

console.log("✅ Speech Handler initialized");


// ============================================================
// Voice Recognition Quality Indicator (GriloVR integration)
// ============================================================
// Mostra ao usuário, em tempo real, se o STT está conseguindo ouvir bem.
// Lê o módulo window.GriloVR (se carregado) para classificar confidence.
// ============================================================

let _voiceConfidenceMonitor = null;

function _updateVoiceConfidenceIndicator(confidence) {
    if (!confidence && confidence !== 0) return;
    const wrap = _ensureVoiceConfidenceWrap();
    if (!wrap) return;
    const fill = wrap.querySelector('.gvc-fill');
    const lbl  = wrap.querySelector('.gvc-label');
    const dot  = wrap.querySelector('.gvc-dot');

    const pct = Math.round(confidence * 100);
    fill.style.width = pct + '%';

    let bucket = 'partial';
    if (window.GriloVR && typeof window.GriloVR.confidenceLabel === 'function') {
        bucket = window.GriloVR.confidenceLabel(confidence);
    } else {
        bucket = confidence >= 0.55 ? 'clear' : (confidence >= 0.25 ? 'partial' : 'inaudible');
    }

    dot.className = 'gvc-dot ' + bucket;
    fill.className = 'gvc-fill ' + bucket;
    const labels = {
        clear:     'Áudio claro',
        partial:   'Áudio parcial',
        inaudible: 'Áudio confuso',
    };
    lbl.textContent = `${labels[bucket]} · ${pct}%`;

    wrap.classList.add('is-active');
    clearTimeout(_voiceConfidenceMonitor);
    _voiceConfidenceMonitor = setTimeout(() => wrap.classList.remove('is-active'), 4000);
}

function _ensureVoiceConfidenceWrap() {
    let wrap = document.getElementById('gvcVoiceConfidence');
    if (wrap) return wrap;

    // Estilo inline (evita depender de CSS externo)
    if (!document.getElementById('gvcVoiceConfidenceStyles')) {
        const tag = document.createElement('style');
        tag.id = 'gvcVoiceConfidenceStyles';
        tag.textContent = `
#gvcVoiceConfidence {
    position: fixed; bottom: 20px; left: 20px;
    display: flex; align-items: center; gap: 10px;
    padding: 8px 14px;
    background: rgba(255,255,255,0.95);
    border: 1px solid rgba(15,15,15,0.10);
    border-radius: 999px;
    box-shadow: 0 6px 18px rgba(15,15,15,0.10);
    font-family: 'Manrope', system-ui, sans-serif;
    font-size: 0.78rem;
    z-index: 5000;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.25s ease, transform 0.25s ease;
    pointer-events: none;
}
#gvcVoiceConfidence.is-active { opacity: 1; transform: translateY(0); }
.gvc-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.gvc-dot.clear     { background: #228b5a; }
.gvc-dot.partial   { background: #f59e0b; }
.gvc-dot.inaudible { background: #c44a2c; animation: gvcPulse 0.9s ease infinite; }
@keyframes gvcPulse { 50% { transform: scale(1.4); opacity: 0.6; } }
.gvc-bar {
    width: 80px; height: 6px;
    background: rgba(15,15,15,0.06);
    border-radius: 999px; overflow: hidden;
}
.gvc-fill {
    display: block; height: 100%; width: 0;
    background: #f59e0b;
    border-radius: 999px;
    transition: width 0.25s ease, background 0.25s ease;
}
.gvc-fill.clear     { background: linear-gradient(90deg, #228b5a, #65b88a); }
.gvc-fill.partial   { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.gvc-fill.inaudible { background: linear-gradient(90deg, #c44a2c, #e88a3c); }
.gvc-label { color: #1c1c1c; font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums; }
`;
        document.head.appendChild(tag);
    }

    wrap = document.createElement('div');
    wrap.id = 'gvcVoiceConfidence';
    wrap.innerHTML = `
        <span class="gvc-dot partial"></span>
        <span class="gvc-bar"><span class="gvc-fill partial"></span></span>
        <span class="gvc-label">Aguardando voz…</span>
    `;
    document.body.appendChild(wrap);
    return wrap;
}

// Expor para debug
window._updateVoiceConfidenceIndicator = _updateVoiceConfidenceIndicator;
