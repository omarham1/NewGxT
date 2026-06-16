import type { Bar, SessionRails } from "./types.js";
import {
  getDailySessionKey,
  groupBarsByDailySession,
  groupBarsByWeeklySession,
  resolveWeeklySessionKey,
} from "./session-calendar.js";
import { findLevelCrossTime } from "./level-mitigation.js";

export type SessionRailMitigation = {
  pdhMitigatedAt?: number;
  pdlMitigatedAt?: number;
  pwhMitigatedAt?: number;
  pwlMitigatedAt?: number;
};

function currentDailySessionOpen(bars: Bar[]): number {
  const groups = groupBarsByDailySession(bars);
  const keys = [...groups.keys()].sort();
  return groups.get(keys[keys.length - 1]!)![0]!.time;
}

function currentWeeklySessionOpen(bars: Bar[]): number {
  const groups = groupBarsByWeeklySession(bars);
  const keys = [...groups.keys()].sort();
  return groups.get(keys[keys.length - 1]!)![0]!.time;
}

function retainDailySessionMitigation(
  mitigatedAt: number | undefined,
  asOf: number,
): number | undefined {
  if (mitigatedAt === undefined) {
    return undefined;
  }

  if (getDailySessionKey(mitigatedAt) !== getDailySessionKey(asOf)) {
    return undefined;
  }

  return mitigatedAt;
}

function retainWeeklySessionMitigation(
  mitigatedAt: number | undefined,
  asOf: number,
): number | undefined {
  if (mitigatedAt === undefined) {
    return undefined;
  }

  const mitigatedWeek = resolveWeeklySessionKey(mitigatedAt);
  const asOfWeek = resolveWeeklySessionKey(asOf);
  if (
    mitigatedWeek === null ||
    asOfWeek === null ||
    mitigatedWeek !== asOfWeek
  ) {
    return undefined;
  }

  return mitigatedAt;
}

export function computeSessionRailMitigation(input: {
  rails: SessionRails;
  bars: Bar[];
  mitigationBars: Bar[];
  asOf: number;
}): SessionRailMitigation {
  const dailyOpen = currentDailySessionOpen(input.bars);
  const weeklyOpen = currentWeeklySessionOpen(input.bars);
  const { mitigationBars, asOf, rails } = input;

  return {
    pdhMitigatedAt: retainDailySessionMitigation(
      findLevelCrossTime("high", rails.pdh, dailyOpen, mitigationBars, asOf, {
        activeInclusive: true,
      }),
      asOf,
    ),
    pdlMitigatedAt: retainDailySessionMitigation(
      findLevelCrossTime("low", rails.pdl, dailyOpen, mitigationBars, asOf, {
        activeInclusive: true,
      }),
      asOf,
    ),
    pwhMitigatedAt: retainWeeklySessionMitigation(
      findLevelCrossTime("high", rails.pwh, weeklyOpen, mitigationBars, asOf, {
        activeInclusive: true,
      }),
      asOf,
    ),
    pwlMitigatedAt: retainWeeklySessionMitigation(
      findLevelCrossTime("low", rails.pwl, weeklyOpen, mitigationBars, asOf, {
        activeInclusive: true,
      }),
      asOf,
    ),
  };
}
