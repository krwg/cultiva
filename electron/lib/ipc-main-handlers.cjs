const { writeFile } = require('fs/promises');
const { CULTIVA_APP_URL, CULTIVA_CALENDAR_URL, shouldUseCultivaProtocol } = require('./cultiva-protocol.cjs');
const { attachCultivaNavigation } = require('./cultiva-navigation.cjs');

function registerCoreIpc(ipcMain, {
  getMainWindow,
  app,
  path,
  fs,
  dialog,
  safeStorage,
  Notification,
  resolveAppIconPath,
  trayMod,
  shell
}) {
  let authSessionUnlocked = false;

  function isTrustedAuthSender(event) {
    try {
      const wc = event?.sender;
      if (!wc || wc.isDestroyed?.()) {
        return false;
      }
      const mainWindow = getMainWindow();
      if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents === wc) {
        return true;
      }
      const { BrowserWindow } = require('electron');
      const win = BrowserWindow.fromWebContents(wc);
      return Boolean(win && !win.isDestroyed());
    } catch {
      return false;
    }
  }

  ipcMain.handle('save-file', async (event, data, fileName) => {
    const mainWindow = getMainWindow();
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save backup',
      defaultPath: fileName,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (filePath) {
      await writeFile(filePath, data);
      return { success: true, path: filePath };
    }
    return { success: false };
  });

  ipcMain.handle('navigate-to', (event, page) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) {
      return { success: false };
    }

    const isDev = process.env.NODE_ENV === 'development';
    if (shouldUseCultivaProtocol(isDev)) {
      const normalized = String(page || '').replace(/^\/+/, '');
      const target = normalized.includes('calendar')
        ? CULTIVA_CALENDAR_URL
        : CULTIVA_APP_URL;
      mainWindow.loadURL(target);
      return { success: true };
    }

    const pagePath = path.join(__dirname, '../../dist', page);
    console.log('[Electron] Navigating to:', pagePath);

    if (fs.existsSync(pagePath)) {
      mainWindow.loadFile(pagePath);
      return { success: true };
    }

    console.error('[Electron] Page not found:', pagePath);
    return { success: false, error: 'Page not found' };
  });

  ipcMain.on('open-calendar-window', () => {
    const { BrowserWindow } = require('electron');
    const mainWindow = getMainWindow();
    const calendarWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      parent: mainWindow,
      modal: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.cjs'),
        webviewTag: false,
        sandbox: true
      },
      icon: resolveAppIconPath()
    });

    const calendarPath = path.join(__dirname, '../../dist/pages/calendar/index.html');
    if (shouldUseCultivaProtocol(process.env.NODE_ENV === 'development')) {
      calendarWindow.loadURL(CULTIVA_CALENDAR_URL);
    } else if (fs.existsSync(calendarPath)) {
      calendarWindow.loadFile(calendarPath);
    } else {
      console.error('[Electron] Calendar page not found:', calendarPath);
      calendarWindow.close();
      return;
    }

    attachCultivaNavigation(calendarWindow, { isDev: process.env.NODE_ENV === 'development' });
  });

  ipcMain.handle('get-app-path', () => {
    return {
      dist: path.join(__dirname, '../../dist'),
      userData: app.getPath('userData')
    };
  });

  ipcMain.handle('auth:encrypt-secret', (event, plainText) => {
    try {
      if (!isTrustedAuthSender(event)) {
        return { ok: false, error: 'Unauthorized' };
      }
      if (!safeStorage.isEncryptionAvailable()) {
        return { ok: false, error: 'OS encryption is not available for safeStorage' };
      }
      const buf = safeStorage.encryptString(String(plainText));
      return { ok: true, data: Buffer.from(buf).toString('base64') };
    } catch (e) {
      return { ok: false, error: e && e.message ? e.message : String(e) };
    }
  });

  ipcMain.handle('auth:set-session-active', (event, active) => {
    if (!isTrustedAuthSender(event)) {
      return { ok: false, error: 'Unauthorized' };
    }
    authSessionUnlocked = Boolean(active);
    return { ok: true };
  });

  ipcMain.handle('native-notification:show', (event, payload) => {
    try {
      if (!Notification.isSupported()) {
        return { ok: false, error: 'Notifications not supported' };
      }
      const title = String((payload && payload.title) || 'Cultiva').slice(0, 256);
      const body = String((payload && payload.body) || '').slice(0, 2000);
      const silent = Boolean(payload && payload.silent);
      const iconPath = resolveAppIconPath();
      const n = new Notification({
        title,
        body,
        silent,
        icon: iconPath
      });
      n.show();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e && e.message ? e.message : String(e) };
    }
  });

  ipcMain.handle('auth:decrypt-secret', (event, b64) => {
    try {
      if (!isTrustedAuthSender(event)) {
        return { ok: false, error: 'Unauthorized' };
      }
      if (!authSessionUnlocked) {
        return { ok: false, error: 'Auth session locked' };
      }
      const buf = Buffer.from(String(b64), 'base64');
      const data = safeStorage.decryptString(buf);
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e && e.message ? e.message : String(e) };
    }
  });

  ipcMain.handle('tray:sync-habits', (event, habitList) => {
    try {
      if (trayMod && typeof trayMod.updateTrayHabits === 'function') {
        trayMod.updateTrayHabits(habitList);
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e && e.message ? e.message : String(e) };
    }
  });

  ipcMain.handle('shell:set-titlebar-overlay', (event, options) => {
    const mainWindow = getMainWindow();
    if (!mainWindow || process.platform !== 'win32') {
      return { ok: false };
    }
    try {
      const payload = options && typeof options === 'object' ? options : {};
      mainWindow.setTitleBarOverlay({
        color: String(payload.color || '#1c1c1e'),
        symbolColor: String(payload.symbolColor || '#f5f5f7'),
        height: Number(payload.height) || 32
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e && e.message ? e.message : String(e) };
    }
  });

  ipcMain.handle('shell:open-external', async (event, url) => {
    const target = String(url || '').trim();
    if (!/^https?:\/\//i.test(target)) {
      return { ok: false, error: 'Invalid URL' };
    }
    if (!shell?.openExternal) {
      return { ok: false, error: 'Unavailable' };
    }
    await shell.openExternal(target);
    return { ok: true };
  });
}

module.exports = {
  registerCoreIpc
};
