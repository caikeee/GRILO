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
        const res = await fetch(`${API_BASE}/api/lessons/all`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) { const data = await res.json(); lessonsDataV2 = data.lessons || []; return true; }
    } catch (e) { console.error('[LESSONS-V2]', e); }
    return false;
}

async function loadCategoriesV2() {
    try {
        const res = await fetch(`${API_BASE}/api/lessons/categories`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) { const data = await res.json(); allCategories = data.categories || []; return true; }
    } catch (e) { console.error('[LESSONS-V2]', e); }
    return false;
}

async function loadLessonProgress() {
    try {
        const res = await fetch(`${API_BASE}/api/lessons/progress`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) { const data = await res.json(); lessonProgressMap = data.progress || {}; }
    } catch (e) { console.error('[LESSONS-V2] Progress load error:', e); }
}

async function saveProgressToBackend(lessonId, correctAnswers, totalQuestions) {
    try {
        const res = await fetch(`${API_BASE}/api/lessons/${lessonId}/save-progress`, {
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
    document.querySelectorAll('.lessons-cat-tab').forEach(tab => {
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
    
    const progress = lessonProgressMap[lesson.id];
    let status = 'new';
    if (progress && progress.correct_answers === progress.total_questions) {
        status = 'completed';
    } else if (progress) {
        status = 'progress';
    }
    
    if (lessonsSearchTerm) {
        const searchMatch = lesson.title.toLowerCase().includes(lessonsSearchTerm) ||
                            (lesson.description && lesson.description.toLowerCase().includes(lessonsSearchTerm));
        if (!searchMatch) return null;
    }
    
    if (lessonsStatusFilter !== 'all' && lessonsStatusFilter !== status) {
        return null;
    }
    
    let statusBadgeHTML = '';
    if (status === 'new') {
        statusBadgeHTML = '<span class="lesson-card-badge badge-new">🆕 Novo</span>';
    } else if (status === 'progress') {
        statusBadgeHTML = '<span class="lesson-card-badge badge-progress">⏳ Em Progresso</span>';
    } else if (status === 'completed') {
        statusBadgeHTML = '<span class="lesson-card-badge badge-completed">✓ Completo</span>';
    }
    
    const levelBadge = lesson.level ? `<span class="lesson-card-badge badge-level">${lesson.level}</span>` : '';
    const story = lesson.content && lesson.content.story_context;
    const hook = story ? story : (lesson.description || (lesson.content && lesson.content.introduction) || 'Clique para começar');
    
    let progressBarHTML = '';
    if (progress && progress.total_questions) {
        const pct = Math.round((progress.correct_answers / progress.total_questions) * 100);
        progressBarHTML = `
            <div class="lesson-card-progress">
                <div class="lesson-card-progress-bar">
                    <div class="lesson-card-progress-fill" style="width: ${pct}%"></div>
                </div>
                <div class="lesson-card-progress-text">${progress.correct_answers}/${progress.total_questions} acertos</div>
            </div>
        `;
    } else {
        progressBarHTML = `<div class="lesson-card-progress"><div class="lesson-card-progress-text">Não iniciado</div></div>`;
    }
    
    card.innerHTML = `
        <div class="lesson-card-header">
            <span class="lesson-card-number">Aula ${lesson.id}</span>
            <div class="lesson-card-badges">${statusBadgeHTML}${levelBadge}</div>
        </div>
        <h3 class="lesson-card-title">${escapeHtml(lesson.title)}</h3>
        <p class="lesson-card-intro">${escapeHtml(hook)}</p>
        ${progressBarHTML}
    `;
    
    card.onclick = () => openLessonDetail(lesson);
    return card;
}

function createLessonCard(lesson) {
    const card     = document.createElement('div');
    card.className = 'lesson-card';
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
    document.getElementById('lessonDetailView').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function populateLessonDetail(lesson) {
    // Update hero section
    document.getElementById('lessonNumber').textContent    = `Aula ${lesson.id}`;
    document.getElementById('lessonTitleHero').textContent = lesson.title;
    const learningGoal = (lesson.content && lesson.content.learning_goal)
        || lesson.description
        || 'Ao final desta aula, voce conseguira usar o conteudo em frases simples.';
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

    // Send to backend (fire-and-forget)
    _submitExerciseToBackend(carouselCurrentIndex, carouselSelectedIndex).catch(() => {});
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
        alert('Parab\u00e9ns! Voc\u00ea completou todas as aulas dispon\u00edveis!');
        backToLessonsView();
    }
}

// ─── Backend fire-and-forget (individual exercise) ────────────────────────────
async function _submitExerciseToBackend(exerciseIndex, selectedIndex) {
    if (!currentLessonDetailV2) return;
    try {
        await fetch(`${API_BASE}/api/lessons/${currentLessonDetailV2.id}/submit-exercise`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ exercise_index: exerciseIndex, selected_index: selectedIndex })
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

async function loadUserStats() {
    if (!authToken) return;
    try {
        const res = await fetch(`${API_BASE}/api/user/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success) return;
        _userStats = data;
        window._lastUserStats = data;
        renderProgressDetail(data);
        loadUserActivity();
    } catch (e) { console.error('[STATS]', e); }
}

async function loadUserActivity() {
    if (!authToken) return;
    try {
        const res = await fetch(`${API_BASE}/api/user/activity`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
            window._lastActivity = data.activity;
            renderActivityHeatmap(data.activity);
        }
    } catch (e) { console.error('[ACTIVITY]', e); }
}

function renderActivityHeatmap(activity) {
    const container = document.getElementById('activityHeatmap');
    if (!container) return;

    const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const DAY_LABELS  = ['Dom','','Ter','','Qui','','Sáb'];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();

    // Span the full calendar year, padded to full Sun–Sat weeks
    const jan1 = new Date(year, 0, 1);
    const start = new Date(jan1);
    start.setDate(start.getDate() - start.getDay());

    const dec31 = new Date(year, 11, 31);
    const end = new Date(dec31);
    end.setDate(end.getDate() + (6 - end.getDay()));

    // Build weeks
    const weeks = [];
    const d = new Date(start);
    while (d <= end) {
        const week = [];
        for (let i = 0; i < 7; i++) {
            const inYear = d.getFullYear() === year;
            const isFuture = d > today;
            const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            week.push({ ds, inYear, isFuture, day: d.getDate(), month: d.getMonth(), dateObj: new Date(d) });
            d.setDate(d.getDate() + 1);
        }
        weeks.push(week);
    }

    // Month labels at first week the 1st falls in-year
    const monthAt = {};
    weeks.forEach((week, wi) => {
        week.forEach(cell => { if (cell.inYear && cell.day === 1) monthAt[wi] = MONTH_NAMES[cell.month]; });
    });

    let html = '<div class="hm-wrap">';

    // Month row
    html += '<div class="hm-months"><div class="hm-day-spacer"></div>';
    weeks.forEach((_, wi) => {
        html += `<div class="hm-mcol">${monthAt[wi] || ''}</div>`;
    });
    html += '</div>';

    // Main area: day labels + grid
    html += '<div class="hm-main">';
    html += '<div class="hm-days">' + DAY_LABELS.map(l => `<div class="hm-dlbl">${l}</div>`).join('') + '</div>';
    html += '<div class="hm-grid">';
    weeks.forEach(week => {
        html += '<div class="hm-col">';
        week.forEach(({ ds, inYear, isFuture, dateObj }) => {
            if (!inYear) {
                html += '<div class="hm-cell lv-f"></div>';
                return;
            }
            if (isFuture) {
                html += '<div class="hm-cell lv-f"></div>';
                return;
            }

            // Resolve activity data (new: object, legacy: number)
            const raw = activity[ds];
            let total = 0, lessons = 0, chats = 0, voices = 0;
            if (raw && typeof raw === 'object') {
                total   = raw.total   || 0;
                lessons = raw.lesson  || 0;
                chats   = raw.chat    || 0;
                voices  = raw.voice   || 0;
            } else if (typeof raw === 'number') {
                total = raw;
            }

            const lvl = total === 0 ? 'lv-0'
                      : total <= 2  ? 'lv-1'
                      : total <= 5  ? 'lv-2'
                                    : 'lv-3';

            // Build tooltip
            let tip = '';
            const fmtDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            if (total > 0) {
                const parts = [];
                if (lessons > 0) parts.push(`${lessons} aula${lessons !== 1 ? 's' : ''}`);
                if (chats   > 0) parts.push(`${chats} msg`);
                if (voices  > 0) parts.push(`${voices} sessão${voices !== 1 ? 'ões' : ''} de voz`);
                tip = `${fmtDate}  ${parts.length ? parts.join(' · ') : total + ' atividades'}`;
            } else {
                tip = `${fmtDate}  sem atividade`;
            }

            html += `<div class="hm-cell ${lvl}" data-tip="${tip}"></div>`;
        });
        html += '</div>';
    });
    html += '</div></div></div>';

    container.innerHTML = html;
}

function showProgressDetail() {
    if (!_userStats) return;
    renderProgressDetail(_userStats);
}

function hideProgressDetail() {
    // no-op (kept for compatibility; overlay removed)
}

function renderProgressDetail(stats) {
    const avgVoice = stats.avg_voice_quality != null ? `${stats.avg_voice_quality}%` : '--';
    _pd('progressAccuracyValue', `${stats.avg_lesson_accuracy}%`);
    _pd('pdVoiceScore', avgVoice);
    _pd('pdLevel',        stats.level);
    _pd('pdLessons',      stats.lessons_completed);
    _pd('pdXP',           stats.total_xp);
    _pd('pdStreak',       stats.streak);
    _pd('pdConversations',stats.total_conversations);
    _pd('pdTextMessages', stats.text_messages_sent != null ? stats.text_messages_sent : '--');

    const vm = stats.voice_minutes ?? 0;
    _pd('pdVoiceTime', vm > 0 ? `${vm} min` : '--');
    _pd('pdVoiceMinutes', vm > 0 ? `${vm} min` : '--');
    _pd('pdVoiceSessions', stats.voice_sessions_count != null ? stats.voice_sessions_count : '--');
    _pd('pdVoiceExchanges', stats.total_voice_exchanges != null ? stats.total_voice_exchanges : '--');
    _pd('pdVoiceCorrections', stats.total_voice_corrections != null ? stats.total_voice_corrections : '--');
    _pd('pdChallenge', `${stats.challenge_days_completed || 0}/7`);
    _pd('pdChallengeDays', stats.challenge_days_completed != null ? stats.challenge_days_completed : '--');
    _pd('pdBestQuality', stats.best_voice_quality != null ? `${stats.best_voice_quality}%` : '--');
    _pd('pdLastQuality', stats.last_voice_quality != null ? `${stats.last_voice_quality}%` : '--');

    const unlockedModes = (stats.voice_modes_unlocked || []).map(_modeLabelPt);
    _pd('pdUnlockedModes', unlockedModes.length ? unlockedModes.join(' · ') : 'Guiado');

    const nextUnlockEl = document.getElementById('pdNextUnlock');
    if (nextUnlockEl) {
        if (stats.next_mode_unlock) {
            nextUnlockEl.textContent = `${_modeLabelPt(stats.next_mode_unlock.mode)}: ${stats.next_mode_unlock.requires}`;
        } else {
            nextUnlockEl.textContent = 'Todos os modos desbloqueados';
        }
    }

    const challengeBar = document.getElementById('voiceChallengeBar');
    if (challengeBar) {
        challengeBar.style.width = `${stats.challenge_completion_percent || 0}%`;
    }

    const challengeLabel = document.getElementById('voiceChallengeLabel');
    if (challengeLabel) {
        challengeLabel.textContent = `${stats.challenge_days_completed || 0} de 7 dias ativos nesta semana`;
    }

    if (stats.writing_accuracy_avg != null) {
        _pd('pdWriting', `${stats.writing_accuracy_avg}%`);
    }

    const grammarEl = document.getElementById('pdGrammarArea');
    if (grammarEl) grammarEl.textContent = stats.top_grammar_area || '--';

    const bar = document.getElementById('pdLessonsBar');
    if (bar) bar.style.width = `${(stats.lessons_completed / stats.total_lessons) * 100}%`;
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
window.renderActivityHeatmap   = renderActivityHeatmap;

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
    const completed = lessonsDataV2.filter(l => lessonProgressMap[l.id]).length;
    const total = 50;
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
