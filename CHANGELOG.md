# Changelog

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

## 0.2.0 — 14 October 2026

First playable V3 Android alpha: four classes, three zones with bosses/story chapters, three daily quests, sixteen equipment slots, armor, bags/shop, automatic combat, scrolling icon-based scenes, ten-encounter roguelike runs, local saves and offline rewards. Includes data-driven content, module toggles, eighteen gameplay tests, browser checks, APK/checksum builds and GitHub release publishing.
