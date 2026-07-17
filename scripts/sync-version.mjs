import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const releasePath = resolve(root, 'cultiva.release.json');
const brandingPath = resolve(root, 'src/core/branding.js');
const packagePath = resolve(root, 'package.json');
const installerNshPath = resolve(root, 'build/installer.nsh');

const release = JSON.parse(readFileSync(releasePath, 'utf-8'));
const { version, codename } = release;

let branding = readFileSync(brandingPath, 'utf-8');
branding = branding.replace(/VERSION:\s*['"][^'"]+['"]/, `VERSION: '${version}'`);
branding = branding.replace(/CODENAME:\s*['"][^'"]+['"]/, `CODENAME: '${codename}'`);
writeFileSync(brandingPath, branding);

const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
if (pkg.version !== version) {
  pkg.version = version;
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
}

if (codename) {
  let nsh = readFileSync(installerNshPath, 'utf-8');
  const nextBranding = `BrandingText "Cultiva \${VERSION} · ${codename}"`;
  if (/BrandingText\s+"Cultiva \$\{VERSION\} · [^"]+"/.test(nsh)) {
    nsh = nsh.replace(/BrandingText\s+"Cultiva \$\{VERSION\} · [^"]+"/, nextBranding);
  } else {
    nsh = nsh.replace(/BrandingText\s+"[^"]*"/, nextBranding);
  }
  writeFileSync(installerNshPath, nsh);
}

console.log(`[sync-version] ${release.name} ${version} · ${codename}`);
