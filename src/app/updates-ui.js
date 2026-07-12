import { BRANDING } from '../core/branding.js';
import { renderReleaseMarkdown } from '../core/release-markdown.js';
import { CHECK_UPDATES_ICON, setSvgIcon, UPDATE_STATUS_ICONS } from '../core/ui-icons.js';
import { installFocusTrap, releaseFocusTrap } from './modals.js';

let getLang = () => 'en';
let initialized = false;
let cachedReleases = [];

const updateStatus = {
  state: 'checking',
  message: '',
  progress: 0,
  version: null
};

export function configureUpdatesUi(deps) {
  getLang = deps.getLang || getLang;
}

function updateStatusCard(state, title, message) {
  updateStatus.state = state;

  const card = document.getElementById('update-status-card');
  const icon = document.getElementById('update-status-icon');
  const titleEl = document.getElementById('update-status-title');
  const messageEl = document.getElementById('update-status-message');

  if (card) {
    card.className = 'update-status-card ' + state;
  }

  setSvgIcon(icon, UPDATE_STATUS_ICONS[state] || UPDATE_STATUS_ICONS.info);

  if (titleEl) { titleEl.textContent = title; }
  if (messageEl) { messageEl.textContent = message; }

  const progressEl = document.getElementById('update-progress');
  if (progressEl) {
    progressEl.style.display = state === 'downloading' ? 'block' : 'none';
  }
}

function updateDownloadProgress(percent) {
  const progressBar = document.getElementById('update-progress-bar');
  const progressText = document.getElementById('update-progress-text');

  if (progressBar) {
    progressBar.style.width = percent + '%';
  }
  if (progressText) {
    progressText.textContent = `Downloading... ${percent}%`;
  }
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function closeReleaseDetail() {
  const overlay = document.getElementById('release-detail-overlay');
  if (overlay) {
    releaseFocusTrap();
    overlay.remove();
  }
}

function openReleaseDetail(release) {
  closeReleaseDetail();

  const lang = getLang();
  const date = new Date(release.published_at).toLocaleDateString(
    lang === 'ru' ? 'ru-RU' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const overlay = document.createElement('div');
  overlay.id = 'release-detail-overlay';
  overlay.className = 'release-detail-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  const sheet = document.createElement('div');
  sheet.className = 'release-detail-sheet';

  const header = document.createElement('div');
  header.className = 'release-detail-header';
  header.innerHTML = `
    <div class="release-detail-title">${escapeHtml(release.name || release.tag_name)}</div>
    <button type="button" class="release-detail-close" aria-label="Close">&times;</button>
  `;

  const body = document.createElement('div');
  body.className = 'release-detail-body';
  body.innerHTML = `
    <div class="release-detail-meta">
      <span>${escapeHtml(date)}</span>
      ${release.prerelease ? '<span class="release-badge prerelease">Pre-release</span>' : ''}
      <a href="${escapeHtml(release.html_url)}" target="_blank" rel="noopener noreferrer">GitHub →</a>
    </div>
    ${renderReleaseMarkdown(release.body || '')}
  `;

  sheet.appendChild(header);
  sheet.appendChild(body);
  overlay.appendChild(sheet);
  document.body.appendChild(overlay);
  installFocusTrap(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeReleaseDetail();
    }
  });
  header.querySelector('.release-detail-close')?.addEventListener('click', closeReleaseDetail);
  document.addEventListener('keydown', function onEsc(e) {
    if (e.key === 'Escape') {
      closeReleaseDetail();
      document.removeEventListener('keydown', onEsc);
    }
  });
}

function releasePreview(body) {
  const plain = String(body || 'No description')
    .replace(/<img\b[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*`>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 160 ? `${plain.slice(0, 160)}…` : plain;
}

function renderReleases(releases) {
  const releaseInfo = document.getElementById('release-info');
  if (!releaseInfo) { return; }

  cachedReleases = releases;
  const lang = getLang();
  const list = releases.slice(0, 12);

  releaseInfo.replaceChildren();

  if (!list.length) {
    releaseInfo.innerHTML = '<div class="release-loading">No releases found</div>';
    return;
  }

  list.forEach((release, index) => {
    const date = new Date(release.published_at).toLocaleDateString(
      lang === 'ru' ? 'ru-RU' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );

    const isLatest = index === 0 && !release.prerelease;
    const item = document.createElement('div');
    item.className = 'release-item';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');

    const header = document.createElement('div');
    header.className = 'release-header';
    header.innerHTML = `
      <span class="release-tag">${escapeHtml(release.name || release.tag_name)}</span>
      ${isLatest ? '<span class="release-badge latest">Latest</span>' : release.prerelease ? '<span class="release-badge prerelease">Pre-release</span>' : ''}
      <span class="release-date">${escapeHtml(date)}</span>
    `;

    const body = document.createElement('div');
    body.className = 'release-body';
    body.textContent = releasePreview(release.body);

    const hint = document.createElement('button');
    hint.type = 'button';
    hint.className = 'release-expand';
    hint.textContent = lang === 'ru' ? 'Что нового →' : 'What\'s new →';

    const open = () => openReleaseDetail(release);
    item.addEventListener('click', open);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
    hint.addEventListener('click', (e) => {
      e.stopPropagation();
      open();
    });

    item.appendChild(header);
    item.appendChild(body);
    item.appendChild(hint);
    releaseInfo.appendChild(item);
  });
}

async function fetchReleaseInfo() {
  const releaseInfo = document.getElementById('release-info');
  if (!releaseInfo) { return; }

  const cached = localStorage.getItem('cultiva-releases-cache');
  const cacheTime = localStorage.getItem('cultiva-releases-cache-time');

  if (cached && cacheTime && (Date.now() - parseInt(cacheTime, 10)) < 3600000) {
    renderReleases(JSON.parse(cached));
    return;
  }

  try {
    const response = await fetch('https://api.github.com/repos/krwg/Cultiva/releases');

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const releases = await response.json();

    if (!Array.isArray(releases) || releases.length === 0) {
      releaseInfo.innerHTML = '<div class="release-loading">No releases found</div>';
      return;
    }

    localStorage.setItem('cultiva-releases-cache', JSON.stringify(releases));
    localStorage.setItem('cultiva-releases-cache-time', Date.now().toString());

    renderReleases(releases);
  } catch (error) {
    console.error('Failed to fetch releases:', error);

    if (cached) {
      renderReleases(JSON.parse(cached));
      return;
    }

    releaseInfo.innerHTML = `
            <div class="release-loading">
                Failed to load releases<br>
                <a href="#" onclick="window.open('https://github.com/krwg/Cultiva/releases', '_blank'); return false;" style="color: var(--accent-blue);">
                    View on GitHub →
                </a>
            </div>
        `;
  }
}

function setCheckUpdatesButtonRestartMode() {
  const btn = document.getElementById('check-updates-btn');
  if (!btn) {
    return;
  }
  btn.replaceChildren();
  const icon = document.createElement('span');
  icon.className = 'btn-icon ui-icon';
  setSvgIcon(icon, CHECK_UPDATES_ICON);
  const label = document.createElement('span');
  label.textContent = 'Restart to Update';
  btn.appendChild(icon);
  btn.appendChild(label);
}

export function updateUpdatesSection() {
  const versionDisplay = document.getElementById('current-version-display');
  const codenameDisplay = document.getElementById('current-codename-display');

  if (versionDisplay) {
    versionDisplay.textContent = BRANDING?.VERSION || '0.0.0';
  }
  if (codenameDisplay) {
    codenameDisplay.textContent = BRANDING?.CODENAME || 'Sequoia';
  }

  setSvgIcon(document.getElementById('check-updates-icon'), CHECK_UPDATES_ICON);
  setSvgIcon(document.getElementById('update-status-icon'), UPDATE_STATUS_ICONS.uptodate);

  const isElectron = typeof window.electron !== 'undefined';
  if (!isElectron) {
    updateStatusCard('browser', 'Browser mode', 'Updates only available in desktop app');
    document.getElementById('check-updates-btn')?.setAttribute('disabled', 'disabled');
    void fetchReleaseInfo();
    return;
  }

  if (initialized) {
    void fetchReleaseInfo();
    return;
  }
  initialized = true;

  if (window.electron.onUpdateMessage) {
    window.electron.onUpdateMessage((message) => {
      console.log('[Updater]', message);

      if (message.includes('Checking for updates')) {
        updateStatusCard('checking', 'Checking...', message);
      } else if (message.includes('Update') && message.includes('found')) {
        const versionMatch = message.match(/(\d+\.\d+\.\d+)/);
        updateStatus.version = versionMatch ? versionMatch[1] : null;
        updateStatusCard('available', 'Update available', message);
      } else if (message.includes('Downloading')) {
        updateStatusCard('downloading', 'Downloading update', message);
      } else if (message.includes('Download progress')) {
        const percentMatch = message.match(/Downloaded (\d+)%/);
        if (percentMatch) {
          updateStatus.progress = parseInt(percentMatch[1], 10);
          updateDownloadProgress(updateStatus.progress);
        }
      } else if (message.includes('downloaded')) {
        updateStatusCard('downloaded', 'Update ready', message);
        setCheckUpdatesButtonRestartMode();
      } else if (message.includes('latest version')) {
        updateStatusCard('uptodate', 'Up to date', message);
      } else if (message.includes('error')) {
        updateStatusCard('error', 'Update error', message);
      } else {
        updateStatusCard('info', 'Update status', message);
      }
    });
  }

  document.getElementById('check-updates-btn')?.addEventListener('click', () => {
    if (updateStatus.state === 'downloaded') {
      window.electron.restartApp?.();
    } else {
      window.electron.checkForUpdates?.();
      updateStatusCard('checking', 'Checking for updates...', 'Contacting GitHub...');
    }
  });

  document.getElementById('view-releases-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (cachedReleases.length) {
      openReleaseDetail(cachedReleases[0]);
      return;
    }
    window.open('https://github.com/krwg/Cultiva/releases', '_blank');
  });

  void fetchReleaseInfo();
}
