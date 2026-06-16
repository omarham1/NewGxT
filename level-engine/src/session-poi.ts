import type { HtfFvg, HtfTimeframe } from "./htf-fvg.js";
import type { HtfSwingKind, HtfSwingPoint } from "./htf-swing.js";

export type SessionPoi =
  | { kind: "htf-fvg"; timeframe: HtfTimeframe; formedAt: number }
  | {
      kind: "htf-swing";
      timeframe: HtfTimeframe;
      formedAt: number;
      swingKind: HtfSwingKind;
    };

export type DailyBias = "directional" | "neutral";

export type SelectDirectionalSessionPoiInput = {
  asOf: number;
  sessionOpenTime: number;
  currentPrice: number;
  pdEquilibriumLow: number;
  pdEquilibriumHigh: number;
  htfFvgs: HtfFvg[];
  htfSwingPoints: HtfSwingPoint[];
};

function fvgOverlapsEquilibrium(
  fvg: HtfFvg,
  equilibriumLow: number,
  equilibriumHigh: number,
): boolean {
  return fvg.zoneLow <= equilibriumHigh && fvg.zoneHigh >= equilibriumLow;
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

  const equilibriumFvgs = input.htfFvgs.filter(
    (fvg) =>
      fvg.formedAt <= input.sessionOpenTime &&
      fvgOverlapsEquilibrium(
        fvg,
        input.pdEquilibriumLow,
        input.pdEquilibriumHigh,
      ),
  );

  if (equilibriumFvgs.length > 0) {
    const selected = pickBestFvg(equilibriumFvgs, input.currentPrice);
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
      swing.confirmedAt <= input.asOf,
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
