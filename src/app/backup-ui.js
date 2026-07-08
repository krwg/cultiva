import { TRANSLATIONS } from '../core/i18n.js';
import { storage } from '../modules/storage.js';
import { BRANDING } from '../core/branding.js';
import { getTodayStr } from './date-ui.js';
import { showNotification } from './ui-shell.js';
import { renderGarden } from './garden-controller.js';
import { buildBackupPayload, runAutoBackup } from './auto-backup.js';
import { openModal, closeModal } from './modals.js';
import { habits } from '../modules/habits.js';
import { buildIcalDocument, downloadIcalFile } from '../core/ical-export.js';
import { showAlertDialog, showConfirmDialog } from './dialogs.js';

let ctx = null;
let pendingImport = null;

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

export function exportIcal() {
  const c = requireCtx();
  const t = TRANSLATIONS[c.settings.lang];
  let calendarEvents = null;
  try {
    const raw = localStorage.getItem('cultiva_calendar_events');
    if (raw) {
      calendarEvents = JSON.parse(raw);
    }
  } catch {
    calendarEvents = null;
  }
  const ics = buildIcalDocument({ habits: habits.getAll(), calendarEvents });
  const name = `${BRANDING.BACKUP_PREFIX}-${getTodayStr()}.ics`;
  downloadIcalFile(ics, name);
  showNotification(t.exportedIcal || t.exported);
}

function showImportPreview(data) {
  const c = requireCtx();
  const t = TRANSLATIONS[c.settings.lang];
  const modal = document.getElementById('import-preview-modal');
  const body = document.getElementById('import-preview-body');
  if (!modal || !body) {
    return;
  }
  const habitCount = Array.isArray(data.habits) ? data.habits.length : 0;
  const exportedAt = data.exportedAt ? new Date(data.exportedAt).toLocaleString(c.settings.lang === 'ru' ? 'ru-RU' : 'en-US') : '—';
  const version = data.version || '—';
  body.innerHTML = `
    <dl class="import-preview-stats">
      <dt>${t.importPreviewHabits || 'Habits'}</dt><dd>${habitCount}</dd>
      <dt>${t.importPreviewDate || 'Exported'}</dt><dd>${exportedAt}</dd>
      <dt>${t.importPreviewVersion || 'Version'}</dt><dd>${version}</dd>
    </dl>
    <p class="onboarding-muted">${t.importPreviewWarn || 'This replaces your current habits with the backup.'}</p>`;
  pendingImport = data;
  openModal(modal);
}

function confirmImport() {
  const c = requireCtx();
  const t = TRANSLATIONS[c.settings.lang];
  if (!pendingImport?.habits || !Array.isArray(pendingImport.habits)) {
    closeModal(document.getElementById('import-preview-modal'));
    return;
  }
  void (async () => {
    await storage.saveHabits(pendingImport.habits);
    pendingImport = null;
    closeModal(document.getElementById('import-preview-modal'));
    renderGarden();
    showNotification(t.imported);
    await runAutoBackup(true);
  })();
}

export function importData(file) {
  const c = requireCtx();
  const t = TRANSLATIONS[c.settings.lang];
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.habits && Array.isArray(data.habits)) {
          resolve(data);
        } else {
          reject(new Error('Invalid format'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  }).then((data) => { showImportPreview(data); })
    .catch(err => showAlertDialog(err.message, { title: t.import || 'Import' }));
}

export function bindBackupUiEvents() {
  document.getElementById('settings-export')?.addEventListener('click', exportData);
  document.getElementById('settings-export-zip')?.addEventListener('click', () => { exportZip(); });
  document.getElementById('settings-export-ical')?.addEventListener('click', exportIcal);
  document.getElementById('settings-import')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => { if (e.target.files?.[0]) { importData(e.target.files[0]); } };
    input.click();
  });
  document.getElementById('import-preview-cancel')?.addEventListener('click', () => {
    pendingImport = null;
    closeModal(document.getElementById('import-preview-modal'));
  });
  document.getElementById('import-preview-confirm')?.addEventListener('click', confirmImport);
  document.getElementById('settings-reset')?.addEventListener('click', async () => {
    const c = requireCtx();
    const t = TRANSLATIONS[c.settings.lang];
    const firstConfirm = await showConfirmDialog(`${t.reset}?`, {
      title: t.reset || 'Reset',
      confirmText: t.resetBtn || 'Reset',
      cancelText: t.cancel || 'Cancel',
      tone: 'danger'
    });
    if (!firstConfirm) {
      return;
    }
    const secondConfirm = await showConfirmDialog('Are you absolutely sure?', {
      title: t.dangerZone || 'Danger Zone',
      confirmText: t.resetBtn || 'Reset',
      cancelText: t.cancel || 'Cancel',
      tone: 'danger'
    });
    if (secondConfirm) {
      await storage.saveHabits([]);
      renderGarden();
      showNotification(t.resetDone);
      await runAutoBackup(true);
    }
  });
}
