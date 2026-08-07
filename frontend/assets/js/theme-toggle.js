/* ====================================================================
   THEME TOGGLE — controlador do tema claro/escuro.
   - O tema inicial já é aplicado por um script inline no <head> (anti-flash).
   - Aqui apenas conectamos o botão e persistimos a escolha do usuário.
   - data-theme="dark" | "light" fica no <html>; a escolha vai pro localStorage.
==================================================================== */
(function () {
    'use strict';

    var STORAGE_KEY = 'grilo-theme';
    var root = document.documentElement;
    var mql = window.matchMedia('(prefers-color-scheme: dark)');

    function current() {
        return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function apply(theme) {
        root.setAttribute('data-theme', theme);
    }

    function syncButton(btn) {
        var isDark = current() === 'dark';
        btn.setAttribute('aria-pressed', String(isDark));
        btn.setAttribute('title', isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro');
    }

    document.addEventListener('DOMContentLoaded', function () {
        var btn = document.getElementById('themeToggle');
        if (!btn) return;

        syncButton(btn);

        btn.addEventListener('click', function () {
            var next = current() === 'dark' ? 'light' : 'dark';
            apply(next);
            try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
            syncButton(btn);

            // "pop" elástico de um disparo (reinicia a animação a cada clique)
            btn.classList.remove('is-animating');
            void btn.offsetWidth; // força reflow p/ reiniciar a animação
            btn.classList.add('is-animating');

            if (window.Utils && typeof Utils.track === 'function') {
                Utils.track('theme_toggle', { theme: next });
            }
        });

        btn.addEventListener('animationend', function () {
            btn.classList.remove('is-animating');
        });
    });

    // Se o usuário ainda não escolheu manualmente, acompanha a mudança do SO.
    function onSystemChange(e) {
        var saved;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (err) { saved = null; }
        if (saved === 'dark' || saved === 'light') return; // escolha manual tem prioridade
        apply(e.matches ? 'dark' : 'light');
        var btn = document.getElementById('themeToggle');
        if (btn) syncButton(btn);
    }

    if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', onSystemChange);
    } else if (typeof mql.addListener === 'function') {
        mql.addListener(onSystemChange); // navegadores antigos
    }
})();
