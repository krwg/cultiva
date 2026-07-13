import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const buildDir = join(root, 'build');
const iconPng = join(buildDir, 'icon.png');
const iconIcns = join(buildDir, 'icon.icns');
const bgTiff = join(buildDir, 'background.tiff');
const volumeIcns = join(buildDir, 'VolumeIcon.icns');
const renderPy = join(__dirname, 'render-dmg-background.py');

mkdirSync(buildDir, { recursive: true });

function tryRenderBackground() {
  if (existsSync(bgTiff)) {
    console.log('[sync-dmg-assets] Using committed background.tiff');
    return;
  }
  if (!existsSync(iconPng)) {
    console.warn('[sync-dmg-assets] build/icon.png missing; background not generated');
    return;
  }
  const py = spawnSync('python3', [renderPy], { cwd: root, stdio: 'inherit' });
  if (py.status === 0) {
    return;
  }
  console.warn('[sync-dmg-assets] render-dmg-background.py skipped (PIL optional on CI)');
}

tryRenderBackground();

if (existsSync(iconIcns)) {
  copyFileSync(iconIcns, volumeIcns);
  console.log('[sync-dmg-assets] VolumeIcon.icns ← icon.icns');
} else if (existsSync(volumeIcns)) {
  console.log('[sync-dmg-assets] VolumeIcon.icns kept');
} else {
  console.warn('[sync-dmg-assets] icon.icns missing; VolumeIcon.icns not updated');
}

console.log('[sync-dmg-assets] OK →', bgTiff, volumeIcns);
