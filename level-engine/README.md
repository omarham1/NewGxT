# Level Engine

Pure TypeScript modules that compute GxT indicator levels from OHLC fixtures. Pine Script rendering lives in `../pine/`.

## Commands

```bash
npm test          # run fixture tests once
npm run test:watch
```

## Modules

- **Session Calendar** — CME daily (18:00–17:00 ET) and weekly (Sun 18:00–Fri 17:00 ET) session grouping
- **Session Rails** — PDH, PDL, PWH, PWL, and 18:00 Daily Open from session-grouped bars; PD/PW rails mitigate on 1m wick cross after session/week open (gray truncated line for remainder of session or week)
- **Session Context** — ADR band (open ± ADR, consumption %), PD Equilibrium Range (25%–75% of PD wick-to-wick)
- **HTF FVG** — wick-based three-candle gaps on 4H and 1H (candle 1 high to candle 3 low for bullish); mitigation on zone entry; only gaps formed during the current or immediately previous CME week are eligible (Sunday 18:00 ET through Friday 17:00 ET, expiring at each Sunday 18:00 ET roll)
- **HTF Swing Points** — strict fractal(3) pivot highs and lows on 4H and 1H; only swings whose formation time falls in the current or previous CME week and whose price lies within the combined previous-week (PWH/PWL) and current-week range are drawn; mitigation on 1m wick cross after fractal confirmation; mitigated swings stay in the snapshot for the current CME session with `mitigatedAt` set (canvas history); swings mitigated in prior sessions are excluded
- **Session POI Selector** — directional path at 18:00 ET: 4H FVG in PD Equilibrium Range, else 1H, else defer to live HTF swing; tie-break highest timeframe first, then nearest to current price
- **Level Snapshot** — session context plus unmitigated HTF FVGs, visible HTF swing points, and `sessionPoi` when `dailyBias: "directional"` is supplied

## Public API

```typescript
import {
  computeLevelSnapshot,
  computeSessionContext,
  computeSessionRails,
  computeHtfFvgs,
  computeHtfSwingPoints,
  isWithinHtfFvgLookback,
  type Bar,
} from "@gxt/level-engine";

const context = computeSessionContext(bars);
// { pdh, pdl, pwh, pwl, dailyOpen, adr, openPlusAdr, openMinusAdr, adrConsumptionPct, pdEquilibriumLow, pdEquilibriumHigh }

const rails = computeSessionRails(bars);
// { pdh, pdl, pwh, pwl, dailyOpen }

const snapshot = computeLevelSnapshot({
  bars,
  bars4h,
  bars1h,
  mitigationBars,
  dailyBias: "directional",
});
// SessionContext + { htfFvgs, htfSwingPoints, sessionPoi }

const fvgs = computeHtfFvgs({ bars4h, bars1h, mitigationBars, asOf: latestBarTime });
// asOf anchors the two-week formation lookback (typically the latest supplied bar time)

const swings = computeHtfSwingPoints({
  bars4h,
  bars1h,
  mitigationBars,
  pwh: context.pwh,
  pwl: context.pwl,
  currentWeekHigh: currentWeek.high,
  currentWeekLow: currentWeek.low,
  asOf: latestBarTime,
});
// Unmitigated swings omit mitigatedAt; session-mitigated swings include mitigatedAt (crossing bar open)
```
