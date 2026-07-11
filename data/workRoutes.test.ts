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
  it("permanently redirects the projects index on the server", () => {
    const source = readSource("app/projects/page.tsx");

    assert.match(source, /permanentRedirect\(\s*["']\/work["']\s*\)/);
    assert.doesNotMatch(source, /["']use client["']/);
    assert.doesNotMatch(source, /useEffect/);
    assert.doesNotMatch(source, /window\.location/);
    assert.doesNotMatch(source, /\/#work/);
  });

  it("resolves legacy detail aliases before redirecting or returning not found", () => {
    const source = readSource("app/projects/[slug]/page.tsx");

    assert.match(source, /resolveLegacyWorkHref/);
    assert.match(source, /legacyWorkSlugs/);
    assert.match(source, /notFound\(\s*\)/);
    assert.match(source, /permanentRedirect\(\s*href\s*\)/);

    for (const legacyConcern of [
      /ProjectDetail/,
      /KotaDetail/,
      /generateMetadata/,
      /JsonLd/,
      /projectData/,
      /https:\/\/kumma\.me\/projects\//,
    ]) {
      assert.doesNotMatch(source, legacyConcern);
    }
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
});
