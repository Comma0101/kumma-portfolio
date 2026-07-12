import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  CONVERSION_EVENT_CHANNEL,
  conversionEventNames,
  createConversionEvent,
  dispatchConversionEvent,
} from "./conversionEvents";

function readSource(file: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), file), "utf8");
}

describe("conversion event contract", () => {
  it("creates allow-listed events with only an event name and source", () => {
    assert.deepEqual(createConversionEvent("project_start", { source: "hero" }), {
      event: "project_start",
      source: "hero",
    });
  });

  it("rejects unknown event names", () => {
    assert.throws(() =>
      createConversionEvent("unknown" as never, { source: "hero" }),
    );
    assert.throws(() =>
      createConversionEvent("unknown" as never, {} as never),
    );
  });

  it("rejects blank sources", () => {
    assert.throws(() =>
      createConversionEvent("contact_open", { source: "  " }),
    );
  });

  it("publishes exactly the approved funnel vocabulary", () => {
    assert.deepEqual(
      [...conversionEventNames].sort(),
      [
        "case_study_open",
        "contact_open",
        "demo_open",
        "mailto_submit",
        "project_start",
      ],
    );
  });

  it("never includes personal or form data in an event payload", () => {
    const serialized = JSON.stringify(
      createConversionEvent("contact_open", { source: "contact" }),
    );
    assert.ok(!serialized.includes("email"));
    assert.ok(!serialized.match(/name|problem|stack|budget|timeline|message/i));
  });

  it("is a harmless no-op without a browser window", () => {
    assert.doesNotThrow(() =>
      dispatchConversionEvent(
        createConversionEvent("demo_open", { source: "hero" }),
      ),
    );
    assert.equal(CONVERSION_EVENT_CHANNEL, "kumma:conversion");
  });
});

describe("conversion instrumentation source contracts", () => {
  it("keeps TrackedLink an ordinary link with a pre-navigation event", () => {
    const source = readSource("components/analytics/TrackedLink.tsx");

    assert.match(source, /["']use client["']/);
    assert.match(source, /dispatchConversionEvent/);
    assert.match(source, /createConversionEvent/);
    assert.doesNotMatch(source, /preventDefault/);
  });

  it("forwards only allow-listed events with a source-only payload", () => {
    const source = readSource("components/analytics/ConversionListener.tsx");

    assert.match(source, /["']use client["']/);
    assert.match(source, /CONVERSION_EVENT_CHANNEL/);
    assert.match(source, /conversionEventNames/);
    assert.match(source, /\{\s*source:/);
    assert.doesNotMatch(source, /email|formData|detail\.name/);
  });

  it("mounts the listener with the analytics integration", () => {
    const source = readSource("components/Analytics.tsx");

    assert.match(source, /ConversionListener/);
  });

  it("tags the primary conversion surfaces with stable sources", () => {
    const surfaces = [
      ["components/home/HeroSection.tsx", /source=["']hero["']/],
      ["components/home/ChapterIndex.tsx", /source=["']featured-work["']/],
      [
        "components/home/CapabilitiesSection.tsx",
        /source=["']capabilities["']/,
      ],
      ["components/work/CaseStudyShell.tsx", /source=["']case-study["']/],
    ] as const;

    for (const [file, pattern] of surfaces) {
      assert.match(readSource(file), pattern, `${file} must tag its CTA`);
    }
  });

  it("reports contact intent without capturing form content", () => {
    const source = readSource("components/home/ContactSection.tsx");

    assert.match(
      source,
      /createConversionEvent\(["']mailto_submit["'],\s*\{\s*source:\s*["']contact["']\s*\}\)/,
    );
    assert.match(
      source,
      /createConversionEvent\(["']contact_open["'],\s*\{\s*source:\s*["']contact["']\s*\}\)/,
    );
    assert.doesNotMatch(
      source,
      /dispatchConversionEvent\([^)]*formData/,
      "analytics must never receive form data",
    );
  });
});
