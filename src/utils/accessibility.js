/**
 * Utilities de Acessibilidade (ARIA)
 * Centraliza helpers para acessibilidade
 */

/**
 * Criar ID único para elementos ARIA
 */
export function generateId(prefix = 'aria') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Anunciar mensagem para leitores de tela
 * @param {string} message - Mensagem a anunciar
 * @param {string} priority - 'polite' (padrão) ou 'assertive'
 */
export function announce(message, priority = 'polite') {
  const region = document.getElementById('aria-announcements');
  if (!region) {
    const container = document.createElement('div');
    container.id = 'aria-announcements';
    container.setAttribute('aria-live', priority);
    container.setAttribute('aria-atomic', 'true');
    container.style.position = 'absolute';
    container.style.left = '-10000px';
    container.style.width = '1px';
    container.style.height = '1px';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);
  }
  
  const announcement = document.createElement('div');
  announcement.textContent = message;
  region.appendChild(announcement);
  
  setTimeout(() => announcement.remove(), 1000);
}

/**
 * Fazer elemento acessível como botão
 * @param {HTMLElement} element - Elemento
 * @param {object} options - {label, ariaLabel, ariaPressed, ariaExpanded}
 */
export function makeAccessibleButton(element, options = {}) {
  element.setAttribute('role', 'button');
  element.setAttribute('tabindex', '0');
  
  if (options.ariaLabel) {
    element.setAttribute('aria-label', options.ariaLabel);
  }
  
  if (options.ariaPressed !== undefined) {
    element.setAttribute('aria-pressed', options.ariaPressed);
  }
  
  if (options.ariaExpanded !== undefined) {
    element.setAttribute('aria-expanded', options.ariaExpanded);
  }
  
  // Suporte a teclado
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      element.click();
    }
  });
}

/**
 * Fazer elemento acessível como input
 * @param {HTMLElement} input - Input element
 * @param {object} options - {label, ariaLabel, ariaDescribedby, ariaRequired, ariaInvalid}
 */
export function makeAccessibleInput(input, options = {}) {
  if (options.ariaLabel) {
    input.setAttribute('aria-label', options.ariaLabel);
  }
  
  if (options.ariaDescribedby) {
    input.setAttribute('aria-describedby', options.ariaDescribedby);
  }
  
  if (options.ariaRequired) {
    input.setAttribute('aria-required', 'true');
  }
  
  if (options.ariaInvalid !== undefined) {
    input.setAttribute('aria-invalid', options.ariaInvalid);
  }
  
  // Criar label se não existir
  if (options.label && !input.previousElementSibling?.htmlFor) {
    const label = document.createElement('label');
    label.setAttribute('for', input.id || `input-${generateId()}`);
    label.textContent = options.label;
    input.parentElement.insertBefore(label, input);
    
    if (!input.id) {
      input.id = label.getAttribute('for');
    }
  }
}

/**
 * Criar region de erro acessível
 * @param {string} errorMessage - Mensagem de erro
 * @param {HTMLElement} inputElement - Elemento input relacionado
 * @returns {HTMLElement} Elemento de erro
 */
export function createAccessibleError(errorMessage, inputElement) {
  const errorId = generateId('error');
  const errorElement = document.createElement('div');
  
  errorElement.id = errorId;
  errorElement.setAttribute('role', 'alert');
  errorElement.textContent = errorMessage;
  errorElement.style.color = '#DC3545';
  errorElement.style.fontSize = '0.875rem';
  errorElement.style.marginTop = '0.25rem';
  
  // Associar com input
  if (inputElement) {
    const current = inputElement.getAttribute('aria-describedby') || '';
    inputElement.setAttribute('aria-describedby', `${current} ${errorId}`.trim());
    inputElement.setAttribute('aria-invalid', 'true');
  }
  
  return errorElement;
}

/**
 * Fazer diálogo acessível
 * @param {HTMLElement} dialog - Elemento do diálogo
 * @param {object} options - {label, closeButton}
 */
export function makeAccessibleDialog(dialog, options = {}) {
  const dialogId = generateId('dialog');
  dialog.id = dialogId;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  
  if (options.label) {
    dialog.setAttribute('aria-label', options.label);
  }
  
  // Capturar foco
  const focusableElements = dialog.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length > 0) {
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    setTimeout(() => firstElement.focus(), 0);
    
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
      
      if (e.key === 'Escape' && options.closeButton) {
        options.closeButton.click();
      }
    });
  }
}

/**
 * Fazer elemento visualmente oculto mas acessível
 * @param {HTMLElement} element - Elemento
 */
export function makeSrOnly(element) {
  element.style.position = 'absolute';
  element.style.width = '1px';
  element.style.height = '1px';
  element.style.padding = '0';
  element.style.margin = '-1px';
  element.style.overflow = 'hidden';
  element.style.clip = 'rect(0, 0, 0, 0)';
  element.style.whiteSpace = 'nowrap';
  element.style.borderWidth = '0';
}

/**
 * Validar acessibilidade básica de um elemento
 * @param {HTMLElement} element - Elemento
 * @returns {object} Resultado da validação
 */
export function validateAccessibility(element) {
  const issues = [];
  
  // Verificar contraste de cores
  const styles = window.getComputedStyle(element);
  const bg = styles.backgroundColor;
  const color = styles.color;
  if (!bg || !color) {
    issues.push('Cores não definidas adequadamente');
  }
  
  // Verificar interatividade
  if (['BUTTON', 'A', 'INPUT'].includes(element.tagName)) {
    if (!element.getAttribute('aria-label') && !element.textContent?.trim()) {
      issues.push('Elemento interativo sem label acessível');
    }
  }
  
  // Verificar tamanho de toque (mobile)
  const rect = element.getBoundingClientRect();
  if (rect.width < 44 || rect.height < 44) {
    issues.push('Área de clique menor que 44x44px (difícil em mobile)');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

export default {
  generateId,
  announce,
  makeAccessibleButton,
  makeAccessibleInput,
  createAccessibleError,
  makeAccessibleDialog,
  makeSrOnly,
  validateAccessibility
};
