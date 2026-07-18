# Getting Started

## Requirements

- **Windows 10/11**, **macOS** (Intel or Apple Silicon), or **Linux** (x86_64)
- No internet required after install (except plugin features that fetch data, e.g. weather)

## Download

1. Open [GitHub Releases](https://github.com/krwg/cultiva/releases/latest)
2. Pick the artifact for your platform:

| OS | File |
|----|------|
| Windows | `Cultiva-Setup-2.0.2.exe` or portable `.exe` |
| macOS | `Cultiva-2.0.2-mac-arm64.dmg` or `Cultiva-2.0.2-mac-x64.dmg` |
| Linux | `Cultiva-2.0.2-linux-x86_64.AppImage` or `.deb` |

3. Run the installer or AppImage. macOS users: if Gatekeeper blocks the app, open **System Settings → Privacy & Security** and allow it.

## First launch

The **onboarding wizard** (1.7+) walks you through:

1. Language (EN / RU)
2. Theme and appearance
3. Timezone
4. Your first habit (or pick a template)
5. Optional **auto-backup**

You can replay parts of setup later in **Settings**.

## Your data

- Stored locally in **IndexedDB** (Electron `userData`)
- **No account** required
- Export anytime: **Settings → Storage → Export** (JSON or ZIP)
- **Auto-backup:** 7 rotating snapshots in the app data folder when enabled

## Upgrading

From an older release: your garden is preserved. Export a backup before upgrading as a precaution.

## Plugins

Requires Cultiva **≥ 2.0.0**:

1. **Settings → Plugins → Browse**
2. Tap **Install** on any catalog entry
3. Header widgets appear in the top bar; garden widgets in the home view

Registry: [cultiva-plugins 3.3.0](https://github.com/krwg/cultiva-plugins/blob/main/registry.json)

## Next steps

- [Habits](Habits) — growth stages and streaks
- [Themes and Backgrounds](Themes-and-Backgrounds)
- [Plugins](Plugins)
