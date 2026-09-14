import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const pinePath = join(repoRoot, "pine/gxt-correlated-asset-indicator.pine");

function readPineSource(): string {
  return readFileSync(pinePath, "utf-8");
}

describe("pine New Week Opening Gap", () => {
  it("draws a Session Context box from Friday close to week open on the 1m rails feed", () => {
    const source = readPineSource();

    expect(source).toMatch(/NWOG_MIN_TICKS\s*=\s*4/);
    expect(source).toMatch(
      /math\.abs\(out_nwog_week_open - out_nwog_friday_close\) > NWOG_MIN_TICKS \* syminfo\.mintick/,
    );
    expect(source).toMatch(/NWOG_FILL\s*=\s*color\.new\(\s*color\.gray,\s*96\s*\)/);
    expect(source).toMatch(
      /f_draw_nwog\([\s\S]*sessionEndBi/,
    );
    expect(source).not.toMatch(/nwogWeekEndBi/);
    expect(source).toMatch(/f_draw_nwog\(/);
    expect(source).toMatch(/"New Week Opening Gap"/);
    expect(source).toMatch(
      /"New Week Opening Gap"[\s\S]*?textcolor = LEVEL_COLOR/,
    );
    expect(source).toMatch(
      /f_session_rails_with_end\(\)[\s\S]*?out_nwog_friday_close[\s\S]*?\bhigh\b[\s\S]*?\blow\b[\s\S]*?\btime_close\b/,
    );
    expect(source).toMatch(
      /weekend_void = f_resolve_week_session_key\(time\[2\]\) != f_resolve_week_session_key\(time\)/,
    );
  });

  it("does not add a second chart 1m request.security for the gap", () => {
    const source = readPineSource();
    const chartOneMin = source.match(
      /request\.security\(\s*syminfo\.tickerid\s*,\s*"1"\s*,/g,
    );

    expect(chartOneMin).toHaveLength(1);
  });
});
