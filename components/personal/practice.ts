// 習: the same stroke, again and again. A row of tally strokes that a hand
// repeats: the first ones shake, wander and press unevenly; each is a
// little steadier than the last, until the hand is sure. Units are the
// sheet's: 1000 × 120.

import { random, type Point } from "./pen";
import type { Profile } from "./brush";

export const SHEET = { width: 1000, height: 120 };

export type PracticeStroke = { points: Point[]; pressure: Profile; skill: number };

export function practiceStrokes(seed: number, count = 14): PracticeStroke[] {
  const rand = random(seed);
  const gap = SHEET.width / count;
  return Array.from({ length: count }, (_, i) => {
    // Skill grows quickly at first, then slowly: practice, not a ramp.
    const skill = 1 - (1 - i / (count - 1)) ** 1.6;
    const loose = 1 - skill;
    const length = 72 * (1 + (rand() - 0.5) * 0.5 * loose);
    const top = 16 + (rand() - 0.5) * 16 * loose;
    // A sure hand keeps one slight slant; an unsure one leans every way.
    const slant = 6 + (rand() - 0.5) * 22 * loose;
    const x0 = gap * (i + 0.5) + (rand() - 0.5) * gap * 0.35 * loose;
    const tremor = 0.35 + 3 * loose;
    const phase = rand() * Math.PI * 2;
    const points: Point[] = [];
    for (let k = 0; k <= 8; k += 1) {
      const t = k / 8;
      const wobble = Math.sin(phase + t * (5 + 7 * loose)) * tremor + (rand() - 0.5) * tremor;
      points.push([x0 + slant * t + wobble, top + length * t]);
    }
    // Pressure: blotchy and uncertain at first; at the end a firm landing,
    // an even body, a clean release.
    const blots = [rand(), rand(), rand()];
    const pressure: Profile = (f) => {
      const sure = f < 0.08 ? 0.95 : 0.78 - 0.28 * f;
      const unsure = 0.42 + 0.3 * Math.sin((f + blots[0]) * 9) * blots[1] + 0.2 * blots[2];
      return Math.max(0.15, Math.min(1, unsure * loose + sure * skill));
    };
    return { points, pressure, skill };
  });
}

// How much a stroke strays from a straight line, in sheet units.
export function wander(points: Point[]) {
  const [ax, ay] = points[0];
  const [bx, by] = points[points.length - 1];
  const length = Math.hypot(bx - ax, by - ay) || 1;
  return Math.max(...points.map(([x, y]) => Math.abs((bx - ax) * (ay - y) - (ax - x) * (by - ay)) / length));
}
