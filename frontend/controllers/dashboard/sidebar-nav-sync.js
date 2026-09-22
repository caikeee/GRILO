// Bootstrap do painel: iniciais do avatar + primeiro load de stats.
// (A sincronização de estado ativo da nav é feita pelo próprio switchTab,
// que ativa .nav-btn[data-tab] — os botões da topbar carregam data-tab.)
document.addEventListener('DOMContentLoaded', () => {
    // Set avatar initials from username
    const user = sessionStorage.getItem('grilo_user');
    if (user) {
        try {
            const u = JSON.parse(user);
            const av = document.getElementById('userAvatarInitials');
            if (av && u.username) av.textContent = u.username.slice(0, 2).toUpperCase();
        } catch(e) {}
    }

    // Load stats for the initial Meu Painel tab
    setTimeout(() => {
        if (typeof window.loadUserStats === 'function') window.loadUserStats();
    }, 400);
});
