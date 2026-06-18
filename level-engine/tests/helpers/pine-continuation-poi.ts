import { detectBiasFlip } from "../../src/bias-flip.js";
import type { BiasDirection } from "../../src/active-dol.js";
import { computeHtfFvgs } from "../../src/htf-fvg.js";
import type { HtfFvg, HtfTimeframe } from "../../src/htf-fvg.js";
import type { Bar } from "../../src/types.js";

export type PinePoiTarget = {
  kind: "fvg";
  formedTime: number;
  txt: string;
} | null;

export type PineContinuationEval = {
  sessionPoi: PinePoiTarget;
  continuationPoi: PinePoiTarget;
  effectiveBiasDirection: BiasDirection;
  biasFlipped: boolean;
};

type HtfFvgZone = {
  zoneLow: number;
  zoneHigh: number;
  formedTime: number;
  txt: string;
  bullish: boolean;
  mitigated: boolean;
};

type HtfSwingLevel = {
  price: number;
  formedTime: number;
  confirmedTime: number;
  txt: string;
  mitigated: boolean;
  isFailureSwing: boolean;
};

type ExpansionLeg = {
  origin: number;
  terminus: number;
  originFormedAt: number;
};

function timeframeRank(txt: string): number {
  return txt.includes("4H") ? 2 : 1;
}

function fvgMidpoint(zone: HtfFvgZone): number {
  return (zone.zoneLow + zone.zoneHigh) / 2;
}

function toZone(fvg: HtfFvg): HtfFvgZone {
  return {
    zoneLow: fvg.zoneLow,
    zoneHigh: fvg.zoneHigh,
    formedTime: fvg.formedAt,
    txt: fvg.timeframe === "4H" ? "4H FVG" : "1H FVG",
    bullish: fvg.direction === "bullish",
    mitigated: false,
  };
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

function findOpposingSwingBeforeFlip(
  bars1h: Bar[],
  flippedAt: number,
  bullish: boolean,
): HtfSwingLevel | null {
  const wantTxt = bullish ? "1H Swing Low" : "1H Swing High";
  let latest: HtfSwingLevel | null = null;

  for (let i = 3; i < bars1h.length - 3; i++) {
    const pivot = bars1h[i]!;
    const confirmedTime = bars1h[i + 3]!.time;
    if (confirmedTime > flippedAt) {
      continue;
    }

    const isSwing = bullish
      ? isStrictFractalLow(bars1h, i)
      : isStrictFractalHigh(bars1h, i);
    if (!isSwing) {
      continue;
    }

    const candidate: HtfSwingLevel = {
      price: bullish ? pivot.low : pivot.high,
      formedTime: pivot.time,
      confirmedTime,
      txt: wantTxt,
      mitigated: false,
      isFailureSwing: false,
    };
    if (latest === null || candidate.formedTime > latest.formedTime) {
      latest = candidate;
    }
  }

  return latest;
}

function computeExpansionLeg(
  bars1h: Bar[],
  sessionOpenTime: number,
  asOf: number,
  flippedAt: number,
  bullish: boolean,
): ExpansionLeg | null {
  const origin = findOpposingSwingBeforeFlip(bars1h, flippedAt, bullish);
  if (origin === null) {
    return null;
  }

  const sessionBars = bars1h.filter(
    (bar) =>
      bar.time >= sessionOpenTime &&
      bar.time <= asOf &&
      bar.time >= origin.formedTime,
  );

  const terminus = bullish
    ? sessionBars.reduce((extreme, bar) => Math.max(extreme, bar.high), origin.price)
    : sessionBars.reduce((extreme, bar) => Math.min(extreme, bar.low), origin.price);

  return {
    origin: origin.price,
    terminus,
    originFormedAt: origin.formedTime,
  };
}

function expansionLegMidpoint(leg: ExpansionLeg): number {
  return (leg.origin + leg.terminus) / 2;
}

function fvgWithinUpperHalf(
  zone: HtfFvgZone,
  leg: ExpansionLeg,
  bullish: boolean,
): boolean {
  const midpoint = expansionLegMidpoint(leg);
  return bullish
    ? zone.zoneLow >= midpoint && zone.zoneHigh <= leg.terminus
    : zone.zoneHigh <= midpoint && zone.zoneLow >= leg.terminus;
}

function pickBestFvg(zones: HtfFvgZone[], currentPrice: number): HtfFvgZone {
  return zones.reduce((best, candidate) => {
    const bestRank = timeframeRank(best.txt);
    const candidateRank = timeframeRank(candidate.txt);
    if (candidateRank !== bestRank) {
      return candidateRank > bestRank ? candidate : best;
    }

    const bestDistance = Math.abs(currentPrice - fvgMidpoint(best));
    const candidateDistance = Math.abs(currentPrice - fvgMidpoint(candidate));
    return candidateDistance < bestDistance ? candidate : best;
  });
}

function sameZone(left: HtfFvgZone, right: HtfFvgZone): boolean {
  return (
    left.formedTime === right.formedTime &&
    left.txt === right.txt &&
    left.zoneLow === right.zoneLow &&
    left.zoneHigh === right.zoneHigh
  );
}

function closesPastLegMidpoint(
  bar: Bar,
  leg: ExpansionLeg,
  bullish: boolean,
): boolean {
  const midpoint = expansionLegMidpoint(leg);
  return bullish ? bar.close < midpoint : bar.close > midpoint;
}

function findFirstInvalidationBar(
  leg: ExpansionLeg,
  bullish: boolean,
  flippedAt: number,
  asOf: number,
  bars: Bar[],
): Bar | undefined {
  return bars
    .filter(
      (bar) =>
        bar.time > flippedAt &&
        bar.time <= asOf &&
        closesPastLegMidpoint(bar, leg, bullish),
    )
    .sort((left, right) => left.time - right.time)[0];
}

function selectContinuationFvgPoi(
  zones: HtfFvgZone[],
  bars1h: Bar[],
  mitigationBars: Bar[],
  sessionOpenTime: number,
  asOf: number,
  currentPrice: number,
  flippedAt: number,
  bullish: boolean,
): PinePoiTarget {
  const leg = computeExpansionLeg(
    bars1h,
    sessionOpenTime,
    asOf,
    flippedAt,
    bullish,
  );
  if (leg === null) {
    return null;
  }

  const candidates = zones.filter(
    (zone) =>
      !zone.mitigated &&
      zone.formedTime >= sessionOpenTime &&
      zone.formedTime <= asOf &&
      zone.bullish === bullish &&
      fvgWithinUpperHalf(zone, leg, bullish),
  );

  if (candidates.length === 0) {
    return null;
  }

  const evaluationBars = [...bars1h, ...mitigationBars].filter(
    (bar) => bar.time >= sessionOpenTime && bar.time <= asOf,
  );
  const invalidationBar = findFirstInvalidationBar(
    leg,
    bullish,
    flippedAt,
    asOf,
    evaluationBars,
  );

  let pool = candidates;
  if (invalidationBar !== undefined) {
    const barsBeforeInvalidation = evaluationBars.filter(
      (bar) => bar.time < invalidationBar.time,
    );
    const priceBeforeInvalidation =
      barsBeforeInvalidation.length > 0
        ? barsBeforeInvalidation[barsBeforeInvalidation.length - 1]!.close
        : currentPrice;
    const priorBest = pickBestFvg(candidates, priceBeforeInvalidation);
    pool = candidates.filter((candidate) => !sameZone(candidate, priorBest));
    if (pool.length === 0) {
      return null;
    }
  }

  const selected = pickBestFvg(pool, currentPrice);
  return {
    kind: "fvg",
    formedTime: selected.formedTime,
    txt: selected.txt,
  };
}

function toEngineContinuationPoi(
  target: PinePoiTarget,
): { kind: "htf-fvg"; timeframe: HtfTimeframe; formedAt: number } | null {
  if (target === null) {
    return null;
  }
  return {
    kind: "htf-fvg",
    timeframe: target.txt.includes("4H") ? "4H" : "1H",
    formedAt: target.formedTime,
  };
}

function latestBarClose(bars: Bar[]): number {
  const latest = bars.reduce(
    (best, bar) => (bar.time > best.time ? bar : best),
    bars[0]!,
  );
  return latest.close;
}

/** Mirrors Pine indicator continuation POI state at a single evaluation time. */
export function simulatePineContinuationAtEval(input: {
  bars: Bar[];
  bars4h: Bar[];
  bars1h: Bar[];
  mitigationBars: Bar[];
  asOf: number;
  sessionOpenTime: number;
  pdMidpoint: number;
  initialBiasDirection: BiasDirection;
}): PineContinuationEval & {
  continuationPoiEngine: ReturnType<typeof toEngineContinuationPoi>;
} {
  const biasFlip = detectBiasFlip({
    sessionOpenTime: input.sessionOpenTime,
    asOf: input.asOf,
    initialBiasDirection: input.initialBiasDirection,
    pdMidpoint: input.pdMidpoint,
    bars4h: input.bars4h,
    bars1h: input.bars1h,
  });

  const biasFlipped = biasFlip.flippedAt !== undefined;
  const effectiveBiasDirection = biasFlip.effectiveBiasDirection;
  const bullish = effectiveBiasDirection === "bullish";
  const currentPrice = latestBarClose(input.bars);

  const htfFvgs = computeHtfFvgs({
    bars4h: input.bars4h,
    bars1h: input.bars1h,
    mitigationBars: input.mitigationBars,
    asOf: input.asOf,
  });
  const zones = htfFvgs.map(toZone);

  const continuationPoi =
    biasFlipped && biasFlip.flippedAt !== undefined
      ? selectContinuationFvgPoi(
          zones,
          input.bars1h,
          input.mitigationBars,
          input.sessionOpenTime,
          input.asOf,
          currentPrice,
          biasFlip.flippedAt,
          bullish,
        )
      : null;

  return {
    sessionPoi: biasFlipped ? null : null,
    continuationPoi,
    effectiveBiasDirection,
    biasFlipped,
    continuationPoiEngine: toEngineContinuationPoi(continuationPoi),
  };
}
