document.getElementById('export').addEventListener('click', () => {
    chrome.storage.local.get('interactions', (data) => {
        const interactions = data.interactions || [];
        if (interactions.length === 0) {
            alert('Nenhuma interacao registrada.');
            return;
        }

        // Obtém o formato selecionado no menu suspenso
        const format = document.getElementById('export-format').value;
        if (!['txt', 'json', 'features'].includes(format)) {
            alert('Formato inválido. Escolha entre txt, json ou features.');
            return;
        }

        let content = '';
        if (format === 'txt') {
            content = 'Cenarios Gerados:\n\n';
            content += 'Dado que o usuario esta na pagina inicial\n';
            interactions.forEach((interaction, index) => {
                const step = index === 0 ? 'Quando' : 'Entao';
                content += `${step} o usuario clica em ${interaction.cssSelector} (${interaction.xpath})\n`;
            });
        } else if (format === 'json') {
            content = JSON.stringify(interactions, null, 2);
        } else if (format === 'features') {
            content = 'Feature: Interacoes do usuario\n\n';
            content += '  Scenario: Registro de interacoes\n';
            content += '    Given o usuario esta na pagina inicial\n';
            interactions.forEach((interaction, index) => {
                const step = index === 0 ? 'When' : 'Then';
                content += `    ${step} o usuario clica em ${interaction.cssSelector} (${interaction.xpath})\n`;
            });
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scenarios.${format}`;
        a.click();
    });
});

document.getElementById('play').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
            alert('Nao e possivel registrar interacoes nesta pagina.');
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }, () => {
            if (chrome.runtime.lastError) {
                alert('Erro ao injetar o script: ' + chrome.runtime.lastError.message);
            } else {
                chrome.tabs.sendMessage(tab.id, { action: 'startRecording' }, (response) => {
                    if (chrome.runtime.lastError) {
                        alert('Erro ao iniciar o registro: ' + chrome.runtime.lastError.message);
                    } else if (response && response.status === 'recordingStarted') {
                        alert('Registro de interacoes iniciado.');
                        document.getElementById('play').disabled = true;
                        document.getElementById('pause').disabled = false;
                        document.getElementById('finalize').disabled = false;
                        document.getElementById('export').disabled = true;
                        document.getElementById('status').textContent = 'Status: Gravando';
                        startTimer();
                    } else {
                        alert('Erro desconhecido ao iniciar o registro.');
                    }
                });
            }
        });
    });
});

document.getElementById('pause').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'pauseRecording' }, (response) => {
            if (chrome.runtime.lastError) {
                alert('Erro ao pausar o registro: ' + chrome.runtime.lastError.message);
            } else {
                alert('Registro pausado.');
                document.getElementById('play').disabled = false;
                document.getElementById('pause').disabled = true;
            }
        });
    });
});

document.getElementById('finalize').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'finalizeRecording' }, (response) => {
            if (chrome.runtime.lastError) {
                alert('Erro ao finalizar o registro: ' + chrome.runtime.lastError.message);
            } else {
                chrome.storage.local.set({ interactions: response.interactions }, () => {
                    alert('Registro finalizado. Voce pode exportar os cenarios.');
                    document.getElementById('play').disabled = false;
                    document.getElementById('pause').disabled = true;
                    document.getElementById('finalize').disabled = true;
                    document.getElementById('export').disabled = false;
                    document.getElementById('status').textContent = 'Status: Finalizado';
                    stopTimer();

                    // Limpa interações após finalizar
                    chrome.storage.local.remove('interactions', () => {
                        console.log('Interacoes limpas do armazenamento.');
                    });
                });
            }
        });
    });
});

function exportScenarios() {
    if (!window.interactions || window.interactions.length === 0) {
        alert('Nenhuma interacao registrada.');
        return;
    }

    let scenarios = 'Cenarios Gerados:\n\n';
    scenarios += 'Dado que o usuario esta na pagina inicial\n';

    window.interactions.forEach((interaction, index) => {
        const step = index === 0 ? 'Quando' : 'Entao';
        scenarios += `${step} o usuario clica em ${interaction.cssSelector} (${interaction.xpath})\n`;
    });

    const blob = new Blob([scenarios], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scenarios.txt';
    a.click();
}

let timerInterval;

function startTimer() {
    const timerElement = document.getElementById('timer');
    let seconds = 0;

    timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timerElement.textContent = `Tempo de execucao: ${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    document.getElementById('timer').textContent = 'Tempo de execucao: 00:00';
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'interactionRegistered') {
        const interactionLog = document.getElementById('interaction-log');
        const interaction = message.interaction;
        const logEntry = document.createElement('p');
        logEntry.textContent = `Click no elemento ${interaction.cssSelector} (${interaction.xpath})`;
        interactionLog.appendChild(logEntry);
    }
});
