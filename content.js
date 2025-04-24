if (!window.interactions) {
    var interactions = [];
}

if (!window.isRecording) {
    var isRecording = true; // Sempre "Executando"
}

// Usa window.timerInterval para evitar redefinição
if (!window.timerInterval) {
    window.timerInterval = null;
}

let isPaused = false; // Estado para controlar pausa e continuação
let elapsedSeconds = 0; // Armazena o tempo decorrido

function togglePause() {
    const pauseButton = document.getElementById('gherkin-pause');
    isPaused = !isPaused;

    if (isPaused) {
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

// Torna o painel movível apenas ao clicar no cabeçalho
function makePanelDraggable(panel) {
    let isDragging = false;
    let offsetX, offsetY;

    const header = panel.querySelector('h3'); // Seleciona o cabeçalho do painel
    header.style.cursor = 'move'; // Define o cursor de movimentação no cabeçalho

    header.addEventListener('mousedown', (event) => {
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
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            panel.style.cursor = 'default';
        }
    });
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
    const isMinimized = panel.classList.toggle('minimized');

    if (isMinimized) {
        content.style.display = 'none';
        header.style.fontSize = '12px';
        header.style.textAlign = 'center';
        footer.style.display = 'none';
        panel.style.height = '50px';
        panel.style.width = '200px';
    } else {
        content.style.display = 'block';
        header.style.fontSize = '16px';
        footer.style.display = 'block';
        panel.style.height = '600px';
        panel.style.width = '400px';
    }

    updatePanelButtons(panel, isMinimized);
}

// Função para criar o painel com melhorias visuais
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
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0; font-size: 18px; color: #007bff; font-weight: bold; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);">GERADOR DE XPATH E CSS</h3>
            <div class="button-container" style="display: flex; gap: 5px;">
                <button id="gherkin-minimize" title="Minimizar" style="background-color: transparent; border: none; cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffc107" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
                </button>
                <button id="gherkin-reopen" title="Reabrir" style="display: none; background-color: transparent; border: none; cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#28a745" viewBox="0 0 24 24"><path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zm0-2c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-1-10h2v6h-2v-6zm0-4h2v2h-2v-2z"/></svg>
                </button>
                <button id="gherkin-close" title="Fechar" style="background-color: transparent; border: none; cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#dc3545" viewBox="0 0 24 24"><path d="M18.3 5.71L12 12l6.3 6.29-1.42 1.42L12 13.41l-6.29 6.3-1.42-1.42L10.59 12 4.29 5.71 5.71 4.29 12 10.59l6.29-6.3z"/></svg>
                </button>
            </div>
        </div>
        <div class="gherkin-content">
            <p id="gherkin-status" style="font-size: 14px; margin: 5px 0; color: #555;">Status: Gravando</p>
            <div id="recording-indicator" style="display: none; margin: 10px auto; width: 10px; height: 10px; background-color: #ff0000; border-radius: 50%; animation: pulse 1s infinite;"></div>
            <p id="gherkin-timer" style="font-size: 14px; margin: 5px 0; color: #555;">Tempo de execução: 00:00</p>
            <div id="gherkin-log" style="overflow-y: auto; max-height: 370px; margin-top: 10px; border: 1px solid #ccc; padding: 5px; font-size: 12px; background-color: #f9f9f9;">
                <p>Clique para capturar um elemento XPATH.</p>
            </div>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button id="gherkin-export" style="background-color: #007bff; color: white; border: none; border-radius: 5px; padding: 5px 10px; cursor: pointer; flex: 1;">Exportar</button>
                <button id="gherkin-pause" style="background-color: #ffc107; color: white; border: none; border-radius: 5px; padding: 5px 10px; cursor: pointer; flex: 1;">Pausar</button>
            </div>
        </div>
        <p id="gherkin-footer" style="position: absolute; bottom: 10px; left: 10px; font-size: 10px; margin: 0; color: #555;">By: Matheus Ferreira de Oliveira</p>
    `;
    document.body.appendChild(panel);
    return panel;
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

// Adiciona animação de pulso para o indicador de gravação
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

// Função para exportar logs no formato selecionado
function exportLogs() {
    const format = document.getElementById('gherkin-export-format').value;
    chrome.storage.local.get('interactions', (data) => {
        const interactions = data.interactions || [];
        if (interactions.length === 0) {
            showFeedback('Nenhuma interação registrada.', 'error');
            return;
        }

        let content = '';
        if (format === 'txt') {
            content = 'Cenários Gerados:\n\n';
            content += 'Dado que o usuário está na página inicial\n';
            interactions.forEach((interaction, index) => {
                const step = index === 0 ? 'Quando' : 'Então';
                content += `${step} o usuário clica no elemento com:\n`;
                content += `  CSS: ${interaction.cssSelector}\n`;
                content += `  XPath: ${interaction.xpath}\n`;
            });
        } else if (format === 'json') {
            content = JSON.stringify(interactions, null, 2);
        } else if (format === 'features') {
            content = 'Feature: Interações do usuário\n\n';
            content += '  Scenario: Registro de interações\n';
            content += '    Given o usuário está na página inicial\n';
            interactions.forEach((interaction, index) => {
                const step = index === 0 ? 'When' : 'Then';
                content += `    ${step} o usuário clica no elemento com:\n`;
                content += `      CSS: ${interaction.cssSelector}\n`;
                content += `      XPath: ${interaction.xpath}\n`;
            });
        } else {
            showFeedback('Formato inválido selecionado.', 'error');
            return;
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs.${format}`;
        a.click();

        showFeedback('Exportação realizada com sucesso!');
    });
}

// Função para registrar interações no armazenamento local
function saveInteractionsToStorage() {
    chrome.storage.local.set({ interactions }, () => {
        console.log('Interações salvas no armazenamento local.');
    });
}

// Verifica se o painel já existe para reutilizá-lo
if (!window.panel) {
    const panel = createPanel();

    // Torna o painel movível apenas pelo cabeçalho
    makePanelDraggable(panel);

    // Atualiza os botões ao abrir o painel
    updatePanelButtons(panel, false);

    // Adiciona evento para minimizar o painel
    document.getElementById('gherkin-minimize').addEventListener('click', () => {
        toggleMinimizePanel(panel);
    });

    // Adiciona evento para reabrir o painel
    document.getElementById('gherkin-reopen').addEventListener('click', () => {
        toggleMinimizePanel(panel);
    });

    // Adiciona evento para fechar o painel
    document.getElementById('gherkin-close').addEventListener('click', () => {
        panel.style.opacity = '0';
        setTimeout(() => panel.remove(), 300);
    });

    // Adiciona evento para exportar logs
    document.getElementById('gherkin-export').addEventListener('click', exportLogs);

    // Adiciona evento ao botão "Pausar/Continuar"
    document.getElementById('gherkin-pause').addEventListener('click', togglePause);

    // Aplica o tema salvo
    applySavedTheme();

    // Inicia o timer automaticamente
    startTimer();
}

// Funções de timer
function startTimer() {
    const timerElement = document.getElementById('gherkin-timer');

    window.timerInterval = setInterval(() => {
        if (!isPaused) {
            elapsedSeconds++;
            const minutes = Math.floor(elapsedSeconds / 60);
            const remainingSeconds = elapsedSeconds % 60;
            timerElement.textContent = `Tempo de execução: ${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(window.timerInterval);
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

document.addEventListener('click', (event) => {
    if (!isRecording || isPaused) return; // Ignora cliques se estiver pausado

    try {
        // Verifica se o contexto da extensão está válido
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
            console.warn('Erro: Contexto da extensão inválido. Ignorando clique.');
            return;
        }

        // Verifica se o elemento clicado é válido
        if (!event.target) {
            console.warn('Erro: Elemento clicado é inválido ou nulo.');
            return;
        }

        if (event.target.closest('#gherkin-panel')) {
            console.log('Clique ignorado: ocorreu dentro do painel da extensão.');
            return;
        }

        const cssSelector = getCSSSelector(event.target);
        const xpath = getAttributeBasedXPath(event.target);

        console.log('Clique registrado:', { cssSelector, xpath });
        interactions.push({ action: 'click', cssSelector, xpath, timestamp: Date.now() });

        const log = document.getElementById('gherkin-log');

        // Verifica se o elemento de log existe antes de tentar usá-lo
        if (!log) {
            console.error('Erro: Elemento de log não encontrado no DOM.');
            return;
        }

        // Adiciona o log para o clique atual
        const logEntry = document.createElement('div');
        logEntry.style.marginBottom = '10px';
        logEntry.style.padding = '10px';
        logEntry.style.border = '1px solid #ccc';
        logEntry.style.borderRadius = '5px';
        logEntry.style.backgroundColor = '#f9f9f9';

        const cssText = document.createElement('p');
        cssText.textContent = `CSS: ${cssSelector}`;
        cssText.style.color = '#0D47A1'; // Azul escuro para contraste
        cssText.style.fontWeight = 'bold';

        const xpathText = document.createElement('p');
        xpathText.textContent = `XPath: ${xpath}`;
        xpathText.style.color = '#1B5E20'; // Verde escuro para contraste
        xpathText.style.fontWeight = 'bold';

        logEntry.appendChild(cssText);
        logEntry.appendChild(xpathText);
        log.appendChild(logEntry);

        // Rola automaticamente para o final do log
        log.scrollTop = log.scrollHeight;

        // Salva as interações no armazenamento local
        saveInteractionsToStorage();

        chrome.runtime.sendMessage({ action: 'interactionRegistered', interaction: { cssSelector, xpath } });
    } catch (error) {
        console.error('Erro ao registrar clique:', error);
    }
});
