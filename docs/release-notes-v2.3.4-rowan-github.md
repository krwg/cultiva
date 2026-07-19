# Cultiva 2.3.4 · Rowan

**Plugin install integrity · aligned store copy**

**Tag:** [2.3.4](https://github.com/krwg/cultiva/releases/tag/2.3.4)

---

## Summary

Fixes plugin install failures (`Integrity check failed for manifest.json`) caused by a stale in-memory registry cache after a fast registry push, and normalizes LF hashes for text plugin files. Companion catalog **3.6.2** ships even store descriptions for first-time users.

## Fixes

- Always refetch `registry.json` on `plugin:install` (sha256 cannot lag behind GitHub raw)
- LF-normalize `.json` / `.js` / `.css` (and related text) before sha256 compare

## Companion

- Registry **3.6.2** — every plugin description is two clear sentences (EN + RU)
- Radio **2.6.2** — manifest description matched to catalog voice

## Author

**krwg** \<shevotsukov@icloud.com\> — sole author, no co-authors.
