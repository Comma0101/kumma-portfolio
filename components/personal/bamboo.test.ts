import test from "node:test";
import assert from "node:assert/strict";
import { bamboo, bambooProfiles, PLATE } from "./bamboo";

test("bamboo is deterministic for a seed and a new stalk for another", () => {
  assert.deepEqual(bamboo(4), bamboo(4));
  assert.notDeepEqual(bamboo(4), bamboo(5));
});

test("painted in order: culm bottom to top, then nodes, branches, leaves", () => {
  for (const seed of [1, 2, 3, 40, 999]) {
    const strokes = bamboo(seed);
    const order = ["culm", "node", "branch", "leaf"];
    const kinds = strokes.map((s) => order.indexOf(s.kind));
    for (let i = 1; i < kinds.length; i += 1) assert.ok(kinds[i] >= kinds[i - 1], `seed ${seed}: ${strokes[i].kind} after ${strokes[i - 1].kind}`);
    const culm = strokes.filter((s) => s.kind === "culm");
    assert.equal(culm.length, 6);
    // Each joint is drawn upward and starts above the last one's end: a gap.
    for (let i = 0; i < culm.length; i += 1) {
      const [, y0] = culm[i].points[0];
      const [, y1] = culm[i].points[culm[i].points.length - 1];
      assert.ok(y1 < y0);
      if (i) assert.ok(y0 < culm[i - 1].points[culm[i - 1].points.length - 1][1]);
    }
    assert.equal(strokes.filter((s) => s.kind === "node").length, 5);
    assert.ok(strokes.filter((s) => s.kind === "leaf").length >= 6);
  }
});

test("the leaves stay on the plate", () => {
  for (let seed = 1; seed < 60; seed += 1) {
    for (const leaf of bamboo(seed).filter((s) => s.kind === "leaf")) {
      const [x] = leaf.points[leaf.points.length - 1];
      assert.ok(x > -10 && x < PLATE.width + 10, `seed ${seed}: leaf tip at ${x}`);
    }
  }
});

test("a leaf comes to a point; a joint presses into its node", () => {
  assert.ok(bambooProfiles.leaf(1) < 0.1);
  assert.equal(bambooProfiles.leaf(0.3), 1);
  assert.ok(bambooProfiles.culm(1) > bambooProfiles.culm(0.5));
});
