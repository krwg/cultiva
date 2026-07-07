const { writeFile, readdir, stat, mkdir, unlink } = require('fs/promises');
const path = require('path');
const { app } = require('electron');

const MAX_SNAPSHOTS = 7;

async function createZipBuffer(entries) {
  const archiver = (await import('archiver')).default;
  const { PassThrough } = require('stream');

  return new Promise((resolve, reject) => {
    const stream = new PassThrough();
    const chunks = [];
    stream.on('data', (c) => chunks.push(c));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', reject);
    archive.pipe(stream);

    for (const [name, content] of entries) {
      archive.append(content, { name });
    }
    archive.finalize();
  });
}

async function buildBackupZipBuffer(jsonPayload) {
  const manifest = typeof jsonPayload === 'string' ? jsonPayload : JSON.stringify(jsonPayload, null, 2);
  let parsed;
  try {
    parsed = JSON.parse(manifest);
  } catch {
    throw new Error('Invalid backup JSON');
  }

  const habitsJson = JSON.stringify(parsed.habits ?? [], null, 2);
  const settingsJson = JSON.stringify(parsed.settings ?? {}, null, 2);
  const readme = `Cultiva backup\nExported: ${parsed.exportedAt || new Date().toISOString()}\nVersion: ${parsed.version || 'unknown'}\n\nImport habits.json via Settings → Import (JSON).\n`;

  return createZipBuffer([
    ['habits.json', habitsJson],
    ['settings.json', settingsJson],
    ['manifest.json', manifest],
    ['README.txt', readme]
  ]);
}

function getBackupDir() {
  return path.join(app.getPath('userData'), 'backups');
}

async function rotateSnapshots(dir, maxCount) {
  let files;
  try {
    files = await readdir(dir);
  } catch {
    return;
  }
  const zips = [];
  for (const name of files) {
    if (!name.endsWith('.zip')) {
      continue;
    }
    const full = path.join(dir, name);
    try {
      const st = await stat(full);
      zips.push({ full, mtime: st.mtimeMs });
    } catch {
      void 0;
    }
  }
  zips.sort((a, b) => b.mtime - a.mtime);
  for (let i = maxCount; i < zips.length; i++) {
    try {
      await unlink(zips[i].full);
    } catch {
      void 0;
    }
  }
}

async function saveAutomaticBackup(jsonPayload) {
  const dir = getBackupDir();
  await mkdir(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(dir, `cultiva-auto-${stamp}.zip`);
  const zipBuffer = await buildBackupZipBuffer(jsonPayload);
  await writeFile(filePath, zipBuffer);
  await rotateSnapshots(dir, MAX_SNAPSHOTS);
  return { success: true, path: filePath };
}

function registerAutoBackupIpc(ipcMain) {
  ipcMain.handle('backup:save-automatic', async (_event, jsonPayload) => {
    try {
      return await saveAutomaticBackup(jsonPayload);
    } catch (e) {
      return { success: false, error: e && e.message ? e.message : String(e) };
    }
  });
}

module.exports = {
  createZipBuffer,
  buildBackupZipBuffer,
  saveAutomaticBackup,
  registerAutoBackupIpc,
  getBackupDir,
  MAX_SNAPSHOTS
};
