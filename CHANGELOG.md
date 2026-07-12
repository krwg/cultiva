# Changelog

All notable changes to Cultiva are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/).

## [2.0.0] — Rowan (unreleased)

**Codename:** Rowan · **Registry:** [cultiva-plugins 3.1.1](https://github.com/krwg/cultiva-plugins)

### Added
- **Rowan** theme — graphite black-and-white palette (`#0b0b0b` / `#f4f4f4`)
- **Rowan Cluster** ambient background — «Pulsing Cluster»: zigzag branch tremor, pinnate leaf flicker, pulsing berry clusters with radar rings and falling particles
- `src/core/rowan-cluster-bg.js` canvas animation with `prefers-reduced-motion` static fallback

### Changed
- Version bumped to **2.0.0** (Rowan); no GitHub Release yet
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

[1.7.0]: https://github.com/krwg/cultiva/releases/tag/1.7.0
[1.1.0]: https://github.com/krwg/cultiva/releases/tag/v1.1.0
