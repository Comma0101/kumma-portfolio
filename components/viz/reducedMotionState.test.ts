import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveHydratedReducedMotion,
  shouldInitializeSmoothScroll,
} from "./reducedMotionState";

describe("resolveHydratedReducedMotion", () => {
  it("uses static rendering before hydration", () => {
    assert.equal(
      resolveHydratedReducedMotion({
        hydrated: false,
        prefersReducedMotion: false,
      }),
      true,
    );
  });

  it("enables animation after hydration only for no-preference users", () => {
    assert.equal(
      resolveHydratedReducedMotion({
        hydrated: true,
        prefersReducedMotion: false,
      }),
      false,
    );
  });

  it("keeps static rendering after hydration for reduced-motion users", () => {
    assert.equal(
      resolveHydratedReducedMotion({
        hydrated: true,
        prefersReducedMotion: true,
      }),
      true,
    );
  });
});

describe("shouldInitializeSmoothScroll", () => {
  it("skips smooth scrolling for reduced-motion users", () => {
    assert.equal(shouldInitializeSmoothScroll(true), false);
  });

  it("initializes smooth scrolling for no-preference users", () => {
    assert.equal(shouldInitializeSmoothScroll(false), true);
  });

  it("initializes smooth scrolling when matchMedia is unavailable", () => {
    assert.equal(shouldInitializeSmoothScroll(undefined), true);
  });
});
