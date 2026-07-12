import { BRANDING } from './branding.js';
import { getTodayInTZ, getCultivaTimezone } from './timezone.js';
import { buildPluginHabitsSnapshot } from './plugin-habits-api.js';
import { pluginHasPermission } from './plugin-rpc.js';
import { getWeeklySummary } from './habit-analytics.js';
import {
  getBuiltinThemeIdsForExtend,
  readThemeTokensFromDom,
  THEME_TOKEN_KEYS
} from './theme-tokens.js';
import { getPluginThemes, getPluginBackgrounds, getPluginSounds } from './plugin-contributions.js';
import {
  focusPluginHabit,
  getBuiltinBackgroundIds,
  getPluginAppearancePresetList,
  getPluginHabitById,
  getPluginHabitsCompletedToday,
  getPluginPlatform,
  getSanitizedManifest,
  isPluginDesktop,
  listPluginStorageKeys,
  logPluginHabitQuantity,
  openPluginCalendar,
  openPluginSettingsTab,
  pluginUiAlert,
  pluginUiConfirm,
  pluginUiOpenExternal,
  reloadPluginGarden,
  setPluginAccentColor,
  setPluginAmbientSound,
  setPluginFocusMode,
  setPluginHolidayRegion,
  setPluginLang,
  setPluginHeaderBadge,
  setPluginShowTrophies,
  syncPluginTray
} from './plugin-app-bridge.js';

function requirePermission(manifest, permission) {
  if (!pluginHasPermission(manifest, permission)) {
    throw new Error(`${permission} permission denied`);
  }
}

function buildPublicSettings(settings) {
  return {
    lang: settings.lang || 'en',
    theme: settings.theme || 'auto',
    holidayRegion: settings.holidayRegion || 'us',
    pluginsEnabled: settings.pluginsEnabled !== false,
    focusMode: settings.focusMode === true,
    showTrophies: settings.showTrophies === true,
    streakGraceEnabled: settings.streakGraceEnabled !== false
  };
}

export async function invokePluginRpc(method, args, manifest, deps) {
  const {
    storage,
    storagePrefix,
    settings,
    readThemeCssColor,
    readPluginDataFile,
    completeHabit,
    readHabitsForAnalytics,
    applyTheme,
    applyBackground,
    previewTheme,
    clearThemePreview,
    applyAppearancePreset,
    compareVersions,
    pluginId,
    manifestSummary
  } = deps;

  if (method === 'storage.get' || method === 'storage.set' || method === 'storage.remove' || method === 'storage.listKeys') {
    requirePermission(manifest, 'storage');
  }
  if (method === 'ui.showNotification' || method === 'ui.confirm' || method === 'ui.alert') {
    requirePermission(manifest, 'ui');
  }
  if (method === 'ui.openExternal') {
    requirePermission(manifest, 'network');
  }
  if (method.startsWith('app.get') && method !== 'app.getHabits') {
    if (method === 'app.getSettings') {
      requirePermission(manifest, 'settings.read');
    } else {
      requirePermission(manifest, 'ui');
    }
  }
  if (method === 'app.setTheme' || method === 'app.setBackground' || method === 'app.applyAppearancePreset'
    || method === 'app.setLang' || method === 'app.setFocusMode' || method === 'app.setAccentColor'
    || method === 'app.setAmbientSound' || method === 'app.setHolidayRegion' || method === 'app.setShowTrophies') {
    requirePermission(manifest, 'settings.write');
  }
  if (method === 'app.previewTheme' || method === 'app.clearThemePreview') {
    requirePermission(manifest, 'ui');
  }
  if (method === 'app.getHabits') {
    requirePermission(manifest, 'habits.read');
  }
  if (method === 'app.getWeeklySummary') {
    requirePermission(manifest, 'habits.read');
  }
  if (method === 'app.completeHabit') {
    requirePermission(manifest, 'habits.write');
  }
  if (method === 'data.read') {
    return readPluginDataFile(args[0]);
  }
  if (method === 'storage.get') {
    return storage.get(storagePrefix + args[0]);
  }
  if (method === 'storage.set') {
    return storage.set(storagePrefix + args[0], args[1]);
  }
  if (method === 'storage.remove') {
    return storage.set(storagePrefix + args[0], null);
  }
  if (method === 'storage.listKeys') {
    return listPluginStorageKeys(storage, storagePrefix);
  }
  if (method === 'ui.showNotification') {
    const icon = args[0] ?? '';
    const text = args[1] ?? '';
    if (typeof window.showNotification === 'function') {
      window.showNotification(icon, text);
    }
    return undefined;
  }
  if (method === 'ui.confirm') {
    const [message, options] = args;
    return pluginUiConfirm(String(message || ''), options || {});
  }
  if (method === 'ui.alert') {
    const [message, options] = args;
    return pluginUiAlert(String(message || ''), options || {});
  }
  if (method === 'ui.openExternal') {
    return pluginUiOpenExternal(String(args[0] || ''));
  }
  if (method === 'app.getLocale') {
    return settings.lang || 'en';
  }
  if (method === 'app.getThemeColor') {
    const key = String(args[0] || 'text-primary').replace(/^--/, '');
    return readThemeCssColor(`--${key}`);
  }
  if (method === 'app.getThemeTokens') {
    return readThemeTokensFromDom();
  }
  if (method === 'app.getThemeTokenKeys') {
    return [...THEME_TOKEN_KEYS];
  }
  if (method === 'app.getBuiltinThemes') {
    return getBuiltinThemeIdsForExtend();
  }
  if (method === 'app.getPluginThemes') {
    return getPluginThemes().map((row) => ({
      id: row.id,
      label: row.label,
      group: row.group,
      extends: row.extends || null
    }));
  }
  if (method === 'app.getPluginBackgrounds') {
    return getPluginBackgrounds().map((row) => ({ id: row.id, label: row.label }));
  }
  if (method === 'app.getPluginSounds') {
    return getPluginSounds().map((row) => ({ id: row.id, label: row.label }));
  }
  if (method === 'app.getVersion') {
    return BRANDING.VERSION;
  }
  if (method === 'app.getCodename') {
    return BRANDING.CODENAME;
  }
  if (method === 'app.getPlatform') {
    return getPluginPlatform();
  }
  if (method === 'app.isDesktop') {
    return isPluginDesktop();
  }
  if (method === 'app.getPluginId') {
    return pluginId || null;
  }
  if (method === 'app.getManifestSummary') {
    return manifestSummary || null;
  }
  if (method === 'app.compareVersions') {
    const a = String(args[0] || '');
    const b = String(args[1] || '');
    if (typeof compareVersions !== 'function') {
      return 0;
    }
    if (compareVersions(a, b)) {
      return 1;
    }
    if (compareVersions(b, a)) {
      return -1;
    }
    return 0;
  }
  if (method === 'app.getAccentColor') {
    return settings.accentColor || '';
  }
  if (method === 'app.setAccentColor') {
    return setPluginAccentColor(args[0] || '');
  }
  if (method === 'app.getBackgroundId') {
    return localStorage.getItem('cultiva-background') || 'none';
  }
  if (method === 'app.setAmbientSound') {
    return setPluginAmbientSound(args[0] || 'none');
  }
  if (method === 'app.setLang') {
    return setPluginLang(args[0]);
  }
  if (method === 'app.getFocusMode') {
    return settings.focusMode === true;
  }
  if (method === 'app.setFocusMode') {
    return setPluginFocusMode(args[0]);
  }
  if (method === 'app.getLowPowerMode') {
    return settings.lowPowerMode === true;
  }
  if (method === 'app.getShowTrophies') {
    return settings.showTrophies === true;
  }
  if (method === 'app.setShowTrophies') {
    return setPluginShowTrophies(args[0]);
  }
  if (method === 'app.getHolidayRegion') {
    return settings.holidayRegion || 'us';
  }
  if (method === 'app.setHolidayRegion') {
    return setPluginHolidayRegion(args[0]);
  }
  if (method === 'app.openSettings') {
    return openPluginSettingsTab(String(args[0] || 'appearance'));
  }
  if (method === 'app.openCalendar') {
    return openPluginCalendar();
  }
  if (method === 'app.reloadGarden') {
    reloadPluginGarden();
    return true;
  }
  if (method === 'app.syncTray') {
    syncPluginTray();
    return true;
  }
  if (method === 'app.getBuiltinBackgrounds') {
    return getBuiltinBackgroundIds();
  }
  if (method === 'app.getAppearancePresets') {
    return getPluginAppearancePresetList();
  }
  if (method === 'app.getHabit') {
    return getPluginHabitById(String(args[0] || ''));
  }
  if (method === 'app.getHabitsCompletedToday') {
    return getPluginHabitsCompletedToday();
  }
  if (method === 'app.logQuantity') {
    const habitId = String(args[0] || '');
    const value = Number(args[1]);
    if (!habitId || !Number.isFinite(value)) {
      throw new Error('Invalid habit id or quantity');
    }
    return logPluginHabitQuantity(habitId, value);
  }
  if (method === 'app.getToday') {
    return getTodayInTZ();
  }
  if (method === 'app.getTimezone') {
    const tz = getCultivaTimezone();
    return tz || 'auto';
  }
  if (method === 'app.getSettings') {
    return buildPublicSettings(settings);
  }
  if (method === 'app.setTheme') {
    const themeId = String(args[0] || '');
    if (!themeId || typeof applyTheme !== 'function') {
      throw new Error('Invalid theme id');
    }
    return applyTheme(themeId);
  }
  if (method === 'app.setBackground') {
    const bgId = String(args[0] || 'none');
    if (typeof applyBackground !== 'function') {
      throw new Error('Background API unavailable');
    }
    return applyBackground(bgId);
  }
  if (method === 'app.previewTheme') {
    const themeId = String(args[0] || '');
    if (!themeId || typeof previewTheme !== 'function') {
      throw new Error('Invalid theme id');
    }
    return previewTheme(themeId);
  }
  if (method === 'app.clearThemePreview') {
    if (typeof clearThemePreview !== 'function') {
      return null;
    }
    return clearThemePreview();
  }
  if (method === 'app.applyAppearancePreset') {
    const presetId = String(args[0] || '');
    if (!presetId || typeof applyAppearancePreset !== 'function') {
      throw new Error('Invalid preset id');
    }
    return applyAppearancePreset(presetId);
  }
  if (method === 'app.getHabits') {
    return buildPluginHabitsSnapshot();
  }
  if (method === 'app.getWeeklySummary') {
    const list = typeof readHabitsForAnalytics === 'function' ? readHabitsForAnalytics() : [];
    return getWeeklySummary(list);
  }
  if (method === 'app.completeHabit') {
    const habitId = String(args[0] || '');
    if (!habitId || typeof completeHabit !== 'function') {
      throw new Error('Invalid habit id');
    }
    return completeHabit(habitId);
  }

  throw new Error(`Unknown RPC method: ${method}`);
}

export function buildPublicAppSettings(settings) {
  return buildPublicSettings(settings);
}
