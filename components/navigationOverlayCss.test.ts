import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { nextFocusIndex } from "./navigationBehavior";

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
    assert.match(navigation, /inert=\{!isMenuOpen\}/);
    assert.match(navigation, /nextFocusIndex\(/);
    assert.match(
      navigation,
      /#main-content, footer, \[data-agent-awareness\]/,
    );
  });

  it("marks the rendered agent-awareness UI for isolation", () => {
    const source = readCss("components/AgentAwareness.tsx");

    assert.equal(source.match(/data-agent-awareness/g)?.length, 1);
  });

  it("focuses the first menu link with the trigger as fallback", () => {
    const source = readCss("components/Navigation.tsx");

    assert.match(source, /const firstLink =/);
    assert.match(
      source,
      /\(firstLink\s*\?\?\s*menuButtonRef\.current\)\?\.focus\(\)/,
    );
  });

  it("contains the trigger and links while preserving interior Tab movement", () => {
    const source = readCss("components/Navigation.tsx");
    const handler = source.slice(
      source.indexOf("const handleMenuKeyDown"),
      source.indexOf("const scrollToSection"),
    );
    const tabTrap = handler.slice(handler.indexOf('if (e.key !== "Tab")'));

    assert.match(handler, /if \(!isMenuOpen\) return;/);
    assert.match(
      tabTrap,
      /const focusable = \[\s*menuButtonRef\.current,\s*\.\.\.Array\.from/,
    );
    assert.match(tabTrap, /if \(!isBoundary\) return;/);
    assert.ok(
      tabTrap.indexOf("if (!isBoundary) return;") <
        tabTrap.indexOf("e.preventDefault()"),
    );
  });
});

describe("mobile navigation focus index", () => {
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
