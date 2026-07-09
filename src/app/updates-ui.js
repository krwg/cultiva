import { BRANDING } from '../core/branding.js';

let getLang = () => 'en';
let initialized = false;

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

  if (icon) {
    const icons = {
      checking: '',
      available: '⬇️',
      downloading: '⬇️',
      downloaded: '✅',
      uptodate: '✓',
      error: '❌',
      browser: '⌘'
    };
    icon.textContent = icons[state] || 'ℹ️';
  }

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

function renderReleases(releases) {
  const releaseInfo = document.getElementById('release-info');
  if (!releaseInfo) { return; }

  const lang = getLang();
  const latestReleases = releases.slice(0, 3);

  releaseInfo.innerHTML = latestReleases.map((release, index) => {
    const date = new Date(release.published_at).toLocaleDateString(
      lang === 'ru' ? 'ru-RU' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );

    const isLatest = index === 0 && !release.prerelease;
    const badge = isLatest ? '<span class="release-badge latest">Latest</span>' :
      release.prerelease ? '<span class="release-badge prerelease">Pre-release</span>' : '';

    let body = release.body || 'No description';
    body = body.replace(/[#*`]/g, '').substring(0, 200);

    return `
            <div class="release-item">
                <div class="release-header">
                    <span class="release-tag">${release.name || release.tag_name}</span>
                    ${badge}
                    <span class="release-date">${date}</span>
                </div>
                <div class="release-body">
                    ${body}...
                </div>
                <button class="release-expand" onclick="window.open('${release.html_url}', '_blank')">
                    View on GitHub →
                </button>
            </div>
        `;
  }).join('');
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

export function updateUpdatesSection() {
  const versionDisplay = document.getElementById('current-version-display');
  const codenameDisplay = document.getElementById('current-codename-display');

  if (versionDisplay) {
    versionDisplay.textContent = BRANDING?.VERSION || '0.0.0';
  }
  if (codenameDisplay) {
    codenameDisplay.textContent = BRANDING?.CODENAME || 'Sequoia';
  }

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
        document.getElementById('check-updates-btn').innerHTML = `
                    <span class="btn-icon">🔄</span>
                    <span>Restart to Update</span>
                `;
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
    window.open('https://github.com/krwg/Cultiva/releases', '_blank');
  });

  void fetchReleaseInfo();
}
