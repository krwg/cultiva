import { getThemeBodyClassList, resolveThemeBodyId } from '../core/theme-config.js';
import { loadThemeCss } from '../core/theme-css-loader.js';
import { syncNativeShellChrome } from '../core/shell-chrome.js';
import { storage } from '../modules/storage.js';
import { settings, ensureAppReady } from './renderer-bootstrap.js';
import { applyTranslations } from './i18n-dom.js';
import { applyAccentColor, applyAmbientIntensity, applyLowPowerMode } from '../core/customization.js';
import { pluginManager } from '../core/plugin-manager.js';
import { bindHabitTemplates } from './habit-templates-ui.js';
import { refreshStorageBackendControls } from './storage-settings-ui.js';
import {
  getPluginBackgrounds,
  getPluginSounds,
  getPluginThemeBodyClasses,
  getPluginThemes,
  resolveContributionLabel
} from '../core/plugin-contributions.js';
import { playPluginAmbientSound } from '../core/plugin-sounds.js';
import { notifyAppearanceChanged } from '../core/appearance-sync.js';
import { BRANDING } from '../core/branding.js';
import { ensureI18nLocales, TRANSLATIONS } from '../core/i18n.js';
import { initHabitFormIcons, initSettingsSidebarIcons, initSettingsEmptyIcon } from '../core/ui-icons.js';
import { escapeHtml } from '../core/escape-html.js';
import { getGlyphSearchStatus } from '../core/glyph-search-index.js';

let ctx = null;
let _lastSavedLang = null;
let _lastSavedFocus = null;
let _lastSavedBg = null;

export function configureSettingsController(c) {
  ctx = c;
}

function requireCtx() {
  if (!ctx) {
    throw new Error('[settings-controller] configureSettingsController() was not called before using settings APIs');
  }
  return ctx;
}

export async function loadSettings() {
  try {
    await ensureAppReady();

    let saved = await storage.get('cultiva-settings');

    if (!saved) {
      const ls = localStorage.getItem('cultiva-settings');
      if (ls) {
        saved = JSON.parse(ls);
        await storage.set('cultiva-settings', saved);
      }
    }

    if (saved && typeof saved === 'object') {
      if (saved.lang) {
        settings.lang = saved.lang;
      }
      if (saved.theme) {
        settings.theme = saved.theme;
      }
      if (typeof saved.showTrophies === 'boolean') {
        settings.showTrophies = saved.showTrophies;
      }
      if (typeof saved.showNextTreeProgress === 'boolean') {
        settings.showNextTreeProgress = saved.showNextTreeProgress;
      }
      if (typeof saved.showGardenHeatmap === 'boolean') {
        settings.showGardenHeatmap = saved.showGardenHeatmap;
      }
      if (typeof saved.focusMode === 'boolean') {
        settings.focusMode = saved.focusMode;
      }
      if (typeof saved.focusAutoStart === 'boolean') {
        settings.focusAutoStart = saved.focusAutoStart;
      }
      if (typeof saved.focusHideChrome === 'boolean') {
        settings.focusHideChrome = saved.focusHideChrome;
      }
      if (saved.holidayRegion) {
        settings.holidayRegion = saved.holidayRegion;
      }
      if (saved.avatar) {
        settings.avatar = { ...settings.avatar, ...saved.avatar };
      }
      if (typeof saved.pluginsEnabled === 'boolean') {
        settings.pluginsEnabled = saved.pluginsEnabled;
      }
      if (typeof saved.nativeNotifyEnabled === 'boolean') {
        settings.nativeNotifyEnabled = saved.nativeNotifyEnabled;
      }
      if (typeof saved.nativeNotifyHabits === 'boolean') {
        settings.nativeNotifyHabits = saved.nativeNotifyHabits;
      }
      if (saved.nativeNotifyHabitsHour !== undefined && saved.nativeNotifyHabitsHour !== null) {
        const h = parseInt(String(saved.nativeNotifyHabitsHour), 10);
        if (!Number.isNaN(h)) {
          settings.nativeNotifyHabitsHour = Math.max(0, Math.min(23, h));
        }
      }
      if (typeof saved.nativeNotifyCalendar === 'boolean') {
        settings.nativeNotifyCalendar = saved.nativeNotifyCalendar;
      }
      if (saved.nativeNotifyCalendarLeadMinutes !== undefined && saved.nativeNotifyCalendarLeadMinutes !== null) {
        const m = parseInt(String(saved.nativeNotifyCalendarLeadMinutes), 10);
        if (!Number.isNaN(m)) {
          settings.nativeNotifyCalendarLeadMinutes = Math.max(5, Math.min(120, m));
        }
      }
      if (saved.pluginNotifyMuted && typeof saved.pluginNotifyMuted === 'object' && !Array.isArray(saved.pluginNotifyMuted)) {
        settings.pluginNotifyMuted = { ...saved.pluginNotifyMuted };
      }
      if (typeof saved.accentColor === 'string') {
        settings.accentColor = saved.accentColor;
      }
      if (saved.ambientIntensity !== undefined && saved.ambientIntensity !== null) {
        const ai = parseInt(String(saved.ambientIntensity), 10);
        if (!Number.isNaN(ai)) {
          settings.ambientIntensity = Math.max(0, Math.min(100, ai));
        }
      }
      if (typeof saved.lowPowerMode === 'boolean') {
        settings.lowPowerMode = saved.lowPowerMode;
      }
      if (typeof saved.firstRunComplete === 'boolean') {
        settings.firstRunComplete = saved.firstRunComplete;
      }
      if (typeof saved.autoBackupEnabled === 'boolean') {
        settings.autoBackupEnabled = saved.autoBackupEnabled;
      }
      if (typeof saved.streakGraceEnabled === 'boolean') {
        settings.streakGraceEnabled = saved.streakGraceEnabled;
      }
      if (typeof saved.checkUpdatesEnabled === 'boolean') {
        settings.checkUpdatesEnabled = saved.checkUpdatesEnabled;
      }
      if (typeof saved.autoUpdateEnabled === 'boolean') {
        settings.autoUpdateEnabled = saved.autoUpdateEnabled;
      }
      if (saved.storageBackend) {
        settings.storageBackend = saved.storageBackend;
      }
      if (Array.isArray(saved.gardenBeds)) {
        settings.gardenBeds = saved.gardenBeds;
      }
    }

    if (settings.focusAutoStart === true) {
      settings.focusMode = true;
    }

    requireCtx().setLangAndT(settings.lang);
    return settings;
  } catch (err) {
    console.warn('Failed to load settings:', err);
    return settings;
  }
}

export function refreshNativeNotificationControlsState() {
  const masterOn = settings.nativeNotifyEnabled !== false;
  ['toggle-native-notify-habits', 'toggle-native-notify-calendar'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.disabled = !masterOn;
    }
  });
  ['native-notify-habits-hour', 'native-notify-calendar-lead'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.disabled = !masterOn;
    }
  });
}

export function updateNotificationsDesktopBanner() {
  const b = document.getElementById('notifications-desktop-banner');
  if (b) {
    b.style.display = window.electron?.showNativeNotification ? 'none' : 'flex';
  }
}

export async function saveSettings() {
  const c = requireCtx();
  const prevLang = _lastSavedLang ?? settings.lang;
  const prevFocus = _lastSavedFocus ?? settings.focusMode;
  await ensureI18nLocales(settings.lang);
  storage.set('cultiva-settings', settings);
  c.setLangAndT(settings.lang);
  applySettings();
  c.renderGarden();
  bindHabitTemplates(settings.lang);
  pluginManager.triggerHook('onSettingsChange', settings);
  if (prevLang !== settings.lang) {
    void pluginManager.triggerHook('onLanguageChange', settings.lang);
    _lastSavedLang = settings.lang;
  }
  if (prevFocus !== settings.focusMode) {
    void pluginManager.triggerHook('onFocusModeChange', settings.focusMode);
    _lastSavedFocus = settings.focusMode;
  }
}

export function handleHolidayChange(e) {
  settings.holidayRegion = e.target.value;
  localStorage.setItem('cultiva-holiday-region', e.target.value);
  saveSettings();
}

export function applySettings() {
  const c = requireCtx();
  if (c.langSelect) {
    c.langSelect.value = settings.lang;
    if (c.langSelect.value !== settings.lang) {
      c.langSelect.value = settings.lang;
    }
  }
  applyTranslations(settings.lang);
  initSettingsSidebarIcons();
  initSettingsEmptyIcon();
  initHabitFormIcons();

  document.body.classList.remove(...getThemeBodyClassList(), ...getPluginThemeBodyClasses());

  const appliedTheme = resolveThemeBodyId(settings.theme);

  document.body.classList.add(`theme-${appliedTheme}`);
  void loadThemeCss(appliedTheme).then(async () => {
    await pluginManager.triggerHook('onThemeApplied', {
      theme: settings.theme,
      resolved: appliedTheme
    });
  });

  if (c.themeSelect) {
    c.themeSelect.value = settings.theme;
  }

  const trophySection = document.getElementById('trophy-section');
  if (trophySection) {
    trophySection.classList.toggle('hidden', settings.showTrophies !== true);
  }
  if (c.trophyToggle) {
    c.trophyToggle.checked = settings.showTrophies === true;
  }
  const nextTreeToggle = document.getElementById('toggle-next-tree');
  if (nextTreeToggle) {
    nextTreeToggle.checked = settings.showNextTreeProgress !== false;
  }
  const gardenHeatmapToggle = document.getElementById('toggle-garden-heatmap');
  if (gardenHeatmapToggle) {
    gardenHeatmapToggle.checked = settings.showGardenHeatmap !== false;
  }
  document.body.classList.toggle('focus-mode', settings.focusMode);
  document.body.classList.toggle('focus-hide-chrome', settings.focusMode && settings.focusHideChrome === true);
  if (c.focusToggle) {
    c.focusToggle.checked = settings.focusMode;
  }
  const focusAutoStartToggle = document.getElementById('toggle-focus-auto-start');
  if (focusAutoStartToggle) {
    focusAutoStartToggle.checked = settings.focusAutoStart === true;
  }
  const focusHideChromeToggle = document.getElementById('toggle-focus-hide-chrome');
  if (focusHideChromeToggle) {
    focusHideChromeToggle.checked = settings.focusHideChrome === true;
  }

  const streakGraceToggle = document.getElementById('toggle-streak-grace');
  if (streakGraceToggle) {
    streakGraceToggle.checked = settings.streakGraceEnabled !== false;
  }

  const checkUpdatesToggle = document.getElementById('toggle-check-updates');
  if (checkUpdatesToggle) {
    checkUpdatesToggle.checked = settings.checkUpdatesEnabled !== false;
  }
  const autoUpdateToggle = document.getElementById('toggle-auto-update');
  if (autoUpdateToggle) {
    autoUpdateToggle.checked = settings.autoUpdateEnabled === true;
  }

  const holidaySelect = document.getElementById('holiday-select');
  if (holidaySelect) {
    holidaySelect.value = settings.holidayRegion || 'us';
    holidaySelect.removeEventListener('change', handleHolidayChange);
    holidaySelect.addEventListener('change', handleHolidayChange);
  }

  const pluginsToggle = document.getElementById('toggle-plugins');
  if (pluginsToggle) {
    pluginsToggle.checked = settings.pluginsEnabled;
  }

  const toggleNativeMaster = document.getElementById('toggle-native-notify-master');
  if (toggleNativeMaster) {
    toggleNativeMaster.checked = settings.nativeNotifyEnabled !== false;
  }

  const toggleNativeHabits = document.getElementById('toggle-native-notify-habits');
  if (toggleNativeHabits) {
    toggleNativeHabits.checked = settings.nativeNotifyHabits !== false;
  }
  const nativeHabitsHour = document.getElementById('native-notify-habits-hour');
  if (nativeHabitsHour) {
    nativeHabitsHour.value = String(Math.max(0, Math.min(23, settings.nativeNotifyHabitsHour ?? 9)));
  }
  const toggleNativeCal = document.getElementById('toggle-native-notify-calendar');
  if (toggleNativeCal) {
    toggleNativeCal.checked = settings.nativeNotifyCalendar !== false;
  }
  const nativeCalLead = document.getElementById('native-notify-calendar-lead');
  if (nativeCalLead) {
    const lm = Math.max(5, Math.min(120, settings.nativeNotifyCalendarLeadMinutes ?? 30));
    nativeCalLead.value = String([5, 10, 15, 30, 45, 60, 90, 120].includes(lm) ? lm : 30);
  }

  refreshNativeNotificationControlsState();
  updateNotificationsDesktopBanner();
  refreshPluginNotifySettingsUi();
  void refreshCacheSizeDisplay();

  applyAccentColor(settings.accentColor);
  applyLowPowerMode(settings.lowPowerMode, settings.ambientIntensity);
  if (!settings.lowPowerMode) {
    applyAmbientIntensity(settings.ambientIntensity);
  }

  const accentInput = document.getElementById('accent-color-input');
  if (accentInput && settings.accentColor) {
    accentInput.value = settings.accentColor;
  }
  const intensitySlider = document.getElementById('ambient-intensity');
  if (intensitySlider) {
    intensitySlider.value = String(settings.ambientIntensity ?? 100);
    intensitySlider.disabled = settings.lowPowerMode;
  }
  const lowPowerToggle = document.getElementById('toggle-low-power');
  if (lowPowerToggle) {
    lowPowerToggle.checked = settings.lowPowerMode === true;
  }

  c.renderHeaderAvatar();

  localStorage.setItem('cultiva-theme', settings.theme);
  localStorage.setItem('cultiva-lang', settings.lang);
  syncNativeShellChrome();
  refreshStorageBackendControls();
  if (settings.pluginsEnabled) {
    import('./plugins-ui.js').then((m) => m.renderPluginsSection());
  }

  const currentBg = localStorage.getItem('cultiva-background') || 'none';
  if (_lastSavedBg !== null && _lastSavedBg !== currentBg) {
    void pluginManager.triggerHook('onBackgroundApplied', currentBg);
  }
  _lastSavedBg = currentBg;

  console.log('[Settings] Applied theme:', appliedTheme);
  notifyAppearanceChanged();
}

function appendPluginThemeOptions(optgroup, items) {
  if (!optgroup || !items.length) {
    return;
  }
  for (const item of items) {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = resolveContributionLabel(item, settings.lang);
    option.dataset.pluginGroup = '1';
    optgroup.appendChild(option);
  }
}

export function refreshAppearanceSelects() {
  const themeSelect = document.getElementById('theme-select');
  const bgSelect = document.getElementById('bg-select');
  const soundSelect = document.getElementById('ambient-sound-select');

  themeSelect?.querySelectorAll('option[data-plugin-group]').forEach((el) => el.remove());
  bgSelect?.querySelectorAll('option[data-plugin-bg]').forEach((el) => el.remove());
  soundSelect?.querySelectorAll('option[data-plugin-sound]').forEach((el) => el.remove());

  const pluginThemes = getPluginThemes();
  const lightThemes = pluginThemes.filter((row) => row.group === 'light');
  const darkThemes = pluginThemes.filter((row) => row.group !== 'light');

  if (themeSelect) {
    const lightGroup = themeSelect.querySelector('optgroup[data-i18n-label="themeGroupLight"]');
    const darkGroup = themeSelect.querySelector('optgroup[data-i18n-label="themeGroupDark"]');
    appendPluginThemeOptions(lightGroup, lightThemes);
    appendPluginThemeOptions(darkGroup, darkThemes);
    if (settings.theme) {
      themeSelect.value = settings.theme;
    }
  }

  if (bgSelect) {
    const customOption = bgSelect.querySelector('option[value="custom"]');
    for (const bg of getPluginBackgrounds()) {
      const option = document.createElement('option');
      option.value = bg.id;
      option.textContent = resolveContributionLabel(bg, settings.lang);
      option.dataset.pluginBg = '1';
      if (customOption) {
        bgSelect.insertBefore(option, customOption);
      } else {
        bgSelect.appendChild(option);
      }
    }
    const savedBg = localStorage.getItem('cultiva-background') || 'none';
    if (savedBg) {
      bgSelect.value = savedBg;
    }
  }

  if (soundSelect) {
    for (const sound of getPluginSounds()) {
      const option = document.createElement('option');
      option.value = sound.id;
      option.textContent = resolveContributionLabel(sound, settings.lang);
      option.dataset.pluginSound = '1';
      soundSelect.appendChild(option);
    }
    const savedSound = localStorage.getItem('cultiva-ambient-sound') || 'none';
    soundSelect.value = savedSound;
    void playPluginAmbientSound(savedSound === 'none' ? '' : savedSound);
  }
}

export function isPluginVersionCompatible(minAppVersion) {
  if (!minAppVersion) {
    return true;
  }
  return pluginManager.checkVersion(BRANDING.VERSION, minAppVersion);
}

function tStrings() {
  return TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '—';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function estimateLocalStorageBytes() {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) {
        continue;
      }
      const value = localStorage.getItem(key) || '';
      total += (key.length + value.length) * 2;
    }
  } catch {
    void 0;
  }
  return total;
}

async function estimateIndexedDbBytes() {
  try {
    if (navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      if (est && typeof est.usage === 'number') {
        return est.usage;
      }
    }
  } catch {
    void 0;
  }
  return 0;
}

export async function refreshCacheSizeDisplay() {
  const el = document.getElementById('cache-size-display');
  if (!el) {
    return;
  }
  const t = tStrings();
  el.textContent = t.cacheSizeCalculating || 'Calculating…';
  const lsBytes = estimateLocalStorageBytes();
  const idbBytes = await estimateIndexedDbBytes();
  const total = lsBytes + idbBytes;
  const glyph = getGlyphSearchStatus();
  const glyphHint = glyph.ready
    ? (t.cacheSizeIndexed || 'Search index · {n} items').replace('{n}', String(glyph.count || 0))
    : (t.cacheSizeNoIndex || 'No search index');
  el.textContent = `${formatBytes(total)} · ${glyphHint}`;
}

const CACHE_TEMP_KEYS = [
  'cultiva-releases-cache',
  'cultiva-releases-cache-time',
  'cultiva_glyph_search_index_v1',
  'cultiva_glyph_search_status_v1'
];

export async function clearAppCache() {
  for (const key of CACHE_TEMP_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      void 0;
    }
  }
  try {
    const { cacheInvalidate } = await import('../core/runtime-cache.js');
    cacheInvalidate('plugin-registry');
  } catch {
    void 0;
  }
  await refreshCacheSizeDisplay();
  const t = tStrings();
  if (typeof window.showNotification === 'function') {
    window.showNotification('✓', t.cacheCleared || 'Cache cleared');
  }
}

export function refreshPluginNotifySettingsUi() {
  const list = document.getElementById('plugin-notify-list');
  if (!list) {
    return;
  }
  const t = tStrings();
  const muted = settings.pluginNotifyMuted && typeof settings.pluginNotifyMuted === 'object'
    ? settings.pluginNotifyMuted
    : {};
  const plugins = pluginManager.getInstalledPlugins?.() || [];

  list.replaceChildren();

  if (!plugins.length) {
    const empty = document.createElement('div');
    empty.className = 'setting-item setting-item-static';
    empty.id = 'plugin-notify-empty';
    empty.innerHTML = `
      <div class="setting-info">
        <span class="setting-desc">${escapeHtml(t.pluginNotifyEmpty || 'No plugins installed')}</span>
      </div>
    `;
    list.appendChild(empty);
    return;
  }

  for (const plugin of plugins) {
    const id = String(plugin.id || '');
    if (!id) {
      continue;
    }
    const name = plugin.name || id;
    const isMuted = muted[id] === true;
    const row = document.createElement('div');
    row.className = 'setting-item';
    row.innerHTML = `
      <div class="setting-info">
        <span class="setting-label">${escapeHtml(name)}</span>
        <span class="setting-desc">${escapeHtml(t.pluginNotifyToggleDesc || 'Allow notifications from this plugin')}</span>
      </div>
      <label class="toggle-switch">
        <input type="checkbox" data-plugin-notify-id="${escapeHtml(id)}" ${isMuted ? '' : 'checked'}>
        <span class="toggle-slider"></span>
      </label>
    `;
    const input = row.querySelector('input[data-plugin-notify-id]');
    input?.addEventListener('change', () => {
      if (!settings.pluginNotifyMuted || typeof settings.pluginNotifyMuted !== 'object') {
        settings.pluginNotifyMuted = {};
      }
      if (input.checked) {
        delete settings.pluginNotifyMuted[id];
      } else {
        settings.pluginNotifyMuted[id] = true;
      }
      void saveSettings();
    });
    list.appendChild(row);
  }
}
