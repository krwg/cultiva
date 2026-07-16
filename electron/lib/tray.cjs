const { Tray, Menu, app, nativeImage } = require('electron');

let tray = null;
let getMainWindowRef = () => null;
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

function loadTrayImage(iconPath) {
  if (!iconPath) {
    return null;
  }
  try {
    const image = nativeImage.createFromPath(iconPath);
    if (image.isEmpty()) {
      return null;
    }
    if (process.platform === 'darwin') {
      return image.resize({ width: 18, height: 18 });
    }
    return image;
  } catch (e) {
    console.warn('[Tray] Failed to load icon:', iconPath, e && e.message ? e.message : e);
    return null;
  }
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

function initTray({ getMainWindow, resolveAppIconPath }) {
  if (tray) {
    return tray;
  }
  getMainWindowRef = getMainWindow;
  const iconPath = resolveAppIconPath();
  const image = loadTrayImage(iconPath);
  if (!image) {
    console.warn('[Tray] Skipped — no usable tray icon at', iconPath || '(missing)');
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
