# Awwwards Operational Cinema Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the portfolio into an Awwwards-style interactive systems exhibit where the site itself demonstrates operational AI behavior.

**Architecture:** Keep the current Next.js App Router, CSS Modules, GSAP, and Three.js foundation. Add a small typed evidence layer, reusable proof/telemetry components, and targeted page upgrades rather than replacing the site shell.

**Tech Stack:** Next.js 14, React 18, TypeScript, CSS Modules, GSAP, Three.js/@react-three/fiber, existing static export workflow.

---

### Task 1: Baseline And Safety

**Files:**
- Read: `package.json`
- Read: `app/layout.tsx`
- Read: `components/Home.tsx`
- Read: `components/ThreeScene.tsx`
- Read: `components/AgentAwareness.tsx`
- Read: `components/home/HeroSection.tsx`
- Read: `components/home/ChapterIndex.tsx`
- Read: `components/projects/KotaDetail.tsx`
- Read: `components/ProjectDetail.tsx`

**Step 1: Confirm clean worktree**

Run:

```bash
git status --short --branch
```

Expected: no modified files except this plan if executing from a fresh checkout.

**Step 2: Install dependencies if needed**

Run:

```bash
npm install
```

Expected: dependencies installed without changing application source.

**Step 3: Capture baseline build**

Run:

```bash
npm run build
```

Expected: build passes. Note any warnings, especially favicon and WebGL/browser warnings.

**Step 4: Capture baseline browser frames**

Run:

```bash
npm run dev
```

Open:

- `http://localhost:4242/`
- `http://localhost:4242/projects/kota`
- `http://localhost:4242/projects/archon`
- `http://localhost:4242/projects/market-systems`
- `http://localhost:4242/blog`
- `http://localhost:4242/gallery`
- `http://localhost:4242/build`

Expected: confirm current visual baseline and console state before changes.

**Step 5: Commit baseline planning docs**

Run:

```bash
git add docs/plans/2026-07-05-awwwards-operational-cinema-design.md docs/plans/2026-07-05-awwwards-operational-cinema.md
git commit -m "docs: plan awwwards operational cinema refresh"
```

Expected: documentation commit created.

### Task 2: Add Evidence Data Model

**Files:**
- Create: `data/systemEvidence.ts`
- Modify: `data/projectData.ts`

**Step 1: Create typed evidence records**

Create `data/systemEvidence.ts`:

```ts
export type EvidenceKind = "live" | "open-source" | "artifact" | "workflow";

export interface SystemEvidence {
  slug: "kota" | "archon" | "market-systems" | "field-notes";
  label: string;
  status: string;
  signal: string;
  input: string;
  transform: string;
  output: string;
  guardrail: string;
  kind: EvidenceKind;
  href: string;
  external?: boolean;
}

export const systemEvidence: SystemEvidence[] = [
  {
    slug: "kota",
    label: "KOTA",
    status: "live voice system",
    signal: "call -> order",
    input: "messy restaurant phone speech",
    transform: "streaming STT, menu grounding, confidence loop",
    output: "kitchen-ready order ticket",
    guardrail: "clarifies ambiguity before commit",
    kind: "live",
    href: "https://kota.kummalabs.com",
    external: true,
  },
  {
    slug: "archon",
    label: "ARCHON",
    status: "open-source control plane",
    signal: "route -> worker",
    input: "multi-step development task",
    transform: "model routing, tools, memory, human approvals",
    output: "inspectable agent work session",
    guardrail: "trace, policy, recovery",
    kind: "open-source",
    href: "/projects/archon",
  },
  {
    slug: "market-systems",
    label: "Market Systems",
    status: "decision-quality tooling",
    signal: "signal -> rule",
    input: "noisy market context",
    transform: "setup taxonomy, risk rules, execution journal",
    output: "scored decision record",
    guardrail: "process over P&L",
    kind: "workflow",
    href: "/projects/market-systems",
  },
  {
    slug: "field-notes",
    label: "Field Notes",
    status: "engineering notes",
    signal: "build -> explain",
    input: "system implementation",
    transform: "technical narrative and design reasoning",
    output: "reusable operating insight",
    guardrail: "no fabricated metrics",
    kind: "artifact",
    href: "/blog",
  },
];
```

**Step 2: Type-check**

Run:

```bash
npm run build
```

Expected: build passes with the unused data file accepted by TypeScript.

**Step 3: Commit**

Run:

```bash
git add data/systemEvidence.ts data/projectData.ts
git commit -m "feat: add system evidence model"
```

### Task 3: Build Proof Console Components

**Files:**
- Create: `components/home/ProofConsole.tsx`
- Create: `components/home/ProofConsole.module.css`
- Modify: `components/Home.tsx`

**Step 1: Add component**

Create a proof console that imports `systemEvidence` and renders four evidence rows with status, signal, input/output, and link.

Key structure:

```tsx
import Link from "next/link";
import { systemEvidence } from "@/data/systemEvidence";
import styles from "./ProofConsole.module.css";

export default function ProofConsole() {
  return (
    <section className={styles.section} aria-labelledby="proof-console-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>Operational proof</p>
          <h2 id="proof-console-title" className={styles.title}>
            Systems that convert messy inputs into reliable action.
          </h2>
        </div>
        <div className={styles.grid}>
          {systemEvidence.map((item) => {
            const content = (
              <>
                <span className={styles.status}>{item.status}</span>
                <strong>{item.label}</strong>
                <span className={styles.signal}>{item.signal}</span>
                <span className={styles.flow}>{item.input}</span>
                <span className={styles.guardrail}>{item.guardrail}</span>
              </>
            );
            return item.external ? (
              <a key={item.slug} href={item.href} className={styles.card} target="_blank" rel="noreferrer">
                {content}
              </a>
            ) : (
              <Link key={item.slug} href={item.href} className={styles.card}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Add restrained CSS**

Use the existing color tokens. Keep the cards dense, technical, and low radius. Avoid nested cards.

**Step 3: Insert after hero**

Modify `components/Home.tsx`:

```tsx
import ProofConsole from "./home/ProofConsole";
```

Then render:

```tsx
<HeroSection />
<ProofConsole />
<PositioningBand />
```

**Step 4: Verify**

Run:

```bash
npm run build
```

Expected: build passes and the proof console appears directly after the hero.

**Step 5: Commit**

Run:

```bash
git add components/Home.tsx components/home/ProofConsole.tsx components/home/ProofConsole.module.css
git commit -m "feat: add operational proof console"
```

### Task 4: Upgrade Hero Into A System World

**Files:**
- Modify: `components/home/HeroSection.tsx`
- Modify: `components/home/HeroSection.module.css`

**Step 1: Add live signal rail in hero**

Add three compact signal items below the subtext or beside it on wide screens:

```tsx
const heroSignals = [
  ["KOTA", "call -> order"],
  ["ARCHON", "route -> worker"],
  ["Markets", "signal -> rule"],
];
```

Render them as semantic list items, not decorative div soup.

**Step 2: Tighten copy**

Keep the headline. Replace the subtext with a slightly sharper version:

```tsx
Real-time voice, agent orchestration, and decision systems built around messy inputs, visible guardrails, and reliable outputs.
```

**Step 3: Improve mobile contrast**

In `HeroSection.module.css`:

- add a dark text-scrim behind `.inner` only on small screens or over terrain
- increase `.availability` color contrast
- ensure CTA buttons stack without crowding
- keep font-size clamp, no viewport-width-only scaling

**Step 4: Verify motion fallback**

Check that `prefers-reduced-motion` still skips GSAP intro animation.

**Step 5: Browser check**

Run dev server and capture:

- desktop 1280x720 home
- mobile 390x844 home

Expected: no text overlaps, hero proof visible, availability readable.

**Step 6: Commit**

Run:

```bash
git add components/home/HeroSection.tsx components/home/HeroSection.module.css
git commit -m "feat: add operational hero signals"
```

### Task 5: Convert Chapters Into Evidence Cards

**Files:**
- Modify: `components/home/chapters.ts`
- Modify: `components/home/ChapterIndex.tsx`
- Modify: `components/home/ChapterIndex.module.css`

**Step 1: Extend chapter data**

Add optional fields:

```ts
evidence?: {
  input: string;
  transform: string;
  output: string;
  guardrail: string;
};
artifact?: string;
```

Populate KOTA, ARCHON, and Market Systems using honest, non-fabricated claims.

**Step 2: Render evidence flow**

In each non-gallery chapter card, render a compact four-part flow:

- Input
- Transform
- Output
- Guardrail

Keep labels short and use mono text for metadata.

**Step 3: Improve full-page screenshot state**

The current intersection reveal can make full-page captures show a huge blank area. Add a CSS fallback so rows are visible when JS or intersection timing fails:

```css
.row {
  opacity: 1;
  transform: none;
}

.jsReveal .row {
  opacity: 0;
  transform: translateY(34px);
}
```

Then add the reveal class only after the effect initializes.

**Step 4: Verify**

Run:

```bash
npm run build
```

Take full-page screenshot of `/`.

Expected: no blank selected-work canyon, evidence flows visible.

**Step 5: Commit**

Run:

```bash
git add components/home/chapters.ts components/home/ChapterIndex.tsx components/home/ChapterIndex.module.css
git commit -m "feat: make chapters evidence-led"
```

### Task 6: Move Case-Study Proof Above The Fold

**Files:**
- Modify: `components/ProjectDetail.tsx`
- Modify: `styles/projectDetail.module.css`
- Modify: `components/projects/KotaDetail.tsx`
- Modify: `styles/kotaCaseStudy.module.css`

**Step 1: Generic project hero**

For ARCHON and Market Systems, render the metric stack and system visualization inside the first hero grid on desktop.

Expected layout:

- left: subtitle, title, tagline, CTA, outcome
- right: metrics, viz, proof caption

On mobile, stack title first, proof second.

**Step 2: KOTA hero**

Move KOTA’s metrics and call-to-order visualization into the first viewport. Keep “What Actually Happens” immediately after.

**Step 3: Add proof captions**

Use honest captions:

- KOTA: `Messy speech becomes a menu-verified ticket with confidence checks.`
- ARCHON: `Tasks route through models, tools, memory, workers, and recovery.`
- Market Systems: `Noisy context is reduced into rule-based decision records.`

**Step 4: Verify**

Run:

```bash
npm run build
```

Capture desktop and mobile screenshots for:

- `/projects/kota`
- `/projects/archon`
- `/projects/market-systems`

Expected: proof appears above the fold on all three pages.

**Step 5: Commit**

Run:

```bash
git add components/ProjectDetail.tsx styles/projectDetail.module.css components/projects/KotaDetail.tsx styles/kotaCaseStudy.module.css
git commit -m "feat: surface case study proof above fold"
```

### Task 7: Reframe Blog And Gallery For Judges

**Files:**
- Modify: `app/blog/page.tsx`
- Modify: `components/BlogSection.tsx`
- Modify: `app/gallery/page.tsx`
- Modify: `styles/blog.module.css`
- Modify: `styles/PhotoGallery.module.css`

**Step 1: Rename blog framing**

Change blog metadata and on-page copy from general journal framing to:

- title: `Field Notes | Kumma`
- heading: `Field Notes`
- description: `Technical notes from systems that turn messy inputs into reliable action.`

Keep personal essays available but secondary through category filters.

**Step 2: Prioritize engineering notes visually**

Ensure Engineering posts remain first. Add a small label such as `System note` for engineering posts if the current data supports it.

**Step 3: Reframe gallery**

Change gallery language toward visual systems:

- heading: `Visual Systems`
- note: `Interface studies for atmosphere, pacing, and system legibility.`

Avoid overclaiming that every photo is engineering evidence.

**Step 4: Verify**

Run:

```bash
npm run build
```

Open `/blog` and `/gallery`.

Expected: both routes support the Operational Cinema concept instead of feeling like unrelated annexes.

**Step 5: Commit**

Run:

```bash
git add app/blog/page.tsx components/BlogSection.tsx app/gallery/page.tsx styles/blog.module.css styles/PhotoGallery.module.css
git commit -m "feat: reframe notes and studies around systems"
```

### Task 8: Fix Overlay, Favicon, And Mobile Polish

**Files:**
- Modify: `components/AgentAwareness.tsx`
- Modify: `components/AgentAwareness.module.css`
- Modify: `app/layout.tsx`
- Create or copy: `app/favicon.ico` or `public/favicon.ico`

**Step 1: Make agent protocol less intrusive**

Rules:

- no banner for ordinary headed Playwright sessions unless `navigator.webdriver`
  is true and viewport is desktop
- on mobile, collapse the fixed pill to an icon-sized affordance or move it
  below content flow
- do not cover CTA buttons, headings, or section starts

**Step 2: Add favicon**

Add a small favicon asset and ensure Next serves it without a 404.

**Step 3: Metadata check**

If using `app/favicon.ico`, no layout metadata change is required. If using
`public/favicon.ico`, confirm the browser requests it successfully.

**Step 4: Verify console**

Run:

```bash
npm run build
npm run dev
```

Open home and project pages. Expected: no missing favicon error; no overlay collisions on mobile.

**Step 5: Commit**

Run:

```bash
git add components/AgentAwareness.tsx components/AgentAwareness.module.css app/layout.tsx app/favicon.ico public/favicon.ico
git commit -m "fix: polish protocol overlay and favicon"
```

If only one favicon path exists, add only that path.

### Task 9: Performance And Reduced-Motion Pass

**Files:**
- Modify: `components/ThreeScene.tsx`
- Modify: `app/globals.css`
- Modify: any touched CSS modules with motion

**Step 1: Audit motion hooks**

Search:

```bash
rg "gsap|requestAnimationFrame|useFrame|IntersectionObserver|prefers-reduced-motion" components app styles
```

Expected: identify all active motion paths touched by this refresh.

**Step 2: Reduce mobile render pressure**

If `ThreeScene` renders full WebGL on every route and viewport, gate quality or density on mobile:

- lower geometry detail
- reduce frame work when not visible
- respect `prefers-reduced-motion`
- avoid readback-heavy operations

Do not remove the primary immersive scene unless it is clearly causing user-visible performance problems.

**Step 3: Verify**

Run:

```bash
npm run build
```

Browser check desktop and mobile home. Expected: no visible blank canvas, no text overlap, no site-owned runtime errors.

**Step 4: Commit**

Run:

```bash
git add components/ThreeScene.tsx app/globals.css components styles
git commit -m "perf: tune motion for mobile and reduced motion"
```

Add only files actually changed.

### Task 10: Final Award-Judge QA

**Files:**
- No source changes expected unless defects are found.

**Step 1: Production build**

Run:

```bash
npm run build
```

Expected: build passes.

**Step 2: Browser route pass**

Run:

```bash
npm run dev
```

Capture screenshots:

- `/` desktop 1280x720
- `/` mobile 390x844
- `/projects/kota` desktop and mobile
- `/projects/archon` desktop and mobile
- `/projects/market-systems` desktop and mobile
- `/blog`
- `/gallery`
- `/build`

Expected:

- first viewport communicates the concept
- proof visible above or near the fold
- no overlay collisions
- no missing favicon
- no incoherent text overlap

**Step 3: Console pass**

Use browser console or Playwright CLI console output.

Expected: no site-owned errors. Browser/GPU warnings may be noted if not caused by application defects.

**Step 4: Final commit if fixes were needed**

Run:

```bash
git status --short
git add <changed-files>
git commit -m "fix: complete award judge polish pass"
```

Expected: clean branch with focused commits.
