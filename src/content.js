// Arquivo principal da extensão - Content Script refatorado
import { injectGherkinStyles } from './components/styles.js';
import { createPanel, renderPanelContent, makePanelDraggable } from './components/panel.js';
import { renderLogWithActions } from './components/log.js';
import { showModal, showEditModal, showXPathModal, showLogDetailsModal } from './components/modals.js';
import { handleClickEvent, handleInputEvent } from './events/capture.js';
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
    document.removeEventListener('input', handleInputEvent, true);
    document.removeEventListener('click', handleClickEvent, false);
    document.removeEventListener('input', handleInputEvent, false);
    
    // Adiciona novos listeners apenas uma vez
    if (!window.gherkinEventListenersAdded) {
        document.addEventListener('click', handleClickEvent, true);
        document.addEventListener('input', handleInputEvent, true);
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
}

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
