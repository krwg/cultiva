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
    { id: 'data', section: 'data', title: t.dataStorage || 'Data', description: t.storageBackendSectionDesc || '' }
  ];
}

export async function rebuildGlyphSearchIndexNow() {
  const statusEl = document.getElementById('glyph-search-status');
  const t = tStrings();
  if (statusEl) {
    statusEl.textContent = t.searchIndexBuilding || 'Indexing…';
  }

  let registryPlugins = [];
  try {
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

  const status = buildGlyphSearchIndex({
    habits: habits.getAll(),
    beds: getGardenBeds(),
    plugins: pluginDocs,
    events,
    settingsLabels: settingsLabelDocs(tStrings())
  });

  refreshGlyphSearchSettingsUi();
  return status;
}

export function refreshGlyphSearchSettingsUi() {
  const t = tStrings();
  const toggle = document.getElementById('toggle-glyph-search');
  const statusEl = document.getElementById('glyph-search-status');
  if (toggle) {
    toggle.checked = isGlyphSearchEnhanced();
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
}

export function bindGlyphSearchSettings() {
  const toggle = document.getElementById('toggle-glyph-search');
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
  if (rebuildBtn && !rebuildBtn.dataset.bound) {
    rebuildBtn.dataset.bound = '1';
    rebuildBtn.addEventListener('click', () => {
      void rebuildGlyphSearchIndexNow();
    });
  }
  refreshGlyphSearchSettingsUi();
}
