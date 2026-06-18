import { describe, expect, it } from "vitest";
import { computeLevelSnapshot } from "../src/level-snapshot.js";
import { getDailySessionCloseTime } from "../src/session-calendar.js";
import { loadFixture } from "./helpers/load-fixture.js";
import { chainedSwingHighSequences } from "./helpers/swing-bars.js";
import type { Bar } from "../src/types.js";

const HOUR_MS = 60 * 60 * 1000;
const SUN_DEC_22_OPEN = 1734908400000;
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

function abovePdhDisplacementGap(time: number): Bar[] {
  return [
    bar(time, 5150, 5160, 5140, 5152),
    bar(time + HOUR_MS, 5152, 5175, 5151, 5170),
    bar(time + 2 * HOUR_MS, 5170, 5185, 5165, 5180),
  ];
}

function equilibriumBullishGap(time: number, zoneLow: number, zoneHigh: number): Bar[] {
  return [
    bar(time, zoneLow - 5, zoneLow, zoneLow - 10, zoneLow - 2),
    bar(time + HOUR_MS, zoneLow + 2, zoneHigh + 5, zoneLow, zoneHigh + 2),
    bar(time + 2 * HOUR_MS, zoneHigh + 2, zoneHigh + 10, zoneHigh, zoneHigh + 2),
  ];
}

describe("Level Snapshot", () => {
  it("excludes mitigated HTF FVGs from the snapshot", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const bars4h = [
      bar(SUN_JAN_5_OPEN, 100, 105, 98, 102),
      bar(SUN_JAN_5_OPEN + HOUR_MS, 102, 110, 101, 108),
      bar(SUN_JAN_5_OPEN + 2 * HOUR_MS, 108, 115, 106, 112),
    ];
    const mitigationBars = [
      bar(SUN_JAN_5_OPEN + 3 * HOUR_MS, 107, 108, 104, 104),
    ];

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars,
    });

    expect(snapshot.htfFvgs).toEqual([]);
    expect(snapshot.pdh).toBe(5100);
    expect(snapshot.pdl).toBe(5000);
  });

  it("includes an unmitigated HTF FVG outside the Previous Day range in the snapshot", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const bars4h = abovePdhDisplacementGap(SUN_JAN_5_OPEN);

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars: [],
    });

    expect(snapshot.pdh).toBe(5100);
    expect(snapshot.pdl).toBe(5000);
    expect(snapshot.htfFvgs).toEqual([
      {
        timeframe: "4H",
        direction: "bullish",
        zoneLow: 5160,
        zoneHigh: 5165,
        formedAt: SUN_JAN_5_OPEN + 2 * HOUR_MS,
      },
    ]);
  });

  it("excludes an unmitigated HTF FVG outside the daily session lookback window", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const bars4h = abovePdhDisplacementGap(SUN_DEC_22_OPEN);

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars: [],
    });

    expect(snapshot.htfFvgs).toEqual([]);
  });

  it("includes pre-session HTF swing points inside the Previous Day range", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const bars4h = [
      bar(SUN_JAN_5_OPEN, 5010, 5020, 5005, 5015),
      bar(SUN_JAN_5_OPEN + HOUR_MS, 5015, 5030, 5010, 5025),
      bar(SUN_JAN_5_OPEN + 2 * HOUR_MS, 5025, 5040, 5020, 5035),
      bar(SUN_JAN_5_OPEN + 3 * HOUR_MS, 5035, 5100, 5030, 5090),
      bar(SUN_JAN_5_OPEN + 4 * HOUR_MS, 5090, 5050, 5045, 5048),
      bar(SUN_JAN_5_OPEN + 5 * HOUR_MS, 5048, 5045, 5035, 5040),
      bar(SUN_JAN_5_OPEN + 6 * HOUR_MS, 5040, 5035, 5025, 5030),
    ];

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars: [],
    });

    expect(snapshot.htfSwingPoints).toEqual([
      {
        timeframe: "4H",
        kind: "high",
        price: 5100,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt: SUN_JAN_5_OPEN + 6 * HOUR_MS,
        displayUntil: getDailySessionCloseTime(MON_JAN_6_EVAL),
      },
    ]);
  });

  it("includes a session-mitigated HTF swing with mitigatedAt for canvas rendering", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const bars4h = [
      bar(SUN_JAN_5_OPEN, 5010, 5020, 5005, 5015),
      bar(SUN_JAN_5_OPEN + HOUR_MS, 5015, 5030, 5010, 5025),
      bar(SUN_JAN_5_OPEN + 2 * HOUR_MS, 5025, 5040, 5020, 5035),
      bar(SUN_JAN_5_OPEN + 3 * HOUR_MS, 5035, 5100, 5030, 5090),
      bar(SUN_JAN_5_OPEN + 4 * HOUR_MS, 5090, 5050, 5045, 5048),
      bar(SUN_JAN_5_OPEN + 5 * HOUR_MS, 5048, 5045, 5035, 5040),
      bar(SUN_JAN_5_OPEN + 6 * HOUR_MS, 5040, 5035, 5025, 5030),
    ];
    const confirmedAt = SUN_JAN_5_OPEN + 6 * HOUR_MS;
    const mitigatedAt = MON_JAN_6_EVAL + HOUR_MS;
    const mitigationBars = [
      bar(mitigatedAt, 5095, 5101, 5090, 5098),
    ];

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars,
    });

    expect(snapshot.htfSwingPoints).toEqual([
      {
        timeframe: "4H",
        kind: "high",
        price: 5100,
        formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
        confirmedAt,
        mitigatedAt,
      },
    ]);
  });

  it("excludes failure swings from htfSwingPoints in the level snapshot", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const chainedHighs = chainedSwingHighSequences(SUN_JAN_5_OPEN, 5090, 5100);

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h: [],
      bars1h: chainedHighs,
      mitigationBars: [],
      dailyBias: "directional",
      biasDirection: "bullish",
    });

    const innerFormedAt = SUN_JAN_5_OPEN + 3 * HOUR_MS;

    expect(snapshot.htfSwingPoints).toHaveLength(1);
    expect(snapshot.htfSwingPoints[0]?.price).toBe(5100);
    expect(snapshot.sessionPoi?.kind).not.toBe("htf-swing");
    expect(snapshot.activeDol?.tp1).not.toEqual({
      kind: "htf-swing",
      timeframe: "1H",
      formedAt: innerFormedAt,
      swingKind: "high",
    });
  });

  it("includes PDH mitigation metadata when price crosses during the current session", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const mitigatedAt = MON_JAN_6_EVAL + HOUR_MS;

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h: [],
      bars1h: [],
      mitigationBars: [bar(mitigatedAt, 5095, 5101, 5090, 5098)],
    });

    expect(snapshot.pdh).toBe(5100);
    expect(snapshot.pdhMitigatedAt).toBe(mitigatedAt);
    expect(snapshot.pdlMitigatedAt).toBeUndefined();
  });

  it("selects Session POI from a directional 4H FVG above PD 50% Midpoint at the current session open", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const formedAt = SUN_JAN_5_OPEN + 2 * HOUR_MS;
    const bars4h = equilibriumBullishGap(SUN_JAN_5_OPEN, 5055, 5060);

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars: [],
      dailyBias: "directional",
      biasDirection: "bullish",
    });

    expect(snapshot.pdMidpoint).toBe(5050);
    expect(snapshot.pdEquilibriumLow).toBe(5025);
    expect(snapshot.pdEquilibriumHigh).toBe(5075);
    expect(snapshot.sessionPoi).toEqual({
      kind: "htf-fvg",
      timeframe: "4H",
      formedAt,
    });
  });

  it("selects Session POI from a directional 4H FVG below PD 50% Midpoint when bearish", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const formedAt = SUN_JAN_5_OPEN + 2 * HOUR_MS;
    const bars4h = equilibriumBullishGap(SUN_JAN_5_OPEN, 5035, 5040);

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars: [],
      dailyBias: "directional",
      biasDirection: "bearish",
    });

    expect(snapshot.sessionPoi).toEqual({
      kind: "htf-fvg",
      timeframe: "4H",
      formedAt,
    });
  });

  it("does not select Session POI at the session open on neutral days", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const formedAt = SUN_JAN_5_OPEN + 2 * HOUR_MS;
    const bars4h = equilibriumBullishGap(SUN_JAN_5_OPEN, 5040, 5045);

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars: [],
      dailyBias: "neutral",
    });

    expect(snapshot.sessionPoi).toBeNull();
    expect(snapshot.htfFvgs).toEqual([
      {
        timeframe: "4H",
        direction: "bullish",
        zoneLow: 5040,
        zoneHigh: 5045,
        formedAt,
      },
    ]);
  });

  it("promotes PDH to Session POI after a neutral-day sweep", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const sweptAt = MON_JAN_6_EVAL + HOUR_MS;

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h: [],
      bars1h: [],
      mitigationBars: [bar(sweptAt, 5095, 5101, 5090, 5098)],
      dailyBias: "neutral",
    });

    expect(snapshot.pdh).toBe(5100);
    expect(snapshot.pdhMitigatedAt).toBe(sweptAt);
    expect(snapshot.sessionPoi).toEqual({
      kind: "pdh",
      sweptAt,
    });
  });

  it("promotes PDL to Session POI after a neutral-day sweep", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const sweptAt = MON_JAN_6_EVAL + HOUR_MS;

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h: [],
      bars1h: [],
      mitigationBars: [bar(sweptAt, 5005, 5010, 4995, 5000)],
      dailyBias: "neutral",
    });

    expect(snapshot.pdl).toBe(5000);
    expect(snapshot.pdlMitigatedAt).toBe(sweptAt);
    expect(snapshot.sessionPoi).toEqual({
      kind: "pdl",
      sweptAt,
    });
  });

  it("resolves bullish Active DOL TP1 and TP2 from the level snapshot", () => {
    const bars = loadFixture("adr-rolling-average");
    const bars4h = abovePdhDisplacementGap(SUN_JAN_5_OPEN);

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars: [],
      dailyBias: "directional",
      biasDirection: "bullish",
    });

    expect(snapshot.activeDol).toEqual({
      tp1: { kind: "pdh" },
      tp2: { kind: "pwh" },
    });
  });

  it("switches Active DOL TP1 to Daily Open on reversal days with high ADR consumption", () => {
    const fixtureBars = loadFixture("adr-rolling-average");
    const bars = [
      ...fixtureBars.slice(0, -2),
      bar(MON_JAN_6_SESSION_OPEN, 5055, 5065, 5035, 5045),
      bar(MON_JAN_6_EVAL, 5045, 5115, 5035, 5040),
    ];
    const bars4h = abovePdhDisplacementGap(SUN_JAN_5_OPEN);

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars: [],
      dailyBias: "directional",
      biasDirection: "bullish",
      reversalDayTp1: true,
    });

    expect(snapshot.adrConsumptionPct).toBe(80);
    expect(snapshot.activeDol?.tp1).toEqual({ kind: "daily-open" });
  });

  it("keeps nearest Relevant Level as TP1 when reversal-day override is not enabled", () => {
    const fixtureBars = loadFixture("adr-rolling-average");
    const bars = [
      ...fixtureBars.slice(0, -2),
      bar(MON_JAN_6_SESSION_OPEN, 5055, 5065, 5035, 5045),
      bar(MON_JAN_6_EVAL, 5045, 5115, 5035, 5040),
    ];
    const bars4h = abovePdhDisplacementGap(SUN_JAN_5_OPEN);

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h,
      bars1h: [],
      mitigationBars: [],
      dailyBias: "directional",
      biasDirection: "bullish",
      reversalDayTp1: false,
    });

    expect(snapshot.activeDol?.tp1).toEqual({ kind: "pdh" });
  });

  it("returns null Active DOL when bias direction is not supplied", () => {
    const bars = loadFixture("mid-week-daily-boundary");

    const snapshot = computeLevelSnapshot({
      bars,
      bars4h: [],
      bars1h: [],
      mitigationBars: [],
      dailyBias: "directional",
    });

    expect(snapshot.activeDol).toBeNull();
  });
});
