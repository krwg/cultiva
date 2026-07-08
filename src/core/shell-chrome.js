function readCssVar(name) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return raw || null;
}

export function syncNativeShellChrome() {
  if (!window.electron?.setTitleBarOverlay) {
    return;
  }

  const bg = readCssVar('--bg-primary') || '#1c1c1e';
  const text = readCssVar('--text-primary') || '#f5f5f7';
  const symbol = readCssVar('--text-secondary') || text;

  window.electron.setTitleBarOverlay({
    color: bg,
    symbolColor: symbol,
    height: 32
  });
}

export function readThemeCssColor(varName) {
  return readCssVar(varName);
}
