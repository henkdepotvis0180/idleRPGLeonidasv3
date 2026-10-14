import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  classFor,
  RARITIES,
  type Slot,
  type WeaponStyle,
  type Enemy,
} from "../content";
import { ACCENT_COLORS, HAIR_COLORS, SKIN_TONES } from "../appearance";
import { type State } from "../engine";
const gold = "#f3cf86";
export type Motion = number | { current: number };
const amount = (v: Motion) => (typeof v === "number" ? v : v.current);
export function Block({
  at = [0, 0, 0],
  size = [1, 1, 1],
  color = "#ffffff",
  round = false,
  rotation = [0, 0, 0],
}: {
  at?: [number, number, number];
  size?: [number, number, number];
  color?: string;
  round?: boolean;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={at} scale={size} rotation={rotation}>
      {round ? <sphereGeometry args={[0.5, 12, 10]} /> : <boxGeometry />}
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}
function Gem({
  at = [0, 0, 0],
  color = gold,
  size = 0.12,
}: {
  at?: [number, number, number];
  color?: string;
  size?: number;
}) {
  return (
    <mesh position={at}>
      <octahedronGeometry args={[size]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.25}
        roughness={0.35}
      />
    </mesh>
  );
}
export function Weapon({
  style,
  color,
}: {
  style: WeaponStyle;
  color: string;
}) {
  if (style === "bow")
    return (
      <group>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.32, 0.035, 6, 16, Math.PI]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <Block at={[0, 0.04, 0]} size={[0.02, 0.65, 0.02]} color={gold} />
        <Block
          at={[0.05, 0.12, 0.06]}
          size={[0.6, 0.025, 0.025]}
          color="#dac69c"
        />
        <Gem at={[0.38, 0.12, 0.06]} color="#cce8ef" size={0.06} />
      </group>
    );
  if (style === "fists")
    return (
      <group>
        <Block size={[0.25, 0.25, 0.25]} color={color} />
        <Gem at={[0, 0, 0.15]} color={gold} />
      </group>
    );
  if (style === "lute")
    return (
      <group>
        <Block
          at={[0, 0.14, 0]}
          size={[0.38, 0.45, 0.18]}
          round
          color="#9a613d"
        />
        <Block at={[0, 0.48, 0]} size={[0.09, 0.45, 0.08]} color={gold} />
        <Block
          at={[0, 0.18, 0.1]}
          size={[0.12, 0.12, 0.02]}
          round
          color="#302535"
        />
        {[-1, 0, 1].map((i) => (
          <Block
            key={i}
            at={[i * 0.025, 0.35, 0.11]}
            size={[0.008, 0.55, 0.01]}
            color="#eddbc4"
          />
        ))}
      </group>
    );
  if (style === "hammer" || style === "axe")
    return (
      <group>
        <Block at={[0, 0.25, 0]} size={[0.065, 0.85, 0.065]} color="#815740" />
        <Block
          at={[0, 0.64, 0]}
          size={style === "hammer" ? [0.48, 0.25, 0.25] : [0.48, 0.38, 0.12]}
          color={color}
        />
        <Gem at={[0, 0.64, 0.14]} color={gold} size={0.09} />
      </group>
    );
  if (style === "staff" || style === "wand" || style === "scythe")
    return (
      <group>
        <Block
          at={[0, 0.3, 0]}
          size={[0.07, style === "wand" ? 0.55 : 1.05, 0.07]}
          color="#89613e"
        />
        {style === "scythe" ? (
          <Block
            at={[0.22, 0.84, 0]}
            size={[0.55, 0.12, 0.07]}
            color={color}
            rotation={[0, 0, -0.25]}
          />
        ) : (
          <Gem
            at={[0, style === "wand" ? 0.63 : 0.92, 0]}
            color={color}
            size={0.18}
          />
        )}
        <Block at={[0, 0.55, 0]} size={[0.12, 0.06, 0.12]} color={gold} />
      </group>
    );
  return (
    <group>
      <Block at={[0, 0.08, 0]} size={[0.075, 0.24, 0.075]} color="#6b4537" />
      <Block at={[0, 0.22, 0]} size={[0.32, 0.065, 0.1]} color={gold} />
      <Block
        at={[0, style === "dagger" ? 0.42 : 0.6, 0]}
        size={[0.105, style === "dagger" ? 0.35 : 0.72, 0.055]}
        color={color}
      />
      <mesh position={[0, style === "dagger" ? 0.63 : 1, 0]}>
        <coneGeometry args={[0.075, 0.15, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Gem at={[0, 0.21, 0.07]} color={color} size={0.055} />
    </group>
  );
}
export function Avatar({
  state,
  attack = 0,
  preview = false,
}: {
  state: State;
  attack?: Motion;
  preview?: boolean;
}) {
  const c = classFor(state.classId);
  const a = state.appearance;
  const accent = ACCENT_COLORS[a.accent];
  const skin = SKIN_TONES[a.skin];
  const hair = HAIR_COLORS[a.hair];
  const tint = (slot: Slot, fallback = accent) =>
    state.gear[slot] ? RARITIES[state.gear[slot]!.rarity].color : fallback;
  const right = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (body.current) body.current.position.y = Math.sin(time * 2.5) * 0.025;
    if (right.current)
      right.current.rotation.z =
        amount(attack) *
          (c.weapon === "bow"
            ? -0.25
            : ["staff", "wand", "lute"].includes(c.weapon)
              ? -0.45
              : -1.35) +
        Math.sin(time * 2) * 0.035;
    if (left.current) left.current.rotation.z = amount(attack) * 0.28;
  });
  if (state.combat.form !== "human" && !preview)
    return (
      <Beast kind={state.combat.form} color={accent} attack={attack} friendly />
    );
  return (
    <group rotation={[0, preview ? -0.15 : 0.35, 0]} ref={body}>
      {/* Original chibi proportions: large head, compact silhouette, hand-built outfit. */}
      <Block
        at={[-0.16, 0.22, 0.01]}
        size={[0.22, 0.34, 0.27]}
        color={tint("boots", "#51455d")}
      />
      <Block
        at={[0.16, 0.22, 0.01]}
        size={[0.22, 0.34, 0.27]}
        color={tint("boots", "#51455d")}
      />
      <Block
        at={[-0.14, 0.47, 0]}
        size={[0.22, 0.33, 0.24]}
        color={tint("legs", "#645b77")}
      />
      <Block
        at={[0.14, 0.47, 0]}
        size={[0.22, 0.33, 0.24]}
        color={tint("legs", "#645b77")}
      />
      <Block
        at={[0, 0.82, 0]}
        size={[0.58, 0.55, 0.34]}
        color={tint("chest", c.color)}
      />
      <Block at={[0, 1.06, 0.13]} size={[0.59, 0.13, 0.21]} color={accent} />
      <Block
        at={[-0.18, 0.87, 0.21]}
        size={[0.13, 0.32, 0.05]}
        color={accent}
      />
      <Block
        at={[0, 0.57, 0.02]}
        size={[0.6, 0.095, 0.36]}
        color={tint("belt", "#604937")}
      />
      <Gem at={[0, 0.57, 0.22]} size={0.07} color={gold} />
      {state.gear.cloak && (
        <Block
          at={[0, 0.82, -0.24]}
          size={[0.65, 0.73, 0.07]}
          color={tint("cloak")}
          rotation={[-0.15, 0, 0]}
        />
      )}
      {[1, -1].map((side) => (
        <group
          key={side}
          ref={side === 1 ? right : left}
          position={[side * 0.39, 1.01, 0]}
        >
          <Block at={[0, -0.13, 0]} size={[0.21, 0.34, 0.23]} color={c.color} />
          {state.gear.shoulders && (
            <Block
              at={[0, 0, 0]}
              size={[0.3, 0.19, 0.3]}
              color={tint("shoulders")}
            />
          )}
          <Block
            at={[0, -0.32, 0.01]}
            size={[0.19, 0.12, 0.2]}
            color={tint("wrists", skin)}
          />
          <Block
            at={[0, -0.43, 0.05]}
            size={[0.22, 0.23, 0.23]}
            round
            color={tint("gloves", skin)}
          />
          {state.gear[side === 1 ? "ring" : "ring2"] && (
            <Gem
              at={[0.02, -0.43, 0.18]}
              size={0.055}
              color={tint(side === 1 ? "ring" : "ring2")}
            />
          )}
          {side === 1 ? (
            <group position={[0.1, -0.42, 0.12]} rotation={[0, 0, -0.18]}>
              <Weapon
                style={state.gear.weapon?.weaponStyle ?? c.weapon}
                color={tint("weapon", "#d5e7eb")}
              />
            </group>
          ) : c.shield || state.gear.offhand ? (
            <group position={[-0.06, -0.25, 0.24]}>
              <Block
                size={[0.43, 0.59, 0.1]}
                color={tint("offhand", "#5c7b96")}
              />
              <Block size={[0.32, 0.47, 0.12]} color="#304459" />
              <Block size={[0.06, 0.42, 0.14]} color={tint("offhand", gold)} />
              <Gem at={[0, 0, 0.12]} color={tint("offhand", gold)} size={0.1} />
            </group>
          ) : null}
        </group>
      ))}
      <Block at={[0, 1.39, 0]} size={[0.84, 0.84, 0.72]} round color={skin} />
      <Block
        at={[-0.42, 1.35, 0]}
        size={[0.16, 0.23, 0.14]}
        round
        color={skin}
      />
      <Block
        at={[0.42, 1.35, 0]}
        size={[0.16, 0.23, 0.14]}
        round
        color={skin}
      />
      <Block
        at={[0, 1.69, -0.04]}
        size={[0.84, 0.36, 0.72]}
        round
        color={hair}
      />
      {Array.from({ length: a.style === 3 ? 5 : 3 }, (_, i) => (
        <Block
          key={i}
          at={[
            (i - (a.style === 3 ? 2 : 1)) * 0.15,
            1.68 - (i % 2) * 0.07,
            0.28,
          ]}
          size={[0.19, a.style === 3 ? 0.36 : 0.25, 0.16]}
          color={hair}
          rotation={[0, 0, (i - 1) * 0.16]}
        />
      ))}
      {a.style === 2 &&
        [-1, 1].map((i) => (
          <Block
            key={i}
            at={[i * 0.47, 1.4, -0.05]}
            size={[0.27, 0.6, 0.3]}
            round
            color={hair}
          />
        ))}
      {a.style === 1 && (
        <Block
          at={[0.23, 1.56, 0.3]}
          size={[0.33, 0.31, 0.15]}
          color={hair}
          rotation={[0, 0, 0.3]}
        />
      )}
      {[-1, 1].map((i) => (
        <group key={i}>
          <Block
            at={[i * 0.17, 1.4, 0.335]}
            size={[0.15, 0.21, 0.07]}
            round
            color="#273141"
          />
          <Block
            at={[i * 0.15, 1.44, 0.37]}
            size={[0.05, 0.065, 0.025]}
            round
            color="#fff7e1"
          />
          <Block
            at={[i * 0.27, 1.25, 0.31]}
            size={[0.12, 0.055, 0.03]}
            round
            color="#df9a91"
          />
          {a.face === 1 && (
            <mesh position={[i * 0.17, 1.41, 0.39]}>
              <torusGeometry args={[0.115, 0.014, 4, 14]} />
              <meshStandardMaterial color="#42384c" />
            </mesh>
          )}
        </group>
      ))}
      {a.face === 1 && (
        <Block at={[0, 1.41, 0.39]} size={[0.13, 0.02, 0.02]} color="#42384c" />
      )}
      <Block
        at={[0, 1.21, 0.35]}
        size={[a.face === 2 ? 0.16 : 0.09, 0.035, 0.025]}
        color="#9c5e57"
      />
      {state.gear.helmet && (
        <group>
          <Block
            at={[0, 1.8, -0.01]}
            size={[0.88, 0.23, 0.76]}
            color={tint("helmet")}
          />
          <Block at={[0, 1.74, 0.36]} size={[0.9, 0.085, 0.08]} color={gold} />
          <Gem at={[0, 1.87, 0.29]} color={tint("helmet")} size={0.15} />
        </group>
      )}
      {state.gear.neck && (
        <group>
          <Block at={[0, 1.04, 0.2]} size={[0.25, 0.04, 0.03]} color={gold} />
          <Gem at={[0, 0.98, 0.2]} color={tint("neck")} size={0.07} />
        </group>
      )}
      {(["trinket", "trinket2"] as const).map(
        (slot, i) =>
          state.gear[slot] && (
            <Gem
              key={slot}
              at={[(i ? 1 : -1) * 0.24, 0.62, 0.23]}
              color={tint(slot)}
              size={0.085}
            />
          ),
      )}
    </group>
  );
}
export function Beast({
  kind = "wolf",
  color = "#77939a",
  attack = 0,
  friendly = false,
}: {
  kind?: "wolf" | "bear";
  color?: string;
  attack?: Motion;
  friendly?: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (root.current)
      root.current.position.y = Math.sin(clock.elapsedTime * 3) * 0.035;
  });
  return (
    <group ref={root} rotation={[0, friendly ? 0.45 : -0.45, 0]}>
      <Block
        at={[0, 0.65, 0]}
        size={[kind === "bear" ? 0.85 : 0.95, 0.62, 0.52]}
        round
        color={color}
      />
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <Block
            key={`${x}${z}`}
            at={[x * 0.28, 0.24, z * 0.18]}
            size={[0.19, 0.42, 0.18]}
            color={color}
          />
        )),
      )}
      <group
        position={[
          (friendly ? 1 : -1) * (0.3 + amount(attack) * 0.08),
          1,
          0.04,
        ]}
      >
        <Block size={[0.65, 0.65, 0.58]} round color={color} />
        <Block
          at={[0, -0.12, 0.3]}
          size={[0.38, 0.25, 0.32]}
          round
          color="#d4d6c8"
        />
        <Block
          at={[0, -0.08, 0.48]}
          size={[0.15, 0.09, 0.06]}
          color="#292d3b"
        />
        {[-1, 1].map((i) => (
          <group key={i}>
            <mesh position={[i * 0.22, 0.35, -0.03]}>
              <coneGeometry args={[0.15, kind === "bear" ? 0.19 : 0.33, 4]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <Block
              at={[i * 0.18, 0.08, 0.27]}
              size={[0.09, 0.12, 0.06]}
              color={friendly ? "#84e2c0" : "#f8c579"}
            />
          </group>
        ))}
      </group>
      <Block
        at={[friendly ? -0.55 : 0.55, 0.85, -0.02]}
        size={[0.47, 0.17, 0.19]}
        color={color}
        rotation={[0, 0, friendly ? -0.4 : 0.4]}
      />
    </group>
  );
}
export function Monster({
  enemy,
  zone,
  attack = 0,
  hit = 0,
}: {
  enemy: Enemy;
  zone: number;
  attack?: Motion;
  hit?: number;
}) {
  if (enemy.art === "wolf")
    return (
      <Beast
        color={
          hit > 0.1
            ? "#f9ddd1"
            : zone === 0
              ? "#8cabc0"
              : zone === 1
                ? "#a97968"
                : "#9e84b6"
        }
        attack={attack}
      />
    );
  if (enemy.art === "ghost")
    return (
      <group position={[0, 0.17 + Math.sin(amount(attack) * 3) * 0.07, 0]}>
        <Block
          at={[0, 0.74, 0]}
          size={[0.77, 1.15, 0.6]}
          round
          color={
            hit > 0.1
              ? "#ffffff"
              : zone === 0
                ? "#94d6bc"
                : zone === 1
                  ? "#d4a8ae"
                  : "#b9a6ec"
          }
        />
        <Block at={[0, 1.08, 0.22]} size={[0.58, 0.41, 0.18]} color="#34414f" />
        {[-1, 1].map((i) => (
          <Gem key={i} at={[i * 0.15, 1.1, 0.34]} color="#baf3ff" size={0.08} />
        ))}
        {[-1, 0, 1].map((i) => (
          <mesh
            key={i}
            position={[i * 0.22, 0.22, 0]}
            rotation={[0, 0, Math.PI]}
          >
            <coneGeometry args={[0.15, 0.5, 6]} />
            <meshStandardMaterial color={zone === 0 ? "#94d6bc" : "#b9a6ec"} />
          </mesh>
        ))}
      </group>
    );
  return (
    <group scale={[1.1, 1.1, 1.1]}>
      <Block
        at={[0, 0.7, 0]}
        size={[0.85, 1, 0.6]}
        color={
          hit > 0.1
            ? "#ffe5b5"
            : zone === 0
              ? "#75584c"
              : zone === 1
                ? "#77556b"
                : "#626294"
        }
      />
      {[-1, 1].map((i) => (
        <group key={i}>
          <Block
            at={[i * 0.3, 0.2, 0]}
            size={[0.27, 0.45, 0.31]}
            color="#3c3f53"
          />
          <Block
            at={[i * 0.59, 0.8, 0]}
            size={[0.28, 0.7, 0.32]}
            color={zone === 0 ? "#6e8e66" : "#a7849d"}
            rotation={[0, 0, i * (0.15 + amount(attack) * 0.6)]}
          />
          <Gem at={[i * 0.54, 1.12, 0.12]} color={gold} size={0.16} />
        </group>
      ))}
      <Block
        at={[0, 1.43, 0]}
        size={[0.75, 0.73, 0.64]}
        round
        color={zone === 0 ? "#99b07c" : zone === 1 ? "#d3acb0" : "#a9a0ce"}
      />
      <Block at={[0, 1.1, 0.32]} size={[0.46, 0.1, 0.04]} color="#3f3348" />
      {[-1, 1].map((i) => (
        <Gem key={i} at={[i * 0.18, 1.46, 0.31]} color="#ffe5a1" size={0.09} />
      ))}
      <Block at={[0, 1.81, 0]} size={[0.78, 0.15, 0.6]} color={gold} />
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * 0.25, 2, 0]}>
          <coneGeometry args={[0.12, 0.32, 4]} />
          <meshStandardMaterial color={gold} />
        </mesh>
      ))}
      {zone === 0 &&
        [-1, 1].map((i) => (
          <Block
            key={i}
            at={[i * 0.39, 1.98, -0.03]}
            size={[0.12, 0.67, 0.1]}
            color="#816b4c"
            rotation={[0, 0, i * -0.45]}
          />
        ))}
      {zone === 2 && (
        <mesh position={[0, 0.78, 0.34]}>
          <torusGeometry args={[0.24, 0.04, 6, 16]} />
          <meshStandardMaterial color={gold} />
        </mesh>
      )}
    </group>
  );
}
