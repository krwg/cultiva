let menuEl = null;
let handlers = null;

function closeMenu() {
  if (menuEl) {
    menuEl.remove();
    menuEl = null;
  }
}

function openMenu(x, y, items) {
  closeMenu();
  if (!items.length) {
    return;
  }

  menuEl = document.createElement('div');
  menuEl.className = 'cv-context-menu';
  menuEl.setAttribute('role', 'menu');

  items.forEach((item) => {
    if (item.type === 'separator') {
      const sep = document.createElement('div');
      sep.className = 'cv-context-menu-sep';
      menuEl.appendChild(sep);
      return;
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `cv-context-menu-item${item.danger ? ' cv-context-menu-item--danger' : ''}`;
    btn.textContent = item.label;
    btn.disabled = Boolean(item.disabled);
    btn.addEventListener('click', () => {
      closeMenu();
      item.action?.();
    });
    menuEl.appendChild(btn);
  });

  document.body.appendChild(menuEl);
  const rect = menuEl.getBoundingClientRect();
  const left = Math.min(x, window.innerWidth - rect.width - 8);
  const top = Math.min(y, window.innerHeight - rect.height - 8);
  menuEl.style.left = `${Math.max(8, left)}px`;
  menuEl.style.top = `${Math.max(8, top)}px`;
}

function habitFromTarget(target) {
  const card = target.closest('.habit-card:not(.garden-plugin-card)');
  if (!card?.dataset?.id) {
    return null;
  }
  return card.dataset.id;
}

export function initContextMenu(h) {
  handlers = h;

  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) {
      return;
    }
    if (e.target.closest('.cv-context-menu, .modal.active, .plugin-settings-modal')) {
      return;
    }

    e.preventDefault();
    const t = handlers.t();
    const habitId = habitFromTarget(e.target);
    const items = [];

    if (habitId) {
      items.push(
        { label: t.contextComplete || 'Complete', action: () => handlers.completeHabit(habitId) },
        { label: t.contextLog || 'Log quantity', action: () => handlers.logHabit(habitId), disabled: !handlers.canLog(habitId) },
        { label: t.contextStats || 'Statistics', action: () => handlers.openStats(habitId) },
        { type: 'separator' },
        { label: t.contextDelete || 'Delete habit', danger: true, action: () => handlers.deleteHabit(habitId) }
      );
    } else if (e.target.closest('.garden-section, .garden-grid, .app-main')) {
      items.push({ label: t.contextNewHabit || 'New habit', action: () => handlers.newHabit() });
    }

    items.push(
      { type: 'separator' },
      { label: t.contextSettings || 'Settings', action: () => handlers.openSettings() },
      { label: t.contextReload || 'Reload garden', action: () => handlers.reloadGarden() }
    );

    openMenu(e.clientX, e.clientY, items);
  });

  document.addEventListener('click', closeMenu);
  document.addEventListener('scroll', closeMenu, true);
  window.addEventListener('resize', closeMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });
}
