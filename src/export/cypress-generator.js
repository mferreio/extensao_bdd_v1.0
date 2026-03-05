/**
 * Módulo de geração de código Cypress integrado.
 */
import { generateCypressPOM } from './pom-generator.js';

import { generateCoverageSection } from './coverage-report.js';

export class CypressGenerator {
    
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

    // Gera todos os arquivos específicos de uma feature
    generateFeatureFiles(feature, globalUniqueSteps = new Set(), options = {}) {
        const files = [];
        const featureSlug = this.slugify(feature.name);

        // O arquivo .feature puro
        files.push({
            name: `cypress/e2e/${featureSlug}.feature`,
            content: this.generateGherkin(feature)
        });

        // Steps file
        files.push({
            name: `cypress/e2e/steps/${featureSlug}.steps.js`,
            content: this.generateStepDefinitions(feature, globalUniqueSteps, options)
        });

        // Page Object Model
        const allInteractions = (feature.scenarios || []).flatMap(s => s.interactions || []);
        if (allInteractions.length > 0) {
            files.push({
                name: `cypress/support/pages/${featureSlug}_page.js`,
                content: generateCypressPOM(feature.name, allInteractions, options)
            });
        }

        return files;
    }

    generateProjectFiles(features = [], options = {}) {
        const files = [];
        
        files.push({
            name: 'cypress.config.js',
            content: `const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
const createEsbuildPlugin = require("@badeball/cypress-cucumber-preprocessor/esbuild");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      preprocessor.addCucumberPreprocessorPlugin(on, config);

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin.default(config)],
        })
      );

      return config;
    },
    specPattern: "cypress/e2e/features/**/*.feature",
    supportFile: "cypress/support/e2e.js",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: ${options.globalTimeout || 10} * 1000,
  },
});
`
        });

        files.push({
            name: 'package.json',
            content: `{
  "name": "cypress-bdd-tests",
  "version": "1.0.0",
  "scripts": {
    "test": "cypress run",
    "cypress:open": "cypress open"
  },
    "devDependencies": {
    "@badeball/cypress-cucumber-preprocessor": "^20.0.0",
    "@bahmutov/cypress-esbuild-preprocessor": "^2.2.0",
    "cypress": "^13.0.0",
    "esbuild": "^0.19.0"
  }
}
`
        });

        files.push({
            name: 'cypress/support/e2e.js',
            content: `// Import commands.js using ES2015 syntax:
import './commands'
`
        });
        
        files.push({
            name: 'cypress/support/commands.js',
            content: `// Importa plugin xpath caso não venha no setup
import 'cypress-xpath';`
        });

        let readmeContent = `# Projeto de Testes Cypress BDD\n\nEste projeto foi gerado automaticamente.\n\n## Como executar\n1. Feche todos os terminais\n2. Rode \`npm install\`\n3. Rode \`npx cypress open\` ou \`npm run test\` para modo headless.\n\n---\n\n`;
        if (features && features.length > 0) {
            readmeContent += generateCoverageSection(features);
        }

        files.push({
            name: 'README.md',
            content: readmeContent
        });

        return files;
    }

    generateGherkin(feature) {
        let content = `Feature: ${feature.name}\n\n`;

        if (feature.scenarios) {
            feature.scenarios.forEach(scenario => {
                // Detectar se algum passo tem bulkData
                const bulkInteraction = (scenario.interactions || []).find(
                    i => Array.isArray(i.bulkData) && i.bulkData.length > 0
                );

                if (scenario.description) {
                    content += `  # ${scenario.description.replace(/\n/g, '\n  # ')}\n`;
                }

                if (bulkInteraction) {
                    // Scenario Outline com Examples
                    content += `  Scenario Outline: ${scenario.name}\n`;
                    
                    if (scenario.interactions) {
                        scenario.interactions.forEach(interaction => {
                            const stepType = interaction.step || 'Then';
                            const actionText = interaction.acaoTexto || interaction.acao;
                            const elementName = interaction.nomeElemento || 'elemento';
                            
                            // Substituir valor por <dado> se a interacao tem bulkData
                            const hasBulk = Array.isArray(interaction.bulkData) && interaction.bulkData.length > 0;
                            let value = hasBulk 
                                ? ' "<dado>"' 
                                : (interaction.valorPreenchido ? ` "${interaction.valorPreenchido}"` : '');
                            
                            content += `    ${stepType} ${actionText} "${elementName}"${value}\n`;
                        });
                    }

                    // Tabela Examples
                    content += `\n    Examples:\n`;
                    content += `      | dado |\n`;
                    bulkInteraction.bulkData.forEach(item => {
                        content += `      | ${item} |\n`;
                    });
                } else {
                    // Scenario normal
                    content += `  Scenario: ${scenario.name}\n`;
                    
                    if (scenario.interactions) {
                        scenario.interactions.forEach(interaction => {
                            const stepType = interaction.step || 'Then';
                            const actionText = interaction.acaoTexto || interaction.acao;
                            const elementName = interaction.nomeElemento || 'elemento';
                            let value = interaction.valorPreenchido ? ` "${interaction.valorPreenchido}"` : '';
                            content += `    ${stepType} ${actionText} "${elementName}"${value}\n`;


                    });
                }
                }
                content += '\n';
            });
        }
        return content;
    }

    generateStepDefinitions(feature, globalUniqueSteps = new Set(), options = {}) {
        let content = `import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";\n\n`;

        const trackerSet = globalUniqueSteps instanceof Set ? globalUniqueSteps : new Set();
        let needsXPathPlugin = false;
        let needsPerformanceStep = false;

        if (feature.scenarios) {
            feature.scenarios.forEach(scenario => {
                if (scenario.interactions) {
                    scenario.interactions.forEach(interaction => {
                        const stepType = interaction.step || 'Then';
                        const actionText = interaction.acaoTexto || interaction.acao;
                        const elementName = interaction.nomeElemento || 'elemento';
                        const hasValue = !!interaction.valorPreenchido;
                        const hasBulk = Array.isArray(interaction.bulkData) && interaction.bulkData.length > 0;
                        
                        // Resolver melhor seletor: config
                        // Extração robusta de seletores (lida com inconsistências de nomenclaturas)
                        const xpath = interaction.xpath || interaction.xpathSelector || (interaction.isValid && interaction.isValid.xpath ? interaction.xpath : '');
                        const cssSelector = interaction.cssSelector || interaction.selector || interaction.seletor || (interaction.isValid && interaction.isValid.css ? interaction.cssSelector : '');
                        const preferred = options.preferredSelector || 'best';
                        
                        let isXPath = false;
                        let selector = '';

                        if (preferred === 'xpath' && xpath) {
                            isXPath = true;
                            selector = xpath;
                        } else if (preferred === 'css' && cssSelector) {
                            isXPath = false;
                            selector = cssSelector;
                        } else {
                            // Default / Best (Tenta XPath primeiro como antes, ou cai pra CSS)
                            isXPath = !!xpath;
                            selector = isXPath ? xpath : (cssSelector || `[name="${elementName}"]`);
                        }

                        const escapedSelector = selector.replace(/"/g, '\\"').replace(/'/g, "\\'");
                        
                        if (isXPath) needsXPathPlugin = true;

                        // Comando Cypress adequado ao tipo de seletor
                        const cyGet = isXPath ? `cy.xpath('${escapedSelector}')` : `cy.get('${escapedSelector}')`;
                        
                        let stepRegex = `${actionText} "${elementName}"`;
                        let stepSignature = `()`;
                        let functionBody = `  // TODO: implement step\n`;
                        
                        if (hasValue || hasBulk) {
                            stepRegex += ` "{string}"`;
                            stepSignature = `(valor)`;
                        }

                        // Evitar passos duplicados
                        const stepKey = `${stepType} ${stepRegex}`;
                        if (trackerSet.has(stepKey)) return;
                        trackerSet.add(stepKey);

                        // Montar body
                        if (interaction.acao === 'acessa_url' || interaction.acao === 'navega') {
                            functionBody = `  cy.visit("${interaction.valorPreenchido}");\n`;
                        } else if (interaction.acao === 'clica' || interaction.acao === 'caixa' || interaction.acao === 'radio') {
                            functionBody = `  ${cyGet}.click();\n`;
                        } else if (interaction.acao === 'preenche') {
                            functionBody = `  ${cyGet}.clear().type(valor);\n`;
                        } else if (interaction.acao === 'valida_existe') {
                            functionBody = `  ${cyGet}.should('be.visible');\n`;
                        } else if (interaction.acao === 'valida_nao_existe') {
                            functionBody = `  ${cyGet}.should('not.exist');\n`;
                        } else if (interaction.acao === 'valida_contem') {
                            functionBody = `  ${cyGet}.should('contain', valor);\n`;
                        } else if (interaction.acao === 'valida_nao_contem') {
                            functionBody = `  ${cyGet}.should('not.contain', valor);\n`;
                        } else if (interaction.acao === 'valida_deve_ser') {
                            functionBody = `  ${cyGet}.should('have.text', valor);\n`;
                        } else if (interaction.acao === 'seleciona') {
                            functionBody = `  ${cyGet}.select(valor);\n`;
                        } else if (interaction.acao === 'espera_segundos') {
                            const delay = parseInt(interaction.valorPreenchido) * 1000 || 1000;
                            functionBody = `  cy.wait(${delay});\n`;
                        } else if (interaction.acao === 'espera_elemento') {
                            functionBody = `  ${cyGet}.should('be.visible');\n`;
                        } else if (interaction.acao === 'upload') {
                            functionBody = `  ${cyGet}.selectFile(valor);\n`;
                        } else if (interaction.acao === 'altera') {
                            functionBody = `  ${cyGet}.invoke('val', valor).trigger('change');\n`;
                        } else if (interaction.acao === 'login') {
                            functionBody = `  // Login action needs manual implementation or a custom command\n  cy.log('Login required');\n`;
                        }

                        content += `${stepType}("${stepRegex}", ${stepSignature} => {\n`;
                        content += functionBody;
                        content += `});\n\n`;

                        // Check if performance step is needed for this scenario
                        if (interaction.performanceCheck && interaction.performanceCheck.enabled) {
                            needsPerformanceStep = true;
                        }
                    });
                }
            });
        }

        // Adicionar import do plugin xpath se necessário
        if (needsXPathPlugin) {
            content = `import 'cypress-xpath';\n` + content;
        }



        return content;
    }
}
