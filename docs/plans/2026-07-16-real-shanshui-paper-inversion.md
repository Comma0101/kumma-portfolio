# Real Shanshui — Paper Inversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Invert the homepage from dark-on-black to ink-on-paper — scene ground, fog, materials, lighting, CSS backdrop, and foreground UI — with an in-repo capture harness that gates every later phase.

**Architecture:** First milestone of `docs/plans/2026-07-16-real-shanshui-ink-rendering-design.md` (Phases 0–1). A pure palette module (`inkLadder.ts`) becomes the single source of truth; scene and CSS consume it. The capture harness (Playwright + pngjs) asserts paper coverage and renderer budgets from the mount element's existing `data-*` diagnostics. Ink shaders, ridge geometry, and zone composition work are LATER plans — this plan changes values only, no geometry, no shaders, no scroll/narrative architecture.

**Tech Stack:** Next.js static export, Three.js (MeshStandard/MeshToon), custom `node scripts/run-unit-tests.mjs` suite, playwright-core + pngjs (dev-only).

## Global Constraints

- Renderer budgets (from 2026-07-13 QA): desktop ≤45 draw calls, constrained ≤32, mobile ≤22, reduced motion ≤20. Homepage first-load JS ≤332 kB.
- Palette constants (exact, from the design doc): PAPER `#f0ead9`, JIAO `#1c201a`, NONG `#2e332b`, ZHONG `#47503f`, DAN `#75806a`, QING `#a9b09a`, MINERAL `#6d8a7a`, OCHRE `#a98a5e`, CINNABAR `#9f4435`.
- Inversion scope: **homepage only**. Project/blog/call pages stay dark. All CSS inversion lives under `body[data-theme="paper"]`; `styles/projects.module.css` is not touched.
- No new runtime dependencies. `playwright-core` and `pngjs` are devDependencies used only by `scripts/capture-journey.mjs`.
- Motion contract, narrative event windows, camera path, zone geometry, profile selector: untouched.
- Clear color keeps alpha 0 — transparent canvas regions (water, mist) composite over the CSS paper ground; fog colors must equal PAPER exactly so faded geometry matches the page.
- QA artifacts live outside the repo at `~/kumma-qa/` (the old `/tmp` artifacts were lost; never use `/tmp` for artifacts).
- Commit per task on `feature/carved-systems-facility`. Work happens in `/tmp/kumma-portfolio-carved-facility`; dev server on port 4242.

---

### Task 1: Ink ladder palette module

**Files:**
- Create: `components/immersive/facility/ink/inkLadder.ts`
- Test: `components/immersive/facility/ink/inkLadder.test.ts`

**Interfaces:**
- Consumes: nothing (pure module).
- Produces: `INK.paper/jiao/nong/zhong/dan/qing`, `ACCENTS.mineral/ochre/cinnabar`, `EARTHS.paperStone/stone/pine/water`, `INK_LADDER: string[]`, `relativeLuminance(hex: string): number`. Tasks 3–4 import these; later phases (ink shaders) consume the same constants.

- [ ] **Step 1: Write the failing test**

The repo's test format is `node:test` with `assert/strict` (see `components/uxPolishCss.test.ts`):

```ts
// components/immersive/facility/ink/inkLadder.test.ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { INK, ACCENTS, EARTHS, INK_LADDER, relativeLuminance } from "./inkLadder";

describe("inkLadder", () => {
  it("matches the approved palette", () => {
    assert.equal(INK.paper, "#f0ead9");
    assert.equal(INK.jiao, "#1c201a");
    assert.equal(INK.nong, "#2e332b");
    assert.equal(INK.zhong, "#47503f");
    assert.equal(INK.dan, "#75806a");
    assert.equal(INK.qing, "#a9b09a");
    assert.equal(ACCENTS.mineral, "#6d8a7a");
    assert.equal(ACCENTS.ochre, "#a98a5e");
    assert.equal(ACCENTS.cinnabar, "#9f4435");
  });

  it("ink ladder is five values, strictly monotone in luminance", () => {
    assert.equal(INK_LADDER.length, 5);
    const values = INK_LADDER.map(relativeLuminance);
    for (let i = 1; i < values.length; i += 1) {
      assert.ok(values[i] > values[i - 1], `not monotone at ${i}`);
    }
  });

  it("relativeLuminance bounds and ordering", () => {
    assert.equal(relativeLuminance("#000000"), 0);
    assert.equal(relativeLuminance("#ffffff"), 1);
    assert.ok(relativeLuminance(INK.paper) > relativeLuminance(INK.qing));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — module `./inkLadder` does not exist (import error in the new test file).

- [ ] **Step 3: Write the implementation**

```ts
// components/immersive/facility/ink/inkLadder.ts
/**
 * Real-shanshui palette — single source of truth.
 * Design: docs/plans/2026-07-16-real-shanshui-ink-rendering-design.md
 * Five-ink ladder (jiao/nong/zhong/dan/qing) on one charcoal-green hue;
 * paper is the ground, ink is the mark.
 */
export const INK = Object.freeze({
  paper: "#f0ead9",
  jiao: "#1c201a",
  nong: "#2e332b",
  zhong: "#47503f",
  dan: "#75806a",
  qing: "#a9b09a",
});

export const ACCENTS = Object.freeze({
  mineral: "#6d8a7a",
  ochre: "#a98a5e",
  cinnabar: "#9f4435",
});

/** Earth secondary tones used by scene materials (not UI). */
export const EARTHS = Object.freeze({
  paperStone: "#cfc9b4",
  stone: "#8f8a76",
  pine: "#2c3a2c",
  water: "#a7b5a8",
});

/** Darkest to lightest — the classical five ink values. */
export const INK_LADDER: readonly string[] = Object.freeze([
  INK.jiao,
  INK.nong,
  INK.zhong,
  INK.dan,
  INK.qing,
]);

/** sRGB relative luminance (WCAG formula), 0..1. */
export function relativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = channel((n >> 16) & 0xff);
  const g = channel((n >> 8) & 0xff);
  const b = channel(n & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 359 prior tests + 4 new, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add components/immersive/facility/ink/inkLadder.ts components/immersive/facility/ink/inkLadder.test.ts
git commit -m "feat: add shanshui ink ladder palette module"
```

---

### Task 2: Journey capture harness with paper-coverage and budget gates

**Files:**
- Create: `scripts/capture-journey.mjs`
- Modify: `package.json` (devDependencies + script entry)

**Interfaces:**
- Consumes: the running dev server (`http://localhost:4242/`, override via `CAPTURE_URL`); the scene mount element's existing diagnostics (`data-route-progress`, `data-render-calls`, `data-render-triangles`, `data-frame-state`, `data-scene-profile`, `data-renderer-class` — set in `components/ThreeScene.tsx:157-266,481-483`); Chromium from `PLAYWRIGHT_CHROMIUM_PATH` or the newest `~/.cache/ms-playwright/chromium-*/chrome-linux*/chrome`.
- Produces: PNGs + `report.json` under `~/kumma-qa/shots-<label>/`; exit code 1 if any gate fails. Used by Task 5 and every later phase.

- [ ] **Step 1: Add devDependencies and the npm script**

```bash
npm install --save-dev playwright-core pngjs
```

In `package.json` scripts, add:

```json
"capture": "node scripts/capture-journey.mjs"
```

- [ ] **Step 2: Write the harness**

```js
// scripts/capture-journey.mjs
// Visual QA harness for the shanshui journey.
// Usage: node scripts/capture-journey.mjs [--label NAME] [--scene-only] [--gate phase1|final|none]
import { chromium } from "playwright-core";
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const LABEL = opt("label", "latest");
const GATE = opt("gate", "phase1");
const SCENE_ONLY = args.includes("--scene-only");
const URL = process.env.CAPTURE_URL || "http://localhost:4242/";
const OUT = path.join(os.homedir(), "kumma-qa", `shots-${LABEL}`);
fs.mkdirSync(OUT, { recursive: true });

const BUDGET = { desktop: 45, constrained: 32, mobile: 22, reduced: 20 };
const COVERAGE = {
  // fraction of pixels with perceived luminance >= 140 ("paper or light ink")
  phase1: { hero: 0.4, typical: 0.5, dense: 0.45 },
  final: { hero: 0.5, typical: 0.65, dense: 0.55 },
};
const DENSE_STOPS = new Set(["04-kota", "06-orchestration"]);
const STOPS = [
  ["00-top", 0.0], ["01-hero", 0.04], ["02-approach", 0.165],
  ["03-threshold", 0.265], ["04-kota", 0.37], ["05-document", 0.49],
  ["06-orchestration", 0.61], ["07-dissolution", 0.73],
  ["08-calibration", 0.845], ["09-contact", 1.0],
];

function resolveChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  const root = path.join(os.homedir(), ".cache", "ms-playwright");
  const candidates = fs.readdirSync(root)
    .filter((d) => d.startsWith("chromium-") && !d.includes("headless"))
    .sort().reverse();
  for (const dir of candidates) {
    for (const sub of ["chrome-linux64", "chrome-linux"]) {
      const exe = path.join(root, dir, sub, "chrome");
      if (fs.existsSync(exe)) return exe;
    }
  }
  throw new Error("No cached Chromium found; set PLAYWRIGHT_CHROMIUM_PATH");
}

function paperCoverage(png) {
  let light = 0;
  const total = png.width * png.height;
  for (let i = 0; i < png.data.length; i += 4) {
    const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (lum >= 140) light += 1;
  }
  return light / total;
}

const browser = await chromium.launch({
  executablePath: resolveChromium(),
  headless: true,
  args: ["--disable-dev-shm-usage", "--hide-scrollbars"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (e) => console.log("[pageerror]", String(e).slice(0, 300)));
await page.goto(URL, { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(5000);

if (SCENE_ONLY) {
  await page.addStyleTag({
    content: `body > *:not(:has(canvas)) { visibility: hidden !important; }`,
  });
}

const mount = page.locator("[data-route-progress]").first();
const report = [];
let failures = 0;

for (const [name, f] of STOPS) {
  await page.evaluate((frac) => {
    const el = document.documentElement;
    window.scrollTo(0, Math.round(frac * (el.scrollHeight - innerHeight)));
  }, f);
  await page.waitForTimeout(1600);
  const diag = await mount.evaluate((el) => ({ ...el.dataset }));
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  const png = PNG.sync.read(fs.readFileSync(file));
  const coverage = paperCoverage(png);
  const profile = diag.sceneProfile || "desktop";
  const calls = Number(diag.renderCalls || 0);
  const budget = BUDGET[profile] ?? BUDGET.desktop;
  const gateSet = COVERAGE[GATE] || null;
  const covTarget = gateSet
    ? (name === "01-hero" ? gateSet.hero : DENSE_STOPS.has(name) ? gateSet.dense : gateSet.typical)
    : 0;
  const callOk = calls <= budget;
  const covOk = !gateSet || coverage >= covTarget;
  if (!callOk || !covOk) failures += 1;
  report.push({
    stop: name, route: diag.routeProgress, profile, calls, budget,
    callOk, coverage: Number(coverage.toFixed(3)), covTarget, covOk,
    frameState: diag.frameState, file: path.basename(file),
  });
  console.log(
    `${name} calls=${calls}/${budget}${callOk ? "" : " OVER"} ` +
    `paper=${(coverage * 100).toFixed(1)}%/${(covTarget * 100).toFixed(0)}%${covOk ? "" : " UNDER"} ` +
    `state=${diag.frameState}`,
  );
}

fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
await browser.close();
console.log(`\n${failures === 0 ? "GATES PASS" : `${failures} GATE FAILURES`} -> ${OUT}`);
process.exit(failures === 0 ? 0 : 1);
```

- [ ] **Step 3: Verify the harness runs (no gate)**

Ensure the dev server is running (`npm run dev`, port 4242). Then:

Run: `node scripts/capture-journey.mjs --label harness-check --gate none`
Expected: prints 10 stop lines with `calls=N/M` and `paper=X%`, ends `GATES PASS -> ~/kumma-qa/shots-harness-check`. All `calls` values ≤ budget for the reported profile.

- [ ] **Step 4: Commit**

```bash
git add scripts/capture-journey.mjs package.json package-lock.json
git commit -m "test: add journey capture harness with paper and budget gates"
```

---

### Task 3: Scene inversion — materials, fog, lighting, backdrop

**Files:**
- Modify: `components/immersive/facility/materials.ts` (full revalue)
- Modify: `components/immersive/facility/narrative.ts:22-78` (eight `fogColor` values)
- Modify: `components/immersive/facility/createFacilityWorld.ts:104-109` (lighting rig)
- Modify: `components/ThreeScene.tsx:271` (clear color)
- Modify: `styles/home.module.css:32-54,106,114` (CSS backdrop + text colors)
- Test: update palette assertions in `components/immersive/scrollProgress.test.ts` and `components/immersive/facility/terrain.test.ts` (the only test files referencing the old dark values)

**Interfaces:**
- Consumes: `INK`, `ACCENTS`, `EARTHS` from `./ink/inkLadder` (Task 1).
- Produces: scene renders on paper; tests import palette from `inkLadder` (no hardcoded hex drift). Later ink-shader phases replace these stock materials entirely.

- [ ] **Step 1: Update palette-asserting tests to reference inkLadder (red)**

In `components/immersive/scrollProgress.test.ts` and `components/immersive/facility/terrain.test.ts`, find the assertions referencing old dark values (`grep -n "0a0a0b\|0c1211\|101817\|171f1c\|3c6851\|332d31\|435149" <file>`) and change them to import from the ink module — `./facility/ink/inkLadder` from `scrollProgress.test.ts`, `./ink/inkLadder` from `terrain.test.ts`. Fog assertions become:

```ts
import { INK } from "./ink/inkLadder"; // terrain.test.ts path; scrollProgress uses ./facility/ink/inkLadder
// fog assertions become:
assert.equal(sample.atmosphere.fogColor, INK.paper, "fog must be paper");
```

Run: `npm test`
Expected: FAIL — fog colors and material hexes still hold old dark values.

- [ ] **Step 2: Revalue narrative fog to paper (green)**

In `components/immersive/facility/narrative.ts`, replace all eight zone `fogColor` values (lines 22–78: `#0c1211`, `#101817`, `#16211e`, `#202219`, `#111b19`, `#252027`, `#1c2824`, `#38443c`) with `INK.paper` — add `import { INK } from "./ink/inkLadder";` at the top and use `fogColor: INK.paper`. Keep every `fogDensity` and `exposure` value unchanged.

Also run `grep -nE "#[0-9a-fA-F]{6}" components/immersive/facility/narrative.ts` — revalue any remaining dark hex constants to the inkLadder scale (rule: anything intended as "unpainted paper/mist" → `INK.paper`; dark accents → `INK.nong`/`INK.zhong`).

- [ ] **Step 3: Revalue materials to ink-on-paper**

Rewrite the `materials` object in `components/immersive/facility/materials.ts` (add `import { INK, ACCENTS, EARTHS } from "./ink/inkLadder";`):

```ts
const materials: FacilityMaterials = Object.freeze({
  terrain: material(EARTHS.paperStone, 0.98, 0.01),
  shell: material("#bdb6a0", 0.96, 0.01),
  steel: material(INK.zhong, 0.9, 0.03),
  paper: material(INK.paper, 0.94, 0.01),
  signal: material(ACCENTS.mineral, 0.82, 0.02, {
    emissive: "#3d5445",
    emissiveIntensity: 0.12,
  }),
  ink: material(INK.jiao, 0.97, 0.01),
  guide: material(INK.dan, 0.92, 0.01),
  mountain: inkValueMaterial(INK.zhong),
  stone: inkValueMaterial(EARTHS.stone),
  bamboo: inkValueMaterial(EARTHS.pine, { side: THREE.DoubleSide }),
  water: material(EARTHS.water, 0.9, 0.03, {
    emissive: "#000000",
    emissiveIntensity: 0,
  }),
  cinnabar: material(ACCENTS.cinnabar, 0.78, 0.02, {
    emissive: "#2f0f0a",
    emissiveIntensity: 0.1,
  }),
});
```

- [ ] **Step 4: Retune the lighting rig for a paper world**

In `components/immersive/facility/createFacilityWorld.ts:104-109`:

```ts
const hemisphere = new THREE.HemisphereLight(0xf5efe0, 0x8f8a76, 1.45);
const key = new THREE.DirectionalLight(0xfff6e2, 1.55);
const mineralFill = new THREE.DirectionalLight(0x9db4a8, 0.5);
```

Keep each light's position/aim unchanged. Tone mapping stays ACESFilmic (the Phase-2 ink materials replace this shading model entirely).

- [ ] **Step 5: Clear color and CSS backdrop**

In `components/ThreeScene.tsx:271`, change `renderer.setClearColor(0x0a0a0b, 0);` to:

```ts
renderer.setClearColor(0xf0ead9, 0); // alpha 0: transparent regions composite over the CSS paper ground
```

Note on layering (verified 2026-07-16): in normal WebGL-ready rendering the page ground is `body { background: var(--canvas) }`, which Task 4 flips to paper. The `.immersiveScene::before/::after` layers are **only visible in the WebGL-unavailable fallback** (`[data-webgl-state="ready"]` sets their opacity to 0; `unavailable` shows them at 0.82/0.38). Editing them = the spec's fallback restyle.

In `styles/home.module.css`, replace:
- line 32 `rgba(63, 157, 127, 0.14)` → `rgba(109, 138, 122, 0.1)`
- line 37 `rgba(163, 181, 168, 0.1)` → `rgba(169, 138, 94, 0.08)`
- line 40 `linear-gradient(150deg, #0a0a0b 12%, #101719 58%, #0a0a0b 100%)` → `linear-gradient(150deg, #f0ead9 12%, #e9e1cc 58%, #f0ead9 100%)`
- line 48 `rgba(240, 237, 232, 0.055)` → `rgba(42, 44, 40, 0.06)` (pale grain becomes ink fleck)
- **do NOT touch lines 53–54** — those `#000`/`rgba(0,0,0,0.68)` values are the `mask-image` alpha channel, not visible color
- line 106 `color: rgba(163, 181, 168, 0.78);` → `color: rgba(71, 80, 63, 0.85);`
- line 114 `color: rgba(220, 220, 220, 0.85);` → `color: rgba(42, 44, 40, 0.88);`

- [ ] **Step 6: Run tests (green)**

Run: `npm test`
Expected: PASS — all tests including the updated palette assertions.

- [ ] **Step 7: Visual gate**

Run: `node scripts/capture-journey.mjs --label scene-inversion --gate phase1`
Expected: `GATES PASS`; every stop's `paper=` coverage at or above phase1 targets (hero ≥40%, typical ≥50%, dense ≥45%); draw calls unchanged (≤ profile budgets). Eyeball `~/kumma-qa/shots-scene-inversion/01-hero.png` — paper ground, no black voids, bamboo no longer neon.

- [ ] **Step 8: Commit**

```bash
git add components/immersive/facility/materials.ts components/immersive/facility/narrative.ts components/immersive/facility/createFacilityWorld.ts components/ThreeScene.tsx styles/home.module.css components/immersive/scrollProgress.test.ts components/immersive/facility/terrain.test.ts
git commit -m "feat: invert facility scene to ink on paper"
```

---

### Task 4: Foreground UI inversion (homepage only)

**Files:**
- Modify: `app/globals.css` (append paper-theme block; fix the inverted band)
- Modify: `app/layout.tsx` (default `data-theme="paper"` on `<body>`)
- Create: `components/BodyTheme.tsx` (client route sync)
- Modify: `app/layout.tsx` again (mount `BodyTheme`)
- Test: `components/home/paperTheme.test.ts`

**Interfaces:**
- Consumes: existing CSS variables (`--canvas`, `--paper`, `--foreground`, `--muted`, `--accent`, `--accent-strong` — defined in `app/globals.css:7-26` and consumed throughout homepage modules, which contain zero hardcoded hexes).
- Produces: `body[data-theme="paper"]` scope; `BodyTheme` keeps the attribute correct on client-side navigation (paper only on `/`).

- [ ] **Step 1: Write the failing CSS contract test**

```ts
// components/home/paperTheme.test.ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";

const readSrc = (file: string) =>
  fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

describe("paper theme", () => {
  it("globals defines the paper theme scope", () => {
    const globals = readSrc("app/globals.css");
    assert.ok(globals.includes('body[data-theme="paper"]'), "missing theme block");
    const block = globals.slice(globals.indexOf('body[data-theme="paper"]'));
    for (const token of ["color-scheme: light", "--canvas: #f0ead9", "--foreground: #2a2c28", "--accent: #9f4435"]) {
      assert.ok(block.includes(token), `paper theme missing ${token}`);
    }
  });

  it("layout defaults the homepage body to paper theme and mounts BodyTheme", () => {
    const layout = readSrc("app/layout.tsx");
    assert.ok(/<body[^>]*data-theme="paper"/.test(layout), "<body> must default to data-theme=\"paper\"");
    assert.ok(layout.includes("BodyTheme"), "layout must mount BodyTheme");
  });

  it("BodyTheme syncs the attribute per route", () => {
    const bodyTheme = readSrc("components/BodyTheme.tsx");
    for (const token of ['"use client"', "usePathname", "data-theme", 'pathname === "/"']) {
      assert.ok(bodyTheme.includes(token), `BodyTheme missing ${token}`);
    }
  });

  it("no dark scrim rgba values remain in home modules", () => {
    const files = [
      "components/home/HeroSection.module.css",
      "components/home/ChapterIndex.module.css",
      "components/home/ProofConsole.module.css",
      "components/home/CapabilitiesSection.module.css",
      "components/home/ContactSection.module.css",
      "components/home/LabsSection.module.css",
      "components/home/PhilosophySection.module.css",
      "components/home/PositioningBand.module.css",
      "components/home/ResearchProofSection.module.css",
    ];
    for (const file of files) {
      const css = readSrc(file);
      assert.ok(!css.includes("rgba(10, 10, 11"), `${file} still has dark scrim`);
    }
  });
});
```

Run: `npm test`
Expected: FAIL — no theme block in globals, no attr in layout, `components/BodyTheme.tsx` unreadable, dark scrims still present.

- [ ] **Step 2: Add the paper theme scope to globals.css**

Append to `app/globals.css`:

```css
/* Real shanshui paper inversion — homepage only (design: docs/plans/2026-07-16-real-shanshui-ink-rendering-design.md) */
body[data-theme="paper"] {
  color-scheme: light;
  --canvas: #f0ead9;
  --foreground: #2a2c28;
  --muted: #5a6053;
  --accent: #9f4435;
  --accent-strong: #8a3a2d;
}
```

Note `--paper` is deliberately NOT redefined (it remains the ivory primitive, used as a background in several places); text-on-paper usages must reference `--foreground`.

Then audit direct `--paper` usages:

Run: `grep -rn "var(--paper)" components/ app/ styles/ --include="*.css" --include="*.tsx"`
Rule: every `color: var(--paper)` (text) usage → replace with `color: var(--foreground)`; `background: var(--paper)` usages stay. After edits, `grep -rn "color: var(--paper)" components/ app/ styles/` must return zero matches.

The skip link pairs `background: var(--paper)` with `color: var(--canvas)` (`.skip-link` in `app/globals.css`, near line 90) and would go paper-on-paper under the theme; append this override below the theme block:

```css
body[data-theme="paper"] .skip-link {
  background: #2a2c28;
  color: #f0ead9;
}
```

Then convert dark scrims and signals in home modules. The chapter readability scrims are hardcoded dark rgba values (e.g. `rgba(10, 10, 11, 0.96)` in `HeroSection.module.css:18-19`, `ChapterIndex.module.css:25-26,59-61,288-290,323,344`). Apply this exact mapping across `components/home/*.module.css`:

| Find | Replace | Meaning |
| --- | --- | --- |
| `rgba(10, 10, 11, α)` | `rgba(240, 234, 217, α)` (same α) | dark scrim → paper-mist scrim |
| `rgba(0, 0, 0, α)` | `rgba(42, 44, 40, α)` (same α) | black shadow → ink shadow |
| `rgba(63, 157, 127, α)` | `rgba(159, 68, 53, α)` (same α) | green signal → cinnabar (active chapter mark, focus ring) |
| `rgba(240, 237, 232, α)` | `rgba(42, 44, 40, α)` (same α) | pale wash → ink wash |
| `rgba(212, 207, 184, α)` | `rgba(117, 128, 106, α)` (same α) | sand line → dan ink |

Audit command: `grep -rn "rgba(10, 10, 11\|rgba(0, 0, 0\|rgba(240, 237, 232\|rgba(63, 157, 127\|rgba(212, 207, 184" components/home/*.module.css`
Expected after edits: zero matches (and the paperTheme test's "no dark scrim" case passes).

- [ ] **Step 3: Default the homepage body to paper; sync per route**

In `app/layout.tsx`, add `data-theme="paper"` to the `<body>` tag (homepage is the landing page — defaulting to paper avoids a dark flash; client navigation corrects it).

Create `components/BodyTheme.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Keeps body[data-theme] in sync with the route: paper only on the homepage. */
export default function BodyTheme() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === "/") {
      document.body.setAttribute("data-theme", "paper");
    } else {
      document.body.removeAttribute("data-theme");
    }
  }, [pathname]);
  return null;
}
```

Mount `<BodyTheme />` as the first child inside `<body>` in `app/layout.tsx` (import it at the top).

- [ ] **Step 4: Run tests (green)**

Run: `npm test`
Expected: PASS — CSS contract test and full suite green.

- [ ] **Step 5: Visual gate + contrast spot-check**

Run: `node scripts/capture-journey.mjs --label ui-inversion --gate phase1`
Expected: GATES PASS. Eyeball `~/kumma-qa/shots-ui-inversion/01-hero.png` and `09-contact.png`: ink text on paper, nav readable, cards are raised paper, CTA is the single cinnabar mark, no white-on-ivory text anywhere. Spot-check contrast: ink `#2a2c28` on paper `#f0ead9` = WCAG AAA (>12:1); muted `#5a6053` on paper ≈ 5.9:1 (AA pass). Navigate once to `/blog` and back in a browser — theme must flip correctly.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/layout.tsx components/BodyTheme.tsx components/home/paperTheme.test.ts components/home/
git status --short # verify only intended files are staged
git commit -m "feat: invert homepage UI to ink on paper"
```

---

### Task 5: Baseline contact sheet and QA note

**Files:**
- Create: `docs/qa/2026-07-16-paper-inversion-baseline.md`

**Interfaces:**
- Consumes: Task 2 harness, Task 3–4 inverted scene and UI.
- Produces: the Phase-1 evidence record that later plans compare against (Phase 2 ink-core and Phase 3 vertical-slice plans reference this baseline).

- [ ] **Step 1: Capture both modes**

```bash
node scripts/capture-journey.mjs --label baseline --gate phase1
node scripts/capture-journey.mjs --label baseline-scene --gate phase1 --scene-only
```

Expected: both `GATES PASS`; artifacts in `~/kumma-qa/shots-baseline/` and `~/kumma-qa/shots-baseline-scene/` with `report.json` in each.

- [ ] **Step 2: Write the QA note**

Create `docs/qa/2026-07-16-paper-inversion-baseline.md` with: commit SHA, harness command lines, the per-stop table from both `report.json` files (stop, calls/budget, coverage/target), the known-honest-limitations list (SwiftShader software rendering; hero coverage gate is phase1-relaxed until Phase 2 ink materials land; ACES tone mapping retained; stock materials remain as pre-Phase-2 shading), and the visual review verdict for the hero and contact frames.

- [ ] **Step 3: Commit**

```bash
git add docs/qa/2026-07-16-paper-inversion-baseline.md
git commit -m "docs: record paper inversion baseline evidence"
```

---

## What this plan deliberately does NOT do

- No ink shaders, stroke fields, ridge geometry, moss dots (Phase 2 plan). Reference-painting value measurement is folded into that Phase-2 plan, where shader banding consumes it.
- No zone composition/camera changes, no fov work (Phase 3 plan).
- No birds/fish, no inscription-column chapter index redesign (later phases).
- No changes to scroll/narrative architecture, motion contract, or other pages.
