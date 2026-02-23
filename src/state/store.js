import { recalculateSteps } from '../utils/bdd.js';

/**
 * State Management Centralizado
 * Gerencia estado global da aplicação
 */

class Store {
  constructor() {
    this.state = {
      // UI State
      panelState: 'feature', // 'feature', 'cenario', 'gravando', 'exportar'
      isVisible: false, // Controle de visibilidade da UI (Novo)
      isPaused: false,
      isRecording: false,
      isInspecting: false,
      manualInspectionMode: false, // Modo de inspeção manual (para o modal)
      manualInspectionResult: null, // Resultado da inspeção manual

      // Replay State
      isReplaying: false,
      replayStepIndex: 0,
      replayStatus: 'idle', // 'idle', 'running', 'paused', 'success', 'error'
      replayError: null,
      replayConfig: {
          repeatCount: 1,
          currentRepeat: 0,
          currentDataIndex: 0,
          totalRuns: 0,
          completedRuns: 0
      },

      // Data
      features: [],
      currentFeature: null,
      currentScenario: null,
      interactions: [],

      // UI
      selectedAction: 'clica',
      forceClick: false,

      // Timing
      elapsedSeconds: 0,
      startTime: null
    };

    this.listeners = [];
    this.history = [];
    this.historyIndex = -1;
    this.initialized = false;
  }

  /**
   * Inicializa o Store carregando dados do storage
   */
  async init() {
    if (this.initialized) return;
    const loadedState = await this.loadFromStorage();

    // Inicializa histórico com estado inicial
    this.history = [JSON.parse(JSON.stringify(loadedState))];
    this.historyIndex = 0;

    this.initialized = true;
    return this.state;
  }

  /**
   * Subscribe para mudanças de estado
   * @param {function} listener - Callback quando estado muda
   * @returns {function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Atualizar estado
   * @param {object} newState - Novo estado (merge com existente)
   */
  setState(newState) {
    const oldState = JSON.parse(JSON.stringify(this.state));
    const mergedState = { ...this.state, ...newState };

    // Verifica se houve mudança real (opcional, mas bom pra evitar spam no hist)
    if (JSON.stringify(oldState) === JSON.stringify(mergedState)) return;

    this.state = mergedState;

    // Gerenciamento de Histórico (Standard Stack)
    // Remove futuro (se houve undo antes)
    this.history = this.history.slice(0, this.historyIndex + 1);
    // Adiciona novo estado
    this.history.push(JSON.parse(JSON.stringify(this.state)));
    this.historyIndex++;

    // Limita tamanho do histórico (opcional, ex: 50)
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }

    // Notificar listeners
    this.listeners.forEach(listener => {
      listener(this.state, oldState);
    });

    // Persistir
    this.saveToStorage();
  }

  /**
   * Obter estado atual
   * @returns {object} Estado
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Desfazer última ação e navegar para trás no histórico
   */
  undo() {
    if (this.historyIndex > 0) {
      const oldState = JSON.parse(JSON.stringify(this.state));

      this.historyIndex--;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));

      this.listeners.forEach(listener => {
        listener(this.state, oldState);
      });

      this.saveToStorage();
    }
  }

  /**
   * Refazer última ação desfeita (Avançar no histórico)
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      const oldState = JSON.parse(JSON.stringify(this.state));

      this.historyIndex++;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));

      this.listeners.forEach(listener => {
        listener(this.state, oldState);
      });

      this.saveToStorage();
    }
  }

  /**
   * Iniciar feature
   * @param {string} name - Nome da feature
   */
  startFeature(name) {
    this.setState({
      panelState: 'cenario',
      currentFeature: {
        name,
        scenarios: [],
        createdAt: new Date().toISOString()
      }
    });
  }

  /**
   * Iniciar cenário
   * @param {string} name - Nome do cenário
   */
  startScenario(name) {
    this.setState({
      panelState: 'gravando',
      isRecording: true,
      isPaused: false,
      currentScenario: {
        name,
        interactions: [],
        createdAt: new Date().toISOString()
      },
      interactions: [],
      startTime: Date.now(),
      elapsedSeconds: 0
    });

    // Adiciona passo Given: acessa_url se não houver
    const currentUrl = window.location.href;
    this.addInteraction({
      step: 'Given',
      acao: 'acessa_url',
      nomeElemento: 'página inicial',
      valorPreenchido: currentUrl,
      url: currentUrl,
      timestamp: Date.now()
    });
  }

  /**
   * Adicionar interação
   * @param {object} interaction - Interação capturada
   */
  addInteraction(interaction) {
    const { interactions } = this.state;
    // Recalcular steps automaticamente
    const recalculated = recalculateSteps([...interactions, interaction]);

    this.setState({
      interactions: recalculated
    });
  }

  /**
   * Remover interação
   * @param {number} index - Index da interação
   */
  removeInteraction(index) {
    const { interactions } = this.state;
    const newInteractions = interactions.filter((_, i) => i !== index);
    const recalculated = recalculateSteps(newInteractions);

    this.setState({
      interactions: recalculated
    });
  }

  /**
   * Atualizar interação
   * @param {number} index - Index da interação
   * @param {object} updates - Atualizações
   */
  updateInteraction(index, updates) {
    const { interactions } = this.state;
    const newInteractions = [...interactions];
    newInteractions[index] = { ...newInteractions[index], ...updates };
    const recalculated = recalculateSteps(newInteractions);

    this.setState({
      interactions: recalculated
    });
  }

  /**
   * Mover interação de posição
   * @param {number} fromIndex - Índice de origem
   * @param {number} toIndex - Índice de destino
   */
  moveInteraction(fromIndex, toIndex) {
    const { interactions } = this.state;
    if (toIndex < 0 || toIndex >= interactions.length) return;

    const newInteractions = [...interactions];
    const [movedItem] = newInteractions.splice(fromIndex, 1);
    newInteractions.splice(toIndex, 0, movedItem);

    // Recalcular steps após mover
    const recalculated = recalculateSteps(newInteractions);

    this.setState({
      interactions: recalculated
    });
  }

  // ==========================================
  // REPLAY ENGINE STATE MUTATORS
  // ==========================================

  startReplay() {
    this.startReplayWithConfig({ repeatCount: 1 });
  }

  /**
   * Iniciar replay com configuração de repetições e massa
   * @param {{ repeatCount: number }} config
   */
  startReplayWithConfig(config) {
    const { repeatCount = 1 } = config;
    // Detectar massa de dados nos passos
    const interactions = this.state.interactions || [];
    let maxDataItems = 0;
    for (const inter of interactions) {
        if (Array.isArray(inter.bulkData) && inter.bulkData.length > 1) {
            maxDataItems = Math.max(maxDataItems, inter.bulkData.length);
        }
    }
    const dataRuns = maxDataItems > 0 ? maxDataItems : 1;
    const totalRuns = repeatCount * dataRuns;

    this.setState({
      isReplaying: true,
      replayStepIndex: 0,
      replayStatus: 'running',
      replayError: null,
      replayConfig: {
          repeatCount,
          currentRepeat: 0,
          currentDataIndex: 0,
          totalRuns,
          completedRuns: 0
      }
    });
  }

  stopReplay() {
    this.setState({
      isReplaying: false,
      replayStepIndex: 0,
      replayStatus: 'idle',
      replayError: null
    });
  }

  updateReplayState(options) {
    this.setState({
      ...options
    });
  }

  /**
   * Finalizar cenário
   * Agora salva e coloca em estado de decisão (não assume próximo passo)
   */
  finishScenario() {
    const { currentFeature, currentScenario, interactions } = this.state;

    if (currentFeature && currentScenario) {
      // Salva cenário na feature
      const scenarioToSave = {
        ...currentScenario,
        interactions: [...interactions]
      };

      const updatedFeature = {
        ...currentFeature,
        scenarios: [...(currentFeature.scenarios || []), scenarioToSave]
      };

      // Atualiza feature no estado, limpa work area atual e define estado de decisão
      this.setState({
        currentFeature: updatedFeature,
        panelState: 'cenario_finalizado', // Estado intermediário para decisão da UI
        isRecording: false,
        isPaused: false,
        currentScenario: null,
        interactions: [],
        elapsedSeconds: 0,
        startTime: null
      });
    }
  }

  /**
   * Finalizar feature
   * Agora salva e coloca em estado de decisão
   */
  finishFeature() {
    const { currentFeature, features } = this.state;

    if (currentFeature) {
      const updatedFeatures = [...features, currentFeature];

      this.setState({
        features: updatedFeatures,
        panelState: 'feature_finalizada', // Estado intermediário para decisão da UI
        currentFeature: null,
        currentScenario: null, // Garantia
        interactions: []
      });
    }
  }

  /**
   * Funções de fluxo de decisão
   */

  confirmNewScenario() {
    // Usuário escolheu criar NOVO cenário na MESMA feature
    this.setState({
      panelState: 'cenario' // Pede nome do cenário
    });
  }

  confirmNewFeature() {
    // Usuário escolheu criar NOVA feature
    this.setState({
      panelState: 'feature', // Pede nome de feature
      currentFeature: null // Garante limpeza
    });
  }

  stopFeatureCreation() {
    // Usuário não quer mais cenários para esta feature
    this.setState({
      panelState: 'aguardando_finalizacao_feature'
    });
  }


  goToExport() {
    // Usuário finalizou tudo e quer exportar
    this.setState({
      panelState: 'exportar'
    });
  }

  /**
   * Limpar tudo
   */
  clear() {
    this.setState({
      features: [],
      currentFeature: null,
      currentScenario: null,
      interactions: [],
      panelState: 'feature',
      isRecording: false,
      isPaused: false,
      elapsedSeconds: 0
    });
  }

  /**
   * Pausar/Retomar gravação
   */
  togglePause() {
    this.setState({
      isPaused: !this.state.isPaused
    });
  }

  /**
   * Ativar/Desativar inspeção
   */
  toggleInspect() {
    this.setState({
      isInspecting: !this.state.isInspecting
    });
  }

  /**
   * Iniciar inspeção manual (para o modal)
   */
  startManualInspection() {
    this.setState({
      isInspecting: true,
      manualInspectionMode: true,
      manualInspectionResult: null,
      isVisible: false // Esconde o painel para facilitar inspeção
    });
  }

  /**
   * Finalizar inspeção manual com resultado
   */
  finishManualInspection(result) {
    this.setState({
      isInspecting: false,
      manualInspectionMode: false,
      manualInspectionResult: result,
      isVisible: true // Mostra o painel novamente
    });
  }

  /**
   * Alternar visibilidade da UI
   */
  toggleVisibility() {
    this.setState({
      isVisible: !this.state.isVisible
    });
  }

  /**
   * Persistir estado no chrome.storage
   */
  saveToStorage() {
    try {
      // Salvar estado, exceto isVisible (controle de sessão) e isInspecting
      // Assim, ao abrir nova aba, começa oculta a menos que esteja gravando
      // eslint-disable-next-line no-unused-vars
      const { isVisible, isInspecting, manualInspectionMode, ...stateToSave } = this.state;

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ 'gherkin-state': stateToSave }, () => {
          if (chrome.runtime.lastError) {
            console.warn('Erro ao salvar no storage:', chrome.runtime.lastError);
          }
        });
      }
    } catch (e) {
      console.warn('Erro ao salvar estado:', e);
    }
  }

  /**
   * Carregar estado do chrome.storage
   */
  async loadFromStorage() {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['gherkin-state'], (result) => {
            if (result['gherkin-state']) {
              this.state = { ...this.state, ...result['gherkin-state'] };

              // Garante que a UI esteja visível se estiver gravando ou pausado
              if (this.state.isRecording ||
                (this.state.currentFeature && this.state.currentFeature.scenarios && this.state.currentFeature.scenarios.length > 0) ||
                this.state.panelState !== 'feature') {
                this.state.isVisible = true;
              }
            }
            resolve(this.state);
          });
        } else {
          resolve(this.state);
        }
      } catch (e) {
        console.warn('Erro ao carregar estado:', e);
        resolve(this.state);
      }
    });
  }

  /**
   * Exportar features
   * @param {array} indexes - Índices das features a exportar
   * @returns {array} Features selecionadas
   */
  exportFeatures(indexes) {
    return indexes.map(idx => this.state.features[idx]).filter(Boolean);
  }

  /**
   * Limpar localStorage
   */
  clearStorage() {
    localStorage.removeItem('gherkin-state');
  }
}

// Singleton
let storeInstance = null;

/**
 * Obter instância do store
 * @returns {Store} Instância do store
 */
export function getStore() {
  if (!storeInstance) {
    storeInstance = new Store();

    // Expor globalmente para compatibilidade com código antigo
    window.gherkinStore = storeInstance;
  }
  return storeInstance;
}

/**
 * Resetar store (para testes)
 */
export function resetStore() {
  storeInstance = null;
}

export default Store;
