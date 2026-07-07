import { TRANSLATIONS } from '../core/i18n.js';
import { habits } from '../modules/habits.js';
import { settings } from './renderer-bootstrap.js';
import { saveSettings } from './settings-controller.js';
import { openModal, closeModal } from './modals.js';
import { renderGarden } from './garden-controller.js';
import { initAutoBackup } from './auto-backup.js';
import { applySettings } from './settings-controller.js';
import { getCultivaTimezone } from '../core/timezone.js';

let step = 0;
const TOTAL = 5;

function t() {
  return TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
}

function el(id) {
  return document.getElementById(id);
}

function renderStep() {
  const root = el('onboarding-body');
  const title = el('onboarding-title');
  const backBtn = el('onboarding-back');
  const nextBtn = el('onboarding-next');
  const dots = el('onboarding-dots');
  if (!root || !title || !nextBtn) {
    return;
  }
  const tr = t();
  if (backBtn) {
    backBtn.style.display = step > 0 ? '' : 'none';
  }
  nextBtn.textContent = step === TOTAL - 1 ? (tr.onboardingFinish || 'Start gardening') : (tr.onboardingNext || 'Next');
  if (dots) {
    dots.innerHTML = Array.from({ length: TOTAL }, (_, i) =>
      `<span class="onboarding-dot${i === step ? ' active' : ''}"></span>`
    ).join('');
  }

  if (step === 0) {
    title.textContent = tr.onboardingWelcomeTitle || 'Welcome to Cultiva';
    root.innerHTML = `<p class="onboarding-lead">${tr.onboardingWelcomeLead || 'Your habits grow like plants — one day at a time.'}</p><p class="onboarding-muted">${tr.onboardingWelcomeSub || 'No cloud. No account required. Your garden stays on this device.'}</p>`;
    return;
  }
  if (step === 1) {
    title.textContent = tr.onboardingLocaleTitle || 'Language & theme';
    root.innerHTML = `
      <label class="onboarding-field"><span>${tr.language}</span>
        <select id="onboarding-lang" class="select-input">
          <option value="en">English</option>
          <option value="ru">Русский</option>
        </select>
      </label>
      <label class="onboarding-field"><span>${tr.theme}</span>
        <select id="onboarding-theme" class="select-input">
          <option value="auto">${tr.themeAuto || 'Auto'}</option>
          <option value="light">${tr.themeLightBuiltin || 'Light'}</option>
          <option value="dark">${tr.themeDarkBuiltin || 'Dark'}</option>
        </select>
      </label>`;
    el('onboarding-lang').value = settings.lang || 'en';
    el('onboarding-theme').value = settings.theme || 'auto';
    return;
  }
  if (step === 2) {
    title.textContent = tr.onboardingTzTitle || 'Timezone';
    const tz = localStorage.getItem('cultiva-timezone') || 'auto';
    root.innerHTML = `
      <p class="onboarding-muted">${tr.onboardingTzLead || 'Used for habit dates and calendar.'}</p>
      <label class="onboarding-field"><span>${tr.timezone}</span>
        <select id="onboarding-tz" class="select-input">
          <option value="auto">${tr.onboardingTzAuto || 'System default'}</option>
          <option value="${getCultivaTimezone()}">${getCultivaTimezone()}</option>
        </select>
      </label>`;
    el('onboarding-tz').value = tz;
    return;
  }
  if (step === 3) {
    title.textContent = tr.onboardingHabitTitle || 'Plant your first habit';
    root.innerHTML = `
      <p class="onboarding-muted">${tr.onboardingHabitLead || 'Optional — you can skip and add habits later.'}</p>
      <label class="onboarding-field"><span>${tr.habitName}</span>
        <input type="text" id="onboarding-habit-name" class="select-input" maxlength="50" placeholder="${tr.onboardingHabitPlaceholder || 'e.g. Morning walk'}">
      </label>`;
    return;
  }
  title.textContent = tr.onboardingBackupTitle || 'Local backups';
  root.innerHTML = `
    <p class="onboarding-muted">${tr.onboardingBackupLead || 'Cultiva can silently save rotating ZIP snapshots on this device — no cloud.'}</p>
    <label class="onboarding-check"><input type="checkbox" id="onboarding-auto-backup" ${settings.autoBackupEnabled !== false ? 'checked' : ''}> ${tr.onboardingBackupEnable || 'Enable automatic local backups'}</label>`;
}

async function finish() {
  settings.firstRunComplete = true;
  saveSettings();
  if (settings.autoBackupEnabled !== false) {
    initAutoBackup();
  }
  renderGarden();
  closeModal(el('onboarding-modal'));
}

async function nextStep() {
  if (step === 1) {
    settings.lang = el('onboarding-lang')?.value || settings.lang;
    settings.theme = el('onboarding-theme')?.value || settings.theme;
    saveSettings();
    applySettings();
  }
  if (step === 2) {
    const tz = el('onboarding-tz')?.value || 'auto';
    localStorage.setItem('cultiva-timezone', tz);
  }
  if (step === 3) {
    const name = el('onboarding-habit-name')?.value?.trim();
    if (name) {
      try {
        habits.add({ name, trackType: 'binary', category: 'other' });
      } catch {
        void 0;
      }
    }
  }
  if (step === 4) {
    settings.autoBackupEnabled = el('onboarding-auto-backup')?.checked !== false;
    await finish();
    return;
  }
  step += 1;
  renderStep();
}

function prevStep() {
  if (step > 0) {
    step -= 1;
    renderStep();
  }
}

export function maybeShowOnboarding() {
  if (settings.firstRunComplete) {
    return;
  }
  const hasHabits = habits.getAll().length > 0;
  if (hasHabits) {
    settings.firstRunComplete = true;
    saveSettings();
    return;
  }
  step = 0;
  renderStep();
  openModal(el('onboarding-modal'));
}

export function bindOnboardingEvents() {
  el('onboarding-next')?.addEventListener('click', () => { nextStep(); });
  el('onboarding-back')?.addEventListener('click', () => { prevStep(); });
  el('onboarding-skip')?.addEventListener('click', async () => {
    settings.firstRunComplete = true;
    settings.autoBackupEnabled = settings.autoBackupEnabled !== false;
    saveSettings();
    closeModal(el('onboarding-modal'));
    if (settings.autoBackupEnabled !== false) {
      initAutoBackup();
    }
  });
  el('onboarding-modal')?.querySelector('.modal-overlay')?.addEventListener('click', () => {
    void 0;
  });
}
