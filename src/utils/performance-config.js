/**
 * Configurações centralizadas para auditoria de Performance (Lighthouse).
 * Mantém constantes isoladas para evitar strings soltas nos generators.
 */

// Thresholds padrão para auditoria Lighthouse
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
    en: (threshold) => `the current page should score at least "${threshold}" on Lighthouse performance audit`,
    // Python / Behave (português)
    pt: (threshold) => `audita performance da pagina com nota minima "${threshold}"`
};

// Label para a UI
export const PERFORMANCE_LABEL = '⚡ Auditar Performance (Lighthouse)';
