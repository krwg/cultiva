# Cultiva 1.7.0 · Linden

**Released:** 2026-07-09  
**Tag:** [1.7.0](https://github.com/krwg/cultiva/releases/tag/1.7.0)  
**Codename:** Linden  
**Companion registry:** [cultiva-plugins 3.0.2](https://github.com/krwg/cultiva-plugins)  
**License:** GPL-3.0

---

## More. Faster. On Every Platform.

**1.7.0 Linden** is Cultiva's biggest update since Cypress. The interface is rebuilt around a quiet garden: less noise, more clarity, full localization, and native installers for **Windows, macOS, and Linux**.

This release represents **44 commits** since 1.1.0 — from the first-run wizard to sha256 integrity checks on every official plugin.

---

## Numbers That Matter

| | |
|:--|:--|
| **+38%** | UI strings — **285** EN/RU pairs (was 207 at 1.1.0) |
| **~20%** | Faster cold start — Discord, updates, stats, and plugin catalog load on demand |
| **up to 10×** | Less DOM work when marking a habit — one card updates, not the whole garden |
| **3** | Operating systems — Windows, macOS (Intel + Apple Silicon), Linux |
| **7** | Install formats — NSIS, portable, dmg ×2, zip ×2, AppImage, deb |
| **18** | Themes — including **Linden** and **Cypress** |
| **13** | Animated backgrounds + custom upload |
| **5** | Growth stages — Seed → Legacy (365+ days) |
| **6** | Official plugins — weather, time, radio, pomodoro, quotes, streaks |
| **1,071** | Cities in offline weather catalog (Russia) |
| **500** | Quotes per language (EN + RU) — fully offline |
| **7** | Rotating auto-backups on disk |
| **1** | Grace day per month — optional streak forgiveness |
| **0** | Required accounts, cloud sync, or telemetry |

---

## Garden. Reimagined.

**First launch that guides, not overwhelms.**  
Onboarding covers language, theme, timezone, your first habit, and optional auto-backup. Five templates — *Reading, Sports, Meditation, Water, Journal* — so you never start from an empty field.

**Streaks that forgive.**  
Enable *grace day* in Settings: **one missed day per calendar month** does not reset your streak.

**Statistics that matter.**  
Weekly and monthly completion trends for all habits — in Settings, with no subscriptions.

**A garden that stays still.**  
Mark a habit — only that card updates. Plugin widgets match habit card size. Context menus, tooltips, and empty states with clear actions.

**F1 — help where you are.**  
Contextual shortcuts in English and Russian for garden, settings, calendar, and plugins.

---

## Data. Only Yours.

| Format | Contents |
|--------|----------|
| **JSON** | Habits + settings |
| **ZIP** | Full portable archive |
| **iCal (.ics)** | Habit completions + calendar events |
| **Auto-backup** | 7 rotating snapshots in the app data folder |

Import shows a **preview** first: export date, app version, habit count.

**Fixed:** habit delete and full reset now persist after reload. Full reset also removes installed plugins.

---

## Plugins. Safe. Extensible.

Every official plugin is **sha256-verified** from the [cultiva-plugins](https://github.com/krwg/cultiva-plugins) registry.

Plugins run in a **sandbox** with declared `network`, `storage`, and `ui` permissions. Settings from `manifest.json` appear in Cultiva automatically. Hooks `onHabitComplete` and `onSettingsChange` let widgets react to your day.

---

## Linden. A New Look.

- Native desktop shell — title bar, menu, update indicator
- Flat buttons, unified settings grid, custom scrollbars
- **Linden** theme and **Linden Bloom** background
- Apple-style SVG icons in settings; [green landing](https://krwg.github.io/cultiva/) on GitHub Pages
- Settings search (glyph-s), custom dialogs instead of system alerts
- `prefers-reduced-motion` respected for ambient animations

---

## Calendar

Same themes and backgrounds as the garden. Events export to iCal with habits. Your timezone, not a server default.

---

## Installation

| Platform | File |
|----------|------|
| Windows | `Cultiva-Setup-1.7.0.exe`, `Cultiva-Portable-1.7.0.exe` |
| macOS Intel | `Cultiva-1.7.0-mac-x64.dmg` (+ `.zip`) |
| macOS Apple Silicon | `Cultiva-1.7.0-mac-arm64.dmg` (+ `.zip`) |
| Linux | `Cultiva-1.7.0-linux-x86_64.AppImage`, `Cultiva-1.7.0-linux-amd64.deb` |

Data lives in **IndexedDB** locally. No account required.

**From 1.1.0 Cypress:** garden data is preserved. Export a backup before upgrading as a precaution.

---

## For Developers

| Metric | Value |
|--------|-------|
| Commits since v1.1.0 | 44 |
| Vitest | 8 files, 28 tests |
| i18n keys | 285 (EN = RU) |
| Electron / Vite / e-b | 40 / 6 / 26 |

```bash
npm ci && npm test && npm run electron:build
```

See [CHANGELOG.md](../CHANGELOG.md) and [docs/PLUGIN_AUTHOR_GUIDE.md](PLUGIN_AUTHOR_GUIDE.md).

---

## Links

| Resource | URL |
|----------|-----|
| Repository | https://github.com/krwg/cultiva |
| Landing | https://krwg.github.io/cultiva/ |
| Plugins | https://krwg.github.io/cultiva-plugins/ |
| Wiki | https://github.com/krwg/cultiva/wiki |

---

*Thank you for growing your habits with Cultiva.*
