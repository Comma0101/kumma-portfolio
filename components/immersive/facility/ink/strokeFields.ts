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
  return (h >>> 0) / 0xffffffff;
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
