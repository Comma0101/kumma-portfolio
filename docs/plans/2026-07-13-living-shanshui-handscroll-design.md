# Living Shanshui Handscroll

- **Status:** Approved direction, implementation in progress
- **Date:** 2026-07-13
- **Audience:** Founders, CTOs, technical product leaders, and engineering leads
- **Business outcome:** Qualified inquiries for production-AI audits, scoped builds, and advisory
- **Creative outcome:** A coherent shanshui journey whose landscape, camera, and living details explain the work rather than decorate it

## Decision

Keep the current single-renderer architecture, native-scroll coordinator, continuous
camera spline, deterministic event windows, procedural terrain, semantic HTML, and
performance/accessibility protections. Replace the industrial facility art direction
with one living Chinese landscape handscroll.

The terrain becomes ink geology shaped by a continuous river. Mountains, mist, water,
bamboo, a single travelling boat, one restrained flock, and fish shadows occupy fixed
geography. Each motif has one narrative responsibility. Nothing appears merely because
a section became active.

## Experience thesis

> Reliable systems turn uncertain inputs into a navigable path.

The visitor follows one water route through constraints, forks, recovery, depth, and
calibration. Project mechanisms behave as consequences within that landscape. The
world remains understandable with the foreground copy temporarily hidden, while the
complete sales and proof experience remains available with WebGL disabled.

## Shanshui composition grammar

The camera journey uses the traditional three-distance idea as a spatial structure:

1. **High distance (gaoyuan):** the hero establishes monumental vertical scale from a
   mountain overlook.
2. **Deep distance (shenyuan):** the camera enters mist, bamboo, gorges, river bends,
   and layered project landscapes.
3. **Level distance (pingyuan):** the contact chapter resolves across pale water and a
   broad, quiet horizon.

The browser still uses native vertical scrolling. The handscroll metaphor describes
progressive revelation, not a forced horizontal interaction.

## Journey map

| Content | Landscape | Dominant event |
| --- | --- | --- |
| Hero | High mountain overlook, river thread, distant boat | Establish destination and scale |
| Operational proof | Tributaries converge through stone into one current | Messy inputs become reliable action |
| Positioning bridge | Mist pass and bamboo threshold | Enter the shanshui world |
| KOTA | Listening gorge with one water pulse and a blocked fork | Ambiguity is clarified before action |
| Audiobook AI | Paper terraces align into a continuous scroll-river | Segments become continuous audio |
| ARCHON | Vertical passes, stone bridges, gates, and alternate routes | A blocked path recovers through orchestration |
| Splash Ink | Flat ink-water rises into spatial mountains | A classical image becomes navigable depth |
| Capabilities / research / labs | Scholar's survey terrace above the valley | Spectacle resolves into method and judgment |
| Contact | Open lake, moored boat, distant peaks | Arrival, availability, and a calm conversion moment |

## Motif discipline

- One boat persists across the complete journey. It establishes human scale, route
  continuity, and arrival.
- Bamboo belongs only at the world threshold and KOTA listening gorge.
- Birds appear only around ARCHON, where they express scale and branching routes.
- Fish appear only around Splash Ink, where their shadows reveal water depth.
- Mist marks thresholds and depth; it is not generic particle noise.
- No pagodas, lanterns, dragons, red-and-gold theme layer, brush-display fonts, or
  unverified Chinese text.
- At most one semantic mechanism and one quiet ambient cue move in a viewport.

## Palette and material language

- Ink: near-black charcoal with readable green-gray separation
- Paper: warm xuan-paper ivory
- Mineral: restrained blue-green for water and selected atmospheric planes
- Stone: desaturated gray-green
- Cinnabar: one small accent reserved for the primary action or seal-like marker

Terrain and mountain light is expressed through matte ink-value bands, silhouette,
fog, and restrained grain. Glossy chrome, bloom, neon conduits, and texture-heavy
photorealism are excluded.

## Motion contract

- Camera, boat travel, project events, and reveals are deterministic functions of
  document progress and reverse exactly when scrolling backward.
- Time contributes only a small decaying cue while scroll energy is present.
- Bamboo, mist, birds, fish, and water settle when scrolling stops.
- Native scroll remains interruptible. No second ScrollTrigger camera controller,
  scroll snapping, or forced pinning is introduced.
- Reduced motion selects authored static chapter poses with no continuous ambient
  animation.
- Mobile uses fewer deliberate silhouettes and stronger composition, not a uniformly
  scaled-down desktop scene.

## Production sequence

First prove a vertical slice:

`mountain hero -> river convergence -> mist/bamboo threshold -> KOTA listening gorge`

The slice must pass a real-browser scene-only review for silhouette, scale, occlusion,
camera clearance, content aperture, reverse scroll, mobile composition, reduced motion,
and hardware-GPU frame pacing. Only then should the same material and motion grammar be
carried through the later chapters.
