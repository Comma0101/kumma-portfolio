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

const hexToken = (css: string, token: string) => {
  const match = css.match(new RegExp(`--${token}:\\s*(#[0-9a-f]{6});`, "i"));
  assert.ok(match, `Expected hex token --${token}`);
  return match[1];
};

const rgbFromHex = (hex: string) =>
  hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => parseInt(channel, 16));

const relativeLuminance = (rgb: number[]) => {
  const channels = rgb
    .map((channel) => channel / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

const contrastRatio = (first: number[], second: number[]) => {
  const luminances = [relativeLuminance(first), relativeLuminance(second)].sort(
    (a, b) => b - a,
  );
  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
};

const rgbaColor = (block: string) => {
  const match = block.match(
    /color:\s*rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\s*\)/,
  );
  assert.ok(match, "Expected an rgba text color");
  return {
    rgb: match.slice(1, 4).map(Number),
    alpha: Number(match[4]),
  };
};

const composite = (foreground: number[], alpha: number, background: number[]) =>
  foreground.map(
    (channel, index) => channel * alpha + background[index] * (1 - alpha),
  );

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
    assert.match(
      source,
      /window\.matchMedia\?\.\(\s*["']\(prefers-reduced-motion: reduce\)["']\s*,?\s*\)\.matches/,
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

describe("homepage structured data", () => {
  it("exports the named value consumed by the homepage", () => {
    const homepage = readCss("app/page.tsx");
    const jsonLd = readCss("components/seo/JsonLd.tsx");

    assert.match(homepage, /import\s*\{\s*JsonLd,\s*homeLd\s*\}/);
    assert.match(jsonLd, /export const homeLd\s*=/);
  });

  it("connects the person, organization, and website in one graph", () => {
    const jsonLd = readCss("components/seo/JsonLd.tsx");

    assert.match(jsonLd, /export const homeLd\s*=\s*\{[\s\S]*"@graph":\s*\[/);
    assert.match(jsonLd, /"@type":\s*"Organization"/);
    assert.match(jsonLd, /"@type":\s*"WebSite"/);
    assert.match(jsonLd, /founder:\s*\{\s*"@id":\s*"https:\/\/kumma\.me\/#person"\s*\}/);
  });
});

describe("contrast and touch targets", () => {
  it("keeps faint text readable against every canonical surface", () => {
    const css = readCss("app/globals.css");
    const faint = rgbFromHex(hexToken(css, "faint"));

    for (const surface of ["canvas", "surface", "raised"]) {
      assert.ok(
        contrastRatio(faint, rgbFromHex(hexToken(css, surface))) >= 4.5,
        `Expected --faint to pass on --${surface}`,
      );
    }
  });

  it("places a noninteractive desktop quiet layer behind hero copy only", () => {
    const css = readCss("components/home/HeroSection.module.css");
    const layer = blockFor(css, ".hero::before");
    const inner = blockFor(css, ".inner");

    assert.match(layer, /pointer-events:\s*none;/);
    assert.match(layer, /linear-gradient\(\s*to right,/);
    assert.match(layer, /transparent\s+[0-9]+%/);
    assert.ok(
      numberAfter(inner, /z-index:\s*(\d+)/) >
        numberAfter(layer, /z-index:\s*(\d+)/),
    );
    assert.match(
      css,
      /@media \(max-width: 640px\)[\s\S]*?\.hero::before\s*\{[^}]*display:\s*none;/,
    );
  });

  for (const selector of [
    ".heroContext",
    ".stackLine",
    ".realityTag",
    ".outputKey",
    ".problemResult",
    ".pipelineIndex",
    ".pipelineKey",
    ".failureExample",
    ".impactDetail",
    ".signal",
    ".outputNote",
    ".stackGroupLabel",
    ".quoteAttrib",
    ".arrowLabel",
  ]) {
    it(`keeps ${selector} semantic text readable`, () => {
      const block = blockFor(
        readCss("styles/kotaCaseStudy.module.css"),
        selector,
      );
      const textColor = rgbaColor(block);
      const tokens = readCss("app/globals.css");

      for (const surface of ["canvas", "surface", "raised"]) {
        const background = rgbFromHex(hexToken(tokens, surface));
        assert.ok(
          contrastRatio(
            composite(textColor.rgb, textColor.alpha, background),
            background,
          ) >= 4.5,
          `Expected ${selector} to pass on --${surface}`,
        );
      }
    });
  }

  it("shows blog input focus and keeps mobile controls touch sized", () => {
    const css = readCss("styles/blog.module.css");
    const focus = blockFor(css, ".searchBar:focus-within");

    assert.match(focus, /(?:outline|box-shadow):[^;]*var\(--signal\)/);
    assert.match(
      css,
      /@media \(max-width: 760px\)[\s\S]*?\.searchInput,\s*\.filterButton\s*\{[^}]*min-height:\s*44px;/,
    );
  });

  it("exposes selected blog filters to assistive technology", () => {
    assert.match(
      readCss("components/BlogSection.tsx"),
      /aria-pressed=\{isActive\}/,
    );
  });

  it("keeps mobile chapter links touch sized without enlarging type", () => {
    const css = readCss("components/home/ChapterIndex.module.css");

    assert.match(
      css,
      /@media \(max-width: 620px\)[\s\S]*?\.link,\s*\.linkSecondary\s*\{[^}]*display:\s*inline-flex;[^}]*align-items:\s*center;[^}]*min-height:\s*44px;[^}]*padding:/,
    );
  });

  it("keeps home social links touch sized", () => {
    const socialLinks = blockFor(
      readCss("components/home/ContactSection.module.css"),
      ".socialLinks a",
    );

    assert.match(socialLinks, /display:\s*inline-flex;/);
    assert.match(socialLinks, /min-height:\s*44px;/);
  });
});

describe("contact form semantics", () => {
  for (const file of [
    "components/ContactPage.tsx",
    "components/home/ContactSection.tsx",
  ]) {
    it(`${file} identifies visible name and email fields for autofill`, () => {
      const source = readCss(file);

      assert.match(
        source,
        /<input\b(?=[^>]*\bname="name")(?=[^>]*\bautoComplete="name")[^>]*\/>/s,
      );
      assert.match(
        source,
        /<input\b(?=[^>]*\bname="email")(?=[^>]*\bautoComplete="email")[^>]*\/>/s,
      );
    });
  }

  it("describes the full contact form mailto handoff accurately", () => {
    const source = readCss("components/ContactPage.tsx");

    assert.match(
      source,
      /<button\b(?=[^>]*\btype="submit")[^>]*>\s*Open Email\s*<\/button>/s,
    );
    assert.doesNotMatch(
      source,
      /<button\b(?=[^>]*\btype="submit")[^>]*>\s*Send\s*<\/button>/s,
    );
  });
});
