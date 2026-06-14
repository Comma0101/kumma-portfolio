# Portfolio Phase 1A — Design System + Home/Entrance Shell — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio home page into the entrance of a chapter-based "personal digital world," on a new "Atlas (warmed)" design system, replacing all fake div-UI and dead code.

**Architecture:** Next.js 14 App Router, static export. CSS Modules + global design tokens. Hybrid 3D: an isolated, lazy, quality-tiered R3F hero scene with a static fallback; everything else is editorial DOM with Lenis + IntersectionObserver motion. Eight home sections, each a distinct layout family.

**Tech Stack:** React 18, TypeScript, `@react-three/fiber` + `drei` + `three` + `simplex-noise` (already deps), `next/font/google`, GSAP/Lenis (already present).

**Spec:** `docs/superpowers/specs/2026-06-13-portfolio-design-system-and-home-shell-design.md`
**Branch:** `redesign/phase-1a-design-system-home` (already created; execute here).

**Testing approach (codebase-appropriate):** No test runner exists in this repo and Phase 1A is visual. Each task verifies with `npx tsc --noEmit`, `npm run lint`, and where structural, `npm run build`. Logic units get a tiny pure-function check run via `npx tsx` (no framework install). Manual checks (reduced-motion, WebGL-off, mobile width) are listed explicitly. Do not add a test framework in this phase.

**Global rules (enforce in every task):** zero em-dashes (`—`) / en-dash separators in any visible string; middle-dot `·` max one per line; muted-red `--signal` is the only interactive color, warm `--sand` is atmosphere only; one radius system; reduced-motion collapses all motion.

---

## File structure (created/modified in this phase)

```
app/globals.css                         # MODIFY — Atlas tokens
app/layout.tsx                          # MODIFY — fonts + metadata
app/page.tsx                            # MODIFY — compose new home
app/projects/page.tsx                   # MODIFY — redirect to /#work
app/systems/archon/page.tsx             # CREATE — stub
app/markets/page.tsx                    # CREATE — stub
components/Home.tsx                      # MODIFY — new section composition
components/home/HeroSection.tsx|.module.css         # REWRITE
components/home/PositioningBand.tsx|.module.css      # CREATE
components/home/ChapterIndex.tsx|.module.css         # CREATE
components/home/PhilosophySection.tsx|.module.css    # CREATE
components/home/ContactSection.tsx|.module.css       # MODIFY (simplify)
components/home/chapters.ts              # CREATE — chapter index data
components/three/useQualityTier.ts       # CREATE
components/three/HeroScene.tsx           # CREATE — R3F leaf
components/system/Button.tsx|.module.css             # CREATE
components/system/Eyebrow.tsx                         # CREATE
components/system/LiveSignal.tsx|.module.css          # CREATE
components/system/SectionHeader.tsx|.module.css       # CREATE
components/system/SystemViz.tsx|.module.css           # CREATE
components/Navigation.tsx + styles/navigation.module.css   # MODIFY
components/Footer.tsx + styles/footer.module.css           # MODIFY
```

**Deletions (Task 13):** `components/home/AboutSection.*`, `components/home/TextTunnelTransition.*`, `components/home/CuboidsSection.tsx`, fake visuals in `components/Projects.tsx` (and the old `ProjectsSection`/`SkillsSection`/`HomeEditorialSections` usage in Home), unused imports in `app/stories/page.tsx`, em-dash in `styles/projectDetail.module.css` comment.

---

## Task 1: Atlas design tokens + fonts

**Files:**
- Modify: `app/globals.css` (the `:root` block, lines ~3-21)
- Modify: `app/layout.tsx` (font imports lines 1-32, body className line 59-62)

- [ ] **Step 1: Replace the `:root` token block in `app/globals.css`**

Replace the existing `:root { ... }` with:

```css
:root {
  color-scheme: dark;
  --canvas: #0a0a0b;
  --surface: #131316;
  --raised: #1a1a1e;
  --paper: #f0ede8;
  --steel: #a4a09a;
  --faint: #6f6b65;
  --signal: #c06a5c;          /* interactive / live ONLY */
  --signal-strong: #cf7a6c;
  --sand: #c9b8a0;            /* atmosphere ONLY */
  --line: rgba(240, 237, 232, 0.12);
  --line-strong: rgba(240, 237, 232, 0.22);
  --background: var(--canvas);
  --foreground: var(--paper);
  --radius-card: 14px;
  --radius-control: 8px;
  --page-gutter: clamp(1.25rem, 5vw, 4.5rem);
  --page-width: 1380px;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```

Also update the `::selection` rule background to `var(--signal-strong)` and keep `color: var(--canvas)`.

- [ ] **Step 2: Wire fonts in `app/layout.tsx`**

Replace the three `next/font/google` imports/instances with:

```tsx
import { Space_Grotesk, JetBrains_Mono, Cormorant_Garamond } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic"],
  variable: "--font-editorial",
  display: "swap",
});
```

Update `<body className={...}>` to `${spaceGrotesk.variable} ${jetbrainsMono.variable} ${cormorant.variable}`. Update `metadata.title.default` to `"Kumma | Independent systems builder"` and description to `"Kumma builds intelligent systems for the real world: real-time AI, agent infrastructure, and operational products."` (no em-dashes).

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. Run `npm run build`; expected: build completes.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat(design): Atlas tokens and font wiring (Space Grotesk / JetBrains Mono / Cormorant italic)"
```

---

## Task 2: System primitives — Button, Eyebrow, LiveSignal, SectionHeader

**Files:**
- Create: `components/system/Button.tsx`, `components/system/Button.module.css`
- Create: `components/system/Eyebrow.tsx`
- Create: `components/system/LiveSignal.tsx`, `components/system/LiveSignal.module.css`
- Create: `components/system/SectionHeader.tsx`, `components/system/SectionHeader.module.css`

- [ ] **Step 1: Button**

`components/system/Button.tsx`:
```tsx
import Link from "next/link";
import styles from "./Button.module.css";

type Variant = "primary" | "ghost";

interface ButtonProps {
  href: string;
  variant?: Variant;
  children: React.ReactNode;
  external?: boolean;
}

export default function Button({ href, variant = "primary", children, external }: ButtonProps) {
  const cls = `${styles.btn} ${variant === "primary" ? styles.primary : styles.ghost}`;
  if (external) {
    return <a className={cls} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  }
  if (href.startsWith("#") || href.startsWith("/")) {
    return <Link className={cls} href={href}>{children}</Link>;
  }
  return <a className={cls} href={href}>{children}</a>;
}
```

`components/system/Button.module.css`:
```css
.btn {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.25rem;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  transition: transform 180ms var(--ease), background-color 180ms ease, border-color 180ms ease;
}
.primary { background: var(--signal); color: #140c0b; }
.primary:hover { background: var(--signal-strong); transform: translateY(-2px); }
.ghost { border-color: var(--line-strong); color: var(--paper); }
.ghost:hover { border-color: var(--signal); transform: translateY(-2px); }
@media (prefers-reduced-motion: reduce) { .btn { transition: none; } }
```

- [ ] **Step 2: Eyebrow** — `components/system/Eyebrow.tsx`:
```tsx
export default function Eyebrow({ children, color = "sand" }: { children: React.ReactNode; color?: "sand" | "signal" }) {
  return (
    <p style={{
      margin: 0,
      fontFamily: "var(--font-mono)",
      fontSize: "0.66rem",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: color === "signal" ? "var(--signal)" : "var(--sand)",
    }}>{children}</p>
  );
}
```

- [ ] **Step 3: LiveSignal** — `components/system/LiveSignal.tsx`:
```tsx
import styles from "./LiveSignal.module.css";
export default function LiveSignal({ children }: { children: React.ReactNode }) {
  return <span className={styles.live}>{children}</span>;
}
```
`components/system/LiveSignal.module.css`:
```css
.live {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--signal);
}
.live::before {
  content: ""; width: 6px; height: 6px; border-radius: 50%;
  background: var(--signal); box-shadow: 0 0 0 4px rgba(192, 106, 92, 0.18);
}
```

- [ ] **Step 4: SectionHeader** (stacked, never split-header) — `components/system/SectionHeader.tsx`:
```tsx
import styles from "./SectionHeader.module.css";
import Eyebrow from "./Eyebrow";

interface Props { eyebrow?: string; title: string; intro?: string; }
export default function SectionHeader({ eyebrow, title, intro }: Props) {
  return (
    <header className={styles.header}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className={styles.title}>{title}</h2>
      {intro && <p className={styles.intro}>{intro}</p>}
    </header>
  );
}
```
`components/system/SectionHeader.module.css`:
```css
.header { display: flex; flex-direction: column; gap: 1.1rem; max-width: 30ch; }
.title { margin: 0; color: var(--paper); font-family: var(--font-sans);
  font-size: clamp(2.4rem, 5.5vw, 5rem); font-weight: 600; line-height: 0.96; letter-spacing: -0.04em; }
.intro { margin: 0; max-width: 52ch; color: var(--steel); font-size: clamp(1rem, 1.3vw, 1.12rem); line-height: 1.65; }
```

- [ ] **Step 5: Verify** — `npx tsc --noEmit && npm run lint` → no errors.

- [ ] **Step 6: Commit**
```bash
git add components/system
git commit -m "feat(system): Button, Eyebrow, LiveSignal, SectionHeader primitives"
```

---

## Task 3: SystemViz frame primitive

**Files:** Create `components/system/SystemViz.tsx`, `components/system/SystemViz.module.css`

- [ ] **Step 1: Component** — a framed container for real visualizations (replaces fake dashboards). Accepts a toolbar label and children.
```tsx
import styles from "./SystemViz.module.css";
interface Props { label: string; live?: boolean; children: React.ReactNode; className?: string; }
export default function SystemViz({ label, live, children, className }: Props) {
  return (
    <div className={`${styles.frame} ${className ?? ""}`}>
      <div className={styles.toolbar}>
        <span>{label}</span>
        {live && <span className={styles.dot} aria-hidden="true" />}
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
```
`components/system/SystemViz.module.css`:
```css
.frame { position: relative; min-width: 0; border: 1px solid var(--line);
  border-radius: var(--radius-card); background: var(--raised); overflow: hidden;
  background-image:
    linear-gradient(rgba(240,237,232,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(240,237,232,0.025) 1px, transparent 1px);
  background-size: 30px 30px; }
.toolbar { display: flex; align-items: center; justify-content: space-between;
  padding: 0.9rem 1.1rem; border-bottom: 1px solid var(--line);
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--faint); }
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--signal);
  box-shadow: 0 0 0 4px rgba(192,106,92,0.16); }
.body { padding: clamp(1.2rem, 3vw, 2.4rem); }
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit` → no errors.
- [ ] **Step 3: Commit**
```bash
git add components/system/SystemViz.tsx components/system/SystemViz.module.css
git commit -m "feat(system): SystemViz frame to replace fake dashboards"
```

---

## Task 4: Quality-tier hook

**Files:** Create `components/three/useQualityTier.ts`

- [ ] **Step 1: Implement pure detection + hook**
```ts
"use client";
import { useEffect, useState } from "react";

export type Tier = "high" | "low" | "off";

export interface TierInputs {
  reducedMotion: boolean;
  hasWebGL: boolean;
  deviceMemory?: number;   // navigator.deviceMemory (GB), may be undefined
  cores?: number;          // navigator.hardwareConcurrency
  coarsePointer: boolean;  // touch/mobile
}

export function resolveTier(i: TierInputs): Tier {
  if (i.reducedMotion || !i.hasWebGL) return "off";
  const lowMem = (i.deviceMemory ?? 8) <= 4;
  const lowCores = (i.cores ?? 8) <= 4;
  if (i.coarsePointer || lowMem || lowCores) return "low";
  return "high";
}

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch { return false; }
}

export function useQualityTier(): Tier {
  const [tier, setTier] = useState<Tier>("off"); // SSR-safe default = static
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    setTier(resolveTier({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      hasWebGL: detectWebGL(),
      deviceMemory: nav.deviceMemory,
      cores: navigator.hardwareConcurrency,
      coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    }));
  }, []);
  return tier;
}
```

- [ ] **Step 2: Logic check (no framework)** — create temp file `/tmp/tier.test.ts`:
```ts
import { resolveTier } from "../Users/kuma./Workspace/kumma-portfolio/components/three/useQualityTier";
const a = resolveTier({ reducedMotion: true, hasWebGL: true, coarsePointer: false });
const b = resolveTier({ reducedMotion: false, hasWebGL: false, coarsePointer: false });
const c = resolveTier({ reducedMotion: false, hasWebGL: true, coarsePointer: true });
const d = resolveTier({ reducedMotion: false, hasWebGL: true, coarsePointer: false, deviceMemory: 16, cores: 12 });
console.log(a, b, c, d); // expect: off off low high
```
Run: `npx tsx /tmp/tier.test.ts`
Expected output: `off off low high`. Delete the temp file after.

- [ ] **Step 3: Commit**
```bash
git add components/three/useQualityTier.ts
git commit -m "feat(three): quality-tier detection hook"
```

---

## Task 5: Hero R3F scene (noise → structure point field)

**Files:** Create `components/three/HeroScene.tsx`

- [ ] **Step 1: Implement the scene** — an isolated client leaf. A point field driven by simplex noise that drifts and resolves; sand-colored points; one red active point; DPR/point-count by tier; renders nothing when `tier === "off"` (caller shows static poster). Pause rAF when not visible.

```tsx
"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import type { Tier } from "./useQualityTier";

function PointField({ tier }: { tier: Exclude<Tier, "off"> }) {
  const count = tier === "high" ? 4200 : 1600;
  const cols = Math.floor(Math.sqrt(count));
  const noise = useMemo(() => createNoise2D(), []);
  const ref = useRef<THREE.Points>(null);

  const { positions, base } = useMemo(() => {
    const positions = new Float32Array(cols * cols * 3);
    const base = new Float32Array(cols * cols * 2);
    let p = 0, b = 0;
    for (let y = 0; y < cols; y++) {
      for (let x = 0; x < cols; x++) {
        positions[p++] = (x / cols - 0.5) * 60;
        positions[p++] = 0;
        positions[p++] = (y / cols - 0.5) * 60;
        base[b++] = x * 0.12; base[b++] = y * 0.12;
      }
    }
    return { positions, base };
  }, [cols]);

  useFrame(({ clock }) => {
    const pts = ref.current;
    if (!pts) return;
    const t = clock.getElapsedTime() * 0.12;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0, j = 0; i < arr.length; i += 3, j += 2) {
      arr[i + 1] = noise(base[j] + t, base[j + 1]) * 4.5;
    }
    pts.geometry.attributes.position.needsUpdate = true;
    pts.rotation.y = Math.sin(t * 0.1) * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={0xc9b8a0} size={0.18} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

export default function HeroScene({ tier }: { tier: Tier }) {
  if (tier === "off") return null;
  return (
    <Canvas
      gl={{ antialias: tier === "high", alpha: true, powerPreference: "low-power" }}
      dpr={tier === "high" ? [1, 1.5] : 1}
      camera={{ position: [0, 14, 34], fov: 60 }}
      style={{ position: "absolute", inset: 0 }}
      frameloop="always"
    >
      <PointField tier={tier} />
    </Canvas>
  );
}
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit` → no errors. (Visual check happens in Task 6.)
- [ ] **Step 3: Commit**
```bash
git add components/three/HeroScene.tsx
git commit -m "feat(three): hero point-field scene with tiered DPR/point count"
```

---

## Task 6: HeroSection rebuild (entrance, no blocking gate)

**Files:** Rewrite `components/home/HeroSection.tsx` and `components/home/HeroSection.module.css`

- [ ] **Step 1: Component** — hosts the lazy HeroScene + static poster fallback + copy assemble (GSAP, reduced-motion aware). Headline DOM (LCP-safe).
```tsx
"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Button from "@/components/system/Button";
import { useQualityTier } from "@/components/three/useQualityTier";
import styles from "./HeroSection.module.css";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const tier = useQualityTier();

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from("[data-hero-rise]", { y: 26, opacity: 0, duration: 0.8, stagger: 0.09, ease: "power3.out" });
  }, { scope: ref });

  return (
    <section ref={ref} id="home" className={styles.hero}>
      <div className={styles.scene} aria-hidden="true">
        {tier === "off" ? <div className={styles.poster} /> : <HeroScene tier={tier} />}
      </div>
      <div className={styles.inner}>
        <p data-hero-rise className={styles.eyebrow}>Independent systems builder · Los Angeles</p>
        <h1 data-hero-rise className={styles.title}>
          I build intelligent systems <em>for the real world.</em>
        </h1>
        <p data-hero-rise className={styles.subtext}>
          Real-time AI, agent infrastructure, and operational products. Built to run past the prototype.
        </p>
        <div data-hero-rise className={styles.actions}>
          <Button href="#work" variant="primary">View systems →</Button>
          <Button href="#contact" variant="ghost">Contact</Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: CSS** — `HeroSection.module.css`:
```css
.hero { position: relative; min-height: 100dvh; display: grid; align-items: center;
  padding: clamp(6rem, 9vw, 7.5rem) var(--page-gutter) clamp(4rem, 7vw, 6rem); overflow: clip; }
.scene { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.poster { position: absolute; inset: 0;
  background: radial-gradient(130% 100% at 78% 22%, rgba(201,184,160,0.10), transparent 52%), var(--canvas); }
.inner { position: relative; z-index: 1; width: min(100%, var(--page-width)); margin: 0 auto; max-width: 62ch; }
.eyebrow { margin: 0; font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--sand); }
.title { margin: 1.4rem 0 0; color: var(--paper); font-family: var(--font-sans);
  font-size: clamp(2.6rem, 6.4vw, 5.6rem); font-weight: 600; line-height: 0.98; letter-spacing: -0.04em; }
.title em { font-family: var(--font-editorial); font-style: italic; font-weight: 500;
  color: var(--sand); letter-spacing: -0.01em; line-height: 1.1; }
.subtext { max-width: 46ch; margin: 1.6rem 0 0; color: var(--steel);
  font-size: clamp(1rem, 1.4vw, 1.15rem); line-height: 1.55; }
.actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; }
@media (max-width: 640px) { .hero { min-height: auto; padding-top: 7rem; } }
```

- [ ] **Step 3: Verify** — `npx tsc --noEmit && npm run lint`. Run `npm run dev`, load `/`: confirm hero text renders, point field appears on desktop, and with DevTools "Emulate prefers-reduced-motion" the poster shows and no animation runs.
- [ ] **Step 4: Commit**
```bash
git add components/home/HeroSection.tsx components/home/HeroSection.module.css
git commit -m "feat(home): rebuild hero as 3D entrance with static fallback, remove fake preview"
```

---

## Task 7: Chapter data + ChapterIndex section

**Files:** Create `components/home/chapters.ts`, `components/home/ChapterIndex.tsx`, `components/home/ChapterIndex.module.css`

- [ ] **Step 1: Data** — `components/home/chapters.ts`:
```ts
export interface Chapter {
  no: string; title: string; href: string; blurb: string; tags: string[]; layout: "feature" | "flip" | "band" | "strip";
}
export const chapters: Chapter[] = [
  { no: "01", title: "KOTA", href: "/projects/kota", layout: "feature",
    blurb: "A voice-first AI system that answers restaurant phone calls and turns them into structured, kitchen-ready orders.",
    tags: ["real-time voice", "LLM orchestration", "production"] },
  { no: "02", title: "ARCHON", href: "/systems/archon", layout: "flip",
    blurb: "A personal AI orchestration layer. Agents, tools, memory, and model routing coordinated into one inspectable system.",
    tags: ["agents", "orchestration", "active R&D"] },
  { no: "03", title: "Market Systems", href: "/markets", layout: "band",
    blurb: "Decision architecture under uncertainty. Treating markets as a real-time system of risk, latency, and feedback.",
    tags: ["research", "risk", "execution"] },
  { no: "04", title: "Experiments & Visual", href: "/gallery", layout: "strip",
    blurb: "Interactive web, 3D, and photography. Visual research that feeds how I design systems and interfaces.",
    tags: ["3D", "photography", "interface"] },
];
```

- [ ] **Step 2: Component** — header + four rows, each rendering a distinct layout family. Uses IntersectionObserver reveal (reuse the pattern in current `Projects.tsx`).
```tsx
"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import SectionHeader from "@/components/system/SectionHeader";
import SystemViz from "@/components/system/SystemViz";
import { chapters } from "./chapters";
import styles from "./ChapterIndex.module.css";

export default function ChapterIndex() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = ref.current; if (!root) return;
    const els = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((e) => e.classList.add(styles.shown)); return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add(styles.shown); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((e) => io.observe(e)); return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="work" className={styles.section}>
      <SectionHeader eyebrow="Selected work" title="The systems I am building." />
      <div className={styles.rows}>
        {chapters.map((c) => (
          <article key={c.no} data-reveal className={`${styles.row} ${styles[c.layout]}`}>
            <div className={styles.copy}>
              <span className={styles.no}>{c.no}</span>
              <h3 className={styles.title}>{c.title}</h3>
              <p className={styles.blurb}>{c.blurb}</p>
              <ul className={styles.tags}>{c.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              <Link href={c.href} className={styles.link}>
                {c.layout === "strip" ? "View studies →" : "Enter chapter →"}
              </Link>
            </div>
            {c.layout !== "strip"
              ? <SystemViz label={`${c.no} / ${c.title}`} live={c.no === "01"} className={styles.viz}>
                  <div className={styles.vizPlaceholder} aria-hidden="true" />
                </SystemViz>
              : <div className={styles.strip} aria-hidden="true">
                  {[0,1,2,3].map((i) => <div key={i} className={styles.thumb} />)}
                </div>}
          </article>
        ))}
      </div>
    </section>
  );
}
```
Note: `vizPlaceholder` is a deliberate, on-system signature-visual placeholder for 1A (a real lightweight viz per chapter is a small follow-up; the full immersive scenes are 1B+). It must NOT look like a fake dashboard: it is an abstract field, not labeled fake data.

- [ ] **Step 3: CSS** — `ChapterIndex.module.css` (exact layout families):
```css
.section { width: min(100%, var(--page-width)); margin: 0 auto;
  padding: clamp(6rem, 10vw, 10rem) var(--page-gutter); border-top: 1px solid var(--line); }
.rows { display: grid; gap: 1.25rem; margin-top: clamp(3rem, 6vw, 5rem); }
.row { border: 1px solid var(--line); border-radius: var(--radius-card); background: var(--surface);
  overflow: hidden; opacity: 0; transform: translateY(34px);
  transition: opacity 0.7s var(--ease), transform 0.8s var(--ease), border-color 0.18s ease; }
.row.shown { opacity: 1; transform: none; }
.row:hover { border-color: rgba(192,106,92,0.4); }
.copy { display: flex; flex-direction: column; gap: 0.9rem; padding: clamp(1.5rem, 3vw, 2.8rem); }
.no { font-family: var(--font-mono); font-size: 0.8rem; color: var(--signal); }
.title { margin: 0; font-family: var(--font-sans); font-weight: 600; letter-spacing: -0.03em;
  font-size: clamp(2rem, 3.6vw, 3.6rem); line-height: 0.96; color: var(--paper); }
.blurb { margin: 0; max-width: 52ch; color: var(--steel); font-size: 0.96rem; line-height: 1.7; }
.tags { display: flex; flex-wrap: wrap; gap: 0.5rem; list-style: none; margin: 0; padding: 0; }
.tags li { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--sand); border: 1px solid var(--line); border-radius: 5px; padding: 4px 8px; }
.link { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--signal); text-decoration: none; margin-top: 0.4rem; }
.viz { min-height: 280px; }
.vizPlaceholder { height: 100%; min-height: 220px;
  background: radial-gradient(80% 80% at 70% 30%, rgba(201,184,160,0.14), transparent 60%); }
/* layout families */
.feature { display: grid; grid-template-columns: minmax(320px, 0.8fr) minmax(0, 1.2fr); }
.flip { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr); }
.flip .copy { order: 2; } .flip .viz { order: 1; }
.band { display: block; }
.band .viz { border-radius: 0; border-left: none; border-right: none; min-height: 200px; }
.strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6rem; padding: clamp(1.5rem, 3vw, 2.8rem); }
.thumb { aspect-ratio: 1; border-radius: 8px; background: var(--raised); border: 1px solid var(--line); }
@media (max-width: 860px) {
  .feature, .flip { grid-template-columns: 1fr; }
  .flip .copy { order: 1; } .flip .viz { order: 2; }
  .strip { grid-template-columns: repeat(2, 1fr); }
}
```

- [ ] **Step 4: Verify** — `npx tsc --noEmit && npm run lint`. In dev, confirm four rows with visibly different layouts and reveal-on-scroll; reduced-motion shows all immediately.
- [ ] **Step 5: Commit**
```bash
git add components/home/chapters.ts components/home/ChapterIndex.tsx components/home/ChapterIndex.module.css
git commit -m "feat(home): chapter index with four distinct layout families"
```

---

## Task 8: PositioningBand ("What I am")

**Files:** Create `components/home/PositioningBand.tsx`, `.module.css`

- [ ] **Step 1: Component**
```tsx
import styles from "./PositioningBand.module.css";
const disciplines = ["AI systems", "real-time voice", "product engineering", "agent orchestration", "markets", "visual practice"];
export default function PositioningBand() {
  return (
    <section className={styles.band}>
      <p className={styles.statement}>
        Not one label. Across AI systems, real-time voice, product engineering, markets, and visual design,
        the through-line is the same: building structure for complex systems.
      </p>
      <ul className={styles.tags}>{disciplines.map((d) => <li key={d}>{d}</li>)}</ul>
    </section>
  );
}
```
- [ ] **Step 2: CSS**
```css
.band { width: min(100%, var(--page-width)); margin: 0 auto;
  padding: clamp(4.5rem, 8vw, 7rem) var(--page-gutter); border-top: 1px solid var(--line); }
.statement { margin: 0; max-width: 26ch; color: var(--paper); font-family: var(--font-sans);
  font-weight: 500; font-size: clamp(1.8rem, 4vw, 3.4rem); line-height: 1.08; letter-spacing: -0.03em; }
.statement { max-width: 22ch; }
.tags { display: flex; flex-wrap: wrap; gap: 0.6rem; list-style: none; margin: 2rem 0 0; padding: 0; }
.tags li { font-family: var(--font-mono); font-size: 0.64rem; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--sand); border: 1px solid var(--line); border-radius: 6px; padding: 5px 10px; }
```
- [ ] **Step 3: Verify** — `npx tsc --noEmit`. - [ ] **Step 4: Commit** `git add components/home/PositioningBand.* && git commit -m "feat(home): positioning band"`

---

## Task 9: PhilosophySection (centered manifesto)

**Files:** Create `components/home/PhilosophySection.tsx`, `.module.css`

- [ ] **Step 1: Component**
```tsx
import styles from "./PhilosophySection.module.css";
const principles = [
  { k: "Structure over willpower.", v: "Reliable outcomes come from architecture and feedback loops, not motivation." },
  { k: "Autonomy.", v: "Building toward control over what I work on and how." },
  { k: "Systems before labels.", v: "The work is studying complex systems and building tools to operate inside them." },
];
export default function PhilosophySection() {
  return (
    <section id="philosophy" className={styles.section}>
      <ul className={styles.list}>
        {principles.map((p) => (
          <li key={p.k}><em className={styles.k}>{p.k}</em><span className={styles.v}>{p.v}</span></li>
        ))}
      </ul>
    </section>
  );
}
```
- [ ] **Step 2: CSS**
```css
.section { width: min(100%, var(--page-width)); margin: 0 auto;
  padding: clamp(6rem, 11vw, 11rem) var(--page-gutter); border-top: 1px solid var(--line);
  display: flex; justify-content: center; }
.list { list-style: none; margin: 0; padding: 0; max-width: 60ch; display: grid; gap: clamp(2rem, 4vw, 3.2rem); text-align: center; }
.list li { display: grid; gap: 0.6rem; }
.k { font-family: var(--font-editorial); font-style: italic; font-weight: 500;
  font-size: clamp(1.8rem, 3.6vw, 3rem); color: var(--sand); line-height: 1.12; }
.v { color: var(--steel); font-size: 1rem; line-height: 1.6; max-width: 48ch; margin: 0 auto; }
```
- [ ] **Step 3: Verify** — `npx tsc --noEmit`. - [ ] **Step 4: Commit** `git add components/home/PhilosophySection.* && git commit -m "feat(home): operating philosophy section"`

---

## Task 10: Simplify ContactSection to the new system

**Files:** Modify `components/home/ContactSection.tsx`, `components/home/ContactSection.module.css`

- [ ] **Step 1:** Keep the existing form + mailto logic (static-export safe) and reduced-motion reveal, but: update copy to spec, use `Button` for the submit, ensure one contact intent, no em-dashes. Replace heading with `Building something difficult? Let's examine the system.` and description `For founders, technical leaders, and collaborators. Tell me the problem and the constraint.` Recolor accents to `--signal`/`--sand` per token rules (form focus ring uses `--signal`). Replace the `-&gt;` text arrows with `→`.
- [ ] **Step 2: Verify** — `npx tsc --noEmit && npm run lint`. Submit the form in dev; confirm mailto opens.
- [ ] **Step 3: Commit** `git add components/home/ContactSection.* && git commit -m "feat(home): contact section copy + Atlas tokens"`

---

## Task 11: Compose the home + remove old sections

**Files:** Modify `components/Home.tsx`, `app/page.tsx` (already minimal)

- [ ] **Step 1:** Rewrite `components/Home.tsx`:
```tsx
import HeroSection from "./home/HeroSection";
import PositioningBand from "./home/PositioningBand";
import ChapterIndex from "./home/ChapterIndex";
import PhilosophySection from "./home/PhilosophySection";
import ContactSection from "./home/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <PositioningBand />
      <ChapterIndex />
      <PhilosophySection />
      <ContactSection />
    </>
  );
}
```
This stops importing `ProjectsSection`, `SkillsSection`, `HomeEditorialSections` (removed/retired in Task 13). Remove `getSortedPostsData` usage from Home (blog returns in Phase 3).

- [ ] **Step 2: Verify** — `npm run build` (full static export). Expected: completes; `/` renders all five components.
- [ ] **Step 3: Commit** `git add components/Home.tsx app/page.tsx && git commit -m "feat(home): compose entrance from new sections"`

---

## Task 12: Navigation + Footer update

**Files:** Modify `components/Navigation.tsx`, `styles/navigation.module.css`, `components/Footer.tsx`, `styles/footer.module.css`

- [ ] **Step 1: Nav** — set `navLinks` to: `{name:"Work", href:"#work"}`, `{name:"ARCHON", href:"/systems/archon"}`, `{name:"Markets", href:"/markets"}`, `{name:"Studies", href:"/gallery"}`, `{name:"Contact", href:"#contact"}`. Update `homeSectionIds` to `["home","work","philosophy","contact"]`. Logo meta text → `Independent systems builder`. In CSS, ensure the active/hover underline and the Contact link use `--signal`; confirm height stays ≤72px (current 78px → set to 72px).
- [ ] **Step 2: Footer** — tagline stays `AI systems made operational.`; Navigate links use the same targets as nav (Work/ARCHON/Markets/Studies); bottom descriptor `AI systems / product engineering / visual practice`. No changes that add em-dashes.
- [ ] **Step 3: Verify** — `npx tsc --noEmit && npm run lint`. In dev, nav is one line at ≥1024px; "Work" scrolls to chapter index; Contact is red.
- [ ] **Step 4: Commit** `git add components/Navigation.tsx styles/navigation.module.css components/Footer.tsx styles/footer.module.css && git commit -m "feat(chrome): nav + footer reflect chapter world"`

---

## Task 13: Stub routes, /projects redirect, and cleanup

**Files:** Create `app/systems/archon/page.tsx`, `app/markets/page.tsx`; modify `app/projects/page.tsx`; delete orphans; fix stories imports + css comment.

- [ ] **Step 1: Stub pages** — minimal on-system pages so nav links are not dead. `app/systems/archon/page.tsx`:
```tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "ARCHON" };
export default function ArchonPage() {
  return (
    <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "8rem 1.5rem" }}>
      <div style={{ maxWidth: "44ch", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sand)" }}>02 / ARCHON</p>
        <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "clamp(2rem,5vw,3.4rem)", letterSpacing: "-0.03em", color: "var(--paper)", margin: "1rem 0" }}>Personal AI orchestration.</h1>
        <p style={{ color: "var(--steel)", lineHeight: 1.7 }}>The full chapter is in development. Agents, tools, memory, and model routing in one inspectable system.</p>
      </div>
    </main>
  );
}
```
Create `app/markets/page.tsx` with the same shape (`03 / Market Systems`, title "Decision architecture under uncertainty.", in-development line).

- [ ] **Step 2: /projects redirect** — replace `app/projects/page.tsx` with:
```tsx
import { redirect } from "next/navigation";
export default function ProjectsPage() { redirect("/#work"); }
```
(If static export rejects runtime `redirect`, instead render a client component that `useEffect`s `window.location.replace("/#work")` plus a `<noscript>`/link fallback. Verify in Step 5.)

- [ ] **Step 3: Delete orphans** —
```bash
git rm components/home/AboutSection.tsx components/home/AboutSection.module.css \
       components/home/TextTunnelTransition.tsx components/home/TextTunnelTransition.module.css \
       components/home/CuboidsSection.tsx
```
Also retire the old home sections no longer imported: `git rm components/home/ProjectsSection.tsx components/home/SkillsSection.tsx components/home/SkillsSection.module.css components/home/HomeEditorialSections.tsx components/home/HomeEditorialSections.module.css`. Keep `components/Projects.tsx` only if `/projects/[slug]` or other routes still use it; otherwise remove its fake visuals. Grep first: `grep -rn "components/Projects\"" app components`.

- [ ] **Step 4: Fix stories + css comment** — remove unused `Navigation`/`FloatingBackButton` imports in `app/stories/page.tsx`. In `styles/projectDetail.module.css` line 1, replace the em-dash in the comment with a hyphen.

- [ ] **Step 5: Verify** — `npx tsc --noEmit && npm run lint && npm run build`. Confirm: build green, static export emits `/systems/archon`, `/markets`, `/projects` behaves (redirect or client replace), no broken imports.
- [ ] **Step 6: Commit** `git add -A && git commit -m "chore: stub chapter routes, /projects redirect, remove fake-UI and orphaned components"`

---

## Task 14: Pre-flight QA sweep

**Files:** none (verification only); fix inline if anything fails.

- [ ] **Step 1: Em-dash scan** — `grep -rn "—" app components | grep -v node_modules` → expected: zero results. Fix any hit.
- [ ] **Step 2: Eyebrow count** — confirm only the hero eyebrow and the chapter-index "Selected work" eyebrow exist on the home (≤2). Grep usages of `Eyebrow` and `.eyebrow`.
- [ ] **Step 3: Build + types + lint** — `npx tsc --noEmit && npm run lint && npm run build`. All clean.
- [ ] **Step 4: Manual checks** in `npm run dev` at `/`:
  - Hero fits one viewport at 1440×900; CTA visible without scroll.
  - Eight sections, eight visibly distinct layouts; no fake dashboards.
  - Reduced-motion (DevTools emulate): poster instead of canvas, no animations, all content visible.
  - WebGL-off (disable in DevTools / about:flags): poster shows, layout intact.
  - Mobile width 390px: every section single-column, nav collapses to hamburger.
  - Contrast: muted-red button text and ghost button readable; form fields legible.
- [ ] **Step 5: Commit** any fixes: `git add -A && git commit -m "fix: phase 1A pre-flight QA"`

---

## Self-review notes (author)
- Spec §3 tokens → Task 1. §3.6 components → Tasks 2-3. §4 hybrid-3D → Tasks 4-6. §5 IA → Tasks 6-11. §6 hero → Task 6. §7 copy → Tasks 6-10. §8 nav/footer → Task 12. §9 file arch → all. §11 perf/a11y → Tasks 5,6,14. Cleanup §9 → Task 13. Success criteria §12 → Task 14.
- Naming consistency: `useQualityTier`/`Tier`/`resolveTier`, `HeroScene`, `SystemViz`, `chapters`, `#work` anchor used consistently across tasks.
- Known follow-ups (not Phase 1A): real per-chapter signature visuals beyond the abstract placeholder; KOTA full case study (1B).
```
