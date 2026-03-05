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
  background: #2c3e50;
  color: #ffffff;

  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-bottom: none;
}

.gherkin-panel-header h3 {
  margin: 0;
  font-size: clamp(0.8rem, 2.2vw, 0.95rem);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: #ffffff;
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
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 500;
  font-size: 0.875rem;
  letter-spacing: 0.01em;
  box-shadow: none;
}

.gherkin-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  filter: brightness(1.08);
}

.gherkin-btn:active {
  transform: translateY(0);
  box-shadow: none;
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

.gherkin-btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  box-shadow: none;
}

.gherkin-btn-outline:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-color-hover);
}

.gherkin-btn-excel {
  background: linear-gradient(135deg, #217346 0%, #2e8b57 100%);
  color: #ffffff;
}

.gherkin-btn-excel:hover {
  background: linear-gradient(135deg, #1d6b3f 0%, #267349 100%);
  box-shadow: 0 4px 12px rgba(33, 115, 70, 0.4);
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
  max-height: 380px;
  overflow-y: auto;
  overflow-x: hidden;
}

#gherkin-log::-webkit-scrollbar {
  width: 8px;
}

#gherkin-log::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

#gherkin-log::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: var(--radius-sm);
}

#gherkin-log::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary-light);
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
        max-height: 300px !important;
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


    /* ========================================
       RECORDING LAYOUT - Wide Mode
       ======================================== */

    /* Panel wide mode override */
    .gherkin-panel--wide {
        width: 900px !important;
        max-width: 95vw !important;
        min-width: 700px !important;
        max-height: 85vh !important;
        /* Remover top e right !important para permitir arrastar vertical e horizontalmente */
    }

    /* Estado minimizado (funciona bem com o wide onde temos a toolbar) */
    .gherkin-panel--minimized {
        height: auto !important;
        min-height: auto !important;
    }
    
    .gherkin-panel--minimized .gherkin-recording-layout,
    .gherkin-panel--minimized .gherkin-content {
        display: none !important;
    }

    /* Toolbar */
    .gherkin-toolbar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #2c3e50;
        color: #fff;
        padding: 6px 16px;
        font-size: 0.85rem;
        flex-shrink: 0;
        border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .gherkin-toolbar-window-controls {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
    }
    .gherkin-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #34495e;
        color: #fff;
        padding: 6px 16px;
        font-size: 0.85rem;
        gap: 10px;
        flex-wrap: wrap;
        flex-shrink: 0;
    }
    .gherkin-toolbar-left {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
    }
    .gherkin-toolbar-brand {
        font-weight: 700;
        font-size: 1rem;
        letter-spacing: -0.02em;
    }
    .gherkin-toolbar-separator {
        color: rgba(255,255,255,0.3);
        font-size: 0.9em;
    }
    .gherkin-toolbar-info {
        font-size: 0.85em;
        color: rgba(255,255,255,0.85);
    }
    .gherkin-toolbar-info strong {
        color: #fff;
    }
    .gherkin-toolbar-center {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }
    .gherkin-toolbar-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .gherkin-toolbar-meta {
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .gherkin-toolbar-badge {
        background: rgba(255,255,255,0.15);
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: 600;
    }
    .gherkin-toolbar-badge--count {
        color: #f39c12;
    }

    /* Toolbar Buttons */
    .gherkin-toolbar-btn {
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 6px;
        padding: 5px 14px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        color: #fff;
        background: rgba(255,255,255,0.1);
        transition: all 0.2s;
        white-space: nowrap;
    }
    .gherkin-toolbar-btn:hover {
        background: rgba(255,255,255,0.2);
        transform: translateY(-1px);
    }
    .gherkin-toolbar-btn--success {
        background: #27ae60;
        border-color: #27ae60;
    }
    .gherkin-toolbar-btn--success:hover {
        background: #219a52;
    }
    .gherkin-toolbar-btn--outline {
        background: transparent;
        border-color: rgba(255,255,255,0.4);
    }
    .gherkin-toolbar-btn--recording {
        background: #e74c3c;
        border-color: #e74c3c;
        animation: recording-pulse 2s infinite;
    }
    .gherkin-toolbar-btn--warning {
        background: #e67e22;
        border-color: #e67e22;
    }
    .gherkin-toolbar-btn--export {
        background: var(--color-primary-gradient);
        border-color: var(--color-primary);
    }
    .gherkin-toolbar-btn--icon {
        width: 28px;
        height: 28px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 0.8rem;
        background: transparent;
        border-color: transparent;
    }
    .gherkin-toolbar-btn--icon:hover {
        background: rgba(255,255,255,0.15);
    }
    .gherkin-toolbar-btn--close:hover {
        background: #e74c3c;
    }
    .gherkin-toolbar-btn--ghost {
        background: transparent;
        border-color: transparent;
        color: rgba(255,255,255,0.7);
        font-weight: 400;
    }
    .gherkin-toolbar-btn--ghost:hover {
        color: #fff;
        background: rgba(255,255,255,0.1);
    }

    /* Recording Layout Grid */
    .gherkin-recording-layout {
        display: grid;
        grid-template-columns: 1fr 380px;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        max-height: calc(100vh - 80px); /* Ajustado para compensar remoção do footer de detalhes */
    }

    /* Scenario Editor (Left Column) */
    .gherkin-scenario-editor {
        grid-row: 1;
        grid-column: 1;
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--border-color);
        overflow: hidden;
        min-height: 0;
    }
    .gherkin-scenario-editor__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-color);
        background: var(--bg-secondary);
    }
    .gherkin-scenario-editor__header h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
    }
    .gherkin-scenario-editor__header-actions {
        display: flex;
        gap: 4px;
    }
    .gherkin-scenario-editor__header-actions button {
        background: none;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        width: 28px;
        height: 28px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85em;
        color: var(--text-secondary);
        transition: all 0.15s;
    }
    .gherkin-scenario-editor__header-actions button:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }

    /* Step Items (BDD steps) */
    .gherkin-step-list {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 540px;
        overflow-x: hidden;
    }
    .gherkin-step-list::-webkit-scrollbar { width: 6px; }
    .gherkin-step-list::-webkit-scrollbar-track { background: transparent; }
    .gherkin-step-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
    [data-theme="dark"] .gherkin-step-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
    
    .gherkin-step-item.is-dragging {
        opacity: 0.5;
        transform: scale(0.98);
        border: 2px dashed var(--color-primary) !important;
    }
    .gherkin-step-item.drag-over-top {
        border-top: 2px solid var(--color-primary) !important;
    }
    .gherkin-step-item.drag-over-bottom {
        border-bottom: 2px solid var(--color-primary) !important;
    }
    .gherkin-step-item {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        border-radius: 8px;
        border-left: 4px solid #ccc;
        background: var(--bg-primary);
        box-shadow: var(--shadow-xs);
        cursor: pointer;
        transition: all 0.15s;
        gap: 8px;
        font-size: 0.88rem;
    }
    .gherkin-step-item:hover {
        box-shadow: var(--shadow-sm);
        transform: translateX(2px);
    }
    .gherkin-step-item--selected {
        box-shadow: 0 0 0 2px var(--color-primary-light), var(--shadow-sm);
    }
    .gherkin-step-item--given  { border-left-color: #27ae60; background: #f0faf4; }
    .gherkin-step-item--when   { border-left-color: #e67e22; background: #fef8f0; }
    .gherkin-step-item--and    { border-left-color: #3498db; background: #f0f7fe; }
    .gherkin-step-item--then   { border-left-color: #2ecc71; background: #f0fdf4; }

    [data-theme="dark"] .gherkin-step-item--given  { background: rgba(39, 174, 96, 0.08); }
    [data-theme="dark"] .gherkin-step-item--when   { background: rgba(230, 126, 34, 0.08); }
    [data-theme="dark"] .gherkin-step-item--and    { background: rgba(52, 152, 219, 0.08); }
    [data-theme="dark"] .gherkin-step-item--then   { background: rgba(46, 204, 113, 0.08); }

    .gherkin-step-item__header {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }
    
    .gherkin-step-item__title {
        display: flex;
        align-items: baseline;
        gap: 6px;
    }

    .gherkin-step-item__keyword {
        font-weight: 700;
        font-size: 0.85em;
        min-width: 42px;
        flex-shrink: 0;
    }
    .gherkin-step-item--given .gherkin-step-item__keyword { color: #27ae60; }
    .gherkin-step-item--when .gherkin-step-item__keyword  { color: #e67e22; }
    .gherkin-step-item--and .gherkin-step-item__keyword   { color: #3498db; }
    .gherkin-step-item--then .gherkin-step-item__keyword  { color: #2ecc71; }

    .gherkin-step-item__text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--text-primary);
    }
    .gherkin-step-item__text em {
        color: var(--color-primary);
        font-style: normal;
        font-weight: 600;
    }
    .gherkin-step-item__actions {
        display: flex;
        gap: 2px;
        opacity: 0;
        transition: opacity 0.15s;
        flex-shrink: 0;
    }
    .gherkin-step-item:hover .gherkin-step-item__actions {
        opacity: 1;
    }
    
    /* Reorder Mode Toggles */
    .gherkin-step-item__actions .reorder-only { display: none; }
    .gherkin-step-list.is-reordering .gherkin-step-item__actions .reorder-only { display: inline-block; }
    .gherkin-step-list.is-reordering .gherkin-step-item__actions .default-only { display: none; }
    .gherkin-step-list.is-reordering .gherkin-step-item__actions { opacity: 1 !important; }

    .gherkin-step-item__actions button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px 4px;
        font-size: 0.9em;
        color: var(--text-secondary);
        border-radius: 4px;
        transition: all 0.15s;
    }
    .gherkin-step-item__actions button:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }
    .gherkin-step-item__actions button.danger:hover {
        color: #e74c3c;
        background: #ffeaea;
    }

    /* Scenario Editor Footer */
    .gherkin-scenario-editor__footer {
        padding: 10px 16px;
        border-top: 1px solid var(--border-color);
        background: var(--bg-secondary);
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .gherkin-scenario-editor__footer select {
        padding: 4px 8px;
        font-size: 0.82rem;
        border-radius: 4px;
        border: 1px solid var(--border-color);
    }

    /* Step Editor Sidebar (Right Column) */
    .gherkin-step-editor {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-height: 100%;
        min-height: 0;
        overflow: hidden;
        background: var(--bg-primary);
        grid-row: 1 / -1;
        grid-column: 2;
    }
    .gherkin-step-editor--empty {
        align-items: center;
        justify-content: center;
    }
    .gherkin-step-editor__placeholder {
        text-align: center;
        color: var(--text-tertiary);
        padding: 40px;
    }
    .gherkin-step-editor__placeholder p {
        margin-top: 8px;
        font-size: 0.9rem;
    }
    .gherkin-step-editor__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-color);
        background: var(--bg-secondary);
    }
    .gherkin-step-editor__header h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
    }
    .gherkin-step-editor__close {
        background: none;
        border: none;
        font-size: 1.1rem;
        cursor: pointer;
        color: var(--text-secondary);
        padding: 4px;
        border-radius: 4px;
    }
    .gherkin-step-editor__close:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }
    .gherkin-step-editor__body {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        min-height: 0; /* Importante para permitir scroll em flex containers */
    }
    .gherkin-step-editor-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .gherkin-step-editor__field {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .gherkin-step-editor__field label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-secondary);
    }
    .gherkin-step-editor__field input,
    .gherkin-step-editor__field select {
        padding: 8px 10px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 0.9rem;
        background: var(--bg-primary);
        width: 100%;
        box-sizing: border-box;
        max-width: 100%;
        color: var(--text-primary);
    }
    .gherkin-step-editor__field select {
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .gherkin-step-editor__divider {
        height: 1px;
        background: var(--border-color);
        margin: 4px 0;
    }
    .gherkin-step-editor__section label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: 8px;
        display: block;
    }
    .gherkin-step-editor__footer {
        flex-shrink: 0;
        padding: 12px 16px;
        border-top: 1px solid var(--border-color);
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        background: var(--bg-secondary);
    }

    /* XPath Options */
    .gherkin-xpath-options {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .gherkin-xpath-option {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid var(--border-color);
        cursor: pointer;
        font-size: 0.82rem;
        transition: all 0.15s;
        background: var(--bg-primary);
    }
    .gherkin-xpath-option:hover {
        border-color: var(--color-primary-light);
        background: rgba(59, 130, 246, 0.04);
    }
    .gherkin-xpath-option--recommended {
        border-color: #27ae60;
        background: #f0faf4;
    }
    .gherkin-xpath-option input[type="radio"] {
        display: none;
    }
    .gherkin-xpath-option__check {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7em;
        color: transparent;
        flex-shrink: 0;
        transition: all 0.15s;
    }
    .gherkin-xpath-option input[type="radio"]:checked ~ .gherkin-xpath-option__check {
        background: #27ae60;
        border-color: #27ae60;
        color: #fff;
    }
    .gherkin-xpath-option__text {
        flex: 1;
        word-break: break-all;
        white-space: normal;
        font-family: var(--font-mono);
        line-height: 1.4;
    }
    .gherkin-xpath-option__actions {
        display: flex;
        gap: 2px;
        margin-left: auto;
        opacity: 0.6;
        transition: opacity 0.2s;
    }
    .gherkin-xpath-option:hover .gherkin-xpath-option__actions {
        opacity: 1;
    }
    .gherkin-btn-icon {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: var(--text-secondary);
        border: none;
        transition: all 0.15s;
        border-radius: 4px;
        cursor: pointer;
    }
    .gherkin-btn-icon:hover {
        background: var(--border-color);
        color: var(--color-primary-dark);
    }
    .gherkin-xpath-custom-label {
        font-size: 0.82rem !important;
        color: var(--color-primary) !important;
        cursor: pointer;
    }
    .gherkin-xpath-custom-label em {
        color: var(--color-primary-light);
    }

    /* Code Preview */
    .gherkin-code-preview {
        background: #2c3e50;
        border-radius: 8px;
        padding: 10px 14px;
        margin-top: 8px;
    }
    .gherkin-code-preview code {
        color: #ecf0f1;
        font-family: var(--font-mono);
        font-size: 0.82rem;
        word-break: break-all;
    }

    /* Step Editor Container (spans right column) */
    .gherkin-step-editor-container {
        grid-column: 2;
        grid-row: 1;
        border-left: 1px solid var(--border-color);
        overflow: hidden; /* O scroll será interno ao editor */
    }

    /* Minimized state */
    .gherkin-panel--minimized .gherkin-recording-layout,
    .gherkin-panel--minimized .gherkin-content,
    .gherkin-panel--minimized #gherkin-footer {
        display: none !important;
    }

    /* Responsive - Recording Layout */
    @media (max-width: 900px) {
        .gherkin-panel--wide {
            min-width: auto !important;
            width: calc(100vw - 20px) !important;
        }
        .gherkin-recording-layout {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto;
        }
        .gherkin-step-editor-container {
            grid-column: 1;
            grid-row: auto;
            border-left: none;
            border-top: 1px solid var(--border-color);
            max-height: 300px;
        }
        .gherkin-toolbar-center {
            order: 3;
            width: 100%;
            justify-content: center;
        }
    }

    /* Modificadores de Estado de Replay (Dry-Run Nativo) */
    .gherkin-step-item.is-playing {
        border-left: 6px solid var(--color-warning) !important;
        background-color: rgba(251, 191, 36, 0.1) !important;
        animation: gherkinPulsePlay 1.5s infinite;
    }
    .gherkin-step-item.is-success {
        border-left-color: var(--color-success) !important;
        opacity: 0.8;
    }
    .gherkin-step-item.is-error {
        border-left: 6px solid var(--color-danger) !important;
        background-color: rgba(248, 113, 113, 0.1) !important;
    }

    @keyframes gherkinPulsePlay {
        0% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4); }
        70% { box-shadow: 0 0 0 6px rgba(251, 191, 36, 0); }
        100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
    }

    /* XPath Live Validation UI */
    input.gherkin-xpath-valid {
        border-color: var(--color-success) !important;
        background-color: rgba(46, 204, 113, 0.05) !important;
        box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.2) !important;
    }
    
    input.gherkin-xpath-invalid {
        border-color: var(--color-danger) !important;
        background-color: rgba(231, 76, 60, 0.05) !important;
        box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
    }
    
    /* Destaque Element Spotlight no DOM Original */
    .gherkin-spotlight {
        outline: 3px solid var(--color-primary) !important;
        outline-offset: 2px !important;
        background-color: rgba(52, 152, 219, 0.2) !important;
        box-shadow: 0 0 10px rgba(52, 152, 219, 0.6) !important;
        transition: all 0.2s ease-in-out !important;
        z-index: 999999 !important;
    }

    /* Replay Progress Bar */
    .gherkin-replay-progress {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        margin-bottom: 8px;
        border-radius: 8px;
        font-size: 0.82rem;
    }
    .gherkin-replay-progress--running {
        flex-direction: column;
        gap: 6px;
        background: rgba(251, 191, 36, 0.1);
        border: 1px solid rgba(251, 191, 36, 0.3);
    }
    .gherkin-replay-progress__bar-container {
        width: 100%;
        height: 6px;
        background: var(--border-color);
        border-radius: 3px;
        overflow: hidden;
    }
    .gherkin-replay-progress__bar {
        height: 100%;
        background: var(--color-warning);
        border-radius: 3px;
        transition: width 0.3s ease;
    }
    .gherkin-replay-progress__info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
    }
    .gherkin-replay-progress__info strong {
        font-size: 0.85rem;
    }
    .gherkin-replay-progress__info span {
        font-size: 0.78rem;
        color: var(--text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .gherkin-replay-progress__icon {
        font-size: 1.2em;
        flex-shrink: 0;
    }
    .gherkin-replay-progress--success {
        background: rgba(46, 204, 113, 0.1);
        border: 1px solid rgba(46, 204, 113, 0.3);
    }
    .gherkin-replay-progress--error {
        background: rgba(231, 76, 60, 0.1);
        border: 1px solid rgba(231, 76, 60, 0.3);
    }

    /* Replay Config Modal */
    .gherkin-replay-config-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        border-radius: 12px;
    }
    .gherkin-replay-config {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        padding: 20px;
        width: 280px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .gherkin-replay-config__title {
        margin: 0 0 14px 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-primary);
    }
    .gherkin-replay-config__field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
    }
    .gherkin-replay-config__field label {
        font-size: 0.85rem;
        color: var(--text-secondary);
        font-weight: 500;
    }
    .gherkin-replay-config__info {
        margin-bottom: 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .gherkin-replay-config__total {
        padding: 8px 12px;
        background: var(--bg-secondary);
        border-radius: 6px;
        font-size: 0.85rem;
        color: var(--text-primary);
        margin-bottom: 14px;
        text-align: center;
    }
    .gherkin-replay-config__actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    }

    /* Bulk Paste */
    .gherkin-bulk-textarea {
        width: 100%;
        resize: vertical;
        padding: 8px 10px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-family: var(--font-mono);
        font-size: 0.82rem;
        line-height: 1.5;
        box-sizing: border-box;
    }
    .gherkin-bulk-textarea:focus {
        outline: none;
        border-color: var(--color-primary-light);
    }
    .gherkin-bulk-badge {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--color-primary);
        background: rgba(52, 152, 219, 0.1);
        padding: 3px 8px;
        border-radius: 10px;
    }

    /* Fake Data Generator Dropdown */
    .gherkin-faker-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 50;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        padding: 4px;
        min-width: 170px;
        margin-top: 4px;
        display: flex;
        flex-direction: column;
    }
    .gherkin-faker-item {
        background: none;
        border: none;
        padding: 7px 12px;
        text-align: left;
        font-size: 0.83rem;
        color: var(--text-primary);
        border-radius: 5px;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.15s;
    }
    .gherkin-faker-item:hover {
        background: var(--bg-secondary);
    }
    /* Performance Audit Toggle */
    .gherkin-perf-toggle {
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: #f9fafb;
        cursor: pointer;
        transition: all 0.2s;
    }
    .gherkin-perf-toggle:hover {
        background: #fefce8;
        border-color: #eab308;
    }
    .gherkin-perf-toggle.active {
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        border-color: #d97706;
        color: #fff;
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
    }
    
    /* ==========================================
       GHOST MODE (MODO FANTASMA)
       ========================================== */
    .gherkin-panel--ghost {
        height: auto !important;
        width: 320px !important;
        min-height: 0 !important;
        overflow: hidden;
        border-radius: var(--radius-lg);
        opacity: 0.8;
        transition: all 0.3s ease;
    }

    /* Quando o usuário passa o mouse por cima do painel fantasma, ele volta à visibilidade total */
    .gherkin-panel--ghost:hover {
        opacity: 1;
        box-shadow: var(--shadow-xl);
    }

    /* Esconder áreas que não são a Toolbar enquanto estiver no Modo Fantasma */
    .gherkin-panel--ghost .gherkin-panel-content,
    .gherkin-panel--ghost .gherkin-footer,
    .gherkin-panel--ghost .gherkin-panel-step-editor {
        display: none !important;
    }

    /* Opicional: esconde alguns botões longos da toolbar para não quebrar linha na pílula */
    .gherkin-panel--ghost #toolbar-new-feature,
    .gherkin-panel--ghost #toolbar-new-scenario,
    .gherkin-panel--ghost #toolbar-export,
    .gherkin-panel--ghost #toolbar-help {
        display: none !important;
    }
  `;
  document.head.appendChild(style);
}

