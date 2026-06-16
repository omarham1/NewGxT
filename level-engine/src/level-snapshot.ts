import type { Bar, SessionContext } from "./types.js";
import { computeSessionContext } from "./session-context.js";
import { computeHtfFvgs, type HtfFvg } from "./htf-fvg.js";
import { computeHtfSwingPoints, type HtfSwingPoint } from "./htf-swing.js";
import { computeCurrentWeekRange } from "./session-rails.js";
import { computeSessionRailMitigation } from "./session-rail-mitigation.js";

export type LevelSnapshot = SessionContext & {
  htfFvgs: HtfFvg[];
  htfSwingPoints: HtfSwingPoint[];
};

export type ComputeLevelSnapshotInput = {
  bars: Bar[];
  bars4h: Bar[];
  bars1h: Bar[];
  mitigationBars: Bar[];
};

export function computeLevelSnapshot(
  input: ComputeLevelSnapshotInput,
): LevelSnapshot {
  const context = computeSessionContext(input.bars);
  const currentWeek = computeCurrentWeekRange(input.bars);
  const asOf = latestBarTime([
    ...input.bars,
    ...input.bars4h,
    ...input.bars1h,
    ...input.mitigationBars,
  ]);
  const railMitigation = computeSessionRailMitigation({
    rails: context,
    bars: input.bars,
    mitigationBars: input.mitigationBars,
    asOf,
  });
  const htfFvgs = computeHtfFvgs({
    bars4h: input.bars4h,
    bars1h: input.bars1h,
    mitigationBars: input.mitigationBars,
    asOf,
  });
  const htfSwingPoints = computeHtfSwingPoints({
    bars4h: input.bars4h,
    bars1h: input.bars1h,
    mitigationBars: input.mitigationBars,
    pwh: context.pwh,
    pwl: context.pwl,
    currentWeekHigh: currentWeek.high,
    currentWeekLow: currentWeek.low,
    asOf,
  });

  return {
    ...context,
    ...railMitigation,
    htfFvgs,
    htfSwingPoints,
  };
}

function latestBarTime(bars: Bar[]): number {
  if (bars.length === 0) {
    return 0;
  }

  return bars.reduce((latest, bar) => Math.max(latest, bar.time), bars[0]!.time);
}
