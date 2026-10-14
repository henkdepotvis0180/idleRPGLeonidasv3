import {
  SLOTS,
  SLOT_NAMES,
  RARITIES,
  type Item,
  type Slot,
  type Rarity,
} from "./gear.ts";
import { ZONES } from "./zones.ts";
import type { WeaponStyle } from "./classes.ts";
const THEMES = [
  {
    name: "Briarwatch",
    material: "tempered iron and oiled leather",
    color: "#8b9d7c",
    lore: "Etched with the Root King’s living knotwork.",
  },
  {
    name: "Ashen Oath",
    material: "blackened steel and emberglass",
    color: "#b88b78",
    lore: "A vow survives even when its kingdom burns.",
  },
  {
    name: "Astral Vigil",
    material: "starsteel and violet quartz",
    color: "#a39bbf",
    lore: "Tiny constellations shift across the polished metal.",
  },
  {
    name: "Sunderguard",
    material: "brushed bronze and reinforced hide",
    color: "#bba377",
    lore: "Bears the marks of a battle fought beneath two banners.",
  },
  {
    name: "Glasswind",
    material: "sandforged steel and smoky crystal",
    color: "#c3ab7a",
    lore: "Warm to the touch, even beneath a moonless sky.",
  },
  {
    name: "Hollow Vigil",
    material: "verdigris plate and grave-silk",
    color: "#819b83",
    lore: "The bell has fallen silent. Its memory has not.",
  },
  {
    name: "Rimebound",
    material: "frostsilver and dragonhide",
    color: "#acc8d4",
    lore: "A heartbeat of winter rests beneath each rune.",
  },
  {
    name: "Stillcrown",
    material: "blue-black adamant and pale sapphire",
    color: "#91a9c5",
    lore: "Forged for a kingdom that forgot the meaning of tomorrow.",
  },
];
const NOUNS: Record<Slot, string[]> = {
  weapon: ["Edge", "Reaver", "Oath"],
  offhand: ["Bulwark", "Ward", "Aegis"],
  helmet: ["Greathelm", "Visage", "Crown"],
  neck: ["Pendant", "Gorget", "Talisman"],
  shoulders: ["Pauldrons", "Mantle", "Spaulders"],
  cloak: ["Warcloak", "Shroud", "Cape"],
  chest: ["Cuirass", "Hauberk", "Vestment"],
  wrists: ["Bracers", "Armguards", "Bindings"],
  gloves: ["Gauntlets", "Grips", "Handguards"],
  belt: ["Girdle", "Warbelt", "Clasp"],
  legs: ["Greaves", "Legguards", "Chausses"],
  boots: ["Sabatons", "Treads", "Striders"],
  ring: ["Signet", "Band", "Seal"],
  ring2: ["Loop", "Promise", "Circle"],
  trinket: ["Reliquary", "Hourglass", "Compass"],
  trinket2: ["Medallion", "Idol", "Prism"],
};
export function forgeItem(
  zone: number,
  slot: Slot,
  rarity: Rarity,
  serial: number,
  weaponStyle?: WeaponStyle,
): Item {
  const z = ZONES[zone],
    theme = THEMES[zone % THEMES.length];
  const level = z.level,
    m = RARITIES[rarity].multiplier;
  const design = Math.abs(serial) % 3;
  const armored = [
    "offhand",
    "helmet",
    "shoulders",
    "chest",
    "wrists",
    "gloves",
    "legs",
    "boots",
  ].includes(slot);
  const jewel = ["neck", "ring", "ring2", "trinket", "trinket2"].includes(slot);
  const name = `${theme.name} ${slot === "weapon" && weaponStyle ? weaponStyle[0].toUpperCase() + weaponStyle.slice(1) : NOUNS[slot][design]}`;
  return {
    id: `forged-${zone}-${slot}-${serial}`,
    name,
    slot,
    rarity,
    weaponStyle,
    attack: Math.round(
      (slot === "weapon" ? 3 + zone * 3 : jewel ? 1 + zone : 0) * m,
    ),
    hp: slot === "weapon" ? 0 : Math.round((5 + zone * 6) * m),
    armor: armored ? Math.round((1 + zone) * m) : 0,
    price: 8 + zone * 8 + Math.round(m * 3),
    requiredLevel: level,
    itemLevel: level * 3 + Math.round(m * 4),
    description: `${theme.lore} ${design === 0 ? "Fine grooves catch the light along its edges." : design === 1 ? "A maker’s seal rests beneath the central setting." : "Worn edges reveal layers of careful handwork."}`,
    origin: z.name,
    material: theme.material,
    tint: theme.color,
    design,
    critical: jewel && ["rare", "epic", "legendary"].includes(rarity) ? 1 : 0,
    vitality:
      slot.includes("trinket") && ["epic", "legendary"].includes(rarity)
        ? 1
        : 0,
  };
}
/** 128 handcrafted combinations, three visual designs each, five independent rarity tiers. */
export const CATALOG: Item[] = ZONES.flatMap((z, zone) =>
  SLOTS.map((slot, index) => ({
    ...forgeItem(zone, slot, zone > 4 ? "rare" : "uncommon", index),
    id: `vendor-${z.id}-${slot}`,
    price: 65 + zone * 75 + (slot === "weapon" ? 45 : 0),
  })),
);
export function itemSummary(item: Item) {
  return `${RARITIES[item.rarity].name} ${SLOT_NAMES[item.slot]} · Item level ${item.itemLevel ?? 1}`;
}
