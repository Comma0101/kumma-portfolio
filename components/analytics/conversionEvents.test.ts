import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  CONVERSION_EVENT_CHANNEL,
  conversionEventNames,
  createConversionEvent,
  dispatchConversionEvent,
  forwardConversionDetail,
  safeTrackConversion,
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

describe("conversion forwarding runtime behavior", () => {
  function trackingStub() {
    const calls: Array<{ via: string; event: string; payload: unknown }> = [];
    return {
      calls,
      umami: {
        track: (event: string, payload?: Record<string, string>) =>
          calls.push({ via: "umami", event, payload }),
      },
      gtag: (
        _command: "event",
        event: string,
        payload?: Record<string, string>,
      ) => calls.push({ via: "gtag", event, payload }),
    };
  }

  it("forwards allow-listed events with a rebuilt source-only payload", () => {
    const stub = trackingStub();
    const via = forwardConversionDetail(
      {
        event: "mailto_submit",
        source: "contact",
        email: "leak@example.com",
        name: "Leaky",
      },
      stub,
    );

    assert.equal(via, "umami");
    assert.equal(stub.calls.length, 1);
    assert.deepEqual(stub.calls[0].payload, { source: "contact" });
    assert.ok(!JSON.stringify(stub.calls[0]).includes("leak@example.com"));
  });

  it("prefers umami and falls back to gtag", () => {
    const stub = trackingStub();
    const viaGtag = forwardConversionDetail(
      { event: "demo_open", source: "hero" },
      { gtag: stub.gtag },
    );

    assert.equal(viaGtag, "gtag");
    assert.deepEqual(stub.calls[0].payload, { source: "hero" });
  });

  it("drops unknown events and malformed details without forwarding", () => {
    const stub = trackingStub();

    assert.equal(
      forwardConversionDetail({ event: "not_allowed", source: "hero" }, stub),
      null,
    );
    assert.equal(forwardConversionDetail({ event: "demo_open" }, stub), null);
    assert.equal(forwardConversionDetail(null, stub), null);
    assert.equal(forwardConversionDetail("demo_open", stub), null);
    assert.equal(stub.calls.length, 0);
  });

  it("is a no-op when no tracking vendor exists", () => {
    assert.equal(
      forwardConversionDetail({ event: "demo_open", source: "hero" }, {}),
      null,
    );
  });
});

describe("safe click-side tracking", () => {
  it("never throws for invalid input and reports failure", () => {
    assert.equal(safeTrackConversion("unknown" as never, "hero"), false);
    assert.equal(safeTrackConversion("demo_open", "  "), false);
  });

  it("reports success for valid events even without a window", () => {
    assert.equal(safeTrackConversion("demo_open", "hero"), true);
  });
});

describe("conversion instrumentation source contracts", () => {
  it("keeps TrackedLink an ordinary link with a pre-navigation event", () => {
    const source = readSource("components/analytics/TrackedLink.tsx");

    assert.match(source, /["']use client["']/);
    assert.match(source, /safeTrackConversion/);
    assert.doesNotMatch(source, /preventDefault/);
  });

  it("forwards only allow-listed events through the tested pure helper", () => {
    const source = readSource("components/analytics/ConversionListener.tsx");

    assert.match(source, /["']use client["']/);
    assert.match(source, /CONVERSION_EVENT_CHANNEL/);
    assert.match(source, /forwardConversionDetail/);
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
