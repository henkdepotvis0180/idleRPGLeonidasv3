import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BattleScene } from "./BattleScene";
import { WorldMap } from "./WorldMap";
import { Button, Card, Bar, ui } from "./UI";
import { ZONES, BLESSINGS, RARITIES, STANCES, classFor } from "../content";
import {
  castAbility,
  setSetting,
  currentEnemy,
  enemyMax,
  stats,
  bossWarning,
  setCamera,
  setTactics,
  explore,
  returnToBattle,
  moveHero,
  nearestSite,
  interactSite,
  chooseBlessing,
  abandonRun,
  type State,
} from "../engine";
type Props = {
  state: State;
  running: boolean;
  active: boolean;
  toggleRunning: () => void;
  act: (fn: (s: State) => State) => void;
  move: (x: number, z: number) => void;
};
function MovePad({ move, active }: { move: Props["move"]; active: boolean }) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => {
    if (!active) stop();
    return stop;
  }, [active]);
  const start = (x: number, z: number) => {
    stop();
    move(x, z);
    timer.current = setInterval(() => move(x, z), 120);
  };
  return (
    <View style={styles.pad}>
      {[
        [0, -1, "↑", 44, 0, "Move north"],
        [-1, 0, "←", 0, 44, "Move west"],
        [1, 0, "→", 88, 44, "Move east"],
        [0, 1, "↓", 44, 88, "Move south"],
      ].map(([x, z, label, left, top, name]) => (
        <Pressable
          key={String(name)}
          accessibilityRole="button"
          accessibilityLabel={String(name)}
          onPressIn={() => start(Number(x), Number(z))}
          onPressOut={stop}
          onTouchCancel={stop}
          style={[styles.direction, { left: Number(left), top: Number(top) }]}
        >
          <Text style={{ color: "#efe7ce", fontSize: 21 }}>{label}</Text>
        </Pressable>
      ))}
      <View
        pointerEvents="none"
        style={{ position: "absolute", left: 52, top: 54 }}
      >
        <Text style={{ color: "#acbcae", fontSize: 12 }}>N</Text>
      </View>
    </View>
  );
}
export function AdventureScreen({
  state,
  running,
  active,
  toggleRunning,
  act,
  move,
}: Props) {
  const [map, setMap] = useState(false),
    [journal, setJournal] = useState(false);
  const power = stats(state),
    hero = classFor(state.classId),
    zone = ZONES[state.zone],
    roam = state.world.mode === "explore",
    warning = bossWarning(state),
    site = nearestSite(state);
  useEffect(() => {
    if (state.run.choicePending || state.lastBoss) setJournal(true);
  }, [state.run.choicePending, state.lastBoss]);
  useEffect(() => {
    if (!map) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setMap(false);
        return true;
      },
    );
    return () => subscription.remove();
  }, [map]);
  return (
    <View style={{ flex: 1, minHeight: 300, backgroundColor: "#273b3f" }}>
      <BattleScene
        state={state}
        running={running}
        active={active}
        rendering={!map && !journal}
        expanded
      />
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <View style={styles.top}>
          <View style={[ui.row, { gap: 6 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.area}>{zone.name}</Text>
              <Text style={styles.caption}>
                LV {zone.level}+ · RUN {state.run.number} ·{" "}
                {roam ? "EXPLORING" : `ENCOUNTER ${state.wave}/10`}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                running ? "Pause expedition" : "Resume expedition"
              }
              onPress={toggleRunning}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{running ? "II" : "RUN"}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open world map"
              onPress={() => setMap(true)}
              style={styles.chip}
            >
              <Text style={styles.chipText}>MAP</Text>
            </Pressable>
          </View>
          {!roam && (
            <View style={styles.enemy}>
              <View style={ui.row}>
                <Text style={styles.enemyName}>
                  {currentEnemy(state).name}
                  {state.world.elite ? " · ELITE" : ""}
                </Text>
                <Text style={styles.caption}>{state.enemyHp} HP</Text>
              </View>
              <Bar
                value={state.enemyHp}
                max={enemyMax(state)}
                color="#c9857a"
              />
            </View>
          )}
          {roam && (
            <Text style={styles.hint}>
              {state.world.destination
                ? "Walking to your destination…"
                : site.distance <= 1.3
                  ? `${site.name} · Lv ${site.level}`
                  : "Walk with the pad or choose a map destination."}
            </Text>
          )}
          {!roam && warning && (
            <View
              style={[
                styles.warning,
                {
                  borderColor: warning.remaining === 1 ? "#ed9472" : "#ae9460",
                },
              ]}
            >
              <Text
                style={{
                  color: warning.remaining === 1 ? "#ffc4a4" : "#eddbad",
                  fontWeight: "700",
                  fontSize: 11,
                }}
              >
                {warning.name.toUpperCase()} · {warning.remaining} TURN
                {warning.remaining === 1 ? "" : "S"} ·{" "}
                {["LEFT", "CENTRE", "RIGHT"][warning.lane + 1]} LANE
              </Text>
              <Text style={styles.caption}>
                Move to another lane before impact.
              </Text>
            </View>
          )}
        </View>
        <View style={styles.side}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              state.world.camera === "overview"
                ? "Switch to third person"
                : "Switch to overview"
            }
            onPress={() =>
              act((s) =>
                setCamera(
                  s,
                  s.world.camera === "overview" ? "third" : "overview",
                ),
              )
            }
            style={styles.chip}
          >
            <Text style={styles.chipText}>
              {state.world.camera === "overview" ? "3RD" : "SKY"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open expedition journal"
            onPress={() => setJournal(true)}
            style={styles.chip}
          >
            <Text style={styles.chipText}>LOG</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={roam ? "Return to combat" : "Explore region"}
            onPress={() => act(roam ? returnToBattle : explore)}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{roam ? "FIGHT" : "ROAM"}</Text>
          </Pressable>
        </View>
        {!running && !roam && (
          <Text pointerEvents="none" style={styles.pause}>
            EXPEDITION PAUSED
          </Text>
        )}
        {roam && (
          <View style={styles.roamControls}>
            <MovePad move={move} active={active} rendering={!map && !journal} />
            <View style={{ width: 135, gap: 6 }}>
              <Button
                label={
                  site.distance <= 1.3
                    ? site.kind === "camp"
                      ? "Rest at camp"
                      : site.kind === "cache"
                        ? "Open cache"
                        : "Fight nearby enemy"
                    : "Interact with site"
                }
                disabled={site.distance > 1.3 || state.level < site.level}
                onPress={() => act(interactSite)}
              />
              <Text style={[styles.caption, { textAlign: "center" }]}>
                {site.distance <= 1.3
                  ? `${site.name} · Lv ${site.level}`
                  : `Nearest site: ${Math.ceil(site.distance)}m`}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.bottom}>
          <View style={ui.row}>
            <Text style={styles.caption}>
              {state.combat.form !== "human"
                ? `${state.combat.form.toUpperCase()} FORM`
                : hero.name.toUpperCase()}{" "}
              · {state.hp}/{power.hp} HP
            </Text>
            <Text style={styles.caption}>
              {state.combat.shield
                ? `SHIELD ${state.combat.shield}`
                : `${power.attack} ATK · ${power.armor} ARM`}
            </Text>
          </View>
          <Bar value={state.hp} max={power.hp} color="#86bfa4" />
          {!roam && (
            <>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {hero.abilities.map((a) => {
                  const cooldown = state.combat.cooldowns[a.id] ?? 0;
                  return (
                    <Pressable
                      key={a.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${a.name}${cooldown ? ` · ${cooldown}s` : " · Cast"}`}
                      disabled={
                        !running || state.run.choicePending || cooldown > 0
                      }
                      onPress={() => act((s) => castAbility(s, a.id))}
                      style={[
                        styles.skill,
                        { opacity: cooldown || !running ? 0.55 : 1 },
                      ]}
                    >
                      <Text style={styles.skillText}>{a.name}</Text>
                      <Text style={styles.caption}>
                        {cooldown ? `${cooldown}s` : "CAST"}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Auto skills ${state.settings.autoCast ? "on" : "off"}`}
                  onPress={() =>
                    act((s) => setSetting(s, "autoCast", !s.settings.autoCast))
                  }
                  style={[
                    styles.auto,
                    state.settings.autoCast && { borderColor: "#d1b779" },
                  ]}
                >
                  <Text style={styles.caption}>AUTO</Text>
                  <Text style={styles.chipText}>
                    {state.settings.autoCast ? "ON" : "OFF"}
                  </Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", gap: 5 }}>
                {[-1, 0, 1].map((lane, i) => (
                  <Pressable
                    key={lane}
                    accessibilityRole="button"
                    accessibilityLabel={`Position ${["left", "centre", "right"][i]}`}
                    onPress={() => act((s) => setTactics(s, lane))}
                    style={[
                      styles.tactic,
                      state.tactics.lane === lane && styles.selected,
                    ]}
                  >
                    <Text style={styles.caption}>
                      {["LEFT", "CENTRE", "RIGHT"][i]}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Stance ${STANCES.find((t) => t.id === state.tactics.stance)!.name}`}
                  onPress={() =>
                    act((s) =>
                      setTactics(
                        s,
                        s.tactics.lane,
                        STANCES[
                          (STANCES.findIndex((t) => t.id === s.tactics.stance) +
                            1) %
                            STANCES.length
                        ].id,
                      ),
                    )
                  }
                  style={styles.tactic}
                >
                  <Text style={styles.caption}>
                    {STANCES.find(
                      (t) => t.id === state.tactics.stance,
                    )!.name.toUpperCase()}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
      {map && <WorldMap state={state} act={act} close={() => setMap(false)} />}
      <Modal
        visible={journal}
        animationType="slide"
        onRequestClose={() => setJournal(false)}
      >
        <SafeAreaView style={ui.root}>
          <View style={[ui.row, { padding: 16 }]}>
            <Text style={ui.heading}>Expedition journal</Text>
            <Button
              label="Close journal"
              secondary
              onPress={() => setJournal(false)}
            />
          </View>
          <ScrollView contentContainerStyle={ui.content}>
            {state.run.choicePending && (
              <Card color="#dec28d">
                <Text style={ui.eyebrow}>REST POINT · CHOOSE ONE</Text>
                <Text style={ui.subheading}>A moment of strength</Text>
                {BLESSINGS.map((b) => (
                  <Button
                    key={b.id}
                    label={`${b.name} · ${b.description}`}
                    onPress={() => {
                      act((s) => chooseBlessing(s, b.id));
                      setJournal(false);
                    }}
                  />
                ))}
              </Card>
            )}
            {state.lastBoss && (
              <Card
                color={
                  state.lastBoss.rarity
                    ? RARITIES[state.lastBoss.rarity].color
                    : "#d9c28b"
                }
              >
                <Text style={ui.eyebrow}>BOSS DEFEATED</Text>
                <Text style={ui.subheading}>A hard-earned victory</Text>
                <Text style={ui.gold}>
                  +{state.lastBoss.xp} XP · +{state.lastBoss.gold} gold
                </Text>
                <Text style={ui.body}>
                  {state.lastBoss.itemName ??
                    "Bag full — make room for the next drop."}
                </Text>
                <Button
                  label="Dismiss rewards"
                  secondary
                  onPress={() => {
                    act((s) => ({ ...s, lastBoss: null }));
                    setJournal(false);
                  }}
                />
              </Card>
            )}
            <Card>
              <Text style={ui.body}>{state.log}</Text>
              <Text style={ui.small}>
                Blessings:{" "}
                {state.run.blessings.length
                  ? state.run.blessings
                      .map((id) => BLESSINGS.find((b) => b.id === id)?.name)
                      .join(" · ")
                  : "none yet"}
                . Temporary blessings fade after a run; levels, gear, gold and
                companions remain.
              </Text>
            </Card>
            <Card>
              <Text style={ui.subheading}>Tactical positioning</Text>
              <Text style={ui.body}>
                Left, centre and right shift your hero’s actual position. Bosses
                mark their dangerous lane before a special attack. Moving away
                halves its normal damage; standing in the telegraph amplifies
                the hit.
              </Text>
              {STANCES.map((t) => (
                <Button
                  key={t.id}
                  label={`${t.name} · ${t.description}`}
                  secondary={state.tactics.stance !== t.id}
                  onPress={() =>
                    act((s) => setTactics(s, s.tactics.lane, t.id))
                  }
                />
              ))}
            </Card>
            {hero.abilities.map((a) => (
              <Card key={a.id}>
                <Text style={ui.subheading}>{a.name}</Text>
                <Text style={ui.body}>
                  {a.description} · {a.cooldown}s cooldown
                </Text>
              </Card>
            ))}
            <Button
              label="Start fresh run · keep gear and level"
              secondary
              onPress={() => {
                act(abandonRun);
                setJournal(false);
              }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  top: { position: "absolute", top: 10, left: 12, right: 12, gap: 7 },
  area: {
    color: "#fff0d1",
    fontSize: 17,
    fontWeight: "800",
    textShadowColor: "#15252b",
    textShadowRadius: 4,
  },
  caption: {
    color: "#d9dfd8",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
    textShadowColor: "#142029",
    textShadowRadius: 2,
  },
  chip: {
    minWidth: 42,
    minHeight: 40,
    padding: 9,
    borderRadius: 9,
    backgroundColor: "#15262dda",
    borderWidth: 1,
    borderColor: "#89938788",
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontSize: 11, fontWeight: "800", color: "#efe2bf" },
  enemy: { backgroundColor: "#16252ad9", borderRadius: 9, padding: 9, gap: 6 },
  enemyName: { color: "#f4e4cf", fontSize: 12, fontWeight: "700", flex: 1 },
  hint: {
    backgroundColor: "#172b30d9",
    padding: 9,
    borderRadius: 9,
    color: "#e0e3d1",
    fontSize: 10,
  },
  warning: {
    backgroundColor: "#302b23e8",
    borderWidth: 1,
    borderRadius: 9,
    padding: 8,
    gap: 4,
  },
  side: { position: "absolute", top: 150, right: 12, gap: 8 },
  pause: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    color: "#f2e1b9",
    fontSize: 11,
    letterSpacing: 2,
    backgroundColor: "#17262bcc",
    padding: 10,
    borderRadius: 5,
  },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 9,
    gap: 8,
    backgroundColor: "#13232cea",
    borderTopWidth: 1,
    borderColor: "#a9aa8d55",
  },
  skill: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: "#334852ee",
    borderWidth: 1,
    borderColor: "#a6b7af",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 4,
  },
  skillText: {
    color: "#f0dfba",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  auto: {
    width: 43,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#60727a",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tactic: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#526570",
  },
  selected: { backgroundColor: "#596656", borderColor: "#dac48e" },
  roamControls: {
    position: "absolute",
    bottom: 72,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pad: { width: 132, height: 132 },
  direction: {
    position: "absolute",
    width: 42,
    height: 42,
    backgroundColor: "#162b32cd",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#b4b7a799",
    alignItems: "center",
    justifyContent: "center",
  },
});
