const SVG_ATTRS = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

export const UPDATE_STATUS_ICONS = {
  checking: `<svg ${SVG_ATTRS}><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/><path d="M11 8v3.2l2 1.8"/><path d="M18.5 6.5a7 7 0 0 0-11 8.2"/></svg>`,
  available: `<svg ${SVG_ATTRS}><path d="M12 3v10"/><path d="M8.5 9.5 12 13l3.5-3.5"/><path d="M5 17h14"/></svg>`,
  downloading: `<svg ${SVG_ATTRS}><path d="M12 3v10"/><path d="M8.5 9.5 12 13l3.5-3.5"/><path d="M5 17h14"/></svg>`,
  downloaded: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"/><path d="M8 12.2 10.8 15 16 9.5"/></svg>`,
  uptodate: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"/><path d="M8 12.2 10.8 15 16 9.5"/></svg>`,
  error: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6"/><path d="M15 9l-6 6"/></svg>`,
  browser: `<svg ${SVG_ATTRS}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg>`,
  info: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"/><path d="M12 10v6"/><path d="M12 7h.01"/></svg>`
};

export const CHECK_UPDATES_ICON = `<svg ${SVG_ATTRS}><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/><path d="M18.5 6.5a7 7 0 0 0-11 8.2"/><path d="M11 8v3.2l2 1.8"/></svg>`;

export function setSvgIcon(el, svg) {
  if (!el) {
    return;
  }
  el.innerHTML = svg;
  el.classList.add('ui-icon');
}
