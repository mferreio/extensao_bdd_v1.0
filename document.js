document.addEventListener('click', (event) => {
    // Removido: registro de clique duplicado. O controle agora é feito apenas pelo content.js
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
