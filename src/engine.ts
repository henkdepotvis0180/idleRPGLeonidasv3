import {
  CLASSES,
  classFor,
  RARITIES,
  rollRarity,
  type Rarity,
  type SpellEffect,
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
import {
  defaultAppearance,
  validAppearance,
  type Appearance,
} from "./appearance.ts";
export type State = {
  version: 3;
  lastBoss: null | {
    zoneId: string;
    gold: number;
    xp: number;
    itemName: string | null;
    rarity: Rarity | null;
  };
  appearance: Appearance;
  settings: {
    music: boolean;
    effects: boolean;
    autoCast: boolean;
    lowPower: boolean;
  };
  combat: {
    cooldowns: Record<string, number>;
    shield: number;
    shieldTurns: number;
    dot: number;
    dotTurns: number;
    stun: number;
    form: "human" | "wolf" | "bear";
    formTurns: number;
    event: number;
    kind: "hit" | "spell" | "kill" | "none";
    effect: SpellEffect;
    amount: number;
    label: string;
  };
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
    version: 3,
    lastBoss: null,
    appearance: defaultAppearance(),
    settings: { music: false, effects: true, autoCast: false, lowPower: false },
    combat: freshCombat(),
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
    log: "Your journey to Leonidas begins.",
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
function resetRun(s: State, victory = false): State {
  const n: State = {
    ...s,
    wave: 1,
    run: { number: s.run.number + 1, blessings: [], choicePending: false },
    combat: {
      ...freshCombat(),
      event: s.combat.event,
      kind: victory ? "kill" : "none",
      effect: victory ? s.combat.effect : "steel",
      amount: victory ? s.combat.amount : 0,
      label: victory ? s.combat.label : "",
    },
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
    hp: Math.min(stats(n).hp, s.hp + (id === "root" ? 25 : 0)),
    log: "A blessing strengthens you until this run ends.",
  };
}
export function abandonRun(s: State): State {
  return {
    ...resetRun(s),
    log: "New run started. Your level, gold and gear are safe.",
  };
}
export function freshCombat(): State["combat"] {
  return {
    cooldowns: {},
    shield: 0,
    shieldTurns: 0,
    dot: 0,
    dotTurns: 0,
    stun: 0,
    form: "human",
    formTurns: 0,
    event: 0,
    kind: "none",
    effect: "steel",
    amount: 0,
    label: "",
  };
}
export const damageTaken = (attack: number, armor: number) =>
  Math.max(1, Math.round(attack * (1 - Math.min(0.6, armor / (armor + 35)))));
function defeated(s: State, now: number, roll: number): State {
  const stateInventoryLength = s.inventory.length;
  const z = ZONES[s.zone];
  const boss = s.wave === RULES.encountersPerRun;
  const multiplier = boss ? RULES.bossRewardMultiplier : 1;
  reward(s, z.xp * multiplier, z.gold * multiplier);
  s.kills++;
  s.daily = { ...s.daily, kills: s.daily.kills + 1 };
  if (boss) {
    s.daily.bosses++;
    if (!s.bosses.includes(z.id)) s.bosses = [...s.bosses, z.id];
  }
  s.log = `${currentEnemy(s).name} defeated! +${z.gold * multiplier} gold`;
  s.combat = { ...s.combat, kind: "kill", dot: 0, dotTurns: 0, stun: 0 };
  if (
    (boss || roll < RULES.lootChance) &&
    s.inventory.length < s.bags * RULES.bagSize
  ) {
    const slot = SLOTS[(s.kills - 1) % SLOTS.length];
    // Normalize the loot roll independently from its rarity distribution.
    const rarity = rollRarity(boss ? roll : roll / RULES.lootChance, boss);
    const m = RARITIES[rarity].multiplier;
    const armored = [
      "offhand",
      "helmet",
      "shoulders",
      "chest",
      "wrists",
      "gloves",
      "belt",
      "legs",
      "boots",
    ].includes(slot);
    const weaponStyle =
      slot === "weapon" ? classFor(s.classId).weapon : undefined;
    s.inventory = [
      ...s.inventory,
      {
        id: `loot-${now}-${s.kills}`,
        name: `${boss ? "Crown" : "Mist"} ${weaponStyle ?? SLOT_NAMES[slot]}`,
        slot,
        weaponStyle,
        attack: Math.max(
          0,
          Math.round(
            (slot === "weapon"
              ? 3 + s.zone * 3
              : slot.includes("trinket")
                ? 1 + s.zone
                : 0) * m,
          ),
        ),
        hp: slot === "weapon" ? 0 : Math.round((5 + s.zone * 6) * m),
        armor: armored ? Math.round((1 + s.zone) * m) : 0,
        rarity,
        price: 8 + s.zone * 8 + Math.round(m * 3),
      },
    ];
    s.daily.loot++;
  } else if (boss && s.inventory.length >= s.bags * RULES.bagSize)
    s.log += " Bag full: make room for the next drop.";
  if (boss) {
    const dropped =
      s.inventory.length > stateInventoryLength
        ? s.inventory[s.inventory.length - 1]
        : null;
    s.lastBoss = {
      zoneId: z.id,
      gold: z.gold * multiplier,
      xp: z.xp * multiplier,
      itemName: dropped?.name ?? null,
      rarity: dropped?.rarity ?? null,
    };
    return resetRun(s, true);
  }
  s.run = {
    ...s.run,
    choicePending:
      MODULES.roguelike &&
      (RULES.blessingWaves as readonly number[]).includes(s.wave),
  };
  s.wave++;
  s.enemyHp = enemyMax(s);
  s.hp = Math.min(stats(s).hp, s.hp + 8);
  return s;
}
export function castAbility(
  state: State,
  id: string,
  now = Date.now(),
  roll = Math.random(),
): State {
  const ability = classFor(state.classId).abilities.find((a) => a.id === id);
  if (
    !ability ||
    state.run.choicePending ||
    (state.combat.cooldowns[id] ?? 0) > 0
  )
    return state;
  let s = {
    ...state,
    daily: { ...state.daily },
    combat: {
      ...state.combat,
      cooldowns: { ...state.combat.cooldowns, [id]: ability.cooldown },
    },
  };
  const power = stats(s);
  const damage = Math.round(power.attack * (ability.damage ?? 0));
  s.enemyHp -= damage;
  s.hp = Math.min(power.hp, s.hp + Math.round(power.hp * (ability.heal ?? 0)));
  if (ability.shield) {
    s.combat.shield = Math.round(power.hp * ability.shield);
    s.combat.shieldTurns = ability.duration ?? 4;
  }
  if (ability.dot) {
    s.combat.dot = Math.round(power.attack * ability.dot);
    s.combat.dotTurns = ability.duration ?? 4;
  }
  if (ability.stun) s.combat.stun = Math.max(s.combat.stun, ability.stun);
  if (ability.form) {
    s.combat.form = ability.form;
    s.combat.formTurns = ability.duration ?? 5;
  }
  s.combat.event++;
  s.combat.kind = "spell";
  s.combat.effect = ability.effect;
  s.combat.amount = damage;
  s.combat.label = ability.name;
  s.log = `${ability.name}${damage ? ` · ${damage} damage` : ""}${ability.heal ? " · healing restored" : ""}${ability.shield ? " · barrier raised" : ""}`;
  return s.enemyHp <= 0 ? defeated(s, now, roll) : s;
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
    lastSeen: now,
    combat: { ...base.combat, cooldowns: { ...base.combat.cooldowns } },
  };
  if (MODULES.roguelike && s.run.choicePending) return s;
  for (const id of Object.keys(s.combat.cooldowns))
    s.combat.cooldowns[id] = Math.max(0, s.combat.cooldowns[id] - 1);
  if (s.combat.formTurns > 0 && --s.combat.formTurns === 0)
    s.combat.form = "human";

  const damage = stats(s).attack + (s.combat.dotTurns > 0 ? s.combat.dot : 0);
  if (s.combat.dotTurns > 0) s.combat.dotTurns--;
  s.enemyHp -= damage;
  s.combat.event++;
  s.combat.kind = "hit";
  const weapon = classFor(s.classId).weapon;
  s.combat.effect = ["staff", "wand", "lute"].includes(weapon)
    ? classFor(s.classId).abilities[0].effect
    : "steel";
  s.combat.amount = damage;
  s.combat.label = "";
  if (s.enemyHp <= 0) {
    if (s.combat.shieldTurns > 0 && --s.combat.shieldTurns === 0)
      s.combat.shield = 0;
    return defeated(s, now, roll);
  }
  if (s.combat.stun > 0) s.combat.stun--;
  else {
    let incoming = damageTaken(currentEnemy(s).attack, stats(s).armor);
    const absorbed = Math.min(incoming, s.combat.shield);
    s.combat.shield -= absorbed;
    incoming -= absorbed;
    s.hp -= incoming;
    if (s.hp <= 0)
      return {
        ...resetRun(s),
        log: "Defeated. Temporary blessings fade; your gear, gold and level remain.",
      };
  }
  if (s.combat.shieldTurns > 0 && --s.combat.shieldTurns === 0)
    s.combat.shield = 0;
  if (s.settings.autoCast) {
    const ability = classFor(s.classId).abilities.find(
      (a) => (s.combat.cooldowns[a.id] ?? 0) === 0,
    );
    if (ability) s = castAbility(s, ability.id, now, roll);
  }
  return s;
}
export function switchClass(s: State, id: string): State {
  if (!CLASSES.some((c) => c.id === id) || s.classId === id) return s;
  const n = {
    ...s,
    classId: id,
    gear: { ...s.gear },
    inventory: s.inventory.map((i) =>
      i.slot === "weapon" ? { ...i, weaponStyle: classFor(id).weapon } : i,
    ),
  };
  if (n.gear.weapon)
    n.gear.weapon = { ...n.gear.weapon, weaponStyle: classFor(id).weapon };
  return {
    ...resetRun(n),
    log: `Class changed to ${classFor(id).name}. A new run begins; progress is preserved.`,
  };
}
export function customize(
  s: State,
  key: keyof Appearance,
  value: number,
): State {
  const appearance = { ...s.appearance, [key]: value };
  return validAppearance(appearance) ? { ...s, appearance } : s;
}
export function setSetting(
  s: State,
  key: keyof State["settings"],
  value: boolean,
): State {
  return { ...s, settings: { ...s.settings, [key]: value } };
}
export function heartbeat(s: State, now = Date.now()): State {
  return { ...rollover(s, now), lastSeen: now };
}
export function changeZone(s: State, index: number): State {
  if (!ZONES[index] || s.level < ZONES[index].level || s.zone === index)
    return s;
  return {
    ...resetRun({ ...s, zone: index }),
    log: `Travelling to ${ZONES[index].name}.`,
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
    log: `${item.name} equipped.`,
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
    log: `${item.name} returned to your bag.`,
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
    inventory: [
      ...s.inventory,
      {
        ...item,
        id: uniqueId,
        ...(item.slot === "weapon"
          ? {
              weaponStyle: classFor(s.classId).weapon,
              name: `Dawnkeeper ${classFor(s.classId).weapon}`,
            }
          : {}),
      },
    ],
    log: "Your purchase is in your bag.",
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
  reward(n, RULES.storyXpPerChapter * (s.mainClaimed + 1), RULES.storyGold);
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
    if (s.version === 2) {
      s.version = 3;
      s.lastBoss = null;
      s.appearance = defaultAppearance();
      s.settings = {
        music: false,
        effects: true,
        autoCast: false,
        lowPower: false,
      };
      s.combat = freshCombat();
      const translate = (i: any) => {
        if (!i) return i;
        const known = SHOP.find((t) => i.id?.startsWith(t.id));
        return {
          ...i,
          name:
            known?.name ?? `Legacy ${SLOT_NAMES[i.slot as Slot] ?? "relic"}`,
          ...(i.slot === "weapon"
            ? { weaponStyle: classFor(s.classId).weapon }
            : {}),
        };
      };
      if (Array.isArray(s.inventory)) s.inventory = s.inventory.map(translate);
      if (s.gear && typeof s.gear === "object")
        s.gear = Object.fromEntries(
          Object.entries(s.gear).map(([k, i]) => [k, translate(i)]),
        );
      s.log =
        "Welcome to 0.3.0. Your progress and equipment have been preserved.";
    }
    const num = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) && v >= 0;
    const integer = (v: unknown) => num(v) && Number.isSafeInteger(v);
    const item = (i: any) =>
      i &&
      typeof i.id === "string" &&
      typeof i.name === "string" &&
      SLOTS.includes(i.slot) &&
      [i.attack, i.hp, i.armor, i.price].every(num) &&
      Object.hasOwn(RARITIES, i.rarity) &&
      (i.weaponStyle === undefined ||
        [
          "sword",
          "dagger",
          "staff",
          "bow",
          "hammer",
          "axe",
          "fists",
          "lute",
          "wand",
          "scythe",
        ].includes(i.weaponStyle));
    if (
      s.version !== 3 ||
      !validAppearance(s.appearance) ||
      (s.lastBoss !== null &&
        (!s.lastBoss ||
          typeof s.lastBoss.zoneId !== "string" ||
          ![s.lastBoss.gold, s.lastBoss.xp].every(integer) ||
          (s.lastBoss.itemName !== null &&
            typeof s.lastBoss.itemName !== "string") ||
          (s.lastBoss.rarity !== null &&
            !Object.hasOwn(RARITIES, s.lastBoss.rarity)))) ||
      !s.settings ||
      !["music", "effects", "autoCast", "lowPower"].every(
        (k) => typeof s.settings[k] === "boolean",
      ) ||
      !s.combat ||
      !s.combat.cooldowns ||
      typeof s.combat.cooldowns !== "object" ||
      Array.isArray(s.combat.cooldowns) ||
      !Object.values(s.combat.cooldowns).every(integer) ||
      ![
        s.combat.shield,
        s.combat.shieldTurns,
        s.combat.dot,
        s.combat.dotTurns,
        s.combat.stun,
        s.combat.formTurns,
        s.combat.event,
        s.combat.amount,
      ].every(integer) ||
      !["human", "wolf", "bear"].includes(s.combat.form) ||
      !["none", "hit", "spell", "kill"].includes(s.combat.kind) ||
      ![
        "steel",
        "fire",
        "frost",
        "nature",
        "holy",
        "shadow",
        "arcane",
        "lightning",
        "song",
      ].includes(s.combat.effect) ||
      typeof s.combat.label !== "string" ||
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
