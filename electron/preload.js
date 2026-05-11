const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  navigateTo: (page) => ipcRenderer.invoke('navigate-to', page),
  openCalendarWindow: () => ipcRenderer.send('open-calendar-window'),
  onUpdateMessage: (callback) => ipcRenderer.on('update-message', (_event, message) => callback(message)),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  restartApp: () => ipcRenderer.send('restart-app'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  saveFile: (data, fileName) => ipcRenderer.invoke('save-file', data, fileName),
  isElectron: true,
  readPluginFile: (filePath) => ipcRenderer.invoke('plugin:read-file', filePath),
  installPlugin: (pluginId, files) => ipcRenderer.invoke('plugin:install', pluginId, files),
  uninstallPlugin: (pluginId) => ipcRenderer.invoke('plugin:uninstall', pluginId),
  getPluginResourcePath: (pluginId, resourcePath) => ipcRenderer.invoke('plugin:get-resource-path', pluginId, resourcePath),
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