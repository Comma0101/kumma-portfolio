# Carved Systems Facility Immersive Redesign

- **Status:** Approved direction
- **Date:** 2026-07-11
- **Audience:** Founders, CTOs, technical product leaders, and engineering leads
- **Business outcome:** Qualified inquiries for production-AI audits, scoped builds, and advisory
- **Creative outcome:** A coherent, premium journey whose camera movement and world transitions have spatial meaning

## Decision summary

Keep the existing moving terrain, single homepage renderer, native scroll, semantic
content, Atlas palette, and conversion structure. Replace the seven fading abstract
scene groups with one authored route through a monumental systems facility carved
into the terrain.

The visitor begins outside, sees a destination, approaches it, crosses a physical
threshold, moves through four connected project environments, emerges onto a
calibration deck, and returns to a quiet horizon. Project mechanisms become
behaviors of the architecture and terrain. They are no longer diagrams floating
behind the page.

This design deliberately rejects the generic purple/pink bento recommendation
returned by the design-system lookup. Kumma already has a more distinctive visual
language: paper, sand, steel, signal green, restrained editorial type, and dark
geological space.

## Why the current scene underperforms

The current implementation is technically sound but art-directed around the wrong
abstraction. It constructs `horizon`, `signals`, `voice`, `document`,
`orchestration`, `splats`, and `measurement` groups in one shared volume, then
crossfades their weights while interpolating camera keyframes.

That creates five visible problems:

1. **No geography.** The viewer never sees where they are going or crosses a
   threshold into a new place.
2. **No causality.** Rings, pages, nodes, points, and grids appear because a section
   is active, not because something in the world produced them.
3. **No hierarchy of scale.** Most elements are thin lines, basic primitives, or
   small particles, so every project has the same visual weight.
4. **No persistent consequences.** One pattern fades out and another fades in;
   nothing encountered changes the world that follows.
5. **Insufficient visual aperture.** Large opaque project cards cover most of the
   viewport, hiding camera travel, depth, occlusion, and lighting changes.

The redesign is therefore not an effects pass. It replaces the scene's spatial
grammar.

## Experience thesis

> Production AI is a path through constraints, gates, decisions, and recovery—not
> a cloud of abstract technology symbols.

The environment expresses this thesis physically. Raw terrain is shaped into a
reliability spine. Inputs enter the facility, pass through project-specific
chambers, and emerge as a measured, operable system. The visitor understands the
journey even if all explanatory copy is temporarily hidden.

## Non-goals

- Do not add more decorative patterns, random point clouds, bobbing groups, or
  generic network diagrams.
- Do not create separate WebGL scenes or renderers for individual projects.
- Do not use scroll snapping, forced scroll, long pinned reading sections, or
  independently parallaxed body text.
- Do not replace the Atlas palette with neon purple, cyberpunk gradients, or a
  different color theme per project.
- Do not depend on large remote GLB assets, heavy post-processing, bloom, or shadow
  maps to create quality.
- Do not hide case-study proof, conversion links, or semantic content inside the
  canvas.
- Do not publish frame-rate, business, or project-outcome claims without measured
  evidence.

## Spatial grammar

Every chapter must contain the same five-part spatial sentence:

1. **Anticipation:** the next destination is visible before arrival.
2. **Approach:** forward travel changes scale and parallax continuously.
3. **Threshold:** geometry, occlusion, fog, or light marks entry into a new place.
4. **Dominant event:** one mechanism performs one legible transformation.
5. **Handoff:** the event settles and reveals the route to the next destination.

At most one mechanism event and one quiet ambient cue may move in a viewport.
Transitions use physical continuity and occlusion rather than opacity crossfades.
All events are deterministic and reversible when the visitor scrolls backward.

## Journey map

### 1. Hero — exterior ridge

The visitor starts above the existing geological terrain. A distant vertical slit
of warm light or low monolith establishes the facility as a destination. The
terrain's motion is restrained and directional, subtly pulling toward that point.
The facility remains visible behind the positioning headline without competing
with it.

The hero communicates scale and intent. It does not introduce project diagrams.

### 2. Operational proof — reliability spine

The camera lowers and advances. Sparse paths embedded in the ground converge into
one carved channel leading toward the facility. These paths are part of the
terrain surface with real thickness or emissive insets, not floating line
segments.

The convergence embodies the site's central promise: messy inputs become a
reliable route. The entrance grows large enough that the visitor understands they
will cross it next.

### 3. Positioning bridge — the fissure

The camera descends into a narrow cut in the terrain. Rock and architectural ribs
temporarily occlude the horizon, creating a natural visual wipe. Exterior light
falls away; controlled interior light appears ahead. This is the unmistakable
moment of entering the system.

No new content panel should cover this threshold. The bridge copy occupies a
limited edge of the frame and leaves the entrance readable.

### 4. KOTA — voice chamber

The first interior chamber uses structural ribs and wall conduits, not torus rings.
A single signal travels forward, splits at an ambiguity gate, pauses at the unsafe
route, and resolves through an illuminated clarification route into a stable order
plane.

The event reads as:

`speech → interpretation → ambiguity gate → clarified action`

The camera passes through the chamber rather than observing a diagram from
outside. The resolved route continues physically into the next room.

### 5. Audiobook AI — document foundry

The same route enters a taller, warmer chamber. Large page-like slabs emerge from
the walls, separate into ordered segments along a recessed track, wait in a visible
queue, and reform into one continuous illuminated band that leads onward.

The slabs are architectural-scale forms with mass and material. Small wireframe
pages moving independently are prohibited. One queue stall/recovery cue may be
shown, but the primary read remains segmentation and reassembly.

### 6. ARCHON — orchestration atrium

The ceiling opens and the camera pulls upward and laterally for the journey's
largest reveal. Bridges, towers, and suspended routes form a real atrium. One
signal enters a coordinator, travels toward a worker route, encounters a blocked
path, and visibly recovers through an alternate route while the trace remains
inspectable.

The architecture communicates hierarchy through scale: coordinator core, worker
bridges, tool and memory wings, and a safety gate. Random nodes connected by lines
are prohibited.

### 7. Splash Ink — dissolution observatory

The facility opens toward a landscape aperture. A portion of the architecture
dissolves into sampled depth, but the points reconstruct a coherent surface rather
than filling space randomly. The camera makes one controlled lateral move, revealing
parallax and the relationship between a flat ink plane, depth field, and spatial
landscape.

This is the journey's poetic release. The Atlas material system remains present so
the scene feels like an extension of the same facility, not a separate visualizer.

### 8. Capabilities, research, and labs — calibration deck

The camera emerges onto a wide exterior survey deck. Perspective gradually levels
and motion slows. Measurement marks, tolerances, and traces are engraved into the
surface or attached to architectural instruments. A generic infinite grid is not
used.

This calmer space supports the audit/build/advisory and research content. It
communicates inspection and judgment after the more cinematic project chambers.

### 9. Contact — quiet horizon

The route returns to open terrain. The facility is now behind or beside the camera,
and the distant horizon is clear. Active mechanisms stop. One stable signal remains
as evidence that the system is operating.

The contact call to action receives the quietest composition on the page. The
journey ends with confidence and availability, not another visual climax.

## Camera choreography

- Use one continuous authored spline through world space. Forward route progress is
  monotonic; lateral and vertical moves add reveals but never teleport the viewer.
- Sample the camera position from the route and derive its target from a short
  look-ahead point plus small authored stage offsets.
- Keep the curve tangent-continuous through thresholds. Hard cuts are reserved only
  for the reduced-motion static composition.
- Limit roll/bank to a subtle authored range. Camera shake, orbit controls, and free
  look are not part of the experience.
- Map native document progress to route progress through the existing single scroll
  coordinator. Do not add a second ScrollTrigger camera controller.
- Damping may soften input, but it must remain interruptible and reverse immediately
  when scroll direction changes. A long cinematic lag is not acceptable for a
  portfolio visitors are reading.
- Pointer influence is allowed only as a small exterior parallax cue. It is disabled
  in thresholds, on touch devices, and under reduced motion.

## World, material, and lighting language

### Geometry

- Use a few large authored silhouettes: ridge, fissure, portal, ribs, slabs,
  bridges, atrium core, aperture, and calibration instruments.
- Give signal paths physical thickness through tubes, ribbons, or recessed emissive
  geometry. Avoid `LineBasicMaterial` for signature forms.
- Use instancing for repeated ribs, slabs, and markers.
- Randomness may add minor geological variation, but it may not determine semantic
  project geometry.
- Keep every facility zone present in world space. Fog, occlusion, and distance
  reveal it naturally; project groups do not crossfade in the same coordinates.

### Materials

- **Terrain:** matte charcoal geology with restrained steel/sage highlights.
- **Facility shell:** near-black stone and brushed dark metal.
- **Readable system surfaces:** warm paper/sand planes.
- **Active flow:** signal green, used only where action is currently occurring.
- **Splash Ink release:** muted ink/plum as a secondary atmosphere, never a new
  theme.

Use actual material contrast, normals, and silhouette before adding glow. Heavy
bloom and glossy sci-fi chrome are excluded.

### Lighting

- Exterior: one directional key, soft atmospheric fill, and strong depth fog.
- Threshold: warm practical light beyond a dark occluder.
- Interior: restrained local lights that identify the active mechanism.
- Atrium: the largest vertical light gradient in the journey.
- Exit: wider, softer light and lower contrast behind the contact content.

Prefer inexpensive directional/hemisphere lighting and shader-based contact
shading over shadow maps and post-processing.

## Foreground content composition

Semantic HTML remains the product layer. The canvas remains decorative and
`aria-hidden`.

On desktop:

- A project chapter gives the world at least roughly 58% of the viewport at its
  key visual moment.
- Copy occupies a restrained edge column with a directional gradient scrim rather
  than a large opaque card.
- Alternate the copy edge only when it supports the camera composition.
- Keep title, status, concise mechanism, evidence flow, and CTA. Move visually
  redundant full diagram panels off the immersive desktop homepage; they remain on
  `/work` and case-study pages.
- Body text does not parallax, scale, rotate, or remain pinned for long distances.

On mobile and constrained profiles:

- Reading wins. Copy uses an opaque accessible surface and normal document flow.
- The world is cropped and simplified to one static or low-motion composition per
  chapter.
- Existing textual input/transform/output/guardrail evidence remains available even
  when project visualization is reduced.

## Motion behavior

- Scroll is the primary energy source. Camera travel and mechanism progress are
  functions of scroll position.
- Time-driven motion is limited to one quiet cue and decays to stillness shortly
  after scrolling stops. The page must be comfortable to read while idle.
- Remove generic group bobbing, rotation, scale pulsing, and terrain drift that does
  not indicate travel.
- One stage cannot activate another stage's semantic event merely to make the frame
  busier.
- Reverse scrolling reconstructs the journey exactly without one-shot state or
  broken recovery sequences.
- Foreground reveals remain short, subtle opacity/translation treatments with a
  visible no-JavaScript state.

## Accessibility and resilience

- Preserve native, interruptible scrolling, anchor navigation, keyboard order,
  visible focus, semantic headings, and functional conversion links.
- `prefers-reduced-motion: reduce` selects a deliberate static pose for the nearest
  chapter. It performs no continuous camera damping, ambient animation, or time-based
  mechanism motion.
- WebGL failure retains the Atlas CSS field and all semantic content. No CTA or proof
  depends on the scene.
- Context loss and profile changes keep the existing candidate-first resource swap
  and disposal guarantees.
- Text contrast is evaluated against the darkest and brightest possible scene frame,
  not only against a design token in isolation.
- Mobile supports 375 px width, touch targets remain at least 44 px, and zoom at 200%
  produces no horizontal overflow.

## Performance constraints

- One renderer, one canvas, one camera, one animation loop, and no homepage model or
  texture downloads.
- No post-processing pipeline in the first implementation.
- Use instancing, shared geometry, shared materials, spatial grouping, fog, and far
  culling.
- Add explicit full, balanced, mobile, and static budgets for facility repetitions,
  particles, terrain segments, pixel ratio, and draw calls.
- Stop or settle time-driven work when the visitor is idle, the tab is hidden, the
  journey is outside the viewport, or reduced motion is active.
- Performance acceptance requires a hardware-GPU feel pass and trace. Headless
  software-rendering FPS is diagnostic only and must not be published as a claim.

## Architecture direction

The existing scroll coordinator and lifecycle protections remain. The stage and
world layers change:

1. The pure stage model outputs route progress, local stage progress, atmosphere,
   and semantic event progress instead of seven normalized group weights.
2. A pure camera-path module samples an authored route and look-ahead target.
3. A facility-world factory creates the terrain, reliability spine, connected
   architecture zones, lights, and materials once.
4. Each zone exposes a deterministic update function driven by stage progress and
   motion energy.
5. `ThreeScene` remains the owner of renderer lifecycle, resource swaps, context
   recovery, profile selection, and frame scheduling.

No new state manager, animation library, canvas, or asset pipeline is required.

## Validation gates

The redesign is not complete unless it passes all of these gates:

1. **Scene-only test:** with foreground HTML hidden, an observer can identify an
   exterior, entrance, interior chambers, observatory/deck, and exit in order.
2. **Text-only test:** with WebGL disabled, a founder or CTO can understand the
   service, inspect proof, and start a project.
3. **Threshold test:** the exterior-to-KOTA transition reads as physically entering
   somewhere, not as a color or opacity change.
4. **Continuity test:** every destination is foreshadowed and every outgoing path
   leads toward the next zone.
5. **Dominant-event test:** no viewport contains more than one project mechanism
   competing for attention.
6. **Reverse test:** scrolling backward reconstructs every event and camera move
   without snapping or stale state.
7. **Aperture test:** project copy leaves enough unobstructed world area for the
   camera and mechanism to be legible.
8. **Accessibility test:** reduced motion, keyboard use, 200% zoom, mobile reading,
   and WebGL failure remain complete experiences.
9. **Performance test:** no unexplained bundle regression, no sustained main-thread
   long tasks during scroll, and acceptable hardware-GPU frame pacing at all
   quality profiles.

## Approval checkpoint before full production art

Implementation must first produce a greybox vertical slice covering:

`hero ridge → reliability spine → fissure threshold → KOTA voice chamber`

Review that slice in a real browser at desktop, mobile, and reduced motion before
building the later chambers. The slice must prove forward travel, scale,
occlusion, content aperture, and reverse-scroll behavior. If it still reads as a
background pattern, later project geometry must not proceed.

