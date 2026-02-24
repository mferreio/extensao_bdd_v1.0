/**
 * Pre-Export Validator
 * Valida completude dos dados antes de iniciar a exportação
 */
import { showConfirmDialog } from '../components/confirm-dialog.js';

/**
 * Valida features e retorna resultado consolidado
 * @param {Array} features - Features selecionadas para exportação
 * @returns {{ errors: string[], warnings: string[], stats: Object }}
 */
export function validateForExport(features) {
    const errors = [];
    const warnings = [];
    const stats = { features: 0, scenarios: 0, steps: 0, emptyScenarios: 0, missingSelectors: 0, emptyNames: 0 };

    if (!features || features.length === 0) {
        errors.push('Nenhuma feature selecionada para exportar.');
        return { errors, warnings, stats };
    }

    stats.features = features.length;

    features.forEach((feature, fi) => {
        const fName = feature.name || `Feature ${fi + 1}`;

        if (!feature.name || feature.name.trim() === '') {
            errors.push(`Feature ${fi + 1}: Nome está vazio.`);
        }

        const scenarios = feature.scenarios || [];
        if (scenarios.length === 0) {
            errors.push(`"${fName}": Nenhum cenário registrado.`);
            return;
        }

        scenarios.forEach((scenario, si) => {
            stats.scenarios++;
            const sName = scenario.name || `Cenário ${si + 1}`;
            const interactions = scenario.interactions || [];

            if (interactions.length === 0) {
                stats.emptyScenarios++;
                warnings.push(`"${fName}" → "${sName}": 0 passos (cenário vazio).`);
                return;
            }

            stats.steps += interactions.length;

            interactions.forEach((inter, ii) => {
                const action = inter.acao || '';
                const needsSelector = !['acessa_url', 'espera_segundos', 'navega'].includes(action);

                if (needsSelector && !inter.cssSelector && !inter.xpathSelector) {
                    stats.missingSelectors++;
                }

                if (needsSelector && (!inter.nomeElemento || inter.nomeElemento.trim() === '')) {
                    stats.emptyNames++;
                }
            });
        });
    });

    // Criar warnings consolidados
    if (stats.emptyScenarios > 0) {
        warnings.push(`${stats.emptyScenarios} cenário(s) sem nenhum passo registrado.`);
    }
    if (stats.missingSelectors > 0) {
        warnings.push(`${stats.missingSelectors} passo(s) sem seletor CSS/XPath (serão gerados automaticamente).`);
    }
    if (stats.emptyNames > 0) {
        warnings.push(`${stats.emptyNames} passo(s) com nome de elemento vazio (serão nomeados automaticamente).`);
    }

    return { errors, warnings, stats };
}

/**
 * Exibe dialog de validação pré-export e retorna Promise<boolean>
 * @param {Array} features - Features selecionadas
 * @returns {Promise<boolean>} true se o usuário quer prosseguir
 */
export function showPreExportValidation(features) {
    return new Promise((resolve) => {
        const { errors, warnings, stats } = validateForExport(features);

        // Se houver erros críticos, bloqueia
        if (errors.length > 0) {
            showConfirmDialog({
                title: '❌ Exportação Bloqueada',
                message: `
                    <p style="margin-bottom:8px"><strong>Erros encontrados:</strong></p>
                    <ul style="color:var(--color-danger);margin-left:16px;margin-bottom:12px">
                        ${errors.map(e => `<li>${e}</li>`).join('')}
                    </ul>
                    <p>Corrija os erros acima antes de exportar.</p>`,
                confirmText: 'Entendi',
                cancelText: 'Fechar',
                type: 'danger',
                onConfirm: () => resolve(false),
                onCancel: () => resolve(false)
            });
            return;
        }

        // Se houver avisos, mostra resumo e pede confirmação
        if (warnings.length > 0) {
            showConfirmDialog({
                title: '⚠️ Verificação Pré-Exportação',
                message: `
                    <p style="margin-bottom:8px"><strong>Resumo:</strong> ${stats.features} feature(s), ${stats.scenarios} cenário(s), ${stats.steps} passo(s)</p>
                    <p style="margin-bottom:8px"><strong>Avisos detectados:</strong></p>
                    <ul style="color:var(--color-warning);margin-left:16px;margin-bottom:12px">
                        ${warnings.map(w => `<li>${w}</li>`).join('')}
                    </ul>
                    <p>Deseja prosseguir mesmo assim?</p>`,
                confirmText: 'Exportar Mesmo Assim',
                cancelText: 'Cancelar',
                type: 'warning',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
            return;
        }

        // Tudo OK — prossegue direto
        resolve(true);
    });
}
