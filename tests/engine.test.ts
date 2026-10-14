import test from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  tick,
  stats,
  equip,
  unequip,
  buy,
  buyBag,
  claimDaily,
  claimMain,
  resume,
  claimOffline,
  decodeSave,
  changeZone,
  enemyMax,
} from "../src/engine.ts";
test("combat rewards a kill, advances waves, and records boss completion", () => {
  let s = createState();
  s.enemyHp = 1;
  s.wave = 10;
  s = tick(s, 1000, 1);
  assert.equal(s.kills, 1);
  assert.equal(s.wave, 1);
  assert.deepEqual(s.bosses, ["woods"]);
  assert.equal(s.gold, 16);
  assert.equal(s.daily.kills, 1);
});
test("equipping swaps gear without losing items and changes stats", () => {
  let s = createState();
  s.gold = 500;
  s = buy(s, "shop-sword", 1);
  const id = s.inventory[0].id;
  s = equip(s, id);
  assert.equal(stats(s).attack, 17);
  assert.equal(s.inventory.length, 0);
  s = buy(s, "shop-sword", 2);
  s = equip(s, s.inventory[0].id);
  assert.equal(s.inventory.length, 1);
  assert.equal(stats(s).attack, 17);
});
test("shop enforces affordability and bag capacity", () => {
  let s = createState();
  assert.equal(buy(s, "shop-sword"), s);
  s.gold = 2000;
  for (let i = 0; i < 12; i++) s = buy(s, "shop-helm", i);
  assert.equal(s.inventory.length, 12);
  assert.equal(buy(s, "shop-helm"), s);
  s = buyBag(s);
  assert.equal(s.bags, 2);
});
test("daily and main rewards can only be claimed once", () => {
  let s = createState();
  assert.equal(claimDaily(s), s);
  s.daily.kills = 20;
  s = claimDaily(s);
  const g = s.gold;
  s = claimDaily(s);
  assert.equal(s.gold, g);
  s.bosses = ["woods"];
  s = claimMain(s);
  assert.equal(s.mainClaimed, 1);
  assert.equal(claimMain(s), s);
});
test("offline rewards cap at eight hours, can only be claimed once, and grant no kills", () => {
  let s = createState("mage", 0);
  s = resume(s, 24 * 3600000);
  assert.equal(s.offline!.seconds, 8 * 3600);
  const xp = s.offline!.xp;
  s = claimOffline(s);
  assert.ok(s.level > 1);
  assert.ok(xp > 0);
  assert.equal(s.kills, 0);
  assert.equal(s.offline, null);
  assert.equal(claimOffline(s), s);
  assert.equal(resume(s, 24 * 3600000).offline, null);
});
test("future timestamps give no reward; daily rollover and corrupt saves recover", () => {
  let s = createState("warrior", 100000);
  assert.equal(resume(s, 0).offline, null);
  s.daily.claimed = ["kills"];
  s = resume(s, 2 * 86400000);
  assert.deepEqual(s.daily.claimed, []);
  assert.equal(decodeSave("{broken", 1).level, 1);
  assert.equal(decodeSave('{"version":99}', 1).level, 1);
});
test("zones enforce level requirements", () => {
  let s = createState();
  assert.equal(changeZone(s, 2), s);
  s.level = 8;
  s = changeZone(s, 2);
  assert.equal(s.zone, 2);
  assert.equal(s.enemyHp, enemyMax(s));
});
test("valid JSON with damaged numerical or item fields cannot poison the engine", () => {
  const s = createState();
  const raw = JSON.stringify({ ...s, gold: "not a number" });
  assert.equal(decodeSave(raw).gold, 0);
  assert.equal(
    decodeSave(JSON.stringify({ ...s, inventory: [{ slot: "hat" }] })).inventory
      .length,
    0,
  );
});

test("unequip restores an item to the bag and respects full bags", () => {
  let s = createState();
  s.gold = 2000;
  s = buy(s, "shop-sword", 1);
  s = equip(s, s.inventory[0].id);
  s = unequip(s, "weapon");
  assert.equal(s.gear.weapon, undefined);
  assert.equal(s.inventory.length, 1);
  s = equip(s, s.inventory[0].id);
  for (let i = 0; i < 12; i++) s = buy(s, "shop-helm", i);
  assert.equal(unequip(s, "weapon"), s);
});

test("rapid repeated purchases keep distinct identities", () => {
  let s = createState();
  s.gold = 500;
  s = buy(s, "shop-sword", 1000);
  s = buy(s, "shop-sword", 1000);
  assert.notEqual(s.inventory[0].id, s.inventory[1].id);
  s = equip(s, s.inventory[0].id);
  assert.equal(s.inventory.length, 1);
});

test("blessings pause combat, stack temporary stats, and reset after a boss", async () => {
  const { chooseBlessing } = await import("../src/engine.ts");
  let s = createState();
  s.wave = 3;
  s.enemyHp = 1;
  s = tick(s, Date.now(), 1);
  assert.equal(s.wave, 4);
  assert.equal(s.run.choicePending, true);
  const paused = tick(s, Date.now(), 1);
  assert.equal(paused.enemyHp, s.enemyHp);
  assert.equal(paused.kills, s.kills);
  s = chooseBlessing(s, "sun");
  assert.equal(stats(s).attack, 16);
  assert.equal(chooseBlessing(s, "sun"), s);
  s.wave = 10;
  s.enemyHp = 1;
  s = tick(s, Date.now(), 1);
  assert.equal(s.run.number, 2);
  assert.deepEqual(s.run.blessings, []);
  assert.equal(stats(s).attack, 12);
  assert.equal(s.inventory.length, 1); // guaranteed boss item
});
test("death and retreat reset temporary bonuses but preserve permanent progress", async () => {
  const { abandonRun } = await import("../src/engine.ts");
  let s = createState();
  s.gold = 200;
  s = buy(s, "shop-helm");
  s = equip(s, s.inventory[0].id);
  s.run.blessings = ["sun"];
  s.hp = 1;
  s.enemyHp = 1000;
  s = tick(s, Date.now(), 1);
  assert.equal(s.wave, 1);
  assert.equal(s.gold, 100);
  assert.ok(s.gear.helmet);
  assert.equal(s.run.blessings.length, 0);
  const n = abandonRun(s);
  assert.equal(n.run.number, s.run.number + 1);
  assert.deepEqual(n.gear, s.gear);
});
test("armor has diminishing returns and a 60% mitigation cap; replacing HP gear clamps health", () => {
  let s = createState();
  s.gold = 1000;
  s = buy(s, "shop-helm");
  s = equip(s, s.inventory[0].id);
  s.hp = stats(s).hp;
  const n = tick(s, Date.now(), 1);
  assert.equal(s.hp - n.hp, 5);
  s.gear.helmet = { ...s.gear.helmet!, armor: 100 };
  assert.equal(s.hp - tick(s, Date.now(), 1).hp, 2);
  s.inventory = [{ ...s.gear.helmet!, id: "replacement", hp: 0 }];
  s = equip(s, "replacement");
  assert.equal(s.hp, stats(s).hp);
});
test("each daily has an independent claim and stale rewards cannot be claimed after midnight", () => {
  const now = Date.UTC(2026, 9, 14, 12);
  let s = createState("warrior", now);
  s.daily.kills = 20;
  s.daily.bosses = 1;
  s.daily.loot = 3;
  for (const id of ["kills", "bosses", "loot"] as const)
    s = claimDaily(s, id, now);
  assert.equal(s.gold, 300);
  assert.equal(s.daily.claimed.length, 3);
  assert.equal(claimDaily(s, "kills", now), s);
  const tomorrow = claimDaily(
    { ...s, daily: { ...s.daily, claimed: [] } },
    "kills",
    now + 86400000,
  );
  assert.equal(tomorrow.gold, 300);
  assert.equal(tomorrow.daily.kills, 0);
});
test("a pending blessing survives save/load and duplicate item identities are rejected", () => {
  const now = Date.now();
  let s = createState("mage", now);
  s.run.choicePending = true;
  s.run.blessings = ["stone"];
  const loaded = decodeSave(JSON.stringify(s), now);
  assert.equal(loaded.run.choicePending, true);
  assert.deepEqual(loaded.run.blessings, ["stone"]);
  s.gold = 1000;
  s = buy(s, "shop-helm");
  s.inventory.push(s.inventory[0]);
  assert.equal(decodeSave(JSON.stringify(s), now).inventory.length, 0);
});
test("all classes can complete the first run with player blessing choices", async () => {
  const { CLASSES } = await import("../src/content.ts");
  const { chooseBlessing } = await import("../src/engine.ts");
  for (const c of CLASSES) {
    let s = createState(c.id);
    let steps = 0;
    while (!s.bosses.includes("woods") && steps++ < 300) {
      if (s.run.choicePending) s = chooseBlessing(s, "sun");
      s = tick(s, Date.now(), 1);
    }
    assert.ok(
      s.bosses.includes("woods"),
      `${c.name} must be able to finish first zone`,
    );
  }
});
test("additional zones use stable boss IDs and need no engine code changes", async () => {
  const { ZONES } = await import("../src/content.ts");
  ZONES.push({ ...ZONES[0], id: "test-zone", name: "Test", level: 1 });
  try {
    let s = changeZone(createState(), ZONES.length - 1);
    s.wave = 10;
    s.enemyHp = 1;
    s = tick(s, Date.now(), 1);
    assert.deepEqual(s.bosses, ["test-zone"]);
  } finally {
    ZONES.pop();
  }
});

test("optional gameplay modules can be disabled independently", async () => {
  const { MODULES } = await import("../src/config.ts");
  const enabled = { ...MODULES };
  try {
    Object.assign(MODULES, {
      shop: false,
      dailyQuests: false,
      offlineRewards: false,
      roguelike: false,
    });
    let s = createState("warrior", 0);
    s.gold = 1000;
    s.daily.kills = 20;
    assert.equal(buy(s, "shop-sword"), s);
    assert.equal(claimDaily(s, "kills", 0), s);
    assert.equal(resume(s, 3600000).offline, null);
    s.wave = 3;
    s.enemyHp = 1;
    s = tick(s, 0, 1);
    assert.equal(s.run.choicePending, false);
    const attack = stats(s).attack;
    s.run.blessings = ["sun"];
    assert.equal(stats(s).attack, attack);
  } finally {
    Object.assign(MODULES, enabled);
  }
});

test("every one of 14 classes has two usable, class-specific abilities", async () => {
  const { CLASSES } = await import("../src/content.ts");
  const { castAbility } = await import("../src/engine.ts");
  assert.equal(CLASSES.length, 14);
  const ids = new Set<string>();
  for (const c of CLASSES) {
    assert.equal(c.abilities.length, 2);
    for (const a of c.abilities) {
      assert.ok(!ids.has(a.id));
      ids.add(a.id);
      let s = createState(c.id);
      s.hp = Math.floor(s.hp / 2);
      s.enemyHp = 1000;
      const n = castAbility(s, a.id, 1000, 1);
      assert.equal(n.combat.cooldowns[a.id], a.cooldown);
      assert.equal(n.combat.event, s.combat.event + 1);
      assert.equal(castAbility(n, a.id), n);
      assert.ok(n.enemyHp < s.enemyHp || n.hp > s.hp || n.combat.shield > 0);
      assert.equal(s.enemyHp, 1000);
    }
  }
  assert.equal(ids.size, 28);
});
test("spell kills award loot and quest progress once, including bosses", async () => {
  const { castAbility } = await import("../src/engine.ts");
  let s = createState("mage");
  s.wave = 10;
  s.enemyHp = 1;
  const n = castAbility(s, "ember-lance", 1000, 0.7);
  assert.equal(n.kills, 1);
  assert.equal(n.daily.bosses, 1);
  assert.equal(n.wave, 1);
  assert.equal(n.lastBoss!.gold, 16);
  assert.equal(n.inventory[0].rarity, "uncommon");
  assert.equal(castAbility(n, "not-a-real-spell"), n);
  assert.ok(n.hp > 0);
});
test("damage over time belongs to its enemy and does not leak into the next encounter", async () => {
  const { castAbility } = await import("../src/engine.ts");
  let s = createState("rogue");
  s.enemyHp = 1000;
  s = castAbility(s, "venom-edge", 1000, 1);
  const before = s.enemyHp;
  let n = tick(s, 2000, 1);
  assert.ok(before - n.enemyHp > stats(s).attack);
  assert.equal(n.combat.dotTurns, 3);
  n.enemyHp = 1;
  n = tick(n, 3000, 1);
  assert.equal(n.combat.dotTurns, 0);
  assert.equal(n.combat.dot, 0);
});
test("healing is capped, barriers absorb damage and interrupt prevents one retaliation", async () => {
  const { castAbility } = await import("../src/engine.ts");
  let s = createState("cleric");
  assert.equal(castAbility(s, "renewal").hp, stats(s).hp);
  s = createState("warrior");
  s.enemyHp = 1000;
  s = castAbility(s, "iron-wall");
  const hp = s.hp;
  s = tick(s, Date.now(), 1);
  assert.equal(s.hp, hp);
  assert.ok(s.combat.shield > 0);
  s = createState("warrior");
  s.enemyHp = 1000;
  s = castAbility(s, "shield-bash");
  const old = s.hp;
  s = tick(s, Date.now(), 1);
  assert.equal(s.hp, old);
  s = tick(s, Date.now(), 1);
  assert.ok(s.hp < old);
});
test("shapeshifter forms expire, survive save/load, and clear after a new run", async () => {
  const { castAbility, abandonRun } = await import("../src/engine.ts");
  let s = createState("shapeshifter");
  s.enemyHp = 10000;
  s = castAbility(s, "bear-form");
  assert.equal(s.combat.form, "bear");
  assert.equal(decodeSave(JSON.stringify(s), s.lastSeen).combat.form, "bear");
  for (let i = 0; i < 6; i++) s = tick(s, Date.now(), 1);
  assert.equal(s.combat.form, "human");
  s = castAbility(s, "feral-pounce");
  assert.equal(s.combat.form, "wolf");
  assert.equal(abandonRun(s).combat.form, "human");
});
test("cooldowns and blessings prevent repeated casting; auto skills are optional", async () => {
  const { castAbility, setSetting } = await import("../src/engine.ts");
  let s = createState("mage");
  s.enemyHp = 1000;
  s = castAbility(s, "ember-lance");
  for (let i = 0; i < 8; i++) s = tick(s, Date.now(), 1);
  assert.equal(s.combat.cooldowns["ember-lance"], 0);
  assert.ok(castAbility(s, "ember-lance").enemyHp < s.enemyHp);
  s.run.choicePending = true;
  assert.equal(castAbility(s, "frost-nova"), s);
  s = createState("mage");
  s.enemyHp = 1000;
  const normal = tick(s, Date.now(), 1);
  const auto = tick(setSetting(s, "autoCast", true), Date.now(), 1);
  assert.ok(auto.enemyHp < normal.enemyHp);
});
test("0.2.0 saves migrate without losing class, quests, gear, currencies or progress", async () => {
  const now = Date.now();
  let s: any = createState("bard", now);
  s.gold = 480;
  s.level = 7;
  s.bosses = ["woods"];
  s.mainClaimed = 1;
  s = buy(s, "shop-helm");
  s = equip(s, s.inventory[0].id);
  s.daily.kills = 12;
  s.version = 2;
  delete s.appearance;
  delete s.settings;
  delete s.combat;
  delete s.lastBoss;
  s.gear.helmet.name = "Helm van de dageraad";
  const n = decodeSave(JSON.stringify(s), now);
  assert.equal(n.version, 3);
  assert.equal(n.classId, "bard");
  assert.equal(n.gold, 380);
  assert.equal(n.level, 7);
  assert.equal(n.mainClaimed, 1);
  assert.deepEqual(n.bosses, ["woods"]);
  assert.equal(n.daily.kills, 12);
  assert.equal(n.gear.helmet!.id, s.gear.helmet.id);
  assert.equal(n.gear.helmet!.name, "Dawnwatch Helm");
  assert.equal(n.appearance.style, 1);
});
test("appearance and class hall preserve permanent items and reset only run combat", async () => {
  const { customize, switchClass, castAbility } =
    await import("../src/engine.ts");
  let s = createState("warrior");
  s.gold = 1000;
  s = buy(s, "shop-sword");
  s = equip(s, s.inventory[0].id);
  s = customize(s, "hair", 3);
  s = castAbility(s, "iron-wall");
  const n = switchClass(s, "ranger");
  assert.equal(n.level, s.level);
  assert.equal(n.gold, s.gold);
  assert.equal(n.gear.weapon!.weaponStyle, "bow");
  assert.equal(n.appearance.hair, 3);
  assert.equal(n.combat.shield, 0);
  assert.equal(customize(n, "skin", 99), n);
  assert.equal(switchClass(n, "missing"), n);
});
test("rarity tiers have monotonic power and boss loot is not guaranteed epic", async () => {
  const { RARITIES, rollRarity } = await import("../src/content.ts");
  assert.equal(Object.keys(RARITIES).length, 5);
  assert.ok(RARITIES.legendary.multiplier > RARITIES.epic.multiplier);
  assert.equal(rollRarity(0.9, true), "uncommon");
  assert.equal(rollRarity(0.3, true), "rare");
  assert.equal(rollRarity(0.03, true), "epic");
  assert.equal(rollRarity(0.001, true), "legendary");
});
test("malformed customization or combat saves cannot enter the runtime", () => {
  const s = createState();
  for (const patch of [
    { appearance: { ...s.appearance, skin: 99 } },
    { combat: { ...s.combat, cooldowns: { bad: -4 } } },
    { settings: { music: "yes" } },
    { lastBoss: { gold: -1 } },
  ])
    assert.equal(
      decodeSave(JSON.stringify({ ...s, gold: 999, ...patch })).gold,
      0,
    );
});
test("a four-turn barrier protects all four turns, then expires", async () => {
  const { castAbility } = await import("../src/engine.ts");
  let s = createState("warrior");
  s.enemyHp = 10000;
  s = castAbility(s, "iron-wall");
  const hp = s.hp;
  for (let i = 0; i < 4; i++) s = tick(s, Date.now(), 1);
  assert.equal(s.hp, hp);
  assert.equal(s.combat.shield, 0);
  s = tick(s, Date.now(), 1);
  assert.equal(s.hp, hp - 5);
});
