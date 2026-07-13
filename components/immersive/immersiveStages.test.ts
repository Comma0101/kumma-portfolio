import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { facilityChapters } from "./facility/narrative";
import {
  clamp01,
  getImmersiveProfile,
  immersiveStageIds,
} from "./immersiveStages";

if (false) {
  // @ts-expect-error Ordered stage IDs are compile-time readonly.
  immersiveStageIds.push("hero");
}

describe("facility-backed immersive stage contract", () => {
  it("derives the exact ordered stage IDs from the facility narrative", () => {
    assert.deepEqual(
      immersiveStageIds,
      facilityChapters.map((chapter) => chapter.stageId),
    );
    assert.deepEqual(immersiveStageIds, [
      "hero",
      "proof",
      "kota",
      "audiobook",
      "archon",
      "splash-ink",
      "research-labs",
      "contact",
    ]);
    assert.equal(Object.isFrozen(immersiveStageIds), true);
  });

  it("clamps finite and non-finite progress deterministically", () => {
    assert.equal(clamp01(-0.2), 0);
    assert.equal(clamp01(0.4), 0.4);
    assert.equal(clamp01(1.2), 1);
    assert.equal(clamp01(Number.NaN), 0);
    assert.equal(clamp01(Number.NEGATIVE_INFINITY), 0);
    assert.equal(clamp01(Number.POSITIVE_INFINITY), 1);
  });

  it("selects reduced motion first and switches mobile at 768px", () => {
    assert.equal(
      getImmersiveProfile({ reducedMotion: true, width: 1440 }),
      "reduced",
    );
    assert.equal(
      getImmersiveProfile({ reducedMotion: false, width: 767 }),
      "mobile",
    );
    assert.equal(
      getImmersiveProfile({ reducedMotion: false, width: 768 }),
      "desktop",
    );
  });

  it("stays pure and free of the retired parallel keyframe model", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "components/immersive/immersiveStages.ts"),
      "utf8",
    );

    assert.doesNotMatch(
      source,
      /from\s+["'](?:react|gsap|three|@react-three\/[^"']+|framer-motion)["']/,
    );
    assert.doesNotMatch(source, /ImmersiveStageKeyframe|sampleStagePair|groups:/);
    assert.doesNotMatch(source, /\b(?:Date\.now|performance\.now|Math\.random)\b/);
  });
});
