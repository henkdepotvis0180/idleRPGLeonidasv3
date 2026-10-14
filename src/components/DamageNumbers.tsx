import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import type { State } from "../engine";
type Hit = State["floats"][number];
function Burst({
  hit,
  index,
  third,
}: {
  hit: Hit;
  index: number;
  third: boolean;
}) {
  const rise = useRef(new Animated.Value(0)).current,
    opacity = useRef(new Animated.Value(0)).current,
    scale = useRef(new Animated.Value(0.65)).current;
  useEffect(() => {
    const a = Animated.parallel([
      Animated.timing(rise, {
        toValue: -70,
        duration: 1150,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.delay(650),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 430,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.spring(scale, {
          toValue: hit.kind === "critical" ? 1.35 : 1,
          tension: 170,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.88,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]);
    a.start();
    return () => a.stop();
  }, []);
  const good =
    hit.kind === "heal" || hit.kind === "block" || hit.kind === "evade";
  const color =
    hit.kind === "critical"
      ? "#ffe4a0"
      : hit.kind === "heal"
        ? "#9ff0ba"
        : hit.kind === "block"
          ? "#b4e0fa"
          : hit.kind === "evade"
            ? "#c9e8ee"
            : hit.target === "hero"
              ? "#ffb5a4"
              : "#fff1ca";
  const text =
    hit.kind === "evade"
      ? "DODGE"
      : hit.kind === "block"
        ? `BLOCK ${hit.amount}`
        : hit.kind === "heal"
          ? `+${hit.amount}`
          : hit.kind === "critical"
            ? `${hit.amount}!`
            : `${hit.amount}`;
  return (
    <Animated.View
      style={[
        styles.burst,
        {
          left:
            hit.target === "enemy"
              ? third
                ? "43%"
                : "42%"
              : third
                ? "30%"
                : "57%",
          top: hit.target === "enemy" ? "35%" : "57%",
          opacity,
          transform: [
            { translateY: rise },
            { translateX: ((index % 3) - 1) * 24 },
            { scale },
          ],
        },
      ]}
    >
      <Animated.Text
        style={[
          styles.number,
          { color, fontSize: good ? 18 : hit.kind === "critical" ? 33 : 27 },
        ]}
      >
        {text}
      </Animated.Text>
      {!!hit.label && hit.kind !== "evade" && (
        <Animated.Text style={[styles.label, { color }]}>
          {hit.label}
        </Animated.Text>
      )}
    </Animated.View>
  );
}
export function DamageNumbers({ state }: { state: State }) {
  const seen = useRef(state.floatSerial),
    [hits, setHits] = useState<Hit[]>([]),
    timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const added = state.floats.filter((f) => f.id > seen.current);
    seen.current = state.floatSerial;
    if (!added.length) return;
    setHits((h) => [...h, ...added].slice(-12));
    const ids = new Set(added.map((f) => f.id));
    const timer = setTimeout(() => {
      setHits((h) => h.filter((f) => !ids.has(f.id)));
      timeouts.current = timeouts.current.filter((t) => t !== timer);
    }, 1200);
    timeouts.current.push(timer);
  }, [state.floatSerial]);
  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {hits.map((h, i) => (
        <Burst
          key={h.id}
          hit={h}
          index={i}
          third={state.world.camera === "third"}
        />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  burst: { position: "absolute", alignItems: "center", minWidth: 60 },
  number: {
    fontWeight: "900",
    textShadowColor: "#14202a",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
    letterSpacing: -0.6,
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    maxWidth: 130,
    textAlign: "center",
    textShadowColor: "#14202a",
    textShadowRadius: 3,
  },
});
