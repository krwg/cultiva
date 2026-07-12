# Cultiva 2.0.0 · Rowan

**Draft release · 2026-07-13**  
**Tag:** [2.0.0](https://github.com/krwg/cultiva/releases/tag/2.0.0) *(pending publish)*  
**Codename:** Rowan  
**Companion registry:** [cultiva-plugins 3.5.x](https://github.com/krwg/cultiva-plugins)  
**License:** GPL-3.0

---

## Graphite. Extensible. Still Offline.

**2.0.0 Rowan** is Cultiva's largest feature release since multi-platform Linden. Plugin authors can ship **custom themes and backgrounds** without forking the app. The garden gains **schedules, reminders, and tray quick-complete**. Under the hood, **CoreV6**, **GrowthKit3**, **IDB3**, and **PLE1** (Plugin Engine 1) power a faster, sandboxed desktop experience — still **zero accounts, zero telemetry**.

This release represents **36 commits** since 1.7.0 Linden — from the Rowan palette to eight performance issues closed, plus the full PLE1 plugin surface.

---

## Numbers That Matter

| | |
|:--|:--|
| **+22%** | UI strings — **~348** EN/RU pairs (was 285 in 1.7.0) |
| **+121%** | Automated tests — **62** cases in **19** Vitest files (was 28 / 8) |
| **+200%** | Plugin RPC surface — **57** allowlisted methods (was ~19 in 1.7.0) |
| **~25%** | Faster perceived cold start — lazy CSS, deferred plugins, locale chunks, Discord defer |
| **up to 10×** | Less DOM work when marking habits — incremental garden card sync (carried + refined) |
| **19** | Themes — **Rowan** (graphite B&W), **Birch** (light B&W), Linden, Cypress, … |
| **14** | Animated backgrounds + custom upload — including **Rowan Cluster** canvas |
| **9** | Official plugins in registry — 3 new for 2.0 (Weekly Stats, Routine, Gentle Nudge) |
| **12** | Active habit slots (raised from implicit cap) |
| **7** | Rotating auto-backups on disk |
| **1** | Grace day per month — optional streak forgiveness |
| **0** | Required accounts, cloud sync, or telemetry |

### Engine stack

| Engine | Role |
|--------|------|
| **CoreV6** | App shell, settings, i18n, release pipeline |
| **GrowthKit3** | Habit growth stages, schedules, analytics |
| **IDB3** | IndexedDB persistence, incremental writes, connection cache |
| **PLE1** | Plugin sandbox, contributions API, 57 RPC methods, hooks |

---

## Rowan & Birch. A New Look.

- **Rowan** theme — strict graphite black-and-white (`#0b0b0b` / `#f4f4f4`); contrast fixes for light accent surfaces
- **Birch** theme — true light monochrome palette (White Rowan); `extends` target for plugin themes
- **Rowan Cluster** ambient — canvas «Pulsing Cluster»: trembling branches, flickering pinnate leaves, pulsing berry probes with radar rings; `prefers-reduced-motion` static fallback
- Calendar page — **Linden Bloom** and **Rowan Cluster** background layers
- Material Design icons in Settings; Russian categories, templates, placeholders, holidays
- Plugin store — full descriptions, **minAppVersion** badge, **Get → Install** from local install history

---

## PLE1 — Plugin Engine 1

Plugins can extend Cultiva without app updates:

| Capability | API |
|------------|-----|
| **Themes** | `manifest.contributes.themes` or `registerTheme` — `extends`, `variables`, `monochrome` |
| **Backgrounds** | CSS + optional `html` layers |
| **Sounds** | Ambient loops in Settings |
| **Fonts & presets** | `registerFont`, `registerAppearancePreset` |
| **Settings nav** | Extra sidebar sections |
| **App bridge** | `setTheme`, `setBackground`, `previewTheme`, `setLang`, `setFocusMode`, `openSettings`, `openCalendar`, … |
| **Habits** | `getHabit`, `getHabitsCompletedToday`, `logQuantity`, `completeHabit`, `getWeeklySummary` |
| **UI** | `confirm`, `alert`, `openExternal`, `setHeaderBadge`, `focusHabit` |
| **Storage** | `listKeys` |
| **Hooks** | `onThemeApplied`, `onBackgroundApplied`, `onLanguageChange`, `onFocusModeChange`, `onHabitComplete`, `onSettingsChange` |

Friendly install errors: *«Плагину нужна Cultiva 2.0.0+. Обновите приложение.»* instead of sandbox stack traces.

Author docs: [PLUGIN_AUTHOR_GUIDE.md](PLUGIN_AUTHOR_GUIDE.md) · [cultiva-plugin.d.ts](cultiva-plugin.d.ts)

---

## Habits, Calendar & Tray

- **Schedules** — daily, weekdays, N times per week (`habit-schedule.js`)
- **Reminders** — per-habit native notifications at custom times
- **Tray** — quick-complete from system tray; hide-to-tray on desktop
- **Calendar plugins** — `registerCalendarWidget`, `onCalendarMount`
- **Completion undo** — toast to reverse accidental taps
- **CSV export** — habit data alongside JSON / ZIP / iCal

---

## Performance (Rowan sprint)

Eight focused optimizations shipped in 2.0.0:

1. **shell.css** — split monolithic CSS; lazy theme/ambient chunks  
2. **Ambient pause** — stop canvas/CSS animations when window hidden; low-power preset  
3. **IDB3** — connection cache, incremental habit writes, coalesced saves  
4. **Deferred plugins** — `onAppStart` and registry fetch after first paint  
5. **Vite chunks** — manual splits; lazy Russian locale  
6. **Garden** — incremental card sync, debounced search  
7. **Calendar** — completion index, reusable week header  
8. **Electron** — Discord RPC deferred until `ready-to-show`

---

## Data. Only Yours.

| Format | Contents |
|--------|----------|
| **JSON** | Habits + settings |
| **ZIP** | Full portable archive |
| **CSV** | Habit export |
| **iCal (.ics)** | Habit completions + calendar events |
| **Auto-backup** | 7 rotating snapshots in the app data folder |

Import shows a **preview** first. Full reset removes installed plugins.

---

## Installation

| Platform | File |
|----------|------|
| Windows | `Cultiva-Setup-2.0.0.exe`, `Cultiva-Portable-2.0.0.exe` |
| macOS Intel | `Cultiva-2.0.0-mac-x64.dmg` (+ `.zip`) |
| macOS Apple Silicon | `Cultiva-2.0.0-mac-arm64.dmg` (+ `.zip`) |
| Linux | `Cultiva-2.0.0-linux-x86_64.AppImage`, `Cultiva-2.0.0-linux-amd64.deb` |

Data lives in **IndexedDB** locally. No account required.

**Upgrading from 1.7.0 or 1.1.0:** garden data is preserved. Export a backup under **Settings → Data** before updating, just in case.

---

## For Developers

| Metric | 1.7.0 Linden | 2.0.0 Rowan | Δ |
|--------|--------------|-------------|---|
| Commits (since prior major) | 44 (since 1.1.0) | 36 (since 1.7.0) | — |
| Vitest files / tests | 8 / 28 | 19 / 62 | **+138% / +121%** |
| i18n string pairs | 285 | ~348 | **+22%** |
| Plugin RPC methods | ~19 | 57 | **+200%** |
| Themes / backgrounds | 18 / 13 | 19 / 14 | +1 / +1 |
| Engines | CoreV5 · GK2 · IDB2 | CoreV6 · GK3 · IDB3 · PLE1 | major bump |

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

## Previous releases

- [1.7.0 · Linden](release-notes-v1.7.0-linden-github.md)
- [1.1.0 · Cypress](release-notes-v1.1.0-cypress-github.md)

---

*Thank you for growing your habits with Cultiva.*
