import type { Bar } from "./types.js";
import type { BiasDirection } from "./active-dol.js";

export type DetectBiasFlipInput = {
  sessionOpenTime: number;
  asOf: number;
  initialBiasDirection: BiasDirection;
  pdMidpoint: number;
  bars4h: Bar[];
  bars1h: Bar[];
};

export type BiasFlipResult = {
  effectiveBiasDirection: BiasDirection;
  flippedAt?: number;
};

function closesThroughAgainstBias(
  bar: Bar,
  pdMidpoint: number,
  biasDirection: BiasDirection,
): boolean {
  return biasDirection === "bearish"
    ? bar.close > pdMidpoint
    : bar.close < pdMidpoint;
}

function sessionHtfBars(
  bars: Bar[],
  sessionOpenTime: number,
  asOf: number,
): Bar[] {
  return bars.filter(
    (bar) => bar.time >= sessionOpenTime && bar.time <= asOf,
  );
}

export function detectBiasFlip(input: DetectBiasFlipInput): BiasFlipResult {
  const candidates = [
    ...sessionHtfBars(input.bars4h, input.sessionOpenTime, input.asOf),
    ...sessionHtfBars(input.bars1h, input.sessionOpenTime, input.asOf),
  ].sort((left, right) => left.time - right.time);

  for (const bar of candidates) {
    if (
      closesThroughAgainstBias(bar, input.pdMidpoint, input.initialBiasDirection)
    ) {
      return {
        effectiveBiasDirection:
          input.initialBiasDirection === "bearish" ? "bullish" : "bearish",
        flippedAt: bar.time,
      };
    }
  }

  return { effectiveBiasDirection: input.initialBiasDirection };
}
