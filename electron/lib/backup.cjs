const { writeFile } = require('fs/promises');
const yauzl = require('yauzl');
const { buildBackupZipBuffer } = require('./zip-backup.cjs');

function readZipEntry(zipfile, entry) {
  return new Promise((resolve, reject) => {
    zipfile.openReadStream(entry, (err, stream) => {
      if (err || !stream) {
        reject(err || new Error('Failed to read zip entry'));
        return;
      }
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      stream.on('error', reject);
    });
  });
}

async function parseBackupZipBuffer(buffer) {
  const zipBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  const files = await new Promise((resolve, reject) => {
    yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipfile) => {
      if (err || !zipfile) {
        reject(err || new Error('Invalid ZIP archive'));
        return;
      }

      const collected = {};
      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName)) {
          zipfile.readEntry();
          return;
        }
        readZipEntry(zipfile, entry)
          .then((text) => {
            collected[entry.fileName.replace(/^\.?\//, '')] = text;
            zipfile.readEntry();
          })
          .catch(reject);
      });
      zipfile.on('end', () => resolve(collected));
      zipfile.on('error', reject);
    });
  });

  let manifest = null;
  if (files['manifest.json']) {
    manifest = JSON.parse(files['manifest.json']);
  } else if (files['habits.json']) {
    manifest = {
      habits: JSON.parse(files['habits.json']),
      settings: files['settings.json'] ? JSON.parse(files['settings.json']) : {}
    };
  }

  if (!manifest || !Array.isArray(manifest.habits)) {
    throw new Error('Invalid backup archive: habits.json or manifest.json missing');
  }

  return manifest;
}

function registerBackupIpc(ipcMain, { getMainWindow, dialog }) {
  ipcMain.handle('backup:parse-zip', async (_event, arrayBuffer) => {
    try {
      const data = await parseBackupZipBuffer(Buffer.from(arrayBuffer));
      return { success: true, data };
    } catch (e) {
      return { success: false, error: e && e.message ? e.message : String(e) };
    }
  });

  ipcMain.handle('backup:export-zip', async (_event, jsonPayload, suggestedName) => {
    const mainWindow = getMainWindow();
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Cultiva backup',
      defaultPath: suggestedName || 'cultiva-backup.zip',
      filters: [{ name: 'ZIP archive', extensions: ['zip'] }]
    });

    if (canceled || !filePath) {
      return { success: false };
    }

    try {
      const zipBuffer = await buildBackupZipBuffer(jsonPayload);
      await writeFile(filePath, zipBuffer);
      return { success: true, path: filePath };
    } catch (e) {
      return { success: false, error: e && e.message ? e.message : String(e) };
    }
  });
}

module.exports = { registerBackupIpc, parseBackupZipBuffer };
