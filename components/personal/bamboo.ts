// 朱竹: bamboo in vermilion, in the order a painter writes it — the culm
// bottom to top a joint at a time, the nodes across the gaps, the
// branches, then the leaves in clusters (個, 介). Every take is a new
// stalk from its seed. Units are the plate's: 400 × 520.

import { random, type Point } from "./pen";
import type { Profile } from "./brush";

const smooth = (a: number, b: number, f: number) => {
  const t = Math.min(1, Math.max(0, (f - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const bambooProfiles = {
  // A joint: pressed in, held, pressed again into the node (頓).
  culm: ((f) => (f < 0.06 ? 1 : f < 0.86 ? mix(0.86, 0.74, (f - 0.06) / 0.8) : mix(0.74, 0.98, smooth(0.86, 1, f)))) as Profile,
  // A node: heavy at both ends, thin across the middle.
  node: ((f) => 0.5 + 0.4 * Math.abs(2 * f - 1) ** 1.5) as Profile,
  // A branch: set down firm, lightening as it reaches.
  branch: ((f) => mix(1, 0.45, smooth(0, 1, f))) as Profile,
  // A leaf: in lightly, full by a third, then drawn out to a point.
  leaf: ((f) => (f < 0.14 ? mix(0.3, 1, smooth(0, 0.14, f)) : f < 0.38 ? 1 : mix(1, 0.04, smooth(0.38, 1, f)))) as Profile,
};

export type BambooStroke = {
  kind: "culm" | "node" | "branch" | "leaf";
  points: Point[];
  size: number;
  // A little dry brush toward the top of the culm (飛白).
  dry?: number;
  // The top joint is not cut: the brush lifts off to a point.
  tip?: boolean;
};

export const PLATE = { width: 400, height: 520 };

// A gentle curve from a in direction `angle` (radians, 0 = right, y down),
// `bend` radians over its length.
function curve([x, y]: Point, angle: number, length: number, bend: number, steps = 6): Point[] {
  const out: Point[] = [[x, y]];
  let a = angle - bend / 2;
  const step = length / steps;
  for (let i = 0; i < steps; i += 1) {
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
    a += bend / steps;
    out.push([x, y]);
  }
  return out;
}

export function bamboo(seed: number): BambooStroke[] {
  const rand = random(seed);
  const side = rand() < 0.5 ? -1 : 1; // which way the stalk leans
  const base: Point = [PLATE.width / 2 - side * (70 + rand() * 30), 508];
  const top = 46 + rand() * 30;
  const lean = side * (40 + rand() * 40);
  const sway = (rand() - 0.5) * 16;
  const at = (t: number): Point => [
    base[0] + lean * t ** 1.7 + sway * Math.sin(Math.PI * t),
    base[1] - (base[1] - top) * t,
  ];

  // Short joints at both ends, long in the middle (兩頭短，中間長).
  const weights = [0.1, 0.16, 0.21, 0.22, 0.18, 0.13].map((w) => w * (0.85 + rand() * 0.3));
  const sum = weights.reduce((a, b) => a + b, 0);
  const gap = 0.016;
  const strokes: BambooStroke[] = [];
  const nodes: { t: number; point: Point; width: number }[] = [];
  let t = 0;
  weights.forEach((w, i) => {
    const t0 = t + (i ? gap / 2 : 0);
    t += w / sum;
    const t1 = i === weights.length - 1 ? 1 : t - gap / 2;
    const size = mix(17, 12, t0);
    const points: Point[] = [];
    for (let k = 0; k <= 5; k += 1) points.push(at(mix(t0, t1, k / 5)));
    const last = i === weights.length - 1;
    strokes.push({ kind: "culm", points, size, dry: i >= 3 ? 0.5 + rand() * 0.2 : undefined, tip: last || undefined });
    if (i < weights.length - 1) nodes.push({ t, point: at(t), width: size });
  });

  // Each node: a short stroke across the gap, a slight smile.
  for (const node of nodes) {
    const [x, y] = node.point;
    const half = node.width * 0.85;
    strokes.push({
      kind: "node",
      points: [
        [x - half, y - 1],
        [x - half * 0.4, y + 1.6],
        [x + half * 0.4, y + 1.4],
        [x + half, y - 1.6],
      ],
      size: 6,
    });
  }

  // Branches from the upper nodes, alternating sides, reaching up and out.
  const tips: { point: Point; side: number; angle: number }[] = [];
  nodes.slice(2).forEach((node, i) => {
    if (i > 0 && rand() < 0.25) return;
    const s = (i % 2 === 0 ? 1 : -1) * side;
    const angle = -Math.PI / 2 + s * (0.55 + rand() * 0.35);
    const length = 70 + rand() * 50;
    const points = curve(node.point, angle, length, s * (0.25 + rand() * 0.2));
    strokes.push({ kind: "branch", points, size: 5.5 });
    // A twig off the branch, two thirds along.
    const fork = points[4];
    const twig = curve(fork, angle + s * 0.6, length * 0.4, s * 0.2, 4);
    strokes.push({ kind: "branch", points: twig, size: 3.6 });
    tips.push({ point: points[points.length - 1], side: s, angle });
    tips.push({ point: twig[twig.length - 1], side: s, angle: angle + s * 0.6 });
  });
  // And the crown, at the top of the culm.
  tips.push({ point: at(1), side, angle: -Math.PI / 2 + side * 0.35 });

  // Leaves: three (個) or four (介) from each tip, hanging out and down,
  // the middle one longest.
  for (const tip of tips) {
    const count = rand() < 0.5 ? 3 : 4;
    // Hanging: below the horizontal on the branch's side.
    const down = tip.side > 0 ? 0.35 + rand() * 0.5 : Math.PI - 0.35 - rand() * 0.5;
    const fan = [-0.62, 0, 0.5, 1.05].slice(0, count);
    fan.forEach((offset, k) => {
      let angle = down + tip.side * offset * (0.8 + rand() * 0.4);
      const length = (k === 1 ? 128 : 88) * (0.75 + rand() * 0.45);
      // Leaves spring from along the twig's end, not from one point.
      const back = k * (4 + rand() * 5);
      const start: Point = [
        tip.point[0] - Math.cos(tip.angle) * back + (rand() - 0.5) * 4,
        tip.point[1] - Math.sin(tip.angle) * back + (rand() - 0.5) * 4,
      ];
      // A leaf that would run off the plate turns back across the stalk.
      const reach = start[0] + Math.cos(angle) * length;
      if (reach < 12 || reach > PLATE.width - 12) angle = Math.PI - angle;
      strokes.push({
        kind: "leaf",
        points: curve(start, angle, length, tip.side * (0.18 + rand() * 0.22)),
        size: 6 + rand() * 2.5,
      });
    });
  }
  return strokes;
}
