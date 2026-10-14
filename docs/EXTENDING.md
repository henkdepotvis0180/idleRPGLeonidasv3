# Extending Leonidas

## Content and optional modules

`src/config.ts` exposes independent shop, daily quest, offline reward, roguelike, exploration and companion switches. Both UI and engine respect them. The main story and basic combat are the core. Restart/rebuild after changes. With roguelike disabled, combat does not wait for blessings and temporary blessing stats are ignored.

`RULES` defines bag capacity, run length, rest points, boss reward multiplier, story rewards and offline accrual. Rest points must come before the boss encounter. Changes to capacities, slot IDs or save structure need explicit migrations.

## Add a zone and boss

Append a typed `Zone` entry to `ZONES` in `src/content/zones.ts`. The map, level gate and main quest appear automatically. Each zone needs a stable unique ID, name/subtitle, unlock level, a nonempty `enemies` list, one boss, XP/gold, color and story. Enemy definitions contain stable IDs, names, HP, attack and an `art` family (`wolf`, `ghost`, `boss`, `soldier`, `golem`, `dragon`).

Add a new visual family in `src/visuals/Models.tsx` for a new kind of monster. All current models are original procedural geometry; they do not require external models or downloads at runtime.

Append rather than reorder zones: boss wins use stable IDs, but current zone and claimed chapter still use indexes. Removing/reordering requires migration.

## Frontier, factions, companions and boss mechanics

`src/content/world.ts` supplies save-stable race/faction/companion IDs, stance tradeoffs, biome palettes and `generateRegion`. The generator accepts region index, expedition number, level and enemy count; the same inputs reproduce the same fourteen sites. Site IDs, player coordinates, discovered/cleared sites, destination and camera mode are serialized. Basic movement is bounded to the compact −9…9 play area. Camera smoothing/flight lives in `BattleWorld.tsx`; procedural scenery lives in `Environment.tsx`.

Append a biome palette when adding a region. Regional items are derived automatically by `itemFactory.ts`; extend `THEMES` for new materials and lore. Appending a region adds sixteen catalog entries without editing shop UI or combat. Appending companions adds hire/switch controls automatically; add a visual kind to the companion renderer if needed. Prices, unlock levels, damage, armor and four-turn healing are data fields. Only one owned companion is active.

Bosses may declare `mechanic: { name, description, every, lane, multiplier }`. Lanes are −1 (left), 0 (centre), +1 (right); `every` is the positive combat-turn period. The shared HUD telegraphs the attack and the engine checks the player's selected lane on impact. Keep multiplier/period balanced and add actual damage tests for new mechanic types.

Race/faction allegiance is appearance/narrative in 0.4.0. All fourteen classes remain available to all races and either faction. Add reputation or faction quests as a separate content/engine module if desired.

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

Slots have original icons in `GearIcon.tsx` and visible attachments/materials in `HeroModel.tsx`. Add both when introducing a slot. Jewelry appears as small gems; the main silhouette comes from helmet, shoulders, cloak, chest, gloves, boots, weapon and offhand.

Appearance palettes live in `src/appearance.ts`. Changing palette lengths/order affects stored indexes, so migrate saves if you remove or reorder choices. Outfit accents are independent of equipment materials; rarity colors appear on frames and gem details.

Armor uses diminishing returns: `armor / (armor + 35)`, capped at 60% mitigation, with a minimum of one damage. Existing 0.2.0 gear retains stats during migration; new loot uses regional materials and the current restrained economy. `critical` is percentage points with a combined 20% cap; `vitality` is regeneration per combat turn with a combined cap of 5. Item requirements are enforced by both purchasing and equipping. Optional metadata stays backwards compatible with old gear.

## Audio and original assets

Run `python3 scripts/generate-audio.py` to regenerate the original deterministic music/SFX. No third-party samples or compositions are used. Expo Audio pauses all players when backgrounded and releases them on unmount. Music is initially off; effects are on. `soundProfile.ts` maps spell schools and weapon styles to distinct bundled sounds, with stable ability-specific rate variations. `useGameAudio.ts` manages the actual players; add an asset, mapping and unconditional player hook when introducing a sound. No microphone permission, recording or background playback is enabled.

The launcher icon is original generated artwork. Asset provenance and legacy icon licenses are in `assets/ATTRIBUTION.md`.

## Native rendering and UI verification

The native canvas uses an explicit draw scheduler capped at 30 FPS, or 20 in low graphics. Panels pause drawing and keep the GL context alive, avoiding expensive teardown during map/journal transitions. Animation deltas remain separate from one-second combat ticks. Browser scenes use their normal frame loop.

Android checks build a separate temporary headless test APK from `tests/native/`. It reads the live accessibility tree without waiting for an idle screen; animated/automatic games otherwise give stale coordinates. The helper and its generated test key stay in ignored build outputs and are not bundled into the game APK. `Diagnose existing Android APK` can exercise an already-built artifact during diagnosis; release publication still requires the complete source build workflow to succeed.

## Saves and releases

The app ID and storage key are stable. Version 0.4.0 writes schema 4 and migrates schemas 2 and 3 before validation. Schema 4 adds heritage, factions, company, tactics, world state, combat turns and bounded damage events. Keep the real schema-2 fixture test when changing migration behavior. Unknown or corrupted structures are rejected safely; development builds should not overwrite real device saves unintentionally.

Before release:

1. Run TypeScript, gameplay and browser/WebGL tests.
2. Bump `package.json`, lockfile, `app.json` version and Android versionCode.
3. Build the APK and run Android emulator checks; review screenshots and logcat.
4. Verify the signing certificate matches the previous release if users should install over it.
5. Update changelog/update log in English, push and publish the successful workflow's exact artifact.
6. Verify the published APK and ZIP checksums, signing identity, app ID and embedded bundle. The ZIP is produced with `git archive` from the tested commit and contains no generated native folders, caches or credentials.

Use a stable private signing key for public distribution. The current prototype uses a test key; key rotation requires an explicit update/migration plan.
