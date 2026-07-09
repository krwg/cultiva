import { copyFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pngToIco from 'png-to-ico';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'build', 'icons');
const sizes = ['16x16', '32x32', '48x48', '256x256', '512x512'];
const paths = sizes.map((s) => join(iconsDir, `${s}.png`));
const buf = await pngToIco(paths);
const dest = join(root, 'build', 'icon.ico');
writeFileSync(dest, buf);
copyFileSync(dest, join(root, 'electron', 'app-icon.ico'));
console.log('[gen-icon-ico] wrote', dest, buf.length, 'bytes');
