import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { THEME_BODY_IDS, AMBIENT_BG_LAYER_IDS } from '../src/core/theme-config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const mainPath = join(root, 'src/styles/main.css');
const css = readFileSync(mainPath, 'utf8');

function extractBlocks(source, predicate) {
  const lines = source.split('\n');
  const blocks = [];
  const shell = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (predicate(line)) {
      const block = [line];
      let depth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      i += 1;
      while (i < lines.length && depth > 0) {
        block.push(lines[i]);
        depth += (lines[i].match(/\{/g) || []).length;
        depth -= (lines[i].match(/\}/g) || []).length;
        i += 1;
      }
      blocks.push(block.join('\n'));
    } else {
      shell.push(line);
      i += 1;
    }
  }
  return { blocks, shell: shell.join('\n') };
}

function themePredicate(line) {
  return THEME_BODY_IDS.some((id) => line.startsWith(`body.theme-${id}`));
}

function ambientPredicate(line) {
  return AMBIENT_BG_LAYER_IDS.some((id) => {
    const re = new RegExp(`^\\.bg-${id.replace(/-/g, '\\-')}\\b`);
    return re.test(line);
  }) || line.startsWith('@keyframes lindenFall') || line.startsWith('@keyframes rowan');
}

const themeExtract = extractBlocks(css, themePredicate);
const ambientExtract = extractBlocks(themeExtract.shell, ambientPredicate);

const themesDir = join(root, 'public/styles/themes');
const ambientDir = join(root, 'public/styles/ambient');
const shellOut = join(root, 'src/styles/shell.css');
mkdirSync(themesDir, { recursive: true });
mkdirSync(ambientDir, { recursive: true });

for (const id of THEME_BODY_IDS) {
  const chunks = themeExtract.blocks.filter((b) => b.includes(`body.theme-${id}`));
  if (chunks.length) {
    writeFileSync(join(themesDir, `${id}.css`), `${chunks.join('\n\n')}\n`);
  }
}

for (const id of AMBIENT_BG_LAYER_IDS) {
  const re = new RegExp(`\\.bg-${id.replace(/-/g, '\\-')}`);
  const chunks = ambientExtract.blocks.filter((b) => re.test(b));
  if (chunks.length) {
    writeFileSync(join(ambientDir, `${id}.css`), `${chunks.join('\n\n')}\n`);
  }
}

const sharedAmbient = ambientExtract.blocks.filter((b) => b.startsWith('@keyframes'));
if (sharedAmbient.length) {
  writeFileSync(join(ambientDir, '_keyframes.css'), `${sharedAmbient.join('\n\n')}\n`);
}

const SHELL_PERF_FOOTER = `
body.ambient-paused [id^="bg-"] * {
    animation-play-state: paused !important;
}
`;

writeFileSync(shellOut, `${ambientExtract.shell.trim()}\n${SHELL_PERF_FOOTER}`);
console.log('[split-main-css] shell.css + public/styles/themes|ambient written');
