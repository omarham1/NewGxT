import { describe, expect, it } from "vitest";
import { computeHtfSwingPoints } from "../src/htf-swing.js";
import type { Bar } from "../src/types.js";
import {
  pineUnmitigatedSwingCount,
  simulatePineSwingLifecycle,
  simulatePineSwingLifecycleSampledMitigation,
} from "./helpers/pine-swing-lifecycle.js";

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const SUN_DEC_22_OPEN = 1734908400000;
const SUN_JAN_5_OPEN = 1736118000000;
const MON_JAN_6_EVAL = 1736208000000;

const PWH = 5200;
const PWL = 4700;
const CURRENT_WEEK_HIGH = 5100;
const CURRENT_WEEK_LOW = 5000;

function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close };
}

function fractalSwingHighSequence(startTime: number): Bar[] {
  return [
    bar(startTime, 5010, 5020, 5005, 5015),
    bar(startTime + HOUR_MS, 5015, 5030, 5010, 5025),
    bar(startTime + 2 * HOUR_MS, 5025, 5040, 5020, 5035),
    bar(startTime + 3 * HOUR_MS, 5035, 5100, 5030, 5090),
    bar(startTime + 4 * HOUR_MS, 5090, 5050, 5045, 5048),
    bar(startTime + 5 * HOUR_MS, 5048, 5045, 5035, 5040),
    bar(startTime + 6 * HOUR_MS, 5040, 5035, 5025, 5030),
  ];
}

function weeklyInput() {
  return {
    pwh: PWH,
    pwl: PWL,
    currentWeekHigh: CURRENT_WEEK_HIGH,
    currentWeekLow: CURRENT_WEEK_LOW,
    adr: 100,
  };
}

function chainedSwingHighSequences(
  firstStart: number,
  firstPeak: number,
  secondPeak: number,
): Bar[] {
  const plateau = (peak: number) => peak - 5;
  const seqHigh = (startTime: number, peak: number) => {
    const p = plateau(peak);
    return [
      bar(startTime, 5084, 5088, 5083, 5085),
      bar(startTime + HOUR_MS, 5085, 5089, 5083, 5087),
      bar(startTime + 2 * HOUR_MS, 5087, 5089, 5085, 5088),
      bar(startTime + 3 * HOUR_MS, 5088, peak, 5085, 5089),
      bar(startTime + 4 * HOUR_MS, p, p + 2, p - 2, p),
      bar(startTime + 5 * HOUR_MS, p, p + 2, p - 2, p),
      bar(startTime + 6 * HOUR_MS, p, p + 2, p - 2, p),
    ];
  };
  const first = seqHigh(firstStart, firstPeak);
  const paddingStart = firstStart + first.length * HOUR_MS;
  const secondStart = paddingStart + 7 * HOUR_MS;
  const padding = Array.from({ length: 7 }, (_, index) =>
    bar(paddingStart + index * HOUR_MS, 5085, 5087, 5083, 5085),
  );
  return [...first, ...padding, ...seqHigh(secondStart, secondPeak)];
}

function engineActiveCount(
  bars1h: Bar[],
  asOf: number,
  mitigationBars: Bar[] = [],
): number {
  return computeHtfSwingPoints({
    bars4h: [],
    bars1h,
    mitigationBars,
    ...weeklyInput(),
    asOf,
  }).length;
}

function pineActiveCount(
  bars1h: Bar[],
  asOf: number,
  mitigationBars: Bar[] = [],
): number {
  return simulatePineSwingLifecycle(
    {
      htfBars: bars1h,
      mitigationBars,
      ...weeklyInput(),
    },
    asOf,
  );
}

describe("HTF Swing / Pine parity", () => {
  it("matches Pine active swing count for unmitigated fractals", () => {
    const bars = fractalSwingHighSequence(SUN_JAN_5_OPEN);

    expect(engineActiveCount(bars, MON_JAN_6_EVAL)).toBe(
      pineActiveCount(bars, MON_JAN_6_EVAL),
    );
  });

  it("matches Pine active swing count when price is outside the weekly envelope", () => {
    const bars = fractalSwingHighSequence(SUN_JAN_5_OPEN).map((b) =>
      b.high === 5100 ? { ...b, high: 5250, close: 5240 } : b,
    );

    expect(engineActiveCount(bars, MON_JAN_6_EVAL)).toBe(0);
    expect(pineActiveCount(bars, MON_JAN_6_EVAL)).toBe(0);
  });

  it("matches Pine active swing count after mitigation in a prior session", () => {
    const bars = fractalSwingHighSequence(SUN_JAN_5_OPEN);
    const confirmedAt = SUN_JAN_5_OPEN + 6 * HOUR_MS;
    const mitigatedAt = confirmedAt + HOUR_MS;
    const mitigationBars = [bar(mitigatedAt, 5095, 5101, 5090, 5098)];

    expect(engineActiveCount(bars, MON_JAN_6_EVAL, mitigationBars)).toBe(0);
    expect(pineActiveCount(bars, MON_JAN_6_EVAL, mitigationBars)).toBe(0);
  });

  it("matches Pine visible swing count when mitigation stays in the current session", () => {
    const bars = fractalSwingHighSequence(SUN_JAN_5_OPEN);
    const confirmedAt = SUN_JAN_5_OPEN + 6 * HOUR_MS;
    const mitigatedAt = confirmedAt + HOUR_MS;
    const mitigationBars = [bar(mitigatedAt, 5095, 5101, 5090, 5098)];

    expect(engineActiveCount(bars, mitigatedAt, mitigationBars)).toBe(1);
    expect(pineActiveCount(bars, mitigatedAt, mitigationBars)).toBe(1);
  });

  it("misses mitigation when only one 1m sample is checked per HTF chart bar", () => {
    const bars = fractalSwingHighSequence(SUN_JAN_5_OPEN);
    const confirmedAt = SUN_JAN_5_OPEN + 6 * HOUR_MS;
    const sweptAt = confirmedAt + 15 * MINUTE_MS;
    const nextHourSample = confirmedAt + HOUR_MS;
    const mitigationBars = [
      bar(sweptAt, 5095, 5101, 5090, 5098),
      bar(nextHourSample, 5090, 5095, 5085, 5090),
    ];

    expect(
      simulatePineSwingLifecycleSampledMitigation(
        { htfBars: bars, mitigationBars, ...weeklyInput() },
        nextHourSample,
      ),
    ).toBe(1);
    expect(
      pineUnmitigatedSwingCount(
        { htfBars: bars, mitigationBars, ...weeklyInput() },
        nextHourSample,
      ),
    ).toBe(0);
  });

  it("matches Pine active swing count across CME week lookback boundaries", () => {
    const expired = fractalSwingHighSequence(SUN_DEC_22_OPEN);

    expect(engineActiveCount(expired, MON_JAN_6_EVAL)).toBe(
      pineActiveCount(expired, MON_JAN_6_EVAL),
    );
    expect(engineActiveCount(expired, MON_JAN_6_EVAL)).toBe(0);
  });

  it("matches Pine visible swing count for same-timeframe ADR proximity clusters", () => {
    const bars = chainedSwingHighSequences(SUN_JAN_5_OPEN, 5090, 5100);
    const asOf = SUN_JAN_5_OPEN + 20 * HOUR_MS;

    expect(engineActiveCount(bars, asOf)).toBe(1);
    expect(pineActiveCount(bars, asOf)).toBe(1);
    expect(engineActiveCount(bars, asOf)).toBe(pineActiveCount(bars, asOf));
  });
});
