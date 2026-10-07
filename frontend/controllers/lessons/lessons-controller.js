/**
 * HOME PANEL CONTROLLER
 * Painel "Meu Painel" da home: stats, CEFR, vocabulário, semana, dificuldades.
 * A Trilha A1 clássica (grid de aulas, carrossel de exercícios) foi removida —
 * o sistema de lições agora vive em lessons.html (sistema "4 pontas").
 */

// ─── User Stats & Progress Dashboard ─────────────────────────────────────────
let _userStats = null;

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
    // Legacy IDs that may still exist on other pages/tabs
    if (document.getElementById('progressAccuracyValue')) {
        _pd('progressAccuracyValue', `${stats.avg_lesson_accuracy}%`);
    }
    if (document.getElementById('pdLessons')) _pd('pdLessons', stats.lessons_completed);
    if (document.getElementById('pdLevel')) _pd('pdLevel', stats.level);
    if (document.getElementById('pdConversations')) _pd('pdConversations', stats.total_conversations);
    if (document.getElementById('pdWriting') && stats.writing_accuracy_avg != null) {
        _pd('pdWriting', `${stats.writing_accuracy_avg}%`);
    }
    const grammarEl = document.getElementById('pdGrammarArea');
    if (grammarEl) grammarEl.textContent = stats.top_grammar_area || '--';

    // ─────────── RAMPA (pl2-*) ───────────
    _renderHero(stats);
    _renderSidebar(stats);
    if (typeof window.renderHomeToday === 'function') window.renderHomeToday(stats);
}

// ─────────── RAMPA: lateral "Seu progresso" (read-only) ───────────
function _renderSidebar(stats) {
    _renderPhonemeCard(stats.top_phoneme);
    _renderCefrCard(stats.cefr);
    _renderVocabCard(stats.vocab_total_seen, stats.vocab_total_seen_week);
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

function _renderHero(stats) {
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
        const streak = stats.streak || 0;
        const lessons = stats.lessons_completed || 0;
        if (streak > 0) {
            subEl.textContent = `Sua sequência está em ${streak} dia${streak === 1 ? '' : 's'} — dez minutos hoje e ela vira ${streak + 1}.`;
        } else if (lessons > 0) {
            subEl.textContent = `Você já concluiu ${lessons} aula${lessons === 1 ? '' : 's'}. Dez minutos hoje recomeçam sua sequência.`;
        } else {
            subEl.textContent = 'Comece com uma aula curta — dez minutos bastam.';
        }
    }

    // Herói: texto genérico enquanto a trilha carrega (ou se falhar);
    // _renderLessonHero troca pela aula real assim que o player responde.
    const titleEl = document.getElementById('pl2HeroTitle');
    if (titleEl && !titleEl.dataset.real) {
        titleEl.textContent = 'Começar sua próxima aula';
        _pd('pl2HeroResumeMeta', 'Aulas curtas de ~10 minutos, do zero.');
    }
    _renderLessonHero();
}

// ─────────── Herói: a aula real (retomada ou próxima) ───────────
// A home não tem a trilha; carrega o data file + o player das aulas sob
// demanda (mesmos arquivos da lessons.html, então o cache é compartilhado)
// e usa a API pública Grilo4P — a mesma fonte da grade de aulas.
const LESSONS_4P_SCRIPTS = [
    'assets/js/lessons-4p-data.js?v=1780000200',
    'assets/js/lessons-4p.js?v=1780000400',
];
let _lessons4pLoading = null;

function _loadLessons4p() {
    if (_lessons4pLoading) return _lessons4pLoading;
    _lessons4pLoading = LESSONS_4P_SCRIPTS.reduce((chain, src) => chain.then(() =>
        new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = () => reject(new Error('falha ao carregar ' + src));
            document.body.appendChild(s);
        })
    ), Promise.resolve()).then(() => window.Grilo4P && window.Grilo4P.ready);
    return _lessons4pLoading;
}
window._loadLessons4p = _loadLessons4p;

function _agoLabel(iso) {
    const t = Date.parse(iso || '');
    if (!t) return '';
    const mins = Math.round((Date.now() - t) / 60000);
    if (mins < 2) return 'agora há pouco';
    if (mins < 60) return `há ${mins} min`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `há ${hrs} h`;
    const days = Math.round(hrs / 24);
    return days === 1 ? 'ontem' : `há ${days} dias`;
}

function _renderLessonHero() {
    _loadLessons4p().then(() => {
        const G = window.Grilo4P;
        if (!G || !G.getNextLesson) return;

        const eyebrowEl = document.getElementById('pl2HeroEyebrow');
        const titleEl = document.getElementById('pl2HeroTitle');
        const goalEl = document.getElementById('pl2HeroGoal');
        const progEl = document.getElementById('pl2HeroProg');
        const fillEl = document.getElementById('pl2HeroProgFill');
        const link = document.getElementById('pl2HeroResume');
        if (!titleEl || !link) return;

        const place = (L) => `${L.level} · Aula ${String(L.num).padStart(2, '0')} de ${L.blockTotal}`;
        const set = (eyebrow, title, meta, goal, btn, href) => {
            if (eyebrowEl) eyebrowEl.textContent = eyebrow;
            titleEl.textContent = title;
            titleEl.dataset.real = '1';
            _pd('pl2HeroResumeMeta', meta);
            if (goalEl) { goalEl.textContent = goal || ''; goalEl.hidden = !goal; }
            _pd('pl2HeroBtnLabel', btn);
            link.href = href;
        };

        // 1) Aula pela metade → retomada exata
        const resume = (G.getResumable() || [])[0];
        if (resume) {
            const L = G.describeLesson(resume.slug);
            const phase = G.phaseInfo(resume.phase);
            const bits = [L ? place(L) : null,
                          phase ? `parou em ${phase.icon} ${phase.label}` : null,
                          _agoLabel(resume.at) || null].filter(Boolean);
            set('Continue de onde parou', resume.title, bits.join(' · '), '',
                'Continuar aula', `lessons.html?aula=${encodeURIComponent(resume.slug)}`);
            if (progEl && fillEl) {
                progEl.hidden = false;
                fillEl.style.width = `${resume.percent}%`;
                _pd('pl2HeroProgLabel', `${resume.percent}% da aula`);
            }
            return;
        }
        if (progEl) progEl.hidden = true;

        // 2) Próxima aula da trilha
        const next = G.getNextLesson();
        if (next) {
            const first = G.countCompleted() === 0;
            const bits = [place(next), next.groupLabel, next.minutes ? `${next.minutes} min` : null].filter(Boolean);
            set(first ? 'Sua primeira aula' : 'Sua próxima aula', next.title, bits.join(' · '),
                next.objective, first ? 'Começar agora' : 'Começar aula',
                `lessons.html?aula=${encodeURIComponent(next.slug)}`);
            return;
        }

        // 3) Trilha inteira concluída → hora de usar o inglês
        set('Trilha concluída', `Você fechou as ${G.countCompleted()} aulas`,
            'Agora é usar: converse sobre qualquer assunto no Chat de Voz.', '',
            'Abrir Chat de Voz', 'voice.html');
    }).catch(e => console.warn('[HERO] trilha indisponível, mantendo herói genérico:', e.message));
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

// ─── Global exports ────────────────────────────────────────────────────────────
window.showProgressDetail      = showProgressDetail;
window.hideProgressDetail      = hideProgressDetail;
window.loadUserStats           = loadUserStats;
window.loadUserActivity        = loadUserActivity;
window.renderWeekStrip         = renderWeekStrip;
