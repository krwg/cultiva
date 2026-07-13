import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const buildDir = join(root, 'build');
const iconPng = join(buildDir, 'icon.png');
const iconIcns = join(buildDir, 'icon.icns');
const bgTiff = join(buildDir, 'background.tiff');
const volumeIcns = join(buildDir, 'VolumeIcon.icns');
const renderScript = join(__dirname, 'render-dmg-background.py');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

mkdirSync(buildDir, { recursive: true });

if (!existsSync(iconPng)) {
  console.warn('[sync-dmg-assets] Skipped: build/icon.png missing (run sync-build-icon first)');
  process.exit(0);
}

try {
  run(`python3 "${renderScript}"`);
} catch (e) {
  console.warn('[sync-dmg-assets] render-dmg-background.py failed:', e.message);
  process.exit(1);
}

if (existsSync(iconIcns)) {
  copyFileSync(iconIcns, volumeIcns);
  console.log('[sync-dmg-assets] VolumeIcon.icns ← icon.icns');
} else {
  console.warn('[sync-dmg-assets] icon.icns missing; VolumeIcon.icns not updated');
}

console.log('[sync-dmg-assets] OK →', bgTiff, volumeIcns);
