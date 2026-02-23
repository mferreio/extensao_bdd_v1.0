// Validação de formulário em tempo real
import { generateId, makeAccessibleInput, createAccessibleError } from '../utils/accessibility.js';
import { getIcon } from '../assets/icons.js';

export class FormValidator {
  static createValidatedInput(config) {
    const {
      id = generateId('input'),
      placeholder,
      validate = () => true,
      errorMessage = 'Campo inválido',
      label = 'Campo',
      required = true,
      onValid,
      onInvalid
    } = config;

    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    `;

    const labelEl = document.createElement('label');
    labelEl.htmlFor = id;
    labelEl.className = 'gherkin-label';
    labelEl.textContent = label;
    if (required) {
      labelEl.innerHTML += ' <span aria-label="obrigatório">*</span>';
    }

    const inputWrapper = document.createElement('div');
    inputWrapper.style.cssText = `
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    `;

    const input = document.createElement('input');
    input.id = id;
    input.type = 'text';
    input.placeholder = placeholder;
    input.required = required;
    input.className = 'gherkin-input';
    input.setAttribute('role', 'textbox');
    input.setAttribute('aria-required', required.toString());
    input.setAttribute('aria-label', label);
    input.style.cssText = `
      padding-left: 40px;
    `;

    const statusIcon = document.createElement('span');
    statusIcon.style.cssText = `
      position: absolute;
      left: 12px;
      width: 20px;
      height: 20px;
      display: none;
      color: #28A745;
    `;
    statusIcon.setAttribute('aria-hidden', 'true');

    const errorMsg = document.createElement('div');
    errorMsg.id = `${id}-error`;
    errorMsg.setAttribute('role', 'alert');
    errorMsg.style.cssText = `
      color: #DC3545;
      font-size: 12px;
      display: none;
      padding: 4px 0;
    `;
    
    input.setAttribute('aria-describedby', `${id}-error`);

    inputWrapper.appendChild(statusIcon);
    inputWrapper.appendChild(input);

    container.appendChild(labelEl);
    container.appendChild(inputWrapper);
    container.appendChild(errorMsg);

    // Validação em tempo real
    input.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      const isValid = validate(value);

      if (isValid) {
        input.style.borderColor = 'var(--color-success, #28A745)';
        statusIcon.innerHTML = getIcon('success');
        statusIcon.style.color = 'var(--color-success, #28A745)';
        statusIcon.style.display = 'flex';
        errorMsg.style.display = 'none';
        input.setAttribute('aria-invalid', 'false');
        onValid?.(value);
      } else if (value) {
        input.style.borderColor = 'var(--color-danger, #DC3545)';
        statusIcon.innerHTML = getIcon('error');
        statusIcon.style.color = 'var(--color-danger, #DC3545)';
        statusIcon.style.display = 'flex';
        errorMsg.textContent = errorMessage;
        errorMsg.style.display = 'block';
        input.setAttribute('aria-invalid', 'true');
        onInvalid?.(value);
      } else {
        input.style.borderColor = 'var(--border-color, #DDD)';
        statusIcon.style.display = 'none';
        errorMsg.style.display = 'none';
        input.setAttribute('aria-invalid', 'false');
      }
    });

    return { container, input };
  }

  static createForm(fields) {
    const form = document.createElement('form');
    const inputs = {};

    fields.forEach(field => {
      const { container, input } = this.createValidatedInput(field);
      form.appendChild(container);
      inputs[field.id] = input;
    });

    form.isValid = () => {
      return Object.values(inputs).every(input => {
        return input.getAttribute('aria-invalid') === 'false';
      });
    };

    form.getValues = () => {
      const values = {};
      Object.entries(inputs).forEach(([key, input]) => {
        values[key] = input.value.trim();
      });
      return values;
    };

    return { form, inputs };
  }
}
