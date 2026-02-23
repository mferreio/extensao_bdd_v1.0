/**
 * Utilitário para validação e destaque visual de XPaths em tempo real.
 */

export function clearXPathSpotlights() {
    document.querySelectorAll('.gherkin-spotlight').forEach(el => {
        el.classList.remove('gherkin-spotlight');
    });
}

/**
 * Valida o XPath injetando highlights no DOM original e retorna o estatus de match.
 */
export function validateAndHighlightXPath(xpathStr) {
    clearXPathSpotlights();
    
    if (!xpathStr || xpathStr.trim() === '') {
        return { isValid: false, count: 0, message: '', isEmpty: true };
    }

    try {
        const result = document.evaluate(xpathStr, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        const count = result.snapshotLength;
        
        if (count > 0) {
            // Destaca até 5 elementos para não poluir ou travar a tela
            const maxHighlight = Math.min(count, 5);
            for (let i = 0; i < maxHighlight; i++) {
                const node = result.snapshotItem(i);
                if (node && node.nodeType === 1) { // ELEMENT_NODE
                    node.classList.add('gherkin-spotlight');
                    if (i === 0 && typeof node.scrollIntoView === 'function') {
                        node.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                    }
                }
            }
            return { isValid: true, count, message: `✅ ${count} elemento(s) encontrado(s)` };
        } else {
            return { isValid: false, count: 0, message: '❌ Nenhum elemento encontrado' };
        }
    } catch (e) {
        return { isValid: false, count: 0, message: '❌ XPath sintaticamente inválido' };
    }
}
