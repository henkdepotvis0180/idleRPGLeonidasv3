import React from "react";
import { Text, View } from "react-native";
import { COMPANIONS, RACES, FACTIONS } from "../content";
import {
  chooseRace,
  chooseFaction,
  hireCompanion,
  selectCompanion,
  type State,
} from "../engine";
import { Button, Card, ui } from "./UI";
export function HeritagePanel({
  state,
  act,
}: {
  state: State;
  act: (fn: (s: State) => State) => void;
}) {
  const race = RACES.find((r) => r.id === state.race)!,
    faction = FACTIONS.find((f) => f.id === state.faction)!;
  return (
    <Card>
      <Text style={ui.subheading}>Heritage & allegiance</Text>
      <Text style={ui.small}>
        Choose your appearance and story allegiance freely. Every race can
        follow either banner and play any class.
      </Text>
      <View style={ui.wrap}>
        {RACES.map((r) => (
          <Button
            key={r.id}
            label={r.name}
            secondary={r.id !== state.race}
            onPress={() => act((s) => chooseRace(s, r.id))}
          />
        ))}
      </View>
      <Text style={ui.body}>{race.description}</Text>
      <View style={ui.wrap}>
        {FACTIONS.map((f) => (
          <Button
            key={f.id}
            label={f.name}
            secondary={f.id !== state.faction}
            onPress={() => act((s) => chooseFaction(s, f.id))}
          />
        ))}
      </View>
      <Text style={[ui.gold, { color: faction.color }]}>{faction.motto}</Text>
      <Text style={ui.body}>{faction.description}</Text>
    </Card>
  );
}
export function CompanyPanel({
  state,
  act,
}: {
  state: State;
  act: (fn: (s: State) => State) => void;
}) {
  return (
    <>
      <Text style={ui.heading}>Companion lodge</Text>
      <Text style={ui.body}>
        Hire allies with gold earned in the game. One companion fights beside
        you at a time; hired allies stay with you across runs and class changes.
      </Text>
      {COMPANIONS.map((c) => {
        const owned = state.companions.owned.includes(c.id),
          active = state.companions.active === c.id;
        return (
          <Card key={c.id} color={c.color}>
            <View style={ui.row}>
              <Text style={ui.subheading}>{c.name}</Text>
              <Text style={[ui.gold, { color: c.color }]}>{c.role}</Text>
            </View>
            <Text style={ui.body}>{c.story}</Text>
            <Text style={ui.small}>
              Level {c.level} · +{c.attack} companion damage · +{c.armor} armour
              {c.heal ? ` · heals ${c.heal} HP / 4 turns` : ""}
            </Text>
            <Button
              label={
                active
                  ? `${c.name} · Following`
                  : owned
                    ? `Bring ${c.name}`
                    : `Hire ${c.name} · ${c.price} gold`
              }
              disabled={
                active ||
                (!owned && (state.gold < c.price || state.level < c.level))
              }
              secondary={owned}
              onPress={() =>
                act((s) =>
                  owned ? selectCompanion(s, c.id) : hireCompanion(s, c.id),
                )
              }
            />
          </Card>
        );
      })}
      {state.companions.active && (
        <Button
          label="Let companion rest"
          secondary
          onPress={() => act((s) => selectCompanion(s, null))}
        />
      )}
    </>
  );
}
