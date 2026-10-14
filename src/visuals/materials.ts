import * as THREE from "three";
/** Tiny deterministic surface maps, bundled as code; no network or runtime canvas required. */
function grain(kind: "metal" | "cloth" | "stone") {
  const side = 64,
    data = new Uint8Array(side * side * 4);
  let seed = 3517;
  for (let y = 0; y < side; y++)
    for (let x = 0; x < side; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const n = seed / 4294967296;
      const v =
        kind === "metal"
          ? 210 + n * 35 + Math.sin(y * 2) * 8
          : kind === "cloth"
            ? 190 + n * 25 + (x % 3 === 0 || y % 3 === 0 ? -7 : 4)
            : 160 + n * 80 + Math.sin(x * 0.4) * Math.sin(y * 0.5) * 12;
      const i = (y * side + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  const texture = new THREE.DataTexture(data, side, side, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}
export const SURFACES = {
  metal: grain("metal"),
  cloth: grain("cloth"),
  stone: grain("stone"),
};
export const TERRAIN = SURFACES.stone.clone();
TERRAIN.repeat.set(60, 60);
export const ROAD = SURFACES.stone.clone();
ROAD.repeat.set(2, 18);
export const CLEARING = SURFACES.stone.clone();
CLEARING.repeat.set(3, 3);
