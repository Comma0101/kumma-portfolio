import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_MOTION_ENERGY,
  RESTORATION_SPIKE_ENERGY,
  nextFrameSettlement,
  nextMotionEnergy,
} from "./motionEnergy";

const live = {
  active: true,
  hidden: false,
  reducedMotion: false,
} as const;

describe("facility scroll motion energy", () => {
  it("rises from finite forward and reverse route velocity", () => {
    const forward = nextMotionEnergy({
      ...live,
      previousEnergy: 0,
      previousProgress: 0.2,
      nextProgress: 0.23,
      deltaSeconds: 1 / 60,
    });
    const reverse = nextMotionEnergy({
      ...live,
      previousEnergy: 0,
      previousProgress: 0.23,
      nextProgress: 0.2,
      deltaSeconds: 1 / 60,
    });

    assert.ok(forward > 0);
    assert.equal(reverse, forward);
    assert.ok(forward <= MAX_MOTION_ENERGY);
  });

  it("caps restoration and resize-sized route spikes", () => {
    const restored = nextMotionEnergy({
      ...live,
      previousEnergy: 0,
      previousProgress: 0.02,
      nextProgress: 0.92,
      deltaSeconds: 1 / 120,
    });

    assert.equal(restored, RESTORATION_SPIKE_ENERGY);
    assert.ok(restored < MAX_MOTION_ENERGY);
  });

  it("decays smoothly to exact zero after scrolling stops", () => {
    let energy = 0.7;
    const samples: number[] = [];
    for (let index = 0; index < 240; index += 1) {
      energy = nextMotionEnergy({
        ...live,
        previousEnergy: energy,
        previousProgress: 0.4,
        nextProgress: 0.4,
        deltaSeconds: 1 / 60,
      });
      samples.push(energy);
    }

    for (let index = 1; index < samples.length; index += 1) {
      assert.ok(samples[index] <= samples[index - 1]);
    }
    assert.equal(samples.at(-1), 0);
  });

  it("returns zero when hidden, reduced, outside, or malformed", () => {
    const moving = {
      ...live,
      previousEnergy: 0.7,
      previousProgress: 0.1,
      nextProgress: 0.3,
      deltaSeconds: 1 / 60,
    };
    assert.equal(nextMotionEnergy({ ...moving, active: false }), 0);
    assert.equal(nextMotionEnergy({ ...moving, hidden: true }), 0);
    assert.equal(nextMotionEnergy({ ...moving, reducedMotion: true }), 0);
    assert.equal(
      nextMotionEnergy({
        ...moving,
        previousProgress: Number.NaN,
        nextProgress: Number.NaN,
        previousEnergy: Number.NaN,
      }),
      0,
    );
  });
});

describe("facility frame settlement", () => {
  it("requires consecutive quiet, converged frames before stopping", () => {
    let stableFrames = 0;
    for (let index = 0; index < 2; index += 1) {
      const result = nextFrameSettlement({
        eligible: true,
        maxError: 0.0005,
        motionEnergy: 0,
        stableFrames,
      });
      stableFrames = result.stableFrames;
      assert.equal(result.shouldContinue, true);
      assert.equal(result.settled, false);
    }
    const settled = nextFrameSettlement({
      eligible: true,
      maxError: 0.0005,
      motionEnergy: 0,
      stableFrames,
    });
    assert.equal(settled.settled, true);
    assert.equal(settled.shouldContinue, false);
  });

  it("resets stability for camera error or renewed route energy", () => {
    for (const input of [
      { maxError: 0.2, motionEnergy: 0 },
      { maxError: 0, motionEnergy: 0.2 },
    ]) {
      assert.deepEqual(
        nextFrameSettlement({
          eligible: true,
          stableFrames: 2,
          ...input,
        }),
        { settled: false, shouldContinue: true, stableFrames: 0 },
      );
    }
  });

  it("does not request frames when the scene is ineligible", () => {
    assert.deepEqual(
      nextFrameSettlement({
        eligible: false,
        maxError: Number.POSITIVE_INFINITY,
        motionEnergy: 1,
        stableFrames: 0,
      }),
      { settled: true, shouldContinue: false, stableFrames: 0 },
    );
  });
});
