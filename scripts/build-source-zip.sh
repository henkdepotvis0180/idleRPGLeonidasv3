#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
version=$(node -p "require('./package.json').version")
mkdir -p artifacts
archive="idleRPGLeonidasv3-${version}-source.zip"
# Archive only the tested, committed source: no caches, generated native project or credentials.
git archive --format=zip --prefix="idleRPGLeonidasv3-${version}/" HEAD -o "artifacts/$archive"
(cd artifacts && sha256sum "$archive" > "$archive.sha256")
printf 'Source ZIP: artifacts/%s\n' "$archive"
