import { storage } from '../modules/storage.js';
import { BRANDING } from './branding.js';

const REGISTRY_URL = 'https://raw.githubusercontent.com/krwg/CultivaPlugins/main/registry.json';

let plugins = new Map();
let pluginHooks = {
  onHabitComplete: [],
  onAppStart: [],
  onSettingsChange: [],
  renderHeaderItem: [],
  renderGardenWidget: []
};

let _initPromise = null;
let _isInitialized = false;

export const pluginManager = {
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
    
    let installed = await storage.get('cultiva-installed-plugins');
    console.log('[PluginManager] From storage:', installed);
    
    if (!installed || installed.length === 0) {
      const ls = localStorage.getItem('cultiva-installed-plugins');
      installed = ls ? JSON.parse(ls) : [];
      console.log('[PluginManager] From localStorage:', installed);
    }
    
    console.log('[PluginManager] Installed plugins:', installed);
    
    for (const pluginId of installed) {
      console.log('[PluginManager] Loading plugin:', pluginId);
      const success = await this.loadPlugin(pluginId);
      console.log('[PluginManager] Load result for', pluginId, ':', success);
    }
    
    await this.triggerHook('onAppStart');
    
    _isInitialized = true;
    console.log('[PluginManager] Initialized with', plugins.size, 'plugins');
  },
  
  async loadPlugin(pluginId) {
    try {
      console.log('[PluginManager] Loading plugin from disk:', pluginId);
      
      const manifestJson = await window.electron.readPluginFile(`${pluginId}/manifest.json`);
      
      if (!manifestJson) {
        console.warn('[PluginManager] Plugin manifest not found:', pluginId);
        return false;
      }
      
      const manifest = JSON.parse(manifestJson);
      console.log('[PluginManager] Manifest loaded:', manifest.name, 'v' + manifest.version);
      
      if (manifest.minAppVersion) {
        const appVersion = BRANDING.VERSION;
        if (!this.checkVersion(appVersion, manifest.minAppVersion)) {
          console.warn('[PluginManager] Plugin requires newer app version:', manifest.minAppVersion);
          return false;
        }
      }
      
      const pluginCode = await window.electron.readPluginFile(`${pluginId}/${manifest.entry}`);
      
      if (!pluginCode) {
        console.warn('[PluginManager] Plugin code not found:', manifest.entry);
        return false;
      }
      
      const pluginContext = this.createPluginContext(manifest);
      const pluginInstance = new Function('context', 'hooks', pluginCode)(pluginContext, this.createHooksProxy(pluginId));
      
      plugins.set(pluginId, {
        id: pluginId,
        manifest,
        instance: pluginInstance,
        enabled: true
      });
      
      if (pluginInstance && pluginInstance.onEnable) {
        await pluginInstance.onEnable();
      }
      

      await new Promise(resolve => setTimeout(resolve, 50));
      
      const plugin = plugins.get(pluginId);
      

      if (plugin?.gardenWidget && typeof plugin.gardenWidget.render === 'function') {
        setTimeout(() => {
          const container = document.getElementById('garden-container');
          if (container) {
            const oldWidget = document.getElementById(`${pluginId}-garden-widget`);
            if (oldWidget) oldWidget.remove();
            plugin.gardenWidget.render(container);
          }
        }, 200);
      }
      
      console.log('[PluginManager] Loaded plugin:', manifest.name, 'v' + manifest.version);
      
      // Вызываем рендер шапки
      if (typeof window.renderPluginHeaderItems === 'function') {
        setTimeout(() => window.renderPluginHeaderItems(), 100);
      }
      
      return true;
    } catch (e) {
      console.error('[PluginManager] Failed to load plugin:', pluginId, e);
      return false;
    }
  },

  get plugins() {
    return plugins;
  },
  
  createPluginContext(manifest) {
    const self = this;
    
    return {
      manifest,
      storage: {
        async get(key) {
          return storage.get(`plugin_${manifest.id}_${key}`);
        },
        async set(key, value) {
          return storage.set(`plugin_${manifest.id}_${key}`, value);
        }
      },
      ui: {
        registerHeaderItem: (config) => self.registerHeaderItem(manifest.id, config),
        registerGardenWidget: (config) => self.registerGardenWidget(manifest.id, config),
        showNotification: (text, icon = '🔌') => {
          if (typeof window.showNotification === 'function') {
            window.showNotification(icon, text);
          } else {
            console.warn('[Plugin] showNotification not available');
          }
        }
      }
    };
  },
  
  createHooksProxy(pluginId) {
    return {
      on: (hookName, callback) => {
        if (pluginHooks[hookName]) {
          pluginHooks[hookName].push({ pluginId, callback });
        }
      }
    };
  },
  
  registerHeaderItem(pluginId, config) {
    const plugin = plugins.get(pluginId);
    if (!plugin) return;
    
    const instance = plugin.instance;
    let modalMethod = null;
    
    if (instance && typeof instance.openWeatherModal === 'function') {
      modalMethod = 'openWeatherModal';
    } else if (instance && typeof instance.openSettingsModal === 'function') {
      modalMethod = 'openSettingsModal';
    } else if (instance && typeof instance.openRadioModal === 'function') {
      modalMethod = 'openRadioModal';
    } else if (instance && typeof instance.openModal === 'function') {
      modalMethod = 'openModal';
    }
    
    plugin.headerItem = {
      id: `${pluginId}-header`,
      label: config.label || plugin.manifest.name,
      icon: config.icon || plugin.manifest.icon || '🔌',
      instance: instance,
      modalMethod: modalMethod,
      onClick: config.onClick
    };
    
    this.triggerHook('renderHeaderItem', plugin.headerItem);
    
    if (typeof window.renderPluginHeaderItems === 'function') {
      setTimeout(() => window.renderPluginHeaderItems(), 50);
    }
  },
  
  registerGardenWidget(pluginId, config) {
    const plugin = plugins.get(pluginId);
    if (!plugin) return;
    
    plugin.gardenWidget = {
      id: `${pluginId}-garden-widget`,
      render: config.render,
      position: config.position || 'top'
    };
    
    this.triggerHook('renderGardenWidget', plugin.gardenWidget);
    
    if (config.render && typeof config.render === 'function') {
      const container = document.getElementById('garden-container');
      if (container) {
        config.render(container);
      }
    }
  },
  
  async triggerHook(hookName, ...args) {
    const hooks = pluginHooks[hookName] || [];
    for (const { pluginId, callback } of hooks) {
      const plugin = plugins.get(pluginId);
      if (plugin && plugin.enabled) {
        try {
          await callback(...args);
        } catch (e) {
          console.error('[PluginManager] Hook error:', pluginId, hookName, e);
        }
      }
    }
  },
  
  async installPlugin(pluginId) {
    console.log('[PluginManager] Installing plugin:', pluginId);
    
    const response = await fetch(REGISTRY_URL);
    const registry = await response.json();
    
    const pluginInfo = registry.plugins.find(p => p.id === pluginId);
    if (!pluginInfo) {
      throw new Error('Plugin not found in registry');
    }
    
    const files = [
      { name: 'manifest.json', url: `${pluginInfo.baseUrl}/manifest.json` },
      { name: 'index.js', url: `${pluginInfo.baseUrl}/index.js` },
      { name: 'styles.css', url: `${pluginInfo.baseUrl}/styles.css` }
    ];
    
    const success = await window.electron.installPlugin(pluginId, files);
    
    if (success) {
      const installed = await storage.get('cultiva-installed-plugins') || [];
      if (!installed.includes(pluginId)) {
        installed.push(pluginId);
        await storage.set('cultiva-installed-plugins', installed);
        localStorage.setItem('cultiva-installed-plugins', JSON.stringify(installed));
      }
      await this.loadPlugin(pluginId);
    }
    
    return success;
  },
  
  async uninstallPlugin(pluginId) {
    console.log('[PluginManager] Uninstalling plugin:', pluginId);
    
    const plugin = plugins.get(pluginId);
    if (plugin && plugin.instance && plugin.instance.onDisable) {
      await plugin.instance.onDisable();
    }
    
    plugins.delete(pluginId);
    
    await window.electron.uninstallPlugin(pluginId);
    
    const installed = await storage.get('cultiva-installed-plugins') || [];
    const index = installed.indexOf(pluginId);
    if (index > -1) {
      installed.splice(index, 1);
      await storage.set('cultiva-installed-plugins', installed);
      localStorage.setItem('cultiva-installed-plugins', JSON.stringify(installed));
    }
    
    const widget = document.getElementById(`${pluginId}-garden-widget`);
    if (widget) widget.remove();
    
    if (typeof window.renderPluginHeaderItems === 'function') {
      window.renderPluginHeaderItems();
    }
  },
  
  async getAvailablePlugins() {
    try {
      const response = await fetch(REGISTRY_URL);
      const registry = await response.json();
      
      const installed = await storage.get('cultiva-installed-plugins') || [];
      
      return registry.plugins.map(p => ({
        ...p,
        installed: installed.includes(p.id)
      }));
    } catch (e) {
      console.error('[PluginManager] Failed to fetch registry:', e);
      return [];
    }
  },
  
  getInstalledPlugins() {
    return Array.from(plugins.values()).map(p => ({
      id: p.id,
      name: p.manifest.name,
      version: p.manifest.version,
      description: p.manifest.description,
      icon: p.manifest.icon,
      enabled: p.enabled
    }));
  },
  
  checkVersion(current, required) {
    const currentParts = current.split('.').map(Number);
    const requiredParts = required.split('.').map(Number);
    
    for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
      const c = currentParts[i] || 0;
      const r = requiredParts[i] || 0;
      if (c < r) return false;
      if (c > r) return true;
    }
    return true;
  }
};