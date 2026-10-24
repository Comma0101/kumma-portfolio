import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "components", "personal");
const cjk = /[　-〿㐀-鿿＀-￯]/g;

test("every Chinese character on the page is in the subset font", () => {
  const covered = new Set(readFileSync(join(dir, "fonts", "NotoSerifTC-subset.txt"), "utf8").trim());
  const missing = new Set<string>();
  for (const file of [...readdirSync(dir).filter((name) => name.endsWith(".tsx")), "chapters.ts"]) {
    for (const char of readFileSync(join(dir, file), "utf8").match(cjk) ?? []) {
      if (!covered.has(char)) missing.add(char);
    }
  }
  assert.deepEqual([...missing], [], "run scripts/subset-cjk.py to re-subset the font");
});
