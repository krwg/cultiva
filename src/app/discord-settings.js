import { TRANSLATIONS } from '../core/i18n.js';

let ctx = null;
let initialized = false;
let sessionStartTime = null;

export function configureDiscordSettings(deps) {
  ctx = deps;
}

function getPageDetails(page, locale) {
  const strings = {
    en: { garden: 'In the garden', calendar: 'Planning habits', stats: 'Reviewing progress', settings: 'Customizing', trophy: 'Trophy Garden', focus: 'Focus Mode', pages: 'Exploring Cultiva' },
    ru: { garden: 'В саду', calendar: 'Планирует', stats: 'Анализирует', settings: 'Настраивает', trophy: 'Сад трофеев', focus: 'Режим фокуса', pages: 'Изучает Cultiva' }
  };
  return strings[locale]?.[page] || strings.en[page] || 'In the garden';
}

function getPageState(page, locale) {
  const strings = {
    en: { garden: 'Growing habits', calendar: 'Browsing calendar', stats: 'Checking statistics', settings: 'Adjusting settings', trophy: 'Admiring legacy trees', focus: 'Deep work session', pages: 'Reading documentation' },
    ru: { garden: 'Выращивает привычки', calendar: 'Смотрит календарь', stats: 'Проверяет статистику', settings: 'Меняет параметры', trophy: 'Любуется деревьями', focus: 'Глубокая работа', pages: 'Читает документацию' }
  };
  return strings[locale]?.[page] || strings.en[page] || 'Growing habits';
}

function detectCurrentPage() {
  const url = window.location.href;
  if (url.includes('/calendar')) { return 'calendar'; }
  if (url.includes('/pages/')) { return 'pages'; }
  if (url.includes('settings')) { return 'settings'; }
  if (url.includes('stats')) { return 'stats'; }
  if (url.includes('trophy')) { return 'trophy'; }
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
  if (!previewTime || !sessionStartTime) { return; }
  const elapsed = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  if (hours > 0) {
    previewTime.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} elapsed`;
  } else {
    previewTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} elapsed`;
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

    if (status.connected && enabled) {
      discordStatusBadge.textContent = '●';
      discordStatusBadge.style.color = '#4caf50';
      discordStatusText.textContent = t.discordConnected || 'Connected';
      if (!sessionStartTime) { sessionStartTime = new Date(); }
    } else if (status.connected && !enabled) {
      discordStatusBadge.textContent = '○';
      discordStatusBadge.style.color = '#ff9500';
      discordStatusText.textContent = t.discordDisabled || 'Disabled';
      sessionStartTime = null;
    } else {
      discordStatusBadge.textContent = '○';
      discordStatusBadge.style.color = 'var(--text-tertiary)';
      discordStatusText.textContent = t.discordDisconnected || 'Disconnected';
      sessionStartTime = null;
    }
  } catch (err) {
    console.warn('[Discord] Status check failed:', err);
    discordStatusBadge.textContent = '○';
    discordStatusBadge.style.color = 'var(--text-tertiary)';
    discordStatusText.textContent = t.discordUnavailable || 'Unavailable';
    sessionStartTime = null;
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
      const settings = ctx?.getSettings?.() || {};

      if (window.discord) {
        if (enabled) {
          await window.discord.enable();
          sessionStartTime = new Date();
          const page = detectCurrentPage();
          const locale = settings.lang || 'en';
          await window.discord.updateActivity({ page, locale });
          updatePreviewText(getPageDetails(page, locale), getPageState(page, locale));
        } else {
          await window.discord.disable();
          sessionStartTime = null;
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
        sessionStartTime = new Date();
        const page = detectCurrentPage();
        const locale = settings.lang || 'en';
        updatePreviewText(getPageDetails(page, locale), getPageState(page, locale));
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
  const run = () => ensureDiscordSettingsInitialized();
  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 4000 });
  } else {
    setTimeout(run, 1500);
  }
}
