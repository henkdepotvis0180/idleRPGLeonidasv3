export const RARITIES = {
  common: { name: "Common", color: "#b5b9c5", multiplier: 1 },
  uncommon: { name: "Uncommon", color: "#62cc83", multiplier: 1.1 },
  rare: { name: "Rare", color: "#5ea9f5", multiplier: 1.25 },
  epic: { name: "Epic", color: "#c58afa", multiplier: 1.45 },
  legendary: { name: "Legendary", color: "#ffaa50", multiplier: 1.7 },
} as const;
export type Rarity = keyof typeof RARITIES;
export const SLOTS = [
  "weapon",
  "offhand",
  "helmet",
  "neck",
  "shoulders",
  "cloak",
  "chest",
  "wrists",
  "gloves",
  "belt",
  "legs",
  "boots",
  "ring",
  "ring2",
  "trinket",
  "trinket2",
] as const;
export type Slot = (typeof SLOTS)[number];
export const SLOT_NAMES: Record<Slot, string> = {
  weapon: "Weapon",
  offhand: "Off hand",
  helmet: "Helmet",
  neck: "Necklace",
  shoulders: "Shoulders",
  cloak: "Cloak",
  chest: "Chest",
  wrists: "Wrists",
  gloves: "Gloves",
  belt: "Belt",
  legs: "Legs",
  boots: "Boots",
  ring: "Ring I",
  ring2: "Ring II",
  trinket: "Trinket I",
  trinket2: "Trinket II",
};
export type Item = {
  id: string;
  name: string;
  slot: Slot;
  attack: number;
  hp: number;
  armor: number;
  rarity: Rarity;
  weaponStyle?: import("./classes.ts").WeaponStyle;
  price: number;
};
export const SHOP: Item[] = [
  {
    id: "shop-sword",
    name: "Dawnkeeper Sword",
    slot: "weapon",
    attack: 5,
    hp: 0,
    armor: 0,
    rarity: "rare",
    price: 120,
  },
  {
    id: "shop-helm",
    name: "Dawnwatch Helm",
    slot: "helmet",
    attack: 0,
    hp: 18,
    armor: 2,
    rarity: "rare",
    price: 100,
  },
  {
    id: "shop-trinket",
    name: "Heart of a Star",
    slot: "trinket",
    attack: 3,
    hp: 12,
    armor: 0,
    rarity: "epic",
    price: 250,
  },
  {
    id: "shop-boots",
    name: "Mistwalkers",
    slot: "boots",
    attack: 2,
    hp: 15,
    armor: 2,
    rarity: "rare",
    price: 90,
  },
  {
    id: "shop-shield",
    name: "First Light Shield",
    slot: "offhand",
    attack: 0,
    hp: 15,
    armor: 3,
    rarity: "rare",
    price: 160,
  },
];

export function rollRarity(roll: number, boss: boolean): Rarity {
  if (boss)
    return roll < 0.01
      ? "legendary"
      : roll < 0.1
        ? "epic"
        : roll < 0.5
          ? "rare"
          : "uncommon";
  return roll < 0.002
    ? "legendary"
    : roll < 0.02
      ? "epic"
      : roll < 0.1
        ? "rare"
        : roll < 0.35
          ? "uncommon"
          : "common";
}
