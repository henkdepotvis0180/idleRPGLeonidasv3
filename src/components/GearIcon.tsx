import React from "react";
import { View, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { RARITIES, type Rarity, type Slot, type Item } from "../content";
const paths: Record<Slot, string> = {
  weapon: "M14 45L43 10 49 7 47 15 20 49M12 34l15 14M9 47l6 6",
  offhand: "M32 7L51 15V33Q48 47 32 56 16 47 13 33V15ZM32 17V45M21 28H43",
  helmet:
    "M12 38V28Q12 8 32 8T52 28V38H44V26H20V38ZM20 42H44M26 26V39M38 26V39",
  neck: "M12 10Q10 44 32 48 54 44 52 10M32 38L42 48 32 58 22 48Z",
  shoulders:
    "M7 22L21 13 31 22 43 13 57 22 51 36 39 29 32 36 24 29 13 36ZM10 24L20 20M45 20L53 24",
  cloak: "M24 8H40L53 54 32 48 11 54ZM24 8Q32 19 40 8",
  chest:
    "M21 10L12 17 6 30 17 35 19 54H45L47 35 58 30 52 17 43 10 32 18ZM24 29H40M24 38H40",
  wrists: "M20 9L44 9 47 52 17 52ZM19 20H45M18 40H46",
  gloves:
    "M19 36V14Q23 9 27 14V29 9Q31 5 35 9V29 13Q39 9 43 13V30 19Q47 15 51 20V42Q51 55 32 55L17 45 10 32Q12 25 18 31Z",
  belt: "M7 24H57V43H7ZM24 19H40V48H24ZM32 28V39H45",
  legs: "M16 8H48L51 55H36L32 29 28 55H13ZM17 17H47",
  boots: "M13 10H29V38L34 43V54H9V43L13 38ZM38 10H53V37L59 43V54H36V42L38 38Z",
  ring: "M18 31Q7 50 24 56 45 62 48 43 48 35 43 30M22 24L32 10 44 24 33 37Z",
  ring2: "M18 31Q7 50 24 56 45 62 48 43 48 35 43 30M22 24L32 10 44 24 33 37Z",
  trinket:
    "M32 5L39 23 58 25 43 37 47 56 32 45 17 56 21 37 6 25 25 23ZM32 23V38M26 31H39",
  trinket2:
    "M32 8Q53 15 48 35L32 56 16 35Q11 15 32 8ZM32 17L40 31 32 44 24 31Z",
};
function weaponPath(style?: Item["weaponStyle"]) {
  const weapons: Record<string, string> = {
    bow: "M19 9Q57 32 19 55M19 9V55M12 32H52M46 26L53 32 46 38",
    staff: "M20 56L39 15M32 11L42 5 49 16 39 24ZM25 38L32 41",
    wand: "M17 54L43 19M38 15L45 7 53 15 45 24Z",
    hammer: "M16 55L39 23M28 12L37 3 58 24 49 34ZM32 15L46 29",
    axe: "M15 55L44 10M32 16Q42 29 57 25L54 45Q34 43 26 24Z",
    scythe: "M20 57L32 12M30 10Q53 6 59 31L43 21 32 22",
    fists:
      "M13 34L22 16 39 12 52 22 53 42 35 55 19 49ZM22 25L44 21M20 35L46 30M26 44L45 39",
    lute: "M23 35L42 10 48 13 34 41Q36 55 20 56 6 49 15 37ZM20 42L31 46M39 13L49 20",
    dagger: "M14 51L28 34 31 20 52 8 43 29 29 35M18 32L34 47",
  };
  return weapons[style ?? "sword"] ?? paths.weapon;
}
export function GearIcon({
  slot,
  rarity,
  size = 44,
  item,
}: {
  slot: Slot;
  rarity?: Rarity;
  size?: number;
  item?: Item;
}) {
  const color = rarity ? RARITIES[rarity].color : "#748599";
  return (
    <View
      accessibilityLabel={`${rarity ?? "empty"} ${slot} icon`}
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderColor: color,
          backgroundColor: rarity ? `${color}18` : "#202d3e",
        },
      ]}
    >
      <SvgXml
        width={size * 0.87}
        height={size * 0.87}
        xml={`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f4ede1"/><stop offset=".3" stop-color="${item?.tint ?? "#9caeb8"}"/><stop offset=".51" stop-color="#e5dfcb"/><stop offset=".62" stop-color="${item?.tint ?? "#71828b"}"/><stop offset="1" stop-color="#3c4953"/></linearGradient>
            <radialGradient id="glow"><stop stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
          </defs>
          <circle cx="32" cy="32" r="30" fill="url(#glow)"/>
          <path d="M5 12V5H12M52 5H59V12M59 52V59H52M12 59H5V52" stroke="${color}" stroke-opacity=".45" fill="none"/>
          <path d="${slot === "weapon" ? weaponPath(item?.weaponStyle) : paths[slot]}" fill="${["weapon", "neck", "ring", "ring2"].includes(slot) ? "none" : "url(#metal)"}" fill-opacity=".7" stroke="#101b25" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" transform="translate(1 2)"/>
          <path d="${slot === "weapon" ? weaponPath(item?.weaponStyle) : paths[slot]}" fill="${["weapon", "neck", "ring", "ring2"].includes(slot) ? "none" : "url(#metal)"}" fill-opacity=".85" stroke="url(#metal)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M${27 + (item?.design ?? 0) * 2} 30L32 25 37 30 32 35Z" fill="${color}" stroke="#fff0c3" stroke-width=".6"/>
          <path d="M14 49L19 44M44 19L48 15M22 43L25 40" stroke="#fff6de" stroke-opacity=".5" stroke-width=".8"/>
          ${item?.rarity === "legendary" ? '<path d="M27 6L32 2 37 6 32 10Z" fill="#ffbd65"/>' : ""}
        </svg>`}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  frame: {
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
