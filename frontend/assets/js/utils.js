/** ================================
    GRILO - UTILITIES
    Helper functions & common utilities
    ================================ */

'use strict';

/**
 * Utility functions
 */
const Utils = {
  /**
   * Check if element is in viewport
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    );
  },

  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function
   */
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Storage utilities
   */
  storage: {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error('Storage error:', error);
        return false;
      }
    },

    get(key) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Storage error:', error);
        return null;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Storage error:', error);
        return false;
      }
    },

    clear() {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('Storage error:', error);
        return false;
      }
    }
  },

  /**
   * Cookie utilities
   */
  cookie: {
    set(name, value, days = 7) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = `expires=${date.toUTCString()}`;
      document.cookie = `${name}=${value};${expires};path=/`;
    },

    get(name) {
      const nameEQ = name + '=';
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
          return cookie.substring(nameEQ.length);
        }
      }
      return null;
    },

    remove(name) {
      this.set(name, '', -1);
    }
  },

  /**
   * Format currency
   */
  formatCurrency(value, currency = 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  },

  /**
   * Format date
   */
  formatDate(date, format = 'DD/MM/YYYY') {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year);
  },

  /**
   * Parse query string
   */
  getQueryParams() {
    const params = {};
    const search = window.location.search.substring(1);
    if (!search) return params;

    search.split('&').forEach(item => {
      const [key, value] = item.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    });

    return params;
  },

  /**
   * Copy to clipboard
   */
  copyToClipboard(text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve();
    }
  },

  /**
   * Show notification
   */
  notify(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background-color: var(--text-primary);
      color: white;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: var(--shadow-md);
      animation: slide-in-right 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slide-out-right 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  },

  /**
   * DOM utilities
   */
  dom: {
    /**
     * Add class if condition is true
     */
    toggleClass(element, className, condition) {
      if (condition) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
    },

    /**
     * Create element with attributes
     */
    createElement(tag, attributes = {}, innerHTML = '') {
      const element = document.createElement(tag);
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'class') {
          element.className = value;
        } else if (key.startsWith('data-')) {
          element.dataset[key.slice(5)] = value;
        } else {
          element.setAttribute(key, value);
        }
      });
      if (innerHTML) {
        element.innerHTML = innerHTML;
      }
      return element;
    },

    /**
     * Query selector shortcut
     */
    query(selector, context = document) {
      return context.querySelector(selector);
    },

    /**
     * Query selector all shortcut
     */
    queryAll(selector, context = document) {
      return Array.from(context.querySelectorAll(selector));
    },

    /**
     * Remove element
     */
    remove(element) {
      element?.remove();
    },

    /**
     * Empty element
     */
    empty(element) {
      element.innerHTML = '';
    }
  },

  /**
   * Analytics tracking
   */
  track(eventName, eventData = {}) {
    console.log(`[Analytics] ${eventName}`, eventData);

    // Send to analytics service (Google Analytics, etc)
    if (window.gtag) {
      window.gtag('event', eventName, eventData);
    }
  },

  /**
   * Mobile detection
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  /**
   * Prefetch resources
   */
  prefetch(url) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  },

  /**
   * Preload resources
   */
  preload(url, as = 'script') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    document.head.appendChild(link);
  },

  /**
   * Check if dark mode is enabled
   */
  isDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  /**
   * Check if reduced motion is enabled
   */
  isReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get device orientation
   */
  getOrientation() {
    return window.orientation || screen.orientation?.type || 'unknown';
  },

  /**
   * Request full screen
   */
  requestFullscreen(element = document.documentElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
  },

  /**
   * Exit full screen
   */
  exitFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (document.webkitFullscreenElement) {
      document.webkitExitFullscreen();
    }
  }
};

// Expose to window
window.Utils = Utils;
