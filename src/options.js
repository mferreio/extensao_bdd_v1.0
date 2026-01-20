
import { LicenseManager } from './utils/license';

const licenseManager = new LicenseManager();
const form = document.getElementById('licenseForm');
const keyInput = document.getElementById('licenseKey');
const consentInput = document.getElementById('privacyConsent');
const statusDiv = document.getElementById('status');
const saveBtn = document.getElementById('saveBtn');

// Load saved license
licenseManager.getLicense().then(license => {
    if (license) {
        keyInput.value = license;
        statusDiv.textContent = 'Licença salva e ativa.';
        statusDiv.className = 'success';
        statusDiv.style.display = 'block';
        saveBtn.textContent = 'Atualizar Licença';
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const key = keyInput.value.trim();
    const consent = consentInput.checked;

    if (!consent) {
        showStatus('Você precisa concordar com a política de privacidade.', 'error');
        return;
    }

    if (!key) {
        showStatus('Por favor, insira uma chave de licença.', 'error');
        return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Verificando...';

    const isValid = await licenseManager.validateLicense(key);

    if (isValid) {
        await licenseManager.saveLicense(key);
        showStatus('Licença ativada! A extensão está pronta para uso.<br>Feche esta aba e clique no ícone da extensão em qualquer página web para começar.', 'success');
        saveBtn.textContent = 'Atualizar Licença';
    } else {
        showStatus('Chave de licença inválida.', 'error');
        saveBtn.textContent = 'Salvar e Ativar';
    }

    saveBtn.disabled = false;
});

function showStatus(message, type) {
    statusDiv.innerHTML = message;
    statusDiv.className = type;
    statusDiv.style.display = 'block';
}
