const { writeFile } = require('fs/promises');
const yauzl = require('yauzl');
const path = require('path');
const { buildBackupZipBuffer } = require('./zip-backup.cjs');

const MAX_ZIP_ENTRIES = 64;
const MAX_ENTRY_UNCOMPRESSED = 16 * 1024 * 1024;
const MAX_TOTAL_UNCOMPRESSED = 32 * 1024 * 1024;

function isSafeZipEntryName(name) {
  const n = String(name || '').replace(/\\/g, '/');
  if (!n || n.length > 512) {
    return false;
  }
  if (path.isAbsolute(n) || /^[a-zA-Z]:/.test(n)) {
    return false;
  }
  const segments = n.split('/');
  for (const seg of segments) {
    if (seg === '..' || seg === '') {
      if (seg === '..') {
        return false;
      }
    }
  }
  if (n.includes('..')) {
    return false;
  }
  return true;
}

function readZipEntry(zipfile, entry, maxBytes) {
  return new Promise((resolve, reject) => {
    zipfile.openReadStream(entry, (err, stream) => {
      if (err || !stream) {
        reject(err || new Error('Failed to read zip entry'));
        return;
      }
      const chunks = [];
      let total = 0;
      stream.on('data', (chunk) => {
        total += chunk.length;
        if (total > maxBytes) {
          stream.destroy();
          reject(new Error('ZIP entry too large'));
          return;
        }
        chunks.push(chunk);
      });
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
      let entryCount = 0;
      let totalUncompressed = 0;

      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName)) {
          zipfile.readEntry();
          return;
        }

        entryCount += 1;
        if (entryCount > MAX_ZIP_ENTRIES) {
          reject(new Error('Backup ZIP has too many entries'));
          zipfile.close();
          return;
        }

        if (!isSafeZipEntryName(entry.fileName)) {
          reject(new Error(`Unsafe ZIP entry name: ${entry.fileName}`));
          zipfile.close();
          return;
        }

        const declared = typeof entry.uncompressedSize === 'number' ? entry.uncompressedSize : 0;
        if (declared > MAX_ENTRY_UNCOMPRESSED) {
          reject(new Error('ZIP entry exceeds size limit'));
          zipfile.close();
          return;
        }

        const remaining = MAX_TOTAL_UNCOMPRESSED - totalUncompressed;
        const entryCap = Math.min(MAX_ENTRY_UNCOMPRESSED, remaining);
        if (entryCap <= 0) {
          reject(new Error('Backup ZIP exceeds total uncompressed size limit'));
          zipfile.close();
          return;
        }

        readZipEntry(zipfile, entry, entryCap)
          .then((text) => {
            totalUncompressed += Buffer.byteLength(text, 'utf8');
            if (totalUncompressed > MAX_TOTAL_UNCOMPRESSED) {
              reject(new Error('Backup ZIP exceeds total uncompressed size limit'));
              zipfile.close();
              return;
            }
            collected[entry.fileName.replace(/^\.?\//, '').replace(/\\/g, '/')] = text;
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
