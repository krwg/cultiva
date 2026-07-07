export interface CultivaPluginManifest {
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  icon?: string;
  entry?: string;
  styles?: string[];
  permissions?: Array<'network' | 'storage' | 'ui'>;
  minAppVersion?: string;
  settings?: CultivaPluginSettingField[];
}

export interface CultivaPluginSettingField {
  key: string;
  label?: string;
  type: 'text' | 'select' | 'boolean';
  default?: string | number | boolean;
  options?: Array<{ value: string; label?: string }>;
}

export interface CultivaPluginStorage {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
}

export interface CultivaPluginHeaderConfig {
  label?: string;
  icon?: string;
  onClick?: () => void | Promise<void>;
}

export interface CultivaPluginGardenConfig {
  render?: (container: { innerHTML: string; appendChild(node: { outerHTML: string }): void }) => void;
  position?: 'top' | 'bottom';
  onTapMethod?: string;
}

export interface CultivaPluginUi {
  registerHeaderItem(config: CultivaPluginHeaderConfig): void;
  registerGardenWidget(config: CultivaPluginGardenConfig): void;
  updateGardenHtml(html: string): void;
  openMainSheet(html: string): void;
  closeMainSheet(): void;
  updateMainHeader(opts: { label?: string; icon?: string; labelColor?: string | null }): void;
  showNotification(icon: string, text: string): Promise<void>;
}

export interface CultivaPluginHooks {
  on(event: 'onHabitComplete', callback: (habit: unknown) => void | Promise<void>): void;
  on(event: 'onAppStart', callback: () => void | Promise<void>): void;
  on(event: 'onSettingsChange', callback: (settings: unknown) => void | Promise<void>): void;
}

export interface CultivaPluginContext {
  manifest: CultivaPluginManifest;
  storage: CultivaPluginStorage;
  ui: CultivaPluginUi;
}

export interface CultivaPluginInstance {
  onEnable?(): void | Promise<void>;
  onDisable?(): void | Promise<void>;
  onModalAction?(action: string, payload: unknown): void | Promise<void>;
  [method: string]: unknown;
}

export type CultivaPluginFactory = (
  context: CultivaPluginContext,
  hooks: CultivaPluginHooks
) => CultivaPluginInstance;

declare global {
  interface Window {
    showNotification?: (icon: string, text: string) => void;
    renderPluginHeaderItems?: () => void;
    installPlugin?: (pluginId: string) => Promise<void>;
    uninstallPlugin?: (pluginId: string) => Promise<void>;
    openPluginSettings?: (pluginId: string) => void;
  }
}

export {};
