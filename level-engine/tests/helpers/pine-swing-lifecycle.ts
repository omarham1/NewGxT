import {
  combinedWeeklySwingRange,
} from "../../src/htf-swing.js";
import {
  getDailySessionKey,
  isWithinHtfSwingLookback,
} from "../../src/session-calendar.js";
import type { Bar } from "../../src/types.js";

type Swing = {
  price: number;
  formedAt: number;
  confirmedAt: number;
  kind: "high" | "low";
  mitigated: boolean;
  mitigatedAt?: number;
};

function isStrictFractalHigh(bars: Bar[], pivotIndex: number): boolean {
  const pivotHigh = bars[pivotIndex]!.high;
  for (let offset = 1; offset <= 3; offset++) {
    if (pivotHigh <= bars[pivotIndex - offset]!.high) {
      return false;
    }
    if (pivotHigh <= bars[pivotIndex + offset]!.high) {
      return false;
    }
  }
  return true;
}

function isStrictFractalLow(bars: Bar[], pivotIndex: number): boolean {
  const pivotLow = bars[pivotIndex]!.low;
  for (let offset = 1; offset <= 3; offset++) {
    if (pivotLow >= bars[pivotIndex - offset]!.low) {
      return false;
    }
    if (pivotLow >= bars[pivotIndex + offset]!.low) {
      return false;
    }
  }
  return true;
}

function isSwingVisible(
  price: number,
  formedAt: number,
  asOf: number,
  weekly: { rangeLow: number; rangeHigh: number },
): boolean {
  if (!isWithinHtfSwingLookback(formedAt, asOf)) {
    return false;
  }
  return price >= weekly.rangeLow && price <= weekly.rangeHigh;
}

function swingSwept(
  swing: Swing,
  checkLow: number,
  checkHigh: number,
): boolean {
  return swing.kind === "high"
    ? checkHigh >= swing.price
    : checkLow <= swing.price;
}

function swingExists(swings: Swing[], formedAt: number, kind: Swing["kind"]): boolean {
  return swings.some((s) => s.formedAt === formedAt && s.kind === kind);
}

function tryAddSwing(
  swings: Swing[],
  kind: Swing["kind"],
  price: number,
  formedAt: number,
  confirmedAt: number,
  asOf: number,
  weekly: { rangeLow: number; rangeHigh: number },
): void {
  if (
    !isSwingVisible(price, formedAt, asOf, weekly) ||
    swingExists(swings, formedAt, kind)
  ) {
    return;
  }

  swings.push({
    price,
    formedAt,
    confirmedAt,
    kind,
    mitigated: false,
  });
}

function sweepSwings(
  swings: Swing[],
  checkLow: number,
  checkHigh: number,
  checkTime: number,
): void {
  for (const swing of swings) {
    if (
      !swing.mitigated &&
      checkTime > swing.confirmedAt &&
      swingSwept(swing, checkLow, checkHigh)
    ) {
      swing.mitigated = true;
      swing.mitigatedAt = checkTime;
    }
  }
}

function removeAllMitigated(swings: Swing[]): void {
  for (let i = swings.length - 1; i >= 0; i--) {
    if (swings[i]!.mitigated) {
      swings.splice(i, 1);
    }
  }
}

function pruneStaleMitigated(swings: Swing[], asOf: number): void {
  const currentSession = getDailySessionKey(asOf);
  for (let i = swings.length - 1; i >= 0; i--) {
    const swing = swings[i]!;
    if (
      swing.mitigated &&
      swing.mitigatedAt !== undefined &&
      getDailySessionKey(swing.mitigatedAt) !== currentSession
    ) {
      swings.splice(i, 1);
    }
  }
}

function pruneInvisible(
  swings: Swing[],
  asOf: number,
  weekly: { rangeLow: number; rangeHigh: number },
): void {
  for (let i = swings.length - 1; i >= 0; i--) {
    const swing = swings[i]!;
    if (!isSwingVisible(swing.price, swing.formedAt, asOf, weekly)) {
      swings.splice(i, 1);
    }
  }
}

export type PineSwingLifecycleInput = {
  htfBars: Bar[];
  mitigationBars?: Bar[];
  pwh: number;
  pwl: number;
  currentWeekHigh: number;
  currentWeekLow: number;
  isBarConfirmed?: (barIndex: number) => boolean;
};

/**
 * Mirrors Pine on a higher-timeframe chart when mitigation only samples one 1m
 * bar per chart bar (request.security "1" alignment) instead of all 1m bars in
 * the chart period (request.security_lower_tf).
 */
export function simulatePineSwingLifecycleSampledMitigation(
  input: PineSwingLifecycleInput,
  evalAt?: number,
): number {
  const {
    htfBars,
    mitigationBars = [],
    pwh,
    pwl,
    currentWeekHigh,
    currentWeekLow,
    isBarConfirmed = () => true,
  } = input;

  const weekly = combinedWeeklySwingRange({
    pwh,
    pwl,
    currentWeekHigh,
    currentWeekLow,
  });
  const active: Swing[] = [];

  const mitigationByTime = new Map<number, Bar>();
  for (const bar of mitigationBars) {
    mitigationByTime.set(bar.time, bar);
  }

  let prevSessionKey: string | undefined;

  for (let barIndex = 0; barIndex < htfBars.length; barIndex++) {
    const bar = htfBars[barIndex]!;
    const sessionKey = getDailySessionKey(bar.time);
    if (prevSessionKey !== undefined && sessionKey !== prevSessionKey) {
      removeAllMitigated(active);
    }
    prevSessionKey = sessionKey;

    const pivotIndex = barIndex - 3;
    if (pivotIndex >= 3 && isBarConfirmed(barIndex)) {
      const pivot = htfBars[pivotIndex]!;

      if (isStrictFractalHigh(htfBars, pivotIndex)) {
        tryAddSwing(
          active,
          "high",
          pivot.high,
          pivot.time,
          bar.time,
          bar.time,
          weekly,
        );
      }

      if (isStrictFractalLow(htfBars, pivotIndex)) {
        tryAddSwing(
          active,
          "low",
          pivot.low,
          pivot.time,
          bar.time,
          bar.time,
          weekly,
        );
      }
    }

    const sampled = mitigationByTime.get(bar.time);
    if (sampled) {
      sweepSwings(active, sampled.low, sampled.high, sampled.time);
    }

    pruneStaleMitigated(active, bar.time);
    pruneInvisible(active, bar.time, weekly);
  }

  const asOf =
    evalAt ??
    Math.max(
      htfBars.length > 0 ? htfBars[htfBars.length - 1]!.time : 0,
      mitigationBars.length > 0
        ? mitigationBars[mitigationBars.length - 1]!.time
        : 0,
    );

  pruneStaleMitigated(active, asOf);
  pruneInvisible(active, asOf, weekly);

  return active.filter((swing) => !swing.mitigated).length;
}

/** Mirrors Pine indicator bar-by-bar HTF swing state machine. */
export function simulatePineSwingLifecycle(
  input: PineSwingLifecycleInput,
  evalAt?: number,
): number {
  const {
    htfBars,
    mitigationBars = [],
    pwh,
    pwl,
    currentWeekHigh,
    currentWeekLow,
    isBarConfirmed = () => true,
  } = input;

  const weekly = combinedWeeklySwingRange({
    pwh,
    pwl,
    currentWeekHigh,
    currentWeekLow,
  });
  const active: Swing[] = [];

  type TimelineEvent =
    | { kind: "htf"; barIndex: number }
    | { kind: "mitigation"; bar: Bar };

  const events: TimelineEvent[] = [];
  for (let i = 0; i < htfBars.length; i++) {
    events.push({ kind: "htf", barIndex: i });
  }
  for (const bar of mitigationBars) {
    events.push({ kind: "mitigation", bar });
  }
  events.sort((a, b) => {
    const timeA = a.kind === "htf" ? htfBars[a.barIndex]!.time : a.bar.time;
    const timeB = b.kind === "htf" ? htfBars[b.barIndex]!.time : b.bar.time;
    return timeA - timeB;
  });

  let prevSessionKey: string | undefined;

  for (const event of events) {
    if (event.kind === "htf") {
      const bar = htfBars[event.barIndex]!;
      const sessionKey = getDailySessionKey(bar.time);
      if (prevSessionKey !== undefined && sessionKey !== prevSessionKey) {
        removeAllMitigated(active);
      }
      prevSessionKey = sessionKey;

      const pivotIndex = event.barIndex - 3;
      if (pivotIndex >= 3 && isBarConfirmed(event.barIndex)) {
        const pivot = htfBars[pivotIndex]!;

        if (isStrictFractalHigh(htfBars, pivotIndex)) {
          tryAddSwing(
            active,
            "high",
            pivot.high,
            pivot.time,
            bar.time,
            bar.time,
            weekly,
          );
        }

        if (isStrictFractalLow(htfBars, pivotIndex)) {
          tryAddSwing(
            active,
            "low",
            pivot.low,
            pivot.time,
            bar.time,
            bar.time,
            weekly,
          );
        }
      }

      pruneStaleMitigated(active, bar.time);
      pruneInvisible(active, bar.time, weekly);
      continue;
    }

    const bar = event.bar;
    const sessionKey = getDailySessionKey(bar.time);
    if (prevSessionKey !== undefined && sessionKey !== prevSessionKey) {
      removeAllMitigated(active);
    }
    prevSessionKey = sessionKey;

    sweepSwings(active, bar.low, bar.high, bar.time);
    pruneStaleMitigated(active, bar.time);
    pruneInvisible(active, bar.time, weekly);
  }

  const asOf =
    evalAt ??
    Math.max(
      htfBars.length > 0 ? htfBars[htfBars.length - 1]!.time : 0,
      mitigationBars.length > 0
        ? mitigationBars[mitigationBars.length - 1]!.time
        : 0,
    );

  pruneStaleMitigated(active, asOf);
  pruneInvisible(active, asOf, weekly);

  return active.length;
}

export function pineUnmitigatedSwingCount(
  input: PineSwingLifecycleInput,
  evalAt?: number,
): number {
  const {
    htfBars,
    mitigationBars = [],
    pwh,
    pwl,
    currentWeekHigh,
    currentWeekLow,
    isBarConfirmed = () => true,
  } = input;

  const weekly = combinedWeeklySwingRange({
    pwh,
    pwl,
    currentWeekHigh,
    currentWeekLow,
  });
  const active: Swing[] = [];

  type TimelineEvent =
    | { kind: "htf"; barIndex: number }
    | { kind: "mitigation"; bar: Bar };

  const events: TimelineEvent[] = [];
  for (let i = 0; i < htfBars.length; i++) {
    events.push({ kind: "htf", barIndex: i });
  }
  for (const bar of mitigationBars) {
    events.push({ kind: "mitigation", bar });
  }
  events.sort((a, b) => {
    const timeA = a.kind === "htf" ? htfBars[a.barIndex]!.time : a.bar.time;
    const timeB = b.kind === "htf" ? htfBars[b.barIndex]!.time : b.bar.time;
    return timeA - timeB;
  });

  let prevSessionKey: string | undefined;

  for (const event of events) {
    if (event.kind === "htf") {
      const bar = htfBars[event.barIndex]!;
      const sessionKey = getDailySessionKey(bar.time);
      if (prevSessionKey !== undefined && sessionKey !== prevSessionKey) {
        removeAllMitigated(active);
      }
      prevSessionKey = sessionKey;

      const pivotIndex = event.barIndex - 3;
      if (pivotIndex >= 3 && isBarConfirmed(event.barIndex)) {
        const pivot = htfBars[pivotIndex]!;

        if (isStrictFractalHigh(htfBars, pivotIndex)) {
          tryAddSwing(
            active,
            "high",
            pivot.high,
            pivot.time,
            bar.time,
            bar.time,
            weekly,
          );
        }

        if (isStrictFractalLow(htfBars, pivotIndex)) {
          tryAddSwing(
            active,
            "low",
            pivot.low,
            pivot.time,
            bar.time,
            bar.time,
            weekly,
          );
        }
      }

      pruneStaleMitigated(active, bar.time);
      pruneInvisible(active, bar.time, weekly);
      continue;
    }

    const bar = event.bar;
    const sessionKey = getDailySessionKey(bar.time);
    if (prevSessionKey !== undefined && sessionKey !== prevSessionKey) {
      removeAllMitigated(active);
    }
    prevSessionKey = sessionKey;

    sweepSwings(active, bar.low, bar.high, bar.time);
    pruneStaleMitigated(active, bar.time);
    pruneInvisible(active, bar.time, weekly);
  }

  const asOf =
    evalAt ??
    Math.max(
      htfBars.length > 0 ? htfBars[htfBars.length - 1]!.time : 0,
      mitigationBars.length > 0
        ? mitigationBars[mitigationBars.length - 1]!.time
        : 0,
    );

  pruneStaleMitigated(active, asOf);
  pruneInvisible(active, asOf, weekly);

  return active.filter((swing) => !swing.mitigated).length;
}
