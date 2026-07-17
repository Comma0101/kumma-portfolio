# Real Shanshui — Phase 2 Ink Core + Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace lamp-lit blob rendering with the ink rendering layer — unlit ink materials with cun stroke fields, paper-first terrain, ridge-profile mountains — and rebuild the hero as a Fan Kuan monumental composition, so every frame reads as hand-painted shanshui.

**Architecture:** New modules in `components/immersive/facility/ink/` (paperGrain, strokeFields, inkMaterials) plug into the existing tested architecture: `materials.ts` swaps mountain/stone entries to ink ShaderMaterials, `terrain.ts` gets a paper-first fragment rewrite, `shanshuiPrimitives.ts` swaps the shared mountain kit geometries to ridge profiles (lifting every zone at once), and `zones/exterior.ts` + `narrative.ts` land the hero composition and telephoto framing. Scene fog/uniform sync, zone system, scroll architecture untouched.

**Tech Stack:** Three.js r180 ShaderMaterial (GLSL1 syntax, WebGL2 target), TypeScript, node:test + assert/strict.

**Design authority:** `docs/plans/2026-07-16-real-shanshui-ink-rendering-design.md` (Phase 2). Baseline for before/after: `docs/qa/2026-07-16-paper-inversion-baseline.md`.

## Global Constraints

- Budgets (harness asserts per stop): desktop ≤45, constrained ≤32, mobile ≤22, reduced ≤20 draw calls. Host-peak composition adds ≤4 calls at hero (23→27).
- No new runtime dependencies. No post-processing pipeline. Grain lives in-material.
- All TS color values come from `components/immersive/facility/ink/inkLadder.ts` (`INK`, `EARTHS`, `ACCENTS`) — no new hardcoded hexes in TypeScript. GLSL receives colors only as uniforms.
- Ink materials are UNLIT: no lights, no specular, no shadow maps. Stock `MeshStandardMaterial`/`MeshToonMaterial` remain for non-ink entries (bamboo stays toon until Phase 3).
- Test format: `node:test` + `assert/strict`, CommonJS `require` with the NODE_PATH boilerplate copied verbatim from `components/immersive/facility/terrain.test.ts` lines 8-17. Run the FULL suite: `npm test` (376+ tests must stay green).
- Commits end with `Co-Authored-By: Claude <noreply@anthropic.com>`. Commit per task on `feature/carved-systems-facility`.
- Dev server: port 4242 (already running). Captures: `node scripts/capture-journey.mjs --label <label> --gate phase1` → `~/kumma-qa/shots-<label>/`.
- Far-plane safety: constrained far plane is 60, mobile 32 (`FACILITY_CAMERA_FAR_PLANES` in `cameraPath.ts`). The hero host peak must sit at z ≥ -40, and host peak + waterfall + moss dots + extra mist veil are created ONLY for `desktop` and `constrained` profiles (mobile/reduced keep the lighter silhouette set).
- Shader compatibility: GLSL1 syntax (`texture2D`, `gl_FragColor`), must support `InstancedMesh` via `#ifdef USE_INSTANCING` in the vertex shader.
- `THREE.RedFormat` DataTexture for grain; `RepeatWrapping` both axes; module singleton (process-lifetime, like the module-level `path` in `cameraPath.ts`).

---

### Task 1: Ink foundation modules — paperGrain + strokeFields

**Files:**
- Create: `components/immersive/facility/ink/paperGrain.ts`
- Create: `components/immersive/facility/ink/paperGrain.test.ts`
- Create: `components/immersive/facility/ink/strokeFields.ts`
- Create: `components/immersive/facility/ink/strokeFields.test.ts`

**Interfaces:**
- Produces:
  - `paperGrainValue(px: number, py: number, seed?: number): number` — deterministic, [0,1], tile-seam-continuous
  - `getPaperGrainTexture(): THREE.DataTexture` — cached singleton, RedFormat 256², RepeatWrapping
  - `disposePaperGrainTexture(): void` — test hook
  - `PAPER_GRAIN_SIZE = 256`, `PAPER_GRAIN_SEED = 20260716`
  - `type CunPreset = "hemp" | "axe" | "raindrop"`
  - `CUN_PRESETS: Record<CunPreset, {scale, directionality, threshold, stretch}>` (exact values below)
  - `cunDeposit(x, y, slope, aspect, preset): number` — deterministic [0,1]
  - `CUN_FIELD_GLSL: string` — self-contained GLSL chunk exporting `float cunDeposit(vec2 p, float slope, float aspect, float scale, float directionality, float threshold, float stretch)`

- [ ] **Step 1: Write the failing tests**

`components/immersive/facility/ink/paperGrain.test.ts`:

```ts
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import type * as ThreeTypes from "three";

process.env.NODE_PATH = path.resolve(process.cwd(), "node_modules");
const nodeModule = require("node:module") as {
  readonly Module: { _initPaths(): void };
};
nodeModule.Module._initPaths();
const THREE = require("three") as typeof ThreeTypes;
const {
  PAPER_GRAIN_SIZE,
  createPaperGrainData,
  disposePaperGrainTexture,
  getPaperGrainTexture,
  paperGrainValue,
} = require("./paperGrain") as typeof import("./paperGrain");

describe("paper grain", () => {
  it("is deterministic and bounded", () => {
    for (const [x, y] of [[0, 0], [17, 231], [255, 255], [128, 64]] as const) {
      const a = paperGrainValue(x, y);
      const b = paperGrainValue(x, y);
      assert.equal(a, b);
      assert.ok(a >= 0 && a <= 1, `grain ${a} out of range at ${x},${y}`);
    }
  });

  it("is continuous across the tile seam", () => {
    for (const y of [0, 37, 128, 255]) {
      assert.equal(paperGrainValue(0, y), paperGrainValue(PAPER_GRAIN_SIZE, y));
    }
    for (const x of [0, 53, 200, 255]) {
      assert.equal(paperGrainValue(x, 0), paperGrainValue(x, PAPER_GRAIN_SIZE));
    }
  });

  it("builds a mid-valued repeating RedFormat texture, cached as a singleton", () => {
    const data = createPaperGrainData();
    assert.equal(data.length, PAPER_GRAIN_SIZE * PAPER_GRAIN_SIZE);
    let sum = 0;
    for (const byte of data) sum += byte;
    const mean = sum / data.length / 255;
    assert.ok(mean > 0.3 && mean < 0.7, `grain mean ${mean} should be mid-valued`);

    const first = getPaperGrainTexture();
    const second = getPaperGrainTexture();
    assert.equal(first, second);
    assert.equal(first.format, THREE.RedFormat);
    assert.equal(first.wrapS, THREE.RepeatWrapping);
    assert.equal(first.wrapT, THREE.RepeatWrapping);
    disposePaperGrainTexture();
    const third = getPaperGrainTexture();
    assert.notEqual(third, first);
    disposePaperGrainTexture();
  });
});
```

`components/immersive/facility/ink/strokeFields.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const {
  CUN_FIELD_GLSL,
  CUN_PRESETS,
  cunDeposit,
} = require("./strokeFields") as typeof import("./strokeFields");

describe("cun stroke fields", () => {
  it("defines the three classical presets with distinct characters", () => {
    assert.deepEqual(Object.keys(CUN_PRESETS).sort(), ["axe", "hemp", "raindrop"]);
    assert.ok(CUN_PRESETS.raindrop.scale > CUN_PRESETS.axe.scale);
    assert.ok(CUN_PRESETS.axe.scale > CUN_PRESETS.hemp.scale);
    assert.equal(CUN_PRESETS.raindrop.directionality, 0);
    assert.equal(CUN_PRESETS.hemp.directionality, 1);
    for (const preset of Object.values(CUN_PRESETS)) {
      assert.ok(preset.threshold > 0 && preset.threshold < 1);
      assert.ok(preset.stretch >= 1);
    }
  });

  it("is deterministic and bounded", () => {
    for (const preset of ["hemp", "axe", "raindrop"] as const) {
      const a = cunDeposit(3.25, -7.5, 0.6, 1.1, preset);
      const b = cunDeposit(3.25, -7.5, 0.6, 1.1, preset);
      assert.equal(a, b);
      assert.ok(a >= 0 && a <= 1);
    }
  });

  it("deposits more ink on steeper slopes", () => {
    const flat = cunDeposit(5, 5, 0.05, 0.3, "hemp");
    const steep = cunDeposit(5, 5, 0.9, 0.3, "hemp");
    assert.ok(steep >= flat);
  });

  it("exports a self-contained GLSL twin", () => {
    assert.match(CUN_FIELD_GLSL, /float cunDeposit\(vec2 p, float slope, float aspect, float scale, float directionality, float threshold, float stretch\)/);
    assert.match(CUN_FIELD_GLSL, /cunFbm/);
    assert.match(CUN_FIELD_GLSL, /cunHash/);
    assert.doesNotMatch(CUN_FIELD_GLSL, /Math\.random/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test 2>&1 | tail -5`
Expected: FAIL — `Cannot find module './paperGrain'` / `./strokeFields`

- [ ] **Step 3: Implement paperGrain.ts**

```ts
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
  return h / 0xffffffff;
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
```

- [ ] **Step 4: Implement strokeFields.ts**

```ts
/**
 * Procedural cun (texture-stroke) fields — CPU twin + GLSL chunk.
 * Design: docs/plans/2026-07-16-real-shanshui-ink-rendering-design.md
 * hemp-fiber 披麻皴 (rolling ranges), axe-cut 斧劈皴 (cliffs), raindrop 雨點皴 (hero peak).
 */
export type CunPreset = "hemp" | "axe" | "raindrop";

export interface CunPresetParams {
  readonly scale: number;
  readonly directionality: number;
  readonly threshold: number;
  readonly stretch: number;
}

export const CUN_PRESETS: Readonly<Record<CunPreset, CunPresetParams>> =
  Object.freeze({
    hemp: Object.freeze({ scale: 3.1, directionality: 1, threshold: 0.5, stretch: 2.6 }),
    axe: Object.freeze({ scale: 5.2, directionality: 0.3, threshold: 0.56, stretch: 1.7 }),
    raindrop: Object.freeze({ scale: 8.6, directionality: 0, threshold: 0.58, stretch: 1 }),
  });

function cunHash(ix: number, iy: number): number {
  let h = (Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  h ^= h >>> 16;
  return h / 0xffffffff;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function vnoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = cunHash(ix, iy);
  const b = cunHash(ix + 1, iy);
  const c = cunHash(ix, iy + 1);
  const d = cunHash(ix + 1, iy + 1);
  return a + (b - a) * fx + (c + (d - c) * fx - (a + (b - a) * fx)) * fy;
}

function fbm(x: number, y: number): number {
  return vnoise(x, y) * 0.6667 + vnoise(x * 2.13 + 17.7, y * 2.13 + 9.2) * 0.3333;
}

export function cunDepositParams(
  x: number,
  y: number,
  slope: number,
  aspect: number,
  params: CunPresetParams,
): number {
  const qx = x * params.scale;
  const qy = y * params.scale;
  const dir = aspect * params.directionality;
  const cs = Math.cos(dir);
  const sn = Math.sin(dir);
  const rx = qx * cs - qy * sn;
  const ry = (qx * sn + qy * cs) * params.stretch;
  const stroke = smoothstep(params.threshold, params.threshold + 0.18, fbm(rx, ry));
  const brk = fbm(rx * 3.7 + 11.3, ry * 3.7 + 5.1);
  const dry = smoothstep(0.18, 0.5, brk + 0.28);
  const slopeGate = Math.min(1, Math.max(0.15, slope * 1.4));
  return stroke * dry * slopeGate;
}

export function cunDeposit(
  x: number,
  y: number,
  slope: number,
  aspect: number,
  preset: CunPreset,
): number {
  return cunDepositParams(x, y, slope, aspect, CUN_PRESETS[preset]);
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Self-contained GLSL twin of cunDepositParams (no external chunks). */
export const CUN_FIELD_GLSL = /* glsl */ `
float cunHash(vec2 p){
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float cunVnoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = cunHash(i);
  float b = cunHash(i + vec2(1.0, 0.0));
  float c = cunHash(i + vec2(0.0, 1.0));
  float d = cunHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float cunFbm(vec2 p){
  float sum = cunVnoise(p) * 0.6667;
  sum += cunVnoise(p * 2.13 + vec2(17.7, 9.2)) * 0.3333;
  return sum;
}
float cunDeposit(vec2 p, float slope, float aspect, float scale, float directionality, float threshold, float stretch){
  vec2 q = p * scale;
  float dir = aspect * directionality;
  float cs = cos(dir);
  float sn = sin(dir);
  vec2 rq = vec2(q.x * cs - q.y * sn, (q.x * sn + q.y * cs) * stretch);
  float stroke = smoothstep(threshold, threshold + 0.18, cunFbm(rq));
  float brk = cunFbm(rq * 3.7 + vec2(11.3, 5.1));
  stroke *= smoothstep(0.18, 0.5, brk + 0.28);
  return stroke * clamp(slope * 1.4, 0.15, 1.0);
}
`;
```

- [ ] **Step 5: Run tests**

Run: `npm test 2>&1 | tail -5`
Expected: `# fail 0`

- [ ] **Step 6: Commit**

```bash
git add components/immersive/facility/ink/
git commit -m "feat: add paper grain and cun stroke field ink foundation modules"
```

---

### Task 2: Ink material factory

**Files:**
- Create: `components/immersive/facility/ink/inkMaterials.ts`
- Create: `components/immersive/facility/ink/inkMaterials.test.ts`

**Interfaces:**
- Consumes: `getPaperGrainTexture` (Task 1), `CUN_PRESETS`, `CUN_FIELD_GLSL`, `CunPreset` (Task 1), `INK` (inkLadder)
- Produces:
  - `createInkMaterial(params: CreateInkMaterialParams): THREE.ShaderMaterial`
  - `syncInkMaterialAtmosphere(material: THREE.ShaderMaterial, fogColor: THREE.Color, fogDensity: number): void`
  - `isInkMaterial(material: THREE.Material): boolean`
  - `CreateInkMaterialParams = { inkColor: string; valueBias?: number; cun?: CunPreset | null; cunStrength?: number; fogColor: THREE.Color; fogDensity: number; opacity?: number }`

- [ ] **Step 1: Write the failing test**

`components/immersive/facility/ink/inkMaterials.test.ts`:

```ts
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import type * as ThreeTypes from "three";
import { INK } from "./inkLadder";

process.env.NODE_PATH = path.resolve(process.cwd(), "node_modules");
const nodeModule = require("node:module") as {
  readonly Module: { _initPaths(): void };
};
nodeModule.Module._initPaths();
const THREE = require("three") as typeof ThreeTypes;
const {
  createInkMaterial,
  isInkMaterial,
  syncInkMaterialAtmosphere,
} = require("./inkMaterials") as typeof import("./inkMaterials");

describe("ink material", () => {
  it("creates an unlit shader material wired to the ink ladder and grain", () => {
    const fog = new THREE.Color(INK.paper);
    const material = createInkMaterial({
      inkColor: INK.zhong,
      valueBias: 0.2,
      cun: "hemp",
      cunStrength: 0.8,
      fogColor: fog,
      fogDensity: 0.012,
    });
    assert.ok(material.isShaderMaterial);
    assert.ok(isInkMaterial(material));
    assert.equal(material.lights, false);
    assert.equal(material.transparent, false);
    assert.equal(material.uniforms.uInk.value.getHexString(), new THREE.Color(INK.zhong).getHexString());
    assert.equal(material.uniforms.uPaper.value.getHexString(), new THREE.Color(INK.paper).getHexString());
    assert.equal(material.uniforms.uFogColor.value, fog);
    assert.equal(material.uniforms.uFogDensity.value, 0.012);
    assert.ok(material.uniforms.uGrain.value.isDataTexture);
    assert.equal(material.uniforms.uCunScale.value, 3.1);
    assert.match(material.vertexShader, /USE_INSTANCING/);
    assert.match(material.fragmentShader, /cunDeposit/);
    assert.match(material.fragmentShader, /uGrain/);
    assert.doesNotMatch(material.fragmentShader, /Math\.random/);
  });

  it("supports cun-free materials and atmosphere sync", () => {
    const material = createInkMaterial({
      inkColor: INK.dan,
      fogColor: new THREE.Color(INK.paper),
      fogDensity: 0.01,
    });
    assert.equal(material.uniforms.uCunStrength.value, 0);
    syncInkMaterialAtmosphere(material, new THREE.Color(INK.qing), 0.02);
    assert.equal(material.uniforms.uFogColor.value.getHexString(), new THREE.Color(INK.qing).getHexString());
    assert.equal(material.uniforms.uFogDensity.value, 0.02);
    assert.equal(isInkMaterial(new THREE.MeshBasicMaterial()), false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test 2>&1 | tail -5`
Expected: FAIL — `Cannot find module './inkMaterials'`

- [ ] **Step 3: Implement inkMaterials.ts**

```ts
import * as THREE from "three";
import { INK } from "./inkLadder";
import { getPaperGrainTexture } from "./paperGrain";
import {
  CUN_FIELD_GLSL,
  CUN_PRESETS,
  type CunPreset,
} from "./strokeFields";

export interface CreateInkMaterialParams {
  readonly inkColor: string;
  readonly valueBias?: number;
  readonly cun?: CunPreset | null;
  readonly cunStrength?: number;
  readonly fogColor: THREE.Color;
  readonly fogDensity: number;
  readonly opacity?: number;
}

const VERTEX_SHADER = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vWorldPos;
varying float vDistance;
varying float vLocalY;
void main(){
  vec3 transformed = position;
  vec3 objectNormal = normal;
  #ifdef USE_INSTANCING
    transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
    objectNormal = mat3(instanceMatrix) * objectNormal;
  #endif
  vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
  vWorldPos = worldPos.xyz;
  vNormalW = normalize(mat3(modelMatrix) * objectNormal);
  vLocalY = position.y;
  vec4 viewPos = viewMatrix * worldPos;
  vDistance = max(0.0, -viewPos.z);
  gl_Position = projectionMatrix * viewPos;
}
`;

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform float uValueBias;
uniform float uCunScale;
uniform float uCunDirectionality;
uniform float uCunThreshold;
uniform float uCunStretch;
uniform float uCunStrength;
uniform sampler2D uGrain;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uOpacity;
varying vec3 vNormalW;
varying vec3 vWorldPos;
varying float vDistance;
varying float vLocalY;
${CUN_FIELD_GLSL}
void main(){
  vec3 n = normalize(vNormalW);
  float slope = clamp(1.0 - n.y, 0.0, 1.0);
  float aspect = atan(n.x, n.z);
  vec2 p = vWorldPos.xz + vec2(vWorldPos.y * 0.41, vWorldPos.y * 0.23);
  float cun = uCunStrength * cunDeposit(p, slope, aspect, uCunScale, uCunDirectionality, uCunThreshold, uCunStretch);
  float foot = smoothstep(0.35, 0.0, vLocalY) * 0.12;
  float deposit = clamp(uValueBias + slope * 0.38 + cun * 0.5 + foot, 0.0, 1.0);
  float band = deposit * 4.0;
  float banded = (floor(band) + smoothstep(0.3, 0.7, fract(band))) / 4.0;
  vec3 color = mix(uPaper, uInk, banded);
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float rim = 1.0 - abs(dot(n, viewDir));
  color = mix(color, uInk, smoothstep(0.66, 0.95, rim) * 0.5);
  float grain = texture2D(uGrain, vWorldPos.xz * 0.045 + vec2(vWorldPos.y * 0.021)).r;
  color *= 0.97 + grain * 0.06;
  float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * vDistance * vDistance);
  color = mix(color, uFogColor, clamp(fogFactor, 0.0, 1.0));
  gl_FragColor = vec4(color, uOpacity);
}
`;

export function createInkMaterial(
  params: CreateInkMaterialParams,
): THREE.ShaderMaterial {
  const preset = params.cun ? CUN_PRESETS[params.cun] : null;
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      uPaper: { value: new THREE.Color(INK.paper) },
      uInk: { value: new THREE.Color(params.inkColor) },
      uValueBias: { value: params.valueBias ?? 0.14 },
      uCunScale: { value: preset?.scale ?? 1 },
      uCunDirectionality: { value: preset?.directionality ?? 0 },
      uCunThreshold: { value: preset?.threshold ?? 0.5 },
      uCunStretch: { value: preset?.stretch ?? 1 },
      uCunStrength: { value: params.cunStrength ?? 0 },
      uGrain: { value: getPaperGrainTexture() },
      uFogColor: { value: params.fogColor },
      uFogDensity: { value: params.fogDensity },
      uOpacity: { value: params.opacity ?? 1 },
    },
    side: THREE.DoubleSide,
    transparent: false,
    depthWrite: true,
    lights: false,
  });
  material.userData.shanshuiInk = true;
  return material;
}

export function isInkMaterial(material: THREE.Material): boolean {
  return material.userData.shanshuiInk === true;
}

export function syncInkMaterialAtmosphere(
  material: THREE.ShaderMaterial,
  fogColor: THREE.Color,
  fogDensity: number,
): void {
  material.uniforms.uFogColor.value.copy(fogColor);
  material.uniforms.uFogDensity.value = fogDensity;
}
```

- [ ] **Step 4: Run tests**

Run: `npm test 2>&1 | tail -5`
Expected: `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add components/immersive/facility/ink/
git commit -m "feat: add unlit ink shader material factory"
```

---

### Task 3: Paper-first terrain fragment rewrite

**Files:**
- Modify: `components/immersive/facility/terrain.ts` (fragment shader + uniform factory)
- Modify: `components/immersive/facility/terrain.test.ts`

**Interfaces:**
- Consumes: `CUN_FIELD_GLSL` (Task 1), `getPaperGrainTexture` (Task 1), `INK` (inkLadder)
- Produces: unchanged exports (`createFacilityTerrain`, `createFacilityTerrainUniforms`, same signatures) — `createFacilityTerrainUniforms` input gains NO new required fields

- [ ] **Step 1: Update the test expectations (failing)**

In `terrain.test.ts`, in the first `it(...)` block:
- DELETE the three lines `assert.match(terrain.material.fragmentShader, /paperGrain/);`, `assert.match(terrain.material.fragmentShader, /inkValue/);`, `assert.match(terrain.material.fragmentShader, /mineralStone/);`
- ADD in their place:

```ts
    assert.match(terrain.material.fragmentShader, /uGrain/);
    assert.match(terrain.material.fragmentShader, /cunDeposit/);
    assert.match(terrain.material.fragmentShader, /uInkNear/);
    assert.match(terrain.material.fragmentShader, /bankStroke/);
    assert.ok(terrain.material.uniforms.uGrain.value.isDataTexture);
    assert.equal(
      terrain.material.uniforms.uPaper.value.getHexString(),
      new THREE.Color(INK.paper).getHexString(),
    );
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test 2>&1 | tail -5`
Expected: FAIL — `uGrain` / `cunDeposit` not in fragment shader

- [ ] **Step 3: Rewrite the fragment shader and uniform factory in terrain.ts**

Add imports at the top of `terrain.ts`:

```ts
import { INK } from "./ink/inkLadder";
import { getPaperGrainTexture } from "./ink/paperGrain";
import { CUN_FIELD_GLSL } from "./ink/strokeFields";
```

Replace the ENTIRE `fragmentShader` constant (currently lines 96-132) with:

```ts
const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform float uVisibility;
  uniform vec3 uPaper;
  uniform vec3 uInkFar;
  uniform vec3 uInkNear;
  uniform sampler2D uGrain;
  varying float vHeight;
  varying vec3 vNormal;
  varying float vDistance;
  varying float vRiver;
  varying vec2 vTerrainPoint;
  ${CUN_FIELD_GLSL}

  void main(){
    vec3 n = normalize(vNormal);
    float slope = clamp(1.0 - n.y, 0.0, 1.0);
    float aspect = atan(n.x, n.z);
    float cun = cunDeposit(vTerrainPoint * 0.5, slope, aspect, 3.1, 1.0, 0.52, 2.6);
    float deposit = clamp(
      slope * 0.5 + cun * 0.42 + smoothstep(0.1, 0.75, vHeight) * 0.22,
      0.0,
      1.0
    );
    float band = deposit * 3.0;
    float banded = (floor(band) + smoothstep(0.3, 0.7, fract(band))) / 3.0;
    vec3 color = mix(uPaper, mix(uInkFar, uInkNear, banded), banded * 0.9);
    // River: unpainted paper with broken bank-edge strokes.
    float bankStroke = smoothstep(0.12, 0.42, vRiver) * (1.0 - smoothstep(0.58, 0.92, vRiver));
    float openWater = smoothstep(0.55, 0.95, vRiver);
    color = mix(color, uInkFar, bankStroke * 0.5);
    color = mix(color, uPaper, openWater * 0.85);
    float grain = texture2D(uGrain, vTerrainPoint * 0.045).r;
    color *= 0.97 + grain * 0.06;
    float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * vDistance * vDistance);
    color = mix(color, uFogColor, clamp(fogFactor, 0.0, 1.0));
    gl_FragColor = vec4(color, uVisibility * 0.94);
  }
`;
```

The GLSL template literal now contains `${CUN_FIELD_GLSL}` interpolation — the surrounding backtick string already supports it; keep the `/* glsl */` tag.

In `FacilityTerrainUniforms` (interface), add:

```ts
  readonly uPaper: THREE.IUniform<THREE.Color>;
  readonly uInkFar: THREE.IUniform<THREE.Color>;
  readonly uInkNear: THREE.IUniform<THREE.Color>;
  readonly uGrain: THREE.IUniform<THREE.DataTexture>;
```

In `createFacilityTerrainUniforms`, add to the returned object:

```ts
    uPaper: { value: new THREE.Color(INK.paper) },
    uInkFar: { value: new THREE.Color(INK.dan) },
    uInkNear: { value: new THREE.Color(INK.zhong) },
    uGrain: { value: getPaperGrainTexture() },
```

Do NOT change the vertex shader, geometry, mesh wiring, or `createFacilityTerrain`.

- [ ] **Step 4: Run tests**

Run: `npm test 2>&1 | tail -5`
Expected: `# fail 0`

- [ ] **Step 5: Capture and compare against baseline**

Run: `node scripts/capture-journey.mjs --label ink-terrain --gate phase1`
Expected: GATES PASS; paper coverage should RISE vs baseline at every stop (the dark GLSL constants are gone). Note the numbers for the QA note.

- [ ] **Step 6: Commit**

```bash
git add components/immersive/facility/terrain.ts components/immersive/facility/terrain.test.ts
git commit -m "feat: rewrite terrain fragment as paper-first ink wash"
```

---

### Task 4: Ridge geometry + ink materials in the shared kit

**Files:**
- Modify: `components/immersive/facility/shanshuiPrimitives.ts` (add `createRidgeGeometry`, `createRidgeLayer`; swap kit mountains)
- Modify: `components/immersive/facility/materials.ts` (mountain/stone → ink materials; add `syncAtmosphere`)
- Modify: `components/immersive/facility/createFacilityWorld.ts` (call `syncAtmosphere` in update)
- Modify: `components/immersive/facility/materials.test.ts`
- Create: `components/immersive/facility/ridge.test.ts`

**Interfaces:**
- Consumes: `createInkMaterial`, `syncInkMaterialAtmosphere`, `isInkMaterial` (Task 2); `INK` (inkLadder)
- Produces:
  - `createRidgeGeometry(options: RidgeGeometryOptions): THREE.BufferGeometry` where `RidgeGeometryOptions = { seed: number; width?: number; depth?: number; crestSegments?: number; rows?: number }` — normalized: y 0..1, x spans ±width/2, z spans ±depth/2, crest sharp, ends collapse to zero height
  - `createRidgeLayer(context, name, options, material): THREE.Mesh` — single (non-instanced) ridge mesh with tracked geometry
  - `FacilityMaterialResources.syncAtmosphere(fogColor: THREE.Color, fogDensity: number): void`
  - `FacilityMaterials.mountain` and `.stone` change type to `THREE.ShaderMaterial`; kit `mountainTall`/`mountainBroad` become ridge geometries (same normalized footprint, width 2)

- [ ] **Step 1: Write the failing ridge test**

`components/immersive/facility/ridge.test.ts`:

```ts
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import type * as ThreeTypes from "three";

process.env.NODE_PATH = path.resolve(process.cwd(), "node_modules");
const nodeModule = require("node:module") as {
  readonly Module: { _initPaths(): void };
};
nodeModule.Module._initPaths();
const THREE = require("three") as typeof ThreeTypes;
const { createRidgeGeometry } = require("./shanshuiPrimitives") as typeof import("./shanshuiPrimitives");

describe("ridge geometry", () => {
  it("builds a deterministic jagged crest that collapses at the ends", () => {
    const ridge = createRidgeGeometry({ seed: 1979 });
    const again = createRidgeGeometry({ seed: 1979 });
    const positions = ridge.getAttribute("position");
    const mirror = again.getAttribute("position");
    assert.equal(positions.count, mirror.count);
    for (let i = 0; i < positions.count; i += 1) {
      assert.equal(positions.getY(i), mirror.getY(i));
    }
    assert.ok(positions.count > 200, "ridge needs enough crest segments to read as a profile");

    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < positions.count; i += 1) {
      const y = positions.getY(i);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    assert.equal(minY, 0);
    assert.ok(maxY > 0.5 && maxY <= 1, `crest peak ${maxY} should be normalized within (0.5, 1]`);
    const different = createRidgeGeometry({ seed: 2018 });
    assert.notDeepEqual(
      Array.from(different.getAttribute("position").array.slice(0, 30)),
      Array.from(positions.array.slice(0, 30)),
    );
    ridge.dispose();
    again.dispose();
    different.dispose();
  });
});
```

(The seed-sensitivity `notDeepEqual` check is what proves crest jaggedness; the max-Y bound only proves normalization.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test 2>&1 | tail -5`
Expected: FAIL — `createRidgeGeometry is not a function` (import returns undefined)

- [ ] **Step 3: Implement the ridge builder in shanshuiPrimitives.ts**

Add after `createMountainGeometry`:

```ts
export interface RidgeGeometryOptions {
  readonly seed: number;
  readonly width?: number;
  readonly depth?: number;
  readonly crestSegments?: number;
  readonly rows?: number;
}

function ridgeNoise1(seed: number, x: number, salt: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const t = f * f * (3 - 2 * f);
  const a = hash01(seed, i, salt);
  const b = hash01(seed, i + 1, salt);
  return a + (b - a) * t;
}

/**
 * Silhouette-first ridge: an authored jagged crest line with two facet sheets
 * falling to the base. Flat facets + sharp crest replace smooth noise domes.
 * Normalized: y 0..1, x ±width/2, z ±depth/2; crest ends collapse to height 0.
 */
export function createRidgeGeometry(
  options: RidgeGeometryOptions,
): THREE.BufferGeometry {
  const width = options.width ?? 2;
  const depth = options.depth ?? 1.2;
  const crestSegments = options.crestSegments ?? 26;
  const rows = options.rows ?? 8;
  const seed = options.seed;

  const crest: Array<{ x: number; y: number; z: number }> = [];
  for (let i = 0; i <= crestSegments; i += 1) {
    const u = i / crestSegments;
    const envelope = Math.pow(Math.sin(Math.PI * u), 0.7);
    const ridged =
      (1 - Math.abs(2 * ridgeNoise1(seed, u * 3.1, 0x1107) - 1)) * 0.55 +
      (1 - Math.abs(2 * ridgeNoise1(seed, u * 7.3, 0x5a39) - 1)) * 0.3 +
      (1 - Math.abs(2 * ridgeNoise1(seed, u * 14.9, 0x9c41) - 1)) * 0.15;
    crest.push({
      x: (u - 0.5) * width,
      y: envelope * (0.55 + 0.45 * ridged),
      z: (hash01(seed, i, 0x77b1) - 0.5) * 0.08 * depth,
    });
  }

  const positions: number[] = [];
  const indices: number[] = [];
  for (const side of [1, -1]) {
    const sheetStart = positions.length / 3;
    for (let row = 0; row <= rows; row += 1) {
      const t = row / rows;
      for (let i = 0; i <= crestSegments; i += 1) {
        const point = crest[i];
        positions.push(
          point.x * (1 + t * 0.35),
          point.y * (1 - t),
          point.z + side * t * depth * 0.5,
        );
      }
    }
    for (let row = 0; row < rows; row += 1) {
      for (let i = 0; i < crestSegments; i += 1) {
        const a = sheetStart + row * (crestSegments + 1) + i;
        const b = a + 1;
        const c = a + crestSegments + 1;
        const d = c + 1;
        if (side > 0) {
          indices.push(a, c, b, b, c, d);
        } else {
          indices.push(a, b, c, b, d, c);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export function createRidgeLayer(
  context: FacilityZoneContext,
  name: string,
  options: RidgeGeometryOptions,
  material: THREE.Material,
): THREE.Mesh<THREE.BufferGeometry, THREE.Material> {
  const geometry = context.tracker.track(createRidgeGeometry(options));
  const ridge = new THREE.Mesh(geometry, material);
  ridge.name = name;
  ridge.userData.signature = true;
  return ridge;
}
```

In `createShanshuiGeometryKit`, replace the two `createMountainGeometry` kit entries:

```ts
    mountainTall: tracker.track(
      createRidgeGeometry({ seed: 1979, crestSegments: 26, rows: 8 }),
    ),
    mountainBroad: tracker.track(
      createRidgeGeometry({ seed: 2018, width: 2.6, depth: 1.5, crestSegments: 22, rows: 6 }),
    ),
```

(`createMountainGeometry` stays in the file only if still referenced; if unused after the swap, delete it.)

- [ ] **Step 4: Swap mountain/stone to ink materials in materials.ts**

Add imports:

```ts
import { createInkMaterial, isInkMaterial, syncInkMaterialAtmosphere } from "./ink/inkMaterials";
```

Change the `FacilityMaterials` interface entries:

```ts
  readonly mountain: THREE.ShaderMaterial;
  readonly stone: THREE.ShaderMaterial;
```

Add to `FacilityMaterialResources`:

```ts
  syncAtmosphere(fogColor: THREE.Color, fogDensity: number): void;
```

In `createFacilityMaterials`, replace the `mountain:` and `stone:` entries inside `Object.freeze({...})`:

```ts
      mountain: tracker.track(
        createInkMaterial({
          inkColor: INK.zhong,
          valueBias: 0.16,
          cun: "hemp",
          cunStrength: 0.85,
          fogColor: new THREE.Color(INK.paper),
          fogDensity: 0.012,
        }),
      ),
      stone: tracker.track(
        createInkMaterial({
          inkColor: INK.zhong,
          valueBias: 0.22,
          cun: "axe",
          cunStrength: 0.7,
          fogColor: new THREE.Color(INK.paper),
          fogDensity: 0.012,
        }),
      ),
```

(`bamboo` keeps `inkValueMaterial` toon — Phase 3. The `gradientMap` texture stays for bamboo.)

Update the returned resources object:

```ts
    return {
      materials,
      syncAtmosphere(fogColor, fogDensity) {
        for (const material of Object.values(materials)) {
          if (isInkMaterial(material)) {
            syncInkMaterialAtmosphere(
              material as THREE.ShaderMaterial,
              fogColor,
              fogDensity,
            );
          }
        }
      },
      dispose: () => tracker.dispose(),
    };
```

In `createFacilityWorld.ts`, inside the returned `update(sample, elapsedSeconds, motionEnergy)`, add as the FIRST line of the update body:

```ts
        materialResources.syncAtmosphere(
          new THREE.Color(sample.atmosphere.fogColor),
          sample.atmosphere.fogDensity,
        );
```

- [ ] **Step 5: Update materials.test.ts expectations**

In `materials.test.ts` first `it(...)` block:
- Change `const toonMaterialKeys = ["mountain", "stone", "bamboo"] as const;` to `const toonMaterialKeys = ["bamboo"] as const;`
- After the toon loop, add:

```ts
    for (const key of ["mountain", "stone"] as const) {
      assert.ok(
        resources.materials[key] instanceof THREE.ShaderMaterial,
        `${key} must be an unlit ink ShaderMaterial`,
      );
      assert.equal(resources.materials[key].lights, false);
    }
```

- Replace the gradientMap block (the five lines from `const gradientMap = resources.materials.mountain.gradientMap;` through the `assert.equal(gradientMap.magFilter, ...)` line) with assertions on bamboo only:

```ts
    const gradientMap = resources.materials.bamboo.gradientMap;
    assert.ok(gradientMap instanceof THREE.DataTexture);
    assert.equal(gradientMap.image.width, 12);
    assert.equal(gradientMap.image.height, 1);
    assert.deepEqual(Array.from(gradientMap.image.data as Uint8Array), [
      32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 196, 220,
    ]);
    assert.equal(gradientMap.minFilter, THREE.NearestFilter);
    assert.equal(gradientMap.magFilter, THREE.NearestFilter);
```

- The mountain/paper HSL separation assertion: `resources.materials.mountain.color` no longer exists on a ShaderMaterial. Replace those lines with:

```ts
    const mountainInk = resources.materials.mountain.uniforms.uInk
      .value as InstanceType<typeof THREE.Color>;
    const mountainHsl = { h: 0, s: 0, l: 0 };
    const paperHsl = { h: 0, s: 0, l: 0 };
    mountainInk.getHSL(mountainHsl);
    resources.materials.paper.color.getHSL(paperHsl);
    assert.ok(
      paperHsl.l - mountainHsl.l >= 0.45,
      "paper forms need clear value separation from ink mountains",
    );
```

- In the second `it(...)` (disposal), change `resources.materials.mountain.gradientMap?.addEventListener(...)` to `resources.materials.bamboo.gradientMap?.addEventListener(...)`.

- [ ] **Step 6: Run tests and capture**

Run: `npm test 2>&1 | tail -5`
Expected: `# fail 0`
Run: `node scripts/capture-journey.mjs --label ink-ridges --gate phase1`
Expected: GATES PASS, budgets unchanged (kit swap is geometry-only, same draw calls)

- [ ] **Step 7: Commit**

```bash
git add components/immersive/facility/
git commit -m "feat: swap mountains to ridge profiles with unlit ink materials"
```

---

### Task 5: Hero Fan Kuan composition + telephoto framing

**Files:**
- Modify: `components/immersive/facility/materials.ts` (add `mountainNear`, `mountainFar` entries)
- Modify: `components/immersive/facility/zones/exterior.ts` (host peak, mist band, waterfall, moss dots; depth-band material assignment)
- Modify: `components/immersive/facility/shanshuiPrimitives.ts` (add `createMossDots`, `createWaterfallThread`)
- Modify: `components/immersive/facility/narrative.ts` (telephoto fov targets)
- Modify: `components/immersive/facility/cameraPath.ts` (first control point + entrance aim)
- Modify: `components/immersive/facility/narrative.test.ts`, `components/immersive/facility/cameraPath.test.ts` (expectation updates if they assert old fov/control-point values)
- Create: `docs/qa/2026-07-17-ink-core-hero.md`

**Interfaces:**
- Consumes: `createRidgeLayer`, `RidgeGeometryOptions` (Task 4); ink materials (Task 2)
- Produces:
  - `FacilityMaterials.mountainNear: THREE.ShaderMaterial` (nong, raindrop cun), `FacilityMaterials.mountainFar: THREE.ShaderMaterial` (dan, hemp cun light)
  - `createMossDots(context, name, options: { count: number; seed: number; center: readonly [number,number,number]; span: readonly [number,number,number] }): THREE.InstancedMesh`
  - `createWaterfallThread(context, name, options: { x: number; z: number; topY: number; bottomY: number; width: number }): THREE.Mesh`

- [ ] **Step 1: Add the depth-band materials in materials.ts**

Interface additions (keep declaration order stable — tests assert key order; append the two new keys AFTER `cinnabar`):

```ts
  readonly mountainNear: THREE.ShaderMaterial;
  readonly mountainFar: THREE.ShaderMaterial;
```

Entries (after `cinnabar` in the frozen object):

```ts
      mountainNear: tracker.track(
        createInkMaterial({
          inkColor: INK.nong,
          valueBias: 0.24,
          cun: "raindrop",
          cunStrength: 1,
          fogColor: new THREE.Color(INK.paper),
          fogDensity: 0.012,
        }),
      ),
      mountainFar: tracker.track(
        createInkMaterial({
          inkColor: INK.dan,
          valueBias: 0.1,
          cun: "hemp",
          cunStrength: 0.5,
          fogColor: new THREE.Color(INK.paper),
          fogDensity: 0.012,
        }),
      ),
```

Update `materials.test.ts` key-order assertion to append `"mountainNear", "mountainFar"` after `"cinnabar"`, and extend the ShaderMaterial loop keys to include them.

- [ ] **Step 2: Add moss dots and waterfall builders to shanshuiPrimitives.ts**

```ts
export interface MossDotOptions {
  readonly count: number;
  readonly seed: number;
  readonly center: readonly [number, number, number];
  readonly span: readonly [number, number, number];
}

/** 點苔 moss dots — jiao dabs clustered near a crest. */
export function createMossDots(
  context: FacilityZoneContext,
  name: string,
  options: MossDotOptions,
): THREE.InstancedMesh {
  const count = Math.max(1, Math.floor(options.count));
  const dots = new THREE.InstancedMesh(
    context.shanshuiGeometry.stone,
    context.materials.ink,
    count,
  );
  dots.name = name;
  dots.userData.signature = true;
  const transform = new THREE.Object3D();
  for (let index = 0; index < count; index += 1) {
    const u = hash01(options.seed, index, 0x2d41);
    const spread = hash01(options.seed, index, 0x83f7);
    const lift = 0.72 + hash01(options.seed, index, 0x51a3) * 0.26;
    transform.position.set(
      options.center[0] + (u - 0.5) * options.span[0],
      options.center[1] + lift * options.span[1],
      options.center[2] + (spread - 0.5) * options.span[2],
    );
    const scale = 0.06 + hash01(options.seed, index, 0x6b1d) * 0.09;
    transform.scale.set(scale, scale * 0.7, scale);
    transform.rotation.set(0, hash01(options.seed, index, 0x90e5) * Math.PI, 0);
    transform.updateMatrix();
    dots.setMatrixAt(index, transform.matrix);
  }
  dots.instanceMatrix.needsUpdate = true;
  return dots;
}

export interface WaterfallThreadOptions {
  readonly x: number;
  readonly z: number;
  readonly topY: number;
  readonly bottomY: number;
  readonly width: number;
}

/** Waterfall as unpainted paper — a pale thread breaking the host peak's mass. */
export function createWaterfallThread(
  context: FacilityZoneContext,
  name: string,
  options: WaterfallThreadOptions,
): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
  const height = options.topY - options.bottomY;
  const geometry = context.tracker.track(
    new THREE.PlaneGeometry(options.width, height),
  );
  const material = context.tracker.track(
    new THREE.MeshBasicMaterial({
      color: INK.paper,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    }),
  );
  const thread = new THREE.Mesh(geometry, material);
  thread.name = name;
  thread.userData.signature = true;
  thread.position.set(options.x, options.bottomY + height / 2, options.z);
  thread.renderOrder = 1;
  return thread;
}
```

Add `import { INK } from "./ink/inkLadder";` to shanshuiPrimitives.ts imports.

- [ ] **Step 3: Rebuild the hero composition in exterior.ts**

In `createExteriorFacilityZones`, after the existing `exterior.add(...)` call, insert:

```ts
  if (
    context.tuning.profile === "desktop" ||
    context.tuning.profile === "constrained"
  ) {
    const hostPeak = createRidgeLayer(
      context,
      "shanshui-hero-host-peak",
      { seed: 1042, width: 3, depth: 1.6, crestSegments: 34, rows: 12 },
      context.materials.mountainNear,
    );
    hostPeak.position.set(1.5, -1.5, -40);
    hostPeak.scale.set(10, 20, 10);
    const mistBand = createMistPass(context, "shanshui-hero-mist-band", [-27]);
    const waterfall = createWaterfallThread(
      context,
      "shanshui-hero-waterfall-thread",
      { x: 0.9, z: -33.4, topY: 13.5, bottomY: 1.4, width: 0.55 },
    );
    const moss = createMossDots(context, "shanshui-hero-crest-moss", {
      count: context.tuning.profile === "desktop" ? 42 : 26,
      seed: 977,
      center: [1.5, -1.5, -40],
      span: [22, 20, 7],
    });
    exterior.add(hostPeak, mistBand.root, waterfall, moss);
  }
```

Add `createMossDots`, `createRidgeLayer`, `createWaterfallThread` to the shanshuiPrimitives import block in exterior.ts.

Depth-band reassignment in the existing `exterior.add(...)`: change the `shanshui-hero-distant-peaks` cluster's material argument (currently default `context.materials.mountain`) to `context.materials.mountainFar`, and the `shanshui-hero-foothills` cluster's material from `context.materials.shell` to `context.materials.mountain`.

- [ ] **Step 4: Telephoto fov targets in narrative.ts + camera aim in cameraPath.ts**

In `narrative.ts` `facilityChapters`, replace the `camera.fov` values:
- hero: `fov: 55` → `fov: 30`
- proof: `fov: 50` → `fov: 33`
- kota: `fov: 46` → `fov: 34`
- audiobook: `fov: 47` → `fov: 36`
- archon: `fov: 56` → `fov: 40`
- splash-ink: `fov: 52` → `fov: 36`
- research-labs: `fov: 46` → `fov: 33`
- contact: `fov: 49` → `fov: 30`

In `profileTreatment`, change `fov: lerp(49, value.fov, scale)` to `fov: lerp(36, value.fov, scale)`.

In `cameraPath.ts`:
- First control point `{ x: 0, y: 8, z: 24 }` → `{ x: 0, y: 7.2, z: 30 }`
- `facilityEntrancePosition` `{ x: 0, y: 2.1, z: -10 }` → `{ x: 0, y: 3.2, z: -10 }`

- [ ] **Step 5: Run tests; update any stale expectations**

Run: `npm test 2>&1 | tail -20`
Expected: `# fail 0`. If `narrative.test.ts` / `cameraPath.test.ts` assert the old fov values, control point, or entrance position exactly, update those expectations to the new constants from Step 4 (quote the new values in the test; do not weaken assertions to "any number").

- [ ] **Step 6: Capture, look, iterate (max 3 tuning rounds)**

Run: `node scripts/capture-journey.mjs --label ink-core-hero --gate phase1`

Then READ `~/kumma-qa/shots-ink-core-hero/00-top.png` and `01-hero.png` and judge against the Fan Kuan target: monumental host peak filling ~2/3 of frame height, mass broken by mist band and waterfall thread, flanks paler, foreground paper dominant. If the host peak is cropped, too small, or too dark/light, tune ONLY these constants and re-capture: `hostPeak.scale.set(...)` (10,20,10), `hostPeak.position` z (≥ -40), waterfall `topY/bottomY/x`, moss `span`, hero `fov` (28–36). Do not touch other zones. Record the final constants.

Also verify `04-kota` still passes its 0.38 override and no stop regressed below its baseline coverage.

- [ ] **Step 7: Write the QA note**

Create `docs/qa/2026-07-17-ink-core-hero.md`: before/after table (baseline vs ink-core-hero coverage + draw calls per stop), the final host-peak constants, remaining gaps vs the design (bamboo strokes, KOTA cliffs, mist-band system → Phase 3), and a one-paragraph verdict on whether the hero reads as Fan Kuan monumental.

- [ ] **Step 8: Commit**

```bash
git add components/immersive/facility/ docs/qa/2026-07-17-ink-core-hero.md
git commit -m "feat: rebuild hero as Fan Kuan monumental ink composition with telephoto framing"
```

---

## Self-review checklist (controller verified)

- All five tasks have complete code blocks; no placeholders.
- Type consistency: `createRidgeLayer`/`RidgeGeometryOptions`/`createMossDots`/`createWaterfallThread` names match between producing (Task 4/5) and consuming (Task 5) tasks; `syncAtmosphere` signature matches Task 4 def and use in createFacilityWorld; key-order test update in Task 5 Step 1 accounts for Task 4's unchanged order (new keys appended last).
- Task 5 Step 6 is the only visual-judgment step; bounded to 3 rounds with named tunable constants.
