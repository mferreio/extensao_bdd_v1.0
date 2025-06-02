// Importa funções utilitárias e de UI
import { slugify, downloadFile, showFeedback, debounce, getCSSSelector, getRobustXPath, isExtensionContextValid } from './utils.js';
import { showLoginModal, updateActionParams, makePanelDraggable, clearLog, showModal, renderLogWithActions, showEditModal, showXPathModal, createPanel, renderPanelContent } from './ui.js';
import { getConfig } from './config.js';

// Variáveis globais para controle de múltiplas features/cenários e estado do painel
if (!window.gherkinFeatures) window.gherkinFeatures = [];
if (!window.currentFeature) window.currentFeature = null;
if (!window.currentCenario) window.currentCenario = null;
if (!window.gherkinPanelState) window.gherkinPanelState = 'feature';
if (typeof window.isRecording === 'undefined') window.isRecording = false;
if (typeof window.isPaused === 'undefined') window.isPaused = false;
if (typeof window.timerInterval === 'undefined') window.timerInterval = null;
if (typeof window.elapsedSeconds === 'undefined') window.elapsedSeconds = 0;
if (!window.interactions) window.interactions = [];

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

// Função para iniciar o timer
function startTimer() {
    stopTimer();
    window.elapsedSeconds = window.elapsedSeconds || 0;
    const timerElement = document.getElementById('gherkin-timer');
    function updateTimer() {
        window.elapsedSeconds++;
        if (timerElement) {
            const min = String(Math.floor(window.elapsedSeconds / 60)).padStart(2, '0');
            const sec = String(window.elapsedSeconds % 60).padStart(2, '0');
            timerElement.textContent = `Tempo de execução: ${min}:${sec}`;
        }
    }
    window.timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

// Função para alternar entre pausa e gravação
function togglePause() {
    const pauseButton = document.getElementById('gherkin-pause');
    window.isPaused = !window.isPaused;
    if (window.isPaused) {
        pauseButton.textContent = 'Continuar';
        pauseButton.style.backgroundColor = '#28a745';
        document.getElementById('gherkin-status').textContent = 'Status: Pausado';
        stopTimer();
    } else {
        pauseButton.textContent = 'Pausar';
        pauseButton.style.backgroundColor = '#ffc107';
        document.getElementById('gherkin-status').textContent = 'Status: Gravando';
        startTimer();
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
}

// Inicialização do painel e variáveis globais
if (!window.panel) {
    window.panel = createPanel();
    renderPanelContent(window.panel);
}
if (typeof window.lastInputTarget === 'undefined') window.lastInputTarget = null;
if (typeof window.inputDebounceTimeout === 'undefined') window.inputDebounceTimeout = null;
if (typeof window.lastInputValue === 'undefined') window.lastInputValue = '';

// Inicializa eventos do painel
setTimeout(() => {
    initializePanelEvents(window.panel);
    applySavedTheme();
    // Removido: makePanelDraggable(window.panel);
    // Adiciona arrasto apenas na barra superior
    const header = window.panel.querySelector('.gherkin-panel-header');
    if (header) {
        makePanelDraggable(window.panel, header);
    }
}, 100);

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

        // Se for input file, abre modal para upload de exemplo
        if (event.target.tagName === 'INPUT' && event.target.type === 'file') {
            const cssSelector = getCSSSelector(event.target);
            const xpath = getRobustXPath(event.target);
            let nomeElemento = (event.target.getAttribute('aria-label') || event.target.getAttribute('name') || event.target.id || event.target.className || event.target.tagName).toString().trim();
            if (!nomeElemento) nomeElemento = event.target.tagName;
            if (typeof window.showUploadModal === 'function') {
                window.showUploadModal(nomeElemento, cssSelector, xpath, (nomeArquivo) => {
                    if (!nomeArquivo) return;
                    getConfig((config) => {
                        const template = config.templateUpload || 'When faz upload do arquivo "{arquivo}" no campo {elemento}';
                        const stepText = template
                            .replace('{arquivo}', nomeArquivo)
                            .replace('{elemento}', nomeElemento);
                        window.interactions.push({
                            step: 'When',
                            acao: 'upload',
                            acaoTexto: 'Upload de arquivo',
                            nomeElemento,
                            cssSelector,
                            xpath,
                            nomeArquivo,
                            stepText,
                            timestamp: Date.now()
                        });
                        renderLogWithActions();
                        saveInteractionsToStorage();
                    });
                });
            } else {
                showFeedback('Função de upload não disponível!', 'error');
            }
            return;
        }
        // Se for input comum/textarea/contentEditable, não registra aqui (será tratado no input)
        if ((event.target.tagName === 'INPUT' && event.target.type !== 'file') || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) return;

        // Detecta campos de login
        const isLoginField = (el) => {
            const type = el.getAttribute('type') || '';
            const name = (el.getAttribute('name') || '').toLowerCase();
            const id = (el.id || '').toLowerCase();
            return (
                type === 'password' ||
                name.includes('senha') || name.includes('password') ||
                id.includes('senha') || id.includes('password')
            );
        };
        // Se o elemento clicado for um botão de login ou submit próximo de campos de login
        let isLoginAction = false;
        if (event.target.tagName === 'BUTTON' || event.target.type === 'submit') {
            // Procura campos de input próximos
            const form = event.target.closest('form');
            if (form) {
                const inputs = form.querySelectorAll('input');
                let hasUser = false, hasPass = false;
                inputs.forEach(input => {
                    const type = input.getAttribute('type') || '';
                    const name = (input.getAttribute('name') || '').toLowerCase();
                    if (type === 'password' || name.includes('senha') || name.includes('password')) hasPass = true;
                    if (type === 'text' || type === 'email' || name.includes('user') || name.includes('email')) hasUser = true;
                });
                if (hasUser && hasPass) isLoginAction = true;
            }
        }

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
        // Espera inteligente: se o usuário escolher "espera_elemento", registra o seletor
        if (acaoValue === 'espera_elemento') {
            interactionParams.esperaSeletor = cssSelector;
        }

        // Marcação de login
        if (acaoValue === 'login' || isLoginAction) {
            // Não salva credenciais, apenas registra o step
            let userField = '';
            let passField = '';
            const form = event.target.closest('form');
            if (form) {
                const inputs = form.querySelectorAll('input');
                inputs.forEach(input => {
                    const type = input.getAttribute('type') || '';
                    const name = (input.getAttribute('name') || '').toLowerCase();
                    if (!userField && (type === 'text' || type === 'email' || name.includes('user') || name.includes('email'))) userField = getCSSSelector(input);
                    if (!passField && (type === 'password' || name.includes('senha') || name.includes('password'))) passField = getCSSSelector(input);
                });
            }
            getConfig((config) => {
                const template = config.templateLogin || 'Given que o usuário faz login com usuário "<usuario>" e senha "<senha>"';
                const stepText = template;
                window.interactions.push({
                    step: 'Given',
                    acao: 'login',
                    acaoTexto: 'Login',
                    nomeElemento: 'login',
                    userField,
                    passField,
                    cssSelector,
                    xpath,
                    stepText,
                    timestamp: Date.now()
                });
                renderLogWithActions();
                saveInteractionsToStorage();
            });
            return;
        }

        // Evita duplicidade: só registra se não for igual à última interação
        const last = window.interactions[window.interactions.length - 1];
        let isDuplicate = last && last.acao === acaoValue && last.cssSelector === cssSelector && last.nomeElemento === nomeElemento;
        if (acaoValue === 'espera_segundos' && last && last.tempoEspera !== undefined) {
            isDuplicate = isDuplicate && last.tempoEspera === interactionParams.tempoEspera;
        }
        if (acaoValue === 'espera_elemento' && last && last.esperaSeletor) {
            isDuplicate = isDuplicate && last.esperaSeletor === interactionParams.esperaSeletor;
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
    }, 700);
}
document.addEventListener('input', handleInputEvent, true);

// Atualiza o log ao renderizar o painel em modo gravação
if (typeof renderPanelContent !== 'undefined') {
    const originalRenderPanelContent = renderPanelContent;
    renderPanelContent = function(panel) {
        originalRenderPanelContent(panel);
        if (window.gherkinPanelState === 'gravando') {
            setTimeout(renderLogWithActions, 10);
        }
        // Garante que o arrasto seja aplicado após renderização
        const header = panel.querySelector('.gherkin-panel-header');
        if (header) {
            makePanelDraggable(panel, header);
        }
    };
}

// Função para salvar interações no storage local
function saveInteractionsToStorage() {
    try {
        chrome.storage.local.set({ gherkinInteractions: window.interactions });
    } catch (e) {}
}

// Função para exportar features selecionadas (dummy, pode ser expandida)
function exportSelectedFeatures(selectedIdxs) {
    getConfig((config) => {
        // Gera o texto da feature/cenário usando os mesmos templates do log
        let exportText = '';
        if (!window.gherkinFeatures || !Array.isArray(window.gherkinFeatures)) {
            showFeedback('Nenhuma feature para exportar!', 'error');
            return;
        }
        const featuresToExport = window.gherkinFeatures.filter((_, idx) => selectedIdxs.includes(idx));
        if (featuresToExport.length === 0) {
            showFeedback('Selecione ao menos uma feature!', 'error');
            return;
        }
        featuresToExport.forEach((feature) => {
            exportText += `Feature: ${feature.name}\n`;
            (feature.cenarios || []).forEach((cenario) => {
                exportText += `  Scenario: ${cenario.name}\n`;
                (cenario.interactions || []).forEach((interaction) => {
                    let mensagem = '';
                    if (interaction.stepText) {
                        mensagem = interaction.stepText;
                    } else if (interaction.acao === 'acessa_url') {
                        const tpl = (config.templateStep && config.templateStep.Given) || 'Given que o usuário acessa {url}';
                        mensagem = tpl.replace('{url}', interaction.nomeElemento || 'URL');
                    } else if (interaction.acao === 'login') {
                        mensagem = config.templateLogin || 'Given que o usuário faz login com usuário "<usuario>" e senha "<senha>"';
                    } else if (interaction.acao === 'upload') {
                        let tpl = config.templateUpload || '{step} faz upload do arquivo "{arquivo}" no campo {elemento}';
                        mensagem = tpl
                            .replace('{step}', interaction.step || 'When')
                            .replace('{arquivo}', interaction.nomeArquivo || 'ARQUIVO_EXEMPLO')
                            .replace('{elemento}', interaction.nomeElemento || 'CAMPO_UPLOAD');
                    } else if (interaction.acao === 'preenche') {
                        let tpl = (config.templateStep && config.templateStep[interaction.step]) || `${interaction.step} ${interaction.acaoTexto ? interaction.acaoTexto.toLowerCase() : 'preenche'} no {elemento}`;
                        mensagem = tpl.replace('{acao}', interaction.acaoTexto ? interaction.acaoTexto.toLowerCase() : 'preenche')
                            .replace('{elemento}', interaction.nomeElemento || 'ELEMENTO');
                        if (typeof interaction.valorPreenchido !== 'undefined') {
                            mensagem += ` (valor: "${interaction.valorPreenchido}")`;
                        }
                    } else if (interaction.acao === 'espera_segundos') {
                        let tpl = (config.templateStep && config.templateStep[interaction.step]) || `${interaction.step} ${interaction.acaoTexto ? interaction.acaoTexto.toLowerCase() : 'espera'} no {elemento}`;
                        mensagem = tpl.replace('{acao}', interaction.acaoTexto ? interaction.acaoTexto.toLowerCase() : 'espera')
                            .replace('{elemento}', interaction.nomeElemento || 'ELEMENTO');
                        if (typeof interaction.tempoEspera !== 'undefined') {
                            mensagem += ` (${interaction.tempoEspera} segundos)`;
                        }
                    } else if (interaction.acao === 'espera_elemento') {
                        let tpl = config.templateEspera || '{step} espera o elemento aparecer: {seletor}';
                        mensagem = tpl
                            .replace('{step}', interaction.step || 'When')
                            .replace('{seletor}', interaction.esperaSeletor || interaction.cssSelector || 'SELETOR_ELEMENTO');
                    } else {
                        let tpl = (config.templateStep && config.templateStep[interaction.step]) || `${interaction.step} ${interaction.acaoTexto ? interaction.acaoTexto.toLowerCase() : ''} no {elemento}`;
                        mensagem = tpl.replace('{acao}', interaction.acaoTexto ? interaction.acaoTexto.toLowerCase() : '')
                            .replace('{elemento}', interaction.nomeElemento || 'ELEMENTO');
                    }
                    exportText += `    ${mensagem}\n`;
                });
                exportText += '\n';
            });
            exportText += '\n';
        });
        // Faz download do arquivo
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'features_exportadas.feature';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        showFeedback('Exportação realizada com sucesso!');
    });
}

// Mantém o Service Worker ativo
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'keepAlive') {
            sendResponse({ status: 'alive' });
        }
    });
}
