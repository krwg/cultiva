const { Client } = require('discord-rpc');

const DISCORD_CLIENT_ID = '1492849856832606329';

const DISCORD_STRINGS = {
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

const PRESENCE_BUTTONS = [
  { label: 'Get Cultiva', url: 'https://krwg.github.io/cultiva/' },
  { label: 'GitHub', url: 'https://github.com/krwg/cultiva' }
];

let rpc = null;
let rpcReady = false;
let discordEnabled = true;
let currentLocale = 'en';
let currentPage = 'garden';
let sessionStartMs = null;
let lastActivityPayload = null;
let refreshTimer = null;

function ensureSessionStart() {
  if (sessionStartMs == null) {
    sessionStartMs = Date.now();
  }
  return sessionStartMs;
}

function initDiscordRPC() {
  if (rpc) {
    return;
  }

  rpc = new Client({ transport: 'ipc' });

  rpc.on('ready', () => {
    console.log('[Discord] Rich Presence connected');
    rpcReady = true;
    ensureSessionStart();
    if (discordEnabled) {
      updateDiscordActivity(lastActivityPayload || { page: currentPage });
    }

    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
    refreshTimer = setInterval(() => {
      if (rpcReady && discordEnabled) {
        updateDiscordActivity(lastActivityPayload || { page: currentPage, locale: currentLocale });
      }
    }, 15000);
  });

  rpc.on('disconnected', () => {
    console.log('[Discord] Rich Presence disconnected');
    rpcReady = false;
  });

  rpc.login({ clientId: DISCORD_CLIENT_ID }).catch((err) => {
    console.warn('[Discord] Failed to connect:', err.message);
    rpc = null;
  });
}

function updateDiscordActivity(activityData = {}) {
  if (!rpcReady || !rpc || !discordEnabled) {
    return;
  }

  const locale = activityData.locale || currentLocale;
  currentLocale = locale;
  const strings = DISCORD_STRINGS[locale] || DISCORD_STRINGS.en;
  const page = activityData.page || currentPage;
  currentPage = page;
  const pageStrings = strings[page] || strings.garden;

  const startMs = activityData.startTimestamp
    ? (activityData.startTimestamp instanceof Date
      ? activityData.startTimestamp.getTime()
      : Number(activityData.startTimestamp))
    : ensureSessionStart();

  const activity = {
    details: activityData.details || pageStrings.details,
    state: activityData.state || pageStrings.state,
    startTimestamp: startMs,
    largeImageKey: activityData.largeImageKey || 'garden',
    largeImageText: activityData.largeImageText || 'Cultiva',
    buttons: PRESENCE_BUTTONS
  };

  if (activityData.smallImageKey) {
    activity.smallImageKey = activityData.smallImageKey;
  }
  if (activityData.smallImageText) {
    activity.smallImageText = activityData.smallImageText;
  }

  lastActivityPayload = {
    ...activityData,
    page,
    locale,
    details: activity.details,
    state: activity.state,
    largeImageKey: activity.largeImageKey,
    largeImageText: activity.largeImageText,
    smallImageKey: activity.smallImageKey,
    smallImageText: activity.smallImageText,
    startTimestamp: startMs
  };

  rpc.setActivity(activity).catch((err) => {
    console.warn('[Discord] Failed to update activity:', err.message);
  });
}

function clearDiscordActivity() {
  if (!rpcReady || !rpc) {
    return;
  }

  rpc.clearActivity().catch((err) => {
    console.warn('[Discord] Failed to clear activity:', err.message);
  });
}

function shutdownDiscordRPC() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
  if (rpc) {
    if (rpcReady) {
      clearDiscordActivity();
    }
    setTimeout(() => {
      rpc.destroy().catch(() => {});
      rpc = null;
      rpcReady = false;
    }, 500);
  }
}

function detectPageFromUrl(url) {
  if (url.includes('/calendar')) {
    return 'calendar';
  }
  if (url.includes('/pages/')) {
    return 'pages';
  }
  if (url.includes('settings') || url.includes('settings-modal')) {
    return 'settings';
  }
  if (url.includes('stats')) {
    return 'stats';
  }
  if (url.includes('trophy')) {
    return 'trophy';
  }
  if (url.includes('focus')) {
    return 'focus';
  }
  return 'garden';
}

function onMainWindowNavigation(url) {
  currentPage = detectPageFromUrl(url);
  if (discordEnabled) {
    const next = {
      ...(lastActivityPayload || {}),
      page: currentPage
    };
    delete next.details;
    delete next.state;
    updateDiscordActivity(next);
  }
}

function onMainWindowReadyShow() {
  currentPage = 'garden';
  ensureSessionStart();
  if (discordEnabled) {
    updateDiscordActivity({ page: 'garden' });
  }
}

function onMainWindowClosed() {
  if (discordEnabled) {
    clearDiscordActivity();
  }
}

function registerDiscordIpc(ipcMain) {
  ipcMain.handle('discord:update-activity', (event, activityData = {}) => {
    if (activityData.locale) {
      currentLocale = activityData.locale;
    }
    if (activityData.page) {
      currentPage = activityData.page;
    }

    if (rpcReady && discordEnabled) {
      updateDiscordActivity(activityData);
      return { success: true, activity: lastActivityPayload, sessionStartMs: ensureSessionStart() };
    }
    return { success: false, error: 'Discord RPC not ready or disabled', sessionStartMs: sessionStartMs };
  });

  ipcMain.handle('discord:status', () => {
    return {
      connected: rpcReady,
      enabled: discordEnabled,
      sessionStartMs: sessionStartMs,
      activity: lastActivityPayload
    };
  });

  ipcMain.handle('discord:enable', () => {
    discordEnabled = true;
    ensureSessionStart();
    if (rpcReady) {
      updateDiscordActivity(lastActivityPayload || { page: currentPage, locale: currentLocale });
    }
    return { success: true, sessionStartMs: sessionStartMs };
  });

  ipcMain.handle('discord:disable', () => {
    discordEnabled = false;
    if (rpcReady) {
      clearDiscordActivity();
    }
    return { success: true };
  });

  ipcMain.handle('discord:set-locale', (event, locale) => {
    currentLocale = locale || 'en';
    if (rpcReady && discordEnabled) {
      updateDiscordActivity({ ...(lastActivityPayload || {}), locale: currentLocale });
    }
    return { success: true };
  });

  ipcMain.handle('discord:set-focus-session', (event, payload = {}) => {
    const active = payload.active === true;
    currentPage = active ? 'focus' : (payload.page || 'garden');
    if (active && payload.startedAt) {
      sessionStartMs = Number(payload.startedAt) || Date.now();
    }
    if (rpcReady && discordEnabled) {
      updateDiscordActivity({
        ...(lastActivityPayload || {}),
        page: currentPage,
        details: payload.details,
        state: payload.state
      });
    }
    return { success: true, page: currentPage, sessionStartMs };
  });
}

module.exports = {
  DISCORD_STRINGS,
  initDiscordRPC,
  updateDiscordActivity,
  clearDiscordActivity,
  shutdownDiscordRPC,
  detectPageFromUrl,
  registerDiscordIpc,
  onMainWindowNavigation,
  onMainWindowReadyShow,
  onMainWindowClosed
};
