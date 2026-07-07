import { habits } from '../modules/habits.js';

let quantityLogResolve = null;

let quantityLogModal = null;
let quantityLogInput = null;
let quantityLogTitle = null;
let quantityLogDesc = null;
let quantityLogLabel = null;

let activeModal = null;
let previousFocus = null;
let trapHandler = null;

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(modal) {
  if (!modal) {
    return [];
  }
  return Array.from(modal.querySelectorAll(FOCUSABLE)).filter((el) => {
    return el.offsetParent !== null || el === document.activeElement;
  });
}

function releaseFocusTrap() {
  if (trapHandler && activeModal) {
    activeModal.removeEventListener('keydown', trapHandler);
  }
  trapHandler = null;
  activeModal = null;
  if (previousFocus && typeof previousFocus.focus === 'function') {
    try {
      previousFocus.focus();
    } catch {
      void 0;
    }
  }
  previousFocus = null;
}

function installFocusTrap(modal) {
  releaseFocusTrap();
  activeModal = modal;
  previousFocus = document.activeElement;
  trapHandler = (e) => {
    if (e.key !== 'Tab' || !activeModal) {
      return;
    }
    const nodes = getFocusableElements(activeModal);
    if (!nodes.length) {
      e.preventDefault();
      return;
    }
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  modal.addEventListener('keydown', trapHandler);
  const nodes = getFocusableElements(modal);
  const target = nodes[0] || modal.querySelector('.modal-sheet') || modal;
  if (target && typeof target.focus === 'function') {
    setTimeout(() => target.focus(), 30);
  } else if (target && !target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
    setTimeout(() => target.focus(), 30);
  }
}

export function configureModals(el) {
  quantityLogModal = el.quantityLogModal;
  quantityLogInput = el.quantityLogInput;
  quantityLogTitle = el.quantityLogTitle;
  quantityLogDesc = el.quantityLogDesc;
  quantityLogLabel = el.quantityLogLabel;
}

export function openModal(modal) {
  if (!modal) {
    return;
  }
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (!modal.hasAttribute('role')) {
    modal.setAttribute('role', 'dialog');
  }
  modal.setAttribute('aria-modal', 'true');
  installFocusTrap(modal);
}

export function closeModal(modal) {
  if (!modal) {
    return;
  }
  if (modal.id === 'quantity-log-modal' && quantityLogResolve) {
    const done = quantityLogResolve;
    quantityLogResolve = null;
    done(null);
  }
  modal.classList.remove('active');
  document.body.style.overflow = '';
  if (activeModal === modal) {
    releaseFocusTrap();
  }
}

export function completeQuantityLogWithValue(parsed) {
  const done = quantityLogResolve;
  quantityLogResolve = null;
  if (quantityLogModal) {
    quantityLogModal.classList.remove('active');
    if (activeModal === quantityLogModal) {
      releaseFocusTrap();
    }
  }
  document.body.style.overflow = '';
  if (done) {
    done(parsed);
  }
}

export function openQuantityLogModal(habit, currentValue, t) {
  return new Promise((resolve) => {
    quantityLogResolve = resolve;
    if (quantityLogTitle) {
      quantityLogTitle.textContent = habit.treeName || habit.name;
    }
    if (quantityLogDesc) {
      const goal = habits.quantityTarget(habit);
      const bits = [`${t.goal}: ${goal}`];
      if (habit.unit) {
        bits.push(String(habit.unit));
      }
      if (t.quantityLogSubtitle) {
        bits.push(t.quantityLogSubtitle);
      }
      quantityLogDesc.textContent = bits.join(' — ');
    }
    if (quantityLogLabel) {
      quantityLogLabel.textContent = t.quantityLogLabel || t.quantityLogPrompt || 'Total for today';
    }
    if (quantityLogInput) {
      quantityLogInput.value = String(currentValue);
      openModal(quantityLogModal);
      setTimeout(() => {
        quantityLogInput.focus();
        quantityLogInput.select();
      }, 50);
    } else {
      quantityLogResolve = null;
      resolve(null);
    }
  });
}
