/**
 * POM Generator - Geração de Page Object Model para Cypress e Playwright.
 * Extrai locators e métodos de ação das interações gravadas.
 */

/**
 * Converte nome para PascalCase (ex: "login sucesso" → "LoginSucesso")
 */
function toPascalCase(str) {
    if (!str) return 'Page';
    return str
        .replace(/[^a-zA-Z0-9À-ÿ\s]/g, '')
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
}

/**
 * Converte nome para camelCase (ex: "campo CPF" → "campoCpf")
 */
function toCamelCase(str) {
    if (!str) return 'elemento';
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Sanitiza nome de método para JS válido.
 */
function sanitizeMethodName(name) {
    return name.replace(/[^a-zA-Z0-9_]/g, '').replace(/^[0-9]/, '_$&');
}

/**
 * Extrai locators únicos de uma lista de interações.
 * @param {Array} interactions
 * @returns {{ locators: Array, methods: Array }}
 */
function extractPageElements(interactions) {
    const seen = new Set();
    const locators = [];
    const methods = [];

    (interactions || []).forEach(interaction => {
        const name = interaction.nomeElemento || 'elemento';
        const key = toCamelCase(name);
        
        if (seen.has(key) || interaction.acao === 'acessa_url' || interaction.acao === 'espera_segundos') return;
        seen.add(key);

        // Resolver melhor seletor
        const xpath = interaction.xpath || '';
        const css = interaction.cssSelector || interaction.selector || '';
        const selector = xpath || css || `[name="${name}"]`;

        locators.push({ key, name, selector });

        // Gerar método baseado na ação
        const methodName = sanitizeMethodName(toCamelCase(`${interaction.acao}_${name}`));
        methods.push({
            methodName,
            key,
            action: interaction.acao,
            hasValue: !!interaction.valorPreenchido
        });
    });

    return { locators, methods };
}

/**
 * Gera arquivo de Page Object para Cypress.
 * @param {string} className
 * @param {Array} interactions
 * @returns {string}
 */
export function generateCypressPOM(className, interactions) {
    const { locators, methods } = extractPageElements(interactions);
    const cls = toPascalCase(className) + 'Page';

    let content = `/**\n * Page Object: ${cls}\n * Gerado automaticamente pelo BDD Test Generator.\n */\n\n`;
    content += `class ${cls} {\n\n`;

    // Locators como getters
    content += `    // ─── Locators ───\n`;
    locators.forEach(loc => {
        const escaped = loc.selector.replace(/'/g, "\\'");
        content += `    get ${loc.key}() { return cy.get('${escaped}'); }\n`;
    });

    content += `\n`;

    // Métodos de ação
    content += `    // ─── Actions ───\n`;
    methods.forEach(m => {
        if (m.action === 'clica') {
            content += `    ${m.methodName}() {\n`;
            content += `        this.${m.key}.click();\n`;
            content += `        return this;\n`;
            content += `    }\n\n`;
        } else if (m.action === 'preenche') {
            content += `    ${m.methodName}(valor) {\n`;
            content += `        this.${m.key}.clear().type(valor);\n`;
            content += `        return this;\n`;
            content += `    }\n\n`;
        } else if (m.action === 'seleciona') {
            content += `    ${m.methodName}(valor) {\n`;
            content += `        this.${m.key}.select(valor);\n`;
            content += `        return this;\n`;
            content += `    }\n\n`;
        } else if (m.action === 'valida_existe') {
            content += `    ${m.methodName}() {\n`;
            content += `        this.${m.key}.should('be.visible');\n`;
            content += `        return this;\n`;
            content += `    }\n\n`;
        } else if (m.action === 'valida_contem') {
            content += `    ${m.methodName}(texto) {\n`;
            content += `        this.${m.key}.should('contain', texto);\n`;
            content += `        return this;\n`;
            content += `    }\n\n`;
        }
    });

    content += `}\n\n`;
    content += `export default new ${cls}();\n`;

    return content;
}

/**
 * Gera arquivo de Page Object para Playwright.
 * @param {string} className
 * @param {Array} interactions
 * @returns {string}
 */
export function generatePlaywrightPOM(className, interactions) {
    const { locators, methods } = extractPageElements(interactions);
    const cls = toPascalCase(className) + 'Page';

    let content = `/**\n * Page Object: ${cls}\n * Gerado automaticamente pelo BDD Test Generator.\n */\n\n`;
    content += `class ${cls} {\n\n`;
    content += `    /**\n     * @param {import('@playwright/test').Page} page\n     */\n`;
    content += `    constructor(page) {\n`;
    content += `        this.page = page;\n`;
    content += `    }\n\n`;

    // Locators como getters
    content += `    // ─── Locators ───\n`;
    locators.forEach(loc => {
        const escaped = loc.selector.replace(/'/g, "\\'");
        content += `    get ${loc.key}() { return this.page.locator('${escaped}'); }\n`;
    });

    content += `\n`;

    // Métodos de ação (async)
    content += `    // ─── Actions ───\n`;
    methods.forEach(m => {
        if (m.action === 'clica') {
            content += `    async ${m.methodName}() {\n`;
            content += `        await this.${m.key}.click();\n`;
            content += `        return this;\n`;
            content += `    }\n\n`;
        } else if (m.action === 'preenche') {
            content += `    async ${m.methodName}(valor) {\n`;
            content += `        await this.${m.key}.fill(valor);\n`;
            content += `        return this;\n`;
            content += `    }\n\n`;
        } else if (m.action === 'seleciona') {
            content += `    async ${m.methodName}(valor) {\n`;
            content += `        await this.${m.key}.selectOption(valor);\n`;
            content += `        return this;\n`;
            content += `    }\n\n`;
        } else if (m.action === 'valida_existe') {
            content += `    async ${m.methodName}() {\n`;
            content += `        const { expect } = require('@playwright/test');\n`;
            content += `        await expect(this.${m.key}).toBeVisible();\n`;
            content += `        return this;\n`;
            content += `    }\n\n`;
        } else if (m.action === 'valida_contem') {
            content += `    async ${m.methodName}(texto) {\n`;
            content += `        const { expect } = require('@playwright/test');\n`;
            content += `        await expect(this.${m.key}).toContainText(texto);\n`;
            content += `        return this;\n`;
            content += `    }\n\n`;
        }
    });

    content += `}\n\n`;
    content += `module.exports = { ${cls} };\n`;

    return content;
}
