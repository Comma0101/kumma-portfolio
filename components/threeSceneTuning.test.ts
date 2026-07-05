import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getThreeSceneTuning } from "./threeSceneTuning";

describe("getThreeSceneTuning", () => {
  it("keeps desktop at full terrain quality", () => {
    const tuning = getThreeSceneTuning({
      devicePixelRatio: 2,
      hardwareConcurrency: 12,
      isCoarsePointer: false,
      reducedMotion: false,
      viewportWidth: 1440,
    });

    assert.deepEqual(tuning, {
      antialias: true,
      noiseOctaves: 4,
      pixelRatio: 1.5,
      profile: "desktop",
      segmentX: 200,
      segmentZ: 160,
    });
  });

  it("uses a smaller mobile profile on coarse-pointer devices", () => {
    const tuning = getThreeSceneTuning({
      deviceMemory: 8,
      devicePixelRatio: 3,
      hardwareConcurrency: 8,
      isCoarsePointer: true,
      reducedMotion: false,
      viewportWidth: 390,
    });

    assert.deepEqual(tuning, {
      antialias: false,
      noiseOctaves: 2,
      pixelRatio: 1,
      profile: "mobile",
      segmentX: 72,
      segmentZ: 56,
    });
  });

  it("keeps the mobile profile ahead of reduced motion on small viewports", () => {
    const tuning = getThreeSceneTuning({
      deviceMemory: 8,
      devicePixelRatio: 3,
      hardwareConcurrency: 8,
      isCoarsePointer: false,
      reducedMotion: true,
      viewportWidth: 390,
    });

    assert.equal(tuning.profile, "mobile");
    assert.equal(tuning.noiseOctaves, 2);
    assert.equal(tuning.pixelRatio, 1);
  });

  it("uses a static reduced-motion profile without desktop-density geometry", () => {
    const tuning = getThreeSceneTuning({
      devicePixelRatio: 2,
      hardwareConcurrency: 12,
      isCoarsePointer: false,
      reducedMotion: true,
      viewportWidth: 1440,
    });

    assert.deepEqual(tuning, {
      antialias: false,
      noiseOctaves: 3,
      pixelRatio: 1,
      profile: "reduced",
      segmentX: 120,
      segmentZ: 96,
    });
  });
});
