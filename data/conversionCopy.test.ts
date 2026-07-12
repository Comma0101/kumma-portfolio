import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

function readSource(file: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), file), "utf8");
}

const caseStudyComponents = [
  "components/KotaCaseStudy.tsx",
  "components/AudiobookCaseStudy.tsx",
  "components/ArchonCaseStudy.tsx",
  "components/RobinhoodCaseStudy.tsx",
  "components/work/CaseStudyShell.tsx",
] as const;

const workPages = [
  ["app/work/kota/page.tsx", "https://kumma.me/work/kota"],
  ["app/work/audiobook/page.tsx", "https://kumma.me/work/audiobook"],
  ["app/work/archon/page.tsx", "https://kumma.me/work/archon"],
  [
    "app/work/robinhood-dashboard/page.tsx",
    "https://kumma.me/work/robinhood-dashboard",
  ],
  ["app/work/splash-ink/page.tsx", "https://kumma.me/work/splash-ink"],
  ["app/work/spectral-world/page.tsx", "https://kumma.me/work/spectral-world"],
] as const;

const conversionSurfaces = [
  ...caseStudyComponents,
  "components/work/WorkIndex.tsx",
  "components/home/homeContent.ts",
  "app/agent/page.tsx",
  "app/layout.tsx",
] as const;

describe("case study conversion treatment", () => {
  for (const file of caseStudyComponents) {
    it(`${file} closes with the shared paid-project CTA`, () => {
      const source = readSource(file);

      assert.match(source, /Build a system like this/);
      assert.match(source, /href=["']\/contact["']/);
    });
  }
});

describe("canonical work metadata", () => {
  for (const [file, canonical] of workPages) {
    it(`${file} declares its canonical work URL`, () => {
      const source = readSource(file);

      assert.ok(
        source.includes(`canonical: "${canonical}"`),
        `${file} must declare canonical ${canonical}`,
      );
    });
  }
});

describe("site positioning", () => {
  it("describes an independent production-AI practice in root metadata", () => {
    const source = readSource("app/layout.tsx");

    assert.match(source, /production[- ]AI|production AI/i);
    assert.match(source, /audit/i);
    assert.match(source, /advisory/i);
    assert.match(source, /Kumma/);
    assert.match(source, /Yang Wu/);
  });

  it("keeps employment and recruiting language off conversion surfaces", () => {
    for (const file of conversionSurfaces) {
      const source = readSource(file);

      assert.doesNotMatch(
        source,
        /full[- ]time|recruiter|job seeker|hire me/i,
        `${file} must not carry employment language`,
      );
    }
  });

  it("frames the agent protocol around paid engagements and canonical routes", () => {
    const source = readSource("app/agent/page.tsx");

    assert.match(source, /audit/i);
    assert.match(source, /advisory/i);
    assert.match(source, /build/i);
    assert.match(source, /workProjects/);
    assert.doesNotMatch(source, /projectData/);
    assert.doesNotMatch(source, /\/projects\//);
    assert.doesNotMatch(source, /founding[- ]engineer|role\b/i);
    assert.match(source, /href=["']\/contact["']|kumma\.me\/contact/);
  });
});
