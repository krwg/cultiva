import { habits } from '../modules/habits.js';
import { storage } from '../modules/storage.js';
import { settings } from './renderer-bootstrap.js';
import { saveSettings } from './settings-controller.js';
import { escapeHtml } from '../core/escape-html.js';

export const UNGROUPED_BED_ID = '';
/** DOM dataset value — empty string is awkward in selectors. */
export const UNGROUPED_BED_DOM = '__ungrouped__';

export function toDomBedId(bedId) {
  return bedId || UNGROUPED_BED_DOM;
}

export function fromDomBedId(domId) {
  if (!domId || domId === UNGROUPED_BED_DOM) {
    return UNGROUPED_BED_ID;
  }
  return domId;
}

export function normalizeBeds(list) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list
    .filter((b) => b && typeof b.id === 'string' && b.id)
    .map((b, i) => ({
      id: String(b.id),
      name: String(b.name || 'Bed').slice(0, 40),
      sortOrder: Number.isFinite(Number(b.sortOrder)) ? Number(b.sortOrder) : i
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getGardenBeds() {
  return normalizeBeds(settings.gardenBeds);
}

export async function setGardenBeds(beds) {
  settings.gardenBeds = normalizeBeds(beds);
  await saveSettings();
  return settings.gardenBeds;
}

export async function createGardenBed(name) {
  const beds = getGardenBeds();
  const id = `bed-${Date.now().toString(36)}`;
  beds.push({ id, name: String(name || 'Bed').trim().slice(0, 40) || 'Bed', sortOrder: beds.length });
  await setGardenBeds(beds);
  return id;
}

export async function renameGardenBed(bedId, name) {
  const beds = getGardenBeds().map((b) => (
    b.id === bedId ? { ...b, name: String(name || b.name).trim().slice(0, 40) || b.name } : b
  ));
  await setGardenBeds(beds);
}

export async function deleteGardenBed(bedId) {
  const all = habits.getAll();
  let changed = false;
  for (const h of all) {
    if ((h.bedId || '') === bedId) {
      h.bedId = UNGROUPED_BED_ID;
      changed = true;
    }
  }
  if (changed) {
    await storage.saveHabits(all);
  }
  await setGardenBeds(getGardenBeds().filter((b) => b.id !== bedId));
}

/** Ordered bed ids for rendering: custom beds, then ungrouped last if needed. */
export function bedRenderOrder(activeHabits) {
  const beds = getGardenBeds();
  const used = new Set(activeHabits.map((h) => h.bedId || UNGROUPED_BED_ID));
  const out = [];
  for (const b of beds) {
    out.push(b);
  }
  if (used.has(UNGROUPED_BED_ID) || beds.length === 0) {
    out.push({ id: UNGROUPED_BED_ID, name: '', sortOrder: 9999 });
  }
  return out;
}

export function habitsInBed(activeHabits, bedId) {
  const id = bedId || UNGROUPED_BED_ID;
  return activeHabits.filter((h) => (h.bedId || UNGROUPED_BED_ID) === id);
}

export function bedTitle(bed, t) {
  if (!bed || !bed.id) {
    return t.ungroupedBed || 'Ungrouped';
  }
  return bed.name || t.gardenBed || 'Bed';
}

let _dndBound = false;

export function bindGardenDragDrop(gardenEl, { onReorder }) {
  if (!gardenEl || _dndBound) {
    return;
  }
  _dndBound = true;

  let dragId = null;

  gardenEl.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.habit-card[data-id]');
    if (!card || card.classList.contains('garden-plugin-card') || card.dataset.cardMode !== 'active') {
      return;
    }
    dragId = card.dataset.id;
    card.classList.add('habit-card--dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragId);
  });

  gardenEl.addEventListener('dragend', (e) => {
    e.target.closest('.habit-card')?.classList.remove('habit-card--dragging');
    gardenEl.querySelectorAll('.garden-bed--drop-target').forEach((el) => el.classList.remove('garden-bed--drop-target'));
    dragId = null;
  });

  gardenEl.addEventListener('dragover', (e) => {
    const bed = e.target.closest('.garden-bed');
    const card = e.target.closest('.habit-card[data-id]');
    if (!bed && !card) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    gardenEl.querySelectorAll('.garden-bed--drop-target').forEach((el) => el.classList.remove('garden-bed--drop-target'));
    bed?.classList.add('garden-bed--drop-target');
  });

  gardenEl.addEventListener('drop', (e) => {
    e.preventDefault();
    const id = dragId || e.dataTransfer.getData('text/plain');
    if (!id) {
      return;
    }
    const bedEl = e.target.closest('.garden-bed');
    const overCard = e.target.closest('.habit-card[data-id]');
    const bedId = fromDomBedId(bedEl?.dataset.bedId);
    let beforeId = null;
    if (overCard && overCard.dataset.id !== id && overCard.dataset.cardMode === 'active') {
      beforeId = overCard.dataset.id;
    }
    gardenEl.querySelectorAll('.garden-bed--drop-target').forEach((el) => el.classList.remove('garden-bed--drop-target'));
    void onReorder?.(id, bedId, beforeId);
  });
}

export function makeHabitCardDraggable(card) {
  if (!card || card.dataset.cardMode !== 'active') {
    return;
  }
  card.setAttribute('draggable', 'true');
}

export function renderBedShell(bed, title, { showHeader }) {
  const wrap = document.createElement('section');
  wrap.className = 'garden-bed';
  wrap.dataset.bedId = toDomBedId(bed.id);
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', title);
  if (showHeader) {
    const head = document.createElement('div');
    head.className = 'garden-bed-header';
    head.innerHTML = `<h3 class="garden-bed-title">${escapeHtml(title)}</h3>`;
    wrap.appendChild(head);
  }
  const cards = document.createElement('div');
  cards.className = 'garden-bed-cards';
  wrap.appendChild(cards);
  return { wrap, cards };
}
