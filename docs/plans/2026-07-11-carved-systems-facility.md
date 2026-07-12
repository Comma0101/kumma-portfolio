# Carved Systems Facility Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the homepage's fading abstract scene patterns with one continuous, scroll-driven journey through a systems facility carved into the terrain.

**Architecture:** Preserve the existing semantic homepage, single native-scroll coordinator, one Three.js renderer, and tested WebGL lifecycle. Add a pure facility narrative, a continuous camera spline, and one persistent world whose zones occupy different coordinates; each project updates one meaningful architectural event instead of crossfading a decorative group in place. Prove the exterior-to-KOTA greybox slice in a real browser before building the remaining production-art zones.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, CSS Modules, Three.js, existing Lenis integration, Node's built-in test runner, Playwright CLI, GLSL terrain shader.

---

## Working rules

- Read `docs/plans/2026-07-11-carved-systems-facility-design.md` completely before changing code.
- Create a fresh implementation branch/worktree from the documentation tip of `feature/immersive-client-portfolio`. Do not implement in the dirty `master` checkout.
- Use @superpowers:test-driven-development for each behavioral slice.
- Use @superpowers:systematic-debugging for any unexpected failure.
- Use @ui-ux-pro-max for hierarchy, motion, responsive, contrast, and accessibility checks, while preserving the Atlas identity rather than its generic purple/pink suggestion.
- Use @playwright for real-browser checkpoints and @superpowers:verification-before-completion before any completion claim.
- Keep exactly one homepage renderer/canvas/camera/scroll subscriber. Do not add ScrollTrigger camera control, orbit controls, scroll snapping, or wheel/touch interception.
- Keep the page's semantic stage and spatial anchor order unchanged:
  `hero`, `proof`, `kota`, `audiobook`, `archon`, `splash-ink`, `research-labs`, `contact`.
- Keep project copy and conversion actions in semantic HTML. The canvas remains decorative and `aria-hidden`.
- Do not add remote models, textures, post-processing, bloom, shadow maps, or a new state-management library in this implementation.
- Commit after every green task. The greybox checkpoint is a hard stop: do not build Tasks 7–15 until the user approves Task 6 in a real browser.

## Preflight: create the implementation worktree

From the repository root, verify the documentation branch is clean apart from known local Playwright artifacts, then create the implementation worktree:

```bash
git worktree add /tmp/kumma-portfolio-carved-facility \
  -b feature/carved-systems-facility \
  feature/immersive-client-portfolio
cd /tmp/kumma-portfolio-carved-facility
npm test
npm run build
```

Expected: the existing unit suite and static build pass before any implementation.

### Task 1: Define the pure facility narrative

**Files:**
- Create: `components/immersive/facility/types.ts`
- Create: `components/immersive/facility/narrative.ts`
- Create: `components/immersive/facility/narrative.test.ts`

**Step 1: Write the failing narrative-contract tests**

Define the expected zones, events, and monotonic route progression without importing React, the DOM, or Three.js:

```ts
assert.deepEqual(facilityChapters.map((chapter) => chapter.stageId), [
  "hero",
  "proof",
  "kota",
  "audiobook",
  "archon",
  "splash-ink",
  "research-labs",
  "contact",
]);

assert.deepEqual(facilityChapters.map((chapter) => chapter.zone), [
  "exterior-ridge",
  "reliability-spine",
  "voice-chamber",
  "document-foundry",
  "orchestration-atrium",
  "dissolution-observatory",
  "calibration-deck",
  "quiet-horizon",
]);

for (let index = 1; index < facilityChapters.length; index += 1) {
  assert.ok(
    facilityChapters[index].routeProgress >
      facilityChapters[index - 1].routeProgress,
  );
}

const threshold = sampleFacilityNarrative(0.27, "desktop");
assert.equal(threshold.event.id, "cross-threshold");
assert.ok(threshold.event.progress >= 0 && threshold.event.progress <= 1);
```

Also test:

- all numeric values are finite;
- event windows are ordered, contiguous, and non-overlapping;
- only one event is active for any of 101 sampled progress values;
- progress clamps at both ends;
- desktop, mobile, and reduced profiles return valid samples;
- reduced samples select stable chapter poses rather than interpolated movement;
- returned definitions and samples are deeply immutable.

**Step 2: Run the suite and verify failure**

Run: `npm test`

Expected: FAIL because `components/immersive/facility/narrative.ts` does not exist.

**Step 3: Implement the narrative contract**

Use this public surface:

```ts
export type FacilityZoneId =
  | "exterior-ridge"
  | "reliability-spine"
  | "fissure-threshold"
  | "voice-chamber"
  | "document-foundry"
  | "orchestration-atrium"
  | "dissolution-observatory"
  | "calibration-deck"
  | "quiet-horizon";

export type FacilityEventId =
  | "approach"
  | "converge-inputs"
  | "cross-threshold"
  | "clarify-route"
  | "segment-document"
  | "recover-route"
  | "reconstruct-depth"
  | "calibrate"
  | "settle";

export interface FacilityNarrativeSample {
  readonly journeyProgress: number;
  readonly routeProgress: number;
  readonly zone: FacilityZoneId;
  readonly event: {
    readonly id: FacilityEventId;
    readonly progress: number;
    readonly intensity: number;
  };
  readonly atmosphere: {
    readonly fogColor: `#${string}`;
    readonly fogDensity: number;
    readonly exposure: number;
  };
  readonly camera: {
    readonly fov: number;
    readonly lookAhead: number;
    readonly roll: number;
  };
  readonly profile: "desktop" | "mobile" | "reduced";
}
```

`facilityChapters` supplies authored route, fog, FOV, and zone keyframes.
`facilityEventWindows` supplies explicit non-overlapping global progress windows.
`sampleFacilityNarrative(progress, profile)` interpolates chapter treatments but
returns one active event. Keep the module deterministic and dependency-free.

**Step 4: Verify tests**

Run: `npm test`

Expected: the new narrative tests and all existing tests pass.

**Step 5: Commit**

```bash
git add components/immersive/facility
git commit -m "feat: define facility journey narrative"
```

### Task 2: Map native scroll continuously across the route

**Files:**
- Modify: `components/immersive/scrollProgress.ts`
- Modify: `components/immersive/scrollProgress.test.ts`
- Modify: `components/immersive/useImmersiveScroll.ts`

**Step 1: Write failing continuous-progress tests**

The current model moves mostly in short transition windows and then holds. Add a
separate route-progress contract that interpolates across the full distance between
ordered anchor trigger lines:

```ts
const anchors = immersiveStageIds.map((id, index) => ({
  id,
  top: index * 1000,
  height: 900,
}));

const start = resolveFacilityRouteProgress(anchors, 0, 1000);
const middle = resolveFacilityRouteProgress(anchors, 3500, 1000);
const end = resolveFacilityRouteProgress(anchors, 7000, 1000);

assert.equal(start, 0);
assert.ok(middle > 0.4 && middle < 0.6);
assert.equal(end, 1);
```

Add a 25 px scroll-delta test inside a long chapter and assert route progress also
changes; this prevents reintroducing long camera holds. Retain tests for invalid
anchor order, zero heights, repeated tops, clamping, footer exit, and finite output.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because `resolveFacilityRouteProgress` and snapshot route progress do
not exist.

**Step 3: Implement continuous piecewise mapping**

- Add `resolveFacilityRouteProgress(anchors, scrollY, viewportHeight)`.
- Derive one trigger line per anchor and interpolate piecewise between the current
  and next line. Use the same ordered-anchor validation as the existing journey.
- Keep `resolveJourneyState` for active-stage, journey-entry, and footer lifecycle
  semantics.
- Add `routeProgress` to `ImmersiveScrollSnapshot`.
- Keep `useImmersiveScroll` as the sole subscriber and preserve RAF-batched geometry
  reads, ResizeObserver invalidation, Lenis/native fallback, and cleanup.
- Do not call `scrollTo`, prevent defaults, or mutate focus.

**Step 4: Verify tests and build**

Run: `npm test && npm run build`

Expected: all tests pass and the semantic page builds without a second scroll
subscriber.

**Step 5: Commit**

```bash
git add components/immersive/scrollProgress.ts \
  components/immersive/scrollProgress.test.ts \
  components/immersive/useImmersiveScroll.ts
git commit -m "feat: map scroll continuously through facility"
```

### Task 3: Build and validate the continuous camera path

**Files:**
- Create: `components/immersive/facility/cameraPath.ts`
- Create: `components/immersive/facility/cameraPath.test.ts`

**Step 1: Write failing camera-path tests**

Test the path as a pure sampler returning plain vectors:

```ts
const samples = Array.from({ length: 101 }, (_, index) =>
  sampleFacilityCamera(index / 100, "desktop"),
);

assert.deepEqual(samples[0].position, facilityCameraControlPoints[0]);
assert.ok(samples.at(-1)!.position.z < samples[0].position.z);
assert.ok(samples.every((sample) => allFinite(sample.position)));
assert.ok(samples.every((sample) => distance(sample.position, sample.target) > 1));

for (let index = 1; index < samples.length; index += 1) {
  assert.ok(samples[index].position.z <= samples[index - 1].position.z + 0.05);
  assert.ok(distance(samples[index - 1].position, samples[index].position) < 6);
}
```

Also assert:

- the facility entrance is in front of the hero camera;
- threshold samples are lower and more enclosed than exterior samples;
- the ARCHON interval contains the largest vertical reveal;
- the Splash Ink interval contains a controlled lateral reveal;
- absolute roll never exceeds the approved subtle limit;
- mobile travel and FOV changes are smaller than desktop;
- reduced motion returns stable authored poses.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because the camera-path module is missing.

**Step 3: Implement the sampler**

- Define immutable authored control points from exterior ridge through the final
  horizon. Keep route depth monotonic.
- Use one centripetal `THREE.CatmullRomCurve3` for position and a short look-ahead
  sample for the target.
- Apply narrative FOV and roll separately; do not aim directly at foreground copy.
- Return plain `{ x, y, z }` values so the tests do not expose mutable Three.js
  objects.
- Do not add OrbitControls, camera shake, or time-based camera drift.

**Step 4: Verify tests**

Run: `npm test`

Expected: all camera invariants pass.

**Step 5: Commit**

```bash
git add components/immersive/facility/cameraPath.ts \
  components/immersive/facility/cameraPath.test.ts
git commit -m "feat: author continuous facility camera path"
```

### Task 4: Establish facility resources, materials, terrain, and budgets

**Files:**
- Create: `components/immersive/facility/resourceTracker.ts`
- Create: `components/immersive/facility/resourceTracker.test.ts`
- Create: `components/immersive/facility/materials.ts`
- Create: `components/immersive/facility/terrain.ts`
- Modify: `components/threeSceneTuning.ts`
- Modify: `components/threeSceneTuning.test.ts`

**Step 1: Write failing resource and quality tests**

Add a `FacilityBudgets` contract covering terrain segments, repeated ribs, slabs,
bridges, depth samples, calibration marks, and a draw-call target. Assert budgets
decrease monotonically from desktop to constrained to mobile to reduced.

Test that `createResourceTracker()`:

- registers geometry and materials exactly once;
- disposes every registered resource once;
- remains idempotent when `dispose()` is called twice;
- cleans partially created resources after a thrown builder error.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because facility budgets and the tracker do not exist.

**Step 3: Implement the shared resource layer**

- Add `facilityBudgets` to `ThreeSceneTuning` without removing legacy group budgets
  yet; legacy fields are removed only after the new world is complete.
- Centralize Atlas facility materials: terrain, shell, steel, paper/sand, active
  signal, ink atmosphere, and low-emphasis guide.
- Use `MeshStandardMaterial` or restrained shader materials for signature geometry.
  Keep shared instances and avoid per-object material creation.
- Extract the terrain creation/disposal contract from `ThreeScene` into
  `facility/terrain.ts`.
- Extend the terrain shader with a deterministic reliability-spine/fissure mask.
  The path must visibly carve or flatten the terrain; do not overlay a floating
  grid.
- Expand/reposition the terrain plane to cover the complete camera route.
- Retain fog uniforms and quality-specific noise octave/segment budgets.

**Step 4: Verify tests and build**

Run: `npm test && npm run build`

Expected: tests pass, shaders compile during the production build, and the current
live scene remains unchanged because the facility is not wired yet.

**Step 5: Commit**

```bash
git add components/immersive/facility \
  components/threeSceneTuning.ts components/threeSceneTuning.test.ts
git commit -m "feat: prepare facility terrain and resources"
```

### Task 5: Build the exterior-to-KOTA greybox world

**Files:**
- Create: `components/immersive/facility/createFacilityWorld.ts`
- Create: `components/immersive/facility/createFacilityWorld.test.ts`
- Create: `components/immersive/facility/zones/shared.ts`
- Create: `components/immersive/facility/zones/exterior.ts`
- Create: `components/immersive/facility/zones/voice.ts`

**Step 1: Write failing world-structure tests**

Use semantic object names and `userData` contracts rather than snapshotting raw
Three.js objects:

```ts
const world = createFacilityWorld(fullTuning);

assert.deepEqual(Object.keys(world.zones), [
  "exterior-ridge",
  "reliability-spine",
  "fissure-threshold",
  "voice-chamber",
]);

assert.ok(world.root.getObjectByName("facility-distant-entrance"));
assert.ok(world.root.getObjectByName("facility-reliability-spine"));
assert.ok(world.root.getObjectByName("facility-threshold-occluder"));
assert.ok(world.root.getObjectByName("facility-voice-ambiguity-gate"));
```

Assert that:

- zone bounds occupy distinct forward route ranges rather than a shared origin;
- every `userData.signature = true` object is a mesh/instanced mesh with thickness,
  not `LineBasicMaterial` or a free-floating point cloud;
- the entrance is visible from the hero camera frustum;
- voice ribs, conduits, gate, unsafe branch, clarified branch, and order plane are
  present;
- `update(sample, elapsed, motionEnergy)` is deterministic for equal inputs;
- clarification progress changes the active route but never moves unrelated zones;
- disposal is idempotent and releases all tracked resources.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because `createFacilityWorld` is missing.

**Step 3: Implement the greybox geometry**

- Exterior: distant entrance/monolith, large ridge silhouettes, and restrained
  wayfinding light.
- Reliability spine: recessed or raised physical channels converging toward the
  entrance.
- Threshold: fissure walls, repeated structural ribs, a dark occluder, and warm
  practical light beyond it.
- Voice chamber: structural ribs, wall conduits, ambiguity gate, unsafe branch,
  clarified branch, and a stable order plane.
- Use instanced geometry for repetitions and actual tubes/ribbons/boxes for signal
  paths.
- Keep materials deliberately simple in this task. The goal is silhouette, scale,
  route, occlusion, and mechanism legibility—not final polish.
- Build all zones once. `update()` changes mechanism state and light emphasis; it
  does not fade whole zones in and out.

**Step 4: Verify tests**

Run: `npm test`

Expected: all unit tests pass.

**Step 5: Commit**

```bash
git add components/immersive/facility
git commit -m "feat: build facility greybox entrance and voice chamber"
```

### Task 6: Wire the greybox slice and pass the mandatory browser checkpoint

**Files:**
- Modify: `components/ThreeScene.tsx`
- Modify: `components/immersive/useImmersiveScroll.ts`
- Modify: `components/immersive/sceneLifecycle.ts`
- Modify: `components/immersive/sceneLifecycle.test.ts`
- Modify: `components/home/ChapterIndex.tsx`
- Modify: `components/home/ChapterIndex.module.css`
- Modify: `components/home/PositioningBand.module.css`
- Modify: `components/home/HeroSection.module.css`
- Modify: `styles/home.module.css`
- Create: `docs/qa/2026-07-11-carved-facility-greybox.md`

**Step 1: Write failing integration-policy tests**

Add source/lifecycle contracts that require:

- `ThreeScene` imports `createFacilityWorld`, `sampleFacilityNarrative`, and
  `sampleFacilityCamera`;
- `ThreeScene` no longer imports or calls `createSceneGroups`;
- one scroll listener remains in `useImmersiveScroll`;
- reduced motion applies facility samples immediately and performs no time update;
- context restoration rebuilds the facility candidate before rendering;
- a route-progress change wakes a settled scene even if the active stage did not
  change;
- the homepage project layout no longer renders `SystemViz` inside the desktop
  immersive project chapter.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL on the new facility integration contracts.

**Step 3: Integrate the new world without weakening lifecycle safety**

- Replace terrain-plus-group resources with terrain-plus-facility resources while
  keeping candidate-first construction, partial-build cleanup, live profile swaps,
  context loss/restore, and one mounted canvas.
- Drive camera pose from `routeProgress`; drive atmosphere/event state from the pure
  facility narrative.
- Keep a small damping layer for normal motion, immediate samples for reduced motion,
  and instant reversal when target progress changes direction.
- Do not drive the camera with GSAP or add another animation loop.
- Retain the old `createSceneGroups` files temporarily for deletion in Task 13, but
  leave them unreachable from production code.

**Step 4: Open the foreground aperture**

- Convert featured-project rows from large two-column opaque cards to chapter
  sections with a copy edge and directional scrim.
- Keep project title, status, summary, tags, evidence flow, and CTA in the DOM.
- Remove the redundant desktop homepage `SystemViz`; it remains available on `/work`
  and case-study routes.
- At the KOTA key moment, measure that copy/scrim occupies no more than about 42% of
  the 1440 px viewport and leaves the ambiguity gate/order route visible.
- Preserve an opaque, normal-flow, readable mobile layout and 44 px touch targets.
- Keep body text free of parallax and long pinning.

**Step 5: Verify unit/build before browser QA**

Run: `npm test && npm run build`

Expected: all tests pass and the static build succeeds.

**Step 6: Run the real-browser greybox checkpoint with @playwright**

Start the server:

```bash
npm run dev
```

At 1440×1000 inspect and capture:

1. hero with destination clearly visible;
2. approach with reliability paths physically converging;
3. threshold with an unmistakable exterior-to-interior occlusion;
4. KOTA with one route splitting and resolving;
5. the same sequence in reverse scroll;
6. scene-only frames with foreground temporarily hidden;
7. text-only/WebGL-disabled behavior;
8. 390×844 mobile;
9. `prefers-reduced-motion: reduce` static poses.

Store screenshots under `output/playwright/carved-facility-greybox/` and record the
viewport, scroll position, console output, and judgment against all nine design
gates in the QA document.

**Step 7: Stop and request approval**

Do not proceed to Task 7 unless the user agrees that the browser slice reads as:

`terrain → destination → approach → physical entrance → voice chamber`

If it still reads as a background pattern, revise Tasks 3–6 rather than building
more zones.

**Step 8: Commit the approved greybox**

```bash
git add components/ThreeScene.tsx components/immersive \
  components/home styles/home.module.css \
  docs/qa/2026-07-11-carved-facility-greybox.md
git commit -m "feat: prove carved facility journey greybox"
```

### Task 7: Build the Audiobook document foundry

**Files:**
- Create: `components/immersive/facility/zones/document.ts`
- Create: `components/immersive/facility/zones/document.test.ts`
- Modify: `components/immersive/facility/createFacilityWorld.ts`
- Modify: `components/immersive/facility/createFacilityWorld.test.ts`

**Step 1: Write failing mechanism-state tests**

Create a pure `documentStateAt(progress)` helper and test the authored phases:

- source slabs are intact at progress 0;
- slabs separate into ordered segments before the midpoint;
- queue lanes remain ordered and bounded;
- one visible stale lane recovers without random motion;
- all segments form one continuous output band at progress 1;
- reverse sampling returns the exact prior states.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because the document foundry is missing.

**Step 3: Implement the zone**

- Use architectural-scale instanced slabs with physical thickness.
- Place source, segmentation track, queue, recovery lane, and output band along the
  continuous route.
- Update preallocated instance matrices; do not allocate objects per frame.
- Use signal green only on the currently active transform and warm paper/sand for
  readable slabs.
- Leave the outgoing band visible as the route toward ARCHON.

**Step 4: Verify tests/build and inspect the chapter**

Run: `npm test && npm run build`

Expected: all tests pass; browser inspection shows one legible segmentation and
reassembly event with no floating page wallpaper.

**Step 5: Commit**

```bash
git add components/immersive/facility
git commit -m "feat: add facility document foundry"
```

### Task 8: Build the ARCHON orchestration atrium

**Files:**
- Create: `components/immersive/facility/zones/orchestration.ts`
- Create: `components/immersive/facility/zones/orchestration.test.ts`
- Modify: `components/immersive/facility/createFacilityWorld.ts`
- Modify: `components/immersive/facility/createFacilityWorld.test.ts`

**Step 1: Write failing route-recovery tests**

Create a pure `orchestrationStateAt(progress)` helper. Test:

- the coordinator receives the incoming foundry route;
- the worker route is attempted before the recovery route;
- the blocked route visibly stops at its safety boundary;
- the alternate route activates afterward;
- the trace remains inspectable at progress 1;
- only one route head moves at a time;
- reverse sampling is deterministic.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because the atrium module is absent.

**Step 3: Implement architectural hierarchy**

- Build a coordinator core, worker bridges, tool and memory wings, safety gate, and
  alternate recovery route as large spatial forms.
- Give the atrium the journey's largest vertical reveal through camera path and
  lighting, not extra particles.
- Use a single routed signal and persistent trace. Do not construct random nodes or
  connect arbitrary pairs.
- Keep repeated bridge/rib geometry instanced and within profile budgets.

**Step 4: Verify tests/build and inspect the reveal**

Run: `npm test && npm run build`

Expected: all tests pass; the camera can read the coordinator/worker/safety hierarchy
without foreground copy hiding the atrium.

**Step 5: Commit**

```bash
git add components/immersive/facility
git commit -m "feat: add orchestration atrium and recovery route"
```

### Task 9: Build the Splash Ink dissolution observatory

**Files:**
- Create: `components/immersive/facility/zones/dissolution.ts`
- Create: `components/immersive/facility/zones/dissolution.test.ts`
- Modify: `components/immersive/facility/createFacilityWorld.ts`
- Modify: `components/immersive/facility/createFacilityWorld.test.ts`

**Step 1: Write failing coherent-depth tests**

Test deterministic `sampleInkSurface(seed, budget)` output:

- identical inputs produce identical points;
- samples lie within a bounded distance of an authored surface/depth field;
- the point set has meaningful x/y/z variance and is not a uniform volume scatter;
- mobile/reduced counts stay within their budgets;
- dissolution progress transforms a facility aperture into the sampled surface;
- reverse progress reconstructs the aperture exactly.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because the observatory module is absent.

**Step 3: Implement the observatory**

- Build a framed flat ink plane, a sampled depth field, and a coherent spatial
  landscape/aperture.
- This is the one zone where points/splats may be a signature material, because they
  reconstruct a surface rather than fill space decoratively.
- Keep the facility frame, terrain spine, and Atlas materials visible during the
  transition.
- Use one controlled camera lateral reveal. Do not orbit or introduce free look.

**Step 4: Verify tests/build and inspect parallax**

Run: `npm test && npm run build`

Expected: all tests pass and scene-only screenshots show flat source, depth, and
spatial result as one causal transformation.

**Step 5: Commit**

```bash
git add components/immersive/facility
git commit -m "feat: add dissolution observatory"
```

### Task 10: Build the calibration deck and quiet exit

**Files:**
- Create: `components/immersive/facility/zones/calibration.ts`
- Create: `components/immersive/facility/zones/calibration.test.ts`
- Modify: `components/immersive/facility/createFacilityWorld.ts`
- Modify: `components/immersive/facility/createFacilityWorld.test.ts`
- Modify: `components/immersive/facility/cameraPath.ts`
- Modify: `components/immersive/facility/cameraPath.test.ts`

**Step 1: Write failing settle-state tests**

Test that:

- calibration marks are attached to deck instruments/surfaces, not an infinite
  floating grid;
- perspective, FOV, fog contrast, and event intensity calm from observatory to deck;
- contact returns to an open horizon composition;
- all mechanism event intensity reaches zero at the final sample;
- one stable signal remains and does not loop or pulse;
- the route remains continuous through the exit.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because the calibration and exit zones are missing.

**Step 3: Implement the final zones**

- Build a wide survey deck, engraved tolerances, and a few architectural measurement
  instruments.
- Use secondary thin guide lines only where attached to a real surface.
- Level the camera gradually and reduce atmospheric contrast.
- End on a quiet exterior horizon with all active mechanisms settled.

**Step 4: Verify tests/build and inspect contact composition**

Run: `npm test && npm run build`

Expected: all tests pass; the contact form remains readable and visually dominant.

**Step 5: Commit**

```bash
git add components/immersive/facility
git commit -m "feat: add facility calibration deck and quiet exit"
```

### Task 11: Make motion scroll-powered and idle-stable

**Files:**
- Create: `components/immersive/facility/motionEnergy.ts`
- Create: `components/immersive/facility/motionEnergy.test.ts`
- Modify: `components/ThreeScene.tsx`
- Modify: `components/immersive/sceneLifecycle.ts`
- Modify: `components/immersive/sceneLifecycle.test.ts`

**Step 1: Write failing motion-energy tests**

Test a pure policy that:

- increases energy from finite route-progress velocity;
- clamps spikes caused by restoration or resize;
- decays smoothly to zero after scroll stops;
- returns zero for reduced motion, hidden tabs, and outside-journey states;
- wakes on same-stage route changes;
- stops requesting frames once the camera and event state have settled.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because the motion policy does not exist.

**Step 3: Integrate motion energy**

- Make camera/event progress functions of scroll position.
- Allow at most one quiet time-driven cue, multiplied by motion energy.
- Decay terrain/lighting activity to stillness shortly after the visitor stops.
- Remove generic root-group bobbing, rotation, scale pulsing, and unrelated terrain
  drift.
- Wake the loop on any route-progress change and settle it again without missing
  reverse scroll.
- Preserve immediate static rendering for reduced motion.

**Step 4: Verify tests and perform an idle screenshot check**

Run: `npm test && npm run build`

Expected: tests pass; two screenshots taken 1 second apart after settling are
byte-identical or differ only in the explicitly approved quiet cue. Under reduced
motion they must be byte-identical.

**Step 5: Commit**

```bash
git add components/ThreeScene.tsx components/immersive
git commit -m "feat: settle facility motion when scroll stops"
```

### Task 12: Finish homepage composition and responsive states

**Files:**
- Modify: `components/home/HeroSection.module.css`
- Modify: `components/home/ProofConsole.module.css`
- Modify: `components/home/PositioningBand.module.css`
- Modify: `components/home/ChapterIndex.tsx`
- Modify: `components/home/ChapterIndex.module.css`
- Modify: `components/home/CapabilitiesSection.module.css`
- Modify: `components/home/ResearchProofSection.module.css`
- Modify: `components/home/LabsSection.module.css`
- Modify: `components/home/ContactSection.module.css`
- Modify: `components/uxPolishCss.test.ts`

**Step 1: Add failing layout/accessibility contracts**

Retain source-level tests only for durable invariants:

- project evidence remains in semantic HTML;
- project CTA labels and URLs remain unchanged;
- homepage project chapters no longer import `SystemViz`;
- reduced-motion CSS removes foreground reveal transitions;
- mobile restores opaque readable surfaces and one-column flow;
- touch actions remain at least 44 px;
- no body-copy parallax or pinned content is introduced.

Use Playwright, not brittle CSS string tests, for actual viewport coverage and
contrast.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL on the new durable composition contracts.

**Step 3: Complete the editorial layout**

- Give each project roughly one viewport of normal-flow reading space.
- Alternate copy edge only when it preserves the zone's focal event.
- Use directional scrims that fade into the scene instead of full-width opaque
  cards.
- Keep a readable maximum text measure and 1.5–1.75 body line height.
- Keep nav, proof, capabilities, research, labs, and contact backgrounds consistent
  with the facility frames; do not turn them into unrelated card styles.
- On mobile, favor full-width content and static/low-motion scene crops.
- Verify 375, 390, 768, 1024, and 1440 px widths plus 200% zoom.

**Step 4: Verify tests/build and browser measurements**

Run: `npm test && npm run build`

In Playwright measure the project-copy bounding box at 1440×1000 and confirm the
world retains at least roughly 58% visual aperture at each project's key frame.
Check primary/secondary text contrast against both bright and dark scene frames.

**Step 5: Commit**

```bash
git add components/home components/uxPolishCss.test.ts
git commit -m "feat: compose homepage around facility journey"
```

### Task 13: Remove the obsolete pattern-group architecture

**Files:**
- Delete: `components/immersive/createSceneGroups.ts`
- Delete: `components/immersive/createSceneGroups.test.ts`
- Modify: `components/immersive/types.ts`
- Modify: `components/immersive/immersiveStages.ts`
- Modify: `components/immersive/immersiveStages.test.ts`
- Modify: `components/immersive/sceneLifecycle.ts`
- Modify: `components/immersive/sceneLifecycle.test.ts`
- Modify: `components/threeSceneTuning.ts`
- Modify: `components/threeSceneTuning.test.ts`

**Step 1: Write the cleanup contract**

Update tests to require the facility narrative as the production stage contract.
Add a source scan over production TypeScript that rejects the obsolete mechanism
identifiers and APIs:

```ts
for (const forbidden of [
  "createSceneGroups",
  "SceneGroupWeights",
  "dampSceneGroupWeights",
  "voice-tunnel-rings",
  "orchestration-nodes",
  "measurement-coordinate-grid",
]) {
  assert.doesNotMatch(productionImmersiveSource, new RegExp(forbidden));
}
```

Exclude historical docs from this scan so the design rationale remains intact.

**Step 2: Run tests and verify failure**

Run: `npm test`

Expected: FAIL because legacy groups and types still exist.

**Step 3: Delete dead architecture**

- Remove the old factory and tests.
- Remove group weights, group budget fields, interpolation, damping, and motion
  helpers that no production code consumes.
- Point remaining stage/profile exports to the facility narrative or rename them in
  one coherent pass; do not keep parallel sources of truth.
- Retain proven renderer lifecycle, resource transaction, scroll geometry, and
  fallback tests.
- Run `rg` for every deleted symbol before committing.

**Step 4: Verify full tests and build**

Run: `npm test && npm run build`

Expected: all tests pass, static build succeeds, and no production source references
the removed pattern system.

**Step 5: Commit**

```bash
git add -A components/immersive components/threeSceneTuning.ts \
  components/threeSceneTuning.test.ts
git commit -m "refactor: remove abstract scene pattern system"
```

### Task 14: Run full visual, accessibility, resilience, and performance QA

**Files:**
- Create: `docs/qa/2026-07-11-carved-systems-facility.md`
- Modify: only files implicated by observed defects

**Step 1: Run the automated verification gate**

```bash
npm test
npm run build
git diff --check feature/immersive-client-portfolio...HEAD
```

Expected: tests and build pass with no whitespace errors.

**Step 2: Run desktop journey QA with @playwright**

At 1440×1000 capture the nine journey moments defined in the design document. For
each frame record:

- camera destination and threshold visibility;
- active event and whether any second event competes;
- foreground aperture and text contrast;
- console errors/warnings;
- `renderer.info.render.calls`, triangles, points, and lines;
- forward and reverse scroll behavior.

Run the scene-only test by temporarily hiding foreground HTML in the test browser,
not in production code. A reviewer must be able to order exterior, entrance,
chambers, observatory/deck, and exit from the frames alone.

**Step 3: Run responsive and accessibility QA**

Verify:

- 390×844 mobile and a 375 px small-phone width;
- 768 and 1024 px transition widths;
- 200% zoom equivalent;
- keyboard order, skip link, focus visibility, headings, links, and contact form;
- reduced-motion static composition at every spatial anchor;
- text-only/WebGL-disabled flow;
- WebGL context loss and restoration with the same canvas;
- tab-hidden and outside-journey loop suspension;
- no horizontal overflow or blocked native gestures.

**Step 4: Run performance QA**

- Compare homepage first-load JS with the recorded 322 kB immersive baseline.
- Investigate and document any increase above 15 kB rather than accepting it
  silently.
- Keep approximate draw-call targets at or below 45 desktop, 32 constrained, and 22
  mobile at representative frames; if a target is missed, profile before changing
  visual intent.
- Record a hardware-GPU performance trace during full-page forward and reverse
  scroll. Headless SwiftShader FPS is not a publishable result.
- Require no sustained main-thread task over 50 ms from scene updates.

**Step 5: Fix defects test-first**

For every behavioral defect, add the smallest regression test, observe it fail,
implement the fix, and rerun the focused/full suites. For art-direction defects,
record before/after screenshots and judge against the spatial grammar rather than
adding unplanned effects.

**Step 6: Document and commit QA evidence**

The QA document must include tested commit, viewports, motion profiles, screenshot
paths, build/test counts, bundle comparison, renderer budgets, known limitations,
and any deferred non-launch work.

```bash
git add docs/qa/2026-07-11-carved-systems-facility.md <remediated-files>
git commit -m "test: verify carved systems facility experience"
```

### Task 15: Independent review and safe integration

**Files:**
- Review every file changed from `feature/immersive-client-portfolio`

**Step 1: Request independent review**

Use @superpowers:requesting-code-review against:

- `docs/plans/2026-07-11-carved-systems-facility-design.md`
- `docs/plans/2026-07-11-carved-systems-facility.md`

Require explicit judgments on spatial continuity, scene meaning, project mechanism
accuracy, content aperture, reverse scroll, accessibility, cleanup, lifecycle safety,
resource disposal, and missing tests.

**Step 2: Resolve material feedback rigorously**

Use @superpowers:receiving-code-review. Validate every finding, add regression tests
for behavioral fixes, and do not answer art-direction concerns by adding decorative
effects.

**Step 3: Run final verification**

```bash
npm test
npm run build
git diff --check feature/immersive-client-portfolio...HEAD
git status --short
```

Expected: all tests pass, the build succeeds, the diff is clean, and the worktree
contains no generated browser artifacts.

**Step 4: Publish the reviewed feature branch**

Push `feature/carved-systems-facility` and confirm local/remote commit IDs match.
Do not merge through the dirty `master` checkout or discard its unrelated changes.
Use @superpowers:finishing-a-development-branch to present a safe merge/PR choice
after the user approves the final hardware/browser experience.

## Definition of done

The work is done only when:

- the scene reads as one physical route without foreground HTML;
- the visitor visibly approaches and enters the facility;
- KOTA, Audiobook, ARCHON, and Splash Ink each perform one distinct causal event;
- no obsolete abstract pattern group remains in production code;
- project copy leaves enough visual aperture for those events;
- native forward and reverse scrolling remain immediate and interruptible;
- mobile, reduced motion, WebGL failure, context recovery, keyboard, and 200% zoom
  remain complete;
- full unit/build/browser/performance evidence is recorded;
- the final branch is reviewed and pushed without disturbing the dirty `master`
  worktree.
