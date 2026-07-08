# kumma.me rebuild — build plan & status

Source of truth for the Voice AI Direction rebuild (spec v1.0, 2026-07-07).
This tracks what the Builder agent can ship now vs. what is blocked on Wu's
real infrastructure. Guardrail #1 governs everything: **no unmeasured numbers,
anywhere.** Metric surfaces ship empty until real data exists.

## Positioning lock (short form)
Independent real-time voice AI systems builder, LA. Site's one job: inbound
voice-AI consulting/build engagements. KOTA = proof, not a product. No trading
content. No prior-client references. Primary KPI: qualified contact submissions
(2/month by day 90).

## Page build status

| Route | Spec role | Status | Blocker |
|-------|-----------|--------|---------|
| `/contact` | Engagement types + qualification form | **building now** | Form backend key (optional; mailto fallback works) |
| `/patterns/*` | 10 SEO pattern pages | buildable now (content) | Needs real code/mechanism per page |
| `/notes` | Field Notes (rename from `/blog`) | buildable now | Route rename + redirects |
| `/work/kota` | Case study (rewrite from product page) | buildable now | Measured results, 3 call recordings (Wu) |
| `/work/qa` | Voice eval harness | blocked | **Rename** (ARCHON collides w/ 22k★ repo) + repo |
| `/benchmark` | Voice Agent Stress Suite v1 | blocked | 50 audio scenarios, scoring repo, KOTA scores |
| `/latency` | Monthly latency report | blocked | Real measured latency data |
| `/call` | Live demo line | blocked | **Twilio number + KOTA stack live** |
| `/` home | Live-line hero + proof strip | partial | Phone number; proof strip stays EMPTY until measured |
| `/about` | Identity, Market Systems demoted here | buildable now | — |
| `/zh` | Chinese mirror | later | Translations (Wu reviews each) |

## What I need from Wu to unblock (ranked by leverage)

1. **A public Twilio number** wired to the KOTA "Kumma Diner" stack → unblocks
   `/call` (traffic magnet #1 + HN launch #1) and the home hero.
2. **A form backend** (free: Web3Forms / Formspree access key) → real `/contact`
   logging + spam handling. Until then the form uses a mailto fallback.
3. **Chosen name** to replace ARCHON (see name-check below) → unblocks `/work/qa`
   and the benchmark repo.
4. **Measured metrics** (p95 turn latency, stress-suite pass rate, calls handled)
   → the home proof strip and `/work/kota` results. NONE ship until measured.
5. **Analytics decision**: spec says Plausible; the site already has Umami wired
   (an "or equivalent"). Keeping Umami + firing the spec's custom events
   (`tel_click`, `contact_submit`, `audio_play`, `benchmark_download`) unless Wu
   wants Plausible specifically.

## ARCHON name-check (Guardrail #6 — done)
Rename mandatory. Collisions found on GitHub:
- `coleam00/Archon` — 22,758★ — open-source AI coding harness (same domain).
- `ScalingIntelligence/Archon` — 205★ — LLM inference framework.
- `frenzymath/Archon` — 159★ — multi-agent AI.
Candidate voice-specific names (final-check the winner before repo creation):
Earshot (recommended), Crosstalk, Barge, Soundcheck, Switchboard.

## Pivot note — supersedes prior session work
This direction replaces the SMB-services framing built earlier:
- `/build` (SMB "book a consult" funnel) → superseded by `/contact`
  (voice-AI engagement types). Retire `/build` once `/contact` + nav are live.
- The AI-receptionist SMB content cluster (pillar + 2 spokes) targets restaurant/
  med-spa *owners*, not the voice-AI-engineer buyer this spec targets. Keep the
  posts (they're honest and rank), but Field Notes going forward follow the
  spec's technical backlog (latency, barge-in, endpointing, eval design).
- Market Systems: demote from home to a paragraph on `/about`. No trading content.
- **Confirm with Wu before deleting `/build` or the receptionist cluster.**

## Phased build order (Builder)
- **P1 (now):** `/contact` (KPI page). This doc.
- **P2:** `/patterns` index + template + 2–3 real pages; rename `/blog`→`/notes`
  with redirects; `/about` (absorb Market Systems).
- **P3:** `/work/kota` case-study rewrite (structure now, drop in Wu's recordings
  + measured results when supplied).
- **P4 (unblock-gated):** `/call`, `/benchmark`, `/latency`, home hero rebuild,
  nav cutover to 5 items (Work · Call the agent · Benchmark · Notes · Contact).

## Guardrail checklist (every PR)
- [ ] No unmeasured numbers. Metric slots empty, not placeholdered.
- [ ] Sentence case, plain verbs, no exclamation marks, no emoji on site.
- [ ] No trading content. No 39mile / prior-client references.
- [ ] Name-check any new public artifact.
- [ ] Audio never autoplays; consent + PII rules for anything recorded.
