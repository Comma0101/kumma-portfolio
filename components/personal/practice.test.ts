import test from "node:test";
import assert from "node:assert/strict";
import { practiceStrokes, wander, SHEET } from "./practice";

test("practice is deterministic for a seed", () => {
  assert.deepEqual(
    practiceStrokes(3).map((s) => s.points),
    practiceStrokes(3).map((s) => s.points),
  );
});

test("the hand steadies: late strokes wander less and agree in length", () => {
  for (const seed of [1, 2, 3, 9, 27]) {
    const strokes = practiceStrokes(seed);
    const early = strokes.slice(0, 4);
    const late = strokes.slice(-4);
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    assert.ok(mean(late.map((s) => wander(s.points))) < mean(early.map((s) => wander(s.points))), `seed ${seed}`);
    const lengths = (ss: typeof strokes) => ss.map((s) => s.points[s.points.length - 1][1] - s.points[0][1]);
    const spread = (xs: number[]) => Math.max(...xs) - Math.min(...xs);
    assert.ok(spread(lengths(late)) <= spread(lengths(early)) + 1e-9, `seed ${seed} lengths`);
    assert.ok(strokes[strokes.length - 1].skill === 1 && strokes[0].skill === 0);
  }
});

test("every stroke stays on the sheet", () => {
  for (let seed = 1; seed < 40; seed += 1) {
    for (const { points } of practiceStrokes(seed)) {
      for (const [x, y] of points) {
        assert.ok(x > 0 && x < SHEET.width && y > 0 && y < SHEET.height, `seed ${seed}: ${x},${y}`);
      }
    }
  }
});
