export const ADR_LOOKBACK = 14;
export const CME_SESSION_MS = 86_400_000;
const PINE_BAR_TIME_SEARCH_CEILING = 4_999;

export function adrLookbackBarCap(timeframeSeconds: number): number {
  return Math.ceil(
    (ADR_LOOKBACK * CME_SESSION_MS) / (timeframeSeconds * 1000),
  );
}

export function barTimeSearchMax(calcBarsCount: number): number {
  return Math.min(PINE_BAR_TIME_SEARCH_CEILING, calcBarsCount - 1);
}

export function barIndexForTime(input: {
  bars: { time: number }[];
  barIndex: number;
  targetTime: number;
  barTimeSearchMax: number;
  timeframeSeconds: number;
}): number {
  const { bars, barIndex, targetTime, barTimeSearchMax, timeframeSeconds } =
    input;
  const time = bars[barIndex]?.time ?? 0;
  const timeClose = time + timeframeSeconds * 1000;
  let result = barIndex;

  if (targetTime > timeClose) {
    const msPerBar = timeframeSeconds * 1000;
    result = barIndex + Math.ceil((targetTime - time) / msPerBar);
  } else if (targetTime >= time) {
    result = barIndex;
  } else {
    const maxI = Math.min(barIndex, barTimeSearchMax);
    let found = false;
    for (let i = 0; i <= maxI; i++) {
      const barTime = bars[barIndex - i]?.time;
      const prevBarTime =
        i === 0 ? Number.POSITIVE_INFINITY : bars[barIndex - i + 1]?.time;
      const inBar =
        barTime <= targetTime && (i === 0 || targetTime < prevBarTime);
      if (inBar) {
        result = barIndex - i;
        found = true;
        break;
      }
    }
    if (!found) {
      result = barIndex - maxI;
    }
  }

  return result;
}
