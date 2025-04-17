if (!window.interactions) {
    var interactions = [];
}

if (!window.isRecording) {
    var isRecording = false;
}

// Usa window.timerInterval para evitar redefinição
if (!window.timerInterval) {
    window.timerInterval = null;
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

// Verifica se o painel já existe para reutilizá-lo
if (!window.panel) {
    let panel = document.getElementById('gherkin-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'gherkin-panel';
        panel.className = 'gherkin-panel'; // Adiciona uma classe para aplicar o estilo
        panel.style.position = 'fixed'; // Alterado para fixar o painel na tela
        panel.style.top = '10px';
        panel.style.left = '10px'; // Alterado para iniciar no canto superior esquerdo
        panel.style.width = '400px'; // Aumenta a largura padrão
        panel.style.height = '600px'; // Aumenta a altura padrão
        panel.style.backgroundColor = '#ffffff';
        panel.style.border = '1px solid #ccc';
        panel.style.borderRadius = '8px';
        panel.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        panel.style.padding = '10px';
        panel.style.zIndex = '10000';
        panel.style.fontFamily = 'Roboto, Arial, sans-serif';
        panel.style.transition = 'opacity 0.3s ease, border-color 0.3s ease';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Painel Gherkin Generator');
        panel.innerHTML = `
            <h3 style="margin: 0; font-size: 16px; color: #007bff;">Gherkin Generator</h3>
            <button id="gherkin-close" style="position: absolute; top: 5px; right: 5px; background: none; border: none; font-size: 16px; cursor: pointer;" aria-label="Fechar painel">×</button>
            <p id="gherkin-status" style="font-size: 14px; margin: 5px 0;">Status: Inativo</p>
            <p id="gherkin-timer" style="font-size: 14px; margin: 5px 0;">Tempo de execução: 00:00</p>
            <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <button id="gherkin-play" style="flex: 1; margin-right: 5px;" aria-label="Iniciar gravação">Play</button>
                <button id="gherkin-pause" style="flex: 1; margin-right: 5px;" disabled aria-label="Pausar gravação">Pause</button>
                <button id="gherkin-finalize" style="flex: 1;" disabled aria-label="Finalizar gravação">Finalizar</button>
            </div>
            <div style="margin-top: 10px;">
                <label for="gherkin-export-format">Escolha o formato de exportação:</label>
                <select id="gherkin-export-format" style="width: 50%; margin-top: 5px;" aria-label="Formato de exportação">
                    <option value="txt">TXT</option>
                    <option value="json">JSON</option>
                    <option value="features">FEATURES</option>
                </select>
            </div>
            <button id="gherkin-export" style="width: 100%; margin-top: 10px;" disabled aria-label="Exportar cenários">Exportar</button>
            <div id="gherkin-log" style="overflow-y: auto; max-height: 380px; margin-top: 10px; border: 1px solid #ccc; padding: 5px; font-size: 12px; background-color: #f9f9f9;">
                <p>Nenhuma interação registrada ainda.</p>
            </div>
        `;
        document.body.appendChild(panel);

        // Torna o painel movível apenas pelo cabeçalho
        makePanelDraggable(panel);

        // Adiciona eventos aos botões
        document.getElementById('gherkin-play').addEventListener('click', () => {
            if (!chrome.runtime) {
                console.error('Contexto da extensão inválido.');
                return;
            }
            isRecording = true;
            interactions = [];
            document.getElementById('gherkin-status').textContent = 'Status: Gravando';
            document.getElementById('gherkin-play').disabled = true;
            document.getElementById('gherkin-pause').disabled = false;
            document.getElementById('gherkin-finalize').disabled = false;
            panel.style.borderColor = '#007bff'; // Indicador visual de gravação
            startTimer();
        });

        document.getElementById('gherkin-pause').addEventListener('click', () => {
            if (!chrome.runtime) {
                console.error('Contexto da extensão inválido.');
                return;
            }
            isRecording = false;
            document.getElementById('gherkin-status').textContent = 'Status: Pausado';
            document.getElementById('gherkin-play').disabled = false;
            document.getElementById('gherkin-pause').disabled = true;
            panel.style.borderColor = '#ccc'; // Indicador visual de pausa
            stopTimer();
        });

        document.getElementById('gherkin-finalize').addEventListener('click', () => {
            if (!chrome.runtime) {
                console.error('Contexto da extensão inválido.');
                return;
            }
            isRecording = false;
            document.getElementById('gherkin-status').textContent = 'Status: Finalizado';
            document.getElementById('gherkin-play').disabled = false;
            document.getElementById('gherkin-pause').disabled = true;
            document.getElementById('gherkin-finalize').disabled = true;
            panel.style.borderColor = '#28a745'; // Indicador visual de finalização
            stopTimer();
            chrome.storage.local.set({ interactions }, () => {
                document.getElementById('gherkin-export').disabled = false;
            });
        });

        document.getElementById('gherkin-export').addEventListener('click', () => {
            if (!chrome.runtime) {
                console.error('Contexto da extensão inválido.');
                return;
            }
            chrome.storage.local.get('interactions', (data) => {
                const interactions = data.interactions || [];
                if (interactions.length === 0) {
                    alert('Nenhuma interação registrada.');
                    return;
                }

                const format = document.getElementById('gherkin-export-format').value;
                let content = '';
                if (format === 'txt') {
                    content = 'Cenários Gerados:\n\n';
                    content += 'Dado que o usuário está na página inicial\n';
                    interactions.forEach((interaction, index) => {
                        const step = index === 0 ? 'Quando' : 'Então';
                        content += `${step} o usuário clica em ${interaction.cssSelector} (${interaction.xpath})\n`;
                    });
                } else if (format === 'json') {
                    content = JSON.stringify(interactions, null, 2);
                } else if (format === 'features') {
                    content = 'Feature: Interações do usuário\n\n';
                    content += '  Scenario: Registro de interações\n';
                    content += '    Given o usuário está na página inicial\n';
                    interactions.forEach((interaction, index) => {
                        const step = index === 0 ? 'When' : 'Then';
                        content += `    ${step} o usuário clica em ${interaction.cssSelector} (${interaction.xpath})\n`;
                    });
                }

                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `scenarios.${format}`;
                a.click();

                // Indicador visual de exportação concluída
                panel.style.borderColor = '#ffc107';
                setTimeout(() => panel.style.borderColor = '#ccc', 2000);
            });
        });

        document.getElementById('gherkin-close').addEventListener('click', () => {
            panel.style.opacity = '0';
            setTimeout(() => panel.remove(), 300);
        });
    }

    // Armazena o painel na variável global
    window.panel = panel;
}

// Funções de timer
function startTimer() {
    const timerElement = document.getElementById('gherkin-timer');
    let seconds = 0;

    window.timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timerElement.textContent = `Tempo de execução: ${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(window.timerInterval);
    document.getElementById('gherkin-timer').textContent = 'Tempo de execução: 00:00';
}

// Registro de interações com debounce
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function getRelativeXPath(element) {
    const parts = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let index = 1;
        let sibling = element.previousElementSibling;
        while (sibling) {
            if (sibling.nodeName === element.nodeName) {
                index++;
            }
            sibling = sibling.previousElementSibling;
        }
        const tagName = element.nodeName.toLowerCase();
        const pathIndex = index > 1 ? `[${index}]` : '';
        parts.unshift(`${tagName}${pathIndex}`);
        element = element.parentNode;
    }
    return parts.length ? `./${parts.join('/')}` : null;
}

function getXPath(element, maxAncestors = 3) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

    const attributes = ['id', 'class', 'data-pc-section', 'data-pc-name', 'routerlink'];

    // Função auxiliar para construir condições baseadas nos atributos
    function buildConditions(el, maxConditions = 3) {
        const conditions = [];
        for (const attr of attributes) {
            if (el.hasAttribute(attr)) {
                const value = el.getAttribute(attr);
                if (attr === 'class') {
                    // Para classes, usa contains para lidar com múltiplas classes
                    const classes = value.split(' ').filter(Boolean);
                    classes.forEach(cls => {
                        if (conditions.length < maxConditions) {
                            conditions.push(`contains(@class, '${cls}')`);
                        }
                    });
                } else if (conditions.length < maxConditions) {
                    conditions.push(`@${attr}='${value}'`);
                }
            }
        }
        return conditions;
    }

    // Constrói o XPATH para o elemento atual
    const conditions = buildConditions(element, 3); // Limita a 3 identificadores do último elemento

    // Adiciona o texto do elemento, se disponível
    const textContent = element.textContent.trim();
    if (textContent) {
        conditions.push(`normalize-space(text())='${textContent}'`);
    }

    let xpath = element.tagName.toLowerCase();
    if (conditions.length > 0) {
        xpath += `[${conditions.join(' and ')}]`;
    }

    // Adiciona identificadores de elementos ancestrais, limitando o número de ancestrais
    let parent = element.parentElement;
    let ancestorCount = 0;
    while (parent && ancestorCount < maxAncestors) {
        const parentConditions = buildConditions(parent, 1); // Limita a 1 identificador por ancestral
        if (parentConditions.length > 0) {
            xpath = `${parent.tagName.toLowerCase()}[${parentConditions.join(' and ')}]/${xpath}`;
        }
        parent = parent.parentElement;
        ancestorCount++;
    }

    return `//${xpath}`;
}

document.addEventListener('click', (event) => {
    if (!isRecording) return;

    if (event.target.closest('#gherkin-panel')) {
        console.log('Clique ignorado: ocorreu dentro do painel da extensão.');
        return;
    }

    const xpath = getXPath(event.target);

    // Verifica se o último log registrado é igual ao atual para evitar duplicação
    const log = document.getElementById('gherkin-log');
    const lastLog = log.lastElementChild;
    if (lastLog && lastLog.textContent === `Usuário clicou no XPATH ${xpath}`) {
        return;
    }

    console.log('Clique registrado:', { xpath });
    interactions.push({ action: 'click', xpath, timestamp: Date.now() });

    // Adiciona o log para o clique atual
    const logEntryXpath = document.createElement('p');
    logEntryXpath.textContent = `Usuário clicou no XPATH ${xpath}`;
    logEntryXpath.style.color = '#EE9A00'; // Cor laranja
    logEntryXpath.style.fontWeight = 'bold'; // Negrito
    log.appendChild(logEntryXpath);

    // Rola automaticamente para o final do log
    log.scrollTop = log.scrollHeight;

    chrome.runtime.sendMessage({ action: 'interactionRegistered', interaction: { xpath } });
});

document.addEventListener('scroll', debounce(() => {
    if (!isRecording) return;

    const timestamp = Date.now();
    if (interactions.some(i => i.action === 'scroll' && timestamp - i.timestamp < 1000)) {
        console.log('Rolagem ignorada: duplicada.');
        return;
    }

    console.log('Rolagem registrada.');
    interactions.push({ action: 'scroll', timestamp });
}, 200));

document.addEventListener('keydown', debounce((event) => {
    if (!isRecording) return;

    if (interactions.some(i => i.action === 'keydown' && i.key === event.key)) {
        console.log('Tecla ignorada: duplicada.');
        return;
    }

    console.log('Tecla pressionada:', event.key);
    interactions.push({ action: 'keydown', key: event.key, timestamp: Date.now() });
}, 200));

window.addEventListener('focus', () => {
    if (isRecording) {
        console.log('Janela voltou ao foco. Gravação continua ativa.');
    }
});
