function isExtensionContextValid() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
}

chrome.runtime.onInstalled.addListener(() => {
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
                    files: ['content.js']
                }, (results) => {
                    if (chrome.runtime.lastError) {
                        console.warn('Erro ao injetar o script ou script já injetado:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Script de conteúdo injetado com sucesso.');

                        // Envia uma mensagem para recriar o painel
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
});

// Garante que o Service Worker seja ativado ao clicar no ícone da extensão
chrome.action.onClicked.addListener((tab) => {
    if (!isExtensionContextValid()) {
        console.warn('Erro: Contexto da extensão inválido. Ignorando ação.');
        return;
    }

    // Reinjetar o script de conteúdo se necessário
    chrome.tabs.sendMessage(tab.id, { action: 'checkInjected' }, (response) => {
        if (chrome.runtime.lastError || !response || !response.injected) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }, (results) => {
                if (chrome.runtime.lastError) {
                    console.warn('Erro ao injetar o script ou script já injetado:', chrome.runtime.lastError.message);
                } else {
                    console.log('Script de conteúdo injetado com sucesso.');

                    // Envia uma mensagem para recriar o painel
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
