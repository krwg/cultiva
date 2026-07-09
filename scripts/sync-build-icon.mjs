import { copyFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcIco = join(root, 'src', 'images', 'favicon.ico');
const buildDir = join(root, 'build');
const iconsDir = join(buildDir, 'icons');
const destBuild = join(buildDir, 'icon.ico');
const destElectron = join(root, 'electron', 'app-icon.ico');
const destPng = join(buildDir, 'icon.png');
const destIcns = join(buildDir, 'icon.icns');

if (!existsSync(srcIco)) {
  console.warn('[sync-build-icon] Source missing:', srcIco);
  process.exit(0);
}

mkdirSync(buildDir, { recursive: true });
copyFileSync(srcIco, destBuild);
copyFileSync(srcIco, destElectron);

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

try {
  run(`sips -s format png "${srcIco}" --out "${destPng}"`);
  run(`sips -z 512 512 "${destPng}" --out "${destPng}"`);
  run(`npx --yes icon-gen -i "${destPng}" -o "${buildDir}" --ico`);
  copyFileSync(destBuild, destElectron);

  const iconset = join(buildDir, 'icon.iconset');
  rmSync(iconset, { recursive: true, force: true });
  mkdirSync(iconset, { recursive: true });
  for (const size of [16, 32, 128, 256, 512]) {
    run(`sips -z ${size} ${size} "${destPng}" --out "${join(iconset, `icon_${size}x${size}.png`)}"`);
    run(`sips -z ${size * 2} ${size * 2} "${destPng}" --out "${join(iconset, `icon_${size}x${size}@2x.png`)}"`);
  }
  run(`iconutil -c icns "${iconset}" -o "${destIcns}"`);
  rmSync(iconset, { recursive: true, force: true });

  rmSync(iconsDir, { recursive: true, force: true });
  mkdirSync(iconsDir, { recursive: true });
  for (const size of [16, 32, 48, 64, 128, 256, 512]) {
    run(`sips -z ${size} ${size} "${destPng}" --out "${join(iconsDir, `${size}x${size}.png`)}"`);
  }
} catch (e) {
  console.warn('[sync-build-icon] PNG/ICNS generation skipped:', e.message);
}

console.log('[sync-build-icon] OK →', destBuild, destElectron, destPng, destIcns);
