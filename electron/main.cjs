const { app, BrowserWindow, ipcMain, shell, session, dialog, safeStorage, Notification, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');
const isDev = process.env.NODE_ENV === 'development';
const { setupPluginIPC } = require('./plugin-ipc.cjs');
const discord = require('./lib/discord-rpc.cjs');
const trayMod = require('./lib/tray.cjs');
const { setupAutoUpdater, registerUpdaterIpc } = require('./lib/auto-updater.cjs');
const mainWindowMod = require('./lib/main-window.cjs');
const { registerCoreIpc } = require('./lib/ipc-main-handlers.cjs');
const { registerBackupIpc } = require('./lib/backup.cjs');
const { registerAutoBackupIpc } = require('./lib/zip-backup.cjs');
const { installAppMenu } = require('./lib/app-menu.cjs');
const { registerCultivaScheme, installCultivaProtocol, shouldUseCultivaProtocol } = require('./lib/cultiva-protocol.cjs');

registerCultivaScheme();

let mainWindow = null;
const getMainWindow = () => mainWindow;
const setMainWindow = (w) => {
  mainWindow = w;
};

function openMainWindow() {
  return mainWindowMod.createMainWindow({
    shell,
    BrowserWindow,
    pkg,
    isDev,
    setMainWindow,
    discord,
    setupAutoUpdater: () => setupAutoUpdater(getMainWindow)
  });
}

app.whenReady().then(() => {
  if (shouldUseCultivaProtocol(isDev)) {
    installCultivaProtocol();
  }
  if (process.platform === 'win32') {
    app.setAppUserModelId(pkg.build && pkg.build.appId ? pkg.build.appId : 'com.cultiva.app');
  }
  mainWindowMod.attachSessionContentSecurityPolicy({ isDev, session });
  setupPluginIPC();
  installAppMenu({ Menu, app, shell, getMainWindow, isDev });
  openMainWindow();
  discord.registerDiscordIpc(ipcMain);
  registerUpdaterIpc(ipcMain);
  registerCoreIpc(ipcMain, {
    getMainWindow,
    app,
    path,
    fs,
    dialog,
    safeStorage,
    Notification,
    resolveAppIconPath: mainWindowMod.resolveAppIconPath,
    trayMod,
    shell
  });
  registerBackupIpc(ipcMain, { getMainWindow, dialog });
  registerAutoBackupIpc(ipcMain);
  trayMod.initTray({
    getMainWindow,
    resolveAppIconPath: mainWindowMod.resolveAppIconPath
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      openMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  discord.shutdownDiscordRPC();
  if (process.platform === 'darwin') {
    return;
  }
  if (!app.isQuitting) {
    return;
  }
  app.quit();
});

app.on('before-quit', () => {
  discord.clearDiscordActivity();
  discord.shutdownDiscordRPC();
});
