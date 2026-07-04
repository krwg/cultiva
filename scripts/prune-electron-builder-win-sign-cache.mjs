
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import os from 'os';

const local = process.env.LOCALAPPDATA || join(os.homedir(), 'AppData', 'Local');
const dir = join(local, 'electron-builder', 'Cache', 'winCodeSign');

if (existsSync(dir)) {
  rmSync(dir, { recursive: true, force: true });
  console.log('[prune-sign-cache] Removed', dir);
} else {
  console.log('[prune-sign-cache] Nothing to remove.');
}
