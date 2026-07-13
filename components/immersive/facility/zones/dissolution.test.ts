import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";

process.env.NODE_PATH = path.resolve(process.cwd(), "node_modules");
const nodeModule = require("node:module") as {
  readonly Module: { _initPaths(): void };
};
nodeModule.Module._initPaths();
const {
  dissolutionStateAt,
  inkDepthAt,
  sampleInkSurface,
} = require("./dissolution") as typeof import("./dissolution");

function variance(values: readonly number[]): number {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return (
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    values.length
  );
}

describe("Splash Ink dissolution surface", () => {
  it("samples the same coherent surface for identical inputs", () => {
    const first = sampleInkSurface(41, 160);
    const second = sampleInkSurface(41, 160);

    assert.deepEqual(second, first);
    assert.equal(first.length, 160);
    assert.ok(Object.isFrozen(first));
    assert.ok(first.every((point) => Object.isFrozen(point)));
  });

  it("keeps samples on the authored depth field rather than in a volume", () => {
    const samples = sampleInkSurface(17, 220);

    assert.ok(
      samples.every(
        (point) =>
          Math.abs(point.z - inkDepthAt(point.x, point.y, 17)) < 1e-9,
      ),
    );
    assert.ok(samples.every((point) => Math.abs(point.x) <= 6.6));
    assert.ok(samples.every((point) => Math.abs(point.y) <= 4.1));
    assert.ok(samples.every((point) => Math.abs(point.z) <= 3.4));
  });

  it("has meaningful planar and depth variance without uniform scatter", () => {
    const samples = sampleInkSurface(5, 180);
    const xVariance = variance(samples.map((point) => point.x));
    const yVariance = variance(samples.map((point) => point.y));
    const zVariance = variance(samples.map((point) => point.z));

    assert.ok(xVariance > 6);
    assert.ok(yVariance > 2);
    assert.ok(zVariance > 0.15);
    assert.ok(zVariance < xVariance);
    assert.ok(zVariance < yVariance);
  });

  it("honors constrained construction budgets", () => {
    assert.equal(sampleInkSurface(3, 0).length, 0);
    assert.equal(sampleInkSurface(3, 72).length, 72);
    assert.equal(sampleInkSurface(3, 120).length, 120);
    assert.equal(sampleInkSurface(3, Number.POSITIVE_INFINITY).length, 0);
  });

  it("transforms a flat aperture into the sampled depth surface", () => {
    const surface = sampleInkSurface(23, 96);
    const flat = dissolutionStateAt(0, surface);
    const depth = dissolutionStateAt(0.5, surface);
    const spatial = dissolutionStateAt(1, surface);

    assert.ok(flat.points.every((point) => point.z === 0));
    assert.ok(depth.points.some((point) => Math.abs(point.z) > 0.05));
    assert.deepEqual(
      spatial.points,
      surface.map((point) => ({ x: point.x, y: point.y, z: point.z })),
    );
    assert.equal(flat.apertureProgress, 0);
    assert.equal(spatial.apertureProgress, 1);
  });

  it("clamps and reconstructs every exact state in reverse", () => {
    const surface = sampleInkSurface(7, 48);
    assert.deepEqual(
      dissolutionStateAt(-1, surface),
      dissolutionStateAt(0, surface),
    );
    assert.deepEqual(
      dissolutionStateAt(2, surface),
      dissolutionStateAt(1, surface),
    );

    const forward = [0.12, 0.38, 0.71, 1].map((progress) =>
      dissolutionStateAt(progress, surface),
    );
    const reverse = [1, 0.71, 0.38, 0.12]
      .map((progress) => dissolutionStateAt(progress, surface))
      .reverse();
    assert.deepEqual(reverse, forward);
  });
});
