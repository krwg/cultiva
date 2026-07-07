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

Out of scope:

- Third-party plugins not in the official registry (report to plugin author)
- Issues requiring physical access to an unlocked machine
- Social engineering

## Plugin security

Plugins run in a sandboxed iframe with declared permissions. Only install plugins from the [official registry](https://github.com/krwg/cultiva-plugins) unless you trust the author.

## License note

Cultiva application code is **GPL-3.0**. Official plugins in cultiva-plugins are **MIT**.
