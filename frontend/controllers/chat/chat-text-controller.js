// Global state
let currentUser = null;
let authToken = null;
let currentLanguage = "pt-BR";
let writingConversationHistory = [];    // Writing chat (/api/chat/write) — kept separate to avoid context pollution
let writingFocusArea = null;            // Last detected grammar focus area (sent to backend for pedagogical continuity)
let writingConversationTheme = null;    // Detected conversation theme (travel, food, work, etc)
let writingMessageCount = 0;            // Message count in current session (for micro-lesson trigger)
let conversationHistoryVoice = [];
let writtenSessions = [];
let voiceSessions = [];
let currentWrittenSessionId = null;
let currentVoiceSessionId = null;

// Session tracking for summary
let sessionStartTime = null;            // ISO string: when current session started
let sessionVocabulary = [];            // Vocabulary collected in this session

// API_BASE_URL is defined globally in utils.js (getApiBaseUrl function)
const WRITING_WELCOME_MESSAGE = "Hello! 👋 I'm GRILO, your writing coach. Type anything in English and I'll respond naturally with grammar and vocabulary feedback. Let's practice!";
const INLINE_TRANSLATION_TIMEOUT_MS = 4500;
const INLINE_TRANSLATION_RETRIES = 2;
const ROMANCE_BACKEND_LANGS = new Set(['es', 'fr', 'it', 'ca', 'gl', 'ro']);
const PT_DETECTION_WORDS = new Set([
    "oi", "ola", "olá", "tudo", "bem", "voce", "você", "voces", "vocês", "nao", "não", "sim", "isso",
    "porque", "por", "para", "pra", "obrigado", "obrigada", "tambem", "também", "entao", "então", "mas",
    "este", "esta", "aqui", "agora", "fazer", "quero", "preciso", "gostaria", "tenho", "estou", "sou",
    "vou", "fiz", "disse", "aprendi", "ingles", "inglês", "portugues", "português", "como", "posso",
    "praticar", "aprendendo", "ajuda", "meu", "minha", "seu", "sua", "hoje", "amanha", "amanhã",
    "sobre", "comida", "comidas", "assunto", "tema", "falar", "estudar", "estudo", "frase", "texto"
]);
const EN_DETECTION_WORDS = new Set([
    "the", "is", "are", "you", "your", "hello", "thanks", "thank", "please", "how", "can", "practice",
    "english", "what", "when", "where", "why", "this", "that", "my", "i", "me", "we", "they", "to",
    "for", "with", "do", "did", "does", "am", "was", "were", "have", "has", "about", "food", "foods",
    "study", "learn", "topic", "text", "sentence"
]);

let inlineTranslationRequestCounter = 0;
let activeInlineTranslationController = null;

// ==================== AUTH FUNCTIONS ====================

async function handleLogin() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!username || !password) {
        alert("Por favor, digite seu usuário e senha");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.access_token;
            currentUser = data.user;
            
            // Save to localStorage
            localStorage.setItem("grilo_token", authToken);
            localStorage.setItem("grilo_user", JSON.stringify(currentUser));
            
            // Show main content
            showMainContent();
            updateDashboard();
            
            // Initialize buttons
            const chatSendBtn = document.getElementById("chatSendBtnWritten");
            const voiceStartBtn = document.getElementById("voiceStartBtn");
            if (chatSendBtn) chatSendBtn.disabled = false;
            if (voiceStartBtn) voiceStartBtn.disabled = false;
            
            // Clear form
            document.getElementById("loginUsername").value = "";
            document.getElementById("loginPassword").value = "";
            
            // Initialize chat
            initializeChat();
        } else {
            alert("Usuário ou senha inválidos");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Erro ao fazer login");
    }
}

async function handleRegister() {
    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (!username || !email || !password) {
        alert("Por favor, preencha todos os campos");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.access_token;
            currentUser = data.user;
            
            // Save to localStorage
            localStorage.setItem("grilo_token", authToken);
            localStorage.setItem("grilo_user", JSON.stringify(currentUser));
            
            // Show main content
            showMainContent();
            updateDashboard();
            
            // Initialize buttons
            const chatSendBtn = document.getElementById("chatSendBtnWritten");
            const voiceStartBtn = document.getElementById("voiceStartBtn");
            if (chatSendBtn) chatSendBtn.disabled = false;
            if (voiceStartBtn) voiceStartBtn.disabled = false;
            
            // Clear form
            document.getElementById("registerUsername").value = "";
            document.getElementById("registerEmail").value = "";
            document.getElementById("registerPassword").value = "";
            
            // Initialize chat
            initializeChat();
        } else {
            const error = await response.json();
            alert(error.detail || "Erro no cadastro");
        }
    } catch (error) {
        console.error("Register error:", error);
        alert("Erro ao cadastrar");
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    writingConversationHistory = [];
    writingFocusArea = null;
    writingConversationTheme = null;
    writingMessageCount = 0;
    conversationHistoryVoice = [];
    writtenSessions = [];
    voiceSessions = [];
    currentWrittenSessionId = null;
    currentVoiceSessionId = null;

    localStorage.removeItem("grilo_token");
    localStorage.removeItem("grilo_user");
    localStorage.removeItem("grilo_written_sessions");
    localStorage.removeItem("grilo_active_written_session");
    localStorage.removeItem("grilo_voice_sessions");
    localStorage.removeItem("grilo_active_voice_session");
    // Remove legacy keys if still present
    localStorage.removeItem("grilo_chat_history");
    localStorage.removeItem("grilo_voice_history");

    window.location.href = "/";
}

function toggleAuthForm() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    
    loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
    registerForm.style.display = registerForm.style.display === "none" ? "block" : "none";
}

// ==================== UI FUNCTIONS ====================

function showAuthContainer() {
    document.getElementById("authContainer").classList.add("active");
    document.getElementById("mainContent").classList.remove("active");
}

function showMainContent() {
    document.getElementById("authContainer").classList.remove("active");
    document.getElementById("mainContent").classList.add("active");

    // Ensure first tab content is active
    const activeContent = document.querySelector('.tab-content.active');
    if (!activeContent) {
        const firstContent = document.querySelector('.tab-content');
        if (firstContent) firstContent.classList.add('active');
    }

    // Initialize voice handler
    if (window.SpeechHandler && typeof SpeechHandler.init === 'function') {
        SpeechHandler.init();
        console.log("✅ Speech Handler initialized");
    }

    // NOTE: initializeChat() is called by DOMContentLoaded — do NOT call it here to avoid duplication
}

// ==================== CHAT INITIALIZATION ====================

async function initializeChat() {
    // Welcome should be rendered only for empty writing sessions and never pollute history.
    if (writingConversationHistory.length !== 0) {
        return;
    }

    if (!currentWrittenSessionId) {
        const id = generateSessionId();
        writtenSessions.push({ id, title: 'Nova conversa', createdAt: Date.now(), messages: [] });
        currentWrittenSessionId = id;
        persistSessions('written');
        renderSessionList('written');
    }

    renderWritingWelcomeMessage();

    // Pre-populate input from lesson page context
    const lessonCtxRaw = sessionStorage.getItem('grilo_lesson_context');
    if (lessonCtxRaw) {
      try {
        const ctx = JSON.parse(lessonCtxRaw);
        sessionStorage.removeItem('grilo_lesson_context');
        const input = document.getElementById('chatInputWritten');
        if (input && ctx.title) {
          input.value = `Estou estudando a lição "${ctx.title}". Tenho uma dúvida: `;
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
          const sendBtn = document.getElementById('chatSendBtnWritten');
          if (sendBtn) sendBtn.disabled = false;
        }
      } catch (e) {}
    }
}

function renderWritingWelcomeMessage() {
    const chatMessages = document.getElementById('chatMessagesWritten');
    if (!chatMessages) return;
    if (chatMessages.querySelector('.writing-welcome')) return;
    if (chatMessages.querySelector('.chat-message')) return;

    const welcomeElement = addMessageToChat('assistant', WRITING_WELCOME_MESSAGE, null, 'Written');
    if (welcomeElement) {
        welcomeElement.classList.add('writing-welcome');
    }
}

function updateDashboard() {
    if (!currentUser) return;
    
    document.getElementById("usernameDisplay").textContent = currentUser.username;
    document.getElementById("xpDisplay").textContent = currentUser.xp;
    document.getElementById("levelDisplay").textContent = currentUser.level;

    // Propagate level to voice chat system
    if (typeof window.setUserVoiceLevel === "function") {
        window.setUserVoiceLevel(currentUser.level || 1);
    }
    
    // Update XP bar (using XP thresholds matching backend)
    const XP_THRESHOLDS = [0, 200, 600, 1400, 2800, 5000];
    const level = currentUser.level || 1;
    const currentLevelXp = XP_THRESHOLDS[level - 1] || 0;
    const nextLevelXp = XP_THRESHOLDS[level] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
    const xpInLevel = currentUser.xp - currentLevelXp;
    const xpForLevel = nextLevelXp - currentLevelXp;
    const xpPercent = xpForLevel > 0 ? Math.min(100, (xpInLevel / xpForLevel) * 100) : 100;
    const xpBar = document.getElementById("xpBar");
    if (xpBar) xpBar.style.width = xpPercent + "%";
    const xpProgressDisplay = document.getElementById("xpProgressDisplay");
    if (xpProgressDisplay) xpProgressDisplay.textContent = `${xpInLevel} / ${xpForLevel} XP`;
}

// ==================== CHAT FUNCTIONS ====================

// ==================== WRITTEN CHAT (Text-only, no TTS) ====================

/**
 * Map user level (1-6 int) to writing level string
 */
function getUserWritingLevel() {
    const level = currentUser?.level || 1;
    if (level <= 2) return "beginner";
    if (level <= 4) return "intermediate";
    return "advanced";
}

async function sendMessageWritten() {
    const input = document.getElementById("chatInputWritten");
    const message = input.value.trim();
    
    if (!message || !authToken) return;

    // Track session start on first message
    if (!sessionStartTime) {
        sessionStartTime = new Date().toISOString();
    }

    const chatSendBtn = document.getElementById("chatSendBtnWritten");
    if (chatSendBtn) chatSendBtn.disabled = true;
    
    // Prevent multiple concurrent requests
    if (document.body.dataset.waitingForResponse === 'true') {
        if (chatSendBtn) chatSendBtn.disabled = false;
        return;
    }
    document.body.dataset.waitingForResponse = 'true';
    
    try {
        // Portuguese detection is always active regardless of selector.
        const detection = await detectPortugueseText(message);
        if (detection.isPortuguese) {
            await showInlineTranslation(message, input, detection);
            document.body.dataset.waitingForResponse = 'false';
            return;
        }

        clearInlineTranslationBar();

        // Add user message to UI
        addMessageToChat("user", message, null, "Written");
        input.value = "";
        
        // Send message to API - Writing Mode endpoint (with feedback)
        // Filter history to only send role and content (backend schema)
        const cleanHistory = writingConversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        
        const response = await fetch(`${API_BASE_URL}/api/chat/write`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                message: message,
                level: getUserWritingLevel(),
                history: cleanHistory,
                focus_area: writingFocusArea,
                conversation_theme: writingConversationTheme,
                message_count: writingMessageCount
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            const aiReply = data.reply || data.response;
            addMessageToChat("assistant", aiReply, data.translation, "Written");
            
            // Update pedagogical focus area and theme for next request
            if (data.feedback?.focus_area) {
                writingFocusArea = data.feedback.focus_area;
            }
            if (data.conversation_theme) {
                writingConversationTheme = data.conversation_theme;
                updateConversationThemeBadge(data.conversation_theme);
            }
            writingMessageCount++;

            // Collect new vocabulary for session summary
            if (data.new_vocabulary && data.new_vocabulary.length > 0) {
                for (const v of data.new_vocabulary) {
                    const alreadyKnown = sessionVocabulary.some(
                        sv => sv.expression?.toLowerCase() === v.expression?.toLowerCase()
                    );
                    if (!alreadyKnown && v.expression) {
                        sessionVocabulary.push(v);
                    }
                }
            }

            // Show insight panel (replaces old corrections icon)
            const userMessages = document.querySelectorAll('#chatMessagesWritten .message-user');
            const lastUserMessage = userMessages[userMessages.length - 1];
            if (lastUserMessage) {
                if (data.feedback?.corrections?.length > 0) {
                    showInsightPanel(lastUserMessage, data.feedback);
                } else if ((data.feedback?.accuracy_score || 0) >= 80) {
                    addPerfectBadge(lastUserMessage);
                }
            }

            // Update XP from server total (more robust than adding delta)
            if (data.total_xp !== undefined) {
                currentUser.xp = data.total_xp;
            } else {
                currentUser.xp += (data.xp_earned || 0);
            }
            if (data.new_level) currentUser.level = data.new_level;
            updateDashboard();

            // Level-up toast
            if (data.level_up) {
                showLevelUpToast(data.new_level);
            }
            
            // Add to writing-specific history (never mixed with tutor history)
            // Extended schema: include feedback, metadata, and translation for persistence
            const userMsg = {
                role: "user",
                content: message,
                translation: null,
                feedback: null,
                metadata: {
                    timestamp: new Date().toISOString(),
                    vocabulary: [],
                    conversation_theme: writingConversationTheme
                }
            };
            
            const assistantMsg = {
                role: "assistant",
                content: aiReply,
                translation: data.translation || null,
                feedback: data.feedback || null,  // Persist corrections, accuracy_score, focus_area
                metadata: {
                    timestamp: new Date().toISOString(),
                    vocabulary: data.new_vocabulary || [],
                    conversation_theme: data.conversation_theme || writingConversationTheme
                }
            };
            
            writingConversationHistory.push(userMsg);
            writingConversationHistory.push(assistantMsg);

            // Save to current session
            saveCurrentWrittenSession();
        } else {
            console.error("Chat error:", response.status);
            addMessageToChat("assistant", "Sorry, something went wrong. Please try again.", null, "Written");
        }
    } catch (error) {
        console.error("Chat error:", error);
        addMessageToChat("assistant", "Connection error. Please check your connection and try again.", null, "Written");
    } finally {
        document.body.dataset.waitingForResponse = 'false';
        if (chatSendBtn && document.body.contains(chatSendBtn)) {
            chatSendBtn.disabled = false;
        }
        const input = document.getElementById("chatInputWritten");
        if (input) input.focus();
    }
}

/**
 * Detect if text is in Portuguese.
 * Layered strategy: local heuristics first, backend fallback when local confidence is low.
 */
async function detectPortugueseText(text) {
    const localResult = detectPortugueseLocally(text);
    if (localResult.isPortuguese) {
        return { ...localResult, source: 'local' };
    }

    if (!localResult.shouldUseBackend) {
        return { ...localResult, source: 'local' };
    }

    const backendResult = await detectPortugueseViaBackend(text, localResult);
    if (backendResult) {
        return backendResult;
    }

    return { ...localResult, source: 'local-fallback' };
}

function detectPortugueseLocally(text) {
    const raw = (text || '').trim();
    if (!raw) {
        return {
            isPortuguese: false,
            confidence: 'none',
            shouldUseBackend: false,
            ptScore: 0,
            enScore: 0,
            wordCount: 0
        };
    }

    if (raw.length < 4) {
        return {
            isPortuguese: false,
            confidence: 'low',
            shouldUseBackend: true,
            ptScore: 0,
            enScore: 0,
            wordCount: 0
        };
    }

    const ptChars = /[àáâãäèéêëìíîïòóôõöùúûüç]/i;
    if (ptChars.test(raw)) {
        return {
            isPortuguese: true,
            confidence: 'high',
            shouldUseBackend: false,
            ptScore: 5,
            enScore: 0,
            wordCount: raw.split(/\s+/).length
        };
    }

    const normalizedText = normalizeForLanguageDetection(raw);
    const words = normalizedText.match(/[a-z]+/g) || [];
    if (words.length === 0) {
        return {
            isPortuguese: false,
            confidence: 'low',
            shouldUseBackend: false,
            ptScore: 0,
            enScore: 0,
            wordCount: 0
        };
    }

    let ptScore = 0;
    let enScore = 0;

    words.forEach((word) => {
        if (PT_DETECTION_WORDS.has(word)) ptScore += 2;
        if (EN_DETECTION_WORDS.has(word)) enScore += 2;
        if (word.endsWith('cao') || word.endsWith('coes') || word.endsWith('mente')) ptScore += 1;
        if (word.endsWith('ing')) enScore += 1;
    });

    if (ptScore >= 3 && ptScore >= enScore + 1) {
        return {
            isPortuguese: true,
            confidence: 'high',
            shouldUseBackend: false,
            ptScore,
            enScore,
            wordCount: words.length
        };
    }

    if (ptScore >= 2 && enScore === 0) {
        return {
            isPortuguese: true,
            confidence: 'medium',
            shouldUseBackend: false,
            ptScore,
            enScore,
            wordCount: words.length
        };
    }

    if (enScore >= 3 && enScore >= ptScore + 1) {
        return {
            isPortuguese: false,
            confidence: 'high',
            shouldUseBackend: false,
            ptScore,
            enScore,
            wordCount: words.length
        };
    }

    return {
        isPortuguese: false,
        confidence: 'low',
        shouldUseBackend: true,
        ptScore,
        enScore,
        wordCount: words.length
    };
}

function normalizeForLanguageDetection(text) {
    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

async function detectPortugueseViaBackend(text, localResult = null) {
    const token = authToken || localStorage.getItem('grilo_token');
    if (!token) return null;

    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/detect-language/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        }, 2500);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (typeof data.is_portuguese === 'boolean') {
            if (!data.is_portuguese) {
                const backendLang = normalizeLangCode(data.language || data.detected_language || '');
                const confidence = Number(data.confidence || 0);
                const isRomanceFallback = ROMANCE_BACKEND_LANGS.has(backendLang)
                    && (localResult?.enScore || 0) === 0
                    && (localResult?.wordCount || 0) >= 2;
                const isLowConfidenceFallback = confidence > 0
                    && confidence < 0.75
                    && (localResult?.ptScore || 0) >= 2
                    && (localResult?.enScore || 0) === 0;

                if (isRomanceFallback || isLowConfidenceFallback) {
                    return {
                        isPortuguese: true,
                        confidence: 'backend-fallback',
                        source: isRomanceFallback ? `backend-romance-${backendLang}` : 'backend-low-confidence'
                    };
                }
            }

            return {
                isPortuguese: data.is_portuguese,
                confidence: 'backend',
                source: 'backend'
            };
        }

        const normalized = normalizeLangCode(data.language || data.detected_language || '');
        if (normalized === 'pt') {
            return { isPortuguese: true, confidence: 'backend', source: 'backend' };
        }
        if (normalized === 'en') {
            return { isPortuguese: false, confidence: 'backend', source: 'backend' };
        }

        // langdetect can classify short PT snippets as other romance languages (e.g., es).
        if (ROMANCE_BACKEND_LANGS.has(normalized)
            && (localResult?.enScore || 0) === 0
            && (localResult?.wordCount || 0) >= 2) {
            return {
                isPortuguese: true,
                confidence: 'backend-fallback',
                source: `backend-romance-${normalized}`
            };
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.warn('[LANG-DETECT] Backend detection failed:', error);
        }
    }

    return null;
}

function clearInlineTranslationBar() {
    if (activeInlineTranslationController) {
        activeInlineTranslationController.abort();
        activeInlineTranslationController = null;
    }

    const existing = document.querySelector('.inline-translation');
    if (existing) existing.remove();
}

/**
 * Show inline translation bar with Portuguese to English translation
 */
async function showInlineTranslation(portugueseText, inputElement, detection = null) {
    clearInlineTranslationBar();

    const requestId = ++inlineTranslationRequestCounter;
    const requestController = new AbortController();
    activeInlineTranslationController = requestController;
    
    const translationBar = document.createElement('div');
    translationBar.className = 'inline-translation';
    translationBar.dataset.requestId = String(requestId);
    translationBar.dataset.loading = 'false';
    translationBar.dataset.sending = 'false';
    translationBar.innerHTML = `
        <span class="inline-translation-icon">🌐</span>
        <div class="inline-translation-content">
            <span class="inline-translation-label">PT -> EN</span>
            <span class="inline-translation-text">Checking translation...</span>
            <span class="inline-translation-status">Portuguese detected${detection?.source ? ` (${detection.source})` : ''}. Preparing English translation before sending.</span>
        </div>
        <div class="inline-translation-actions">
            <button class="inline-btn-confirm" title="Use translation and send" disabled>Use and send</button>
            <button class="inline-btn-retry" title="Retry translation" hidden>Retry</button>
            <button class="inline-btn-cancel" title="Keep editing">Edit</button>
        </div>
    `;
    
    // Insert inside chat wrapper, before input area
    const chatWrapper = document.querySelector('#chatWrittenTab .chat-wrapper');
    const inputArea = document.querySelector('#chatWrittenTab .chat-input-area');
    if (chatWrapper && inputArea) {
        chatWrapper.insertBefore(translationBar, inputArea);
    }

    const inlineTranslationText = translationBar.querySelector('.inline-translation-text');
    const inlineTranslationStatus = translationBar.querySelector('.inline-translation-status');
    const inlineConfirmBtn = translationBar.querySelector('.inline-btn-confirm');
    const inlineRetryBtn = translationBar.querySelector('.inline-btn-retry');
    const inlineCancelBtn = translationBar.querySelector('.inline-btn-cancel');

    const setLoadingState = () => {
        translationBar.dataset.loading = 'true';
        inlineConfirmBtn.disabled = true;
        inlineRetryBtn.hidden = true;
        inlineTranslationText.textContent = 'Translating to English...';
        inlineTranslationStatus.textContent = 'Please wait. Sending stays blocked until translation is ready.';
    };

    const setSuccessState = (translatedText) => {
        translationBar.dataset.loading = 'false';
        translationBar.setAttribute('data-translated', translatedText);
        inlineTranslationText.textContent = translatedText;
        inlineTranslationStatus.textContent = 'Ready. Use translation and send when you want.';
        inlineConfirmBtn.disabled = false;
        inlineRetryBtn.hidden = true;
    };

    const setErrorState = () => {
        translationBar.dataset.loading = 'false';
        translationBar.setAttribute('data-translated', '');
        inlineTranslationText.textContent = 'We could not translate right now.';
        inlineTranslationStatus.textContent = 'Retry translation to continue in English.';
        inlineConfirmBtn.disabled = true;
        inlineRetryBtn.hidden = false;
    };

    const loadTranslation = async () => {
        setLoadingState();

        try {
            const translated = await requestInlineTranslationWithRetry(portugueseText, {
                signal: requestController.signal
            });

            if (requestId !== inlineTranslationRequestCounter) return;
            setSuccessState(translated || portugueseText);
        } catch (error) {
            if (requestId !== inlineTranslationRequestCounter) return;
            if (error.name === 'AbortError') return;
            console.error('[INLINE_TRANSLATION] Error:', error);
            setErrorState();
        } finally {
            if (requestId === inlineTranslationRequestCounter) {
                activeInlineTranslationController = null;
            }
        }
    };

    inlineConfirmBtn.addEventListener('click', () => {
        if (inlineConfirmBtn.disabled) return;
        if (translationBar.dataset.sending === 'true') return;

        const translatedText = translationBar.getAttribute('data-translated');
        if (!translatedText) return;

        translationBar.dataset.sending = 'true';
        inlineConfirmBtn.disabled = true;
        inlineCancelBtn.disabled = true;

        inputElement.value = translatedText;
        clearInlineTranslationBar();
        sendMessageWritten();
    });

    inlineRetryBtn.addEventListener('click', () => {
        if (translationBar.dataset.loading === 'true') return;
        loadTranslation();
    });

    inlineCancelBtn.addEventListener('click', () => {
        inputElement.value = portugueseText;
        clearInlineTranslationBar();
        inputElement.focus();
    });
    
    await loadTranslation();
}

async function requestInlineTranslationWithRetry(text, options = {}) {
    let lastError = null;

    for (let attempt = 1; attempt <= INLINE_TRANSLATION_RETRIES; attempt += 1) {
        try {
            return await translateTextWithDirection(text, 'pt', 'en', {
                signal: options.signal,
                timeoutMs: INLINE_TRANSLATION_TIMEOUT_MS
            });
        } catch (error) {
            lastError = error;
            if (error.name === 'AbortError') {
                throw error;
            }

            if (attempt === INLINE_TRANSLATION_RETRIES) {
                throw error;
            }
        }
    }

    throw lastError || new Error('Inline translation failed');
}

// ==================== VOICE CHAT (Conversational with TTS) ====================
async function startVoiceChatLegacy() {
    if (!window.SpeechHandler) {
        alert("Speech handler not available");
        return;
    }
    
    console.log('[startVoiceChat] Iniciando chat de voz');
    
    try {
        setVoiceDimensionMode(true);

        // Update button state
        const voiceStartBtn = document.getElementById("voiceStartBtn");
        const voiceStopBtn = document.getElementById("voiceStopBtn");
        const chatVoiceTab = document.getElementById("chatVoiceTab");
        const subtitle = document.getElementById("voiceDimensionSubtitle");
        
        if (voiceStartBtn) {
            voiceStartBtn.style.display = "none";
            voiceStartBtn.classList.add("active");
        }
        if (voiceStopBtn) {
            voiceStopBtn.style.display = "block";
        }
        if (chatVoiceTab) {
            chatVoiceTab.classList.add("voice-active", "voice-live");
        }
        document.body.classList.add("voice-dimension-live");
        if (subtitle) {
            subtitle.textContent = "Ambiente premium ativo. Fale naturalmente e eu acompanho em tempo real.";
        }
        
        console.log('[startVoiceChat] Chamando SpeechHandler.startVoiceChat()');
        await SpeechHandler.startVoiceChat();
        console.log('[startVoiceChat] Chat de voz iniciado com sucesso');
    } catch (error) {
        console.error("Voice chat start error:", error);
        alert("Erro ao iniciar chat de voz");
        
        // Reset buttons on error
        const voiceStartBtn = document.getElementById("voiceStartBtn");
        const voiceStopBtn = document.getElementById("voiceStopBtn");
        const chatVoiceTab = document.getElementById("chatVoiceTab");
        if (voiceStartBtn) voiceStartBtn.style.display = "block";
        if (voiceStopBtn) voiceStopBtn.style.display = "none";
        if (chatVoiceTab) chatVoiceTab.classList.remove("voice-active", "voice-live");
        document.body.classList.remove("voice-dimension-live");
    }
}

async function stopVoiceChatLegacy() {
    if (!window.SpeechHandler) {
        console.warn('[stopVoiceChat] SpeechHandler não disponível');
        return;
    }
    
    console.log('[stopVoiceChat] Parando chat de voz');
    
    try {
        // Hide AI response overlay
        const aiResponseOverlay = document.getElementById("aiResponseOverlay");
        const aiResponseText = document.getElementById("aiResponseText");
        const subtitle = document.getElementById("voiceDimensionSubtitle");
        if (aiResponseOverlay) {
            aiResponseOverlay.classList.remove("active");
        }
        if (aiResponseText) {
            aiResponseText.innerHTML = "<p>Modo premium em espera. Inicie quando quiser.</p>";
        }
        if (subtitle) {
            subtitle.textContent = "Sem distracoes visuais. So sua voz e respostas naturais.";
        }

        // Update button state
        const voiceStartBtn = document.getElementById("voiceStartBtn");
        const voiceStopBtn = document.getElementById("voiceStopBtn");
        const chatVoiceTab = document.getElementById("chatVoiceTab");
        
        if (voiceStartBtn) {
            voiceStartBtn.style.display = "block";
            voiceStartBtn.classList.remove("active", "listening", "speaking");
        }
        if (voiceStopBtn) {
            voiceStopBtn.style.display = "none";
        }
        if (chatVoiceTab) {
            chatVoiceTab.classList.remove("voice-active", "voice-live");
        }
        document.body.classList.remove("voice-dimension-live");
        
        // Reset status
        const voiceStatus = document.getElementById("voiceDimensionStatus");
        if (voiceStatus) {
            const statusText = voiceStatus.querySelector(".voice-status-text") || voiceStatus;
            statusText.innerHTML = '<span class="voice-indicator"></span>🎤 Pressione para falar...';
        }
        
        console.log('[stopVoiceChat] Chamando SpeechHandler.stopVoiceChat()');
        await SpeechHandler.stopVoiceChat();
        console.log('[stopVoiceChat] Chat de voz parado com sucesso');

        if (!chatVoiceTab || !chatVoiceTab.classList.contains("active")) {
            setVoiceDimensionMode(false);
        }
    } catch (error) {
        console.error("Voice chat stop error:", error);
    }
}

async function exitVoiceDimension() {
    await stopVoiceChatLegacy();
    setVoiceDimensionMode(false);
    switchTab('painel');
}

function addMessageToChat(role, message, translation = null, chatType = "Written") {
    const chatContainer = chatType === "Written" ? "chatMessagesWritten" : "chatMessagesVoice";
    const chatMessages = document.getElementById(chatContainer);
    
    // Safety check
    if (!chatMessages) {
        console.warn(`[addMessageToChat] Container ${chatContainer} not found`);
        return;
    }
    
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message message-${role}`;
    
    // Get avatar text based on role
    const avatarText = role === "assistant" ? "🤖" : "👤";
    
    let html = `<div class="message-avatar">${avatarText}</div>`;
    html += `<div class="message-bubble">`;
    html += `<div class="message-main">`;

    // For Voice assistant messages, apply correction highlighting (XSS-safe: escaping is inside the formatter)
    if (role === "assistant" && chatType === "Voice" && window.VoiceFormatting) {
        html += `<div class="message-text">${window.VoiceFormatting.formatVoiceCorrectionMessage(message)}</div>`;
    } else {
        html += `<div class="message-text">${escapeHtml(message)}</div>`;
    }

    html += `<div class="message-meta"></div>`;
    html += `</div>`;
    
    // Only show translation legend if translation is different from the main message
    if (role === "assistant" && translation && translation !== message && chatType === "Written") {
        html += `<div class="message-legend">
            <div class="message-legend-en">${escapeHtml(translation)}</div>
        </div>`;
    }
    
    html += `</div>`;
    messageDiv.innerHTML = html;

    // Assistant responses in writing mode get a subtle translation toggle (EN -> PT-BR)
    if (role === "assistant" && chatType === "Written") {
        addAssistantTranslationToggle(messageDiv, message);
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
}

function addAssistantTranslationToggle(messageElement, originalMessage) {
    if (!messageElement || !originalMessage) return;

    const messageMeta = messageElement.querySelector('.message-meta');
    const messageBubble = messageElement.querySelector('.message-bubble');
    if (!messageMeta || !messageBubble) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'message-tool-btn translation-toggle-btn';
    toggleBtn.innerHTML = `
        <span class="translation-toggle-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m5 8 6 6"></path>
                <path d="m4 14 6-6 2-3"></path>
                <path d="M2 5h12"></path>
                <path d="M7 2h1"></path>
                <path d="m22 22-5-10-5 10"></path>
                <path d="M14 18h6"></path>
            </svg>
        </span>
        <span class="translation-toggle-text">PT</span>
    `;
    toggleBtn.title = 'Traduzir para português';
    toggleBtn.setAttribute('aria-label', 'Traduzir para português');

    toggleBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await toggleMessageTranslationDrawer(toggleBtn, messageBubble, originalMessage);
    });

    messageMeta.appendChild(toggleBtn);
}

function getOrCreateTranslationDrawer(messageBubble) {
    let drawer = messageBubble.querySelector('.message-translation-drawer');
    if (drawer) return drawer;

    drawer = document.createElement('div');
    drawer.className = 'message-translation-drawer';
    drawer.innerHTML = `
        <div class="translation-drawer-content">
            <div class="translation-drawer-label">PT-BR</div>
            <div class="translation-drawer-text"></div>
        </div>
    `;

    messageBubble.appendChild(drawer);
    return drawer;
}

async function toggleMessageTranslationDrawer(toggleBtn, messageBubble, originalMessage) {
    const drawer = getOrCreateTranslationDrawer(messageBubble);
    const drawerText = drawer.querySelector('.translation-drawer-text');
    if (!drawerText) return;

    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
        drawer.classList.remove('open');
        toggleBtn.classList.remove('active');
        toggleBtn.title = 'Traduzir para português';
        return;
    }

    drawer.classList.add('open');
    toggleBtn.classList.add('active');
    toggleBtn.title = 'Ocultar tradução';

    if (drawer.dataset.loaded === 'true' || drawer.dataset.loading === 'true') {
        return;
    }

    drawer.dataset.loading = 'true';
    drawer.classList.add('loading');
    drawerText.textContent = 'Traduzindo para português...';

    try {
        const translatedText = await translateTextWithDirection(originalMessage, 'en', 'pt');
        drawerText.textContent = translatedText || originalMessage;
        drawer.dataset.loaded = 'true';
    } catch (error) {
        console.error('[TRANSLATION_DRAWER] Error:', error);
        drawerText.textContent = 'Nao foi possivel traduzir agora. Tente novamente em instantes.';
    } finally {
        drawer.dataset.loading = 'false';
        drawer.classList.remove('loading');
    }
}

async function translateTextWithDirection(text, fromLang = 'en', toLang = 'pt', options = {}) {
    const token = authToken || localStorage.getItem('grilo_token');

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/translate/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            text,
            from_lang: fromLang,
            to_lang: toLang
        }),
        signal: options.signal
    }, options.timeoutMs || 6000);

    if (!response.ok) {
        throw new Error(`Translation request failed with status ${response.status}`);
    }

    const data = await response.json();
    const translatedText = (data.translated_text || '').trim();
    return translatedText || text;
}

function normalizeLangCode(lang) {
    const value = (lang || '').toLowerCase().replace('_', '-');
    if (value.includes('pt')) return 'pt';
    if (value.includes('en')) return 'en';
    return value;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
    const controller = new AbortController();
    const externalSignal = options.signal;
    const onAbort = () => controller.abort();

    if (externalSignal) {
        if (externalSignal.aborted) {
            controller.abort();
        } else {
            externalSignal.addEventListener('abort', onAbort, { once: true });
        }
    }

    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const { signal, ...rest } = options;
        return await fetch(url, {
            ...rest,
            signal: controller.signal
        });
    } catch (error) {
        if (controller.signal.aborted) {
            const abortError = new Error('Request timeout or aborted');
            abortError.name = 'AbortError';
            throw abortError;
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
        if (externalSignal) {
            externalSignal.removeEventListener('abort', onAbort);
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ==================== SESSION MANAGEMENT ====================

function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

function getSessionTitle(messages) {
    const firstUser = messages.find(m => m.role === 'user');
    if (firstUser) {
        const t = firstUser.content.trim();
        return t.length > 42 ? t.substring(0, 42) + '…' : t;
    }
    return 'Nova conversa';
}

function persistSessions(type) {
    if (type === 'written') {
        localStorage.setItem('grilo_written_sessions', JSON.stringify(writtenSessions));
        localStorage.setItem('grilo_active_written_session', currentWrittenSessionId || '');
    } else {
        localStorage.setItem('grilo_voice_sessions', JSON.stringify(voiceSessions));
        localStorage.setItem('grilo_active_voice_session', currentVoiceSessionId || '');
    }
}

function loadSessions() {
    // Load written sessions
    try {
        const ws = localStorage.getItem('grilo_written_sessions');
        writtenSessions = ws ? JSON.parse(ws) : [];
        currentWrittenSessionId = localStorage.getItem('grilo_active_written_session') || null;

        // Migrate legacy flat history if no sessions exist
        if (writtenSessions.length === 0) {
            const legacy = localStorage.getItem('grilo_chat_history');
            if (legacy) {
                const msgs = JSON.parse(legacy);
                if (msgs.length > 0) {
                    const id = generateSessionId();
                    writtenSessions.push({ id, title: getSessionTitle(msgs), createdAt: Date.now(), messages: msgs });
                    currentWrittenSessionId = id;
                    persistSessions('written');
                    localStorage.removeItem('grilo_chat_history');
                }
            }
        }
    } catch(e) { writtenSessions = []; }

    // Verify active session still exists
    if (currentWrittenSessionId && !writtenSessions.find(s => s.id === currentWrittenSessionId)) {
        currentWrittenSessionId = writtenSessions.length > 0 ? writtenSessions[writtenSessions.length - 1].id : null;
    }

    // Load voice sessions
    try {
        const vs = localStorage.getItem('grilo_voice_sessions');
        voiceSessions = vs ? JSON.parse(vs) : [];
        currentVoiceSessionId = localStorage.getItem('grilo_active_voice_session') || null;
    } catch(e) { voiceSessions = []; }

    if (currentVoiceSessionId && !voiceSessions.find(s => s.id === currentVoiceSessionId)) {
        currentVoiceSessionId = voiceSessions.length > 0 ? voiceSessions[voiceSessions.length - 1].id : null;
    }

    // Restore active written session into writingConversationHistory
    if (currentWrittenSessionId) {
        const active = writtenSessions.find(s => s.id === currentWrittenSessionId);
        if (active) writingConversationHistory = [...active.messages];
    }

    // Restore active voice session into conversationHistoryVoice
    if (currentVoiceSessionId) {
        const active = voiceSessions.find(s => s.id === currentVoiceSessionId);
        if (active) conversationHistoryVoice = [...active.messages];
    }
}

function saveCurrentWrittenSession() {
    if (!currentWrittenSessionId) return;
    const session = writtenSessions.find(s => s.id === currentWrittenSessionId);
    if (session) {
        session.messages = [...writingConversationHistory];
        session.title = getSessionTitle(session.messages);
        persistSessions('written');
        renderSessionList('written');
    }
}

function saveCurrentVoiceSession() {
    if (!currentVoiceSessionId) return;
    const session = voiceSessions.find(s => s.id === currentVoiceSessionId);
    if (session) {
        session.messages = [...conversationHistoryVoice];
        session.title = getSessionTitle(session.messages);
        persistSessions('voice');
        renderSessionList('voice');
    }
}

function createNewWrittenSession() {
    clearInlineTranslationBar();
    saveCurrentWrittenSession();

    // Show session summary if there were messages in the current session
    if (writingMessageCount > 0 && sessionStartTime) {
        showSessionSummary(sessionStartTime)
            .then(() => {
                _resetAndStartNewSession();
            })
            .catch(error => {
                console.error("Session summary error:", error);
                // Reset session even if summary fails
                _resetAndStartNewSession();
            });
    } else {
        _resetAndStartNewSession();
    }
}

function _resetAndStartNewSession() {
    const id = generateSessionId();
    writtenSessions.push({ id, title: 'Nova conversa', createdAt: Date.now(), messages: [] });
    currentWrittenSessionId = id;
    writingConversationHistory = [];
    writingFocusArea = null;
    writingConversationTheme = null;
    writingMessageCount = 0;
    sessionStartTime = null;
    sessionVocabulary = [];
    const chatMessages = document.getElementById('chatMessagesWritten');
    if (chatMessages) chatMessages.innerHTML = '';
    persistSessions('written');
    renderSessionList('written');
    const panel = document.getElementById('writtenSessionsSubmenu');
    if (panel) panel.classList.remove('active');
    initializeChat();
}

function createNewVoiceSession() {
    saveCurrentVoiceSession();
    const id = generateSessionId();
    voiceSessions.push({ id, title: 'Nova conversa de voz', createdAt: Date.now(), messages: [] });
    currentVoiceSessionId = id;
    conversationHistoryVoice = [];
    const chatMessages = document.getElementById('chatMessagesVoice');
    if (chatMessages) chatMessages.innerHTML = '';
    persistSessions('voice');
    renderSessionList('voice');
    const panel = document.getElementById('voiceSessionsSubmenu');
    if (panel) panel.classList.remove('active');
}

function switchWrittenSession(id) {
    if (id === currentWrittenSessionId) return;
    clearInlineTranslationBar();
    saveCurrentWrittenSession();
    const session = writtenSessions.find(s => s.id === id);
    if (!session) return;
    currentWrittenSessionId = id;
    writingConversationHistory = [...session.messages];
    writingFocusArea = null;
    writingMessageCount = 0;
    sessionStartTime = null;
    sessionVocabulary = [];
    writingConversationTheme = null;
    const chatMessages = document.getElementById('chatMessagesWritten');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        writingConversationHistory.forEach((msg, index) => {
            // Re-render message with translation if available
            const msgElement = addMessageToChat(msg.role, msg.content, msg.translation || null, 'Written');
            
            // If this is an assistant message with feedback, reconstruct the insight panel
            if (msg.role === 'assistant' && msg.feedback?.corrections?.length > 0 && msgElement) {
                // The user message is the previous sibling
                const userMessage = msgElement.previousElementSibling;
                if (userMessage?.classList.contains('message-user')) {
                    showInsightPanel(userMessage, msg.feedback);
                }
            }
        });
        if (writingConversationHistory.length === 0) {
            renderWritingWelcomeMessage();
        }
    }
    persistSessions('written');
    renderSessionList('written');
    // Close the session panel after selecting
    const panel = document.getElementById('writtenSessionsSubmenu');
    if (panel) panel.classList.remove('active');
    setTimeout(() => { const inp = document.getElementById('chatInputWritten'); if (inp) inp.focus(); }, 100);
}

function switchVoiceSession(id) {
    if (id === currentVoiceSessionId) return;
    saveCurrentVoiceSession();
    const session = voiceSessions.find(s => s.id === id);
    if (!session) return;
    currentVoiceSessionId = id;
    conversationHistoryVoice = [...session.messages];
    const chatMessages = document.getElementById('chatMessagesVoice');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        conversationHistoryVoice.forEach(msg => addMessageToChat(msg.role, msg.content, null, 'Voice'));
    }
    persistSessions('voice');
    renderSessionList('voice');
    // Close the session panel after selecting
    const panel = document.getElementById('voiceSessionsSubmenu');
    if (panel) panel.classList.remove('active');
}

function deleteSession(type, id, event) {
    event.stopPropagation();
    if (!confirm('Excluir esta conversa?')) return;
    if (type === 'written') {
        clearInlineTranslationBar();
        writtenSessions = writtenSessions.filter(s => s.id !== id);
        if (currentWrittenSessionId === id) {
            if (writtenSessions.length > 0) {
                const next = writtenSessions[writtenSessions.length - 1];
                currentWrittenSessionId = next.id;
                writingConversationHistory = [...next.messages];
                writingFocusArea = null;
                const el = document.getElementById('chatMessagesWritten');
                if (el) {
                    el.innerHTML = '';
                    writingConversationHistory.forEach(m => addMessageToChat(m.role, m.content, m.translation || null, 'Written'));
                    if (writingConversationHistory.length === 0) {
                        renderWritingWelcomeMessage();
                    }
                }
            } else {
                createNewWrittenSession(); return;
            }
        }
        persistSessions('written');
        renderSessionList('written');
    } else {
        voiceSessions = voiceSessions.filter(s => s.id !== id);
        if (currentVoiceSessionId === id) {
            if (voiceSessions.length > 0) {
                const next = voiceSessions[voiceSessions.length - 1];
                currentVoiceSessionId = next.id;
                conversationHistoryVoice = [...next.messages];
                const el = document.getElementById('chatMessagesVoice');
                if (el) { el.innerHTML = ''; conversationHistoryVoice.forEach(m => addMessageToChat(m.role, m.content, null, 'Voice')); }
            } else {
                createNewVoiceSession(); return;
            }
        }
        persistSessions('voice');
        renderSessionList('voice');
    }
}

function renderSessionList(type) {
    const sessions = type === 'written' ? writtenSessions : voiceSessions;
    const activeId = type === 'written' ? currentWrittenSessionId : currentVoiceSessionId;
    const listEl = document.getElementById(type === 'written' ? 'writtenSessionsList' : 'voiceSessionsList');
    if (!listEl) return;
    listEl.innerHTML = '';
    const sorted = [...sessions].reverse();
    sorted.forEach(session => {
        const item = document.createElement('div');
        item.className = 'session-item' + (session.id === activeId ? ' active' : '');
        item.dataset.sessionId = session.id;
        item.dataset.sessionTitle = session.title;
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.onclick = (e) => {
            e.stopPropagation();
            if (type === 'written') {
                switchWrittenSession(session.id);
            } else {
                switchVoiceSession(session.id);
            }
            const panelId = type === 'written' ? 'writtenSessionsSubmenu' : 'voiceSessionsSubmenu';
            const panel = document.getElementById(panelId);
            if (panel) panel.classList.remove('active');
        };
        const date = new Date(session.createdAt);
        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        item.innerHTML = `
            <span class="session-title">${escapeHtml(session.title)}</span>
            <span class="session-meta">${dateStr}</span>
            <button class="session-delete" onclick="deleteSession('${type}', '${session.id}', event)" title="Excluir">×</button>
        `;
        listEl.appendChild(item);
    });
}
// Complete lesson bonus (sidebar button) - kept for backward compatibility
function completeLesson() {
    // This should trigger from the sidebar "Completar Aula +XP" button
    // For now, just show an alert
    alert("Parabéns por sua dedicação! Complete mais aulas para ganhar XP.");
}

// ==================== LANGUAGE SELECTOR ====================

document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem("grilo_token");
    const savedUser = localStorage.getItem("grilo_user");
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);

        // Load all sessions (written + voice) and restore active ones
        loadSessions();

        // Render active written session messages to UI
        const chatMessages = document.getElementById("chatMessagesWritten");
        if (chatMessages) {
            chatMessages.innerHTML = "";
            writingConversationHistory.forEach(msg => addMessageToChat(msg.role, msg.content, msg.translation || null, "Written"));
        }

        showMainContent();
        updateDashboard();

        // Render session lists
        renderSessionList('written');
        renderSessionList('voice');
        
        // Initialize buttons disabled (painel is the first tab now)
        const chatSendBtn = document.getElementById("chatSendBtnWritten");
        const voiceStartBtn = document.getElementById("voiceStartBtn");
        if (chatSendBtn) chatSendBtn.disabled = true;
        if (voiceStartBtn) voiceStartBtn.disabled = true;
        
        // Initialize chat with welcome message
        initializeChat();
    } else {
        showAuthContainer();
    }
    
    // Language selector buttons
    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            currentLanguage = btn.getAttribute("data-lang");
            
            // Update input label
            const inputLabel = document.getElementById("inputLabelWritten");
            if (inputLabel) {
                if (currentLanguage === "pt") {
                    inputLabel.textContent = "Portuguese input is OK. We will translate before sending.";
                } else {
                    inputLabel.textContent = "Write in English (recommended for immersion).";
                }
            }
        });
    });
    
    // Enter key to send message
    const chatInputWritten = document.getElementById("chatInputWritten");
    if (chatInputWritten) {
        chatInputWritten.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessageWritten();
            }
        });
    }
});

// ==================== INTERFACE / TABS FUNCTIONS ====================

function setVoiceDimensionMode(enabled) {
    const chatVoiceTab = document.getElementById("chatVoiceTab");

    document.body.classList.toggle("voice-dimension-mode", enabled);

    if (chatVoiceTab) {
        chatVoiceTab.classList.toggle("dimension-open", enabled);
        if (!enabled) {
            chatVoiceTab.classList.remove("voice-live", "voice-active");
        }
    }

    if (!enabled) {
        document.body.classList.remove("voice-dimension-live");
    }
}

function switchTab(tabName) {
    console.log('[switchTab] Iniciando com tabName:', tabName);

    if (tabName === 'chat-written' || tabName === 'lessons') {
        tabName = 'chat-voice';
    }

    const tabMap = {
        'painel':       'painelTab',
        'chat-voice':   'chatVoiceTab'
    };

    const actualTabId = tabMap[tabName];
    if (!actualTabId) { console.error('[switchTab] Tab name não mapeado:', tabName); return; }

    // Update hidden tab-bar buttons (used by switchTab internally)
    const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    if (tabBtn) tabBtn.classList.add("active");

    // Update visible sidebar nav-btn active state
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
    if (navBtn) navBtn.classList.add('active');

    // Show correct tab content
    const tabContent = document.getElementById(actualTabId);
    if (!tabContent) { console.error('[switchTab] Conteúdo de aba não encontrado:', actualTabId); return; }
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tabContent.classList.add("active");

    // Show/hide session submenus
    const voiceSubmenu = document.getElementById('voiceSessionsSubmenu');
    if (voiceSubmenu) voiceSubmenu.classList.toggle('active', tabName === 'chat-voice');

    // Enable/disable chat buttons and trigger init
    const chatSendBtn   = document.getElementById("chatSendBtnWritten");
    const voiceStartBtn = document.getElementById("voiceStartBtn");

    if (tabName === "chat-voice") {
        clearInlineTranslationBar();
        setVoiceDimensionMode(true);
        if (chatSendBtn)   chatSendBtn.disabled   = true;
        if (voiceStartBtn) voiceStartBtn.disabled  = false;

        const aiResponseText = document.getElementById("aiResponseText");
        if (aiResponseText) {
            aiResponseText.innerHTML = "<p>Treino orientado por voz ativo. Inicie para receber feedback em tempo real e recap acionavel.</p>";
        }

        const subtitle = document.getElementById("voiceDimensionSubtitle");
        if (subtitle) {
            subtitle.textContent = "Objetivo semanal: 4 sessoes concluidas + desafio de 7 dias para desbloquear modos.";
        }

        renderSessionList('voice');
    } else if (tabName === 'painel') {
        clearInlineTranslationBar();
        if (window.SpeechHandler && typeof SpeechHandler.stopVoiceChat === 'function') {
            SpeechHandler.stopVoiceChat();
        }
        setVoiceDimensionMode(false);
        if (chatSendBtn)   chatSendBtn.disabled   = true;
        if (voiceStartBtn) voiceStartBtn.disabled  = false;
        if (typeof loadUserStats === 'function') {
            loadUserStats();
        }
    }
}

// Lessons flow is handled by frontend/controllers/lessons/*.js

// ==================== VOICE CHAT FUNCTIONS ====================
function openVoiceChat() {
    // Legacy compatibility: always route to the current immersive voice experience.
    switchTab('chat-voice');
}

function closeVoiceChat() {
    // Legacy compatibility: stop active session and return to dashboard.
    if (window.SpeechHandler && typeof SpeechHandler.stopVoiceChat === 'function') {
        SpeechHandler.stopVoiceChat();
    }
    switchTab('painel');
}

// ==================== FEEDBACK DISPLAY ====================

/**
 * Show a rich pedagogical insight panel below the AI response.
 * Replaces the old inline icon — teaches deeply, not just flags.
 */
function showInsightPanel(userMessageElement, feedback) {
    if (!feedback || !feedback.corrections || feedback.corrections.length === 0) return;

    // Find the AI message that follows the user message
    const aiMessage = userMessageElement.nextElementSibling;
    if (!aiMessage) return;

    // Don't add duplicate panels
    if (aiMessage.nextElementSibling?.classList.contains('insight-panel')) return;

    let itemsHTML = '';
    feedback.corrections.forEach((c, i) => {
        const severityColor = c.severity === 'high' ? '#e74c3c' : c.severity === 'low' ? '#f39c12' : '#e67e22';
        itemsHTML += `
        <div class="insight-item">
            <div class="insight-change">
                <span class="insight-error">${escapeHTML(c.original)}</span>
                <span class="insight-arrow">→</span>
                <span class="insight-corrected">${escapeHTML(c.corrected)}</span>
            </div>
            <div class="insight-explanation">${escapeHTML(c.explanation || '')}</div>
        </div>`;
    });

    const scoreLabel = (feedback.accuracy_score || 80) >= 90 ? '🎯 Quase perfeito!' 
        : (feedback.accuracy_score || 80) >= 70 ? '💪 Bom progresso!'
        : '📖 Continue praticando!';

    const panel = document.createElement('div');
    panel.className = 'insight-panel';
    panel.innerHTML = `
        <div class="insight-header">
            <span class="insight-icon">💡</span>
            <span class="insight-title">O que você aprendeu aqui</span>
            <span class="insight-score">${scoreLabel}</span>
            <button class="insight-toggle" title="Mostrar/ocultar">▼</button>
        </div>
        <div class="insight-body">
            ${itemsHTML}
            <div class="insight-accuracy">
                <span>Precisão desta mensagem:</span>
                <span class="insight-accuracy-value">${feedback.accuracy_score || 80}%</span>
            </div>
        </div>`;

    // Insert after the AI message
    aiMessage.insertAdjacentElement('afterend', panel);

    // Toggle collapse
    panel.querySelector('.insight-toggle').addEventListener('click', () => {
        const body = panel.querySelector('.insight-body');
        const btn = panel.querySelector('.insight-toggle');
        const collapsed = body.style.display === 'none';
        body.style.display = collapsed ? '' : 'none';
        btn.textContent = collapsed ? '▼' : '▶';
    });
}

function escapeHTML(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/**
 * Update the conversation theme badge in the chat header.
 */
function updateConversationThemeBadge(theme) {
    if (!theme) return;
    const THEME_ICONS = {
        travel: '✈️', food: '🍕', work: '💼', family: '👨‍👩‍👧', sports: '⚽',
        music: '🎵', technology: '💻', movies: '🎬', school: '📚', health: '🏥',
        hobbies: '🎨', shopping: '🛍️', weather: '🌤️', nature: '🌿'
    };
    const icon = THEME_ICONS[theme.toLowerCase()] || '💬';
    const badge = document.getElementById('writingThemeBadge');
    if (badge) {
        badge.textContent = `${icon} ${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
        badge.style.display = 'inline-flex';
    }
}

/**
 * Show a level-up toast notification.
 */
function showLevelUpToast(newLevel) {
    const LEVEL_NAMES = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };
    const levelName = LEVEL_NAMES[newLevel] || `Nível ${newLevel}`;
    const toast = document.createElement('div');
    toast.className = 'level-up-toast';
    toast.innerHTML = `<span class="level-up-emoji">🎉</span> <strong>Level Up!</strong> Você chegou ao <strong>${levelName}</strong>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// ==================== SESSION SUMMARY ====================

/**
 * Fetch session summary from backend and show the modal.
 * Returns a Promise that resolves when the user closes the modal.
 */
async function showSessionSummary(sessionStart) {
    return new Promise(async (resolve) => {
        try {
            const token = authToken || localStorage.getItem('grilo_token');
            const response = await fetch(`${API_BASE_URL}/api/chat/session-summary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ session_start: sessionStart })
            });

            if (!response.ok) {
                resolve();
                return;
            }

            const data = await response.json();
            if (!data.has_data) {
                resolve();
                return;
            }

            renderSessionSummaryModal(data, resolve);
        } catch (err) {
            console.error('[SESSION-SUMMARY] Error fetching summary:', err);
            resolve();
        }
    });
}

function renderSessionSummaryModal(data, onClose) {
    // Remove any existing modal
    document.getElementById('sessionSummaryModal')?.remove();

    const stats = data.session_stats || {};
    const topErrors = data.top_errors || [];
    const relatedLessons = data.related_lessons || [];
    const vocabulary = data.vocabulary || [];
    const trend = data.accuracy_trend || [];

    // ---- Accuracy trend sparkline (SVG) ----
    const trendPoints = trend.filter(t => t.accuracy !== null);
    let sparklineSVG = '';
    if (trendPoints.length >= 2) {
        const vals = trendPoints.map(t => t.accuracy);
        const minV = Math.min(...vals);
        const maxV = Math.max(...vals);
        const range = maxV - minV || 1;
        const w = 180, h = 40, pad = 4;
        const points = trendPoints.map((t, i) => {
            const x = pad + (i / (trendPoints.length - 1)) * (w - pad * 2);
            const y = h - pad - ((t.accuracy - minV) / range) * (h - pad * 2);
            return `${x},${y}`;
        }).join(' ');
        const lastPt = trendPoints[trendPoints.length - 1];
        const lastX = pad + ((trendPoints.length - 1) / (trendPoints.length - 1)) * (w - pad * 2);
        const lastY = h - pad - ((lastPt.accuracy - minV) / range) * (h - pad * 2);
        sparklineSVG = `
            <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" class="summary-sparkline">
                <polyline points="${points}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
                <circle cx="${lastX}" cy="${lastY}" r="4" fill="#10b981"/>
            </svg>`;
    }

    // ---- Top errors rows ----
    let errorsHTML = '';
    if (topErrors.length > 0) {
        errorsHTML = topErrors.map(e => {
            const lesson = relatedLessons.find(l => l.error_type === e.error_type);
            const lessonLink = lesson
                ? `<a class="summary-lesson-link" href="#" onclick="openLessonFromSummary(${lesson.lesson_id}); return false;">📖 Aula ${lesson.lesson_id}: ${escapeHTML(lesson.title)}</a>`
                : '';
            const barWidth = Math.min(100, e.count * 20 + 20);
            return `
                <div class="summary-error-row">
                    <div class="summary-error-top">
                        <span class="summary-error-label">${escapeHTML(e.label)}</span>
                        <span class="summary-error-count">${e.count}x</span>
                    </div>
                    <div class="summary-error-bar-wrap">
                        <div class="summary-error-bar" style="width:${barWidth}%"></div>
                    </div>
                    ${lessonLink}
                </div>`;
        }).join('');
    } else {
        errorsHTML = '<p class="summary-empty">Nenhum erro significativo! 🎉</p>';
    }

    // ---- Vocabulary rows ----
    let vocabHTML = '';
    if (vocabulary.length > 0) {
        vocabHTML = vocabulary.map(v => `
            <div class="summary-vocab-item">
                <span class="summary-vocab-expr">${escapeHTML(v.expression)}</span>
                <span class="summary-vocab-meaning">${escapeHTML(v.meaning_pt)}</span>
                ${v.example ? `<span class="summary-vocab-example">"${escapeHTML(v.example)}"</span>` : ''}
            </div>`).join('');
    } else {
        vocabHTML = '<p class="summary-empty">Continue praticando para expandir seu vocabulário!</p>';
    }

    // ---- Improvement badge ----
    const improvement = data.improvement;
    const impPositive = data.improvement_positive !== false;
    let improvementHTML = '';
    if (improvement) {
        const impClass = impPositive ? 'summary-improvement-pos' : 'summary-improvement-neg';
        const impIcon = impPositive ? '📈' : '📉';
        improvementHTML = `<span class="${impClass}">${impIcon} ${improvement} vs. histórico</span>`;
    }

    const accuracyColor = (stats.accuracy_avg || 0) >= 80 ? '#10b981' : (stats.accuracy_avg || 0) >= 60 ? '#f59e0b' : '#ef4444';

    const modal = document.createElement('div');
    modal.id = 'sessionSummaryModal';
    modal.className = 'session-summary-overlay';
    modal.innerHTML = `
        <div class="session-summary-modal">
            <div class="summary-header">
                <div class="summary-header-icon">📊</div>
                <div>
                    <h2 class="summary-title">Resumo da Sessão</h2>
                    <p class="summary-subtitle">Veja como você se saiu nesta conversa</p>
                </div>
                <button class="summary-close-btn" id="summaryCloseBtn" aria-label="Fechar">✕</button>
            </div>

            <div class="summary-stats-grid">
                <div class="summary-stat-card">
                    <span class="summary-stat-icon">💬</span>
                    <span class="summary-stat-value">${stats.messages_sent || 0}</span>
                    <span class="summary-stat-label">Mensagens</span>
                </div>
                <div class="summary-stat-card">
                    <span class="summary-stat-icon">🎯</span>
                    <span class="summary-stat-value" style="color:${accuracyColor}">${stats.accuracy_avg !== null && stats.accuracy_avg !== undefined ? stats.accuracy_avg + '%' : '—'}</span>
                    <span class="summary-stat-label">Precisão média</span>
                </div>
                <div class="summary-stat-card">
                    <span class="summary-stat-icon">⭐</span>
                    <span class="summary-stat-value" style="color:#f59e0b">${stats.xp_earned || 0}</span>
                    <span class="summary-stat-label">XP ganho</span>
                </div>
                <div class="summary-stat-card">
                    <span class="summary-stat-icon">📝</span>
                    <span class="summary-stat-value">${stats.corrections_total || 0}</span>
                    <span class="summary-stat-label">Correções</span>
                </div>
            </div>

            ${sparklineSVG || improvementHTML ? `
            <div class="summary-section summary-trend-section">
                <div class="summary-section-header">
                    <span class="summary-section-icon">📈</span>
                    <span class="summary-section-title">Evolução de Precisão (7 dias)</span>
                    ${improvementHTML}
                </div>
                <div class="summary-sparkline-wrap">
                    ${sparklineSVG}
                    <div class="summary-sparkline-labels">
                        ${trendPoints.length >= 2 ? `
                            <span>${trendPoints[0]?.accuracy !== null ? trendPoints[0].accuracy + '%' : '—'}</span>
                            <span style="color:#10b981;font-weight:700">${trendPoints[trendPoints.length-1]?.accuracy !== null ? trendPoints[trendPoints.length-1].accuracy + '%' : '—'} hoje</span>
                        ` : '<span style="color:var(--text-secondary)">Pratique mais para ver sua evolução</span>'}
                    </div>
                </div>
            </div>` : ''}

            <div class="summary-section">
                <div class="summary-section-header">
                    <span class="summary-section-icon">⚠️</span>
                    <span class="summary-section-title">Suas Dificuldades</span>
                </div>
                <div class="summary-errors-list">${errorsHTML}</div>
            </div>

            <div class="summary-section">
                <div class="summary-section-header">
                    <span class="summary-section-icon">🧠</span>
                    <span class="summary-section-title">Vocabulário Novo</span>
                    ${vocabulary.length > 0 ? `<span class="summary-vocab-badge">+${vocabulary.length} expressão${vocabulary.length > 1 ? 'ões' : ''}</span>` : ''}
                </div>
                <div class="summary-vocab-list">${vocabHTML}</div>
            </div>

            <div class="summary-actions">
                <button class="summary-btn-primary" id="summaryStartNewBtn">Nova Conversa</button>
                <button class="summary-btn-secondary" id="summaryStayBtn">Continuar aqui</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Animate in
    requestAnimationFrame(() => modal.classList.add('active'));

    function close(startNew) {
        modal.classList.remove('active');
        setTimeout(() => { modal.remove(); onClose(startNew); }, 300);
    }

    document.getElementById('summaryCloseBtn').addEventListener('click', () => close(false));
    document.getElementById('summaryStayBtn').addEventListener('click', () => close(false));
    document.getElementById('summaryStartNewBtn').addEventListener('click', () => close(true));
    modal.addEventListener('click', (e) => { if (e.target === modal) close(false); });
}

function openLessonFromSummary(lessonId) {
    // Close the modal and navigate to lessons tab at that lesson
    document.getElementById('sessionSummaryModal')?.remove();
    // Switch to lessons tab
    const lessonsTab = document.querySelector('[data-tab="lessons"]') || document.getElementById('lessonsTabBtn');
    if (lessonsTab) lessonsTab.click();
    // Scroll to or open lesson
    setTimeout(() => {
        const lessonEl = document.querySelector(`[data-lesson-id="${lessonId}"]`);
        if (lessonEl) {
            lessonEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            lessonEl.click();
        }
    }, 400);
}


/**
 * Add inline corrections icon with hover tooltip to user message
 */
function addInlineCorrectionsIcon(messageElement, feedback) {
    if (!feedback || !feedback.corrections || feedback.corrections.length === 0) {
        return; // No corrections, no icon
    }
    
    // Create correction icon with tooltip
    const iconSpan = document.createElement('span');
    iconSpan.className = 'correction-icon';
    iconSpan.innerHTML = `
        <span class="correction-icon-glyph">✎</span>
        <span class="correction-icon-count">${feedback.corrections.length}</span>
    `;
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'correction-tooltip';
    
    let correctionsHTML = '';
    feedback.corrections.forEach(correction => {
        correctionsHTML += `
            <div class="tooltip-correction-item">
                <div class="tooltip-correction-change">
                    <span class="tooltip-error">${correction.original}</span>
                    <span class="tooltip-arrow">→</span>
                    <span class="tooltip-correction">${correction.corrected}</span>
                </div>
                <div class="tooltip-explanation">${correction.explanation || 'Grammar/vocabulary correction'}</div>
            </div>
        `;
    });
    
    tooltip.innerHTML = `
        <div class="tooltip-header">
            <span>✏️</span>
            <span>Corrections</span>
        </div>
        <div class="tooltip-corrections">
            ${correctionsHTML}
        </div>
        <div class="tooltip-score">
            <span>Accuracy:</span>
            <span class="tooltip-score-badge">${feedback.accuracy_score || 85}%</span>
        </div>
    `;
    
    iconSpan.appendChild(tooltip);
    
    // Append to message bubble
    const messageMeta = messageElement.querySelector('.message-meta');
    if (messageMeta) {
        messageMeta.appendChild(iconSpan);
    }
}

/**
 * Add a subtle ✅ badge to the message bubble when writing is perfect (no corrections)
 */
function addPerfectBadge(messageElement) {
    const messageMeta = messageElement.querySelector('.message-meta');
    if (!messageMeta) return;
    const badge = document.createElement('span');
    badge.className = 'correction-icon perfect-badge';
    badge.title = 'Great English!';
    badge.innerHTML = `<span class="correction-icon-glyph">✓</span>`;
    messageMeta.appendChild(badge);
}

// ==================== GLOBAL EXPORTS ====================
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.toggleAuthForm = toggleAuthForm;
window.sendMessageWritten = sendMessageWritten;
window.exitVoiceDimension = exitVoiceDimension;
window.switchTab = switchTab;
window.completeLesson = completeLesson;
window.createNewWrittenSession = createNewWrittenSession;
window.createNewVoiceSession = createNewVoiceSession;
window.switchWrittenSession = switchWrittenSession;
window.switchVoiceSession = switchVoiceSession;
window.deleteSession = deleteSession;


