const { Tray, Menu, app } = require('electron');

let tray = null;
let getMainWindowRef = () => null;
let resolveTrayImage = null;
let resolveIconPath = null;
let habitMenuItems = [];

function showMainWindow(win) {
  if (!win || win.isDestroyed()) {
    return;
  }
  if (process.platform === 'darwin' && app.dock) {
    app.dock.show();
  }
  win.show();
  win.focus();
}

function buildMenu() {
  const win = getMainWindowRef();
  const template = [
    {
      label: 'Open Cultiva',
      click: () => showMainWindow(win)
    },
    { type: 'separator' }
  ];

  if (habitMenuItems.length) {
    for (const h of habitMenuItems) {
      template.push({
        label: h.completedToday ? `✓ ${h.name}` : h.name,
        enabled: !h.completedToday,
        click: () => {
          if (win && !win.isDestroyed()) {
            win.webContents.send('tray:complete-habit', h.id);
            showMainWindow(win);
          }
        }
      });
    }
    template.push({ type: 'separator' });
  } else {
    template.push({ label: 'No habits due today', enabled: false });
    template.push({ type: 'separator' });
  }

  template.push({
    label: 'Quit',
    click: () => {
      app.isQuitting = true;
      app.quit();
    }
  });

  return Menu.buildFromTemplate(template);
}

function refreshMenu() {
  if (!tray) {
    return;
  }
  tray.setContextMenu(buildMenu());
}

function buildTrayImage() {
  if (typeof resolveTrayImage === 'function') {
    try {
      const img = resolveTrayImage();
      if (img && !img.isEmpty()) {
        return img;
      }
    } catch (e) {
      console.warn('[Tray] resolveTrayIconImage failed:', e && e.message ? e.message : e);
    }
  }
  const iconPath = typeof resolveIconPath === 'function' ? resolveIconPath() : null;
  if (!iconPath) {
    return null;
  }
  try {
    const { nativeImage } = require('electron');
    let img = nativeImage.createFromPath(iconPath);
    if (img.isEmpty()) {
      return null;
    }
    const size = process.platform === 'darwin' ? 18 : 16;
    return img.resize({ width: size, height: size, quality: 'best' });
  } catch (e) {
    console.warn('[Tray] Failed to load icon:', iconPath, e && e.message ? e.message : e);
    return null;
  }
}

function initTray({ getMainWindow, resolveAppIconPath, resolveTrayIconImage }) {
  if (tray) {
    return tray;
  }
  getMainWindowRef = getMainWindow;
  resolveIconPath = resolveAppIconPath;
  resolveTrayImage = resolveTrayIconImage || null;
  const image = buildTrayImage();
  if (!image) {
    console.warn('[Tray] Skipped — no usable tray icon');
    return null;
  }
  try {
    tray = new Tray(image);
  } catch (e) {
    console.warn('[Tray] Init failed:', e && e.message ? e.message : e);
    tray = null;
    return null;
  }
  tray.setToolTip('Cultiva');
  tray.on('double-click', () => {
    showMainWindow(getMainWindow());
  });
  tray.on('click', () => {
    if (process.platform === 'darwin') {
      return;
    }
    showMainWindow(getMainWindow());
  });
  refreshMenu();
  return tray;
}

function updateTrayHabits(habits) {
  habitMenuItems = Array.isArray(habits) ? habits.slice(0, 12) : [];
  refreshMenu();
}

function destroyTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

module.exports = {
  initTray,
  updateTrayHabits,
  destroyTray
};
