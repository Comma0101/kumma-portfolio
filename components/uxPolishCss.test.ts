import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const readCss = (file: string) =>
  fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

const blockFor = (css: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `Expected CSS block for ${selector}`);
  return match[1];
};

const numberAfter = (block: string, pattern: RegExp) => {
  const match = block.match(pattern);
  assert.ok(match, `Expected ${pattern} in block`);
  return Number(match[1]);
};

describe("UX polish CSS", () => {
  it("keeps gallery study cards visibly interactive by default", () => {
    const css = readCss("styles/MenuItem.module.css");
    const card = blockFor(css, ".menuItem");
    const index = blockFor(css, ".chapterIndex");

    assert.ok(
      numberAfter(card, /background:\s*rgba\(255,\s*255,\s*255,\s*([0-9.]+)\)/) >=
        0.045,
    );
    assert.ok(
      numberAfter(index, /color:\s*rgba\(255,\s*255,\s*255,\s*([0-9.]+)\)/) >=
        0.36,
    );
  });

  it("preserves build page horizontal gutters on the hero", () => {
    const css = readCss("styles/build.module.css");
    const page = blockFor(css, ".page");
    const hero = blockFor(css, ".hero");

    assert.match(page, /overflow-x:\s*clip;/);
    assert.match(hero, /padding-block:/);
    assert.doesNotMatch(hero, /padding:\s*[^;]+;/);
  });

  it("keeps the mobile protocol pill labeled", () => {
    const css = readCss("components/AgentAwareness.module.css");

    assert.match(css, /\.pillLabel\s*\{[^}]*position:\s*static;/s);
    assert.doesNotMatch(css, /\.pillLabel\s*\{[^}]*clip:\s*rect/s);
  });
});

describe("accessible page landmarks", () => {
  it("renders a skip link targeting the focusable main landmark", () => {
    const layout = readCss("app/layout.tsx");

    assert.match(
      layout,
      /<a\b(?=[^>]*\bclassName="skip-link")(?=[^>]*\bhref="#main-content")[^>]*>\s*Skip to content\s*<\/a>/s,
    );
    assert.match(
      layout,
      /<main\b(?=[^>]*\bid="main-content")(?=[^>]*\bclassName="site-main")(?=[^>]*\btabIndex=\{-1\})[^>]*>/s,
    );
  });

  it("reveals the skip link on focus with the intended motion", () => {
    const css = readCss("app/globals.css");

    assert.match(blockFor(css, ".skip-link"), /transform:\s*translateY\(-160%\);/);
    assert.match(blockFor(css, ".skip-link"), /transition:\s*transform 180ms ease;/);
    assert.match(blockFor(css, ".skip-link:focus"), /transform:\s*translateY\(0\);/);
  });

  it("keeps the focused skip link above the intro overlay", () => {
    const focusedSkipLink = blockFor(readCss("app/globals.css"), ".skip-link:focus");
    const introOverlay = blockFor(
      readCss("styles/introOverlay.module.css"),
      ".overlay",
    );

    assert.ok(
      numberAfter(focusedSkipLink, /z-index:\s*(\d+)/) >
        numberAfter(introOverlay, /z-index:\s*(\d+)/),
    );
  });

  for (const file of [
    "components/ContactPage.tsx",
    "components/BenchmarkPage.tsx",
    "components/LatencyPage.tsx",
    "components/build/BuildLanding.tsx",
    "app/patterns/page.tsx",
    "app/projects/page.tsx",
    "app/agent/page.tsx",
  ]) {
    it(`${file} delegates the main landmark to the root layout`, () => {
      assert.doesNotMatch(readCss(file), /<main\b/);
    });
  }
});
