import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Bar } from "../../src/types.js";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures");

export function loadFixture(name: string): Bar[] {
  const raw = readFileSync(join(fixturesDir, `${name}.json`), "utf-8");
  return JSON.parse(raw) as Bar[];
}
