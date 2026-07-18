**Full Changelog**: https://github.com/krwg/cultiva/compare/2.2.0...2.3.0

**2.3.0 Rowan** is the polish-and-tools release: **Developer Mode**, a clean ESLint baseline again, and companion **Weather Neo 2.7.0** with solar-driven skies — still **zero accounts, zero telemetry**.

---

## Numbers That Matter

| | |
|:--|:--|
| **0** | ESLint errors on `npm run lint` (glyph-s vendored + ignored; eqeqeq allows `== null`) |
| **89** | Vitest tests green |
| **7** | Taps on the footer version to unlock Developer Mode |
| **6** | Solar sky phases in Weather Neo (dawn → night) |
| **0** | Co-authors — sole author **krwg** \<shevotsukov@icloud.com\> |

---

## Lint & quality

- Ignore vendored **`src/core/glyph-s/**`** (glyph-s 2.7 is third-party style)
- `eqeqeq` with `{ null: 'ignore' }` for intentional nullish checks
- Remaining app `eqeqeq` / assignment issues fixed — **green lint**

---

## Developer Mode

Unlock: tap the footer version line **7 times** → toast *You are now a developer* → Settings → **Developer**.

| Tool | What it does |
|------|----------------|
| **Feature flags** | One panel for trophies, next-Legacy, heatmap, focus chrome, low-power, force reduced motion, auto-backup, update toggles |
| **Session overrides** | Temporary `LEGACY_THRESHOLD`, `MAX_HABITS_PER_BED`, `MAX_ACTIVE_HABITS` (not persisted) |
| **window.cultivaDev** | `seedFakeHabits`, `simulateDate`, `exportDebugState`, `completeAllToday`, `setOverrides`, `startChaos`, `getRpcLog`, … |
| **Plugin RPC log** | Live allow/deny + timing for sandbox calls |
| **Fun** | Complete-all-today, chaos themes, ASCII console banner, secret ASCII background |
| **Focus safety** | With chrome hidden, a floating **Exit Focus** chip stays visible (Escape still works) |

---

## Weather Neo 2.7.0 (companion)

- Open-Meteo **sunrise / sunset**; phases: dawn, day, evening, sunset, bluehour, night
- Dark skies use **light text** without requiring theme bypass
- Sunrise/sunset row in the plugin sheet
- Soft background transitions + light FX breathing
- Registry **3.5.5**

---

## Installation

| Platform | File |
|----------|------|
| Windows | `Cultiva-Setup-2.3.0.exe`, `Cultiva-Portable-2.3.0.exe` |
| macOS Intel | `Cultiva-2.3.0-mac-x64.dmg` (+ `.zip`) |
| macOS Apple Silicon | `Cultiva-2.3.0-mac-arm64.dmg` (+ `.zip`) |
| Linux | `Cultiva-2.3.0-linux-x86_64.AppImage`, `Cultiva-2.3.0-linux-amd64.deb` |

**Upgrading:** export under **Settings → Storage** first if you like backups. Garden data is preserved.

---

## Links

| Resource | URL |
|----------|-----|
| Repository | https://github.com/krwg/cultiva |
| Plugins | https://github.com/krwg/cultiva-plugins |
| Progress | https://github.com/krwg/cultiva/blob/main/CultivaProgress.md |

---

*Thank you for growing your habits with Cultiva. — krwg*
