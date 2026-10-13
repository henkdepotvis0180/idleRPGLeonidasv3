export * from "./content/gear.ts";
export * from "./content/zones.ts";
export * from "./content/quests.ts";
export const CLASSES = [
  {
    id: "warrior",
    name: "Bastion",
    archetype: "Warrior",
    icon: "⚔",
    description: "Een schildwachter die de vergeten zon beschermt.",
    attack: 12,
    hp: 140,
  },
  {
    id: "mage",
    name: "Sterrenwever",
    archetype: "Mage",
    icon: "✦",
    description: "Vlecht gevallen sterren tot vernietigende spreuken.",
    attack: 18,
    hp: 90,
  },
  {
    id: "rogue",
    name: "Schemermes",
    archetype: "Rogue",
    icon: "◈",
    description: "Een schaduwloper die relieken uit de mist rooft.",
    attack: 15,
    hp: 110,
  },
  {
    id: "bard",
    name: "Klokkenbinder",
    archetype: "Bard / artificer",
    icon: "⌛",
    description: "Een reiziger met een mechanisch hart en verboden liederen.",
    attack: 14,
    hp: 120,
  },
] as const;
