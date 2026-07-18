# Cultiva 2.3.2 — Rowan

**Dev Mode hide fix · Weather tray temperature**

[Download](https://github.com/krwg/cultiva/releases/tag/2.3.2) · [Changelog](../CHANGELOG.md)

## Fixes

### Developer Mode
- Sidebar item stayed visible after **Hide** / **Turn off** because `.settings-sidebar-item { display: flex }` overrode the HTML `hidden` attribute
- Gated by `body.developer-mode` + CSS `display: none !important`; hide/off leave the Developer section and re-assert after `saveSettings`

### Weather tray °
- PE2 tray wiring hardened; Weather **2.7.2** writes temperature to the tray **tooltip** and a **menu row** (`City · °C`)

## Notes
- Author: **krwg** \<shevotsukov@icloud.com\> — sole author, no co-authors
- Companion registry **3.5.7** · Weather **2.7.2**

| | |
|:--|:--|
| Tag | `2.3.2` |
| Codename | Rowan |
| Progress | https://github.com/krwg/cultiva/blob/main/CultivaProgress.md |
