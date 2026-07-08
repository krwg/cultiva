let tooltipEl = null;
let showTimer = null;
let hideTimer = null;
let currentTarget = null;

function ensureTooltip() {
  if (tooltipEl) {
    return tooltipEl;
  }
  tooltipEl = document.createElement('div');
  tooltipEl.className = 'cv-tooltip';
  tooltipEl.setAttribute('role', 'tooltip');
  document.body.appendChild(tooltipEl);
  return tooltipEl;
}

function clearTimers() {
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function positionTooltip(target) {
  if (!tooltipEl || !target) {
    return;
  }
  const rect = target.getBoundingClientRect();
  const tipRect = tooltipEl.getBoundingClientRect();
  const margin = 10;
  let top = rect.top - tipRect.height - margin;
  if (top < 8) {
    top = rect.bottom + margin;
  }
  let left = rect.left + (rect.width - tipRect.width) / 2;
  const maxLeft = window.innerWidth - tipRect.width - 8;
  left = Math.max(8, Math.min(maxLeft, left));
  tooltipEl.style.top = `${top + window.scrollY}px`;
  tooltipEl.style.left = `${left + window.scrollX}px`;
}

function showTooltip(target) {
  const text = target?.dataset?.tooltip;
  if (!text) {
    return;
  }
  const el = ensureTooltip();
  el.textContent = text;
  el.classList.add('visible');
  currentTarget = target;
  positionTooltip(target);
}

function hideTooltip() {
  if (!tooltipEl) {
    return;
  }
  tooltipEl.classList.remove('visible');
  currentTarget = null;
}

function scheduleShow(target) {
  clearTimers();
  showTimer = setTimeout(() => showTooltip(target), 500);
}

function scheduleHide() {
  clearTimers();
  hideTimer = setTimeout(() => hideTooltip(), 50);
}

export function initTooltipManager() {
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target || !target.dataset.tooltip) {
      return;
    }
    scheduleShow(target);
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target) {
      return;
    }
    const next = e.relatedTarget;
    if (next && target.contains(next)) {
      return;
    }
    scheduleHide();
  });

  document.addEventListener('focusin', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target || !target.dataset.tooltip) {
      return;
    }
    scheduleShow(target);
  });

  document.addEventListener('focusout', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target) {
      return;
    }
    scheduleHide();
  });

  window.addEventListener('scroll', () => {
    if (currentTarget && tooltipEl?.classList.contains('visible')) {
      positionTooltip(currentTarget);
    }
  }, true);

  window.addEventListener('resize', () => {
    if (currentTarget && tooltipEl?.classList.contains('visible')) {
      positionTooltip(currentTarget);
    }
  });
}
