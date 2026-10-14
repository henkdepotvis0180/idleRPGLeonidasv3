import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HeroModel } from "./HeroModel";
import { Monster, Beast, Block } from "./Models";
import { Environment } from "./Environment";
import {
  currentEnemy,
  regionNodes,
  activeCompanion,
  type State,
  bossWarning,
} from "../engine";
import { BIOMES, ZONES, RACES, classFor } from "../content";
const EFFECTS = {
  steel: "#e7d7ac",
  fire: "#ff9b61",
  frost: "#83ddff",
  nature: "#86e1a8",
  holy: "#ffdc82",
  shadow: "#ae7cde",
  arcane: "#d88cf6",
  lightning: "#b1dcff",
  song: "#f1b4da",
};
function Companion({ state }: { state: State }) {
  const c = activeCompanion(state);
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (root.current)
      root.current.position.y = 0.35 + Math.sin(clock.elapsedTime * 3) * 0.08;
  });
  if (!c) return null;
  if (c.kind === "wolf")
    return (
      <group scale={0.58}>
        <Beast color={c.color} friendly />
      </group>
    );
  if (c.kind === "raven")
    return (
      <group ref={root}>
        <Block size={[0.24, 0.22, 0.45]} color={c.color} round />
        {[-1, 1].map((i) => (
          <Block
            key={i}
            at={[i * 0.23, 0.04, 0]}
            size={[0.45, 0.035, 0.3]}
            color={c.color}
            rotation={[0, 0, i * 0.2]}
          />
        ))}
        <Block at={[0, 0.08, 0.28]} size={[0.08, 0.06, 0.15]} color="#a98d54" />
      </group>
    );
  if (c.kind === "construct")
    return (
      <group>
        <Block at={[0, 0.4, 0]} size={[0.35, 0.42, 0.27]} color={c.color} />
        <Block at={[0, 0.72, 0]} size={[0.27, 0.21, 0.24]} color="#6e7a7d" />
        <Block at={[0, 0.73, 0.13]} size={[0.16, 0.04, 0.02]} color="#d5e9d9" />
        {[-1, 1].map((i) => (
          <Block
            key={i}
            at={[i * 0.13, 0.12, 0]}
            size={[0.12, 0.24, 0.17]}
            color="#4d5556"
          />
        ))}
        <Block at={[0.3, 0.43, 0]} size={[0.3, 0.08, 0.1]} color="#525c61" />
      </group>
    );
  return (
    <group ref={root}>
      <mesh>
        <icosahedronGeometry args={[0.17, 1]} />
        <meshStandardMaterial
          color={c.color}
          emissive={c.color}
          emissiveIntensity={1}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.018, 5, 16]} />
        <meshBasicMaterial color={c.color} />
      </mesh>
    </group>
  );
}
function CameraRig({ state, preview }: { state: State; preview: boolean }) {
  const { camera } = useThree();
  const focus = useRef(new THREE.Vector3(0, 1, 0)),
    pos = useRef(new THREE.Vector3()),
    target = useRef(new THREE.Vector3());
  const initialised = useRef(false);
  const previous = useRef(state.world.camera),
    progress = useRef(1),
    orbit = useRef(Math.PI);
  useEffect(() => {
    if (previous.current !== state.world.camera) {
      progress.current = 0;
      previous.current = state.world.camera;
    }
  }, [state.world.camera]);
  useFrame((_, delta) => {
    const roam = state.world.mode === "explore";
    const x = preview
        ? 0
        : state.world.x + (roam ? 0 : state.tactics.lane * 0.9),
      z = preview ? 0 : state.world.z;
    const heading = roam ? state.world.heading : Math.PI;
    orbit.current +=
      Math.atan2(
        Math.sin(heading - orbit.current),
        Math.cos(heading - orbit.current),
      ) * Math.min(1, delta * 4);
    progress.current = Math.min(1, progress.current + delta * 0.7);
    const lift =
      Math.sin(progress.current * Math.PI) *
      (state.world.camera === "overview" ? 6 : 4);
    if (preview) {
      pos.current.set(2.5, 1.85, 4.8);
      target.current.set(0, 1.05, 0);
    } else if (state.world.camera === "third") {
      pos.current.set(
        x - Math.sin(orbit.current) * 4.1,
        2.65 + lift,
        z - Math.cos(orbit.current) * 4.1,
      );
      target.current.set(
        x + Math.sin(orbit.current) * 2.5,
        1.05,
        z + Math.cos(orbit.current) * 2.5,
      );
    } else {
      const height = roam ? 16 : 5.4;
      pos.current.set(
        x + (roam ? 1.4 : 4.3),
        height + lift,
        z + (roam ? 7 : 5.1),
      );
      target.current.set(x, roam ? 0 : 0.8, z + (roam ? -1.7 : -1.2));
    }
    if (!initialised.current) {
      camera.position.copy(pos.current);
      focus.current.copy(target.current);
      initialised.current = true;
    }
    camera.position.lerp(
      pos.current,
      1 - Math.exp(-delta * (preview ? 8 : 3.1)),
    );
    focus.current.lerp(target.current, 1 - Math.exp(-delta * 4));
    camera.lookAt(focus.current);
    if (camera instanceof THREE.PerspectiveCamera) {
      const fov = preview ? 32 : state.world.camera === "third" ? 57 : 46;
      camera.fov = THREE.MathUtils.lerp(
        camera.fov,
        fov,
        Math.min(1, delta * 3),
      );
      camera.updateProjectionMatrix();
    }
  });
  return null;
}
export type ScreenAnchors = Record<"hero" | "enemy", { x: number; y: number }>;
function WorldScene({
  state,
  preview = false,
  running = true,
  onAnchors,
}: {
  state: State;
  preview?: boolean;
  running?: boolean;
  onAnchors?: (anchors: ScreenAnchors) => void;
}) {
  const hero = useRef<THREE.Group>(null),
    foe = useRef<THREE.Group>(null),
    spell = useRef<THREE.Group>(null),
    slash = useRef<THREE.Mesh>(null),
    friend = useRef<THREE.Group>(null);
  const attack = useRef(0),
    enemyAttack = useRef(0),
    progress = useRef(1),
    previous = useRef(state.combat.event),
    oldPosition = useRef([state.world.x, state.world.z]),
    walkUntil = useRef(0),
    walking = useRef(0),
    heroTarget = useRef(new THREE.Vector3()),
    friendTarget = useRef(new THREE.Vector3());
  const camera = useThree((s) => s.camera);
  const projectionTime = useRef(0.2),
    heroProbe = useRef(new THREE.Vector3()),
    enemyProbe = useRef(new THREE.Vector3());
  const biome = BIOMES[state.zone % BIOMES.length],
    roam = state.world.mode === "explore";
  const nodes = useMemo(
    () => regionNodes(state),
    [state.zone, state.run.number],
  );
  const weapon =
    state.gear.weapon?.weaponStyle ?? classFor(state.classId).weapon;
  const arrow = weapon === "bow" && state.combat.effect === "steel",
    ranged = arrow || state.combat.effect !== "steel";
  const bx = preview ? 0 : state.world.x,
    bz = preview ? 0 : state.world.z;
  const hx = bx + (roam ? 0 : state.tactics.lane * 0.9);
  const offensive = state.combat.amount > 0 || state.combat.dotTurns > 0;
  const effect = EFFECTS[state.combat.effect],
    warning = bossWarning(state);
  useEffect(() => {
    if (previous.current !== state.combat.event) {
      progress.current = 0;
      previous.current = state.combat.event;
    }
  }, [state.combat.event]);
  useFrame(({ clock }, delta) => {
    if (
      oldPosition.current[0] !== state.world.x ||
      oldPosition.current[1] !== state.world.z
    ) {
      walkUntil.current = clock.elapsedTime + 0.22;
      oldPosition.current = [state.world.x, state.world.z];
    }
    walking.current = roam && clock.elapsedTime < walkUntil.current ? 1 : 0;
    progress.current = Math.min(1, progress.current + delta * 2.3);
    const p = progress.current;
    attack.current =
      !preview && !roam && p < 0.65 ? Math.sin((p / 0.65) * Math.PI) : 0;
    enemyAttack.current =
      running && !roam && p > 0.65
        ? Math.sin(((p - 0.65) / 0.35) * Math.PI) * 0.5
        : 0;
    if (hero.current) {
      hero.current.position.lerp(
        heroTarget.current.set(hx, 0, bz - attack.current * 0.22),
        Math.min(1, delta * 12),
      );
      hero.current.rotation.y = preview
        ? -0.25
        : roam
          ? state.world.heading
          : Math.PI;
    }
    if (friend.current)
      friend.current.position.lerp(
        friendTarget.current.set(hx - 0.85, 0, bz + 0.2),
        Math.min(1, delta * 4),
      );
    if (foe.current) {
      foe.current.position.set(bx, 0, bz - 2.1 + enemyAttack.current * 0.25);
      foe.current.rotation.z = attack.current * 0.025;
    }
    projectionTime.current += delta;
    if (
      !preview &&
      !roam &&
      onAnchors &&
      hero.current &&
      foe.current &&
      projectionTime.current >= 0.2
    ) {
      projectionTime.current = 0;
      camera.updateMatrixWorld();
      const enemy = currentEnemy(state);
      const raceScale = RACES.find((r) => r.id === state.race)?.scale[1] ?? 1;
      hero.current.getWorldPosition(heroProbe.current);
      heroProbe.current.y +=
        state.combat.form === "human" ? 1.8 * raceScale : 1.3;
      foe.current.getWorldPosition(enemyProbe.current);
      enemyProbe.current.y +=
        enemy.art === "boss"
          ? 2.8
          : enemy.art === "dragon"
            ? 2.5
            : enemy.art === "golem"
              ? enemy.mechanic
                ? 3.2
                : 2.2
              : enemy.art === "soldier"
                ? 2.1
                : 1.4;
      const screen = (point: THREE.Vector3) => {
        point.project(camera);
        return {
          x: THREE.MathUtils.clamp((point.x + 1) / 2, 0.08, 0.86),
          y: THREE.MathUtils.clamp((1 - point.y) / 2, 0.4, 0.84),
        };
      };
      onAnchors({
        hero: screen(heroProbe.current),
        enemy: screen(enemyProbe.current),
      });
    }
    if (spell.current) {
      spell.current.visible = !preview && !roam && ranged && p < 0.9;
      spell.current.position.set(
        offensive ? THREE.MathUtils.lerp(hx, bx, p) : hx,
        offensive ? 1.1 + Math.sin(p * Math.PI) * 0.15 : 1.2,
        offensive ? bz - 0.4 - p * 1.7 : bz,
      );
      spell.current.rotation.y += delta * 4;
      spell.current.scale.setScalar(0.13 + Math.sin(p * Math.PI) * 0.12);
    }
    if (slash.current) {
      slash.current.visible = !preview && !roam && !ranged && p < 0.65;
      slash.current.position.set(hx, 0.9, bz - 0.55);
      slash.current.rotation.z = -p * 2.5;
    }
  });
  return (
    <>
      <color attach="background" args={[preview ? "#273139" : biome.sky]} />
      <fog
        attach="fog"
        args={[
          preview ? "#273139" : biome.fog,
          preview ? 12 : 13,
          preview ? 35 : 43,
        ]}
      />
      <hemisphereLight args={["#dce6e4", "#343f36", 2]} />
      <directionalLight
        position={[-8, 12, 6]}
        intensity={2.5}
        color={state.zone >= 6 ? "#dbeaff" : "#ffe2b6"}
      />
      <directionalLight position={[5, 4, -8]} intensity={1.5} color="#a7bce1" />
      <CameraRig state={state} preview={preview} />
      {preview ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]}>
          <circleGeometry args={[12, 40]} />
          <meshStandardMaterial color="#333d43" roughness={0.9} />
        </mesh>
      ) : (
        <Environment
          zone={state.zone}
          seed={state.run.number}
          nodes={nodes}
          lowPower={state.settings.lowPower}
          faction={state.faction}
        />
      )}
      {preview && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]}>
          <ringGeometry args={[0.85, 0.88, 48]} />
          <meshBasicMaterial color="#a18b66" />
        </mesh>
      )}
      {!preview &&
        roam &&
        nodes
          .filter(
            (n) =>
              !["camp", "cache"].includes(n.kind) &&
              !state.world.visited.includes(n.id),
          )
          .map((n) => (
            <group
              key={n.id}
              position={[n.x, 0, n.z]}
              scale={n.kind === "boss" ? 1 : 0.65}
            >
              <Monster
                enemy={
                  n.kind === "boss"
                    ? ZONES[state.zone].boss
                    : ZONES[state.zone].enemies[n.enemyIndex]
                }
                zone={state.zone}
              />
              {n.kind === "elite" && (
                <mesh position={[0, 2.2, 0]}>
                  <octahedronGeometry args={[0.12]} />
                  <meshBasicMaterial color="#e0aa5f" />
                </mesh>
              )}
            </group>
          ))}
      <group ref={hero} position={[hx, 0, bz]}>
        <HeroModel
          state={state}
          attack={attack}
          preview={preview}
          moving={walking}
        />
      </group>
      {!preview && (
        <group ref={friend} position={[hx - 0.85, 0, bz + 0.2]}>
          <Companion state={state} />
        </group>
      )}
      {!preview && !roam && (
        <>
          <group ref={foe} position={[bx, 0, bz - 2.1]}>
            <Monster
              enemy={currentEnemy(state)}
              zone={state.zone}
              attack={enemyAttack}
            />
          </group>
          {/* Lane telegraph: amber before impact, red on the final turn. */}
          {warning && (
            <mesh
              position={[bx + warning.lane * 0.9, 0.018, bz - 0.2]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.75, 3.4]} />
              <meshBasicMaterial
                color={warning.remaining === 1 ? "#e36d50" : "#d6af5f"}
                transparent
                opacity={warning.remaining <= 2 ? 0.32 : 0.1}
              />
            </mesh>
          )}
          <group ref={spell}>
            {arrow ? (
              <group rotation={[-Math.PI / 2, 0, 0]}>
                <Block size={[0.08, 2, 0.08]} color="#e3d3af" />
                <mesh position={[0, 1.1, 0]}>
                  <coneGeometry args={[0.2, 0.4, 4]} />
                  <meshStandardMaterial color="#acb7bd" />
                </mesh>
              </group>
            ) : (
              <>
                <mesh>
                  <icosahedronGeometry args={[1, 1]} />
                  <meshStandardMaterial
                    color={effect}
                    emissive={effect}
                    emissiveIntensity={1.4}
                    roughness={0.3}
                  />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[1.5, 0.08, 5, 20]} />
                  <meshBasicMaterial color={effect} />
                </mesh>
              </>
            )}
          </group>
          <mesh ref={slash} rotation={[0, 0, -0.4]}>
            <torusGeometry args={[0.53, 0.022, 5, 22, Math.PI * 0.95]} />
            <meshBasicMaterial color={effect} transparent opacity={0.85} />
          </mesh>
          {state.combat.shield > 0 && (
            <mesh position={[hx, 1, bz]} scale={[0.55, 1.05, 0.55]}>
              <sphereGeometry args={[1, 14, 12]} />
              <meshBasicMaterial
                color="#a0d8ed"
                transparent
                opacity={0.12}
                wireframe
              />
            </mesh>
          )}
        </>
      )}
      {/* Contact shadows stay inexpensive on mobile GPUs. */}
      {[
        { x: hx, z: bz },
        ...(!preview && !roam ? [{ x: bx, z: bz - 2.1 }] : []),
      ].map((p, i) => (
        <mesh
          key={i}
          position={[p.x, 0.012, p.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.43, 20]} />
          <meshBasicMaterial color="#182320" transparent opacity={0.3} />
        </mesh>
      ))}
    </>
  );
}

export const BattleWorld = React.memo(WorldScene);
