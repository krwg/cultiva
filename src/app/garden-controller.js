import { TRANSLATIONS } from '../core/i18n.js';
import { GROWTH_STAGES, LEGACY_THRESHOLD, MAX_ACTIVE_HABITS } from '../core/config.js';
import { habits } from '../modules/habits.js';
import { applyTranslations } from './i18n-dom.js';
import { openModal } from './modals.js';
import { getTodayStr } from './date-ui.js';
import { toggleHabitWithHooks } from './habit-actions.js';
import { openQuantityLogModal } from './modals.js';
import { showNotification } from './ui-shell.js';
import { glyphSearch } from '../core/glyph-s-search.js';
import { showConfirmDialog } from './dialogs.js';

let ctx = null;

export function configureGardenController(c) {
  ctx = c;
}

function requireCtx() {
  if (!ctx) {
    throw new Error('[garden-controller] not configured');
  }
  return ctx;
}

export function filterHabits(list) {
  const c = requireCtx();
  return glyphSearch(list, c.habitSearchQuery);
}

export function getFocusedHabit() {
  const c = requireCtx();
  const all = filterHabits(habits.getAll().filter((h) => h.progress < LEGACY_THRESHOLD));
  if (c.focusedHabitId) {
    const hit = all.find((h) => h.id === c.focusedHabitId);
    if (hit) {
      return hit;
    }
  }
  return all[0] || null;
}

function createHabitCard(habit, isTrophy = false) {
  const c = requireCtx();
  const stage = isTrophy ? GROWTH_STAGES.LEGACY : habits.getStage(habit.progress);
  const today = getTodayStr();
  const isCompleted = habit.trackType === 'binary'
    ? habit.lastCompleted === today
    : habits.quantityDayProgress(habit, today) >= habits.quantityTarget(habit);

  let progressBar = '';
  if (habit.trackType === 'quantity') {
    const cur = habits.quantityDayProgress(habit, today);
    const tgt = habits.quantityTarget(habit);
    const pct = Math.min(100, (cur / tgt) * 100);
    progressBar = `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>`;
  }

  const t = TRANSLATIONS[c.settings.lang];
  const categoryName = habit.category ? (t.categories?.[habit.category] || habit.category) : '';
  const categoryBadge = categoryName ? `<span class="category-badge" data-i18n-category="${habit.category}">${categoryName}</span>` : '';
  const streakText = habit.currentStreak > 0 ? ` • 🔥 ${habit.currentStreak}` : '';

  const card = document.createElement('article');
  card.className = 'habit-card';
  card.dataset.id = habit.id;
  card.dataset.category = habit.category || 'none';
  card.innerHTML = `
        <div class="card-header">
            <div class="plant-visual">${stage.emoji}</div>
            <div class="card-info">
                <div class="card-title">${habit.treeName || habit.name}</div>
                ${habit.description ? `<div class="card-description">${habit.description}</div>` : ''}
                <div class="card-subtitle">${stage.name} • ${habit.progress}d${streakText}</div>
                ${categoryBadge}
            </div>
        </div>
        ${progressBar}
        <div class="card-actions">
            <button class="btn-card btn-card-primary${isCompleted ? ' completed' : ''}">${isCompleted ? (t.done || 'Done') : (habit.trackType === 'quantity' ? (t.log || 'Log') : (t.complete || 'Complete'))}</button>
            <button class="btn-card btn-card-danger">✕</button>
        </div>
    `;
  return card;
}

export function renderGarden() {
  const c = requireCtx();
  const all = habits.getAll();
  const active = filterHabits(all.filter(h => h.progress < LEGACY_THRESHOLD));
  const trophies = all.filter(h => h.progress >= LEGACY_THRESHOLD);
  const t = TRANSLATIONS[c.settings.lang];
  if (!c.focusedHabitId && active[0]) {
    c.setFocusedHabitId(active[0].id);
  } else if (c.focusedHabitId && !active.some((h) => h.id === c.focusedHabitId)) {
    c.setFocusedHabitId(active[0]?.id || null);
  }

  if (c.gardenEl) {
    c.gardenEl.innerHTML = '';
    if (active.length === 0) {
      const emptyMsg = c.habitSearchQuery.trim() ? (t.searchEmpty || 'No habits match your search') : t.emptyGarden;
      c.gardenEl.innerHTML = `<div class="empty-state"><p style="font-size:40px">🌱</p><p>${emptyMsg}</p>${c.habitSearchQuery.trim() ? '' : `<button class="btn-primary" id="add-first" style="width:auto;padding:10px 20px;margin-top:16px" data-i18n="plantFirst">${t.plantFirst}</button>`}</div>`;
      document.getElementById('add-first')?.addEventListener('click', () => openModal(c.addModal));
    } else {
      active.forEach(h => {
        const card = createHabitCard(h);
        if (h.id === c.focusedHabitId) {
          card.classList.add('habit-card--focus');
        }
        c.gardenEl.appendChild(card);
      });
    }
  }
  if (c.trophyEl) {
    c.trophyEl.innerHTML = '';
    trophies.forEach(h => c.trophyEl.appendChild(createHabitCard(h, true)));
  }
  if (c.countEl) { c.countEl.textContent = `${active.length}/${MAX_ACTIVE_HABITS}`; }
  if (c.trophyCountEl) { c.trophyCountEl.textContent = trophies.length; }
  applyTranslations(c.settings.lang);
}

export function openStats(id) {
  const c = requireCtx();
  const s = habits.getStats(id);
  if (!s) { return; }
  document.getElementById('stats-title').textContent = s.name;
  const t = TRANSLATIONS[c.settings.lang];
  document.getElementById('stats-content').innerHTML = `
        <div class="stat-card"><div class="stat-label">${t.currentStreak}</div><div class="stat-value">${s.currentStreak}</div><div class="stat-subvalue">${t.days}</div></div>
        <div class="stat-card"><div class="stat-label">${t.bestStreak}</div><div class="stat-value">${s.bestStreak}</div><div class="stat-subvalue">${t.days}</div></div>
        <div class="stat-card"><div class="stat-label">${t.completion}</div><div class="stat-value">${s.completionRate}%</div><div class="stat-subvalue">${s.totalDays} ${t.days}</div></div>
        <div class="stat-card"><div class="stat-label">${t.stage}</div><div class="stat-value">${s.stage.name}</div><div class="stat-subvalue">${habits.getAll().find(x => x.id === id)?.progress} ${s.trackType === 'quantity' ? t.completions : t.days}</div></div>
    `;
  const cal = document.getElementById('contribution-calendar');
  if (cal) {
    cal.innerHTML = '';
    habits.getCalendarData(id).forEach(d => {
      const el = document.createElement('div');
      el.className = 'calendar-day';
      el.style.background = `var(--calendar-${d.level})`;
      el.title = d.date;
      cal.appendChild(el);
    });
  }
  openModal(c.statsModal);
}

export function bindGardenCardEvents() {
  const c = requireCtx();
  const handleCardClick = async (e) => {
    const card = e.target.closest('.habit-card');
    if (!card) { return; }
    const id = card.dataset.id;
    c.setFocusedHabitId(id);
    if (e.target.closest('.btn-card-primary')) {
      e.stopPropagation();
      const h = habits.getAll().find(x => x.id === id);
      if (!h) { return; }

      const today = getTodayStr();
      const isCompleted = h.trackType === 'binary'
        ? h.lastCompleted === today
        : habits.quantityDayProgress(h, today) >= habits.quantityTarget(h);

      if (isCompleted) { return; }

      if (h.trackType === 'quantity') {
        const cur = habits.quantityDayProgress(h, today);
        const t = TRANSLATIONS[c.settings.lang];
        openQuantityLogModal(h, cur, t).then(async (parsed) => {
          if (parsed === null) { return; }
          if (!Number.isFinite(parsed) || parsed < 0) {
            showNotification(t.invalidQuantity || 'Enter a valid number (0 or greater)');
            return;
          }
          await toggleHabitWithHooks(id, parsed);
          renderGarden();
          const node = document.querySelector(`.habit-card[data-id="${id}"]`);
          node?.querySelector('.plant-visual')?.classList.add('growing');
          setTimeout(() => node?.querySelector('.plant-visual')?.classList.remove('growing'), 250);
          showNotification(TRANSLATIONS[c.settings.lang].progressSaved);
        });
        return;
      }
      await toggleHabitWithHooks(id);
      renderGarden();
      card.querySelector('.plant-visual')?.classList.add('growing');
      setTimeout(() => card.querySelector('.plant-visual')?.classList.remove('growing'), 250);
      showNotification(TRANSLATIONS[c.settings.lang].progressSaved);
    } else if (e.target.closest('.btn-card-danger')) {
      e.stopPropagation();
      const shouldRemove = await showConfirmDialog('Remove habit?', {
        title: TRANSLATIONS[c.settings.lang].delete || 'Delete',
        confirmText: TRANSLATIONS[c.settings.lang].delete || 'Delete',
        cancelText: TRANSLATIONS[c.settings.lang].cancel || 'Cancel',
        tone: 'danger'
      });
      if (shouldRemove) {
        habits.remove(id);
        renderGarden();
        showNotification(TRANSLATIONS[c.settings.lang].removed);
      }
    } else { openStats(id); }
  };

  c.gardenEl?.addEventListener('click', handleCardClick);
  c.trophyEl?.addEventListener('click', handleCardClick);
}
