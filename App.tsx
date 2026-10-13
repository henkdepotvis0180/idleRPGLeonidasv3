import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BattleScene } from "./src/components/BattleScene";
import { MODULES, RULES } from "./src/config";
import {
  CLASSES,
  ZONES,
  EPILOGUE,
  SLOTS,
  SLOT_NAMES,
  SHOP,
  DAILY_QUESTS,
  BLESSINGS,
} from "./src/content";
import {
  abandonRun,
  chooseBlessing,
  currentEnemy,
  buy,
  buyBag,
  changeZone,
  claimDaily,
  claimMain,
  claimOffline,
  createState,
  decodeSave,
  enemyMax,
  equip,
  resume,
  sell,
  unequip,
  stats,
  tick,
  xpNeeded,
  type State,
} from "./src/engine";
const KEY = "leonidas-v3-save-v2";
const TABS = [
  "Avontuur",
  "Held",
  "Bags",
  "Quests",
  ...(MODULES.shop ? ["Shop"] : []),
];
function Button({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && { opacity: 0.35 }]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}
function Bar({
  value,
  max,
  color = "#e5bc70",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  return (
    <View style={styles.bar}>
      <View
        style={{
          height: 5,
          width: `${Math.max(0, Math.min(100, (value / max) * 100))}%`,
          backgroundColor: color,
          borderRadius: 4,
        }}
      />
    </View>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <Game />
    </SafeAreaProvider>
  );
}
function Game() {
  const [state, setState] = useState<State>(() => createState());
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(false);
  const [tab, setTab] = useState("Avontuur");
  const [running, setRunning] = useState(true);
  const [saveError, setSaveError] = useState("");
  const scroll = useRef<ScrollView>(null);
  const current = useRef(state);
  const active = useRef(true);
  const writeQueue = useRef(Promise.resolve());
  current.current = state;
  const persist = (s: State) => {
    writeQueue.current = writeQueue.current
      .catch(() => {})
      .then(() => AsyncStorage.setItem(KEY, JSON.stringify(s)))
      .then(() => setSaveError(""))
      .catch(() => {
        setSaveError("Opslaan mislukt. Voortgang is nog niet veilig bewaard.");
      });
  };
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (mounted) {
          setState(decodeSave(raw));
          setSelected(!!raw);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setSaveError("Opslag kon niet worden geladen.");
          setLoaded(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (!loaded || !selected) return;
    const id = setInterval(() => {
      if (active.current && running) setState((s) => tick(s));
    }, 1000);
    return () => clearInterval(id);
  }, [loaded, selected, running]);
  useEffect(() => {
    if (!loaded || !selected) return;
    const id = setInterval(() => {
      if (active.current) persist({ ...current.current, lastSeen: Date.now() });
    }, 5000);
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active" && !active.current) {
        setState((s) => resume(s));
        active.current = true;
      } else if (next !== "active" && active.current) {
        active.current = false;
        const n = { ...current.current, lastSeen: Date.now() };
        current.current = n;
        setState(n);
        persist(n);
      }
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [loaded, selected]);
  useEffect(() => {
    if (loaded && selected) persist(state);
  }, [
    loaded,
    selected,
    state.inventory,
    state.gear,
    state.gold,
    state.mainClaimed,
    state.offline,
    state.daily.claimed,
    state.run,
    state.zone,
  ]);
  const act = (fn: (s: State) => State) => setState((s) => fn(s));
  const z = ZONES[state.zone];
  const power = stats(state);
  const chapter = Math.min(state.mainClaimed, ZONES.length);
  if (!loaded)
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.title}>Leonidas ontwaakt…</Text>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" hidden={false} />
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>THE SHATTERED DAWN</Text>
          <Text style={styles.title}>
            LEONIDAS<Text style={{ color: "#e5bc70" }}> / idle</Text>
          </Text>
        </View>
        <View style={styles.coin}>
          <Text style={styles.gold}>◉ {state.gold}</Text>
          <Text style={styles.small}>GOUD</Text>
        </View>
      </View>
      {!selected ? (
        <ScrollView ref={scroll} contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Kies jouw daglicht.</Text>
          <Text style={styles.body}>{ZONES[0].story}</Text>
          {CLASSES.map((c) => (
            <Pressable
              key={c.id}
              style={styles.card}
              onPress={() => {
                const n = createState(c.id);
                setState(n);
                setSelected(true);
                persist(n);
              }}
            >
              <Text style={styles.heroIcon}>{c.icon}</Text>
              <Text style={styles.heading}>{c.name}</Text>
              <Text style={styles.eyebrow}>
                {c.archetype} · {c.attack} ATK · {c.hp} HP
              </Text>
              <Text style={styles.body}>{c.description}</Text>
              <Text style={styles.gold}>Kies deze class →</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <>
          <View style={styles.levelRow}>
            <Text style={styles.body}>
              {CLASSES.find((c) => c.id === state.classId)?.icon}{" "}
              {CLASSES.find((c) => c.id === state.classId)?.name}
            </Text>
            <Text style={styles.gold}>LVL {state.level}</Text>
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            <Bar value={state.xp} max={xpNeeded(state.level)} />
            <Text style={[styles.small, { marginTop: 5 }]}>
              {state.xp} / {xpNeeded(state.level)} XP · {power.attack} ATK ·{" "}
              {power.hp} HP · {power.armor} ARM
            </Text>
          </View>
          <ScrollView ref={scroll} contentContainerStyle={styles.content}>
            {!!saveError && (
              <Text style={{ color: "#ed9994" }}>{saveError}</Text>
            )}
            {MODULES.offlineRewards && state.offline && (
              <View style={styles.card}>
                <Text style={styles.eyebrow}>TERUG VAN JE REIS</Text>
                <Text style={styles.heading}>Je held bleef onderweg.</Text>
                <Text style={styles.body}>
                  {Math.floor(state.offline.seconds / 60)} minuten · +
                  {state.offline.xp} XP · +{state.offline.gold} goud
                </Text>
                <Button
                  label="Verzamel beloningen"
                  onPress={() => act(claimOffline)}
                />
                <Text style={styles.small}>
                  Maximaal 8 uur per afwezigheid. Geen batterijslurpende
                  achtergrondservice.
                </Text>
              </View>
            )}
            {tab === "Avontuur" && (
              <>
                <Text style={styles.eyebrow}>{z.subtitle}</Text>
                <Text style={styles.heading}>{z.name}</Text>
                <BattleScene state={state} running={running} />
                {MODULES.roguelike && state.run.choicePending && (
                  <View style={styles.card}>
                    <Text style={styles.eyebrow}>
                      RUSTPUNT · TIJDELIJKE ZEGEN
                    </Text>
                    <Text style={styles.heading}>Kies jouw kracht</Text>
                    <Text style={styles.body}>
                      Het gevecht wacht. Deze bonus geldt tot het einde van je
                      run.
                    </Text>
                    {BLESSINGS.map((b) => (
                      <Button
                        key={b.id}
                        label={`${b.name} · ${b.description}`}
                        onPress={() => act((s) => chooseBlessing(s, b.id))}
                      />
                    ))}
                  </View>
                )}
                {MODULES.roguelike && (
                  <Text style={styles.small}>
                    Zegens:{" "}
                    {state.run.blessings.length
                      ? state.run.blessings
                          .map((id) => BLESSINGS.find((b) => b.id === id)?.name)
                          .join(" · ")
                      : "nog geen"}{" "}
                    · tijdelijke bonussen vervallen na de run.
                  </Text>
                )}
                <View style={styles.card}>
                  <View style={styles.levelRow}>
                    <Text style={styles.body}>{currentEnemy(state).name}</Text>
                    <Text style={styles.small}>
                      {Math.max(0, state.enemyHp)} HP
                    </Text>
                  </View>
                  <Bar
                    value={state.enemyHp}
                    max={enemyMax(state)}
                    color="#d78079"
                  />
                  <Text style={[styles.small, { marginTop: 14 }]}>
                    JOUW DAGLICHT · {state.hp} / {power.hp}
                  </Text>
                  <Bar value={state.hp} max={power.hp} color="#70c4ad" />
                  <Text style={styles.body}>{state.log}</Text>
                  <Button
                    label={running ? "Pauzeer expeditie" : "Hervat expeditie"}
                    onPress={() => setRunning((v) => !v)}
                  />
                </View>
                {MODULES.roguelike && (
                  <Button
                    label="Nieuwe run · behoud je gear en level"
                    onPress={() => act(abandonRun)}
                  />
                )}
                <Text style={styles.heading}>Wereldkaart</Text>
                {ZONES.map((zone, i) => (
                  <Pressable
                    key={zone.id}
                    disabled={state.level < zone.level}
                    onPress={() => act((s) => changeZone(s, i))}
                    style={[
                      styles.card,
                      state.zone === i && { borderColor: "#e5bc70" },
                      state.level < zone.level && { opacity: 0.4 },
                    ]}
                  >
                    <Text style={styles.body}>
                      {i + 1}. {zone.name} {state.zone === i ? "· ACTIEF" : ""}
                    </Text>
                    <Text style={styles.small}>
                      Level {zone.level} · {zone.boss.name}{" "}
                      {state.bosses.includes(zone.id) ? "✓" : ""}
                    </Text>
                  </Pressable>
                ))}
              </>
            )}
            {tab === "Held" && (
              <>
                <Text style={styles.heading}>Je uitrusting</Text>
                <Text style={styles.body}>
                  16 gearslots · twee ringen en twee trinkets. Armor vermindert
                  iedere vijandelijke klap (minimaal 1 schade).
                </Text>
                <View style={styles.gearGrid}>
                  {SLOTS.map((slot) => (
                    <View
                      key={slot}
                      style={[
                        styles.slot,
                        {
                          borderColor:
                            state.gear[slot]?.rarity === "epic"
                              ? "#aa8ad5"
                              : state.gear[slot]
                                ? "#78bbaa"
                                : "#344444",
                        },
                      ]}
                    >
                      <Text style={styles.eyebrow}>{SLOT_NAMES[slot]}</Text>
                      <Text style={styles.body}>
                        {state.gear[slot]?.name ?? "Leeg slot"}
                      </Text>
                      {state.gear[slot] && (
                        <>
                          <Text style={styles.small}>
                            +{state.gear[slot]!.attack} ATK · +
                            {state.gear[slot]!.hp} HP · +
                            {state.gear[slot]!.armor} ARM
                          </Text>
                          <Button
                            label="Afleggen"
                            disabled={state.inventory.length >= state.bags * 12}
                            onPress={() => act((s) => unequip(s, slot))}
                          />
                        </>
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}
            {tab === "Bags" && (
              <>
                <Text style={styles.heading}>Reizigersbags</Text>
                <Text style={styles.body}>
                  {state.inventory.length} / {state.bags * 12} slots ·{" "}
                  {state.bags} / 4 bags
                </Text>
                <Button
                  label="Extra bag · 150 goud"
                  disabled={state.gold < 150 || state.bags >= 4}
                  onPress={() => act(buyBag)}
                />
                {state.inventory.length === 0 && (
                  <View style={styles.card}>
                    <Text style={styles.body}>
                      Je bag is leeg. Versla vijanden voor loot of bezoek de
                      shop.
                    </Text>
                  </View>
                )}
                {state.inventory.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <Text style={styles.eyebrow}>
                      {item.rarity} · {SLOT_NAMES[item.slot]}
                    </Text>
                    <Text style={styles.heading}>{item.name}</Text>
                    <Text style={styles.body}>
                      +{item.attack} ATK · +{item.hp} HP · +{item.armor} ARM
                    </Text>
                    <View style={styles.actions}>
                      <Button
                        label="Uitrusten"
                        onPress={() => act((s) => equip(s, item.id))}
                      />
                      <Button
                        label={`Verkoop · ${item.price} ◉`}
                        onPress={() => act((s) => sell(s, item.id))}
                      />
                    </View>
                  </View>
                ))}
              </>
            )}
            {tab === "Quests" && (
              <>
                <Text style={styles.heading}>Het gebroken daglicht</Text>
                <View style={styles.card}>
                  <Text style={styles.eyebrow}>VERHAAL · {chapter + 1}</Text>
                  <Text style={styles.body}>
                    {ZONES[chapter]?.story ?? EPILOGUE}
                  </Text>
                  {state.mainClaimed < ZONES.length ? (
                    <>
                      <Text style={styles.heading}>
                        Versla {ZONES[state.mainClaimed].boss.name}
                      </Text>
                      <Text style={styles.small}>
                        +{100 * (state.mainClaimed + 1)} XP · +150 goud
                      </Text>
                      <Button
                        label="Claim hoofdstukbeloning"
                        disabled={
                          !state.bosses.includes(ZONES[state.mainClaimed].id)
                        }
                        onPress={() => act(claimMain)}
                      />
                    </>
                  ) : (
                    <Text style={styles.gold}>
                      Alle {ZONES.length} hoofdstukken voltooid.
                    </Text>
                  )}
                </View>
                {MODULES.dailyQuests &&
                  DAILY_QUESTS.map((q) => (
                    <View key={q.id} style={styles.card}>
                      <Text style={styles.eyebrow}>
                        DAILY · RESET OM 00:00 UTC
                      </Text>
                      <Text style={styles.heading}>{q.name}</Text>
                      <Text style={styles.body}>
                        {q.description} ·{" "}
                        {Math.min(q.target, state.daily[q.id])} / {q.target}
                      </Text>
                      <Bar value={state.daily[q.id]} max={q.target} />
                      <Text style={styles.small}>
                        +{q.xp} XP · +{q.gold} goud
                      </Text>
                      <Button
                        label={
                          state.daily.claimed.includes(q.id)
                            ? "Al verzameld"
                            : "Claim daily"
                        }
                        disabled={
                          state.daily.day !==
                            new Date().toISOString().slice(0, 10) ||
                          state.daily.claimed.includes(q.id) ||
                          state.daily[q.id] < q.target
                        }
                        onPress={() => act((s) => claimDaily(s, q.id))}
                      />
                    </View>
                  ))}
              </>
            )}
            {MODULES.shop && tab === "Shop" && (
              <>
                <Text style={styles.heading}>De reizende smid</Text>
                <Text style={styles.body}>
                  “Goud vergaat. Een goed zwaard blijft.”
                </Text>
                {SHOP.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <Text style={styles.eyebrow}>
                      {item.rarity} · {SLOT_NAMES[item.slot]}
                    </Text>
                    <Text style={styles.heading}>{item.name}</Text>
                    <Text style={styles.body}>
                      +{item.attack} ATK · +{item.hp} HP · +{item.armor} ARM
                    </Text>
                    <Button
                      label={`Koop · ${item.price} goud`}
                      disabled={
                        state.gold < item.price ||
                        state.inventory.length >= state.bags * 12
                      }
                      onPress={() => act((s) => buy(s, item.id))}
                    />
                  </View>
                ))}
              </>
            )}
            <Text
              style={[
                styles.small,
                { textAlign: "center", marginVertical: 20 },
              ]}
            >
              LEONIDAS V3 · ALPHA 0.2.0 · {state.kills} overwinningen{"\n"}
              Icons: Lorc · game-icons.net · CC BY 3.0
            </Text>
          </ScrollView>
          <View style={styles.nav}>
            {TABS.map((t) => (
              <Pressable
                key={t}
                onPress={() => {
                  setTab(t);
                  scroll.current?.scrollTo({ y: 0, animated: false });
                }}
                style={[styles.navItem, tab === t && styles.navActive]}
              >
                <Text
                  style={[styles.navText, tab === t && { color: "#e5bc70" }]}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#101b20" },
  header: {
    padding: 20,
    paddingTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#9db0b1",
    textTransform: "uppercase",
    marginBottom: 7,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#f3ead6",
    letterSpacing: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f3ead6",
    marginBottom: 12,
  },
  body: { fontSize: 14, color: "#c4d2cf", lineHeight: 23, marginVertical: 6 },
  small: { fontSize: 11, color: "#8fa7a7", lineHeight: 18 },
  gold: { fontSize: 16, fontWeight: "700", color: "#e5bc70" },
  coin: { alignItems: "flex-end" },
  content: { padding: 20, paddingBottom: 24, gap: 14 },
  card: {
    backgroundColor: "#18282e",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2a3e43",
    gap: 5,
  },
  button: {
    backgroundColor: "#dec08b",
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 9,
    marginTop: 9,
    alignItems: "center",
  },
  buttonText: { color: "#19272a", fontSize: 13, fontWeight: "800" },
  bar: {
    height: 5,
    backgroundColor: "#304149",
    borderRadius: 4,
    overflow: "hidden",
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 9,
  },
  heroIcon: { fontSize: 40, color: "#e5bc70" },
  gearGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  slot: {
    width: "47%",
    minHeight: 125,
    borderWidth: 1,
    backgroundColor: "#18282e",
    borderRadius: 12,
    padding: 14,
  },
  actions: { flexDirection: "row", gap: 10 },
  nav: {
    flexDirection: "row",
    padding: 8,
    paddingBottom: 8,
    backgroundColor: "#16262c",
    borderTopWidth: 1,
    borderColor: "#304149",
  },
  navItem: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 8,
  },
  navActive: { backgroundColor: "#293a3c" },
  navText: { fontSize: 11, color: "#9db0b1", fontWeight: "700" },
});
