import { habits } from '../modules/habits.js';
import { settings } from './renderer-bootstrap.js';
import { BRANDING } from '../core/branding.js';

const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MIN_BACKUP_GAP_MS = 60 * 60 * 1000;

let lastBackupAt = 0;
let backupTimer = null;

export function buildBackupPayload() {
  return {
    habits: habits.getAll(),
    settings,
    exportedAt: new Date().toISOString(),
    version: BRANDING.VERSION
  };
}

export async function runAutoBackup(force = false) {
  if (!window.electron?.saveAutoBackup) {
    return;
  }
  const now = Date.now();
  if (!force && now - lastBackupAt < MIN_BACKUP_GAP_MS) {
    return;
  }
  try {
    const payload = buildBackupPayload();
    await window.electron.saveAutoBackup(JSON.stringify(payload));
    lastBackupAt = now;
  } catch (e) {
    console.warn('[AutoBackup]', e);
  }
}

export function initAutoBackup() {
  if (!window.electron?.saveAutoBackup) {
    return;
  }
  runAutoBackup(true);
  if (backupTimer) {
    clearInterval(backupTimer);
  }
  backupTimer = setInterval(() => {
    runAutoBackup(false);
  }, BACKUP_INTERVAL_MS);
  window.addEventListener('beforeunload', () => {
    runAutoBackup(true);
  });
}
