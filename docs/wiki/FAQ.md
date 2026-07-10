# FAQ

## General

**Is Cultiva free?**  
Yes. GPL-3.0 open source. Download from [GitHub Releases](https://github.com/krwg/cultiva/releases).

**Do I need an account?**  
No. Everything runs locally.

**Does Cultiva sync to the cloud?**  
No. Export JSON, ZIP, or iCal to move data yourself.

**Which platforms are supported?**  
Windows, macOS (Intel + Apple Silicon), and Linux as of **1.7.0**.

## Habits

**What is Legacy?**  
A habit that reached **365+** days of growth becomes a Legacy tree — a permanent trophy.

**What is grace day?**  
An optional setting: **one** missed day per calendar month does not reset your streak.

**Can I delete a habit?**  
Yes, from the card context menu. Deletions persist after reload (1.7+).

## Data

**Where is my data stored?**  
IndexedDB in the Electron user data directory. Auto-backups (if enabled) go to `userData/backups/`.

**How do I move to another PC?**  
Export ZIP or JSON on the old machine, import on the new one. Preview shows habit count before import.

## Plugins

**Are plugins safe?**  
Official plugins are sha256-verified from the cultiva-plugins registry and run in a sandbox. Only install third-party plugins if you trust the author.

**Why won't a plugin install?**  
Usually a version mismatch (need Cultiva 1.7.0+) or stale hash in a forked registry. See [Troubleshooting](Troubleshooting).

## Updates

**How do updates work?**  
The desktop app checks GitHub Releases when published with `latest.yml`. You can also download installers manually.

## Localization

**Which languages?**  
English and Russian in 1.7.0 (285 string pairs each).
