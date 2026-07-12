const path = require('path');
const { CULTIVA_APP_URL, CULTIVA_CALENDAR_URL, shouldUseCultivaProtocol } = require('./cultiva-protocol.cjs');

function openGarden(getMainWindow) {
  const win = getMainWindow();
  if (!win) {
    return;
  }
  if (shouldUseCultivaProtocol(process.env.NODE_ENV === 'development')) {
    win.loadURL(CULTIVA_APP_URL);
    return;
  }
  win.loadFile(path.join(__dirname, '../../dist/index.html'));
}

function openCalendar(getMainWindow) {
  const win = getMainWindow();
  if (!win) {
    return;
  }
  if (shouldUseCultivaProtocol(process.env.NODE_ENV === 'development')) {
    win.loadURL(CULTIVA_CALENDAR_URL);
    return;
  }
  win.loadFile(path.join(__dirname, '../../dist/pages/calendar/index.html'));
}

function installAppMenu({ Menu, app, shell, getMainWindow, isDev }) {
  const template = [
    ...(process.platform === 'darwin'
      ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }]
      : []),
    {
      label: 'Cultiva',
      submenu: [
        { label: 'Garden', accelerator: 'CmdOrCtrl+1', click: () => openGarden(getMainWindow) },
        { label: 'Calendar', accelerator: 'CmdOrCtrl+2', click: () => openCalendar(getMainWindow) },
        { type: 'separator' },
        ...(process.platform === 'darwin' ? [] : [{ role: 'quit', label: 'Exit' }])
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        ...(process.platform === 'darwin' ? [{ role: 'zoom' }, { type: 'separator' }, { role: 'front' }] : [])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Cultiva on GitHub',
          click: () => shell.openExternal('https://github.com/krwg/Cultiva')
        },
        ...(isDev ? [{ role: 'toggleDevTools', label: 'Developer Tools' }] : [])
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { installAppMenu };
