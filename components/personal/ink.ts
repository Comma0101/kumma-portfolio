// A ballpoint, not a vector line: width follows how hard the pen presses,
// the pen presses into turns and lightens on straight runs, and ink pools
// where it reverses. Pure geometry so it can be tested and rendered as SVG.

import { getStroke } from "perfect-freehand";
import { random, type Point } from "./pen";

export type Pool = { x: number; y: number; r: number };
// pace[i] = fraction of the stroke drawn at time i / (pace.length - 1).
export type Ink = { outline: string; pools: Pool[]; center: string; pace: number[] };

const fmt = (n: number) => String(Number(n.toFixed(1)));

// Corner-cutting keeps the hand from drawing polygons.
function chaikin(points: Point[], iterations = 2): Point[] {
  let out = points;
  for (let n = 0; n < iterations && out.length > 2; n += 1) {
    const next: Point[] = [out[0]];
    for (let i = 0; i < out.length - 1; i += 1) {
      const [ax, ay] = out[i];
      const [bx, by] = out[i + 1];
      next.push([ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25]);
      next.push([ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75]);
    }
    next.push(out[out.length - 1]);
    out = next;
  }
  return out;
}

export function resample(points: Point[], spacing: number): Point[] {
  if (points.length < 2) return points.slice();
  const out: Point[] = [points[0]];
  let carry = 0;
  for (let i = 1; i < points.length; i += 1) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    const length = Math.hypot(bx - ax, by - ay);
    let at = spacing - carry;
    while (at <= length) {
      const t = at / length;
      out.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
      at += spacing;
    }
    carry = length - (at - spacing);
  }
  const last = points[points.length - 1];
  const tail = out[out.length - 1];
  if (Math.hypot(last[0] - tail[0], last[1] - tail[1]) > spacing * 0.35) out.push(last);
  else out[out.length - 1] = last;
  return out;
}

function turn(points: Point[], i: number, reach: number) {
  const a = points[Math.max(0, i - reach)];
  const b = points[i];
  const c = points[Math.min(points.length - 1, i + reach)];
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  const vx = c[0] - b[0];
  const vy = c[1] - b[1];
  const lu = Math.hypot(ux, uy);
  const lv = Math.hypot(vx, vy);
  if (!lu || !lv) return 0;
  return Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (lu * lv))));
}

export function pressures(points: Point[], seed: number, { flat = false } = {}): number[] {
  if (flat) return points.map(() => 0.55);
  const rand = random(seed);
  const bend = points.map((_, i) => turn(points, i, 2) / Math.PI);
  // Spread each turn over its neighbours: the hand slows before and after.
  const slow = bend.map((_, i) => {
    let sum = 0;
    let weight = 0;
    for (let k = -4; k <= 4; k += 1) {
      const j = i + k;
      if (j < 0 || j >= bend.length) continue;
      const w = 1 - Math.abs(k) / 5;
      sum += bend[j] * w;
      weight += w;
    }
    return sum / weight;
  });
  let drift = 0;
  return slow.map((value) => {
    drift = drift * 0.85 + (rand() - 0.5) * 0.05;
    return Math.max(0.2, Math.min(1, 0.36 + value * 1.9 + drift));
  });
}

function poolsAt(points: Point[], size: number, seed: number): Pool[] {
  const rand = random(seed + 101);
  const pools: Pool[] = [];
  for (let i = 2; i < points.length - 2; i += 1) {
    if (turn(points, i, 2) < 2.2) continue;
    const [x, y] = points[i];
    if (pools.some((pool) => Math.hypot(pool.x - x, pool.y - y) < size * 4)) continue;
    pools.push({
      x: Number(fmt(x + (rand() - 0.5) * size * 0.3)),
      y: Number(fmt(y + (rand() - 0.5) * size * 0.3)),
      r: Number(fmt(size * (0.42 + rand() * 0.22))),
    });
  }
  return pools;
}

// How a hand spends time on a stroke: quick along straight runs, slower
// into turns and reversals. Returns arc fractions sampled at even times.
export function pace(points: Point[], samples = 48): number[] {
  if (points.length < 2) return [0, 1];
  const arc = [0];
  const time = [0];
  for (let i = 1; i < points.length; i += 1) {
    const length = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    const bend = turn(points, i, 2) / Math.PI;
    arc.push(arc[i - 1] + length);
    time.push(time[i - 1] + length * (1 + bend * 4.5));
  }
  const totalArc = arc[arc.length - 1] || 1;
  const totalTime = time[time.length - 1] || 1;
  const out: number[] = [];
  let j = 1;
  for (let k = 0; k <= samples; k += 1) {
    const t = (k / samples) * totalTime;
    while (j < time.length - 1 && time[j] < t) j += 1;
    const span = time[j] - time[j - 1] || 1;
    const f = Math.min(1, Math.max(0, (t - time[j - 1]) / span));
    out.push(Number(((arc[j - 1] + (arc[j] - arc[j - 1]) * f) / totalArc).toFixed(4)));
  }
  out[0] = 0;
  out[out.length - 1] = 1;
  return out;
}

// Fraction of the stroke drawn at time t (0–1).
export function arcAt(pacing: number[], t: number) {
  const x = Math.min(1, Math.max(0, t)) * (pacing.length - 1);
  const i = Math.min(pacing.length - 2, Math.floor(x));
  return pacing[i] + (pacing[i + 1] - pacing[i]) * (x - i);
}

// Time (0–1) at which a fraction of the stroke has been drawn.
export function timeAt(pacing: number[], arc: number) {
  const a = Math.min(1, Math.max(0, arc));
  for (let i = 1; i < pacing.length; i += 1) {
    if (pacing[i] >= a) {
      const span = pacing[i] - pacing[i - 1] || 1;
      return (i - 1 + (a - pacing[i - 1]) / span) / (pacing.length - 1);
    }
  }
  return 1;
}

export function centerline(points: Point[]) {
  return `M ${points.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(" L ")}`;
}

export function inkStroke(
  points: Point[],
  { size, seed, flat = false }: { size: number; seed: number; flat?: boolean },
): Ink {
  const line = resample(chaikin(points, 3), Math.max(2, size * 0.8));
  const p = pressures(line, seed, { flat });
  const outline = getStroke(
    line.map(([x, y], i) => [x, y, p[i]]),
    {
      size,
      thinning: flat ? 0 : 0.62,
      smoothing: 0.5,
      streamline: 0.2,
      simulatePressure: false,
      start: { taper: flat ? 0 : size * 2.5, cap: true },
      end: { taper: flat ? 0 : size * 4, cap: true },
      last: true,
    },
  );
  const d = outline.length
    ? `M ${outline.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(" L ")} Z`
    : "";
  return {
    outline: d,
    pools: flat ? [] : poolsAt(line, size, seed),
    center: centerline(line),
    pace: flat ? [0, 1] : pace(line),
  };
}
