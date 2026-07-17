#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
SAFE="-c safe.directory=F:/development/cultiva"
git $SAFE add -A
TREE=$(git $SAFE write-tree)
PARENT=$(git $SAFE rev-parse HEAD)
MSG_FILE=$(mktemp)
cat >"$MSG_FILE" <<'EOF'
feat: 2.1.0 Rowan — calendar heatmap, paused garden, icons, installer branding

Bind NSIS BrandingText to cultiva.release.json via sync-version; aggregate
all-habits heatmap on /calendar; Trophy next-tree progress with settings
toggle; Paused section for paused/archived habits; fix Windows exe/tray
icons (signAndEditExecutable + nativeImage tray PNG).
EOF
export GIT_AUTHOR_NAME='krwg'
export GIT_AUTHOR_EMAIL='shevotsukov@icloud.com'
export GIT_COMMITTER_NAME='krwg'
export GIT_COMMITTER_EMAIL='shevotsukov@icloud.com'
NEW=$(git $SAFE commit-tree "$TREE" -p "$PARENT" -F "$MSG_FILE")
rm -f "$MSG_FILE"
git $SAFE reset --hard "$NEW"
git $SAFE log -1 --format='%H%n%an <%ae>%n%B'
