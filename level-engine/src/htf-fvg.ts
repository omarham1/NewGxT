import type { Bar } from "./types.js";
import { isWithinHtfFvgLookback } from "./session-calendar.js";

export type HtfTimeframe = "4H" | "1H";

export type FvgTimeframe = HtfTimeframe | "90m" | "30m" | "15m";

const FVG_PERIOD_MS: Record<FvgTimeframe, number> = {
  "4H": 4 * 60 * 60 * 1000,
  "1H": 60 * 60 * 1000,
  "90m": 90 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "15m": 15 * 60 * 1000,
};

export type HtfFvg = {
  timeframe: FvgTimeframe;
  direction: "bullish" | "bearish";
  zoneLow: number;
  zoneHigh: number;
  /** FVG C3 bar open. Formation and lookback use this. */
  formedAt: number;
  /** FVG C3 bar close. 1m FVG Entry gates on this, not formedAt. */
  fvgC3CloseAt: number;
};

export type ComputeHtfFvgsInput = {
  bars4h: Bar[];
  bars1h: Bar[];
  bars90m?: Bar[];
  bars30m?: Bar[];
  bars15m?: Bar[];
  mitigationBars: Bar[];
  asOf: number;
};

function barClosedThroughFvgExtreme(
  bar: Bar,
  direction: "bullish" | "bearish",
  zoneLow: number,
  zoneHigh: number,
): boolean {
  return direction === "bullish"
    ? bar.close < zoneLow
    : bar.close > zoneHigh;
}

function isMitigated(
  direction: "bullish" | "bearish",
  zoneLow: number,
  zoneHigh: number,
  formedAt: number,
  barsAfterFormation: Bar[],
  mitigationBars: Bar[],
): boolean {
  return [...barsAfterFormation, ...mitigationBars].some(
    (bar) =>
      bar.time > formedAt &&
      barClosedThroughFvgExtreme(bar, direction, zoneLow, zoneHigh),
  );
}

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
  timeframe: FvgTimeframe,
  mitigationBars: Bar[],
): HtfFvg[] {
  const fvgs: HtfFvg[] = [];

  for (let i = 2; i < bars.length; i++) {
    const detected = detectFvgAt(bars[i - 2]!, bars[i - 1]!, bars[i]!);
    if (detected === null) {
      continue;
    }

    if (
      isMitigated(
        detected.direction,
        detected.zoneLow,
        detected.zoneHigh,
        detected.formedAt,
        bars.slice(i + 1),
        mitigationBars,
      )
    ) {
      continue;
    }

    fvgs.push({
      timeframe,
      ...detected,
      fvgC3CloseAt: detected.formedAt + FVG_PERIOD_MS[timeframe],
    });
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
  const fvgs90m = detectFvgsOnTimeframe(
    input.bars90m ?? [],
    "90m",
    input.mitigationBars,
  );
  const fvgs30m = detectFvgsOnTimeframe(
    input.bars30m ?? [],
    "30m",
    input.mitigationBars,
  );
  const fvgs15m = detectFvgsOnTimeframe(
    input.bars15m ?? [],
    "15m",
    input.mitigationBars,
  );

  return [...fvgs4h, ...fvgs1h, ...fvgs90m, ...fvgs30m, ...fvgs15m].filter(
    (fvg) => isWithinHtfFvgLookback(fvg.formedAt, input.asOf),
  );
}
