export const DAILY_QUESTS = [
  {
    id: "kills",
    name: "De mist terugdringen",
    description: "Versla 20 vijanden",
    target: 20,
    xp: 75,
    gold: 100,
  },
  {
    id: "bosses",
    name: "Een kroon minder",
    description: "Versla 1 eindbaas",
    target: 1,
    xp: 100,
    gold: 125,
  },
  {
    id: "loot",
    name: "Reliekenjager",
    description: "Vind 3 uitrustingsstukken",
    target: 3,
    xp: 50,
    gold: 75,
  },
] as const;
export type DailyId = (typeof DAILY_QUESTS)[number]["id"];
export const BLESSINGS = [
  {
    id: "sun",
    name: "Zonnescherf",
    description: "+6 aanval deze run",
    attack: 6,
    hp: 0,
    armor: 0,
  },
  {
    id: "root",
    name: "Wortelhart",
    description: "+40 HP en genezing deze run",
    attack: 0,
    hp: 40,
    armor: 0,
  },
  {
    id: "stone",
    name: "Steenhuid",
    description: "+4 armor deze run",
    attack: 0,
    hp: 0,
    armor: 4,
  },
] as const;
export type BlessingId = (typeof BLESSINGS)[number]["id"];
