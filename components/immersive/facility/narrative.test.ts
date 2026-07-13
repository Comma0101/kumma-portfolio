import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  facilityChapters,
  facilityEventWindows,
  sampleFacilityNarrative,
} from "./narrative";
import type { ImmersiveProfile } from "../types";

const profiles: readonly ImmersiveProfile[] = ["desktop", "mobile", "reduced"];

function assertDeeplyFrozen(value: unknown, seen = new Set<object>()): void {
  if (value === null || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeeplyFrozen(child, seen);
}

function collectNumbers(value: unknown, result: number[] = []): number[] {
  if (typeof value === "number") result.push(value);
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) collectNumbers(child, result);
  }
  return result;
}

describe("facility narrative", () => {
  it("defines the approved ordered journey and monotonic route", () => {
    assert.deepEqual(facilityChapters.map((chapter) => chapter.stageId), [
      "hero",
      "proof",
      "kota",
      "audiobook",
      "archon",
      "splash-ink",
      "research-labs",
      "contact",
    ]);
    assert.deepEqual(facilityChapters.map((chapter) => chapter.zone), [
      "exterior-ridge",
      "reliability-spine",
      "voice-chamber",
      "document-foundry",
      "orchestration-atrium",
      "dissolution-observatory",
      "calibration-deck",
      "quiet-horizon",
    ]);
    for (let index = 1; index < facilityChapters.length; index += 1) {
      assert.ok(
        facilityChapters[index].routeProgress >
          facilityChapters[index - 1].routeProgress,
      );
    }
  });

  it("uses one contiguous non-overlapping event at every sampled progress", () => {
    assert.equal(facilityEventWindows[0].start, 0);
    assert.equal(facilityEventWindows.at(-1)?.end, 1);
    for (let index = 1; index < facilityEventWindows.length; index += 1) {
      assert.equal(
        facilityEventWindows[index - 1].end,
        facilityEventWindows[index].start,
      );
    }
    for (let index = 0; index <= 100; index += 1) {
      const progress = index / 100;
      const sample = sampleFacilityNarrative(progress, "desktop");
      const active = facilityEventWindows.filter((window, windowIndex) =>
        windowIndex === facilityEventWindows.length - 1
          ? progress >= window.start && progress <= window.end
          : progress >= window.start && progress < window.end,
      );
      assert.equal(active.length, 1);
      assert.equal(sample.event.id, active[0].id);
      assert.ok(sample.event.progress >= 0 && sample.event.progress <= 1);
      assert.ok(sample.event.intensity >= 0 && sample.event.intensity <= 1);
    }
    assert.equal(
      sampleFacilityNarrative(0.27, "desktop").event.id,
      "cross-threshold",
    );
  });

  it("clamps malformed progress and returns finite samples for every profile", () => {
    assert.equal(sampleFacilityNarrative(-1, "desktop").journeyProgress, 0);
    assert.equal(sampleFacilityNarrative(Number.NaN, "desktop").journeyProgress, 0);
    assert.equal(sampleFacilityNarrative(Number.POSITIVE_INFINITY, "desktop").journeyProgress, 1);
    assert.equal(sampleFacilityNarrative(2, "desktop").journeyProgress, 1);

    for (const profile of profiles) {
      for (let index = 0; index <= 100; index += 1) {
        const sample = sampleFacilityNarrative(index / 100, profile);
        assert.ok(collectNumbers(sample).every(Number.isFinite));
        assert.equal(sample.profile, profile);
      }
    }
  });

  it("uses stable chapter poses for reduced motion", () => {
    const before = sampleFacilityNarrative(0.06, "reduced");
    const after = sampleFacilityNarrative(0.07, "reduced");
    assert.deepEqual(before, after);

    const boundary = sampleFacilityNarrative(0.14, "reduced");
    assert.equal(boundary.zone, "reliability-spine");
    assert.equal(boundary.routeProgress, facilityChapters[1].routeProgress);
  });

  it("deep-freezes definitions and returned samples", () => {
    assertDeeplyFrozen(facilityChapters);
    assertDeeplyFrozen(facilityEventWindows);
    assertDeeplyFrozen(sampleFacilityNarrative(0.42, "desktop"));
  });
});
