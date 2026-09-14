import type { Bar } from "./types.js";
import {
  getDailySessionCloseTime,
  groupBarsByWeeklySession,
  resolveWeeklySessionKey,
} from "./session-calendar.js";
import { findLevelCrossTime } from "./level-mitigation.js";

export const NEW_WEEK_OPENING_GAP_MIN_TICKS = 4;

export type NewWeekOpeningGap = {
  fridayClose: number;
  weekOpen: number;
  weekOpenTime: number;
  displayUntil: number;
};

export function computeNewWeekOpeningGap(
  bars: Bar[],
  mintick: number,
): NewWeekOpeningGap | undefined {
  const weeklyGroups = groupBarsByWeeklySession(bars);
  const weeklyKeys = [...weeklyGroups.keys()].sort();
  if (weeklyKeys.length < 2) {
    return undefined;
  }

  const currentWeekly = weeklyGroups.get(weeklyKeys[weeklyKeys.length - 1]!)!;
  const previousWeekly = weeklyGroups.get(weeklyKeys[weeklyKeys.length - 2]!)!;
  const weekOpenBar = currentWeekly[0]!;
  const fridayBar = previousWeekly[previousWeekly.length - 1]!;
  const fridayClose = fridayBar.close;
  const weekOpen = weekOpenBar.open;

  if (
    Math.abs(weekOpen - fridayClose) <=
    NEW_WEEK_OPENING_GAP_MIN_TICKS * mintick
  ) {
    return undefined;
  }

  const latestTime = bars.reduce(
    (latest, b) => Math.max(latest, b.time),
    bars[0]!.time,
  );

  return {
    fridayClose,
    weekOpen,
    weekOpenTime: weekOpenBar.time,
    displayUntil: getDailySessionCloseTime(latestTime),
  };
}

export function computeNewWeekOpeningGapMitigation(input: {
  gap: NewWeekOpeningGap;
  mitigationBars: Bar[];
  asOf: number;
}): number | undefined {
  const { gap, mitigationBars, asOf } = input;
  const kind = gap.weekOpen > gap.fridayClose ? "low" : "high";
  const crossedAt = findLevelCrossTime(
    kind,
    gap.fridayClose,
    gap.weekOpenTime,
    mitigationBars,
    asOf,
    { activeInclusive: true },
  );

  if (crossedAt === undefined) {
    return undefined;
  }

  const crossedWeek = resolveWeeklySessionKey(crossedAt);
  const asOfWeek = resolveWeeklySessionKey(asOf);
  if (
    crossedWeek === null ||
    asOfWeek === null ||
    crossedWeek !== asOfWeek
  ) {
    return undefined;
  }

  return crossedAt;
}
