/**
 * Configurações centralizadas para monitoramento de Performance.
 * Mantém constantes isoladas para evitar strings soltas nos generators.
 */

// Thresholds padrão para auditoria (mantidos para compatibilidade estrutural)
export const PERFORMANCE_DEFAULTS = {
    threshold: 90,
    categories: {
        performance: 90,
        accessibility: 80,
        'best-practices': 80,
        seo: 70
    }
};

// Ação registrada no sistema
export const PERFORMANCE_ACTION = 'performance_audit';

// Texto Gherkin por idioma do gerador
export const PERFORMANCE_GHERKIN = {
    // Cypress / Playwright (inglês)
    en: (threshold) => `the current page performance should be monitored`,
    // Python / Behave (português)
    pt: (threshold) => `monitora performance da pagina`
};

// Label para a UI
export const PERFORMANCE_LABEL = '⚡ Monitorar Performance';
