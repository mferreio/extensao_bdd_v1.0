// Gerenciamento de eventos de captura
import { getRobustXPath, getCSSSelector, getContextualSelector, validateSelector, optimizeSelector, testSelectorRobustness, generateAlternativeSelectors } from '../utils/dom.js';
import { getStore } from '../state/store.js';

// Helper para identificar elementos da própria extensão
function isExtensionElement(target) {
    if (!target) return false;

    // IDs principais
    if (target.id === 'gherkin-panel' ||
        target.id === 'gherkin-manual-modal' ||
        target.id === 'gherkin-inspection-overlay' ||
        target.id === 'gherkin-element-highlight') return true;

    // Classes principais
    if (target.classList && (
        target.classList.contains('gherkin-panel') ||
        target.classList.contains('gherkin-modal-overlay') ||
        target.classList.contains('gherkin-modal-content') ||
        target.classList.contains('gherkin-context-menu')
    )) return true;

    // Closest checks
    if (target.closest('#gherkin-panel') ||
        target.closest('#gherkin-manual-modal') ||
        target.closest('.gherkin-modal-overlay') ||
        target.closest('.gherkin-context-menu') ||
        target.closest('.gherkin-action-dropdown') ||
        target.closest('.gherkin-content')) {
        return true;
    }

    return false;
}

// Função para aplicar a regra correta dos steps BDD
function applyCorrectStepOrder(interactions) {
    if (!interactions || interactions.length === 0) return interactions;

    return interactions.map((interaction, index) => {
        let step = 'When';
        if (index === 0) {
            step = 'Given';
        } else if (index === interactions.length - 1) {
            step = 'Then';
        }
        return { ...interaction, step };
    });
}

function processAndAddInteraction(interaction) {
    const store = getStore();
    const state = store.getState();
    const currentInteractions = [...state.interactions, interaction];
    const updatedInteractions = applyCorrectStepOrder(currentInteractions);

    store.setState({ interactions: updatedInteractions });
}

export function handleClickEvent(event) {
    const store = getStore();
    const { isRecording, isPaused } = store.getState();

    if (!isRecording || isPaused) return;

    const target = event.target;
    if (!target) return;

    // Verifica se o clique foi em elementos da própria extensão usando o helper
    if (isExtensionElement(target)) {
        return;
    }

    // Gera seletores robustos
    const contextualSelectors = getContextualSelector(target);
    let xpath = contextualSelectors.xpath;
    let cssSelector = contextualSelectors.css;

    // Gera seletores alternativos
    const alternativeSelectors = generateAlternativeSelectors(target);

    // Otimiza os seletores
    cssSelector = optimizeSelector(target, cssSelector, 'css');
    xpath = optimizeSelector(target, xpath, 'xpath');

    // Testa a robustez dos seletores
    const robustnessCSS = testSelectorRobustness(target, cssSelector, 'css');
    const robustnessXPath = testSelectorRobustness(target, xpath, 'xpath');

    // Se os seletores não são robustos, usa as versões recomendadas
    if (!robustnessCSS.isUnique || !robustnessCSS.isStable) {
        cssSelector = robustnessCSS.recommendedSelector;
    }
    if (!robustnessXPath.isUnique || !robustnessXPath.isStable) {
        xpath = robustnessXPath.recommendedSelector;
    }

    const tagName = target.tagName.toLowerCase();
    const type = target.type || '';

    // Aplicar filtro: não registrar cliques em elementos preenchíveis
    if (isFillableElement(target)) {
        // Para elementos preenchíveis, só registrar se for uma ação de preenchimento
        // ou validação, não cliques
        return;
    }

    // Determina o texto visível do elemento de forma mais robusta
    let nomeElemento = getElementDisplayName(target);

    // Seleciona a ação baseada no elemento
    // Tenta pegar do select global se existir (ui hack, mas aceitável se sincronizado)
    const actionSelect = document.getElementById('gherkin-action-select');
    let acao = actionSelect ? actionSelect.value : 'clica';

    // Override baseada no tipo
    if (type === 'file') {
        acao = 'upload';
    } else if (type === 'checkbox') {
        acao = 'marca_checkbox';
    } else if (type === 'radio') {
        acao = 'seleciona_radio';
    }

    // Verificar se a ação é permitida
    if (!isActionAllowedForElement(target, acao)) {
        const allowedActions = getRelevantActionsForElement(target);
        if (allowedActions.length > 0) {
            acao = allowedActions[0];
        } else {
            return;
        }
    }

    const interaction = {
        step: 'When', // Será ajustado
        acao: acao,
        nomeElemento: nomeElemento,
        cssSelector: cssSelector,
        xpath: xpath,
        timestamp: Date.now(),
        tagName: tagName,
        elementType: type,
        isValid: {
            css: validateSelector(cssSelector, 'css'),
            xpath: validateSelector(xpath, 'xpath')
        },
        robustness: {
            css: robustnessCSS,
            xpath: robustnessXPath
        },
        alternativeSelectors: alternativeSelectors
    };

    processAndAddInteraction(interaction);
}

export function handleInputEvent(event) {
    // A captura acontece apenas no evento blur
    return;
}

export function handleBlurEvent(event) {
    const store = getStore();
    const { isRecording, isPaused } = store.getState();

    if (!isRecording || isPaused) return;

    const target = event.target;
    if (!target) return;

    // Filtros de UI da extensão usando helper
    if (isExtensionElement(target)) {
        return;
    }

    if (!isFillableElement(target)) return;

    // Só registra se o valor foi alterado e não está vazio
    if (!target.value || target.value.trim() === '') return;

    const contextualSelectors = getContextualSelector(target);
    let xpath = contextualSelectors.xpath;
    let cssSelector = contextualSelectors.css;
    const alternativeSelectors = generateAlternativeSelectors(target);

    cssSelector = optimizeSelector(target, cssSelector, 'css');
    xpath = optimizeSelector(target, xpath, 'xpath');

    const robustnessCSS = testSelectorRobustness(target, cssSelector, 'css');
    const robustnessXPath = testSelectorRobustness(target, xpath, 'xpath');

    if (!robustnessCSS.isUnique || !robustnessCSS.isStable) {
        cssSelector = robustnessCSS.recommendedSelector;
    }
    if (!robustnessXPath.isUnique || !robustnessXPath.isStable) {
        xpath = robustnessXPath.recommendedSelector;
    }

    let nomeElemento = getElementDisplayName(target);

    const interaction = {
        step: 'When',
        acao: 'preenche',
        nomeElemento: nomeElemento,
        valorPreenchido: target.value,
        cssSelector: cssSelector,
        xpath: xpath,
        timestamp: Date.now(),
        tagName: target.tagName.toLowerCase(),
        elementType: target.type || '',
        isValid: {
            css: validateSelector(cssSelector, 'css'),
            xpath: validateSelector(xpath, 'xpath')
        },
        robustness: {
            css: robustnessCSS,
            xpath: robustnessXPath
        },
        alternativeSelectors: alternativeSelectors
    };

    processAndAddInteraction(interaction);
}

function isFillableElement(el) {
    if (!el || el.nodeType !== 1) return false;

    const tag = el.tagName.toLowerCase();
    const type = el.type ? el.type.toLowerCase() : '';

    if (tag === 'input' && ['text', 'email', 'password', 'search', 'tel', 'url', 'number'].includes(type)) {
        return true;
    }
    if (tag === 'textarea') return true;
    if (el.contentEditable === 'true') return true;
    if (el.classList.contains('p-inputtext') ||
        el.classList.contains('p-component') ||
        el.getAttribute('data-pc-name') === 'inputtext') {
        return true;
    }

    return false;
}

function getElementDisplayName(element) {
    if (!element) return '';

    const tag = element.tagName.toLowerCase();
    if (['button', 'a', 'span', 'div'].includes(tag) || element.getAttribute('role') === 'button') {
        const text = element.textContent?.trim();
        if (text && text.length > 0 && text.length < 100) {
            return text;
        }
    }

    if (['input', 'textarea', 'select'].includes(tag)) {
        if (element.placeholder) return element.placeholder;
        if (element.getAttribute('aria-label')) return element.getAttribute('aria-label');

        const label = findAssociatedLabel(element);
        if (label && label.textContent?.trim()) {
            return label.textContent.trim();
        }

        if (element.name) return element.name;
        if (element.id) return element.id;
    }

    if (tag === 'img') {
        return element.alt || element.title || 'imagem';
    }

    return element.title ||
        element.getAttribute('aria-label') ||
        element.value ||
        element.textContent?.trim() ||
        tag;
}

function findAssociatedLabel(element) {
    if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) return label;
    }

    const parentLabel = element.closest('label');
    if (parentLabel) return parentLabel;

    let prev = element.previousElementSibling;
    while (prev) {
        if (prev.tagName?.toLowerCase() === 'label') {
            return prev;
        }
        prev = prev.previousElementSibling;
    }

    let next = element.nextElementSibling;
    while (next) {
        if (next.tagName?.toLowerCase() === 'label') {
            return next;
        }
        next = next.nextElementSibling;
    }

    return null;
}

function getRelevantActionsForElement(element) {
    const tag = element.tagName.toLowerCase();
    const type = element.type?.toLowerCase() || '';
    const role = element.getAttribute('role')?.toLowerCase() || '';

    if (isFillableElement(element)) {
        return ['preenche', 'valida_existe'];
    }

    if (tag === 'button' ||
        (tag === 'input' && ['submit', 'button'].includes(type)) ||
        role === 'button' ||
        (tag === 'a' && element.href)) {
        return ['clica', 'valida_existe'];
    }

    if (tag === 'select') {
        return ['seleciona', 'valida_existe'];
    }

    if (tag === 'input' && type === 'checkbox') {
        return ['marca_checkbox', 'valida_existe'];
    }

    if (tag === 'input' && type === 'radio') {
        return ['seleciona_radio', 'valida_existe'];
    }

    if (tag === 'input' && type === 'file') {
        return ['upload', 'valida_existe'];
    }

    if (['span', 'div', 'label', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        return ['valida_contem', 'valida_existe'];
    }

    if (tag === 'img') {
        return ['valida_existe'];
    }

    return ['clica', 'valida_existe'];
}

function isActionAllowedForElement(element, action) {
    const allowedActions = getRelevantActionsForElement(element);
    return allowedActions.includes(action);
}

export function handleChangeEvent(event) {
    const store = getStore();
    const { isRecording, isPaused } = store.getState();

    if (!isRecording || isPaused) return;

    const target = event.target;
    if (!target) return;

    // Filtros de UI da extensão usando helper
    if (isExtensionElement(target)) {
        return;
    }

    const tag = target.tagName.toLowerCase();
    const type = target.type?.toLowerCase() || '';

    const contextualSelectors = getContextualSelector(target);
    let xpath = contextualSelectors.xpath;
    let cssSelector = contextualSelectors.css;

    cssSelector = optimizeSelector(target, cssSelector, 'css');
    xpath = optimizeSelector(target, xpath, 'xpath');

    const robustnessCSS = testSelectorRobustness(target, cssSelector, 'css');
    const robustnessXPath = testSelectorRobustness(target, xpath, 'xpath');

    if (!robustnessCSS.isUnique || !robustnessCSS.isStable) {
        cssSelector = robustnessCSS.recommendedSelector;
    }
    if (!robustnessXPath.isUnique || !robustnessXPath.isStable) {
        xpath = robustnessXPath.recommendedSelector;
    }

    let nomeElemento = getElementDisplayName(target);
    let acao = '';
    let valorPreenchido = '';

    if (tag === 'select') {
        acao = 'seleciona';
        valorPreenchido = target.options[target.selectedIndex]?.text || target.value;
    } else if (type === 'checkbox') {
        acao = target.checked ? 'marca_checkbox' : 'desmarca_checkbox';
        valorPreenchido = target.checked ? 'marcado' : 'desmarcado';
    } else if (type === 'radio') {
        acao = 'seleciona_radio';
        valorPreenchido = target.value;
    } else if (type === 'file') {
        acao = 'upload';
        valorPreenchido = target.files[0]?.name || 'arquivo';
    } else {
        return;
    }

    const interaction = {
        step: 'When',
        acao: acao,
        nomeElemento: nomeElemento,
        valorPreenchido: valorPreenchido,
        cssSelector: cssSelector,
        xpath: xpath,
        timestamp: Date.now(),
        tagName: tag,
        elementType: type,
        isValid: {
            css: validateSelector(cssSelector, 'css'),
            xpath: validateSelector(xpath, 'xpath')
        },
        robustness: {
            css: robustnessCSS,
            xpath: robustnessXPath
        }
    };

    processAndAddInteraction(interaction);
}

export function handleKeydownEvent(event) {
    const store = getStore();
    const { isRecording, isPaused } = store.getState();

    if (!isRecording || isPaused) return;

    const target = event.target;
    if (!target) return;

    // Filtros de UI da extensão usando helper
    if (isExtensionElement(target)) {
        return;
    }

    const key = event.key;
    const relevantKeys = ['Enter', 'Escape', 'Tab'];
    if (!relevantKeys.includes(key)) return;

    if (key === 'Enter' && target.form) {
        const interaction = {
            step: 'When',
            acao: 'pressiona_enter',
            nomeElemento: getElementDisplayName(target),
            valorPreenchido: 'Enter',
            timestamp: Date.now(),
            keyPressed: key
        };

        processAndAddInteraction(interaction);
    }
}

export function handleNavigationEvent(event) {
    const store = getStore();
    const { isRecording, isPaused, interactions } = store.getState();

    if (!isRecording || isPaused) return;

    const url = window.location.href;

    if (interactions.length > 0) {
        const lastInteraction = interactions[interactions.length - 1];
        if (lastInteraction.acao === 'acessa_url' && lastInteraction.valorPreenchido === url) {
            return;
        }
    }

    const interaction = {
        step: 'Given',
        acao: 'acessa_url',
        nomeElemento: 'página',
        valorPreenchido: url,
        timestamp: Date.now(),
        eventType: event.type || 'navigation'
    };

    processAndAddInteraction(interaction);
}
