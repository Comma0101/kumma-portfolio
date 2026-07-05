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
});
