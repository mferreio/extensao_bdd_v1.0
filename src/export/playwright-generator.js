/**
 * Módulo de geração de código Playwright (JS/TS) com BDD (playwright-bdd).
 * Gera: .feature, step definitions JS, page objects, e arquivos de projeto.
 */
import { generatePlaywrightPOM } from './pom-generator.js';
import { PERFORMANCE_ACTION, PERFORMANCE_GHERKIN } from '../utils/performance-config.js';
import { generateCoverageSection } from './coverage-report.js';

export class PlaywrightGenerator {

    constructor() {
        this.version = '1.0.0';
    }

    slugify(str) {
        if (!str) return 'feature_desconhecida';
        return str.toString().toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '_')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    /**
     // Gera todos os arquivos de uma feature (Gherkin + Steps)
    generateFeatureFiles(feature, globalUniqueSteps = new Set()) {
        const files = [];
        const featureSlug = this.slugify(feature.name);
        const featureName = feature.name;

        files.push({
            name: `tests/features/${featureSlug}.feature`,
            content: this.generateGherkin(feature)
        });

        files.push({
            name: `e2e/steps/${featureName}.steps.js`,
            content: this.generateStepDefinitions(feature, globalUniqueSteps)
        });

        // Page Object Model
        const allInteractions = (feature.scenarios || []).flatMap(s => s.interactions || []);
        if (allInteractions.length > 0) {
            files.push({
                name: `tests/pages/${featureSlug}_page.js`,
                content: generatePlaywrightPOM(feature.name, allInteractions)
            });
        }

        return files;
    }

    /**
     * Gera arquivos de configuração do projeto Playwright
     */
    generateProjectFiles(features = []) {
        const files = [];

        files.push({
            name: 'playwright.config.js',
            content: `// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
`
        });

        files.push({
            name: 'package.json',
            content: `{
  "name": "playwright-bdd-tests",
  "version": "1.0.0",
  "scripts": {
    "test": "npx playwright test",
    "test:headed": "npx playwright test --headed",
    "test:ui": "npx playwright test --ui",
    "report": "npx playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "playwright-bdd": "^6.0.0",
    "playwright-lighthouse": "^4.0.0",
    "lighthouse": "^11.0.0"
  }
}
`
        });

        files.push({
            name: 'tests/fixtures.js',
            content: `// Fixtures compartilhadas para os testes Playwright\nconst { test as base } = require('@playwright/test');\n\nexports.test = base.extend({\n    // Adicione fixtures customizadas aqui\n});\n\nexports.expect = base.expect;\n`
        });

        let readmeContent = `# Projeto de Testes Playwright BDD\n\nEste projeto foi gerado automaticamente.\n\n## Como executar\n1. Certifique-se de ter o Node.js v16+ instalado.\n2. Execute \`npm install\`\n3. Execute \`npx playwright install\` para instalar os navegadores.\n4. Execute \`npm run test\` para rodar todos os testes em background.\n5. Execute \`npm run test:ui\` para abrir a interface.\n6. Execute \`npm run report\` para ver os relatórios após falhas.\n\n---\n\n`;
        if (features && features.length > 0) {
            readmeContent += generateCoverageSection(features);
        }

        files.push({
            name: 'README.md',
            content: readmeContent
        });

        return files;
    }

    /**
     * Gera arquivo .feature com suporte a Scenario Outline (bulkData)
     */
    generateGherkin(feature) {
        let content = `Feature: ${feature.name}\n\n`;

        if (feature.scenarios) {
            feature.scenarios.forEach(scenario => {
                const bulkInteraction = (scenario.interactions || []).find(
                    i => Array.isArray(i.bulkData) && i.bulkData.length > 0
                );

                if (bulkInteraction) {
                    content += `  Scenario Outline: ${scenario.name}\n`;

                    if (scenario.interactions) {
                        scenario.interactions.forEach(interaction => {
                            const stepType = interaction.step || 'Then';
                            const actionText = interaction.acaoTexto || interaction.acao;
                            const elementName = interaction.nomeElemento || 'elemento';
                            const hasBulk = Array.isArray(interaction.bulkData) && interaction.bulkData.length > 0;
                            let value = hasBulk
                                ? ' "<dado>"'
                                : (interaction.valorPreenchido ? ` "${interaction.valorPreenchido}"` : '');

                            content += `    ${stepType} ${actionText} "${elementName}"${value}\n`;
                        });
                    }

                    content += `\n    Examples:\n`;
                    content += `      | dado |\n`;
                    bulkInteraction.bulkData.forEach(item => {
                        content += `      | ${item} |\n`;
                    });
                } else {
                    content += `  Scenario: ${scenario.name}\n`;

                    if (scenario.interactions) {
                        scenario.interactions.forEach(interaction => {
                            const stepType = interaction.step || 'Then';
                            const actionText = interaction.acaoTexto || interaction.acao;
                            const elementName = interaction.nomeElemento || 'elemento';
                            let value = interaction.valorPreenchido ? ` "${interaction.valorPreenchido}"` : '';
                            content += `    ${stepType} ${actionText} "${elementName}"${value}\n`;

                            // Injetar step de performance se marcado
                            if (interaction.performanceCheck && interaction.performanceCheck.enabled) {
                                const threshold = interaction.performanceCheck.threshold || 90;
                                content += `    And ${PERFORMANCE_GHERKIN.en(threshold)}\n`;
                            }
                        });
                    }
                }
                content += '\n';
            });
        }
        return content;
    }

    /**
     * Gera step definitions para Playwright com page.locator() nativo.
     * Usa XPath quando disponível, CSS como fallback.
     */
    generateStepDefinitions(feature, globalUniqueSteps = new Set()) {
        let content = `const { test, expect } = require('@playwright/test');\n`;
        content += `const { Given, When, Then } = require('playwright-bdd');\n\n`;

        const trackerSet = globalUniqueSteps instanceof Set ? globalUniqueSteps : new Set();

        if (feature.scenarios) {
            feature.scenarios.forEach(scenario => {
                if (scenario.interactions) {
                    scenario.interactions.forEach(interaction => {
                        const stepType = interaction.step || 'Then';
                        const actionText = interaction.acaoTexto || interaction.acao;
                        const elementName = interaction.nomeElemento || 'elemento';
                        const hasValue = !!interaction.valorPreenchido;
                        const hasBulk = Array.isArray(interaction.bulkData) && interaction.bulkData.length > 0;

                        // Resolver seletor: xpath tem prioridade no Playwright (suporte nativo!)
                        const xpath = interaction.xpath || '';
                        const cssSelector = interaction.cssSelector || interaction.selector || '';
                        const selector = xpath || cssSelector || `[name="${elementName}"]`;
                        const escapedSelector = selector.replace(/'/g, "\\'");

                        let stepRegex = `${actionText} "${elementName}"`;
                        let stepSignature = `({ page }`;
                        let functionBody = `  // TODO: implement step\n`;

                        if (hasValue || hasBulk) {
                            stepRegex += ` "{string}"`;
                            stepSignature = `({ page }, valor`;
                        }

                        // Evitar passos duplicados
                        const stepKey = `${stepType} ${stepRegex}`;
                        if (trackerSet.has(stepKey)) return;
                        trackerSet.add(stepKey);

                        // Montar body com API nativa do Playwright
                        if (interaction.acao === 'acessa_url' || interaction.acao === 'navega') {
                            functionBody = `  await page.goto('${interaction.valorPreenchido}');\n`;
                        } else if (interaction.acao === 'clica' || interaction.acao === 'caixa' || interaction.acao === 'radio') {
                            functionBody = `  await page.locator('${escapedSelector}').click();\n`;
                        } else if (interaction.acao === 'preenche') {
                            functionBody = `  await page.locator('${escapedSelector}').fill(valor);\n`;
                        } else if (interaction.acao === 'valida_existe') {
                            functionBody = `  await expect(page.locator('${escapedSelector}')).toBeVisible();\n`;
                        } else if (interaction.acao === 'valida_nao_existe') {
                            functionBody = `  await expect(page.locator('${escapedSelector}')).toBeHidden();\n`;
                        } else if (interaction.acao === 'valida_contem') {
                            functionBody = `  await expect(page.locator('${escapedSelector}')).toContainText(valor);\n`;
                        } else if (interaction.acao === 'valida_nao_contem') {
                            functionBody = `  await expect(page.locator('${escapedSelector}')).not.toContainText(valor);\n`;
                        } else if (interaction.acao === 'valida_deve_ser') {
                            functionBody = `  await expect(page.locator('${escapedSelector}')).toHaveText(valor);\n`;
                        } else if (interaction.acao === 'seleciona') {
                            functionBody = `  await page.locator('${escapedSelector}').selectOption(valor);\n`;
                        } else if (interaction.acao === 'espera_segundos') {
                            const delay = parseInt(interaction.valorPreenchido) * 1000 || 1000;
                            functionBody = `  await page.waitForTimeout(${delay});\n`;
                        } else if (interaction.acao === 'espera_elemento') {
                            functionBody = `  await page.locator('${escapedSelector}').waitFor({ state: 'visible' });\n`;
                        } else if (interaction.acao === 'upload') {
                            functionBody = `  await page.locator('${escapedSelector}').setInputFiles(valor);\n`;
                        } else if (interaction.acao === 'altera') {
                            functionBody = `  await page.locator('${escapedSelector}').fill(valor);\n  await page.locator('${escapedSelector}').dispatchEvent('change');\n`;
                        } else if (interaction.acao === 'login') {
                            functionBody = `  // Login action needs manual implementation or a custom command\n  console.log('Login required');\n`;
                        }

                        content += `${stepType}("${stepRegex}", async ${stepSignature}) => {\n`;
                        content += functionBody;
                        content += `});\n\n`;
                    });
                }
            });
        }

        // Adicionar step de Performance Lighthouse se necessário
        const hasPerformance = (feature.scenarios || []).some(s =>
            (s.interactions || []).some(i => i.performanceCheck && i.performanceCheck.enabled)
        );
        if (hasPerformance) {
            content += `// --- Performance Audit Step (Lighthouse) ---\n`;
            content += `const { playAudit } = require('playwright-lighthouse');\n\n`;
            content += `Then("${PERFORMANCE_GHERKIN.en('{int}')}", async ({ page }, threshold) => {\n`;
            content += `  await playAudit({\n`;
            content += `    page: page,\n`;
            content += `    thresholds: {\n`;
            content += `      performance: threshold,\n`;
            content += `      accessibility: 80,\n`;
            content += `    },\n`;
            content += `    port: 9222\n`;
            content += `  });\n`;
            content += `});\n`;
        }

        return content;
    }
}
