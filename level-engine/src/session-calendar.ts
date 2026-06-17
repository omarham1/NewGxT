import { DateTime } from "luxon";
import type { Bar } from "./types.js";

const ET = "America/New_York";
const SESSION_START_HOUR = 18;
const WEEKLY_END_DAY = 5; // Friday
const WEEKLY_END_HOUR = 17;
/** Failure Swing comparison pool spans four CME weeks (display lookback stays two). */
const HTF_SWING_COMPARISON_WEEK_LOOKBACK = 4;

export function toEt(timeMs: number): DateTime {
  return DateTime.fromMillis(timeMs, { zone: ET });
}

export function getDailySessionKey(timeMs: number): string {
  return dailySessionStartEt(timeMs).toISODate()!;
}

export function getDailySessionOpenTime(timeMs: number): number {
  return dailySessionStartEt(timeMs).toMillis()!;
}

/** 17:00 ET on the calendar day after the current CME daily session open. */
export function getDailySessionCloseTime(timeMs: number): number {
  return dailySessionStartEt(timeMs)
    .plus({ days: 1 })
    .set({
      hour: WEEKLY_END_HOUR,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    .toMillis()!;
}

function dailySessionStartEt(timeMs: number): DateTime {
  const et = toEt(timeMs);
  const sessionStartDay =
    et.hour > SESSION_START_HOUR ||
    (et.hour === SESSION_START_HOUR && et.minute >= 0)
      ? et.startOf("day")
      : et.minus({ days: 1 }).startOf("day");

  return sessionStartDay.set({
    hour: SESSION_START_HOUR,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
}

export function getWeeklySessionKey(timeMs: number): string | null {
  const et = toEt(timeMs);
  const weekStart = weekStartForEt(et);
  const weekEnd = weekStart
    .plus({ days: WEEKLY_END_DAY })
    .set({ hour: WEEKLY_END_HOUR, minute: 0, second: 0, millisecond: 0 });

  if (et < weekStart || et > weekEnd) {
    return null;
  }

  return weekStart.toISODate()!;
}

function weekStartForEt(et: DateTime): DateTime {
  let sunday = et.set({ weekday: 7 }).startOf("day");
  if (sunday > et.startOf("day")) {
    sunday = sunday.minus({ weeks: 1 });
  }

  return sunday.set({
    hour: SESSION_START_HOUR,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
}

export function resolveWeeklySessionKey(timeMs: number): string | null {
  const direct = getWeeklySessionKey(timeMs);
  if (direct !== null) {
    return direct;
  }

  const et = toEt(timeMs);
  const weekStart = weekStartForEt(et);
  const weekEnd = weekStart
    .plus({ days: WEEKLY_END_DAY })
    .set({ hour: WEEKLY_END_HOUR, minute: 0, second: 0, millisecond: 0 });

  if (et > weekEnd) {
    return weekStart.toISODate()!;
  }

  const previousWeekStart = weekStart.minus({ weeks: 1 });
  return previousWeekStart.toISODate()!;
}

function previousWeeklySessionKey(weekKey: string): string {
  return DateTime.fromISO(weekKey, { zone: ET })
    .minus({ weeks: 1 })
    .toISODate()!;
}

function previousDailySessionKey(sessionKey: string): string {
  return DateTime.fromISO(sessionKey, { zone: ET })
    .minus({ days: 1 })
    .toISODate()!;
}

/** CME equity-index holidays when Monday session is skipped (Tuesday 18:00 ET week-open). */
const CME_HOLIDAYS = new Set([
  "2025-01-20", // MLK Day
]);

function isCmeHoliday(date: DateTime): boolean {
  return CME_HOLIDAYS.has(date.toISODate()!);
}

function isFirstDailySessionOfCmeWeek(sessionKey: string): boolean {
  const date = DateTime.fromISO(sessionKey, { zone: ET });
  if (date.weekday === 1) {
    return true;
  }

  if (date.weekday === 2) {
    return isCmeHoliday(date.minus({ days: 1 }));
  }

  return false;
}

/** Thursday-keyed session containing Friday daytime (ends Fri 17:00 ET). */
function priorFridayDailySessionKey(sessionKey: string): string {
  const date = DateTime.fromISO(sessionKey, { zone: ET });
  const weekSunday =
    date.weekday === 1
      ? date.minus({ days: 1 })
      : date.minus({ days: 2 });
  const friday = weekSunday.minus({ days: 2 });
  return friday.minus({ days: 1 }).toISODate()!;
}

export function isWithinHtfFvgLookback(formedAt: number, asOf: number): boolean {
  const formedSession = getDailySessionKey(formedAt);
  const asOfSession = getDailySessionKey(asOf);

  if (formedSession === asOfSession) {
    return true;
  }

  if (formedSession === previousDailySessionKey(asOfSession)) {
    return true;
  }

  if (
    isFirstDailySessionOfCmeWeek(asOfSession) &&
    formedSession === priorFridayDailySessionKey(asOfSession)
  ) {
    return true;
  }

  return false;
}

export function isWithinHtfSwingLookback(
  formedAt: number,
  asOf: number,
): boolean {
  const formedWeek = resolveWeeklySessionKey(formedAt);
  const asOfWeek = resolveWeeklySessionKey(asOf);
  if (formedWeek === null || asOfWeek === null) {
    return false;
  }

  if (formedWeek === asOfWeek) {
    return true;
  }

  return formedWeek === previousWeeklySessionKey(asOfWeek);
}

/** Four CME weeks — used for Failure Swing comparison pool (display lookback stays two weeks). */
export function isWithinHtfSwingComparisonLookback(
  formedAt: number,
  asOf: number,
): boolean {
  const formedWeek = resolveWeeklySessionKey(formedAt);
  const asOfWeek = resolveWeeklySessionKey(asOf);
  if (formedWeek === null || asOfWeek === null) {
    return false;
  }

  let weekKey = asOfWeek;
  for (let i = 0; i < HTF_SWING_COMPARISON_WEEK_LOOKBACK; i++) {
    if (formedWeek === weekKey) {
      return true;
    }
    weekKey = previousWeeklySessionKey(weekKey);
  }

  return false;
}

export function groupBarsByDailySession(bars: Bar[]): Map<string, Bar[]> {
  const groups = new Map<string, Bar[]>();

  for (const bar of bars) {
    const key = getDailySessionKey(bar.time);
    const group = groups.get(key) ?? [];
    group.push(bar);
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    group.sort((a, b) => a.time - b.time);
  }

  return groups;
}

export function groupBarsByWeeklySession(bars: Bar[]): Map<string, Bar[]> {
  const groups = new Map<string, Bar[]>();

  for (const bar of bars) {
    const key = getWeeklySessionKey(bar.time);
    if (key === null) continue;

    const group = groups.get(key) ?? [];
    group.push(bar);
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    group.sort((a, b) => a.time - b.time);
  }

  return groups;
}
