#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
android_sdk="${ANDROID_HOME:-${ANDROID_SDK_ROOT:?Android SDK is required}}"
android_jar=$(printf '%s\n' "$android_sdk"/platforms/android-*/android.jar | sort -V | tail -1)
android_aapt=$(printf '%s\n' "$android_sdk"/build-tools/*/aapt | sort -V | tail -1)
tools_dir=$(dirname "$android_aapt")
out="$PWD/artifacts/native-tools"
mkdir -p "$out/classes" "$out/dex"
javac -source 8 -target 8 -classpath "$android_jar" -d "$out/classes" tests/native/DumpInstrumentation.java
"$tools_dir/d8" --min-api 24 --lib "$android_jar" --output "$out/dex" "$out/classes/com/leonidas/smoketools/DumpInstrumentation.class"
"$android_aapt" package -f -M tests/native/AndroidManifest.xml -I "$android_jar" -F "$out/ui-tree-unsigned.apk"
(cd "$out/dex" && "$android_aapt" add "$out/ui-tree-unsigned.apk" classes.dex)
if [[ ! -f "$out/test-tools.jks" ]]; then
  keytool -genkeypair -keystore "$out/test-tools.jks" -alias tools -storepass android -keypass android -dname 'CN=Emulator-only test tools' -keyalg RSA -validity 365 -noprompt >/dev/null 2>&1
fi
"$tools_dir/apksigner" sign --ks "$out/test-tools.jks" --ks-pass pass:android --key-pass pass:android --out "$out/ui-tree.apk" "$out/ui-tree-unsigned.apk"
printf 'Emulator test helper: %s\n' "$out/ui-tree.apk"
