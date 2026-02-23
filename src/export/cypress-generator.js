/**
 * Módulo de geração de código Cypress integrado.
 */

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

    generateFeatureFiles(feature) {
        const files = [];
        const featureSlug = this.slugify(feature.name);

        // O arquivo .feature puro
        files.push({
            name: `cypress/e2e/${featureSlug}.feature`,
            content: this.generateGherkin(feature)
        });

        // O step definition JS
        files.push({
            name: `cypress/support/step_definitions/${featureSlug}_steps.js`,
            content: this.generateStepDefinitions(feature)
        });

        return files;
    }

    generateProjectFiles() {
        const files = [];
        
        files.push({
            name: 'cypress.config.js',
            content: `const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const addCucumberPreprocessorPlugin = require("@badeball/cypress-cucumber-preprocessor").addCucumberPreprocessorPlugin;
const createEsbuildPlugin = require("@badeball/cypress-cucumber-preprocessor/esbuild").createEsbuildPlugin;

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      addCucumberPreprocessorPlugin(on, config);
      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );
      return config;
    },
    specPattern: "**/*.feature",
    supportFile: "cypress/support/e2e.js",
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
            content: `// Custom Cypress Commands
`
        });

        return files;
    }

    generateGherkin(feature) {
        let content = `Feature: ${feature.name}\n\n`;

        if (feature.scenarios) {
            feature.scenarios.forEach(scenario => {
                content += `  Scenario: ${scenario.name}\n`;
                
                if (scenario.interactions) {
                    scenario.interactions.forEach(interaction => {
                        const stepType = interaction.step || 'Then';
                        const actionText = interaction.acaoTexto || interaction.acao;
                        const elementName = interaction.nomeElemento || 'elemento';
                        let value = interaction.valorPreenchido ? ` "${interaction.valorPreenchido}"` : '';
                        
                        // Formatação padrão gherkin
                        content += `    ${stepType} ${actionText} "${elementName}"${value}\n`;
                    });
                }
                content += '\n';
            });
        }
        return content;
    }

    generateStepDefinitions(feature) {
        let content = `import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";\n\n`;

        const generatedSteps = new Set();

        if (feature.scenarios) {
            feature.scenarios.forEach(scenario => {
                if (scenario.interactions) {
                    scenario.interactions.forEach(interaction => {
                        const stepType = interaction.step || 'Then';
                        const actionText = interaction.acaoTexto || interaction.acao;
                        const elementName = interaction.nomeElemento || 'elemento';
                        const hasValue = !!interaction.valorPreenchido;
                        
                        let stepRegex = `${actionText} "${elementName}"`;
                        let stepSignature = `()`;
                        let functionBody = `  // TODO: implement step\n`;
                        
                        const selector = interaction.cssSelector || interaction.selector || `[name="${elementName}"]`;
                        const escapedSelector = selector.replace(/"/g, '\\"').replace(/'/g, "\\'");
                        
                        if (hasValue) {
                            stepRegex += ` "{string}"`;
                            stepSignature = `(valor)`;
                        }

                        // Evitar passos duplicados
                        const stepKey = `${stepType} ${stepRegex}`;
                        if (generatedSteps.has(stepKey)) return;
                        generatedSteps.add(stepKey);

                        // Montar body
                        if (interaction.acao === 'acessa_url') {
                            functionBody = `  cy.visit("${interaction.valorPreenchido}");\n`;
                        } else if (interaction.acao === 'clica') {
                            functionBody = `  cy.get('${escapedSelector}').click();\n`;
                        } else if (interaction.acao === 'preenche') {
                            functionBody = `  cy.get('${escapedSelector}').clear().type(valor);\n`;
                        } else if (interaction.acao === 'valida_existe') {
                            functionBody = `  cy.get('${escapedSelector}').should('be.visible');\n`;
                        } else if (interaction.acao === 'valida_contem') {
                            functionBody = `  cy.get('${escapedSelector}').should('contain', valor);\n`;
                        } else if (interaction.acao === 'seleciona') {
                            functionBody = `  cy.get('${escapedSelector}').select(valor);\n`;
                        } else if (interaction.acao === 'espera_segundos') {
                            const delay = parseInt(interaction.valorPreenchido) * 1000 || 1000;
                            functionBody = `  cy.wait(${delay});\n`;
                        }

                        content += `${stepType}("${stepRegex}", ${stepSignature} => {\n`;
                        content += functionBody;
                        content += `});\n\n`;
                    });
                }
            });
        }
        return content;
    }
}
