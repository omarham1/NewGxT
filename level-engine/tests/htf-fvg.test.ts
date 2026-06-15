import { describe, expect, it } from "vitest";
import { computeHtfFvgs } from "../src/htf-fvg.js";
import type { Bar } from "../src/types.js";

const HOUR_MS = 60 * 60 * 1000;
const SUN_DEC_22_OPEN = 1734908400000;
const SUN_DEC_29_OPEN = 1735513200000;
const SUN_JAN_5_OPEN = 1736118000000;
const MON_JAN_6_EVAL = 1736208000000;

function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close };
}

function currentWeekBullishGap(): Bar[] {
  return [
    bar(SUN_JAN_5_OPEN, 100, 105, 98, 102),
    bar(SUN_JAN_5_OPEN + HOUR_MS, 102, 110, 101, 108),
    bar(SUN_JAN_5_OPEN + 2 * HOUR_MS, 108, 115, 106, 112),
  ];
}

function currentWeekBearishGap(): Bar[] {
  return [
    bar(SUN_JAN_5_OPEN, 110, 112, 105, 106),
    bar(SUN_JAN_5_OPEN + HOUR_MS, 106, 107, 98, 100),
    bar(SUN_JAN_5_OPEN + 2 * HOUR_MS, 100, 102, 94, 96),
  ];
}

describe("HTF FVG", () => {
  it("detects a bullish FVG using body extremes for zone boundaries", () => {
    const bars4h = currentWeekBullishGap();

    const fvgs = computeHtfFvgs({
      bars4h,
      bars1h: [],
      mitigationBars: [],
      asOf: MON_JAN_6_EVAL,
    });

    expect(fvgs).toEqual([
      {
        timeframe: "4H",
        direction: "bullish",
        zoneLow: 102,
        zoneHigh: 108,
        formedAt: SUN_JAN_5_OPEN + 2 * HOUR_MS,
      },
    ]);
  });

  it("detects a bearish FVG using body extremes for zone boundaries", () => {
    const bars1h = currentWeekBearishGap();

    const fvgs = computeHtfFvgs({
      bars4h: [],
      bars1h,
      mitigationBars: [],
      asOf: MON_JAN_6_EVAL,
    });

    expect(fvgs).toEqual([
      {
        timeframe: "1H",
        direction: "bearish",
        zoneLow: 100,
        zoneHigh: 106,
        formedAt: SUN_JAN_5_OPEN + 2 * HOUR_MS,
      },
    ]);
  });

  it("includes unmitigated FVGs entirely above PDH", () => {
    const bars4h = [
      bar(SUN_JAN_5_OPEN, 5150, 5160, 5140, 5155),
      bar(SUN_JAN_5_OPEN + HOUR_MS, 5155, 5170, 5150, 5165),
      bar(SUN_JAN_5_OPEN + 2 * HOUR_MS, 5165, 5180, 5160, 5175),
    ];

    const fvgs = computeHtfFvgs({
      bars4h,
      bars1h: [],
      mitigationBars: [],
      asOf: MON_JAN_6_EVAL,
    });

    expect(fvgs).toEqual([
      {
        timeframe: "4H",
        direction: "bullish",
        zoneLow: 5155,
        zoneHigh: 5165,
        formedAt: SUN_JAN_5_OPEN + 2 * HOUR_MS,
      },
    ]);
  });

  it("includes unmitigated FVGs entirely below PDL", () => {
    const bars1h = currentWeekBearishGap();

    const fvgs = computeHtfFvgs({
      bars4h: [],
      bars1h,
      mitigationBars: [],
      asOf: MON_JAN_6_EVAL,
    });

    expect(fvgs).toHaveLength(1);
    expect(fvgs[0]?.direction).toBe("bearish");
  });

  it("mitigates an FVG when price enters the body-based zone", () => {
    const bars4h = currentWeekBullishGap();
    const mitigationBars = [
      bar(SUN_JAN_5_OPEN + 3 * HOUR_MS, 111, 113, 107, 112),
    ];

    const fvgs = computeHtfFvgs({
      bars4h,
      bars1h: [],
      mitigationBars,
      asOf: MON_JAN_6_EVAL,
    });

    expect(fvgs).toEqual([]);
  });

  it("does not mitigate an FVG on its own formation bar", () => {
    const bars4h = currentWeekBullishGap();

    const fvgs = computeHtfFvgs({
      bars4h,
      bars1h: [],
      mitigationBars: bars4h,
      asOf: MON_JAN_6_EVAL,
    });

    expect(fvgs).toHaveLength(1);
  });

  it("excludes an unmitigated gap outside the two-week lookback window", () => {
    const bars4h = [
      bar(SUN_DEC_22_OPEN, 100, 105, 98, 102),
      bar(SUN_DEC_22_OPEN + HOUR_MS, 102, 110, 101, 108),
      bar(SUN_DEC_22_OPEN + 2 * HOUR_MS, 108, 115, 106, 112),
    ];

    const fvgs = computeHtfFvgs({
      bars4h,
      bars1h: [],
      mitigationBars: [],
      asOf: MON_JAN_6_EVAL,
    });

    expect(fvgs).toEqual([]);
  });
});
