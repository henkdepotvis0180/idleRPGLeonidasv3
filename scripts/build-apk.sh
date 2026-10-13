#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export EXPO_NO_TELEMETRY=1
export ANDROID_USER_HOME="${ANDROID_USER_HOME:-$PWD/.android}"
mkdir -p "$ANDROID_USER_HOME"
# Always refresh native configuration after dependency or app identity changes.
npx expo prebuild --platform android --no-install
(
  cd android
  ./gradlew assembleRelease --no-daemon --max-workers=2 -PreactNativeArchitectures=arm64-v8a,x86_64
)
mkdir -p artifacts
version=$(node -p "require('./package.json').version")
apk="artifacts/idleRPGLeonidasv3-${version}.apk"
cp android/app/build/outputs/apk/release/app-release.apk "$apk"
(cd artifacts && sha256sum "$(basename "$apk")" > "$(basename "$apk").sha256")
printf 'Test APK: %s\n' "$apk"
