export type Enemy = {
  id: string;
  name: string;
  art: "wolf" | "ghost" | "boss";
  hp: number;
  attack: number;
};
export type Zone = {
  id: string;
  name: string;
  subtitle: string;
  level: number;
  boss: Enemy;
  enemies: Enemy[];
  xp: number;
  gold: number;
  color: string;
  story: string;
};
/** Add another entry to add a zone, its boss and its story quest automatically. */
export const ZONES: Zone[] = [
  {
    id: "woods",
    name: "Whispering Woods",
    subtitle: "Chapter I · The missing light",
    level: 1,
    enemies: [
      { id: "wolf", name: "Mist Wolf", art: "wolf", hp: 38, attack: 5 },
      {
        id: "spirit",
        name: "Lost Forest Spirit",
        art: "ghost",
        hp: 32,
        attack: 7,
      },
      { id: "alpha", name: "Dusk Wolf", art: "wolf", hp: 46, attack: 6 },
    ],
    boss: {
      id: "rootking",
      name: "The Root King",
      art: "boss",
      hp: 190,
      attack: 10,
    },
    xp: 14,
    gold: 8,
    color: "#427769",
    story:
      "Since the sun shattered, the woods move without wind. You carry a shard of the last daylight. Find the Root King: he knows who stole the sun.",
  },
  {
    id: "ruins",
    name: "Ashen Ruins",
    subtitle: "Chapter II · Beneath the old throne",
    level: 4,
    enemies: [
      {
        id: "ashguard",
        name: "Ash Sentinel",
        art: "ghost",
        hp: 100,
        attack: 10,
      },
      { id: "ashwolf", name: "Cinder Wolf", art: "wolf", hp: 90, attack: 12 },
      {
        id: "echo",
        name: "Throne Echo",
        art: "ghost",
        hp: 115,
        attack: 9,
      },
    ],
    boss: {
      id: "ashlady",
      name: "Lady of Ash",
      art: "boss",
      hp: 500,
      attack: 20,
    },
    xp: 32,
    gold: 18,
    color: "#8c635d",
    story:
      "The Root King was a guardian. His final words lead to an ashen throne, where the Lady of Ash keeps a debt older than the kingdom.",
  },
  {
    id: "spire",
    name: "Starfall Spire",
    subtitle: "Chapter III · A shattered sky",
    level: 8,
    enemies: [
      {
        id: "wraith",
        name: "Star Wraith",
        art: "ghost",
        hp: 220,
        attack: 18,
      },
      { id: "voidwolf", name: "Void Wolf", art: "wolf", hp: 190, attack: 22 },
      {
        id: "clockguard",
        name: "Clockwork Sentinel",
        art: "ghost",
        hp: 250,
        attack: 16,
      },
    ],
    boss: {
      id: "hourdevourer",
      name: "The Hour Devourer",
      art: "boss",
      hp: 1100,
      attack: 36,
    },
    xp: 65,
    gold: 35,
    color: "#726199",
    story:
      "The Lady sacrificed the sun to stop time. Above Starfall Spire, something devours the remaining hours. Climb the tower and bring tomorrow back to Leonidas.",
  },
];
export const EPILOGUE =
  "The first light returns. Yet deep beneath the tower, a second clock still ticks. Your adventure has only just begun.";
