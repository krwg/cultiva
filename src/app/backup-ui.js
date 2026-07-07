import { TRANSLATIONS } from '../core/i18n.js';
import { storage } from '../modules/storage.js';
import { BRANDING } from '../core/branding.js';
import { getTodayStr } from './date-ui.js';
import { showNotification } from './ui-shell.js';
import { renderGarden } from './garden-controller.js';
import { buildBackupPayload, runAutoBackup } from './auto-backup.js';

let ctx = null;

export function configureBackupUi(c) {
  ctx = c;
}

function requireCtx() {
  if (!ctx) {
    throw new Error('[backup-ui] not configured');
  }
  return ctx;
}

export function exportData() {
  const c = requireCtx();
  const t = TRANSLATIONS[c.settings.lang];
  const data = buildBackupPayload();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${BRANDING.BACKUP_PREFIX}-${getTodayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification(t.exported);
}

export async function exportZip() {
  const c = requireCtx();
  const t = TRANSLATIONS[c.settings.lang];
  const payload = buildBackupPayload();
  const name = `${BRANDING.BACKUP_PREFIX}-${getTodayStr()}.zip`;
  if (window.electron?.exportBackupZip) {
    const r = await window.electron.exportBackupZip(JSON.stringify(payload), name);
    if (r?.success) {
      showNotification(t.exportedZip || t.exported);
    }
    return;
  }
  exportData();
}

export function importData(file) {
  const c = requireCtx();
  const t = TRANSLATIONS[c.settings.lang];
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.habits && Array.isArray(data.habits)) { storage.saveHabits(data.habits); resolve(true); }
        else { reject(new Error('Invalid format')); }
      } catch (err) { reject(err); }
    };
    reader.readAsText(file);
  }).then(() => { renderGarden(); showNotification(t.imported); runAutoBackup(true); })
    .catch(err => alert(err.message));
}

export function bindBackupUiEvents() {
  document.getElementById('settings-export')?.addEventListener('click', exportData);
  document.getElementById('settings-export-zip')?.addEventListener('click', () => { exportZip(); });
  document.getElementById('settings-import')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => { if (e.target.files?.[0]) { importData(e.target.files[0]); } };
    input.click();
  });
  document.getElementById('settings-reset')?.addEventListener('click', () => {
    const c = requireCtx();
    const t = TRANSLATIONS[c.settings.lang];
    if (confirm(t.reset + '?') && confirm('Are you absolutely sure?')) {
      storage.saveHabits([]);
      renderGarden();
      showNotification(t.resetDone);
    }
  });
}
