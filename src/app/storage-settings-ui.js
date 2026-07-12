import { TRANSLATIONS } from '../core/i18n.js';
import { auth } from '../modules/auth.js';
import { storage } from '../modules/storage.js';
import {
  STORAGE_BACKEND_IDS,
  listStorageBackendOptions
} from '../modules/storage-backend.js';
import { settings, ensureAppReady } from './renderer-bootstrap.js';
import { saveSettings } from './settings-controller.js';
import { showNotification } from './ui-shell.js';
import { showAlertDialog } from './dialogs.js';

export function refreshStorageBackendControls() {
  const select = document.getElementById('storage-backend-select');
  const hint = document.getElementById('storage-backend-hint');
  if (!select) {
    return;
  }

  const lang = settings.lang || 'en';
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const options = listStorageBackendOptions({ isAuthenticated: auth.isAuthenticated() });
  const current = settings.storageBackend || STORAGE_BACKEND_IDS.LOCAL;

  select.innerHTML = '';
  for (const opt of options) {
    const el = document.createElement('option');
    el.value = opt.id;
    el.textContent = t[opt.labelKey] || opt.id;
    el.disabled = !opt.available;
    select.appendChild(el);
  }

  select.value = current;
  if (select.value !== current) {
    select.value = STORAGE_BACKEND_IDS.LOCAL;
  }

  const accountOpt = options.find((o) => o.id === STORAGE_BACKEND_IDS.ACCOUNT);
  if (hint) {
    if (accountOpt && !accountOpt.available) {
      hint.textContent = t[accountOpt.unavailableKey] || '';
      hint.hidden = false;
    } else if (current === STORAGE_BACKEND_IDS.ACCOUNT) {
      hint.textContent = t.storageBackendAccountActive || '';
      hint.hidden = false;
    } else {
      hint.textContent = t.storageBackendLocalActive || '';
      hint.hidden = false;
    }
  }
}

export async function handleStorageBackendChange(nextId) {
  await ensureAppReady();

  const normalized = nextId === STORAGE_BACKEND_IDS.ACCOUNT
    ? STORAGE_BACKEND_IDS.ACCOUNT
    : STORAGE_BACKEND_IDS.LOCAL;

  if (normalized === STORAGE_BACKEND_IDS.ACCOUNT && !auth.isAuthenticated()) {
    showAlertDialog(
      (TRANSLATIONS[settings.lang] || TRANSLATIONS.en).storageBackendAccountSignIn,
      { title: (TRANSLATIONS[settings.lang] || TRANSLATIONS.en).storageBackendTitle }
    );
    refreshStorageBackendControls();
    return;
  }

  try {
    await storage.setBackendId(normalized);
    settings.storageBackend = normalized;
    saveSettings();
    refreshStorageBackendControls();
    const t = TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
    showNotification(t.storageBackendSaved || 'Storage preference saved');
  } catch (e) {
    console.error('[Storage] Backend switch failed:', e);
    refreshStorageBackendControls();
    showAlertDialog(String(e.message || e), {
      title: (TRANSLATIONS[settings.lang] || TRANSLATIONS.en).storageBackendTitle
    });
  }
}

export function bindStorageBackendSettings() {
  const select = document.getElementById('storage-backend-select');
  if (!select || select.dataset.bound === '1') {
    return;
  }
  select.dataset.bound = '1';
  select.addEventListener('change', (e) => {
    void handleStorageBackendChange(e.target.value);
  });
  refreshStorageBackendControls();
}
