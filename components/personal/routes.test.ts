import test from "node:test";
import assert from "node:assert/strict";
import { isPaperRoute } from "./routes";

test("paper routes, with or without the trailing slash", () => {
  for (const path of ["/", "/work", "/work/", "/work/kota/", "/notes/same-light/zh/", "/studies", "/call/", "/benchmark", "/contact/"]) {
    assert.ok(isPaperRoute(path), path);
  }
});

test("the old site's pages and look-alike paths are not paper", () => {
  for (const path of ["/blog/", "/patterns/barge-in", "/about", "/gallery", "/workshop", "/notesy", "/build/"]) {
    assert.ok(!isPaperRoute(path), path);
  }
});

test("moved addresses are paper and point at paper", async () => {
  const { moved, movedFrom } = await import("./routes");
  for (const [from, { to }] of Object.entries(moved)) {
    assert.ok(isPaperRoute(from), from);
    assert.ok(isPaperRoute(to), to);
    assert.equal(movedFrom(`${from}/`)?.to, to);
  }
});
