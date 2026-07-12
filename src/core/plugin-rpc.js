export const PLUGIN_RPC_METHODS = new Set([
  'storage.get',
  'storage.set',
  'storage.remove',
  'storage.listKeys',
  'ui.showNotification',
  'ui.confirm',
  'ui.alert',
  'ui.openExternal',
  'data.read',
  'app.getLocale',
  'app.getThemeColor',
  'app.getThemeTokens',
  'app.getThemeTokenKeys',
  'app.getBuiltinThemes',
  'app.getPluginThemes',
  'app.getPluginBackgrounds',
  'app.getPluginSounds',
  'app.getVersion',
  'app.getCodename',
  'app.getPlatform',
  'app.isDesktop',
  'app.getPluginId',
  'app.getManifestSummary',
  'app.compareVersions',
  'app.getAccentColor',
  'app.setAccentColor',
  'app.getBackgroundId',
  'app.setAmbientSound',
  'app.setLang',
  'app.getFocusMode',
  'app.setFocusMode',
  'app.getLowPowerMode',
  'app.getShowTrophies',
  'app.setShowTrophies',
  'app.getHolidayRegion',
  'app.setHolidayRegion',
  'app.openSettings',
  'app.openCalendar',
  'app.reloadGarden',
  'app.syncTray',
  'app.getBuiltinBackgrounds',
  'app.getAppearancePresets',
  'app.getHabit',
  'app.getHabitsCompletedToday',
  'app.logQuantity',
  'app.getToday',
  'app.getTimezone',
  'app.getSettings',
  'app.setTheme',
  'app.setBackground',
  'app.previewTheme',
  'app.clearThemePreview',
  'app.applyAppearancePreset',
  'app.getHabits',
  'app.getWeeklySummary',
  'app.completeHabit'
]);

export function isAllowedPluginRpcMethod(method) {
  return PLUGIN_RPC_METHODS.has(method);
}

export function pluginHasPermission(manifest, permission) {
  const perms = manifest?.permissions;
  if (!Array.isArray(perms)) {
    return false;
  }
  return perms.includes(permission);
}
