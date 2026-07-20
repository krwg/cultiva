# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 2.3.x   | Yes       |
| 2.0.x   | Yes       |
| 1.7.x   | Best effort |
| 1.1.x   | Best effort |
| < 1.1   | No        |

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

1. Use **GitHub Security → Advisories → Report a vulnerability** on [krwg/cultiva](https://github.com/krwg/cultiva), **or**
2. Contact the maintainer via a private channel on their GitHub profile.

Include:

- Description of the issue and impact
- Steps to reproduce
- Affected version(s)
- Proof of concept if available

We aim to acknowledge reports within **72 hours** and provide a status update within **14 days**.

## Scope

In scope:

- Cultiva desktop app (Electron main + renderer)
- Plugin sandbox and install pipeline
- Local data storage (IndexedDB, backups)
- Auto-update mechanism

### Storage (offline-first)

Cultiva stores habits and app settings in **IndexedDB** on the device. There is **no cloud sync** — now or in the near term. Users can export JSON/ZIP backups from **Settings → Data**.

| Topic | Behavior |
|-------|----------|
| **Default** | All data stays on this device |
| **Sign-in profile** | Optional local account for profile metadata; habit data remains on-device |
| **Backups** | User-initiated export/import only |

**Threat model notes:**

- Data does not leave the device unless the user exports a file
- Account sign-in uses PBKDF2-hashed passwords stored locally (see `src/modules/auth.js`)
- A pluggable storage adapter layer (`src/modules/storage-backend.js`) exists for future work; remote sync is not planned for upcoming releases

Out of scope for current releases:

- Third-party plugins not in the official registry (report to plugin author)
- Issues requiring physical access to an unlocked machine
- Social engineering

## Plugin security

Plugins run in a sandboxed iframe with declared permissions. Only install plugins from the [official registry](https://github.com/krwg/cultiva-plugins) unless you trust the author.

### Sandbox threat model

Each plugin loads inside a hidden `sandbox="allow-scripts"` iframe backed by a `blob:` document (`src/core/plugin-sandbox-host.js`). The bootstrap page uses a strict Content-Security Policy and gates `fetch` behind the declared `network` permission.

**Dynamic code (`unsafe-eval`).** Plugin entry scripts are executed via `new Function()` inside the sandbox. This is required for loading arbitrary extension code without a build step. Exposure is limited by:

- No Node.js or Electron APIs in the iframe
- RPC calls validated against an allowlist (`src/core/plugin-rpc.js`)
- Declared `permissions` in `manifest.json` (see [PLUGIN_AUTHOR_GUIDE](docs/PLUGIN_AUTHOR_GUIDE.md))

**`postMessage` and `targetOrigin`.** Sandbox ↔ host communication uses `postMessage(..., '*')` because blob-backed iframes do not share a stable origin string with the parent window. Mitigations:

- The host accepts messages only when `event.source === iframe.contentWindow`
- Payloads must include `__cultivaPlugin: true` and a matching `targetPluginId`
- RPC method names are allowlisted before execution

Plugin authors should request only the permissions they need:

| Permission | Capability |
|------------|------------|
| `storage` | Namespaced get/set/remove |
| `ui` | Notifications, header/garden/sheet, locale/theme/version/date |
| `network` | `fetch` in sandbox |
| `habits.read` | Read-only habit snapshots |
| `settings.read` | Public app settings subset |

See the permissions table in [PLUGIN_AUTHOR_GUIDE](docs/PLUGIN_AUTHOR_GUIDE.md#permissions).

## License note

Cultiva application code is **GPL-3.0**. Official plugins in cultiva-plugins are **MIT**.
