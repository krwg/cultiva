import { THEME_BODY_IDS, AMBIENT_BG_LAYER_IDS } from './theme-config.js';
import { buildExtendedThemeCss } from './theme-tokens.js';
import { sanitizePluginHtml } from './sanitize-plugin-html.js';

const contributionsByPlugin = new Map();
const pluginFontsByPlugin = new Map();

function ensureBucket(pluginId) {
  if (!contributionsByPlugin.has(pluginId)) {
    contributionsByPlugin.set(pluginId, {
      themes: new Map(),
      backgrounds: new Map(),
      sounds: new Map(),
      settingsNav: new Map(),
      appearancePresets: new Map()
    });
  }
  return contributionsByPlugin.get(pluginId);
}

function slugPart(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

export function makePluginContributionId(pluginId, localId) {
  return `plugin-${slugPart(pluginId)}-${slugPart(localId)}`;
}

function normalizePosition(position) {
  if (!position || typeof position !== 'string') {
    return 'before:about';
  }
  const trimmed = position.trim();
  if (/^(before|after):[a-z-]+$/.test(trimmed)) {
    return trimmed;
  }
  return 'before:about';
}

export function resolveContributionLabel(row, lang = 'en') {
  if (!row) {
    return '';
  }
  const key = lang === 'ru' ? 'ru' : 'en';
  if (row.i18n && row.i18n[key] && row.i18n[key].label) {
    return row.i18n[key].label;
  }
  return row.label || row.id || '';
}

function resolveThemeCssText(pluginId, localId, config) {
  if (typeof config.cssText === 'string' && config.cssText.trim()) {
    return config.cssText.trim();
  }
  if (config.extends || (config.variables && typeof config.variables === 'object')) {
    const themeId = makePluginContributionId(pluginId, localId);
    return buildExtendedThemeCss(themeId, config);
  }
  return null;
}

export function registerPluginTheme(pluginId, config = {}) {
  const localId = slugPart(config.id || config.name || 'theme');
  const id = makePluginContributionId(pluginId, localId);
  const bucket = ensureBucket(pluginId);
  bucket.themes.set(id, {
    id,
    pluginId,
    localId,
    label: String(config.label || config.name || localId),
    group: config.group === 'light' ? 'light' : 'dark',
    extends: typeof config.extends === 'string' ? config.extends : null,
    monochrome: config.monochrome === true,
    i18n: config.i18n && typeof config.i18n === 'object' ? config.i18n : null,
    cssText: resolveThemeCssText(pluginId, localId, config),
    cssFile: typeof config.css === 'string' ? config.css.replace(/^[/\\]+/, '') : null
  });
  return id;
}

export function unregisterPluginTheme(pluginId, themeId) {
  const bucket = contributionsByPlugin.get(pluginId);
  if (!bucket) {
    return false;
  }
  const id = themeId && themeId.startsWith('plugin-')
    ? themeId
    : makePluginContributionId(pluginId, themeId);
  if (!bucket.themes.has(id)) {
    return false;
  }
  document.getElementById(styleElId('theme', id))?.remove();
  bucket.themes.delete(id);
  return true;
}

export function registerPluginBackground(pluginId, config = {}) {
  const localId = slugPart(config.id || config.name || 'background');
  const id = makePluginContributionId(pluginId, localId);
  const bucket = ensureBucket(pluginId);
  bucket.backgrounds.set(id, {
    id,
    pluginId,
    localId,
    label: String(config.label || config.name || localId),
    i18n: config.i18n && typeof config.i18n === 'object' ? config.i18n : null,
    cssText: typeof config.cssText === 'string' ? config.cssText : null,
    cssFile: typeof config.css === 'string' ? config.css.replace(/^[/\\]+/, '') : null,
    html: typeof config.html === 'string' ? config.html : null,
    bodyClass: `with-bg-${id}`
  });
  return id;
}

export function unregisterPluginBackground(pluginId, bgId) {
  const bucket = contributionsByPlugin.get(pluginId);
  if (!bucket) {
    return false;
  }
  const id = bgId && bgId.startsWith('plugin-')
    ? bgId
    : makePluginContributionId(pluginId, bgId);
  if (!bucket.backgrounds.has(id)) {
    return false;
  }
  document.getElementById(styleElId('ambient', id))?.remove();
  bucket.backgrounds.delete(id);
  return true;
}

export function registerPluginSound(pluginId, config = {}) {
  const localId = slugPart(config.id || config.name || 'sound');
  const id = makePluginContributionId(pluginId, localId);
  const bucket = ensureBucket(pluginId);
  bucket.sounds.set(id, {
    id,
    pluginId,
    localId,
    label: String(config.label || config.name || localId),
    i18n: config.i18n && typeof config.i18n === 'object' ? config.i18n : null,
    src: typeof config.src === 'string' ? config.src.replace(/^[/\\]+/, '') : '',
    loop: config.loop !== false,
    volume: typeof config.volume === 'number' ? Math.max(0, Math.min(1, config.volume)) : 0.6
  });
  return id;
}

export function unregisterPluginSound(pluginId, soundId) {
  const bucket = contributionsByPlugin.get(pluginId);
  if (!bucket) {
    return false;
  }
  const id = soundId && soundId.startsWith('plugin-')
    ? soundId
    : makePluginContributionId(pluginId, soundId);
  return bucket.sounds.delete(id);
}

export function registerPluginFont(pluginId, config = {}) {
  const localId = slugPart(config.id || config.family || 'font');
  const id = makePluginContributionId(pluginId, localId);
  const family = String(config.family || localId).trim();
  const src = typeof config.src === 'string' ? config.src.replace(/^[/\\]+/, '') : '';
  if (!family || !src) {
    return null;
  }
  if (!pluginFontsByPlugin.has(pluginId)) {
    pluginFontsByPlugin.set(pluginId, new Map());
  }
  pluginFontsByPlugin.get(pluginId).set(id, {
    id,
    pluginId,
    family,
    src,
    weight: config.weight || '400',
    style: config.style || 'normal'
  });
  return id;
}

export function registerPluginAppearancePreset(pluginId, config = {}) {
  const localId = slugPart(config.id || config.label || 'preset');
  const id = makePluginContributionId(pluginId, localId);
  const bucket = ensureBucket(pluginId);
  bucket.appearancePresets.set(id, {
    id,
    pluginId,
    label: String(config.label || localId),
    theme: typeof config.theme === 'string' ? config.theme : null,
    background: typeof config.background === 'string' ? config.background : null,
    sound: typeof config.sound === 'string' ? config.sound : null,
    accentColor: config.accentColor === null ? null : (config.accentColor || undefined)
  });
  return id;
}

export function getPluginAppearancePresets() {
  const rows = [];
  for (const bucket of contributionsByPlugin.values()) {
    for (const preset of bucket.appearancePresets.values()) {
      rows.push(preset);
    }
  }
  return rows;
}

export function registerPluginSettingsNav(pluginId, config = {}) {
  const localId = slugPart(config.id || config.label || 'section');
  const navId = `${pluginId}:${localId}`;
  const sectionId = `plugin-${slugPart(pluginId)}-${localId}`;
  const bucket = ensureBucket(pluginId);
  bucket.settingsNav.set(navId, {
    navId,
    pluginId,
    sectionId,
    label: String(config.label || localId),
    position: normalizePosition(config.position),
    html: typeof config.html === 'string' ? config.html : '',
    description: typeof config.description === 'string' ? config.description : ''
  });
  return { navId, sectionId };
}

export function unregisterPluginSettingsNav(pluginId, navId) {
  const bucket = contributionsByPlugin.get(pluginId);
  if (!bucket) {
    return false;
  }
  return bucket.settingsNav.delete(navId);
}

export function getPluginThemes() {
  const rows = [];
  for (const bucket of contributionsByPlugin.values()) {
    for (const theme of bucket.themes.values()) {
      rows.push(theme);
    }
  }
  return rows;
}

export function getPluginBackgrounds() {
  const rows = [];
  for (const bucket of contributionsByPlugin.values()) {
    for (const bg of bucket.backgrounds.values()) {
      rows.push(bg);
    }
  }
  return rows;
}

export function getPluginSounds() {
  const rows = [];
  for (const bucket of contributionsByPlugin.values()) {
    for (const sound of bucket.sounds.values()) {
      rows.push(sound);
    }
  }
  return rows;
}

export function getPluginSettingsNavItems() {
  const rows = [];
  for (const bucket of contributionsByPlugin.values()) {
    for (const item of bucket.settingsNav.values()) {
      rows.push(item);
    }
  }
  return rows;
}

export function getPluginThemeBodyClasses() {
  return getPluginThemes().map((theme) => `theme-${theme.id}`);
}

export function getPluginBackgroundBodyClasses() {
  return getPluginBackgrounds().map((bg) => bg.bodyClass);
}

export function isPluginThemeId(themeId) {
  return String(themeId || '').startsWith('plugin-');
}

export function isPluginBackgroundId(bgId) {
  return String(bgId || '').startsWith('plugin-');
}

export function isBuiltinThemeId(themeId) {
  return THEME_BODY_IDS.includes(themeId);
}

export function isBuiltinBackgroundId(bgId) {
  return !bgId || bgId === 'none' || bgId === 'custom' || AMBIENT_BG_LAYER_IDS.includes(bgId);
}

function styleElId(kind, id) {
  return `cultiva-plugin-${kind}-${id}`;
}

export async function injectPluginFontCss(pluginId) {
  const fonts = pluginFontsByPlugin.get(pluginId);
  if (!fonts || !fonts.size || !window.electron?.getPluginResourcePath) {
    return false;
  }
  const chunks = [];
  for (const font of fonts.values()) {
    const abs = await window.electron.getPluginResourcePath(pluginId, font.src);
    if (!abs) {
      continue;
    }
    const url = `file://${abs.replace(/\\/g, '/')}`;
    const format = font.src.endsWith('.woff2') ? 'woff2'
      : font.src.endsWith('.woff') ? 'woff'
        : font.src.endsWith('.otf') ? 'opentype'
          : 'truetype';
    chunks.push(`@font-face{font-family:'${font.family}';src:url('${url}') format('${format}');font-weight:${font.weight};font-style:${font.style};font-display:swap;}`);
  }
  if (!chunks.length) {
    return false;
  }
  const elId = `cultiva-plugin-font-${slugPart(pluginId)}`;
  let el = document.getElementById(elId);
  if (!el) {
    el = document.createElement('style');
    el.id = elId;
    document.head.appendChild(el);
  }
  el.textContent = chunks.join('\n');
  return true;
}

export async function injectPluginThemeCss(themeId, readFile) {
  const theme = getPluginThemes().find((row) => row.id === themeId);
  if (!theme) {
    return false;
  }
  let cssText = theme.cssText || '';
  if (!cssText && theme.cssFile && typeof readFile === 'function') {
    cssText = await readFile(theme.pluginId, theme.cssFile);
  }
  if (!cssText) {
    return false;
  }
  let el = document.getElementById(styleElId('theme', themeId));
  if (!el) {
    el = document.createElement('style');
    el.id = styleElId('theme', themeId);
    document.head.appendChild(el);
  }
  el.textContent = cssText;
  return true;
}

export async function injectPluginBackgroundCss(bgId, readFile) {
  const bg = getPluginBackgrounds().find((row) => row.id === bgId);
  if (!bg) {
    return false;
  }
  let cssText = bg.cssText || '';
  if (!cssText && bg.cssFile && typeof readFile === 'function') {
    cssText = await readFile(bg.pluginId, bg.cssFile);
  }
  if (!cssText) {
    return false;
  }
  let el = document.getElementById(styleElId('ambient', bgId));
  if (!el) {
    el = document.createElement('style');
    el.id = styleElId('ambient', bgId);
    document.head.appendChild(el);
  }
  el.textContent = cssText;
  return true;
}

export function mountPluginBackgroundHtml(bgId) {
  const bg = getPluginBackgrounds().find((row) => row.id === bgId);
  if (!bg?.html) {
    return null;
  }
  let el = document.getElementById(`bg-${bgId}`);
  if (!el) {
    el = document.createElement('div');
    el.id = `bg-${bgId}`;
    el.className = `bg-plugin-${bg.localId || bgId}`;
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
  }
  el.innerHTML = sanitizePluginHtml(bg.html);
  el.style.display = 'block';
  return el;
}

export function clearPluginContributionStyles(pluginId) {
  const bucket = contributionsByPlugin.get(pluginId);
  if (!bucket) {
    return;
  }
  for (const theme of bucket.themes.values()) {
    document.getElementById(styleElId('theme', theme.id))?.remove();
  }
  for (const bg of bucket.backgrounds.values()) {
    document.getElementById(styleElId('ambient', bg.id))?.remove();
    document.getElementById(`bg-${bg.id}`)?.remove();
  }
  document.getElementById(`cultiva-plugin-font-${slugPart(pluginId)}`)?.remove();
  pluginFontsByPlugin.delete(pluginId);
}

export async function applyManifestContributions(pluginId, manifest, readFile) {
  const contributes = manifest?.contributes;
  if (!contributes || typeof contributes !== 'object') {
    return;
  }
  if (Array.isArray(contributes.fonts)) {
    for (const font of contributes.fonts) {
      registerPluginFont(pluginId, font);
    }
    await injectPluginFontCss(pluginId);
  }
  if (Array.isArray(contributes.themes)) {
    for (const theme of contributes.themes) {
      registerPluginTheme(pluginId, theme);
      const id = makePluginContributionId(pluginId, slugPart(theme.id || theme.name || 'theme'));
      await injectPluginThemeCss(id, readFile);
    }
  }
  if (Array.isArray(contributes.backgrounds)) {
    for (const bg of contributes.backgrounds) {
      registerPluginBackground(pluginId, bg);
      const id = makePluginContributionId(pluginId, slugPart(bg.id || bg.name || 'background'));
      await injectPluginBackgroundCss(id, readFile);
    }
  }
  if (Array.isArray(contributes.sounds)) {
    for (const sound of contributes.sounds) {
      registerPluginSound(pluginId, sound);
    }
  }
  if (Array.isArray(contributes.appearancePresets)) {
    for (const preset of contributes.appearancePresets) {
      registerPluginAppearancePreset(pluginId, preset);
    }
  }
  if (Array.isArray(contributes.settingsNav)) {
    for (const nav of contributes.settingsNav) {
      registerPluginSettingsNav(pluginId, nav);
    }
  }
}

export function unregisterPluginContributions(pluginId) {
  clearPluginContributionStyles(pluginId);
  contributionsByPlugin.delete(pluginId);
}
