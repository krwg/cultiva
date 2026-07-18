const { Tray, Menu, app } = require('electron');

let tray = null;
let getMainWindowRef = () => null;
let resolveTrayImage = null;
let resolveIconPath = null;
let habitMenuItems = [];
let pluginTooltipSuffix = '';
let pluginMenuItems = [];

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

  if (pluginMenuItems.length) {
    for (const item of pluginMenuItems) {
      template.push({
        label: item.label,
        enabled: item.enabled !== false,
        click: () => {
          if (win && !win.isDestroyed()) {
            win.webContents.send('tray:plugin-action', {
              pluginId: item.pluginId,
              id: item.id
            });
          }
        }
      });
    }
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

function applyTooltip() {
  if (!tray) {
    return;
  }
  const text = typeof pluginTooltipSuffix === 'string' ? pluginTooltipSuffix.trim() : '';
  tray.setToolTip(text || 'Cultiva');
}

function setTrayTooltip(text) {
  pluginTooltipSuffix = text != null ? String(text) : '';
  applyTooltip();
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
    const img = nativeImage.createFromPath(iconPath);
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
  applyTooltip();
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

function setTrayPluginItems(items) {
  const list = Array.isArray(items) ? items : [];
  pluginMenuItems = list.slice(0, 6).map((item) => ({
    id: String(item && item.id != null ? item.id : ''),
    label: String(item && item.label != null ? item.label : ''),
    pluginId: String(item && item.pluginId != null ? item.pluginId : ''),
    enabled: item && item.enabled !== false
  })).filter((item) => item.id && item.label);
  refreshMenu();
}

function clearTrayPluginItems() {
  pluginMenuItems = [];
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
  setTrayTooltip,
  setTrayPluginItems,
  clearTrayPluginItems,
  destroyTray
};
