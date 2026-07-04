// Keep sidebar nav buttons in sync with voice-first tabs: painel + chat-voice
// Auto-open voice sessions panel when entering voice tab
document.addEventListener('DOMContentLoaded', () => {
    const tryHook = () => {
        const orig = window.switchTab;
        if (typeof orig !== 'function') { setTimeout(tryHook, 100); return; }
        if (orig.__sidebarNavHooked) return;

        const wrapped = function(tabName) {
            try {
                orig(tabName);
            } catch (error) {
                console.error('[switchTab wrapper] Erro ao executar:', error);
            }

            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            const map = { 'painel': 0 };
            const navBtns = document.querySelectorAll('.nav-btn');
            if (navBtns[map[tabName]] !== undefined) navBtns[map[tabName]].classList.add('active');

            if (typeof window.closePanels === 'function') {
                window.closePanels();
            }

            // Load user stats when switching to the painel tab
            if (tabName === 'painel') {
                if (typeof window.renderActivityHeatmap === 'function') window.renderActivityHeatmap(window._lastActivity || {});
                if (typeof window.loadUserStats === 'function') window.loadUserStats();
            }
        };
        wrapped.__sidebarNavHooked = true;
        window.switchTab = wrapped;
    };
    tryHook();

    const user = localStorage.getItem('grilo_user');

    // Set avatar initials from username
    if (user) {
        try {
            const u = JSON.parse(user);
            const av = document.getElementById('userAvatarInitials');
            if (av && u.username) av.textContent = u.username.slice(0, 2).toUpperCase();
        } catch(e) {}
    }

    // Load stats for the initial Meu Painel tab
    setTimeout(() => {
        // Render the heatmap skeleton immediately (no auth needed)
        if (typeof window.renderActivityHeatmap === 'function') window.renderActivityHeatmap({});
        if (typeof window.loadUserStats === 'function') window.loadUserStats();
    }, 400);
});
