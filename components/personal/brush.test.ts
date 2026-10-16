import { test } from "node:test";
import assert from "node:assert/strict";
import { ensoPath, profiles, dryStreaks } from "./brush";

const heading = (a: number[], b: number[]) => Math.atan2(b[1] - a[1], b[0] - a[0]);

test("the ensō presses on landing and runs out toward the release", () => {
  const { enso } = profiles;
  assert.ok(enso(0.02) > enso(0.4) && enso(0.4) > enso(0.95));
  for (let f = 0; f <= 1; f += 0.05) assert.ok(enso(f) > 0 && enso(f) <= 1);
});

test("the ensō is smooth: no per-vertex tremor", () => {
  const points = ensoPath({ seed: 33, facing: 0 });
  assert.ok(points.length > 90);
  const turns: number[] = [];
  for (let i = 4; i < points.length - 1; i += 1) {
    let d = heading(points[i], points[i + 1]) - heading(points[i - 1], points[i]);
    d = Math.atan2(Math.sin(d), Math.cos(d));
    turns.push(d);
  }
  // Curvature changes gently along the body.
  for (let i = 1; i < turns.length; i += 1) assert.ok(Math.abs(turns[i] - turns[i - 1]) < 0.05);
  // It stays open: the end does not reach the start.
  const [a, b] = [points[4], points[points.length - 1]];
  assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) > 15);
});

test("dry streaks only appear where the ink runs out, and widen toward the end", () => {
  const line: [number, number][] = Array.from({ length: 200 }, (_, i) => [i * 2, 0]);
  const p = line.map(() => 0.6);
  const gaps = dryStreaks(line, p, { size: 20, thinning: 0.75, from: 0.55, seed: 4 });
  assert.ok(gaps.length > 12);
  const start = (g: { d: string }) => Number(/M ([\d.]+)/.exec(g.d)![1]);
  assert.ok(Math.min(...gaps.map(start)) >= 0.55 * 398 - 1);
  const early = gaps.filter((g) => start(g) < 0.7 * 398);
  const late = gaps.filter((g) => start(g) >= 0.85 * 398);
  const mean = (xs: { width: number }[]) => xs.reduce((a, g) => a + g.width, 0) / xs.length;
  assert.ok(late.length >= early.length);
  assert.ok(mean(late) > mean(early) * 1.5);
});
