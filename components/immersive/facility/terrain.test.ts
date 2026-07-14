import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import type * as ThreeTypes from "three";
import { getThreeSceneTuning } from "../../threeSceneTuning";

process.env.NODE_PATH = path.resolve(process.cwd(), "node_modules");
const nodeModule = require("node:module") as {
  readonly Module: { _initPaths(): void };
};
nodeModule.Module._initPaths();
const THREE = require("three") as typeof ThreeTypes;
const {
  createFacilityTerrain,
  createFacilityTerrainUniforms,
} = require("./terrain") as typeof import("./terrain");

describe("living Shanshui ink terrain", () => {
  it("covers the complete route with deterministic river and mountain-pass semantics", () => {
    const tuning = getThreeSceneTuning({
      deviceMemory: 8,
      devicePixelRatio: 2,
      hardwareConcurrency: 12,
      isCoarsePointer: false,
      reducedMotion: false,
      viewportWidth: 1440,
    });
    const uniforms = createFacilityTerrainUniforms({
      elevation: 0.7,
      fogColor: new THREE.Color("#10191b"),
      fogDensity: 0.012,
      roughness: 0.5,
      visibility: 1,
    });
    const terrain = createFacilityTerrain(tuning, uniforms);

    assert.equal(terrain.mesh.name, "shanshui-ink-terrain");
    assert.ok(terrain.geometry.parameters.width >= 110);
    assert.ok(terrain.geometry.parameters.height >= 190);
    assert.ok(terrain.mesh.position.z < 0);
    assert.match(terrain.material.vertexShader, /riverChannel/);
    assert.match(terrain.material.vertexShader, /mountainPassMask/);
    assert.match(terrain.material.vertexShader, /routeCenter/);
    assert.match(terrain.material.vertexShader, /vRiver/);
    assert.match(terrain.material.fragmentShader, /paperGrain/);
    assert.match(terrain.material.fragmentShader, /inkValue/);
    assert.match(terrain.material.fragmentShader, /mineralStone/);
    assert.match(terrain.material.fragmentShader, /vRiver/);
    assert.doesNotMatch(terrain.material.vertexShader, /Math\.random/);
    assert.doesNotMatch(terrain.material.fragmentShader, /Math\.random/);
    assert.equal(terrain.material.uniforms.uTime.value, 5);
    terrain.dispose();
  });

  it("releases geometry and material once", () => {
    const tuning = getThreeSceneTuning({
      devicePixelRatio: 1,
      hardwareConcurrency: 4,
      isCoarsePointer: true,
      reducedMotion: true,
      viewportWidth: 390,
    });
    const terrain = createFacilityTerrain(
      tuning,
      createFacilityTerrainUniforms({
        elevation: 0.4,
        fogColor: new THREE.Color("#10191b"),
        fogDensity: 0.014,
        roughness: 0.2,
        visibility: 0.7,
      }),
    );
    let disposals = 0;
    terrain.geometry.addEventListener("dispose", () => (disposals += 1));
    terrain.material.addEventListener("dispose", () => (disposals += 1));
    terrain.dispose();
    terrain.dispose();
    assert.equal(disposals, 2);
  });
});
