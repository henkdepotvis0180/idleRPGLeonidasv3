# Updatelog

## 14 oktober 2026 — V3-basis, versie 0.2.0

### Opgeleverd

De nieuwe repository bevat de Android-gamebasis met verhaal, dagelijkse quests, uitgebreide uitrusting en roguelike runs. Bestaande Leonidas-prototypecode is als vertrekpunt gebruikt en uitgebreid; het app-ID van V3 is `com.leonidas.idlerpgv3`.

Content staat in `src/content/`; modules en balansregels in `src/config.ts`. Een nieuw gebied toevoegen maakt automatisch een wereldkaart-entry en hoofdquest aan. Zie [EXTENDING.md](docs/EXTENDING.md).

### Cloudvalidatie

- TypeScript strict-controle geslaagd.
- 18 gameplaytests geslaagd, inclusief combat, armor, quests, savevalidatie, offline-cap, alle vier classes tegen de eerste baas, uitbreiden met een gebied en uitgeschakelde modules.
- Playwright/Chromium op 390 × 844 en 320 × 740: classkeuze, schermen, zestien gearslots, save/reload, offline claim, zegenkeuze, equip/unequip, verhaalclaim, alle drie daily claims, shop en gebieden wisselen.
- Geen JavaScript-runtimefouten of horizontale overflow in die browsercontroles.

### Gepubliceerde APK — gecontroleerd

- Standalone Android release-variant zowel lokaal in de cloud als via GitHub Actions gebouwd. Beide builds geslaagd.
- Versie `0.2.0`, versionCode `1`, package `com.leonidas.idlerpgv3`.
- Minimaal Android 7.0 (API 24), target API 36; ARM64 en x86_64.
- Ingebouwde Hermes-gamebundle aanwezig (1.356.136 bytes), zonder ontwikkelserver te starten.
- APK Signature Scheme v2 geverifieerd; testsignatuur.
- APK-grootte: 45.555.019 bytes (ongeveer 43,4 MiB).
- SHA-256: `c3e8c491e194b0a1a478e4105f366053d8e6cea69e55b6f17ca64aadac66831b`.
- Download APK en bijbehorende checksum bij [release v0.2.0](https://github.com/henkdepotvis0180/idleRPGLeonidasv3/releases/tag/v0.2.0).

De gepubliceerde APK is teruggedownload van GitHub. De SHA-256-checksum, v2-handtekening, app-ID, minimale Android-versie, architecturen en ingebouwde gamebundle zijn opnieuw gecontroleerd.

- [Geslaagde checks en Android-build](https://github.com/henkdepotvis0180/idleRPGLeonidasv3/actions/runs/38483805511).
- [Geslaagde releasepublicatie](https://github.com/henkdepotvis0180/idleRPGLeonidasv3/actions/runs/38483837240).
- Geteste releasecommit: `dc0ad51dc3097318ab113cda6b4c9909e206a9fc`.

Er is geen fysiek Android-toestel of Android-emulator gebruikt. De workflow `Publish Android alpha` publiceert een geslaagde Android-build met de bijbehorende checksum via de ingebouwde GitHub Actions-token.

### Vervolg

1. APK op een echte telefoon spelen en balans/bediening beoordelen.
2. Eigen heldensprites, audio en classvaardigheden toevoegen.
3. Nieuwe gebieden, bazen en loot uitbreiden via contentbestanden.
4. Voor distributie een vaste releasesleutel, savemigraties en eventueel cloudsave toevoegen.
