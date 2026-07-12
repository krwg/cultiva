import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const i18nPath = join(root, 'src/core/i18n.js');
const localesDir = join(root, 'src/core/locales');

if (!existsSync(i18nPath)) {
  console.log('[split-i18n] Skipped: i18n.js missing');
  process.exit(0);
}

const src = readFileSync(i18nPath, 'utf8');
const enMatch = src.match(/en:\s*\{([\s\S]*?)\n  \},\n  ru:\s*\{/);
const ruMatch = src.match(/ru:\s*\{([\s\S]*?)\n  \}\n\};/);

if (!enMatch || !ruMatch) {
  if (existsSync(join(localesDir, 'en.js')) && existsSync(join(localesDir, 'ru.js'))) {
    console.log('[split-i18n] Skipped: locale chunks already present');
    process.exit(0);
  }
  console.error('[split-i18n] Could not parse i18n.js and locale chunks are missing');
  process.exit(1);
}

mkdirSync(localesDir, { recursive: true });

const wrap = (body) => `export default {\n${body}\n};\n`;

writeFileSync(join(localesDir, 'en.js'), wrap(enMatch[1]));
writeFileSync(join(localesDir, 'ru.js'), wrap(ruMatch[1]));
console.log('[split-i18n] Wrote src/core/locales/en.js and ru.js');
