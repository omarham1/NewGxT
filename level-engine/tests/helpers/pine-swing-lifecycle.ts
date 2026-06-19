import {
  alignCrossTfSwingPrices,
  combinedWeeklySwingRange,
  DEFAULT_FAILURE_SWING_ADR_FRACTION,
  resolveSwingWickTime,
  type HtfSwingPoint,
} from "../../src/htf-swing.js";
import {
  getDailySessionKey,
  isWithinHtfSwingComparisonLookback,
  isWithinHtfSwingLookback,
} from "../../src/session-calendar.js";
import { findLevelCrossTime } from "../../src/level-mitigation.js";
import type { Bar } from "../../src/types.js";

type Swing = {
  price: number;
  formedAt: number;
  confirmedAt: number;
  kind: "high" | "low";
  timeframe?: "4H" | "1H";
  mitigated: boolean;
  mitigatedAt?: number;
  isFailureSwing: boolean;
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

function swingExists(
  swings: Swing[],
  formedAt: number,
  kind: Swing["kind"],
  timeframe?: Swing["timeframe"],
): boolean {
  return swings.some(
    (s) =>
      s.formedAt === formedAt &&
      s.kind === kind &&
      (timeframe === undefined || s.timeframe === timeframe),
  );
}

function isMitigatedAsOf(
  swing: Swing,
  atTime: number,
  mitigationBars: Bar[],
): boolean {
  return (
    findLevelCrossTime(
      swing.kind,
      swing.price,
      swing.confirmedAt,
      mitigationBars,
      atTime,
    ) !== undefined
  );
}

function isMoreExtreme(candidate: Swing, other: Swing): boolean {
  if (candidate.kind === "high") {
    return candidate.price > other.price;
  }
  return candidate.price < other.price;
}

function isInFailureSwingComparisonPool(
  swing: Swing,
  atTime: number,
  weekly: { rangeLow: number; rangeHigh: number },
): boolean {
  if (swing.confirmedAt > atTime) {
    return false;
  }

  if (!isWithinHtfSwingComparisonLookback(swing.formedAt, atTime)) {
    return false;
  }

  return (
    swing.price >= weekly.rangeLow && swing.price <= weekly.rangeHigh
  );
}

function isFailureSwingPeer(
  peer: Swing,
  swing: Swing,
  weekly: { rangeLow: number; rangeHigh: number },
  threshold: number,
  mitigationBars: Bar[],
): boolean {
  if (peer.kind !== swing.kind || peer.confirmedAt > swing.confirmedAt) {
    return false;
  }

  if (!isInFailureSwingComparisonPool(peer, swing.confirmedAt, weekly)) {
    return false;
  }

  if (isMitigatedAsOf(peer, swing.confirmedAt, mitigationBars)) {
    return false;
  }

  return Math.abs(peer.price - swing.price) <= threshold;
}

function stampFailureSwingAgainstPeers(swing: Swing, peers: Swing[]): void {
  for (const peer of peers) {
    if (peer === swing) {
      continue;
    }

    if (!peer.isFailureSwing && isMoreExtreme(peer, swing)) {
      swing.isFailureSwing = true;
      return;
    }

    if (isMoreExtreme(swing, peer)) {
      peer.isFailureSwing = true;
    }
  }
}

function stampFailureSwingsForConfirmation(
  swings: Swing[],
  swing: Swing,
  weekly: { rangeLow: number; rangeHigh: number },
  adr: number,
  failureSwingAdrFraction: number,
  mitigationBars: Bar[],
): void {
  if (swing.isFailureSwing) {
    return;
  }

  const threshold = adr * failureSwingAdrFraction;
  const peers = swings.filter((peer) =>
    isFailureSwingPeer(peer, swing, weekly, threshold, mitigationBars),
  );
  stampFailureSwingAgainstPeers(swing, peers);
}

function resolveLifecycleSwingWickTime(
  pivot: Bar,
  kind: Swing["kind"],
  timeframe: "4H" | "1H",
  bars1h: Bar[],
  mitigationBars: Bar[],
): number {
  return resolveSwingWickTime(
    pivot,
    kind,
    timeframe,
    timeframe === "4H" ? bars1h : mitigationBars,
  );
}

function tryAddSwing(
  swings: Swing[],
  kind: Swing["kind"],
  price: number,
  formedAt: number,
  confirmedAt: number,
  asOf: number,
  weekly: { rangeLow: number; rangeHigh: number },
  adr: number,
  failureSwingAdrFraction: number,
  mitigationBars: Bar[],
  timeframe?: Swing["timeframe"],
): void {
  if (
    !isSwingVisible(price, formedAt, asOf, weekly) ||
    swingExists(swings, formedAt, kind, timeframe)
  ) {
    return;
  }

  const swing: Swing = {
    price,
    formedAt,
    confirmedAt,
    kind,
    timeframe,
    mitigated: false,
    isFailureSwing: false,
  };
  swings.push(swing);
  stampFailureSwingsForConfirmation(
    swings,
    swing,
    weekly,
    adr,
    failureSwingAdrFraction,
    mitigationBars,
  );
}

function alignActiveCrossTfSwings(
  swings: Swing[],
  adr: number,
  failureSwingAdrFraction: number,
  asOf: number,
): void {
  const htfSwings: HtfSwingPoint[] = swings
    .filter((swing): swing is Swing & { timeframe: "4H" | "1H" } =>
      swing.timeframe !== undefined,
    )
    .map((swing) => ({
      timeframe: swing.timeframe,
      kind: swing.kind,
      price: swing.price,
      formedAt: swing.formedAt,
      confirmedAt: swing.confirmedAt,
      isFailureSwing: swing.isFailureSwing,
    }));

  const aligned = alignCrossTfSwingPrices(htfSwings, {
    bars4h: [],
    bars1h: [],
    mitigationBars: [],
    pwh: 0,
    pwl: 0,
    currentWeekHigh: 0,
    currentWeekLow: 0,
    adr,
    failureSwingAdrFraction,
    asOf,
  });

  for (const swing of aligned) {
    const match = swings.find(
      (candidate) =>
        candidate.timeframe === swing.timeframe &&
        candidate.kind === swing.kind &&
        candidate.formedAt === swing.formedAt &&
        candidate.confirmedAt === swing.confirmedAt,
    );
    if (match) {
      match.price = swing.price;
      match.isFailureSwing = swing.isFailureSwing ?? false;
    }
  }
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

function isSwingDisplayVisible(
  price: number,
  formedAt: number,
  asOf: number,
  weekly: { rangeLow: number; rangeHigh: number },
): boolean {
  return isSwingVisible(price, formedAt, asOf, weekly);
}

function pruneComparisonExpired(
  swings: Swing[],
  asOf: number,
): void {
  for (let i = swings.length - 1; i >= 0; i--) {
    const swing = swings[i]!;
    if (!isWithinHtfSwingComparisonLookback(swing.formedAt, asOf)) {
      swings.splice(i, 1);
    }
  }
}

function visibleSwingCount(
  swings: Swing[],
  asOf: number,
  weekly: { rangeLow: number; rangeHigh: number },
): number {
  return swings.filter(
    (swing) =>
      !swing.isFailureSwing &&
      isSwingDisplayVisible(swing.price, swing.formedAt, asOf, weekly),
  ).length;
}

function unmitigatedVisibleSwingCount(
  swings: Swing[],
  asOf: number,
  weekly: { rangeLow: number; rangeHigh: number },
): number {
  return swings.filter(
    (swing) =>
      !swing.mitigated &&
      !swing.isFailureSwing &&
      isSwingDisplayVisible(swing.price, swing.formedAt, asOf, weekly),
  ).length;
}

export type PineSwingLifecycleInput = {
  htfBars: Bar[];
  mitigationBars?: Bar[];
  pwh: number;
  pwl: number;
  currentWeekHigh: number;
  currentWeekLow: number;
  adr?: number;
  failureSwingAdrFraction?: number;
  isBarConfirmed?: (barIndex: number) => boolean;
};

function lifecycleConfig(input: PineSwingLifecycleInput) {
  return {
    adr: input.adr ?? 100,
    failureSwingAdrFraction:
      input.failureSwingAdrFraction ?? DEFAULT_FAILURE_SWING_ADR_FRACTION,
  };
}

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
  const { adr, failureSwingAdrFraction } = lifecycleConfig(input);

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
          adr,
          failureSwingAdrFraction,
          mitigationBars,
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
          adr,
          failureSwingAdrFraction,
          mitigationBars,
        );
      }
    }

    const sampled = mitigationByTime.get(bar.time);
    if (sampled) {
      sweepSwings(active, sampled.low, sampled.high, sampled.time);
    }

    pruneStaleMitigated(active, bar.time);
    pruneComparisonExpired(active, bar.time);
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
  pruneComparisonExpired(active, asOf);

  return unmitigatedVisibleSwingCount(active, asOf, weekly);
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
  const { adr, failureSwingAdrFraction } = lifecycleConfig(input);

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
            adr,
            failureSwingAdrFraction,
            mitigationBars,
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
            adr,
            failureSwingAdrFraction,
            mitigationBars,
          );
        }
      }

      pruneStaleMitigated(active, bar.time);
      pruneComparisonExpired(active, bar.time);
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
    pruneComparisonExpired(active, bar.time);
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
  pruneComparisonExpired(active, asOf);

  return visibleSwingCount(active, asOf, weekly);
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
  const { adr, failureSwingAdrFraction } = lifecycleConfig(input);

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
            adr,
            failureSwingAdrFraction,
            mitigationBars,
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
            adr,
            failureSwingAdrFraction,
            mitigationBars,
          );
        }
      }

      pruneStaleMitigated(active, bar.time);
      pruneComparisonExpired(active, bar.time);
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
    pruneComparisonExpired(active, bar.time);
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
  pruneComparisonExpired(active, asOf);

  return unmitigatedVisibleSwingCount(active, asOf, weekly);
}

export type PineCrossTfSwingLifecycleInput = Omit<
  PineSwingLifecycleInput,
  "htfBars"
> & {
  bars4h: Bar[];
  bars1h: Bar[];
};

/** Mirrors Pine indicator bar-by-bar state when both 4H and 1H swings are active. */
export function simulatePineCrossTfSwingLifecycle(
  input: PineCrossTfSwingLifecycleInput,
  evalAt?: number,
): number {
  const {
    bars4h,
    bars1h,
    mitigationBars = [],
    pwh,
    pwl,
    currentWeekHigh,
    currentWeekLow,
    isBarConfirmed = () => true,
  } = input;
  const { adr, failureSwingAdrFraction } = lifecycleConfig(input);

  const weekly = combinedWeeklySwingRange({
    pwh,
    pwl,
    currentWeekHigh,
    currentWeekLow,
  });
  const active: Swing[] = [];

  type TimelineEvent =
    | { kind: "htf"; bars: Bar[]; barIndex: number }
    | { kind: "mitigation"; bar: Bar };

  const events: TimelineEvent[] = [];
  for (let i = 0; i < bars4h.length; i++) {
    events.push({ kind: "htf", bars: bars4h, barIndex: i });
  }
  for (let i = 0; i < bars1h.length; i++) {
    events.push({ kind: "htf", bars: bars1h, barIndex: i });
  }
  for (const bar of mitigationBars) {
    events.push({ kind: "mitigation", bar });
  }
  events.sort((left, right) => {
    const leftTime =
      left.kind === "htf"
        ? left.bars[left.barIndex]!.time
        : left.bar.time;
    const rightTime =
      right.kind === "htf"
        ? right.bars[right.barIndex]!.time
        : right.bar.time;
    return leftTime - rightTime;
  });

  let prevSessionKey: string | undefined;

  for (const event of events) {
    const eventTime =
      event.kind === "htf"
        ? event.bars[event.barIndex]!.time
        : event.bar.time;
    if (evalAt !== undefined && eventTime > evalAt) {
      continue;
    }

    if (event.kind === "htf") {
      const bars = event.bars;
      const bar = bars[event.barIndex]!;
      const sessionKey = getDailySessionKey(bar.time);
      if (prevSessionKey !== undefined && sessionKey !== prevSessionKey) {
        removeAllMitigated(active);
      }
      prevSessionKey = sessionKey;

      const pivotIndex = event.barIndex - 3;
      if (pivotIndex >= 3 && isBarConfirmed(event.barIndex)) {
        const pivot = bars[pivotIndex]!;
        const timeframe = bars === bars4h ? "4H" : "1H";

        if (isStrictFractalHigh(bars, pivotIndex)) {
          tryAddSwing(
            active,
            "high",
            pivot.high,
            resolveLifecycleSwingWickTime(
              pivot,
              "high",
              timeframe,
              bars1h,
              mitigationBars,
            ),
            bar.time,
            bar.time,
            weekly,
            adr,
            failureSwingAdrFraction,
            mitigationBars,
            timeframe,
          );
        }

        if (isStrictFractalLow(bars, pivotIndex)) {
          tryAddSwing(
            active,
            "low",
            pivot.low,
            resolveLifecycleSwingWickTime(
              pivot,
              "low",
              timeframe,
              bars1h,
              mitigationBars,
            ),
            bar.time,
            bar.time,
            weekly,
            adr,
            failureSwingAdrFraction,
            mitigationBars,
            timeframe,
          );
        }

        alignActiveCrossTfSwings(active, adr, failureSwingAdrFraction, bar.time);
      }

      pruneStaleMitigated(active, bar.time);
      pruneComparisonExpired(active, bar.time);
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
    pruneComparisonExpired(active, bar.time);
  }

  const asOf =
    evalAt ??
    Math.max(
      bars4h.length > 0 ? bars4h[bars4h.length - 1]!.time : 0,
      bars1h.length > 0 ? bars1h[bars1h.length - 1]!.time : 0,
      mitigationBars.length > 0
        ? mitigationBars[mitigationBars.length - 1]!.time
        : 0,
    );

  pruneStaleMitigated(active, asOf);
  pruneComparisonExpired(active, asOf);

  return active.filter(
    (swing) =>
      !swing.isFailureSwing &&
      swing.confirmedAt <= asOf &&
      isSwingDisplayVisible(swing.price, swing.formedAt, asOf, weekly),
  ).length;
}
