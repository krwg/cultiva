const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  encryptAuthSecret: (plainText) => ipcRenderer.invoke('auth:encrypt-secret', plainText),
  decryptAuthSecret: (b64) => ipcRenderer.invoke('auth:decrypt-secret', b64),
  navigateTo: (page) => ipcRenderer.invoke('navigate-to', page),
  openCalendarWindow: () => ipcRenderer.send('open-calendar-window'),
  onUpdateMessage: (callback) => ipcRenderer.on('update-message', (_event, message) => callback(message)),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  restartApp: () => ipcRenderer.send('restart-app'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  saveFile: (data, fileName) => ipcRenderer.invoke('save-file', data, fileName),
  exportBackupZip: (jsonPayload, fileName) => ipcRenderer.invoke('backup:export-zip', jsonPayload, fileName),
  parseBackupZip: (arrayBuffer) => ipcRenderer.invoke('backup:parse-zip', arrayBuffer),
  saveAutoBackup: (jsonPayload) => ipcRenderer.invoke('backup:save-automatic', jsonPayload),
  isElectron: true,
  platform: process.platform,
  readPluginFile: (filePath) => ipcRenderer.invoke('plugin:read-file', filePath),

  showNativeNotification: (payload) => ipcRenderer.invoke('native-notification:show', payload),
  syncTrayHabits: (habits) => ipcRenderer.invoke('tray:sync-habits', habits),
  onTrayCompleteHabit: (callback) => ipcRenderer.on('tray:complete-habit', (_event, habitId) => callback(habitId)),

  pluginHttpGet: (url) => ipcRenderer.invoke('plugin:http-get', url),
  installPlugin: (pluginId, files) => ipcRenderer.invoke('plugin:install', pluginId, files),
  uninstallPlugin: (pluginId) => ipcRenderer.invoke('plugin:uninstall', pluginId),
  isPluginDownloaded: (pluginId) => ipcRenderer.invoke('plugin:is-downloaded', pluginId),
  getPluginResourcePath: (pluginId, resourcePath) => ipcRenderer.invoke('plugin:get-resource-path', pluginId, resourcePath),
  setTitleBarOverlay: (options) => ipcRenderer.invoke('shell:set-titlebar-overlay', options),
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
  onWindowVisibility: (callback) => ipcRenderer.on('window-visibility', (_event, visible) => callback(visible)),
});

let discordEnabled = true;

contextBridge.exposeInMainWorld('discord', {
  updateActivity: (data) => {
    if (!discordEnabled) {return;}
    ipcRenderer.invoke('discord:update-activity', data);
  },
  getStatus: () => ipcRenderer.invoke('discord:status'),
  enable: () => {
    discordEnabled = true;
    return ipcRenderer.invoke('discord:enable');
  },
  disable: () => {
    discordEnabled = false;
    return ipcRenderer.invoke('discord:disable');
  }
});
