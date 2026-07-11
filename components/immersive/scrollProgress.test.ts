import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { immersiveStageIds } from "./immersiveStages";
import {
  JOURNEY_ENTRY_VIEWPORT_RATIO,
  JOURNEY_SETTLE_VIEWPORT_RATIO,
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

  it("pauses and wakes the renderer from immutable scroll snapshots", () => {
    const source = readSource("components/ThreeScene.tsx");

    assert.match(source, /sceneWakeRef\s*=\s*useRef<\(\(\)\s*=>\s*void\)\s*\|\s*null>/);
    assert.match(
      source,
      /immersiveScrollSnapshotRef\.current\s*=\s*snapshot;[\s\S]*sceneWakeRef\.current\?\.\(\)/,
    );
    assert.match(
      source,
      /immersiveScrollSnapshotRef\.current\?\.inJourney\s*\?\?\s*true/,
    );
    assert.match(
      source,
      /const isReducedMotion[\s\S]*immersiveScrollSnapshotRef\.current\?\.profile/,
    );
    assert.match(source, /sceneWakeRef\.current\s*=\s*wakeScene/);
    assert.match(
      source,
      /const wakeScene[\s\S]*!isSceneInJourney\(\)[\s\S]*stopLoop\(\)[\s\S]*isReducedMotion\(\)[\s\S]*renderStaticFrame\(\)[\s\S]*startLoop\(\)/,
    );
    assert.match(
      source,
      /if\s*\(isReducedMotion\(\)\)\s*\{\s*stopLoop\(\);\s*renderStaticFrame\(\);/,
    );
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

  it("keeps static draws frozen and advances motion only in the RAF loop", () => {
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
      /performance\.now|uniforms\.uTime\.value|tx\s*\+=|ty\s*\+=/,
    );
    assert.match(staticFrame, /mx\s*=\s*0/);
    assert.match(staticFrame, /my\s*=\s*0/);
    assert.match(staticFrame, /tx\s*=\s*0/);
    assert.match(staticFrame, /ty\s*=\s*0/);
    assert.match(animatedFrame, /performance\.now/);
    assert.match(animatedFrame, /uniforms\.uTime\.value\s*\+=/);
    assert.match(animatedFrame, /tx\s*\+=/);
    assert.match(animatedFrame, /ty\s*\+=/);
    assert.match(loop, /renderAnimatedFrame\(\)/);
    assert.doesNotMatch(loop, /renderStaticFrame\(\)/);
    assert.equal(source.match(/performance\.now\(\)/g)?.length, 1);
    assert.equal(source.match(/uniforms\.uTime\.value\s*\+=/g)?.length, 1);
  });

  it("gates pointer parallax with the live profile and fine-pointer capability", () => {
    const source = readSource("components/ThreeScene.tsx");
    const pointerHandler = source.slice(
      source.indexOf("const onPointer"),
      source.indexOf("const renderScene"),
    );
    const resizeHandler = source.slice(
      source.indexOf("const handleResize"),
      source.indexOf('window.addEventListener("resize"'),
    );

    assert.match(pointerHandler, /if\s*\(isReducedMotion\(\)\)\s*return/);
    assert.match(
      source,
      /if\s*\(!isCoarsePointer\)\s*\{\s*window\.addEventListener\(["']pointermove["'], onPointer\)/,
    );
    assert.match(
      source,
      /const isReducedMotion[\s\S]*immersiveScrollSnapshotRef\.current\?\.profile/,
    );
    assert.match(
      resizeHandler,
      /const currentReducedMotion\s*=\s*isReducedMotion\(\)/,
    );
    assert.match(
      resizeHandler,
      /reducedMotion:\s*currentReducedMotion/,
    );
  });
});
