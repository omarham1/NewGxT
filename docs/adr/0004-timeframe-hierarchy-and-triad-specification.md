# ADR-0004: Timeframe Hierarchy and Triad Specification

## Status
Accepted

## Context
To build a fully mechanical multi-timeframe trading system and indicator (such as the GxT Correlated Asset Indicator), we must establish a clear hierarchy of timeframes and define the default asset triads.

Prior documentation mentioned "execution timeframe" and "lower/higher high-timeframes" but lacked specific duration mappings. Additionally, while the strategy uses cross-asset correlation, the exact assets under analysis were not explicitly defined.

## Decision
We define the following rules and configurations for timeframe mapping and asset triad focus:

1. **Timeframe Hierarchy**:
   - **Higher Timeframe (HTF) - Bias Formation**: Monthly (`1M`), Weekly (`1W`), and Daily (`1D`). These timeframes are used to establish the overall market bias and locate major key structural levels ([PDH/PDL](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L11), [PWH/PWL](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L15)).
   - **Intermediate Timeframe (ITF) - Structural Validation**: 4-Hour (`4H`), 90-Minute (`90m`), 1-Hour (`1H`), and 30-Minute (`30m`). These timeframes are used for identifying intermediate structures, tracking POIs (such as HTF FVGs), and analyzing [Precision Swing Points (PSP)](../../CONTEXT.md) on full-ITF closes. Stage 2 **Path B (SS PSP)** uses that same full-ITF band (including `4H`) per [ADR-0005](0005-2-stage-smt-and-strength-switch.md). Stage 2 **Path A (second SMT)** uses only `30m` / `1H` / `90m` — not `4H`.
   - **Lower Timeframe (LTF) - Execution & Entry**: 15-Minute (`15m`), 5-Minute (`5m`), 3-Minute (`3m`), and 1-Minute (`1m`). These timeframes are used for entry triggers, [CISD](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L56) confirmations, [C2](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L64)/[C3](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L69) closures, and expansion leg calculations. SMT Divergence for Stage 1 lives on HTF/ITF ([ADR-0005](0005-2-stage-smt-and-strength-switch.md)); LTF does not redefine Stage 1 or Stage 2.

2. **Asset Triad Specification**:
   - The primary asset triad for the indicator and strategy is the **US Stock Index Futures Triad**:
     - **ES**: E-mini S&P 500 Futures (Lead or Lagging Asset)
     - **NQ**: E-mini Nasdaq 100 Futures (Lead or Lagging Asset)
     - **YM**: E-mini Dow Jones Futures (Lead or Lagging Asset)
   - While the indicator will focus on this index futures triad, the underlying logic of correlation, SMT tracking, and strength rotation remains fully transferable to other highly correlated asset groups (e.g., Forex triads like `EURUSD`, `GBPUSD`, `DXY` or Crypto triads like `BTC`, `ETH`, `SOL`).

## Consequences
- The indicator and dashboard will map calculations (e.g., [SMT Fill](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L27) and [PSP](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L44)) directly onto these designated timeframe bands.
- We establish a clear reference for back-testing and indicator inputs, defining which timeframe ranges are processed for bias vs. execution.
