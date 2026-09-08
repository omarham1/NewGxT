import type { HtfFvg } from "./htf-fvg.js";
import type { Bar } from "./types.js";

export type TriadSymbol = "ES" | "NQ" | "YM";

export type SmtFillState = "Idle" | "Active" | "Dead";

/** Confirmed reference Fair Value Gap (same shape as detected HTF/ITF gaps). */
export type SmtFillReference = HtfFvg;

export type TriadSymbolFeed = {
  /** Native-TF bar at reference FVG C3 open. Absent → cannot enter. */
  c3?: { high: number; low: number };
  bars1m: Bar[];
};

export type EvaluateSmtFillInput = {
  reference: SmtFillReference;
  /** Wiring / diagnostics only — does not gate Idle / Active / Dead. */
  chartSymbol: TriadSymbol;
  triad: Record<TriadSymbol, TriadSymbolFeed>;
};

export type SmtFillResult = {
  state: SmtFillState;
  entries: Record<TriadSymbol, boolean>;
  deadAt?: number;
};

const TRIAD: TriadSymbol[] = ["ES", "NQ", "YM"];

function firstFvgEntryAt(
  direction: "bullish" | "bearish",
  c3: { high: number; low: number },
  bars1m: Bar[],
  fvgC3CloseAt: number,
): number | undefined {
  const extreme = direction === "bullish" ? c3.low : c3.high;
  let earliest: number | undefined;
  for (const bar of bars1m) {
    if (bar.time <= fvgC3CloseAt) continue;
    if (bar.low > extreme || bar.high < extreme) continue;
    if (earliest === undefined || bar.time < earliest) {
      earliest = bar.time;
    }
  }
  return earliest;
}

export function evaluateSmtFill({
  reference,
  triad,
}: EvaluateSmtFillInput): SmtFillResult {
  const entries = {} as Record<TriadSymbol, boolean>;
  const entryAts: number[] = [];

  for (const symbol of TRIAD) {
    const feed = triad[symbol];
    const entryAt =
      feed.c3 === undefined
        ? undefined
        : firstFvgEntryAt(
            reference.direction,
            feed.c3,
            feed.bars1m,
            reference.fvgC3CloseAt,
          );
    entries[symbol] = entryAt !== undefined;
    if (entryAt !== undefined) entryAts.push(entryAt);
  }

  if (entryAts.length === 0) {
    return { state: "Idle", entries };
  }
  if (entryAts.length < 3) {
    return { state: "Active", entries };
  }

  return {
    state: "Dead",
    entries,
    deadAt: Math.max(...entryAts),
  };
}
