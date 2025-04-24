document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('play');
    const pauseButton = document.getElementById('pause');
    const finalizeButton = document.getElementById('finalize');
    const exportButton = document.getElementById('export');

    if (playButton) {
        playButton.addEventListener('click', () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tab = tabs[0];
                if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
                    alert('Não é possível registrar interações nesta página.');
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
                                alert('Registro de interações iniciado.');
                                playButton.disabled = true;
                                pauseButton.disabled = false;
                                finalizeButton.disabled = false;
                                exportButton.disabled = true;
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
    }

    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'pauseRecording' }, (response) => {
                    if (chrome.runtime.lastError) {
                        alert('Erro ao pausar o registro: ' + chrome.runtime.lastError.message);
                    } else {
                        alert('Registro pausado.');
                        playButton.disabled = false;
                        pauseButton.disabled = true;
                        document.getElementById('status').textContent = 'Status: Pausado';
                        stopTimer();
                    }
                });
            });
        });
    }

    if (finalizeButton) {
        finalizeButton.addEventListener('click', () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'finalizeRecording' }, (response) => {
                    if (chrome.runtime.lastError) {
                        alert('Erro ao finalizar o registro: ' + chrome.runtime.lastError.message);
                    } else {
                        chrome.storage.local.set({ interactions: response.interactions }, () => {
                            alert('Registro finalizado. Você pode exportar os cenários.');
                            playButton.disabled = false;
                            pauseButton.disabled = true;
                            finalizeButton.disabled = true;
                            exportButton.disabled = false;
                            document.getElementById('status').textContent = 'Status: Finalizado';
                            stopTimer();
                        });
                    }
                });
            });
        });
    }

    if (exportButton) {
        exportButton.addEventListener('click', exportScenarios);
    }
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
