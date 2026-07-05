import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveHydratedReducedMotion } from "./reducedMotionState.ts";

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
