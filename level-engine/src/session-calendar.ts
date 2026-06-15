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
  const et = toEt(timeMs);
  const sessionStart =
    et.hour > SESSION_START_HOUR ||
    (et.hour === SESSION_START_HOUR && et.minute >= 0)
      ? et.startOf("day")
      : et.minus({ days: 1 }).startOf("day");

  return sessionStart.toISODate()!;
}

export function getWeeklySessionKey(timeMs: number): string | null {
  const et = toEt(timeMs);

  let sunday = et.set({ weekday: 7 }).startOf("day");
  if (sunday > et.startOf("day")) {
    sunday = sunday.minus({ weeks: 1 });
  }

  const weekStart = sunday.set({
    hour: SESSION_START_HOUR,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  const weekEnd = weekStart
    .plus({ days: WEEKLY_END_DAY })
    .set({ hour: WEEKLY_END_HOUR, minute: 0, second: 0, millisecond: 0 });

  if (et < weekStart || et > weekEnd) {
    return null;
  }

  return weekStart.toISODate()!;
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
