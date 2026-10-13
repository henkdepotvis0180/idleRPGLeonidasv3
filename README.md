# Leonidas V3 — idle roguelike RPG voor Android

Een speelbare, Nederlandstalige Android-gamebasis met automatische gevechten, loot en korte roguelike expedities. Gebouwd met React Native, Expo en TypeScript. Eigen wereld en verhaal, met inspiratie uit het idle RPG-genre en de vele uitrustingsslots van klassieke MMO's.

## APK downloaden

Download **idleRPGLeonidasv3-0.2.0.apk** via [GitHub Releases](https://github.com/henkdepotvis0180/idleRPGLeonidasv3/releases/tag/v0.2.0). Open het bestand op je Android-telefoon en sta installatie vanuit je browser/bestandsbeheer toe wanneer Android daarom vraagt. Android 7.0+ en een ARM64-telefoon zijn vereist. De APK bevat de game en werkt zonder Expo Go, ontwikkelserver of account.

Dit is een **test-alpha** met een testsignatuur. De lokale voortgang staat alleen op je toestel; verwijderen van de app wist je save. Voor betrouwbare toekomstige updates en Play Store-distributie is een vaste, privé beheerde releasesleutel nodig. Een nieuw gebouwde test-APK kan een andere sleutel hebben.

<img src="docs/preview.png" alt="Leonidas V3 avontuurscherm — cloudbrowserpreview" width="320">

## Wat kun je spelen?

- Vier classes: Bastion, Sterrenwever, Schemermes en Klokkenbinder, met verschillende beginstats.
- Drie gebieden met elk drie soorten vijanden, een eindbaas en een verhaalhoofdstuk.
- Automatisch aanvallen; een bewegend woud, aanvalslunges, hitreacties en zwevende schadecijfers.
- Runs van tien encounters, met een tijdelijke bonuskeuze na encounter 3, 6 en 9. Eindbaas verslagen of zelf verslagen? Tijdelijke zegens vervallen; gear, goud en level blijven.
- Zestien gearslots: wapen, offhand, helm, halsketting, schouders, mantel, borst, polsen, handschoenen, riem, broek, laarzen, twee ringen en twee trinkets.
- HP-, aanvals- en armorbonussen; armor vermindert inkomende schade tot minimaal één schade per klap.
- Common, rare en epic loot; gegarandeerde eindbaasloot als je bag ruimte heeft.
- Drie dagelijkse quests: 20 vijanden, één baas en drie lootstukken. Reset om 00:00 UTC (02:00 Nederlandse zomertijd / 01:00 wintertijd).
- Shop, gear wisselen en verkopen; maximaal vier bags met twaalf plekken per bag.
- Lokale opslag en offline XP/goud, maximaal acht uur per afwezigheid, expliciet te claimen. Offline beloningen tellen niet voor kills, loot of bazen.

Het is een eerste basis: classes hebben nog geen eigen skills, er is geen multiplayer, cloudsave, geluid, talentboom of Play Store-publicatie. Klok en saves zijn lokaal en niet tegen manipulatie beveiligd.

## Ontwikkelen

Node.js 24, JDK 21 en Android SDK met de door Gradle gevraagde platform/build-tools/NDK-versies.

```sh
npm ci
npm run typecheck
npm test
npm start
```

Zelf een standalone test-APK bouwen:

```sh
# Configureer JAVA_HOME en ANDROID_HOME voor jouw computer.
npm run apk
```

Het script genereert de native Android-map en bouwt voor ARM64-telefoons en x86_64-emulators. Output: `artifacts/idleRPGLeonidasv3-0.2.0.apk`, inclusief SHA-256-controlebestand. `android/`, caches, sleutels en buildoutputs staan buiten Git. APK's worden als releasebestand en als Actions-artifact gedeeld.

Op GitHub draait **Android test APK** na een push naar `main` of via **Actions → Run workflow**. De workflow controleert TypeScript, gameplay en browserbediening voordat hij de APK bouwt. Met **Publish Android alpha → Run workflow** kun je daarna de run-ID van een geslaagde APK-build opgeven om die APK met checksum en changelog als prerelease te publiceren. Deze publicatiestap wacht op een lopende build en gebruikt de exacte geteste commit.

Browsercontroles uitvoeren (web is alleen een testhulpmiddel; Android is het distributiedoel):

```sh
npx playwright install chromium
npm run test:ui
# Of gebruik een al geïnstalleerde Chromium via CHROMIUM_PATH.
```

## Eenvoudig uitbreiden

| Bestand | Wat pas je aan? |
| --- | --- |
| `src/config.ts` | Shop, dailies, offline rewards en roguelike-module aan/uit; balansregels |
| `src/content/zones.ts` | Levels, vijanden, bazen, beloningen en verhaal |
| `src/content/gear.ts` | Gearslots en shopitems |
| `src/content/quests.ts` | Daily quests en tijdelijke zegens |
| `src/content.ts` | Classes en gezamenlijke contentexports |
| `src/engine.ts` | Gameplayregels, savevalidatie en pure statetransities |
| `src/components/BattleScene.tsx` | Visuele gevechtsscène en animaties |
| `App.tsx` | Schermen, bediening, opslag en applevenscyclus |

Zie [uitbreidhandleiding](docs/EXTENDING.md), [changelog](CHANGELOG.md) en [updatelog](UPDATELOG.md). Bronvermeldingen voor iconen staan in [assets/ATTRIBUTION.md](assets/ATTRIBUTION.md).
