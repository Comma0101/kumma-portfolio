# Real Shanshui Ink Rendering

- **Status:** Approved direction (user, 2026-07-16); implementation ready
- **Date:** 2026-07-16
- **Audience:** Founders, CTOs, technical product leaders, and engineering leads
- **Business outcome:** Qualified inquiries for production-AI audits, scoped builds, and advisory
- **Creative outcome:** A 3D ink world whose every frame reads as hand-painted shanshui — paper first, ink as mark — while preserving the tested scroll-narrative architecture

## Decision

Keep the single-renderer architecture, native-scroll coordinator, continuous camera
spline, deterministic event windows, zone system, narrative state machine, and all
performance/accessibility machinery. Replace **how pixels are made**: full value
inversion to a xuan-paper ground, custom unlit ink materials with procedural
texture-stroke fields, ridge-stack mountain geometry, telephoto composition, and a
matching ink-on-paper inversion of the foreground UI.

This supersedes the material/palette execution of
`2026-07-13-living-shanshui-handscroll-design.md`; that document remains the source
for journey structure, motif discipline, and the motion contract.

**Why the current render fails:** the value structure is inverted. The scene clears
to near-black (`0x0a0a0b`) with all-dark stock materials, so "unpainted paper" water
renders as black voids and bamboo reads as neon-green wireframe on darkness. Stock
`MeshStandardMaterial`/`MeshToonMaterial` are lamp-lit; no paper substrate exists
anywhere. The fix is structural, not another texture tune.

**North star (user-confirmed):** a believable 3D world with genuine ink aesthetics —
not flattened to 2D, not rebuilt as lateral handscroll parallax.

## Reference map

A Northern-monumental to Yuan-dry-brush synthesis, keyed by zone (each real work is
the composition target for one chapter):

| Chapter | Reference | What it contributes |
| --- | --- | --- |
| Hero | Fan Kuan, *Travelers Among Mountains and Streams* | Monumental host peak filling ~2/3 frame, raindrop texture, tiny boat for scale |
| Convergence / approach | Huang Gongwang, *Dwelling in the Fuchun Mountains* | Rolling hemp-fiber ridges, tributaries merging into one current, dry-brush economy |
| Mist/bamboo threshold | Guo Xi, *Early Spring* | Cloud-mountain atmosphere, dark near silhouettes opening to pale depth |
| KOTA listening gorge | Guo Xi gorges | Entered gorge: flanking cliffs frame the water fork, camera at water level |
| Document foundry | (mechanism chapter) | Paper terraces aligned into scroll-river, ink treatment |
| ARCHON orchestration | Northern Song passes | Vertical switchbacks, gates, alternate routes; "人"-stroke birds for scale |
| Splash Ink dissolution | Ink-play tradition | Flat ink-water rising into spatial mountains; fish shadows reveal depth |
| Calibration / survey | Scholar's terrace | Spectacle resolves into method; overview across the valley |
| Contact | Ma-Xia one-corner | Vast empty paper lake, moored boat, distant pale peaks, cinnabar seal |

## Value structure (paper first)

- **Ground:** xuan ivory `#f0ead9` (warm, fiber grain ±3%). Scene clear color, fog,
  and the CSS page background are all this one paper tone.
- **Five-ink ladder** (classical 焦濃重淡清 / jiao-nong-zhong-dan-qing), one
  charcoal-green hue family, dilution ramp — calibration targets measured from the
  reference paintings in Phase 0, starting points:
  - jiao `#1c201a` (burnt, driest) — reserved for foreground stroke accents, boat, outlines
  - nong `#2e332b` (dense) — near ridges, key silhouettes
  - zhong `#47503f` (heavy) — mid ridges, tree masses
  - dan `#75806a` (light) — far ridges, mist-adjacent forms
  - qing `#a9b09a` (clear) — most distant silhouettes, water strokes
- **Coverage rule:** ≥65% of a frame is paper or qing/dan in most chapters; the hero
  may drop to ≥50% because the monumental peak occupies the frame — but its mass is
  broken by mist bands and the waterfall thread so paper still reads as the ground.
  Enforced by an automated luminance-histogram gate in the capture harness.
- **Distance = paler ink** (dilution), never whiter fog. Fog color is paper; distant
  ridges read as qing silhouettes.

## Palette

- Ink charcoal-green family (dominant, the ladder above)
- Mineral blue-green (石綠) `#6d8a7a` — restrained: water strokes, selected atmospheric planes
- Ochre (赭石) `#a98a5e` — ≤12%: mountain feet, autumn touches
- Cinnabar (朱砂) `#9f4435` — **only** the primary CTA and one seal marker per chapter
- UI: paper background, ink text (`#2a2c28` primary, `#5a6053` secondary), hairline
  ink rules, cinnabar for the single primary action

## Form language per motif

- **Mountains:** layered ridge meshes with authored jagged profiles (deterministic
  seeds), one ink value per depth band; surface carries *cun* stroke fields — never
  smooth noise domes.
- **Cliffs (KOTA, ARCHON):** axe-cut cun (斧劈皴), harder edges, darker value.
- **Hero peak:** raindrop cun (雨點皴), densest texture, moss dots (點苔) on crests.
- **Rolling ranges:** hemp-fiber cun (披麻皴), long contour-following strokes.
- **Water:** unpainted paper plus 2–3 economical strokes — broken bank edges, two
  current lines. Never a filled road. (Existing intent; now actually on paper.)
- **Mist:** paper-value occlusion bands *between* ridge layers — unpainted gaps that
  separate depth, with subtle drift only while scroll energy is present.
- **Bamboo/trees:** calligraphic stroke clusters — ink-dark tapered stalks, leaf
  groups in 個字/介字 conventions at authored nodes. No emissive green.
- **Boat:** three-four strokes — hull slash, canopy curve, one figure dot.
- **Birds (ARCHON only):** small 人-strokes. **Fish (Splash Ink only):** shadow ovals
  beneath the paper surface. (Both remain deferred until the vertical slice lands.)
- **Excluded (unchanged):** pagodas, lanterns, dragons, red-and-gold theme layers,
  brush-display fonts, unverified Chinese text, glossy/bloom/neon, photorealism.

## Composition grammar

- Long focal lengths (fov ≈ 26–35°) in painting-critical frames — telephoto
  compression approximates the handscroll's parallel-projection feel. The camera
  path gains per-zone fov targets lerped by narrative progress.
- Camera stays at or above water level in gorges (entered space, never top-down
  diorama).
- Each chapter has one dominant event and one quiet ambient cue at most (unchanged).
- KOTA flanking cliffs must re-verify camera clearance across the full progress
  sweep (regression of the 2026-07-15 wall-block class of bug gets a dedicated test).

## Rendering architecture

New module `components/immersive/facility/ink/`:

- **`inkLadder.ts`** — five-value ramp + palette constants; single source of truth;
  pure and unit-tested (monotone, bounded, exact hex targets).
- **`inkMaterials.ts`** — `createInkMaterial(params)`: unlit `ShaderMaterial`.
  All form comes from value fields; no lights, no specular, no shadow maps.
  - vertex: world normal, view depth, uv, slope/cavity attributes.
  - fragment: paper base; ink deposit `f(slope, cavity, valueBias)` mapped through
    the ladder with soft banding; silhouette rim darkening `1−|N·V|` (勾勒
    outline-first convention); distance dilution toward paper; shared grain
    multiply; deckle alpha feather at uv borders.
  - Compile failure falls back to the existing stock materials (feature-detect),
    so the scene can never go black because of a shader error.
- **`strokeFields.ts`** — procedural cun generator (GLSL chunk + CPU twin for
  tests): slope/aspect/curvature → stroke density, contour-following direction,
  width, dry-brush break via thresholded noise. Three presets: hemp-fiber,
  axe-cut, raindrop. Deterministic under fixed seeds.
- **`paperGrain.ts`** — shared xuan fiber/absorbency texture (seeded data texture,
  generated once) multiplied inside every ink material. **No post-processing
  pipeline** — grain lives in-material, the clear color is paper, CSS behind the
  canvas is paper. Keeps budgets and avoids EffectComposer bundle cost.

Geometry and camera:

- **`terrain.ts`:** ridged-noise profiles (sharp crests) replace smooth domes;
  river carving kept; exposes slope/curvature attributes for stroke fields.
- **`shanshuiPrimitives.ts`:** ridge-stack builder (authored control points +
  fractal detail, seeded), bamboo stroke builder, boat strokes, crest moss-dot
  instancer. Zones swap blob mountains for ridge stacks; KOTA gains flanking cliffs.
- **`materials.ts`:** the `FacilityMaterials` interface is preserved, but entries
  are backed by ink materials; stock materials remain only as the compile-failure
  fallback. Existing resource-tracker disposal patterns unchanged.
- **`cameraPath.ts`:** per-zone fov targets; arc-length spline and deterministic
  progress mapping untouched.

**Untouched:** narrative state machine, scroll coordinator, motion contract
(scroll-energy-only ambient, settle when stopped, reduced motion = static poses,
mobile = fewer deliberate silhouettes), zone event windows, profile selector,
WebGL-unavailable detection.

## UI inversion (foreground CSS)

- Page chrome and content surfaces flip to ink-on-paper: paper background, ink
  text, hairline ink borders, cards as raised paper with ink edge and soft wash
  shadow; scrims become paper-mist gradients behind copy.
- Chapter index becomes the handscroll's inscription column (題跋): vertical rule,
  chapter marks as seal dots; the active chapter is the one cinnabar seal.
- Primary CTA is the page's single cinnabar mark. All contrast re-checked AA on
  paper. The WebGL-unavailable CSS fallback is restyled to the same paper system.
- Files: `styles/home.module.css`, `components/home/*.module.css`, hero section,
  chapter index, header/nav, proof cards.

## Profiles, performance, fallback

- Budgets preserved (from 2026-07-13 QA): desktop ≤45 draw calls, constrained ≤32,
  mobile ≤22, reduced motion ≤20; homepage first-load JS ≤332 kB (327 + 5 slack).
- Ink shaders are cheap (no lights/shadows); ridge stacks replace blobs ~1:1 in
  draw-call count; moss dots instanced. LOD: desktop full stroke density + crest
  dots; constrained drops dots and secondary ridges; mobile fewer silhouettes;
  reduced motion fully static.
- SwiftShader detection and the production profile selector are unchanged.

## Risks and mitigations

1. **Shader craft is where quality lives** → tight screenshot loop at 9 journey
   stops (harness rebuilt at `~/kumma-qa`, durable — the old `/tmp` artifacts are
   gone); frame-by-frame judgment against references at every phase gate.
2. **Value inversion breaks copy readability** → Phase 1 gate includes AA contrast
   checks and paper-mist scrims behind copy zones.
3. **KOTA camera clearance with new cliffs** → dedicated sweep test asserting
   minimum camera-to-geometry distance across the full progress range.
4. **Budget regressions** → capture harness asserts `renderer.info` calls per stop
   against the profile budgets on every run.
5. **Shader compile failure on exotic drivers** → stock-material fallback; the
   WebGL-unavailable CSS path stays complete and usable.

## Testing and QA gates

- The existing unit suite (359 tests) must stay green; material assertions updated
  to the ink system. New unit tests: ink ladder monotonicity/bounds, stroke-field
  determinism under seeds, material disposal tracking.
- Visual gates per phase: silhouette read with foreground hidden, luminance
  histogram paper coverage (≥50% hero, ≥65% typical chapters, ≥55% dense frames),
  reverse-scroll pixel-identity at exact coordinates, reduced-motion byte-identity
  500 ms apart, `renderer.info` budgets per profile.
- Final: refreshed QA evidence doc, plus the still-outstanding human items from
  2026-07-13 — real hardware-GPU trace, trackpad feel pass, screen-reader pass.

## Phasing

- **Phase 0 — Calibration & baseline:** measure ink values from reference scans;
  baseline contact sheet of all 9 stops; harness gates wired.
- **Phase 1 — Paper inversion:** clear/fog/material revalue + UI CSS inversion +
  fallback restyle. The single biggest feeling-per-hour; independently reviewable.
- **Phase 2 — Ink core:** inkLadder, inkMaterials, paperGrain, strokeFields v1;
  hero peak rebuilt as ridge stack with raindrop/hemp cun; telephoto hero
  composition against Fan Kuan.
- **Phase 3 — Vertical slice:** hero → convergence → threshold → KOTA fully
  treated (bamboo strokes, mist bands, water strokes, flanking cliffs + fork).
- **Phase 4 — Remaining chapters:** document, orchestration, dissolution,
  calibration, contact (Ma-Xia).
- **Phase 5 — Polish & QA:** budgets, mobile/reduced passes, reverse determinism,
  QA doc, hardware-pass handoff notes.

Commit per phase on `feature/carved-systems-facility`; screenshots and QA artifacts
live outside the repo at `~/kumma-qa/`.

## Out of scope (YAGNI)

- Birds and fish until the vertical slice is judged good.
- Any scroll-architecture, routing, or content/copy changes.
- Post-processing pipeline, HDR/bloom, texture-heavy photorealism.
- Merge to master (a separate, user-gated decision).
