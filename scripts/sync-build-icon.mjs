import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcIco = join(root, 'src', 'images', 'favicon.ico');
const publicIco = join(root, 'public', 'favicon.ico');
const buildDir = join(root, 'build');
const iconsDir = join(buildDir, 'icons');
const destBuild = join(buildDir, 'icon.ico');
const destElectron = join(root, 'electron', 'app-icon.ico');
const destPublicElectron = join(root, 'public', 'app-icon.ico');
const destPng = join(buildDir, 'icon.png');
const destIcns = join(buildDir, 'icon.icns');

const sourceIco = existsSync(srcIco) ? srcIco : (existsSync(publicIco) ? publicIco : null);

if (!sourceIco) {
  console.warn('[sync-build-icon] Source missing:', srcIco);
  process.exit(0);
}

mkdirSync(buildDir, { recursive: true });
copyFileSync(sourceIco, destBuild);
copyFileSync(sourceIco, destElectron);
copyFileSync(sourceIco, destPublicElectron);

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

async function buildIcoFromPngs() {
  const sizes = ['16x16', '32x32', '48x48', '256x256', '512x512'];
  const paths = sizes
    .map((s) => join(iconsDir, `${s}.png`))
    .filter((p) => existsSync(p));
  if (paths.length < 3) {
    return false;
  }
  const { default: pngToIco } = await import('png-to-ico');
  const buf = await pngToIco(paths);
  writeFileSync(destBuild, buf);
  copyFileSync(destBuild, destElectron);
  copyFileSync(destBuild, destPublicElectron);
  console.log('[sync-build-icon] Multi-size ICO →', destBuild, `(${buf.length} bytes)`);
  return true;
}

async function ensureIconPngsWithJimp() {
  const { Jimp } = await import('jimp');
  const master = existsSync(destPng)
    ? await Jimp.read(destPng)
    : await Jimp.read(sourceIco);
  rmSync(iconsDir, { recursive: true, force: true });
  mkdirSync(iconsDir, { recursive: true });
  for (const size of [16, 32, 48, 64, 128, 256, 512]) {
    const clone = master.clone();
    clone.resize({ w: size, h: size });
    await clone.write(join(iconsDir, `${size}x${size}.png`));
  }
  await master.clone().resize({ w: 512, h: 512 }).write(destPng);
}

if (hasSips()) {
  try {
    run(`sips -s format png "${sourceIco}" --out "${destPng}"`);
    run(`sips -z 512 512 "${destPng}" --out "${destPng}"`);
    run(`npx --yes icon-gen -i "${destPng}" -o "${buildDir}" --ico`);
    copyFileSync(destBuild, destElectron);
    copyFileSync(destBuild, destPublicElectron);

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
    console.warn('[sync-build-icon] macOS asset pipeline skipped:', e.message);
  }
} else {
  try {
    await ensureIconPngsWithJimp();
    console.log('[sync-build-icon] PNG set generated with Jimp');
  } catch (e) {
    console.warn('[sync-build-icon] Jimp PNG generation skipped:', e.message);
  }
}

try {
  const built = await buildIcoFromPngs();
  if (!built) {
    console.warn('[sync-build-icon] Using single-size ICO fallback');
  }
} catch (e) {
  console.warn('[sync-build-icon] png-to-ico skipped:', e.message);
}

console.log('[sync-build-icon] OK →', destBuild, destElectron);
