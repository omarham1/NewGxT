import { describe, expect, it } from "vitest";
import {
  NEW_WEEK_OPENING_GAP_MIN_TICKS,
  computeNewWeekOpeningGap,
  computeNewWeekOpeningGapMitigation,
} from "../src/new-week-opening-gap.js";
import { getDailySessionCloseTime } from "../src/session-calendar.js";
import { loadFixture } from "./helpers/load-fixture.js";
import type { Bar } from "../src/types.js";

const HOUR_MS = 60 * 60 * 1000;
const MINTICK = 0.25;
const FRI_JAN_3_CLOSE_REGION = 1735927200000;
const SUN_JAN_5_OPEN = 1736118000000;
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

describe("New Week Opening Gap", () => {
  it("is the void between the previous week's last close and this week's first open", () => {
    const bars = loadFixture("weekly-boundary");
    const gap = computeNewWeekOpeningGap(bars, MINTICK);

    expect(gap).toEqual({
      fridayClose: 4835,
      weekOpen: 5020,
      weekOpenTime: SUN_JAN_5_OPEN,
      displayUntil: getDailySessionCloseTime(MON_JAN_6_EVAL),
    });
  });

  it("projects the box to the current daily session close and rolls at the next 18:00 open", () => {
    const throughSunday = [
      bar(FRI_JAN_3_CLOSE_REGION, 4850, 4860, 4820, 4835),
      bar(SUN_JAN_5_OPEN, 5020, 5100, 5000, 5080),
    ];
    const throughMondayOpen = [
      ...throughSunday,
      bar(1736204400000, 5055, 5065, 5035, 5045),
    ];

    expect(computeNewWeekOpeningGap(throughSunday, MINTICK)?.displayUntil).toBe(
      getDailySessionCloseTime(SUN_JAN_5_OPEN),
    );
    expect(
      computeNewWeekOpeningGap(throughMondayOpen, MINTICK)?.displayUntil,
    ).toBe(getDailySessionCloseTime(1736204400000));
  });

  it("does not exist when the two prints differ by four minticks or less", () => {
    const bars = [
      bar(FRI_JAN_3_CLOSE_REGION, 5000, 5001, 4999, 5000),
      bar(SUN_JAN_5_OPEN, 5001, 5002, 5000, 5001.25),
    ];

    expect(computeNewWeekOpeningGap(bars, MINTICK)).toBeUndefined();
    expect(NEW_WEEK_OPENING_GAP_MIN_TICKS * MINTICK).toBe(1);
  });

  it("exists when the two prints differ by more than four minticks", () => {
    const bars = [
      bar(FRI_JAN_3_CLOSE_REGION, 5000, 5001, 4999, 5000),
      bar(SUN_JAN_5_OPEN, 5001.25, 5002, 5000, 5001.5),
    ];

    expect(computeNewWeekOpeningGap(bars, MINTICK)?.weekOpen).toBe(5001.25);
  });

  it("uses the first print of the new CME week when Sunday and Monday bars are absent", () => {
    const tueWeekOpen = 1736290800000; // Tue Jan 7 2025 18:00 ET
    const bars = [
      bar(FRI_JAN_3_CLOSE_REGION, 5800, 5810, 5790, 5800),
      bar(tueWeekOpen, 5840, 5850, 5830, 5845),
    ];

    const gap = computeNewWeekOpeningGap(bars, MINTICK);
    expect(gap?.fridayClose).toBe(5800);
    expect(gap?.weekOpen).toBe(5840);
    expect(gap?.weekOpenTime).toBe(tueWeekOpen);
  });

  it("mutes on a 1m wick at or beyond Friday close after the week open", () => {
    const gap = computeNewWeekOpeningGap(loadFixture("weekly-boundary"), MINTICK)!;
    const mitigatedAt = MON_JAN_6_EVAL + HOUR_MS;

    const mutedAt = computeNewWeekOpeningGapMitigation({
      gap,
      mitigationBars: [bar(mitigatedAt, 4840, 4850, 4835, 4845)],
      asOf: mitigatedAt,
    });

    expect(mutedAt).toBe(mitigatedAt);
  });

  it("does not mute on a wick into the void that never tags Friday close", () => {
    const gap = computeNewWeekOpeningGap(loadFixture("weekly-boundary"), MINTICK)!;
    const insideGap = MON_JAN_6_EVAL + HOUR_MS;

    expect(
      computeNewWeekOpeningGapMitigation({
        gap,
        mitigationBars: [bar(insideGap, 4950, 4960, 4940, 4955)],
        asOf: insideGap,
      }),
    ).toBeUndefined();
  });

  it("mutes a gap-down void when a 1m wick prints at or above Friday close", () => {
    const bars = [
      bar(FRI_JAN_3_CLOSE_REGION, 5100, 5110, 5090, 5100),
      bar(SUN_JAN_5_OPEN, 5000, 5010, 4990, 5005),
    ];
    const gap = computeNewWeekOpeningGap(bars, MINTICK)!;
    const mitigatedAt = MON_JAN_6_EVAL;

    expect(gap.weekOpen).toBe(5000);
    expect(
      computeNewWeekOpeningGapMitigation({
        gap,
        mitigationBars: [bar(mitigatedAt, 5095, 5100, 5090, 5098)],
        asOf: mitigatedAt,
      }),
    ).toBe(mitigatedAt);
  });
});
