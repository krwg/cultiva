# Plugins

Official extensions live in **[cultiva-plugins](https://github.com/krwg/cultiva-plugins)**. Catalog UI: [krwg.github.io/cultiva-plugins](https://krwg.github.io/cultiva-plugins/).

**Requires Cultiva ≥ 1.7.0** and registry **3.0.2**.

---

## Install

1. Open **Settings → Plugins**
2. Ensure **Enable plugins** is on
3. **Browse** → tap **Install** on a plugin
4. Cultiva downloads files from GitHub and verifies **sha256** hashes

Install/uninstall requires the **desktop app** (Electron), not the browser-only Vite preview.

## Catalog (official)

| Plugin | Version | Where it appears |
|--------|---------|------------------|
| Weather | 2.3.0 | Header + optional garden chip |
| Time | 2.2.0 | Header |
| Radio | 2.1.0 | Header (SomaFM) |
| Pomodoro | 1.2.0 | Header |
| Quote of the Day | 1.2.0 | Garden |
| Streak Celebrator | 1.0.0 | Toast on habit complete |

## Permissions

Plugins declare what they need in `manifest.json`:

| Permission | Allows |
|------------|--------|
| `network` | Fetch external APIs (weather, radio) |
| `storage` | Per-plugin key/value settings |
| `ui` | Header chips, sheets, garden widgets, toasts |

## Disable all plugins

Toggle **Enable plugins** off — sandboxes stop and header chips are removed.

## Troubleshooting

- **Install failed / hash mismatch** — registry or CDN cache; see [cultiva-plugins Troubleshooting](https://github.com/krwg/cultiva-plugins/wiki/Troubleshooting)
- **Weather empty offline** — Russian cities work offline; worldwide needs network

## Authors

Full API: [PLUGIN_AUTHOR_GUIDE.md](https://github.com/krwg/cultiva/blob/main/docs/PLUGIN_AUTHOR_GUIDE.md)  
Wiki summary: [Cultiva-Plugins-Guide](Cultiva-Plugins-Guide)
