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

function abovePdhDisplacementGap(): Bar[] {
  return [
    bar(SUN_JAN_5_OPEN, 5150, 5160, 5140, 5152),
    bar(SUN_JAN_5_OPEN + HOUR_MS, 5152, 5175, 5151, 5170),
    bar(SUN_JAN_5_OPEN + 2 * HOUR_MS, 5170, 5185, 5165, 5180),
  ];
}

describe("HTF FVG", () => {
  it("detects a bullish FVG using wick extremes for zone boundaries", () => {
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
        zoneLow: 105,
        zoneHigh: 106,
        formedAt: SUN_JAN_5_OPEN + 2 * HOUR_MS,
      },
    ]);
  });

  it("detects a bearish FVG using wick extremes for zone boundaries", () => {
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
        zoneLow: 102,
        zoneHigh: 105,
        formedAt: SUN_JAN_5_OPEN + 2 * HOUR_MS,
      },
    ]);
  });

  it("includes unmitigated FVGs entirely above PDH", () => {
    const bars4h = abovePdhDisplacementGap();

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
        zoneLow: 5160,
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

  it("mitigates an FVG when price enters the wick-based zone", () => {
    const bars4h = currentWeekBullishGap();
    const mitigationBars = [
      bar(SUN_JAN_5_OPEN + 3 * HOUR_MS, 107, 108, 105, 107),
    ];

    const fvgs = computeHtfFvgs({
      bars4h,
      bars1h: [],
      mitigationBars,
      asOf: MON_JAN_6_EVAL,
    });

    expect(fvgs).toEqual([]);
  });

  it("mitigates an FVG when a later bar on the same HTF series enters the zone", () => {
    const bars4h = [
      ...currentWeekBullishGap(),
      bar(SUN_JAN_5_OPEN + 3 * HOUR_MS, 107, 108, 105, 107),
    ];

    const fvgs = computeHtfFvgs({
      bars4h,
      bars1h: [],
      mitigationBars: [],
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

  it("rejects a bullish gap when the middle candle range is fully inside the first candle", () => {
    const bars1h = [
      bar(SUN_JAN_5_OPEN, 100, 105, 99, 102),
      bar(SUN_JAN_5_OPEN + HOUR_MS, 102, 104, 101, 103),
      bar(SUN_JAN_5_OPEN + 2 * HOUR_MS, 106, 108, 106, 107),
    ];

    const fvgs = computeHtfFvgs({
      bars4h: [],
      bars1h,
      mitigationBars: [],
      asOf: MON_JAN_6_EVAL,
    });

    expect(fvgs).toEqual([]);
  });

  it("rejects a bearish gap when the middle candle range is fully inside the first candle", () => {
    const bars1h = [
      bar(SUN_JAN_5_OPEN, 103, 106, 100, 103),
      bar(SUN_JAN_5_OPEN + HOUR_MS, 103, 104, 101, 102),
      bar(SUN_JAN_5_OPEN + 2 * HOUR_MS, 96, 98, 95, 97),
    ];

    const fvgs = computeHtfFvgs({
      bars4h: [],
      bars1h,
      mitigationBars: [],
      asOf: MON_JAN_6_EVAL,
    });

    expect(fvgs).toEqual([]);
  });

  it("does not detect an FVG when FVG C3 closes without a gap", () => {
    const bars1h = [
      bar(SUN_JAN_5_OPEN, 100, 105, 98, 102),
      bar(SUN_JAN_5_OPEN + HOUR_MS, 102, 110, 101, 108),
      bar(SUN_JAN_5_OPEN + 2 * HOUR_MS, 108, 115, 104, 112),
    ];

    const fvgs = computeHtfFvgs({
      bars4h: [],
      bars1h,
      mitigationBars: [],
      asOf: MON_JAN_6_EVAL,
    });

    expect(fvgs).toEqual([]);
  });

  it("excludes an unmitigated gap outside the daily session lookback window", () => {
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
