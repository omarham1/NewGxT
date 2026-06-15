# Level Engine

Pure TypeScript modules that compute GxT indicator levels from OHLC fixtures. Pine Script rendering lives in `../pine/`.

## Commands

```bash
npm test          # run fixture tests once
npm run test:watch
```

## Modules

- **Session Calendar** — CME daily (18:00–17:00 ET) and weekly (Sun 18:00–Fri 17:00 ET) session grouping
- **Session Rails** — PDH, PDL, PWH, PWL, and 18:00 Daily Open from session-grouped bars
- **Session Context** — ADR band (open ± ADR, consumption %), PD Equilibrium Range (25%–75% of PD wick-to-wick)

## Public API

```typescript
import { computeSessionContext, computeSessionRails, type Bar } from "@gxt/level-engine";

const context = computeSessionContext(bars);
// { pdh, pdl, pwh, pwl, dailyOpen, adr, openPlusAdr, openMinusAdr, adrConsumptionPct, pdEquilibriumLow, pdEquilibriumHigh }

const rails = computeSessionRails(bars);
// { pdh, pdl, pwh, pwl, dailyOpen }
```
