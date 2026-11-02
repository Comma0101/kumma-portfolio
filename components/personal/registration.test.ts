import test from "node:test";
import assert from "node:assert/strict";
import { bisect, between } from "./registration";

test("bisect finds the axis value whose width matches the target", () => {
  const width = (wdth: number) => 400 + wdth * 4; // monotonic, like a width axis
  const wdth = bisect(width, 860, 62, 125);
  assert.ok(Math.abs(width(wdth) - 860) < 1, `${wdth}`);
});

test("bisect clamps to the axis when the target is out of reach", () => {
  assert.equal(bisect((w) => w, 1000, 62, 125), 125);
  assert.equal(bisect((w) => w, 10, 62, 125), 62);
});

test("between interpolates a weight → width table", () => {
  const table: Array<[number, number]> = [[100, 118], [460, 108], [820, 100]];
  assert.equal(between(table, 100), 118);
  assert.equal(between(table, 820), 100);
  assert.equal(between(table, 280), 113);
  assert.equal(between(table, 50), 118);
});
