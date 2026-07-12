import { BRANDING } from '../core/branding.js';

export function applyBranding() {
  document.title = `${BRANDING.APP_TITLE} | Garden`;
  document.querySelectorAll('.footer-version').forEach((el) => {
    el.textContent = BRANDING.FOOTER_TEXT;
  });

  const aboutVersion = document.getElementById('about-version-display');
  if (aboutVersion) {
    aboutVersion.textContent = `Version [${BRANDING.VERSION}] ${BRANDING.CODENAME} Desktop`;
  }
}

export function showNotification(icon, text, subText = '', actionText = '', actionCallback = null) {
  if (arguments.length === 1) {
    text = icon;
    icon = '';
  }

  const existing = document.querySelector('.dynamic-notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.className = 'dynamic-notification';
  const iconHtml = icon ? `<span class="dynamic-notification-icon">${icon}</span>` : '';

  notification.innerHTML = `
        ${iconHtml}
        <div class="dynamic-notification-content">
            <span class="dynamic-notification-text">${text}</span>
            ${subText ? `<span class="dynamic-notification-sub">${subText}</span>` : ''}
        </div>
        ${actionText && actionCallback ? `<button class="dynamic-notification-btn">${actionText}</button>` : ''}
    `;

  document.body.appendChild(notification);
  if (actionCallback && actionText) {
    notification.querySelector('.dynamic-notification-btn').addEventListener('click', actionCallback);
  }

  setTimeout(() => notification.classList.add('visible'), 100);
  const duration = actionCallback && actionText ? 6500 : 4000;
  setTimeout(() => {
    notification.classList.remove('visible');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}
