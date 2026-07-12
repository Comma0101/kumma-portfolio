import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import type * as ThreeTypes from "three";
import { getThreeSceneTuning } from "../threeSceneTuning";
import type { SceneGroupKey, SceneGroupWeights } from "./types";

// Unit tests compile into a temporary directory outside the workspace. Add the
// package-local dependencies to this process's CJS resolver before loading the
// Three-backed factory; no renderer or WebGL context is created.
process.env.NODE_PATH = path.resolve(process.cwd(), "node_modules");
const nodeModule = require("node:module") as {
  readonly Module: { _initPaths(): void };
};
nodeModule.Module._initPaths();
const THREE = require("three") as typeof ThreeTypes;
const { createSceneGroups } = require("./createSceneGroups") as typeof import("./createSceneGroups");

const groupKeys: readonly SceneGroupKey[] = [
  "horizon",
  "signals",
  "voice",
  "document",
  "orchestration",
  "splats",
  "measurement",
];

const desktopTuning = getThreeSceneTuning({
  deviceMemory: 8,
  devicePixelRatio: 2,
  hardwareConcurrency: 12,
  isCoarsePointer: false,
  reducedMotion: false,
  viewportWidth: 1440,
});

function objectSignature(root: ThreeTypes.Object3D): readonly string[] {
  const signature: string[] = [];

  root.traverse((object) => {
    const renderable = object as ThreeTypes.Object3D & {
      geometry?: ThreeTypes.BufferGeometry;
      count?: number;
      instanceMatrix?: ThreeTypes.InstancedBufferAttribute;
    };
    const position = renderable.geometry?.getAttribute("position");
    const positionSample = position
      ? Array.from(position.array.slice(0, 12)).map((value) =>
          Number(value).toFixed(4),
        )
      : [];
    const matrixSample = renderable.instanceMatrix
      ? Array.from(renderable.instanceMatrix.array.slice(0, 16)).map((value) =>
          Number(value).toFixed(4),
        )
      : [];

    signature.push(
      JSON.stringify({
        count: renderable.count ?? null,
        matrixSample,
        name: object.name,
        position: object.position.toArray().map((value) => value.toFixed(4)),
        positionSample,
        type: object.type,
      }),
    );
  });

  return signature;
}

function collectResources(root: ThreeTypes.Object3D): {
  readonly geometries: Set<ThreeTypes.BufferGeometry>;
  readonly materials: Set<ThreeTypes.Material>;
} {
  const geometries = new Set<ThreeTypes.BufferGeometry>();
  const materials = new Set<ThreeTypes.Material>();

  root.traverse((object) => {
    const renderable = object as ThreeTypes.Object3D & {
      geometry?: ThreeTypes.BufferGeometry;
      material?: ThreeTypes.Material | ThreeTypes.Material[];
    };

    if (renderable.geometry) {
      geometries.add(renderable.geometry);
    }

    if (Array.isArray(renderable.material)) {
      renderable.material.forEach((material) => materials.add(material));
    } else if (renderable.material) {
      materials.add(renderable.material);
    }
  });

  return { geometries, materials };
}

describe("createSceneGroups", () => {
  it("creates one typed common world with all seven approved mechanisms", () => {
    const world = createSceneGroups(desktopTuning);

    assert.ok(world.root instanceof THREE.Group);
    assert.deepEqual(Object.keys(world.groups), groupKeys);
    assert.equal(world.root.children.length, groupKeys.length);

    const expectedMechanisms: Readonly<Record<SceneGroupKey, string>> = {
      horizon: "terrain beacons",
      signals: "converging signal rails",
      voice: "voice tunnel rings and waveform",
      document: "document chunks and queue",
      orchestration: "orchestration nodes and routed trace",
      splats: "sparse ink depth volume",
      measurement: "measurement grid and ledger lines",
    };

    for (const key of groupKeys) {
      const group = world.groups[key];
      assert.equal(group.parent, world.root);
      assert.equal(group.userData.mechanism, expectedMechanisms[key]);
      assert.ok(group.children.length > 0, `${key} must contain visible geometry`);
    }

    assert.ok(
      world.groups.horizon.children.some(
        (child) => (child as ThreeTypes.InstancedMesh).isInstancedMesh,
      ),
    );
    assert.ok(world.groups.signals.getObjectByProperty("type", "LineSegments"));
    assert.ok(world.groups.signals.getObjectByProperty("type", "Points"));
    assert.ok(
      world.groups.voice.children.some(
        (child) => (child as ThreeTypes.InstancedMesh).isInstancedMesh,
      ),
    );
    assert.ok(
      world.groups.document.children.some(
        (child) => (child as ThreeTypes.InstancedMesh).isInstancedMesh,
      ),
    );
    assert.ok(
      world.groups.orchestration.getObjectByProperty("type", "LineSegments"),
    );
    assert.ok(world.groups.splats.getObjectByProperty("type", "Points"));
    assert.ok(world.groups.measurement.getObjectByProperty("type", "LineSegments"));

    world.dispose();
  });

  it("uses profile budgets as deterministic construction bounds", () => {
    const first = createSceneGroups(desktopTuning);
    const second = createSceneGroups(desktopTuning);

    assert.deepEqual(first.counts, {
      horizon: desktopTuning.groupBudgets.beacons,
      signals: desktopTuning.groupBudgets.signals,
      voice: desktopTuning.groupBudgets.voice,
      document: desktopTuning.groupBudgets.document,
      orchestration: desktopTuning.groupBudgets.orchestration,
      splats: desktopTuning.groupBudgets.splats,
      measurement: desktopTuning.groupBudgets.measurement,
    });
    assert.deepEqual(first.counts, second.counts);
    assert.deepEqual(objectSignature(first.root), objectSignature(second.root));

    first.dispose();
    second.dispose();
  });

  it("moves at most the two strongest mechanisms and freezes at zero motion", () => {
    const world = createSceneGroups(desktopTuning);
    const weights: SceneGroupWeights = {
      horizon: 0.03,
      signals: 0.28,
      voice: 0.54,
      document: 0.04,
      orchestration: 0.04,
      splats: 0.03,
      measurement: 0.04,
    };

    world.update(weights, 2, 1);

    const moving = groupKeys.filter(
      (key) => world.groups[key].userData.motionActive === true,
    );
    assert.deepEqual(moving, ["signals", "voice"]);

    world.update(weights, 4, 0);
    const frozen = groupKeys.map((key) => ({
      position: world.groups[key].position.toArray(),
      rotation: world.groups[key].rotation.toArray(),
    }));
    world.update(weights, 9, 0);
    assert.deepEqual(
      groupKeys.map((key) => ({
        position: world.groups[key].position.toArray(),
        rotation: world.groups[key].rotation.toArray(),
      })),
      frozen,
    );

    world.dispose();
  });

  it("disposes each shared resource exactly once and is idempotent", () => {
    const world = createSceneGroups(desktopTuning);
    const { geometries, materials } = collectResources(world.root);
    const calls = new Map<
      ThreeTypes.BufferGeometry | ThreeTypes.Material,
      number
    >();

    for (const resource of [...geometries, ...materials]) {
      calls.set(resource, 0);
      resource.dispose = () => {
        calls.set(resource, (calls.get(resource) ?? 0) + 1);
      };
    }

    world.dispose();
    world.dispose();

    assert.ok(geometries.size > 0);
    assert.ok(materials.size > 0);
    assert.ok([...calls.values()].every((count) => count === 1));
  });

  it("constructs procedurally without random placement or runtime assets", () => {
    const source = readFileSync(
      path.resolve(process.cwd(), "components/immersive/createSceneGroups.ts"),
      "utf8",
    );

    assert.doesNotMatch(source, /Math\.random|TextureLoader|fetch\(|https?:\/\//);
  });
});
