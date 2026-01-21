// Estilos globais da extensÃ£o Gherkin
export function injectGherkinStyles() {
  if (document.getElementById('gherkin-global-style')) return;

  const style = document.createElement('style');
  style.id = 'gherkin-global-style';
  style.textContent = `
:root {
  /* Cores principais com gradientes modernos */
  --color-primary: #1e3a8a;
  --color-primary-light: #3b82f6;
  --color-primary-gradient: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  --color-secondary: #f59e0b;
  --color-secondary-gradient: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  --color-success: #10b981;
  --color-success-gradient: linear-gradient(135deg, #059669 0%, #10b981 100%);
  --color-danger: #ef4444;
  --color-danger-gradient: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  --color-warning: #f59e0b;
  --color-info: #06b6d4;
  
  /* Backgrounds modernos */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-glass: rgba(255, 255, 255, 0.9);
  --bg-overlay: rgba(0, 0, 0, 0.4);
  
  /* Tipografia */
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
  
  /* EspaÃ§amento */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border radius moderno */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  /* Sombras elevadas */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 24px 0 rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 20px 40px 0 rgba(0, 0, 0, 0.15);
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.3);
  
  /* Bordas */
  --border-width: 1px;
  --border-color: #e2e8f0;
  --border-color-hover: #cbd5e1;
  
  /* TransiÃ§Ãµes suaves */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Blur effects */
  --blur-sm: blur(4px);
  --blur-md: blur(8px);
  --blur-lg: blur(16px);
}

[data-theme="dark"] {
  --color-primary: #3b82f6;
  --color-primary-light: #60a5fa;
  --color-primary-gradient: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  --color-secondary: #fbbf24;
  --color-secondary-gradient: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  --color-success: #34d399;
  --color-success-gradient: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  --color-danger: #f87171;
  --color-danger-gradient: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  --color-warning: #fbbf24;
  --color-info: #22d3ee;
  
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --bg-glass: rgba(15, 23, 42, 0.9);
  --bg-overlay: rgba(0, 0, 0, 0.6);
  
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
  
  --border-color: #334155;
  --border-color-hover: #475569;
  
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 24px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.5);
}

@keyframes gherkinSlideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes gherkinSlideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

@keyframes gherkinFadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes gherkinSlideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes gherkinPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes gherkinShimmer {
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
}

@keyframes gherkinBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.gherkin-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: min(480px, calc(100vw - 40px));
  max-width: 480px;
  min-width: 320px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  font-family: var(--font-family);
  border: var(--border-width) solid var(--border-color);
  backdrop-filter: var(--blur-md);
  animation: gherkinFadeIn var(--transition-base) ease-out;
}

.gherkin-panel-header {
  background: var(--color-primary-gradient);
  color: white;
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.gherkin-panel-header h3 {
  margin: 0;
  font-size: clamp(0.9rem, 2.5vw, 1.05rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.button-container-top {
  display: flex;
  gap: var(--spacing-sm);
}

.button-container-top button {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 6px;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-container-top button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.button-container-top button:active {
  transform: translateY(0);
}

.gherkin-content {
  padding: var(--spacing-lg);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  background: var(--bg-secondary);
}

.gherkin-btn {
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 20px;
  cursor: pointer;
  transition: all var(--transition-base);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.gherkin-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left var(--transition-slow);
}

.gherkin-btn:hover::before {
  left: 100%;
}

.gherkin-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.gherkin-btn:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.gherkin-btn-main {
  background: var(--color-primary-gradient);
  color: #ffffff;
}

.gherkin-btn-danger {
  background: var(--color-danger-gradient);
  color: #ffffff;
}

.gherkin-btn-warning {
  background: var(--color-secondary-gradient);
  color: #ffffff;
}

.gherkin-btn-success {
  background: var(--color-success-gradient);
  color: #ffffff;
}

.gherkin-status-bar {
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  backdrop-filter: var(--blur-sm);
  border: var(--border-width) solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

#gherkin-log {
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  background: var(--bg-primary);
  border: var(--border-width) solid var(--border-color);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Input moderno */
input[type="text"],
input[type="email"],
input[type="password"],
select,
textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-family: var(--font-family);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-xs);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), var(--shadow-sm);
}

input:hover,
select:hover,
textarea:hover {
  border-color: var(--border-color-hover);
}

/* Checkbox e Radio modernos */
input[type="checkbox"],
input[type="radio"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.95rem;
}

/* Estilos para highlight de elementos - MODERNIZADOS */
.gherkin-element-highlight {
    animation: gherkinHighlightPulse 1.5s ease-in-out infinite alternate;
    position: relative;
    z-index: 9998;
}

@keyframes gherkinHighlightPulse {
    0% {
        box-shadow: 0 0 8px 3px rgba(59, 130, 246, 0.5), 
                    0 0 16px 6px rgba(59, 130, 246, 0.3);
        transform: scale(1);
    }
    100% {
        box-shadow: 0 0 16px 6px rgba(59, 130, 246, 0.7), 
                    0 0 32px 12px rgba(59, 130, 246, 0.5);
        transform: scale(1.02);
    }
}

/* Estilos para highlight de mÃºltiplos elementos */
.gherkin-element-highlight:nth-child(odd) {
    animation-delay: 0.3s;
}

.gherkin-element-highlight:nth-child(even) {
    animation-delay: 0.6s;
}

/* Card design moderno */
.gherkin-card {
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  border: var(--border-width) solid var(--border-color);
  transition: all var(--transition-base);
}

.gherkin-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Badge moderno */
.gherkin-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  box-shadow: var(--shadow-xs);
}

.gherkin-badge-primary {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.gherkin-badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.gherkin-badge-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.gherkin-badge-danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Spinner moderno */
.gherkin-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Skeleton loading */
.gherkin-skeleton {
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: gherkinShimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

/* Toast notification moderna */
.gherkin-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--bg-glass);
  backdrop-filter: var(--blur-md);
  color: var(--text-primary);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  border: var(--border-width) solid var(--border-color);
  animation: gherkinSlideUp var(--transition-base) ease-out;
  z-index: 10004;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* Divider moderno */
.gherkin-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  margin: var(--spacing-md) 0;
}

/* Scrollbar moderna */
.gherkin-panel ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.gherkin-panel ::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.gherkin-panel ::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius-sm);
  transition: background var(--transition-base);
}

.gherkin-panel ::-webkit-scrollbar-thumb:hover {
  background: var(--border-color-hover);
}

/* Footer moderno */
#gherkin-footer {
  text-align: center;
  padding: var(--spacing-md);
  font-size: 0.8rem;
  color: var(--text-tertiary);
  background: var(--bg-secondary);
  border-top: var(--border-width) solid var(--border-color);
  margin: 0;
  font-weight: 500;
}

/* Media queries para responsividade */
@media (max-width: 768px) {
    .gherkin-panel {
        top: 10px;
        right: 10px;
        left: 10px;
        width: auto;
        min-width: auto;
        max-width: none;
    }
    
    .gherkin-panel-header {
        padding: 10px 12px;
    }
    
    .gherkin-panel-header h3 {
        font-size: 0.85rem;
    }
    
    .gherkin-content {
        padding: 12px;
    }
    
    .gherkin-btn {
        padding: 8px 12px;
        font-size: 13px;
    }
    
    .gherkin-status-bar {
        gap: 6px !important;
        font-size: 0.8rem !important;
        padding: 6px 8px !important;
    }
    
    .gherkin-status-bar span {
        max-width: 100px !important;
    }
    
    .gherkin-actions-bar {
        gap: 4px !important;
    }
    
    .gherkin-actions-bar button {
        font-size: 0.8rem !important;
        padding: 4px 6px !important;
        min-width: 60px !important;
        max-width: 75px !important;
    }
}

@media (max-width: 480px) {
    .gherkin-panel {
        top: 5px;
        right: 5px;
        left: 5px;
        bottom: 5px;
        width: auto;
        height: auto;
        max-height: calc(100vh - 10px);
    }
    
    .gherkin-panel-header h3 {
        font-size: 0.75rem;
        line-height: 1.1;
    }
    
    .gherkin-content {
        padding: 8px;
    }
    
    .gherkin-status-bar {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 4px !important;
        font-size: 0.75rem !important;
        padding: 6px !important;
    }
    
    .gherkin-status-bar span {
        max-width: none !important;
        white-space: nowrap !important;
    }
    
    .gherkin-actions-bar {
        gap: 3px !important;
    }
    
    .gherkin-actions-bar button {
        font-size: 0.7rem !important;
        padding: 3px 4px !important;
        min-width: 50px !important;
        max-width: 65px !important;
        height: 28px !important;
    }
    
    #gherkin-action-select {
        font-size: 0.8rem !important;
        min-width: 80px !important;
        max-width: 140px !important;
    }
    
    #gherkin-log {
        min-height: 80px !important;
    }
}

/* Estilos para a barra de status melhorada */
.gherkin-status-bar {
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
}

.gherkin-status-bar > div {
    transition: all 0.2s ease;
    white-space: nowrap;
}

.gherkin-status-bar > div:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

/* AnimaÃ§Ã£o para o status de gravaÃ§Ã£o */
@keyframes recording-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.gherkin-status-bar > div:first-child {
    animation: recording-pulse 2s infinite;
}

/* Responsividade especÃ­fica para a barra de status */
@media (max-width: 480px) {
    .gherkin-status-bar {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 4px !important;
        padding: 8px 10px !important;
    }
    
    .gherkin-status-bar > div {
        flex: 1 1 auto;
        min-width: 80px;
        max-width: none !important;
        font-size: 0.75rem !important;
    }
    
    .gherkin-status-bar > div:last-child,
    .gherkin-status-bar > div:nth-last-child(2) {
        flex: 0 0 auto;
        min-width: fit-content;
    }
}

@media (max-width: 360px) {
    .gherkin-status-bar span {
        font-size: 0.7rem !important;
    }
    
    .gherkin-actions-bar button {
        font-size: 0.65rem !important;
        min-width: 45px !important;
        max-width: 55px !important;
        height: 26px !important;
    }
    
    #gherkin-action-select {
        font-size: 0.75rem !important;
        min-width: 70px !important;
        max-width: 120px !important;
    }
}

/* Touch-friendly mobile adjustments */
@media (hover: none) and (pointer: coarse) {
    .gherkin-panel button,
    .gherkin-btn {
        min-height: 44px;
        min-width: 44px;
        padding: 12px;
    }
    
    .gherkin-panel input,
    .gherkin-panel select {
        min-height: 44px;
        font-size: 16px; /* Previne zoom no iOS */
    }
}

/* Smooth transitions for theme changes */
* {
    transition: background-color var(--transition), 
                color var(--transition), 
                border-color var(--transition);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    :root {
        --border-color: #000;
        --text-secondary: #000;
    }
    
    [data-theme="dark"] {
        --border-color: #fff;
        --text-secondary: #fff;
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

    /* Utility Classes-Layout */
    .gherkin-flex { display: flex; }
    .gherkin-flex-col { display: flex; flex-direction: column; }
    .gherkin-flex-row { display: flex; flex-direction: row; }
    .gherkin-items-center { align-items: center; }
    .gherkin-justify-center { justify-content: center; }
    .gherkin-justify-between { justify-content: space-between; }
    .gherkin-justify-end { justify-content: flex-end; }
    .gherkin-flex-1 { flex: 1; }
    .gherkin-flex-wrap { flex-wrap: wrap; }
    .gherkin-gap-xs { gap: var(--spacing-xs); }
    .gherkin-gap-sm { gap: var(--spacing-sm); }
    .gherkin-gap-md { gap: var(--spacing-md); }
    .gherkin-gap-lg { gap: var(--spacing-lg); }
    
    .gherkin-w-full { width: 100 %; }
    .gherkin-h-full { height: 100 %; }
    .gherkin-text-center { text-align: center; }
    .gherkin-text-left { text-align: left; }
    .gherkin-text-right { text-align: right; }
    
    .gherkin-mt-auto { margin-top: auto; }
    .gherkin-mb-sm { margin-bottom: var(--spacing-sm); }
    .gherkin-mb-md { margin-bottom: var(--spacing-md); }
    
    .gherkin-p-sm { padding: var(--spacing-sm); }
    .gherkin-p-md { padding: var(--spacing-md); }
    .gherkin-p-lg { padding: var(--spacing-lg); }

    /* Componentes EspecÃ­ficos Refinados */

    /* DecisÃ£o States (CenÃ¡rio/Feature Finalizados) */
    .gherkin-decision-state {
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: var(--spacing-lg);
    padding: 40px 20px;
    text-align: center;
}
    
    .gherkin-decision-title {
    color: var(--color-success);
    margin-bottom: var(--spacing-lg);
    font-size: 1.25rem;
}
    
    .gherkin-decision-actions {
    display: flex;
    gap: var(--spacing-md);
    width: 100 %;
    max-width: 400px;
    justify-content: center;
}

    /* Modal Styles (Substituindo inline em modals.js) */
    .gherkin-modal-bg {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    width: 100vw; height: 100vh;
    background: var(--bg-overlay);
    backdrop-filter: var(--blur-md);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10003;
    animation: gherkinFadeIn var(--transition-fast) ease-out;
}

    .gherkin-modal-content {
    background: var(--bg-primary);
    padding: var(--spacing-xl);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-2xl);
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    min-width: 360px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
    animation: gherkinSlideUp var(--transition-base) ease-out;
}
    
    .gherkin-modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

    .gherkin-modal-footer {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-sm);
    justify-content: flex-end;
}

    .gherkin-label {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
    display: block;
}

    /* Typography */
    .gherkin-h3 {
    color: var(--color-primary);
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: var(--spacing-sm);
}
    
    .gherkin-text-muted {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

    /* List Container for Export */
    .gherkin-list-container {
    flex: 1;
    overflow-y: auto;
    margin-bottom: var(--spacing-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: var(--spacing-sm);
    background: var(--bg-secondary);
}
    
    .gherkin-list-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) 0;
    transition: background var(--transition-fast);
}
    
    .gherkin-list-item:hover {
        background-color: rgba(0, 0, 0, 0.02);
    }

    .gherkin-context-menu {
        position: fixed;
        z-index: 10005;
        background: var(--bg-primary, #fff);
        border: 1px solid var(--border-color, #ddd);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 6px;
        min-width: 160px;
        padding: 4px 0;
        font-size: 14px;
        animation: gherkinFadeIn 0.1s ease-out;
    }
    .gherkin-menu-item {
        padding: 8px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-primary, #333);
        transition: background-color 0.2s;
    }
    .gherkin-menu-item:hover {
        background-color: var(--bg-secondary, #f8f9fa);
    }
    .gherkin-menu-item.danger {
        color: #dc3545;
    }
    .gherkin-menu-item.danger:hover {
        background-color: #fff5f5;
    }
      /* Modal Styles */
    .gherkin-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        backdrop-filter: blur(4px);
    }

    .gherkin-modal-content {
        background: var(--bg-primary);
        padding: 24px;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        width: 90%;
        max-width: 400px;
        border: 1px solid var(--border-color);
        animation: gherkinFadeIn 0.3s ease-out;
    }
    
    .gherkin-h3 {
        margin: 0;
        color: var(--text-primary);
        font-size: 1.1rem;
        font-weight: 600;
    }
  `;
  document.head.appendChild(style);
}

