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

import {
  adrLookbackBarCap,
  barTimeSearchMax as replayBarTimeSearchMax,
} from "./helpers/pine-replay-history.js";

/** Pine CE ceiling; on coarse TFs the ADR lookback window is smaller. */
function barTimeSearchMaxForTimeframe(timeframeSeconds: number): number {
  return replayBarTimeSearchMax(adrLookbackBarCap(timeframeSeconds));
}

function readPineSource(): string {
  return readFileSync(pinePath, "utf-8");
}

function sessionRailsWithEndBody(source: string): string {
  const start = source.indexOf("f_session_rails_with_end() =>");
  expect(start).toBeGreaterThanOrEqual(0);
  const end = source.indexOf("\n\n[", start);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end);
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
  const requestSecurityLowerTf = chartBars * WEIGHT.requestSecurityLowerTf;
  const railMitigationLoop = 0;
  const swingSweepLoop =
    chartBars * oneMinBarsPerChartBar * activeSwings * WEIGHT.swingSweepInner;
  const crossTfAlign =
    swingAlignEvents * activeSwings * activeSwings * WEIGHT.crossTfAlignInner;
  const fvgConcatCopy =
    fvgLifecycleEvents * activeFvgs * WEIGHT.arrayCopy;
  const drawOriginScans = 0;
  const sessionEndScan =
    barTimeSearchMaxForTimeframe(60) * WEIGHT.barIndexScan;

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

  it("caches HTF swing formed and mitigated bar indices at lifecycle mutation", () => {
    const source = readPineSource();

    expect(source).toMatch(/type HtfSwingLevel[\s\S]*?int formedBi/);
    expect(source).toMatch(/type HtfSwingLevel[\s\S]*?int mitigatedBi/);
    expect(source).toContain("f_bar_index_for_time(resolvedFormedTime)");
    expect(source).toContain("f_bar_index_for_time(checkTime)");
    expect(source).not.toContain("f_remap_swing_bar_indices(");
    expect(source).not.toContain("engineSwings");
  });

  it("caches HTF FVG formed bar index at zone creation instead of draw-time scan", () => {
    const source = readPineSource();

    expect(source).toMatch(/type HtfFvgZone[\s\S]*?int formedBi/);
    expect(source).toContain("f_bar_index_for_time(formedTime)");
    expect(source).not.toContain("f_bar_index_for_time(zone.formedTime)");
  });

  it("documents 1m session rails security and chart-path swing sweep (#31)", () => {
    const source = readPineSource();

    expect(source).toMatch(/var int sessionEndBi/);
    let topLevelSecurityCalls = 0;
    for (const line of source.split("\n")) {
      if (/= request\.security\(/.test(line)) {
        const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
        if (indent <= 1) {
          topLevelSecurityCalls++;
        }
      }
    }
    expect(topLevelSecurityCalls).toBe(3);
    expect(source.match(/request\.security\(/g)?.length ?? 0).toBe(3);
    expect(source).not.toContain("request.security_lower_tf(");
    expect(source).not.toMatch(/for mi = 0 to oneMinBarCount - 1/);
    expect(source).toMatch(/out_pdh_mitigated/);
    expect(source).toMatch(
      /"1",[\s\S]*f_session_rails_with_end\(\)/,
    );
    expect(source).not.toMatch(/f_structural_engine_with_end\(/);
    expect(source).not.toContain("publishedSwings");
    expect(source).toContain("f_align_cross_tf_swing_prices(");
    expect(source).not.toContain("f_sweep_swings_from_1m_bars(");
    expect(source).not.toContain("chartIs1m");
    expect(source).toContain("max_bars_back(time, 5000)");
    expect(source).toMatch(
      /BAR_TIME_SEARCH_MAX\s*=\s*math\.min\(PINE_BAR_TIME_SEARCH_CEILING,\s*session_bar_cap\s*-\s*1\)/,
    );
  });

  it("gates cross-TF swing alignment to swing-add events in source", () => {
    const source = readPineSource();

    expect(source).toContain("f_align_cross_tf_swing_prices(");
    expect(source).toMatch(
      /f_try_add_swing\([\s\S]*?f_align_cross_tf_swing_prices\(/,
    );
    expect(source).not.toMatch(
      /if engineSwingsDirty[\s\S]*?f_align_cross_tf_swing_prices/,
    );
  });

  it("rejects swing inventory inside 1m request.security replay (memory regression)", () => {
    const source = readPineSource();
    const railsBody = sessionRailsWithEndBody(source);

    expect(source).not.toContain("engineSwings");
    expect(railsBody).not.toContain("f_sweep_swings(");
    expect(railsBody).not.toContain("f_try_add_swing(");
    expect(railsBody).not.toContain("var array<HtfSwingLevel>");
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

  it("models chart-path swing sweep via security_lower_tf on coarse execution TFs", () => {
    const chartBars = 10_000;
    const oneMinPerChart = 15;

    const { breakdown } = estimateLoadUnits({
      chartBars,
      oneMinBarsPerChartBar: oneMinPerChart,
      ...assumptions,
    });

    expect(breakdown.requestSecurityLowerTf).toBeGreaterThan(0);
    expect(breakdown.swingSweepLoop).toBe(
      chartBars * oneMinPerChart * assumptions.activeSwings * WEIGHT.swingSweepInner,
    );
    expect(breakdown.requestSecurity).toBeGreaterThan(0);
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

  it("models 1m chart native sweep as cheaper than coarse-TF security_lower_tf fanout", () => {
    const chartBars = 10_000;
    const swings = assumptions.activeSwings;

    const coarseTfPath =
      chartBars * WEIGHT.requestSecurityLowerTf +
      chartBars * 15 * WEIGHT.oneMinInnerLoop +
      chartBars * 15 * swings * WEIGHT.swingSweepInner;

    const native1mSweepPath = chartBars * 1 * swings * WEIGHT.swingSweepInner;

    expect(native1mSweepPath).toBeLessThan(coarseTfPath / 10);
  });
});
