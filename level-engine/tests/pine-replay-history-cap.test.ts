import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  adrLookbackBarCap,
  barIndexForTime,
  barTimeSearchMax,
} from "./helpers/pine-replay-history.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const pinePath = join(repoRoot, "pine/gxt-correlated-asset-indicator.pine");

function readPineSource(): string {
  return readFileSync(pinePath, "utf-8");
}

describe("pine replay history cap (#30)", () => {
  it("declares calc_bars_count for 1m session-rails replay and keeps timeframe-aware session_bar_cap", () => {
    const source = readPineSource();

    expect(source).toMatch(/calc_bars_count\s*=\s*20160/);
    expect(source).toMatch(
      /session_bar_cap\s*=\s*int\(math\.ceil\(ADR_LOOKBACK \* CME_SESSION_MS \/ \(timeframe\.in_seconds\(\) \* 1000\)\)\)/,
    );
  });

  it("ties runtime scan depth to session_bar_cap and const max_bars_back ceiling", () => {
    const source = readPineSource();

    expect(source).toMatch(
      /BAR_TIME_SEARCH_MAX\s*=\s*math\.min\(PINE_BAR_TIME_SEARCH_CEILING,\s*session_bar_cap\s*-\s*1\)/,
    );
    expect(source).toContain("max_bars_back(time, 5000)");
  });

  it("clips off-window origin timestamps to the oldest searchable bar", () => {
    const source = readPineSource();

    expect(source).toMatch(/int found_i = max_i/);
    expect(source).toMatch(/result := bar_index - found_i/);
    expect(source).not.toMatch(
      /if result == bar_index and time\[max_i\] > target_time/,
    );
  });

  it("barIndexForTime clips to oldest searchable bar when target predates history", () => {
    const timeframeSeconds = 3600;
    const searchMax = barTimeSearchMaxFor(timeframeSeconds);
    const bars = Array.from({ length: 400 }, (_, i) => ({
      time: 1_000_000 + i * timeframeSeconds * 1000,
    }));
    const barIndex = bars.length - 1;
    const targetBeforeHistory = bars[0].time - timeframeSeconds * 1000;

    const result = barIndexForTime({
      bars,
      barIndex,
      targetTime: targetBeforeHistory,
      barTimeSearchMax: searchMax,
      timeframeSeconds,
    });

    expect(result).toBe(barIndex - searchMax);
    expect(result).not.toBe(barIndex);
  });

  it("barIndexForTime still resolves in-window session rail origin times", () => {
    const timeframeSeconds = 3600;
    const barTimeSearchMax = barTimeSearchMaxFor(timeframeSeconds);
    const bars = Array.from({ length: 50 }, (_, i) => ({
      time: 1_000_000 + i * timeframeSeconds * 1000,
    }));
    const barIndex = 49;
    const pdhOriginTime = bars[30].time;

    const result = barIndexForTime({
      bars,
      barIndex,
      targetTime: pdhOriginTime,
      barTimeSearchMax,
      timeframeSeconds,
    });

    expect(result).toBe(30);
  });

  it("documents the perf trade-off in ADR-0010", () => {
    const adr = readFileSync(
      join(repoRoot, "docs/adr/0010-pine-replay-history-cap.md"),
      "utf-8",
    );

    expect(adr).toMatch(/14.*session/i);
    expect(adr).toMatch(/four.*week/i);
    expect(adr).toMatch(/failure swing/i);
  });

  it("bounds time-index scan depth below Pine CE ceiling on coarse timeframes", () => {
    expect(barTimeSearchMaxFor(3600)).toBe(335);
    expect(barTimeSearchMaxFor(60)).toBe(4999);
  });
});

function barTimeSearchMaxFor(timeframeSeconds: number): number {
  return barTimeSearchMax(adrLookbackBarCap(timeframeSeconds));
}
