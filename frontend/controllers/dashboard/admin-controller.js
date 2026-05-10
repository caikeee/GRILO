/**
 * GRILO Admin Controller
 * Handles user management and password reset functionality for admins
 */

function _adminEscape(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
}

// Check if current user is admin and show/hide admin tab
async function checkAdminStatus() {
    const token = localStorage.getItem('grilo_token');
    if (!token) return;

    try {
        const res = await fetch('/api/admin/check', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        const adminTab = document.getElementById('adminTabBtn');
        if (data.is_admin && adminTab) {
            adminTab.style.display = 'block';
        }
        const adminNav = document.getElementById('adminNavBtn');
        if (data.is_admin && adminNav) {
            adminNav.style.display = 'flex';
        }
        if (data.is_admin) {
            console.log('✅ Admin mode enabled for:', data.username);
        }
    } catch (err) {
        console.error('❌ Admin check failed:', err);
    }
}

// Load all users
async function loadAdminUsers() {
    const token = localStorage.getItem('grilo_token');
    if (!token) return;

    try {
        const res = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error('Failed to load users');
        }

        const users = await res.json();
        const list = document.getElementById('adminUsersList');

        if (!list) return;

        list.innerHTML = '';
        users.forEach(u => {
            const item = document.createElement('div');
            item.className = 'admin-user-item';

            const info = document.createElement('div');
            info.className = 'admin-user-info';
            const nameEl = document.createElement('span');
            nameEl.className = 'admin-user-name';
            nameEl.textContent = u.username;
            const emailEl = document.createElement('span');
            emailEl.className = 'admin-user-email';
            emailEl.textContent = u.email;
            info.appendChild(nameEl);
            info.appendChild(emailEl);

            const stats = document.createElement('div');
            stats.className = 'admin-user-stats';
            const lvl = document.createElement('span');
            lvl.className = 'admin-stat';
            lvl.textContent = `Level ${Number(u.level) || 0}`;
            const xp = document.createElement('span');
            xp.className = 'admin-stat';
            xp.textContent = `${Number(u.xp) || 0} XP`;
            stats.appendChild(lvl);
            stats.appendChild(xp);
            if (u.is_admin) {
                const badge = document.createElement('span');
                badge.className = 'admin-badge';
                badge.textContent = 'ADMIN';
                stats.appendChild(badge);
            }

            const btn = document.createElement('button');
            btn.className = 'btn-admin-small';
            btn.textContent = 'Reset Senha';
            btn.addEventListener('click', () => selectUserForReset(u.username));

            item.appendChild(info);
            item.appendChild(stats);
            item.appendChild(btn);
            list.appendChild(item);
        });

        console.log('✅ Loaded', users.length, 'users');
    } catch (err) {
        console.error('❌ Error loading users:', err);
        showAdminMessage('Erro ao carregar usuários', 'error');
    }
}

// Select user and prefill username field
function selectUserForReset(username) {
    const usernameField = document.getElementById('adminUsername');
    if (usernameField) {
        usernameField.value = username;
        usernameField.focus();
    }
}

// Reset password for a user
async function adminResetPassword() {
    const token = localStorage.getItem('grilo_token');
    const username = document.getElementById('adminUsername').value.trim();
    const newPassword = document.getElementById('adminNewPassword').value;

    if (!username || !newPassword) {
        showAdminMessage('Preencha usuário e nova senha', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showAdminMessage('Senha deve ter pelo menos 8 caracteres', 'error');
        return;
    }

    try {
        const res = await fetch('/api/admin/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                username,
                new_password: newPassword
            })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Falha ao redefinir senha');
        }

        const result = await res.json();
        showAdminMessage(`Senha redefinida com sucesso`, 'success');

        // Clear form
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminNewPassword').value = '';

    } catch (err) {
        console.error('❌ Error resetting password:', err);
        showAdminMessage(`❌ Erro: ${err.message}`, 'error');
    }
}

// Show admin message
function showAdminMessage(msg, type = 'info') {
    const messageDiv = document.getElementById('adminResetMessage');
    if (!messageDiv) return;

    messageDiv.className = `admin-message admin-message--${type}`;
    messageDiv.textContent = msg;
    messageDiv.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 4000);
    }
}

// Search users
function setupAdminSearch() {
    const searchInput = document.getElementById('adminSearchUser');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.admin-user-item');

        items.forEach(item => {
            const username = item.querySelector('.admin-user-name').textContent.toLowerCase();
            const email = item.querySelector('.admin-user-email').textContent.toLowerCase();

            if (username.includes(query) || email.includes(query)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// Load business/PMF metrics
async function loadAdminMetrics() {
    const token = localStorage.getItem('grilo_token');
    const grid = document.getElementById('adminMetricsGrid');
    const cohortEl = document.getElementById('adminMetricsCohort');
    if (!token || !grid) return;

    grid.innerHTML = '<div style="opacity:0.6;">Carregando métricas...</div>';

    try {
        const res = await fetch('/api/admin/pmf/metrics', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const m = data.metrics || {};
        const totals = data.totals || {};

        const statusColor = (s) => s === 'ok' ? '#22c55e' : s === 'warn' ? '#f59e0b' : '#ef4444';
        const card = (label, value, sub, status) => {
            const c = document.createElement('div');
            c.style.cssText = 'background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px;';
            const lbl = document.createElement('div');
            lbl.style.cssText = 'font-size:11px;text-transform:uppercase;opacity:0.7;letter-spacing:0.5px;';
            lbl.textContent = label;
            const val = document.createElement('div');
            val.style.cssText = `font-size:24px;font-weight:700;margin-top:4px;color:${status ? statusColor(status) : 'inherit'};`;
            val.textContent = value;
            c.appendChild(lbl);
            c.appendChild(val);
            if (sub) {
                const s = document.createElement('div');
                s.style.cssText = 'font-size:11px;opacity:0.6;margin-top:2px;';
                s.textContent = sub;
                c.appendChild(s);
            }
            return c;
        };

        grid.innerHTML = '';
        grid.appendChild(card('Total de cadastros', totals.signups_total ?? 0, 'usuários no sistema'));
        grid.appendChild(card('Acessaram voz', totals.users_with_voice_session ?? 0, 'usaram chat de voz'));

        const act = m.activation_d0 || {};
        grid.appendChild(card('Ativação D0', `${act.percent ?? 0}%`,
            `${act.numerator ?? 0}/${act.denominator ?? 0} · meta ${act.target ?? 50}%`, act.status));

        const ret = m.retention_cohort || {};
        grid.appendChild(card('Retenção D7', `${ret.avg_d7_percent ?? 0}%`, `meta ${ret.target_d7 ?? 35}%`, ret.status_d7));
        grid.appendChild(card('Retenção D30', `${ret.avg_d30_percent ?? 0}%`, `meta ${ret.target_d30 ?? 20}%`, ret.status_d30));

        const spu = m.sessions_per_user_week || {};
        grid.appendChild(card('Sessões/usuário/sem', spu.avg_sessions_per_user_per_week ?? 0,
            `${spu.active_users ?? 0} ativos · meta ${spu.target ?? 2.5}`, spu.status));

        const mpu = m.minutes_per_user_week || {};
        grid.appendChild(card('Minutos/usuário/sem', mpu.avg_minutes_per_user_per_week ?? 0,
            `total ${mpu.total_minutes ?? 0} min · meta ${mpu.target ?? 15}`, mpu.status));

        const pay = m.paywall_conversion || {};
        grid.appendChild(card('Conversão paywall', `${pay.conversion_percent ?? 0}%`,
            `${pay.payment_completed ?? 0}/${pay.paywall_viewed ?? 0} · meta ${pay.target ?? 3}%`, pay.status));
        grid.appendChild(card('Receita período', `R$ ${pay.revenue_brl_period ?? 0}`,
            `${pay.paying_users_total ?? 0} pagantes · ${pay.weeks ?? 4} sem`));

        const se = m.sean_ellis_eligibility || {};
        grid.appendChild(card('Aptos pesquisa PMF', se.eligible_users ?? 0,
            `${se.ready_to_survey ? '✓ pronto' : `meta ${se.target ?? 30}`}`));

        // Cohort heatmap
        if (cohortEl && ret.rows && ret.rows.length) {
            const cells = ret.week_offsets || [0, 1, 2, 3, 4, 8];
            let html = '<h4 style="margin:0 0 8px;">Cohorts semanais (retenção)</h4>';
            html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;">';
            html += '<thead><tr><th style="text-align:left;padding:6px;opacity:0.7;">Semana</th><th style="padding:6px;opacity:0.7;">N</th>';
            cells.forEach(w => { html += `<th style="padding:6px;opacity:0.7;">W${w}</th>`; });
            html += '</tr></thead><tbody>';
            ret.rows.forEach(r => {
                html += `<tr><td style="padding:6px;opacity:0.85;">${r.cohort_week}</td><td style="padding:6px;text-align:center;">${r.cohort_size}</td>`;
                cells.forEach(w => {
                    const v = r.cells[`W${w}`];
                    if (v == null) { html += '<td style="padding:6px;text-align:center;opacity:0.3;">—</td>'; }
                    else {
                        const bg = v >= 35 ? 'rgba(34,197,94,0.25)' : v >= 15 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.15)';
                        html += `<td style="padding:6px;text-align:center;background:${bg};">${v}%</td>`;
                    }
                });
                html += '</tr>';
            });
            html += '</tbody></table></div>';
            cohortEl.innerHTML = html;
        }

        console.log('✅ Métricas admin carregadas');
    } catch (err) {
        console.error('❌ Erro ao carregar métricas:', err);
        grid.innerHTML = `<div style="color:#ef4444;">Erro ao carregar métricas: ${err.message}</div>`;
    }
}

// Initialize admin section when tab is switched
document.addEventListener('DOMContentLoaded', () => {
    checkAdminStatus();
    setupAdminSearch();

    // Hook into switchTab to lazy-load admin data when tab opens
    const tryHook = () => {
        const orig = window.switchTab;
        if (typeof orig !== 'function') { setTimeout(tryHook, 100); return; }
        if (orig.__adminHooked) return;
        const wrapped = function(tabName) {
            const r = orig.apply(this, arguments);
            if (tabName === 'admin') {
                loadAdminUsers();
                loadAdminMetrics();
            }
            return r;
        };
        wrapped.__adminHooked = true;
        window.switchTab = wrapped;
    };
    tryHook();
});
