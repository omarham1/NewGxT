import { describe, expect, it } from "vitest";
import { computeHtfFvgs } from "../src/htf-fvg.js";
import type { Bar } from "../src/types.js";
import { simulatePineFvgLifecycle } from "./helpers/pine-fvg-lifecycle.js";

const HOUR_MS = 60 * 60 * 1000;
const SUN_DEC_22_OPEN = 1734908400000;
const FRI_JAN_3_CLOSE = 1735927200000;
const SUN_JAN_5_OPEN = 1736118000000;
const MON_JAN_6_EVAL = 1736208000000;
const SUN_JAN_12_OPEN = 1736722800000;

function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close };
}

function bullishGapAt(time: number): Bar[] {
  return [
    bar(time, 100, 105, 98, 102),
    bar(time + HOUR_MS, 102, 110, 101, 108),
    bar(time + 2 * HOUR_MS, 108, 115, 106, 112),
  ];
}

function engineActiveCount(bars: Bar[], asOf: number): number {
  return computeHtfFvgs({
    bars4h: [],
    bars1h: bars,
    mitigationBars: [],
    asOf,
  }).length;
}

describe("HTF FVG / Pine parity", () => {
  it("matches Pine active FVG count for unmitigated gaps", () => {
    const bars = bullishGapAt(SUN_JAN_5_OPEN);

    expect(engineActiveCount(bars, MON_JAN_6_EVAL)).toBe(
      simulatePineFvgLifecycle(bars, {}, MON_JAN_6_EVAL),
    );
  });

  it("matches Pine active FVG count after same-series close through the extreme in a prior session", () => {
    const bars = [
      ...bullishGapAt(SUN_JAN_5_OPEN),
      bar(SUN_JAN_5_OPEN + 3 * HOUR_MS, 107, 108, 104, 104),
    ];

    expect(engineActiveCount(bars, MON_JAN_6_EVAL)).toBe(0);
    expect(simulatePineFvgLifecycle(bars, {}, MON_JAN_6_EVAL)).toBe(0);
  });

  it("matches Pine active FVG count when close through the extreme removes the gap in the current session", () => {
    const formedAt = SUN_JAN_5_OPEN;
    const mitigatedAt = formedAt + 3 * HOUR_MS;
    const bars = [
      ...bullishGapAt(formedAt),
      bar(mitigatedAt, 107, 108, 104, 104),
    ];

    expect(engineActiveCount(bars, mitigatedAt)).toBe(0);
    expect(simulatePineFvgLifecycle(bars, {}, mitigatedAt)).toBe(0);
  });

  it("matches Pine active FVG count across daily session lookback boundaries", () => {
    const expired = bullishGapAt(SUN_DEC_22_OPEN);
    const priorFriday = bullishGapAt(FRI_JAN_3_CLOSE);
    const WED_JAN_8_EVENING = 1736380800000;

    expect(engineActiveCount(expired, MON_JAN_6_EVAL)).toBe(
      simulatePineFvgLifecycle(expired, {}, MON_JAN_6_EVAL),
    );
    expect(engineActiveCount(priorFriday, MON_JAN_6_EVAL)).toBe(
      simulatePineFvgLifecycle(priorFriday, {}, MON_JAN_6_EVAL),
    );
    expect(engineActiveCount(priorFriday, WED_JAN_8_EVENING)).toBe(
      simulatePineFvgLifecycle(priorFriday, {}, WED_JAN_8_EVENING),
    );
  });
});
