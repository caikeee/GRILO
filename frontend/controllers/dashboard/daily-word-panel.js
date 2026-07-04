        (function() {
            const DAILY_WORDS = [
                {
                    word: 'breakthrough',
                    pronunciation: '/breik-thruː/',
                    tag: 'Momentum',
                    definition: 'Um avanço importante depois de esforço, bloqueio ou repetição.',
                    context: 'Projetos, carreira, estudos',
                    level: 'B1+',
                    mood: 'Quando algo finalmente destrava',
                    usage: 'Use quando quiser marcar uma virada real: "Today felt like a breakthrough in my speaking confidence."',
                    trap: 'Evite usar como sinônimo de "boa ideia". "Breakthrough" passa sensação de salto concreto, não só inspiração.',
                    related: 'Pair with "turning point" para falar de mudança: "That meeting was a turning point, but landing the client was the breakthrough."',
                    quote: 'You never change your life until you step out of your comfort zone; change begins at the end of your comfort zone. — Roy T. Bennett',
                    insight: 'Misturar palavra nova com situação real, contraste de uso e um mini teste aumenta retenção sem virar aula pesada.',
                    exercises: {
                        read: {
                            instruction: 'Leia as 3 frases. Qual delas NÃO usa "breakthrough" de forma natural?',
                            sentences: [
                                'After months of practice, she had a breakthrough in her pronunciation.',
                                'The research team announced a major breakthrough in cancer treatment.',
                                'I had a breakthrough sandwich for lunch yesterday.'
                            ],
                            wrongIndex: 2,
                            explanation: '"Breakthrough" é avanço concreto, não cabe descrevendo um sanduíche comum.'
                        },
                        listen: {
                            instruction: 'Ouça a frase e escolha a palavra que está faltando.',
                            fullSentence: 'Today felt like a breakthrough in my speaking confidence.',
                            blankWord: 'breakthrough',
                            sentenceWithBlank: 'Today felt like a ___ in my speaking confidence.',
                            options: ['breakdown', 'breakthrough', 'breakaway'],
                            correctIndex: 1
                        },
                        speak: {
                            instruction: 'Clique no microfone e fale a frase em voz alta.',
                            modelSentence: 'I had a real breakthrough today.'
                        },
                        write: {
                            instruction: 'Escreva uma frase sua usando "breakthrough" sobre algo que você conquistou.',
                            requiredWord: 'breakthrough',
                            placeholder: 'Ex: I had a breakthrough when I finally...'
                        }
                    }
                },
                {
                    word: 'awkward',
                    pronunciation: '/ok-werd/',
                    tag: 'Social feel',
                    definition: 'Algo desconfortável, estranho ou sem naturalidade em uma situação.',
                    context: 'Conversas, encontros, trabalho',
                    level: 'A2+',
                    mood: 'Quando o clima pesa ou fica estranho',
                    usage: 'Fica ótimo para clima social: "The silence after my answer was a bit awkward."',
                    trap: 'Não traduza sempre como "esquisito". Muitas vezes é mais sobre constrangimento do que estranheza.',
                    related: 'Try "That was awkward" versus "That was embarrassing". "Awkward" é mais leve e mais cotidiano.',
                    quote: 'We are all apprentices in a craft where no one ever becomes a master. — Ernest Hemingway',
                    insight: 'Palavras sociais rendem muito porque aparecem em respostas espontâneas, especialmente em chats e fala.',
                    exercises: {
                        read: {
                            instruction: 'Leia as 3 frases. Qual delas NÃO usa "awkward" de forma natural?',
                            sentences: [
                                'There was an awkward silence after his question.',
                                'I felt awkward dancing in front of strangers.',
                                'I bought an awkward to study English.'
                            ],
                            wrongIndex: 2,
                            explanation: '"Awkward" é adjetivo, descreve clima ou pessoa — não é um objeto que se compra.'
                        },
                        listen: {
                            instruction: 'Ouça a frase e escolha a palavra que está faltando.',
                            fullSentence: 'It got awkward when nobody knew how to respond.',
                            blankWord: 'awkward',
                            sentenceWithBlank: 'It got ___ when nobody knew how to respond.',
                            options: ['awesome', 'awkward', 'awful'],
                            correctIndex: 1
                        },
                        speak: {
                            instruction: 'Clique no microfone e fale a frase em voz alta.',
                            modelSentence: 'That moment was really awkward.'
                        },
                        write: {
                            instruction: 'Escreva uma frase sua descrevendo uma situação "awkward" que você viveu.',
                            requiredWord: 'awkward',
                            placeholder: 'Ex: It was awkward when I...'
                        }
                    }
                },
                {
                    word: 'mindset',
                    pronunciation: '/maind-set/',
                    tag: 'Growth',
                    definition: 'A forma mental com que você encara desafios, hábitos e decisões.',
                    context: 'Aprendizado, performance, rotina',
                    level: 'B1',
                    mood: 'Quando fala de postura mental',
                    usage: 'Excelente para evolução pessoal: "A more patient mindset helped me keep practicing every day."',
                    trap: 'Não use como sinônimo de humor momentâneo. "Mindset" é mais estrutural do que "mood".',
                    related: 'Combine com "shift": "I need a mindset shift if I want to sound more natural in English."',
                    quote: 'Whether you think you can, or you think you can’t, you’re right. — Henry Ford',
                    insight: 'Quando a palavra encaixa na narrativa do usuário, a chance de reaparecer na produção ativa sobe bastante.',
                    exercises: {
                        read: {
                            instruction: 'Leia as 3 frases. Qual delas NÃO usa "mindset" de forma natural?',
                            sentences: [
                                'A growth mindset helps you keep learning after failure.',
                                'She has the right mindset to lead a team under pressure.',
                                'I left my mindset on the kitchen table this morning.'
                            ],
                            wrongIndex: 2,
                            explanation: '"Mindset" é abstrato, postura mental — não é um objeto físico que se esquece.'
                        },
                        listen: {
                            instruction: 'Ouça a frase e escolha a palavra que está faltando.',
                            fullSentence: 'A more patient mindset helped me keep practicing every day.',
                            blankWord: 'mindset',
                            sentenceWithBlank: 'A more patient ___ helped me keep practicing every day.',
                            options: ['mindset', 'mindful', 'mindless'],
                            correctIndex: 0
                        },
                        speak: {
                            instruction: 'Clique no microfone e fale a frase em voz alta.',
                            modelSentence: 'I need a mindset shift to grow.'
                        },
                        write: {
                            instruction: 'Escreva uma frase sua sobre como mudar seu "mindset" pode te ajudar.',
                            requiredWord: 'mindset',
                            placeholder: 'Ex: A different mindset would help me...'
                        }
                    }
                },
                {
                    word: 'subtle',
                    pronunciation: '/sa-tl/',
                    tag: 'Nuance',
                    definition: 'Algo delicado, pouco óbvio, percebido nos detalhes.',
                    context: 'Tom de voz, humor, estilo, opinião',
                    level: 'B2',
                    mood: 'Quando a diferença é pequena, mas importante',
                    usage: 'Ótima para nuances: "There is a subtle difference between sounding polite and sounding distant."',
                    trap: 'A pronúncia costuma enganar. O "b" não aparece no som, então não fale "sub-btle".',
                    related: 'Useful pair: "subtle" and "obvious". The contrast ajuda a explicar intensidade ou clareza.',
                    quote: 'Style is a simple way of saying complicated things. — Jean Cocteau',
                    insight: 'Palavras de nuance elevam o nível das respostas porque ajudam o aluno a descrever diferenças finas.',
                    exercises: {
                        read: {
                            instruction: 'Leia as 3 frases. Qual delas NÃO usa "subtle" de forma natural?',
                            sentences: [
                                'There is a subtle difference between confident and arrogant.',
                                'Her smile carried a subtle hint of sadness.',
                                'He shouted in a very subtle way across the stadium.'
                            ],
                            wrongIndex: 2,
                            explanation: '"Subtle" é o oposto de exagerado — gritar no estádio nunca é sutil.'
                        },
                        listen: {
                            instruction: 'Ouça a frase e escolha a palavra que está faltando.',
                            fullSentence: 'There is a subtle difference between sounding polite and sounding distant.',
                            blankWord: 'subtle',
                            sentenceWithBlank: 'There is a ___ difference between sounding polite and sounding distant.',
                            options: ['subtle', 'simple', 'sudden'],
                            correctIndex: 0
                        },
                        speak: {
                            instruction: 'Clique no microfone e fale a frase em voz alta. Atenção: o "b" é mudo.',
                            modelSentence: 'There is a subtle difference between them.'
                        },
                        write: {
                            instruction: 'Escreva uma frase sua usando "subtle" para descrever uma diferença pequena que você notou.',
                            requiredWord: 'subtle',
                            placeholder: 'Ex: There is a subtle difference between...'
                        }
                    }
                },
                {
                    word: 'reliable',
                    pronunciation: '/ri-lai-a-bol/',
                    tag: 'Trust',
                    definition: 'Algo ou alguém em quem se pode confiar porque funciona bem ou mantém constância.',
                    context: 'Pessoas, ferramentas, hábitos',
                    level: 'A2/B1',
                    mood: 'Quando confiança importa mais que brilho',
                    usage: 'Use para elogio sólido: "She is reliable, so everyone trusts her with deadlines."',
                    trap: 'Não confunda com "available". Uma pessoa pode estar disponível sem ser confiável.',
                    related: 'Strong pairing: "reliable" and "consistent". Consistent descreve padrão; reliable descreve confiança.',
                    quote: 'It is not enough to be busy; so are the ants. The question is: what are we busy about? — Henry David Thoreau',
                    insight: 'Vocabulário de confiança aparece em entrevistas, trabalho e apresentação pessoal, então rende uso recorrente.',
                    exercises: {
                        read: {
                            instruction: 'Leia as 3 frases. Qual delas NÃO usa "reliable" de forma natural?',
                            sentences: [
                                'My old car is still reliable after ten years.',
                                'She is a reliable friend, always there when I need her.',
                                'The weather yesterday was reliable and rainy.'
                            ],
                            wrongIndex: 2,
                            explanation: '"Reliable" descreve consistência confiável — clima de um único dia não é "reliable", é só uma observação pontual.'
                        },
                        listen: {
                            instruction: 'Ouça a frase e escolha a palavra que está faltando.',
                            fullSentence: 'She is reliable, so everyone trusts her with deadlines.',
                            blankWord: 'reliable',
                            sentenceWithBlank: 'She is ___, so everyone trusts her with deadlines.',
                            options: ['reliable', 'available', 'remarkable'],
                            correctIndex: 0
                        },
                        speak: {
                            instruction: 'Clique no microfone e fale a frase em voz alta.',
                            modelSentence: 'She is a reliable person.'
                        },
                        write: {
                            instruction: 'Escreva uma frase sua descrevendo alguém ou algo "reliable" na sua vida.',
                            requiredWord: 'reliable',
                            placeholder: 'Ex: My best friend is reliable because...'
                        }
                    }
                }
            ];

            const panel = document.getElementById('dailyWordPanel');
            if (!panel) return;

            const nodes = {
                dateLabel: document.getElementById('dailyWordDateLabel'),
                title: document.getElementById('dailyWordTitle'),
                pronunciation: document.getElementById('dailyWordPronunciation'),
                tag: document.getElementById('dailyWordTag'),
                definition: document.getElementById('dailyWordDefinition'),
                context: document.getElementById('dailyWordContextPill'),
                level: document.getElementById('dailyWordLevelPill'),
                mood: document.getElementById('dailyWordMoodPill'),
                usage: document.getElementById('dailyWordUsage'),
                trap: document.getElementById('dailyWordTrap'),
                related: document.getElementById('dailyWordRelated'),
                quote: document.getElementById('dailyWordQuote'),
                insight: document.getElementById('dailyWordInsight')
            };

            let toastTimer = null;

            function getWordForToday() {
                const today = new Date();
                const utcMidnight = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
                const dayIndex = Math.floor(utcMidnight / 86400000);
                return DAILY_WORDS[dayIndex % DAILY_WORDS.length];
            }

            function formatDateLabel() {
                try {
                    return new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: 'short'
                    }).format(new Date());
                } catch (error) {
                    return 'Hoje';
                }
            }

            function showToast(message) {
                let toast = document.getElementById('dailyWordToast');
                if (!toast) {
                    toast = document.createElement('div');
                    toast.id = 'dailyWordToast';
                    toast.className = 'daily-word-toast';
                    document.body.appendChild(toast);
                }

                toast.textContent = message;
                toast.classList.add('show');

                if (toastTimer) window.clearTimeout(toastTimer);
                toastTimer = window.setTimeout(function() {
                    toast.classList.remove('show');
                }, 2200);
            }

            // ────────────────────────────────────────────────────────────
            //  Carrossel de prática (4 exercícios Input → Output)
            // ────────────────────────────────────────────────────────────
            const STEP_TITLES = [
                '1 de 4 · 📖 Leia e identifique',
                '2 de 4 · 🔊 Ouça e complete',
                '3 de 4 · 🎙 Fale a frase',
                '4 de 4 · ✍ Escreva sua frase'
            ];

            function escapeHtml(s) {
                return String(s == null ? '' : s)
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            }

            function todayKey() {
                const d = new Date();
                const pad = function(n) { return n < 10 ? '0' + n : '' + n; };
                return 'grilo_dw_practice_' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
            }

            function loadProgress() {
                try {
                    const raw = localStorage.getItem(todayKey());
                    if (!raw) return { done: [false, false, false, false], completed: false };
                    const parsed = JSON.parse(raw);
                    if (!parsed || !Array.isArray(parsed.done) || parsed.done.length !== 4) {
                        return { done: [false, false, false, false], completed: false };
                    }
                    return parsed;
                } catch (e) {
                    return { done: [false, false, false, false], completed: false };
                }
            }

            function saveProgress(progress) {
                try { localStorage.setItem(todayKey(), JSON.stringify(progress)); } catch (e) {}
            }

            // TTS helper (mesmo padrão do phrase-voice-trainer.js)
            function speakSentence(text, onEnd) {
                if (!('speechSynthesis' in window)) { if (onEnd) onEnd(); return false; }
                try {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(text);
                    u.lang = 'en-US';
                    u.rate = 0.92;
                    u.pitch = 1.0;
                    const voices = window.speechSynthesis.getVoices();
                    const enVoice = voices.find(function(v) { return /en[-_]?(US|GB)/i.test(v.lang); })
                        || voices.find(function(v) { return /^en/i.test(v.lang); });
                    if (enVoice) u.voice = enVoice;
                    if (onEnd) u.onend = onEnd;
                    window.speechSynthesis.speak(u);
                    return true;
                } catch (e) {
                    if (onEnd) onEnd();
                    return false;
                }
            }

            const carousel = {
                wordData: null,
                stepIndex: 0,
                progress: loadProgress(),
                writeText: '',
                recognition: null,
                listening: false,
                els: {
                    panel: document.getElementById('dwPractice'),
                    progress: document.getElementById('dwProgress'),
                    title: document.getElementById('dwStepTitle'),
                    content: document.getElementById('dwStepContent'),
                    feedback: document.getElementById('dwStepFeedback'),
                    prev: document.getElementById('dwPrev'),
                    next: document.getElementById('dwNext')
                }
            };

            function setFeedback(msg, kind) {
                const el = carousel.els.feedback;
                if (!el) return;
                if (!msg) { el.hidden = true; el.textContent = ''; el.className = 'dw-practice-feedback'; return; }
                el.hidden = false;
                el.textContent = msg;
                el.className = 'dw-practice-feedback is-' + (kind || 'success');
            }

            function updateProgressDots() {
                if (!carousel.els.progress) return;
                const dots = carousel.els.progress.querySelectorAll('.dw-dot');
                dots.forEach(function(dot, i) {
                    dot.classList.remove('is-active', 'is-done');
                    if (carousel.progress.done[i]) dot.classList.add('is-done');
                    if (i === carousel.stepIndex) dot.classList.add('is-active');
                });
            }

            function updateNav() {
                carousel.els.prev.disabled = carousel.stepIndex === 0;
                carousel.els.next.disabled = !carousel.progress.done[carousel.stepIndex];
                carousel.els.next.textContent = carousel.stepIndex === 3 ? 'Concluir 🎉' : 'Próximo →';
            }

            function markStepDone(i) {
                carousel.progress.done[i] = true;
                saveProgress(carousel.progress);
                updateProgressDots();
                updateNav();
            }

            // ── Passo 1: READ ─────────────────────────────────────────
            function renderStepRead() {
                const ex = carousel.wordData.exercises.read;
                let html = '<p class="dw-practice-instruction">' + escapeHtml(ex.instruction) + '</p>';
                html += '<div class="dw-practice-options" id="dwReadOptions">';
                ex.sentences.forEach(function(s, idx) {
                    html += '<button type="button" class="dw-practice-option" data-idx="' + idx + '">' + escapeHtml(s) + '</button>';
                });
                html += '</div>';
                carousel.els.content.innerHTML = html;

                const buttons = carousel.els.content.querySelectorAll('.dw-practice-option');
                buttons.forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        const picked = parseInt(btn.getAttribute('data-idx'), 10);
                        buttons.forEach(function(b) { b.disabled = true; });
                        if (picked === ex.wrongIndex) {
                            btn.classList.add('is-right');
                            setFeedback('✓ Boa! ' + ex.explanation, 'success');
                            markStepDone(0);
                        } else {
                            btn.classList.add('is-wrong');
                            buttons[ex.wrongIndex].classList.add('is-right');
                            setFeedback('A frase incorreta era: "' + ex.sentences[ex.wrongIndex] + '". ' + ex.explanation, 'warning');
                            markStepDone(0);
                        }
                    });
                });
            }

            // ── Passo 2: LISTEN ───────────────────────────────────────
            function renderStepListen() {
                const ex = carousel.wordData.exercises.listen;
                const sentenceHtml = escapeHtml(ex.sentenceWithBlank).replace('___', '<span class="dw-blank">' + escapeHtml(ex.blankWord) + '</span>');
                let html = '<p class="dw-practice-instruction">' + escapeHtml(ex.instruction) + '</p>';
                html += '<div class="dw-listen-controls">';
                html += '  <button type="button" class="dw-listen-play" id="dwListenPlay" aria-label="Tocar áudio">▶</button>';
                html += '  <div class="dw-listen-sentence">' + sentenceHtml + '</div>';
                html += '</div>';
                html += '<div class="dw-practice-options" id="dwListenOptions">';
                ex.options.forEach(function(opt, idx) {
                    html += '<button type="button" class="dw-practice-option" data-idx="' + idx + '" disabled>' + escapeHtml(opt) + '</button>';
                });
                html += '</div>';
                carousel.els.content.innerHTML = html;

                const playBtn = document.getElementById('dwListenPlay');
                const optionButtons = carousel.els.content.querySelectorAll('#dwListenOptions .dw-practice-option');
                let hasPlayed = false;

                playBtn.addEventListener('click', function() {
                    playBtn.classList.add('is-playing');
                    speakSentence(ex.fullSentence, function() {
                        playBtn.classList.remove('is-playing');
                        if (!hasPlayed) {
                            hasPlayed = true;
                            optionButtons.forEach(function(b) { b.disabled = false; });
                            setFeedback('Agora escolha a palavra que você ouviu.', 'success');
                        }
                    });
                });

                optionButtons.forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        const picked = parseInt(btn.getAttribute('data-idx'), 10);
                        optionButtons.forEach(function(b) { b.disabled = true; });
                        if (picked === ex.correctIndex) {
                            btn.classList.add('is-right');
                            setFeedback('✓ Perfeito! Você reconheceu o som de "' + ex.blankWord + '".', 'success');
                            markStepDone(1);
                        } else {
                            btn.classList.add('is-wrong');
                            optionButtons[ex.correctIndex].classList.add('is-right');
                            setFeedback('A palavra era "' + ex.blankWord + '". Toque o áudio mais uma vez para fixar o som.', 'warning');
                            markStepDone(1);
                        }
                    });
                });
            }

            // ── Passo 3: SPEAK ────────────────────────────────────────
            function renderStepSpeak() {
                const ex = carousel.wordData.exercises.speak;
                const tokens = ex.modelSentence.split(/(\s+)/).map(function(t, i) {
                    if (/^\s+$/.test(t)) return t;
                    return '<span class="dw-word-token" data-tok="' + i + '">' + escapeHtml(t) + '</span>';
                }).join('');

                let html = '<p class="dw-practice-instruction">' + escapeHtml(ex.instruction) + '</p>';
                html += '<div class="dw-speak-model" id="dwSpeakModel">' + tokens + '</div>';
                html += '<div class="dw-speak-controls">';
                html += '  <button type="button" class="dw-speak-btn" id="dwSpeakListen">🔊 Ouvir</button>';
                html += '  <button type="button" class="dw-speak-btn is-mic" id="dwSpeakMic">🎙 <span id="dwSpeakMicLabel">Falar</span></button>';
                html += '</div>';
                html += '<p class="dw-speak-heard" id="dwSpeakHeard"></p>';
                carousel.els.content.innerHTML = html;

                const listenBtn = document.getElementById('dwSpeakListen');
                const micBtn = document.getElementById('dwSpeakMic');
                const micLabel = document.getElementById('dwSpeakMicLabel');
                const heardEl = document.getElementById('dwSpeakHeard');
                const modelEl = document.getElementById('dwSpeakModel');

                listenBtn.addEventListener('click', function() {
                    speakSentence(ex.modelSentence);
                });

                const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SR) {
                    micBtn.disabled = true;
                    setFeedback('Seu navegador não suporta reconhecimento de voz. Use Chrome ou pule para o próximo passo.', 'warning');
                    markStepDone(2);
                    return;
                }

                function stopListening() {
                    carousel.listening = false;
                    micBtn.classList.remove('is-listening');
                    micLabel.textContent = 'Falar';
                }

                micBtn.addEventListener('click', function() {
                    if (carousel.listening) {
                        try { carousel.recognition && carousel.recognition.stop(); } catch (e) {}
                        return;
                    }
                    const rec = new SR();
                    rec.lang = 'en-US';
                    rec.continuous = false;
                    rec.interimResults = false;
                    rec.maxAlternatives = 5;
                    carousel.recognition = rec;

                    rec.onresult = function(event) {
                        const alts = [];
                        for (let i = 0; i < event.results.length; i++) {
                            const r = event.results[i];
                            if (r && r[0]) alts.push({ transcript: r[0].transcript, confidence: r[0].confidence || 0 });
                        }

                        let evalResult = null;
                        if (window.GriloVR && typeof window.GriloVR.evaluate === 'function') {
                            try { evalResult = window.GriloVR.evaluate(ex.modelSentence, alts); } catch (e) { evalResult = null; }
                        }

                        const transcript = (alts[0] && alts[0].transcript) || '';
                        heardEl.textContent = transcript ? '“' + transcript + '”' : '';

                        if (evalResult && Array.isArray(evalResult.matched)) {
                            const tokenEls = modelEl.querySelectorAll('.dw-word-token');
                            const expTokens = evalResult.expTokens || [];
                            let mi = 0;
                            tokenEls.forEach(function(tEl) {
                                if (mi < expTokens.length && evalResult.matched[mi] !== undefined) {
                                    tEl.classList.add(evalResult.matched[mi] ? 'is-match' : 'is-miss');
                                    mi++;
                                }
                            });
                            const matchedCount = evalResult.matched.filter(Boolean).length;
                            const total = expTokens.length || tokenEls.length;
                            const pct = total ? Math.round((matchedCount / total) * 100) : 0;
                            if (pct >= 70) {
                                setFeedback('✓ Muito bem! ' + matchedCount + '/' + total + ' palavras corretas (' + pct + '%).', 'success');
                            } else {
                                setFeedback('Você acertou ' + matchedCount + '/' + total + ' palavras. Tente de novo ou siga adiante.', 'warning');
                            }
                        } else {
                            // Fallback: comparação simples
                            const expectedWords = ex.modelSentence.toLowerCase().replace(/[^a-z\s']/g, '').split(/\s+/).filter(Boolean);
                            const gotWords = transcript.toLowerCase().replace(/[^a-z\s']/g, '').split(/\s+/).filter(Boolean);
                            const matched = expectedWords.filter(function(w) { return gotWords.indexOf(w) !== -1; }).length;
                            const pct = expectedWords.length ? Math.round((matched / expectedWords.length) * 100) : 0;
                            setFeedback('Você falou ' + matched + '/' + expectedWords.length + ' palavras (' + pct + '%).', pct >= 70 ? 'success' : 'warning');
                        }
                        markStepDone(2);
                    };

                    rec.onerror = function(e) {
                        stopListening();
                        if (e && e.error === 'not-allowed') {
                            setFeedback('Permissão de microfone negada. Habilite no navegador para continuar.', 'error');
                        } else if (e && e.error === 'no-speech') {
                            setFeedback('Não ouvimos nada. Toque em Falar e tente novamente.', 'warning');
                        }
                    };
                    rec.onend = stopListening;

                    try {
                        rec.start();
                        carousel.listening = true;
                        micBtn.classList.add('is-listening');
                        micLabel.textContent = 'Ouvindo…';
                        heardEl.textContent = '';
                        setFeedback('Fale a frase em voz alta agora.', 'success');
                    } catch (e) {
                        stopListening();
                    }
                });
            }

            // ── Passo 4: WRITE ────────────────────────────────────────
            function renderStepWrite() {
                const ex = carousel.wordData.exercises.write;
                let html = '<p class="dw-practice-instruction">' + escapeHtml(ex.instruction) + '</p>';
                html += '<textarea class="dw-write-area" id="dwWriteArea" placeholder="' + escapeHtml(ex.placeholder || '') + '" rows="3">' + escapeHtml(carousel.writeText) + '</textarea>';
                html += '<button type="button" class="dw-write-submit" id="dwWriteSubmit" disabled>Enviar para revisão</button>';
                carousel.els.content.innerHTML = html;

                const area = document.getElementById('dwWriteArea');
                const submit = document.getElementById('dwWriteSubmit');
                const required = ex.requiredWord.toLowerCase();

                function refreshSubmit() {
                    const txt = area.value.trim();
                    const hasWord = txt.toLowerCase().indexOf(required) !== -1;
                    const longEnough = txt.split(/\s+/).filter(Boolean).length >= 3;
                    submit.disabled = !(hasWord && longEnough);
                    if (txt.length > 0 && !hasWord) {
                        setFeedback('Sua frase precisa conter a palavra "' + ex.requiredWord + '".', 'warning');
                    } else if (txt.length > 0 && !longEnough) {
                        setFeedback('Escreva uma frase completa (pelo menos 3 palavras).', 'warning');
                    } else if (txt.length > 0) {
                        setFeedback('', null);
                    }
                }

                area.addEventListener('input', function() {
                    carousel.writeText = area.value;
                    refreshSubmit();
                });
                refreshSubmit();

                submit.addEventListener('click', async function() {
                    const text = area.value.trim();
                    if (!text) return;
                    submit.disabled = true;
                    submit.textContent = 'Enviando…';
                    setFeedback('Analisando sua frase…', 'success');

                    const token = localStorage.getItem('grilo_token');
                    if (!token) {
                        setFeedback('Faça login para receber feedback da IA. Por enquanto, sua frase foi registrada localmente.', 'warning');
                        submit.textContent = 'Enviar para revisão';
                        markStepDone(3);
                        return;
                    }

                    try {
                        const res = await fetch('/api/chat/write', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            },
                            body: JSON.stringify({
                                message: text,
                                level: 'intermediate',
                                focus_area: 'word_choice',
                                message_count: 0
                            })
                        });

                        if (!res.ok) throw new Error('HTTP ' + res.status);
                        const data = await res.json();

                        const corrected = data.corrected_text || data.corrected || '';
                        const feedbackText = data.grammar_feedback || data.feedback || data.reply || '';

                        let resultHtml = '<strong>✓ Frase recebida!</strong>';
                        if (corrected && corrected !== text) {
                            resultHtml += '<br><br><strong>Sua frase:</strong> ' + escapeHtml(text);
                            resultHtml += '<br><strong>Sugestão:</strong> ' + escapeHtml(corrected);
                        }
                        if (feedbackText) {
                            resultHtml += '<br><br>' + escapeHtml(feedbackText);
                        }
                        carousel.els.feedback.hidden = false;
                        carousel.els.feedback.className = 'dw-practice-feedback is-success';
                        carousel.els.feedback.innerHTML = resultHtml;
                        submit.textContent = 'Enviado ✓';
                        markStepDone(3);
                    } catch (e) {
                        setFeedback('Não foi possível enviar agora. Sua frase foi registrada localmente — siga para concluir.', 'warning');
                        submit.disabled = false;
                        submit.textContent = 'Tentar de novo';
                        markStepDone(3);
                    }
                });
            }

            // ── Tela final ────────────────────────────────────────────
            function renderComplete() {
                carousel.els.title.textContent = 'Concluído';
                carousel.els.content.innerHTML =
                    '<div class="dw-practice-complete">' +
                    '  <div class="dw-practice-complete-icon">🎉</div>' +
                    '  <h4>Você praticou "' + escapeHtml(carousel.wordData.word) + '" em 4 modos.</h4>' +
                    '  <p>Ler, ouvir, falar e escrever — a palavra fica fixa por mais tempo.</p>' +
                    '  <span class="dw-practice-complete-xp">+40 XP de prática</span>' +
                    '</div>';
                setFeedback('', null);
                carousel.els.prev.disabled = false;
                carousel.els.next.disabled = true;
                carousel.els.next.textContent = 'Volta amanhã 🌅';
                updateProgressDots();
            }

            const renderers = [renderStepRead, renderStepListen, renderStepSpeak, renderStepWrite];

            function renderCurrentStep() {
                setFeedback('', null);
                if (carousel.progress.completed) {
                    renderComplete();
                    return;
                }
                carousel.els.title.textContent = STEP_TITLES[carousel.stepIndex];
                renderers[carousel.stepIndex]();
                updateProgressDots();
                updateNav();
            }

            carousel.els.prev.addEventListener('click', function() {
                if (carousel.progress.completed) {
                    carousel.progress.completed = false;
                    saveProgress(carousel.progress);
                    carousel.stepIndex = 3;
                    renderCurrentStep();
                    return;
                }
                if (carousel.stepIndex > 0) {
                    carousel.stepIndex--;
                    renderCurrentStep();
                }
            });

            carousel.els.next.addEventListener('click', function() {
                if (carousel.stepIndex < 3) {
                    carousel.stepIndex++;
                    renderCurrentStep();
                } else if (carousel.progress.done[3] && !carousel.progress.completed) {
                    carousel.progress.completed = true;
                    saveProgress(carousel.progress);
                    renderComplete();
                }
            });

            function renderWord() {
                const data = getWordForToday();
                carousel.wordData = data;

                nodes.dateLabel.textContent = formatDateLabel();
                nodes.title.textContent = data.word;
                nodes.pronunciation.textContent = data.pronunciation;
                nodes.tag.textContent = data.tag;
                nodes.definition.textContent = data.definition;
                nodes.context.textContent = 'Contexto: ' + data.context;
                nodes.level.textContent = 'Nível: ' + data.level;
                nodes.mood.textContent = 'Uso: ' + data.mood;
                nodes.usage.textContent = data.usage;
                nodes.trap.textContent = data.trap;
                nodes.related.innerHTML = '<strong>Insight:</strong> ' + data.related;
                nodes.quote.textContent = data.quote;
                nodes.insight.textContent = data.insight;

                // Determina onde abrir o carrossel
                if (carousel.progress.completed) {
                    renderComplete();
                } else {
                    const firstPending = carousel.progress.done.indexOf(false);
                    carousel.stepIndex = firstPending === -1 ? 0 : firstPending;
                    renderCurrentStep();
                }

                panel.classList.add('revealed');
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', renderWord);
            } else {
                renderWord();
            }
        })();
