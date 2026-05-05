/**
 * ================================
 * GRILO - BETA WELCOME MODAL
 * ================================
 * Gerencia o modal de boas-vindas BETA
 * Exibido apenas logo após login bem-sucedido
 */

'use strict';

const BetaWelcomeModal = {
  /**
   * Inicializar e verificar se deve mostrar modal
   */
  init() {
    console.log('[GRILO] BetaWelcomeModal.init()');
    
    // Verificar se sessionStorage tem flag de login
    const loginFlag = sessionStorage.getItem('grilo_login_session_started');
    
    if (loginFlag === 'true') {
      console.log('[GRILO] Login recente detectado, mostrando modal BETA');
      sessionStorage.removeItem('grilo_login_session_started');
      this.showModal();
    } else {
      console.log('[GRILO] Sem flag de login recente, modal não será exibido');
    }
    
    // Setup listeners de fechar
    this.setupCloseHandlers();
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
    console.log('[GRILO] Modal BETA fechado');
  },

  /**
   * Setup listeners para fechar modal
   */
  setupCloseHandlers() {
    const modal = document.getElementById('betaWelcomeModal');
    const backdrop = document.getElementById('betaModalBackdrop');
    const closeBtn = document.getElementById('betaModalCloseBtn');

    if (!modal) return;

    // Fechar por clique no X
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
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
