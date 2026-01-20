/**
 * Sistema de Temas (Dark/Light Mode)
 * Gerencia tema da aplicação com persistência
 */

const THEME_KEY = 'gherkin-theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.listeners = [];
    this.applyTheme(this.currentTheme);
  }

  /**
   * Carregar tema do localStorage
   */
  loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && Object.values(THEMES).includes(saved)) {
      return saved;
    }
    
    // Detectar preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEMES.DARK;
    }
    
    return THEMES.LIGHT;
  }

  /**
   * Salvar tema no localStorage
   */
  saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  /**
   * Aplicar tema ao documento
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    this.saveTheme(theme);
    
    // Notificar listeners
    this.listeners.forEach(listener => listener(theme));
  }

  /**
   * Toggle entre temas
   */
  toggle() {
    const newTheme = this.currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    this.applyTheme(newTheme);
    return newTheme;
  }

  /**
   * Obter tema atual
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Verificar se está em dark mode
   */
  isDark() {
    return this.currentTheme === THEMES.DARK;
  }

  /**
   * Subscribe para mudanças de tema
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Observar mudanças de preferência do sistema
   */
  watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
        this.applyTheme(newTheme);
      });
    }
  }

  /**
   * Obter variáveis CSS para tema atual
   */
  getCSSVariables() {
    if (this.isDark()) {
      return {
        '--bg-primary': '#1a1a1a',
        '--bg-secondary': '#2d2d2d',
        '--text-primary': '#e0e0e0',
        '--text-secondary': '#b0b0b0',
        '--border-color': '#404040',
        '--color-primary': '#4a9eff',
        '--color-success': '#4caf50',
        '--color-danger': '#f44336',
        '--color-warning': '#ff9800',
        '--color-info': '#2196f3',
        '--shadow': '0 4px 12px rgba(0, 0, 0, 0.5)'
      };
    } else {
      return {
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f5f5f5',
        '--text-primary': '#333333',
        '--text-secondary': '#666666',
        '--border-color': '#dddddd',
        '--color-primary': '#0D47A1',
        '--color-success': '#28A745',
        '--color-danger': '#DC3545',
        '--color-warning': '#FFC107',
        '--color-info': '#17A2B8',
        '--shadow': '0 4px 12px rgba(0, 0, 0, 0.15)'
      };
    }
  }

  /**
   * Aplicar variáveis CSS
   */
  applyCSSVariables() {
    const vars = this.getCSSVariables();
    const root = document.documentElement;
    
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  /**
   * Criar botão de toggle de tema
   */
  createToggleButton() {
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Toggle dark mode');
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: var(--color-primary);
      color: white;
      cursor: pointer;
      box-shadow: var(--shadow);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      transition: transform 0.2s, background 0.2s;
    `;

    const updateIcon = () => {
      button.textContent = this.isDark() ? '☀️' : '🌙';
    };

    updateIcon();

    button.addEventListener('click', () => {
      this.toggle();
      updateIcon();
      button.style.transform = 'scale(0.9)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 200);
    });

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });

    return button;
  }
}

// Singleton
let themeInstance = null;

export function getThemeManager() {
  if (!themeInstance) {
    themeInstance = new ThemeManager();
    themeInstance.applyCSSVariables();
    themeInstance.watchSystemTheme();
  }
  return themeInstance;
}

export { THEMES };
export default ThemeManager;
