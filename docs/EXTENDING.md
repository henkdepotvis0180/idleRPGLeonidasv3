# Extending Leonidas

## Content and optional modules

`src/config.ts` exposes independent shop, daily quest, offline reward and roguelike switches. Both UI and engine respect them. The main story and basic combat are the core. Restart/rebuild after changes. With roguelike disabled, combat does not wait for blessings and temporary blessing stats are ignored.

`RULES` defines bag capacity, run length, rest points, boss reward multiplier, story rewards and offline accrual. Rest points must come before the boss encounter. Changes to capacities, slot IDs or save structure need explicit migrations.

## Add a zone and boss

Append a typed `Zone` entry to `ZONES` in `src/content/zones.ts`. The map, level gate and main quest appear automatically. Each zone needs a stable unique ID, name/subtitle, unlock level, a nonempty `enemies` list, one boss, XP/gold, color and story. Enemy definitions contain stable IDs, names, HP, attack and an `art` family (`wolf`, `ghost`, `boss`).

Add a new visual family in `src/visuals/Models.tsx` for a new kind of monster. All current models are original procedural geometry; they do not require external models or downloads at runtime.

Append rather than reorder zones: boss wins use stable IDs, but current zone and claimed chapter still use indexes. Removing/reordering requires migration.

## Add a class or ability

Add a `HeroClass` in `src/content/classes.ts`: stable ID, name, archetype, description, icon, base attack/HP, color, weapon style, shield preference and two abilities. Existing weapon styles are sword, dagger, staff, bow, hammer, axe, fists, lute, wand and scythe. The visual adapter automatically picks the class's weapon and outfit color.

An ability's supported effect fields are:

| Field | Meaning |
| --- | --- |
| `damage` | Multiplier of current attack |
| `heal` | Fraction of max HP restored; capped at max HP |
| `shield` | Fraction of max HP absorbed by a temporary barrier |
| `dot` | Attack multiplier applied each turn for `duration` turns, to this enemy only |
| `stun` | Number of incoming enemy turns interrupted |
| `form` | `wolf` or `bear`; visual transformation lasting `duration` turns |
| `cooldown` | Combat turns before the ability is ready again |
| `effect` | Steel, fire, frost, nature, holy, shadow, arcane, lightning or song visuals/audio |

Cooldowns freeze when combat is paused or awaiting a blessing. Active spells cannot be cast during blessing choices. A direct or damage-over-time kill uses the same loot/quest/reward path as a normal attack, preventing double rewards. Auto-casting uses one available ability per combat tick. Class changes start a new run and reset temporary combat state, while adapting weapon appearances and preserving permanent progress.

For a new kind of effect, extend the engine, save validation, the effect type and the visual palette together. Add tests for the actual behavior rather than only checking definition shape.

## Gear and appearance

`src/content/gear.ts` defines sixteen slots and five rarity tiers. Item stats are explicit; rarity affects newly generated loot through small multipliers. Shop prices and sell values currently share the same `price` field. Weapon visuals adapt to class when bought, dropped or when changing class; stats remain attached to the item.

Slots have original icons in `GearIcon.tsx` and visible attachments/colors in `Models.tsx`. Add both when introducing a slot. Jewelry appears as small gems; the main silhouette comes from helmet, shoulders, cloak, chest, gloves, boots, weapon and offhand.

Appearance palettes live in `src/appearance.ts`. Changing palette lengths/order affects stored indexes, so migrate saves if you remove or reorder choices. The outfit accent colors the scarf independently from equipment rarity.

Armor uses diminishing returns: `armor / (armor + 35)`, capped at 60% mitigation, with a minimum of one damage. Existing 0.2.0 gear retains stats during migration; new loot uses the 0.3.0 economy.

## Audio and original assets

Run `python3 scripts/generate-audio.py` to regenerate the original deterministic music/SFX. No third-party samples or compositions are used. Expo Audio pauses all players when backgrounded and releases them on unmount. Music is initially off; effects are on. No microphone permission, recording or background playback is enabled.

The launcher icon is original generated artwork. Asset provenance and legacy icon licenses are in `assets/ATTRIBUTION.md`.

## Saves and releases

The app ID and storage key are stable. Version 0.3.0 writes schema 3 and migrates schema 2 before validation. Keep the real schema-2 fixture test when changing migration behavior. Unknown or corrupted structures are rejected safely; development builds should not overwrite real device saves unintentionally.

Before release:

1. Run TypeScript, gameplay and browser/WebGL tests.
2. Bump `package.json`, lockfile, `app.json` version and Android versionCode.
3. Build the APK and run Android emulator checks; review screenshots and logcat.
4. Verify the signing certificate matches the previous release if users should install over it.
5. Update changelog/update log in English, push and publish the successful workflow's exact artifact.
6. Verify the published download's checksum, signature, app ID and embedded bundle.

Use a stable private signing key for public distribution. The current prototype uses a test key; key rotation requires an explicit update/migration plan.
