import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { INK, ACCENTS, EARTHS, INK_LADDER, relativeLuminance } from "./inkLadder";

describe("inkLadder", () => {
  it("matches the approved palette", () => {
    assert.equal(INK.paper, "#f0ead9");
    assert.equal(INK.jiao, "#1c201a");
    assert.equal(INK.nong, "#2e332b");
    assert.equal(INK.zhong, "#47503f");
    assert.equal(INK.dan, "#75806a");
    assert.equal(INK.qing, "#a9b09a");
    assert.equal(ACCENTS.mineral, "#6d8a7a");
    assert.equal(ACCENTS.ochre, "#a98a5e");
    assert.equal(ACCENTS.cinnabar, "#9f4435");
  });

  it("ink ladder is five values, strictly monotone in luminance", () => {
    assert.equal(INK_LADDER.length, 5);
    const values = INK_LADDER.map(relativeLuminance);
    for (let i = 1; i < values.length; i += 1) {
      assert.ok(values[i] > values[i - 1], `not monotone at ${i}`);
    }
  });

  it("relativeLuminance bounds and ordering", () => {
    assert.equal(relativeLuminance("#000000"), 0);
    assert.equal(relativeLuminance("#ffffff"), 1);
    assert.ok(relativeLuminance(INK.paper) > relativeLuminance(INK.qing));
  });
});
