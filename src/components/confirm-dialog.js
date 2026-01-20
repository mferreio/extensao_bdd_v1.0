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
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    animation: gherkinFadeIn 0.2s ease;
  `;

  const dialog = document.createElement('div');
  dialog.role = 'alertdialog';
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  dialog.style.cssText = `
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    max-width: 480px;
    width: 90%;
    padding: 28px;
    animation: gherkinSlideUp 0.3s ease;
  `;

  const titleEl = document.createElement('h2');
  titleEl.id = 'dialog-title';
  titleEl.textContent = title;
  titleEl.style.cssText = `
    margin: 0 0 16px 0;
    color: #212529;
    font-size: 20px;
    font-weight: 700;
  `;

  const messageEl = document.createElement('div');
  messageEl.innerHTML = message; // Permite HTML
  messageEl.style.cssText = `
    margin: 0 0 28px 0;
    color: #495057;
    line-height: 1.6;
    font-size: 15px;
  `;

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;
  `;

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = cancelText;
  cancelBtn.style.cssText = `
    padding: 12px 24px;
    border: 2px solid #DDD;
    background: white;
    color: #495057;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
    flex: 1;
    min-width: ${showThirdButton ? '110px' : '130px'};
  `;
  cancelBtn.onmouseover = () => {
    cancelBtn.style.borderColor = '#999';
    cancelBtn.style.background = '#f8f9fa';
  };
  cancelBtn.onmouseout = () => {
    cancelBtn.style.borderColor = '#DDD';
    cancelBtn.style.background = 'white';
  };
  cancelBtn.onclick = () => {
    overlay.remove();
    onCancel?.();
  };

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = confirmText;
  
  const colorMap = {
    default: '#0D47A1',
    danger: '#DC3545',
    warning: '#FFC107',
    success: '#28A745'
  };

  confirmBtn.style.cssText = `
    padding: 12px 24px;
    background: ${colorMap[type] || colorMap.default};
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
    flex: 1;
    min-width: ${showThirdButton ? '110px' : '130px'};
  `;
  confirmBtn.onmouseover = () => confirmBtn.style.opacity = '0.9';
  confirmBtn.onmouseout = () => confirmBtn.style.opacity = '1';
  confirmBtn.onclick = () => {
    overlay.remove();
    onConfirm?.();
  };

  buttonContainer.appendChild(cancelBtn);
  
  if (showThirdButton && onThirdButton) {
    const thirdBtn = document.createElement('button');
    thirdBtn.textContent = thirdButtonText;
    thirdBtn.style.cssText = `
      padding: 12px 24px;
      background: #17A2B8;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s;
      flex: 1;
      min-width: 110px;
    `;
    thirdBtn.onmouseover = () => thirdBtn.style.opacity = '0.9';
    thirdBtn.onmouseout = () => thirdBtn.style.opacity = '1';
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
