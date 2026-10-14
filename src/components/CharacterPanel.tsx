import React from "react";
import { Pressable, Text, View } from "react-native";
import { BattleScene } from "./BattleScene";
import { Button, Card, ui } from "./UI";
import { GearIcon } from "./GearIcon";
import { CLASSES, classFor, RARITIES, SLOTS, SLOT_NAMES } from "../content";
import {
  ACCENT_COLORS,
  HAIR_COLORS,
  HAIR_STYLES,
  SKIN_TONES,
  type Appearance,
} from "../appearance";
import { customize, switchClass, unequip, type State } from "../engine";
export function CharacterPanel({
  state,
  act,
  active,
}: {
  state: State;
  act: (fn: (s: State) => State) => void;
  active: boolean;
}) {
  const swatches = (title: string, key: keyof Appearance, colors: string[]) => (
    <View style={{ gap: 8 }}>
      <Text style={ui.small}>{title}</Text>
      <View style={ui.wrap}>
        {colors.map((color, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={`${title} ${i + 1}`}
            onPress={() => act((s) => customize(s, key, i))}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: color,
              borderWidth: state.appearance[key] === i ? 3 : 1,
              borderColor: state.appearance[key] === i ? "#fff3d5" : "#627088",
            }}
          />
        ))}
      </View>
    </View>
  );
  return (
    <>
      <Text style={ui.heading}>Your hero</Text>
      <Text style={ui.body}>
        Your equipped items appear on your hero in the wardrobe and in battle.
        Jewelry adds small gemstone details.
      </Text>
      <BattleScene state={state} running={false} preview active={active} />
      <Card>
        <Text style={ui.subheading}>Appearance</Text>
        {swatches("Skin tone", "skin", SKIN_TONES)}
        {swatches("Hair color", "hair", HAIR_COLORS)}
        {swatches("Outfit accent", "accent", ACCENT_COLORS)}
        <Text style={ui.small}>Hair style</Text>
        <View style={ui.wrap}>
          {HAIR_STYLES.map((name, i) => (
            <Button
              key={name}
              label={name}
              secondary={state.appearance.style !== i}
              onPress={() => act((s) => customize(s, "style", i))}
            />
          ))}
        </View>
        <Text style={ui.small}>Face</Text>
        <View style={ui.wrap}>
          {["Bright", "Spectacles", "Smile"].map((name, i) => (
            <Button
              key={name}
              label={name}
              secondary={state.appearance.face !== i}
              onPress={() => act((s) => customize(s, "face", i))}
            />
          ))}
        </View>
      </Card>
      <Text style={ui.heading}>16 gear slots</Text>
      <Text style={ui.small}>
        White · green · blue · purple · orange rarity borders. Armor mitigation
        is capped at 60%.
      </Text>
      <View style={ui.grid}>
        {SLOTS.map((slot) => {
          const item = state.gear[slot];
          return (
            <Card
              key={slot}
              color={item ? RARITIES[item.rarity].color : undefined}
              style={ui.slot}
            >
              <GearIcon slot={slot} rarity={item?.rarity} />
              <Text style={ui.eyebrow}>{SLOT_NAMES[slot]}</Text>
              <Text
                style={[
                  ui.body,
                  item && { color: RARITIES[item.rarity].color },
                ]}
              >
                {item?.name ?? "Empty slot"}
              </Text>
              {item && (
                <>
                  <Text style={ui.small}>
                    +{item.attack} ATK · +{item.hp} HP · +{item.armor} ARM
                  </Text>
                  <Button
                    label={`Unequip ${SLOT_NAMES[slot]}`}
                    secondary
                    disabled={state.inventory.length >= state.bags * 12}
                    onPress={() => act((s) => unequip(s, slot))}
                  />
                </>
              )}
            </Card>
          );
        })}
      </View>
      <Card>
        <Text style={ui.subheading}>Class hall</Text>
        <Text style={ui.body}>
          Try all 14 classes. Changing class starts a fresh run, clears
          cooldowns and adapts weapon visuals. Your gear, gold, quests and level
          remain.
        </Text>
        <View style={ui.wrap}>
          {CLASSES.map((c) => (
            <Button
              key={c.id}
              label={c.archetype}
              disabled={state.classId === c.id}
              secondary
              onPress={() => act((s) => switchClass(s, c.id))}
            />
          ))}
        </View>
        <Text style={ui.gold}>Current: {classFor(state.classId).name}</Text>
      </Card>
    </>
  );
}
