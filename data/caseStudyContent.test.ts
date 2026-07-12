import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { caseStudies } from "./caseStudyContent";
import { getWorkProject } from "./workProjects";

function readSource(file: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), file), "utf8");
}

const studySlugs = Object.keys(caseStudies).sort();

describe("case study evidence integrity", () => {
  it("publishes exactly the two research case studies", () => {
    assert.deepEqual(studySlugs, ["spectral-world", "splash-ink"].sort());
  });

  it("labels both studies as active research", () => {
    assert.equal(caseStudies["splash-ink"].status, "Active R&D");
    assert.equal(caseStudies["spectral-world"].status, "Active R&D");
  });

  it("grounds each mechanism in the documented technology", () => {
    assert.ok(caseStudies["splash-ink"].mechanism.includes("Gaussian Splatting"));
    assert.ok(caseStudies["spectral-world"].mechanism.includes("Web Audio"));
  });

  it("keeps every study honest about failure modes and limits", () => {
    assert.ok(
      Object.values(caseStudies).every((study) => study.limits.length > 0),
    );
    for (const study of Object.values(caseStudies)) {
      for (const limit of study.limits) {
        assert.ok(limit.trim().length > 0, "limits must not be blank");
      }
    }
  });

  it("never claims customers, audiences, or measured outcomes", () => {
    assert.ok(!JSON.stringify(caseStudies).match(/client|increased|reduced by|%/i));
  });

  it("never uses employment or recruiting language", () => {
    assert.ok(
      !JSON.stringify(caseStudies).match(
        /full[- ]time|hire me|recruit|job seeker|r[ée]sum[ée]/i,
      ),
    );
  });

  it("keeps every narrative field substantive", () => {
    for (const [slug, study] of Object.entries(caseStudies)) {
      for (const field of [
        study.title,
        study.status,
        study.outcome,
        study.problem,
        study.constraint,
        study.mechanism,
        study.artifact,
      ]) {
        assert.ok(
          typeof field === "string" && field.trim().length > 0,
          `${slug} narrative fields must not be blank`,
        );
      }
      assert.ok(
        study.architecture.length >= 3,
        `${slug} must explain at least three architecture stages`,
      );
      for (const stage of study.architecture) {
        assert.ok(stage.name.trim().length > 0);
        assert.ok(stage.detail.trim().length > 0);
      }
    }
  });

  it("binds each study to a canonical catalog project", () => {
    for (const slug of studySlugs) {
      const project = getWorkProject(slug);
      assert.ok(project, `${slug} must exist in the work catalog`);
      assert.equal(project?.href, `/work/${slug}`);
      assert.equal(project?.statusLabel, "Active R&D");
    }
  });

  it("relates each study only to canonical internal routes", () => {
    for (const study of Object.values(caseStudies)) {
      assert.ok(study.related.length > 0);
      for (const related of study.related) {
        assert.ok(related.href.startsWith("/"));
        assert.ok(!related.href.startsWith("/projects"));
        assert.ok(related.label.trim().length > 0);
        assert.ok(related.note.trim().length > 0);
      }
    }
  });
});

describe("case study shell source contract", () => {
  it("renders the shared nine-part narrative with one heading root", () => {
    const source = readSource("components/work/CaseStudyShell.tsx");

    assert.doesNotMatch(source, /["']use client["']/);
    assert.equal(source.match(/<h1\b/g)?.length, 1);
    assert.match(source, /project\.statusLabel/);
    assert.match(source, /study\.outcome/);
    assert.match(source, /study\.problem/);
    assert.match(source, /study\.constraint/);
    assert.match(source, /project\.evidence\[key\]/);
    assert.match(source, /study\.mechanism/);
    assert.match(source, /study\.architecture/);
    assert.match(source, /study\.limits/);
    assert.match(source, /study\.artifact/);
    assert.match(source, /study\.related/);
    assert.match(source, /Build a system like this/);
    assert.match(source, /href=["']\/contact["']/);
    assert.match(source, /href=["']\/work["']/);
    assert.doesNotMatch(source, /coming soon|placeholder/i);
  });

  it("keeps the two case study components on shell plus registry visuals", () => {
    for (const [file, slug] of [
      ["components/SplashInkCaseStudy.tsx", "splash-ink"],
      ["components/SpectralWorldCaseStudy.tsx", "spectral-world"],
    ] as const) {
      const source = readSource(file);

      assert.match(source, /CaseStudyShell/);
      assert.match(source, new RegExp(`caseStudies\\[["']${slug}["']\\]`));
      assert.match(source, new RegExp(`getWorkProject\\(["']${slug}["']\\)`));
      assert.match(source, /vizBySlug/);
    }
  });
});
