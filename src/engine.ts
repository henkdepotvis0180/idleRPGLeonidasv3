import {
  CLASSES,
  classFor,
  RARITIES,
  rollRarity,
  forgeItem,
  CATALOG,
  COMPANIONS,
  RACES,
  FACTIONS,
  STANCES,
  generateRegion,
  type RaceId,
  type FactionId,
  type Stance,
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
  version: 4;
  race: RaceId;
  faction: FactionId;
  companions: { owned: string[]; active: string | null };
  tactics: { lane: number; stance: Stance };
  world: {
    mode: "battle" | "explore";
    x: number;
    z: number;
    heading: number;
    camera: "overview" | "third";
    destination: string | null;
    visited: string[];
    enemyIndex: number | null;
    elite: boolean;
    site: string | null;
  };
  floats: {
    id: number;
    target: "hero" | "enemy";
    amount: number;
    kind: "damage" | "critical" | "heal" | "block" | "evade";
    label: string;
  }[];
  floatSerial: number;
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
    turn: number;
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
const freshWorld = (): State["world"] => ({
  mode: "battle",
  x: 0,
  z: 7,
  heading: Math.PI,
  camera: "overview",
  destination: null,
  visited: [],
  enemyIndex: null,
  elite: false,
  site: null,
});
export const activeCompanion = (s: State) =>
  MODULES.companions
    ? COMPANIONS.find(
        (c) =>
          c.id === s.companions.active && s.companions.owned.includes(c.id),
      )
    : undefined;
export const stanceFor = (s: State) =>
  STANCES.find((t) => t.id === s.tactics.stance) ?? STANCES[0];
export const regionNodes = (s: State) =>
  generateRegion(
    s.zone,
    s.run.number,
    ZONES[s.zone].level,
    ZONES[s.zone].enemies.length,
  );
export function bossWarning(s: State) {
  const mechanic = currentEnemy(s).mechanic;
  return s.wave === 10 && mechanic
    ? {
        ...mechanic,
        remaining: mechanic.every - (s.combat.turn % mechanic.every),
      }
    : null;
}
function float(
  s: State,
  target: "hero" | "enemy",
  amount: number,
  kind: State["floats"][number]["kind"] = "damage",
  label = "",
) {
  s.floatSerial++;
  s.floats = [
    ...s.floats.slice(-7),
    { id: s.floatSerial, target, amount, kind, label },
  ];
}
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
    armor:
      bonuses.reduce((n, b) => n + b.armor, 0) +
      (activeCompanion(s)?.armor ?? 0),
    critical: Math.min(
      0.2,
      Object.values(s.gear).reduce((n, i) => n + (i.critical ?? 0), 0) / 100,
    ),
    vitality: Math.min(
      5,
      Object.values(s.gear).reduce((n, i) => n + (i.vitality ?? 0), 0),
    ),
  };
}
export function currentEnemy(s: State) {
  const z = ZONES[s.zone];
  return s.wave === RULES.encountersPerRun
    ? z.boss
    : z.enemies[
        s.world.enemyIndex === null
          ? (s.wave + s.run.number - 2) % z.enemies.length
          : s.world.enemyIndex % z.enemies.length
      ];
}
export const enemyMax = (s: State) =>
  Math.round(currentEnemy(s).hp * (s.world.elite && s.wave !== 10 ? 1.35 : 1));
export function createState(classId = "warrior", now = Date.now()): State {
  const c = CLASSES.find((c) => c.id === classId) ?? CLASSES[0];
  const s: State = {
    version: 4,
    race: "human",
    faction: "concord",
    companions: { owned: [], active: null },
    tactics: { lane: 0, stance: "balanced" },
    world: freshWorld(),
    floats: [],
    floatSerial: 0,
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
    world: { ...freshWorld(), camera: s.world.camera },
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
    turn: 0,
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
  const multiplier = boss
    ? RULES.bossRewardMultiplier
    : s.world.elite
      ? 1.5
      : 1;
  reward(s, Math.round(z.xp * multiplier), Math.round(z.gold * multiplier));
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
        ...forgeItem(s.zone, slot, rarity, s.kills, weaponStyle),
        id: `loot-${now}-${s.kills}`,
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
  if (s.world.site)
    s.world = {
      ...s.world,
      mode: "explore",
      visited: [...new Set([...s.world.visited, s.world.site])],
      site: null,
      enemyIndex: null,
      elite: false,
    };
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
    state.world.mode === "explore" ||
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
  const critical = roll < power.critical;
  const damage = Math.round(
    power.attack *
      (ability.damage ?? 0) *
      stanceFor(s).attack *
      (critical ? 1.5 : 1),
  );
  if (damage > 0)
    float(s, "enemy", damage, critical ? "critical" : "damage", ability.name);
  const healing = Math.min(
    power.hp - s.hp,
    Math.round(power.hp * (ability.heal ?? 0)),
  );
  if (healing > 0) float(s, "hero", healing, "heal", ability.name);
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
  if (s.world.mode === "explore" || (MODULES.roguelike && s.run.choicePending))
    return s;
  for (const id of Object.keys(s.combat.cooldowns))
    s.combat.cooldowns[id] = Math.max(0, s.combat.cooldowns[id] - 1);
  if (s.combat.formTurns > 0 && --s.combat.formTurns === 0)
    s.combat.form = "human";

  s.combat.turn++;
  const critical = roll < stats(s).critical;
  const companionDamage = activeCompanion(s)?.attack ?? 0;
  const damage =
    Math.round(stats(s).attack * stanceFor(s).attack * (critical ? 1.5 : 1)) +
    companionDamage +
    (s.combat.dotTurns > 0 ? s.combat.dot : 0);
  float(
    s,
    "enemy",
    damage,
    critical ? "critical" : "damage",
    companionDamage ? `+${companionDamage} companion` : "",
  );
  const healing = Math.min(
    stats(s).hp - s.hp,
    (s.combat.turn % 4 === 0 ? (activeCompanion(s)?.heal ?? 0) : 0) +
      stats(s).vitality,
  );
  if (healing > 0) {
    s.hp += healing;
    float(s, "hero", healing, "heal");
  }
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
    const warning = bossWarning({
      ...s,
      combat: { ...s.combat, turn: s.combat.turn - 1 },
    });
    const impact = warning && warning.remaining === 1;
    const dodged = impact && s.tactics.lane !== warning.lane;
    let incoming = Math.round(
      damageTaken(
        currentEnemy(s).attack *
          (impact && !dodged ? warning.multiplier : 1) *
          (s.world.elite && s.wave !== 10 ? 1.2 : 1),
        stats(s).armor,
      ) * stanceFor(s).incoming,
    );
    if (dodged) {
      incoming = Math.round(incoming * 0.5);
      float(s, "hero", 0, "evade", "DODGE");
    } else if (impact)
      s.log = `${warning.name} hits your lane! Move before the next impact.`;
    const absorbed = Math.min(incoming, s.combat.shield);
    s.combat.shield -= absorbed;
    incoming -= absorbed;
    s.hp -= incoming;
    if (absorbed > 0) float(s, "hero", absorbed, "block");
    if (incoming > 0) float(s, "hero", incoming);
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
  if (!item || s.level < (item.requiredLevel ?? 1)) return s;
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
  const item = [...SHOP, ...CATALOG].find((i) => i.id === id);
  if (
    !MODULES.shop ||
    !item ||
    s.gold < item.price ||
    s.level < (item.requiredLevel ?? 1) ||
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
              name:
                item.id === "shop-sword"
                  ? `Dawnkeeper ${classFor(s.classId).weapon}`
                  : item.name.replace(
                      /(?:Edge|Reaver|Oath)$/,
                      classFor(s.classId).weapon[0].toUpperCase() +
                        classFor(s.classId).weapon.slice(1),
                    ),
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
    if (s.version === 3) {
      s.version = 4;
      s.race = "human";
      s.faction = "concord";
      s.companions = { owned: [], active: null };
      s.tactics = { lane: 0, stance: "balanced" };
      s.world = freshWorld();
      s.floats = [];
      s.floatSerial = 0;
      s.combat = { ...s.combat, turn: 0 };
      s.log =
        "Welcome to 0.4.0. Your progress is preserved. Explore the frontier and choose your banner.";
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
      [
        i.itemLevel ?? 0,
        i.requiredLevel ?? 0,
        i.critical ?? 0,
        i.vitality ?? 0,
        i.design ?? 0,
      ].every(num) &&
      ["description", "origin", "material", "tint"].every(
        (k) => i[k] === undefined || typeof i[k] === "string",
      ) &&
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
      s.version !== 4 ||
      !RACES.some((r) => r.id === s.race) ||
      !FACTIONS.some((f) => f.id === s.faction) ||
      !s.companions ||
      !Array.isArray(s.companions.owned) ||
      new Set(s.companions.owned).size !== s.companions.owned.length ||
      !s.companions.owned.every((id: string) =>
        COMPANIONS.some((c) => c.id === id),
      ) ||
      (s.companions.active !== null &&
        !s.companions.owned.includes(s.companions.active)) ||
      !s.tactics ||
      ![-1, 0, 1].includes(s.tactics.lane) ||
      !STANCES.some((t) => t.id === s.tactics.stance) ||
      !validWorld(s.world) ||
      !integer(s.floatSerial) ||
      !Array.isArray(s.floats) ||
      s.floats.length > 8 ||
      !s.floats.every(
        (f: any) =>
          integer(f.id) &&
          integer(f.amount) &&
          ["hero", "enemy"].includes(f.target) &&
          ["damage", "critical", "heal", "block", "evade"].includes(f.kind) &&
          typeof f.label === "string",
      ) ||
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
        s.combat.turn,
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

export function chooseRace(s: State, id: RaceId): State {
  return RACES.some((r) => r.id === id) ? { ...s, race: id } : s;
}
export function chooseFaction(s: State, id: FactionId): State {
  return FACTIONS.some((f) => f.id === id)
    ? {
        ...s,
        faction: id,
        log: `${FACTIONS.find((f) => f.id === id)!.name}: ${FACTIONS.find((f) => f.id === id)!.motto}`,
      }
    : s;
}
export function hireCompanion(s: State, id: string): State {
  const c = COMPANIONS.find((c) => c.id === id);
  if (
    !MODULES.companions ||
    !c ||
    s.companions.owned.includes(id) ||
    s.gold < c.price ||
    s.level < c.level
  )
    return s;
  return {
    ...s,
    gold: s.gold - c.price,
    companions: {
      owned: [...s.companions.owned, id],
      active: s.companions.active ?? id,
    },
    log: `${c.name} joins your company.`,
  };
}
export function selectCompanion(s: State, id: string | null): State {
  return id === null || s.companions.owned.includes(id)
    ? { ...s, companions: { ...s.companions, active: id } }
    : s;
}
export function setTactics(
  s: State,
  lane: number,
  stance: Stance = s.tactics.stance,
): State {
  return [-1, 0, 1].includes(lane) && STANCES.some((t) => t.id === stance)
    ? { ...s, tactics: { lane, stance } }
    : s;
}
export function setCamera(s: State, camera: State["world"]["camera"]): State {
  return ["overview", "third"].includes(camera)
    ? { ...s, world: { ...s.world, camera } }
    : s;
}
export function explore(s: State): State {
  if (!MODULES.exploration) return s;
  return {
    ...s,
    world: { ...s.world, mode: "explore", destination: null },
    log: "Explore with the movement pad, or select a destination on the local map. Approach a site to interact.",
  };
}
export function returnToBattle(s: State): State {
  return {
    ...s,
    world: { ...s.world, mode: "battle", destination: null },
    log: "Expedition resumed. Your selected stance and lane apply in combat.",
  };
}
export function moveHero(s: State, x: number, z: number): State {
  if (
    !MODULES.exploration ||
    s.world.mode !== "explore" ||
    !Number.isFinite(x) ||
    !Number.isFinite(z)
  )
    return s;
  const length = Math.hypot(x, z);
  if (!length) return s;
  const step = Math.min(0.42, length);
  return {
    ...s,
    world: {
      ...s.world,
      x: Math.max(-9, Math.min(9, s.world.x + (x / length) * step)),
      z: Math.max(-9, Math.min(9, s.world.z + (z / length) * step)),
      heading: Math.atan2(x, z),
      destination: null,
    },
  };
}
export function navigateTo(s: State, id: string): State {
  if (!MODULES.exploration || !regionNodes(s).some((n) => n.id === id))
    return s;
  return { ...s, world: { ...s.world, mode: "explore", destination: id } };
}
export function walkWorld(s: State): State {
  if (s.world.mode !== "explore" || !s.world.destination) return s;
  const target = regionNodes(s).find((n) => n.id === s.world.destination);
  if (!target) return { ...s, world: { ...s.world, destination: null } };
  const distance = Math.hypot(target.x - s.world.x, target.z - s.world.z);
  if (distance < 0.3) return { ...s, world: { ...s.world, destination: null } };
  const n = moveHero(s, target.x - s.world.x, target.z - s.world.z);
  return { ...n, world: { ...n.world, destination: s.world.destination } };
}
export function nearestSite(s: State) {
  return regionNodes(s)
    .map((n) => ({
      ...n,
      distance: Math.hypot(n.x - s.world.x, n.z - s.world.z),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
}
export function interactSite(s: State): State {
  if (s.world.mode !== "explore") return s;
  const site = nearestSite(s);
  if (site.distance > 1.3 || s.level < site.level) return s;
  if (site.kind === "camp")
    return {
      ...s,
      hp: stats(s).hp,
      log: "Rested at the wayfarer camp. Health fully restored.",
    };
  if (s.world.visited.includes(site.id))
    return {
      ...s,
      log: "This site is cleared. New sites appear when the expedition ends.",
    };
  if (site.kind === "cache") {
    const n = {
      ...s,
      world: { ...s.world, visited: [...s.world.visited, site.id] },
    };
    reward(n, Math.round(ZONES[s.zone].xp / 2), ZONES[s.zone].gold);
    return {
      ...n,
      log: `Recovered a traveller’s cache. +${ZONES[s.zone].gold} gold.`,
    };
  }
  if (s.run.choicePending)
    return { ...s, log: "Choose your blessing before the next battle." };
  if (site.kind === "boss" && s.wave !== 10)
    return {
      ...s,
      log: `The sovereign’s gate opens after nine encounters. Current encounter: ${s.wave}/10.`,
    };
  if (site.kind !== "boss" && s.wave === 10)
    return {
      ...s,
      log: "The sovereign awaits. Approach the northern boss gate, or resume the expedition.",
    };
  const n: State = {
    ...s,
    combat: { ...freshCombat(), event: s.combat.event },
    world: {
      ...s.world,
      mode: "battle",
      destination: null,
      enemyIndex: site.enemyIndex,
      elite: site.kind === "elite",
      site: site.id,
    },
    log: `${site.kind === "elite" ? "Elite encounter" : "Encounter"} at ${site.name}.`,
  };
  n.enemyHp = enemyMax(n);
  return n;
}
function validWorld(w: any): boolean {
  return (
    w &&
    ["battle", "explore"].includes(w.mode) &&
    [w.x, w.z, w.heading].every(Number.isFinite) &&
    Math.abs(w.x) <= 9 &&
    Math.abs(w.z) <= 9 &&
    ["overview", "third"].includes(w.camera) &&
    (w.destination === null || typeof w.destination === "string") &&
    (w.site === null || typeof w.site === "string") &&
    Array.isArray(w.visited) &&
    w.visited.length <= 14 &&
    w.visited.every((id: unknown) => typeof id === "string") &&
    new Set(w.visited).size === w.visited.length &&
    (w.enemyIndex === null ||
      (Number.isSafeInteger(w.enemyIndex) &&
        w.enemyIndex >= 0 &&
        w.enemyIndex < 100)) &&
    typeof w.elite === "boolean"
  );
}
