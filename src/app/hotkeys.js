
export function initHotkeys(h) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      h.closeTopModal();
      return;
    }
    if (e.key === 'F1' || (e.key === '?' && e.shiftKey)) {
      e.preventDefault();
      if (typeof h.openHelp === 'function') {
        h.openHelp();
      }
      return;
    }

    const tag = e.target && e.target.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable;
    const mod = e.ctrlKey || e.metaKey;

    if (mod && e.key.toLowerCase() === 'n' && !e.shiftKey) {
      e.preventDefault();
      h.openAddModal();
      return;
    }
    if (mod && e.key === ',') {
      e.preventDefault();
      h.openSettings();
      return;
    }
    if (mod && e.key.toLowerCase() === 'f' && !e.shiftKey) {
      e.preventDefault();
      h.focusSearch();
      return;
    }
    if (mod && e.key.toLowerCase() === 'f' && e.shiftKey) {
      e.preventDefault();
      if (typeof h.toggleFocusMode === 'function') {
        h.toggleFocusMode();
      }
      return;
    }
    if (mod && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      if (typeof h.reloadGarden === 'function') {
        h.reloadGarden();
      }
      return;
    }
    if (typing) {
      return;
    }
    if (mod && e.key === 'Enter') {
      e.preventDefault();
      h.completeHighlighted();
      return;
    }
    if (mod && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      h.logQuantityHighlighted();
      return;
    }
    if (!mod && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      if (typeof h.moveFocusedHabit === 'function') {
        e.preventDefault();
        h.moveFocusedHabit(e.key === 'ArrowDown' ? 1 : -1);
      }
    }
  });
}
