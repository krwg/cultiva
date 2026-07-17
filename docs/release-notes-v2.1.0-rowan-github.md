# [2.1.0] Rowan: Windows patch

**Patch release** · **2026-07-18**  
**Tag:** [2.1.0](https://github.com/krwg/cultiva/releases/tag/2.1.0)  
**Codename:** Rowan  
**Platform:** Windows (NSIS + Portable)

---

## For users

Windows-focused patch after 2.0.2. Your garden stays on this device — no accounts, no telemetry.

### Added
- **Garden activity heatmap** on the Calendar page — all habits in one GitHub-style year view (darker = more completions that day)
- **Paused section** — paused and archived habits no longer vanish; resume or restore from a dedicated card grid
- **Next Legacy tree** — when Trophy Garden is empty, a habit-style card shows progress toward 365 days (toggle in Settings → Garden, on by default)

### Fixed
- **Installer branding** — NSIS footer shows **Rowan** (no more stale Linden), synced from `cultiva.release.json`
- **Windows icons** — app / tray / shortcut icons embed reliably (`signAndEditExecutable`, tray PNG + `nativeImage`)
- **Footer** — compact version line only

### Upgrade notes
- Export a backup under **Settings → Data** before updating if you want a safety copy
- **macOS / Linux** users: stay on **2.0.2** for now; this tag ships Windows installers only

**Full changelog:** [CHANGELOG.md](https://github.com/krwg/cultiva/blob/main/CHANGELOG.md#210--rowan--2026-07-18)

Closes #161, #162, #163, #164, #165
