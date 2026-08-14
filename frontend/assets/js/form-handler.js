/** ================================
    GRILO - FORM HANDLER
    Auth, Validation, API calls to grilo.db
    ================================ */
'use strict';

// API_BASE_URL is defined globally in utils.js
// RegistrationValidator is defined in registration-validator.js

// Debounce helper para verificações de disponibilidade
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

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
  availabilityChecks: {}, // Cache de checks já feitos

  init() {
    this.form      = document.getElementById('authForm');
    this.username   = document.getElementById('username');
    this.email      = document.getElementById('email');
    this.password   = document.getElementById('password');
    this.submitBtn  = this.form ? this.form.querySelector('button[type="submit"]') : null;
    this.toggleBtn  = document.getElementById('toggleBtn');

    if (!this.form) { console.warn('[GRILO] authForm not found'); return; }

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    if (this.toggleBtn) this.toggleBtn.addEventListener('click', () => this.toggleMode());

    // Validação em tempo real
    if (this.username) {
      this.username.addEventListener('blur', () => this.validateUsernameField());
      this.username.addEventListener('input', () => this.validateUsernameField());
    }
    if (this.email) {
      this.email.addEventListener('blur', () => this.validateEmailField());
      this.email.addEventListener('input', debounce(() => this.validateEmailField(), 300));
    }
    if (this.password) {
      this.password.addEventListener('input', () => this.validatePasswordField());
      this.password.addEventListener('blur', () => this.validatePasswordField());
    }
  },

  /**
   * Valida campo username com feedback visual
   */
  validateUsernameField() {
    if (this.isLogin) return; // Só validar em registro

    const validation = RegistrationValidator.validateUsername(this.username.value);

    if (validation.errors.length > 0) {
      this.setFieldError(this.username, validation.errors[0]);
    } else {
      this.clearFieldError(this.username);
      // Mostrar dica de sucesso
      if (validation.warnings.length > 0) {
        this.setFieldHint(this.username, validation.warnings[0], 'warning');
      } else {
        this.setFieldHint(this.username, '✓ Username válido', 'success');
      }
    }
  },

  /**
   * Valida campo email com feedback visual
   */
  validateEmailField() {
    if (this.isLogin) return;

    const validation = RegistrationValidator.validateEmail(this.email.value);

    if (validation.errors.length > 0) {
      this.setFieldError(this.email, validation.errors[0]);
    } else {
      this.clearFieldError(this.email);
      this.setFieldHint(this.email, '✓ Email válido', 'success');

      // Verificar disponibilidade no servidor (debounced)
      this.checkEmailAvailability(this.email.value);
    }
  },

  /**
   * Valida campo password com feedback visual e barra de força
   */
  validatePasswordField() {
    if (this.isLogin) return;

    const analysis = RegistrationValidator.analyzePassword(this.password.value);
    const group = this.password.closest('.form-group');
    if (!group) return;

    // Remover barra antiga
    const oldBar = group.querySelector('.password-strength-bar');
    if (oldBar) oldBar.remove();
    const oldHint = group.querySelector('.password-hint');
    if (oldHint) oldHint.remove();

    if (analysis.errors.length > 0) {
      this.setFieldError(this.password, analysis.errors[0]);
      return;
    }

    // Campo válido
    this.clearFieldError(this.password);

    // Criar barra de força
    const bar = document.createElement('div');
    bar.className = 'password-strength-bar';
    const barInner = document.createElement('div');
    barInner.className = `password-strength-fill strength-${analysis.strength}`;
    barInner.style.width = `${analysis.score}%`;
    bar.appendChild(barInner);
    group.appendChild(bar);

    // Mostrar feedback
    const hint = document.createElement('div');
    hint.className = 'password-hint';
    hint.textContent = `${analysis.feedback[0] || ''} (${analysis.score}/100)`;
    group.appendChild(hint);
  },

  /**
   * Verifica disponibilidade de email no servidor
   */
  checkEmailAvailability(email) {
    if (!email || !RegistrationValidator.validateEmail(email).valid) return;

    // Evitar requisições repetidas
    const cacheKey = `email_${email}`;
    if (this.availabilityChecks[cacheKey]) {
      if (this.availabilityChecks[cacheKey].available) {
        this.setFieldHint(this.email, '✓ Email disponível', 'success');
      }
      return;
    }

    // Fazer check no servidor
    fetch(API_BASE_URL + '/api/register/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: 'email', value: email })
    })
    .then(res => res.json())
    .then(data => {
      this.availabilityChecks[cacheKey] = data;

      if (!data.available) {
        this.setFieldError(this.email, 'Email já cadastrado. Use outro ou faça login.');
      } else {
        this.setFieldHint(this.email, '✓ Email disponível', 'success');
      }
    })
    .catch(err => {
      console.warn('[GRILO] Email check failed:', err);
      // Não bloquear se falhar o check
    });
  },

  /* ---- Submit: calls /api/login or /api/register ---- */
  async handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    this.hideError();

    if (!this.validate()) return;

    const isLogin  = this.isLogin;
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const body = isLogin
      ? { username: this.username.value.trim(), password: this.password.value }
      : { username: this.username.value.trim(), email: this.email.value.trim(), password: this.password.value };

    this.setLoading(true);

    try {
      const res = await fetch(API_BASE_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        let msg;
        if (typeof data.detail === 'string') {
          msg = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          // Pydantic validation errors
          const first = data.detail[0];
          const field = (first.loc && first.loc[first.loc.length - 1]) || 'campo';
          const fieldLabel = { username: 'usuário', password: 'senha', email: 'e-mail' }[field] || field;
          msg = `${fieldLabel}: ${first.msg || 'inválido'}`;
        } else {
          msg = isLogin ? 'Usuário ou senha inválidos.' : 'Não foi possível criar a conta.';
        }
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
        localStorage.setItem('grilo_analytics_ping', String(Date.now()));

        showToast('Login realizado com sucesso!', 'success');
        setTimeout(function() {
          window.location.href = '/home.html';
        }, 800);
      } else {
        /* REGISTER: stay on landing, switch form to login mode */
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

    const forgotBtn = document.getElementById('forgotPasswordBtn');

    if (this.isLogin) {
      document.getElementById('formTitle').textContent    = 'Entrar';
      document.getElementById('formSubtitle').textContent = 'Acesse seu plano.';
      document.getElementById('submitText').textContent   = 'Entrar';
      document.getElementById('toggleText').textContent   = 'Novo aqui?';
      this.toggleBtn.textContent    = 'Criar conta';
      document.getElementById('registerFields').style.display = 'none';
      this.email.removeAttribute('required');
      // Update placeholders for login mode
      this.username.placeholder = 'ex: joão_silva';
      this.password.placeholder = 'Digite sua senha';
      if (forgotBtn) forgotBtn.style.display = 'inline-block';
    } else {
      document.getElementById('formTitle').textContent    = 'Criar conta';
      document.getElementById('formSubtitle').textContent = 'Crie e comece hoje.';
      document.getElementById('submitText').textContent   = 'Criar';
      document.getElementById('toggleText').textContent   = 'Já tem conta?';
      this.toggleBtn.textContent    = 'Entrar';
      document.getElementById('registerFields').style.display = 'block';
      this.email.setAttribute('required', 'required');
      // Update placeholders for signup mode
      this.username.placeholder = 'escolha seu usuário';
      this.password.placeholder = 'crie uma senha segura';
      if (forgotBtn) forgotBtn.style.display = 'none';
    }
    this.clearForm();
  },

  /* ---- Validation (antes de enviar ao servidor) ---- */
  validate() {
    const validation = RegistrationValidator.validateForm(
      this.username.value,
      this.email.value,
      this.password.value,
      !this.isLogin // isRegister = !isLogin
    );

    // Mostrar todos os erros
    if (!validation.username.valid && validation.username.errors.length > 0) {
      this.setFieldError(this.username, validation.username.errors[0]);
    }

    if (!this.isLogin) {
      if (!validation.email.valid && validation.email.errors.length > 0) {
        this.setFieldError(this.email, validation.email.errors[0]);
      }
    }

    if (!validation.password.isValid && validation.password.errors.length > 0) {
      this.setFieldError(this.password, validation.password.errors[0]);
    }

    return validation.valid;
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
    g.classList.remove('success', 'warning');

    let err = g.querySelector('.form-error');
    if (!err) { err = document.createElement('div'); err.className = 'form-error'; g.appendChild(err); }
    err.textContent = '❌ ' + msg;
  },

  clearFieldError(field) {
    const g = field.closest('.form-group');
    if (!g) return;
    g.classList.remove('error');
    const err = g.querySelector('.form-error');
    if (err) err.remove();
  },

  setFieldHint(field, msg, type = 'info') {
    // type: 'info', 'success', 'warning'
    const g = field.closest('.form-group');
    if (!g) return;

    // Remover dicas antigas
    let hint = g.querySelector('.form-hint');
    if (hint) hint.remove();

    // Remover erro se houver
    this.clearFieldError(field);

    // Criar nova dica
    hint = document.createElement('div');
    hint.className = `form-hint form-hint-${type}`;

    const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠️' : 'ℹ️';
    hint.textContent = `${icon} ${msg}`;
    g.appendChild(hint);

    // Adicionar classe visual
    if (type === 'success') g.classList.add('success');
    if (type === 'warning') g.classList.add('warning');
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
