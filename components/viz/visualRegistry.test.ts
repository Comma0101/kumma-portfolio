import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { workProjects, workVisualKeys } from "../../data/workProjects";
import { visualRegistry } from "./visualRegistry";

const readSource = (file: string) =>
  fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

const componentFiles = {
  kota: "components/viz/KotaViz.tsx",
  audiobook: "components/viz/AudiobookViz.tsx",
  archon: "components/viz/ArchonViz.tsx",
  "splash-ink": "components/viz/SplashInkViz.tsx",
  "spectral-world": "components/viz/SpectralViz.tsx",
  ledger: "components/viz/LedgerViz.tsx",
} as const;

const mechanismVocabulary = {
  audiobook: [/document/i, /chunk|queue/i, /waveform|timeline/i],
  "splash-ink": [/ink/i, /depth|point/i, /splat/i],
  "spectral-world": [/local audio/i, /FFT/i, /terrain|pillar/i],
  ledger: [/CSV/i, /pair|FIFO|contract/i, /ledger/i],
} as const;

describe("project visual metadata", () => {
  it("follows the catalog visual-key order exactly", () => {
    assert.deepEqual(Object.keys(visualRegistry), [...workVisualKeys]);
  });

  it("resolves visual metadata for every public work project", () => {
    for (const project of workProjects) {
      assert.ok(
        visualRegistry[project.visualKey],
        `${project.slug} needs visual metadata for ${project.visualKey}`,
      );
    }
  });

  it("describes a buyer-readable mechanism and a stable reduced-motion state", () => {
    for (const [key, definition] of Object.entries(visualRegistry)) {
      assert.ok(
        definition.reducedMotionLabel.trim().length > 0,
        `${key} needs a reduced-motion label`,
      );
      assert.match(
        definition.mechanism,
        /\b(?:input|transform|output|guardrail)\b/i,
        `${key} needs an input/transform/output/guardrail mechanism`,
      );
      assert.doesNotMatch(
        `${definition.mechanism} ${definition.reducedMotionLabel}`,
        /recruit|hiring|hire me|10x|revolutionary|world[- ]class|cutting[- ]edge|game[- ]changing|best[- ]in[- ]class/i,
        `${key} metadata must stay factual`,
      );
    }
  });
});

describe("project visual component contracts", () => {
  it("provides one accessible, hydration-stable SVG component per catalog key", () => {
    const ariaLabels = new Set<string>();

    for (const [key, file] of Object.entries(componentFiles)) {
      assert.ok(fs.existsSync(file), `${file} must exist for ${key}`);
      const source = readSource(file);

      assert.match(source, /export default function\s+\w+/);
      assert.match(source, /\}:\s*VizProps\)/);
      assert.match(source, /useHydratedReducedMotion\(\)/);
      assert.match(source, /role="img"/);

      const ariaLabel = source.match(/aria-label="([^"]+)"/)?.[1]?.trim();
      assert.ok(ariaLabel, `${file} needs a nonblank mechanism aria-label`);
      assert.ok(!ariaLabels.has(ariaLabel), `${file} needs a unique aria-label`);
      ariaLabels.add(ariaLabel);

      assert.match(
        source,
        /!reduce\s*&&|animate=\{reduce\s*\?|transition=\{reduce\s*\?/,
        `${file} needs an explicit stable reduced-motion branch`,
      );
    }
  });

  it("uses mechanism-specific vocabulary in each new visual label", () => {
    for (const [key, patterns] of Object.entries(mechanismVocabulary)) {
      const source = readSource(componentFiles[key as keyof typeof componentFiles]);
      const ariaLabel = source.match(/aria-label="([^"]+)"/)?.[1] ?? "";

      for (const pattern of patterns) {
        assert.match(ariaLabel, pattern, `${key} aria-label must match ${pattern}`);
      }
    }
  });

  it("limits new visual motion to transforms, opacity, and path progression", () => {
    for (const key of Object.keys(mechanismVocabulary)) {
      const source = readSource(componentFiles[key as keyof typeof componentFiles]);

      assert.doesNotMatch(
        source,
        /animate=\{\{[^}]*\b(?:cx|cy|width|height)\s*:/s,
        `${key} must not animate SVG geometry or layout dimensions`,
      );
    }
  });

  it("maps every catalog visual and only the approved compatibility alias", () => {
    const source = readSource("components/viz/registry.ts");

    assert.match(
      source,
      /satisfies\s+Record<WorkVisualKey,\s*ComponentType<VizProps>>/,
    );
    for (const key of workVisualKeys) {
      assert.match(
        source,
        new RegExp(`["']?${key}["']?\\s*:`),
        `registry.ts must map ${key}`,
      );
    }
    assert.match(source, /["']market-systems["']\s*:\s*MarketViz/);

    const objectKeys = Array.from(
      source.matchAll(/^\s{2}(?:["']([^"']+)["']|([a-z][\w-]*))\s*:/gm),
      (match) => match[1] ?? match[2],
    );
    assert.deepEqual(
      [...new Set(objectKeys)],
      [...workVisualKeys, "market-systems"],
    );
  });

  it("keeps general legacy slug lookups optional without weakening known keys", () => {
    const source = readSource("components/viz/registry.ts");

    assert.match(
      source,
      /Partial<Record<string,\s*ComponentType<VizProps>>>/,
    );
    assert.match(
      source,
      /typeof catalogVisuals\s*&\s*typeof legacyVisuals/,
    );
  });
});

describe("project visual consumers", () => {
  it("renders resolved lab visuals inside the shared system frame", () => {
    const source = readSource("components/home/LabsSection.tsx");

    assert.match(source, /import SystemViz/);
    assert.match(source, /import\s*\{\s*vizBySlug\s*\}/);
    assert.match(source, /vizBySlug\[project\.visualKey\]/);
    assert.match(source, /<SystemViz/);
    assert.match(source, /<Visualization\s+size="teaser"\s*\/>/);
  });

  it("enhances research previews with the matching visual before evidence and limits", () => {
    const source = readSource("components/work/ResearchProjectPreview.tsx");

    assert.match(source, /import SystemViz/);
    assert.match(source, /import\s*\{\s*vizBySlug\s*\}/);
    assert.match(source, /vizBySlug\[project\.visualKey\]/);
    assert.match(source, /<SystemViz/);

    const visual = source.indexOf("<SystemViz");
    const evidence = source.indexOf("<section className={styles.mechanism}");
    const limits = source.indexOf("<section className={styles.limits}");

    assert.ok(visual >= 0 && visual < evidence, "visual must precede evidence");
    assert.ok(visual < limits, "visual must precede limits");

    for (const route of ["splash-ink", "spectral-world"]) {
      const page = readSource(`app/work/${route}/page.tsx`);
      assert.match(page, /<ResearchProjectPreview/);
    }
  });
});
