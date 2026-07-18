# [2.2.0] Rowan: Horizontal beds, settings IA & pinned footer

**Codename:** Rowan · Garden layout polish + settings information architecture

> Push only — **no GitHub Release / tag** for this commit. Tag when you cut the installer build.

## Summary

- **Footer** pinned to the bottom of the window (sticky + flex), readable version line
- **Garden beds** as horizontal rows under plugin widgets; rename/delete via context menu; **max 3 habits per bed**
- **Trophy Garden** is the master switch — Legacy/trophy progress never shows when trophies are off; copy uses “trophy”, not inheritance wording
- **Calendar** garden activity heatmap no longer flashes when disabled
- **Settings IA** — Focus tab, heatmap under Statistics, Data → Storage (+ cache), Updates toggles, plugin notification mutes, Material-style sidebar icons, subsection titles
- Companion: **Quote 1.6.0** — 500 curated EN + 500 authentic RU quotes (registry **3.5.4**)

## Garden

- Beds render as full-width `.garden-bed-row` grids (3 columns → 2 → 1 on narrow viewports)
- Context menu targets bed header / row / dropzone (rename & delete work again)
- Drag-and-drop into a full bed shows a localized toast

## Settings

| Section | Notes |
|---------|--------|
| Focus | Focus mode + auto-start + hide chrome |
| Garden | Trophies, trophy progress, streak grace |
| Statistics | Garden activity heatmap + stats dashboard |
| Storage | Export/import/reset + cache size / clear |
| Updates | Check for updates / automatic updates toggles |
| Notifications | Per-plugin mute list |

## Fixes

- Trophy section empty when `showTrophies` is off even if next-tree progress is on
- Calendar heatmap starts `hidden` and only renders after appearance sync when enabled

## Docs

- Landing eyebrow → 2.2.0
- README highlights + registry pointer **3.5.4**
