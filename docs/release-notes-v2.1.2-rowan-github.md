# [2.1.2] Rowan: Garden beds & weather Neo

**Codename:** Rowan · Garden layout + Weather Neo + store transparency

## Summary
- Drag-and-drop + custom garden beds (грядки)
- Footer fixed to a single version line (20px; audit [#167](https://github.com/krwg/cultiva/issues/167))
- Flat garden grid — habit cards as grid siblings; weather card no longer stretches the row
- Plugin store: category & sort dropdowns, Featured (Weather / Radio / Quote), `[version]`, permissions before install, Details with README + changelog + screenshots
- Deleting a bed reindexes habit `sortOrder` into ungrouped

## Companion plugins
- Weather **[2.5.1]** — Cyrillic city search, Neo polish, `prefers-reduced-motion`
- Radio **[2.3.0]** — Media Session, autoplay messaging, custom stream URL
- Quote **[1.4.0]** — shuffle another quote
- Insights **[1.0.0]** — local habit correlations (Связи)

## Notes
- Weather Neo stays opt-in; `minAppVersion` for Weather remains **1.7.0**
- No telemetry in the plugin store (Featured is editorial; `lastUpdated` from public git dates)
