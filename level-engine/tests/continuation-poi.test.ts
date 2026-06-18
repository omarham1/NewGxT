import { describe, expect, it } from "vitest";
import {
  computeExpansionLeg,
  selectContinuationPoi,
} from "../src/continuation-poi.js";
import type { HtfFvg } from "../src/htf-fvg.js";
import type { Bar } from "../src/types.js";
import {
  fractalSwingLowSequenceAt,
  HOUR_MS,
} from "./helpers/swing-bars.js";

const MON_JAN_6_SESSION_OPEN = 1736204400000;
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

function bullishFvg(
  timeframe: "4H" | "1H",
  formedAt: number,
  zoneLow: number,
  zoneHigh: number,
): HtfFvg {
  return { timeframe, direction: "bullish", zoneLow, zoneHigh, formedAt };
}

describe("Continuation POI selection", () => {
  it("computes the expansion leg from the opposing 1H swing and live terminus", () => {
    const swingOriginTime = MON_JAN_6_SESSION_OPEN - 6 * HOUR_MS;
    const bars1h = [
      ...fractalSwingLowSequenceAt(swingOriginTime, 5000),
      bar(MON_JAN_6_SESSION_OPEN, 5030, 5045, 5025, 5040),
      bar(MON_JAN_6_EVAL, 5040, 5065, 5035, 5055),
    ];

    expect(
      computeExpansionLeg({
        asOf: MON_JAN_6_EVAL,
        sessionOpenTime: MON_JAN_6_SESSION_OPEN,
        biasDirection: "bullish",
        flippedAt: MON_JAN_6_EVAL,
        bars1h,
      }),
    ).toEqual({
      origin: 5000,
      terminus: 5065,
      originFormedAt: MON_JAN_6_SESSION_OPEN - 3 * HOUR_MS,
    });
  });

  it("selects the highest-timeframe gap among stacked intraday bullish FVGs at bias flip", () => {
    const swingOriginTime = MON_JAN_6_SESSION_OPEN - 6 * HOUR_MS;
    const swingLowBars = fractalSwingLowSequenceAt(swingOriginTime, 5000);
    const expansionBars = [
      bar(MON_JAN_6_SESSION_OPEN, 5030, 5045, 5025, 5040),
      bar(MON_JAN_6_EVAL, 5040, 5065, 5035, 5055),
    ];
    const bars1h = [...swingLowBars, ...expansionBars];

    const fvg4hFormedAt = MON_JAN_6_SESSION_OPEN + HOUR_MS;
    const fvg1hFormedAt = MON_JAN_6_SESSION_OPEN + 2 * HOUR_MS;

    const continuationPoi = selectContinuationPoi({
      asOf: MON_JAN_6_EVAL,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5055,
      biasDirection: "bullish",
      flippedAt: MON_JAN_6_EVAL,
      htfFvgs: [
        bullishFvg("4H", fvg4hFormedAt, 5045, 5050),
        bullishFvg("1H", fvg1hFormedAt, 5048, 5053),
      ],
      bars1h,
      mitigationBars: [],
    });

    expect(continuationPoi).toEqual({
      kind: "htf-fvg",
      timeframe: "4H",
      formedAt: fvg4hFormedAt,
    });
  });

  it("returns null at flip when no gap qualifies and selects when one forms later", () => {
    const swingOriginTime = MON_JAN_6_SESSION_OPEN - 6 * HOUR_MS;
    const swingLowBars = fractalSwingLowSequenceAt(swingOriginTime, 5000);
    const flipBar = bar(MON_JAN_6_EVAL, 5040, 5065, 5035, 5055);
    const laterBar = bar(MON_JAN_6_EVAL + HOUR_MS, 5055, 5068, 5048, 5060);
    const bars1h = [
      ...swingLowBars,
      bar(MON_JAN_6_SESSION_OPEN, 5030, 5045, 5025, 5040),
      flipBar,
      laterBar,
    ];

    const baseInput = {
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5055,
      biasDirection: "bullish" as const,
      flippedAt: MON_JAN_6_EVAL,
      bars1h,
      mitigationBars: [] as Bar[],
    };

    const atFlip = selectContinuationPoi({
      ...baseInput,
      asOf: MON_JAN_6_EVAL,
      htfFvgs: [],
    });
    expect(atFlip).toBeNull();

    const fvgFormedAt = MON_JAN_6_EVAL + HOUR_MS;
    const afterGapForms = selectContinuationPoi({
      ...baseInput,
      asOf: fvgFormedAt,
      currentPrice: 5060,
      htfFvgs: [bullishFvg("1H", fvgFormedAt, 5048, 5053)],
    });

    expect(afterGapForms).toEqual({
      kind: "htf-fvg",
      timeframe: "1H",
      formedAt: fvgFormedAt,
    });
  });

  it("rejects gaps whose far boundary falls past the expansion leg 50% retracement", () => {
    const swingOriginTime = MON_JAN_6_SESSION_OPEN - 6 * HOUR_MS;
    const swingLowBars = fractalSwingLowSequenceAt(swingOriginTime, 5000);
    const bars1h = [
      ...swingLowBars,
      bar(MON_JAN_6_SESSION_OPEN, 5030, 5045, 5025, 5040),
      bar(MON_JAN_6_EVAL, 5040, 5065, 5035, 5055),
    ];

    const tooDeepFormedAt = MON_JAN_6_SESSION_OPEN + 15 * 60 * 1000;
    const shallowFormedAt = MON_JAN_6_SESSION_OPEN + 45 * 60 * 1000;

    const continuationPoi = selectContinuationPoi({
      asOf: MON_JAN_6_EVAL,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5055,
      biasDirection: "bullish",
      flippedAt: MON_JAN_6_EVAL,
      htfFvgs: [
        bullishFvg("1H", tooDeepFormedAt, 5025, 5030),
        bullishFvg("1H", shallowFormedAt, 5048, 5053),
      ],
      bars1h,
      mitigationBars: [],
    });

    expect(continuationPoi).toEqual({
      kind: "htf-fvg",
      timeframe: "1H",
      formedAt: shallowFormedAt,
    });
  });

  it("re-selects the next eligible gap after the current one is mitigated", () => {
    const swingOriginTime = MON_JAN_6_SESSION_OPEN - 6 * HOUR_MS;
    const swingLowBars = fractalSwingLowSequenceAt(swingOriginTime, 5000);
    const bars1h = [
      ...swingLowBars,
      bar(MON_JAN_6_SESSION_OPEN, 5030, 5045, 5025, 5040),
      bar(MON_JAN_6_EVAL, 5040, 5065, 5035, 5055),
    ];

    const nearerFormedAt = MON_JAN_6_SESSION_OPEN + 15 * 60 * 1000;
    const fartherFormedAt = MON_JAN_6_SESSION_OPEN + 45 * 60 * 1000;
    const nearer = bullishFvg("1H", nearerFormedAt, 5055, 5060);
    const farther = bullishFvg("1H", fartherFormedAt, 5045, 5050);

    const beforeMitigation = selectContinuationPoi({
      asOf: MON_JAN_6_EVAL,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5055,
      biasDirection: "bullish",
      flippedAt: MON_JAN_6_EVAL,
      htfFvgs: [nearer, farther],
      bars1h,
      mitigationBars: [],
    });

    expect(beforeMitigation).toEqual({
      kind: "htf-fvg",
      timeframe: "1H",
      formedAt: nearerFormedAt,
    });

    const afterMitigation = selectContinuationPoi({
      asOf: MON_JAN_6_EVAL + HOUR_MS,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5055,
      biasDirection: "bullish",
      flippedAt: MON_JAN_6_EVAL,
      htfFvgs: [farther],
      bars1h,
      mitigationBars: [],
    });

    expect(afterMitigation).toEqual({
      kind: "htf-fvg",
      timeframe: "1H",
      formedAt: fartherFormedAt,
    });
  });

  it("re-selects the next eligible gap after price closes past the expansion leg 50%", () => {
    const swingOriginTime = MON_JAN_6_SESSION_OPEN - 6 * HOUR_MS;
    const swingLowBars = fractalSwingLowSequenceAt(swingOriginTime, 5000);
    const nearerFormedAt = MON_JAN_6_SESSION_OPEN + 15 * 60 * 1000;
    const fartherFormedAt = MON_JAN_6_SESSION_OPEN + 45 * 60 * 1000;
    const nearer = bullishFvg("1H", nearerFormedAt, 5055, 5060);
    const farther = bullishFvg("1H", fartherFormedAt, 5045, 5050);
    const invalidationTime = MON_JAN_6_EVAL + HOUR_MS;

    const bars1h = [
      ...swingLowBars,
      bar(MON_JAN_6_SESSION_OPEN, 5030, 5045, 5025, 5040),
      bar(MON_JAN_6_EVAL, 5040, 5065, 5035, 5055),
      bar(invalidationTime, 5055, 5058, 5028, 5030),
    ];

    const beforeInvalidation = selectContinuationPoi({
      asOf: MON_JAN_6_EVAL,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5055,
      biasDirection: "bullish",
      flippedAt: MON_JAN_6_EVAL,
      htfFvgs: [nearer, farther],
      bars1h,
      mitigationBars: [],
    });

    expect(beforeInvalidation?.formedAt).toBe(nearerFormedAt);

    const afterInvalidation = selectContinuationPoi({
      asOf: invalidationTime,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5030,
      biasDirection: "bullish",
      flippedAt: MON_JAN_6_EVAL,
      htfFvgs: [nearer, farther],
      bars1h,
      mitigationBars: [],
    });

    expect(afterInvalidation).toEqual({
      kind: "htf-fvg",
      timeframe: "1H",
      formedAt: fartherFormedAt,
    });
  });
});
