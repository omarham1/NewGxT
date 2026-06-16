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

const PD_EQUILIBRIUM_LOW = 5025;
const PD_EQUILIBRIUM_HIGH = 5075;

function equilibrium4hFvg(
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
  it("selects a 4H FVG in the PD Equilibrium Range at the 18:00 session open", () => {
    const formedAt = SUN_JAN_5_OPEN + 2 * HOUR_MS;

    const sessionPoi = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5055,
      pdEquilibriumLow: PD_EQUILIBRIUM_LOW,
      pdEquilibriumHigh: PD_EQUILIBRIUM_HIGH,
      htfFvgs: [equilibrium4hFvg(formedAt, 5040, 5045)],
      htfSwingPoints: [],
    });

    expect(sessionPoi).toEqual({
      kind: "htf-fvg",
      timeframe: "4H",
      formedAt,
    });
  });

  it("falls back to a 1H FVG in equilibrium when no 4H candidate exists", () => {
    const formedAt = SUN_JAN_5_OPEN + 2 * HOUR_MS;

    const sessionPoi = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5055,
      pdEquilibriumLow: PD_EQUILIBRIUM_LOW,
      pdEquilibriumHigh: PD_EQUILIBRIUM_HIGH,
      htfFvgs: [
        {
          timeframe: "1H",
          direction: "bullish",
          zoneLow: 5040,
          zoneHigh: 5045,
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

  it("prefers a 4H equilibrium FVG over a nearer 1H FVG", () => {
    const sessionPoi = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5055,
      pdEquilibriumLow: PD_EQUILIBRIUM_LOW,
      pdEquilibriumHigh: PD_EQUILIBRIUM_HIGH,
      htfFvgs: [
        equilibrium4hFvg(SUN_JAN_5_OPEN + 2 * HOUR_MS, 5068, 5072),
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

  it("breaks ties among same-timeframe equilibrium FVGs by nearest midpoint to current price", () => {
    const nearerFormedAt = SUN_JAN_5_OPEN + 2 * HOUR_MS;
    const fartherFormedAt = SUN_JAN_5_OPEN + 3 * HOUR_MS;

    const sessionPoi = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5043,
      pdEquilibriumLow: PD_EQUILIBRIUM_LOW,
      pdEquilibriumHigh: PD_EQUILIBRIUM_HIGH,
      htfFvgs: [
        equilibrium4hFvg(fartherFormedAt, 5068, 5072),
        equilibrium4hFvg(nearerFormedAt, 5040, 5046),
      ],
      htfSwingPoints: [],
    });

    expect(sessionPoi).toEqual({
      kind: "htf-fvg",
      timeframe: "4H",
      formedAt: nearerFormedAt,
    });
  });

  it("defers Session POI until a live HTF swing forms when no equilibrium FVG qualifies", () => {
    const swingFormedAt = MON_JAN_6_SESSION_OPEN + HOUR_MS;
    const swingConfirmedAt = MON_JAN_6_SESSION_OPEN + 4 * HOUR_MS;

    const atSessionOpen = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5055,
      pdEquilibriumLow: PD_EQUILIBRIUM_LOW,
      pdEquilibriumHigh: PD_EQUILIBRIUM_HIGH,
      htfFvgs: [
        equilibrium4hFvg(SUN_JAN_5_OPEN + 2 * HOUR_MS, 5160, 5165),
      ],
      htfSwingPoints: [],
    });

    const afterSwingConfirms = selectDirectionalSessionPoi({
      asOf: swingConfirmedAt,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5050,
      pdEquilibriumLow: PD_EQUILIBRIUM_LOW,
      pdEquilibriumHigh: PD_EQUILIBRIUM_HIGH,
      htfFvgs: [
        equilibrium4hFvg(SUN_JAN_5_OPEN + 2 * HOUR_MS, 5160, 5165),
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

  it("does not promote a swing confirmed before the session open on the defer path", () => {
    const sessionPoi = selectDirectionalSessionPoi({
      asOf: MON_JAN_6_SESSION_OPEN,
      sessionOpenTime: MON_JAN_6_SESSION_OPEN,
      currentPrice: 5055,
      pdEquilibriumLow: PD_EQUILIBRIUM_LOW,
      pdEquilibriumHigh: PD_EQUILIBRIUM_HIGH,
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
      pdEquilibriumLow: PD_EQUILIBRIUM_LOW,
      pdEquilibriumHigh: PD_EQUILIBRIUM_HIGH,
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
