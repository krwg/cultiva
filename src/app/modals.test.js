/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { openModal, closeModal, closeTopModal } from './modals.js';

describe('modals closeTopModal', () => {
  let modal;

  beforeEach(() => {
    modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'test-modal';
    modal.innerHTML = '<div class="modal-overlay"></div><div class="modal-sheet"></div>';
    document.body.appendChild(modal);
    openModal(modal);
  });

  afterEach(() => {
    modal?.remove();
  });

  it('closes the active modal', () => {
    expect(modal.classList.contains('active')).toBe(true);
    closeTopModal([modal]);
    expect(modal.classList.contains('active')).toBe(false);
  });

  it('closeModal removes active class', () => {
    closeModal(modal);
    expect(modal.classList.contains('active')).toBe(false);
  });
});
