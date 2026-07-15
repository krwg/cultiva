import { openModal, closeModal } from './modals.js';
import { escapeHtml } from '../core/escape-html.js';

function createDialog({ title, message, confirmText, cancelText, tone }) {
  const modal = document.createElement('div');
  modal.className = 'modal cv-dialog-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const safeTitle = escapeHtml(title || 'Cultiva');
  const safeMessage = escapeHtml(message || '');
  const safeConfirm = escapeHtml(confirmText || 'OK');
  const safeCancel = escapeHtml(cancelText || 'Cancel');

  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-sheet cv-dialog-sheet">
      <div class="modal-header cv-dialog-header">
        <h2>${safeTitle}</h2>
        <button type="button" class="modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body cv-dialog-body">
        <p class="cv-dialog-message">${safeMessage}</p>
        <div class="modal-actions cv-dialog-actions">
          ${cancelText ? `<button type="button" class="btn-secondary cv-dialog-cancel">${safeCancel}</button>` : ''}
          <button type="button" class="btn-primary ${tone === 'danger' ? 'cv-dialog-danger' : ''} cv-dialog-confirm">${safeConfirm}</button>
        </div>
      </div>
    </div>
  `;

  return modal;
}

function mountDialog(config, onResolve) {
  const dialog = createDialog(config);
  document.body.appendChild(dialog);
  openModal(dialog);

  const finalize = (result) => {
    closeModal(dialog);
    dialog.remove();
    onResolve(result);
  };

  dialog.querySelector('.modal-overlay')?.addEventListener('click', () => finalize(false));
  dialog.querySelector('.modal-close')?.addEventListener('click', () => finalize(false));
  dialog.querySelector('.cv-dialog-cancel')?.addEventListener('click', () => finalize(false));
  dialog.querySelector('.cv-dialog-confirm')?.addEventListener('click', () => finalize(true));

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      finalize(false);
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      finalize(true);
    }
  });
}

export function showAlertDialog(message, options = {}) {
  return new Promise((resolve) => {
    mountDialog({
      title: options.title || 'Cultiva',
      message,
      confirmText: options.confirmText || 'OK',
      cancelText: '',
      tone: options.tone || 'default'
    }, () => resolve());
  });
}

export function showConfirmDialog(message, options = {}) {
  return new Promise((resolve) => {
    mountDialog({
      title: options.title || 'Confirm',
      message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      tone: options.tone || 'default'
    }, (result) => resolve(result));
  });
}
