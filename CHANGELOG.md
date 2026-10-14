# Changelog

## 0.4.0 — 14 October 2026

### The frontier opens

- Replace the small Adventure card with a full-height 3D gameplay viewport and compact overlaid health, spell, movement and tactical controls.
- Add playable third-person exploration with a following camera; switching to/from the aerial view lifts the camera smoothly over the hero.
- Add a seeded local atlas with movement, walk-to-destination paths, camps, caches, ordinary encounters, elites and a gated boss site. Each expedition generates a new layout; level requirements appear on the map.
- Add five regions beyond the original three: Sundered Highlands, Glasswind Expanse, Hollowfen March, Rimefang Reach and Crown of the Still Sky. Eight regions, twenty-four ordinary enemy definitions, eight bosses and eight story chapters now form the campaign.
- Extend the original second-clock story through a plague colossus, a bound frost dragon and Avaron, the Pale Regent. All names, stories, maps, geometry and equipment remain original.
- Keep idle expeditions as an option. Exploration pauses combat until an encounter is chosen; cleared sites return the player to exploration. Roguelike blessings and permanent progress retain their existing roles.

### Heritage, allies and tactics

- Add six freely selectable races: Valeborn, Sylvaren, Stonekin, Emberbound, Veilborn and Drakari, with different proportions, ears, tusks, horns or skin.
- Add two story factions, the Dawn Concord and Umbral Pact, with distinct beliefs, colors and camp banners. Every race/class can join either faction; allegiance is narrative/cosmetic in this alpha.
- Add six permanent companions bought with earned in-game gold. One follows at a time; allies provide damage, armor or timed healing and appear alongside the hero.
- Add left/centre/right positions and Balanced, Assault and Guard stances with explicit damage/defence tradeoffs.
- Add lane telegraphs to later bosses. Moving away before impact reduces incoming damage; staying in the marked lane increases it.
- Show outgoing and incoming damage, critical hits, healing, absorbed damage and dodges as separate animated floating numbers with bounded event history. The revised build projects the actual hero/enemy positions through the 3D camera, keeping the numbers attached to the correct actor in either view.

### Materials, gear and sound

- Replace chibi proportions with a taller articulated adventurer, fitted layered equipment, rivets, more restrained colors and original procedural surface maps.
- Add biome lighting/fog, regional scenery, faction banners, surface detail, contact shadows and drifting motes/snow. Low graphics reduces scenery and particles as well as antialiasing.
- Add 128 regional equipment catalog entries, three forged designs and five rarity tiers. New loot includes item/required level, origin, materials and original lore; weapon appearances adapt to class.
- Add shaded, engraved equipment icons with colored rarity frames and different weapon silhouettes. Item cards show equipped-item comparisons; advanced jewelry can add critical chance or regeneration.
- Replace the shared spell sound with eight elemental/ability-school sounds, stable ability-specific playback variations, bow/heavy/fist/shield sounds and a second original northern ambient theme.
- Add original realistic fantasy launcher artwork. In-game 3D remains a lightweight procedural mobile presentation rather than the launcher illustration.

### Compatibility and development

- Retain all fourteen classes and twenty-eight abilities, sixteen slots, dailies, shops, offline rewards and the original save key.
- Migrate schema-2 and schema-3 saves to schema 4 without losing permanent progress or equipment; keep the Android package/signing identity and use Android versionCode 4 for the revised build (the initial 0.4.0 build used 3).
- Extend modular content tables and optional exploration/companion switches; document the atlas, boss mechanics, item generation and sound mapping.
- Expand gameplay/save tests, real WebGL browser interaction checks and installed-APK Android checks for the new features.
- Pause drawing behind panels while retaining the native GL context; cap native drawing at 30 FPS (20 in low graphics), with animation timing independent of the gameplay tick.
- Read the live Android accessibility tree with a temporary emulator-only helper so active idle combat cannot produce stale control coordinates during tests.
- Include a source ZIP and SHA-256 alongside the standalone APK in the tested GitHub release workflow.

## 0.3.0 — 14 October 2026

### Characters, combat and presentation

- Replace icon-only fights with real 3D chibi heroes, monsters and crowned bosses using Three.js / React Three Fiber / Expo GL.
- Add an interactive wardrobe with visible equipment, skin tones, hair colors/styles, outfit accents and faces.
- Add original gear icons for all sixteen slots and five rarity colors: common, uncommon, rare, epic and legendary.
- Add weapon rigs for swords, daggers, staves, bows, hammers, axes, fists, lutes, wands and scythes.
- Add swings, shield movement, lunges, hits, spell projectiles, floating damage and wolf/bear forms.
- Add original launcher artwork, ambient music, hit/spell sounds and a boss victory chime, with separate music/effects controls.
- Suspend 3D scenes and audio when backgrounded; add a low graphics switch.

### Fourteen classes, twenty-eight abilities

- Retain Warrior, Mage, Rogue and Bard; add Paladin, Ranger, Cleric, Warlock, Monk, Shaman, Berserker, Artificer, Shapeshifter and Necromancer.
- Give each class two distinct active abilities with cooldowns and optional auto-casting.
- Implement direct damage, damage-over-time, healing, temporary barriers, interrupts and transformations through a shared reward-safe combat path.
- Add a class hall to try classes without deleting permanent progress.

### Balance and saves

- Reduce boss XP/gold from 5× to 2× ordinary rewards and story rewards to 50 XP per chapter plus 60 gold.
- Replace guaranteed epic boss drops with 50% uncommon, 40% rare, 9% epic and 1% legendary loot when bag space is available.
- Reduce new gear/blessing bonuses; use diminishing armor returns capped at 60% mitigation.
- Slow new offline accrual to one ordinary reward per 30 seconds, still capped at eight hours per absence.
- Keep boss reward summaries visible until dismissed.
- Migrate existing 0.2.0 saves to schema 3 without removing class, level, currencies, gear, inventory, quest or boss progress.
- Keep the same package/storage key and increment Android versionCode to 2.

### Language and development

- Switch all current game text, content, documentation and release notes to English.
- Separate class kits, appearance palettes, 3D world/models, canvas adapters, audio lifecycle and UI panels into modules.
- Add coverage for all ability kits, spell kills, effects, cooldowns, transformations, rarity, customization and schema-2 migration.
- Add real WebGL browser checks and an installed-APK Android emulator smoke workflow.
- Resolve Three’s ESM renderer on Android for Hermes compatibility and retain native source maps in CI.

## 0.2.0 — 14 October 2026

First playable V3 Android alpha: four classes, three zones with bosses/story chapters, three daily quests, sixteen equipment slots, armor, bags/shop, automatic combat, scrolling icon-based scenes, ten-encounter roguelike runs, local saves and offline rewards. Includes data-driven content, module toggles, eighteen gameplay tests, browser checks, APK/checksum builds and GitHub release publishing.
