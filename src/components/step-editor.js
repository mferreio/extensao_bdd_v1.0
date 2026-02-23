// Componente Step Editor - Sidebar de edição inline de passos
import { getStore } from '../state/store.js';
import { showFeedback } from '../../utils.js';
import { validateAndHighlightXPath, clearXPathSpotlights } from '../utils/xpath-validator.js';
import { parseBulkData } from '../utils/bulk-data.js';

/**
 * Renderiza o editor de passos na sidebar
 * @param {HTMLElement} container - Container lateral
 * @param {object} interaction - Interação selecionada
 * @param {number} index - Índice da interação
 */
export function renderStepEditor(container, interaction, index) {
    if (!interaction) {
        clearStepEditor(container);
        return;
    }

    const stepOptions = ['Given', 'When', 'Then', 'And'];

    // Mapa de ações com labels
    const ACTION_OPTIONS = [
        { value: 'clica', label: 'Clicar no elemento' },
        { value: 'preenche', label: 'Preencher o campo' },
        { value: 'seleciona', label: 'Selecionar opção' },
        { value: 'radio', label: 'Selecionar radio' },
        { value: 'caixa', label: 'Marcar checkbox' },
        { value: 'upload', label: 'Upload de arquivo' },
        { value: 'navega', label: 'Navegar para' },
        { value: 'acessa_url', label: 'Acessar URL' },
        { value: 'login', label: 'Login' },
        { value: 'altera', label: 'Alterar valor' },
        { value: 'valida_existe', label: 'Validar que existe' },
        { value: 'valida_nao_existe', label: 'Validar que não existe' },
        { value: 'valida_contem', label: 'Validar que contém' },
        { value: 'valida_nao_contem', label: 'Validar que não contém' },
        { value: 'valida_deve_ser', label: 'Validar deve ser' },
        { value: 'espera_segundos', label: 'Esperar segundos' },
        { value: 'espera_elemento', label: 'Esperar elemento' },
    ];

    const stepOptionsHtml = stepOptions.map(s =>
        `<option value="${s}" ${interaction.step === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    const actionOptionsHtml = ACTION_OPTIONS.map(a =>
        `<option value="${a.value}" ${interaction.acao === a.value ? 'selected' : ''}>${a.label}</option>`
    ).join('');

    // XPath alternatives
    const xpathOptions = buildXPathOptions(interaction);

    container.innerHTML = `
        <div class="gherkin-step-editor">
            <div class="gherkin-step-editor__header">
                <h4>Editor de Passos</h4>
                <button id="step-editor-close" class="gherkin-step-editor__close" title="Fechar">✕</button>
            </div>
            <div class="gherkin-step-editor__body">
                <div class="gherkin-step-editor__field">
                    <label>Tipo:</label>
                    <select id="step-editor-type">${stepOptionsHtml}</select>
                </div>
                <div class="gherkin-step-editor__field">
                    <label>Ação:</label>
                    <select id="step-editor-action">${actionOptionsHtml}</select>
                </div>
                <div class="gherkin-step-editor__field">
                    <label>Elemento:</label>
                    <input type="text" id="step-editor-element" value="${escapeHtml(interaction.nomeElemento || '')}" />
                </div>
                ${interaction.valorPreenchido !== undefined ? `
                <div class="gherkin-step-editor__field">
                    <label style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Valor:</span>
                        <button type="button" id="step-editor-bulk-toggle" class="gherkin-btn-icon" title="Massa de dados em lote" style="width: 24px; height: 24px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        </button>
                    </label>
                    <input type="text" id="step-editor-value" value="${escapeHtml(interaction.valorPreenchido || '')}" />
                    <div id="step-editor-bulk-area" class="gherkin-bulk-area" style="display: ${interaction.bulkData && interaction.bulkData.length > 0 ? 'block' : 'none'}; margin-top: 6px;">
                        <textarea id="step-editor-bulk-data" class="gherkin-bulk-textarea" rows="4" placeholder="Cole aqui sua lista (um item por linha)">${interaction.bulkData ? interaction.bulkData.join('\n') : ''}</textarea>
                        <span id="step-editor-bulk-count" class="gherkin-bulk-badge" style="margin-top: 4px; display: inline-block;">${interaction.bulkData && interaction.bulkData.length > 0 ? `📑 ${interaction.bulkData.length} itens carregados` : ''}</span>
                    </div>
                </div>
                ` : ''}
                ${interaction.acao === 'upload' && interaction.nomeArquivo ? `
                <div class="gherkin-step-editor__field">
                    <label>Arquivo:</label>
                    <input type="text" id="step-editor-file" value="${escapeHtml(interaction.nomeArquivo || '')}" />
                </div>
                ` : ''}

                <div class="gherkin-step-editor__divider"></div>

                <div class="gherkin-step-editor__section">
                    <label>Selecione o XPath:</label>
                    <div class="gherkin-xpath-options" id="step-editor-xpath-list">
                        ${xpathOptions}
                    </div>
                    <div class="gherkin-step-editor__field" style="margin-top: 8px;">
                        <label class="gherkin-xpath-custom-label" style="display: flex; justify-content: space-between;">
                            <span>✏ Gerar XPath <em>Personalizado</em></span>
                            <span id="step-editor-xpath-message" style="font-size: 0.75rem; font-weight: 500;"></span>
                        </label>
                        <input type="text" id="step-editor-custom-xpath" 
                               value="${escapeHtml(interaction.xpath || '')}" 
                               placeholder="//div[@id='...']" />
                    </div>
                </div>

                ${buildCodePreview(interaction)}
            </div>
            <div class="gherkin-step-editor__footer">
                <button id="step-editor-save" class="gherkin-btn gherkin-btn-main">Salvar</button>
                <button id="step-editor-cancel" class="gherkin-btn" style="background: #6c757d; color: #fff;">Cancelar</button>
            </div>
        </div>
    `;

    // Attach listeners
    attachStepEditorListeners(container, interaction, index);
}

/**
 * Limpa o step editor (quando nada está selecionado)
 * @param {HTMLElement} container 
 */
export function clearStepEditor(container) {
    clearXPathSpotlights();
    container.innerHTML = `
        <div class="gherkin-step-editor gherkin-step-editor--empty">
            <div class="gherkin-step-editor__placeholder">
                <span style="font-size: 2em;">📝</span>
                <p>Selecione um passo para editar</p>
            </div>
        </div>
    `;
}

// === Helpers internos ===

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildXPathOptions(interaction) {
    const options = [];

    // Opção baseada em ID
    if (interaction.cssSelector && interaction.cssSelector.startsWith('#')) {
        const id = interaction.cssSelector.substring(1);
        options.push({
            label: `//@id="${id}"] (Recomendado)`,
            value: `//*[@id="${id}"]`,
            recommended: true
        });
    }

    // Opção baseada em name
    if (interaction.nomeElemento) {
        options.push({
            label: `//input[@name="${interaction.nomeElemento}"]`,
            value: `//input[@name="${interaction.nomeElemento}"]`,
            recommended: false
        });
    }

    // XPath original
    if (interaction.xpath) {
        const alreadyExists = options.some(o => o.value === interaction.xpath);
        if (!alreadyExists) {
            options.push({
                label: interaction.xpath,
                value: interaction.xpath,
                recommended: false
            });
        }
    }

    // Seletores alternativos (se existirem)
    if (interaction.alternativeSelectors) {
        interaction.alternativeSelectors.forEach(alt => {
            if (alt.xpath && !options.some(o => o.value === alt.xpath)) {
                options.push({
                    label: alt.xpath,
                    value: alt.xpath,
                    recommended: alt.robustness >= 80
                });
            }
        });
    }

    if (options.length === 0) {
        return '<p class="gherkin-text-muted" style="font-size: 0.85em;">Nenhum XPath disponível</p>';
    }

    return options.map((opt, i) => `
        <label class="gherkin-xpath-option ${opt.recommended ? 'gherkin-xpath-option--recommended' : ''}" style="margin-bottom: 6px;">
            <input type="radio" name="step-xpath" value="${escapeHtml(opt.value)}" 
                   ${i === 0 ? 'checked' : ''} />
            <span class="gherkin-xpath-option__check">✔</span>
            <span class="gherkin-xpath-option__text" title="${escapeHtml(opt.label)}">${escapeHtml(opt.label)}</span>
            
            <div class="gherkin-xpath-option__actions">
                <button type="button" class="gherkin-btn-icon gherkin-btn-copy-xpath" data-xpath="${escapeHtml(opt.value)}" title="Copiar XPath">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
                <button type="button" class="gherkin-btn-icon gherkin-btn-test-xpath" data-xpath="${escapeHtml(opt.value)}" title="Localizar este XPath na tela">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                </button>
            </div>
        </label>
    `).join('');
}

function buildCodePreview(interaction) {
    if (!interaction.xpath && !interaction.cssSelector) return '';

    const selector = interaction.cssSelector || interaction.xpath || '';
    let code = '';

    switch (interaction.acao) {
        case 'preenche':
        case 'altera':
            code = `page.fill('${selector}', '${interaction.valorPreenchido || ''}')`;
            break;
        case 'clica':
            code = `page.click('${selector}')`;
            break;
        case 'seleciona':
            code = `page.select_option('${selector}', '${interaction.valorPreenchido || ''}')`;
            break;
        default:
            code = `page.locator('${selector}')`;
    }

    return `
        <div class="gherkin-code-preview">
            <code>${escapeHtml(code)}</code>
        </div>
    `;
}

function attachStepEditorListeners(container, interaction, index) {
    const store = getStore();

    // -- Live Preview Updater --
    const updateLivePreview = () => {
        const previewCodeEl = container.querySelector('.gherkin-code-preview code');
        if (!previewCodeEl) return;

        let currentSelector = interaction.cssSelector || ''; 
        
        const selectedXpath = container.querySelector('input[name="step-xpath"]:checked');
        const customXpath = container.querySelector('#step-editor-custom-xpath');
        
        if (customXpath && customXpath.value.trim()) {
            currentSelector = customXpath.value.trim();
        } else if (selectedXpath && selectedXpath.value) {
            currentSelector = selectedXpath.value;
        }

        let code = '';
        const actionEl = container.querySelector('#step-editor-action');
        const acao = actionEl ? actionEl.value : interaction.acao;
        const valueEl = container.querySelector('#step-editor-value');
        const val = valueEl ? valueEl.value : (interaction.valorPreenchido || '');

        // Generate synthetic export preview string
        switch (acao) {
            case 'preenche':
            case 'altera':
                code = `page.fill('${currentSelector}', '${val}')`;
                break;
            case 'clica':
                code = `page.click('${currentSelector}')`;
                break;
            case 'seleciona':
                code = `page.select_option('${currentSelector}', '${val}')`;
                break;
            default:
                code = `page.locator('${currentSelector}')`;
        }
        
        previewCodeEl.textContent = code;
    };

    // -- Action Listeners --
    const closeBtn = container.querySelector('#step-editor-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => clearStepEditor(container));
    }

    const cancelBtn = container.querySelector('#step-editor-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => clearStepEditor(container));
    }

    // Attach Live Preview to Value/Action changes
    const actionEl = container.querySelector('#step-editor-action');
    if (actionEl) actionEl.addEventListener('change', updateLivePreview);
    const valueEl = container.querySelector('#step-editor-value');
    if (valueEl) valueEl.addEventListener('input', updateLivePreview);

    const saveBtn = container.querySelector('#step-editor-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const updates = {};

            const typeEl = container.querySelector('#step-editor-type');
            if (typeEl) updates.step = typeEl.value;

            const actionEl = container.querySelector('#step-editor-action');
            if (actionEl) {
                updates.acao = actionEl.value;
                const selectedOpt = actionEl.options[actionEl.selectedIndex];
                updates.acaoTexto = selectedOpt ? selectedOpt.text : actionEl.value;
            }

            const elementEl = container.querySelector('#step-editor-element');
            if (elementEl) updates.nomeElemento = elementEl.value.trim();

            const valueEl = container.querySelector('#step-editor-value');
            if (valueEl) updates.valorPreenchido = valueEl.value;

            const fileEl = container.querySelector('#step-editor-file');
            if (fileEl) updates.nomeArquivo = fileEl.value.trim();

            // Bulk Data
            const bulkEl = container.querySelector('#step-editor-bulk-data');
            if (bulkEl) {
                const parsed = parseBulkData(bulkEl.value);
                updates.bulkData = parsed.length > 0 ? parsed : null;
            }

            // XPath selection
            const selectedXpath = container.querySelector('input[name="step-xpath"]:checked');
            const customXpath = container.querySelector('#step-editor-custom-xpath');
            if (customXpath && customXpath.value.trim()) {
                updates.xpath = customXpath.value.trim();
            } else if (selectedXpath) {
                updates.xpath = selectedXpath.value;
            }

            store.updateInteraction(index, updates);
            clearXPathSpotlights();
            showFeedback('Passo atualizado com sucesso!', 'success');
        });
    }

    // Bulk Paste Toggle & Counter
    const bulkToggle = container.querySelector('#step-editor-bulk-toggle');
    const bulkArea = container.querySelector('#step-editor-bulk-area');
    const bulkTextarea = container.querySelector('#step-editor-bulk-data');
    const bulkCount = container.querySelector('#step-editor-bulk-count');

    if (bulkToggle && bulkArea) {
        bulkToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isHidden = bulkArea.style.display === 'none';
            bulkArea.style.display = isHidden ? 'block' : 'none';
        });
    }
    if (bulkTextarea && bulkCount) {
        bulkTextarea.addEventListener('input', () => {
            const items = parseBulkData(bulkTextarea.value);
            bulkCount.textContent = items.length > 0 ? `📑 ${items.length} itens carregados` : '';
        });
    }

    // Live Spotlight Validation
    const customXpathInput = container.querySelector('#step-editor-custom-xpath');
    const xpathMessage = container.querySelector('#step-editor-xpath-message');
    
    if (customXpathInput) {
        customXpathInput.addEventListener('input', (e) => {
            updateLivePreview();
            
            const val = e.target.value;
            const res = validateAndHighlightXPath(val);
            
            if (res.isEmpty) {
                customXpathInput.classList.remove('gherkin-xpath-valid', 'gherkin-xpath-invalid');
                if (xpathMessage) xpathMessage.textContent = '';
                return;
            }
            
            if (res.isValid) {
                customXpathInput.classList.remove('gherkin-xpath-invalid');
                customXpathInput.classList.add('gherkin-xpath-valid');
                if (xpathMessage) {
                    xpathMessage.textContent = res.message;
                    xpathMessage.style.color = 'var(--color-success)';
                }
            } else {
                customXpathInput.classList.remove('gherkin-xpath-valid');
                customXpathInput.classList.add('gherkin-xpath-invalid');
                if (xpathMessage) {
                    xpathMessage.textContent = res.message;
                    xpathMessage.style.color = 'var(--color-danger)';
                }
            }
        });
    }

    // List Options Evaluation and Copy Buttons
    const xpathListOptions = container.querySelector('#step-editor-xpath-list');
    if (xpathListOptions) {
        // Handle radio selection to clear custom field and update preview
        xpathListOptions.addEventListener('change', (e) => {
            if (e.target.name === 'step-xpath') {
                if (customXpathInput) {
                    customXpathInput.value = '';
                    customXpathInput.classList.remove('gherkin-xpath-valid', 'gherkin-xpath-invalid');
                }
                if (xpathMessage) xpathMessage.textContent = '';
                updateLivePreview();
            }
        });

        // Handle buttons
        xpathListOptions.addEventListener('click', (e) => {
            // Localizar botão "Copiar"
            const copyBtn = e.target.closest('.gherkin-btn-copy-xpath');
            if (copyBtn) {
                e.preventDefault();
                e.stopPropagation();
                const xpathStr = copyBtn.getAttribute('data-xpath');
                
                navigator.clipboard.writeText(xpathStr).then(() => {
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                    setTimeout(() => { if (copyBtn) copyBtn.innerHTML = originalHTML; }, 1200);
                }).catch(err => console.warn('Falha ao copiar XPath', err));
                return;
            }

            // Localizar botão "Testar/Spotlight"
            const testBtn = e.target.closest('.gherkin-btn-test-xpath');
            if (testBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const xpathStr = testBtn.getAttribute('data-xpath');
                const res = validateAndHighlightXPath(xpathStr);
                
                if (xpathMessage) {
                    if (res.isValid) {
                        xpathMessage.textContent = res.message;
                        xpathMessage.style.color = 'var(--color-success)';
                    } else {
                        xpathMessage.textContent = res.message;
                        xpathMessage.style.color = 'var(--color-danger)';
                    }
                }
            }
        });
    }
}
