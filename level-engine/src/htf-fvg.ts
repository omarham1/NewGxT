import type { Bar } from "./types.js";
import { isWithinHtfFvgLookback } from "./session-calendar.js";

export type HtfTimeframe = "4H" | "1H";

export type HtfFvg = {
  timeframe: HtfTimeframe;
  direction: "bullish" | "bearish";
  zoneLow: number;
  zoneHigh: number;
  formedAt: number;
};

export type ComputeHtfFvgsInput = {
  bars4h: Bar[];
  bars1h: Bar[];
  mitigationBars: Bar[];
  asOf: number;
};

function bodyHigh(bar: Bar): number {
  return Math.max(bar.open, bar.close);
}

function bodyLow(bar: Bar): number {
  return Math.min(bar.open, bar.close);
}

function barEntersZone(bar: Bar, zoneLow: number, zoneHigh: number): boolean {
  return bar.low <= zoneHigh && bar.high >= zoneLow;
}

function detectFvgAt(
  first: Bar,
  middle: Bar,
  third: Bar,
): Pick<HtfFvg, "direction" | "zoneLow" | "zoneHigh" | "formedAt"> | null {
  const firstBodyHigh = bodyHigh(first);
  const firstBodyLow = bodyLow(first);
  const thirdBodyHigh = bodyHigh(third);
  const thirdBodyLow = bodyLow(third);

  if (thirdBodyLow > firstBodyHigh) {
    return {
      direction: "bullish",
      zoneLow: firstBodyHigh,
      zoneHigh: thirdBodyLow,
      formedAt: third.time,
    };
  }

  if (thirdBodyHigh < firstBodyLow) {
    return {
      direction: "bearish",
      zoneLow: thirdBodyHigh,
      zoneHigh: firstBodyLow,
      formedAt: third.time,
    };
  }

  return null;
}

function detectFvgsOnTimeframe(
  bars: Bar[],
  timeframe: HtfTimeframe,
  mitigationBars: Bar[],
): HtfFvg[] {
  const fvgs: HtfFvg[] = [];

  for (let i = 2; i < bars.length; i++) {
    const detected = detectFvgAt(bars[i - 2]!, bars[i - 1]!, bars[i]!);
    if (detected === null) {
      continue;
    }

    const mitigated = mitigationBars.some(
      (bar) =>
        bar.time > detected.formedAt &&
        barEntersZone(bar, detected.zoneLow, detected.zoneHigh),
    );
    if (mitigated) {
      continue;
    }

    fvgs.push({ timeframe, ...detected });
  }

  return fvgs;
}

export function computeHtfFvgs(input: ComputeHtfFvgsInput): HtfFvg[] {
  const fvgs4h = detectFvgsOnTimeframe(
    input.bars4h,
    "4H",
    input.mitigationBars,
  );
  const fvgs1h = detectFvgsOnTimeframe(
    input.bars1h,
    "1H",
    input.mitigationBars,
  );

  return [...fvgs4h, ...fvgs1h].filter((fvg) =>
    isWithinHtfFvgLookback(fvg.formedAt, input.asOf),
  );
}
