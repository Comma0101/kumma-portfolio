import * as THREE from "three";

export const PAPER_GRAIN_SIZE = 256;
export const PAPER_GRAIN_SEED = 20260716;

function hash2(ix: number, iy: number, seed: number): number {
  let h =
    (Math.imul(ix, 0x27d4eb2d) ^
      Math.imul(iy, 0x165667b1) ^
      Math.imul(seed | 0, 0x9e3779b1)) >>>
    0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  return (h >>> 0) / 0xffffffff;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Value noise on a wrapped lattice: periodX/periodY divide the tile, so edges match. */
function tileNoise(
  x: number,
  y: number,
  periodX: number,
  periodY: number,
  seed: number,
): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const wrap = (i: number, p: number) => ((i % p) + p) % p;
  const a = hash2(wrap(ix, periodX), wrap(iy, periodY), seed);
  const b = hash2(wrap(ix + 1, periodX), wrap(iy, periodY), seed);
  const c = hash2(wrap(ix, periodX), wrap(iy + 1, periodY), seed);
  const d = hash2(wrap(ix + 1, periodX), wrap(iy + 1, periodY), seed);
  return (a + (b - a) * fx) + ((c + (d - c) * fx) - (a + (b - a) * fx)) * fy;
}

/** Xuan-paper grain: two cloudy octaves + one stretched fiber octave. */
export function paperGrainValue(
  px: number,
  py: number,
  seed: number = PAPER_GRAIN_SEED,
): number {
  const u = px / PAPER_GRAIN_SIZE;
  const v = py / PAPER_GRAIN_SIZE;
  const cloud =
    tileNoise(u * 8, v * 8, 8, 8, seed) * 0.55 +
    tileNoise(u * 32, v * 32, 32, 32, seed ^ 0x5bd1) * 0.3;
  const fiber = tileNoise(u * 64, v * 8, 64, 8, seed ^ 0x1b87) * 0.15;
  const value = cloud + fiber;
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

export function createPaperGrainData(
  seed: number = PAPER_GRAIN_SEED,
): Uint8Array {
  const data = new Uint8Array(PAPER_GRAIN_SIZE * PAPER_GRAIN_SIZE);
  for (let y = 0; y < PAPER_GRAIN_SIZE; y += 1) {
    for (let x = 0; x < PAPER_GRAIN_SIZE; x += 1) {
      data[y * PAPER_GRAIN_SIZE + x] = Math.round(paperGrainValue(x, y, seed) * 255);
    }
  }
  return data;
}

let cached: THREE.DataTexture | null = null;

/** Process-lifetime shared grain (same ownership model as cameraPath's module curve). */
export function getPaperGrainTexture(): THREE.DataTexture {
  if (cached) return cached;
  const texture = new THREE.DataTexture(
    createPaperGrainData(),
    PAPER_GRAIN_SIZE,
    PAPER_GRAIN_SIZE,
    THREE.RedFormat,
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  cached = texture;
  return texture;
}

export function disposePaperGrainTexture(): void {
  cached?.dispose();
  cached = null;
}
