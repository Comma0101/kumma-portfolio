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

Tuned in 4 capture rounds after the controller's visual adjudication found the
initial composition too stone-heavy and the host peak washed out by fog:

- `hostPeak.position.set(0, -1.5, -36)`
- `hostPeak.scale.set(11, 24, 11)`
- Hero `fov: 28`
- Waterfall `{ x: -6, z: -26.9, topY: 10, bottomY: -2, width: 1.2 }`
  (z sits 0.3 in front of the peak's front face: -36 + 0.8·11 + 0.3 = -26.9)
- Moss `{ count: 42, seed: 977, center: [0, -1.5, -36], span: [24, 24, 9] }`
- River stones (shrunk to ~55 % and pushed outward):
  - `[-5.6, -0.72, 12] scale [1.0, 0.6, 0.8]`
  - `[5.0, -0.76, 7] scale [0.75, 0.45, 0.65]`
  - `[-4.0, -0.73, -2] scale [0.65, 0.36, 0.9]`
- `mountainNear.valueBias: 0.34`

## Remaining gaps vs the design

- Host-peak silhouette: the procedural ridge still reads as two rounded
  haystack-like lobes rather than the single monumental cliff face of Fan Kuan's
  Travelers Among Mountains and Streams. Within the allowed constant-only
  tuning, the peak has been brought forward, darkened, and centered, but the
  underlying ridge geometry shape is unchanged.
- Waterfall thread: visible as a pale streak on the top-of-page view, but it
  competes with the centered headline in the hero stop and can read as a faint
  texture rather than a deliberate unpainted cascade.
- Bamboo strokes: threshold bamboo still uses colored toon geometry rather than
  calligraphic stroke clusters.
- KOTA cliffs: the voice-chamber gorge is the old broad mountain geometry;
  Task 6 / Phase 3 will replace it with axe-cut flanking cliffs.
- Mist-band system: the hero veil is a static ShaderMaterial pass; the full
  drift/opacity system belongs to threshold mist only and is intentionally not
  wired to the hero band.

## Verdict

The hero is substantially closer to the Fan Kuan target after four tuning
rounds: the host peak is now the dominant dark mass, the foreground river
stones read as small jiao accents, the flanking ridges remain paler, and the
paper ground still dominates the foreground. Phase-1 gate passes across the
full journey. The composition does not yet fully achieve the single
monumental cliff silhouette and crisp waterfall thread of the reference, so
this is a DONE_WITH_CONCERNS result.
