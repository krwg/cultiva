import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const buildDir = join(root, 'build');
const assetsDir = join(root, 'build', 'dmg-source');
const bgSource = join(assetsDir, 'background.png');
const volSource = join(assetsDir, 'volume-icon.png');
const bgTiff = join(buildDir, 'background.tiff');
const volumeIcns = join(buildDir, 'VolumeIcon.icns');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

function hasSips() {
  try {
    execSync('sips --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function ensureSourceArt() {
  mkdirSync(assetsDir, { recursive: true });
  if (!existsSync(bgSource) || !existsSync(volSource)) {
    console.warn('[sync-dmg-assets] Missing build/dmg-source/background.png or volume-icon.png');
    return false;
  }
  return true;
}

function buildBackgroundTiff() {
  const sized = join(buildDir, 'dmg-background-658.png');
  run(`sips -z 498 658 "${bgSource}" --out "${sized}"`);
  run(`sips -s format tiff "${sized}" --out "${bgTiff}"`);
  console.log('[sync-dmg-assets] background.tiff →', bgTiff);
}

function buildVolumeIcns() {
  const sized = join(buildDir, 'volume-icon-512.png');
  run(`sips -z 512 512 "${volSource}" --out "${sized}"`);
  const iconset = join(buildDir, 'volume.iconset');
  rmSync(iconset, { recursive: true, force: true });
  mkdirSync(iconset, { recursive: true });
  for (const size of [16, 32, 128, 256, 512]) {
    run(`sips -z ${size} ${size} "${sized}" --out "${join(iconset, `icon_${size}x${size}.png`)}"`);
    run(`sips -z ${size * 2} ${size * 2} "${sized}" --out "${join(iconset, `icon_${size}x${size}@2x.png`)}"`);
  }
  run(`iconutil -c icns "${iconset}" -o "${volumeIcns}"`);
  rmSync(iconset, { recursive: true, force: true });
  console.log('[sync-dmg-assets] VolumeIcon.icns →', volumeIcns);
}

mkdirSync(buildDir, { recursive: true });

if (!hasSips()) {
  console.warn('[sync-dmg-assets] Skipped (sips/iconutil require macOS)');
  process.exit(0);
}

if (!ensureSourceArt()) {
  process.exit(0);
}

try {
  buildBackgroundTiff();
  buildVolumeIcns();
} catch (e) {
  console.warn('[sync-dmg-assets] Failed:', e.message);
  process.exit(1);
}
