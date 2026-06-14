# Chapters, System Visualizations & Exposure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the chapter pages real (unified `/projects/[slug]` + Atlas-restyled `ProjectDetail` + animated 2D system visualizations) and make the site discoverable (metadata, sitemap, robots, JSON-LD, RSS, hreflang, build-time OG cards, analytics).

**Architecture:** One data-driven case-study template, one viz component per chapter (SVG + Framer Motion, autoplay loop, reduced-motion static, teaser/detail size variants), and a static-export-safe exposure layer (build-time OG via satori; route handlers `force-static`).

**Tech Stack:** Next 14 App Router (static export), CSS Modules + Atlas tokens, `framer-motion` (already dep), `satori` + `@resvg/resvg-js` (new dev deps), `next/font`.

**Spec:** `docs/superpowers/specs/2026-06-14-portfolio-chapters-visuals-exposure-design.md`
**Branch:** continue on `redesign/phase-1a-design-system-home`.

**Testing approach:** No test runner exists; verify each task with `npx tsc --noEmit`, `npm run lint`, and where structural `npm run build`. **Do not run `npm run build` while `next dev` is running** (it clobbers the shared `.next`); stop dev first. Manual checks (reduced-motion, OG output, metadata) are listed explicitly.

**Global rules:** zero em-dashes (`—`); middle-dot `·` max one per line; `--signal` (red) = interactive/active only; `--sand` = atmosphere only; reduced-motion collapses all motion.

---

## File structure

```
components/home/chapters.ts                 # MODIFY hrefs + market slug
components/Navigation.tsx                    # MODIFY chapter links
components/Footer.tsx                         # MODIFY chapter links
app/systems/archon/page.tsx                  # DELETE
app/markets/page.tsx                          # DELETE
data/projectData.ts                          # MODIFY ARCHON enrich, Market retitle/slug
components/ProjectDetail.tsx                  # REBUILD on Atlas, host viz
styles/projectDetail.module.css              # REBUILD on Atlas
components/viz/types.ts                       # CREATE VizProps
components/viz/primitives.module.css          # CREATE shared viz css
components/viz/KotaViz.tsx                     # CREATE
components/viz/ArchonViz.tsx                   # CREATE
components/viz/MarketViz.tsx                   # CREATE
components/viz/registry.ts                     # CREATE slug -> viz map
components/home/ChapterIndex.tsx              # MODIFY render teaser viz
components/seo/JsonLd.tsx                      # CREATE Person/Article/SoftwareApplication
components/Analytics.tsx                       # CREATE Umami (env-guarded)
app/sitemap.ts                                # CREATE
app/robots.ts                                 # CREATE
app/feed.xml/route.ts                         # CREATE (force-static)
app/projects/[slug]/page.tsx                  # MODIFY generateMetadata + JSON-LD
app/blog/[locale]/[slug]/page.tsx             # MODIFY generateMetadata + hreflang + Article JSON-LD
app/page.tsx / app/layout.tsx                 # MODIFY Person JSON-LD + Analytics
scripts/generate-og.mjs                        # CREATE build-time OG
package.json                                   # MODIFY prebuild + deps
```

---

## Task 1: Unify chapter routing, remove stubs

**Files:** Modify `components/home/chapters.ts`, `components/Navigation.tsx`, `components/Footer.tsx`; delete `app/systems/archon/page.tsx`, `app/markets/page.tsx`.

- [ ] **Step 1: Point chapters at `/projects/*`** — in `components/home/chapters.ts`, set hrefs: ARCHON `href: "/projects/archon"`, Market Systems `href: "/projects/market-systems"` (KOTA already `/projects/kota`). Leave KOTA and Experiments unchanged.

- [ ] **Step 2: Nav links** — in `components/Navigation.tsx`, change `{ name: "ARCHON", href: "/systems/archon" }` → `href: "/projects/archon"` and `{ name: "Markets", href: "/markets" }` → `{ name: "Markets", href: "/projects/market-systems" }`.

- [ ] **Step 3: Footer links** — in `components/Footer.tsx`, change the ARCHON and Markets `quickLinks` hrefs the same way (`/projects/archon`, `/projects/market-systems`).

- [ ] **Step 4: Delete stubs**
```bash
git rm app/systems/archon/page.tsx app/markets/page.tsx
rmdir app/systems/archon app/systems app/markets 2>/dev/null || true
```

- [ ] **Step 5: Verify** — `grep -rn "systems/archon\|/markets\"" app components` returns nothing. `npx tsc --noEmit && npm run lint` clean.

- [ ] **Step 6: Commit**
```bash
git add -A
git commit -m "refactor(chapters): route all chapters under /projects/[slug], remove stubs"
```

---

## Task 2: projectData — enrich ARCHON, retitle Market

**Files:** Modify `data/projectData.ts`

- [ ] **Step 1: Replace the ARCHON object** (id 2) with enriched content:
```ts
  {
    id: 2,
    title: "ARCHON",
    slug: "archon",
    description:
      "A personal AI orchestration layer that coordinates models, tools, memory, and context into one inspectable system.",
    subtitle: "A personal operating intelligence.",
    tagline:
      "Most AI products fail not on the model, but on orchestration.",
    details:
      "Archon is an evolving personal orchestration layer: it routes between local and cloud models, executes tools, keeps persistent memory and context, and stays inspectable under human supervision.",
    overview: {
      headline: "What Archon is",
      content:
        "Archon is active research into a persistent intelligence layer that connects projects, data, tasks, and decisions. It coordinates model routing, tool execution, memory, and personal context rather than wrapping a single chat call.",
    },
    narrative: {
      context:
        "Single-prompt chains break under real work. Reliability comes from orchestration, memory, and the ability to inspect what the system did, not from a bigger model.",
      decision:
        "Build a coordination layer: route between local models (Ollama, GGUF) and cloud models (OpenAI, Claude, Gemini) via LiteLLM, execute tools, persist memory and context, and keep every run traceable.",
      outcome:
        "Workflows became composable and debuggable. Tasks flow through defined steps with reasoning traces, cost and token awareness, and human checkpoints.",
      impact:
        "A foundation for autonomous but inspectable personal systems, where the orchestration absorbs complexity instead of leaking it into every app.",
    },
    techStack: [
      { name: "Model routing", description: "LiteLLM across local (Ollama, GGUF) and cloud (OpenAI, Claude, Gemini)", icon: "brain" },
      { name: "Memory & context", description: "Persistent state and personal context across runs, with context compression", icon: "brain" },
      { name: "Tool execution", description: "Structured tool calls and Google service integrations", icon: "receipt" },
      { name: "Inspectable execution", description: "Reasoning traces, cost/token accounting, human checkpoints", icon: "cloud" },
      { name: "Local + cloud", description: "Runs open models locally and falls up to cloud when needed", icon: "globe" },
    ],
    philosophical: "Intelligence is not the model. It is the system around it.",
    featured: true,
  },
```

- [ ] **Step 2: Retitle the Market entry** (id 3) — change `title` to `"Market Systems"`, `slug` to `"market-systems"`, `subtitle` to `"Decision architecture under uncertainty."`, and `tagline` to `"Insight is not enough. A system is only real when it stays executable under pressure."`. Keep the existing description/overview/narrative/techStack (the Robinhood dashboard is the concrete artifact); adjust `description` to: `"A decision-quality system that treats markets as a real-time system of risk, latency, and feedback."`

- [ ] **Step 3: Verify** — `npx tsc --noEmit` clean. `grep -n "market-systems" data/projectData.ts` shows the slug.

- [ ] **Step 4: Commit**
```bash
git add data/projectData.ts
git commit -m "content(projects): enrich ARCHON, retitle Robinhood entry to Market Systems"
```

---

## Task 3: Viz contract + shared primitives css

**Files:** Create `components/viz/types.ts`, `components/viz/primitives.module.css`

- [ ] **Step 1: Types** — `components/viz/types.ts`:
```ts
export type VizSize = "teaser" | "detail";
export interface VizProps {
  size?: VizSize;
}
```

- [ ] **Step 2: Shared css** — `components/viz/primitives.module.css`:
```css
.frame { position: relative; width: 100%; height: 100%; min-height: 220px;
  display: flex; align-items: center; justify-content: center; overflow: hidden; }
.detail { min-height: 360px; }
.svg { width: 100%; height: 100%; display: block; }
.node { fill: var(--surface); stroke: var(--sand); stroke-width: 1; }
.nodeActive { fill: var(--signal); stroke: var(--signal); }
.path { stroke: var(--line-strong); stroke-width: 1; fill: none; }
.pathActive { stroke: var(--signal); stroke-width: 1.5; fill: none; }
.label { fill: var(--steel); font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; }
.value { fill: var(--paper); font-family: var(--font-sans); font-size: 12px; }
.wave { stroke: var(--sand); stroke-width: 1.5; fill: none; }
```

- [ ] **Step 3: Verify** — `npx tsc --noEmit` clean.
- [ ] **Step 4: Commit** `git add components/viz/types.ts components/viz/primitives.module.css && git commit -m "feat(viz): shared viz types + primitive styles"`

---

## Task 4: KotaViz (call -> order)

**Files:** Create `components/viz/KotaViz.tsx`

- [ ] **Step 1: Implement** — SVG with an animated waveform, streaming token dots, an intent node that pulses signal-red, and an order ticket fading in. Framer Motion `animate` loops; `useReducedMotion` renders the static resolved state.
```tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { VizProps } from "./types";
import styles from "./primitives.module.css";

export default function KotaViz({ size = "detail" }: VizProps) {
  const reduce = useReducedMotion();
  const loop = reduce ? {} : { repeat: Infinity, repeatType: "loop" as const, duration: 4, ease: "easeInOut" };

  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg className={styles.svg} viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet" role="img"
        aria-label="KOTA turns a restaurant phone call into a structured order">
        {/* incoming call */}
        <circle cx="22" cy="70" r="6" className={styles.nodeActive}>
          {!reduce && <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />}
        </circle>
        <text x="22" y="92" textAnchor="middle" className={styles.label}>call</text>

        {/* waveform */}
        <motion.path className={styles.wave}
          d="M44 70 q6 -16 12 0 t12 0 t12 0 t12 0"
          initial={false}
          animate={reduce ? {} : { d: [
            "M44 70 q6 -16 12 0 t12 0 t12 0 t12 0",
            "M44 70 q6 16 12 0 t12 0 t12 0 t12 0",
            "M44 70 q6 -16 12 0 t12 0 t12 0 t12 0",
          ] }}
          transition={loop} />
        <text x="68" y="92" textAnchor="middle" className={styles.label}>audio</text>

        {/* streaming tokens */}
        {[0, 1, 2].map((i) => (
          <motion.circle key={i} cx={104 + i * 10} cy="70" r="2.5" fill="var(--sand)"
            initial={false}
            animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 0] }}
            transition={reduce ? {} : { repeat: Infinity, duration: 4, delay: i * 0.25, times: [0, 0.3, 0.6] }} />
        ))}
        <text x="114" y="92" textAnchor="middle" className={styles.label}>tokens</text>

        {/* intent node (active) */}
        <motion.circle cx="168" cy="70" r="9" className={styles.nodeActive}
          initial={false}
          animate={reduce ? { scale: 1 } : { scale: [1, 1.18, 1] }}
          transition={reduce ? {} : { repeat: Infinity, duration: 4, times: [0.5, 0.62, 0.74] }}
          style={{ transformOrigin: "168px 70px" }} />
        <text x="168" y="92" textAnchor="middle" className={styles.label}>intent</text>

        {/* connector */}
        <path d="M180 70 H214" className={styles.pathActive} />

        {/* order ticket */}
        <motion.g initial={false} animate={reduce ? { opacity: 1 } : { opacity: [0, 0, 1, 1] }}
          transition={reduce ? {} : { repeat: Infinity, duration: 4, times: [0, 0.7, 0.85, 1] }}>
          <rect x="216" y="44" width="92" height="52" rx="6" fill="var(--surface)" stroke="var(--line-strong)" />
          <text x="224" y="60" className={styles.label}>order</text>
          <text x="224" y="76" className={styles.value}>Orange chicken</text>
          <text x="300" y="76" textAnchor="end" className={styles.value} fill="var(--signal)">x2</text>
          <text x="224" y="90" className={styles.value}>Chow mein</text>
          <text x="300" y="90" textAnchor="end" className={styles.value} fill="var(--signal)">x1</text>
        </motion.g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit` clean. (Visual check after wiring in Task 6/7.)
- [ ] **Step 3: Commit** `git add components/viz/KotaViz.tsx && git commit -m "feat(viz): KOTA call-to-order visualization"`

---

## Task 5: ArchonViz + MarketViz + registry

**Files:** Create `components/viz/ArchonViz.tsx`, `components/viz/MarketViz.tsx`, `components/viz/registry.ts`

- [ ] **Step 1: ArchonViz** — central coordinator with satellite nodes; one path lights signal-red in rotation.
```tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { VizProps } from "./types";
import styles from "./primitives.module.css";

const NODES = [
  { x: 60, y: 30, label: "tools" },
  { x: 260, y: 30, label: "memory" },
  { x: 40, y: 80, label: "context" },
  { x: 280, y: 80, label: "router" },
  { x: 160, y: 122, label: "recover" },
];
const CX = 160, CY = 70;

export default function ArchonViz({ size = "detail" }: VizProps) {
  const reduce = useReducedMotion();
  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg className={styles.svg} viewBox="0 0 320 150" preserveAspectRatio="xMidYMid meet" role="img"
        aria-label="Archon coordinates tools, memory, context, routing, and recovery">
        {NODES.map((n, i) => (
          <g key={n.label}>
            <motion.path d={`M${CX} ${CY} L${n.x} ${n.y}`} className={styles.path}
              initial={false}
              animate={reduce ? {} : { stroke: ["var(--line-strong)", "var(--signal)", "var(--line-strong)"] }}
              transition={reduce ? {} : { repeat: Infinity, duration: NODES.length * 1.1, times: [i / NODES.length, (i + 0.4) / NODES.length, (i + 0.8) / NODES.length] }} />
            <circle cx={n.x} cy={n.y} r="6" className={styles.node} />
            <text x={n.x} y={n.y - 10} textAnchor="middle" className={styles.label}>{n.label}</text>
          </g>
        ))}
        <circle cx={CX} cy={CY} r="14" className={styles.node} stroke="var(--sand)" />
        <text x={CX} y={CY + 3} textAnchor="middle" className={styles.label} fill="var(--paper)">core</text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: MarketViz** — a regime field: bars whose heights shift between calm/volatile, one marker in signal-red.
```tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { VizProps } from "./types";
import styles from "./primitives.module.css";

export default function MarketViz({ size = "detail" }: VizProps) {
  const reduce = useReducedMotion();
  const bars = Array.from({ length: 24 });
  return (
    <div className={`${styles.frame} ${size === "detail" ? styles.detail : ""}`}>
      <svg className={styles.svg} viewBox="0 0 320 140" preserveAspectRatio="none" role="img"
        aria-label="Market regime field shifting between calm and volatile states">
        {bars.map((_, i) => (
          <motion.rect key={i} x={6 + i * 13} width="6" rx="2" fill="var(--sand)"
            initial={false}
            animate={reduce ? { height: 30, y: 70 } : { height: [20, 60, 30], y: [80, 40, 70] }}
            transition={reduce ? {} : { repeat: Infinity, duration: 5, delay: i * 0.08, ease: "easeInOut" }} />
        ))}
        <motion.line x1="0" x2="320" stroke="var(--signal)" strokeWidth="1.5"
          initial={false} animate={reduce ? { y1: 70, y2: 70 } : { y1: [80, 40, 70], y2: [80, 40, 70] }}
          transition={reduce ? {} : { repeat: Infinity, duration: 5, ease: "easeInOut" }} />
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: Registry** — `components/viz/registry.ts`:
```ts
import type { ComponentType } from "react";
import type { VizProps } from "./types";
import KotaViz from "./KotaViz";
import ArchonViz from "./ArchonViz";
import MarketViz from "./MarketViz";

export const vizBySlug: Record<string, ComponentType<VizProps>> = {
  kota: KotaViz,
  archon: ArchonViz,
  "market-systems": MarketViz,
};
```

- [ ] **Step 4: Verify** — `npx tsc --noEmit` clean.
- [ ] **Step 5: Commit** `git add components/viz && git commit -m "feat(viz): Archon + Market visualizations and slug registry"`

---

## Task 6: Rebuild ProjectDetail on Atlas + host viz

**Files:** Rebuild `components/ProjectDetail.tsx`, `styles/projectDetail.module.css`

- [ ] **Step 1: Component** — keep gsap scroll reveals, swap to Atlas classes (fonts via CSS vars, not re-imported), insert the viz under the hero, group tech into a simple list (no 5 identical cards), drop generic "Case Study"/"Narrative Arc" eyebrows.
```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/data/projectData";
import { vizBySlug } from "@/components/viz/registry";
import styles from "@/styles/projectDetail.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectDetail({ project }: { project: Project }) {
  const root = useRef<HTMLDivElement>(null);
  const Viz = vizBySlug[project.slug];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 28 }, {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%", toggleActions: "play none none none" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className={styles.container}>
      <header className={styles.hero} data-reveal>
        <p className={styles.eyebrow}>{project.subtitle ?? "Selected work"}</p>
        <h1 className={styles.title}>{project.title}</h1>
        {project.tagline && <p className={styles.tagline}>{project.tagline}</p>}
      </header>

      {Viz && (
        <section className={styles.vizSection} data-reveal aria-hidden="true">
          <Viz size="detail" />
        </section>
      )}

      {project.overview && (
        <section className={styles.block} data-reveal>
          <h2 className={styles.h2}>{project.overview.headline}</h2>
          <p className={styles.body}>{project.overview.content}</p>
        </section>
      )}

      {project.narrative && (
        <section className={styles.block} data-reveal>
          <div className={styles.arc}>
            <div><span className={styles.arcNo}>01</span><h3 className={styles.arcLabel}>Context</h3><p className={styles.body}>{project.narrative.context}</p></div>
            <div><span className={styles.arcNo}>02</span><h3 className={styles.arcLabel}>Decision</h3><p className={styles.body}>{project.narrative.decision}</p></div>
            <div><span className={styles.arcNo}>03</span><h3 className={styles.arcLabel}>Outcome</h3><p className={styles.body}>{project.narrative.outcome}</p></div>
          </div>
          {project.narrative.impact && <p className={styles.impact}>{project.narrative.impact}</p>}
        </section>
      )}

      {project.techStack && project.techStack.length > 0 && (
        <section className={styles.block} data-reveal>
          <h2 className={styles.h2}>How it is built</h2>
          <ul className={styles.stack}>
            {project.techStack.map((t) => (
              <li key={t.name}><strong>{t.name}</strong><span>{t.description}</span></li>
            ))}
          </ul>
        </section>
      )}

      {project.philosophical && (
        <section className={styles.quoteWrap} data-reveal>
          <blockquote className={styles.quote}>{project.philosophical}</blockquote>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Styles** — replace `styles/projectDetail.module.css` with Atlas tokens. Key rules:
```css
.container { width: min(100%, 980px); margin: 0 auto; padding: clamp(7rem, 11vw, 11rem) var(--page-gutter) clamp(5rem, 9vw, 9rem); }
.hero { display: flex; flex-direction: column; gap: 1rem; }
.eyebrow { margin: 0; font-family: var(--font-editorial); font-style: italic; color: var(--sand); font-size: clamp(1.2rem, 2.4vw, 1.7rem); }
.title { margin: 0; font-family: var(--font-sans); font-weight: 600; letter-spacing: -0.04em; line-height: 0.96; font-size: clamp(3rem, 8vw, 7rem); color: var(--paper); }
.tagline { margin: 0.6rem 0 0; max-width: 50ch; color: var(--steel); font-size: clamp(1.05rem, 1.6vw, 1.3rem); line-height: 1.5; }
.vizSection { margin: clamp(3rem, 6vw, 5rem) 0; border: 1px solid var(--line); border-radius: var(--radius-card); background: var(--raised); overflow: hidden; }
.block { margin: clamp(3.5rem, 7vw, 6rem) 0 0; }
.h2 { margin: 0 0 1.2rem; font-family: var(--font-sans); font-weight: 600; letter-spacing: -0.03em; font-size: clamp(1.6rem, 3vw, 2.6rem); color: var(--paper); }
.body { margin: 0; max-width: 68ch; color: var(--steel); font-size: 1.02rem; line-height: 1.75; }
.arc { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
.arcNo { font-family: var(--font-mono); font-size: 0.72rem; color: var(--signal); }
.arcLabel { margin: 0.5rem 0; font-size: 1rem; font-weight: 600; color: var(--paper); }
.impact { margin: 2rem 0 0; max-width: 60ch; color: var(--paper); font-family: var(--font-editorial); font-style: italic; font-size: 1.3rem; line-height: 1.4; }
.stack { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; }
.stack li { display: grid; grid-template-columns: minmax(160px, 0.4fr) 1fr; gap: 1.5rem; padding: 1.1rem 0; border-top: 1px solid var(--line); }
.stack strong { color: var(--paper); font-weight: 600; font-size: 0.95rem; }
.stack span { color: var(--steel); font-size: 0.9rem; line-height: 1.6; }
.quoteWrap { margin: clamp(4rem, 8vw, 7rem) 0 0; padding-top: clamp(3rem, 6vw, 5rem); border-top: 1px solid var(--line); }
.quote { margin: 0; max-width: 24ch; font-family: var(--font-editorial); font-style: italic; color: var(--sand); font-size: clamp(1.8rem, 4vw, 3rem); line-height: 1.15; }
@media (max-width: 760px) { .arc { grid-template-columns: 1fr; gap: 1.5rem; } .stack li { grid-template-columns: 1fr; gap: 0.3rem; } }
```

- [ ] **Step 3: Verify** — stop dev if running; `npx tsc --noEmit && npm run lint && npm run build`. Then `npm run dev` and load `/projects/kota`, `/projects/archon`, `/projects/market-systems`: each shows hero + its viz + content; reduced-motion shows static viz.
- [ ] **Step 4: Commit** `git add components/ProjectDetail.tsx styles/projectDetail.module.css && git commit -m "feat(chapters): rebuild ProjectDetail on Atlas and host system visualizations"`

---

## Task 7: Home teasers use the real viz

**Files:** Modify `components/home/ChapterIndex.tsx`, `components/home/ChapterIndex.module.css`

- [ ] **Step 1:** Replace the placeholder `vizField`/`SystemViz` body for the non-strip chapters with the chapter's teaser viz, keyed by slug from the href. Add to the chapter render: derive `const slug = c.href.split("/").pop()!;` and `const Viz = vizBySlug[slug];`. In the `c.layout !== "strip"` branch, render `<div className={styles.viz}>{Viz ? <Viz size="teaser" /> : null}</div>` (drop `SystemViz` placeholder, or keep `SystemViz` frame wrapping `<Viz />`). Import `vizBySlug`.

- [ ] **Step 2: Verify** — `npx tsc --noEmit`; dev: home chapter rows 01-03 show their live teaser viz.
- [ ] **Step 3: Commit** `git add components/home/ChapterIndex.* && git commit -m "feat(home): chapter teasers render real system visualizations"`

---

## Task 8: sitemap + robots

**Files:** Create `app/sitemap.ts`, `app/robots.ts`

- [ ] **Step 1: sitemap** — `app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import { projects } from "@/data/projectData";
import { getAllPostIdsForAllLocales } from "@/lib/posts";

const BASE = "https://kumma.me";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/blog", "/gallery", "/stories"].map((p) => ({
    url: `${BASE}${p}`, lastModified: new Date(),
  }));
  const projectRoutes = projects.map((p) => ({ url: `${BASE}/projects/${p.slug}`, lastModified: new Date() }));
  const postRoutes = getAllPostIdsForAllLocales().map(({ params }) => ({
    url: `${BASE}/blog/${params.locale}/${params.slug}`, lastModified: new Date(),
  }));
  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
```

- [ ] **Step 2: robots** — `app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: "https://kumma.me/sitemap.xml" };
}
```

- [ ] **Step 3: Verify** — stop dev; `npm run build`; confirm `out/sitemap.xml` and `out/robots.txt` exist: `ls out/sitemap.xml out/robots.txt`.
- [ ] **Step 4: Commit** `git add app/sitemap.ts app/robots.ts && git commit -m "feat(seo): sitemap + robots"`

---

## Task 9: JSON-LD helpers + project metadata

**Files:** Create `components/seo/JsonLd.tsx`; modify `app/projects/[slug]/page.tsx`, `app/page.tsx`

- [ ] **Step 1: JsonLd** — `components/seo/JsonLd.tsx`:
```tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
export const personLd = {
  "@context": "https://schema.org", "@type": "Person", name: "Kumma", alternateName: "Yang Wu",
  url: "https://kumma.me", jobTitle: "Independent systems builder", address: { "@type": "PostalAddress", addressLocality: "Los Angeles" },
  sameAs: ["https://github.com/Comma0101", "https://www.linkedin.com/in/yang-w-9233a3a8/", "https://x.com/Comma_9fie"],
};
```

- [ ] **Step 2: Project metadata + JSON-LD** — in `app/projects/[slug]/page.tsx`, add:
```tsx
import type { Metadata } from "next";
import { projects } from "@/data/projectData";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = projects.find((x) => x.slug === params.slug);
  if (!p) return {};
  const title = `${p.title} | Kumma`;
  const description = p.description;
  const og = `/og/projects-${p.slug}.png`;
  return {
    title: p.title, description,
    openGraph: { title, description, url: `https://kumma.me/projects/${p.slug}`, images: [og], type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}
```
And in the page component, render `<JsonLd data={...SoftwareApplication for kota, else CreativeWork...} />` alongside `<ProjectDetail />`. Use:
```tsx
const ld = params.slug === "kota"
  ? { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "KOTA", applicationCategory: "BusinessApplication", description: p.description, url: "https://kumma.me/projects/kota" }
  : { "@context": "https://schema.org", "@type": "CreativeWork", name: p.title, description: p.description, url: `https://kumma.me/projects/${p.slug}` };
```

- [ ] **Step 3: Person LD on home** — in `app/page.tsx`, render `<JsonLd data={personLd} />` above `<Home />`.

- [ ] **Step 4: Verify** — `npx tsc --noEmit && npm run build`; `grep -l "application/ld+json" out/projects/kota/index.html` matches; project pages have unique `<title>`.
- [ ] **Step 5: Commit** `git add components/seo app/projects/[slug]/page.tsx app/page.tsx && git commit -m "feat(seo): JSON-LD + per-project metadata"`

---

## Task 10: Blog metadata, hreflang, Article JSON-LD

**Files:** Modify `app/blog/[locale]/[slug]/page.tsx`

- [ ] **Step 1:** Add `generateMetadata` using `getPostData`:
```tsx
export async function generateMetadata({ params }: { params: { locale: "en" | "zh"; slug: string } }): Promise<Metadata> {
  const post = await getPostData(params.slug, params.locale);
  const title = `${post.title} | Kumma`;
  const og = `/og/blog-${params.slug}.png`;
  return {
    title: post.title, description: post.excerpt,
    alternates: { languages: { en: `/blog/en/${params.slug}`, zh: `/blog/zh/${params.slug}`, "x-default": `/blog/en/${params.slug}` } },
    openGraph: { title, description: post.excerpt, type: "article", url: `https://kumma.me/blog/${params.locale}/${params.slug}`, images: [og] },
    twitter: { card: "summary_large_image", title, description: post.excerpt, images: [og] },
  };
}
```

- [ ] **Step 2:** Render an `Article` JSON-LD in the page:
```tsx
<JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt,
  datePublished: post.publishedDate, inLanguage: params.locale, author: { "@type": "Person", name: "Kumma" },
  url: `https://kumma.me/blog/${params.locale}/${params.slug}` }} />
```

- [ ] **Step 3: Verify** — `npm run build`; a built post html has unique title + `hreflang` alternates + Article ld.
- [ ] **Step 4: Commit** `git add app/blog/[locale]/[slug]/page.tsx && git commit -m "feat(seo): blog metadata, hreflang, Article JSON-LD"`

---

## Task 11: RSS feed

**Files:** Create `app/feed.xml/route.ts`

- [ ] **Step 1:** `force-static` route building RSS from EN posts (ZH items included with `xml:lang`):
```ts
import { getSortedPostsData } from "@/lib/posts";
export const dynamic = "force-static";
export function GET() {
  const base = "https://kumma.me";
  const items = (["en", "zh"] as const).flatMap((locale) =>
    getSortedPostsData(locale).map((p) => `<item><title>${escapeXml(p.title)}</title>` +
      `<link>${base}/blog/${locale}/${p.slug}</link>` +
      `<guid>${base}/blog/${locale}/${p.slug}</guid>` +
      `<pubDate>${new Date(p.publishedDate).toUTCString()}</pubDate>` +
      `<description>${escapeXml(p.excerpt)}</description></item>`)).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>` +
    `<title>Kumma</title><link>${base}</link><description>Essays by Kumma</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
function escapeXml(s: string) { return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!)); }
```

- [ ] **Step 2: Verify** — `npm run build`; confirm `out/feed.xml` exists and is valid XML. If export errors on the route, fall back to `scripts/generate-feed.mjs` writing `public/feed.xml` in `prebuild` (same XML).
- [ ] **Step 3: Commit** `git add app/feed.xml/route.ts && git commit -m "feat(seo): static RSS feed"`

---

## Task 12: Build-time OG cards

**Files:** Create `scripts/generate-og.mjs`; modify `package.json`

- [ ] **Step 1: Deps** — `npm install -D satori @resvg/resvg-js`. Confirm they appear in `package.json` devDependencies.

- [ ] **Step 2: Script** — `scripts/generate-og.mjs` renders an Atlas card per key (home, each project slug, each post slug, default) to `public/og/*.png`. Uses satori + resvg + one vendored font (`public/fonts/` ttf, or fetch Space Grotesk ttf into the script). Full skeleton:
```js
import fs from "node:fs";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const OUT = "public/og";
fs.mkdirSync(OUT, { recursive: true });
const font = fs.readFileSync("public/fonts/SpaceGrotesk-SemiBold.ttf"); // vendor this file

async function card(key, title, kicker) {
  const svg = await satori(
    { type: "div", props: { style: { width: 1200, height: 630, display: "flex", flexDirection: "column",
      justifyContent: "space-between", padding: 80, background: "#0a0a0b", color: "#f0ede8", fontFamily: "Space Grotesk" },
      children: [
        { type: "div", props: { style: { color: "#c06a5c", fontSize: 28, letterSpacing: 4, textTransform: "uppercase" }, children: kicker } },
        { type: "div", props: { style: { fontSize: 72, lineHeight: 1.05, maxWidth: 1000 }, children: title } },
        { type: "div", props: { style: { color: "#a4a09a", fontSize: 30 }, children: "kumma.me" } },
      ] } },
    { width: 1200, height: 630, fonts: [{ name: "Space Grotesk", data: font, weight: 600, style: "normal" }] },
  );
  const png = new Resvg(svg).render().asPng();
  fs.writeFileSync(path.join(OUT, `${key}.png`), png);
}

const { projects } = await import("../data/projectData.ts").catch(() => ({ projects: [] }));
// NOTE: if importing TS fails in node, read slugs by globbing data or hardcode the known slugs list.
await card("default", "Intelligent systems for the real world.", "Kumma");
await card("home", "I build intelligent systems for the real world.", "Kumma");
for (const p of projects) await card(`projects-${p.slug}`, p.title, "Selected work");
// posts:
const dirs = ["_posts", "_posts/zh"];
for (const d of dirs) if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (f.endsWith(".md"))
  await card(`blog-${f.replace(/\.md$/, "")}`, f.replace(/[-_]/g, " ").replace(/\.md$/, ""), "Essay");
console.log("OG cards generated");
```
Note: vendor `public/fonts/SpaceGrotesk-SemiBold.ttf`. If importing the TS `projectData` from node is troublesome, hardcode `["kota","archon","market-systems"]` and read post titles from frontmatter via a tiny gray-matter read (already a dep).

- [ ] **Step 3: Wire prebuild** — in `package.json` scripts add `"prebuild": "node scripts/generate-og.mjs"`. (Runs before `next build` locally and in CI.)

- [ ] **Step 4: Verify** — `node scripts/generate-og.mjs` then `ls public/og/` shows `default.png`, `home.png`, `projects-kota.png`, `blog-*.png`. `npm run build` succeeds with prebuild.
- [ ] **Step 5: Commit** `git add scripts/generate-og.mjs package.json package-lock.json public/og public/fonts && git commit -m "feat(seo): build-time OG cards via satori"`

---

## Task 13: Umami analytics + Search Console

**Files:** Create `components/Analytics.tsx`; modify `app/layout.tsx`

- [ ] **Step 1: Analytics** — env-guarded, renders nothing if unset:
```tsx
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_UMAMI_ID;
  if (!id) return null;
  return <script defer src="https://cloud.umami.is/script.js" data-website-id={id} />;
}
```

- [ ] **Step 2: Wire + verification** — in `app/layout.tsx`, render `<Analytics />` at the end of `<body>`; add `verification: { google: process.env.NEXT_PUBLIC_GSC_TOKEN ?? "" }` to `metadata` (only emits if set). Document: user sets `NEXT_PUBLIC_UMAMI_ID` and `NEXT_PUBLIC_GSC_TOKEN` in `.env.local` / GitHub Actions secrets, and submits `https://kumma.me/sitemap.xml` in Search Console.

- [ ] **Step 3: Verify** — `npx tsc --noEmit && npm run build` clean; with no env set, no analytics script in output (`grep -c umami out/index.html` is 0).
- [ ] **Step 4: Commit** `git add components/Analytics.tsx app/layout.tsx && git commit -m "feat(analytics): env-guarded Umami + GSC verification"`

---

## Task 14: QA sweep

- [ ] **Step 1: Build + types + lint** — stop dev; `npx tsc --noEmit && npm run lint && npm run build`. All clean; `out/` contains `/projects/kota`, `/projects/archon`, `/projects/market-systems`, `sitemap.xml`, `robots.txt`, `feed.xml`, `og/*.png`.
- [ ] **Step 2: No dead links / stubs** — `grep -rn "systems/archon\|app/markets" app components` returns nothing; chapter index + nav + footer point to `/projects/*`.
- [ ] **Step 3: Em-dash + tells** — `grep -rn "—" app components data` returns nothing.
- [ ] **Step 4: Manual (dev)** — each chapter page shows hero + animated viz + content; reduced-motion shows static viz; home teasers animate; OG card opens (`/og/projects-kota.png`).
- [ ] **Step 5: Commit** any fixes `git add -A && git commit -m "fix: phase 1B/2 QA"`

---

## Self-review notes (author)
- Spec coverage: §4 chapter system → T1,T6; §5 viz → T3,T4,T5,T7; §6 content → T2; §7 exposure → T8,T9,T10,T11,T12,T13; §8 file arch → all; §10 success → T14. All covered.
- Naming consistency: `vizBySlug`, `VizProps`, `VizSize`, slugs `kota`/`archon`/`market-systems`, `/og/<key>.png` keys (`home`, `projects-<slug>`, `blog-<slug>`, `default`) consistent across tasks.
- Known follow-ups (not this plan): deeper viz interactivity; dedicated `/projects` index; real Experiments photography; blog visual polish (Phase 3).
- Risk flagged inline: TS import of `projectData` in the node OG script (fallback: hardcode slugs + gray-matter read); RSS route under export (fallback: build script).
