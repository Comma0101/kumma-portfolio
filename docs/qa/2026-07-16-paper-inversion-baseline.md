# Paper Inversion Baseline — 2026-07-16

Branch `feature/carved-systems-facility`, HEAD `e15de54` (Task 4 complete + CTA hover fix).
This is the pre-Phase-2 reference: paper value structure landed (scene + UI), geometry
and shading still the old smooth primitives with revalued stock materials.

## Captures

- `~/kumma-qa/shots-baseline/` — full journey (UI inclusive), `--gate phase1` **PASS**
- `~/kumma-qa/shots-baseline-scene/` — scene-only, `--gate phase1` **1 failure (adjudicated below)**

## Results (UI-inclusive, authoritative gate)

| Stop | Draw calls | Paper coverage | Threshold | Verdict |
| --- | --- | --- | --- | --- |
| 00-top | 14/32 | 67.2% | 50% | pass |
| 01-hero | 23/32 | 57.7% | 40% | pass |
| 02-approach | 30/32 | 64.3% | 50% | pass |
| 03-threshold | 22/32 | 78.7% | 50% | pass |
| 04-kota | 18/32 | 39.2% | 38% (override) | pass |
| 05-document | 19/32 | 86.2% | 50% | pass |
| 06-orchestration | 19/32 | 94.6% | 45% | pass |
| 07-dissolution | 21/32 | 90.8% | 50% | pass |
| 08-calibration | 15/32 | 93.8% | 50% | pass |
| 09-contact | 15/32 | 96.5% | 50% | pass |

All stops within the constrained-profile draw-call budget (32).

## Adjudication: scene-only 04-kota 35.6% vs 38% override

**Verdict: metric artifact, not a defect.** The 0.38 kota override was calibrated
against UI-inclusive captures (measured 39.1%). Scene-only mode removes the paper UI
overlay, which contributes ~3–4 points of measured coverage at this stop; the same
composition reads 35.6% without it. The gorge's dark ink mass is the known
intentionally ink-heavy pre-Phase-2 composition (old geometry, revalued dark
materials). The UI-inclusive mode remains the authoritative gate; scene-only is
informational. Phase 2 rebuilds the gorge (flanking cliffs, axe-cut cun) and the
final gate (0.55) is the Phase-5 authority — no override change now.

## Known pre-Phase-2 visual state (the "before")

- Mountains are smooth noise domes with lamp-lit `MeshStandardMaterial` shading —
  forms read rough/plastic, not brushed ink. No cun stroke fields, no silhouette
  rim darkening, no ridge profiles.
- Bamboo is colored geometry, not calligraphic stroke clusters.
- No paper grain in-material; paper exists only as clear color + fog + CSS.
- Distance cue is fog density, not ink dilution.
- These are exactly what Phase 2 (ink core + hero) and Phase 3 (vertical slice)
  replace; this baseline is the comparison target.

## Reproduce

```bash
npm run dev                                   # port 4242
node scripts/capture-journey.mjs --label baseline --gate phase1
node scripts/capture-journey.mjs --label baseline-scene --scene-only --gate phase1
```
