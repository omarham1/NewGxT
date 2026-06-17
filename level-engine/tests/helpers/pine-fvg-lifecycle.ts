import {
  getDailySessionKey,
  isWithinHtfFvgLookback,
} from "../../src/session-calendar.js";
import type { Bar } from "../../src/types.js";

type Zone = {
  zoneLow: number;
  zoneHigh: number;
  formedAt: number;
  bullish: boolean;
};

function barClosedThroughFvgExtreme(
  bar: Bar,
  zone: Zone,
): boolean {
  return zone.bullish
    ? bar.close < zone.zoneLow
    : bar.close > zone.zoneHigh;
}

/** Mirrors Pine indicator bar-by-bar FVG state machine. */
export function simulatePineFvgLifecycle(
  bars: Bar[],
  options: {
    isBarConfirmed?: (barIndex: number) => boolean;
  } = {},
  evalAt?: number,
): number {
  const active: Zone[] = [];

  const rangeFullyOverlappedByPair = (
    innerLow: number,
    innerHigh: number,
    aLow: number,
    aHigh: number,
    bLow: number,
    bHigh: number,
  ): boolean => {
    const inFirst = innerLow >= aLow && innerHigh <= aHigh;
    const inThird = innerLow >= bLow && innerHigh <= bHigh;
    const spansFirstThenThird =
      innerLow >= aLow &&
      aHigh >= innerLow &&
      innerHigh <= bHigh &&
      bLow <= aHigh;
    const spansThirdThenFirst =
      innerLow >= bLow &&
      bHigh >= innerLow &&
      innerHigh <= aHigh &&
      aLow <= bHigh;
    return inFirst || inThird || spansFirstThenThird || spansThirdThenFirst;
  };

  const pruneExpired = (asOf: number) => {
    for (let j = active.length - 1; j >= 0; j--) {
      if (!isWithinHtfFvgLookback(active[j]!.formedAt, asOf)) {
        active.splice(j, 1);
      }
    }
  };

  const removeMitigated = (bar: Bar) => {
    for (let j = active.length - 1; j >= 0; j--) {
      const zone = active[j]!;
      if (
        bar.time > zone.formedAt &&
        barClosedThroughFvgExtreme(bar, zone)
      ) {
        active.splice(j, 1);
      }
    }
  };

  const isBarConfirmed = options.isBarConfirmed ?? (() => true);

  for (let i = 2; i < bars.length; i++) {
    const first = bars[i - 2]!;
    const third = bars[i]!;
    const bar = bars[i]!;

    const bullish = third.low > first.high;
    const bearish = third.high < first.low;

    if (bullish || bearish) {
      const middleOverlapped = rangeFullyOverlappedByPair(
        bars[i - 1]!.low,
        bars[i - 1]!.high,
        first.low,
        first.high,
        third.low,
        third.high,
      );

      if (!middleOverlapped) {
        const zoneLow = bullish ? first.high : third.high;
        const zoneHigh = bullish ? third.low : first.low;
        const formedAt = third.time;

        const exists = active.some((z) => z.formedAt === formedAt);
        if (!exists && isBarConfirmed(i)) {
          active.push({ zoneLow, zoneHigh, formedAt, bullish });
        }
      }
    }

    removeMitigated(bar);
    pruneExpired(bar.time);
  }

  const asOf = evalAt ?? bars[bars.length - 1]!.time;
  if (evalAt !== undefined) {
    pruneExpired(evalAt);
  }

  return active.length;
}
