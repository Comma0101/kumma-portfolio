import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  copySceneGroupWeights,
  createMutableSceneGroupWeights,
  dampSceneGroupWeights,
  journeyStateFor,
  motionScaleForTransition,
  sceneQualityFor,
  shouldRebuildSceneResources,
  shouldAnimateScene,
  shouldRenderScene,
} from "./sceneLifecycle";
import type { SceneGroupWeights } from "./types";

describe("immersive scene lifecycle policy", () => {
  it("animates only a ready, visible scene inside the journey", () => {
    assert.equal(
      shouldAnimateScene({
        hidden: false,
        inJourney: true,
        reducedMotion: false,
        webglReady: true,
      }),
      true,
    );
  });

  it("pauses while hidden, outside the journey, reduced, or unavailable", () => {
    const live = {
      hidden: false,
      inJourney: true,
      reducedMotion: false,
      webglReady: true,
    } as const;

    assert.equal(shouldAnimateScene({ ...live, hidden: true }), false);
    assert.equal(shouldAnimateScene({ ...live, inJourney: false }), false);
    assert.equal(shouldAnimateScene({ ...live, reducedMotion: true }), false);
    assert.equal(shouldAnimateScene({ ...live, webglReady: false }), false);
  });

  it("renders a composed frame only when WebGL is ready and the journey is relevant", () => {
    assert.equal(
      shouldRenderScene({ webglReady: true, inJourney: true }),
      true,
    );
    assert.equal(
      shouldRenderScene({ webglReady: false, inJourney: true }),
      false,
    );
    assert.equal(
      shouldRenderScene({ webglReady: true, inJourney: false }),
      false,
    );
  });
});

describe("immersive scene quality policy", () => {
  it("maps each runtime profile to an intentional quality tier", () => {
    assert.equal(sceneQualityFor({ profile: "desktop" }), "full");
    assert.equal(sceneQualityFor({ profile: "constrained" }), "balanced");
    assert.equal(sceneQualityFor({ profile: "mobile" }), "minimal");
    assert.equal(sceneQualityFor({ profile: "reduced" }), "static");
  });

  it("defensively lowers an inconsistent desktop profile on limited hardware", () => {
    assert.equal(
      sceneQualityFor({ profile: "desktop", deviceMemory: 2 }),
      "balanced",
    );
    assert.equal(
      sceneQualityFor({ profile: "desktop", hardwareConcurrency: 4 }),
      "balanced",
    );
  });

  it("ignores absent or invalid optional device hints", () => {
    assert.equal(
      sceneQualityFor({
        profile: "desktop",
        deviceMemory: Number.NaN,
        hardwareConcurrency: -2,
      }),
      "full",
    );
    assert.equal(
      sceneQualityFor({
        profile: "desktop",
        deviceMemory: Number.POSITIVE_INFINITY,
        hardwareConcurrency: 0,
      }),
      "full",
    );
  });
});

describe("immersive journey presentation policy", () => {
  it("maps only journey relevance to the stable mount state", () => {
    assert.equal(journeyStateFor(true), "active");
    assert.equal(journeyStateFor(false), "inactive");
  });

  it("rebuilds bounded resources only when the tuning profile changes", () => {
    assert.equal(shouldRebuildSceneResources("desktop", "desktop"), false);
    assert.equal(shouldRebuildSceneResources("mobile", "mobile"), false);
    assert.equal(shouldRebuildSceneResources("desktop", "mobile"), true);
    assert.equal(shouldRebuildSceneResources("mobile", "reduced"), true);
    assert.equal(shouldRebuildSceneResources("reduced", "desktop"), true);
  });
});

describe("contact-stage motion policy", () => {
  it("keeps full motion outside a transition to contact", () => {
    assert.equal(motionScaleForTransition("proof", 0), 1);
    assert.equal(motionScaleForTransition("splash-ink", 0.75), 1);
  });

  it("decays continuously across the entire transition to contact", () => {
    assert.equal(motionScaleForTransition("contact", 0), 1);
    assert.equal(motionScaleForTransition("contact", 0.5), 0.51);
    assert.equal(motionScaleForTransition("contact", 1), 0.02);

    const beforeMidpoint = motionScaleForTransition("contact", 0.499999);
    const afterMidpoint = motionScaleForTransition("contact", 0.500001);
    assert.ok(beforeMidpoint > afterMidpoint);
    assert.ok(beforeMidpoint - afterMidpoint < 0.00001);
  });

  it("is monotonic and clamps malformed transition progress", () => {
    const samples = Array.from({ length: 101 }, (_, index) =>
      motionScaleForTransition("contact", index / 100),
    );

    for (let index = 1; index < samples.length; index += 1) {
      assert.ok(samples[index] <= samples[index - 1]);
    }
    assert.equal(motionScaleForTransition("contact", Number.NaN), 1);
    assert.equal(motionScaleForTransition("contact", -10), 1);
    assert.equal(motionScaleForTransition("contact", 10), 0.02);
  });
});

describe("preallocated scene-group weight state", () => {
  const horizon: SceneGroupWeights = {
    horizon: 1,
    signals: 0,
    voice: 0,
    document: 0,
    orchestration: 0,
    splats: 0,
    measurement: 0,
  };
  const voice: SceneGroupWeights = {
    horizon: 0,
    signals: 0,
    voice: 1,
    document: 0,
    orchestration: 0,
    splats: 0,
    measurement: 0,
  };

  it("copies reduced/static weights exactly into the same mutable object", () => {
    const current = createMutableSceneGroupWeights(horizon);
    const result = copySceneGroupWeights(current, voice);

    assert.equal(result, current);
    assert.deepEqual(current, voice);
  });

  it("delta-damps all seven weights without allocating a replacement", () => {
    const current = createMutableSceneGroupWeights(horizon);
    const result = dampSceneGroupWeights(current, voice, 5, 0.1);
    const expectedAlpha = 1 - Math.exp(-0.5);

    assert.equal(result, current);
    assert.ok(Math.abs(current.horizon - (1 - expectedAlpha)) < 1e-12);
    assert.ok(Math.abs(current.voice - expectedAlpha) < 1e-12);
    assert.equal(current.signals, 0);
    assert.equal(current.document, 0);
    assert.equal(current.orchestration, 0);
    assert.equal(current.splats, 0);
    assert.equal(current.measurement, 0);
    assert.ok(
      Math.abs(Object.values(current).reduce((sum, weight) => sum + weight, 0) - 1) <
        1e-12,
    );
  });

  it("keeps the normalized state stable for zero or malformed frame deltas", () => {
    const current = createMutableSceneGroupWeights(horizon);

    dampSceneGroupWeights(current, voice, 5, 0);
    assert.deepEqual(current, horizon);
    dampSceneGroupWeights(current, voice, 5, Number.NaN);
    assert.deepEqual(current, horizon);
  });
});
