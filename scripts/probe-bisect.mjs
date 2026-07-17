// Bisect probe: hide top-level scene children one at a time at stop 01 and
// screenshot each variant, to find which object paints the horizontal film line.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

const URL = process.env.CAPTURE_URL ?? "http://localhost:4242/";
const OUT = path.join(os.homedir(), "kumma-qa", "probe-bisect");
fs.mkdirSync(OUT, { recursive: true });

function resolveChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  const root = path.join(os.homedir(), ".cache", "ms-playwright");
  const candidates = fs
    .readdirSync(root)
    .filter((d) => d.startsWith("chromium-") && !d.includes("headless"))
    .sort()
    .reverse();
  for (const dir of candidates) {
    const nested = path.join(root, dir, "chrome-linux", "chrome");
    if (fs.existsSync(nested)) return nested;
  }
  throw new Error("No cached Chromium found");
}

const browser = await chromium.launch({
  executablePath: resolveChromium(),
  headless: true,
  args: ["--disable-dev-shm-usage", "--hide-scrollbars"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(URL, { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(5000);
await page.evaluate(() => {
  const el = document.documentElement;
  window.scrollTo(0, Math.round(0.04 * (el.scrollHeight - innerHeight)));
});
await page.waitForTimeout(1800);

const names = await page.evaluate(() => {
  const scene = window.__scene;
  if (!scene) return ["NO_SCENE"];
  return scene.children.map((c) => `${c.name || c.type}#${c.id}`);
});
console.log("top-level:", names);

await page.screenshot({ path: path.join(OUT, "all-visible.png") });

for (const name of names) {
  if (name === "NO_SCENE") break;
  await page.evaluate((key) => {
    const scene = window.__scene;
    const target = scene.children.find(
      (c) => `${c.name || c.type}#${c.id}` === key,
    );
    if (target) target.visible = false;
    // Wake the settled render loop so the canvas actually repaints.
    window.scrollTo(0, window.scrollY + 1);
  }, name);
  await page.waitForTimeout(500);
  const safe = name.replace(/[^a-z0-9#-]/gi, "_");
  await page.screenshot({ path: path.join(OUT, `hidden-${safe}.png`) });
  await page.evaluate((key) => {
    const scene = window.__scene;
    const target = scene.children.find(
      (c) => `${c.name || c.type}#${c.id}` === key,
    );
    if (target) target.visible = true;
  }, name);
}
await browser.close();
console.log("done ->", OUT);
