import React, { useEffect, useRef, useState } from "react";
import { AppState, Pressable, ScrollView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BattleScene } from "./src/components/BattleScene";
import { AdventureScreen } from "./src/components/AdventureScreen";
import { CompanyPanel } from "./src/components/CompanyPanel";
import { ItemMarket } from "./src/components/ItemMarket";
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
  walkWorld,
  moveHero,
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
  const [companyOpen, setCompanyOpen] = useState(false);
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
  useEffect(() => {
    if (!loaded || !selected || !foreground) return;
    const timer = setInterval(() => setState((s) => walkWorld(s)), 120);
    return () => clearInterval(timer);
  }, [loaded, selected, foreground]);
  const power = stats(state);
  const hero = classFor(state.classId);
  const zone = ZONES[state.zone];
  const chapter = Math.min(state.mainClaimed, ZONES.length);
  const itemCard = (item: Item, shop = false) => (
    <Card key={item.id} color={RARITIES[item.rarity].color}>
      <View style={ui.row}>
        <GearIcon slot={item.slot} rarity={item.rarity} item={item} size={56} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={ui.eyebrow}>
            {RARITIES[item.rarity].name} · {SLOT_NAMES[item.slot]}
          </Text>
          <Text style={[ui.subheading, { color: RARITIES[item.rarity].color }]}>
            {shop && item.id === "shop-sword"
              ? `Dawnkeeper ${hero.weapon}`
              : item.name}
          </Text>
        </View>
      </View>
      <Text style={ui.body}>
        +{item.attack} ATK · +{item.hp} HP · +{item.armor} ARM
        {!!item.critical && ` · +${item.critical}% CRIT`}
        {!!item.vitality && ` · +${item.vitality} REGEN`}
      </Text>
      {!!item.itemLevel && (
        <Text style={ui.eyebrow}>
          Item level {item.itemLevel} · Requires level {item.requiredLevel} ·{" "}
          {item.origin}
        </Text>
      )}
      {!!item.material && <Text style={ui.small}>{item.material}</Text>}
      {!!item.description && (
        <Text style={[ui.body, { color: "#bfbaa7", fontStyle: "italic" }]}>
          {item.description}
        </Text>
      )}
      {!shop && (
        <Text style={ui.small}>
          Equipped in this slot: {state.gear[item.slot]?.name ?? "Nothing"}
          {state.gear[item.slot]
            ? ` · ATK ${item.attack - state.gear[item.slot]!.attack >= 0 ? "+" : ""}${item.attack - state.gear[item.slot]!.attack} · HP ${item.hp - state.gear[item.slot]!.hp >= 0 ? "+" : ""}${item.hp - state.gear[item.slot]!.hp}`
            : ""}
        </Text>
      )}
      {shop ? (
        <Button
          label={`Buy · ${item.price} gold`}
          disabled={
            state.gold < item.price ||
            state.level < (item.requiredLevel ?? 1) ||
            state.inventory.length >= state.bags * 12
          }
          onPress={() => act((s) => buy(s, item.id))}
        />
      ) : (
        <View style={ui.actions}>
          <Button
            label={`Equip ${item.name}`}
            disabled={state.level < (item.requiredLevel ?? 1)}
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
      <View
        style={[
          ui.header,
          selected &&
            tab === "Adventure" && {
              paddingVertical: 7,
              paddingHorizontal: 14,
            },
        ]}
      >
        <View>
          <Text style={ui.eyebrow}>THE SHATTERED DAWN</Text>
          <Text
            style={[
              ui.title,
              selected && tab === "Adventure" && { fontSize: 20 },
            ]}
          >
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
          <View style={{ paddingHorizontal: 14, paddingBottom: 7, gap: 4 }}>
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
          {tab === "Adventure" ? (
            <>
              {!!saveError && (
                <Text style={{ color: "#ffc0ad", paddingHorizontal: 14 }}>
                  {saveError}
                </Text>
              )}
              {MODULES.offlineRewards && state.offline && (
                <View style={{ padding: 10 }}>
                  <Button
                    label="Collect offline rewards"
                    onPress={() => act(claimOffline)}
                  />
                </View>
              )}
              <AdventureScreen
                state={state}
                running={running}
                active={foreground}
                toggleRunning={() => setRunning((v) => !v)}
                act={act}
                move={(x, z) => setState((s) => moveHero(s, x, z))}
              />
            </>
          ) : (
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
                        No loot yet. Defeat enemies or visit the travelling
                        smith.
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
                          +{RULES.storyXpPerChapter * (state.mainClaimed + 1)}{" "}
                          XP · +{RULES.storyGold} gold
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
                  {MODULES.companions && (
                    <Button
                      label={
                        companyOpen
                          ? "Close companion lodge"
                          : "Companion lodge"
                      }
                      secondary
                      onPress={() => setCompanyOpen((v) => !v)}
                    />
                  )}
                  {companyOpen && <CompanyPanel state={state} act={act} />}
                  {SHOP.map((item) => itemCard(item, true))}
                  <ItemMarket state={state} itemCard={itemCard} />
                </>
              )}
              {tab === "Settings" && (
                <>
                  <Text style={ui.heading}>Camp settings</Text>
                  <Card>
                    <Text style={ui.subheading}>Sound & music</Text>
                    <Text style={ui.body}>
                      An original ambient theme, sword impacts, spell sounds and
                      a boss victory chime. No third-party samples or music
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
                        act((s) =>
                          setSetting(s, "effects", !s.settings.effects),
                        )
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
                      preview resolution. 3D scenes and audio suspend when the
                      app is in the background.
                    </Text>
                  </Card>
                  <Card>
                    <Text style={ui.subheading}>Save & version</Text>
                    <Text style={ui.body}>
                      Version 0.4.0 · English · Android
                    </Text>
                    <Text style={ui.small}>
                      Your 0.2.0 and 0.3.0 saves upgrade automatically. Progress
                      is stored on this device. Uninstalling removes it; install
                      updates over the existing app.
                    </Text>
                  </Card>
                </>
              )}
              <Text
                style={[ui.small, { textAlign: "center", paddingVertical: 16 }]}
              >
                LEONIDAS V3 · ALPHA 0.4.0 · {state.kills} victories{"\n"}
                Original models, gear icons and procedural audio
              </Text>
            </ScrollView>
          )}
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
