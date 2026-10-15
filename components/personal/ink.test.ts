import test from "node:test";
import assert from "node:assert/strict";
import { centerline, inkStroke, pressures, resample } from "./ink";
import type { Point } from "./pen";

const straight: Point[] = [[0, 0], [100, 0], [200, 0], [300, 0]];
const hairpin: Point[] = [[0, 0], [150, 0], [300, 2], [150, 6], [0, 8]];

test("resample spaces points evenly along the stroke", () => {
  const points = resample(straight, 10);
  assert.ok(points.length >= 29 && points.length <= 32, `${points.length}`);
  for (let i = 1; i < points.length - 1; i += 1) {
    const gap = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    assert.ok(Math.abs(gap - 10) < 1.5, `gap ${gap}`);
  }
});

test("the pen presses harder into a turn than along a straight run", () => {
  const points = resample(hairpin, 6);
  const p = pressures(points, 1);
  const turn = points.reduce((best, [x], index) => (x > points[best][0] ? index : best), 0);
  const straightRun = Math.floor(turn / 3);
  assert.ok(p[turn] > p[straightRun] + 0.1, `turn ${p[turn]} straight ${p[straightRun]}`);
  assert.ok(p.every((value) => value >= 0.2 && value <= 1));
});

test("a flat pen has one constant pressure", () => {
  const p = pressures(resample(hairpin, 6), 1, { flat: true });
  assert.ok(p.every((value) => value === p[0]));
});

test("an ink stroke is one closed outline plus pools at hard reversals", () => {
  const ink = inkStroke(hairpin, { size: 4, seed: 2 });
  assert.match(ink.outline, /^M [\d.-]+ [\d.-]+ .* Z$/);
  assert.ok(!/NaN|Infinity/.test(ink.outline));
  assert.ok(ink.pools.length >= 1);
  assert.equal(inkStroke(straight, { size: 4, seed: 2 }).pools.length, 0);
});

test("ink is deterministic for a seed", () => {
  assert.deepEqual(inkStroke(hairpin, { size: 3, seed: 9 }), inkStroke(hairpin, { size: 3, seed: 9 }));
});

test("the centerline follows the resampled stroke from first to last point", () => {
  const d = centerline(resample(straight, 50));
  assert.match(d, /^M 0 0 L /);
  assert.match(d, /300 0$/);
});
