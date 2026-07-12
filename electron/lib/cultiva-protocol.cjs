const { protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const CULTIVA_HOST = 'app';
const CULTIVA_APP_URL = `cultiva://${CULTIVA_HOST}/index.html`;
const CULTIVA_CALENDAR_URL = `cultiva://${CULTIVA_HOST}/pages/calendar/index.html`;

function distRoot() {
  return path.join(__dirname, '../../dist');
}

function registerCultivaScheme() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'cultiva',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true
      }
    }
  ]);
}

function installCultivaProtocol() {
  const root = distRoot();
  protocol.handle('cultiva', (request) => {
    const url = new URL(request.url);
    if (url.hostname !== CULTIVA_HOST) {
      return new Response('Not Found', { status: 404 });
    }

    let pathname = decodeURIComponent(url.pathname);
    if (!pathname || pathname === '/') {
      pathname = '/index.html';
    }

    const relative = pathname.replace(/^\/+/, '');
    const filePath = path.normalize(path.join(root, relative));
    if (!filePath.startsWith(root) || !fs.existsSync(filePath)) {
      return new Response('Not Found', { status: 404 });
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });
}

function shouldUseCultivaProtocol(isDev) {
  return !(isDev && process.env.VITE_DEV_SERVER_URL);
}

module.exports = {
  CULTIVA_APP_URL,
  CULTIVA_CALENDAR_URL,
  registerCultivaScheme,
  installCultivaProtocol,
  shouldUseCultivaProtocol
};
