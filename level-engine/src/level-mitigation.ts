import type { Bar } from "./types.js";

export type LevelCrossKind = "high" | "low";

export function findLevelCrossTime(
  kind: LevelCrossKind,
  price: number,
  activeSince: number,
  mitigationBars: Bar[],
  asOf: number,
  options: { activeInclusive?: boolean } = {},
): number | undefined {
  const activeInclusive = options.activeInclusive ?? false;
  let earliest: number | undefined;

  for (const bar of mitigationBars) {
    if (activeInclusive ? bar.time < activeSince : bar.time <= activeSince) {
      continue;
    }

    if (bar.time > asOf) {
      continue;
    }

    const crossed =
      kind === "high" ? bar.high >= price : bar.low <= price;
    if (!crossed) {
      continue;
    }

    if (earliest === undefined || bar.time < earliest) {
      earliest = bar.time;
    }
  }

  return earliest;
}
