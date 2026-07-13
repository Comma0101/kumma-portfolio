# Carved Systems Facility Greybox Checkpoint

Date: 2026-07-13  
Branch: `feature/carved-systems-facility`  
Server: Next.js development server on `127.0.0.1:4242`

## Scope

This checkpoint validates the first continuous slice only:

`terrain → distant entrance → reliability spine → fissure threshold → KOTA voice chamber`

The semantic homepage remained in normal document flow. The scene used one canvas,
one camera, one renderer, and the existing native/Lenis scroll coordinator.

## Automated gate

- Unit tests before browser review: 343 passed, 0 failed.
- Static build: 65/65 pages generated.
- Homepage first-load JavaScript: 322 kB, unchanged from the recorded baseline.
- Browser console: 0 application errors. Headless Chromium emitted only its
  `ReadPixels` driver warning during captures; reduced-motion emulation emitted the
  expected Motion library informational warning.

## Browser evidence

Primary viewport: 1440 × 1000.

- `output/playwright/carved-facility-greybox/01-hero-1440.png` — initial destination.
- `02-approach-1440.png` — convergence toward the entrance.
- `04-threshold-1440.png` — first threshold pass before remediation.
- `07-kota-resolved-revised-1440.png` — revised KOTA chamber with a clear camera route.
- `08-reverse-threshold-1440.png` and `09-reverse-hero-1440.png` — deterministic reverse pass.
- `10-kota-scene-only-1440.png` — semantic foreground temporarily hidden in the QA browser.
- `11-mobile-hero-390.png` and `12-mobile-kota-390.png` — 390 × 844 mobile flow.
- `13-reduced-kota-1440.png` — reduced-motion authored pose.
- `14-webgl-fallback-1440.png` — canvas hidden and fallback field exposed.

At the KOTA key frame the copy bounds were 544 px in a 1440 px viewport. The
foreground therefore occupied 37.8% and left a 62.2% scene aperture. The mobile
document reported zero horizontal overflow.

## Checkpoint finding and remediation

The first KOTA browser frame failed the spatial-legibility gate: the camera crossed
the narrow ambiguity gate and a raised signal tube, causing a black wall and green
shape to dominate the frame. The revision:

- widened the physical gate clearance around the authored spline;
- ended the threshold walls before the voice-chamber camera pose;
- moved voice conduits onto the floor and reduced their radius;
- raised shell/steel material separation without adding bloom or decorative light;
- moved the featured-work heading to the copy edge rather than over the threshold.

A regression test now samples the KOTA camera against threshold and gate clearance
and constrains conduit height. The revised scene-only frame reads as a blocked route,
a clarified route, and a stable output plane inside one chamber.

## Nine design gates

1. **One world:** Pass. Terrain, entrance, ribs, gate, and output occupy continuous
   coordinates; no whole-zone crossfade is used.
2. **Destination before decoration:** Pass. The entrance is visible from the hero
   camera and grows through approach.
3. **Physical transition:** Pass. The camera descends, crosses an occluding fissure,
   and emerges inside repeated structural ribs.
4. **Meaningful geometry:** Pass for the greybox slice. Feeders converge; the KOTA
   branch stops, clarifies, and resolves to an order plane.
5. **One event at a time:** Pass. Explicit non-overlapping event windows drive the
   slice, including reverse sampling.
6. **Scroll ownership:** Pass. Camera position changes throughout long chapters;
   no scroll snapping, wheel interception, GSAP camera driver, or second subscriber.
7. **Content aperture:** Pass. Desktop project copy stays below the 42% checkpoint;
   mobile restores opaque normal-flow surfaces.
8. **Motion restraint:** Pass for the slice. No camera drift, terrain drift, bloom,
   particles, or arbitrary object bobbing; reduced motion uses immediate static poses.
9. **Resilience:** Pass. Mobile, reduced motion, semantic/text flow, and the CSS
   WebGL fallback remain usable. Full context-loss and performance QA remains in the
   final-system gate.

## Decision

The revised slice communicates `terrain → destination → approach → entrance → voice
chamber` without foreground copy. Because the user requested autonomous continuation,
this evidence is treated as the planned approval checkpoint and authorizes the
remaining foundry, atrium, observatory, calibration, and exit zones.
