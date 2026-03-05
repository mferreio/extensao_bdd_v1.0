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
import { analyzeCoverage } from './coverage-report.js';

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
    },
    // Separador de Cenário
    scenarioSeparator: {
        fill: { fgColor: { rgb: 'DBEAFE' } }, // Azul bem clarinho
        border: {
            top: { style: 'medium', color: { rgb: '93C5FD' } },
            bottom: { style: 'medium', color: { rgb: '93C5FD' } }
        }
    },
    // Distintivo de Ação na matriz
    actionBadge: {
        font: { sz: 9, bold: true, color: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        // Cor dinâmica atribuída via código
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

        // Gerar aba do Dicionário de Seletores
        this.addSelectorsDictionarySheet(features);

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
        // Obter métricas enriquecidas
        const stats = analyzeCoverage(features);

        // Dados da planilha
        const data = [
            [{ v: '📊 RESUMO DO PROJETO DE TESTES', s: STYLES.title }],
            [''],
            [{ v: 'Métrica', s: STYLES.subtitle }, { v: 'Valor', s: STYLES.subtitle }],
            [{ v: 'Total de Features', s: STYLES.metric }, { v: stats.totalFeatures, s: STYLES.metricValue }],
            [{ v: 'Total de Cenários', s: STYLES.metric }, { v: stats.totalScenarios, s: STYLES.metricValue }],
            [{ v: 'Total de Passos', s: STYLES.metric }, { v: stats.totalSteps, s: STYLES.metricValue }],
            [{ v: 'Páginas Distintas', s: STYLES.metric }, { v: stats.uniquePages, s: STYLES.metricValue }],
            [''],
            [{ v: 'Distribuição de Ações', s: STYLES.subtitle }, { v: '', s: STYLES.subtitle }],
            [{ v: 'Navegação (Acessos, Redirecionamentos)', s: STYLES.metric }, { v: stats.actionsDistribution?.navigation || 0, s: STYLES.metricValue }],
            [{ v: 'Interação (Cliques, Digitação, etc)', s: STYLES.metric }, { v: stats.actionsDistribution?.interaction || 0, s: STYLES.metricValue }],
            [{ v: 'Validação (Verificações visuais/texto)', s: STYLES.metric }, { v: stats.actionsDistribution?.validation || 0, s: STYLES.metricValue }],
            [{ v: 'Espera (Tempo ou Elementos)', s: STYLES.metric }, { v: stats.actionsDistribution?.wait || 0, s: STYLES.metricValue }],
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

        // Adicionar rodapé de assinatura
        data.push(['']);
        data.push(['']);
        data.push([
            { v: 'Responsável pela Execução:', s: { font: { bold: true, sz: 11 }, alignment: { horizontal: 'left' } } },
            { v: '____________________________________', s: { font: { sz: 11 }, alignment: { horizontal: 'left' } } }
        ]);
        data.push([
            { v: 'Data de Execução:', s: { font: { bold: true, sz: 11 }, alignment: { horizontal: 'left' } } },
            { v: '__/__/____', s: { font: { sz: 11 }, alignment: { horizontal: 'left' } } }
        ]);

        const ws = XLSX.utils.aoa_to_sheet(data);

        // Configurar largura das colunas
        ws['!cols'] = [
            { wch: 45 },
            { wch: 25 }
        ];

        // Mesclar células de título e subtítulos apropriados
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Titulo Principal
            { s: { r: 8, c: 0 }, e: { r: 8, c: 1 } }, // Subtitulo Distr
            { s: { r: 17, c: 0 }, e: { r: 17, c: 1 } } // Subtitulo Lista
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
            { v: 'Pré-condições', s: STYLES.header },
            { v: 'Passo', s: STYLES.header },
            { v: 'Tipo', s: STYLES.header },
            { v: 'Ação (Descrição)', s: STYLES.header },
            { v: 'Dados de Teste', s: STYLES.header },
            { v: 'Resultado Esperado', s: STYLES.header },
            { v: 'Status', s: STYLES.header },
            { v: 'Observações', s: STYLES.header }
        ];

        const data = [headers];
        let testCaseId = 1;
        let rowIndex = 1;

        features.forEach((feature, fIdx) => {
            (feature.scenarios || []).forEach((scenario, sIdx) => {
                const interactions = scenario.interactions || [];
                const baseId = `CT-${String(testCaseId).padStart(3, '0')}`;
                
                // Extrair pré-condições (todos os passos Given do cenário)
                const preConditions = interactions
                    .filter(i => (i.step || i.realStepType) === 'Given')
                    .map(i => this.formatStepText(i))
                    .join('\\n');

                interactions.forEach((interaction, stepIndex) => {
                    const stepType = interaction.step || interaction.realStepType || 'When';
                    const caseId = `${baseId}.${String(stepIndex + 1).padStart(2, '0')}`; // Hierárquico
                    
                    const isEven = rowIndex % 2 === 0;
                    const cellStyle = isEven ? STYLES.cellEven : STYLES.cellOdd;

                    // Determinar estilo do badge de tipo
                    let typeStyle = STYLES.stepWhen;
                    if (stepType === 'Given') typeStyle = STYLES.stepGiven;
                    else if (stepType === 'Then') typeStyle = STYLES.stepThen;
                    else if (stepType === 'And') typeStyle = STYLES.stepAnd;

                    // Separar Ação de Resultado Esperado
                    let acaoTexto = '';
                    let resultadoEsperado = '';
                    if (stepType === 'Then') {
                        resultadoEsperado = this.formatStepText(interaction);
                    } else {
                        acaoTexto = this.formatStepText(interaction);
                    }

                    data.push([
                        { v: caseId, s: cellStyle },
                        { v: feature.name, s: cellStyle },
                        { v: scenario.name, s: cellStyle },
                        { v: preConditions, s: cellStyle },
                        { v: stepIndex + 1, s: { ...cellStyle, alignment: { horizontal: 'center', vertical: 'center' } } },
                        { v: stepType, s: typeStyle },
                        { v: acaoTexto, s: cellStyle },
                        { v: interaction.valorPreenchido || '', s: cellStyle },
                        { v: resultadoEsperado, s: cellStyle },
                        { v: '', s: cellStyle },
                        { v: '', s: cellStyle }
                    ]);

                    rowIndex++;
                });

                // Adicionar separador visual entre cenários (linha com fundo azulado)
                if (sIdx < (feature.scenarios?.length || 0) - 1 || fIdx < features.length - 1) {
                    data.push(Array(11).fill({ v: '', s: STYLES.scenarioSeparator }));
                    rowIndex++;
                }

                testCaseId++;
            });
        });

        const ws = XLSX.utils.aoa_to_sheet(data);

        // Configurar largura das colunas
        ws['!cols'] = [
            { wch: 12 },  // ID (Hierárquico)
            { wch: 20 },  // Feature
            { wch: 25 },  // Cenário
            { wch: 30 },  // Pré-condições
            { wch: 8 },   // Passo
            { wch: 10 },  // Tipo
            { wch: 45 },  // Ação
            { wch: 20 },  // Dados de Teste
            { wch: 40 },  // Resultado Esperado
            { wch: 15 },  // Status
            { wch: 25 }   // Observações
        ];

        // Altura das linhas (Separadores ficam menores)
        ws['!rows'] = data.map((row, idx) => {
            if (idx === 0) return { hpt: 25 };
            if (row[0] && row[0].s === STYLES.scenarioSeparator) return { hpt: 8 }; // Separador
            return { hpt: 35 }; // Linhas de passo maiores para caber quebra de texto
        });

        // Data Validation para a coluna Status (Passou, Falhou, Bloqueado, N/A)
        // A biblioteca xlsx suporta basic data validation via !dataValidation
        ws['!dataValidation'] = [];
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] && data[i][0].s !== STYLES.scenarioSeparator) {
                ws['!dataValidation'].push({
                    sqref: `J${i + 1}`, // Coluna Status é a J (10ª coluna, 0-indexed I = 9, J = 9) -- Wait, A=0.. J=9. J é a 10ª.
                    type: 'list',
                    allowBlank: true,
                    showInputMessage: true,
                    showErrorMessage: true,
                    formula1: '"Passou,Falhou,Bloqueado,N/A"'
                });
            }
        }

        // Freeze panes (congelar cabeçalho)
        ws['!freeze'] = { xSplit: 0, ySplit: 1 };

        XLSX.utils.book_append_sheet(this.workbook, ws, 'Caderno de Testes');
        
        // Chamar geração da matriz
        this.addTraceabilityMatrixSheet(features);
    }

    /**
     * Adiciona a aba Matriz de Rastreabilidade
     * @param {Array} features - Lista de features
     */
    addTraceabilityMatrixSheet(features) {
        const headers = [
            { v: 'Feature', s: STYLES.header },
            { v: 'Cenário', s: STYLES.header },
            { v: 'Página/Contexto', s: STYLES.header },
            { v: 'Ações Físicas', s: STYLES.header },
            { v: 'Validações (Asserções)', s: STYLES.header }
        ];

        const data = [headers];

        features.forEach(feature => {
            (feature.scenarios || []).forEach(scenario => {
                const interactions = scenario.interactions || [];
                
                // Mapear interações do cenário
                const items = {
                    pages: new Set(),
                    physical: [],
                    validations: []
                };

                // Extrair páginas com base na URL ou contexto
                const pageSteps = interactions.filter(i => i.acao === 'acessa_url' || i.acao === 'navega');
                pageSteps.forEach(p => items.pages.add(p.valorPreenchido || p.nomeElemento || 'Home'));
                if (items.pages.size === 0) items.pages.add('N/A');

                // Classificar o resto
                interactions.forEach(i => {
                    if (i.acao === 'acessa_url' || i.acao === 'navega') return;
                    if (i.acao.startsWith('valida_')) {
                        items.validations.push(i.acao.replace('valida_', ''));
                    } else {
                        items.physical.push(i.acao);
                    }
                });

                data.push([
                    { v: feature.name, s: STYLES.cellEven },
                    { v: scenario.name, s: STYLES.cellEven },
                    { v: Array.from(items.pages).join(', '), s: STYLES.cellEven },
                    { v: items.physical.join(', ') || '-', s: STYLES.cellEven },
                    { v: items.validations.join(', ') || '-', s: STYLES.cellEven }
                ]);
            });
        });

        const ws = XLSX.utils.aoa_to_sheet(data);

        ws['!cols'] = [
            { wch: 25 }, // Feature
            { wch: 35 }, // Cenário
            { wch: 30 }, // Página
            { wch: 40 }, // Físico
            { wch: 40 }  // Validações
        ];

        ws['!rows'] = [{ hpt: 25 }];
        ws['!freeze'] = { xSplit: 0, ySplit: 1 };

        XLSX.utils.book_append_sheet(this.workbook, ws, 'Matriz Rastreabilidade');
    }

    /**
     * Adiciona a aba Dicionário de Seletores
     * Mapeia os passos para os seus respectivos seletores e alternativas capturadas
     * @param {Array} features - Lista de features
     */
    addSelectorsDictionarySheet(features) {
        // Estilos customizados para as células do dicionário (alinhamento no topo melhora leitura de textos grandes)
        const cellStyle = {
            ...STYLES.cellEven,
            alignment: { vertical: 'top', wrapText: true }
        };
        const cellStyleCenter = {
            ...STYLES.cellEven,
            alignment: { horizontal: 'center', vertical: 'top', wrapText: true }
        };

        const headers = [
            { v: 'Feature', s: STYLES.header },
            { v: 'Cenário', s: STYLES.header },
            { v: 'Passo', s: STYLES.header },
            { v: 'Ação', s: STYLES.header },
            { v: 'Elemento Alvo', s: STYLES.header },
            { v: 'Seletor Principal', s: STYLES.header },
            { v: 'Seletores Alternativos', s: STYLES.header }
        ];

        const data = [headers];
        let hasSelectors = false;

        features.forEach(feature => {
            (feature.scenarios || []).forEach(scenario => {
                const interactions = scenario.interactions || [];

                interactions.forEach((interaction, stepIndex) => {
                    // Ignorar passos que não interagem com elementos na tela
                    if (interaction.acao === 'acessa_url' || interaction.acao === 'espera_segundos') return;
                    if (!interaction.cssSelector && !interaction.xpath) return;

                    hasSelectors = true;
                    // Formatar Seletor Principal
                    let mainSelectors = [];
                    if (interaction.cssSelector) mainSelectors.push(`[ CSS ] ${interaction.cssSelector}`);
                    if (interaction.xpath) mainSelectors.push(`[ XPATH ] ${interaction.xpath}`);

                    // Formatar Associados
                    let alternativeSelectors = [];
                    if (interaction.alternativeSelectors && interaction.alternativeSelectors.length > 0) {
                        interaction.alternativeSelectors.forEach(alt => {
                            const par = [];
                            // Adicionar a Estratégia de onde o seletor veio, se existir
                            if (alt.strategy) {
                                par.push(`💡 Estratégia: ${alt.strategy}`);
                            }
                            if (alt.selector) par.push(`[ CSS ] ${alt.selector}`);
                            if (alt.xpath) par.push(`[ XPATH ] ${alt.xpath}`);
                            
                            if (par.length > 0) alternativeSelectors.push(par.join('\n'));
                        });
                    } else if (interaction.xpath && interaction.xpath !== interaction.cssSelector) {
                        alternativeSelectors.push(`[ XPATH ] ${interaction.xpath}`);
                    }
                    // Determinar Ação (usar tradução mais humana do Caderno)
                    const acaoFormatada = this.formatStepText(interaction);

                    // Aumentar o espaçamento visual usando linhas e quebras
                    const separator = '\n\n---------------------------------------\n\n';
                    
                    data.push([
                        { v: feature.name, s: cellStyle },
                        { v: scenario.name, s: cellStyle },
                        { v: `Passo ${stepIndex + 1}`, s: cellStyleCenter },
                        { v: acaoFormatada, s: cellStyle },
                        { v: interaction.nomeElemento || '-', s: cellStyle },
                        { v: mainSelectors.join(separator), s: cellStyle },
                        { v: alternativeSelectors.join(separator) || 'Nenhuma alternativa capturada', s: cellStyle }
                    ]);
                });
            });
        });

        if (!hasSelectors) {
            data.push([{ v: 'Nenhum seletor salvo encontrado nos cenários gravados.', s: cellStyle }]);
        }

        const ws = XLSX.utils.aoa_to_sheet(data);

        // Largura das Colunas - Aumentar drasticamente para os seletores
        ws['!cols'] = [
            { wch: 15 }, // Feature
            { wch: 25 }, // Cenário
            { wch: 10 }, // Passo
            { wch: 35 }, // Ação
            { wch: 20 }, // Elemento Alvo
            { wch: 55 }, // Seletor Principal
            { wch: 80 }  // Seletores Alternativos
        ];

        // Altura dinâmica não é exata no XLSX mas wrapText faz o trabalho. 
        // Vamos dar um padding extra de altura para a primeira linha
        ws['!rows'] = data.map((_, idx) => idx === 0 ? { hpt: 30 } : null);

        // Travar cabeçalho
        ws['!freeze'] = { xSplit: 0, ySplit: 1 };

        XLSX.utils.book_append_sheet(this.workbook, ws, 'Dicionário de Seletores');
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

        // Templates por tipo de ação - Linguagem Natural (Manual de Testes/Instrutivo)
        const templates = {
            // Navegação
            'acessa_url': () => {
                if (stepType === 'Given') {
                    return `Usuário está na página "${element || 'inicial'}"`;
                }
                return `Acessar a URL: ${truncateUrl(value || element)}`;
            },
            'navega': () => `Navegar para a página "${cleanValue(value) || element}"`,

            // Ações de clique
            'clica': () => `Clicar no elemento "${element}"`,

            // Preenchimento
            'preenche': () => `Informar o valor "${cleanValue(value)}" no campo "${element}"`,

            // Seleção
            'seleciona': () => `Selecionar a opção "${cleanValue(value)}" no campo "${element}"`,
            'seleciona_radio': () => `Selecionar a opção "${element}"`,
            'marca_checkbox': () => `Marcar a caixa de seleção "${element}"`,
            'desmarca_checkbox': () => `Desmarcar a caixa de seleção "${element}"`,
            'radio': () => `Selecionar a opção "${element}"`,
            'caixa': () => `Marcar a caixa de seleção "${element}"`,

            // Validações (Then)
            'valida_contem': () => `Verificar se o texto "${cleanValue(value)}" é exibido ${element ? `em "${element}"` : 'na página'}`,
            'valida_nao_contem': () => `Verificar se o texto "${cleanValue(value)}" NÃO é exibido ${element ? `em "${element}"` : 'na página'}`,
            'valida_existe': () => `Verificar se o elemento "${element}" está visível`,
            'valida_nao_existe': () => `Verificar se o elemento "${element}" NÃO está visível`,
            'valida_texto': () => `Verificar se o texto do elemento "${element}" é exatamente "${cleanValue(value)}"`,
            'valida_visivel': () => `Verificar se o elemento "${element}" está presente e visível na tela`,
            'valida_nao_visivel': () => `Verificar se o elemento "${element}" está invisível ou oculto`,

            // Esperas
            'espera_segundos': () => `Aguardar o tempo de ${value || '5'} segundos`,
            'espera_elemento': () => `Aguardar até que o elemento "${element}" fique visível`,
            'espera_nao_existe': () => `Aguardar até que o elemento "${element}" desapareça da tela`,
            'espera_carregamento': () => `Aguardar o carregamento total da página`,

            // Upload
            'upload': () => `Realizar upload do arquivo no campo "${element}"`,

            // Teclas
            'pressiona_enter': () => `Pressionar a tecla ENTER no campo "${element}"`,
            'pressiona_tecla': () => `Pressionar a tecla "${value}" no campo "${element}"`
        };

        // Buscar template ou usar fallback
        if (templates[action]) {
            return templates[action]();
        }

        // Fallback: formatar de forma imperativa/instrutiva
        const actionName = action.replace(/_/g, ' ');
        if (value && element) {
            return `Executar ação de ${this.capitalizeFirst(actionName)} no elemento "${element}" informando o valor "${cleanValue(value)}"`;
        } else if (element) {
            return `Executar ação de ${this.capitalizeFirst(actionName)} no elemento "${element}"`;
        } else if (value) {
            return `Executar ação de ${this.capitalizeFirst(actionName)} com o valor "${cleanValue(value)}"`;
        }
        return `Executar ação de ${this.capitalizeFirst(actionName)}`;
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
