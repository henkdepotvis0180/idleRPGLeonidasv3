import React, { useEffect, useRef, useState } from "react";
import { AppState, Pressable, ScrollView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BattleScene } from "./src/components/BattleScene";
import { CharacterPanel } from "./src/components/CharacterPanel";
import { AbilityPanel } from "./src/components/AbilityPanel";
import { GearIcon } from "./src/components/GearIcon";
import { Button, Bar, Card, ui } from "./src/components/UI";
import { useGameAudio } from "./src/audio/useGameAudio";
import { MODULES, RULES } from "./src/config";
import {
  CLASSES,
  classFor,
  ZONES,
  EPILOGUE,
  SLOT_NAMES,
  SHOP,
  DAILY_QUESTS,
  BLESSINGS,
  RARITIES,
  type Item,
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
  heartbeat,
  resume,
  sell,
  setSetting,
  stats,
  tick,
  xpNeeded,
  type State,
} from "./src/engine";
// Keep the original key: 0.2.0 saves are migrated in-place by decodeSave.
const KEY = "leonidas-v3-save-v2";
const TABS = [
  "Adventure",
  "Hero",
  "Bag",
  "Quests",
  ...(MODULES.shop ? ["Shop"] : []),
  "Settings",
];
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
  const [choiceId, setChoiceId] = useState("warrior");
  const [tab, setTab] = useState("Adventure");
  const [actionVersion, setActionVersion] = useState(0);
  const [running, setRunning] = useState(true);
  const [foreground, setForeground] = useState(true);
  const [saveError, setSaveError] = useState("");
  const scroll = useRef<ScrollView>(null);
  const current = useRef(state);
  current.current = state;
  const active = useRef(true);
  const writes = useRef(Promise.resolve());
  const audioError = useGameAudio(state, loaded && selected && foreground);
  const persist = (s: State) => {
    writes.current = writes.current
      .catch(() => {})
      .then(() => AsyncStorage.setItem(KEY, JSON.stringify(s)))
      .then(() => setSaveError(""))
      .catch(() =>
        setSaveError(
          "Saving failed. Your latest progress has not been stored.",
        ),
      );
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
          setSaveError("Local storage could not be loaded.");
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
      if (active.current) setState((s) => (running ? tick(s) : heartbeat(s)));
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
        setForeground(true);
      } else if (next !== "active" && active.current) {
        active.current = false;
        setForeground(false);
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
    state.appearance,
    state.settings,
    state.lastBoss,
    actionVersion,
  ]);
  const act = (fn: (s: State) => State) => {
    setState((s) => fn(s));
    setActionVersion((v) => v + 1);
  };
  const power = stats(state);
  const hero = classFor(state.classId);
  const zone = ZONES[state.zone];
  const chapter = Math.min(state.mainClaimed, ZONES.length);
  const itemCard = (item: Item, shop = false) => (
    <Card key={item.id} color={RARITIES[item.rarity].color}>
      <View style={ui.row}>
        <GearIcon slot={item.slot} rarity={item.rarity} size={50} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={ui.eyebrow}>
            {RARITIES[item.rarity].name} · {SLOT_NAMES[item.slot]}
          </Text>
          <Text style={[ui.subheading, { color: RARITIES[item.rarity].color }]}>
            {shop && item.slot === "weapon"
              ? `Dawnkeeper ${hero.weapon}`
              : item.name}
          </Text>
        </View>
      </View>
      <Text style={ui.body}>
        +{item.attack} ATK · +{item.hp} HP · +{item.armor} ARM
      </Text>
      {shop ? (
        <Button
          label={`Buy · ${item.price} gold`}
          disabled={
            state.gold < item.price || state.inventory.length >= state.bags * 12
          }
          onPress={() => act((s) => buy(s, item.id))}
        />
      ) : (
        <View style={ui.actions}>
          <Button
            label={`Equip ${item.name}`}
            onPress={() => act((s) => equip(s, item.id))}
          />
          <Button
            label={`Sell · ${item.price} gold`}
            secondary
            onPress={() => act((s) => sell(s, item.id))}
          />
        </View>
      )}
    </Card>
  );
  if (!loaded)
    return (
      <SafeAreaView style={ui.root}>
        <Text style={ui.heading}>Leonidas is awakening…</Text>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={ui.root}>
      <StatusBar style="light" />
      <View style={ui.header}>
        <View>
          <Text style={ui.eyebrow}>THE SHATTERED DAWN</Text>
          <Text style={ui.title}>
            LEONIDAS{" "}
            <Text style={{ fontSize: 13, color: "#bdabc9" }}> / idle</Text>
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={ui.gold}>◉ {state.gold}</Text>
          <Text style={ui.eyebrow}>GOLD</Text>
        </View>
      </View>
      {!selected ? (
        <ScrollView ref={scroll} contentContainerStyle={ui.content}>
          <Text style={ui.heading}>Choose your calling.</Text>
          <Text style={ui.body}>
            14 classes. One shattered dawn. Every hero has two active abilities
            and a weapon of their own.
          </Text>
          <BattleScene
            state={{ ...state, classId: choiceId }}
            running={false}
            preview
            active={foreground}
          />
          <Text style={ui.gold}>
            {classFor(choiceId).name} · {classFor(choiceId).archetype}
          </Text>
          <Text style={ui.body}>{classFor(choiceId).description}</Text>
          <Button
            label={`Begin as ${classFor(choiceId).name}`}
            onPress={() => {
              const n = createState(choiceId);
              setState(n);
              setSelected(true);
              persist(n);
              scroll.current?.scrollTo({ y: 0, animated: false });
            }}
          />
          <View style={ui.grid}>
            {CLASSES.map((c) => (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                accessibilityLabel={`Select ${c.archetype}`}
                onPress={() => setChoiceId(c.id)}
                style={[
                  ui.card,
                  ui.slot,
                  {
                    minHeight: 120,
                    borderColor: choiceId === c.id ? "#e8c88e" : c.color,
                  },
                ]}
              >
                <Text style={{ fontSize: 26, color: c.color }}>{c.icon}</Text>
                <Text style={ui.subheading}>{c.name}</Text>
                <Text style={ui.small}>
                  {c.archetype} · {c.attack} ATK · {c.hp} HP
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <>
          <View style={{ paddingHorizontal: 18, paddingBottom: 10, gap: 6 }}>
            <View style={ui.row}>
              <Text style={ui.body}>
                {hero.icon} {hero.name}
              </Text>
              <Text style={ui.gold}>LVL {state.level}</Text>
            </View>
            <Bar value={state.xp} max={xpNeeded(state.level)} />
            <Text style={ui.small}>
              {state.xp}/{xpNeeded(state.level)} XP · {power.attack} ATK ·{" "}
              {state.hp}/{power.hp} HP · {power.armor} ARM
            </Text>
          </View>
          <ScrollView ref={scroll} contentContainerStyle={ui.content}>
            {!!saveError && (
              <Text style={{ color: "#ffc0ad" }}>{saveError}</Text>
            )}
            {MODULES.offlineRewards && state.offline && (
              <Card>
                <Text style={ui.eyebrow}>WHILE YOU WERE AWAY</Text>
                <Text style={ui.subheading}>Your daylight kept growing.</Text>
                <Text style={ui.body}>
                  {Math.floor(state.offline.seconds / 60)} minutes · +
                  {state.offline.xp} XP · +{state.offline.gold} gold
                </Text>
                <Button
                  label="Collect offline rewards"
                  onPress={() => act(claimOffline)}
                />
                <Text style={ui.small}>
                  Up to 8 hours per absence. No offline boss wins, quest kills
                  or loot.
                </Text>
              </Card>
            )}
            {tab === "Adventure" && (
              <>
                <Text style={ui.eyebrow}>{zone.subtitle}</Text>
                <Text style={ui.heading}>{zone.name}</Text>
                <BattleScene
                  state={state}
                  running={running}
                  active={foreground}
                />
                {state.lastBoss && (
                  <Card
                    color={
                      state.lastBoss.rarity
                        ? RARITIES[state.lastBoss.rarity].color
                        : "#e3c48c"
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
                    <Text style={ui.small}>
                      Bosses grant 2× normal rewards. Epic drops are special
                      finds.
                    </Text>
                    <Button
                      label="Dismiss rewards"
                      secondary
                      onPress={() => act((s) => ({ ...s, lastBoss: null }))}
                    />
                  </Card>
                )}
                {MODULES.roguelike && state.run.choicePending && (
                  <Card>
                    <Text style={ui.eyebrow}>
                      REST POINT · TEMPORARY BLESSING
                    </Text>
                    <Text style={ui.subheading}>Choose your strength</Text>
                    <Text style={ui.body}>
                      Combat waits for your choice. This bonus lasts until your
                      run ends.
                    </Text>
                    {BLESSINGS.map((b) => (
                      <Button
                        key={b.id}
                        label={`${b.name} · ${b.description}`}
                        onPress={() => act((s) => chooseBlessing(s, b.id))}
                      />
                    ))}
                  </Card>
                )}
                <Card>
                  <View style={ui.row}>
                    <Text style={ui.subheading}>
                      {currentEnemy(state).name}
                    </Text>
                    <Text style={ui.small}>{state.enemyHp} HP</Text>
                  </View>
                  <Bar
                    value={state.enemyHp}
                    max={enemyMax(state)}
                    color="#dd939e"
                  />
                  <Text style={ui.small}>
                    YOUR DAYLIGHT · {state.hp}/{power.hp}
                  </Text>
                  <Bar value={state.hp} max={power.hp} color="#83ccb3" />
                  <Text style={ui.body}>{state.log}</Text>
                  <Button
                    label={running ? "Pause expedition" : "Resume expedition"}
                    secondary
                    onPress={() => setRunning((v) => !v)}
                  />
                </Card>
                <AbilityPanel state={state} running={running} act={act} />
                {MODULES.roguelike && (
                  <>
                    <Text style={ui.small}>
                      Blessings:{" "}
                      {state.run.blessings.length
                        ? state.run.blessings
                            .map(
                              (id) => BLESSINGS.find((b) => b.id === id)?.name,
                            )
                            .join(" · ")
                        : "none yet"}
                      . Temporary bonuses fade after each run.
                    </Text>
                    <Button
                      label="Start fresh run · keep gear and level"
                      secondary
                      onPress={() => act(abandonRun)}
                    />
                  </>
                )}
                <Text style={ui.heading}>World map</Text>
                {ZONES.map((z, i) => (
                  <Pressable
                    key={z.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Travel to ${z.name}`}
                    disabled={state.level < z.level}
                    onPress={() => act((s) => changeZone(s, i))}
                  >
                    <Card
                      color={state.zone === i ? "#e3c48c" : undefined}
                      style={{ opacity: state.level < z.level ? 0.45 : 1 }}
                    >
                      <Text style={ui.subheading}>
                        {i + 1}. {z.name}
                        {state.zone === i ? " · ACTIVE" : ""}
                      </Text>
                      <Text style={ui.small}>
                        Level {z.level} · {z.boss.name}{" "}
                        {state.bosses.includes(z.id) ? "✓" : ""}
                      </Text>
                    </Card>
                  </Pressable>
                ))}
              </>
            )}
            {tab === "Hero" && (
              <CharacterPanel state={state} act={act} active={foreground} />
            )}
            {tab === "Bag" && (
              <>
                <Text style={ui.heading}>Traveller’s bag</Text>
                <Text style={ui.body}>
                  {state.inventory.length}/{state.bags * 12} slots ·{" "}
                  {state.bags}/4 bags
                </Text>
                <Button
                  label="Extra bag · 150 gold"
                  disabled={state.gold < 150 || state.bags >= 4}
                  secondary
                  onPress={() => act(buyBag)}
                />
                {!state.inventory.length && (
                  <Card>
                    <Text style={ui.body}>
                      No loot yet. Defeat enemies or visit the travelling smith.
                    </Text>
                  </Card>
                )}
                {state.inventory.map((item) => itemCard(item))}
              </>
            )}
            {tab === "Quests" && (
              <>
                <Text style={ui.heading}>The shattered daylight</Text>
                <Card>
                  <Text style={ui.eyebrow}>
                    STORY · {Math.min(chapter + 1, ZONES.length)}
                  </Text>
                  <Text style={ui.body}>
                    {ZONES[chapter]?.story ?? EPILOGUE}
                  </Text>
                  {state.mainClaimed < ZONES.length ? (
                    <>
                      <Text style={ui.subheading}>
                        Defeat {ZONES[state.mainClaimed].boss.name}
                      </Text>
                      <Text style={ui.small}>
                        +{RULES.storyXpPerChapter * (state.mainClaimed + 1)} XP
                        · +{RULES.storyGold} gold
                      </Text>
                      <Button
                        label="Claim chapter reward"
                        disabled={
                          !state.bosses.includes(ZONES[state.mainClaimed].id)
                        }
                        onPress={() => act(claimMain)}
                      />
                    </>
                  ) : (
                    <Text style={ui.gold}>
                      All {ZONES.length} chapters completed.
                    </Text>
                  )}
                </Card>
                {MODULES.dailyQuests &&
                  DAILY_QUESTS.map((q) => (
                    <Card key={q.id}>
                      <Text style={ui.eyebrow}>
                        DAILY · RESETS AT 00:00 UTC
                      </Text>
                      <Text style={ui.subheading}>{q.name}</Text>
                      <Text style={ui.body}>
                        {q.description} ·{" "}
                        {Math.min(q.target, state.daily[q.id])}/{q.target}
                      </Text>
                      <Bar value={state.daily[q.id]} max={q.target} />
                      <Text style={ui.small}>
                        +{q.xp} XP · +{q.gold} gold
                      </Text>
                      <Button
                        label={
                          state.daily.claimed.includes(q.id)
                            ? "Already collected"
                            : `Claim ${q.name}`
                        }
                        disabled={
                          state.daily.day !==
                            new Date().toISOString().slice(0, 10) ||
                          state.daily.claimed.includes(q.id) ||
                          state.daily[q.id] < q.target
                        }
                        onPress={() => act((s) => claimDaily(s, q.id))}
                      />
                    </Card>
                  ))}
              </>
            )}
            {MODULES.shop && tab === "Shop" && (
              <>
                <Text style={ui.heading}>The travelling smith</Text>
                <Text style={ui.body}>
                  “Gold fades. Good craftsmanship endures.” Weapons adapt to
                  your current class.
                </Text>
                {SHOP.map((item) => itemCard(item, true))}
              </>
            )}
            {tab === "Settings" && (
              <>
                <Text style={ui.heading}>Camp settings</Text>
                <Card>
                  <Text style={ui.subheading}>Sound & music</Text>
                  <Text style={ui.body}>
                    An original ambient theme, sword impacts, spell sounds and a
                    boss victory chime. No third-party samples or music
                    royalties.
                  </Text>
                  <Button
                    label={`Music ${state.settings.music ? "on" : "off"}`}
                    secondary
                    onPress={() =>
                      act((s) => setSetting(s, "music", !s.settings.music))
                    }
                  />
                  <Button
                    label={`Sound effects ${state.settings.effects ? "on" : "off"}`}
                    secondary
                    onPress={() =>
                      act((s) => setSetting(s, "effects", !s.settings.effects))
                    }
                  />
                  {!!audioError && <Text style={ui.small}>{audioError}</Text>}
                </Card>
                <Card>
                  <Text style={ui.subheading}>Graphics</Text>
                  <Button
                    label={`Low graphics ${state.settings.lowPower ? "on" : "off"}`}
                    secondary
                    onPress={() =>
                      act((s) =>
                        setSetting(s, "lowPower", !s.settings.lowPower),
                      )
                    }
                  />
                  <Text style={ui.small}>
                    Low graphics disables antialiasing and reduces browser
                    preview resolution. 3D scenes and audio suspend when the app
                    is in the background.
                  </Text>
                </Card>
                <Card>
                  <Text style={ui.subheading}>Save & version</Text>
                  <Text style={ui.body}>Version 0.3.0 · English · Android</Text>
                  <Text style={ui.small}>
                    Your 0.2.0 save upgrades automatically. Progress is stored
                    on this device. Uninstalling removes it; install updates
                    over the existing app.
                  </Text>
                </Card>
              </>
            )}
            <Text
              style={[ui.small, { textAlign: "center", paddingVertical: 16 }]}
            >
              LEONIDAS V3 · ALPHA 0.3.0 · {state.kills} victories{"\n"}Original
              models, gear icons and procedural audio
            </Text>
          </ScrollView>
          <View style={ui.nav}>
            {TABS.map((t) => (
              <Pressable
                key={t}
                accessibilityRole="button"
                accessibilityLabel={`Open ${t}`}
                onPress={() => {
                  setTab(t);
                  scroll.current?.scrollTo({ y: 0, animated: false });
                }}
                style={[ui.navItem, tab === t && ui.navActive]}
              >
                <Text style={[ui.navText, tab === t && { color: "#f1d49c" }]}>
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
