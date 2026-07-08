import { TRANSLATIONS } from '../core/i18n.js';
import { habits } from '../modules/habits.js';
import { getTodayStr } from './date-ui.js';

export function applyTranslations(lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (key && t[key] && ('placeholder' in el)) {
      el.placeholder = t[key];
    }
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.dataset.i18nAriaLabel;
    if (key && t[key]) {
      el.setAttribute('aria-label', t[key]);
    }
  });

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (t[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  document.querySelectorAll('[data-i18n-tooltip]').forEach((el) => {
    const key = el.dataset.i18nTooltip;
    if (key && t[key]) {
      el.dataset.tooltip = t[key];
    }
  });

  document.querySelectorAll('optgroup[data-i18n-label]').forEach((og) => {
    const key = og.dataset.i18nLabel;
    if (key && t[key]) {
      og.label = t[key];
    }
  });

  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    Array.from(themeSelect.options).forEach((option) => {
      const key = option.dataset.i18n;
      if (key && t[key]) {
        option.textContent = t[key];
      }
    });
  }

  const bgSelect = document.getElementById('bg-select');
  if (bgSelect) {
    Array.from(bgSelect.options).forEach((option) => {
      const key = option.dataset.i18n;
      if (key && t[key]) {
        option.textContent = t[key];
      }
    });
  }

  const timeFormatSelect = document.getElementById('time-format-select');
  if (timeFormatSelect) {
    Array.from(timeFormatSelect.options).forEach((option) => {
      const key = option.dataset.i18n;
      if (key && t[key]) {
        option.textContent = t[key];
      }
    });
  }

  const tzSelect = document.getElementById('tz-select');
  if (tzSelect) {
    const auto = tzSelect.querySelector('option[value="auto"]');
    if (auto && t.timeFormatAuto) {
      auto.textContent = t.timeFormatAuto;
    }
  }

  const today = getTodayStr();

  const addOpenBtn = document.getElementById('open-add-modal');
  if (addOpenBtn && t.addHabitShortcutHint) {
    addOpenBtn.title = `${t.addHabit || ''} — ${t.addHabitShortcutHint}`;
  }

  document.querySelectorAll('.habit-card .btn-card-primary').forEach((btn) => {
    const card = btn.closest('.habit-card');
    if (!card) {
      return;
    }
    const id = card.dataset.id;
    const habit = habits.getAll().find((h) => h.id === id);
    if (!habit) {
      return;
    }

    const isCompleted = habit.trackType === 'binary'
      ? habit.lastCompleted === today
      : habits.quantityDayProgress(habit, today) >= habits.quantityTarget(habit);

    if (isCompleted) {
      btn.textContent = t.done || 'Done';
    } else {
      btn.textContent = habit.trackType === 'quantity' ? (t.log || 'Log') : (t.complete || 'Complete');
    }
  });

  const doneBtn = document.getElementById('close-stats');
  if (doneBtn) {
    doneBtn.textContent = t.done || 'Done';
  }

  document.querySelectorAll('[data-i18n-category]').forEach((el) => {
    const cat = el.dataset.i18nCategory;
    if (t.categories && t.categories[cat]) {
      el.textContent = t.categories[cat];
    }
  });
}
