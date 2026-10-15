import test from "node:test";
import assert from "node:assert/strict";
import { fitPoints, handLine, loop, scribble, steps, underline, type Point } from "./pen";
import { wu } from "./wu";

const finite = (points: Point[]) => points.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y));

test("every gesture is deterministic for a seed and varies across seeds", () => {
  for (const make of [
    (seed: number) => scribble({ seed }),
    (seed: number) => loop({ seed }),
    (seed: number) => underline({ seed }),
  ]) {
    assert.deepEqual(make(7), make(7));
    assert.notDeepEqual(make(7), make(8));
    assert.ok(finite(make(7)));
  }
});

test("scribble stays inside its box with a small overdraw margin", () => {
  for (const [x, y] of scribble({ seed: 3, passes: 5 })) {
    assert.ok(x >= -6 && x <= 106, `x ${x}`);
    assert.ok(y >= -6 && y <= 106, `y ${y}`);
  }
});

test("scribble density grows with passes", () => {
  assert.ok(scribble({ seed: 2, passes: 6 }).length > scribble({ seed: 2, passes: 2 }).length);
});

test("a vertical scribble travels down the column instead of across it", () => {
  const ys = scribble({ seed: 9, passes: 1, axis: "y" }).map(([, y]) => y);
  assert.ok(ys[0] < 10);
  assert.ok(ys[ys.length - 1] > 90);
});

const swept = (points: Point[]) => {
  const angles = points.map(([x, y]) => Math.atan2(y - 50, x - 50));
  let total = 0;
  for (let i = 1; i < angles.length; i += 1) {
    let delta = angles[i] - angles[i - 1];
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    total += delta;
  }
  return Math.abs(total);
};

test("a closed loop overshoots a full turn; an open one stops short", () => {
  assert.ok(swept(loop({ seed: 5, overshoot: 0.15 })) > 2 * Math.PI);
  const open = swept(loop({ seed: 5, overshoot: -0.2 }));
  assert.ok(open < 2 * Math.PI * 0.85 && open > 2 * Math.PI * 0.7, `open ${open}`);
});

test("fitPoints maps the 0–100 box onto a pixel rectangle", () => {
  assert.deepEqual(
    fitPoints([[0, 0], [50, 50], [100, 100]], { x: 10, y: 20, width: 400, height: 20 }),
    [[10, 20], [210, 30], [410, 40]],
  );
});

test("handLine starts and ends exactly on its anchors and wobbles between", () => {
  const points = handLine([0, 0], [300, 0], 4);
  assert.deepEqual(points[0], [0, 0]);
  assert.deepEqual(points[points.length - 1], [300, 0]);
  assert.ok(points.length > 4);
  assert.ok(points.some(([, y]) => y !== 0));
  assert.ok(points.every(([, y]) => Math.abs(y) < 6));
});

test("three forward, two back: every cycle reverses, and the line still arrives", () => {
  const points = steps({ seed: 6, cycles: 4 });
  const xs = points.map(([x]) => x);
  assert.ok(xs[0] <= 1);
  assert.ok(xs[xs.length - 1] >= 99);
  let reversals = 0;
  for (let i = 2; i < xs.length; i += 1) {
    if ((xs[i] - xs[i - 1]) * (xs[i - 1] - xs[i - 2]) < 0) reversals += 1;
  }
  assert.ok(reversals >= 7, `reversals ${reversals}`);
  assert.ok(points.every(([x, y]) => x >= -2 && x <= 102 && y >= 0 && y <= 100));
});

test("無 is twelve strokes in a 0–100 box", () => {
  assert.equal(wu.length, 12);
  for (const stroke of wu) {
    assert.ok(stroke.length >= 2);
    assert.ok(stroke.every(([x, y]) => x >= 0 && x <= 100 && y >= 0 && y <= 100));
  }
});
