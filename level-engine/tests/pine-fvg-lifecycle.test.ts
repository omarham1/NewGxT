import { describe, expect, it } from "vitest";
import type { Bar } from "../src/types.js";

/** Mirrors Pine indicator bar-by-bar FVG state machine. */
function simulatePineFvgLifecycle(
  bars: Bar[],
  pdh: number,
  pdl: number,
  options: { skipMitigationOnFormationBar: boolean },
): number {
  type Zone = { zoneLow: number; zoneHigh: number; formedAt: number };

  const active: Zone[] = [];

  const bodyHigh = (b: Bar) => Math.max(b.open, b.close);
  const bodyLow = (b: Bar) => Math.min(b.open, b.close);
  const overlapsPd = (low: number, high: number) =>
    high >= pdl && low <= pdh;
  const entersZone = (bar: Bar, low: number, high: number) =>
    bar.low <= high && bar.high >= low;

  for (let i = 2; i < bars.length; i++) {
    const first = bars[i - 2]!;
    const third = bars[i]!;
    const firstBodyHigh = bodyHigh(first);
    const firstBodyLow = bodyLow(first);
    const thirdBodyHigh = bodyHigh(third);
    const thirdBodyLow = bodyLow(third);

    const bullish = thirdBodyLow > firstBodyHigh;
    const bearish = thirdBodyHigh < firstBodyLow;
    if (!bullish && !bearish) {
      continue;
    }

    const zoneLow = bullish ? firstBodyHigh : thirdBodyHigh;
    const zoneHigh = bullish ? thirdBodyLow : firstBodyLow;
    const formedAt = third.time;

    if (overlapsPd(zoneLow, zoneHigh)) {
      const exists = active.some((z) => z.formedAt === formedAt);
      if (!exists) {
        active.push({ zoneLow, zoneHigh, formedAt });
      }
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

describe("Pine FVG lifecycle simulation", () => {
  const bullishGap = [
    bar(1, 100, 105, 98, 102),
    bar(2, 102, 110, 101, 108),
    bar(3, 108, 115, 106, 112),
  ];

  it("reproduces missing gaps when the formation bar immediately mitigates", () => {
    const surviving = simulatePineFvgLifecycle(bullishGap, 200, 50, {
      skipMitigationOnFormationBar: false,
    });

    expect(surviving).toBe(0);
  });

  it("keeps gaps visible when mitigation waits until after formation", () => {
    const surviving = simulatePineFvgLifecycle(bullishGap, 200, 50, {
      skipMitigationOnFormationBar: true,
    });

    expect(surviving).toBe(1);
  });
});
