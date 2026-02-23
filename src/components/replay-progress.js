/**
 * Componente de Progresso do Replay
 * Exibe barra de progresso, ciclo atual e resumo ao final.
 */

/**
 * Gera o HTML da barra de progresso do Replay.
 * @param {object} state - Estado atual do store
 * @returns {string} HTML string
 */
export function renderReplayProgress(state) {
    const { isReplaying, replayStatus, replayStepIndex, replayError, replayConfig } = state;
    const interactions = state.interactions || [];
    const config = replayConfig || {};

    // Replay concluído com sucesso → Resumo
    if (!isReplaying && replayStatus === 'success' && config.totalRuns > 0) {
        const totalSteps = config.totalRuns * interactions.length;
        return `
            <div class="gherkin-replay-progress gherkin-replay-progress--success">
                <div class="gherkin-replay-progress__icon">✅</div>
                <div class="gherkin-replay-progress__info">
                    <strong>Replay Concluído</strong>
                    <span>${config.completedRuns}/${config.totalRuns} ciclo(s) executado(s) · ${totalSteps} passos processados</span>
                </div>
                <button class="gherkin-btn-icon gherkin-replay-dismiss" title="Fechar" style="width: 24px; height: 24px;">✕</button>
            </div>
        `;
    }

    // Replay com erro → Resumo de erro
    if (replayStatus === 'error') {
        return `
            <div class="gherkin-replay-progress gherkin-replay-progress--error">
                <div class="gherkin-replay-progress__icon">❌</div>
                <div class="gherkin-replay-progress__info">
                    <strong>Erro no Replay</strong>
                    <span>${replayError || 'Erro desconhecido'}</span>
                </div>
                <button class="gherkin-btn-icon gherkin-replay-dismiss" title="Fechar" style="width: 24px; height: 24px;">✕</button>
            </div>
        `;
    }

    // Replay em andamento → Barra de progresso
    if (isReplaying && replayStatus === 'running') {
        const totalSteps = interactions.length;
        const stepProgress = totalSteps > 0 ? Math.round((replayStepIndex / totalSteps) * 100) : 0;
        const cycleLabel = config.totalRuns > 1
            ? `Ciclo ${(config.completedRuns || 0) + 1}/${config.totalRuns}`
            : '';
        const stepLabel = `Passo ${replayStepIndex + 1}/${totalSteps}`;

        return `
            <div class="gherkin-replay-progress gherkin-replay-progress--running">
                <div class="gherkin-replay-progress__bar-container">
                    <div class="gherkin-replay-progress__bar" style="width: ${stepProgress}%"></div>
                </div>
                <div class="gherkin-replay-progress__info">
                    <span>▶ Reproduzindo...  ${stepLabel}${cycleLabel ? '  |  ' + cycleLabel : ''}</span>
                </div>
            </div>
        `;
    }

    return '';
}

/**
 * Anexa listener de dismiss ao botão de fechar do progresso.
 * @param {HTMLElement} container - Container do progresso
 */
export function attachReplayProgressListeners(container) {
    const dismissBtn = container.querySelector('.gherkin-replay-dismiss');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            const progressEl = dismissBtn.closest('.gherkin-replay-progress');
            if (progressEl) progressEl.remove();
        });
    }
}
