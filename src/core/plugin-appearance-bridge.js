import { applyAccentColor } from './customization.js';
import { resolveThemeBodyId } from './theme-config.js';
import { playPluginAmbientSound } from './plugin-sounds.js';
import { getPluginAppearancePresets } from './plugin-contributions.js';

async function readSettings() {
  const { settings } = await import('../app/renderer-bootstrap.js');
  return settings;
}

let _previewThemeRevert = null;

export async function applyThemeById(themeId, { persist = true } = {}) {
  const settings = await readSettings();
  settings.theme = themeId;
  if (persist) {
    const { saveSettings } = await import('../app/settings-controller.js');
    saveSettings();
  } else {
    const { applySettings } = await import('../app/settings-controller.js');
    applySettings();
  }
  return resolveThemeBodyId(themeId);
}

export async function applyBackgroundById(bgId, { persist = true } = {}) {
  const choice = bgId || 'none';
  localStorage.setItem('cultiva-background', choice);
  if (persist) {
    const { saveSettings } = await import('../app/settings-controller.js');
    saveSettings();
  } else {
    const { applySettings } = await import('../app/settings-controller.js');
    applySettings();
  }
  return choice;
}

export async function previewThemeById(themeId) {
  if (_previewThemeRevert === null) {
    const settings = await readSettings();
    _previewThemeRevert = settings.theme;
  }
  return applyThemeById(themeId, { persist: false });
}

export async function clearThemePreview() {
  if (_previewThemeRevert === null) {
    return null;
  }
  const revert = _previewThemeRevert;
  _previewThemeRevert = null;
  return applyThemeById(revert, { persist: false });
}

export async function applyAppearancePreset(presetId) {
  const preset = getPluginAppearancePresets().find((row) => row.id === presetId);
  if (!preset) {
    throw new Error(`Unknown appearance preset: ${presetId}`);
  }
  const settings = await readSettings();
  if (preset.theme) {
    settings.theme = preset.theme;
  }
  if (preset.background) {
    localStorage.setItem('cultiva-background', preset.background);
  }
  if (preset.sound) {
    localStorage.setItem('cultiva-ambient-sound', preset.sound);
  }
  if (preset.accentColor === null) {
    settings.accentColor = '';
    applyAccentColor('');
  } else if (typeof preset.accentColor === 'string') {
    settings.accentColor = preset.accentColor;
    applyAccentColor(preset.accentColor);
  }
  const { saveSettings } = await import('../app/settings-controller.js');
  saveSettings();
  if (preset.sound) {
    await playPluginAmbientSound(preset.sound);
  }
  return preset;
}
