/**
 * Excel Generator v2.0 - Gerador de Caderno de Testes BDD em formato Excel
 * 
 * Melhorias:
 * - Um passo por linha (estrutura expandida)
 * - Formatação profissional (cores, bordas, cabeçalhos)
 * - Freeze panes no cabeçalho
 * - Cores alternadas nas linhas
 * - Suporte a xlsx-js-style para estilos avançados
 */

import XLSX from 'xlsx-js-style';

// Definição de estilos reutilizáveis
const STYLES = {
    // Cabeçalho principal
    header: {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
        fill: { fgColor: { rgb: '1E3A8A' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
        }
    },
    // Células normais (linhas pares)
    cellEven: {
        font: { sz: 10 },
        fill: { fgColor: { rgb: 'F8FAFC' } },
        alignment: { vertical: 'center', wrapText: true },
        border: {
            top: { style: 'thin', color: { rgb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
            left: { style: 'thin', color: { rgb: 'E2E8F0' } },
            right: { style: 'thin', color: { rgb: 'E2E8F0' } }
        }
    },
    // Células normais (linhas ímpares)
    cellOdd: {
        font: { sz: 10 },
        fill: { fgColor: { rgb: 'FFFFFF' } },
        alignment: { vertical: 'center', wrapText: true },
        border: {
            top: { style: 'thin', color: { rgb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
            left: { style: 'thin', color: { rgb: 'E2E8F0' } },
            right: { style: 'thin', color: { rgb: 'E2E8F0' } }
        }
    },
    // Badge Given (verde)
    stepGiven: {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
        fill: { fgColor: { rgb: '10B981' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
            top: { style: 'thin', color: { rgb: '059669' } },
            bottom: { style: 'thin', color: { rgb: '059669' } },
            left: { style: 'thin', color: { rgb: '059669' } },
            right: { style: 'thin', color: { rgb: '059669' } }
        }
    },
    // Badge When (amarelo/laranja)
    stepWhen: {
        font: { bold: true, color: { rgb: '000000' }, sz: 10 },
        fill: { fgColor: { rgb: 'FCD34D' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
            top: { style: 'thin', color: { rgb: 'F59E0B' } },
            bottom: { style: 'thin', color: { rgb: 'F59E0B' } },
            left: { style: 'thin', color: { rgb: 'F59E0B' } },
            right: { style: 'thin', color: { rgb: 'F59E0B' } }
        }
    },
    // Badge Then (azul)
    stepThen: {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
        fill: { fgColor: { rgb: '3B82F6' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
            top: { style: 'thin', color: { rgb: '2563EB' } },
            bottom: { style: 'thin', color: { rgb: '2563EB' } },
            left: { style: 'thin', color: { rgb: '2563EB' } },
            right: { style: 'thin', color: { rgb: '2563EB' } }
        }
    },
    // Badge And (cinza)
    stepAnd: {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
        fill: { fgColor: { rgb: '6B7280' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
            top: { style: 'thin', color: { rgb: '4B5563' } },
            bottom: { style: 'thin', color: { rgb: '4B5563' } },
            left: { style: 'thin', color: { rgb: '4B5563' } },
            right: { style: 'thin', color: { rgb: '4B5563' } }
        }
    },
    // Título do Resumo
    title: {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 16 },
        fill: { fgColor: { rgb: '1E3A8A' } },
        alignment: { horizontal: 'center', vertical: 'center' }
    },
    // Subtítulo
    subtitle: {
        font: { bold: true, color: { rgb: '1E3A8A' }, sz: 12 },
        fill: { fgColor: { rgb: 'E0E7FF' } },
        alignment: { horizontal: 'left', vertical: 'center' }
    },
    // Célula de métrica
    metric: {
        font: { sz: 11 },
        alignment: { horizontal: 'left', vertical: 'center' },
        border: {
            bottom: { style: 'thin', color: { rgb: 'E2E8F0' } }
        }
    },
    // Valor de métrica
    metricValue: {
        font: { bold: true, sz: 11, color: { rgb: '1E3A8A' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
            bottom: { style: 'thin', color: { rgb: 'E2E8F0' } }
        }
    }
};

/**
 * ExcelGenerator - Classe responsável pela geração do Caderno de Testes
 */
export class ExcelGenerator {
    constructor() {
        this.workbook = null;
    }

    /**
     * Gera o workbook completo a partir das features
     * @param {Array} features - Lista de features com cenários
     * @returns {ArrayBuffer} Buffer do arquivo Excel
     */
    generateTestWorkbook(features) {
        // Criar novo workbook
        this.workbook = XLSX.utils.book_new();

        // Gerar aba de Resumo
        this.addSummarySheet(features);

        // Gerar aba de Caderno de Testes (um passo por linha)
        this.addTestCasesSheet(features);

        // Gerar buffer do arquivo
        const buffer = XLSX.write(this.workbook, {
            bookType: 'xlsx',
            type: 'array',
            cellStyles: true
        });

        return buffer;
    }

    /**
     * Adiciona a aba de Resumo com estatísticas do projeto
     * @param {Array} features - Lista de features
     */
    addSummarySheet(features) {
        const totalFeatures = features.length;
        const totalScenarios = features.reduce((sum, f) => sum + (f.scenarios?.length || 0), 0);
        const totalSteps = features.reduce((sum, f) => {
            return sum + (f.scenarios || []).reduce((sSum, s) => {
                return sSum + (s.interactions?.length || 0);
            }, 0);
        }, 0);

        // Dados da planilha
        const data = [
            [{ v: '📊 RESUMO DO PROJETO DE TESTES', s: STYLES.title }],
            [''],
            [{ v: 'Métrica', s: STYLES.subtitle }, { v: 'Valor', s: STYLES.subtitle }],
            [{ v: 'Total de Features', s: STYLES.metric }, { v: totalFeatures, s: STYLES.metricValue }],
            [{ v: 'Total de Cenários', s: STYLES.metric }, { v: totalScenarios, s: STYLES.metricValue }],
            [{ v: 'Total de Passos', s: STYLES.metric }, { v: totalSteps, s: STYLES.metricValue }],
            [''],
            [{ v: '📅 Data de Geração', s: STYLES.metric }, { v: new Date().toLocaleDateString('pt-BR'), s: STYLES.metricValue }],
            [{ v: '⏰ Hora de Geração', s: STYLES.metric }, { v: new Date().toLocaleTimeString('pt-BR'), s: STYLES.metricValue }],
            [''],
            [{ v: '📋 LISTA DE FEATURES', s: STYLES.subtitle }],
            ['']
        ];

        // Adicionar lista de features
        features.forEach((feature, idx) => {
            const scenarioCount = feature.scenarios?.length || 0;
            data.push([
                { v: `${idx + 1}. ${feature.name}`, s: STYLES.metric },
                { v: `${scenarioCount} cenário(s)`, s: STYLES.metricValue }
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);

        // Configurar largura das colunas
        ws['!cols'] = [
            { wch: 35 },
            { wch: 20 }
        ];

        // Mesclar célula do título
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
        ];

        // Altura das linhas
        ws['!rows'] = [
            { hpt: 30 }, // Título
        ];

        XLSX.utils.book_append_sheet(this.workbook, ws, 'Resumo');
    }

    /**
     * Adiciona a aba principal de Caderno de Testes (um passo por linha)
     * @param {Array} features - Lista de features
     */
    addTestCasesSheet(features) {
        // Cabeçalhos do caderno de testes
        const headers = [
            { v: 'ID', s: STYLES.header },
            { v: 'Feature', s: STYLES.header },
            { v: 'Cenário', s: STYLES.header },
            { v: 'Passo', s: STYLES.header },
            { v: 'Tipo', s: STYLES.header },
            { v: 'Descrição do Passo', s: STYLES.header },
            { v: 'Status', s: STYLES.header },
            { v: 'Observações', s: STYLES.header }
        ];

        const data = [headers];
        let testCaseId = 1;
        let rowIndex = 1;

        features.forEach(feature => {
            (feature.scenarios || []).forEach(scenario => {
                const interactions = scenario.interactions || [];
                const caseId = `CT-${String(testCaseId).padStart(3, '0')}`;

                interactions.forEach((interaction, stepIndex) => {
                    const stepType = interaction.step || interaction.realStepType || 'When';
                    const stepText = this.formatStepText(interaction);
                    const isEven = rowIndex % 2 === 0;
                    const cellStyle = isEven ? STYLES.cellEven : STYLES.cellOdd;

                    // Determinar estilo do badge de tipo
                    let typeStyle = STYLES.stepWhen;
                    if (stepType === 'Given') typeStyle = STYLES.stepGiven;
                    else if (stepType === 'Then') typeStyle = STYLES.stepThen;
                    else if (stepType === 'And') typeStyle = STYLES.stepAnd;

                    data.push([
                        { v: caseId, s: cellStyle },
                        { v: feature.name, s: cellStyle },
                        { v: scenario.name, s: cellStyle },
                        { v: stepIndex + 1, s: { ...cellStyle, alignment: { horizontal: 'center', vertical: 'center' } } },
                        { v: stepType, s: typeStyle },
                        { v: stepText, s: cellStyle },
                        { v: '', s: cellStyle },
                        { v: '', s: cellStyle }
                    ]);

                    rowIndex++;
                });

                testCaseId++;
            });
        });

        const ws = XLSX.utils.aoa_to_sheet(data);

        // Configurar largura das colunas
        ws['!cols'] = [
            { wch: 10 },  // ID
            { wch: 20 },  // Feature
            { wch: 25 },  // Cenário
            { wch: 8 },   // Passo
            { wch: 10 },  // Tipo
            { wch: 55 },  // Descrição
            { wch: 12 },  // Status
            { wch: 25 }   // Observações
        ];

        // Altura das linhas
        ws['!rows'] = data.map((_, idx) => {
            return { hpt: idx === 0 ? 25 : 22 };
        });

        // Freeze panes (congelar cabeçalho)
        ws['!freeze'] = { xSplit: 0, ySplit: 1 };

        XLSX.utils.book_append_sheet(this.workbook, ws, 'Caderno de Testes');
    }

    /**
     * Formata o texto de um step para exibição em linguagem natural BDD
     * @param {Object} interaction - Interação/step
     * @returns {string} Texto formatado em linguagem natural
     */
    formatStepText(interaction) {
        const action = interaction.acao || '';
        const element = interaction.nomeElemento || '';
        const value = interaction.valorPreenchido || '';
        const stepType = interaction.step || interaction.realStepType || 'When';

        // Truncar URLs muito longas para melhor visualização
        const truncateUrl = (url, maxLen = 50) => {
            if (!url || url.length <= maxLen) return url;
            return url.substring(0, maxLen) + '...';
        };

        // Limpar valor para exibição (remover quebras de linha, etc.)
        const cleanValue = (val) => {
            if (!val) return '';
            return String(val).replace(/\n/g, ' ').trim();
        };

        // Templates por tipo de ação - Linguagem Natural BDD em Português
        const templates = {
            // Navegação
            'acessa_url': () => {
                if (stepType === 'Given') {
                    return `Estou na página "${element || 'inicial'}"`;
                }
                return `Acesso a URL ${truncateUrl(value || element)}`;
            },
            'navega': () => `Navego para a página "${cleanValue(value) || element}"`,

            // Ações de clique
            'clica': () => `Clico no botão/link "${element}"`,

            // Preenchimento
            'preenche': () => `Preencho o campo "${element}" com "${cleanValue(value)}"`,

            // Seleção
            'seleciona': () => `Seleciono a opção "${cleanValue(value)}" no campo "${element}"`,
            'seleciona_radio': () => `Seleciono a opção "${element}"`,
            'marca_checkbox': () => `Marco a caixa de seleção "${element}"`,
            'desmarca_checkbox': () => `Desmarco a caixa de seleção "${element}"`,
            'radio': () => `Seleciono a opção "${element}"`,
            'caixa': () => `Marco a caixa de seleção "${element}"`,

            // Validações (Then)
            'valida_contem': () => `Devo ver o texto "${cleanValue(value)}" ${element ? `em "${element}"` : 'na página'}`,
            'valida_nao_contem': () => `Não devo ver o texto "${cleanValue(value)}" ${element ? `em "${element}"` : 'na página'}`,
            'valida_existe': () => `O elemento "${element}" deve estar visível`,
            'valida_nao_existe': () => `O elemento "${element}" não deve estar visível`,
            'valida_texto': () => `Devo ver o texto "${cleanValue(value)}" em "${element}"`,
            'valida_visivel': () => `O elemento "${element}" deve estar visível na tela`,
            'valida_nao_visivel': () => `O elemento "${element}" não deve estar visível`,

            // Esperas
            'espera_segundos': () => `Aguardo ${value || '5'} segundos`,
            'espera_elemento': () => `Aguardo o elemento "${element}" aparecer`,
            'espera_nao_existe': () => `Aguardo o elemento "${element}" desaparecer`,
            'espera_carregamento': () => `Aguardo a página carregar completamente`,

            // Upload
            'upload': () => `Faço upload do arquivo em "${element}"`,

            // Teclas
            'pressiona_enter': () => `Pressiono a tecla Enter em "${element}"`,
            'pressiona_tecla': () => `Pressiono a tecla ${value} em "${element}"`
        };

        // Buscar template ou usar fallback
        if (templates[action]) {
            return templates[action]();
        }

        // Fallback: formatar de forma genérica mas legível
        const actionName = action.replace(/_/g, ' ');
        if (value && element) {
            return `${this.capitalizeFirst(actionName)}: "${element}" com "${cleanValue(value)}"`;
        } else if (element) {
            return `${this.capitalizeFirst(actionName)}: "${element}"`;
        } else if (value) {
            return `${this.capitalizeFirst(actionName)}: "${cleanValue(value)}"`;
        }
        return this.capitalizeFirst(actionName);
    }

    /**
     * Capitaliza a primeira letra de uma string
     * @param {string} str - String a capitalizar
     * @returns {string} String com primeira letra maiúscula
     */
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Faz o download do arquivo Excel
     * @param {Array} features - Lista de features
     * @param {string} filename - Nome do arquivo (sem extensão)
     */
    download(features, filename = 'caderno_de_testes') {
        const buffer = this.generateTestWorkbook(features);
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${this.getDateStamp()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Gera timestamp para nome do arquivo
     * @returns {string} Data no formato YYYYMMDD_HHMMSS
     */
    getDateStamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        return `${year}${month}${day}_${hour}${min}`;
    }
}

// Singleton instance
let excelGeneratorInstance = null;

/**
 * Obtém instância do ExcelGenerator
 * @returns {ExcelGenerator}
 */
export function getExcelGenerator() {
    if (!excelGeneratorInstance) {
        excelGeneratorInstance = new ExcelGenerator();
    }
    return excelGeneratorInstance;
}

export default ExcelGenerator;
