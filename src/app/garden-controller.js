import { TRANSLATIONS } from '../core/i18n.js';
import { GROWTH_STAGES, LEGACY_THRESHOLD, MAX_ACTIVE_HABITS } from '../core/config.js';
import { habits } from '../modules/habits.js';
import { applyTranslations } from './i18n-dom.js';
import { openModal } from './modals.js';
import { getTodayStr } from './date-ui.js';
import { toggleHabitWithHooks } from './habit-actions.js';
import { openQuantityLogModal } from './modals.js';
import { showNotification } from './ui-shell.js';
import { pluginManager } from '../core/plugin-manager.js';
import { glyphSearch } from '../core/glyph-s-search.js';
import { showConfirmDialog } from './dialogs.js';
import { escapeHtml } from '../core/escape-html.js';

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
  const all = filterHabits(habits.getGardenHabits());
  if (c.focusedHabitId) {
    const hit = all.find((h) => h.id === c.focusedHabitId);
    if (hit) {
      return hit;
    }
  }
  return all[0] || null;
}

export function moveFocusedHabit(delta) {
  const c = requireCtx();
  const all = filterHabits(habits.getGardenHabits());
  if (!all.length) {
    return;
  }
  let idx = all.findIndex((h) => h.id === c.focusedHabitId);
  if (idx < 0) {
    idx = 0;
  }
  idx = (idx + delta + all.length) % all.length;
  c.setFocusedHabitId(all[idx].id);
  renderGarden();
  document.querySelector(`.habit-card[data-id="${all[idx].id}"]`)?.focus();
}

function stageLabel(stage, t) {
  const map = {
    Seed: t.seed,
    Sprout: t.sprout,
    Plant: t.plant,
    Tree: t.tree,
    Legacy: t.legacy
  };
  return map[stage.name] || stage.name;
}

function createHabitCard(habit, isTrophy = false, cardMode = 'active') {
  const c = requireCtx();
  const stage = isTrophy ? GROWTH_STAGES.LEGACY : habits.getStage(habit.progress);
  const today = getTodayStr();
  const isPausedCard = cardMode === 'paused';
  const isCompleted = habit.trackType === 'binary'
    ? habit.lastCompleted === today
    : habits.quantityDayProgress(habit, today) >= habits.quantityTarget(habit);

  let progressBar = '';
  if (!isPausedCard && habit.trackType === 'quantity') {
    const cur = habits.quantityDayProgress(habit, today);
    const tgt = habits.quantityTarget(habit);
    const pct = Math.min(100, (cur / tgt) * 100);
    progressBar = `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>`;
  }

  const t = TRANSLATIONS[c.settings.lang] || TRANSLATIONS.en;
  const categoryName = habit.category ? (t.categories?.[habit.category] || habit.category) : '';
  const categoryBadge = categoryName ? `<span class="category-badge" data-i18n-category="${habit.category}">${categoryName}</span>` : '';
  const streakText = habit.currentStreak > 0 ? ` • 🔥 ${habit.currentStreak}` : '';
  const statusBadge = isPausedCard
    ? `<span class="status-badge">${habit.archived ? (t.habitArchived || 'Archived') : (t.habitPaused || 'Paused')}</span>`
    : '';

  const primaryLabel = isPausedCard
    ? (habit.archived ? (t.contextRestore || 'Restore') : (t.contextResume || 'Resume'))
    : (isCompleted ? (t.done || 'Done') : (habit.trackType === 'quantity' ? (t.log || 'Log') : (t.complete || 'Complete')));

  const card = document.createElement('article');
  card.className = `habit-card${isPausedCard ? ' habit-card--paused' : ''}`;
  card.dataset.id = habit.id;
  card.dataset.category = habit.category || 'none';
  card.dataset.cardMode = cardMode;
  if (!isTrophy) {
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '-1');
  }
  card.innerHTML = `
        <div class="card-header">
            <div class="plant-visual">${stage.emoji}</div>
            <div class="card-info">
                <div class="card-title">${escapeHtml(habit.treeName || habit.name)}</div>
                ${habit.description ? `<div class="card-description">${escapeHtml(habit.description)}</div>` : ''}
                <div class="card-subtitle">${stageLabel(stage, t)} • ${habit.progress}${t.days}${streakText}</div>
                ${categoryBadge}${statusBadge}
            </div>
        </div>
        ${progressBar}
        <div class="card-actions">
            <button class="btn-card btn-card-primary${isCompleted && !isPausedCard ? ' completed' : ''}" data-card-act="${isPausedCard ? 'resume' : 'complete'}">${primaryLabel}</button>
            <button class="btn-card btn-card-danger" data-card-act="delete">✕</button>
        </div>
    `;
  return card;
}

function habitRenderKey(habit, isTrophy, cardMode = 'active') {
  const c = requireCtx();
  const today = getTodayStr();
  const isCompleted = habit.trackType === 'binary'
    ? habit.lastCompleted === today
    : habits.quantityDayProgress(habit, today) >= habits.quantityTarget(habit);
  const qty = habit.trackType === 'quantity' ? habits.quantityDayProgress(habit, today) : 0;
  return [
    isTrophy ? 'trophy' : cardMode,
    habit.progress,
    habit.currentStreak,
    isCompleted ? 1 : 0,
    qty,
    habit.treeName,
    habit.name,
    habit.description,
    habit.category,
    habit.trackType,
    habit.paused ? 1 : 0,
    habit.archived ? 1 : 0,
    habits.quantityTarget(habit),
    c.settings.lang
  ].join('|');
}

function syncHabitCards(container, habitList, isTrophy = false, cardMode = 'active') {
  const c = requireCtx();
  if (!container) {
    return;
  }

  const existingIds = new Set(
    [...container.querySelectorAll('.habit-card')].map((el) => el.dataset.id)
  );
  const nextIds = new Set(habitList.map((h) => h.id));

  for (const id of existingIds) {
    if (!nextIds.has(id)) {
      container.querySelector(`.habit-card[data-id="${id}"]`)?.remove();
    }
  }

  habitList.forEach((habit, index) => {
    const key = habitRenderKey(habit, isTrophy, cardMode);
    let card = container.querySelector(`.habit-card[data-id="${habit.id}"]`);

    if (!card) {
      card = createHabitCard(habit, isTrophy, cardMode);
      card.dataset.renderKey = key;
      const ref = container.children[index] || null;
      container.insertBefore(card, ref);
    } else if (card.dataset.renderKey !== key) {
      const next = createHabitCard(habit, isTrophy, cardMode);
      next.dataset.renderKey = key;
      card.replaceWith(next);
      card = next;
    }

    const ref = container.children[index];
    if (ref && ref !== card) {
      container.insertBefore(card, ref);
    } else if (!ref) {
      container.appendChild(card);
    }

    if (!isTrophy && cardMode === 'active') {
      const isFocused = habit.id === c.focusedHabitId;
      card.classList.toggle('habit-card--focus', isFocused);
      card.setAttribute('tabindex', isFocused ? '0' : '-1');
      card.setAttribute('aria-label', habit.treeName || habit.name);
    }
  });
}

function renderNextTreeProgress(container, t) {
  const candidate = habits.getNextLegacyCandidate();
  if (!candidate || !container) {
    if (container) {
      container.innerHTML = '';
    }
    return;
  }
  const remaining = Math.max(0, LEGACY_THRESHOLD - (candidate.progress || 0));
  const pct = Math.min(100, ((candidate.progress || 0) / LEGACY_THRESHOLD) * 100);
  const name = escapeHtml(candidate.treeName || candidate.name || 'Habit');
  const label = (t.nextTreeDays || '{n} days to Legacy').replace('{n}', String(remaining));
  container.innerHTML = `
    <div class="next-tree-card" data-id="${escapeHtml(candidate.id)}">
      <div class="next-tree-title">${t.nextTreeTitle || 'Next Legacy tree'}</div>
      <div class="next-tree-name">${name}</div>
      <div class="next-tree-sub">${label}</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="next-tree-meta">${candidate.progress || 0} / ${LEGACY_THRESHOLD}${t.days || 'd'}</div>
    </div>
  `;
}

function clearGardenHabitNodes(gardenEl) {
  if (!gardenEl) {
    return;
  }
  Array.from(gardenEl.children).forEach((child) => {
    if (!child.classList.contains('garden-plugin-widget')) {
      child.remove();
    }
  });
}

export function renderGarden() {
  const c = requireCtx();
  const all = habits.getAll();
  const active = filterHabits(habits.getGardenHabits());
  const trophies = all.filter(h => h.progress >= LEGACY_THRESHOLD);
  const paused = filterHabits(habits.getPausedHabits());
  const t = TRANSLATIONS[c.settings.lang] || TRANSLATIONS.en;
  if (!c.focusedHabitId && active[0]) {
    c.setFocusedHabitId(active[0].id);
  } else if (c.focusedHabitId && !active.some((h) => h.id === c.focusedHabitId)) {
    c.setFocusedHabitId(active[0]?.id || null);
  }

  if (c.gardenEl) {
    c.gardenEl.setAttribute('role', 'list');
    c.gardenEl.setAttribute('aria-label', t.gardenListLabel || 'Habits');
    if (active.length === 0) {
      clearGardenHabitNodes(c.gardenEl);
      const inSearchMode = c.habitSearchQuery.trim().length > 0;
      const emptyMsg = inSearchMode
        ? (t.emptyStateSearchHint || t.searchEmpty || 'No habits match your search')
        : (t.emptyStateCreateHint || t.plantFirst || 'Create your first habit');
      c.gardenEl.innerHTML = `<div class="empty-state"><p>${emptyMsg}</p>${inSearchMode ? '' : `<button class="btn-primary" id="add-first" style="width:auto;padding:10px 20px;margin-top:16px" data-i18n="plantFirst">${t.plantFirst}</button>`}</div>`;
      document.getElementById('add-first')?.addEventListener('click', () => openModal(c.addModal));
    } else {
      c.gardenEl.querySelector('.empty-state')?.remove();
      syncHabitCards(c.gardenEl, active, false, 'active');
    }
  }
  if (c.trophyEl) {
    if (trophies.length === 0) {
      if (c.settings.showNextTreeProgress !== false) {
        renderNextTreeProgress(c.trophyEl, t);
      } else {
        c.trophyEl.innerHTML = '';
      }
    } else {
      syncHabitCards(c.trophyEl, trophies, true, 'trophy');
    }
  }
  const pausedSection = document.getElementById('paused-section');
  if (pausedSection) {
    pausedSection.classList.toggle('hidden', paused.length === 0);
  }
  if (c.pausedEl) {
    if (paused.length === 0) {
      c.pausedEl.innerHTML = '';
    } else {
      syncHabitCards(c.pausedEl, paused, false, 'paused');
    }
  }
  if (c.countEl) { c.countEl.textContent = `${active.length}/${MAX_ACTIVE_HABITS}`; }
  if (c.trophyCountEl) { c.trophyCountEl.textContent = trophies.length; }
  if (c.pausedCountEl) { c.pausedCountEl.textContent = paused.length; }
  applyTranslations(c.settings.lang);
  pluginManager.refreshGardenWidgets();
}

export function openStats(id) {
  const c = requireCtx();
  const s = habits.getStats(id);
  if (!s) { return; }
  document.getElementById('stats-title').textContent = s.name;
  const t = TRANSLATIONS[c.settings.lang] || TRANSLATIONS.en;
  document.getElementById('stats-content').innerHTML = `
        <div class="stat-card"><div class="stat-label">${t.currentStreak}</div><div class="stat-value">${s.currentStreak}</div><div class="stat-subvalue">${t.days}</div></div>
        <div class="stat-card"><div class="stat-label">${t.bestStreak}</div><div class="stat-value">${s.bestStreak}</div><div class="stat-subvalue">${t.days}</div></div>
        <div class="stat-card"><div class="stat-label">${t.completion}</div><div class="stat-value">${s.completionRate}%</div><div class="stat-subvalue">${s.totalDays} ${t.days}</div></div>
        <div class="stat-card"><div class="stat-label">${t.stage}</div><div class="stat-value">${stageLabel(s.stage, t)}</div><div class="stat-subvalue">${habits.getAll().find(x => x.id === id)?.progress} ${s.trackType === 'quantity' ? t.completions : t.days}</div></div>
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
    if (e.target.closest('[data-plugin-act], [data-quote-act], .quote-favorite-btn')) {
      return;
    }
    const card = e.target.closest('.habit-card');
    if (!card || card.classList.contains('garden-plugin-card') || card.closest('.garden-plugin-widget')) {
      return;
    }
    const id = card.dataset.id;
    const t = TRANSLATIONS[c.settings.lang] || TRANSLATIONS.en;
    c.setFocusedHabitId(id);
    if (e.target.closest('.btn-card-primary')) {
      e.stopPropagation();
      const h = habits.getAll().find(x => x.id === id);
      if (!h) { return; }

      if (card.dataset.cardMode === 'paused' || e.target.closest('[data-card-act="resume"]')) {
        if (h.archived) {
          await habits.setArchived(id, false);
          showNotification(t.habitRestored || t.contextRestore || 'Habit restored');
        } else {
          await habits.setPaused(id, false);
          showNotification(t.habitResumed || t.contextResume || 'Habit resumed');
        }
        renderGarden();
        return;
      }

      const today = getTodayStr();
      const isCompleted = h.trackType === 'binary'
        ? h.lastCompleted === today
        : habits.quantityDayProgress(h, today) >= habits.quantityTarget(h);

      if (isCompleted) { return; }

      if (h.trackType === 'quantity') {
        const cur = habits.quantityDayProgress(h, today);
        const t = TRANSLATIONS[c.settings.lang] || TRANSLATIONS.en;
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
        });
        return;
      }
      await toggleHabitWithHooks(id);
      renderGarden();
      card.querySelector('.plant-visual')?.classList.add('growing');
      setTimeout(() => card.querySelector('.plant-visual')?.classList.remove('growing'), 250);
    } else if (e.target.closest('.btn-card-danger')) {
      e.stopPropagation();
      const shouldRemove = await showConfirmDialog(t.confirmRemoveHabit || 'Remove this habit?', {
        title: t.delete || 'Delete',
        confirmText: t.delete || 'Delete',
        cancelText: t.cancel || 'Cancel',
        tone: 'danger'
      });
      if (shouldRemove) {
        await habits.remove(id);
        renderGarden();
        showNotification((TRANSLATIONS[c.settings.lang] || TRANSLATIONS.en).removed);
      }
    } else { openStats(id); }
  };

  c.gardenEl?.addEventListener('click', handleCardClick);
  c.trophyEl?.addEventListener('click', handleCardClick);
  c.pausedEl?.addEventListener('click', handleCardClick);
}
