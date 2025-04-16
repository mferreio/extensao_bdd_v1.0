chrome.runtime.onInstalled.addListener(() => {
    chrome.action.onClicked.addListener((tab) => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
    });
});

// Garante que a extensão seja reaberta ao clicar novamente no ícone
chrome.action.onClicked.addListener(() => {
    chrome.windows.getAll({ populate: true }, (windows) => {
        const popupWindow = windows.find(win => win.type === 'popup');
        if (popupWindow) {
            chrome.windows.update(popupWindow.id, { focused: true });
        } else {
            chrome.windows.create({
                url: 'popup.html',
                type: 'popup',
                width: 300,
                height: 250
            });
        }
    });
});
