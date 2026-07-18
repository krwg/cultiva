import { TRANSLATIONS } from '../core/i18n.js';
import {
  resolvePluginCatalogMeta,
  resolvePluginSettingEmptyMessage,
  resolvePluginSettingLabel,
  resolvePluginSettingOptionLabel
} from '../core/plugin-manifest-i18n.js';
import { pluginManager, isNewerPluginVersion, pluginShowsGetButton, getCachedRegistryPlugin } from '../core/plugin-manager.js';
import { isPluginVersionCompatible } from './settings-controller.js';
import { storage } from '../modules/storage.js';
import { settings } from './renderer-bootstrap.js';
import { saveSettings } from './settings-controller.js';
import { showNotification } from './ui-shell.js';
import { showConfirmDialog } from './dialogs.js';
import { installFocusTrap, releaseFocusTrap } from './modals.js';
import { escapeHtml } from '../core/escape-html.js';
import { renderReleaseMarkdown } from '../core/release-markdown.js';
import { normalizeToken } from '../core/glyph-s-search.js';

function tStrings() {
  return TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
}

let pluginUpdatesToastShown = false;

export async function checkPluginUpdatesToast() {
  await notifyPluginUpdatesIfAny();
}

let _settingsCtxBound = false;
let _settingsCtxMenu = null;

export async function refreshPluginStoreAndUpdates() {
  const t = tStrings();
  showNotification('', t.pluginStoreRefreshing || 'Refreshing plugin store…');
  try {
    await pluginManager.refreshPluginStore();
    await renderPluginsSection();
    renderPluginHeaderItems();
    const updates = await pluginManager.getAvailablePluginUpdates();
    if (!updates.length) {
      showNotification('', t.pluginStoreUpToDate || 'Plugin store updated. All plugins are up to date.');
      return { updated: 0 };
    }
    let ok = 0;
    for (const row of updates) {
      try {
        if (typeof window.installPlugin === 'function') {
          await window.installPlugin(row.id);
          ok += 1;
        }
      } catch (e) {
        console.warn('[Plugins] Update failed:', row.id, e);
      }
    }
    await renderPluginsSection();
    renderPluginHeaderItems();
    const msg = (t.pluginStoreUpdatedCount || 'Plugin store refreshed. Updated {n} plugin(s).')
      .replace('{n}', String(ok));
    showNotification('', msg);
    return { updated: ok };
  } catch (e) {
    console.error('[Plugins] Store refresh failed:', e);
    showNotification('', t.pluginStoreRefreshFailed || 'Could not refresh the plugin store.');
    return { updated: 0, error: e };
  }
}

function closeSettingsContextMenu() {
  _settingsCtxMenu?.remove();
  _settingsCtxMenu = null;
}

export function bindSettingsPluginsContextMenu() {
  if (_settingsCtxBound) {
    return;
  }
  const modal = document.getElementById('settings-modal');
  if (!modal) {
    return;
  }
  _settingsCtxBound = true;

  modal.addEventListener('contextmenu', (e) => {
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    closeSettingsContextMenu();
    const t = tStrings();
    const menu = document.createElement('div');
    menu.className = 'cv-context-menu';
    menu.setAttribute('role', 'menu');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cv-context-menu-item';
    btn.setAttribute('role', 'menuitem');
    btn.textContent = t.contextRefreshPluginStore || 'Refresh plugin store';
    btn.addEventListener('click', () => {
      closeSettingsContextMenu();
      void refreshPluginStoreAndUpdates();
    });
    menu.appendChild(btn);
    document.body.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(e.clientX, window.innerWidth - rect.width - 8))}px`;
    menu.style.top = `${Math.max(8, Math.min(e.clientY, window.innerHeight - rect.height - 8))}px`;
    _settingsCtxMenu = menu;
  });

  document.addEventListener('click', closeSettingsContextMenu);
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      closeSettingsContextMenu();
    }
  });
}

async function notifyPluginUpdatesIfAny() {
  if (pluginUpdatesToastShown || !settings.pluginsEnabled) {
    return;
  }
  try {
    const updates = await pluginManager.getAvailablePluginUpdates();
    if (!updates.length) {
      return;
    }
    pluginUpdatesToastShown = true;
    const t = tStrings();
    showNotification('', t.pluginUpdatesToast || 'Plugin updates available in Settings → Plugins');
  } catch {
    void 0;
  }
}

function registryUpdateVersion(registryPlugins, pluginId, installedVersion) {
  const reg = registryPlugins.find((row) => row.id === pluginId);
  if (!reg?.version || !installedVersion) {
    return null;
  }
  return isNewerPluginVersion(reg.version, installedVersion) ? reg.version : null;
}

export async function renderPluginsSection() {
  bindSettingsPluginsContextMenu();
  const pluginsToggle = document.getElementById('toggle-plugins');
  if (pluginsToggle) {
    pluginsToggle.checked = settings.pluginsEnabled;
  }
  if (pluginsToggle && !pluginsToggle.dataset.bound) {
    pluginsToggle.dataset.bound = '1';
    pluginsToggle.addEventListener('change', async (e) => {
      settings.pluginsEnabled = e.target.checked;
      saveSettings();

      if (settings.pluginsEnabled) {
        await pluginManager.init();
        renderPluginHeaderItems();
      } else {
        await pluginManager.disableAllPlugins();
        document.querySelectorAll('.header-plugin-item').forEach((el) => el.remove());
      }
      await loadInstalledPlugins();
    });
  }

  let registryPlugins = [];
  if (settings.pluginsEnabled) {
    try {
      registryPlugins = await pluginManager.getAvailablePlugins();
    } catch {
      registryPlugins = [];
    }
  }

  await loadInstalledPlugins(registryPlugins);
  await loadAvailablePlugins(registryPlugins);
  void notifyPluginUpdatesIfAny();
}

function localizedPluginMeta(pluginId, fallbackName, fallbackDesc, registryPlugins = []) {
  const registryEntry =
    registryPlugins.find((row) => row.id === pluginId)
    || getCachedRegistryPlugin(pluginId);
  if (registryEntry) {
    const meta = resolvePluginCatalogMeta(registryEntry, settings.lang);
    if (meta.name) {
      return meta;
    }
  }
  const pluginData = pluginManager.plugins.get(pluginId);
  if (pluginData?.manifest) {
    const merged = registryEntry
      ? { ...pluginData.manifest, i18n: registryEntry.i18n || pluginData.manifest.i18n }
      : pluginData.manifest;
    const meta = resolvePluginCatalogMeta(merged, settings.lang);
    if (meta.name) {
      return meta;
    }
  }
  return {
    name: fallbackName || '',
    description: fallbackDesc || '',
    tagline: ''
  };
}

let browseTagFilter = '';
let browseSearchQuery = '';
let browseSortMode = 'updated';

function permissionLabel(perm, t) {
  const key = String(perm || '');
  const map = {
    network: t.pluginPermNetwork || 'Internet access — fetch remote data for this plugin',
    storage: t.pluginPermStorage || 'Local storage — save plugin settings and favorites on this device',
    ui: t.pluginPermUi || 'UI — show widgets in the garden or header',
    'habits.write': t.pluginPermHabitsWrite || 'Habits write — mark habits complete on your behalf',
    'habits.read': t.pluginPermHabitsRead || 'Habits read — see habit names and progress',
    'settings.read': t.pluginPermSettingsRead || 'Settings read — read language, theme, and related options'
  };
  return map[key] || key;
}

function formatPermissionsList(permissions, t) {
  const perms = Array.isArray(permissions) ? permissions : [];
  if (!perms.length) {
    return '';
  }
  return perms.map((p) => `- ${permissionLabel(p, t)}`).join('\n');
}

function isFeaturedPlugin(p) {
  if (p?.featured === true) {
    return true;
  }
  const tags = Array.isArray(p?.tags) ? p.tags : [];
  return tags.some((tag) => String(tag).toLowerCase() === 'featured');
}

function pluginSortKey(p) {
  const updated = p?.lastUpdated ? Date.parse(p.lastUpdated) : 0;
  return Number.isFinite(updated) ? updated : 0;
}

function pluginDisplayName(p) {
  const meta = resolvePluginCatalogMeta(p, settings.lang);
  return String(meta.name || p?.name || p?.id || '');
}

function sortBrowsePlugins(plugins) {
  const mode = browseSortMode || 'updated';
  return [...plugins].sort((a, b) => {
    if (mode === 'name-az') {
      return pluginDisplayName(a).localeCompare(pluginDisplayName(b), settings.lang === 'ru' ? 'ru' : 'en', { sensitivity: 'base' });
    }
    if (mode === 'name-za') {
      return pluginDisplayName(b).localeCompare(pluginDisplayName(a), settings.lang === 'ru' ? 'ru' : 'en', { sensitivity: 'base' });
    }
    if (mode === 'name-ru') {
      return pluginDisplayName(a).localeCompare(pluginDisplayName(b), 'ru', { sensitivity: 'base' });
    }
    const byDate = pluginSortKey(b) - pluginSortKey(a);
    if (byDate !== 0) {
      return byDate;
    }
    return pluginDisplayName(a).localeCompare(pluginDisplayName(b), settings.lang === 'ru' ? 'ru' : 'en', { sensitivity: 'base' });
  });
}

function collectRegistryTags(plugins) {
  const tags = new Set();
  for (const p of plugins) {
    for (const tag of Array.isArray(p.tags) ? p.tags : []) {
      const cleaned = String(tag || '').trim();
      if (cleaned) {
        tags.add(cleaned);
      }
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

function matchesBrowseFilters(p, meta) {
  if (browseTagFilter === '__featured__') {
    if (!isFeaturedPlugin(p)) {
      return false;
    }
  } else if (browseTagFilter) {
    const tags = Array.isArray(p.tags) ? p.tags.map((tag) => String(tag).toLowerCase()) : [];
    if (!tags.includes(browseTagFilter.toLowerCase())) {
      return false;
    }
  }
  const q = normalizeToken(browseSearchQuery);
  if (!q) {
    return true;
  }
  const i18n = p.i18n || {};
  const en = i18n.en || {};
  const ru = i18n.ru || {};
  const hay = normalizeToken([
    p.id,
    meta.name,
    meta.description,
    meta.tagline,
    p.name,
    p.description,
    en.name,
    en.description,
    en.tagline,
    ru.name,
    ru.description,
    ru.tagline,
    ...(Array.isArray(p.tags) ? p.tags : []),
    p.author,
    p.version
  ].join(' '));
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((token) => hay.includes(token));
}

function resolvePluginAssetUrl(baseUrl, rel) {
  if (!rel) {
    return '';
  }
  const value = String(rel);
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const base = String(baseUrl || '').replace(/\/$/, '');
  if (!base) {
    return value;
  }
  return `${base}/${value.replace(/^\//, '')}`;
}

function formatLastUpdatedLabel(iso, t) {
  if (!iso) {
    return '';
  }
  const prefix = t.pluginLastUpdated || 'Updated';
  const day = String(iso).slice(0, 10);
  return `${prefix} ${day}`;
}

async function confirmPluginPermissions(row, t) {
  const list = formatPermissionsList(row?.permissions, t);
  const message = list
    || (settings.lang === 'ru' ? 'Плагин не запрашивает особых разрешений.' : 'This plugin does not request special permissions.');
  return showConfirmDialog(message, {
    title: t.pluginInstallPermissionsTitle || 'Allow permissions?',
    confirmText: t.install || 'Install',
    cancelText: t.cancel || 'Cancel'
  });
}

async function openPluginDetailsModal(p) {
  const t = tStrings();
  const meta = resolvePluginCatalogMeta(p, settings.lang);
  const wrap = document.createElement('div');
  wrap.className = 'plugin-settings-modal plugin-details-modal';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');

  const sheet = document.createElement('div');
  sheet.className = 'plugin-settings-sheet';

  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `<h2>${escapeHtml(meta.name || p.id)}</h2><button type="button" class="modal-close" aria-label="${escapeHtml(t.cancel || 'Close')}">&times;</button>`;

  const body = document.createElement('div');
  body.className = 'modal-body plugin-details-body';

  const desc = document.createElement('p');
  desc.className = 'plugin-description';
  desc.textContent = meta.description || '';
  body.appendChild(desc);

  const readmeRel = p.readme || 'README.md';
  const readmeUrl = resolvePluginAssetUrl(p.baseUrl, readmeRel);
  if (readmeUrl) {
    try {
      const res = await fetch(readmeUrl, { cache: 'no-store' });
      if (res.ok) {
        const md = await res.text();
        if (md.trim()) {
          const readme = document.createElement('div');
          readme.className = 'plugin-details-readme release-md';
          readme.innerHTML = renderReleaseMarkdown(md);
          body.appendChild(readme);
        }
      }
    } catch {
      void 0;
    }
  }

  const tags = Array.isArray(p.tags) ? p.tags : [];
  if (tags.length) {
    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'plugin-details-tags';
    for (const tag of tags) {
      const chip = document.createElement('span');
      chip.className = 'plugin-details-tag';
      chip.textContent = String(tag);
      tagsWrap.appendChild(chip);
    }
    body.appendChild(tagsWrap);
  }

  const perms = Array.isArray(p.permissions) ? p.permissions : [];
  if (perms.length) {
    const heading = document.createElement('div');
    heading.className = 'plugin-details-perms-title';
    heading.textContent = t.pluginPermissions || 'Permissions';
    body.appendChild(heading);
    const list = document.createElement('ul');
    list.className = 'plugin-details-perms';
    for (const perm of perms) {
      const li = document.createElement('li');
      li.textContent = permissionLabel(perm, t);
      list.appendChild(li);
    }
    body.appendChild(list);
  }

  const updated = formatLastUpdatedLabel(p.lastUpdated, t);
  if (updated) {
    const metaEl = document.createElement('div');
    metaEl.className = 'plugin-details-meta';
    metaEl.textContent = updated;
    body.appendChild(metaEl);
  }

  const changelogRel = p.changelog || 'CHANGELOG.md';
  const changelogUrl = resolvePluginAssetUrl(p.baseUrl, changelogRel);
  if (changelogUrl) {
    try {
      const res = await fetch(changelogUrl, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        if (text.trim()) {
          const changelog = document.createElement('div');
          changelog.className = 'plugin-details-changelog release-md release-detail-body';
          changelog.innerHTML = renderReleaseMarkdown(text);
          body.appendChild(changelog);
        }
      }
    } catch {
      void 0;
    }
  }

  const shots = Array.isArray(p.screenshots) ? p.screenshots : [];
  if (shots.length) {
    const shotsWrap = document.createElement('div');
    shotsWrap.className = 'plugin-details-screenshots';
    for (const shot of shots) {
      const src = resolvePluginAssetUrl(p.baseUrl, shot);
      if (!src) {
        continue;
      }
      const img = document.createElement('img');
      img.src = src;
      img.alt = meta.name || p.id;
      img.loading = 'lazy';
      img.addEventListener('error', () => {
        img.remove();
        if (!shotsWrap.childElementCount) {
          shotsWrap.remove();
        }
      });
      shotsWrap.appendChild(img);
    }
    if (shotsWrap.childElementCount) {
      body.appendChild(shotsWrap);
    }
  }

  const footer = document.createElement('div');
  footer.className = 'plugin-settings-actions modal-footer';
  const btnClose = document.createElement('button');
  btnClose.type = 'button';
  btnClose.className = 'btn-secondary';
  btnClose.textContent = t.cancel || 'Close';
  footer.appendChild(btnClose);

  sheet.appendChild(header);
  sheet.appendChild(body);
  sheet.appendChild(footer);
  wrap.appendChild(sheet);
  document.body.appendChild(wrap);
  installFocusTrap(wrap);

  const close = () => {
    releaseFocusTrap();
    wrap.remove();
  };
  wrap.addEventListener('click', (e) => {
    if (e.target === wrap) {
      close();
    }
  });
  header.querySelector('.modal-close')?.addEventListener('click', close);
  btnClose.addEventListener('click', close);
}

function createBrowsePluginCard(p, t, plugins) {
  const card = document.createElement('div');
  card.className = 'plugin-card';

  const meta = resolvePluginCatalogMeta(p, settings.lang);
  const stub = { id: p.id, name: meta.name, description: meta.description, version: p.version, loaded: true, enabled: true };
  const main = createPluginCardMain(stub, null, t, {
    showSettings: false,
    registryPlugins: plugins,
    browseMeta: {
      minAppVersion: p.minAppVersion,
      author: p.author
    }
  });

  const actions = main.querySelector('.plugin-actions');
  actions.replaceChildren();

  const btnDetails = document.createElement('button');
  btnDetails.type = 'button';
  btnDetails.className = 'plugin-btn plugin-btn-settings';
  btnDetails.textContent = t.pluginDetails || 'Details';
  btnDetails.addEventListener('click', () => {
    void openPluginDetailsModal(p);
  });
  actions.appendChild(btnDetails);
  appendBrowseInstallButton(actions, p, t);

  card.appendChild(main);
  return card;
}

function createPluginCardMain(p, pluginData, t, { showSettings = false, updateVersion = null, registryPlugins = [], browseMeta = null } = {}) {
  const meta = localizedPluginMeta(p.id, p.name, p.description, registryPlugins);
  const main = document.createElement('div');
  main.className = 'plugin-card-main';

  const top = document.createElement('div');
  top.className = 'plugin-card-top';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'plugin-icon';
  iconWrap.textContent = '';

  const info = document.createElement('div');
  info.className = 'plugin-info';

  const nameEl = document.createElement('div');
  nameEl.className = 'plugin-name';
  nameEl.textContent = meta.name;

  if (meta.tagline) {
    const taglineEl = document.createElement('div');
    taglineEl.className = 'plugin-tagline';
    taglineEl.textContent = meta.tagline;
    info.appendChild(nameEl);
    info.appendChild(taglineEl);
  } else {
    info.appendChild(nameEl);
  }

  const descEl = document.createElement('div');
  descEl.className = 'plugin-description';
  const baseDesc = meta.description;
  const failReason = showSettings ? pluginManager.getPluginFailure(p.id) : null;
  descEl.textContent = showSettings && !p.loaded
    ? `${baseDesc ? `${baseDesc} — ` : ''}${failReason || t.pluginNotLoadedHint || 'Not loaded.'}`
    : baseDesc;

  info.appendChild(descEl);
  top.appendChild(iconWrap);
  top.appendChild(info);

  const footer = document.createElement('div');
  footer.className = 'plugin-card-footer';

  const versionRow = document.createElement('div');
  versionRow.className = 'plugin-meta';
  const ver = document.createElement('span');
  ver.className = 'plugin-version';
  ver.textContent = p.version ? `[${p.version}]` : '';
  versionRow.appendChild(ver);
  if (updateVersion) {
    const upd = document.createElement('span');
    upd.className = 'plugin-update-badge';
    upd.textContent = `${t.pluginUpdateAvailable || 'Update available'} · [${updateVersion}]`;
    versionRow.appendChild(upd);
  }
  if (browseMeta?.minAppVersion) {
    const minBadge = document.createElement('span');
    minBadge.className = 'plugin-min-badge';
    minBadge.textContent = `${t.pluginMinAppVersion || 'Requires Cultiva'} ${browseMeta.minAppVersion}+`;
    versionRow.appendChild(minBadge);
  }
  if (browseMeta?.author) {
    const author = document.createElement('span');
    author.className = 'plugin-author';
    author.textContent = String(browseMeta.author);
    versionRow.appendChild(author);
  }

  const actions = document.createElement('div');
  actions.className = 'plugin-actions';

  if (showSettings) {
    const fields = Array.isArray(pluginData?.manifest?.settings) ? pluginData.manifest.settings : [];
    if (updateVersion && typeof window !== 'undefined' && window.installPlugin) {
      const btnUpdate = document.createElement('button');
      btnUpdate.type = 'button';
      btnUpdate.className = 'plugin-btn plugin-btn-update';
      btnUpdate.textContent = t.pluginUpdateBtn || 'Update';
      btnUpdate.addEventListener('click', () => window.installPlugin(p.id));
      actions.appendChild(btnUpdate);
    }
    if (fields.length) {
      const btnSettings = document.createElement('button');
      btnSettings.type = 'button';
      btnSettings.className = 'plugin-btn plugin-btn-settings';
      btnSettings.title = t.pluginSettings;
      btnSettings.textContent = t.pluginSettings || 'Settings';
      btnSettings.disabled = !p.loaded;
      btnSettings.addEventListener('click', () => window.openPluginSettings(p.id));
      actions.appendChild(btnSettings);
    }

    const btnRetry = document.createElement('button');
    btnRetry.type = 'button';
    btnRetry.className = 'plugin-btn plugin-btn-settings';
    btnRetry.textContent = t.retry || 'Retry';
    btnRetry.style.display = p.loaded ? 'none' : 'inline-flex';
    btnRetry.addEventListener('click', async () => {
      btnRetry.disabled = true;
      const ok = await pluginManager.reloadPlugin(p.id);
      await renderPluginsSection();
      renderPluginHeaderItems();
      btnRetry.disabled = false;
      if (typeof window.showNotification === 'function') {
        if (ok) {
          window.showNotification('', t.pluginRetryOk || 'Plugin loaded.');
        } else {
          const detail = pluginManager.getPluginFailure(p.id);
          const lead = detail ? `${p.name || p.id}: ${detail}` : (t.pluginNotLoadedHint || 'Plugin not loaded');
          window.showNotification('', lead);
        }
      }
    });
    actions.appendChild(btnRetry);

    const btnUninstall = document.createElement('button');
    btnUninstall.type = 'button';
    btnUninstall.className = 'plugin-btn plugin-btn-uninstall';
    btnUninstall.title = t.uninstall;
    btnUninstall.textContent = t.uninstall || 'Uninstall';
    btnUninstall.addEventListener('click', () => window.uninstallPlugin(p.id));
    actions.appendChild(btnUninstall);

    const toggleWrap = document.createElement('label');
    toggleWrap.className = 'plugin-enable-switch toggle-switch';
    toggleWrap.title = t.enabled || 'Enabled';
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.checked = Boolean(p.enabled);
    toggleInput.setAttribute('aria-label', t.enabled || 'Enabled');
    toggleInput.addEventListener('change', async () => {
      await pluginManager.setPluginEnabled(p.id, toggleInput.checked);
      await renderPluginsSection();
      renderPluginHeaderItems();
    });
    const toggleSlider = document.createElement('span');
    toggleSlider.className = 'toggle-slider';
    toggleWrap.appendChild(toggleInput);
    toggleWrap.appendChild(toggleSlider);
    actions.appendChild(toggleWrap);
  }

  footer.appendChild(versionRow);
  footer.appendChild(actions);
  main.appendChild(top);
  main.appendChild(footer);
  return main;
}

function appendBrowseInstallButton(actions, p, t) {
  const pid = p.id;
  const canInstall = Boolean(typeof window !== 'undefined' && window.electron?.installPlugin);
  const versionOk = isPluginVersionCompatible(p.minAppVersion);
  const showGet = pluginShowsGetButton(p);

  const btn = document.createElement('button');
  btn.type = 'button';

  if (p.installed) {
    btn.className = 'plugin-btn plugin-btn-installed';
    btn.disabled = true;
    btn.textContent = t.pluginInstalledButton || 'Installed';
    actions.appendChild(btn);
    return;
  }

  if (!versionOk) {
    btn.className = 'plugin-btn plugin-btn-installed';
    btn.disabled = true;
    btn.textContent = t.pluginRequiresUpdate || 'Update Cultiva';
    btn.title = `${t.pluginMinAppVersion || 'Requires Cultiva'} ${p.minAppVersion || ''}`;
    actions.appendChild(btn);
    return;
  }

  if (!canInstall) {
    btn.className = 'plugin-btn plugin-btn-installed';
    btn.disabled = true;
    btn.textContent = showGet && !p.downloaded ? (t.pluginGet || 'Get') : (t.install || 'Install');
    btn.title = t.pluginInstallDesktopOnly || '';
    actions.appendChild(btn);
    return;
  }

  if (showGet && !p.downloaded) {
    btn.className = 'plugin-btn plugin-btn-get';
    btn.textContent = t.pluginGet || 'Get';
    btn.addEventListener('click', () => window.getPlugin(pid));
    actions.appendChild(btn);
    return;
  }

  btn.className = 'plugin-btn plugin-btn-install';
  btn.textContent = t.install || 'Install';
  btn.addEventListener('click', () => window.installPlugin(pid));
  actions.appendChild(btn);
}

async function loadInstalledPlugins(registryPlugins = []) {
  const container = document.getElementById('installed-plugins-list');
  if (!container) {
    return;
  }

  const plugins = await pluginManager.getInstalledPluginsForUI();
  const t = tStrings();

  container.replaceChildren();

  if (plugins.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'plugins-empty';
    empty.dataset.i18n = 'noPluginsInstalled';
    empty.textContent = t.noPluginsInstalled;
    container.appendChild(empty);
    return;
  }

  for (const p of plugins) {
    const card = document.createElement('div');
    card.className = 'plugin-card';
    if (!p.enabled) {
      card.classList.add('plugin-card-disabled');
    }

    const pluginData = pluginManager.plugins.get(p.id);
    const updateVersion = registryUpdateVersion(registryPlugins, p.id, p.version);
    card.appendChild(createPluginCardMain(p, pluginData, t, { showSettings: true, updateVersion, registryPlugins }));
    container.appendChild(card);
  }
}

function renderBrowseStore(container, plugins, t) {
  container.replaceChildren();

  if (plugins.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'plugins-empty';
    empty.dataset.i18n = 'noPluginsAvailable';
    empty.textContent = t.noPluginsAvailable;
    container.appendChild(empty);
    return;
  }

  const toolbar = document.createElement('div');
  toolbar.className = 'plugin-store-toolbar';

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'plugin-store-search';
  search.placeholder = t.pluginStoreSearchPlaceholder || 'Search plugins…';
  search.value = browseSearchQuery;
  search.addEventListener('input', () => {
    browseSearchQuery = search.value || '';
    const active = document.activeElement === search;
    const start = search.selectionStart;
    const end = search.selectionEnd;
    renderBrowseStore(container, plugins, t);
    const next = container.querySelector('.plugin-store-search');
    if (next && active) {
      next.focus();
      try {
        next.setSelectionRange(start, end);
      } catch {
        void 0;
      }
    }
  });
  toolbar.appendChild(search);

  const filters = document.createElement('div');
  filters.className = 'plugin-store-filters';

  const tagWrap = document.createElement('label');
  tagWrap.className = 'plugin-store-filter';
  const tagLabel = document.createElement('span');
  tagLabel.className = 'plugin-store-filter-label';
  tagLabel.textContent = t.pluginFilterCategory || 'Category';
  const tagSelect = document.createElement('select');
  tagSelect.className = 'plugin-store-select';
  const allTags = collectRegistryTags(plugins);
  const tagOptions = [
    ['', t.pluginFilterAll || 'All'],
    ['__featured__', t.pluginFilterFeatured || t.pluginFeatured || 'Featured'],
    ...allTags.map((tag) => [tag, tag])
  ];
  for (const [value, label] of tagOptions) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if ((value || '') === (browseTagFilter || '')) {
      opt.selected = true;
    }
    tagSelect.appendChild(opt);
  }
  tagSelect.addEventListener('change', () => {
    browseTagFilter = tagSelect.value || '';
    renderBrowseStore(container, plugins, t);
  });
  tagWrap.appendChild(tagLabel);
  tagWrap.appendChild(tagSelect);
  filters.appendChild(tagWrap);

  const sortWrap = document.createElement('label');
  sortWrap.className = 'plugin-store-filter';
  const sortLabel = document.createElement('span');
  sortLabel.className = 'plugin-store-filter-label';
  sortLabel.textContent = t.pluginSortLabel || 'Sort';
  const sortSelect = document.createElement('select');
  sortSelect.className = 'plugin-store-select';
  const sortModes = [
    ['updated', t.pluginSortUpdated || 'Updated'],
    ['name-az', t.pluginSortNameAz || 'A–Z'],
    ['name-za', t.pluginSortNameZa || 'Z–A'],
    ['name-ru', t.pluginSortNameRu || 'А–Я']
  ];
  for (const [value, label] of sortModes) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if (value === (browseSortMode || 'updated')) {
      opt.selected = true;
    }
    sortSelect.appendChild(opt);
  }
  sortSelect.addEventListener('change', () => {
    browseSortMode = sortSelect.value || 'updated';
    renderBrowseStore(container, plugins, t);
  });
  sortWrap.appendChild(sortLabel);
  sortWrap.appendChild(sortSelect);
  filters.appendChild(sortWrap);

  toolbar.appendChild(filters);
  container.appendChild(toolbar);

  const filtered = plugins.filter((p) => {
    const meta = resolvePluginCatalogMeta(p, settings.lang);
    return matchesBrowseFilters(p, meta);
  });

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'plugins-empty';
    empty.textContent = t.noPluginsAvailable;
    container.appendChild(empty);
    return;
  }

  for (const p of sortBrowsePlugins(filtered)) {
    container.appendChild(createBrowsePluginCard(p, t, plugins));
  }
}

async function loadAvailablePlugins(registryPlugins = []) {
  const container = document.getElementById('available-plugins-list');
  if (!container) {
    return;
  }

  const t = tStrings();
  container.replaceChildren();
  const loading = document.createElement('div');
  loading.className = 'plugins-loading';
  loading.dataset.i18n = 'checkingPlugins';
  loading.textContent = t.checkingPlugins;
  container.appendChild(loading);

  try {
    const plugins = await pluginManager.getAvailablePlugins();
    renderBrowseStore(container, plugins, t);
  } catch (e) {
    console.error('[Plugins UI] loadAvailablePlugins:', e);
    container.replaceChildren();
    const err = document.createElement('div');
    err.className = 'plugins-empty';
    const base = t.pluginsRegistryError || 'Could not load the plugin catalog.';
    err.textContent = e && e.message ? `${base} (${e.message})` : base;
    container.appendChild(err);
  }
}

window.getPlugin = async (pluginId) => {
  const t = tStrings();
  try {
    showNotification('', t.pluginGetProgress || 'Downloading plugin...');
    await pluginManager.downloadPlugin(pluginId);
    showNotification('', t.pluginGetSuccess || 'Plugin ready to install');
    await renderPluginsSection();
  } catch (e) {
    showNotification('', `${t.pluginGetFailed || 'Failed to download plugin'}: ${e.message}`);
  }
};

window.installPlugin = async (pluginId) => {
  const t = tStrings();
  try {
    const row = (await pluginManager.getAvailablePlugins()).find((p) => p.id === pluginId);
    if (row) {
      const allowed = await confirmPluginPermissions(row, t);
      if (!allowed) {
        return;
      }
    }
    if (row && pluginShowsGetButton(row) && row.downloaded && !row.installed) {
      showNotification('', t.pluginActivateProgress || 'Installing plugin...');
      await pluginManager.activatePlugin(pluginId);
    } else {
      showNotification('', t.pluginInstallProgress || 'Installing plugin...');
      await pluginManager.installPlugin(pluginId);
    }
    showNotification('', t.pluginInstallSuccess || 'Plugin installed successfully!');
    await renderPluginsSection();
    renderPluginHeaderItems();
  } catch (e) {
    showNotification('', e.message || t.pluginInstallFailed || 'Failed to install plugin');
  }
};

window.uninstallPlugin = async (pluginId) => {
  const t = tStrings();
  const shouldUninstall = await showConfirmDialog(t.pluginUninstallConfirm, {
    title: t.uninstall || 'Uninstall',
    confirmText: t.uninstall || 'Uninstall',
    cancelText: t.cancel || 'Cancel',
    tone: 'danger'
  });
  if (shouldUninstall) {
    await pluginManager.uninstallPlugin(pluginId);
    showNotification('', t.pluginUninstallSuccess);
    await renderPluginsSection();
    renderPluginHeaderItems();
  }
};

window.openPluginSettings = async (pluginId) => {
  const t = tStrings();
  const pluginData = pluginManager.plugins.get(pluginId);
  if (!pluginData?.manifest) {
    showNotification('', t.pluginNotLoadedHint || 'Plugin not loaded');
    return;
  }
  const fields = Array.isArray(pluginData.manifest.settings) ? pluginData.manifest.settings : [];
  if (!fields.length) {
    showNotification('', t.pluginSettingsEmpty || 'No settings for this plugin');
    return;
  }
  const prefix = `plugin_${pluginId}_`;
  let current = await storage.get(prefix + 'settings');
  if (typeof current === 'string') {
    try {
      current = JSON.parse(current);
    } catch {
      current = {};
    }
  }
  if (!current || typeof current !== 'object') {
    current = {};
  }
  const localized = localizedPluginMeta(pluginId, pluginData.manifest.name, pluginData.manifest.description, []);
  const wrap = document.createElement('div');
  wrap.className = 'plugin-settings-modal';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');

  const sheet = document.createElement('div');
  sheet.className = 'plugin-settings-sheet';

  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `<h2>${escapeHtml(localized.name)}</h2><button type="button" class="modal-close" aria-label="${escapeHtml(t.cancel || 'Close')}">&times;</button>`;

  const body = document.createElement('div');
  body.className = 'modal-body';
  const form = document.createElement('form');
  form.id = 'plugin-settings-form';
  form.className = 'plugin-settings-form';

  for (const field of fields) {
    const row = document.createElement('div');
    row.className = 'plugin-settings-row';
    const label = document.createElement('span');
    label.className = 'plugin-settings-label';
    label.textContent = resolvePluginSettingLabel(field, settings.lang, field.label || field.key);
    row.appendChild(label);

    const val = current[field.key] !== undefined ? current[field.key] : field.default;
    if (field.type === 'journal') {
      const journalRaw = await storage.get(prefix + (field.storageKey || 'journal'));
      const entries = Array.isArray(journalRaw) ? journalRaw : [];
      const list = document.createElement('div');
      list.className = 'plugin-journal-list';
      if (!entries.length) {
        const empty = document.createElement('p');
        empty.className = 'plugin-favorites-empty';
        empty.textContent = resolvePluginSettingEmptyMessage(
          field,
          settings.lang,
          t.pluginJournalEmpty || 'No reflections saved yet.'
        );
        list.appendChild(empty);
      } else {
        for (const entry of entries) {
          const block = document.createElement('div');
          block.className = 'plugin-journal-item';
          const meta = document.createElement('div');
          meta.className = 'plugin-journal-meta';
          const habitLabel = entry.habitName || entry.habitId || '—';
          const dateLabel = entry.date || '';
          meta.textContent = `${t.pluginJournalDate || 'Date'}: ${dateLabel} · ${t.pluginJournalHabit || 'Habit'}: ${habitLabel}`;
          const textEl = document.createElement('div');
          textEl.className = 'plugin-journal-text';
          textEl.textContent = entry.text || '';
          block.appendChild(meta);
          block.appendChild(textEl);
          list.appendChild(block);
        }
      }
      row.appendChild(list);
      form.appendChild(row);
      continue;
    }
    if (field.type === 'favorites') {
      const favRaw = await storage.get(prefix + 'favorites');
      const favs = Array.isArray(favRaw) ? favRaw : [];
      const list = document.createElement('div');
      list.className = 'plugin-favorites-list';
      if (!favs.length) {
        const empty = document.createElement('p');
        empty.className = 'plugin-favorites-empty';
        empty.textContent = resolvePluginSettingEmptyMessage(
          field,
          settings.lang,
          t.pluginSettingsListEmpty || 'No items yet.'
        );
        list.appendChild(empty);
      } else {
        for (const item of favs) {
          const block = document.createElement('div');
          block.className = 'plugin-favorites-item';
          const textEl = document.createElement('div');
          textEl.className = 'plugin-favorites-text';
          textEl.textContent = `"${item.text || ''}"`;
          const authorEl = document.createElement('div');
          authorEl.className = 'plugin-favorites-author';
          authorEl.textContent = `— ${item.author || ''}`;
          block.appendChild(textEl);
          block.appendChild(authorEl);
          list.appendChild(block);
        }
      }
      row.appendChild(list);
      form.appendChild(row);
      continue;
    }
    if (field.type === 'boolean') {
      const toggle = document.createElement('label');
      toggle.className = 'plugin-enable-switch toggle-switch';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = field.key;
      input.checked = Boolean(val);
      const slider = document.createElement('span');
      slider.className = 'toggle-slider';
      toggle.appendChild(input);
      toggle.appendChild(slider);
      row.appendChild(toggle);
    } else if (field.type === 'select' && Array.isArray(field.options)) {
      const select = document.createElement('select');
      select.name = field.key;
      select.className = 'select-input';
      for (const opt of field.options) {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = resolvePluginSettingOptionLabel(field, opt.value, settings.lang, opt, opt.label || opt.value);
        if (String(val) === String(opt.value)) {
          option.selected = true;
        }
        select.appendChild(option);
      }
      row.appendChild(select);
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = field.key;
      input.className = 'select-input';
      input.value = val !== undefined && val !== null ? String(val) : '';
      row.appendChild(input);
    }
    form.appendChild(row);
  }

  body.appendChild(form);

  const footer = document.createElement('div');
  footer.className = 'plugin-settings-actions modal-footer';
  const btnCancel = document.createElement('button');
  btnCancel.type = 'button';
  btnCancel.className = 'btn-secondary';
  btnCancel.id = 'plugin-settings-cancel';
  btnCancel.textContent = t.cancel || 'Cancel';
  const btnSave = document.createElement('button');
  btnSave.type = 'button';
  btnSave.className = 'btn-primary';
  btnSave.id = 'plugin-settings-save';
  btnSave.textContent = t.save || 'Save';
  footer.appendChild(btnCancel);
  footer.appendChild(btnSave);

  sheet.appendChild(header);
  sheet.appendChild(body);
  sheet.appendChild(footer);
  wrap.appendChild(sheet);
  document.body.appendChild(wrap);
  installFocusTrap(wrap);

  const close = () => {
    releaseFocusTrap();
    wrap.remove();
  };
  wrap.addEventListener('click', (e) => {
    if (e.target === wrap) {
      close();
    }
  });
  header.querySelector('.modal-close')?.addEventListener('click', close);
  btnCancel.addEventListener('click', close);
  btnSave.addEventListener('click', async () => {
    const next = { ...current };
    fields.forEach((field) => {
      if (field.type === 'journal' || field.type === 'favorites') {
        return;
      }
      const el = form.querySelector(`[name="${field.key}"]`);
      if (!el) {
        return;
      }
      if (field.type === 'boolean') {
        next[field.key] = el.checked;
      } else {
        next[field.key] = el.value;
      }
    });
    const merged = { ...current, ...next };
    await storage.set(prefix + 'settings', merged);
    close();
    showNotification('', t.pluginSettingsSaved || 'Plugin settings saved');
    const payload = { ...settings, pluginId, pluginSettings: merged };
    const hookFired = pluginManager.invokePluginHook(pluginId, 'onSettingsChange', [payload]);
    if (!hookFired && pluginData.sandbox) {
      try {
        await pluginData.sandbox.runLifecycle('onDisable');
        await pluginData.sandbox.runLifecycle('onEnable');
      } catch {
        void 0;
      }
    }
  });
};

function getOrCreatePluginsRail(headerActions) {
  let rail = headerActions.querySelector('.header-plugins-rail');
  if (!rail) {
    rail = document.createElement('div');
    rail.className = 'header-plugins-rail';
    rail.setAttribute('aria-label', 'Plugin shortcuts');
    const addBtn = document.getElementById('open-add-modal');
    headerActions.insertBefore(rail, addBtn);
  }
  return rail;
}

export function renderPluginHeaderItems() {
  if (!settings.pluginsEnabled) {
    return;
  }

  const headerActions = document.querySelector('.header-actions');
  if (!headerActions) {
    return;
  }

  const pluginsRail = getOrCreatePluginsRail(headerActions);
  pluginsRail.querySelectorAll('.header-plugin-item').forEach((el) => el.remove());

  const installedPlugins = pluginManager.getInstalledPlugins();

  installedPlugins.forEach((plugin) => {
    const pluginData = pluginManager.plugins.get(plugin.id);

    if (pluginData?.headerItem) {
      const item = document.createElement('div');
      item.className = 'header-plugin-item';
      item.dataset.pluginId = plugin.id;
      const iconSpan = document.createElement('span');
      iconSpan.className = 'header-plugin-icon';
      iconSpan.textContent = '';
      iconSpan.classList.add('header-plugin-icon--empty');
      const labelSpan = document.createElement('span');
      labelSpan.className = 'header-plugin-label';
      labelSpan.textContent = pluginData.headerItem.label || '';
      labelSpan.style.color = pluginData.headerItem.labelColor || '';
      const pend = pluginData._pendingHeaderUi;
      if (pend) {
        if (pend.label !== null && pend.label !== undefined) {
          labelSpan.textContent = pend.label;
        }
        if (pend.labelColor !== null && pend.labelColor !== undefined) {
          labelSpan.style.color = pend.labelColor || '';
        }
        delete pluginData._pendingHeaderUi;
      }
      item.appendChild(iconSpan);
      item.appendChild(labelSpan);
      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'header-plugin-badge';
      badgeSpan.setAttribute('aria-hidden', 'true');
      item.appendChild(badgeSpan);

      item.onclick = () => {
        const hi = pluginData.headerItem;
        if (hi.onClick) {
          hi.onClick();
        } else {
          console.warn('[Click] No handler found for', plugin.id);
        }
      };

      pluginsRail.appendChild(item);
    }
  });

  pluginsRail.hidden = pluginsRail.childElementCount === 0;
}

window.renderPluginHeaderItems = renderPluginHeaderItems;
window.pluginManager = pluginManager;
