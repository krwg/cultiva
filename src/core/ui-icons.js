const STROKE_ATTRS = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
const FILL_ATTRS = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"';

function materialIcon(pathD) {
  return `<svg ${FILL_ATTRS}><path d="${pathD}"/></svg>`;
}

export const MATERIAL = {
  search: materialIcon('M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 9.5 5 13 7.01 13 9.5 11.99 14 9.5 14z'),
  autorenew: materialIcon('M12 6V3L8 7l4 4V8c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-2.76 0-5-2.24-5-5 0-.65.13-1.26.36-1.83l-1.46-1.46C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z'),
  systemUpdate: materialIcon('M17 1.01 7 1c-1.1 0-2 .9-2 2v5h2V3h10v12H7v-2H5v6c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM14 13h-2.5v5H11v-5H8l4-4 4 4z'),
  checkCircle: materialIcon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'),
  error: materialIcon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'),
  info: materialIcon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'),
  openInNew: materialIcon('M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z'),
  download: materialIcon('M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z'),
  person: materialIcon('M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'),
  palette: materialIcon('M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'),
  notifications: materialIcon('M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z'),
  keyboard: materialIcon('M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z'),
  eco: materialIcon('M6.05 8.05c-2.73 2.73-2.73 7.17 0 9.9C7.42 19.32 9.21 20 11 20s3.58-.68 4.95-2.05C19.43 15.17 20 13.13 20 11c0-1.21-.26-2.39-.75-3.45L17.45 9.2C17.75 9.77 18 10.38 18 11c0 1.1-.45 2.1-1.17 2.83-1.56 1.56-4.1 1.56-5.66 0C9.9 12.45 9.45 11.45 9.45 10.35c0-.62.25-1.23.55-1.8L7.3 6.3C6.74 6.74 6.35 7.36 6.05 8.05zM12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z'),
  barChart: materialIcon('M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z'),
  calendarMonth: materialIcon('M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z'),
  forum: materialIcon('M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z'),
  folder: materialIcon('M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z'),
  extension: materialIcon('M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z'),
  add: materialIcon('M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'),
  close: materialIcon('M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'),
  check: materialIcon('M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'),
  formatListNumbered: materialIcon('M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z'),
  manageSearch: materialIcon('M7 9H2V7h5v2h5v2H9v5H7V9zm14 6c0-1.3-.41-2.52-1.09-3.51l1.46 1.46C22.04 16.08 22.5 14.36 22.5 12.5 22.5 8.36 19.14 5 15 5c-.36 0-.71.03-1.05.08l1.46 1.46C16.17 6.65 17 9.22 17 12.5c0 2.1-.85 4.04-2.23 5.44L13.31 16.5c.82-1.03 1.31-2.32 1.31-3.74 0-3.31-2.69-6-6-6s-6 2.69-6 6 2.69 6 6 6c1.42 0 2.71-.49 3.74-1.31l2.69 2.69 1.41-1.41-2.69-2.69C12.96 15.59 12 14.07 12 12.5 12 9.19 14.69 6.5 18 6.5c1.57 0 3.09.49 4.32 1.41l1.41-1.41C21.78 4.83 19.93 4 18 4c-4.14 0-7.5 3.36-7.5 7.5z'),
  settings: materialIcon('M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z')
};

export const UPDATE_STATUS_ICONS = {
  checking: MATERIAL.autorenew,
  available: MATERIAL.systemUpdate,
  downloading: MATERIAL.download,
  downloaded: MATERIAL.checkCircle,
  uptodate: MATERIAL.checkCircle,
  error: MATERIAL.error,
  browser: MATERIAL.openInNew,
  info: MATERIAL.info
};

export const CHECK_UPDATES_ICON = MATERIAL.manageSearch;

export const SETTINGS_SIDEBAR_ICONS = {
  profile: MATERIAL.person,
  appearance: MATERIAL.palette,
  notifications: MATERIAL.notifications,
  shortcuts: MATERIAL.keyboard,
  garden: MATERIAL.eco,
  statistics: MATERIAL.barChart,
  calendar: MATERIAL.calendarMonth,
  discord: MATERIAL.forum,
  data: MATERIAL.folder,
  updates: MATERIAL.systemUpdate,
  plugins: MATERIAL.extension,
  about: MATERIAL.info
};

export function setSvgIcon(el, svg) {
  if (!el) {
    return;
  }
  el.innerHTML = svg;
  el.classList.add('ui-icon');
}

export function initSettingsSidebarIcons() {
  document.querySelectorAll('.settings-sidebar-item[data-section]').forEach((item) => {
    const section = item.dataset.section;
    const iconHost = item.querySelector('.sidebar-icon');
    const svg = SETTINGS_SIDEBAR_ICONS[section];
    if (iconHost && svg) {
      setSvgIcon(iconHost, svg);
    }
  });
}

export function initSettingsEmptyIcon() {
  const iconHost = document.querySelector('#settings-empty .empty-state-icon');
  if (iconHost) {
    setSvgIcon(iconHost, MATERIAL.settings);
  }
}

export function initHabitFormIcons() {
  const yesIcon = document.querySelector('input[name="track-type"][value="binary"]')?.closest('.radio-card')?.querySelector('.radio-icon');
  const qtyIcon = document.querySelector('input[name="track-type"][value="quantity"]')?.closest('.radio-card')?.querySelector('.radio-icon');
  if (yesIcon) {
    setSvgIcon(yesIcon, MATERIAL.check);
  }
  if (qtyIcon) {
    setSvgIcon(qtyIcon, MATERIAL.formatListNumbered);
  }
}
