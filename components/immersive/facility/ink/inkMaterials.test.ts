import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import type * as ThreeTypes from "three";
import { INK } from "./inkLadder";

process.env.NODE_PATH = path.resolve(process.cwd(), "node_modules");
const nodeModule = require("node:module") as {
  readonly Module: { _initPaths(): void };
};
nodeModule.Module._initPaths();
const THREE = require("three") as typeof ThreeTypes;
const {
  createInkMaterial,
  isInkMaterial,
  syncInkMaterialAtmosphere,
} = require("./inkMaterials") as typeof import("./inkMaterials");

describe("ink material", () => {
  it("creates an unlit shader material wired to the ink ladder and grain", () => {
    const fog = new THREE.Color(INK.paper);
    const material = createInkMaterial({
      inkColor: INK.zhong,
      valueBias: 0.2,
      cun: "hemp",
      cunStrength: 0.8,
      fogColor: fog,
      fogDensity: 0.012,
    });
    assert.ok(material.isShaderMaterial);
    assert.ok(isInkMaterial(material));
    assert.equal(material.lights, false);
    assert.equal(material.transparent, false);
    assert.equal(material.uniforms.uInk.value.getHexString(), new THREE.Color(INK.zhong).getHexString());
    assert.equal(material.uniforms.uPaper.value.getHexString(), new THREE.Color(INK.paper).getHexString());
    assert.equal(material.uniforms.uFogColor.value, fog);
    assert.equal(material.uniforms.uFogDensity.value, 0.012);
    assert.ok(material.uniforms.uGrain.value.isDataTexture);
    assert.equal(material.uniforms.uCunScale.value, 3.1);
    assert.match(material.vertexShader, /USE_INSTANCING/);
    assert.match(material.fragmentShader, /cunDeposit/);
    assert.match(material.fragmentShader, /uGrain/);
    assert.doesNotMatch(material.fragmentShader, /Math\.random/);
  });

  it("supports cun-free materials and atmosphere sync", () => {
    const material = createInkMaterial({
      inkColor: INK.dan,
      fogColor: new THREE.Color(INK.paper),
      fogDensity: 0.01,
    });
    assert.equal(material.uniforms.uCunStrength.value, 0);
    syncInkMaterialAtmosphere(material, new THREE.Color(INK.qing), 0.02);
    assert.equal(material.uniforms.uFogColor.value.getHexString(), new THREE.Color(INK.qing).getHexString());
    assert.equal(material.uniforms.uFogDensity.value, 0.02);
    assert.equal(isInkMaterial(new THREE.MeshBasicMaterial()), false);
  });
});
