import test from "node:test";
import assert from "node:assert/strict";
import { climb, coil, corner, fitPoints, handLine, loop, scribble, steps, underline, type Point } from "./pen";
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

test("the staircase: long flat treads forward, short steep risers back, and it arrives", () => {
  const points = steps({ seed: 6, cycles: 4 });
  const xs = points.map(([x]) => x);
  assert.ok(xs[0] <= 1);
  assert.ok(xs[xs.length - 1] >= 99);
  const forward: number[] = [];
  const back: Array<{ dx: number; dy: number }> = [];
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    if (dx > 0 && Math.abs(dy) < 3) forward.push(dx);
    if (dx < 0) back.push({ dx: -dx, dy });
  }
  assert.ok(back.length >= 4, `back ${back.length}`);
  const tread = forward.reduce((a, b) => a + b, 0) / forward.length;
  for (const riser of back) {
    assert.ok(riser.dx < tread, "a step back is shorter than a step forward");
    assert.ok(riser.dy > riser.dx * 0.6, "and steeper");
  }
  assert.ok(points.every(([x, y]) => x >= -2 && x <= 102 && y >= 0 && y <= 100));
});

test("an open loop leaves its gap where it is told to face", () => {
  const facing = 0; // right
  const points = loop({ seed: 4, overshoot: -0.2, facing });
  const angles = points.map(([x, y]) => Math.atan2(y - 50, x - 50));
  // No drawn point falls within the gap around the facing direction.
  assert.ok(angles.every((a) => Math.abs(a - facing) > 0.45), "gap faces right");
});

test("price climbs: jagged, mostly upward, ending higher than it starts", () => {
  const points = climb({ seed: 3 });
  assert.ok(points.length > 20);
  assert.ok(points[points.length - 1][1] < points[0][1] - 30);
  let downs = 0;
  for (let i = 1; i < points.length; i += 1) if (points[i][1] > points[i - 1][1]) downs += 1;
  assert.ok(downs >= 4, "it chops on the way up");
  for (let i = 1; i < points.length; i += 1) assert.ok(points[i][0] > points[i - 1][0]);
});

test("無 is twelve strokes in a 0–100 box", () => {
  assert.equal(wu.length, 12);
  for (const stroke of wu) {
    assert.ok(stroke.length >= 2);
    assert.ok(stroke.every(([x, y]) => x >= 0 && x <= 100 && y >= 0 && y <= 100));
  }
});

test("corner rounds the turn into a curve instead of a right angle", () => {
  const points: Point[] = [[0, 0], [50, 0], [100, 0]];
  const at = corner(points, [100, 100], 30);
  // Trimmed back before the corner, then curving round it.
  assert.ok(points[at][0] <= 70 + 1e-9 && points[at][1] === 0);
  const last = points[points.length - 1];
  assert.ok(last[1] > 0 && last[0] > 90);
  // No step in the curve turns sharply.
  const heading = (a: Point, b: Point) => Math.atan2(b[1] - a[1], b[0] - a[0]);
  for (let i = at + 1; i < points.length - 1; i += 1) {
    const d = heading(points[i], points[i + 1]) - heading(points[i - 1], points[i]);
    assert.ok(Math.abs(Math.atan2(Math.sin(d), Math.cos(d))) < 0.45);
  }
});

test("coil: loose loops along a line that pull straight as tension rises", () => {
  const from: Point = [0, 100];
  const to: Point = [600, 95];
  const loose = coil(from, to, { loops: 5, depth: 50, tension: 0 });
  const taut = coil(from, to, { loops: 5, depth: 50, tension: 1 });
  assert.deepEqual(loose[0], from);
  assert.deepEqual(loose[loose.length - 1], to);
  // Loose, it loops: the pen goes backward somewhere.
  assert.ok(loose.some((p, i) => i > 0 && p[0] < loose[i - 1][0]));
  // Taut, it is the straight line between the ends.
  for (const [x, y] of taut) assert.ok(Math.abs(y - (100 - (5 * x) / 600)) < 1e-6);
  // It only rises above the line (into the name), never below.
  for (const [x, y] of loose) assert.ok(y <= 100 - (5 * x) / 600 + 1e-6);
});
