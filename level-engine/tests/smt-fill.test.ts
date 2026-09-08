import { describe, expect, it } from "vitest";
import { evaluateSmtFill } from "../src/smt-fill.js";
import type { Bar } from "../src/types.js";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const C3_OPEN = 1_700_000_000_000;
const C3_CLOSE = C3_OPEN + HOUR_MS;

function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close };
}

function bullishReference(overrides: Partial<{
  timeframe: "15m" | "30m" | "90m" | "1H" | "4H";
  zoneLow: number;
  zoneHigh: number;
  formedAt: number;
  fvgC3CloseAt: number;
}> = {}) {
  return {
    timeframe: overrides.timeframe ?? ("1H" as const),
    direction: "bullish" as const,
    zoneLow: overrides.zoneLow ?? 100,
    zoneHigh: overrides.zoneHigh ?? 105,
    formedAt: overrides.formedAt ?? C3_OPEN,
    fvgC3CloseAt: overrides.fvgC3CloseAt ?? C3_CLOSE,
  };
}

function idleTriad() {
  return {
    ES: {
      c3: { high: 110, low: 100 },
      bars1m: [bar(C3_CLOSE + MINUTE_MS, 102, 104, 101, 103)],
    },
    NQ: {
      c3: { high: 210, low: 200 },
      bars1m: [bar(C3_CLOSE + MINUTE_MS, 202, 204, 201, 203)],
    },
    YM: {
      c3: { high: 310, low: 300 },
      bars1m: [bar(C3_CLOSE + MINUTE_MS, 302, 304, 301, 303)],
    },
  };
}

describe("SMT Fill evaluator", () => {
  it("stays Idle when no triad symbol has FVG Entry after C3 close", () => {
    const result = evaluateSmtFill({
      reference: bullishReference(),
      chartSymbol: "NQ",
      triad: idleTriad(),
    });

    expect(result).toEqual({
      state: "Idle",
      entries: { ES: false, NQ: false, YM: false },
    });
  });

  it("counts bullish FVG Entry as inclusive 1m wick to that symbol's C3 low after close", () => {
    const triad = idleTriad();
    triad.ES.bars1m = [bar(C3_CLOSE + MINUTE_MS, 101, 102, 100, 101)];

    const result = evaluateSmtFill({
      reference: bullishReference(),
      chartSymbol: "NQ",
      triad,
    });

    expect(result).toEqual({
      state: "Active",
      entries: { ES: true, NQ: false, YM: false },
    });
  });

  it("does not count 1m bars at or before FVG C3 close", () => {
    const triad = idleTriad();
    triad.ES.bars1m = [
      bar(C3_CLOSE, 101, 102, 100, 101),
      bar(C3_CLOSE - MINUTE_MS, 101, 102, 100, 101),
    ];

    const result = evaluateSmtFill({
      reference: bullishReference(),
      chartSymbol: "ES",
      triad,
    });

    expect(result.state).toBe("Idle");
    expect(result.entries.ES).toBe(false);
  });

  it("does not count interior-only or opposite-extreme wicks", () => {
    const triad = idleTriad();
    // Bullish C3 low is 100; wick into zone but never tags 100
    triad.ES.bars1m = [bar(C3_CLOSE + MINUTE_MS, 103, 104, 101, 102)];
    // Touches C3 high (110) only — opposite extreme
    triad.NQ.bars1m = [bar(C3_CLOSE + MINUTE_MS, 208, 210, 209, 209)];

    const result = evaluateSmtFill({
      reference: bullishReference(),
      chartSymbol: "NQ",
      triad,
    });

    expect(result).toEqual({
      state: "Idle",
      entries: { ES: false, NQ: false, YM: false },
    });
  });

  it("uses C3 high for bearish reference FVG Entry on every symbol", () => {
    const triad = idleTriad();
    triad.YM.bars1m = [bar(C3_CLOSE + MINUTE_MS, 308, 310, 309, 309)];

    const result = evaluateSmtFill({
      reference: {
        ...bullishReference(),
        direction: "bearish",
        zoneLow: 95,
        zoneHigh: 100,
      },
      chartSymbol: "ES",
      triad,
    });

    expect(result).toEqual({
      state: "Active",
      entries: { ES: false, NQ: false, YM: true },
    });
  });

  it("becomes Dead with deadAt when the third distinct symbol enters", () => {
    const t1 = C3_CLOSE + MINUTE_MS;
    const t2 = C3_CLOSE + 2 * MINUTE_MS;
    const t3 = C3_CLOSE + 3 * MINUTE_MS;
    const triad = idleTriad();
    triad.ES.bars1m = [bar(t1, 101, 102, 100, 101)];
    triad.NQ.bars1m = [bar(t2, 201, 202, 200, 201)];
    triad.YM.bars1m = [bar(t3, 301, 302, 300, 301)];

    const result = evaluateSmtFill({
      reference: bullishReference(),
      chartSymbol: "NQ",
      triad,
    });

    expect(result).toEqual({
      state: "Dead",
      entries: { ES: true, NQ: true, YM: true },
      deadAt: t3,
    });
  });

  it("allows peer-first Active without chart-symbol FVG Entry", () => {
    const triad = idleTriad();
    triad.ES.bars1m = [bar(C3_CLOSE + MINUTE_MS, 101, 102, 100, 101)];
    triad.YM.bars1m = [bar(C3_CLOSE + 2 * MINUTE_MS, 301, 302, 300, 301)];

    const result = evaluateSmtFill({
      reference: bullishReference(),
      chartSymbol: "NQ",
      triad,
    });

    expect(result).toEqual({
      state: "Active",
      entries: { ES: true, NQ: false, YM: true },
    });
  });

  it("keeps entries sticky once tagged", () => {
    const triad = idleTriad();
    triad.ES.bars1m = [
      bar(C3_CLOSE + MINUTE_MS, 101, 102, 100, 101),
      bar(C3_CLOSE + 2 * MINUTE_MS, 105, 106, 104, 105),
    ];

    const result = evaluateSmtFill({
      reference: bullishReference(),
      chartSymbol: "NQ",
      triad,
    });

    expect(result.entries.ES).toBe(true);
    expect(result.state).toBe("Active");
  });

  it("does not resurrect from Dead when later bars leave the extreme", () => {
    const tDead = C3_CLOSE + 3 * MINUTE_MS;
    const triad = idleTriad();
    triad.ES.bars1m = [
      bar(C3_CLOSE + MINUTE_MS, 101, 102, 100, 101),
      bar(C3_CLOSE + 10 * MINUTE_MS, 120, 121, 119, 120),
    ];
    triad.NQ.bars1m = [
      bar(C3_CLOSE + 2 * MINUTE_MS, 201, 202, 200, 201),
      bar(C3_CLOSE + 10 * MINUTE_MS, 220, 221, 219, 220),
    ];
    triad.YM.bars1m = [
      bar(tDead, 301, 302, 300, 301),
      bar(C3_CLOSE + 10 * MINUTE_MS, 320, 321, 319, 320),
    ];

    const result = evaluateSmtFill({
      reference: bullishReference(),
      chartSymbol: "ES",
      triad,
    });

    expect(result).toEqual({
      state: "Dead",
      entries: { ES: true, NQ: true, YM: true },
      deadAt: tDead,
    });
  });

  it("completes Dead when multiple symbols enter on the same 1m timestamp", () => {
    const t = C3_CLOSE + MINUTE_MS;
    const triad = idleTriad();
    triad.ES.bars1m = [bar(t, 101, 102, 100, 101)];
    triad.NQ.bars1m = [bar(t, 201, 202, 200, 201)];
    triad.YM.bars1m = [bar(t, 301, 302, 300, 301)];

    const result = evaluateSmtFill({
      reference: bullishReference(),
      chartSymbol: "YM",
      triad,
    });

    expect(result).toEqual({
      state: "Dead",
      entries: { ES: true, NQ: true, YM: true },
      deadAt: t,
    });
  });

  it("cannot enter when a peer is missing its native-TF C3 bar", () => {
    const triad = idleTriad();
    triad.YM = { bars1m: [bar(C3_CLOSE + MINUTE_MS, 301, 302, 300, 301)] };
    triad.ES.bars1m = [bar(C3_CLOSE + MINUTE_MS, 101, 102, 100, 101)];
    triad.NQ.bars1m = [bar(C3_CLOSE + MINUTE_MS, 201, 202, 200, 201)];

    const result = evaluateSmtFill({
      reference: bullishReference(),
      chartSymbol: "NQ",
      triad,
    });

    expect(result).toEqual({
      state: "Active",
      entries: { ES: true, NQ: true, YM: false },
    });
  });

  it("isolates each reference gap to its own C3 extreme and close gate", () => {
    const gapAClose = C3_CLOSE;
    const gapBClose = C3_CLOSE + 4 * HOUR_MS;
    const enterA = C3_CLOSE + MINUTE_MS;
    const enterB = gapBClose + MINUTE_MS;

    const gapA = evaluateSmtFill({
      reference: bullishReference({
        zoneLow: 100,
        zoneHigh: 105,
        fvgC3CloseAt: gapAClose,
      }),
      chartSymbol: "NQ",
      triad: {
        ES: {
          c3: { high: 110, low: 100 },
          bars1m: [bar(enterA, 101, 102, 100, 101)],
        },
        NQ: {
          c3: { high: 210, low: 200 },
          bars1m: [bar(enterA, 201, 202, 200, 201)],
        },
        YM: {
          c3: { high: 310, low: 300 },
          bars1m: [bar(enterA, 301, 302, 300, 301)],
        },
      },
    });
    expect(gapA.state).toBe("Dead");
    expect(gapA.deadAt).toBe(enterA);

    const gapB = evaluateSmtFill({
      reference: bullishReference({
        formedAt: gapBClose - HOUR_MS,
        fvgC3CloseAt: gapBClose,
        zoneLow: 150,
        zoneHigh: 155,
      }),
      chartSymbol: "NQ",
      triad: {
        ES: {
          c3: { high: 160, low: 150 },
          bars1m: [bar(enterA, 101, 102, 100, 101)],
        },
        NQ: {
          c3: { high: 260, low: 250 },
          bars1m: [bar(enterA, 201, 202, 200, 201)],
        },
        YM: {
          c3: { high: 360, low: 350 },
          bars1m: [
            bar(enterA, 301, 302, 300, 301),
            bar(enterB, 351, 352, 350, 351),
          ],
        },
      },
    });
    expect(gapB).toEqual({
      state: "Active",
      entries: { ES: false, NQ: false, YM: true },
    });
  });

  it("applies the same rules for 15m through 4H reference timeframes", () => {
    for (const timeframe of ["15m", "30m", "90m", "1H", "4H"] as const) {
      const triad = idleTriad();
      triad.NQ.bars1m = [bar(C3_CLOSE + MINUTE_MS, 201, 202, 200, 201)];

      const result = evaluateSmtFill({
        reference: bullishReference({ timeframe }),
        chartSymbol: "ES",
        triad,
      });

      expect(result.state).toBe("Active");
      expect(result.entries.NQ).toBe(true);
    }
  });
});
