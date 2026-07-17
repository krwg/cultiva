<div align="center">
<img width="256" height="256" alt="app-icon" src="https://github.com/user-attachments/assets/8d37d600-c775-4dab-a351-8c39fde17fa7" />

# Cultiva

**A gamified habit tracker where consistency isn’t tracked — it’s grown.**

[![Release](https://img.shields.io/github/v/release/krwg/cultiva?style=flat-square&labelColor=0b0b0b&color=f4f4f4&label=%20Rowan)](https://github.com/krwg/cultiva/releases/latest)
[![License](https://img.shields.io/github/license/krwg/cultiva?style=flat-square&color=af52de)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Win%20%7C%20macOS%20%7C%20Linux-34c759?style=flat-square)](https://github.com/krwg/cultiva/releases/latest)
[![Stars](https://img.shields.io/github/stars/krwg/cultiva?style=flat-square&color=ffcc00)](https://github.com/krwg/cultiva/stargazers)
[![Discord](https://img.shields.io/badge/discord-rich%20presence-5865F2?style=flat-square&logo=discord&logoColor=white)](#discord-rich-presence)

[Landing](https://krwg.github.io/cultiva/) · [Wiki](https://github.com/krwg/cultiva/wiki) · [Plugins](https://krwg.github.io/cultiva-plugins/)

</div>

---

Cultiva is an **offline-first desktop habit tracker**. Each habit you plant grows from a seed into a legacy tree — with plugins, calendar, themes, and **zero cloud lock-in**.

**No subscriptions. No accounts. No telemetry.** Just you and your garden.

---

## Download

**[→ Latest release (2.1.1 · Rowan)](https://github.com/krwg/cultiva/releases/latest)**

| Platform | Artifact | Notes |
|----------|----------|--------|
| **Windows** | `Cultiva-Setup-2.1.1.exe` | NSIS installer — shortcuts, uninstall entry |
| **Windows** | `Cultiva-Portable-2.1.1.exe` | No install required |
| **macOS Intel** | `Cultiva-2.0.2-mac-x64.dmg` | Latest multi-platform: 2.0.2 |
| **macOS Apple Silicon** | `Cultiva-2.0.2-mac-arm64.dmg` | Also `.zip` |
| **Linux** | `Cultiva-2.0.2-linux-x86_64.AppImage` | Single file, no root |
| **Linux** | `Cultiva-2.0.2-linux-amd64.deb` | Debian / Ubuntu |

**Release notes:** [2.1.1 Rowan](docs/release-notes-v2.1.1-rowan-github.md) · [2.1.0 Rowan](docs/release-notes-v2.1.0-rowan-github.md) · [2.0.2 Rowan](docs/release-notes-v2.0.2-rowan-github.md) · [2.0.0 Rowan](docs/release-notes-v2.0.0-rowan-github.md) · [1.7.0 Linden](docs/release-notes-v1.7.0-linden-github.md)

> **Upgrading:** your garden is preserved. Export a backup under **Settings → Data** before updating, just in case.

---

## How it works

Plant a habit. Show up. Watch it grow.

```
Seed → Sprout → Sapling → Tree → Legacy (365+ days)
```

Each stage is a **visual milestone**. After **365 days**, the habit becomes a **Legacy** tree — a permanent trophy in your garden.

---

## Highlights in 2.0.x Rowan

| | |
|---|---|
| **2.1.1 critical fix** | Garden reload / storage race, compact footer, heatmap toggle |
| **2.1.0 Windows patch** | Calendar heatmap, paused habits, next Legacy card, installer/icons |
| **2.0.2 patch** | Habit ownership after calendar, plugins start again, macOS Dock/tray lifecycle |
| **Rowan theme** | Strict graphite black-and-white palette |
| **Rowan Cluster background** | «Pulsing Cluster» — trembling branches, flickering pinnate leaves, pulsing berry probes with radar rings |
| **Plugin contributions** | Themes, backgrounds, ambient sounds, Settings nav from plugins |
| **Habit schedules** | Daily, weekdays, N times per week; per-habit reminders |
| **First-run wizard** | Language, theme, timezone, first habit, optional auto-backup |
| **Streak grace day** | One forgiven skip per calendar month (optional) |
| **Statistics** | Weekly and monthly completion trends in Settings |
| **Data export** | JSON, ZIP, iCal (`.ics`) for habits and calendar events |
| **Auto-backup** | 7 rotating snapshots in the app data folder |
| **Plugins** | sha256-verified installs from [cultiva-plugins](https://github.com/krwg/cultiva-plugins) (registry **3.5.1**) |
| **F1 help** | Contextual shortcuts — English and Russian |
| **19 themes** | Including **Rowan**, **Linden**, and **Cypress** |
| **14 ambient backgrounds** | Plus custom photo — shared with calendar |
| **Cross-platform** | Windows, macOS (Intel + ARM), Linux builds in CI |

---

## Features

| | |
|---|---|
| **Offline-first** | IndexedDB on your device — no sync server |
| **Visual growth** | Five plant stages tied to consistency |
| **Calendar** | Month / week / day views, regional holidays, shared themes |
| **Plugins** | Sandboxed header and garden widgets ([catalog](https://krwg.github.io/cultiva-plugins/)) |
| **Discord Rich Presence** | Optional status while you tend your garden |
| **Auto-updates** | `electron-updater` against GitHub Releases |
| **i18n** | **~348** EN/RU string pairs |
| **Accessibility** | Focus traps, landmarks, `prefers-reduced-motion` for ambient layers |

---

## Official plugins

Install from **Settings → Plugins → Browse**. Requires Cultiva **≥ 2.0.0** (recommended **2.0.2+**) and registry **[3.5.1](https://github.com/krwg/cultiva-plugins/blob/main/registry.json)**.

| Plugin | Version | Surface |
|--------|---------|---------|
| Weather | 2.3.2 | Header + garden |
| Time | 2.2.2 | Header |
| Radio | 2.2.0 | Header |
| Pomodoro | 1.2.1 | Header |
| Quote of the Day | 1.3.2 | Garden |
| Habit Reflection | 1.1.0 | Hooks |
| Weekly Stats | 1.0.0 | Garden + hooks |
| Routine | 1.0.0 | Garden + hooks |
| Gentle Nudge | 1.0.0 | Hooks |

**Authors:** [`docs/PLUGIN_AUTHOR_GUIDE.md`](docs/PLUGIN_AUTHOR_GUIDE.md) · [cultiva-plugins](https://github.com/krwg/cultiva-plugins)

**Wiki source:** Markdown for the GitHub Wiki lives in [`docs/wiki/`](docs/wiki/) — see [`docs/WIKI.md`](docs/WIKI.md) to publish.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | Electron **40** |
| Engines | **CoreV6** · **GrowthKit3** · **IDB3** · **PLE1** |
| UI | Vanilla JavaScript (ES modules), CSS variables |
| Build | Vite **6** (multi-page: garden + calendar) |
| Data | IndexedDB with localStorage bridge where needed |
| Tests | Vitest **3** (19 files, 62 tests) |
| Updates | `electron-updater` + GitHub Releases |
| Packaging | `electron-builder` **26** — NSIS, portable, dmg, zip, AppImage, deb |

---

## Development

```bash
git clone https://github.com/krwg/cultiva.git
cd cultiva
npm ci

npm run dev              # Vite dev server
npm run electron:dev:watch   # Electron + hot reload (recommended)

npm run lint
npm test
npm run build            # → dist/
npm run electron:build   # → release/ (current host OS)
```

Unsigned local builds: `CSC_IDENTITY_AUTO_DISCOVERY=false` (set automatically in `electron:build` script).

---

## Contributing

Issues, PRs, and commit messages in **English**. In-app strings: `src/core/i18n.js` (en + ru minimum).

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SUPPORT.md](SUPPORT.md) — where to ask vs open an issue
- [SECURITY.md](SECURITY.md) — private disclosure for vulnerabilities

---

## Discord Rich Presence

When Discord is running locally, Cultiva can show a simple presence line. Toggle under **Settings → Discord**.

---

<div align="center">

Built with care by [krwg](https://github.com/krwg) · **GPL-3.0** · **2.1.1 · Rowan**

</div>
