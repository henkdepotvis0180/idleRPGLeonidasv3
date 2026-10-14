export type WeaponStyle =
  | "sword"
  | "dagger"
  | "staff"
  | "bow"
  | "hammer"
  | "axe"
  | "fists"
  | "lute"
  | "wand"
  | "scythe";
export type SpellEffect =
  | "steel"
  | "fire"
  | "frost"
  | "nature"
  | "holy"
  | "shadow"
  | "arcane"
  | "lightning"
  | "song";
export type Ability = {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  damage?: number;
  heal?: number;
  shield?: number;
  dot?: number;
  stun?: number;
  form?: "bear" | "wolf";
  duration?: number;
  effect: SpellEffect;
};
export type HeroClass = {
  id: string;
  name: string;
  archetype: string;
  icon: string;
  description: string;
  attack: number;
  hp: number;
  color: string;
  weapon: WeaponStyle;
  shield: boolean;
  abilities: Ability[];
};
export const CLASSES: HeroClass[] = [
  {
    id: "warrior",
    name: "Bastion",
    archetype: "Warrior",
    icon: "⚔",
    description: "A steadfast guardian who turns steel into shelter.",
    attack: 12,
    hp: 140,
    color: "#619cca",
    weapon: "sword",
    shield: true,
    abilities: [
      {
        id: "shield-bash",
        name: "Shield Bash",
        description: "Strike for 160% attack and interrupt one enemy turn.",
        cooldown: 9,
        damage: 1.6,
        stun: 1,
        effect: "steel",
      },
      {
        id: "iron-wall",
        name: "Iron Wall",
        description: "Absorb damage equal to 24% max HP for four turns.",
        cooldown: 14,
        shield: 0.24,
        duration: 4,
        effect: "steel",
      },
    ],
  },
  {
    id: "mage",
    name: "Starweaver",
    archetype: "Mage",
    icon: "✦",
    description: "A stargazer who shapes embers and falling frost.",
    attack: 18,
    hp: 90,
    color: "#a78ee8",
    weapon: "staff",
    shield: false,
    abilities: [
      {
        id: "ember-lance",
        name: "Ember Lance",
        description: "Deal 220% attack as fire damage.",
        cooldown: 8,
        damage: 2.2,
        effect: "fire",
      },
      {
        id: "frost-nova",
        name: "Frost Nova",
        description: "Deal 120% attack and freeze one enemy turn.",
        cooldown: 12,
        damage: 1.2,
        stun: 1,
        effect: "frost",
      },
    ],
  },
  {
    id: "rogue",
    name: "Duskblade",
    archetype: "Rogue",
    icon: "◈",
    description: "An agile treasure hunter with a venomous edge.",
    attack: 15,
    hp: 110,
    color: "#b58bd5",
    weapon: "dagger",
    shield: false,
    abilities: [
      {
        id: "venom-edge",
        name: "Venom Edge",
        description: "Deal 100% attack, then 30% each turn for four turns.",
        cooldown: 10,
        damage: 1,
        dot: 0.3,
        duration: 4,
        effect: "nature",
      },
      {
        id: "smoke-step",
        name: "Smoke Step",
        description: "Strike for 120% attack and evade one enemy turn.",
        cooldown: 11,
        damage: 1.2,
        stun: 1,
        effect: "shadow",
      },
    ],
  },
  {
    id: "bard",
    name: "Clockbinder",
    archetype: "Bard",
    icon: "♫",
    description: "A wandering musician whose songs mend the broken dawn.",
    attack: 14,
    hp: 120,
    color: "#e0ad68",
    weapon: "lute",
    shield: false,
    abilities: [
      {
        id: "resonant-chord",
        name: "Resonant Chord",
        description: "Deal 170% attack as a resonating wave.",
        cooldown: 8,
        damage: 1.7,
        effect: "song",
      },
      {
        id: "mending-ballad",
        name: "Mending Ballad",
        description: "Restore 20% max HP.",
        cooldown: 14,
        heal: 0.2,
        effect: "song",
      },
    ],
  },
  {
    id: "paladin",
    name: "Dawnwarden",
    archetype: "Paladin",
    icon: "✧",
    description: "An oathbound knight carrying the last light.",
    attack: 12,
    hp: 145,
    color: "#efc86c",
    weapon: "hammer",
    shield: true,
    abilities: [
      {
        id: "dawn-smite",
        name: "Dawn Smite",
        description: "Deal 180% attack in radiant damage.",
        cooldown: 9,
        damage: 1.8,
        effect: "holy",
      },
      {
        id: "radiant-aegis",
        name: "Radiant Aegis",
        description:
          "Heal 10% max HP and gain a 14% HP barrier for four turns.",
        cooldown: 15,
        heal: 0.1,
        shield: 0.14,
        duration: 4,
        effect: "holy",
      },
    ],
  },
  {
    id: "ranger",
    name: "Thornstrider",
    archetype: "Ranger",
    icon: "➶",
    description: "A patient archer who binds prey with living thorns.",
    attack: 16,
    hp: 105,
    color: "#72b98b",
    weapon: "bow",
    shield: false,
    abilities: [
      {
        id: "piercing-arrow",
        name: "Piercing Arrow",
        description: "Fire a shot dealing 210% attack.",
        cooldown: 9,
        damage: 2.1,
        effect: "steel",
      },
      {
        id: "binding-vines",
        name: "Binding Vines",
        description: "Deal 80% attack and root one enemy turn.",
        cooldown: 12,
        damage: 0.8,
        stun: 1,
        effect: "nature",
      },
    ],
  },
  {
    id: "cleric",
    name: "Lightkeeper",
    archetype: "Cleric",
    icon: "✚",
    description: "A gentle healer whose prayers can also burn.",
    attack: 13,
    hp: 125,
    color: "#f3df9b",
    weapon: "staff",
    shield: false,
    abilities: [
      {
        id: "sacred-bolt",
        name: "Sacred Bolt",
        description: "Deal 170% attack in holy damage.",
        cooldown: 8,
        damage: 1.7,
        effect: "holy",
      },
      {
        id: "renewal",
        name: "Renewal",
        description: "Restore 26% max HP.",
        cooldown: 16,
        heal: 0.26,
        effect: "holy",
      },
    ],
  },
  {
    id: "warlock",
    name: "Riftcaller",
    archetype: "Warlock",
    icon: "☽",
    description: "A pact mage trading certainty for forbidden power.",
    attack: 17,
    hp: 100,
    color: "#bd76c9",
    weapon: "wand",
    shield: false,
    abilities: [
      {
        id: "rift-hex",
        name: "Rift Hex",
        description: "Deal 100% attack, then 35% each turn for four turns.",
        cooldown: 11,
        damage: 1,
        dot: 0.35,
        duration: 4,
        effect: "shadow",
      },
      {
        id: "drain-essence",
        name: "Drain Essence",
        description: "Deal 120% attack and restore 12% max HP.",
        cooldown: 13,
        damage: 1.2,
        heal: 0.12,
        effect: "shadow",
      },
    ],
  },
  {
    id: "monk",
    name: "Cloudfist",
    archetype: "Monk",
    icon: "◎",
    description: "A calm martial artist moving with the mountain wind.",
    attack: 15,
    hp: 115,
    color: "#69c7bf",
    weapon: "fists",
    shield: false,
    abilities: [
      {
        id: "twin-strike",
        name: "Twin Strike",
        description: "Release a focused flurry for 200% attack.",
        cooldown: 9,
        damage: 2,
        effect: "steel",
      },
      {
        id: "still-water",
        name: "Still Water",
        description:
          "Heal 15% max HP and gain a 10% HP barrier for three turns.",
        cooldown: 14,
        heal: 0.15,
        shield: 0.1,
        duration: 3,
        effect: "nature",
      },
    ],
  },
  {
    id: "shaman",
    name: "Stormspeaker",
    archetype: "Shaman",
    icon: "ϟ",
    description: "A keeper of storms and ancient earth spirits.",
    attack: 15,
    hp: 120,
    color: "#69b7e1",
    weapon: "hammer",
    shield: false,
    abilities: [
      {
        id: "storm-bolt",
        name: "Storm Bolt",
        description: "Deal 190% attack as lightning damage.",
        cooldown: 8,
        damage: 1.9,
        effect: "lightning",
      },
      {
        id: "earth-ward",
        name: "Earth Ward",
        description: "Absorb damage equal to 22% max HP for four turns.",
        cooldown: 13,
        shield: 0.22,
        duration: 4,
        effect: "nature",
      },
    ],
  },
  {
    id: "berserker",
    name: "Ashreaver",
    archetype: "Berserker",
    icon: "✹",
    description: "A fearless axe fighter tempered by the ashlands.",
    attack: 17,
    hp: 115,
    color: "#e48c73",
    weapon: "axe",
    shield: false,
    abilities: [
      {
        id: "crushing-blow",
        name: "Crushing Blow",
        description: "Deal 230% attack with a heavy axe swing.",
        cooldown: 10,
        damage: 2.3,
        effect: "steel",
      },
      {
        id: "blood-fury",
        name: "Blood Fury",
        description: "Deal 130% attack and restore 10% max HP.",
        cooldown: 13,
        damage: 1.3,
        heal: 0.1,
        effect: "fire",
      },
    ],
  },
  {
    id: "artificer",
    name: "Gearwright",
    archetype: "Artificer",
    icon: "⚙",
    description: "An inventor armed with unstable crystal technology.",
    attack: 14,
    hp: 125,
    color: "#d7aa70",
    weapon: "wand",
    shield: false,
    abilities: [
      {
        id: "arc-charge",
        name: "Arc Charge",
        description: "Discharge a crystal blast for 200% attack.",
        cooldown: 9,
        damage: 2,
        effect: "arcane",
      },
      {
        id: "field-repair",
        name: "Field Repair",
        description:
          "Heal 15% max HP and gain a 12% HP barrier for four turns.",
        cooldown: 15,
        heal: 0.15,
        shield: 0.12,
        duration: 4,
        effect: "arcane",
      },
    ],
  },
  {
    id: "shapeshifter",
    name: "Wildheart",
    archetype: "Shapeshifter",
    icon: "❋",
    description: "A wild guardian who becomes fang, fur and forest.",
    attack: 14,
    hp: 130,
    color: "#b39b68",
    weapon: "staff",
    shield: false,
    abilities: [
      {
        id: "feral-pounce",
        name: "Feral Pounce",
        description: "Become a wolf for five turns and strike for 200% attack.",
        cooldown: 10,
        damage: 2,
        form: "wolf",
        duration: 5,
        effect: "nature",
      },
      {
        id: "bear-form",
        name: "Bear Form",
        description: "Become a bear for six turns and gain a 25% HP barrier.",
        cooldown: 15,
        shield: 0.25,
        form: "bear",
        duration: 6,
        effect: "nature",
      },
    ],
  },
  {
    id: "necromancer",
    name: "Gravewhisper",
    archetype: "Necromancer",
    icon: "☠",
    description:
      "A soulbinder who bends spectral echoes to protect the living.",
    attack: 16,
    hp: 110,
    color: "#83baa1",
    weapon: "scythe",
    shield: false,
    abilities: [
      {
        id: "soul-scythe",
        name: "Soul Scythe",
        description: "Deal 180% attack as spectral damage.",
        cooldown: 8,
        damage: 1.8,
        effect: "shadow",
      },
      {
        id: "bone-ward",
        name: "Bone Ward",
        description:
          "Gain a 15% HP barrier and curse for 25% attack over four turns.",
        cooldown: 14,
        shield: 0.15,
        dot: 0.25,
        duration: 4,
        effect: "shadow",
      },
    ],
  },
];
export const classFor = (id: string) =>
  CLASSES.find((c) => c.id === id) ?? CLASSES[0];
