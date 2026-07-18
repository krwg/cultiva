import { TRANSLATIONS } from '../core/i18n.js';
import {
  getDiscordPageStrings,
  getDiscordPrefs,
  getLastDiscordPayload,
  pushDiscordPresence,
  saveDiscordPrefs
} from './discord-presence.js';

let ctx = null;
let initialized = false;
let sessionStartMs = null;

export function configureDiscordSettings(deps) {
  ctx = deps;
}

function detectCurrentPage() {
  const url = window.location.href;
  if (url.includes('/calendar')) { return 'calendar'; }
  if (url.includes('/pages/')) { return 'pages'; }
  return 'garden';
}

function updatePreviewText(details, state) {
  const previewDetails = document.getElementById('discord-preview-details');
  const previewState = document.getElementById('discord-preview-state');
  if (previewDetails) { previewDetails.textContent = details || 'In the garden'; }
  if (previewState) { previewState.textContent = state || 'Growing habits'; }
}

function updatePreviewTime() {
  const previewTime = document.getElementById('discord-preview-time');
  const prefs = getDiscordPrefs();
  if (!previewTime) { return; }
  if (prefs.showElapsed === false) {
    previewTime.hidden = true;
    return;
  }
  previewTime.hidden = false;
  if (sessionStartMs == null) { return; }
  const elapsed = Math.floor((Date.now() - sessionStartMs) / 1000);
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  if (hours > 0) {
    previewTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} elapsed`;
  } else {
    previewTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} elapsed`;
  }
}

function syncPreviewFromPayload(payload, locale) {
  if (payload?.details || payload?.state) {
    updatePreviewText(payload.details, payload.state);
    return;
  }
  const page = payload?.page || detectCurrentPage();
  const strings = getDiscordPageStrings(locale);
  const row = strings[page] || strings.garden;
  updatePreviewText(row.details, row.state);
}

function bindDiscordPrefsUi() {
  const prefs = getDiscordPrefs();
  const map = [
    ['discord-show-habits', 'showHabitCount'],
    ['discord-show-streak', 'showStreak'],
    ['discord-show-trophies', 'showTrophies'],
    ['discord-show-elapsed', 'showElapsed'],
    ['discord-show-buttons', 'showButtons'],
    ['discord-show-focus', 'showFocusOverride']
  ];
  for (const [id, key] of map) {
    const el = document.getElementById(id);
    if (!el) { continue; }
    el.checked = prefs[key] !== false;
    el.addEventListener('change', async () => {
      saveDiscordPrefs({ [key]: el.checked });
      const payload = await pushDiscordPresence();
      if (payload) {
        syncPreviewFromPayload(payload, payload.locale);
      }
      updatePreviewTime();
    });
  }

  const mode = document.getElementById('discord-display-mode');
  if (mode) {
    mode.value = prefs.displayMode || 'activity';
    mode.addEventListener('change', async () => {
      saveDiscordPrefs({ displayMode: mode.value });
      const payload = await pushDiscordPresence();
      if (payload) {
        syncPreviewFromPayload(payload, payload.locale);
      }
    });
  }

  const image = document.getElementById('discord-image-style');
  if (image) {
    image.value = prefs.imageStyle || 'auto';
    image.addEventListener('change', async () => {
      saveDiscordPrefs({ imageStyle: image.value });
      await pushDiscordPresence();
    });
  }

  const details = document.getElementById('discord-custom-details');
  const state = document.getElementById('discord-custom-state');
  if (details) {
    details.value = prefs.customDetails || '';
    details.addEventListener('change', async () => {
      saveDiscordPrefs({ customDetails: details.value });
      const payload = await pushDiscordPresence();
      if (payload) {
        syncPreviewFromPayload(payload, payload.locale);
      }
    });
  }
  if (state) {
    state.value = prefs.customState || '';
    state.addEventListener('change', async () => {
      saveDiscordPrefs({ customState: state.value });
      const payload = await pushDiscordPresence();
      if (payload) {
        syncPreviewFromPayload(payload, payload.locale);
      }
    });
  }
}

async function checkDiscordStatus() {
  const discordToggle = document.getElementById('toggle-discord');
  const discordStatusBadge = document.getElementById('discord-status-badge');
  const discordStatusText = document.getElementById('discord-status-text');
  const settings = ctx?.getSettings?.() || {};
  const t = TRANSLATIONS[settings.lang] || TRANSLATIONS.en;

  if (!window.discord) { return; }
  try {
    const status = await window.discord.getStatus();
    const enabled = discordToggle?.checked || false;

    if (typeof status.sessionStartMs === 'number' && status.sessionStartMs > 0) {
      sessionStartMs = status.sessionStartMs;
    }

    if (status.connected && enabled) {
      discordStatusBadge.textContent = '●';
      discordStatusBadge.style.color = '#4caf50';
      discordStatusText.textContent = t.discordConnected || 'Connected';
      if (sessionStartMs == null) { sessionStartMs = Date.now(); }
      syncPreviewFromPayload(status.activity || getLastDiscordPayload(), settings.lang || 'en');
    } else if (status.connected && !enabled) {
      discordStatusBadge.textContent = '○';
      discordStatusBadge.style.color = '#ff9500';
      discordStatusText.textContent = t.discordDisabled || 'Disabled';
    } else {
      discordStatusBadge.textContent = '○';
      discordStatusBadge.style.color = 'var(--text-tertiary)';
      discordStatusText.textContent = t.discordDisconnected || 'Disconnected';
    }
  } catch (err) {
    console.warn('[Discord] Status check failed:', err);
    discordStatusBadge.textContent = '○';
    discordStatusBadge.style.color = 'var(--text-tertiary)';
    discordStatusText.textContent = t.discordUnavailable || 'Unavailable';
  }
}

export function prepareDiscordSettingsSection() {
  const isElectron = typeof window.discord !== 'undefined';
  const discordSection = document.querySelector('[data-section="discord"]');
  const discordContent = document.getElementById('section-discord');

  if (!isElectron) {
    if (discordSection) { discordSection.style.display = 'none'; }
    if (discordContent) { discordContent.style.display = 'none'; }
  }
}

export function ensureDiscordSettingsInitialized() {
  if (initialized || typeof window.discord === 'undefined') {
    return;
  }
  initialized = true;

  const discordToggle = document.getElementById('toggle-discord');
  const discordContent = document.getElementById('section-discord');
  const previewTime = document.getElementById('discord-preview-time');

  const savedEnabled = localStorage.getItem('cultiva-discord-enabled') !== 'false';
  if (discordToggle) { discordToggle.checked = savedEnabled; }

  bindDiscordPrefsUi();

  if (discordToggle) {
    discordToggle.addEventListener('change', async (e) => {
      const enabled = e.target.checked;
      localStorage.setItem('cultiva-discord-enabled', enabled);

      if (window.discord) {
        if (enabled) {
          const res = await window.discord.enable();
          if (typeof res?.sessionStartMs === 'number') {
            sessionStartMs = res.sessionStartMs;
          } else if (sessionStartMs == null) {
            sessionStartMs = Date.now();
          }
          const payload = await pushDiscordPresence();
          if (payload) {
            syncPreviewFromPayload(payload, payload.locale);
          }
        } else {
          await window.discord.disable();
          updatePreviewText('Rich Presence', 'Disabled');
          if (previewTime) { previewTime.textContent = '--:--'; }
        }
        await checkDiscordStatus();
      }
    });
  }

  window.setInterval(() => {
    if (discordContent?.classList.contains('active')) {
      void checkDiscordStatus();
      updatePreviewTime();
    }
  }, 2000);

  const discordSidebarItem = document.querySelector('[data-section="discord"]');
  if (discordSidebarItem) {
    discordSidebarItem.addEventListener('click', () => {
      void checkDiscordStatus();
      const settings = ctx?.getSettings?.() || {};
      if (discordToggle?.checked) {
        const payload = getLastDiscordPayload();
        syncPreviewFromPayload(payload, settings.lang || 'en');
      }
    });
  }

  window.updateDiscordPreview = updatePreviewText;
  window.checkDiscordStatus = checkDiscordStatus;
}

export function scheduleDiscordWarmup() {
  if (typeof window.discord === 'undefined') {
    return;
  }
  const run = () => {
    ensureDiscordSettingsInitialized();
    void pushDiscordPresence();
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 4000 });
  } else {
    setTimeout(run, 1500);
  }
}
