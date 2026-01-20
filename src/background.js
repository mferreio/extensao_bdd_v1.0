// Background script para gerenciar eventos do navegador
import { LicenseManager } from './utils/license';

const licenseManager = new LicenseManager();

chrome.action.onClicked.addListener(async (tab) => {
    const hasLicense = await licenseManager.hasValidLicense();

    if (!hasLicense) {
        chrome.runtime.openOptionsPage();
        return;
    }

    // Envia mensagem para o content script da aba ativa para alternar a UI
    if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_UI' }).catch(err => {
            console.warn('Erro ao enviar mensagem para content script:', err);
            // Se falhar, talvez o script não esteja injetado ou página restrita
        });
    }
});
