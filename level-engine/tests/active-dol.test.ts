import { describe, expect, it } from "vitest";
import { resolveActiveDol } from "../src/active-dol.js";
import type { HtfFvg } from "../src/htf-fvg.js";
import type { HtfSwingPoint } from "../src/htf-swing.js";

const SUN_JAN_5_OPEN = 1736118000000;
const HOUR_MS = 60 * 60 * 1000;

function baseInput(overrides: Partial<Parameters<typeof resolveActiveDol>[0]> = {}) {
  return {
    biasDirection: "bullish" as const,
    currentPrice: 5065,
    openPlusAdr: 5155,
    openMinusAdr: 4955,
    pdh: 5100,
    pdl: 5000,
    pwh: 5200,
    pwl: 4700,
    htfFvgs: [] as HtfFvg[],
    htfSwingPoints: [] as HtfSwingPoint[],
    ...overrides,
  };
}

describe("Active DOL", () => {
  it("selects PDH as TP1 when it is the nearest unmitigated level above price on a bullish bias", () => {
    const activeDol = resolveActiveDol(baseInput());

    expect(activeDol.tp1).toEqual({ kind: "pdh" });
  });

  it("selects the nearest HTF swing high as TP1 when it is closer than PDH", () => {
    const activeDol = resolveActiveDol(
      baseInput({
        currentPrice: 5065,
        htfSwingPoints: [
          {
            timeframe: "4H",
            kind: "high",
            price: 5080,
            formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
            confirmedAt: SUN_JAN_5_OPEN + 6 * HOUR_MS,
          },
        ],
      }),
    );

    expect(activeDol.tp1).toEqual({
      kind: "htf-swing",
      timeframe: "4H",
      formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
      swingKind: "high",
    });
  });

  it("selects PWH as TP2 when it is the furthest bullish target within the ADR band", () => {
    const activeDol = resolveActiveDol(
      baseInput({
        openPlusAdr: 5210,
      }),
    );

    expect(activeDol.tp1).toEqual({ kind: "pdh" });
    expect(activeDol.tp2).toEqual({ kind: "pwh" });
  });

  it("excludes levels beyond the ADR band from TP2 while still allowing them as TP1", () => {
    const activeDol = resolveActiveDol(
      baseInput({
        currentPrice: 5050,
        openPlusAdr: 5090,
        htfSwingPoints: [
          {
            timeframe: "4H",
            kind: "high",
            price: 5080,
            formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
            confirmedAt: SUN_JAN_5_OPEN + 6 * HOUR_MS,
          },
        ],
      }),
    );

    expect(activeDol.tp1).toEqual({ kind: "htf-swing", timeframe: "4H", formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS, swingKind: "high" });
    expect(activeDol.tp2).toEqual({ kind: "htf-swing", timeframe: "4H", formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS, swingKind: "high" });
  });

  it("selects PDL as TP1 when it is the nearest unmitigated level below price on a bearish bias", () => {
    const activeDol = resolveActiveDol(
      baseInput({
        biasDirection: "bearish",
        currentPrice: 5065,
      }),
    );

    expect(activeDol.tp1).toEqual({ kind: "pdl" });
  });

  it("excludes mitigated rails from Active DOL targets", () => {
    const activeDol = resolveActiveDol(
      baseInput({
        pdhMitigatedAt: SUN_JAN_5_OPEN,
        openPlusAdr: 5210,
        htfSwingPoints: [
          {
            timeframe: "4H",
            kind: "high",
            price: 5120,
            formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
            confirmedAt: SUN_JAN_5_OPEN + 6 * HOUR_MS,
          },
        ],
      }),
    );

    expect(activeDol.tp1).toEqual({
      kind: "htf-swing",
      timeframe: "4H",
      formedAt: SUN_JAN_5_OPEN + 3 * HOUR_MS,
      swingKind: "high",
    });
    expect(activeDol.tp2).toEqual({ kind: "pwh" });
  });

  it("uses the HTF FVG top as a bullish TP1 when it is nearer than PDH", () => {
    const formedAt = SUN_JAN_5_OPEN + 2 * HOUR_MS;
    const activeDol = resolveActiveDol(
      baseInput({
        currentPrice: 5065,
        htfFvgs: [
          {
            timeframe: "4H",
            direction: "bullish",
            zoneLow: 5070,
            zoneHigh: 5075,
            formedAt,
          },
        ],
      }),
    );

    expect(activeDol.tp1).toEqual({
      kind: "htf-fvg",
      timeframe: "4H",
      formedAt,
    });
  });
});
