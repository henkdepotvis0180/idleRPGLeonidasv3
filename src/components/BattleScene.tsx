import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { swordArt, wolfArt, ghostArt, bossArt } from "../art";
import { ZONES } from "../content";
import { currentEnemy, stats, type State } from "../engine";
import { RULES } from "../config";
export function BattleScene({
  state,
  running,
}: {
  state: State;
  running: boolean;
}) {
  const drift = useRef(new Animated.Value(0)).current;
  const strike = useRef(new Animated.Value(0)).current;
  const hit = useRef(new Animated.Value(0)).current;
  const encounter = {
    kills: state.kills,
    hp: state.enemyHp,
    zone: state.zone,
    wave: state.wave,
    run: state.run.number,
  };
  const last = useRef(encounter);
  const enemy = currentEnemy(state);
  const fighting = running && !state.run.choicePending;
  useEffect(() => {
    if (!fighting) return;
    const loop = Animated.loop(
      Animated.timing(drift, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [fighting, drift]);
  useEffect(() => {
    const previous = last.current;
    const attacked =
      state.kills > previous.kills ||
      (state.zone === previous.zone &&
        state.wave === previous.wave &&
        state.run.number === previous.run &&
        state.enemyHp < previous.hp);
    last.current = encounter;
    if (!attacked) return;
    strike.setValue(0);
    hit.setValue(0);
    const animation = Animated.parallel([
      Animated.sequence([
        Animated.timing(strike, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(strike, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(hit, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [
    state.enemyHp,
    state.kills,
    state.zone,
    state.wave,
    state.run.number,
    strike,
    hit,
  ]);
  return (
    <View style={[styles.scene, { backgroundColor: ZONES[state.zone].color }]}>
      <View style={styles.moon} />
      <Animated.View
        style={[
          styles.scenery,
          {
            transform: [
              {
                translateX: drift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -180],
                }),
              },
            ],
          },
        ]}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <View
            key={i}
            style={[styles.tree, { left: i * 90, top: 40 - (i % 3) * 25 }]}
          />
        ))}
      </Animated.View>
      <View style={styles.ground} />
      <Animated.View
        style={[
          styles.fighter,
          {
            transform: [
              {
                translateX: strike.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 22],
                }),
              },
              {
                rotate: strike.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "18deg"],
                }),
              },
            ],
          },
        ]}
      >
        <SvgXml xml={swordArt} width={64} height={64} />
        <Text style={styles.label}>JIJ</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.enemy,
          {
            transform: [
              {
                translateX: strike.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 8],
                }),
              },
            ],
            opacity: strike.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.4],
            }),
          },
        ]}
      >
        <SvgXml
          xml={
            enemy.art === "boss"
              ? bossArt
              : enemy.art === "wolf"
                ? wolfArt
                : ghostArt
          }
          width={state.wave === RULES.encountersPerRun ? 80 : 62}
          height={state.wave === RULES.encountersPerRun ? 80 : 62}
        />
        <Text style={styles.label}>
          {state.wave === RULES.encountersPerRun ? "EINDBAAS" : "VIJAND"}
        </Text>
      </Animated.View>
      <Animated.Text
        style={[
          styles.damage,
          {
            opacity: hit.interpolate({
              inputRange: [0, 0.15, 0.7, 1],
              outputRange: [0, 1, 1, 0],
            }),
            transform: [
              {
                translateY: hit.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -45],
                }),
              },
            ],
          },
        ]}
      >
        −{stats(state).attack}
      </Animated.Text>
      <Text style={styles.stage}>
        RUN {state.run.number} · {state.wave} / {RULES.encountersPerRun}
      </Text>
      {!fighting && (
        <View style={styles.paused}>
          <Text style={styles.label}>
            {state.run.choicePending ? "KIES EEN ZEGEN ↓" : "GEPAUZEERD"}
          </Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  scene: {
    height: 235,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  moon: {
    width: 47,
    height: 47,
    borderRadius: 24,
    backgroundColor: "#d9d6b7",
    opacity: 0.7,
    position: "absolute",
    right: 45,
    top: 22,
  },
  scenery: { position: "absolute", width: 900, height: 140, top: 60 },
  tree: {
    position: "absolute",
    width: 0,
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 120,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#163c3c",
    opacity: 0.8,
  },
  ground: {
    position: "absolute",
    bottom: 0,
    height: 55,
    width: "100%",
    backgroundColor: "#1d3335",
  },
  fighter: {
    position: "absolute",
    left: "14%",
    bottom: 40,
    alignItems: "center",
  },
  enemy: {
    position: "absolute",
    right: "14%",
    bottom: 40,
    alignItems: "center",
  },
  label: { fontSize: 9, color: "#f1e5c8", fontWeight: "700", letterSpacing: 2 },
  stage: {
    position: "absolute",
    left: 15,
    top: 15,
    fontSize: 10,
    color: "#f1e5c8",
    letterSpacing: 2,
  },
  damage: {
    position: "absolute",
    right: "22%",
    bottom: 100,
    color: "#ffda9a",
    fontSize: 26,
    fontWeight: "900",
  },
  paused: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 12,
    backgroundColor: "#101b20bb",
    alignItems: "center",
  },
});
