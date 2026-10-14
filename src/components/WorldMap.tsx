import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import { ZONES, BIOMES } from "../content";
import { regionNodes, navigateTo, changeZone, type State } from "../engine";
import { Button, Card, ui } from "./UI";
export function WorldMap({
  state,
  close,
  act,
}: {
  state: State;
  close: () => void;
  act: (fn: (s: State) => State) => void;
}) {
  const nodes = regionNodes(state),
    b = BIOMES[state.zone % BIOMES.length];
  return (
    <Modal animationType="slide" onRequestClose={close}>
      <SafeAreaView style={ui.root}>
        <View style={[ui.row, { padding: 14 }]}>
          <View>
            <Text style={ui.eyebrow}>
              THE FRONTIER · EXPEDITION {state.run.number}
            </Text>
            <Text style={ui.heading}>World atlas</Text>
          </View>
          <Button label="Close map" secondary onPress={close} />
        </View>
        <ScrollView contentContainerStyle={ui.content}>
          <Text style={ui.subheading}>
            {ZONES[state.zone].name} · Level {ZONES[state.zone].level}+
          </Text>
          <Text style={ui.small}>
            Choose a site to walk there. Approach it, then use Interact. Gold
            marks an elite, red a boss, green a camp. Defeat nine encounters to
            open the boss gate. Sites regenerate after each run.
          </Text>
          <View
            style={{
              height: 330,
              backgroundColor: b.ground,
              borderRadius: 18,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#a09575",
            }}
          >
            <SvgXml
              width="100%"
              height="100%"
              xml={`<svg viewBox="0 0 200 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 12V182M24 60H176M24 104H176M24 148H176" stroke="#c3b18b" stroke-width="7" opacity=".3"/><path d="M4 4L42 12 21 55 5 77ZM154 4L195 10 181 55ZM0 156L43 172 31 199ZM157 171L194 151 199 200Z" fill="#243b35" opacity=".4"/><path d="M0 110Q50 155 110 115T200 140" fill="none" stroke="#91b7c2" stroke-width="6" opacity=".45"/></svg>`}
            />
            {nodes.map((n) => {
              const cleared = state.world.visited.includes(n.id),
                locked = state.level < n.level;
              return (
                <Pressable
                  key={n.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Walk to ${n.name}`}
                  disabled={locked}
                  onPress={() => {
                    act((s) => navigateTo(s, n.id));
                    close();
                  }}
                  style={{
                    position: "absolute",
                    left: `${((n.x + 10) / 20) * 86 + 2}%`,
                    top: `${((n.z + 10) / 20) * 85 + 2}%`,
                    width: 36,
                    height: 38,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: locked ? 0.3 : 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: n.kind === "boss" ? 25 : 21,
                      color: cleared
                        ? "#a6b1a0"
                        : n.kind === "boss"
                          ? "#f39585"
                          : n.kind === "elite"
                            ? "#e6bd70"
                            : n.kind === "camp"
                              ? "#b0dcc1"
                              : "#e3decd",
                      textShadowColor: "#111c20",
                      textShadowRadius: 3,
                    }}
                  >
                    {cleared
                      ? "✓"
                      : n.kind === "camp"
                        ? "⌂"
                        : n.kind === "cache"
                          ? "▣"
                          : n.kind === "boss"
                            ? "♜"
                            : "◆"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 8,
                      color: "#f5ecd5",
                      backgroundColor: "#1a252dcc",
                      paddingHorizontal: 3,
                    }}
                  >
                    {n.level}
                  </Text>
                </Pressable>
              );
            })}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: `${((state.world.x + 10) / 20) * 86 + 2}%`,
                top: `${((state.world.z + 10) / 20) * 85 + 2}%`,
                width: 36,
                height: 38,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#8feaff",
                  fontSize: 27,
                  textShadowColor: "#102e3b",
                  textShadowRadius: 4,
                }}
              >
                ●
              </Text>
            </View>
            <Text
              style={{
                position: "absolute",
                bottom: 8,
                left: 10,
                color: "#eee0b8",
                fontSize: 10,
              }}
            >
              N ↑ · Blue dot: your hero
            </Text>
          </View>
          <Text style={ui.heading}>Choose a region</Text>
          {ZONES.map((z, i) => (
            <Pressable
              key={z.id}
              accessibilityRole="button"
              accessibilityLabel={`Travel to ${z.name}`}
              disabled={state.level < z.level}
              onPress={() => {
                act((s) => changeZone(s, i));
                close();
              }}
            >
              <Card
                color={i === state.zone ? "#d8ba7c" : z.color}
                style={{ opacity: state.level < z.level ? 0.45 : 1 }}
              >
                <View style={ui.row}>
                  <Text style={ui.subheading}>{z.name}</Text>
                  <Text style={ui.gold}>
                    {state.bosses.includes(z.id) ? "✓" : `Lv ${z.level}`}
                  </Text>
                </View>
                <Text style={ui.small}>
                  {z.subtitle} ·{" "}
                  {state.level < z.level
                    ? `Requires level ${z.level}`
                    : z.boss.name}
                </Text>
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
