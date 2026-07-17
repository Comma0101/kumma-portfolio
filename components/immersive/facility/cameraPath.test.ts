import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import type { ImmersiveProfile, Vec3 } from "../types";

process.env.NODE_PATH = path.resolve(process.cwd(), "node_modules");
const nodeModule = require("node:module") as {
  readonly Module: { _initPaths(): void };
};
nodeModule.Module._initPaths();
const {
  FACILITY_CAMERA_FAR_PLANES,
  FACILITY_CAMERA_ROLL_LIMIT,
  facilityCameraControlPoints,
  facilityEntrancePosition,
  sampleFacilityCamera,
} = require("./cameraPath") as typeof import("./cameraPath");

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function finite(vector: Vec3): boolean {
  return Object.values(vector).every(Number.isFinite);
}

function travel(profile: ImmersiveProfile): number {
  const samples = Array.from({ length: 101 }, (_, index) =>
    sampleFacilityCamera(index / 100, profile),
  );
  return samples.slice(1).reduce(
    (total, sample, index) => total + distance(samples[index].position, sample.position),
    0,
  );
}

describe("facility camera path", () => {
  it("culls fully fogged distant rooms without clipping the next destination", () => {
    assert.deepEqual(FACILITY_CAMERA_FAR_PLANES, {
      desktop: 80,
      constrained: 60,
      mobile: 32,
      reduced: 24,
    });
    assert.equal(Object.isFrozen(FACILITY_CAMERA_FAR_PLANES), true);
  });

  it("moves continuously forward through finite authored poses", () => {
    const samples = Array.from({ length: 101 }, (_, index) =>
      sampleFacilityCamera(index / 100, "desktop"),
    );

    assert.deepEqual(samples[0].position, facilityCameraControlPoints[0]);
    assert.ok(samples.at(-1)!.position.z < samples[0].position.z);
    assert.ok(samples.every((sample) => finite(sample.position) && finite(sample.target)));
    assert.ok(samples.every((sample) => distance(sample.position, sample.target) > 1));

    for (let index = 1; index < samples.length; index += 1) {
      assert.ok(samples[index].position.z <= samples[index - 1].position.z + 0.05);
      assert.ok(distance(samples[index - 1].position, samples[index].position) < 6);
    }
  });

  it("foreshadows the entrance and physically descends through the threshold", () => {
    const hero = sampleFacilityCamera(0, "desktop");
    const exterior = sampleFacilityCamera(0.1, "desktop");
    const threshold = sampleFacilityCamera(0.25, "desktop");

    assert.ok(facilityEntrancePosition.z < hero.position.z);
    assert.ok(distance(hero.position, facilityEntrancePosition) > 10);
    assert.ok(threshold.position.y < exterior.position.y);
    assert.ok(threshold.fov > hero.fov);
  });

  it("reserves the largest vertical reveal for ARCHON and a lateral reveal for Splash Ink", () => {
    const ranges = [
      [0.29, 0.43],
      [0.43, 0.59],
      [0.59, 0.74],
      [0.74, 0.87],
    ] as const;
    const vertical = ranges.map(([from, to]) =>
      Math.abs(
        sampleFacilityCamera(to, "desktop").position.y -
          sampleFacilityCamera(from, "desktop").position.y,
      ),
    );
    assert.equal(vertical[1], Math.max(...vertical));

    const splashX = Array.from({ length: 13 }, (_, index) =>
      sampleFacilityCamera(0.67 + index * 0.01, "desktop").position.x,
    );
    const splashLateralReveal = Math.max(...splashX) - Math.min(...splashX);
    assert.ok(splashLateralReveal > 4);
    assert.ok(splashLateralReveal < 16);
  });

  it("keeps roll subtle and restrains mobile movement", () => {
    const desktop = Array.from({ length: 101 }, (_, index) =>
      sampleFacilityCamera(index / 100, "desktop"),
    );
    assert.ok(desktop.every((sample) => Math.abs(sample.roll) <= FACILITY_CAMERA_ROLL_LIMIT));
    assert.ok(travel("mobile") < travel("desktop"));

    const desktopFov = desktop.map((sample) => sample.fov);
    const mobileFov = Array.from({ length: 101 }, (_, index) =>
      sampleFacilityCamera(index / 100, "mobile").fov,
    );
    assert.ok(
      Math.max(...mobileFov) - Math.min(...mobileFov) <
        Math.max(...desktopFov) - Math.min(...desktopFov),
    );
  });

  it("returns stable deeply frozen authored poses for reduced motion", () => {
    const before = sampleFacilityCamera(0.06, "reduced");
    const after = sampleFacilityCamera(0.07, "reduced");
    assert.deepEqual(before, after);
    assert.equal(Object.isFrozen(before), true);
    assert.equal(Object.isFrozen(before.position), true);
    assert.equal(Object.isFrozen(before.target), true);
  });
});
