// Funções utilitárias

function slugify(text, upperCamel = false) {
    let result = text.toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

    if (upperCamel) {
        // Converte para UpperCamelCase
        result = result.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    }

    return result;
}

function downloadFile(filename, content) {
    let blob;
    if (content instanceof Blob) {
        blob = content;
    } else {
        blob = new Blob([content], { type: 'text/plain' });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\//g, '_'); // Substitui barras para evitar problemas no nome do arquivo
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

function showFeedback(message, type = 'success') {
    // Remove feedback antigo se existir
    const old = document.querySelector('.feedback');
    if (old) old.remove();
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.setAttribute('role', 'alert');
    feedback.setAttribute('aria-live', 'assertive');
    feedback.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
    feedback.style.color = '#fff';
    feedback.innerHTML = `<span>${message}</span>
        <button class="gherkin-feedback-close" aria-label="Fechar feedback" tabindex="0">&times;</button>`;
    document.body.appendChild(feedback);
    // Fechar manualmente
    feedback.querySelector('.gherkin-feedback-close').onclick = () => feedback.remove();
    // Fechar com ESC
    function escListener(e) {
        if (e.key === 'Escape') {
            feedback.remove();
            document.removeEventListener('keydown', escListener);
        }
    }
    document.addEventListener('keydown', escListener);
    // Fechar automático após 4s
    setTimeout(() => {
        if (feedback.parentNode) feedback.remove();
        document.removeEventListener('keydown', escListener);
    }, 4000);
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function isExtensionContextValid() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
}

// Spinner global seguro - MODERNIZADO
function showSpinner(message = 'Processando...') {
    // Evita múltiplos spinners
    if (document.getElementById('gherkin-spinner-modal')) return;
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-spinner-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0, 0, 0, 0.5)';
    modalBg.style.backdropFilter = 'blur(8px)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '2147483647';
    modalBg.style.animation = 'gherkinFadeIn 0.2s ease-out';

    const modal = document.createElement('div');
    modal.style.background = 'rgba(255, 255, 255, 0.95)';
    modal.style.backdropFilter = 'blur(12px)';
    modal.style.padding = '32px 40px';
    modal.style.borderRadius = '16px';
    modal.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
    modal.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.gap = '24px';
    modal.style.minWidth = '240px';
    modal.style.animation = 'gherkinSlideUp 0.3s ease-out';

    // Spinner moderno com gradiente
    const spinner = document.createElement('div');
    spinner.style.width = '48px';
    spinner.style.height = '48px';
    spinner.style.border = '4px solid rgba(59, 130, 246, 0.2)';
    spinner.style.borderTopColor = '#3b82f6';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 0.8s linear infinite';
    modal.appendChild(spinner);

    // Mensagem
    const msg = document.createElement('div');
    msg.textContent = message;
    msg.style.fontSize = '1rem';
    msg.style.fontWeight = '600';
    msg.style.color = '#1e3a8a';
    msg.style.textAlign = 'center';
    modal.appendChild(msg);

    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

function hideSpinner() {
    const modal = document.getElementById('gherkin-spinner-modal');
    if (modal) modal.remove();
}

export { slugify, downloadFile, showFeedback, debounce, isExtensionContextValid, showSpinner, hideSpinner };
