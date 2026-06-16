import { describe, expect, it } from "vitest";
import { computeHtfSwingPoints } from "../src/htf-swing.js";
import type { Bar } from "../src/types.js";

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const SUN_DEC_22_OPEN = 1734908400000;
const SUN_JAN_5_OPEN = 1736118000000;
const MON_JAN_6_SESSION_OPEN = 1736204400000;
const MON_JAN_6_EVAL = 1736208000000;

const PWH = 5200;
const PWL = 4700;
const CURRENT_WEEK_HIGH = 5100;
const CURRENT_WEEK_LOW = 5000;

function swingInput(
  overrides: Partial<Parameters<typeof computeHtfSwingPoints>[0]> = {},
) {
  return {
    bars4h: [],
    bars1h: [],
    mitigationBars: [],
    pwh: PWH,
    pwl: PWL,
    currentWeekHigh: CURRENT_WEEK_HIGH,
    currentWeekLow: CURRENT_WEEK_LOW,
    asOf: MON_JAN_6_EVAL,
    ...overrides,
  };
}

function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close };
}

/** Seven 1H bars with a strict fractal(3) swing high at the pivot (index 3). */
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

/** Seven 1H bars with a strict fractal(3) swing low at the pivot (index 3). */
function fractalSwingLowSequence(startTime: number): Bar[] {
  return [
    bar(startTime, 5080, 5095, 5070, 5085),
    bar(startTime + HOUR_MS, 5085, 5088, 5060, 5065),
    bar(startTime + 2 * HOUR_MS, 5065, 5070, 5050, 5055),
    bar(startTime + 3 * HOUR_MS, 5055, 5060, 5000, 5010),
    bar(startTime + 4 * HOUR_MS, 5010, 5045, 5015, 5040),
    bar(startTime + 5 * HOUR_MS, 5040, 5055, 5035, 5050),
    bar(startTime + 6 * HOUR_MS, 5050, 5065, 5045, 5060),
  ];
}

describe("HTF Swing Points", () => {
  it("detects a strict fractal(3) swing high on 4H", () => {
    const bars4h = fractalSwingHighSequence(SUN_JAN_5_OPEN);

    const swings = computeHtfSwingPoints(
      swingInput({ bars4h }),
    );

    expect(swings).toEqual([
      {
        timeframe: "4H",
        kind: "high",
        price: 5100,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt: SUN_JAN_5_OPEN + 6 * HOUR_MS,
      },
    ]);
  });

  it("detects a strict fractal(3) swing low on 1H", () => {
    const bars1h = fractalSwingLowSequence(SUN_JAN_5_OPEN);

    const swings = computeHtfSwingPoints(
      swingInput({ bars1h }),
    );

    expect(swings).toEqual([
      {
        timeframe: "1H",
        kind: "low",
        price: 5000,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt: SUN_JAN_5_OPEN + 6 * HOUR_MS,
      },
    ]);
  });

  it("rejects a pivot that is not a strict fractal(3) extreme", () => {
    const bars4h = [
      bar(SUN_JAN_5_OPEN, 5010, 5020, 5005, 5015),
      bar(SUN_JAN_5_OPEN + HOUR_MS, 5015, 5030, 5010, 5025),
      bar(SUN_JAN_5_OPEN + 2 * HOUR_MS, 5025, 5040, 5020, 5035),
      bar(SUN_JAN_5_OPEN + 3 * HOUR_MS, 5035, 5045, 5030, 5040),
      bar(SUN_JAN_5_OPEN + 4 * HOUR_MS, 5040, 5050, 5035, 5045),
      bar(SUN_JAN_5_OPEN + 5 * HOUR_MS, 5045, 5060, 5040, 5055),
      bar(SUN_JAN_5_OPEN + 6 * HOUR_MS, 5055, 5070, 5050, 5065),
    ];

    const swings = computeHtfSwingPoints(
      swingInput({ bars4h }),
    );

    expect(swings).toEqual([]);
  });

  it("excludes swings outside the combined current and previous week range", () => {
    const bars4h = fractalSwingHighSequence(SUN_JAN_5_OPEN).map((b) =>
      b.high === 5100 ? { ...b, high: 5250, close: 5240 } : b,
    );

    const swings = computeHtfSwingPoints(
      swingInput({ bars4h }),
    );

    expect(swings).toEqual([]);
  });

  it("includes swings inside the combined current and previous week range", () => {
    const bars4h = fractalSwingHighSequence(SUN_JAN_5_OPEN).map((b) =>
      b.high === 5100 ? { ...b, high: 5150, close: 5140 } : b,
    );

    const swings = computeHtfSwingPoints(
      swingInput({ bars4h }),
    );

    expect(swings).toEqual([
      {
        timeframe: "4H",
        kind: "high",
        price: 5150,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt: SUN_JAN_5_OPEN + 6 * HOUR_MS,
      },
    ]);
  });

  it("includes a swing above PDH when it remains inside the weekly range", () => {
    const bars4h = fractalSwingHighSequence(SUN_JAN_5_OPEN).map((b) =>
      b.high === 5100 ? { ...b, high: 5150, close: 5140 } : b,
    );

    const swings = computeHtfSwingPoints(
      swingInput({ bars4h }),
    );

    expect(swings).toHaveLength(1);
    expect(swings[0]?.price).toBe(5150);
  });

  it("adds intraday swings inside the weekly range", () => {
    const bars1h = fractalSwingHighSequence(MON_JAN_6_SESSION_OPEN).map((b) =>
      b.high === 5100 ? { ...b, high: 5150, close: 5140 } : b,
    );

    const swings = computeHtfSwingPoints(
      swingInput({
        bars1h,
        asOf: MON_JAN_6_SESSION_OPEN + 6 * HOUR_MS,
      }),
    );

    expect(swings).toEqual([
      {
        timeframe: "1H",
        kind: "high",
        price: 5150,
        formedAt: MON_JAN_6_SESSION_OPEN + 3 * HOUR_MS,
        confirmedAt: MON_JAN_6_SESSION_OPEN + 6 * HOUR_MS,
      },
    ]);
  });

  it("excludes swings formed outside the two-week lookback window", () => {
    const bars4h = fractalSwingHighSequence(SUN_DEC_22_OPEN);

    const swings = computeHtfSwingPoints(
      swingInput({ bars4h }),
    );

    expect(swings).toEqual([]);
  });

  it("does not include swings that have not yet confirmed by asOf", () => {
    const bars1h = fractalSwingHighSequence(MON_JAN_6_SESSION_OPEN);

    const swings = computeHtfSwingPoints(
      swingInput({
        bars1h,
        asOf: MON_JAN_6_SESSION_OPEN + 2 * HOUR_MS,
      }),
    );

    expect(swings).toEqual([]);
  });

  it("mitigates a swing high when a 1m bar crosses the level after confirmation", () => {
    const bars1h = fractalSwingHighSequence(SUN_JAN_5_OPEN);
    const confirmedAt = SUN_JAN_5_OPEN + 6 * HOUR_MS;
    const mitigatedAt = confirmedAt + HOUR_MS;

    const swings = computeHtfSwingPoints(
      swingInput({
        bars1h,
        mitigationBars: [
          bar(mitigatedAt, 5095, 5101, 5090, 5098),
        ],
        asOf: mitigatedAt,
      }),
    );

    expect(swings).toEqual([
      {
        timeframe: "1H",
        kind: "high",
        price: 5100,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt,
        mitigatedAt,
      },
    ]);
  });

  it("does not mitigate a swing when the cross occurs before fractal confirmation", () => {
    const bars1h = fractalSwingHighSequence(SUN_JAN_5_OPEN);
    const confirmedAt = SUN_JAN_5_OPEN + 6 * HOUR_MS;

    const swings = computeHtfSwingPoints(
      swingInput({
        bars1h,
        mitigationBars: [
          bar(confirmedAt - MINUTE_MS, 5095, 5105, 5090, 5100),
        ],
        asOf: confirmedAt,
      }),
    );

    expect(swings).toEqual([
      {
        timeframe: "1H",
        kind: "high",
        price: 5100,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt,
      },
    ]);
  });

  it("mitigates a swing low when a 1m bar crosses the level after confirmation", () => {
    const bars1h = fractalSwingLowSequence(SUN_JAN_5_OPEN);
    const confirmedAt = SUN_JAN_5_OPEN + 6 * HOUR_MS;
    const mitigatedAt = confirmedAt + HOUR_MS;

    const swings = computeHtfSwingPoints(
      swingInput({
        bars1h,
        mitigationBars: [
          bar(mitigatedAt, 5005, 5010, 4995, 5000),
        ],
        asOf: mitigatedAt,
      }),
    );

    expect(swings).toEqual([
      {
        timeframe: "1H",
        kind: "low",
        price: 5000,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt,
        mitigatedAt,
      },
    ]);
  });

  it("excludes a swing mitigated in a prior CME session", () => {
    const bars1h = fractalSwingHighSequence(SUN_JAN_5_OPEN);
    const confirmedAt = SUN_JAN_5_OPEN + 6 * HOUR_MS;
    const mitigatedAt = confirmedAt + HOUR_MS;

    const swings = computeHtfSwingPoints(
      swingInput({
        bars1h,
        mitigationBars: [
          bar(mitigatedAt, 5095, 5101, 5090, 5098),
        ],
        asOf: MON_JAN_6_EVAL,
      }),
    );

    expect(swings).toEqual([]);
  });

  it("keeps a swing unmitigated when asOf is before the crossing bar", () => {
    const bars1h = fractalSwingHighSequence(SUN_JAN_5_OPEN);
    const confirmedAt = SUN_JAN_5_OPEN + 6 * HOUR_MS;
    const mitigatedAt = confirmedAt + HOUR_MS;

    const swings = computeHtfSwingPoints(
      swingInput({
        bars1h,
        mitigationBars: [
          bar(mitigatedAt, 5095, 5101, 5090, 5098),
        ],
        asOf: mitigatedAt - MINUTE_MS,
      }),
    );

    expect(swings).toEqual([
      {
        timeframe: "1H",
        kind: "high",
        price: 5100,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt,
      },
    ]);
  });
});
