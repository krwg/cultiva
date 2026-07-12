import { TRANSLATIONS } from '../core/i18n.js';
import { settings } from './renderer-bootstrap.js';

export function refreshStorageBackendControls() {
  const hint = document.getElementById('storage-backend-hint');
  if (!hint) {
    return;
  }
  const lang = settings.lang || 'en';
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  hint.textContent = t.storageBackendLocalActive || '';
  hint.hidden = false;
}

export function bindStorageBackendSettings() {
  refreshStorageBackendControls();
}
