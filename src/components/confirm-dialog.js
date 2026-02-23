// Dialog de confirmação acessível
export function showConfirmDialog(config) {
  const {
    title = 'Confirmação',
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    showThirdButton = false,
    thirdButtonText = 'Outra Opção',
    type = 'default',
    onConfirm,
    onCancel,
    onThirdButton
  } = config;

  const overlay = document.createElement('div');
  overlay.className = 'gherkin-modal-bg';

  const dialog = document.createElement('div');
  dialog.className = 'gherkin-modal-content';
  dialog.style.maxWidth = '480px';
  dialog.role = 'alertdialog';
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'dialog-title');

  const titleEl = document.createElement('h3');
  titleEl.id = 'dialog-title';
  titleEl.className = 'gherkin-h3 gherkin-mb-md';
  titleEl.textContent = title;

  const messageEl = document.createElement('div');
  messageEl.innerHTML = message; // Permite HTML
  messageEl.className = 'gherkin-mb-lg';
  messageEl.style.color = 'var(--text-secondary)';
  messageEl.style.lineHeight = '1.6';

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'gherkin-flex-row gherkin-gap-sm';
  buttonContainer.style.justifyContent = 'flex-end';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = cancelText;
  cancelBtn.className = 'gherkin-btn gherkin-btn-outline';
  // Fallback for outline style in case it's not defined
  cancelBtn.style.background = 'transparent';
  cancelBtn.style.border = '1px solid var(--border-color)';
  cancelBtn.style.color = 'var(--text-primary)';
  cancelBtn.onclick = () => {
    overlay.remove();
    onCancel?.();
  };

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = confirmText;
  
  const typeClassMap = {
    default: 'gherkin-btn-main',
    danger: 'gherkin-btn-danger',
    warning: 'gherkin-btn-warning',
    success: 'gherkin-btn-success'
  };
  
  confirmBtn.className = `gherkin-btn ${typeClassMap[type] || typeClassMap.default}`;
  confirmBtn.onclick = () => {
    overlay.remove();
    onConfirm?.();
  };

  buttonContainer.appendChild(cancelBtn);
  
  if (showThirdButton && onThirdButton) {
    const thirdBtn = document.createElement('button');
    thirdBtn.textContent = thirdButtonText;
    thirdBtn.className = 'gherkin-btn gherkin-btn-warning'; // or whatever fits best
    thirdBtn.onclick = () => {
      overlay.remove();
      onThirdButton();
    };
    buttonContainer.appendChild(thirdBtn);
  }
  
  buttonContainer.appendChild(confirmBtn);

  dialog.appendChild(titleEl);
  dialog.appendChild(messageEl);
  dialog.appendChild(buttonContainer);
  overlay.appendChild(dialog);

  document.body.appendChild(overlay);

  cancelBtn.focus();

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      onCancel?.();
    }
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      onCancel?.();
    }
  });
}
