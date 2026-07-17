import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";

process.env.NODE_PATH = path.resolve(process.cwd(), "node_modules");
const nodeModule = require("node:module") as {
  readonly Module: { _initPaths(): void };
};
nodeModule.Module._initPaths();
const { sampleFacilityCamera } = require("../cameraPath") as typeof import("../cameraPath");
const { sampleFacilityNarrative } = require("../narrative") as typeof import("../narrative");
const {
  calibrationMarksForBudget,
  calibrationStateAt,
} = require("./calibration") as typeof import("./calibration");

describe("facility calibration deck", () => {
  it("attaches every tolerance mark to a finite deck or instrument surface", () => {
    const marks = calibrationMarksForBudget(36);
    const surfaces = new Set(marks.map((mark) => mark.surface));

    assert.equal(marks.length, 36);
    assert.deepEqual([...surfaces].sort(), [
      "deck",
      "instrument-left",
      "instrument-right",
    ]);
    for (const mark of marks) {
      assert.ok([mark.x, mark.y, mark.z, mark.rotationY].every(Number.isFinite));
      assert.ok(mark.z >= -147 && mark.z <= -127);
      if (mark.surface === "deck") assert.equal(mark.y, 0.64);
      if (mark.surface === "instrument-left") assert.equal(mark.x, -9.44);
      if (mark.surface === "instrument-right") assert.equal(mark.x, 9.44);
    }
  });

  it("honors profile budgets without creating an infinite grid", () => {
    assert.equal(calibrationMarksForBudget(0).length, 0);
    assert.equal(calibrationMarksForBudget(12).length, 12);
    assert.equal(calibrationMarksForBudget(18).length, 18);
    assert.equal(calibrationMarksForBudget(28).length, 28);
    assert.equal(calibrationMarksForBudget(Number.NaN).length, 0);
  });

  it("settles every engraving and leaves one stable signal", () => {
    const active = calibrationStateAt(0.42, 18);
    const settled = calibrationStateAt(1, 18);
    const clamped = calibrationStateAt(2, 18);

    assert.ok(active.marks.some((mark) => mark.reveal > 0));
    assert.ok(active.marks.some((mark) => mark.reveal < 1));
    assert.ok(settled.marks.every((mark) => mark.reveal === 1));
    assert.equal(settled.signalMotion, 0);
    assert.equal(settled.settled, true);
    assert.deepEqual(clamped, settled);
    assert.deepEqual(settled.signalPosition, { x: 0, y: 3.15, z: -151.2 });
  });

  it("calms the camera and atmosphere into an open contact horizon", () => {
    const splash = sampleFacilityNarrative(0.74, "desktop");
    const deck = sampleFacilityNarrative(0.87, "desktop");
    const contact = sampleFacilityNarrative(1, "desktop");
    const deckCamera = sampleFacilityCamera(0.87, "desktop");
    const contactCamera = sampleFacilityCamera(1, "desktop");

    assert.ok(deck.atmosphere.fogDensity < splash.atmosphere.fogDensity);
    assert.ok(contact.atmosphere.fogDensity < deck.atmosphere.fogDensity);
    assert.equal(contact.event.intensity, 0);
    assert.equal(contact.camera.roll, 0);
    assert.ok(contact.camera.fov < deck.camera.fov);
    assert.ok(contactCamera.target.z < contactCamera.position.z);
    assert.ok(contactCamera.target.y < contactCamera.position.y - 2);
    assert.ok(contactCamera.position.y >= deckCamera.position.y);
  });

  it("clamps and recreates exact states in reverse", () => {
    assert.deepEqual(calibrationStateAt(-1, 12), calibrationStateAt(0, 12));
    const forward = [0.13, 0.44, 0.77, 1].map((progress) =>
      calibrationStateAt(progress, 12),
    );
    const reverse = [1, 0.77, 0.44, 0.13]
      .map((progress) => calibrationStateAt(progress, 12))
      .reverse();
    assert.deepEqual(reverse, forward);
  });
});
