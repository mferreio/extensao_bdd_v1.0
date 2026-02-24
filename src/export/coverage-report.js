/**
 * Coverage Report Generator
 * Gera um relatório de cobertura visual para incluir no README.md exportado
 */

/**
 * Analisa as features e retorna estatísticas de cobertura
 * @param {Array} features - Lista de features com cenários e interações
 * @returns {Object} stats - Estatísticas consolidadas
 */
export function analyzeCoverage(features) {
    const stats = {
        totalFeatures: features.length,
        totalScenarios: 0,
        totalSteps: 0,
        urls: new Set(),
        actionTypes: { navigation: 0, interaction: 0, validation: 0, wait: 0, performance: 0 },
        featureDetails: []
    };

    features.forEach(feature => {
        const scenarios = feature.scenarios || [];
        const featureInfo = {
            name: feature.name,
            scenarioCount: scenarios.length,
            stepCount: 0,
            actions: {}
        };

        scenarios.forEach(scenario => {
            stats.totalScenarios++;
            const interactions = scenario.interactions || [];
            featureInfo.stepCount += interactions.length;
            stats.totalSteps += interactions.length;

            interactions.forEach(interaction => {
                const action = interaction.acao || 'desconhecida';
                featureInfo.actions[action] = (featureInfo.actions[action] || 0) + 1;

                // Coletar URLs
                if (action === 'acessa_url') {
                    const url = interaction.url || interaction.nomeElemento || '';
                    if (url) stats.urls.add(url);
                }

                // Classificar tipo
                if (['acessa_url', 'navega'].includes(action)) stats.actionTypes.navigation++;
                else if (['clica', 'preenche', 'seleciona', 'radio', 'caixa', 'upload', 'login', 'altera'].includes(action)) stats.actionTypes.interaction++;
                else if (action.startsWith('valida_')) stats.actionTypes.validation++;
                else if (action.startsWith('espera_')) stats.actionTypes.wait++;
                else if (action === 'performance_audit') stats.actionTypes.performance++;
            });
        });

        stats.featureDetails.push(featureInfo);
    });

    return stats;
}

/**
 * Gera a seção markdown de cobertura para o README
 * @param {Array} features - Lista de features
 * @returns {string} Markdown formatado com o relatório de cobertura
 */
export function generateCoverageSection(features) {
    const stats = analyzeCoverage(features);
    let md = '';

    // Header do relatório
    md += `## 📊 Relatório de Cobertura\n\n`;
    md += `| Métrica | Valor |\n`;
    md += `|:---|:---|\n`;
    md += `| Features | ${stats.totalFeatures} |\n`;
    md += `| Cenários | ${stats.totalScenarios} |\n`;
    md += `| Steps (Total) | ${stats.totalSteps} |\n`;
    md += `| Páginas Testadas | ${stats.urls.size} |\n\n`;

    // Distribuição de ações
    md += `### Distribuição de Ações\n\n`;
    md += `| Tipo | Qtd | Proporção |\n`;
    md += `|:---|:---|:---|\n`;
    const total = stats.totalSteps || 1;
    const types = [
        ['🔗 Navegação', stats.actionTypes.navigation],
        ['👆 Interação', stats.actionTypes.interaction],
        ['✅ Validação', stats.actionTypes.validation],
        ['⏳ Espera', stats.actionTypes.wait],
        ['⚡ Performance', stats.actionTypes.performance]
    ];
    types.filter(([, v]) => v > 0).forEach(([label, value]) => {
        const pct = ((value / total) * 100).toFixed(0);
        md += `| ${label} | ${value} | ${pct}% |\n`;
    });
    md += '\n';

    // Matriz de cobertura Feature × Cenários
    md += `### Matriz de Cobertura\n\n`;
    md += `| Feature | Cenários | Steps | Ações Utilizadas |\n`;
    md += `|:---|:---|:---|:---|\n`;
    stats.featureDetails.forEach(f => {
        const actions = Object.keys(f.actions).join(', ');
        md += `| ${f.name} | ${f.scenarioCount} | ${f.stepCount} | ${actions} |\n`;
    });
    md += '\n';

    // URLs cobertas
    if (stats.urls.size > 0) {
        md += `### Páginas / URLs Cobertas\n\n`;
        [...stats.urls].forEach(url => {
            md += `- \`${url}\`\n`;
        });
        md += '\n';
    }

    return md;
}
