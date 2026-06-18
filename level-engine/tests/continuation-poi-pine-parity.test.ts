import { describe, expect, it } from "vitest";
import { computeLevelSnapshot } from "../src/level-snapshot.js";
import { loadFixture } from "./helpers/load-fixture.js";
import { simulatePineContinuationAtEval } from "./helpers/pine-continuation-poi.js";
import {
  fractalSwingLowSequenceAt,
  HOUR_MS as SWING_HOUR_MS,
} from "./helpers/swing-bars.js";
import type { Bar } from "../src/types.js";

const HOUR_MS = 60 * 60 * 1000;
const SUN_JAN_5_OPEN = 1736118000000;
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

function equilibriumBullishGap(
  time: number,
  zoneLow: number,
  zoneHigh: number,
): Bar[] {
  return [
    bar(time, zoneLow - 5, zoneLow, zoneLow - 10, zoneLow - 2),
    bar(time + HOUR_MS, zoneLow + 2, zoneHigh + 5, zoneLow, zoneHigh + 2),
    bar(time + 2 * HOUR_MS, zoneHigh + 2, zoneHigh + 10, zoneHigh, zoneHigh + 2),
  ];
}

describe("Continuation POI / Pine parity", () => {
  it("matches engine for bearish-start → bullish-flip with stacked intraday gaps", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const swingOriginTime = MON_JAN_6_SESSION_OPEN - 6 * SWING_HOUR_MS;
    const bars1h = [
      ...fractalSwingLowSequenceAt(swingOriginTime, 5000),
      bar(MON_JAN_6_SESSION_OPEN, 5030, 5045, 5025, 5040),
      bar(MON_JAN_6_EVAL, 5040, 5065, 5035, 5055),
    ];
    const bars4h = [
      ...equilibriumBullishGap(SUN_JAN_5_OPEN, 5035, 5040),
      ...equilibriumBullishGap(MON_JAN_6_SESSION_OPEN - HOUR_MS, 5045, 5050),
    ];
    const evalBars = [...bars, bar(MON_JAN_6_EVAL, 5040, 5065, 5035, 5055)];

    const engine = computeLevelSnapshot({
      bars: evalBars,
      bars4h,
      bars1h,
      mitigationBars: [],
      dailyBias: "directional",
      biasDirection: "bearish",
    });

    const pine = simulatePineContinuationAtEval({
      bars: evalBars,
      bars4h,
      bars1h,
      mitigationBars: [],
      asOf: MON_JAN_6_EVAL,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      pdMidpoint: engine.pdMidpoint,
      initialBiasDirection: "bearish",
    });

    expect(engine.sessionPoi).toBeNull();
    expect(engine.effectiveBiasDirection).toBe("bullish");
    expect(engine.activeDol?.tp1).toEqual({ kind: "pdh" });
    expect(pine.sessionPoi).toBeNull();
    expect(pine.biasFlipped).toBe(true);
    expect(pine.effectiveBiasDirection).toBe("bullish");
    expect(pine.continuationPoiEngine).toEqual(engine.continuationPoi);
    expect(engine.continuationPoi).toEqual({
      kind: "htf-fvg",
      timeframe: "4H",
      formedAt: MON_JAN_6_EVAL,
    });
  });

  it("keeps continuation POI null with no POI highlight when candidate pool is empty at flip", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const swingOriginTime = MON_JAN_6_SESSION_OPEN - 6 * SWING_HOUR_MS;
    const bars1h = [
      ...fractalSwingLowSequenceAt(swingOriginTime, 5000),
      bar(MON_JAN_6_SESSION_OPEN, 5030, 5045, 5025, 5040),
      bar(MON_JAN_6_EVAL, 5040, 5065, 5035, 5055),
    ];
    const evalBars = [...bars, bar(MON_JAN_6_EVAL, 5040, 5065, 5035, 5055)];

    const engine = computeLevelSnapshot({
      bars: evalBars,
      bars4h: equilibriumBullishGap(SUN_JAN_5_OPEN, 5035, 5040),
      bars1h,
      mitigationBars: [],
      dailyBias: "directional",
      biasDirection: "bearish",
    });

    const pine = simulatePineContinuationAtEval({
      bars: evalBars,
      bars4h: equilibriumBullishGap(SUN_JAN_5_OPEN, 5035, 5040),
      bars1h,
      mitigationBars: [],
      asOf: MON_JAN_6_EVAL,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      pdMidpoint: engine.pdMidpoint,
      initialBiasDirection: "bearish",
    });

    expect(engine.sessionPoi).toBeNull();
    expect(engine.continuationPoi).toBeNull();
    expect(pine.sessionPoi).toBeNull();
    expect(pine.continuationPoi).toBeNull();
    expect(pine.biasFlipped).toBe(true);
  });

  it("re-selects the next eligible gap after mitigation, matching engine", () => {
    const swingOriginTime = MON_JAN_6_SESSION_OPEN - 6 * SWING_HOUR_MS;
    const nearerFormedAt = MON_JAN_6_SESSION_OPEN + 15 * 60 * 1000;
    const fartherFormedAt = MON_JAN_6_SESSION_OPEN + 45 * 60 * 1000;
    const afterMitigation = MON_JAN_6_EVAL + HOUR_MS;
    const bars1h = [
      ...fractalSwingLowSequenceAt(swingOriginTime, 5000),
      bar(MON_JAN_6_SESSION_OPEN, 5030, 5045, 5025, 5040),
      bar(MON_JAN_6_EVAL, 5040, 5065, 5035, 5055),
      bar(afterMitigation, 5055, 5060, 5048, 5050),
    ];
    const bars4h = [
      ...equilibriumBullishGap(nearerFormedAt - 2 * HOUR_MS, 5055, 5060),
      ...equilibriumBullishGap(fartherFormedAt - 2 * HOUR_MS, 5045, 5050),
    ];
    const mitigationBars = [
      bar(afterMitigation, 5055, 5060, 5048, 5050),
    ];
    const bars = [
      ...loadFixture("mid-week-daily-boundary"),
      bar(MON_JAN_6_EVAL, 5040, 5065, 5035, 5055),
      bar(afterMitigation, 5055, 5060, 5048, 5050),
    ];

    const engine = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h,
      mitigationBars,
      dailyBias: "directional",
      biasDirection: "bearish",
    });

    const pine = simulatePineContinuationAtEval({
      bars,
      bars4h,
      bars1h,
      mitigationBars,
      asOf: afterMitigation,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      pdMidpoint: engine.pdMidpoint,
      initialBiasDirection: "bearish",
    });

    expect(pine.continuationPoiEngine).toEqual(engine.continuationPoi);
    expect(engine.continuationPoi?.formedAt).toBe(fartherFormedAt);
  });
});
