import { storage } from '../modules/storage.js';
import { auth } from '../modules/auth.js';
import { pluginManager } from '../core/plugin-manager.js';
import { resolveThemeBodyId } from '../core/theme-config.js';
import { loadThemeCss } from '../core/theme-css-loader.js';
import { ensureI18nLocales } from '../core/i18n.js';

export const DEFAULT_SETTINGS = {
  lang: 'en',
  theme: 'auto',
  showTrophies: false,
  showNextTreeProgress: true,
  showGardenHeatmap: true,
  focusMode: false,
  focusAutoStart: false,
  focusHideChrome: false,
  holidayRegion: 'us',
  avatar: { background: 'green', emoji: '🌱' },
  pluginsEnabled: true,
  nativeNotifyEnabled: true,
  nativeNotifyHabits: true,
  nativeNotifyHabitsHour: 9,
  nativeNotifyCalendar: true,
  nativeNotifyCalendarLeadMinutes: 30,
  pluginNotifyMuted: {},
  accentColor: '',
  ambientIntensity: 100,
  lowPowerMode: false,
  firstRunComplete: false,
  autoBackupEnabled: true,
  streakGraceEnabled: true,
  checkUpdatesEnabled: true,
  autoUpdateEnabled: false,
  headerSearchEnabled: true,
  glyphSearchEnhanced: true,
  storageBackend: 'local',
  gardenBeds: []
};

export const settings = { ...DEFAULT_SETTINGS };

const _preInitSettings = localStorage.getItem('cultiva-settings');
if (_preInitSettings) {
  try {
    const parsed = JSON.parse(_preInitSettings);
    if (parsed && typeof parsed === 'object') {
      if ('lang' in parsed || 'theme' in parsed) {
        Object.assign(settings, parsed);
      } else if (parsed['cultiva-settings'] && typeof parsed['cultiva-settings'] === 'object') {
        Object.assign(settings, parsed['cultiva-settings']);
      }
    }
  } catch {
    console.warn('[Pre-init] Invalid settings JSON');
  }
}

(function applyInitialTheme() {
  const t = settings.theme || 'auto';
  const resolved = resolveThemeBodyId(t);
  document.body.className = `theme-${resolved}`;
  void loadThemeCss(resolved);
})();

let _appReady = null;

export async function ensureAppReady() {
  if (_appReady) {
    return _appReady;
  }

  _appReady = (async () => {
    await storage.init();
    storage.setStorageAuthProbe(() => auth.isAuthenticated());
    await ensureI18nLocales(settings.lang);
    await auth.init();
    if (settings.pluginsEnabled) {
      await pluginManager.init();
    }
  })();

  return _appReady;
}
