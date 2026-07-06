/**
 * LESSONS HANDLER V2
 * 50 aulas A1 com carrossel de exercicios e historico de progresso.
 */

// State
let lessonsDataV2         = [];
let allCategories         = [];
let currentLessonDetailV2 = null;
let currentCategoryFilterV2 = 'All';
let lessonProgressMap     = {};

// Exercise carousel state
let carouselExercises     = [];
let carouselCurrentIndex  = 0;
let carouselResults       = [];
let carouselSelectedIndex = null;
let carouselAnswered      = false;

const CATEGORY_LABELS_PT_BR = {
    'Greetings & Introductions': 'Saudacoes e Apresentacoes',
    'Personal Information': 'Informacoes Pessoais',
    'Family & Relationships': 'Familia e Relacionamentos',
    'Numbers & Time': 'Numeros e Tempo',
    'Food & Drinks': 'Comidas e Bebidas',
    'Places & Locations': 'Lugares e Localizacao',
    'Verbs & Actions': 'Verbos e Acoes',
    'Adjectives & Descriptions': 'Adjetivos e Descricoes',
    'Daily Routines': 'Rotinas Diarias',
    'Hobbies & Interests': 'Hobbies e Interesses'
};

function toCategoryLabel(category) {
    return CATEGORY_LABELS_PT_BR[category] || category;
}

// ─── API helpers ─────────────────────────────────────────────────────────────
async function loadLessonsV2() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/lessons/all`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) { const data = await res.json(); lessonsDataV2 = data.lessons || []; return true; }
    } catch (e) { console.error('[LESSONS-V2]', e); }
    return false;
}

async function loadCategoriesV2() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/lessons/categories`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) { const data = await res.json(); allCategories = data.categories || []; return true; }
    } catch (e) { console.error('[LESSONS-V2]', e); }
    return false;
}

async function loadLessonProgress() {
    try {
        // Tenta endpoint enriquecido primeiro (com learned/dominated/contador de frases).
        const ext = await fetch(`${API_BASE_URL}/api/lessons/progress-extended`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (ext.ok) {
            const data = await ext.json();
            lessonProgressMap = data.progress || {};
            return;
        }
        // Fallback ao endpoint legado.
        const res = await fetch(`${API_BASE_URL}/api/lessons/progress`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) { const data = await res.json(); lessonProgressMap = data.progress || {}; }
    } catch (e) { console.error('[LESSONS-V2] Progress load error:', e); }
}

async function trackLessonsPageView(source = 'home_lessons_view') {
    if (!authToken) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/lessons/page-view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ source })
        });
        if (res.ok) {
            try { localStorage.setItem('grilo_analytics_ping', String(Date.now())); } catch (e) {}
        }
    } catch (e) {
        console.error('[LESSONS-V2] Page view track error:', e);
    }
}

async function trackLessonAccess(lessonId) {
    if (!authToken || !lessonId) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/track-access`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
            try { localStorage.setItem('grilo_analytics_ping', String(Date.now())); } catch (e) {}
        }
    } catch (e) {
        console.error('[LESSONS-V2] Access track error:', e);
    }
}

async function saveProgressToBackend(lessonId, correctAnswers, totalQuestions) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/save-progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ correct_answers: correctAnswers, total_questions: totalQuestions })
        });
        lessonProgressMap[lessonId] = {
            lesson_id: lessonId,
            correct_answers: correctAnswers,
            total_questions: totalQuestions
        };
        if (res.ok) {
            const data = await res.json();
            // Update XP in shared currentUser state (set by chat-text-controller)
            if (typeof currentUser !== 'undefined' && data.total_xp != null) {
                currentUser.xp = data.total_xp;
                currentUser.level = data.new_level || currentUser.level;
                if (typeof updateDashboard === 'function') updateDashboard();
            }
            // Show level-up toast if levelled up
            if (data.level_up && typeof showLevelUpToast === 'function') {
                showLevelUpToast(data.new_level);
            }
            // Update summary screen with XP earned
            if (data.xp_earned) {
                _lastLessonXP = data.xp_earned;
            }
        }
        // Refresh panel stats so Meu Painel shows updated lesson count immediately
        loadUserStats();
    } catch (e) { console.error('[LESSONS-V2] Save progress error:', e); }
}

let _lastLessonXP = 0;

// ─── View management ─────────────────────────────────────────────────────────
async function showLessonsView() {
    ['quizSelector','categoryPicker','quizActive','quizResults','lessonDetailView'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    document.getElementById('lessonsView').style.display = 'block';
    void trackLessonsPageView();
    if (lessonsDataV2.length === 0)  await loadLessonsV2();
    if (allCategories.length === 0)  await loadCategoriesV2();
    await loadLessonProgress();
    updateLessonsProgress();
    populateCategoryTabs();
    displayLessonsGrid('All');
}

// ─── Category tabs ────────────────────────────────────────────────────────────
function populateCategoryTabs() {
    const tabs = document.getElementById('lessonsCategoriesTabs');
    tabs.innerHTML = '';
    _makeTab('Todas', 'All', true, tabs);
    allCategories.forEach(cat => _makeTab(toCategoryLabel(cat), cat, false, tabs));
}

function _makeTab(label, cat, active, container) {
    const btn = document.createElement('button');
    btn.className = 'lessons-cat-tab-new' + (active ? ' active' : '');
    btn.textContent = '';
    btn.setAttribute('data-category', cat);
    btn.onclick = () => filterLessonsByCategory(cat);
    
    const catEmojis = {
        'All': '📚', 'Números': '🔢', 'Verbos': '⚙️', 'Vocabulário': '📖',
        'Diálogos': '💬', 'Conversação': '🎙️', 'Pronúncia': '🔊', 'Gramática': '📐',
        'Phrasal Verbs': '🎯', 'Listening': '👂', 'Escritura': '✍️'
    };
    
    const emoji = catEmojis[cat] || '📌';
    btn.innerHTML = `<span class="cat-tab-emoji">${emoji}</span><span>${label}</span>`;
    container.appendChild(btn);
}

function filterLessonsByCategory(category) {
    currentCategoryFilterV2 = category;
    document.querySelectorAll('.lessons-cat-tab-new').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-category') === category);
    });
    displayLessonsGrid(category);
}

// ─── Lessons grid ─────────────────────────────────────────────────────────────
function displayLessonsGrid(category) {
    const grid = document.getElementById('lessonsGrid');
    let filtered = category === 'All'
        ? [...lessonsDataV2]
        : lessonsDataV2.filter(l => l.categories && l.categories.includes(category));
    filtered.sort((a, b) => a.id - b.id);
    
    grid.innerHTML = '';
    if (!filtered.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><p>Nenhuma aula encontrada.</p></div>';
        return;
    }
    
    const cards = filtered
        .map(lesson => _makeCardLessonV2(lesson))
        .filter(card => card !== null);
    
    if (!cards.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><p>Nenhuma aula corresponde aos filtros.</p></div>';
        return;
    }
    
    cards.forEach(card => grid.appendChild(card));
}

function _makeCardLessonV2(lesson) {
    const card = document.createElement('div');
    card.className = 'lesson-card-new';
    card.setAttribute('data-lesson-id', String(lesson.id));

    const progress = lessonProgressMap[lesson.id];

    // Estados: nova → aprendida (1ª conclusão) → dominada (100/100 frases)
    const learned   = !!(progress && progress.learned);
    const dominated = !!(progress && progress.dominated);
    const dominatedCount = Number((progress && progress.dominated_phrases_count) || 0);
    const totalPhrases   = Number((progress && progress.total_phrases_in_lesson) || 0);
    const quizErrorsCount = Number((progress && progress.quiz_errors_count) || 0);
    // alvo de exibição: 100 quando há banco completo; total atual quando ainda em construção
    const phraseTarget   = totalPhrases >= 100 ? 100 : Math.max(totalPhrases, 5);

    let status = 'new';
    if (dominated) status = 'dominated';
    else if (learned) status = 'learned';
    else if (progress && progress.correct_answers >= progress.total_questions && progress.total_questions > 0) status = 'learned';
    else if (progress) status = 'progress';

    if (dominated) card.classList.add('is-dominated');
    if (learned && !dominated) card.classList.add('is-learned');

    if (lessonsSearchTerm) {
        const searchMatch = lesson.title.toLowerCase().includes(lessonsSearchTerm) ||
                            (lesson.description && lesson.description.toLowerCase().includes(lessonsSearchTerm));
        if (!searchMatch) return null;
    }

    // mantém compatibilidade com filtro antigo: 'completed' = aprendida/dominada
    const filterMap = { 'completed': ['learned', 'dominated'], 'progress': ['progress'], 'new': ['new'] };
    if (lessonsStatusFilter !== 'all') {
        const allowed = filterMap[lessonsStatusFilter] || [lessonsStatusFilter];
        if (!allowed.includes(status)) return null;
    }

    let statusBadgeHTML = '';
    if (status === 'new') {
        statusBadgeHTML = '<span class="lesson-card-badge badge-new">🆕 Nova</span>';
    } else if (status === 'progress') {
        statusBadgeHTML = '<span class="lesson-card-badge badge-progress">⏳ Em Progresso</span>';
    } else if (status === 'learned') {
        statusBadgeHTML = '<span class="lesson-card-badge badge-learned">✓ Aprendida</span>';
    } else if (status === 'dominated') {
        statusBadgeHTML = '<span class="lesson-card-badge badge-dominated">★ Dominada</span>';
    }

    const diffBadgeHTML = quizErrorsCount > 0
        ? `<span class="lesson-card-badge badge-difficulty" title="${quizErrorsCount} questão${quizErrorsCount > 1 ? 'ões' : ''} com erro">📝 ${quizErrorsCount} erro${quizErrorsCount > 1 ? 's' : ''}</span>`
        : '';

    const levelBadge = lesson.level ? `<span class="lesson-card-badge badge-level">${lesson.level}</span>` : '';
    const story = lesson.content && lesson.content.story_context;
    const hook = story ? story : (lesson.description || (lesson.content && lesson.content.introduction) || 'Clique para começar');

    // Barra de progresso reflete contador de frases (X/100)
    const phrasePct = phraseTarget > 0 ? Math.min(100, Math.round((dominatedCount / phraseTarget) * 100)) : 0;
    const phraseProgressHTML = `
        <div class="lesson-card-progress">
            <div class="lesson-card-progress-bar">
                <div class="lesson-card-progress-fill ${dominated ? 'is-full' : ''}" style="width: ${phrasePct}%"></div>
            </div>
            <div class="lesson-card-progress-text">
                ${dominated
                    ? `<strong>★ DOMINADA</strong> · ${dominatedCount}/${phraseTarget}`
                    : `${dominatedCount}/${phraseTarget} frases`}
            </div>
        </div>
    `;

    card.innerHTML = `
        <div class="lesson-card-header">
            <span class="lesson-card-number">Aula ${lesson.id}</span>
            <div class="lesson-card-badges">${statusBadgeHTML}${diffBadgeHTML}${levelBadge}</div>
        </div>
        <h3 class="lesson-card-title">${escapeHtml(lesson.title)}</h3>
        <p class="lesson-card-intro">${escapeHtml(hook)}</p>
        ${phraseProgressHTML}
    `;

    card.onclick = () => openLessonDetail(lesson);
    return card;
}

function createLessonCard(lesson) {
    const card     = document.createElement('div');
    card.className = 'lesson-card';
    card.setAttribute('data-lesson-id', String(lesson.id));
    // Prefer story_context (narrative hook) → description → introduction as card preview
    const story    = lesson.content && lesson.content.story_context;
    const hook     = story
        ? story
        : (lesson.description || (lesson.content && lesson.content.introduction) || 'Sem descricao');
    // Show a cultural pill if the lesson has an insight
    const hasCultural = !!(lesson.content && lesson.content.cultural_insight);
    const culturalPill = hasCultural
        ? '<span class="lesson-card-cultural-pill">🌍 Cultura</span>'
        : '';
    const progress = lessonProgressMap[lesson.id];
    const levelBadge = lesson.level || 'A1';
    const scoreBadge = progress
        ? `<div class="lesson-card-score">\u2713 ${progress.correct_answers}/${progress.total_questions} acertos</div>`
        : '';
    card.innerHTML = `
        <div class="lesson-card-number">Aula ${lesson.id}</div>
        <div class="lesson-card-title">${escapeHtml(lesson.title)}</div>
        <div class="lesson-card-intro">${escapeHtml(hook)}</div>
        <div class="lesson-card-meta">
            <div class="lesson-card-badge">${escapeHtml(levelBadge)}</div>
            ${culturalPill}
        </div>
        ${scoreBadge}
    `;
    card.onclick = () => openLessonDetail(lesson);
    return card;
}

// ─── Lesson detail ────────────────────────────────────────────────────────────
function openLessonDetail(lesson) {
    currentLessonDetailV2 = lesson;
    document.getElementById('lessonsView').style.display      = 'none';
    document.getElementById('lessonDetailView').style.display = 'block';
    populateLessonDetail(lesson);
    trackLessonAccess(lesson.id);
    document.getElementById('lessonDetailView').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Mostra botão de exercício de voz se a aula tiver phrase bank populado
    const btnPV = document.getElementById('btnPhraseVoice');
    if (btnPV) {
        const total = (lessonProgressMap[lesson.id] && lessonProgressMap[lesson.id].total_phrases_in_lesson) || 0;
        // Se progresso não traz total ainda (aula nunca aberta), tenta exibir mesmo assim — fetch decidirá
        btnPV.style.display = '';
    }
}

function openPhraseVoiceFromCurrentLesson() {
    if (!currentLessonDetailV2 || typeof window.openPhraseVoiceTrainer !== 'function') return;
    window.openPhraseVoiceTrainer(currentLessonDetailV2.id, currentLessonDetailV2.title);
}
window.openPhraseVoiceFromCurrentLesson = openPhraseVoiceFromCurrentLesson;

function populateLessonDetail(lesson) {
    // Update hero section
    document.getElementById('lessonNumber').textContent    = `Aula ${lesson.id}`;
    document.getElementById('lessonTitleHero').textContent = lesson.title;
    const learningGoal = (lesson.content && lesson.content.learning_goal)
        || lesson.description
        || 'Ao final desta aula, você vai conseguir usar o conteúdo em frases simples.';
    document.getElementById('lessonObjective').textContent = learningGoal;

    // Category badges
    const badgesEl = document.getElementById('lessonCategoriesBadge');
    badgesEl.innerHTML = '';
    (lesson.categories || []).forEach(cat => {
        const b = document.createElement('span');
        b.className   = 'category-badge';
        b.textContent = toCategoryLabel(cat);
        badgesEl.appendChild(b);
    });

    // Populate tabs
    renderContextTab(lesson);
    renderGrammarTab(lesson);
    renderExamplesTab(lesson);
    renderExercisesTab(lesson);

    // Show context tab by default
    switchLessonTab('context');
}

function _setListBlock(listId, blockId, value) {
    const listEl  = document.getElementById(listId);
    const blockEl = document.getElementById(blockId);
    if (!listEl || !blockEl) return;
    if (!value || (Array.isArray(value) && !value.length)) {
        blockEl.style.display = 'none'; return;
    }
    const items = Array.isArray(value) ? value : [value];
    listEl.innerHTML = items.map(s => `<li>${escapeHtml(String(s))}</li>`).join('');
    blockEl.style.display = 'block';
}

// ─── Exercise Carousel ────────────────────────────────────────────────────────

/**
 * Resolve the correct option index from an exercise, handling two data formats:
 *   Format A (lessons 1-30):  { answer: "option text" }  — no integer index
 *   Format B (lessons 31-50): { correct: 1 }             — integer index directly
 */
function getCorrectIndex(exercise) {
    // Format B: integer index already present
    if (typeof exercise.correct === 'number' && exercise.correct >= 0) {
        return exercise.correct;
    }
    // Format A: match answer text against options (case-insensitive trim)
    if (exercise.answer && Array.isArray(exercise.options)) {
        const needle = exercise.answer.trim().toLowerCase();
        const idx = exercise.options.findIndex(
            opt => getExerciseOptionText(opt).trim().toLowerCase() === needle
        );
        if (idx >= 0) return idx;
    }
    return -1;
}

function getExerciseOptionText(option) {
    if (typeof option === 'string') return option;
    if (option && typeof option === 'object') {
        if (typeof option.label === 'string') return option.label;
        if (option.english_word && option.portuguese_word) {
            return `${option.english_word} = ${option.portuguese_word}`;
        }
    }
    return String(option ?? '');
}

function startExerciseCarousel(exercises) {
    carouselExercises    = exercises;
    carouselCurrentIndex = 0;
    carouselResults      = [];

    document.getElementById('exerciseSummaryScreen').style.display  = 'none';
    document.getElementById('exerciseCarouselCard').style.display   = 'block';
    document.getElementById('exerciseFeedback').style.display       = 'none';
    document.getElementById('exerciseActionRow').style.display      = 'flex';

    renderCurrentExercise();
}

function renderCurrentExercise() {
    const total    = carouselExercises.length;
    const idx      = carouselCurrentIndex;
    const exercise = carouselExercises[idx];

    carouselSelectedIndex = null;
    carouselAnswered      = false;

    document.getElementById('exerciseProgressIndicator').textContent =
        `Quest\u00e3o ${idx + 1} de ${total}`;
    document.getElementById('exerciseProgressBarFill').style.width =
        `${(idx / total) * 100}%`;

    const fb = document.getElementById('exerciseFeedback');
    fb.style.display = 'none';
    fb.className     = 'exercise-feedback-box';
    fb.innerHTML     = '';

    const confirmBtn = document.getElementById('btnConfirmExercise');
    const nextBtn    = document.getElementById('btnNextExercise');
    confirmBtn.style.display = 'inline-block';
    confirmBtn.disabled      = true;
    nextBtn.style.display    = 'none';
    nextBtn.textContent = (idx === total - 1) ? 'Ver Resultado \u2192' : 'Pr\u00f3xima Quest\u00e3o \u2192';

    const typeLabel = {
        multiple_choice: 'M\u00faltipla Escolha',
        fill_blank:      'Preencher Lacunas',
        translate:       'Tradu\u00e7\u00e3o',
        reorder_sentence:'Ordenar Frase',
        true_false:      'Verdadeiro ou Falso',
        matching:        'Associacao',
        vocabulary_match:'Associacao de Vocabulario'
    };

    const optionsHTML = (exercise.options || []).map((opt, i) =>
        `<div class="exercise-option"
              id="carousel-opt-${i}"
              onclick="selectCarouselOption(${i}, this)">${escapeHtml(getExerciseOptionText(opt))}</div>`
    ).join('');

    const ptHint = exercise.question_pt || '';
    document.getElementById('exerciseCarouselCard').innerHTML = `
        <div class="exercise-item">
            <div class="exercise-type">${typeLabel[exercise.type] || exercise.type}</div>
            ${ptHint ? `<p class="ex-pt-hint">${escapeHtml(ptHint)}</p>` : ''}
            <div class="exercise-question">${escapeHtml(exercise.question)}</div>
            <div class="exercise-options" id="carouselOptions">${optionsHTML}</div>
        </div>`;
}

function selectCarouselOption(optionIndex, element) {
    if (carouselAnswered) return;
    document.querySelectorAll('#carouselOptions .exercise-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    carouselSelectedIndex = optionIndex;
    document.getElementById('btnConfirmExercise').disabled = false;
}

function confirmExerciseAnswer() {
    if (carouselAnswered || carouselSelectedIndex === null) return;
    carouselAnswered = true;

    const exercise     = carouselExercises[carouselCurrentIndex];
    const correctIndex = getCorrectIndex(exercise);

    if (correctIndex < 0) {
        carouselResults.push(false);
        const fb = document.getElementById('exerciseFeedback');
        fb.className = 'exercise-feedback-box exercise-feedback-wrong';
        fb.innerHTML = '\u26a0 Nao foi possivel corrigir esta questao automaticamente. Vamos para a proxima.';
        fb.style.display = 'block';
        document.getElementById('btnConfirmExercise').style.display = 'none';
        document.getElementById('btnNextExercise').style.display    = 'inline-block';
        return;
    }

    const isCorrect    = carouselSelectedIndex === correctIndex;
    carouselResults.push(isCorrect);

    // Highlight options
    document.querySelectorAll('#carouselOptions .exercise-option').forEach((el, i) => {
        el.classList.add('disabled');
        if (i === correctIndex)                          el.classList.add('correct-answer');
        if (i === carouselSelectedIndex && !isCorrect)   el.classList.add('wrong-answer');
    });

    // Show feedback
    const fb          = document.getElementById('exerciseFeedback');

    if (isCorrect) {
        fb.className = 'exercise-feedback-box exercise-feedback-correct';
        fb.innerHTML = `✓ <strong>Correto!</strong>
            ${exercise.explanation
                ? `<div class="feedback-why-block"><strong>Você sabia?</strong> ${escapeHtml(exercise.explanation)}</div>`
                : ''}`.trim();
    } else {
        const correctText = (exercise.options && exercise.options[correctIndex])
            ? getExerciseOptionText(exercise.options[correctIndex]) : '';
        const chosenText = (exercise.options && exercise.options[carouselSelectedIndex])
            ? getExerciseOptionText(exercise.options[carouselSelectedIndex]) : '';
        fb.className = 'exercise-feedback-box exercise-feedback-wrong';
        fb.innerHTML = `✗ <strong>Incorreto.</strong>
            <div style="margin-top:6px;font-size:var(--font-size-sm)">Você escolheu: <span style="text-decoration:line-through;opacity:0.7">${escapeHtml(chosenText)}</span></div>
            <div style="font-size:var(--font-size-sm)">Resposta correta: <strong style="color:var(--text-primary)">${escapeHtml(correctText)}</strong></div>
            ${exercise.explanation
                ? `<div class="feedback-why-block"><strong>Por quê?</strong> ${escapeHtml(exercise.explanation)}</div>`
                : ''}`.trim();
    }
    fb.style.display = 'block';

    // Swap buttons
    document.getElementById('btnConfirmExercise').style.display = 'none';
    document.getElementById('btnNextExercise').style.display    = 'inline-block';

    // Send to backend (fire-and-forget — inclui is_correct para o painel de dificuldades)
    _submitExerciseToBackend(carouselCurrentIndex, carouselSelectedIndex, isCorrect).catch(() => {});
}

async function advanceExercise() {
    carouselCurrentIndex++;
    if (carouselCurrentIndex < carouselExercises.length) {
        document.getElementById('exerciseFeedback').style.display = 'none';
        renderCurrentExercise();
    } else {
        await renderExerciseSummary();
    }
}

async function renderExerciseSummary() {
    const total   = carouselExercises.length;
    const correct = carouselResults.filter(Boolean).length;
    const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;

    let message;
    if (pct === 100)      message = '\ud83c\udf89 Perfeito! Voc\u00ea acertou tudo!';
    else if (pct >= 70)   message = '\ud83d\udc4d Muito bom! Continue assim!';
    else if (pct >= 50)   message = '\ud83d\udcda Bom esfor\u00e7o! Revise e tente novamente.';
    else                  message = '\ud83d\udcaa Continue praticando! Voc\u00ea vai melhorar!';

    document.getElementById('exerciseCarouselCard').style.display = 'none';
    document.getElementById('exerciseFeedback').style.display     = 'none';
    document.getElementById('exerciseActionRow').style.display    = 'none';

    document.getElementById('exerciseProgressBarFill').style.width    = '100%';
    document.getElementById('exerciseProgressIndicator').textContent  = `${correct}/${total} corretas`;

    const nextId  = currentLessonDetailV2 ? (parseInt(currentLessonDetailV2.id, 10) + 1) : null;
    // hasNext: button shows for all lessons except the very last one in the loaded set
    const maxId   = lessonsDataV2.length > 0
        ? Math.max(...lessonsDataV2.map(l => parseInt(l.id, 10)))
        : 50;
    const hasNext = nextId !== null && nextId <= maxId;

    // Save progress to backend FIRST so XP data is ready
    _lastLessonXP = 0;
    if (currentLessonDetailV2) {
        await saveProgressToBackend(currentLessonDetailV2.id, correct, total);
    }

    const xpBadge = _lastLessonXP > 0
        ? `<div class="exercise-summary-xp">+${_lastLessonXP} XP conquistados!</div>`
        : '';

    const sumEl = document.getElementById('exerciseSummaryScreen');
    sumEl.innerHTML = `
        <div class="exercise-summary-score">${correct}/${total}</div>
        <div class="exercise-summary-label">${pct}% de acerto</div>
        ${xpBadge}
        <div class="exercise-summary-message">${message}</div>
        <div class="exercise-summary-actions">
            <button class="btn-retry-exercises" onclick="retryExercises()">Refazer Exerc\u00edcios</button>
            ${hasNext ? '<button class="btn-next-lesson-final" onclick="nextLesson()">Pr\u00f3xima Aula \u2192</button>' : ''}
        </div>`;
    sumEl.style.display = 'block';
}

function retryExercises() {
    startExerciseCarousel(carouselExercises);
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function backToLessonsView() {
    document.getElementById('lessonDetailView').style.display = 'none';
    document.getElementById('lessonsView').style.display      = 'block';
    currentLessonDetailV2 = null;
    displayLessonsGrid(currentCategoryFilterV2);
}

function nextLesson() {
    if (!currentLessonDetailV2) return;
    const nextId = parseInt(currentLessonDetailV2.id, 10) + 1;
    const next   = lessonsDataV2.find(l => parseInt(l.id, 10) === nextId);
    if (next) {
        openLessonDetail(next);
    } else {
        (window.showGriloToast || alert)('Voc\u00ea concluiu todas as aulas dispon\u00edveis. Parab\u00e9ns!', 'success');
        backToLessonsView();
    }
}

// ─── Backend fire-and-forget (individual exercise) ────────────────────────────
async function _submitExerciseToBackend(exerciseIndex, selectedIndex, isCorrect) {
    if (!currentLessonDetailV2) return;
    try {
        await fetch(`${API_BASE_URL}/api/lessons/${currentLessonDetailV2.id}/submit-exercise`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({
                exercise_index: exerciseIndex,
                selected_index: selectedIndex,
                is_correct: isCorrect,
                // retomar exato (hero da home): posição linear no carrossel
                exercise_position: carouselCurrentIndex + 1,
                total_exercises: carouselExercises.length || null,
            })
        });
    } catch (e) { /* ignore */ }
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function escapeHtml(text) {
    if (typeof text !== 'string') return String(text || '');
    return text.replace(/[&<>"']/g, m => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]
    ));
}

// ─── User Stats & Progress Dashboard ─────────────────────────────────────────
let _userStats = null;
const STANDALONE_PROGRESS_KEY = 'grilo_lesson_progress';
const STANDALONE_LESSON_SLUGS = [
    'pronomes',
    'perguntas',
    'negativa',
    'passado',
    'futuro',
    'gerundio',
    'preposicoes',
    'verbos'
];

function getStandaloneLessonsSummary() {
    try {
        const raw = localStorage.getItem(STANDALONE_PROGRESS_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        const completed = STANDALONE_LESSON_SLUGS.filter(
            (slug) => parsed?.[slug]?.completed && !parsed?.[slug]?.backendSynced
        ).length;
        const visited = STANDALONE_LESSON_SLUGS.filter((slug) => parsed?.[slug]?.visited).length;

        return {
            total: STANDALONE_LESSON_SLUGS.length,
            completed,
            visited,
        };
    } catch (e) {
        return {
            total: STANDALONE_LESSON_SLUGS.length,
            completed: 0,
            visited: 0,
        };
    }
}

function mergeStandaloneLessonsIntoStats(stats) {
    const base = stats || {};
    const standalone = getStandaloneLessonsSummary();
    const mergedLessonsCompleted = (base.lessons_completed || 0) + standalone.completed;
    const mergedTotalLessons = (base.total_lessons || 0) + standalone.total;

    return {
        ...base,
        standalone_lessons_completed: standalone.completed,
        standalone_lessons_visited: standalone.visited,
        standalone_total_lessons: standalone.total,
        lessons_completed: mergedLessonsCompleted,
        total_lessons: mergedTotalLessons,
    };
}

async function loadUserStats() {
    if (!authToken) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/user/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success) return;
        _userStats = data;
        window._lastUserStats = data;
        renderProgressDetail(data);
        loadUserActivity();
        loadUserDifficulties();
    } catch (e) { console.error('[STATS]', e); }
}

// ── Pendência: revisar dificuldades · desafio da semana ──
async function loadUserDifficulties() {
    const row = document.getElementById('pendDif');
    if (!row || !authToken) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/difficulties/summary`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) { row.hidden = true; return; }
        const data = await res.json();
        if (!data.success) { row.hidden = true; return; }
        renderPendDif(data);
        window._lastDifficulties = data;
    } catch (e) {
        console.error('[DIFFICULTIES]', e);
        const rowEl = document.getElementById('pendDif');
        if (rowEl) rowEl.hidden = true;
    }
}

function renderPendDif(data) {
    const row   = document.getElementById('pendDif');
    const ico   = document.getElementById('pendDifIco');
    const title = document.getElementById('pendDifTitle');
    const sub   = document.getElementById('pendDifSub');
    if (!row) return;

    const pool   = data.pool || { voice: 0, quiz: 0, shadow: 0, total: 0 };
    const weekly = Number(data.weekly_count || 0);
    const target = Number(data.weekly_target || 7);
    const done   = Boolean(data.week_completed);
    const days   = Number(data.days_left_in_week || 0);

    // Semana completa → Modo Desafiado (informativo, não clicável)
    if (done) {
        row.hidden = false;
        row.disabled = true;
        row.classList.add('pend-row-locked');
        if (ico) ico.textContent = '🔒';
        if (title) title.textContent = 'Modo Desafiado — semana completa';
        if (sub) sub.textContent = days === 1
            ? 'Você superou suas dificuldades. Reset em 1 dia.'
            : `Você superou suas dificuldades. Reset em ${days} dias.`;
        return;
    }

    row.disabled = false;
    row.classList.remove('pend-row-locked');
    if (ico) ico.textContent = '⟳';

    // Sem dificuldades acumuladas → a linha some, a tela encolhe
    if (pool.total === 0) {
        row.hidden = true;
        return;
    }

    row.hidden = false;
    if (title) title.textContent = pool.total === 1
        ? 'Revisar 1 frase difícil'
        : `Revisar ${pool.total} frases difíceis`;
    if (sub) sub.textContent = `Desafio da semana: ${Math.min(weekly, target)} de ${target} · termina domingo · ≈ 5 min`;
}

// Linha de pendência — abre o modal de sessão de dificuldades
document.addEventListener('click', (ev) => {
    const cta = ev.target.closest('#pendDif');
    if (!cta || cta.disabled) return;
    if (window.openDifficultiesSession) {
        window.openDifficultiesSession({
            onClose: (result) => {
                // Recarrega o painel após qualquer fechamento (acertos contam mesmo abandonando)
                loadUserDifficulties();
            }
        });
    } else {
        console.warn('[DIFFICULTIES] openDifficultiesSession indisponível');
    }
});

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

window.loadUserDifficulties = loadUserDifficulties;

async function loadUserActivity() {
    if (!authToken) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/user/activity`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
            window._lastActivity = data.activity || {};
            renderWeekStrip(window._lastActivity);
        }
    } catch (e) { console.error('[ACTIVITY]', e); }
}

// Faixa "Sua semana": 7 círculos seg→dom, marcando dias com qualquer atividade
function renderWeekStrip(activity) {
    const container = document.getElementById('weekStrip');
    if (!container) return;
    const act = activity || {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dow = (today.getDay() + 6) % 7; // 0=segunda
    const monday = new Date(today);
    monday.setDate(today.getDate() - dow);

    const LETTERS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    let activeCount = 0;
    let html = '';
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dayAct = act[ds];
        const isActive = !!(dayAct && dayAct.total > 0);
        const isToday = d.getTime() === today.getTime();
        const isFuture = d.getTime() > today.getTime();
        if (isActive) activeCount++;

        const classes = ['week-day'];
        if (isActive) classes.push('done');
        if (isToday) classes.push('today');
        if (isFuture) classes.push('future');
        html += `<span class="${classes.join(' ')}">${isActive ? '✓' : LETTERS[i]}</span>`;
    }
    container.innerHTML = html;

    const count = document.getElementById('weekStripCount');
    if (count) count.textContent = `${activeCount} de 7 dias`;
}

function showProgressDetail() {
    if (!_userStats) return;
    renderProgressDetail(_userStats);
}

function hideProgressDetail() {
    // no-op (kept for compatibility; overlay removed)
}

function renderProgressDetail(stats) {
    const mergedStats = mergeStandaloneLessonsIntoStats(stats);

    // Legacy IDs that may still exist on other pages/tabs
    if (document.getElementById('progressAccuracyValue')) {
        _pd('progressAccuracyValue', `${mergedStats.avg_lesson_accuracy}%`);
    }
    if (document.getElementById('pdLessons')) _pd('pdLessons', mergedStats.lessons_completed);
    if (document.getElementById('pdLevel')) _pd('pdLevel', mergedStats.level);
    if (document.getElementById('pdConversations')) _pd('pdConversations', mergedStats.total_conversations);
    if (document.getElementById('pdWriting') && mergedStats.writing_accuracy_avg != null) {
        _pd('pdWriting', `${mergedStats.writing_accuracy_avg}%`);
    }
    const grammarEl = document.getElementById('pdGrammarArea');
    if (grammarEl) grammarEl.textContent = mergedStats.top_grammar_area || '--';

    // ─────────── RAMPA (pl2-*) ───────────
    _renderHero(stats, mergedStats);
    _renderSidebar(stats);
}

// ─────────── RAMPA: lateral "Seu progresso" (read-only) ───────────
function _renderSidebar(stats) {
    _renderPhonemeCard(stats.top_phoneme);
    _renderCefrCard(stats.cefr);
    _renderVocabCard(stats.vocab_mastered_total, stats.vocab_mastered_week);
    _renderBadgeCard(stats.next_badge, stats.badges_earned_count);
}

function _renderPhonemeCard(topPhoneme) {
    const card = document.getElementById('sidePhoneme');
    if (!card) return;
    if (!topPhoneme) {
        card.hidden = true;
        return;
    }
    card.hidden = false;
    _pd('sidePhonemeGlyph', topPhoneme.symbol || '—');
    const bodyEl = document.getElementById('sidePhonemeBody');
    if (bodyEl) {
        const occ = topPhoneme.occurrences || 0;
        bodyEl.innerHTML = `O som <b>${_escape(topPhoneme.symbol || '')}</b> apareceu <b>${occ} ${occ === 1 ? 'vez' : 'vezes'}</b> nas suas últimas sessões de voz — é seu ponto mais frequente de tropeço.`;
    }
}

function _renderCefrCard(cefr) {
    const info = cefr || { current: 'A1', next: 'A2', progress_percent: 0 };
    _pd('sideCefrCurrent', info.current || 'A1');
    _pd('sideCefrNext', info.next || 'A2');
    _pd('sideCefrPct', info.progress_percent || 0);
    const fillEl = document.getElementById('sideCefrFill');
    if (fillEl) fillEl.style.width = `${info.progress_percent || 0}%`;
}

function _renderVocabCard(total, week) {
    _pd('sideVocabNum', total || 0);
    const deltaEl = document.getElementById('sideVocabDelta');
    if (deltaEl) {
        if (week > 0) {
            deltaEl.hidden = false;
            deltaEl.textContent = `▲ +${week} nesta semana`;
        } else {
            deltaEl.hidden = true;
        }
    }
}

function _renderBadgeCard(nextBadge, earnedCount) {
    const iconEl = document.getElementById('sideBadgeIcon');
    const nameEl = document.getElementById('sideBadgeName');
    const descEl = document.getElementById('sideBadgeDesc');
    const fillEl = document.getElementById('sideBadgeFill');
    const labelEl = document.getElementById('sideBadgeLabel');
    const earned = earnedCount || 0;

    if (nextBadge) {
        if (iconEl) iconEl.textContent = nextBadge.icon || '🎖';
        if (nameEl) nameEl.textContent = nextBadge.name || 'Próxima conquista';
        if (descEl) descEl.textContent = nextBadge.description || '';
        if (fillEl) fillEl.style.width = `${nextBadge.progress_percent || 0}%`;
        if (labelEl) labelEl.textContent = `${nextBadge.xp_current || 0} / ${nextBadge.xp_required || 0} XP`;
        return;
    }

    if (iconEl) iconEl.textContent = '✨';
    if (nameEl) nameEl.textContent = earned > 0 ? 'Todas conquistadas' : 'Primeira conquista a caminho';
    if (descEl) {
        descEl.textContent = earned > 0
            ? 'Você desbloqueou todas as medalhas disponíveis.'
            : 'Continue praticando para desbloquear sua primeira medalha.';
    }
    if (fillEl) fillEl.style.width = earned > 0 ? '100%' : '0%';
    if (labelEl) labelEl.textContent = '';
}

function _greetByHour() {
    const h = new Date().getHours();
    if (h < 5)  return 'Boa madrugada';
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
}

function _kickerDate() {
    const WD = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const M = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const d = new Date();
    return `${WD[d.getDay()]}, ${d.getDate()} de ${M[d.getMonth()]}`;
}

function _renderHero(stats, mergedStats) {
    const profile = stats.profile || {};
    const username = (profile.username || '').split(/[\s.@]/)[0] || '';

    const kickerEl = document.getElementById('pl2HeroKicker');
    if (kickerEl) kickerEl.textContent = _kickerDate();

    const greetEl = document.getElementById('pl2HeroGreet');
    if (greetEl) {
        const greet = _greetByHour();
        greetEl.innerHTML = username
            ? `${greet}, <span class="pl2-italic">${_escape(username)}</span>.`
            : `${greet}.`;
    }

    const subEl = document.getElementById('pl2HeroSub');
    if (subEl) {
        const streak = mergedStats.streak || 0;
        const lessons = mergedStats.lessons_completed || 0;
        if (streak > 0) {
            subEl.textContent = `Sua sequência está em ${streak} dia${streak === 1 ? '' : 's'} — dez minutos hoje e ela vira ${streak + 1}.`;
        } else if (lessons > 0) {
            subEl.textContent = `Você já concluiu ${lessons} aula${lessons === 1 ? '' : 's'}. Dez minutos hoje recomeçam sua sequência.`;
        } else {
            subEl.textContent = 'Comece com uma aula curta — dez minutos bastam.';
        }
    }

    // Herói: continuar de onde parou
    const resume = stats.resume_lesson;
    const titleEl = document.getElementById('pl2HeroTitle');
    const resumeMeta = document.getElementById('pl2HeroResumeMeta');
    const resumeLink = document.getElementById('pl2HeroResume');
    if (resume) {
        if (titleEl) titleEl.textContent = `Aula ${resume.lesson_id} · ${resume.title}`;
        if (resumeMeta) {
            // Retomar exato quando o backend souber a posição; senão, % dominada
            if (resume.last_exercise_index && resume.total_exercises) {
                resumeMeta.textContent = `Você parou no exercício ${resume.last_exercise_index} de ${resume.total_exercises}`;
            } else {
                resumeMeta.textContent = `${resume.dominated}% dominada`;
            }
        }
        if (resumeLink) resumeLink.href = `lessons.html?lesson=${resume.lesson_id}`;
    } else {
        if (titleEl) titleEl.textContent = 'Começar sua primeira aula';
        if (resumeMeta) resumeMeta.textContent = 'Aulas curtas de ~10 minutos, do zero.';
        if (resumeLink) resumeLink.href = 'lessons.html';
    }
}


function _escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}

function _pd(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function _modeLabelPt(mode) {
    const map = {
        guided: 'Guiado',
        free: 'Livre',
        shadow: 'Repeticao',
        dictation: 'Ditado'
    };
    return map[mode] || mode;
}

if (!window.__griloStandaloneProgressListenerBound) {
    window.__griloStandaloneProgressListenerBound = true;
    window.addEventListener('storage', (event) => {
        if (event.key !== STANDALONE_PROGRESS_KEY) return;
        updateLessonsProgress();
        if (typeof authToken !== 'undefined' && authToken) {
            loadUserStats();
            return;
        }
        if (_userStats) {
            renderProgressDetail(_userStats);
        }
    });
}

// ─── Global exports ────────────────────────────────────────────────────────────

// ─── LESSON TABS SYSTEM (NEW) ─────────────────────────────────────────────────
function switchLessonTab(tabName) {
    document.querySelectorAll('.lesson-tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.lesson-tab-btn').forEach(b => b.classList.remove('active'));
    const tabEl = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (tabEl) tabEl.classList.add('active');
    const btnEl = document.querySelector(`.lesson-tab-btn[data-tab="${tabName}"]`);
    if (btnEl) btnEl.classList.add('active');
}

function renderContextTab(lesson) {
    const container = document.getElementById('tabContext');
    const content = lesson.content || {};
    let html = '';

    // Real-world scenario banner (most immersive — comes first)
    if (content.real_world_scenario) {
        html += `<div class="context-card scenario-card">
            <div class="context-subtitle">🎬 Cenário Real</div>
            <p class="context-text">${escapeHtml(content.real_world_scenario)}</p>
        </div>`;
    }

    // Story context (narrative hook from Alex's journey)
    if (content.story_context) {
        html += `<div class="context-card"><div class="context-subtitle">📖 Cena da Aula</div><p class="context-text">${escapeHtml(content.story_context)}</p></div>`;
    }

    // Why it matters — motivational framing
    if (content.why_it_matters) {
        html += `<div class="context-card why-it-matters-card">
            <div class="context-subtitle">💡 Por que isso importa?</div>
            <p class="context-text">${escapeHtml(content.why_it_matters)}</p>
        </div>`;
    }

    // Cultural insight
    if (content.cultural_insight) {
        html += `<div class="context-card" style="background: linear-gradient(135deg, #f9fafb, #f3f4f6);"><div class="context-subtitle">🌍 Contexto Cultural</div><p class="context-text">${escapeHtml(content.cultural_insight)}</p></div>`;
    }

    // Pronunciation tip
    if (content.pronunciation_tip) {
        html += `<div class="context-card pronunciation-card">
            <div class="context-subtitle">🔊 Como pronunciar</div>
            <p class="context-text">${escapeHtml(content.pronunciation_tip)}</p>
        </div>`;
    }

    if (!html) html = '<p style="color: var(--text-secondary); font-style: italic;">Nenhum contexto disponível.</p>';
    container.innerHTML = html;
}

function renderGrammarTab(lesson) {
    const container = document.getElementById('tabGrammar');
    const content = lesson.content || {};
    let html = '';
    if (content.introduction) html += `<p style="margin-bottom: var(--spacing-md); line-height: 1.6;">${escapeHtml(content.introduction)}</p>`;
    if (content.explanation) html += `<p style="margin-bottom: var(--spacing-md); line-height: 1.6;">${escapeHtml(content.explanation)}</p>`;
    const notes = content.notes || [];
    if (notes && notes.length > 0) {
        html += `<table class="contrast-table"><thead><tr><th>Conceito / Erro</th></tr></thead><tbody>`;
        notes.forEach(note => html += `<tr><td>${escapeHtml(String(note))}</td></tr>`);
        html += `</tbody></table>`;
    }
    // Common mistakes block (Brazilian-specific errors)
    if (content.common_mistakes && content.common_mistakes.length > 0) {
        html += `<div class="common-mistakes-box"><div class="common-mistakes-title">⚠️ Erros Comuns de Brasileiros</div><ul class="common-mistakes-list">`;
        content.common_mistakes.forEach(m => html += `<li>${escapeHtml(String(m))}</li>`);
        html += `</ul></div>`;
    }
    if (content.pro_tips && content.pro_tips.length > 0) {
        html += `<div class="pro-tips-box"><div class="pro-tips-title">Pro Tips: Dicas de Ouro</div><ul class="pro-tips-list">`;
        content.pro_tips.forEach(tip => html += `<li>${escapeHtml(String(tip))}</li>`);
        html += `</ul></div>`;
    }
    if (!html) html = '<p style="color: var(--text-secondary); font-style: italic;">Nenhuma informação gramatical.</p>';
    container.innerHTML = html;
}

function renderExamplesTab(lesson) {
    const container = document.getElementById('tabExamples');
    const content = lesson.content || {};
    let html = '';
    if (content.vocabulary && content.vocabulary.length > 0) {
        html += '<h4 style="margin-bottom: var(--spacing-md); font-weight: 700;">Vocabulário</h4><div class="vocabulary-grid">';
        content.vocabulary.forEach(v => {
            html += `<div class="vocab-card"><div class="vocab-word">${escapeHtml(v.word)}</div><div class="vocab-translation">${escapeHtml(v.translation)}</div>${v.example ? `<div class="vocab-example">Ex: ${escapeHtml(v.example)}</div>` : ''}</div>`;
        });
        html += '</div>';
    }
    if (content.examples && content.examples.length > 0) {
        html += '<h4 style="margin-bottom: var(--spacing-md); margin-top: var(--spacing-lg); font-weight: 700;">Exemplos</h4><div class="examples-column">';
        content.examples.forEach(ex => {
            html += `<div class="example-card"><div class="example-english">"${escapeHtml(ex.english)}"</div><div class="example-portuguese">${escapeHtml(ex.portuguese)}</div></div>`;
        });
        html += '</div>';
    }
    if (!html) html = '<p style="color: var(--text-secondary); font-style: italic;">Nenhum exemplo.</p>';
    container.innerHTML = html;
}

function renderExercisesTab(lesson) {
    const container = document.getElementById('tabExercises');
    const content = lesson.content || {};
    const exercises = content.exercises || [];
    if (exercises && exercises.length > 0) {
        const html = `
            <div class="exercise-carousel-header">
                <h3>Exercícios Práticos</h3>
                <div class="exercise-progress-indicator" id="exerciseProgressIndicator">Questão 1 de 1</div>
            </div>
            <div class="exercise-progress-bar-track"><div class="exercise-progress-bar-fill" id="exerciseProgressBarFill"></div></div>
            <div id="exerciseCarouselCard"></div>
            <div id="exerciseFeedback" class="exercise-feedback-box" style="display:none;"></div>
            <div class="exercise-action-row" id="exerciseActionRow">
                <button class="btn-confirm-exercise" id="btnConfirmExercise" onclick="confirmExerciseAnswer()">Confirmar</button>
                <button class="btn-next-exercise" id="btnNextExercise" onclick="advanceExercise()" style="display:none;">Próxima Questão →</button>
            </div>
            <div id="exerciseSummaryScreen" class="exercise-summary-screen" style="display:none;"></div>`;
        container.innerHTML = html;
        startExerciseCarousel(exercises);
    } else {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">Nenhum exercício.</p>';
    }
}

window.showLessonsView         = showLessonsView;
window.filterLessonsByCategory = filterLessonsByCategory;
window.openLessonDetail        = openLessonDetail;
window.backToLessonsView       = backToLessonsView;
window.nextLesson              = nextLesson;
window.selectCarouselOption    = selectCarouselOption;
window.confirmExerciseAnswer   = confirmExerciseAnswer;
window.advanceExercise         = advanceExercise;
window.retryExercises          = retryExercises;
window.showProgressDetail      = showProgressDetail;
window.hideProgressDetail      = hideProgressDetail;
window.loadUserStats           = loadUserStats;
window.loadUserActivity        = loadUserActivity;
window.renderWeekStrip         = renderWeekStrip;

// ─── LESSONS VIEW FILTERS & SEARCH ────────────────────────────────────────────
let lessonsSearchTerm = '';
let lessonsStatusFilter = 'all';

function filterLessonsBySearch(term) {
    lessonsSearchTerm = term.toLowerCase();
    displayLessonsGrid(currentCategoryFilterV2);
}

function filterLessonsByStatus(status) {
    lessonsStatusFilter = status;
    document.querySelectorAll('.lessons-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === status);
    });
    displayLessonsGrid(currentCategoryFilterV2);
}

function updateLessonsProgress() {
    const standalone = getStandaloneLessonsSummary();
    const completed = Object.keys(lessonProgressMap || {}).length + standalone.completed;
    const total = 50 + standalone.total;
    const percent = (completed / total) * 100;
    const countEl = document.getElementById('lessonsProgressCount');
    const fillEl = document.getElementById('lessonsProgressBarFill');
    if (countEl) countEl.textContent = `${completed}/${total} aulas`;
    if (fillEl) fillEl.style.width = `${percent}%`;
}

window.switchLessonTab         = switchLessonTab;
window.renderContextTab        = renderContextTab;
window.renderGrammarTab        = renderGrammarTab;
window.renderExamplesTab       = renderExamplesTab;
window.renderExercisesTab      = renderExercisesTab;
window.filterLessonsBySearch   = filterLessonsBySearch;
window.filterLessonsByStatus   = filterLessonsByStatus;
window.updateLessonsProgress   = updateLessonsProgress;
