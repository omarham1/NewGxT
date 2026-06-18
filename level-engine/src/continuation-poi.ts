import type { Bar } from "./types.js";
import type { HtfFvg, HtfTimeframe } from "./htf-fvg.js";
import type { BiasDirection } from "./active-dol.js";

export type ContinuationPoi = {
  kind: "htf-fvg";
  timeframe: HtfTimeframe;
  formedAt: number;
};

export type ExpansionLeg = {
  origin: number;
  terminus: number;
  originFormedAt: number;
};

export type SelectContinuationPoiInput = {
  asOf: number;
  sessionOpenTime: number;
  currentPrice: number;
  biasDirection: BiasDirection;
  flippedAt: number;
  htfFvgs: HtfFvg[];
  bars1h: Bar[];
  mitigationBars: Bar[];
};

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

function opposingSwingKind(biasDirection: BiasDirection): "low" | "high" {
  return biasDirection === "bullish" ? "low" : "high";
}

function findOpposingSwingBeforeFlip(
  bars1h: Bar[],
  flippedAt: number,
  biasDirection: BiasDirection,
): { price: number; formedAt: number } | null {
  const kind = opposingSwingKind(biasDirection);
  let latest: { price: number; formedAt: number } | null = null;

  for (let i = 3; i < bars1h.length - 3; i++) {
    const pivot = bars1h[i]!;
    const confirmedAt = bars1h[i + 3]!.time;
    if (confirmedAt > flippedAt) {
      continue;
    }

    const isSwing =
      kind === "low"
        ? isStrictFractalLow(bars1h, i)
        : isStrictFractalHigh(bars1h, i);
    if (!isSwing) {
      continue;
    }

    const candidate = {
      price: kind === "low" ? pivot.low : pivot.high,
      formedAt: pivot.time,
    };
    if (latest === null || candidate.formedAt > latest.formedAt) {
      latest = candidate;
    }
  }

  return latest;
}

export function computeExpansionLeg(
  input: Pick<
    SelectContinuationPoiInput,
    "biasDirection" | "flippedAt" | "bars1h" | "asOf" | "sessionOpenTime"
  >,
): ExpansionLeg | null {
  const origin = findOpposingSwingBeforeFlip(
    input.bars1h,
    input.flippedAt,
    input.biasDirection,
  );
  if (origin === null) {
    return null;
  }

  const sessionBars = input.bars1h.filter(
    (bar) =>
      bar.time >= input.sessionOpenTime &&
      bar.time <= input.asOf &&
      bar.time >= origin.formedAt,
  );

  const terminus =
    input.biasDirection === "bullish"
      ? sessionBars.reduce((extreme, bar) => Math.max(extreme, bar.high), origin.price)
      : sessionBars.reduce((extreme, bar) => Math.min(extreme, bar.low), origin.price);

  return {
    origin: origin.price,
    terminus,
    originFormedAt: origin.formedAt,
  };
}

function expansionLegMidpoint(leg: ExpansionLeg): number {
  return (leg.origin + leg.terminus) / 2;
}

function fvgWithinUpperHalf(
  fvg: HtfFvg,
  leg: ExpansionLeg,
  biasDirection: BiasDirection,
): boolean {
  const midpoint = expansionLegMidpoint(leg);

  if (biasDirection === "bullish") {
    return fvg.zoneLow >= midpoint && fvg.zoneHigh <= leg.terminus;
  }

  return fvg.zoneHigh <= midpoint && fvg.zoneLow >= leg.terminus;
}

function timeframeRank(timeframe: HtfTimeframe): number {
  return timeframe === "4H" ? 2 : 1;
}

function fvgMidpoint(fvg: HtfFvg): number {
  return (fvg.zoneLow + fvg.zoneHigh) / 2;
}

function pickBestFvg(fvgs: HtfFvg[], currentPrice: number): HtfFvg {
  return fvgs.reduce((best, candidate) => {
    const bestRank = timeframeRank(best.timeframe);
    const candidateRank = timeframeRank(candidate.timeframe);
    if (candidateRank !== bestRank) {
      return candidateRank > bestRank ? candidate : best;
    }

    const bestDistance = Math.abs(currentPrice - fvgMidpoint(best));
    const candidateDistance = Math.abs(currentPrice - fvgMidpoint(candidate));
    return candidateDistance < bestDistance ? candidate : best;
  });
}

function sessionBarsThrough(
  bars: Bar[],
  sessionOpenTime: number,
  asOf: number,
): Bar[] {
  return bars.filter(
    (bar) => bar.time >= sessionOpenTime && bar.time <= asOf,
  );
}

function legInvalidated(
  leg: ExpansionLeg,
  biasDirection: BiasDirection,
  flippedAt: number,
  asOf: number,
  bars: Bar[],
): boolean {
  return findFirstInvalidationBar(leg, biasDirection, flippedAt, asOf, bars) !== undefined;
}

function closesPastLegMidpoint(
  bar: Bar,
  leg: ExpansionLeg,
  biasDirection: BiasDirection,
): boolean {
  const midpoint = expansionLegMidpoint(leg);
  return biasDirection === "bullish"
    ? bar.close < midpoint
    : bar.close > midpoint;
}

function findFirstInvalidationBar(
  leg: ExpansionLeg,
  biasDirection: BiasDirection,
  flippedAt: number,
  asOf: number,
  bars: Bar[],
): Bar | undefined {
  return bars
    .filter(
      (bar) =>
        bar.time > flippedAt &&
        bar.time <= asOf &&
        closesPastLegMidpoint(bar, leg, biasDirection),
    )
    .sort((left, right) => left.time - right.time)[0];
}

function sameFvg(left: HtfFvg, right: HtfFvg): boolean {
  return (
    left.timeframe === right.timeframe &&
    left.formedAt === right.formedAt &&
    left.zoneLow === right.zoneLow &&
    left.zoneHigh === right.zoneHigh
  );
}

export function selectContinuationPoi(
  input: SelectContinuationPoiInput,
): ContinuationPoi | null {
  const leg = computeExpansionLeg(input);
  if (leg === null) {
    return null;
  }

  const candidates = input.htfFvgs.filter(
    (fvg) =>
      fvg.formedAt >= input.sessionOpenTime &&
      fvg.formedAt <= input.asOf &&
      fvg.direction === input.biasDirection &&
      fvgWithinUpperHalf(fvg, leg, input.biasDirection),
  );

  if (candidates.length === 0) {
    return null;
  }

  const evaluationBars = sessionBarsThrough(
    [...input.bars1h, ...input.mitigationBars],
    input.sessionOpenTime,
    input.asOf,
  );
  const invalidated = legInvalidated(
    leg,
    input.biasDirection,
    input.flippedAt,
    input.asOf,
    evaluationBars,
  );

  let pool = candidates;
  if (invalidated) {
    const invalidationBar = findFirstInvalidationBar(
      leg,
      input.biasDirection,
      input.flippedAt,
      input.asOf,
      evaluationBars,
    )!;
    const barsBeforeInvalidation = evaluationBars.filter(
      (bar) => bar.time < invalidationBar.time,
    );
    const priceBeforeInvalidation =
      barsBeforeInvalidation.length > 0
        ? barsBeforeInvalidation[barsBeforeInvalidation.length - 1]!.close
        : input.currentPrice;
    const priorBest = pickBestFvg(candidates, priceBeforeInvalidation);
    pool = candidates.filter((candidate) => !sameFvg(candidate, priorBest));
    if (pool.length === 0) {
      return null;
    }
  }

  const selected = pickBestFvg(pool, input.currentPrice);
  return {
    kind: "htf-fvg",
    timeframe: selected.timeframe,
    formedAt: selected.formedAt,
  };
}
