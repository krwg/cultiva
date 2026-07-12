import { THEME_BODY_IDS, AMBIENT_BG_LAYER_IDS } from './theme-config.js';

const contributionsByPlugin = new Map();

function ensureBucket(pluginId) {
  if (!contributionsByPlugin.has(pluginId)) {
    contributionsByPlugin.set(pluginId, {
      themes: new Map(),
      backgrounds: new Map(),
      sounds: new Map(),
      settingsNav: new Map()
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

export function registerPluginTheme(pluginId, config = {}) {
  const localId = slugPart(config.id || config.name || 'theme');
  const id = makePluginContributionId(pluginId, localId);
  const bucket = ensureBucket(pluginId);
  bucket.themes.set(id, {
    id,
    pluginId,
    label: String(config.label || config.name || localId),
    group: config.group === 'light' ? 'light' : 'dark',
    cssText: typeof config.cssText === 'string' ? config.cssText : null,
    cssFile: typeof config.css === 'string' ? config.css.replace(/^[/\\]+/, '') : null
  });
  return id;
}

export function registerPluginBackground(pluginId, config = {}) {
  const localId = slugPart(config.id || config.name || 'background');
  const id = makePluginContributionId(pluginId, localId);
  const bucket = ensureBucket(pluginId);
  bucket.backgrounds.set(id, {
    id,
    pluginId,
    label: String(config.label || config.name || localId),
    cssText: typeof config.cssText === 'string' ? config.cssText : null,
    cssFile: typeof config.css === 'string' ? config.css.replace(/^[/\\]+/, '') : null,
    bodyClass: `with-bg-${id}`
  });
  return id;
}

export function registerPluginSound(pluginId, config = {}) {
  const localId = slugPart(config.id || config.name || 'sound');
  const id = makePluginContributionId(pluginId, localId);
  const bucket = ensureBucket(pluginId);
  bucket.sounds.set(id, {
    id,
    pluginId,
    label: String(config.label || config.name || localId),
    src: typeof config.src === 'string' ? config.src.replace(/^[/\\]+/, '') : '',
    loop: config.loop !== false,
    volume: typeof config.volume === 'number' ? Math.max(0, Math.min(1, config.volume)) : 0.6
  });
  return id;
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
  }
}

export async function applyManifestContributions(pluginId, manifest, readFile) {
  const contributes = manifest?.contributes;
  if (!contributes || typeof contributes !== 'object') {
    return;
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
