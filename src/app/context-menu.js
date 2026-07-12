let menuEl = null;

let handlers = null;

let focusedItemIndex = -1;



function closeMenu() {

  if (menuEl) {

    menuEl.remove();

    menuEl = null;

  }

  focusedItemIndex = -1;

}



function getMenuItems() {

  if (!menuEl) {

    return [];

  }

  return [...menuEl.querySelectorAll('.cv-context-menu-item:not(:disabled)')];

}



function focusMenuItem(index) {

  const items = getMenuItems();

  if (!items.length) {

    return;

  }

  focusedItemIndex = ((index % items.length) + items.length) % items.length;

  items.forEach((btn, i) => {

    btn.setAttribute('tabindex', i === focusedItemIndex ? '0' : '-1');

  });

  items[focusedItemIndex].focus();

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

      sep.setAttribute('role', 'separator');

      menuEl.appendChild(sep);

      return;

    }

    const btn = document.createElement('button');

    btn.type = 'button';

    btn.className = `cv-context-menu-item${item.danger ? ' cv-context-menu-item--danger' : ''}`;

    btn.setAttribute('role', 'menuitem');

    btn.textContent = item.label;

    btn.disabled = Boolean(item.disabled);

    btn.setAttribute('tabindex', '-1');

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

  focusMenuItem(0);

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
      const habit = handlers.getHabit(habitId);
      items.push(
        { label: t.contextComplete || 'Complete', action: () => handlers.completeHabit(habitId) },
        { label: t.contextLog || 'Log quantity', action: () => handlers.logHabit(habitId), disabled: !handlers.canLog(habitId) },
        { label: t.contextStats || 'Statistics', action: () => handlers.openStats(habitId) },
        { type: 'separator' }
      );
      if (habit?.archived) {
        items.push({ label: t.contextRestore || 'Restore from archive', action: () => handlers.restoreHabit(habitId) });
      } else if (habit?.paused) {
        items.push({ label: t.contextResume || 'Resume habit', action: () => handlers.resumeHabit(habitId) });
        items.push({ label: t.contextArchive || 'Archive habit', action: () => handlers.archiveHabit(habitId) });
      } else {
        items.push({ label: t.contextPause || 'Pause habit', action: () => handlers.pauseHabit(habitId) });
        items.push({ label: t.contextArchive || 'Archive habit', action: () => handlers.archiveHabit(habitId) });
      }
      items.push(
        { label: t.contextMoveUp || 'Move up', action: () => handlers.moveHabit(habitId, -1), disabled: !handlers.canMove(habitId, -1) },
        { label: t.contextMoveDown || 'Move down', action: () => handlers.moveHabit(habitId, 1), disabled: !handlers.canMove(habitId, 1) },
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

    if (!menuEl) {

      if (e.key === 'Escape') {

        closeMenu();

      }

      return;

    }



    const items = getMenuItems();

    if (e.key === 'Escape') {

      e.preventDefault();

      closeMenu();

      return;

    }

    if (e.key === 'ArrowDown') {

      e.preventDefault();

      focusMenuItem(focusedItemIndex + 1);

      return;

    }

    if (e.key === 'ArrowUp') {

      e.preventDefault();

      focusMenuItem(focusedItemIndex - 1);

      return;

    }

    if (e.key === 'Home') {

      e.preventDefault();

      focusMenuItem(0);

      return;

    }

    if (e.key === 'End') {

      e.preventDefault();

      focusMenuItem(items.length - 1);

      return;

    }

    if ((e.key === 'Enter' || e.key === ' ') && focusedItemIndex >= 0) {

      e.preventDefault();

      items[focusedItemIndex]?.click();

    }

  });

}

