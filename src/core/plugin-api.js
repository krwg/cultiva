import { BRANDING } from './branding.js';
import { getTodayInTZ, getCultivaTimezone } from './timezone.js';
import { buildPluginHabitsSnapshot } from './plugin-habits-api.js';
import { pluginHasPermission } from './plugin-rpc.js';
import { getWeeklySummary } from './habit-analytics.js';

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
    readHabitsForAnalytics
  } = deps;

  if (method === 'storage.get' || method === 'storage.set' || method === 'storage.remove') {
    requirePermission(manifest, 'storage');
  }
  if (method === 'ui.showNotification') {
    requirePermission(manifest, 'ui');
  }
  if (method.startsWith('app.get') && method !== 'app.getHabits') {
    if (method === 'app.getSettings') {
      requirePermission(manifest, 'settings.read');
    } else {
      requirePermission(manifest, 'ui');
    }
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
  if (method === 'ui.showNotification') {
    const icon = args[0] ?? '';
    const text = args[1] ?? '';
    if (typeof window.showNotification === 'function') {
      window.showNotification(icon, text);
    }
    return undefined;
  }
  if (method === 'app.getLocale') {
    return settings.lang || 'en';
  }
  if (method === 'app.getThemeColor') {
    const key = String(args[0] || 'text-primary').replace(/^--/, '');
    return readThemeCssColor(`--${key}`);
  }
  if (method === 'app.getVersion') {
    return BRANDING.VERSION;
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
