import test from "node:test";
import assert from "node:assert/strict";
import { createContribution, MAX_CONTRIBUTION_POINTS } from "./contribution";
import type { Point } from "./pen";

const brush = { size: 8, seed: 31 };
const line: Point[] = [[10, 40], [80, 22], [140, 30], [200, 20]];

test("a completed contribution retains independent points, its outline, and source", () => {
  const reader = createContribution(line, "reader", brush);
  const pen = createContribution(line, "pen", brush);
  assert.ok(reader && pen);
  assert.equal(reader.d, pen.d);
  assert.equal(reader.source, "reader");
  assert.equal(pen.source, "pen");
  assert.deepEqual(reader.points, line);
  assert.notEqual(reader.points[0], line[0]);
  assert.notEqual(createContribution([[10, 40], [80, 65], [140, 12], [200, 20]], "reader", brush)?.d, reader.d);
});

test("the viewBox contains the exact finished outline with room for the brush", () => {
  const contribution = createContribution(line, "reader", brush);
  assert.ok(contribution);
  const values = contribution.d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const { x, y, width, height } = contribution.bounds;
  for (let index = 0; index < values.length; index += 2) {
    assert.ok(values[index] >= x && values[index] <= x + width);
    assert.ok(values[index + 1] >= y && values[index + 1] <= y + height);
  }
});

test("long gestures have bounded retained and rendered geometry", () => {
  const points = Array.from({ length: 4096 }, (_, index): Point => [index % 2 ? 2000 : 0, index]);
  const contribution = createContribution(points, "reader", brush);
  assert.ok(contribution);
  assert.equal(contribution.points.length, MAX_CONTRIBUTION_POINTS);
  assert.deepEqual(contribution.points[0], points[0]);
  assert.deepEqual(contribution.points[contribution.points.length - 1], points[points.length - 1]);
  assert.ok(contribution.d.length < 100_000);
});

test("missing, non-finite, and zero-size input cannot produce a contribution", () => {
  assert.equal(createContribution([], "reader", brush), null);
  assert.equal(createContribution([[1, 2]], "reader", brush), null);
  assert.equal(createContribution([[NaN, 2], [1, Infinity]], "reader", brush), null);
  assert.equal(createContribution(line, "reader", { ...brush, size: 0 }), null);
});
