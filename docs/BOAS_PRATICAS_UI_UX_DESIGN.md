# Boas Práticas - UI/UX Design e Desenvolvimento

**Projeto:** Gherkin Generator  
**Objetivo:** Guia de referência para implementação de boas práticas

---

## 1. ACESSIBILIDADE (WCAG 2.1 AA)

### 1.1 Estrutura Semântica

#### ❌ EVITAR:
```html
<!-- Estrutura genérica -->
<div class="container">
  <div class="title">Login</div>
  <div class="input-field">
    <div>Email</div>
    <input type="text" />
  </div>
</div>
```

#### ✅ FAZER:
```html
<!-- Estrutura semântica -->
<form>
  <h1>Login</h1>
  <label for="email">Email:</label>
  <input type="email" id="email" required aria-required="true" />
</form>
```

### 1.2 ARIA Labels

#### ❌ EVITAR:
```html
<!-- Sem contexto para leitores de tela -->
<button onclick="save()">✓</button>
```

#### ✅ FAZER:
```html
<!-- Com contexto -->
<button 
  onclick="save()" 
  aria-label="Salvar alterações"
  title="Salvar alterações (Ctrl+S)"
>
  ✓ Salvar
</button>
```

### 1.3 Contraste de Cores

#### ❌ EVITAR:
```css
/* Contraste insuficiente: 3:1 */
color: #999;
background: #f0f0f0;
```

#### ✅ FAZER:
```css
/* Contraste adequado: 7:1 (excede WCAG AAA) */
color: #212529;
background: #ffffff;

/* Ou para botões */
color: #ffffff;
background: #0D47A1; /* Contraste 8:1 */
```

### 1.4 Focus Management

#### ❌ EVITAR:
```css
/* Remove indicador de focus (perigoso!) */
*:focus {
  outline: none;
}
```

#### ✅ FAZER:
```css
/* Focus visible para navegação por teclado */
*:focus-visible {
  outline: 3px solid #0D47A1;
  outline-offset: 2px;
}

/* Para compatibilidade com navegadores antigos */
*:focus {
  outline: 3px solid #0D47A1;
  outline-offset: 2px;
}
```

### 1.5 Atributos ARIA Essenciais

```html
<!-- Modal -->
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
  aria-describedby="modal-desc"
>
  <h2 id="modal-title">Confirmar Ação</h2>
  <p id="modal-desc">Esta ação não pode ser desfeita.</p>
</div>

<!-- Alert Live Region -->
<div role="alert" aria-live="assertive" aria-atomic="true">
  Erro ao salvar!
</div>

<!-- Progress -->
<div role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100">
  Processando: 65%
</div>

<!-- Combobox -->
<input 
  role="combobox" 
  aria-expanded="false" 
  aria-controls="dropdown"
  aria-autocomplete="list"
/>

<!-- Tooltip -->
<button aria-describedby="tooltip-1">
  Mais informações
</button>
<div id="tooltip-1" role="tooltip">
  Clique para saber mais
</div>
```

---

## 2. RESPONSIVIDADE E MOBILE FIRST

### 2.1 Mobile First Approach

#### ❌ EVITAR:
```css
/* Desktop first - começa grande e reduz */
.panel {
  width: 500px;
  padding: 20px;
  font-size: 16px;
}

@media (max-width: 480px) {
  .panel {
    width: 100%;
    padding: 10px;
    font-size: 14px;
  }
}
```

#### ✅ FAZER:
```css
/* Mobile first - começa pequeno e expande */
.panel {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  max-width: 480px;
}

@media (min-width: 768px) {
  .panel {
    width: 500px;
    padding: 20px;
    font-size: 16px;
  }
}
```

### 2.2 Touch Targets

#### ❌ EVITAR:
```css
/* Muito pequeno para tocar */
button {
  padding: 2px 4px;
  font-size: 12px;
}
```

#### ✅ FAZER:
```css
/* Mínimo de 44x44px para touch */
button {
  min-height: 44px;
  min-width: 44px;
  padding: 10px 16px;
  font-size: 16px; /* Previne zoom em iOS */
}
```

### 2.3 Flexible Layouts

#### ❌ EVITAR:
```css
/* Fixed width - quebra em mobile */
.container {
  width: 1200px;
  margin: 0 auto;
}
```

#### ✅ FAZER:
```css
/* Flexible - adapta a qualquer tela */
.container {
  width: 100%;
  max-width: 1200px;
  padding: 0 16px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Ou com CSS Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}
```

---

## 3. FEEDBACK VISUAL E ANIMAÇÕES

### 3.1 Estados de Botão

```css
button {
  /* Estado normal */
  background: var(--color-primary);
  color: white;
  
  /* Transição suave */
  transition: all 0.2s ease;
}

button:hover {
  /* Hover - quando mouse está sobre */
  background: var(--color-primary-light);
  box-shadow: 0 4px 12px rgba(13, 71, 161, 0.3);
}

button:active {
  /* Pressed - quando clicado */
  transform: scale(0.95);
  box-shadow: 0 2px 6px rgba(13, 71, 161, 0.2);
}

button:focus-visible {
  /* Keyboard focus */
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

button:disabled {
  /* Disabled state */
  opacity: 0.6;
  cursor: not-allowed;
}
```

### 3.2 Loading States

#### ❌ EVITAR:
```javascript
// Sem feedback - usuário não sabe se está carregando
button.onclick = () => {
  saveData();
};
```

#### ✅ FAZER:
```javascript
button.onclick = async () => {
  button.disabled = true;
  button.textContent = '⏳ Salvando...';
  
  try {
    await saveData();
    button.textContent = '✓ Salvo!';
    setTimeout(() => {
      button.textContent = 'Salvar';
      button.disabled = false;
    }, 2000);
  } catch (error) {
    button.textContent = '✕ Erro!';
    button.disabled = false;
  }
};
```

### 3.3 Transições e Animações

#### ✅ FAZER:
```css
/* Animação de entrada suave */
@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal {
  animation: slideInUp 0.3s ease;
}

/* Mudanças de cor suave */
.status-indicator {
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Evitar animações excessivas que causam distração */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 4. VALIDAÇÃO DE FORMULÁRIO

### 4.1 Padrão Recomendado

```javascript
class FormField {
  constructor(config) {
    this.input = config.input;
    this.errorContainer = config.errorContainer;
    this.validator = config.validator;
    this.rules = config.rules || [];
    
    this.setupValidation();
  }

  setupValidation() {
    // Validação em tempo real ao digitar
    this.input.addEventListener('input', () => this.validate());
    
    // Validação ao sair do campo
    this.input.addEventListener('blur', () => this.validateAndShowError());
  }

  validate() {
    const value = this.input.value.trim();
    
    for (const rule of this.rules) {
      if (!rule.check(value)) {
        return false;
      }
    }
    
    return true;
  }

  validateAndShowError() {
    const isValid = this.validate();
    
    if (isValid) {
      this.showSuccess();
    } else {
      this.showError();
    }
    
    return isValid;
  }

  showSuccess() {
    this.input.style.borderColor = '#28A745';
    this.errorContainer.style.display = 'none';
    this.input.setAttribute('aria-invalid', 'false');
  }

  showError() {
    this.input.style.borderColor = '#DC3545';
    this.errorContainer.style.display = 'block';
    this.input.setAttribute('aria-invalid', 'true');
  }

  getValue() {
    return this.validate() ? this.input.value.trim() : null;
  }
}

// Uso
const emailField = new FormField({
  input: document.getElementById('email'),
  errorContainer: document.getElementById('email-error'),
  rules: [
    {
      check: (value) => value.length > 0,
      message: 'Email é obrigatório'
    },
    {
      check: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Email inválido'
    }
  ]
});
```

---

## 5. TRATAMENTO DE ERROS

### 5.1 Error Boundary

```javascript
class ErrorBoundary {
  constructor(onError) {
    this.onError = onError;
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Erros não capturados
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'Uncaught Error');
    });

    // Promise rejections não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Unhandled Promise Rejection');
    });
  }

  handleError(error, context) {
    console.error(`[${context}]`, error);
    
    // Notificar usuário
    this.onError({
      message: 'Ocorreu um erro inesperado',
      details: error.message,
      context
    });

    // Log para análise
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get('errorLog', (data) => {
        const log = data.errorLog || [];
        log.push({
          context,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        chrome.storage.local.set({ errorLog: log.slice(-10) });
      });
    }
  }
}
```

### 5.2 Try/Catch Pattern

#### ❌ EVITAR:
```javascript
// Sem tratamento de erro
async function saveData(data) {
  const response = await fetch('/api/save', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}
```

#### ✅ FAZER:
```javascript
// Com tratamento robusto
async function saveData(data) {
  try {
    // Validar antes de enviar
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Dados inválidos');
    }

    const response = await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify(data),
      timeout: 10000 // Timeout de 10s
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // Log de erro
    console.error('Erro ao salvar:', error);

    // Notificar usuário
    showNotification({
      type: 'error',
      message: 'Erro ao salvar dados',
      details: error.message
    });

    // Re-throw para tratamento superior se necessário
    throw error;
  }
}
```

---

## 6. PERFORMANCE

### 6.1 Debounce para Eventos Frequentes

```javascript
function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    // Cancelar timer anterior
    clearTimeout(timeoutId);
    
    // Agendar nova execução
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Uso - input do usuário é debouncido
document.getElementById('search').addEventListener('input', 
  debounce((e) => {
    searchItems(e.target.value);
  }, 300) // Espera 300ms após última digitação
);
```

### 6.2 Event Delegation

#### ❌ EVITAR:
```javascript
// Listener em cada elemento - ineficiente
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', handleClick);
});
```

#### ✅ FAZER:
```javascript
// Listener único no container - eficiente
document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    handleClick(e.target);
  }
});
```

### 6.3 Lazy Loading

```javascript
// Lazy load de componentes pesados
const lazyLoadComponent = (selector, componentLoader) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        componentLoader(entry.target);
        observer.unobserve(entry.target);
      }
    });
  });

  document.querySelectorAll(selector).forEach(el => {
    observer.observe(el);
  });
};
```

---

## 7. TESTING

### 7.1 Acessibilidade

```bash
# Instalar Axe DevTools
npm install --save-dev @axe-core/react

# Ou usar online: https://www.deque.com/axe/devtools/
```

### 7.2 Visual Regression

```bash
# Ferramentas recomendadas
- Percy.io
- Chromatic
- BackstopJS
```

### 7.3 Performance

```bash
# Lighthouse CLI
npm install -g @lhci/cli@*
lhci autorun

# WebPageTest
# https://www.webpagetest.org/
```

---

## 8. DOCUMENTAÇÃO

### 8.1 Comentários Significativos

#### ❌ EVITAR:
```javascript
// Ruim: Comenta óbvio
const x = 5; // Define x para 5
```

#### ✅ FAZER:
```javascript
// Bom: Explica o porquê
const MAX_RETRY_ATTEMPTS = 5; // Limita retentativas para prevenir DDoS
```

### 8.2 JSDoc

```javascript
/**
 * Salva os dados da feature gravada
 * 
 * @param {Object} feature - Objeto da feature
 * @param {string} feature.name - Nome da feature
 * @param {Array<Object>} feature.scenarios - Array de cenários
 * @returns {Promise<boolean>} True se salvo com sucesso
 * @throws {Error} Se o storage não estiver disponível
 * 
 * @example
 * const feature = { name: 'Login', scenarios: [...] };
 * await saveFeature(feature);
 */
async function saveFeature(feature) {
  // implementação
}
```

---

## 9. CHECKLIST FINAL

### Antes de Fazer Deploy

- [ ] ✅ Validação de acessibilidade (Axe DevTools)
- [ ] ✅ Score Lighthouse > 90
- [ ] ✅ Contraste WCAG AA em 100%
- [ ] ✅ Testes em 3+ navegadores
- [ ] ✅ Testes em mobile (iOS e Android)
- [ ] ✅ Sem erros no console
- [ ] ✅ Sem memory leaks
- [ ] ✅ Performance OK (<100ms interactions)
- [ ] ✅ Documentação completa
- [ ] ✅ Code review aprovado

---

**Referências:**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev Best Practices](https://web.dev/lighthouse-best-practices/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

