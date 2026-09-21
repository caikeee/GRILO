/**
 * Cápsula de comando da home.
 * O losango da marca é o único elemento visível; ao clicar, o painel inteiro
 * (marca, navegação, usuário, sair) cresce a partir dele.
 *
 * Os itens mantêm .nav-btn[data-tab], então switchTab() continua marcando o
 * item ativo sem saber que a topbar virou painel.
 */
(function () {
    'use strict';

    function init() {
        var root = document.getElementById('cmdRoot');
        var trigger = document.getElementById('cmdTrigger');
        var panel = document.getElementById('cmdPanel');
        var scrim = document.getElementById('cmdScrim');
        if (!root || !trigger || !panel) return;

        var lastFocus = null;

        function setOpen(open) {
            if (open === root.classList.contains('open')) return;

            root.classList.toggle('open', open);
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
            trigger.setAttribute(
                'aria-label',
                open ? 'Fechar menu de navegação' : 'Abrir menu de navegação'
            );

            if (open) {
                panel.removeAttribute('inert');
                lastFocus = document.activeElement;
                // Espera a entrada escalonada começar antes de focar o 1º item.
                window.setTimeout(function () {
                    var first = panel.querySelector('.cmd-item:not([style*="display:none"])');
                    if (first && root.classList.contains('open')) first.focus();
                }, 160);
            } else {
                // Tira o foco de dentro antes de marcar inert, senão o browser
                // reclama de foco em subárvore inerte.
                if (panel.contains(document.activeElement)) {
                    (lastFocus && document.contains(lastFocus) ? lastFocus : trigger).focus();
                }
                panel.setAttribute('inert', '');
            }
        }

        trigger.addEventListener('click', function (ev) {
            ev.stopPropagation();
            setOpen(!root.classList.contains('open'));
        });

        if (scrim) {
            scrim.addEventListener('click', function () { setOpen(false); });
        }

        // Clique fora fecha
        document.addEventListener('click', function (ev) {
            if (!root.classList.contains('open')) return;
            if (!root.contains(ev.target)) setOpen(false);
        });

        // Esc fecha
        document.addEventListener('keydown', function (ev) {
            if (ev.key === 'Escape' && root.classList.contains('open')) {
                ev.stopPropagation();
                setOpen(false);
            }
        });

        // Navegar por ↑/↓ dentro do painel
        panel.addEventListener('keydown', function (ev) {
            if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') return;
            var items = Array.prototype.filter.call(
                panel.querySelectorAll('.cmd-item'),
                function (el) { return el.offsetParent !== null; }
            );
            if (!items.length) return;
            ev.preventDefault();
            var i = items.indexOf(document.activeElement);
            var next = ev.key === 'ArrowDown' ? i + 1 : i - 1;
            if (next < 0) next = items.length - 1;
            if (next >= items.length) next = 0;
            items[next].focus();
        });

        // Escolher um item fecha o painel. Links navegam sozinhos; para os
        // botões (Painel/Admin) o onclick inline já rodou quando chegamos aqui.
        panel.addEventListener('click', function (ev) {
            if (ev.target.closest('.cmd-item')) setOpen(false);
        });

        // O título do painel acompanha a seção atual.
        var headTitle = document.getElementById('cmdHeadTitle');
        if (headTitle && window.MutationObserver) {
            var sync = function () {
                var active = panel.querySelector('.cmd-item.active .cmd-item-copy b');
                if (active) headTitle.textContent = active.textContent;
            };
            new MutationObserver(sync).observe(panel, {
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
            sync();
        }

        // Ponto âmbar no gatilho enquanto a streak estiver ativa — o painel
        // fechado ainda precisa sinalizar que há algo lá dentro.
        var dot = document.getElementById('cmdTriggerDot');
        var streak = document.getElementById('streakTopbar');
        if (dot && streak && window.MutationObserver) {
            var syncDot = function () {
                var visible = streak.style.display !== 'none';
                dot.classList.toggle('on', visible && !root.classList.contains('open'));
            };
            new MutationObserver(syncDot).observe(streak, {
                attributes: true,
                attributeFilter: ['style']
            });
            syncDot();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
