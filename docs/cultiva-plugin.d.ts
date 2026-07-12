export interface CultivaPluginManifest {
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  icon?: string;
  entry?: string;
  styles?: string[];
  permissions?: Array<
    | 'network'
    | 'storage'
    | 'ui'
    | 'habits.read'
    | 'habits.write'
    | 'settings.read'
    | 'settings.write'
  >;
  data?: string[];
  minAppVersion?: string;
  storeFlow?: 'direct' | 'get';
  contributes?: CultivaPluginContributes;
  i18n?: Record<string, { name?: string; description?: string }>;
  settings?: CultivaPluginSettingField[];
}

export interface CultivaPluginContributionI18n {
  label?: string;
}

export interface CultivaPluginContributesTheme {
  id: string;
  name?: string;
  label?: string;
  group?: 'light' | 'dark';
  css?: string;
  cssText?: string;
  extends?: string;
  monochrome?: boolean;
  variables?: Record<string, string>;
  i18n?: Record<string, CultivaPluginContributionI18n>;
}

export interface CultivaPluginContributesBackground {
  id: string;
  name?: string;
  label?: string;
  css?: string;
  cssText?: string;
  html?: string;
  i18n?: Record<string, CultivaPluginContributionI18n>;
}

export interface CultivaPluginContributesSound {
  id: string;
  name?: string;
  label?: string;
  src: string;
  loop?: boolean;
  volume?: number;
  i18n?: Record<string, CultivaPluginContributionI18n>;
}

export interface CultivaPluginContributesFont {
  id: string;
  family: string;
  src: string;
  weight?: string;
  style?: string;
}

export interface CultivaPluginContributesAppearancePreset {
  id: string;
  label: string;
  theme?: string;
  background?: string;
  sound?: string;
  accentColor?: string | null;
}

export interface CultivaPluginContributesSettingsNav {
  id: string;
  label: string;
  position?: string;
  description?: string;
  html?: string;
}

export interface CultivaPluginContributes {
  themes?: CultivaPluginContributesTheme[];
  backgrounds?: CultivaPluginContributesBackground[];
  sounds?: CultivaPluginContributesSound[];
  fonts?: CultivaPluginContributesFont[];
  appearancePresets?: CultivaPluginContributesAppearancePreset[];
  settingsNav?: CultivaPluginContributesSettingsNav[];
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
  listKeys(): Promise<string[]>;
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

export interface CultivaPluginRegisterThemeConfig extends CultivaPluginContributesTheme {}

export interface CultivaPluginRegisterBackgroundConfig extends CultivaPluginContributesBackground {}

export interface CultivaPluginRegisterSoundConfig extends CultivaPluginContributesSound {}

export interface CultivaPluginRegisterFontConfig extends CultivaPluginContributesFont {}

export interface CultivaPluginRegisterAppearancePresetConfig extends CultivaPluginContributesAppearancePreset {}

export interface CultivaPluginUi {
  registerHeaderItem(config: CultivaPluginHeaderConfig): void;
  registerGardenWidget(config: CultivaPluginGardenConfig): void;
  registerCalendarWidget?(config: { html?: string; position?: 'top' | 'bottom' }): void;
  updateGardenHtml(html: string): void;
  updateCalendarHtml?(html: string): void;
  openMainSheet(html: string): void;
  patchMainSheet?(selector: string, html: string): void;
  closeMainSheet(): void;
  updateMainHeader(opts: { label?: string; icon?: string; labelColor?: string | null }): void;
  showNotification(icon: string, text: string): Promise<void>;
  confirm?(message: string, options?: Record<string, unknown>): Promise<boolean>;
  alert?(message: string, options?: Record<string, unknown>): Promise<void>;
  openExternal?(url: string): Promise<boolean>;
  setHeaderBadge?(badge: string | number | null): void;
  focusHabit?(habitId: string): void;
  registerTheme?(config: CultivaPluginRegisterThemeConfig): void;
  unregisterTheme?(themeId: string): void;
  registerBackground?(config: CultivaPluginRegisterBackgroundConfig): void;
  unregisterBackground?(backgroundId: string): void;
  registerSound?(config: CultivaPluginRegisterSoundConfig): void;
  unregisterSound?(soundId: string): void;
  registerFont?(config: CultivaPluginRegisterFontConfig): void;
  registerAppearancePreset?(config: CultivaPluginRegisterAppearancePresetConfig): void;
  registerSettingsNav?(config: CultivaPluginContributesSettingsNav): void;
  removeSettingsNav?(navId: string): void;
}

export interface CultivaPluginThemeAppliedPayload {
  theme: string;
  resolved: string;
}

export interface CultivaPluginHooks {
  on(event: 'onHabitComplete', callback: (habit: unknown) => void | Promise<void>): void;
  on(event: 'onAppStart', callback: () => void | Promise<void>): void;
  on(event: 'onSettingsChange', callback: (settings: unknown) => void | Promise<void>): void;
  on(event: 'onThemeApplied', callback: (payload: CultivaPluginThemeAppliedPayload) => void | Promise<void>): void;
  on(event: 'onBackgroundApplied', callback: (backgroundId: string) => void | Promise<void>): void;
  on(event: 'onLanguageChange', callback: (lang: string) => void | Promise<void>): void;
  on(event: 'onFocusModeChange', callback: (enabled: boolean) => void | Promise<void>): void;
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

export interface CultivaPluginManifestSummary {
  id: string;
  name: string;
  version: string;
  description?: string;
  minAppVersion: string | null;
  permissions: string[];
}

export interface CultivaPluginAppearancePresetSummary {
  id: string;
  label: string;
  theme?: string;
  background?: string;
  sound?: string;
}

export interface CultivaPluginApp {
  getLocale(): Promise<string>;
  getThemeColor(cssVar: string): Promise<string>;
  getThemeTokens(): Promise<Record<string, string>>;
  getThemeTokenKeys(): Promise<string[]>;
  getBuiltinThemes(): Promise<string[]>;
  getPluginThemes(): Promise<Array<{ id: string; label: string; group: string; extends: string | null }>>;
  getPluginBackgrounds(): Promise<Array<{ id: string; label: string }>>;
  getPluginSounds(): Promise<Array<{ id: string; label: string }>>;
  getVersion(): Promise<string>;
  getCodename(): Promise<string>;
  getPlatform(): Promise<string>;
  isDesktop(): Promise<boolean>;
  getPluginId(): Promise<string | null>;
  getManifestSummary(): Promise<CultivaPluginManifestSummary | null>;
  compareVersions(a: string, b: string): Promise<-1 | 0 | 1>;
  getAccentColor(): Promise<string>;
  setAccentColor(hex: string): Promise<string>;
  getBackgroundId(): Promise<string>;
  setAmbientSound(id: string): Promise<string>;
  setLang(lang: string): Promise<string>;
  getFocusMode(): Promise<boolean>;
  setFocusMode(enabled: boolean): Promise<boolean>;
  getLowPowerMode(): Promise<boolean>;
  getShowTrophies(): Promise<boolean>;
  setShowTrophies(enabled: boolean): Promise<boolean>;
  getHolidayRegion(): Promise<string>;
  setHolidayRegion(region: string): Promise<string>;
  openSettings(section?: string): Promise<boolean>;
  openCalendar(): Promise<boolean>;
  reloadGarden(): Promise<boolean>;
  syncTray(): Promise<boolean>;
  getBuiltinBackgrounds(): Promise<string[]>;
  getAppearancePresets(): Promise<CultivaPluginAppearancePresetSummary[]>;
  getHabits(): Promise<CultivaPluginHabitSnapshot[]>;
  getHabit(habitId: string): Promise<CultivaPluginHabitSnapshot | null>;
  getHabitsCompletedToday(): Promise<CultivaPluginHabitSnapshot[]>;
  getWeeklySummary(): Promise<unknown>;
  completeHabit(habitId: string): Promise<unknown>;
  logQuantity(habitId: string, value: number): Promise<unknown>;
  getToday(): Promise<string>;
  getTimezone(): Promise<string>;
  getSettings(): Promise<CultivaPluginPublicSettings>;
  setTheme(themeId: string): Promise<string>;
  setBackground(bgId: string): Promise<string>;
  previewTheme(themeId: string): Promise<string>;
  clearThemePreview(): Promise<string | null>;
  applyAppearancePreset(presetId: string): Promise<CultivaPluginRegisterAppearancePresetConfig>;
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
    getPlugin?: (pluginId: string) => Promise<void>;
    uninstallPlugin?: (pluginId: string) => Promise<void>;
    openPluginSettings?: (pluginId: string) => void;
  }
}

export {};
