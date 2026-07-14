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

type FacilityWorld = ReturnType<typeof createFacilityWorld>;

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

const expectedZones = [
  ["exterior-ridge", { zMin: -4, zMax: 24 }],
  ["reliability-spine", { zMin: -11, zMax: 18 }],
  ["fissure-threshold", { zMin: -27, zMax: -8 }],
  ["voice-chamber", { zMin: -46, zMax: -23 }],
  ["document-foundry", { zMin: -72, zMax: -43 }],
  ["orchestration-atrium", { zMin: -101, zMax: -69 }],
  ["dissolution-observatory", { zMin: -127, zMax: -101 }],
  ["calibration-deck", { zMin: -149, zMax: -126 }],
  ["quiet-horizon", { zMin: -160, zMax: -148 }],
] as const;

function objectNamed(
  world: FacilityWorld,
  name: string,
): ThreeTypes.Object3D {
  const object = world.root.getObjectByName(name);
  assert.ok(object, `${name} belongs to the living handscroll`);
  return object;
}

function instancedNamed(
  world: FacilityWorld,
  name: string,
): ThreeTypes.InstancedMesh {
  const object = objectNamed(world, name);
  assert.ok(object instanceof THREE.InstancedMesh, `${name} is instanced`);
  return object;
}

function worldPosition(object: ThreeTypes.Object3D): ThreeTypes.Vector3 {
  object.updateWorldMatrix(true, false);
  return object.getWorldPosition(new THREE.Vector3());
}

function authoredFrustum(progress: number): ThreeTypes.Frustum {
  const sample = sampleFacilityCamera(progress, "desktop");
  const camera = new THREE.PerspectiveCamera(sample.fov, 1.44, 0.1, 220);
  camera.position.set(sample.position.x, sample.position.y, sample.position.z);
  camera.lookAt(sample.target.x, sample.target.y, sample.target.z);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();
  const matrix = new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse,
  );
  return new THREE.Frustum().setFromProjectionMatrix(matrix);
}

interface NamedCollisionBox {
  readonly label: string;
  readonly bounds: ThreeTypes.Box3;
}

function collisionBoxesFor(
  object: ThreeTypes.Object3D,
  clearance: number,
): NamedCollisionBox[] {
  object.updateWorldMatrix(true, true);
  if (object instanceof THREE.InstancedMesh) {
    object.geometry.computeBoundingBox();
    const geometryBounds = object.geometry.boundingBox;
    assert.ok(geometryBounds, `${object.name} has collision bounds`);
    const instanceMatrix = new THREE.Matrix4();
    const worldMatrix = new THREE.Matrix4();
    return Array.from({ length: object.count }, (_, index) => {
      object.getMatrixAt(index, instanceMatrix);
      worldMatrix.multiplyMatrices(object.matrixWorld, instanceMatrix);
      return {
        label: `${object.name}[${index}]`,
        bounds: geometryBounds
          .clone()
          .applyMatrix4(worldMatrix)
          .expandByScalar(clearance),
      };
    });
  }

  return [
    {
      label: object.name,
      bounds: new THREE.Box3().setFromObject(object).expandByScalar(clearance),
    },
  ];
}

function assertCameraCorridorClear(
  world: FacilityWorld,
  obstacleNames: readonly string[],
  journeyStart: number,
  journeyEnd: number,
  clearance: number,
): void {
  const obstacles = obstacleNames.flatMap((name) =>
    collisionBoxesFor(objectNamed(world, name), clearance),
  );

  for (let index = 0; index <= 40; index += 1) {
    const progress =
      journeyStart + ((journeyEnd - journeyStart) * index) / 40;
    const camera = sampleFacilityCamera(progress, "desktop");
    const position = new THREE.Vector3(
      camera.position.x,
      camera.position.y,
      camera.position.z,
    );
    for (const obstacle of obstacles) {
      assert.equal(
        obstacle.bounds.containsPoint(position),
        false,
        `${obstacle.label} blocks the camera at journey ${progress.toFixed(3)}`,
      );
    }
  }
}

function instanceIsRenderable(mesh: ThreeTypes.InstancedMesh): boolean {
  const matrix = new THREE.Matrix4();
  for (let index = 0; index < mesh.count; index += 1) {
    mesh.getMatrixAt(index, matrix);
    if (Math.abs(matrix.determinant()) > 1e-8) return true;
  }
  return false;
}

describe("living shanshui facility world", () => {
  it("builds all nine ordered landscape zones with their authored bounds", () => {
    const world = createFacilityWorld(desktopTuning);
    assert.equal(world.root.name, "living-shanshui-handscroll");
    assert.deepEqual(
      Object.keys(world.zones),
      expectedZones.map(([zoneId]) => zoneId),
    );

    expectedZones.forEach(([zoneId, expectedBounds]) => {
      const zone = world.zones[zoneId];
      assert.equal(zone.parent, world.root);
      assert.deepEqual(zone.userData.bounds, expectedBounds);
      assert.equal(Object.isFrozen(zone.userData.bounds), true);
    });
    world.dispose();
  });

  it("reserves one signature Points surface for the Splash Ink depth reveal", () => {
    const world = createFacilityWorld(desktopTuning);
    const pointSurfaces: ThreeTypes.Points[] = [];
    world.root.traverse((object) => {
      if (object instanceof THREE.Points) pointSurfaces.push(object);
    });

    assert.equal(pointSurfaces.length, 1);
    const [surface] = pointSurfaces;
    assert.equal(surface.name, "shanshui-splash-spatial-ink-surface");
    assert.equal(surface.userData.signature, true);
    assert.ok(surface.material instanceof THREE.ShaderMaterial);
    assert.equal(
      world.zones["dissolution-observatory"].getObjectByName(surface.name),
      surface,
    );
    world.dispose();
  });

  it("places the river and persistent traveller boat inside the authored hero view", () => {
    const world = createFacilityWorld(desktopTuning);
    world.update(sampleFacilityNarrative(0, "desktop"), 0, 0);
    const frustum = authoredFrustum(0);
    const river = objectNamed(world, "shanshui-hero-river");
    const boat = objectNamed(world, "shanshui-traveler-boat");

    assert.equal(
      frustum.intersectsBox(new THREE.Box3().setFromObject(river)),
      true,
    );
    assert.equal(frustum.containsPoint(worldPosition(boat)), true);
    world.dispose();
  });

  it("updates the boat and KOTA clarification deterministically while static peaks stay fixed", () => {
    const world = createFacilityWorld(desktopTuning);
    const boat = objectNamed(world, "shanshui-traveler-boat");
    const ripple = objectNamed(world, "shanshui-kota-clarified-ripple");
    const peaks = instancedNamed(world, "shanshui-hero-distant-peaks");
    const staticInstances = Array.from(peaks.instanceMatrix.array);
    const staticVertices = Array.from(
      peaks.geometry.getAttribute("position").array,
    );
    const sample = sampleFacilityNarrative(0.39, "desktop");

    world.update(sample, 12, 0.8);
    const firstBoat = {
      position: boat.position.toArray(),
      heading: boat.rotation.y,
    };
    const firstRipple = {
      position: ripple.position.toArray(),
      scale: ripple.scale.toArray(),
      visible: ripple.visible,
    };

    world.update(sample, 12, 0.8);
    assert.deepEqual(
      { position: boat.position.toArray(), heading: boat.rotation.y },
      firstBoat,
    );
    assert.deepEqual(
      {
        position: ripple.position.toArray(),
        scale: ripple.scale.toArray(),
        visible: ripple.visible,
      },
      firstRipple,
    );
    assert.deepEqual(Array.from(peaks.instanceMatrix.array), staticInstances);
    assert.deepEqual(
      Array.from(peaks.geometry.getAttribute("position").array),
      staticVertices,
    );

    world.update(sampleFacilityNarrative(0.42, "desktop"), 14, 1);
    assert.notDeepEqual(boat.position.toArray(), firstBoat.position);
    assert.notDeepEqual(ripple.position.toArray(), firstRipple.position);
    assert.deepEqual(Array.from(peaks.instanceMatrix.array), staticInstances);
    world.dispose();
  });

  it("keeps the KOTA gorge camera clear of authored mountains and listening stones", () => {
    const world = createFacilityWorld(desktopTuning);
    assertCameraCorridorClear(
      world,
      [
        "shanshui-threshold-standing-stones",
        "shanshui-kota-gorge-walls",
        "shanshui-kota-ambiguity-stone-left",
        "shanshui-kota-ambiguity-stone-right",
        "shanshui-kota-blocked-channel-stones",
      ],
      0.2,
      0.44,
      0.42,
    );
    world.dispose();
  });

  it("keeps the ARCHON mountain-pass camera clear of peaks, summit, and bridges", () => {
    const world = createFacilityWorld(desktopTuning);
    assertCameraCorridorClear(
      world,
      [
        "shanshui-archon-vertical-pass",
        "shanshui-archon-coordinator-summit",
        "shanshui-archon-coordinator-stone",
        "shanshui-archon-stone-bridge-network",
        "shanshui-archon-blocked-route-cairn",
      ],
      0.5,
      0.7,
      0.42,
    );
    world.dispose();
  });

  it("uses smaller mobile bamboo, bird, and paper budgets without losing primary motifs", () => {
    const desktop = createFacilityWorld(desktopTuning);
    const mobile = createFacilityWorld(mobileTuning);

    for (const secondaryName of [
      "shanshui-kota-blocked-channel-stones",
      "shanshui-kota-unsafe-ripple",
      "shanshui-audiobook-river-stones",
    ]) {
      assert.ok(
        desktop.root.getObjectByName(secondaryName),
        `${secondaryName} belongs to the desktop composition`,
      );
      assert.equal(
        Boolean(mobile.root.getObjectByName(secondaryName)),
        false,
        `${secondaryName} is removed from the mobile composition`,
      );
    }

    for (const primaryName of [
      "shanshui-kota-ambiguity-stone-left",
      "shanshui-kota-clarified-ripple",
      "shanshui-audiobook-scroll-river",
      "shanshui-audiobook-deckled-sheets",
      "shanshui-archon-coordinator-summit",
      "shanshui-archon-ink-bird-flock",
      "shanshui-splash-fish-shadows",
      "shanshui-traveler-boat",
    ]) {
      assert.ok(
        mobile.root.getObjectByName(primaryName),
        `${primaryName} remains legible on mobile`,
      );
    }

    for (const bambooName of [
      "shanshui-threshold-bamboo-stalks",
      "shanshui-threshold-bamboo-leaves",
      "shanshui-kota-listening-bamboo-stalks",
      "shanshui-kota-listening-bamboo-leaves",
    ]) {
      assert.ok(
        instancedNamed(mobile, bambooName).count <
          instancedNamed(desktop, bambooName).count,
        `${bambooName} has a strictly smaller mobile budget`,
      );
    }

    const desktopPaper =
      instancedNamed(desktop, "shanshui-audiobook-layered-paper-terraces")
        .count +
      instancedNamed(desktop, "shanshui-audiobook-deckled-sheets").count;
    const mobilePaper =
      instancedNamed(mobile, "shanshui-audiobook-layered-paper-terraces")
        .count +
      instancedNamed(mobile, "shanshui-audiobook-deckled-sheets").count;
    assert.ok(mobilePaper < desktopPaper);
    assert.ok(
      instancedNamed(mobile, "shanshui-archon-ink-bird-flock").count <
        instancedNamed(desktop, "shanshui-archon-ink-bird-flock").count,
    );
    assert.ok(
      instancedNamed(mobile, "shanshui-splash-fish-shadows").count <
        instancedNamed(desktop, "shanshui-splash-fish-shadows").count,
    );

    desktop.dispose();
    mobile.dispose();
  });

  it("keeps one boat for the full journey and confines wildlife to its semantic chapter", () => {
    const world = createFacilityWorld(desktopTuning);
    const boats: ThreeTypes.Object3D[] = [];
    const birds: ThreeTypes.Object3D[] = [];
    const fish: ThreeTypes.Object3D[] = [];
    world.root.traverse((object) => {
      if (object.name === "shanshui-traveler-boat") boats.push(object);
      if (/bird/i.test(object.name)) birds.push(object);
      if (/fish/i.test(object.name)) fish.push(object);
    });

    assert.equal(boats.length, 1);
    assert.deepEqual(
      birds.map((object) => object.name),
      ["shanshui-archon-ink-bird-flock"],
    );
    assert.deepEqual(
      fish.map((object) => object.name),
      ["shanshui-splash-fish-shadows"],
    );
    assert.equal(
      world.zones["orchestration-atrium"].getObjectByName(birds[0].name),
      birds[0],
    );
    assert.equal(
      world.zones["dissolution-observatory"].getObjectByName(fish[0].name),
      fish[0],
    );

    const boat = boats[0];
    let previousDepth = Infinity;
    for (const progress of [0, 1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7, 1]) {
      world.update(sampleFacilityNarrative(progress, "desktop"), progress * 20, 0.8);
      assert.equal(world.root.getObjectByName(boat.name), boat);
      assert.equal(boat.parent, world.root);
      assert.equal(boat.visible, true);
      assert.ok(Number.isFinite(boat.position.x));
      assert.ok(boat.position.z < previousDepth);
      previousDepth = boat.position.z;
    }

    const birdFlock = birds[0] as ThreeTypes.InstancedMesh;
    const fishSchool = fish[0] as ThreeTypes.InstancedMesh;
    world.update(sampleFacilityNarrative(4 / 7, "desktop"), 8, 0.8);
    assert.equal(birdFlock.visible, true);
    assert.equal(instanceIsRenderable(fishSchool), false);
    world.update(sampleFacilityNarrative(5 / 7, "desktop"), 10, 0.8);
    assert.equal(birdFlock.visible, false);
    assert.equal(instanceIsRenderable(fishSchool), true);
    world.dispose();
  });

  it("disposes every rendered geometry and material exactly once", () => {
    const world = createFacilityWorld(desktopTuning);
    const host = new THREE.Group();
    host.add(world.root);
    const geometryDisposals = new Map<ThreeTypes.BufferGeometry, number>();
    const materialDisposals = new Map<ThreeTypes.Material, number>();
    world.root.traverse((object) => {
      const renderable = object as ThreeTypes.Mesh;
      if (renderable.geometry && !geometryDisposals.has(renderable.geometry)) {
        geometryDisposals.set(renderable.geometry, 0);
        renderable.geometry.addEventListener("dispose", () => {
          geometryDisposals.set(
            renderable.geometry,
            (geometryDisposals.get(renderable.geometry) ?? 0) + 1,
          );
        });
      }
      if (renderable.material) {
        const materials = Array.isArray(renderable.material)
          ? renderable.material
          : [renderable.material];
        for (const material of materials) {
          if (materialDisposals.has(material)) continue;
          materialDisposals.set(material, 0);
          material.addEventListener("dispose", () => {
            materialDisposals.set(
              material,
              (materialDisposals.get(material) ?? 0) + 1,
            );
          });
        }
      }
    });

    assert.ok(geometryDisposals.size > 0);
    assert.ok(materialDisposals.size > 0);
    world.dispose();
    world.dispose();
    geometryDisposals.forEach((count) => assert.equal(count, 1));
    materialDisposals.forEach((count) => assert.equal(count, 1));
    assert.equal(world.root.parent, null);
    assert.equal(host.children.includes(world.root), false);
  });
});
