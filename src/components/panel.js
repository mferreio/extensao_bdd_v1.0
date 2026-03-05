// Componente do painel principal
import { injectGherkinStyles } from './styles.js';
import { FormValidator } from './form-validation.js';
import { getStore } from '../state/store.js';
import { showEditModal, showLogDetailsModal, showXPathModal, showPostExportModal, showAddStepModal, showScreenshotModal } from './modals.js';
import { renderToolbar, attachToolbarListeners } from './toolbar.js';
import { renderStepEditor, clearStepEditor } from './step-editor.js';
import { renderReplayProgress, attachReplayProgressListeners } from './replay-progress.js';
import { showPreExportValidation } from '../export/pre-export-validator.js';

export function createPanel() {
    const oldPanel = document.getElementById('gherkin-panel');
    if (oldPanel) oldPanel.remove();

    // Garantir que document.body existe
    if (!document.body) {
        console.error('document.body não disponível');
        return null;
    }

    const panel = document.createElement('div');
    panel.id = 'gherkin-panel';
    panel.className = 'gherkin-panel';
    // Estilos visuais movidos para styles.js (.gherkin-panel)
    panel.style.zIndex = '10000'; // Mantendo z-index inline para garantir sobreposição
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Painel Gherkin Generator');

    // Adicionar ao DOM ANTES de renderizar conteúdo
    document.body.appendChild(panel);

    // Agora renderizar conteúdo com certeza que está no DOM
    renderPanelContent(panel);

    return panel;
}

export function renderPanelContent(panel) {
    const store = getStore();
    const state = store.getState();
    const { panelState, isPaused, currentFeature, currentScenario, elapsedSeconds, interactions, features } = state;

    // Gerenciar classe wide (apenas no estado gravando)
    if (panelState !== 'gravando') {
        panel.classList.remove('gherkin-panel--wide');
    }

    // Gerenciar classe Ghost Mode (Pílula)
    if (state.isGhostMode) {
        panel.classList.add('gherkin-panel--ghost');
    } else {
        panel.classList.remove('gherkin-panel--ghost');
    }

    let html = '';
    // No estado gravando, a toolbar substitui o header padrão
    if (panelState !== 'gravando') {
    html += `
        <div class="gherkin-panel-header">
            <h3>GERADOR DE TESTES AUTOMATIZADOS EM PYTHON</h3>
            <div class="button-container-top">
                <button id="gherkin-help" title="Ajuda / Manual" style="margin-right: 12px; width: auto; padding: 6px 14px; font-size: 13px; font-weight: 500; background-color: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; cursor: pointer; transition: all 0.2s;">
                    Manual
                </button>
                <div style="display: flex; gap: 6px; margin-right: 12px; align-items: center;">
                    <button id="gherkin-undo" title="Desfazer (Voltar)" style="width: 30px; height: 30px; border: 1px solid rgba(255,255,255,0.3); background: ${store.historyIndex > 0 ? 'rgba(255,255,255,0.1)' : 'transparent'}; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; cursor: ${store.historyIndex > 0 ? 'pointer' : 'not-allowed'}; opacity: ${store.historyIndex > 0 ? '1' : '0.3'}; transition: all 0.2s;" ${store.historyIndex > 0 ? '' : 'disabled'}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                    </button>
                    <button id="gherkin-redo" title="Refazer (Avançar)" style="width: 30px; height: 30px; border: 1px solid rgba(255,255,255,0.3); background: ${store.historyIndex < store.history.length - 1 ? 'rgba(255,255,255,0.1)' : 'transparent'}; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; cursor: ${store.historyIndex < store.history.length - 1 ? 'pointer' : 'not-allowed'}; opacity: ${store.historyIndex < store.history.length - 1 ? '1' : '0.3'}; transition: all 0.2s;" ${store.historyIndex < store.history.length - 1 ? '' : 'disabled'}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                    </button>
                </div>
                <button id="gherkin-minimize" title="Minimizar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>
                </button>
                <button id="gherkin-close" title="Fechar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.71L12 12l6.3 6.29-1.42 1.42L12 13.41l-6.29 6.3-1.42-1.42L10.59 12 4.29 5.71 5.71 4.29 12 10.59l6.29-6.3z"/></svg>
                </button>
            </div>
        </div>
    `;
    } // end if (panelState !== 'gravando')
    if (panelState === 'feature') {
        html += `
            <div class="gherkin-content gherkin-decision-state">
                <div class="gherkin-w-full" style="max-width: 400px; text-align: center;">
                    <label for="feature-name" class="gherkin-label gherkin-text-left" style="font-size: 1rem;">Informe o nome da Feature:</label>
                    <div id="feature-name-container" class="gherkin-mb-md"></div>
                    <button id="start-feature" class="gherkin-btn gherkin-btn-main gherkin-w-full" style="padding: 12px; font-size: 1rem;">Iniciar Feature</button>
                </div>
            </div>
        `;
    } else if (panelState === 'cenario') {
        html += `
            <div class="gherkin-content gherkin-decision-state">
                <div class="gherkin-w-full" style="max-width: 400px; text-align: center;">
                    <label for="cenario-name" class="gherkin-label gherkin-text-left" style="font-size: 1rem;">Informe o nome do Cenário:</label>
                    <div id="cenario-name-container" class="gherkin-mb-md"></div>
                    <button id="start-cenario" class="gherkin-btn gherkin-btn-main gherkin-w-full" style="padding: 12px; font-size: 1rem;">Iniciar Cenário</button>
                </div>
            </div>
        `;
    } else if (panelState === 'gravando') {
        // No estado gravando, usamos layout wide
        panel.classList.add('gherkin-panel--wide');

        html += `
            <div id="gherkin-toolbar-container"></div>
            <div class="gherkin-recording-layout">
                <div class="gherkin-scenario-editor">
                    <div class="gherkin-scenario-editor__header">
                        <h4>Edição de Cenário</h4>
                        <div class="gherkin-scenario-editor__header-actions">
                            <button id="gherkin-inspect-toggle" title="${state.isInspecting ? 'Parar inspeção' : 'Inspecionar elemento'}">${state.isInspecting ? '🔍' : '🔎'}</button>
                            <button id="scenario-settings" title="Configurações">⚙</button>
                            <button id="scenario-import" title="Importar">⬇</button>
                        </div>
                    </div>
                    <div id="gherkin-step-list" class="gherkin-step-list"></div>
                    <div class="gherkin-scenario-editor__footer">
                        <button id="gherkin-add-step" class="gherkin-btn gherkin-btn-success" style="padding:4px 12px; font-size:0.82rem; height:30px;">+ Adicionar Passo</button>
                        <button id="gherkin-reorder" class="gherkin-btn" style="padding:4px 10px; font-size:0.82rem; height:30px; background:#6c757d; color:#fff;">↕ Reordenar</button>
                    </div>
                </div>
                <div id="gherkin-step-editor-container" class="gherkin-step-editor-container"></div>
            </div>
        `;
    } else if (panelState === 'cenario_finalizado') {
        // Estado de Decisão: Cenário Finalizado
        html += `
            <div class="gherkin-content gherkin-decision-state">
                <h4 class="gherkin-decision-title">Cenário Finalizado com Sucesso!</h4>
                <p class="gherkin-text-muted gherkin-mb-lg" style="font-size: 1.1rem;">Deseja cadastrar um <strong>novo cenário</strong> nesta feature?</p>
                
                <div class="gherkin-decision-actions">
                    <button id="decisao-novo-cenario-sim" class="gherkin-btn gherkin-btn-success gherkin-flex-1">
                        <span style="font-size: 1.2em;">+</span> Sim, Novo Cenário
                    </button>
                    <button id="decisao-novo-cenario-nao" class="gherkin-btn gherkin-btn-danger gherkin-flex-1" style="background-color: #6c757d; border-color: #6c757d;">
                        Não
                    </button>
                </div>
            </div>
        `;
    } else if (panelState === 'aguardando_finalizacao_feature') {
        const scenariosCount = (currentFeature && currentFeature.scenarios) ? currentFeature.scenarios.length : 0;

        html += `
            <div class="gherkin-content gherkin-decision-state">
                <h4 class="gherkin-h3" style="color: #007bff;">${currentFeature ? currentFeature.name : 'Feature Atual'}</h4>
                <p class="gherkin-text-muted gherkin-mb-lg">${scenariosCount} cenário(s) registrado(s).</p>
                
                <div class="gherkin-w-full" style="max-width: 300px;">
                    <button id="end-feature-confirm" class="gherkin-btn gherkin-btn-danger gherkin-w-full" style="padding: 12px; font-size: 1.1rem;">
                        ⏹ Finalizar Feature
                    </button>
                </div>
            </div>
         `;
    } else if (panelState === 'feature_finalizada') {
        // Estado de Decisão: Feature Finalizada
        html += `
            <div class="gherkin-content gherkin-decision-state">
                <h4 class="gherkin-decision-title">Feature Finalizada!</h4>
                <p class="gherkin-text-muted gherkin-mb-lg" style="font-size: 1.1rem;">Deseja cadastrar uma <strong>nova feature</strong>?</p>
                
                <div class="gherkin-decision-actions">
                    <button id="decisao-nova-feature-sim" class="gherkin-btn gherkin-btn-success gherkin-flex-1">
                        <span style="font-size: 1.2em;">+</span> Sim
                    </button>
                    <button id="decisao-nova-feature-nao" class="gherkin-btn gherkin-btn-main gherkin-flex-1">
                        Não, ir para Exportação
                    </button>
                </div>
            </div>
        `;
    } else if (panelState === 'exportar') {
        html += `<div class="gherkin-content gherkin-p-sm gherkin-flex-1">
            <h4 class="gherkin-h3">Selecione as features para exportar:</h4>
            <div class="gherkin-list-container">
                <form id="export-form">`;
        (features || []).forEach((feature, idx) => {
            html += `<div class="gherkin-list-item"><input type='checkbox' id='feature-export-${idx}' name='feature-export' value='${idx}' checked><label for='feature-export-${idx}' style='margin-left: 8px; cursor: pointer;'>${feature.name}</label></div>`;
        });
        html += `   </form>
            </div>
            
            <div class="gherkin-flex-col gherkin-gap-sm gherkin-mt-auto">
                <div class="gherkin-flex-col gherkin-gap-xs" style="margin-bottom: 8px;">
                    <label class="gherkin-label" style="font-size: 0.9em;">Linguagem de Exportação:</label>
                    <select id="export-language" class="gherkin-input">
                        <option value="python" selected>🐍 Python + Behave</option>
                        <option value="playwright">🎭 Node + Playwright</option>
                    </select>
                </div>
                
                <div class="gherkin-flex-col gherkin-gap-xs" style="margin-bottom: 12px;">
                    <label class="gherkin-label" style="display: flex; align-items: center; cursor: pointer; font-size: 0.9em;">
                        <input type="checkbox" id="export-global-performance" style="margin-right: 8px;">
                        Habilitar Performance Global (Todos os Cenários)
                    </label>
                </div>
                <button id="export-individual" class="gherkin-btn gherkin-btn-main gherkin-w-full" style="height: 38px;">
                    📄 Exportar Arquivos Individuais
                </button>
                <button id="export-zip" class="gherkin-btn gherkin-btn-success gherkin-w-full" style="height: 38px;">
                    📦 Exportar Projeto Completo (.zip)
                </button>
                <button id="export-excel" class="gherkin-btn gherkin-btn-excel gherkin-w-full" style="height: 38px;">
                    📊 Exportar Caderno de Testes (.xlsx)
                </button>
                <div class="gherkin-divider"></div>
                 <button id="new-feature" class="gherkin-btn gherkin-w-full" style="height: 32px; font-size: 0.9rem; background: #6c757d; color: white;">
                    + Nova Feature
                </button>
                <button id="delete-project" class="gherkin-btn gherkin-btn-danger gherkin-w-full" style="height: 32px; font-size: 0.9rem; margin-top: 5px;">
                    🗑 Excluir Projeto
                </button>
            </div>
        </div>`;
    }
    html += `
        <p id="gherkin-footer">
            Desenvolvido por <a href="https://www.linkedin.com/in/matheus-ferreira-57380271/" target="_blank" style="color: var(--color-primary-light); text-decoration: none;">Matheus Ferreira</a>
        </p>
    `;
    // Snapshot inputs states to preserve across re-renders (timer updates)
    const activeElement = document.activeElement;
    const activeId = activeElement ? activeElement.id : null;
    const selectionStart = activeElement && activeElement.selectionStart ? activeElement.selectionStart : null;
    const selectionEnd = activeElement && activeElement.selectionEnd ? activeElement.selectionEnd : null;

    const manualTargetVal = panel.querySelector('#manual-target') ? panel.querySelector('#manual-target').value : '';
    const manualValueVal = panel.querySelector('#manual-value') ? panel.querySelector('#manual-value').value : '';

    panel.innerHTML = html;

    // Restore input values
    const newManualTarget = panel.querySelector('#manual-target');
    if (newManualTarget) newManualTarget.value = manualTargetVal;

    const newManualValue = panel.querySelector('#manual-value');
    if (newManualValue) newManualValue.value = manualValueVal;

    // Restore focus
    if (activeId) {
        const el = panel.querySelector('#' + activeId);
        if (el) {
            el.focus();
            // Only restore selection for text inputs/textareas
            if (selectionStart !== null && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
                try {
                    el.setSelectionRange(selectionStart, selectionEnd);
                } catch (e) {
                    // Ignore errors for input types that don't support selection
                }
            }
        }
    }

    // Event listeners para os botões do painel
    const closeBtn = panel.querySelector('#gherkin-close');
    const minimizeBtn = panel.querySelector('#gherkin-minimize');
    const reopenBtn = panel.querySelector('#gherkin-reopen');
    const helpBtn = panel.querySelector('#gherkin-help');

    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            // Abre a página de ajuda em uma nova aba
            window.open(chrome.runtime.getURL('src/help.html'), '_blank');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            // Não remover elemento do DOM, apenas mudar visibilidade state
            // panel.remove();
            store.setState({ isRecording: false, isPaused: false, isVisible: false });
        });
    }

    const undoBtn = panel.querySelector('#gherkin-undo');
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            store.undo();
        });
    }

    const redoBtn = panel.querySelector('#gherkin-redo');
    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            store.redo();
        });
    }

    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            const content = panel.querySelector('.gherkin-content');
            const buttons = panel.querySelector('.button-container');
            if (content) content.style.display = 'none';
            if (buttons) buttons.style.display = 'none';
            minimizeBtn.style.display = 'none';
            if (reopenBtn) reopenBtn.style.display = 'block';
            panel.style.height = 'auto';
            panel.style.minHeight = 'auto';
        });
    }

    if (reopenBtn) {
        reopenBtn.addEventListener('click', () => {
            const content = panel.querySelector('.gherkin-content');
            const buttons = panel.querySelector('.button-container');
            if (content) content.style.display = 'flex';
            if (buttons) buttons.style.display = 'flex';
            minimizeBtn.style.display = 'block';
            reopenBtn.style.display = 'none';
            // Restaurar dimensões originais
            panel.style.height = 'min(700px, calc(100vh - 20px))';
            panel.style.minHeight = '';
        });
    }

    // Ativar funcionalidade de arrastar
    makePanelDraggable(panel);

    // Usar Promise.resolve().then() para executar DEPOIS que o DOM estiver completamente atualizado
    Promise.resolve().then(() => {
        // Verificar se o painel ainda existe
        if (!document.body.contains(panel)) return;

        // Renderizar componentes do layout de gravação
        if (panelState === 'gravando') {
            // Toolbar
            const toolbarContainer = panel.querySelector('#gherkin-toolbar-container');
            if (toolbarContainer) {
                renderToolbar(toolbarContainer);
                attachToolbarListeners(toolbarContainer);
            }

            // Step list (dentro do scenario editor)
            const stepListContainer = panel.querySelector('#gherkin-step-list');
            if (stepListContainer) {
                renderStepList(stepListContainer, interactions);
            }

            // Step editor sidebar (vazio por padrão)
            const stepEditorContainer = panel.querySelector('#gherkin-step-editor-container');
            if (stepEditorContainer) {
                clearStepEditor(stepEditorContainer);
            }


        }

        // Inicializar FormValidator para campos de entrada
        if (panelState === 'feature') {
            const featureContainer = panel.querySelector('#feature-name-container');
            if (featureContainer) {
                featureContainer.innerHTML = ''; // Limpar container antes de adicionar novo input
                const { container, input } = FormValidator.createValidatedInput({
                    id: 'feature-name',
                    placeholder: 'Ex: Login',
                    validate: (value) => value.trim().length > 0,
                    errorMessage: 'Nome da feature é obrigatório'
                });
                if (container && featureContainer) {
                    featureContainer.appendChild(container);
                }
            }
        } else if (panelState === 'cenario') {
            const cenarioContainer = panel.querySelector('#cenario-name-container');
            if (cenarioContainer) {
                cenarioContainer.innerHTML = ''; // Limpar container antes de adicionar novo input
                const { container, input } = FormValidator.createValidatedInput({
                    id: 'cenario-name',
                    placeholder: 'Ex: Login com sucesso',
                    validate: (value) => value.trim().length > 0,
                    errorMessage: 'Nome do cenário é obrigatório'
                });
                if (container && cenarioContainer) {
                    cenarioContainer.appendChild(container);
                }
            }
        }
    });

    // Attach functional listeners
    attachFunctionalListeners(panel, store);

}


function attachFunctionalListeners(panel, store) {
    const state = store.getState();

    // Start Feature
    const startFeatureBtn = panel.querySelector('#start-feature');
    if (startFeatureBtn) {
        startFeatureBtn.addEventListener('click', () => {
            const input = panel.querySelector('#feature-name');
            if (input && input.value.trim()) {
                store.startFeature(input.value.trim());
            } else {
                alert('Por favor, informe o nome da feature.');
            }
        });
    }

    // Start Scenario
    const startScenarioBtn = panel.querySelector('#start-cenario');
    if (startScenarioBtn) {
        startScenarioBtn.addEventListener('click', () => {
            const input = panel.querySelector('#cenario-name');
            if (input && input.value.trim()) {
                store.startScenario(input.value.trim());
            } else {
                alert('Por favor, informe o nome do cenário.');
            }
        });
    }

    // End Scenario
    const endScenarioBtn = panel.querySelector('#end-cenario');
    if (endScenarioBtn) {
        endScenarioBtn.addEventListener('click', () => {
            store.finishScenario();
        });
    }

    // End Feature
    const endFeatureBtn = panel.querySelector('#end-feature');
    if (endFeatureBtn) {
        // Habilita botão se houver cenários
        if (state.currentFeature && state.currentFeature.scenarios && state.currentFeature.scenarios.length > 0) {
            endFeatureBtn.disabled = false;
            endFeatureBtn.style.background = '#6c757d'; // Reset style logic if needed
            endFeatureBtn.addEventListener('click', () => {
                store.finishFeature();
            });
        }
    }

    // Controls
    const pauseBtn = panel.querySelector('#gherkin-pause');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            store.togglePause();
        });
    }

    const clearBtn = panel.querySelector('#gherkin-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar tudo?')) {
                store.clear();
            }
        });
    }


    // Inspect Toggle
    const inspectBtn = panel.querySelector('#gherkin-inspect-toggle');
    if (inspectBtn) {
        inspectBtn.addEventListener('click', () => {
            store.toggleInspect();
        });
    }

    // Add Step Button
    const addStepBtn = panel.querySelector('#gherkin-add-step');
    if (addStepBtn) {
        addStepBtn.addEventListener('click', () => {
            showAddStepModal();
        });
    }

    // Reorder Button Toggle
    const reorderBtn = panel.querySelector('#gherkin-reorder');
    if (reorderBtn) {
        reorderBtn.addEventListener('click', () => {
            const list = panel.querySelector('#gherkin-step-list');
            if (list) {
                list.classList.toggle('is-reordering');
                const isReordering = list.classList.contains('is-reordering');
                reorderBtn.style.background = isReordering ? 'var(--color-primary, #3b82f6)' : '#6c757d';
                reorderBtn.style.color = '#fff';
            }
        });
    }

    // Settings Button
    const settingsBtn = panel.querySelector('#scenario-settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // Se showScenarioSettingsModal não estiver importado no topo, podemos importar dinamicamente ou usar o que tem
            import('./modals.js').then(mod => {
                if(mod.showScenarioSettingsModal) mod.showScenarioSettingsModal(store);
            }).catch(e => console.warn('showScenarioSettingsModal not found', e));
        });
    }

    // Export actions
    const exportBtn = panel.querySelector('#gherkin-export'); // In recording view
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            // Se clicar em exportar durante a gravação, talvez finalizar feature?
            // Ou apenas mudar para tela de exportação se tiver dados?
            // Comportamento atual: Finalizar Feature é o caminho normal.
            // Esse botão pode ser um atalho para 'Ver Features' ou similar.
            // Vou assumir que ele força a ida para tela de exportação se houver features.
            if (state.features && state.features.length > 0) {
                store.setState({ panelState: 'exportar' });
            } else if (state.currentFeature) {
                if (confirm('Isso irá finalizar a feature atual. Continuar?')) {
                    store.finishFeature();
                }
            } else {
                alert('Não há dados para exportar.');
            }
        });
    }

    /**
     * Handlers para os novos estados de decisão
     */

    // Decisão: Novo Cenário?
    const btnNovoCenarioSim = panel.querySelector('#decisao-novo-cenario-sim');
    if (btnNovoCenarioSim) {
        btnNovoCenarioSim.addEventListener('click', () => {
            store.confirmNewScenario();
        });
    }

    const btnNovoCenarioNao = panel.querySelector('#decisao-novo-cenario-nao');
    if (btnNovoCenarioNao) {
        btnNovoCenarioNao.addEventListener('click', () => {
            store.stopFeatureCreation();
        });
    }

    // Botão de Finalizar Feature (no estado aguardando_finalizacao_feature)
    const btnEndFeatureConfirm = panel.querySelector('#end-feature-confirm');
    if (btnEndFeatureConfirm) {
        btnEndFeatureConfirm.addEventListener('click', () => {
            store.finishFeature();
        });
    }

    // Add Manual Step Listener
    const btnAddManualStep = panel.querySelector('#add-manual-step-btn');
    if (btnAddManualStep) {
        btnAddManualStep.addEventListener('click', () => {
            createManualStepModal(store);
        });
    }

    // Decisão: Nova Feature?
    const btnNovaFeatureSim = panel.querySelector('#decisao-nova-feature-sim');
    if (btnNovaFeatureSim) {
        btnNovaFeatureSim.addEventListener('click', () => {
            store.confirmNewFeature();
        });
    }

    const btnNovaFeatureNao = panel.querySelector('#decisao-nova-feature-nao');
    if (btnNovaFeatureNao) {
        btnNovaFeatureNao.addEventListener('click', () => {
            store.goToExport();
        });
    }

    // Export Screen Actions (New Buttons)
    const handleExport = async (useZip) => {
        const checkboxes = panel.querySelectorAll('input[name="feature-export"]:checked');
        const selectedIndexes = Array.from(checkboxes).map(cb => parseInt(cb.value));
        const languageSelect = panel.querySelector('#export-language');
        const exportLanguage = languageSelect ? languageSelect.value : 'python';

        if (selectedIndexes.length === 0) {
            alert('Selecione pelo menos uma feature para exportar.');
            return;
        }

        const isGlobalPerformanceEnabled = panel.querySelector('#export-global-performance') ? panel.querySelector('#export-global-performance').checked : false;

        const featuresToExport = store.exportFeatures(selectedIndexes);

        // Validação de completude pré-export
        const canProceed = await showPreExportValidation(featuresToExport);
        if (!canProceed) return;

        try {
            // Import export bridge dynamically
            const { exportBridge } = await import('../export/export-bridge.js');
            const { showFeedback } = await import('../../utils.js');

            const result = await exportBridge.exportWithEnhancements(featuresToExport, {
                useZip: useZip,
                includeMetadata: true,
                includeLogs: true,
                language: exportLanguage,
                globalLighthouse: false, // Legado
                globalPerformance: isGlobalPerformanceEnabled,
                preferredSelector: store.getState().preferredSelector || 'best'
            });

            if (result) {
                // showFeedback(`${featuresToExport.length} feature(s) exportada(s)${useZip ? ' como ZIP' : ''} !`, 'success');
                showPostExportModal(
                    () => { // Encerrar
                        const panel = document.getElementById('gherkin-panel');
                        if (panel) panel.remove();
                        store.clear();
                        store.setState({ isVisible: false });
                    },
                    () => { // Continuar
                        showFeedback('Projeto exportado! Você pode continuar editando.', 'success');
                    }
                );
            }
        } catch (err) {
            console.error(err);
            alert('Erro na exportação: ' + err.message);
        }
    };

    const exportIndividualBtn = panel.querySelector('#export-individual');
    if (exportIndividualBtn) {
        exportIndividualBtn.addEventListener('click', () => handleExport(false));
    }

    const exportZipBtn = panel.querySelector('#export-zip');
    if (exportZipBtn) {
        exportZipBtn.addEventListener('click', () => handleExport(true));
    }

    // Export Excel - Caderno de Testes
    const exportExcelBtn = panel.querySelector('#export-excel');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', async () => {
            const checkboxes = panel.querySelectorAll('input[name="feature-export"]:checked');
            const selectedIndexes = Array.from(checkboxes).map(cb => parseInt(cb.value));

            if (selectedIndexes.length === 0) {
                alert('Selecione pelo menos uma feature para exportar.');
                return;
            }

            const featuresToExport = store.exportFeatures(selectedIndexes);

            try {
                const { getExcelGenerator } = await import('../export/excel-generator.js');
                const { showFeedback } = await import('../../utils.js');

                const excelGenerator = getExcelGenerator();
                excelGenerator.download(featuresToExport, 'caderno_de_testes');

                showFeedback('📊 Caderno de Testes exportado com sucesso!', 'success');
            } catch (err) {
                console.error('Erro ao exportar Excel:', err);
                alert('Erro ao exportar Excel: ' + err.message);
            }
        });
    }

    const newFeatureBtn = panel.querySelector('#new-feature');
    if (newFeatureBtn) {
        newFeatureBtn.addEventListener('click', () => {
            store.setState({ panelState: 'feature', currentFeature: null });
        });
    }

    const deleteProjectBtn = panel.querySelector('#delete-project');
    if (deleteProjectBtn) {
        deleteProjectBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir todo o projeto? Isso apagará todas as features e cenários e não poderá ser desfeito.')) {
                store.clear();
            }
        });
    }
}

// Escopo global para handlers para permitir remoção garantida
let _activeDragHandler = null;
let _activeMoveHandler = null;
let _activeUpHandler = null;

export function makePanelDraggable(panel) {
    let isDragging = false;
    let offsetX, offsetY;

    // Remove handlers antigos globais se existirem para evitar "fantasmas"
    if (_activeDragHandler) panel.removeEventListener('mousedown', _activeDragHandler);
    if (_activeMoveHandler) document.removeEventListener('mousemove', _activeMoveHandler);
    if (_activeUpHandler) document.removeEventListener('mouseup', _activeUpHandler);

    function onMouseDown(event) {
        // Usa delegação de eventos: Verifica dinamicamente se o clique foi na área de Header/Toolbar
        const isHeaderClick = event.target.closest('.gherkin-toolbar') || event.target.closest('.gherkin-panel-header') || event.target.closest('.gherkin-toolbar-header');
        
        // Se o painel estiver minimizado e clicarmos em qualquer lugar nele que não seja botões, permitimos o drag
        const isMinimized = panel.classList.contains('gherkin-panel--minimized');
        
        // Elementos interativos onde o drag NO DEVE iniciar
        const isButton = event.target.closest('.button-container-top') || event.target.closest('.gherkin-toolbar-btn') || event.target.closest('.gherkin-step-editor__close') || event.target.closest('button');

        if (!isHeaderClick && !isMinimized) return; // Se não for header nem minimizado, ignora
        if (isButton) return; 
        if (event.button !== 0) return; // Apenas botão esquerdo

        isDragging = true;
        
        const rect = panel.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        
        panel.style.cursor = 'move';
        document.body.style.userSelect = 'none';
        
        // Bloqueia a propagação para evitar que o HTML Drag&Drop nativo e outros scripts iniciem acidentalmente
        if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
            event.preventDefault();
        }
    }

    function onMouseMove(event) {
        if (!isDragging) return;
        panel.style.left = `${event.clientX - offsetX}px`;
        panel.style.top = `${event.clientY - offsetY}px`;
        panel.style.right = 'auto'; // Remove ancoragem direita (se houver) para evitar conflitos
        panel.style.bottom = 'auto';
    }

    function onMouseUp() {
        if (isDragging) {
            isDragging = false;
            panel.style.cursor = 'default';
            document.body.style.userSelect = '';
        }
    }

    _activeDragHandler = onMouseDown;
    _activeMoveHandler = onMouseMove;
    _activeUpHandler = onMouseUp;

    panel.addEventListener('mousedown', _activeDragHandler);
    document.addEventListener('mousemove', _activeMoveHandler);
    document.addEventListener('mouseup', _activeUpHandler);
}

// Helper para renderizar logs
/**
 * Renderiza a lista de passos no formato de cards coloridos (novo layout)
 */
function renderStepList(container, interactions) {
    if (!container || !interactions) return;

    const store = getStore();
    const state = store.getState();
    const { isReplaying, replayStepIndex, replayStatus } = state;

    const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    container.innerHTML = interactions.map((interaction, index) => {
        const step = (interaction.step || 'Then').toLowerCase();
        const stepLabel = interaction.step || 'Then';
        const label = interaction.acaoTexto || interaction.acao;
        const target = interaction.nomeElemento || interaction.selector || 'Elemento';
        const value = interaction.valorPreenchido ? ` "${escapeHtml(interaction.valorPreenchido)}"` : '';

        const screenshotNode = interaction.screenshot ? `
            <div class="step-thumbnail" style="margin-top: 6px; cursor: pointer; display: inline-block;">
                <img src="${interaction.screenshot}" style="height: 32px; border-radius: 4px; border: 1px solid var(--border-color);" title="Clique para ampliar" class="step-screenshot-img" />
            </div>
        ` : '';

        let replayClass = '';
        if (isReplaying) {
            if (index < replayStepIndex) replayClass = ' is-success';
            else if (index === replayStepIndex) {
                replayClass = replayStatus === 'error' ? ' is-error' : ' is-playing';
            }
        }

        return `
            <div data-index="${index}" class="gherkin-step-item gherkin-step-item--${step}${replayClass}" ${!isReplaying ? 'draggable="true"' : ''}>
                <div class="gherkin-step-item__header">
                    <div class="gherkin-step-item__title">
                        <span class="gherkin-step-item__keyword">${stepLabel}</span>
                        <span class="gherkin-step-item__text">
                            ${escapeHtml(label)} <em>${escapeHtml(target)}</em>${value}
                        </span>
                    </div>
                    ${screenshotNode}
                </div>
                ${!isReplaying ? `<div class="gherkin-step-item__actions">
                    <button class="step-up reorder-only" title="Mover para cima">🔼</button>
                    <button class="step-down reorder-only" title="Mover para baixo">🔽</button>
                    <button class="step-edit default-only" title="Editar">✏️</button>
                    <button class="step-xpath default-only" title="Ver XPath">🔍</button>
                    <button class="step-details default-only" title="Detalhes">ℹ️</button>
                    <button class="step-delete danger default-only" title="Excluir">🗑️</button>
                </div>` : ''}
            </div>
        `;
    }).join('');

    // Prepend replay progress bar
    const progressHtml = renderReplayProgress(state);
    if (progressHtml) {
        container.insertAdjacentHTML('afterbegin', progressHtml);
        attachReplayProgressListeners(container);
    }

    // Auto-scroll: durante replay, acompanha o passo ativo
    setTimeout(() => {
        if (isReplaying) {
            const activeStep = container.querySelector('.gherkin-step-item.is-playing');
            if (activeStep) activeStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            container.scrollTop = container.scrollHeight;
        }
    }, 0);

    // Attach listeners

    container.querySelectorAll('.gherkin-step-item').forEach(item => {
        const index = parseInt(item.dataset.index);
        const interaction = interactions[index];
        if (!interaction) return;

        // Native Drag and Drop Logic
        if (!isReplaying) {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', index.toString());
                setTimeout(() => item.classList.add('is-dragging'), 0);
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('is-dragging');
                container.querySelectorAll('.gherkin-step-item').forEach(el => {
                    el.classList.remove('drag-over-top', 'drag-over-bottom');
                });
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                const rect = item.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                
                if (e.clientY < midpoint) {
                    item.classList.add('drag-over-top');
                    item.classList.remove('drag-over-bottom');
                } else {
                    item.classList.add('drag-over-bottom');
                    item.classList.remove('drag-over-top');
                }
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over-top', 'drag-over-bottom');
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over-top', 'drag-over-bottom');
                
                const fromIndexStr = e.dataTransfer.getData('text/plain');
                if (!fromIndexStr) return;
                
                const fromIndex = parseInt(fromIndexStr);
                const targetIndex = index;
                
                if (fromIndex === targetIndex) return;
                
                const rect = item.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                const dropAfter = e.clientY > midpoint;
                
                let finalIndex = targetIndex;
                if (dropAfter) finalIndex++;
                
                if (fromIndex < finalIndex) {
                    finalIndex--;
                }
                
                if (fromIndex !== finalIndex) {
                    store.moveInteraction(fromIndex, finalIndex);
                }
            });
        }

        // Click no card -> abrir step editor sidebar
        item.addEventListener('click', (e) => {
            if (e.target.closest('.gherkin-step-item__actions')) return;

            // Marcar como selecionado
            container.querySelectorAll('.gherkin-step-item').forEach(el => el.classList.remove('gherkin-step-item--selected'));
            item.classList.add('gherkin-step-item--selected');

            // Renderizar step editor
            const editorContainer = document.querySelector('#gherkin-step-editor-container');
            if (editorContainer) {
                renderStepEditor(editorContainer, interaction, index);
            }

            // Renderizar element details
            const detailsContainer = document.querySelector('#gherkin-element-details-container');
            if (detailsContainer) {
                renderElementDetails(detailsContainer, interaction);
            }
        });

        // Right-click -> context menu (manter compatibilidade)
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showContextMenu(e, interaction, index);
        });

        // Botão editar
        const editBtn = item.querySelector('.step-edit');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showEditModal(index);
            });
        }

        // Botão XPath
        const xpathBtn = item.querySelector('.step-xpath');
        if (xpathBtn) {
            xpathBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showXPathModal(interaction.xpath, interaction.selector || interaction.cssSelector, interaction);
            });
        }

        // Botão detalhes
        const detailsBtn = item.querySelector('.step-details');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showLogDetailsModal(interaction);
            });
        }

        // Botão excluir
        const deleteBtn = item.querySelector('.step-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                store.removeInteraction(index);
            });
        }
        
        // Botões Reorder (Up/Down)
        const upBtn = item.querySelector('.step-up');
        if (upBtn) {
            upBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (index > 0) store.moveInteraction(index, index - 1);
            });
        }
        const downBtn = item.querySelector('.step-down');
        if (downBtn) {
            downBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (index < interactions.length - 1) store.moveInteraction(index, index + 1);
            });
        }

        // Thumbnail Click
        const thumbnailBtn = item.querySelector('.step-thumbnail');
        if (thumbnailBtn) {
            thumbnailBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showScreenshotModal(interaction.screenshot, interaction.nomeElemento);
            });
        }
    });
}

/**
 * Menu de contexto (mantido para compatibilidade com right-click)
 */
function showContextMenu(e, interaction, index) {
    // Fechar menus existentes
    const existingMenu = document.querySelector('.gherkin-context-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.className = 'gherkin-context-menu';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    const items = [
        { icon: '✏️', label: 'Editar', action: () => showEditModal(index) },
        { icon: '🔍', label: 'Ver XPath/Seletores', action: () => showXPathModal(interaction.xpath, interaction.selector || interaction.cssSelector, interaction) },
        { icon: 'ℹ️', label: 'Detalhes do Log', action: () => showLogDetailsModal(interaction) },
        { separator: true },
        { icon: '🗑️', label: 'Excluir', danger: true, action: () => getStore().removeInteraction(index) }
    ];

    items.forEach(cfg => {
        if (cfg.separator) {
            const sep = document.createElement('div');
            sep.style.cssText = 'height:1px;background:#ddd;margin:4px 0;';
            menu.appendChild(sep);
            return;
        }
        const opt = document.createElement('div');
        opt.className = `gherkin-menu-item${cfg.danger ? ' danger' : ''}`;
        opt.innerHTML = `${cfg.icon} ${cfg.label}`;
        opt.onclick = () => { cfg.action(); menu.remove(); };
        menu.appendChild(opt);
    });

    document.body.appendChild(menu);

    // Ajustar posição
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = `${window.innerWidth - rect.width - 10}px`;
    if (rect.bottom > window.innerHeight) menu.style.top = `${window.innerHeight - rect.height - 10}px`;

    // Fechar ao clicar fora
    const closeHandler = () => { menu.remove(); document.removeEventListener('click', closeHandler); };
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
}

/** 
 * Mantida para compatibilidade com chamadas existentes
 */
function renderLogs(container, interactions) {
    renderStepList(container, interactions);
}

// Modal para Adicionar Passo Manual
function createManualStepModal(store, initialData = {}) {
    // Remove existing modal if any
    const existing = document.getElementById('gherkin-manual-modal');
    if (existing) existing.remove();

    const currentUrl = window.location.href;
    const defaultAction = initialData.acao || 'clica';

    const modal = document.createElement('div');
    modal.id = 'gherkin-manual-modal';
    modal.className = 'gherkin-modal-bg';

    // HTML Estrutura Base
    modal.innerHTML = `
        <div class="gherkin-modal-content" style="max-width: 450px;">
            <h3 class="gherkin-h3 gherkin-mb-md">Adicionar Passo Manual</h3>
            
            <div class="gherkin-mb-sm">
                <label class="gherkin-label">Ação:</label>
                <select id="manual-modal-action" class="gherkin-input">
                    <option value="clica">Clicar</option>
                    <option value="preenche">Preencher</option>
                    <option value="seleciona">Selecionar</option>
                    <option value="acessa_url">Acessar URL</option>
                    <option value="espera_segundos">Esperar (segundos)</option>
                    <option value="valida_existe">Validar que existe</option>
                    <option value="valida_contem">Validar texto</option>
                    <option value="performance_audit">⚡ Auditar Performance</option>
                </select>
            </div>

            <div id="manual-modal-dynamic-fields">
                <!-- Campos dinâmicos serão inseridos aqui -->
            </div>

            <div class="gherkin-flex-row gherkin-gap-sm gherkin-mt-auto">
                <button id="manual-modal-cancel" class="gherkin-btn gherkin-btn-danger gherkin-flex-1">Cancelar</button>
                <button id="manual-modal-save" class="gherkin-btn gherkin-btn-success gherkin-flex-1">Adicionar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const actionSelect = modal.querySelector('#manual-modal-action');
    const dynamicContainer = modal.querySelector('#manual-modal-dynamic-fields');
    const saveBtn = modal.querySelector('#manual-modal-save');
    const cancelBtn = modal.querySelector('#manual-modal-cancel');

    // Estado local do modal para manter dados enquanto troca de ação
    let modalState = {
        selector: initialData.selector || '',
        value: initialData.value || '',
        timeout: '5'
    };

    // Função para renderizar campos baseados na ação
    const renderFields = (action) => {
        let html = '';

        if (['clica', 'preenche', 'seleciona', 'valida_existe', 'valida_contem'].includes(action)) {
            // Campos de Seletor com botão de inspeção
            html += `
                <div class="gherkin-mb-sm">
                    <label class="gherkin-label">Seletor / Elemento:</label>
                    <div class="gherkin-flex-row gherkin-gap-xs">
                        <input type="text" id="manual-modal-target" class="gherkin-input" value="${modalState.selector}" placeholder="Ex: #id ou .class">
                        <button id="manual-modal-inspect" class="gherkin-btn gherkin-btn-warning" title="Inspecionar na página">🔍</button>
                    </div>
                </div>
            `;
        }

        if (['preenche', 'seleciona', 'valida_contem'].includes(action)) {
            html += `
                <div class="gherkin-mb-lg">
                    <label class="gherkin-label">Valor / Texto:</label>
                    <input type="text" id="manual-modal-value" class="gherkin-input" value="${modalState.value}" placeholder="Texto para preencher/validar">
                </div>
            `;
        }

        if (action === 'acessa_url') {
            html += `
                <div class="gherkin-mb-lg">
                    <label class="gherkin-label">URL:</label>
                    <div class="gherkin-flex-row gherkin-gap-xs">
                        <input type="text" id="manual-modal-url" class="gherkin-input" value="${modalState.value || currentUrl}" placeholder="https://...">
                        <button id="manual-modal-capture-url" class="gherkin-btn gherkin-btn-warning" title="Capturar URL atual">🔗</button>
                    </div>
                </div>
            `;
        }

        if (action === 'espera_segundos') {
            html += `
                <div class="gherkin-mb-lg">
                    <label class="gherkin-label">Segundos:</label>
                    <input type="number" id="manual-modal-seconds" class="gherkin-input" value="${modalState.timeout}" min="1" max="60">
                </div>
            `;
        }

        if (action === 'performance_audit') {
            html += `
                <div class="gherkin-mb-lg">
                    <label class="gherkin-label">⚡ Nota mínima de Performance (Lighthouse):</label>
                    <input type="number" id="manual-modal-perf-threshold" class="gherkin-input" value="90" min="0" max="100" placeholder="90">
                    <small style="color: #888; display: block; margin-top: 4px;">O teste falhará se a nota do Lighthouse for inferior a este valor.</small>
                </div>
            `;
        }

        dynamicContainer.innerHTML = html;
        setupDynamicListeners(action);
    };

    // Configurar listeners dos campos dinâmicos
    const setupDynamicListeners = (action) => {
        const targetInput = modal.querySelector('#manual-modal-target');
        const valueInput = modal.querySelector('#manual-modal-value');
        const urlInput = modal.querySelector('#manual-modal-url');
        const secondsInput = modal.querySelector('#manual-modal-seconds');
        const inspectBtn = modal.querySelector('#manual-modal-inspect');
        const captureUrlBtn = modal.querySelector('#manual-modal-capture-url');

        // Atualizar estado local ao digitar
        if (targetInput) targetInput.addEventListener('input', (e) => modalState.selector = e.target.value);
        if (valueInput) valueInput.addEventListener('input', (e) => modalState.value = e.target.value);
        if (urlInput) urlInput.addEventListener('input', (e) => modalState.value = e.target.value);
        if (secondsInput) secondsInput.addEventListener('input', (e) => modalState.timeout = e.target.value);

        // Botão Inspecionar
        if (inspectBtn) {
            inspectBtn.addEventListener('click', () => {
                // Salvar estado atual e iniciar inspeção
                modal.remove(); // Remove modal temporariamente
                store.startManualInspection();

                // O store vai gerenciar o retorno. Precisamos de um listener temporário no store?
                // Ou o createManualStepModal será rechamado?
                // Melhor abordagem: subscribe no store para quando inspection terminar.
                const unsubscribe = store.subscribe((newState, oldState) => {
                    if (oldState.isInspecting && !newState.isInspecting && newState.manualInspectionResult) {
                        unsubscribe(); // Remove listener
                        // Reabre modal com os dados capturados
                        createManualStepModal(store, {
                            acao: action,
                            selector: newState.manualInspectionResult.selector,
                            value: modalState.value, // Mantém valor anterior
                            tagName: newState.manualInspectionResult.tagName
                        });
                    }
                });
            });
        }

        // Botão Capturar URL
        if (captureUrlBtn) {
            captureUrlBtn.addEventListener('click', () => {
                if (urlInput) {
                    urlInput.value = window.location.href;
                    modalState.value = window.location.href;
                }
            });
        }
    };

    // Inicialização
    actionSelect.value = defaultAction;
    renderFields(defaultAction);

    // Mudança de ação
    actionSelect.addEventListener('change', (e) => {
        const newAction = e.target.value;
        renderFields(newAction);
    });

    // Cancelar
    cancelBtn.addEventListener('click', () => {
        modal.remove();
    });

    // Salvar
    saveBtn.addEventListener('click', () => {
        const action = actionSelect.value;
        let interaction = {
            acao: action,
            timestamp: Date.now()
        };

        if (action === 'espera_segundos') {
            const seconds = modalState.timeout || '5';
            interaction.valorPreenchido = seconds;
            interaction.step = 'When';
            interaction.nomeElemento = `esperar ${seconds}s`;
        } else if (action === 'acessa_url') {
            const url = modalState.value || currentUrl;
            interaction.url = url;
            interaction.valorPreenchido = url;
            interaction.step = 'Given';
            interaction.nomeElemento = 'página';
        } else if (action === 'performance_audit') {
            const thresholdEl = modal.querySelector('#manual-modal-perf-threshold');
            const threshold = thresholdEl ? parseInt(thresholdEl.value) || 90 : 90;
            interaction.step = 'Then';
            interaction.nomeElemento = 'performance';
            interaction.acaoTexto = '⚡ Auditar Performance (Lighthouse)';
            interaction.valorPreenchido = String(threshold);
            interaction.performanceCheck = { enabled: true, threshold: threshold };
        } else {
            // Ações de elemento
            if (!modalState.selector) {
                alert('Informe o Seletor do elemento.');
                return;
            }

            interaction.selector = modalState.selector;
            interaction.nomeElemento = modalState.selector;
            interaction.valorPreenchido = modalState.value;
            interaction.step = action.startsWith('valida_') ? 'Then' : 'When';

            // Simple inference
            if (interaction.selector.startsWith('/') || interaction.selector.startsWith('(')) {
                interaction.xpath = interaction.selector;
            } else {
                interaction.cssSelector = interaction.selector;
            }
        }

        store.addInteraction(interaction);
        modal.remove();
    });
}
