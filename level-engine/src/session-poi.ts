import type { HtfFvg, HtfTimeframe } from "./htf-fvg.js";
import type { HtfSwingKind, HtfSwingPoint } from "./htf-swing.js";
import type { BiasDirection } from "./active-dol.js";

export type SessionPoi =
  | { kind: "htf-fvg"; timeframe: HtfTimeframe; formedAt: number }
  | {
      kind: "htf-swing";
      timeframe: HtfTimeframe;
      formedAt: number;
      swingKind: HtfSwingKind;
    }
  | { kind: "pdh"; sweptAt: number }
  | { kind: "pdl"; sweptAt: number };

export type DailyBias = "directional" | "neutral";

export type { BiasDirection } from "./active-dol.js";

export type SelectDirectionalSessionPoiInput = {
  asOf: number;
  sessionOpenTime: number;
  currentPrice: number;
  biasDirection: BiasDirection;
  pdMidpoint: number;
  htfFvgs: HtfFvg[];
  htfSwingPoints: HtfSwingPoint[];
};

function fvgOverlapsBiasedHalf(
  fvg: HtfFvg,
  pdMidpoint: number,
  biasDirection: BiasDirection,
): boolean {
  return biasDirection === "bullish"
    ? fvg.zoneHigh >= pdMidpoint
    : fvg.zoneLow <= pdMidpoint;
}

function swingInBiasedHalf(
  swing: HtfSwingPoint,
  pdMidpoint: number,
  biasDirection: BiasDirection,
): boolean {
  return biasDirection === "bullish"
    ? swing.price >= pdMidpoint
    : swing.price <= pdMidpoint;
}

function timeframeRank(timeframe: HtfTimeframe): number {
  return timeframe === "4H" ? 2 : 1;
}

function distanceToPrice(price: number, level: number): number {
  return Math.abs(price - level);
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

    const bestDistance = distanceToPrice(currentPrice, fvgMidpoint(best));
    const candidateDistance = distanceToPrice(
      currentPrice,
      fvgMidpoint(candidate),
    );
    return candidateDistance < bestDistance ? candidate : best;
  });
}

function pickBestSwing(
  swings: HtfSwingPoint[],
  currentPrice: number,
): HtfSwingPoint {
  return swings.reduce((best, candidate) => {
    const bestRank = timeframeRank(best.timeframe);
    const candidateRank = timeframeRank(candidate.timeframe);
    if (candidateRank !== bestRank) {
      return candidateRank > bestRank ? candidate : best;
    }

    const bestDistance = distanceToPrice(currentPrice, best.price);
    const candidateDistance = distanceToPrice(currentPrice, candidate.price);
    return candidateDistance < bestDistance ? candidate : best;
  });
}

export function selectDirectionalSessionPoi(
  input: SelectDirectionalSessionPoiInput,
): SessionPoi | null {
  if (input.asOf < input.sessionOpenTime) {
    return null;
  }

  const biasedHalfFvgs = input.htfFvgs.filter(
    (fvg) =>
      fvg.formedAt <= input.sessionOpenTime &&
      fvgOverlapsBiasedHalf(fvg, input.pdMidpoint, input.biasDirection),
  );

  if (biasedHalfFvgs.length > 0) {
    const selected = pickBestFvg(biasedHalfFvgs, input.currentPrice);
    return {
      kind: "htf-fvg",
      timeframe: selected.timeframe,
      formedAt: selected.formedAt,
    };
  }

  const deferSwings = input.htfSwingPoints.filter(
    (swing) =>
      swing.mitigatedAt === undefined &&
      swing.confirmedAt >= input.sessionOpenTime &&
      swing.confirmedAt <= input.asOf &&
      swingInBiasedHalf(swing, input.pdMidpoint, input.biasDirection),
  );

  if (deferSwings.length > 0) {
    const selected = pickBestSwing(deferSwings, input.currentPrice);
    return {
      kind: "htf-swing",
      timeframe: selected.timeframe,
      formedAt: selected.formedAt,
      swingKind: selected.kind,
    };
  }

  return null;
}

export type SelectNeutralSessionPoiInput = {
  asOf: number;
  sessionOpenTime: number;
  pdhMitigatedAt?: number;
  pdlMitigatedAt?: number;
};

export function selectNeutralSessionPoi(
  input: SelectNeutralSessionPoiInput,
): SessionPoi | null {
  if (input.asOf < input.sessionOpenTime) {
    return null;
  }

  const pdhSwept =
    input.pdhMitigatedAt !== undefined &&
    input.pdhMitigatedAt >= input.sessionOpenTime &&
    input.pdhMitigatedAt <= input.asOf;
  const pdlSwept =
    input.pdlMitigatedAt !== undefined &&
    input.pdlMitigatedAt >= input.sessionOpenTime &&
    input.pdlMitigatedAt <= input.asOf;

  if (pdhSwept && pdlSwept) {
    return input.pdhMitigatedAt! <= input.pdlMitigatedAt!
      ? { kind: "pdh", sweptAt: input.pdhMitigatedAt! }
      : { kind: "pdl", sweptAt: input.pdlMitigatedAt! };
  }

  if (pdhSwept) {
    return { kind: "pdh", sweptAt: input.pdhMitigatedAt! };
  }

  if (pdlSwept) {
    return { kind: "pdl", sweptAt: input.pdlMitigatedAt! };
  }

  return null;
}

export type SelectSessionPoiInput = {
  dailyBias: DailyBias;
  asOf: number;
  sessionOpenTime: number;
  currentPrice: number;
  biasDirection: BiasDirection;
  pdMidpoint: number;
  pdhMitigatedAt?: number;
  pdlMitigatedAt?: number;
  htfFvgs: HtfFvg[];
  htfSwingPoints: HtfSwingPoint[];
};

export function selectSessionPoi(
  input: SelectSessionPoiInput,
): SessionPoi | null {
  if (input.dailyBias === "neutral") {
    return selectNeutralSessionPoi({
      asOf: input.asOf,
      sessionOpenTime: input.sessionOpenTime,
      pdhMitigatedAt: input.pdhMitigatedAt,
      pdlMitigatedAt: input.pdlMitigatedAt,
    });
  }

  return selectDirectionalSessionPoi({
    asOf: input.asOf,
    sessionOpenTime: input.sessionOpenTime,
    currentPrice: input.currentPrice,
    biasDirection: input.biasDirection,
    pdMidpoint: input.pdMidpoint,
    htfFvgs: input.htfFvgs,
    htfSwingPoints: input.htfSwingPoints,
  });
}
