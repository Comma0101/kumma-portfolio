import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";

process.env.NODE_PATH = path.resolve(process.cwd(), "node_modules");
const nodeModule = require("node:module") as {
  readonly Module: { _initPaths(): void };
};
nodeModule.Module._initPaths();
const {
  orchestrationRoutePoints,
  orchestrationStateAt,
} = require("./orchestration") as typeof import("./orchestration");

function allFinite(state: ReturnType<typeof orchestrationStateAt>): boolean {
  return Object.values(state).every((value) => {
    if (typeof value === "number") return Number.isFinite(value);
    if (value && typeof value === "object" && "x" in value) {
      return Object.values(value).every(
        (coordinate) => typeof coordinate !== "number" || Number.isFinite(coordinate),
      );
    }
    return true;
  });
}

describe("ARCHON orchestration route", () => {
  it("delivers the foundry route to the coordinator before attempting work", () => {
    const incoming = orchestrationStateAt(0.14);
    const received = orchestrationStateAt(0.24);

    assert.ok(incoming.incomingProgress > 0);
    assert.equal(incoming.workerProgress, 0);
    assert.equal(incoming.recoveryProgress, 0);
    assert.equal(incoming.movingHead, "incoming");
    assert.equal(received.incomingProgress, 1);
    assert.ok(received.workerProgress > 0);
  });

  it("attempts the worker route before activating recovery", () => {
    const attempted = orchestrationStateAt(0.46);
    const recovering = orchestrationStateAt(0.76);

    assert.ok(attempted.workerProgress > 0);
    assert.equal(attempted.recoveryProgress, 0);
    assert.equal(attempted.movingHead, "worker");
    assert.equal(recovering.workerProgress, 1);
    assert.ok(recovering.recoveryProgress > 0);
    assert.equal(recovering.movingHead, "recovery");
  });

  it("stops the blocked worker trace at its authored safety boundary", () => {
    const blocked = orchestrationStateAt(0.58);
    const boundary = orchestrationRoutePoints.worker.at(-1)!;

    assert.equal(blocked.blocked, true);
    assert.equal(blocked.workerProgress, 1);
    assert.deepEqual(blocked.headPosition, boundary);
    assert.equal(blocked.movingHead, null);
  });

  it("keeps the attempted and recovered trace inspectable after resolution", () => {
    const resolved = orchestrationStateAt(1);

    assert.equal(resolved.phase, "resolved");
    assert.equal(resolved.incomingProgress, 1);
    assert.equal(resolved.workerProgress, 1);
    assert.equal(resolved.recoveryProgress, 1);
    assert.equal(resolved.blocked, true);
    assert.equal(resolved.movingHead, null);
    assert.deepEqual(
      resolved.headPosition,
      orchestrationRoutePoints.recovery.at(-1),
    );
  });

  it("moves only one route head at a time", () => {
    for (let index = 0; index <= 100; index += 1) {
      const state = orchestrationStateAt(index / 100);
      const movingRoutes = [
        state.movingHead === "incoming",
        state.movingHead === "worker",
        state.movingHead === "recovery",
      ].filter(Boolean);
      assert.ok(movingRoutes.length <= 1);
      assert.ok(allFinite(state));
    }
  });

  it("clamps and returns exact prior states during reverse sampling", () => {
    assert.deepEqual(orchestrationStateAt(-1), orchestrationStateAt(0));
    assert.deepEqual(orchestrationStateAt(2), orchestrationStateAt(1));

    const forward = [0.08, 0.31, 0.58, 0.82, 1].map(orchestrationStateAt);
    const reverse = [1, 0.82, 0.58, 0.31, 0.08]
      .map(orchestrationStateAt)
      .reverse();
    assert.deepEqual(reverse, forward);
  });
});
