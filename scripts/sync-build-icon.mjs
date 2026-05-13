/**
 * Builds Windows `build/icon.ico` (multi-size, includes 256×256 for NSIS + portable targets)
 * and copies the same file to `electron/app-icon.ico` (runtime window icon).
 *
 * Source: `src/images/favicon.ico` (may contain only 16/32/48px — we upscale the largest frame).
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import decodeIco from 'decode-ico';
import sharp from 'sharp';
import toIco from 'to-ico';

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

const icoBuf = readFileSync(srcIco);
const frames = decodeIco(icoBuf);
if (!frames.length) {
  throw new Error('[sync-build-icon] decode-ico returned no frames');
}

const best = frames.reduce((a, b) => (a.width * a.height >= b.width * b.height ? a : b));
const rgba = Buffer.from(best.data);
const png256 = await sharp(rgba, {
  raw: { width: best.width, height: best.height, channels: 4 }
})
  .ensureAlpha()
  .resize(256, 256, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
  .png()
  .toBuffer();

const winIco = await toIco(png256, {
  resize: true,
  sizes: [16, 24, 32, 48, 64, 128, 256]
});

writeFileSync(destBuild, winIco);
writeFileSync(destElectron, winIco);
console.log('[sync-build-icon] OK (256px+ multi-size ICO) →', destBuild, destElectron);
