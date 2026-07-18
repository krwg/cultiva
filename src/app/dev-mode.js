/**
 * Cultiva Developer Mode — unlock via 7 taps on the footer version.
 * Session overrides + window.cultivaDev console API. Author: krwg.
 */
import {
  LEGACY_THRESHOLD as DEFAULT_LEGACY,
  MAX_ACTIVE_HABITS as DEFAULT_MAX_ACTIVE,
  MAX_HABITS_PER_BED as DEFAULT_MAX_BED,
  applySessionOverrides,
  clearSessionOverrides,
  getRuntimeConfig
} from '../core/config.js';
import { loadThemeCss } from '../core/theme-css-loader.js';
import { resolveThemeBodyId, THEME_BODY_IDS, AMBIENT_BG_LAYER_IDS } from '../core/theme-config.js';
import { settings } from './renderer-bootstrap.js';
import { saveSettings } from './settings-controller.js';
import { showNotification } from './ui-shell.js';
import { TRANSLATIONS } from '../core/i18n.js';
import { habits } from '../modules/habits.js';
import { pluginManager } from '../core/plugin-manager.js';
import { BRANDING } from '../core/branding.js';
import { toggleHabitWithHooks } from './habit-actions.js';

const UNLOCK_TAPS = 7;
const UNLOCK_WINDOW_MS = 2500;
const RPC_LOG_MAX = 200;

let tapCount = 0;
let tapTimer = null;
let chaosTimer = null;
let simulatedDate = null;
const rpcLog = [];
const rpcListeners = new Set();

function t() {
  return TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
}

export function isDeveloperMode() {
  return settings.developerMode === true;
}

export function getSimulatedNow() {
  if (simulatedDate instanceof Date && !Number.isNaN(simulatedDate.getTime())) {
    return new Date(simulatedDate.getTime());
  }
  return new Date();
}

export function recordPluginRpc(entry) {
  if (!isDeveloperMode()) {
    return;
  }
  const row = {
    ts: Date.now(),
    pluginId: entry.pluginId || '?',
    method: entry.method || '?',
    allowed: entry.allowed !== false,
    ms: entry.ms ?? null,
    error: entry.error || null
  };
  rpcLog.push(row);
  if (rpcLog.length > RPC_LOG_MAX) {
    rpcLog.shift();
  }
  rpcListeners.forEach((fn) => {
    try {
      fn(row);
    } catch {
      /* ignore */
    }
  });
  const list = document.getElementById('dev-rpc-log');
  if (list) {
    prependRpcRow(list, row);
  }
}

function prependRpcRow(list, row) {
  const el = document.createElement('div');
  el.className = `dev-rpc-row${row.allowed ? '' : ' dev-rpc-row--blocked'}`;
  const ms = row.ms != null ? ` · ${row.ms}ms` : '';
  const err = row.error ? ` · ${row.error}` : '';
  el.textContent = `${new Date(row.ts).toLocaleTimeString()}  ${row.pluginId}  ${row.method}${ms}${err}`;
  list.prepend(el);
  while (list.children.length > 80) {
    list.lastChild.remove();
  }
}

function printAsciiBanner() {
  const art = [
    '',
    '   🌱  C U L T I V A   D E V',
    '   ························',
    '   Garden tools for builders.',
    '   Do not paste code from strangers.',
    ''
  ].join('\n');
  console.log(`%c${art}`, 'color:#34c759;font-family:ui-monospace,monospace;font-size:12px;');
}

export async function enableDeveloperMode({ toast = true } = {}) {
  if (settings.developerMode) {
    syncDeveloperUi();
    exposeCultivaDev();
    return;
  }
  settings.developerMode = true;
  await saveSettings();
  syncDeveloperUi();
  exposeCultivaDev();
  printAsciiBanner();
  if (toast) {
    showNotification('🛠️', t().devModeUnlocked || 'You are now a developer');
  }
}

function leaveDeveloperSection() {
  const section = document.getElementById('section-developer');
  section?.classList.remove('active');
  const item = document.querySelector('.settings-sidebar-item[data-section="developer"]');
  item?.classList.remove('active');

  const fallback = document.querySelector('.settings-sidebar-item[data-section="appearance"]')
    || document.querySelector('.settings-sidebar-item[data-section="profile"]');
  if (fallback && typeof window.__cultivaActivateSettingsSection === 'function') {
    window.__cultivaActivateSettingsSection(fallback);
  }
}

/** Re-hide Developer in the sidebar; requires version taps to unlock again. */
export async function hideDeveloperMode() {
  settings.developerMode = false;
  settings.devAnimBackground = false;
  document.body.classList.remove('dev-secret-bg', 'dev-secret-bg--animated', 'developer-mode');
  leaveDeveloperSection();
  syncDeveloperUi();
  if (window.cultivaDev) {
    delete window.cultivaDev;
  }
  await saveSettings();
  // Re-assert after applySettings() (saveSettings → applySettings) which may touch body classes
  syncDeveloperUi();
  showNotification('', t().devModeHidden || 'Developer mode hidden');
}

export async function disableDeveloperMode() {
  settings.developerMode = false;
  settings.devAnimBackground = false;
  stopChaosMode();
  clearSessionOverrides();
  simulatedDate = null;
  document.body.classList.remove('dev-secret-bg', 'dev-secret-bg--animated', 'developer-mode');
  leaveDeveloperSection();
  syncDeveloperUi();
  if (window.cultivaDev) {
    delete window.cultivaDev;
  }
  await saveSettings();
  syncDeveloperUi();
  showNotification('', t().devModeDisabled || 'Developer mode off');
}

function syncDeveloperUi() {
  const unlocked = isDeveloperMode();
  const item = document.querySelector('.settings-sidebar-item[data-section="developer"]');
  if (item) {
    if (unlocked) {
      item.removeAttribute('hidden');
      item.setAttribute('aria-hidden', 'false');
    } else {
      item.setAttribute('hidden', '');
      item.setAttribute('aria-hidden', 'true');
      item.classList.remove('active');
      document.getElementById('section-developer')?.classList.remove('active');
    }
  }
  document.body.classList.toggle('developer-mode', unlocked);
  if (unlocked) {
    refreshDevPanel();
  } else {
    document.body.classList.remove('dev-secret-bg', 'dev-secret-bg--animated');
  }
}

function bindFooterUnlock() {
  document.querySelectorAll('.footer-version').forEach((el) => {
    if (el.dataset.devUnlockBound === '1') {
      return;
    }
    el.dataset.devUnlockBound = '1';
    el.style.cursor = 'pointer';
    el.title = 'Cultiva';
    el.addEventListener('click', async () => {
      if (isDeveloperMode()) {
        return;
      }
      tapCount += 1;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => {
        tapCount = 0;
      }, UNLOCK_WINDOW_MS);
      if (tapCount >= UNLOCK_TAPS) {
        tapCount = 0;
        clearTimeout(tapTimer);
        await enableDeveloperMode();
      }
    });
  });
}

function refreshDevPanel() {
  const cfg = getRuntimeConfig();
  const legacyInput = document.getElementById('dev-override-legacy');
  const bedInput = document.getElementById('dev-override-bed');
  const activeInput = document.getElementById('dev-override-active');
  if (legacyInput) {
    legacyInput.value = String(cfg.LEGACY_THRESHOLD);
  }
  if (bedInput) {
    bedInput.value = String(cfg.MAX_HABITS_PER_BED);
  }
  if (activeInput) {
    activeInput.value = String(cfg.MAX_ACTIVE_HABITS);
  }

  const flagIds = [
    ['dev-flag-trophies', 'showTrophies'],
    ['dev-flag-next-tree', 'showNextTreeProgress'],
    ['dev-flag-heatmap', 'showGardenHeatmap'],
    ['dev-flag-focus-chrome', 'focusHideChrome'],
    ['dev-flag-low-power', 'lowPowerMode'],
    ['dev-flag-auto-backup', 'autoBackupEnabled'],
    ['dev-flag-auto-update', 'autoUpdateEnabled'],
    ['dev-flag-check-updates', 'checkUpdatesEnabled'],
    ['dev-flag-force-reduced', 'devForceReducedMotion'],
    ['dev-flag-plugins', 'pluginsEnabled'],
    ['dev-flag-header-search', 'headerSearchEnabled'],
    ['dev-flag-anim-bg', 'devAnimBackground']
  ];
  for (const [id, key] of flagIds) {
    const el = document.getElementById(id);
    if (el) {
      el.checked = settings[key] === true;
    }
  }

  document.body.classList.toggle('ambient-paused', settings.devForceReducedMotion === true || settings.lowPowerMode === true);
  document.documentElement.classList.toggle('dev-force-reduced-motion', settings.devForceReducedMotion === true);
  document.body.classList.toggle('dev-secret-bg', settings.devAnimBackground === true);
  document.body.classList.toggle('dev-secret-bg--animated', settings.devAnimBackground === true);

  refreshDevHabitsList();
}

function refreshDevHabitsList() {
  const list = document.getElementById('dev-habits-list');
  if (!list) {
    return;
  }
  const all = habits.getAll().filter((h) => (h.progress || 0) < getRuntimeConfig().LEGACY_THRESHOLD);
  if (!all.length) {
    list.innerHTML = `<p class="setting-hint">${t().devHabitsEmpty || 'No habits'}</p>`;
    return;
  }
  list.innerHTML = all.map((h) => {
    const name = escapeHtml(h.treeName || h.name || h.id);
    const on = h.disabled !== true;
    return `<div class="dev-habit-row" data-id="${escapeHtml(h.id)}">
      <span class="dev-habit-name">${name}</span>
      <button type="button" class="btn-secondary dev-habit-toggle" data-id="${escapeHtml(h.id)}" data-on="${on ? '1' : '0'}">${on ? (t().devDisableHabit || 'Disable') : (t().devEnableHabit || 'Enable')}</button>
    </div>`;
  }).join('');
  list.querySelectorAll('.dev-habit-toggle').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const currentlyOn = btn.dataset.on === '1';
      await habits.setDisabled(id, currentlyOn);
      const { renderGarden } = await import('./garden-controller.js');
      renderGarden();
      refreshDevHabitsList();
      showNotification('', currentlyOn ? (t().devHabitDisabled || 'Habit disabled') : (t().devHabitEnabled || 'Habit enabled'));
    });
  });
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function applyFlagFromToggle(key, checked) {
  settings[key] = checked;
  if (key === 'lowPowerMode' || key === 'devForceReducedMotion') {
    document.body.classList.toggle('ambient-paused', settings.lowPowerMode || settings.devForceReducedMotion);
    document.documentElement.classList.toggle('dev-force-reduced-motion', settings.devForceReducedMotion === true);
  }
  if (key === 'devAnimBackground') {
    document.body.classList.toggle('dev-secret-bg', checked);
    document.body.classList.toggle('dev-secret-bg--animated', checked);
  }
  if (key === 'headerSearchEnabled') {
    document.body.classList.toggle('header-search-hidden', checked === false);
  }
  if (key === 'showTrophies' || key === 'showNextTreeProgress' || key === 'showGardenHeatmap') {
    const { renderGarden } = await import('./garden-controller.js');
    renderGarden();
  }
  await saveSettings();
}

function applyOverridesFromInputs() {
  const legacy = Number(document.getElementById('dev-override-legacy')?.value);
  const bed = Number(document.getElementById('dev-override-bed')?.value);
  const active = Number(document.getElementById('dev-override-active')?.value);
  applySessionOverrides({
    LEGACY_THRESHOLD: Number.isFinite(legacy) && legacy > 0 ? legacy : undefined,
    MAX_HABITS_PER_BED: Number.isFinite(bed) && bed > 0 ? bed : undefined,
    MAX_ACTIVE_HABITS: Number.isFinite(active) && active > 0 ? active : undefined
  });
  showNotification('', t().devOverridesApplied || 'Session overrides applied');
}

async function completeAllHabitsToday() {
  const { getTodayInTZ } = await import('../core/timezone.js');
  const today = getTodayInTZ();
  const garden = habits.getGardenHabits();
  let n = 0;
  for (const h of garden) {
    try {
      const done = h.trackType === 'quantity'
        ? habits.quantityDayProgress(h, today) >= habits.quantityTarget(h)
        : h.lastCompleted === today || (h.history || []).includes(today);
      if (!done) {
        if (h.trackType === 'quantity') {
          await toggleHabitWithHooks(h.id, habits.quantityTarget(h));
        } else {
          await toggleHabitWithHooks(h.id);
        }
        n += 1;
      }
    } catch {
      /* skip */
    }
  }
  const { renderGarden } = await import('./garden-controller.js');
  renderGarden();
  showNotification('✅', (t().devCompleteAllDone || 'Completed {n} habits').replace('{n}', String(n)));
}

function stopChaosMode() {
  if (chaosTimer) {
    clearInterval(chaosTimer);
    chaosTimer = null;
  }
  const btn = document.getElementById('dev-chaos-toggle');
  if (btn) {
    btn.textContent = t().devChaosStart || 'Start chaos themes';
  }
}

function startChaosMode(intervalMs = 4000) {
  stopChaosMode();
  const themes = THEME_BODY_IDS.slice();
  const bgs = ['none', ...AMBIENT_BG_LAYER_IDS];
  chaosTimer = setInterval(async () => {
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const bg = bgs[Math.floor(Math.random() * bgs.length)];
    settings.theme = theme;
    settings.background = bg;
    const resolved = resolveThemeBodyId(theme);
    const keep = ['developer-mode', 'ambient-paused', 'focus-mode', 'focus-hide-chrome', 'dev-secret-bg', 'with-ambient-bg', 'header-search-hidden']
      .filter((c) => document.body.classList.contains(c));
    document.body.className = [`theme-${resolved}`, ...keep].join(' ');
    await loadThemeCss(resolved);
    const bgSelect = document.getElementById('background-select');
    if (bgSelect) {
      bgSelect.value = bg;
      bgSelect.dispatchEvent(new Event('change'));
    }
  }, intervalMs);
  const btn = document.getElementById('dev-chaos-toggle');
  if (btn) {
    btn.textContent = t().devChaosStop || 'Stop chaos';
  }
}

async function seedFakeHabits(n = 3) {
  const count = Math.max(1, Math.min(12, Number(n) || 3));
  const created = [];
  for (let i = 0; i < count; i++) {
    try {
      const h = await habits.add({
        name: `Dev Seed ${Date.now() % 10000}-${i + 1}`,
        category: 'other',
        trackType: 'binary'
      });
      if (h?.id) {
        h.treeName = `🌱 Dev ${i + 1}`;
        h.progress = Math.min(getRuntimeConfig().LEGACY_THRESHOLD - 1, 3 + i * 7);
        const all = habits.getAll();
        const idx = all.findIndex((x) => x.id === h.id);
        if (idx >= 0) {
          all[idx] = h;
          const { storage } = await import('../modules/storage.js');
          await storage.saveHabits(all);
        }
        created.push(h.id);
      }
    } catch (err) {
      console.warn('[cultivaDev] seedFakeHabits', err);
      break;
    }
  }
  return created;
}

function exportDebugState() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: BRANDING.VERSION,
    codename: BRANDING.CODENAME,
    simulatedDate: simulatedDate ? simulatedDate.toISOString() : null,
    runtimeConfig: getRuntimeConfig(),
    settings: { ...settings },
    habits: habits.getAll(),
    plugins: (pluginManager.getInstalledPlugins?.() || []).map((p) => ({
      id: p.id,
      version: p.manifest?.version || p.version,
      enabled: p.enabled !== false
    })),
    rpcLogTail: rpcLog.slice(-50)
  };
  const text = JSON.stringify(payload, null, 2);
  try {
    navigator.clipboard?.writeText(text);
  } catch {
    /* ignore */
  }
  console.log('[cultivaDev] exportDebugState', payload);
  return payload;
}

function exposeCultivaDev() {
  window.cultivaDev = {
    version: BRANDING.VERSION,
    isEnabled: () => isDeveloperMode(),
    disable: () => disableDeveloperMode(),
    getConfig: () => getRuntimeConfig(),
    setOverrides: (partial) => applySessionOverrides(partial || {}),
    clearOverrides: () => clearSessionOverrides(),
    seedFakeHabits,
    simulateDate: (dateString) => {
      if (!dateString) {
        simulatedDate = null;
        return null;
      }
      const d = new Date(dateString);
      if (Number.isNaN(d.getTime())) {
        throw new Error('Invalid date');
      }
      simulatedDate = d;
      return simulatedDate.toISOString();
    },
    getSimulatedNow: () => getSimulatedNow().toISOString(),
    exportDebugState,
    completeAllToday: () => completeAllHabitsToday(),
    startChaos: (ms) => startChaosMode(ms),
    stopChaos: () => stopChaosMode(),
    enableSecretBg: () => {
      document.body.classList.add('dev-secret-bg');
    },
    disableSecretBg: () => {
      document.body.classList.remove('dev-secret-bg');
    },
    setDisabled: async (id, disabled = true) => {
      await habits.setDisabled(id, disabled);
      const { renderGarden } = await import('./garden-controller.js');
      renderGarden();
      refreshDevHabitsList();
    },
    getRpcLog: () => rpcLog.slice(),
    onRpc: (fn) => {
      rpcListeners.add(fn);
      return () => rpcListeners.delete(fn);
    },
    help: () => {
      console.log('cultivaDev: seedFakeHabits, simulateDate, exportDebugState, completeAllToday, setOverrides, startChaos, getRpcLog');
    }
  };
}

function bindDevPanelControls() {
  document.getElementById('dev-apply-overrides')?.addEventListener('click', () => {
    applyOverridesFromInputs();
  });
  document.getElementById('dev-clear-overrides')?.addEventListener('click', () => {
    clearSessionOverrides();
    refreshDevPanel();
    showNotification('', t().devOverridesCleared || 'Overrides cleared');
  });
  document.getElementById('dev-complete-all')?.addEventListener('click', () => {
    void completeAllHabitsToday();
  });
  document.getElementById('dev-seed-habits')?.addEventListener('click', async () => {
    await seedFakeHabits(3);
    const { renderGarden } = await import('./garden-controller.js');
    renderGarden();
    showNotification('', t().devSeeded || 'Seeded test habits');
  });
  document.getElementById('dev-export-state')?.addEventListener('click', () => {
    exportDebugState();
    showNotification('', t().devExported || 'Debug state copied / logged');
  });
  document.getElementById('dev-chaos-toggle')?.addEventListener('click', () => {
    if (chaosTimer) {
      stopChaosMode();
    } else {
      startChaosMode();
    }
  });
  document.getElementById('dev-secret-bg')?.addEventListener('click', () => {
    document.body.classList.toggle('dev-secret-bg');
    document.body.classList.toggle('dev-secret-bg--animated', document.body.classList.contains('dev-secret-bg'));
    settings.devAnimBackground = document.body.classList.contains('dev-secret-bg');
    void saveSettings();
  });
  document.getElementById('dev-hide')?.addEventListener('click', () => {
    void hideDeveloperMode();
  });
  document.getElementById('dev-disable')?.addEventListener('click', () => {
    void disableDeveloperMode();
  });
  document.getElementById('dev-boost-legacy')?.addEventListener('click', async () => {
    const cfg = getRuntimeConfig();
    const candidate = habits.getNextLegacyCandidate?.() || habits.getGardenHabits()[0];
    if (!candidate) {
      showNotification('', t().devNoHabits || 'No habits');
      return;
    }
    const all = habits.getAll();
    const h = all.find((x) => x.id === candidate.id);
    if (h) {
      h.progress = Math.max(0, cfg.LEGACY_THRESHOLD - 1);
      const { storage } = await import('../modules/storage.js');
      await storage.saveHabits(all);
      const { renderGarden } = await import('./garden-controller.js');
      renderGarden();
      showNotification('', t().devBoosted || 'Boosted toward Legacy');
    }
  });
  document.getElementById('dev-reload-plugins')?.addEventListener('click', async () => {
    try {
      await pluginManager.init?.();
      showNotification('', t().devPluginsReloaded || 'Plugins reloaded');
    } catch (err) {
      console.warn('[dev] reload plugins', err);
    }
  });
  document.getElementById('dev-open-storage')?.addEventListener('click', () => {
    if (typeof window.__cultivaActivateSettingsSection === 'function') {
      const item = document.querySelector('.settings-sidebar-item[data-section="data"]');
      if (item) {
        window.__cultivaActivateSettingsSection(item);
      }
    }
  });
  document.getElementById('dev-copy-rpc')?.addEventListener('click', () => {
    const text = JSON.stringify(rpcLog.slice(-100), null, 2);
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      /* ignore */
    }
    showNotification('', t().devRpcCopied || 'RPC log copied');
  });
  document.getElementById('dev-simulate-date')?.addEventListener('change', (e) => {
    const v = e.target.value;
    if (!v) {
      simulatedDate = null;
      return;
    }
    simulatedDate = new Date(`${v}T12:00:00`);
  });
  document.getElementById('dev-clear-rpc')?.addEventListener('click', () => {
    rpcLog.length = 0;
    const list = document.getElementById('dev-rpc-log');
    if (list) {
      list.innerHTML = '';
    }
  });

  const flagMap = {
    'dev-flag-trophies': 'showTrophies',
    'dev-flag-next-tree': 'showNextTreeProgress',
    'dev-flag-heatmap': 'showGardenHeatmap',
    'dev-flag-focus-chrome': 'focusHideChrome',
    'dev-flag-low-power': 'lowPowerMode',
    'dev-flag-auto-backup': 'autoBackupEnabled',
    'dev-flag-auto-update': 'autoUpdateEnabled',
    'dev-flag-check-updates': 'checkUpdatesEnabled',
    'dev-flag-force-reduced': 'devForceReducedMotion',
    'dev-flag-plugins': 'pluginsEnabled',
    'dev-flag-header-search': 'headerSearchEnabled',
    'dev-flag-anim-bg': 'devAnimBackground'
  };
  for (const [id, key] of Object.entries(flagMap)) {
    document.getElementById(id)?.addEventListener('change', (e) => {
      void applyFlagFromToggle(key, e.target.checked);
    });
  }
}

export function initDeveloperMode() {
  if (!Object.prototype.hasOwnProperty.call(settings, 'developerMode')) {
    settings.developerMode = false;
  }
  if (!Object.prototype.hasOwnProperty.call(settings, 'devForceReducedMotion')) {
    settings.devForceReducedMotion = false;
  }
  if (!Object.prototype.hasOwnProperty.call(settings, 'devAnimBackground')) {
    settings.devAnimBackground = false;
  }
  // Always start hidden — unlock only via 7 taps on the footer version this session.
  if (settings.developerMode) {
    settings.developerMode = false;
    void saveSettings();
  }
  bindFooterUnlock();
  bindDevPanelControls();
  syncDeveloperUi();
}

export const DEV_DEFAULTS = {
  LEGACY_THRESHOLD: DEFAULT_LEGACY,
  MAX_ACTIVE_HABITS: DEFAULT_MAX_ACTIVE,
  MAX_HABITS_PER_BED: DEFAULT_MAX_BED
};
