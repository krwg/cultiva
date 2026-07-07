const { writeFile } = require('fs/promises');
const { buildBackupZipBuffer } = require('./zip-backup.cjs');

function registerBackupIpc(ipcMain, { getMainWindow, dialog }) {
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

module.exports = { registerBackupIpc };
