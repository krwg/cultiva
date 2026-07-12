const path = require('path');
const fs = require('fs');
const { shell } = require('electron');
const { CULTIVA_APP_URL, CULTIVA_CALENDAR_URL, shouldUseCultivaProtocol } = require('./cultiva-protocol.cjs');

function distRoot() {
  return path.normalize(path.join(__dirname, '../../dist'));
}

function filePathFromFileUrl(fileUrl) {
  try {
    const parsed = new URL(fileUrl);
    if (parsed.protocol !== 'file:') {
      return null;
    }
    let pathname = decodeURIComponent(parsed.pathname);
    if (process.platform === 'win32' && pathname.startsWith('/')) {
      pathname = pathname.slice(1);
    }
    return path.normalize(pathname);
  } catch {
    return null;
  }
}

function cultivaUrlForDistFile(filePath) {
  const root = distRoot();
  const normalized = path.normalize(filePath);
  if (!normalized.startsWith(root)) {
    return null;
  }
  const rel = path.relative(root, normalized).replace(/\\/g, '/');
  if (rel.includes('pages/calendar')) {
    return CULTIVA_CALENDAR_URL;
  }
  if (rel === 'index.html' || rel.endsWith('/index.html')) {
    return CULTIVA_APP_URL;
  }
  return null;
}

function attachCultivaNavigation(win, { isDev } = {}) {
  if (!win || win.isDestroyed()) {
    return;
  }
  if (!shouldUseCultivaProtocol(isDev)) {
    return;
  }

  win.webContents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsed = new URL(navigationUrl);

      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        event.preventDefault();
        shell.openExternal(navigationUrl);
        return;
      }

      if (parsed.protocol === 'file:') {
        const filePath = filePathFromFileUrl(navigationUrl);
        if (!filePath) {
          return;
        }

        if (fs.existsSync(filePath)) {
          const cultivaTarget = cultivaUrlForDistFile(filePath);
          if (cultivaTarget) {
            event.preventDefault();
            win.loadURL(cultivaTarget);
          }
          return;
        }

        const distPath = distRoot();
        const relativePath = filePath.replace(/^.*[\\/]dist[\\/]?/i, '');
        const alternativePath = path.join(distPath, relativePath);
        if (fs.existsSync(alternativePath)) {
          event.preventDefault();
          const cultivaTarget = cultivaUrlForDistFile(alternativePath);
          if (cultivaTarget) {
            win.loadURL(cultivaTarget);
          } else {
            win.loadFile(alternativePath);
          }
          return;
        }

        console.warn('[Electron] File not found:', filePath);
      }
    } catch (error) {
      console.error('[Electron] Navigation error:', error);
    }
  });
}

module.exports = {
  attachCultivaNavigation,
  cultivaUrlForDistFile,
  distRoot
};
