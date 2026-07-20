**Full Changelog**: https://github.com/krwg/cultiva/compare/2.3.4...2.3.5

[Download](https://github.com/krwg/cultiva/releases/tag/2.3.5) · [Changelog](../CHANGELOG.md) · [Landing](https://krwg.github.io/cultiva/)

**2.3.5 Rowan** syncs Cultiva with the **Glyph 2.8** engine line — vendored **[glyph-s 2.8.0](https://github.com/FlokeStudio/glyph-s)**, family banners in Settings and on the landing site, still **zero accounts, zero telemetry**.

---

## glyph-s 2.8.0 in Cultiva

Cultiva ships a vendored copy of **[FlokeStudio/glyph-s](https://github.com/FlokeStudio/glyph-s)** 2.8.0 — the shared offline search engine from the Glyph family.

| In Cultiva | Detail |
|:--|:--|
| **Vendor path** | `src/core/glyph-s/` (`engine`, `tokenize`, `layout`, `profiles`) |
| **Adapter** | `src/core/glyph-s-search.js` maps habits, plugins, beds, events, settings |
| **UI** | Settings → Search shows engine **2.8.0** + Glyph family banner |
| **Landing** | [krwg.github.io/cultiva](https://krwg.github.io/cultiva/) Glyph strip links Floke + plugins |
| **Semantic ONNX** | Engine ships an embeddings **stub only** — disabled in Cultiva (local ranking) |

### Glyph family links

| Resource | URL |
|----------|-----|
| glyph-s (engine) | https://github.com/FlokeStudio/glyph-s |
| glyph-sO (Obsidian search) | https://github.com/FlokeStudio/glyph-sO |
| glyph-mi (metadata core) | https://github.com/krwg/glyph-mi |
| glyph-miO (Obsidian MI) | https://github.com/FlokeStudio/glyph-miO |
| Floke landing | https://flokestudio.github.io/Floke/ |
| Engine roadmap | https://github.com/FlokeStudio/glyph-s/blob/main/ROADMAP.md |

Obsidian-facing features from Glyph 2.8 (persistent vault index, editor highlight, folder groups, hover preview, sidebar MI, frontmatter tags, vault batch) ship in **glyph-sO** / **glyph-miO**, not inside Cultiva itself.

---

## Links

| Resource | URL |
|----------|-----|
| Repository | https://github.com/krwg/cultiva |
| Landing | https://krwg.github.io/cultiva/ |
| Plugins | https://github.com/krwg/cultiva-plugins/ |
| Wiki | https://github.com/krwg/cultiva/wiki |
| glyph-s | https://github.com/FlokeStudio/glyph-s |
| Floke | https://flokestudio.github.io/Floke/ |
