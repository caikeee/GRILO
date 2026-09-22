    (function() {
        var _obWhy = '', _obInterest = '';

        function obShow() {
            var bd = document.getElementById('griloOnboardingBackdrop');
            if (bd) { bd.style.display = 'flex'; }
        }

        function obHide() {
            var bd = document.getElementById('griloOnboardingBackdrop');
            if (bd) { bd.style.display = 'none'; }
        }

        // Seleção via classe (não inline) para o estado respeitar o tema claro/escuro.
        window.obSelectWhy = function(btn) {
            document.querySelectorAll('.ob-opt').forEach(function(b) {
                b.classList.remove('is-selected');
            });
            btn.classList.add('is-selected');
            _obWhy = btn.getAttribute('data-val');
        };

        window.obSelectInterest = function(btn) {
            document.querySelectorAll('.ob-opt2').forEach(function(b) {
                b.classList.remove('is-selected');
            });
            btn.classList.add('is-selected');
            _obInterest = btn.getAttribute('data-val');
        };

        window.obNextStep = function() {
            document.getElementById('obStep1').style.display = 'none';
            document.getElementById('obStep2').style.display = 'block';
            document.getElementById('obStep2Bar').classList.add('is-done');
        };

        window.obSkip = function() { obSave('', ''); };

        window.obFinish = function() { obSave(_obWhy, _obInterest); };

        function obSave(why, interest) {
            obHide();
            localStorage.setItem('grilo_onboarding_done', '1');
            if (!why && !interest) return;
            var token = sessionStorage.getItem('grilo_token');
            if (!token) return;
            fetch('/api/user/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ learning_why: why || 'Geral', daily_interests: interest || 'Geral' })
            }).catch(function() {});
        }

        function loadProfile() {
            var token = sessionStorage.getItem('grilo_token');
            if (!token) return;
            fetch('/api/user/profile', { headers: { 'Authorization': 'Bearer ' + token } })
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    // Streak pill
                    if (data.streak && data.streak > 0) {
                        var pill = document.getElementById('streakTopbar');
                        var num = document.getElementById('streakTopbarNum');
                        if (pill) { pill.style.display = 'flex'; }
                        if (num) { num.textContent = data.streak; }
                    }
                    // Mostrar onboarding se nunca completou
                    if (!localStorage.getItem('grilo_onboarding_done') && data.onboarding_step < 4) {
                        setTimeout(obShow, 800);
                    }
                })
                .catch(function() {});
        }

        // XP Toast global
        window.griloShowXpToast = function(xp) {
            if (!xp || xp <= 0) return;
            var t = document.getElementById('griloXpToast');
            if (!t) return;
            t.textContent = '⚡ +' + xp + ' XP';
            t.style.display = 'block';
            t.style.animation = 'none';
            t.offsetHeight; // reflow
            t.style.animation = 'griloToastIn .4s cubic-bezier(.34,1.56,.64,1)';
            setTimeout(function() { t.style.display = 'none'; }, 2500);
        };

        // Injetar keyframe se não existir
        if (!document.getElementById('griloToastStyle')) {
            var s = document.createElement('style');
            s.id = 'griloToastStyle';
            s.textContent = '@keyframes griloToastIn{from{opacity:0;transform:translateY(-8px) scale(.85)}to{opacity:1;transform:translateY(0) scale(1)}}';
            document.head.appendChild(s);
        }

        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(loadProfile, 600);
        });
    })();
