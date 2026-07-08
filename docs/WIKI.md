# GitHub Wiki — publish workflow

Markdown source for the **Cultiva** GitHub Wiki can be maintained locally in `wiki/` (gitignored) or edited on GitHub.

**Live wiki:** https://github.com/krwg/cultiva/wiki

---

## Clone & edit

```bash
git clone https://github.com/krwg/cultiva.wiki.git
cd cultiva.wiki
# edit Home.md, Plugins.md, …
git add -A && git commit -m "docs(wiki): …" && git push
```

Wiki uses **`.md`** files; links use `Page-Name` (spaces → hyphens).

---

## Page map

| File | Topic |
|------|--------|
| `Home.md` | Landing |
| `Getting-Started.md` | Install, backup |
| `Features.md` | 1.7 feature overview |
| `Habits.md` | Habit mechanics |
| `Themes-and-Backgrounds.md` | Appearance |
| `Plugins.md` | Plugin user guide |
| `FAQ.md` | Common questions |
| `Troubleshooting.md` | Debug guide |
| `Architecture.md` | Developer overview |
| `Cultiva-Plugins-Guide.md` | Author reference |
| `Roadmap.md` | Milestones |
| `Contributing.md` | How to contribute |
| `Desktop-Build.md` | Build from source |
| `Privacy-and-Security.md` | Data & sandbox |
| `_Sidebar.md` | Navigation |
| `_Footer.md` | Footer links |

---

## cultiva-plugins wiki

**Live:** https://github.com/krwg/cultiva-plugins/wiki

Includes catalog, registry spec, publishing guide, and **[Plugin Hardening](https://github.com/krwg/cultiva-plugins/wiki/Plugin-Hardening)** tracker (audit + issues #2–#10).

```bash
git clone https://github.com/krwg/cultiva-plugins.wiki.git
```

---

## Sync from repo docs

When `docs/PLUGIN_AUTHOR_GUIDE.md` changes materially, copy or summarize into `Cultiva-Plugins-Guide.md` on the wiki so users without the repo still see current API docs.
