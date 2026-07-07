# Changelog

All notable changes to Cultiva are documented here.

## [1.7.0] — Linden · 2026-07-08

### Added
- Automatic rotating local backups (7 snapshots in userData/backups)
- Plugin manifest settings UI (weather, time)
- `cultiva-plugin.d.ts` for plugin authors
- `onHabitComplete` and `onSettingsChange` plugin hooks wired
- Manifest permission enforcement (storage, ui, network)
- Modal focus trap and landmark roles
- `prefers-reduced-motion` support for ambient animations
- CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md
- Dependabot configuration and npm audit in CI
- Tests for plugin RPC, storage migration, plugin path guards

### Changed
- Refactored garden and backup UI into app controllers
- README license corrected to GPL-3.0
- Plugin minAppVersion aligned to 1.7.0

## [1.1.0] — Cypress · 2026-05-30

### Added
- **Theme «Cypress» (Кипарис)** — deep evergreen palette for the release codename.
- **Ambient backgrounds:** Cypress Drift, Morning Dew, Canopy Sunbeam.
- **Customization:** optional accent color and ambient intensity slider.
- **Habit search** in the garden header with keyboard focus (`Ctrl/Cmd+F`).
- **Keyboard shortcuts** for new habit, settings, complete/log, and modal dismiss.
- **ZIP backup export** (Electron) alongside JSON export.
- Vitest coverage for habits and timezone helpers.

### Changed
- Version source of truth: `cultiva.release.json` synced into branding and `package.json`.
- GitHub publish owner updated to **FlokeStudio**.
- Shortcuts section in settings reflects active bindings.

### Fixed
- Lint cleanup in habits module (unused imports and dead code).

## [0.4.1]

Previous stable release — see [docs/RELEASE_0.4.1.md](docs/RELEASE_0.4.1.md).
