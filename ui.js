import { showFeedback } from './utils.js';
import { getConfig } from './config.js';

// Injeção dinâmica de todos os estilos do sistema (inclui variáveis, responsividade, dark mode, animações, etc.)
(function injectGherkinStyles() {
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
  width: 480px;
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
}
.gherkin-panel-header h3 {
  margin: 0; font-size: 1rem; font-weight: 600;
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
.gherkin-btn:hover { filter: brightness(1.1); }
.gherkin-status-bar { background:#f7faff; border-radius: var(--border-radius); padding: 8px 12px; }
#gherkin-log { border-radius: var(--border-radius); padding: 8px; background:#f9f9f9; }
`;
    document.head.appendChild(style);
})();




// Modal para upload de arquivo de exemplo
function showUploadModal(nomeElemento, cssSelector, xpath, callback) {
    // Remove modal antigo se existir
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.25)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '10003';
    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.gap = '18px';
    modal.style.minWidth = '260px';
    modalBg.className = 'gherkin-modal-bg';
    modal.className = 'gherkin-modal-content';
    // Título
    const title = document.createElement('div');
    title.textContent = 'Upload de arquivo de exemplo';
    title.style.fontSize = '17px';
    title.style.color = '#0D47A1';
    title.style.textAlign = 'center';
    modal.appendChild(title);
    // Nome do arquivo
    const fileLabel = document.createElement('label');
    fileLabel.textContent = 'Nome do arquivo de exemplo:';
    fileLabel.style.fontWeight = 'bold';
    fileLabel.style.marginBottom = '4px';
    modal.appendChild(fileLabel);
    const fileInput = document.createElement('input');
    fileInput.type = 'text';
    fileInput.placeholder = 'exemplo.pdf, imagem.png, etc.';
    fileInput.style.width = '100%';
    fileInput.style.padding = '7px';
    fileInput.style.borderRadius = '5px';
    fileInput.style.border = '1px solid #ccc';
    fileInput.style.fontSize = '14px';
    fileInput.value = '';
    modal.appendChild(fileInput);
    // Botões
    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '18px';
    btns.style.marginTop = '12px';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Salvar';
    saveBtn.style.background = '#007bff';
    saveBtn.style.color = '#fff';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '6px';
    saveBtn.style.padding = '8px 22px';
    saveBtn.style.fontSize = '15px';
    saveBtn.style.fontWeight = 'bold';
    saveBtn.style.cursor = 'pointer';
    saveBtn.onclick = () => {
        const nomeArquivo = fileInput.value.trim();
        if (!nomeArquivo) {
            showFeedback('Informe o nome do arquivo!', 'error');
            return;
        }
        modalBg.remove();
        if (typeof callback === 'function') callback(nomeArquivo);
    };
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.background = '#dc3545';
    cancelBtn.style.color = '#fff';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '6px';
    cancelBtn.style.padding = '8px 22px';
    cancelBtn.style.fontSize = '15px';
    cancelBtn.style.fontWeight = 'bold';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = () => modalBg.remove();
    btns.appendChild(saveBtn);
    btns.appendChild(cancelBtn);
    modal.appendChild(btns);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}
// Função para criar o painel e renderizar o conteúdo inicial
function createPanel() {
    const oldPanel = document.getElementById('gherkin-panel');
    if (oldPanel) oldPanel.remove();
    const panel = document.createElement('div');
    panel.id = 'gherkin-panel';
    panel.className = 'gherkin-panel';
    panel.style.position = 'fixed';
    panel.style.top = '10px';
    panel.style.left = '10px';
    panel.style.width = '480px';
    panel.style.height = '700px';
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

// Função única para renderizar o conteúdo do painel conforme o estado
function renderPanelContent(panel) {
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
            <div class="gherkin-content" style="align-items: center; justify-content: center; flex: 1;">
                <label for="feature-name">Informe o nome da Feature:</label>
                <input id="feature-name" type="text" placeholder="Ex: Login" />
                <button id="start-feature" class="gherkin-btn gherkin-btn-main">Iniciar Feature</button>
            </div>
        `;
    } else if (window.gherkinPanelState === 'cenario') {
        html += `
            <div class="gherkin-content" style="align-items: center; justify-content: center; flex: 1;">
                <label for="cenario-name">Informe o nome do Cenário:</label>
                <input id="cenario-name" type="text" placeholder="Ex: Login com sucesso" />
                <button id="start-cenario" class="gherkin-btn gherkin-btn-main">Iniciar Cenário</button>
            </div>
        `;
    } else if (window.gherkinPanelState === 'gravando') {
        html += `
            <div class="gherkin-content gherkin-content-flex" style="flex:1; min-height:0; display:flex; flex-direction:column; gap:0;">
                <div class="gherkin-status-bar" style="display:flex; align-items:center; gap:12px; font-size:0.98rem; background:#f7faff; border-radius:6px; padding:6px 10px; margin-bottom:6px; min-height:36px;">
                    <span id="gherkin-status" style="color:#555; font-weight:500;">${window.isPaused ? 'Status: Pausado' : 'Status: Gravando'}</span>
                    <span style="color:#0D47A1; font-weight:600;">${window.currentFeature ? 'Feature: ' + window.currentFeature.name : ''}</span>
                    <span style="color:#0070f3; font-weight:600;">${window.currentCenario ? 'Cenário: ' + window.currentCenario.name : ''}</span>
                    <span id="gherkin-timer" style="margin-left:auto; color:#555;">${window.elapsedSeconds !== undefined ? 'Tempo: ' + (window.gherkinTimerText || '00:00') : ''}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                    <label for="gherkin-action-select" style="margin:0; font-size:0.98rem;">Ação:</label>
                    <select id="gherkin-action-select" style="flex:1; min-width:120px; max-width:220px;">
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
                    <div id="gherkin-action-params" style="flex:2;"></div>
                </div>
                <div id="gherkin-log" style="flex:1 1 0; min-height:0; margin-bottom:8px; border:1px solid #ccc; border-radius:8px; background-color:#f9f9f9; display:flex; flex-direction:column;"></div>
                <div class="gherkin-actions-bar" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:auto; justify-content:center; align-items:center; width:100%; padding-top:4px;">
                    <button id="end-cenario" class="gherkin-btn gherkin-btn-danger" style="min-width:90px; height:34px; font-size:0.98rem;">Encerrar Cenário</button>
                    <button id="end-feature" class="gherkin-btn" style="background:#6c757d; color:#fff; min-width:90px; height:34px; font-size:0.98rem;" disabled>Encerrar Feature</button>
                    <button id="gherkin-pause" class="gherkin-btn gherkin-btn-warning" style="min-width:90px; height:34px; font-size:0.98rem;">Pausar</button>
                    <button id="gherkin-clear" class="gherkin-btn gherkin-btn-danger" style="min-width:90px; height:34px; font-size:0.98rem;">Limpar</button>
                    <button id="gherkin-export" class="gherkin-btn gherkin-btn-main" style="min-width:90px; height:34px; font-size:0.98rem;">Exportar</button>
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
                <button id="export-selected" class="gherkin-btn gherkin-btn-main">Exportar Selecionadas</button>
                <button id="new-feature" class="gherkin-btn gherkin-btn-success">Nova Feature</button>
            </div>
        </div>`;
    }
    html += `<p id="gherkin-footer">By: Matheus Ferreira de Oliveira</p>`;
    panel.innerHTML = html;
}
// Modal para login
function showLoginModal() {
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.25)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '10003';
    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.gap = '18px';
    modal.style.minWidth = '260px';
    modalBg.className = 'gherkin-modal-bg';
    modal.className = 'gherkin-modal-content';
    const title = document.createElement('div');
    title.textContent = 'Marcar ação como Login';
    title.style.fontSize = '17px';
    title.style.color = '#0D47A1';
    title.style.textAlign = 'center';
    modal.appendChild(title);
    const userLabel = document.createElement('label');
    userLabel.textContent = 'Usuário/Email:';
    userLabel.style.fontWeight = 'bold';
    userLabel.style.marginBottom = '4px';
    modal.appendChild(userLabel);
    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.style.width = '100%';
    userInput.style.padding = '7px';
    userInput.style.borderRadius = '5px';
    userInput.style.border = '1px solid #ccc';
    userInput.style.fontSize = '14px';
    modal.appendChild(userInput);
    const passLabel = document.createElement('label');
    passLabel.textContent = 'Senha:';
    passLabel.style.fontWeight = 'bold';
    passLabel.style.marginBottom = '4px';
    modal.appendChild(passLabel);
    const passInput = document.createElement('input');
    passInput.type = 'password';
    passInput.style.width = '100%';
    passInput.style.padding = '7px';
    passInput.style.borderRadius = '5px';
    passInput.style.border = '1px solid #ccc';
    passInput.style.fontSize = '14px';
    modal.appendChild(passInput);
    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '18px';
    btns.style.marginTop = '12px';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Salvar Login';
    saveBtn.style.background = '#007bff';
    saveBtn.style.color = '#fff';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '6px';
    saveBtn.style.padding = '8px 22px';
    saveBtn.style.fontSize = '15px';
    saveBtn.style.fontWeight = 'bold';
    saveBtn.style.cursor = 'pointer';
    saveBtn.onclick = () => {
        const usuario = userInput.value.trim();
        const senha = passInput.value;
        if (!usuario || !senha) {
            showFeedback('Preencha usuário e senha!', 'error');
            return;
        }
        window.interactions.push({
            step: 'Given',
            acao: 'login',
            acaoTexto: 'Login',
            nomeElemento: usuario,
            valorPreenchido: senha,
            timestamp: Date.now()
        });
        saveInteractionsToStorage();
        renderLogWithActions();
        modalBg.remove();
        showFeedback('Ação de login registrada!', 'success');
    };
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.background = '#dc3545';
    cancelBtn.style.color = '#fff';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '6px';
    cancelBtn.style.padding = '8px 22px';
    cancelBtn.style.fontSize = '15px';
    cancelBtn.style.fontWeight = 'bold';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = () => modalBg.remove();
    btns.appendChild(saveBtn);
    btns.appendChild(cancelBtn);
    modal.appendChild(btns);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

// Adaptação dinâmica dos parâmetros de ação
function updateActionParams(panel) {
    // Seletores dos elementos
    const actionSelect = panel.querySelector('#gherkin-action-select');
    const paramsDiv = panel.querySelector('#gherkin-action-params');
    if (!actionSelect || !paramsDiv) return;

    // Dicas contextuais para cada ação
    const dicas = {
        'clica': 'Clique no elemento que deseja registrar o clique.',
        'altera': 'Clique no elemento que deseja alterar.',
        'preenche': 'Clique em um campo de texto e preencha. O valor será registrado automaticamente.',
        'seleciona': 'Clique no campo de seleção desejado.',
        'radio': 'Clique no botão de rádio desejado.',
        'caixa': 'Clique na caixa de seleção desejada.',
        'navega': 'Navegue para a página desejada.',
        'login': 'Preencha os campos de usuário/email e senha na página. Clique no botão abaixo para marcar como login.',
        'upload': 'Clique em um campo de upload na página ou informe o nome do arquivo de exemplo.',
        'valida_existe': 'Clique no elemento que deseja validar que existe.',
        'valida_nao_existe': 'Clique no elemento que deseja validar que não existe.',
        'valida_contem': 'Clique no elemento que deseja validar o conteúdo.',
        'valida_nao_contem': 'Clique no elemento que deseja validar que não contém determinado conteúdo.',
        'valida_deve_ser': 'Clique no elemento que deseja validar o valor.',
        'valida_nao_deve_ser': 'Clique no elemento que deseja validar que não deve ser determinado valor.',
        'espera_segundos': 'Informe o tempo de espera em segundos.',
        'espera_elemento': 'Clique no elemento que deseja aguardar aparecer.',
        'espera_nao_existe': 'Clique no elemento que deseja aguardar desaparecer.',
        'espera_existe': 'Clique no elemento que deseja aguardar que exista.',
        'espera_habilitado': 'Clique no elemento que deseja aguardar que esteja habilitado.',
        'espera_desabilitado': 'Clique no elemento que deseja aguardar que esteja desabilitado.'
    };

    paramsDiv.innerHTML = '';

    const dica = dicas[actionSelect.value] || '';
    if (dica) {
        const dicaDiv = document.createElement('div');
        dicaDiv.textContent = dica;
        dicaDiv.style.background = '#e3f2fd';
        dicaDiv.style.color = '#1565c0';
        dicaDiv.style.padding = '7px 10px';
        dicaDiv.style.borderRadius = '5px';
        dicaDiv.style.fontSize = '13px';
        dicaDiv.style.marginBottom = '8px';
        paramsDiv.appendChild(dicaDiv);
    }

    if (actionSelect.value === 'espera_segundos') {
        // Campo para segundos
        const label = document.createElement('label');
        label.textContent = 'Tempo de espera (segundos):';
        label.style.fontWeight = 'bold';
        label.style.marginBottom = '4px';
        label.setAttribute('for', 'gherkin-wait-seconds');
        paramsDiv.appendChild(label);
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'gherkin-wait-seconds';
        input.min = '1';
        input.value = '1';
        input.style.width = '100%';
        input.style.padding = '7px';
        input.style.borderRadius = '5px';
        input.style.border = '1px solid #ccc';
        input.style.fontSize = '14px';
        input.style.marginBottom = '8px';
        paramsDiv.appendChild(input);
    } else if (actionSelect.value === 'preenche') {
        // Feedback visual para o usuário saber que deve preencher um campo na página
        const info = document.createElement('div');
        info.textContent = 'Clique em um campo de texto na página e preencha. O valor será registrado automaticamente.';
        info.style.background = '#fffde7';
        info.style.color = '#bfa100';
        info.style.padding = '7px 10px';
        info.style.borderRadius = '5px';
        info.style.fontSize = '13px';
        info.style.marginBottom = '8px';
        paramsDiv.appendChild(info);
    } else if (actionSelect.value === 'login') {
        // Orientação para login
        const info = document.createElement('div');
        info.textContent = 'Preencha os campos de usuário/email e senha na página. Clique no botão abaixo para marcar como login.';
        info.style.background = '#e3f2fd';
        info.style.color = '#1565c0';
        info.style.padding = '7px 10px';
        info.style.borderRadius = '5px';
        info.style.fontSize = '13px';
        info.style.marginBottom = '8px';
        paramsDiv.appendChild(info);
        const btn = document.createElement('button');
        btn.textContent = 'Marcar ação como login';
        btn.style.background = '#007bff';
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.borderRadius = '6px';
        btn.style.padding = '8px 22px';
        btn.style.fontSize = '15px';
        btn.style.fontWeight = 'bold';
        btn.style.cursor = 'pointer';
        btn.onclick = () => {
            showLoginModal();
        };
        paramsDiv.appendChild(btn);
    } else if (actionSelect.value.startsWith('valida_')) {
        // Orientação para validação
        const info = document.createElement('div');
        info.textContent = 'Clique no elemento que deseja validar na página.';
        info.style.background = '#e8f5e9';
        info.style.color = '#388e3c';
        info.style.padding = '7px 10px';
        info.style.borderRadius = '5px';
        info.style.fontSize = '13px';
        info.style.marginBottom = '8px';
        paramsDiv.appendChild(info);
    } else if (actionSelect.value.startsWith('espera_') && actionSelect.value !== 'espera_segundos') {
        // Orientação para espera inteligente
        const info = document.createElement('div');
        if (actionSelect.value === 'espera_elemento') {
            info.textContent = 'Clique no elemento que deseja aguardar aparecer na página.';
        } else if (actionSelect.value === 'espera_nao_existe') {
            info.textContent = 'Clique no elemento que deseja aguardar desaparecer da página.';
        } else {
            info.textContent = 'Clique no elemento que deseja aguardar na página.';
        }
        info.style.background = '#fff3e0';
        info.style.color = '#e65100';
        info.style.padding = '7px 10px';
        info.style.borderRadius = '5px';
        info.style.fontSize = '13px';
        info.style.marginBottom = '8px';
        paramsDiv.appendChild(info);
    }
}

// Função para tornar o painel movível para qualquer lugar do navegador
function makePanelDraggable(panel) {
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

// Função utilitária para exibir modal de confirmação
function showModal(message, onYes, onNo) {
    // Remove modal antigo se existir
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.25)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '10001';

    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.gap = '18px';
    modal.style.minWidth = '260px';
    modalBg.className = 'gherkin-modal-bg';
    modal.className = 'gherkin-modal-content';

    const msg = document.createElement('div');
    msg.textContent = message;
    msg.style.fontSize = '17px';
    msg.style.color = '#0D47A1';
    msg.style.textAlign = 'center';
    modal.appendChild(msg);

    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '18px';

    const yesBtn = document.createElement('button');
    yesBtn.textContent = 'Sim';
    yesBtn.style.background = '#007bff';
    yesBtn.style.color = '#fff';
    yesBtn.style.border = 'none';
    yesBtn.style.background = '#007bff';
    yesBtn.style.color = '#fff';
    yesBtn.style.border = 'none';
    yesBtn.style.borderRadius = '6px';
    yesBtn.style.padding = '8px 22px';
    yesBtn.style.fontSize = '15px';
    yesBtn.style.fontWeight = 'bold';
    yesBtn.style.cursor = 'pointer';
    yesBtn.onclick = () => {
        modalBg.remove();
        if (onYes) onYes();
    };

    const noBtn = document.createElement('button');
    noBtn.textContent = 'Não';
    noBtn.style.background = '#dc3545';
    noBtn.style.color = '#fff';
    noBtn.style.border = 'none';
    noBtn.style.borderRadius = '6px';
    noBtn.style.padding = '8px 22px';
    noBtn.style.fontSize = '15px';
    noBtn.style.fontWeight = 'bold';
    noBtn.style.cursor = 'pointer';
    noBtn.onclick = () => {
        modalBg.remove();
        if (onNo) onNo();
    };

    btns.appendChild(yesBtn);
    btns.appendChild(noBtn);
    modal.appendChild(btns);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

// Ícones e cores para cada ação
const ACTION_META = {
    clica:      { icon: '🖱️', color: '#007bff', label: 'Clicar' },
    preenche:   { icon: '⌨️', color: '#28a745', label: 'Preencher' },
    seleciona:  { icon: '☑️', color: '#17a2b8', label: 'Selecionar' },
    upload:     { icon: '📎', color: '#f39c12', label: 'Upload' },
    login:      { icon: '🔑', color: '#8e44ad', label: 'Login' },
    espera_segundos: { icon: '⏲️', color: '#ffc107', label: 'Esperar' },
    espera_elemento: { icon: '⏳', color: '#0070f3', label: 'Esperar elemento' },
    espera_nao_existe: { icon: '🚫', color: '#e74c3c', label: 'Esperar sumir' },
    acessa_url: { icon: '🌐', color: '#0070f3', label: 'Acessar URL' },
    altera:     { icon: '✏️', color: '#6c757d', label: 'Alterar' },
    radio:      { icon: '🔘', color: '#6c757d', label: 'Radio' },
    caixa:      { icon: '☑️', color: '#6c757d', label: 'Caixa' },
    valida_existe: { icon: '✅', color: '#218838', label: 'Validar existe' },
    valida_nao_existe: { icon: '❌', color: '#e74c3c', label: 'Validar não existe' },
    valida_contem: { icon: '🔍', color: '#007bff', label: 'Validar contém' },
    valida_nao_contem: { icon: '🚫', color: '#e74c3c', label: 'Validar não contém' },
    valida_deve_ser: { icon: '✔️', color: '#218838', label: 'Validar deve ser' },
    valida_nao_deve_ser: { icon: '❌', color: '#e74c3c', label: 'Validar não deve ser' },
    // ...adicione outros conforme necessário
};

// Utilitário para exportação
function exportLog(format = 'csv') {
    const data = window.interactions || [];
    if (!data.length) {
        showFeedback('Nenhum log para exportar!', 'error');
        return;
    }
    let content = '';
    if (format === 'csv') {
        content = 'Gherkin,Ação,Elemento,Valor,Timestamp,Selector,XPath\n' +
            data.map(i =>
                [
                    i.step,
                    (ACTION_META[i.acao]?.label || i.acao),
                    `"${i.nomeElemento || ''}"`,
                    `"${i.valorPreenchido || i.nomeArquivo || ''}"`,
                    i.timestamp || '',
                    `"${i.cssSelector || ''}"`,
                    `"${i.xpath || ''}"`
                ].join(',')
            ).join('\n');
        downloadFile('gherkin_log.csv', content);
    } else if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        downloadFile('gherkin_log.json', content);
    } else if (format === 'md') {
        content = '| Gherkin | Ação | Elemento | Valor | Timestamp |\n|---|---|---|---|---|\n' +
            data.map(i =>
                `| ${i.step} | ${(ACTION_META[i.acao]?.label || i.acao)} | ${i.nomeElemento || ''} | ${i.valorPreenchido || i.nomeArquivo || ''} | ${i.timestamp || ''} |`
            ).join('\n');
        downloadFile('gherkin_log.md', content);
    }
    showFeedback('Log exportado com sucesso!');
}

    // Função para renderizar o log em formato de tabela (sem filtros)
function renderLogWithActions() {
    const log = document.getElementById('gherkin-log');
    if (!log) return;
    log.innerHTML = '';

    // Wrapper da tabela: ocupa todo o espaço disponível do log
    const tableWrap = document.createElement('div');
    tableWrap.style.flex = '1 1 auto';
    tableWrap.style.display = 'flex';
    tableWrap.style.flexDirection = 'column';
    tableWrap.style.overflow = 'hidden';
    tableWrap.style.width = '100%';
    tableWrap.style.minHeight = '0';
    tableWrap.style.background = '#fff';
    tableWrap.tabIndex = 0;

    // Container para rolagem da tabela
    const scrollContainer = document.createElement('div');
    scrollContainer.style.flex = '1 1 auto';
    scrollContainer.style.overflowX = 'auto';
    scrollContainer.style.overflowY = 'auto';
    scrollContainer.style.width = '100%';
    scrollContainer.style.minHeight = '0';
    scrollContainer.style.background = '#fff';

    // Tabela ocupa largura mínima para não cortar colunas e fica "fixa" dentro do scrollContainer
    const table = document.createElement('table');
    table.className = 'gherkin-log-table';
    table.style.width = '100%';
    table.style.minWidth = '700px';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '13px';
    table.style.background = '#fff';
    // Remover height 100% da tabela para não "esticar" a linha única
    // table.style.height = '100%';

    // Cabeçalho
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th style="min-width:60px;">Gherkin</th>
            <th style="min-width:80px;">Ação</th>
            <th style="min-width:120px;">Elemento</th>
            <th style="min-width:100px;">Valor</th>
        </tr>
    `;
    table.appendChild(thead);

    // Corpo da tabela
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    // Renderiza todas as interações (sem filtro)
    function renderRows() {
        tbody.innerHTML = '';
        const filtered = window.interactions || [];

        if (!filtered.length) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 4;
            td.textContent = 'Nenhuma interação encontrada.';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        filtered.forEach((i, idx) => {
            const tr = document.createElement('tr');
            tr.tabIndex = 0;
            tr.setAttribute('role', 'button');
            tr.setAttribute('aria-label', `Ver detalhes da interação ${idx + 1}`);
            tr.style.cursor = 'pointer';
            tr.style.transition = 'background 0.15s';
            tr.onmouseenter = () => tr.style.background = '#f7faff';
            tr.onmouseleave = () => tr.style.background = '';
            tr.onfocus = () => tr.style.background = '#e3f2fd';
            tr.onblur = () => tr.style.background = '';

            // Gherkin
            const tdStep = document.createElement('td');
            tdStep.textContent = i.step || '';
            tdStep.style.fontWeight = 'bold';
            tdStep.style.color = '#0070f3';
            tdStep.style.textAlign = 'center';
            tr.appendChild(tdStep);

            // Ação
            const tdAcao = document.createElement('td');
            const meta = ACTION_META[i.acao] || {};
            tdAcao.innerHTML = `<span style="font-size:1.2em;margin-right:4px;color:${meta.color || '#222'}">${meta.icon || ''}</span>${meta.label || i.acao}`;
            tr.appendChild(tdAcao);

            // Elemento
            const tdElem = document.createElement('td');
            // Exibe apenas o texto visível se estiver presente no nomeElemento (separado por |)
            if (i.nomeElemento && i.nomeElemento.includes('|')) {
                const partes = i.nomeElemento.split('|');
                // Mostra o texto do elemento (após o pipe)
                tdElem.textContent = partes[1].trim();
            } else {
                tdElem.textContent = i.nomeElemento || '';
            }
            tdElem.style.fontFamily = 'inherit';
            tr.appendChild(tdElem);

            // Valor preenchido (nova coluna)
            const tdValor = document.createElement('td');
            if (i.acao === 'preenche') {
                tdValor.textContent = i.valorPreenchido || '';
            } else if (i.acao === 'upload') {
                tdValor.textContent = i.nomeArquivo || '';
            } else if (i.acao === 'login') {
                tdValor.textContent = i.valorPreenchido || '';
            } else {
                tdValor.textContent = '';
            }
            tr.appendChild(tdValor);

            // Adiciona menu de contexto ao clicar com o botão direito
            tr.oncontextmenu = (e) => {
                e.preventDefault();
                const existingMenu = document.querySelector('.gherkin-context-menu');
                if (existingMenu) {
                    existingMenu.remove();
                }

                const menu = buildActionMenu(i, idx);
                menu.classList.add('gherkin-context-menu');
                menu.style.position = 'fixed';
                menu.style.top = `${e.clientY}px`;
                menu.style.left = `${e.clientX}px`;
                menu.style.zIndex = 10005; // Garante que o menu fique sobre outros elementos
                document.body.appendChild(menu);

                const closeMenu = (event) => {
                    if (!menu.contains(event.target)) {
                        menu.remove();
                        document.removeEventListener('click', closeMenu);
                        document.removeEventListener('contextmenu', closeMenu);
                    }
                };

                setTimeout(() => {
                    document.addEventListener('click', closeMenu);
                    document.addEventListener('contextmenu', closeMenu, { once: true });
                }, 0);
            };

            // Expansão por linha (teclado)
            tr.onclick = () => showLogDetailsModal(i);
            tr.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    showLogDetailsModal(i);
                    e.preventDefault();
                }
            };

            tbody.appendChild(tr);
        });
    }

    renderRows();
    scrollContainer.appendChild(table);
    tableWrap.appendChild(scrollContainer);
    log.appendChild(tableWrap);

    // Sempre rola para o final ao adicionar novo log
    setTimeout(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }, 0);

    // Estilo responsivo e barra de rolagem horizontal fixa e customizada
    if (!document.getElementById('gherkin-log-table-style')) {
        const style = document.createElement('style');
        style.id = 'gherkin-log-table-style';
    style.innerHTML = `
/* Container principal do painel de log */
#gherkin-log {
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
    min-height: 220px;
    background: #f9f9f9;
    padding: 0;
    margin: 0;
}
#gherkin-log > div {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    background: #fff;
}
#gherkin-log .gherkin-log-table-scroll {
    flex: 1 1 auto;
    overflow-x: auto;
    overflow-y: auto;
    min-height: 0;
    background: #fff;
    /* Barra de rolagem sempre visível */
    scrollbar-width: thin;
    scrollbar-color: #007bff #f9f9f9;
}
#gherkin-log .gherkin-log-table-scroll::-webkit-scrollbar {
    height: 12px;
    background: #f9f9f9;
}
#gherkin-log .gherkin-log-table-scroll::-webkit-scrollbar-thumb {
    background: #007bff;
    border-radius: 6px;
    min-width: 40px;
}
#gherkin-log .gherkin-log-table-scroll::-webkit-scrollbar-thumb:hover {
    background: #005bb5;
}
#gherkin-log .gherkin-log-table-scroll::-webkit-scrollbar-corner {
    background: #f9f9f9;
}
.gherkin-log-table th, .gherkin-log-table td {
    padding: 6px 8px;
    border-bottom: 1px solid #e0e6ed;
    text-align: left;
    background: #fff;
    white-space: nowrap;
    max-width: 340px;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 38px !important;
    min-height: 38px !important;
    line-height: 38px !important;
    vertical-align: middle !important;
}
.gherkin-log-table th {
    background: #f7faff;
    position: sticky;
    top: 0;
    z-index: 1;
}
.gherkin-log-table tr:focus {
    outline: 2px solid #1976d2;
    outline-offset: 1px;
}
.gherkin-log-table {
    width: 100%;
    min-width: 700px;
    background: #fff;
    /* height removido para evitar esticar a linha única */
}
@media (max-width: 900px) {
    .gherkin-log-table th, .gherkin-log-table td { font-size: 12px; }
    .gherkin-log-table { min-width: 520px; }
}
@media (max-width: 700px) {
    .gherkin-log-table th, .gherkin-log-table td { font-size: 11px; }
    .gherkin-log-table { min-width: 400px; }
}
`;
        document.head.appendChild(style);
    }

    // Adiciona eventos para os botões "Limpar" e "Pausar"
    setTimeout(() => {
        // Botão Limpar
        const clearBtn = document.getElementById('gherkin-clear');
        if (clearBtn) {
            clearBtn.disabled = false;
            clearBtn.style.opacity = '';
            clearBtn.onclick = () => {
                showModal('Deseja realmente limpar todas as interações deste cenário?', () => {
                    if (window.interactions) window.interactions.length = 0;
                    if (typeof saveInteractionsToStorage === 'function') saveInteractionsToStorage();
                    renderLogWithActions();
                });
            };
        }
        // Botão Pausar
        const pauseBtn = document.getElementById('gherkin-pause');
        if (pauseBtn) {
            pauseBtn.disabled = false;
            pauseBtn.style.opacity = '';
            pauseBtn.onclick = () => {
                window.isPaused = !window.isPaused;
                if (window.isPaused) {
                    pauseBtn.textContent = 'Continuar';
                    pauseBtn.style.backgroundColor = '#28a745';
                    const status = document.getElementById('gherkin-status');
                    if (status) status.textContent = 'Status: Pausado';
                    if (typeof stopTimer === 'function') stopTimer();
                } else {
                    pauseBtn.textContent = 'Pausar';
                    pauseBtn.style.backgroundColor = '#ffc107';
                    const status = document.getElementById('gherkin-status');
                    if (status) status.textContent = 'Status: Gravando';
                    if (typeof startTimer === 'function') startTimer();
                }
            };
        }

        // Botão Exportar (barra inferior)
        const exportBtn = document.getElementById('gherkin-export');
        if (exportBtn) {
            exportBtn.onclick = (e) => {
                e.stopPropagation();
                // Menu de formatos
                const menu = document.createElement('div');
                menu.style.position = 'absolute';
                menu.style.background = '#fff';
                menu.style.border = '1px solid #ccc';
                menu.style.borderRadius = '5px';
                menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
                menu.style.zIndex = '10010';
                // Calcula posição relativa ao botão
                const rect = exportBtn.getBoundingClientRect();
                menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
                menu.style.left = `${rect.left + window.scrollX}px`;
                menu.style.minWidth = '120px';
                menu.innerHTML = `
                    <button style="width:100%;border:none;background:none;padding:8px;cursor:pointer;text-align:left;" tabindex="0">CSV</button>
                    <button style="width:100%;border:none;background:none;padding:8px;cursor:pointer;text-align:left;" tabindex="0">Markdown</button>
                    <button style="width:100%;border:none;background:none;padding:8px;cursor:pointer;text-align:left;" tabindex="0">JSON</button>
                `;
                menu.children[0].onclick = () => { exportLog('csv'); menu.remove(); };
                menu.children[1].onclick = () => { exportLog('md'); menu.remove(); };
                menu.children[2].onclick = () => { exportLog('json'); menu.remove(); };
                document.body.appendChild(menu);
                // Fecha ao clicar fora
                setTimeout(() => {
                    document.addEventListener('click', function closeMenu(ev) {
                        if (!menu.contains(ev.target) && ev.target !== exportBtn) {
                            menu.remove();
                            document.removeEventListener('click', closeMenu);
                        }
                    });
                }, 0);
            };
        }
    }, 0);
}

// Modal de detalhes do log
function showLogDetailsModal(interaction) {
    // ...reaproveite o padrão dos outros modais...
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.25)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '10003';

    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'flex-start';
    modal.style.gap = '12px';
    modal.style.minWidth = '320px';
    modal.style.maxWidth = '96vw';
    modal.style.maxHeight = '80vh';
    modal.style.overflowY = 'auto';
    modalBg.className = 'gherkin-modal-bg';
    modal.className = 'gherkin-modal-content';

    const meta = ACTION_META[interaction.acao] || {};
    const title = document.createElement('div');
    title.innerHTML = `<span style="font-size:1.3em;color:${meta.color || '#222'}">${meta.icon || ''}</span> <b>${meta.label || interaction.acao}</b> (${interaction.step})`;
    title.style.fontSize = '17px';
    title.style.color = '#0D47A1';
    title.style.textAlign = 'left';
    modal.appendChild(title);

    const details = [
        ['Nome do elemento', interaction.nomeElemento || ''],
        ['Valor preenchido', interaction.valorPreenchido || interaction.nomeArquivo || ''],
        ['Selector CSS', interaction.cssSelector || ''],
        ['XPath', interaction.xpath || ''],
        ['Timestamp', interaction.timestamp ? new Date(interaction.timestamp).toLocaleString() : ''],
        ['Texto do passo', interaction.stepText || ''],
    ];
    details.forEach(([label, value]) => {
        if (value) {
            const row = document.createElement('div');
            row.innerHTML = `<b>${label}:</b> <span style="font-family:monospace">${value}</span>`;

            modal.appendChild(row);
        }
    });

    // Botão fechar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Fechar';
    closeBtn.style.background = '#007bff';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.padding = '8px 22px';
    closeBtn.style.fontSize = '15px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => modalBg.remove();
    modal.appendChild(closeBtn);

    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

// Modal para editar interação
function showEditModal(idx) {
    const interaction = window.interactions[idx];
    if (!interaction) return;
    // Remove modal antigo se existir
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.25)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '10003';
    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.gap = '18px';
    modal.style.minWidth = '260px';
    // Título
    const title = document.createElement('div');
    title.textContent = 'Editar interação';
    title.style.fontSize = '17px';
    title.style.color = '#0D47A1';
    title.style.textAlign = 'center';
    modal.appendChild(title);
    // Campo passo (Given, When, Then)
    const stepLabel = document.createElement('label');
    stepLabel.textContent = 'Passo BDD:';
    stepLabel.style.fontWeight = 'bold';
    stepLabel.style.marginBottom = '4px';
    modal.appendChild(stepLabel);
    const stepSelect = document.createElement('select');
    stepSelect.style.width = '100%';
    stepSelect.style.padding = '7px';
    stepSelect.style.borderRadius = '5px';
    stepSelect.style.border = '1px solid #ccc';
    stepSelect.style.fontSize = '14px';
    ['Given','When','Then'].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (interaction.step === opt) option.selected = true;
        stepSelect.appendChild(option);
    });
    modal.appendChild(stepSelect);
    // Campo ação
    const actionLabel = document.createElement('label');
    actionLabel.textContent = 'Ação:';
    actionLabel.style.fontWeight = 'bold';
    actionLabel.style.marginBottom = '4px';
    modal.appendChild(actionLabel);
    let actionSelect;
    if (interaction.acao === 'acessa_url') {
        // Para o passo inicial, exibe o valor fixo e desabilita edição
        actionSelect = document.createElement('input');
        actionSelect.type = 'text';
        actionSelect.value = 'acessa_url';
        actionSelect.disabled = true;
        actionSelect.style.width = '100%';
        actionSelect.style.padding = '7px';
        actionSelect.style.borderRadius = '5px';
        actionSelect.style.border = '1px solid #ccc';
        actionSelect.style.fontSize = '14px';
        actionSelect.style.background = '#f5f5f5';
    } else {
        actionSelect = document.createElement('select');
        actionSelect.style.width = '100%';
        actionSelect.style.padding = '7px';
        actionSelect.style.borderRadius = '5px';
        actionSelect.style.border = '1px solid #ccc';
        actionSelect.style.fontSize = '14px';
        // Opções iguais ao painel
        const mainActionSelect = document.getElementById('gherkin-action-select');
        if (mainActionSelect && mainActionSelect.innerHTML.trim()) {
            actionSelect.innerHTML = mainActionSelect.innerHTML;
        } else {
            actionSelect.innerHTML = '<option value="clica">Clicar</option>';
        }
        actionSelect.value = interaction.acao;
    }
    modal.appendChild(actionSelect);
    // Campo nome do elemento
    const nomeLabel = document.createElement('label');
    nomeLabel.textContent = 'Nome do elemento:';
    nomeLabel.style.fontWeight = 'bold';
    nomeLabel.style.marginBottom = '4px';
    modal.appendChild(nomeLabel);
    const nomeInput = document.createElement('input');
    nomeInput.type = 'text';
    nomeInput.value = interaction.nomeElemento;
    nomeInput.style.width = '100%';
    nomeInput.style.padding = '7px';
    nomeInput.style.borderRadius = '5px';
    nomeInput.style.border = '1px solid #ccc';
    nomeInput.style.fontSize = '14px';
    modal.appendChild(nomeInput);
    // Campo nome do arquivo (apenas para upload)
    let fileInput = null;
    if (interaction.acao === 'upload') {
        const fileLabel = document.createElement('label');
        fileLabel.textContent = 'Nome do arquivo de exemplo:';
        fileLabel.style.fontWeight = 'bold';
        fileLabel.style.marginBottom = '4px';
        modal.appendChild(fileLabel);
        fileInput = document.createElement('input');
        fileInput.type = 'text';
        fileInput.value = interaction.nomeArquivo || '';
        fileInput.style.width = '100%';
        fileInput.style.padding = '7px';
        fileInput.style.borderRadius = '5px';
        fileInput.style.border = '1px solid #ccc';
        fileInput.style.fontSize = '14px';
        modal.appendChild(fileInput);
    }
    // Campo valor preenchido (apenas para ação preenche)
    let valorPreenchidoInput = null;
    if (interaction.acao === 'preenche') {
        const valorLabel = document.createElement('label');
        valorLabel.textContent = 'Valor preenchido:';
        valorLabel.style.fontWeight = 'bold';
        valorLabel.style.marginBottom = '4px';
        modal.appendChild(valorLabel);
        valorPreenchidoInput = document.createElement('input');
        valorPreenchidoInput.type = 'text';
        valorPreenchidoInput.value = typeof interaction.valorPreenchido !== 'undefined' ? interaction.valorPreenchido : '';
        valorPreenchidoInput.style.width = '100%';
        valorPreenchidoInput.style.padding = '7px';
        valorPreenchidoInput.style.borderRadius = '5px';
        valorPreenchidoInput.style.border = '1px solid #ccc';
        valorPreenchidoInput.style.fontSize = '14px';
        valorPreenchidoInput.style.marginBottom = '12px';
        valorPreenchidoInput.autocomplete = 'off';
        modal.appendChild(valorPreenchidoInput);
    }
    // Botões
    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '18px';
    btns.style.marginTop = '12px';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Salvar';
    saveBtn.style.background = '#007bff';
    saveBtn.style.color = '#fff';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '6px';
    saveBtn.style.padding = '8px 22px';
    saveBtn.style.fontSize = '15px';
    saveBtn.style.fontWeight = 'bold';
    saveBtn.style.cursor = 'pointer';
    saveBtn.onclick = () => {
        interaction.step = stepSelect.value;
        if (interaction.acao === 'acessa_url') {
            // Mantém a ação fixa
            interaction.acao = 'acessa_url';
            interaction.acaoTexto = 'Acessa';
        } else {
            interaction.acao = actionSelect.value;
            // Protege contra opção indefinida
            const selectedOption = actionSelect.options ? actionSelect.options[actionSelect.selectedIndex] : null;
            interaction.acaoTexto = selectedOption ? selectedOption.text : actionSelect.value;
        }
        interaction.nomeElemento = nomeInput.value.trim() || interaction.nomeElemento;
        if (interaction.acao === 'upload' && fileInput) {
            interaction.nomeArquivo = fileInput.value.trim() || interaction.nomeArquivo;
        }
        if (interaction.acao === 'preenche' && valorPreenchidoInput) {
            interaction.valorPreenchido = valorPreenchidoInput.value;
        }
        saveInteractionsToStorage();
        renderLogWithActions();
        modalBg.remove();
    };
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.background = '#dc3545';
    cancelBtn.style.color = '#fff';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '6px';
    cancelBtn.style.padding = '8px 22px';
    cancelBtn.style.fontSize = '15px';
    cancelBtn.style.fontWeight = 'bold';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = () => modalBg.remove();
    btns.appendChild(saveBtn);
    btns.appendChild(cancelBtn);
    modal.appendChild(btns);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

// Modal para exibir XPath
function showXPathModal(xpath) {
    // Remove modal antigo se existir
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.25)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '10003';
    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.gap = '18px';
    modal.style.minWidth = '260px';
    // Título
    const title = document.createElement('div');
    title.textContent = 'XPath do elemento';
    title.style.fontSize = '17px';
    title.style.color = '#0D47A1';
    title.style.textAlign = 'center';
    modal.appendChild(title);
    // XPath
    const xpathBox = document.createElement('textarea');
    xpathBox.value = xpath || '';
    xpathBox.readOnly = true;
    xpathBox.style.width = '100%';
    xpathBox.style.height = '60px';
    xpathBox.style.fontSize = '13px';
    xpathBox.style.padding = '7px';
    xpathBox.style.borderRadius = '5px';
    xpathBox.style.border = '1px solid #ccc';
    xpathBox.style.marginTop = '8px';
    modal.appendChild(xpathBox);
    // Botão fechar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Fechar';
    closeBtn.style.background = '#007bff';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.padding = '8px 22px';
    closeBtn.style.fontSize = '15px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => modalBg.remove();
    modal.appendChild(closeBtn);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

// Menu de ações rápidas (melhorado)
function buildActionMenu(interaction, idx) {
    const menuWrap = document.createElement('div');
    menuWrap.style.position = 'relative';
    menuWrap.style.display = 'inline-block';

    const btn = document.createElement('button');
    // Ícone SVG de "três pontos" vertical, acessível e responsivo
    btn.innerHTML = `
      <span class="gherkin-action-menu-icon" aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <circle cx="12" cy="5" r="2" fill="#0070f3"/>
          <circle cx="12" cy="12" r="2" fill="#0070f3"/>
          <circle cx="12" cy="19" r="2" fill="#0070f3"/>
        </svg>
      </span>
      <span class="sr-only">Ações rápidas</span>
    `;
    btn.title = 'Ações';
    btn.style.background = 'none';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '1.2em';
    btn.setAttribute('aria-label', 'Ações rápidas');
    btn.setAttribute('tabindex', '0');
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.minWidth = '36px';
    btn.style.minHeight = '36px';
    btn.style.borderRadius = '50%';
    btn.style.transition = 'background 0.18s';
    btn.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    };
    menuWrap.appendChild(btn);

    const menu = document.createElement('div');
    menu.className = 'gherkin-action-dropdown';
    menu.style.display = 'none';
    menu.style.position = 'absolute';
    menu.style.background = '#fff';
    menu.style.border = '1px solid #ccc';
    menu.style.borderRadius = '6px';
    menu.style.boxShadow = '0 8px 32px rgba(0,112,243,0.13), 0 1.5px 6px rgba(0,0,0,0.07)';
    menu.style.zIndex = '2147483647';
    menu.style.minWidth = '170px';
    menu.style.maxWidth = '90vw';
    menu.style.maxHeight = '320px';
    menu.style.overflowY = 'auto';
    menu.style.padding = '8px 0';
    // Não defina left/top aqui, será calculado no click

    // Editar
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.onclick = (e) => {
        e.stopPropagation();
        menu.style.display = 'none';
        showEditModal(idx);
    };
    menu.appendChild(editBtn);

    // Ver XPath
    const xpathBtn = document.createElement('button');
    xpathBtn.textContent = 'Ver XPath';
    xpathBtn.onclick = (e) => {
        e.stopPropagation();
        menu.style.display = 'none';
        showXPathModal(interaction.xpath);
    };
    menu.appendChild(xpathBtn);

    // Excluir
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Excluir';
    deleteBtn.style.color = '#dc3545';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        menu.style.display = 'none';
        showModal('Tem certeza que deseja excluir esta ação?', () => {
            window.interactions.splice(idx, 1);
            if (typeof saveInteractionsToStorage === 'function') saveInteractionsToStorage();
            renderLogWithActions();
        });
    };
    menu.appendChild(deleteBtn);

    // Exemplo Selenium (se aplicável)
    if (['login', 'espera_elemento', 'espera_nao_existe', 'upload'].includes(interaction.acao)) {
        const seleniumBtn = document.createElement('button');
        seleniumBtn.textContent = 'Ver exemplo Selenium';
        seleniumBtn.onclick = (e) => {
            e.stopPropagation();
            menu.style.display = 'none';
            showSeleniumExampleModal(interaction);
        };
        menu.appendChild(seleniumBtn);
    }

    btn.onclick = (e) => {
        e.stopPropagation();
        // Fecha outros menus
        document.querySelectorAll('.gherkin-action-dropdown').forEach(d => { d.style.display = 'none'; if (d.parentElement === document.body) d.remove(); });

        // Exibe o menu como dropdown centralizado abaixo do botão, DENTRO do gherkin-log
        menu.style.display = 'flex';
        menu.style.position = 'absolute';
        menu.style.visibility = 'hidden';
        menu.style.left = '0';
        menu.style.top = '0';
        // Garante que o gherkin-log tem position: relative
        const log = document.getElementById('gherkin-log');
        if (log) {
            if (getComputedStyle(log).position === 'static') {
                log.style.position = 'relative';
            }
            log.appendChild(menu);
        } else {
            document.body.appendChild(menu);
        }

        // Mede o botão e o menu
        const btnRect = btn.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const logRect = log ? log.getBoundingClientRect() : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
        menu.style.visibility = '';

        // Posição padrão: abaixo do botão, relativa ao gherkin-log
        let left = btnRect.left - logRect.left + (btnRect.width / 2) - (menuRect.width / 2);
        let top = btnRect.bottom - logRect.top + 4;

        // Garante que não saia do log
        if (left < 0) left = 0;
        if (left + menuRect.width > logRect.right - logRect.left) left = logRect.right - logRect.left - menuRect.width - 2;
        if (top + menuRect.height > logRect.bottom - logRect.top) {
            // Exibe para cima do botão
            top = btnRect.top - logRect.top - menuRect.height - 4;
            if (top < 0) top = 0;
        }

        menu.style.left = left + 'px';
        menu.style.top = top + 'px';

        // Garante foco para acessibilidade
        setTimeout(() => {
            if (menu.firstChild && menu.firstChild.focus) menu.firstChild.focus();
        }, 0);

        // Fecha ao clicar fora
        setTimeout(() => {
            function closeDropdown(ev) {
                if (!menu.contains(ev.target) && ev.target !== btn) {
                    menu.style.display = 'none';
                    if (menu.parentElement === document.body) menu.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            }
            document.addEventListener('click', closeDropdown);
        }, 0);
    };

    // Fecha ao clicar fora
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(ev) {
            if (!menu.contains(ev.target) && ev.target !== btn) {
                menu.style.display = 'none';
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 0);

    menuWrap.appendChild(menu);
    return menuWrap;
}

function showSeleniumExampleModal(interaction) {
    // Remove modal antigo se existir
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.25)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '10003';

    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'flex-start';
    modal.style.gap = '12px';
    modal.style.minWidth = '320px';
    modal.style.maxWidth = '96vw';
    modal.style.maxHeight = '80vh';
    modal.style.overflowY = 'auto';
    modalBg.className = 'gherkin-modal-bg';
    modal.className = 'gherkin-modal-content';

    // Exemplo Selenium (ajuste conforme o tipo de interação)
    let seleniumExample = '';
    if (interaction.acao === 'login') {
        seleniumExample = `
driver.find_element(By.CSS_SELECTOR, "${interaction.cssSelector}").send_keys("${interaction.nomeElemento}");
driver.find_element(By.CSS_SELECTOR, "${interaction.cssSelectorSenha}").send_keys("${interaction.valorPreenchido}");
driver.find_element(By.CSS_SELECTOR, "${interaction.cssSelectorBotaoLogin}").click();
        `.trim();
    } else if (interaction.acao === 'espera_elemento') {
        seleniumExample = `
WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.CSS_SELECTOR, "${interaction.cssSelector}"))
)
        `.trim();
    } else if (interaction.acao === 'upload') {
        seleniumExample = `
driver.find_element(By.CSS_SELECTOR, "${interaction.cssSelector}").send_keys("/caminho/para/${interaction.nomeArquivo}");
        `.trim();
    } else {
        seleniumExample = '# Exemplo Selenium não disponível para esta ação.';
    }

    const title = document.createElement('div');
    title.innerHTML = `<b>Exemplo Selenium</b> (${interaction.acao})`;
    title.style.fontSize = '17px';
    title.style.color = '#0D47A1';
    title.style.textAlign = 'left';
    modal.appendChild(title);

    const code = document.createElement('pre');
    code.textContent = seleniumExample;
    code.style.background = '#f7faff';
    code.style.padding = '12px';
    code.style.borderRadius = '6px';
    code.style.fontSize = '14px';
    code.style.overflowX = 'auto';
    modal.appendChild(code);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Fechar';
    closeBtn.style.background = '#007bff';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.padding = '8px 22px';
    closeBtn.style.fontSize = '15px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => modalBg.remove();
    modal.appendChild(closeBtn);

    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

function initializePanelEvents(panel) {
    // Botões do cabeçalho
    const minimizeButton = panel.querySelector('#gherkin-minimize');
    const reopenButton = panel.querySelector('#gherkin-reopen');
    const closeButton = panel.querySelector('#gherkin-close');
    if (minimizeButton) minimizeButton.onclick = () => toggleMinimizePanel(panel);
    if (reopenButton) reopenButton.onclick = () => toggleMinimizePanel(panel);
    if (closeButton) closeButton.onclick = () => {
        panel.style.opacity = '0';
        setTimeout(() => panel.remove(), 300);
        window.panel = null;
    };

    // Iniciar Feature
    const startFeatureBtn = panel.querySelector('#start-feature');
    if (startFeatureBtn) {
        startFeatureBtn.onclick = () => {
            const input = panel.querySelector('#feature-name');
            const name = input.value.trim();
            if (!name) {
                showFeedback('Informe o nome da feature!', 'error');
                return;
            }
            window.currentFeature = { name, cenarios: [] };
            window.currentCenario = null;
            window.gherkinPanelState = 'cenario';
            renderPanelContent(panel);
            setTimeout(() => initializePanelEvents(panel), 100);
        };
    }

    // Iniciar Cenário
    const startCenarioBtn = panel.querySelector('#start-cenario');
    if (startCenarioBtn) {
        startCenarioBtn.onclick = () => {
            const input = panel.querySelector('#cenario-name');
            const name = input.value.trim();
            if (!name) {
                showFeedback('Informe o nome do cenário!', 'error');
                return;
            }
            // Adiciona automaticamente o passo Given que o usuário acessa a URL atual
            const url = window.location.href;
            const givenAcessaUrl = {
                step: 'Given',
                acao: 'acessa_url',
                acaoTexto: 'que o usuário acessa',
                nomeElemento: url,
                cssSelector: '',
                xpath: '',
                timestamp: Date.now()
            };
            window.currentCenario = { name, interactions: [givenAcessaUrl] };
            window.interactions = window.currentCenario.interactions;
            window.gherkinPanelState = 'gravando';
            window.isRecording = true;
            window.isPaused = false;
            window.elapsedSeconds = 0;
            renderPanelContent(panel);
            setTimeout(() => initializePanelEvents(panel), 100);
            if (typeof startTimer === 'function') startTimer();
        };
    }

    // Encerrar Cenário
    const endCenarioBtn = panel.querySelector('#end-cenario');
    if (endCenarioBtn) {
        endCenarioBtn.onclick = () => {
            window.isRecording = false;
            window.isPaused = false;
            if (typeof stopTimer === 'function') stopTimer();
            // Salva o cenário na feature
            if (window.currentFeature && window.currentCenario) {
                window.currentFeature.cenarios.push(window.currentCenario);
            }
            // Pergunta se deseja cadastrar novo cenário
            showModal('Deseja cadastrar um novo cenário?', () => {
                // SIM: volta para tela de nome do cenário
                window.currentCenario = null;
                window.interactions = [];
                window.gherkinPanelState = 'cenario';
                renderPanelContent(panel);
                setTimeout(() => initializePanelEvents(panel), 100);
            }, () => {
                // NÃO: habilita botão de encerrar feature
                const endFeatureBtn = panel.querySelector('#end-feature');
                if (endFeatureBtn) {
                    endFeatureBtn.disabled = false;
                    endFeatureBtn.style.backgroundColor = '#dc3545';
                }
                showFeedback('Cenário encerrado! Você pode encerrar a feature.', 'success');
            });
        };
    }

    // Exportar Projeto
    const exportProjectBtn = panel.querySelector('#export-project');
    if (exportProjectBtn) {
        exportProjectBtn.onclick = async () => {
            const form = panel.querySelector('#export-form');
            const selected = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value, 10));
            if (selected.length === 0) {
                showFeedback('Selecione ao menos uma feature!', 'error');
                return;
            }
            if (typeof exportSelectedFeatures === 'function') {
                exportSelectedFeatures(selected);
            }
        };
    }

    // Encerrar Feature (já estava implementado)
    const endFeatureBtn = panel.querySelector('#end-feature');
    if (endFeatureBtn) {
        endFeatureBtn.onclick = () => {
            showModal('Deseja cadastrar uma nova feature?', () => {
                if (window.currentFeature && window.currentFeature.cenarios && window.currentFeature.cenarios.length > 0) {
                    window.gherkinFeatures = window.gherkinFeatures || [];
                    window.gherkinFeatures.push(window.currentFeature);
                    showFeedback('Feature salva com sucesso!', 'success');
                } else {
                    showFeedback('Adicione pelo menos um cenário!', 'error');
                    return;
                }
                window.currentFeature = null;
                window.currentCenario = null;
                window.gherkinPanelState = 'feature';
                renderPanelContent(panel);
                setTimeout(() => initializePanelEvents(panel), 100);
            }, () => {
                if (window.currentFeature && window.currentFeature.cenarios && window.currentFeature.cenarios.length > 0) {
                    window.gherkinFeatures = window.gherkinFeatures || [];
                    window.gherkinFeatures.push(window.currentFeature);
                    showFeedback('Feature salva com sucesso!', 'success');
                } else {
                    showFeedback('Adicione pelo menos um cenário!', 'error');
                    return;
                }
                window.currentFeature = null;
                window.currentCenario = null;
                window.gherkinPanelState = 'exportar';
                renderPanelContent(panel);
                setTimeout(() => initializePanelEvents(panel), 100);
            });
        };
    }

    // Exportar Selecionadas (painel de exportação)
    const exportSelectedBtn = panel.querySelector('#export-selected');
    if (exportSelectedBtn) {
        exportSelectedBtn.onclick = () => {
            const form = panel.querySelector('#export-form');
            if (!form) {
                showFeedback('Formulário de exportação não encontrado!', 'error');
                return;
            }
            const selected = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value, 10));
            if (selected.length === 0) {
                showFeedback('Selecione ao menos uma feature!', 'error');
                return;
            }
            // Garante chamada global e feedback de erro
            if (window.exportSelectedFeatures && typeof window.exportSelectedFeatures === 'function') {
                window.exportSelectedFeatures(selected);
            } else {
                showFeedback('Função de exportação não encontrada! Recarregue a página.', 'error');
            }
        };
    }

    // Nova Feature (painel de exportação)
    const newFeatureBtn = panel.querySelector('#new-feature');
    if (newFeatureBtn) {
        newFeatureBtn.onclick = () => {
            window.currentFeature = null;
            window.currentCenario = null;
            window.gherkinPanelState = 'feature';
            renderPanelContent(panel);
            setTimeout(() => initializePanelEvents(panel), 100);
        };
    }
}
export {
    renderPanelContent,
    createPanel,
    showLoginModal,
    showUploadModal,
    updateActionParams,
    makePanelDraggable,
    showModal,
    renderLogWithActions,
    showEditModal,
    showXPathModal,
    initializePanelEvents // exporta a função para uso externo
};