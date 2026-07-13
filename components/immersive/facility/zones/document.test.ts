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
const { documentStateAt } = require("./document") as typeof import("./document");

function allFinite(state: ReturnType<typeof documentStateAt>): boolean {
  return state.segments.every((segment) =>
    Object.values(segment).every(
      (value) => typeof value !== "number" || Number.isFinite(value),
    ),
  );
}

describe("Audiobook document foundry state", () => {
  it("starts as one intact source and ends as one continuous output band", () => {
    const source = documentStateAt(0, 12);
    const output = documentStateAt(1, 12);

    assert.ok(source.segments.every((segment) => segment.phase === "source"));
    assert.ok(source.segments.every((segment) => segment.z === source.segments[0].z));
    assert.ok(output.segments.every((segment) => segment.phase === "output"));
    assert.ok(output.segments.every((segment) => segment.z === output.segments[0].z));

    const outputX = output.segments.map((segment) => segment.x);
    for (let index = 1; index < outputX.length; index += 1) {
      assert.ok(outputX[index] > outputX[index - 1]);
      assert.ok(outputX[index] - outputX[index - 1] <= 0.72);
    }
    assert.equal(output.outputProgress, 1);
    assert.ok(output.segments.every((segment) => segment.y >= 8.5));
  });

  it("separates into ordered bounded queue lanes", () => {
    const segmented = documentStateAt(0.32, 12);
    const queued = documentStateAt(0.58, 12);

    assert.ok(new Set(segmented.segments.map((segment) => segment.z)).size > 3);
    assert.deepEqual(
      [...new Set(queued.segments.map((segment) => segment.lane))].sort(),
      [0, 1, 2],
    );
    assert.ok(queued.segments.every((segment) => Math.abs(segment.x) <= 4.8));
    const queueHeights = queued.segments.map((segment) => segment.y);
    assert.ok(Math.min(...queueHeights) >= 3.2);
    assert.ok(Math.max(...queueHeights) - Math.min(...queueHeights) >= 1.5);
    for (const lane of [0, 1, 2]) {
      const laneDepths = queued.segments
        .filter((segment) => segment.lane === lane)
        .map((segment) => segment.z);
      for (let index = 1; index < laneDepths.length; index += 1) {
        assert.ok(laneDepths[index] < laneDepths[index - 1]);
      }
    }
  });

  it("recovers one stale lane without random motion", () => {
    const stale = documentStateAt(0.58, 12);
    const recovered = documentStateAt(0.78, 12);
    const staleSegments = stale.segments.filter((segment) => segment.recovering);

    assert.ok(staleSegments.length > 0);
    assert.ok(staleSegments.every((segment) => segment.lane === 1));
    assert.ok(recovered.staleLaneProgress > stale.staleLaneProgress);
    assert.ok(
      recovered.segments
        .filter((segment) => segment.lane === 1)
        .every((segment) => segment.recovering === false),
    );
  });

  it("clamps, stays finite, and returns exact states in reverse", () => {
    assert.deepEqual(documentStateAt(-1, 8), documentStateAt(0, 8));
    assert.deepEqual(documentStateAt(2, 8), documentStateAt(1, 8));
    assert.ok(allFinite(documentStateAt(0.47, 8)));

    const forward = [0.2, 0.46, 0.73, 1].map((progress) =>
      documentStateAt(progress, 10),
    );
    const reverse = [1, 0.73, 0.46, 0.2]
      .map((progress) => documentStateAt(progress, 10))
      .reverse();
    assert.deepEqual(reverse, forward);
  });

  it("returns immutable state and honors construction budgets", () => {
    const state = documentStateAt(0.5, 7);
    assert.equal(state.segments.length, 7);
    assert.ok(Object.isFrozen(state));
    assert.ok(Object.isFrozen(state.segments));
    assert.ok(state.segments.every((segment) => Object.isFrozen(segment)));
    assert.ok(state.segments.every((segment) => segment instanceof Object));
    assert.ok(THREE.MathUtils.clamp(state.outputProgress, 0, 1) === state.outputProgress);
  });
});
