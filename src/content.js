// Arquivo principal da extensão - Content Script refatorado
import { injectGherkinStyles } from './components/styles.js';
import { createPanel, renderPanelContent, makePanelDraggable } from './components/panel.js';
import { renderLogWithActions } from './components/log.js';
import { showModal, showEditModal, showXPathModal, showLogDetailsModal } from './components/modals.js';
import { handleClickEvent, handleInputEvent, handleBlurEvent } from './events/capture.js';
import { exportSelectedFeatures } from './export/exporter.js';
import { slugify, downloadFile, showFeedback, debounce, isExtensionContextValid } from '../utils.js';

// Inicialização de variáveis globais
if (!window.gherkinFeatures) window.gherkinFeatures = [];
if (!window.currentFeature) window.currentFeature = null;
if (!window.currentCenario) window.currentCenario = null;
if (!window.gherkinPanelState) window.gherkinPanelState = 'feature';
if (typeof window.isRecording === 'undefined') window.isRecording = false;
if (typeof window.isPaused === 'undefined') window.isPaused = false;
if (typeof window.timerInterval === 'undefined') window.timerInterval = null;
if (typeof window.elapsedSeconds === 'undefined') window.elapsedSeconds = 0;
if (!window.interactions) window.interactions = [];
if (typeof window.isInspecting === 'undefined') window.isInspecting = false;
if (typeof window.forceNextClick === 'undefined') window.forceNextClick = false;

function initializeExtension() {
    // Evita múltiplas inicializações
    if (window.gherkinExtensionInitialized) {
        return;
    }
    window.gherkinExtensionInitialized = true;
    
    // Injeta estilos globais
    injectGherkinStyles();
    
    // Cria o painel se não existe
    if (!window.panel) {
        window.panel = createPanel();
        renderPanelContent(window.panel);
        makePanelDraggable(window.panel);
    }
    
    // Configura listeners de eventos
    setupEventListeners();
    
    // Torna as funções disponíveis globalmente
    makeGlobalFunctions();
}

function setupEventListeners() {
    // Remove listeners antigos para evitar duplicatas - garantia extra
    document.removeEventListener('click', handleClickEvent, true);
    document.removeEventListener('blur', handleBlurEvent, true);
    document.removeEventListener('click', handleClickEvent, false);
    document.removeEventListener('blur', handleBlurEvent, false);
    
    // Adiciona novos listeners apenas uma vez
    if (!window.gherkinEventListenersAdded) {
        document.addEventListener('click', handleClickEvent, true);
        document.addEventListener('blur', handleBlurEvent, true);
        window.gherkinEventListenersAdded = true;
    }
    
    // Inicializa eventos do painel
    setTimeout(() => {
        initializePanelEvents();
    }, 100);
}

function makeGlobalFunctions() {
    // Torna funções essenciais disponíveis globalmente
    window.renderLogWithActions = renderLogWithActions;
    window.renderPanelContent = renderPanelContent;
    window.showModal = showModal;
    window.showEditModal = showEditModal;
    window.showXPathModal = showXPathModal;
    window.showLogDetailsModal = showLogDetailsModal;
    
    // Funções de timer e status
    window.updateStatusBar = updateStatusBar;
    window.startTimer = startTimer;
    window.stopTimer = stopTimer;
    
    // Função para salvar interações
    if (typeof window.saveInteractionsToStorage !== 'function') {
        window.saveInteractionsToStorage = function() {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ 
                    interactions: window.interactions,
                    currentFeature: window.currentFeature,
                    currentCenario: window.currentCenario
                });
            }
        };
    }
    
    // Torna showFeedback disponível globalmente
    window.showFeedback = showFeedback;
}

function initializePanelEvents() {
    // Eventos específicos do painel
    const startFeatureBtn = document.getElementById('start-feature');
    if (startFeatureBtn) {
        startFeatureBtn.onclick = () => {
            const featureName = document.getElementById('feature-name')?.value?.trim();
            if (!featureName) {
                showFeedback('Por favor, informe o nome da Feature.', 'error');
                return;
            }
            
            window.currentFeature = { name: featureName, scenarios: [] };
            window.gherkinPanelState = 'cenario';
            renderPanelContent(window.panel);
            initializePanelEvents();
        };
    }
    
    const startCenarioBtn = document.getElementById('start-cenario');
    if (startCenarioBtn) {
        startCenarioBtn.onclick = () => {
            const cenarioName = document.getElementById('cenario-name')?.value?.trim();
            if (!cenarioName) {
                showFeedback('Por favor, informe o nome do Cenário.', 'error');
                return;
            }
            
            window.currentCenario = { name: cenarioName, interactions: [] };
            window.gherkinPanelState = 'gravando';
            window.isRecording = true;
            window.interactions = [];
            
            // Iniciar timer
            startTimer();
            
            // Adiciona automaticamente o step de navegação para a URL atual
            window.interactions.push({
                step: 'Given',
                acao: 'acessa_url',
                nomeElemento: window.location.href,
                timestamp: Date.now()
            });
            
            renderPanelContent(window.panel);
            initializePanelEvents();
        };
    }
    
    // Encerrar Cenário
    const endCenarioBtn = document.getElementById('end-cenario');
    if (endCenarioBtn) {
        endCenarioBtn.onclick = () => {
            window.isRecording = false;
            window.isPaused = false;
            
            // Salva o cenário na feature atual
            if (window.currentFeature && window.currentCenario) {
                // Ajusta o nome da propriedade para consistência
                if (!window.currentFeature.scenarios) {
                    window.currentFeature.scenarios = [];
                }
                
                // Garantir que o último step seja "Then" antes de salvar
                let interactions = [...window.interactions];
                if (interactions.length > 0) {
                    // Encontrar o último step que não é "Then"
                    let lastNonThenIndex = -1;
                    for (let i = interactions.length - 1; i >= 0; i--) {
                        if (interactions[i].step !== 'Then') {
                            lastNonThenIndex = i;
                            break;
                        }
                    }
                    
                    // Se o último step não for "Then", mudar para "Then"
                    if (lastNonThenIndex >= 0 && interactions[lastNonThenIndex].step !== 'Then') {
                        interactions[lastNonThenIndex] = {
                            ...interactions[lastNonThenIndex],
                            step: 'Then'
                        };
                    }
                }
                
                window.currentCenario.interactions = interactions;
                window.currentFeature.scenarios.push(window.currentCenario);
            }
            
            // Pergunta se deseja cadastrar novo cenário
            showModal('Deseja cadastrar um novo cenário?', () => {
                // SIM: volta para tela de nome do cenário
                window.currentCenario = null;
                window.interactions = [];
                window.gherkinPanelState = 'cenario';
                renderPanelContent(window.panel);
                initializePanelEvents();
            }, () => {
                // NÃO: habilita botão de finalizar feature
                const endFeatureBtn = document.getElementById('end-feature');
                if (endFeatureBtn) {
                    endFeatureBtn.disabled = false;
                    endFeatureBtn.style.backgroundColor = '#dc3545';
                }
                showFeedback('Cenário encerrado! Você pode finalizar a feature.', 'success');
            });
        };
    }
    
    // Encerrar Feature
    const endFeatureBtn = document.getElementById('end-feature');
    if (endFeatureBtn) {
        endFeatureBtn.onclick = () => {
            showModal('Deseja criar uma nova feature?', () => {
                // SIM: salva a feature atual e volta ao início
                if (window.currentFeature && window.currentFeature.scenarios && window.currentFeature.scenarios.length > 0) {
                    window.gherkinFeatures = window.gherkinFeatures || [];
                    window.gherkinFeatures.push(window.currentFeature);
                    showFeedback('Feature salva com sucesso!', 'success');
                } else {
                    showFeedback('Adicione pelo menos um cenário!', 'error');
                    return;
                }
                
                // Reset para nova feature
                window.currentFeature = null;
                window.currentCenario = null;
                window.interactions = [];
                window.gherkinPanelState = 'feature';
                renderPanelContent(window.panel);
                initializePanelEvents();
            }, () => {
                // NÃO: salva a feature atual e vai para tela de exportação
                if (window.currentFeature && window.currentFeature.scenarios && window.currentFeature.scenarios.length > 0) {
                    window.gherkinFeatures = window.gherkinFeatures || [];
                    window.gherkinFeatures.push(window.currentFeature);
                    showFeedback('Feature salva com sucesso!', 'success');
                } else {
                    showFeedback('Adicione pelo menos um cenário!', 'error');
                    return;
                }
                
                // Reset e vai para exportação
                window.currentFeature = null;
                window.currentCenario = null;
                window.interactions = [];
                window.gherkinPanelState = 'exportar';
                renderPanelContent(window.panel);
                initializePanelEvents();
            });
        };
    }
    
    // Exportar Selecionadas (na tela de exportação)
    const exportSelectedBtn = document.getElementById('export-selected');
    if (exportSelectedBtn) {
        exportSelectedBtn.onclick = () => {
            const form = document.getElementById('export-form');
            if (!form) {
                showFeedback('Formulário de exportação não encontrado!', 'error');
                return;
            }
            
            const selected = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value, 10));
            if (selected.length === 0) {
                showFeedback('Selecione ao menos uma feature!', 'error');
                return;
            }
            
            if (window.exportSelectedFeatures && typeof window.exportSelectedFeatures === 'function') {
                window.exportSelectedFeatures(selected);
            } else {
                showFeedback('Função de exportação não encontrada! Recarregue a página.', 'error');
            }
        };
    }
    
    // Botão Nova Feature (na tela de exportação)
    const newFeatureBtn = document.getElementById('new-feature');
    if (newFeatureBtn) {
        newFeatureBtn.onclick = () => {
            window.gherkinPanelState = 'feature';
            renderPanelContent(window.panel);
            initializePanelEvents();
        };
    }
    
    // Botão de Inspeção de Elementos
    const inspectBtn = document.getElementById('gherkin-inspect-toggle');
    if (inspectBtn) {
        inspectBtn.onclick = () => {
            window.toggleElementInspection();
        };
    }
    
    // Checkbox Forçar Clique
    const forceClickCheckbox = document.getElementById('gherkin-force-click');
    if (forceClickCheckbox) {
        forceClickCheckbox.onchange = () => {
            window.forceNextClick = forceClickCheckbox.checked;
            if (window.forceNextClick) {
                showFeedback('Próximo clique será forçado, ignorando filtros.', 'info');
            }
        };
    }
}

// Torna a função de inicialização de eventos disponível globalmente
window.initializePanelEvents = initializePanelEvents;

// Torna a função de exportação disponível globalmente
window.exportSelectedFeatures = exportSelectedFeatures;

// Mantém o Service Worker ativo
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'checkInjected') {
            sendResponse({ injected: true });
        } else if (message.action === 'recreatePanel') {
            initializeExtension();
            sendResponse({ success: true });
        }
        return true;
    });
}

// Inicializa a extensão
initializeExtension();

// ===== INSPEÇÃO DE ELEMENTOS =====

let inspectionOverlay = null;
let currentHighlightedElement = null;

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
    document.body.appendChild(inspectionOverlay);
    return inspectionOverlay;
}

function createElementHighlight() {
    const highlight = document.createElement('div');
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
    document.body.appendChild(highlight);
    return highlight;
}

function highlightElement(element) {
    if (!element || element.id === 'gherkin-panel' || element.closest('#gherkin-panel')) {
        return;
    }
    
    const highlight = document.getElementById('gherkin-element-highlight') || createElementHighlight();
    const rect = element.getBoundingClientRect();
    
    highlight.style.display = 'block';
    highlight.style.left = (rect.left + window.scrollX) + 'px';
    highlight.style.top = (rect.top + window.scrollY) + 'px';
    highlight.style.width = rect.width + 'px';
    highlight.style.height = rect.height + 'px';
    
    currentHighlightedElement = element;
}

function hideElementHighlight() {
    const highlight = document.getElementById('gherkin-element-highlight');
    if (highlight) {
        highlight.style.display = 'none';
    }
    currentHighlightedElement = null;
}

function showElementInspectionModal(element) {
    const { getCSSSelector, getRobustXPath } = window;
    
    // Gera seletores para o elemento
    const cssSelector = getCSSSelector(element);
    const xpathSelector = getRobustXPath(element);
    
    // Obtém informações do elemento
    const tagName = element.tagName.toLowerCase();
    const elementText = element.textContent?.trim().substring(0, 100) || '';
    const elementId = element.id || '';
    const elementClass = element.className || '';
    const elementType = element.type || '';
    
    const modal = document.createElement('div');
    modal.className = 'gherkin-modal';
    modal.innerHTML = `
        <div class="gherkin-modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
            <div class="gherkin-modal-header">
                <h3>Inspeção de Elemento</h3>
                <span class="gherkin-modal-close">&times;</span>
            </div>
            <div class="gherkin-modal-body">
                <h4>Informações do Elemento:</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr><td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Tag:</td><td style="padding: 5px; border: 1px solid #ddd;">${tagName}</td></tr>
                    ${elementId ? `<tr><td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">ID:</td><td style="padding: 5px; border: 1px solid #ddd;">${elementId}</td></tr>` : ''}
                    ${elementClass ? `<tr><td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Class:</td><td style="padding: 5px; border: 1px solid #ddd;">${elementClass}</td></tr>` : ''}
                    ${elementType ? `<tr><td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Type:</td><td style="padding: 5px; border: 1px solid #ddd;">${elementType}</td></tr>` : ''}
                    ${elementText ? `<tr><td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Texto:</td><td style="padding: 5px; border: 1px solid #ddd;">${elementText}</td></tr>` : ''}
                </table>
                
                <h4>Seletores Gerados:</h4>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">CSS Selector:</label>
                    <textarea readonly style="width: 100%; height: 60px; font-family: monospace; font-size: 12px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa;" onclick="this.select()">${cssSelector}</textarea>
                    <button class="gherkin-btn" onclick="navigator.clipboard.writeText('${cssSelector.replace(/'/g, "\\'")}'); this.textContent='Copiado!'; setTimeout(() => this.textContent='Copiar CSS', 2000)" style="margin-top: 5px; font-size: 12px; padding: 4px 8px;">Copiar CSS</button>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">XPath:</label>
                    <textarea readonly style="width: 100%; height: 60px; font-family: monospace; font-size: 12px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa;" onclick="this.select()">${xpathSelector}</textarea>
                    <button class="gherkin-btn" onclick="navigator.clipboard.writeText('${xpathSelector.replace(/'/g, "\\'")}'); this.textContent='Copiado!'; setTimeout(() => this.textContent='Copiar XPath', 2000)" style="margin-top: 5px; font-size: 12px; padding: 4px 8px;">Copiar XPath</button>
                </div>
                
                <div style="margin-top: 20px;">
                    <button class="gherkin-btn" onclick="window.testSelector('${cssSelector.replace(/'/g, "\\'")}', 'css')" style="margin-right: 10px;">Testar CSS</button>
                    <button class="gherkin-btn" onclick="window.testSelector('${xpathSelector.replace(/'/g, "\\'")}', 'xpath')" style="margin-right: 10px;">Testar XPath</button>
                    <button class="gherkin-btn gherkin-btn-secondary" onclick="window.toggleElementInspection()">Voltar à Inspeção</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listener para fechar o modal
    modal.querySelector('.gherkin-modal-close').addEventListener('click', () => {
        modal.remove();
        if (window.isInspecting) {
            toggleElementInspection();
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            if (window.isInspecting) {
                toggleElementInspection();
            }
        }
    });
}

function toggleElementInspection() {
    window.isInspecting = !window.isInspecting;
    
    const button = document.getElementById('gherkin-inspect-toggle');
    if (!button) return;
    
    if (window.isInspecting) {
        // Ativar modo de inspeção
        button.style.background = '#dc3545';
        button.innerHTML = '🔍 Parar Inspeção';
        button.title = 'Clique para desativar o modo de inspeção';
        
        // Criar overlay
        createInspectionOverlay();
        inspectionOverlay.style.display = 'block';
        
        // Adicionar event listeners para inspeção
        document.addEventListener('mouseover', handleInspectionMouseOver);
        document.addEventListener('click', handleInspectionClick, true);
        
        showFeedback('Modo de inspeção ativo. Clique em um elemento para ver seus seletores.', 'info');
    } else {
        // Desativar modo de inspeção
        button.style.background = '#17a2b8';
        button.innerHTML = '🔍 Inspecionar';
        button.title = 'Ativar/desativar modo de inspeção de elementos';
        
        // Remover overlay e highlights
        if (inspectionOverlay) {
            inspectionOverlay.style.display = 'none';
        }
        hideElementHighlight();
        
        // Remover event listeners
        document.removeEventListener('mouseover', handleInspectionMouseOver);
        document.removeEventListener('click', handleInspectionClick, true);
        
        showFeedback('Modo de inspeção desativado.', 'info');
    }
}

// Torna a função de inspeção disponível globalmente
window.toggleElementInspection = toggleElementInspection;

function handleInspectionMouseOver(event) {
    if (!window.isInspecting) return;
    
    const element = event.target;
    if (!element || element.id === 'gherkin-panel' || element.closest('#gherkin-panel') || 
        element.closest('.gherkin-modal') || element.id === 'gherkin-inspection-overlay' ||
        element.id === 'gherkin-element-highlight') {
        return;
    }
    
    highlightElement(element);
}

function handleInspectionClick(event) {
    if (!window.isInspecting) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    if (!element || element.id === 'gherkin-panel' || element.closest('#gherkin-panel') || 
        element.closest('.gherkin-modal') || element.id === 'gherkin-inspection-overlay' ||
        element.id === 'gherkin-element-highlight') {
        return;
    }
    
    // Desativar inspeção e mostrar modal
    window.isInspecting = false;
    const button = document.getElementById('gherkin-inspect-toggle');
    if (button) {
        button.style.background = '#17a2b8';
        button.innerHTML = '🔍 Inspecionar';
        button.title = 'Ativar/desativar modo de inspeção de elementos';
    }
    
    if (inspectionOverlay) {
        inspectionOverlay.style.display = 'none';
    }
    hideElementHighlight();
    
    document.removeEventListener('mouseover', handleInspectionMouseOver);
    document.removeEventListener('click', handleInspectionClick, true);
    
    // Mostrar modal com informações do elemento
    showElementInspectionModal(element);
}

// Função para atualizar a barra de status em tempo real
function updateStatusBar() {
    const statusElement = document.getElementById('gherkin-status');
    const timerElement = document.getElementById('gherkin-timer');
    const statusContainer = statusElement?.closest('.gherkin-status-bar');
    
    if (statusElement) {
        // Atualizar status
        const isPaused = window.isPaused;
        const statusDiv = statusElement.parentElement;
        
        statusElement.textContent = isPaused ? 'Pausado' : 'Gravando';
        statusDiv.style.background = isPaused ? '#fef3c7' : '#dcfce7';
        statusDiv.style.borderColor = isPaused ? '#f59e0b' : '#16a34a';
        statusElement.style.color = isPaused ? '#92400e' : '#166534';
        
        // Atualizar ícone
        const iconSpan = statusDiv.querySelector('span:first-child');
        if (iconSpan) {
            iconSpan.textContent = isPaused ? '⏸️' : '🎬';
        }
    }
    
    // Atualizar timer
    if (timerElement && window.elapsedSeconds !== undefined) {
        const minutes = Math.floor(window.elapsedSeconds / 60);
        const seconds = window.elapsedSeconds % 60;
        const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        window.gherkinTimerText = timeText;
        timerElement.textContent = timeText;
    }
    
    // Atualizar contador de ações
    const actionsCount = (window.interactions || []).length;
    const statusBar = document.querySelector('.gherkin-status-bar');
    if (statusBar) {
        // Procurar especificamente pelo elemento com title "Número de ações registradas"
        const counterElement = statusBar.querySelector('span[title="Número de ações registradas"]');
        if (counterElement) {
            counterElement.textContent = actionsCount.toString();
        }
        
        // Fallback: procurar por spans que contenham "ações"
        const actionsElements = statusBar.querySelectorAll('span');
        actionsElements.forEach(span => {
            if (span.textContent && span.textContent.includes('ações')) {
                span.textContent = `${actionsCount} ações`;
            }
        });
    }
}

// Função para iniciar o timer
function startTimer() {
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
    }
    
    window.elapsedSeconds = 0;
    window.timerInterval = setInterval(() => {
        if (!window.isPaused && window.isRecording) {
            window.elapsedSeconds++;
            updateStatusBar();
        }
    }, 1000);
}

// Função para parar o timer
function stopTimer() {
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
        window.timerInterval = null;
    }
}

// Função para atualizar contador de ações em tempo real
function updateActionsCounter() {
    const actionsCount = (window.interactions || []).length;
    const statusBar = document.querySelector('.gherkin-status-bar');
    if (statusBar) {
        // Procurar especificamente pelo elemento com title "Número de ações registradas"
        const counterElement = statusBar.querySelector('span[title="Número de ações registradas"]');
        if (counterElement) {
            counterElement.textContent = actionsCount.toString();
        }
        
        // Fallback: procurar por spans que contenham "ações"
        const counterElements = statusBar.querySelectorAll('span');
        counterElements.forEach(span => {
            if (span.textContent && span.textContent.includes('ações')) {
                span.textContent = `${actionsCount} ações`;
            }
        });
    }
}

// Tornar função disponível globalmente
window.updateActionsCounter = updateActionsCounter;
