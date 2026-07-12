import { THEME_BODY_IDS, AMBIENT_BG_LAYER_IDS } from './theme-config.js';
import {
  injectPluginBackgroundCss,
  injectPluginThemeCss,
  isPluginBackgroundId,
  isPluginThemeId
} from './plugin-contributions.js';

const loadedThemes = new Set();
const loadedAmbients = new Set();
let themeLinkEl = null;
let ambientLinkEl = null;

/** Resolve URL prefix to public/styles/ from the current HTML page (incl. calendar subfolder). */
export function resolveStylesRootHref(doc = document) {
  const datasetRoot = doc.documentElement?.dataset?.stylesRoot;
  if (datasetRoot) {
    return datasetRoot.endsWith('/') ? datasetRoot : `${datasetRoot}/`;
  }

  const stylesheet = doc.querySelector(
    'link[rel="stylesheet"][href*="shell"],'
    + 'link[rel="stylesheet"][href*="main"],'
    + 'link[rel="stylesheet"][href*="electron-nav"]'
  );
  if (stylesheet) {
    const href = stylesheet.getAttribute('href') || '';
    if (href.includes('/assets/')) {
      return '../../styles/';
    }
    const dir = href.replace(/[^/]+$/, '');
    if (dir.includes('styles')) {
      return dir;
    }
  }

  if (doc.documentElement?.dataset?.page === 'calendar') {
    return '../../styles/';
  }

  try {
    const path = new URL(doc.location?.href || 'http://local/').pathname || '';
    const parts = path.split('/').filter(Boolean);
    if (parts.length && /\.[a-z0-9]+$/i.test(parts[parts.length - 1])) {
      parts.pop();
    }
    if (parts.length === 0) {
      return './styles/';
    }
    return `${'../'.repeat(parts.length)}styles/`;
  } catch {
    return './styles/';
  }
}

function ensureLink(id, href) {
  let el = docGet().getElementById(id);
  if (!el) {
    el = docGet().createElement('link');
    el.id = id;
    el.rel = 'stylesheet';
    docGet().head.appendChild(el);
  }
  if (el.getAttribute('href') !== href) {
    el.setAttribute('href', href);
  }
  return el;
}

function docGet() {
  return typeof document !== 'undefined' ? document : null;
}

async function readPluginAsset(pluginId, relPath) {
  if (!window.electron?.readPluginFile) {
    return '';
  }
  const raw = await window.electron.readPluginFile(`${pluginId}/${relPath}`);
  return raw || '';
}

export async function loadThemeCss(themeId) {
  if (isPluginThemeId(themeId)) {
    await injectPluginThemeCss(themeId, readPluginAsset);
    loadedThemes.add(themeId);
    return;
  }
  const id = THEME_BODY_IDS.includes(themeId) ? themeId : 'dark';
  const prefix = resolveStylesRootHref();
  themeLinkEl = ensureLink('cultiva-theme-css', `${prefix}themes/${id}.css`);
  loadedThemes.add(id);
}

export async function loadAmbientCss(bgId) {
  if (!bgId || bgId === 'none' || bgId === 'custom') {
    if (ambientLinkEl) {
      ambientLinkEl.remove();
      ambientLinkEl = null;
    }
    loadedAmbients.clear();
    return;
  }
  if (isPluginBackgroundId(bgId)) {
    await injectPluginBackgroundCss(bgId, readPluginAsset);
    loadedAmbients.add(bgId);
    return;
  }
  if (!AMBIENT_BG_LAYER_IDS.includes(bgId)) {
    return;
  }
  const prefix = resolveStylesRootHref();
  ambientLinkEl = ensureLink('cultiva-ambient-css', `${prefix}ambient/${bgId}.css`);
  loadedAmbients.add(bgId);
}

export function primeThemeCss(themeId) {
  return loadThemeCss(themeId);
}
