# Privacy and Security

## Privacy model

Cultiva is **offline-first**:

- Habits and settings stay in **local IndexedDB**
- **No** analytics, crash reporters, or account system
- **No** automatic cloud sync
- Optional **Discord Rich Presence** only when Discord is running locally
- Plugins may use **network** only if declared (e.g. weather API, radio streams)

You control exports: JSON, ZIP, iCal. Auto-backups stay on disk in the app data folder.

## Plugin sandbox

- Code runs in an **opaque-origin iframe**
- No `window.electron` or main-window DOM access from plugin JS
- UI via audited bridge: sheets, header updates, garden widgets
- **sha256** verification on install from official registry

Install only from [cultiva-plugins](https://github.com/krwg/cultiva-plugins) unless you audit third-party code yourself.

## Supported versions

| Version | Security support |
|---------|------------------|
| 2.0.x | Yes |
| 1.7.x | Best effort |
| 1.1.x | Best effort |
| &lt; 1.1 | No |

## Reporting vulnerabilities

**Do not** file public GitHub issues for security bugs.

Email: **shevotsukov@icloud.com** (see [SECURITY.md](https://github.com/krwg/cultiva/blob/main/SECURITY.md))

Include reproduction steps, impact, and affected version.

## License

- **Cultiva app:** GPL-3.0
- **Official plugins:** MIT (separate repo)

## Sandbox note for auditors

Plugin sandbox uses `new Function()` for plugin entry — required for dynamic loading. CSP and RPC allowlist limit exposure. See `src/core/plugin-sandbox-host.js`.
