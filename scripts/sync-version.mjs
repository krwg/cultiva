import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const brandingPath = resolve('src/core/branding.js');
const packagePath = resolve('package.json');

try {

  const content = readFileSync(brandingPath, 'utf-8');
  const versionMatch = content.match(/VERSION:\s*['"]([^'"]+)['"]/);
  const codenameMatch = content.match(/CODENAME:\s*['"]([^'"]+)['"]/);

  if (!versionMatch || !codenameMatch) {
    console.error('Не найдены VERSION или CODENAME в branding.js');
    process.exit(1);
  }

  const newVersion = versionMatch[1];
  const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));

  if (pkg.version !== newVersion) {
    pkg.version = newVersion;
    pkg.description = pkg.description || `${codenameMatch[1]} Release`;
    writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`package.json обновлен: v${newVersion} (${codenameMatch[1]})`);
  } else {
    console.log(`Версия уже актуальна: v${newVersion}`);
  }
} catch (err) {
  console.error('Ошибка синхронизации версий:', err.message);
  process.exit(1);
}