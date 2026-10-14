import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type Enemy } from "../content";

import { DetailedWeapon as Weapon } from "./Weapons";
import { SURFACES } from "./materials";
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
      <meshStandardMaterial
        color={color}
        map={SURFACES.metal}
        roughness={0.58}
        metalness={0.2}
      />
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
export { DetailedWeapon as Weapon } from "./Weapons";
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
  const root = useRef<THREE.Group>(null),
    head = useRef<THREE.Group>(null);
  const legs = useRef<(THREE.Group | null)[]>([]);
  const bear = kind === "bear";
  useFrame(({ clock }) => {
    if (root.current)
      root.current.position.y = Math.sin(clock.elapsedTime * 2.5) * 0.015;
    if (head.current) head.current.rotation.x = -amount(attack) * 0.25;
    legs.current.forEach((leg, i) => {
      if (leg)
        leg.rotation.x =
          Math.sin(clock.elapsedTime * 2.5 + i * Math.PI) * 0.035 +
          amount(attack) * (i % 2 ? 0.18 : -0.18);
    });
  });
  return (
    <group ref={root} rotation={[0, friendly ? -0.1 : 0, 0]}>
      <Block
        at={[0, 0.69, 0]}
        size={[bear ? 0.76 : 0.48, bear ? 0.66 : 0.46, 1.15]}
        round
        color={color}
      />
      <Block
        at={[0, 0.77, 0.33]}
        size={[bear ? 0.77 : 0.54, bear ? 0.72 : 0.56, 0.59]}
        round
        color={color}
      />
      {[-1, 1].flatMap((x, i) =>
        [-1, 1].map((z, j) => (
          <group
            key={`${x}-${z}`}
            ref={(leg) => {
              legs.current[i * 2 + j] = leg;
            }}
            position={[x * (bear ? 0.27 : 0.18), 0.55, z * 0.37]}
          >
            <Block
              at={[0, -0.2, 0]}
              size={[bear ? 0.21 : 0.13, 0.47, bear ? 0.24 : 0.14]}
              color={color}
              round
            />
            <Block
              at={[0, -0.46, 0.07]}
              size={[bear ? 0.26 : 0.18, 0.12, bear ? 0.32 : 0.24]}
              color={color}
              round
            />
            {bear &&
              [0, 1, 2].map((k) => (
                <Block
                  key={k}
                  at={[(k - 1) * 0.065, -0.46, 0.24]}
                  size={[0.025, 0.03, 0.085]}
                  color="#d6d1b9"
                />
              ))}
          </group>
        )),
      )}
      <group ref={head} position={[0, 1.05, 0.58]}>
        <Block
          size={[bear ? 0.58 : 0.35, bear ? 0.51 : 0.37, bear ? 0.56 : 0.46]}
          round
          color={color}
        />
        <Block
          at={[0, -0.09, 0.27]}
          size={[bear ? 0.34 : 0.21, 0.19, bear ? 0.32 : 0.4]}
          round
          color="#b8bbb1"
        />
        <Block
          at={[0, -0.065, bear ? 0.44 : 0.46]}
          size={[bear ? 0.15 : 0.11, 0.085, 0.06]}
          round
          color="#292d30"
        />
        <Block
          at={[0, -0.15, 0.26]}
          size={[bear ? 0.28 : 0.18, 0.025, 0.29]}
          color="#34393d"
        />
        {[-1, 1].map((i) => (
          <group key={i}>
            <mesh
              position={[i * (bear ? 0.2 : 0.115), bear ? 0.27 : 0.26, -0.09]}
              rotation={[0.1, 0, i * 0.15]}
            >
              {bear ? (
                <sphereGeometry args={[0.085, 8, 6]} />
              ) : (
                <coneGeometry args={[0.09, 0.25, 5]} />
              )}
              <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            <Block
              at={[i * (bear ? 0.23 : 0.137), 0.055, 0.165]}
              size={[0.065, 0.044, 0.035]}
              round
              color={friendly ? "#b2c78b" : "#d4bd77"}
            />
            <Block
              at={[i * (bear ? 0.23 : 0.137), 0.055, 0.186]}
              size={[0.02, 0.035, 0.011]}
              color="#25332e"
            />
            <Block
              at={[i * (bear ? 0.23 : 0.137), 0.093, 0.16]}
              size={[0.095, 0.025, 0.025]}
              color={color}
              rotation={[0, 0, i * 0.12]}
            />
            {!bear && (
              <mesh
                position={[i * 0.064, -0.145, 0.26]}
                rotation={[Math.PI, 0, 0]}
              >
                <coneGeometry args={[0.018, 0.07, 4]} />
                <meshStandardMaterial color="#d8d8c5" />
              </mesh>
            )}
          </group>
        ))}
      </group>
      <Block
        at={[0, 0.74, -0.78]}
        size={[bear ? 0.13 : 0.15, 0.15, bear ? 0.16 : 0.58]}
        round
        color={color}
        rotation={[bear ? 0 : -0.3, 0, 0]}
      />
      {friendly && (
        <group>
          <Block
            at={[0, 0.91, 0.43]}
            size={[bear ? 0.78 : 0.57, 0.1, 0.13]}
            color="#8e7958"
          />
          <Gem at={[0, 0.92, 0.52]} color="#bddfbe" size={0.045} />
        </group>
      )}
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
  if (enemy.art === "dragon") return <FrostDragon attack={attack} />;
  if (enemy.art === "golem")
    return (
      <group scale={enemy.mechanic ? 1.45 : 1}>
        <Block
          at={[0, 1.2, 0]}
          size={[1.15, 1.1, 0.7]}
          color={zone >= 6 ? "#899da9" : "#697464"}
          round
        />
        <Block
          at={[0, 1.86, 0.03]}
          size={[0.43, 0.43, 0.4]}
          color={zone >= 6 ? "#bacbd0" : "#a5ae8d"}
        />
        <Block
          at={[0, 1.92, 0.24]}
          size={[0.27, 0.04, 0.03]}
          color={zone >= 6 ? "#a2e2ff" : "#b7df92"}
        />
        {[-1, 1].map((i) => (
          <group key={i}>
            <Block
              at={[i * 0.35, 0.42, 0]}
              size={[0.4, 0.8, 0.5]}
              color="#4f5d5d"
            />
            <Block
              at={[i * 0.79, 1.04, 0]}
              size={[0.43, 1, 0.5]}
              color={zone >= 6 ? "#91a9b5" : "#768471"}
              rotation={[0, 0, i * 0.13]}
            />
            <Block
              at={[i * 0.84, 0.52, 0.03]}
              size={[0.47, 0.4, 0.53]}
              color="#4f6060"
            />
            <Gem
              at={[i * 0.55, 1.52, 0.25]}
              color={zone >= 6 ? "#a8dff7" : "#b2cf80"}
              size={0.16}
            />
            {[0, 1, 2].map((j) => (
              <Block
                key={j}
                at={[i * 0.34, 0.33 + j * 0.25, 0.27]}
                size={[0.32, 0.04, 0.03]}
                color="#91a095"
              />
            ))}
          </group>
        ))}
        {enemy.mechanic && (
          <group position={[0, 1.2, 0.45]}>
            <mesh>
              <torusGeometry args={[0.36, 0.06, 6, 16]} />
              <meshStandardMaterial
                color="#8d7d51"
                metalness={0.7}
                roughness={0.5}
              />
            </mesh>
            <Block size={[0.12, 0.48, 0.12]} color="#afa16b" />
          </group>
        )}
      </group>
    );
  if (enemy.art === "soldier")
    return (
      <group>
        {[-1, 1].map((i) => (
          <group key={i}>
            <Block
              at={[i * 0.15, 0.44, 0]}
              size={[0.23, 0.88, 0.28]}
              color="#45545d"
            />
            <Block
              at={[i * 0.15, 0.1, 0.08]}
              size={[0.25, 0.18, 0.4]}
              color="#3b464d"
            />
            <Block
              at={[i * 0.37, 1.23, 0]}
              size={[0.22, 0.7, 0.26]}
              color={zone >= 6 ? "#8095a5" : "#827d69"}
              rotation={[0, 0, i * 0.14]}
            />
            <Block
              at={[i * 0.39, 1.55, 0]}
              size={[0.35, 0.18, 0.38]}
              color="#a3a78f"
            />
          </group>
        ))}
        <Block
          at={[0, 1.22, 0]}
          size={[0.57, 0.65, 0.36]}
          color={zone >= 6 ? "#637c8b" : "#6b7062"}
        />
        <Block
          at={[0, 1.88, 0]}
          size={[0.36, 0.4, 0.35]}
          color="#7e918f"
          round
        />
        <Block
          at={[0, 1.92, 0.18]}
          size={[0.28, 0.035, 0.03]}
          color="#c7debb"
        />
        <Block
          at={[0, 1.85, 0.19]}
          size={[0.035, 0.28, 0.035]}
          color="#485e68"
        />
        <Block at={[0, 1.02, 0.2]} size={[0.5, 0.06, 0.04]} color="#ac986f" />
        <group position={[-0.45, 0.86, 0.15]} rotation={[0, 0, -0.2]}>
          <Weapon style="sword" color={zone >= 6 ? "#bad7e2" : "#bab7a2"} />
        </group>
        <Block
          at={[0.43, 1.02, 0.2]}
          size={[0.35, 0.54, 0.1]}
          color="#485b65"
        />
      </group>
    );
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
  const frost = zone >= 6,
    wood = zone === 0,
    plate = frost
      ? "#597585"
      : zone === 1
        ? "#6e5454"
        : zone === 2
          ? "#68667e"
          : "#697171";
  return (
    <group scale={wood ? 1.1 : 1.05}>
      {[-1, 1].map((i) => (
        <group key={i}>
          <Block
            at={[i * 0.19, 0.58, 0]}
            size={[0.3, 1.12, 0.34]}
            color={wood ? "#695a43" : plate}
          />
          <Block
            at={[i * 0.19, 0.12, 0.1]}
            size={[0.33, 0.2, 0.48]}
            color="#36454c"
          />
          <Block
            at={[i * 0.45, 1.49, 0]}
            size={[0.28, 0.8, 0.35]}
            color={plate}
            rotation={[0, 0, i * (0.1 + amount(attack) * 0.3)]}
          />
          <Block
            at={[i * 0.51, 1.89, 0]}
            size={[0.51, 0.29, 0.54]}
            color={wood ? "#637b4f" : frost ? "#7e9fae" : "#a39980"}
          />
          <Gem
            at={[i * 0.51, 1.9, 0.29]}
            color={frost ? "#a2d8ed" : gold}
            size={0.1}
          />
          {wood && (
            <Block
              at={[i * 0.45, 2.27, 0]}
              size={[0.11, 0.74, 0.1]}
              color="#786549"
              rotation={[0, 0, i * -0.5]}
            />
          )}
          {frost && (
            <mesh position={[i * 0.5, 2.1, 0]} rotation={[0, 0, i * -0.2]}>
              <coneGeometry args={[0.14, 0.65, 5]} />
              <meshStandardMaterial
                color="#b8d4de"
                metalness={0.4}
                roughness={0.4}
              />
            </mesh>
          )}
        </group>
      ))}
      <Block at={[0, 1.52, 0]} size={[0.77, 0.85, 0.45]} color={plate} />
      <Block
        at={[0, 1.54, 0.24]}
        size={[0.54, 0.58, 0.055]}
        color={wood ? "#7c925c" : frost ? "#849ba6" : "#a29981"}
      />
      <Block at={[0, 1.14, 0.01]} size={[0.8, 0.12, 0.49]} color="#4f473c" />
      {[-1, 0, 1].map((i) => (
        <Block
          key={i}
          at={[i * 0.21, 0.97, 0.16]}
          size={[0.2, 0.35, 0.09]}
          color={plate}
          rotation={[0, 0, i * 0.1]}
        />
      ))}
      <Block
        at={[0, 1.46, -0.28]}
        size={[0.83, 1.45, 0.05]}
        color={frost ? "#304955" : zone === 1 ? "#6e3943" : "#4a465a"}
        rotation={[-0.12, 0, 0]}
      />
      <Block
        at={[0, 2.23, 0]}
        size={[0.4, 0.47, 0.38]}
        color={wood ? "#9b9971" : frost ? "#91a5b0" : "#a2948a"}
        round
      />
      {[-1, 1].map((i) => (
        <Gem
          key={i}
          at={[i * 0.09, 2.28, 0.19]}
          color={frost ? "#8ee1ff" : zone === 1 ? "#ffb18a" : "#ded397"}
          size={0.04}
        />
      ))}
      <Block
        at={[0, 2.42, -0.02]}
        size={[0.47, 0.13, 0.42]}
        color={frost ? "#819aa5" : gold}
      />
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * 0.17, 2.61, 0]}>
          <coneGeometry args={[0.065, 0.36, 4]} />
          <meshStandardMaterial
            color={frost ? "#afcbd4" : gold}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      ))}
      <Block
        at={[0, 2.32, 0.2]}
        size={[0.035, 0.28, 0.045]}
        color={frost ? "#637e91" : "#6d6659"}
      />
      {zone === 2 ? (
        <mesh position={[0, 1.55, 0.3]}>
          <torusGeometry args={[0.21, 0.035, 6, 18]} />
          <meshStandardMaterial color={gold} metalness={0.65} roughness={0.3} />
        </mesh>
      ) : (
        <Gem at={[0, 1.61, 0.3]} color={frost ? "#a5d8ed" : gold} size={0.1} />
      )}
      {!wood && (
        <group
          position={[-0.58, 0.97, 0.17]}
          rotation={[0, 0, -0.2]}
          scale={1.25}
        >
          <Weapon
            style={frost ? "sword" : zone === 1 ? "staff" : "hammer"}
            color={frost ? "#b0d7e7" : "#d1c0a4"}
          />
        </group>
      )}
    </group>
  );
}
function FrostDragon({ attack }: { attack: Motion }) {
  const wings = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (wings.current)
      wings.current.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.045;
  });
  return (
    <group scale={1.25}>
      <Block at={[0, 1.13, 0]} size={[0.83, 0.86, 1.6]} color="#728e9f" round />
      <Block
        at={[0, 1.3, 0.74]}
        size={[0.5, 0.75, 0.58]}
        color="#a1bac5"
        round
        rotation={[-0.3, 0, 0]}
      />
      <Block
        at={[0, 1.76, 1.02]}
        size={[0.55, 0.45, 0.78]}
        color="#879fac"
        round
      />
      <Block
        at={[0, 1.63, 1.35]}
        size={[0.47, 0.18, 0.48]}
        color="#bfd2d6"
        round
      />
      {[-1, 1].map((i) => (
        <group key={i}>
          <Gem at={[i * 0.23, 1.85, 1.24]} color="#b1f0ff" size={0.06} />
          <mesh position={[i * 0.2, 2.08, 0.82]} rotation={[0.4, 0, i * 0.35]}>
            <coneGeometry args={[0.09, 0.56, 6]} />
            <meshStandardMaterial color="#c3d3d2" />
          </mesh>
          {[-1, 1].map((z) => (
            <group key={z}>
              <Block
                at={[i * 0.43, 0.48, z * 0.58]}
                size={[0.23, 0.85, 0.28]}
                color="#667c8b"
                rotation={[0.15, 0, i * 0.18]}
              />
              <Block
                at={[i * 0.5, 0.1, z * 0.58 + 0.1]}
                size={[0.32, 0.16, 0.42]}
                color="#b2c5cc"
              />
            </group>
          ))}
        </group>
      ))}
      <group ref={wings}>
        {[-1, 1].map((i) => (
          <group
            key={i}
            position={[i * 0.35, 1.5, -0.2]}
            rotation={[0, 0, i * 0.12]}
          >
            <mesh
              position={[i * 0.9, 0.3, -0.1]}
              rotation={[Math.PI / 2, 0, i * 0.2]}
              scale={[1.6, 1.1, 1]}
            >
              <circleGeometry args={[1, 3, 0, Math.PI]} />
              <meshStandardMaterial
                color="#819ba9"
                side={THREE.DoubleSide}
                map={SURFACES.cloth}
                roughness={0.9}
              />
            </mesh>
            <Block
              at={[i * 0.7, 0.31, 0]}
              size={[1.6, 0.07, 0.07]}
              color="#b4c9cf"
              rotation={[0, 0, i * 0.2]}
            />
            <Block
              at={[i * 1.05, 0.12, -0.42]}
              size={[1.3, 0.045, 0.045]}
              color="#bbd1d7"
              rotation={[0, i * 0.55, i * -0.2]}
            />
          </group>
        ))}
      </group>
      <Block
        at={[0, 0.87, -1.22]}
        size={[0.26, 0.26, 1.27]}
        color="#7b9aaa"
        round
        rotation={[0.15, 0, 0]}
      />
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 1.64 - i * 0.1, -0.5 - i * 0.27]}>
          <coneGeometry args={[0.12, 0.33, 4]} />
          <meshStandardMaterial
            color="#bddee7"
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}
