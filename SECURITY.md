# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 1.7.x   | Yes       |
| 1.1.x   | Best effort |
| < 1.1   | No        |

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Send a private report to: **shevotsukov@icloud.com**

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

### Storage backends (offline-first)

Cultiva stores habits and app settings in **IndexedDB** on the device. Users can choose a storage backend in **Settings → Data**:

| Backend | Behavior |
|---------|----------|
| **Local** (default) | All data stays on this device. No network access for habit storage. |
| **Account** | Requires sign-in. Uses the same local IndexedDB profile today; prepares for future encrypted sync (phase 2 — not implemented yet). |

**Threat model notes:**

- Switching backends runs an export → import migration in-process; data is not sent over the network.
- Account sign-in uses PBKDF2-hashed passwords stored locally (see `src/modules/auth.js`).
- Future cloud sync must use end-to-end encryption and conflict resolution; see [CONTRIBUTING.md](CONTRIBUTING.md#data-sync-roadmap-phase-2).

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

Plugin authors should request only the permissions they need. See the permissions table in [PLUGIN_AUTHOR_GUIDE](docs/PLUGIN_AUTHOR_GUIDE.md#3-manifest-schema).

## License note

Cultiva application code is **GPL-3.0**. Official plugins in cultiva-plugins are **MIT**.
