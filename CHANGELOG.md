# Changelog

All notable changes to Cultiva are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/).

## [2.3.5] — Rowan · 2026-07-20

**Codename:** Rowan · glyph-s 2.8.0 companion sync

[GitHub Release](https://github.com/krwg/cultiva/releases/tag/2.3.5) · [Release notes](docs/release-notes-v2.3.5-rowan-github.md)

### Changed
- Vendored **[glyph-s 2.8.0](https://github.com/FlokeStudio/glyph-s)** — expanded query tests upstream, benchmark tooling, embeddings hook (disabled in Cultiva UI; local ranking only)
- Settings → Search and landing: compact **Glyph · Floke Studio** family banner with links to glyph-s, glyph-sO, glyph-mi, and Floke
- Electron main-process **KNN IPC scaffold** (`glyph:knn:load` / `glyph:knn:query`) for future glyph-mi integration
- Settings Search copy shows engine **2.8.0**

### Notes
- Obsidian UX from Glyph 2.8 (persistent index, highlight, sidebar MI, frontmatter batch) lives in [glyph-sO](https://github.com/FlokeStudio/glyph-sO) / [glyph-miO](https://github.com/FlokeStudio/glyph-miO)
- Companion registry unchanged — plugin installs still prefer jsDelivr + LF sha256

## [2.3.4] — Rowan · 2026-07-19

**Codename:** Rowan · glyph-s 2.7.2 · Plugin install integrity

[GitHub Release](https://github.com/krwg/cultiva/releases/tag/2.3.4) · [Release notes](docs/release-notes-v2.3.4-rowan-github.md)

### Changed
- Vendored **[glyph-s 2.7.2](https://github.com/FlokeStudio/glyph-s)** — full-text fast-path includes note/body text; search profiles in `profiles.js`
- Settings Search copy shows engine **2.7.2**; link to Glyph family in release notes

### Fixed
- Plugin install integrity: always refetch official registry on install; prefer **jsDelivr** mirror so sha256 cannot lag behind a stale `raw.githubusercontent.com` CDN edge
- Integrity hash for text plugin files normalized to LF before compare (matches registry / GitHub raw)
- Plugin store catalog fetch prefers jsDelivr with raw GitHub fallback

### Notes
- Companion registry **3.6.3** — aligned store descriptions; Radio **2.6.x**
- Glyph engine: [FlokeStudio/glyph-s](https://github.com/FlokeStudio/glyph-s) · [glyph-sO](https://github.com/FlokeStudio/glyph-sO) · [Floke](https://flokestudio.github.io/Floke/)

## [2.3.3] — Rowan · 2026-07-19

**Codename:** Rowan · PE2 tray merge · Radio 2.5 companion

[GitHub Release](https://github.com/krwg/cultiva/releases/tag/2.3.3) · [Release notes](docs/release-notes-v2.3.3-rowan-github.md)

### Added
- PE2 tray contributions merge by plugin id (Weather + Radio coexist)
- Sheet `data-url` action payloads for plugin UI chips

### Notes
- Companion Radio **2.6.1** (Neo atmosphere restored with live analyser) · registry **3.6.1**
- Cultiva **1.7** still accepted by Radio `minAppVersion`, but **1.7 support is ending soon** — use **2.0+**

## [2.3.2] — Rowan · 2026-07-18

**Codename:** Rowan · Dev Mode hide fix · Weather tray °

[GitHub Release](https://github.com/krwg/cultiva/releases/tag/2.3.2) · [Release notes](docs/release-notes-v2.3.2-rowan-github.md)

### Fixed
- **Developer Mode** sidebar no longer stuck visible after Hide / Turn off (`display:flex` overrode `hidden`)
- Weather tray temperature (tooltip + menu); companion Weather **2.7.2** / registry **3.5.7**

### Notes

## [2.3.1] — Rowan · 2026-07-18

**Codename:** Rowan · Discord prefs · Dev Mode polish · PE2 tray · Weather tray °

[GitHub Release](https://github.com/krwg/cultiva/releases/tag/2.3.1) · [Release notes](docs/release-notes-v2.3.1-rowan-github.md)

### Added
- Discord Rich Presence: display modes, per-field toggles, image style, custom text
- Developer Mode: hide/turn-off, animated background, habit disable tools, more flags
- Habit **Disable** / **Enable** (context menu + Dev panel); disabled habits leave the garden
- PE2 tray APIs: `setTrayTooltip`, `registerTrayItems`, `clearTrayItems`
- Companion Weather **2.7.1** — tray temperature; Neo night/blue-hour forecast contrast (registry **3.5.6**)

### Fixed
- Empty tray tooltip no longer forced to a stale label when plugins clear it
- Weather Neo forecast text contrast on dark sky phases

### Notes
- Developer Mode starts hidden each session; unlock with 7 taps on the footer version

## [2.3.0] — Rowan · 2026-07-18

**Codename:** Rowan · Developer Mode · green lint · Weather Neo solar skies

[GitHub Release](https://github.com/krwg/cultiva/releases/tag/2.3.0) · [Release notes](docs/release-notes-v2.3.0-rowan-github.md)

### Added
- **Developer Mode** — 7 taps on footer version; Settings → Developer; `window.cultivaDev`
- Session overrides for `LEGACY_THRESHOLD` / bed & garden caps; feature-flag panel; RPC inspector
- Floating **Exit Focus** chip when chrome is hidden
- Companion **Weather Neo 2.7.0** — solar phases, sunrise/sunset, light text on dark skies (registry **3.5.5**)

### Fixed
- ESLint green again: ignore vendored `src/core/glyph-s/**`; `eqeqeq` null-ignore; remaining app equality fixes

### Notes

## [2.2.0] — Rowan · 2026-07-18

**Codename:** Rowan · Horizontal beds · settings IA · glyph-s 2.7 · Discord activity presence

[GitHub Release](https://github.com/krwg/cultiva/releases/tag/2.2.0) · [Release notes](docs/release-notes-v2.2.0-rowan-github.md)

### Added
- Garden **beds as horizontal rows** under plugin widgets (max 3 habits; rename/delete; `BED_FULL` toast)
- Settings **Focus** section; **Storage** (ex-Data) with cache subsection + clear animation
- Updates: check / auto-update toggles; Check uses Search magnifier icon
- Per-plugin notification mutes; Material sidebar icons
- Vendored **glyph-s 2.7** + header search visibility toggle + rebuild progress
- Discord Rich Presence: activity from garden stats, stable session timer, focus IPC, Get Cultiva / GitHub buttons
- Plugin store: compact one-line toolbar with chip-style category/sort filters

### Fixed
- Footer pinned with `position: fixed` (no floating strip on ambient/pink themes)
- Settings text no longer clipped at the bottom of the sheet
- Cache-clear overlay no longer leaks blue cloud orbs into the garden
- Plugin widgets stay in a full-width plugins row when habit nodes are cleared
- `main.css` is the CSS source of truth again (`shell.css` generated by prebuild)

### Notes
- Companion: Quote **1.6.0** (500 EN + 500 RU) · registry **3.5.4**

## [2.1.3] — Rowan · 2026-07-18

**Codename:** Rowan · Plugin store polish · glyph search · Radio Neo player

### Added
- Settings → **Search**: local glyph index status, rebuild, enhanced-search toggle
- Header search indexes habits, plugins, beds, calendar events, and settings labels
- Plugin store: Cultiva-styled toolbar; **Featured** as a category filter (no separate section)
- README markdown in Details: tables, lists (ul/ol), italics, blockquotes, hr

### Fixed
- Footer: readable **12px** centered version line with compact padding (not a tall empty band)
- Plugin store search/sort: tokenized NFKD matching across EN/RU i18n fields
- Deleting a garden bed still reindexes \sortOrder\ into ungrouped

### Notes
- Companion registry **3.5.3**: Radio **[2.4.0]**, Quote **[1.5.0]**, Weather **[2.6.0]**

## [2.1.2] — Rowan · 2026-07-18

**Codename:** Rowan · Garden beds (drag-and-drop + custom groups) · Weather Neo companion

[Release notes](docs/release-notes-v2.1.2-rowan-github.md) · [Footer height audit](https://github.com/krwg/cultiva/issues/167)

### Added
- Drag-and-drop reorder for habit cards in the garden
- Custom garden **beds** (грядки) — UI grouping independent of categories; create / rename / delete / move via context menu
- Weather plugin companion **2.5.x**: opt-in **Weather Neo**, hourly and 7-day outlook
- Settings context menu: **Refresh plugin store** (force registry fetch + update installed plugins)
- Plugin store: category + sort dropdowns, Featured, `[version]` labels, permissions confirm before install, Details (README / changelog / screenshots)

### Fixed
- Habit cards stay in the garden CSS grid (flat siblings + bed headers); weather card no longer stretches the row
- Footer fixed to a single version line (**20px** chrome); legacy `main.css` duplicate no longer carries `32px` padding ([#167](https://github.com/krwg/cultiva/issues/167))
- Deleting a garden bed appends its habits to ungrouped with reindexed `sortOrder`
- Weather city search for Cyrillic queries (transliteration + Open-Meteo merge)

### Notes
- Weather Neo stays compatible with Cultiva **1.7+** (`minAppVersion` unchanged); Neo is a plugin setting

## [2.1.1] — Rowan · 2026-07-18

**Codename:** Rowan · Critical bugfix — garden reload, footer, heatmap toggle, storage safety

[GitHub Release](https://github.com/krwg/cultiva/releases/tag/2.1.1) · [Release notes](docs/release-notes-v2.1.1-rowan-github.md)

### Fixed
- Soft garden reload recovers habits from IndexedDB / localStorage; Ctrl+R no longer hard-reloads the window
- Habit write flush uses a queued snapshot so `_loadFromDB` cannot flush an empty cache over good data
- Empty localStorage mirrors are not written over a non-empty backup
- Compact, centered version footer on garden and calendar

### Added
- Settings → Calendar: toggle for Garden activity heatmap (default on)

### Builds
- Windows: `Cultiva-Setup-2.1.1.exe`, `Cultiva-Portable-2.1.1.exe`

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
