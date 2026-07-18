import { habits } from '../modules/habits.js';
import { storage } from '../modules/storage.js';
import { settings } from './renderer-bootstrap.js';
import { saveSettings } from './settings-controller.js';
import { escapeHtml } from '../core/escape-html.js';

export const UNGROUPED_BED_ID = '';
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
  const moved = all.filter((h) => (h.bedId || '') === bedId);
  if (moved.length) {
    const ungrouped = all.filter((h) => (h.bedId || UNGROUPED_BED_ID) === UNGROUPED_BED_ID && (h.bedId || '') !== bedId);
    const base = ungrouped.reduce((max, h) => Math.max(max, Number(h.sortOrder) || 0), 0) + 1;
    moved.forEach((h, i) => {
      h.bedId = UNGROUPED_BED_ID;
      h.sortOrder = base + i;
    });
    await storage.saveHabits(all);
  }
  await setGardenBeds(getGardenBeds().filter((b) => b.id !== bedId));
}

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

function clearDropTargets(gardenEl) {
  gardenEl.querySelectorAll('.garden-bed--drop-target').forEach((el) => el.classList.remove('garden-bed--drop-target'));
}

function resolveBedIdFromEvent(target) {
  const card = target.closest?.('.habit-card[data-id]');
  if (card?.dataset?.bedId != null && card.dataset.bedId !== '') {
    return fromDomBedId(card.dataset.bedId);
  }
  const header = target.closest?.('.garden-bed-header, .garden-bed-dropzone');
  if (header?.dataset?.bedId != null) {
    return fromDomBedId(header.dataset.bedId);
  }
  return null;
}

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
    clearDropTargets(gardenEl);
    dragId = null;
  });

  gardenEl.addEventListener('dragover', (e) => {
    const card = e.target.closest('.habit-card[data-id]');
    const zone = e.target.closest('.garden-bed-header, .garden-bed-dropzone');
    if (!card && !zone) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    clearDropTargets(gardenEl);
    const bedId = resolveBedIdFromEvent(e.target);
    if (bedId == null && !card) {
      return;
    }
    const domId = toDomBedId(bedId ?? fromDomBedId(card?.dataset?.bedId));
    gardenEl.querySelectorAll(`[data-bed-id="${CSS.escape(domId)}"]`).forEach((el) => {
      if (el.classList.contains('garden-bed-header') || el.classList.contains('garden-bed-dropzone')) {
        el.classList.add('garden-bed--drop-target');
      }
    });
  });

  gardenEl.addEventListener('drop', (e) => {
    e.preventDefault();
    const id = dragId || e.dataTransfer.getData('text/plain');
    if (!id) {
      return;
    }
    const overCard = e.target.closest('.habit-card[data-id]');
    let bedId = resolveBedIdFromEvent(e.target);
    if (bedId == null && overCard) {
      bedId = fromDomBedId(overCard.dataset.bedId);
    }
    if (bedId == null) {
      bedId = UNGROUPED_BED_ID;
    }
    let beforeId = null;
    if (overCard && overCard.dataset.id !== id && overCard.dataset.cardMode === 'active') {
      beforeId = overCard.dataset.id;
    }
    clearDropTargets(gardenEl);
    void onReorder?.(id, bedId, beforeId);
  });
}

export function makeHabitCardDraggable(card) {
  if (!card || card.dataset.cardMode !== 'active') {
    return;
  }
  card.setAttribute('draggable', 'true');
}

export function ensureBedHeader(gardenEl, bed, title, { afterEl }) {
  const domId = toDomBedId(bed.id);
  let head = gardenEl.querySelector(`:scope > .garden-bed-header[data-bed-id="${CSS.escape(domId)}"]`);
  if (!head) {
    head = document.createElement('div');
    head.className = 'garden-bed-header';
    head.dataset.bedId = domId;
    head.innerHTML = `<h3 class="garden-bed-title">${escapeHtml(title)}</h3>`;
    if (afterEl?.nextSibling) {
      gardenEl.insertBefore(head, afterEl.nextSibling);
    } else if (afterEl) {
      afterEl.after(head);
    } else {
      gardenEl.appendChild(head);
    }
  } else {
    const titleEl = head.querySelector('.garden-bed-title');
    if (titleEl) {
      titleEl.textContent = title;
    }
  }
  return head;
}

export function ensureBedDropzone(gardenEl, bed, emptyLabel, { afterEl }) {
  const domId = toDomBedId(bed.id);
  let zone = gardenEl.querySelector(`:scope > .garden-bed-dropzone[data-bed-id="${CSS.escape(domId)}"]`);
  if (!zone) {
    zone = document.createElement('div');
    zone.className = 'garden-bed-dropzone';
    zone.dataset.bedId = domId;
    zone.textContent = emptyLabel || '';
    if (afterEl?.nextSibling) {
      gardenEl.insertBefore(zone, afterEl.nextSibling);
    } else if (afterEl) {
      afterEl.after(zone);
    } else {
      gardenEl.appendChild(zone);
    }
  } else {
    zone.textContent = emptyLabel || '';
  }
  return zone;
}

export function removeBedChrome(gardenEl, domId) {
  gardenEl.querySelector(`:scope > .garden-bed-header[data-bed-id="${CSS.escape(domId)}"]`)?.remove();
  gardenEl.querySelector(`:scope > .garden-bed-dropzone[data-bed-id="${CSS.escape(domId)}"]`)?.remove();
}
