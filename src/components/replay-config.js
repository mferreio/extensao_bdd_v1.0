/**
 * Modal de Configuração do Replay (Repetições + Massa)
 * Exibido antes de iniciar o Replay para configurar loops.
 */
import { getStore } from '../state/store.js';
import { getBulkStats } from '../utils/bulk-data.js';

/**
 * Exibe o modal de configuração do replay.
 * @param {HTMLElement} panelContainer - Container do painel principal
 * @param {object[]} interactions - Lista de interações atuais
 */
export function showReplayConfig(panelContainer, interactions) {
    // Remover modal existente se houver
    const existing = panelContainer.querySelector('.gherkin-replay-config-overlay');
    if (existing) existing.remove();

    const stats = getBulkStats(interactions);
    const hasMassa = stats.maxItems > 0;
    const dataRuns = hasMassa ? stats.maxItems : 1;

    const overlay = document.createElement('div');
    overlay.className = 'gherkin-replay-config-overlay';
    overlay.innerHTML = `
        <div class="gherkin-replay-config">
            <h4 class="gherkin-replay-config__title">⚙ Configurar Execução</h4>

            <div class="gherkin-replay-config__field">
                <label>Repetições:</label>
                <input type="number" id="replay-repeat-count" min="1" max="999" value="1" 
                       style="width: 70px; text-align: center;" />
            </div>

            ${hasMassa ? `
            <div class="gherkin-replay-config__info">
                <span class="gherkin-bulk-badge">📑 ${stats.maxItems} itens de massa detectados</span>
                <span class="gherkin-text-muted" style="font-size: 0.78rem;">em ${stats.count} passo(s)</span>
            </div>
            ` : `
            <div class="gherkin-replay-config__info">
                <span class="gherkin-text-muted" style="font-size: 0.82rem;">Nenhuma massa de dados configurada.</span>
            </div>
            `}

            <div class="gherkin-replay-config__total">
                Total de execuções: <strong id="replay-total-runs">${dataRuns}</strong>
            </div>

            <div class="gherkin-replay-config__actions">
                <button id="replay-config-start" class="gherkin-btn gherkin-btn-main">▶ Iniciar</button>
                <button id="replay-config-cancel" class="gherkin-btn" style="background: #6c757d; color: #fff;">Cancelar</button>
            </div>
        </div>
    `;

    panelContainer.appendChild(overlay);

    // --- Listeners ---
    const repeatInput = overlay.querySelector('#replay-repeat-count');
    const totalDisplay = overlay.querySelector('#replay-total-runs');

    const updateTotal = () => {
        const repeat = Math.max(1, parseInt(repeatInput.value) || 1);
        totalDisplay.textContent = repeat * dataRuns;
    };

    repeatInput.addEventListener('input', updateTotal);

    overlay.querySelector('#replay-config-cancel').addEventListener('click', () => {
        overlay.remove();
    });

    overlay.querySelector('#replay-config-start').addEventListener('click', () => {
        const repeatCount = Math.max(1, parseInt(repeatInput.value) || 1);
        overlay.remove();

        const store = getStore();
        store.startReplayWithConfig({ repeatCount });
    });

    // Fechar ao clicar no fundo
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}
