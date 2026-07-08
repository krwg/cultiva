import { TRANSLATIONS } from '../core/i18n.js';
import { getPluginCatalogStrings } from '../core/plugin-i18n.js';
import { pluginManager } from '../core/plugin-manager.js';
import { storage } from '../modules/storage.js';
import { settings } from './renderer-bootstrap.js';
import { saveSettings } from './settings-controller.js';
import { showNotification } from './ui-shell.js';
import { showConfirmDialog } from './dialogs.js';

function tStrings() {
  return TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
}

export async function renderPluginsSection() {
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

  await loadInstalledPlugins();
  await loadAvailablePlugins();
}

function localizedPluginMeta(pluginId, fallbackName, fallbackDesc) {
  const localized = getPluginCatalogStrings(pluginId, settings.lang);
  return {
    name: localized?.name || fallbackName || '',
    description: localized?.description || fallbackDesc || ''
  };
}

function createPluginCardMain(p, pluginData, t, { showSettings = false } = {}) {
  const meta = localizedPluginMeta(p.id, p.name, p.description);
  const main = document.createElement('div');
  main.className = 'plugin-card-main';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'plugin-icon';
  iconWrap.textContent = '';

  const info = document.createElement('div');
  info.className = 'plugin-info';

  const nameEl = document.createElement('div');
  nameEl.className = 'plugin-name';
  nameEl.textContent = meta.name;

  const descEl = document.createElement('div');
  descEl.className = 'plugin-description';
  const baseDesc = meta.description;
  const failReason = showSettings ? pluginManager.getPluginFailure(p.id) : null;
  descEl.textContent = showSettings && !p.loaded
    ? `${baseDesc ? `${baseDesc} — ` : ''}${failReason || t.pluginNotLoadedHint || 'Not loaded.'}`
    : baseDesc;

  const versionRow = document.createElement('div');
  versionRow.className = 'plugin-meta';
  const ver = document.createElement('span');
  ver.className = 'plugin-version';
  ver.textContent = p.version ? `v${p.version}` : '';
  versionRow.appendChild(ver);

  info.appendChild(nameEl);
  info.appendChild(descEl);
  info.appendChild(versionRow);

  const actions = document.createElement('div');
  actions.className = 'plugin-actions';

  if (showSettings) {
    const fields = Array.isArray(pluginData?.manifest?.settings) ? pluginData.manifest.settings : [];
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
      await pluginManager.loadPlugin(p.id);
      await renderPluginsSection();
      renderPluginHeaderItems();
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

  main.appendChild(iconWrap);
  main.appendChild(info);
  main.appendChild(actions);
  return main;
}

async function loadInstalledPlugins() {
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
    card.appendChild(createPluginCardMain(p, pluginData, t, { showSettings: true }));
    container.appendChild(card);
  }
}

async function loadAvailablePlugins() {
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

    container.replaceChildren();

    if (plugins.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'plugins-empty';
      empty.dataset.i18n = 'noPluginsAvailable';
      empty.textContent = t.noPluginsAvailable;
      container.appendChild(empty);
      return;
    }

    for (const p of plugins) {
      const card = document.createElement('div');
      card.className = 'plugin-card';

      const meta = localizedPluginMeta(p.id, p.name, p.description);
      const stub = { id: p.id, name: meta.name, description: meta.description, version: p.version, loaded: true, enabled: true };
      const main = createPluginCardMain(stub, null, t, { showSettings: false });

      const actions = main.querySelector('.plugin-actions');
      actions.replaceChildren();
      const btnInstall = document.createElement('button');
      btnInstall.type = 'button';
      const pid = p.id;
      const canInstall = Boolean(typeof window !== 'undefined' && window.electron?.installPlugin);
      if (p.installed) {
        btnInstall.className = 'plugin-btn plugin-btn-installed';
        btnInstall.disabled = true;
        btnInstall.textContent = t.pluginInstalledButton || 'Installed';
      } else if (!canInstall) {
        btnInstall.className = 'plugin-btn plugin-btn-installed';
        btnInstall.disabled = true;
        btnInstall.textContent = t.install;
        btnInstall.title = t.pluginInstallDesktopOnly || '';
      } else {
        btnInstall.className = 'plugin-btn plugin-btn-install';
        btnInstall.textContent = t.install;
        btnInstall.addEventListener('click', () => window.installPlugin(pid));
      }
      actions.appendChild(btnInstall);

      const author = document.createElement('span');
      author.className = 'plugin-author';
      author.textContent = p.author !== null && p.author !== undefined ? String(p.author) : '';
      main.querySelector('.plugin-meta')?.appendChild(author);

      card.appendChild(main);
      container.appendChild(card);
    }
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

window.installPlugin = async (pluginId) => {
  try {
    showNotification('', 'Installing plugin...');
    await pluginManager.installPlugin(pluginId);
    showNotification('', 'Plugin installed successfully!');
    await renderPluginsSection();
    renderPluginHeaderItems();
  } catch (e) {
    showNotification('', `Failed to install plugin: ${e.message}`);
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
  const localized = localizedPluginMeta(pluginId, pluginData.manifest.name, pluginData.manifest.description);
  const wrap = document.createElement('div');
  wrap.className = 'plugin-settings-modal';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');

  const sheet = document.createElement('div');
  sheet.className = 'plugin-settings-sheet modal-sheet';

  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `<h2>${localized.name}</h2><button type="button" class="modal-close" aria-label="${t.cancel || 'Close'}">&times;</button>`;

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
    label.textContent = field.label || field.key;
    row.appendChild(label);

    const val = current[field.key] !== undefined ? current[field.key] : field.default;
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
        option.textContent = opt.label || opt.value;
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

  const close = () => wrap.remove();
  wrap.addEventListener('click', (e) => {
    if (e.target === wrap) {
      close();
    }
  });
  header.querySelector('.modal-close')?.addEventListener('click', close);
  btnCancel.addEventListener('click', close);
  btnSave.addEventListener('click', async () => {
    const next = {};
    fields.forEach((field) => {
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
    await storage.set(prefix + 'settings', next);
    close();
    showNotification('', t.pluginSettingsSaved || 'Plugin settings saved');
    if (pluginData.sandbox) {
      try {
        await pluginData.sandbox.runLifecycle('onDisable');
        await pluginData.sandbox.runLifecycle('onEnable');
      } catch {
        void 0;
      }
    }
  });
};

export function renderPluginHeaderItems() {
  if (!settings.pluginsEnabled) {
    return;
  }

  const headerActions = document.querySelector('.header-actions');
  if (!headerActions) {
    return;
  }

  document.querySelectorAll('.header-plugin-item').forEach((el) => el.remove());

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

      item.onclick = () => {
        const hi = pluginData.headerItem;

        if (hi.instance && hi.modalMethod && typeof hi.instance[hi.modalMethod] === 'function') {
          hi.instance[hi.modalMethod]();
        } else if (hi.onClick) {
          hi.onClick();
        } else {
          console.warn('[Click] No method found for', plugin.id);
        }
      };

      const addBtn = document.getElementById('open-add-modal');
      headerActions.insertBefore(item, addBtn);
    }
  });
}

window.renderPluginHeaderItems = renderPluginHeaderItems;
window.pluginManager = pluginManager;
