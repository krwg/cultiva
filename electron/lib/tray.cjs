const { Tray, Menu, app } = require('electron');

let tray = null;
let getMainWindowRef = () => null;
let resolveIcon = () => null;
let habitMenuItems = [];

function buildMenu() {
  const win = getMainWindowRef();
  const template = [
    {
      label: 'Open Cultiva',
      click: () => {
        if (win) {
          if (process.platform === 'darwin' && app.dock) {
            app.dock.show();
          }
          win.show();
          win.focus();
        }
      }
    },
    { type: 'separator' }
  ];

  if (habitMenuItems.length) {
    for (const h of habitMenuItems) {
      template.push({
        label: h.completedToday ? `✓ ${h.name}` : h.name,
        enabled: !h.completedToday,
        click: () => {
          if (win) {
            win.webContents.send('tray:complete-habit', h.id);
            win.show();
            win.focus();
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
  resolveIcon = resolveAppIconPath;
  const icon = resolveAppIconPath();
  if (!icon) {
    return null;
  }
  tray = new Tray(icon);
  tray.setToolTip('Cultiva');
  tray.on('double-click', () => {
    const win = getMainWindow();
    if (win) {
      if (process.platform === 'darwin' && app.dock) {
        app.dock.show();
      }
      win.show();
      win.focus();
    }
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
