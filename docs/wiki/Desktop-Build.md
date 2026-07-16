# Desktop Build

Build **Cultiva** from source on your machine.

## Prerequisites

- **Node.js** 20+ (CI uses current LTS)
- **npm** 10+
- Platform tools for packaging:
  - **Windows:** none extra for NSIS (electron-builder bundled)
  - **macOS:** Xcode CLI tools (for `sips`, `iconutil` in icon pipeline)
  - **Linux:** `rpm`/`fpm` optional for some targets; AppImage/deb work on Ubuntu CI

## Clone & install

```bash
git clone https://github.com/krwg/cultiva.git
cd cultiva
npm ci
```

## Development

```bash
npm run electron:dev:watch   # Vite + Electron hot reload
```

Or web-only: `npm run dev` (no Electron features).

## Production build

```bash
npm test
npm run electron:build
```

Outputs in `release/` for **your current OS**.

### Per-platform (unsigned)

```bash
npm run build
npx electron-builder --win --publish never
npx electron-builder --mac --publish never
npx electron-builder --linux --publish never
```

Use `CSC_IDENTITY_AUTO_DISCOVERY=false` for unsigned builds (default in `electron:build` script).

## CI artifacts

Tag push `2.0.2` style triggers `.github/workflows/release.yml` — matrix builds Windows, macOS, Linux and publishes to GitHub Releases.

## Icons

`npm run prebuild` runs `sync-build-icon.mjs` — generates `build/icon.ico`, `.icns`, `build/icons/` for electron-builder.

## Troubleshooting builds

| Error | Fix |
|-------|-----|
| Missing `build/icon.png` | Run `npm run prebuild` |
| Wine/symlink on Windows for Linux | Build Linux on CI or Linux host |
| Electron rebuild | `npm run postinstall` |
