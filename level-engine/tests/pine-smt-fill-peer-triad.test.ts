import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const pinePath = join(repoRoot, "pine/gxt-correlated-asset-indicator.pine");

function readPineSource(): string {
  return readFileSync(pinePath, "utf-8");
}

function countRequestSecurityCalls(source: string): number {
  return source.match(/request\.security\(/g)?.length ?? 0;
}

function countChartOneMinuteSecurityCalls(source: string): number {
  const matches = source.match(
    /request\.security\(\s*syminfo\.tickerid\s*,\s*"1"\s*,/g,
  );
  return matches?.length ?? 0;
}

describe("pine peer triad → peer-first Active + SMT Fill Dead truncate (#55)", () => {
  it("keeps dynamic_requests false and adds two peer input.symbol inputs", () => {
    const source = readPineSource();

    expect(source).toMatch(/dynamic_requests\s*=\s*false/);
    expect(source.match(/input\.symbol\(/g)?.length ?? 0).toBe(2);
  });

  it("requests lean peer feeds only (gap-TF C3 high/low + 1m time/high/low)", () => {
    const source = readPineSource();

    expect(source).toMatch(/f_peer_tf_c3_bar\(\)\s*=>/);
    expect(source).toMatch(/f_peer_1m_bar\(\)\s*=>/);
    expect(source).toMatch(
      /f_peer_tf_c3_bar\(\)[\s\S]*?\bhigh\b[\s\S]*?\blow\b[\s\S]*?\btime\b/,
    );
    expect(source).toMatch(
      /f_peer_1m_bar\(\)[\s\S]*?\bhigh\b[\s\S]*?\blow\b[\s\S]*?\btime_close\b/,
    );

    for (const peer of ["peerSymbol1", "peerSymbol2"]) {
      for (const tf of ['"240"', '"60"', '"90"', '"30"', '"15"']) {
        expect(source).toMatch(
          new RegExp(
            `request\\.security\\(\\s*${peer}\\s*,\\s*${tf}\\s*,\\s*f_peer_tf_c3_bar\\(\\)`,
          ),
        );
      }
      expect(source).toMatch(
        new RegExp(
          `request\\.security\\(\\s*${peer}\\s*,\\s*"1"\\s*,\\s*f_peer_1m_bar\\(\\)`,
        ),
      );
    }

    expect(source).not.toMatch(
      /request\.security\(\s*peerSymbol[12]\s*,[\s\S]*?f_session_rails/,
    );
    expect(source).not.toMatch(
      /request\.security\(\s*peerSymbol[12]\s*,[\s\S]*?f_htf_swing/,
    );
  });

  it("keeps unique request.security under 40 and exactly one chart 1m call", () => {
    const source = readPineSource();

    expect(countRequestSecurityCalls(source)).toBeLessThan(40);
    expect(countChartOneMinuteSecurityCalls(source)).toBe(1);
    expect(source.match(/request\.security\(\s*syminfo\.tickerid/g)?.length).toBe(
      3,
    );
  });

  it("maps triad FVG Entry count to Idle / Active / Dead colors and Dead truncate", () => {
    const source = readPineSource();

    expect(source).toMatch(
      /SMT_FILL_DEAD_(?:BG|BORDER)\s*=\s*color\.new\(\s*color\.gray/,
    );
    expect(source).toMatch(/type HtfFvgZone[\s\S]*?bool hasPeer1FvgEntry/);
    expect(source).toMatch(/type HtfFvgZone[\s\S]*?bool hasPeer2FvgEntry/);
    expect(source).toMatch(/type HtfFvgZone[\s\S]*?int deadAt/);

    expect(source).toMatch(/f_apply_smt_fill_state\(/);
    expect(source).toMatch(
      /entryCount\s*>=\s*3[\s\S]*?SMT_FILL_DEAD_BG/,
    );
    expect(source).toMatch(
      /entryCount\s*>=\s*1[\s\S]*?SMT_FILL_ACTIVE_BG/,
    );
    expect(source).toMatch(/SMT_FILL_IDLE_BG/);
    expect(source).toMatch(
      /f_bar_index_for_time\(\s*deadAt\s*\)/,
    );
  });

  it("allows peer-first Active and same-bar Idle→Dead without requiring chart entry", () => {
    const source = readPineSource();

    expect(source).toMatch(/hasChartFvgEntry\s+or\s+chartNow/);
    expect(source).toMatch(/hasPeer1FvgEntry\s+or\s+peer1Now/);
    expect(source).toMatch(/hasPeer2FvgEntry\s+or\s+peer2Now/);
    expect(source).toMatch(/chartNow\s*=\s*f_fvg_entry_on_bar/);
    expect(source).toMatch(
      /peer1Now\s*=\s*not\s+na\(peer1TimeClose\)\s+and\s+f_fvg_entry_on_bar/,
    );
    expect(source).toMatch(
      /peer2Now\s*=\s*not\s+na\(peer2TimeClose\)\s+and\s+f_fvg_entry_on_bar/,
    );
    expect(source).toMatch(/f_fill_missing_peer_c3\(/);
    expect(source).toMatch(/f_update_smt_fill_entries\(/);
  });

  it("keeps Dead sticky without setting mitigated", () => {
    const source = readPineSource();

    expect(source).toMatch(
      /na\(\s*nextDeadAt\s*\)[\s\S]*?nextDeadAt\s*:=\s*completingTime/,
    );
    expect(source).toMatch(
      /HtfFvgZone\.new\([\s\S]*?zone\.mitigated\s*,\s*zone\.mitigatedTime[\s\S]*?SMT_FILL_DEAD_BG/,
    );
    expect(source).not.toMatch(
      /mitigated\s*=\s*true[\s\S]{0,80}?SMT_FILL_DEAD|SMT_FILL_DEAD[\s\S]{0,80}?mitigated\s*=\s*true/,
    );
  });

  it("does not implement CISD / PSP / Session POI emphasis in this ticket", () => {
    const source = readPineSource();

    expect(source).not.toMatch(/\bCISD\b/);
    expect(source).not.toMatch(/\bPSP\b/);
    expect(source).not.toMatch(/Session POI emphasis|SESSION_POI_EMPHASIS/i);
  });
});
