# Design Spec — Portfolio Phase 1A: Design System + Home / Entrance Shell

**Date:** 2026-06-13
**Status:** Draft for review
**Owner:** Kumma (Yang Wu)
**Scope of this spec:** Phase 1A only — the visual + motion design system and the rebuilt home/entrance page, plus global chrome (navigation, footer, page transitions) and removal of the current fake-UI and dead code. The KOTA deep case study is Phase 1B (separate spec). ARCHON, Market Systems, and Experiments full chapters are Phase 2. About/Philosophy expansion, Contact polish, and blog integration are Phase 3.

---

## 1. Goals

Turn the home page from a résumé-shaped page of fake dashboards into the **entrance to a personal digital world** for an independent systems builder, while preserving the dark cinematic identity and the production fundamentals that already work (palette discipline, reduced-motion, accessibility, the terrain background).

Concretely, Phase 1A must:

1. Establish a reusable **design system** (tokens, type, motion, components) every later chapter inherits.
2. Ship a **rebuilt home page** with eight distinct layout families (no repeated 2-column splits).
3. Replace **all div-based fake product UI** with either real authored visualizations or editorial treatment.
4. Replace the **blocking intro gate** with an integrated, non-blocking hero assemble.
5. Remove **dead/orphaned code** and fix duplicate-route / unused-import issues.
6. Stay a clean **static export** to GitHub Pages: fast, accessible, graceful without WebGL.

### Non-goals (explicitly later)
- Full KOTA / ARCHON / Market case-study pages (1B / 2).
- A full immersive 3D "camera-rail" world (rejected: direction C).
- Blog redesign, gallery internals rework (Phase 3).

---

## 2. Decisions locked during brainstorming

| Decision | Choice |
|---|---|
| Build order | Design system + home shell first; KOTA chapter next |
| 3D ambition | **B — Hybrid:** authored 3D hero + one signature viz per chapter; editorial DOM elsewhere |
| Art direction | **Atlas, warmed** (graphite + warm-white, muted-red signal, sand warmth) |
| Headline | "I build intelligent systems *for the real world.*" |
| Intro gate | Removed; folded into a non-blocking hero assemble |

---

## 3. Design system

### 3.1 Color tokens (CSS variables in `app/globals.css`)
```
--canvas:  #0a0a0b   /* page background (near-black, neutral-warm) */
--surface: #131316   /* panels, cards */
--raised:  #1a1a1e   /* elevated / 3D-adjacent surfaces */
--paper:   #f0ede8   /* primary text (warm white) */
--steel:   #a4a09a   /* secondary text */
--faint:   #6f6b65   /* annotations, captions */
--signal:  #c06a5c   /* muted red — interactive/active ONLY */
--sand:    #c9b8a0   /* warm accent — atmosphere ONLY, never interactive */
--line:    rgba(240,237,232,.12)
--line2:   rgba(240,237,232,.22)
--radius-card: 14px
--radius-control: 8px
```

### 3.2 The two-tone accent rule (must hold everywhere)
- **`--signal` (muted red)** is the only color used for interaction and live state: primary CTAs, links-on-hover, focus accents, "live/active/now" indicators, the active element inside a visualization.
- **`--sand` (warm)** is never interactive. It appears only in atmosphere: the 3D wireframe/point field, low-opacity gradients, subtle surface tints, and as the color of the serif-italic editorial voice.
- Result: one action color, one warmth color, each with exactly one job. This is the documented exception to "one accent per page."

### 3.3 Typography (via `next/font/google`)
- **Display + body:** Space Grotesk (keep; already wired). Display weight 500–600, tracking ~-0.03em, line-height ~0.98.
- **Mono:** JetBrains Mono (upgrade from Roboto Mono). Annotations, labels, data, live signals. Letter-spacing ~0.1–0.18em uppercase for labels.
- **Editorial serif italic:** Cormorant Garamond italic, used sparingly — philosophy, pull-quotes, and the one accented clause in display headlines. Colored `--sand`.
- Italic descender clearance: any italic word with descenders gets `line-height ≥ 1.1` + bottom padding reserve.

### 3.4 Motion tokens
- Reveal: fade + rise 24px, `cubic-bezier(0.16,1,0.3,1)`, 0.6–0.9s, stagger 0.06–0.09s.
- Micro: 180ms transforms (translateY 1–2px, scale 0.98) on hover/active.
- Scroll: Lenis + IntersectionObserver / Motion `whileInView`. **No `window.addEventListener('scroll')`.**
- Reduced motion: every animation collapses to static/instant under `prefers-reduced-motion`.

### 3.5 Surfaces & depth
- Hairlines (`--line`) and whitespace over cards/shadows. Tint shadows to background when used.
- One corner-radius system: `--radius-card` for panels, `--radius-control` for controls; pills only for chips/social.

### 3.6 Component inventory (built in 1A)
Buttons (primary red, ghost) · mono annotation/eyebrow · `Live` signal indicator · section header (stacked, never split-header) · chapter index row · **SystemViz frame** (the real-visualization container that replaces fake dashboards) · nav · footer.

---

## 4. Hybrid-3D approach

- 3D is used only for meaning. In 1A: the **hero scene**, plus **lightweight signature visuals** inside the `SystemViz` frame for the home chapter teasers (01–04). The full immersive per-chapter scenes ship with each chapter (1B onward), not here.
- Implementation: isolated `'use client'` R3F leaf components (`@react-three/fiber` + `drei`, already deps), lazy-loaded, off the critical render path.
- **Quality tiers:** capability/device detection sets a tier (high / low / off) controlling point count, DPR cap, and postprocessing.
- **Fallbacks:** no WebGL or `prefers-reduced-motion` → static gradient poster; layout and copy identical. Hero headline is real DOM (LCP-safe), never inside the canvas.

---

## 5. Home information architecture

One scroll, eight movements, each a distinct layout family:

| # | Section | Layout family | Notes |
|---|---|---|---|
| 00 | Entrance / Identity | full-bleed 3D hero | hero assemble replaces intro gate |
| – | What I am | full-width statement band | one dense line + discipline tags; no eyebrow |
| 01 | KOTA (flagship teaser) | featured split (copy L / viz R) | links to KOTA chapter (1B) |
| 02 | ARCHON teaser | flipped split (viz L / copy R) | links to ARCHON stub (P2) |
| 03 | Market Systems teaser | full-width data band | neither left nor right |
| 04 | Experiments & Visual | image strip | links to /gallery (Studies); subordinate |
| – | Operating Philosophy | centered manifesto | serif-italic; a quiet breath |
| – | Contact | centered, open-ended | one contact intent |

Eyebrow budget: 8 sections → max 2 eyebrows. Used by: hero, and the chapter-index header ("Selected work"). No other section gets an eyebrow.

Dead-link policy for 1A: KOTA → `/projects/kota` (exists, rebuilt in 1B). Experiments → `/gallery`. ARCHON → `/systems/archon` and Market → `/markets` get **lightweight stub pages** in 1A (titled, on-system, "in development") so no link is dead; fleshed out in Phase 2.

---

## 6. Hero / entrance detail

- **Scene concept:** a drifting point field (evolution of the existing simplex-noise terrain) that subtly resolves toward an ordered lattice — raw signal becoming structure, the thesis of the whole site. Sand-colored field (atmosphere) with one muted-red active point moving through it. Field forms while the headline rises over ~1.2s on load; fades as the user scrolls into content. Instant/static under reduced-motion.
- **Hero copy (4 elements only):**
  - Eyebrow (mono, sand): `Independent systems builder · Los Angeles`
  - Headline (display; serif-italic sand on the second clause): `I build intelligent systems` + `for the real world.`
  - Subtext (≤20 words): `Real-time AI, agent infrastructure, and operational products. Built to run past the prototype.`
  - CTAs: `View systems →` (primary red → chapter index) · `Contact` (ghost → #contact)

---

## 7. Section copy (draft — refinable)

All copy follows the rules in §10. Em-dashes are banned; middle-dots rationed to one per line.

**What I am (band):**
> Not one label. Across AI systems, real-time voice, product engineering, markets, and visual design, the through-line is the same: building structure for complex systems.
Discipline tags: AI systems · real-time voice · product engineering · agent orchestration · markets · visual practice (rendered as individual chips, not a dot-joined string).

**Chapter index header:** eyebrow `Selected work` + headline `The systems I am building.`

**01 KOTA:** "A voice-first AI system that answers restaurant phone calls and turns them into structured, kitchen-ready orders." Tags: real-time voice, LLM orchestration, production. Link: `Enter chapter →`.

**02 ARCHON:** "A personal AI orchestration layer. Agents, tools, memory, and model routing coordinated into one inspectable system." Tags: agents, orchestration, active R&D.

**03 Market Systems:** "Decision architecture under uncertainty. Treating markets as a real-time system of risk, latency, and feedback." Tags: research, risk, execution.

**04 Experiments & Visual:** "Interactive web, 3D, and photography. Visual research that feeds how I design systems and interfaces." Link: `View studies →`.

**Operating Philosophy (centered, serif-italic principle names):**
- *Structure over willpower.* Reliable outcomes come from architecture and feedback loops, not motivation.
- *Autonomy.* Building toward control over what I work on and how.
- *Systems before labels.* The work is studying complex systems and building tools to operate inside them.

**Contact:**
> Headline: "Building something difficult? Let's examine the system."
> Subtext: "For founders, technical leaders, and collaborators. Tell me the problem and the constraint."
> Primary: `dev@kumma.me`. Secondary: GitHub, LinkedIn, X. One contact intent only.

---

## 8. Navigation & footer

- **Nav:** single line, ≤72px. Logo `Kumma` (serif italic) + links with explicit targets: `Work` → home chapter index anchor `#work` · `ARCHON` → `/systems/archon` · `Markets` → `/markets` · `Studies` → `/gallery` · `Contact` → `#contact` (Contact in `--signal`). KOTA is the lead item inside the Work index, not a separate nav entry. Transparent over hero, gains blurred surface on scroll. Focus-visible rings retained. Mobile: hamburger → full overlay (keep current behavior).
- **Footer:** brand + tagline "AI systems made operational." · Navigate column · Connect column (email + socials) · bottom line `© {year} Kumma` and `AI systems / product engineering / visual practice`. No version stamps, no locale/weather strips.

---

## 9. Component & file architecture

Follow existing conventions: CSS Modules + global tokens; React 18 / Next 14 App Router; client leaves marked `'use client'`.

```
app/globals.css                 # tokens (rewritten to Atlas), base
app/page.tsx                    # Home (server) composing sections
components/home/
  HeroSection.tsx + .module.css         # rebuilt; hosts <HeroScene/>
  PositioningBand.tsx + .module.css     # "what I am"
  ChapterIndex.tsx + .module.css        # 4 chapter rows (varied families)
  PhilosophySection.tsx + .module.css   # centered manifesto
  ContactSection.tsx + .module.css      # reworked (existing, simplified)
components/three/
  HeroScene.tsx                         # R3F leaf, lazy, tiered
  useQualityTier.ts                     # capability detection
components/system/
  SystemViz.tsx                         # signature-viz frame primitive
  Button.tsx, Annotation.tsx, LiveSignal.tsx, SectionHeader.tsx
components/Navigation.tsx + styles      # updated labels/colors
components/Footer.tsx + styles          # updated
app/systems/archon/page.tsx             # stub (P2)
app/markets/page.tsx                    # stub (P2)
```

**Removed in 1A:** `HeroSection` fake `systemPreview`; `Projects` fake visuals (`KotaVisual`/`ArchonVisual`/`DecisionVisual`); orphans `components/home/AboutSection.*`, `TextTunnelTransition.*`, `CuboidsSection.tsx`; unused imports in `app/stories/page.tsx`; em-dash in `styles/projectDetail.module.css` comment. `/projects` for 1A **redirects to the home chapter index** (`/#work`) to remove the current duplication; a dedicated projects index is Phase 2.

---

## 10. Copy & content rules
- **Zero em-dashes (`—`) or en-dash separators (`–`)** anywhere visible. Use periods, commas, colons, or line breaks.
- **Middle-dot (`·`) max one per line**; prefer chips/columns for lists of 3+.
- No invented metrics, no fake-precise numbers, no version labels in hero, no scroll cues, no decorative status dots (the `Live` signal is reserved for genuine live state).
- No filler verbs (elevate, seamless, leverage, revolutionize).

---

## 11. Performance & accessibility constraints
- Static export compatible (no runtime API routes on the export path).
- LCP < 2.5s (hero text is DOM; 3D lazy). CLS < 0.1 (reserve space). INP < 200ms.
- WCAG AA contrast for all text, CTAs, form fields; focus-visible everywhere; semantic landmarks; keyboard nav.
- `prefers-reduced-motion` and no-WebGL paths verified before done.
- Per-section mobile collapse declared (single column, `--page-gutter`).

---

## 12. Success criteria (Phase 1A done when)
1. Home renders the eight sections with eight distinct layout families; no fake div-dashboards remain.
2. Atlas tokens + the two accent roles applied consistently; one theme, one radius system.
3. Hero scene runs with quality tiers and a verified static fallback; no blocking intro.
4. `npm run build` is green; static export works; `npx tsc --noEmit` and `npm run lint` clean.
5. Reduced-motion and WebGL-off both produce a complete, legible page.
6. No dead links; orphaned components and unused imports removed.
7. Pre-flight: zero em-dashes; eyebrow count ≤ 2; nav single line; all CTAs single-intent and contrast-checked.

---

## 13. Risks
- **3D scope creep** — keep the hero scene minimal and tiered; it is atmosphere, not the product.
- **Static export + R3F** — verify lazy client-only loading doesn't break `next build` export.
- **Two-accent discipline** — easy to leak sand into interactive elements; enforce in review.
- **Copy voice drift** — the editorial/operator balance must stay; no marketing filler.

---

## 14. Phasing recap
- **Phase 1A (this spec):** design system + home shell + chrome + cleanup.
- **Phase 1B:** KOTA deep case study (signature audio→order 3D viz, full narrative).
- **Phase 2:** ARCHON + Market Systems full chapters.
- **Phase 3:** Experiments/visual practice, Operating Philosophy page, Contact/CTA polish, blog integration, performance/mobile/reduced-motion QA sweep.
