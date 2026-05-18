/**
 * lessons-trail.js — V4 trail layout
 *
 * Reorganiza visualmente os cards renderizados pelo lessons-enhanced.js
 * agrupando-os por módulo. Todos os cards são aulas reais, clicáveis,
 * com a MESMA aparência. Ordem da trilha A1 = 26 aulas em 6 módulos.
 */

(function() {
    'use strict';

    // ============================================================
    // ESTRUTURA DA TRILHA A1 — 6 módulos, 26 aulas
    // Cada slug existe no objeto `lessons` do lessons-enhanced.js
    // ============================================================

    const TRAIL = [
        {
            num: '01',
            title: 'Primeiros passos',
            meta: '4 aulas · base inicial',
            slugs: ['soa1-alfabeto', 'soa1-numeros', 'soa1-cumprimentos', 'soa1-tobe-afirm']
        },
        {
            num: '02',
            title: 'Falar sobre você e os outros',
            meta: '5 aulas · identidade',
            slugs: ['soa2-pronomes-sujeito', 'pronomes', 'soa2-tobe-perg-neg', 'soa2-possessivos', 'soa2-this-that']
        },
        {
            num: '03',
            title: 'Ações do dia a dia',
            meta: '5 aulas · present simple',
            slugs: ['soa3-present-afirm', 'soa3-third-person-s', 'perguntas', 'negativa', 'soa3-frequencia']
        },
        {
            num: '04',
            title: 'Onde, quando, como',
            meta: '4 aulas · contexto',
            slugs: ['soa4-wh-questions', 'preposicoes', 'soa4-prep-tempo', 'soa4-rotina']
        },
        {
            num: '05',
            title: 'Falar sobre ontem',
            meta: '4 aulas · past simple',
            slugs: ['soa5-past-regular', 'passado', 'soa5-past-perguntas', 'soa5-past-negativa']
        },
        {
            num: '06',
            title: 'Querer, poder, gostar',
            meta: '4 aulas · expressão',
            slugs: ['soa6-can', 'soa6-like-ing', 'verbos', 'soa6-want-to']
        }
    ];

    function renderModuleHead(mod) {
        return `
            <div class="lv4-module-head" data-module="${mod.num}">
                <div class="lv4-module-num">${mod.num}</div>
                <h2 class="lv4-module-title">${mod.title}</h2>
                <div class="lv4-module-line" aria-hidden="true"></div>
                <span class="lv4-module-meta">${mod.meta}</span>
            </div>
        `;
    }

    function forceOpenModal() {
        const modal = document.getElementById('lessonContent');
        if (!modal) {
            console.error('[lessons-trail] modal #lessonContent não encontrado');
            return false;
        }
        modal.removeAttribute('hidden');
        void modal.offsetHeight;
        modal.classList.remove('is-closing');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        return true;
    }

    // ============================================================
    // RENDERER STANDALONE — popula o modal mesmo se o lessons-enhanced falhar
    // ============================================================

    function escHtml(s) {
        return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    function renderFallbackContent(slug, lesson) {
        const sections = (lesson.sections || []).map((s, i) => {
            const examples = (s.examples || []).map(ex => {
                const en = typeof ex === 'string' ? ex : ex.en;
                const pt = typeof ex === 'string' ? '' : ex.pt;
                return `<li class="lp-mex-item"><span class="lp-ex-en">${escHtml(en)}</span>${pt ? `<span class="lp-ex-pt">${escHtml(pt)}</span>` : ''}</li>`;
            }).join('');
            return `
                <div class="lp-msec" id="msec-${slug}-${i}">
                    <div class="lp-msec-header">
                        <div class="lp-msec-num">${String(i+1).padStart(2,'0')}</div>
                        <h2 class="lp-msec-title">${escHtml(s.title)}</h2>
                    </div>
                    ${s.explanation ? `<p class="lp-msec-explanation">${escHtml(s.explanation)}</p>` : ''}
                    ${examples ? `<div class="lp-mex"><div class="lp-mex-label">📝 Exemplos</div><ul class="lp-mex-list">${examples}</ul></div>` : ''}
                </div>`;
        }).join('');

        const curiosities = Array.isArray(lesson.curiosities) && lesson.curiosities.length
            ? `<div class="lp-mcur"><div class="lp-mcur-label">💡 Sabia que…</div><ul class="lp-mcur-list">${lesson.curiosities.map(c => `<li class="lp-mcur-item">${escHtml(c)}</li>`).join('')}</ul></div>`
            : '';

        return `
            <section class="lp-peda-overview" id="overview-${slug}">
                <div class="lp-peda-overview-hero">
                    <span class="lp-peda-kicker">Roteiro editorial</span>
                    <h2 class="lp-peda-overview-title">${escHtml(lesson.title)}</h2>
                    <p class="lp-peda-overview-copy">${escHtml(lesson.objective || '')}</p>
                    ${lesson.highlight ? `<div class="lp-card-tag">${escHtml(lesson.highlight)}</div>` : ''}
                </div>
            </section>
            ${sections}
            ${curiosities}`;
    }

    function renderFallbackAside(slug, lesson) {
        const points = (lesson.teachingPoints || []).map(p => `<li class="lp-aside-point">${escHtml(p)}</li>`).join('');
        const nav = (lesson.sections || []).map((s, i) =>
            `<a class="lp-aside-nav-item" href="#msec-${slug}-${i}" onclick="event.preventDefault();document.getElementById('msec-${slug}-${i}')?.scrollIntoView({behavior:'smooth'})"><span class="lp-aside-nav-dot"></span>${escHtml(s.title)}</a>`
        ).join('');
        return `
            <span class="lp-aside-num">AULA</span>
            <div class="lp-aside-title">${escHtml(lesson.title)}</div>
            <p class="lp-aside-obj">${escHtml(lesson.objective || '')}</p>
            <div class="lp-aside-sep"></div>
            ${points ? `<span class="lp-aside-section-label">O que você vai aprender</span><ul class="lp-aside-points">${points}</ul><div class="lp-aside-sep"></div>` : ''}
            ${nav ? `<span class="lp-aside-section-label">Seções desta aula</span><nav class="lp-aside-nav">${nav}</nav>` : ''}`;
    }

    function openLessonBySlug(slug, triggerEl) {
        if (!slug) return;
        console.log('[lessons-trail] abrindo aula:', slug);

        const lesson = (window._lessonsData || {})[slug];
        if (!lesson) {
            console.error('[lessons-trail] aula não encontrada nos dados:', slug);
            showDebugToast(`aula sem dados · ${slug}`, '#C9716C');
            return;
        }

        // Rastreia a aula atual pro botão "Treinar 5 frases"
        window._currentLessonSlug = slug;
        window._currentLessonTitle = lesson.title;

        const modal = document.getElementById('lessonContent');
        const main = document.getElementById('lessonModalMain');
        const aside = document.getElementById('lessonModalAside');
        const crumbLesson = document.getElementById('lessonModalCrumbLesson');

        if (!modal || !main) {
            console.error('[lessons-trail] modal/main DOM ausente');
            return;
        }

        // 1) Tenta abrir via _griloOpenLesson (fluxo completo do lessons-enhanced)
        let usedGateway = false;
        if (typeof window._griloOpenLesson === 'function') {
            try {
                window._griloOpenLesson(slug, triggerEl);
                usedGateway = true;
            } catch (err) {
                console.error('[lessons-trail] erro em _griloOpenLesson:', err);
            }
        }

        // 2) Garante modal aberto
        forceOpenModal();

        // 3) Atualiza breadcrumb
        if (crumbLesson) crumbLesson.textContent = lesson.title;

        // 4) Decide o conteúdo do main
        setTimeout(() => {
            // Se o editorial-renderer tem layout, usa
            if (typeof window._applyEditorialLayout === 'function' && window._applyEditorialLayout(slug)) {
                console.log('[lessons-trail] layout editorial aplicado para', slug);
            } else {
                // Senão, garante conteúdo padrão (caso o lessons-enhanced não tenha preenchido)
                if (!main.innerHTML.trim() || main.innerHTML.length < 80) {
                    console.log('[lessons-trail] aplicando fallback de conteúdo para', slug);
                    main.innerHTML = renderFallbackContent(slug, lesson);
                }
            }
            // Garante aside preenchido
            if (aside && (!aside.innerHTML.trim() || aside.innerHTML.length < 50)) {
                aside.innerHTML = renderFallbackAside(slug, lesson);
            }
            main.scrollTop = 0;
            if (aside) aside.scrollTop = 0;
        }, 60);
    }

    function attachDirectClickHandler(card) {
        if (card._lv4Bound) return;
        card._lv4Bound = true;
        card.style.cursor = 'pointer';
    }

    // ============================================================
    // Toast visual de debug — mostra que o click foi capturado
    // ============================================================

    function showDebugToast(msg, color) {
        let toast = document.getElementById('_lv4_debug_toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = '_lv4_debug_toast';
            toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#1A2A22;color:white;padding:12px 18px;border-radius:10px;font-family:system-ui,sans-serif;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,0.3);z-index:99999;max-width:320px;opacity:0;transition:opacity 0.2s,transform 0.2s;transform:translateY(10px);pointer-events:none;';
            document.body.appendChild(toast);
        }
        toast.style.background = color || '#1A2A22';
        toast.textContent = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        clearTimeout(toast._t);
        toast._t = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
        }, 2500);
    }
    window._lv4ShowToast = showDebugToast;

    // ============================================================
    // Event delegation NO DOCUMENT
    // ============================================================

    if (!window._lessonsTrailDocHandlerBound) {
        window._lessonsTrailDocHandlerBound = true;

        document.addEventListener('click', function(e) {
            // Não interromper cliques em botões/links internos do card
            if (e.target.closest('button, a, input, textarea, select')) return;
            const card = e.target.closest('.lp-card[data-lesson-key]');
            if (!card) return;

            const slug = card.dataset.lessonKey;
            showDebugToast(`click capturado · ${slug}`, '#3A5E47');
            console.log('[lessons-trail] click ✔', slug);
            openLessonBySlug(slug, card);

            setTimeout(() => {
                const modal = document.getElementById('lessonContent');
                if (modal && modal.classList.contains('active')) {
                    showDebugToast(`modal aberto · ${slug}`, '#3A5E47');
                } else {
                    showDebugToast(`modal NÃO abriu · ${slug}`, '#C9716C');
                }
            }, 200);
        }, true);

        document.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const card = e.target.closest('.lp-card[data-lesson-key]');
            if (!card) return;
            e.preventDefault();
            openLessonBySlug(card.dataset.lessonKey, card);
        });

        console.log('[lessons-trail] document click handler bound');
    }

    function injectTrail() {
        const container = document.getElementById('lessonsCardsContainer');
        if (!container) return;

        // Mapeia os cards existentes por slug
        const existingCards = {};
        container.querySelectorAll('.lp-card[data-lesson-key]').forEach(c => {
            existingCards[c.dataset.lessonKey] = c;
        });

        // Se ainda não houver cards (lessons-enhanced.js não rodou), espera
        if (Object.keys(existingCards).length === 0) return;

        // Limpa e reconstrói
        container.innerHTML = '';

        let globalNum = 1;
        TRAIL.forEach(mod => {
            container.insertAdjacentHTML('beforeend', renderModuleHead(mod));

            mod.slugs.forEach(slug => {
                const card = existingCards[slug];
                if (!card) {
                    console.warn('[lessons-trail] aula ausente:', slug);
                    globalNum++;
                    return;
                }
                // Atualiza o número visível para refletir posição na trilha
                const numStr = String(globalNum).padStart(2, '0');
                const numEl = card.querySelector('.lp-card-num');
                if (numEl) numEl.textContent = numStr;
                const kEl = card.querySelector('.lp-card-kicker');
                if (kEl) kEl.textContent = `Aula ${numStr}`;
                container.appendChild(card);
                attachDirectClickHandler(card);
                globalNum++;
            });
        });
    }

    function observeAndInject() {
        const container = document.getElementById('lessonsCardsContainer');
        if (!container) {
            setTimeout(observeAndInject, 300);
            return;
        }

        // Tenta imediatamente caso já tenha cards
        injectTrail();

        // Reagir quando lessons-enhanced.js re-renderizar (ex: após progresso)
        const observer = new MutationObserver((mutations) => {
            const hasNewLessonCards = mutations.some(m =>
                Array.from(m.addedNodes).some(n =>
                    n.nodeType === 1 && n.classList?.contains('lp-card') && n.dataset?.lessonKey
                )
            );
            if (hasNewLessonCards) {
                requestAnimationFrame(() => injectTrail());
            }
        });

        observer.observe(container, { childList: true });
    }

    function updateBanner() {
        const bannerTitle = document.querySelector('.lp-banner-title');
        if (bannerTitle && !bannerTitle.dataset.lv4Updated) {
            bannerTitle.innerHTML = 'Do <em>zero</em> à primeira conversa real.';
            bannerTitle.dataset.lv4Updated = '1';
        }
        const sub = document.querySelector('.lp-banner-sub');
        if (sub) {
            sub.textContent = '26 aulas para destravar o A1 — fundamentos que sustentam conversas reais, em 6 módulos progressivos.';
        }
        const stats = document.querySelectorAll('.lp-stat-pill');
        if (stats[0]) stats[0].innerHTML = '<span class="lp-stat-pill-dot"></span>26 aulas · 6 módulos';
        if (stats[1]) stats[1].innerHTML = '<span class="lp-stat-pill-dot"></span>Nível A1 completo';
        if (stats[2]) stats[2].innerHTML = '<span class="lp-stat-pill-dot"></span>Treino de voz embutido';

        const panelTitle = document.querySelector('.lp-banner-panel-title');
        if (panelTitle) {
            panelTitle.textContent = 'A trilha A1 completa, em 6 movimentos.';
        }
        const panelSub = document.querySelector('.lp-banner-panel-sub');
        if (panelSub) {
            panelSub.textContent = 'Cada aula traz 5 frases para treinar a voz na hora. Erro vira foco do dia. Próximo passo, sempre claro.';
        }
        const moduleEl = document.querySelector('.lessons-module-pill');
        if (moduleEl) {
            moduleEl.textContent = 'Trilha A1';
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        updateBanner();
        setTimeout(observeAndInject, 200);
    });

})();
