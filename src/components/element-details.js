// Componente Element Details - Seção inferior com detalhes do elemento selecionado

/**
 * Renderiza os detalhes do elemento selecionado
 * @param {HTMLElement} container - Container onde renderizar
 * @param {object} interaction - Interação selecionada (pode ser null)
 */
export function renderElementDetails(container, interaction) {
    if (!interaction) {
        container.innerHTML = `
            <div class="gherkin-element-details">
                <h4 class="gherkin-element-details__title">Detalhes do Elemento</h4>
                <p class="gherkin-text-muted" style="font-size: 0.85em;">
                    Clique em um passo para ver os detalhes do elemento.
                </p>
            </div>
        `;
        return;
    }

    // Extrair tipo do elemento a partir de informações disponíveis
    const elementType = extractElementType(interaction);
    const elementId = extractElementId(interaction);
    const elementClass = extractElementClass(interaction);
    const elementText = interaction.valorPreenchido || interaction.nomeElemento || '';

    // Gerar código de exemplo
    const codeSnippet = generateCodeSnippet(interaction);

    container.innerHTML = `
        <div class="gherkin-element-details">
            <h4 class="gherkin-element-details__title">Detalhes do Elemento</h4>
            <div class="gherkin-element-details__grid">
                <div class="gherkin-element-details__field">
                    <span class="gherkin-element-details__label">Tipo:</span>
                    <input type="text" class="gherkin-element-details__input" value="${escapeHtml(elementType)}" readonly />
                </div>
                <div class="gherkin-element-details__field">
                    <span class="gherkin-element-details__label">ID:</span>
                    <input type="text" class="gherkin-element-details__input" value="${escapeHtml(elementId)}" readonly />
                </div>
                <div class="gherkin-element-details__field">
                    <span class="gherkin-element-details__label">Classe:</span>
                    <input type="text" class="gherkin-element-details__input" value="${escapeHtml(elementClass)}" readonly />
                </div>
                <div class="gherkin-element-details__field">
                    <span class="gherkin-element-details__label">Texto:</span>
                    <input type="text" class="gherkin-element-details__input" value="${escapeHtml(elementText)}" readonly />
                </div>
            </div>
            ${codeSnippet ? `
            <div class="gherkin-element-details__code" style="position: relative; margin-top: 12px;">
                <code style="display: block; padding-right: 30px;">${escapeHtml(codeSnippet)}</code>
                <button type="button" class="gherkin-btn-icon gherkin-btn-copy-code" data-code="${escapeHtml(codeSnippet)}" title="Copiar Código" style="position: absolute; top: 6px; right: 6px; width: 26px; height: 26px; color: #ecf0f1;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
            </div>
            ` : ''}
        </div>
    `;

    // Add Copy Listener
    const copyBtn = container.querySelector('.gherkin-btn-copy-code');
    if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const code = copyBtn.getAttribute('data-code');
            navigator.clipboard.writeText(code).then(() => {
                const originalSVG = copyBtn.innerHTML;
                copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                setTimeout(() => { if (copyBtn) copyBtn.innerHTML = originalSVG; }, 1200);
            });
        });
    }
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function extractElementType(interaction) {
    if (interaction.elementTag) return interaction.elementTag;
    if (interaction.acao === 'preenche' || interaction.acao === 'altera') return 'input';
    if (interaction.acao === 'seleciona') return 'select';
    if (interaction.acao === 'radio') return 'input[radio]';
    if (interaction.acao === 'caixa') return 'input[checkbox]';
    if (interaction.acao === 'clica') return 'button';
    if (interaction.acao === 'upload') return 'input[file]';
    return 'element';
}

function extractElementId(interaction) {
    // Extrair ID do CSS selector se começar com #
    if (interaction.cssSelector && interaction.cssSelector.startsWith('#')) {
        return interaction.cssSelector.substring(1).split(/[\s.[\]:>+~]/).shift() || '';
    }
    // Tentar extrair do xpath
    if (interaction.xpath) {
        const match = interaction.xpath.match(/@id=["']([^"']+)["']/);
        if (match) return match[1];
    }
    return '';
}

function extractElementClass(interaction) {
    if (interaction.elementClass) return interaction.elementClass;
    // Extrair class do CSS selector se começar com .
    if (interaction.cssSelector) {
        const classMatch = interaction.cssSelector.match(/\.([a-zA-Z0-9_-]+)/g);
        if (classMatch) return classMatch.map(c => c.substring(1)).join(' ');
    }
    return '';
}

function generateCodeSnippet(interaction) {
    const selector = interaction.cssSelector || interaction.xpath;
    if (!selector) return '';

    switch (interaction.acao) {
        case 'preenche':
        case 'altera':
            return `page.fill('${selector}', '${interaction.valorPreenchido || ''}')`;
        case 'clica':
            return `page.click('${selector}')`;
        case 'seleciona':
            return `page.select_option('${selector}', '${interaction.valorPreenchido || ''}')`;
        case 'upload':
            return `page.set_input_files('${selector}', '${interaction.nomeArquivo || ''}')`;
        default:
            return `page.locator('${selector}')`;
    }
}
