import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export async function collectTestFiles(root) {
  const testFiles = [];

  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (entry.isFile() && entry.name.endsWith(".test.js")) {
        testFiles.push(entryPath);
      }
    }
  }

  await visit(root);
  return testFiles.sort();
}

async function runUnitTests() {
  const outputDirectory = await mkdtemp(
    path.join(tmpdir(), "kumma-portfolio-tests-"),
  );

  try {
    const compilation = spawnSync(
      "tsc",
      ["-p", "tsconfig.unit-tests.json", "--outDir", outputDirectory],
      { stdio: "inherit" },
    );

    if (compilation.error) {
      console.error(compilation.error);
      return 1;
    }

    if (compilation.status !== 0) {
      return compilation.status ?? 1;
    }

    const testFiles = await collectTestFiles(outputDirectory);
    const tests = spawnSync(process.execPath, ["--test", ...testFiles], {
      stdio: "inherit",
    });

    if (tests.error) {
      console.error(tests.error);
      return 1;
    }

    return tests.status ?? 1;
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exitCode = await runUnitTests();
}
