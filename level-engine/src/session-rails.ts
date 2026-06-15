import type { Bar, SessionRails } from "./types.js";
import {
  groupBarsByDailySession,
  groupBarsByWeeklySession,
} from "./session-calendar.js";

export function computeSessionRails(bars: Bar[]): SessionRails {
  const dailyGroups = groupBarsByDailySession(bars);
  const weeklyGroups = groupBarsByWeeklySession(bars);

  const dailyKeys = [...dailyGroups.keys()].sort();
  const weeklyKeys = [...weeklyGroups.keys()].sort();

  const previousDaily = dailyGroups.get(dailyKeys[dailyKeys.length - 2]!)!;
  const previousWeekly = weeklyGroups.get(weeklyKeys[weeklyKeys.length - 2]!)!;
  const currentDaily = dailyGroups.get(dailyKeys[dailyKeys.length - 1]!)!;

  return {
    pdh: Math.max(...previousDaily.map((b) => b.high)),
    pdl: Math.min(...previousDaily.map((b) => b.low)),
    pwh: Math.max(...previousWeekly.map((b) => b.high)),
    pwl: Math.min(...previousWeekly.map((b) => b.low)),
    dailyOpen: currentDaily[0]!.open,
  };
}
