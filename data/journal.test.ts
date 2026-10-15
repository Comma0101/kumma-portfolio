import test from "node:test";
import assert from "node:assert/strict";
import { journal, net } from "./journal";

test("journal entries are newest first with valid ISO dates", () => {
  assert.ok(journal.length > 0);
  const times = journal.map((entry) => {
    assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/);
    const time = Date.parse(`${entry.date}T00:00:00Z`);
    assert.ok(Number.isFinite(time));
    return time;
  });
  for (let i = 1; i < times.length; i += 1) assert.ok(times[i] <= times[i - 1]);
});

test("every entry has a cost, at least one exit, and its lesson", () => {
  for (const entry of journal) {
    assert.ok(entry.cost > 0);
    assert.ok(entry.exits.length > 0 && entry.exits.every((exit) => exit > 0));
    assert.ok(entry.plan.trim() && entry.fact.trim() && entry.admission.trim());
  }
});

test("net is exits minus cost", () => {
  assert.equal(net({ cost: 75, exits: [170, 197] }), 292);
  assert.equal(net({ cost: 100, exits: [40] }), -60);
});

test("the first entry is the TSLA lotto Friday from the X post", () => {
  const first = journal.find((entry) => entry.date === "2026-10-09");
  assert.ok(first);
  assert.equal(first.cost, 75);
  assert.deepEqual(first.exits, [170, 197]);
});
