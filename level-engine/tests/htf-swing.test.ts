import { describe, expect, it } from "vitest";
import { computeHtfSwingPoints } from "../src/htf-swing.js";
import { getDailySessionCloseTime } from "../src/session-calendar.js";
import type { Bar } from "../src/types.js";
import {
  chained4hSwingHighSequences,
  chainedSwingHighSequences,
  chainedSwingLowSequences,
  FOUR_HOUR_MS,
  fractalSwingHighSequence,
  fractalSwingLowSequence,
  HOUR_MS,
} from "./helpers/swing-bars.js";

const MINUTE_MS = 60 * 1000;
const SUN_DEC_22_OPEN = 1734908400000;
const SUN_JAN_5_OPEN = 1736118000000;
const MON_JAN_6_SESSION_OPEN = 1736204400000;
const MON_JAN_6_EVAL = 1736208000000;

const PWH = 5200;
const PWL = 4700;
const CURRENT_WEEK_HIGH = 5100;
const CURRENT_WEEK_LOW = 5000;

const DEFAULT_ADR = 100;

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
    adr: DEFAULT_ADR,
    asOf: MON_JAN_6_EVAL,
    ...overrides,
  };
}

function unmitigatedSwing<T extends Record<string, unknown>>(
  asOf: number,
  swing: T,
) {
  return { ...swing, displayUntil: getDailySessionCloseTime(asOf) };
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


describe("HTF Swing Points", () => {
  it("detects a strict fractal(3) swing high on 4H", () => {
    const bars4h = fractalSwingHighSequence(SUN_JAN_5_OPEN);

    const swings = computeHtfSwingPoints(
      swingInput({ bars4h }),
    );

    expect(swings).toEqual([
      unmitigatedSwing(MON_JAN_6_EVAL, {
        timeframe: "4H",
        kind: "high",
        price: 5100,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt: SUN_JAN_5_OPEN + 6 * HOUR_MS,
      }),
    ]);
  });

  it("detects a strict fractal(3) swing low on 1H", () => {
    const bars1h = fractalSwingLowSequence(SUN_JAN_5_OPEN);

    const swings = computeHtfSwingPoints(
      swingInput({ bars1h }),
    );

    expect(swings).toEqual([
      unmitigatedSwing(MON_JAN_6_EVAL, {
        timeframe: "1H",
        kind: "low",
        price: 5000,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt: SUN_JAN_5_OPEN + 6 * HOUR_MS,
      }),
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
      unmitigatedSwing(MON_JAN_6_EVAL, {
        timeframe: "4H",
        kind: "high",
        price: 5150,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt: SUN_JAN_5_OPEN + 6 * HOUR_MS,
      }),
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

  it("includes a swing below PDL when it remains inside the weekly range", () => {
    const bars4h = fractalSwingLowSequence(SUN_JAN_5_OPEN).map((b) =>
      b.low === 5000 ? { ...b, low: 4750, close: 4760 } : b,
    );

    const swings = computeHtfSwingPoints(
      swingInput({ bars4h }),
    );

    expect(swings).toHaveLength(1);
    expect(swings[0]?.price).toBe(4750);
  });

  it("adds intraday swings inside the weekly range", () => {
    const bars1h = fractalSwingHighSequence(MON_JAN_6_SESSION_OPEN).map((b) =>
      b.high === 5100 ? { ...b, high: 5150, close: 5140 } : b,
    );

    const asOf = MON_JAN_6_SESSION_OPEN + 6 * HOUR_MS;

    const swings = computeHtfSwingPoints(
      swingInput({
        bars1h,
        asOf,
      }),
    );

    expect(swings).toEqual([
      unmitigatedSwing(asOf, {
        timeframe: "1H",
        kind: "high",
        price: 5150,
        formedAt: MON_JAN_6_SESSION_OPEN + 3 * HOUR_MS,
        confirmedAt: MON_JAN_6_SESSION_OPEN + 6 * HOUR_MS,
      }),
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
      unmitigatedSwing(confirmedAt, {
        timeframe: "1H",
        kind: "high",
        price: 5100,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt,
      }),
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

  it("sets displayUntil to the current CME daily session close for unmitigated swings", () => {
    const bars1h = fractalSwingHighSequence(SUN_JAN_5_OPEN);

    const swings = computeHtfSwingPoints(swingInput({ bars1h }));

    expect(swings[0]?.displayUntil).toBe(
      getDailySessionCloseTime(MON_JAN_6_EVAL),
    );
    expect(swings[0]?.mitigatedAt).toBeUndefined();
  });

  it("keeps a swing unmitigated when asOf is before the crossing bar", () => {
    const bars1h = fractalSwingHighSequence(SUN_JAN_5_OPEN);
    const confirmedAt = SUN_JAN_5_OPEN + 6 * HOUR_MS;
    const mitigatedAt = confirmedAt + HOUR_MS;

    const asOf = mitigatedAt - MINUTE_MS;

    const swings = computeHtfSwingPoints(
      swingInput({
        bars1h,
        mitigationBars: [
          bar(mitigatedAt, 5095, 5101, 5090, 5098),
        ],
        asOf,
      }),
    );

    expect(swings).toEqual([
      unmitigatedSwing(asOf, {
        timeframe: "1H",
        kind: "high",
        price: 5100,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt,
      }),
    ]);
  });

  it("collapses nearby 4H swing highs within ADR proximity to the higher peak", () => {
    const bars4h = chained4hSwingHighSequences(SUN_JAN_5_OPEN, 5090, 5100);
    const secondStart = SUN_JAN_5_OPEN + 14 * FOUR_HOUR_MS;
    const higherConfirmedAt = secondStart + 6 * FOUR_HOUR_MS;

    const swings = computeHtfSwingPoints(
      swingInput({ bars4h, asOf: higherConfirmedAt }),
    );

    expect(swings).toEqual([
      unmitigatedSwing(higherConfirmedAt, {
        timeframe: "4H",
        kind: "high",
        price: 5100,
        formedAt: secondStart + 3 * FOUR_HOUR_MS,
        confirmedAt: higherConfirmedAt,
      }),
    ]);
  });

  it("collapses nearby 1H swing highs within ADR proximity to the higher peak", () => {
    const bars1h = chainedSwingHighSequences(SUN_JAN_5_OPEN, 5090, 5100);
    const secondStart = SUN_JAN_5_OPEN + 14 * HOUR_MS;
    const higherConfirmedAt = secondStart + 6 * HOUR_MS;

    const swings = computeHtfSwingPoints(
      swingInput({ bars1h, asOf: higherConfirmedAt }),
    );

    expect(swings).toEqual([
      unmitigatedSwing(higherConfirmedAt, {
        timeframe: "1H",
        kind: "high",
        price: 5100,
        formedAt: secondStart + 3 * HOUR_MS,
        confirmedAt: higherConfirmedAt,
      }),
    ]);
  });

  it("collapses nearby 1H swing lows to the lower trough", () => {
    const bars1h = chainedSwingLowSequences(SUN_JAN_5_OPEN, 5010, 5000);
    const secondStart = SUN_JAN_5_OPEN + 14 * HOUR_MS;
    const lowerConfirmedAt = secondStart + 6 * HOUR_MS;

    const swings = computeHtfSwingPoints(
      swingInput({ bars1h, asOf: lowerConfirmedAt }),
    );

    expect(swings).toEqual([
      unmitigatedSwing(lowerConfirmedAt, {
        timeframe: "1H",
        kind: "low",
        price: 5000,
        formedAt: secondStart + 3 * HOUR_MS,
        confirmedAt: lowerConfirmedAt,
      }),
    ]);
  });

  it("filters highs and lows independently when clustered at the same price area", () => {
    const lowStart = SUN_JAN_5_OPEN + 28 * HOUR_MS;
    const bars1h = [
      ...chainedSwingHighSequences(SUN_JAN_5_OPEN, 5090, 5100),
      ...chainedSwingLowSequences(lowStart, 5010, 5000),
    ];
    const asOf = lowStart + 20 * HOUR_MS;

    const swings = computeHtfSwingPoints(swingInput({ bars1h, asOf }));

    expect(swings).toHaveLength(2);
    expect(swings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "high", price: 5100 }),
        expect.objectContaining({ kind: "low", price: 5000 }),
      ]),
    );
  });

  it("does not collapse cross-timeframe swing highs within ADR proximity", () => {
    const bars1h = chainedSwingHighSequences(SUN_JAN_5_OPEN, 5090, 5095);
    const bars4h = chained4hSwingHighSequences(SUN_JAN_5_OPEN, 5092, 5100);
    const asOf = SUN_JAN_5_OPEN + 20 * FOUR_HOUR_MS;

    const swings = computeHtfSwingPoints(
      swingInput({ bars1h, bars4h, asOf }),
    );

    expect(swings).toHaveLength(2);
    expect(swings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ timeframe: "1H", kind: "high", price: 5095 }),
        expect.objectContaining({ timeframe: "4H", kind: "high", price: 5100 }),
      ]),
    );
  });

  it("retroactively stamps the inner swing when a more extreme peer confirms later", () => {
    const bars1h = chainedSwingHighSequences(SUN_JAN_5_OPEN, 5090, 5100);
    const innerConfirmedAt = SUN_JAN_5_OPEN + 6 * HOUR_MS;

    expect(
      computeHtfSwingPoints(swingInput({ bars1h, asOf: innerConfirmedAt })),
    ).toHaveLength(1);

    const secondStart = SUN_JAN_5_OPEN + 14 * HOUR_MS;
    const outerConfirmedAt = secondStart + 6 * HOUR_MS;
    expect(
      computeHtfSwingPoints(swingInput({ bars1h, asOf: outerConfirmedAt })),
    ).toEqual([
      unmitigatedSwing(outerConfirmedAt, {
        timeframe: "1H",
        kind: "high",
        price: 5100,
        formedAt: secondStart + 3 * HOUR_MS,
        confirmedAt: outerConfirmedAt,
      }),
    ]);
  });
});
