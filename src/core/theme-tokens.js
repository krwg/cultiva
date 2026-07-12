import { THEME_BODY_IDS } from './theme-config.js';

export const THEME_TOKEN_KEYS = [
  '--bg-primary',
  '--bg-secondary',
  '--bg-tertiary',
  '--bg-quaternary',
  '--text-primary',
  '--text-secondary',
  '--text-tertiary',
  '--border-light',
  '--border-medium',
  '--accent-blue',
  '--accent-blue-hover',
  '--accent-purple',
  '--accent-pink',
  '--accent-green',
  '--accent-red',
  '--on-light',
  '--on-dark',
  '--shadow-sm',
  '--shadow-md',
  '--shadow-lg',
  '--shadow-xl',
  '--calendar-0',
  '--calendar-1',
  '--calendar-2',
  '--calendar-3',
  '--calendar-4'
];

export const BUILTIN_THEME_TOKENS = {
  birch: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#ffffff',
    '--bg-tertiary': '#f4f4f4',
    '--bg-quaternary': '#e8e8e8',
    '--text-primary': '#0b0b0b',
    '--text-secondary': '#3a3a3a',
    '--text-tertiary': '#6a6a6a',
    '--border-light': '#e0e0e0',
    '--border-medium': '#c8c8c8',
    '--accent-blue': '#0b0b0b',
    '--accent-blue-hover': '#1a1a1a',
    '--accent-purple': '#2a2a2a',
    '--accent-pink': '#333333',
    '--accent-green': '#3a3a3a',
    '--accent-red': '#1a1a1a',
    '--on-light': '#ffffff',
    '--on-dark': '#0b0b0b'
  },
  rowan: {
    '--bg-primary': '#0b0b0b',
    '--bg-secondary': '#111111',
    '--bg-tertiary': '#1a1a1a',
    '--bg-quaternary': '#242424',
    '--text-primary': '#f4f4f4',
    '--text-secondary': '#b8b8b8',
    '--text-tertiary': '#7a7a7a',
    '--border-light': '#2a2a2a',
    '--border-medium': '#3a3a3a',
    '--accent-blue': '#e8e8e8',
    '--accent-blue-hover': '#ffffff',
    '--accent-purple': '#c8c8c8',
    '--accent-pink': '#d0d0d0',
    '--accent-green': '#d8d8d8',
    '--accent-red': '#f0f0f0',
    '--on-light': '#0b0b0b',
    '--on-dark': '#f4f4f4'
  },
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f5f5f7',
    '--bg-tertiary': '#efeff4',
    '--text-primary': '#1d1d1f',
    '--text-secondary': '#6e6e73',
    '--accent-blue': '#0071e3',
    '--accent-blue-hover': '#0077ed',
    '--on-light': '#ffffff'
  },
  dark: {
    '--bg-primary': '#000000',
    '--bg-secondary': '#1c1c1e',
    '--bg-tertiary': '#2c2c2e',
    '--text-primary': '#f5f5f7',
    '--text-secondary': '#98989d',
    '--accent-blue': '#0a84ff',
    '--accent-blue-hover': '#409cff',
    '--on-light': '#ffffff'
  }
};

const MONOCHROME_ON_ACCENT_SELECTORS = [
  '.add-btn', '.add-btn:hover', '.btn-primary', '.btn-primary:hover',
  '.btn-card-primary:not(.completed)', '.dropdown-item.primary', '.dropdown-item.primary:hover',
  '.dynamic-notification-btn', '.day.today', '.status-badge.online',
  '.btn-danger:hover', '.btn-danger-outline:hover', '.btn-card-danger:hover',
  '.plugin-btn-install', '.plugin-btn-install:hover', '.plugin-btn-get', '.plugin-btn-get:hover',
  '.plugin-btn-settings', '.plugin-btn-settings:hover', '.plugin-btn-uninstall:hover',
  '.event-btn-primary', '.event-btn-primary:hover', '.release-badge.latest',
  '.update-status-card.updating .status-icon', '.update-status-card.available .status-icon',
  '.update-status-card.downloaded .status-icon', '.update-status-card.error .status-icon',
  '.user-avatar'
];

export function getBuiltinThemeIdsForExtend() {
  return THEME_BODY_IDS.filter((id) => BUILTIN_THEME_TOKENS[id]);
}

export function readThemeTokensFromDom() {
  const bodyStyle = getComputedStyle(document.body);
  const out = {};
  for (const key of THEME_TOKEN_KEYS) {
    const value = bodyStyle.getPropertyValue(key).trim();
    if (value) {
      out[key] = value;
    }
  }
  return out;
}

export function buildMonochromeOverrideCss(themeClass, lightSurfaces) {
  const onAccent = lightSurfaces ? '#ffffff' : '#0b0b0b';
  const lines = MONOCHROME_ON_ACCENT_SELECTORS.map(
    (sel) => `body.${themeClass} ${sel} { color: ${onAccent}; }`
  );
  if (lightSurfaces) {
    lines.push(
      `body.${themeClass} .btn-primary { background: #0b0b0b; }`,
      `body.${themeClass} .btn-primary:hover { background: #1a1a1a; }`,
      `body.${themeClass} .plugin-btn-install { background: #0b0b0b; color: #ffffff; }`
    );
  } else {
    lines.push(
      `body.${themeClass} .btn-primary { background: #f4f4f4; color: #0b0b0b; }`,
      `body.${themeClass} .btn-primary:hover { background: #ffffff; }`
    );
  }
  return `${lines.join('\n')}\n`;
}

export function buildExtendedThemeCss(themeId, config = {}) {
  const extendsId = config.extends;
  const base = extendsId && BUILTIN_THEME_TOKENS[extendsId]
    ? { ...BUILTIN_THEME_TOKENS[extendsId] }
    : {};
  const variables = config.variables && typeof config.variables === 'object' ? config.variables : {};
  const merged = { ...base, ...variables };
  const themeClass = `theme-${themeId}`;
  const tokenLines = Object.entries(merged)
    .map(([key, value]) => `    ${key.startsWith('--') ? key : `--${key}`}: ${value};`)
    .join('\n');

  let css = `body.${themeClass} {\n${tokenLines}\n}\n`;
  const wantsMono = config.monochrome === true
    || extendsId === 'birch'
    || extendsId === 'rowan';
  if (wantsMono) {
    const lightSurfaces = config.group === 'light'
      || extendsId === 'birch'
      || extendsId === 'light';
    css += buildMonochromeOverrideCss(themeClass, lightSurfaces);
  }
  if (typeof config.cssTextExtra === 'string' && config.cssTextExtra.trim()) {
    css += `\n${config.cssTextExtra.trim()}\n`;
  }
  return css;
}
