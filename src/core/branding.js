
export const BRANDING = {
  APP_NAME: 'Cultiva',
  CORE_ENGINE: 'CoreV6',
  HABIT_ENGINE: 'GrowthKit3',
  DATABASE: 'IDB3',
  PLUGIN_ENGINE: 'PLE1',
  VERSION: '2.3.0',
  CODENAME: 'Rowan',

  KEYS: {
    SESSION: 'cultiva_current_session',
    SETTINGS: 'cultiva-settings',
    HABITS: 'cultiva-habits',
    MIGRATION_FLAG: 'cultiva_migrated_to_idb_v2'
  },

  TAGLINE: 'Grow your habits, grow yourself.',

  get FOOTER_TEXT() {
    return `[${this.VERSION}] ${this.CODENAME} Desktop`;
  },
  get APP_TITLE() { return this.APP_NAME; },
  get BACKUP_PREFIX() { return `${this.APP_NAME.toLowerCase()}-backup`; }
};

export const formatVersion = () =>
  `${BRANDING.APP_NAME} ${BRANDING.VERSION} "${BRANDING.CODENAME}" [${BRANDING.CORE_ENGINE} · ${BRANDING.PLUGIN_ENGINE}]`;
