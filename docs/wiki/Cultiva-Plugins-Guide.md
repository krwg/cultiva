# Cultiva Plugins Guide

Quick reference for plugin authors. **Full spec:** [PLUGIN_AUTHOR_GUIDE.md](https://github.com/krwg/cultiva/blob/main/docs/PLUGIN_AUTHOR_GUIDE.md) in the Cultiva repo.

---

## Requirements

- Cultiva **≥ 2.0.0** for registry **3.3.0** (appearance contributions, calendar rail, `habits.write`)
- Cultiva **≥ 2.0.0 · Rowan** (PLE1) for contributions API, themes, and expanded plugin RPC
- Cultiva **≥ 1.7.0** still works for basic registry **3.x** plugins (sha256, `data.read`, manifest settings UI)
- Plugin published in [cultiva-plugins](https://github.com/krwg/cultiva-plugins)
- `minAppVersion` in manifest — see examples below

## Folder layout

```
my-plugin/
├── manifest.json
├── index.js
└── styles.css    # optional
```

## manifest.json (minimal)

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Short summary.",
  "icon": "",
  "entry": "index.js",
  "permissions": ["storage", "ui"],
  "minAppVersion": "1.7.0"
}
```

## Entry script

Must **return** a plugin instance:

```javascript
class MyPlugin {
  async onEnable() {
    this.context.ui.registerHeaderItem({ label: 'Hello', icon: '' });
  }
  onDisable() {}
}
return new MyPlugin(context, hooks);
```

## Main-window UI (sheets)

Plugin JS cannot touch Cultiva's DOM directly. Use:

- `context.ui.openMainSheet(html)` / `closeMainSheet()`
- `context.ui.updateMainHeader({ label, icon })`
- `onModalAction(action, payload)` for `data-cultiva-act` buttons

## Bundled data

List files in `manifest.data`, read with `context.data.read('file.json')`.

## Publishing

1. Add plugin folder + registry entry in cultiva-plugins
2. `node scripts/compute-registry-sha256.mjs`
3. PR → merge → users refresh catalog in Cultiva

**Wiki:** [Publishing a Plugin](https://github.com/krwg/cultiva-plugins/wiki/Publishing-a-Plugin)

## Typings

`docs/cultiva-plugin.d.ts` in Cultiva repo.
