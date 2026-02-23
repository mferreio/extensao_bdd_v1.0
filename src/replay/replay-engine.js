/**
 * Motor de Replay Nativo (Dry-Run)
 * Responsável por reproduzir os passos gravados no navegador ativo.
 */

let replayInterval = null;
let currentStore = null;
let isExecuting = false; // Bloqueio (mutex) para evitar execuções simultâneas

export function initReplayEngine(store) {
    currentStore = store;
    
    // Assinar mudanças no store para reagir a plays e stops
    store.subscribe((state, oldState) => {
        const wasReplaying = oldState ? oldState.isReplaying : false;
        
        // Iniciou o replay via UI
        if (state.isReplaying && state.replayStatus === 'running' && !isExecuting) {
            startLoop();
        }
        
        // Parou o replay via UI ou erro
        if (!state.isReplaying || state.replayStatus !== 'running') {
            stopLoop();
        }
    });

    // Boot (sobrevivência à navegação/refresh)
    const initialState = store.getState();
    if (initialState.isReplaying && initialState.replayStatus === 'running') {
        // Aguarda a página terminar de carregar totalmente antes de resumir
        if (document.readyState === 'complete') {
            setTimeout(startLoop, 1000); // pequeno delay para frameworks SPA
        } else {
            window.addEventListener('load', () => setTimeout(startLoop, 1000));
        }
    }
}

function startLoop() {
    if (replayInterval) return;
    isExecuting = false;
    // O loop verifica a cada 300ms se existe um passo a ser feito
    replayInterval = setInterval(processNextStep, 300);
}

function stopLoop() {
    if (replayInterval) {
        clearInterval(replayInterval);
        replayInterval = null;
    }
    isExecuting = false;
}

async function processNextStep() {
    if (isExecuting) return; // Se um passo está rodando asíncronamente (wait), não encavala
    
    if (!currentStore) return;
    const state = currentStore.getState();
    
    if (!state.isReplaying || state.replayStatus !== 'running') {
        stopLoop();
        return;
    }

    const interactions = state.interactions || [];
    const index = state.replayStepIndex;
    const config = state.replayConfig || {};

    // Fim dos passos deste ciclo => verificar se há mais ciclos
    if (index >= interactions.length) {
        const completedRuns = (config.completedRuns || 0) + 1;
        const totalRuns = config.totalRuns || 1;

        // Todos os ciclos concluídos
        if (completedRuns >= totalRuns) {
            currentStore.updateReplayState({
                isReplaying: false,
                replayStatus: 'success',
                replayStepIndex: 0,
                replayConfig: { ...config, completedRuns }
            });
            stopLoop();
            return;
        }

        // Calcular próximo ciclo (dados × repetições)
        let nextDataIndex = (config.currentDataIndex || 0);
        let nextRepeat = (config.currentRepeat || 0);
        
        // Detectar quantos itens de massa existem
        let maxDataItems = 0;
        for (const inter of interactions) {
            if (Array.isArray(inter.bulkData) && inter.bulkData.length > 1) {
                maxDataItems = Math.max(maxDataItems, inter.bulkData.length);
            }
        }

        if (maxDataItems > 0) {
            nextDataIndex++;
            if (nextDataIndex >= maxDataItems) {
                nextDataIndex = 0;
                nextRepeat++;
            }
        } else {
            nextRepeat++;
        }

        // Reiniciar passos para novo ciclo
        currentStore.updateReplayState({
            replayStepIndex: 0,
            replayConfig: {
                ...config,
                currentDataIndex: nextDataIndex,
                currentRepeat: nextRepeat,
                completedRuns
            }
        });
        return; // O próximo tick do interval retomará do passo 0
    }

    isExecuting = true; // Trava o loop
    const step = { ...interactions[index] };

    // Substituir valor pela massa de dados, se configurada
    if (Array.isArray(step.bulkData) && step.bulkData.length > 0) {
        const dataIndex = config.currentDataIndex || 0;
        if (dataIndex < step.bulkData.length) {
            step.valorPreenchido = step.bulkData[dataIndex];
        }
    }

    try {
        await executeAction(step, state.globalTimeout || 10000); // 10s timeout default
        
        // Executou com sucesso. Avançar ponteiro.
        currentStore.updateReplayState({
            replayStepIndex: index + 1
        });
        isExecuting = false; // Libera
        
    } catch (e) {
        // Erro fatal. Interromper.
        const config = currentStore.getState().replayConfig || {};
        currentStore.updateReplayState({
            replayStatus: 'error',
            replayError: `Erro no Passo ${index + 1} (Ciclo ${(config.completedRuns || 0) + 1}/${config.totalRuns || 1}): ${e.message}`
        });
        stopLoop();
        isExecuting = false;
    }
}

/**
 * Resolve o seletor aguardando o elemento aparecer na tela
 */
async function waitForElement(selector, timeoutMs) {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
        const check = () => {
            const el = document.querySelector(selector);
            if (el && isElementVisible(el)) {
                resolve(el);
            } else if (Date.now() - startTime > timeoutMs) {
                reject(new Error(`Timeout de ${timeoutMs}ms expirado para o seletor: ${selector}`));
            } else {
                requestAnimationFrame(check); // Tenta de novo no próximo frame da UI
            }
        };
        check();
    });
}

function isElementVisible(el) {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           window.getComputedStyle(el).visibility !== 'hidden' &&
           window.getComputedStyle(el).display !== 'none';
}

/**
 * Dispara eventos verdadeiros para preenchimento de inputs SPA (Vue, React, Angular)
 */
function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value') ?
                        Object.getOwnPropertyDescriptor(element, 'value').set : null;
    
    // Object prototype para frameworks que interceptam o setter (ex: React)
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value') ?
                                 Object.getOwnPropertyDescriptor(prototype, 'value').set : null;
    
    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
        valueSetter.call(element, value);
    } else {
        element.value = value;
    }
    
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Roteia a execução com base na 'acao' da interação gravada
 */
async function executeAction(interaction, globalTimeout) {
    const { acao, valorPreenchido, cssSelector, xpath } = interaction;
    let fallbackSelector = cssSelector;
    if (!fallbackSelector) {
        // Hack: se não tem CSS, tentar converter xpath pra CSS genérico ou buscar nome
        fallbackSelector = `[name="${interaction.nomeElemento}"]`;
    }

    if (acao === 'acessa_url') {
        const currentUrlBase = window.location.href.split('#')[0];
        const targetUrlBase = valorPreenchido.split('#')[0];
        
        window.location.href = valorPreenchido;

        if (window.location.href === valorPreenchido || currentUrlBase === targetUrlBase) {
            // Soft Navigation (SPA Hash) - the page won't die, so we wait for the transition and proceed
            return new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Hard Navigation - the browser will kill this script context.
        // We set a 5-second absolute safety fallback just in case the navigation drops.
        return new Promise(resolve => setTimeout(resolve, 5000));
    } 
    
    else if (acao === 'espera_segundos') {
        const delay = parseInt(valorPreenchido) * 1000 || 1000;
        return new Promise(r => setTimeout(r, delay));
    }

    // Busca elemento
    const element = await waitForElement(fallbackSelector, globalTimeout);

    // Scroll elemento para viewport
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await new Promise(r => setTimeout(r, 500)); // Tempo visual de scroll

    if (acao === 'clica') {
        element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        element.click(); // nativo
    } 
    else if (acao === 'preenche') {
        element.focus();
        setNativeValue(element, valorPreenchido);
        element.blur();
    }
    else if (acao === 'seleciona') {
        element.focus();
        element.value = valorPreenchido;
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.blur();
    }
    else if (acao === 'valida_existe') {
        // Já lançaria erro no waitForElement se não existisse
        return true; 
    }
    else if (acao === 'valida_contem') {
        const text = element.innerText || element.textContent || element.value || '';
        if (!text.includes(valorPreenchido)) {
            throw new Error(`Elemento não contém o texto visado: "${valorPreenchido}"`);
        }
    }
    
    // Delay natural de 500ms antes do próximo passo
    return new Promise(r => setTimeout(r, 500));
}
