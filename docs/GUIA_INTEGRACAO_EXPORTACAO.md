# 🔧 GUIA PRÁTICO DE INTEGRAÇÃO - Exportação v1.1.0

**Público:** Desenvolvedores e Técnicos  
**Data:** 15 de janeiro de 2026  
**Versão:** 1.1.0

---

## 🎯 Início Rápido (5 minutos)

### 1️⃣ Verificar que os Arquivos Existem

```bash
# No seu projeto, execute:
ls -la src/export/

# Esperado:
export-manager.js    ✅
compressor.js        ✅
export-bridge.js     ✅
exporter.js          ✅
```

### 2️⃣ Build Passou com Sucesso

```bash
npm run build

# Esperado:
webpack 5.99.9 compiled successfully
asset bundle.js 194 KiB
```

### 3️⃣ Usar Como Antes (Compatibilidade)

```javascript
// seu-arquivo.js
import { exportSelectedFeatures } from './src/export/exporter.js';

// Usar normalmente
exportSelectedFeatures([0, 1, 2]);
// Resultado: Tudo funciona como antes ✅
```

---

## 📚 Exemplos Práticos

### Exemplo 1: Exportação Básica

```javascript
/**
 * Exportar features selecionadas (compatível com código antigo)
 */

import { exportSelectedFeatures } from './src/export/exporter.js';

function handleExportClick() {
    // Indices das features selecionadas
    const selectedIndices = [0, 1];
    
    // Chamar função
    exportSelectedFeatures(selectedIndices);
    
    // Resultado: 6 arquivos por feature serão baixados
    // ✅ Barra de progresso vem automaticamente
    // ✅ Logs em console com [EXPORT-...] prefix
}
```

### Exemplo 2: Exportação com Progresso Visual

```javascript
/**
 * Usar novo sistema com barra de progresso
 */

import { ExportManager } from './src/export/export-manager.js';

async function handleExportWithProgress() {
    const manager = new ExportManager();
    
    // Preparar features
    const features = window.gherkinFeatures;
    
    if (!features || features.length === 0) {
        alert('Nenhuma feature para exportar');
        return;
    }
    
    // Exportar com recursos avançados
    const success = await manager.exportFeatures(features, {
        format: 'individual',
        includeMetadata: true,    // Adiciona export_metadata.json
        includeLogs: true,        // Adiciona export_audit.csv
        onProgress: (current, total) => {
            console.log(`Progresso: ${current}/${total}`);
        }
    });
    
    if (success) {
        console.log('✅ Exportação concluída!');
        // Resultado: Modal com progresso + logs estruturados
    } else {
        console.error('❌ Erro na exportação');
    }
}
```

### Exemplo 3: Exportação com Bridge

```javascript
/**
 * Usar bridge para compatibilidade e recursos avançados
 */

import { exportBridge } from './src/export/export-bridge.js';

async function handleExportAdvanced() {
    const selectedIndices = [0, 1, 2];
    const featuresToExport = window.gherkinFeatures.filter(
        (_, idx) => selectedIndices.includes(idx)
    );
    
    // Método 1: Exportação individual com melhorias
    const result1 = await exportBridge.exportWithProgress(featuresToExport);
    // Resultado: Mesmos 6 arquivos, mas com feedback visual
    
    // Método 2: Exportação em ZIP (futuro)
    const zipData = await exportBridge.exportAsZip(featuresToExport);
    // Resultado: Um arquivo .zip com estrutura organizada
    
    // Método 3: Exportação com todas as opções
    const result3 = await exportBridge.exportWithEnhancements(
        featuresToExport,
        {
            useZip: false,
            includeMetadata: true,
            includeLogs: true,
            format: 'individual'
        }
    );
}
```

### Exemplo 4: Acesso a Informações de Exportação

```javascript
/**
 * Acessar metadata e logs da exportação
 */

import { exportBridge } from './src/export/export-bridge.js';

async function analyzeExport() {
    // Exportar
    const features = window.gherkinFeatures;
    await exportBridge.exportWithEnhancements(features);
    
    // Obter informações
    const exportInfo = exportBridge.getLastExportInfo();
    
    console.log('Informações da Exportação:');
    console.log('  Session ID:', exportInfo?.sessionId);
    console.log('  Timestamp:', exportInfo?.timestamp);
    console.log('  Duração:', exportInfo?.duration + 'ms');
    console.log('  Erros:', exportInfo?.errors);
    console.log('  Warnings:', exportInfo?.warnings);
}
```

### Exemplo 5: Logging e Auditoria

```javascript
/**
 * Acessar logs detalhados de auditoria
 */

import { ExportManager } from './src/export/export-manager.js';

async function auditExport() {
    const manager = new ExportManager();
    const features = window.gherkinFeatures;
    
    // Exportar
    await manager.exportFeatures(features, {
        includeMetadata: true,
        includeLogs: true
    });
    
    // Acessar logs
    const report = manager.logger.getReport();
    
    console.log('RELATÓRIO DE AUDITORIA:');
    console.log('========================');
    console.log('Session ID:', report.sessionId);
    console.log('Timestamp:', report.timestamp);
    console.log('Duração:', report.duration + 'ms');
    console.log('Total de Logs:', report.totalLogs);
    console.log('Erros:', report.errors);
    console.log('Warnings:', report.warnings);
    console.log('\nDetalhes dos Logs:');
    report.logs.forEach((log, idx) => {
        console.log(`${idx + 1}. [${log.level}] ${log.message}`);
    });
    
    // Exportar como CSV
    const csv = manager.logger.exportAsCsv();
    downloadFile('audit.csv', csv);
}
```

### Exemplo 6: Tratamento de Erros Avançado

```javascript
/**
 * Implementar tratamento robusto de erros
 */

import { ExportManager } from './src/export/export-manager.js';

async function robustExport() {
    const manager = new ExportManager();
    
    try {
        const success = await manager.exportFeatures(
            window.gherkinFeatures,
            {
                includeMetadata: true,
                includeLogs: true
            }
        );
        
        if (!success) {
            // Obter relatório com erros
            const report = manager.logger.getReport();
            const errorLogs = report.logs.filter(l => l.level === 'error');
            
            if (errorLogs.length > 0) {
                console.error('Erros encontrados:');
                errorLogs.forEach(err => {
                    console.error(`  - ${err.message}`);
                    if (err.metadata) {
                        console.error(`    Detalhes:`, err.metadata);
                    }
                });
            }
        }
    } catch (error) {
        console.error('Erro crítico:', error.message);
        console.error('Stack:', error.stack);
    }
}
```

### Exemplo 7: Integração com UI

```javascript
/**
 * Integração completa com elemento de UI
 */

// HTML
```html
<button id="export-btn" class="btn btn-primary">
    📤 Exportar Features
</button>

<div id="export-status" style="display: none;">
    <span id="status-text">Preparando...</span>
</div>
```

// JavaScript
```javascript
import { ExportManager } from './src/export/export-manager.js';

class ExportUI {
    constructor() {
        this.manager = new ExportManager();
        this.statusEl = document.getElementById('export-status');
        this.statusText = document.getElementById('status-text');
        this.setupListeners();
    }
    
    setupListeners() {
        document.getElementById('export-btn').addEventListener('click', () => {
            this.handleExport();
        });
    }
    
    async handleExport() {
        try {
            // Mostrar status
            this.statusEl.style.display = 'block';
            this.statusText.textContent = 'Validando features...';
            
            // Exportar
            const success = await this.manager.exportFeatures(
                window.gherkinFeatures,
                {
                    includeMetadata: true,
                    includeLogs: true,
                    onProgress: (current, total) => {
                        const pct = Math.round((current / total) * 100);
                        this.statusText.textContent = `Exportando... ${pct}%`;
                    }
                }
            );
            
            // Atualizar status
            if (success) {
                this.statusText.textContent = '✅ Exportação concluída!';
                setTimeout(() => {
                    this.statusEl.style.display = 'none';
                }, 3000);
            } else {
                this.statusText.textContent = '❌ Erro na exportação';
            }
        } catch (error) {
            this.statusText.textContent = `❌ ${error.message}`;
        }
    }
}

// Inicializar ao carregar página
document.addEventListener('DOMContentLoaded', () => {
    new ExportUI();
});
```

### Exemplo 8: Monitoramento de Performance

```javascript
/**
 * Medir performance de exportação
 */

import { ExportManager } from './src/export/export-manager.js';

async function measureExportPerformance() {
    const manager = new ExportManager();
    
    // Cronômetro
    const startTime = performance.now();
    
    // Exportar
    const success = await manager.exportFeatures(
        window.gherkinFeatures,
        {
            includeMetadata: true,
            includeLogs: true
        }
    );
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Analisar performance
    if (success) {
        const report = manager.logger.getReport();
        const fileCount = report.logs.filter(
            l => l.message.includes('exportado')
        ).length;
        
        console.log('📊 PERFORMANCE:');
        console.log('  Tempo total:', duration.toFixed(2) + 'ms');
        console.log('  Arquivos:', fileCount);
        console.log('  Tempo/arquivo:', (duration / fileCount).toFixed(2) + 'ms');
        console.log('  Velocidade:', (fileCount / (duration / 1000)).toFixed(1) + ' arq/s');
    }
}
```

---

## 🔌 Integração com Content Script

### Em src/content.js

```javascript
/**
 * Usar novo export manager no content script
 */

import { ExportManager } from './export/export-manager.js';
import { exportBridge } from './export/export-bridge.js';

// No seu inicializador
function initializeExport() {
    // Verificar se as funções estão disponíveis
    window.gherkinExportManager = new ExportManager();
    window.gherkinExportBridge = exportBridge;
    
    // Manter compatibilidade com código antigo
    window.exportSelectedFeatures = exportSelectedFeatures;
}

// Ao lidar com botão de exportação
document.querySelector('#export-button')?.addEventListener('click', async () => {
    const selectedIndices = getSelectedFeatureIndices();
    
    // Usar novo sistema
    const success = await window.gherkinExportManager.exportFeatures(
        window.gherkinFeatures.filter((_, idx) => selectedIndices.includes(idx)),
        {
            includeMetadata: true,
            includeLogs: true
        }
    );
    
    if (success) {
        showNotification('✅ Features exportadas com sucesso!', 'success');
    }
});
```

---

## 🧪 Testes Práticos

### Teste 1: Exportação Simples

```javascript
// 1. Abrir console do navegador (F12)
// 2. Copiar e colar:

(async () => {
    const manager = new ExportManager();
    const features = window.gherkinFeatures;
    
    if (features.length === 0) {
        console.log('❌ Nenhuma feature para testar');
        return;
    }
    
    console.log(`✅ Iniciando teste com ${features.length} feature(s)`);
    
    const success = await manager.exportFeatures(features.slice(0, 1), {
        includeMetadata: true,
        includeLogs: true
    });
    
    console.log(`✅ Teste concluído: ${success ? 'SUCESSO' : 'FALHA'}`);
})();
```

### Teste 2: Logging e Auditoria

```javascript
// 1. Abrir console
// 2. Copiar e colar:

(async () => {
    const manager = new ExportManager();
    
    // Exportar
    await manager.exportFeatures(window.gherkinFeatures.slice(0, 1));
    
    // Verificar logs
    const report = manager.logger.getReport();
    console.log('📊 Relatório:');
    console.log(`  Session ID: ${report.sessionId}`);
    console.log(`  Total de logs: ${report.totalLogs}`);
    console.log(`  Erros: ${report.errors}`);
    console.log(`  Warnings: ${report.warnings}`);
    console.log(`  Duração: ${report.duration}ms`);
})();
```

### Teste 3: Monitorar Progresso

```javascript
// 1. Abrir console
// 2. Copiar e colar:

(async () => {
    const manager = new ExportManager();
    
    const success = await manager.exportFeatures(
        window.gherkinFeatures,
        {
            includeMetadata: true,
            onProgress: (current, total) => {
                console.log(`[${current}/${total}] ${Math.round((current/total)*100)}%`);
            }
        }
    );
    
    console.log('Teste finalizado:', success ? '✅' : '❌');
})();
```

---

## 🐛 Debugging

### Ver Logs em Console

```javascript
// Todos os logs têm prefixo [EXPORT-...]
// Abrir DevTools (F12) → Console

// Filtrar por tipo
console.table(
    manager.logger.logs.filter(l => l.level === 'error')
);

// Ver timeline
manager.logger.logs.forEach(log => {
    console.log(`${log.timestamp} [${log.level}] ${log.message}`);
});
```

### Verificar Metadata

```javascript
// Ver informações de exportação
const report = manager.logger.getReport();
console.log(JSON.stringify(report, null, 2));

// Exportar como JSON para análise
const json = JSON.stringify(report, null, 2);
downloadFile('export_report.json', json);
```

### Performance Profiling

```javascript
// Usar DevTools → Performance tab
performance.mark('export-start');

await manager.exportFeatures(features);

performance.mark('export-end');
performance.measure('export', 'export-start', 'export-end');

const measure = performance.getEntriesByName('export')[0];
console.log(`Tempo de exportação: ${measure.duration.toFixed(2)}ms`);
```

---

## ✅ Checklist de Integração

- [ ] Arquivos criados (export-manager.js, compressor.js, export-bridge.js)
- [ ] Build passou sem erros
- [ ] Código legado funciona sem mudanças
- [ ] Novos recursos acessíveis
- [ ] Progresso visual aparece
- [ ] Logs em console com [EXPORT-...] prefix
- [ ] Arquivos de metadata gerados
- [ ] Auditoria em CSV funcionando
- [ ] Testes manuais passaram

---

## 📞 Troubleshooting

### Problema: Modal de progresso não aparece

```javascript
// Verificar:
console.log('Modal suportado?', !!document.createElement('div'));

// Se falhar, checar CSS:
console.log('Classe CSS existe?', !!document.querySelector('.bdd-modal-overlay'));
```

### Problema: Arquivos não baixam

```javascript
// Verificar se downloadFile está funcionando
downloadFile('test.txt', 'teste');

// Se não funcionar, pode estar bloqueado por CORS
console.log('Origem:', window.location.origin);
```

### Problema: Logs vazios

```javascript
// Verificar se logger foi inicializado
const manager = new ExportManager();
console.log('Logger inicializado?', !!manager.logger);
console.log('Total de logs:', manager.logger.logs.length);
```

---

## 🎓 Referência Rápida

| Classe | Método | Uso |
|--------|--------|-----|
| **ExportManager** | exportFeatures() | Exportar features com opções |
| **ExportManager** | generateFeatureFiles() | Gerar arquivos de uma feature |
| **ExportLogger** | getReport() | Obter relatório de auditoria |
| **ExportProgress** | update() | Atualizar barra de progresso |
| **ExportMetadata** | toJSON() | Metadata em JSON |
| **FileCompressor** | compressFiles() | Comprimir múltiplos arquivos |
| **ExportBridge** | exportWithEnhancements() | Exportar com todos os recursos |

---

**Documentação pronta para uso! 🚀**
