import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chapters } from "../components/home/chapters";
import { systemEvidence } from "./systemEvidence";
import {
  featuredWork,
  getWorkProject,
  labWork,
  validateWorkProjects,
  workProjects,
  workVisualKeys,
  type WorkProject,
} from "./workProjects";

if (false) {
  // @ts-expect-error Catalog summaries are readonly for callers.
  featuredWork[0].summary = "mutated summary";

  // @ts-expect-error Nested evidence is readonly for callers.
  featuredWork[0].evidence.input = "mutated input";

  // @ts-expect-error Nested primary actions are readonly for callers.
  featuredWork[0].primaryAction!.label = "mutated label";
}

function replaceProject(
  slug: string,
  replacement: unknown,
): unknown[] {
  return workProjects.map((project) =>
    project.slug === slug ? replacement : project,
  );
}

function assertValidationError(
  projects: readonly unknown[],
  expected: RegExp,
): void {
  let errors: string[] = [];

  assert.doesNotThrow(() => {
    errors = validateWorkProjects(projects);
  });

  assert.ok(errors.length > 0, "expected validation to report an error");
  assert.match(errors.join("\n"), expected);
}

describe("work project catalog", () => {
  it("keeps the approved featured work in canonical order", () => {
    assert.deepEqual(
      featuredWork.map((project) => project.slug),
      ["kota", "audiobook", "archon", "splash-ink"],
    );
  });

  it("keeps the approved lab work in canonical order", () => {
    assert.deepEqual(
      labWork.map((project) => project.slug),
      ["spectral-world", "robinhood-dashboard"],
    );
  });

  it("uses unique slugs", () => {
    const slugs = workProjects.map((project) => project.slug);

    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("derives every canonical href from its slug", () => {
    for (const project of workProjects) {
      assert.equal(project.href, `/work/${project.slug}`);
    }
  });

  it("provides non-empty evidence for every project", () => {
    for (const project of workProjects) {
      for (const [field, value] of Object.entries(project.evidence)) {
        assert.ok(
          value.trim().length > 0,
          `${project.slug} evidence.${field} must not be blank`,
        );
      }
    }
  });

  it("publishes the visual keys in registry order", () => {
    assert.deepEqual(workVisualKeys, [
      "kota",
      "audiobook",
      "archon",
      "splash-ink",
      "spectral-world",
      "ledger",
    ]);
  });

  it("validates the canonical catalog", () => {
    assert.deepEqual(validateWorkProjects(workProjects), []);
  });

  it("finds a project by slug", () => {
    assert.equal(getWorkProject("kota")?.title, "KOTA");
  });

  it("returns undefined for an unknown slug", () => {
    assert.equal(getWorkProject("not-a-project"), undefined);
  });
});

describe("validateWorkProjects", () => {
  it("reports duplicate slugs", () => {
    assertValidationError([...workProjects, workProjects[0]], /duplicate.*slug/i);
  });

  it("reports an href that does not match its slug", () => {
    const malformed = {
      ...workProjects[0],
      href: "/work/not-kota",
    };

    assertValidationError(replaceProject("kota", malformed), /href.*kota/i);
  });

  it("reports an unknown visual key", () => {
    const malformed = {
      ...workProjects[0],
      visualKey: "unknown-visual",
    };

    assertValidationError(
      replaceProject("kota", malformed),
      /visual.*unknown-visual/i,
    );
  });

  it("reports blank evidence", () => {
    const malformed: WorkProject = {
      ...workProjects[0],
      evidence: { ...workProjects[0].evidence, input: "   " },
    };

    assertValidationError(
      replaceProject("kota", malformed),
      /evidence\.input.*blank/i,
    );
  });

  it("reports blank public metadata", () => {
    for (const field of ["statusLabel", "artifact", "summary"] as const) {
      const malformed: WorkProject = {
        ...workProjects[0],
        [field]: "   ",
      };

      assertValidationError(
        replaceProject("kota", malformed),
        new RegExp(`${field}.*blank`, "i"),
      );
    }
  });

  it("reports an invalid tier at runtime", () => {
    const malformed = {
      ...workProjects[0],
      tier: "archive",
    };

    assertValidationError(replaceProject("kota", malformed), /tier.*archive/i);
  });

  it("reports an invalid status at runtime", () => {
    const malformed = {
      ...workProjects[0],
      status: "planned",
    };

    assertValidationError(
      replaceProject("kota", malformed),
      /status.*planned/i,
    );
  });

  it("reports non-object entries instead of throwing", () => {
    for (const entry of [null, "not-an-object"]) {
      assertValidationError([entry], /index 0.*object/i);
    }
  });

  it("reports missing evidence instead of throwing", () => {
    const { evidence: _evidence, ...malformed } = workProjects[0];

    assertValidationError([malformed], /evidence.*object/i);
  });

  it("reports null evidence instead of throwing", () => {
    const malformed = {
      ...workProjects[0],
      evidence: null,
    };

    assertValidationError([malformed], /evidence.*object/i);
  });

  it("reports a blank slug", () => {
    const malformed: WorkProject = {
      ...workProjects[0],
      slug: "   ",
    };

    assertValidationError([malformed], /slug.*blank/i);
  });

  it("reports blank identity text", () => {
    for (const field of ["no", "title"] as const) {
      const malformed: WorkProject = {
        ...workProjects[0],
        [field]: "   ",
      };

      assertValidationError(
        [malformed],
        new RegExp(`${field}.*blank`, "i"),
      );
    }
  });
});

describe("work catalog compatibility adapters", () => {
  it("derives homepage chapters from featured work", () => {
    const expectedChapters = featuredWork.map((project) => ({
      no: project.no,
      title: project.title,
      href: project.href,
      blurb: project.summary,
      tags: project.tags,
      layout: project.layout,
      evidence: project.evidence,
      artifact: project.artifact,
      ...(project.primaryAction
        ? { secondary: project.primaryAction }
        : {}),
    }));

    assert.deepEqual(chapters, expectedChapters);
  });

  it("keeps ARCHON system evidence on its canonical work route", () => {
    const archon = systemEvidence.find((item) => item.slug === "archon");

    assert.equal(archon?.href, "/work/archon");
  });
});
