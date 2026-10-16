import test from "node:test";
import assert from "node:assert/strict";
import { arcAt, centerline, inkStroke, pace, pressures, resample, timeAt } from "./ink";
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

test("a straight run is paced evenly: half the time, half the line", () => {
  const p = pace(resample(straight, 5));
  assert.ok(Math.abs(arcAt(p, 0.5) - 0.5) < 0.03, `${arcAt(p, 0.5)}`);
  assert.equal(arcAt(p, 0), 0);
  assert.equal(arcAt(p, 1), 1);
});

test("the hand slows into a turn: more time is spent near the reversal", () => {
  const line = resample(hairpin, 4);
  const p = pace(line);
  // Arc fraction of the turn point (farthest right).
  const turnIndex = line.reduce((best, [x], i) => (x > line[best][0] ? i : best), 0);
  let total = 0;
  const lengths = [0];
  for (let i = 1; i < line.length; i += 1) {
    total += Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
    lengths.push(total);
  }
  const turn = lengths[turnIndex] / total;
  const window = 0.06;
  const timeNearTurn = timeAt(p, turn + window) - timeAt(p, turn - window);
  assert.ok(timeNearTurn > window * 2 * 1.4, `time near turn ${timeNearTurn}`);
});

test("pacing is monotonic and its inverse round-trips", () => {
  const p = pace(resample(hairpin, 4));
  for (let i = 1; i < p.length; i += 1) assert.ok(p[i] >= p[i - 1]);
  for (const arc of [0.1, 0.37, 0.8]) {
    assert.ok(Math.abs(arcAt(p, timeAt(p, arc)) - arc) < 0.02);
  }
});

test("an ink stroke carries its pacing", () => {
  const ink = inkStroke(hairpin, { size: 3, seed: 1 });
  assert.ok(ink.pace.length > 10);
  assert.equal(ink.pace[0], 0);
  assert.equal(ink.pace[ink.pace.length - 1], 1);
});

test("a stroke can end in a pool, where the pen stops and presses", () => {
  const ink = inkStroke(straight, { size: 4, seed: 2, endPool: true });
  assert.equal(ink.pools.length, 1);
  const pool = ink.pools[0];
  assert.ok(Math.abs(pool.x - 300) < 3 && Math.abs(pool.y) < 3);
  assert.ok(pool.r > 2);
});
