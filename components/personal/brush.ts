// A brush, not a ballpoint: the 朱筆 that sets down the ensō. Where a
// ballpoint presses into turns, a brush presses where it lands (頓) and
// runs dry toward the release — pressure as arc fraction f → pressure.
// (無 uses the font's own brush shapes: see Wu.)

import { random, type Point } from "./pen";

const smooth = (a: number, b: number, f: number) => {
  const t = Math.min(1, Math.max(0, (f - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export type Profile = (f: number) => number;

export const profiles = {
  // The ensō: a 頓 on landing, the body drying from 0.9 to 0.55, then
  // running out to the release.
  enso: (f: number) => (f < 0.04 ? 1 : f < 0.7 ? mix(1, mix(0.9, 0.55, (f - 0.05) / 0.65), smooth(0.04, 0.08, f)) : mix(0.55, 0.15, smooth(0.7, 1, f))),
};

// One uninhibited circle in a 0–100 box: a radius that swells gently twice
// around (no per-point tremor), spiralling in a little so the close does
// not retrace, open by `gap` of a turn. It lands with a short 藏鋒 — the
// tip pushed back against the direction before the sweep.
export function ensoPath({ seed, facing = 0, gap = 0.16 }: { seed: number; facing?: number; gap?: number }): Point[] {
  const rand = random(seed);
  const p1 = rand() * Math.PI * 2;
  const p2 = rand() * Math.PI * 2;
  const start = facing + gap * Math.PI;
  const sweep = Math.PI * 2 * (1 - gap);
  const steps = 96;
  const ring: Point[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const a = start + sweep * t;
    const r = 46 * (1 + 0.035 * Math.sin(a + p1) + 0.015 * Math.sin(2 * a + p2)) * (1 - 0.05 * t);
    ring.push([50 + Math.cos(a) * r, 50 + Math.sin(a) * r * 0.97]);
  }
  // 藏鋒: three points back along the tangent, then into the sweep.
  const [x0, y0] = ring[0];
  const tx = -Math.sin(start);
  const ty = Math.cos(start);
  const back = 46 * 0.15;
  const entry: Point[] = [
    [x0 - tx * back * 0.35, y0 - ty * back * 0.35],
    [x0 - tx * back, y0 - ty * back],
    [x0 - tx * back * 0.5, y0 - ty * back * 0.5],
  ];
  return [...entry, ...ring];
}

// 飛白: where the brush runs dry the paper shows through in streaks along
// the stroke. Six bristle lines offset across the stroke's width, cut into
// gaps that lengthen, multiply and widen as the ink runs out. Drawn in black in
// the reveal mask, so they are holes in the ink.
export function dryStreaks(
  line: Point[],
  pressure: number[],
  { size, thinning, from, seed }: { size: number; thinning: number; from: number; seed: number },
): { d: string; width: number }[] {
  const rand = random(seed + 7);
  const lengths = [0];
  for (let i = 1; i < line.length; i += 1) lengths.push(lengths[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]));
  const total = lengths[lengths.length - 1] || 1;
  const fmt = (n: number) => String(Number(n.toFixed(1)));
  const out: { d: string; width: number }[] = [];
  for (let s = 0; s < 6; s += 1) {
    const across = (s / 5 - 0.5) * 2 * 0.45 + (rand() - 0.5) * 0.08;
    let i = line.findIndex((_, k) => lengths[k] / total >= from);
    while (i > 0 && i < line.length - 1) {
      const f = lengths[i] / total;
      const dryness = (f - from) / (1 - from);
      // Gaps between dashes shrink, dashes grow, as the brush empties.
      const gapPx = mix(46, 6, dryness) * (0.6 + rand() * 0.8);
      const dashPx = mix(3, 22, dryness) * (0.6 + rand() * 0.8);
      let j = i;
      while (j < line.length - 1 && lengths[j] - lengths[i] < gapPx) j += 1;
      const startAt = j;
      while (j < line.length - 1 && lengths[j] - lengths[startAt] < dashPx) j += 1;
      if (j <= startAt) break;
      const piece: string[] = [];
      for (let k = startAt; k <= j; k += 1) {
        const a = line[Math.max(0, k - 1)];
        const b = line[Math.min(line.length - 1, k + 1)];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const nx = -(b[1] - a[1]) / len;
        const ny = (b[0] - a[0]) / len;
        const radius = size * (0.5 - thinning * (0.5 - pressure[k]));
        piece.push(`${fmt(line[k][0] + nx * radius * across)} ${fmt(line[k][1] + ny * radius * across)}`);
      }
      // Each gap is its own stroke, wider as the brush empties: the
      // bristles part, rather than a hairline scratched over the ink.
      out.push({ d: `M ${piece.join(" L ")}`, width: Number((mix(0.6, size * 0.2, dryness) * (0.7 + rand() * 0.6)).toFixed(2)) });
      i = j + 1;
    }
  }
  return out;
}
