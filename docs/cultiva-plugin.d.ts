export interface CultivaPluginManifest {
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  icon?: string;
  entry?: string;
  styles?: string[];
  permissions?: Array<'network' | 'storage' | 'ui' | 'habits.read' | 'settings.read'>;
  data?: string[];
  minAppVersion?: string;
  i18n?: Record<string, { name?: string; description?: string }>;
  settings?: CultivaPluginSettingField[];
}

export interface CultivaPluginSettingFieldI18n {
  label?: string;
  emptyMessage?: string;
  options?: Record<string, string>;
}

export interface CultivaPluginSettingField {
  key: string;
  label?: string;
  type: 'text' | 'select' | 'boolean' | 'favorites';
  default?: string | number | boolean;
  emptyMessage?: string;
  options?: Array<{ value: string; label?: string }>;
  i18n?: Record<string, CultivaPluginSettingFieldI18n>;
}

export interface CultivaPluginStorage {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface CultivaPluginData {
  read(path: string): Promise<unknown>;
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
  patchMainSheet?(selector: string, html: string): void;
  closeMainSheet(): void;
  updateMainHeader(opts: { label?: string; icon?: string; labelColor?: string | null }): void;
  showNotification(icon: string, text: string): Promise<void>;
}

export interface CultivaPluginHooks {
  on(event: 'onHabitComplete', callback: (habit: unknown) => void | Promise<void>): void;
  on(event: 'onAppStart', callback: () => void | Promise<void>): void;
  on(event: 'onSettingsChange', callback: (settings: unknown) => void | Promise<void>): void;
}

export interface CultivaPluginHabitSnapshot {
  id: string;
  name: string;
  category: string;
  trackType: 'binary' | 'quantity';
  progress: number;
  currentStreak: number;
  bestStreak: number;
  lastCompleted: string | null;
  completedToday: boolean;
  target: number;
  unit: string;
  todayProgress: number;
}

export interface CultivaPluginPublicSettings {
  lang: string;
  theme: string;
  holidayRegion: string;
  pluginsEnabled: boolean;
  focusMode: boolean;
  showTrophies: boolean;
  streakGraceEnabled: boolean;
}

export interface CultivaPluginApp {
  getLocale(): Promise<string>;
  getThemeColor(cssVar: string): Promise<string>;
  getHabits(): Promise<CultivaPluginHabitSnapshot[]>;
  getVersion(): Promise<string>;
  getToday(): Promise<string>;
  getTimezone(): Promise<string>;
  getSettings(): Promise<CultivaPluginPublicSettings>;
}

export interface CultivaPluginContext {
  manifest: CultivaPluginManifest;
  storage: CultivaPluginStorage;
  data: CultivaPluginData;
  app: CultivaPluginApp;
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
