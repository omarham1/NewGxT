import {
  getDailySessionKey,
  getDailySessionOpenTime,
  resolveWeeklySessionKey,
} from "../../src/session-calendar.js";
import type { SessionRailMitigation } from "../../src/session-rail-mitigation.js";
import type { Bar, SessionRails } from "../../src/types.js";
import { DateTime } from "luxon";

const ET = "America/New_York";

function weekSessionOpenTime(timeMs: number): number | null {
  const weekKey = resolveWeeklySessionKey(timeMs);
  if (weekKey === null) {
    return null;
  }
  return DateTime.fromISO(weekKey, { zone: ET }).toMillis()!;
}

/**
 * Mirrors the 1m `request.security` rail-mitigation state machine in Pine:
 * var flags reset on session/week roll; wick contact after open mitigates.
 */
export function simulateOneMinRailMitigationStateMachine(input: {
  rails: SessionRails;
  mitigationBars: Bar[];
  asOf: number;
}): SessionRailMitigation {
  const sorted = [...input.mitigationBars].sort((a, b) => a.time - b.time);
  const { rails, asOf } = input;

  let pdhMitigated = false;
  let pdhMitigatedTime: number | undefined;
  let pdlMitigated = false;
  let pdlMitigatedTime: number | undefined;
  let pwhMitigated = false;
  let pwhMitigatedTime: number | undefined;
  let pwlMitigated = false;
  let pwlMitigatedTime: number | undefined;

  let prevDailyKey: string | undefined;
  let prevWeekKey: string | null | undefined;

  for (const bar of sorted) {
    if (bar.time > asOf) {
      break;
    }

    const dailyKey = getDailySessionKey(bar.time);
    const weekKey = resolveWeeklySessionKey(bar.time);

    if (prevDailyKey !== undefined && dailyKey !== prevDailyKey) {
      pdhMitigated = false;
      pdhMitigatedTime = undefined;
      pdlMitigated = false;
      pdlMitigatedTime = undefined;
    }

    if (
      prevWeekKey !== undefined &&
      weekKey !== null &&
      prevWeekKey !== null &&
      weekKey !== prevWeekKey
    ) {
      pwhMitigated = false;
      pwhMitigatedTime = undefined;
      pwlMitigated = false;
      pwlMitigatedTime = undefined;
    }

    const dailyOpenTime = getDailySessionOpenTime(bar.time);
    const weekOpenTime = weekSessionOpenTime(bar.time);

    if (
      !pdhMitigated &&
      bar.time >= dailyOpenTime &&
      bar.high >= rails.pdh
    ) {
      pdhMitigated = true;
      pdhMitigatedTime = bar.time;
    }
    if (
      !pdlMitigated &&
      bar.time >= dailyOpenTime &&
      bar.low <= rails.pdl
    ) {
      pdlMitigated = true;
      pdlMitigatedTime = bar.time;
    }
    if (
      !pwhMitigated &&
      weekOpenTime !== null &&
      bar.time >= weekOpenTime &&
      bar.high >= rails.pwh
    ) {
      pwhMitigated = true;
      pwhMitigatedTime = bar.time;
    }
    if (
      !pwlMitigated &&
      weekOpenTime !== null &&
      bar.time >= weekOpenTime &&
      bar.low <= rails.pwl
    ) {
      pwlMitigated = true;
      pwlMitigatedTime = bar.time;
    }

    prevDailyKey = dailyKey;
    prevWeekKey = weekKey;
  }

  const asOfDaily = getDailySessionKey(asOf);
  const asOfWeek = resolveWeeklySessionKey(asOf);

  return {
    pdhMitigatedAt:
      pdhMitigated &&
      pdhMitigatedTime !== undefined &&
      getDailySessionKey(pdhMitigatedTime) === asOfDaily
        ? pdhMitigatedTime
        : undefined,
    pdlMitigatedAt:
      pdlMitigated &&
      pdlMitigatedTime !== undefined &&
      getDailySessionKey(pdlMitigatedTime) === asOfDaily
        ? pdlMitigatedTime
        : undefined,
    pwhMitigatedAt:
      pwhMitigated &&
      pwhMitigatedTime !== undefined &&
      resolveWeeklySessionKey(pwhMitigatedTime) === asOfWeek
        ? pwhMitigatedTime
        : undefined,
    pwlMitigatedAt:
      pwlMitigated &&
      pwlMitigatedTime !== undefined &&
      resolveWeeklySessionKey(pwlMitigatedTime) === asOfWeek
        ? pwlMitigatedTime
        : undefined,
  };
}
