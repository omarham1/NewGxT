import type { Bar } from "./types.js";
import type { HtfTimeframe } from "./htf-fvg.js";
import {
  getDailySessionCloseTime,
  getDailySessionKey,
  isWithinHtfSwingComparisonLookback,
  isWithinHtfSwingLookback,
} from "./session-calendar.js";
import { findLevelCrossTime } from "./level-mitigation.js";

export type HtfSwingKind = "high" | "low";

export type HtfSwingPoint = {
  timeframe: HtfTimeframe;
  kind: HtfSwingKind;
  price: number;
  formedAt: number;
  confirmedAt: number;
  /** Unmitigated swings project through the current CME daily session close (17:00 ET). */
  displayUntil?: number;
  mitigatedAt?: number;
  isFailureSwing?: boolean;
};

export const DEFAULT_FAILURE_SWING_ADR_FRACTION = 0.125;

const HTF_PERIOD_MS: Record<HtfTimeframe, number> = {
  "4H": 4 * 60 * 60 * 1000,
  "1H": 60 * 60 * 1000,
};

/** Map a fractal pivot to the sub-bar time that printed the wick extreme. */
export function resolveSwingWickTime(
  pivotBar: Bar,
  kind: HtfSwingKind,
  timeframe: HtfTimeframe,
  subBars: Bar[],
): number {
  const periodStart = pivotBar.time;
  const periodEnd = periodStart + HTF_PERIOD_MS[timeframe];
  const extremePrice = kind === "high" ? pivotBar.high : pivotBar.low;

  let wickTime: number | undefined;
  for (const subBar of subBars) {
    if (subBar.time < periodStart || subBar.time >= periodEnd) {
      continue;
    }
    const subExtreme = kind === "high" ? subBar.high : subBar.low;
    if (subExtreme === extremePrice) {
      if (wickTime === undefined || subBar.time < wickTime) {
        wickTime = subBar.time;
      }
    }
  }

  return wickTime ?? periodStart;
}

export type ComputeHtfSwingPointsInput = {
  bars4h: Bar[];
  bars1h: Bar[];
  mitigationBars: Bar[];
  pwh: number;
  pwl: number;
  currentWeekHigh: number;
  currentWeekLow: number;
  adr: number;
  failureSwingAdrFraction?: number;
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
  subBars: Bar[],
): HtfSwingPoint[] {
  const swings: HtfSwingPoint[] = [];

  for (let i = 3; i < bars.length - 3; i++) {
    const pivot = bars[i]!;

    if (isStrictFractalHigh(bars, i)) {
      swings.push({
        timeframe,
        kind: "high",
        price: pivot.high,
        formedAt: resolveSwingWickTime(pivot, "high", timeframe, subBars),
        confirmedAt: bars[i + 3]!.time,
      });
    }

    if (isStrictFractalLow(bars, i)) {
      swings.push({
        timeframe,
        kind: "low",
        price: pivot.low,
        formedAt: resolveSwingWickTime(pivot, "low", timeframe, subBars),
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
  if (swing.isFailureSwing) {
    return false;
  }

  if (swing.confirmedAt > input.asOf) {
    return false;
  }

  if (!isWithinHtfSwingLookback(swing.formedAt, input.asOf)) {
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

function isMitigatedAsOf(
  swing: HtfSwingPoint,
  mitigationBars: Bar[],
  asOf: number,
): boolean {
  return findMitigationTime(swing, mitigationBars, asOf) !== undefined;
}

function failureSwingProximityThreshold(
  input: ComputeHtfSwingPointsInput,
): number {
  return (
    input.adr *
    (input.failureSwingAdrFraction ?? DEFAULT_FAILURE_SWING_ADR_FRACTION)
  );
}

function crossTfSwingPriceCluster(
  fourH: HtfSwingPoint,
  oneH: HtfSwingPoint,
  threshold: number,
): boolean {
  return (
    fourH.kind === oneH.kind &&
    Math.abs(fourH.price - oneH.price) <= threshold
  );
}

function canonicalCrossTfSwingPrice(
  left: number,
  right: number,
  kind: HtfSwingKind,
): number {
  return kind === "high" ? Math.max(left, right) : Math.min(left, right);
}

function isInnerCrossTfSwing(
  kind: HtfSwingKind,
  price: number,
  otherPrice: number,
): boolean {
  return kind === "high" ? price < otherPrice : price > otherPrice;
}

/** Snap 1H/4H swing prices to the same wick extreme when they share a pivot window. */
export function alignCrossTfSwingPrices(
  swings: HtfSwingPoint[],
  input: ComputeHtfSwingPointsInput,
): HtfSwingPoint[] {
  const threshold = failureSwingProximityThreshold(input);
  const aligned = swings.map((swing) => ({ ...swing }));

  for (const fourH of aligned) {
    if (fourH.timeframe !== "4H") {
      continue;
    }

    for (const oneH of aligned) {
      if (oneH.timeframe !== "1H" || oneH.kind !== fourH.kind) {
        continue;
      }

      if (fourH.confirmedAt > input.asOf || oneH.confirmedAt > input.asOf) {
        continue;
      }

      if (!crossTfSwingPriceCluster(fourH, oneH, threshold)) {
        continue;
      }

      const canonical = canonicalCrossTfSwingPrice(
        fourH.price,
        oneH.price,
        fourH.kind,
      );
      const fourHInner = isInnerCrossTfSwing(
        fourH.kind,
        fourH.price,
        oneH.price,
      );
      const oneHInner = isInnerCrossTfSwing(
        fourH.kind,
        oneH.price,
        fourH.price,
      );

      if (fourHInner) {
        fourH.price = canonical;
        fourH.isFailureSwing = true;
      }

      if (oneHInner) {
        oneH.price = canonical;
        oneH.isFailureSwing = true;
      }

      if (!fourHInner && !oneHInner) {
        oneH.isFailureSwing = true;
      }
    }
  }

  return aligned;
}

/** Visible swing fields only — lifecycle flags are stripped from engine output. */
function coreSwingFields(
  swing: HtfSwingPoint,
): Pick<
  HtfSwingPoint,
  "timeframe" | "kind" | "price" | "formedAt" | "confirmedAt"
> {
  const { timeframe, kind, price, formedAt, confirmedAt } = swing;
  return { timeframe, kind, price, formedAt, confirmedAt };
}

function isMoreExtreme(
  candidate: HtfSwingPoint,
  other: HtfSwingPoint,
): boolean {
  if (candidate.kind === "high") {
    return candidate.price > other.price;
  }
  return candidate.price < other.price;
}

function isInFailureSwingComparisonPool(
  swing: HtfSwingPoint,
  atTime: number,
  input: ComputeHtfSwingPointsInput,
): boolean {
  if (swing.confirmedAt > atTime) {
    return false;
  }

  if (!isWithinHtfSwingComparisonLookback(swing.formedAt, atTime)) {
    return false;
  }

  return isInsideWeeklySwingRange(swing.price, input);
}

function isFailureSwingPeer(
  peer: HtfSwingPoint,
  swing: HtfSwingPoint,
  input: ComputeHtfSwingPointsInput,
  threshold: number,
): boolean {
  if (
    peer.kind !== swing.kind ||
    peer.confirmedAt > swing.confirmedAt
  ) {
    return false;
  }

  if (!isInFailureSwingComparisonPool(peer, swing.confirmedAt, input)) {
    return false;
  }

  if (isMitigatedAsOf(peer, input.mitigationBars, swing.confirmedAt)) {
    return false;
  }

  return Math.abs(peer.price - swing.price) <= threshold;
}

function stampFailureSwingAgainstPeers(
  swing: HtfSwingPoint,
  peers: HtfSwingPoint[],
): void {
  for (const peer of peers) {
    if (peer === swing) {
      continue;
    }

    if (!peer.isFailureSwing && isMoreExtreme(peer, swing)) {
      swing.isFailureSwing = true;
      return;
    }

    if (isMoreExtreme(swing, peer)) {
      peer.isFailureSwing = true;
    }
  }
}

export function stampFailureSwings(
  swings: HtfSwingPoint[],
  input: ComputeHtfSwingPointsInput,
): HtfSwingPoint[] {
  const threshold = failureSwingProximityThreshold(input);
  const stamped = swings.map((swing) => ({
    ...swing,
    isFailureSwing: swing.isFailureSwing ?? false,
  }));

  const byConfirmation = [...stamped].sort(
    (left, right) => left.confirmedAt - right.confirmedAt,
  );

  for (const swing of byConfirmation) {
    if (swing.confirmedAt > input.asOf || swing.isFailureSwing) {
      continue;
    }

    const peers = stamped.filter((peer) =>
      isFailureSwingPeer(peer, swing, input, threshold),
    );
    stampFailureSwingAgainstPeers(swing, peers);
  }

  return stamped;
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
    return {
      ...coreSwingFields(swing),
      displayUntil: getDailySessionCloseTime(input.asOf),
    };
  }

  const currentSession = getDailySessionKey(input.asOf);
  if (getDailySessionKey(mitigatedAt) !== currentSession) {
    return null;
  }

  return {
    ...coreSwingFields(swing),
    mitigatedAt,
  };
}

export function computeHtfSwingPoints(
  input: ComputeHtfSwingPointsInput,
): HtfSwingPoint[] {
  const swings = stampFailureSwings(
    alignCrossTfSwingPrices(
      [
        ...detectSwingsOnTimeframe(input.bars4h, "4H", input.bars1h),
        ...detectSwingsOnTimeframe(input.bars1h, "1H", input.mitigationBars),
      ],
      input,
    ),
    input,
  );

  return swings
    .filter((swing) => isVisibleSwing(swing, input))
    .map((swing) => withMitigation(swing, input))
    .filter((swing): swing is HtfSwingPoint => swing !== null);
}
