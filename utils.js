// Funções utilitárias
function slugify(text) {
    return text.toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
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

function getCSSSelector(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

    function buildSelector(el) {
        let selector = el.tagName.toLowerCase();

        if (el.id) {
            selector += `#${el.id}`;
            return selector;
        }

        if (el.className) {
            const classes = el.className
                .split(' ')
                .filter(cls => cls.trim() !== '')
                .map(cls => `.${cls}`)
                .join('');
            selector += classes;
        }

        const attributes = ['name', 'type', 'aria-label', 'data-pc-name'];
        attributes.forEach(attr => {
            if (el.hasAttribute(attr)) {
                selector += `[${attr}="${el.getAttribute(attr)}"]`;
            }
        });

        return selector;
    }

    return buildSelector(element);
}

function getRobustXPath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

    if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1) {
        return `//*[@id='${element.id}']`;
    }

    const attrs = ['data-testid', 'data-qa', 'name', 'aria-label', 'title'];
    for (const attr of attrs) {
        const val = element.getAttribute(attr);
        if (val && document.querySelectorAll(`[${attr}='${val}']`).length === 1) {
            return `//*[@${attr}='${val}']`;
        }
    }

    let path = '';
    let el = element;
    while (el && el.nodeType === Node.ELEMENT_NODE && el !== document.body) {
        let segment = el.tagName.toLowerCase();
        for (const attr of attrs) {
            const val = el.getAttribute(attr);
            if (val && document.querySelectorAll(`[${attr}='${val}']`).length === 1) {
                path = `//*[@${attr}='${val}']${path ? '/' + path : ''}`;
                return path;
            }
        }
        const siblings = Array.from(el.parentNode.children).filter(e => e.tagName === el.tagName);
        if (siblings.length > 1) {
            const idx = siblings.indexOf(el) + 1;
            segment += `[${idx}]`;
        }
        path = path ? `${segment}/${path}` : segment;
        el = el.parentNode;
    }
    return '//' + path;
}

function isExtensionContextValid() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
}

export { slugify, downloadFile, showFeedback, debounce, getCSSSelector, getRobustXPath, isExtensionContextValid };
