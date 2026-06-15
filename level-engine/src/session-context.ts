import type { Bar, SessionContext } from "./types.js";
import { groupBarsByDailySession } from "./session-calendar.js";
import { computeSessionRails } from "./session-rails.js";

const ADR_LOOKBACK = 14;
const EQUILIBRIUM_LOW_FRACTION = 0.25;
const EQUILIBRIUM_HIGH_FRACTION = 0.75;

function dailySessionRange(bars: Bar[]): number {
  return Math.max(...bars.map((b) => b.high)) - Math.min(...bars.map((b) => b.low));
}

function computeAdr(dailyGroups: Map<string, Bar[]>, dailyKeys: string[]): number {
  const completedKeys = dailyKeys.slice(0, -1);
  const lookbackKeys = completedKeys.slice(-ADR_LOOKBACK);
  const ranges = lookbackKeys.map((key) => dailySessionRange(dailyGroups.get(key)!));
  return ranges.reduce((sum, range) => sum + range, 0) / ranges.length;
}

export function computeSessionContext(bars: Bar[]): SessionContext {
  const rails = computeSessionRails(bars);
  const dailyGroups = groupBarsByDailySession(bars);
  const dailyKeys = [...dailyGroups.keys()].sort();
  const currentDaily = dailyGroups.get(dailyKeys[dailyKeys.length - 1]!)!;

  const pdRange = rails.pdh - rails.pdl;
  const adr = computeAdr(dailyGroups, dailyKeys);
  const currentRange = dailySessionRange(currentDaily);

  return {
    ...rails,
    adr,
    openPlusAdr: rails.dailyOpen + adr,
    openMinusAdr: rails.dailyOpen - adr,
    adrConsumptionPct: adr === 0 ? 0 : (currentRange / adr) * 100,
    pdEquilibriumLow: rails.pdl + pdRange * EQUILIBRIUM_LOW_FRACTION,
    pdEquilibriumHigh: rails.pdl + pdRange * EQUILIBRIUM_HIGH_FRACTION,
  };
}
