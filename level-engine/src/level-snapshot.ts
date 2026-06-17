import type { Bar, SessionContext } from "./types.js";
import { computeSessionContext } from "./session-context.js";
import { computeHtfFvgs, type HtfFvg } from "./htf-fvg.js";
import { computeHtfSwingPoints, type HtfSwingPoint } from "./htf-swing.js";
import { computeCurrentWeekRange } from "./session-rails.js";
import { computeSessionRailMitigation } from "./session-rail-mitigation.js";
import { getDailySessionOpenTime } from "./session-calendar.js";
import {
  selectSessionPoi,
  type DailyBias,
  type SessionPoi,
} from "./session-poi.js";
import {
  resolveActiveDol,
  type ActiveDol,
  type BiasDirection,
} from "./active-dol.js";

export type { DailyBias, SessionPoi } from "./session-poi.js";
export type { ActiveDol, ActiveDolTarget, BiasDirection } from "./active-dol.js";

export type LevelSnapshot = SessionContext & {
  htfFvgs: HtfFvg[];
  htfSwingPoints: HtfSwingPoint[];
  sessionPoi: SessionPoi | null;
  activeDol: ActiveDol | null;
};

export type ComputeLevelSnapshotInput = {
  bars: Bar[];
  bars4h: Bar[];
  bars1h: Bar[];
  mitigationBars: Bar[];
  dailyBias?: DailyBias;
  biasDirection?: BiasDirection;
  reversalDayTp1?: boolean;
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
    adr: context.adr,
    asOf,
  });

  const currentPrice = latestBarClose(input.bars);
  const sessionOpenTime = getDailySessionOpenTime(asOf);
  const sessionPoi =
    input.dailyBias === undefined
      ? null
      : selectSessionPoi({
          dailyBias: input.dailyBias,
          asOf,
          sessionOpenTime,
          currentPrice,
          pdEquilibriumLow: context.pdEquilibriumLow,
          pdEquilibriumHigh: context.pdEquilibriumHigh,
          pdhMitigatedAt: railMitigation.pdhMitigatedAt,
          pdlMitigatedAt: railMitigation.pdlMitigatedAt,
          htfFvgs,
          htfSwingPoints,
        });

  const activeDol =
    input.dailyBias === undefined || input.biasDirection === undefined
      ? null
      : resolveActiveDol({
          biasDirection: input.biasDirection,
          currentPrice,
          openPlusAdr: context.openPlusAdr,
          openMinusAdr: context.openMinusAdr,
          pdh: context.pdh,
          pdl: context.pdl,
          pwh: context.pwh,
          pwl: context.pwl,
          pdhMitigatedAt: railMitigation.pdhMitigatedAt,
          pdlMitigatedAt: railMitigation.pdlMitigatedAt,
          pwhMitigatedAt: railMitigation.pwhMitigatedAt,
          pwlMitigatedAt: railMitigation.pwlMitigatedAt,
          dailyOpen: context.dailyOpen,
          adrConsumptionPct: context.adrConsumptionPct,
          reversalDayTp1: input.reversalDayTp1,
          htfFvgs,
          htfSwingPoints,
        });

  return {
    ...context,
    ...railMitigation,
    htfFvgs,
    htfSwingPoints,
    sessionPoi,
    activeDol,
  };
}

function latestBarClose(bars: Bar[]): number {
  if (bars.length === 0) {
    return 0;
  }

  const latest = bars.reduce((best, bar) => (bar.time > best.time ? bar : best), bars[0]!);
  return latest.close;
}

function latestBarTime(bars: Bar[]): number {
  if (bars.length === 0) {
    return 0;
  }

  return bars.reduce((latest, bar) => Math.max(latest, bar.time), bars[0]!.time);
}
