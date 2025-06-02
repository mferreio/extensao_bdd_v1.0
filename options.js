import { getConfig, setConfig } from './config.js';

window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('config-form');
    const feedback = document.getElementById('config-feedback');
    getConfig((config) => {
        form.nomePadraoFeature.value = config.nomePadraoFeature || '';
        form.nomePadraoCenario.value = config.nomePadraoCenario || '';
        form.templateStep.value = JSON.stringify(config.templateStep, null, 2);
        form.templateUpload.value = config.templateUpload || '';
        form.templateLogin.value = config.templateLogin || '';
        form.templateEspera.value = config.templateEspera || '';
    });
    form.onsubmit = (e) => {
        e.preventDefault();
        let templateStep;
        try {
            templateStep = JSON.parse(form.templateStep.value);
        } catch {
            feedback.textContent = 'Template de Step inválido (JSON)!';
            feedback.style.color = '#dc3545';
            return;
        }
        const newConfig = {
            nomePadraoFeature: form.nomePadraoFeature.value,
            nomePadraoCenario: form.nomePadraoCenario.value,
            templateStep,
            templateUpload: form.templateUpload.value,
            templateLogin: form.templateLogin.value,
            templateEspera: form.templateEspera.value
        };
        setConfig(newConfig, () => {
            feedback.textContent = 'Configurações salvas com sucesso!';
            feedback.style.color = '#28a745';
        });
    };
});