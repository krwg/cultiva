import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

let shell = readFileSync(join(root, 'src/styles/shell.css'), 'utf8');
// Split appends this at EOF; historical shell edits left rules after an earlier copy.
shell = shell.replace(
  /\n*body\.ambient-paused \[id\^="bg-"\] \* \{\r?\n\s*animation-play-state: paused !important;\r?\n\}\r?\n*/g,
  '\n'
);

const themesDir = join(root, 'public/styles/themes');
const ambientDir = join(root, 'public/styles/ambient');
const themes = readdirSync(themesDir)
  .filter((f) => f.endsWith('.css'))
  .sort()
  .map((f) => readFileSync(join(themesDir, f), 'utf8').trim())
  .join('\n\n');
const ambient = readdirSync(ambientDir)
  .filter((f) => f.endsWith('.css'))
  .sort()
  .map((f) => readFileSync(join(ambientDir, f), 'utf8').trim())
  .join('\n\n');

const main = `${shell.trim()}\n\n${themes}\n\n${ambient}\n`;
writeFileSync(join(root, 'src/styles/main.css'), main);

const checks = {
  bytes: Buffer.byteLength(main),
  bed: main.includes('.garden-bed-row'),
  cache: main.includes('cache-clear-orb'),
  store: main.includes('plugin-store-toolbar'),
  ambientCount: (main.match(/body\.ambient-paused/g) || []).length,
};
console.log('[rebuild-main-from-shell]', checks);
if (!checks.bed || !checks.cache) {
  process.exitCode = 1;
}
