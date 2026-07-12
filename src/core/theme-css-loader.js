import { THEME_BODY_IDS, AMBIENT_BG_LAYER_IDS } from './theme-config.js';

const loadedThemes = new Set();
const loadedAmbients = new Set();
let themeLinkEl = null;
let ambientLinkEl = null;

function baseHref() {
  const link = document.querySelector('link[rel="stylesheet"][href*="shell"]')
    || document.querySelector('link[rel="stylesheet"][href*="main"]');
  if (!link) {
    return './styles/';
  }
  const href = link.getAttribute('href') || '';
  return href.replace(/[^/]+$/, '');
}

function ensureLink(id, href) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('link');
    el.id = id;
    el.rel = 'stylesheet';
    document.head.appendChild(el);
  }
  if (el.getAttribute('href') !== href) {
    el.setAttribute('href', href);
  }
  return el;
}

export async function loadThemeCss(themeId) {
  const id = THEME_BODY_IDS.includes(themeId) ? themeId : 'dark';
  if (loadedThemes.has(id)) {
    return;
  }
  const prefix = baseHref();
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
  if (!AMBIENT_BG_LAYER_IDS.includes(bgId)) {
    return;
  }
  if (loadedAmbients.has(bgId)) {
    return;
  }
  const prefix = baseHref();
  ambientLinkEl = ensureLink('cultiva-ambient-css', `${prefix}ambient/${bgId}.css`);
  loadedAmbients.add(bgId);
}

export function primeThemeCss(themeId) {
  return loadThemeCss(themeId);
}
