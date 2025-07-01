// Gerenciamento de eventos de captura
import { getRobustXPath, getCSSSelector, getContextualSelector, validateSelector, optimizeSelector, testSelectorRobustness, generateAlternativeSelectors } from '../utils/dom.js';

// Função para aplicar a regra correta dos steps BDD
function applyCorrectStepOrder() {
    if (!window.interactions || window.interactions.length === 0) return;
    
    // Aplicar a regra: 1º = Given, último = Then, demais = When
    for (let i = 0; i < window.interactions.length; i++) {
        if (i === 0) {
            // Primeiro step é sempre "Given"
            window.interactions[i] = {
                ...window.interactions[i],
                step: 'Given'
            };
        } else if (i === window.interactions.length - 1) {
            // Último step é sempre "Then"
            window.interactions[i] = {
                ...window.interactions[i],
                step: 'Then'
            };
        } else {
            // Steps intermediários são "When"
            window.interactions[i] = {
                ...window.interactions[i],
                step: 'When'
            };
        }
    }
}

export function handleClickEvent(event) {
    if (!window.isRecording || window.isPaused) return;
    
    const target = event.target;
    if (!target) return;
    
    // Verifica se o clique foi em elementos da própria extensão
    if (target.closest('#gherkin-panel') || 
        target.closest('#gherkin-modal') || 
        target.closest('.gherkin-modal-bg') ||
        target.closest('.gherkin-context-menu') ||
        target.closest('.gherkin-action-dropdown') ||
        target.closest('.gherkin-content') ||
        target.id === 'gherkin-panel' ||
        target.id === 'gherkin-modal' ||
        target.classList.contains('gherkin-panel') ||
        target.classList.contains('gherkin-modal-bg') ||
        target.classList.contains('gherkin-context-menu') ||
        target.classList.contains('gherkin-action-dropdown') ||
        target.classList.contains('gherkin-content')) {
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
    const actionSelect = document.getElementById('gherkin-action-select');
    let acao = actionSelect ? actionSelect.value : 'clica';
    
    if (type === 'file') {
        acao = 'upload';
    } else if (type === 'checkbox') {
        acao = 'marca_checkbox';
    } else if (type === 'radio') {
        acao = 'seleciona_radio';
    }
    
    // Verificar se a ação é permitida para este tipo de elemento
    if (!isActionAllowedForElement(target, acao)) {
        // Se a ação não é permitida, usar a primeira ação recomendada
        const allowedActions = getRelevantActionsForElement(target);
        if (allowedActions.length > 0) {
            acao = allowedActions[0]; // Usar a primeira ação recomendada
        } else {
            return; // Se não há ações permitidas, não registrar
        }
    }

    const interaction = {
        step: 'When', // Temporário, será ajustado pela função applyCorrectStepOrder
        acao: acao,
        nomeElemento: nomeElemento,
        cssSelector: cssSelector,
        xpath: xpath,
        timestamp: Date.now(),
        // Adiciona informações adicionais para debug
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
        // Adiciona seletores alternativos
        alternativeSelectors: alternativeSelectors
    };

    window.interactions.push(interaction);
    
    // Aplicar a regra correta dos steps BDD
    applyCorrectStepOrder();
    
    // Atualizar contador de ações
    if (typeof window.updateActionsCounter === 'function') {
        window.updateActionsCounter();
    }
    
    if (typeof saveInteractionsToStorage === 'function') {
        saveInteractionsToStorage();
    }
    if (typeof renderLogWithActions === 'function') {
        renderLogWithActions();
    }
}

export function handleInputEvent(event) {
    // Esta função agora não registra imediatamente
    // A captura acontece apenas no evento blur (perda de foco)
    return;
}

export function handleBlurEvent(event) {
    if (!window.isRecording || window.isPaused) return;
    
    const target = event.target;
    if (!target) return;
    
    // Verifica se o blur foi em elementos da própria extensão
    if (target.closest('#gherkin-panel') || 
        target.closest('#gherkin-modal') || 
        target.closest('.gherkin-modal-bg') ||
        target.closest('.gherkin-context-menu') ||
        target.closest('.gherkin-action-dropdown') ||
        target.closest('.gherkin-content') ||
        target.id === 'gherkin-panel' ||
        target.id === 'gherkin-modal' ||
        target.classList.contains('gherkin-panel') ||
        target.classList.contains('gherkin-modal-bg') ||
        target.classList.contains('gherkin-context-menu') ||
        target.classList.contains('gherkin-action-dropdown') ||
        target.classList.contains('gherkin-content')) {
        return;
    }
    
    if (!isFillableElement(target)) return;
    
    // Só registra se o valor foi alterado
    if (!target.value || target.value.trim() === '') return;

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
    
    let nomeElemento = getElementDisplayName(target);

    const interaction = {
        step: 'When',
        acao: 'preenche',
        nomeElemento: nomeElemento,
        valorPreenchido: target.value,
        cssSelector: cssSelector,
        xpath: xpath,
        timestamp: Date.now(),
        // Adiciona informações adicionais para debug
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
        // Adiciona seletores alternativos
        alternativeSelectors: alternativeSelectors
    };

    window.interactions.push(interaction);
    
    // Aplicar a regra correta dos steps BDD
    applyCorrectStepOrder();
    
    // Atualizar contador de ações
    if (typeof window.updateActionsCounter === 'function') {
        window.updateActionsCounter();
    }
    
    if (typeof saveInteractionsToStorage === 'function') {
        saveInteractionsToStorage();
    }
    if (typeof renderLogWithActions === 'function') {
        renderLogWithActions();
    }
}

function isFillableElement(el) {
    if (!el || el.nodeType !== 1) return false;
    
    const tag = el.tagName.toLowerCase();
    const type = el.type ? el.type.toLowerCase() : '';
    
    // Campos de input básicos
    if (tag === 'input' && ['text', 'email', 'password', 'search', 'tel', 'url', 'number'].includes(type)) {
        return true;
    }
    
    // Textarea
    if (tag === 'textarea') return true;
    
    // Elementos com contenteditable
    if (el.contentEditable === 'true') return true;
    
    // Campos específicos do PrimeNG e outros frameworks
    if (el.classList.contains('p-inputtext') || 
        el.classList.contains('p-component') ||
        el.getAttribute('data-pc-name') === 'inputtext') {
        return true;
    }
    
    return false;
}

// Função para extrair o nome de exibição mais apropriado de um elemento
function getElementDisplayName(element) {
    if (!element) return '';

    // Para botões, links e elementos clicáveis, prioriza o texto visível
    const tag = element.tagName.toLowerCase();
    if (['button', 'a', 'span', 'div'].includes(tag) || element.getAttribute('role') === 'button') {
        const text = element.textContent?.trim();
        if (text && text.length > 0 && text.length < 100) {
            return text;
        }
    }

    // Para campos de input, prioriza placeholder, label ou aria-label
    if (['input', 'textarea', 'select'].includes(tag)) {
        // Tenta placeholder primeiro
        if (element.placeholder) {
            return element.placeholder;
        }

        // Tenta aria-label
        if (element.getAttribute('aria-label')) {
            return element.getAttribute('aria-label');
        }

        // Tenta encontrar label associado
        const label = findAssociatedLabel(element);
        if (label && label.textContent?.trim()) {
            return label.textContent.trim();
        }

        // Tenta name ou id
        if (element.name) {
            return element.name;
        }
        if (element.id) {
            return element.id;
        }
    }

    // Para imagens, usa alt ou title
    if (tag === 'img') {
        return element.alt || element.title || 'imagem';
    }

    // Fallback para atributos gerais
    return element.title || 
           element.getAttribute('aria-label') || 
           element.value || 
           element.textContent?.trim() || 
           tag;
}

// Função auxiliar para encontrar label associado a um input (duplicada para disponibilizar localmente)
function findAssociatedLabel(element) {
    // Verifica se existe label com for="id"
    if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) return label;
    }

    // Verifica se o input está dentro de um label
    const parentLabel = element.closest('label');
    if (parentLabel) return parentLabel;

    // Verifica se existe um label próximo (irmão anterior)
    let prev = element.previousElementSibling;
    while (prev) {
        if (prev.tagName?.toLowerCase() === 'label') {
            return prev;
        }
        prev = prev.previousElementSibling;
    }

    // Verifica irmão seguinte
    let next = element.nextElementSibling;
    while (next) {
        if (next.tagName?.toLowerCase() === 'label') {
            return next;
        }
        next = next.nextElementSibling;
    }

    return null;
}

// Função para determinar ações relevantes por tipo de elemento
function getRelevantActionsForElement(element) {
    const tag = element.tagName.toLowerCase();
    const type = element.type?.toLowerCase() || '';
    const role = element.getAttribute('role')?.toLowerCase() || '';
    
    // Elementos preenchíveis - só preencher e validar existência
    if (isFillableElement(element)) {
        return ['preenche', 'valida_existe'];
    }
    
    // Botões e elementos clicáveis
    if (tag === 'button' || 
        (tag === 'input' && ['submit', 'button'].includes(type)) ||
        role === 'button' ||
        (tag === 'a' && element.href)) {
        return ['clica', 'valida_existe'];
    }
    
    // Select/Dropdown
    if (tag === 'select') {
        return ['seleciona', 'valida_existe'];
    }
    
    // Checkbox
    if (tag === 'input' && type === 'checkbox') {
        return ['marca_checkbox', 'valida_existe'];
    }
    
    // Radio button
    if (tag === 'input' && type === 'radio') {
        return ['seleciona_radio', 'valida_existe'];
    }
    
    // Upload de arquivo
    if (tag === 'input' && type === 'file') {
        return ['upload', 'valida_existe'];
    }
    
    // Elementos de texto/display (span, div, label, p)
    if (['span', 'div', 'label', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        return ['valida_contem', 'valida_existe'];
    }
    
    // Elementos de imagem
    if (tag === 'img') {
        return ['valida_existe'];
    }
    
    // Default para outros elementos clicáveis
    return ['clica', 'valida_existe'];
}

// Função para verificar se a ação é permitida para o elemento
function isActionAllowedForElement(element, action) {
    const allowedActions = getRelevantActionsForElement(element);
    return allowedActions.includes(action);
}
