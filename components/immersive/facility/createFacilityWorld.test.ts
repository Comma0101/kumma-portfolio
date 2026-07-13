import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import type * as ThreeTypes from "three";
import { getThreeSceneTuning } from "../../threeSceneTuning";
import { sampleFacilityNarrative } from "./narrative";

process.env.NODE_PATH = path.resolve(process.cwd(), "node_modules");
const nodeModule = require("node:module") as {
  readonly Module: { _initPaths(): void };
};
nodeModule.Module._initPaths();
const THREE = require("three") as typeof ThreeTypes;
const { sampleFacilityCamera } = require("./cameraPath") as typeof import("./cameraPath");
const { createFacilityWorld } = require("./createFacilityWorld") as typeof import("./createFacilityWorld");

const desktopTuning = getThreeSceneTuning({
  deviceMemory: 8,
  devicePixelRatio: 2,
  hardwareConcurrency: 12,
  isCoarsePointer: false,
  reducedMotion: false,
  viewportWidth: 1440,
});

const mobileTuning = getThreeSceneTuning({
  deviceMemory: 8,
  devicePixelRatio: 2,
  hardwareConcurrency: 8,
  isCoarsePointer: true,
  reducedMotion: false,
  viewportWidth: 390,
});

function worldPosition(object: ThreeTypes.Object3D): ThreeTypes.Vector3 {
  object.updateWorldMatrix(true, false);
  return object.getWorldPosition(new THREE.Vector3());
}

describe("facility world", () => {
  it("builds the complete persistent journey at distinct forward depths", () => {
    const world = createFacilityWorld(desktopTuning);
    assert.deepEqual(Object.keys(world.zones), [
      "exterior-ridge",
      "reliability-spine",
      "fissure-threshold",
      "voice-chamber",
      "document-foundry",
      "orchestration-atrium",
      "dissolution-observatory",
      "calibration-deck",
      "quiet-horizon",
    ]);
    assert.ok(world.root.getObjectByName("facility-distant-entrance"));
    assert.ok(world.root.getObjectByName("facility-reliability-spine"));
    assert.ok(world.root.getObjectByName("facility-threshold-occluder"));
    assert.ok(world.root.getObjectByName("facility-voice-ambiguity-gate"));
    assert.ok(world.root.getObjectByName("facility-document-segments"));
    assert.ok(
      world.root.getObjectByName("facility-orchestration-coordinator-core"),
    );
    assert.ok(world.root.getObjectByName("facility-orchestration-safety-gate"));
    assert.ok(world.root.getObjectByName("facility-dissolution-surface"));
    assert.ok(world.root.getObjectByName("facility-calibration-surface-marks"));
    assert.ok(world.root.getObjectByName("facility-calibration-stable-signal"));

    const bounds = Object.values(world.zones).map(
      (zone) => zone.userData.bounds as { zMin: number; zMax: number },
    );
    for (let index = 1; index < bounds.length; index += 1) {
      assert.ok(bounds[index].zMax <= bounds[index - 1].zMax);
      assert.ok(bounds[index].zMin < bounds[index - 1].zMin);
    }
    world.dispose();
  });

  it("reserves the one signature point surface for coherent ink dissolution", () => {
    const world = createFacilityWorld(desktopTuning);
    let signatures = 0;
    let pointSurfaces = 0;
    world.root.traverse((object) => {
      if (object.userData.signature !== true) return;
      signatures += 1;
      if (object instanceof THREE.Points) {
        pointSurfaces += 1;
        assert.equal(object.name, "facility-dissolution-surface");
        assert.ok(object.material instanceof THREE.ShaderMaterial);
        return;
      }
      assert.ok(object instanceof THREE.Mesh || object instanceof THREE.InstancedMesh);
      const renderable = object as ThreeTypes.Mesh;
      const materials = Array.isArray(renderable.material)
        ? renderable.material
        : [renderable.material];
      for (const material of materials) {
        assert.equal(material instanceof THREE.LineBasicMaterial, false);
        assert.equal(material instanceof THREE.PointsMaterial, false);
      }
    });
    assert.ok(signatures >= 12);
    assert.equal(pointSurfaces, 1);
    world.dispose();
  });

  it("removes secondary chamber trim in the mobile construction profile", () => {
    const desktop = createFacilityWorld(desktopTuning);
    const mobile = createFacilityWorld(mobileTuning);

    for (const name of [
      "facility-voice-unsafe-stop",
      "facility-voice-unsafe-signal",
      "facility-document-source-frame-left",
      "facility-document-source-frame-right",
      "facility-document-queue-lane-0",
      "facility-document-queue-lane-2",
    ]) {
      assert.ok(desktop.root.getObjectByName(name), `${name} belongs on desktop`);
      assert.equal(
        Boolean(mobile.root.getObjectByName(name)),
        false,
        `${name} is secondary mobile trim`,
      );
    }

    assert.ok(mobile.root.getObjectByName("facility-voice-unsafe-branch"));
    assert.ok(mobile.root.getObjectByName("facility-voice-ambiguity-gate"));
    assert.ok(mobile.root.getObjectByName("facility-document-queue-lane-1"));
    assert.ok(mobile.root.getObjectByName("facility-document-segments"));
    desktop.dispose();
    mobile.dispose();
  });

  it("places the distant entrance inside the authored hero view", () => {
    const world = createFacilityWorld(desktopTuning);
    const entrance = world.root.getObjectByName("facility-distant-entrance")!;
    const sample = sampleFacilityCamera(0, "desktop");
    const camera = new THREE.PerspectiveCamera(sample.fov, 1.44, 0.1, 220);
    camera.position.set(sample.position.x, sample.position.y, sample.position.z);
    camera.lookAt(sample.target.x, sample.target.y, sample.target.z);
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    const matrix = new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
    const frustum = new THREE.Frustum().setFromProjectionMatrix(matrix);

    assert.equal(frustum.containsPoint(worldPosition(entrance)), true);
    world.dispose();
  });

  it("updates only the voice mechanism deterministically", () => {
    const world = createFacilityWorld(desktopTuning);
    const exterior = world.root.getObjectByName("facility-distant-entrance")!;
    const signal = world.root.getObjectByName("facility-voice-clarified-signal")!;
    const exteriorBefore = exterior.matrix.clone();
    const sample = sampleFacilityNarrative(0.39, "desktop");

    world.update(sample, 12, 0.8);
    const first = signal.position.clone();
    world.update(sample, 12, 0.8);
    assert.deepEqual(signal.position.toArray(), first.toArray());
    assert.deepEqual(exterior.matrix.toArray(), exteriorBefore.toArray());

    world.update(sampleFacilityNarrative(0.42, "desktop"), 14, 1);
    assert.notDeepEqual(signal.position.toArray(), first.toArray());
    world.dispose();
  });

  it("keeps the KOTA camera clear of the threshold, gate, and floor conduits", () => {
    const world = createFacilityWorld(desktopTuning);
    const sample = sampleFacilityNarrative(0.39, "desktop");
    world.update(sample, 0, 0);

    const camera = sampleFacilityCamera(0.39, "desktop");
    const threshold = world.root.getObjectByName("facility-fissure-east")!;
    const leftGate = world.root.getObjectByName(
      "facility-voice-ambiguity-gate",
    )!;
    const rightGate = world.root.getObjectByName(
      "facility-voice-ambiguity-gate-right",
    )!;
    const thresholdBack = threshold.position.z - threshold.scale.z * 0.5;
    const leftInnerEdge = leftGate.position.x + leftGate.scale.x * 0.5;
    const rightInnerEdge = rightGate.position.x - rightGate.scale.x * 0.5;

    assert.ok(camera.position.z < thresholdBack - 1);
    assert.ok(camera.position.x > leftInnerEdge + 0.3);
    assert.ok(camera.position.x < rightInnerEdge - 0.3);

    for (const name of [
      "facility-voice-input-conduit",
      "facility-voice-unsafe-branch",
      "facility-voice-clarified-branch",
    ]) {
      const conduit = world.root.getObjectByName(name) as ThreeTypes.Mesh;
      conduit.geometry.computeBoundingBox();
      assert.ok((conduit.geometry.boundingBox?.max.y ?? Infinity) <= 0.72);
    }
    world.dispose();
  });

  it("keeps the ARCHON camera corridor clear of opaque atrium structure", () => {
    const world = createFacilityWorld(desktopTuning);
    const cameraSamples = Array.from({ length: 25 }, (_, index) =>
      sampleFacilityCamera(0.55 + (index / 24) * 0.14, "desktop"),
    );
    const clearance = 0.42;

    for (const name of [
      "facility-orchestration-tool-wing",
      "facility-orchestration-memory-wing",
      "facility-orchestration-safety-gate",
      "facility-orchestration-safety-lintel",
      "facility-orchestration-coordinator-core",
    ]) {
      const structure = world.root.getObjectByName(name)!;
      const bounds = new THREE.Box3().setFromObject(structure).expandByScalar(clearance);
      for (const sample of cameraSamples) {
        const position = new THREE.Vector3(
          sample.position.x,
          sample.position.y,
          sample.position.z,
        );
        assert.equal(bounds.containsPoint(position), false, `${name} blocks camera`);
      }
    }

    const unitBounds = new THREE.Box3(
      new THREE.Vector3(-0.5, -0.5, -0.5),
      new THREE.Vector3(0.5, 0.5, 0.5),
    );
    for (const name of [
      "facility-orchestration-atrium-frames",
      "facility-orchestration-bridge-spans",
    ]) {
      const instances = world.root.getObjectByName(name) as ThreeTypes.InstancedMesh;
      const matrix = new THREE.Matrix4();
      for (let index = 0; index < instances.count; index += 1) {
        instances.getMatrixAt(index, matrix);
        const bounds = unitBounds.clone().applyMatrix4(matrix).expandByScalar(clearance);
        for (const sample of cameraSamples) {
          const position = new THREE.Vector3(
            sample.position.x,
            sample.position.y,
            sample.position.z,
          );
          assert.equal(bounds.containsPoint(position), false, `${name} blocks camera`);
        }
      }
    }
    world.dispose();
  });

  it("disposes every owned geometry and material once", () => {
    const world = createFacilityWorld(desktopTuning);
    const geometries = new Set<ThreeTypes.BufferGeometry>();
    const materials = new Set<ThreeTypes.Material>();
    world.root.traverse((object) => {
      const renderable = object as ThreeTypes.Mesh;
      if (renderable.geometry) geometries.add(renderable.geometry);
      if (renderable.material) {
        const owned = Array.isArray(renderable.material)
          ? renderable.material
          : [renderable.material];
        owned.forEach((material) => materials.add(material));
      }
    });
    let disposals = 0;
    geometries.forEach((geometry) =>
      geometry.addEventListener("dispose", () => (disposals += 1)),
    );
    materials.forEach((material) =>
      material.addEventListener("dispose", () => (disposals += 1)),
    );

    world.dispose();
    world.dispose();
    assert.equal(disposals, geometries.size + materials.size);
    assert.equal(world.root.parent, null);
  });
});
