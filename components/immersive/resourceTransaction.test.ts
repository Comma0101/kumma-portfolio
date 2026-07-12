import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createResourceCandidateBundle,
  swapResourceCandidate,
} from "./resourceTransaction";

interface FakeResource {
  readonly id: string;
}

describe("resource candidate bundle", () => {
  it("disposes terrain when group construction fails and rethrows the cause", () => {
    const failure = new Error("group construction failed");
    const terrain = { id: "candidate-terrain" };
    let terrainDisposals = 0;

    assert.throws(
      () =>
        createResourceCandidateBundle({
          createTerrain: () => terrain,
          createGroups: () => {
            throw failure;
          },
          disposeTerrain: (resource) => {
            assert.equal(resource, terrain);
            terrainDisposals += 1;
          },
        }),
      failure,
    );
    assert.equal(terrainDisposals, 1);
  });
});

describe("transactional resource swap", () => {
  it("retains the current resource when candidate construction fails", () => {
    const current: FakeResource = { id: "current" };
    const failure = new Error("candidate failed");
    const events: string[] = [];

    const result = swapResourceCandidate(current, {
      createCandidate() {
        events.push("create candidate");
        throw failure;
      },
      attachCandidate: (resource) => events.push(`attach ${resource.id}`),
      detachCurrent: (resource) => events.push(`detach ${resource.id}`),
      disposeResource: (resource) => events.push(`dispose ${resource.id}`),
    });

    assert.equal(result.replaced, false);
    assert.equal(result.current, current);
    assert.equal(result.error, failure);
    assert.deepEqual(events, ["create candidate"]);
  });

  it("cleans a candidate that cannot attach without touching the current resource", () => {
    const current: FakeResource = { id: "current" };
    const candidate: FakeResource = { id: "candidate" };
    const failure = new Error("attach failed");
    const events: string[] = [];

    const result = swapResourceCandidate(current, {
      createCandidate() {
        events.push("create candidate");
        return candidate;
      },
      attachCandidate(resource) {
        events.push(`attach ${resource.id}`);
        throw failure;
      },
      detachCurrent: (resource) => events.push(`detach ${resource.id}`),
      disposeResource: (resource) => events.push(`dispose ${resource.id}`),
    });

    assert.equal(result.replaced, false);
    assert.equal(result.current, current);
    assert.equal(result.error, failure);
    assert.deepEqual(events, [
      "create candidate",
      "attach candidate",
      "dispose candidate",
    ]);
  });

  it("attaches a complete candidate before detaching and disposing the old resource", () => {
    const current: FakeResource = { id: "current" };
    const candidate: FakeResource = { id: "candidate" };
    const events: string[] = [];

    const result = swapResourceCandidate(current, {
      createCandidate() {
        events.push("create candidate");
        return candidate;
      },
      attachCandidate: (resource) => events.push(`attach ${resource.id}`),
      detachCurrent: (resource) => events.push(`detach ${resource.id}`),
      disposeResource: (resource) => events.push(`dispose ${resource.id}`),
    });

    assert.equal(result.replaced, true);
    assert.equal(result.current, candidate);
    assert.equal(result.error, undefined);
    assert.deepEqual(events, [
      "create candidate",
      "attach candidate",
      "detach current",
      "dispose current",
    ]);
  });

  it("can retire a pre-context-loss resource without disposing stale GPU handles", () => {
    const current: FakeResource = { id: "pre-loss" };
    const candidate: FakeResource = { id: "restored" };
    const events: string[] = [];

    const result = swapResourceCandidate(current, {
      createCandidate: () => candidate,
      attachCandidate: (resource) => events.push(`attach ${resource.id}`),
      detachCurrent: (resource) => events.push(`detach ${resource.id}`),
      disposeResource: (resource) => events.push(`dispose ${resource.id}`),
      retireCurrent: (resource) => events.push(`retire ${resource.id}`),
    });

    assert.equal(result.replaced, true);
    assert.equal(result.current, candidate);
    assert.deepEqual(events, [
      "attach restored",
      "detach pre-loss",
      "retire pre-loss",
    ]);
  });
});
