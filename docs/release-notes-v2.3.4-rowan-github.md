# Cultiva 2.3.4 — Rowan

**glyph-s 2.7.2 · Plugin install integrity · Aligned store copy**

[Download](https://github.com/krwg/cultiva/releases/tag/2.3.4) · [Changelog](../CHANGELOG.md) · [Landing](https://krwg.github.io/cultiva/)

**2.3.4 Rowan** vendors **[glyph-s 2.7.2](https://github.com/FlokeStudio/glyph-s)** — the shared offline search engine from the Glyph family — and hardens official plugin installs against stale CDN hashes. Still **zero accounts, zero telemetry**.

---

## Numbers That Matter

| | |
|:--|:--|
| **glyph-s** | **2.7.2** vendored under `src/core/glyph-s/` |
| **Full-text fix** | Body text included in the fast-path bag (paragraph-only hits work) |
| **Registry** | Companion catalog **3.6.3** |
| **0** | Required accounts, cloud sync, or telemetry |

### Engine stack

| Engine | Role |
|--------|------|
| **CoreV6** | App shell, settings, i18n, release pipeline |
| **GrowthKit3** | Habit growth stages, schedules, analytics |
| **IDB3** | IndexedDB persistence |
| **PLE1 / PE2** | Plugin sandbox + tray contributions |
| **glyph-s 2.7.2** | Local search ranking (habits, plugins, beds, events, settings) |

---

## Search · glyph-s 2.7.2

Cultiva ships a vendored copy of **[FlokeStudio/glyph-s](https://github.com/FlokeStudio/glyph-s)** — the same core used by [glyph-sO](https://github.com/FlokeStudio/glyph-sO) for Obsidian full-text search.

**What’s new in 2.7.2 for Cultiva:**

- **Body in the fast-path** — candidate gating previously used title + keys only; words that appear only in descriptions / notes now reach scoring
- **Index bag reuse** — `createSearchEngine` passes precomputed bags into ranking
- **Profiles module** — `legacy` / `balanced` / `max-quality` live in `profiles.js`

| Resource | URL |
|----------|-----|
| glyph-s (engine) | https://github.com/FlokeStudio/glyph-s |
| glyph-sO (Obsidian) | https://github.com/FlokeStudio/glyph-sO |
| Glyph family landing | https://flokestudio.github.io/Floke/ |

Settings → **Search** shows the engine version (`glyph-s 2.7.2`) and rebuild controls.

---

## Plugin install integrity

Fixes `Integrity check failed for manifest.json` after a fast registry push:

- Always **refetch** the official registry on install (no stale in-memory sha256 map)
- Prefer **jsDelivr** for registry + plugin files (avoids laggy `raw.githubusercontent.com` edges)
- **LF-normalize** text plugin files before sha256 compare
- Store catalog prefers jsDelivr, with raw GitHub fallback

Companion **registry 3.6.3** — aligned first-time store descriptions; Radio **2.6.x** line.

---

## Installation

| Platform | File |
|----------|------|
| Windows | `Cultiva-Setup-2.3.4.exe`, `Cultiva-Portable-2.3.4.exe` |
| macOS Intel | `Cultiva-2.3.4-mac-x64.dmg` (+ `.zip`) |
| macOS Apple Silicon | `Cultiva-2.3.4-mac-arm64.dmg` (+ `.zip`) |
| Linux | `Cultiva-2.3.4-linux-x86_64.AppImage`, `Cultiva-2.3.4-linux-amd64.deb` |

Data lives in **IndexedDB** locally. No account required.

**Upgrading:** garden data is preserved. Export a backup under **Settings → Storage** before updating, just in case.

---

## Links

| Resource | URL |
|----------|-----|
| Repository | https://github.com/krwg/cultiva |
| Landing | https://krwg.github.io/cultiva/ |
| Plugins | https://krwg.github.io/cultiva-plugins/ |
| Wiki | https://github.com/krwg/cultiva/wiki |
| glyph-s | https://github.com/FlokeStudio/glyph-s |
| Glyph / Floke | https://flokestudio.github.io/Floke/ |

---

## Previous releases

- [2.3.3 · Rowan](release-notes-v2.3.3-rowan-github.md)
- [2.3.2 · Rowan](release-notes-v2.3.2-rowan-github.md)
- [2.3.0 · Rowan](release-notes-v2.3.0-rowan-github.md)
- [2.2.0 · Rowan](release-notes-v2.2.0-rowan-github.md)
- [2.0.0 · Rowan](release-notes-v2.0.0-rowan-github.md)

---

*Thank you for growing your habits with Cultiva.*
