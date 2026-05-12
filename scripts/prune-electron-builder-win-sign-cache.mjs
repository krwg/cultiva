/**
 * Removes electron-builder's winCodeSign cache (broken partial extracts cause repeat failures).
 * Run: npm run electron:prune-sign-cache
 */
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
