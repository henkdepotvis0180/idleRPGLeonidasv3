import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { State } from "../engine";
import { classFor, RACES, RARITIES, type Slot } from "../content";
import { ACCENT_COLORS, skinPalette, HAIR_COLORS } from "../appearance";
import { Weapon, Beast, type Motion } from "./Models";
import { SURFACES } from "./materials";
const value = (v: Motion) => (typeof v === "number" ? v : v.current);
type V3 = [number, number, number];
function Part({
  at = [0, 0, 0],
  size = [1, 1, 1],
  color,
  round = false,
  metal = false,
  rotation = [0, 0, 0],
}: {
  at?: V3;
  size?: V3;
  color: string;
  round?: boolean;
  metal?: boolean;
  rotation?: V3;
}) {
  return (
    <mesh position={at} scale={size} rotation={rotation}>
      {round ? <sphereGeometry args={[0.5, 12, 10]} /> : <boxGeometry />}
      <meshStandardMaterial
        color={color}
        map={metal ? SURFACES.metal : round ? undefined : SURFACES.cloth}
        metalness={metal ? 0.65 : 0.05}
        roughness={metal ? 0.38 : 0.88}
      />
    </mesh>
  );
}
function Rivet({ at, color = "#c9b388" }: { at: V3; color?: string }) {
  return (
    <mesh position={at}>
      <sphereGeometry args={[0.018, 6, 5]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
    </mesh>
  );
}
function HeroFigure({
  state,
  attack = 0,
  preview = false,
  moving = 0,
}: {
  state: State;
  attack?: Motion;
  preview?: boolean;
  moving?: Motion;
}) {
  const c = classFor(state.classId),
    a = state.appearance,
    race = RACES.find((r) => r.id === state.race) ?? RACES[0];
  const skin = skinPalette(state.race)[a.skin],
    hair = HAIR_COLORS[a.hair],
    accent = ACCENT_COLORS[a.accent];
  const armor = (slot: Slot, fallback = "#606b72") =>
    state.gear[slot]?.tint ??
    (state.gear[slot]
      ? ["cloak", "belt"].includes(slot)
        ? "#59616b"
        : "#84949d"
      : fallback);
  const root = useRef<THREE.Group>(null),
    right = useRef<THREE.Group>(null),
    left = useRef<THREE.Group>(null),
    legL = useRef<THREE.Group>(null),
    legR = useRef<THREE.Group>(null),
    cloak = useRef<THREE.Group>(null);
  const weapon = state.gear.weapon?.weaponStyle ?? c.weapon;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime,
      swing = value(attack),
      walking = value(moving) > 0;
    if (root.current)
      root.current.position.y =
        Math.sin(t * (walking ? 10 : 2)) * (walking ? 0.025 : 0.008);
    if (right.current) {
      right.current.rotation.x = walking
        ? Math.sin(t * 9) * 0.35
        : -swing * 1.05;
      right.current.rotation.z =
        -0.12 -
        swing *
          (["bow", "staff", "wand", "lute"].includes(weapon) ? 0.3 : 1.15);
    }
    if (left.current) {
      left.current.rotation.x = walking
        ? -Math.sin(t * 9) * 0.35
        : swing * 0.45;
      left.current.rotation.z = 0.12 + swing * 0.12;
    }
    if (legL.current)
      legL.current.rotation.x = walking ? Math.sin(t * 9) * 0.55 : 0;
    if (legR.current)
      legR.current.rotation.x = walking ? -Math.sin(t * 9) * 0.55 : 0;
    if (cloak.current)
      cloak.current.rotation.x =
        -0.14 + Math.sin(t * 3) * 0.035 + (walking ? 0.15 : 0);
  });
  if (state.combat.form !== "human" && !preview)
    return (
      <Beast kind={state.combat.form} color={accent} attack={attack} friendly />
    );
  return (
    <group ref={root} scale={[race.scale[0], race.scale[1], race.scale[2]]}>
      {/* Adult adventurer proportions: natural limb lengths, a smaller head, articulated limbs and fitted armour. */}
      {[-1, 1].map((side) => (
        <group
          key={side}
          ref={side === -1 ? legL : legR}
          position={[side * 0.14, 0.94, 0]}
        >
          <Part
            at={[0, -0.22, 0]}
            size={[0.23, 0.47, 0.26]}
            color={armor("legs", "#3f4548")}
            round={!state.gear.legs}
            metal={!!state.gear.legs}
          />
          <Part
            at={[0, -0.45, 0.09]}
            size={[0.22, 0.15, 0.15]}
            color={armor("legs", "#544b42")}
            round
            metal={!!state.gear.legs}
          />
          <Part
            at={[0, -0.66, 0]}
            size={[0.19, 0.38, 0.22]}
            color={armor("boots", "#3a3431")}
            metal={!!state.gear.boots}
          />
          <Part
            at={[0, -0.85, 0.07]}
            size={[0.22, 0.17, 0.37]}
            color={armor("boots", "#39332e")}
            round
            metal={!!state.gear.boots}
          />
          <Part
            at={[0, -0.92, 0.07]}
            size={[0.23, 0.055, 0.37]}
            color="#282929"
          />
          {state.gear.legs && (
            <Part
              at={[0, -0.22, 0.135]}
              size={[0.035, 0.32, 0.018]}
              color="#c7b999"
              metal
            />
          )}
        </group>
      ))}
      <Part
        at={[0, 1.2, 0]}
        size={[0.56, 0.58, 0.32]}
        color={armor("chest", c.color)}
        round
        metal={!!state.gear.chest}
      />
      <Part
        at={[0, 1.48, 0]}
        size={[0.57, 0.09, 0.32]}
        color={armor("chest", accent)}
        metal={!!state.gear.chest}
      />
      <Part
        at={[0, 1.2, 0.17]}
        size={[0.42, 0.4, 0.04]}
        color={armor("chest", accent)}
        round
        metal={!!state.gear.chest}
      />
      <Part
        at={[0, 1.42, 0.18]}
        size={[0.045, 0.12, 0.025]}
        color="#c8b490"
        metal
      />
      {[-1, 1].map((side) => (
        <React.Fragment key={side}>
          <Part
            at={[side * 0.19, 1.2, 0.2]}
            size={[0.025, 0.33, 0.025]}
            color="#bcaa89"
            rotation={[0, 0, side * -0.1]}
            metal
          />
          {state.gear.chest &&
            [0, 1, 2].map((i) => (
              <Rivet key={i} at={[side * 0.22, 1.3 - i * 0.12, 0.19]} />
            ))}
        </React.Fragment>
      ))}
      <Part
        at={[0, 0.94, 0]}
        size={[0.57, 0.105, 0.35]}
        color={armor("belt", "#46382e")}
      />
      <Part
        at={[0, 0.94, 0.195]}
        size={[0.13, 0.105, 0.045]}
        color="#a58c5b"
        metal
      />
      <Part at={[0, 0.94, 0.22]} size={[0.07, 0.06, 0.012]} color={accent} />
      <Part
        at={[0.25, 0.87, -0.02]}
        size={[0.14, 0.19, 0.17]}
        color="#5d4935"
      />
      {state.gear.belt &&
        [-1, 1].map((i) => (
          <Part
            key={i}
            at={[i * 0.15, 0.79, 0.14]}
            size={[0.18, 0.23, 0.07]}
            color={armor("belt")}
            rotation={[i * 0.08, 0, i * 0.08]}
            metal
          />
        ))}
      {state.gear.cloak && (
        <group ref={cloak} position={[0, 1.5, -0.19]}>
          <Part
            at={[0, -0.49, -0.08]}
            size={[0.6, 0.98, 0.045]}
            color={armor("cloak")}
            rotation={[-0.05, 0, 0]}
          />
          {[-1, 0, 1].map((i) => (
            <Part
              key={i}
              at={[i * 0.17, -0.49, -0.05]}
              size={[0.015, 0.92, 0.02]}
              color="#534d50"
            />
          ))}
        </group>
      )}
      {[-1, 1].map((side) => (
        <group
          key={side}
          ref={side === 1 ? right : left}
          position={[side * 0.34, 1.43, 0]}
        >
          <Part
            at={[0, -0.17, 0]}
            size={[0.21, 0.37, 0.23]}
            color={armor("chest", c.color)}
            round
          />
          {state.gear.shoulders && (
            <group>
              <Part
                at={[side * 0.02, 0.015, 0]}
                size={[0.33, 0.2, 0.36]}
                color={armor("shoulders")}
                round
                metal
              />
              <Part
                at={[side * 0.04, -0.065, 0.01]}
                size={[0.32, 0.055, 0.37]}
                color="#a99b80"
                metal
              />
              {[0, 1].map((i) => (
                <Rivet key={i} at={[side * 0.13, 0.02, -0.1 + i * 0.2]} />
              ))}
            </group>
          )}
          <Part
            at={[0, -0.39, 0.01]}
            size={[0.18, 0.18, 0.19]}
            color={skin}
            round
          />
          <Part
            at={[0, -0.48, 0.015]}
            size={[0.19, 0.22, 0.21]}
            color={armor("wrists", "#685744")}
            metal={!!state.gear.wrists}
          />
          <Part
            at={[0, -0.64, 0.04]}
            size={[0.18, 0.23, 0.19]}
            color={armor("gloves", skin)}
            round
            metal={!!state.gear.gloves}
          />
          {state.gear[side === 1 ? "ring" : "ring2"] && (
            <mesh position={[0, -0.66, 0.145]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.047, 0.012, 5, 10]} />
              <meshStandardMaterial
                color="#d6bc80"
                metalness={0.9}
                roughness={0.25}
              />
            </mesh>
          )}
          {side === 1 ? (
            <group
              position={[0.06, -0.64, 0.13]}
              rotation={[0.1, 0, -0.12]}
              scale={0.88}
            >
              <Weapon
                style={weapon}
                color={armor("weapon", "#bbc4c6")}
                design={state.gear.weapon?.design}
                gem={
                  state.gear.weapon
                    ? RARITIES[state.gear.weapon.rarity].color
                    : accent
                }
              />
            </group>
          ) : (
            (c.shield || state.gear.offhand) && (
              <group position={[-0.03, -0.46, 0.19]} rotation={[0.1, -0.15, 0]}>
                <Part
                  size={[0.43, 0.65, 0.075]}
                  color={armor("offhand", "#62707a")}
                  round
                  metal
                />
                <Part size={[0.34, 0.55, 0.085]} color="#343f48" round metal />
                <Part size={[0.035, 0.54, 0.1]} color="#b9a47a" metal />
                <mesh position={[0, 0, 0.075]}>
                  <sphereGeometry args={[0.09, 10, 8]} />
                  <meshStandardMaterial
                    color="#afbec6"
                    metalness={0.8}
                    roughness={0.3}
                  />
                </mesh>
                {[-1, 1].map((i) => (
                  <Rivet key={i} at={[i * 0.145, 0.17, 0.045]} />
                ))}
              </group>
            )
          )}
        </group>
      ))}
      {state.gear.chest?.design === 1 &&
        [-1, 0, 1].map((i) => (
          <Part
            key={i}
            at={[i * 0.1, 1.18, 0.217]}
            size={[0.06, 0.08, 0.02]}
            color="#b49c6c"
            rotation={[0, 0, Math.PI / 4]}
            metal
          />
        ))}
      {state.gear.shoulders?.design === 2 &&
        [-1, 1].map((i) => (
          <mesh
            key={i}
            position={[i * 0.4, 1.59, 0]}
            rotation={[0, 0, -i * 0.27]}
          >
            <coneGeometry args={[0.06, 0.22, 5]} />
            <meshStandardMaterial
              color="#a9b7ba"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
        ))}
      {state.gear.helmet?.design === 1 && (
        <Part
          at={[0, 1.965, -0.03]}
          size={[0.035, 0.19, 0.27]}
          color={accent}
        />
      )}
      {state.gear.helmet?.design === 2 && (
        <Part
          at={[0, 1.795, 0.165]}
          size={[0.29, 0.12, 0.07]}
          color={armor("helmet")}
          round
          metal
        />
      )}
      <Part at={[0, 1.57, 0]} size={[0.15, 0.19, 0.16]} color={skin} round />
      <group position={[0, 1.83, 0]} scale={[0.93, 0.88, 0.94]}>
        <Part size={[0.34, 0.43, 0.31]} color={skin} round />
        <Part
          at={[0, -0.1, 0.075]}
          size={[0.255, 0.2, 0.225]}
          color={skin}
          round
        />
        <Part
          at={[0, 0.015, 0.17]}
          size={[0.065, 0.12, 0.08]}
          color={skin}
          round
        />
        {[-1, 1].map((i) => (
          <group key={i}>
            <Part
              at={[i * 0.175, -0.005, 0]}
              size={[
                race.id === "elf" ? 0.2 : 0.065,
                race.id === "elf" ? 0.11 : 0.14,
                0.055,
              ]}
              color={skin}
              round
              rotation={[0, 0, i * 0.35]}
            />
            <Part
              at={[i * 0.075, 0.06, 0.142]}
              size={[0.095, 0.043, 0.027]}
              color="#d2cabc"
              round
            />
            <Part
              at={[i * 0.075, 0.06, 0.159]}
              size={[0.033, 0.035, 0.014]}
              color={race.id === "revenant" ? "#97e8eb" : "#47544e"}
              round
            />
            <Part
              at={[i * 0.075, 0.11, 0.145]}
              size={[0.11, 0.024, 0.024]}
              color={hair}
              rotation={[0, 0, i * -0.12]}
            />
            {race.id === "orc" && (
              <mesh
                position={[i * 0.092, -0.095, 0.155]}
                rotation={[0, 0, i * -0.3]}
              >
                <coneGeometry args={[0.027, 0.105, 5]} />
                <meshStandardMaterial color="#e0d6b6" />
              </mesh>
            )}
            {race.id === "draconid" && (
              <mesh
                position={[i * 0.17, 0.22, -0.035]}
                rotation={[0, 0, i * -0.3]}
              >
                <coneGeometry args={[0.06, 0.25, 7]} />
                <meshStandardMaterial color="#55493e" roughness={0.8} />
              </mesh>
            )}
            {a.face === 1 && (
              <mesh position={[i * 0.075, 0.063, 0.178]}>
                <torusGeometry args={[0.057, 0.007, 5, 12]} />
                <meshStandardMaterial
                  color="#554d43"
                  metalness={0.7}
                  roughness={0.4}
                />
              </mesh>
            )}
          </group>
        ))}
        <Part
          at={[0, -0.115, 0.167]}
          size={[a.face === 2 ? 0.11 : 0.085, 0.013, 0.015]}
          color="#825b50"
        />
        {a.face === 2 && (
          <Part
            at={[-0.11, -0.015, 0.145]}
            size={[0.014, 0.085, 0.01]}
            color="#936f61"
            rotation={[0, 0, -0.35]}
          />
        )}
        <Part
          at={[0, 0.16, -0.035]}
          size={[0.36, 0.19, 0.32]}
          color={hair}
          round
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <Part
            key={i}
            at={[
              (i - 2) * 0.067,
              0.185 + (a.style === 3 ? (i % 2) * 0.05 : 0),
              0.07,
            ]}
            size={[0.08, a.style === 3 ? 0.2 : 0.13, 0.17]}
            color={hair}
            round
            rotation={[0, 0, (i - 2) * -0.15]}
          />
        ))}
        {a.style === 1 && (
          <Part
            at={[0.1, 0.09, 0.135]}
            size={[0.16, 0.19, 0.06]}
            color={hair}
            round
            rotation={[0, 0, 0.3]}
          />
        )}
        {a.style === 2 &&
          [-1, 1].map((i) => (
            <Part
              key={i}
              at={[i * 0.18, -0.12, -0.06]}
              size={[0.115, 0.43, 0.15]}
              color={hair}
              round
            />
          ))}
        {race.id === "dwarf" && (
          <Part
            at={[0, -0.2, 0.07]}
            size={[0.28, 0.3, 0.2]}
            color={hair}
            round
          />
        )}
        {state.gear.helmet && (
          <group>
            <Part
              at={[0, 0.18, -0.02]}
              size={[0.4, 0.18, 0.36]}
              color={armor("helmet")}
              round
              metal
            />
            <Part
              at={[0, 0.11, 0.165]}
              size={[0.38, 0.045, 0.04]}
              color="#c3ae84"
              metal
            />
            <Part
              at={[0, 0.11, 0.035]}
              size={[0.04, 0.28, 0.35]}
              color="#b8ad98"
              metal
            />
            {[-1, 1].map((i) => (
              <Part
                key={i}
                at={[i * 0.165, -0.04, 0.08]}
                size={[0.065, 0.21, 0.16]}
                color={armor("helmet")}
                rotation={[0, 0, i * -0.17]}
                metal
              />
            ))}
          </group>
        )}
      </group>
      {state.gear.neck && (
        <group>
          <mesh
            position={[0, 1.45, 0.17]}
            rotation={[0.5, 0, 0]}
            scale={[1, 0.6, 1]}
          >
            <torusGeometry args={[0.12, 0.012, 5, 14]} />
            <meshStandardMaterial
              color="#c6b07a"
              metalness={0.85}
              roughness={0.3}
            />
          </mesh>
          <Rivet
            at={[0, 1.34, 0.21]}
            color={RARITIES[state.gear.neck.rarity].color}
          />
        </group>
      )}
      {(["trinket", "trinket2"] as const).map(
        (slot, i) =>
          state.gear[slot] && (
            <mesh key={slot} position={[(i ? 1 : -1) * 0.23, 0.94, 0.21]}>
              <octahedronGeometry args={[0.05]} />
              <meshStandardMaterial
                color={RARITIES[state.gear[slot]!.rarity].color}
                emissive={RARITIES[state.gear[slot]!.rarity].color}
                emissiveIntensity={0.2}
                metalness={0.4}
                roughness={0.4}
              />
            </mesh>
          ),
      )}
    </group>
  );
}

export const HeroModel = React.memo(
  HeroFigure,
  (a, b) =>
    a.state.classId === b.state.classId &&
    a.state.race === b.state.race &&
    a.state.appearance === b.state.appearance &&
    a.state.gear === b.state.gear &&
    a.state.combat.form === b.state.combat.form &&
    a.attack === b.attack &&
    a.moving === b.moving &&
    a.preview === b.preview,
);
