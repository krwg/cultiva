import { BRANDING } from './branding.js';
import { AMBIENT_BG_LAYER_IDS } from './theme-config.js';
import { applyAccentColor } from './customization.js';
import { getPluginAppearancePresets } from './plugin-contributions.js';
import { playPluginAmbientSound } from './plugin-sounds.js';
import { applyBackgroundById } from './plugin-appearance-bridge.js';
import { buildPluginHabitsSnapshot } from './plugin-habits-api.js';
import { getTodayInTZ } from './timezone.js';

async function readSettings() {
  const { settings } = await import('../app/renderer-bootstrap.js');
  return settings;
}

export function getPluginPlatform() {
  return window.electron?.platform || 'web';
}

export function isPluginDesktop() {
  return Boolean(window.electron?.isElectron);
}

export function getSanitizedManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    return null;
  }
  return {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    minAppVersion: manifest.minAppVersion || null,
    permissions: Array.isArray(manifest.permissions) ? [...manifest.permissions] : []
  };
}

export async function openPluginSettingsTab(sectionId = 'appearance') {
  const { openModal } = await import('../app/modals.js');
  const modal = document.getElementById('settings-modal');
  if (!modal) {
    return false;
  }
  openModal(modal);
  const nav = document.querySelector(`.settings-nav-item[data-section="${sectionId}"]`);
  nav?.click();
  return true;
}

export async function openPluginCalendar() {
  if (window.electron?.openCalendarWindow) {
    window.electron.openCalendarWindow();
    return true;
  }
  window.location.href = './pages/calendar/index.html';
  return true;
}

export function reloadPluginGarden() {
  if (typeof window.renderGarden === 'function') {
    window.renderGarden();
  }
  window.dispatchEvent(new CustomEvent('cultiva-garden-refresh'));
}

export function syncPluginTray() {
  if (typeof window.syncTrayHabits === 'function') {
    window.syncTrayHabits();
  }
}

export function setPluginTrayTooltip(text) {
  if (window.electron?.setTrayTooltip) {
    return window.electron.setTrayTooltip(text != null ? String(text) : '');
  }
  return Promise.resolve({ ok: false });
}

export function setPluginTrayPluginItems(items) {
  if (window.electron?.setTrayPluginItems) {
    return window.electron.setTrayPluginItems(Array.isArray(items) ? items : []);
  }
  return Promise.resolve({ ok: false });
}

export function clearPluginTrayPluginItems() {
  if (window.electron?.clearTrayPluginItems) {
    return window.electron.clearTrayPluginItems();
  }
  return Promise.resolve({ ok: false });
}

export function getBuiltinBackgroundIds() {
  return ['none', ...AMBIENT_BG_LAYER_IDS, 'custom'];
}

export function getPluginHabitById(habitId) {
  return buildPluginHabitsSnapshot().find((h) => h.id === habitId) || null;
}

export function getPluginHabitsCompletedToday() {
  const today = getTodayInTZ();
  return buildPluginHabitsSnapshot().filter((h) => {
    if (h.trackType === 'quantity') {
      return h.todayProgress >= h.target;
    }
    return h.lastCompleted === today;
  });
}

export async function logPluginHabitQuantity(habitId, value) {
  const { toggleHabitWithHooks } = await import('../app/habit-actions.js');
  const result = await toggleHabitWithHooks(habitId, value);
  reloadPluginGarden();
  syncPluginTray();
  return result;
}

export async function setPluginLang(lang) {
  const settings = await readSettings();
  settings.lang = lang === 'ru' ? 'ru' : 'en';
  const { saveSettings } = await import('../app/settings-controller.js');
  saveSettings();
  return settings.lang;
}

export async function setPluginFocusMode(enabled) {
  const settings = await readSettings();
  settings.focusMode = Boolean(enabled);
  const { saveSettings } = await import('../app/settings-controller.js');
  saveSettings();
  return settings.focusMode;
}

export async function setPluginAccentColor(hex) {
  const settings = await readSettings();
  settings.accentColor = hex || '';
  applyAccentColor(settings.accentColor);
  const { saveSettings } = await import('../app/settings-controller.js');
  saveSettings();
  return settings.accentColor;
}

export async function setPluginAmbientSound(soundId) {
  const id = soundId || 'none';
  localStorage.setItem('cultiva-ambient-sound', id);
  await playPluginAmbientSound(id === 'none' ? '' : id);
  const { saveSettings } = await import('../app/settings-controller.js');
  saveSettings();
  return id;
}

export async function setPluginHolidayRegion(region) {
  const settings = await readSettings();
  settings.holidayRegion = region || 'us';
  localStorage.setItem('cultiva-holiday-region', settings.holidayRegion);
  const { saveSettings } = await import('../app/settings-controller.js');
  saveSettings();
  return settings.holidayRegion;
}

export async function setPluginShowTrophies(enabled) {
  const settings = await readSettings();
  settings.showTrophies = Boolean(enabled);
  const { saveSettings } = await import('../app/settings-controller.js');
  saveSettings();
  return settings.showTrophies;
}

export async function listPluginStorageKeys(storage, prefix) {
  const keys = [];
  if (typeof storage.listKeys === 'function') {
    const all = await storage.listKeys();
    for (const key of all) {
      if (String(key).startsWith(prefix)) {
        keys.push(String(key).slice(prefix.length));
      }
    }
    return keys;
  }
  return keys;
}

export function setPluginHeaderBadge(pluginId, badge) {
  const el = document.querySelector(
    `.header-plugin-item[data-plugin-id="${CSS.escape(pluginId)}"] .header-plugin-badge`
  );
  if (!el) {
    return false;
  }
  const text = badge === null || badge === '' ? '' : String(badge);
  el.textContent = text;
  el.style.display = text ? 'inline-flex' : 'none';
  return true;
}

export function focusPluginHabit(habitId) {
  const card = document.querySelector(`.habit-card[data-id="${CSS.escape(habitId)}"]`);
  if (!card) {
    return false;
  }
  card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  card.focus();
  return true;
}

export async function pluginUiConfirm(message, options = {}) {
  const { showConfirmDialog } = await import('../app/dialogs.js');
  return showConfirmDialog(message, options);
}

export async function pluginUiAlert(message, options = {}) {
  const { showAlertDialog } = await import('../app/dialogs.js');
  return showAlertDialog(message, options);
}

export function pluginUiOpenExternal(url) {
  const target = String(url || '').trim();
  if (!/^https?:\/\//i.test(target)) {
    throw new Error('Only http(s) URLs are allowed');
  }
  if (window.electron?.openExternal) {
    return window.electron.openExternal(target);
  }
  window.open(target, '_blank', 'noopener,noreferrer');
  return true;
}

export function getPluginAppearancePresetList() {
  return getPluginAppearancePresets().map((row) => ({
    id: row.id,
    label: row.label,
    theme: row.theme,
    background: row.background,
    sound: row.sound
  }));
}
