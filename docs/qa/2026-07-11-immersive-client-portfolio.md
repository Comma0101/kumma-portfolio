# QA Evidence — Immersive Client Portfolio

**Date:** 2026-07-11 (America/Los_Angeles)
**Build under test:** feature/immersive-client-portfolio after Task 12
(`feat: measure project inquiry intent`) plus the one defect fix recorded below.
**Environment:** production static export (`npm run build`, `output: "export"`)
served locally; Playwright Chromium 1.61.1 driving the pages; Linux desktop.

## Verification gate

| Check | Result |
|---|---|
| `npm test` | 306 tests, 306 pass, 0 fail |
| `npm run build` | Exit 0, 65/65 static pages, OG cards regenerated (27) |
| Automated browser checks | 64 pass after harness-artifact triage (below) |

## Matrix covered

| Pass | Viewport | Motion | Scope |
|---|---|---|---|
| Desktop | 1440×1000 | full | home (all 8 stages), `/work`, all six work routes, 3 legacy aliases, contact form |
| Mobile | 390×844, touch, DPR 3 | full | home journey, touch targets, scene profile |
| Reduced motion | 1440×1000 | `prefers-reduced-motion: reduce` | home at a mid-journey stage |
| Zoom 200% equivalent | 720×500 | full | `/`, `/work`, `/work/splash-ink`, `/contact` |
| WebGL unavailable | 1440×1000 | full | home with `getContext("webgl*")` forced to `null` |

## Results

### Structure and navigation

- Home renders exactly one `<h1>`; semantic stages appear in the approved order
  `hero, proof, bridge, featured-work, capabilities, research, labs, contact`;
  spatial anchors appear in the approved order
  `hero, proof, kota, audiobook, archon, splash-ink, research-labs, contact`.
- Exactly one canvas on the homepage (`data-webgl-state="ready"`); zero
  canvases on `/work` and on all six work routes.
- `/work` lists all six catalog projects plus the agent-protocol link, and
  serializes `CollectionPage`/`ItemList` JSON-LD.
- Splash Ink and Spectral World render the full case-study shell with
  `CreativeWork` JSON-LD carrying `Active R&D` status.
- Legacy aliases land on canonical routes via the static meta-refresh alias:
  `/projects/ → /work/`, `/projects/kota/ → /work/kota/`,
  `/projects/robinhood/ → /work/robinhood-dashboard/`.
- Every case study closes with the shared `Build a system like this` → `/contact`
  treatment; KOTA additionally keeps its demo link as the secondary action.

### Scene behavior

- Viewport screenshots differ between every adjacent stage pair
  (hero→kota→archon→splash-ink→contact), confirming the camera journey.
- `data-journey-state` flips to `inactive` at the footer and the scene releases.
- Reduced motion: two screenshots taken 800 ms apart at the ARCHON stage are
  byte-identical — the composed static state holds with zero drift.
- Mobile uses the `mobile` scene profile with a single canvas and no
  horizontal overflow.
- Forced WebGL failure yields `data-webgl-state="unavailable"`, the hero
  content and headings stay fully visible on the CSS fallback, and the only
  console output is Three.js's expected context-creation error.

### Accessibility

- First Tab lands on the "Skip to content" link; subsequent tabs move through
  interactive elements.
- One `<h1>` per checked route; no horizontal overflow on any checked
  route/viewport including the 200%-zoom equivalent (720×500).
- Mobile touch targets: menu button 44×44; hero CTAs 321×46. (The earlier 0×0
  reading was the harness selecting the hidden nav-overlay links.)

### Conversion and privacy

- Submitting the contact form fires exactly
  `{"event":"mailto_submit","source":"contact"}` on the `kumma:conversion`
  channel and opens the encoded `mailto:` handoff.
- Captured Umami `/api/send` payloads contain the pageview plus the
  `mailto_submit` event with `data: { source: "contact" }` only — the filled
  name, email, problem, constraint, timeline, and budget values never appear in
  any analytics request. The only request containing the brief is the visitor's
  own `mailto:` URL, which is the honest delivery mechanism.

### Performance

- Homepage first-load JS: **322 kB** vs the 314 kB pre-immersive baseline and
  ~320 kB at the Task 8 handoff. The +8 kB total is attributable to the
  immersive stage model/scene director (+~6 kB) and conversion analytics
  (+~2 kB). Recorded, not hidden; no unexplained growth.
- Scripted full-page scroll on the production build: ≈47 fps under headless
  software rendering with **zero long tasks over 50 ms** (PerformanceObserver
  `longtask`). Headless SwiftShader is not representative of real GPU frame
  rates; the absence of main-thread long tasks is the meaningful signal here.
  60 fps on a modern desktop remains a verification target, not a published
  claim.

## Defects found and fixed

1. **Evidence-column mid-word breaks** (desktop home, KOTA card):
   `overflow-wrap: anywhere` let "clarification" break as "clarificatio / n".
   Fixed in `components/home/ChapterIndex.module.css` by moving
   `.evidenceStep dd` to `overflow-wrap: break-word` + `hyphens: auto`;
   re-captured screenshot confirms syllable hyphenation ("clarifi-cation").
   Presentational-only change; no unit test added because the wrap point is a
   rendering decision, and the existing CSS-contract tests would over-specify
   it.

## Expected/known console output

- `GPU stall due to ReadPixels` warnings appear only while the harness captures
  screenshots of the live canvas.
- Three.js logs one context-creation error when WebGL is deliberately disabled;
  the application then logs its single fallback warning and continues on the
  static Atlas field.

## Honest limitations of this QA round

- Frame rates were measured under headless software rendering; a hardware GPU
  pass would be needed to publish any fps number (none is published).
- Native-scroll interruptibility is enforced by the coordinator's contract
  (no `scrollTo`, no wheel/touch interception — unit-tested at the source
  level) and scrolling behaved normally in every scripted run, but a human
  wheel/trackpad feel-check has not been recorded in this document.
- Keyboard traversal was sampled (first ten stops), not exhaustively walked.
- Screenshot artifacts live in the session scratchpad
  (`…/scratchpad/qa-shots/`, including `qa-results.json`) and are deliberately
  not committed to the repository.

## Deferred (not required for launch)

- Hardware-GPU performance trace and recorded fps evidence.
- Landscape-tablet sweep beyond the responsive breakpoints already covered by
  the CSS contract tests.
