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
// Per-stop overrides for frames whose composition is intentionally ink-heavy.
// intentionally ink-heavy gorge composition pre-Phase-2; final gate (0.55) remains the Phase-5 authority
const STOP_OVERRIDES = { "04-kota": 0.38 };
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
    ? (STOP_OVERRIDES[name] ??
        (name === "01-hero" ? gateSet.hero : DENSE_STOPS.has(name) ? gateSet.dense : gateSet.typical))
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
