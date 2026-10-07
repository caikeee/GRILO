/**
 * HOME — "Treino de hoje" + "Use o que aprendeu"
 *
 * O treino de hoje amarra as frentes num percurso só, na ordem das 4 pontas:
 *   1. Aula       (ver, ouvir, escrever, falar o escopo)
 *   2. Ditação    (ouvir e escrever)
 *   3. Shadowing  (falar junto com o nativo)
 * Cada passo aponta para o conteúdo exato (aula/faixa da vez) e marca ✓
 * quando foi feito hoje. A fonte de "feito hoje" é a mesma de cada página:
 *   - aula: completedAt de hoje no progresso do player 4 pontas
 *   - ditação/shadowing: streakDate === hoje (markDailyDone das páginas)
 *
 * "Use o que aprendeu" leva para as frentes abertas: Chat de Voz e Comunidade.
 *
 * Depende de: lessons-controller.js (window._loadLessons4p, _escape global).
 */
(function () {
    'use strict';

    const DICTATION_DATA = 'assets/js/dictation-data.js?v=1';
    const SHADOW_DATA = 'assets/js/shadowing-data.js?v=2';
    const DICTATION_LS = 'grilo_dictation_progress_v1';
    const SHADOW_LS = 'grilo_shadow_progress_v1';
    const LESSONS_LS = 'grilo4p_progress_v1';

    const _scripts = {};
    function loadScript(src) {
        if (!_scripts[src]) {
            _scripts[src] = new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = src;
                s.onload = resolve;
                s.onerror = () => reject(new Error('falha ao carregar ' + src));
                document.body.appendChild(s);
            });
        }
        return _scripts[src];
    }

    function readLS(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) { return fallback; }
    }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[c]);
    }

    // Ditação e shadowing gravam streakDate com toISOString (dia UTC);
    // a aula grava completedAt em ISO — comparamos no dia LOCAL do aluno.
    const utcToday = () => new Date().toISOString().slice(0, 10);
    function isLocalToday(iso) {
        const t = Date.parse(iso || '');
        if (!t) return false;
        const d = new Date(t), n = new Date();
        return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
    }

    // Títulos de aula são "Tema — subtítulo"; no passo cabe só o tema.
    const shortTitle = t => String(t || '').split(' — ')[0];

    // ─────────── Passos ───────────
    function lessonStep() {
        const G = window.Grilo4P;
        if (!G || !G.getNextLesson) return null;
        const prog = readLS(LESSONS_LS, {});
        const doneSlug = Object.keys(prog).find(s => prog[s] && isLocalToday(prog[s].completedAt));
        if (doneSlug) {
            const L = G.describeLesson(doneSlug);
            return {
                done: true, ico: '▤', kicker: 'Aula',
                title: L ? shortTitle(L.title) : 'Aula concluída',
                sub: 'Concluída hoje — escopo registrado',
                href: 'lessons.html',
            };
        }
        const resume = (G.getResumable() || [])[0];
        const L = resume ? G.describeLesson(resume.slug) : G.getNextLesson();
        if (!L) return null;
        return {
            done: false, ico: '▤', kicker: 'Aula',
            title: shortTitle(L.title),
            sub: resume
                ? `${resume.percent}% feita · termine de onde parou`
                : `${L.level} · Aula ${String(L.num).padStart(2, '0')}${L.minutes ? ` · ${L.minutes} min` : ''}`,
            href: `lessons.html?aula=${encodeURIComponent(L.slug)}`,
            minutes: L.minutes || 10,
        };
    }

    function trackStep(api, lsKey, isDone, meta) {
        if (!api || !api.getTrackOrder) return null;
        const prog = readLS(lsKey, { tracks: {}, streakDate: null });
        const tracks = prog.tracks || {};
        const order = api.getTrackOrder();
        const doneToday = prog.streakDate === utcToday();
        const next = order.find(t => !isDone(tracks[t.slug] || {})) || order[0];
        if (!next) return null;
        // Feito hoje: a faixa "da vez" já avançou para a próxima, então o
        // título fala do treino feito e a próxima faixa vira o convite.
        return {
            done: doneToday, ico: meta.ico, kicker: meta.kicker,
            title: doneToday ? meta.doneTitle : next.title,
            sub: doneToday
                ? `Próxima faixa: ${next.title}`
                : `${next.theme} · ${next.sentences.length} frases`,
            href: `${meta.page}?faixa=${encodeURIComponent(next.slug)}`,
            minutes: 5,
        };
    }

    function stepHtml(step, i) {
        return `
            <li>
                <a class="today-step${step.done ? ' is-done' : ''}" href="${esc(step.href)}">
                    <span class="today-step-mark" aria-hidden="true">${step.done ? '✓' : i + 1}</span>
                    <span class="today-step-txt">
                        <small><span aria-hidden="true">${esc(step.ico)}</span> ${esc(step.kicker)}</small>
                        <b>${esc(step.title)}</b>
                        <em>${esc(step.sub)}</em>
                    </span>
                    <span class="today-step-chev" aria-hidden="true">›</span>
                    ${step.done ? '<span class="sr-only">(feito hoje)</span>' : ''}
                </a>
            </li>`;
    }

    function renderToday() {
        const root = document.getElementById('todaySteps');
        if (!root) return;

        const steps = [
            lessonStep(),
            trackStep(window.GriloDictation, DICTATION_LS, st => !!st.done,
                { ico: '✎', kicker: 'Ditação · ouvir e escrever', page: 'dictation.html', doneTitle: 'Ditação feita hoje' }),
            trackStep(window.GriloShadow, SHADOW_LS, st => !!st.rankedDone,
                { ico: '◉', kicker: 'Shadowing · falar junto', page: 'shadowing.html', doneTitle: 'Shadowing feito hoje' }),
        ].filter(Boolean);
        if (!steps.length) return;

        const done = steps.filter(s => s.done).length;
        const left = steps.filter(s => !s.done).reduce((n, s) => n + (s.minutes || 0), 0);
        const plan = document.getElementById('todayPlan');
        if (plan) {
            plan.hidden = false;
            plan.classList.toggle('is-complete', done === steps.length);
        }

        const countEl = document.getElementById('todayCount');
        if (countEl) {
            countEl.textContent = done === steps.length
                ? 'Completo'
                : `${done} de ${steps.length}${left ? ` · ~${left} min` : ''}`;
        }
        const fill = document.getElementById('todayFill');
        if (fill) fill.style.width = `${Math.round((done / steps.length) * 100)}%`;

        const note = document.getElementById('todayNote');
        if (note) {
            note.textContent = done === steps.length
                ? 'Treino feito: você viu, ouviu, escreveu e falou hoje. Quer mais? Converse no Chat de Voz.'
                : 'Aula, depois ouvir e escrever, depois falar: as 4 pontas no mesmo dia.';
        }

        root.innerHTML = steps.map(stepHtml).join('');
    }

    // ─────────── Use o que aprendeu ───────────
    function renderVoiceCard(stats) {
        const titleEl = document.getElementById('useVoiceTitle');
        const subEl = document.getElementById('useVoiceSub');
        if (!titleEl || !subEl) return;
        const interests = String((stats.profile || {}).daily_interests || '')
            .split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
        // Um interesse por dia (estável entre recargas, varia ao longo do mês).
        const topic = interests.length ? interests[new Date().getDate() % interests.length] : '';
        titleEl.textContent = topic ? `Converse sobre ${topic.toLowerCase()}` : 'Cinco minutos de conversa';
        const n = Number(stats.voice_sessions_count || 0);
        const mins = Math.round(Number(stats.voice_minutes || 0));
        subEl.textContent = n > 0
            ? `${n} conversa${n === 1 ? '' : 's'}${mins ? ` · ${mins} min falando inglês` : ''}`
            : 'Sua primeira conversa: a IA corrige enquanto você fala';
    }

    function renderCommunityCard() {
        const titleEl = document.getElementById('useCommunityTitle');
        const subEl = document.getElementById('useCommunitySub');
        const token = (typeof authToken !== 'undefined' && authToken) || sessionStorage.getItem('grilo_token');
        if (!titleEl || !subEl || !token) return;
        fetch(`${API_BASE_URL}/api/community/topics?sort=trending&status=open&limit=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => (r.ok ? r.json() : null))
            .then(data => {
                if (!data || !data.success) return;
                const t = (data.topics || [])[0];
                if (!t) return;
                titleEl.textContent = `“${t.title}”`;
                const votes = Number(t.vote_count || 0);
                const open = Number(data.open_count || 0);
                subEl.textContent = `${votes} voto${votes === 1 ? '' : 's'}`
                    + (open > 1 ? ` · ${open} ideias em votação` : ' · em votação');
            })
            .catch(() => { /* mantém o texto padrão */ });
    }

    // ─────────── Entrada ───────────
    let _communityLoaded = false;

    function renderHomeToday(stats) {
        const lessons = typeof window._loadLessons4p === 'function'
            ? window._loadLessons4p().catch(() => null)
            : Promise.resolve();
        Promise.all([
            lessons,
            loadScript(DICTATION_DATA).catch(() => null),
            loadScript(SHADOW_DATA).catch(() => null),
        ]).then(renderToday);

        renderVoiceCard(stats || {});
        if (!_communityLoaded) {
            _communityLoaded = true;
            renderCommunityCard();
        }
    }

    window.renderHomeToday = renderHomeToday;
})();
