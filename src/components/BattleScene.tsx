import React, {
  Component,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { ThreeStage } from "./ThreeStage";
import { BattleWorld, type ScreenAnchors } from "../visuals/BattleWorld";
import { type State, currentEnemy } from "../engine";
import { classFor } from "../content";
import { DamageNumbers } from "./DamageNumbers";
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <View style={styles.fallback}>
        <Text style={styles.text}>
          3D graphics could not start on this device. Combat and rewards still
          work.
        </Text>
      </View>
    ) : (
      this.props.children
    );
  }
}
export function BattleScene({
  state,
  running,
  preview = false,
  active = true,
  expanded = false,
  rendering = true,
}: {
  state: State;
  running: boolean;
  preview?: boolean;
  active?: boolean;
  expanded?: boolean;
  rendering?: boolean;
}) {
  const [anchors, setAnchors] = useState<ScreenAnchors>({
    hero: { x: 0.3, y: 0.58 },
    enemy: { x: 0.65, y: 0.4 },
  });
  const placeNumbers = useCallback((next: ScreenAnchors) => {
    setAnchors((previous) =>
      Math.abs(previous.hero.x - next.hero.x) +
        Math.abs(previous.hero.y - next.hero.y) +
        Math.abs(previous.enemy.x - next.enemy.x) +
        Math.abs(previous.enemy.y - next.enemy.y) <
      0.004
        ? previous
        : next,
    );
  }, []);
  return (
    <View
      pointerEvents="none"
      style={[
        styles.scene,
        preview && { height: 360 },
        expanded && {
          flex: 1,
          height: undefined,
          borderRadius: 0,
          borderWidth: 0,
        },
      ]}
      accessibilityLabel={preview ? "3D character preview" : "3D battle arena"}
    >
      {active ? (
        <SceneBoundary>
          <ThreeStage lowPower={state.settings.lowPower} rendering={rendering}>
            <BattleWorld
              state={state}
              running={running}
              preview={preview}
              onAnchors={placeNumbers}
            />
          </ThreeStage>
        </SceneBoundary>
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.text}>Resting…</Text>
        </View>
      )}
      {!expanded && (
        <View pointerEvents="none" style={styles.top}>
          <Text style={styles.pill}>
            {preview
              ? "WARDROBE"
              : `RUN ${state.run.number} · ${state.wave}/10`}
          </Text>
          <Text style={styles.pill}>LIVE 3D</Text>
        </View>
      )}
      {!preview && !expanded && (
        <View pointerEvents="none" style={styles.names}>
          <Text style={styles.name}>{classFor(state.classId).name}</Text>
          <Text style={styles.name}>{currentEnemy(state).name}</Text>
        </View>
      )}
      {!preview && <DamageNumbers state={state} anchors={anchors} />}
      {!preview && !expanded && (!running || state.run.choicePending) && (
        <Text pointerEvents="none" style={styles.paused}>
          {state.run.choicePending
            ? "CHOOSE A BLESSING BELOW"
            : "EXPEDITION PAUSED"}
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  scene: {
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#263e4d",
    borderWidth: 1,
    borderColor: "#52606e",
  },
  top: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pill: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#f5e5c7",
    backgroundColor: "#162633bb",
    padding: 7,
    borderRadius: 6,
  },
  names: {
    position: "absolute",
    bottom: 34,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 10,
    color: "#fcf0da",
    backgroundColor: "#172634aa",
    padding: 6,
    borderRadius: 6,
    maxWidth: "49%",
  },
  paused: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    textAlign: "center",
    backgroundColor: "#182531d9",
    color: "#f4dba4",
    padding: 7,
    fontSize: 9,
    letterSpacing: 1.8,
  },
  damage: {
    position: "absolute",
    top: 80,
    right: 12,
    maxWidth: 145,
    color: "#ffe3a4",
    fontSize: 16,
    fontWeight: "900",
    textShadowColor: "#1c2839",
    textShadowRadius: 4,
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  text: { color: "#f4dec0", textAlign: "center" },
});
