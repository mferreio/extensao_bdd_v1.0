// Estilos globais da extensão Gherkin
export function injectGherkinStyles() {
    if (document.getElementById('gherkin-global-style')) return;
    
    const style = document.createElement('style');
    style.id = 'gherkin-global-style';
    style.textContent = `
:root {
  --panel-bg: #ffffff;
  --panel-header-bg: #0D47A1;
  --panel-header-color: #ffffff;
  --btn-main-bg: #007bff;
  --btn-main-color: #ffffff;
  --btn-danger-bg: #dc3545;
  --btn-danger-color: #ffffff;
  --btn-warning-bg: #ffc107;
  --btn-warning-color: #212529;
  --border-radius: 8px;
  --transition: 0.3s ease;
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
  background: var(--panel-bg);
  border-radius: var(--border-radius);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  overflow: hidden;
  font-family: 'Roboto', sans-serif;
  border: none;
}
.gherkin-panel-header {
  background: var(--panel-header-bg);
  color: var(--panel-header-color);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.gherkin-panel-header h3 {
  margin: 0; font-size: clamp(0.9rem, 2.5vw, 1rem); font-weight: 600; line-height: 1.2;
}
.button-container-top button {
  background: transparent; border: none; cursor: pointer; padding: 4px;
}
.gherkin-content {
  padding: 16px; flex: 1; display: flex; flex-direction: column;
}
.gherkin-btn {
  border: none;
  border-radius: var(--border-radius);
  padding: 8px 16px;
  cursor: pointer;
  transition: background var(--transition);
}
.gherkin-btn-main { background: var(--btn-main-bg); color: var(--btn-main-color);}
.gherkin-btn-danger { background: var(--btn-danger-bg); color: var(--btn-danger-color);}
.gherkin-btn-warning { background: var(--btn-warning-bg); color: var(--btn-warning-color);}
.gherkin-btn-success { background: #28a745; color: #ffffff;}
.gherkin-btn:hover { filter: brightness(1.1); }
.gherkin-status-bar { background:#f7faff; border-radius: var(--border-radius); padding: 8px 12px; }
#gherkin-log { border-radius: var(--border-radius); padding: 8px; background:#f9f9f9; }

/* Estilos para highlight de elementos */
.gherkin-element-highlight {
    animation: gherkinHighlightPulse 1.5s ease-in-out infinite alternate;
}

@keyframes gherkinHighlightPulse {
    0% {
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
        transform: scale(1);
    }
    100% {
        box-shadow: 0 0 20px rgba(0, 123, 255, 0.8);
        transform: scale(1.02);
    }
}

/* Estilos para highlight de múltiplos elementos */
.gherkin-element-highlight:nth-child(odd) {
    animation-delay: 0.3s;
}

.gherkin-element-highlight:nth-child(even) {
    animation-delay: 0.6s;
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

/* Animação para o status de gravação */
@keyframes recording-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.gherkin-status-bar > div:first-child {
    animation: recording-pulse 2s infinite;
}

/* Responsividade específica para a barra de status */
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
`;
    document.head.appendChild(style);
}
