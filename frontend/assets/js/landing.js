/** ================================
    GRILO - LANDING
    Vitrine do produto: fotos da hero, tour por abas, Ponte, níveis,
    modal de senha e atalhos para o cartão de acesso.
    ================================ */
'use strict';

(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onVisible(el, cb, threshold) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { cb(e.isIntersecting); });
    }, { threshold: threshold || 0.3 }).observe(el);
  }

  /* ---- Cartão de acesso: botões levam até ele no modo certo ---- */
  function setAuthMode(mode) {
    if (typeof AuthForm === 'undefined' || !AuthForm.form) return;
    var wantLogin = mode !== 'register';
    if (AuthForm.isLogin !== wantLogin) AuthForm.toggleMode();
  }

  function goToAuth(mode) {
    setAuthMode(mode);
    var card = document.getElementById('cta');
    if (!card) return;
    card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    card.classList.remove('is-flash');
    void card.offsetWidth;
    card.classList.add('is-flash');
    var first = document.getElementById(mode === 'register' ? 'email' : 'username');
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, reduced ? 0 : 450);
  }

  function initAuthShortcuts() {
    document.querySelectorAll('[data-auth-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () { goToAuth(btn.getAttribute('data-auth-mode')); });
    });

    // Link de anúncio: /?cadastro ou /#criar-conta já abre no modo "Criar conta"
    var params = new URLSearchParams(window.location.search);
    if (params.has('cadastro') || window.location.hash === '#criar-conta') setAuthMode('register');
  }

  /* ---- Modal: esqueci minha senha ---- */
  function initForgotModal() {
    var modal = document.getElementById('forgotPasswordModal');
    var openBtn = document.getElementById('forgotPasswordBtn');
    var closeBtn = document.getElementById('forgotModalClose');
    if (!modal || !openBtn) return;

    function openModal() { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
    function closeModal() { modal.style.display = 'none'; document.body.style.overflow = ''; }

    openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
    });
  }

  /* ---- Tour: abas + avanço automático enquanto a seção está à vista ---- */
  function initTour() {
    var section = document.getElementById('produto');
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.lp-tab'));
    var url = document.getElementById('tourUrl');
    var count = document.getElementById('tourCount');
    if (!section || !tabs.length) return;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    var auto = !reduced, started = false, current = 0;

    function select(i, focus) {
      current = i;
      tabs.forEach(function (tab, j) {
        var on = j === i;
        var panel = document.getElementById(tab.getAttribute('aria-controls'));
        tab.classList.toggle('is-on', on);
        tab.classList.toggle('is-auto', on && auto && started);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        if (panel) {
          panel.hidden = !on;
          panel.classList.toggle('is-on', on);
          if (on && url) url.textContent = panel.getAttribute('data-url') || '';
        }
      });
      if (count) count.textContent = pad(i + 1) + ' / ' + pad(tabs.length);
      if (focus) tabs[i].focus();
      // no trilho horizontal (mobile), mantém a aba ativa à vista sem rolar a página
      var strip = tabs[i].parentElement;
      if (strip.scrollWidth > strip.clientWidth) {
        strip.scrollTo({ left: tabs[i].offsetLeft - 16, behavior: reduced ? 'auto' : 'smooth' });
      }
    }

    function stopAuto() {
      auto = false;
      tabs.forEach(function (t) { t.classList.remove('is-auto'); });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { stopAuto(); select(i); });

      // a barra de progresso da aba ativa dita o tempo de cada tela
      var bar = tab.querySelector('.lp-tab-progress span');
      if (bar) bar.addEventListener('animationend', function () {
        if (auto && tab.classList.contains('is-auto')) select((i + 1) % tabs.length);
      });

      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        stopAuto();
        select(next, true);
      });
    });

    // pausa enquanto a pessoa olha a tela com o mouse ou foco dentro dela
    var stage = section.querySelector('.lp-stage');
    function pause(on) { section.classList.toggle('is-paused', on); }
    stage.addEventListener('mouseenter', function () { pause(true); });
    stage.addEventListener('mouseleave', function () { pause(false); });

    onVisible(section, function (v) {
      if (v && !started) { started = true; select(current); }
      pause(!v);
    }, 0.35);

    // shadowing: palavras acendem em sequência, como karaokê
    document.querySelectorAll('#shadowLine span').forEach(function (w, i) {
      w.style.animationDelay = (0.5 + i * 0.22) + 's';
    });

    // shadowing: ondas determinísticas (nativo vs você, com um trecho descolado)
    function bars(el, seed, offIdx) {
      if (!el) return;
      var html = '';
      for (var i = 0; i < 56; i++) {
        var h = 18 + Math.abs(Math.sin(i * 0.55 + seed) * 62 + Math.sin(i * 1.7 + seed) * 20);
        var off = offIdx && i >= offIdx[0] && i <= offIdx[1];
        html += '<i' + (off ? ' class="is-off"' : '') + ' style="--h:' + Math.min(100, h).toFixed(0) + '%;animation-delay:' + (0.4 + i * 0.025).toFixed(2) + 's"></i>';
      }
      el.innerHTML = html;
    }
    bars(section.querySelector('.ps-bars--native'), 0.2);
    bars(section.querySelector('.ps-bars--you'), 0.5, [37, 42]);
  }

  /* ---- A Ponte: frango vira chicken quando a faixa entra na tela ---- */
  function initPonte() {
    var section = document.getElementById('ponte');
    var replay = document.getElementById('ponteReplay');
    var ipa = document.getElementById('ponteIpa');
    if (!section) return;

    var timer = null;
    function play() {
      section.classList.remove('is-swapped');
      clearTimeout(timer);
      timer = setTimeout(function () { section.classList.add('is-swapped'); }, reduced ? 0 : 1100);
    }

    var done = false;
    onVisible(section.querySelector('.lp-ponte-show'), function (v) {
      if (v && !done) { done = true; play(); }
    }, 0.5);

    if (replay) replay.addEventListener('click', play);

    if (ipa) ipa.addEventListener('click', function () {
      if (!('speechSynthesis' in window)) return;
      var u = new SpeechSynthesisUtterance('chicken');
      u.lang = 'en-US';
      u.rate = 0.85;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    });
  }

  /* ---- Níveis: portões enchem ao entrar na tela ---- */
  function initLevels() {
    var section = document.getElementById('niveis');
    onVisible(section, function (v) { if (v) section.classList.add('is-in'); }, 0.3);
  }

  /* ---- Analytics de clique (mesmo evento de antes) ---- */
  function initTracking() {
    document.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (window.Utils) Utils.track('button_click', {
          button_text: this.textContent.trim().slice(0, 60),
          button_class: this.className
        });
      });
    });
  }

  /* ---- Fotos de fundo da hero: seletor temporário p/ comparar e escolher ---- */
  function initHeroPhotos() {
    var media = document.getElementById('heroMedia');
    var picker = document.getElementById('heroPicker');
    if (!media || !picker) return;

    var slides = media.querySelectorAll('.v5-hero-slide');
    var dots = picker.querySelectorAll('.v5-hero-picker-dots i');
    var label = document.getElementById('heroPickerLabel');
    var names = { estudo: 'Estudo à noite', dicionarios: 'Dicionários', biblioteca: 'Biblioteca' };
    var current = 0;

    function show(i) {
      current = (i + slides.length) % slides.length;
      var photo = slides[current].getAttribute('data-photo');
      slides.forEach(function (s, n) { s.classList.toggle('is-on', n === current); });
      dots.forEach(function (d, n) { d.classList.toggle('is-on', n === current); });
      media.setAttribute('data-photo', photo);
      if (label) label.textContent = (current + 1) + '/' + slides.length + ' · ' + names[photo];
    }

    picker.querySelectorAll('[data-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        show(current + Number(btn.getAttribute('data-step')));
      });
    });

    picker.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    });
  }

  /* ---- Entrada coreografada da hero (GSAP, se disponível) ---- */
  function initHeroTimeline() {
    if (reduced || typeof gsap === 'undefined') return;
    try {
      var words = document.querySelectorAll('#heroHeadline .v5-headline-word');
      var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.from('#heroTag', { opacity: 0, y: 12, duration: 0.45 })
        .from(words, { opacity: 0, y: 16, duration: 0.55, stagger: 0.028 }, 0.15)
        .from('#heroPillars li', { opacity: 0, y: 10, duration: 0.45, stagger: 0.08 }, 0.1)
        .from('#heroSub', { opacity: 0, y: 12, duration: 0.5 }, '-=0.35')
        .from(['#heroActions', '#heroMeta'], { opacity: 0, y: 10, duration: 0.45, stagger: 0.08 }, '-=0.3');
    } catch (err) {
      console.warn('Timeline da hero não pôde rodar:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAuthShortcuts();
    initForgotModal();
    initHeroPhotos();
    initTour();
    initPonte();
    initLevels();
    initTracking();
    initHeroTimeline();
  });
})();
