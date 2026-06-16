import type { Bar } from "./types.js";
import type { HtfTimeframe } from "./htf-fvg.js";
import { getDailySessionKey, isWithinHtfFvgLookback } from "./session-calendar.js";
import { findLevelCrossTime } from "./level-mitigation.js";

export type HtfSwingKind = "high" | "low";

export type HtfSwingPoint = {
  timeframe: HtfTimeframe;
  kind: HtfSwingKind;
  price: number;
  formedAt: number;
  confirmedAt: number;
  mitigatedAt?: number;
};

export type ComputeHtfSwingPointsInput = {
  bars4h: Bar[];
  bars1h: Bar[];
  mitigationBars: Bar[];
  pwh: number;
  pwl: number;
  currentWeekHigh: number;
  currentWeekLow: number;
  asOf: number;
};

export function combinedWeeklySwingRange(input: {
  pwh: number;
  pwl: number;
  currentWeekHigh: number;
  currentWeekLow: number;
}): { rangeLow: number; rangeHigh: number } {
  return {
    rangeLow: Math.min(input.pwl, input.currentWeekLow),
    rangeHigh: Math.max(input.pwh, input.currentWeekHigh),
  };
}

function isStrictFractalHigh(bars: Bar[], pivotIndex: number): boolean {
  const pivotHigh = bars[pivotIndex]!.high;
  for (let offset = 1; offset <= 3; offset++) {
    if (pivotHigh <= bars[pivotIndex - offset]!.high) {
      return false;
    }
    if (pivotHigh <= bars[pivotIndex + offset]!.high) {
      return false;
    }
  }
  return true;
}

function isStrictFractalLow(bars: Bar[], pivotIndex: number): boolean {
  const pivotLow = bars[pivotIndex]!.low;
  for (let offset = 1; offset <= 3; offset++) {
    if (pivotLow >= bars[pivotIndex - offset]!.low) {
      return false;
    }
    if (pivotLow >= bars[pivotIndex + offset]!.low) {
      return false;
    }
  }
  return true;
}

function detectSwingsOnTimeframe(
  bars: Bar[],
  timeframe: HtfTimeframe,
): HtfSwingPoint[] {
  const swings: HtfSwingPoint[] = [];

  for (let i = 3; i < bars.length - 3; i++) {
    const pivot = bars[i]!;

    if (isStrictFractalHigh(bars, i)) {
      swings.push({
        timeframe,
        kind: "high",
        price: pivot.high,
        formedAt: pivot.time,
        confirmedAt: bars[i + 3]!.time,
      });
    }

    if (isStrictFractalLow(bars, i)) {
      swings.push({
        timeframe,
        kind: "low",
        price: pivot.low,
        formedAt: pivot.time,
        confirmedAt: bars[i + 3]!.time,
      });
    }
  }

  return swings;
}

function isInsideWeeklySwingRange(
  price: number,
  input: ComputeHtfSwingPointsInput,
): boolean {
  const { rangeLow, rangeHigh } = combinedWeeklySwingRange(input);
  return price >= rangeLow && price <= rangeHigh;
}

function isVisibleSwing(
  swing: HtfSwingPoint,
  input: ComputeHtfSwingPointsInput,
): boolean {
  if (swing.confirmedAt > input.asOf) {
    return false;
  }

  if (!isWithinHtfFvgLookback(swing.formedAt, input.asOf)) {
    return false;
  }

  return isInsideWeeklySwingRange(swing.price, input);
}

function findMitigationTime(
  swing: HtfSwingPoint,
  mitigationBars: Bar[],
  asOf: number,
): number | undefined {
  return findLevelCrossTime(
    swing.kind,
    swing.price,
    swing.confirmedAt,
    mitigationBars,
    asOf,
  );
}

function withMitigation(
  swing: HtfSwingPoint,
  input: ComputeHtfSwingPointsInput,
): HtfSwingPoint | null {
  const mitigatedAt = findMitigationTime(
    swing,
    input.mitigationBars,
    input.asOf,
  );

  if (mitigatedAt === undefined) {
    return swing;
  }

  const currentSession = getDailySessionKey(input.asOf);
  if (getDailySessionKey(mitigatedAt) !== currentSession) {
    return null;
  }

  return { ...swing, mitigatedAt };
}

export function computeHtfSwingPoints(
  input: ComputeHtfSwingPointsInput,
): HtfSwingPoint[] {
  const swings = [
    ...detectSwingsOnTimeframe(input.bars4h, "4H"),
    ...detectSwingsOnTimeframe(input.bars1h, "1H"),
  ];

  return swings
    .filter((swing) => isVisibleSwing(swing, input))
    .map((swing) => withMitigation(swing, input))
    .filter((swing): swing is HtfSwingPoint => swing !== null);
}
