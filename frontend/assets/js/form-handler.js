/** ================================
    GRILO - FORM HANDLER
    Auth, Validation, API calls to grilo.db
    ================================ */
'use strict';

// API_BASE_URL is defined globally in utils.js

/* ---- Toast notification ---- */
function showToast(message, type) {
  // type: 'success' | 'error'
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast toast--' + type;
  toast.textContent = message;
  container.appendChild(toast);

  // Auto-remove after 4s
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    setTimeout(function() { toast.remove(); }, 300);
  }, 4000);
}

/* ---- Auth Form Manager ---- */
const AuthForm = {
  isLogin: true,

  init() {
    this.form      = document.getElementById('authForm');
    this.username   = document.getElementById('username');
    this.email      = document.getElementById('email');
    this.password   = document.getElementById('password');
    this.submitBtn  = this.form ? this.form.querySelector('button[type="submit"]') : null;
    this.toggleBtn  = document.getElementById('toggleBtn');

    if (!this.form) { console.warn('[GRILO] authForm not found'); return; }

    console.log('[GRILO] AuthForm.init() — attaching submit handler');
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    if (this.toggleBtn) this.toggleBtn.addEventListener('click', () => this.toggleMode());
  },

  /* ---- Submit: calls /api/login or /api/register ---- */
  async handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('[GRILO] handleSubmit fired, isLogin:', this.isLogin);
    this.hideError();

    if (!this.validate()) return;

    const isLogin  = this.isLogin;
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const body = isLogin
      ? { username: this.username.value.trim(), password: this.password.value }
      : { username: this.username.value.trim(), email: this.email.value.trim(), password: this.password.value };

    this.setLoading(true);

    try {
      console.log('[GRILO] POST ' + endpoint, body);

      const res = await fetch(API_BASE_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      console.log('[GRILO] Response:', res.status, data);

      if (!res.ok) {
        const msg = (typeof data.detail === 'string')
          ? data.detail
          : (isLogin ? 'Usuário ou senha inválidos.' : 'Não foi possível criar a conta.');
        this.showError(msg);
        showToast(msg, 'error');
        return;
      }

      /* --- SUCCESS --- */
      if (isLogin) {
        /* LOGIN: save token + redirect to home */
        const token = data.access_token;
        if (!token) {
          this.showError('Resposta inesperada do servidor.');
          showToast('Erro: servidor não retornou token.', 'error');
          return;
        }
        localStorage.setItem('grilo_token', token);
        localStorage.setItem('grilo_user', JSON.stringify(data.user));
        console.log('[GRILO] Token salvo:', token.substring(0, 20) + '...');
        console.log('[GRILO] User salvo:', data.user.username);
        console.log('[GRILO] localStorage keys:', Object.keys(localStorage));
        
        // Setar flag para mostrar modal BETA na home
        sessionStorage.setItem('grilo_login_session_started', 'true');
        console.log('[GRILO] Flag de login setado para mostrar modal BETA');
        
        showToast('Login realizado com sucesso!', 'success');
        setTimeout(function() {
          console.log('[GRILO] Redirecionando para /home.html');
          window.location.href = '/home.html';
        }, 800);
      } else {
        /* REGISTER: stay on landing, switch form to login mode */
        console.log('[GRILO] Conta criada. Alternando para modo login.');
        showToast('Conta criada com sucesso! Agora faça login.', 'success');
        var self = this;
        setTimeout(function() {
          self.toggleMode();
        }, 1000);
      }

    } catch (err) {
      console.error('[GRILO] Network error:', err);
      this.showError('Erro de conexão. Verifique se o servidor está rodando.');
      showToast('Sem conexão com o servidor.', 'error');
    } finally {
      this.setLoading(false);
    }
  },

  /* ---- Toggle Login / Register ---- */
  toggleMode() {
    this.isLogin = !this.isLogin;
    this.hideError();

    if (this.isLogin) {
      document.getElementById('formTitle').textContent    = 'Entrar';
      document.getElementById('formSubtitle').textContent = 'Acesse seu plano.';
      document.getElementById('submitText').textContent   = 'Entrar';
      document.getElementById('toggleText').textContent   = 'Novo aqui?';
      this.toggleBtn.textContent    = 'Criar conta';
      document.getElementById('registerFields').style.display = 'none';
      this.email.removeAttribute('required');
    } else {
      document.getElementById('formTitle').textContent    = 'Criar conta';
      document.getElementById('formSubtitle').textContent = 'Crie e comece hoje.';
      document.getElementById('submitText').textContent   = 'Criar';
      document.getElementById('toggleText').textContent   = 'Já tem conta?';
      this.toggleBtn.textContent    = 'Entrar';
      document.getElementById('registerFields').style.display = 'block';
      this.email.setAttribute('required', 'required');
    }
    this.clearForm();
  },

  /* ---- Validation ---- */
  validate() {
    let ok = true;

    if (!this.username.value.trim()) {
      this.setFieldError(this.username, 'Campo obrigatório'); ok = false;
    } else if (this.username.value.trim().length < 3) {
      this.setFieldError(this.username, 'Mínimo 3 caracteres'); ok = false;
    } else {
      this.clearFieldError(this.username);
    }

    if (!this.isLogin) {
      if (!this.email.value.trim()) {
        this.setFieldError(this.email, 'Campo obrigatório'); ok = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.value)) {
        this.setFieldError(this.email, 'Email inválido'); ok = false;
      } else {
        this.clearFieldError(this.email);
      }
    }

    if (!this.password.value) {
      this.setFieldError(this.password, 'Campo obrigatório'); ok = false;
    } else if (this.password.value.length < 6) {
      this.setFieldError(this.password, 'Mínimo 6 caracteres'); ok = false;
    } else {
      this.clearFieldError(this.password);
    }

    return ok;
  },

  /* ---- UI Helpers ---- */
  setLoading(on) {
    if (this.submitBtn) this.submitBtn.disabled = on;
    const span = document.getElementById('submitText');
    if (!span) return;
    if (on) span.textContent = this.isLogin ? 'Entrando…' : 'Criando…';
    else     span.textContent = this.isLogin ? 'Entrar' : 'Criar';
  },

  showError(msg) {
    const el = document.getElementById('authError');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  },

  hideError() {
    const el = document.getElementById('authError');
    if (el) { el.style.display = 'none'; el.textContent = ''; }
  },

  setFieldError(field, msg) {
    const g = field.closest('.form-group');
    if (!g) return;
    g.classList.add('error');
    let err = g.querySelector('.form-error');
    if (!err) { err = document.createElement('div'); err.className = 'form-error'; g.appendChild(err); }
    err.textContent = msg;
  },

  clearFieldError(field) {
    const g = field.closest('.form-group');
    if (!g) return;
    g.classList.remove('error');
    const err = g.querySelector('.form-error');
    if (err) err.remove();
  },

  clearForm() {
    this.form.reset();
    this.form.querySelectorAll('.form-group').forEach(function(g) {
      g.classList.remove('error');
      const err = g.querySelector('.form-error');
      if (err) err.remove();
    });
  }
};

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', function() { AuthForm.init(); });
