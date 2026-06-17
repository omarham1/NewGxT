import type { Bar } from "../../src/types.js";

export const HOUR_MS = 60 * 60 * 1000;
export const FOUR_HOUR_MS = 4 * HOUR_MS;

export function bar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close };
}

/** Seven 1H bars with a strict fractal(3) swing high at the pivot (index 3). */
export function fractalSwingHighSequence(
  startTime: number,
  peak = 5100,
): Bar[] {
  const plateau = peak - 5;
  return [
    bar(startTime, 5084, 5088, 5083, 5085),
    bar(startTime + HOUR_MS, 5085, 5089, 5083, 5087),
    bar(startTime + 2 * HOUR_MS, 5087, 5089, 5085, 5088),
    bar(startTime + 3 * HOUR_MS, 5088, peak, 5085, 5089),
    bar(startTime + 4 * HOUR_MS, plateau, plateau + 2, plateau - 2, plateau),
    bar(startTime + 5 * HOUR_MS, plateau, plateau + 2, plateau - 2, plateau),
    bar(startTime + 6 * HOUR_MS, plateau, plateau + 2, plateau - 2, plateau),
  ];
}

/** Seven 1H bars with a strict fractal(3) swing low at the pivot (index 3). */
export function fractalSwingLowSequenceAt(
  startTime: number,
  trough: number,
): Bar[] {
  const plateau = trough + 5;
  return [
    bar(startTime, 5016, 5017, 5015, 5016),
    bar(startTime + HOUR_MS, 5016, 5017, 5015, 5016),
    bar(startTime + 2 * HOUR_MS, 5016, 5017, 5015, 5016),
    bar(startTime + 3 * HOUR_MS, 5016, 5017, trough, 5016),
    bar(startTime + 4 * HOUR_MS, plateau, plateau + 2, plateau - 2, plateau),
    bar(startTime + 5 * HOUR_MS, plateau, plateau + 2, plateau - 2, plateau),
    bar(startTime + 6 * HOUR_MS, plateau, plateau + 2, plateau - 2, plateau),
  ];
}

export function fractalSwingLowSequence(startTime: number): Bar[] {
  return fractalSwingLowSequenceAt(startTime, 5000);
}

/** Flat bars so chained fractal sequences do not create boundary pivots. */
function neutralHighPadding(startTime: number, count: number): Bar[] {
  return Array.from({ length: count }, (_, index) =>
    bar(startTime + index * HOUR_MS, 5085, 5087, 5083, 5085),
  );
}

function neutralLowPadding(startTime: number, count: number): Bar[] {
  return Array.from({ length: count }, (_, index) =>
    bar(startTime + index * HOUR_MS, 5015, 5017, 5015, 5015),
  );
}

export function chainedSwingHighSequences(
  firstStart: number,
  firstPeak: number,
  secondPeak: number,
): Bar[] {
  const first = fractalSwingHighSequence(firstStart, firstPeak);
  const paddingStart = firstStart + first.length * HOUR_MS;
  const secondStart = paddingStart + 7 * HOUR_MS;
  return [
    ...first,
    ...neutralHighPadding(paddingStart, 7),
    ...fractalSwingHighSequence(secondStart, secondPeak),
  ];
}

export function chained4hSwingHighSequences(
  firstStart: number,
  firstPeak: number,
  secondPeak: number,
): Bar[] {
  const first = fractalSwingHighSequence(firstStart, firstPeak).map((b, index) => ({
    ...b,
    time: firstStart + index * FOUR_HOUR_MS,
  }));
  const paddingStart = firstStart + first.length * FOUR_HOUR_MS;
  const secondStart = paddingStart + 7 * FOUR_HOUR_MS;
  return [
    ...first,
    ...neutralHighPadding(paddingStart, 7).map((b, index) => ({
      ...b,
      time: paddingStart + index * FOUR_HOUR_MS,
    })),
    ...fractalSwingHighSequence(secondStart, secondPeak).map((b, index) => ({
      ...b,
      time: secondStart + index * FOUR_HOUR_MS,
    })),
  ];
}

export function chainedSwingLowSequences(
  firstStart: number,
  firstTrough: number,
  secondTrough: number,
): Bar[] {
  const first = fractalSwingLowSequenceAt(firstStart, firstTrough);
  const paddingStart = firstStart + first.length * HOUR_MS;
  const secondStart = paddingStart + 7 * HOUR_MS;
  return [
    ...first,
    ...neutralLowPadding(paddingStart, 7),
    ...fractalSwingLowSequenceAt(secondStart, secondTrough),
  ];
}
