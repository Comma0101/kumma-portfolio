import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  engagements,
  heroContent,
  homeContent,
  productionBoundaries,
  researchProof,
} from "./homeContent";

const readSource = (file: string) =>
  fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

const isConcrete = (value: string) => value.trim().length > 0;

const cssBlockFor = (css: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));

  assert.ok(match, `Expected CSS block for ${selector}`);
  return match[1];
};

describe("homepage production AI content", () => {
  it("leads with production AI, the three boundaries, and the approved CTAs", () => {
    assert.match(heroContent.title, /production AI/i);
    assert.match(heroContent.title, /3/);
    assert.deepEqual(heroContent.primaryCta, {
      label: "Start a project",
      href: "/contact",
    });
    assert.equal(heroContent.secondaryCta.href, "/call");
  });

  it("names and explains the three production boundaries", () => {
    assert.deepEqual(
      productionBoundaries.map((boundary) => boundary.label),
      ["Latency", "Ambiguity", "Workflow"],
    );

    for (const boundary of productionBoundaries) {
      assert.ok(
        isConcrete(boundary.explanation),
        `${boundary.label} needs a concrete explanation`,
      );
    }
  });

  it("defines the three paid engagement paths with buyer problems and deliverables", () => {
    assert.deepEqual(
      engagements.map((engagement) => engagement.title),
      ["Production AI audit", "Build engagement", "Advisory"],
    );

    for (const engagement of engagements) {
      assert.ok(
        isConcrete(engagement.when),
        `${engagement.title} needs a buyer problem`,
      );
      assert.ok(
        isConcrete(engagement.description),
        `${engagement.title} needs a concrete description`,
      );
      assert.ok(
        engagement.deliverables.length > 0 &&
          engagement.deliverables.every(isConcrete),
        `${engagement.title} needs concrete deliverables`,
      );
      assert.equal(engagement.cta.href, "/contact");
    }
  });

  it("keeps research proof on the four approved destinations", () => {
    assert.deepEqual(
      researchProof.map(({ label, href }) => ({ label, href })),
      [
        { label: "Benchmark", href: "/benchmark" },
        { label: "Latency", href: "/latency" },
        { label: "Patterns", href: "/patterns" },
        { label: "Field Notes", href: "/blog" },
      ],
    );
    assert.equal(researchProof.length, 4);
    assert.doesNotMatch(JSON.stringify(researchProof), /\/projects(?:\/|"|$)/i);
  });

  it("keeps recruiting language and unsupported hype out of exported homepage copy", () => {
    assert.doesNotMatch(
      JSON.stringify(homeContent),
      /full[- ]time|recruit|job seeker|hire me|10x|revolutionary/i,
    );
  });
});

describe("homepage production AI source contracts", () => {
  it("renders the approved homepage components in exact order", () => {
    const source = readSource("components/Home.tsx");
    const expected = [
      "HeroSection",
      "ProofConsole",
      "PositioningBand",
      "ChapterIndex",
      "CapabilitiesSection",
      "ResearchProofSection",
      "LabsSection",
      "ContactSection",
    ];
    const rendered = Array.from(
      source.matchAll(/<([A-Z][A-Za-z]+)\s*\/>/g),
      (match) => match[1],
    );

    assert.deepEqual(rendered, expected);
    assert.doesNotMatch(source, /PhilosophySection/);
  });

  it("puts the exact immersive stage hooks on semantic section roots", () => {
    const stageFiles = [
      ["components/home/HeroSection.tsx", "hero"],
      ["components/home/ProofConsole.tsx", "proof"],
      ["components/home/PositioningBand.tsx", "bridge"],
      ["components/home/ChapterIndex.tsx", "featured-work"],
      ["components/home/CapabilitiesSection.tsx", "capabilities"],
      ["components/home/ResearchProofSection.tsx", "research"],
      ["components/home/LabsSection.tsx", "labs"],
      ["components/home/ContactSection.tsx", "contact"],
    ] as const;

    const stages = stageFiles.map(([file, expectedStage]) => {
      const source = readSource(file);
      const semanticRoot = source.match(
        /<section\b[^>]*data-immersive-stage="([^"]+)"[^>]*>/,
      );

      assert.ok(semanticRoot, `${file} needs a semantic stage section`);
      assert.equal(semanticRoot[1], expectedStage);
      return semanticRoot[1];
    });

    assert.deepEqual(stages, [
      "hero",
      "proof",
      "bridge",
      "featured-work",
      "capabilities",
      "research",
      "labs",
      "contact",
    ]);
  });

  it("renders featured work directly from the catalog and never leaves an empty visual", () => {
    const source = readSource("components/home/ChapterIndex.tsx");

    assert.match(source, /featuredWork/);
    assert.match(source, /project\.visualKey/);
    assert.match(source, /project\.evidence\.input/);
    assert.match(source, /project\.evidence\.output/);
    assert.doesNotMatch(source, /data\/projectData|\bprojects\b|\bchapters\b/);
    assert.doesNotMatch(source, /vizField/);
  });

  it("renders labs directly from labWork without a duplicate project list", () => {
    const source = readSource("components/home/LabsSection.tsx");

    assert.match(source, /import\s*\{\s*labWork\s*\}/);
    assert.match(source, /labWork\.map/);
    assert.doesNotMatch(source, /const\s+(?:labProjects|projects|labs)\s*=/);
  });

  it("qualifies a project and includes every field in the visible mailto handoff", () => {
    const source = readSource("components/home/ContactSection.tsx");

    for (const label of [
      "Name",
      "Email",
      "Problem",
      "Constraint",
      "Current stack",
      "Timeline",
      "Budget",
    ]) {
      assert.match(source, new RegExp(`<label[^>]*[\\s\\S]*?${label}`));
      assert.ok(
        source.includes(`${label}: \${formData.`),
        `mailto body must include ${label}`,
      );
    }

    assert.match(source, /mailto:dev@kumma\.me/);
    assert.match(source, /Open project email/);
    assert.match(source, /role="status"/);
    assert.match(source, /email app is opening/i);
    assert.match(source, /write directly to\s*dev@kumma\.me/i);
  });

  it("gives featured and contact links perceptible pressed feedback", () => {
    const contracts = [
      ["components/home/ChapterIndex.module.css", ".link:active"],
      ["components/home/ChapterIndex.module.css", ".linkSecondary:active"],
      ["components/home/ContactSection.module.css", ".emailLink:active"],
      ["components/home/ContactSection.module.css", ".socialLinks a:active"],
    ] as const;

    for (const [file, selector] of contracts) {
      const block = cssBlockFor(readSource(file), selector);

      assert.match(
        block,
        /opacity:\s*0?\.\d+|transform:\s*(?!none)[^;]+;/,
        `${selector} needs opacity or transform pressed feedback`,
      );
    }
  });
});
