/** Original world modules. IDs are save-stable; extend these tables without engine changes. */
export const RACES = [
  {
    id: "human",
    name: "Valeborn",
    description: "Adaptable descendants of the first daylight keepers.",
    scale: [1, 1, 1],
    skin: null,
  },
  {
    id: "elf",
    name: "Sylvaren",
    description: "Long-eared wardens who hear the memory of living forests.",
    scale: [0.9, 1.08, 0.94],
    skin: null,
  },
  {
    id: "dwarf",
    name: "Stonekin",
    description:
      "Broad, resilient mountain folk with a tradition of runeforging.",
    scale: [1.18, 0.82, 1.12],
    skin: null,
  },
  {
    id: "orc",
    name: "Emberbound",
    description: "Tusked wanderers marked by the fire beneath the broken sun.",
    scale: [1.13, 1.04, 1.08],
    skin: "#819078",
  },
  {
    id: "revenant",
    name: "Veilborn",
    description: "Returned souls who chose free will over the second clock.",
    scale: [0.92, 1.03, 0.95],
    skin: "#a1b2bd",
  },
  {
    id: "draconid",
    name: "Drakari",
    description:
      "Horned heirs of the storm dragons, sworn to protect mortal time.",
    scale: [1.08, 1.07, 1.06],
    skin: "#a28b79",
  },
] as const;
export const FACTIONS = [
  {
    id: "concord",
    name: "Dawn Concord",
    color: "#e5bf76",
    motto: "Let tomorrow belong to everyone.",
    description:
      "A coalition rebuilding the sun through trust, living roots and honest craft. They fear the second clock will imprison the world again.",
  },
  {
    id: "pact",
    name: "Umbral Pact",
    color: "#b5a5e8",
    motto: "Remember the night. Master the hour.",
    description:
      "Exiles and returned souls who preserve forbidden chronomancy. They believe a controlled second clock can shelter the world from oblivion.",
  },
] as const;
export type RaceId = (typeof RACES)[number]["id"];
export type FactionId = (typeof FACTIONS)[number]["id"];
export const COMPANIONS = [
  {
    id: "moss",
    name: "Mossfang",
    role: "Guardian",
    kind: "wolf",
    price: 180,
    level: 1,
    attack: 2,
    heal: 0,
    armor: 1,
    color: "#819a78",
    story:
      "A rescued forest hound. Fights beside you and takes the edge off incoming blows.",
  },
  {
    id: "lumen",
    name: "Lumen Wisp",
    role: "Healer",
    kind: "wisp",
    price: 300,
    level: 3,
    attack: 0,
    heal: 4,
    armor: 0,
    color: "#e9ce8b",
    story:
      "A fragment of the old sun. Restores 4 health every fourth combat turn.",
  },
  {
    id: "rivet",
    name: "Rivet-7",
    role: "Artillery",
    kind: "construct",
    price: 420,
    level: 5,
    attack: 5,
    heal: 0,
    armor: 0,
    color: "#bc9466",
    story: "An abandoned clockwork scout, rebuilt without its obedience gear.",
  },
  {
    id: "vesper",
    name: "Vesper Raven",
    role: "Striker",
    kind: "raven",
    price: 580,
    level: 8,
    attack: 7,
    heal: 0,
    armor: 0,
    color: "#8c83b3",
    story: "A clever raven carrying messages between the two rival factions.",
  },
  {
    id: "aegis",
    name: "Aegis Sentinel",
    role: "Defender",
    kind: "construct",
    price: 800,
    level: 12,
    attack: 3,
    heal: 0,
    armor: 5,
    color: "#829eaf",
    story:
      "Once bound to the Ashen throne; now a shield for anyone who needs one.",
  },
  {
    id: "rime",
    name: "Rimecub",
    role: "Vanguard",
    kind: "wolf",
    price: 1100,
    level: 16,
    attack: 8,
    heal: 0,
    armor: 3,
    color: "#bad4de",
    story: "A young frost beast freed from the Pale Regent’s kennels.",
  },
] as const;
export const STANCES = [
  {
    id: "balanced",
    name: "Balanced",
    attack: 1,
    incoming: 1,
    description: "Reliable damage and defence.",
  },
  {
    id: "assault",
    name: "Assault",
    attack: 1.2,
    incoming: 1.2,
    description: "+20% damage dealt and received.",
  },
  {
    id: "guard",
    name: "Guard",
    attack: 0.85,
    incoming: 0.7,
    description: "−15% damage dealt, −30% damage received.",
  },
] as const;
export type Stance = (typeof STANCES)[number]["id"];
export const BIOMES = [
  {
    ground: "#394d37",
    sky: "#7d9695",
    fog: "#7a9490",
    stone: "#777d70",
    leaf: "#304d37",
    type: "forest",
  },
  {
    ground: "#50413a",
    sky: "#9f8574",
    fog: "#a58d79",
    stone: "#79716b",
    leaf: "#574b3d",
    type: "ruins",
  },
  {
    ground: "#444556",
    sky: "#737a98",
    fog: "#7e829d",
    stone: "#737b91",
    leaf: "#6b6283",
    type: "crystal",
  },
  {
    ground: "#666343",
    sky: "#a7b7b3",
    fog: "#aab7a0",
    stone: "#908a70",
    leaf: "#5b6542",
    type: "plains",
  },
  {
    ground: "#857356",
    sky: "#bda98c",
    fog: "#b8a184",
    stone: "#9d886c",
    leaf: "#7b704e",
    type: "desert",
  },
  {
    ground: "#454e40",
    sky: "#899a87",
    fog: "#8b9b88",
    stone: "#6c7769",
    leaf: "#465447",
    type: "plague",
  },
  {
    ground: "#a3b8be",
    sky: "#9eb7c2",
    fog: "#afc6ce",
    stone: "#798f9d",
    leaf: "#c0d1d2",
    type: "snow",
  },
  {
    ground: "#626e7d",
    sky: "#6f859a",
    fog: "#7e92a8",
    stone: "#4f6275",
    leaf: "#9bbac9",
    type: "citadel",
  },
] as const;
export type WorldNode = {
  id: string;
  x: number;
  z: number;
  kind: "enemy" | "elite" | "boss" | "camp" | "cache";
  level: number;
  name: string;
  enemyIndex: number;
};
/** Stable seeded generation: same region + expedition produces the same discoverable sites. */
export function generateRegion(
  zone: number,
  run: number,
  level: number,
  enemyCount = 3,
): WorldNode[] {
  let seed = (((zone + 1) * 73856093) ^ (run * 19349663)) >>> 0;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const names = [
    "Broken Crossing",
    "Watchers’ Hollow",
    "Forgotten Shrine",
    "Old War Road",
    "Silent Orchard",
    "Moonlit Cairn",
    "Pilgrim’s Rest",
    "Ruined Beacon",
    "Sunken Gate",
    "Windward Ridge",
    "Ashen Clearing",
    "Last Watch",
  ];
  const nodes: WorldNode[] = [
    {
      id: "camp",
      x: 0,
      z: 7,
      kind: "camp",
      level,
      name: "Wayfarer Camp",
      enemyIndex: 0,
    },
  ];
  for (let i = 0; i < 12; i++) {
    const col = i % 4,
      row = Math.floor(i / 4);
    const kind =
      i === 5 ? "cache" : i === 9 ? "camp" : i % 4 === 3 ? "elite" : "enemy";
    nodes.push({
      id: `site-${i}`,
      x: -6.6 + col * 4.4 + (random() - 0.5) * 1.2,
      z: 4 - row * 4.4 + (random() - 0.5),
      kind,
      level: level + (kind === "elite" ? 1 : 0),
      name: names[(i + zone * 3) % names.length],
      enemyIndex: Math.floor(random() * Math.max(1, enemyCount)),
    });
  }
  nodes.push({
    id: "boss",
    x: 0,
    z: -8,
    kind: "boss",
    level,
    name: "Sovereign’s Gate",
    enemyIndex: 0,
  });
  return nodes;
}
