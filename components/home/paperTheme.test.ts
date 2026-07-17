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
