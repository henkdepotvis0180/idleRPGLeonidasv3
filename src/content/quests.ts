export const DAILY_QUESTS = [
  {
    id: "kills",
    name: "Push Back the Mist",
    description: "Defeat 20 enemies",
    target: 20,
    xp: 75,
    gold: 100,
  },
  {
    id: "bosses",
    name: "One Less Crown",
    description: "Defeat 1 boss",
    target: 1,
    xp: 100,
    gold: 125,
  },
  {
    id: "loot",
    name: "Relic Hunter",
    description: "Find 3 pieces of gear",
    target: 3,
    xp: 50,
    gold: 75,
  },
] as const;
export type DailyId = (typeof DAILY_QUESTS)[number]["id"];
export const BLESSINGS = [
  {
    id: "sun",
    name: "Sun Shard",
    description: "+4 attack this run",
    attack: 4,
    hp: 0,
    armor: 0,
  },
  {
    id: "root",
    name: "Root Heart",
    description: "+25 max HP and healing this run",
    attack: 0,
    hp: 25,
    armor: 0,
  },
  {
    id: "stone",
    name: "Stone Skin",
    description: "+3 armor this run",
    attack: 0,
    hp: 0,
    armor: 3,
  },
] as const;
export type BlessingId = (typeof BLESSINGS)[number]["id"];
