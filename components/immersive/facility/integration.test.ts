import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { immersiveStageIds } from "../immersiveStages";
import { facilityChapters } from "./narrative";

function readSource(relativePath: string): string {
  return readFileSync(relativePath, "utf8");
}

function readProductionSources(directory: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return readProductionSources(entryPath);
      if (!/\.(?:ts|tsx)$/.test(entry.name) || entry.name.endsWith(".test.ts")) {
        return [];
      }
      return [readFileSync(entryPath, "utf8")];
    })
    .join("\n");
}

describe("carved facility production integration", () => {
  it("uses the facility world, narrative, and camera as the live scene", () => {
    const source = readSource("components/ThreeScene.tsx");

    assert.match(source, /createFacilityWorld/);
    assert.match(source, /sampleFacilityNarrative/);
    assert.match(source, /sampleFacilityCamera/);
    assert.doesNotMatch(source, /createSceneGroups|sampleImmersiveJourney/);
    assert.equal(source.match(/new THREE\.WebGLRenderer/g)?.length, 1);
    assert.equal(source.match(/new THREE\.PerspectiveCamera/g)?.length, 1);
  });

  it("samples narrative from continuous route progress", () => {
    const source = readSource(
      "components/immersive/useImmersiveScroll.ts",
    );

    assert.match(source, /sampleFacilityNarrative\(\s*routeProgress,/);
    assert.match(source, /resolveFacilityRouteProgress/);
    assert.equal(source.match(/useImmersiveScroll\(/g)?.length, 1);
  });

  it("wakes for same-stage route changes and keeps reduced motion static", () => {
    const source = readSource("components/ThreeScene.tsx");

    assert.match(
      source,
      /previous\.routeProgress\s*!==\s*next\.routeProgress/,
    );
    assert.match(source, /const renderStaticFrame/);
    assert.match(source, /applyFacilitySample\([^;]+true\)/s);

    const staticFrame = source.slice(
      source.indexOf("const renderStaticFrame"),
      source.indexOf("const renderAnimatedFrame"),
    );
    assert.doesNotMatch(staticFrame, /uTime\.value\s*\+=/);
  });

  it("decays scroll energy and stops requesting frames after convergence", () => {
    const source = readSource("components/ThreeScene.tsx");
    const loop = source.slice(
      source.indexOf("const loop"),
      source.indexOf("const startLoop"),
    );

    assert.match(source, /nextMotionEnergy/);
    assert.match(source, /nextFrameSettlement/);
    assert.match(source, /motionEnergy/);
    assert.match(source, /stableFrameCount/);
    assert.match(loop, /settlement\.shouldContinue/);
    assert.match(loop, /requestAnimationFrame\(loop\)/);
    assert.match(source, /stopLoop\(["']settled["']\)/);
    assert.doesNotMatch(source, /uniforms\.uTime\.value\s*\+=/);
    assert.doesNotMatch(source, /sceneFog\.color\.distanceTo/);
    assert.match(source, /sceneFog\.color\.r\s*-\s*fogTarget\.r/);
  });

  it("keeps context restoration candidate-first", () => {
    const source = readSource("components/ThreeScene.tsx");
    const restored = source.slice(
      source.indexOf("const handleContextRestored"),
      source.indexOf("return () =>", source.indexOf("const handleContextRestored")),
    );

    assert.match(source, /swapResourceCandidate/);
    assert.match(restored, /rebuildSceneResourcesAfterContextRestore/);
    assert.ok(
      restored.indexOf("rebuildSceneResourcesAfterContextRestore") <
        restored.indexOf("renderStaticFrame"),
    );
  });

  it("opens the project chapters instead of duplicating scene graphics", () => {
    const source = readSource("components/home/ChapterIndex.tsx");

    assert.doesNotMatch(source, /SystemViz|vizBySlug|StaticMechanism/);
    assert.match(source, /project\.evidence\.input/);
    assert.match(source, /project\.evidence\.transform/);
    assert.match(source, /project\.evidence\.output/);
    assert.match(source, /project\.evidence\.guardrail/);
  });

  it("uses the facility narrative as the single ordered stage contract", () => {
    assert.deepEqual(
      immersiveStageIds,
      facilityChapters.map((chapter) => chapter.stageId),
    );
  });

  it("keeps obsolete abstract pattern APIs out of production", () => {
    const productionImmersiveSource = [
      readProductionSources("components/immersive"),
      readSource("components/ThreeScene.tsx"),
      readSource("components/threeSceneTuning.ts"),
    ].join("\n");

    for (const forbidden of [
      "createSceneGroups",
      "SceneGroupKey",
      "SceneGroupWeights",
      "dampSceneGroupWeights",
      "groupBudgets",
      "voice-tunnel-rings",
      "orchestration-nodes",
      "measurement-coordinate-grid",
      "FacilityGreyboxZoneId",
    ]) {
      assert.doesNotMatch(productionImmersiveSource, new RegExp(forbidden));
    }
  });
});
