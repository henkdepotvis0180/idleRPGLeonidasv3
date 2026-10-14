import React, { Component, useEffect, useRef, type ReactNode } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { ThreeStage } from "./ThreeStage";
import { BattleWorld } from "../visuals/BattleWorld";
import { type State, currentEnemy } from "../engine";
import { classFor } from "../content";
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
function FloatingHit({ state }: { state: State }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (state.combat.kind === "none") {
      opacity.setValue(0);
      return;
    }
    opacity.setValue(1);
    rise.setValue(0);
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 850,
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: -26,
        duration: 850,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [state.combat.event, state.combat.kind, opacity, rise]);
  return (
    <Animated.Text
      pointerEvents="none"
      style={[styles.damage, { opacity, transform: [{ translateY: rise }] }]}
    >
      {state.combat.label || `−${state.combat.amount}`}
    </Animated.Text>
  );
}
export function BattleScene({
  state,
  running,
  preview = false,
  active = true,
}: {
  state: State;
  running: boolean;
  preview?: boolean;
  active?: boolean;
}) {
  return (
    <View
      pointerEvents="none"
      style={[styles.scene, preview && { height: 310 }]}
      accessibilityLabel={preview ? "3D character preview" : "3D battle arena"}
    >
      {active ? (
        <SceneBoundary>
          <ThreeStage lowPower={state.settings.lowPower}>
            <BattleWorld state={state} running={running} preview={preview} />
          </ThreeStage>
        </SceneBoundary>
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.text}>Resting…</Text>
        </View>
      )}
      <View pointerEvents="none" style={styles.top}>
        <Text style={styles.pill}>
          {preview ? "WARDROBE" : `RUN ${state.run.number} · ${state.wave}/10`}
        </Text>
        <Text style={styles.pill}>LIVE 3D</Text>
      </View>
      {!preview && (
        <View pointerEvents="none" style={styles.names}>
          <Text style={styles.name}>{classFor(state.classId).name}</Text>
          <Text style={styles.name}>{currentEnemy(state).name}</Text>
        </View>
      )}
      {!preview && state.combat.event > 0 && <FloatingHit state={state} />}
      {!preview && (!running || state.run.choicePending) && (
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
