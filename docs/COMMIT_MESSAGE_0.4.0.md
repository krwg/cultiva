# Suggested commit message (GitHub — English)

Copy the block below into your commit. Stage **all** changed and new files first, including the two new modules:

```bash
git add electron/main.cjs electron/plugin-ipc.cjs electron/preload.js package.json \
  src/core/branding.js src/core/i18n.js src/core/plugin-manager.js \
  src/core/ambient-bg.js src/core/theme-config.js \
  src/index.html src/main.js src/styles/main.css \
  src/pages/calendar/calendar.css src/pages/calendar/calendar.js src/pages/calendar/index.html
```

*(Add `README.md` or `docs/COMMIT_MESSAGE_0.4.0.md` only if you want them in the same commit.)*

---

**Subject line:**

```
release: v0.4.0 Coconut; appearance, ambient backgrounds, settings, calendar, plugins, Electron
```

**Body:**

```
- Bump version to 0.4.0 and codename Coconut; sync package.json from branding
- Add theme-config.js and ambient-bg.js as single source for theme classes and animated backgrounds
- Split theme select into System / Light / Dark optgroups; add Orchard, Honeycrisp, Inkwell, Sequoia themes
- Add Petal Drift, Silicon Mist, Ember Glow, Breeze Glass backgrounds plus optional custom photo backdrop
- Unify ambient background application for home and calendar; add with-ambient-bg calendar chrome; listen for custom image storage key
- Refresh Appearance and Plugins settings sections; fix duplicate toggle-plugins listeners; add Shortcuts reference section (no bindings yet)
- Extend i18n keys for new UI copy
- Harden Electron auto-updater (GitHub latest feed, skip dev / DISABLE_AUTO_UPDATER, softer 404 handling, delayed check)
- Relax CSP for GitHub assets; add pluginHttpGet IPC; plugin-manager fetches registry via IPC with fetch fallback and UTF-8 BOM strip
```

**Optional footer** (replace `#XX` when you have an issue):

```
Closes #XX
```
