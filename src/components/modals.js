// Modais da extensão
import { showConfirmDialog } from './confirm-dialog.js';
import { getStore } from '../state/store.js';
import { showFeedback } from '../../utils.js';

// Cache para utils importados dinamicamente
let domUtils = null;

async function getDomUtils() {
    if (!domUtils) {
        domUtils = await import('../utils/dom.js');
    }
    return domUtils;
}

export function showModal(message, onYes, onNo) {
    // Usar novo showConfirmDialog em vez do antigo sistema modal
    return showConfirmDialog({
        title: 'Confirmação',
        message: message,
        buttons: {
            confirm: { text: 'Sim', variant: 'default' },
            cancel: { text: 'Não', variant: 'default' }
        },
        onConfirm: onYes,
        onCancel: onNo
    });
}

export function showUploadModal(nomeElemento, cssSelector, xpath, callback) {
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();

    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.className = 'gherkin-modal-bg';

    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content';

    const title = document.createElement('h3');
    title.textContent = 'Upload de Arquivo';
    title.className = 'gherkin-modal-title';
    modal.appendChild(title);

    const label = document.createElement('label');
    label.textContent = 'Nome do Arquivo:';
    label.className = 'gherkin-label';
    modal.appendChild(label);

    const fileInput = document.createElement('input');
    fileInput.type = 'text';
    fileInput.placeholder = 'ex: documento.pdf';
    // Estilo global de input será aplicado automaticamente
    modal.appendChild(fileInput);

    const btns = document.createElement('div');
    btns.className = 'gherkin-modal-footer';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Salvar';
    saveBtn.className = 'gherkin-btn gherkin-btn-main';
    saveBtn.onclick = () => {
        const nomeArquivo = fileInput.value.trim();
        if (!nomeArquivo) {
            alert('Por favor, informe o nome do arquivo de exemplo.');
            return;
        }

        const store = getStore();
        store.addInteraction({
            step: 'When',
            acao: 'upload',
            acaoTexto: 'Upload arquivo',
            nomeElemento: nomeElemento,
            nomeArquivo: nomeArquivo,
            cssSelector: cssSelector,
            xpath: xpath,
            timestamp: Date.now()
        });

        modalBg.remove();
        if (typeof callback === 'function') callback(nomeArquivo);
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.className = 'gherkin-btn gherkin-btn-danger';
    cancelBtn.onclick = () => modalBg.remove();

    btns.appendChild(saveBtn);
    btns.appendChild(cancelBtn);
    modal.appendChild(btns);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);

    setTimeout(() => fileInput.focus(), 50);
}

export function showLoginModal() {
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();

    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.className = 'gherkin-modal-bg';

    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content';

    const title = document.createElement('h3');
    title.className = 'gherkin-modal-title gherkin-justify-center';
    title.innerHTML = '<span style="font-size: 1.2em; margin-right: 8px;">🔑</span>Marcar ação como Login';
    modal.appendChild(title);

    // Container Usuário
    const userContainer = document.createElement('div');
    userContainer.className = 'gherkin-flex-col gherkin-gap-xs';

    const userLabel = document.createElement('label');
    userLabel.textContent = 'Usuário/Email';
    userLabel.className = 'gherkin-label';
    userContainer.appendChild(userLabel);

    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.placeholder = 'Digite seu usuário ou email';
    userInput.className = 'gherkin-w-full';
    userContainer.appendChild(userInput);
    modal.appendChild(userContainer);

    // Container Senha
    const passContainer = document.createElement('div');
    passContainer.className = 'gherkin-flex-col gherkin-gap-xs';

    const passLabel = document.createElement('label');
    passLabel.textContent = 'Senha';
    passLabel.className = 'gherkin-label';
    passContainer.appendChild(passLabel);

    const passInput = document.createElement('input');
    passInput.type = 'password';
    passInput.placeholder = 'Digite sua senha';
    passInput.className = 'gherkin-w-full';
    passContainer.appendChild(passInput);
    modal.appendChild(passContainer);

    // Footer Buttons
    const btns = document.createElement('div');
    btns.className = 'gherkin-modal-footer';

    const saveBtn = document.createElement('button');
    saveBtn.innerHTML = '✓ Salvar Login';
    saveBtn.className = 'gherkin-btn gherkin-btn-main gherkin-flex-1';

    saveBtn.onclick = () => {
        const usuario = userInput.value.trim();
        const senha = passInput.value;
        if (!usuario || !senha) {
            alert('Por favor, preencha usuário e senha.');
            return;
        }

        const store = getStore();
        store.addInteraction({
            step: 'Given',
            acao: 'login',
            acaoTexto: 'Login',
            nomeElemento: usuario,
            valorPreenchido: senha,
            timestamp: Date.now()
        });

        modalBg.remove();
        showFeedback('Ação de login registrada!', 'success');
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.className = 'gherkin-btn gherkin-btn-danger';
    cancelBtn.onclick = () => modalBg.remove();

    btns.appendChild(saveBtn);
    btns.appendChild(cancelBtn);
    modal.appendChild(btns);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);

    setTimeout(() => userInput.focus(), 50);
}

export function showLogDetailsModal(interaction) {
    // Remove modal antigo se existir
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();

    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.className = 'gherkin-modal-bg';

    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content gherkin-flex-col gherkin-gap-md';
    modal.style.maxHeight = '80vh'; // Add overflow handling explicitly if needed, though class might handle it
    modal.style.overflowY = 'auto';

    // ACTION_META local para evitar importação circular
    const ACTION_META = {
        clica: { icon: '🖱️', color: '#007bff', label: 'Clicar' },
        preenche: { icon: '⌨️', color: '#28a745', label: 'Preencher' },
        seleciona: { icon: '☑️', color: '#17a2b8', label: 'Selecionar' },
        upload: { icon: '📎', color: '#f39c12', label: 'Upload' },
        login: { icon: '🔑', color: '#8e44ad', label: 'Login' },
        espera_segundos: { icon: '⏲️', color: '#ffc107', label: 'Esperar' },
        espera_elemento: { icon: '⏳', color: '#0070f3', label: 'Esperar elemento' },
        espera_nao_existe: { icon: '🚫', color: '#e74c3c', label: 'Esperar sumir' },
        acessa_url: { icon: '🌐', color: '#0070f3', label: 'Acessar URL' },
        altera: { icon: '✏️', color: '#6c757d', label: 'Alterar' },
        radio: { icon: '🔘', color: '#6c757d', label: 'Radio' },
        caixa: { icon: '☑️', color: '#6c757d', label: 'Caixa' },
        valida_existe: { icon: '✅', color: '#218838', label: 'Validar existe' },
        valida_nao_existe: { icon: '❌', color: '#e74c3c', label: 'Validar não existe' },
        valida_contem: { icon: '🔍', color: '#007bff', label: 'Validar contém' },
        valida_nao_contem: { icon: '🚫', color: '#e74c3c', label: 'Validar não contém' },
        valida_deve_ser: { icon: '✔️', color: '#218838', label: 'Validar deve ser' },
        valida_nao_deve_ser: { icon: '❌', color: '#e74c3c', label: 'Validar não deve ser' },
    };

    const meta = ACTION_META[interaction.acao] || {};
    const title = document.createElement('h3');
    title.className = 'gherkin-modal-title';
    title.innerHTML = `<span style="font-size:1.3em;color:${meta.color || '#222'}">${meta.icon || ''}</span> <b>${meta.label || interaction.acao}</b> <span class="gherkin-text-muted" style="font-weight:normal; font-size: 0.9em;">(${interaction.step})</span>`;
    modal.appendChild(title);

    const details = [
        ['Nome do elemento', interaction.nomeElemento || '', '📌'],
        ['Valor preenchido', interaction.valorPreenchido || interaction.nomeArquivo || '', '✏️'],
        ['Selector CSS', interaction.cssSelector || '', '🎨'],
        ['XPath', interaction.xpath || '', '📍'],
        ['Timestamp', interaction.timestamp ? new Date(interaction.timestamp).toLocaleString() : '', '🕒'],
        ['Texto do passo', interaction.stepText || '', '📝'],
    ];

    const listContainer = document.createElement('div');
    listContainer.className = 'gherkin-flex-col gherkin-gap-xs gherkin-w-full';

    details.forEach(([label, value, icon]) => {
        if (value) {
            const row = document.createElement('div');
            row.className = 'gherkin-list-item';
            row.style.lineBreak = 'anywhere';
            row.style.alignItems = 'flex-start'; // Alinha topo para textos longos

            // Container do Label + Icone
            const labelContainer = document.createElement('div');
            labelContainer.style.minWidth = '140px';
            labelContainer.style.flexShrink = '0';
            labelContainer.innerHTML = `<span style="margin-right:4px">${icon}</span> <b>${label}:</b>`;

            // Container do Valor
            const valueContainer = document.createElement('div');
            valueContainer.className = 'gherkin-code';
            valueContainer.style.flex = '1';
            valueContainer.style.margin = '0 8px';
            valueContainer.textContent = value;

            // Botão de Copiar (Apenas se o valor não for timestamp/texto simples curto)
            const actionsContainer = document.createElement('div');
            if (label !== 'Timestamp') {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'gherkin-btn-icon';
                copyBtn.style.padding = '4px';
                copyBtn.title = 'Copiar';
                copyBtn.innerHTML = '📋';
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(value);
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = '✅';
                    setTimeout(() => copyBtn.innerHTML = originalHTML, 2000);
                };
                actionsContainer.appendChild(copyBtn);
            }

            row.appendChild(labelContainer);
            row.appendChild(valueContainer);
            row.appendChild(actionsContainer);
            listContainer.appendChild(row);
        }
    });
    modal.appendChild(listContainer);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'gherkin-modal-footer';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Fechar';
    closeBtn.className = 'gherkin-btn gherkin-btn-main';
    closeBtn.onclick = () => modalBg.remove();

    footer.appendChild(closeBtn);
    modal.appendChild(footer);

    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

export function showEditModal(idx) {
    const store = getStore();
    const interaction = store.getState().interactions[idx];
    if (!interaction) return;

    // Remove modal antigo se existir
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();

    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.className = 'gherkin-modal-bg';

    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content gherkin-flex-col gherkin-gap-sm';
    modal.style.maxHeight = '90vh';
    modal.style.overflowY = 'auto';

    // Título
    const title = document.createElement('h3');
    title.textContent = 'Editar interação';
    title.className = 'gherkin-modal-title gherkin-text-center';
    modal.appendChild(title);

    // Wrapper para os campos para manter espaçamento consistente
    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'gherkin-flex-col gherkin-gap-sm';

    // Campo passo (Given, When, Then)
    const stepLabel = document.createElement('label');
    stepLabel.textContent = 'Passo BDD:';
    stepLabel.className = 'gherkin-label';
    fieldsContainer.appendChild(stepLabel);

    const stepSelect = document.createElement('select');
    stepSelect.className = 'gherkin-w-full';

    ['Given', 'When', 'Then', 'And'].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (interaction.step === opt) option.selected = true;
        stepSelect.appendChild(option);
    });
    fieldsContainer.appendChild(stepSelect);

    // Campo ação
    const actionLabel = document.createElement('label');
    actionLabel.textContent = 'Ação:';
    actionLabel.className = 'gherkin-label';
    fieldsContainer.appendChild(actionLabel);

    let actionSelect;
    if (interaction.acao === 'acessa_url') {
        // Para o passo inicial, exibe o valor fixo e desabilita edição
        actionSelect = document.createElement('input');
        actionSelect.type = 'text';
        actionSelect.value = 'acessa_url';
        actionSelect.disabled = true;
        actionSelect.className = 'gherkin-w-full';
    } else {
        actionSelect = document.createElement('select');
        actionSelect.className = 'gherkin-w-full';

        // Opções iguais ao painel
        const mainActionSelect = document.getElementById('gherkin-action-select');
        if (mainActionSelect && mainActionSelect.innerHTML.trim()) {
            actionSelect.innerHTML = mainActionSelect.innerHTML;
        } else {
            actionSelect.innerHTML = '<option value="clica">Clicar</option>';
        }
        actionSelect.value = interaction.acao;
    }
    fieldsContainer.appendChild(actionSelect);

    // Campo nome do elemento
    const nomeLabel = document.createElement('label');
    nomeLabel.textContent = 'Nome do elemento:';
    nomeLabel.className = 'gherkin-label';
    fieldsContainer.appendChild(nomeLabel);

    const nomeInput = document.createElement('input');
    nomeInput.type = 'text';
    nomeInput.value = interaction.nomeElemento || '';
    nomeInput.className = 'gherkin-w-full';
    fieldsContainer.appendChild(nomeInput);

    // Campo nome do arquivo (apenas para upload)
    let fileInput = null;
    if (interaction.acao === 'upload') {
        const fileLabel = document.createElement('label');
        fileLabel.textContent = 'Nome do arquivo de exemplo:';
        fileLabel.className = 'gherkin-label';
        fieldsContainer.appendChild(fileLabel);

        fileInput = document.createElement('input');
        fileInput.type = 'text';
        fileInput.value = interaction.nomeArquivo || '';
        fileInput.className = 'gherkin-w-full';
        fieldsContainer.appendChild(fileInput);
    }

    // Campo valor preenchido (apenas para ação preenche)
    let valorPreenchidoInput = null;
    if (interaction.acao === 'preenche') {
        const valorLabel = document.createElement('label');
        valorLabel.textContent = 'Valor preenchido:';
        valorLabel.className = 'gherkin-label';
        fieldsContainer.appendChild(valorLabel);

        valorPreenchidoInput = document.createElement('input');
        valorPreenchidoInput.type = 'text';
        valorPreenchidoInput.value = typeof interaction.valorPreenchido !== 'undefined' ? interaction.valorPreenchido : '';
        valorPreenchidoInput.className = 'gherkin-w-full';
        valorPreenchidoInput.autocomplete = 'off';
        fieldsContainer.appendChild(valorPreenchidoInput);
    }

    modal.appendChild(fieldsContainer);

    // Botões
    const btns = document.createElement('div');
    btns.className = 'gherkin-modal-footer';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Salvar';
    saveBtn.className = 'gherkin-btn gherkin-btn-main gherkin-flex-1';
    saveBtn.onclick = () => {
        const updates = {
            step: stepSelect.value,
            nomeElemento: nomeInput.value.trim() || interaction.nomeElemento
        };

        if (interaction.acao === 'acessa_url') {
            updates.acao = 'acessa_url';
            updates.acaoTexto = 'Acessa';
        } else {
            updates.acao = actionSelect.value;
            // Protege contra opção indefinida
            const selectedOption = actionSelect.options ? actionSelect.options[actionSelect.selectedIndex] : null;
            updates.acaoTexto = selectedOption ? selectedOption.text : actionSelect.value;
        }

        if (interaction.acao === 'upload' && fileInput) {
            updates.nomeArquivo = fileInput.value.trim() || interaction.nomeArquivo;
        }

        if (interaction.acao === 'preenche' && valorPreenchidoInput) {
            updates.valorPreenchido = valorPreenchidoInput.value;
        }

        store.updateInteraction(idx, updates);
        modalBg.remove();
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.className = 'gherkin-btn gherkin-btn-danger gherkin-flex-1';
    cancelBtn.onclick = () => modalBg.remove();

    btns.appendChild(saveBtn);
    btns.appendChild(cancelBtn);
    modal.appendChild(btns);

    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

export function showXPathModal(xpath, cssSelector = null, elementInfo = null) {
    // Remove modal antigo se existir
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();

    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.className = 'gherkin-modal-bg';

    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content gherkin-flex-col gherkin-gap-md';
    modal.style.maxWidth = '750px';
    modal.style.maxHeight = '95vh';
    modal.style.overflowY = 'auto';

    // Título
    const title = document.createElement('h3');
    title.textContent = 'Seletores do elemento';
    title.className = 'gherkin-modal-title gherkin-text-center';
    modal.appendChild(title);

    // Verificação de URL
    if (elementInfo && elementInfo.acao === 'acessa_url') {
        const warning = document.createElement('div');
        warning.className = 'gherkin-badge gherkin-badge-warning gherkin-p-md gherkin-text-center';
        warning.innerHTML = '🌐 <b>Ação de Navegação (URL)</b><br>Seletores CSS/XPath não se aplicam a esta ação.';
        modal.appendChild(warning);

        modalBg.appendChild(modal);
        document.body.appendChild(modalBg);

        // Footer com botão fechar
        const footer = document.createElement('div');
        footer.className = 'gherkin-modal-footer gherkin-mt-auto';
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Fechar';
        closeBtn.className = 'gherkin-btn gherkin-btn-main';
        closeBtn.onclick = () => modalBg.remove();
        footer.appendChild(closeBtn);
        modal.appendChild(footer);
        return;
    }

    // Se houver informações sobre validação e robustez, mostra
    if (elementInfo && elementInfo.robustness) {
        const infoContainer = document.createElement('div');
        infoContainer.className = 'gherkin-w-full gherkin-mb-sm';

        // ... (restante da lógica de robustez se existir) ...
        const robustnessDiv = document.createElement('div');
        robustnessDiv.className = 'gherkin-box gherkin-text-sm';

        if (elementInfo.robustness.css) {
            const css = elementInfo.robustness.css;
            const cssRobustness = document.createElement('div');
            cssRobustness.innerHTML = `
                <strong>CSS:</strong> 
                ${css.isUnique ? '✅ Único' : '❌ Não único'} | 
                ${css.isStable ? '✅ Estável' : '❌ Instável'} | 
                Especificidade: ${css.specificity}
            `;
            cssRobustness.className = 'gherkin-mb-xs';
            robustnessDiv.appendChild(cssRobustness);
        }

        if (elementInfo.robustness.xpath) {
            const xpathVal = elementInfo.robustness.xpath;
            const xpathRobustness = document.createElement('div');
            xpathRobustness.innerHTML = `
                <strong>XPath:</strong> 
                ${xpathVal.isUnique ? '✅ Único' : '❌ Não único'} | 
                ${xpathVal.isStable ? '✅ Estável' : '❌ Instável'}
            `;
            robustnessDiv.appendChild(xpathRobustness);
        }

        infoContainer.appendChild(robustnessDiv);
        modal.appendChild(infoContainer);
    } else if (!xpath && !cssSelector) {
        // Caso sem seletores disponíveis (e não é URL)
        const noSelectors = document.createElement('div');
        noSelectors.className = 'gherkin-alert gherkin-alert-info gherkin-text-center';
        noSelectors.textContent = 'Nenhum seletor salvo para esta interação.';
        modal.appendChild(noSelectors);
    }

    // CSS Selector (se fornecido)
    if (cssSelector) {
        const cssLabel = document.createElement('div');
        cssLabel.textContent = 'CSS Selector:';
        cssLabel.className = 'gherkin-label';
        modal.appendChild(cssLabel);

        const cssBox = document.createElement('textarea');
        cssBox.value = cssSelector;
        cssBox.readOnly = true;
        cssBox.className = 'gherkin-input gherkin-code gherkin-w-full';
        cssBox.style.height = '60px';
        modal.appendChild(cssBox);
    }

    // Seletores alternativos
    if (elementInfo && elementInfo.alternativeSelectors && elementInfo.alternativeSelectors.length > 0) {
        const altLabel = document.createElement('div');
        altLabel.innerHTML = '⚡ Sugestões Alternativas:';
        altLabel.className = 'gherkin-label gherkin-mt-md';
        modal.appendChild(altLabel);

        const alternativesContainer = document.createElement('div');
        alternativesContainer.className = 'gherkin-flex-col gherkin-gap-sm';
        alternativesContainer.style.maxHeight = '250px';
        alternativesContainer.style.overflowY = 'auto';

        elementInfo.alternativeSelectors.forEach((alt, index) => {
            const altDiv = document.createElement('div');
            altDiv.className = 'gherkin-list-item gherkin-flex-col';

            const badge = document.createElement('div');
            badge.className = 'gherkin-badge gherkin-mb-xs';
            badge.style.width = 'fit-content';

            if (alt.robustness >= 80) {
                badge.className += ' gherkin-badge-success';
                badge.textContent = `${alt.robustness}% ⭐⭐⭐`;
            } else if (alt.robustness >= 60) {
                badge.className += ' gherkin-badge-warning';
                badge.textContent = `${alt.robustness}% ⭐⭐`;
            } else {
                badge.className += ' gherkin-badge-danger';
                badge.textContent = `${alt.robustness}% ⭐`;
            }
            altDiv.appendChild(badge);

            const strategySpan = document.createElement('div');
            strategySpan.textContent = `#${alt.rank} - ${alt.strategy}`;
            strategySpan.className = 'gherkin-font-bold gherkin-text-sm gherkin-text-primary gherkin-mb-xs';
            altDiv.appendChild(strategySpan);

            const descDiv = document.createElement('div');
            descDiv.textContent = alt.description;
            descDiv.className = 'gherkin-text-muted gherkin-text-xs gherkin-mb-sm';
            altDiv.appendChild(descDiv);

            if (alt.selector) {
                const selLabel = document.createElement('div');
                selLabel.textContent = 'CSS:';
                selLabel.className = 'gherkin-text-xs gherkin-font-bold';
                altDiv.appendChild(selLabel);

                const selCode = document.createElement('code');
                selCode.textContent = alt.selector;
                selCode.className = 'gherkin-code gherkin-block gherkin-word-break gherkin-mb-xs';
                altDiv.appendChild(selCode);
            }

            if (alt.xpath) {
                const xpathLabel = document.createElement('div');
                xpathLabel.textContent = 'XPath:';
                xpathLabel.className = 'gherkin-text-xs gherkin-font-bold';
                altDiv.appendChild(xpathLabel);

                const xpathCode = document.createElement('code');
                xpathCode.textContent = alt.xpath;
                xpathCode.className = 'gherkin-code gherkin-block gherkin-word-break';
                altDiv.appendChild(xpathCode);
            }

            // Buttons
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'gherkin-flex gherkin-gap-xs gherkin-mt-sm gherkin-flex-wrap';

            const testBtn = document.createElement('button');
            testBtn.textContent = 'Testar & Destacar';
            testBtn.className = 'gherkin-btn gherkin-btn-secondary gherkin-text-xs';
            testBtn.style.padding = '4px 8px';

            const statusSpan = document.createElement('span');
            statusSpan.className = 'gherkin-badge';
            statusSpan.style.display = 'none';

            testBtn.onclick = async () => {
                const domUtils = await getDomUtils();
                domUtils.removeAllHighlights();
                testBtn.textContent = 'Testando...';
                testBtn.disabled = true;

                const selectorToTest = alt.selector || alt.xpath;
                const selectorType = alt.selector ? 'css' : 'xpath';

                try {
                    const result = domUtils.testAndHighlightSelector(selectorToTest, selectorType);
                    statusSpan.textContent = `${result.statusIcon} ${result.count}`;
                    statusSpan.style.background = result.statusColor + '20';
                    statusSpan.style.color = result.statusColor;
                    statusSpan.style.border = `1px solid ${result.statusColor}`;
                    statusSpan.style.display = 'inline-flex';

                    testBtn.textContent = 'Testar & Destacar';
                    testBtn.disabled = false;
                } catch (error) {
                    statusSpan.textContent = '💥 Erro';
                    statusSpan.className = 'gherkin-badge gherkin-badge-danger';
                    statusSpan.style.display = 'inline-flex';
                    testBtn.textContent = 'Testar & Destacar';
                    testBtn.disabled = false;
                }
            };
            actionsDiv.appendChild(testBtn);
            actionsDiv.appendChild(statusSpan);

            if (alt.selector) {
                const copyBtn = document.createElement('button');
                copyBtn.textContent = 'Copiar CSS';
                copyBtn.className = 'gherkin-btn gherkin-btn-info gherkin-text-xs';
                copyBtn.style.padding = '4px 8px';
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(alt.selector).then(() => {
                        copyBtn.textContent = 'Copiado!';
                        setTimeout(() => copyBtn.textContent = 'Copiar CSS', 1500);
                    });
                };
                actionsDiv.appendChild(copyBtn);
            }

            if (alt.xpath) {
                const copyXpathBtn = document.createElement('button');
                copyXpathBtn.textContent = 'Copiar XPath';
                copyXpathBtn.className = 'gherkin-btn gherkin-btn-success gherkin-text-xs';
                copyXpathBtn.style.padding = '4px 8px';
                copyXpathBtn.onclick = () => {
                    navigator.clipboard.writeText(alt.xpath).then(() => {
                        copyXpathBtn.textContent = 'Copiado!';
                        setTimeout(() => copyXpathBtn.textContent = 'Copiar XPath', 1500);
                    });
                };
                actionsDiv.appendChild(copyXpathBtn);
            }
            altDiv.appendChild(actionsDiv);
            alternativesContainer.appendChild(altDiv);
        });
        modal.appendChild(alternativesContainer);
    }

    // XPath Principal
    const xpathLabel = document.createElement('div');
    xpathLabel.textContent = 'XPath Principal:';
    xpathLabel.className = 'gherkin-label gherkin-mt-md';
    modal.appendChild(xpathLabel);

    const xpathBox = document.createElement('textarea');
    xpathBox.value = xpath || 'XPath não disponível';
    xpathBox.readOnly = true;
    xpathBox.className = 'gherkin-input gherkin-code gherkin-w-full';
    xpathBox.style.height = '80px';
    modal.appendChild(xpathBox);

    // Botões de ação principais
    const actionBtns = document.createElement('div');
    actionBtns.className = 'gherkin-modal-footer gherkin-justify-center gherkin-mt-md';

    // Botão de teste para seletores principais
    const testMainBtn = document.createElement('button');
    testMainBtn.textContent = '🧪 Testar';
    testMainBtn.className = 'gherkin-btn gherkin-btn-secondary';

    // Status dos seletores principais
    const mainStatusDiv = document.createElement('div');
    mainStatusDiv.className = 'gherkin-text-center gherkin-text-xs gherkin-mt-xs';
    mainStatusDiv.style.display = 'none';

    testMainBtn.onclick = async () => {
        testMainBtn.textContent = '🔄 Testando...';
        testMainBtn.disabled = true;

        const domUtils = await getDomUtils();
        domUtils.removeAllHighlights();

        try {
            const results = [];

            // Testa CSS Selector
            if (cssSelector) {
                const cssResult = domUtils.testSelectorInRealTime(cssSelector, 'css');
                results.push({ type: 'CSS', result: cssResult });

                // Destaca elementos encontrados
                if (cssResult.elements.length > 0) {
                    domUtils.highlightElements(cssResult.elements, cssResult.statusColor);
                }
            }

            // Testa XPath (apenas se diferente do CSS)
            if (xpath && xpath !== cssSelector) {
                const xpathResult = domUtils.testSelectorInRealTime(xpath, 'xpath');
                results.push({ type: 'XPath', result: xpathResult });

                // Se não temos elementos CSS ou XPath encontrou elementos diferentes
                if (!cssSelector || xpathResult.elements.length > 0) {
                    domUtils.highlightElements(xpathResult.elements, xpathResult.statusColor);
                }
            }

            // Exibe resultados
            mainStatusDiv.innerHTML = results.map(({ type, result }) =>
                `<span style="color: ${result.statusColor}; margin-right: 12px; font-weight:bold;">
                    ${result.statusIcon} ${type}: ${result.count} elemento(s) - ${result.status}
                </span>`
            ).join('');
            mainStatusDiv.style.display = 'block';

            testMainBtn.textContent = '🧪 Testar Seletores';
            testMainBtn.disabled = false;

        } catch (error) {
            console.error('Erro ao testar seletores principais:', error);
            mainStatusDiv.innerHTML = '<span class="gherkin-text-danger">💥 Erro ao testar seletores</span>';
            mainStatusDiv.style.display = 'block';

            testMainBtn.textContent = '🧪 Testar Seletores';
            testMainBtn.disabled = false;
        }
    };

    actionBtns.appendChild(testMainBtn);

    // Botão para limpar highlights
    const clearHighlightsBtn = document.createElement('button');
    clearHighlightsBtn.textContent = '🧹 Limpar';
    clearHighlightsBtn.className = 'gherkin-btn gherkin-btn-danger';
    clearHighlightsBtn.onclick = async () => {
        const domUtils = await getDomUtils();
        domUtils.removeAllHighlights();
        mainStatusDiv.style.display = 'none';
    };
    actionBtns.appendChild(clearHighlightsBtn);

    // Botão copiar CSS
    if (cssSelector) {
        const copyCssBtn = document.createElement('button');
        copyCssBtn.textContent = 'Copiar CSS';
        copyCssBtn.className = 'gherkin-btn gherkin-btn-info';
        copyCssBtn.onclick = () => {
            navigator.clipboard.writeText(cssSelector).then(() => {
                copyCssBtn.textContent = 'Copiado!';
                setTimeout(() => copyCssBtn.textContent = 'Copiar CSS', 2000);
            });
        };
        actionBtns.appendChild(copyCssBtn);
    }

    // Botão copiar XPath
    const copyXpathBtn = document.createElement('button');
    copyXpathBtn.textContent = 'Copiar XPath';
    copyXpathBtn.className = 'gherkin-btn gherkin-btn-success';
    copyXpathBtn.onclick = () => {
        navigator.clipboard.writeText(xpath || '').then(() => {
            copyXpathBtn.textContent = 'Copiado!';
            setTimeout(() => copyXpathBtn.textContent = 'Copiar XPath', 2000);
        });
    };
    actionBtns.appendChild(copyXpathBtn);

    // Botão fechar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Fechar';
    closeBtn.className = 'gherkin-btn gherkin-btn-main';
    closeBtn.onclick = async () => {
        // Remove highlights ao fechar
        const domUtils = await getDomUtils();
        domUtils.removeAllHighlights();
        modalBg.remove();
    };
    actionBtns.appendChild(closeBtn);

    modal.appendChild(actionBtns);
    modal.appendChild(mainStatusDiv);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

export function showPostExportModal(onCloseExtension, onContinue) {
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();

    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.className = 'gherkin-modal-bg';
    modalBg.style.zIndex = '10002'; // Acima do painel

    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content';
    modal.style.textAlign = 'center';
    modal.style.maxWidth = '400px';

    const icon = document.createElement('div');
    icon.innerHTML = '🚀';
    icon.style.fontSize = '3em';
    icon.style.marginBottom = '16px';
    modal.appendChild(icon);

    const title = document.createElement('h3');
    title.textContent = 'Projeto Exportado com Sucesso!';
    title.className = 'gherkin-modal-title gherkin-justify-center';
    modal.appendChild(title);

    const text = document.createElement('p');
    text.textContent = 'O que você deseja fazer agora?';
    text.className = 'gherkin-text-muted gherkin-mb-lg';
    modal.appendChild(text);

    const btns = document.createElement('div');
    btns.className = 'gherkin-flex-col gherkin-gap-sm';

    // Botão Encerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Encerrar Extensão';
    closeBtn.className = 'gherkin-btn gherkin-btn-danger gherkin-w-full';
    closeBtn.style.padding = '12px';
    closeBtn.onclick = () => {
        modalBg.remove();
        if (onCloseExtension) onCloseExtension();
    };
    btns.appendChild(closeBtn);

    // Botão Continuar
    const continueBtn = document.createElement('button');
    continueBtn.textContent = 'Continuar na Extensão';
    continueBtn.className = 'gherkin-btn gherkin-btn-secondary gherkin-w-full';
    continueBtn.style.padding = '12px';
    continueBtn.onclick = () => {
        modalBg.remove();
        if (onContinue) onContinue();
    };
    btns.appendChild(continueBtn);

    modal.appendChild(btns);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

