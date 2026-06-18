import { describe, expect, it } from "vitest";
import {
  selectDirectionalSessionPoi,
  selectNeutralSessionPoi,
  selectSessionPoi,
} from "../src/session-poi.js";
import type { HtfFvg } from "../src/htf-fvg.js";
import type { HtfSwingPoint } from "../src/htf-swing.js";

const HOUR_MS = 60 * 60 * 1000;
const SUN_JAN_5_OPEN = 1736118000000;
const MON_JAN_6_SESSION_OPEN = 1736204400000;

const PD_MIDPOINT = 5050;

function bullish4hFvg(
  formedAt: number,
  zoneLow: number,
  zoneHigh: number,
): HtfFvg {
  return {
    timeframe: "4H",
    direction: "bullish",
    zoneLow,
    zoneHigh,
    formedAt,
  };
}

describe("Directional Session POI", () => {
  it("selects a bullish 4H FVG above PD 50% Midpoint at the 18:00 session open", () => {
    const formedAt = SUN_JAN_5_OPEN + 2 * HOUR_MS;

    const sessionPoi = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5065,
      biasDirection: "bullish",
      pdMidpoint: PD_MIDPOINT,
      htfFvgs: [bullish4hFvg(formedAt, 5055, 5060)],
      htfSwingPoints: [],
    });

    expect(sessionPoi).toEqual({
      kind: "htf-fvg",
      timeframe: "4H",
      formedAt,
    });
  });

  it("selects a bearish 4H FVG below PD 50% Midpoint at the 18:00 session open", () => {
    const formedAt = SUN_JAN_5_OPEN + 2 * HOUR_MS;

    const sessionPoi = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5040,
      biasDirection: "bearish",
      pdMidpoint: PD_MIDPOINT,
      htfFvgs: [bullish4hFvg(formedAt, 5035, 5040)],
      htfSwingPoints: [],
    });

    expect(sessionPoi).toEqual({
      kind: "htf-fvg",
      timeframe: "4H",
      formedAt,
    });
  });

  it("does not select a bullish FVG entirely below PD 50% Midpoint", () => {
    const sessionPoi = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5043,
      biasDirection: "bullish",
      pdMidpoint: PD_MIDPOINT,
      htfFvgs: [bullish4hFvg(SUN_JAN_5_OPEN + 2 * HOUR_MS, 5040, 5045)],
      htfSwingPoints: [],
    });

    expect(sessionPoi).toBeNull();
  });

  it("falls back to a 1H FVG in the biased half when no 4H candidate exists", () => {
    const formedAt = SUN_JAN_5_OPEN + 2 * HOUR_MS;

    const sessionPoi = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5065,
      biasDirection: "bullish",
      pdMidpoint: PD_MIDPOINT,
      htfFvgs: [
        {
          timeframe: "1H",
          direction: "bullish",
          zoneLow: 5055,
          zoneHigh: 5060,
          formedAt,
        },
      ],
      htfSwingPoints: [],
    });

    expect(sessionPoi).toEqual({
      kind: "htf-fvg",
      timeframe: "1H",
      formedAt,
    });
  });

  it("prefers a 4H biased-half FVG over a nearer 1H FVG", () => {
    const sessionPoi = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5065,
      biasDirection: "bullish",
      pdMidpoint: PD_MIDPOINT,
      htfFvgs: [
        bullish4hFvg(SUN_JAN_5_OPEN + 2 * HOUR_MS, 5068, 5072),
        {
          timeframe: "1H",
          direction: "bullish",
          zoneLow: 5053,
          zoneHigh: 5057,
          formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        },
      ],
      htfSwingPoints: [],
    });

    expect(sessionPoi).toEqual({
      kind: "htf-fvg",
      timeframe: "4H",
      formedAt: SUN_JAN_5_OPEN + 2 * HOUR_MS,
    });
  });

  it("breaks ties among same-timeframe biased-half FVGs by nearest midpoint to current price", () => {
    const nearerFormedAt = SUN_JAN_5_OPEN + 2 * HOUR_MS;
    const fartherFormedAt = SUN_JAN_5_OPEN + 3 * HOUR_MS;

    const sessionPoi = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5055,
      biasDirection: "bullish",
      pdMidpoint: PD_MIDPOINT,
      htfFvgs: [
        bullish4hFvg(fartherFormedAt, 5068, 5072),
        bullish4hFvg(nearerFormedAt, 5052, 5058),
      ],
      htfSwingPoints: [],
    });

    expect(sessionPoi).toEqual({
      kind: "htf-fvg",
      timeframe: "4H",
      formedAt: nearerFormedAt,
    });
  });

  it("defers Session POI until a live HTF swing forms in the biased half when no FVG qualifies", () => {
    const swingFormedAt = MON_JAN_6_SESSION_OPEN + HOUR_MS;
    const swingConfirmedAt = MON_JAN_6_SESSION_OPEN + 4 * HOUR_MS;

    const atSessionOpen = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5040,
      biasDirection: "bearish",
      pdMidpoint: PD_MIDPOINT,
      htfFvgs: [
        bullish4hFvg(SUN_JAN_5_OPEN + 2 * HOUR_MS, 5160, 5165),
      ],
      htfSwingPoints: [],
    });

    const afterSwingConfirms = selectDirectionalSessionPoi({
      asOf: swingConfirmedAt,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5040,
      biasDirection: "bearish",
      pdMidpoint: PD_MIDPOINT,
      htfFvgs: [
        bullish4hFvg(SUN_JAN_5_OPEN + 2 * HOUR_MS, 5160, 5165),
      ],
      htfSwingPoints: [
        {
          timeframe: "4H",
          kind: "low",
          price: 5035,
          formedAt: swingFormedAt,
          confirmedAt: swingConfirmedAt,
        },
      ],
    });

    expect(atSessionOpen).toBeNull();
    expect(afterSwingConfirms).toEqual({
      kind: "htf-swing",
      timeframe: "4H",
      formedAt: swingFormedAt,
      swingKind: "low",
    });
  });

  it("does not defer to a swing outside the biased half", () => {
    const swingConfirmedAt = MON_JAN_6_SESSION_OPEN + 4 * HOUR_MS;

    const sessionPoi = selectDirectionalSessionPoi({
      asOf: swingConfirmedAt,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5065,
      biasDirection: "bullish",
      pdMidpoint: PD_MIDPOINT,
      htfFvgs: [],
      htfSwingPoints: [
        {
          timeframe: "4H",
          kind: "low",
          price: 5035,
          formedAt: MON_JAN_6_SESSION_OPEN + HOUR_MS,
          confirmedAt: swingConfirmedAt,
        },
      ],
    });

    expect(sessionPoi).toBeNull();
  });

  it("does not promote a swing confirmed before the session open on the defer path", () => {
    const sessionPoi = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5065,
      biasDirection: "bullish",
      pdMidpoint: PD_MIDPOINT,
      htfFvgs: [],
      htfSwingPoints: [
        {
          timeframe: "4H",
          kind: "high",
          price: 5100,
          formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
          confirmedAt: SUN_JAN_5_OPEN + 6 * HOUR_MS,
        },
      ],
    });

    expect(sessionPoi).toBeNull();
  });
});

describe("Neutral Session POI", () => {
  it("does not select Session POI at the 18:00 session open before a PDH or PDL sweep", () => {
    const sessionPoi = selectNeutralSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
    });

    expect(sessionPoi).toBeNull();
  });

  it("promotes PDH to Session POI after a sweep during the current session", () => {
    const sweptAt = MON_JAN_6_SESSION_OPEN + 2 * HOUR_MS;

    const sessionPoi = selectNeutralSessionPoi({
      asOf: sweptAt,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      pdhMitigatedAt: sweptAt,
    });

    expect(sessionPoi).toEqual({
      kind: "pdh",
      sweptAt,
    });
  });

  it("promotes PDL to Session POI after a sweep during the current session", () => {
    const sweptAt = MON_JAN_6_SESSION_OPEN + 3 * HOUR_MS;

    const sessionPoi = selectNeutralSessionPoi({
      asOf: sweptAt,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      pdlMitigatedAt: sweptAt,
    });

    expect(sessionPoi).toEqual({
      kind: "pdl",
      sweptAt,
    });
  });

  it("ignores PDH sweeps from a prior CME session", () => {
    const priorSessionSweep = SUN_JAN_5_OPEN + 6 * HOUR_MS;

    const sessionPoi = selectNeutralSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      pdhMitigatedAt: priorSessionSweep,
    });

    expect(sessionPoi).toBeNull();
  });
});

describe("Session POI selection", () => {
  it("does not defer to an intraday HTF swing on neutral days before a PDH or PDL sweep", () => {
    const swingConfirmedAt = MON_JAN_6_SESSION_OPEN + 4 * HOUR_MS;

    const sessionPoi = selectSessionPoi({
      dailyBias: "neutral",
      asOf: swingConfirmedAt,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5050,
      biasDirection: "bullish",
      pdMidpoint: PD_MIDPOINT,
      htfFvgs: [],
      htfSwingPoints: [
        {
          timeframe: "4H",
          kind: "low",
          price: 5035,
          formedAt: MON_JAN_6_SESSION_OPEN + HOUR_MS,
          confirmedAt: swingConfirmedAt,
        },
      ],
    });

    expect(sessionPoi).toBeNull();
  });
});
