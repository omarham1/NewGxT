import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

const neutralDayExecutionDocs = [
  "docs/daily_execution_playbook.md",
  "docs/adr/0003-daily-bias-and-target-selection.md",
] as const;

const retiredNeutralDayPhrases = [
  {
    label: "Consolidation / Failure Swing",
    pattern: /Consolidation\s*\/\s*Failure Swing/i,
  },
  {
    label: "Neutral Bias (Consolidation/Failure Swing",
    pattern: /Neutral Bias \(Consolidation\/Failure Swing/i,
  },
] as const;

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf-8");
}

describe("doc glossary alignment", () => {
  it("uses consolidation-only Neutral-day language in execution docs", () => {
    for (const docPath of neutralDayExecutionDocs) {
      const content = readRepoFile(docPath);
      for (const { label, pattern } of retiredNeutralDayPhrases) {
        expect(content, `${docPath} must not contain "${label}"`).not.toMatch(pattern);
      }
    }
  });
});
