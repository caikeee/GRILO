/**
 * grilo-animations.js
 * Scroll reveals, login strip trigger, chat demo animation, navbar login
 */

(function () {
  'use strict';

  // ── handleNavbarLogin (login strip quick login) ─────────────────────────
  window.handleNavbarLogin = function() {
    var username = (document.getElementById('navbarUsername') || {}).value || '';
    var password = (document.getElementById('navbarPassword') || {}).value || '';
    var errorEl  = document.getElementById('navbarLoginError');
    var btn      = document.getElementById('navbarLoginBtn');

    if (!username || !password) {
      if (errorEl) errorEl.textContent = 'Preencha usuário e senha.';
      return;
    }

    if (errorEl) errorEl.textContent = '';
    if (btn) { btn.disabled = true; btn.textContent = '...'; }

    // API_BASE_URL is defined globally in utils.js
    fetch(API_BASE_URL + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password })
    })
    .then(function(res) { return res.json().then(function(d) { return { ok: res.ok, data: d }; }); })
    .then(function(r) {
      if (!r.ok) {
        var msg = (typeof r.data.detail === 'string') ? r.data.detail : 'Usuário ou senha inválidos.';
        if (errorEl) errorEl.textContent = msg;
        if (btn) { btn.disabled = false; btn.textContent = 'Entrar →'; }
        return;
      }
      var token = r.data.access_token;
      if (!token) { if (errorEl) errorEl.textContent = 'Erro inesperado.'; return; }
      localStorage.setItem('grilo_token', token);
      if (r.data.user) localStorage.setItem('grilo_user', JSON.stringify(r.data.user));
      if (typeof showToast === 'function') showToast('Bem-vindo de volta! 👋', 'success');
      setTimeout(function() { window.location.href = 'home.html'; }, 600);
    })
    .catch(function() {
      if (errorEl) errorEl.textContent = 'Servidor indisponível.';
      if (btn) { btn.disabled = false; btn.textContent = 'Entrar →'; }
    });
  };

  // ── 1. Scroll Progress Bar ──────────────────────────────────────────────
  var progressBar = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  // ── 2. Navbar scroll state ─────────────────────────────────────────────
  var navbar = document.getElementById('navbar');
  function updateNavbar() {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // ── 3. Login Strip — appears after scrolling past hero ────────────────
  var loginStrip = document.getElementById('loginStrip');
  function updateLoginStrip() {
    if (!loginStrip) return;
    if (window.scrollY > 300) {
      loginStrip.classList.add('is-scrolled');
    } else {
      loginStrip.classList.remove('is-scrolled');
    }
  }

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motionTicking = false;

  function updateLandingMotion() {
    if (prefersReducedMotion) return;

    var sections = document.querySelectorAll('body.landing-page .section');
    if (!sections.length) return;

    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var viewportCenter = viewportHeight * 0.5;

    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      var sectionCenter = rect.top + (rect.height * 0.5);
      var distance = (sectionCenter - viewportCenter) / viewportHeight;
      var clamped = Math.max(-1, Math.min(1, distance));
      var sectionShift = Math.round(clamped * -18);
      var cardShift = Math.round(clamped * -12);

      section.style.setProperty('--section-parallax', sectionShift + 'px');
      section.style.setProperty('--section-card-parallax', cardShift + 'px');
    });
  }

  function requestMotionUpdate() {
    if (motionTicking) return;

    motionTicking = true;
    window.requestAnimationFrame(function () {
      updateScrollProgress();
      updateNavbar();
      updateLoginStrip();
      updateLandingMotion();
      motionTicking = false;
    });
  }

  window.addEventListener('scroll', function () {
    requestMotionUpdate();
  }, { passive: true });

  window.addEventListener('resize', requestMotionUpdate, { passive: true });

  // ── 4. [data-reveal] IntersectionObserver ──────────────────────────────
  var DELAYS = [0, 100, 200, 300, 400, 500]; // maps to data-reveal-delay="0..5"

  function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delayIndex = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
          var delay = DELAYS[delayIndex] || 0;
          setTimeout(function () {
            el.classList.add('is-visible');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  // ── 5. Chat Demo Animation ─────────────────────────────────────────────
  function initChatDemo() {
    var container = document.getElementById('demoMessages');
    if (!container) return;

    var typing = document.getElementById('demoTyping');
    var messages = container.querySelectorAll('.demo-msg');
    if (!messages.length) return;

    var started = false;

    // Only start when the demo-window enters viewport
    var demoWindow = container.closest('.demo-window');
    if (!demoWindow) return;

    var demoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !started) {
          started = true;
          runDemo();
          demoObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });

    demoObserver.observe(demoWindow);

    function showMessage(index, callback) {
      if (index >= messages.length) {
        if (callback) callback();
        return;
      }

      // Show typing indicator
      if (typing) typing.style.display = 'flex';

      var delay = messages[index].classList.contains('demo-msg--user') ? 600 : 900;

      setTimeout(function () {
        if (typing) typing.style.display = 'none';
        messages[index].style.display = '';
        // animate in
        messages[index].style.opacity = '0';
        messages[index].style.transform = 'translateY(8px)';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            messages[index].style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            messages[index].style.opacity = '1';
            messages[index].style.transform = 'translateY(0)';
          });
        });

        setTimeout(function () {
          showMessage(index + 1, callback);
        }, 1000);
      }, delay);
    }

    function runDemo() {
      // Initial pause then show typing
      setTimeout(function () {
        showMessage(0);
      }, 600);
    }
  }

  // ── 6. Hero Slider ────────────────────────────────────────────────────
  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prevBtn = slider.querySelector('[data-hero-prev]');
    var nextBtn = slider.querySelector('[data-hero-next]');
    if (!slides.length) return;

    var activeIndex = slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    });
    if (activeIndex < 0) activeIndex = 0;

    var autoTimer = null;
    var AUTO_DELAY = 5200;

    function render(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        var isActive = dotIndex === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(function () {
        render(activeIndex + 1);
      }, AUTO_DELAY);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        render(activeIndex - 1);
        startAuto();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        render(activeIndex + 1);
        startAuto();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        render(index);
        startAuto();
      });
    });

    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);
    slider.addEventListener('focusin', stopAuto);
    slider.addEventListener('focusout', startAuto);

    render(activeIndex);
    startAuto();
  }

  // ── 7. Content Sliders (system, results, CTA) ────────────────────────
  function initContentSliders() {
    var sliders = document.querySelectorAll('[data-content-slider]');
    if (!sliders.length) return;

    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-content-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-content-dot]'));
      var prevBtn = slider.querySelector('[data-content-prev]');
      var nextBtn = slider.querySelector('[data-content-next]');
      if (!slides.length) return;

      var activeIndex = slides.findIndex(function (slide) {
        return slide.classList.contains('is-active');
      });
      if (activeIndex < 0) activeIndex = 0;

      var autoTimer = null;
      var autoDelay = parseInt(slider.getAttribute('data-slider-delay') || '5000', 10);

      function render(index) {
        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
          var isActive = dotIndex === activeIndex;
          dot.classList.toggle('is-active', isActive);
          dot.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
      }

      function stopAuto() {
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      }

      function startAuto() {
        stopAuto();
        if (slides.length < 2) return;
        autoTimer = setInterval(function () {
          render(activeIndex + 1);
        }, autoDelay);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          render(index);
          startAuto();
        });
      });

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          render(activeIndex - 1);
          startAuto();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          render(activeIndex + 1);
          startAuto();
        });
      }

      slider.addEventListener('mouseenter', stopAuto);
      slider.addEventListener('mouseleave', startAuto);
      slider.addEventListener('focusin', stopAuto);
      slider.addEventListener('focusout', startAuto);

      render(activeIndex);
      startAuto();
    });
  }

  // ── 8. Quiz Response Handler ─────────────────────────────────────────────
  function checkAnswer(isCorrect) {
    const popup = document.getElementById("popup");
    if (isCorrect) {
      popup.classList.remove("hidden");
      setTimeout(() => {
        popup.classList.add("hidden");
      }, 3000); // O popup desaparece após 3 segundos
    }
  }

  // ── Init ────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initReveal();
      initChatDemo();
      initHeroSlider();
      initContentSliders();
      requestMotionUpdate();
    });
  } else {
    initReveal();
    initChatDemo();
    initHeroSlider();
    initContentSliders();
    requestMotionUpdate();
  }

})();
