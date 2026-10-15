import test from "node:test";
import assert from "node:assert/strict";
import { fit, loop, scribble, underline } from "./pen";

const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

const pairs = (d: string) => {
  const n = numbers(d);
  const out: Array<[number, number]> = [];
  for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i], n[i + 1]]);
  return out;
};

test("every stroke is deterministic for a seed and varies across seeds", () => {
  for (const make of [
    (seed: number) => scribble({ seed }),
    (seed: number) => loop({ seed }),
    (seed: number) => underline({ seed }),
  ]) {
    assert.equal(make(7), make(7));
    assert.notEqual(make(7), make(8));
  }
});

test("every stroke is a single path with finite coordinates", () => {
  for (const d of [scribble({ seed: 1 }), loop({ seed: 1 }), underline({ seed: 1 })]) {
    assert.match(d, /^M /);
    assert.equal((d.match(/M/g) ?? []).length, 1);
    assert.ok(numbers(d).every(Number.isFinite));
  }
});

test("scribble stays inside its box with a small overdraw margin", () => {
  for (const [x, y] of pairs(scribble({ seed: 3, passes: 5 }))) {
    assert.ok(x >= -6 && x <= 106, `x ${x}`);
    assert.ok(y >= -6 && y <= 106, `y ${y}`);
  }
});

test("scribble density grows with passes", () => {
  assert.ok(scribble({ seed: 2, passes: 6 }).length > scribble({ seed: 2, passes: 2 }).length);
});

test("loop closes past a full turn so the circle reads as drawn by hand", () => {
  const pts = pairs(loop({ seed: 5, overshoot: 0.15 }));
  const angles = pts.map(([x, y]) => Math.atan2(y - 50, x - 50));
  let swept = 0;
  for (let i = 1; i < angles.length; i += 1) {
    let delta = angles[i] - angles[i - 1];
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    swept += delta;
  }
  assert.ok(Math.abs(swept) > 2 * Math.PI, `swept ${swept}`);
});

test("a vertical scribble travels down the column instead of across it", () => {
  const ys = pairs(scribble({ seed: 9, passes: 1, axis: "y" })).map(([, y]) => y);
  assert.ok(ys[0] < 10);
  assert.ok(ys[ys.length - 1] > 90);
});

test("fit maps the 0–100 box onto real pixels, x by width and y by height", () => {
  assert.equal(fit("M 0 0 Q 50 50 100 100 L 10 90", 400, 20), "M 0 0 Q 200 10 400 20 L 40 18");
  assert.equal(fit("M -1 50 L 101 50", 200, 10), "M -2 5 L 202 5");
});
