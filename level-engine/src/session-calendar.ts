import { DateTime } from "luxon";
import type { Bar } from "./types.js";

const ET = "America/New_York";
const SESSION_START_HOUR = 18;
const WEEKLY_END_DAY = 5; // Friday
const WEEKLY_END_HOUR = 17;

export function toEt(timeMs: number): DateTime {
  return DateTime.fromMillis(timeMs, { zone: ET });
}

export function getDailySessionKey(timeMs: number): string {
  return dailySessionStartEt(timeMs).toISODate()!;
}

export function getDailySessionOpenTime(timeMs: number): number {
  return dailySessionStartEt(timeMs).toMillis()!;
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

export function isWithinHtfFvgLookback(formedAt: number, asOf: number): boolean {
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
