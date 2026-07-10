# Contributing to Cultiva

Thank you for considering a contribution. Cultiva is an offline-first Electron habit tracker with a plugin ecosystem.

## Before you start

- Read the [README](README.md) and [CHANGELOG](CHANGELOG.md)
- Plugin authors: see [docs/PLUGIN_AUTHOR_GUIDE.md](docs/PLUGIN_AUTHOR_GUIDE.md) and [cultiva-plugins](https://github.com/krwg/cultiva-plugins)
- Security issues: see [SECURITY.md](SECURITY.md) — **never** file public issues for vulnerabilities

## How to report bugs

1. Search [existing issues](https://github.com/krwg/cultiva/issues)
2. If issue creation is restricted on the repository, use [Discussions](https://github.com/krwg/cultiva/discussions) or contact the maintainer via the email in SECURITY.md
3. Use the bug report template when available; include OS version, Cultiva version, and reproduction steps

## How to suggest features

Open a feature request issue or start a Discussion with context: problem, proposed solution, alternatives considered.

## Pull requests

1. Fork and branch from `main`
2. Keep PRs focused — one logical change per PR
3. Run locally before submitting:

```bash
npm ci
npm run lint
npm run test
npm run build
```

4. Write commit messages and PR descriptions in **English**
5. In-app strings: add keys to `src/core/i18n.js` (en + ru minimum)

## Code style

- Vanilla ES modules, no framework
- Match existing patterns in surrounding files
- No unrelated refactors in feature PRs
- Electron main process: CommonJS in `electron/`

## Project structure

| Path | Purpose |
|------|---------|
| `src/main.js` | Garden page entry (wires controllers) |
| `src/app/` | UI controllers (garden, settings, backup, plugins, onboarding, …) |
| `src/core/` | Plugin sandbox/RPC, i18n, themes, ambient-bg, shell-chrome |
| `src/modules/` | Habits, storage (IndexedDB), auth |
| `src/pages/calendar/` | Calendar Vite entry |
| `electron/` | Main process, IPC, auto-updater |
| `docs/wiki/` | GitHub Wiki source (publish per `docs/WIKI.md`) |
| `docs/PLUGIN_AUTHOR_GUIDE.md` | Plugin author reference |

## License

- **Cultiva application**: GPL-3.0 (see [LICENSE](LICENSE))
- **Official plugins** (separate repo): MIT

Contributions to this repository are licensed under GPL-3.0.

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Support

Questions and how to avoid mis-filed issues: [SUPPORT.md](SUPPORT.md).
