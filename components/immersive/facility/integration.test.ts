import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function readSource(relativePath: string): string {
  return readFileSync(relativePath, "utf8");
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
});
