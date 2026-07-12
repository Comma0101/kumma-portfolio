# Claude Continuation Handoff: Immersive Client Portfolio

Updated: 2026-07-11 (America/Los_Angeles)

## Completion update (2026-07-11, later session)

All fourteen plan tasks are complete. The Task 8 review checkpoint passed
(both handoff judgment points accepted as-is), Tasks 9–13 were implemented
test-first, and the Task 14 independent review returned APPROVE with zero
blocker/major findings; its two minor findings (runtime tests for the
privacy-critical analytics forwarding) and two in-scope nits (self-contained
`/work` JSON-LD author, 16px mobile stage prose) were remediated in `7b4f6fe`.

- Final verification: 312/312 unit tests, `next build` 65/65 static pages,
  `git diff --check 709e2ca...HEAD` clean, worktree clean.
- QA evidence: `docs/qa/2026-07-11-immersive-client-portfolio.md`.
- Branch pushed: `feature/immersive-client-portfolio` at
  `7b4f6fe1e303bb84670f22d488e0c60f9c8ad1da`, tracking origin; local and
  remote IDs verified identical. `origin/master` was still at `709e2ca`
  (the branch base), so no reconciliation was required.
- Deliberately not done: merging to `master` (which deploys the live site).
  The dirty `master` checkout in `/home/comma/Documents/kumma-portfolio`
  still holds unrelated uncommitted experiments that overlap this branch
  (`app/sitemap.ts`, `data/projectData.ts`, `package.json`); that merge and
  the conflict decisions belong to the user.

## Start here

Continue in the clean feature worktree:

```bash
cd /tmp/kumma-portfolio-immersive-client
git status --short --branch
git log -5 --oneline
```

- Branch: `feature/immersive-client-portfolio`
- Implementation tip before this handoff document: `1a37b96`
- Base and current local/remote `master` when this handoff was written:
  `709e2ca0c3ee745f3b1daddbf2c3b4e59cc53063`
- The feature branch has no upstream and has not been pushed.
- The feature worktree was clean at `1a37b96`.
- Do **not** continue implementation in
  `/home/comma/Documents/kumma-portfolio`; that `master` checkout contains
  unrelated uncommitted Claude/user experiments.

Read these files completely before changing code:

1. `docs/plans/2026-07-11-immersive-client-portfolio-design.md`
2. `docs/plans/2026-07-11-immersive-client-portfolio.md`
3. `.agents/product-marketing.md`
4. `/home/comma/Documents/kumma-portfolio/AGENTS.md`

The implementation plan is authoritative. Tasks 1–8 are implemented; continue
with Task 9 after the Task 8 review checkpoint below.

## Product objective

Turn kumma.me into an Awwwards-caliber, immersive portfolio that attracts paid
production-AI audits, scoped builds, and advisory engagements from founders,
CTOs, and technical leaders.

Non-negotiables:

- Optimize for contracts and paid projects, **not** full-time recruiting.
- Voice AI is the strongest wedge, not the only capability.
- Show mechanisms and evidence, not unsupported outcome claims.
- Do not invent metrics, customers, logos, testimonials, or maturity.
- Keep one continuous Three.js world on the homepage.
- Keep native, interruptible scrolling. No scroll-jacking, snapping, or
  independently parallaxed reading text.
- Preserve semantic HTML, keyboard usability, mobile performance, and a real
  reduced-motion composition.
- Keep the canonical Atlas visual language: canvas/paper/sand/signal green;
  avoid generic purple/neon portfolio styling.

## Current plan status

| Task | Status | Notes |
|---|---|---|
| 1. Reliable unit-test harness | Complete | Discovers nested tests and rejects zero-test runs. |
| 2. Canonical typed work catalog | Complete | Four featured projects, two labs, honest evidence. |
| 3. Canonical `/work` index | Complete | Static-export-safe legacy aliases and two R&D previews. |
| 4. Client-focused homepage | Complete | Audits/builds/advisory positioning and qualified contact form. |
| 5. Project visual registry | Complete | Six consistent mechanism visuals with mobile/reduced states. |
| 6. Pure immersive stage model | Complete | Eight project-specific spatial stages. |
| 7. Native-scroll journey mapping | Complete | One Lenis/native coordinator; no React state at scroll rate. |
| 8. Persistent Three.js scene director | Implemented; final review checkpoint remains | Spec review passed. Final lifecycle fixes are at `1a37b96`; independent post-fix quality re-review was interrupted by reviewer quota. |
| 9. Splash Ink + Spectral World case studies | Next | Existing routes are previews, not final studies. |
| 10. Existing case-study conversion alignment | Pending | KOTA, Audiobook, ARCHON, Robinhood, `/agent`, root metadata. |
| 11. Discovery/SEO/schema/internal links | Pending | Sitemap, JSON-LD, navigation, footer, OG. |
| 12. Privacy-safe conversion analytics | Pending | Vendor-neutral event contract; no form PII. |
| 13. Full browser/performance/accessibility QA | Pending | Includes trace, 200% zoom, WebGL fallback, all routes. |
| 14. Final review, integration, and publication | Pending | Reconcile latest `master`, verify, push. |

## Verification at the handoff

Latest verified implementation state (`1a37b96`):

- `npm test`: **259/259 passing**.
- `npm run build`: passed; **65/65 static pages** generated.
- `git diff --check`: clean.
- Feature worktree: clean.
- Homepage: one persistent canvas/renderer/camera/RAF loop.
- `/work`: zero WebGL canvases.
- Desktop browser checks covered hero, KOTA, ARCHON → Splash Ink,
  research/labs, contact, and footer handoff.
- Mobile check: 390×844, mobile budgets, no horizontal overflow, content stayed
  primary.
- Reduced motion: screenshots 800 ms apart were byte-identical.
- Live desktop → mobile → desktop and desktop → reduced → desktop resource
  swaps retained the same single canvas.
- Forced `WEBGL_lose_context` test: `unavailable` on loss, returned to `ready`
  on restore, same canvas, terrain resumed, no console errors.
- Footer handoff occurs when about 25% of the footer enters; reverse scrolling
  restores the scene.

Expected browser-only warnings during forced GPU tests:

- Chromium context-loss warning.
- GPU `ReadPixels` warnings caused by screenshot capture.
- One application fallback warning on the intentionally forced context loss.

There were no stale-handle `INVALID_OPERATION` warnings after `1a37b96`.

No formal FPS/performance trace has been recorded yet. The last observed
homepage first-load size was about 320 kB versus the plan's earlier 314 kB
baseline. Task 13 must measure rather than assume performance is acceptable.

## Required first checkpoint for Claude

Before marking Task 8 complete, independently review commit `1a37b96` and rerun
the full tests/build. The preceding quality review found two issues at
`d042206`:

1. profile resource swaps were not exception-safe;
2. WebGL restoration never re-enabled rendering.

Both were fixed in `1a37b96` with:

- immediate resource registration and partial-construction cleanup in
  `components/immersive/createSceneGroups.ts`;
- the tested transaction helper in
  `components/immersive/resourceTransaction.ts`;
- candidate-first world swaps that retain the live world on failure;
- initial-world teardown before any canvas is left mounted;
- context-loss retirement and fresh resource construction before the first
  restored render;
- `webglcontextrestored` wake/resync handling.

The final independent quality re-review did not finish because the reviewer hit
its usage limit. Inspect at least:

- `components/ThreeScene.tsx`
- `components/immersive/createSceneGroups.ts`
- `components/immersive/resourceTransaction.ts`
- their tests

Specific judgment points worth checking:

- `swapResourceCandidate` assumes the actual Three.js detach operation
  (`removeFromParent`) is non-throwing; decide whether its generic rollback
  contract needs a candidate-detach operation.
- Initial `scene.add(...)` and `mount.appendChild(...)` occur after successful
  resource construction and are expected to be non-throwing; decide whether an
  additional transaction boundary is warranted.
- Per-frame lifecycle policy object literals were noted as a non-blocking
  micro-allocation; do not refactor unless profiling shows value.

If the review is clean, mark Task 8 complete and begin Task 9. If a material
issue is found, add a failing regression test before fixing it.

## Architecture already established

### Canonical project model

`data/workProjects.ts` is the source of truth.

Featured, in order:

1. KOTA
2. Audiobook AI
3. ARCHON
4. Splash Ink

Labs:

1. Spectral World Player
2. Robinhood Data Correctness

Do not recreate a second project list in a component.

### Canonical routing

- `/work` is the real project index.
- Canonical detail routes are `/work/<slug>`.
- `/projects` and `/projects/<slug>` are static-export-safe aliases using a
  canonical tag, noindex/follow, meta refresh, and visible fallback link.
- True HTTP 301/308 redirects are impossible under the current
  `output: "export"` GitHub Pages deployment without CDN/hosting changes.

### Homepage content stages vs scene stages

Keep these semantic `data-immersive-stage` values unchanged:

```text
hero, proof, bridge, featured-work, capabilities, research, labs, contact
```

They are deliberately separate from the spatial `data-immersive-anchor` order:

```text
hero, proof, kota, audiobook, archon, splash-ink, research-labs, contact
```

The four project rows each own a spatial anchor. Capabilities starts the shared
research/labs measurement plane. The bridge, research, and labs sections do not
invent extra camera environments.

### Single scroll coordinator

`useImmersiveScroll` is the only scene scroll subscriber:

- uses existing `window.lenis` when present;
- passive native fallback otherwise;
- RAF-batched geometry reads/samples;
- stable ref handoff to `ThreeScene`;
- observes anchors and `#main-content` layout changes;
- no context state or homepage rerender at scroll rate;
- no `scrollTo`, `preventDefault`, snap, focus manipulation, wheel interception,
  or touch interception.

Do not add another ScrollTrigger-based camera controller. GSAP remains in use
for foreground reveals and route motion.

### Persistent scene director

The homepage now has:

- one renderer/canvas/camera/frame loop;
- seven deterministic procedural groups: horizon, signals, voice, document,
  orchestration, splats, measurement;
- sample-driven camera/target/FOV/fog/terrain/group weights;
- delta-damped camera/treatments/group opacity;
- top-two mechanism motion cap;
- continuously quieted contact motion;
- desktop/constrained/mobile/reduced budgets;
- resource rebuilds on live profile changes without replacing the canvas;
- exact static reduced-motion states;
- WebGL fallback, loss, restore, and disposal handling;
- scene fade when the final journey exits so the external footer remains usable.

Do not add more canvases or remote 3D assets for the homepage world.

## Remaining work

Follow Tasks 9–14 in
`docs/plans/2026-07-11-immersive-client-portfolio.md` exactly, using test-first
implementation and implementation → spec review → quality review checkpoints.

### Task 9 — next implementation task

Build full, honest Splash Ink and Spectral World case studies. The existing pages
are substantive previews created earlier and must be replaced/extended rather
than duplicated.

Primary evidence sources:

- `/home/comma/Documents/splash-ink/README.md`
- `/home/comma/Documents/Immersive-auido-visualizer/spectral-world-player/README.md`

Create the shared `CaseStudyShell` and evidence-backed content model described in
the plan. Preserve `Active R&D`, limitations, failure modes, source/artifact
links, matching project visuals, canonical metadata, and `CreativeWork` JSON-LD.
Do not claim customer or audience outcomes.

### Task 10

Use the shared conversion treatment across existing studies without flattening
their technical differences. Every study should end with `Build a system like
this` → `/contact`. Remove employment/recruiter language from conversion
surfaces, update `/agent`, and retain Kumma/Yang Wu identity.

### Task 11

Create one discovery-route source, remove legacy `/projects/*` URLs from the
sitemap, add `/work` collection JSON-LD, keep nav/footer canonical, and generate
OG cards for `/work`, Splash Ink, and Spectral World. Do not add `llms.txt` in
this slice.

### Task 12

Implement only the allow-listed, privacy-minimal conversion events from the plan.
Never include name, email, stack, problem text, or free-form form data in
analytics.

### Task 13

Run the full route/viewport/motion/accessibility/performance matrix and create
`docs/qa/2026-07-11-immersive-client-portfolio.md`. This is where formal FPS/long
task and bundle-size evidence must be recorded.

### Task 14

Run final independent review against both plan documents, resolve every material
finding, integrate the newest remote `master` without overwriting the dirty main
checkout, then push and confirm remote/local commit IDs.

## Commit map

All feature commits after base `709e2ca`, in order:

```text
46a0f67 docs: design immersive client portfolio
7ac7f7c docs: plan immersive client portfolio
e394092 test: make unit suite discoverable
76c1816 test: harden unit test runner
2ac7b65 feat: add canonical work catalog
f1eb0b4 fix: harden work catalog boundaries
9337d02 feat: make work the canonical project index
062a529 fix: keep work metadata readable on mobile
b5510b1 fix: make canonical work routes static-safe
39be294 docs: define production AI marketing context
08b0955 feat: position homepage for production AI clients
da6eba3 fix: add homepage pressed states
f31cdda fix: keep contact visible without JavaScript
4dcf390 feat: add project-specific system visuals
e6436d9 fix: unify project visual motion
6450f41 fix: keep visual mechanisms readable on mobile
867b961 docs: align scene stages with project journey
d91f342 feat: model immersive scroll stages
38fe8f9 feat: map homepage scroll to immersive stages
260aaf8 docs: record single scroll coordinator
225b782 fix: keep immersive scroll coordinates current
34c8236 fix: freeze reduced-motion scene state
db4688e feat: direct one immersive homepage world
9d6330c fix: complete immersive scene lifecycle
d042206 fix: reveal footer at journey exit
1a37b96 fix: make immersive resources recoverable
```

## Dirty `master` checkout — preserve it

At handoff, `/home/comma/Documents/kumma-portfolio` was on local/remote
`master` at `709e2ca` with these unrelated changes:

```text
 M _posts/archon-agent-orchestration.md
 M _posts/kota-real-time-voice-pipeline.md
 M app/blog/page.tsx
 M app/feed.xml/route.ts
 M app/sitemap.ts
M  components/IntroAnimation.tsx
D  components/MorphingLogo.tsx
 M components/projects/KotaDetail.tsx
M  context/TransitionContext.tsx
 M data/projectData.ts
 M package-lock.json
M  package.json
?? .agents/
?? .playwright-cli/
?? .stash-immersive-experiment/
?? AGENTS.md
?? NEXT_AGENT_HANDOFF.md
?? app/api/agent-chat/
?? components/MagneticParticleScatter.tsx
?? components/agents/
?? docs/growth/kumma-promotion-master-prompt.md
?? public/los_angeles_downtown_usa.glb
?? public/shiba.glb
```

These changes are not part of the clean feature branch. Do not reset, clean,
stash, checkout over, or delete them. The existing untracked
`NEXT_AGENT_HANDOFF.md` is dated 2026-07-05 and is stale for this initiative.

Task 11 will overlap `app/sitemap.ts`, and Task 10 may overlap project content,
so defer reconciliation until the feature branch is complete and review each
conflict intentionally.

## Safe commands and final integration

Immediate verification:

```bash
cd /tmp/kumma-portfolio-immersive-client
git status --short --branch
git rev-parse HEAD
npm test
npm run build
```

Before final integration:

1. Fetch and inspect the latest `origin/master`; it may have advanced after this
   handoff.
2. Keep working in a clean worktree/branch.
3. Reconcile remote changes into the feature branch with an explicit merge or
   rebase strategy; do not force.
4. Run the complete Task 14 verification and independent review.
5. Do not update the checked-out local `master` ref in a way that strands its
   uncommitted files.
6. Push only after local and remote target commit IDs are verified.

## Do not do

- Do not work directly over the dirty `master` checkout.
- Do not use `git reset --hard`, `git clean`, or blind checkout operations.
- Do not publish every folder under `/home/comma/Documents` as a project.
- Do not expose private, sensitive, or legally risky repositories.
- Do not add unsupported metrics or claims.
- Do not reintroduce full-time/recruiter/job-seeker positioning.
- Do not add another Three.js renderer or a second scene scroll subscriber.
- Do not add scroll-jacking, snap points, or focus-changing scroll effects.
- Do not commit `.playwright-cli`, build output, screenshots, traces, or local
  model assets unless Task 13 explicitly records an intentional artifact path.
