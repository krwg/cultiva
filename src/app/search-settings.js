import { habits } from '../modules/habits.js';
import { storage } from '../modules/storage.js';
import { settings } from './renderer-bootstrap.js';
import { saveSettings } from './settings-controller.js';
import { TRANSLATIONS } from '../core/i18n.js';
import { pluginManager } from '../core/plugin-manager.js';
import {
  buildGlyphSearchIndex,
  getGlyphSearchStatus,
  isGlyphSearchEnhanced,
  setGlyphSearchEnhanced
} from '../core/glyph-search-index.js';
import { ENGINE_VERSION } from '../core/glyph-s-search.js';
import { getGardenBeds } from './garden-layout.js';

function tStrings() {
  return TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
}

function settingsLabelDocs(t) {
  return [
    { id: 'profile', section: 'profile', title: t.profile || 'Profile', description: t.editProfileDesc || '' },
    { id: 'appearance', section: 'appearance', title: t.appearance || 'Appearance', description: t.appearanceSectionDesc || '' },
    { id: 'notifications', section: 'notifications', title: t.notifications || 'Notifications', description: t.notificationsSectionDesc || '' },
    { id: 'garden', section: 'garden', title: t.garden || 'Garden', description: '' },
    { id: 'plugins', section: 'plugins', title: t.plugins || 'Plugins', description: t.pluginsSectionDesc || '' },
    { id: 'search', section: 'search', title: t.searchSectionTitle || 'Search', description: t.searchSectionDesc || '' },
    { id: 'calendar', section: 'calendar', title: t.calendar || 'Calendar', description: '' },
    { id: 'data', section: 'data', title: t.dataStorage || 'Storage', description: t.storageBackendSectionDesc || '' },
    { id: 'focus', section: 'focus', title: t.focusSettings || 'Focus', description: t.focusSectionDesc || '' }
  ];
}

function setRebuildProgress(pct, label) {
  const bar = document.getElementById('glyph-search-rebuild-bar');
  const fill = document.getElementById('glyph-search-rebuild-fill');
  const statusEl = document.getElementById('glyph-search-status');
  if (bar) {
    bar.hidden = pct == null;
    bar.setAttribute('aria-hidden', pct == null ? 'true' : 'false');
  }
  if (fill && pct != null) {
    fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  }
  if (statusEl && label) {
    statusEl.textContent = label;
  }
}

export async function rebuildGlyphSearchIndexNow() {
  const t = tStrings();
  const rebuildBtn = document.getElementById('glyph-search-rebuild');
  if (rebuildBtn) {
    rebuildBtn.disabled = true;
    rebuildBtn.classList.add('is-busy');
  }
  setRebuildProgress(8, t.searchIndexBuilding || 'Indexing…');

  await new Promise((r) => requestAnimationFrame(() => r()));

  let registryPlugins = [];
  try {
    setRebuildProgress(28, t.searchIndexBuildingPlugins || t.searchIndexBuilding || 'Indexing plugins…');
    registryPlugins = await pluginManager.getAvailablePlugins();
  } catch {
    registryPlugins = [];
  }

  const installed = pluginManager.getInstalledPlugins() || [];
  const pluginDocs = [
    ...registryPlugins.map((p) => ({
      id: p.id,
      name: p.name || p.id,
      description: p.description || '',
      tagline: p.tagline || '',
      tags: p.tags || []
    })),
    ...installed.map((p) => ({
      id: p.id,
      name: p.name || p.id,
      description: p.description || '',
      tags: []
    }))
  ];

  setRebuildProgress(55, t.searchIndexBuildingHabits || t.searchIndexBuilding || 'Indexing habits…');
  let events = [];
  try {
    const raw = await storage.get('calendar-events');
    if (Array.isArray(raw)) {
      events = raw;
    } else if (raw && Array.isArray(raw.events)) {
      events = raw.events;
    }
  } catch {
    events = [];
  }

  setRebuildProgress(78, t.searchIndexBuilding || 'Indexing…');
  const status = buildGlyphSearchIndex({
    habits: habits.getAll(),
    beds: getGardenBeds(),
    plugins: pluginDocs,
    events,
    settingsLabels: settingsLabelDocs(tStrings())
  });

  setRebuildProgress(100, (t.searchIndexReady || 'Indexed · {n} items')
    .replace('{n}', String(status.count || 0)));
  await new Promise((r) => setTimeout(r, 280));
  setRebuildProgress(null);
  if (rebuildBtn) {
    rebuildBtn.disabled = false;
    rebuildBtn.classList.remove('is-busy');
  }
  refreshGlyphSearchSettingsUi();
  return status;
}

export function applyHeaderSearchVisibility() {
  const wrap = document.querySelector('.habit-search-wrap');
  const enabled = settings.headerSearchEnabled !== false;
  document.body.classList.toggle('header-search-hidden', !enabled);
  if (wrap) {
    wrap.hidden = !enabled;
    wrap.style.display = enabled ? '' : 'none';
  }
}

export function refreshGlyphSearchSettingsUi() {
  const t = tStrings();
  const toggle = document.getElementById('toggle-glyph-search');
  const headerToggle = document.getElementById('toggle-header-search');
  const statusEl = document.getElementById('glyph-search-status');
  const engineEl = document.getElementById('glyph-search-engine');
  if (toggle) {
    toggle.checked = isGlyphSearchEnhanced();
  }
  if (headerToggle) {
    headerToggle.checked = settings.headerSearchEnabled !== false;
  }
  if (engineEl) {
    engineEl.textContent = (t.searchEngineVersion || 'glyph-s {v}')
      .replace('{v}', ENGINE_VERSION);
  }
  if (statusEl) {
    const st = getGlyphSearchStatus();
    if (st.ready) {
      statusEl.textContent = (t.searchIndexReady || 'Indexed · {n} items')
        .replace('{n}', String(st.count || 0));
    } else {
      statusEl.textContent = t.searchIndexIdle || 'Not indexed yet';
    }
  }
  applyHeaderSearchVisibility();
}

export function bindGlyphSearchSettings() {
  const toggle = document.getElementById('toggle-glyph-search');
  const headerToggle = document.getElementById('toggle-header-search');
  const rebuildBtn = document.getElementById('glyph-search-rebuild');
  if (toggle && !toggle.dataset.bound) {
    toggle.dataset.bound = '1';
    toggle.checked = isGlyphSearchEnhanced();
    toggle.addEventListener('change', () => {
      setGlyphSearchEnhanced(toggle.checked);
      settings.glyphSearchEnhanced = toggle.checked;
      void saveSettings();
      if (toggle.checked) {
        void rebuildGlyphSearchIndexNow();
      } else {
        refreshGlyphSearchSettingsUi();
      }
    });
  }
  if (headerToggle && !headerToggle.dataset.bound) {
    headerToggle.dataset.bound = '1';
    headerToggle.checked = settings.headerSearchEnabled !== false;
    headerToggle.addEventListener('change', () => {
      settings.headerSearchEnabled = headerToggle.checked;
      applyHeaderSearchVisibility();
      void saveSettings();
    });
  }
  if (rebuildBtn && !rebuildBtn.dataset.bound) {
    rebuildBtn.dataset.bound = '1';
    rebuildBtn.addEventListener('click', () => {
      void rebuildGlyphSearchIndexNow();
    });
  }
  refreshGlyphSearchSettingsUi();
}
