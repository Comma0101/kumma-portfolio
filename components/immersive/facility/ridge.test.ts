import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import type * as ThreeTypes from "three";

process.env.NODE_PATH = path.resolve(process.cwd(), "node_modules");
const nodeModule = require("node:module") as {
  readonly Module: { _initPaths(): void };
};
nodeModule.Module._initPaths();
const THREE = require("three") as typeof ThreeTypes;
const { createRidgeGeometry } = require("./shanshuiPrimitives") as typeof import("./shanshuiPrimitives");

describe("ridge geometry", () => {
  it("builds a deterministic jagged crest that collapses at the ends", () => {
    const ridge = createRidgeGeometry({ seed: 1979 });
    const again = createRidgeGeometry({ seed: 1979 });
    const positions = ridge.getAttribute("position");
    const mirror = again.getAttribute("position");
    assert.equal(positions.count, mirror.count);
    for (let i = 0; i < positions.count; i += 1) {
      assert.equal(positions.getY(i), mirror.getY(i));
    }
    assert.ok(positions.count > 200, "ridge needs enough crest segments to read as a profile");

    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < positions.count; i += 1) {
      const y = positions.getY(i);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    assert.equal(minY, 0);
    assert.ok(maxY > 0.5 && maxY <= 1, `crest peak ${maxY} should be normalized within (0.5, 1]`);
    const different = createRidgeGeometry({ seed: 2018 });
    assert.notDeepEqual(
      Array.from(different.getAttribute("position").array.slice(0, 30)),
      Array.from(positions.array.slice(0, 30)),
    );
    ridge.dispose();
    again.dispose();
    different.dispose();
  });
});
