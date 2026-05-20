/**
 * modal-interactions.js — Melhora a experiência de navegação
 * dentro do modal de aulas
 */

(function() {
  'use strict';

  let asideCollapsed = false;
  const ASIDE_STATE_KEY = 'grilo_lesson_aside_collapsed';

  // ============================================================
  // ESTADO DO PAINEL
  // ============================================================

  function loadAsideState() {
    const saved = localStorage.getItem(ASIDE_STATE_KEY);
    asideCollapsed = saved === 'true';
  }

  function saveAsideState() {
    localStorage.setItem(ASIDE_STATE_KEY, asideCollapsed);
  }

  function updateAsideUI() {
    const modal = document.getElementById('lessonContent');
    const toggle = document.getElementById('lessonAsideToggle');
    const aside = document.getElementById('lessonModalAside');

    if (!modal || !toggle) return;

    if (asideCollapsed) {
      modal.classList.add('is-aside-collapsed');
      toggle.classList.add('is-collapsed');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Mostrar painel';
    } else {
      modal.classList.remove('is-aside-collapsed');
      toggle.classList.remove('is-collapsed');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.textContent = 'Ocultar painel';
    }
  }

  // ============================================================
  // HANDLERS DE INTERAÇÃO
  // ============================================================

  function setupToggleButton() {
    const toggle = document.getElementById('lessonAsideToggle');
    if (!toggle) return;

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      asideCollapsed = !asideCollapsed;
      saveAsideState();
      updateAsideUI();

      // Feedback visual
      toggle.style.transform = 'scale(0.95)';
      setTimeout(() => {
        toggle.style.transform = '';
      }, 150);
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

    if (aside && !asideCollapsed) {
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

  const originalOpenLesson = window._griloOpenLesson;
  if (typeof originalOpenLesson === 'function') {
    window._griloOpenLesson = function(slug, card) {
      // Chama original
      originalOpenLesson.call(window, slug, card);

      // Aguarda abertura do modal
      setTimeout(() => {
        animateContentEntry();
        setupSmoothScroll();
        setupIntersectionObserver();
      }, 320);
    };
  }

  // ============================================================
  // INIT
  // ============================================================

  function init() {
    loadAsideState();
    setupToggleButton();
    setupCloseButton();
    setupKeyboardShortcuts();

    // Espera pelo modal existir
    const checkModal = () => {
      const modal = document.getElementById('lessonContent');
      if (!modal) {
        setTimeout(checkModal, 200);
        return;
      }

      updateAsideUI();
    };

    checkModal();
  }

  document.addEventListener('DOMContentLoaded', init);

  // Exposição global
  window._closeLesson = closeLesson;
  window._toggleLessonAside = () => {
    asideCollapsed = !asideCollapsed;
    saveAsideState();
    updateAsideUI();
  };

})();
