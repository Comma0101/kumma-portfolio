import test from "node:test";
import assert from "node:assert/strict";
import { arcAtTip, chunksOf, marginSpans, scrolledArc, slice, within } from "./thread";
import type { Point } from "./pen";

// A thread down the margin with a horizontal detour in the second chunk.
const points: Point[] = [
  [0, 0],
  [0, 100],
  [0, 200],
  [100, 200],
  [0, 210],
  [0, 300],
];

test("chunks split the thread by arc length and record the height each covers", () => {
  const chunks = chunksOf(points, [2, 5]);
  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].from, 0);
  assert.equal(chunks[1].to, 1);
  assert.ok(Math.abs(chunks[0].to - chunks[1].from) < 1e-9);
  assert.deepEqual([chunks[0].top, chunks[0].bottom], [0, 200]);
  assert.deepEqual([chunks[1].top, chunks[1].bottom], [200, 300]);
  // The detour is long, so the second chunk holds most of the line.
  assert.ok(chunks[1].to - chunks[1].from > chunks[0].to - chunks[0].from);
});

test("the drawn length follows the reading position, chunk by chunk", () => {
  const chunks = chunksOf(points, [2, 5]);
  const even = [0, 1]; // linear pacing for the test
  assert.equal(arcAtTip(chunks, even, -50), 0);
  assert.ok(Math.abs(arcAtTip(chunks, even, 100) - chunks[0].to / 2) < 1e-9);
  assert.ok(Math.abs(arcAtTip(chunks, even, 200) - chunks[0].to) < 1e-9);
  assert.equal(arcAtTip(chunks, even, 999), 1);
});

test("the drawn length never goes backwards as the reader moves down", () => {
  const chunks = chunksOf(points, [2, 5]);
  const pacing = [0, 0.1, 0.5, 0.6, 1];
  let last = 0;
  for (let tip = -20; tip <= 320; tip += 7) {
    const arc = arcAtTip(chunks, pacing, tip);
    assert.ok(arc >= last - 1e-9, `${tip}: ${arc} < ${last}`);
    last = arc;
  }
});

test("a chunk with no height (a pure detour) is drawn as soon as it is reached", () => {
  const flat: Point[] = [[0, 0], [0, 100], [80, 100], [160, 100]];
  const chunks = chunksOf(flat, [1, 3]);
  assert.equal(arcAtTip(chunks, [0, 1], 100), 1);
});

test("slice cuts the stroke's own samples to a chunk, overlapping its neighbours by a point", () => {
  const line: Point[] = [[0, 0], [0, 10], [0, 20], [0, 30], [0, 40]];
  assert.deepEqual(slice(line, 0, 0.5), [[0, 0], [0, 10], [0, 20], [0, 30]]);
  assert.deepEqual(slice(line, 0.5, 1), [[0, 10], [0, 20], [0, 30], [0, 40]]);
});

test("progress inside a chunk: before it 0, after it 1, linear across it", () => {
  const chunk = { from: 0.2, to: 0.6, top: 0, bottom: 1 };
  assert.equal(within(chunk, 0.1), 0);
  assert.ok(Math.abs(within(chunk, 0.4) - 0.5) < 1e-9);
  assert.equal(within(chunk, 0.9), 1);
});

test("scroll never draws the opening: that is the opening's own timed beat", () => {
  const chunks = chunksOf(points, [2, 5]);
  const even = [0, 1];
  // Reading line inside the first chunk: nothing drawn by scroll.
  assert.equal(scrolledArc(chunks, even, 150), 0);
  // Past it, scroll takes over from the second chunk.
  assert.ok(scrolledArc(chunks, even, 250) > chunks[1].from);
  assert.equal(scrolledArc(chunks, even, 999), 1);
});

test("margin spans: where the line runs down the margin, small detours merged", () => {
  const line: [number, number][] = [
    [30, 0], [30, 40], [30, 80], [30, 100], // margin
    [32, 110], [90, 118], [31, 126], // a tally barb out and back
    [30, 160], [30, 200], // margin
    [300, 220], [300, 600], [30, 640], // a detour across the page
    [30, 680], [30, 720], [30, 760], [30, 800],
  ];
  assert.deepEqual(marginSpans(line, 30), [[0, 200], [640, 800]]);
  assert.deepEqual(marginSpans([], 30), []);
});
