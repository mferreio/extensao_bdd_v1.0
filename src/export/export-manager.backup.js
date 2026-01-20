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
        this.createModal();
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

        // Environment.py (raiz do projeto) - gerado uma única vez
        files.push({
            name: `environment.py`,
            content: this.generateEnvironmentContent()
        });

        // Requirements.txt (raiz do projeto) - gerado uma única vez
        files.push({
            name: `requirements.txt`,
            content: this.generateRequirementsContent()
        });
        
        // README.md com instruções completas
        files.push({
            name: `README.md`,
            content: this.generateReadmeContent()
        });

        return files;
    }
    
    generateReadmeContent() {
        return `# Projeto de Testes Automatizados BDD

Testes automatizados gerados pela extensão **Gerador de Testes Automatizados em Python**.

## 📋 Pré-requisitos

- Python 3.8 ou superior
- Google Chrome instalado
- ChromeDriver compatível com a versão do Chrome

## 🚀 Instalação

### 1. Criar ambiente virtual (recomendado)

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

## 🎯 Executar Testes

### Executar todos os testes

\`\`\`bash
behave
\`\`\`

### Executar feature específica

\`\`\`bash
behave features/nome_da_feature.feature
\`\`\`

### Executar com relatório detalhado

\`\`\`bash
behave --format=pretty --no-capture
\`\`\`

### Executar tags específicas

\`\`\`bash
behave --tags=@smoke
behave --tags=@regression
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
projeto/
│
├── features/               # Arquivos .feature (Gherkin)
│   ├── steps/             # Step definitions Python
│   └── pages/             # Page Objects
│
├── screenshots/           # Screenshots de falhas (gerado automaticamente)
├── environment.py         # Configuração Behave
├── requirements.txt       # Dependências Python
└── README.md             # Este arquivo
\`\`\`

## ⚙️ Configuração

### Alterar URL base

Edite o arquivo \`environment.py\` ou defina a variável de ambiente:

\`\`\`bash
# Windows
set BASE_URL=https://meusite.com

# Linux/Mac
export BASE_URL=https://meusite.com
\`\`\`

### Modo headless (sem interface gráfica)

No arquivo \`environment.py\`, descomente a linha:

\`\`\`python
chrome_options.add_argument("--headless")
\`\`\`

## 📸 Screenshots

Quando um teste falha, um screenshot é automaticamente salvo em \`screenshots/\` com o nome do cenário.

## 🐛 Troubleshooting

### Erro: ChromeDriver not found

**Solução**: Instale o ChromeDriver compatível com seu Chrome:

\`\`\`bash
# Via webdriver-manager (recomendado)
pip install webdriver-manager

# Ou baixe manualmente de:
# https://chromedriver.chromium.org/
\`\`\`

### Erro: ModuleNotFoundError

**Solução**: Verifique se o ambiente virtual está ativado e as dependências foram instaladas:

\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Erro: Element not found

**Solução**: 
- Verifique se o seletor CSS/XPath está correto no arquivo \`*_page.py\`
- Aumente o tempo de espera no \`WebDriverWait\`
- Confirme que a página está carregada corretamente

## 📖 Documentação Adicional

- [Behave Documentation](https://behave.readthedocs.io/)
- [Selenium Python Docs](https://selenium-python.readthedocs.io/)
- [Page Object Pattern](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)

## 🤝 Suporte

Em caso de problemas:
1. Verifique os logs de execução
2. Consulte os screenshots de falhas
3. Revise os seletores dos elementos nas páginas

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

    generateGherkinContent(feature) {
        let content = `# language: pt\n`;
        content += `Funcionalidade: ${feature.name}\n\n`;

        (feature.scenarios || []).forEach(scenario => {
            content += `  Cenário: ${scenario.name}\n`;
            (scenario.interactions || []).forEach(interaction => {
                const step = interaction.step || 'Dado';
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
        
        switch(interaction.acao) {
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
            case 'executa_acao':
                return `executa ação "${element}" em ${interaction.acao.replace('executa_acao_', '')}`;
            default:
                if (interaction.acao && interaction.acao.startsWith('valida_')) {
                    return `valido ${interaction.acao.replace('valida_', '')} em ${element}`;
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
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
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
                if (interaction.nomeElemento && !elementsMap.has(interaction.nomeElemento)) {
                    let seletor = interaction.seletor || interaction.xpath || '';
                    let tipoSeletor = 'CSS_SELECTOR';
                    
                    if (interaction.xpath && !interaction.seletor) {
                        seletor = interaction.xpath;
                        tipoSeletor = 'XPATH';
                    } else if (!seletor && interaction.nomeElemento) {
                        seletor = `[name="${interaction.nomeElemento}"]`;
                    }
                    
                    elementsMap.set(interaction.nomeElemento, {
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
                const selector = data.seletor.replace(/"/g, '\\"').replace(/\n/g, ' ');
                content += `    ${locatorName} = (By.${data.tipo}, "${selector}")\n`;
            });
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
            raise TimeoutException(f"Elemento não clicável: {locator}")
    
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
                element.clear()
            element.send_keys(text)
            return self
        except TimeoutException:
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
        from selenium.webdriver.support.ui import Select
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
            
            content += `    def clicar_${methodBaseName}(self):\n`;
            content += `        """\n`;
            content += `        Clica em ${element}\n`;
            content += `        \n`;
            content += `        Returns:\n`;
            content += `            self para method chaining\n`;
            content += `        """\n`;
            content += `        return self._click_element(self.locators.${locatorName})\n`;
            content += `    \n`;
            
            content += `    def obter_texto_${methodBaseName}(self):\n`;
            content += `        """\n`;
            content += `        Obtém o texto de ${element}\n`;
            content += `        \n`;
            content += `        Returns:\n`;
            content += `            str: Texto do elemento\n`;
            content += `        """\n`;
            content += `        element = self._find_element(self.locators.${locatorName})\n`;
            content += `        return element.text\n`;
            content += `    \n`;
            
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
            key.toLowerCase().includes('user')
        );
        const hasPassword = Array.from(elementsMap.keys()).some(key => 
            key.toLowerCase().includes('senha') || 
            key.toLowerCase().includes('password')
        );
        const hasSubmit = Array.from(elementsMap.keys()).some(key => 
            key.toLowerCase().includes('entrar') || 
            key.toLowerCase().includes('login') || 
            key.toLowerCase().includes('submit')
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
                key.toLowerCase().includes('user')
            );
            const passwordField = Array.from(elementsMap.keys()).find(key => 
                key.toLowerCase().includes('senha') || 
                key.toLowerCase().includes('password')
            );
            const submitButton = Array.from(elementsMap.keys()).find(key => 
                key.toLowerCase().includes('entrar') || 
                key.toLowerCase().includes('login') || 
                key.toLowerCase().includes('submit')
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
Gerado automaticamente - NÃO editar manualmente

Este arquivo contém as definições de steps para o Behave seguindo o padrão Page Object Model.
Todos os steps devem ter docstrings explicando seu propósito e argumentos.
"""

from behave import given, when, then
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException
from features.pages.${featureName}_page import ${className}Page, ${className}Locators
import time

# =====================================================================================
#                           GIVEN STEPS - CONFIGURAÇÃO INICIAL
# =====================================================================================

@given('que estou na página de ${feature.name}')
def step_abrir_pagina(context):
    """
    Abre a página da feature e aguarda o carregamento.
    
    Inicializa o Page Object e verifica se a página carregou corretamente.
    """
    try:
        context.page = ${className}Page(context.browser)
        context.page.wait = WebDriverWait(context.browser, 10)
        context.browser.get(context.base_url)
        context.page.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    except TimeoutException:
        raise AssertionError(f"Página de ${feature.name} não carregou no tempo limite")
    except Exception as e:
        raise AssertionError(f"Erro ao abrir página: {str(e)}")

# =====================================================================================
#                           WHEN STEPS - AÇÕES DO USUÁRIO
# =====================================================================================

@when('clica no botão')
def step_clicar_botao(context):
    """Clica em um botão."""
    try:
        button = context.page.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button")))
        button.click()
    except TimeoutException:
        raise AssertionError("Botão não ficou clicável no tempo limite")
    except Exception as e:
        raise AssertionError(f"Erro ao clicar: {str(e)}")

# =====================================================================================
#                           THEN STEPS - VALIDAÇÕES
# =====================================================================================

@then('vejo a página carregada')
def step_pagina_carregada(context):
    """Verifica se a página carregou corretamente."""
    try:
        context.page.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    except TimeoutException:
        raise AssertionError("Página não carregou no tempo limite")
`;

        return content;
        (feature.scenarios || []).forEach(scenario => {
            (scenario.interactions || []).forEach(interaction => {
                if (interaction.acao && interaction.nomeElemento) {
                    interactions.push(interaction);
                }
            });
        });

        // Given steps
        content += `@given('que estou na página de ${feature.name}')
@given('que acesso a página de ${feature.name}')
def step_abrir_pagina_${this.toSnakeCase(feature.name)}(context):
    """
    Abre a página de ${feature.name} e aguarda o carregamento.
    
    Inicializa o Page Object para a feature e verifica se a página carregou corretamente.
    
    Raises:
        AssertionError: Se a página não carregar no tempo limite
    """
    try:
        context.page = ${className}Page(context.browser)
        context.page.wait = WebDriverWait(context.browser, 10)
        context.browser.get(context.base_url)
        context.page.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    except TimeoutException:
        raise AssertionError(f"Página de ${feature.name} não carregou no tempo limite")
    except Exception as e:
        raise AssertionError(f"Erro ao abrir página de ${feature.name}: {str(e)}")

@given('abro a aplicação')
@given('acesso a aplicação')
def step_abrir_aplicacao(context):
    """
    Abre a aplicação e inicializa o Page Object.
    
    Raises:
        AssertionError: Se a aplicação não carregar
    """
    try:
        context.page = ${className}Page(context.browser)
        context.page.wait = WebDriverWait(context.browser, 10)
        context.browser.get(context.base_url)
    except Exception as e:
        raise AssertionError(f"Erro ao abrir a aplicação: {str(e)}")

`;

        // Given para acessar URL específica
        const urlInteractions = interactions.filter(i => i.acao === 'acessa_url');
        if (urlInteractions.length > 0) {
            urlInteractions.forEach(interaction => {
                const url = interaction.valorPreenchido || interaction.url || interaction.nomeElemento || '';
                if (url) {
                    const methodSafeName = this.toSnakeCase(url.replace(/[^a-zA-Z0-9]/g, '_'));
                    content += `@given('acessa a URL "${url}"')
@given('acesso a URL "${url}"')
@when('acessa a URL "${url}"')
def step_acessar_url_${methodSafeName}(context):
    """
    Navega para a URL especificada.
    
    Args:
        context: Contexto do Behave contendo a instância do navegador
        
    Raises:
        AssertionError: Se a URL não carregar ou não conseguir navegarkl
    """
    try:
        context.browser.get("${url}")
        context.page = ${className}Page(context.browser)
        context.page.wait = WebDriverWait(context.browser, 10)
    except TimeoutException:
        raise AssertionError(f"Timeout ao acessar a URL: ${url}")
    except Exception as e:
        raise AssertionError(f"Erro ao acessar URL ${url}: {str(e)}")

`;

        // When steps - baseado nas interações reais
        content += `
# =====================================================================================
#                           WHEN STEPS - AÇÕES DO USUÁRIO
# =====================================================================================

`;

        const uniqueActions = new Map();
        interactions.forEach(interaction => {
            const key = `${interaction.acao}_${interaction.nomeElemento}`;
            if (!uniqueActions.has(key)) {
                uniqueActions.set(key, interaction);
            }
        });

        uniqueActions.forEach((interaction) => {
            const element = interaction.nomeElemento;
            const methodName = this.toSnakeCase(element);
            
            if (interaction.acao === 'clica') {
                content += `@when('clica no ${element}')
@when('clico no ${element}')
@when('clico em "${element}"')
def step_clicar_${methodName}(context):
    """
    Clica no elemento "${element}".
    
    O elemento será aguardado até estar clicável antes da ação.
    
    Raises:
        AssertionError: Se o elemento não ficar clicável ou se houver erro ao clicar
    """
    try:
        context.page.clicar_${methodName}()
    except TimeoutException:
        raise AssertionError(f"Elemento '${element}' não ficou clicável no tempo limite")
    except StaleElementReferenceException:
        raise AssertionError(f"Elemento '${element}' tornou-se obsoleto durante a ação")
    except Exception as e:
        raise AssertionError(f"Erro ao clicar em '${element}': {str(e)}")

`;
            } else if (interaction.acao === 'preenche') {
                content += `@when('preenche ${element} com "{texto}"')
@when('preencho ${element} com "{texto}"')
@when('preencho o campo ${element} com "{texto}"')
def step_preencher_${methodName}(context, texto):
    """
    Preenche o campo "${element}" com o texto especificado.
    
    Args:
        context: Contexto do Behave
        texto (str): Valor a ser inserido no campo
        
    Raises:
        AssertionError: Se o campo não estiver pronto ou se houver erro ao digitar
    """
    try:
        context.page.preencher_${methodName}(texto)
    except TimeoutException:
        raise AssertionError(f"Campo '${element}' não ficou visível no tempo limite")
    except Exception as e:
        raise AssertionError(f"Erro ao preencher '${element}' com '{texto}': {str(e)}")

`;
            } else if (interaction.acao === 'seleciona') {
                content += `@when('seleciona "{valor}" em ${element}')
@when('seleciono "{valor}" em ${element}')
@when('seleciono a opção "{valor}" em ${element}')
def step_selecionar_${methodName}(context, valor):
    """
    Seleciona uma opção por texto visível em um dropdown/select.
    
    Args:
        context: Contexto do Behave
        valor (str): Texto visível da opção a selecionar
        
    Raises:
        AssertionError: Se o select não existir ou a opção não for encontrada
    """
    try:
        elemento = context.page.wait.until(
            EC.presence_of_element_located(context.page.locators.${this.toSnakeCase(element).toUpperCase()})
        )
        select = Select(elemento)
        select.select_by_visible_text(valor)
    except TimeoutException:
        raise AssertionError(f"Select '${element}' não encontrado no tempo limite")
    except Exception as e:
        raise AssertionError(f"Erro ao selecionar '{valor}' em '${element}': {str(e)}")

`;
            } else if (interaction.acao === 'marca_checkbox' || interaction.acao === 'desmarca_checkbox') {
                const acao_texto = interaction.acao === 'marca_checkbox' ? 'marco' : 'desmarco';
                const estado = interaction.acao === 'marca_checkbox' ? 'marcado' : 'desmarcado';
                content += `@when('${acao_texto} o checkbox ${element}')
@when('${acao_texto} o checkbox de "${element}"')
def step_${interaction.acao}_${methodName}(context):
    """
    ${interaction.acao === 'marca_checkbox' ? 'Marca' : 'Desmarca'} o checkbox "${element}".
    
    A ação será executada apenas se o estado atual não corresponder ao estado esperado.
    
    Raises:
        AssertionError: Se o checkbox não ficar clicável ou não conseguir marcar/desmarcar
    """
    try:
        elemento = context.page.wait.until(
            EC.element_to_be_clickable(context.page.locators.${this.toSnakeCase(element).toUpperCase()})
        )
        estado_esperado = ${interaction.acao === 'marca_checkbox' ? 'True' : 'False'}
        if elemento.is_selected() != estado_esperado:
            elemento.click()
    except TimeoutException:
        raise AssertionError(f"Checkbox '${element}' não ficou clicável no tempo limite")
    except Exception as e:
        raise AssertionError(f"Erro ao ${interaction.acao === 'marca_checkbox' ? 'marcar' : 'desmarcar'} checkbox '${element}': {str(e)}")

`;
            } else if (interaction.acao === 'seleciona_radio') {
                content += `@when('seleciono o radio ${element}')
@when('seleciono o radio button "${element}"')
def step_selecionar_radio_${methodName}(context):
    """
    Seleciona o radio button "${element}".
    
    A ação será executada apenas se o radio não estiver já selecionado.
    
    Raises:
        AssertionError: Se o radio button não ficar clicável ou não conseguir selecionar
    """
    try:
        elemento = context.page.wait.until(
            EC.element_to_be_clickable(context.page.locators.${this.toSnakeCase(element).toUpperCase()})
        )
        if not elemento.is_selected():
            elemento.click()
    except TimeoutException:
        raise AssertionError(f"Radio button '${element}' não ficou clicável no tempo limite")
    except Exception as e:
        raise AssertionError(f"Erro ao selecionar radio button '${element}': {str(e)}")

`;
            } else if (interaction.acao === 'upload') {
                content += `@when('faço upload do arquivo "{caminho}"')
@when('faco upload do arquivo "{caminho}"')
@when('envio o arquivo "{caminho}"')
def step_upload_arquivo_${methodName}(context, caminho):
    """
    Realiza upload de um arquivo para o campo de input de arquivo.
    
    Args:
        context: Contexto do Behave
        caminho (str): Caminho relativo ou absoluto do arquivo a enviar
        
    Raises:
        AssertionError: Se o arquivo não existir ou o campo não for encontrado
    """
    try:
        import os
        elemento = context.page.wait.until(
            EC.presence_of_element_located(context.page.locators.${this.toSnakeCase(element).toUpperCase()})
        )
        caminho_absoluto = os.path.abspath(caminho)
        if not os.path.exists(caminho_absoluto):
            raise FileNotFoundError(f"Arquivo não encontrado: {caminho_absoluto}")
        elemento.send_keys(caminho_absoluto)
    except TimeoutException:
        raise AssertionError(f"Campo de upload '${element}' não encontrado no tempo limite")
    except FileNotFoundError as e:
        raise AssertionError(str(e))
    except Exception as e:
        raise AssertionError(f"Erro ao fazer upload do arquivo '{caminho}': {str(e)}")

`;
            } else if (interaction.acao === 'pressiona_enter') {
                content += `@when('pressiono Enter em ${element}')
@when('pressiona Enter em ${element}')
@when('confirmo pressionando Enter em "${element}"')
def step_pressionar_enter_${methodName}(context):
    """
    Pressiona a tecla Enter no elemento "${element}".
    
    Útil para confirmar ações em campos de busca ou formulários.
    
    Raises:
        AssertionError: Se o elemento não ficar visível ou não conseguir pressionar Enter
    """
    try:
        elemento = context.page.wait.until(
            EC.presence_of_element_located(context.page.locators.${this.toSnakeCase(element).toUpperCase()})
        )
        elemento.send_keys(Keys.ENTER)
    except TimeoutException:
        raise AssertionError(f"Elemento '${element}' não ficou visível no tempo limite")
    except Exception as e:
        raise AssertionError(f"Erro ao pressionar Enter em '${element}': {str(e)}")

`;
            } else if (interaction.acao === 'executa_acao') {
                const acao = interaction.valorPreenchido || interaction.nomeElemento;
                content += `@when('executa ação "${acao}" em ${element}')
@when('executo a ação "${acao}"')
def step_executar_acao_${methodName}(context):
    """
    Executa uma ação customizada no elemento "${element}".
    
    Ação: ${acao}
    
    Raises:
        AssertionError: Se o elemento não for encontrado ou a ação falhar
    """
    try:
        context.page.clicar_${methodName}()
    except Exception as e:
        raise AssertionError(f"Erro ao executar ação '${acao}' em '${element}': {str(e)}")

`;
            }
        });

        // Then steps - validações gerais
        content += `
# =====================================================================================
#                           THEN STEPS - VALIDAÇÕES E VERIFICAÇÕES
# =====================================================================================

@then('devo ver o elemento {elemento}')
@then('devo ver {elemento}')
@then('deveria ver {elemento}')
def step_verificar_elemento_visivel(context, elemento):
    """
    Verifica se o elemento está visível na página.
    
    Args:
        context: Contexto do Behave
        elemento (str): Seletor CSS do elemento a verificar
        
    Raises:
        AssertionError: Se o elemento não fica visível no tempo limite
    """
    try:
        elemento_presente = context.page.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, elemento))
        )
        assert elemento_presente is not None, f"Elemento '{elemento}' não está visível"
    except TimeoutException:
        raise AssertionError(f"Elemento '{elemento}' não ficou visível no tempo limite (10 segundos)")
    except Exception as e:
        raise AssertionError(f"Erro ao verificar visibilidade do elemento '{elemento}': {str(e)}")


@then('não devo ver o elemento {elemento}')
@then('não devo ver {elemento}')
def step_verificar_elemento_nao_visivel(context, elemento):
    """
    Verifica se o elemento NÃO está visível na página.
    
    Args:
        context: Contexto do Behave
        elemento (str): Seletor CSS do elemento a verificar
        
    Raises:
        AssertionError: Se o elemento estiver visível
    """
    try:
        elementos = context.browser.find_elements(By.CSS_SELECTOR, elemento)
        visibles = [el for el in elementos if el.is_displayed()]
        assert len(visibles) == 0, f"Elemento '{elemento}' está visível mas não deveria estar"
    except Exception as e:
        raise AssertionError(f"Erro ao verificar elemento oculto '{elemento}': {str(e)}")


@then('o título da página deve ser "{titulo_esperado}"')
@then('o título da página contém "{titulo_esperado}"')
def step_verificar_titulo_pagina(context, titulo_esperado):
    """
    Verifica se o título da página contém o texto esperado.
    
    Args:
        context: Contexto do Behave
        titulo_esperado (str): Texto esperado no título da página
        
    Raises:
        AssertionError: Se o título não contiver o texto esperado
    """
    titulo_atual = context.browser.title
    assert titulo_esperado.lower() in titulo_atual.lower(), \\
        f"Título esperado: '{titulo_esperado}', obtido: '{titulo_atual}'"


@then('devo estar na página "{url_esperada}"')
@then('a URL deve conter "{url_esperada}"')
def step_verificar_url(context, url_esperada):
    """
    Verifica se a URL atual contém o texto esperado.
    
    Args:
        context: Contexto do Behave
        url_esperada (str): Texto esperado na URL
        
    Raises:
        AssertionError: Se a URL não contiver o texto esperado
    """
    try:
        context.page.wait.until(EC.url_contains(url_esperada))
        url_atual = context.browser.current_url
        assert url_esperada in url_atual, \\
            f"URL esperada: '{url_esperada}', obtida: '{url_atual}'"
    except TimeoutException:
        raise AssertionError(f"URL não mudou para '{url_esperada}'. URL atual: {context.browser.current_url}")


@then('o texto "{texto_esperado}" deve estar visível')
@then('devo ver o texto "{texto_esperado}"')
def step_verificar_texto_na_pagina(context, texto_esperado):
    """
    Verifica se o texto esperado está visível em algum lugar da página.
    
    Args:
        context: Contexto do Behave
        texto_esperado (str): Texto a procurar na página
        
    Raises:
        AssertionError: Se o texto não for encontrado
    """
    try:
        texto_pagina = context.browser.find_element(By.TAG_NAME, "body").text
        assert texto_esperado in texto_pagina, \\
            f"Texto '{texto_esperado}' não encontrado na página"
    except Exception as e:
        raise AssertionError(f"Erro ao procurar texto '{texto_esperado}': {str(e)}")


@then('o elemento {elemento} deve conter o texto "{texto_esperado}"')
@then('o texto de {elemento} deve conter "{texto_esperado}"')
def step_verificar_texto_do_elemento(context, elemento, texto_esperado):
    """
    Verifica se um elemento específico contém o texto esperado.
    
    Args:
        context: Contexto do Behave
        elemento (str): Seletor CSS do elemento
        texto_esperado (str): Texto que deve estar contido no elemento
        
    Raises:
        AssertionError: Se o texto não for encontrado no elemento
    """
    try:
        elemento_web = context.browser.find_element(By.CSS_SELECTOR, elemento)
        texto_atual = elemento_web.text
        assert texto_esperado in texto_atual, \\
            f"Esperado '{texto_esperado}' em '{texto_atual}'"
    except TimeoutException:
        raise AssertionError(f"Elemento '{elemento}' não encontrado no tempo limite")
    except Exception as e:
        raise AssertionError(f"Erro ao verificar texto do elemento '{elemento}': {str(e)}")


@then('o campo {elemento} deve estar preenchido')
@then('o campo {elemento} não deve estar vazio')
def step_verificar_campo_preenchido(context, elemento):
    """
    Verifica se um campo de input está preenchido (contém algum valor).
    
    Args:
        context: Contexto do Behave
        elemento (str): Seletor CSS do campo input
        
    Raises:
        AssertionError: Se o campo estiver vazio
    """
    try:
        campo = context.browser.find_element(By.CSS_SELECTOR, elemento)
        valor = campo.get_attribute("value")
        assert valor and len(valor) > 0, f"Campo '{elemento}' está vazio"
    except Exception as e:
        raise AssertionError(f"Erro ao verificar preenchimento do campo '{elemento}': {str(e)}")


@then('o campo {elemento} deve estar vazio')
@then('o campo {elemento} não deve estar preenchido')
def step_verificar_campo_vazio(context, elemento):
    """
    Verifica se um campo de input está vazio (sem valor).
    
    Args:
        context: Contexto do Behave
        elemento (str): Seletor CSS do campo input
        
    Raises:
        AssertionError: Se o campo estiver preenchido
    """
    try:
        campo = context.browser.find_element(By.CSS_SELECTOR, elemento)
        valor = campo.get_attribute("value")
        assert not valor or valor == "", f"Campo '{elemento}' não está vazio: '{valor}'"
    except Exception as e:
        raise AssertionError(f"Erro ao verificar campo vazio '{elemento}': {str(e)}")


@then('o elemento {elemento} deve estar habilitado')
@then('o elemento {elemento} deve estar disponível para uso')
def step_verificar_elemento_habilitado(context, elemento):
    """
    Verifica se um elemento está habilitado (não desabilitado).
    
    Args:
        context: Contexto do Behave
        elemento (str): Seletor CSS do elemento
        
    Raises:
        AssertionError: Se o elemento estiver desabilitado
    """
    try:
        el = context.browser.find_element(By.CSS_SELECTOR, elemento)
        assert el.is_enabled(), f"Elemento '{elemento}' está desabilitado"
    except Exception as e:
        raise AssertionError(f"Erro ao verificar se elemento '{elemento}' está habilitado: {str(e)}")


@then('o elemento {elemento} deve estar desabilitado')
@then('o elemento {elemento} não deve estar disponível')
def step_verificar_elemento_desabilitado(context, elemento):
    """
    Verifica se um elemento está desabilitado.
    
    Args:
        context: Contexto do Behave
        elemento (str): Seletor CSS do elemento
        
    Raises:
        AssertionError: Se o elemento estiver habilitado
    """
    try:
        el = context.browser.find_element(By.CSS_SELECTOR, elemento)
        assert not el.is_enabled(), f"Elemento '{elemento}' está habilitado mas deveria estar desabilitado"
    except Exception as e:
        raise AssertionError(f"Erro ao verificar se elemento '{elemento}' está desabilitado: {str(e)}")


@then('devo aguardar {segundos:d} segundos')
@then('aguardo {segundos:d} segundo(s)')
def step_aguardar(context, segundos):
    """
    Aguarda o número especificado de segundos.
    
    Use com moderação - geralmente é melhor aguardar por condições específicas.
    
    Args:
        context: Contexto do Behave
        segundos (int): Número de segundos a aguardar
    """
    time.sleep(segundos)
`;
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
import os

def before_all(context):
    """Executado antes de todos os testes"""
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Modo headless (comentar para ver navegador)
    # chrome_options.add_argument("--headless")
    
    context.browser = webdriver.Chrome(options=chrome_options)
    context.browser.implicitly_wait(10)
    
    # URL base da aplicação
    context.base_url = os.getenv('BASE_URL', 'http://localhost:8080')

def after_all(context):
    """Executado após todos os testes"""
    if hasattr(context, 'browser'):
        context.browser.quit()

def before_scenario(context, scenario):
    """Executado antes de cada cenário"""
    if hasattr(context, 'browser'):
        context.browser.delete_all_cookies()
        context.browser.execute_script("window.localStorage.clear();")
        context.browser.execute_script("window.sessionStorage.clear();")

def after_scenario(context, scenario):
    """Executado após cada cenário"""
    if scenario.status == 'failed':
        # Criar pasta para screenshots se não existir
        screenshots_dir = 'screenshots'
        if not os.path.exists(screenshots_dir):
            os.makedirs(screenshots_dir)
        
        # Salvar screenshot
        screenshot_name = f"{screenshots_dir}/falha_{scenario.name.replace(' ', '_')}.png"
        if hasattr(context, 'browser'):
            context.browser.save_screenshot(screenshot_name)
            print(f"Screenshot salvo: {screenshot_name}")

def before_step(context, step):
    """Executado antes de cada step"""
    pass

def after_step(context, step):
    """Executado após cada step"""
    if step.status == 'failed':
        print(f"Step falhou: {step.name}")
`;
    }

    generateRequirementsContent() {
        return `# Dependências Python para testes BDD
# Instale com: pip install -r requirements.txt

selenium==4.15.2
behave==1.2.6
webdriver-manager==4.0.1
`;
    }

    formatInteractionText(interaction) {
        const action = interaction.acao || 'ação';
        const element = interaction.nomeElemento || 'elemento';
        const value = interaction.valorPreenchido || '';
        
        let text = '';
        switch (action) {
            case 'clica':
                text = `clica no ${element}`;
                break;
            case 'preenche':
                text = `preenche ${element} com "${value}"`;
                break;
            case 'seleciona':
                text = `seleciona "${value}" em ${element}`;
                break;
            case 'acessa_url':
                text = `acessa a URL "${value || element}"`;
                break;
            default:
                text = `executa ação "${action}" em ${element}`;
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
                    filename = `features/${filename}`;
                } else if (filename.startsWith('pages/')) {
                    filename = `features/${filename}`;
                } else if (filename.startsWith('steps/')) {
                    filename = `features/${filename}`;
                } else if (filename.includes('metadata')) {
                    filename = `metadata/${filename}`;
                } else if (filename.includes('audit')) {
                    filename = `logs/${filename}`;
                }
                
                downloadFile(filename, file.content);
            });
        });
    }

    async exportAsZip(exportData) {
        // Nota: Para implementação completa, seria necessário JSZip
        // Por enquanto, usamos exportação individual
        this.logger.warn('Formato ZIP ainda em desenvolvimento, usando exportação individual');
        this.exportAsIndividualFiles(exportData);
    }
}

// Export da instância singleton
export const exportManager = new ExportManager();
