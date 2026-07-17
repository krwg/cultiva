# [2.1.1] Rowan: Fix critical bugs

**Patch release** · **2026-07-18**  
**Tag:** [2.1.1](https://github.com/krwg/cultiva/releases/tag/2.1.1)  
**Codename:** Rowan  
**Platform:** Windows (NSIS + Portable)

---

## For users

Critical fixes after 2.1.0. Your garden stays on this device — no accounts, no telemetry.

### Fixed
- **Reload garden** — Ctrl+R / «Обновить сад» no longer wipes the habit list (soft refresh + storage recovery; hard BrowserWindow reload blocked)
- **Footer** — compact height; version centered horizontally and vertically (garden + calendar)
- **Habit data safety** — pending saves no longer race with account/guest reloads; empty flushes cannot clobber a non-empty local backup mirror

### Added
- **Garden activity** toggle in Settings → Calendar — show or hide the year heatmap on the Calendar page

### Upgrade notes
- Export a backup under **Settings → Data** before updating if you want a safety copy
- **macOS / Linux** users: stay on **2.0.2** for now; this tag ships Windows installers only

**Full changelog:** [CHANGELOG.md](https://github.com/krwg/cultiva/blob/main/CHANGELOG.md#211--rowan--2026-07-18)
