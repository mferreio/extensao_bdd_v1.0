// Modais da extensão

export function showModal(message, onYes, onNo) {
    // Remove modal antigo se existir
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.25)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '10001';

    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.gap = '18px';
    modal.style.minWidth = '260px';
    modalBg.className = 'gherkin-modal-bg';
    modal.className = 'gherkin-modal-content';

    const msg = document.createElement('div');
    msg.textContent = message;
    msg.style.fontSize = '17px';
    msg.style.color = '#0D47A1';
    msg.style.textAlign = 'center';
    modal.appendChild(msg);

    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '18px';

    const yesBtn = document.createElement('button');
    yesBtn.textContent = 'Sim';
    yesBtn.style.background = '#007bff';
    yesBtn.style.color = '#fff';
    yesBtn.style.border = 'none';
    yesBtn.style.borderRadius = '6px';
    yesBtn.style.padding = '8px 22px';
    yesBtn.style.fontSize = '15px';
    yesBtn.style.fontWeight = 'bold';
    yesBtn.style.cursor = 'pointer';
    yesBtn.onclick = () => {
        modalBg.remove();
        if (onYes) onYes();
    };

    const noBtn = document.createElement('button');
    noBtn.textContent = 'Não';
    noBtn.style.background = '#dc3545';
    noBtn.style.color = '#fff';
    noBtn.style.border = 'none';
    noBtn.style.borderRadius = '6px';
    noBtn.style.padding = '8px 22px';
    noBtn.style.fontSize = '15px';
    noBtn.style.fontWeight = 'bold';
    noBtn.style.cursor = 'pointer';
    noBtn.onclick = () => {
        modalBg.remove();
        if (onNo) onNo();
    };

    btns.appendChild(yesBtn);
    btns.appendChild(noBtn);
    modal.appendChild(btns);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

export function showUploadModal(nomeElemento, cssSelector, xpath, callback) {
    // Remove modal antigo se existir
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.25)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '10003';
    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.gap = '18px';
    modal.style.minWidth = '260px';
    modalBg.className = 'gherkin-modal-bg';
    modal.className = 'gherkin-modal-content';
    // Título
    const title = document.createElement('div');
    title.textContent = 'Upload de arquivo de exemplo';
    title.style.fontSize = '17px';
    title.style.color = '#0D47A1';
    title.style.textAlign = 'center';
    modal.appendChild(title);
    // Nome do arquivo
    const fileLabel = document.createElement('label');
    fileLabel.textContent = 'Nome do arquivo de exemplo:';
    fileLabel.style.fontWeight = 'bold';
    fileLabel.style.marginBottom = '4px';
    modal.appendChild(fileLabel);
    const fileInput = document.createElement('input');
    fileInput.type = 'text';
    fileInput.placeholder = 'exemplo.pdf, imagem.png, etc.';
    fileInput.style.width = '100%';
    fileInput.style.padding = '7px';
    fileInput.style.borderRadius = '5px';
    fileInput.style.border = '1px solid #ccc';
    fileInput.style.fontSize = '14px';
    fileInput.value = '';
    modal.appendChild(fileInput);
    // Botões
    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '18px';
    btns.style.marginTop = '12px';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Salvar';
    saveBtn.style.background = '#007bff';
    saveBtn.style.color = '#fff';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '6px';
    saveBtn.style.padding = '8px 22px';
    saveBtn.style.fontSize = '15px';
    saveBtn.style.fontWeight = 'bold';
    saveBtn.style.cursor = 'pointer';
    saveBtn.onclick = () => {
        const nomeArquivo = fileInput.value.trim();
        if (!nomeArquivo) {
            alert('Por favor, informe o nome do arquivo de exemplo.');
            return;
        }
        window.interactions.push({
            step: 'When',
            acao: 'upload',
            acaoTexto: 'Upload arquivo',
            nomeElemento: nomeElemento,
            nomeArquivo: nomeArquivo,
            cssSelector: cssSelector,
            xpath: xpath,
            timestamp: Date.now()
        });
        saveInteractionsToStorage();
        renderLogWithActions();
        modalBg.remove();
        if (typeof callback === 'function') callback(nomeArquivo);
    };
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.background = '#dc3545';
    cancelBtn.style.color = '#fff';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '6px';
    cancelBtn.style.padding = '8px 22px';
    cancelBtn.style.fontSize = '15px';
    cancelBtn.style.fontWeight = 'bold';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = () => modalBg.remove();
    btns.appendChild(saveBtn);
    btns.appendChild(cancelBtn);
    modal.appendChild(btns);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

export function showLoginModal() {
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.25)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '10003';
    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.gap = '18px';
    modal.style.minWidth = '260px';
    modalBg.className = 'gherkin-modal-bg';
    modal.className = 'gherkin-modal-content';
    const title = document.createElement('div');
    title.textContent = 'Marcar ação como Login';
    title.style.fontSize = '17px';
    title.style.color = '#0D47A1';
    title.style.textAlign = 'center';
    modal.appendChild(title);
    const userLabel = document.createElement('label');
    userLabel.textContent = 'Usuário/Email:';
    userLabel.style.fontWeight = 'bold';
    userLabel.style.marginBottom = '4px';
    modal.appendChild(userLabel);
    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.style.width = '100%';
    userInput.style.padding = '7px';
    userInput.style.borderRadius = '5px';
    userInput.style.border = '1px solid #ccc';
    userInput.style.fontSize = '14px';
    modal.appendChild(userInput);
    const passLabel = document.createElement('label');
    passLabel.textContent = 'Senha:';
    passLabel.style.fontWeight = 'bold';
    passLabel.style.marginBottom = '4px';
    modal.appendChild(passLabel);
    const passInput = document.createElement('input');
    passInput.type = 'password';
    passInput.style.width = '100%';
    passInput.style.padding = '7px';
    passInput.style.borderRadius = '5px';
    passInput.style.border = '1px solid #ccc';
    passInput.style.fontSize = '14px';
    modal.appendChild(passInput);
    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '18px';
    btns.style.marginTop = '12px';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Salvar Login';
    saveBtn.style.background = '#007bff';
    saveBtn.style.color = '#fff';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '6px';
    saveBtn.style.padding = '8px 22px';
    saveBtn.style.fontSize = '15px';
    saveBtn.style.fontWeight = 'bold';
    saveBtn.style.cursor = 'pointer';
    saveBtn.onclick = () => {
        const usuario = userInput.value.trim();
        const senha = passInput.value;
        if (!usuario || !senha) {
            alert('Por favor, preencha usuário e senha.');
            return;
        }
        window.interactions.push({
            step: 'Given',
            acao: 'login',
            acaoTexto: 'Login',
            nomeElemento: usuario,
            valorPreenchido: senha,
            timestamp: Date.now()
        });
        saveInteractionsToStorage();
        renderLogWithActions();
        modalBg.remove();
        showFeedback('Ação de login registrada!', 'success');
    };
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.background = '#dc3545';
    cancelBtn.style.color = '#fff';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '6px';
    cancelBtn.style.padding = '8px 22px';
    cancelBtn.style.fontSize = '15px';
    cancelBtn.style.fontWeight = 'bold';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = () => modalBg.remove();
    btns.appendChild(saveBtn);
    btns.appendChild(cancelBtn);
    modal.appendChild(btns);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

export function showLogDetailsModal(interaction) {
    // Remove modal antigo se existir
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.25)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '10003';

    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'flex-start';
    modal.style.gap = '12px';
    modal.style.minWidth = '320px';
    modal.style.maxWidth = '96vw';
    modal.style.maxHeight = '80vh';
    modal.style.overflowY = 'auto';
    modalBg.className = 'gherkin-modal-bg';
    modal.className = 'gherkin-modal-content';

    // ACTION_META local para evitar importação circular
    const ACTION_META = {
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

    const meta = ACTION_META[interaction.acao] || {};
    const title = document.createElement('div');
    title.innerHTML = `<span style="font-size:1.3em;color:${meta.color || '#222'}">${meta.icon || ''}</span> <b>${meta.label || interaction.acao}</b> (${interaction.step})`;
    title.style.fontSize = '17px';
    title.style.color = '#0D47A1';
    title.style.textAlign = 'left';
    modal.appendChild(title);

    const details = [
        ['Nome do elemento', interaction.nomeElemento || ''],
        ['Valor preenchido', interaction.valorPreenchido || interaction.nomeArquivo || ''],
        ['Selector CSS', interaction.cssSelector || ''],
        ['XPath', interaction.xpath || ''],
        ['Timestamp', interaction.timestamp ? new Date(interaction.timestamp).toLocaleString() : ''],
        ['Texto do passo', interaction.stepText || ''],
    ];
    
    details.forEach(([label, value]) => {
        if (value) {
            const row = document.createElement('div');
            row.innerHTML = `<b>${label}:</b> <span style="font-family:monospace">${value}</span>`;
            modal.appendChild(row);
        }
    });

    // Botão fechar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Fechar';
    closeBtn.style.background = '#007bff';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.padding = '8px 22px';
    closeBtn.style.fontSize = '15px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => modalBg.remove();
    modal.appendChild(closeBtn);

    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

export function showEditModal(idx) {
    const interaction = window.interactions[idx];
    if (!interaction) return;
    
    // Remove modal antigo se existir
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.25)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '10003';
    
    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '20px 24px 18px 24px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'stretch';
    modal.style.gap = '12px';
    modal.style.width = '95vw';
    modal.style.maxWidth = '400px';
    modal.style.minWidth = '280px';
    modal.style.maxHeight = '90vh';
    modal.style.overflowY = 'auto';
    
    // Título
    const title = document.createElement('div');
    title.textContent = 'Editar interação';
    title.style.fontSize = '16px';
    title.style.color = '#0D47A1';
    title.style.textAlign = 'center';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '4px';
    modal.appendChild(title);
    
    // Campo passo (Given, When, Then)
    const stepLabel = document.createElement('label');
    stepLabel.textContent = 'Passo BDD:';
    stepLabel.style.fontWeight = 'bold';
    stepLabel.style.fontSize = '14px';
    stepLabel.style.marginBottom = '4px';
    stepLabel.style.display = 'block';
    modal.appendChild(stepLabel);
    
    const stepSelect = document.createElement('select');
    stepSelect.style.width = '100%';
    stepSelect.style.padding = '8px 10px';
    stepSelect.style.borderRadius = '6px';
    stepSelect.style.border = '2px solid #ddd';
    stepSelect.style.fontSize = '14px';
    stepSelect.style.marginBottom = '8px';
    stepSelect.style.boxSizing = 'border-box';
    
    ['Given','When','Then'].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (interaction.step === opt) option.selected = true;
        stepSelect.appendChild(option);
    });
    modal.appendChild(stepSelect);
    
    // Campo ação
    const actionLabel = document.createElement('label');
    actionLabel.textContent = 'Ação:';
    actionLabel.style.fontWeight = 'bold';
    actionLabel.style.fontSize = '14px';
    actionLabel.style.marginBottom = '4px';
    actionLabel.style.display = 'block';
    modal.appendChild(actionLabel);
    
    let actionSelect;
    if (interaction.acao === 'acessa_url') {
        // Para o passo inicial, exibe o valor fixo e desabilita edição
        actionSelect = document.createElement('input');
        actionSelect.type = 'text';
        actionSelect.value = 'acessa_url';
        actionSelect.disabled = true;
        actionSelect.style.width = '100%';
        actionSelect.style.padding = '8px 10px';
        actionSelect.style.borderRadius = '6px';
        actionSelect.style.border = '2px solid #ddd';
        actionSelect.style.fontSize = '14px';
        actionSelect.style.background = '#f5f5f5';
        actionSelect.style.boxSizing = 'border-box';
        actionSelect.style.marginBottom = '8px';
    } else {
        actionSelect = document.createElement('select');
        actionSelect.style.width = '100%';
        actionSelect.style.padding = '8px 10px';
        actionSelect.style.borderRadius = '6px';
        actionSelect.style.border = '2px solid #ddd';
        actionSelect.style.fontSize = '14px';
        actionSelect.style.boxSizing = 'border-box';
        actionSelect.style.marginBottom = '8px';
        
        // Opções iguais ao painel
        const mainActionSelect = document.getElementById('gherkin-action-select');
        if (mainActionSelect && mainActionSelect.innerHTML.trim()) {
            actionSelect.innerHTML = mainActionSelect.innerHTML;
        } else {
            actionSelect.innerHTML = '<option value="clica">Clicar</option>';
        }
        actionSelect.value = interaction.acao;
    }
    modal.appendChild(actionSelect);
    
    // Campo nome do elemento
    const nomeLabel = document.createElement('label');
    nomeLabel.textContent = 'Nome do elemento:';
    nomeLabel.style.fontWeight = 'bold';
    nomeLabel.style.fontSize = '14px';
    nomeLabel.style.marginBottom = '4px';
    nomeLabel.style.display = 'block';
    modal.appendChild(nomeLabel);
    
    const nomeInput = document.createElement('input');
    nomeInput.type = 'text';
    nomeInput.value = interaction.nomeElemento || '';
    nomeInput.style.width = '100%';
    nomeInput.style.padding = '8px 10px';
    nomeInput.style.borderRadius = '6px';
    nomeInput.style.border = '2px solid #ddd';
    nomeInput.style.fontSize = '14px';
    nomeInput.style.boxSizing = 'border-box';
    nomeInput.style.marginBottom = '8px';
    modal.appendChild(nomeInput);
    
    // Campo nome do arquivo (apenas para upload)
    let fileInput = null;
    if (interaction.acao === 'upload') {
        const fileLabel = document.createElement('label');
        fileLabel.textContent = 'Nome do arquivo de exemplo:';
        fileLabel.style.fontWeight = 'bold';
        fileLabel.style.fontSize = '14px';
        fileLabel.style.marginBottom = '4px';
        fileLabel.style.display = 'block';
        modal.appendChild(fileLabel);
        
        fileInput = document.createElement('input');
        fileInput.type = 'text';
        fileInput.value = interaction.nomeArquivo || '';
        fileInput.style.width = '100%';
        fileInput.style.padding = '8px 10px';
        fileInput.style.borderRadius = '6px';
        fileInput.style.border = '2px solid #ddd';
        fileInput.style.fontSize = '14px';
        fileInput.style.boxSizing = 'border-box';
        fileInput.style.marginBottom = '8px';
        modal.appendChild(fileInput);
    }
    
    // Campo valor preenchido (apenas para ação preenche)
    let valorPreenchidoInput = null;
    if (interaction.acao === 'preenche') {
        const valorLabel = document.createElement('label');
        valorLabel.textContent = 'Valor preenchido:';
        valorLabel.style.fontWeight = 'bold';
        valorLabel.style.fontSize = '14px';
        valorLabel.style.marginBottom = '4px';
        valorLabel.style.display = 'block';
        modal.appendChild(valorLabel);
        
        valorPreenchidoInput = document.createElement('input');
        valorPreenchidoInput.type = 'text';
        valorPreenchidoInput.value = typeof interaction.valorPreenchido !== 'undefined' ? interaction.valorPreenchido : '';
        valorPreenchidoInput.style.width = '100%';
        valorPreenchidoInput.style.padding = '8px 10px';
        valorPreenchidoInput.style.borderRadius = '6px';
        valorPreenchidoInput.style.border = '2px solid #ddd';
        valorPreenchidoInput.style.fontSize = '14px';
        valorPreenchidoInput.style.boxSizing = 'border-box';
        valorPreenchidoInput.style.marginBottom = '8px';
        valorPreenchidoInput.autocomplete = 'off';
        modal.appendChild(valorPreenchidoInput);
    }
    
    // Botões
    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '12px';
    btns.style.marginTop = '8px';
    btns.style.justifyContent = 'center';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Salvar';
    saveBtn.style.background = '#007bff';
    saveBtn.style.color = '#fff';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '6px';
    saveBtn.style.padding = '10px 20px';
    saveBtn.style.fontSize = '14px';
    saveBtn.style.fontWeight = 'bold';
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.flex = '1';
    saveBtn.style.maxWidth = '120px';
    saveBtn.onclick = () => {
        interaction.step = stepSelect.value;
        if (interaction.acao === 'acessa_url') {
            // Mantém a ação fixa
            interaction.acao = 'acessa_url';
            interaction.acaoTexto = 'Acessa';
        } else {
            interaction.acao = actionSelect.value;
            // Protege contra opção indefinida
            const selectedOption = actionSelect.options ? actionSelect.options[actionSelect.selectedIndex] : null;
            interaction.acaoTexto = selectedOption ? selectedOption.text : actionSelect.value;
        }
        interaction.nomeElemento = nomeInput.value.trim() || interaction.nomeElemento;
        
        if (interaction.acao === 'upload' && fileInput) {
            interaction.nomeArquivo = fileInput.value.trim() || interaction.nomeArquivo;
        }
        
        if (interaction.acao === 'preenche' && valorPreenchidoInput) {
            interaction.valorPreenchido = valorPreenchidoInput.value;
        }
        
        if (typeof window.saveInteractionsToStorage === 'function') {
            window.saveInteractionsToStorage();
        }
        
        if (typeof window.renderLogWithActions === 'function') {
            window.renderLogWithActions();
        }
        
        modalBg.remove();
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.background = '#dc3545';
    cancelBtn.style.color = '#fff';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '6px';
    cancelBtn.style.padding = '10px 20px';
    cancelBtn.style.fontSize = '14px';
    cancelBtn.style.fontWeight = 'bold';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.style.flex = '1';
    cancelBtn.style.maxWidth = '120px';
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
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.25)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '10003';
    
    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '20px 24px 18px 24px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'stretch';
    modal.style.gap = '14px';
    modal.style.width = '95vw';
    modal.style.maxWidth = '750px';
    modal.style.minWidth = '320px';
    modal.style.maxHeight = '95vh';
    modal.style.overflowY = 'auto';
    
    // Título
    const title = document.createElement('div');
    title.textContent = 'Seletores do elemento';
    title.style.fontSize = '16px';
    title.style.color = '#0D47A1';
    title.style.textAlign = 'center';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '4px';
    modal.appendChild(title);
    
    // Se houver informações sobre validação e robustez, mostra
    if (elementInfo) {
        const infoContainer = document.createElement('div');
        infoContainer.style.width = '100%';
        infoContainer.style.marginBottom = '8px';
        
        if (elementInfo.isValid) {
            const statusDiv = document.createElement('div');
            statusDiv.style.display = 'flex';
            statusDiv.style.gap = '16px';
            statusDiv.style.fontSize = '14px';
            statusDiv.style.marginBottom = '8px';
            
            const cssStatus = document.createElement('span');
            cssStatus.innerHTML = `CSS: ${elementInfo.isValid.css ? '✅ Válido' : '❌ Inválido'}`;
            cssStatus.style.color = elementInfo.isValid.css ? '#28a745' : '#dc3545';
            
            const xpathStatus = document.createElement('span');
            xpathStatus.innerHTML = `XPath: ${elementInfo.isValid.xpath ? '✅ Válido' : '❌ Inválido'}`;
            xpathStatus.style.color = elementInfo.isValid.xpath ? '#28a745' : '#dc3545';
            
            statusDiv.appendChild(cssStatus);
            statusDiv.appendChild(xpathStatus);
            infoContainer.appendChild(statusDiv);
        }

        // Informações de robustez
        if (elementInfo.robustness) {
            const robustnessDiv = document.createElement('div');
            robustnessDiv.style.fontSize = '13px';
            robustnessDiv.style.background = '#f8f9fa';
            robustnessDiv.style.padding = '8px';
            robustnessDiv.style.borderRadius = '4px';
            robustnessDiv.style.border = '1px solid #e9ecef';
            
            if (elementInfo.robustness.css) {
                const css = elementInfo.robustness.css;
                const cssRobustness = document.createElement('div');
                cssRobustness.innerHTML = `
                    <strong>CSS:</strong> 
                    ${css.isUnique ? '✅ Único' : '❌ Não único'} | 
                    ${css.isStable ? '✅ Estável' : '❌ Instável'} | 
                    Especificidade: ${css.specificity}
                `;
                cssRobustness.style.marginBottom = '4px';
                robustnessDiv.appendChild(cssRobustness);
            }
            
            if (elementInfo.robustness.xpath) {
                const xpath = elementInfo.robustness.xpath;
                const xpathRobustness = document.createElement('div');
                xpathRobustness.innerHTML = `
                    <strong>XPath:</strong> 
                    ${xpath.isUnique ? '✅ Único' : '❌ Não único'} | 
                    ${xpath.isStable ? '✅ Estável' : '❌ Instável'}
                `;
                robustnessDiv.appendChild(xpathRobustness);
            }
            
            infoContainer.appendChild(robustnessDiv);
        }
        
        modal.appendChild(infoContainer);
    }
    
    // CSS Selector (se fornecido)
    if (cssSelector) {
        const cssLabel = document.createElement('div');
        cssLabel.textContent = 'CSS Selector:';
        cssLabel.style.fontSize = '14px';
        cssLabel.style.fontWeight = 'bold';
        cssLabel.style.alignSelf = 'flex-start';
        cssLabel.style.marginBottom = '4px';
        modal.appendChild(cssLabel);
        
        const cssBox = document.createElement('textarea');
        cssBox.value = cssSelector;
        cssBox.readOnly = true;
        cssBox.style.width = '100%';
        cssBox.style.height = '60px';
        cssBox.style.fontSize = '12px';
        cssBox.style.fontFamily = 'monospace';
        cssBox.style.padding = '8px';
        cssBox.style.borderRadius = '5px';
        cssBox.style.border = '1px solid #ccc';
        cssBox.style.resize = 'vertical';
        cssBox.style.marginBottom = '8px';
        modal.appendChild(cssBox);
    }
    
    // Seletores alternativos (se disponíveis)
    if (elementInfo && elementInfo.alternativeSelectors && elementInfo.alternativeSelectors.length > 0) {
        const alternativesLabel = document.createElement('div');
        alternativesLabel.textContent = 'Seletores Alternativos:';
        alternativesLabel.style.fontSize = '14px';
        alternativesLabel.style.fontWeight = 'bold';
        alternativesLabel.style.alignSelf = 'flex-start';
        alternativesLabel.style.marginTop = '12px';
        alternativesLabel.style.marginBottom = '6px';
        modal.appendChild(alternativesLabel);

        const alternativesContainer = document.createElement('div');
        alternativesContainer.style.width = '100%';
        alternativesContainer.style.maxHeight = '250px';
        alternativesContainer.style.overflowY = 'auto';
        alternativesContainer.style.border = '1px solid #e9ecef';
        alternativesContainer.style.borderRadius = '6px';
        alternativesContainer.style.background = '#f8f9fa';

        elementInfo.alternativeSelectors.forEach((alt, index) => {
            const altDiv = document.createElement('div');
            altDiv.style.padding = '10px';
            altDiv.style.borderBottom = index < elementInfo.alternativeSelectors.length - 1 ? '1px solid #e9ecef' : 'none';
            altDiv.style.position = 'relative';

            // Header com ranking e estratégia
            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.justifyContent = 'space-between';
            headerDiv.style.alignItems = 'center';
            headerDiv.style.marginBottom = '8px';

            const strategySpan = document.createElement('span');
            strategySpan.textContent = `#${alt.rank} - ${alt.strategy}`;
            strategySpan.style.fontWeight = 'bold';
            strategySpan.style.fontSize = '13px';
            strategySpan.style.color = '#0D47A1';

            const robustnessSpan = document.createElement('span');
            robustnessSpan.style.fontSize = '12px';
            robustnessSpan.style.padding = '2px 8px';
            robustnessSpan.style.borderRadius = '12px';
            robustnessSpan.style.fontWeight = 'bold';
            
            // Cor baseada na robustez
            if (alt.robustness >= 80) {
                robustnessSpan.style.background = '#d4edda';
                robustnessSpan.style.color = '#155724';
                robustnessSpan.textContent = `${alt.robustness}% ⭐⭐⭐`;
            } else if (alt.robustness >= 60) {
                robustnessSpan.style.background = '#fff3cd';
                robustnessSpan.style.color = '#856404';
                robustnessSpan.textContent = `${alt.robustness}% ⭐⭐`;
            } else {
                robustnessSpan.style.background = '#f8d7da';
                robustnessSpan.style.color = '#721c24';
                robustnessSpan.textContent = `${alt.robustness}% ⭐`;
            }

            headerDiv.appendChild(strategySpan);
            headerDiv.appendChild(robustnessSpan);
            altDiv.appendChild(headerDiv);

            // Descrição
            const descDiv = document.createElement('div');
            descDiv.textContent = alt.description;
            descDiv.style.fontSize = '12px';
            descDiv.style.color = '#6c757d';
            descDiv.style.marginBottom = '8px';
            altDiv.appendChild(descDiv);

            // CSS Selector (se disponível)
            if (alt.selector) {
                const cssLabel = document.createElement('div');
                cssLabel.textContent = 'CSS:';
                cssLabel.style.fontSize = '11px';
                cssLabel.style.fontWeight = 'bold';
                cssLabel.style.marginBottom = '2px';
                altDiv.appendChild(cssLabel);

                const cssCode = document.createElement('code');
                cssCode.textContent = alt.selector;
                cssCode.style.fontSize = '11px';
                cssCode.style.fontFamily = 'monospace';
                cssCode.style.background = '#fff';
                cssCode.style.padding = '4px 6px';
                cssCode.style.borderRadius = '3px';
                cssCode.style.border = '1px solid #ddd';
                cssCode.style.display = 'block';
                cssCode.style.marginBottom = '4px';
                cssCode.style.wordBreak = 'break-all';
                altDiv.appendChild(cssCode);
            }

            // XPath
            if (alt.xpath) {
                const xpathLabel = document.createElement('div');
                xpathLabel.textContent = 'XPath:';
                xpathLabel.style.fontSize = '11px';
                xpathLabel.style.fontWeight = 'bold';
                xpathLabel.style.marginBottom = '2px';
                altDiv.appendChild(xpathLabel);

                const xpathCode = document.createElement('code');
                xpathCode.textContent = alt.xpath;
                xpathCode.style.fontSize = '11px';
                xpathCode.style.fontFamily = 'monospace';
                xpathCode.style.background = '#fff';
                xpathCode.style.padding = '4px 6px';
                xpathCode.style.borderRadius = '3px';
                xpathCode.style.border = '1px solid #ddd';
                xpathCode.style.display = 'block';
                xpathCode.style.wordBreak = 'break-all';
                altDiv.appendChild(xpathCode);
            }

            // Botões de ação para cada alternativa
            const actionsDiv = document.createElement('div');
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '6px';
            actionsDiv.style.marginTop = '8px';
            actionsDiv.style.flexWrap = 'wrap';

            // Botão de teste e highlight
            const testBtn = document.createElement('button');
            testBtn.textContent = 'Testar & Destacar';
            testBtn.style.fontSize = '10px';
            testBtn.style.padding = '4px 8px';
            testBtn.style.background = '#6f42c1';
            testBtn.style.color = '#fff';
            testBtn.style.border = 'none';
            testBtn.style.borderRadius = '3px';
            testBtn.style.cursor = 'pointer';
            testBtn.style.fontWeight = 'bold';
            
            // Status indicator (inicialmente oculto)
            const statusSpan = document.createElement('span');
            statusSpan.style.fontSize = '10px';
            statusSpan.style.padding = '2px 6px';
            statusSpan.style.borderRadius = '10px';
            statusSpan.style.marginLeft = '4px';
            statusSpan.style.fontWeight = 'bold';
            statusSpan.style.display = 'none';
            
            testBtn.onclick = async () => {
                // Remove highlights anteriores
                if (typeof window.removeAllHighlights === 'function') {
                    window.removeAllHighlights();
                }
                
                testBtn.textContent = 'Testando...';
                testBtn.disabled = true;
                
                // Importa as funções dinamicamente se não estiverem disponíveis
                if (typeof window.testAndHighlightSelector !== 'function') {
                    const { testAndHighlightSelector, removeAllHighlights } = await import('../utils/dom.js');
                    window.testAndHighlightSelector = testAndHighlightSelector;
                    window.removeAllHighlights = removeAllHighlights;
                }
                
                // Testa o seletor apropriado
                const selectorToTest = alt.selector || alt.xpath;
                const selectorType = alt.selector ? 'css' : 'xpath';
                
                try {
                    const result = window.testAndHighlightSelector(selectorToTest, selectorType);
                    
                    // Atualiza o status
                    statusSpan.textContent = `${result.statusIcon} ${result.count} elemento(s)`;
                    statusSpan.style.background = result.statusColor + '20';
                    statusSpan.style.color = result.statusColor;
                    statusSpan.style.border = `1px solid ${result.statusColor}`;
                    statusSpan.style.display = 'inline';
                    
                    testBtn.textContent = 'Testar & Destacar';
                    testBtn.disabled = false;
                    
                    // Feedback visual no botão
                    const originalBg = testBtn.style.background;
                    testBtn.style.background = result.statusColor;
                    setTimeout(() => {
                        testBtn.style.background = originalBg;
                    }, 1000);
                    
                } catch (error) {
                    console.error('Erro ao testar seletor:', error);
                    statusSpan.textContent = '💥 Erro';
                    statusSpan.style.background = '#dc354520';
                    statusSpan.style.color = '#dc3545';
                    statusSpan.style.border = '1px solid #dc3545';
                    statusSpan.style.display = 'inline';
                    
                    testBtn.textContent = 'Testar & Destacar';
                    testBtn.disabled = false;
                }
            };
            
            actionsDiv.appendChild(testBtn);
            actionsDiv.appendChild(statusSpan);

            if (alt.selector) {
                const copyBtn = document.createElement('button');
                copyBtn.textContent = 'Copiar CSS';
                copyBtn.style.fontSize = '10px';
                copyBtn.style.padding = '4px 8px';
                copyBtn.style.background = '#17a2b8';
                copyBtn.style.color = '#fff';
                copyBtn.style.border = 'none';
                copyBtn.style.borderRadius = '3px';
                copyBtn.style.cursor = 'pointer';
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
                copyXpathBtn.style.fontSize = '10px';
                copyXpathBtn.style.padding = '4px 8px';
                copyXpathBtn.style.background = '#28a745';
                copyXpathBtn.style.color = '#fff';
                copyXpathBtn.style.border = 'none';
                copyXpathBtn.style.borderRadius = '3px';
                copyXpathBtn.style.cursor = 'pointer';
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
    
    // XPath principal
    const xpathLabel = document.createElement('div');
    xpathLabel.textContent = 'XPath Principal:';
    xpathLabel.style.fontSize = '14px';
    xpathLabel.style.fontWeight = 'bold';
    xpathLabel.style.alignSelf = 'flex-start';
    xpathLabel.style.marginTop = '12px';
    xpathLabel.style.marginBottom = '4px';
    modal.appendChild(xpathLabel);
    
    const xpathBox = document.createElement('textarea');
    xpathBox.value = xpath || 'XPath não disponível';
    xpathBox.readOnly = true;
    xpathBox.style.width = '100%';
    xpathBox.style.height = '80px';
    xpathBox.style.fontSize = '12px';
    xpathBox.style.fontFamily = 'monospace';
    xpathBox.style.padding = '8px';
    xpathBox.style.borderRadius = '5px';
    xpathBox.style.border = '1px solid #ccc';
    xpathBox.style.resize = 'vertical';
    modal.appendChild(xpathBox);
    
    // Botões de ação principais
    const actionBtns = document.createElement('div');
    actionBtns.style.display = 'flex';
    actionBtns.style.gap = '8px';
    actionBtns.style.flexWrap = 'wrap';
    actionBtns.style.justifyContent = 'center';
    actionBtns.style.marginTop = '8px';
    
    // Botão de teste para seletores principais
    const testMainBtn = document.createElement('button');
    testMainBtn.textContent = '🧪 Testar';
    testMainBtn.style.background = '#6f42c1';
    testMainBtn.style.color = '#fff';
    testMainBtn.style.border = 'none';
    testMainBtn.style.borderRadius = '5px';
    testMainBtn.style.padding = '6px 12px';
    testMainBtn.style.fontSize = '14px';
    testMainBtn.style.fontWeight = 'bold';
    testMainBtn.style.cursor = 'pointer';
    
    // Status dos seletores principais
    const mainStatusDiv = document.createElement('div');
    mainStatusDiv.style.fontSize = '12px';
    mainStatusDiv.style.marginTop = '8px';
    mainStatusDiv.style.textAlign = 'center';
    mainStatusDiv.style.display = 'none';
    
    testMainBtn.onclick = async () => {
        testMainBtn.textContent = '🔄 Testando...';
        testMainBtn.disabled = true;
        
        // Importa as funções dinamicamente se não estiverem disponíveis
        if (typeof window.testSelectorInRealTime !== 'function') {
            const { testSelectorInRealTime, highlightElements, removeAllHighlights } = await import('../utils/dom.js');
            window.testSelectorInRealTime = testSelectorInRealTime;
            window.highlightElements = highlightElements;
            window.removeAllHighlights = removeAllHighlights;
        }
        
        // Remove highlights anteriores
        window.removeAllHighlights();
        
        try {
            const results = [];
            
            // Testa CSS Selector
            if (cssSelector) {
                const cssResult = window.testSelectorInRealTime(cssSelector, 'css');
                results.push({ type: 'CSS', result: cssResult });
                
                // Destaca elementos encontrados
                if (cssResult.elements.length > 0) {
                    window.highlightElements(cssResult.elements, cssResult.statusColor);
                }
            }
            
            // Testa XPath (apenas se diferente do CSS)
            if (xpath && xpath !== cssSelector) {
                const xpathResult = window.testSelectorInRealTime(xpath, 'xpath');
                results.push({ type: 'XPath', result: xpathResult });
                
                // Se não temos elementos CSS ou XPath encontrou elementos diferentes
                if (!cssSelector || xpathResult.elements.length > 0) {
                    window.highlightElements(xpathResult.elements, xpathResult.statusColor);
                }
            }
            
            // Exibe resultados
            mainStatusDiv.innerHTML = results.map(({ type, result }) => 
                `<span style="color: ${result.statusColor}; margin-right: 12px;">
                    ${result.statusIcon} ${type}: ${result.count} elemento(s) - ${result.status}
                </span>`
            ).join('');
            mainStatusDiv.style.display = 'block';
            
            testMainBtn.textContent = '🧪 Testar Seletores';
            testMainBtn.disabled = false;
            
        } catch (error) {
            console.error('Erro ao testar seletores principais:', error);
            mainStatusDiv.innerHTML = '<span style="color: #dc3545;">💥 Erro ao testar seletores</span>';
            mainStatusDiv.style.display = 'block';
            
            testMainBtn.textContent = '🧪 Testar Seletores';
            testMainBtn.disabled = false;
        }
    };
    
    actionBtns.appendChild(testMainBtn);
    
    // Botão para limpar highlights
    const clearHighlightsBtn = document.createElement('button');
    clearHighlightsBtn.textContent = '🧹 Limpar';
    clearHighlightsBtn.style.background = '#6c757d';
    clearHighlightsBtn.style.color = '#fff';
    clearHighlightsBtn.style.border = 'none';
    clearHighlightsBtn.style.borderRadius = '5px';
    clearHighlightsBtn.style.padding = '6px 12px';
    clearHighlightsBtn.style.fontSize = '13px';
    clearHighlightsBtn.style.fontWeight = 'bold';
    clearHighlightsBtn.style.cursor = 'pointer';
    clearHighlightsBtn.onclick = async () => {
        if (typeof window.removeAllHighlights !== 'function') {
            const { removeAllHighlights } = await import('../utils/dom.js');
            window.removeAllHighlights = removeAllHighlights;
        }
        window.removeAllHighlights();
        mainStatusDiv.style.display = 'none';
    };
    
    actionBtns.appendChild(clearHighlightsBtn);
    
    
    // Botão copiar CSS
    if (cssSelector) {
        const copyCssBtn = document.createElement('button');
        copyCssBtn.textContent = 'Copiar CSS';
        copyCssBtn.style.background = '#17a2b8';
        copyCssBtn.style.color = '#fff';
        copyCssBtn.style.border = 'none';
        copyCssBtn.style.borderRadius = '5px';
        copyCssBtn.style.padding = '6px 12px';
        copyCssBtn.style.fontSize = '13px';
        copyCssBtn.style.fontWeight = 'bold';
        copyCssBtn.style.cursor = 'pointer';
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
    copyXpathBtn.style.background = '#28a745';
    copyXpathBtn.style.color = '#fff';
    copyXpathBtn.style.border = 'none';
    copyXpathBtn.style.borderRadius = '5px';
    copyXpathBtn.style.padding = '6px 12px';
    copyXpathBtn.style.fontSize = '13px';
    copyXpathBtn.style.fontWeight = 'bold';
    copyXpathBtn.style.cursor = 'pointer';
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
    closeBtn.style.background = '#007bff';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '5px';
    closeBtn.style.padding = '6px 12px';
    closeBtn.style.fontSize = '13px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = async () => {
        // Remove highlights ao fechar
        if (typeof window.removeAllHighlights !== 'function') {
            const { removeAllHighlights } = await import('../utils/dom.js');
            window.removeAllHighlights = removeAllHighlights;
        }
        window.removeAllHighlights();
        modalBg.remove();
    };
    actionBtns.appendChild(closeBtn);
    
    modal.appendChild(actionBtns);
    modal.appendChild(mainStatusDiv);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}
