// Funções relacionadas à interface do usuário
import { showFeedback } from './utils.js';

// Função para criar o painel e renderizar o conteúdo inicial
function createPanel() {
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
    setTimeout(() => initializePanelEvents(panel), 100); // Inicializa eventos após renderização
    return panel;
}

// Função para renderizar o conteúdo do painel conforme o estado
function renderPanelContent(panel) {
    let html = '';
    // Cabeçalho fixo
    html += `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; min-height: 40px;">
            <h3 style="margin: 0; font-size: 18px; color: #007bff; font-weight: bold; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);">GERADOR DE TESTES AUTOMATIZADOS</h3>
            <div class="button-container-top" style="display: flex; gap: 6px; align-items: center;">
                <button id="gherkin-reopen" title="Reabrir" style="display: none; background-color: transparent; border: none; cursor: pointer; font-size: 14px; font-weight: bold; color: #28a745;">Abrir</button>
                <button id="gherkin-minimize" title="Minimizar" style="background-color: transparent; border: none; cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffc107" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
                </button>
                <button id="gherkin-close" title="Fechar" style="background-color: transparent; border: none; cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#dc3545" viewBox="0 0 24 24"><path d="M18.3 5.71L12 12l6.3 6.29-1.42 1.42L12 13.41l-6.29 6.3-1.42-1.42L10.59 12 4.29 5.71 5.71 4.29 12 10.59l6.29-6.3z"/></svg>
                </button>
            </div>
        </div>
    `;

    // Conteúdo dinâmico por etapa
    if (window.gherkinPanelState === 'feature') {
        html += `
            <div class="gherkin-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80%;">
                <label for="feature-name" style="font-size: 16px; margin-bottom: 10px;">Informe o nome da Feature:</label>
                <input id="feature-name" type="text" placeholder="Ex: Login" style="width: 90%; padding: 8px; border-radius: 5px; border: 1px solid #ccc; margin-bottom: 15px; font-size: 15px;" />
                <button id="start-feature" style="background-color: #007bff; color: white; border: none; border-radius: 5px; padding: 10px 20px; font-size: 15px;">Iniciar Feature</button>
            </div>
        `;
    } else if (window.gherkinPanelState === 'cenario') {
        html += `
            <div class="gherkin-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80%;">
                <label for="cenario-name" style="font-size: 16px; margin-bottom: 10px;">Informe o nome do Cenário:</label>
                <input id="cenario-name" type="text" placeholder="Ex: Login com sucesso" style="width: 90%; padding: 8px; border-radius: 5px; border: 1px solid #ccc; margin-bottom: 15px; font-size: 15px;" />
                <button id="start-cenario" style="background-color: #007bff; color: white; border: none; border-radius: 5px; padding: 10px 20px; font-size: 15px;">Iniciar Cenário</button>
            </div>
        `;
    } else if (window.gherkinPanelState === 'gravando') {
        html += `
            <div class="gherkin-content">
                <p id="gherkin-status" style="font-size: 14px; margin: 5px 0; color: #555;">Status: Gravando</p>
                <p style="font-size: 14px; color: #0D47A1; font-weight: bold;">Feature: ${window.currentFeature ? window.currentFeature.name : ''}</p>
                <p style="font-size: 14px; color: #007bff; font-weight: bold;">Cenário: ${window.currentCenario ? window.currentCenario.name : ''}</p>
                <div id="recording-indicator" style="display: none; margin: 10px auto; width: 10px; height: 10px; background-color: #ff0000; border-radius: 50%; animation: pulse 1s infinite;"></div>
                <p id="gherkin-timer" style="font-size: 14px; margin: 5px 0; color: #555;">Tempo de execução: 00:00</p>
                <label for="gherkin-action-select" style="font-size: 13px; margin-top: 8px;">Ação:</label>
                <select id="gherkin-action-select" style="width: 100%; padding: 7px; border-radius: 5px; border: 1px solid #ccc; margin-bottom: 10px; font-size: 14px;">
                    <optgroup label="Ações">
                        <option value="clica">Clicar</option>
                        <option value="altera">Alterar</option>
                        <option value="preenche">Preencher</option>
                        <option value="seleciona">Selecionar</option>
                        <option value="radio">Botão de rádio</option>
                        <option value="caixa">Caixa de seleção</option>
                        <option value="navega">Navegar</option>
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
                        <option value="espera_existe">Esperar que o elemento exista</option>
                        <option value="espera_nao_existe">Esperar que o elemento não exista</option>
                        <option value="espera_habilitado">Esperar que o elemento esteja habilitado</option>
                        <option value="espera_desabilitado">Esperar que o elemento esteja desabilitado</option>
                    </optgroup>
                </select>
                <div id="gherkin-log" style="overflow-y: auto; height: 350px; margin-top: 10px; border: 1px solid #ccc; padding: 5px; font-size: 13px; background-color: #f9f9f9;"></div>
                <div style="display: flex; flex-wrap: nowrap; gap: 4px; margin-top: 10px; justify-content: center; align-items: center; width: 100%;">
                    <button id="end-cenario" style="background-color: #dc3545; color: white; border: none; border-radius: 4px; padding: 0; width: 60px; height: 32px; font-size: 12px; display: flex; align-items: center; justify-content: center;">Encerrar Cenário</button>
                    <button id="end-feature" style="background-color: #6c757d; color: white; border: none; border-radius: 4px; padding: 0; width: 60px; height: 32px; font-size: 12px; display: flex; align-items: center; justify-content: center;" disabled>Encerrar Feature</button>
                    <button id="gherkin-pause" style="background-color: #ffc107; color: white; border: none; border-radius: 4px; padding: 0; width: 60px; height: 32px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;">Pausar</button>
                    <button id="gherkin-clear" style="background-color: #dc3545; color: white; border: none; border-radius: 4px; padding: 0; width: 60px; height: 32px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;">Limpar</button>
                </div>
            </div>
        `;
    } else if (window.gherkinPanelState === 'exportar') {
        // Lista de features para exportação
        html += `<div class="gherkin-content" style="padding: 10px;">
            <h4 style="color: #0D47A1;">Selecione as features para exportar:</h4>
            <form id="export-form" style="max-height: 250px; overflow-y: auto; margin-bottom: 15px;">`;
        window.gherkinFeatures.forEach((feature, idx) => {
            html += `<div style='margin-bottom: 8px;'><input type='checkbox' id='feature-export-${idx}' name='feature-export' value='${idx}'><label for='feature-export-${idx}' style='margin-left: 8px;'>${feature.name}</label></div>`;
        });
        html += `</form>
            <button id="export-selected" style="background-color: #007bff; color: white; border: none; border-radius: 5px; padding: 10px 20px;">Exportar Selecionadas</button>
            <button id="new-feature" style="background-color: #28a745; color: white; border: none; border-radius: 5px; padding: 10px 20px; margin-left: 10px;">Nova Feature</button>
        </div>`;
    }
    html += `<p id="gherkin-footer" style="position: absolute; bottom: 0px; right: 10px; font-size: 10px; margin: 0; color: #555;">By: Matheus Ferreira de Oliveira</p>`;
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
function updateActionParams() {
    const actionSelect = panel.querySelector('#gherkin-action-select');
    const paramsDiv = panel.querySelector('#gherkin-action-params');
    if (!actionSelect || !paramsDiv) return;
    paramsDiv.innerHTML = '';
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
        info.textContent = 'Clique no elemento que deseja aguardar na página.';
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

    panel.addEventListener('mousedown', (event) => {
        if (event.target.closest('.button-container')) return; // Evita arrastar ao clicar nos botões
        isDragging = true;
        offsetX = event.clientX - panel.getBoundingClientRect().left;
        offsetY = event.clientY - panel.getBoundingClientRect().top;
        panel.style.cursor = 'move';
    });

    document.addEventListener('mousemove', (event) => {
        if (!isDragging) return;
        panel.style.left = `${event.clientX - offsetX}px`;
        panel.style.top = `${event.clientY - offsetY}px`;
        panel.style.right = 'auto'; // Remove a posição fixa à direita
        panel.style.bottom = 'auto'; // Remove a posição fixa à parte inferior
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            panel.style.cursor = 'default';
        }
    });
}

// Função para limpar a tela de log
function clearLog() {
    const log = document.getElementById('gherkin-log');
    if (log) {
        log.innerHTML = '<p>Clique para capturar um elemento XPATH.</p>';
    }
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

// Função para renderizar o log com menu de ações
function renderLogWithActions() {
    const log = document.getElementById('gherkin-log');
    if (!log) return;
    log.innerHTML = '';
    if (!window.interactions || window.interactions.length === 0) {
        log.innerHTML = '<p>Clique para capturar um elemento XPATH.</p>';
        return;
    }

    const MAX_LOG_CHARS = 300;
    window.interactions.forEach((interaction, idx) => {
        let mensagem = '';
        if (interaction.acao === 'acessa_url') {
            mensagem = `Given que o usuário acessa ${interaction.nomeElemento}`;
        } else if (interaction.acao === 'preenche') {
            mensagem = `${interaction.step} ${interaction.acaoTexto.toLowerCase()} no ${interaction.nomeElemento}`;
            if (typeof interaction.valorPreenchido !== 'undefined') {
                mensagem += ` (valor: "${interaction.valorPreenchido}")`;
            }
        } else if (interaction.acao === 'espera_segundos') {
            mensagem = `${interaction.step} ${interaction.acaoTexto.toLowerCase()} no ${interaction.nomeElemento}`;
            if (typeof interaction.tempoEspera !== 'undefined') {
                mensagem += ` (${interaction.tempoEspera} segundos)`;
            }
        } else {
            mensagem = `${interaction.step} ${interaction.acaoTexto.toLowerCase()} no ${interaction.nomeElemento}`;
        }

        // Se o log for muito grande, exibe apenas o início e botão para visualizar
        const isVeryLarge = mensagem.length > MAX_LOG_CHARS;
        const logEntry = document.createElement('div');
        logEntry.className = 'gherkin-log-entry';
        let expanded = false;

        if (isVeryLarge) {
            // Mensagem truncada
            const msgSpan = document.createElement('span');
            const TRUNC_SIZE = 80;
            let preview = mensagem.slice(0, TRUNC_SIZE);
            if (mensagem.length > TRUNC_SIZE) preview += '...';
            msgSpan.textContent = preview;
            msgSpan.style.color = '#dc3545';
            msgSpan.style.flex = '1';
            msgSpan.title = 'Clique no botão para visualizar o log completo.';
            logEntry.appendChild(msgSpan);

            // Botão para abrir modal
            const modalBtn = document.createElement('button');
            modalBtn.className = 'gherkin-large-log-btn';
            modalBtn.title = 'Visualizar log completo';
            modalBtn.style.background = 'none';
            modalBtn.style.border = 'none';
            modalBtn.style.cursor = 'pointer';
            modalBtn.style.marginLeft = '6px';
            modalBtn.style.padding = '2px';
            modalBtn.style.display = 'flex';
            modalBtn.style.alignItems = 'center';
            modalBtn.setAttribute('aria-label', 'Visualizar log completo');
            modalBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#007bff"/><path d="M8 12l2.5 2.5L16 9" stroke="#fff" stroke-width="2" fill="none"/></svg>';
            modalBtn.onclick = (e) => {
                e.stopPropagation();
                showLargeLogModal(mensagem);
            };
            logEntry.appendChild(modalBtn);
        } else {
            // Mensagem
            const msgSpan = document.createElement('span');
            msgSpan.textContent = mensagem;
            msgSpan.style.flex = '1';
            // Tooltip se o texto for truncado visualmente
            setTimeout(() => {
                if (msgSpan.offsetHeight < msgSpan.scrollHeight || msgSpan.offsetWidth < msgSpan.scrollWidth) {
                    msgSpan.title = mensagem;
                } else {
                    msgSpan.removeAttribute('title');
                }
            }, 0);
            logEntry.appendChild(msgSpan);

            // Botão expandir/recolher
            const expandBtn = document.createElement('button');
            expandBtn.className = 'gherkin-expand-btn';
            expandBtn.title = 'Expandir log';
            expandBtn.style.background = 'none';
            expandBtn.style.border = 'none';
            expandBtn.style.cursor = 'pointer';
            expandBtn.style.marginLeft = '6px';
            expandBtn.style.padding = '2px';
            expandBtn.style.display = 'flex';
            expandBtn.style.alignItems = 'center';
            expandBtn.setAttribute('aria-label', 'Expandir log');
            expandBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>';
            expandBtn.onclick = (e) => {
                e.stopPropagation();
                expanded = !expanded;
                if (expanded) {
                    msgSpan.textContent = mensagem;
                    logEntry.classList.add('expanded');
                    expandBtn.title = 'Recolher log';
                    expandBtn.setAttribute('aria-label', 'Recolher log');
                    expandBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>';
                } else {
                    logEntry.classList.remove('expanded');
                    expandBtn.title = 'Expandir log';
                    expandBtn.setAttribute('aria-label', 'Expandir log');
                    expandBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>';
                }
            };
            logEntry.appendChild(expandBtn);
        }

        // Botão/menu de ações (ao lado do log)
        const actionMenu = document.createElement('div');
        actionMenu.className = 'gherkin-action-menu';
        actionMenu.style.position = 'relative';
        actionMenu.style.marginLeft = '6px';
        actionMenu.style.display = 'inline-block';
        // Ícone de três pontos
        const menuBtn = document.createElement('button');
        menuBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
        menuBtn.style.background = 'none';
        menuBtn.style.border = 'none';
        menuBtn.style.cursor = 'pointer';
        menuBtn.style.padding = '2px';
        menuBtn.title = 'Ações';
        actionMenu.appendChild(menuBtn);
        // Menu dropdown (inicialmente oculto)
        const dropdown = document.createElement('div');
        dropdown.className = 'gherkin-action-dropdown';
        dropdown.style.display = 'none';
        dropdown.style.position = 'absolute';
        dropdown.style.right = '0';
        dropdown.style.top = '24px';
        dropdown.style.background = '#fff';
        dropdown.style.border = '1px solid #ccc';
        dropdown.style.borderRadius = '6px';
        dropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        dropdown.style.zIndex = '10002';
        dropdown.style.minWidth = '120px';
        // Opções do menu
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.style.display = 'block';
        editBtn.style.width = '100%';
        editBtn.style.background = 'none';
        editBtn.style.border = 'none';
        editBtn.style.padding = '8px 12px';
        editBtn.style.cursor = 'pointer';
        editBtn.style.textAlign = 'left';
        // Editar handler
        editBtn.onclick = (e) => {
            e.stopPropagation();
            dropdown.style.display = 'none';
            showEditModal(idx);
        };
        const xpathBtn = document.createElement('button');
        xpathBtn.textContent = 'Ver XPath';
        xpathBtn.style.display = 'block';
        xpathBtn.style.width = '100%';
        xpathBtn.style.background = 'none';
        xpathBtn.style.border = 'none';
        xpathBtn.style.padding = '8px 12px';
        xpathBtn.style.cursor = 'pointer';
        xpathBtn.style.textAlign = 'left';
        xpathBtn.onmouseover = () => xpathBtn.style.background = '#f1f1f1';
        xpathBtn.onmouseout = () => xpathBtn.style.background = 'none';
        xpathBtn.onclick = (e) => {
            e.stopPropagation();
            dropdown.style.display = 'none';
            showXPathModal(interaction.xpath);
        };
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Excluir';
        deleteBtn.style.display = 'block';
        deleteBtn.style.width = '100%';
        deleteBtn.style.background = 'none';
        deleteBtn.style.border = 'none';
        deleteBtn.style.padding = '8px 12px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.textAlign = 'left';
        deleteBtn.style.color = '#dc3545';
        deleteBtn.onmouseover = () => deleteBtn.style.background = '#fbe9e7';
        deleteBtn.onmouseout = () => deleteBtn.style.background = 'none';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            dropdown.style.display = 'none';
            window.interactions.splice(idx, 1);
            saveInteractionsToStorage();
            renderLogWithActions();
        };
        dropdown.appendChild(editBtn);
        dropdown.appendChild(xpathBtn);
        dropdown.appendChild(deleteBtn);
        actionMenu.appendChild(dropdown);
        // Toggle do menu
        menuBtn.onclick = (e) => {
            e.stopPropagation();
            // Fecha outros dropdowns
            document.querySelectorAll('.gherkin-action-dropdown').forEach(d => { if (d !== dropdown) d.style.display = 'none'; });
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        };
        // Fecha o menu ao clicar fora
        document.addEventListener('click', () => { dropdown.style.display = 'none'; });
        logEntry.appendChild(actionMenu);
        log.appendChild(logEntry);
    });
    log.scrollTop = log.scrollHeight;

    // Função para mostrar log grande em modal
    function showLargeLogModal(texto) {
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
        modal.style.minWidth = '320px';
        modal.style.maxWidth = '90vw';
        modal.style.maxHeight = '80vh';
        // Título
        const title = document.createElement('div');
        title.textContent = 'Log completo';
        title.style.fontSize = '17px';
        title.style.color = '#0D47A1';
        title.style.textAlign = 'center';
        modal.appendChild(title);
        // Texto do log
        const logBox = document.createElement('textarea');
        logBox.value = texto;
        logBox.readOnly = true;
        logBox.style.width = '100%';
        logBox.style.height = '200px';
        logBox.style.fontSize = '13px';
        logBox.style.padding = '7px';
        logBox.style.borderRadius = '5px';
        logBox.style.border = '1px solid #ccc';
        logBox.style.marginTop = '8px';
        logBox.style.resize = 'vertical';
        modal.appendChild(logBox);
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

export {
    renderPanelContent,
    createPanel,
    showLoginModal,
    updateActionParams,
    makePanelDraggable,
    clearLog,
    showModal,
    renderLogWithActions,
    showEditModal,
    showXPathModal
};
