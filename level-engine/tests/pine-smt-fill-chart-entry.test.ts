import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const pinePath = join(repoRoot, "pine/gxt-correlated-asset-indicator.pine");

function readPineSource(): string {
  return readFileSync(pinePath, "utf-8");
}

function countTopLevelRequestSecurityCalls(source: string): number {
  let count = 0;
  for (const line of source.split("\n")) {
    if (/= request\.security\(/.test(line)) {
      const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
      if (indent <= 1) {
        count++;
      }
    }
  }
  return count;
}

function countChartOneMinuteSecurityCalls(source: string): number {
  const matches = source.match(
    /request\.security\(\s*syminfo\.tickerid\s*,\s*"1"\s*,/g,
  );
  return matches?.length ?? 0;
}

describe("pine chart-symbol FVG Entry → Idle / Active (#54)", () => {
  it("keeps dynamic_requests false", () => {
    const source = readPineSource();
    expect(source).toMatch(/dynamic_requests\s*=\s*false/);
  });

  it("uses Idle light yellow and Active light blue instead of uniform teal for FVG boxes", () => {
    const source = readPineSource();

    expect(source).toMatch(
      /SMT_FILL_IDLE_(?:BG|COLOR)\s*=\s*color\.new\(\s*color\.yellow/,
    );
    expect(source).toMatch(
      /SMT_FILL_ACTIVE_(?:BG|COLOR)\s*=\s*color\.new\(\s*color\.blue/,
    );
    expect(source).toMatch(
      /HtfFvgZone\.new\([\s\S]*?SMT_FILL_IDLE/,
    );
    expect(source).toMatch(
      /hasChartFvgEntry[\s\S]*?SMT_FILL_ACTIVE/,
    );
    expect(source).not.toMatch(
      /HtfFvgZone\.new\([\s\S]*?FVG_COLOR/,
    );
    expect(source).not.toMatch(
      /box\.new\([\s\S]*?bgcolor\s*=\s*FVG_COLOR/,
    );
  });

  it("gates chart-symbol FVG Entry on 1m wick after FVG C3 close to C3 low/high", () => {
    const source = readPineSource();

    expect(source).toMatch(/type HtfFvgZone[\s\S]*?int fvgC3CloseAt/);
    expect(source).toMatch(/type HtfFvgZone[\s\S]*?bool hasChartFvgEntry/);
    expect(source).toMatch(
      /oneMinTime\s*>\s*(?:zone\.)?fvgC3CloseAt/,
    );
    expect(source).toMatch(
      /oneMinLow\s*<=\s*extreme\s+and\s+oneMinHigh\s*>=\s*extreme/,
    );
    expect(source).toMatch(
      /bullish\s*\?\s*zoneHigh\s*:\s*zoneLow/,
    );
    expect(source).toMatch(
      /f_session_rails_with_end\(\)[\s\S]*?\bhigh\b[\s\S]*?\blow\b[\s\S]*?\btime\b/,
    );
    expect(source).toMatch(
      /"1",[\s\S]*f_session_rails_with_end\(\)/,
    );
  });

  it("keeps exactly one top-level chart 1m request.security", () => {
    const source = readPineSource();

    expect(countTopLevelRequestSecurityCalls(source)).toBe(3);
    expect(countChartOneMinuteSecurityCalls(source)).toBe(1);
    expect(source.match(/request\.security\(/g)?.length ?? 0).toBe(3);
  });

  it("applies Idle/Active coloring to 15m with 30m/90m/1H/4H native FVG pools", () => {
    const source = readPineSource();

    expect(source).toContain('"15m FVG"');
    expect(source).toContain('"30m FVG"');
    expect(source).toContain('"90m FVG"');
    expect(source).toContain('"1H FVG"');
    expect(source).toContain('"4H FVG"');
    expect(source).toMatch(
      /f_update_chart_fvg_entry\([\s\S]*htfFvgs4h/,
    );
    expect(source).toMatch(
      /f_update_chart_fvg_entry\([\s\S]*htfFvgs1h/,
    );
    expect(source).toMatch(
      /f_update_chart_fvg_entry\([\s\S]*fvgs90m/,
    );
    expect(source).toMatch(
      /f_update_chart_fvg_entry\([\s\S]*fvgs30m/,
    );
    expect(source).toMatch(
      /f_update_chart_fvg_entry\([\s\S]*fvgs15m/,
    );
  });
});
