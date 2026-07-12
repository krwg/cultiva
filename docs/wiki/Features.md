# Features

Overview of **Cultiva 2.0.0 · Rowan**. Full notes: [release notes](https://github.com/krwg/cultiva/blob/main/docs/release-notes-v2.0.0-rowan-github.md).

**Engines:** CoreV6 · GrowthKit3 · IDB3 · PLE1 (Plugin Engine 1)

---

## Garden

- Visual habit cards with **five growth stages**
- **Focus mode** for fewer distractions
- Habit **search** (`Ctrl/Cmd+F`)
- **Context menu** on habit cards
- **Keyboard shortcuts** — press **F1** for contextual help
- Plugin widgets sized to match habit cards

## Habits & streaks

- Binary or quantity habits
- **Schedules** — daily, weekdays, N times per week
- Per-habit **native reminders** at custom times
- **Streak tracking** with optional **grace day** (one forgiven skip per calendar month)
- **Templates** at creation: Read, Exercise, Meditate, Water, Journal
- **Statistics** in Settings — weekly and monthly completion bars

## Calendar

- Month, week, and day views
- Regional holidays (configurable)
- Same **theme and ambient background** as the garden
- Plugin rail for calendar widgets
- Events included in **iCal export**

## Data & backup

| Action | Where |
|--------|--------|
| Export JSON / ZIP | Settings → Data |
| Export iCal | Settings → Data |
| Import with preview | Settings → Data |
| Auto-backup (7 files) | Settings → Data (toggle) |
| Full reset | Settings → Data (removes habits, settings, plugins) |

## Appearance

- **19 themes** including Rowan, Linden, and Cypress
- **14 animated ambient backgrounds** + custom photo
- Plugin-contributed themes and backgrounds
- Optional **accent color** override
- **Auto** light/dark following system preference
- `prefers-reduced-motion` slows or disables ambient animation

## Plugins

- Official catalog: [cultiva-plugins](https://github.com/krwg/cultiva-plugins)
- **sha256** integrity check on every file at install
- Sandboxed iframe; permissions: `network`, `storage`, `ui`, `habits.read`, `habits.write`
- Manifest-driven **settings UI** and **contributions** (themes, backgrounds, sounds, nav)

## Platform

- Windows NSIS + portable
- macOS dmg + zip (x64, arm64)
- Linux AppImage + deb
- System tray quick-complete with hide-to-tray
- In-app updates via GitHub Releases (`electron-updater`)

## Localization

- **~348** English and Russian string pairs
- Language switch in Settings or onboarding

## Optional integrations

- **Discord Rich Presence** — Settings → Discord
- No other third-party analytics or crash reporters
