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
        }
    }
// Função para parar o timer
function stopTimer() {
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
        window.timerInterval = null;
    }
    const timerElement = document.getElementById('gherkin-timer');
    if (timerElement) {
        timerElement.textContent = 'Tempo de execução: 00:00';
    }
}

// Variáveis globais para controle de múltiplas features/cenários e estado do painel
if (!window.gherkinFeatures) {
    window.gherkinFeatures = [];
}
if (!window.currentFeature) {
    window.currentFeature = null;
}
if (!window.currentCenario) {
    window.currentCenario = null;
}
if (!window.gherkinPanelState) {
    window.gherkinPanelState = 'feature'; // 'feature', 'cenario', 'gravando', 'exportar'
}
if (typeof window.isRecording === 'undefined') {
    window.isRecording = false;
}
if (typeof window.isPaused === 'undefined') {
    window.isPaused = false;
}
if (typeof window.timerInterval === 'undefined') {
    window.timerInterval = null;
}
if (typeof window.elapsedSeconds === 'undefined') {
    window.elapsedSeconds = 0;
}
if (!window.interactions) {
    window.interactions = [];
}

// Função para alternar entre pausa e gravação
function togglePause() {
    const pauseButton = document.getElementById('gherkin-pause');
    window.isPaused = !window.isPaused;

    if (window.isPaused) {
        pauseButton.textContent = 'Continuar';
        pauseButton.style.backgroundColor = '#28a745'; // Verde para "Continuar"
        document.getElementById('gherkin-status').textContent = 'Status: Pausado';
        stopTimer(); // Pausa o timer
    } else {
        pauseButton.textContent = 'Pausar';
        pauseButton.style.backgroundColor = '#ffc107'; // Amarelo para "Pausar"
        document.getElementById('gherkin-status').textContent = 'Status: Gravando';
        startTimer(); // Retoma o timer
    }
}

// Função para alternar entre temas claro e escuro
function toggleTheme() {
    const panel = document.getElementById('gherkin-panel');
    const isDarkMode = panel.classList.toggle('dark-theme');
    chrome.storage.local.set({ theme: isDarkMode ? 'dark' : 'light' });
}

// Função para aplicar o tema salvo
function applySavedTheme() {
    chrome.storage.local.get('theme', (data) => {
        const panel = document.getElementById('gherkin-panel');
        if (data.theme === 'dark') {
            panel.classList.add('dark-theme');
        } else {
            panel.classList.remove('dark-theme');
        }
    });
}

// Função para alternar entre os botões Minimizar, Reabrir e Fechar
function updatePanelButtons(panel, isMinimized) {
    const minimizeButton = panel.querySelector('#gherkin-minimize');
    const reopenButton = panel.querySelector('#gherkin-reopen');
    const closeButton = panel.querySelector('#gherkin-close');
    // Corrigido: agora busca pela nova classe do container dos botões do topo
    const buttonContainer = panel.querySelector('.button-container-top');

    if (isMinimized) {
        minimizeButton.style.display = 'none'; // Oculta o botão Minimizar
        reopenButton.style.display = 'flex'; // Exibe o botão Reabrir
        closeButton.style.display = 'flex'; // Mantém o botão Fechar visível

        // Ajusta a ordem dos botões ao minimizar
        if (buttonContainer) buttonContainer.style.flexDirection = 'row'; // Reabrir à esquerda, Fechar à direita
    } else {
        minimizeButton.style.display = 'flex'; // Exibe o botão Minimizar
        reopenButton.style.display = 'none'; // Oculta o botão Reabrir
        closeButton.style.display = 'flex'; // Mantém o botão Fechar visível

        // Ajusta a ordem dos botões ao abrir ou maximizar
        if (buttonContainer) buttonContainer.style.flexDirection = 'row'; // Minimizar à esquerda, Fechar à direita
    }
}

// Função para minimizar o painel
function toggleMinimizePanel(panel) {
    const content = panel.querySelector('.gherkin-content');
    const header = panel.querySelector('h3');
    const footer = panel.querySelector('#gherkin-footer');
    const minimizeButton = panel.querySelector('#gherkin-minimize');
    const reopenButton = panel.querySelector('#gherkin-reopen');
    const closeButton = panel.querySelector('#gherkin-close');
    const exportButton = panel.querySelector('#gherkin-export');
    const pauseButton = panel.querySelector('#gherkin-pause');
    const clearButton = panel.querySelector('#gherkin-clear');
    const isMinimized = panel.classList.toggle('minimized');

    if (isMinimized) {
        content.style.display = 'none';
        header.style.display = 'none';
        footer.style.display = 'none';
        panel.style.height = '50px';
        panel.style.width = '100px';
        minimizeButton.style.display = 'none'; // Oculta o botão Minimizar
        reopenButton.style.display = 'flex'; // Exibe o botão Abrir
        closeButton.style.display = 'flex'; // Exibe o botão Fechar
        exportButton.style.display = 'none'; // Oculta o botão Exportar
        pauseButton.style.display = 'none'; // Oculta o botão Pausar
        clearButton.style.display = 'none'; // Oculta o botão Limpar

        // Alinha os botões "Abrir" e "Fechar" no lado direito
        const buttonContainer = panel.querySelector('.button-container-top');
        if (buttonContainer) {
            buttonContainer.style.justifyContent = 'flex-end';
            buttonContainer.style.alignItems = 'center';
            buttonContainer.style.gap = '5px';
        }
    } else {
        content.style.display = 'block';
        header.style.display = 'block';
        footer.style.display = 'block';
        panel.style.height = '700px';
        panel.style.width = '480px';
        minimizeButton.style.display = 'flex'; // Exibe o botão Minimizar
        reopenButton.style.display = 'none'; // Oculta o botão Abrir
        closeButton.style.display = 'flex'; // Mantém o botão Fechar visível
        exportButton.style.display = 'flex'; // Exibe o botão Exportar
        pauseButton.style.display = 'flex'; // Exibe o botão Pausar
        clearButton.style.display = 'flex'; // Exibe o botão Limpar

        // Restaura o layout padrão dos botões
        const buttonContainer = panel.querySelector('.button-container-top');
        if (buttonContainer) {
            buttonContainer.style.justifyContent = 'space-between';
            buttonContainer.style.alignItems = 'center';
            buttonContainer.style.gap = '5px';
        }
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

// Função para inicializar eventos dos botões e inputs do painel
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

    // Etapa 1: Iniciar Feature
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

    // Etapa 2: Iniciar Cenário
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
            startTimer();
        };
    }

    // Etapa 3: Gravação
    const endCenarioBtn = panel.querySelector('#end-cenario');
    if (endCenarioBtn) {
        endCenarioBtn.onclick = () => {
            window.isRecording = false;
            window.isPaused = false;
            stopTimer();
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
    const endFeatureBtn = panel.querySelector('#end-feature');
    if (endFeatureBtn) {
        endFeatureBtn.onclick = () => {
            // Pergunta se deseja cadastrar nova feature
            showModal('Deseja cadastrar uma nova feature?', () => {
                // SIM: salva a feature, volta para tela de nome da feature
                if (window.currentFeature && window.currentFeature.cenarios.length > 0) {
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
                // NÃO: salva a feature e vai para exportação
                if (window.currentFeature && window.currentFeature.cenarios.length > 0) {
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

    // Exportação
    const exportBtn = panel.querySelector('#gherkin-export');
    if (exportBtn) {
        exportBtn.onclick = () => {
            window.gherkinPanelState = 'exportar';
            renderPanelContent(panel);
            setTimeout(() => initializePanelEvents(panel), 100);
        };
    }
    const exportSelectedBtn = panel.querySelector('#export-selected');
    if (exportSelectedBtn) {
        exportSelectedBtn.onclick = () => {
            const form = panel.querySelector('#export-form');
            const selected = Array.from(form.querySelectorAll('input[name="feature-export"]:checked')).map(cb => parseInt(cb.value));
            if (selected.length === 0) {
                showFeedback('Selecione pelo menos uma feature para exportar!', 'error');
                return;
            }
            exportSelectedFeatures(selected);
        };
    }
    const newFeatureBtn = panel.querySelector('#new-feature');
    if (newFeatureBtn) {
        newFeatureBtn.onclick = () => {
            window.gherkinPanelState = 'feature';
            renderPanelContent(panel);
            setTimeout(() => initializePanelEvents(panel), 100);
        };
    }

    // Pausa/Inicia
    const pauseBtn = panel.querySelector('#gherkin-pause');
    if (pauseBtn) pauseBtn.onclick = togglePause;
    // Limpar log
    const clearBtn = panel.querySelector('#gherkin-clear');
    if (clearBtn) clearBtn.onclick = clearLog;

    // Torna o painel movível
    makePanelDraggable(panel);
}

function exportSelectedFeatures(selectedIdxs) {
    function slugify(text) {
        return text.toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    }

    // 1. environment.py
    const environmentPy = `"""
Arquivo de configuração do Behave para setup e teardown do Selenium WebDriver.
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def before_all(context):
    \"\"\"Inicializa o navegador antes de todos os testes.\"\"\"
    chrome_options = Options()
    chrome_options.add_argument('--start-maximized')
    # chrome_options.add_argument('--headless')  # Descomente para rodar sem interface gráfica
    context.browser = webdriver.Chrome(options=chrome_options)
    context.browser.implicitly_wait(10)

def after_all(context):
    \"\"\"Encerra o navegador após todos os testes.\"\"\"
    if hasattr(context, 'browser'):
        context.browser.quit()
`;
    downloadFile('environment.py', environmentPy);

    // 2. requirements.txt
    const requirements = `behave
selenium
webdriver-manager
`;
    downloadFile('requirements.txt', requirements);

    // 3. Para cada feature selecionada
    selectedIdxs.forEach(idx => {
        const feature = window.gherkinFeatures[idx];
        if (!feature) return;
        const featureSlug = slugify(feature.name);
        const className = featureSlug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');

        // .feature
        let featureFile = `# language: pt\n# Arquivo gerado automaticamente pela extensão\n\nFeature: ${feature.name}\n\n`;
        let stepsFile = `\"\"\"\nSteps Behave para a feature ${feature.name}.\nGerado automaticamente pela extensão.\n\"\"\"\nfrom behave import given, when, then\nfrom features.pages.${featureSlug}_pages import ${className}Page, ${className}Locators\n\ndef get_page(context):\n    \"\"\"Obtém ou inicializa o Page Object da feature.\"\"\"\n    if not hasattr(context, 'page') or not isinstance(context.page, ${className}Page):\n        context.page = ${className}Page(context.browser)\n    return context.page\n\n`;

        feature.cenarios.forEach(cenario => {
            featureFile += `  Scenario: ${cenario.name}\n`;
            cenario.interactions.forEach(interaction => {
                let decorator = '';
                let stepText = '';
                if (interaction.acao === 'acessa_url') {
                    decorator = `@given('que o usuário acessa {url}')`;
                    stepText = `Given que o usuário acessa ${interaction.nomeElemento}`;
                    stepsFile += `${decorator}\ndef step_acessa_url(context, url):\n    \"\"\"Acessa a URL informada.\"\"\"\n    page = get_page(context)\n    page.open(url)\n\n`;
                } else if (interaction.acao === 'clica') {
                    decorator = `@when('o usuário clica no {elemento}')`;
                    stepText = `When o usuário clica no ${interaction.nomeElemento}`;
                    stepsFile += `${decorator}\ndef step_clica_no_elemento(context, elemento):\n    \"\"\"Clica no elemento especificado.\"\"\"\n    page = get_page(context)\n    locator = getattr(${className}Locators, elemento.upper(), None)\n    assert locator, f'Locator não encontrado: {elemento}'\n    page.click_element(locator)\n\n`;
                } else if (interaction.acao === 'preenche') {
                    decorator = `@when('o usuário preenche no {elemento}')`;
                    stepText = `When o usuário preenche no ${interaction.nomeElemento}`;
                    stepsFile += `${decorator}\ndef step_preenche_no_elemento(context, elemento):\n    \"\"\"Preenche o campo especificado.\"\"\"\n    page = get_page(context)\n    locator = getattr(${className}Locators, elemento.upper(), None)\n    assert locator, f'Locator não encontrado: {elemento}'\n    page.fill_field(locator, 'VALOR_AQUI')\n\n`;
                } else if (interaction.acao === 'valida_existe') {
                    decorator = `@then('validar que existe no {elemento}')`;
                    stepText = `Then validar que existe no ${interaction.nomeElemento}`;
                    stepsFile += `${decorator}\ndef step_valida_existe(context, elemento):\n    \"\"\"Valida que o elemento existe na página.\"\"\"\n    page = get_page(context)\n    locator = getattr(${className}Locators, elemento.upper(), None)\n    assert page.element_exists(locator), f'Elemento não encontrado: {elemento}'\n\n`;
                } else {
                    decorator = `@${interaction.step.toLowerCase()}('${interaction.acaoTexto.toLowerCase()} no {elemento}')`;
                    stepText = `${interaction.step} ${interaction.acaoTexto.toLowerCase()} no ${interaction.nomeElemento}`;
                    stepsFile += `${decorator}\ndef step_${interaction.acao}_${slugify(interaction.nomeElemento)}(context, elemento):\n    \"\"\"Step gerado automaticamente.\"\"\"\n    pass\n\n`;
                }
                featureFile += `    ${stepText}\n`;
            });
            featureFile += '\n';
        });
        downloadFile(`${featureSlug}.feature`, featureFile);

        // _pages.py
        let locatorsClass = `\"\"\"\nLocators e Page Object para a feature ${feature.name}.\nGerado automaticamente pela extensão.\n\"\"\"\nfrom selenium.webdriver.common.by import By\n\nclass ${className}Locators:\n    \"\"\"Locators para elementos da página.\"\"\"\n`;
        let pageClass = `\nclass ${className}Page:\n    \"\"\"Page Object para a feature ${feature.name}.\"\"\"\n    def __init__(self, browser):\n        \"\"\"Inicializa a página com o navegador.\"\"\"\n        self.browser = browser\n\n`;
        const locators = {};
        feature.cenarios.forEach(cenario => {
            cenario.interactions.forEach(interaction => {
                if (interaction.cssSelector && interaction.cssSelector.length < 100) {
                    const locName = slugify(interaction.nomeElemento).toUpperCase();
                    if (!locators[locName]) {
                        locators[locName] = interaction.cssSelector;
                    }
                }
            });
        });
        Object.entries(locators).forEach(([name, selector]) => {
            locatorsClass += `    ${name} = (By.CSS_SELECTOR, '${selector}')\n`;
        });
        pageClass += `    def open(self, url):\n        \"\"\"Abre a URL especificada.\"\"\"\n        self.browser.get(url)\n\n`;
        pageClass += `    def click_element(self, locator):\n        \"\"\"Clica no elemento identificado pelo locator.\"\"\"\n        self.browser.find_element(*locator).click()\n\n`;
        pageClass += `    def fill_field(self, locator, value):\n        \"\"\"Preenche o campo identificado pelo locator com o valor fornecido.\"\"\"\n        el = self.browser.find_element(*locator)\n        el.clear()\n        el.send_keys(value)\n\n`;
        pageClass += `    def element_exists(self, locator):\n        \"\"\"Verifica se o elemento existe na página.\"\"\"\n        return len(self.browser.find_elements(*locator)) > 0\n\n`;
        downloadFile(`${featureSlug}_pages.py`, locatorsClass + '\\n' + pageClass);

        // _steps.py
        downloadFile(`${featureSlug}_steps.py`, stepsFile);
    });
    showFeedback('Exportação realizada com sucesso!');


    // Função utilitária para download de arquivos
    function downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace(/\//g, '_'); // Substitui barras para evitar problemas no nome do arquivo
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
}

// Verifica se `style` já foi definido para evitar duplicação
if (!window.gherkinStyle) {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    window.gherkinStyle = style; // Marca o estilo como já adicionado
}

// Função para exibir feedback visual aprimorado
function showFeedback(message, type = 'success') {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.position = 'fixed';
    feedback.style.bottom = '20px';
    feedback.style.left = '50%';
    feedback.style.transform = 'translateX(-50%)';
    feedback.style.padding = '10px 20px';
    feedback.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
    feedback.style.color = '#fff';
    feedback.style.borderRadius = '5px';
    feedback.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    feedback.style.zIndex = '10001';
    feedback.style.fontSize = '14px';
    feedback.style.fontWeight = 'bold';
    feedback.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    feedback.style.opacity = '1';
    feedback.style.animation = 'fadeInOut 3s ease';
    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

// Função para exportar logs no formato TXT
function exportLogs() {
    if (!window.interactions || window.interactions.length === 0) {
        showFeedback('Nenhuma interação registrada.', 'error');
        return;
    }

    let content = 'Cenários Gerados:\n\n';
    content += 'Dado que o usuário está na página inicial\n';

    window.interactions.forEach((interaction, index) => {
        const step = index === 0 ? 'Quando' : 'Então';
        content += `${step} o usuário clica no elemento com:\n`;
        content += `  CSS: ${interaction.cssSelector}\n`;
        content += `  XPath: ${interaction.xpath}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interactions.txt';
    a.click();

    showFeedback('Exportação realizada com sucesso!');
}

// Função para registrar interações no armazenamento local
function saveInteractionsToStorage() {
    chrome.storage.local.set({ interactions: window.interactions }, () => {
        console.log('Interações salvas no armazenamento local.');
    });
}

// Função para inicializar eventos nos botões
function initializeButtonEvents() {
    const pauseButton = document.getElementById('gherkin-pause');
    const exportButton = document.getElementById('gherkin-export');
    const clearButton = document.getElementById('gherkin-clear');
    const minimizeButton = document.getElementById('gherkin-minimize');
    const reopenButton = document.getElementById('gherkin-reopen');
    const closeButton = document.getElementById('gherkin-close');

    if (pauseButton) {
        pauseButton.addEventListener('click', togglePause);
    }

    if (exportButton) {
        exportButton.addEventListener('click', exportLogs);
    }

    if (clearButton) {
        clearButton.addEventListener('click', clearLog);
    }

    if (minimizeButton) {
        minimizeButton.addEventListener('click', () => {
            const panel = document.getElementById('gherkin-panel');
            if (panel) toggleMinimizePanel(panel);
        });
    }

    if (reopenButton) {
        reopenButton.addEventListener('click', () => {
            const panel = document.getElementById('gherkin-panel');
            if (panel) toggleMinimizePanel(panel);
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            const panel = document.getElementById('gherkin-panel');
            if (panel) {
                panel.style.opacity = '0';
                setTimeout(() => panel.remove(), 300);
                window.panel = null; // Remove a referência global ao painel
            }
        });
    }
}

// Função para limpar o cache, zerar o contador e redefinir interações
function resetExtensionState() {
    chrome.storage.local.clear(() => {
        console.log('Cache limpo com sucesso.');
    });

    const log = document.getElementById('gherkin-log');
    if (log) {
        log.innerHTML = '<p>Clique para capturar um elemento XPATH.</p>';
    }

    window.interactions = []; // Zera as interações registradas
    window.elapsedSeconds = 0; // Zera o contador de tempo

    const timerElement = document.getElementById('gherkin-timer');
    if (timerElement) {
        timerElement.textContent = 'Tempo de execução: 00:00';
    }

    // Garante que o intervalo do timer seja limpo antes de iniciar novamente
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
        window.timerInterval = null;
    }
}

// Funções de timer
function startTimer() {
    const timerElement = document.getElementById('gherkin-timer');
    if (!timerElement) return;

    // Garante que o intervalo do timer seja limpo antes de iniciar
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
    }

    window.elapsedSeconds = 0; // Reinicia o contador de segundos
    window.timerInterval = setInterval(() => {
        if (!window.isPaused) {
            window.elapsedSeconds++;
            const minutes = Math.floor(window.elapsedSeconds / 60);
            const remainingSeconds = window.elapsedSeconds % 60;
            timerElement.textContent = `Tempo de execução: ${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
        }
    }, 1000);
}

// Verifica se o painel já existe para reutilizá-lo
if (!window.panel) {
    const panel = createPanel();

    // Torna o painel movível apenas pelo cabeçalho
    makePanelDraggable(panel);

    // Atualiza os botões ao abrir o painel
    updatePanelButtons(panel, false);

    // Inicializa os eventos dos botões
    initializeButtonEvents();

    // Aplica o tema salvo
    applySavedTheme();

    // Limpa o cache, zera o contador e redefine o estado ao abrir o painel
    resetExtensionState();

    // Inicia o timer automaticamente
    startTimer();

    window.panel = panel; // Armazena a referência global ao painel
} else {
    // Se o painel já existir, redefine o estado e reinicia o timer
    resetExtensionState();
    startTimer();
}

// Registro de interações com debounce
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function getCSSSelector(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

    function buildSelector(el) {
        let selector = el.tagName.toLowerCase();

        // Adiciona o ID, se disponível
        if (el.id) {
            selector += `#${el.id}`;
            return selector; // ID é único, não precisa de mais detalhes
        }

        // Adiciona as classes, se disponíveis
        if (el.className) {
            const classes = el.className
                .split(' ')
                .filter(cls => cls.trim() !== '')
                .map(cls => `.${cls}`)
                .join('');
            selector += classes;
        }

        // Adiciona atributos específicos para maior precisão
        const attributes = ['name', 'type', 'aria-label', 'data-pc-name'];
        attributes.forEach(attr => {
            if (el.hasAttribute(attr)) {
                selector += `[${attr}="${el.getAttribute(attr)}"]`;
            }
        });

        return selector;
    }

    // Gera o seletor apenas para o elemento clicado
    return buildSelector(element);
}

// Gera um XPath relativo robusto para o elemento, priorizando boas práticas
function getRobustXPath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

    // 1. Se tem ID único, use direto
    if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1) {
        return `//*[@id='${element.id}']`;
    }

    // 2. Procura atributos únicos e estáveis
    const attrs = ['data-testid', 'data-qa', 'name', 'aria-label', 'title'];
    for (const attr of attrs) {
        const val = element.getAttribute(attr);
        if (val && document.querySelectorAll(`[${attr}='${val}']`).length === 1) {
            return `//*[@${attr}='${val}']`;
        }
    }

    // 3. Caminho relativo a partir de ancestral com id/atributo único
    let path = '';
    let el = element;
    while (el && el.nodeType === Node.ELEMENT_NODE && el !== document.body) {
        let segment = el.tagName.toLowerCase();
        // Se tem atributo único, para aqui
        for (const attr of attrs) {
            const val = el.getAttribute(attr);
            if (val && document.querySelectorAll(`[${attr}='${val}']`).length === 1) {
                path = `//*[@${attr}='${val}']${path ? '/' + path : ''}`;
                return path;
            }
        }
        // Se não, adiciona posição entre irmãos do mesmo tipo
        const siblings = Array.from(el.parentNode.children).filter(e => e.tagName === el.tagName);
        if (siblings.length > 1) {
            const idx = siblings.indexOf(el) + 1;
            segment += `[${idx}]`;
        }
        path = path ? `${segment}/${path}` : segment;
        el = el.parentNode;
    }
    return '//' + path;
}

function isExtensionContextValid() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
}

// Registro de cliques
// Controle para evitar múltiplos logs para a mesma ação
if (typeof window.lastInputTarget === 'undefined') window.lastInputTarget = null;
if (typeof window.inputDebounceTimeout === 'undefined') window.inputDebounceTimeout = null;
if (typeof window.lastInputValue === 'undefined') window.lastInputValue = '';

// Captura clique único
document.addEventListener('click', (event) => {
    if (!window.isRecording || window.isPaused) return;
    try {
        if (!isExtensionContextValid()) return;
        if (
            !event.target ||
            event.target.closest('#gherkin-panel') ||
            event.target.closest('#gherkin-modal') ||
            event.target.closest('.gherkin-content')
        ) return;

        // Se for input, não registra aqui (será tratado no input)
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) return;

        // Clique normal
        const cssSelector = getCSSSelector(event.target);
        const xpath = getRobustXPath(event.target);
        let nomeElemento = (event.target.innerText || event.target.value || event.target.getAttribute('aria-label') || event.target.getAttribute('name') || event.target.tagName).trim();
        if (!nomeElemento) nomeElemento = event.target.tagName;
        const actionSelect = document.getElementById('gherkin-action-select');
        let acao = actionSelect ? actionSelect.options[actionSelect.selectedIndex].text : 'Clicar';
        let acaoValue = actionSelect ? actionSelect.value : 'clica';

        // Parâmetros extras para ações específicas
        let interactionParams = {};
        if (acaoValue === 'espera_segundos') {
            const waitInput = document.getElementById('gherkin-wait-seconds');
            let tempoEspera = 1;
            if (waitInput && waitInput.value) {
                tempoEspera = parseInt(waitInput.value, 10);
                if (isNaN(tempoEspera) || tempoEspera < 1) tempoEspera = 1;
            }
            interactionParams.tempoEspera = tempoEspera;
        }

        // Evita duplicidade: só registra se não for igual à última interação
        const last = window.interactions[window.interactions.length - 1];
        let isDuplicate = last && last.acao === acaoValue && last.cssSelector === cssSelector && last.nomeElemento === nomeElemento;
        if (acaoValue === 'espera_segundos' && last && last.tempoEspera !== undefined) {
            isDuplicate = isDuplicate && last.tempoEspera === interactionParams.tempoEspera;
        }
        if (isDuplicate) return;

        // Passo BDD
        let step = 'Then';
        let offset = 0;
        if (window.interactions.length > 0 && window.interactions[0].acao === 'acessa_url') offset = 1;
        if (window.interactions.length === 0) step = 'Given';
        else if (window.interactions.length === 1 && offset === 0) step = 'When';
        else if (window.interactions.length === 1 && offset === 1) step = 'When';
        else if (window.interactions.length === 2 && offset === 1) step = 'Then';

        window.givenAcessaUrlAdded = false;
        window.interactions.push({ step, acao: acaoValue, acaoTexto: acao, nomeElemento, cssSelector, xpath, timestamp: Date.now(), ...interactionParams });
        renderLogWithActions();
        saveInteractionsToStorage();
    } catch (error) { console.error('Erro ao registrar clique:', error); }
});

// Captura preenchimento de input (debounced)
function handleInputEvent(event) {
    if (!window.isRecording || window.isPaused) return;
    if (!event.target || !(event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable)) return;
    if (event.target.closest('#gherkin-panel') || event.target.closest('#gherkin-modal') || event.target.closest('.gherkin-content')) return;

    window.lastInputTarget = event.target;
    window.lastInputValue = event.target.value;
    if (window.inputDebounceTimeout) clearTimeout(window.inputDebounceTimeout);
    window.inputDebounceTimeout = setTimeout(() => {
        // Só registra se valor mudou e não for vazio
        if (!window.lastInputTarget) return;
        const value = window.lastInputTarget.value;
        if (value === '' || value === undefined) return;

        const cssSelector = getCSSSelector(window.lastInputTarget);
        const xpath = getRobustXPath(window.lastInputTarget);
        let nomeElemento = (window.lastInputTarget.getAttribute('aria-label') || window.lastInputTarget.getAttribute('name') || window.lastInputTarget.id || window.lastInputTarget.className || window.lastInputTarget.tagName).toString().trim();
        if (!nomeElemento) nomeElemento = window.lastInputTarget.tagName;
        const actionSelect = document.getElementById('gherkin-action-select');
        let acao = 'Preencher';
        let acaoValue = 'preenche';

        // Evita duplicidade: só registra se não for igual à última interação
        const last = window.interactions[window.interactions.length - 1];
        if (last && last.acao === acaoValue && last.cssSelector === cssSelector && last.nomeElemento === nomeElemento && last.valorPreenchido === value) return;

        // Passo BDD
        let step = 'Then';
        let offset = 0;
        if (window.interactions.length > 0 && window.interactions[0].acao === 'acessa_url') offset = 1;
        if (window.interactions.length === 0) step = 'Given';
        else if (window.interactions.length === 1 && offset === 0) step = 'When';
        else if (window.interactions.length === 1 && offset === 1) step = 'When';
        else if (window.interactions.length === 2 && offset === 1) step = 'Then';

        window.givenAcessaUrlAdded = false;
        window.interactions.push({ step, acao: acaoValue, acaoTexto: acao, nomeElemento, cssSelector, xpath, valorPreenchido: value, timestamp: Date.now() });
        renderLogWithActions();
        saveInteractionsToStorage();
        window.lastInputTarget = null;
    }, 700); // Aguarda 700ms após o último input
}

document.addEventListener('input', handleInputEvent, true);
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
        editBtn.onmouseover = () => editBtn.style.background = '#f1f1f1';
        editBtn.onmouseout = () => editBtn.style.background = 'none';
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


// Atualiza o log ao renderizar o painel em modo gravação
if (typeof renderPanelContent !== 'undefined') {
    const originalRenderPanelContent = renderPanelContent;
    renderPanelContent = function(panel) {
        originalRenderPanelContent(panel);
        if (window.gherkinPanelState === 'gravando') {
            setTimeout(renderLogWithActions, 10);
        }
    };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'keepAlive') {
        console.log('Recebida mensagem para manter o Service Worker ativo.');
        sendResponse({ status: 'alive' });
    }
});
