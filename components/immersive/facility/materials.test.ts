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

describe("living Shanshui materials", () => {
  it("uses the exact opaque, lit material vocabulary for the handscroll", () => {
    const resources = createFacilityMaterials();
    assert.deepEqual(Object.keys(resources.materials), [
      "terrain",
      "shell",
      "steel",
      "paper",
      "signal",
      "ink",
      "guide",
      "mountain",
      "stone",
      "bamboo",
      "water",
      "cinnabar",
      "mountainNear",
      "mountainFar",
    ]);

    const standardMaterialKeys = [
      "terrain",
      "shell",
      "steel",
      "paper",
      "signal",
      "ink",
      "guide",
      "water",
      "cinnabar",
    ] as const;
    const toonMaterialKeys = ["bamboo"] as const;

    for (const key of standardMaterialKeys) {
      assert.ok(
        resources.materials[key] instanceof THREE.MeshStandardMaterial,
        `${key} must remain a physically lit MeshStandardMaterial`,
      );
    }
    for (const key of toonMaterialKeys) {
      assert.ok(
        resources.materials[key] instanceof THREE.MeshToonMaterial,
        `${key} must use ink-value toon banding`,
      );
    }
    for (const key of ["mountain", "stone", "mountainNear", "mountainFar"] as const) {
      assert.ok(
        resources.materials[key] instanceof THREE.ShaderMaterial,
        `${key} must be an unlit ink ShaderMaterial`,
      );
      assert.equal(resources.materials[key].lights, false);
    }
    for (const material of Object.values(resources.materials)) {
      assert.equal(material instanceof THREE.MeshBasicMaterial, false);
      assert.equal(material.transparent, false);
    }

    const gradientMap = resources.materials.bamboo.gradientMap;
    assert.ok(gradientMap instanceof THREE.DataTexture);
    assert.equal(gradientMap.image.width, 12);
    assert.equal(gradientMap.image.height, 1);
    assert.deepEqual(Array.from(gradientMap.image.data as Uint8Array), [
      32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 196, 220,
    ]);
    assert.equal(gradientMap.minFilter, THREE.NearestFilter);
    assert.equal(gradientMap.magFilter, THREE.NearestFilter);

    assert.ok(resources.materials.signal.emissiveIntensity > 0);
    assert.ok(resources.materials.signal.emissiveIntensity < 1);
    assert.ok(resources.materials.cinnabar.emissiveIntensity > 0);
    assert.ok(resources.materials.cinnabar.emissiveIntensity < 1);
    const mountainInk = resources.materials.mountain.uniforms.uInk
      .value as InstanceType<typeof THREE.Color>;
    const mountainHsl = { h: 0, s: 0, l: 0 };
    const paperHsl = { h: 0, s: 0, l: 0 };
    mountainInk.getHSL(mountainHsl);
    resources.materials.paper.color.getHSL(paperHsl);
    assert.ok(
      paperHsl.l - mountainHsl.l >= 0.45,
      "paper forms need clear value separation from ink mountains",
    );
    resources.dispose();
  });

  it("disposes shared materials and the shared toon gradient exactly once", () => {
    const resources = createFacilityMaterials();
    let materialDisposals = 0;
    let gradientDisposals = 0;
    for (const material of Object.values(resources.materials)) {
      material.addEventListener("dispose", () => {
        materialDisposals += 1;
      });
    }
    resources.materials.bamboo.gradientMap?.addEventListener("dispose", () => {
      gradientDisposals += 1;
    });
    resources.dispose();
    resources.dispose();
    assert.equal(
      materialDisposals,
      Object.keys(resources.materials).length,
    );
    assert.equal(gradientDisposals, 1);
  });
});
