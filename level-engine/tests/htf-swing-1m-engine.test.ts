import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const pinePath = join(repoRoot, "pine/gxt-correlated-asset-indicator.pine");

function readPineSource(): string {
  return readFileSync(pinePath, "utf-8");
}

describe("HTF swing inventory chart-path mitigation (#31)", () => {
  it("keeps session rails on 1m security and chart-side swing lifecycle", () => {
    const source = readPineSource();

    expect(source).toMatch(
      /"1",[\s\S]*f_session_rails_with_end\(\)/,
    );
    expect(source).not.toMatch(/= f_session_rails_with_end\(\)/);
    expect(source).not.toMatch(/engineSwings/);
    expect(source).not.toMatch(/publishedSwings/);
    expect(source).toMatch(/activeSwings := f_try_add_swing\(/);
    expect(source).toMatch(
      /f_sweep_swings\(activeSwings, low, high, time\)/,
    );
    expect(source).not.toContain("f_sweep_swings_from_1m_bars(");
    expect(source).not.toContain("chartIs1m");
    expect(source).not.toContain("request.security_lower_tf(");
  });
});
