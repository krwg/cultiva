import { storage } from '../modules/storage.js';
import { habits } from '../modules/habits.js';
import { BRANDING } from './branding.js';
import { PluginSandboxHost } from './plugin-sandbox-host.js';
import { settings } from '../app/renderer-bootstrap.js';
import { buildPluginInstallFileList, assertRegistrySha256ForFiles } from './plugin-registry-integrity.js';
import { invokePluginRpc } from './plugin-api.js';
import { readThemeCssColor } from './shell-chrome.js';

const REGISTRY_URL = 'https://raw.githubusercontent.com/krwg/cultiva-plugins/main/registry.json';

function stripUtf8Bom(s) {
  return String(s ?? '').replace(/^\uFEFF/, '');
}

function parseVersionParts(version) {
  return String(version ?? '')
    .split('.')
    .map((part) => parseInt(part, 10) || 0);
}

export function isNewerPluginVersion(registryVersion, installedVersion) {
  const a = parseVersionParts(registryVersion);
  const b = parseVersionParts(installedVersion);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff !== 0) {
      return diff > 0;
    }
  }
  return false;
}

async function fetchPluginHttpText(url) {
  const w = typeof window !== 'undefined' ? window : null;
  let text = '';
  let ipcError = null;

  if (w?.electron?.pluginHttpGet) {
    try {
      const r = await w.electron.pluginHttpGet(url);
      if (r && r.ok && typeof r.body === 'string') {
        text = stripUtf8Bom(r.body);
      } else {
        ipcError = new Error(r?.error || 'pluginHttpGet failed');
      }
    } catch (e) {
      ipcError = e;
    }
  }

  if (!text) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      text = stripUtf8Bom(await res.text());
    } catch (e) {
      throw ipcError || e;
    }
  }

  return text.trimStart();
}

async function getInstalledPluginIdsNormalized() {
  let raw = await storage.get('cultiva-installed-plugins');
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = null;
    }
  }
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((x) => String(x).trim()).filter(Boolean);
}

async function getDisabledPluginIdsNormalized() {
  let raw = await storage.get(DISABLED_PLUGINS_KEY);
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = null;
    }
  }
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((x) => String(x).trim()).filter(Boolean);
}

const plugins = new Map();
const failedPlugins = new Map();
const DISABLED_PLUGINS_KEY = 'cultiva-disabled-plugins';

let _lastPluginLoadFailure = null;
function notePluginLoadFailure(message) {
  _lastPluginLoadFailure = message ? String(message) : null;
}
function takePluginLoadFailure() {
  const m = _lastPluginLoadFailure;
  _lastPluginLoadFailure = null;
  return m;
}

function invokePluginInstanceMethod(pluginId, method, args = []) {
  const plugin = plugins.get(pluginId);
  if (!plugin?.sandbox) {
    return false;
  }
  if (plugin.instance && typeof plugin.instance[method] === 'function') {
    plugin.instance[method](...args);
    return true;
  }
  plugin.sandbox.invokeInstanceMethod(method, args);
  return true;
}

function resolveGardenAction(el) {
  if (!el) {
    return null;
  }
  return el.getAttribute('data-plugin-act') || el.getAttribute('data-quote-act');
}

const pluginHooks = {
  onHabitComplete: [],
  onAppStart: [],
  onSettingsChange: [],
  onCalendarMount: []
};

let _initPromise = null;
let _isInitialized = false;

function _syncHookList(hookName, pluginId) {
  const list = pluginHooks[hookName];
  if (!list) {
    return;
  }
  if (list.includes(pluginId)) {
    return;
  }
  list.push(pluginId);
}

function _escapeSelectorSegment(id) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(id);
  }
  return String(id).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function _closePluginMainSheet(pluginId) {
  document.querySelectorAll('[data-cultiva-plugin-sheet]').forEach((el) => {
    if (el.getAttribute('data-cultiva-plugin-sheet') !== pluginId) {
      return;
    }
    const kh = el._cultivaSheetKeyHandler;
    if (typeof kh === 'function') {
      document.removeEventListener('keydown', kh);
    }
    el.remove();
  });
}

function _collectSheetFocusState(pluginId) {
  const wrap = document.querySelector(`[data-cultiva-plugin-sheet="${_escapeSelectorSegment(pluginId)}"]`);
  if (!wrap) {
    return null;
  }
  const active = wrap.contains(document.activeElement) ? document.activeElement : null;
  if (!active) {
    return null;
  }
  const key = active.getAttribute('name') || active.id || null;
  if (!key) {
    return null;
  }
  return {
    key,
    byName: Boolean(active.getAttribute('name')),
    selectionStart: typeof active.selectionStart === 'number' ? active.selectionStart : null,
    selectionEnd: typeof active.selectionEnd === 'number' ? active.selectionEnd : null
  };
}

function _restoreSheetFocusState(wrap, state) {
  if (!wrap || !state) {
    return;
  }
  let target = null;
  if (state.byName) {
    target = wrap.querySelector(`[name="${_escapeSelectorSegment(state.key)}"]`);
  }
  if (!target) {
    target = wrap.querySelector(`#${_escapeSelectorSegment(state.key)}`);
  }
  if (!target || typeof target.focus !== 'function') {
    return;
  }
  target.focus();
  if (state.selectionStart !== null && state.selectionEnd !== null && typeof target.setSelectionRange === 'function') {
    target.setSelectionRange(state.selectionStart, state.selectionEnd);
  }
}

function _readCultivaPayloadFromEl(t) {
  const raw = t.getAttribute('data-cultiva-payload');
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function _readDatasetGeoPayload(t) {
  const p = {};
  if (t.dataset.lat !== undefined && t.dataset.lat !== '') {
    p.lat = parseFloat(t.dataset.lat);
  }
  if (t.dataset.lon !== undefined && t.dataset.lon !== '') {
    p.lon = parseFloat(t.dataset.lon);
  }
  if (t.dataset.city !== undefined) {
    p.city = t.dataset.city;
  }
  return p;
}

function _insertGardenWidget(container, node, position) {
  if (!container || !node) {
    return;
  }
  if (position === 'top') {
    container.prepend(node);
    return;
  }
  container.appendChild(node);
}

function _patchPluginMainSheet(pluginId, selector, html) {
  const wrap = document.querySelector(`[data-cultiva-plugin-sheet="${_escapeSelectorSegment(pluginId)}"]`);
  if (!wrap) {
    return false;
  }
  const el = wrap.querySelector(selector);
  if (!el) {
    return false;
  }
  el.innerHTML = String(html || '');
  return true;
}

function _mountPluginMainSheet(pluginId, html) {
  const previousFocus = _collectSheetFocusState(pluginId);
  _closePluginMainSheet(pluginId);
  const wrap = document.createElement('div');
  wrap.setAttribute('data-cultiva-plugin-sheet', pluginId);
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.className = 'cultiva-plugin-sheet-root';
  wrap.innerHTML = String(html || '');
  document.body.appendChild(wrap);
  _restoreSheetFocusState(wrap, previousFocus);

  const sandbox = plugins.get(pluginId)?.sandbox;
  if (!sandbox) {
    return;
  }

  const forward = (action, payload) => {
    sandbox.postToSandbox({
      type: 'MODAL_ACTION',
      action,
      payload: payload === undefined ? null : payload
    });
  };

  wrap.addEventListener('click', (e) => {
    const closeHit = e.target.closest('[data-cultiva-act="close"]');
    if (closeHit) {
      _closePluginMainSheet(pluginId);
      return;
    }
    const t = e.target.closest('[data-cultiva-act]');
    if (!t) {
      return;
    }
    const act = t.getAttribute('data-cultiva-act');
    if (act === 'close') {
      _closePluginMainSheet(pluginId);
      return;
    }
    let payload = { ..._readDatasetGeoPayload(t), ...(_readCultivaPayloadFromEl(t) || {}) };
    if (t.dataset.tz) {
      payload.tz = t.dataset.tz;
    }
    if (t.dataset.station) {
      payload.stationId = t.dataset.station;
    }
    if (t.dataset.format) {
      payload.format = t.dataset.format;
    }
    if (t.dataset.minutes !== undefined && t.dataset.minutes !== '') {
      const m = parseInt(t.dataset.minutes, 10);
      if (!Number.isNaN(m)) {
        payload.minutes = m;
      }
    }
    if (t.getAttribute('data-cultiva-collect') === '1') {
      const root = t.closest('.cultiva-sheet-card') || wrap;
      const formPayload = {};
      root.querySelectorAll('[name]').forEach((el) => {
        if (!el.name) {
          return;
        }
        if (el.type === 'checkbox') {
          formPayload[el.name] = el.checked;
        } else if (el.type === 'radio') {
          if (el.checked) {
            formPayload[el.name] = el.value;
          }
        } else {
          formPayload[el.name] = el.value;
        }
      });
      payload = { ...formPayload, ...payload };
    }
    forward(act, payload);
  });

  wrap.addEventListener('change', (e) => {
    const t = e.target.closest('[data-cultiva-change-act]');
    if (!t) {
      return;
    }
    const act = t.getAttribute('data-cultiva-change-act');
    const payload = { ..._readDatasetGeoPayload(t), value: t.value };
    forward(act, payload);
  });

  wrap.addEventListener('input', (e) => {
    const t = e.target.closest('[data-cultiva-input-act]');
    if (!t) {
      return;
    }
    const act = t.getAttribute('data-cultiva-input-act');
    forward('input:' + act, { value: t.value });
  });

  const onKey = (e) => {
    if (e.key === 'Escape') {
      _closePluginMainSheet(pluginId);
      document.removeEventListener('keydown', onKey);
    }
  };
  wrap._cultivaSheetKeyHandler = onKey;
  document.addEventListener('keydown', onKey);
}

function _purgeOrphanPluginSandboxes() {
  document.querySelectorAll('iframe[title^="plugin-sandbox-"]').forEach((el) => el.remove());
}

function _wireSandboxHost(host, pluginId, manifest) {
  host.setHandler('onRpc', async (method, args) => {
    const prefix = `plugin_${manifest.id}_`;
    return invokePluginRpc(method, args, manifest, {
      storage,
      storagePrefix: prefix,
      settings,
      readThemeCssColor,
      readHabitsForAnalytics: () => habits.getAll(),
      completeHabit: async (habitId) => {
        const { toggleHabitWithHooks } = await import('../app/habit-actions.js');
        const result = await toggleHabitWithHooks(habitId);
        if (typeof window.renderGarden === 'function') {
          window.renderGarden();
        }
        if (typeof window.syncTrayHabits === 'function') {
          window.syncTrayHabits();
        }
        return result;
      },
      readPluginDataFile: async (relPath) => {
        const rel = String(relPath || '').replace(/^[/\\]+/, '');
        const allowed = Array.isArray(manifest.data)
          ? manifest.data.map((d) => String(d).replace(/^[/\\]+/, ''))
          : [];
        if (!allowed.includes(rel)) {
          throw new Error(`Data file not allowed: ${rel}`);
        }
        const raw = await window.electron.readPluginFile(`${pluginId}/${rel}`);
        if (raw === null || raw === undefined || raw === '') {
          throw new Error(`Data file missing: ${rel}`);
        }
        const text = stripUtf8Bom(raw).trim();
        if (rel.endsWith('.json')) {
          return JSON.parse(text);
        }
        return text;
      }
    });
  });

  host.setHandler('onHookRegister', (hookName) => {
    if (pluginHooks[hookName]) {
      _syncHookList(hookName, pluginId);
    }
  });

  host.setHandler('onUiRegisterHeader', (data) => {
    pluginManager._registerHeaderFromSandbox(pluginId, data);
  });

  host.setHandler('onGardenRegister', (data) => {
    const plugin = plugins.get(pluginId);
    if (!plugin) {
      return;
    }
    plugin.gardenWidget = {
      id: `${pluginId}-garden-widget`,
      position: data.position || 'top',
      render() {}
    };
  });

  host.setHandler('onGardenHtml', (data) => {
    const container = document.getElementById('garden-container');
    if (!container) {
      return;
    }
    const oldWidget = document.getElementById(`${pluginId}-garden-widget`);
    if (oldWidget) {
      oldWidget.remove();
    }
    const wrap = document.createElement('div');
    wrap.id = `${pluginId}-garden-widget`;
    wrap.className = 'garden-plugin-widget';
    wrap.innerHTML = data.html;
    const plugin = plugins.get(pluginId);
    const position = plugin?.gardenWidget?.position || 'top';
    _insertGardenWidget(container, wrap, position);
    wrap.addEventListener('click', (e) => {
      const actEl = e.target.closest('[data-plugin-act], [data-quote-act]');
      if (actEl) {
        e.stopPropagation();
        const act = resolveGardenAction(actEl);
        if (act) {
          invokePluginInstanceMethod(pluginId, act);
        }
        return;
      }
      const method = typeof data.gardenClickMethod === 'string' ? data.gardenClickMethod : null;
      if (method) {
        invokePluginInstanceMethod(pluginId, method);
      }
    });
  });

  host.setHandler('onCalendarRegister', (data) => {
    const plugin = plugins.get(pluginId);
    if (!plugin) {
      return;
    }
    plugin.calendarWidget = {
      id: `${pluginId}-calendar-widget`,
      position: data.position || 'top'
    };
  });

  host.setHandler('onCalendarHtml', (data) => {
    const container = document.getElementById('calendar-plugin-rail');
    if (!container) {
      return;
    }
    const oldWidget = document.getElementById(`${pluginId}-calendar-widget`);
    if (oldWidget) {
      oldWidget.remove();
    }
    const wrap = document.createElement('div');
    wrap.id = `${pluginId}-calendar-widget`;
    wrap.className = 'calendar-plugin-widget';
    wrap.innerHTML = data.html;
    container.prepend(wrap);
  });

  host.setHandler('onUiMainSheet', (data) => {
    _mountPluginMainSheet(pluginId, data.html);
  });

  host.setHandler('onUiPatchMainSheet', (data) => {
    _patchPluginMainSheet(pluginId, data.selector, data.html);
  });

  host.setHandler('onUiCloseMainSheet', () => {
    _closePluginMainSheet(pluginId);
  });

  host.setHandler('onUiUpdateHeader', (data) => {
    const plugin = plugins.get(pluginId);
    if (plugin?.headerItem) {
      if (data.label !== null && data.label !== undefined) {
        plugin.headerItem.label = data.label;
      }
      if (data.icon !== null && data.icon !== undefined) {
        plugin.headerItem.icon = data.icon;
      }
      if (data.labelColor !== null && data.labelColor !== undefined) {
        plugin.headerItem.labelColor = data.labelColor;
      }
    }
    const el = document.querySelector(
      `.header-plugin-item[data-plugin-id="${_escapeSelectorSegment(pluginId)}"]`
    );
    if (!el) {
      if (plugin) {
        const prev = plugin._pendingHeaderUi || {};
        plugin._pendingHeaderUi = { ...prev };
        if (data.label !== null && data.label !== undefined) {
          plugin._pendingHeaderUi.label = data.label;
        }
        if (data.icon !== null && data.icon !== undefined) {
          plugin._pendingHeaderUi.icon = data.icon;
        }
        if (data.labelColor !== null && data.labelColor !== undefined) {
          plugin._pendingHeaderUi.labelColor = data.labelColor;
        }
      }
      return;
    }
    const iconEl = el.querySelector('.header-plugin-icon');
    const labelEl = el.querySelector('.header-plugin-label');
    if (iconEl && data.icon !== null && data.icon !== undefined) {
      iconEl.textContent = data.icon;
    }
    if (labelEl && data.label !== null && data.label !== undefined) {
      labelEl.textContent = data.label;
    }
    if (labelEl && Object.prototype.hasOwnProperty.call(data, 'labelColor')) {
      if (data.labelColor === null || data.labelColor === '') {
        labelEl.style.color = '';
        if (plugin?.headerItem) {
          plugin.headerItem.labelColor = null;
        }
      } else {
        labelEl.style.color = data.labelColor;
        if (plugin?.headerItem) {
          plugin.headerItem.labelColor = data.labelColor;
        }
      }
    }
  });
}

export const pluginManager = {
  _removePluginRuntimeSurfaces(pluginId) {
    _closePluginMainSheet(pluginId);
    document.querySelector(`.header-plugin-item[data-plugin-id="${_escapeSelectorSegment(pluginId)}"]`)?.remove();
    document.getElementById(`${pluginId}-garden-widget`)?.remove();
    this._removePluginStyles(pluginId);
  },

  async _disableLoadedPlugin(pluginId) {
    const plugin = plugins.get(pluginId);
    if (!plugin) {
      return;
    }
    if (plugin.sandbox) {
      try {
        plugin.sandbox.runLifecycle('onDisable');
      } catch (e) {
        console.warn('[PluginManager] onDisable:', e);
      }
      await new Promise((r) => setTimeout(r, 50));
      plugin.sandbox.destroy();
    }
    this._removePluginRuntimeSurfaces(pluginId);
    plugin.enabled = false;
    plugin.sandbox = null;
    plugin.instance = null;
    plugin.headerItem = null;
    plugin.gardenWidget = null;
    plugins.delete(pluginId);
    for (const list of Object.values(pluginHooks)) {
      const idx = list.indexOf(pluginId);
      if (idx !== -1) {
        list.splice(idx, 1);
      }
    }
  },

  async init() {
    if (_isInitialized) {
      console.log('[PluginManager] Already initialized');
      return _initPromise;
    }

    if (_initPromise) {
      console.log('[PluginManager] Init in progress, waiting...');
      return _initPromise;
    }

    _initPromise = this._doInit();
    return _initPromise;
  },

  async _doInit() {
    console.log('[PluginManager] Initializing...');

    await storage.init();

    const installedIds = await getInstalledPluginIdsNormalized();
    const disabledIds = await getDisabledPluginIdsNormalized();
    const disabledSet = new Set(disabledIds);
    console.log('[PluginManager] Installed plugins:', installedIds);

    failedPlugins.clear();
    const failedIds = [];
    for (const pluginId of installedIds) {
      if (disabledSet.has(pluginId)) {
        continue;
      }
      console.log('[PluginManager] Loading plugin:', pluginId);
      const success = await this.loadPlugin(pluginId);
      console.log('[PluginManager] Load result for', pluginId, ':', success);
      if (!success) {
        failedIds.push(pluginId);
        failedPlugins.set(pluginId, takePluginLoadFailure() || 'Unknown load error');
      }
    }

    if (failedIds.length) {
      if (typeof window.showNotification === 'function') {
        const lead = failedIds.length === 1
          ? `Plugin failed to load: ${failedIds[0]}`
          : `Plugins failed to load: ${failedIds.join(', ')}`;
        window.showNotification('', lead);
      }
      console.warn('[PluginManager] Plugin load failures:', failedIds);
    }

    await this.triggerHook('onAppStart');

    _isInitialized = true;
    console.log('[PluginManager] Initialized with', plugins.size, 'plugins');
  },

  async _injectPluginStyles(pluginId, manifest) {
    if (!manifest || !Array.isArray(manifest.styles) || !window.electron?.readPluginFile) {
      return;
    }
    const chunks = [];
    for (const rel of manifest.styles) {
      if (typeof rel !== 'string' || !rel.trim()) {
        continue;
      }
      const name = rel.replace(/^[/\\]+/, '');
      const css = await window.electron.readPluginFile(`${pluginId}/${name}`);
      if (css) {
        chunks.push(css);
      }
    }
    if (!chunks.length) {
      return;
    }
    const id = `cultiva-plugin-style-${pluginId}`;
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = chunks.join('\n');
  },

  _removePluginStyles(pluginId) {
    document.getElementById(`cultiva-plugin-style-${pluginId}`)?.remove();
  },

  async loadPlugin(pluginId) {
    notePluginLoadFailure(null);
    try {
      console.log('[PluginManager] Loading plugin from disk:', pluginId);

      if (!window.electron?.readPluginFile) {
        console.warn('[PluginManager] Plugin files API unavailable (not running in Electron?)');
        notePluginLoadFailure('readPluginFile API missing');
        return false;
      }

      const manifestJson = await window.electron.readPluginFile(`${pluginId}/manifest.json`);

      if (!manifestJson) {
        console.warn('[PluginManager] Plugin manifest not found:', pluginId);
        notePluginLoadFailure('manifest.json missing on disk');
        return false;
      }

      const manifest = JSON.parse(stripUtf8Bom(manifestJson).trim());
      console.log('[PluginManager] Manifest loaded:', manifest.name, 'v' + manifest.version);

      if (manifest.minAppVersion) {
        const appVersion = BRANDING.VERSION;
        if (!this.checkVersion(appVersion, manifest.minAppVersion)) {
          console.warn('[PluginManager] Plugin requires newer app version:', manifest.minAppVersion);
          notePluginLoadFailure(`app ${appVersion} < required ${manifest.minAppVersion}`);
          return false;
        }
      }

      const entryRel =
        typeof manifest.entry === 'string' && manifest.entry.trim()
          ? manifest.entry.trim().replace(/^[/\\]+/, '')
          : 'index.js';
      manifest.entry = entryRel;

      const pluginCode = await window.electron.readPluginFile(`${pluginId}/${entryRel}`);

      if (!pluginCode) {
        console.warn('[PluginManager] Plugin code not found:', entryRel);
        notePluginLoadFailure(`entry file missing: ${entryRel}`);
        return false;
      }

      const sandboxHost = new PluginSandboxHost(pluginId, manifest);
      _wireSandboxHost(sandboxHost, pluginId, manifest);

      plugins.set(pluginId, {
        id: pluginId,
        manifest,
        sandbox: sandboxHost,
        instance: null,
        enabled: true,
        headerItem: null,
        gardenWidget: null
      });

      let loadResult;
      try {
        loadResult = await sandboxHost.load(pluginCode);
      } catch (e) {
        console.error('[PluginManager] Sandbox failed:', pluginId, e);
        sandboxHost.destroy();
        plugins.delete(pluginId);
        notePluginLoadFailure(e && e.message ? e.message : String(e));
        return false;
      }

      const instanceProxy = loadResult.instanceProxy;

      const existing = plugins.get(pluginId);
      plugins.set(pluginId, {
        ...existing,
        id: pluginId,
        manifest,
        sandbox: sandboxHost,
        instance: instanceProxy,
        enabled: true
      });

      const pluginAfterLoad = plugins.get(pluginId);
      if (pluginAfterLoad?.headerItem) {
        pluginAfterLoad.headerItem.instance = instanceProxy;
      }

      try {
        await this._injectPluginStyles(pluginId, manifest);
      } catch (err) {
        console.warn('[PluginManager] Style inject failed:', pluginId, err);
      }

      await new Promise((resolve) => setTimeout(resolve, 50));

      const plugin = plugins.get(pluginId);

      if (plugin?.gardenWidget && plugin.sandbox) {
        setTimeout(() => {
          const container = document.getElementById('garden-container');
          if (container) {
            plugin.sandbox.runGardenRender();
          }
        }, 200);
      }

      console.log('[PluginManager] Loaded plugin:', manifest.name, 'v' + manifest.version);

      if (typeof window.renderPluginHeaderItems === 'function') {
        setTimeout(() => window.renderPluginHeaderItems(), 100);
      }

      return true;
    } catch (e) {
      console.error('[PluginManager] Failed to load plugin:', pluginId, e);
      notePluginLoadFailure(e && e.message ? e.message : String(e));
      return false;
    }
  },

  get plugins() {
    return plugins;
  },

  _registerHeaderFromSandbox(pluginId, data) {
    const plugin = plugins.get(pluginId);
    if (!plugin) {
      return;
    }

    const instance = plugin.instance;

    plugin.headerItem = {
      id: `${pluginId}-header`,
      label: typeof data.label === 'string' ? data.label : plugin.manifest.name,
      icon: typeof data.icon === 'string' ? data.icon : (plugin.manifest.icon || ''),
      labelColor: undefined,
      instance,
      onClick: data.hasOnClick ? () => plugin.sandbox.invokeHeaderOnClick() : null
    };

    if (typeof window.renderPluginHeaderItems === 'function') {
      setTimeout(() => window.renderPluginHeaderItems(), 50);
    }
  },

  registerHeaderItem(pluginId, config) {
    this._registerHeaderFromSandbox(pluginId, {
      label: config?.label,
      icon: config?.icon,
      hasOnClick: typeof config?.onClick === 'function'
    });
  },

  async initCalendarPage() {
    await this.init();
    await this.triggerHook('onCalendarMount');
  },

  registerGardenWidget(pluginId, config) {
    const plugin = plugins.get(pluginId);
    if (!plugin) {
      return;
    }

    plugin.gardenWidget = {
      id: `${pluginId}-garden-widget`,
      render: config.render,
      position: config.position || 'top'
    };

    if (config.render && typeof config.render === 'function') {
      const container = document.getElementById('garden-container');
      if (container) {
        const relay = {
          innerHTML: '',
          appendChild(node) {
            const wrap = document.createElement('div');
            wrap.id = `${pluginId}-garden-widget`;
            wrap.className = 'garden-plugin-widget';
            if (node && typeof node.outerHTML === 'string') {
              wrap.innerHTML = node.outerHTML;
            }
            _insertGardenWidget(container, wrap, plugin.gardenWidget.position);
          }
        };
        config.render(relay);
        if (typeof relay.innerHTML === 'string' && relay.innerHTML.trim()) {
          const wrap = document.createElement('div');
          wrap.id = `${pluginId}-garden-widget`;
          wrap.className = 'garden-plugin-widget';
          wrap.innerHTML = relay.innerHTML;
          _insertGardenWidget(container, wrap, plugin.gardenWidget.position);
        }
      }
    }
  },

  registerCalendarWidget(pluginId, config) {
    const container = document.getElementById('calendar-plugin-rail');
    if (!container) {
      return;
    }
    const plugin = plugins.get(pluginId);
    if (plugin) {
      plugin.calendarWidget = {
        id: `${pluginId}-calendar-widget`,
        position: config?.position || 'top'
      };
    }
    const wrap = document.createElement('div');
    wrap.id = `${pluginId}-calendar-widget`;
    wrap.className = 'calendar-plugin-widget';
    wrap.innerHTML = config?.html || '';
    container.prepend(wrap);
  },

  refreshGardenWidgets() {
    for (const [pluginId, plugin] of plugins) {
      if (!plugin?.gardenWidget || plugin.enabled === false) {
        continue;
      }
      const existing = document.getElementById(`${pluginId}-garden-widget`);
      if (existing) {
        continue;
      }
      if (plugin.sandbox && typeof plugin.sandbox.runGardenRender === 'function') {
        plugin.sandbox.runGardenRender();
        continue;
      }
      if (typeof plugin.gardenWidget.render === 'function') {
        const container = document.getElementById('garden-container');
        if (container) {
          this.registerGardenWidget(pluginId, plugin.gardenWidget);
        }
      }
    }
  },

  async triggerHook(hookName, ...args) {
    const pluginIds = pluginHooks[hookName] || [];
    for (const pluginId of pluginIds) {
      const plugin = plugins.get(pluginId);
      if (plugin && plugin.enabled && plugin.sandbox && plugin.sandbox.hasHook(hookName)) {
        try {
          plugin.sandbox.invokeHook(hookName, args);
        } catch (e) {
          console.error('[PluginManager] Hook error:', pluginId, hookName, e);
        }
      }
    }
  },

  invokePluginHook(pluginId, hookName, args = []) {
    const plugin = plugins.get(pluginId);
    if (plugin && plugin.enabled && plugin.sandbox && plugin.sandbox.hasHook(hookName)) {
      try {
        plugin.sandbox.invokeHook(hookName, args);
        return true;
      } catch (e) {
        console.error('[PluginManager] Hook error:', pluginId, hookName, e);
      }
    }
    return false;
  },

  async installPlugin(pluginId) {
    console.log('[PluginManager] Installing plugin:', pluginId);

    if (!window.electron?.installPlugin) {
      throw new Error('Plugin install is only available in the desktop app');
    }

    const registryText = await fetchPluginHttpText(REGISTRY_URL);
    const registry = JSON.parse(stripUtf8Bom(registryText).trim());
    const pluginList = Array.isArray(registry.plugins) ? registry.plugins : [];

    const pluginInfo = pluginList.find((p) => p.id === pluginId);
    if (!pluginInfo) {
      throw new Error('Plugin not found in registry');
    }

    const sh = pluginInfo.sha256 && typeof pluginInfo.sha256 === 'object' ? pluginInfo.sha256 : {};
    const base = String(pluginInfo.baseUrl).replace(/\/$/, '');

    const manifestText = await fetchPluginHttpText(`${base}/manifest.json`);
    const manifest = JSON.parse(stripUtf8Bom(manifestText).trim());

    const files = buildPluginInstallFileList(manifest, base, sh);
    assertRegistrySha256ForFiles(files);

    const success = await window.electron.installPlugin(pluginId, files);
    if (!success) {
      return false;
    }

    const loadOk = await this.loadPlugin(pluginId);
    if (!loadOk) {
      const detail = takePluginLoadFailure();
      try {
        await window.electron.uninstallPlugin(pluginId);
      } catch (e) {
        console.warn('[PluginManager] Rollback uninstall failed:', e);
      }
      const detailSentence = detail ? ` (${detail})` : '';
      throw new Error(
        `Plugin files were saved but the plugin did not start.${detailSentence} ` +
        'Use the desktop app (Electron) for install, or check DevTools console for sandbox errors.'
      );
    }

    const installed = await getInstalledPluginIdsNormalized();
    if (!installed.includes(pluginId)) {
      installed.push(pluginId);
      await storage.set('cultiva-installed-plugins', installed);
      try {
        localStorage.setItem('cultiva-installed-plugins', JSON.stringify(installed));
      } catch {
        void 0;
      }
    }

    return true;
  },

  async uninstallPlugin(pluginId) {
    console.log('[PluginManager] Uninstalling plugin:', pluginId);

    await this._disableLoadedPlugin(pluginId);

    for (const list of Object.values(pluginHooks)) {
      const idx = list.indexOf(pluginId);
      if (idx !== -1) {
        list.splice(idx, 1);
      }
    }

    await window.electron.uninstallPlugin(pluginId);

    const installed = await getInstalledPluginIdsNormalized();
    const index = installed.indexOf(pluginId);
    if (index > -1) {
      installed.splice(index, 1);
      await storage.set('cultiva-installed-plugins', installed);
      localStorage.setItem('cultiva-installed-plugins', JSON.stringify(installed));
    }

    failedPlugins.delete(pluginId);

    if (typeof window.renderPluginHeaderItems === 'function') {
      window.renderPluginHeaderItems();
    }
  },

  async getAvailablePluginUpdates() {
    const list = await this.getAvailablePlugins();
    const installed = this.getInstalledPlugins();
    const updates = [];
    for (const reg of list) {
      if (!reg.installed) {
        continue;
      }
      const local = installed.find((p) => p.id === reg.id);
      if (local?.version && reg.version && isNewerPluginVersion(reg.version, local.version)) {
        updates.push({
          id: reg.id,
          name: reg.name || reg.id,
          installedVersion: local.version,
          registryVersion: reg.version
        });
      }
    }
    return updates;
  },

  async getAvailablePlugins() {
    try {
      const registryText = await fetchPluginHttpText(REGISTRY_URL);
      const registry = JSON.parse(stripUtf8Bom(registryText).trim());
      const list = (Array.isArray(registry.plugins) ? registry.plugins : []).filter(
        (p) => p && typeof p.id === 'string' && p.id.trim()
      );

      const installed = await getInstalledPluginIdsNormalized();

      return list.map((p) => ({
        ...p,
        installed: installed.includes(p.id)
      }));
    } catch (e) {
      console.error('[PluginManager] Failed to fetch registry:', e);
      throw e;
    }
  },

  getInstalledPlugins() {
    return Array.from(plugins.values()).map((p) => ({
      id: p.id,
      name: p.manifest.name,
      version: p.manifest.version,
      description: p.manifest.description,
      icon: p.manifest.icon,
      enabled: p.enabled,
      loaded: true
    }));
  },

  async getInstalledPluginsForUI() {
    const ids = await getInstalledPluginIdsNormalized();
    const disabled = new Set(await getDisabledPluginIdsNormalized());
    const rows = [];
    for (const id of ids) {
      const p = plugins.get(id);
      if (p) {
        rows.push({
          id: p.id,
          name: p.manifest.name,
          version: p.manifest.version,
          description: p.manifest.description,
          icon: p.manifest.icon,
          enabled: !disabled.has(id) && p.enabled,
          loaded: true
        });
        continue;
      }
      let name = id;
      let version = '';
      let description = '';
      let icon = '';
      if (window.electron?.readPluginFile) {
        try {
          const mj = await window.electron.readPluginFile(`${id}/manifest.json`);
          if (mj) {
            const m = JSON.parse(stripUtf8Bom(mj).trim());
            name = m.name || id;
            version = m.version || '';
            description = m.description || '';
            icon = m.icon || '';
          }
        } catch (e) {
          console.warn('[PluginManager] Could not read manifest for', id, e);
        }
      }
      rows.push({
        id,
        name,
        version,
        description,
        icon,
        enabled: !disabled.has(id),
        loaded: false
      });
    }
    return rows;
  },

  getPluginFailure(pluginId) {
    return failedPlugins.get(pluginId) || null;
  },

  async setPluginEnabled(pluginId, enabled) {
    const disabledSet = new Set(await getDisabledPluginIdsNormalized());
    if (!enabled) {
      disabledSet.add(pluginId);
      await this._disableLoadedPlugin(pluginId);
      _purgeOrphanPluginSandboxes();
    } else {
      disabledSet.delete(pluginId);
      if (!plugins.has(pluginId)) {
        await this.loadPlugin(pluginId);
      }
    }
    const next = Array.from(disabledSet);
    await storage.set(DISABLED_PLUGINS_KEY, next);
    try {
      localStorage.setItem(DISABLED_PLUGINS_KEY, JSON.stringify(next));
    } catch {
      void 0;
    }
    if (typeof window.renderPluginHeaderItems === 'function') {
      window.renderPluginHeaderItems();
    }
  },

  async disableAllPlugins() {
    const installed = await getInstalledPluginIdsNormalized();
    const loaded = Array.from(plugins.keys());
    const unique = [...new Set([...installed, ...loaded])];
    for (const id of unique) {
      await this._disableLoadedPlugin(id);
    }
    _purgeOrphanPluginSandboxes();
    Object.values(pluginHooks).forEach((list) => list.splice(0, list.length));
    _isInitialized = false;
    _initPromise = null;
  },

  checkVersion(current, required) {
    const strip = (v) => String(v || '').split(/[-+]/)[0];
    const currentParts = strip(current).split('.').map((x) => parseInt(x, 10) || 0);
    const requiredParts = strip(required).split('.').map((x) => parseInt(x, 10) || 0);

    for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
      const c = currentParts[i] || 0;
      const r = requiredParts[i] || 0;
      if (c < r) {
        return false;
      }
      if (c > r) {
        return true;
      }
    }
    return true;
  }
};
