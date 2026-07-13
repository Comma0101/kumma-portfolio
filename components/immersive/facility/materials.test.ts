import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import type * as ThreeTypes from "three";

process.env.NODE_PATH = path.resolve(process.cwd(), "node_modules");
const nodeModule = require("node:module") as {
  readonly Module: { _initPaths(): void };
};
nodeModule.Module._initPaths();
const THREE = require("three") as typeof ThreeTypes;
const { createFacilityMaterials } = require("./materials") as typeof import("./materials");

describe("facility Atlas materials", () => {
  it("uses restrained lit surfaces for every signature material", () => {
    const resources = createFacilityMaterials();
    assert.deepEqual(Object.keys(resources.materials), [
      "terrain",
      "shell",
      "steel",
      "paper",
      "signal",
      "ink",
      "guide",
    ]);
    for (const material of Object.values(resources.materials)) {
      assert.ok(material instanceof THREE.MeshStandardMaterial);
      assert.equal(material instanceof THREE.MeshBasicMaterial, false);
      assert.equal(material.transparent, false);
    }
    assert.ok(resources.materials.signal.emissiveIntensity > 0);
    assert.ok(resources.materials.signal.emissiveIntensity < 1);
    resources.dispose();
  });

  it("disposes shared materials exactly once", () => {
    const resources = createFacilityMaterials();
    let disposals = 0;
    for (const material of Object.values(resources.materials)) {
      material.addEventListener("dispose", () => {
        disposals += 1;
      });
    }
    resources.dispose();
    resources.dispose();
    assert.equal(disposals, Object.keys(resources.materials).length);
  });
});
