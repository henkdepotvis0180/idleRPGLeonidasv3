import test from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  stats,
  tick,
  castAbility,
  decodeSave,
  changeZone,
  chooseRace,
  chooseFaction,
  hireCompanion,
  selectCompanion,
  activeCompanion,
  setTactics,
  bossWarning,
  explore,
  moveHero,
  navigateTo,
  walkWorld,
  regionNodes,
  interactSite,
  enemyMax,
  buy,
  equip,
  setCamera,
  abandonRun,
} from "../src/engine.ts";
import {
  RACES,
  FACTIONS,
  COMPANIONS,
  ZONES,
  CATALOG,
  forgeItem,
  SLOTS,
  RARITIES,
  generateRegion,
} from "../src/content.ts";
import { soundProfile } from "../src/audio/soundProfile.ts";

test("six races and two independent factions preserve all class and permanent progress", () => {
  let s = createState("necromancer");
  s.gold = 250;
  s.level = 4;
  for (const r of RACES)
    for (const f of FACTIONS) {
      const n = chooseFaction(chooseRace(s, r.id), f.id);
      assert.equal(n.race, r.id);
      assert.equal(n.faction, f.id);
      assert.equal(n.classId, s.classId);
      assert.equal(n.gold, 250);
      assert.equal(n.level, 4);
    }
  assert.equal(RACES.length, 6);
  assert.equal(FACTIONS.length, 2);
});
test("companion hiring enforces gold, level, uniqueness and ownership; no real currency is involved", () => {
  let s = createState();
  assert.equal(hireCompanion(s, "moss"), s);
  s.gold = 2000;
  assert.equal(hireCompanion(s, "rime"), s);
  assert.equal(selectCompanion(s, "rime"), s);
  s = hireCompanion(s, "moss");
  assert.equal(s.gold, 1820);
  assert.deepEqual(s.companions.owned, ["moss"]);
  assert.equal(activeCompanion(s)?.name, "Mossfang");
  assert.equal(hireCompanion(s, "moss"), s);
  assert.equal(activeCompanion(selectCompanion(s, null)), undefined);
});
test("companion damage, defence and timed healing work without adding a second combat tick", () => {
  let base = createState();
  base.gold = 1000;
  base.enemyHp = 1000;
  const n = tick(base, 1000, 1),
    withWolf = tick(hireCompanion(base, "moss"), 1000, 1);
  assert.equal(n.enemyHp - withWolf.enemyHp, 2);
  assert.ok(withWolf.hp >= n.hp);
  base.level = 3;
  base = hireCompanion(base, "lumen");
  base.hp = 30;
  base.combat.turn = 3;
  const healed = tick(base, 1000, 1);
  assert.ok(healed.floats.some((f) => f.kind === "heal" && f.amount === 4));
  assert.equal(healed.combat.turn, 4);
});
test("guard and assault have explicit damage/defence tradeoffs and do not modify permanent item stats", () => {
  const s = createState();
  s.enemyHp = 1000;
  const normal = tick(s, 1000, 1),
    guard = tick(setTactics(s, 0, "guard"), 1000, 1),
    assault = tick(setTactics(s, 0, "assault"), 1000, 1);
  assert.ok(guard.enemyHp > normal.enemyHp);
  assert.ok(guard.hp > normal.hp);
  assert.ok(assault.enemyHp < normal.enemyHp);
  assert.ok(assault.hp < normal.hp);
  assert.equal(stats(guard).attack, stats(s).attack);
});
test("boss telegraphs count down and a correct flank reduces the special hit", () => {
  let s = createState();
  s.level = 12;
  s = changeZone(s, 3);
  s.wave = 10;
  s.enemyHp = enemyMax(s);
  s.combat.turn = 2;
  assert.equal(bossWarning(s)?.remaining, 2);
  s.combat.turn = 3;
  const standing = tick(s, 1000, 1),
    dodging = tick(setTactics(s, 1), 1000, 1);
  assert.ok(dodging.hp > standing.hp);
  assert.ok(dodging.floats.some((f) => f.kind === "evade"));
  assert.ok(standing.log.includes("hits your lane"));
});
test("the original endgame includes a plague colossus, bound frost dragon and time-bound sovereign", () => {
  assert.equal(ZONES.length, 8);
  assert.equal(ZONES[5].boss.art, "golem");
  assert.equal(ZONES[6].boss.art, "dragon");
  assert.equal(ZONES[7].boss.id, "paleregent");
  for (const z of ZONES) {
    assert.equal(z.enemies.length, 3);
    assert.ok(z.boss.hp > z.enemies[0].hp);
  }
});
test("seeded sites are reproducible, change between runs and contain reachable camps, cache and boss", () => {
  const a = generateRegion(0, 1, 1);
  assert.deepEqual(a, generateRegion(0, 1, 1));
  assert.notDeepEqual(a, generateRegion(0, 2, 1));
  assert.notDeepEqual(a, generateRegion(1, 1, 4));
  assert.equal(new Set(a.map((n) => n.id)).size, a.length);
  assert.ok(a.every((n) => Math.abs(n.x) <= 9 && Math.abs(n.z) <= 9));
  for (const kind of ["camp", "cache", "elite", "enemy", "boss"])
    assert.ok(a.some((n) => n.kind === kind));
});
test("exploration stops combat; bounded movement and path following arrive without teleporting", () => {
  let s = explore(createState());
  const before = s.enemyHp;
  s = tick(s, 1000, 1);
  assert.equal(s.enemyHp, before);
  assert.equal(s.kills, 0);
  assert.equal(castAbility(s, "shield-bash"), s);
  for (let i = 0; i < 100; i++) s = moveHero(s, 10, -10);
  assert.ok(Math.abs(s.world.x) <= 9 && Math.abs(s.world.z) <= 9);
  const node = regionNodes(s).find((n) => n.id === "site-0")!;
  s = navigateTo(s, node.id);
  const initialDistance = Math.hypot(node.x - s.world.x, node.z - s.world.z);
  let n = walkWorld(s);
  assert.ok(Math.hypot(n.world.x - s.world.x, n.world.z - s.world.z) <= 0.421);
  assert.ok(initialDistance > 1);
  for (let i = 0; i < 150; i++) n = walkWorld(n);
  assert.ok(Math.hypot(node.x - n.world.x, node.z - n.world.z) < 0.3);
  assert.equal(n.world.destination, null);
});
test("sites enforce proximity, level, run gates and cache rewards can only be collected once per run", () => {
  let s = explore(createState());
  s.hp = 1;
  s = interactSite(s);
  assert.equal(s.hp, stats(s).hp);
  const cache = regionNodes(s).find((n) => n.kind === "cache")!;
  s.world = { ...s.world, x: cache.x, z: cache.z };
  s = interactSite(s);
  const gold = s.gold;
  s = interactSite(s);
  assert.equal(s.gold, gold);
  assert.deepEqual(s.world.visited, [cache.id]);
  const boss = regionNodes(s).find((n) => n.kind === "boss")!;
  s.world = { ...s.world, x: boss.x, z: boss.z };
  assert.equal(interactSite(s).world.mode, "explore");
  s.wave = 10;
  s = interactSite(s);
  assert.equal(s.world.mode, "battle");
  assert.equal(s.enemyHp, ZONES[0].boss.hp);
});
test("a chosen encounter returns to exploration, marks its site and preserves blessings/progression", () => {
  let s = explore(createState());
  const node = regionNodes(s).find((n) => n.kind === "enemy")!;
  s.world = { ...s.world, x: node.x, z: node.z };
  s = interactSite(s);
  assert.equal(s.world.mode, "battle");
  s.enemyHp = 1;
  s = tick(s, 1000, 1);
  assert.equal(s.world.mode, "explore");
  assert.ok(s.world.visited.includes(node.id));
  assert.equal(s.wave, 2);
  assert.equal(s.kills, 1);
});
test("elite sites have actual stronger enemies and rewards", () => {
  let s = createState();
  s.level = 2;
  s = explore(s);
  const site = regionNodes(s).find((n) => n.kind === "elite")!;
  s.world = { ...s.world, x: site.x, z: site.z };
  s = interactSite(s);
  assert.equal(s.world.elite, true);
  assert.ok(enemyMax(s) > ZONES[0].enemies[site.enemyIndex].hp);
  s.enemyHp = 1;
  s = tick(s, 1000, 1);
  assert.equal(s.gold, 12);
});
test("regional items have material, lore, level, visual design and five distinct rarity strengths", () => {
  assert.equal(CATALOG.length, 128);
  assert.equal(new Set(CATALOG.map((i) => i.id)).size, 128);
  for (let z = 0; z < ZONES.length; z++)
    for (const slot of SLOTS) {
      const i = forgeItem(z, slot, "rare", 1, "sword");
      assert.equal(i.requiredLevel, ZONES[z].level);
      assert.ok(i.material && i.description && i.origin && i.tint);
    }
  const attack = Object.keys(RARITIES).map(
    (r) =>
      forgeItem(7, "weapon", r as keyof typeof RARITIES, 1, "sword").attack,
  );
  assert.ok(attack.every((a, i) => !i || a > attack[i - 1]));
});
test("regional vendor and equipment level requirements are enforced by the engine", () => {
  let s = createState();
  s.gold = 10000;
  const high = CATALOG.find((i) => i.requiredLevel === 28)!;
  assert.equal(buy(s, high.id), s);
  s.inventory = [{ ...high, id: "fixture" }];
  assert.equal(equip(s, "fixture"), s);
  s.level = 28;
  assert.ok(buy(s, high.id).inventory.length > s.inventory.length);
  assert.ok(equip(s, "fixture").gear[high.slot]);
});
test("floating combat events include simultaneous incoming/outgoing, healing and absorption with bounded history", () => {
  let s = createState();
  s.enemyHp = 10000;
  s = castAbility(s, "iron-wall");
  s = tick(s, 1000, 1);
  assert.ok(s.floats.some((f) => f.target === "enemy"));
  assert.ok(s.floats.some((f) => f.kind === "block"));
  s = createState();
  s.enemyHp = 10000;
  for (let i = 0; i < 8; i++) s = tick(s, 1000 + i * 1000, 1);
  assert.ok(s.floats.some((f) => f.target === "hero" && f.kind === "damage"));
  assert.ok(s.floats.some((f) => f.target === "enemy"));
  assert.ok(s.floats.length <= 8);
  assert.equal(new Set(s.floats.map((f) => f.id)).size, s.floats.length);
});
test("spell schools and weapon types select fitting separate sounds, with stable ability variations", () => {
  let s = createState("mage");
  s.enemyHp = 10000;
  const fire = soundProfile(castAbility(s, "ember-lance")),
    frost = soundProfile(castAbility(s, "frost-nova"));
  assert.equal(fire.key, "fire");
  assert.equal(frost.key, "frost");
  for (const [id, key] of [
    ["ranger", "bow"],
    ["berserker", "heavy"],
    ["monk", "fists"],
  ] as const) {
    const n = tick(createState(id), 1000, 1);
    assert.equal(soundProfile(n).key, key);
  }
});
test("0.3 saves upgrade to 0.4 with all permanent progress, gear and appearance retained", () => {
  const now = Date.now();
  let s: any = createState("ranger", now);
  s.gold = 1000;
  s = buy(s, "shop-sword");
  s = equip(s, s.inventory[0].id);
  s.version = 3;
  s.bosses = ["woods"];
  s.appearance.hair = 3;
  for (const k of [
    "world",
    "race",
    "faction",
    "companions",
    "tactics",
    "floats",
    "floatSerial",
  ])
    delete s[k];
  delete s.combat.turn;
  const n = decodeSave(JSON.stringify(s), now);
  assert.equal(n.version, 4);
  assert.equal(n.gold, s.gold);
  assert.deepEqual(n.gear, s.gear);
  assert.deepEqual(n.bosses, s.bosses);
  assert.equal(n.appearance.hair, 3);
  assert.equal(n.race, "human");
  assert.equal(n.world.camera, "overview");
});
test("new world, race, companion and camera choices survive save/reload and run resets", () => {
  const now = Date.now();
  let s = createState("bard", now);
  s.gold = 1000;
  s = hireCompanion(s, "moss");
  s = chooseRace(s, "elf");
  s = chooseFaction(s, "pact");
  s = setCamera(s, "third");
  s = explore(s);
  s = moveHero(s, 1, 0);
  const n = decodeSave(JSON.stringify(s), now);
  assert.deepEqual(n.world, s.world);
  assert.deepEqual(n.companions, s.companions);
  assert.equal(n.race, "elf");
  assert.equal(n.faction, "pact");
  const fresh = abandonRun(n);
  assert.equal(fresh.world.camera, "third");
  assert.equal(fresh.companions.active, "moss");
  assert.equal(fresh.race, "elf");
});
test("malformed world coordinates, faction, ownership and floats cannot enter runtime", () => {
  const s = createState();
  for (const patch of [
    { race: "bad" },
    { faction: "bad" },
    { world: { ...s.world, x: Infinity } },
    { world: { ...s.world, x: 1000 } },
    { companions: { owned: [], active: "rime" } },
    { tactics: { lane: 10, stance: "guard" } },
    { floats: [{ id: -1 }] },
  ])
    assert.equal(
      decodeSave(JSON.stringify({ ...s, gold: 999, ...patch })).gold,
      0,
    );
});

test("all fourteen classes can complete every region at its required level with regional gear and tactical play", async () => {
  const { CLASSES } = await import("../src/content.ts");
  const { chooseBlessing } = await import("../src/engine.ts");
  for (let zone = 0; zone < ZONES.length; zone++)
    for (const hero of CLASSES) {
      let s = createState(hero.id);
      s.level = ZONES[zone].level;
      s = changeZone(s, zone);
      s.settings.autoCast = true;
      s.gear = Object.fromEntries(
        CATALOG.filter((i) => i.origin === ZONES[zone].name).map((i) => [
          i.slot,
          { ...i, weaponStyle: i.slot === "weapon" ? hero.weapon : undefined },
        ]),
      );
      s.hp = stats(s).hp;
      let turns = 0;
      while (!s.bosses.includes(ZONES[zone].id) && turns++ < 400) {
        if (s.run.choicePending) s = chooseBlessing(s, "sun");
        const warning = bossWarning(s);
        if (warning) s = setTactics(s, warning.lane === 0 ? 1 : 0, "guard");
        s = tick(s, turns * 1000, 1);
      }
      assert.ok(
        s.bosses.includes(ZONES[zone].id),
        `${hero.archetype} must be able to finish ${ZONES[zone].name}`,
      );
    }
});

test("critical chance and regeneration are capped and produce actual critical/healing events", () => {
  let s = createState();
  s.gear.trinket = {
    ...forgeItem(0, "trinket", "epic", 1),
    critical: 100,
    vitality: 100,
  };
  s.hp = 20;
  s.enemyHp = 10000;
  assert.equal(stats(s).critical, 0.2);
  assert.equal(stats(s).vitality, 5);
  const n = tick(s, 1000, 0.1);
  assert.ok(n.floats.some((f) => f.kind === "critical"));
  assert.ok(n.floats.some((f) => f.kind === "heal" && f.amount === 5));
  assert.equal(s.hp, 20);
});
