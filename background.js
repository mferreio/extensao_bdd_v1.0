function isExtensionContextValid() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
}

chrome.action.onClicked.addListener((tab) => {
    if (!isExtensionContextValid()) {
        console.warn('Erro: Contexto da extensão inválido. Ignorando ação.');
        return;
    }

    // Verifica se o script já foi injetado na aba
    chrome.tabs.sendMessage(tab.id, { action: 'checkInjected' }, (response) => {
        if (chrome.runtime.lastError || !response || !response.injected) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['dist/bundle.js'] // Use o bundle final!
            }, (results) => {
                if (chrome.runtime.lastError) {
                    console.warn('Erro ao injetar o script ou script já injetado:', chrome.runtime.lastError.message);
                } else {
                    console.log('Script de conteúdo injetado com sucesso.');
                    chrome.tabs.sendMessage(tab.id, { action: 'recreatePanel' }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.warn('Erro ao recriar o painel:', chrome.runtime.lastError.message);
                        } else {
                            console.log('Painel recriado com sucesso.');
                        }
                    });
                }
            });
        } else {
            console.log('Script já injetado, nenhuma ação necessária.');
        }
    });
});
