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
const {
  PAPER_GRAIN_SIZE,
  createPaperGrainData,
  disposePaperGrainTexture,
  getPaperGrainTexture,
  paperGrainValue,
} = require("./paperGrain") as typeof import("./paperGrain");

describe("paper grain", () => {
  it("is deterministic and bounded", () => {
    for (const [x, y] of [[0, 0], [17, 231], [255, 255], [128, 64]] as const) {
      const a = paperGrainValue(x, y);
      const b = paperGrainValue(x, y);
      assert.equal(a, b);
      assert.ok(a >= 0 && a <= 1, `grain ${a} out of range at ${x},${y}`);
    }
  });

  it("is continuous across the tile seam", () => {
    for (const y of [0, 37, 128, 255]) {
      assert.equal(paperGrainValue(0, y), paperGrainValue(PAPER_GRAIN_SIZE, y));
    }
    for (const x of [0, 53, 200, 255]) {
      assert.equal(paperGrainValue(x, 0), paperGrainValue(x, PAPER_GRAIN_SIZE));
    }
  });

  it("builds a mid-valued repeating RedFormat texture, cached as a singleton", () => {
    const data = createPaperGrainData();
    assert.equal(data.length, PAPER_GRAIN_SIZE * PAPER_GRAIN_SIZE);
    let sum = 0;
    for (const byte of data) sum += byte;
    const mean = sum / data.length / 255;
    assert.ok(mean > 0.3 && mean < 0.7, `grain mean ${mean} should be mid-valued`);

    const first = getPaperGrainTexture();
    const second = getPaperGrainTexture();
    assert.equal(first, second);
    assert.equal(first.format, THREE.RedFormat);
    assert.equal(first.wrapS, THREE.RepeatWrapping);
    assert.equal(first.wrapT, THREE.RepeatWrapping);
    disposePaperGrainTexture();
    const third = getPaperGrainTexture();
    assert.notEqual(third, first);
    disposePaperGrainTexture();
  });
});
