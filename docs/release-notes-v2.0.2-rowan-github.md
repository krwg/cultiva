# Cultiva 2.0.2 · Rowan

**Patch release** · **2026-07-17**  
**Tag:** [2.0.2](https://github.com/krwg/cultiva/releases/tag/2.0.2)  
**Codename:** Rowan

Windows · macOS (Intel + Apple Silicon) · Linux

---

## For users

Stability patch after 2.0.0 / 2.0.1. Your garden stays on this device — no accounts, no telemetry.

### Fixed
- **Habits no longer disappear** after creating an account and opening Calendar — habits stay linked to your session
- **Plugins install and start again** — Settings → Plugins works after the security update that blocked sandboxes
- **macOS close button** — app no longer becomes unreachable; Dock stays available to reopen; Cmd+Q quits cleanly
- **Rowan Cluster background** — animated branches and berries show on macOS (not only a flat dark color)
- **Language switch** (including Russian) applies immediately in Settings
- **Onboarding / garden** — no more `undefined` on buttons or toasts
- **macOS DMG** — branded installer background and volume icon (from 2.0.1)
- **Auto-update restart** after download works reliably when upgrading

### Upgrade notes
- Export a backup under **Settings → Data** before updating if you want a safety copy
- Reinstall plugins from **Settings → Plugins** if a plugin still shows a start error from an older 2.0.1 build

---

## For developers

### App (`krwg/cultiva`)
- Preserve email-style `userId` in `migrateHabit`; flush pending IDB writes before garden↔calendar navigation and on `pagehide`
- Restore `'unsafe-eval'` in production CSP for PLE1 `new Function` sandbox load (`SECURITY.md`)
- Close-to-hide no longer calls `app.dock.hide()`; tray uses PNG + `nativeImage` on darwin with try/catch
- Rowan Cluster: ResizeObserver/startLoop + double-rAF mount after `display:none → block`
- ESLint: `eqeqeq` / `quotes` fixes so `lint-and-build` stays green

### Plugins registry (`krwg/cultiva-plugins`)
- Registry **3.5.1** — weather unit-aware extremes, weekly-stats history bars, integrity CI

### Builds
- CI matrix: Windows (NSIS + portable), macOS (dmg/zip × x64 + arm64), Linux (AppImage + deb)
- Tag format: `2.0.2` (no `v` prefix)
