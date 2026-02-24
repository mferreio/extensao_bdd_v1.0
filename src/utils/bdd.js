/**
 * Utilitários para lógica BDD (Behavior Driven Development)
 */

/**
 * Recalcula os steps (Given, When, Then, And) de uma lista de interações
 * baseando-se na ordem e no tipo de ação.
 * 
 * Regras:
 * - A primeira interação é sempre 'Given' (ou pode ser configurada).
 * - 'Given' define o contexto inicial (ex: acessa_url).
 * - 'When' define a ação principal / evento gatilho.
 * - 'Then' define a validação / resultado esperado.
 * - 'And' é usado para continuidades do mesmo tipo de step anterior.
 * 
 * @param {Array} interactions Lista de interações
 * @returns {Array} Lista de interações com steps atualizados
 */
export function recalculateSteps(interactions) {
    if (!interactions || interactions.length === 0) return [];

    const newInteractions = [...interactions];
    let currentContext = 'Given'; // Contexto principal atual (Given, When, Then)

    for (let i = 0; i < newInteractions.length; i++) {
        const interaction = newInteractions[i];
        const action = interaction.acao || '';
        let stepType = 'When'; // Default fallback

        // 1. Determinar o TIPO IDEAL da ação (Base Type)
        if (i === 0) {
            stepType = 'Given';
        } else if (isNavigationAction(action) && currentContext === 'Given') {
            // Se estamos no início e navegamos, continua sendo configuração (Given)
            stepType = 'Given';
        } else if (isValidationAction(action)) {
            stepType = 'Then';
        } else {
            // Ações gerais (clica, preenche, etc) são When
            // Mas se estivermos em Given, mudamos para When
            stepType = 'When';
        }

        // 2. Determinar o RÓTULO FINAL (Display Step)
        // Se o tipo ideal é igual ao contexto atual, usamos 'And' (continuidade)
        // Exceto se for o primeiro item (i=0) ou uma mudança forçosa

        let finalStepLabel = stepType;

        if (interaction.manualStepType) {
            finalStepLabel = interaction.step;
            if (finalStepLabel !== 'And') {
                currentContext = finalStepLabel;
            }
        } else {
            if (stepType === currentContext) {
                if (i > 0) {
                    finalStepLabel = 'And';
                }
            } else {
                // Mudança de contexto (ex: de Given para When, ou When para Then, ou Then de volta para When)
                currentContext = stepType;
                finalStepLabel = stepType;
            }
        }

        newInteractions[i].step = finalStepLabel;
        newInteractions[i].realStepType = stepType; // Preserva o tipo semântico para geração de código (evita @and)
    }

    return newInteractions;
}

/**
 * Verifica se a ação é uma validação
 */
export function isValidationAction(action) {
    return action && (action.startsWith('valida_') || action.startsWith('espera_'));
}

/**
 * Verifica se a ação é de navegação
 */
export function isNavigationAction(action) {
    return action === 'acessa_url' || action === 'navega';
}
