document.addEventListener('click', (event) => {
    if (!isRecording) return;

    // Adiciona uma verificação para ignorar cliques dentro do DOM da extensão
    if (event.target.closest('#gherkin-panel')) {
        console.log('Clique ignorado: ocorreu dentro do painel da extensão.');
        return;
    }

    const xpath = getXPath(event.target);
    const cssSelector = event.target.tagName.toLowerCase() + (event.target.id ? `#${event.target.id}` : '');

    if (!xpath || !cssSelector || interactions.some(i => i.xpath === xpath)) {
        return; // Evita duplicacao ou elementos invalidos
    }

    console.log('Clique registrado:', { xpath, cssSelector });
    interactions.push({ action: 'click', xpath, cssSelector });
});

document.addEventListener('scroll', () => {
    if (!isRecording) return;

    console.log('Rolagem registrada.');
    interactions.push({ action: 'scroll', timestamp: Date.now() });
});

document.addEventListener('keydown', (event) => {
    if (!isRecording) return;

    console.log('Tecla pressionada:', event.key);
    interactions.push({ action: 'keydown', key: event.key, timestamp: Date.now() });
});
