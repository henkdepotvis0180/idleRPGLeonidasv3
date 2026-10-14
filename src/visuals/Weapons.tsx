import React from "react";
import * as THREE from "three";
import type { WeaponStyle } from "../content";
import { SURFACES } from "./materials";
const bladeShape = new THREE.Shape();
bladeShape.moveTo(-0.07, 0);
bladeShape.lineTo(0.07, 0);
bladeShape.lineTo(0.06, 0.57);
bladeShape.lineTo(0, 0.77);
bladeShape.lineTo(-0.06, 0.57);
bladeShape.closePath();
const axeShape = new THREE.Shape();
axeShape.moveTo(0.01, 0);
axeShape.quadraticCurveTo(0.26, 0.19, 0.32, 0.13);
axeShape.lineTo(0.28, -0.25);
axeShape.quadraticCurveTo(0.13, -0.18, 0.01, -0.13);
axeShape.closePath();
const scytheShape = new THREE.Shape();
scytheShape.moveTo(0, 0);
scytheShape.bezierCurveTo(0.2, 0.17, 0.58, 0.14, 0.65, -0.25);
scytheShape.bezierCurveTo(0.47, -0.07, 0.3, -0.01, 0, -0.05);
scytheShape.closePath();
function Rod({
  at = [0, 0, 0],
  radius = 0.025,
  length = 0.7,
  color = "#6c4d34",
  rotation = [0, 0, 0],
}: {
  at?: [number, number, number];
  radius?: number;
  length?: number;
  color?: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={at} rotation={rotation}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial
        color={color}
        map={SURFACES.metal}
        metalness={0.3}
        roughness={0.6}
      />
    </mesh>
  );
}
function Crystal({
  at,
  size,
  color,
}: {
  at: [number, number, number];
  size: number;
  color: string;
}) {
  return (
    <mesh position={at}>
      <octahedronGeometry args={[size]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.25}
        metalness={0.25}
        roughness={0.25}
      />
    </mesh>
  );
}
/** Original forged silhouettes, with profile/bevelled blades and three ornamental variants. */
export function DetailedWeapon({
  style,
  color,
  design = 0,
  gem = "#b8c7d3",
}: {
  style: WeaponStyle;
  color: string;
  design?: number;
  gem?: string;
}) {
  const trim = design === 1 ? "#bca16d" : design === 2 ? "#819594" : "#b8b2a0";
  if (style === "sword" || style === "dagger")
    return (
      <group>
        <Rod at={[0, 0.08, 0]} radius={0.035} length={0.24} />
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[0, 0.02 + i * 0.06, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.037, 0.005, 4, 8]} />
            <meshStandardMaterial color={trim} />
          </mesh>
        ))}
        <mesh position={[0, 0.23, 0]} rotation={[0, 0, design === 2 ? 0.1 : 0]}>
          <boxGeometry args={[design === 1 ? 0.36 : 0.3, 0.055, 0.07]} />
          <meshStandardMaterial
            color={trim}
            map={SURFACES.metal}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
        <mesh
          position={[0, 0.26, -0.015]}
          scale={[design === 1 ? 1.3 : 1, style === "dagger" ? 0.48 : 1, 1]}
        >
          <extrudeGeometry
            args={[
              bladeShape,
              {
                depth: 0.028,
                bevelEnabled: true,
                bevelSize: 0.012,
                bevelThickness: 0.008,
                bevelSegments: 1,
                steps: 1,
              },
            ]}
          />
          <meshStandardMaterial
            color={color}
            map={SURFACES.metal}
            metalness={0.8}
            roughness={0.28}
          />
        </mesh>
        <Rod
          at={[0, style === "dagger" ? 0.42 : 0.59, 0.022]}
          radius={0.008}
          length={style === "dagger" ? 0.26 : 0.56}
          color={trim}
        />
        <Crystal at={[0, -0.055, 0]} size={0.052} color={gem} />
      </group>
    );
  if (style === "axe" || style === "hammer")
    return (
      <group>
        <Rod at={[0, 0.29, 0]} radius={0.034} length={0.93} />
        <Rod at={[0, 0.24, 0]} radius={0.043} length={0.13} color={trim} />
        {style === "axe" ? (
          <mesh position={[0.025, 0.75, -0.025]}>
            <extrudeGeometry
              args={[
                axeShape,
                {
                  depth: 0.05,
                  bevelEnabled: true,
                  bevelSize: 0.018,
                  bevelThickness: 0.01,
                  bevelSegments: 1,
                },
              ]}
            />
            <meshStandardMaterial
              color={color}
              map={SURFACES.metal}
              metalness={0.7}
              roughness={0.33}
            />
          </mesh>
        ) : (
          <mesh position={[0, 0.71, 0]}>
            <boxGeometry args={[0.45, 0.25, 0.23]} />
            <meshStandardMaterial
              color={color}
              map={SURFACES.metal}
              metalness={0.75}
              roughness={0.3}
            />
          </mesh>
        )}
        <Rod at={[0, 0.7, 0.13]} length={0.2} radius={0.028} color={trim} />
        <Crystal at={[0, 0.74, 0.15]} size={0.06} color={gem} />
        {design === 2 && (
          <mesh
            position={[style === "axe" ? 0.03 : 0.26, 0.71, 0]}
            rotation={[0, 0, -Math.PI / 2]}
          >
            <coneGeometry args={[0.045, 0.2, 5]} />
            <meshStandardMaterial
              color={trim}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        )}
      </group>
    );
  if (["staff", "wand", "scythe"].includes(style)) {
    const top = style === "wand" ? 0.62 : 0.94;
    return (
      <group>
        <Rod
          at={[0, 0.35, 0]}
          length={style === "wand" ? 0.58 : 1.12}
          radius={0.025}
        />
        {[0, 1, 2].map((i) => (
          <Rod
            key={i}
            at={[0, 0.19 + i * 0.25, 0]}
            length={0.045}
            radius={0.036}
            color={trim}
          />
        ))}
        {style === "scythe" ? (
          <mesh position={[0, top, -0.02]}>
            <extrudeGeometry
              args={[
                scytheShape,
                {
                  depth: 0.035,
                  bevelEnabled: true,
                  bevelSize: 0.009,
                  bevelThickness: 0.007,
                  bevelSegments: 1,
                },
              ]}
            />
            <meshStandardMaterial
              color={color}
              map={SURFACES.metal}
              metalness={0.8}
              roughness={0.28}
            />
          </mesh>
        ) : (
          <group position={[0, top, 0]}>
            <Crystal
              at={[0, 0, 0]}
              size={style === "wand" ? 0.11 : 0.16}
              color={gem}
            />
            {[-1, 1].map((i) => (
              <Rod
                key={i}
                at={[i * 0.1, -0.035, 0]}
                length={0.2}
                radius={0.014}
                color={trim}
                rotation={[0, 0, -i * 0.4]}
              />
            ))}
          </group>
        )}
        {design === 1 && style !== "scythe" && (
          <mesh position={[0, top, 0]}>
            <torusGeometry args={[0.22, 0.018, 6, 18]} />
            <meshStandardMaterial
              color={trim}
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
        )}
      </group>
    );
  }
  if (style === "bow")
    return (
      <group>
        {[-1, 1].map((i) => (
          <group key={i}>
            <mesh
              position={[0, i * 0.05, 0]}
              rotation={[0, 0, i === 1 ? Math.PI / 2 : -Math.PI / 2]}
            >
              <torusGeometry args={[0.33, 0.025, 7, 20, Math.PI * 0.83]} />
              <meshStandardMaterial
                color={color}
                map={SURFACES.metal}
                metalness={0.3}
                roughness={0.5}
              />
            </mesh>
            <Crystal at={[0, i * 0.34, 0]} size={0.045} color={gem} />
          </group>
        ))}
        <Rod at={[0, 0, 0]} radius={0.035} length={0.15} color="#574531" />
        <Rod at={[0.17, 0, 0]} radius={0.004} length={0.74} color="#c3b99b" />
        <Rod
          at={[0.02, 0.01, 0.04]}
          radius={0.009}
          length={0.65}
          color="#9b845b"
          rotation={[0, 0, Math.PI / 2]}
        />
        <mesh position={[0.36, 0.01, 0.04]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.026, 0.08, 4]} />
          <meshStandardMaterial
            color="#b9c4c9"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      </group>
    );
  if (style === "fists")
    return (
      <group>
        <mesh>
          <boxGeometry args={[0.22, 0.2, 0.2]} />
          <meshStandardMaterial
            color={color}
            map={SURFACES.metal}
            metalness={0.65}
            roughness={0.4}
          />
        </mesh>
        {[-1, 0, 1].map((i) => (
          <mesh
            key={i}
            position={[i * 0.055, 0.09, 0.13]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.025, 0.025, 0.08, 6]} />
            <meshStandardMaterial
              color={trim}
              metalness={0.7}
              roughness={0.35}
            />
          </mesh>
        ))}
        <Crystal at={[0, 0, 0.115]} size={0.05} color={gem} />
      </group>
    );
  return (
    <group>
      <mesh position={[0, 0.16, 0]} scale={[0.34, 0.43, 0.16]}>
        <sphereGeometry args={[0.5, 16, 12]} />
        <meshStandardMaterial
          color="#815d3b"
          map={SURFACES.cloth}
          roughness={0.7}
        />
      </mesh>
      <Rod at={[0, 0.49, 0]} radius={0.034} length={0.46} color="#775334" />
      <mesh position={[0, 0.16, 0.085]}>
        <circleGeometry args={[0.055, 16]} />
        <meshBasicMaterial color="#30261f" />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <Rod
          key={i}
          at={[i * 0.012, 0.35, 0.094]}
          radius={0.002}
          length={0.56}
          color="#d9c5a0"
        />
      ))}
      <Crystal at={[0, 0.72, 0]} size={0.045} color={gem} />
    </group>
  );
}
