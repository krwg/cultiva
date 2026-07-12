
import { isAllowedPluginRpcMethod } from './plugin-rpc.js';

function buildSandboxBootstrapDocument(pluginId) {
  const mid = JSON.stringify(pluginId);
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; connect-src https: http:; media-src https: http: blob: data:;">
</head><body>
<script>
(function () {
  'use strict';
  var PLUGIN_ID = ${mid};
  var manifest = null;
  var PLUGIN_CODE = null;
  var PLUGIN_PERMISSIONS = [];

  function installNetworkGate() {
    var nativeFetch = window.fetch ? window.fetch.bind(window) : null;
    window.fetch = function () {
      if (PLUGIN_PERMISSIONS.indexOf('network') === -1) {
        return Promise.reject(new Error('Network permission denied'));
      }
      if (!nativeFetch) {
        return Promise.reject(new Error('Fetch unavailable'));
      }
      return nativeFetch.apply(window, arguments);
    };
  }

  var pendingRpc = new Map();
  var rpcId = 0;

  function send(payload) {
    if (window.parent) {
      window.parent.postMessage(Object.assign({ __cultivaPlugin: true, targetPluginId: PLUGIN_ID }, payload), '*');
    }
  }

  function rpc(method, args) {
    return new Promise(function (resolve, reject) {
      var id = ++rpcId;
      pendingRpc.set(id, { resolve: resolve, reject: reject });
      send({ type: 'RPC', id: id, method: method, args: args });
    });
  }

  var hookCallbacks = Object.create(null);
  var hooks = {
    on: function (name, callback) {
      if (!hookCallbacks[name]) hookCallbacks[name] = [];
      hookCallbacks[name].push(callback);
      send({ type: 'HOOK_REGISTER', hookName: name });
    }
  };

  var pluginInstance = null;
  var headerOnClick = null;
  var gardenRenderFn = null;
  var gardenRelay = null;
  var lastGardenPosition = 'top';
  var gardenClickMethod = null;

  function buildContext() {
    return {
      manifest: manifest,
      storage: {
        get: function (key) { return rpc('storage.get', [key]); },
        set: function (key, value) { return rpc('storage.set', [key, value]); },
        remove: function (key) { return rpc('storage.remove', [key]); },
        listKeys: function () { return rpc('storage.listKeys', []); }
      },
      data: {
        read: function (name) { return rpc('data.read', [name]); }
      },
      app: {
        getLocale: function () { return rpc('app.getLocale', []); },
        getThemeColor: function (name) { return rpc('app.getThemeColor', [name]); },
        getThemeTokens: function () { return rpc('app.getThemeTokens', []); },
        getThemeTokenKeys: function () { return rpc('app.getThemeTokenKeys', []); },
        getBuiltinThemes: function () { return rpc('app.getBuiltinThemes', []); },
        getPluginThemes: function () { return rpc('app.getPluginThemes', []); },
        getPluginBackgrounds: function () { return rpc('app.getPluginBackgrounds', []); },
        getPluginSounds: function () { return rpc('app.getPluginSounds', []); },
        getHabits: function () { return rpc('app.getHabits', []); },
        getVersion: function () { return rpc('app.getVersion', []); },
        getToday: function () { return rpc('app.getToday', []); },
        getTimezone: function () { return rpc('app.getTimezone', []); },
        getSettings: function () { return rpc('app.getSettings', []); },
        getWeeklySummary: function () { return rpc('app.getWeeklySummary', []); },
        completeHabit: function (id) { return rpc('app.completeHabit', [id]); },
        setTheme: function (themeId) { return rpc('app.setTheme', [themeId]); },
        setBackground: function (bgId) { return rpc('app.setBackground', [bgId]); },
        previewTheme: function (themeId) { return rpc('app.previewTheme', [themeId]); },
        clearThemePreview: function () { return rpc('app.clearThemePreview', []); },
        applyAppearancePreset: function (presetId) { return rpc('app.applyAppearancePreset', [presetId]); },
        getPlatform: function () { return rpc('app.getPlatform', []); },
        isDesktop: function () { return rpc('app.isDesktop', []); },
        getPluginId: function () { return rpc('app.getPluginId', []); },
        getManifestSummary: function () { return rpc('app.getManifestSummary', []); },
        compareVersions: function (a, b) { return rpc('app.compareVersions', [a, b]); },
        getCodename: function () { return rpc('app.getCodename', []); },
        getAccentColor: function () { return rpc('app.getAccentColor', []); },
        setAccentColor: function (hex) { return rpc('app.setAccentColor', [hex]); },
        getBackgroundId: function () { return rpc('app.getBackgroundId', []); },
        setAmbientSound: function (id) { return rpc('app.setAmbientSound', [id]); },
        setLang: function (lang) { return rpc('app.setLang', [lang]); },
        getFocusMode: function () { return rpc('app.getFocusMode', []); },
        setFocusMode: function (on) { return rpc('app.setFocusMode', [on]); },
        getLowPowerMode: function () { return rpc('app.getLowPowerMode', []); },
        getShowTrophies: function () { return rpc('app.getShowTrophies', []); },
        setShowTrophies: function (on) { return rpc('app.setShowTrophies', [on]); },
        getHolidayRegion: function () { return rpc('app.getHolidayRegion', []); },
        setHolidayRegion: function (region) { return rpc('app.setHolidayRegion', [region]); },
        openSettings: function (section) { return rpc('app.openSettings', [section]); },
        openCalendar: function () { return rpc('app.openCalendar', []); },
        reloadGarden: function () { return rpc('app.reloadGarden', []); },
        syncTray: function () { return rpc('app.syncTray', []); },
        getBuiltinBackgrounds: function () { return rpc('app.getBuiltinBackgrounds', []); },
        getAppearancePresets: function () { return rpc('app.getAppearancePresets', []); },
        getHabit: function (id) { return rpc('app.getHabit', [id]); },
        getHabitsCompletedToday: function () { return rpc('app.getHabitsCompletedToday', []); },
        logQuantity: function (id, value) { return rpc('app.logQuantity', [id, value]); }
      },
      ui: {
        registerHeaderItem: function (config) {
          headerOnClick = config && config.onClick;
          send({
            type: 'UI_REGISTER_HEADER',
            label: config && config.label,
            icon: config && config.icon,
            hasOnClick: typeof (config && config.onClick) === 'function'
          });
        },
        registerGardenWidget: function (config) {
          gardenRenderFn = config && config.render;
          var position = (config && config.position) || 'top';
          lastGardenPosition = position;
          gardenClickMethod = config && config.onTapMethod ? String(config.onTapMethod) : null;
          gardenRelay = { id: '', className: '' };
          gardenRelay.appendChild = function (node) {
            if (node && typeof node.outerHTML === 'string') {
              send({
                type: 'GARDEN_HTML',
                position: position,
                html: node.outerHTML,
                gardenClickMethod: gardenClickMethod
              });
            } else {
              console.warn('[PluginSandbox] appendChild expects a DOM node with outerHTML; use innerHTML on the relay.');
            }
          };
          Object.defineProperty(gardenRelay, 'innerHTML', {
            configurable: true,
            get: function () { return ''; },
            set: function (html) {
              send({
                type: 'GARDEN_HTML',
                position: position,
                html: String(html),
                gardenClickMethod: gardenClickMethod
              });
            }
          });
          send({ type: 'GARDEN_REGISTER', position: position });
        },
        updateGardenHtml: function (html) {
          send({
            type: 'GARDEN_HTML',
            position: lastGardenPosition,
            html: String(html),
            gardenClickMethod: gardenClickMethod
          });
        },
        openMainSheet: function (html) {
          send({ type: 'UI_MAIN_SHEET', html: String(html) });
        },
        patchMainSheet: function (selector, html) {
          send({ type: 'UI_PATCH_MAIN_SHEET', selector: String(selector), html: String(html) });
        },
        closeMainSheet: function () {
          send({ type: 'UI_CLOSE_MAIN_SHEET' });
        },
        updateMainHeader: function (opts) {
          opts = opts || {};
          send({
            type: 'UI_UPDATE_HEADER',
            label: opts.label === undefined ? null : opts.label,
            icon: opts.icon === undefined ? null : opts.icon,
            labelColor: opts.labelColor === undefined ? null : opts.labelColor
          });
        },
        showNotification: function (icon, text) {
          return rpc('ui.showNotification', [icon != null ? icon : '\\uD83D\\uDD0C', text != null ? String(text) : '']);
        },
        registerCalendarWidget: function (config) {
          var position = (config && config.position) || 'top';
          send({
            type: 'CALENDAR_HTML',
            position: position,
            html: config && config.html != null ? String(config.html) : ''
          });
          send({ type: 'CALENDAR_REGISTER', position: position });
        },
        updateCalendarHtml: function (html) {
          send({ type: 'CALENDAR_HTML', position: 'top', html: String(html) });
        },
        registerTheme: function (config) {
          send({ type: 'UI_REGISTER_THEME', config: config || {} });
        },
        unregisterTheme: function (themeId) {
          send({ type: 'UI_UNREGISTER_THEME', themeId: String(themeId || '') });
        },
        registerBackground: function (config) {
          send({ type: 'UI_REGISTER_BACKGROUND', config: config || {} });
        },
        unregisterBackground: function (backgroundId) {
          send({ type: 'UI_UNREGISTER_BACKGROUND', backgroundId: String(backgroundId || '') });
        },
        registerSound: function (config) {
          send({ type: 'UI_REGISTER_SOUND', config: config || {} });
        },
        unregisterSound: function (soundId) {
          send({ type: 'UI_UNREGISTER_SOUND', soundId: String(soundId || '') });
        },
        registerFont: function (config) {
          send({ type: 'UI_REGISTER_FONT', config: config || {} });
        },
        registerAppearancePreset: function (config) {
          send({ type: 'UI_REGISTER_APPEARANCE_PRESET', config: config || {} });
        },
        registerSettingsNav: function (config) {
          send({ type: 'UI_REGISTER_SETTINGS_NAV', config: config || {} });
        },
        removeSettingsNav: function (navId) {
          send({ type: 'UI_REMOVE_SETTINGS_NAV', navId: String(navId || '') });
        },
        confirm: function (message, options) {
          return rpc('ui.confirm', [message, options || {}]);
        },
        alert: function (message, options) {
          return rpc('ui.alert', [message, options || {}]);
        },
        openExternal: function (url) {
          return rpc('ui.openExternal', [url]);
        },
        setHeaderBadge: function (badge) {
          send({ type: 'UI_SET_HEADER_BADGE', badge: badge == null ? '' : String(badge) });
        },
        focusHabit: function (habitId) {
          send({ type: 'UI_FOCUS_HABIT', habitId: String(habitId || '') });
        }
      }
    };
  }

  window.addEventListener('message', function (ev) {
    if (ev.source !== window.parent) return;
    var d = ev.data;
    if (!d || d.targetPluginId !== PLUGIN_ID) return;

    if (d.type === 'INIT_PLUGIN') {
      if (PLUGIN_CODE != null) return;
      manifest = d.manifest;
      PLUGIN_CODE = d.pluginCode;
      PLUGIN_PERMISSIONS = Array.isArray(d.permissions) ? d.permissions : (Array.isArray(manifest && manifest.permissions) ? manifest.permissions : []);
      installNetworkGate();
      if (typeof PLUGIN_CODE !== 'string' || !manifest) {
        send({ type: 'SANDBOX_ERROR', error: 'Invalid INIT_PLUGIN payload' });
        return;
      }
      runPlugin();
      return;
    }

    if (d.type === 'RPC_RESULT') {
      var p = pendingRpc.get(d.id);
      if (p) {
        pendingRpc.delete(d.id);
        if (d.error) p.reject(new Error(d.error));
        else p.resolve(d.result);
      }
      return;
    }
    if (d.type === 'INVOKE_HOOK') {
      var list = hookCallbacks[d.hookName] || [];
      var args = d.args || [];
      list.forEach(function (cb) {
        Promise.resolve(cb.apply(null, args)).catch(function (e) {
          console.error('[PluginSandbox] hook error', d.hookName, e);
        });
      });
      return;
    }
    if (d.type === 'INVOKE_INSTANCE') {
      if (pluginInstance && typeof pluginInstance[d.method] === 'function') {
        Promise.resolve(pluginInstance[d.method].apply(pluginInstance, d.args || [])).catch(function (e) {
          console.error('[PluginSandbox] instance method error', d.method, e);
        });
      }
      return;
    }
    if (d.type === 'HEADER_ONCLICK') {
      if (headerOnClick && typeof headerOnClick === 'function') {
        Promise.resolve(headerOnClick.call(pluginInstance)).catch(function (e) {
          console.error('[PluginSandbox] onClick error', e);
        });
      }
      return;
    }
    if (d.type === 'MODAL_ACTION') {
      if (pluginInstance && typeof pluginInstance.onModalAction === 'function') {
        Promise.resolve(pluginInstance.onModalAction(d.action, d.payload || null)).catch(function (e) {
          console.error('[PluginSandbox] onModalAction error', d.action, e);
        });
      }
      return;
    }
    if (d.type === 'RUN_GARDEN_RENDER') {
      if (gardenRelay && gardenRenderFn && typeof gardenRenderFn === 'function') {
        try {
          gardenRenderFn(gardenRelay);
        } catch (e) {
          console.error('[PluginSandbox] garden render error', e);
        }
      }
      return;
    }
    if (d.type === 'LIFECYCLE') {
      if (pluginInstance && typeof pluginInstance[d.name] === 'function') {
        Promise.resolve(pluginInstance[d.name].apply(pluginInstance, d.args || [])).catch(function (e) {
          console.error('[PluginSandbox] lifecycle error', d.name, e);
        });
      }
      return;
    }
  });

  function runPlugin() {
    var context = buildContext();
    try {
      pluginInstance = new Function('context', 'hooks', PLUGIN_CODE)(context, hooks);
    } catch (e) {
      send({ type: 'SANDBOX_ERROR', error: String(e && e.message ? e.message : e) });
      return;
    }

    function sendReady() {
      var methods = [];
      if (pluginInstance) {
        var seen = Object.create(null);
        var cur = pluginInstance;
        while (cur && cur !== Object.prototype) {
          Object.getOwnPropertyNames(cur).forEach(function (k) {
            if (k === 'constructor' || seen[k]) return;
            try {
              if (typeof pluginInstance[k] === 'function') {
                seen[k] = true;
              }
            } catch (e) {}
          });
          cur = Object.getPrototypeOf(cur);
        }
        methods = Object.keys(seen);
      }
      send({
        type: 'SANDBOX_READY',
        methods: methods
      });
    }

    if (pluginInstance && typeof pluginInstance.onEnable === 'function') {
      Promise.resolve(pluginInstance.onEnable())
        .then(sendReady)
        .catch(function (e) {
          send({ type: 'SANDBOX_ERROR', error: String(e && e.message ? e.message : e) });
        });
    } else {
      sendReady();
    }
  }

  send({ type: 'SANDBOX_AWAIT_INIT' });
})();
\x3c/script>
</body></html>`;
}

function createInstanceProxy(host, methodNames) {
  const proxy = {};
  for (const name of methodNames) {
    proxy[name] = (...args) => host.invokeInstanceMethod(name, args);
  }
  return proxy;
}

export class PluginSandboxHost {
  constructor(pluginId, manifest) {
    this.pluginId = pluginId;
    this.manifest = manifest;
    this.iframe = null;
    this._blobUrl = null;
    this._pendingPluginCode = null;
    this._onMessage = this._onMessage.bind(this);
    this._loadResolve = null;
    this._loadReject = null;
    this._loadTimeout = null;
    this._registeredHooks = new Set();
    this._handlers = {
      onRpc: null,
      onHookRegister: null,
      onUiRegisterHeader: null,
      onGardenRegister: null,
      onGardenHtml: null,
      onUiMainSheet: null,
      onUiPatchMainSheet: null,
      onUiCloseMainSheet: null,
      onUiUpdateHeader: null,
      onReady: null,
      onError: null
    };
  }

  setHandler(event, fn) {
    this._handlers[event] = fn;
  }

  _onMessage(ev) {
    if (!this.iframe || ev.source !== this.iframe.contentWindow) {
      return;
    }
    const d = ev.data;
    if (!d || d.__cultivaPlugin !== true || d.targetPluginId !== this.pluginId) {
      return;
    }

    if (d.type === 'SANDBOX_AWAIT_INIT') {
      const w = this.iframe.contentWindow;
      if (w && typeof this._pendingPluginCode === 'string') {
        w.postMessage(
          {
            targetPluginId: this.pluginId,
            type: 'INIT_PLUGIN',
            manifest: this.manifest,
            pluginCode: this._pendingPluginCode,
            permissions: Array.isArray(this.manifest.permissions) ? this.manifest.permissions : []
          },
          '*'
        );
      }
      return;
    }

    if (d.type === 'RPC') {
      const { id, method, args } = d;
      if (!isAllowedPluginRpcMethod(method)) {
        this._replyRpc(id, undefined, 'Blocked RPC: ' + method);
        return;
      }
      const handler = this._handlers.onRpc;
      if (!handler) {
        this._replyRpc(id, undefined, 'No RPC handler');
        return;
      }
      Promise.resolve(handler(method, args || []))
        .then((result) => this._replyRpc(id, result))
        .catch((err) => this._replyRpc(id, undefined, String(err && err.message ? err.message : err)));
      return;
    }

    if (d.type === 'HOOK_REGISTER') {
      this._registeredHooks.add(d.hookName);
      if (this._handlers.onHookRegister) {
        this._handlers.onHookRegister(d.hookName);
      }
      return;
    }

    if (d.type === 'UI_REGISTER_HEADER') {
      if (this._handlers.onUiRegisterHeader) {
        this._handlers.onUiRegisterHeader(d);
      }
      return;
    }

    if (d.type === 'GARDEN_REGISTER') {
      if (this._handlers.onGardenRegister) {
        this._handlers.onGardenRegister(d);
      }
      return;
    }

    if (d.type === 'GARDEN_HTML') {
      if (this._handlers.onGardenHtml) {
        this._handlers.onGardenHtml(d);
      }
      return;
    }

    if (d.type === 'CALENDAR_REGISTER') {
      if (this._handlers.onCalendarRegister) {
        this._handlers.onCalendarRegister(d);
      }
      return;
    }

    if (d.type === 'CALENDAR_HTML') {
      if (this._handlers.onCalendarHtml) {
        this._handlers.onCalendarHtml(d);
      }
      return;
    }

    if (d.type === 'UI_MAIN_SHEET') {
      if (this._handlers.onUiMainSheet) {
        this._handlers.onUiMainSheet(d);
      }
      return;
    }

    if (d.type === 'UI_PATCH_MAIN_SHEET') {
      if (this._handlers.onUiPatchMainSheet) {
        this._handlers.onUiPatchMainSheet(d);
      }
      return;
    }

    if (d.type === 'UI_CLOSE_MAIN_SHEET') {
      if (this._handlers.onUiCloseMainSheet) {
        this._handlers.onUiCloseMainSheet();
      }
      return;
    }

    if (d.type === 'UI_UPDATE_HEADER') {
      if (this._handlers.onUiUpdateHeader) {
        this._handlers.onUiUpdateHeader(d);
      }
      return;
    }

    if (d.type === 'UI_REGISTER_THEME') {
      if (this._handlers.onUiRegisterTheme) {
        this._handlers.onUiRegisterTheme(d);
      }
      return;
    }

    if (d.type === 'UI_REGISTER_BACKGROUND') {
      if (this._handlers.onUiRegisterBackground) {
        this._handlers.onUiRegisterBackground(d);
      }
      return;
    }

    if (d.type === 'UI_REGISTER_SOUND') {
      if (this._handlers.onUiRegisterSound) {
        this._handlers.onUiRegisterSound(d);
      }
      return;
    }

    if (d.type === 'UI_UNREGISTER_THEME') {
      if (this._handlers.onUiUnregisterTheme) {
        this._handlers.onUiUnregisterTheme(d);
      }
      return;
    }

    if (d.type === 'UI_UNREGISTER_BACKGROUND') {
      if (this._handlers.onUiUnregisterBackground) {
        this._handlers.onUiUnregisterBackground(d);
      }
      return;
    }

    if (d.type === 'UI_UNREGISTER_SOUND') {
      if (this._handlers.onUiUnregisterSound) {
        this._handlers.onUiUnregisterSound(d);
      }
      return;
    }

    if (d.type === 'UI_REGISTER_FONT') {
      if (this._handlers.onUiRegisterFont) {
        this._handlers.onUiRegisterFont(d);
      }
      return;
    }

    if (d.type === 'UI_REGISTER_APPEARANCE_PRESET') {
      if (this._handlers.onUiRegisterAppearancePreset) {
        this._handlers.onUiRegisterAppearancePreset(d);
      }
      return;
    }

    if (d.type === 'UI_FOCUS_HABIT') {
      if (this._handlers.onUiFocusHabit) {
        this._handlers.onUiFocusHabit(d);
      }
      return;
    }

    if (d.type === 'UI_SET_HEADER_BADGE') {
      if (this._handlers.onUiSetHeaderBadge) {
        this._handlers.onUiSetHeaderBadge(d);
      }
      return;
    }

    if (d.type === 'UI_REGISTER_SETTINGS_NAV') {
      if (this._handlers.onUiRegisterSettingsNav) {
        this._handlers.onUiRegisterSettingsNav(d);
      }
      return;
    }

    if (d.type === 'UI_REMOVE_SETTINGS_NAV') {
      if (this._handlers.onUiRemoveSettingsNav) {
        this._handlers.onUiRemoveSettingsNav(d);
      }
      return;
    }

    if (d.type === 'SANDBOX_READY') {
      const methods = d.methods || [];
      if (this._loadTimeout) {
        clearTimeout(this._loadTimeout);
        this._loadTimeout = null;
      }
      if (this._loadResolve) {
        this._loadResolve({
          methods,
          instanceProxy: createInstanceProxy(this, methods)
        });
        this._loadResolve = null;
        this._loadReject = null;
      }
      if (this._handlers.onReady) {
        this._handlers.onReady(methods);
      }
      return;
    }

    if (d.type === 'SANDBOX_ERROR') {
      if (this._loadTimeout) {
        clearTimeout(this._loadTimeout);
        this._loadTimeout = null;
      }
      if (this._loadReject) {
        this._loadReject(new Error(d.error || 'Sandbox error'));
        this._loadResolve = null;
        this._loadReject = null;
      }
      if (this._handlers.onError) {
        this._handlers.onError(d.error);
      }
      return;
    }
  }

  _replyRpc(id, result, error) {
    this.postToSandbox({ type: 'RPC_RESULT', id, result, error });
  }

  postToSandbox(payload) {
    if (!this.iframe || !this.iframe.contentWindow) {
      return;
    }
    this.iframe.contentWindow.postMessage(Object.assign({ targetPluginId: this.pluginId }, payload), '*');
  }

  invokeInstanceMethod(method, args = []) {
    this.postToSandbox({ type: 'INVOKE_INSTANCE', method, args });
  }

  invokeHeaderOnClick() {
    this.postToSandbox({ type: 'HEADER_ONCLICK' });
  }

  invokeHook(hookName, args) {
    this.postToSandbox({ type: 'INVOKE_HOOK', hookName, args });
  }

  runGardenRender() {
    this.postToSandbox({ type: 'RUN_GARDEN_RENDER' });
  }

  async runLifecycle(name, args = []) {
    this.postToSandbox({ type: 'LIFECYCLE', name, args });
  }

  hasHook(hookName) {
    return this._registeredHooks.has(hookName);
  }

  load(pluginCode) {
    return new Promise((resolve, reject) => {
      this._pendingPluginCode = pluginCode;
      this._loadResolve = resolve;
      this._loadReject = reject;
      window.addEventListener('message', this._onMessage);

      const html = buildSandboxBootstrapDocument(this.pluginId);
      const blob = new Blob([html], { type: 'text/html' });
      this._blobUrl = URL.createObjectURL(blob);

      this.iframe = document.createElement('iframe');
      this.iframe.setAttribute('sandbox', 'allow-scripts');
      this.iframe.setAttribute('title', 'plugin-sandbox-' + this.pluginId);
      this.iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden;pointer-events:none';
      document.body.appendChild(this.iframe);
      this.iframe.src = this._blobUrl;

      this._loadTimeout = setTimeout(() => {
        this._loadTimeout = null;
        if (this._loadReject) {
          this._loadReject(new Error('Plugin sandbox load timeout'));
          this._loadResolve = null;
          this._loadReject = null;
        }
        this.destroy();
      }, 30000);
    });
  }

  destroy() {
    if (this._loadTimeout) {
      clearTimeout(this._loadTimeout);
      this._loadTimeout = null;
    }
    try {
      document.querySelectorAll('[data-cultiva-plugin-sheet]').forEach((el) => {
        if (el.getAttribute('data-cultiva-plugin-sheet') === this.pluginId) {
          el.remove();
        }
      });
    } catch {
      void 0;
    }
    window.removeEventListener('message', this._onMessage);
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    if (this._blobUrl) {
      URL.revokeObjectURL(this._blobUrl);
      this._blobUrl = null;
    }
    this._pendingPluginCode = null;
    this._loadResolve = null;
    this._loadReject = null;
    this._registeredHooks.clear();
  }
}
