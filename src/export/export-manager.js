/**
 * Export Manager v2.0 - Gerenciamento avançado de exportações
 * Implementa: Compressão ZIP, Progresso, Metadata, Auditoria, Múltiplos Formatos
 * 
 * Best Practices:
 * - Separação de responsabilidades (Manager, Handler, Logger)
 * - Tratamento robusto de erros com recuperação
 * - Feedback visual progressivo
 * - Logging completo de auditoria
 * - Compressão automática para múltiplos arquivos
 * - Metadata com versionamento e contexto
 */

import { downloadFile, showFeedback } from '../../utils.js';
import { FileCompressor } from './compressor.js';

/**
 * ExportLogger - Gerencia logging de auditoria
 */
class ExportLogger {
    constructor() {
        this.logs = [];
        this.startTime = null;
        this.sessionId = this.generateSessionId();
    }

    generateSessionId() {
        return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    start(featureCount) {
        this.startTime = Date.now();
        this.log('info', `Sessão iniciada com ${featureCount} feature(s)`, { sessionId: this.sessionId, featureCount });
    }

    log(level, message, metadata = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            metadata,
            duration: this.startTime ? Date.now() - this.startTime : 0
        };

        this.logs.push(logEntry);

        // Console output para debugging
        const prefix = `[EXPORT-${level.toUpperCase()}]`;
        console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](prefix, message, metadata);
    }

    success(message, metadata = {}) {
        this.log('info', `✅ ${message}`, metadata);
    }

    warn(message, metadata = {}) {
        this.log('warn', `⚠️ ${message}`, metadata);
    }

    error(message, metadata = {}) {
        this.log('error', `❌ ${message}`, metadata);
    }

    getReport() {
        const duration = Date.now() - this.startTime;
        const errorCount = this.logs.filter(l => l.level === 'error').length;
        const warnCount = this.logs.filter(l => l.level === 'warn').length;

        return {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            duration,
            totalLogs: this.logs.length,
            errors: errorCount,
            warnings: warnCount,
            logs: this.logs
        };
    }

    exportAsCsv() {
        let csv = 'timestamp,level,message,duration_ms\n';

        this.logs.forEach(log => {
            const timestamp = log.timestamp.replace(/,/g, ';');
            const message = log.message.replace(/"/g, '""').replace(/,/g, ';');
            csv += `"${timestamp}","${log.level}","${message}",${log.duration}\n`;
        });

        return csv;
    }
}

/**
 * ExportProgress - Gerencia barra de progresso visual
 */
class ExportProgress {
    constructor() {
        this.current = 0;
        this.total = 0;
        this.modal = null;
        this.startTime = null;
    }

    init(total) {
        this.total = total;
        this.current = 0;
        this.startTime = Date.now();
        this._injectStyles();
        this.createModal();
    }

    _injectStyles() {
        if (document.getElementById('bdd-export-styles')) return;

        const style = document.createElement('style');
        style.id = 'bdd-export-styles';
        style.textContent = `
            .bdd-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                font-family: 'Segoe UI', sans-serif;
            }
            .bdd-modal-content {
                background: white;
                padding: 0;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                width: 450px;
                max-width: 90%;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            .bdd-modal-header {
                background: #f8f9fa;
                padding: 15px 20px;
                border-bottom: 1px solid #e9ecef;
            }
            .bdd-modal-header h3 {
                margin: 0;
                font-size: 16px;
                color: #333;
            }
            .bdd-modal-body {
                padding: 20px;
            }
        `;
        document.head.appendChild(style);
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'bdd-modal-overlay';
        this.modal.innerHTML = `
            <div class="bdd-modal-content" style="min-width: 400px;">
                <div class="bdd-modal-header">
                    <h3>📤 Exportando Projeto...</h3>
                </div>
                <div class="bdd-modal-body">
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span id="export-status">Preparando exportação...</span>
                            <span id="export-percentage">0%</span>
                        </div>
                        <div style="width: 100%; height: 24px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                            <div id="export-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #4CAF50, #45a049); transition: width 0.3s ease; display: flex; align-items: center; justify-content: center;">
                                <span id="export-progress-text" style="color: white; font-size: 12px; font-weight: bold;"></span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #f5f5f5; padding: 12px; border-radius: 4px; max-height: 200px; overflow-y: auto;">
                        <div id="export-log" style="font-family: monospace; font-size: 12px; line-height: 1.5; color: #333;"></div>
                    </div>
                    
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd;">
                        <small style="color: #666;">
                            ⏱️ Tempo decorrido: <span id="export-time">0s</span> | 
                            📊 Velocidade: <span id="export-speed">0</span> arquivo(s)/s
                        </small>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.updateTimer();
    }

    updateTimer() {
        const timerInterval = setInterval(() => {
            if (!document.body.contains(this.modal)) {
                clearInterval(timerInterval);
                return;
            }

            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const speed = this.current > 0 ? (this.current / (elapsed || 1)).toFixed(1) : 0;

            document.getElementById('export-time').textContent = `${elapsed}s`;
            document.getElementById('export-speed').textContent = speed;
        }, 500);
    }

    update(current, message) {
        this.current = current;
        const percentage = Math.round((current / this.total) * 100);

        const progressBar = document.getElementById('export-progress-bar');
        const progressText = document.getElementById('export-progress-text');
        const percentageEl = document.getElementById('export-percentage');
        const statusEl = document.getElementById('export-status');

        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
        if (percentageEl) percentageEl.textContent = `${percentage}%`;
        if (statusEl) statusEl.textContent = message || `Processando (${current}/${this.total})`;

        this.addLog(message);
    }

    addLog(message) {
        const logEl = document.getElementById('export-log');
        if (logEl) {
            const timestamp = new Date().toLocaleTimeString('pt-BR');
            const logLine = document.createElement('div');
            logLine.textContent = `[${timestamp}] ${message}`;
            logEl.appendChild(logLine);
            logEl.scrollTop = logEl.scrollHeight;
        }
    }

    finish(success = true) {
        const progressBar = document.getElementById('export-progress-bar');
        const progressText = document.getElementById('export-progress-text');
        const statusEl = document.getElementById('export-status');

        if (success) {
            if (progressBar) progressBar.style.background = 'linear-gradient(90deg, #4CAF50, #45a049)';
            if (statusEl) statusEl.textContent = '✅ Exportação concluída!';
            if (progressText) progressText.textContent = '100%';
        } else {
            if (progressBar) progressBar.style.background = 'linear-gradient(90deg, #f44336, #da190b)';
            if (statusEl) statusEl.textContent = '❌ Exportação com erro(s)';
        }

        // Fechar modal automaticamente após 2 segundos se sucesso
        if (success) {
            setTimeout(() => {
                this.close();
            }, 2000);
        }
    }

    close() {
        if (this.modal && document.body.contains(this.modal)) {
            this.modal.remove();
        }
    }
}

/**
 * ExportMetadata - Gerencia metadata dos arquivos exportados
 */
class ExportMetadata {
    constructor(featureCount) {
        this.createdAt = new Date().toISOString();
        this.featureCount = featureCount;
        this.version = '1.1.0';
        this.exportFormat = 'gherkin_bdd_v1.1.0';
        this.userAgent = navigator.userAgent;
        this.hostname = window.location.hostname;
    }

    toJSON() {
        return {
            exportMetadata: {
                exportedAt: this.createdAt,
                exportFormat: this.exportFormat,
                extensionVersion: this.version,
                featureCount: this.featureCount,
                browser: {
                    userAgent: this.userAgent,
                    hostname: this.hostname
                },
                environment: {
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language
                }
            }
        };
    }

    toYaml() {
        return `# Metadata de Exportação
exportedAt: ${this.createdAt}
exportFormat: ${this.exportFormat}
extensionVersion: ${this.version}
featureCount: ${this.featureCount}
browser:
  userAgent: ${this.userAgent}
  hostname: ${this.hostname}
environment:
  timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
  language: ${navigator.language}
`;
    }
}

/**
 * ExportManager - Orquestrador principal de exportações
 */
export class ExportManager {
    constructor() {
        this.logger = new ExportLogger();
        this.progress = new ExportProgress();
        this.exportQueue = [];
        this.isExporting = false;
    }

    async exportFeatures(features, options = {}) {
        const {
            format = 'individual', // 'individual' ou 'zip'
            includeMetadata = true,
            includeLogs = true,
            includeAudit = true,
            onProgress = null
        } = options;

        // Validação inicial
        if (!features || features.length === 0) {
            showFeedback('Nenhuma feature para exportar!', 'error');
            this.logger.error('Nenhuma feature fornecida');
            return false;
        }

        if (this.isExporting) {
            showFeedback('Exportação já em andamento!', 'warning');
            return false;
        }

        // Normalizar features para evitar duplicidade de steps (Case Insensitive)
        this.normalizeFeatures(features);

        this.isExporting = true;
        this.logger.start(features.length);
        this.progress.init(features.length + 1); // +1 para arquivos do projeto

        try {
            const exportData = [];

            // Adicionar arquivos do projeto primeiro (environment.py, requirements.txt, etc.)
            this.progress.update(1, 'Gerando arquivos do projeto...');
            const projectFiles = this.generateProjectFiles();
            exportData.push({
                featureName: 'PROJECT',
                files: projectFiles
            });
            this.logger.success('Arquivos do projeto gerados', { files: projectFiles.length });

            // Exportar cada feature
            for (let i = 0; i < features.length; i++) {
                const feature = features[i];
                try {
                    this.progress.update(i + 2, `Exportando: ${feature.name}`);

                    const files = this.generateFeatureFiles(feature);
                    exportData.push({
                        featureName: feature.name,
                        files: files
                    });

                    this.logger.success(`Feature exportada: ${feature.name}`, { files: files.length });

                    if (onProgress) onProgress(i + 1, features.length);
                } catch (error) {
                    this.logger.error(`Falha ao exportar ${feature.name}`, { error: error.message });
                }
            }

            // Metadata não é mais incluída na exportação (desnecessária)

            // Adicionar logs se solicitado
            if (includeLogs) {
                const report = this.logger.getReport();
                exportData.push({
                    featureName: 'LOGS',
                    files: [
                        { name: 'export_audit.json', content: JSON.stringify(report, null, 2) }
                    ]
                });
                this.logger.success('Logs inclusos');
            }

            // Executar exportação
            if (format === 'zip') {
                await this.exportAsZip(exportData);
            } else {
                this.exportAsIndividualFiles(exportData);
            }

            this.progress.finish(true);
            this.logger.success('Exportação concluída', {
                format,
                fileCount: exportData.reduce((sum, item) => sum + item.files.length, 0)
            });

            showFeedback(`✅ ${features.length} feature(s) exportada(s) com sucesso!`, 'success');
            return true;

        } catch (error) {
            this.logger.error('Erro fatal durante exportação', { error: error.message, stack: error.stack });
            this.progress.finish(false);
            showFeedback(`❌ Erro na exportação: ${error.message}`, 'error');
            return false;

        } finally {
            this.isExporting = false;
        }
    }

    generateFeatureFiles(feature) {
        const files = [];
        const featureSlug = this.slugify(feature.name);

        // Gherkin file
        files.push({
            name: `${featureSlug}.feature`,
            content: this.generateGherkinContent(feature)
        });

        // Pages.py (dentro de features) - SEM o prefixo "features_"
        files.push({
            name: `pages/${featureSlug}_page.py`,
            content: this.generatePagesContent(feature)
        });

        // Steps.py (dentro de features)
        files.push({
            name: `steps/${featureSlug}_steps.py`,
            content: this.generateStepsContent(feature)
        });

        return files;
    }

    generateProjectFiles() {
        const files = [];

        // Environment.py (dentro de features para padrão behave)
        files.push({
            name: `features/environment.py`,
            content: this.generateEnvironmentContent()
        });

        // Base Page (Nova estrutura DRY)
        files.push({
            name: `features/pages/base_page.py`,
            content: this.generateBasePageContent()
        });

        // Requirements.txt (raiz do projeto)
        files.push({
            name: `requirements.txt`,
            content: this.generateRequirementsContent()
        });

        // README.md
        files.push({
            name: `README.md`,
            content: this.generateReadmeContent()
        });

        // Arquivos de Configuração e Scripts (QA/DevOps)
        files.push({
            name: `.gitignore`,
            content: this.generateGitignoreContent()
        });

        files.push({
            name: `behave.ini`,
            content: this.generateBehaveIniContent()
        });

        files.push({
            name: `run_tests.bat`,
            content: this.generateRunBatContent()
        });

        files.push({
            name: `run_tests.sh`,
            content: this.generateRunShContent()
        });

        // __init__.py files para compatibilidade de pacotes
        // features/__init__.py
        files.push({
            name: `features/__init__.py`,
            content: ''
        });

        // features/steps/__init__.py
        files.push({
            name: `steps/__init__.py`,
            content: ''
        });

        // features/pages/__init__.py
        files.push({
            name: `pages/__init__.py`,
            content: ''
        });



        return files;
    }



    generateBasePageContent() {
        return `# -*- coding: utf-8 -*-
"""
Base Page Object
Implementa as funções centrais do Selenium para reuso em todas as páginas.
"""
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from typing import Tuple, Optional, Any

class BasePage:
    """Classe base para todos os Page Objects"""

    def __init__(self, browser: WebDriver, timeout: int = 10):
        self.browser = browser
        self.wait = WebDriverWait(browser, timeout)

    def _find_element(self, locator: Tuple[str, str], timeout: Optional[int] = None) -> WebElement:
        """Busca elemento com espera explícita"""
        wait = WebDriverWait(self.browser, timeout) if timeout else self.wait
        try:
            return wait.until(EC.presence_of_element_located(locator))
        except TimeoutException:
            raise TimeoutException(f"Elemento não encontrado: {locator}")

    def _click_element(self, locator: Tuple[str, str], timeout: Optional[int] = None) -> 'BasePage':
        """Clica em elemento com espera por clicabilidade"""
        wait = WebDriverWait(self.browser, timeout) if timeout else self.wait
        try:
            element = wait.until(EC.element_to_be_clickable(locator))
            element.click()
            return self
        except TimeoutException:
            raise TimeoutException(f"Elemento não clicável: {locator}")

    def _fill_element(self, locator: Tuple[str, str], text: str, clear: bool = True) -> 'BasePage':
        """Preenche elemento com texto"""
        try:
            element = self.wait.until(EC.visibility_of_element_located(locator))
            if clear:
                element.clear()
            element.send_keys(text)
            return self
        except TimeoutException:
            raise TimeoutException(f"Não foi possível preencher: {locator}")

    def _select_option(self, locator: Tuple[str, str], value: str) -> 'BasePage':
        """Seleciona opção em dropdown"""
        try:
            element = self.wait.until(EC.presence_of_element_located(locator))
            select = Select(element)
            try:
                select.select_by_visible_text(value)
            except:
                select.select_by_value(value)
            return self
        except TimeoutException:
            raise TimeoutException(f"Dropdown não encontrado: {locator}")

    def verificar_carregamento(self) -> 'BasePage':
        """Verifica se a página foi carregada corretamente"""
        from selenium.webdriver.common.by import By
        try:
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            return self
        except TimeoutException:
            raise TimeoutException("Página não carregou corretamente")
`;
    }

    generatePagesContent(feature) {
        const featureName = this.slugify(feature.name);
        const className = this.toPascalCase(featureName);

        let content = `# -*- coding: utf-8 -*-
"""
Page Object para ${feature.name}
Gerado automaticamente pela extensão BDD Test Generator
"""

from selenium.webdriver.common.by import By
from features.pages.base_page import BasePage

class ${className}Locators:
    """Classe centralizada de localizadores para ${feature.name}"""
    
`;

        // Coletar elementos únicos com seletores reais
        const elementsMap = new Map();
        (feature.scenarios || []).forEach(scenario => {
            (scenario.interactions || []).forEach(interaction => {
                // Pular interações que não precisam de seletor (como acessa_url)
                if (interaction.acao === 'acessa_url' || interaction.acao === 'espera_segundos') {
                    return;
                }

                const elementName = interaction.nomeElemento || 'elemento';

                if (!elementsMap.has(elementName)) {
                    // Priorizar cssSelector, depois xpathSelector, depois xpath
                    let seletor = interaction.cssSelector ||
                        interaction.xpathSelector ||
                        interaction.seletor ||
                        interaction.xpath || '';

                    let tipoSeletor = 'CSS_SELECTOR';

                    // Determinar tipo de seletor
                    if (interaction.cssSelector || interaction.seletor) {
                        tipoSeletor = 'CSS_SELECTOR';
                        seletor = interaction.cssSelector || interaction.seletor;
                    } else if (interaction.xpathSelector || interaction.xpath) {
                        tipoSeletor = 'XPATH';
                        seletor = interaction.xpathSelector || interaction.xpath;
                    } else if (elementName) {
                        // Fallback: criar seletor baseado no nome
                        seletor = `[name="${elementName}"]`;
                        tipoSeletor = 'CSS_SELECTOR';
                    }

                    elementsMap.set(elementName, {
                        seletor: seletor,
                        tipo: tipoSeletor,
                        acao: interaction.acao
                    });
                }
            });
        });

        // Gerar locators seguindo boas práticas
        if (elementsMap.size > 0) {
            elementsMap.forEach((data, element) => {
                const locatorName = this.generateValidLocatorName(element);
                // Escapar aspas no seletor
                const selector = data.seletor
                    .replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                content += `    ${locatorName} = (By.${data.tipo}, "${selector}")\n`;
            });
        } else {
            // Adicionar locator padrão caso não haja elementos
            content += `    # Adicione seus locators aqui\n`;
            content += `    # Exemplo: BOTAO_LOGIN = (By.CSS_SELECTOR, "#btn-login")\n`;
        }

        content += `\n\n`;

        // Classe de Actions Herdando de BasePage
        content += `class ${className}Page(BasePage):
    """
    Page Object para ${feature.name}
    Herda funcoes base para manutencao do DRY
    """
    
    def __init__(self, browser):
        super().__init__(browser)
        self.locators = ${className}Locators()
    
`;

        // Gerar métodos específicos para cada elemento COM TYPE HINTS
        elementsMap.forEach((data, element) => {
            const methodBaseName = this.toSnakeCase(this.sanitizeMethodName(element));
            const locatorName = this.generateValidLocatorName(element);

            // Método de preenchimento
            content += `    def preencher_${methodBaseName}(self, texto: str) -> '${className}Page':\n`;
            content += `        """Preenche o campo ${element}"""\n`;
            content += `        return self._fill_element(self.locators.${locatorName}, texto)\n`;
            content += `    \n`;

            // Método de clique
            content += `    def clicar_${methodBaseName}(self) -> '${className}Page':\n`;
            content += `        """Clica em ${element}"""\n`;
            content += `        return self._click_element(self.locators.${locatorName})\n`;
            content += `    \n`;

            // Método para obter texto
            content += `    def obter_texto_${methodBaseName}(self) -> str:\n`;
            content += `        """Obtém o texto de ${element}"""\n`;
            content += `        element = self._find_element(self.locators.${locatorName})\n`;
            content += `        return element.text\n`;
            content += `    \n`;

            // Método para verificar visibilidade
            content += `    def elemento_visivel_${methodBaseName}(self) -> bool:\n`;
            content += `        """Verifica se ${element} está visível"""\n`;
            content += `        try:\n`;
            content += `            from selenium.webdriver.support import expected_conditions as EC\n`;
            content += `            self.wait.until(EC.visibility_of_element_located(self.locators.${locatorName}))\n`;
            content += `            return True\n`;
            content += `        except:\n`;
            content += `            return False\n`;
            content += `    \n`;
        });

        // Adicionar método de alto nível se houver padrão de login
        const hasLogin = Array.from(elementsMap.keys()).some(key =>
            key.toLowerCase().includes('login') ||
            key.toLowerCase().includes('usuario') ||
            key.toLowerCase().includes('user') ||
            key.toLowerCase().includes('email')
        );
        const hasPassword = Array.from(elementsMap.keys()).some(key =>
            key.toLowerCase().includes('senha') ||
            key.toLowerCase().includes('password')
        );

        if (hasLogin && hasPassword) {
            content += `    def realizar_login(self, usuario: str, senha: str) -> '${className}Page':\n`;
            content += `        """Realiza login completo"""\n`;

            // Encontrar os campos corretos
            const loginField = Array.from(elementsMap.keys()).find(key =>
                key.toLowerCase().includes('login') ||
                key.toLowerCase().includes('usuario') ||
                key.toLowerCase().includes('user') ||
                key.toLowerCase().includes('email')
            );
            const passwordField = Array.from(elementsMap.keys()).find(key =>
                key.toLowerCase().includes('senha') ||
                key.toLowerCase().includes('password')
            );
            const submitButton = Array.from(elementsMap.keys()).find(key =>
                key.toLowerCase().includes('entrar') ||
                key.toLowerCase().includes('login') ||
                key.toLowerCase().includes('submit') ||
                key.toLowerCase().includes('botao')
            );

            if (loginField) {
                const methodName = this.toSnakeCase(this.sanitizeMethodName(loginField));
                content += `        self.preencher_${methodName}(usuario)\n`;
            }
            if (passwordField) {
                const methodName = this.toSnakeCase(this.sanitizeMethodName(passwordField));
                content += `        self.preencher_${methodName}(senha)\n`;
            }
            if (submitButton) {
                const methodName = this.toSnakeCase(this.sanitizeMethodName(submitButton));
                content += `        self.clicar_${methodName}()\n`;
            }
            content += `        return self\n`;
            content += `    \n`;
        }

        return content;
    }

    generateReadmeContent() {
        return `# Projeto de Testes Automatizados BDD
        
Testes automatizados gerados pela extensão **Gerador de Testes Automatizados em Python**.

## 🚀 Execução Rápida (One-Click)

### Windows
Dê um duplo clique no arquivo:
\`run_tests.bat\`

### Linux / Mac
No terminal, execute:
\`bash run_tests.sh\`

---

## 📋 Pré-requisitos Manuais

- Python 3.8 ou superior
- Google Chrome instalado

## 🛠️ Instalação Manual

### 1. Criar ambiente virtual
\`\`\`bash
# Windows
python -m venv venv
.\\venv\\Scripts\\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
\`\`\`

### 2. Instalar dependências
\`\`\`bash
pip install -r requirements.txt
\`\`\`

## 🎯 Comandos Úteis

### Executar todos os testes
\`\`\`bash
behave
\`\`\`

### Executar funcionalidade específica
\`\`\`bash
behave features/nome_da_feature.feature
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
projeto/
│
├── features/               # Funcionalidades (Gherkin)
│   ├── steps/             # Passos (Python)
│   ├── pages/             # Page Objects
│   └── environment.py     # Configuração geral
│
├── screenshots/           # Evidências de falhas
├── behave.ini            # Configuração do runner
├── requirements.txt       # Dependências
└── run_tests.*           # Scripts de automação
\`\`\`

## 🐛 Troubleshooting comum

**Erro: ChromeDriver**
O projeto usa \`webdriver-manager\` para baixar o driver automaticamente. Se falhar, verifique sua versão do Chrome.

**Erro: ModuleNotFoundError**
Certifique-se de ativar o ambiente virtual (\`venv\`) antes de rodar os comandos manuais.

---
**Gerado por**: Extensão BDD Python Test Generator
**Data**: ${new Date().toLocaleDateString('pt-BR')}
`;
    }

    generateGitignoreContent() {
        return `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
*.egg-info/
dist/
build/

# Testes
.pytest_cache/
.coverage
htmlcov/
*.log

# Screenshots
screenshots/
*.png

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;
    }

    generateBehaveIniContent() {
        return `[behave]
show_skipped = false
show_timings = true
stdout_capture = false
stderr_capture = false
log_capture = false
format = progress
color = true
`;
    }

    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '')
            .replace(/\-+/g, '_')
            .substring(0, 50);
    }

    translateStepKeyword(step) {
        const map = {
            'Given': 'Dado',
            'When': 'Quando',
            'Then': 'Então',
            'And': 'E',
            'But': 'Mas'
        };
        return map[step] || step;
    }

    generateGherkinContent(feature) {
        let content = `# language: pt\n`;
        content += `Funcionalidade: ${feature.name}\n\n`;

        (feature.scenarios || []).forEach(scenario => {
            content += `  Cenário: ${scenario.name}\n`;
            (scenario.interactions || []).forEach(interaction => {
                const rawStep = interaction.step || 'Dado';
                const step = this.translateStepKeyword(rawStep);
                const action = this.formatGherkinStep(interaction);
                content += `    ${step} ${action}\n`;
            });
            content += `\n`;
        });

        return content;
    }

    formatGherkinStep(interaction) {
        // Formata o step do Gherkin para corresponder aos steps definitions
        const element = interaction.nomeElemento || 'elemento';
        const valor = interaction.valorPreenchido || 'valor';

        switch (interaction.acao) {
            case 'acessa_url':
                return `acessa a URL "${interaction.valorPreenchido || interaction.url || interaction.nomeElemento || ''}"`;
            case 'clica':
                return `clica no ${element}`;
            case 'preenche':
                return `preenche ${element} com "${valor}"`;
            case 'seleciona':
                return `seleciona "${valor}" em ${element}`;
            case 'marca_checkbox':
                return `marco o checkbox ${element}`;
            case 'desmarca_checkbox':
                return `desmarco o checkbox ${element}`;
            case 'seleciona_radio':
                return `seleciono o radio ${element}`;
            case 'upload':
                return `faço upload do arquivo "${valor}"`;
            case 'pressiona_enter':
                return `pressiono Enter em ${element}`;
            case 'espera_segundos':
                return `aguardo ${valor} segundos`;
            case 'valida_contem':
                return `valido que ${element} contem "${valor}"`;
            case 'valida_nao_contem':
                return `valido que ${element} nao contem "${valor}"`;
            case 'valida_existe':
                return `valido que ${element} existe`;
            case 'valida_nao_existe':
                return `valido que ${element} nao existe`;
            default:
                if (interaction.acao && interaction.acao.startsWith('valida_')) {
                    return `valido ${interaction.acao.replace('valida_', '')} em ${element} com valor "${valor}"`;
                }
                return this.formatInteractionText(interaction);
        }
    }

    generatePagesContent(feature) {
        const featureName = this.slugify(feature.name);
        const className = this.toPascalCase(featureName);

        let content = `# -*- coding: utf-8 -*-
"""
Page Object para ${feature.name}
Implementa o padrão Page Object Model com separação de locators e actions

Gerado automaticamente pela extensão BDD Test Generator
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.keys import Keys


class ${className}Locators:
    """Classe centralizada de localizadores para ${feature.name}"""
    
`;

        // Coletar elementos únicos com seletores reais
        const elementsMap = new Map();
        (feature.scenarios || []).forEach(scenario => {
            (scenario.interactions || []).forEach(interaction => {
                // Pular interações que não precisam de seletor (como acessa_url)
                if (interaction.acao === 'acessa_url' || interaction.acao === 'espera_segundos') {
                    return;
                }

                const elementName = interaction.nomeElemento || 'elemento';

                if (!elementsMap.has(elementName)) {
                    // Priorizar cssSelector, depois xpathSelector, depois xpath
                    let seletor = interaction.cssSelector ||
                        interaction.xpathSelector ||
                        interaction.seletor ||
                        interaction.xpath || '';

                    let tipoSeletor = 'CSS_SELECTOR';

                    // Determinar tipo de seletor
                    if (interaction.cssSelector || interaction.seletor) {
                        tipoSeletor = 'CSS_SELECTOR';
                        seletor = interaction.cssSelector || interaction.seletor;
                    } else if (interaction.xpathSelector || interaction.xpath) {
                        tipoSeletor = 'XPATH';
                        seletor = interaction.xpathSelector || interaction.xpath;
                    } else if (elementName) {
                        // Fallback: criar seletor baseado no nome
                        seletor = `[name="${elementName}"]`;
                        tipoSeletor = 'CSS_SELECTOR';
                    }

                    elementsMap.set(elementName, {
                        seletor: seletor,
                        tipo: tipoSeletor,
                        acao: interaction.acao
                    });
                }
            });
        });

        // Gerar locators seguindo boas práticas
        if (elementsMap.size > 0) {
            elementsMap.forEach((data, element) => {
                const locatorName = this.generateValidLocatorName(element);
                // Escapar aspas no seletor
                const selector = data.seletor
                    .replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                content += `    ${locatorName} = (By.${data.tipo}, "${selector}")\n`;
            });
        } else {
            // Adicionar locator padrão caso não haja elementos
            content += `    # Adicione seus locators aqui\n`;
            content += `    # Exemplo: BOTAO_LOGIN = (By.CSS_SELECTOR, "#btn-login")\n`;
        }

        content += `\n\n`;

        // Classe de Actions
        content += `class ${className}Page:
    """
    Page Object para ${feature.name}
    
    Este Page Object implementa:
    - Espera explícita para elementos
    - Tratamento robusto de exceções
    - Padrão fluente (method chaining)
    - Métodos de alto nível para fluxos completos
    """
    
    def __init__(self, browser, timeout=10):
        """
        Inicializa o Page Object
        
        Args:
            browser: Instância do WebDriver
            timeout: Tempo máximo de espera (padrão: 10s)
        """
        self.browser = browser
        self.wait = WebDriverWait(browser, timeout)
        self.locators = ${className}Locators()
    
    def _find_element(self, locator, timeout=None):
        """
        Busca elemento com espera explícita
        
        Args:
            locator: Tupla (By.TYPE, "selector")
            timeout: Tempo de espera customizado
            
        Returns:
            WebElement encontrado
            
        Raises:
            TimeoutException: Se elemento não for encontrado
        """
        wait = WebDriverWait(self.browser, timeout) if timeout else self.wait
        try:
            return wait.until(EC.presence_of_element_located(locator))
        except TimeoutException:
            raise TimeoutException(f"Elemento não encontrado: {locator}")
    
    def _click_element(self, locator, timeout=None):
        """
        Clica em elemento com espera por clicabilidade
        
        Args:
            locator: Tupla (By.TYPE, "selector")
            timeout: Tempo de espera customizado
            
        Returns:
            self para method chaining
        """
        wait = WebDriverWait(self.browser, timeout) if timeout else self.wait
        try:
            element = wait.until(EC.element_to_be_clickable(locator))
            element.click()
            return self
        except TimeoutException:
            # Fallback: Tenta clicar via JS se o elemento existir mas n??o for "clic??vel" (obscured/timeout)
            try:
                element = self.wait.until(EC.presence_of_element_located(locator))
                self.browser.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
                self.browser.execute_script("arguments[0].click();", element)
                return self
            except Exception:
                raise TimeoutException(f"Elemento n??o clic??vel: {locator}")
    
    def _fill_element(self, locator, text, clear=True):
        """
        Preenche elemento com texto
        
        Args:
            locator: Tupla (By.TYPE, "selector")
            text: Texto a preencher
            clear: Se deve limpar antes de preencher
            
        Returns:
            self para method chaining
        """
        try:
            element = self.wait.until(EC.visibility_of_element_located(locator))
            if clear:
                try:
                    element.clear()
                except (InvalidElementStateException, Exception):
                    # Fallback: Limpa via JS se clear() falhar (readonly/custom inputs)
                    self.browser.execute_script("arguments[0].value = '';", element)
            
            element.send_keys(text)
            return self
        except TimeoutException:
            # Fallback final: tenta setar valor direto via JS
            try:
                element = self.wait.until(EC.presence_of_element_located(locator))
                self.browser.execute_script(f"arguments[0].value = '{text}';", element)
                return self
            except:
                raise TimeoutException(f"Não foi possível preencher: {locator}")
    
    def _select_option(self, locator, value):
        """
        Seleciona opção em dropdown
        
        Args:
            locator: Tupla (By.TYPE, "selector")
            value: Valor ou texto visível da opção
            
        Returns:
            self para method chaining
        """
        try:
            element = self.wait.until(EC.visibility_of_element_located(locator))
            select = Select(element)
            try:
                select.select_by_visible_text(value)
            except:
                select.select_by_value(value)
            return self
        except TimeoutException:
            raise TimeoutException(f"Dropdown não encontrado: {locator}")
    
    def verificar_carregamento(self):
        """
        Verifica se a página foi carregada corretamente
        
        Returns:
            self para method chaining
        """
        try:
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            return self
        except TimeoutException:
            raise TimeoutException("Página não carregou corretamente")
    
`;

        // Gerar métodos específicos para cada elemento
        elementsMap.forEach((data, element) => {
            const methodBaseName = this.toSnakeCase(this.sanitizeMethodName(element));
            const locatorName = this.generateValidLocatorName(element);

            // Método de preenchimento
            content += `    def preencher_${methodBaseName}(self, texto):\n`;
            content += `        """\n`;
            content += `        Preenche o campo ${element}\n`;
            content += `        \n`;
            content += `        Args:\n`;
            content += `            texto: Valor a ser preenchido\n`;
            content += `        \n`;
            content += `        Returns:\n`;
            content += `            self para method chaining\n`;
            content += `        """\n`;
            content += `        return self._fill_element(self.locators.${locatorName}, texto)\n`;
            content += `    \n`;

            // Método de clique
            content += `    def clicar_${methodBaseName}(self):\n`;
            content += `        """\n`;
            content += `        Clica em ${element}\n`;
            content += `        \n`;
            content += `        Returns:\n`;
            content += `            self para method chaining\n`;
            content += `        """\n`;
            content += `        return self._click_element(self.locators.${locatorName})\n`;
            content += `    \n`;

            // Método para obter texto
            content += `    def obter_texto_${methodBaseName}(self):\n`;
            content += `        """\n`;
            content += `        Obtém o texto de ${element}\n`;
            content += `        \n`;
            content += `        Returns:\n`;
            content += `            str: Texto do elemento\n`;
            content += `        """\n`;
            content += `        try:\n`;
            content += `            element = self.wait.until(EC.visibility_of_element_located(self.locators.${locatorName}))\n`;
            content += `            return element.text\n`;
            content += `        except TimeoutException:\n`;
            content += `            return ""\n`;
            content += `    \n`;

            // Método para verificar visibilidade
            content += `    def elemento_visivel_${methodBaseName}(self):\n`;
            content += `        """\n`;
            content += `        Verifica se ${element} está visível\n`;
            content += `        \n`;
            content += `        Returns:\n`;
            content += `            bool: True se visível, False caso contrário\n`;
            content += `        """\n`;
            content += `        try:\n`;
            content += `            self.wait.until(EC.visibility_of_element_located(self.locators.${locatorName}))\n`;
            content += `            return True\n`;
            content += `        except TimeoutException:\n`;
            content += `            return False\n`;
            content += `    \n`;
        });

        // Adicionar método de alto nível se houver padrão de login
        const hasLogin = Array.from(elementsMap.keys()).some(key =>
            key.toLowerCase().includes('login') ||
            key.toLowerCase().includes('usuario') ||
            key.toLowerCase().includes('user') ||
            key.toLowerCase().includes('email')
        );
        const hasPassword = Array.from(elementsMap.keys()).some(key =>
            key.toLowerCase().includes('senha') ||
            key.toLowerCase().includes('password')
        );

        if (hasLogin && hasPassword) {
            content += `    def realizar_login(self, usuario, senha):\n`;
            content += `        """\n`;
            content += `        Método de alto nível para realizar login completo\n`;
            content += `        \n`;
            content += `        Args:\n`;
            content += `            usuario: Nome de usuário ou email\n`;
            content += `            senha: Senha do usuário\n`;
            content += `        \n`;
            content += `        Returns:\n`;
            content += `            self para method chaining\n`;
            content += `        """\n`;

            // Encontrar os campos corretos
            const loginField = Array.from(elementsMap.keys()).find(key =>
                key.toLowerCase().includes('login') ||
                key.toLowerCase().includes('usuario') ||
                key.toLowerCase().includes('user') ||
                key.toLowerCase().includes('email')
            );
            const passwordField = Array.from(elementsMap.keys()).find(key =>
                key.toLowerCase().includes('senha') ||
                key.toLowerCase().includes('password')
            );
            const submitButton = Array.from(elementsMap.keys()).find(key =>
                key.toLowerCase().includes('entrar') ||
                key.toLowerCase().includes('login') ||
                key.toLowerCase().includes('submit') ||
                key.toLowerCase().includes('botao')
            );

            if (loginField) {
                const methodName = this.toSnakeCase(this.sanitizeMethodName(loginField));
                content += `        self.preencher_${methodName}(usuario)\n`;
            }
            if (passwordField) {
                const methodName = this.toSnakeCase(this.sanitizeMethodName(passwordField));
                content += `        self.preencher_${methodName}(senha)\n`;
            }
            if (submitButton) {
                const methodName = this.toSnakeCase(this.sanitizeMethodName(submitButton));
                content += `        self.clicar_${methodName}()\n`;
            }
            content += `        return self\n`;
            content += `    \n`;
        }

        return content;
    }

    generateValidLocatorName(elementName) {
        // Gera nome válido para locator seguindo boas práticas
        return this.toSnakeCase(this.sanitizeMethodName(elementName)).toUpperCase();
    }

    sanitizeMethodName(name) {
        // Remove caracteres especiais e sanitiza o nome
        return name
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_|_$/g, '');
    }

    generateStepsContent(feature) {
        const featureName = this.slugify(feature.name);
        const className = this.toPascalCase(featureName);

        let content = `# -*- coding: utf-8 -*-
"""
Steps para a feature: ${feature.name}
Gerado automaticamente pela extensão BDD Test Generator

Este arquivo contém as definições de steps para o Behave seguindo o padrão Page Object Model.
"""

from behave import given, when, then, step
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from features.pages.${featureName}_page import ${className}Page
import time

`;

        // Coletar todas as interações únicas de todos os cenários
        const allInteractions = [];
        const uniqueSteps = new Set();

        (feature.scenarios || []).forEach(scenario => {
            (scenario.interactions || []).forEach(interaction => {
                const stepText = this.formatGherkinStep(interaction);
                // Usar realStepType se disponível, senão fallback para step ou When
                // Isso evita gerar @and (erro de sintaxe)
                const semanticType = interaction.realStepType || (interaction.step === 'And' ? 'When' : (interaction.step || 'When'));

                const stepKey = `${semanticType}_${stepText}`;

                if (!uniqueSteps.has(stepKey)) {
                    uniqueSteps.add(stepKey);
                    allInteractions.push({
                        ...interaction,
                        stepText: stepText,
                        stepType: semanticType // Passar o tipo semântico para o gerador
                    });
                }
            });
        });

        // Gerar steps ordenados (Given -> When -> Then)
        const sortedSteps = allInteractions.sort((a, b) => {
            const order = { 'Given': 1, 'When': 2, 'Then': 3 };
            return (order[a.stepType] || 4) - (order[b.stepType] || 4);
        });

        sortedSteps.forEach(interaction => {
            content += this.generateStepDefinition(interaction, className, featureName);
        });

        return content;
    }

    generateEnvironmentContent() {
        return `# -*- coding: utf-8 -*-
"""
Configurações de ambiente Behave
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
import os
import time
from datetime import datetime
from fpdf import FPDF

# ==============================================================================
# CONFIGURAÇÃO DE RELATÓRIO PDF
# ==============================================================================
class PDFReport(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'Relatório de Execução de Testes', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Página {self.page_no()}', 0, 0, 'C')

def generate_pdf_report(context):
    if not hasattr(context, 'pdf_data'):
        return

    pdf = PDFReport()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Resumo
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, f"Data da Execução: {datetime.now().strftime('%d/%m/%Y %H:%M')}", 0, 1)
    pdf.ln(5)

    for feature in context.pdf_data['features']:
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, f"Feature: {feature['name']}", 0, 1)
        
        for scenario in feature['scenarios']:
            status_color = (0, 128, 0) if scenario['status'] == 'passed' else (255, 0, 0)
            pdf.set_text_color(*status_color)
            pdf.set_font("Arial", 'B', 12)
            pdf.cell(0, 10, f"  Cenario: {scenario['name']} - {scenario['status'].upper()}", 0, 1)
            pdf.set_text_color(0, 0, 0)
            
            for step in scenario['steps']:
                pdf.set_font("Arial", size=10)
                pdf.multi_cell(0, 6, f"    Step: {step['name']} ({step['status']})")
                
                # Inserir screenshot se houver
                if 'screenshot' in step and os.path.exists(step['screenshot']):
                    try:
                        # Centralizar imagem
                        pdf.ln(2)
                        original_x = pdf.get_x()
                        
                        # Tenta ajustar tamanho (largura máx 100)
                        pdf.image(step['screenshot'], x=pdf.get_x() + 20, w=100)
                        pdf.ln(5)
                    except Exception:
                        pdf.cell(0, 5, "[Erro ao inserir imagem]", 0, 1)

            pdf.ln(5)
            
    try:
        pdf.output("relatorio_testes_detalhado.pdf")
        print("[RELATORIO] PDF gerado: relatorio_testes_detalhado.pdf")
    except Exception as e:
        print(f"[ERRO] Falha ao gerar PDF: {e}")

# ==============================================================================
# HOOKS DO BEHAVE
# ==============================================================================

def before_all(context):
    """Executado antes de todos os testes"""
    # Inicializa estrutura de dados para o relatório
    context.pdf_data = {'features': []}
    
    # URL Base global (pode ser sobrescrita por variavel de ambiente)
    context.base_url = os.getenv('BASE_URL', 'http://localhost:8080')

def after_all(context):
    """Executado após todos os testes"""
    generate_pdf_report(context)

def before_feature(context, feature):
    context.current_feature_data = {
        'name': feature.name,
        'scenarios': []
    }
    context.pdf_data['features'].append(context.current_feature_data)

def before_scenario(context, scenario):
    """Executado antes de cada cenário"""
    # Configuração do WebDriver (Por Cenário para isolamento)
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    
    if os.getenv('HEADLESS') == 'true':
        chrome_options.add_argument("--headless")

    try:
        service = Service(ChromeDriverManager().install())
        context.browser = webdriver.Chrome(service=service, options=chrome_options)
    except Exception as e:
        print(f"Erro service: {e}. Tentando direto.")
        context.browser = webdriver.Chrome(options=chrome_options)
        
    
    # Implicit wait REMOVIDO para favorecer espera explicita
    # context.browser.implicitly_wait(10)
    
    # Dados para relatório
    context.current_scenario_data = {
        'name': scenario.name,
        'steps': [],
        'status': 'unknown'
    }
    context.current_feature_data['scenarios'].append(context.current_scenario_data)

def after_scenario(context, scenario):
    """Executado após cada cenário"""
    context.current_scenario_data['status'] = scenario.status.name
    
    if scenario.status == 'failed':
        take_screenshot(context, f"FALHA_{scenario.name}")
        
    if hasattr(context, 'browser'):
        context.browser.quit()

def before_step(context, step):
    """Executado antes de cada step"""
    # Monkey-patch para corrigir erro 'Step object has no attribute embed'
    # causado pelo behave-html-formatter em versoes mais antigas do behave
    if not hasattr(step, 'embed'):
        step.embed = lambda mime_type, data, caption=None: None

def after_step(context, step):
    """Executado após cada step"""
    step_name = step.name.replace('"', '').replace("'", "").replace(" ", "_")
    screenshot_path = take_screenshot(context, f"OK_{step_name}")
    
    # Garantir status correto (string)
    status_name = step.status.name if hasattr(step.status, 'name') else str(step.status)
    
    step_data = {
        'keyword': step.keyword,
        'name': step.name,
        'status': status_name
    }
    
    # Capturar mensagem de erro se falhou
    if status_name == 'failed':
        if hasattr(step, 'exception') and step.exception:
            step_data['error_message'] = str(step.exception)
        elif hasattr(step, 'error_message'):
            step_data['error_message'] = step.error_message
        else:
             step_data['error_message'] = "Erro desconhecido capturado no step."

    if screenshot_path:
        step_data['screenshot'] = screenshot_path
        
    context.current_scenario_data['steps'].append(step_data)

def take_screenshot(context, name):
    """
    Tira screenshot garantindo que a página esteja carregada.
    Retorna o caminho do arquivo ou None.
    """
    if not hasattr(context, 'browser'):
        return None
        
    screenshots_dir = 'screenshots'
    if not os.path.exists(screenshots_dir):
        os.makedirs(screenshots_dir)

    # ============================================================
    # GARANTIA DE ESTABILIDADE (WAIT FOR READY)
    # ============================================================
    try:
        # 1. Aguarda document.readyState == 'complete'
        WebDriverWait(context.browser, 2).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        # 2. Pequeno delay para animações/renderização final
        time.sleep(0.5)
    except:
        # Se der timeout, tira o print mesmo assim (melhor que nada)
        pass

    timestamp = datetime.now().strftime("%H-%M-%S")
    safe_name = "".join([c for c in name if c.isalpha() or c.isdigit() or c=='_' or c=='-']).rstrip()
    screenshot_name = f"{screenshots_dir}/{timestamp}_{safe_name}.png"

    try:
        context.browser.save_screenshot(screenshot_name)
        return screenshot_name
    except Exception as e:
        print(f"Erro ao salvar screenshot: {e}")
        return None
`;
    }

    generateGitignoreContent() {
        return `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
*.egg-info/
dist/
build/

# Testes
.pytest_cache/
.coverage
htmlcov/
*.log

# Screenshots
screenshots/
*.png

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;
    }

    generateBehaveIniContent() {
        return `[behave]
show_skipped = false
show_timings = true
stdout_capture = false
stderr_capture = false
log_capture = false
format = pretty
color = true
lang = pt
`;
    }

    generateRunBatContent() {
        return `@echo off
echo ===================================================
echo      Execucao Automatica de Testes BDD
echo ===================================================
echo.

if not exist "venv" (
    echo [INFO] Criando ambiente virtual...
    python -m venv venv
)

echo [INFO] Ativando ambiente virtual...
call venv\\Scripts\\activate

echo [INFO] Instalando dependencias...
pip install -r requirements.txt > nul

echo.
echo [INFO] Executando testes...
behave --color --format pretty

echo.
echo ===================================================
echo      Teste Finalizado
echo ===================================================
pause
`;
    }

    generateRunShContent() {
        return `#!/bin/bash
echo "==================================================="
echo "     Execucao Automatica de Testes BDD"
echo "==================================================="
echo ""

if [ ! -d "venv" ]; then
    echo "[INFO] Criando ambiente virtual..."
    python3 -m venv venv
fi

echo "[INFO] Ativando ambiente virtual..."
source venv/bin/activate

echo "[INFO] Instalando dependencias..."
pip install -r requirements.txt > /dev/null

echo ""
echo "[INFO] Executando testes..."
behave --color --format pretty

echo ""
echo "==================================================="
echo "     Teste Finalizado"
echo "==================================================="
`;
    }


    generateRequirementsContent() {
        return `# Dependências Python para testes BDD
# Instale com: pip install -r requirements.txt

selenium==4.15.2
behave==1.2.6
webdriver-manager==4.0.1
parse==1.19.1
parse-type==0.6.2
six==1.16.0
`;
    }

    formatInteractionText(interaction) {
        const action = interaction.acao || 'ação';
        const element = interaction.nomeElemento || 'elemento';
        const value = interaction.valorPreenchido || '';

        let text = '';
        switch (action) {
            case 'clica':
                text = `clica no ${element} `;
                break;
            case 'preenche':
                text = `preenche ${element} com "${value}"`;
                break;
            case 'seleciona':
                text = `seleciona "${value}" em ${element} `;
                break;
            case 'acessa_url':
                text = `acessa a URL "${value || element}"`;
                break;
            default:
                text = `executa ação "${action}" em ${element} `;
        }

        return text;
    }

    toPascalCase(text) {
        return text
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }

    toSnakeCase(text) {
        return text
            .replace(/([A-Z])/g, '_$1')
            .toLowerCase()
            .replace(/^_/, '')
            .replace(/\s+/g, '_');
    }

    exportAsIndividualFiles(exportData) {
        exportData.forEach(item => {
            const featureSlug = this.slugify(item.featureName);

            item.files.forEach(file => {
                let filename = file.name;

                // Estrutura do Behave:
                // features/
                //   ├── *.feature
                //   ├── pages/
                //   │   └── *_page.py
                //   └── steps/
                //       └── *_steps.py
                // environment.py (raiz)
                // requirements.txt (raiz)

                if (filename.endsWith('.feature')) {
                    filename = `features / ${filename} `;
                } else if (filename.startsWith('pages/')) {
                    filename = `features / ${filename} `;
                } else if (filename.startsWith('steps/')) {
                    filename = `features / ${filename} `;
                } else if (filename.includes('metadata')) {
                    filename = `metadata / ${filename} `;
                } else if (filename.includes('audit')) {
                    filename = `logs / ${filename} `;
                }

                downloadFile(filename, file.content);
            });
        });
    }

    async exportAsZip(exportData) {
        try {
            const folderStructure = {
                '': [], // Arquivos na raiz
                'features': [],
                'features/steps': [],
                'features/pages': [],
                'features/utils': [], // Nova pasta utils
                'logs': [],
                'metadata': []
            };

            exportData.forEach(item => {
                item.files.forEach(file => {
                    let filename = file.name;
                    let targetFolder = ''; // Raiz por padrão

                    // Determinar pasta de destino baseado no tipo/nome do arquivo
                    if (filename.endsWith('.feature')) {
                        targetFolder = 'features';
                    } else if (filename.startsWith('pages/')) {
                        targetFolder = 'features/pages';
                        file.name = file.name.replace('pages/', '');
                    } else if (filename.startsWith('steps/')) {
                        targetFolder = 'features/steps';
                        file.name = file.name.replace('steps/', '');
                    } else if (filename.startsWith('features/')) {
                        // Para arquivos genéricos dentro de features (ex: __init__.py)
                        targetFolder = 'features';
                        file.name = file.name.replace('features/', '');
                    } else if (filename.includes('expert_audit') || filename.includes('audit')) {
                        targetFolder = 'logs';
                    } else if (filename.includes('metadata')) {
                        targetFolder = 'metadata';
                    } else if (filename === 'environment.py' || filename === 'requirements.txt' || filename === 'README.md' || filename.endsWith('.bat') || filename.endsWith('.sh') || filename.endsWith('.ini') || filename.startsWith('.')) {
                        targetFolder = '';
                    }

                    // Se a pasta não existir no mapa, criar
                    if (!folderStructure[targetFolder] && targetFolder !== '') {
                        folderStructure[targetFolder] = [];
                    }

                    const targetArray = targetFolder === '' ? folderStructure[''] : folderStructure[targetFolder];
                    targetArray.push(file);
                });
            });

            // Gerar ZIP
            const zipBuffer = FileCompressor.createStructuredZip(folderStructure, 'bdd_project_export.zip');

            // Download
            const blob = new Blob([zipBuffer], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bdd_export_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.logger.success('Arquivo ZIP gerado e baixado com sucesso');

        } catch (error) {
            this.logger.error('Falha na geração do ZIP', { error: error.message });
            throw error; // Propagar para ser tratado pelo caller
        }
    }

    generateStepDefinition(interaction, className, featureName) {
        const stepType = interaction.step || interaction.stepType || 'When';
        const stepText = interaction.stepText;
        const methodBaseName = this.toSnakeCase(this.sanitizeMethodName(interaction.nomeElemento || 'elemento'));

        let pythonCode = '';
        const decorator = stepType.toLowerCase();

        pythonCode += `@${decorator}('${stepText}')\n`;
        pythonCode += `def step_impl(context):\n`;

        pythonCode += `    if not hasattr(context, 'page') or not isinstance(context.page, ${className}Page):\n`;
        pythonCode += `        context.page = ${className}Page(context.browser)\n`;

        const param = interaction.valorPreenchido ? `"${interaction.valorPreenchido}"` : '""';

        switch (interaction.acao) {
            case 'clica':
                pythonCode += `    context.page.clicar_${methodBaseName}()\n`;
                break;
            case 'preenche':
                pythonCode += `    context.page.preencher_${methodBaseName}(${param})\n`;
                break;
            case 'acessa_url':
                const url = interaction.valorPreenchido || interaction.url || interaction.nomeElemento;
                if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                    pythonCode += `    context.browser.get("${url}")\n`;
                } else {
                    pythonCode += `    target_url = context.base_url  + "${url.startsWith('/') ? '' : '/'}${url}"\n`;
                    pythonCode += `    context.browser.get(target_url)\n`;
                }
                pythonCode += `    context.page.verificar_carregamento()\n`;
                break;
            case 'seleciona':
                pythonCode += `    context.page._select_option(context.page.locators.${this.generateValidLocatorName(interaction.nomeElemento)}, ${param})\n`;
                break;
            case 'espera_segundos':
                // valorPreenchido contém os segundos
                pythonCode += `    import time\n`;
                pythonCode += `    time.sleep(${interaction.valorPreenchido || 1})\n`;
                break;
            case 'valida_existe':
                pythonCode += `    assert context.page.elemento_visivel_${methodBaseName}(), f"Elemento ${interaction.nomeElemento} deveria estar visível"\n`;
                break;
            case 'valida_nao_existe':
                pythonCode += `    assert not context.page.elemento_visivel_${methodBaseName}(), f"Elemento ${interaction.nomeElemento} não deveria estar visível"\n`;
                break;
            case 'valida_contem':
                pythonCode += `    texto_obtido = context.page.obter_texto_${methodBaseName}()\n`;
                pythonCode += `    assert ${param} in texto_obtido, f"Esperado '{${param}}' em '{texto_obtido}'"\n`;
                break;
            case 'valida_nao_contem':
                pythonCode += `    texto_obtido = context.page.obter_texto_${methodBaseName}()\n`;
                pythonCode += `    assert ${param} not in texto_obtido, f"Não esperado '{${param}}' em '{texto_obtido}'"\n`;
                break;
            default:
                if (interaction.acao.startsWith('clica')) {
                    pythonCode += `    context.page.clicar_${methodBaseName}()\n`;
                } else if (interaction.acao.startsWith('preenche')) {
                    pythonCode += `    context.page.preencher_${methodBaseName}(${param})\n`;
                } else {
                    pythonCode += `    pass\n`;
                }
        }

        pythonCode += `\n`;
        return pythonCode;
    }

    generateEnvironmentContent() {
        return `# -*- coding: utf-8 -*-
"""
Configurações de ambiente Behave com Relatório PDF e HTML Melhorado
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import os
import time
import json
import base64
from datetime import datetime
from fpdf import FPDF

class PDFReport(FPDF):
    """Classe customizada para relatório PDF"""
    def header(self):
        self.set_font('Arial', 'B', 15)
        # Cor de fundo do cabeçalho
        self.set_fill_color(51, 122, 183)
        self.set_text_color(255, 255, 255)
        self.cell(0, 10, 'Relatório de Execução de Testes BDD', 0, 1, 'C', 1)
        self.ln(5)
        
    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Página {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(230, 230, 230)
        self.set_text_color(0, 0, 0)
        self.cell(0, 6, title, 0, 1, 'L', 1)
        self.ln(2)

def before_all(context):
    """Executado antes de todos os testes"""
    context.start_time = datetime.now()
    # Inicializa dados para relatório
    context.pdf_data = {'features': []}
    # URL base global
    context.base_url = os.getenv('BASE_URL', 'http://localhost:8080')

def after_all(context):
    """Executado após todos os testes"""
    end_time = datetime.now()
    duration = end_time - context.start_time
    
    # Coletar estatísticas
    total_scenarios = 0
    passed_scenarios = 0
    failed_scenarios = 0
    skipped_scenarios = 0 # Behave não expõe fácil o skipped no after_all global se não trackeado, mas vamos tentar inferir ou usar 0
    
    # Iterar sobre o que coletamos para o PDF
    for feature in context.pdf_data['features']:
        for scenario in feature['scenarios']:
            total_scenarios += 1
            if scenario['status'] == 'passed':
                passed_scenarios += 1
            elif scenario['status'] == 'failed':
                failed_scenarios += 1
            else:
                skipped_scenarios += 1
                
    # Salvar resumo em JSON para o script de melhoria visual
    summary = {
        'start_time': context.start_time.strftime('%d/%m/%Y %H:%M'),
        'duration': str(duration).split('.')[0], # Remove microsegundos variados
        'total': total_scenarios,
        'passed': passed_scenarios,
        'failed': failed_scenarios,
        'skipped': skipped_scenarios
    }
    
    try:
        with open('summary.json', 'w') as f:
            json.dump(summary, f)
    except:
        pass

    # Gera relatórios PDF
    try:
        generate_management_report(summary, context)
        generate_evidence_report(context)
        generate_bug_report(context)
    except Exception as e:
        print(f"Erro ao gerar relatórios PDF: {e}")

def before_feature(context, feature):
    """Hook de feature para relatório"""
    context.current_feature_data = {
        'name': feature.name,
        'scenarios': []
    }
    context.pdf_data['features'].append(context.current_feature_data)

def before_scenario(context, scenario):
    """Executado antes de cada cenário"""
    # Configuração do WebDriver (Por Cenário)
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    if os.getenv('HEADLESS', 'false').lower() == 'true':
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
    
    try:
        service = Service(ChromeDriverManager().install())
        context.browser = webdriver.Chrome(service=service, options=chrome_options)
    except Exception as e:
        print(f"Erro ao inicializar driver: {e}")
        context.browser = webdriver.Chrome(options=chrome_options)
        
    context.browser.implicitly_wait(10)

    # Dados para relatório
    context.current_scenario_data = {
        'name': scenario.name,
        'steps': [],
        'status': 'Unknown'
    }
    if hasattr(context, 'current_feature_data'):
        context.current_feature_data['scenarios'].append(context.current_scenario_data)

def after_scenario(context, scenario):
    """Executado após cada cenário"""
    # Atualiza status no relatório
    if hasattr(context, 'current_scenario_data'):
        context.current_scenario_data['status'] = scenario.status.name

    if scenario.status == 'failed':
        take_screenshot(context, f"FALHA_{scenario.name}")
        
    # Encerra o navegador ao fim do cenário
    if hasattr(context, 'browser'):
        context.browser.quit()

def after_step(context, step):
    """Executado após cada step"""
    if step.status == 'failed':
        # Tira screenshot e embeda no HTML (base64)
        screenshot_data = take_screenshot_base64(context)
        if screenshot_data:
             # Mostra imagem no relatório HTML do behave-html-formatter
             step.embed(mime_type='image/png', data=screenshot_data)
    
    # Limpar nome do step para arquivo seguro
    step_name_safe = step.name.replace('"', '').replace("'", "").replace(" ", "_")
    
    # Tira screenshot físico para o PDF
    screenshot_path = take_screenshot(context, f"STEP_{step_name_safe}")
    
    # Adiciona ao relatório PDF
    if hasattr(context, 'current_scenario_data'):
        context.current_scenario_data['steps'].append({
            'name': step.name,
            'status': step.status.name,
            'screenshot': screenshot_path
        })

def take_screenshot_base64(context):
    """Retorna screenshot em base64 bytes"""
    if not hasattr(context, 'browser'):
        return None
    try:
        return context.browser.get_screenshot_as_png()
    except:
        return None

def take_screenshot(context, name):
    """Função auxiliar para tirar screenshots e retornar o caminho"""
    if not hasattr(context, 'browser'):
        return None
        
    # Criar pasta para screenshots se não existir
    base_dir = os.getcwd()
    screenshots_dir = os.path.join(base_dir, 'screenshots')
    if not os.path.exists(screenshots_dir):
        os.makedirs(screenshots_dir)
    
    # Adicionar timestamp
    timestamp = datetime.now().strftime("%H-%M-%S-%f")
    safe_name = "".join([c for c in name if c.isalpha() or c.isdigit() or c=='_' or c=='-']).rstrip()
    filename = f"{timestamp}_{safe_name}.png"
    filepath = os.path.join(screenshots_dir, filename)
    
    try:
        context.browser.save_screenshot(filepath)
        return filepath
    except Exception as e:
        print(f"Erro ao salvar screenshot: {e}")
        return None

    except Exception as e:
        print(f"[ERRO] Falha ao gerar relatório PDF: {e}")

def draw_dashboard_card(pdf, x, y, w, h, title, value, color):
    pdf.set_xy(x, y)
    pdf.set_fill_color(*color)
    pdf.rect(x, y, w, h, 'F')
    
    # Title
    pdf.set_xy(x, y + 5)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(w, 5, title, 0, 1, 'C')
    
    # Value
    pdf.set_xy(x, y + 15)
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(w, 10, str(value), 0, 1, 'C')

def generate_management_report(summary, context):
    """Gera o Relatório Gerencial (Dashboard) em PDF com layout profissional"""
    try:
        pdf = PDFReport()
        pdf.add_page()

        # Configurações de Cores
        COLOR_PRIMARY = (52, 58, 64)      # Dark Grey
        COLOR_SUCCESS = (40, 167, 69)     # Green
        COLOR_FAILURE = (220, 53, 69)     # Red
        COLOR_WARNING = (255, 193, 7)     # Yellow
        COLOR_HEADER = (233, 236, 239)    # Light Grey
        
        # --- CABEÇALHO ---
        pdf.set_fill_color(*COLOR_PRIMARY)
        pdf.rect(0, 0, 210, 40, 'F')
        
        pdf.set_y(10)
        pdf.set_font('Arial', 'B', 20)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(0, 10, 'Relatório Executivo de Qualidade', 0, 1, 'C')
        
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 8, f"Projeto: Testes Automatizados BDD", 0, 1, 'C')
        pdf.ln(15)

        # --- RESUMO EXECUTIVO (CARDS) ---
        pdf.set_text_color(0, 0, 0)
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Resumo da Execução', 0, 1, 'L')
        pdf.set_draw_color(200, 200, 200)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)

        # Dados
        total = summary.get('total', 0)
        passed = summary.get('passed', 0)
        failed = summary.get('failed', 0)
        skipped = summary.get('skipped', 0)
        duration = summary.get('duration', '0s')
        date_str = datetime.now().strftime('%d/%m/%Y %H:%M')
        
        success_rate = (passed / total * 100) if total > 0 else 0

        # Função auxiliar para desenhar cards
        def draw_kpi(x, y, w, h, title, value, color_rgb):
            pdf.set_fill_color(*color_rgb)
            pdf.rect(x, y, w, h, 'F')
            
            pdf.set_xy(x, y + 5)
            pdf.set_font('Arial', '', 10)
            pdf.set_text_color(255, 255, 255)
            pdf.cell(w, 5, title, 0, 2, 'C')
            
            pdf.set_font('Arial', 'B', 20)
            pdf.cell(w, 10, str(value), 0, 0, 'C')

        # Posicionamento dos Cards
        y_cards = pdf.get_y()
        card_w = 45
        gap = 5
        
        draw_kpi(10, y_cards, card_w, 30, "Total Cenários", total, (108, 117, 125))
        draw_kpi(10 + card_w + gap, y_cards, card_w, 30, "Aprovados", passed, COLOR_SUCCESS)
        draw_kpi(10 + (card_w + gap)*2, y_cards, card_w, 30, "Falhados", failed, COLOR_FAILURE)
        draw_kpi(10 + (card_w + gap)*3, y_cards, card_w, 30, "Taxa Sucesso", f"{success_rate:.1f}%", COLOR_PRIMARY)
        
        pdf.set_y(y_cards + 40)
        
        # --- INFO ADICIONAL ---
        pdf.set_font('Arial', '', 11)
        pdf.set_text_color(50, 50, 50)
        pdf.cell(95, 8, f"Data: {date_str}", 0, 0)
        pdf.cell(95, 8, f"Duração Total: {duration}", 0, 1, 'R')
        pdf.ln(5)

        # --- BARRAS DE PROGRESSO ---
        if total > 0:
            bar_w = 190
            bar_h = 10
            
            # Fundo (Cinza/Skipped)
            pdf.set_fill_color(220, 220, 220)
            pdf.rect(10, pdf.get_y(), bar_w, bar_h, 'F')
            
            # Verde (Passed)
            w_passed = (passed / total) * bar_w
            if w_passed > 0:
                pdf.set_fill_color(*COLOR_SUCCESS)
                pdf.rect(10, pdf.get_y(), w_passed, bar_h, 'F')
            
            # Vermelho (Failed)
            w_failed = (failed / total) * bar_w
            if w_failed > 0:
                pdf.set_fill_color(*COLOR_FAILURE)
                pdf.rect(10 + w_passed, pdf.get_y(), w_failed, bar_h, 'F')
                
            pdf.ln(15)

        # --- DETALHAMENTO POR FUNCIONALIDADE (TABELA) ---
        pdf.set_text_color(0, 0, 0)
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Detalhamento por Funcionalidade', 0, 1, 'L')
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)
        
        # Cabeçalho da Tabela
        col_widths = [90, 25, 25, 25, 25] # Nome, Total, Pass, Fail, %
        headers = ['Funcionalidade', 'Total', 'Pass', 'Fail', '%']
        
        pdf.set_fill_color(*COLOR_HEADER)
        pdf.set_font('Arial', 'B', 10)
        for i, h in enumerate(headers):
            pdf.cell(col_widths[i], 8, h, 1, 0, 'C', 1)
        pdf.ln()
        
        pdf.set_font('Arial', '', 10)
        
        # Simulação de dados por funcionalidade (como não temos no summary simples, vamos simular ou pegar do contexto se possível)
        # O summary.json atual é simples, então vamos usar apenas os totais globais como exemplo ou precisamos passar 'context' pra cá também.
        # Para evitar quebra, vamos usar uma linha "Geral" se não tiver detalhes, mas o ideal seria o 'context'.
        # VOU ALTERAR A CHAMADA DESTA FUNÇÃO PARA RECEBER 'context' TAMBÉM SE POSSÍVEL.
        # Como o summary é json e passado isolado, vou manter simples por agora, mas com layout pronto.
        
        # Iterar sobre features do context
        if 'features' in context.pdf_data:
            for feature in context.pdf_data['features']:
                f_name = feature['name']
                f_total = len(feature.get('scenarios', []))
                f_passed = sum(1 for s in feature.get('scenarios', []) if s.get('status') == 'passed')
                f_failed = sum(1 for s in feature.get('scenarios', []) if s.get('status') == 'failed')
                f_rate = (f_passed / f_total * 100) if f_total > 0 else 0
                
                # Truncar nome se muito longo
                display_name = (f_name[:35] + '..') if len(f_name) > 37 else f_name
                
                pdf.cell(col_widths[0], 8, display_name, 1, 0, 'L')
                pdf.cell(col_widths[1], 8, str(f_total), 1, 0, 'C')
                
                # Cells coloridas condicionalmente? O fpdf é meio chato, vamos simples.
                pdf.cell(col_widths[2], 8, str(f_passed), 1, 0, 'C')
                
                if f_failed > 0:
                    pdf.set_text_color(220, 53, 69)
                    pdf.set_font('Arial', 'B', 10)
                else:
                    pdf.set_text_color(0, 0, 0)
                    
                pdf.cell(col_widths[3], 8, str(f_failed), 1, 0, 'C')
                
                pdf.set_text_color(0, 0, 0)
                pdf.set_font('Arial', '', 10)
                
                pdf.cell(col_widths[4], 8, f"{f_rate:.0f}%", 1, 1, 'C')
        else:
             pdf.cell(0, 8, "Nenhuma feature encontrada.", 1, 1, 'C')

        output_file = 'relatorio_gerencial.pdf'
        pdf.output(output_file)
        print(f"[RELATORIO] Relatório Gerencial gerado: {output_file}")
            
    except Exception as e:
        print(f"[ERRO] Falha ao gerar Relatório Gerencial: {e}")

def generate_evidence_report(context):
    """Gera o Relatório de Evidências (Steps e Prints)"""
    try:
        pdf = PDFReport()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, 'Relatório de Evidências', 0, 1, 'C')
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 5, f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", 0, 1, 'C')
        pdf.ln(10)
        
        for feature in context.pdf_data['features']:
            pdf.chapter_title(f"Funcionalidade: {feature['name']}")
            
            for scenario in feature['scenarios']:
                # Cabeçalho do Cenário
                status_bg = (212, 237, 218) if scenario['status'] == 'passed' else (248, 215, 218)
                status_text_color = (21, 87, 36) if scenario['status'] == 'passed' else (114, 28, 36)
                
                pdf.set_fill_color(*status_bg)
                pdf.set_text_color(*status_text_color)
                pdf.set_font('Arial', 'B', 11)
                
                if pdf.get_y() > 250:
                    pdf.add_page()
                
                pdf.cell(0, 10, f"Cenário: {scenario['name']}", 0, 1, 'L', 1)
                pdf.set_text_color(0, 0, 0)
                pdf.ln(2)
                
                for step in scenario['steps']:
                    # START - KEEP TOGETHER LOGIC
                    # Calcula espaço necessário (Texto + Imagem) para evitar quebra
                    required_space = 15 # Espaço mínimo para o texto
                    if step.get('screenshot') and os.path.exists(step['screenshot']):
                        required_space += 75 # Espaço para imagem + label
                    
                    if pdf.get_y() + required_space > pdf.h - 15:
                         pdf.add_page()
                    # END - KEEP TOGETHER LOGIC

                    status_text = step['status'].upper()
                    badge_bg = (40, 167, 69) if step['status'] == 'passed' else (220, 53, 69)
                    
                    pdf.set_fill_color(*badge_bg)
                    pdf.set_text_color(255, 255, 255)
                    pdf.set_font('Arial', 'B', 8)
                    
                    badge_w = pdf.get_string_width(status_text) + 6
                    pdf.cell(badge_w, 6, status_text, 0, 0, 'C', 1)
                    
                    pdf.set_x(pdf.get_x() + 2)
                    pdf.set_text_color(0, 0, 0)
                    pdf.set_font('Arial', '', 10)
                    pdf.multi_cell(0, 6, f"{step['name']}")
                    
                    if step.get('screenshot') and os.path.exists(step['screenshot']):
                        try:
                            pdf.ln(1)
                            pdf.set_font('Arial', 'I', 8)
                            pdf.set_text_color(100, 100, 100)
                            pdf.cell(0, 4, "Evidência:", 0, 1)
                            
                            img_w = 110 
                            x_pos = (pdf.w - img_w) / 2
                            
                            # (Check removido pois já validamos antes)
                            
                            pdf.image(step['screenshot'], x=x_pos, w=img_w)
                            pdf.ln(5) 
                        except Exception as e:
                            pdf.cell(0, 5, f"[Erro ao inserir imagem]", 0, 1)
                    
                    pdf.ln(3) 

                pdf.ln(5)
                pdf.set_draw_color(230, 230, 230)
                pdf.line(10, pdf.get_y(), 200, pdf.get_y())
                pdf.ln(5)
                
        output_file = 'relatorio_evidencias.pdf'
        pdf.output(output_file)
        print(f"[RELATORIO] Relatório de Evidências gerado: {output_file}")
        
    except Exception as e:
        print(f"[ERRO] Falha ao gerar Relatório de Evidências: {e}")

def generate_bug_report(context):
    """Gera o Relatório de Bugs (Apenas Falhas)"""
    try:
        has_failures = False
        for feature in context.pdf_data['features']:
            for scenario in feature['scenarios']:
                if scenario['status'] == 'failed':
                    has_failures = True
                    break
            if has_failures: break
        
        if not has_failures:
            print("[RELATORIO] Nenhum bug encontrado para gerar relatório de bugs.")
            return

        pdf = PDFReport()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        # Cabeçalho Vermelho
        pdf.set_fill_color(220, 53, 69)
        pdf.rect(0, 0, 210, 40, 'F')
        
        pdf.set_y(10)
        pdf.set_font('Arial', 'B', 20)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(0, 10, 'Relatório de Bugs', 0, 1, 'C')
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 10, f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", 0, 1, 'C')
        pdf.ln(20)
        
        pdf.set_text_color(0, 0, 0)
        
        count = 1
        for feature in context.pdf_data['features']:
            for scenario in feature['scenarios']:
                if scenario['status'] == 'failed':
                    # START - KEEP TOGETHER LOGIC
                    # Estima altura do bloco de bug (Titulo + Passo + Erro + Imagem) -> Aprox 130
                    if pdf.get_y() + 130 > pdf.h - 15:
                        pdf.add_page()
                    # END - KEEP TOGETHER LOGIC

                    # Título do Defeito
                    pdf.set_font('Arial', 'B', 14)
                    pdf.set_fill_color(248, 215, 218) # Rosa claro
                    pdf.set_text_color(114, 28, 36) # Vermelho escuro
                    pdf.cell(0, 10, f"#{count} - Falha em: {scenario['name']}", 0, 1, 'L', 1)
                    pdf.ln(2)
                    
                    pdf.set_text_color(0, 0, 0)
                    pdf.set_font('Arial', '', 11)
                    pdf.multi_cell(0, 6, f"Funcionalidade: {feature['name']}")
                    pdf.ln(2)
                    
                    # Passo que falhou
                    failed_step = next((s for s in scenario['steps'] if s['status'] == 'failed'), None)
                    if failed_step:
                        pdf.set_font('Arial', 'B', 11)
                        pdf.cell(0, 6, "Passo com Falha:", 0, 1)
                        pdf.set_font('Arial', '', 11)
                        pdf.set_text_color(220, 53, 69)
                        step_text = f"{failed_step.get('keyword', '')} {failed_step['name']}"
                        pdf.multi_cell(0, 6, step_text)
                        
                        # Mensagem de Erro
                        if 'error_message' in failed_step and failed_step['error_message']:
                            pdf.ln(2)
                            pdf.set_font('Arial', 'B', 10)
                            pdf.set_text_color(0, 0, 0)
                            pdf.cell(0, 6, "Mensagem de Erro:", 0, 1)
                            
                            pdf.set_font('Courier', '', 9)
                            pdf.set_fill_color(240, 240, 240)
                            pdf.set_text_color(100, 0, 0)
                            pdf.multi_cell(0, 5, failed_step['error_message'], 1, 'L', 1)
                        
                        # Screenshot
                        if 'screenshot' in failed_step and os.path.exists(failed_step['screenshot']):
                            try:
                                pdf.ln(5)
                                pdf.set_font('Arial', 'B', 10)
                                pdf.set_text_color(0, 0, 0)
                                pdf.cell(0, 6, "Evidência do Erro:", 0, 1)
                                
                                img_w = 140
                                x_pos = (pdf.w - img_w) / 2
                                
                                # (Check removido/redundante)
                                
                                pdf.image(failed_step['screenshot'], x=x_pos, w=img_w)
                                pdf.ln(5)
                            except:
                                pass
                    
                    pdf.ln(5)
                    pdf.set_draw_color(220, 53, 69)
                    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
                    pdf.ln(10)
                    count += 1
        
        output_file = 'relatorio_bugs.pdf'
        pdf.output(output_file)
        print(f"[RELATORIO] Relatório de Bugs gerado: {output_file}")
        
    except Exception as e:
        print(f"[ERRO] Falha ao gerar Relatório de Bugs: {e}")
`;
    }

    generateRequirementsContent() {
        return `# Dependências Python para testes BDD
# Instale com: pip install -r requirements.txt

selenium==4.15.2
behave==1.2.6
behave-html-formatter==0.9.10
fpdf2==2.7.4
webdriver-manager==4.0.1
parse==1.19.1
parse-type==0.6.2
six==1.16.0
`;
    }

    generateBehaveIniContent() {
        return `[behave]
show_skipped = false
show_timings = true
stdout_capture = false
stderr_capture = false
log_capture = false
color = true
lang = pt
`;
    }

    generateProjectFiles() {
        const files = [];

        // Environment.py (dentro de features para padrão behave)
        files.push({
            name: `features/environment.py`,
            content: this.generateEnvironmentContent()
        });

        // Base Page (Nova estrutura DRY)
        files.push({
            name: `features/pages/base_page.py`,
            content: this.generateBasePageContent()
        });

        // Requirements.txt (raiz do projeto)
        files.push({
            name: `requirements.txt`,
            content: this.generateRequirementsContent()
        });

        files.push({
            name: `improve_report.py`,
            content: this.generateImproveReportScript()
        });

        // README.md
        files.push({
            name: `README.md`,
            content: this.generateReadmeContent()
        });

        // Arquivos de Configuração e Scripts (QA/DevOps)
        files.push({
            name: `.gitignore`,
            content: this.generateGitignoreContent()
        });

        files.push({
            name: `behave.ini`,
            content: this.generateBehaveIniContent()
        });

        files.push({
            name: `run_tests.bat`,
            content: this.generateRunBatContent()
        });

        files.push({
            name: `run_tests.sh`,
            content: this.generateRunShContent()
        });



        // __init__.py files para compatibilidade de pacotes
        // features/__init__.py
        files.push({
            name: `features/__init__.py`,
            content: ''
        });

        // features/steps/__init__.py
        files.push({
            name: `steps/__init__.py`,
            content: ''
        });

        // features/pages/__init__.py
        files.push({
            name: `pages/__init__.py`,
            content: ''
        });

        return files;
    }

    generateImproveReportScript() {
        return `
import os
import sys

def improve_report():
    report_file = 'behave-report.html'
    if not os.path.exists(report_file):
        print("Relatorio nao encontrado.")
        return

    try:
        with open(report_file, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except Exception as e:
        print(f"Erro ao ler relatorio: {e}")
        return

    # Script para funcionalidade de Acordeon (Expandir/Recolher)
    js_script = """
    <script>
    document.addEventListener("DOMContentLoaded", function() {
        // Seleciona todos os cenarios
        var scenarios = document.querySelectorAll("div.scenario");

        scenarios.forEach(function(scenario) {
            // Encontra o titulo/header do cenario
            var header = scenario.querySelector("span.scenario_name");
            // Encontra a lista de passos (ol)
            var steps = scenario.querySelector("ol");

            if (header && steps) {
                // Estilo visual de clique
                header.style.cursor = "pointer";
                header.style.display = "block";
                header.style.padding = "5px";
                header.style.backgroundColor = "#f0f0f0";
                header.style.border = "1px solid #ddd";
                header.style.marginBottom = "5px";
                
                // Adiciona icone visual
                var icon = document.createElement("span");
                icon.innerHTML = " \u25B6 "; // Seta para direita
                icon.style.marginRight = "10px";
                header.insertBefore(icon, header.firstChild);

                // Estado inicial: Recolhido (exceto se tiver falha)
                // Se o cenario tem classe 'failed', mantem aberto
                if (scenario.classList.contains("failed")) {
                    steps.style.display = "block";
                    icon.innerHTML = " \u25BC "; // Seta para baixo
                } else {
                    steps.style.display = "none";
                }

                // Evento de Clique
                header.addEventListener("click", function() {
                    if (steps.style.display === "none") {
                        steps.style.display = "block";
                        icon.innerHTML = " \u25BC ";
                    } else {
                        steps.style.display = "none";
                        icon.innerHTML = " \u25B6 ";
                    }
                });
            }
        });
    });
    </script>
    """
    
    # Injeta o script antes do fim do body
    if '</body>' in content:
        content = content.replace('</body>', js_script + '</body>')
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(content)
            print("Funcionalidade de expandir/recolher aplicada com sucesso!")

if __name__ == "__main__":
    improve_report()
`;
    }

    generateRunBatContent() {
        return `@echo off
chcp 65001 > nul
echo ===================================================
echo      Execucao Automatica de Testes BDD
echo ===================================================
echo.

if not exist "venv" (
    echo [INFO] Criando ambiente virtual...
    python -m venv venv
)

echo [INFO] Ativando ambiente virtual...
call venv\\Scripts\\activate

echo [INFO] Instalando dependencias...
pip install -r requirements.txt > nul

echo.
echo [INFO] Configurando ambiente...
REM Defina HEADLESS=true para rodar sem interface
set "HEADLESS=false"
REM Defina a URL base se necessario
REM set "BASE_URL=http://seusite.com"

echo [INFO] Executando testes...
REM Executa behave com dois formatters:
REM 1. HTMLFormatter -> behave-report.html
REM 2. Pretty -> Console (stdout)
behave -f behave_html_formatter:HTMLFormatter -o behave-report.html -f pretty

echo.
echo [INFO] Melhorando relatorio HTML...
python improve_report.py

echo.
echo [INFO] Gerando relatorios...
if exist "behave-report.html" (
    echo [OK] Relatorio HTML gerado em behave-report.html
    start behave-report.html
)
if exist "relatorio_gerencial.pdf" (
    echo [OK] Relatorio Gerencial PDF gerado em relatorio_gerencial.pdf
    start relatorio_gerencial.pdf
)
if exist "relatorio_evidencias.pdf" (
    echo [OK] Relatorio Evidencias PDF gerado em relatorio_evidencias.pdf
    start relatorio_evidencias.pdf
)
if exist "relatorio_bugs.pdf" (
    echo [OK] Relatorio Bugs PDF gerado em relatorio_bugs.pdf
    start relatorio_bugs.pdf
)


echo.
echo ===================================================
echo      Teste Finalizado
echo ===================================================
pause
`;
    }

    generateRunShContent() {
        return `#!/bin/bash
echo "==================================================="
echo "     Execucao Automatica de Testes BDD"
echo "==================================================="
echo ""

if [ ! -d "venv" ]; then
    echo "[INFO] Criando ambiente virtual..."
    python3 -m venv venv
fi

echo "[INFO] Ativando ambiente virtual..."
source venv/bin/activate

echo "[INFO] Instalando dependencias..."
pip install -r requirements.txt > /dev/null

echo ""
echo "[INFO] Executando testes..."
# Executa behave com dois formatters: HTML e Pretty (Console)
# HEADLESS=true behave -f behave_html_formatter:HTMLFormatter -o behave-report.html -f pretty
behave -f behave_html_formatter:HTMLFormatter -o behave-report.html -f pretty

echo ""
echo "[INFO] Melhorando relatorio HTML..."
python3 improve_report.py

echo ""
if [ -f "behave-report.html" ]; then
    echo "[OK] Relatorio HTML gerado em behave-report.html"
fi
if [ -f "relatorio_gerencial.pdf" ]; then
    echo "[OK] Relatorio Gerencial PDF gerado em relatorio_gerencial.pdf"
fi
if [ -f "relatorio_evidencias.pdf" ]; then
    echo "[OK] Relatorio Evidencias PDF gerado em relatorio_evidencias.pdf"
fi
if [ -f "relatorio_bugs.pdf" ]; then
    echo "[OK] Relatorio Bugs PDF gerado em relatorio_bugs.pdf"
fi

echo "==================================================="
echo "     Teste Finalizado"
echo "==================================================="
`;
    }

    normalizeFeatures(features) {
        // Mapa global de nomes canônicos: lowercase -> original (primeiro encontrado)
        const canonicalNames = new Map();

        features.forEach(feature => {
            (feature.scenarios || []).forEach(scenario => {
                (scenario.interactions || []).forEach(interaction => {
                    if (interaction.nomeElemento) {
                        const originalName = interaction.nomeElemento;
                        const lowerName = originalName.toLowerCase();

                        if (canonicalNames.has(lowerName)) {
                            // Se já existe uma versão desse nome, usa ela
                            const canonical = canonicalNames.get(lowerName);
                            if (originalName !== canonical) {
                                // Atualiza para o nome canônico
                                interaction.nomeElemento = canonical;
                            }
                        } else {
                            // Registra este como o canônico
                            canonicalNames.set(lowerName, originalName);
                        }
                    }
                });
            });
        });
    }

    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '')
            .replace(/\-+/g, '_')
            .substring(0, 50);
    }

    toPascalCase(text) {
        return text
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }

    toSnakeCase(text) {
        // Conversão inteligente para snake_case:
        // 1. "camelCase" -> "camel_case"
        // 2. "PascalCase" -> "pascal_case"
        // 3. "UPPER_CASE" -> "upper_case" (mantém)
        // 4. "Space separated" -> "space_separated"
        // 5. "AcronymHTML" -> "acronym_html"

        return text
            // Inserir _ entre letras minúsculas e maiúsculas (ex: camelCase -> camel_Case)
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            // Inserir _ entre letras e números (ex: user1 -> user_1)
            .replace(/([a-zA-Z])(\d)/g, '$1_$2')
            // Substituir espaços e hifens por _
            .replace(/[\s\-]+/g, '_')
            // Converter tudo para minúsculo
            .toLowerCase()
            // Remover _ duplicados ou nas pontas
            .replace(/_{2,}/g, '_')
            .replace(/^_|_$/g, '');
    }

    formatInteractionText(interaction) {
        // ... (implementation if needed, but seems formatInteractionText is already there above?)
        // Wait, looking at the previous file view, formatInteractionText WAS there.
        // But slugify, toPascalCase, toSnakeCase were NOT visible in the view_file output of lines 1450-1950.
        // The view started at generateBehaveIniContent.
        // Let's check where they usually are. They were likely at the end.
        // I will add them back.

        const action = interaction.acao || 'ação';
        const element = interaction.nomeElemento || 'elemento';
        const value = interaction.valorPreenchido || '';

        let text = '';
        switch (action) {
            case 'clica':
                text = `clica no ${element} `;
                break;
            case 'preenche':
                text = `preenche ${element} com "${value}"`;
                break;
            case 'seleciona':
                text = `seleciona "${value}" em ${element} `;
                break;
            case 'acessa_url':
                text = `acessa a URL "${value || element}"`;
                break;
            default:
                text = `executa ação "${action}" em ${element} `;
        }
        return text;
    }

    sanitizeMethodName(name) {
        return name
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_|_$/g, '');
    }

    generateValidLocatorName(elementName) {
        return this.toSnakeCase(this.sanitizeMethodName(elementName)).toUpperCase();
    }

}

// Export da instância singleton
export const exportManager = new ExportManager();
