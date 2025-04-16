chrome.runtime.onInstalled.addListener(() => {
    chrome.action.onClicked.addListener((tab) => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
    });
});

// Remove lógica de abertura de popup
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });
});
