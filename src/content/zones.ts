export type Enemy = {
  id: string;
  name: string;
  art: "wolf" | "ghost" | "boss" | "soldier" | "golem" | "dragon";
  mechanic?: {
    name: string;
    description: string;
    every: number;
    lane: number;
    multiplier: number;
  };
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
  {
    id: "highlands",
    name: "Sundered Highlands",
    subtitle: "Chapter IV · Two banners, one dawn",
    level: 12,
    enemies: [
      {
        id: "outlaw",
        name: "Clockbound Outlaw",
        art: "soldier",
        hp: 380,
        attack: 29,
      },
      {
        id: "highlandwolf",
        name: "Ironmane Prowler",
        art: "wolf",
        hp: 340,
        attack: 32,
      },
      {
        id: "oathguard",
        name: "Hollow Oathguard",
        art: "soldier",
        hp: 420,
        attack: 27,
      },
    ],
    boss: {
      id: "oathbreaker",
      name: "Marshal of Broken Oaths",
      art: "boss",
      hp: 1750,
      attack: 43,
      mechanic: {
        name: "Bannerfall",
        description:
          "The centre lane is struck every fourth turn. Move to a flank.",
        every: 4,
        lane: 0,
        multiplier: 1.8,
      },
    },
    xp: 95,
    gold: 49,
    color: "#878756",
    story:
      "The second clock lies beyond the highlands. The Dawn Concord would dismantle it; the Umbral Pact would master it. Both agree the Clockbound army must fall. Break its marshal before the banners turn against one another.",
  },
  {
    id: "sands",
    name: "Glasswind Expanse",
    subtitle: "Chapter V · The buried hour",
    level: 16,
    enemies: [
      {
        id: "glassguard",
        name: "Glasswind Marauder",
        art: "soldier",
        hp: 580,
        attack: 39,
      },
      {
        id: "sandgolem",
        name: "Buried Runeforge",
        art: "golem",
        hp: 680,
        attack: 34,
      },
      {
        id: "mirage",
        name: "Mirage of Yesterday",
        art: "ghost",
        hp: 520,
        attack: 43,
      },
    ],
    boss: {
      id: "sandoracle",
      name: "Oracle of the Empty Hour",
      art: "boss",
      hp: 2600,
      attack: 57,
      mechanic: {
        name: "Glass Lance",
        description:
          "The left lane shatters every fourth turn. Move centre or right.",
        every: 4,
        lane: -1,
        multiplier: 1.8,
      },
    },
    xp: 140,
    gold: 70,
    color: "#b99d6b",
    story:
      "Beneath the glass desert, an oracle guards the clock’s first key. Its visions reveal a sovereign who preserved a dying kingdom by stealing its future. Claim the key before the vision becomes your fate.",
  },
  {
    id: "mire",
    name: "Hollowfen March",
    subtitle: "Chapter VI · A kingdom without breath",
    level: 20,
    enemies: [
      {
        id: "mireguard",
        name: "Pestilent Custodian",
        art: "soldier",
        hp: 850,
        attack: 52,
      },
      {
        id: "stitchling",
        name: "Mirestitched Brute",
        art: "golem",
        hp: 1000,
        attack: 47,
      },
      {
        id: "mirewraith",
        name: "Breathless Pilgrim",
        art: "ghost",
        hp: 780,
        attack: 57,
      },
    ],
    boss: {
      id: "bellkeeper",
      name: "The Hollow Bellkeeper",
      art: "golem",
      hp: 3800,
      attack: 73,
      mechanic: {
        name: "Grave Bell",
        description:
          "A plague wave hits the centre every third turn. Flank the bellkeeper.",
        every: 3,
        lane: 0,
        multiplier: 2,
      },
    },
    xp: 200,
    gold: 95,
    color: "#7e9265",
    story:
      "The frozen kingdom’s outer wards have become a mire of stolen lives. The Bellkeeper stitches each fallen soldier into a living siege engine. Silence its bell and release the road to the north.",
  },
  {
    id: "glacier",
    name: "Rimefang Reach",
    subtitle: "Chapter VII · Wings beneath the ice",
    level: 24,
    enemies: [
      {
        id: "rimewolf",
        name: "Rimefang Stalker",
        art: "wolf",
        hp: 1200,
        attack: 65,
      },
      {
        id: "frostguard",
        name: "Frostbound Dragoon",
        art: "soldier",
        hp: 1350,
        attack: 62,
      },
      {
        id: "icegolem",
        name: "Glacial Bulwark",
        art: "golem",
        hp: 1500,
        attack: 59,
      },
    ],
    boss: {
      id: "wintermaw",
      name: "Wintermaw, the Bound Tempest",
      art: "dragon",
      hp: 5300,
      attack: 92,
      mechanic: {
        name: "Rime Breath",
        description:
          "Frost breath rakes the right lane every third turn. Move left or centre.",
        every: 3,
        lane: 1,
        multiplier: 2,
      },
    },
    xp: 275,
    gold: 125,
    color: "#a8d3e4",
    story:
      "A storm dragon was chained to the glacier to keep the sovereign’s realm frozen. The Drakari hear its pain through the ice. Shatter its binding before the last warm wind disappears.",
  },
  {
    id: "citadel",
    name: "Crown of the Still Sky",
    subtitle: "Chapter VIII · Tomorrow is a choice",
    level: 28,
    enemies: [
      {
        id: "crownknight",
        name: "Stillcrown Knight",
        art: "soldier",
        hp: 1650,
        attack: 82,
      },
      {
        id: "hourwraith",
        name: "Unspent Hour",
        art: "ghost",
        hp: 1450,
        attack: 91,
      },
      {
        id: "clocktitan",
        name: "Regent’s Automaton",
        art: "golem",
        hp: 1900,
        attack: 76,
      },
    ],
    boss: {
      id: "paleregent",
      name: "Avaron, the Pale Regent",
      art: "boss",
      hp: 7400,
      attack: 116,
      mechanic: {
        name: "Hour of Ruin",
        description:
          "A time cleave strikes the centre every third turn. Flank and guard before impact.",
        every: 3,
        lane: 0,
        multiplier: 2.2,
      },
    },
    xp: 370,
    gold: 165,
    color: "#8daccd",
    story:
      "Avaron froze his people to save them from the shattered sun. Now the second clock consumes every dawn that might have been. The Concord and Pact stand together at the still throne. Defeat the Pale Regent and let the world choose its own tomorrow.",
  },
];
export const EPILOGUE =
  "The second clock falls silent. The Concord restores the roads; the Pact safeguards the memories it held. Avaron’s prisoners wake beneath a moving sky. New expeditions bring new paths, but tomorrow finally belongs to the living.";
