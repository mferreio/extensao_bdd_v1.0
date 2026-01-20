// Utilitários para manipulação do DOM
export function getCSSSelector(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

    // Se o elemento tem um id único, use diretamente
    if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1) {
        return `#${element.id}`;
    }

    // Se o elemento tem um name único, use 
    if (element.name && document.querySelectorAll(`[name="${CSS.escape(element.name)}"]`).length === 1) {
        return `[name="${element.name}"]`;
    }

    // Tenta atributos únicos prioritários
    const uniqueAttrs = ['data-testid', 'data-qa', 'data-test', 'data-cy'];
    for (const attr of uniqueAttrs) {
        const val = element.getAttribute(attr);
        if (val && document.querySelectorAll(`[${attr}="${CSS.escape(val)}"]`).length === 1) {
            return `[${attr}="${val}"]`;
        }
    }

    // Se tem aria-label único, use
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && document.querySelectorAll(`[aria-label="${CSS.escape(ariaLabel)}"]`).length === 1) {
        return `[aria-label="${ariaLabel}"]`;
    }

    function buildRobustSelector(el) {
        let selector = el.tagName.toLowerCase();
        const selectorParts = [];

        // Adiciona type se for input
        if (el.type && el.tagName.toLowerCase() === 'input') {
            selectorParts.push(`[type="${el.type}"]`);
        }

        // Adiciona role se existir
        if (el.getAttribute('role')) {
            selectorParts.push(`[role="${el.getAttribute('role')}"]`);
        }

        // Adiciona name se existir (mesmo que não seja único)
        if (el.name) {
            selectorParts.push(`[name="${el.name}"]`);
        }

        // Adiciona placeholder se existir
        if (el.getAttribute('placeholder')) {
            selectorParts.push(`[placeholder="${el.getAttribute('placeholder')}"]`);
        }

        // Adiciona classes mais específicas (evita classes genéricas)
        if (el.className && typeof el.className === 'string') {
            const classes = el.className.trim().split(/\s+/).filter(cls => {
                // Filtra classes que parecem ser específicas do componente
                return cls &&
                    !cls.match(/^(btn|button|input|form|text|primary|secondary|active|focus|hover|selected)$/i) &&
                    cls.length > 2;
            });
            if (classes.length > 0) {
                // Usa no máximo 2 classes mais específicas
                const specificClasses = classes.slice(0, 2);
                selectorParts.push(...specificClasses.map(cls => `.${cls}`));
            }
        }

        // Adiciona atributos específicos de frameworks (PrimeNG, etc.)
        const frameworkAttrs = ['data-pc-name', 'data-pc-section'];
        frameworkAttrs.forEach(attr => {
            const val = el.getAttribute(attr);
            if (val) {
                selectorParts.push(`[${attr}="${val}"]`);
            }
        });

        // Constrói o seletor final
        let finalSelector = selector + selectorParts.join('');

        // Verifica se o seletor é único
        try {
            const matches = document.querySelectorAll(finalSelector);
            if (matches.length === 1) {
                return finalSelector;
            }
        } catch (e) {
            // Se o seletor for inválido, volta para o básico
        }

        // Se não for único, tenta construir um caminho mais específico
        return buildPathSelector(el);
    }

    function buildPathSelector(el) {
        const path = [];
        let current = el;

        while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
            let selector = current.tagName.toLowerCase();

            // Se tem ID, para aqui
            if (current.id) {
                path.unshift(`#${current.id}`);
                break;
            }

            // Adiciona informações que tornam o seletor mais específico
            const parts = [];

            if (current.className && typeof current.className === 'string') {
                const classes = current.className.trim().split(/\s+/).filter(cls =>
                    cls && cls.length > 2 &&
                    !cls.match(/^(active|focus|hover|selected)$/i)
                );
                if (classes.length > 0) {
                    parts.push(`.${classes[0]}`);
                }
            }

            if (current.getAttribute('type') && current.tagName.toLowerCase() === 'input') {
                parts.push(`[type="${current.getAttribute('type')}"]`);
            }

            if (current.getAttribute('role')) {
                parts.push(`[role="${current.getAttribute('role')}"]`);
            }

            selector += parts.join('');

            // Verifica se precisa de um índice
            const siblings = Array.from(current.parentNode?.children || []);
            const sameTagSiblings = siblings.filter(sib =>
                sib.tagName === current.tagName &&
                sib.className === current.className
            );

            if (sameTagSiblings.length > 1) {
                const index = sameTagSiblings.indexOf(current) + 1;
                selector += `:nth-of-type(${index})`;
            }

            path.unshift(selector);
            current = current.parentNode;
        }

        return path.join(' > ');
    }

    return buildRobustSelector(element);
}

export function getRobustXPath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

    // Se o elemento tem um id único, use
    if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1) {
        return `//*[@id="${element.id}"]`;
    }

    // Se o elemento tem um name único, use
    if (element.name && document.querySelectorAll(`[name="${element.name}"]`).length === 1) {
        return `//*[@name="${element.name}"]`;
    }

    // Função auxiliar para escapar valores de atributos no XPath
    function escapeXpathString(str) {
        if (!str) return '""';
        if (str.indexOf('"') === -1) {
            return '"' + str + '"';
        }
        if (str.indexOf("'") === -1) {
            return "'" + str + "'";
        }
        return 'concat("' + str.replace(/"/g, '", \'"\', "') + '")';
    }

    // Tenta atributos únicos prioritários primeiro
    const uniqueAttrs = ['data-testid', 'data-qa', 'data-test', 'data-cy'];
    for (const attr of uniqueAttrs) {
        const val = element.getAttribute(attr);
        if (val && document.querySelectorAll(`[${attr}="${val}"]`).length === 1) {
            return `//*[@${attr}=${escapeXpathString(val)}]`;
        }
    }

    // Tenta aria-label único
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && document.querySelectorAll(`[aria-label="${ariaLabel}"]`).length === 1) {
        return `//*[@aria-label=${escapeXpathString(ariaLabel)}]`;
    }

    // Gera expressão de atributos relevantes para um elemento
    function getAttrExpr(el) {
        const attrs = [];

        // Prioriza atributos mais estáveis
        if (el.getAttribute('type')) {
            attrs.push(`@type=${escapeXpathString(el.getAttribute('type'))}`);
        }
        if (el.getAttribute('role')) {
            attrs.push(`@role=${escapeXpathString(el.getAttribute('role'))}`);
        }
        if (el.getAttribute('aria-label')) {
            attrs.push(`@aria-label=${escapeXpathString(el.getAttribute('aria-label'))}`);
        }
        if (el.getAttribute('placeholder')) {
            attrs.push(`@placeholder=${escapeXpathString(el.getAttribute('placeholder'))}`);
        }
        if (el.getAttribute('name') && el.getAttribute('name').length < 50) {
            attrs.push(`@name=${escapeXpathString(el.getAttribute('name'))}`);
        }

        // Atributos específicos de frameworks
        if (el.getAttribute('data-pc-name')) {
            attrs.push(`@data-pc-name=${escapeXpathString(el.getAttribute('data-pc-name'))}`);
        }
        if (el.getAttribute('data-pc-section')) {
            attrs.push(`@data-pc-section=${escapeXpathString(el.getAttribute('data-pc-section'))}`);
        }

        // Classes específicas (evita classes genéricas)
        if (el.className && typeof el.className === 'string') {
            const classList = el.className.trim().split(/\s+/).filter(cls => {
                return cls && cls.length > 2 &&
                    !cls.match(/^(btn|button|input|form|text|primary|secondary|active|focus|hover|selected|disabled)$/i);
            });

            // Usa apenas uma classe mais específica
            if (classList.length > 0) {
                const specificClass = classList[0];
                attrs.push(`contains(concat(' ',normalize-space(@class),' '), ' ${specificClass} ')`);
            }
        }

        return attrs.length ? '[' + attrs.join(' and ') + ']' : '';
    }

    // Função para verificar se um XPath é único
    function isXPathUnique(xpath) {
        try {
            const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            return result.snapshotLength === 1;
        } catch (e) {
            return false;
        }
    }

    // Caminho relativo, subindo até encontrar um seletor único
    let path = '';
    let current = element;
    let attempts = 0;
    const maxAttempts = 10; // Evita loops infinitos

    while (current && current.nodeType === Node.ELEMENT_NODE &&
        current !== document.body && current !== document.documentElement &&
        attempts < maxAttempts) {

        attempts++;
        let tag = current.tagName.toLowerCase();
        let attrExpr = getAttrExpr(current);

        // Se o elemento é único pelo conjunto de atributos, use
        if (attrExpr) {
            const testXpath = '//' + tag + attrExpr;
            if (isXPathUnique(testXpath)) {
                return testXpath + path;
            }
        }

        // Tenta com texto se for um elemento que contém texto
        const textContent = current.textContent?.trim();
        if (textContent && textContent.length > 0 && textContent.length < 100) {
            const textXpath = `//${tag}[normalize-space(text())=${escapeXpathString(textContent)}]`;
            if (isXPathUnique(textXpath)) {
                return textXpath + path;
            }
        }

        // Se não for único, constrói o caminho hierárquico
        let siblings = Array.from(current.parentNode ? current.parentNode.children : []);
        let sameTagSiblings = siblings.filter(sib => sib.tagName === current.tagName);

        if (sameTagSiblings.length === 1) {
            // Único filho com essa tag
            path = '/' + tag + path;
        } else {
            // Múltiplos irmãos com a mesma tag - usa índice
            let idx = sameTagSiblings.indexOf(current) + 1;
            path = '/' + tag + `[${idx}]` + path;
        }

        current = current.parentNode;
    }

    // Se chegou até aqui, tenta diferentes estratégias

    // Estratégia 1: XPath absoluto simples
    const absolutePath = getAbsolutePath(element);
    if (absolutePath && isXPathUnique(absolutePath)) {
        return absolutePath;
    }

    // Estratégia 2: Volta para o relativo com body
    return '//' + element.tagName.toLowerCase() + path;

    function getAbsolutePath(el) {
        const path = [];
        let current = el;

        while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.documentElement) {
            let tag = current.tagName.toLowerCase();

            if (current.id) {
                path.unshift(`${tag}[@id="${current.id}"]`);
                break;
            }

            const siblings = Array.from(current.parentNode?.children || []);
            const sameTagSiblings = siblings.filter(sib => sib.tagName === current.tagName);

            if (sameTagSiblings.length > 1) {
                const idx = sameTagSiblings.indexOf(current) + 1;
                path.unshift(`${tag}[${idx}]`);
            } else {
                path.unshift(tag);
            }

            current = current.parentNode;
        }

        return path.length > 0 ? '/' + path.join('/') : null;
    }
}

// Função adicional para gerar seletores baseados em texto e contexto
export function getContextualSelector(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

    // Primeiro tenta os seletores padrão
    const cssSelector = getCSSSelector(element);
    const xpath = getRobustXPath(element);

    // Se os seletores básicos são únicos, retorna eles
    try {
        if (cssSelector && document.querySelectorAll(cssSelector).length === 1) {
            return { css: cssSelector, xpath: xpath };
        }
    } catch (e) {
        // Ignora erros de seletor inválido
    }

    // Tenta seletores baseados em texto para elementos específicos
    const textContent = element.textContent?.trim();
    const tag = element.tagName.toLowerCase();

    // Para botões e links, tenta usar o texto
    if ((tag === 'button' || tag === 'a' || element.getAttribute('role') === 'button') && textContent) {
        const textSelector = `${tag}:contains("${textContent}")`;
        const textXPath = `//${tag}[normalize-space(text())="${textContent}"]`;

        try {
            // Nota: :contains não é CSS padrão, mas funciona em algumas libs
            // Para XPath funciona normalmente
            const xpathResult = document.evaluate(textXPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (xpathResult.snapshotLength === 1) {
                return { css: cssSelector, xpath: textXPath };
            }
        } catch (e) {
            // Ignora erros
        }
    }

    // Para campos de input, tenta usar label associado
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        const label = findAssociatedLabel(element);
        if (label && label.textContent?.trim()) {
            const labelText = label.textContent.trim();
            const labelXPath = `//input[preceding-sibling::label[normalize-space(text())="${labelText}"] or following-sibling::label[normalize-space(text())="${labelText}"] or ancestor::label[normalize-space(text())="${labelText}"]]`;

            try {
                const result = document.evaluate(labelXPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                if (result.snapshotLength === 1) {
                    return { css: cssSelector, xpath: labelXPath };
                }
            } catch (e) {
                // Ignora erros
            }
        }
    }

    return { css: cssSelector, xpath: xpath };
}

// Função auxiliar para encontrar label associado a um input
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

// Função para validar se um seletor funciona
export function validateSelector(selector, type = 'css') {
    try {
        if (type === 'css') {
            const elements = document.querySelectorAll(selector);
            return elements.length > 0;
        } else if (type === 'xpath') {
            const result = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            return result.snapshotLength > 0;
        }
    } catch (e) {
        return false;
    }
    return false;
}

// Função para analisar e otimizar seletores baseado em padrões de estabilidade
export function optimizeSelector(element, selector, type = 'css') {
    if (!element || !selector) return selector;

    try {
        // Para CSS
        if (type === 'css') {
            // Se o seletor funciona e é único, verifica se pode ser simplificado
            const elements = document.querySelectorAll(selector);
            if (elements.length === 1) {
                // Tenta versões simplificadas
                const simplifications = generateSimplifiedSelectors(element, selector);
                for (const simplified of simplifications) {
                    const testElements = document.querySelectorAll(simplified);
                    if (testElements.length === 1 && testElements[0] === element) {
                        return simplified;
                    }
                }
            }
        }

        // Para XPath
        if (type === 'xpath') {
            const result = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (result.snapshotLength === 1) {
                // XPath já otimizado na função getRobustXPath
                return selector;
            }
        }
    } catch (e) {
        // Se houver erro, retorna o seletor original
        console.warn('Erro ao otimizar seletor:', e);
    }

    return selector;
}

// Gera versões simplificadas de um seletor CSS
function generateSimplifiedSelectors(element, originalSelector) {
    const simplified = [];

    // Se o seletor original tem ID, tenta apenas o ID
    if (originalSelector.includes('#') && element.id) {
        simplified.push(`#${element.id}`);
    }

    // Se tem atributos únicos, tenta apenas eles
    const uniqueAttrs = ['data-testid', 'data-qa', 'name'];
    for (const attr of uniqueAttrs) {
        const value = element.getAttribute(attr);
        if (value) {
            simplified.push(`[${attr}="${value}"]`);
        }
    }

    // Tenta tag + classe principal
    if (element.className) {
        const classes = element.className.trim().split(/\s+/);
        const mainClass = classes.find(cls =>
            cls.length > 3 &&
            !cls.match(/^(active|focus|hover|selected|disabled)$/i)
        );
        if (mainClass) {
            simplified.push(`${element.tagName.toLowerCase()}.${mainClass}`);
        }
    }

    return simplified;
}

// Função para testar a robustez de um seletor simulando mudanças no DOM
export function testSelectorRobustness(element, selector, type = 'css') {
    const results = {
        isUnique: false,
        isStable: false,
        specificity: 0,
        recommendedSelector: selector
    };

    try {
        if (type === 'css') {
            const elements = document.querySelectorAll(selector);
            results.isUnique = elements.length === 1;
            results.specificity = calculateCSSSpecificity(selector);

            // Testa estabilidade verificando se o seletor não depende de posições
            results.isStable = !selector.includes(':nth-') &&
                !selector.includes('[class*=') &&
                (selector.includes('#') || selector.includes('[data-'));
        } else if (type === 'xpath') {
            const result = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            results.isUnique = result.snapshotLength === 1;

            // XPath é considerado estável se não depende de índices
            results.isStable = !selector.includes('[1]') && !selector.includes('[2]') &&
                (selector.includes('@id') || selector.includes('@data-'));
        }

        // Se não for robusto, tenta gerar uma alternativa
        if (!results.isUnique || !results.isStable) {
            if (type === 'css') {
                results.recommendedSelector = getCSSSelector(element);
            } else {
                results.recommendedSelector = getRobustXPath(element);
            }
        }
    } catch (e) {
        console.warn('Erro ao testar robustez do seletor:', e);
    }

    return results;
}

// Calcula a especificidade de um seletor CSS
function calculateCSSSpecificity(selector) {
    let specificity = 0;

    // IDs (+100)
    specificity += (selector.match(/#/g) || []).length * 100;

    // Classes, atributos e pseudo-classes (+10)
    specificity += (selector.match(/[\.\[\:]/g) || []).length * 10;

    // Elementos (+1)
    const elements = selector.match(/\b[a-z]+\b/g) || [];
    specificity += elements.length;

    return specificity;
}

// Função para gerar múltiplos seletores alternativos com ranking de robustez
export function generateAlternativeSelectors(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return [];

    const alternatives = [];

    // Estratégia 1: ID único (mais confiável)
    if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1) {
        alternatives.push({
            type: 'css',
            selector: `#${element.id}`,
            xpath: `//*[@id="${element.id}"]`,
            strategy: 'ID único',
            robustness: 95,
            description: 'Seletor por ID - mais estável e confiável'
        });
    }

    // Estratégia 2: Atributos de teste únicos
    const testAttrs = ['data-testid', 'data-qa', 'data-test', 'data-cy'];
    for (const attr of testAttrs) {
        const val = element.getAttribute(attr);
        if (val && document.querySelectorAll(`[${attr}="${CSS.escape(val)}"]`).length === 1) {
            alternatives.push({
                type: 'css',
                selector: `[${attr}="${val}"]`,
                xpath: `//*[@${attr}="${val}"]`,
                strategy: 'Atributo de teste',
                robustness: 90,
                description: `Seletor por ${attr} - criado para testes`
            });
        }
    }

    // Estratégia 3: Name único
    if (element.name && document.querySelectorAll(`[name="${CSS.escape(element.name)}"]`).length === 1) {
        alternatives.push({
            type: 'css',
            selector: `[name="${element.name}"]`,
            xpath: `//*[@name="${element.name}"]`,
            strategy: 'Name único',
            robustness: 85,
            description: 'Seletor por atributo name'
        });
    }

    // Estratégia 4: Aria-label único
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && document.querySelectorAll(`[aria-label="${CSS.escape(ariaLabel)}"]`).length === 1) {
        alternatives.push({
            type: 'css',
            selector: `[aria-label="${ariaLabel}"]`,
            xpath: `//*[@aria-label="${ariaLabel}"]`,
            strategy: 'Aria-label',
            robustness: 80,
            description: 'Seletor por aria-label - bom para acessibilidade'
        });
    }

    // Estratégia 5: Texto único (para elementos com texto)
    const textContent = element.textContent?.trim();
    if (textContent && textContent.length > 0 && textContent.length < 50) {
        const textXPath = `//${element.tagName.toLowerCase()}[normalize-space(text())="${textContent}"]`;
        try {
            const result = document.evaluate(textXPath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (result.snapshotLength === 1) {
                alternatives.push({
                    type: 'xpath',
                    selector: null,
                    xpath: textXPath,
                    strategy: 'Texto do elemento',
                    robustness: 75,
                    description: 'Seletor por texto - pode mudar se conteúdo for alterado'
                });
            }
        } catch (e) {
            // Ignora erros de XPath
        }
    }

    // Estratégia 6: Classe específica + tipo
    if (element.className && typeof element.className === 'string') {
        const classes = element.className.trim().split(/\s+/).filter(cls => {
            return cls && cls.length > 3 &&
                !cls.match(/^(active|focus|hover|selected|disabled|btn|button)$/i);
        });

        if (classes.length > 0) {
            const specificClass = classes[0];
            const classSelector = `${element.tagName.toLowerCase()}.${specificClass}`;
            const classElements = document.querySelectorAll(classSelector);

            alternatives.push({
                type: 'css',
                selector: classSelector,
                xpath: `//${element.tagName.toLowerCase()}[contains(concat(' ',normalize-space(@class),' '), ' ${specificClass} ')]`,
                strategy: 'Tag + Classe específica',
                robustness: classElements.length === 1 ? 70 : 50,
                description: `Seletor por tag e classe${classElements.length > 1 ? ' (não único - ' + classElements.length + ' elementos)' : ''}`
            });
        }
    }

    // Estratégia 7: Atributos específicos de framework
    const frameworkAttrs = [
        { attr: 'data-pc-name', framework: 'PrimeNG' },
        { attr: 'data-pc-section', framework: 'PrimeNG' },
        { attr: 'data-v-', framework: 'Vue.js' },
        { attr: 'ng-reflect-', framework: 'Angular' }
    ];

    for (const { attr, framework } of frameworkAttrs) {
        const attributes = Array.from(element.attributes).filter(a => a.name.startsWith(attr));
        for (const attribute of attributes) {
            const selector = `[${attribute.name}="${attribute.value}"]`;
            const elements = document.querySelectorAll(selector);

            if (elements.length <= 3) { // Aceita até 3 elementos
                alternatives.push({
                    type: 'css',
                    selector: selector,
                    xpath: `//*[@${attribute.name}="${attribute.value}"]`,
                    strategy: `${framework} framework`,
                    robustness: elements.length === 1 ? 65 : 45,
                    description: `Atributo específico do ${framework}${elements.length > 1 ? ' (não único)' : ''}`
                });
            }
        }
    }

    // Estratégia 8: Seletor hierárquico (pai com ID + filho)
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
        if (parent.id) {
            const hierarchical = `#${parent.id} ${element.tagName.toLowerCase()}`;
            const hierarchicalElements = document.querySelectorAll(hierarchical);

            // Se há poucos elementos, adiciona como alternativa
            if (hierarchicalElements.length <= 5) {
                alternatives.push({
                    type: 'css',
                    selector: hierarchical,
                    xpath: `//*[@id="${parent.id}"]//${element.tagName.toLowerCase()}`,
                    strategy: 'Hierárquico (pai com ID)',
                    robustness: hierarchicalElements.length === 1 ? 60 : 40,
                    description: `Baseado no pai com ID${hierarchicalElements.length > 1 ? ' (múltiplos elementos)' : ''}`
                });
            }
            break;
        }
        parent = parent.parentElement;
    }

    // Estratégia 9: Seletor contextual (usa getCSSSelector e getRobustXPath originais)
    const contextualSelectors = getContextualSelector(element);
    if (contextualSelectors.css && !alternatives.find(alt => alt.selector === contextualSelectors.css)) {
        alternatives.push({
            type: 'css',
            selector: contextualSelectors.css,
            xpath: contextualSelectors.xpath,
            strategy: 'Contextual otimizado',
            robustness: 55,
            description: 'Seletor gerado pela função contextual'
        });
    }

    // Remove duplicatas e ordena por robustez
    const uniqueAlternatives = alternatives.filter((item, index, self) =>
        index === self.findIndex(alt => alt.selector === item.selector && alt.xpath === item.xpath)
    );

    // Ordena por robustez (maior primeiro) e limita a 5 melhores
    return uniqueAlternatives
        .sort((a, b) => b.robustness - a.robustness)
        .slice(0, 5)
        .map((alt, index) => ({ ...alt, rank: index + 1 }));
}

// Função para testar um seletor e retornar informações de status
export function testSelectorInRealTime(selector, type = 'css') {
    const result = {
        working: false,
        count: 0,
        status: 'quebrado',
        statusIcon: '❌',
        statusColor: '#dc3545',
        elements: []
    };

    try {
        if (type === 'css') {
            const elements = document.querySelectorAll(selector);
            result.count = elements.length;
            result.elements = Array.from(elements);
        } else if (type === 'xpath') {
            const xpathResult = document.evaluate(selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            result.count = xpathResult.snapshotLength;
            result.elements = [];
            for (let i = 0; i < xpathResult.snapshotLength; i++) {
                result.elements.push(xpathResult.snapshotItem(i));
            }
        }

        // Determina o status baseado na quantidade de elementos encontrados
        if (result.count === 0) {
            result.status = 'quebrado';
            result.statusIcon = '❌';
            result.statusColor = '#dc3545';
            result.working = false;
        } else if (result.count === 1) {
            result.status = 'funcionando';
            result.statusIcon = '✅';
            result.statusColor = '#28a745';
            result.working = true;
        } else {
            result.status = 'ambíguo';
            result.statusIcon = '⚠️';
            result.statusColor = '#ffc107';
            result.working = false;
        }
    } catch (error) {
        result.status = 'erro';
        result.statusIcon = '💥';
        result.statusColor = '#dc3545';
        result.working = false;
        result.error = error.message;
    }

    return result;
}

// Função para destacar elementos na página
export function highlightElements(elements, color = '#007bff', duration = 3000) {
    const highlights = [];

    elements.forEach((element, index) => {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

        // Cria overlay de highlight
        const highlight = document.createElement('div');
        highlight.className = 'gherkin-element-highlight';
        highlight.style.position = 'absolute';
        highlight.style.pointerEvents = 'none';
        highlight.style.zIndex = '2147483646';
        highlight.style.border = `3px solid ${color}`;
        highlight.style.borderRadius = '4px';
        highlight.style.background = `${color}15`;
        highlight.style.boxShadow = `0 0 10px ${color}50`;
        highlight.style.transition = 'all 0.3s ease';

        // Adiciona número se múltiplos elementos
        if (elements.length > 1) {
            const numberLabel = document.createElement('div');
            numberLabel.textContent = index + 1;
            numberLabel.style.position = 'absolute';
            numberLabel.style.top = '-8px';
            numberLabel.style.left = '-8px';
            numberLabel.style.width = '20px';
            numberLabel.style.height = '20px';
            numberLabel.style.borderRadius = '50%';
            numberLabel.style.background = color;
            numberLabel.style.color = '#fff';
            numberLabel.style.fontSize = '12px';
            numberLabel.style.fontWeight = 'bold';
            numberLabel.style.display = 'flex';
            numberLabel.style.alignItems = 'center';
            numberLabel.style.justifyContent = 'center';
            numberLabel.style.border = '2px solid #fff';
            highlight.appendChild(numberLabel);
        }

        // Posiciona o highlight sobre o elemento
        function updatePosition() {
            const rect = element.getBoundingClientRect();
            highlight.style.top = `${rect.top + window.scrollY - 3}px`;
            highlight.style.left = `${rect.left + window.scrollX - 3}px`;
            highlight.style.width = `${rect.width + 6}px`;
            highlight.style.height = `${rect.height + 6}px`;
        }

        updatePosition();
        document.body.appendChild(highlight);
        highlights.push(highlight);

        // Atualiza posição quando a página rola
        const scrollListener = () => updatePosition();
        window.addEventListener('scroll', scrollListener);
        window.addEventListener('resize', scrollListener);

        // Remove highlight após duração especificada
        setTimeout(() => {
            highlight.style.opacity = '0';
            setTimeout(() => {
                if (highlight.parentNode) {
                    highlight.parentNode.removeChild(highlight);
                }
                if (window && typeof window.removeEventListener === 'function') {
                    try {
                        window.removeEventListener('scroll', scrollListener);
                        window.removeEventListener('resize', scrollListener);
                    } catch (e) {
                        // Ignore errors on cleanup
                    }
                }
            }, 300);
        }, duration);
    });

    return highlights;
}

// Função para remover todos os highlights ativos
export function removeAllHighlights() {
    const highlights = document.querySelectorAll('.gherkin-element-highlight');
    highlights.forEach(highlight => {
        highlight.style.opacity = '0';
        setTimeout(() => {
            if (highlight.parentNode) {
                highlight.parentNode.removeChild(highlight);
            }
        }, 300);
    });
}

// Função combinada: testa seletor e destaca elementos
export function testAndHighlightSelector(selector, type = 'css', highlightColor = '#007bff') {
    // Remove highlights anteriores
    removeAllHighlights();

    // Testa o seletor
    const testResult = testSelectorInRealTime(selector, type);

    // Destaca elementos encontrados
    if (testResult.elements.length > 0) {
        // Cor baseada no status
        let color = highlightColor;
        if (testResult.status === 'funcionando') {
            color = '#28a745'; // Verde
        } else if (testResult.status === 'ambíguo') {
            color = '#ffc107'; // Amarelo
        } else if (testResult.status === 'quebrado') {
            color = '#dc3545'; // Vermelho
        }

        highlightElements(testResult.elements, color);
    }

    return testResult;
}
