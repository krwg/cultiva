# Plugins



Official extensions live in **[cultiva-plugins](https://github.com/krwg/cultiva-plugins)**. Catalog UI: [krwg.github.io/cultiva-plugins](https://krwg.github.io/cultiva-plugins/).



**Requires Cultiva ≥ 2.0.0** (recommended **2.2.0+**) and registry **3.5.4**.



Plugin code is **never bundled** in Cultiva. The desktop app downloads verified files from the registry into `userData/cultiva-plugins/`. Cultiva ships only the **sandbox + RPC API** — no hardcoded plugin ids.



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

| Weather | 2.6.0 | Header + optional garden chip |

| Time | 2.2.2 | Header |

| Radio | 2.4.0 | Header (SomaFM + player Neo) |

| Pomodoro | 1.2.1 | Header |

| Quote of the Day | 1.6.0 | Garden (500 EN + 500 RU) |

| Streak Celebrator | 1.1.0 | Garden + completion hook |



## Permissions



Plugins declare capabilities in `manifest.json`:



| Permission | Allows |

|------------|--------|

| `network` | `fetch()` in sandbox (weather, radio) |

| `storage` | `context.storage.get/set/remove` |

| `ui` | Header, garden, sheets, toasts, locale/theme/version/date |

| `habits.read` | `context.app.getHabits()` snapshots |

| `settings.read` | `context.app.getSettings()` public subset |



## Garden interactions



Use **`data-plugin-act="methodName"`** on buttons inside garden HTML. Cultiva forwards clicks to your sandbox instance method and ignores habit-card handlers for `.garden-plugin-card` widgets.



## Disable all plugins



Toggle **Enable plugins** off — sandboxes stop and header chips are removed.



## Troubleshooting



- **Install failed / hash mismatch** — registry or CDN cache; see [cultiva-plugins Troubleshooting](https://github.com/krwg/cultiva-plugins/wiki/Troubleshooting)

- **Quote favorite heart does nothing** — update Quote plugin to **≥ 1.3.2** (uses `data-plugin-act`)

- **Weather empty offline** — Russian cities work offline; worldwide needs network



## Authors



Full API: [PLUGIN_AUTHOR_GUIDE.md](https://github.com/krwg/cultiva/blob/main/docs/PLUGIN_AUTHOR_GUIDE.md)  

TypeScript: [cultiva-plugin.d.ts](https://github.com/krwg/cultiva/blob/main/docs/cultiva-plugin.d.ts)  

Wiki summary: [Cultiva-Plugins-Guide](Cultiva-Plugins-Guide)

