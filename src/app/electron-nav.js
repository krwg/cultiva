export function bindElectronPageLinks() {
  if (!window.electron?.navigateTo) {
    return;
  }

  document.querySelectorAll('a[href]').forEach((anchor) => {
    const href = String(anchor.getAttribute('href') || '').trim();
    if (!href || /^https?:/i.test(href) || href.startsWith('#')) {
      return;
    }

    const isCalendar = href.includes('calendar');
    const isHome = /(^|\/|\.\.\/)index\.html$/i.test(href) || href === '/' || href === './';
    if (!isCalendar && !isHome) {
      return;
    }

    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      void window.electron.navigateTo(
        isCalendar ? 'pages/calendar/index.html' : 'index.html'
      );
    });
  });
}
