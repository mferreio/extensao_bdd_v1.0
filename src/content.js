// Arquivo principal da extensão - Content Script refatorado
import { injectGherkinStyles } from './components/styles.js';
import { createPanel, renderPanelContent, makePanelDraggable } from './components/panel.js';
import { getStore } from './state/store.js';
import { handleClickEvent, handleInputEvent, handleBlurEvent, handleChangeEvent, handleKeydownEvent, handleNavigationEvent } from './events/capture.js';
import { getThemeManager } from './utils/theme.js';
import { getCSSSelector, getRobustXPath, testSelectorInRealTime, highlightElements, removeAllHighlights } from './utils/dom.js';
import { showFeedback } from '../utils.js';
import { initReplayEngine } from './replay/replay-engine.js';

// Variáveis de controle local
let panel = null;
let inspectionOverlay = null;
let currentHighlightedElement = null;

async function initializeExtension() {
    // Evita múltiplas inicializações
    if (window.gherkinExtensionInitialized) {
        return;
    }
    window.gherkinExtensionInitialized = true;

    // Easter Egg: Assinatura do Desenvolvedor
    console.log(`%c
  ___        _                                        ___  ___  ___  
 / _ \\      | |                                       | ___ \\ |  _  \\ 
/ /_\\ \\_   _| |_ ___  _ __ ___   __ _  ___ __ _  ___  | |_/ / | | | | 
|  _  | | | | __/ _ \\| '_ \\ \`_ \\ / _\` |/ __/ _\` |/ _ \\ | ___ \\ | | | | 
| | | | |_| | || (_) | | | | | | (_| | (_| (_| | (_) || |_/ / | |/ /  
\\_| |_/\\__,_|\\__\\___/|_| |_| |_|\\__,_|\\___\\__,_|\\___/ \\____/|___/   
----------------------------------------------------------------------
        => Idealizado e Desenvolvido por Matheus Ferreira <=          
----------------------------------------------------------------------
    `, "color: #3b82f6; font-weight: bold; font-family: monospace;");

    // Inicializa Store (Async)
    const store = getStore();
    await store.init();
    const initialState = store.getState();

    // Injeta estilos globais
    injectGherkinStyles();

    // Inicializa tema
    const themeManager = getThemeManager();
    themeManager.applyCSSVariables();

    // Cria o painel MAS só renderiza se estiver visível
    panel = createPanel();

    // Lógica Inicial de Exibição:
    // Mostra se: isVisible = true OU isRecording = true
    const shouldShow = initialState.isVisible || initialState.isRecording;

    if (panel) {
        makePanelDraggable(panel);

        if (shouldShow) {
            renderPanelContent(panel);
            // Adiciona botão de toggle de tema apenas se visível
            const themeButton = themeManager.createToggleButton();
            if (themeButton && document.body) {
                document.body.appendChild(themeButton);
            }
        } else {
            panel.style.display = 'none';
        }
    }

    // Listener para mensagens do Background (Toggle UI)
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'TOGGLE_UI') {
            store.toggleVisibility();
        }
    });

    // Subscreve ao Store para atualizações de UI e Lógica Reativa
    store.subscribe((state, oldState) => {
        // Controle de Visibilidade
        if (state.isVisible !== (oldState ? oldState.isVisible : false)) {
            if (state.isVisible) {
                if (panel) {
                    // Proteção: Re-anexar se foi removido
                    if (!document.body.contains(panel)) {
                        document.body.appendChild(panel);
                    }
                    panel.style.display = 'block';
                    renderPanelContent(panel);

                    // Botão tema
                    if (!document.querySelector('.gherkin-theme-toggle')) {
                        const themeButton = themeManager.createToggleButton();
                        if (themeButton) document.body.appendChild(themeButton);
                    }
                }
            } else {
                if (panel) panel.style.display = 'none';
                const themeBtn = document.querySelector('.gherkin-theme-toggle');
                if (themeBtn) themeBtn.remove();
            }
        }

        // Re-renderizar painel se necessário e visível
        // Otimização: Se apenas o timer mudou, atualiza só o elemento do timer (evita flicker)
        if (state.isVisible && panel && document.body.contains(panel)) {
            // Comparação por VALOR (não referência) já que o store faz deep clone
            const onlyTimerChanged = oldState &&
                state.elapsedSeconds !== oldState.elapsedSeconds &&
                state.panelState === oldState.panelState &&
                state.isPaused === oldState.isPaused &&
                state.isRecording === oldState.isRecording &&
                state.interactions.length === oldState.interactions.length &&
                state.selectedAction === oldState.selectedAction &&
                state.forceClick === oldState.forceClick &&
                state.isInspecting === oldState.isInspecting &&
                // Compara features/scenarios por nome, não referência
                (state.currentFeature?.name || '') === (oldState.currentFeature?.name || '') &&
                (state.currentScenario?.name || '') === (oldState.currentScenario?.name || '');

            if (onlyTimerChanged) {
                // Atualiza apenas o timer diretamente no DOM
                const timerEl = panel.querySelector('#gherkin-timer');
                if (timerEl) {
                    const minutes = Math.floor((state.elapsedSeconds || 0) / 60);
                    const seconds = (state.elapsedSeconds || 0) % 60;
                    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
            } else {
                // Re-renderiza o painel completo para outras mudanças
                renderPanelContent(panel);
            }
        }

        // Gerenciar modo de inspeção
        if (state.isInspecting !== (oldState ? oldState.isInspecting : false)) {
            toggleElementInspection(state.isInspecting);
        }

        // Gerenciar timer
        handleTimer(state.isRecording && !state.isPaused);
    });

    // Configura listeners de eventos de captura
    setupEventListeners();

    // Inicializa Motor de Replay (Dry-Run Nativo)
    initReplayEngine(store);
}

// Timer Loop
let timerInterval = null;
function handleTimer(shouldRun) {
    const store = getStore();
    if (shouldRun) {
        if (!timerInterval) {
            timerInterval = setInterval(() => {
                const state = store.getState();
                if (state.isRecording && !state.isPaused) {
                    store.setState({ elapsedSeconds: (state.elapsedSeconds || 0) + 1 });
                }
            }, 1000);
        }
    } else {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
}

function setupEventListeners() {
    // Remove listeners antigos com verificação de segurança
    if (document && typeof document.removeEventListener === 'function') {
        try {
            document.removeEventListener('click', handleClickEvent, true);
            document.removeEventListener('blur', handleBlurEvent, true);
            document.removeEventListener('change', handleChangeEvent, true);
            document.removeEventListener('keydown', handleKeydownEvent, true);
        } catch (e) {
            console.warn('Erro ao limpar listeners do documento:', e);
        }

        // Adiciona novos listeners
        try {
            document.addEventListener('click', handleClickEvent, true);
            document.addEventListener('blur', handleBlurEvent, true);
            document.addEventListener('change', handleChangeEvent, true);
            document.addEventListener('keydown', handleKeydownEvent, true);
        } catch (e) {
            console.error('Erro ao adicionar listeners do documento:', e);
        }
    }

    // Navegação - checks de window
    if (window && typeof window.addEventListener === 'function') {
        try {
            window.removeEventListener('popstate', handleNavigationEvent, false);
            window.removeEventListener('hashchange', handleNavigationEvent, false);

            window.addEventListener('popstate', handleNavigationEvent, false);
            window.addEventListener('hashchange', handleNavigationEvent, false);
        } catch (e) {
            console.warn('Erro ao manipular listeners de navegação:', e);
        }
    }

    // Monkey patch history (com cuidado)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
        originalPushState.apply(history, arguments);
        handleNavigationEvent({ type: 'pushstate', url: window.location.href });
    };

    history.replaceState = function () {
        originalReplaceState.apply(history, arguments);
        handleNavigationEvent({ type: 'replacestate', url: window.location.href });
    };
}

// ===== INSPEÇÃO DE ELEMENTOS =====

function createInspectionOverlay() {
    if (inspectionOverlay) return inspectionOverlay;

    inspectionOverlay = document.createElement('div');
    inspectionOverlay.id = 'gherkin-inspection-overlay';
    inspectionOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.1);
        z-index: 999998;
        pointer-events: none;
        display: none;
    `;
    if (document.body) {
        document.body.appendChild(inspectionOverlay);
    }
    return inspectionOverlay;
}

function createElementHighlight() {
    let highlight = document.getElementById('gherkin-element-highlight');
    if (highlight) return highlight;

    highlight = document.createElement('div');
    highlight.id = 'gherkin-element-highlight';
    highlight.style.cssText = `
        position: absolute;
        border: 2px solid #007bff;
        background: rgba(0, 123, 255, 0.1);
        pointer-events: none;
        z-index: 999999;
        display: none;
        box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
    `;
    if (document.body) {
        document.body.appendChild(highlight);
    }
    return highlight;
}

function updateHighlight(element) {
    if (!element || element.id === 'gherkin-panel' || element.closest('#gherkin-panel') || element.closest('.gherkin-modal-bg')) {
        return;
    }

    const highlight = createElementHighlight();
    const rect = element.getBoundingClientRect();

    highlight.style.display = 'block';
    highlight.style.left = (rect.left + window.scrollX) + 'px';
    highlight.style.top = (rect.top + window.scrollY) + 'px';
    highlight.style.width = rect.width + 'px';
    highlight.style.height = rect.height + 'px';

    currentHighlightedElement = element;
}

function hideHighlight() {
    const highlight = document.getElementById('gherkin-element-highlight');
    if (highlight) highlight.style.display = 'none';
    currentHighlightedElement = null;
}

function toggleElementInspection(active) {
    const overlay = createInspectionOverlay();

    if (active) {
        overlay.style.display = 'block';
        document.addEventListener('mouseover', handleInspectionMouseOver);
        document.addEventListener('click', handleInspectionClick, true);
        showFeedback('Modo de inspeção ativo. Clique em um elemento para ver seus seletores.', 'info');
    } else {
        overlay.style.display = 'none';

        // Safety check ao desligar inspeção
        hideHighlight();
        if (document && typeof document.removeEventListener === 'function') {
            try {
                document.removeEventListener('mouseover', handleInspectionMouseOver);
                document.removeEventListener('click', handleInspectionClick, true);
            } catch (e) {
                console.warn('Erro ao remover listeners de inspeção:', e);
            }
        }
    }
}

function handleInspectionMouseOver(event) {
    const element = event.target;
    if (!element || element.closest('#gherkin-panel') || element.closest('.gherkin-modal-bg')) return;
    updateHighlight(element);
}

function handleInspectionClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const element = event.target;
    if (!element || element.closest('#gherkin-panel') || element.closest('.gherkin-modal-bg')) return;

    // Desativar modo de inspeção via Store
    const store = getStore();
    const state = store.getState();

    // Se estiver em modo de inspeção manual (para preencher o modal)
    if (state.manualInspectionMode) {
        const cssSelector = getCSSSelector(element);
        const xpath = getRobustXPath(element);

        // Finaliza inspeção manual e passa os dados do elemento selecionado
        store.finishManualInspection({
            selector: cssSelector,
            xpath: xpath,
            tagName: element.tagName.toLowerCase(),
            elementId: element.id || ''
        });

        return;
    }

    store.toggleInspect(); // Vai disparar subscribe -> toggleElementInspection(false)

    // Mostrar modal com detalhes
    // Precisamos importar showXPathModal manualmente ou dinamicamente se quisermos evitar ciclo?
    // showXPathModal está em modals.js, que importa store.js.
    // content.js importa modals.js.
    // Ciclo: content -> modals -> store -> content? Não, store não importa content.
    // modals -> utils/dom.
    // Sim, podemos importar showXPathModal aqui. (Já está no topo)
    // Mas precisamos da info completa.

    const cssSelector = getCSSSelector(element);
    const xpath = getRobustXPath(element);
    // Info robustez pode ser calculada aqui ou modal calcula?
    // modal aceita (xpath, css, elementInfo)

    import('./components/modals.js').then(({ showXPathModal }) => {
        showXPathModal(xpath, cssSelector, {
            isValid: { css: true, xpath: true } // Simplificado por enquanto, ou chamar funções de teste
        });
    });
}

// Inicializa a extensão
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
}
