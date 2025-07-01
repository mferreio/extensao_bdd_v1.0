// Componente do painel principal
import { injectGherkinStyles } from './styles.js';

export function createPanel() {
    const oldPanel = document.getElementById('gherkin-panel');
    if (oldPanel) oldPanel.remove();
    const panel = document.createElement('div');
    panel.id = 'gherkin-panel';
    panel.className = 'gherkin-panel';
    panel.style.position = 'fixed';
    panel.style.top = '10px';
    panel.style.left = '10px';
    panel.style.width = 'min(480px, calc(100vw - 20px))';
    panel.style.maxWidth = '480px';
    panel.style.minWidth = '320px';
    panel.style.height = 'min(700px, calc(100vh - 20px))';
    panel.style.maxHeight = 'calc(100vh - 20px)';
    panel.style.background = '#ffffff';
    panel.style.border = '1px solid #ccc';
    panel.style.borderRadius = '12px';
    panel.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
    panel.style.padding = '10px';
    panel.style.zIndex = '10000';
    panel.style.fontFamily = 'Roboto, Arial, sans-serif';
    panel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Painel Gherkin Generator');
    renderPanelContent(panel);
    document.body.appendChild(panel);
    return panel;
}

export function renderPanelContent(panel) {
    let html = '';
    html += `
        <div class="gherkin-panel-header">
            <h3>GERADOR DE TESTES AUTOMATIZADOS EM PYTHON</h3>
            <div class="button-container-top">
                <button id="gherkin-reopen" title="Reabrir" style="display: none;">Abrir</button>
                <button id="gherkin-minimize" title="Minimizar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffc107" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
                </button>
                <button id="gherkin-close" title="Fechar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#dc3545" viewBox="0 0 24 24"><path d="M18.3 5.71L12 12l6.3 6.29-1.42 1.42L12 13.41l-6.29 6.3-1.42-1.42L10.59 12 4.29 5.71 5.71 4.29 12 10.59l6.29-6.3z"/></svg>
                </button>
            </div>
        </div>
    `;
    if (window.gherkinPanelState === 'feature') {
        html += `
            <div class="gherkin-content" style="align-items: center; justify-content: center; flex: 1; gap: 20px; padding: 40px 20px;">
                <div style="text-align: center; width: 100%; max-width: 400px;">
                    <label for="feature-name" style="display: block; margin-bottom: 12px; font-size: 16px; font-weight: 600; color: #333;">Informe o nome da Feature:</label>
                    <input id="feature-name" type="text" placeholder="Ex: Login" style="width: 100%; padding: 12px 16px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; margin-bottom: 20px; box-sizing: border-box;" />
                    <button id="start-feature" class="gherkin-btn gherkin-btn-main" style="width: 100%; padding: 12px 20px; font-size: 16px; font-weight: 600; border-radius: 8px;">Iniciar Feature</button>
                </div>
            </div>
        `;
    } else if (window.gherkinPanelState === 'cenario') {
        html += `
            <div class="gherkin-content" style="align-items: center; justify-content: center; flex: 1; gap: 20px; padding: 40px 20px;">
                <div style="text-align: center; width: 100%; max-width: 400px;">
                    <label for="cenario-name" style="display: block; margin-bottom: 12px; font-size: 16px; font-weight: 600; color: #333;">Informe o nome do Cenário:</label>
                    <input id="cenario-name" type="text" placeholder="Ex: Login com sucesso" style="width: 100%; padding: 12px 16px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; margin-bottom: 20px; box-sizing: border-box;" />
                    <button id="start-cenario" class="gherkin-btn gherkin-btn-main" style="width: 100%; padding: 12px 20px; font-size: 16px; font-weight: 600; border-radius: 8px;">Iniciar Cenário</button>
                </div>
            </div>
        `;
    } else if (window.gherkinPanelState === 'gravando') {
        html += `
            <div class="gherkin-content gherkin-content-flex" style="flex:1; min-height:0; display:flex; flex-direction:column; gap:0; padding:12px;">
                <div class="gherkin-status-bar" style="display:flex; align-items:center; gap:8px; font-size:0.85rem; background:#f7faff; border-radius:6px; padding:8px 10px; margin-bottom:8px; min-height:auto; flex-wrap:wrap;">
                    <span id="gherkin-status" style="color:#555; font-weight:500; white-space:nowrap;">${window.isPaused ? 'Status: Pausado' : 'Status: Gravando'}</span>
                    <span style="color:#0D47A1; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px;" title="${window.currentFeature ? window.currentFeature.name : ''}">${window.currentFeature ? 'Feature: ' + window.currentFeature.name : ''}</span>
                    <span style="color:#0070f3; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px;" title="${window.currentCenario ? window.currentCenario.name : ''}">${window.currentCenario ? 'Cenário: ' + window.currentCenario.name : ''}</span>
                    <span id="gherkin-timer" style="margin-left:auto; color:#555; white-space:nowrap;">${window.elapsedSeconds !== undefined ? 'Tempo: ' + (window.gherkinTimerText || '00:00') : ''}</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px; flex-wrap:wrap;">
                    <label for="gherkin-action-select" style="margin:0; font-size:0.9rem; white-space:nowrap;">Ação:</label>
                    <select id="gherkin-action-select" style="flex:1; min-width:100px; max-width:180px; font-size:0.85rem; padding:4px;">
                        <optgroup label="Ações">
                            <option value="clica">Clicar</option>
                            <option value="altera">Alterar</option>
                            <option value="preenche">Preencher</option>
                            <option value="seleciona">Selecionar</option>
                            <option value="radio">Botão de rádio</option>
                            <option value="caixa">Caixa de seleção</option>
                            <option value="navega">Navegar</option>
                            <option value="login">Login</option>
                            <option value="upload">Upload de arquivo</option>
                        </optgroup>
                        <optgroup label="Validações">
                            <option value="valida_existe">Validar que existe</option>
                            <option value="valida_nao_existe">Validar que não existe</option>
                            <option value="valida_contem">Validar que contém</option>
                            <option value="valida_nao_contem">Validar que não contém</option>
                            <option value="valida_deve_ser">Validar que deve ser</option>
                            <option value="valida_nao_deve_ser">Validar que não deve ser</option>
                        </optgroup>
                        <optgroup label="Esperas">
                            <option value="espera_segundos">Esperar segundos</option>
                            <option value="espera_elemento">Esperar elemento aparecer</option>
                            <option value="espera_nao_existe">Esperar elemento desaparecer</option>
                            <option value="espera_existe">Esperar que o elemento exista</option>
                            <option value="espera_habilitado">Esperar que o elemento esteja habilitado</option>
                            <option value="espera_desabilitado">Esperar que o elemento esteja desabilitado</option>
                        </optgroup>
                    </select>
                    <div id="gherkin-action-params" style="flex:1.5; min-width:80px;"></div>
                </div>
                <div id="gherkin-log" style="flex:1 1 0; min-height:100px; margin-bottom:8px; border:1px solid #ccc; border-radius:6px; background-color:#f9f9f9; display:flex; flex-direction:column; overflow:hidden;"></div>
                <div class="gherkin-actions-bar" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:auto; justify-content:center; align-items:center; width:100%; padding-top:4px;">
                    <button id="end-cenario" class="gherkin-btn gherkin-btn-danger" style="flex:1; min-width:70px; max-width:90px; height:32px; font-size:0.85rem; padding:6px 8px;">Encerrar Cenário</button>
                    <button id="end-feature" class="gherkin-btn" style="background:#6c757d; color:#fff; flex:1; min-width:70px; max-width:90px; height:32px; font-size:0.85rem; padding:6px 8px;" disabled>Encerrar Feature</button>
                    <button id="gherkin-pause" class="gherkin-btn gherkin-btn-warning" style="flex:1; min-width:60px; max-width:70px; height:32px; font-size:0.85rem; padding:6px 8px;">Pausar</button>
                    <button id="gherkin-clear" class="gherkin-btn gherkin-btn-danger" style="flex:1; min-width:60px; max-width:70px; height:32px; font-size:0.85rem; padding:6px 8px;">Limpar</button>
                    <button id="gherkin-export" class="gherkin-btn gherkin-btn-main" style="flex:1; min-width:70px; max-width:80px; height:32px; font-size:0.85rem; padding:6px 8px;">Exportar</button>
                </div>
            </div>
        `;
    } else if (window.gherkinPanelState === 'exportar') {
        html += `<div class="gherkin-content" style="padding: 10px; flex:1;">
            <h4 style="color: #0D47A1; font-size: 1.13rem; font-weight: 700; margin-bottom: 8px;">Selecione as features para exportar:</h4>
            <form id="export-form" style="max-height: 250px; overflow-y: auto; margin-bottom: 10px;">`;
        window.gherkinFeatures.forEach((feature, idx) => {
            html += `<div style='margin-bottom: 6px;'><input type='checkbox' id='feature-export-${idx}' name='feature-export' value='${idx}'><label for='feature-export-${idx}' style='margin-left: 8px;'>${feature.name}</label></div>`;
        });
        html += `</form>
            <div style="display: flex; gap: 10px; margin-top: 2px;">
                <button id="export-selected" class="gherkin-btn gherkin-btn-main" style="flex: 1; height: 32px; font-size: 0.96rem;">Exportar Selecionadas</button>
                <button id="new-feature" class="gherkin-btn gherkin-btn-success" style="flex: 1; height: 32px; font-size: 0.96rem;">Nova Feature</button>
            </div>
        </div>`;
    }
    html += `<p id="gherkin-footer">By: Matheus Ferreira de Oliveira</p>`;
    panel.innerHTML = html;
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

    // Remove listeners antigos para evitar múltiplos binds
    header.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    header.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}
