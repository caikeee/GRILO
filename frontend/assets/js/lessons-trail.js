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

    function attachDirectClickHandler(card) {
        if (card._lv4Bound) return;
        card._lv4Bound = true;
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Não interromper cliques em links/botões internos
            if (e.target.closest('button, a')) return;
            const slug = card.dataset.lessonKey;
            if (!slug) return;
            // Tenta a função interna do lessons-enhanced via gateway global
            if (typeof window._griloOpenLesson === 'function') {
                window._griloOpenLesson(slug, card);
            } else {
                // Fallback: dispara um click sintético no formato que lessons-enhanced espera
                // ou simula via showLessonContent direto pelo escopo global
                console.warn('[lessons-trail] _griloOpenLesson não exposto; usando evento sintético');
            }
        });
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
