# ADR-0005: 2-Stage SMT and Strength Switch Validation Protocol

## Status
Accepted

## Context
In the GxT trading strategy, we need to mechanically validate true reversals and filter out false SMT deviations (fake-outs). Previously, the indicator used geometric definitions ("Roof" and "Inverted Roof") which were difficult to generalize. 

We are replacing those patterns with a unified **2-Stage SMT** protocol. This model formalizes the transition from higher-timeframe (HTF) context to lower-timeframe (LTF) execution, ensuring a confirmed institutional strength switch occurs before executing a reversal.

## Decision
We establish the following mechanical rules for identifying and validating a **2-Stage SMT**:

1. **Stage 1: HTF / Large Range Confirmation**:
   - The sequence begins when price interacts with a Higher Timeframe or Intermediate Timeframe (HTF/ITF) level (e.g., [PDH/PDL](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L11), POI, or FVG).
   - We must observe an initial SMT divergence between correlated assets (e.g., Asset A sweeps the level, while Asset B fails to sweep/reaches it and stalls).

2. **Stage 2: LTF / Small Range Confirmation**:
   - Upon observing the Stage 1 SMT, we monitor the Lower Timeframe (LTF: `15m`, `5m`, `3m`, `1m`) at that turning point.
   - **The Break and Switch (Alternating Sweep)**: The lagging asset (Asset B, which initially failed to break the key level in Stage 1) drives through and sweeps its own previous swing high/low. Simultaneously, the leading asset (Asset A, which swept in Stage 1) must hold a higher low (for bullish reversals) or lower high (for bearish reversals). This creates an alternating sweep where the roles of lead and lagging asset reverse.
   - **The Structural Shift (Strength Switch)**: This alternating sweep is confirmed when **any** of the assets in the triad confirms a LTF [C2](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L64) or [C3](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L69) closure, mathematically locking in a mechanical swing point. The closure does **not** need to be printed by the lagging asset specifically; it can be printed by any asset in the triad, prioritizing the one closest to its open [DOL](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L74).
   - Once the [C2](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L64) or [C3](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L69) closure is confirmed, the reversal is validated, and entry is triggered on the very next candle.

3. **Triad Asset Participation and Synergy Filter**:
   - The 2-Stage SMT is validated if **any two** of the three assets in the triad (e.g., ES and NQ) complete the sequence.
   - We apply a **Synergy Filter** on the third asset (e.g., YM): the setup is invalid if the third asset is actively expanding in the opposite direction (e.g., making fresh highs while ES and NQ are confirming a bullish reversal).

## Consequences
- We replace visual/geometric Roof patterns with a clean, programmatic HTF-to-LTF state transition.
- Programmatic indicator code in Pine Script will track the state of the HTF sweep and wait for the LTF alternating sweep and [C2](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L64) or [C3](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L69) closure confirmation on any asset in the triad before displaying buy/sell signals.
