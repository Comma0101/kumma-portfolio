import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeTones, spiralPath, timeline } from "./spiral";

test("tones decode two 4-bit samples per byte", () => {
  // bytes 0x0f, 0xa3 -> samples 15, 0, 3, 10 (low nibble first)
  const b64 = Buffer.from([0x0f, 0xa3]).toString("base64");
  assert.deepEqual([...decodeTones(b64, 4)].map((v) => Math.round(v * 15)), [15, 0, 3, 10]);
  assert.equal(decodeTones(b64, 3).length, 3);
});

test("the spiral winds out from the centre at an even step", () => {
  const path = spiralPath({ turns: 36, radius: 196, step: 1.4 });
  const [x0, y0] = path[0];
  assert.ok(Math.hypot(x0, y0) < 1);
  const last = path[path.length - 1];
  assert.ok(Math.abs(Math.hypot(last[0], last[1]) - 196) < 3);
  for (let i = 400; i < path.length; i += 997) {
    const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    assert.ok(Math.abs(d - 1.4) < 0.15, `step ${d} at ${i}`);
  }
});

test("the pen lingers where the face is dark", () => {
  const tones = new Float32Array([0, 0, 1, 1]);
  const t = timeline(tones);
  assert.equal(t[0], 0);
  assert.equal(t[t.length - 1], 1);
  // Two light samples take less time than two dark ones.
  assert.ok(t[2] - t[0] < t[4] - t[2]);
});

test("the page's spiral has exactly one tone per point (generator and page agree)", async () => {
  const { portrait } = await import("./portrait");
  assert.equal(spiralPath(portrait).length, portrait.count);
  assert.equal(decodeTones(portrait.tones, portrait.count).length, portrait.count);
});
