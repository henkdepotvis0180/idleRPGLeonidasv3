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
  weapon: "Wapen",
  offhand: "Schild / offhand",
  helmet: "Helm",
  neck: "Halsketting",
  shoulders: "Schouders",
  cloak: "Mantel",
  chest: "Borst",
  wrists: "Polsen",
  gloves: "Handschoenen",
  belt: "Riem",
  legs: "Broek",
  boots: "Laarzen",
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
  rarity: "common" | "rare" | "epic";
  price: number;
};
export const SHOP: Item[] = [
  {
    id: "shop-sword",
    name: "Zonwachters zwaard",
    slot: "weapon",
    attack: 8,
    hp: 0,
    armor: 0,
    rarity: "rare",
    price: 120,
  },
  {
    id: "shop-helm",
    name: "Helm van de dageraad",
    slot: "helmet",
    attack: 0,
    hp: 35,
    armor: 3,
    rarity: "rare",
    price: 100,
  },
  {
    id: "shop-trinket",
    name: "Hart van een ster",
    slot: "trinket",
    attack: 5,
    hp: 20,
    armor: 0,
    rarity: "epic",
    price: 250,
  },
  {
    id: "shop-boots",
    name: "Mistwandelaars",
    slot: "boots",
    attack: 2,
    hp: 15,
    armor: 2,
    rarity: "rare",
    price: 90,
  },
  {
    id: "shop-shield",
    name: "Schild van het eerste licht",
    slot: "offhand",
    attack: 0,
    hp: 15,
    armor: 5,
    rarity: "rare",
    price: 160,
  },
];
