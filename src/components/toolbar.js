// Componente Toolbar - Barra superior do modo gravação
import { getStore } from '../state/store.js';

/**
 * Renderiza a toolbar superior no modo gravação
 * @param {HTMLElement} container - Container onde a toolbar será renderizada
 */
export function renderToolbar(container) {
    const store = getStore();
    const state = store.getState();
    const { currentFeature, currentScenario, isPaused, interactions, elapsedSeconds } = state;

    const minutes = Math.floor((elapsedSeconds || 0) / 60);
    const seconds = (elapsedSeconds || 0) % 60;
    const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    container.innerHTML = `
        <div class="gherkin-toolbar-header">
            <div class="gherkin-toolbar-left">
                <span class="gherkin-toolbar-brand">Automação BDD</span>
                <span class="gherkin-toolbar-separator">|</span>
                <span class="gherkin-toolbar-info">
                    <strong>Feature:</strong> ${currentFeature ? currentFeature.name : '—'}
                </span>
                <span class="gherkin-toolbar-separator">|</span>
                <span class="gherkin-toolbar-info">
                    <strong>Cenário:</strong> ${currentScenario ? currentScenario.name : '—'}
                </span>
            </div>
            <div class="gherkin-toolbar-window-controls">
                <button id="toolbar-ghost" class="gherkin-toolbar-btn gherkin-toolbar-btn--icon" title="${state.isGhostMode ? 'Expandir Painel' : 'Modo Fantasma (Encolher)'}">
                    ${state.isGhostMode ? '👁️' : '👻'}
                </button>
                <button id="toolbar-minimize" class="gherkin-toolbar-btn gherkin-toolbar-btn--icon" title="Minimizar">▬</button>
                <button id="toolbar-close" class="gherkin-toolbar-btn gherkin-toolbar-btn--icon gherkin-toolbar-btn--close" title="Fechar">✕</button>
            </div>
        </div>
        <div class="gherkin-toolbar">
            <div class="gherkin-toolbar-center">
                <button id="toolbar-new-feature" class="gherkin-toolbar-btn gherkin-toolbar-btn--outline" title="Criar nova Feature">
                    + Nova Feature
                </button>
                <button id="toolbar-new-scenario" class="gherkin-toolbar-btn gherkin-toolbar-btn--outline" title="Criar novo Cenário">
                    Novo Cenário
                </button>
                <button id="toolbar-toggle-recording" class="gherkin-toolbar-btn gherkin-toolbar-btn--recording" title="${isPaused ? 'Continuar Gravação' : 'Pausar Gravação'}" ${state.isReplaying ? 'style="display:none"' : ''}>
                    ${isPaused ? '▶ Continuar' : '● Gravando'}
                </button>
                <button id="toolbar-end-scenario" class="gherkin-toolbar-btn gherkin-toolbar-btn--ghost" title="Encerrar Cenário Atual" ${state.isReplaying ? 'style="display:none"' : ''}>
                    Encerrar Cenário
                </button>
                ${state.isReplaying ? 
                    `<button id="toolbar-stop-replay" class="gherkin-toolbar-btn gherkin-toolbar-btn--recording" title="Parar Reprodução Automática">⏹ Parar Replay</button>` :
                    `<button id="toolbar-start-replay" class="gherkin-toolbar-btn gherkin-toolbar-btn--success" title="Reproduzir Cenário (Dry-Run)" ${(!interactions || interactions.length === 0) ? 'disabled' : ''}>▶ Reproduzir</button>`
                }
            </div>
            <div class="gherkin-toolbar-right">
                <div class="gherkin-toolbar-meta">
                    <span class="gherkin-toolbar-badge">⏱ ${timeText}</span>
                    <span class="gherkin-toolbar-badge gherkin-toolbar-badge--count">📋 ${(interactions || []).length}</span>
                </div>
                <button id="toolbar-export" class="gherkin-toolbar-btn gherkin-toolbar-btn--export" title="Exportar Testes">
                    Exportar Testes
                </button>
                <button id="toolbar-help" class="gherkin-toolbar-btn gherkin-toolbar-btn--outline" title="Manual / Ajuda">
                    Manual
                </button>
            </div>
        </div>
    `;
}

/**
 * Liga os event listeners da toolbar
 * @param {HTMLElement} container - Container da toolbar
 */
export function attachToolbarListeners(container) {
    const store = getStore();
    const state = store.getState();

    const bind = (id, handler) => {
        const el = container.querySelector(`#${id}`);
        if (el) el.addEventListener('click', handler);
    };

    bind('toolbar-toggle-recording', () => store.togglePause());

    bind('toolbar-end-scenario', () => store.finishScenario());

    bind('toolbar-start-replay', () => {
        if (state.interactions && state.interactions.length > 0) {
            // Abre modal de configuração antes de iniciar
            const { showReplayConfig } = require('./replay-config.js');
            const panel = container.closest('.gherkin-panel');
            if (panel) {
                showReplayConfig(panel, state.interactions);
            } else {
                store.startReplay(); // Fallback direto
            }
        }
    });

    bind('toolbar-stop-replay', () => {
        store.stopReplay();
    });

    bind('toolbar-new-feature', () => {
        if (confirm('Isso irá finalizar a feature atual. Continuar?')) {
            store.finishFeature();
        }
    });

    bind('toolbar-new-scenario', () => {
        if (state.interactions && state.interactions.length > 0) {
            if (confirm('Finalizar cenário atual e iniciar um novo?')) {
                store.finishScenario();
            }
        }
    });

    bind('toolbar-export', () => {
        if (state.features && state.features.length > 0) {
            store.setState({ panelState: 'exportar' });
        } else if (state.currentFeature) {
            if (confirm('Isso irá finalizar a feature atual para exportar. Continuar?')) {
                store.finishFeature();
            }
        } else {
            alert('Não há dados para exportar.');
        }
    });

    bind('toolbar-help', () => {
        window.open(chrome.runtime.getURL('src/help.html'), '_blank');
    });

    bind('toolbar-ghost', () => {
        store.toggleGhostMode();
    });

    bind('toolbar-minimize', () => {
        const panel = document.getElementById('gherkin-panel');
        if (panel) {
            panel.classList.toggle('gherkin-panel--minimized');
            const isMinimized = panel.classList.contains('gherkin-panel--minimized');
            const btn = document.getElementById('toolbar-minimize');
            if (btn) {
                btn.innerHTML = isMinimized ? '🗗' : '▬';
                btn.title = isMinimized ? 'Maximizar' : 'Minimizar';
            }
        }
    });

    bind('toolbar-close', () => {
        store.setState({ isRecording: false, isPaused: false, isVisible: false });
    });
}
