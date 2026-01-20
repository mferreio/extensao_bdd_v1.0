# Guia Prático de Implementação - Melhorias UI/UX

**Arquivo:** ANALISE_MELHORIAS_UI_UX_DESIGN.md  
**Objetivo:** Exemplos de código e implementações práticas para as melhorias recomendadas

---

## 1. SISTEMA DE TOAST NOTIFICATIONS

### Problema Identificado
Falta de feedback visual imediato ao usuário ao executar ações na extensão.

### Solução

**Arquivo:** `src/components/notifications.js`

```javascript
export class NotificationManager {
  constructor() {
    this.container = null;
    this.queue = [];
    this.initContainer();
  }

  initContainer() {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.id = 'gherkin-notifications-container';
    this.container.style.position = 'fixed';
    this.container.style.top = '20px';
    this.container.style.right = '20px';
    this.container.style.zIndex = '10002';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = '8px';
    this.container.style.maxWidth = '400px';
    this.container.style.pointerEvents = 'none';
    
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `gherkin-notification gherkin-notification-${type}`;
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const colors = {
      success: '#28A745',
      error: '#DC3545',
      warning: '#FFC107',
      info: '#17A2B8'
    };

    notification.style.cssText = `
      background: ${colors[type]};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideIn 0.3s ease;
      font-weight: 500;
      pointer-events: auto;
      cursor: pointer;
    `;

    notification.innerHTML = `
      <span style="font-size: 18px; font-weight: bold;">${icons[type]}</span>
      <span>${message}</span>
      <button style="
        background: transparent;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
      ">×</button>
    `;

    const closeBtn = notification.querySelector('button');
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.removeNotification(notification);
    };

    notification.onclick = () => this.removeNotification(notification);

    this.container.appendChild(notification);

    if (duration > 0) {
      setTimeout(() => this.removeNotification(notification), duration);
    }

    return notification;
  }

  removeNotification(element) {
    element.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => element.remove(), 300);
  }

  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 3000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 3000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
}

// Singleton
export const notificationManager = new NotificationManager();
```

**CSS a Adicionar em `styles.js`:**

```css
@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}
```

---

## 2. VALIDAÇÃO DE INPUT EM TEMPO REAL

### Problema Identificado
Campos de entrada sem validação visual clara, causando erros confusos.

### Solução

**Arquivo:** `src/components/form-validation.js`

```javascript
export class FormValidator {
  static createValidatedInput(config) {
    const {
      id,
      placeholder,
      label,
      validator,
      errorMessage,
      onValid,
      onInvalid
    } = config;

    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    `;

    const labelEl = document.createElement('label');
    labelEl.htmlFor = id;
    labelEl.style.cssText = `
      font-weight: 600;
      color: #333;
      font-size: 14px;
    `;
    labelEl.textContent = label;

    const inputWrapper = document.createElement('div');
    inputWrapper.style.cssText = `
      position: relative;
      display: flex;
      align-items: center;
    `;

    const input = document.createElement('input');
    input.id = id;
    input.type = 'text';
    input.placeholder = placeholder;
    input.required = true;
    input.setAttribute('aria-label', label);
    input.setAttribute('aria-describedby', `${id}-error`);
    input.style.cssText = `
      width: 100%;
      padding: 10px 12px 10px 40px;
      border: 2px solid #DDD;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s;
    `;

    const statusIcon = document.createElement('span');
    statusIcon.style.cssText = `
      position: absolute;
      left: 12px;
      font-size: 16px;
      display: none;
    `;

    const errorMsg = document.createElement('div');
    errorMsg.id = `${id}-error`;
    errorMsg.style.cssText = `
      color: #DC3545;
      font-size: 12px;
      display: none;
      padding: 4px 0;
    `;

    inputWrapper.appendChild(statusIcon);
    inputWrapper.appendChild(input);

    container.appendChild(labelEl);
    container.appendChild(inputWrapper);
    container.appendChild(errorMsg);

    // Validação em tempo real
    input.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      const isValid = !value ? false : validator(value);

      if (isValid) {
        input.style.borderColor = '#28A745';
        statusIcon.textContent = '✓';
        statusIcon.style.color = '#28A745';
        statusIcon.style.display = 'block';
        errorMsg.style.display = 'none';
        onValid?.(value);
      } else if (value) {
        input.style.borderColor = '#DC3545';
        statusIcon.textContent = '✕';
        statusIcon.style.color = '#DC3545';
        statusIcon.style.display = 'block';
        errorMsg.textContent = errorMessage;
        errorMsg.style.display = 'block';
        onInvalid?.(value);
      } else {
        input.style.borderColor = '#DDD';
        statusIcon.style.display = 'none';
        errorMsg.style.display = 'none';
      }
    });

    return { container, input };
  }

  static createForm(fields) {
    const form = document.createElement('form');
    const inputs = {};

    fields.forEach(field => {
      const { container, input } = this.createValidatedInput(field);
      form.appendChild(container);
      inputs[field.id] = input;
    });

    // Validação do formulário
    form.isValid = () => {
      return Object.values(inputs).every(input => {
        return input.style.borderColor === '#28A745';
      });
    };

    form.getValues = () => {
      const values = {};
      Object.entries(inputs).forEach(([key, input]) => {
        values[key] = input.value.trim();
      });
      return values;
    };

    return { form, inputs };
  }
}
```

---

## 3. PALETA DE CORES UNIFICADA

### Solução

**Arquivo:** Atualizar `src/components/styles.js`

```javascript
export function injectGherkinStyles() {
    if (document.getElementById('gherkin-global-style')) return;
    
    const style = document.createElement('style');
    style.id = 'gherkin-global-style';
    style.textContent = `
:root {
  /* Cores Primárias */
  --color-primary: #0D47A1;
  --color-primary-light: #1565C0;
  --color-primary-dark: #0A3A7F;
  
  /* Cores Secundárias */
  --color-secondary: #FFA726;
  --color-secondary-light: #FFB74D;
  
  /* Estados */
  --color-success: #28A745;
  --color-danger: #DC3545;
  --color-warning: #FFC107;
  --color-info: #17A2B8;
  
  /* Backgrounds */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8F9FA;
  --bg-tertiary: #ECEFF1;
  
  /* Texto */
  --text-primary: #212529;
  --text-secondary: #6C757D;
  --text-light: #FFFFFF;
  
  /* Borders */
  --border-color: #DDD;
  --border-color-light: #EEE;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s ease;
  --transition-slow: 0.5s ease;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1E1E1E;
    --bg-secondary: #2D2D2D;
    --bg-tertiary: #3D3D3D;
    --text-primary: #E0E0E0;
    --text-secondary: #A0A0A0;
    --border-color: #444;
    --border-color-light: #333;
  }
}

/* Componentes */
.gherkin-btn {
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.gherkin-btn-primary {
  background: var(--color-primary);
  color: var(--text-light);
}

.gherkin-btn-primary:hover {
  background: var(--color-primary-light);
  box-shadow: var(--shadow-md);
}

.gherkin-btn-danger {
  background: var(--color-danger);
  color: var(--text-light);
}

.gherkin-btn-success {
  background: var(--color-success);
  color: var(--text-light);
}

.gherkin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
`;
    document.head.appendChild(style);
}
```

---

## 4. CONFIRMAÇÃO DE AÇÕES DESTRUTIVAS

### Solução

**Arquivo:** `src/components/confirm-dialog.js`

```javascript
export function showConfirmDialog(config) {
  const {
    title = 'Confirmação',
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'default', // default, danger, warning
    onConfirm,
    onCancel
  } = config;

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    animation: fadeIn 0.2s ease;
  `;

  const dialog = document.createElement('div');
  dialog.role = 'alertdialog';
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  dialog.style.cssText = `
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    padding: 24px;
    animation: slideUp 0.3s ease;
  `;

  const titleEl = document.createElement('h2');
  titleEl.id = 'dialog-title';
  titleEl.textContent = title;
  titleEl.style.cssText = `
    margin: 0 0 12px 0;
    color: #212529;
    font-size: 18px;
  `;

  const messageEl = document.createElement('p');
  messageEl.textContent = message;
  messageEl.style.cssText = `
    margin: 0 0 24px 0;
    color: #6C757D;
    line-height: 1.5;
  `;

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  `;

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = cancelText;
  cancelBtn.style.cssText = `
    padding: 10px 20px;
    border: 2px solid #DDD;
    background: white;
    color: #212529;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  `;
  cancelBtn.onmouseover = () => cancelBtn.style.borderColor = '#999';
  cancelBtn.onmouseout = () => cancelBtn.style.borderColor = '#DDD';
  cancelBtn.onclick = () => {
    overlay.remove();
    onCancel?.();
  };

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = confirmText;
  
  const colorMap = {
    default: '#0D47A1',
    danger: '#DC3545',
    warning: '#FFC107'
  };

  confirmBtn.style.cssText = `
    padding: 10px 20px;
    background: ${colorMap[type]};
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  `;
  confirmBtn.onmouseover = () => confirmBtn.style.opacity = '0.9';
  confirmBtn.onmouseout = () => confirmBtn.style.opacity = '1';
  confirmBtn.onclick = () => {
    overlay.remove();
    onConfirm?.();
  };

  buttonContainer.appendChild(cancelBtn);
  buttonContainer.appendChild(confirmBtn);

  dialog.appendChild(titleEl);
  dialog.appendChild(messageEl);
  dialog.appendChild(buttonContainer);
  overlay.appendChild(dialog);

  document.body.appendChild(overlay);

  // Auto-focus no botão de cancelar para segurança
  cancelBtn.focus();

  // Fechar ao clicar no overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      onCancel?.();
    }
  });

  // Suporte a teclado
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      onCancel?.();
    }
  });
}
```

---

## 5. STATE MANAGEMENT CENTRALIZADO

### Solução

**Arquivo:** `src/state/store.js`

```javascript
export class GherkinStore {
  constructor() {
    this.state = {
      isRecording: false,
      isPaused: false,
      elapsedSeconds: 0,
      currentFeature: null,
      currentCenario: null,
      panelState: 'feature', // feature, cenario, gravando, resultado
      interactions: [],
      features: [],
      timerInterval: null
    };

    this.listeners = [];
  }

  // Observer pattern
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Actions
  startRecording(featureName, cenarioName) {
    this.setState({
      isRecording: true,
      isPaused: false,
      elapsedSeconds: 0,
      currentFeature: { name: featureName, scenarios: [] },
      currentCenario: { name: cenarioName, interactions: [] },
      panelState: 'gravando',
      interactions: []
    });
  }

  pauseRecording() {
    this.setState({ isPaused: true });
  }

  resumeRecording() {
    this.setState({ isPaused: false });
  }

  stopRecording() {
    this.setState({
      isRecording: false,
      isPaused: false,
      timerInterval: null
    });
  }

  addInteraction(interaction) {
    if (!this.state.isPaused) {
      this.setState({
        interactions: [...this.state.interactions, interaction]
      });
    }
  }

  updateElapsedSeconds(seconds) {
    this.setState({ elapsedSeconds: seconds });
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  getState() {
    return { ...this.state };
  }
}

// Singleton
export const store = new GherkinStore();
```

**Uso:**

```javascript
// Subscrevendo a mudanças
store.subscribe((state) => {
  console.log('Estado mudou:', state);
  renderUI(state);
});

// Disparando ações
store.startRecording('Login', 'Login com sucesso');
store.addInteraction({ type: 'click', selector: '#login-btn' });
store.stopRecording();
```

---

## 6. ÍCONES SVG CONSISTENTES

### Solução

**Arquivo:** `src/assets/icons.js`

```javascript
export const Icons = {
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2z"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l1.72-1.34c.15-.12.19-.34.1-.51l-1.63-2.83c-.12-.22-.38-.28-.59-.14l-2.03 1.59c-.42-.33-.9-.62-1.41-.87l-.3-2.34c-.03-.24-.24-.41-.48-.41h-3.26c-.24 0-.43.17-.46.41l-.3 2.34c-.51.25-.99.54-1.41.87L8.95 4.99c-.22-.14-.47-.08-.59.14L6.73 7.82c-.1.17-.05.39.1.51l1.72 1.34c-.05.3-.07.62-.07.94 0 .33.02.64.07.94l-1.72 1.34c-.15.12-.19.34-.1.51l1.63 2.83c.12.22.38.28.59.14l2.03-1.59c.42.33.9.62 1.41.87l.3 2.34c.03.24.24.41.48.41h3.26c.24 0 .43-.17.46-.41l.3-2.34c.51-.25.99-.54 1.41-.87l2.03 1.59c.22.14.47.08.59-.14l1.63-2.83c.1-.17.05-.39-.1-.51l-1.72-1.34zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
};

export function createIconButton(iconName, label, onClick) {
  const button = document.createElement('button');
  button.innerHTML = Icons[iconName];
  button.setAttribute('aria-label', label);
  button.title = label;
  button.style.cssText = `
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
  `;
  button.querySelector('svg').style.cssText = `
    width: 24px;
    height: 24px;
    stroke-width: 2;
  `;
  button.onclick = onClick;
  return button;
}
```

---

## 7. CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar `src/components/notifications.js`
- [ ] Criar `src/components/form-validation.js`
- [ ] Criar `src/components/confirm-dialog.js`
- [ ] Atualizar `src/components/styles.js` com paleta unificada
- [ ] Criar `src/state/store.js`
- [ ] Criar `src/assets/icons.js`
- [ ] Integrar `NotificationManager` em todo o projeto
- [ ] Atualizar todas as modais com novo design
- [ ] Testar acessibilidade com Axe DevTools
- [ ] Testar em diferentes tamanhos de tela

---

**Próximo Passo:** Começar pela implementação do sistema de notificações e validação de input!
