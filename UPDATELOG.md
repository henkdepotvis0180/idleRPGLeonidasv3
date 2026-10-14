# Update log

## 14 October 2026 — 0.3.0: heroes take shape

This release replaces the previous icon-based presentation with an original 3D chibi hero, visible worn gear, monsters and boss models. It adds fourteen class kits, twenty-eight active abilities, customization, rarity icons/colors, original music/SFX and an English interface. See [CHANGELOG.md](CHANGELOG.md) and [the class guide](docs/CLASSES.md).

### Compatibility and balance

The package remains `com.leonidas.idlerpgv3`; versionCode increases to `2`. Schema-2 saves from 0.2.0 upgrade to schema 3 under the same storage key. Existing currencies, classes, levels, equipped/inventory gear, quests and boss flags are retained. Old item names are translated; existing stats remain. New loot, rewards and armor mitigation use the revised balance. The local APK's signing certificate has been checked against 0.2.0 and matches, allowing an in-place update.

### Validation

- TypeScript and gameplay/migration coverage run locally in the cloud.
- Playwright checks real WebGL pixels, all fourteen class models/weapon styles, customization, equipment, rarity, shapeshifting, quests, shop, settings and schema-2 migration in the actual app.
- Browser layouts checked at 390 × 844 and 320 × 740.
- Native standalone Android APK build completed locally in the cloud.
- GitHub CI build, installed-APK emulator smoke test and published-artifact checks are recorded below after completion.

### Release record

Publication verification pending. This section will be updated with the successful workflow, APK checksum and Android emulator outcome before handoff.

## 14 October 2026 — 0.2.0 foundation

The initial V3 release introduced the core idle combat, gear, quests, story, roguelike runs and local save system. Eighteen gameplay tests and browser checks passed; a standalone APK was built and published through GitHub Actions. The user subsequently confirmed that playing past the first boss worked on their Android device.
