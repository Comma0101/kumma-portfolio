import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import type { ThreeSceneProfile } from "../../threeSceneTuning";
import {
  riverCenterAtDepth,
  sampleBoatJourney,
  sampleLivingWorldMotion,
  shanshuiMotifChapters,
} from "./shanshuiJourney";

const profiles: readonly ThreeSceneProfile[] = [
  "desktop",
  "constrained",
  "mobile",
  "reduced",
];

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

function stagesWith(motif: "bamboo" | "birds" | "fish" | "mist") {
  return shanshuiMotifChapters
    .filter((chapter) => chapter.motifs.includes(motif))
    .map((chapter) => chapter.stageId);
}

describe("living shanshui handscroll", () => {
  it("uses one persistent boat and keeps every living motif in its territory", () => {
    assert.deepEqual(
      shanshuiMotifChapters.map((chapter) => chapter.stageId),
      [
        "hero",
        "proof",
        "kota",
        "audiobook",
        "archon",
        "splash-ink",
        "research-labs",
        "contact",
      ],
    );
    assert.ok(
      shanshuiMotifChapters.every(
        (chapter) =>
          chapter.boatId === "traveller-boat" &&
          chapter.motifs.filter((motif) => motif === "boat").length === 1,
      ),
    );
    assert.deepEqual(stagesWith("bamboo"), ["proof", "kota"]);
    assert.deepEqual(stagesWith("mist"), ["proof", "kota"]);
    assert.deepEqual(stagesWith("birds"), ["archon"]);
    assert.deepEqual(stagesWith("fish"), ["splash-ink"]);
    assertDeeplyFrozen(shanshuiMotifChapters);
  });

  it("matches the terrain river centerline without random state", () => {
    for (const depth of [24, 0, -48, -91.5, -154]) {
      assert.equal(
        riverCenterAtDepth(depth),
        Math.sin((depth + 48) * 0.035) * 1.45,
      );
    }
    assert.equal(Number.isFinite(riverCenterAtDepth(Number.NaN)), true);
    assert.equal(
      Number.isFinite(riverCenterAtDepth(Number.POSITIVE_INFINITY)),
      true,
    );

    const source = readFileSync(
      path.resolve(
        process.cwd(),
        "components/immersive/facility/shanshuiJourney.ts",
      ),
      "utf8",
    );
    assert.doesNotMatch(source, /Math\.random/);
  });

  it("clamps malformed boat progress and returns deeply frozen finite samples", () => {
    assert.deepEqual(sampleBoatJourney(Number.NaN), sampleBoatJourney(0));
    assert.deepEqual(
      sampleBoatJourney(Number.NEGATIVE_INFINITY),
      sampleBoatJourney(0),
    );
    assert.deepEqual(
      sampleBoatJourney(Number.POSITIVE_INFINITY),
      sampleBoatJourney(1),
    );
    assert.deepEqual(sampleBoatJourney(-4), sampleBoatJourney(0));
    assert.deepEqual(sampleBoatJourney(4), sampleBoatJourney(1));

    for (let index = 0; index <= 100; index += 1) {
      const sample = sampleBoatJourney(index / 100);
      assert.ok(collectNumbers(sample).every(Number.isFinite));
      assert.equal(sample.x, riverCenterAtDepth(sample.z));
      assert.ok(sample.wake >= 0 && sample.wake <= 1);
      assertDeeplyFrozen(sample);
    }
  });

  it("moves the boat monotonically into depth and removes its wake at shore", () => {
    let previous = sampleBoatJourney(0);
    assert.equal(previous.moored, false);

    for (let index = 1; index <= 1000; index += 1) {
      const current = sampleBoatJourney(index / 1000);
      assert.ok(current.z < previous.z);
      previous = current;
    }

    const shore = sampleBoatJourney(1);
    assert.equal(shore.moored, true);
    assert.equal(shore.wake, 0);
    assert.ok(shore.z < sampleBoatJourney(0).z);
  });

  it("keeps the authored bow facing downstream along the river", () => {
    for (let index = 0; index < 100; index += 1) {
      const current = sampleBoatJourney(index / 100);
      const next = sampleBoatJourney((index + 1) / 100);
      const velocityLength = Math.hypot(next.x - current.x, next.z - current.z);
      const velocityX = (next.x - current.x) / velocityLength;
      const velocityZ = (next.z - current.z) / velocityLength;
      const facingX = -Math.sin(current.heading);
      const facingZ = -Math.cos(current.heading);
      assert.ok(facingX * velocityX + facingZ * velocityZ > 0.999);
    }
  });

  it("samples deterministic finite bounded living-world motion", () => {
    for (const profile of profiles) {
      for (let index = 0; index <= 100; index += 1) {
        const progress = index / 100;
        const first = sampleLivingWorldMotion(progress, 12.5, 0.74, profile);
        const second = sampleLivingWorldMotion(progress, 12.5, 0.74, profile);
        assert.deepEqual(first, second);
        assert.ok(collectNumbers(first).every(Number.isFinite));
        assert.ok(first.bambooSway >= -1 && first.bambooSway <= 1);
        assert.ok(first.birdFlight >= 0 && first.birdFlight <= 1);
        assert.ok(first.fishReveal >= 0 && first.fishReveal <= 1);
        assert.ok(first.mistDrift >= 0 && first.mistDrift <= 1);
        assertDeeplyFrozen(first);
      }
    }
  });

  it("limits runtime life to its authored chapter windows", () => {
    const proof = sampleLivingWorldMotion(1 / 7, 10, 1, "desktop");
    const kota = sampleLivingWorldMotion(2 / 7, 10, 1, "desktop");
    const archon = sampleLivingWorldMotion(4 / 7, 10, 1, "desktop");
    const splashInk = sampleLivingWorldMotion(5 / 7, 10, 1, "desktop");
    const research = sampleLivingWorldMotion(0.8, 10, 1, "desktop");

    assert.notEqual(proof.bambooSway, 0);
    assert.notEqual(proof.mistDrift, 0);
    assert.notEqual(kota.bambooSway, 0);
    assert.notEqual(kota.mistDrift, 0);
    assert.equal(archon.bambooSway, 0);
    assert.equal(archon.mistDrift, 0);
    assert.ok(archon.birdFlight > 0);
    assert.equal(archon.fishReveal, 0);
    assert.equal(splashInk.birdFlight, 0);
    assert.ok(splashInk.fishReveal > 0);
    assert.equal(research.fishReveal, 0);
  });

  it("normalizes malformed motion inputs defensively", () => {
    const baseline = sampleLivingWorldMotion(0, 0, 0, "desktop");
    assert.deepEqual(
      sampleLivingWorldMotion(Number.NaN, Number.NaN, Number.NaN, "desktop"),
      baseline,
    );
    assert.deepEqual(
      sampleLivingWorldMotion(
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        -10,
        "desktop",
      ),
      baseline,
    );

    const clamped = sampleLivingWorldMotion(
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      "desktop",
    );
    assert.ok(collectNumbers(clamped).every(Number.isFinite));
  });

  it("removes time- and energy-driven motion for the reduced profile", () => {
    const still = sampleLivingWorldMotion(5 / 7, 0, 0, "reduced");
    const later = sampleLivingWorldMotion(5 / 7, 10_000, 1, "reduced");
    assert.deepEqual(later, still);
    assert.equal(still.bambooSway, 0);
    assert.equal(still.birdFlight, 0);
    assert.equal(still.mistDrift, 0);
    assert.ok(still.fishReveal > 0);
  });
});
