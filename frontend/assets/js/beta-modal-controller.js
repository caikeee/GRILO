/**
 * ================================
 * GRILO - BETA WELCOME MODAL
 * ================================
 * Gerencia o modal de boas-vindas BETA
 * Exibido apenas logo após login bem-sucedido
 */

'use strict';

const BetaWelcomeModal = {
  isInitialized: false,

  /**
   * Inicializar e verificar se deve mostrar modal
   */
  init() {
    if (this.isInitialized) {
      return;
    }

    console.log('[GRILO] BetaWelcomeModal.init()');
    this.isInitialized = true;
    this.setupCloseHandlers();

    const modal = document.getElementById('betaWelcomeModal');
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
    }
    
    // Verificar se sessionStorage tem flag de login
    const loginFlag = sessionStorage.getItem('grilo_login_session_started');
    
    if (loginFlag === 'true') {
      console.log('[GRILO] Login recente detectado, mostrando modal BETA');
      sessionStorage.removeItem('grilo_login_session_started');
      this.showModal();
    } else {
      console.log('[GRILO] Sem flag de login recente, modal não será exibido');
    }
  },

  /**
   * Mostrar modal com animação fade-in
   */
  showModal() {
    const modal = document.getElementById('betaWelcomeModal');
    if (!modal) {
      console.warn('[GRILO] betaWelcomeModal element not found');
      return;
    }

    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('beta-modal-open');

    // Adicionar classe 'active' para trigger fade-in
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });

    console.log('[GRILO] Modal BETA mostrado');
  },

  /**
   * Fechar modal com animação fade-out
   */
  closeModal() {
    const modal = document.getElementById('betaWelcomeModal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('beta-modal-open');
    console.log('[GRILO] Modal BETA fechado');
  },

  /**
   * Setup listeners para fechar modal
   */
  setupCloseHandlers() {
    const modal = document.getElementById('betaWelcomeModal');
    const backdrop = document.getElementById('betaModalBackdrop');
    const closeBtn = document.getElementById('betaModalCloseBtn');
    const primaryBtn = document.getElementById('betaModalPrimaryBtn');

    if (!modal) return;

    // Fechar por clique no X
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeModal();
      });
    }

    if (primaryBtn) {
      primaryBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Fechar por clique no backdrop
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.closeModal();
        }
      });
    }

    // Fechar por tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }
};

// Inicializar quando DOM estiver ready
document.addEventListener('DOMContentLoaded', () => {
  BetaWelcomeModal.init();
});
