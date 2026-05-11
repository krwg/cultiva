const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { app } = require('electron');

const PLUGIN_FILES_DIR = path.join(app.getPath('userData'), 'cultiva-plugins');

if (!fs.existsSync(PLUGIN_FILES_DIR)) {
  fs.mkdirSync(PLUGIN_FILES_DIR, { recursive: true });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', reject);
  });
}

function setupPluginIPC() {
  ipcMain.handle('plugin:read-file', async (event, filePath) => {
    try {
      // Убираем 'cultiva-plugins/' из начала пути, если он там есть
      const cleanPath = filePath.replace(/^cultiva-plugins[\\/]/, '');
      const fullPath = path.join(PLUGIN_FILES_DIR, cleanPath);
      
      console.log('[Plugin IPC] Reading file:', fullPath);
      
      if (!fs.existsSync(fullPath)) {
        console.error('[Plugin IPC] File not found:', fullPath);
        return null;
      }
      
      return fs.readFileSync(fullPath, 'utf-8');
    } catch (e) {
      console.error('[Plugin IPC] Failed to read file:', filePath, e);
      return null;
    }
  });
  
  ipcMain.handle('plugin:install', async (event, pluginId, files) => {
    return new Promise(async (resolve, reject) => {
      try {
        const pluginDir = path.join(PLUGIN_FILES_DIR, pluginId);
        
        if (fs.existsSync(pluginDir)) {
          fs.rmSync(pluginDir, { recursive: true, force: true });
        }
        fs.mkdirSync(pluginDir, { recursive: true });
        
        console.log('[Plugin IPC] Installing plugin to:', pluginDir);
        
        for (const file of files) {
          const destPath = path.join(pluginDir, file.name);
          console.log('[Plugin IPC] Downloading:', file.url);
          await downloadFile(file.url, destPath);
        }
        
        const manifestPath = path.join(pluginDir, 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
          throw new Error('Invalid plugin: manifest.json not found');
        }
        
        console.log('[Plugin IPC] Plugin installed successfully:', pluginId);
        resolve(true);
      } catch (e) {
        console.error('[Plugin IPC] Installation failed:', e);
        reject(e);
      }
    });
  });
  
  ipcMain.handle('plugin:uninstall', async (event, pluginId) => {
    try {
      const pluginDir = path.join(PLUGIN_FILES_DIR, pluginId);
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
    return path.join(PLUGIN_FILES_DIR, pluginId, resourcePath);
  });
}

module.exports = { setupPluginIPC };