/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest';
import { initHotkeys } from '../app/hotkeys.js';

describe('hotkeys', () => {
  it('Escape calls closeTopModal', () => {
    const closeTopModal = vi.fn();
    const handlers = {
      closeTopModal,
      openAddModal: vi.fn(),
      openSettings: vi.fn(),
      focusSearch: vi.fn(),
      completeHighlighted: vi.fn(),
      logQuantityHighlighted: vi.fn()
    };
    initHotkeys(handlers);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closeTopModal).toHaveBeenCalled();
  });

  it('Ctrl+N opens add modal when not typing', () => {
    const openAddModal = vi.fn();
    initHotkeys({ closeTopModal: vi.fn(), openAddModal, openSettings: vi.fn(), focusSearch: vi.fn(), completeHighlighted: vi.fn(), logQuantityHighlighted: vi.fn() });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', ctrlKey: true }));
    expect(openAddModal).toHaveBeenCalled();
  });
});
