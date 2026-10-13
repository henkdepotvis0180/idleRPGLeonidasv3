import {
  CLASSES,
  ZONES,
  SHOP,
  SLOTS,
  SLOT_NAMES,
  BLESSINGS,
  DAILY_QUESTS,
  type Item,
  type Slot,
  type BlessingId,
  type DailyId,
} from "./content.ts";
import { MODULES, RULES } from "./config.ts";
export type State = {
  version: 2;
  classId: string;
  level: number;
  xp: number;
  gold: number;
  hp: number;
  zone: number;
  kills: number;
  bosses: string[];
  wave: number;
  enemyHp: number;
  inventory: Item[];
  gear: Partial<Record<Slot, Item>>;
  bags: number;
  lastSeen: number;
  daily: {
    day: string;
    kills: number;
    bosses: number;
    loot: number;
    claimed: DailyId[];
  };
  mainClaimed: number;
  log: string;
  run: { number: number; blessings: BlessingId[]; choicePending: boolean };
  offline: null | { seconds: number; xp: number; gold: number };
};
export const dayKey = (now: number) => new Date(now).toISOString().slice(0, 10);
export const xpNeeded = (level: number) => 60 + level * 30;
const freshDaily = (now: number): State["daily"] => ({
  day: dayKey(now),
  kills: 0,
  bosses: 0,
  loot: 0,
  claimed: [],
});
export function stats(s: State) {
  const c = CLASSES.find((c) => c.id === s.classId) ?? CLASSES[0];
  const bonuses = [
    ...Object.values(s.gear),
    ...(MODULES.roguelike
      ? s.run.blessings.flatMap((id) => BLESSINGS.filter((b) => b.id === id))
      : []),
  ];
  return {
    attack:
      c.attack + (s.level - 1) * 3 + bonuses.reduce((n, b) => n + b.attack, 0),
    hp: c.hp + (s.level - 1) * 12 + bonuses.reduce((n, b) => n + b.hp, 0),
    armor: bonuses.reduce((n, b) => n + b.armor, 0),
  };
}
export function currentEnemy(s: State) {
  const z = ZONES[s.zone];
  return s.wave === RULES.encountersPerRun
    ? z.boss
    : z.enemies[(s.wave + s.run.number - 2) % z.enemies.length];
}
export const enemyMax = (s: State) => currentEnemy(s).hp;
export function createState(classId = "warrior", now = Date.now()): State {
  const c = CLASSES.find((c) => c.id === classId) ?? CLASSES[0];
  const s: State = {
    version: 2,
    classId: c.id,
    level: 1,
    xp: 0,
    gold: 0,
    hp: c.hp,
    zone: 0,
    kills: 0,
    bosses: [],
    wave: 1,
    enemyHp: 0,
    inventory: [],
    gear: {},
    bags: 1,
    lastSeen: now,
    daily: freshDaily(now),
    mainClaimed: 0,
    log: "De weg naar Leonidas begint hier.",
    run: { number: 1, blessings: [], choicePending: false },
    offline: null,
  };
  s.enemyHp = enemyMax(s);
  return s;
}
function reward(s: State, xp: number, gold: number) {
  s.xp += xp;
  s.gold += gold;
  while (s.xp >= xpNeeded(s.level)) {
    s.xp -= xpNeeded(s.level);
    s.level++;
    s.hp = stats(s).hp;
  }
}
const rollover = (s: State, now: number): State =>
  s.daily.day === dayKey(now) ? s : { ...s, daily: freshDaily(now) };
function resetRun(s: State): State {
  const n = {
    ...s,
    wave: 1,
    run: { number: s.run.number + 1, blessings: [], choicePending: false },
  };
  return { ...n, hp: stats(n).hp, enemyHp: enemyMax(n) };
}
export function chooseBlessing(s: State, id: BlessingId): State {
  if (
    !MODULES.roguelike ||
    !s.run.choicePending ||
    !BLESSINGS.some((b) => b.id === id)
  )
    return s;
  const n = {
    ...s,
    run: {
      ...s.run,
      blessings: [...s.run.blessings, id],
      choicePending: false,
    },
  };
  return {
    ...n,
    hp: Math.min(stats(n).hp, s.hp + (id === "root" ? 40 : 0)),
    log: "Een zegen versterkt je tot het einde van deze run.",
  };
}
export function abandonRun(s: State): State {
  return {
    ...resetRun(s),
    log: "Nieuwe run gestart. Je level, goud en uitrusting blijven behouden.",
  };
}
export function tick(
  state: State,
  now = Date.now(),
  roll = Math.random(),
): State {
  const base = rollover(state, now);
  let s: State = {
    ...base,
    daily: { ...base.daily },
    inventory: [...base.inventory],
    lastSeen: now,
  };
  if (MODULES.roguelike && s.run.choicePending) return s;
  const z = ZONES[s.zone];
  s.enemyHp -= stats(s).attack;
  if (s.enemyHp <= 0) {
    const boss = s.wave === RULES.encountersPerRun;
    reward(s, z.xp * (boss ? 5 : 1), z.gold * (boss ? 5 : 1));
    s.kills++;
    s.daily.kills++;
    if (boss) {
      s.daily.bosses++;
      if (!s.bosses.includes(z.id)) s.bosses = [...s.bosses, z.id];
    }
    s.log = `${currentEnemy(state).name} verslagen! +${z.gold * (boss ? 5 : 1)} goud`;
    if (
      (boss || roll < RULES.lootChance) &&
      s.inventory.length < s.bags * RULES.bagSize
    ) {
      const slot = SLOTS[(s.kills - 1) % SLOTS.length];
      s.inventory.push({
        id: `loot-${now}-${s.kills}`,
        name: `${boss ? "Konings" : "Mist"} ${SLOT_NAMES[slot].toLowerCase()}`,
        slot,
        attack: slot === "weapon" ? 4 + s.zone * 5 : 1 + s.zone,
        hp: slot === "weapon" ? 0 : 8 + s.zone * 10,
        armor: [
          "offhand",
          "helmet",
          "shoulders",
          "chest",
          "wrists",
          "gloves",
          "belt",
          "legs",
          "boots",
        ].includes(slot)
          ? 2 + s.zone * 2
          : 0,
        rarity: boss ? "epic" : roll < 0.08 ? "rare" : "common",
        price: 12 + s.zone * 10,
      });
      s.daily.loot++;
    } else if (boss && s.inventory.length >= s.bags * RULES.bagSize)
      s.log += " Bag vol: maak ruimte voor volgende loot.";
    if (boss) return resetRun(s);
    s.run = {
      ...s.run,
      choicePending:
        MODULES.roguelike &&
        (RULES.blessingWaves as readonly number[]).includes(s.wave),
    };
    s.wave++;
    s.enemyHp = enemyMax(s);
    s.hp = Math.min(stats(s).hp, s.hp + 10);
  } else {
    s.hp -= Math.max(1, currentEnemy(s).attack - stats(s).armor);
    if (s.hp <= 0)
      return {
        ...resetRun(s),
        log: "Verslagen. Tijdelijke zegens vervallen; je gear, level en goud blijven.",
      };
  }
  return s;
}
export function changeZone(s: State, index: number): State {
  if (!ZONES[index] || s.level < ZONES[index].level || s.zone === index)
    return s;
  return {
    ...resetRun({ ...s, zone: index }),
    log: `Op weg naar ${ZONES[index].name}.`,
  };
}
export function equip(s: State, id: string): State {
  const item = s.inventory.find((i) => i.id === id);
  if (!item) return s;
  const old = s.gear[item.slot];
  const n = {
    ...s,
    inventory: [
      ...s.inventory.filter((i) => i.id !== id),
      ...(old ? [old] : []),
    ],
    gear: { ...s.gear, [item.slot]: item },
    log: `${item.name} uitgerust.`,
  };
  return { ...n, hp: Math.min(s.hp, stats(n).hp) };
}
export function unequip(s: State, slot: Slot): State {
  const item = s.gear[slot];
  if (!item || s.inventory.length >= s.bags * RULES.bagSize) return s;
  const gear = { ...s.gear };
  delete gear[slot];
  const n = {
    ...s,
    gear,
    inventory: [...s.inventory, item],
    log: `${item.name} in je bag.`,
  };
  return { ...n, hp: Math.min(n.hp, stats(n).hp) };
}
export function sell(s: State, id: string): State {
  const item = s.inventory.find((i) => i.id === id);
  return item
    ? {
        ...s,
        gold: s.gold + item.price,
        inventory: s.inventory.filter((i) => i.id !== id),
      }
    : s;
}
export function buy(s: State, id: string, now = Date.now()): State {
  const item = SHOP.find((i) => i.id === id);
  if (
    !MODULES.shop ||
    !item ||
    s.gold < item.price ||
    s.inventory.length >= s.bags * RULES.bagSize
  )
    return s;
  const ids = new Set(
    [...s.inventory, ...Object.values(s.gear)].map((i) => i.id),
  );
  let uniqueId = `${id}-${now}-${s.kills}`;
  let suffix = 0;
  while (ids.has(uniqueId)) uniqueId = `${id}-${now}-${s.kills}-${++suffix}`;
  return {
    ...s,
    gold: s.gold - item.price,
    inventory: [...s.inventory, { ...item, id: uniqueId }],
    log: "Aankoop ligt in je bag.",
  };
}
export function buyBag(s: State): State {
  return s.bags < RULES.maxBags && s.gold >= RULES.bagPrice
    ? { ...s, bags: s.bags + 1, gold: s.gold - RULES.bagPrice }
    : s;
}
export function claimDaily(
  s: State,
  id: DailyId = "kills",
  now = Date.now(),
): State {
  const n = rollover(s, now);
  const q = DAILY_QUESTS.find((q) => q.id === id);
  if (
    !MODULES.dailyQuests ||
    !q ||
    n.daily.claimed.includes(id) ||
    n.daily[id] < q.target
  )
    return n;
  const result = {
    ...n,
    daily: { ...n.daily, claimed: [...n.daily.claimed, id] },
  };
  reward(result, q.xp, q.gold);
  return result;
}
export function claimMain(s: State): State {
  const z = ZONES[s.mainClaimed];
  if (!z || !s.bosses.includes(z.id)) return s;
  const n = { ...s, mainClaimed: s.mainClaimed + 1 };
  reward(n, 100 * (s.mainClaimed + 1), 150);
  return n;
}
export function resume(s: State, now = Date.now()): State {
  const seconds = Math.min(
    RULES.offlineCapSeconds,
    Math.max(0, Math.floor((now - s.lastSeen) / 1000)),
  );
  const n = { ...rollover(s, now), lastSeen: now };
  if (!MODULES.offlineRewards || seconds < 60) return n;
  const z = ZONES[s.zone];
  const previous = s.offline;
  return {
    ...n,
    offline: {
      seconds: seconds + (previous?.seconds ?? 0),
      xp:
        Math.floor(seconds / RULES.offlineKillSeconds) * z.xp +
        (previous?.xp ?? 0),
      gold:
        Math.floor(seconds / RULES.offlineKillSeconds) * z.gold +
        (previous?.gold ?? 0),
    },
  };
}
export function claimOffline(s: State): State {
  if (!MODULES.offlineRewards || !s.offline) return s;
  const n = { ...s, offline: null };
  reward(n, s.offline.xp, s.offline.gold);
  return n;
}
export function decodeSave(raw: string | null, now = Date.now()): State {
  if (!raw) return createState("warrior", now);
  try {
    const s = JSON.parse(raw);
    const num = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) && v >= 0;
    const integer = (v: unknown) => num(v) && Number.isSafeInteger(v);
    const item = (i: any) =>
      i &&
      typeof i.id === "string" &&
      typeof i.name === "string" &&
      SLOTS.includes(i.slot) &&
      [i.attack, i.hp, i.armor, i.price].every(num) &&
      ["common", "rare", "epic"].includes(i.rarity);
    if (
      s.version !== 2 ||
      !CLASSES.some((c) => c.id === s.classId) ||
      !integer(s.level) ||
      s.level < 1 ||
      !integer(s.zone) ||
      !ZONES[s.zone] ||
      !Array.isArray(s.inventory) ||
      !s.inventory.every(item) ||
      !s.gear ||
      typeof s.gear !== "object" ||
      Array.isArray(s.gear) ||
      !Object.entries(s.gear).every(
        ([slot, i]: [string, any]) =>
          SLOTS.includes(slot as Slot) && item(i) && i.slot === slot,
      ) ||
      !s.daily ||
      typeof s.daily.day !== "string" ||
      ![s.daily.kills, s.daily.bosses, s.daily.loot].every(integer) ||
      !Array.isArray(s.daily.claimed) ||
      !s.daily.claimed.every((id: DailyId) =>
        DAILY_QUESTS.some((q) => q.id === id),
      ) ||
      !Array.isArray(s.bosses) ||
      !s.bosses.every((id: unknown) => typeof id === "string") ||
      !integer(s.bags) ||
      s.bags < 1 ||
      s.bags > RULES.maxBags ||
      s.inventory.length > s.bags * RULES.bagSize ||
      !integer(s.wave) ||
      s.wave < 1 ||
      s.wave > RULES.encountersPerRun ||
      !integer(s.mainClaimed) ||
      s.mainClaimed > ZONES.length ||
      ![s.xp, s.gold, s.hp, s.enemyHp, s.lastSeen].every(num) ||
      !integer(s.kills) ||
      typeof s.log !== "string" ||
      !s.run ||
      !integer(s.run.number) ||
      s.run.number < 1 ||
      typeof s.run.choicePending !== "boolean" ||
      !Array.isArray(s.run.blessings) ||
      s.run.blessings.length > RULES.blessingWaves.length ||
      !s.run.blessings.every((id: BlessingId) =>
        BLESSINGS.some((b) => b.id === id),
      ) ||
      (s.offline !== null &&
        (!s.offline ||
          ![s.offline.seconds, s.offline.xp, s.offline.gold].every(num)))
    )
      throw Error("Invalid save");
    const ids = [...s.inventory, ...Object.values(s.gear)].map(
      (i: any) => i.id,
    );
    if (new Set(ids).size !== ids.length) throw Error("Duplicate items");
    s.hp = Math.min(s.hp, stats(s).hp);
    s.enemyHp = Math.min(s.enemyHp, enemyMax(s));
    return resume(s, now);
  } catch {
    return createState("warrior", now);
  }
}
