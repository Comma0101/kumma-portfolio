import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  discoveryPaths,
  researchPaths,
  workSitemapPaths,
} from "./discoveryRoutes";
import { workProjects } from "./workProjects";

function readSource(file: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), file), "utf8");
}

describe("discovery route source", () => {
  it("lists the work index and every canonical project exactly once", () => {
    assert.deepEqual(workSitemapPaths, [
      "/work",
      ...workProjects.map((project) => project.href),
    ]);
  });

  it("keeps the legacy projects namespace out of discovery", () => {
    assert.ok(workSitemapPaths.every((route) => !route.startsWith("/projects")));
    assert.ok(discoveryPaths.every((route) => !route.startsWith("/projects")));
  });

  it("keeps research proof routes independently listed", () => {
    for (const route of ["/benchmark", "/latency", "/patterns", "/blog"]) {
      assert.ok(
        researchPaths.includes(route),
        `${route} must stay a research discovery route`,
      );
    }
  });

  it("publishes unique discovery paths", () => {
    assert.equal(new Set(discoveryPaths).size, discoveryPaths.length);
  });

  it("includes core conversion and work routes", () => {
    for (const route of ["", "/contact", "/work", "/work/kota"]) {
      assert.ok(
        discoveryPaths.includes(route),
        `${route} must be discoverable`,
      );
    }
  });
});

describe("sitemap source contract", () => {
  it("builds from the single discovery source without legacy routes", () => {
    const source = readSource("app/sitemap.ts");

    assert.match(source, /discoveryPaths/);
    assert.doesNotMatch(source, /projectData/);
    assert.doesNotMatch(source, /\/projects\//);
  });
});

describe("canonical navigation contract", () => {
  it("routes the primary nav work link to the canonical index", () => {
    const source = readSource("components/Navigation.tsx");

    assert.match(
      source,
      /\{\s*name:\s*["']Work["']\s*,\s*href:\s*["']\/work["']\s*\}/,
    );
  });

  it("keeps the footer on the canonical work index", () => {
    const source = readSource("components/Footer.tsx");

    assert.match(
      source,
      /\{\s*label:\s*["']Work["']\s*,\s*href:\s*["']\/work["']\s*\}/,
    );
  });
});

describe("work collection structured data", () => {
  it("exports a collection with every canonical project URL", () => {
    const source = readSource("components/seo/JsonLd.tsx");

    assert.match(source, /workCollectionLd/);
    assert.match(source, /CollectionPage/);
    assert.match(source, /ItemList/);
    assert.match(source, /workProjects/);
  });

  it("renders the collection data on the work index page", () => {
    const source = readSource("app/work/page.tsx");

    assert.match(source, /JsonLd/);
    assert.match(source, /workCollectionLd/);
  });
});

describe("open graph coverage", () => {
  it("generates a card for the work index and every catalog project", () => {
    const source = readSource("scripts/generate-og.mjs");

    assert.match(source, /["']work["']/);
    for (const project of workProjects) {
      assert.ok(
        source.includes(`"${project.slug}"`),
        `generate-og.mjs must cover ${project.slug}`,
      );
    }
  });

  it("wires the generated cards into the new page metadata", () => {
    assert.match(readSource("app/work/page.tsx"), /\/og\/work\.png/);
    assert.match(
      readSource("app/work/splash-ink/page.tsx"),
      /\/og\/work-splash-ink\.png/,
    );
    assert.match(
      readSource("app/work/spectral-world/page.tsx"),
      /\/og\/work-spectral-world\.png/,
    );
  });
});
