# Content en modules aanpassen

## Een nieuw gebied met eindbaas

Voeg een entry toe aan `ZONES` in `src/content/zones.ts`. De wereldkaart, levelvergrendeling, baasregistratie en hoofdquest worden automatisch toegevoegd.

```ts
{
  id: 'frost', // uniek en blijvend: opgeslagen baasvoortgang gebruikt deze ID
  name: 'De Bevroren Poort',
  subtitle: 'Hoofdstuk IV · Achter de klok',
  level: 12,
  enemies: [
    { id: 'frostwolf', name: 'IJswolf', art: 'wolf', hp: 350, attack: 25 },
    { id: 'frostghost', name: 'Bevroren ziel', art: 'ghost', hp: 400, attack: 22 },
  ],
  boss: { id: 'frostking', name: 'De IJskoning', art: 'boss', hp: 1800, attack: 48 },
  xp: 95,
  gold: 50,
  color: '#557d98',
  story: 'Onder de tweede klok slaapt een koninkrijk van ijs. Vind de sleutel achter de bevroren poort.',
}
```

`enemies` moet minstens één vijand bevatten. `art` kiest uit wolf, ghost en boss; voeg voor nieuwe illustraties een bron en licentie toe in `assets/ATTRIBUTION.md` en breid `BattleScene` uit. De vijand varieert per encounter en run. Bazen hebben eigen HP en aanval.

Voeg gebieden achteraan toe: saves gebruiken momenteel een index voor het huidige gebied en het geclaimde verhaalhoofdstuk. Herschikken/verwijderen vraagt een savemigratie. Baasoverwinningen gebruiken stabiele gebied-ID's, zonder limiet van 31 gebieden.

## Modules wisselen

Pas `MODULES` in `src/config.ts` aan en bouw opnieuw:

```ts
export const MODULES = {
  shop: false,
  dailyQuests: true,
  offlineRewards: true,
  roguelike: false,
} as const;
```

Deze switches gelden voor de UI én de engine. Met roguelike uit lopen gevechten door zonder keuzes en zonder tijdelijke bonusstats. Bestaande savegegevens blijven behouden. De hoofdquest en basiscombat zijn de kern; het wisselen van een compleet combatsysteem vraagt een eigen implementatie van de enginefuncties.

`RULES` bevat onder andere runlengte, rustpunten, baggrootte en offline-cap. Rustpunten moeten vóór de eindbaas liggen. Structurele wijzigingen aan slots, savevelden of bagcapaciteit kunnen bestaande saves ongeldig maken: verhoog dan de saveversie en voeg een expliciete migratie toe. Deze eerste V3-alpha gebruikt saveversie 2; oude Leonidas-apps hebben een ander app-ID en delen geen opslag.

## Items en armor

Een item heeft een unieke `id`, een `slot`, `attack`, `hp`, `armor`, `rarity` en `price`. `price` is in deze basis zowel de shopprijs als de verkoopwaarde. Alle classes mogen alle slots gebruiken. De twee ring- en trinketslots zijn afzonderlijke slots; de dropgenerator ondersteunt ze allemaal.

Shopitems staan in `SHOP`. Dropgeneratie staat in `tick` in `src/engine.ts`. Een volle bag voorkomt nieuwe loot; uitrusten wisselt gear zonder items te verliezen. Armor telt op en trekt af van iedere vijandelijke aanval, tot minimaal één schade.

## Quests en zegens

Elke zone krijgt automatisch een hoofdquest om de baas te verslaan, met een eenmalige beloning. Daily-definities in `src/content/quests.ts` gebruiken de bijgehouden tellers `kills`, `bosses` en `loot`. Een ander soort doel vraagt een nieuwe teller, updates in de engine en savevalidatie. Naam, doel en beloningen van bestaande dailytypen zijn direct instelbaar.

Een zegen in `BLESSINGS` bevat een stabiele ID en de statbonussen. Breid voor een nieuw type zegen het datumodel of de effectafhandeling uit. Zegens mogen meerdere keren in een run gekozen worden.

## Controleren en uitbrengen

1. `npm run typecheck` en `npm test`.
2. `npx playwright install chromium` en `npm run test:ui`.
3. Versie verhogen in `package.json`, `package-lock.json`, `app.json` en Android `versionCode` verhogen voor updates.
4. `npm run apk` en testen op een echte Android-telefoon.
5. `CHANGELOG.md` en `UPDATELOG.md` aanvullen; commit/push en APK met checksum toevoegen aan een GitHub-release.

Gebruik voor publieke distributie een vaste privé-releasesleutel via CI-secrets of EAS. Commit nooit sleutels. De huidige APK en workflow gebruiken uitsluitend een testsignatuur.
