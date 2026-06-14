# Design Spec — Phase 1B/2: Chapters, System Visualizations, Exposure

**Date:** 2026-06-14
**Status:** Draft for review
**Builds on:** `2026-06-13-portfolio-design-system-and-home-shell-design.md` (Atlas system, home shell). Branch continues the redesign line.

## 1. Goals

Turn the chapter pages into real, credible case studies with bespoke "make the invisible system visible" visualizations, and make the whole site discoverable so it builds Kumma's exposure (who he is, what he built, what he cares about). The blog is the recurring story channel; the case studies are evergreen proof; the exposure layer makes both findable and shareable.

## 2. Scope

In scope (one sequenced plan):
1. **Chapter system** — unify chapters under `/projects/[slug]`, rebuild `ProjectDetail` on the Atlas system, delete the `/systems/archon` + `/markets` stubs, fix chapter-index/nav links.
2. **KOTA chapter** + the **call→order** visualization (detail page + home teaser variant).
3. **Exposure foundation** — metadata, sitemap, robots, JSON-LD, RSS, hreflang, build-time OG cards, Umami analytics, Search Console.
4. **ARCHON chapter** — content enrichment + the **coordinator/agents** visualization.
5. **Market Systems chapter** — retitle the Robinhood entry, decision-architecture framing, + a lighter **regime-field** visual.

Out of scope (later): per-chapter deeper interactivity, blog visual redesign, a dedicated `/projects` index page (currently redirects to `/#work`), real photography for Experiments.

## 3. Decisions locked (brainstorming)

| Decision | Choice |
|---|---|
| Chapter routing/template | Unify under `/projects/[slug]`; reuse + restyle `ProjectDetail` |
| Visualization rendering | Animated 2D (SVG + motion), autoplay loop, scroll-triggered, reduced-motion static |
| Viz reuse | One component per chapter, size variants (teaser/detail) |
| OG images | Build-time generated cards (satori) per page + per essay |
| Analytics | Umami (free cloud), env-guarded snippet |
| Build order | Chapters+KOTA → exposure → ARCHON → Market |

## 4. Chapter system

- **Routing:** KOTA `/projects/kota`, ARCHON `/projects/archon`, Market `/projects/market-systems`. Update `components/home/chapters.ts` hrefs accordingly. Delete `app/systems/archon/page.tsx` and `app/markets/page.tsx`; update nav (`components/Navigation.tsx`) and footer links from `/systems/archon` + `/markets` to the `/projects/*` slugs (label ARCHON → `/projects/archon`, Markets → `/projects/market-systems`).
- **`ProjectDetail` rebuilt on Atlas** (`components/ProjectDetail.tsx` + `styles/projectDetail.module.css`): tokens swapped to Atlas (`--paper/--steel/--signal/--sand`), fonts via the global CSS variables (not re-imported), section flow:
  1. Hero: eyebrow (chapter no + kind), title, italic subtitle (sand), tagline, optional live/links.
  2. **System visualization** (the new per-chapter component, large variant) directly under the hero.
  3. Overview.
  4. Context / Decision / Outcome arc — relabel away from generic "Narrative Arc" (use the section's own meaning; e.g. "How it works" or no eyebrow). Keep 3 stages + impact.
  5. Technical breakdown — group the stack into 2–3 clusters rather than 5 identical cards (Section 4.9 of the taste system).
  6. Philosophy quote (serif italic).
- Copy rules: zero em-dashes, middle-dot rationed, signal = interactive only.

## 5. Visualizations

Shared approach: SVG-based, animated with motion values / GSAP (no `window` scroll listeners), `prefers-reduced-motion` renders the resolved end-state with no loop. Palette: sand for structure/atmosphere, **signal-red only for the single active/live element**. A small shared primitives module (`components/viz/`) provides reusable parts (node, signal path, waveform, ticket). Each chapter viz accepts a `size: "teaser" | "detail"` prop.

- **`KotaViz` (call→order):** incoming-call marker → animated waveform → streaming transcript tokens → intent/menu-match node (the active node pulses signal-red) → an order ticket assembling ("Orange chicken ×2", "Chow mein ×1"). Loops. Teaser = compact horizontal; detail = full sequence with labels.
- **`ArchonViz` (coordinator/agents):** a central Coordinator with satellite nodes (Tools, Memory, Context, Router, Evaluator/Recover). A signal travels Coordinator → agent → back along one path lit signal-red while others stay sand; faint persistent "trace" lines. Loops.
- **`MarketViz` (regime field, lighter):** a horizontal field of bars/points that shifts between calm/volatile "regimes"; one marker tracks the current regime in signal-red. Built in the Market sub-step.
- **Home teasers:** the chapter-index placeholders (`vizField` / `SystemViz` body) are replaced by the `teaser` variant of each chapter's viz as that chapter lands.

## 6. Content updates

- **ARCHON** (`data/projectData.ts`): enrich `overview`, `narrative`, `techStack`, `philosophical`, `subtitle`, `tagline` to reflect the real system: personal AI orchestration; model routing (LiteLLM) across local (Ollama/GGUF) + cloud (OpenAI/Claude/Gemini); persistent memory + personal context; tool execution + Google integrations; inspectable, human-supervised execution; cost/token efficiency. Present as active R&D, not an exaggerated finished product. No invented metrics.
- **Market Systems** (`data/projectData.ts`): retitle id 3 to `title: "Market Systems"`, `slug: "market-systems"`, subtitle "Decision architecture under uncertainty", keeping the Robinhood performance dashboard as the concrete artifact described inside. Framing: markets as a real-time system of risk, latency, feedback; process over outcome; no profitability claims.

## 7. Exposure foundation

- **Per-page metadata:** `generateMetadata` in `app/projects/[slug]/page.tsx` (title/description/openGraph/twitter from `projectData`) and in `app/blog/[locale]/[slug]/page.tsx` (from `getPostData`). Home/chapters get explicit metadata. All reference their OG image.
- **`app/sitemap.ts`:** enumerate static routes + `projectData` slugs + all blog posts (`getAllPostIdsForAllLocales`). **`app/robots.ts`:** allow all, point to sitemap.
- **JSON-LD:** small server components emitting `<script type="application/ld+json">` — `Person` (home), `Article` (blog post), `SoftwareApplication` (KOTA).
- **RSS:** `app/feed.xml/route.ts` with `export const dynamic = "force-static"` building the feed from `getSortedPostsData` (EN; include ZH items with language tags). If static export rejects the route handler, fall back to a build script writing `public/feed.xml` (decide in plan).
- **hreflang:** blog post metadata sets `alternates.languages` for `en`/`zh` (+ `x-default`).
- **OG cards (build-time):** `scripts/generate-og.mjs` using `satori` + `@resvg/resvg-js`, run via an npm `prebuild` script. Renders an Atlas-branded card (canvas bg, sand/paper type, title) for: home, each project slug, each blog post, and a default. Outputs `public/og/<key>.png`. Metadata references these. New dev deps: `satori`, `@resvg/resvg-js`.
- **Analytics:** Umami `<script>` in `app/layout.tsx`, guarded by `NEXT_PUBLIC_UMAMI_ID` env (renders nothing if unset). Privacy-light, no cookie banner needed.
- **Search Console:** add verification (meta tag via metadata `verification.google` or a static file in `public/`); user submits the sitemap. Manual step documented.

## 8. Component & file architecture

```
data/projectData.ts                         # MODIFY — ARCHON enrich, Market retitle/slug
components/ProjectDetail.tsx + styles       # REBUILD on Atlas; hosts <chapter viz/>
components/viz/
  primitives.tsx (+ .module.css)            # node, signalPath, waveform, ticket
  KotaViz.tsx, ArchonViz.tsx, MarketViz.tsx # size: teaser | detail
components/home/ChapterIndex.tsx            # MODIFY — render teaser viz; hrefs to /projects/*
components/home/chapters.ts                 # MODIFY — hrefs, market slug
components/Navigation.tsx, components/Footer.tsx  # MODIFY — chapter links
app/projects/[slug]/page.tsx               # MODIFY — generateMetadata + JSON-LD
app/blog/[locale]/[slug]/page.tsx          # MODIFY — generateMetadata + hreflang + Article JSON-LD
app/sitemap.ts, app/robots.ts              # CREATE
app/feed.xml/route.ts                      # CREATE (force-static)
components/seo/JsonLd.tsx                   # CREATE — Person/Article/SoftwareApplication helpers
components/Analytics.tsx                    # CREATE — Umami snippet (env-guarded)
scripts/generate-og.mjs                     # CREATE — build-time OG cards
package.json                               # MODIFY — prebuild script + satori/@resvg deps
app/systems/archon/page.tsx, app/markets/page.tsx  # DELETE (stubs)
```

## 9. Static-export & performance constraints
- No edge/runtime OG (`next/og`) — OG is build-time PNGs (§7).
- Route handlers must be `force-static`.
- Visualizations: `transform`/`opacity` only, isolated client leaves, lazy where heavy, reduced-motion static.
- Keep LCP fast: viz mounts client-side; chapter hero text is DOM.
- `npm run build` static export must stay green; OG `prebuild` must run in CI (deploy.yml runs `npm install` + `npm run build`).

## 10. Success criteria
1. KOTA, ARCHON, Market all reachable at `/projects/[slug]` with real content; no empty stub pages; nav/index links consistent; no dead links.
2. Each chapter shows its animated 2D visualization (detail) and a teaser variant on the home; reduced-motion shows a clean static state.
3. ARCHON content reflects the real system; Market retitled; no invented metrics, zero em-dashes.
4. Every page + every essay has a unique title/description and a generated OG card; sitemap, robots, RSS, hreflang, JSON-LD present; Umami snippet env-guarded.
5. `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean; OG prebuild runs in the build.
6. ProjectDetail restyled to Atlas (no legacy generic labels, signal/sand rules upheld).

## 11. Risks
- **satori/OG build step** — font loading + CI reliability; keep the card template simple, vendor one font file. Fallback: static default card.
- **RSS route under static export** — verify `force-static`; fall back to build-script if needed.
- **Viz scope creep** — keep them diagrammatic and looping, not interactive toys; one component each.
- **Slug change for Market** (`robinhood-performance` → `market-systems`) — safe now (site not pushed/live); add no redirect needed pre-launch.

## 12. Sequencing (single plan)
1. Chapter system rebuild (routing, ProjectDetail on Atlas, delete stubs, fix links) + KOTA content already present.
2. Viz primitives + `KotaViz` (teaser + detail), wire into ChapterIndex teaser + ProjectDetail.
3. Exposure foundation (metadata, sitemap, robots, JSON-LD, RSS, hreflang, OG script, Umami).
4. ARCHON content enrich + `ArchonViz`.
5. Market retitle + `MarketViz`.
6. QA: build, reduced-motion, OG output, metadata spot-check, pre-flight (em-dash/eyebrow/contrast).
