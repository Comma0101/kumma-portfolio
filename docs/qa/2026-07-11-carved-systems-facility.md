# QA Evidence — Carved Systems Facility

**Verification date:** 2026-07-13 (America/Los_Angeles)

**Code under test:** `aa38777` (`fix: enforce facility runtime budgets`) on
`feature/carved-systems-facility`

**Environment:** optimized static export, Playwright Chromium, Linux desktop;
full-profile art checks were simulated under SwiftShader, while software-renderer
performance checks used the production constrained profile.

## Automated gate

| Check | Result |
|---|---|
| `npm test` | 359 tests, 359 pass, 0 fail |
| `npm run build` | Exit 0; 65/65 static pages; 24 OG cards generated |
| `git diff --check` | Clean |
| Homepage first-load JS | 327 kB, +5 kB over the recorded 322 kB immersive baseline |

The bundle increase is below the plan's 15 kB investigation threshold and is
accounted for by the facility world, deterministic camera/narrative modules, and
runtime QA/lifecycle logic.

## Browser matrix

| Pass | Viewport | Profile | Result |
|---|---:|---|---|
| Full desktop art | 1440×1000 | desktop | Nine moments, scene-only sequence, max 45 calls |
| Small phone | 375×812 | mobile | 0 px overflow, 20 calls, 44 px chapter links |
| Mobile | 390×844 | mobile | 0 px overflow, 20 calls, opaque one-column evidence |
| Tablet boundary | 768×900 | constrained in SwiftShader | 0 px overflow, 28 calls, opaque one-column evidence |
| Desktop boundary | 1024×768 | constrained in SwiftShader | 0 px overflow, 28 calls, immersive split composition |
| 200% zoom equivalent | 720×500 | mobile | 0 px overflow, 19 calls, 44 px chapter links |
| Reduced motion | 1440×1000 | reduced | Static at all eight anchors, max 20 calls |
| WebGL unavailable | 1440×1000 | CSS fallback | All content, project links, CTA, and form remain usable |

At the desktop KOTA frame, the copy width is 544 px (37.8% of the viewport),
leaving a 62.2% world aperture. The brightest copy remains `rgb(240, 237, 232)`
over the chapter scrim.

## Desktop journey evidence

The renderer measurements below come from the final full-profile visual pass.
The renderer debug label was hidden so the production profile selector exercised
the same desktop code path that hardware browsers use; this is an art and budget
check, not a hardware performance claim.

| Moment | Route | Dominant event | Calls | Triangles | Points |
|---|---:|---|---:|---:|---:|
| Exterior ridge | 0.040 | `approach` | 35 | 72,148 | 0 |
| Reliability approach | 0.165 | `converge-inputs` | 37 | 72,844 | 0 |
| Fissure threshold | 0.265 | `cross-threshold` | 44 | 73,056 | 0 |
| KOTA / clarification | ≈0.370 | `clarify-route` | 45 | 75,020 | 320 |
| Document foundry | ≈0.490 | `segment-document` | 40 | 73,544 | 320 |
| Orchestration atrium | ≈0.610 | `recover-route` | 39 | 72,980 | 320 |
| Dissolution observatory | ≈0.730 | `reconstruct-depth` | 24 | 68,376 | 320 |
| Calibration deck | ≈0.845 | `calibrate` | 15 | 65,560 | 0 |
| Contact horizon | 1.000 | `settle` | 10 | 65,368 | 0 |

Only one facility event is active at each moment. With foreground HTML hidden,
the frames remain orderable as exterior destination → approach → threshold →
voice chamber → document foundry → atrium → observatory → deck → quiet exit.

## Performance and lifecycle

- SwiftShader is now detected as a software rasterizer and selects the constrained
  facility without changing the desktop narrative or camera choreography.
- After shader warm-up, a complete eight-anchor forward and reverse traversal
  produced zero `PerformanceObserver` long tasks over 50 ms. Constrained calls
  were `22, 28, 28, 29, 32, 22, 15, 10`, all at or below the 32-call target.
- Mobile KOTA measured 20 calls against a 22-call target. Reduced motion measured
  12–20 calls against its 20-call target.
- Exact-coordinate reverse reconstruction passed: screenshots before and after a
  KOTA → atrium → KOTA traversal had identical SHA-256 hashes and zero changed
  pixels.
- Two reduced-motion KOTA captures 500 ms apart were also byte-identical with zero
  changed pixels. Every anchor reported `frameState="static"`.
- At the document bottom, `journeyState="inactive"` and
  `frameState="suspended"`. A synthetic visibility transition produced
  `suspended` while hidden and `settled` after returning.
- `WEBGL_lose_context` produced `unavailable/suspended`, then restored to `ready`
  with one canvas and the same canvas node.
- A real wheel gesture increased route progress from 0.3700 to 0.4638; the reverse
  gesture returned it to 0.3705 without trapping or snapping native input.

## Accessibility and fallback

- The first Tab focuses the visible 149×46 px **Skip to content** link with a 2 px
  signal outline. Activating it focuses `main#main-content`; the next Tab reaches
  the primary **Start a project** action.
- The homepage has one `<h1>`, no duplicate IDs, and no skipped heading level in
  the primary hierarchy. All contact controls have programmatic labels; name and
  email retain appropriate autocomplete tokens.
- Chapter links are 44 px high at 375, 390, 720, and 768 px. The smallest contact
  control measured 48 px high.
- Forced WebGL creation failure leaves zero canvases, the complete production-AI
  heading, the primary project CTA, all semantic project links, and the project
  brief form, with zero horizontal overflow.

## Defects found and remediated

1. Dense threshold/foundry frames exceeded renderer budgets. Profile-specific far
   planes now cull fully fogged rooms; secondary voice/foundry trim is omitted from
   non-desktop construction profiles. Final maxima are 45 desktop, 32 constrained,
   20 observed mobile, and 20 reduced.
2. High-core desktop browsers using SwiftShader previously selected full terrain
   quality and sustained 50–60 ms render tasks. Software-renderer detection now
   selects balanced geometry; GPU-backed browsers retain full quality.
3. A settled reverse traversal could stop on a nearly converged damped camera.
   Settlement now renders one canonical static frame, making equal route and scroll
   coordinates pixel-identical regardless of traversal history.
4. Renderer calls, triangles, points, active event, route, renderer class, and
   budget are exposed as non-semantic `data-*` diagnostics for repeatable browser
   QA.

## Screenshot artifacts

Artifacts are intentionally stored outside the repository at
`/tmp/kumma-playwright-carved/qa/`:

- `final-contact-sheet.png` — nine full page compositions;
- `final-scene-contact-sheet.png` — the same nine moments with foreground hidden;
- `final-mobile-390-hero.png`, `final-mobile-375-kota.png`,
  `final-tablet-768-kota.png`, `final-desktop-1024-kota.png`, and
  `final-zoom-200-equivalent-kota.png`;
- `final-reduced-kota-a.png` and `final-reduced-kota-b.png`;
- `final-webgl-fallback-1440.png`;
- `final-reverse-forward.png` and `final-reverse-return.png`.

## Honest limitations and approval gate

- Headless Chromium uses SwiftShader. Its frame rate is not representative and no
  FPS claim is made. A real hardware-GPU forward/reverse trace and human trackpad
  feel pass remain required before calling the experience award-submission ready.
- Chromium emits its own `ReadPixels` driver warnings while the harness captures
  the live canvas. In the final static-export check it also forced one transient
  SwiftShader context reset; the application recovered to `ready`, and there were
  zero JavaScript errors. The explicit recovery and WebGL-disabled tests cover both
  paths.
- Keyboard order was sampled through the skip link and primary conversion path;
  semantic/source contracts cover the remaining fields and links, but a full
  assistive-technology screen-reader pass remains a final human review item.
