import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  PAGE_TRANSITION_SECONDS,
  scrollBehaviorForMotion,
  shouldAnimateNavigation,
} from "./navigationBehavior";

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

describe("native-compatible route navigation", () => {
  const primaryClick = {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    target: "",
    download: false,
  };

  it("animates an unmodified primary click", () => {
    assert.equal(shouldAnimateNavigation(primaryClick), true);
  });

  for (const [name, override] of [
    ["middle click", { button: 1 }],
    ["non-primary click", { button: 2 }],
    ["meta click", { metaKey: true }],
    ["control click", { ctrlKey: true }],
    ["shift click", { shiftKey: true }],
    ["alt click", { altKey: true }],
    ["blank target", { target: "_blank" }],
    ["download", { download: true }],
  ] as const) {
    it(`leaves ${name} to the browser`, () => {
      assert.equal(
        shouldAnimateNavigation({ ...primaryClick, ...override }),
        false,
      );
    });
  }

  it("keeps the page-cover transition short", () => {
    assert.ok(PAGE_TRANSITION_SECONDS <= 0.35);
  });

  it("uses immediate native scrolling for reduced motion", () => {
    assert.equal(scrollBehaviorForMotion(true), "auto");
  });

  it("keeps smooth native scrolling for no preference", () => {
    assert.equal(scrollBehaviorForMotion(false), "smooth");
  });

  it("guards TransitionLink interception and exposes active semantics", () => {
    const source = readCss("components/TransitionLink.tsx");

    assert.match(
      source,
      /import\s*\{[^}]*shouldAnimateNavigation[^}]*\}\s*from\s*["']\.\/navigationBehavior["']/s,
    );
    assert.match(source, /if\s*\(\s*!shouldAnimateNavigation\s*\(/);
    assert.match(source, /ariaCurrent\?:\s*["']page["']/);
    assert.match(source, /aria-current=\{ariaCurrent\}/);
  });

  it("uses the shared duration and focuses main after a route change", () => {
    const source = readCss("components/PageTransition.tsx");

    assert.match(
      source,
      /import\s*\{[^}]*PAGE_TRANSITION_SECONDS[^}]*\}\s*from\s*["']\.\/navigationBehavior["']/s,
    );
    assert.doesNotMatch(source, /duration:\s*0\.75/);
    assert.match(source, /duration:\s*PAGE_TRANSITION_SECONDS/g);
    assert.match(source, /previousPathname\.current\s*!==\s*pathname/);
    assert.match(
      source,
      /requestAnimationFrame\([\s\S]*getElementById\(["']main-content["']\)[\s\S]*focus\(\{\s*preventScroll:\s*true\s*\}\)/,
    );
  });

  it("marks both desktop and mobile active route links", () => {
    const source = readCss("components/Navigation.tsx");
    const matches = source.match(
      /ariaCurrent=\{isActive\s*\?\s*["']page["']\s*:\s*undefined\}/g,
    );

    assert.equal(matches?.length, 2);
  });
});

describe("homepage terrain and reduced motion", () => {
  it("loads the terrain from the homepage instead of the root layout", () => {
    const layout = readCss("app/layout.tsx");
    const homepage = readCss("app/page.tsx");

    assert.doesNotMatch(layout, /import\s+ThreeScene\b/);
    assert.doesNotMatch(layout, /<ThreeScene\b/);
    assert.match(homepage, /import\s+ThreeScene\s+from\s+["']@\/components\/ThreeScene["']/);
    assert.match(homepage, /<ThreeScene\s*\/>/);
  });

  it("mounts the homepage terrain without route state", () => {
    const source = readCss("components/ThreeScene.tsx");

    assert.doesNotMatch(source, /usePathname/);
    assert.doesNotMatch(source, /\bpathname\b/);
    assert.match(source, /\}, \[\]\);/);
  });

  it("guards Lenis construction with the reduced-motion helper", () => {
    const source = readCss("components/SmoothScrollProvider.tsx");
    const guard = source.indexOf("if (!shouldInitializeSmoothScroll(");
    const constructor = source.indexOf("new Lenis(");

    assert.match(
      source,
      /import\s*\{\s*shouldInitializeSmoothScroll\s*\}\s*from\s*["']\.\/viz\/reducedMotionState["']/,
    );
    assert.ok(guard >= 0, "Expected a reduced-motion guard");
    assert.ok(constructor > guard, "Expected the guard before Lenis construction");
  });

  it("tracks homepage navigation with native scroll when Lenis is absent", () => {
    const source = readCss("components/Navigation.tsx");
    const effect = source.slice(
      source.indexOf("if (!isHomePage)"),
      source.indexOf("}, [isHomePage]);"),
    );

    assert.match(
      effect,
      /const handleNativeScroll\s*=\s*\(\)\s*=>\s*updateNavigation\(window\.scrollY\)/,
    );
    assert.match(
      effect,
      /if\s*\(lenis\)[\s\S]*lenis\.on\(["']scroll["'], handleLenisScroll\)[\s\S]*else[\s\S]*window\.addEventListener\(["']scroll["'], handleNativeScroll, \{ passive: true \}\)/,
    );
    assert.match(
      effect,
      /if\s*\(lenis\)[\s\S]*lenis\.off\(["']scroll["'], handleLenisScroll\)[\s\S]*else[\s\S]*window\.removeEventListener\(["']scroll["'], handleNativeScroll\)/,
    );
  });

  it("tracks terrain visibility with native scroll when Lenis is absent", () => {
    const source = readCss("components/ThreeScene.tsx");

    assert.match(
      source,
      /const handleNativeScroll\s*=\s*\(\)\s*=>\s*handleScroll\(\{ scroll: window\.scrollY \}\)/,
    );
    assert.match(
      source,
      /if\s*\(lenis\)[\s\S]*lenis\.on\(["']scroll["'], handleScroll\)[\s\S]*else[\s\S]*window\.addEventListener\(["']scroll["'], handleNativeScroll, \{ passive: true \}\)/,
    );
    assert.match(
      source,
      /if\s*\(lenis\)[\s\S]*lenis\.off\(["']scroll["'], handleScroll\)[\s\S]*else[\s\S]*window\.removeEventListener\(["']scroll["'], handleNativeScroll\)/,
    );
  });

  it("uses the motion-aware behavior for both native anchor fallbacks", () => {
    const source = readCss("components/Navigation.tsx");

    assert.equal(
      source.match(/behavior:\s*scrollBehaviorForMotion\(/g)?.length,
      2,
    );
  });
});
