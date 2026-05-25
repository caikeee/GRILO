/**
 * modal-interactions.js — Melhora a experiência de navegação
 * dentro do modal de aulas
 */

(function() {
  'use strict';

  const ASIDE_STATE_KEY = 'grilo_lesson_aside_collapsed';

  function isCollapsed() {
    return localStorage.getItem(ASIDE_STATE_KEY) === 'true';
  }

  function applyAsideState() {
    const modal = document.getElementById('lessonContent');
    const toggle = document.getElementById('lessonAsideToggle');
    if (!modal) return;
    const collapsed = isCollapsed();
    modal.classList.toggle('is-aside-collapsed', collapsed);
    if (toggle) {
      toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      toggle.setAttribute('aria-label', collapsed ? 'Mostrar painel' : 'Ocultar painel');
    }
  }

  // ============================================================
  // HANDLERS DE INTERAÇÃO
  // ============================================================

  function setupToggleButton() {
    document.addEventListener('click', function(e) {
      if (!e.target.closest('#lessonAsideToggle')) return;
      localStorage.setItem(ASIDE_STATE_KEY, isCollapsed() ? 'false' : 'true');
      applyAsideState();
    });
  }

  function setupCloseButton() {
    const closeBtn = document.getElementById('lessonModalClose');
    if (!closeBtn) return;

    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeLesson();
    });
  }

  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      const modal = document.getElementById('lessonContent');
      if (!modal || !modal.classList.contains('active')) return;

      // ESC para fechar
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLesson();
      }

      // Ctrl/Cmd + H para toggle painel
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        const toggle = document.getElementById('lessonAsideToggle');
        if (toggle) toggle.click();
      }
    });
  }

  // ============================================================
  // FUNÇÃO DE FECHAR
  // ============================================================

  function closeLesson() {
    const modal = document.getElementById('lessonContent');
    const main = document.getElementById('lessonModalMain');
    const aside = document.getElementById('lessonModalAside');

    if (!modal) return;

    // Anima o conteúdo saindo
    if (main) {
      main.style.transition = 'opacity 200ms ease, transform 200ms ease';
      main.style.opacity = '0';
      main.style.transform = 'translateY(8px)';
    }

    if (aside) {
      aside.style.transition = 'opacity 200ms ease, transform 200ms ease';
      aside.style.opacity = '0';
      aside.style.transform = 'translateX(-8px)';
    }

    // Fecha o modal após animação
    setTimeout(() => {
      modal.classList.add('is-closing');
      modal.classList.remove('active');

      setTimeout(() => {
        modal.setAttribute('hidden', '');
        modal.classList.remove('is-closing');

        // Reset do conteúdo para próxima abertura
        if (main) {
          main.style.transition = '';
          main.style.opacity = '';
          main.style.transform = '';
        }
        if (aside) {
          aside.style.transition = '';
          aside.style.opacity = '';
          aside.style.transform = '';
        }

        document.body.style.overflow = '';
      }, 250);
    }, 200);
  }

  // ============================================================
  // ABRIR AULA COM ANIMAÇÃO
  // ============================================================

  function animateContentEntry() {
    const main = document.getElementById('lessonModalMain');
    const aside = document.getElementById('lessonModalAside');

    if (main) {
      main.style.opacity = '0';
      main.style.transform = 'translateY(12px)';
      main.style.transition = 'none';

      requestAnimationFrame(() => {
        main.style.transition = 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1), transform 400ms cubic-bezier(0.16, 1, 0.3, 1)';
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)';
      });
    }

    if (aside && !isCollapsed()) {
      aside.style.opacity = '0';
      aside.style.transform = 'translateX(-8px)';
      aside.style.transition = 'none';

      requestAnimationFrame(() => {
        aside.style.transition = 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) 80ms, transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 80ms';
        aside.style.opacity = '1';
        aside.style.transform = 'translateX(0)';
      });
    }
  }

  // ============================================================
  // SCROLL BEHAVIOR
  // ============================================================

  function setupSmoothScroll() {
    const aside = document.getElementById('lessonModalAside');
    if (!aside) return;

    aside.addEventListener('click', function(e) {
      const link = e.target.closest('.lp-aside-nav-item');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      e.preventDefault();

      const target = document.querySelector(href);
      if (!target) return;

      const main = document.getElementById('lessonModalMain');
      if (!main) return;

      // Smooth scroll com offset
      const offsetTop = target.offsetTop - main.scrollTop - 60;
      main.scrollBy({
        top: offsetTop,
        behavior: 'smooth'
      });
    });
  }

  // ============================================================
  // VISIBILITY OBSERVER — Highlight na navegação
  // ============================================================

  function setupIntersectionObserver() {
    const sections = document.querySelectorAll('[id^="msec-"], [id^="overview-"]');
    if (sections.length === 0) return;

    const navItems = document.querySelectorAll('.lp-aside-nav-item');
    if (navItems.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === '#' + sectionId) {
              item.style.background = 'rgba(74, 124, 94, 0.1)';
              item.style.color = 'var(--lp-green-mid)';
            } else {
              item.style.background = '';
              item.style.color = '';
            }
          });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
  }

  // ============================================================
  // SCROLL INDICATOR
  // ============================================================

  function setupScrollIndicator() {
    const main = document.getElementById('lessonModalMain');
    if (!main) return;

    const createIndicator = () => {
      const indicator = document.createElement('div');
      indicator.id = 'modal-scroll-indicator';
      indicator.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, #4a7c5e 0%, #7aae8a 100%);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 200ms ease;
        pointer-events: none;
        z-index: 100;
      `;
      document.body.appendChild(indicator);
      return indicator;
    };

    const indicator = createIndicator();

    const updateIndicator = () => {
      if (!main.offsetParent) {
        indicator.style.display = 'none';
        return;
      }

      const scrollTop = main.scrollTop;
      const scrollHeight = main.scrollHeight - main.clientHeight;
      const scrollPercent = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

      indicator.style.transform = `scaleX(${scrollPercent})`;
    };

    main.addEventListener('scroll', updateIndicator, { passive: true });
    updateIndicator();
  }

  // ============================================================
  // HOOK NO OPENING DE AULA
  // ============================================================

  // Animação de entrada é acionada quando o modal abre via MutationObserver
  // (não mais via hook em _griloOpenLesson para evitar double-wrapping)
  const modalEl = document.getElementById('lessonContent');
  if (modalEl) {
    new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class' && modalEl.classList.contains('active')) {
          setTimeout(() => {
            animateContentEntry();
            setupSmoothScroll();
            setupIntersectionObserver();
          }, 50);
          break;
        }
      }
    }).observe(modalEl, { attributes: true });
  }

  // ============================================================
  // INIT
  // ============================================================

  function init() {
    setupToggleButton();
    setupCloseButton();
    setupKeyboardShortcuts();
    // Apply persisted state once modal is in DOM
    const checkModal = () => {
      const modal = document.getElementById('lessonContent');
      if (!modal) { setTimeout(checkModal, 200); return; }
      applyAsideState();
    };
    checkModal();
  }

  document.addEventListener('DOMContentLoaded', init);

  // Global: called after aside innerHTML is re-injected to re-sync toggle button attrs
  window._applyAsideState = applyAsideState;

  window._closeLesson = closeLesson;

})();
