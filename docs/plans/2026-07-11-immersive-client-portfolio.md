# Immersive Client Portfolio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn kumma.me into a proof-led, immersive client-acquisition portfolio for founders and CTOs buying production-AI audits, builds, and advisory.

**Architecture:** Keep semantic HTML and native scrolling as the dependable product layer, then drive one homepage-only Three.js world from section progress through a pure, testable stage model. Consolidate all public work into one typed catalog consumed by the homepage, canonical `/work` index, visual registry, sitemap, and related links; retain project-specific case-study content while enforcing one shared evidence and conversion narrative.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, CSS Modules, Three.js, GSAP/ScrollTrigger, Node's built-in test runner, Playwright CLI, JSON-LD.

---

## Working rules

- Work only in `/tmp/kumma-portfolio-immersive-client` on branch `feature/immersive-client-portfolio` until final integration.
- Follow @superpowers:test-driven-development for every behavioral slice.
- Use @superpowers:systematic-debugging for any unexpected test, build, or browser failure.
- Use @ui-ux-pro-max when evaluating typography, hierarchy, interaction, responsive behavior, and accessibility.
- Keep the Atlas palette and editorial/technical visual language already defined in `app/globals.css`; do not introduce a generic purple AI theme.
- Do not fabricate customers, outcomes, benchmarks, or performance metrics. Label unfinished work `Active R&D`.
- Preserve native, interruptible scroll. Do not add scroll snapping or pin reading content for long periods.
- Treat reduced motion, WebGL failure, low-power devices, keyboard use, and mobile layout as first-class states.
- Commit after every green task. Before any completion or merge claim, run @superpowers:verification-before-completion.

### Task 1: Make the unit-test harness discover new tests

**Files:**
- Create: `scripts/run-unit-tests.mjs`
- Create: `scripts/run-unit-tests.test.mjs`
- Create: `tsconfig.unit-tests.json`
- Modify: `package.json`

**Step 1: Write the failing harness self-test**

Create `scripts/run-unit-tests.test.mjs` that imports `collectTestFiles` and verifies recursive, sorted discovery without touching the repository:

```js
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { collectTestFiles } from "./run-unit-tests.mjs";

test("collectTestFiles returns nested test files in stable order", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "kumma-test-discovery-"));
  await mkdir(path.join(root, "nested"));
  await writeFile(path.join(root, "z.test.js"), "");
  await writeFile(path.join(root, "nested", "a.test.js"), "");
  await writeFile(path.join(root, "nested", "ignore.js"), "");
  assert.deepEqual(
    (await collectTestFiles(root)).map((file) => path.relative(root, file)),
    ["nested/a.test.js", "z.test.js"],
  );
  await rm(root, { recursive: true, force: true });
});
```

**Step 2: Run the test to verify it fails**

Run: `node --test scripts/run-unit-tests.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/run-unit-tests.mjs`.

**Step 3: Implement the minimal recursive runner**

Create `scripts/run-unit-tests.mjs` with exported `collectTestFiles(root)`. When executed directly it must:

1. create a temporary directory with `mkdtemp`;
2. run `tsc -p tsconfig.unit-tests.json --outDir <temp>` with `spawnSync`;
3. recursively collect every compiled `*.test.js`;
4. invoke `node --test` with the sorted file list;
5. remove the temp directory in `finally` and exit with the child status.

Do not use shell interpolation. Pass command arguments as arrays.

Create `tsconfig.unit-tests.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2020",
    "moduleResolution": "node",
    "noEmit": false,
    "isolatedModules": false,
    "rootDir": ".",
    "skipLibCheck": true
  },
  "include": [
    "components/**/*.test.ts",
    "data/**/*.test.ts",
    "components/threeSceneTuning.ts",
    "components/viz/reducedMotionState.ts",
    "components/immersive/**/*.ts",
    "data/workProjects.ts"
  ]
}
```

Change `package.json` to:

```json
"test": "node scripts/run-unit-tests.mjs"
```

**Step 4: Verify the harness and existing suite**

Run: `node --test scripts/run-unit-tests.test.mjs && npm test`

Expected: the harness self-test passes and all 91 existing TypeScript tests remain green.

**Step 5: Commit**

```bash
git add package.json scripts/run-unit-tests.mjs scripts/run-unit-tests.test.mjs tsconfig.unit-tests.json
git commit -m "test: make unit suite discoverable"
```

### Task 2: Establish the canonical typed work catalog

**Files:**
- Create: `data/workProjects.ts`
- Create: `data/workProjects.test.ts`
- Modify: `components/home/chapters.ts`
- Modify: `data/systemEvidence.ts`

**Step 1: Write failing catalog-contract tests**

Test these public contracts with `node:test`:

```ts
assert.deepEqual(featuredWork.map((project) => project.slug), [
  "kota", "audiobook", "archon", "splash-ink",
]);
assert.deepEqual(labWork.map((project) => project.slug), [
  "spectral-world", "robinhood-dashboard",
]);
assert.equal(new Set(workProjects.map((p) => p.slug)).size, workProjects.length);
assert.ok(workProjects.every((p) => p.href === `/work/${p.slug}`));
assert.ok(workProjects.every((p) => Object.values(p.evidence).every(Boolean)));
assert.deepEqual(validateWorkProjects(workProjects), []);
```

Also assert that the allowed visual keys are exactly `kota`, `audiobook`, `archon`, `splash-ink`, `spectral-world`, and `ledger`.

**Step 2: Run the focused test to verify it fails**

Run: `npm test`

Expected: TypeScript compilation fails because `data/workProjects.ts` does not exist.

**Step 3: Implement catalog types, entries, selectors, and validation**

Create the following public surface:

```ts
export type WorkTier = "featured" | "lab";
export type WorkStatus = "live" | "open-source" | "active-r-and-d" | "case-study";
export type WorkVisualKey =
  | "kota" | "audiobook" | "archon" | "splash-ink" | "spectral-world" | "ledger";

export interface WorkProject {
  slug: string;
  no: string;
  title: string;
  href: `/work/${string}`;
  tier: WorkTier;
  status: WorkStatus;
  statusLabel: string;
  summary: string;
  tags: readonly string[];
  artifact: string;
  evidence: { input: string; transform: string; output: string; guardrail: string };
  visualKey: WorkVisualKey;
  layout: "feature" | "flip" | "band";
  primaryAction?: { label: string; href: string };
  externalUrl?: string;
}
```

Populate only evidence-backed claims from the approved design and existing case studies. Export `workProjects`, `featuredWork`, `labWork`, `getWorkProject(slug)`, `workVisualKeys`, and `validateWorkProjects(projects)`.

Replace `components/home/chapters.ts` with a compatibility adapter derived from `featuredWork`, so no homepage content is duplicated. Update ARCHON's stale `/projects/archon` link in `data/systemEvidence.ts` to `/work/archon`.

**Step 4: Verify the focused and full tests**

Run: `npm test`

Expected: all existing and new catalog tests pass.

**Step 5: Commit**

```bash
git add data/workProjects.ts data/workProjects.test.ts data/systemEvidence.ts components/home/chapters.ts
git commit -m "feat: add canonical work catalog"
```

### Task 3: Make `/work` the canonical project index

**Files:**
- Create: `app/work/page.tsx`
- Create: `components/work/WorkIndex.tsx`
- Create: `components/work/WorkIndex.module.css`
- Create: `data/workRoutes.ts`
- Create: `data/workRoutes.test.ts`
- Modify: `app/projects/page.tsx`
- Modify: `app/projects/[slug]/page.tsx`
- Modify: `components/Footer.tsx`

**Step 1: Write failing route-map tests**

Test a pure legacy route resolver:

```ts
assert.equal(resolveLegacyWorkHref("kota"), "/work/kota");
assert.equal(resolveLegacyWorkHref("archon"), "/work/archon");
assert.equal(resolveLegacyWorkHref("robinhood"), "/work/robinhood-dashboard");
assert.equal(resolveLegacyWorkHref("unknown"), null);
```

Assert every canonical project appears in the `/work` index data and no catalog href starts with `/projects/`.

**Step 2: Run the test to verify it fails**

Run: `npm test`

Expected: FAIL because `data/workRoutes.ts` does not exist.

**Step 3: Implement redirects and the semantic work index**

- `app/projects/page.tsx` becomes a server component using `permanentRedirect("/work")`.
- `app/projects/[slug]/page.tsx` resolves known legacy slugs and calls `permanentRedirect(href)`; unknown slugs call `notFound()`.
- `app/work/page.tsx` exports focused metadata and renders `WorkIndex`.
- `WorkIndex` renders one `<h1>`, separate Featured and Labs sections, status text, evidence flow, project-specific visual from the registry, and a closing `/contact` CTA.
- Each card uses a whole-card accessible link without nesting secondary anchors.
- `components/Footer.tsx` links to `/work`, not `/#work` or `/projects`.

Use the existing Atlas tokens, 44px minimum touch targets, visible focus states, and responsive single-column ordering below 760px.

**Step 4: Verify tests and route compilation**

Run: `npm test && npm run build`

Expected: all unit tests pass; build includes `/work` and legacy `/projects` routes without duplicate project-page content.

**Step 5: Commit**

```bash
git add app/work/page.tsx app/projects/page.tsx app/projects/'[slug]'/page.tsx components/work data/workRoutes.ts data/workRoutes.test.ts components/Footer.tsx
git commit -m "feat: make work the canonical project index"
```

### Task 4: Reframe the homepage around paid production-AI engagements

**Files:**
- Modify: `components/Home.tsx`
- Modify: `components/home/HeroSection.tsx`
- Modify: `components/home/HeroSection.module.css`
- Modify: `components/home/PositioningBand.tsx`
- Modify: `components/home/ChapterIndex.tsx`
- Modify: `components/home/ChapterIndex.module.css`
- Create: `components/home/CapabilitiesSection.tsx`
- Create: `components/home/CapabilitiesSection.module.css`
- Create: `components/home/ResearchProofSection.tsx`
- Create: `components/home/ResearchProofSection.module.css`
- Create: `components/home/LabsSection.tsx`
- Create: `components/home/LabsSection.module.css`
- Create: `components/home/homeContent.ts`
- Create: `components/home/homeContent.test.ts`
- Modify: `components/home/ContactSection.tsx`

**Step 1: Write failing positioning tests**

Keep conversion-critical content in `homeContent.ts` and assert:

```ts
assert.match(heroContent.title, /production AI/i);
assert.equal(heroContent.primaryCta.href, "/contact");
assert.deepEqual(engagements.map((item) => item.title), [
  "Production AI audit", "Build engagement", "Advisory",
]);
assert.ok(researchProof.every((item) => !item.href.startsWith("/projects")));
assert.ok(!JSON.stringify(homeContent).match(/full[- ]time|hire me|recruit/i));
```

**Step 2: Run the test to verify it fails**

Run: `npm test`

Expected: FAIL because `components/home/homeContent.ts` does not exist.

**Step 3: Implement the approved homepage sequence**

Render in this order and add `data-immersive-stage` values for the later scene director:

```tsx
<HeroSection />                    // hero
<ProofConsole />                   // proof
<PositioningBand />                // bridge
<ChapterIndex />                   // featured-work
<CapabilitiesSection />            // capabilities
<ResearchProofSection />           // research
<LabsSection />                    // labs
<ContactSection />                 // contact
```

Use these conversion principles:

- Headline: production systems surviving real inputs, constraints, and failure.
- Voice AI remains the sharp proof point in supporting copy and the demo CTA.
- Primary CTA is `Start a project` to `/contact`; `Hear the demo` is secondary.
- Featured work is sourced from `featuredWork`; Labs from `labWork`.
- Capabilities describe audit, scoped build, and advisory with concrete outputs.
- Research cards link to `/benchmark`, `/latency`, `/patterns`, and `/blog`.
- Contact asks for problem, constraint/stack, timeline, and budget while preserving the honest mailto handoff.
- Replace “The systems I am building” with a buyer-oriented proof headline.
- Remove the generic `PhilosophySection` from the homepage sequence; do not delete it yet.

**Step 4: Verify tests and build**

Run: `npm test && npm run build`

Expected: tests pass; homepage compiles; every homepage primary conversion link resolves to `/contact`.

**Step 5: Commit**

```bash
git add components/Home.tsx components/home
git commit -m "feat: position homepage for production AI clients"
```

### Task 5: Complete the mechanism-based project visual registry

**Files:**
- Create: `components/viz/AudiobookViz.tsx`
- Create: `components/viz/SplashInkViz.tsx`
- Create: `components/viz/SpectralViz.tsx`
- Create: `components/viz/LedgerViz.tsx`
- Create: `components/viz/visualRegistry.ts`
- Create: `components/viz/visualRegistry.test.ts`
- Modify: `components/viz/registry.ts`
- Modify: `components/viz/primitives.module.css`
- Modify: `components/viz/types.ts`

**Step 1: Write a failing pure registry-contract test**

Avoid importing CSS-bearing React components into Node. Put registry metadata in `visualRegistry.ts` and test:

```ts
assert.deepEqual(Object.keys(visualRegistry).sort(), [...workVisualKeys].sort());
for (const project of workProjects) {
  const visual = visualRegistry[project.visualKey];
  assert.ok(visual);
  assert.ok(visual.reducedMotionLabel.length > 0);
  assert.match(visual.mechanism, /input|transform|output|guardrail/i);
}
```

**Step 2: Run the test to verify it fails**

Run: `npm test`

Expected: FAIL because `visualRegistry.ts` is missing.

**Step 3: Implement the visual contracts and components**

- `AudiobookViz`: document sheets become chunks, queue nodes, waveform, and assembled timeline.
- `SplashInkViz`: flat ink marks lift into restrained point/splat depth layers.
- `SpectralViz`: waveform/FFT bands become terrain, pillars, and particles.
- `LedgerViz`: raw events pass through reconciliation gates into a balanced ledger.
- Each visual accepts `size`, uses semantic status text or an accessible label outside decorative geometry, and has an explicit stable reduced-motion composition through `useHydratedReducedMotion`.
- Animation is transform/opacity based, pauses under reduced motion, and never obscures labels.
- Update `vizBySlug` to cover all six catalog visual keys. Preserve the existing `market-systems` compatibility alias only if a live route still consumes it.

**Step 4: Verify tests and build**

Run: `npm test && npm run build`

Expected: registry contract passes and no catalog card falls back to an empty field.

**Step 5: Commit**

```bash
git add components/viz
git commit -m "feat: add project-specific system visuals"
```

### Task 6: Build the pure immersive-stage model

**Files:**
- Create: `components/immersive/types.ts`
- Create: `components/immersive/immersiveStages.ts`
- Create: `components/immersive/immersiveStages.test.ts`

**Step 1: Write failing interpolation and profile tests**

Cover boundary behavior, not implementation details:

```ts
assert.equal(clamp01(-0.2), 0);
assert.equal(clamp01(1.2), 1);
assert.deepEqual(sampleImmersiveJourney(-1, "desktop"), immersiveStages[0].camera);
assert.deepEqual(sampleImmersiveJourney(99, "desktop"), immersiveStages.at(-1)?.camera);
assert.equal(getImmersiveProfile({ reducedMotion: true, width: 1440 }), "reduced");
assert.equal(getImmersiveProfile({ reducedMotion: false, width: 430 }), "mobile");
assert.equal(getImmersiveProfile({ reducedMotion: false, width: 1440 }), "desktop");
```

Also test midpoint interpolation, stage-group weights summing to approximately 1, and the exact ordered IDs:

`hero`, `proof`, `bridge`, `featured-work`, `capabilities`, `research`, `labs`, `contact`.

**Step 2: Run the focused suite and verify failure**

Run: `npm test`

Expected: FAIL because the immersive model is missing.

**Step 3: Implement immutable stage keyframes and pure sampling**

Each stage defines camera position, look target, FOV, fog density/color, terrain treatment, and weights for these groups:

```ts
type SceneGroupKey =
  | "horizon" | "signals" | "voice" | "document"
  | "orchestration" | "splats" | "measurement";
```

Implement:

- `clamp01(value)`;
- `getImmersiveProfile({ reducedMotion, width })`;
- `sampleImmersiveJourney(progress, profile)` with smoothstep easing;
- `sampleStagePair(fromId, toId, localProgress, profile)`;
- mobile keyframes with smaller travel/FOV changes;
- reduced keyframes that return composed static states without time-driven movement.

Keep this module free of DOM, React, GSAP, and Three.js so it remains deterministic.

**Step 4: Run tests**

Run: `npm test`

Expected: stage-model tests and the full suite pass.

**Step 5: Commit**

```bash
git add components/immersive
git commit -m "feat: model immersive scroll stages"
```

### Task 7: Map semantic sections to one scroll journey

**Files:**
- Create: `components/immersive/scrollProgress.ts`
- Create: `components/immersive/scrollProgress.test.ts`
- Create: `components/immersive/useImmersiveScroll.ts`
- Modify: `components/Home.tsx`
- Modify: `components/ThreeScene.tsx`

**Step 1: Write failing geometry tests**

Test pure document-to-journey mapping:

```ts
assert.equal(sectionProgress({ top: 100, height: 600 }, 0, 800), 0);
assert.equal(sectionProgress({ top: 100, height: 600 }, 1000, 800), 1);
assert.equal(resolveJourneyProgress(sectionRects, 0, 800), 0);
assert.equal(resolveJourneyProgress(sectionRects, 7200, 800), 1);
```

Include zero-height sections, overlapping boundaries, and clamping.

**Step 2: Run the test to verify it fails**

Run: `npm test`

Expected: FAIL because `scrollProgress.ts` does not exist.

**Step 3: Implement the hook without scroll-jacking**

`useImmersiveScroll(onSample)` must:

- query ordered `[data-immersive-stage]` sections;
- use the existing Lenis `scroll` event if available, native passive scroll otherwise;
- batch DOM reads and updates through `requestAnimationFrame`;
- refresh rects on resize and `ResizeObserver` callbacks;
- calculate global/stage progress through the pure helpers;
- never call `scrollTo`, prevent wheel/touch defaults, add snapping, or change focus;
- unsubscribe observers, Lenis/native listeners, and RAF work on cleanup.

Pass samples to `ThreeScene` through a small event/channel or a shared provider whose React value does not re-render the entire homepage every frame. Prefer a mutable external store/event target over context state at 60fps.

**Step 4: Verify tests and build**

Run: `npm test && npm run build`

Expected: tests pass; semantic sections compile with stable ordered stage IDs.

**Step 5: Commit**

```bash
git add components/immersive components/Home.tsx components/ThreeScene.tsx
git commit -m "feat: map homepage scroll to immersive stages"
```

### Task 8: Refactor the background into the persistent scene director

**Files:**
- Create: `components/immersive/createSceneGroups.ts`
- Create: `components/immersive/sceneLifecycle.ts`
- Create: `components/immersive/sceneLifecycle.test.ts`
- Modify: `components/ThreeScene.tsx`
- Modify: `components/threeSceneTuning.ts`
- Modify: `components/threeSceneTuning.test.ts`
- Modify: `styles/home.module.css`

**Step 1: Write failing lifecycle-policy tests**

Keep pause/degradation decisions pure:

```ts
assert.equal(shouldAnimateScene({ hidden: true, inJourney: true, reducedMotion: false }), false);
assert.equal(shouldAnimateScene({ hidden: false, inJourney: true, reducedMotion: true }), false);
assert.equal(shouldRenderScene({ webglReady: false, inJourney: true }), false);
assert.equal(sceneQualityFor({ profile: "mobile", deviceMemory: 2 }), "minimal");
```

Extend tuning tests to cover desktop, constrained, mobile, and reduced scene-group budgets.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because lifecycle helpers and new tuning fields are missing.

**Step 3: Build the common-world scene groups**

Create lightweight procedural groups using instanced geometry and shared materials:

- horizon terrain and beacons;
- signal rails/particles;
- voice tunnel rings and waveform line;
- document planes/chunks;
- orchestration nodes/edges;
- ink splat point layers;
- measurement grid and ledger lines.

`createSceneGroups` returns groups plus one `dispose()` that disposes every geometry and material exactly once. Avoid runtime texture downloads and additional renderers.

**Step 4: Drive camera, fog, and weights from sampled stages**

Refactor `ThreeScene` so it:

- creates one fixed canvas only on the homepage;
- uses the stage sample for camera position/look target/FOV/fog/group opacity;
- lerps toward sampled values to avoid discontinuities while preserving native-scroll responsiveness;
- keeps pointer parallax secondary and disables it for touch/reduced motion;
- keeps the current shader terrain as the shared spatial foundation;
- no longer fades out after one viewport;
- renders a static composed frame for reduced motion;
- lowers group counts/segments on mobile and constrained profiles;
- pauses when the tab is hidden or the journey is outside the viewport;
- removes listeners and fully disposes WebGL resources on unmount;
- marks WebGL failure on the mount so CSS exposes the static Atlas gradient/grid fallback.

Keep at most one or two visibly moving mechanisms in any stage. The contact stage must settle to an almost still horizon.

**Step 5: Verify unit, build, and bundle behavior**

Run: `npm test && npm run build`

Expected: all tests pass; `/` retains one homepage-only Three.js chunk; non-home routes do not gain a WebGL canvas.

**Step 6: Commit**

```bash
git add components/ThreeScene.tsx components/immersive components/threeSceneTuning.ts components/threeSceneTuning.test.ts styles/home.module.css
git commit -m "feat: direct one immersive homepage world"
```

### Task 9: Add honest Splash Ink and Spectral World case studies

**Files:**
- Create: `app/work/splash-ink/page.tsx`
- Create: `app/work/spectral-world/page.tsx`
- Create: `components/work/CaseStudyShell.tsx`
- Create: `components/work/CaseStudyShell.module.css`
- Create: `components/SplashInkCaseStudy.tsx`
- Create: `components/SpectralWorldCaseStudy.tsx`
- Create: `data/caseStudyContent.ts`
- Create: `data/caseStudyContent.test.ts`
- Modify: `styles/kotaCaseStudy.module.css`

**Source material:**
- `/home/comma/Documents/splash-ink/README.md`
- `/home/comma/Documents/Immersive-auido-visualizer/spectral-world-player/README.md`

**Step 1: Write failing evidence-integrity tests**

Model the new content in `caseStudyContent.ts` and assert:

```ts
assert.equal(caseStudies["splash-ink"].status, "Active R&D");
assert.equal(caseStudies["spectral-world"].status, "Active R&D");
assert.ok(caseStudies["splash-ink"].mechanism.includes("Gaussian Splatting"));
assert.ok(caseStudies["spectral-world"].mechanism.includes("Web Audio"));
assert.ok(Object.values(caseStudies).every((study) => study.limits.length > 0));
assert.ok(!JSON.stringify(caseStudies).match(/client|increased|reduced by|%/i));
```

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because case-study content is absent.

**Step 3: Implement the shared narrative shell**

`CaseStudyShell` renders:

1. identity/status/outcome;
2. signature visual slot;
3. problem and operational constraint;
4. input → transformation → output → guardrail;
5. mechanism/architecture;
6. failure modes and honest limits;
7. artifact/source link when public;
8. related proof/project;
9. `Build a system like this` CTA to `/contact`.

Use it for the two new pages first. Do not refactor the four existing studies in this task.

**Step 4: Implement grounded project content and metadata**

- Splash Ink: single image → preprocessing/depth/point initialization → 3D Gaussian Splatting → explorable scene; mention real CUDA model and stub modes only as documented; describe its prototype/R&D status and input/model limitations.
- Spectral World: local audio → Web Audio FFT/beat/onset analysis → terrain/pillars/particles; mention local-file privacy, quality presets, and performance adaptation; do not claim audience outcomes.
- Export canonical metadata URLs and `CreativeWork` JSON-LD from each page.
- Use the matching project visual above the fold.

**Step 5: Verify tests and build**

Run: `npm test && npm run build`

Expected: both routes are statically generated and claims satisfy evidence tests.

**Step 6: Commit**

```bash
git add app/work/splash-ink app/work/spectral-world components/work components/SplashInkCaseStudy.tsx components/SpectralWorldCaseStudy.tsx data/caseStudyContent.ts data/caseStudyContent.test.ts styles/kotaCaseStudy.module.css
git commit -m "feat: add immersive AI and 3D case studies"
```

### Task 10: Align existing case studies and conversion language

**Files:**
- Modify: `components/KotaCaseStudy.tsx`
- Modify: `components/AudiobookCaseStudy.tsx`
- Modify: `components/ArchonCaseStudy.tsx`
- Modify: `components/RobinhoodCaseStudy.tsx`
- Modify: `app/work/kota/page.tsx`
- Modify: `app/work/audiobook/page.tsx`
- Modify: `app/work/archon/page.tsx`
- Modify: `app/work/robinhood-dashboard/page.tsx`
- Modify: `app/agent/page.tsx`
- Modify: `app/layout.tsx`
- Create: `data/conversionCopy.test.ts`

**Step 1: Write failing source/content invariants**

Test exported metadata/content where possible and source text otherwise. Assert:

- every case study has a `/contact` CTA labeled `Build a system like this`;
- every canonical metadata URL starts with `https://kumma.me/work/`;
- site metadata describes an independent production-AI systems practice;
- public conversion surfaces do not contain `full-time`, `recruiter`, `job seeker`, or `hire me`;
- agent-facing copy describes paid audits, builds, and advisory.

**Step 2: Run tests and verify they fail**

Run: `npm test`

Expected: FAIL on missing CTA and/or stale employment language.

**Step 3: Apply the smallest consistent conversion pass**

- Add the same closing CTA treatment to all existing case studies.
- Keep their distinct technical content and visuals.
- Make canonical URLs `/work/<slug>`.
- Reframe `/agent` as a concise machine-readable services/evidence page, not a recruitment artifact.
- Update root title/description to production AI audits, builds, and advisory while retaining Yang Wu/Kumma identity.
- Do not add fake availability scarcity or testimonials.

**Step 4: Verify tests and build**

Run: `npm test && npm run build`

Expected: conversion invariants pass and all existing work routes build.

**Step 5: Commit**

```bash
git add components/KotaCaseStudy.tsx components/AudiobookCaseStudy.tsx components/ArchonCaseStudy.tsx components/RobinhoodCaseStudy.tsx app/work app/agent/page.tsx app/layout.tsx data/conversionCopy.test.ts
git commit -m "feat: align case studies to paid project conversion"
```

### Task 11: Update discovery, structured data, and internal links

**Files:**
- Modify: `app/sitemap.ts`
- Modify: `components/seo/JsonLd.tsx`
- Modify: `components/menuItems.ts`
- Modify: `components/Navigation.tsx`
- Modify: `components/Footer.tsx`
- Modify: `scripts/generate-og.mjs`
- Create: `data/discoveryRoutes.ts`
- Create: `data/discoveryRoutes.test.ts`

**Step 1: Write failing discovery tests**

Assert:

```ts
assert.deepEqual(workSitemapPaths, [
  "/work",
  ...workProjects.map((project) => project.href),
]);
assert.ok(workSitemapPaths.every((path) => !path.startsWith("/projects")));
assert.equal(new Set(discoveryPaths).size, discoveryPaths.length);
```

Also validate that nav/footer work links are canonical and OG generation contains every catalog slug.

**Step 2: Run the tests and verify failure**

Run: `npm test`

Expected: FAIL because `discoveryRoutes.ts` is absent and sitemap still emits `/projects/*`.

**Step 3: Implement a single discovery path source**

- Build sitemap work routes from `workProjects` plus `/work`; delete legacy `/projects/*` URLs.
- Keep research routes independently listed.
- Add an `ItemList`/`CollectionPage` JSON-LD object for `/work`, with canonical project URLs and honest descriptions.
- Ensure navigation and footer lead to `/work` while the homepage's in-page work anchor remains available contextually.
- Extend OG generation for `/work`, Splash Ink, and Spectral World using existing visual tokens.
- Do not add `llms.txt` in this slice; structured, crawlable HTML and JSON-LD are the higher-confidence foundation.

**Step 4: Verify tests and build**

Run: `npm test && npm run build`

Expected: sitemap has canonical routes only; JSON-LD serializes; all OG images generate.

**Step 5: Commit**

```bash
git add app/sitemap.ts components/seo/JsonLd.tsx components/menuItems.ts components/Navigation.tsx components/Footer.tsx scripts/generate-og.mjs data/discoveryRoutes.ts data/discoveryRoutes.test.ts
git commit -m "feat: strengthen work discovery and structured data"
```

### Task 12: Instrument the client-acquisition funnel

**Files:**
- Create: `components/analytics/conversionEvents.ts`
- Create: `components/analytics/conversionEvents.test.ts`
- Create: `components/analytics/TrackedLink.tsx`
- Modify: `components/home/HeroSection.tsx`
- Modify: `components/home/ChapterIndex.tsx`
- Modify: `components/home/CapabilitiesSection.tsx`
- Modify: `components/home/ContactSection.tsx`
- Modify: `components/work/CaseStudyShell.tsx`
- Modify: `components/Analytics.tsx`

**Step 1: Write failing event-contract tests**

Test an allow-listed, privacy-minimal event factory:

```ts
assert.deepEqual(createConversionEvent("project_start", { source: "hero" }), {
  event: "project_start",
  source: "hero",
});
assert.throws(() => createConversionEvent("unknown" as never, {}));
assert.ok(!JSON.stringify(createConversionEvent("contact_open", { source: "contact" })).includes("email"));
```

Allowed events: `project_start`, `case_study_open`, `demo_open`, `contact_open`, and `mailto_submit`.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because conversion events do not exist.

**Step 3: Implement progressive, vendor-neutral tracking**

- `TrackedLink` dispatches a `kumma:conversion` `CustomEvent` before navigation.
- `Analytics` forwards allowed events to `window.gtag` only when it exists; otherwise the event is a harmless no-op.
- Never include names, email addresses, free-form message content, or other form data.
- Tag hero/contact/case-study/demo actions with stable `source` values.
- Preserve ordinary link behavior when JavaScript or analytics is unavailable.

**Step 4: Verify tests and build**

Run: `npm test && npm run build`

Expected: event contracts pass and no CTA depends on analytics to navigate.

**Step 5: Commit**

```bash
git add components/analytics components/Analytics.tsx components/home components/work/CaseStudyShell.tsx
git commit -m "feat: measure project inquiry intent"
```

### Task 13: Browser-check the full experience and remediate defects

**Files:**
- Modify only files implicated by observed defects
- Create: `docs/qa/2026-07-11-immersive-client-portfolio.md`

**Step 1: Start the production build**

Run: `npm run build`

Expected: exit 0 with all static routes generated.

Run: `npm run start -- -p 4242`

Expected: production server listens on port 4242.

**Step 2: Run desktop browser QA with @playwright**

At 1440×1000 verify:

- homepage order and headings;
- one canvas only and no canvas on `/work` or case-study routes;
- camera/perspective changes at all eight stages;
- text stays readable above the world;
- native wheel/trackpad scroll remains interruptible;
- `/work` cards, all six work pages, legacy redirects, and contact CTAs;
- no console errors, hydration warnings, failed assets, or horizontal overflow;
- keyboard tab order and visible focus;
- contact form creates a properly encoded mailto without exposing data to analytics.

Capture screenshots at hero, KOTA, ARCHON/Splash Ink transition, Labs, contact, `/work`, and both new case studies.

**Step 3: Run mobile and reduced-motion QA**

At 390×844 verify 44px targets, single-column reading order, restrained stage movement, and reasonable frame stability. Emulate `prefers-reduced-motion: reduce` and verify one static composed state per section, no looping decorative animation, and fully visible content.

Disable WebGL or force renderer construction failure and verify the CSS fallback preserves contrast and hierarchy.

**Step 4: Run accessibility and performance checks**

- Check landmarks, one `<h1>` per route, heading order, link names, form labels, contrast, focus visibility, and zoom at 200%.
- Record homepage JS route size from `next build` and compare with the 314 kB prior first-load baseline. Investigate any material increase rather than hiding it.
- Inspect performance trace for long main-thread tasks during scroll. Reduce geometry counts or per-frame DOM work if necessary.

**Step 5: Fix observed defects test-first**

For each defect, add the smallest relevant regression test, confirm it fails, implement the fix, and rerun the focused test plus `npm test`. Do not change the approved information architecture merely to silence a visual problem.

**Step 6: Document evidence**

Create the QA document with:

- tested routes/viewports/motion modes;
- build and test counts;
- screenshots/trace locations;
- bundle comparison;
- known honest limitations;
- any deferred enhancement that is not required for launch.

**Step 7: Commit**

```bash
git add docs/qa/2026-07-11-immersive-client-portfolio.md <remediated-files>
git commit -m "test: verify immersive client portfolio experience"
```

### Task 14: Final review, integration, and publication

**Files:**
- Review all files changed since `709e2ca`

**Step 1: Run the complete verification gate**

Run:

```bash
npm test
npm run build
git diff --check 709e2ca...HEAD
git status --short
```

Expected: all tests pass, production build exits 0, no whitespace errors, and only intentional files are present.

**Step 2: Request independent review**

Use @superpowers:requesting-code-review. Review against both:

- `docs/plans/2026-07-11-immersive-client-portfolio-design.md`
- `docs/plans/2026-07-11-immersive-client-portfolio.md`

Require checks for conversion clarity, evidence honesty, motion accessibility, lifecycle cleanup, mobile performance, canonical routing, and missing test coverage.

**Step 3: Resolve every material finding**

Use @superpowers:receiving-code-review to validate each finding technically. Add a failing regression test before each behavioral fix, rerun focused/full verification, and commit the remediation.

**Step 4: Integrate without overwriting the dirty main worktree**

Use @superpowers:finishing-a-development-branch. Reinspect the main worktree and its stash before integration. Because the main worktree contains unrelated user/Claude experiments, do not reset, force-checkout, or blindly overwrite it. Merge or cherry-pick only after confirming overlap and preserving those changes.

**Step 5: Push only after verified integration**

Run the full verification gate on the integrated branch, then push the intended branch. Confirm local and remote commit IDs match before telling the user another agent can safely continue.

