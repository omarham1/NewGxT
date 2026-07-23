# ADR-0005: 2-Stage SMT and Strength Switch Validation Protocol

## Status
Accepted

## Context
In the GxT trading strategy, we need to mechanically validate true reversals and filter out false SMT deviations (fake-outs). Previously, the indicator used geometric definitions ("Roof" and "Inverted Roof") which were difficult to generalize.

We are replacing those patterns with a unified **2-Stage SMT** protocol. Stage 2 is **structural confirmation** on Intermediate Timeframe (ITF). Lower Timeframe (LTF) C2/C3/CISD is **entry after Stage 2** — not part of the Stage 2 definition. The undefined label **IMT** is not used; timeframe bands follow ADR-0004 (HTF / ITF / LTF).

## Decision
We establish the following mechanical rules for identifying and validating a **2-Stage SMT**:

1. **Stage 1: HTF / Large Range Confirmation**:
   - The sequence begins when price interacts with a Higher Timeframe or Intermediate Timeframe (HTF/ITF) level (e.g., [PDH/PDL](../../CONTEXT.md), POI, or FVG).
   - We must observe an initial SMT divergence between correlated assets (e.g., Asset A sweeps the level, while Asset B fails to sweep/reaches it and stalls).

2. **Stage 2: ITF Structural Confirmation** (either path completes Stage 2):
   - Upon observing Stage 1 SMT, monitor ITF at that turning point. Do **not** use LTF (`15m` / `5m` / `3m` / `1m`) as Stage 2.
   - **Path A — Second SMT / alternating roles:** On `30m` / `1H` / `90m` only (not `4H`). The previously lagging asset (Asset B) drives through and sweeps its own previous swing high/low, while the previously leading asset (Asset A) holds a higher low (bullish reversal) or lower high (bearish reversal). Roles of lead and lag reverse.
   - **Path B — Strength Switch PSP (SS PSP):** Opposite-polarity closes on full ITF — `4H` / `90m` / `1H` / `30m` — after Stage 1 SMT. The asset that swept closes in the reversal direction while the correlated asset closes in the trend direction ([SS PSP](../../CONTEXT.md)). A `4H` SS PSP can complete Stage 2. Path B alone completes Stage 2; alternating sweep is not required.
   - Either Path A or Path B locks the strength switch structurally. Both are not required.

3. **Entry (after Stage 2)**:
   - Drop to **LTF** (`15m` / `5m` / `3m` / `1m`) for the execution trigger.
   - Entry requires LTF [C2](../../CONTEXT.md) or [C3](../../CONTEXT.md) closure, or [CISD](../../CONTEXT.md), on **any** triad asset — prioritizing the one closest to its open [DOL](../../CONTEXT.md).
   - Entry is not part of the Stage 2 definition; a simple LTF C2/C3 without Stage 2 does not confirm a full reversal.

4. **Triad Asset Participation and Synergy Filter**:
   - The 2-Stage SMT is validated if **any two** of the three assets in the triad (e.g., ES and NQ) complete the Stage 1 → Stage 2 sequence.
   - We apply a **Synergy Filter** on the third asset (e.g., YM): the setup is invalid if the third asset is actively expanding in the opposite direction (e.g., making fresh highs while ES and NQ are confirming a bullish reversal).

## Consequences
- We replace visual/geometric Roof patterns with a clean HTF/ITF structural gate, then LTF entry.
- SS PSP alone can complete Stage 2 on full ITF (including `4H`), matching Garrett strength-switch practice and ADR-0004 PSP closes.
- Path A second SMT stays on the smaller Stage-2 SMT band (`30m` / `1H` / `90m`), consistent with smaller-range confirmation examples (e.g. daily → 90m).
- Programmatic indicator code should track Stage 1 HTF/ITF SMT, then wait for Path A or Path B before treating the reversal as structurally confirmed; LTF C2/C3/CISD gates the signal for entry.
