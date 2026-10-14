import React from "react";
import { Text, View } from "react-native";
import { classFor } from "../content";
import { castAbility, setSetting, type State } from "../engine";
import { Button, Card, ui } from "./UI";
export function AbilityPanel({
  state,
  running,
  act,
}: {
  state: State;
  running: boolean;
  act: (fn: (s: State) => State) => void;
}) {
  return (
    <Card>
      <View style={ui.row}>
        <Text style={ui.subheading}>Class abilities</Text>
        <Button
          label={`Auto skills ${state.settings.autoCast ? "on" : "off"}`}
          secondary
          onPress={() =>
            act((s) => setSetting(s, "autoCast", !s.settings.autoCast))
          }
        />
      </View>
      {classFor(state.classId).abilities.map((a) => {
        const cooldown = state.combat.cooldowns[a.id] ?? 0;
        return (
          <View key={a.id} style={{ gap: 6, paddingTop: 5 }}>
            <Button
              label={`${a.name}${cooldown ? ` · ${cooldown}s` : " · Cast"}`}
              disabled={!running || state.run.choicePending || cooldown > 0}
              onPress={() => act((s) => castAbility(s, a.id))}
            />
            <Text style={ui.small}>
              {a.description} Cooldown: {a.cooldown}s of combat.
            </Text>
          </View>
        );
      })}
      {state.combat.shield > 0 && (
        <Text style={ui.gold}>
          Barrier: {state.combat.shield} · {state.combat.shieldTurns} turns
        </Text>
      )}
      {state.combat.form !== "human" && (
        <Text style={ui.gold}>
          {state.combat.form.toUpperCase()} FORM · {state.combat.formTurns}{" "}
          turns
        </Text>
      )}
    </Card>
  );
}
