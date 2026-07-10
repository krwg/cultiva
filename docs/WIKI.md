# GitHub Wiki — publish workflow

**Live wiki:** https://github.com/krwg/cultiva/wiki

Markdown source for the Cultiva GitHub Wiki is maintained in **`docs/wiki/`** in this repository (version-controlled). Publish to GitHub Wiki when pages change materially.

---

## Publish to GitHub Wiki

```bash
git clone https://github.com/krwg/cultiva.wiki.git
cd cultiva.wiki

# Copy updated pages from your cultiva checkout:
cp /path/to/cultiva/docs/wiki/*.md .

git add -A
git commit -m "docs(wiki): sync from main @ $(date +%Y-%m-%d)"
git push
```

Wiki uses **`.md`** files; links use `Page-Name` (spaces → hyphens).

---

## Page map (`docs/wiki/`)

| File | Topic |
|------|--------|
| [Home.md](wiki/Home.md) | Landing |
| [Getting-Started.md](wiki/Getting-Started.md) | Install, backup, first run |
| [Features.md](wiki/Features.md) | 1.7.0 Linden overview |
| [Habits.md](wiki/Habits.md) | Growth stages, streaks, grace day |
| [Themes-and-Backgrounds.md](wiki/Themes-and-Backgrounds.md) | 18 themes, 13 ambient layers |
| [Plugins.md](wiki/Plugins.md) | Install and use extensions |
| [FAQ.md](wiki/FAQ.md) | Common questions |
| [Troubleshooting.md](wiki/Troubleshooting.md) | Data, plugins, builds |
| [Architecture.md](wiki/Architecture.md) | Developer overview |
| [Cultiva-Plugins-Guide.md](wiki/Cultiva-Plugins-Guide.md) | Author quick reference |
| [Roadmap.md](wiki/Roadmap.md) | Shipped in 1.7, what's next |
| [Contributing.md](wiki/Contributing.md) | How to contribute |
| [Desktop-Build.md](wiki/Desktop-Build.md) | Build from source |
| [Privacy-and-Security.md](wiki/Privacy-and-Security.md) | Data & sandbox |
| [_Sidebar.md](wiki/_Sidebar.md) | Navigation |
| [_Footer.md](wiki/_Footer.md) | Footer links |

---

## cultiva-plugins wiki

**Live:** https://github.com/krwg/cultiva-plugins/wiki

Source: `docs/wiki/` in [krwg/cultiva-plugins](https://github.com/krwg/cultiva-plugins). See that repo's [docs/WIKI.md](https://github.com/krwg/cultiva-plugins/blob/main/docs/WIKI.md).

---

## Sync checklist

When you change any of these in the main repo, update the matching wiki page:

- `README.md` → Home, Getting-Started
- `CHANGELOG.md` / release notes → Features, Roadmap
- `docs/PLUGIN_AUTHOR_GUIDE.md` → Cultiva-Plugins-Guide
- `registry.json` (plugins repo) → Plugins wiki + cultiva-plugins Catalog
