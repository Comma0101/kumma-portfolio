import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  featuredWork,
  labWork,
  workProjects,
} from "./workProjects";
import {
  legacyWorkSlugs,
  normalizeStaticAliasHref,
  resolveLegacyWorkHref,
} from "./workRoutes";

function readSource(file: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), file), "utf8");
}

function extractCssBlock(source: string, marker: string): string {
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1, `expected CSS marker ${marker}`);

  const openBrace = source.indexOf("{", markerIndex);
  assert.notEqual(openBrace, -1, `expected an opening brace after ${marker}`);

  let depth = 0;
  for (let index = openBrace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] !== "}") continue;

    depth -= 1;
    if (depth === 0) return source.slice(openBrace + 1, index);
  }

  assert.fail(`expected a closing brace for ${marker}`);
}

function assertSelectorFontSize(
  cssBlock: string,
  selector: string,
  fontSize: string,
): void {
  const rules = cssBlock.matchAll(/([^{}]+)\{([^{}]*)\}/g);

  for (const [, selectorList, declarations] of rules) {
    const selectors = selectorList.split(",").map((value) => value.trim());
    if (
      selectors.includes(selector) &&
      new RegExp(`font-size:\\s*${fontSize.replace(".", "\\.")}\\s*;`).test(
        declarations,
      )
    ) {
      return;
    }
  }

  assert.fail(`${selector} must use font-size: ${fontSize} in the mobile rule`);
}

describe("legacy work route map", () => {
  it("resolves legacy project slugs to canonical work routes", () => {
    assert.equal(resolveLegacyWorkHref("kota"), "/work/kota");
    assert.equal(resolveLegacyWorkHref("archon"), "/work/archon");
    assert.equal(resolveLegacyWorkHref("audiobook"), "/work/audiobook");
    assert.equal(
      resolveLegacyWorkHref("robinhood"),
      "/work/robinhood-dashboard",
    );
    assert.equal(
      resolveLegacyWorkHref("robinhood-dashboard"),
      "/work/robinhood-dashboard",
    );
    assert.equal(resolveLegacyWorkHref("splash-ink"), "/work/splash-ink");
    assert.equal(
      resolveLegacyWorkHref("spectral-world"),
      "/work/spectral-world",
    );
  });

  it("returns null for an unknown legacy slug", () => {
    assert.equal(resolveLegacyWorkHref("unknown"), null);
    assert.equal(resolveLegacyWorkHref("market-systems"), null);
  });

  it("publishes unique slugs that all resolve", () => {
    assert.equal(new Set(legacyWorkSlugs).size, legacyWorkSlugs.length);

    for (const slug of legacyWorkSlugs) {
      assert.notEqual(
        resolveLegacyWorkHref(slug),
        null,
        `${slug} must resolve to a canonical work route`,
      );
    }
  });

  it("normalizes exported alias targets to directory-index paths", () => {
    assert.equal(normalizeStaticAliasHref("/work"), "/work/");
    assert.equal(normalizeStaticAliasHref("/work/kota"), "/work/kota/");
    assert.equal(normalizeStaticAliasHref("/work/"), "/work/");
  });
});

describe("canonical work index data", () => {
  it("represents every catalog project exactly once", () => {
    const indexedProjects = [...featuredWork, ...labWork];

    assert.deepEqual(
      indexedProjects.map((project) => project.slug).sort(),
      workProjects.map((project) => project.slug).sort(),
    );
    assert.equal(new Set(indexedProjects).size, workProjects.length);
  });

  it("keeps every catalog href out of the legacy projects namespace", () => {
    for (const project of workProjects) {
      assert.ok(
        !project.href.startsWith("/projects/"),
        `${project.slug} must use a canonical /work/ href`,
      );
    }
  });
});

describe("legacy project route source contracts", () => {
  it("renders a static-safe projects index alias with canonical metadata", () => {
    const source = readSource("app/projects/page.tsx");

    assert.match(source, /StaticAliasRedirect/);
    assert.match(source, /export const metadata/);
    assert.match(source, /canonical:\s*["']https:\/\/kumma\.me\/work["']/);
    assert.match(source, /robots:\s*\{[\s\S]*?index:\s*false/);
    assert.match(source, /robots:\s*\{[\s\S]*?follow:\s*true/);
    assert.match(source, /href=["']\/work["']/);
    assert.doesNotMatch(source, /permanentRedirect/);
  });

  it("renders known detail aliases and denies unknown slugs", () => {
    const source = readSource("app/projects/[slug]/page.tsx");

    assert.match(source, /StaticAliasRedirect/);
    assert.match(source, /resolveLegacyWorkHref/);
    assert.match(source, /legacyWorkSlugs/);
    assert.match(source, /generateMetadata/);
    assert.match(source, /notFound\(\s*\)/);
    assert.match(source, /canonical:\s*`https:\/\/kumma\.me\$\{href\}`/);
    assert.match(source, /robots:\s*\{[\s\S]*?index:\s*false/);
    assert.match(source, /robots:\s*\{[\s\S]*?follow:\s*true/);
    assert.match(source, /host-level 301\/308/i);
    assert.doesNotMatch(source, /permanentRedirect/);

    for (const legacyConcern of [
      /ProjectDetail/,
      /KotaDetail/,
      /JsonLd/,
      /projectData/,
      /https:\/\/kumma\.me\/projects\//,
    ]) {
      assert.doesNotMatch(source, legacyConcern);
    }
  });

  it("uses a shared server-rendered alias with a visible fallback link", () => {
    const source = readSource("components/work/StaticAliasRedirect.tsx");

    assert.doesNotMatch(source, /["']use client["']/);
    assert.match(source, /normalizeStaticAliasHref/);
    assert.match(source, /<meta[\s\S]*?httpEquiv=["']refresh["']/);
    assert.match(source, /content=\{`0; url=\$\{staticHref\}`\}/);
    assert.match(source, /<Link[\s\S]*?href=\{staticHref\}/);
    assert.match(source, /page moved/i);
  });
});

describe("canonical work index source contracts", () => {
  it("links the footer directly to the work index", () => {
    const source = readSource("components/Footer.tsx");

    assert.match(
      source,
      /\{\s*label:\s*["']Work["']\s*,\s*href:\s*["']\/work["']\s*\}/,
    );
    assert.doesNotMatch(source, /\/#work/);
  });

  it("renders catalog-backed featured and lab sections with a contact CTA", () => {
    const source = readSource("components/work/WorkIndex.tsx");

    assert.match(source, /featuredWork/);
    assert.match(source, /labWork/);
    assert.match(source, /from\s+["']@\/data\/workProjects["']/);
    assert.match(source, /href=["']\/contact["']/);
    assert.match(
      source,
      /Start a project|Bring me a production AI problem/,
    );
    assert.match(
      source,
      /aria-label=\{`View \$\{project\.title\}: \$\{project\.artifact\}`\}/,
    );
    assert.doesNotMatch(source, /const\s+\w*[Pp]rojects?\s*=\s*\[/);
  });

  it("keeps core project metadata at 16px or larger on mobile", () => {
    const source = readSource("components/work/WorkIndex.module.css");
    const mobile = extractCssBlock(source, "@media (max-width: 760px)");

    for (const selector of [
      ".status",
      ".artifact",
      ".tags",
      ".tags li",
      ".evidence dt",
      ".cardAction",
    ]) {
      assertSelectorFontSize(mobile, selector, "1rem");
    }
  });

  it("keeps fallback mechanisms decorative and complementary to evidence", () => {
    const source = readSource("components/work/WorkIndex.tsx");
    const start = source.indexOf("function MechanismFallback");
    const end = source.indexOf("function ProjectMechanism");

    assert.notEqual(start, -1);
    assert.notEqual(end, -1);

    const fallback = source.slice(start, end);
    assert.match(fallback, /aria-hidden=["']true["']/);
    assert.doesNotMatch(fallback, /role=["']img["']/);
    assert.doesNotMatch(fallback, /aria-label=/);
    assert.doesNotMatch(fallback, /evidenceSteps/);
    assert.match(fallback, /project\.evidence\.input/);
    assert.match(fallback, /project\.evidence\.output/);
    assert.doesNotMatch(fallback, /project\.evidence\.transform/);
    assert.doesNotMatch(fallback, /project\.evidence\.guardrail/);
  });
});

describe("research work route source contracts", () => {
  const routes = [
    {
      slug: "splash-ink",
      file: "app/work/splash-ink/page.tsx",
      canonical: "https://kumma.me/work/splash-ink",
    },
    {
      slug: "spectral-world",
      file: "app/work/spectral-world/page.tsx",
      canonical: "https://kumma.me/work/spectral-world",
    },
  ] as const;

  for (const route of routes) {
    it(`publishes a catalog-backed ${route.slug} preview`, () => {
      const source = readSource(route.file);

      assert.match(source, /ResearchProjectPreview/);
      assert.match(source, /export const metadata/);
      assert.match(
        source,
        new RegExp(`getWorkProject\\(["']${route.slug}["']\\)`),
      );
      assert.ok(source.includes(`canonical: "${route.canonical}"`));
      assert.match(source, /limits=/);
      assert.doesNotMatch(source, /coming soon|placeholder/i);
    });
  }

  it("renders a substantive shared research preview", () => {
    const source = readSource("components/work/ResearchProjectPreview.tsx");

    assert.equal(source.match(/<h1\b/g)?.length, 1);
    assert.match(source, /project\.statusLabel/);
    assert.match(source, /project\.summary/);
    assert.match(source, /project\.evidence\[key\]/);
    assert.match(source, /Input/);
    assert.match(source, /Transform/);
    assert.match(source, /Output/);
    assert.match(source, /Guardrail/);
    assert.match(source, /limits/);
    assert.match(source, /href=["']\/work["']/);
    assert.match(source, /href=["']\/contact["']/);
    assert.doesNotMatch(source, /coming soon|placeholder/i);
  });
});
