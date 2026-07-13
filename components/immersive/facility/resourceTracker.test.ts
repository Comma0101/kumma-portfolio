import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createResourceTracker,
  withTrackedResources,
} from "./resourceTracker";

interface FakeDisposable {
  readonly id: string;
  dispose(): void;
}

function fake(id: string, events: string[]): FakeDisposable {
  return { id, dispose: () => events.push(`dispose ${id}`) };
}

describe("facility resource tracker", () => {
  it("registers each resource once and disposes idempotently", () => {
    const events: string[] = [];
    const tracker = createResourceTracker();
    const geometry = fake("geometry", events);
    const material = fake("material", events);

    tracker.track(geometry);
    tracker.track(geometry);
    tracker.track(material);
    tracker.dispose();
    tracker.dispose();

    assert.deepEqual(events.sort(), ["dispose geometry", "dispose material"]);
    assert.equal(tracker.size, 0);
  });

  it("cleans partial construction before rethrowing the original failure", () => {
    const events: string[] = [];
    const failure = new Error("builder failed");

    assert.throws(
      () =>
        withTrackedResources((tracker) => {
          tracker.track(fake("geometry", events));
          tracker.track(fake("material", events));
          throw failure;
        }),
      failure,
    );
    assert.deepEqual(events.sort(), ["dispose geometry", "dispose material"]);
  });
});
