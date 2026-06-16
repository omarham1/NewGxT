# ADR-0003: Daily Bias and Target Selection Framework

## Status
Accepted

## Context
Determining the correct daily bias (Bullish, Bearish, or Neutral) and target selection (Draw on Liquidity) is essential for executing the GxT Strength Switching Strategy. We need a systematic, mechanical framework to define daily bias at the CME daily session open (18:00) based on the Previous Day (PD) profile, and to determine when to target the Daily Open versus the opposite daily extreme.

## Decision
We establish the following rules for establishing daily bias and selecting targets:

1. **Pre-Session Bias Establishment (18:00 CME Daily Open)**:
   - **Expansion or Reversal Days**: We set and maintain a **Directional Bias** in the direction of the expansion/reversal.
     - **POI Selection**: Check for a 4H FVG within the 50% equilibrium range of the Previous Day. If none is found, check for a 1H FVG within the 50% range. If a FVG is present, this is the Point of Interest (POI) where we anticipate the daily wick to form.
     - **No FVG Scenario**: If no 4H or 1H FVG exists in the 50% PD range, we still maintain the directional bias but wait for price to create a new **Relevant Level** (swing point) and manipulate it.
   - **Consolidation / Failure Swing Days**: We set a **Neutral Bias**. We wait for price to sweep the previous day's range boundaries ([PDH/PDL](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L11)) and confirm a **Strength Switch (SS)** to trade the reversal back into the range.

2. **Intraday Bias Shifts and Validation**:
   - **Reversal Confirmation**: Reversal bias is confirmed only when price interacts with a Relevant Level or POI and confirms a full **2-Stage SMT/SS** (Stage 1 HTF SMT + Stage 2 LTF alternating sweep + [C2](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L64) or [C3](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L69) closure). A simple LTF [C2](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L64) or [C3](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L69) closure is not sufficient on its own.
   - **Fallback: Aggressive Reversal (No 2-Stage SMT)**: If price reverses aggressively from a POI and leaves new ITF FVGs (`30m`/`1h`/`90m`) in the reversal direction, we transition to a continuation bias in that reversal direction. Entry is triggered when price retraces into the new ITF FVG, creating an **ITF FVG SMT Fill** and a subsequent LTF [Change in the State of Delivery (CISD)](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L56) confirmation (LTF candle body-closing past the CSD level).
   - **Dual-Path Continuation Rules (No Reversal)**: If price interacts with a Relevant Level and fails to manipulate or reverse (failing to confirm a 2-Stage SMT/SS), the bias transitions to a **Continuation Bias** in the direction of the trend via one of two paths:
     - **[Catch-Up Play](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L78) (to the High/Low)**: When a stronger asset (e.g., NQ) reaches its [PDH/PDL](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L11) but stalls or consolidates, and a lagging asset (e.g., ES/YM) has not reached its equivalent high/low yet, we trade the lagging asset up to its own high/low target. This is triggered by an ITF FVG (`30m`/`1h`/`90m`) SMT Fill on the lagging asset and a LTF [CISD](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L56) confirmation.
     - **[Continuation Play](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L82) (beyond the High/Low)**: If the stronger asset expands past the high/low level, we trade it to the next Higher Timeframe [DOL](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L74) (if within the ADR limit), triggered by an ITF FVG (`30m`/`1h`/`90m`) SMT Fill on any asset and a LTF [CISD](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L56) confirmation.
   - **Reversal Catch-Up Exclusion**: We explicitly avoid trading a reversal catch-up play on a lagging asset while the stronger asset is consolidating at the high/low. Because the assets are highly correlated, we require a full 2-Stage SMT/SS to confirm any reversal before executing.
   - **Invalidation**: The bias is invalidated if price closes past the absolute swing extreme of the sweep leg. If this occurs, the bias flips to a **Continuation Bias** in the direction of the break.

3. **Target Selection Protocol (Draw on Liquidity)**:
   - **TP1 (Primary Target)**: **Nearest Relevant Level** in bias direction (unmitigated HTF structure → PDH/PDL → PWH/PWL).
     - *Default*: The closest structural magnet ahead of current price.
   - **TP1 Reversal-Day Override**: **18:00 Daily Open** per [ADR-0008](0008-reversal-day-tp1-override.md) when reversal is confirmed, ADR consumption ≥ 80%, and Daily Open lies in bias direction. Caps the daily wick on large-range reversal sessions.
   - **TP2 (Extended Target)**: **Furthest Relevant Level within the ADR band** via HTF hierarchy walk (same tier order as TP1 candidates, gated by open ± ADR).

## Consequences
- Reversals are validated with higher statistical confidence by enforcing a 2-stage verification process.
- The indicator handles aggressive, high-momentum wicks via a structured momentum fallback, preventing missed trades during rapid reversals.
- Eliminating Case B reduces correlation-related losses from counter-trend lagging entries.
- The indicator and dashboard can now dynamically display or assist in tracking daily bias state.
