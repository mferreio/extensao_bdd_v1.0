// Importa funções utilitárias e de UI
import { slugify, downloadFile, showFeedback, debounce, getCSSSelector, isExtensionContextValid } from './utils.js';
import {
    updateActionParams,
    makePanelDraggable,
    renderLogWithActions,
    createPanel,
    renderPanelContent,
    initializePanelEvents,
    showEditModal,
    showXPathModal,
} from './ui.js';
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

// Remova funções duplicadas já presentes em ui.js:
// - stopTimer
// - startTimer
// - togglePause
// - toggleTheme
// - applySavedTheme
// - getRobustXPath
// - saveInteractionsToStorage

// Inicialização do painel e variáveis globais
if (!window.panel) {
    window.panel = createPanel();
    renderPanelContent(window.panel);

    // --- INJEÇÃO DE CSS MODERNO E RESPONSIVO ---
    const style = document.createElement('style');
    style.id = 'gherkin-panel-modern-style';
    style.innerHTML = `
    #gherkin-panel, .gherkin-panel {
        font-family: 'Segoe UI', Arial, sans-serif !important;
        background: #fff;
        color: #222;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.10);
        max-width: 480px;
        min-width: 320px;
        width: 96vw;
        min-height: 320px;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 2147483647;
    }
    .gherkin-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f7faff;
        border-bottom: 1px solid #e0e6ed;
        padding: 18px 20px 12px 20px;
        font-size: 1.25rem;
        font-weight: bold;
        color: #0070f3;
        letter-spacing: 0.01em;
        user-select: none;
    }
    .gherkin-panel-header .gherkin-panel-title {
        font-size: 1.18rem;
        font-weight: 700;
        letter-spacing: 0.01em;
    }
    .gherkin-panel-header .gherkin-panel-actions {
        display: flex;
        gap: 8px;
    }
    .gherkin-panel-header button, .gherkin-panel-header .gherkin-close, .gherkin-panel-header .gherkin-minimize {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 2px 6px;
        color: #e74c3c;
        transition: color 0.2s;
    }
    .gherkin-panel-header .gherkin-minimize { color: #f1c40f; }
    .gherkin-panel-header .gherkin-close:hover { color: #c0392b; }
    .gherkin-panel-header .gherkin-minimize:hover { color: #b7950b; }

    .gherkin-panel-content {
        flex: 1 1 auto;
        padding: 24px 24px 12px 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        background: #fff;
        overflow-y: auto;
    }
    .gherkin-panel-content h2, .gherkin-panel-content h3 {
        margin: 0 0 8px 0;
        font-weight: 600;
        color: #0070f3;
    }
    .gherkin-panel-content label {
        font-weight: 500;
        margin-bottom: 4px;
        display: block;
        color: #222;
    }
    .gherkin-panel-content input[type="text"], .gherkin-panel-content input[type="number"], .gherkin-panel-content textarea, .gherkin-panel-content select {
        width: 100%;
        padding: 10px 12px;
        border: 1.5px solid #e0e6ed;
        border-radius: 6px;
        font-size: 1rem;
        margin-bottom: 10px;
        background: #f9fbfd;
        transition: border-color 0.2s;
    }
    .gherkin-panel-content input:focus, .gherkin-panel-content textarea:focus, .gherkin-panel-content select:focus {
        outline: none;
        border-color: #0070f3;
        background: #fff;
    }
    .gherkin-panel-content input[aria-invalid="true"], .gherkin-panel-content textarea[aria-invalid="true"] {
        border-color: #e74c3c;
        background: #fff6f6;
    }
    .gherkin-panel-content .gherkin-actions-row {
        display: flex;
        gap: 12px;
        margin: 12px 0 0 0;
        flex-wrap: wrap;
    }
    .gherkin-panel-content button, .gherkin-panel-content .gherkin-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 18px;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        box-shadow: 0 2px 8px rgba(0,112,243,0.04);
        margin-bottom: 0;
        outline: none;
    }
    .gherkin-panel-content .gherkin-btn-primary {
        background: #0070f3;
        color: #fff;
    }
    .gherkin-panel-content .gherkin-btn-primary:hover, .gherkin-panel-content .gherkin-btn-primary:focus {
        background: #005bb5;
    }
    .gherkin-panel-content .gherkin-btn-success {
        background: #28a745;
        color: #fff;
    }
    .gherkin-panel-content .gherkin-btn-success:hover, .gherkin-panel-content .gherkin-btn-success:focus {
        background: #218838;
    }
    .gherkin-panel-content .gherkin-btn-danger {
        background: #e74c3c;
        color: #fff;
    }
    .gherkin-panel-content .gherkin-btn-danger:hover, .gherkin-panel-content .gherkin-btn-danger:focus {
        background: #c0392b;
    }
    .gherkin-panel-content .gherkin-btn-warning {
        background: #ffc107;
        color: #222;
    }
    .gherkin-panel-content .gherkin-btn-warning:hover, .gherkin-panel-content .gherkin-btn-warning:focus {
        background: #e0a800;
    }
    .gherkin-panel-content .gherkin-btn[disabled], .gherkin-panel-content button[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .gherkin-panel-content .gherkin-checkbox-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
    }
    .gherkin-panel-content .gherkin-checkbox-list label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 400;
        font-size: 1rem;
        color: #222;
        cursor: pointer;
    }
    .gherkin-panel-content .gherkin-checkbox-list input[type="checkbox"] {
        accent-color: #0070f3;
        width: 18px;
        height: 18px;
    }
    .gherkin-panel-content .gherkin-feedback {
        margin: 8px 0;
        padding: 10px 14px;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 500;
        background: #eafaf1;
        color: #218838;
        border: 1.5px solid #28a745;
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 40px;
        transition: background 0.2s, color 0.2s;
    }
    .gherkin-panel-content .gherkin-feedback.error {
        background: #fff6f6;
        color: #e74c3c;
        border-color: #e74c3c;
    }
    .gherkin-panel-content .gherkin-feedback.info {
        background: #f7faff;
        color: #0070f3;
        border-color: #0070f3;
    }
    .gherkin-panel-content .gherkin-feedback .gherkin-feedback-icon {
        font-size: 1.3em;
        display: inline-block;
        vertical-align: middle;
    }
    .gherkin-panel-content .gherkin-tip {
        background: #f7faff;
        border-left: 4px solid #0070f3;
        padding: 10px 16px;
        border-radius: 6px;
        color: #0070f3;
        font-size: 0.98rem;
        margin-bottom: 8px;
        margin-top: 0;
        display: flex;
        align-items: flex-start;
        gap: 8px;
    }
    .gherkin-panel-content .gherkin-tip .gherkin-tip-icon {
        font-size: 1.2em;
        margin-right: 4px;
        color: #0070f3;
    }
    .gherkin-panel-content .gherkin-summary {
        background: #f9fbfd;
        border: 1.5px solid #e0e6ed;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 10px;
        font-size: 0.98rem;
        color: #222;
        max-height: 180px;
        overflow-y: auto;
    }
    .gherkin-panel-content .gherkin-summary-title {
        font-weight: 600;
        color: #0070f3;
        margin-bottom: 6px;
        font-size: 1.05rem;
    }
    .gherkin-panel-content .gherkin-summary-list {
        list-style: disc inside;
        margin: 0;
        padding: 0 0 0 10px;
    }
    .gherkin-panel-content .gherkin-summary-list li {
        margin-bottom: 2px;
        font-size: 0.97rem;
    }
    .gherkin-panel-content .gherkin-footer {
        text-align: right;
        font-size: 0.92rem;
        color: #888;
        margin-top: 10px;
        margin-bottom: 2px;
    }
    /* Dropdown de ações (três pontos) */
    .gherkin-action-dropdown {
        position: absolute !important;
        min-width: 170px;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0,112,243,0.13), 0 1.5px 6px rgba(0,0,0,0.07);
        border: 1.5px solid #e0e6ed;
        z-index: 2147483646 !important;
        padding: 8px 0;
        display: none;
        flex-direction: column;
        animation: fadeInDropdown 0.18s;
        /* Novo: ajuste para garantir que o dropdown nunca fique fora da janela */
        right: auto !important;
        left: 0 !important;
        top: 36px !important;
        max-width: 90vw;
        max-height: 320px;
        overflow-y: auto;
    }
    .gherkin-action-dropdown.open {
        display: flex !important;
    }
    .gherkin-action-dropdown button,
    .gherkin-action-dropdown .gherkin-action-item {
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        padding: 10px 18px;
        font-size: 1rem;
        color: #222;
        cursor: pointer;
        transition: background 0.18s, color 0.18s;
        border-radius: 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .gherkin-action-dropdown button:hover,
    .gherkin-action-dropdown .gherkin-action-item:hover {
        background: #f7faff;
        color: #0070f3;
    }
    .gherkin-action-dropdown .gherkin-action-separator {
        height: 1px;
        background: #e0e6ed;
        margin: 4px 0;
        border: none;
    }
    @keyframes fadeInDropdown {
        from { opacity: 0; transform: translateY(-8px);}
        to { opacity: 1; transform: translateY(0);}
    }

    /* Painel de logs aprimorado */
    .gherkin-log-panel {
        background: #f9fbfd;
        border-radius: 10px;
        border: 1.5px solid #e0e6ed;
        padding: 12px 0 6px 0;
        margin-bottom: 10px;
        max-height: 260px;
        overflow-y: auto;
        box-shadow: 0 2px 8px rgba(0,112,243,0.04);
        font-size: 0.98rem;
        scrollbar-width: thin;
        scrollbar-color: #0070f3 #f9fbfd;
    }
    .gherkin-log-panel::-webkit-scrollbar {
        width: 8px;
        background: #f9fbfd;
    }
    .gherkin-log-panel::-webkit-scrollbar-thumb {
        background: #e0e6ed;
        border-radius: 6px;
    }
    .gherkin-log-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .gherkin-log-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 10px 18px 10px 16px;
        border-bottom: 1px solid #e0e6ed;
        background: transparent;
        transition: background 0.15s;
        position: relative;
    }
    .gherkin-log-item:last-child {
        border-bottom: none;
    }
    .gherkin-log-item:hover {
        background: #f7faff;
    }
    .gherkin-log-icon {
        font-size: 1.25em;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #eaf6ff;
        color: #0070f3;
        flex-shrink: 0;
    }
    .gherkin-log-item[data-action="preenche"] .gherkin-log-icon { background: #f6f9e8; color: #28a745; }
    .gherkin-log-item[data-action="upload"] .gherkin-log-icon { background: #fff6e6; color: #f39c12; }
    .gherkin-log-item[data-action="login"] .gherkin-log-icon { background: #f6e8f9; color: #8e44ad; }
    .gherkin-log-item[data-action="clica"] .gherkin-log-icon { background: #eafaf1; color: #218838; }
    .gherkin-log-item[data-action="espera"] .gherkin-log-icon { background: #fff6f6; color: #e74c3c; }
    .gherkin-log-item[data-action="espera_elemento"] .gherkin-log-icon { background: #f7faff; color: #0070f3; }
    .gherkin-log-item[data-action="acessa_url"] .gherkin-log-icon { background: #eaf6ff; color: #0070f3; }
    .gherkin-log-item[data-action="seleciona"] .gherkin-log-icon { background: #f6f9e8; color: #218838; }
    .gherkin-log-item[data-action="espera_nao_existe"] .gherkin-log-icon { background: #fff6f6; color: #e74c3c; }
    .gherkin-log-content {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .gherkin-log-title {
        font-weight: 600;
        color: #222;
        font-size: 1.01em;
        margin-bottom: 2px;
    }
    .gherkin-log-desc {
        color: #555;
        font-size: 0.97em;
        margin-bottom: 0;
    }
    .gherkin-log-meta {
        color: #888;
        font-size: 0.93em;
        margin-top: 2px;
    }
    /* Ajuste para dropdown não sair da tela */
    .gherkin-action-dropdown {
        max-height: 320px;
        overflow-y: auto;
    }
    @media (max-width: 600px) {
        .gherkin-action-dropdown {
            left: 0 !important;
            right: auto !important;
            max-width: 96vw;
        }
        .gherkin-log-panel {
            max-height: 40vw;
        }
    }
    `;
    document.head.appendChild(style);
}
if (typeof window.lastInputTarget === 'undefined') window.lastInputTarget = null;
if (typeof window.inputDebounceTimeout === 'undefined') window.inputDebounceTimeout = null;
if (typeof window.lastInputValue === 'undefined') window.lastInputValue = '';

// Inicializa eventos do painel
setTimeout(() => {
    initializePanelEvents(window.panel);
    // Adiciona arrasto apenas na barra superior
    const header = window.panel.querySelector('.gherkin-panel-header');
    if (header) {
        makePanelDraggable(window.panel, header);
    }
    // Removido: lógica de dica de upload duplicada
    // Garante que updateActionParams seja chamado ao trocar ação
    const actionSelect = document.getElementById('gherkin-action-select');
    if (actionSelect && typeof updateActionParams === 'function') {
        actionSelect.addEventListener('change', () => updateActionParams(window.panel));
        updateActionParams(window.panel);
    }
}, 100);

// Função utilitária para validar se um elemento pode ser preenchido (agora cobre PrimeNG, inputmode, role, classes customizadas)
function isFillableElement(el) {
    if (!el) return false;
    // Caso especial: PrimeNG p-inputnumber (componente customizado)
    if (
        el.tagName === 'P-INPUTNUMBER' ||
        (el.classList && (
            el.classList.contains('p-inputnumber') ||
            el.classList.contains('p-inputnumber-input') ||
            el.classList.contains('p-inputwrapper')
        ))
    ) {
        return true;
    }
    if (el.tagName === 'INPUT') {
        // Tipos tradicionais
        const type = (el.type || '').toLowerCase();
        if ([
            'text', 'email', 'password', 'search', 'tel', 'url', 'number', 'date', 'datetime-local', 'month', 'time', 'week'
        ].includes(type)) return true;
        // PrimeNG/Custom: inputmode="decimal" ou "numeric"
        if (el.getAttribute('inputmode') && ['decimal', 'numeric'].includes(el.getAttribute('inputmode'))) return true;
        // PrimeNG/Custom: role="spinbutton"
        if (el.getAttribute('role') === 'spinbutton') return true;
        // PrimeNG/Custom: classe p-inputtext ou p-inputnumber-input
        const classList = (el.className || '').split(/\s+/);
        if (classList.includes('p-inputtext') || classList.includes('p-inputnumber-input')) return true;
    }
    if (el.tagName === 'TEXTAREA') return true;
    if (el.isContentEditable) return true;
    return false;
}

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
        // Capture acao e acaoValue em variáveis auxiliares para uso posterior
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
    } catch (error) { console.error('Erro ao registrar clique:', error); }
});

// Garante que saveInteractionsToStorage está disponível no escopo global
if (typeof window.saveInteractionsToStorage !== 'function') {
    // Tenta importar da ui.js se não estiver disponível
    if (typeof saveInteractionsToStorage === 'function') {
        window.saveInteractionsToStorage = saveInteractionsToStorage;
    } else {
        // Fallback: função dummy para evitar erro
        window.saveInteractionsToStorage = function() {};
    }
}

function handleInputEvent(event) {
    // Protege contra variáveis não definidas


    try {
        if (!window.isRecording || window.isPaused) return;
        if (!isExtensionContextValid()) return;
        // Ignora eventos de input de campos que não são de passo/teste (ex: nome da feature)
        if (
            !event.target ||
            event.target.closest('#gherkin-panel') ||
            event.target.closest('#gherkin-modal') ||
            event.target.closest('.gherkin-content') ||
            event.target.id === 'gherkin-feature-name' ||
            (event.target.classList && event.target.classList.contains('gherkin-feature-name')) ||
            (event.target.closest && event.target.closest('.gherkin-feature-name'))
        ) return;



        const actionSelect = document.getElementById('gherkin-action-select');
        let acaoValue = 'preenche';
        if (actionSelect && actionSelect.selectedIndex >= 0) {
            acaoValue = actionSelect.value;
        }

        // Só registra ação "preenche" no blur, não no input
        if (acaoValue === 'preenche') {
            // Remove qualquer listener antigo para evitar múltiplos binds
            event.target.removeEventListener('blur', window.__gherkinPreencheBlurHandler, true);
            // Se for um p-inputnumber, também adiciona o handler no próprio componente
            if (event.target.closest && event.target.closest('p-inputnumber')) {
                const pInputNumber = event.target.closest('p-inputnumber');
                pInputNumber.removeEventListener('blur', window.__gherkinPreencheBlurHandler, true);
            }
            window.__gherkinPreencheBlurHandler = function(ev) {
                if (!window.isRecording || window.isPaused) return;
                if (!isExtensionContextValid()) return;
                // Determina o elemento alvo para registro
                let target = ev.target;
                let isPInputNumber = false;
                // Se for p-inputnumber, busca o input interno
                if (target.tagName === 'P-INPUTNUMBER' || (target.classList && target.classList.contains('p-inputnumber'))) {
                    isPInputNumber = true;
                    // Busca o input interno
                    const input = target.querySelector('input.p-inputnumber-input, input.p-inputtext');
                    if (input) target = input;
                }
                const cssSelector = getCSSSelector(target);
                const xpath = typeof getRobustXPath === 'function' ? getRobustXPath(target) : '';
                let nomeElemento = (target.getAttribute('aria-label') || target.getAttribute('name') || target.id || target.className || target.tagName).toString().trim();
                if (!nomeElemento) nomeElemento = target.tagName;
                let value = '';
                // Permite qualquer elemento: tenta pegar value, innerText ou textContent
                if (typeof target.value !== 'undefined') {
                    value = target.value;
                } else if (typeof target.innerText !== 'undefined') {
                    value = target.innerText;
                } else if (typeof target.textContent !== 'undefined') {
                    value = target.textContent;
                }
                // Define o step de acordo com a posição
                let step = 'Then';
                let offset = 0;
                if (window.interactions.length > 0 && window.interactions[0].acao === 'acessa_url') offset = 1;
                if (window.interactions.length === 0) step = 'Given';
                else if (window.interactions.length === 1 && offset === 0) step = 'When';
                else if (window.interactions.length === 1 && offset === 1) step = 'When';
                else if (window.interactions.length === 2 && offset === 1) step = 'Then';
                // Evita duplicidade
                const last = window.interactions[window.interactions.length - 1];
                if (
                    last &&
                    last.acao === 'preenche' &&
                    last.cssSelector === cssSelector &&
                    last.nomeElemento === nomeElemento &&
                    last.valorPreenchido === value
                ) {
                    return;
                }
                window.interactions.push({
                    step,
                    acao: 'preenche',
                    acaoTexto: 'Preencher',
                    nomeElemento,
                    cssSelector,
                    xpath,
                    valorPreenchido: value,
                    timestamp: Date.now()
                });
                renderLogWithActions();
                if (typeof window.saveInteractionsToStorage === 'function') window.saveInteractionsToStorage();
            };
            event.target.addEventListener('blur', window.__gherkinPreencheBlurHandler, true);
            // Se for p-inputnumber, adiciona o blur também no componente pai
            if (event.target.closest && event.target.closest('p-inputnumber')) {
                const pInputNumber = event.target.closest('p-inputnumber');
                pInputNumber.addEventListener('blur', window.__gherkinPreencheBlurHandler, true);
            }
            return;
        }

        // Para outras ações (não preenche), não faz nada aqui
    } catch (err) {
        console.error('Erro no handleInputEvent:', err);
    }
}
document.removeEventListener('input', handleInputEvent, true); // Evita múltiplos binds
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
    showSpinner('Exportando arquivos...');
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
    except Exception as e {
        logging.error(f"Erro inesperado: {e}")
        raise
    }

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
            context.driver.quit();
            logging.info("Driver finalizado com sucesso.")
    } catch (Exception e) {
        logging.error(f"Erro ao finalizar o driver: {e}")
    }
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

        // Ao final da exportação:
        hideSpinner();
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

// --- Substitua a função getRobustXPath por esta implementação robusta ---
function getRobustXPath(element) {
    if (!element || element.nodeType !== 1) return '';

    // Se o elemento tem um id único, use
    if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1) {
        return `//*[@id="${element.id}"]`;
    }

    // Se o elemento tem um name único, use
    if (element.name && document.querySelectorAll(`[name="${element.name}"]`).length === 1) {
        return `//*[@name="${element.name}"]`;
    }

    // Função auxiliar para escapar valores de atributos
    function escapeXpathString(str) {
        if (str.indexOf('"') === -1) {
            return '"' + str + '"';
        }
        if (str.indexOf("'") === -1) {
            return "'" + str + "'";
        }
        return 'concat("' + str.replace(/"/g, '", \'"\', "') + '")';
    }

    // Gera expressão de atributos relevantes
    function getAttrExpr(el) {
        const attrs = [];
        if (el.getAttribute('type')) attrs.push(`@type=${escapeXpathString(el.getAttribute('type'))}`);
        if (el.getAttribute('role')) attrs.push(`@role=${escapeXpathString(el.getAttribute('role'))}`);
        if (el.getAttribute('aria-label')) attrs.push(`@aria-label=${escapeXpathString(el.getAttribute('aria-label'))}`);
        if (el.getAttribute('placeholder')) attrs.push(`@placeholder=${escapeXpathString(el.getAttribute('placeholder'))}`);
        if (el.getAttribute('data-testid')) attrs.push(`@data-testid=${escapeXpathString(el.getAttribute('data-testid'))}`);
        if (el.className && typeof el.className === 'string') {
            const classList = el.className.trim().split(/\s+/).filter(Boolean);
            if (classList.length === 1) attrs.push(`contains(concat(' ',normalize-space(@class),' '), ' ${classList[0]} ')`);
        }
        return attrs.length ? '[' + attrs.join(' and ') + ']' : '';
    }

    // Caminho relativo, subindo até body ou html
    let path = '';
    let current = element;
    while (current && current.nodeType === 1 && current !== document.body && current !== document.documentElement) {
        let tag = current.tagName.toLowerCase();
        let attrExpr = getAttrExpr(current);

        // Se o elemento é único pelo conjunto de atributos, use
        if (attrExpr) {
            const testXpath = '//' + tag + attrExpr;
            try {
                const result = document.evaluate(testXpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                if (result.snapshotLength === 1) {
                    path = '/' + tag + attrExpr + path;
                    break;
                }
            } catch (e) {}
        }

        // Se não for único, tenta sem atributos, mas sem usar índices se possível
        let siblings = Array.from(current.parentNode ? current.parentNode.children : []);
        let sameTagSiblings = siblings.filter(sib => sib.tagName === current.tagName);
        if (sameTagSiblings.length === 1) {
            path = '/' + tag + path;
        } else {
            // Só usa índice se necessário
            let idx = sameTagSiblings.indexOf(current) + 1;
            path = '/' + tag + `[${idx}]` + path;
        }
        current = current.parentNode;
    }
    // Caminho final, sempre relativo ao body/html
    return '.' + path;
}

// --- Fim da nova função getRobustXPath ---

// --- Substituição da função renderLogWithActions para exibir colunas customizadas para "preencher" ---
window.renderLogWithActions = function() {
    const logPanel = document.getElementById('gherkin-log-panel');
    if (!logPanel) return;
    logPanel.innerHTML = '';

    // Cria lista de logs
    const ul = document.createElement('ul');
    ul.className = 'gherkin-log-list';

    window.interactions.forEach((interaction) => {
        const li = document.createElement('li');
        li.className = 'gherkin-log-item';
        li.dataset.action = interaction.acao || '';

        if (interaction.acao === 'preenche') {
            // Layout especial para "Preencher": Gherkin | Ação | Elemento | Valor preenchido
            li.style.alignItems = 'center';
            li.style.gap = '0';

            // Gherkin
            const gherkin = document.createElement('span');
            gherkin.style.flex = '0 0 70px';
            gherkin.style.fontWeight = 'bold';
            gherkin.style.color = '#0070f3';
            gherkin.innerText = interaction.step || '';
            li.appendChild(gherkin);

            // Ícone + Ação
            const action = document.createElement('span');
            action.style.flex = '0 0 110px';
            action.style.display = 'inline-flex';
            action.style.alignItems = 'center';
            action.innerHTML = `<span class="gherkin-log-icon" style="margin-right:6px;">📝</span>${interaction.acaoTexto || 'Preencher'}`;
            li.appendChild(action);

            // Elemento (nome do campo)
            const elemento = document.createElement('span');
            elemento.style.flex = '0 0 120px';
            elemento.style.fontWeight = '500';
            elemento.style.background = '#f7faff';
            elemento.style.borderRadius = '5px';
            elemento.style.padding = '2px 10px';
            elemento.style.margin = '0 8px 0 0';
            elemento.style.color = '#222';
            elemento.style.fontSize = '0.97em';
            elemento.innerText = interaction.nomeElemento || '';
            li.appendChild(elemento);

            // "o valor"
            const labelValor = document.createElement('span');
            labelValor.style.flex = '0 0 auto';
            labelValor.style.color = '#555';
            labelValor.style.fontSize = '0.97em';
            labelValor.style.marginRight = '4px';
            labelValor.innerText = 'o valor';
            li.appendChild(labelValor);

            // Valor preenchido
            const valor = document.createElement('span');
            valor.style.flex = '1';
            valor.style.fontWeight = 'bold';
            valor.style.background = '#fff';
            valor.style.border = '1.5px solid #e0e6ed';
            valor.style.borderRadius = '5px';
            valor.style.padding = '2px 10px';
            valor.style.color = '#222';
            valor.style.fontSize = '0.97em';
            valor.style.wordBreak = 'break-all';
            valor.innerText = typeof interaction.valorPreenchido !== 'undefined' ? interaction.valorPreenchido : '';
            li.appendChild(valor);
        } else {
            // Log padrão para outras ações
            // Ícone
            const icon = document.createElement('span');
            icon.className = 'gherkin-log-icon';
            icon.innerText = (() => {
                switch (interaction.acao) {
                    case 'preenche': return '📝';
                    case 'upload': return '📤';
                    case 'login': return '🔑';
                    case 'clica': return '🖱️';
                    case 'espera': return '⏳';
                    case 'espera_elemento': return '👁️';
                    case 'acessa_url': return '🌐';
                    case 'seleciona': return '✅';
                    case 'espera_nao_existe': return '🚫';
                    default: return '🔹';
                }
            })();
            li.appendChild(icon);

            // Conteúdo
            const content = document.createElement('div');
            content.className = 'gherkin-log-content';

            // Título
            const title = document.createElement('div');
            title.className = 'gherkin-log-title';
            title.innerText = `${interaction.step || ''} ${interaction.acaoTexto || interaction.acao || ''}`;
            content.appendChild(title);

            // Descrição
            const desc = document.createElement('div');
            desc.className = 'gherkin-log-desc';
            desc.innerText = interaction.nomeElemento || '';
            content.appendChild(desc);

            // Valor preenchido (apenas se existir, para manter compatibilidade)
            if (typeof interaction.valorPreenchido !== 'undefined' && interaction.acao !== 'preenche') {
                const meta = document.createElement('div');
                meta.className = 'gherkin-log-meta';
                meta.innerText = `Valor: "${interaction.valorPreenchido}"`;
                content.appendChild(meta);
            }

            li.appendChild(content);
        }

        ul.appendChild(li);
    });

    logPanel.appendChild(ul);
};

// --- Adaptação para permitir edição do "Valor preenchido" no modal de edição de interação ---
// Supondo que showEditModal é responsável por exibir o modal de edição de interação
window.showEditModal = function(interaction, idx) {
    // ...existing code to create modal...

    // Campo Passo BDD
    // ...existing code...

    // Campo Ação
    // ...existing code...

    // Campo Nome do elemento
    // ...existing code...

    // Adiciona campo "Valor preenchido" apenas para ação "preenche"
    let valorPreenchidoInput = null;
    if (interaction.acao === 'preenche') {
        const valorLabel = document.createElement('label');
        valorLabel.innerText = 'Valor preenchido:';
        valorLabel.setAttribute('for', 'gherkin-edit-valor-preenchido');
        valorLabel.style.marginTop = '8px';

        valorPreenchidoInput = document.createElement('input');
        valorPreenchidoInput.type = 'text';
        valorPreenchidoInput.id = 'gherkin-edit-valor-preenchido';
        valorPreenchidoInput.value = typeof interaction.valorPreenchido !== 'undefined' ? interaction.valorPreenchido : '';
        valorPreenchidoInput.style.marginBottom = '12px';
        valorPreenchidoInput.autocomplete = 'off';

        // Adiciona ao modal
        modalContent.appendChild(valorLabel);
        modalContent.appendChild(valorPreenchidoInput);
    }

    // ...existing code for Salvar/Cancelar...

    saveBtn.onclick = function() {
        // ...existing code to coletar outros campos...

        // Coleta o valor preenchido se for ação "preenche"
        if (interaction.acao === 'preenche' && valorPreenchidoInput) {
            interaction.valorPreenchido = valorPreenchidoInput.value;
        }

        // ...existing code to salvar interação e fechar modal...
    };

    // ...existing code...
};
