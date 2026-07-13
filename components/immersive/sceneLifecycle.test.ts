import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  journeyStateFor,
  sceneQualityFor,
  shouldRebuildSceneResources,
  shouldAnimateScene,
  shouldRenderScene,
} from "./sceneLifecycle";

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
