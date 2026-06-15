import { describe, expect, it } from "vitest";
import { computeHtfFvgs } from "../src/htf-fvg.js";
import type { Bar } from "../src/types.js";

function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close };
}

describe("HTF FVG", () => {
  it("detects a bullish FVG using body extremes for zone boundaries", () => {
    const bars4h = [
      bar(1, 100, 105, 98, 102),
      bar(2, 102, 110, 101, 108),
      bar(3, 108, 115, 106, 112),
    ];

    const fvgs = computeHtfFvgs({
      bars4h,
      bars1h: [],
      pdh: 200,
      pdl: 50,
      mitigationBars: [],
    });

    expect(fvgs).toEqual([
      {
        timeframe: "4H",
        direction: "bullish",
        zoneLow: 102,
        zoneHigh: 108,
        formedAt: 3,
      },
    ]);
  });

  it("detects a bearish FVG using body extremes for zone boundaries", () => {
    const bars1h = [
      bar(1, 110, 112, 105, 106),
      bar(2, 106, 107, 98, 100),
      bar(3, 100, 102, 94, 96),
    ];

    const fvgs = computeHtfFvgs({
      bars4h: [],
      bars1h,
      pdh: 200,
      pdl: 50,
      mitigationBars: [],
    });

    expect(fvgs).toEqual([
      {
        timeframe: "1H",
        direction: "bearish",
        zoneLow: 100,
        zoneHigh: 106,
        formedAt: 3,
      },
    ]);
  });

  it("includes only FVGs overlapping the Previous Day range", () => {
    const bars4h = [
      bar(1, 100, 105, 98, 102),
      bar(2, 102, 110, 101, 108),
      bar(3, 108, 115, 106, 112),
    ];

    const insidePd = computeHtfFvgs({
      bars4h,
      bars1h: [],
      pdh: 120,
      pdl: 90,
      mitigationBars: [],
    });
    const outsidePd = computeHtfFvgs({
      bars4h,
      bars1h: [],
      pdh: 80,
      pdl: 50,
      mitigationBars: [],
    });

    expect(insidePd).toHaveLength(1);
    expect(outsidePd).toHaveLength(0);
  });

  it("mitigates an FVG when price enters the body-based zone", () => {
    const bars4h = [
      bar(1, 100, 105, 98, 102),
      bar(2, 102, 110, 101, 108),
      bar(3, 108, 115, 106, 112),
    ];
    const mitigationBars = [bar(4, 111, 113, 107, 112)];

    const fvgs = computeHtfFvgs({
      bars4h,
      bars1h: [],
      pdh: 200,
      pdl: 50,
      mitigationBars,
    });

    expect(fvgs).toEqual([]);
  });

  it("does not mitigate an FVG on its own formation bar", () => {
    const bars4h = [
      bar(1, 100, 105, 98, 102),
      bar(2, 102, 110, 101, 108),
      bar(3, 108, 115, 106, 112),
    ];

    const fvgs = computeHtfFvgs({
      bars4h,
      bars1h: [],
      pdh: 200,
      pdl: 50,
      mitigationBars: bars4h,
    });

    expect(fvgs).toHaveLength(1);
  });
});
