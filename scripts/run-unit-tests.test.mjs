import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createRequire } from "node:module";
import * as unitTestRunner from "./run-unit-tests.mjs";

const { collectTestFiles } = unitTestRunner;

test("collectTestFiles returns nested test files in stable order", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "kumma-test-discovery-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "nested"));
  await writeFile(path.join(root, "z.test.js"), "");
  await writeFile(path.join(root, "nested", "a.test.js"), "");
  await writeFile(path.join(root, "nested", "ignore.js"), "");
  assert.deepEqual(
    (await collectTestFiles(root)).map((file) => path.relative(root, file)),
    ["nested/a.test.js", "z.test.js"],
  );
});

test("resolveTypeScriptCompiler returns the package-local CLI", () => {
  const require = createRequire(import.meta.url);

  assert.equal(
    unitTestRunner.resolveTypeScriptCompiler(),
    require.resolve("typescript/bin/tsc"),
  );
});

test("assertTestFilesFound rejects an empty discovered-file list", () => {
  assert.throws(
    () => unitTestRunner.assertTestFilesFound([]),
    /No compiled unit test files were found\./,
  );
});
