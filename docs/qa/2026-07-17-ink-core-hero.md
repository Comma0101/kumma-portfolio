# Ink Core Hero QA — 2026-07-17

Branch `feature/carved-systems-facility`, Task 5 complete.
Rebuilds the hero exterior as a Fan Kuan monumental ink composition:
nong ink host peak, dan ink distant peaks, hemp/raindrop cun bands,
static mist veil, unpainted-paper waterfall thread, and crest moss dots,
all framed with telephoto camera work.

## Before / After (phase1 gate)

| Stop | Baseline draw calls | Baseline paper | Ink-hero draw calls | Ink-hero paper | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| 00-top | 14/32 | 67.2% | 18/32 | 93.0% | 50% | pass |
| 01-hero | 23/32 | 57.7% | 23/32 | 88.4% | 40% | pass |
| 02-approach | 30/32 | 64.3% | 30/32 | 79.8% | 50% | pass |
| 03-threshold | 22/32 | 78.7% | 22/32 | 97.0% | 50% | pass |
| 04-kota | 18/32 | 39.2% | 7/32 | 96.7% | 38% (override) | pass |
| 05-document | 19/32 | 86.2% | 19/32 | 94.0% | 50% | pass |
| 06-orchestration | 19/32 | 94.6% | 18/32 | 96.0% | 45% | pass |
| 07-dissolution | 21/32 | 90.8% | 21/32 | 94.8% | 50% | pass |
| 08-calibration | 15/32 | 93.8% | 15/32 | 95.3% | 50% | pass |
| 09-contact | 15/32 | 96.5% | 15/32 | 96.5% | 50% | pass |

All stops stay within the constrained-profile draw-call budget (32).
04-kota remains above the 0.38 override and no stop regressed below baseline.

## Final host-peak constants

Tuned in 1 capture round (initial implementation + one visual pass):

- `hostPeak.position.set(1.5, -1.5, -40)`
- `hostPeak.scale.set(11, 24, 11)`
- Hero `fov: 28`
- Waterfall `{ x: 0.9, z: -33.4, topY: 15.5, bottomY: 1.4, width: 0.55 }`
- Moss `{ count: 42, seed: 977, center: [1.5, -1.5, -40], span: [24, 22, 8] }`

## Remaining gaps vs the design

- Bamboo strokes: threshold bamboo still uses colored toon geometry rather than
  calligraphic stroke clusters.
- KOTA cliffs: the voice-chamber gorge is the old broad mountain geometry;
  Task 6 / Phase 3 will replace it with axe-cut flanking cliffs.
- Mist-band system: the hero veil is a static ShaderMaterial pass; the full
  drift/opacity system belongs to threshold mist only and is intentionally not
  wired to the hero band.

## Verdict

The hero now reads as a Fan Kuan monumental composition: the host peak fills
roughly two-thirds of the frame height, its dark nong mass is broken by the pale
mist band and the unpainted waterfall thread, the flanking peaks are visibly
paler (dan ink), and the foreground remains paper-dominant. Telephoto framing
(28° hero fov, raised camera aim) compresses depth and emphasizes the central
mountain mass. Phase-1 gate passes across the full journey.
