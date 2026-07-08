import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcIco = join(root, 'src', 'images', 'favicon.ico');
const buildDir = join(root, 'build');
const destBuild = join(buildDir, 'icon.ico');
const destElectron = join(root, 'electron', 'app-icon.ico');

if (!existsSync(srcIco)) {
  console.warn('[sync-build-icon] Source missing:', srcIco);
  process.exit(0);
}

mkdirSync(buildDir, { recursive: true });
copyFileSync(srcIco, destBuild);
copyFileSync(srcIco, destElectron);
console.log('[sync-build-icon] OK →', destBuild, destElectron);
