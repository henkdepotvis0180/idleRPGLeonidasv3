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
  assert.equal(s.gold, 40);
  assert.equal(s.daily.kills, 1);
});
test("equipping swaps gear without losing items and changes stats", () => {
  let s = createState();
  s.gold = 500;
  s = buy(s, "shop-sword", 1);
  const id = s.inventory[0].id;
  s = equip(s, id);
  assert.equal(stats(s).attack, 20);
  assert.equal(s.inventory.length, 0);
  s = buy(s, "shop-sword", 2);
  s = equip(s, s.inventory[0].id);
  assert.equal(s.inventory.length, 1);
  assert.equal(stats(s).attack, 20);
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
  assert.equal(stats(s).attack, 18);
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
test("armor reduces damage with a one damage minimum; replacing HP gear clamps health", () => {
  let s = createState();
  s.gold = 1000;
  s = buy(s, "shop-helm");
  s = equip(s, s.inventory[0].id);
  s.hp = stats(s).hp;
  const n = tick(s, Date.now(), 1);
  assert.equal(s.hp - n.hp, 2);
  s.gear.helmet = { ...s.gear.helmet!, armor: 100 };
  assert.equal(s.hp - tick(s, Date.now(), 1).hp, 1);
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
