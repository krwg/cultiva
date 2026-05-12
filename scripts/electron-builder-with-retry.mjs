/**
 * Runs electron-builder with retries (GitHub / TCP resets are common on some networks).
 *
 * Optional mirrors (pick one if downloads fail):
 *   set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
 * Or use: npm run electron:build:cn
 */
import { existsSync } from 'fs';
import { resolve } from 'path';
import { spawn } from 'child_process';

const maxAttempts = Number(process.env.ELECTRON_BUILDER_RETRY_COUNT || 5);
const baseDelayMs = Number(process.env.ELECTRON_BUILDER_RETRY_DELAY_MS || 4000);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function runElectronBuilder() {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';
    const localBin = resolve(process.cwd(), 'node_modules', '.bin', isWin ? 'electron-builder.cmd' : 'electron-builder');
    const cmd = existsSync(localBin) ? localBin : 'electron-builder';
    const child = spawn(cmd, [], {
      stdio: 'inherit',
      shell: isWin,
      cwd: process.cwd(),
      env: process.env
    });
    child.on('close', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(Object.assign(new Error(`electron-builder exited with ${code}`), { code, signal }));
      }
    });
    child.on('error', reject);
  });
}

async function main() {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await runElectronBuilder();
      if (attempt > 1) {
        console.log(`[electron-builder-retry] Succeeded on attempt ${attempt}/${maxAttempts}.`);
      }
      return;
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      console.warn(`[electron-builder-retry] Attempt ${attempt}/${maxAttempts} failed: ${msg}`);
      if (attempt >= maxAttempts) {
        console.error('[electron-builder-retry] Giving up. Try:');
        console.error('  • Run again (transient GitHub / ISP drops).');
        console.error('  • VPN or different network.');
        console.error('  • npm run electron:build:cn   (mirror for electron-builder binaries)');
        console.error('  • Or set ELECTRON_BUILDER_BINARIES_MIRROR to a mirror that hosts electron-builder-binaries.');
        process.exit(typeof e.code === 'number' ? e.code : 1);
      }
      const wait = baseDelayMs + (attempt - 1) * 2500;
      console.warn(`[electron-builder-retry] Waiting ${wait}ms before retry…`);
      await sleep(wait);
    }
  }
}

main();
