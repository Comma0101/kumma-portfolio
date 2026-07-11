import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { collectTestFiles } from "./run-unit-tests.mjs";

test("collectTestFiles returns nested test files in stable order", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "kumma-test-discovery-"));
  await mkdir(path.join(root, "nested"));
  await writeFile(path.join(root, "z.test.js"), "");
  await writeFile(path.join(root, "nested", "a.test.js"), "");
  await writeFile(path.join(root, "nested", "ignore.js"), "");
  assert.deepEqual(
    (await collectTestFiles(root)).map((file) => path.relative(root, file)),
    ["nested/a.test.js", "z.test.js"],
  );
  await rm(root, { recursive: true, force: true });
});
