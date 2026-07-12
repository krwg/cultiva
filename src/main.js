import { auth } from './modules/auth.js';
import { TRANSLATIONS } from './core/i18n.js';
import './styles/main.css';
import { BRANDING } from './core/branding.js';
import { storage } from './modules/storage.js';
import { habits } from './modules/habits.js';
import { renderPluginHeaderItems } from './app/plugins-ui.js';
import { initNativeNotificationsScheduler } from './core/native-notifications.js';
import { getCultivaTimezone } from './core/timezone.js';
import {
  applyAmbientBackground,
  saveCustomBackgroundFromFile,
  clearCustomBackground,
  readCustomBackgroundDataUrl
} from './core/ambient-bg.js';
import { settings, ensureAppReady } from './app/renderer-bootstrap.js';
import {
  configureModals,
  openModal,
  closeModal,
  closeTopModal as closeTopmostModal,
  isModalOpen,
  openQuantityLogModal,
  completeQuantityLogWithValue
} from './app/modals.js';
import { applyBranding, showNotification } from './app/ui-shell.js';
import {
  configureSettingsController,
  loadSettings,
  saveSettings,
  applySettings,
  updateNotificationsDesktopBanner
} from './app/settings-controller.js';
import { initHotkeys } from './app/hotkeys.js';
import { initContextMenu } from './app/context-menu.js';
import { applyAccentColor, applyAmbientIntensity } from './core/customization.js';
import { configureGardenController, renderGarden, getFocusedHabit, bindGardenCardEvents, openStats, moveFocusedHabit } from './app/garden-controller.js';
import { configureBackupUi, bindBackupUiEvents } from './app/backup-ui.js';
import { toggleHabitWithHooks } from './app/habit-actions.js';
import { getTodayStr } from './app/date-ui.js';
import { initAutoBackup } from './app/auto-backup.js';
import { AVATAR_BACKGROUNDS, AVATAR_EMOJIS, DEFAULT_AVATAR } from './core/avatar-presets.js';
import { showAlertDialog, showConfirmDialog } from './app/dialogs.js';
import { initTooltipManager } from './app/tooltip-manager.js';
import { configureUpdatesUi, updateUpdatesSection } from './app/updates-ui.js';
import {
  configureDiscordSettings,
  prepareDiscordSettingsSection,
  ensureDiscordSettingsInitialized,
  scheduleDiscordWarmup
} from './app/discord-settings.js';

let currentLang = 'en';
let currentT = TRANSLATIONS.en;
let habitSearchQuery = '';
let focusedHabitId = null;

const gardenEl = document.getElementById('garden-container');
const trophyEl = document.getElementById('trophy-container');
const countEl = document.getElementById('habit-count');
const trophyCountEl = document.getElementById('trophy-count');
const addModal = document.getElementById('add-modal');
const statsModal = document.getElementById('stats-modal');
const settingsModal = document.getElementById('settings-modal');
const habitForm = document.getElementById('habit-form');
const targetContainer = document.getElementById('target-container');
const loadingScreen = document.getElementById('loading-screen');
const userMenuBtn = document.getElementById('user-menu-btn');
const userDropdown = document.getElementById('user-dropdown');
const langSelect = document.getElementById('lang-select');
const themeSelect = document.getElementById('theme-select');
const trophyToggle = document.getElementById('toggle-trophies');
const focusToggle = document.getElementById('toggle-focus');
const quantityLogModal = document.getElementById('quantity-log-modal');
const quantityLogInput = document.getElementById('quantity-log-input');
const quantityLogTitle = document.getElementById('quantity-log-title');
const quantityLogDesc = document.getElementById('quantity-log-desc');
const quantityLogLabel = document.getElementById('quantity-log-label');

configureModals({
  quantityLogModal,
  quantityLogInput,
  quantityLogTitle,
  quantityLogDesc,
  quantityLogLabel
});

configureSettingsController({
  langSelect,
  themeSelect,
  trophyToggle,
  focusToggle,
  setLangAndT(lang) {
    currentLang = lang;
    currentT = TRANSLATIONS[lang] || TRANSLATIONS.en;
  },
  renderHeaderAvatar,
  renderGarden
});

configureGardenController({
  get settings() { return settings; },
  get habitSearchQuery() { return habitSearchQuery; },
  get focusedHabitId() { return focusedHabitId; },
  setFocusedHabitId(id) { focusedHabitId = id; },
  gardenEl,
  trophyEl,
  countEl,
  trophyCountEl,
  addModal,
  statsModal
});

configureBackupUi({
  get settings() { return settings; }
});

configureUpdatesUi({
  getLang: () => settings.lang || currentLang
});

configureDiscordSettings({
  getSettings: () => settings
});

prepareDiscordSettingsSection();

let tempAvatar = { ...settings.avatar };

langSelect?.addEventListener('change', (e) => { settings.lang = e.target.value; saveSettings(); });
themeSelect?.addEventListener('change', (e) => { settings.theme = e.target.value; saveSettings(); });
trophyToggle?.addEventListener('change', (e) => { settings.showTrophies = e.target.checked; saveSettings(); });
focusToggle?.addEventListener('change', (e) => { settings.focusMode = e.target.checked; saveSettings(); });
document.getElementById('toggle-streak-grace')?.addEventListener('change', (e) => {
  settings.streakGraceEnabled = e.target.checked;
  void habits.recalculateAllStreaks();
  saveSettings();
});

const tzSelect = document.getElementById('tz-select');
if (tzSelect) {
  tzSelect.value = localStorage.getItem('cultiva-timezone') || 'auto';
  tzSelect.addEventListener('change', (e) => {
    localStorage.setItem('cultiva-timezone', e.target.value);
    if (typeof renderGarden === 'function') { renderGarden(); }
  });
}

const timeFormatSelect = document.getElementById('time-format-select');
if (timeFormatSelect) {
  timeFormatSelect.value = localStorage.getItem('cultiva-time-format') || 'auto';
  timeFormatSelect.addEventListener('change', (e) => {
    localStorage.setItem('cultiva-time-format', e.target.value);
  });
}

const nativeHabitsHourSelect = document.getElementById('native-notify-habits-hour');
if (nativeHabitsHourSelect && nativeHabitsHourSelect.options.length === 0) {
  for (let h = 0; h < 24; h += 1) {
    const o = document.createElement('option');
    o.value = String(h);
    o.textContent = `${String(h).padStart(2, '0')}:00`;
    nativeHabitsHourSelect.appendChild(o);
  }
}

document.getElementById('toggle-native-notify-habits')?.addEventListener('change', (e) => {
  settings.nativeNotifyHabits = e.target.checked;
  saveSettings();
});
nativeHabitsHourSelect?.addEventListener('change', (e) => {
  const h = parseInt(e.target.value, 10);
  settings.nativeNotifyHabitsHour = Number.isNaN(h) ? 9 : Math.max(0, Math.min(23, h));
  saveSettings();
});
document.getElementById('toggle-native-notify-calendar')?.addEventListener('change', (e) => {
  settings.nativeNotifyCalendar = e.target.checked;
  saveSettings();
});
document.getElementById('native-notify-calendar-lead')?.addEventListener('change', (e) => {
  const m = parseInt(e.target.value, 10);
  settings.nativeNotifyCalendarLeadMinutes = Number.isNaN(m) ? 30 : Math.max(5, Math.min(120, m));
  saveSettings();
});
document.getElementById('toggle-native-notify-master')?.addEventListener('change', (e) => {
  settings.nativeNotifyEnabled = e.target.checked;
  saveSettings();
});

function updateCultivaDatePreview() {
  const preview = document.getElementById('cultiva-date-preview');
  if (!preview) { return; }

  const t = TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
  const tz = getCultivaTimezone();
  const locale = settings.lang === 'ru' ? 'ru-RU' : (settings.lang === 'en' ? 'en-US' : navigator.language);
  const now = new Date();
  const formatted = new Intl.DateTimeFormat(locale, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: tz || undefined
  }).format(now);

  preview.textContent = `${formatted} (${tz || t.timezoneSystem})`;
}

if (tzSelect) {
  tzSelect.addEventListener('change', () => {
    localStorage.setItem('cultiva-timezone', tzSelect.value);
    updateCultivaDatePreview();
    if (typeof renderGarden === 'function') { renderGarden(); }
  });
}

const bgSelect = document.getElementById('bg-select');
const customBgInput = document.getElementById('custom-bg-input');
const customBgChoose = document.getElementById('custom-bg-choose');
const customBgClear = document.getElementById('custom-bg-clear');

let lastBgSelectValue = 'none';
let pendingCustomPicker = false;

function commitBackground(bg) {
  lastBgSelectValue = bg;
  try {
    localStorage.setItem('cultiva-background', bg);
  } catch (e) {
    console.warn('[Background] Could not persist selection', e);
  }
  applyBackground(bg);
}

function applyBackground(bg) {
  let choice = bg;
  if (choice === 'custom' && !readCustomBackgroundDataUrl()) {
    choice = 'none';
  }
  applyAmbientBackground(document, document.body, choice);
}

let savedBg = localStorage.getItem('cultiva-background') || 'none';
if (savedBg === 'custom' && !readCustomBackgroundDataUrl()) {
  savedBg = 'none';
  localStorage.setItem('cultiva-background', 'none');
}
lastBgSelectValue = savedBg;
if (bgSelect) { bgSelect.value = savedBg; }
applyBackground(savedBg);

bgSelect?.addEventListener('change', (e) => {
  const bg = e.target.value;
  if (bg === 'custom' && !readCustomBackgroundDataUrl()) {
    pendingCustomPicker = true;
    customBgInput?.click();
    return;
  }
  commitBackground(bg);
});

customBgChoose?.addEventListener('click', () => {
  customBgInput?.click();
});

customBgInput?.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) {
    if (pendingCustomPicker) {
      if (bgSelect) { bgSelect.value = lastBgSelectValue; }
      pendingCustomPicker = false;
    }
    return;
  }
  try {
    await saveCustomBackgroundFromFile(file);
    pendingCustomPicker = false;
    if (bgSelect) { bgSelect.value = 'custom'; }
    commitBackground('custom');
  } catch (err) {
    const msg = err && err.message ? err.message : 'Could not use image';
    showNotification('', msg);
    if (pendingCustomPicker) {
      if (bgSelect) { bgSelect.value = lastBgSelectValue; }
      pendingCustomPicker = false;
    }
  }
});

customBgClear?.addEventListener('click', () => {
  clearCustomBackground();
  if (bgSelect?.value === 'custom') {
    if (bgSelect) { bgSelect.value = 'none'; }
    commitBackground('none');
    return;
  }
  applyBackground(bgSelect?.value || lastBgSelectValue);
});

function initSettingsNavigation() {
  const sidebarItems = document.querySelectorAll('.settings-sidebar-item[data-section]');
  const emptyState = document.getElementById('settings-empty');

  if (!sidebarItems.length) { return; }

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;

      if (item.classList.contains('settings-sidebar-disabled')) {
        showNotification(currentT.comingSoon || 'Coming soon...');
        return;
      }

      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      if (emptyState) { emptyState.style.display = 'none'; }

      document.querySelectorAll('.settings-section-content').forEach(content => {
        content.classList.remove('active');
      });

      const targetSection = document.getElementById(`section-${section}`);
      if (targetSection) { targetSection.classList.add('active'); }

      if (section === 'profile') { updateProfileSection(); }
      if (section === 'plugins') {
        import('./app/plugins-ui.js').then((m) => m.renderPluginsSection());
      }
      if (section === 'notifications') { updateNotificationsDesktopBanner(); }
      if (section === 'statistics') {
        import('./app/stats-dashboard-ui.js').then((m) => m.renderStatsDashboard(settings.lang));
      }
      if (section === 'discord') {
        ensureDiscordSettingsInitialized();
      }
    });
  });

  document.getElementById('settings-open-avatar-picker')?.addEventListener('click', () => {
    closeModal(settingsModal);
    setTimeout(() => openModal(document.getElementById('avatar-modal')), 300);
  });

  document.querySelector('[data-section="updates"]')?.addEventListener('click', () => {
    updateUpdatesSection();
  });

  document.getElementById('close-settings')?.addEventListener('click', () => {
    setTimeout(() => {
      const firstItem = document.querySelector('.settings-sidebar-item[data-section="profile"]');
      if (firstItem) {
        sidebarItems.forEach(i => i.classList.remove('active'));
        firstItem.classList.add('active');

        document.querySelectorAll('.settings-section-content').forEach(c => c.classList.remove('active'));
        document.getElementById('section-profile')?.classList.add('active');

        if (emptyState) { emptyState.style.display = 'none'; }
      }
    }, 300);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsModal?.classList.contains('active')) {
      document.getElementById('close-settings')?.click();
    }
  });
}

function updateProfileSection() {
  const isLoggedIn = auth.isAuthenticated();
  const user = auth.getCurrentUser();
  const t = currentT;

  const avatarEmoji = document.getElementById('settings-avatar-emoji');
  const avatarImg = document.getElementById('settings-avatar-img');
  const avatarContainer = document.getElementById('settings-profile-avatar');

  if (avatarContainer) {
    if (settings.avatar?.photo) {
      if (avatarImg) { avatarImg.src = settings.avatar.photo; avatarImg.style.display = 'block'; }
      if (avatarEmoji) { avatarEmoji.style.display = 'none'; }
      avatarContainer.style.background = 'transparent';
    } else {
      if (avatarImg) { avatarImg.style.display = 'none'; }
      if (avatarEmoji) { avatarEmoji.style.display = 'flex'; avatarEmoji.textContent = settings.avatar?.emoji || '🌱'; }

      const bg = AVATAR_BACKGROUNDS.find(b => b.id === settings.avatar?.background);
      avatarContainer.style.background = (bg && bg.id !== 'none') ? bg.css : 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))';
    }
  }

  const profileName = document.getElementById('settings-profile-name');
  const profileEmail = document.getElementById('settings-profile-email');

  if (isLoggedIn && user) {
    if (profileName) { profileName.textContent = user.name || user.email?.split('@')[0] || 'User'; }
    if (profileEmail) { profileEmail.textContent = user.email || ''; }
  } else {
    if (profileName) { profileName.textContent = t.guestUser || 'Guest User'; }
    if (profileEmail) { profileEmail.textContent = t.localStorage || 'Local Storage'; }
  }

  const accountStatus = document.getElementById('profile-account-status');
  const statusBadge = document.getElementById('profile-status-badge');

  if (isLoggedIn) {
    if (accountStatus) { accountStatus.textContent = t.accountActive || 'Account Active'; }
    if (statusBadge) { statusBadge.textContent = t.active || 'Active'; statusBadge.classList.add('online'); }
  } else {
    if (accountStatus) { accountStatus.textContent = t.localStorageMode || 'Local Storage Mode'; }
    if (statusBadge) { statusBadge.textContent = t.guest || 'Guest'; statusBadge.classList.remove('online'); }
  }

  const editProfileBtn = document.getElementById('settings-edit-profile');
  if (editProfileBtn) { editProfileBtn.style.display = isLoggedIn ? 'flex' : 'none'; }

  const memberSinceRow = document.getElementById('profile-member-since');
  const memberDate = document.getElementById('profile-member-date');

  if (isLoggedIn && user?.createdAt) {
    if (memberSinceRow) { memberSinceRow.style.display = 'flex'; }
    if (memberDate) {
      const date = new Date(user.createdAt);
      memberDate.textContent = date.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  } else {
    if (memberSinceRow) { memberSinceRow.style.display = 'none'; }
  }
}

const editProfileModal = document.getElementById('edit-profile-modal');
const editProfileForm = document.getElementById('edit-profile-form');
const editProfileError = document.getElementById('edit-profile-error');

function initProfileManagement() {
  document.getElementById('settings-edit-profile')?.addEventListener('click', () => {
    const user = auth.getCurrentUser();
    if (!user) { return; }

    document.getElementById('edit-display-name').value = user.name || '';
    document.getElementById('edit-email').value = user.email || '';
    document.getElementById('edit-dob').value = user.dob || '';
    document.getElementById('edit-new-password').value = '';
    document.getElementById('edit-confirm-password').value = '';
    if (editProfileError) { editProfileError.style.display = 'none'; }

    closeModal(settingsModal);
    setTimeout(() => openModal(editProfileModal), 300);
  });

  document.getElementById('edit-profile-cancel')?.addEventListener('click', () => {
    closeModal(editProfileModal);
    setTimeout(() => openModal(settingsModal), 300);
  });

  editProfileModal?.querySelector('.modal-close')?.addEventListener('click', () => {
    closeModal(editProfileModal);
    setTimeout(() => openModal(settingsModal), 300);
  });

  editProfileModal?.querySelector('.modal-overlay')?.addEventListener('click', () => {
    closeModal(editProfileModal);
    setTimeout(() => openModal(settingsModal), 300);
  });

  editProfileForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (editProfileError) { editProfileError.style.display = 'none'; }

    const displayName = document.getElementById('edit-display-name').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const dob = document.getElementById('edit-dob').value;
    const newPassword = document.getElementById('edit-new-password').value;
    const confirmPassword = document.getElementById('edit-confirm-password').value;

    if (!displayName) { editProfileError.textContent = currentT.nameRequired || 'Display name is required'; editProfileError.style.display = 'block'; return; }
    if (!email) { editProfileError.textContent = currentT.emailRequired || 'Email is required'; editProfileError.style.display = 'block'; return; }
    if (newPassword && newPassword !== confirmPassword) { editProfileError.textContent = currentT.passwordsMismatch || 'Passwords do not match'; editProfileError.style.display = 'block'; return; }
    if (newPassword && newPassword.length < 6) { editProfileError.textContent = currentT.passwordTooShort || 'Password must be at least 6 characters'; editProfileError.style.display = 'block'; return; }

    try {
      const updates = { name: displayName, email: email, dob: dob || null };
      if (newPassword) {
        await auth.changePassword(newPassword);
      }
      await auth.updateProfile(updates);
      await updateAuthUI();
      updateProfileSection();

      closeModal(editProfileModal);
      setTimeout(() => openModal(settingsModal), 300);

      showNotification(currentT.profileUpdated || 'Profile updated successfully');
    } catch (err) {
      if (editProfileError) { editProfileError.textContent = err.message || 'Failed to update profile'; editProfileError.style.display = 'block'; }
    }
  });

  document.getElementById('sign-out-from-profile')?.addEventListener('click', async () => {
    if (await showConfirmDialog(currentT.confirmSignOut || 'Sign out of your account?', {
      title: currentT.signOut || 'Sign Out',
      confirmText: currentT.signOut || 'Sign Out',
      cancelText: currentT.cancel || 'Cancel'
    })) {
      await auth.logout();
      await updateAuthUI();
      updateProfileSection();
      renderGarden();
      closeModal(editProfileModal);
      showNotification(currentT.signedOut || 'Signed out successfully');
    }
  });
}

function toggleUserMenu() {
  const isActive = userDropdown.classList.toggle('active');
  userMenuBtn.setAttribute('aria-expanded', isActive);
}

function closeUserMenu() {
  userDropdown.classList.remove('active');
  userMenuBtn.setAttribute('aria-expanded', 'false');
}

userMenuBtn?.addEventListener('click', (e) => { e.stopPropagation(); toggleUserMenu(); });
document.addEventListener('click', (e) => {
  if (userDropdown && !userDropdown.contains(e.target) && !userMenuBtn.contains(e.target)) { closeUserMenu(); }
});
document.getElementById('open-settings')?.addEventListener('click', () => { openModal(settingsModal); closeUserMenu(); });

function renderHeaderAvatar() {
  const headerAvatar = document.getElementById('header-avatar');
  const headerEmoji = document.getElementById('header-avatar-emoji');
  if (!headerAvatar) { return; }
  const existingImg = headerAvatar.querySelector('img');
  if (existingImg) { existingImg.remove(); }
  if (settings.avatar.photo) {
    const img = document.createElement('img');
    img.src = settings.avatar.photo;
    img.style.cssText = 'width:100%; height:100%; object-fit:cover; border-radius:50%;';
    headerAvatar.appendChild(img);
    headerAvatar.classList.add('has-photo');
    if (headerEmoji) { headerEmoji.style.display = 'none'; }
    headerAvatar.style.backgroundImage = 'none';
    headerAvatar.style.backgroundColor = 'transparent';
    return;
  }
  headerAvatar.classList.remove('has-photo');
  if (headerEmoji) { headerEmoji.style.display = ''; }
  const bg = AVATAR_BACKGROUNDS.find(b => b.id === settings.avatar.background);
  if (bg && bg.id !== 'none') {
    headerAvatar.style.backgroundImage = bg.css;
    headerAvatar.style.backgroundColor = 'transparent';
  } else {
    headerAvatar.style.backgroundImage = 'none';
    headerAvatar.style.backgroundColor = 'var(--bg-tertiary)';
  }
  if (headerEmoji) { headerEmoji.textContent = settings.avatar.emoji; }
}

function renderAvatarPicker() {
  const bgGrid = document.getElementById('avatar-bg-grid');
  const emojiGrid = document.getElementById('avatar-emoji-grid');
  const preview = document.getElementById('avatar-preview');
  const previewEmoji = document.getElementById('preview-emoji');
  const previewImage = document.getElementById('preview-image');
  const clearPhotoBtn = document.getElementById('avatar-clear-photo');
  if (!bgGrid || !emojiGrid) { return; }
  if (tempAvatar.photo) {
    preview.classList.add('has-photo');
    previewImage.src = tempAvatar.photo;
    previewImage.style.display = 'block';
    previewEmoji.style.display = 'none';
    if (clearPhotoBtn) { clearPhotoBtn.style.display = 'inline-block'; }
  } else {
    preview.classList.remove('has-photo');
    if (previewImage) { previewImage.style.display = 'none'; }
    if (previewEmoji) { previewEmoji.style.display = ''; }
    if (clearPhotoBtn) { clearPhotoBtn.style.display = 'none'; }
    const bg = AVATAR_BACKGROUNDS.find(b => b.id === tempAvatar.background);
    if (bg && bg.id !== 'none') {
      preview.style.backgroundImage = bg.css;
      preview.style.backgroundColor = 'transparent';
    } else {
      preview.style.backgroundImage = 'none';
      preview.style.backgroundColor = 'var(--bg-tertiary)';
    }
    if (previewEmoji) { previewEmoji.textContent = tempAvatar.emoji; }
  }
  bgGrid.innerHTML = AVATAR_BACKGROUNDS.map(bg => `
        <button class="avatar-option ${tempAvatar.background === bg.id && !tempAvatar.photo ? 'selected' : ''} ${bg.id === 'none' ? 'bg-none' : ''}"
                data-bg="${bg.id}" style="${bg.id !== 'none' ? `background: ${bg.css};` : ''}" title="${bg.name || bg.id}"></button>
    `).join('');
  emojiGrid.innerHTML = AVATAR_EMOJIS.map(emoji => `
        <button class="avatar-option ${tempAvatar.emoji === emoji && !tempAvatar.photo ? 'selected' : ''}" data-emoji="${emoji}">${emoji}</button>
    `).join('');
}

function initAvatarPicker() {
  const modal = document.getElementById('avatar-modal');
  const openBtn = document.getElementById('open-avatar-picker');
  const saveBtn = document.getElementById('avatar-save');
  const resetBtn = document.getElementById('avatar-reset');
  const uploadInput = document.getElementById('avatar-upload');
  const clearPhotoBtn = document.getElementById('avatar-clear-photo');

  if (!modal || !openBtn) { return; }

  openBtn.addEventListener('click', () => {
    tempAvatar = { ...settings.avatar };
    renderAvatarPicker();
    openModal(modal);
    closeUserMenu();
  });

  modal.addEventListener('click', (e) => {
    const bgBtn = e.target.closest('[data-bg]');
    const emojiBtn = e.target.closest('[data-emoji]');
    if (bgBtn) { tempAvatar.background = bgBtn.dataset.bg; tempAvatar.photo = null; renderAvatarPicker(); }
    if (emojiBtn) { tempAvatar.emoji = emojiBtn.dataset.emoji; tempAvatar.photo = null; renderAvatarPicker(); }
  });

  uploadInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) { return; }
    if (file.size > 2 * 1024 * 1024) {
      showAlertDialog('Image is too large. Max 2MB.', { title: 'Avatar' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => { tempAvatar.photo = ev.target.result; tempAvatar.background = 'none'; renderAvatarPicker(); };
    reader.readAsDataURL(file);
  });

  clearPhotoBtn?.addEventListener('click', () => {
    tempAvatar.photo = null; tempAvatar.background = 'green';
    uploadInput.value = '';
    renderAvatarPicker();
  });

  saveBtn?.addEventListener('click', async () => {
    const newAvatar = {
      background: tempAvatar.background,
      emoji: tempAvatar.emoji,
      photo: tempAvatar.photo || null
    };

    if (await auth.isAuthenticated()) {
      await auth.updateProfile({ avatar: newAvatar });
    } else {
      settings.avatar = newAvatar;
      storage.set('cultiva-settings', settings);
    }

    settings.avatar = newAvatar;
    applySettings();
    closeModal(modal);
    showNotification('Avatar updated!');
  });

  resetBtn?.addEventListener('click', () => {
    tempAvatar = { ...DEFAULT_AVATAR };
    uploadInput.value = '';
    renderAvatarPicker();
  });

  modal.querySelector('.modal-close')?.addEventListener('click', () => closeModal(modal));
  modal.querySelector('.modal-overlay')?.addEventListener('click', () => closeModal(modal));
}

const authModal = document.getElementById('auth-modal');
const authTrigger = document.getElementById('auth-trigger');
const signOutBtn = document.getElementById('sign-out-btn');
const authError = document.getElementById('auth-error');

async function updateAuthUI() {
  const isLoggedIn = auth.isAuthenticated();
  const user = auth.getCurrentUser();

  const authTriggerEl = document.getElementById('auth-trigger');
  const signOutBtnEl = document.getElementById('sign-out-btn');

  if (authTriggerEl) { authTriggerEl.style.display = isLoggedIn ? 'none' : 'flex'; }
  if (signOutBtnEl) { signOutBtnEl.style.display = isLoggedIn ? 'flex' : 'none'; }

  const statusText = document.getElementById('user-status-text');
  if (statusText) {
    const t = TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
    statusText.textContent = isLoggedIn ? (t.signedInStatus || 'Signed in') : (t.localStorage || 'Local Storage');
  }

  let displayName = 'Guest';
  let dropdownDisplay = 'Guest User';

  if (isLoggedIn && user) {
    if (user.name && user.name.trim() !== '') { displayName = user.name; }
    else if (user.email) { displayName = user.email.split('@')[0]; }
    dropdownDisplay = user.email || 'User';
  }

  const headerName = document.getElementById('user-name-display');
  const dropdownName = document.getElementById('dropdown-user-name');

  if (headerName) { headerName.textContent = displayName; }
  if (dropdownName) { dropdownName.textContent = dropdownDisplay; }

  if (isLoggedIn && user?.avatar) {
    settings.avatar = { ...user.avatar };
  }

  const dropAvatarEmoji = document.getElementById('dropdown-avatar-emoji');
  const dropAvatarImg = document.getElementById('dropdown-avatar-img');
  const dropAvatarLarge = document.getElementById('dropdown-avatar-large');

  if (dropAvatarLarge && dropAvatarEmoji && dropAvatarImg) {
    if (settings.avatar?.photo) {
      dropAvatarImg.src = settings.avatar.photo;
      dropAvatarImg.style.display = 'block';
      dropAvatarEmoji.style.display = 'none';
      dropAvatarLarge.style.background = 'transparent';
    } else {
      dropAvatarImg.style.display = 'none';
      dropAvatarEmoji.style.display = 'flex';
      dropAvatarEmoji.textContent = settings.avatar?.emoji || '🌱';
      const bg = AVATAR_BACKGROUNDS.find(b => b.id === settings.avatar?.background);
      dropAvatarLarge.style.background = (bg && bg.id !== 'none') ? bg.css : 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))';
    }
  }
  if (isLoggedIn) { document.body.classList.add('authenticated'); }
  else { document.body.classList.remove('authenticated'); }

  renderHeaderAvatar();
  updateProfileSection();
}

function switchAuthTab(tab) {
  const t = TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.toggle('active', f.id === `${tab}-form`));
  document.getElementById('auth-modal-title').textContent = tab === 'login'
    ? (t.signIn || 'Sign In')
    : (t.signUp || 'Sign Up');
  if (authError) { authError.style.display = 'none'; }
}

async function handleAuthSubmit(e, type) {
  e.preventDefault();
  if (authError) { authError.style.display = 'none'; }

  const emailInput = document.getElementById(type === 'login' ? 'login-email' : 'reg-email');
  const passInput = document.getElementById(type === 'login' ? 'login-password' : 'reg-password');

  const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
  const password = passInput ? passInput.value : '';

  if (!email || !password) {
    if (authError) {
      const t = TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
      authError.textContent = t.authRequiredFields || 'Email and password are required';
      authError.style.display = 'block';
    }
    return;
  }

  try {
    if (type === 'login') { await auth.login({ email, password }); }
    else {
      const nameInput = document.getElementById('reg-name');
      const dobInput = document.getElementById('reg-dob');
      await auth.register({
        email, password,
        name: nameInput ? nameInput.value.trim() : '',
        dob: dobInput ? dobInput.value : null
      });
    }

    await updateAuthUI();
    closeModal(authModal);
    const t = TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
    showNotification(type === 'login' ? (t.authWelcomeBack || 'Welcome back') : (t.authAccountCreated || 'Account created'));

    emailInput.value = ''; passInput.value = '';
    const nameInput = document.getElementById('reg-name');
    const dobInput = document.getElementById('reg-dob');
    if (nameInput) { nameInput.value = ''; }
    if (dobInput) { dobInput.value = ''; }
  } catch (err) {
    if (authError) { authError.textContent = err.message; authError.style.display = 'block'; }
  }
}

function initEvents() {
  document.getElementById('open-add-modal')?.addEventListener('click', () => openModal(addModal));

  document.querySelectorAll('.modal-close, .modal-overlay').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.target === btn || btn.classList.contains('modal-close')) {
        closeModal(addModal); closeModal(statsModal); closeModal(settingsModal); closeModal(authModal);
        closeModal(quantityLogModal);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (settings.focusMode) { toggleFocusMode(false); showNotification('Focus Mode Disabled'); }
      closeModal(addModal); closeModal(statsModal); closeModal(settingsModal); closeModal(authModal);
      closeModal(quantityLogModal);
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N')) {
      const ae = document.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.isContentEditable)) {
        return;
      }
      e.preventDefault();
      openModal(addModal);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && !document.activeElement.matches('input, textarea')) {
      e.preventDefault();
      window.location.href = './pages/keyboard.html';
    }
  });

  document.querySelectorAll('input[name="track-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (targetContainer) { targetContainer.classList.toggle('visible', e.target.value === 'quantity'); }
    });
  });

  document.getElementById('quantity-log-save')?.addEventListener('click', () => {
    const t = TRANSLATIONS[settings.lang];
    const raw = quantityLogInput?.value;
    const parsed = Number(String(raw ?? '').trim().replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed < 0) {
      showNotification(t.invalidQuantity || 'Enter a valid number (0 or greater)');
      return;
    }
    completeQuantityLogWithValue(parsed);
  });
  document.getElementById('quantity-log-cancel')?.addEventListener('click', () => {
    closeModal(quantityLogModal);
  });
  quantityLogInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('quantity-log-save')?.click();
    }
  });

  habitForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('habit-name')?.value.trim();
    if (!name) { return; }
    const trackType = document.querySelector('input[name="track-type"]:checked')?.value === 'quantity' ? 'quantity' : 'binary';
    void (async () => {
      try {
        await habits.add({
          name,
          description: document.getElementById('habit-desc')?.value.trim() || '',
          category: document.getElementById('habit-category')?.value || '',
          trackType,
          target: trackType === 'quantity' ? parseInt(document.getElementById('habit-target')?.value) || 1 : 1,
          unit: trackType === 'quantity' ? document.getElementById('habit-unit')?.value.trim() || '' : ''
        });
        habitForm.reset();
        if (targetContainer) { targetContainer.classList.remove('visible'); }
        document.querySelector('input[name="track-type"][value="binary"]').checked = true;
        closeModal(addModal);
        renderGarden();
        showNotification(TRANSLATIONS[settings.lang].habitPlanted);
      } catch (err) {
        showNotification(err.message || 'Could not add habit');
      }
    })();
  });

  bindGardenCardEvents();
  bindBackupUiEvents();

  document.getElementById('close-settings')?.addEventListener('click', () => closeModal(settingsModal));
  document.getElementById('close-stats')?.addEventListener('click', () => closeModal(statsModal));

  authTrigger?.addEventListener('click', () => { openModal(authModal); closeUserMenu(); });
  signOutBtn?.addEventListener('click', async () => {
    await auth.logout(); await updateAuthUI(); renderGarden(); closeUserMenu(); showNotification('Signed out');
  });
  authModal?.querySelector('.modal-close')?.addEventListener('click', () => closeModal(authModal));
  authModal?.querySelector('.modal-overlay')?.addEventListener('click', () => closeModal(authModal));
  document.querySelectorAll('.auth-tab').forEach(tab => tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab)));
  document.getElementById('login-form')?.addEventListener('submit', (e) => handleAuthSubmit(e, 'login'));
  document.getElementById('register-form')?.addEventListener('submit', (e) => handleAuthSubmit(e, 'register'));
}

function toggleFocusMode(enabled) {
  settings.focusMode = enabled;
  document.body.classList.toggle('focus-mode', enabled);
  if (focusToggle) { focusToggle.checked = enabled; }
  storage.set('cultiva-settings', settings);
  renderGarden();
}

function scheduleDeferredOnboarding() {
  const run = async () => {
    const onboarding = await import('./app/onboarding-wizard.js');
    const templates = await import('./app/habit-templates-ui.js');
    onboarding.bindOnboardingEvents();
    templates.bindHabitTemplates(settings.lang);
    onboarding.maybeShowOnboarding();
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => { void run(); }, { timeout: 2500 });
  } else {
    setTimeout(() => { void run(); }, 400);
  }
}

window.showNotification = showNotification;

const loadingTimeout = setTimeout(() => {
  if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
    loadingScreen.innerHTML = '<div style="text-align:center; padding:20px;"><div style="font-size:40px; margin-bottom:16px;">⏳</div><p style="font-size:16px; color:var(--text-primary);">Loading taking longer than expected...</p><button onclick="location.reload()" class="btn-primary" style="margin-top:20px; width:auto; padding:10px 20px;">Reload</button></div>';
  }
}, 15000);

const hideLoading = () => {
  clearTimeout(loadingTimeout);
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    setTimeout(() => { loadingScreen.style.display = 'none'; loadingScreen.style.visibility = 'hidden'; }, 600);
  }
};

if (typeof window.electron !== 'undefined' && window.electron.onUpdateMessage) {
  window.electron.onUpdateMessage((message) => {
    console.log('[Updater]', message);
    showNotification('', message);
  });
}

async function init() {
  try {
    if (window.electron?.platform) {
      document.documentElement.classList.add(`platform-${window.electron.platform}`);
    }
    initTooltipManager();

    await ensureAppReady();

    await loadSettings();

    applyBranding();
    applySettings();
    renderGarden();

    initEvents();
    initAvatarPicker();
    initSettingsNavigation();
    initProfileManagement();

    initAutoBackup();
    scheduleDeferredOnboarding();
    scheduleDiscordWarmup();

    await updateAuthUI();
    updateCultivaDatePreview();
    updateProfileSection();

    renderPluginHeaderItems();

    initNativeNotificationsScheduler(() => settings);

    const habitSearch = document.getElementById('habit-search');
    habitSearch?.addEventListener('input', (e) => {
      habitSearchQuery = e.target.value;
      renderGarden();
    });

    document.getElementById('accent-color-input')?.addEventListener('input', (e) => {
      settings.accentColor = e.target.value;
      applyAccentColor(settings.accentColor);
      saveSettings();
    });
    document.getElementById('accent-color-reset')?.addEventListener('click', () => {
      settings.accentColor = '';
      applyAccentColor('');
      const inp = document.getElementById('accent-color-input');
      if (inp) {
        inp.value = '#5a9a72';
      }
      saveSettings();
    });
    document.getElementById('ambient-intensity')?.addEventListener('input', (e) => {
      settings.ambientIntensity = parseInt(e.target.value, 10);
      applyAmbientIntensity(settings.ambientIntensity);
      const bg = localStorage.getItem('cultiva-background') || 'none';
      applyAmbientBackground(document, document.body, bg);
      saveSettings();
    });

    initHotkeys({
      openAddModal: () => openModal(addModal),
      openSettings: () => openModal(settingsModal),
      focusSearch: () => document.getElementById('habit-search')?.focus(),
      completeHighlighted: async () => {
        const h = getFocusedHabit();
        if (h) {
          await toggleHabitWithHooks(h.id);
          renderGarden();
          showNotification(TRANSLATIONS[settings.lang].progressSaved);
        }
      },
      logQuantityHighlighted: () => {
        const h = getFocusedHabit();
        if (h?.trackType === 'quantity') {
          const t = TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
          const cur = habits.quantityDayProgress(h, getTodayStr());
          openQuantityLogModal(h, cur, t);
        }
      },
      moveFocusedHabit,
      toggleFocusMode: () => toggleFocusMode(!settings.focusMode),
      reloadGarden: () => renderGarden(),
      openHelp: async () => {
        const t = TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
        const settingsOpen = isModalOpen(settingsModal);
        const calendarOpen = window.location.pathname.includes('/calendar');
        let message = t.helpHome || TRANSLATIONS.en.helpHome;
        if (settingsOpen) {
          const sec = document.querySelector('.settings-section-content.active')?.id || '';
          if (sec.includes('plugins')) {
            message = t.helpPlugins || TRANSLATIONS.en.helpPlugins;
          } else {
            message = t.helpSettings || TRANSLATIONS.en.helpSettings;
          }
        } else if (calendarOpen) {
          message = t.helpCalendar || TRANSLATIONS.en.helpCalendar;
        }
        await showAlertDialog(message, {
          title: t.helpTitle || TRANSLATIONS.en.helpTitle,
          confirmText: t.done || TRANSLATIONS.en.done
        });
      },
      closeTopModal: () => {
        closeTopmostModal([addModal, statsModal, settingsModal, quantityLogModal, authModal]);
      }
    });

    initContextMenu({
      t: () => TRANSLATIONS[settings.lang] || TRANSLATIONS.en,
      completeHabit: async (id) => {
        await toggleHabitWithHooks(id);
        renderGarden();
        showNotification(TRANSLATIONS[settings.lang].progressSaved);
      },
      logHabit: (id) => {
        const h = habits.getAll().find((x) => x.id === id);
        if (h) {
          const t = TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
          const cur = habits.quantityDayProgress(h, getTodayStr());
          openQuantityLogModal(h, cur, t);
        }
      },
      canLog: (id) => habits.getAll().find((x) => x.id === id)?.trackType === 'quantity',
      openStats: (id) => openStats(id),
      deleteHabit: async (id) => {
        const t = TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
        const shouldRemove = await showConfirmDialog(t.confirmRemoveHabit, {
          title: t.delete,
          confirmText: t.delete,
          cancelText: t.cancel,
          tone: 'danger'
        });
        if (shouldRemove) {
          await habits.remove(id);
          renderGarden();
          showNotification(t.removed);
        }
      },
      newHabit: () => openModal(addModal),
      openSettings: () => openModal(settingsModal),
      reloadGarden: () => renderGarden()
    });

    applyAccentColor(settings.accentColor);
    applyAmbientIntensity(settings.ambientIntensity);

    console.log(`[App] Cultiva [${BRANDING.VERSION}] initialized successfully`);
  } catch (err) {
    console.error('[App] Init failed:', err);
    showNotification('', 'Failed to load app data. Try reloading.');
  } finally {
    hideLoading();
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => { init(); hideLoading(); }, 100);
} else {
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { init(); hideLoading(); }, 100);
  });
}

export { TRANSLATIONS };
