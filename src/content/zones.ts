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
    name: "Het Fluisterwoud",
    subtitle: "Hoofdstuk I · Het verdwenen licht",
    level: 1,
    enemies: [
      { id: "wolf", name: "Mistwolf", art: "wolf", hp: 38, attack: 5 },
      {
        id: "spirit",
        name: "Verdwaalde bosgeest",
        art: "ghost",
        hp: 32,
        attack: 7,
      },
      { id: "alpha", name: "Schemerwolf", art: "wolf", hp: 46, attack: 6 },
    ],
    boss: {
      id: "rootking",
      name: "De Wortelkoning",
      art: "boss",
      hp: 190,
      attack: 10,
    },
    xp: 14,
    gold: 8,
    color: "#427769",
    story:
      "Sinds de zon brak, bewegen de wouden zonder wind. Jij draagt een splinter van het laatste daglicht. Vind de Wortelkoning: hij weet wie de zon heeft gestolen.",
  },
  {
    id: "ruins",
    name: "Asgrauwe Ruïnes",
    subtitle: "Hoofdstuk II · Onder de oude troon",
    level: 4,
    enemies: [
      { id: "ashguard", name: "Aswachter", art: "ghost", hp: 100, attack: 10 },
      { id: "ashwolf", name: "Roetwolf", art: "wolf", hp: 90, attack: 12 },
      {
        id: "echo",
        name: "Echo van de troon",
        art: "ghost",
        hp: 115,
        attack: 9,
      },
    ],
    boss: {
      id: "ashlady",
      name: "Vrouwe van As",
      art: "boss",
      hp: 500,
      attack: 20,
    },
    xp: 32,
    gold: 18,
    color: "#8c635d",
    story:
      "De Wortelkoning was een bewaker. Zijn laatste woorden wijzen naar de asgrauwe troon. Vrouwe van As bewaart daar een schuld die ouder is dan het koninkrijk.",
  },
  {
    id: "spire",
    name: "De Sterrentoren",
    subtitle: "Hoofdstuk III · Een gebroken hemel",
    level: 8,
    enemies: [
      {
        id: "wraith",
        name: "Sterrenwraith",
        art: "ghost",
        hp: 220,
        attack: 18,
      },
      { id: "voidwolf", name: "Leegtewolf", art: "wolf", hp: 190, attack: 22 },
      {
        id: "clockguard",
        name: "Klokkenwachter",
        art: "ghost",
        hp: 250,
        attack: 16,
      },
    ],
    boss: {
      id: "hourdevourer",
      name: "De Uurverslinder",
      art: "boss",
      hp: 1100,
      attack: 36,
    },
    xp: 65,
    gold: 35,
    color: "#726199",
    story:
      "De Vrouwe offerde de zon om de tijd stil te zetten. Boven de Sterrentoren eet iets nu de overgebleven uren. Klim omhoog en geef Leonidas zijn morgen terug.",
  },
];
export const EPILOGUE =
  "Het eerste licht keert terug. Toch tikt er diep onder de toren nog een tweede klok. Je avontuur is pas begonnen.";
