import React from "react";
import { View, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { RARITIES, type Rarity, type Slot } from "../content";
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
export function GearIcon({
  slot,
  rarity,
  size = 44,
}: {
  slot: Slot;
  rarity?: Rarity;
  size?: number;
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
        width={size * 0.76}
        height={size * 0.76}
        xml={`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="${paths[slot]}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
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
