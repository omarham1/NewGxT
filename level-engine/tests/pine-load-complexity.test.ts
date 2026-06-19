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
  /** Cross-TF align runs on swing-add / retroactive failure-stamp events, not every bar. */
  swingAlignEvents?: number;
  /** FVG concat copy runs when 4H/1H POI FVG pools mutate, not every chart bar. */
  fvgLifecycleEvents?: number;
}) {
  const {
    chartBars,
    oneMinBarsPerChartBar,
    activeSwings,
    activeFvgs,
    drawLevels,
    swingAlignEvents = 0,
    fvgLifecycleEvents = 0,
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
    swingAlignEvents * activeSwings * activeSwings * WEIGHT.crossTfAlignInner;
  const fvgConcatCopy =
    fvgLifecycleEvents * activeFvgs * WEIGHT.arrayCopy;
  const drawOriginScans = 0;
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

  it("models draw-time origin scans as eliminated after bar-index caching (#27)", () => {
    const { breakdown } = estimateLoadUnits({
      chartBars: 10_000,
      oneMinBarsPerChartBar: 15,
      ...assumptions,
    });

    expect(breakdown.drawOriginScans).toBe(0);
  });

  it("caches session rail bar indices at origin and mitigation instead of draw-time scan", () => {
    const source = readPineSource();

    expect(source).toMatch(/var int pdhOriginBi/);
    expect(source).toMatch(/var int pdhMitigatedBi/);
    expect(source).toMatch(/var int dailyOpenOriginBi/);
    expect(source).not.toContain("f_bar_index_for_time(origin_time)");
    expect(source).not.toContain("f_bar_index_for_time(mitigated_time)");
  });

  it("caches HTF swing formed and mitigated bar indices at lifecycle events", () => {
    const source = readPineSource();

    expect(source).toMatch(/type HtfSwingLevel[\s\S]*?int formedBi/);
    expect(source).toMatch(/type HtfSwingLevel[\s\S]*?int mitigatedBi/);
    expect(source).toContain(
      "f_bar_index_for_time(resolvedFormedTime)",
    );
    expect(source).toContain("f_bar_index_for_time(checkTime)");
    expect(source).not.toContain(
      "f_bar_index_for_time(swing.formedTime)",
    );
    expect(source).not.toContain(
      "f_bar_index_for_time(swing.mitigatedTime)",
    );
  });

  it("caches HTF FVG formed bar index at zone creation instead of draw-time scan", () => {
    const source = readPineSource();

    expect(source).toMatch(/type HtfFvgZone[\s\S]*?int formedBi/);
    expect(source).toContain("f_bar_index_for_time(formedTime)");
    expect(source).not.toContain("f_bar_index_for_time(zone.formedTime)");
  });

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

  it("gates cross-TF swing alignment to swing-add events in source", () => {
    const source = readPineSource();

    expect(source).toContain("f_align_cross_tf_swing_prices(");
    expect(source).toMatch(
      /f_try_add_swing\([\s\S]*?f_align_cross_tf_swing_prices\(/,
    );
    expect(source).not.toMatch(
      /f_try_add_swing\([\s\S]*?\nactiveSwings := f_align_cross_tf_swing_prices/,
    );
  });

  it("caches merged POI FVG pool and only concatenates on lifecycle mutations (#28)", () => {
    const source = readPineSource();

    expect(source).toMatch(/var array<HtfFvgZone> allPoiFvgs/);
    expect(source).toMatch(
      /f_advance_fvg_lifecycle\([\s\S]*?poiFvgsDirty/,
    );
    expect(source).toMatch(
      /if poiFvgsDirty[\s\S]*?allPoiFvgs := f_concat_fvg_arrays\(/,
    );
    expect(source).not.toMatch(
      /allPoiFvgs = f_concat_fvg_arrays\(poiFvgs4h, poiFvgs1h\)/,
    );
  });

  it("models FVG concat copy cost near zero on steady-state bars", () => {
    const chartBars = 10_000;
    const fvgMutationsPerHistory = 120;

    const legacyConcat =
      chartBars * assumptions.activeFvgs * WEIGHT.arrayCopy;
    const { breakdown } = estimateLoadUnits({
      chartBars,
      oneMinBarsPerChartBar: 15,
      fvgLifecycleEvents: fvgMutationsPerHistory,
      ...assumptions,
    });

    expect(breakdown.fvgConcatCopy).toBeLessThan(legacyConcat / 50);
    expect(breakdown.fvgConcatCopy / chartBars).toBeLessThan(2);
    expect(fvgMutationsPerHistory).toBeLessThan(chartBars / 50);
  });

  it("models cross-TF alignment cost near zero on steady-state bars", () => {
    const chartBars = 10_000;
    const swings = assumptions.activeSwings;
    const swingAddsPerHistory = 60;

    const { total, breakdown } = estimateLoadUnits({
      chartBars,
      oneMinBarsPerChartBar: 15,
      swingAlignEvents: swingAddsPerHistory,
      ...assumptions,
    });

    const perBarCrossTfShare = breakdown.crossTfAlign / chartBars;
    const steadyStateCrossTfShare = breakdown.crossTfAlign / total;

    expect(perBarCrossTfShare).toBeLessThan(500);
    expect(steadyStateCrossTfShare).toBeLessThan(0.02);
    expect(swingAddsPerHistory).toBeLessThan(chartBars / 100);
  });

  it("models per-bar 1m work as larger than session-end draw cache win", () => {
    const { total, breakdown } = estimateLoadUnits({
      chartBars: 10_000,
      oneMinBarsPerChartBar: 15,
      ...assumptions,
    });

    const perBarHotspots =
      breakdown.requestSecurityLowerTf + breakdown.swingSweepLoop;

    const drawHotspots =
      breakdown.drawOriginScans + breakdown.sessionEndScan;

    expect(perBarHotspots / total).toBeGreaterThan(0.54);
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
