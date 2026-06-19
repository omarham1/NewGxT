import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const pinePath = "pine/gxt-correlated-asset-indicator.pine";

function readPineSource(): string {
  return readFileSync(join(repoRoot, pinePath), "utf-8");
}

function countRequestSecurityCalls(source: string): number {
  const matches = source.match(/request\.security\(/g);
  return matches?.length ?? 0;
}

describe("pine request.security merge (#24)", () => {
  it("defines composition wrappers for merged security calls", () => {
    const source = readPineSource();
    expect(source).toMatch(/f_session_rails_with_end\(\)\s*=>/);
    expect(source).toMatch(/f_htf_swing_and_fvg_signals\(\)\s*=>/);
  });

  it("uses one request.security call per timeframe via wrappers", () => {
    const source = readPineSource();
    expect(countRequestSecurityCalls(source)).toBe(3);
    expect(source).toMatch(/f_session_rails_with_end\(\)/);
    expect(source).not.toMatch(/f_session_rails\(\)\s*,\s*\n\s*gaps\s*=/);
    expect(source).not.toMatch(/f_current_daily_session_end\(\)\s*,\s*\n\s*gaps\s*=/);
    expect(source).not.toMatch(/f_htf_swing_signals\(\)\s*,\s*\n\s*gaps\s*=/);
    expect(source).not.toMatch(/f_detect_fvg_with_ohlc\(\)\s*,\s*\n\s*gaps\s*=/);
  });
});
