# Leonidas V3 — The Shattered Dawn

An English-language idle roguelike RPG for Android, built with React Native, Expo, Three.js and React Three Fiber. Original chibi characters, worlds and effects take broad genre inspiration from fantasy RPGs without using their characters, assets, music or code.

**[Download the 0.3.0 Android alpha](https://github.com/henkdepotvis0180/idleRPGLeonidasv3/releases/tag/v0.3.0)** · [Changelog](CHANGELOG.md) · [Update log](UPDATELOG.md)

Android 7.0+, ARM64 and OpenGL ES 3-capable hardware are recommended. The APK includes the game, models and audio; no Expo Go, development server or account is needed. A graceful graphics error message keeps gameplay available if a device cannot create the 3D context. This is a test alpha, not a Play Store release.

## What is new in 0.3.0?

- Real 3D battles and a wardrobe: your chibi hero, visible equipped gear, wolves, spirits and distinctive crowned bosses.
- Fourteen playable classes with **28 active abilities**, cooldowns, optional auto-casting, healing, barriers, interrupts, curses and wolf/bear transformations.
- Custom skin tone, hairstyle, hair color, outfit accent and face, saved on your device.
- Sixteen equipment slots, original item icons and white/green/blue/purple/orange rarity borders. Weapons visually adapt to your class.
- Sword/weapon swings, shield movement, lunges, hits, spell projectiles, floating damage and transformation effects.
- A new launcher icon and original procedural ambient music, hit/spell sounds and a boss victory chime. Enable music in **Settings**; sound effects have their own switch.
- Boss XP/gold reduced from 5× to 2×. Boss drops are no longer always epic. Smaller gear/blessing bonuses and diminishing armor mitigation (60% cap) keep progression meaningful.
- English UI, story, class descriptions, item names, quests, documentation and release notes.
- Automatic migration of 0.2.0 saves: class, level, currency, inventory, gear, quests and boss progress are retained. Existing equipment stats are preserved; new loot uses the revised balance.

<img src="docs/preview.png" width="320" alt="Leonidas 0.3.0 real-time 3D battle preview"> <img src="docs/wardrobe.png" width="320" alt="Customizable 3D hero with equipped gear">

The game also includes three zones, nine ordinary enemy definitions, three bosses, a main story, three daily quests, ten-encounter runs with blessing choices, four purchasable bags, a shop and offline XP/gold. Dailies reset at **00:00 UTC**. Offline rewards accrue at one ordinary enemy reward per 30 seconds, capped at eight hours per absence; they do not award loot, boss wins or quest kills.

## Updating from 0.2.0

Install the new APK **over the existing app**. The package remains `com.leonidas.idlerpgv3`, versionCode is now `2`, and the tested builds use the same signing certificate. The original save key is retained and schema 2 migrates to schema 3. Back up any important device data before removing the app: uninstalling deletes local progress. Saves do not sync across devices and the local clock is not cheat-proof.

The prototype still uses a test signing key. Use a fixed private release key before public distribution or Play Store updates; do not commit private keys.

## Development and builds

Requires Node.js 24. Native builds also need JDK 21 and an Android SDK with platform 36, build tools 36.0.0, NDK 27.1.12297006 and CMake 3.22.1.

```sh
npm ci
npm run typecheck
npm test
npm start
```

Build a standalone APK for ARM64 phones and x86_64 emulators:

```sh
# Set JAVA_HOME and ANDROID_HOME for your machine first.
npm run apk
```

Output: `artifacts/idleRPGLeonidasv3-0.3.0.apk` and its `.sha256` file. The script refreshes generated native configuration before building. Generated native folders, caches, keys and build outputs are ignored by Git. Lockfile dependencies are committed.

Browser checks use real WebGL rendering, not a mocked scene:

```sh
npx playwright install chromium
npm run test:ui
# CHROMIUM_PATH can select an existing Chromium installation.
```

**GitHub Actions → Android test APK** runs TypeScript, gameplay and WebGL/browser checks, builds the APK and runs an installed-APK smoke test in an Android emulator. **Publish Android alpha** takes the successful build's run ID and publishes that exact commit's APK, checksum and changelog. It waits for the entire source workflow, including the emulator job, to succeed.

## Extend the game

| File | Purpose |
| --- | --- |
| `src/content/classes.ts` | Classes, weapon styles and data-driven ability kits |
| `src/content/zones.ts` | Zones, enemies, bosses, rewards and main story |
| `src/content/gear.ts` | Slots, shop gear, rarity colors and loot rarity distribution |
| `src/content/quests.ts` | Daily objectives and temporary blessings |
| `src/config.ts` | Module switches and economy/run/offline rules |
| `src/appearance.ts` | Appearance choices and validation |
| `src/engine.ts` | Pure gameplay transitions, combat, abilities and save migration |
| `src/visuals/` | Original 3D models, scene lighting, rigs and battle effects |
| `src/components/ThreeStage*` | Native Expo GL and browser WebGL canvas adapters |
| `src/audio/`, `assets/audio/` | Audio lifecycle and bundled original sounds |

See [EXTENDING.md](docs/EXTENDING.md) and the [class guide](docs/CLASSES.md). Asset provenance is documented in [assets/ATTRIBUTION.md](assets/ATTRIBUTION.md).

This is a compact first 3D release: procedural models and rig transforms are deliberately simple. It does not yet include imported skeletal animation sets, character creation morph sliders, class talent trees, multiplayer or cloud saves. Physical device testing remains useful even after browser and emulator checks.
