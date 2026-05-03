// ==================== GRILO QUIZ HANDLER ====================
// Standalone quiz system - 100 English questions A1 level
// Independent from chat (written or voice)

// API_BASE_URL is defined globally in utils.js
const getQuizApiUrl = (endpoint = '') => `${API_BASE_URL}/api/quiz${endpoint}`;

// Quiz state
let quizQuestions = [];
let quizCurrentIndex = 0;
let quizSelectedOption = null;
let quizCorrectCount = 0;
let quizTotalXP = 0;
let quizMode = null;       // 'random' | 'category' | 'all'
let quizCategoryFilter = null;
let quizRequestedCount = 10;
let quizAnswered = false;

// ==================== VIEW NAVIGATION ====================

function showQuizSelector() {
    document.getElementById('quizSelector').style.display = '';
    document.getElementById('categoryPicker').style.display = 'none';
    document.getElementById('quizActive').style.display = 'none';
    document.getElementById('quizResults').style.display = 'none';
    const lessonsView = document.getElementById('lessonsView');
    if (lessonsView) lessonsView.style.display = 'none';

}

function showCategoryPicker() {
    document.getElementById('quizSelector').style.display = 'none';
    document.getElementById('categoryPicker').style.display = '';
}

function showLessonsView() {
    document.getElementById('quizSelector').style.display = 'none';
    const lessonsView = document.getElementById('lessonsView');
    if (lessonsView) {
        lessonsView.style.display = '';
        // Trigger lesson initialization if not loaded
        if (typeof initializeLesson === 'function') {
            initializeLesson();
        }
    }
}

function showQuizActive() {
    document.getElementById('quizSelector').style.display = 'none';
    document.getElementById('categoryPicker').style.display = 'none';
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizActive').style.display = '';
}

function showQuizResults() {
    document.getElementById('quizActive').style.display = 'none';
    document.getElementById('quizResults').style.display = '';
}

// ==================== QUIZ FLOW ====================

async function startQuiz(mode, count, category) {
    quizMode = mode;
    quizCategoryFilter = category || null;
    quizRequestedCount = count || 10;
    quizCurrentIndex = 0;
    quizSelectedOption = null;
    quizCorrectCount = 0;
    quizTotalXP = 0;
    quizAnswered = false;

    try {
        let url;
        if (mode === 'all') {
            url = getQuizApiUrl('/questions');
        } else if (mode === 'category' && category) {
            url = getQuizApiUrl('/questions/category/' + encodeURIComponent(category));
        } else {
            // random
            url = getQuizApiUrl('/random?count=' + count);
        }

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();

        quizQuestions = data.questions || [];

        // If category mode, shuffle and limit
        if (mode === 'category' && quizQuestions.length > count) {
            quizQuestions = shuffleArray([...quizQuestions]).slice(0, count);
        }

        if (quizQuestions.length === 0) {
            alert('Nenhuma pergunta encontrada. Tente outra opção.');
            return;
        }

        showQuizActive();
        displayQuizQuestion();
    } catch (err) {
        console.error('[Quiz] Error loading questions:', err);
        alert('Erro ao carregar perguntas. Verifique se o servidor está rodando.');
    }
}

function displayQuizQuestion() {
    const q = quizQuestions[quizCurrentIndex];
    if (!q) return;

    quizSelectedOption = null;
    quizAnswered = false;

    // Progress
    const total = quizQuestions.length;
    const current = quizCurrentIndex + 1;
    document.getElementById('quizProgressText').textContent = `Pergunta ${current} de ${total}`;
    document.getElementById('quizScoreText').textContent = `Acertos: ${quizCorrectCount}`;
    document.getElementById('quizProgressFill').style.width = `${(current / total) * 100}%`;

    // Meta
    document.getElementById('quizQCategory').textContent = q.category || '';
    const diffStars = '⭐'.repeat(q.difficulty || 1);
    document.getElementById('quizQDifficulty').textContent = diffStars;

    // Question text
    document.getElementById('quizQuestionText').textContent = q.text;

    // Options
    const letters = ['A', 'B', 'C', 'D'];
    const optionsList = document.getElementById('quizOptionsList');
    optionsList.innerHTML = '';
    (q.options || []).forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.setAttribute('data-index', i);
        btn.innerHTML = `<span class="quiz-option-letter">${letters[i]}</span><span>${opt}</span>`;
        btn.onclick = () => selectQuizOption(i);
        optionsList.appendChild(btn);
    });

    // Reset submit button
    const submitBtn = document.getElementById('quizSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.style.display = '';

    // Hide feedback
    document.getElementById('quizFeedback').style.display = 'none';

    // Scroll to top of quiz
    document.querySelector('.lessons-container').scrollTop = 0;
}

function selectQuizOption(index) {
    if (quizAnswered) return;

    quizSelectedOption = index;

    // Update visual
    document.querySelectorAll('#quizOptionsList .quiz-option').forEach(btn => {
        btn.classList.toggle('selected', parseInt(btn.getAttribute('data-index')) === index);
    });

    document.getElementById('quizSubmitBtn').disabled = false;
}

async function submitQuizAnswer() {
    if (quizSelectedOption === null || quizAnswered) return;

    quizAnswered = true;
    const q = quizQuestions[quizCurrentIndex];
    const submitBtn = document.getElementById('quizSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.style.display = 'none';

    try {
        // Try submitting to server for XP
        const token = localStorage.getItem('grilo_token');
        let isCorrect = quizSelectedOption === q.correct;
        let explanation = q.explanation || '';
        let xpEarned = 0;

        if (token) {
            try {
                const resp = await fetch(getQuizApiUrl('/submit-answer?question_id=' + q.id + '&answer_index=' + quizSelectedOption), {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resp.ok) {
                    const data = await resp.json();
                    isCorrect = data.correct;
                    xpEarned = data.xp_earned || 0;
                    if (data.result && data.result.explanation) {
                        explanation = data.result.explanation;
                    }
                    // Update XP display in sidebar
                    if (data.user_total_xp !== undefined) {
                        const xpEl = document.getElementById('xpDisplay');
                        if (xpEl) xpEl.textContent = data.user_total_xp;
                    }
                }
            } catch (e) {
                console.warn('[Quiz] Could not submit to server, using local validation:', e);
            }
        }

        if (isCorrect) {
            quizCorrectCount++;
            quizTotalXP += xpEarned;
        }

        // Show correct/wrong on options
        document.querySelectorAll('#quizOptionsList .quiz-option').forEach(btn => {
            const idx = parseInt(btn.getAttribute('data-index'));
            btn.style.pointerEvents = 'none';
            if (idx === q.correct) {
                btn.classList.add('correct');
                btn.classList.remove('selected');
            } else if (idx === quizSelectedOption && !isCorrect) {
                btn.classList.add('wrong');
                btn.classList.remove('selected');
            }
        });

        // Show feedback
        const feedback = document.getElementById('quizFeedback');
        feedback.style.display = '';
        feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`;

        document.getElementById('quizFeedbackIcon').textContent = isCorrect ? '✅' : '❌';
        document.getElementById('quizFeedbackText').textContent = isCorrect
            ? 'Correto! +' + xpEarned + ' XP'
            : 'Incorreto!';
        document.getElementById('quizFeedbackExplanation').textContent = explanation;

        // Update score display
        document.getElementById('quizScoreText').textContent = `Acertos: ${quizCorrectCount}`;

        // Change next button text on last question
        const nextBtn = document.getElementById('quizNextBtn');
        if (quizCurrentIndex >= quizQuestions.length - 1) {
            nextBtn.textContent = 'Ver Resultado';
        } else {
            nextBtn.textContent = 'Próxima →';
        }

    } catch (err) {
        console.error('[Quiz] Error submitting answer:', err);
    }
}

function nextQuizQuestion() {
    quizCurrentIndex++;
    if (quizCurrentIndex >= quizQuestions.length) {
        finishQuiz();
    } else {
        displayQuizQuestion();
    }
}

function finishQuiz() {
    const total = quizQuestions.length;
    const correct = quizCorrectCount;
    const wrong = total - correct;
    const pct = Math.round((correct / total) * 100);

    // Icon based on score
    let icon = '🏆';
    let title = 'Quiz Finalizado!';
    if (pct >= 90) { icon = '🌟'; title = 'Excelente!'; }
    else if (pct >= 70) { icon = '🎉'; title = 'Muito Bem!'; }
    else if (pct >= 50) { icon = '👍'; title = 'Bom Trabalho!'; }
    else { icon = '💪'; title = 'Continue Praticando!'; }

    document.getElementById('quizResultsIcon').textContent = icon;
    document.getElementById('quizResultsTitle').textContent = title;
    document.getElementById('quizScoreValue').textContent = pct + '%';
    document.getElementById('quizStatCorrect').textContent = correct;
    document.getElementById('quizStatWrong').textContent = wrong;
    document.getElementById('quizStatXP').textContent = quizTotalXP;

    // Animate score ring
    const circle = document.getElementById('quizScoreCircle');
    const circumference = 2 * Math.PI * 52; // r=52
    const offset = circumference - (pct / 100) * circumference;

    // Set color based on score
    if (pct >= 70) {
        circle.style.stroke = 'var(--accent-success)';
        document.getElementById('quizScoreValue').style.color = 'var(--accent-success)';
    } else if (pct >= 50) {
        circle.style.stroke = 'var(--accent-warm)';
        document.getElementById('quizScoreValue').style.color = 'var(--accent-warm)';
    } else {
        circle.style.stroke = 'var(--accent-danger)';
        document.getElementById('quizScoreValue').style.color = 'var(--accent-danger)';
    }

    // Trigger animation after a frame
    requestAnimationFrame(() => {
        circle.style.strokeDashoffset = offset;
    });

    showQuizResults();
}

function cancelQuiz() {
    if (quizCurrentIndex > 0 && !quizAnswered) {
        if (!confirm('Tem certeza que deseja sair do quiz? Seu progresso será perdido.')) return;
    }
    showQuizSelector();
}

function retryQuiz() {
    // Restart with same mode/category/count
    startQuiz(quizMode, quizRequestedCount, quizCategoryFilter);
}

// ==================== UTILITIES ====================

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

console.log('[Quiz Handler] Loaded successfully');
