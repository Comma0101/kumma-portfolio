import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getThreeSceneTuning,
  isSoftwareRendererLabel,
} from "./threeSceneTuning";

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
      facilityBudgets: {
        terrainSegments: 32000,
        ribs: 36,
        slabs: 28,
        bridges: 18,
        depthSamples: 320,
        calibrationMarks: 36,
        drawCallTarget: 45,
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
      facilityBudgets: {
        terrainSegments: 11520,
        ribs: 28,
        slabs: 20,
        bridges: 14,
        depthSamples: 220,
        calibrationMarks: 28,
        drawCallTarget: 32,
      },
      noiseOctaves: 3,
      pixelRatio: 1,
      profile: "constrained",
      quality: "balanced",
      segmentX: 120,
      segmentZ: 96,
    });
  });

  it("recognizes common software WebGL rasterizers without misclassifying GPUs", () => {
    assert.equal(
      isSoftwareRendererLabel(
        "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)))",
      ),
      true,
    );
    assert.equal(isSoftwareRendererLabel("llvmpipe (LLVM 18.1.8)"), true);
    assert.equal(isSoftwareRendererLabel("Mesa Softpipe"), true);
    assert.equal(
      isSoftwareRendererLabel("ANGLE (NVIDIA GeForce RTX 4080 Direct3D11)"),
      false,
    );
    assert.equal(isSoftwareRendererLabel(undefined), false);
  });

  it("uses balanced budgets when a desktop browser is software-rendered", () => {
    const tuning = getThreeSceneTuning({
      deviceMemory: 16,
      devicePixelRatio: 2,
      hardwareConcurrency: 16,
      isCoarsePointer: false,
      isSoftwareRenderer: true,
      reducedMotion: false,
      viewportWidth: 1440,
    });

    assert.equal(tuning.profile, "constrained");
    assert.equal(tuning.quality, "balanced");
    assert.equal(tuning.pixelRatio, 1);
    assert.equal(tuning.facilityBudgets.drawCallTarget, 32);
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
      facilityBudgets: {
        terrainSegments: 4032,
        ribs: 18,
        slabs: 14,
        bridges: 10,
        depthSamples: 120,
        calibrationMarks: 18,
        drawCallTarget: 22,
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
      facilityBudgets: {
        terrainSegments: 2464,
        ribs: 12,
        slabs: 10,
        bridges: 7,
        depthSamples: 72,
        calibrationMarks: 12,
        drawCallTarget: 20,
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
      facilityBudgets: {
        terrainSegments: 2464,
        ribs: 12,
        slabs: 10,
        bridges: 7,
        depthSamples: 72,
        calibrationMarks: 12,
        drawCallTarget: 20,
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

    for (const key of Object.keys(mobile.facilityBudgets) as Array<
      keyof typeof mobile.facilityBudgets
    >) {
      assert.ok(reduced.facilityBudgets[key] <= mobile.facilityBudgets[key]);
    }
    assert.ok(reduced.segmentX <= mobile.segmentX);
    assert.ok(reduced.segmentZ <= mobile.segmentZ);
    assert.ok(reduced.noiseOctaves <= mobile.noiseOctaves);
  });

  it("decreases every facility construction budget by quality profile", () => {
    const inputs = [
      { deviceMemory: 8, hardwareConcurrency: 12, isCoarsePointer: false, reducedMotion: false, viewportWidth: 1440 },
      { deviceMemory: 4, hardwareConcurrency: 4, isCoarsePointer: false, reducedMotion: false, viewportWidth: 1280 },
      { deviceMemory: 8, hardwareConcurrency: 8, isCoarsePointer: true, reducedMotion: false, viewportWidth: 390 },
      { deviceMemory: 8, hardwareConcurrency: 8, isCoarsePointer: true, reducedMotion: true, viewportWidth: 390 },
    ].map((input) => getThreeSceneTuning({ ...input, devicePixelRatio: 2 }));

    for (let profileIndex = 1; profileIndex < inputs.length; profileIndex += 1) {
      const previous = inputs[profileIndex - 1].facilityBudgets;
      const current = inputs[profileIndex].facilityBudgets;
      for (const key of Object.keys(previous) as Array<keyof typeof previous>) {
        assert.ok(current[key] <= previous[key], `${String(key)} must not increase`);
        assert.ok(Number.isInteger(current[key]) && current[key] > 0);
      }
    }
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
    assert.ok(Object.values(tuning.facilityBudgets).every(Number.isInteger));
    assert.ok(
      Object.values(tuning.facilityBudgets).every((count) => count > 0),
    );
  });
});
