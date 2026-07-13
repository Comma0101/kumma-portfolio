import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { immersiveStageIds } from "./immersiveStages";
import {
  JOURNEY_ENTRY_VIEWPORT_RATIO,
  JOURNEY_EXIT_VIEWPORT_RATIO,
  JOURNEY_SETTLE_VIEWPORT_RATIO,
  resolveFacilityRouteProgress,
  resolveJourneyProgress,
  resolveJourneyState,
  sectionProgress,
  transitionWindowForAnchor,
  validateImmersiveAnchorOrder,
  type ImmersiveAnchorRect,
} from "./scrollProgress";

const VIEWPORT_HEIGHT = 800;

function makeAnchors(
  tops: readonly number[] = immersiveStageIds.map((_, index) => index * 1000),
  heights: readonly number[] = immersiveStageIds.map(() => 600),
): readonly ImmersiveAnchorRect[] {
  return immersiveStageIds.map((id, index) => ({
    id,
    top: tops[index],
    height: heights[index],
  }));
}

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("sectionProgress", () => {
  it("preserves the documented section boundary examples", () => {
    const rect = { top: 100, height: 600 };

    assert.equal(sectionProgress(rect, 0, 800), 0);
    assert.equal(sectionProgress(rect, 1000, 800), 1);
  });

  it("normalizes zero, negative, non-finite, and overflowing geometry", () => {
    const cases = [
      sectionProgress({ top: -10, height: -5 }, -20, 0),
      sectionProgress({ top: Number.NaN, height: Number.NaN }, Number.NaN, Number.NaN),
      sectionProgress({ top: Number.POSITIVE_INFINITY, height: Number.NEGATIVE_INFINITY }, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY),
      sectionProgress({ top: Number.MAX_VALUE, height: Number.MAX_VALUE }, Number.MAX_VALUE, Number.MAX_VALUE),
    ];

    for (const progress of cases) {
      assert.ok(Number.isFinite(progress));
      assert.ok(progress >= 0 && progress <= 1);
    }
  });
});

describe("immersive anchor validation", () => {
  it("accepts only the exact ordered spatial-stage contract", () => {
    const anchors = makeAnchors();
    assert.equal(validateImmersiveAnchorOrder(anchors), true);
    assert.deepEqual(
      anchors.map((anchor) => anchor.id),
      [
        "hero",
        "proof",
        "kota",
        "audiobook",
        "archon",
        "splash-ink",
        "research-labs",
        "contact",
      ],
    );

    assert.equal(validateImmersiveAnchorOrder(anchors.slice(0, -1)), false);
    assert.equal(
      validateImmersiveAnchorOrder(
        anchors.map((anchor, index) =>
          index === 2 ? { ...anchor, id: "proof" } : anchor,
        ),
      ),
      false,
    );
    assert.equal(
      validateImmersiveAnchorOrder([
        anchors[0],
        anchors[2],
        anchors[1],
        ...anchors.slice(3),
      ]),
      false,
    );
    assert.equal(
      validateImmersiveAnchorOrder([
        ...anchors.slice(0, 7),
        { ...anchors[7], id: "unknown" },
      ]),
      false,
    );
  });

  it("fails safely for invalid runtime anchors", () => {
    const invalid = makeAnchors().slice(0, -1);
    const resolution = resolveJourneyState(invalid, 1200, VIEWPORT_HEIGHT);

    assert.equal(resolution.valid, false);
    assert.equal(resolution.inJourney, false);
    assert.equal(resolution.journeyProgress, 0);
    assert.equal(resolveJourneyProgress(invalid, 1200, VIEWPORT_HEIGHT), 0);
  });
});

describe("journey geometry", () => {
  it("starts at zero and ends at one", () => {
    const anchors = makeAnchors();

    assert.equal(resolveJourneyProgress(anchors, 0, VIEWPORT_HEIGHT), 0);
    assert.equal(resolveJourneyProgress(anchors, 7200, VIEWPORT_HEIGHT), 1);
  });

  it("publishes an explicit lower-entry and stable-reading-line policy", () => {
    assert.ok(JOURNEY_ENTRY_VIEWPORT_RATIO > JOURNEY_SETTLE_VIEWPORT_RATIO);
    assert.ok(JOURNEY_ENTRY_VIEWPORT_RATIO > 0.5);
    assert.ok(JOURNEY_ENTRY_VIEWPORT_RATIO < 1);
    assert.ok(JOURNEY_SETTLE_VIEWPORT_RATIO > 0);
    assert.ok(JOURNEY_SETTLE_VIEWPORT_RATIO < 0.5);
    assert.ok(JOURNEY_EXIT_VIEWPORT_RATIO > 0);
    assert.ok(JOURNEY_EXIT_VIEWPORT_RATIO <= 0.25);

    const window = transitionWindowForAnchor(
      { top: 1000, height: 600 },
      VIEWPORT_HEIGHT,
    );
    assert.equal(
      window.start,
      1000 - VIEWPORT_HEIGHT * JOURNEY_ENTRY_VIEWPORT_RATIO,
    );
    assert.equal(
      window.end,
      1000 - VIEWPORT_HEIGHT * JOURNEY_SETTLE_VIEWPORT_RATIO,
    );
  });

  it("keeps contact active until one quarter of the footer viewport enters", () => {
    const anchors = makeAnchors(
      [0, 914, 3082, 3697, 4237, 5554, 6308, 12488],
      [914, 551, 594, 521, 1297, 610, 2387, 1083],
    );
    const contact = anchors.at(-1)!;
    const viewportHeight = 900;
    const footerEntryLine =
      viewportHeight * (1 - JOURNEY_EXIT_VIEWPORT_RATIO);
    const exitAt =
      contact.top + contact.height - footerEntryLine;

    assert.equal(
      resolveJourneyState(anchors, contact.top, viewportHeight).inJourney,
      true,
    );
    assert.equal(
      resolveJourneyState(anchors, exitAt - 1, viewportHeight).inJourney,
      true,
    );
    assert.equal(
      resolveJourneyState(anchors, exitAt + 1, viewportHeight).inJourney,
      false,
    );
  });

  it("matches 1280x720 page geometry and re-enters when scrolling in reverse", () => {
    const anchors = makeAnchors(
      [0, 874, 1393, 2211, 6044, 8215, 9816, 11674],
      [874, 519, 818, 3833, 2171, 1602, 1858, 1048],
    );
    const viewportHeight = 720;
    const pageHeight = 13533;
    const maxScroll = pageHeight - viewportHeight;
    const contactBottom = 11674 + 1048;
    const exitAt =
      contactBottom -
      viewportHeight * (1 - JOURNEY_EXIT_VIEWPORT_RATIO);
    const beforeExit = exitAt - 1;
    const afterExit = exitAt + 1;

    assert.ok(contactBottom - beforeExit > viewportHeight * 0.75);
    assert.ok(contactBottom - afterExit < viewportHeight * 0.75);
    assert.equal(
      resolveJourneyState(anchors, afterExit, viewportHeight).inJourney,
      false,
    );

    assert.equal(
      resolveJourneyState(anchors, maxScroll, viewportHeight).inJourney,
      false,
    );
    assert.equal(
      resolveJourneyState(anchors, beforeExit, viewportHeight).inJourney,
      true,
    );
  });

  it("never exits before contact settles for zero, short, or malformed anchors", () => {
    for (const height of [0, 1, 120, Number.NaN, Number.NEGATIVE_INFINITY]) {
      const anchors = makeAnchors(
        [0, 900, 2700, 3100, 5200, 6100, 8200, 11800],
        [0, 1, 0, 900, 20, 0, 1400, height],
      );
      const settleAt = transitionWindowForAnchor(
        anchors.at(-1)!,
        VIEWPORT_HEIGHT,
      ).end;

      assert.equal(
        resolveJourneyState(anchors, settleAt, VIEWPORT_HEIGHT).inJourney,
        true,
      );
      assert.equal(
        resolveJourneyState(anchors, settleAt, VIEWPORT_HEIGHT).journeyProgress,
        1,
      );
    }
  });

  it("holds, transitions, and settles around the next anchor", () => {
    const anchors = makeAnchors();
    const proofWindow = transitionWindowForAnchor(
      anchors[1],
      VIEWPORT_HEIGHT,
    );
    const midpoint = (proofWindow.start + proofWindow.end) / 2;

    assert.equal(
      resolveJourneyProgress(anchors, proofWindow.start - 1, VIEWPORT_HEIGHT),
      0,
    );
    assert.equal(
      resolveJourneyProgress(anchors, proofWindow.start, VIEWPORT_HEIGHT),
      0,
    );
    assert.equal(
      resolveJourneyProgress(anchors, midpoint, VIEWPORT_HEIGHT),
      0.5 / (anchors.length - 1),
    );
    assert.equal(
      resolveJourneyProgress(anchors, proofWindow.end, VIEWPORT_HEIGHT),
      1 / (anchors.length - 1),
    );

    const kotaWindow = transitionWindowForAnchor(
      anchors[2],
      VIEWPORT_HEIGHT,
    );
    const holdY = (proofWindow.end + kotaWindow.start) / 2;
    const hold = resolveJourneyState(anchors, holdY, VIEWPORT_HEIGHT);
    assert.equal(hold.phase, "hold");
    assert.equal(hold.activeStageId, "proof");
    assert.equal(hold.journeyProgress, 1 / (anchors.length - 1));
  });

  it("lands exactly on every stage boundary for spaced anchors", () => {
    const anchors = makeAnchors();

    anchors.slice(1).forEach((anchor, index) => {
      const window = transitionWindowForAnchor(anchor, VIEWPORT_HEIGHT);
      assert.equal(
        resolveJourneyProgress(anchors, window.end, VIEWPORT_HEIGHT),
        (index + 1) / (anchors.length - 1),
      );
    });
  });

  it("supports uneven spacing and zero-height anchors", () => {
    const anchors = makeAnchors(
      [0, 900, 2700, 3100, 5200, 6100, 8200, 11800],
      [0, 1, 0, 900, 20, 0, 1400, 0],
    );
    const samples = [0, 400, 1000, 2500, 3000, 5000, 8000, 12000].map(
      (scrollY) => resolveJourneyProgress(anchors, scrollY, VIEWPORT_HEIGHT),
    );

    assert.equal(samples[0], 0);
    assert.equal(samples.at(-1), 1);
    samples.forEach((sample) => assert.ok(Number.isFinite(sample)));
  });

  it("handles overlapping and equal anchor positions without division by zero", () => {
    const anchors = makeAnchors([0, 1000, 1000, 1000, 1200, 1200, 1500, 1500]);
    const samples = Array.from({ length: 2201 }, (_, scrollY) =>
      resolveJourneyProgress(anchors, scrollY, VIEWPORT_HEIGHT),
    );

    samples.forEach((sample) => {
      assert.ok(Number.isFinite(sample));
      assert.ok(sample >= 0 && sample <= 1);
    });
    for (let index = 1; index < samples.length; index += 1) {
      assert.ok(samples[index] >= samples[index - 1]);
    }
  });

  it("stays monotonic across malformed geometry", () => {
    const anchors = makeAnchors([
      -100,
      Number.NaN,
      400,
      200,
      Number.POSITIVE_INFINITY,
      800,
      Number.MAX_VALUE,
      1200,
    ]);
    const samples = Array.from({ length: 1801 }, (_, scrollY) =>
      resolveJourneyProgress(anchors, scrollY, 0),
    );

    for (let index = 1; index < samples.length; index += 1) {
      assert.ok(Number.isFinite(samples[index]));
      assert.ok(samples[index] >= samples[index - 1]);
    }
  });

  it("does not mutate caller-owned anchor geometry", () => {
    const anchors = makeAnchors().map((anchor) => Object.freeze({ ...anchor }));
    const before = JSON.stringify(anchors);

    resolveJourneyState(Object.freeze(anchors), 2400, VIEWPORT_HEIGHT);

    assert.equal(JSON.stringify(anchors), before);
  });
});

describe("continuous facility route geometry", () => {
  it("maps the full scroll distance monotonically across the route", () => {
    const anchors = makeAnchors(
      immersiveStageIds.map((_, index) => index * 1000),
      immersiveStageIds.map(() => 900),
    );

    const start = resolveFacilityRouteProgress(anchors, 0, 1000);
    const middle = resolveFacilityRouteProgress(anchors, 3500, 1000);
    const end = resolveFacilityRouteProgress(anchors, 7000, 1000);

    assert.equal(start, 0);
    assert.ok(middle > 0.4 && middle < 0.6);
    assert.equal(end, 1);
  });

  it("keeps moving inside long chapters instead of holding the camera", () => {
    const anchors = makeAnchors(
      [0, 900, 4200, 5200, 6200, 7200, 8200, 9200],
      immersiveStageIds.map(() => 900),
    );
    const before = resolveFacilityRouteProgress(anchors, 2000, 1000);
    const after = resolveFacilityRouteProgress(anchors, 2025, 1000);

    assert.ok(after > before);
  });

  it("stays finite and monotonic for repeated or malformed geometry", () => {
    const invalid = makeAnchors().slice(0, -1);
    assert.equal(resolveFacilityRouteProgress(invalid, 2000, 1000), 0);

    const anchors = makeAnchors([
      0,
      1000,
      1000,
      Number.NaN,
      3400,
      3400,
      Number.POSITIVE_INFINITY,
      7000,
    ]);
    const samples = Array.from({ length: 81 }, (_, index) =>
      resolveFacilityRouteProgress(anchors, index * 100, 0),
    );
    for (let index = 0; index < samples.length; index += 1) {
      assert.ok(Number.isFinite(samples[index]));
      assert.ok(samples[index] >= 0 && samples[index] <= 1);
      if (index > 0) assert.ok(samples[index] >= samples[index - 1]);
    }
  });
});

describe("homepage immersive scroll source contract", () => {
  it("adds the eight spatial anchors without changing semantic stages", () => {
    const roots = [
      ["components/home/HeroSection.tsx", "hero", "hero"],
      ["components/home/ProofConsole.tsx", "proof", "proof"],
      ["components/home/CapabilitiesSection.tsx", "capabilities", "research-labs"],
      ["components/home/ContactSection.tsx", "contact", "contact"],
    ] as const;

    for (const [file, semanticStage, spatialAnchor] of roots) {
      const source = readSource(file);
      const root = source.match(/<section\b[^>]*>/)?.[0] ?? "";
      assert.match(root, new RegExp(`data-immersive-stage=["']${semanticStage}["']`));
      assert.match(root, new RegExp(`data-immersive-anchor=["']${spatialAnchor}["']`));
    }

    const chapters = readSource("components/home/ChapterIndex.tsx");
    assert.match(
      chapters.match(/<section\b[^>]*>/)?.[0] ?? "",
      /data-immersive-stage=["']featured-work["']/,
    );
    assert.match(chapters, /<article\b[^>]*data-immersive-anchor=\{project\.slug\}[^>]*>/s);

    const catalog = readSource("data/workProjects.ts");
    const featuredSlugs = ["kota", "audiobook", "archon", "splash-ink"];
    let cursor = -1;
    for (const slug of featuredSlugs) {
      const next = catalog.indexOf(`slug: "${slug}"`);
      assert.ok(next > cursor, `${slug} must keep its spatial order`);
      cursor = next;
    }

    for (const file of [
      "components/home/PositioningBand.tsx",
      "components/home/ResearchProofSection.tsx",
      "components/home/LabsSection.tsx",
    ]) {
      assert.doesNotMatch(readSource(file), /data-immersive-anchor/);
    }
  });

  it("keeps the pure geometry module framework and DOM independent", () => {
    const source = readSource("components/immersive/scrollProgress.ts");

    assert.doesNotMatch(source, /\b(?:window|document|HTMLElement|Element)\b/);
    assert.doesNotMatch(source, /\b(?:react|gsap|three)\b/i);
  });

  it("batches reads and samples in RAF without React state", () => {
    const source = readSource("components/immersive/useImmersiveScroll.ts");

    assert.match(source, /requestAnimationFrame/);
    assert.match(source, /getBoundingClientRect/);
    assert.match(source, /sampleImmersiveJourney/);
    assert.match(source, /resolveFacilityRouteProgress/);
    assert.match(source, /getImmersiveProfile/);
    assert.match(source, /querySelectorAll[\s\S]*data-immersive-anchor/);
    assert.doesNotMatch(source, /\buseState\b|\buseReducer\b|createContext/);

    const frame = source.slice(
      source.indexOf("const runFrame"),
      source.indexOf("const scheduleFrame"),
    );
    assert.match(frame, /getBoundingClientRect/);
    assert.match(frame, /onSampleRef\.current/);

    const nativeHandler = source.slice(
      source.indexOf("const handleNativeScroll"),
      source.indexOf("const handleResize"),
    );
    const resizeHandler = source.slice(
      source.indexOf("const handleResize"),
      source.indexOf("const handleMotionChange"),
    );
    assert.doesNotMatch(nativeHandler, /window\.scrollY/);
    assert.doesNotMatch(resizeHandler, /window\.scrollY/);
  });

  it("publishes continuous route progress beside semantic journey state", () => {
    const source = readSource("components/immersive/useImmersiveScroll.ts");

    assert.match(source, /readonly routeProgress:\s*number/);
    assert.match(
      source,
      /routeProgress:\s*resolveFacilityRouteProgress\(/,
    );
  });

  it("uses existing Lenis or passive native scroll and cleans up every lifecycle handle", () => {
    const source = readSource("components/immersive/useImmersiveScroll.ts");

    assert.doesNotMatch(source, /new\s+Lenis/);
    assert.match(source, /if\s*\(lenis\)[\s\S]*\.on\(["']scroll["']/);
    assert.match(source, /else[\s\S]*addEventListener\(["']scroll["'][\s\S]*passive:\s*true/);
    assert.match(source, /if\s*\(lenis\)[\s\S]*\.off\(["']scroll["']/);
    assert.match(source, /removeEventListener\(["']scroll["']/);
    assert.match(source, /ResizeObserver/);
    assert.match(source, /\.disconnect\(\)/);
    assert.match(source, /cancelAnimationFrame/);
    assert.match(source, /addListener|addEventListener\(["']change["']/);
    assert.match(source, /removeListener|removeEventListener\(["']change["']/);
  });

  it("invalidates cached anchors when the stable content root changes size", () => {
    const source = readSource("components/immersive/useImmersiveScroll.ts");

    assert.match(
      source,
      /document\.getElementById\(["']main-content["']\)\s*\?\?\s*document\.body/,
    );
    assert.match(source, /resizeObserver\.observe\(contentRoot\)/);
    assert.match(
      source,
      /new ResizeObserver\(\(\)\s*=>\s*\{\s*rectsDirty\s*=\s*true;\s*scheduleFrame\(\);/,
    );
    assert.match(source, /resizeObserver\?\.disconnect\(\)/);
  });

  it("uses live Lenis coordinates for non-scroll invalidations", () => {
    const source = readSource("components/immersive/useImmersiveScroll.ts");
    const frame = source.slice(
      source.indexOf("const runFrame"),
      source.indexOf("const scheduleFrame"),
    );

    assert.match(
      frame,
      /pendingScrollY\s*\?\?\s*lenis\?\.scroll\s*\?\?\s*window\.scrollY/,
    );
  });

  it("contains no scroll-jacking behavior", () => {
    const source = readSource("components/immersive/useImmersiveScroll.ts");

    assert.doesNotMatch(
      source,
      /scrollTo|scrollIntoView|preventDefault|\.focus\(|wheel|touchmove|scrollSnap|style\s*\./,
    );
  });

  it("stores one hook subscription in a stable ThreeScene ref", () => {
    const source = readSource("components/ThreeScene.tsx");

    assert.equal(source.match(/useImmersiveScroll\(/g)?.length, 1);
    assert.match(source, /useRef<ImmersiveScrollSnapshot\s*\|\s*null>/);
    assert.match(source, /\.current\s*=\s*snapshot/);
    assert.doesNotMatch(source, /useState<ImmersiveScrollSnapshot/);
  });

  it("makes the hook the scene's sole scroll subscription", () => {
    const source = readSource("components/ThreeScene.tsx");

    assert.equal(source.match(/useImmersiveScroll\(/g)?.length, 1);
    assert.doesNotMatch(source, /LenisInstance|handleScroll|handleNativeScroll/);
    assert.doesNotMatch(
      source,
      /\.on\(["']scroll["']|addEventListener\(["']scroll["']/,
    );
    assert.doesNotMatch(source, /style\.opacity|const opacity|sceneVisible/);
  });

  it("creates one persistent world and reads the live sample inside its single loop", () => {
    const source = readSource("components/ThreeScene.tsx");

    assert.equal(source.match(/new THREE\.WebGLRenderer/g)?.length, 1);
    assert.equal(source.match(/new THREE\.PerspectiveCamera/g)?.length, 1);
    assert.match(
      source,
      /import\s*\{\s*createSceneGroups\s*\}\s*from\s*["']\.\/immersive\/createSceneGroups["']/,
    );
    assert.equal(source.match(/createSceneGroups\(/g)?.length, 1);
    assert.match(source, /scene\.add\(sceneGroups\.root\)/);
    assert.match(
      source,
      /immersiveScrollSnapshotRef\.current\?\.sample\s*\?\?\s*initialSample/,
    );
    assert.match(
      source,
      /sceneGroups\.update\(\s*currentGroupWeights,/,
    );
    assert.doesNotMatch(
      source,
      /sceneGroups\.update\(\s*sample\.groups,/,
    );
    assert.equal(source.match(/requestAnimationFrame\(loop\)/g)?.length, 2);
    assert.doesNotMatch(source, /scene\.traverse\(|root\.traverse\(/);
  });

  it("drives authored camera, fog, terrain, and group weights from the sampled stage", () => {
    const source = readSource("components/ThreeScene.tsx");

    assert.match(source, /sample\.camera\.position\.x/);
    assert.match(source, /sample\.camera\.target\.z/);
    assert.match(source, /sample\.camera\.fov/);
    assert.match(source, /sample\.fog\.density/);
    assert.match(source, /sample\.fog\.color/);
    assert.match(source, /sample\.terrain\.elevation/);
    assert.match(source, /sample\.terrain\.roughness/);
    assert.match(source, /sample\.terrain\.visibility/);
    assert.match(source, /THREE\.MathUtils\.damp/);
    assert.match(
      source,
      /createMutableSceneGroupWeights\(\s*initialSample\.groups/,
    );
    assert.match(
      source,
      /copySceneGroupWeights\(currentGroupWeights,\s*sample\.groups\)/,
    );
    assert.match(
      source,
      /dampSceneGroupWeights\([\s\S]*currentGroupWeights,[\s\S]*sample\.groups/,
    );
    for (const uniform of [
      "uElevation",
      "uRoughness",
      "uVisibility",
      "uFogColor",
      "uFogDensity",
    ]) {
      assert.match(source, new RegExp(uniform));
    }
  });

  it("pauses and wakes the renderer through the pure lifecycle policy", () => {
    const source = readSource("components/ThreeScene.tsx");

    assert.match(source, /shouldAnimateScene\(/);
    assert.match(source, /shouldRenderScene\(/);
    assert.match(source, /sceneWakeRef\s*=\s*useRef<\(\(\)\s*=>\s*void\)\s*\|\s*null>/);
    assert.match(
      source,
      /immersiveScrollSnapshotRef\.current\s*=\s*snapshot;[\s\S]*sceneWakeRef\.current\?\.\(\)/,
    );
    assert.match(
      source,
      /immersiveScrollSnapshotRef\.current\?\.inJourney\s*\?\?\s*true/,
    );
    assert.match(source, /sceneWakeRef\.current\s*=\s*wakeScene/);
    assert.match(source, /const wakeScene[\s\S]*shouldAnimateScene/);
    assert.match(source, /renderStaticFrame\(\)/);
    assert.match(source, /startLoop\(\)/);
    assert.match(source, /sceneWakeRef\.current\s*=\s*null/);
  });

  it("deduplicates scene wakes by discrete snapshot state", () => {
    const source = readSource("components/ThreeScene.tsx");
    const helper = source.slice(
      source.indexOf("function shouldWakeScene"),
      source.indexOf("const SNOISE"),
    );
    const store = source.slice(
      source.indexOf("const storeImmersiveSnapshot"),
      source.indexOf("useImmersiveScroll(storeImmersiveSnapshot)"),
    );

    assert.match(helper, /previous\s*===\s*null/);
    assert.match(helper, /previous\.profile\s*!==\s*next\.profile/);
    assert.match(
      helper,
      /previous\.activeStageId\s*!==\s*next\.activeStageId/,
    );
    assert.match(helper, /previous\.inJourney\s*!==\s*next\.inJourney/);
    assert.match(
      helper,
      /previous\.anchorsValid\s*!==\s*next\.anchorsValid/,
    );
    assert.match(store, /shouldWakeScene\(previousSnapshot, snapshot\)/);
    assert.match(
      store,
      /if\s*\(shouldWake\)\s*\{\s*sceneWakeRef\.current\?\.\(\);/,
    );
  });

  it("applies reduced samples exactly and advances time only in the RAF loop", () => {
    const source = readSource("components/ThreeScene.tsx");
    const staticFrame = source.slice(
      source.indexOf("const renderStaticFrame"),
      source.indexOf("const renderAnimatedFrame"),
    );
    const animatedFrame = source.slice(
      source.indexOf("const renderAnimatedFrame"),
      source.indexOf("const stopLoop"),
    );
    const loop = source.slice(
      source.indexOf("const loop"),
      source.indexOf("const startLoop"),
    );

    assert.ok(staticFrame.length > 0);
    assert.doesNotMatch(
      staticFrame,
      /uniforms\.uTime\.value\s*\+=|THREE\.MathUtils\.damp/,
    );
    assert.match(staticFrame, /mx\s*=\s*0/);
    assert.match(staticFrame, /my\s*=\s*0/);
    assert.match(staticFrame, /tx\s*=\s*0/);
    assert.match(staticFrame, /ty\s*=\s*0/);
    assert.match(staticFrame, /applySceneSample\(sample,\s*0,\s*true\)/);
    assert.match(animatedFrame, /frameTime/);
    assert.match(animatedFrame, /uniforms\.uTime\.value\s*\+=/);
    assert.match(
      animatedFrame,
      /applySceneSample\(sample,\s*deltaSeconds,\s*false\)/,
    );
    assert.match(loop, /renderAnimatedFrame\(/);
    assert.doesNotMatch(loop, /renderStaticFrame\(\)/);
    assert.equal(source.match(/uniforms\.uTime\.value\s*\+=/g)?.length, 1);
  });

  it("keeps pointer parallax secondary, live-profile gated, and quiet at contact", () => {
    const source = readSource("components/ThreeScene.tsx");
    const pointerHandler = source.slice(
      source.indexOf("const onPointer"),
      source.indexOf("const renderScene"),
    );
    const resizeHandler = source.slice(
      source.indexOf("const handleResize"),
      source.indexOf('window.addEventListener("resize"'),
    );

    assert.match(pointerHandler, /finePointerAvailable/);
    assert.match(pointerHandler, /isReducedMotion\(\)/);
    assert.match(pointerHandler, /profile\s*===\s*["']mobile["']/);
    assert.match(source, /matchMedia\(["']\(pointer: fine\)["']\)/);
    assert.doesNotMatch(source, /function motionScaleForSample/);
    assert.match(
      source,
      /motionScaleForTransition\(\s*sample\.transition\.toId,\s*sample\.transition\.easedProgress/,
    );
    assert.match(source, /pointerScale[\s\S]*motionScaleForTransition/);
    assert.match(resizeHandler, /getThreeSceneTuning\(/);
  });

  it("builds profile candidates transactionally before retiring the live world", () => {
    const source = readSource("components/ThreeScene.tsx");
    const syncResources = source.slice(
      source.indexOf("const syncSceneResources"),
      source.indexOf("const syncSceneQualityForViewport"),
    );
    const wakeScene = source.slice(
      source.indexOf("const wakeScene"),
      source.indexOf("sceneWakeRef.current = wakeScene"),
    );
    const finePointerChange = source.slice(
      source.indexOf("const handleFinePointerChange"),
      source.indexOf("syncPointerListener();"),
    );
    const resize = source.slice(
      source.indexOf("const handleResize"),
      source.indexOf('window.addEventListener("resize"'),
    );

    assert.match(source, /function createTerrainResources/);
    assert.match(source, /function createSceneWorldResources/);
    assert.match(source, /swapResourceCandidate/);
    assert.match(source, /let terrainResources\s*=/);
    assert.match(source, /let sceneGroups\s*=/);
    assert.match(source, /let liveWorldResources\s*=/);
    assert.match(source, /let activeTuning\s*=/);
    assert.match(
      syncResources,
      /shouldRebuildSceneResources\(\s*activeTuning\.profile,\s*nextTuning\.profile/,
    );
    assert.match(syncResources, /return false/);
    assert.match(
      syncResources,
      /swapResourceCandidate\(\s*liveWorldResources/,
    );
    assert.match(
      syncResources,
      /createCandidate:[\s\S]*createPreparedSceneWorldResources/,
    );
    assert.match(
      source,
      /const createPreparedSceneWorldResources[\s\S]*createSceneWorldResources\(nextTuning,\s*uniforms\)/,
    );
    assert.match(syncResources, /attachCandidate:[\s\S]*attachSceneWorldResources/);
    assert.match(syncResources, /detachCurrent:[\s\S]*detachSceneWorldResources/);
    assert.match(syncResources, /disposeResource:\s*disposeSceneWorldResources/);
    assert.match(
      syncResources,
      /if\s*\(!swapResult\.replaced\)[\s\S]*return false/,
    );
    assert.match(
      syncResources,
      /liveWorldResources\s*=\s*swapResult\.current/,
    );
    assert.doesNotMatch(
      syncResources.slice(0, syncResources.indexOf("swapResourceCandidate")),
      /sceneGroups\.dispose|disposeTerrainResources/,
    );
    assert.match(syncResources, /dataset\.sceneProfile\s*=\s*nextTuning\.profile/);
    assert.match(source, /candidate\.groups\.update\(\s*currentGroupWeights,/);
    assert.match(wakeScene, /syncSceneQualityForViewport\(\)/);
    assert.match(finePointerChange, /syncSceneQualityForViewport\(\)/);
    assert.match(resize, /syncSceneResources\(resizeTuning\)/);
    assert.equal(source.match(/new THREE\.WebGLRenderer/g)?.length, 1);
    assert.equal(source.match(/new THREE\.PerspectiveCamera/g)?.length, 1);
  });

  it("tears down renderer setup if the initial world cannot be constructed", () => {
    const source = readSource("components/ThreeScene.tsx");
    const initialSetup = source.slice(
      source.indexOf("let initialWorldResources"),
      source.indexOf("let finePointerAvailable"),
    );

    assert.match(
      initialSetup,
      /try\s*\{[\s\S]*createSceneWorldResources\(\s*initialTuning,\s*uniforms/,
    );
    assert.ok(
      initialSetup.indexOf("createSceneWorldResources") <
        initialSetup.indexOf("mount.appendChild(renderer.domElement)"),
    );
    assert.match(
      initialSetup,
      /catch\s*\(error\)[\s\S]*disposeRendererResources\(renderer,\s*mount\)[\s\S]*markWebglUnavailable\(error\)/,
    );
    assert.match(initialSetup, /sceneWakeRef\.current\s*===\s*syncJourneyState/);
  });

  it("restores the existing WebGL renderer, canvas, profile, and current sample", () => {
    const source = readSource("components/ThreeScene.tsx");
    const contextLost = source.slice(
      source.indexOf("const handleContextLost"),
      source.indexOf("const handleContextRestored"),
    );
    const contextRestored = source.slice(
      source.indexOf("const handleContextRestored"),
      source.indexOf("renderStaticFrame();", source.indexOf("const handleContextRestored")) +
        "renderStaticFrame();".length,
    );
    const cleanup = source.slice(source.indexOf("return () => {", source.indexOf("renderStaticFrame();")));

    assert.match(contextLost, /event\.preventDefault\(\)/);
    assert.match(contextLost, /markWebglUnavailable\(["']WebGL context lost["']\)/);
    assert.match(contextRestored, /webglReady\s*=\s*true/);
    assert.match(contextRestored, /dataset\.webglState\s*=\s*["']ready["']/);
    assert.match(
      contextRestored,
      /rebuildSceneResourcesAfterContextRestore\(/,
    );
    assert.match(contextRestored, /syncSceneQualityForViewport\(\)/);
    assert.match(contextRestored, /renderer\.setSize\(/);
    assert.match(contextRestored, /renderStaticFrame\(\)/);
    assert.match(source, /addEventListener\(\s*["']webglcontextrestored["']/);
    assert.match(cleanup, /removeEventListener\(\s*["']webglcontextrestored["']/);
    assert.match(source, /retireCurrent:[\s\S]*retireContextLostSceneWorld/);
    assert.equal(source.match(/new THREE\.WebGLRenderer/g)?.length, 1);
  });

  it("fades the fixed world outside the pure journey range and restores it on re-entry", () => {
    const source = readSource("components/ThreeScene.tsx");
    const css = readSource("styles/home.module.css");
    const syncJourney = source.slice(
      source.indexOf("const syncJourneyState"),
      source.indexOf("const renderScene"),
    );

    assert.match(source, /data-journey-state=["']active["']/);
    assert.match(syncJourney, /journeyStateFor\(isSceneInJourney\(\)\)/);
    assert.match(syncJourney, /mount\.dataset\.journeyState\s*!==\s*nextState/);
    assert.match(syncJourney, /mount\.dataset\.journeyState\s*=\s*nextState/);
    assert.match(source, /const wakeScene[\s\S]*syncJourneyState\(\)/);
    assert.match(
      css,
      /\.immersiveScene\[data-journey-state=["']inactive["']\]\s*\{[^}]*opacity:\s*0/s,
    );
    assert.match(css, /transition:[^;]*opacity/);
  });

  it("exposes a stable CSS fallback and fully cleans renderer resources", () => {
    const source = readSource("components/ThreeScene.tsx");
    const css = readSource("styles/home.module.css");

    assert.match(source, /data-webgl-state=["']pending["']/);
    assert.match(source, /data-scene-profile=["']pending["']/);
    assert.match(source, /dataset\.webglState\s*=\s*["']ready["']/);
    assert.match(source, /dataset\.webglState\s*=\s*["']unavailable["']/);
    assert.match(source, /webglcontextlost/);
    assert.match(source, /resources\.groups\.dispose\(\)/);
    assert.match(source, /geometry\.dispose\(\)/);
    assert.match(source, /material\.dispose\(\)/);
    assert.match(source, /renderer\.dispose\(\)/);
    assert.match(source, /renderer\.forceContextLoss\(\)/);
    assert.match(css, /\.immersiveScene\s*\{/);
    assert.match(css, /data-webgl-state=["']unavailable["']/);
    assert.match(css, /linear-gradient/);
    assert.match(css, /pointer-events:\s*none/);
    assert.match(css, /overflow:\s*hidden/);
  });
});
