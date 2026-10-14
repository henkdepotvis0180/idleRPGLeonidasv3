import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { BIOMES, FACTIONS, type FactionId, type WorldNode } from "../content";
import { useFrame } from "@react-three/fiber";
import { SURFACES, TERRAIN, ROAD, CLEARING } from "./materials";
function Stone({
  at,
  size,
  color,
}: {
  at: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={at} scale={size} rotation={[0.1, at[0] * 0.7, 0.1]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} map={SURFACES.stone} roughness={1} />
    </mesh>
  );
}
function Pine({
  x,
  z,
  scale,
  color,
  snow,
}: {
  x: number;
  z: number;
  scale: number;
  color: string;
  snow: boolean;
}) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.08, 0.17, 2.5, 7]} />
        <meshStandardMaterial color="#51483b" map={SURFACES.stone} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 1.3 + i * 0.68, 0]}>
          <coneGeometry args={[1.05 - i * 0.23, 1.65 - i * 0.2, 7]} />
          <meshStandardMaterial
            color={snow && i !== 0 ? "#c2d2d5" : color}
            map={SURFACES.cloth}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}
function RegionEnvironment({
  zone,
  seed,
  nodes,
  lowPower = false,
  faction = "concord",
}: {
  zone: number;
  seed: number;
  nodes: WorldNode[];
  lowPower?: boolean;
  faction?: FactionId;
}) {
  const biome = BIOMES[zone % BIOMES.length];
  const props = useMemo(
    () =>
      Array.from({ length: lowPower ? 14 : 25 }, (_, i) => ({
        x: Math.sin(i * 62.71 + seed) * 12,
        z: Math.cos(i * 31.4 + seed) * 12,
        s: 0.65 + (i % 4) * 0.22,
      })),
    [seed, lowPower],
  );
  const snow = zone >= 6,
    forest = zone === 0 || zone === 3 || zone === 5 || zone === 6;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.035, 0]}>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial
          color={biome.ground}
          map={TERRAIN}
          roughness={1}
        />
      </mesh>
      {/* Roads and site clearings remain legible from the high camera. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.018, -0.5]}>
        <planeGeometry args={[1.7, 20]} />
        <meshStandardMaterial
          color={snow ? "#8b9eaa" : zone === 4 ? "#b69c72" : "#77705a"}
          map={ROAD}
          roughness={1}
        />
      </mesh>
      {[4, -0.4, -4.8].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.014, z]}>
          <planeGeometry args={[15.7, 1]} />
          <meshStandardMaterial
            color={snow ? "#8b9eaa" : zone === 4 ? "#b69c72" : "#77705a"}
            map={ROAD}
            roughness={1}
          />
        </mesh>
      ))}
      {props.map((p, i) =>
        forest ? (
          <Pine
            key={i}
            x={Math.abs(p.x) < 8 ? Math.sign(p.x || 1) * (9 + (i % 3)) : p.x}
            z={p.z}
            scale={p.s}
            color={biome.leaf}
            snow={snow}
          />
        ) : (
          <group
            key={i}
            position={[
              Math.abs(p.x) < 8 ? Math.sign(p.x || 1) * (9 + (i % 3)) : p.x,
              0,
              p.z,
            ]}
          >
            <Stone
              at={[0, 0.4, 0]}
              size={[p.s, 0.8, p.s]}
              color={biome.stone}
            />
            {i % 3 === 0 && (
              <mesh position={[0, p.s * 1.7, 0]}>
                <cylinderGeometry
                  args={[
                    zone === 2 ? 0.08 : 0.24,
                    0.35,
                    p.s * 3,
                    zone === 2 ? 5 : 8,
                  ]}
                />
                <meshStandardMaterial
                  color={zone === 2 ? "#998fbd" : biome.stone}
                  map={SURFACES.stone}
                  metalness={zone === 2 ? 0.35 : 0}
                  roughness={0.8}
                />
              </mesh>
            )}
          </group>
        ),
      )}
      {nodes.map((n) => (
        <group key={n.id} position={[n.x, 0, n.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[n.kind === "boss" ? 1.5 : 0.9, 20]} />
            <meshStandardMaterial
              color={n.kind === "camp" ? "#807a61" : biome.ground}
              map={CLEARING}
            />
          </mesh>
          {n.kind === "camp" ? (
            <>
              <group position={[1.3, 0, -0.8]}>
                {[-1, 1].map((i) => (
                  <mesh
                    key={i}
                    position={[i * 0.37, 0.5, 0]}
                    rotation={[0, 0, i * -0.63]}
                  >
                    <boxGeometry args={[0.055, 1.24, 1.15]} />
                    <meshStandardMaterial
                      color="#8f8369"
                      map={SURFACES.cloth}
                    />
                  </mesh>
                ))}
                <mesh position={[0, 0.99, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.035, 0.035, 1.32, 6]} />
                  <meshStandardMaterial color="#4a3e2d" />
                </mesh>
              </group>
              <group position={[-1.15, 0, -0.6]}>
                <mesh position={[0, 1, 0]}>
                  <cylinderGeometry args={[0.025, 0.03, 2, 6]} />
                  <meshStandardMaterial color="#4f473a" />
                </mesh>
                <mesh position={[0.25, 1.55, 0]}>
                  <planeGeometry args={[0.5, 0.65]} />
                  <meshStandardMaterial
                    color={FACTIONS.find((f) => f.id === faction)!.color}
                    map={SURFACES.cloth}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh position={[0.25, 1.56, 0.012]}>
                  <torusGeometry
                    args={[
                      0.105,
                      0.015,
                      4,
                      12,
                      faction === "pact" ? Math.PI * 1.5 : Math.PI * 2,
                    ]}
                  />
                  <meshBasicMaterial color="#394351" />
                </mesh>
              </group>
              <mesh position={[-0.45, 0.2, 0.1]}>
                <coneGeometry args={[0.14, 0.45, 7]} />
                <meshBasicMaterial color="#ffc077" />
              </mesh>
              <Stone
                at={[-0.45, 0.06, 0.1]}
                size={[0.35, 0.07, 0.35]}
                color="#615e54"
              />
            </>
          ) : n.kind === "cache" ? (
            <group position={[0.3, 0.19, 0]}>
              <mesh>
                <boxGeometry args={[0.48, 0.36, 0.32]} />
                <meshStandardMaterial color="#6b5138" map={SURFACES.cloth} />
              </mesh>
              {[-1, 1].map((i) => (
                <mesh key={i} position={[i * 0.16, 0, 0]}>
                  <boxGeometry args={[0.035, 0.38, 0.34]} />
                  <meshStandardMaterial
                    color="#b8a36e"
                    metalness={0.7}
                    roughness={0.4}
                  />
                </mesh>
              ))}
            </group>
          ) : n.kind === "boss" ? (
            <>
              {[-1, 1].map((i) => (
                <group key={i} position={[i * 1.5, 0, -0.8]}>
                  <mesh position={[0, 1.6, 0]}>
                    <boxGeometry args={[0.6, 3.2, 0.8]} />
                    <meshStandardMaterial
                      color={biome.stone}
                      map={SURFACES.stone}
                    />
                  </mesh>
                  <mesh position={[0, 3.5, 0]}>
                    <coneGeometry args={[0.43, 0.7, 4]} />
                    <meshStandardMaterial
                      color="#a9becb"
                      metalness={0.3}
                      roughness={0.5}
                    />
                  </mesh>
                </group>
              ))}
              <mesh position={[0, 3, -0.8]}>
                <boxGeometry args={[3.4, 0.45, 0.7]} />
                <meshStandardMaterial
                  color={biome.stone}
                  map={SURFACES.stone}
                />
              </mesh>
            </>
          ) : (
            <Stone
              at={[0.6, 0.13, -0.4]}
              size={[0.28, 0.2, 0.32]}
              color={biome.stone}
            />
          )}
        </group>
      ))}
      <Atmosphere snow={snow} lowPower={lowPower} />
      {(zone === 1 || zone === 7) &&
        [-1, 1].map((i) => (
          <group key={i} position={[i * 5, 0, -14]}>
            <mesh position={[0, 3.2, 0]}>
              <cylinderGeometry args={[1.1, 1.4, 6.4, 8]} />
              <meshStandardMaterial color={biome.stone} map={SURFACES.stone} />
            </mesh>
            <mesh position={[0, 7.1, 0]}>
              <coneGeometry args={[1.4, 1.7, 8]} />
              <meshStandardMaterial
                color={zone === 7 ? "#91afc2" : "#59555a"}
                metalness={0.15}
                roughness={0.7}
              />
            </mesh>
            <mesh position={[0, 3.8, 1.12]}>
              <boxGeometry args={[0.32, 1.15, 0.05]} />
              <meshBasicMaterial color={zone === 7 ? "#bddce8" : "#322e2b"} />
            </mesh>
          </group>
        ))}
      {/* Distant silhouettes create a horizon while keeping the walkable space uncluttered. */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          position={[(i - 4) * 8, 3, -21 - (i % 2) * 5]}
          scale={[5 + (i % 3), 5 + (i % 4), 4]}
        >
          <coneGeometry args={[1, 2, 5]} />
          <meshStandardMaterial
            color={snow ? "#b4c7cc" : "#6e7f77"}
            map={SURFACES.stone}
            roughness={1}
          />
        </mesh>
      ))}
    </>
  );
}

function Atmosphere({ snow, lowPower }: { snow: boolean; lowPower: boolean }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array((lowPower ? 30 : 70) * 3);
    for (let i = 0; i < data.length; i += 3) {
      data[i] = Math.sin(i * 63.72) * 13;
      data[i + 1] = 1 + (i % 19) / 3;
      data[i + 2] = Math.cos(i * 27.13) * 13;
    }
    return data;
  }, [lowPower]);
  useFrame((_, delta) => {
    if (!points.current) return;
    const p = points.current.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) + (snow ? -delta * 0.5 : delta * 0.13);
      p.setY(i, y < 0.1 ? 6 : y > 6 ? 0.1 : y);
    }
    p.needsUpdate = true;
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={snow ? "#dfedf3" : "#d5d0a7"}
        size={snow ? 0.035 : 0.025}
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  );
}

export const Environment = React.memo(RegionEnvironment);
