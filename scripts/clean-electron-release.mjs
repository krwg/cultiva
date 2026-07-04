
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { resolve } from 'path';

const root = resolve(process.cwd(), 'release', 'win-unpacked');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function tryKillCultivaWindows() {
  if (process.env.SKIP_KILL === '1') {
    return;
  }
  if (process.platform !== 'win32') {
    return;
  }
  try {
    execSync('taskkill /F /IM Cultiva.exe /T', { stdio: 'ignore', windowsHide: true });
    console.log('[clean-electron-release] Ended Cultiva.exe (was locking the build output).');
  } catch {

  }
}

async function main() {
  if (!existsSync(root)) {
    console.log('[clean-electron-release] Nothing to clean (no win-unpacked).');
    return;
  }

  const maxAttempts = 6;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      rmSync(root, { recursive: true, force: true });
      console.log('[clean-electron-release] Removed', root);
      return;
    } catch (e) {
      const code = e && e.code;
      const recoverable = code === 'EBUSY' || code === 'EPERM' || code === 'ENOTEMPTY';
      if (!recoverable || attempt === maxAttempts - 1) {
        console.error('[clean-electron-release] Could not remove win-unpacked:', e.message);
        console.error('  • Close Cultiva completely (including system tray).');
        console.error('  • Close any Explorer window opened inside release\\win-unpacked.');
        console.error('  • Or run: npm run electron:clean (tries to stop Cultiva.exe on Windows)');
        console.error('  • To skip auto-kill: set SKIP_KILL=1 and close the app manually.');
        process.exit(1);
      }

      tryKillCultivaWindows();
      const waitMs = 1200 + attempt * 600;
      console.warn(`[clean-electron-release] File busy (${code}), retry in ${waitMs}ms (${attempt + 1}/${maxAttempts - 1})…`);
      await sleep(waitMs);
    }
  }
}

main();
