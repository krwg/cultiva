import { HABIT_TEMPLATES } from '../core/habit-templates.js';
import { TRANSLATIONS } from '../core/i18n.js';

export function bindHabitTemplates(lang) {
  const wrap = document.getElementById('habit-templates');
  if (!wrap) {
    return;
  }
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  wrap.replaceChildren();
  for (const tpl of HABIT_TEMPLATES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'habit-template-chip';
    btn.dataset.templateId = tpl.id;
    const label = t.habitTemplates?.[tpl.id] || tpl.name;
    btn.textContent = `${tpl.emoji} ${label}`;
    btn.addEventListener('click', () => applyHabitTemplate(tpl));
    wrap.appendChild(btn);
  }
}

export function applyHabitTemplate(tpl) {
  const nameEl = document.getElementById('habit-name');
  const descEl = document.getElementById('habit-desc');
  const catEl = document.getElementById('habit-category');
  const targetEl = document.getElementById('habit-target');
  const unitEl = document.getElementById('habit-unit');
  const targetContainer = document.getElementById('target-container');
  if (nameEl) {
    nameEl.value = tpl.name;
  }
  if (descEl) {
    descEl.value = '';
  }
  if (catEl && tpl.category) {
    catEl.value = tpl.category;
  }
  const binaryRadio = document.querySelector('input[name="track-type"][value="binary"]');
  const quantityRadio = document.querySelector('input[name="track-type"][value="quantity"]');
  if (tpl.trackType === 'quantity') {
    quantityRadio.checked = true;
    if (targetContainer) {
      targetContainer.classList.add('visible');
    }
    if (targetEl) {
      targetEl.value = String(tpl.target || 1);
    }
    if (unitEl) {
      unitEl.value = tpl.unit || '';
    }
  } else {
    binaryRadio.checked = true;
    if (targetContainer) {
      targetContainer.classList.remove('visible');
    }
  }
}
