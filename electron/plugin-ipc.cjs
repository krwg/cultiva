const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { app } = require('electron');
const {
  assertAllowedDownloadUrl,
  isPathInsideDir,
  resolvePluginRelativeFile,
  assertSafeRelativeFileName,
  isSafePluginId
} = require('./lib/plugin-path-guards.cjs');
const {
  buildPluginInstallFileList,
  assertRegistrySha256ForFiles
} = require('./lib/plugin-registry-integrity.cjs');

const PLUGIN_FILES_DIR = path.join(app.getPath('userData'), 'cultiva-plugins');
const REGISTRY_URL = 'https://raw.githubusercontent.com/krwg/cultiva-plugins/main/registry.json';

let cachedRegistryJson = null;
let cachedRegistryAt = 0;
const REGISTRY_CACHE_MS = 5 * 60 * 1000;

function stripUtf8Bom(s) {
  const t = String(s || '');
  return t.charCodeAt(0) === 0xfeff ? t.slice(1) : t;
}

async function loadOfficialRegistry() {
  const now = Date.now();
  if (cachedRegistryJson && (now - cachedRegistryAt) < REGISTRY_CACHE_MS) {
    return cachedRegistryJson;
  }
  const text = await httpsGetText(REGISTRY_URL);
  const registry = JSON.parse(stripUtf8Bom(text).trim());
  cachedRegistryJson = registry;
  cachedRegistryAt = now;
  return registry;
}

async function resolveInstallFilesFromRegistry(pluginId) {
  const registry = await loadOfficialRegistry();
  const pluginList = Array.isArray(registry.plugins) ? registry.plugins : [];
  const pluginInfo = pluginList.find((p) => p && p.id === pluginId);
  if (!pluginInfo) {
    throw new Error('Plugin not found in registry');
  }
  if (!pluginInfo.baseUrl || typeof pluginInfo.baseUrl !== 'string') {
    throw new Error('Registry entry missing baseUrl');
  }

  const sh = pluginInfo.sha256 && typeof pluginInfo.sha256 === 'object' ? pluginInfo.sha256 : {};
  const base = String(pluginInfo.baseUrl).replace(/\/$/, '');
  assertAllowedDownloadUrl(`${base}/manifest.json`);

  const manifestText = await httpsGetText(`${base}/manifest.json`);
  const manifest = JSON.parse(stripUtf8Bom(manifestText).trim());
  const files = buildPluginInstallFileList(manifest, base, sh);
  assertRegistrySha256ForFiles(files);
  return files;
}

const MAX_REDIRECTS = 8;

if (!fs.existsSync(PLUGIN_FILES_DIR)) {
  fs.mkdirSync(PLUGIN_FILES_DIR, { recursive: true });
}

function sha256HexOfFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function httpsGetText(urlString, maxBytes = 8 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const run = (currentUrl, redirectCount) => {
      if (redirectCount > MAX_REDIRECTS) {
        reject(new Error('Too many redirects'));
        return;
      }

      assertAllowedDownloadUrl(currentUrl);

      https.get(currentUrl, (response) => {
        const status = response.statusCode || 0;
        if (status === 301 || status === 302 || status === 303 || status === 307 || status === 308) {
          response.resume();
          const loc = response.headers.location;
          if (!loc) {
            reject(new Error('Redirect without Location header'));
            return;
          }
          let nextUrl;
          try {
            nextUrl = new URL(loc, currentUrl).href;
          } catch {
            reject(new Error('Invalid redirect URL'));
            return;
          }
          try {
            assertAllowedDownloadUrl(nextUrl);
          } catch (e) {
            reject(e);
            return;
          }
          run(nextUrl, redirectCount + 1);
          return;
        }

        if (status !== 200) {
          response.resume();
          reject(new Error(`HTTP ${status}`));
          return;
        }

        const chunks = [];
        let total = 0;
        response.on('data', (chunk) => {
          total += chunk.length;
          if (total > maxBytes) {
            response.destroy();
            reject(new Error('Response too large'));
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', () => {
          resolve(Buffer.concat(chunks).toString('utf8'));
        });
        response.on('error', reject);
      }).on('error', reject);
    };

    run(String(urlString || ''), 0);
  });
}

function downloadFile(urlString, destPath) {
  assertAllowedDownloadUrl(urlString);

  return new Promise((resolve, reject) => {
    const run = (currentUrl, redirectCount) => {
      if (redirectCount > MAX_REDIRECTS) {
        reject(new Error('Too many redirects'));
        return;
      }

      assertAllowedDownloadUrl(currentUrl);

      https.get(currentUrl, (response) => {
        const status = response.statusCode || 0;
        if (status === 301 || status === 302 || status === 303 || status === 307 || status === 308) {
          response.resume();
          const loc = response.headers.location;
          if (!loc) {
            reject(new Error('Redirect without Location header'));
            return;
          }
          let nextUrl;
          try {
            nextUrl = new URL(loc, currentUrl).href;
          } catch {
            reject(new Error('Invalid redirect URL'));
            return;
          }
          try {
            assertAllowedDownloadUrl(nextUrl);
          } catch (e) {
            reject(e);
            return;
          }
          run(nextUrl, redirectCount + 1);
          return;
        }

        if (status !== 200) {
          response.resume();
          reject(new Error(`Download failed: HTTP ${status}`));
          return;
        }

        const file = fs.createWriteStream(destPath);
        response.pipe(file);
        response.on('error', (err) => {
          file.destroy();
          fs.unlink(destPath, () => reject(err));
        });
        file.on('finish', () => {
          file.close(resolve);
        });
        file.on('error', (err) => {
          file.close(() => fs.unlink(destPath, () => reject(err)));
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => reject(err));
      });
    };

    run(urlString, 0);
  });
}

function setupPluginIPC() {
  ipcMain.handle('plugin:http-get', async (event, urlString) => {
    try {
      const body = await httpsGetText(String(urlString || ''));
      return { ok: true, body };
    } catch (e) {
      console.error('[Plugin IPC] http-get failed:', urlString, e);
      return { ok: false, error: e && e.message ? e.message : String(e) };
    }
  });

  ipcMain.handle('plugin:read-file', async (event, pluginId, relativeFile) => {
    try {
      const fullPath = resolvePluginRelativeFile(PLUGIN_FILES_DIR, pluginId, relativeFile);
      if (!fullPath) {
        return null;
      }

      if (!fs.existsSync(fullPath)) {
        return null;
      }

      return fs.readFileSync(fullPath, 'utf-8');
    } catch (e) {
      console.error('[Plugin IPC] Failed to read file:', pluginId, relativeFile, e);
      return null;
    }
  });

  ipcMain.handle('plugin:install', async (event, pluginId) => {
    try {
      if (!isSafePluginId(pluginId)) {
        throw new Error('Invalid plugin id');
      }

      const files = await resolveInstallFilesFromRegistry(pluginId);
      const pluginDir = path.join(PLUGIN_FILES_DIR, pluginId);
      const pluginRootResolved = path.resolve(pluginDir);

      if (fs.existsSync(pluginDir)) {
        fs.rmSync(pluginDir, { recursive: true, force: true });
      }
      fs.mkdirSync(pluginDir, { recursive: true });

      for (const file of files) {
        assertSafeRelativeFileName(file.name);
        const destPath = path.resolve(pluginDir, file.name);
        if (!isPathInsideDir(pluginRootResolved, destPath)) {
          throw new Error(`Blocked destination path for plugin file: ${file.name}`);
        }
        await downloadFile(file.url, destPath);
        const expected = file.sha256.trim().toLowerCase();
        const actual = sha256HexOfFile(destPath);
        if (actual !== expected) {
          throw new Error(`Integrity check failed for ${file.name}`);
        }
      }

      const manifestPath = path.join(pluginDir, 'manifest.json');
      if (!fs.existsSync(manifestPath)) {
        throw new Error('Invalid plugin: manifest.json not found');
      }

      return true;
    } catch (e) {
      console.error('[Plugin IPC] Installation failed:', e);
      throw e;
    }
  });

  ipcMain.handle('plugin:is-downloaded', async (event, pluginId) => {
    try {
      if (!isSafePluginId(pluginId)) {
        return false;
      }
      const manifestPath = path.join(PLUGIN_FILES_DIR, pluginId, 'manifest.json');
      return fs.existsSync(manifestPath);
    } catch {
      return false;
    }
  });

  ipcMain.handle('plugin:uninstall', async (event, pluginId) => {
    try {
      if (!isSafePluginId(pluginId)) {
        return false;
      }
      const pluginDir = path.join(PLUGIN_FILES_DIR, pluginId);
      if (!isPathInsideDir(PLUGIN_FILES_DIR, path.resolve(pluginDir))) {
        return false;
      }
      if (fs.existsSync(pluginDir)) {
        fs.rmSync(pluginDir, { recursive: true, force: true });
      }
      return true;
    } catch (e) {
      console.error('[Plugin IPC] Failed to uninstall:', e);
      return false;
    }
  });

  ipcMain.handle('plugin:get-resource-path', async (event, pluginId, resourcePath) => {
    if (!isSafePluginId(pluginId)) {
      return null;
    }
    const cleanResource = String(resourcePath || '').replace(/^[/\\]+/, '');
    if (!cleanResource) {
      return null;
    }
    assertSafeRelativeFileName(cleanResource);
    const pluginDir = path.join(PLUGIN_FILES_DIR, pluginId);
    const resolved = path.resolve(pluginDir, cleanResource);
    if (!isPathInsideDir(path.resolve(pluginDir), resolved)) {
      return null;
    }
    return resolved;
  });
}

module.exports = { setupPluginIPC, PLUGIN_FILES_DIR };
