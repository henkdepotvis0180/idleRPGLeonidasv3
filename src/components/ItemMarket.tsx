import React, { useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import {
  CATALOG,
  ZONES,
  SLOTS,
  SLOT_NAMES,
  type Item,
  type Slot,
} from "../content";
import type { State } from "../engine";
import { Button, ui } from "./UI";
export function ItemMarket({
  state,
  itemCard,
}: {
  state: State;
  itemCard: (item: Item, shop?: boolean) => ReactNode;
}) {
  const [region, setRegion] = useState(state.zone),
    [slot, setSlot] = useState<Slot | null>(null);
  const items = CATALOG.filter(
    (i) => i.origin === ZONES[region].name && (!slot || i.slot === slot),
  );
  return (
    <>
      <Text style={ui.heading}>Regional armoury</Text>
      <Text style={ui.small}>
        128 regional pieces, five rarity tiers and three forged designs. Loot
        draws from each region’s materials, history and equipment styles.
        Purchases require the region’s level.
      </Text>
      <View style={ui.wrap}>
        {ZONES.map((z, i) => (
          <Button
            key={z.id}
            label={`${z.name} · ${z.level}`}
            secondary={region !== i}
            onPress={() => setRegion(i)}
          />
        ))}
      </View>
      <View style={ui.wrap}>
        <Button
          label="All slots"
          secondary={slot !== null}
          onPress={() => setSlot(null)}
        />
        {SLOTS.map((s) => (
          <Button
            key={s}
            label={SLOT_NAMES[s]}
            secondary={slot !== s}
            onPress={() => setSlot(s)}
          />
        ))}
      </View>
      {items.map((i) => itemCard(i, true))}
    </>
  );
}
