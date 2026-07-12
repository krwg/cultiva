import { getThemeBodyClassList, resolveThemeBodyId, LS_CUSTOM_BG_DATA } from './theme-config.js';
import { getPluginThemeBodyClasses } from './plugin-contributions.js';
import { applyAmbientBackground, readCustomBackgroundDataUrl } from './ambient-bg.js';
import { loadThemeCss, loadAmbientCss } from './theme-css-loader.js';
import { applyAccentColor, applyAmbientIntensity, applyLowPowerMode } from './customization.js';

export const APPEARANCE_CHANGED_EVENT = 'cultiva-appearance-changed';

/** Cultiva mirrors settings to localStorage as a keyed bundle or flat app settings. */
export function readAppSettingsSnapshot() {
  try {
    const raw = localStorage.getItem('cultiva-settings');
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    if ('theme' in parsed || 'lang' in parsed) {
      return parsed;
    }
    const nested = parsed['cultiva-settings'];
    if (nested && typeof nested === 'object') {
      return nested;
    }
  } catch {
    void 0;
  }
  return null;
}

export function readStoredTheme() {
  const direct = localStorage.getItem('cultiva-theme');
  if (direct !== null && String(direct).trim()) {
    return String(direct).trim();
  }
  const app = readAppSettingsSnapshot();
  if (app && typeof app.theme === 'string' && app.theme.trim()) {
    return app.theme.trim();
  }
  return 'auto';
}

export async function readStoredThemeFromStorage(storageInstance) {
  if (storageInstance?.get) {
    try {
      const saved = await storageInstance.get('cultiva-settings');
      if (saved && typeof saved.theme === 'string' && saved.theme.trim()) {
        return saved.theme.trim();
      }
    } catch {
      void 0;
    }
  }
  return readStoredTheme();
}

export function readStoredBackground() {
  let bg = localStorage.getItem('cultiva-background') || 'none';
  if (bg === 'custom' && !readCustomBackgroundDataUrl()) {
    bg = 'none';
  }
  return bg;
}

export function readAppearanceSettings() {
  const defaults = {
    accentColor: '',
    ambientIntensity: 100,
    lowPowerMode: false
  };
  const app = readAppSettingsSnapshot();
  if (!app) {
    return defaults;
  }
  return {
    accentColor: typeof app.accentColor === 'string' ? app.accentColor : '',
    ambientIntensity: app.ambientIntensity ?? 100,
    lowPowerMode: app.lowPowerMode === true
  };
}

export async function readAppearanceSettingsFromStorage(storageInstance) {
  if (storageInstance?.get) {
    try {
      const saved = await storageInstance.get('cultiva-settings');
      if (saved && typeof saved === 'object') {
        return {
          accentColor: typeof saved.accentColor === 'string' ? saved.accentColor : '',
          ambientIntensity: saved.ambientIntensity ?? 100,
          lowPowerMode: saved.lowPowerMode === true
        };
      }
    } catch {
      void 0;
    }
  }
  return readAppearanceSettings();
}

export function applyAppearanceCustomization(settingsOverride) {
  const settings = settingsOverride || readAppearanceSettings();
  applyAccentColor(settings.accentColor);
  applyLowPowerMode(settings.lowPowerMode, settings.ambientIntensity);
  if (!settings.lowPowerMode) {
    applyAmbientIntensity(settings.ambientIntensity);
  }
}

export function createAppearanceSync(doc = document) {
  const body = doc.body;
  let lastThemeId = '';
  let lastBgId = '';
  let lastCustomBg = '';

  async function syncTheme(force = false, themeSetting) {
    const theme = themeSetting ?? readStoredTheme();
    const appliedTheme = resolveThemeBodyId(theme);
    if (!force && appliedTheme === lastThemeId) {
      return appliedTheme;
    }
    lastThemeId = appliedTheme;
    body.classList.remove(...getThemeBodyClassList(), ...getPluginThemeBodyClasses());
    body.classList.add(`theme-${appliedTheme}`);
    await loadThemeCss(appliedTheme);
    return appliedTheme;
  }

  function syncBackground(force = false) {
    const bg = readStoredBackground();
    const customSig = bg === 'custom' ? readCustomBackgroundDataUrl() : '';
    if (!force && bg === lastBgId && customSig === lastCustomBg) {
      return bg;
    }
    lastBgId = bg;
    lastCustomBg = customSig;
    applyAmbientBackground(doc, body, bg);
    void loadAmbientCss(bg);
    return bg;
  }

  async function syncAll(force = false, options = {}) {
    const appearance = options.appearanceSettings
      ?? (options.storage ? await readAppearanceSettingsFromStorage(options.storage) : readAppearanceSettings());
    applyAppearanceCustomization(appearance);
    const theme = options.theme
      ?? (options.storage ? await readStoredThemeFromStorage(options.storage) : readStoredTheme());
    await syncTheme(force, theme);
    syncBackground(force);
  }

  function resetCache() {
    lastThemeId = '';
    lastBgId = '';
    lastCustomBg = '';
  }

  function bindAutoSync(options = {}) {
    const { onAfterSync, storage: storageInstance } = options;

    const run = (force = false) => {
      void syncAll(force, { storage: storageInstance }).then(() => {
        if (typeof onAfterSync === 'function') {
          onAfterSync();
        }
      });
    };

    window.addEventListener('storage', (e) => {
      const keys = [
        'cultiva-theme',
        'cultiva-settings',
        'cultiva-background',
        LS_CUSTOM_BG_DATA
      ];
      if (!e.key || !keys.includes(e.key)) {
        return;
      }
      resetCache();
      run(true);
    });

    window.addEventListener(APPEARANCE_CHANGED_EVENT, () => {
      resetCache();
      run(true);
    });

    window.addEventListener('focus', () => run(true));

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        resetCache();
        run(true);
      }
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (readStoredTheme() === 'auto') {
        resetCache();
        run(true);
      }
    });
  }

  return {
    syncTheme,
    syncBackground,
    syncAll,
    resetCache,
    bindAutoSync
  };
}

export function notifyAppearanceChanged() {
  window.dispatchEvent(new CustomEvent(APPEARANCE_CHANGED_EVENT));
}
