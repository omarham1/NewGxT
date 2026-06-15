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

function barEntersZone(bar: Bar, zoneLow: number, zoneHigh: number): boolean {
  return bar.low <= zoneHigh && bar.high >= zoneLow;
}

/** True when every price in [innerLow, innerHigh] lies in bar A or bar B range. */
function rangeFullyOverlappedByPair(
  innerLow: number,
  innerHigh: number,
  aLow: number,
  aHigh: number,
  bLow: number,
  bHigh: number,
): boolean {
  let segments: Array<[number, number]> = [[innerLow, innerHigh]];

  for (const [coverLow, coverHigh] of [
    [aLow, aHigh],
    [bLow, bHigh],
  ] as const) {
    const next: Array<[number, number]> = [];
    for (const [segLow, segHigh] of segments) {
      if (coverHigh < segLow || coverLow > segHigh) {
        next.push([segLow, segHigh]);
        continue;
      }
      if (segLow < coverLow) {
        next.push([segLow, coverLow]);
      }
      if (segHigh > coverHigh) {
        next.push([coverHigh, segHigh]);
      }
    }
    segments = next;
    if (segments.length === 0) {
      return true;
    }
  }

  return false;
}

function middleRangeFullyOverlappedByOuter(first: Bar, middle: Bar, third: Bar): boolean {
  return rangeFullyOverlappedByPair(
    middle.low,
    middle.high,
    first.low,
    first.high,
    third.low,
    third.high,
  );
}

function detectFvgAt(
  first: Bar,
  middle: Bar,
  third: Bar,
): Pick<HtfFvg, "direction" | "zoneLow" | "zoneHigh" | "formedAt"> | null {
  if (third.low > first.high) {
    if (middleRangeFullyOverlappedByOuter(first, middle, third)) {
      return null;
    }
    return {
      direction: "bullish",
      zoneLow: first.high,
      zoneHigh: third.low,
      formedAt: third.time,
    };
  }

  if (third.high < first.low) {
    if (middleRangeFullyOverlappedByOuter(first, middle, third)) {
      return null;
    }
    return {
      direction: "bearish",
      zoneLow: third.high,
      zoneHigh: first.low,
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
