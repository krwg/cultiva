import { habits } from '../modules/habits.js';
import { settings } from './renderer-bootstrap.js';
import { resolveThemeBodyId } from '../core/theme-config.js';
import { LEGACY_THRESHOLD } from '../core/config.js';

const FALLBACK = {
  en: {
    garden: { details: 'In the garden', state: 'Growing habits' },
    calendar: { details: 'Planning habits', state: 'Browsing calendar' },
    stats: { details: 'Reviewing progress', state: 'Checking statistics' },
    settings: { details: 'Customizing', state: 'Adjusting settings' },
    trophy: { details: 'Trophy Garden', state: 'Admiring trophy trees' },
    focus: { details: 'Focus Mode', state: 'Deep work session' },
    pages: { details: 'Exploring Cultiva', state: 'Reading documentation' }
  },
  ru: {
    garden: { details: 'В саду', state: 'Выращивает привычки' },
    calendar: { details: 'Планирует', state: 'Смотрит календарь' },
    stats: { details: 'Анализирует', state: 'Проверяет статистику' },
    settings: { details: 'Настраивает', state: 'Меняет параметры' },
    trophy: { details: 'Сад трофеев', state: 'Любуется деревьями-трофеями' },
    focus: { details: 'Режим фокуса', state: 'Глубокая работа' },
    pages: { details: 'Изучает Cultiva', state: 'Читает документацию' }
  }
};

const PREFS_KEY = 'cultiva-discord-prefs';

export const DISCORD_PREF_DEFAULTS = Object.freeze({
  showHabitCount: true,
  showStreak: true,
  showTrophies: true,
  showElapsed: true,
  showButtons: true,
  showFocusOverride: true,
  displayMode: 'activity', // activity | quiet | custom
  imageStyle: 'auto', // auto | garden | legacy | theme
  customDetails: '',
  customState: ''
});

let _focusSession = false;
let _lastPayload = null;

export function getDiscordPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return { ...DISCORD_PREF_DEFAULTS };
    }
    const parsed = JSON.parse(raw);
    return { ...DISCORD_PREF_DEFAULTS, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return { ...DISCORD_PREF_DEFAULTS };
  }
}

export function saveDiscordPrefs(partial) {
  const next = { ...getDiscordPrefs(), ...partial };
  localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  return next;
}

export function getDiscordPageStrings(locale = 'en') {
  return FALLBACK[locale] || FALLBACK.en;
}

export function setDiscordFocusSession(active) {
  _focusSession = active === true;
}

export function isDiscordFocusSession() {
  return _focusSession === true;
}

function detectPage() {
  const prefs = getDiscordPrefs();
  if (prefs.showFocusOverride && (_focusSession || settings.focusMode === true)) {
    return 'focus';
  }
  const url = window.location.href;
  if (url.includes('/calendar')) {
    return 'calendar';
  }
  if (url.includes('/pages/')) {
    return 'pages';
  }
  return 'garden';
}

function gardenSnapshot() {
  const all = typeof habits.getAll === 'function' ? habits.getAll() : [];
  const active = all.filter((h) => !h.archived && !h.paused && !h.disabled);
  const trophies = all.filter((h) => (h.progress || 0) >= LEGACY_THRESHOLD || h.stage === 'legacy');
  let bestStreak = 0;
  for (const h of active) {
    const s = Number(h.currentStreak || 0);
    if (s > bestStreak) {
      bestStreak = s;
    }
  }
  return {
    activeCount: active.length,
    trophyCount: trophies.length,
    bestStreak,
    hasLegacy: trophies.length > 0
  };
}

function themeImageKey() {
  const resolved = resolveThemeBodyId(settings.theme || 'auto');
  if (resolved === 'rowan' || resolved === 'inkwell' || resolved === 'dark') {
    return 'theme-dark';
  }
  if (resolved === 'birch' || resolved === 'light' || resolved === 'blossom' || resolved === 'pink') {
    return 'theme-light';
  }
  if (resolved === 'linden' || resolved === 'evergreen' || resolved === 'cypress') {
    return 'theme-forest';
  }
  return 'garden';
}

function resolveLargeImage(prefs, snap) {
  if (prefs.imageStyle === 'garden') {
    return 'garden';
  }
  if (prefs.imageStyle === 'legacy') {
    return 'legacy-tree';
  }
  if (prefs.imageStyle === 'theme') {
    return themeImageKey();
  }
  return snap.hasLegacy ? 'legacy-tree' : themeImageKey();
}

function buildActivityCopy(page, locale, snap, prefs) {
  const strings = getDiscordPageStrings(locale);
  const base = strings[page] || strings.garden;
  const ru = locale === 'ru';

  if (prefs.displayMode === 'custom') {
    return {
      details: (prefs.customDetails || '').trim() || base.details,
      state: (prefs.customState || '').trim() || base.state
    };
  }

  if (prefs.displayMode === 'quiet') {
    return { details: 'Cultiva', state: ru ? 'В саду' : 'In the garden' };
  }

  if (page === 'focus') {
    return { details: base.details, state: base.state };
  }

  if (page === 'calendar') {
    return { details: base.details, state: base.state };
  }

  if (page === 'garden' || page === 'trophy') {
    let details = base.details;
    if (prefs.showHabitCount) {
      details = ru
        ? `Растёт ${snap.activeCount} ${snap.activeCount === 1 ? 'привычка' : 'привычек'}`
        : `Growing ${snap.activeCount} habit${snap.activeCount === 1 ? '' : 's'}`;
    }

    let state = base.state;
    if (prefs.showStreak && snap.bestStreak > 0) {
      state = ru ? `🔥 Серия ${snap.bestStreak} дн.` : `🔥 ${snap.bestStreak}-day streak`;
    } else if (prefs.showTrophies && snap.hasLegacy) {
      state = ru
        ? `Трофеев: ${snap.trophyCount}`
        : `${snap.trophyCount} trophy tree${snap.trophyCount === 1 ? '' : 's'}`;
    }
    return { details, state };
  }

  return { details: base.details, state: base.state };
}

export function getLastDiscordPayload() {
  return _lastPayload;
}

export async function pushDiscordPresence(overrides = {}) {
  if (typeof window.discord?.updateActivity !== 'function') {
    return null;
  }
  if (localStorage.getItem('cultiva-discord-enabled') === 'false') {
    return null;
  }

  const prefs = getDiscordPrefs();
  const locale = overrides.locale || settings.lang || 'en';
  const page = overrides.page || detectPage();
  const snap = gardenSnapshot();
  const copy = buildActivityCopy(page, locale, snap, prefs);
  const largeImageKey = overrides.largeImageKey || resolveLargeImage(prefs, snap);

  const payload = {
    page,
    locale,
    details: overrides.details || copy.details,
    state: overrides.state || copy.state,
    largeImageKey,
    largeImageText: 'Cultiva',
    smallImageKey: overrides.smallImageKey,
    smallImageText: overrides.smallImageText,
    showButtons: prefs.showButtons !== false,
    showElapsed: prefs.showElapsed !== false
  };

  _lastPayload = payload;
  try {
    await window.discord.updateActivity(payload);
  } catch {
    void 0;
  }

  if (typeof window.updateDiscordPreview === 'function') {
    window.updateDiscordPreview(payload.details, payload.state);
  }
  return payload;
}

export function scheduleDiscordPresenceRefresh() {
  const run = () => {
    void pushDiscordPresence();
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 2500 });
  } else {
    setTimeout(run, 600);
  }
}
