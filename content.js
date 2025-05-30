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
    const buttonContainer = panel.querySelector('.button-container');

    if (isMinimized) {
        minimizeButton.style.display = 'none'; // Oculta o botão Minimizar
        reopenButton.style.display = 'flex'; // Exibe o botão Reabrir
        closeButton.style.display = 'flex'; // Mantém o botão Fechar visível

        // Ajusta a ordem dos botões ao minimizar
        buttonContainer.style.flexDirection = 'row'; // Reabrir à esquerda, Fechar à direita
    } else {
        minimizeButton.style.display = 'flex'; // Exibe o botão Minimizar
        reopenButton.style.display = 'none'; // Oculta o botão Reabrir
        closeButton.style.display = 'flex'; // Mantém o botão Fechar visível

        // Ajusta a ordem dos botões ao abrir ou maximizar
        buttonContainer.style.flexDirection = 'row'; // Minimizar à esquerda, Fechar à direita
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
        const buttonContainer = panel.querySelector('.button-container');
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.alignItems = 'center';
        buttonContainer.style.gap = '5px';
    } else {
        content.style.display = 'block';
        header.style.display = 'block';
        footer.style.display = 'block';
        panel.style.height = '600px';
        panel.style.width = '400px';
        minimizeButton.style.display = 'flex'; // Exibe o botão Minimizar
        reopenButton.style.display = 'none'; // Oculta o botão Abrir
        closeButton.style.display = 'flex'; // Mantém o botão Fechar visível
        exportButton.style.display = 'flex'; // Exibe o botão Exportar
        pauseButton.style.display = 'flex'; // Exibe o botão Pausar
        clearButton.style.display = 'flex'; // Exibe o botão Limpar

        // Restaura o layout padrão dos botões
        const buttonContainer = panel.querySelector('.button-container');
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.alignItems = 'center';
        buttonContainer.style.gap = '5px';
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0; font-size: 18px; color: #007bff; font-weight: bold; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);">GERADOR DE XPATH E CSS</h3>
            <div class="button-container" style="display: flex; gap: 5px; justify-content: flex-end;">
                <button id="gherkin-minimize" title="Minimizar" style="background-color: transparent; border: none; cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffc107" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
                </button>
                <button id="gherkin-reopen" title="Reabrir" style="display: none; background-color: transparent; border: none; cursor: pointer; font-size: 14px; font-weight: bold; color: #28a745;">Abrir</button>
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
                <div id="gherkin-log" style="overflow-y: auto; height: 260px; margin-top: 10px; border: 1px solid #ccc; padding: 5px; font-size: 13px; background-color: #f9f9f9;"></div>
                <div style="display: flex; flex-wrap: nowrap; gap: 4px; margin-top: 10px; justify-content: center; align-items: center; width: 100%;">
                    <button id="end-cenario" style="background-color: #dc3545; color: white; border: none; border-radius: 4px; padding: 0; width: 60px; height: 32px; font-size: 12px; display: flex; align-items: center; justify-content: center;">Encerrar Cenário</button>
                    <button id="end-feature" style="background-color: #6c757d; color: white; border: none; border-radius: 4px; padding: 0; width: 60px; height: 32px; font-size: 12px; display: flex; align-items: center; justify-content: center;" disabled>Encerrar Feature</button>
                    <button id="gherkin-export" style="background-color: #007bff; color: white; border: none; border-radius: 4px; padding: 0; width: 60px; height: 32px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;">Exportar</button>
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
    html += `<p id="gherkin-footer" style="position: absolute; bottom: -20px; right: 10px; font-size: 10px; margin: 0; color: #555;">By: Matheus Ferreira de Oliveira</p>`;
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
    panel.style.width = '400px';
    panel.style.height = '600px';
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

// Função para exportar features selecionadas em formato Behave/Selenium
function exportSelectedFeatures(selectedIdxs) {
    function slugify(text) {
        return text.toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    }

    selectedIdxs.forEach(idx => {
        const feature = window.gherkinFeatures[idx];
        if (!feature) return;
        const featureSlug = slugify(feature.name);
        const base = `features/`;

        // Arquivo .feature
        let featureFile = `Feature: ${feature.name}\n\n`;
        feature.cenarios.forEach(cenario => {
            featureFile += `  Scenario: ${cenario.name}\n`;
            cenario.interactions.forEach(interaction => {
                if (interaction.acao === 'acessa_url') {
                    featureFile += `    Given que o usuário acessa ${interaction.nomeElemento}\n`;
                } else {
                    featureFile += `    ${interaction.step} ${interaction.acaoTexto.toLowerCase()} no ${interaction.nomeElemento}\n`;
                }
            });
            featureFile += '\n';
        });
        downloadFile(`${base}${featureSlug}.feature`, featureFile);

        // Arquivo pages.py
        let className = featureSlug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
        let locatorsClass = `from selenium.webdriver.common.by import By\n\nclass ${className}Locators:\n`;
        let pageClass = `class ${className}Page:\n    def __init__(self, browser):\n        self.browser = browser\n\n`;
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
        pageClass += `    def open(self, url):\n        self.browser.get(url)\n\n`;
        pageClass += `    def click_element(self, locator):\n        self.browser.find_element(*locator).click()\n\n`;
        pageClass += `    def fill_field(self, locator, value):\n        el = self.browser.find_element(*locator)\n        el.clear()\n        el.send_keys(value)\n\n`;
        pageClass += `    def element_exists(self, locator):\n        return len(self.browser.find_elements(*locator)) > 0\n\n`;
        downloadFile(`${base}pages/${featureSlug}.pages.py`, locatorsClass + '\n' + pageClass);

        // Arquivo steps.py
        let stepsFile = `from behave import given, when, then\nfrom features.pages.${featureSlug} import ${className}Page, ${className}Locators\n\n`;
        stepsFile += `def get_page(context):\n    if not hasattr(context, 'page') or not isinstance(context.page, ${className}Page):\n        context.page = ${className}Page(context.browser)\n    return context.page\n\n`;
        stepsFile += `@given('que o usuário acessa {url}')\ndef step_acessa_url(context, url):\n    page = get_page(context)\n    page.open(url)\n\n`;
        stepsFile += `@when('o usuário clica no {elemento}')\ndef step_clica_no_elemento(context, elemento):\n    page = get_page(context)\n    locator = getattr(${className}Locators, elemento.upper(), None)\n    assert locator, f'Locator não encontrado: {elemento}'\n    page.click_element(locator)\n\n`;
        stepsFile += `@when('o usuário preenche no {elemento}')\ndef step_preenche_no_elemento(context, elemento):\n    page = get_page(context)\n    locator = getattr(${className}Locators, elemento.upper(), None)\n    assert locator, f'Locator não encontrado: {elemento}'\n    page.fill_field(locator, 'VALOR_AQUI')\n\n`;
        stepsFile += `@then('validar que existe no {elemento}')\ndef step_valida_existe(context, elemento):\n    page = get_page(context)\n    locator = getattr(${className}Locators, elemento.upper(), None)\n    assert page.element_exists(locator), f'Elemento não encontrado: {elemento}'\n\n`;
        downloadFile(`${base}steps/${featureSlug}.steps.py`, stepsFile);
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

function getAttributeBasedXPath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

    const prioritizedAttributes = ['label', 'aria-label', 'data-pc-name', 'class'];

    function buildXPath(el) {
        const conditions = [];

        for (const attr of prioritizedAttributes) {
            if (el.hasAttribute(attr)) {
                const value = el.getAttribute(attr).trim();
                if (value) {
                    if (attr === 'class') {
                        const classes = value.split(' ').map(cls => `contains(@class, '${cls}')`);
                        conditions.push(...classes);
                    } else {
                        conditions.push(`@${attr}="${value}"`);
                    }
                }
            }
        }

        let path = `//${el.tagName.toLowerCase()}`;
        if (conditions.length > 0) {
            path += `[${conditions.join(' and ')}]`;
        }

        return path;
    }

    // Verifica se o elemento possui um filho <span> com a classe 'p-button-label'
    if (element.tagName.toLowerCase() === 'button') {
        const labelSpan = element.querySelector('span.p-button-label');
        if (labelSpan && labelSpan.textContent.trim()) {
            return `//span[contains(@class, 'p-button-label') and text()='${labelSpan.textContent.trim()}']`;
        }
    }

    return buildXPath(element);
}

function isExtensionContextValid() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
}

// Registro de cliques
document.addEventListener('click', (event) => {
    if (!window.isRecording || window.isPaused) return; // Ignora cliques se estiver pausado


    try {
        if (!isExtensionContextValid()) {
            console.warn('Erro: Contexto da extensão inválido. Ignorando clique.');
            return;
        }

        // Ignora cliques dentro do painel da extensão, de qualquer modal ou da área de conteúdo do painel
        if (
            !event.target ||
            event.target.closest('#gherkin-panel') ||
            event.target.closest('#gherkin-modal') ||
            event.target.closest('.gherkin-content')
        ) {
            //console.log('Clique ignorado: ocorreu dentro do painel, modal ou conteúdo da extensão.');
            return;
        }

        const cssSelector = getCSSSelector(event.target);
        const xpath = getAttributeBasedXPath(event.target);
        // Extrai o texto do elemento clicado
        let nomeElemento = (event.target.innerText || event.target.value || event.target.getAttribute('aria-label') || event.target.getAttribute('name') || event.target.tagName).trim();
        if (!nomeElemento) nomeElemento = event.target.tagName;

        // Obtém a ação selecionada
        const actionSelect = document.getElementById('gherkin-action-select');
        let acao = actionSelect ? actionSelect.options[actionSelect.selectedIndex].text : 'Clicar';
        let acaoValue = actionSelect ? actionSelect.value : 'clica';


        // Define o passo BDD considerando o passo especial de acesso à URL
        let step = 'Then';
        let offset = 0;
        if (window.interactions.length > 0 && window.interactions[0].acao === 'acessa_url') {
            offset = 1;
        }
        if (window.interactions.length === 0) step = 'Given';
        else if (window.interactions.length === 1 && offset === 0) step = 'When';
        else if (window.interactions.length === 1 && offset === 1) step = 'When';
        else if (window.interactions.length === 2 && offset === 1) step = 'Then';

        // Monta a mensagem do log
        const mensagem = `${step} ${acao.toLowerCase()} no ${nomeElemento}`;


    // Reseta flag do passo Given de acesso à URL
    window.givenAcessaUrlAdded = false;

        // Salva interação
        window.interactions.push({ step, acao: acaoValue, acaoTexto: acao, nomeElemento, cssSelector, xpath, timestamp: Date.now() });

        // Atualiza o log com menu de ações
        renderLogWithActions();
        saveInteractionsToStorage();
// Função para renderizar o log com menu de ações
function renderLogWithActions() {
    const log = document.getElementById('gherkin-log');
    if (!log) return;
    log.innerHTML = '';
    if (!window.interactions || window.interactions.length === 0) {
        log.innerHTML = '<p>Clique para capturar um elemento XPATH.</p>';
        return;
    }
    window.interactions.forEach((interaction, idx) => {
        let mensagem = '';
        if (interaction.acao === 'acessa_url') {
            mensagem = `Given que o usuário acessa ${interaction.nomeElemento}`;
        } else {
            mensagem = `${interaction.step} ${interaction.acaoTexto.toLowerCase()} no ${interaction.nomeElemento}`;
        }
        const logEntry = document.createElement('div');
        logEntry.className = 'gherkin-log-entry';
        logEntry.style.marginBottom = '8px';
        logEntry.style.padding = '8px';
        logEntry.style.border = '1px solid #e3e3e3';
        logEntry.style.borderRadius = '5px';
        logEntry.style.backgroundColor = '#f1f8ff';
        logEntry.style.fontWeight = 'bold';
        logEntry.style.color = '#0D47A1';
        logEntry.style.display = 'flex';
        logEntry.style.justifyContent = 'space-between';
        logEntry.style.alignItems = 'center';
        // Mensagem
        const msgSpan = document.createElement('span');
        msgSpan.textContent = mensagem;
        logEntry.appendChild(msgSpan);
        // Botão/menu de ações
        const actionMenu = document.createElement('div');
        actionMenu.className = 'gherkin-action-menu';
        actionMenu.style.position = 'relative';
        actionMenu.style.marginLeft = '10px';
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
    const actionSelect = document.createElement('select');
    actionSelect.style.width = '100%';
    actionSelect.style.padding = '7px';
    actionSelect.style.borderRadius = '5px';
    actionSelect.style.border = '1px solid #ccc';
    actionSelect.style.fontSize = '14px';
    // Opções iguais ao painel
    actionSelect.innerHTML = document.getElementById('gherkin-action-select')?.innerHTML || '';
    actionSelect.value = interaction.acao;
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
        interaction.acao = actionSelect.value;
        interaction.acaoTexto = actionSelect.options[actionSelect.selectedIndex].text;
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
const originalRenderPanelContent = renderPanelContent;
renderPanelContent = function(panel) {
    originalRenderPanelContent(panel);
    if (window.gherkinPanelState === 'gravando') {
        setTimeout(renderLogWithActions, 10);
    }
};
    } catch (error) {
        console.error('Erro ao registrar clique:', error);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'keepAlive') {
        console.log('Recebida mensagem para manter o Service Worker ativo.');
        sendResponse({ status: 'alive' });
    }
});
