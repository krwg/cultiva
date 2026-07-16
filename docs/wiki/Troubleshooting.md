# Troubleshooting

## App won't start

- **Windows:** run installer as normal user; check antivirus quarantine
- **macOS:** allow app in Privacy & Security if unsigned build
- **Linux AppImage:** `chmod +x` then run; install `fuse` if required on your distro

## Data issues

| Problem | Try |
|---------|-----|
| Habit came back after delete | Update to **2.0.2+**; export backup first |
| Habits empty after Calendar | Update to **2.0.2+** (account `userId` fix) |
| Plugin could not start | Update to **2.0.2+** (CSP sandbox fix); reinstall plugin |
| App stuck after close (macOS) | Update to **2.0.2+**; use Dock or Cmd+Q |
| Reset didn't stick | Same — fixed in 1.7 storage layer |
| Import failed | Check preview; ensure JSON/ZIP from Cultiva export |
| Lost data | Check `userData/backups/` if auto-backup was on |

## Plugins

| Problem | Try |
|---------|-----|
| sha256 mismatch | Registry updated — refresh catalog; don't use stale fork URL |
| Weather won't install | Cultiva 2.0.0+ required; check network for first fetch |
| Plugin enabled but invisible | Re-enable plugins globally; restart app |
| Header chip dead | Disable/re-enable plugin in Settings |

Plugin-specific: [cultiva-plugins wiki](https://github.com/krwg/cultiva-plugins/wiki/Troubleshooting)

## UI

| Problem | Try |
|---------|-----|
| Calendar/profile not clickable | Update to 1.7+ (shell chrome fix) |
| Modal stuck | Press Escape; update if wrong modal closes |
| Animations too much | Enable OS **Reduce motion** |

## Build from source

See [Desktop Build](Desktop-Build). Common fixes:

```bash
npm ci
npm run postinstall   # Electron native deps
npm run electron:build
```

Set `CSC_IDENTITY_AUTO_DISCOVERY=false` for unsigned local builds.

## Still stuck?

1. [GitHub Discussions](https://github.com/krwg/cultiva/discussions)
2. [Open an issue](https://github.com/krwg/cultiva/issues/new/choose) with OS, version, steps
3. Plugin bugs → [cultiva-plugins issues](https://github.com/krwg/cultiva-plugins/issues)
