# Architecture

High-level map for **Cultiva 2.0.0** contributors.

**Engines:** **CoreV6** (core) · **GrowthKit3** (habits) · **IDB3** (storage) · **PLE1** (Plugin Engine 1)

---

## Repository layout

```
cultiva/
├── src/
│   ├── main.js              # Garden page bootstrap
│   ├── app/                 # UI controllers (garden, settings, plugins, …)
│   ├── core/                # i18n, themes, plugin sandbox/RPC, ambient-bg
│   ├── modules/             # habits, storage (IndexedDB), auth
│   └── pages/calendar/      # Separate Vite entry
├── electron/
│   ├── main.cjs             # Window, menu, IPC, auto-updater
│   └── lib/                 # IPC handlers, app-menu, main-window
├── docs/                    # Landing, author guide, wiki source
└── build/                   # Icons for electron-builder
```

## Runtime paths

1. **Electron main** creates window, handles filesystem backup paths, plugin download IPC
2. **Renderer** loads Vite-built `dist/` — garden or calendar HTML
3. **Storage** dual-writes habits/settings to IndexedDB (+ localStorage bridge where needed)
4. **Plugins** — iframe sandbox + postMessage RPC; no Node in plugin code

## Plugin pipeline

```
registry.json → download manifest + files → sha256 check → userData/cultiva-plugins/
→ PluginSandboxHost (blob iframe) → plugin-manager RPC → header / garden / sheet UI
```

**Mod architecture:** Cultiva contains no plugin business logic. Extensions ship from [cultiva-plugins](https://github.com/krwg/cultiva-plugins). The renderer exposes a permission-gated RPC surface (`src/core/plugin-rpc.js`, `src/core/plugin-api.js`).

| Layer | File |
|-------|------|
| RPC allowlist | `src/core/plugin-rpc.js` |
| RPC handlers | `src/core/plugin-api.js` |
| Sandbox host | `src/core/plugin-sandbox-host.js` |
| Manifest i18n | `src/core/plugin-manifest-i18n.js` |
| Registry integrity | `src/core/plugin-registry-integrity.js` |
| Contributions | `src/core/plugin-contributions.js` |

## Performance

- Lazy `import()` for plugins UI, stats, onboarding, Discord, updates
- Lazy-loaded theme and ambient CSS chunks
- Garden renders patch single cards on toggle
- Ambient backgrounds in separate chunk

## Tests

```bash
npm test   # Vitest — 19 files, 62 tests (storage, habits, plugin RPC, iCal, analytics, …)
```

## Key files

| Concern | File |
|---------|------|
| Branding / engines | `src/core/branding.js` |
| Habits logic | `src/modules/habits.js` |
| Persistence | `src/modules/storage.js` |
| Sandbox | `src/core/plugin-sandbox-host.js` |
| Registry integrity | `src/core/plugin-registry-integrity.test.js` |
| Themes | `src/core/theme-config.js` |
| i18n | `src/core/i18n.js` |

## Deeper docs

- [PLUGIN_AUTHOR_GUIDE.md](https://github.com/krwg/cultiva/blob/main/docs/PLUGIN_AUTHOR_GUIDE.md)
- [Desktop Build](Desktop-Build)
