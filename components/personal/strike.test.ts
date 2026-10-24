import test from "node:test";
import assert from "node:assert/strict";
import { crossesOut } from "./strike";

const word = { x: 100, y: 200, width: 200, height: 120 };
const line = (y0: number, y1: number, x0 = 90, x1 = 310) =>
  Array.from({ length: 12 }, (_, i) => [x0 + ((x1 - x0) * i) / 11, y0 + ((y1 - y0) * i) / 11] as [number, number]);

test("a line through the middle of the word strikes it", () => {
  assert.ok(crossesOut(line(262, 255), word));
});

test("an underline, a line above, or a short dash does not", () => {
  assert.ok(!crossesOut(line(335, 335), word), "under");
  assert.ok(!crossesOut(line(190, 192), word), "above");
  assert.ok(!crossesOut(line(260, 260, 120, 200), word), "too short");
});

test("a scribble that wanders above and below does not", () => {
  const zigzag = Array.from({ length: 20 }, (_, i) => [100 + i * 10, i % 2 ? 150 : 360] as [number, number]);
  assert.ok(!crossesOut(zigzag, word));
});
