import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Avatar, Monster, Block } from "./Models";
import { currentEnemy, type State } from "../engine";
import { ZONES, classFor } from "../content";
const EFFECTS = {
  steel: "#e7d7ac",
  fire: "#ff9963",
  frost: "#83ddff",
  nature: "#86e1a8",
  holy: "#ffdc82",
  shadow: "#c296ff",
  arcane: "#d88cf6",
  lightning: "#a7d9ff",
  song: "#f1b4da",
};
export function BattleWorld({
  state,
  preview = false,
  running = true,
}: {
  state: State;
  preview?: boolean;
  running?: boolean;
}) {
  const hero = useRef<THREE.Group>(null),
    foe = useRef<THREE.Group>(null),
    spell = useRef<THREE.Group>(null),
    slash = useRef<THREE.Mesh>(null);
  const attack = useRef(0),
    enemyAttack = useRef(0),
    progress = useRef(1);
  const previous = useRef(state.combat.event);
  const weapon =
    state.gear.weapon?.weaponStyle ?? classFor(state.classId).weapon;
  const arrow = weapon === "bow" && state.combat.effect === "steel";
  const offensive = state.combat.amount > 0 || state.combat.dotTurns > 0;
  const ranged = arrow || state.combat.effect !== "steel";
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(preview ? 0 : 0, 0.7, 0);
  }, [camera, preview]);
  useEffect(() => {
    if (previous.current !== state.combat.event) {
      progress.current = 0;
      previous.current = state.combat.event;
    }
  }, [state.combat.event]);
  useFrame((_, delta) => {
    progress.current = Math.min(1, progress.current + delta * 2.3);
    const p = progress.current;
    attack.current = p < 0.65 ? Math.sin((p / 0.65) * Math.PI) : 0;
    enemyAttack.current =
      running && p > 0.65 ? Math.sin(((p - 0.65) / 0.35) * Math.PI) * 0.5 : 0;
    if (hero.current)
      hero.current.position.x = preview ? 0 : -1.16 + attack.current * 0.23;
    if (foe.current) {
      foe.current.position.x =
        1.2 + attack.current * 0.1 - enemyAttack.current * 0.16;
      foe.current.rotation.z = -attack.current * 0.055;
    }
    if (spell.current) {
      spell.current.visible = ranged && p < 0.9;
      spell.current.position.set(
        offensive ? -0.7 + p * 2.3 : -1.16,
        offensive ? 0.85 + Math.sin(p * Math.PI) * 0.2 : 0.9,
        0.35,
      );
      spell.current.rotation.x = arrow
        ? 0
        : spell.current.rotation.x + delta * 6;
      spell.current.rotation.y = arrow
        ? 0
        : spell.current.rotation.y + delta * 4;
      spell.current.scale.setScalar(0.15 + Math.sin(p * Math.PI) * 0.17);
    }
    if (slash.current) {
      slash.current.visible = !ranged && p < 0.65;
      slash.current.rotation.z = -p * 2.5;
      slash.current.scale.setScalar(1 + attack.current * 0.3);
    }
  });
  const zone = ZONES[state.zone];
  return (
    <>
      <color
        attach="background"
        args={[
          state.zone === 0
            ? "#263e4d"
            : state.zone === 1
              ? "#493748"
              : "#303452",
        ]}
      />
      <ambientLight intensity={1.8} />
      <directionalLight position={[-3, 5, 5]} intensity={3} color="#ffe7ca" />
      <directionalLight position={[3, 2, -3]} intensity={1.7} color="#8aadeb" />
      <mesh position={[0, -0.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[7, 40]} />
        <meshStandardMaterial
          color={
            preview
              ? "#454255"
              : state.zone === 0
                ? "#426d63"
                : state.zone === 1
                  ? "#6f5864"
                  : "#595b82"
          }
          roughness={1}
        />
      </mesh>
      {[-1, 1].map((i) => (
        <mesh
          key={i}
          position={[preview ? 0 : i * 1.18, -0.455, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.52, 24]} />
          <meshBasicMaterial color="#20353d" transparent opacity={0.5} />
        </mesh>
      ))}
      {!preview &&
        Array.from({ length: 8 }, (_, i) => (
          <group
            key={i}
            position={[(i - 3.5) * 1.05, -0.47, -1.6 - (i % 2) * 0.7]}
          >
            {state.zone === 0 ? (
              <>
                <Block
                  at={[0, 0.6, 0]}
                  size={[0.16, 1.2, 0.17]}
                  color="#765b4c"
                />
                <mesh position={[0, 1.35, 0]}>
                  <coneGeometry args={[0.6, 1.65, 6]} />
                  <meshStandardMaterial color={i % 2 ? "#416f65" : "#315b56"} />
                </mesh>
                <mesh position={[0, 1.95, 0]}>
                  <coneGeometry args={[0.45, 1.2, 6]} />
                  <meshStandardMaterial color="#568e79" />
                </mesh>
              </>
            ) : state.zone === 1 ? (
              <>
                <Block at={[0, 0.5, 0]} size={[0.4, 1, 0.4]} color="#867789" />
                <Block
                  at={[0, 1.04, 0]}
                  size={[0.57, 0.14, 0.57]}
                  color="#ab919f"
                />
              </>
            ) : (
              <mesh
                position={[0, 0.6, 0]}
                rotation={[0, 0, (i % 2 ? 1 : -1) * 0.2]}
              >
                <octahedronGeometry args={[0.48]} />
                <meshStandardMaterial
                  color="#b8a1e1"
                  emissive="#695d9d"
                  emissiveIntensity={0.4}
                />
              </mesh>
            )}
          </group>
        ))}
      {!preview &&
        Array.from({ length: 9 }, (_, i) => (
          <mesh
            key={i}
            position={[(i - 4) * 0.72, -0.42, 0.75 + (i % 2) * 0.25]}
            scale={[0.13, 0.05, 0.1]}
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={i % 2 ? "#9caca5" : "#778c83"} />
          </mesh>
        ))}
      <group
        ref={hero}
        position={[preview ? 0 : -1.16, -0.43, 0.1]}
        scale={preview ? 1.2 : 1}
      >
        <Avatar state={state} attack={attack} preview={preview} />
      </group>
      {!preview && (
        <>
          <group ref={foe} position={[1.2, -0.43, 0]}>
            <Monster
              enemy={currentEnemy(state)}
              zone={state.zone}
              attack={enemyAttack}
            />
          </group>
          <group ref={spell}>
            {arrow ? (
              <>
                <Block size={[2.1, 0.12, 0.12]} color="#e8dfc1" />
                <mesh position={[1.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                  <coneGeometry args={[0.3, 0.6, 4]} />
                  <meshStandardMaterial color="#dbcc9e" />
                </mesh>
              </>
            ) : (
              <>
                <mesh>
                  <icosahedronGeometry args={[1, 0]} />
                  <meshStandardMaterial
                    color={EFFECTS[state.combat.effect]}
                    emissive={EFFECTS[state.combat.effect]}
                    emissiveIntensity={1.5}
                  />
                </mesh>
                <mesh>
                  <torusGeometry args={[1.4, 0.08, 5, 16]} />
                  <meshBasicMaterial color={EFFECTS[state.combat.effect]} />
                </mesh>
              </>
            )}
          </group>
          <mesh ref={slash} position={[-0.43, 0.65, 0.45]}>
            <torusGeometry args={[0.52, 0.028, 5, 20, Math.PI * 0.85]} />
            <meshBasicMaterial
              color={EFFECTS[state.combat.effect]}
              transparent
              opacity={0.85}
            />
          </mesh>
          {state.combat.shield > 0 && (
            <mesh position={[-1.16, 0.53, 0.1]}>
              <sphereGeometry args={[0.97, 16, 12]} />
              <meshBasicMaterial
                color="#8fdcfa"
                transparent
                opacity={0.12}
                wireframe
              />
            </mesh>
          )}
        </>
      )}
      <mesh position={[-2.6, 2.9, -4]}>
        <sphereGeometry args={[0.34, 12, 12]} />
        <meshBasicMaterial color="#ffe6b2" />
      </mesh>
    </>
  );
}
