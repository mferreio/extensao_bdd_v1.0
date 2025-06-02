// Importa funções utilitárias e de UI
import { slugify, downloadFile, showFeedback, debounce, getCSSSelector, getRobustXPath, isExtensionContextValid } from './utils.js';
import { showLoginModal, updateActionParams, makePanelDraggable, clearLog, showModal, renderLogWithActions, showEditModal, showXPathModal, createPanel, renderPanelContent, exportProjectZip, initializePanelEvents } from './ui.js';
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
    // Use apenas a função importada do ui.js
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

// Função para exportar README.md para cada feature/cenário
function exportReadmeForFeatures(selectedIdxs) {
    getConfig((config) => {
        if (!window.gherkinFeatures || !Array.isArray(window.gherkinFeatures)) {
            showFeedback('Nenhuma feature para exportar!', 'error');
            return;
        }
        const featuresToExport = window.gherkinFeatures.filter((_, idx) => selectedIdxs.includes(idx));
        if (featuresToExport.length === 0) {
            showFeedback('Selecione ao menos uma feature!', 'error');
            return;
        }
        featuresToExport.forEach((feature, fIdx) => {
            let readme = `# Feature: ${feature.name}\n\n`;
            readme += `## Descrição do fluxo\n`;
            readme += `Esta feature cobre o(s) seguinte(s) cenário(s):\n\n`;
            (feature.cenarios || []).forEach((cenario, cIdx) => {
                readme += `### Cenário: ${cenario.name}\n`;
                readme += `**Fluxo resumido:**\n`;
                (cenario.interactions || []).forEach((interaction, iIdx) => {
                    let step = interaction.step || '';
                    let acao = interaction.acaoTexto || interaction.acao || '';
                    let elemento = interaction.nomeElemento || '';
                    let valor = interaction.valorPreenchido ? ` (valor: "${interaction.valorPreenchido}")` : '';
                    let extra = '';
                    if (interaction.acao === 'upload' && interaction.nomeArquivo) {
                        extra = ` (arquivo: ${interaction.nomeArquivo})`;
                    }
                    readme += `- ${step} ${acao} em "${elemento}"${valor}${extra}\n`;
                });
                readme += '\n';
            });

            readme += `## Pré-requisitos\n`;
            readme += `- Navegador Google Chrome com extensão Selenium WebDriver instalada (ou ambiente Python/Selenium configurado)\n`;
            readme += `- Acesso ao ambiente de testes\n\n`;

            readme += `## Exemplo de execução (Python + Selenium)\n`;
            readme += '```python\n';
            readme += '# Exemplo básico de inicialização do Selenium\n';
            readme += 'from selenium import webdriver\nfrom selenium.webdriver.common.by import By\n\n';
            readme += 'driver = webdriver.Chrome()\n';
            readme += 'driver.get("URL_DO_SISTEMA")\n';
            readme += '# ...seguir os passos do cenário conforme descrito acima...\n';
            readme += '```\n\n';

            readme += `## Observações\n`;
            readme += `- Adapte os seletores e valores conforme necessário para o seu ambiente.\n`;
            readme += `- Prints das telas podem ser adicionados manualmente após a execução dos testes.\n`;

            // Gera arquivo README para cada feature
            const filename = `README_${feature.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
            downloadFile(filename, readme);
        });
        showFeedback('README.md exportado(s) com sucesso!');
    });
}

// Função para exportar features selecionadas e README.md juntos
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

        // Exporta arquivo .feature único
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
        // Faz download do arquivo .feature
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

        // Exporta README.md, pages.py, steps.py, environment.py, requirements.txt para cada feature selecionada
        featuresToExport.forEach((feature) => {
            let readme = `# Feature: ${feature.name}\n\n`;
            readme += `## Descrição do fluxo\n`;
            readme += `Esta feature cobre o(s) seguinte(s) cenário(s):\n\n`;
            (feature.cenarios || []).forEach((cenario) => {
                readme += `### Cenário: ${cenario.name}\n`;
                readme += `**Fluxo resumido:**\n`;
                (cenario.interactions || []).forEach((interaction) => {
                    let step = interaction.step || '';
                    let acao = interaction.acaoTexto || interaction.acao || '';
                    let elemento = interaction.nomeElemento || '';
                    let valor = interaction.valorPreenchido ? ` (valor: "${interaction.valorPreenchido}")` : '';
                    let extra = '';
                    if (interaction.acao === 'upload' && interaction.nomeArquivo) {
                        extra = ` (arquivo: ${interaction.nomeArquivo})`;
                    }
                    readme += `- ${step} ${acao} em "${elemento}"${valor}${extra}\n`;
                });
                readme += '\n';
            });

            readme += `## Pré-requisitos\n`;
            readme += `- Navegador Google Chrome com extensão Selenium WebDriver instalada (ou ambiente Python/Selenium configurado)\n`;
            readme += `- Acesso ao ambiente de testes\n\n`;

            readme += `## Exemplo de execução (Python + Selenium)\n`;
            readme += '```python\n';
            readme += '# Exemplo básico de inicialização do Selenium\n';
            readme += 'from selenium import webdriver\nfrom selenium.webdriver.common.by import By\n\n';
            readme += 'driver = webdriver.Chrome()\n';
            readme += 'driver.get("URL_DO_SISTEMA")\n';
            readme += '# ...seguir os passos do cenário conforme descrito acima...\n';
            readme += '```\n\n';

            readme += `## Observações\n`;
            readme += `- Adapte os seletores e valores conforme necessário para o seu ambiente.\n`;
            readme += `- Prints das telas podem ser adicionados manualmente após a execução dos testes.\n`;

            const filename = `README_${feature.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
            downloadFile(filename, readme);

            // --- Geração de pages.py (POM) ---
            // Coleta todos os elementos únicos usados nos steps
            const locatorSet = new Set();
            const locatorMap = {};
            (feature.cenarios || []).forEach((cenario) => {
                (cenario.interactions || []).forEach((interaction) => {
                    // Só adiciona se houver cssSelector e nomeElemento
                    if (interaction.cssSelector && interaction.nomeElemento) {
                        const key = interaction.nomeElemento.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
                        locatorSet.add(key);
                        locatorMap[key] = interaction.cssSelector;
                    }
                });
            });

            // Classe de locators
            let locatorsClass = `from selenium.webdriver.common.by import By

class Locators${slugify(feature.name, true)}:
`;
            if (locatorSet.size === 0) {
                locatorsClass += `    # Nenhum locator identificado\n`;
            } else {
                locatorSet.forEach(key => {
                    locatorsClass += `    ${key} = (By.CSS_SELECTOR, '${locatorMap[key]}')\n`;
                });
            }

            // Classe de interações genéricas
            let pageClass = `
class Page${slugify(feature.name, true)}:
    def __init__(self, driver):
        self.driver = driver

    def acessar_url(self, url):
        self.driver.get(url)

    def clicar(self, locator):
        self.driver.find_element(*locator).click()

    def preencher(self, locator, valor):
        el = self.driver.find_element(*locator)
        el.clear()
        el.send_keys(valor)

    def selecionar(self, locator, valor):
        from selenium.webdriver.support.ui import Select
        select = Select(self.driver.find_element(*locator))
        select.select_by_visible_text(valor)

    def upload_arquivo(self, locator, caminho_arquivo):
        self.driver.find_element(*locator).send_keys(caminho_arquivo)

    def esperar_elemento(self, locator, timeout=10):
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        WebDriverWait(self.driver, timeout).until(EC.presence_of_element_located(locator))

    def esperar_elemento_desaparecer(self, locator, timeout=10):
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        WebDriverWait(self.driver, timeout).until_not(EC.presence_of_element_located(locator))

    # Adicione outros métodos genéricos conforme necessário
`;

            const pagesPy = `# pages.py gerado automaticamente para a feature "${feature.name}"

${locatorsClass}
${pageClass}
`;

            downloadFile(`pages_${feature.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.py`, pagesPy);

            // --- Geração de steps.py (Behave) ---
            // Gera steps parametrizados e funções que refletem os steps do .feature
            let stepsPy = `# steps.py gerado automaticamente para a feature "${feature.name}"
from behave import given, when, then
from pages_${feature.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()} import Page${slugify(feature.name, true)}, Locators${slugify(feature.name, true)}

def get_page(context):
    if not hasattr(context, 'page'):
        context.page = Page${slugify(feature.name, true)}(context.driver)
    return context.page

`;

            // Função auxiliar para gerar nomes de funções python válidos a partir do texto do step
            function stepFuncName(stepText) {
                return slugify(stepText.replace(/["'<>\(\)\[\]\.]/g, ''), true);
            }

            // Map para evitar duplicidade de steps
            const stepDefs = new Map();

            (feature.cenarios || []).forEach((cenario) => {
                (cenario.interactions || []).forEach((interaction) => {
                    let stepType = (interaction.step || '').toLowerCase();
                    let stepText = '';
                    // Gera o texto do step igual ao .feature
                    if (interaction.stepText) {
                        stepText = interaction.stepText;
                    } else if (interaction.acao === 'acessa_url') {
                        stepText = `que o usuário acessa ${interaction.nomeElemento}`;
                    } else if (interaction.acao === 'login') {
                        stepText = 'que o usuário faz login com usuário "<usuario>" e senha "<senha>"';
                    } else if (interaction.acao === 'upload') {
                        stepText = `faz upload do arquivo "${interaction.nomeArquivo || 'ARQUIVO_EXEMPLO'}" no campo ${interaction.nomeElemento}`;
                    } else if (interaction.acao === 'preenche') {
                        stepText = `${interaction.acaoTexto ? interaction.acaoTexto.toLowerCase() : 'preenche'} no ${interaction.nomeElemento}`;
                        if (typeof interaction.valorPreenchido !== 'undefined') {
                            stepText += ` (valor: "${interaction.valorPreenchido}")`;
                        }
                    } else if (interaction.acao === 'espera_segundos') {
                        stepText = `${interaction.acaoTexto ? interaction.acaoTexto.toLowerCase() : 'espera'} no ${interaction.nomeElemento}`;
                        if (typeof interaction.tempoEspera !== 'undefined') {
                            stepText += ` (${interaction.tempoEspera} segundos)`;
                        }
                    } else if (interaction.acao === 'espera_elemento') {
                        stepText = `espera o elemento aparecer: ${interaction.nomeElemento}`;
                    } else {
                        stepText = `${interaction.acaoTexto ? interaction.acaoTexto.toLowerCase() : ''} no ${interaction.nomeElemento}`;
                    }

                    // Remove acentos e caracteres especiais do stepText para o decorator
                    let decoratorText = stepText.replace(/"/g, '\\"');
                    let funcName = stepFuncName(stepText);

                    // Evita duplicidade de step definitions
                    if (stepDefs.has(decoratorText)) return;
                    stepDefs.set(decoratorText, true);

                    // Gera o decorator correto
                    let decorator = '';
                    if (stepType === 'given') decorator = `@given('${decoratorText}')`;
                    else if (stepType === 'when') decorator = `@when('${decoratorText}')`;
                    else decorator = `@then('${decoratorText}')`;

                    // Gera o corpo da função conforme a ação
                    let body = '';
                    if (interaction.acao === 'acessa_url') {
                        body = `    page = get_page(context)\n    page.acessar_url("${interaction.nomeElemento}")\n`;
                    } else if (interaction.acao === 'login') {
                        body = `    # Implemente o login conforme o contexto do sistema\n    pass\n`;
                    } else if (interaction.acao === 'upload') {
                        const locatorKey = interaction.nomeElemento.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
                        body = `    page = get_page(context)\n    page.upload_arquivo(Locators${slugify(feature.name, true)}.${locatorKey}, "CAMINHO/DO/ARQUIVO/${interaction.nomeArquivo || 'ARQUIVO_EXEMPLO'}")\n`;
                    } else if (interaction.acao === 'preenche') {
                        const locatorKey = interaction.nomeElemento.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
                        if (typeof interaction.valorPreenchido !== 'undefined') {
                            body = `    page = get_page(context)\n    page.preencher(Locators${slugify(feature.name, true)}.${locatorKey}, "${interaction.valorPreenchido}")\n`;
                        } else {
                            body = `    # Preencher campo: ajuste o valor conforme necessário\n    pass\n`;
                        }
                    } else if (interaction.acao === 'clica') {
                        const locatorKey = interaction.nomeElemento.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
                        body = `    page = get_page(context)\n    page.clicar(Locators${slugify(feature.name, true)}.${locatorKey})\n`;
                    } else if (interaction.acao === 'seleciona') {
                        const locatorKey = interaction.nomeElemento.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
                        body = `    page = get_page(context)\n    page.selecionar(Locators${slugify(feature.name, true)}.${locatorKey}, "VALOR_DESEJADO")\n`;
                    } else if (interaction.acao === 'espera_elemento') {
                        const locatorKey = interaction.nomeElemento.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
                        body = `    page = get_page(context)\n    page.esperar_elemento(Locators${slugify(feature.name, true)}.${locatorKey})\n`;
                    } else if (interaction.acao === 'espera_nao_existe') {
                        const locatorKey = interaction.nomeElemento.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
                        body = `    page = get_page(context)\n    page.esperar_elemento_desaparecer(Locators${slugify(feature.name, true)}.${locatorKey})\n`;
                    } else if (interaction.acao === 'espera_segundos') {
                        const tempo = interaction.tempoEspera || 1;
                        body = `    import time\n    time.sleep(${tempo})\n`;
                    } else {
                        body = `    # Implemente a ação correspondente\n    pass\n`;
                    }

                    stepsPy += `
${decorator}
def step_${funcName}(context):
${body}
`;
                });
            });

            downloadFile(`steps_${feature.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.py`, stepsPy);

            // --- environment.py e requirements.txt aprimorados ---
            // Gera environment.py robusto
            const environmentPy = `# environment.py gerado automaticamente para a feature "${feature.name}"
import os
import logging
from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager

def before_all(context):
    # Configuração de logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[logging.StreamHandler()]
    )
    browser = os.getenv("BROWSER", "chrome").lower()
    try:
        if browser == "chrome":
            from selenium.webdriver.chrome.service import Service as ChromeService
            from selenium.webdriver.chrome.options import Options as ChromeOptions
            options = ChromeOptions()
            options.add_argument("--start-maximized")
            context.driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
        elif browser == "firefox":
            from selenium.webdriver.firefox.service import Service as FirefoxService
            from selenium.webdriver.firefox.options import Options as FirefoxOptions
            options = FirefoxOptions()
            options.add_argument("--width=1920")
            options.add_argument("--height=1080")
            context.driver = webdriver.Firefox(service=FirefoxService(GeckoDriverManager().install()), options=options)
        elif browser == "edge":
            from selenium.webdriver.edge.service import Service as EdgeService
            from selenium.webdriver.edge.options import Options as EdgeOptions
            options = EdgeOptions()
            context.driver = webdriver.Edge(service=EdgeService(EdgeChromiumDriverManager().install()), options=options)
        else:
            raise ValueError(f"Navegador não suportado: {browser}")
        logging.info(f"Driver iniciado com sucesso ({browser})")
    except WebDriverException as e:
        logging.error(f"Erro ao iniciar o driver: {e}")
        raise
    except Exception as e:
        logging.error(f"Erro inesperado: {e}")
        raise

def after_step(context, step):
    if step.status == "failed":
        try:
            screenshots_dir = os.path.join(os.getcwd(), "screenshots")
            os.makedirs(screenshots_dir, exist_ok=True)
            filename = f"{step.name.replace(' ', '_')}.png"
            filepath = os.path.join(screenshots_dir, filename)
            context.driver.save_screenshot(filepath)
            logging.error(f"Step falhou. Screenshot salvo em: {filepath}")
        except Exception as e:
            logging.error(f"Erro ao salvar screenshot: {e}")

def after_all(context):
    try:
        if hasattr(context, "driver"):
            context.driver.quit()
            logging.info("Driver finalizado com sucesso.")
    except Exception as e:
        logging.error(f"Erro ao finalizar o driver: {e}")
`;

            downloadFile(`environment_${feature.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.py`, environmentPy);

            // Gera requirements.txt mais completo
            const requirementsTxt = `# requirements.txt gerado automaticamente
selenium
behave
webdriver-manager
pytest
python-dotenv
colorama
pytest-bdd
requests
`;
            downloadFile(`requirements_${feature.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`, requirementsTxt);
        });

        showFeedback('Exportação realizada com sucesso!');
    });
}

// Torna exportSelectedFeatures disponível globalmente para o ui.js
window.exportSelectedFeatures = exportSelectedFeatures;

// Mantém o Service Worker ativo
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'keepAlive') {
            sendResponse({ status: 'alive' });
        }
    });
}
