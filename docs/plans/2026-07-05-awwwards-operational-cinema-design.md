# Awwwards Operational Cinema Design

## Context

The current portfolio already has a strong visual language: dark atmosphere,
editorial type, WebGL terrain, system diagrams, and a clear headline around
production AI. The gap is not taste. The gap is proof density. Awwwards-style
creative and technical judges need to feel the concept immediately and then see
that the interaction, motion, and implementation all serve that concept.

The approved direction is **Operational Cinema**: the site should feel like
entering a living AI control room, where every visual layer explains how Kumma
builds systems that operate under pressure.

## Audience

Primary audience: Awwwards-style creative and technical judges.

Secondary audiences remain important, but subordinate:

- founders evaluating KOTA or custom agents
- applied-AI and founding-engineer recruiters
- technical peers evaluating implementation depth

## North Star

The first ten seconds should communicate:

> This person builds operational AI systems, and the site itself behaves like
> one.

The site should not simply show projects. It should demonstrate a repeatable
pattern:

1. messy input enters a system
2. orchestration transforms it
3. structured action exits
4. feedback and guardrails keep it reliable

## Creative Principles

- **Motion proves behavior.** Animation should reveal flow, routing, latency,
  fallback, confidence, or feedback. Avoid decorative motion with no system
  meaning.
- **Evidence before atmosphere.** Keep the cinematic dark surface, but make
  proof visible earlier: live demos, repos, architecture, pipeline stages, and
  artifacts.
- **Operational, not magical.** The site should avoid vague AI spectacle. It
  should make the pipes visible: audio, tools, memory, rules, scores, retries,
  humans.
- **Editorial restraint.** Preserve the quiet, serious brand. Do not turn the
  page into a neon dashboard or generic AI SaaS interface.
- **Human system builder.** The work should still feel authored by one person:
  opinionated, precise, and reflective.

## Experience Architecture

### 1. Hero: System World

Keep the immersive WebGL terrain as the cinematic base, but add a subtle
technical overlay:

- a compact signal rail showing three active systems
- short system events such as `call -> order`, `route -> worker`, and
  `signal -> rule`
- proof chips above or near the primary CTA
- stronger mobile contrast for subtext and availability

The hero should still feel spacious, but not empty. The visual world should
suggest live infrastructure rather than only atmosphere.

### 2. Proof Console

Add a proof band directly after the hero. This is the credibility bridge before
the selected-work chapters.

Suggested proof items:

- KOTA: live voice/order system
- ARCHON: open-source agent control plane
- Market Systems: decision-quality tooling
- Outreach/voice/trading tools: local-first operational systems

Each item should have a concise status, a technical attribute, and a link or
artifact path where possible.

### 3. Interactive Chapters

Upgrade selected-work cards from project summaries into system evidence cards.
Each chapter should expose:

- input
- transformation
- output
- reliability mechanism
- primary artifact or deeper case-study link

KOTA should remain the flagship. ARCHON should emphasize orchestration and
inspectability. Market Systems should emphasize feedback loops and provenance.

### 4. Case Studies

Project pages should put evidence above the fold. Instead of large empty hero
space followed by metrics below, each first viewport should show:

- title and thesis
- live/demo/repo CTA
- metric/proof stack
- system diagram or artifact preview

KOTA already has the best proof material; it should be surfaced earlier.
ARCHON needs more concrete examples of routing, sessions, workers, memory, and
human approval. Market Systems needs non-financial artifacts such as scoring
rubrics, journal schema, and dashboard states.

### 5. Field Notes

Reframe the blog as **Field Notes** or **System Notes**. The top engineering
posts should read as technical evidence that supports the portfolio, while the
personal essays can remain accessible but secondary.

The gallery should become **System Studies** or **Visual Systems**, making the
creative practice feel connected to interface and interaction research rather
than a separate art annex.

### 6. Agent Protocol

The agent protocol is conceptually strong and technically distinctive. It should
remain, but the fixed pill and automated-visitor banner need better collision
rules on mobile and during screenshots. The protocol should feel like a hidden
technical layer, not an overlay that competes with the work.

## Technical Requirements

- Preserve static export compatibility.
- Preserve existing project data and routing unless a route is intentionally
  reframed.
- Keep accessibility tree coherent and maintain semantic headings.
- Respect `prefers-reduced-motion`.
- Avoid blocking content behind fixed overlays.
- Fix the missing favicon error.
- Verify desktop and mobile screenshots for home, KOTA, ARCHON, Market Systems,
  blog/field notes, and build/contact.

## Non-Goals

- Do not rebuild the whole site from scratch.
- Do not add heavy new dependencies unless the existing stack cannot support the
  effect.
- Do not fabricate metrics or performance numbers.
- Do not make the page feel like a generic AI dashboard.
- Do not hide project evidence behind long intro animation.

## Success Criteria

- First viewport feels conceptually award-level, not just atmospheric.
- Judges understand the central concept without reading a long case study.
- The selected work section shows technical proof, not only summaries.
- Case-study first viewports use their space to show evidence.
- Mobile has no overlay collisions or low-contrast critical text.
- Build passes and browser console has no site-owned errors.
