# Changelog

## 0.2.0 — 14 oktober 2026

Eerste speelbare alpha in **idleRPGLeonidasv3**, voortbouwend op de eerdere Leonidas-prototypebasis.

### Gameplay

- Vier speelbare classes met verschillende beginstats.
- Drie gebieden met negen gewone vijanddefinities en drie eindbazen.
- Drie hoofdverhaalquests en drie afzonderlijk te claimen daily quests.
- Roguelike runs van tien encounters met tijdelijke zegenkeuzes op drie rustpunten.
- Goud, XP, levels, offline XP/goud en lokale voortgang.
- Gegarandeerde epic eindbaasloot wanneer er bagruimte is.

### Gear en presentatie

- Zestien gearslots, inclusief offhand, twee ringen en twee trinkets.
- Armor verlaagt inkomende schade; HP en aanval schalen met gear en levels.
- Shop, verkopen, gear wisselen en maximaal vier bags.
- Bewegende achtergrond, aanvalslunges, hitreacties en zwevende schadecijfers.
- Android safe-area-ondersteuning en schermen op telefoonformaat.

### Uitbreidbaarheid en onderhoud

- Losse bestanden voor gebieden/vijanden/bazen, gear en quests/zegens.
- Schakelbare shop-, daily-, offline- en roguelike-modules via `src/config.ts`.
- Automatische wereldkaart en hoofdquests op basis van gebiedsdata.
- Baasregistratie met stabiele gebied-ID's.
- Pure gameplay-engine met savevalidatie en 18 geautomatiseerde tests.
- Reproduceerbare browserchecks en een GitHub Actions-workflow voor checks en test-APK's.
- APK-buildscript met SHA-256-checksum; Nederlandse README en uitbreidhandleiding.

### Grenzen van deze alpha

- Alleen lokale saves; geen cloudsync, multiplayer of anti-cheat.
- Classvaardigheden, geluid, talents en uitgebreide spriteanimaties volgen later.
- Testsignatuur; nog geen vaste distributiesleutel of Play Store-release.
- Cloudbrowsercontroles vervangen geen test op een echte Android-telefoon.
