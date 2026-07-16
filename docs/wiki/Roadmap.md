# Roadmap

## Shipped in 2.0.2 · Rowan (2026-07-17)

| Area | Delivered |
|------|-----------|
| Data integrity | Account habits survive calendar navigation |
| Plugins | Sandbox CSP restored — catalog plugins start again |
| macOS lifecycle | Close keeps Dock; tray PNG; no zombie process |
| Rowan Cluster | Animation after layout on macOS |

Full notes: [2.0.2 release notes](https://github.com/krwg/cultiva/blob/main/docs/release-notes-v2.0.2-rowan-github.md)

---

## Shipped in 2.0.0 · Rowan (2026-07-13)

| Area | Delivered |
|------|-----------|
| Rowan theme | Graphite black-and-white palette (`#0b0b0b` / `#f4f4f4`) |
| Rowan Cluster background | Canvas «Pulsing Cluster» — branch tremor, pinnate leaf flicker, pulsing berries with radar rings |
| Plugin contributions | Themes, backgrounds, ambient sounds, Settings nav from plugins |
| Habit schedules & reminders | Daily, weekdays, N/week; native per-habit reminders |
| Calendar plugin rail | `onCalendarMount`, `registerCalendarWidget` |
| Calendar parity | `bg-linden-bloom` and `bg-rowan-cluster` layers on calendar page |
| System tray | Quick-complete with hide-to-tray |
| Tests & i18n | 19 Vitest files, 62 tests; ~348 EN/RU string pairs |

Full notes: [release notes](https://github.com/krwg/cultiva/blob/main/docs/release-notes-v2.0.0-rowan-github.md)

---

## Shipped in 1.7.0 · Linden (2026-07-09)

| Area | Delivered |
|------|-----------|
| Cross-platform builds | Windows, macOS, Linux CI matrix |
| Onboarding & templates | First-run wizard, 5 habit templates |
| Data safety | Auto-backup, import preview, iCal export, reset fixes |
| Garden UX | Grace day, statistics, context menu, F1 help, incremental render |
| Plugins | sha256 gate, manifest settings, `data.read`, 6 official plugins |
| Shell & a11y | Native chrome, focus trap, reduced motion |
| Linden theme | Theme + Linden Bloom background |
| Docs & landing | README, wiki source, GitHub Pages |

Full checklist was tracked in local roadmap through Tier 4 (issues #53–#57 closed).

---

## Near-term (post-2.0)

Community-driven via [Issues](https://github.com/krwg/cultiva/issues) and [Discussions](https://github.com/krwg/cultiva/discussions). Examples under consideration:

- Password / app lock ([#88](https://github.com/krwg/cultiva/issues/88) area)
- Hotkey customization ([#89](https://github.com/krwg/cultiva/issues/89))
- Documentation drift cleanup ([#90](https://github.com/krwg/cultiva/issues/90))
- Accessibility pass ([#93](https://github.com/krwg/cultiva/issues/93))
- Registry schema 3.1 (permissions catalog, i18n fields) — cultiva-plugins

---

## Release naming

| Version | Codename |
|---------|----------|
| 2.0.0 | **Rowan** |
| 1.7.0 | **Linden** |
| 1.1.0 | Cypress |
| 0.4.x | Coconut, Sequoia, … |

Codenames are theme-inspired tree and plant names.

---

## Plugins ecosystem

Registry **3.3.0** — see [cultiva-plugins Roadmap](https://github.com/krwg/cultiva-plugins/wiki/Home) and [Plugin Hardening](https://github.com/krwg/cultiva-plugins/wiki/Plugin-Hardening).
