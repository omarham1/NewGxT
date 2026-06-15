import { describe, expect, it } from "vitest";
import { computeLevelSnapshot } from "../src/level-snapshot.js";
import { loadFixture } from "./helpers/load-fixture.js";
import type { Bar } from "../src/types.js";

const HOUR_MS = 60 * 60 * 1000;
const SUN_DEC_22_OPEN = 1734908400000;
const SUN_JAN_5_OPEN = 1736118000000;

function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close };
}

function abovePdhDisplacementGap(time: number): Bar[] {
  return [
    bar(time, 5150, 5160, 5140, 5152),
    bar(time + HOUR_MS, 5152, 5175, 5151, 5170),
    bar(time + 2 * HOUR_MS, 5170, 5185, 5165, 5180),
  ];
}

describe("Level Snapshot", () => {
  it("excludes mitigated HTF FVGs from the snapshot", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const bars4h = [
      bar(SUN_JAN_5_OPEN, 100, 105, 98, 102),
      bar(SUN_JAN_5_OPEN + HOUR_MS, 102, 110, 101, 108),
      bar(SUN_JAN_5_OPEN + 2 * HOUR_MS, 108, 115, 106, 112),
    ];
    const mitigationBars = [
      bar(SUN_JAN_5_OPEN + 3 * HOUR_MS, 107, 108, 105, 107),
    ];

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars,
    });

    expect(snapshot.htfFvgs).toEqual([]);
    expect(snapshot.pdh).toBe(5100);
    expect(snapshot.pdl).toBe(5000);
  });

  it("includes an unmitigated HTF FVG outside the Previous Day range in the snapshot", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const bars4h = abovePdhDisplacementGap(SUN_JAN_5_OPEN);

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars: [],
    });

    expect(snapshot.pdh).toBe(5100);
    expect(snapshot.pdl).toBe(5000);
    expect(snapshot.htfFvgs).toEqual([
      {
        timeframe: "4H",
        direction: "bullish",
        zoneLow: 5160,
        zoneHigh: 5165,
        formedAt: SUN_JAN_5_OPEN + 2 * HOUR_MS,
      },
    ]);
  });

  it("excludes an unmitigated HTF FVG outside the two-week lookback window", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const bars4h = abovePdhDisplacementGap(SUN_DEC_22_OPEN);

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars: [],
    });

    expect(snapshot.htfFvgs).toEqual([]);
  });
});
