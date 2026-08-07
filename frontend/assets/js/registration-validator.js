/**
 * GRILO - REGISTRATION VALIDATOR
 * Validação completa com feedback inteligente para register/login
 */
'use strict';

const RegistrationValidator = {
  // Senhas comuns bloqueadas (mesma lista do backend)
  commonPasswords: new Set([
    "12345678", "123456789", "1234567890", "password", "password1",
    "qwerty123", "111111111", "abc12345", "letmein123", "iloveyou1",
    "welcome1", "admin123", "senha123", "12341234", "qwertyuiop",
    "passw0rd", "123123123"
  ]),

  /**
   * Valida username com regras específicas
   * @returns {Object} { valid: bool, errors: [string], warnings: [string] }
   */
  validateUsername(username) {
    const result = { valid: true, errors: [], warnings: [] };
    const clean = (username || '').trim();

    if (!clean) {
      result.valid = false;
      result.errors.push('Campo obrigatório');
      return result;
    }

    if (clean.length < 3) {
      result.valid = false;
      result.errors.push(`Mínimo 3 caracteres (${clean.length}/3)`);
      return result;
    }

    if (clean.length > 50) {
      result.valid = false;
      result.errors.push(`Máximo 50 caracteres (${clean.length}/50)`);
      return result;
    }

    // Apenas alphanumético + underscore
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      result.valid = false;
      result.errors.push('Apenas letras, números e underscore (_)');
      return result;
    }

    // Warnings (válido mas questionar)
    if (/^_+$/.test(clean)) {
      result.warnings.push('Username só com underscores? Escolha algo mais descritivo.');
    }
    if (/^\d+$/.test(clean)) {
      result.warnings.push('Username só com números? Escolha algo mais descritivo.');
    }

    return result;
  },

  /**
   * Valida email com regex rigoroso
   * @returns {Object} { valid: bool, errors: [string], warnings: [string] }
   */
  validateEmail(email) {
    const result = { valid: true, errors: [], warnings: [] };
    const clean = (email || '').trim();

    if (!clean) {
      result.valid = false;
      result.errors.push('Campo obrigatório');
      return result;
    }

    // Regex do backend
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(clean)) {
      result.valid = false;
      if (!clean.includes('@')) {
        result.errors.push('Email deve conter @');
      } else if (!clean.includes('.')) {
        result.errors.push('Email deve conter domínio (ex: @gmail.com)');
      } else {
        result.errors.push('Email inválido');
      }
      return result;
    }

    return result;
  },

  /**
   * Analisa força da senha
   * @returns {Object} { strength: 0-4, score: 0-100, feedback: [string], errors: [string], isValid: bool }
   */
  analyzePassword(password) {
    const result = {
      strength: 0,      // 0=fraca, 1=razoavel, 2=boa, 3=forte, 4=muito forte
      score: 0,         // 0-100
      feedback: [],
      errors: [],
      isValid: false
    };

    const p = password || '';

    // Validações obrigatórias
    if (!p) {
      result.errors.push('Campo obrigatório');
      return result;
    }

    if (p.length < 10) {
      result.errors.push(`Mínimo 10 caracteres (${p.length}/10)`);
      return result;
    }

    if (p.length > 255) {
      result.errors.push(`Máximo 255 caracteres (${p.length}/255)`);
      return result;
    }

    // Verificar senhas comuns
    if (this.commonPasswords.has(p.toLowerCase())) {
      result.errors.push('Essa senha é muito comum. Escolha uma mais forte.');
      return result;
    }

    // Calcular força (score)
    let points = 0;
    let characterClassCount = 0;

    // Comprimento (max 25 pontos)
    if (p.length >= 10) points += 10;
    if (p.length >= 15) points += 8;
    if (p.length >= 20) points += 7;

    // Maiúsculas (até 15 pontos)
    if (/[A-Z]/.test(p)) {
      characterClassCount++;
      points += 15;
    }

    // Minúsculas (até 15 pontos)
    if (/[a-z]/.test(p)) {
      characterClassCount++;
      points += 15;
    }

    // Números (até 15 pontos)
    if (/[0-9]/.test(p)) {
      characterClassCount++;
      points += 15;
    }

    // Símbolos (até 25 pontos)
    if (/[^a-zA-Z0-9]/.test(p)) {
      characterClassCount++;
      points += 25;
    }

    // Mistura obrigatória: mínimo 2 tipos diferentes
    if (characterClassCount < 2) {
      result.errors.push(
        'Misture pelo menos 2 tipos: maiúsculas, minúsculas, números ou símbolos'
      );
      return result;
    }

    // Se passou nas validações obrigatórias
    result.isValid = true;
    result.score = Math.min(100, points);

    // Determinar força e feedback
    if (result.score < 40) {
      result.strength = 1; // Fraca
      result.feedback.push('Senha razoável. Adicione mais caracteres ou símbolos para aumentar força.');
    } else if (result.score < 60) {
      result.strength = 2; // Boa
      result.feedback.push('Senha boa!');
    } else if (result.score < 80) {
      result.strength = 3; // Forte
      result.feedback.push('Senha forte!');
    } else {
      result.strength = 4; // Muito forte
      result.feedback.push('Senha muito forte!');
    }

    // Dicas adicionais
    if (characterClassCount >= 4) {
      result.feedback.push('Perfeito! Você está usando todas as 4 classes de caracteres.');
    } else if (characterClassCount === 3) {
      result.feedback.push('Ótimo! Adione símbolos para máxima força.');
    }

    // Validação final
    if (result.errors.length === 0) {
      result.isValid = true;
    }

    return result;
  },

  /**
   * Validação completa do formulário
   */
  validateForm(username, email, password, isRegister = true) {
    const result = {
      valid: true,
      username: this.validateUsername(username),
      email: isRegister ? this.validateEmail(email) : { valid: true, errors: [], warnings: [] },
      password: this.analyzePassword(password)
    };

    // Resumo
    if (result.username.errors.length > 0 ||
        result.email.errors.length > 0 ||
        result.password.errors.length > 0) {
      result.valid = false;
    }

    // Password precisa estar válido
    if (!result.password.isValid) {
      result.valid = false;
    }

    return result;
  },

  /**
   * Simples: verifica apenas se passou (para submit)
   */
  isValid(username, email, password, isRegister = true) {
    const validation = this.validateForm(username, email, password, isRegister);
    return validation.valid;
  }
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RegistrationValidator;
}
