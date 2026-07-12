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
      groupBudgets: {
        beacons: 14,
        signals: 84,
        voice: 18,
        document: 24,
        orchestration: 30,
        splats: 180,
        measurement: 54,
      },
      noiseOctaves: 4,
      pixelRatio: 1.5,
      profile: "desktop",
      quality: "full",
      segmentX: 200,
      segmentZ: 160,
    });
  });

  it("uses balanced budgets on constrained desktop hardware", () => {
    const tuning = getThreeSceneTuning({
      deviceMemory: 4,
      devicePixelRatio: 2,
      hardwareConcurrency: 4,
      isCoarsePointer: false,
      reducedMotion: false,
      viewportWidth: 1280,
    });

    assert.deepEqual(tuning, {
      antialias: false,
      groupBudgets: {
        beacons: 9,
        signals: 48,
        voice: 12,
        document: 16,
        orchestration: 20,
        splats: 96,
        measurement: 36,
      },
      noiseOctaves: 3,
      pixelRatio: 1,
      profile: "constrained",
      quality: "balanced",
      segmentX: 120,
      segmentZ: 96,
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
      groupBudgets: {
        beacons: 6,
        signals: 30,
        voice: 9,
        document: 12,
        orchestration: 14,
        splats: 64,
        measurement: 24,
      },
      noiseOctaves: 2,
      pixelRatio: 1,
      profile: "mobile",
      quality: "minimal",
      segmentX: 72,
      segmentZ: 56,
    });
  });

  it("keeps reduced motion static on small viewports", () => {
    const tuning = getThreeSceneTuning({
      deviceMemory: 8,
      devicePixelRatio: 3,
      hardwareConcurrency: 8,
      isCoarsePointer: false,
      reducedMotion: true,
      viewportWidth: 390,
    });

    assert.deepEqual(tuning, {
      antialias: false,
      groupBudgets: {
        beacons: 5,
        signals: 24,
        voice: 7,
        document: 9,
        orchestration: 11,
        splats: 48,
        measurement: 18,
      },
      noiseOctaves: 2,
      pixelRatio: 1,
      profile: "reduced",
      quality: "static",
      segmentX: 56,
      segmentZ: 44,
    });
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
      groupBudgets: {
        beacons: 5,
        signals: 24,
        voice: 7,
        document: 9,
        orchestration: 11,
        splats: 48,
        measurement: 18,
      },
      noiseOctaves: 2,
      pixelRatio: 1,
      profile: "reduced",
      quality: "static",
      segmentX: 56,
      segmentZ: 44,
    });
  });

  it("keeps every reduced/static construction bound at or below mobile", () => {
    const mobile = getThreeSceneTuning({
      deviceMemory: 8,
      devicePixelRatio: 2,
      hardwareConcurrency: 8,
      isCoarsePointer: true,
      reducedMotion: false,
      viewportWidth: 390,
    });
    const reduced = getThreeSceneTuning({
      deviceMemory: 8,
      devicePixelRatio: 2,
      hardwareConcurrency: 8,
      isCoarsePointer: true,
      reducedMotion: true,
      viewportWidth: 390,
    });

    for (const key of Object.keys(mobile.groupBudgets) as Array<
      keyof typeof mobile.groupBudgets
    >) {
      assert.ok(reduced.groupBudgets[key] <= mobile.groupBudgets[key]);
    }
    assert.ok(reduced.segmentX <= mobile.segmentX);
    assert.ok(reduced.segmentZ <= mobile.segmentZ);
    assert.ok(reduced.noiseOctaves <= mobile.noiseOctaves);
  });

  it("normalizes invalid browser device hints without producing invalid tuning", () => {
    const tuning = getThreeSceneTuning({
      deviceMemory: Number.NaN,
      devicePixelRatio: Number.NaN,
      hardwareConcurrency: -4,
      isCoarsePointer: false,
      reducedMotion: false,
      viewportWidth: Number.NaN,
    });

    assert.equal(tuning.profile, "desktop");
    assert.equal(tuning.pixelRatio, 1);
    assert.equal(tuning.quality, "full");
    assert.ok(Object.values(tuning.groupBudgets).every(Number.isInteger));
    assert.ok(Object.values(tuning.groupBudgets).every((count) => count > 0));
  });
});
