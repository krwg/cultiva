# Changelog

All notable changes to Cultiva are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/).

## [2.1.0] — Rowan · 2026-07-18

**Codename:** Rowan · Windows patch — garden UX, calendar heatmap, installer/icons

[GitHub Release](https://github.com/krwg/cultiva/releases/tag/2.1.0) · [Release notes](docs/release-notes-v2.1.0-rowan-github.md)

### Added
- Calendar page aggregated all-habits contribution heatmap
- Paused / archived habits section with resume/restore
- Trophy Garden empty state: next Legacy tree progress card (settings toggle, default on)

### Fixed
- NSIS BrandingText bound to release codename (Rowan) via `sync-version`
- Windows executable / tray / shortcut icons (`signAndEditExecutable`, tray PNG)
- Compact app footer (version only)

### Builds
- Windows: `Cultiva-Setup-2.1.0.exe`, `Cultiva-Portable-2.1.0.exe`

## [2.0.2] — Rowan · 2026-07-17

**Codename:** Rowan · Patch — data integrity, plugins, macOS lifecycle

[GitHub Release](https://github.com/krwg/cultiva/releases/tag/2.0.2) · [Release notes](docs/release-notes-v2.0.2-rowan-github.md)

### Fixed (users)
- Account habits no longer orphan after calendar navigation (`userId` migration)
- Plugins start again (production CSP `unsafe-eval` for PLE1 sandbox)
- macOS: close no longer leaves an unreachable zombie process (Dock + tray)
- Rowan Cluster animation resumes after layout on macOS
- Russian locale and empty-state / toast copy (carried from 2.0.1 line)

### Fixed (developers)
- Storage flush before Electron garden↔calendar navigate; avoid empty LS clobber
- Tray PNG/`nativeImage` on darwin; menu Quit sets `app.isQuitting`
- ESLint eqeqeq/quotes for CI `lint-and-build`

## [2.0.1] — Rowan · 2026-07-14

**Codename:** Rowan · Patch release — macOS QA bugfixes

[GitHub Release](https://github.com/krwg/cultiva/releases/tag/2.0.1)

### Fixed
- **i18n** — English locale failed to load (`enStatic.default`); fixes `undefined` on first-habit button and habit-planted toast
- **Settings** — Russian (and other lazy locales) apply immediately when changed in Settings
- **Rowan Cluster** — canvas animation resumes after background mount; deferred start when layout is not ready
- **Onboarding** — Skip button no longer shows macOS yellow focus ring
- **Settings** — gear icon in empty “Select section” placeholder
- **macOS** — ghost transparent window after close-to-tray; dock icon hides/shows with tray lifecycle
- **Auto-updater** — removed broken generic feed URL; `quitAndInstall` now sets `app.isQuitting` for reliable restart (1.7.0 → 2.0.0+ upgrades)

### Added
- **macOS DMG** — branded `background.tiff` and `VolumeIcon.icns` for installer drag-and-drop window

## [2.0.0] — Rowan · 2026-07-13

**Codename:** Rowan · **Registry:** [cultiva-plugins 3.3.0](https://github.com/krwg/cultiva-plugins)

[Landing](https://krwg.github.io/cultiva/) · [Full release notes](docs/release-notes-v2.0.0-rowan-github.md) · [GitHub Release](https://github.com/krwg/cultiva/releases/tag/2.0.0)

### Added
- **Plugin contributions API** — plugins can register themes, backgrounds, ambient sounds, and Settings sidebar sections (`manifest.contributes` + `context.ui.registerTheme|registerBackground|registerSound|registerSettingsNav`)
- **Plugin store UX** — full product descriptions, min Cultiva version badge, App Store **Get → Install** flow for new plugins
- **Ambient sound** setting for plugin-contributed audio loops

### Changed
- Plugin store Get/Install follows **local install history** (`cultiva-plugins-ever-installed`), not plugin category
- Plugin card layout and button contrast fixed (Rowan theme, install/get pills)
- Removed redundant catalog plugins: streak, focus-session (registry 3.4.0)
- **Rowan** theme — graphite black-and-white palette (`#0b0b0b` / `#f4f4f4`)
- **Rowan Cluster** ambient background — «Pulsing Cluster»: zigzag branch tremor, pinnate leaf flicker, pulsing berry clusters with radar rings and falling particles
- `src/core/rowan-cluster-bg.js` canvas animation with `prefers-reduced-motion` static fallback

### Fixed
- **Rowan** theme contrast — black text on white/light accent surfaces; white body text on dark backgrounds

### Added (2.0.0 backlog)
- Habit schedule: daily, weekdays, N times per week (`habit-schedule.js`)
- Per-habit native reminders at custom times
- Calendar plugin rail (`onCalendarMount`, `registerCalendarWidget`)
- Lazy-loaded theme and ambient CSS chunks (`shell.css` + `public/styles/themes|ambient`)
- System tray quick-complete with hide-to-tray
- Plugin RPC: `app.getWeeklySummary`, `app.completeHabit` (`habits.write`)
- Tests: auth, hotkeys, modals, habit schedule, plugin RPC

### Changed
- Calendar page gains `bg-linden-bloom` and `bg-rowan-cluster` layers

## [1.7.0] — Linden · 2026-07-09

**Codename:** Linden · **Registry:** [cultiva-plugins 3.0.2](https://github.com/krwg/cultiva-plugins)

[Landing](https://krwg.github.io/cultiva/) · [Full release notes](docs/release-notes-v1.7.0-linden-github.md) · [GitHub Release](https://github.com/krwg/cultiva/releases/tag/1.7.0)

### Added
- First-run onboarding wizard (language, theme, timezone, first habit, backup opt-in)
- Habit templates: Read, Exercise, Meditate, Water, Journal
- Streak grace day — optional one skip per calendar month
- Statistics dashboard — weekly and monthly completion trends
- iCal export for habit completions and calendar events
- Automatic rotating local backups (7 snapshots in `userData/backups/`)
- Import preview before restore (habit count, export date, version)
- Registry **sha256** enforcement before plugin install
- Plugin manifest-driven settings UI; `data.read` RPC for bundled assets
- Hooks: `onHabitComplete`, `onSettingsChange`, `onAppStart`
- `docs/cultiva-plugin.d.ts` for plugin authors
- macOS (dmg, zip — x64 + arm64) and Linux (AppImage, deb) CI builds
- Native shell chrome (`shell-chrome.js`), F1 contextual help, context menu, delayed tooltips
- Linden theme and Linden Bloom ambient background
- GitHub Pages landing (`docs/index.html`)
- Modal focus trap, landmark roles, `prefers-reduced-motion` for ambient animations
- CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md, SUPPORT.md
- Dependabot and `npm audit` in CI
- Vitest: storage, habits, plugin RPC, path guards, registry integrity, iCal, analytics, timezone

### Changed
- Garden and backup UI refactored into `src/app/` controllers
- Incremental habit card updates instead of full garden re-render
- Deferred lazy imports for plugins UI, stats, onboarding, Discord, updates
- Settings: unified grid, custom scrollbars, glyph-s search, Apple-style SVG icons
- Custom dialogs replace native `alert`/`confirm`
- Electron **40**, Vite **6**, electron-builder **26**
- README license corrected to GPL-3.0; publish owner `krwg`
- Plugin `minAppVersion` aligned to **1.7.0**

### Fixed
- Habit delete and full reset persist across reload
- Habits no longer reappear after calendar navigation
- Escape closes the correct modal
- Shell header clicks (profile, calendar) restored
- Plugin cards match habit card sizing in garden
- Weather plugin install via registry `data.read` + cultiva-plugins `baseUrl`
- Lazy import paths for stats and plugins UI

## [1.1.0] — Cypress · 2026-05-30

### Added
- Theme **Cypress** — deep evergreen palette
- Ambient backgrounds: Cypress Drift, Morning Dew, Canopy Sunbeam
- Optional accent color and ambient intensity slider
- Habit search in garden header (`Ctrl/Cmd+F`)
- Keyboard shortcuts for new habit, settings, complete/log, modal dismiss
- ZIP backup export (Electron) alongside JSON

### Changed
- Version source: `cultiva.release.json` synced into branding and `package.json`

### Fixed
- Lint cleanup in habits module

## [0.4.1] and earlier

See [GitHub Releases](https://github.com/krwg/cultiva/releases) for older tags.

[2.0.0]: https://github.com/krwg/cultiva/releases/tag/2.0.0
[1.7.0]: https://github.com/krwg/cultiva/releases/tag/1.7.0
[1.1.0]: https://github.com/krwg/cultiva/releases/tag/v1.1.0
