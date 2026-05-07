/**
 * GRILO Admin Controller
 * Handles user management and password reset functionality for admins
 */

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

        list.innerHTML = users.map(u => `
            <div class="admin-user-item">
                <div class="admin-user-info">
                    <span class="admin-user-name">${u.username}</span>
                    <span class="admin-user-email">${u.email}</span>
                </div>
                <div class="admin-user-stats">
                    <span class="admin-stat">Level ${u.level}</span>
                    <span class="admin-stat">${u.xp} XP</span>
                    ${u.is_admin ? '<span class="admin-badge">ADMIN</span>' : ''}
                </div>
                <button class="btn-admin-small" onclick="selectUserForReset('${u.username}')">Reset Senha</button>
            </div>
        `).join('');

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
        showAdminMessage(`✅ Senha de "${username}" redefinida com sucesso`, 'success');

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

// Initialize admin section when tab is switched
document.addEventListener('DOMContentLoaded', () => {
    checkAdminStatus();
});
