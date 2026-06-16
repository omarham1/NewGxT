import type { HtfFvg, HtfTimeframe } from "./htf-fvg.js";
import type { HtfSwingKind, HtfSwingPoint } from "./htf-swing.js";

export type BiasDirection = "bullish" | "bearish";

export type ActiveDolTarget =
  | { kind: "daily-open" }
  | { kind: "pdh" }
  | { kind: "pdl" }
  | { kind: "pwh" }
  | { kind: "pwl" }
  | { kind: "htf-fvg"; timeframe: HtfTimeframe; formedAt: number }
  | {
      kind: "htf-swing";
      timeframe: HtfTimeframe;
      formedAt: number;
      swingKind: HtfSwingKind;
    };

export type ActiveDol = {
  tp1: ActiveDolTarget | null;
  tp2: ActiveDolTarget | null;
};

export type ResolveActiveDolInput = {
  biasDirection: BiasDirection;
  currentPrice: number;
  dailyOpen: number;
  adrConsumptionPct: number;
  reversalDayTp1?: boolean;
  openPlusAdr: number;
  openMinusAdr: number;
  pdh: number;
  pdl: number;
  pwh: number;
  pwl: number;
  pdhMitigatedAt?: number;
  pdlMitigatedAt?: number;
  pwhMitigatedAt?: number;
  pwlMitigatedAt?: number;
  htfFvgs: HtfFvg[];
  htfSwingPoints: HtfSwingPoint[];
};

type DolCandidate = {
  target: ActiveDolTarget;
  price: number;
  tier: number;
};

function distanceFromPrice(currentPrice: number, levelPrice: number): number {
  return Math.abs(levelPrice - currentPrice);
}

function isInBiasDirection(
  biasDirection: BiasDirection,
  currentPrice: number,
  levelPrice: number,
): boolean {
  return biasDirection === "bullish"
    ? levelPrice > currentPrice
    : levelPrice < currentPrice;
}

function isWithinAdrBand(
  biasDirection: BiasDirection,
  levelPrice: number,
  openPlusAdr: number,
  openMinusAdr: number,
): boolean {
  return biasDirection === "bullish"
    ? levelPrice <= openPlusAdr
    : levelPrice >= openMinusAdr;
}

function collectCandidates(input: ResolveActiveDolInput): DolCandidate[] {
  const candidates: DolCandidate[] = [];

  if (
    input.pdhMitigatedAt === undefined &&
    isInBiasDirection(input.biasDirection, input.currentPrice, input.pdh)
  ) {
    candidates.push({ target: { kind: "pdh" }, price: input.pdh, tier: 2 });
  }

  if (
    input.pdlMitigatedAt === undefined &&
    isInBiasDirection(input.biasDirection, input.currentPrice, input.pdl)
  ) {
    candidates.push({ target: { kind: "pdl" }, price: input.pdl, tier: 2 });
  }

  if (
    input.pwhMitigatedAt === undefined &&
    isInBiasDirection(input.biasDirection, input.currentPrice, input.pwh)
  ) {
    candidates.push({ target: { kind: "pwh" }, price: input.pwh, tier: 3 });
  }

  if (
    input.pwlMitigatedAt === undefined &&
    isInBiasDirection(input.biasDirection, input.currentPrice, input.pwl)
  ) {
    candidates.push({ target: { kind: "pwl" }, price: input.pwl, tier: 3 });
  }

  for (const fvg of input.htfFvgs) {
    const price =
      input.biasDirection === "bullish" ? fvg.zoneHigh : fvg.zoneLow;
    if (isInBiasDirection(input.biasDirection, input.currentPrice, price)) {
      candidates.push({
        target: { kind: "htf-fvg", timeframe: fvg.timeframe, formedAt: fvg.formedAt },
        price,
        tier: 1,
      });
    }
  }

  for (const swing of input.htfSwingPoints) {
    if (swing.mitigatedAt !== undefined) {
      continue;
    }

    const bullishSwing = swing.kind === "high";
    const bearishSwing = swing.kind === "low";
    if (
      (input.biasDirection === "bullish" && !bullishSwing) ||
      (input.biasDirection === "bearish" && !bearishSwing)
    ) {
      continue;
    }

    if (isInBiasDirection(input.biasDirection, input.currentPrice, swing.price)) {
      candidates.push({
        target: {
          kind: "htf-swing",
          timeframe: swing.timeframe,
          formedAt: swing.formedAt,
          swingKind: swing.kind,
        },
        price: swing.price,
        tier: 1,
      });
    }
  }

  return candidates;
}

function pickNearest(candidates: DolCandidate[], currentPrice: number): ActiveDolTarget | null {
  if (candidates.length === 0) {
    return null;
  }

  const nearest = candidates.reduce((best, candidate) => {
    const bestDistance = distanceFromPrice(currentPrice, best.price);
    const candidateDistance = distanceFromPrice(currentPrice, candidate.price);
    return candidateDistance < bestDistance ? candidate : best;
  });

  return nearest.target;
}

function pickFurthestWithinAdr(
  candidates: DolCandidate[],
  input: ResolveActiveDolInput,
): ActiveDolTarget | null {
  const withinAdr = candidates.filter((candidate) =>
    isWithinAdrBand(
      input.biasDirection,
      candidate.price,
      input.openPlusAdr,
      input.openMinusAdr,
    ),
  );

  if (withinAdr.length === 0) {
    return null;
  }

  const furthest = withinAdr.reduce((best, candidate) => {
    const bestDistance = distanceFromPrice(input.currentPrice, best.price);
    const candidateDistance = distanceFromPrice(input.currentPrice, candidate.price);
    if (candidateDistance !== bestDistance) {
      return candidateDistance > bestDistance ? candidate : best;
    }

    return candidate.tier > best.tier ? candidate : best;
  });

  return furthest.target;
}

const REVERSAL_DAY_ADR_CONSUMPTION_THRESHOLD_PCT = 80;

function shouldUseDailyOpenTp1(input: ResolveActiveDolInput): boolean {
  if (!input.reversalDayTp1) {
    return false;
  }

  if (input.adrConsumptionPct < REVERSAL_DAY_ADR_CONSUMPTION_THRESHOLD_PCT) {
    return false;
  }

  return isInBiasDirection(input.biasDirection, input.currentPrice, input.dailyOpen);
}

export function resolveActiveDol(input: ResolveActiveDolInput): ActiveDol {
  const candidates = collectCandidates(input);

  const nearestTp1 = pickNearest(candidates, input.currentPrice);
  const tp1 = shouldUseDailyOpenTp1(input)
    ? { kind: "daily-open" as const }
    : nearestTp1;

  return {
    tp1,
    tp2: pickFurthestWithinAdr(candidates, input),
  };
}
