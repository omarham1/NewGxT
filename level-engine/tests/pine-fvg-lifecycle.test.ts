import { describe, expect, it } from "vitest";
import { isWithinHtfFvgLookback } from "../src/session-calendar.js";
import type { Bar } from "../src/types.js";

const HOUR_MS = 60 * 60 * 1000;
const SUN_DEC_22_OPEN = 1734908400000;
const FRI_JAN_3_CLOSE = 1735927200000;
const SUN_JAN_5_OPEN = 1736118000000;
const MON_JAN_6_EVAL = 1736208000000;
const SUN_JAN_12_OPEN = 1736722800000;

/** Mirrors Pine indicator bar-by-bar FVG state machine. */
function simulatePineFvgLifecycle(
  bars: Bar[],
  options: { skipMitigationOnFormationBar: boolean },
  evalAt?: number,
): number {
  type Zone = { zoneLow: number; zoneHigh: number; formedAt: number };

  const active: Zone[] = [];

  const entersZone = (bar: Bar, low: number, high: number) =>
    bar.low <= high && bar.high >= low;

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

  for (let i = 2; i < bars.length; i++) {
    const first = bars[i - 2]!;
    const third = bars[i]!;

    const bullish = third.low > first.high;
    const bearish = third.high < first.low;
    if (!bullish && !bearish) {
      continue;
    }

    if (
      rangeFullyOverlappedByPair(
        bars[i - 1]!.low,
        bars[i - 1]!.high,
        first.low,
        first.high,
        third.low,
        third.high,
      )
    ) {
      continue;
    }

    const zoneLow = bullish ? first.high : third.high;
    const zoneHigh = bullish ? third.low : first.low;
    const formedAt = third.time;

    const exists = active.some((z) => z.formedAt === formedAt);
    if (!exists) {
      active.push({ zoneLow, zoneHigh, formedAt });
    }

    const bar = bars[i]!;
    for (let j = active.length - 1; j >= 0; j--) {
      const zone = active[j]!;
      const skipFormationBar =
        options.skipMitigationOnFormationBar && bar.time === zone.formedAt;
      if (!skipFormationBar && entersZone(bar, zone.zoneLow, zone.zoneHigh)) {
        active.splice(j, 1);
      }
    }

    pruneExpired(bar.time);
  }

  if (evalAt !== undefined) {
    pruneExpired(evalAt);
  }

  return active.length;
}

function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close };
}

function bullishGapAt(time: number): Bar[] {
  return [
    bar(time, 100, 105, 98, 102),
    bar(time + HOUR_MS, 102, 110, 101, 108),
    bar(time + 2 * HOUR_MS, 108, 115, 106, 112),
  ];
}

describe("Pine FVG lifecycle simulation", () => {
  const bullishGap = bullishGapAt(1);

  it("reproduces missing gaps when the formation bar immediately mitigates", () => {
    const surviving = simulatePineFvgLifecycle(bullishGap, {
      skipMitigationOnFormationBar: false,
    });

    expect(surviving).toBe(0);
  });

  it("keeps gaps visible when mitigation waits until after formation", () => {
    const surviving = simulatePineFvgLifecycle(bullishGap, {
      skipMitigationOnFormationBar: true,
    });

    expect(surviving).toBe(1);
  });

  it("rejects gaps when the middle candle range is fully inside the first candle", () => {
    const grindUp = [
      bar(1, 100, 105, 99, 102),
      bar(2, 102, 104, 101, 103),
      bar(3, 106, 108, 106, 107),
    ];

    const surviving = simulatePineFvgLifecycle(grindUp, {
      skipMitigationOnFormationBar: true,
    });

    expect(surviving).toBe(0);
  });

  it("prunes gaps older than two CME weeks even when unmitigated", () => {
    const surviving = simulatePineFvgLifecycle(
      bullishGapAt(SUN_DEC_22_OPEN),
      { skipMitigationOnFormationBar: true },
      MON_JAN_6_EVAL,
    );

    expect(surviving).toBe(0);
  });

  it("keeps prior-week gaps visible through the current CME week", () => {
    const surviving = simulatePineFvgLifecycle(
      bullishGapAt(FRI_JAN_3_CLOSE),
      { skipMitigationOnFormationBar: true },
      MON_JAN_6_EVAL,
    );

    expect(surviving).toBe(1);
  });

  it("drops prior-week gaps at the Sunday 18:00 ET week roll", () => {
    const surviving = simulatePineFvgLifecycle(
      bullishGapAt(FRI_JAN_3_CLOSE),
      { skipMitigationOnFormationBar: true },
      SUN_JAN_12_OPEN,
    );

    expect(surviving).toBe(0);
  });

  it("keeps current-week gaps visible as the immediately previous week after roll", () => {
    const surviving = simulatePineFvgLifecycle(
      bullishGapAt(SUN_JAN_5_OPEN),
      { skipMitigationOnFormationBar: true },
      SUN_JAN_12_OPEN,
    );

    expect(surviving).toBe(1);
  });
});
