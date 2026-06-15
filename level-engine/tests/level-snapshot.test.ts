import { describe, expect, it } from "vitest";
import { computeLevelSnapshot } from "../src/level-snapshot.js";
import { loadFixture } from "./helpers/load-fixture.js";
import type { Bar } from "../src/types.js";

function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close };
}

describe("Level Snapshot", () => {
  it("excludes mitigated HTF FVGs from the snapshot", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const bars4h = [
      bar(1, 100, 105, 98, 102),
      bar(2, 102, 110, 101, 108),
      bar(3, 108, 115, 106, 112),
    ];
    const mitigationBars = [bar(4, 111, 113, 107, 112)];

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

  it("includes unmitigated HTF FVGs overlapping the Previous Day range", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const bars4h = [
      bar(1, 5020, 5030, 5010, 5025),
      bar(2, 5025, 5040, 5020, 5035),
      bar(3, 5035, 5050, 5030, 5045),
    ];

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars: [],
    });

    expect(snapshot.htfFvgs).toEqual([
      {
        timeframe: "4H",
        direction: "bullish",
        zoneLow: 5025,
        zoneHigh: 5035,
        formedAt: 3,
      },
    ]);
  });
});
