const path = require('path');
const fs = require('fs');
const { CULTIVA_APP_URL, shouldUseCultivaProtocol } = require('./cultiva-protocol.cjs');
const { attachCultivaNavigation } = require('./cultiva-navigation.cjs');
const { resolveAppIconPath, resolveTrayIconImage } = require('./app-icons.cjs');

function attachSessionContentSecurityPolicy({ isDev, session }) {
  if (attachSessionContentSecurityPolicy._done) {
    return;
  }
  attachSessionContentSecurityPolicy._done = true;

  const cspProduction =
    "default-src 'self' file: cultiva: data: blob:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' file: blob: data:; " +
    "img-src 'self' data: blob: file: https:; " +
    "style-src 'self' 'unsafe-inline'; " +
    "connect-src 'self' file: data: blob: https: https://raw.githubusercontent.com https://api.github.com https://github.com https://objects.githubusercontent.com https://api.open-meteo.com https://geocoding-api.open-meteo.com https://ice1.somafm.com https://ice2.somafm.com https://ice3.somafm.com https://ice4.somafm.com https://ice5.somafm.com https://ice6.somafm.com https://stream.radioparadise.com https://stream.chillhop.com; " +
    "media-src 'self' blob: data: https:; " +
    "font-src 'self' data:;";

  const cspDev =
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' file: data: blob: http: https: ws: wss:; " +
    "img-src 'self' data: blob: file: https: http:; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' file: blob: data: http: https:; " +
    "connect-src 'self' https: http: ws: wss: https://raw.githubusercontent.com https://api.github.com https://github.com https://objects.githubusercontent.com https://api.open-meteo.com https://geocoding-api.open-meteo.com https://ice1.somafm.com https://ice2.somafm.com https://ice4.somafm.com https://ice6.somafm.com; " +
    "media-src 'self' blob: data: https: http:; " +
    "font-src 'self' data:;";

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const useDevCsp = isDev && Boolean(process.env.VITE_DEV_SERVER_URL);
    const policy = useDevCsp ? cspDev : cspProduction;
    const responseHeaders = { ...details.responseHeaders };
    for (const key of Object.keys(responseHeaders)) {
      const lower = key.toLowerCase();
      if (lower === 'content-security-policy' || lower === 'content-security-policy-report-only') {
        delete responseHeaders[key];
      }
    }
    responseHeaders['Content-Security-Policy'] = [policy];
    callback({ responseHeaders });
  });
}

function createMainWindow({
  shell,
  BrowserWindow,
  pkg,
  isDev,
  setMainWindow,
  discord,
  setupAutoUpdater
}) {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    title: `${pkg.productName || pkg.name}`,
    minWidth: 360,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.cjs'),
      webviewTag: false,
      sandbox: true
    },
    icon: resolveAppIconPath(),
    backgroundColor: '#1c1c1e',
    show: false,
    ...(process.platform === 'darwin'
      ? {
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 14, y: 12 }
      }
      : process.platform === 'win32'
        ? {
          titleBarStyle: 'hidden',
          titleBarOverlay: {
            color: '#1c1c1e',
            symbolColor: '#f5f5f7',
            height: 32
          }
        }
        : {})
  });

  setMainWindow(mainWindow);

  mainWindow.webContents.setBackgroundThrottling(true);

  const emitWindowVisibility = (visible) => {
    if (mainWindow.isDestroyed()) {
      return;
    }
    mainWindow.webContents.send('window-visibility', visible);
  };

  mainWindow.on('hide', () => emitWindowVisibility(false));
  mainWindow.on('show', () => emitWindowVisibility(true));
  mainWindow.on('minimize', () => emitWindowVisibility(false));
  mainWindow.on('restore', () => emitWindowVisibility(true));

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    // Default-deny popups (including file: and other schemes).
    return { action: 'deny' };
  });

  attachCultivaNavigation(mainWindow, { isDev });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.webContents.on('did-navigate', (event, url) => {
    console.log('[Electron] Navigated to:', url);
    discord.onMainWindowNavigation(url);
  });

  mainWindow.webContents.on('did-navigate-in-page', (event, url) => {
    console.log('[Electron] In-page navigation:', url);
    discord.onMainWindowNavigation(url);
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (shouldUseCultivaProtocol(isDev)) {
    console.log('[Electron] Loading:', CULTIVA_APP_URL);
    mainWindow.loadURL(CULTIVA_APP_URL);
  } else {
    const indexPath = path.join(__dirname, '../../dist/index.html');
    console.log('[Electron] Loading:', indexPath);
    mainWindow.loadFile(indexPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    discord.initDiscordRPC();
    discord.onMainWindowReadyShow();
    setupAutoUpdater();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDesc, validatedURL) => {
    console.error('[Electron] Failed to load:', errorCode, errorDesc);
    console.error('[Electron] URL:', validatedURL);

    if (!isDev) {
      mainWindow.webContents.executeJavaScript(`
        document.body.innerHTML = \`
          <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;color:#ff3b30;">
            <div style="text-align:center;">
              <h2>Failed to load page</h2>
              <p>Error: \${errorDesc}</p>
              <button onclick="location.reload()" style="padding:10px 20px;margin-top:20px;cursor:pointer;">Reload</button>
            </div>
          </div>
        \`;
      `);
    }
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('[Electron] Render process gone:', details);
  });

  mainWindow.on('close', (event) => {
    const { app } = require('electron');
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    discord.onMainWindowClosed();
    setMainWindow(null);
  });

  return mainWindow;
}

module.exports = {
  attachSessionContentSecurityPolicy,
  resolveAppIconPath,
  resolveTrayIconImage,
  createMainWindow
};
