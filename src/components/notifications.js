// Sistema de notificações toast
import { getIcon } from '../assets/icons.js';
import { announce } from '../utils/accessibility.js';

export class NotificationManager {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.id = 'gherkin-notifications-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10002;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 400px;
      pointer-events: none;
    `;
    
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    
    const colors = {
      success: { 
        bg: 'rgba(16, 185, 129, 0.1)', 
        text: '#065f46', 
        border: 'rgba(16, 185, 129, 0.3)',
        gradient: 'linear-gradient(135deg, rgba(5, 150, 105, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)'
      },
      error: { 
        bg: 'rgba(239, 68, 68, 0.1)', 
        text: '#991b1b', 
        border: 'rgba(239, 68, 68, 0.3)',
        gradient: 'linear-gradient(135deg, rgba(220, 38, 38, 0.95) 0%, rgba(239, 68, 68, 0.95) 100%)'
      },
      warning: { 
        bg: 'rgba(245, 158, 11, 0.1)', 
        text: '#92400e', 
        border: 'rgba(245, 158, 11, 0.3)',
        gradient: 'linear-gradient(135deg, rgba(217, 119, 6, 0.95) 0%, rgba(245, 158, 11, 0.95) 100%)'
      },
      info: { 
        bg: 'rgba(59, 130, 246, 0.1)', 
        text: '#1e3a8a', 
        border: 'rgba(59, 130, 246, 0.3)',
        gradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(59, 130, 246, 0.95) 100%)'
      }
    };
    
    const color = colors[type] || colors.info;
    const iconMap = { success: 'success', error: 'error', warning: 'warning', info: 'info' };
    const iconSvg = getIcon(iconMap[type]);

    notification.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      color: ${color.text};
      border: 2px solid ${color.border};
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: gherkinSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 500;
      font-size: 0.95rem;
      pointer-events: auto;
      position: relative;
      overflow: hidden;
      min-width: 280px;
    `;
    
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.setAttribute('aria-atomic', 'true');

    // Adicionar barra lateral colorida
    const sideBar = document.createElement('div');
    sideBar.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: ${color.gradient};
    `;
    notification.appendChild(sideBar);

    notification.innerHTML += `
      <span style="width: 24px; height: 24px; display: flex; align-items: center; flex-shrink: 0; color: ${color.text}; margin-left: 8px;">${iconSvg}</span>
      <span style="flex: 1;">${message}</span>
      <button aria-label="Fechar" style="
        background: transparent;
        border: none;
        color: ${color.text};
        font-size: 22px;
        cursor: pointer;
        padding: 4px 8px;
        opacity: 0.6;
        transition: all 0.2s;
        border-radius: 6px;
        line-height: 1;
        font-weight: 300;
      " onmouseenter="this.style.opacity='1'; this.style.background='rgba(0,0,0,0.05)'" onmouseleave="this.style.opacity='0.6'; this.style.background='transparent'">×</button>
    `;

    const closeBtn = notification.querySelector('button');
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.removeNotification(notification);
    };

    this.container.appendChild(notification);
    
    // Anunciar para leitores de tela
    announce(message, 'polite');

    if (duration > 0) {
      setTimeout(() => this.removeNotification(notification), duration);
    }

    return notification;
  }

  removeNotification(element) {
    element.style.animation = 'gherkinSlideOut 0.3s ease';
    setTimeout(() => element.remove(), 300);
  }

  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 3000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 3000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
}

export const notificationManager = new NotificationManager();
