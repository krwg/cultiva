const path = require('path');
const fs = require('fs');
const { nativeImage } = require('electron');

function collectIconCandidates() {
  const candidates = [];
  if (process.platform === 'darwin') {
    candidates.push(
      path.join(__dirname, '../../build/icon.png'),
      path.join(__dirname, '../../build/icons/512x512.png'),
      path.join(__dirname, '../../build/icons/256x256.png'),
      path.join(__dirname, '../../dist/favicon.ico'),
      path.join(__dirname, '../app-icon.ico'),
      path.join(__dirname, '../../build/icon.ico')
    );
  } else {
    candidates.push(
      path.join(__dirname, '../app-icon.ico'),
      path.join(__dirname, '../../build/icon.ico'),
      path.join(__dirname, '../../build/icons/32x32.png'),
      path.join(__dirname, '../../build/icons/16x16.png'),
      path.join(__dirname, '../../dist/favicon.ico'),
      path.join(__dirname, '../../public/app-icon.ico'),
      path.join(__dirname, '../../public/favicon.ico'),
      path.join(__dirname, '../../build/icon.png')
    );
  }
  try {
    const { app } = require('electron');
    if (app?.isPackaged && process.resourcesPath) {
      if (process.platform === 'darwin') {
        candidates.unshift(
          path.join(process.resourcesPath, 'icon.png'),
          path.join(process.resourcesPath, 'app-icon.ico'),
          path.join(process.resourcesPath, 'favicon.ico')
        );
      } else {
        candidates.unshift(
          path.join(process.resourcesPath, 'app-icon.ico'),
          path.join(process.resourcesPath, 'tray-icon.png'),
          path.join(process.resourcesPath, 'favicon.ico')
        );
      }
    }
  } catch {
    void 0;
  }
  return candidates;
}

function resolveAppIconPath() {
  for (const candidate of collectIconCandidates()) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

function resolveTrayIconImage() {
  const preferred = [
    path.join(__dirname, '../../build/icons/16x16.png'),
    path.join(__dirname, '../../build/icons/32x32.png')
  ];
  try {
    const { app } = require('electron');
    if (app?.isPackaged && process.resourcesPath) {
      preferred.unshift(path.join(process.resourcesPath, 'tray-icon.png'));
    }
  } catch {
    void 0;
  }

  for (const p of preferred) {
    if (p && fs.existsSync(p)) {
      try {
        const img = nativeImage.createFromPath(p);
        if (!img.isEmpty()) {
          if (process.platform === 'darwin') {
            return img.resize({ width: 18, height: 18, quality: 'best' });
          }
          return img.resize({ width: 16, height: 16, quality: 'best' });
        }
      } catch {
        void 0;
      }
    }
  }

  const ico = resolveAppIconPath();
  if (!ico) {
    return null;
  }
  try {
    let img = nativeImage.createFromPath(ico);
    if (img.isEmpty()) {
      return null;
    }
    const size = process.platform === 'darwin' ? 18 : 16;
    return img.resize({ width: size, height: size, quality: 'best' });
  } catch {
    return null;
  }
}

module.exports = {
  collectIconCandidates,
  resolveAppIconPath,
  resolveTrayIconImage
};
