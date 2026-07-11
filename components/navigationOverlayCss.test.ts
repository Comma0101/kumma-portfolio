import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, it } from "node:test";
import {
  inertAttribute,
  nextFocusIndex,
  shouldRestoreMenuFocus,
} from "./navigationBehavior";

const requireFromProject = createRequire(
  path.resolve(process.cwd(), "package.json"),
);
const { createElement } = requireFromProject("react") as typeof import("react");
const { renderToStaticMarkup } = requireFromProject(
  "react-dom/server",
) as typeof import("react-dom/server");

const readCss = (file: string) =>
  fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

const blockFor = (css: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `Expected CSS block for ${selector}`);
  return match[1];
};

const zIndexFor = (css: string, selector: string) => {
  const block = blockFor(css, selector);
  const match = block.match(/z-index:\s*(\d+)/);
  assert.ok(match, `Expected z-index for ${selector}`);
  return Number(match[1]);
};

describe("mobile navigation overlay CSS", () => {
  it("does not constrain the fixed mobile menu to a transformed nav", () => {
    const css = readCss("styles/navigation.module.css");
    const visibleBlock = blockFor(css, ".navigationVisible");

    assert.match(visibleBlock, /transform:\s*none;/);
  });

  it("keeps the mobile menu above the agent protocol pill", () => {
    const navigationCss = readCss("styles/navigation.module.css");
    const agentCss = readCss("components/AgentAwareness.module.css");

    assert.ok(
      zIndexFor(navigationCss, ".mobileMenu") > zIndexFor(agentCss, ".pill"),
    );
  });

  it("positions the close control inside the mobile dialog", () => {
    const css = readCss("styles/navigation.module.css");
    const closeButton = blockFor(css, ".menuCloseButton");

    assert.match(closeButton, /position:\s*absolute;/);
    assert.doesNotMatch(css, /\.menuButton\.open\s*\{/);
  });

  it("gives the menu trigger a 44px touch target", () => {
    const menuButton = blockFor(
      readCss("styles/navigation.module.css"),
      ".menuButton",
    );

    assert.match(menuButton, /width:\s*44px;/);
    assert.match(menuButton, /height:\s*44px;/);
  });

  it("exposes dialog semantics and native inert containment", () => {
    const navigation = readCss("components/Navigation.tsx");

    assert.match(navigation, /role="dialog"/);
    assert.match(navigation, /aria-modal="true"/);
    assert.match(navigation, /aria-label="Site navigation"/);
    assert.match(navigation, /aria-hidden=\{!isMenuOpen\}/);
    assert.match(navigation, /\.\.\.inertAttribute\(!isMenuOpen\)/);
    assert.match(navigation, /nextFocusIndex\(/);
    assert.match(
      navigation,
      /#main-content, footer, \[data-agent-awareness\]/,
    );
  });

  it("isolates the skip link and navigation chrome behind the dialog", () => {
    const layout = readCss("app/layout.tsx");
    const navigation = readCss("components/Navigation.tsx");

    assert.match(layout, /className="skip-link"/);
    assert.match(
      navigation,
      /#main-content, footer, \[data-agent-awareness\], \.skip-link, \[data-navigation-background\]/,
    );
    assert.equal(
      navigation.match(/\sdata-navigation-background(?=\s|>)/g)?.length,
      2,
    );
  });

  it("marks the rendered agent-awareness UI for isolation", () => {
    const source = readCss("components/AgentAwareness.tsx");

    assert.equal(source.match(/data-agent-awareness/g)?.length, 1);
  });

  it("focuses the first menu link with the dialog close control as fallback", () => {
    const source = readCss("components/Navigation.tsx");

    assert.match(source, /const firstLink =/);
    assert.match(
      source,
      /\(firstLink\s*\?\?\s*closeButtonRef\.current\)\?\.focus\(\)/,
    );
  });

  it("contains dialog controls while preserving interior Tab movement", () => {
    const source = readCss("components/Navigation.tsx");
    const handler = source.slice(
      source.indexOf("const handleMenuKeyDown"),
      source.indexOf("const scrollToSection"),
    );
    const tabTrap = handler.slice(handler.indexOf('if (e.key !== "Tab")'));

    assert.match(
      tabTrap,
      /querySelectorAll<HTMLElement>\(\s*["']a\[href\], button:not\(\[disabled\]\)["'],?\s*\)/,
    );
    assert.doesNotMatch(tabTrap, /menuButtonRef\.current/);
    assert.match(tabTrap, /if \(!isBoundary\) return;/);
    assert.ok(
      tabTrap.indexOf("if (!isBoundary) return;") <
        tabTrap.indexOf("e.preventDefault()"),
    );
  });

  it("keeps the exterior opener out of the modal focus cycle", () => {
    const source = readCss("components/Navigation.tsx");

    assert.match(source, /ref=\{closeButtonRef\}/);
    assert.match(source, /styles\.menuCloseButton/);
    assert.match(source, /aria-hidden=\{isMenuOpen\}/);
    assert.match(source, /tabIndex=\{isMenuOpen\s*\?\s*-1\s*:\s*undefined\}/);
  });

  it("leaves a reachable backdrop beside the menu content", () => {
    const css = readCss("styles/navigation.module.css");
    const links = blockFor(css, ".mobileLinksContainer");

    assert.doesNotMatch(links, /width:\s*100%;/);
    assert.match(links, /width:\s*calc\(100% - 3rem\);/);
    const navigation = readCss("components/Navigation.tsx");
    assert.match(navigation, /e\.target\s*===\s*e\.currentTarget/);
    assert.match(navigation, /onClick=\{handleBackdropClick\}/);
  });

  it("closes and focuses a visible target when leaving the mobile breakpoint", () => {
    const source = readCss("components/Navigation.tsx");
    const breakpointEffect = source.slice(
      source.indexOf('matchMedia("(max-width: 980px)")'),
      source.indexOf("const toggleMenu"),
    );

    assert.match(source, /matchMedia\(["']\(max-width: 980px\)["']\)/);
    assert.match(source, /addEventListener\(["']change["']/);
    assert.match(source, /ref=\{logoRef\}/);
    assert.doesNotMatch(breakpointEffect, /closeMenu\(true\)/);
    assert.match(breakpointEffect, /previousFocusRef\.current\s*=\s*null/);
    assert.match(
      breakpointEffect,
      /requestAnimationFrame\(\(\)\s*=>\s*logoRef\.current\?\.focus\(\)\)/,
    );
  });

  it("restores focus for same-page anchors and current routes", () => {
    assert.equal(shouldRestoreMenuFocus("/", "#work"), true);
    assert.equal(shouldRestoreMenuFocus("/contact", "/contact"), true);
    assert.equal(shouldRestoreMenuFocus("/contact/", "/contact"), true);
    assert.equal(shouldRestoreMenuFocus("/contact", "/contact/"), true);
    assert.equal(shouldRestoreMenuFocus("/", "///"), true);
  });

  it("leaves real route changes to the page-transition focus handoff", () => {
    assert.equal(shouldRestoreMenuFocus("/contact", "/blog"), false);
    assert.equal(shouldRestoreMenuFocus("/blog/hello", "/blog"), false);
    assert.equal(shouldRestoreMenuFocus("/blog/post/", "/blog"), false);
    assert.equal(shouldRestoreMenuFocus("/contact", "#work"), false);
  });

  it("uses target-aware focus restoration for both mobile link types", () => {
    const source = readCss("components/Navigation.tsx");

    assert.match(
      source,
      /closeMenu\(shouldRestoreMenuFocus\(pathname,\s*href\)\)/,
    );
    assert.match(
      source,
      /onNavigate=\{\(\)\s*=>\s*closeMenu\(\s*shouldRestoreMenuFocus\(pathname,\s*link\.href\)\s*\)\s*\}/,
    );
  });
});

describe("mobile navigation focus index", () => {
  it("renders inert only when containment is enabled", () => {
    const closed = inertAttribute(true);
    const open = inertAttribute(false);

    assert.deepEqual(closed, { inert: "" });
    assert.equal("inert" in closed, true);
    assert.deepEqual(open, {});
    assert.equal("inert" in open, false);
    assert.match(
      renderToStaticMarkup(createElement("div", closed)),
      /<div inert=""><\/div>/,
    );
    assert.doesNotMatch(
      renderToStaticMarkup(createElement("div", open)),
      /\binert=/,
    );
  });

  it("returns no focus target for an empty menu", () => {
    assert.equal(nextFocusIndex(0, 0, false), -1);
  });

  it("enters at the first item when moving forward", () => {
    assert.equal(nextFocusIndex(-1, 5, false), 0);
  });

  it("enters at the last item when moving backward", () => {
    assert.equal(nextFocusIndex(-1, 5, true), 4);
  });

  it("wraps forward from the last item", () => {
    assert.equal(nextFocusIndex(4, 5, false), 0);
  });

  it("wraps backward from the first item", () => {
    assert.equal(nextFocusIndex(0, 5, true), 4);
  });

  it("moves one item in either direction", () => {
    assert.equal(nextFocusIndex(2, 5, false), 3);
    assert.equal(nextFocusIndex(2, 5, true), 1);
  });
});
