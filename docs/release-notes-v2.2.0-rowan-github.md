# [2.2.0] Rowan: Horizontal beds, settings IA & pinned footer

**Codename:** Rowan · Garden layout polish + settings information architecture

> Push only — **no GitHub Release / tag** for this commit. Tag when you cut the installer build.

## Summary

- **Footer** fixed to the bottom of the window across themes and ambient backgrounds
- **Garden beds** as horizontal rows under plugin widgets (max 3 habits each)
- **Trophy Garden** master switch for next-trophy progress
- **Calendar** heatmap no longer flashes when disabled
- **Settings IA** — Focus, Storage, Updates toggles, plugin notify mutes, Material icons
- **glyph-s 2.7** local search engine + header search toggle + rebuild progress
- **Plugin store** compact one-line filters; README/changelog release-style render; permission lists with dashes
- **Discord Rich Presence** activity-based (habit counts / streaks), stable elapsed timer, focus IPC, Get Cultiva / GitHub buttons
- Companion: **Quote 1.6.0** — 500 curated EN + 500 authentic RU quotes (registry **3.5.4**)

## Discord

- Activity from garden stats instead of static page strings
- Session `startTimestamp` no longer resets every 15s or when opening Discord settings
- `discord:set-focus-session` for Focus / Pomodoro-style presence
- Buttons: Get Cultiva (landing) · GitHub
- Removed unused `partySize` / `partyMax`

## Search

- Vendored **glyph-s 2.7.0** (`src/core/glyph-s/`)
- Settings → Search: show/hide header search, rebuild with progress bar
