// Configurações globais da extensão BDD
const defaultConfig = {
    nomePadraoFeature: 'Nova Feature',
    nomePadraoCenario: 'Novo Cenário',
    templateStep: {
        Given: 'Given que o usuário {acao}',
        When: 'When o usuário {acao}',
        Then: 'Then o usuário {acao}'
    },
    templateUpload: 'When faz upload do arquivo "{arquivo}" no campo {elemento}',
    templateLogin: 'Given que o usuário faz login com usuário "<usuario>" e senha "<senha>"',
    templateEspera: 'When espera o elemento aparecer: {seletor}',
    // ... outros templates e padrões
};

function getConfig(callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get('bddConfig', (data) => {
            callback(Object.assign({}, defaultConfig, data.bddConfig || {}));
        });
    } else {
        callback(defaultConfig);
    }
}

function setConfig(newConfig, callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ bddConfig: newConfig }, callback);
    }
}

export { getConfig, setConfig, defaultConfig };
