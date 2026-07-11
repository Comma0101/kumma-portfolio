# Immersive Client Portfolio Design

**Status:** Approved  
**Date:** 2026-07-11  
**Audience:** Founders and CTOs buying production-AI work  
**Primary outcome:** Qualified paid-project inquiries, not full-time employment

## Objective

Turn kumma.me into a proof-led client-acquisition site for production-AI audits,
builds, and advisory. The experience should feel worthy of Awwwards consideration:
one coherent visual idea, unusually strong craft, meaningful motion, and excellent
usability. The visual idea is a continuous spatial journey through systems that
turn messy inputs into reliable outputs.

Voice AI remains the sharpest wedge because it makes latency, ambiguity, and
reliability visible. The broader promise is production AI: real-time systems,
agent orchestration, workflow automation, data correctness, and technically
ambitious interactive products.

## Success criteria

- A founder or CTO can understand what Kumma builds, see credible proof, and
  start a project inquiry without interpreting the site as a job-search resume.
- Every featured project has a distinct, mechanism-based visual narrative.
- The homepage feels like one authored 3D world rather than unrelated animated
  sections.
- Native scrolling, reading, keyboard navigation, and contact conversion remain
  dependable throughout the experience.
- The WebGL experience degrades cleanly for mobile, reduced motion, constrained
  devices, and renderer failure.
- Project claims stay evidence-backed. No fabricated metrics, clients, or results.
- New canonical work pages improve internal linking, structured data, shareability,
  and long-tail discovery.

## Non-goals

- Do not place a separate WebGL renderer on every route.
- Do not turn the homepage into forced scroll snapping or a showreel that blocks
  reading and navigation.
- Do not promote every folder under `Documents/`.
- Do not expose private, legal, personally sensitive, unfinished-boilerplate, or
  overlapping projects merely to increase project count.
- Do not add full-time hiring language, a resume funnel, fabricated social proof,
  invented performance data, or generic agency claims.
- Do not replace the existing Atlas visual identity with a generic purple AI theme.

## Positioning and conversion

### Core positioning

> Kumma designs and ships production AI systems that survive real inputs,
> operational constraints, and failure.

Voice is the lead proof, not the only category. Copy should consistently connect
the projects through one transformation: messy input to reliable action.

### Primary buyers

- Founder or CTO with an AI product that works in a demo but breaks in production.
- Technical product leader who needs a scoped system built end to end.
- Engineering lead who needs an audit, architecture intervention, eval strategy,
  or specialist support for a difficult production constraint.

### Engagements

1. **Production AI audit** — failure analysis, latency/eval review, and fix roadmap.
2. **Build engagement** — scoped system taken from architecture to production.
3. **Advisory** — ongoing architecture, reliability, evaluation, and delivery input.

### Calls to action

- Primary site CTA: **Start a project**.
- Contextual CTA: **Bring me a production AI problem**.
- Case-study CTA: **Build a system like this**.
- Demo CTA remains secondary proof, not the universal conversion action.

All primary CTAs lead to `/contact`. The contact form asks for the problem,
constraint, stack, timeline, and budget. The mailto handoff stays honest until a
real form backend is available.

## Information architecture

### Homepage sequence

1. **Hero / horizon** — production-AI positioning and project CTA.
2. **Operational proof** — concise evidence from live systems, open tooling,
   evaluation assets, and technical writing.
3. **Positioning bridge** — voice as the hardest visible form of production AI.
4. **Featured work** — KOTA, Audiobook AI, ARCHON, and Splash Ink.
5. **Capabilities / engagement shapes** — audit, build, advisory.
6. **Research and proof** — Benchmark, Latency, Patterns, and Field Notes.
7. **Labs** — Spectral World Player and Robinhood Data Correctness.
8. **Contact / quiet horizon** — project brief and direct email.

### Canonical route model

- `/work` becomes the real project index.
- All project pages use `/work/<slug>`.
- Existing `/projects` redirects to `/work`.
- Existing `/projects/<slug>` routes permanently redirect to the matching canonical
  work page where one exists.
- Benchmark, Latency, Patterns, and Field Notes remain proof resources and do not
  masquerade as projects.

### Project tiers

#### Featured

| Project | Role in the sales story | Public status |
|---|---|---|
| KOTA | Real-time voice, grounding, guardrails, and workflow integration | Deployed proof with recorded demo surfaces |
| Audiobook AI | Production TTS pipeline, queues, recovery, PWA delivery | Live product |
| ARCHON | Multi-model orchestration, tools, memory, trace, and recovery | Open-source active R&D |
| Splash Ink | AI/3D pipeline plus high-craft interactive delivery | Active R&D, described honestly |

#### Labs

| Project | Why it belongs | Treatment |
|---|---|---|
| Spectral World Player | Real-time audio analysis translated into a performant 3D world | Compact work page and visual lab card |
| Robinhood Data Correctness | Messy data transformed into a trustworthy ledger | Existing case study; secondary placement, no trading-performance claims |

### Excluded from the public funnel

- Asylum Evidence: private and legally sensitive.
- Zhiji: product and compliance work is not aligned enough with the primary buyer.
- Premarket Agent Scanner: technically strong but trading-heavy and redundant with
  the data-correctness proof already present.
- Korami/Servio variants: overlap with KOTA.
- Hydration Tracker and older 3D Maze work: insufficiently differentiated for the
  current bar.
- RedNote content operations and internal outreach tooling: useful internally, but
  not flagship client proof.

## Unified project model

Create one typed project catalog as the source of truth for home, `/work`, footer,
related-project links, sitemap, and structured data.

Each entry contains:

```ts
type WorkTier = "featured" | "lab";
type WorkStatus = "live" | "open-source" | "active-r-and-d" | "case-study";

interface WorkProject {
  slug: string;
  title: string;
  href: `/work/${string}`;
  tier: WorkTier;
  status: WorkStatus;
  summary: string;
  tags: string[];
  artifact: string;
  evidence: {
    input: string;
    transform: string;
    output: string;
    guardrail: string;
  };
  visualKey: string;
  primaryAction?: { label: string; href: string };
  externalUrl?: string;
}
```

Catalog validation must enforce unique slugs, canonical `/work/` hrefs, a known
visual key, non-empty evidence, and an explicit public status. Legacy data can
remain temporarily only as a compatibility layer while routes are redirected.

## Case-study system

Every project uses a shared narrative shell while retaining project-specific
content and visuals.

### Shared sequence

1. Project identity, status, and one-sentence outcome.
2. Signature project visual.
3. Problem and operational constraint.
4. Input → transformation → output → guardrail.
5. Architecture or mechanism.
6. Failure modes and honest limits.
7. Evidence, artifact, repo, or live product.
8. Related proof and related project.
9. Paid-project CTA.

### Shared visual rules

- Atlas canvas, paper, sand, steel, signal, surface, and raised tokens remain the
  base palette.
- Project identity comes from geometry, material, rhythm, and one restrained
  secondary tone—not an unrelated color theme.
- Editorial headlines, mono system labels, grid lines, thin strokes, and quiet
  surfaces remain consistent.
- Project visuals must explain a mechanism even when motion is disabled.

## Immersive homepage motion

### Chosen approach: one continuous spatial journey

Use a single persistent Three.js renderer behind semantic HTML. Scroll advances an
authored camera through a common world. Each section owns a spatial stage with
camera, target, field of view, fog, lighting, and scene-group weights.

Separate canvases were rejected because they increase bundle/runtime cost and make
the experience feel like disconnected demos. Full scroll-jacking was rejected
because it undermines reading, accessibility, and conversion.

### Spatial stages

1. **Hero — open horizon**
   - Wide terrain, distant system beacons, restrained ambient movement.
   - Camera begins outside the system and slowly approaches.

2. **Operational proof — signal corridor**
   - Camera descends into structured paths.
   - Raw particles converge into stable rails to introduce the core idea.

3. **KOTA — voice tunnel**
   - Audio pulses travel through a corridor of tokens and menu nodes.
   - Ambiguity branches briefly, then resolves into an order plane.

4. **Audiobook AI — document chamber**
   - Page planes separate into chunks, pass through a queue, and reform as a
     chapter waveform.
   - Motion emphasizes durable pipeline stages rather than decorative sound bars.

5. **ARCHON — orchestration constellation**
   - Camera pulls outward into a network of models, tools, memory, and workers.
   - Routed signals visibly recover or change path.

6. **Splash Ink — splat landscape**
   - The graph dissolves into ink particles and a sparse landscape volume.
   - Camera gains lateral depth and reveals the visual-practice range without
     abandoning the systems language.

7. **Research and Labs — measurement plane**
   - Perspective becomes calmer and more orthographic.
   - Latency rails, evaluation marks, and compact lab artifacts occupy a measured
     coordinate field.

8. **Contact — quiet horizon**
   - Geometry recedes, the camera stabilizes, and active motion falls away.
   - The form and CTA receive undivided visual priority.

### Scene architecture

- Refactor the current homepage-only `ThreeScene` into an immersive scene director.
- Keep one renderer, one camera, and one frame loop.
- Define pure stage data in `immersiveStages.ts`.
- Keep the homepage's semantic `data-immersive-stage` section identifiers for
  content structure and analytics. They are not the camera-stage contract.
- Mark the eight spatial waypoints with dedicated `data-immersive-anchor`
  identifiers: hero, proof, each of the four featured project rows,
  research/labs, and contact.
- A lightweight `useImmersiveScroll` coordinator observes those spatial anchors
  and writes active stage and normalized progress into the scene director's
  stable ref without triggering React renders. The positioning bridge and the three
  research/capability sections inherit the interpolated or settled world around
  them rather than inventing extra camera environments.
- The coordinator reads the existing Lenis event when available and a passive
  native-scroll fallback otherwise. GSAP continues to choreograph foreground
  reveals and route motion; the camera does not add a second ScrollTrigger-based
  scroll controller.
- Scene groups are created once, reuse geometries/materials, and avoid allocations
  inside the frame loop.
- Project SVG visualizations remain the accessible foreground explanation and
  synchronize conceptually—not frame-for-frame—with the 3D background.

### Motion rules

- Scrolling remains native and interruptible.
- No mandatory snap points.
- No more than one dominant animated system in a viewport.
- Camera changes are scrubbed continuously across section boundaries, then settle
  while users read.
- UI micro-interactions remain 150–300 ms; route transitions remain at or below
  the existing 350 ms.
- Animate transforms, opacity, material uniforms, and camera parameters—not layout.
- Text and controls never parallax independently from their reading plane.

## Project-specific foreground visuals

The visual registry supplies a meaningful SVG/DOM animation for every public work
entry:

- **KotaViz:** call → audio → tokens → grounded intent → order ticket.
- **AudiobookViz:** document formats → normalized chunks → queue → chapter waveform.
- **ArchonViz:** task → coordinator → model/tool/worker routes → trace/recovery.
- **SplashInkViz:** painting plane → depth samples → splat field → authored camera path.
- **SpectralViz:** FFT bands → mapped world signals → terrain/light/particle response.
- **LedgerViz:** raw CSV rows → matching/FIFO rules → reconciled ledger output.

All visualizations expose a useful static state, an accessible label or adjacent text
summary, and reduced-motion behavior.

## Accessibility and fallback

- DOM content, headings, links, and forms remain the source of meaning.
- WebGL is `aria-hidden` and never contains the only explanation or control.
- Reduced motion disables continuous camera travel, looping SVG movement, smooth
  scroll, and staggered entrances. Each stage renders a composed static state.
- Constrained devices use fewer particles, simpler materials, lower geometry
  density, and gentle crossfades instead of camera travel.
- Mobile preserves the narrative with shorter camera distances and less depth.
- Renderer or asset failure falls back to the existing CSS terrain/poster treatment;
  content never disappears.
- Keyboard navigation, focus handoff, skip link, mobile-menu containment, 44 px touch
  targets, and 4.5:1 body-text contrast remain release gates.

## Performance design

- Keep WebGL homepage-only.
- Lazy-load noncritical project scene groups before their section approaches.
- Cap device pixel ratio by profile; use the existing tuning helper as the base.
- Pause rendering while the document is hidden and when the scene is outside its
  meaningful homepage range.
- Use instancing and shared buffer geometries for repeated particles/nodes.
- Avoid postprocessing until profiling proves adequate headroom.
- Reserve stable layout space for all visual frames to prevent CLS.
- Do not load real Gaussian-splat assets into the portfolio homepage. Represent the
  mechanism with a deliberately lightweight point field and link to the artifact.
- Treat 60 fps on a modern desktop and a stable simplified mobile experience as
  verification targets, not claims to publish.

## Traffic and discoverability

- Give `/work` a static, indexable project overview with descriptive internal links.
- Add canonical metadata, Open Graph data, sitemap entries, and `CreativeWork` or
  `SoftwareApplication` JSON-LD for new work pages.
- Use mechanism-first titles and descriptions that match real search intent:
  real-time voice AI, production TTS pipeline, agent orchestration, Gaussian
  splatting web experience, audio-reactive Three.js, and data reconciliation.
- Link relevant Field Notes and Patterns into each case study, and link projects back
  to the corresponding proof resources.
- Keep a single H1 per route and descriptive visible copy outside animated canvases.
- Generate OG cards for the new canonical pages.
- Do not publish private repositories, sensitive source material, or unsupported
  performance claims for the sake of SEO.

## Measurement

Use the existing analytics integration and add a small stable event vocabulary:

- `project_view` with project slug.
- `project_cta` with project slug and destination.
- `work_index_view`.
- `contact_start` when the full form receives its first meaningful interaction.
- Existing `contact_submit`, `audio_play`, and demo events remain.

The operating KPI is qualified project inquiries. Engagement metrics diagnose the
funnel; they are not the business goal.

## Error handling

- Unknown project slugs return the existing not-found behavior.
- Missing visual registry entries fail catalog validation in tests and show a static
  system-field fallback in production.
- WebGL construction errors log once and activate the CSS fallback.
- Scene-stage errors must not stop scrolling or route navigation.
- External project links are optional and appear only when verified.
- R&D status is visible wherever an unfinished project is presented.

## Verification strategy

### Unit and structural tests

- Project catalog invariants and canonical hrefs.
- Every public project resolves to a visual registry entry.
- Stage interpolation, clamping, mobile profiles, and reduced-motion resolution.
- Legacy redirect mappings.
- Sitemap and structured-data coverage.
- No nested `<main>` landmarks or regression in navigation semantics.

### Production verification

- Full `npm test` and `npm run build`.
- Desktop: 1440 × 900 and 1920 × 1080.
- Mobile: 375 × 812 and 390 × 844.
- Landscape mobile and tablet.
- Reduced motion and constrained-device profiles.
- Keyboard-only navigation and route focus handoff.
- WebGL-unavailable fallback.
- No horizontal overflow, trapped scroll, content hidden behind navigation, or
  active animation over the contact form.
- Confirm Three.js chunks remain absent from non-home routes unless a work page has
  an explicitly approved lightweight visual.

## Delivery phases

1. **Foundation:** typed catalog, canonical `/work` index, redirect map, positioning,
   marketing context, analytics vocabulary.
2. **Visual consistency:** shared case-study primitives and complete project visual
   registry.
3. **Immersive scene:** stage model, scroll coordinator, camera rig, lightweight
   project scene groups, fallbacks.
4. **New work:** Splash Ink and Spectral World Player pages, Labs placement, metadata,
   structured data, OG, sitemap, internal links.
5. **Conversion:** capabilities section, project CTAs, contact copy, removal of hiring
   language.
6. **Award-quality polish:** responsive tuning, reduced motion, performance profiling,
   browser matrix, accessibility review, and final visual QA.

## Decision summary

- Optimize for paid production-AI work with founders and CTOs.
- Use four flagship projects and a restrained Labs tier.
- Add Splash Ink and Spectral World Player; do not indiscriminately publish local
  folders.
- Make `/work` canonical and unify project data.
- Use one continuous Three.js world with section-driven camera stages.
- Keep native scrolling, semantic DOM, and strong fallbacks.
- Treat motion as explanation and spatial continuity, not decoration.
- Preserve the Atlas identity and make the contact conversion the calm final state.
