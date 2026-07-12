const VERSION_MISMATCH_RE = /app\s+([\d.]+)\s*<\s*required\s+([\d.]+)/i;

export function formatPluginInstallError(detail, t = {}) {
  const raw = String(detail || '').trim();

  const versionMatch = raw.match(VERSION_MISMATCH_RE);
  if (versionMatch) {
    const current = versionMatch[1];
    const required = versionMatch[2];
    const template = t.pluginRequiresVersion
      || 'This plugin requires Cultiva {required}+. You have {current}. Please update the app.';
    return template.replace('{required}', required).replace('{current}', current);
  }

  if (/readPluginFile API missing/i.test(raw)) {
    return t.pluginInstallDesktopOnly || 'Plugins can only be installed in the Cultiva desktop app.';
  }
  if (/manifest\.json missing/i.test(raw)) {
    return t.pluginInstallCorrupt || 'Plugin files are incomplete. Try installing again.';
  }
  if (/entry file missing/i.test(raw)) {
    return t.pluginInstallCorrupt || 'Plugin files are incomplete. Try installing again.';
  }

  return t.pluginInstallStartFailed || 'Plugin could not start. Update Cultiva or try reinstalling the plugin.';
}
