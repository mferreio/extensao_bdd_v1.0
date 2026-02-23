/**
 * Utilitário para Massa de Dados em Lote (Bulk Paste)
 * Responsável por parsear, validar e consultar dados colados pelo usuário.
 */

/**
 * Parseia texto colado em um array de strings limpas.
 * Remove linhas vazias e espaços extras.
 * @param {string} text - Texto colado (separado por quebras de linha)
 * @returns {string[]} Array de valores limpos
 */
export function parseBulkData(text) {
    if (!text || typeof text !== 'string') return [];
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

/**
 * Verifica se uma interação possui massa de dados configurada.
 * @param {object} interaction - Objeto de interação
 * @returns {boolean}
 */
export function hasBulkData(interaction) {
    return Array.isArray(interaction.bulkData) && interaction.bulkData.length > 1;
}

/**
 * Conta quantos passos na lista possuem massa de dados e retorna o maior conjunto.
 * @param {object[]} interactions - Lista de interações
 * @returns {{ count: number, maxItems: number }}
 */
export function getBulkStats(interactions) {
    let count = 0;
    let maxItems = 0;

    for (const inter of interactions) {
        if (hasBulkData(inter)) {
            count++;
            maxItems = Math.max(maxItems, inter.bulkData.length);
        }
    }

    return { count, maxItems };
}
