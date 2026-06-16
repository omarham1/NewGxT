import { describe, expect, it } from "vitest";
import { computeLevelSnapshot } from "../src/level-snapshot.js";
import { loadFixture } from "./helpers/load-fixture.js";
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

describe("Level Snapshot", () => {
  it("excludes mitigated HTF FVGs from the snapshot", () => {
    const bars = loadFixture("mid-week-daily-boundary");
    const bars4h = [
      bar(SUN_JAN_5_OPEN, 100, 105, 98, 102),
      bar(SUN_JAN_5_OPEN + HOUR_MS, 102, 110, 101, 108),
      bar(SUN_JAN_5_OPEN + 2 * HOUR_MS, 108, 115, 106, 112),
    ];
    const mitigationBars = [
      bar(SUN_JAN_5_OPEN + 3 * HOUR_MS, 107, 108, 105, 107),
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

  it("excludes an unmitigated HTF FVG outside the two-week lookback window", () => {
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
});
