import assert from "node:assert/strict";
import { describe, it } from "node:test";

const {
  CUN_FIELD_GLSL,
  CUN_PRESETS,
  cunDeposit,
} = require("./strokeFields") as typeof import("./strokeFields");

describe("cun stroke fields", () => {
  it("defines the three classical presets with distinct characters", () => {
    assert.deepEqual(Object.keys(CUN_PRESETS).sort(), ["axe", "hemp", "raindrop"]);
    assert.ok(CUN_PRESETS.raindrop.scale > CUN_PRESETS.axe.scale);
    assert.ok(CUN_PRESETS.axe.scale > CUN_PRESETS.hemp.scale);
    assert.equal(CUN_PRESETS.raindrop.directionality, 0);
    assert.equal(CUN_PRESETS.hemp.directionality, 1);
    for (const preset of Object.values(CUN_PRESETS)) {
      assert.ok(preset.threshold > 0 && preset.threshold < 1);
      assert.ok(preset.stretch >= 1);
    }
  });

  it("is deterministic and bounded", () => {
    for (const preset of ["hemp", "axe", "raindrop"] as const) {
      const a = cunDeposit(3.25, -7.5, 0.6, 1.1, preset);
      const b = cunDeposit(3.25, -7.5, 0.6, 1.1, preset);
      assert.equal(a, b);
      assert.ok(a >= 0 && a <= 1);
    }
  });

  it("deposits more ink on steeper slopes", () => {
    const flat = cunDeposit(5, 5, 0.05, 0.3, "hemp");
    const steep = cunDeposit(5, 5, 0.9, 0.3, "hemp");
    assert.ok(steep >= flat);
  });

  it("exports a self-contained GLSL twin", () => {
    assert.match(CUN_FIELD_GLSL, /float cunDeposit\(vec2 p, float slope, float aspect, float scale, float directionality, float threshold, float stretch\)/);
    assert.match(CUN_FIELD_GLSL, /cunFbm/);
    assert.match(CUN_FIELD_GLSL, /cunHash/);
    assert.doesNotMatch(CUN_FIELD_GLSL, /Math\.random/);
  });
});
