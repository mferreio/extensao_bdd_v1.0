// Componente do painel principal
import { injectGherkinStyles } from './styles.js';
import { FormValidator } from './form-validation.js';
import { getStore } from '../state/store.js';
import { showEditModal, showLogDetailsModal, showXPathModal, showPostExportModal, showAddStepModal } from './modals.js';

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


    let html = '';
    html += `
        <div class="gherkin-panel-header">
            <h3>GERADOR DE TESTES AUTOMATIZADOS EM PYTHON</h3>
            <div class="button-container-top">
                <button id="gherkin-help" title="Ajuda / Manual" style="margin-right: 8px; width: auto; padding: 4px 12px; font-size: 12px; font-weight: bold; background-color: #e3f2fd; color: #0d47a1; border: 1px solid #90caf9; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                    Manual
                </button>
                <button id="gherkin-reopen" title="Reabrir" style="display: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#28a745" viewBox="0 0 24 24"><path d="M3 3h6v2H5v4H3V3zm6 16H3v-6h2v4h4v2zm8-16v6h-2V5h-4V3h6zm-2 16v-4h2v6h-6v-2h4z"/></svg>
                </button>
                <button id="gherkin-minimize" title="Minimizar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffc107" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
                </button>
                <button id="gherkin-close" title="Fechar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#dc3545" viewBox="0 0 24 24"><path d="M18.3 5.71L12 12l6.3 6.29-1.42 1.42L12 13.41l-6.29 6.3-1.42-1.42L10.59 12 4.29 5.71 5.71 4.29 12 10.59l6.29-6.3z"/></svg>
                </button>
            </div>
        </div>
    `;
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
        // Cálculo do tempo em XX:XX
        const minutes = Math.floor((elapsedSeconds || 0) / 60);
        const seconds = (elapsedSeconds || 0) % 60;
        const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        html += `
            <div class="gherkin-content gherkin-flex-col gherkin-p-sm gherkin-gap-none" style="flex:1; min-height:0;">
                <div class="gherkin-status-bar gherkin-flex-row gherkin-items-center gherkin-flex-wrap gherkin-gap-xs gherkin-mb-sm">
                    <div class="gherkin-badge ${isPaused ? 'gherkin-badge-warning' : 'gherkin-badge-primary'}">
                        <span>${isPaused ? '⏸️' : '🎬'}</span>
                        <span id="gherkin-status">${isPaused ? 'Pausado' : 'Gravando'}</span>
                    </div>
                    
                    <span class="gherkin-text-muted">|</span>
                    
                    <div class="gherkin-flex gherkin-items-center gherkin-gap-xs gherkin-flex-1" style="min-width:80px; max-width:140px;" title="Feature: ${currentFeature ? currentFeature.name : 'Nenhuma'}">
                        <span>📋</span>
                        <span class="gherkin-text-muted" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:0.75rem;">${currentFeature ? currentFeature.name : 'Nenhuma'}</span>
                    </div>
                    
                    <div class="gherkin-flex gherkin-items-center gherkin-gap-xs gherkin-flex-1" style="min-width:80px; max-width:140px;" title="Cenário: ${currentScenario ? currentScenario.name : 'Nenhum'}">
                        <span>🎯</span>
                        <span class="gherkin-text-muted" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:0.75rem;">${currentScenario ? currentScenario.name : 'Nenhum'}</span>
                    </div>
                    
                    <span class="gherkin-text-muted">|</span>
                    
                    <div class="gherkin-badge gherkin-badge-primary" style="background: transparent; border: 1px solid var(--border-color);">
                        <span>⏱️</span>
                        <span id="gherkin-timer" style="font-weight:600; min-width:35px;">${timeText}</span>
                    </div>
                    
                    <div class="gherkin-badge gherkin-badge-danger" style="background: transparent; border: 1px solid var(--border-color); color: var(--color-danger);">
                        <span>📊</span>
                        <span title="Número de ações registradas">${(interactions || []).length}</span>
                    </div>
                </div>

                <div class="gherkin-flex-row gherkin-items-center gherkin-gap-xs gherkin-mb-sm">
                    <div class="gherkin-flex gherkin-items-center gherkin-gap-xs">
                        <button id="gherkin-inspect-toggle" class="gherkin-btn ${state.isInspecting ? 'gherkin-btn-danger' : 'gherkin-btn-info'}" style="padding:2px 8px; font-size:0.75rem; height:28px; background-color: ${state.isInspecting ? '' : '#17a2b8'}; color: #fff;" title="Ativar/desativar modo de inspeção">
                            ${state.isInspecting ? '🔍 Parar' : '🔍 Inspecionar'}
                        </button>
                        <button id="gherkin-add-step" class="gherkin-btn gherkin-btn-success" style="padding:2px 8px; font-size:0.75rem; height:28px;" title="Adicionar passo manualmente">
                            ➕ Adicionar Passo
                        </button>
                    </div>
                </div>

                <div id="gherkin-log" class="gherkin-flex-1 gherkin-mb-md" style="min-height:80px; max-height:380px; overflow-x:hidden; overflow-y:auto; display:flex; flex-direction:column;"></div>
                
                <div class="gherkin-actions-bar gherkin-flex-col gherkin-gap-sm gherkin-mt-auto gherkin-w-full">
                    <!-- Botões principais de finalização -->
                    <div class="gherkin-flex-row gherkin-gap-sm gherkin-w-full">
                        <button id="end-cenario" class="gherkin-btn gherkin-btn-danger gherkin-flex-1 gherkin-text-center" style="height:40px; padding:10px;" title="Finalizar este cenário">
                            <span style="font-size:1.1em; margin-right:4px;">✓</span> Finalizar Cenário
                        </button>
                        <button id="end-feature" class="gherkin-btn gherkin-flex-1 gherkin-text-center" style="background:#6c757d; color:#fff; height:40px; padding:10px;" disabled title="Encerrar feature completa e exportar">
                            <span style="font-size:1.1em; margin-right:4px;">⏹</span> Finalizar Feature
                        </button>
                    </div>
                    <!-- Botões secundários de ações -->
                    <div class="gherkin-flex-row gherkin-gap-xs gherkin-w-full">
                        <button id="gherkin-pause" class="gherkin-btn gherkin-btn-warning gherkin-flex-1" style="height:36px; padding:8px;">
                            ${isPaused ? '▶ Continuar' : '⏸ Pausar'}
                        </button>
                        <button id="gherkin-clear" class="gherkin-btn gherkin-btn-danger gherkin-flex-1" style="height:36px; padding:8px;">
                            🗑 Limpar
                        </button>
                        <button id="gherkin-export" class="gherkin-btn gherkin-btn-main gherkin-flex-1" style="height:36px; padding:8px;">
                            📤 Exportar
                        </button>
                    </div>
                </div>
            </div >
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
    html += `<p id="gherkin-footer">By: Matheus Ferreira de Oliveira</p>`;
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

        // Renderizar logs se o container existir (estado 'gravando')
        if (panelState === 'gravando') {
            const logContainer = panel.querySelector('#gherkin-log');
            if (logContainer) {
                renderLogs(logContainer, interactions);
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

        if (selectedIndexes.length === 0) {
            alert('Selecione pelo menos uma feature para exportar.');
            return;
        }

        const featuresToExport = store.exportFeatures(selectedIndexes);

        try {
            // Import export bridge dynamically
            const { exportBridge } = await import('../export/export-bridge.js');
            const { showFeedback } = await import('../../utils.js');

            // Use exportBridge functionality
            const result = await exportBridge.exportWithEnhancements(featuresToExport, {
                useZip: useZip,
                includeMetadata: true,
                includeLogs: true
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

export function makePanelDraggable(panel) {
    let isDragging = false;
    let offsetX, offsetY;

    // Permite arrastar apenas pelo cabeçalho do painel
    let header = panel.querySelector('.gherkin-panel-header');
    if (!header) {
        // fallback para o seletor antigo, caso não tenha sido atualizado
        header = panel.querySelector('div[style*="display: flex"][style*="justify-content: space-between"]') || panel;
    }

    function onMouseDown(event) {
        // Só inicia o drag se for no header e não em botões
        if (event.target.closest('.button-container-top')) return;
        if (event.button !== 0) return; // Apenas botão esquerdo
        isDragging = true;
        offsetX = event.clientX - panel.getBoundingClientRect().left;
        offsetY = event.clientY - panel.getBoundingClientRect().top;
        panel.style.cursor = 'move';
        document.body.style.userSelect = 'none';
    }

    function onMouseMove(event) {
        if (!isDragging) return;
        panel.style.left = `${event.clientX - offsetX}px`;
        panel.style.top = `${event.clientY - offsetY}px`;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
    }

    function onMouseUp() {
        if (isDragging) {
            isDragging = false;
            panel.style.cursor = 'default';
            document.body.style.userSelect = '';
        }
    }

    // Remove listeners antigos para evitar impedir múltiplos binds
    // Verificação defensiva para evitar erro "removeEventListener is not a function"
    if (header && typeof header.removeEventListener === 'function') {
        try {
            header.removeEventListener('mousedown', onMouseDown);
        } catch (e) {
            console.warn('Erro ao remover listener mousedown:', e);
        }
        header.addEventListener('mousedown', onMouseDown);
    }

    if (document && typeof document.removeEventListener === 'function') {
        try {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        } catch (e) {
            console.warn('Erro ao remover listeners globais:', e);
        }
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
}

// Helper para renderizar logs
function renderLogs(container, interactions) {
    if (!container || !interactions) return;

    // ACTION_META local para exibição
    const ACTION_ICONS = {
        'clica': '🖱️',
        'altera': '✏️',
        'preenche': '📝',
        'seleciona': '📋',
        'radio': '🔘',
        'caixa': '☑️',
        'navega': '🧭',
        'login': '🔑',
        'upload': '📁',
        'acessa_url': '🌐'
    };

    container.innerHTML = interactions.map((interaction, index) => {
        const icon = ACTION_ICONS[interaction.acao] || (interaction.acao.startsWith('valida_') ? '✅' : (interaction.acao.startsWith('espera_') ? '⏳' : '🔹'));
        const label = interaction.acaoTexto || interaction.acao;
        const target = interaction.nomeElemento || interaction.selector || 'Elemento';
        const value = interaction.valorPreenchido ? `"${interaction.valorPreenchido}"` : '';
        const step = interaction.step || 'Then';

        // Estilo step badge
        let stepColor = '#17a2b8'; // Default And/Then
        if (step === 'Given') stepColor = '#28a745';
        if (step === 'When') stepColor = '#ffc107';

        return `
            <div data-index="${index}" class="gherkin-log-item gherkin-flex-row gherkin-items-center gherkin-p-xs" style="border-bottom: 1px solid #eee; font-size: 0.8rem; cursor: pointer;">
                <span class="gherkin-badge" style="background-color: ${stepColor}; padding: 2px 4px; font-size: 0.7em; margin-right: 6px; min-width: 35px; text-align: center;">${step}</span>
                <span style="font-size: 1.1em; margin-right: 6px;" title="${interaction.acao}">${icon}</span>
                <span class="gherkin-text-muted" style="margin-right: 4px; font-weight: 600;">${label}</span>
                <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-primary);" title="${target}">${target}</span>
                <span style="color: var(--text-secondary); font-style: italic; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${value}</span>
                <button class="gherkin-btn-icon remove-log" style="background: none; border: none; font-size: 1.1em; margin-left: 4px; cursor: pointer; color: #dc3545; opacity: 0.6;" title="Remover">×</button>
            </div>
            </div>
        `;
    }).join(''); // Ordem cronológica (sem reverse)

    // Auto-scroll para a última interação (a mais recente fica visível)
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 0);

    // Adicionar listeners para remoção e edição
    container.querySelectorAll('.remove-log').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.closest('.gherkin-log-item').dataset.index);
            const store = getStore();
            store.removeInteraction(index);
        });
    });

    // Helper para fechar menu de contexto
    const closeContextMenu = () => {
        const existingMenu = document.querySelector('.gherkin-context-menu');
        if (existingMenu) existingMenu.remove();
    };

    // Função para mostrar o menu de interações (Unificado)
    const showInteractionMenu = (e, interaction, index) => {
        e.preventDefault();
        e.stopPropagation(); // Impede propagação para evitar fechamento imediato
        closeContextMenu();

        const menu = document.createElement('div');
        menu.className = 'gherkin-context-menu';
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;

        // Opção Editar
        const editOption = document.createElement('div');
        editOption.className = 'gherkin-menu-item';
        editOption.innerHTML = '✏️ Editar';
        editOption.onclick = () => {
            showEditModal(index);
            closeContextMenu();
        };
        menu.appendChild(editOption);

        // Opção Ver Detalhes (XPath e outros)
        const xpathOption = document.createElement('div');
        xpathOption.className = 'gherkin-menu-item';
        xpathOption.innerHTML = '🔍 Ver XPath/Seletores';
        xpathOption.onclick = () => {
            showXPathModal(interaction.xpath, interaction.selector || interaction.cssSelector, interaction);
            closeContextMenu();
        };
        menu.appendChild(xpathOption);

        // Opção Ver Detalhes Completo
        const detailsOption = document.createElement('div');
        detailsOption.className = 'gherkin-menu-item';
        detailsOption.innerHTML = 'ℹ️ Detalhes do Log';
        detailsOption.onclick = () => {
            showLogDetailsModal(interaction);
            closeContextMenu();
        };
        menu.appendChild(detailsOption);

        // Separator
        const separator = document.createElement('div');
        separator.style.height = '1px';
        separator.style.backgroundColor = '#ddd';
        separator.style.margin = '4px 0';
        menu.appendChild(separator);

        // Opção Excluir
        const deleteOption = document.createElement('div');
        deleteOption.className = 'gherkin-menu-item danger';
        deleteOption.innerHTML = '🗑️ Excluir';
        deleteOption.onclick = () => {
            const store = getStore();
            store.removeInteraction(index);
            closeContextMenu();
        };
        menu.appendChild(deleteOption);

        document.body.appendChild(menu);

        // Ajustar posição se sair da tela
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${window.innerHeight - rect.height - 10}px`;
        }
    };

    // Fechar menu ao clicar em qualquer lugar
    document.addEventListener('click', closeContextMenu);

    container.querySelectorAll('.gherkin-log-item').forEach(item => {
        const index = parseInt(item.dataset.index);
        const interaction = interactions[index];

        // Click normal (Esquerdo) - Agora abre o menu também
        item.addEventListener('click', (e) => {
            if (e.target.closest('.remove-log')) return; // Ignora se clicou no botão X
            showInteractionMenu(e, interaction, index);
        });

        // Click Direito - Menu de Contexto
        // Click Direito - Mantém comportamento de abrir menu
        item.addEventListener('contextmenu', (e) => {
            showInteractionMenu(e, interaction, index);
        });
    });
}
