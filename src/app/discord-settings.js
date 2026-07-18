import { TRANSLATIONS } from '../core/i18n.js';
import {
  getDiscordPageStrings,
  getLastDiscordPayload,
  pushDiscordPresence
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
  if (!previewTime || sessionStartMs == null) { return; }
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
