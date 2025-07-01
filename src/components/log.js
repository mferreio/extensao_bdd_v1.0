// Gerenciamento do log de interações
import { showModal, showLogDetailsModal, showEditModal, showXPathModal } from './modals.js';
import { downloadFile, showFeedback } from '../../utils.js';

// Função para exportar logs
export function exportLog(format = 'csv') {
    const data = window.interactions || [];
    if (!data.length) {
        showFeedback('Nenhum log para exportar!', 'error');
        return;
    }
    let content = '';
    if (format === 'csv') {
        content = 'Gherkin,Ação,Elemento,Valor,Timestamp,Selector,XPath\n' +
            data.map(i =>
                [
                    i.step,
                    (ACTION_META[i.acao]?.label || i.acao),
                    `"${i.nomeElemento || ''}"`,
                    `"${i.valorPreenchido || i.nomeArquivo || ''}"`,
                    i.timestamp || '',
                    `"${i.cssSelector || ''}"`,
                    `"${i.xpath || ''}"`
                ].join(',')
            ).join('\n');
        downloadFile('gherkin_log.csv', content);
    } else if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        downloadFile('gherkin_log.json', content);
    } else if (format === 'md') {
        content = '| Gherkin | Ação | Elemento | Valor | Timestamp |\n|---|---|---|---|---|\n' +
            data.map(i =>
                `| ${i.step} | ${(ACTION_META[i.acao]?.label || i.acao)} | ${i.nomeElemento || ''} | ${i.valorPreenchido || i.nomeArquivo || ''} | ${i.timestamp || ''} |`
            ).join('\n');
        downloadFile('gherkin_log.md', content);
    }
    showFeedback('Log exportado com sucesso!');
}

// Função para exportar seletores organizados
export function exportSelectors() {
    const data = window.interactions || [];
    if (!data.length) {
        showFeedback('Nenhum seletor para exportar!', 'error');
        return;
    }
    
    // Organizar seletores por elemento
    const selectorMap = new Map();
    
    data.forEach((interaction, index) => {
        if (interaction.cssSelector || interaction.xpath) {
            const elementKey = interaction.nomeElemento || `Elemento_${index + 1}`;
            const acao = ACTION_META[interaction.acao]?.label || interaction.acao;
            
            if (!selectorMap.has(elementKey)) {
                selectorMap.set(elementKey, {
                    elemento: elementKey,
                    acao: acao,
                    cssSelector: interaction.cssSelector || '',
                    xpath: interaction.xpath || '',
                    url: interaction.url || window.location.href,
                    timestamp: interaction.timestamp,
                    step: interaction.step
                });
            }
        }
    });
    
    if (selectorMap.size === 0) {
        showFeedback('Nenhum seletor encontrado para exportar!', 'error');
        return;
    }
    
    // Gerar conteúdo em formato estruturado
    const selectors = Array.from(selectorMap.values());
    
    // Criar JSON estruturado
    const exportData = {
        metadata: {
            feature: window.currentFeature?.name || 'Feature não definida',
            scenario: window.currentCenario?.name || 'Cenário não definido',
            url: window.location.href,
            exportDate: new Date().toISOString(),
            totalSelectors: selectors.length
        },
        selectors: selectors.map((sel, idx) => ({
            id: idx + 1,
            elemento: sel.elemento,
            acao: sel.acao,
            step: sel.step,
            seletores: {
                css: sel.cssSelector,
                xpath: sel.xpath
            },
            contexto: {
                url: sel.url,
                timestamp: sel.timestamp
            }
        }))
    };
    
    // Gerar também em formato CSV para facilitar análise
    const csvContent = 'ID,Elemento,Ação,Step,CSS Selector,XPath,URL,Timestamp\n' +
        selectors.map((sel, idx) => [
            idx + 1,
            `"${sel.elemento}"`,
            `"${sel.acao}"`,
            `"${sel.step}"`,
            `"${sel.cssSelector}"`,
            `"${sel.xpath}"`,
            `"${sel.url}"`,
            sel.timestamp || ''
        ].join(',')).join('\n');
    
    // Gerar em formato Markdown para documentação
    const mdContent = `# Seletores Capturados
    
## Informações Gerais
- **Feature:** ${exportData.metadata.feature}
- **Cenário:** ${exportData.metadata.scenario}
- **URL:** ${exportData.metadata.url}
- **Data de Exportação:** ${new Date(exportData.metadata.exportDate).toLocaleString('pt-BR')}
- **Total de Seletores:** ${exportData.metadata.totalSelectors}

## Seletores

| ID | Elemento | Ação | Step | CSS Selector | XPath |
|---|---|---|---|---|---|
${selectors.map((sel, idx) => 
    `| ${idx + 1} | ${sel.elemento} | ${sel.acao} | ${sel.step} | \`${sel.cssSelector}\` | \`${sel.xpath}\` |`
).join('\n')}

---
*Exportado em ${new Date().toLocaleString('pt-BR')}*
`;
    
    // Baixar todos os formatos
    downloadFile('seletores.json', JSON.stringify(exportData, null, 2));
    downloadFile('seletores.csv', csvContent);
    downloadFile('seletores.md', mdContent);
    
    showFeedback(`${selectors.length} seletores exportados em 3 formatos (JSON, CSV, Markdown)!`, 'success');
}

// Menu de ações rápidas
function buildActionMenu(interaction, idx) {
    const menu = document.createElement('div');
    menu.style.background = '#fff';
    menu.style.border = '1px solid #ccc';
    menu.style.borderRadius = '8px';
    menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    menu.style.minWidth = '160px';
    menu.style.padding = '8px 0';
    menu.style.fontSize = '14px';
    menu.style.fontFamily = 'Roboto, Arial, sans-serif';

    const actions = [
        { icon: '✏️', label: 'Editar', action: () => showEditModal(idx) },
        { icon: '📋', label: 'Duplicar', action: () => {
            const newInteraction = { ...interaction, timestamp: Date.now() };
            window.interactions.splice(idx + 1, 0, newInteraction);
            if (typeof window.saveInteractionsToStorage === 'function') window.saveInteractionsToStorage();
            if (typeof window.renderLogWithActions === 'function') window.renderLogWithActions();
        }},
        { icon: '🗑️', label: 'Excluir', action: () => {
            showModal('Deseja excluir esta interação?', () => {
                window.interactions.splice(idx, 1);
                if (typeof window.saveInteractionsToStorage === 'function') window.saveInteractionsToStorage();
                if (typeof window.renderLogWithActions === 'function') window.renderLogWithActions();
            });
        }},
        { icon: '📊', label: 'Ver XPath', action: () => showXPathModal(interaction.xpath, interaction.cssSelector, interaction) }
    ];

    actions.forEach(actionItem => {
        const item = document.createElement('div');
        item.style.padding = '8px 16px';
        item.style.cursor = 'pointer';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '8px';
        item.style.transition = 'background 0.2s';
        
        item.innerHTML = `<span>${actionItem.icon}</span><span>${actionItem.label}</span>`;
        
        item.onmouseenter = () => item.style.background = '#f5f5f5';
        item.onmouseleave = () => item.style.background = '';
        
        item.onclick = (e) => {
            e.stopPropagation();
            menu.remove();
            actionItem.action();
        };
        
        menu.appendChild(item);
    });

    return menu;
}

// Ícones e cores para cada ação
export const ACTION_META = {
    clica:      { icon: '🖱️', color: '#007bff', label: 'Clicar' },
    preenche:   { icon: '⌨️', color: '#28a745', label: 'Preencher' },
    seleciona:  { icon: '☑️', color: '#17a2b8', label: 'Selecionar' },
    upload:     { icon: '📎', color: '#f39c12', label: 'Upload' },
    login:      { icon: '🔑', color: '#8e44ad', label: 'Login' },
    espera_segundos: { icon: '⏲️', color: '#ffc107', label: 'Esperar' },
    espera_elemento: { icon: '⏳', color: '#0070f3', label: 'Esperar elemento' },
    espera_nao_existe: { icon: '🚫', color: '#e74c3c', label: 'Esperar sumir' },
    acessa_url: { icon: '🌐', color: '#0070f3', label: 'Acessar URL' },
    altera:     { icon: '✏️', color: '#6c757d', label: 'Alterar' },
    radio:      { icon: '🔘', color: '#6c757d', label: 'Radio' },
    caixa:      { icon: '☑️', color: '#6c757d', label: 'Caixa' },
    valida_existe: { icon: '✅', color: '#218838', label: 'Validar existe' },
    valida_nao_existe: { icon: '❌', color: '#e74c3c', label: 'Validar não existe' },
    valida_contem: { icon: '🔍', color: '#007bff', label: 'Validar contém' },
    valida_nao_contem: { icon: '🚫', color: '#e74c3c', label: 'Validar não contém' },
    valida_deve_ser: { icon: '✔️', color: '#218838', label: 'Validar deve ser' },
    valida_nao_deve_ser: { icon: '❌', color: '#e74c3c', label: 'Validar não deve ser' },
};

export function renderLogWithActions() {
    const log = document.getElementById('gherkin-log');
    if (!log) return;
    log.innerHTML = '';

    // Wrapper da tabela: ocupa todo o espaço disponível do log
    const tableWrap = document.createElement('div');
    tableWrap.style.flex = '1 1 auto';
    tableWrap.style.display = 'flex';
    tableWrap.style.flexDirection = 'column';
    tableWrap.style.overflow = 'hidden';
    tableWrap.style.width = '100%';
    tableWrap.style.minHeight = '0';
    tableWrap.style.background = '#fff';
    tableWrap.tabIndex = 0;

    // Container para rolagem da tabela
    const scrollContainer = document.createElement('div');
    scrollContainer.style.flex = '1 1 auto';
    scrollContainer.style.overflowX = 'auto';
    scrollContainer.style.overflowY = 'auto';
    scrollContainer.style.width = '100%';
    scrollContainer.style.minHeight = '0';
    scrollContainer.style.background = '#fff';

    // Tabela ocupa largura mínima para não cortar colunas e fica "fixa" dentro do scrollContainer
    const table = document.createElement('table');
    table.className = 'gherkin-log-table';
    table.style.width = '100%';
    table.style.minWidth = '700px';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '13px';
    table.style.background = '#fff';

    // Cabeçalho
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th style="min-width:60px;">Gherkin</th>
            <th style="min-width:80px;">Ação</th>
            <th style="min-width:120px;">Elemento</th>
            <th style="min-width:100px;">Valor</th>
        </tr>
    `;
    table.appendChild(thead);

    // Corpo da tabela
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    // Renderiza todas as interações (sem filtro)
    function renderRows() {
        tbody.innerHTML = '';
        let filtered = window.interactions || [];

        if (!filtered.length) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 4;
            td.textContent = 'Nenhuma interação encontrada.';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        // Aplicar a regra correta dos steps BDD
        if (filtered.length > 0) {
            filtered = [...filtered]; // Criar uma cópia para não modificar o original
            
            // Aplicar a regra: 1º = Given, último = Then, demais = When
            for (let i = 0; i < filtered.length; i++) {
                if (i === 0) {
                    // Primeiro step é sempre "Given"
                    filtered[i] = {
                        ...filtered[i],
                        step: 'Given'
                    };
                } else if (i === filtered.length - 1) {
                    // Último step é sempre "Then"
                    filtered[i] = {
                        ...filtered[i],
                        step: 'Then'
                    };
                } else {
                    // Steps intermediários são "When"
                    filtered[i] = {
                        ...filtered[i],
                        step: 'When'
                    };
                }
            }
        }

        filtered.forEach((i, idx) => {
            const tr = document.createElement('tr');
            tr.tabIndex = 0;
            tr.setAttribute('role', 'button');
            tr.setAttribute('aria-label', `Ver detalhes da interação ${idx + 1}`);
            tr.style.cursor = 'pointer';
            tr.style.transition = 'background 0.15s';
            tr.onmouseenter = () => tr.style.background = '#f7faff';
            tr.onmouseleave = () => tr.style.background = '';
            tr.onfocus = () => tr.style.background = '#e3f2fd';
            tr.onblur = () => tr.style.background = '';

            // Gherkin
            const tdStep = document.createElement('td');
            tdStep.textContent = i.step || '';
            tdStep.style.fontWeight = 'bold';
            tdStep.style.color = '#0070f3';
            tdStep.style.textAlign = 'center';
            tr.appendChild(tdStep);

            // Ação
            const tdAcao = document.createElement('td');
            const meta = ACTION_META[i.acao] || {};
            tdAcao.innerHTML = `<span style="font-size:1.2em;margin-right:4px;color:${meta.color || '#222'}">${meta.icon || ''}</span>${meta.label || i.acao}`;
            tr.appendChild(tdAcao);

            // Elemento
            const tdElem = document.createElement('td');
            // Exibe apenas o texto visível se estiver presente no nomeElemento (separado por |)
            if (i.nomeElemento && i.nomeElemento.includes('|')) {
                const partes = i.nomeElemento.split('|');
                // Mostra o texto do elemento (após o pipe)
                tdElem.textContent = partes[1].trim();
            } else {
                tdElem.textContent = i.nomeElemento || '';
            }
            tdElem.style.fontFamily = 'inherit';
            tr.appendChild(tdElem);

            // Valor preenchido (nova coluna)
            const tdValor = document.createElement('td');
            if (i.acao === 'preenche') {
                tdValor.textContent = i.valorPreenchido || '';
            } else if (i.acao === 'upload') {
                tdValor.textContent = i.nomeArquivo || '';
            } else if (i.acao === 'login') {
                tdValor.textContent = i.valorPreenchido || '';
            } else {
                tdValor.textContent = '';
            }
            tr.appendChild(tdValor);

            // Adiciona menu de contexto ao clicar com o botão direito
            tr.oncontextmenu = (e) => {
                e.preventDefault();
                const existingMenu = document.querySelector('.gherkin-context-menu');
                if (existingMenu) {
                    existingMenu.remove();
                }

                const menu = buildActionMenu(i, idx);
                menu.classList.add('gherkin-context-menu');
                menu.style.position = 'fixed';
                menu.style.top = `${e.clientY}px`;
                menu.style.left = `${e.clientX}px`;
                menu.style.zIndex = 10005; // Garante que o menu fique sobre outros elementos
                document.body.appendChild(menu);

                const closeMenu = (event) => {
                    if (!menu.contains(event.target)) {
                        menu.remove();
                        document.removeEventListener('click', closeMenu);
                        document.removeEventListener('contextmenu', closeMenu);
                    }
                };

                setTimeout(() => {
                    document.addEventListener('click', closeMenu);
                    document.addEventListener('contextmenu', closeMenu, { once: true });
                }, 0);
            };

            // Expansão por linha (teclado)
            tr.onclick = () => showLogDetailsModal(i);
            tr.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    showLogDetailsModal(i);
                    e.preventDefault();
                }
            };

            tbody.appendChild(tr);
        });
    }

    renderRows();
    scrollContainer.appendChild(table);
    tableWrap.appendChild(scrollContainer);
    log.appendChild(tableWrap);

    // Sempre rola para o final ao adicionar novo log
    setTimeout(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }, 0);
    
    // Atualizar contador de ações na barra de status
    if (typeof window.updateActionsCounter === 'function') {
        window.updateActionsCounter();
    }

    // Estilo responsivo e barra de rolagem horizontal fixa e customizada
    if (!document.getElementById('gherkin-log-table-style')) {
        const style = document.createElement('style');
        style.id = 'gherkin-log-table-style';
    style.innerHTML = `
/* Container principal do painel de log */
#gherkin-log {
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
    min-height: 220px;
    background: #f9f9f9;
    padding: 0;
    margin: 0;
}
#gherkin-log > div {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    background: #fff;
}
#gherkin-log .gherkin-log-table-scroll {
    flex: 1 1 auto;
    overflow-x: auto;
    overflow-y: auto;
    min-height: 0;
    background: #fff;
    /* Barra de rolagem sempre visível */
    scrollbar-width: thin;
    scrollbar-color: #007bff #f9f9f9;
}
#gherkin-log .gherkin-log-table-scroll::-webkit-scrollbar {
    height: 12px;
    background: #f9f9f9;
}
#gherkin-log .gherkin-log-table-scroll::-webkit-scrollbar-thumb {
    background: #007bff;
    border-radius: 6px;
    min-width: 40px;
}
#gherkin-log .gherkin-log-table-scroll::-webkit-scrollbar-thumb:hover {
    background: #005bb5;
}
#gherkin-log .gherkin-log-table-scroll::-webkit-scrollbar-corner {
    background: #f9f9f9;
}
.gherkin-log-table th, .gherkin-log-table td {
    padding: 6px 8px;
    border-bottom: 1px solid #e0e6ed;
    text-align: left;
    background: #fff;
    white-space: nowrap;
    max-width: 340px;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 38px !important;
    min-height: 38px !important;
    line-height: 38px !important;
    vertical-align: middle !important;
}
.gherkin-log-table th {
    background: #f7faff;
    position: sticky;
    top: 0;
    z-index: 1;
}
.gherkin-log-table tr:focus {
    outline: 2px solid #1976d2;
    outline-offset: 1px;
}
.gherkin-log-table {
    width: 100%;
    min-width: 700px;
    background: #fff;
}
@media (max-width: 900px) {
    .gherkin-log-table th, .gherkin-log-table td { font-size: 12px; }
    .gherkin-log-table { min-width: 520px; }
}
@media (max-width: 700px) {
    .gherkin-log-table th, .gherkin-log-table td { font-size: 11px; }
    .gherkin-log-table { min-width: 400px; }
}
`;
        document.head.appendChild(style);
    }

    // Adiciona eventos para os botões "Limpar" e "Pausar"
    setTimeout(() => {
        // Botão Limpar
        const clearBtn = document.getElementById('gherkin-clear');
        if (clearBtn) {
            clearBtn.disabled = false;
            clearBtn.style.opacity = '';
            clearBtn.onclick = () => {
                showModal('Deseja realmente limpar todas as interações deste cenário?', () => {
                    if (window.interactions) window.interactions.length = 0;
                    if (typeof saveInteractionsToStorage === 'function') saveInteractionsToStorage();
                    renderLogWithActions();
                });
            };
        }
        // Botão Pausar
        const pauseBtn = document.getElementById('gherkin-pause');
        if (pauseBtn) {
            pauseBtn.disabled = false;
            pauseBtn.style.opacity = '';
            pauseBtn.onclick = () => {
                window.isPaused = !window.isPaused;
                if (window.isPaused) {
                    pauseBtn.textContent = 'Continuar';
                    pauseBtn.style.backgroundColor = '#28a745';
                } else {
                    pauseBtn.textContent = 'Pausar';
                    pauseBtn.style.backgroundColor = '#ffc107';
                }
                
                // Atualizar barra de status
                if (typeof window.updateStatusBar === 'function') {
                    window.updateStatusBar();
                }
                
                showFeedback(window.isPaused ? 'Gravação pausada' : 'Gravação retomada', 'info');
            };
        }

        // Botão Exportar (barra inferior)
        const exportBtn = document.getElementById('gherkin-export');
        if (exportBtn) {
            exportBtn.onclick = (e) => {
                e.stopPropagation();
                // Menu de formatos
                const menu = document.createElement('div');
                menu.style.position = 'absolute';
                menu.style.background = '#fff';
                menu.style.border = '1px solid #ccc';
                menu.style.borderRadius = '5px';
                menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
                menu.style.zIndex = '10010';
                // Calcula posição relativa ao botão
                const rect = exportBtn.getBoundingClientRect();
                menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
                menu.style.left = `${rect.left + window.scrollX}px`;
                menu.style.minWidth = '120px';
                menu.innerHTML = `
                    <button style="width:100%;border:none;background:none;padding:8px;cursor:pointer;text-align:left;" tabindex="0">CSV</button>
                    <button style="width:100%;border:none;background:none;padding:8px;cursor:pointer;text-align:left;" tabindex="0">Markdown</button>
                    <button style="width:100%;border:none;background:none;padding:8px;cursor:pointer;text-align:left;" tabindex="0">JSON</button>
                    <button style="width:100%;border:none;background:none;padding:8px;cursor:pointer;text-align:left;border-top:1px solid #eee;color:#007bff;font-weight:600;" tabindex="0">🎯 SELETORES</button>
                `;
                menu.children[0].onclick = () => { exportLog('csv'); menu.remove(); };
                menu.children[1].onclick = () => { exportLog('md'); menu.remove(); };
                menu.children[2].onclick = () => { exportLog('json'); menu.remove(); };
                menu.children[3].onclick = () => { exportSelectors(); menu.remove(); };
                document.body.appendChild(menu);
                // Fecha ao clicar fora
                setTimeout(() => {
                    document.addEventListener('click', function closeMenu(ev) {
                        if (!menu.contains(ev.target) && ev.target !== exportBtn) {
                            menu.remove();
                            document.removeEventListener('click', closeMenu);
                        }
                    });
                }, 0);
            };
        }
    }, 0);
}

// Tornar função disponível globalmente
window.exportSelectors = exportSelectors;
