# Update log

## 14 October 2026 — 0.3.0: heroes take shape

This release replaces the previous icon-based presentation with an original 3D chibi hero, visible worn gear, monsters and boss models. It adds fourteen class kits, twenty-eight active abilities, customization, rarity icons/colors, original music/SFX and an English interface. See [CHANGELOG.md](CHANGELOG.md) and [the class guide](docs/CLASSES.md).

### Compatibility and balance

The package remains `com.leonidas.idlerpgv3`; versionCode increases to `2`. Schema-2 saves from 0.2.0 upgrade to schema 3 under the same storage key. Existing currencies, classes, levels, equipped/inventory gear, quests and boss flags are retained. Old item names are translated; existing stats remain. New loot, rewards and armor mitigation use the revised balance. The local APK's signing certificate has been checked against 0.2.0 and matches, allowing an in-place update.

### Validation

- TypeScript strict checks and all **29 gameplay/migration tests passed** locally and on GitHub.
- Playwright checks real WebGL pixels, all fourteen class models/weapon styles, customization, equipment, rarity, shapeshifting, quests, shop, settings and schema-2 migration in the actual app.
- Browser layouts checked at 390 × 844 and 320 × 740.
- Native standalone Android APK build completed locally in the cloud.
- Android 15 / API 35 x86_64 emulator: APK installed and launched; 3D class selection, live battle, wardrobe, skin customization and music toggles passed. Screenshots were reviewed and show the actual native 3D models. No fatal JS/native errors were detected.

### Release record

- [Successful checks, APK build and Android emulator test](https://github.com/henkdepotvis0180/idleRPGLeonidasv3/actions/runs/38489855154).
- [Successful publication](https://github.com/henkdepotvis0180/idleRPGLeonidasv3/actions/runs/38489914380).
- [Release v0.3.0 — APK and checksum](https://github.com/henkdepotvis0180/idleRPGLeonidasv3/releases/tag/v0.3.0).
- Tested source commit: `bdaaf510ccd22d5235cfd18faab78a5b39f6e8db`.
- APK: **54,300,397 bytes**, ARM64 + x86_64, minimum API 24, target API 36.
- SHA-256: `526496d5a4ef55b2dedd02f8f8d039514c7b0c3395042b3de618e8a756c5771d`.
- Published file downloaded again: checksum and APK Signature Scheme v2 verified; embedded Hermes bundle (2,681,312 bytes), both native GL libraries and all four WAV assets present.
- Signing certificate SHA-256 matches 0.2.0: `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.

The emulator caught a startup issue in Three's Node/CommonJS entry. Metro now resolves Three's ESM renderer on Android and the repeated native test passes. Future CI builds also retain the exact Hermes source map for diagnosis.

Screenshots: the [native battle capture](docs/preview.png) comes from the Android emulator; the [geared wardrobe capture](docs/wardrobe.png) is from the browser/WebGL test. Physical-device performance and audio quality still benefit from player testing.

## 14 October 2026 — 0.2.0 foundation

The initial V3 release introduced the core idle combat, gear, quests, story, roguelike runs and local save system. Eighteen gameplay tests and browser checks passed; a standalone APK was built and published through GitHub Actions. The user subsequently confirmed that playing past the first boss worked on their Android device.
