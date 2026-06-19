import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const pinePath = join(repoRoot, "pine/gxt-correlated-asset-indicator.pine");

/** Rough relative weights from Pine runtime behaviour (higher = more expensive). */
const WEIGHT = {
  requestSecurity: 1_000,
  requestSecurityLowerTf: 5_000,
  barIndexScan: 50,
  oneMinInnerLoop: 1,
  swingSweepInner: 2,
  crossTfAlignInner: 3,
  arrayCopy: 5,
} as const;

const BAR_TIME_SEARCH_MAX = 4_999;

function readPineSource(): string {
  return readFileSync(pinePath, "utf-8");
}

function estimateLoadUnits(input: {
  chartBars: number;
  oneMinBarsPerChartBar: number;
  activeSwings: number;
  activeFvgs: number;
  drawLevels: number;
}) {
  const {
    chartBars,
    oneMinBarsPerChartBar,
    activeSwings,
    activeFvgs,
    drawLevels,
  } = input;

  const requestSecurity = chartBars * 3 * WEIGHT.requestSecurity;
  const requestSecurityLowerTf =
    chartBars * WEIGHT.requestSecurityLowerTf +
    chartBars * oneMinBarsPerChartBar * WEIGHT.oneMinInnerLoop;
  const railMitigationLoop = 0;
  const swingSweepLoop =
    chartBars *
    oneMinBarsPerChartBar *
    Math.max(activeSwings, 1) *
    WEIGHT.swingSweepInner;
  const crossTfAlign =
    chartBars * activeSwings * activeSwings * WEIGHT.crossTfAlignInner;
  const fvgConcatCopy = chartBars * activeFvgs * WEIGHT.arrayCopy;
  const drawOriginScans =
    (activeSwings + activeFvgs + drawLevels) *
    BAR_TIME_SEARCH_MAX *
    WEIGHT.barIndexScan;
  const sessionEndScan = BAR_TIME_SEARCH_MAX * WEIGHT.barIndexScan;

  const breakdown = {
    requestSecurity,
    requestSecurityLowerTf,
    railMitigationLoop,
    swingSweepLoop,
    crossTfAlign,
    fvgConcatCopy,
    drawOriginScans,
    sessionEndScan,
  };

  const total = Object.values(breakdown).reduce((sum, n) => sum + n, 0);
  return { total, breakdown };
}

function share(breakdown: Record<string, number>, key: string, total: number) {
  return ((breakdown[key] ?? 0) / total) * 100;
}

describe("pine load complexity model", () => {
  const assumptions = {
    activeSwings: 40,
    activeFvgs: 30,
    drawLevels: 8,
  };

  it("documents that opts #20 and #24 left major per-bar hotspots in source", () => {
    const source = readPineSource();

    expect(source).toMatch(/var int sessionEndBi/);
    expect(source.match(/request\.security\(/g)?.length ?? 0).toBe(3);
    expect(source).toContain("request.security_lower_tf(");
    expect(source).not.toMatch(/for mi = 0 to oneMinBarCount - 1/);
    expect(source).toMatch(/out_pdh_mitigated/);
    expect(source).toContain("f_align_cross_tf_swing_prices(");
    expect(source).toContain("f_sweep_swings_from_1m_bars(");
    expect(source).toContain("max_bars_back(time, BAR_TIME_SEARCH_MAX + 1)");
  });

  it("models per-bar 1m work plus cross-TF alignment as larger than session-end draw cache win", () => {
    const { total, breakdown } = estimateLoadUnits({
      chartBars: 10_000,
      oneMinBarsPerChartBar: 15,
      ...assumptions,
    });

    const perBarHotspots =
      breakdown.requestSecurityLowerTf +
      breakdown.swingSweepLoop +
      breakdown.crossTfAlign;

    const drawHotspots =
      breakdown.drawOriginScans + breakdown.sessionEndScan;

    expect(perBarHotspots / total).toBeGreaterThan(0.55);
    expect(perBarHotspots).toBeGreaterThan(drawHotspots * 2);
    expect(breakdown.railMitigationLoop).toBe(0);
  });

  it("models rail mitigation on aligned 1m security instead of per-chart-bar inner loop", () => {
    const chartBars = 10_000;
    const oneMinPerChart = 15;

    const legacyRailLoop =
      chartBars * oneMinPerChart * WEIGHT.oneMinInnerLoop;
    const { breakdown } = estimateLoadUnits({
      chartBars,
      oneMinBarsPerChartBar: oneMinPerChart,
      ...assumptions,
    });

    expect(legacyRailLoop).toBe(150_000);
    expect(breakdown.railMitigationLoop).toBe(0);
  });

  it("models aligned 1m security as materially cheaper than security_lower_tf path", () => {
    const chartBars = 10_000;
    const swings = assumptions.activeSwings;

    const lowerTfPath =
      chartBars * WEIGHT.requestSecurityLowerTf +
      chartBars * 15 * WEIGHT.oneMinInnerLoop +
      chartBars * 15 * swings * WEIGHT.swingSweepInner;

    const alignedOneMinPath =
      chartBars * WEIGHT.requestSecurity +
      chartBars * 1 * WEIGHT.oneMinInnerLoop +
      chartBars * 1 * swings * WEIGHT.swingSweepInner;

    expect(alignedOneMinPath).toBeLessThan(lowerTfPath / 5);
  });
});
