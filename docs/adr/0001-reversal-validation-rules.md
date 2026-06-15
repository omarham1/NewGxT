# ADR-0001: Reversal Validation Rules and Leg Equilibrium Calculations

## Status
Accepted

## Context
In the GxT Correlated Asset Indicator, we need a mechanical way to validate whether a reversal out of a **Relevant Level** (such as **PDH/PDL** or **PWH/PWL**) remains structurally valid during its retracement phase.

Earlier specifications mandated that any close past a high-timeframe **Fair Value Gap (FVG)** (m30+) would invalidate the setup. However, to accommodate varying market volatility, the validation rules are updated to include a 50% equilibrium threshold on the expansion leg and a timeframe hierarchy for HTF FVGs.

## Decision
We will calculate and validate the reversal leg's retracement using the following rules:

1. **Candle Closure Reversal Signatures**:
   - **[C1 (Protraction Candle)](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L60)**: The reference candle that first sweeps or trades into a Relevant Level or POI.
   - **[C2 (Reversal Candle)](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L64)**: The candle that sweeps the extreme of C1 (or previous range) and body-closes *back inside* C1's range (initiating a V-shape reversal). A C2 closure is validated immediately (when paired with other strategy rules like SMT/SS) regardless of its wick size.
   - **[C3 (Confirmation Candle)](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L69)**: Confirms the reversal *only* when there is no C2 closure.
     - **Alternative Reversal (No C2 Closure)**: If C2 sweeps C1 but body-closes *outside* of C1's range (failing to form a C2 closure), C3 confirms the reversal by body-closing *above the body* of C2 (bullish) or *below the body* of C2 (bearish).

2. **Expansion Leg Boundaries**:
   - **Start of the Leg**: Defined as the absolute extreme (high or low wick) of the sweep candle (C2) that interacted with the **Relevant Level**.
   - **End of the Leg**: Defined as the highest high (for bullish reversals) or lowest low (for bearish reversals) reached before a 3-candle swing point (fractal) is confirmed on the execution timeframe.
3. **The 50% Equilibrium Rule**:
   - Once the end of the leg is locked, the 50% (0.5) retracement level is calculated between the start and end of the leg.
   - Price must not close past this 50% equilibrium level on the execution timeframe.
4. **Timeframe Gap Hierarchy**:
   - Gaps on lower high-timeframes (e.g., 30m **Expansion FVGs**) may be inversed (closed past) during retracement.
   - The setup remains valid as long as the higher high-timeframe gap (e.g., 1h **Expansion FVG**) is respected and the 50% equilibrium level holds.
5. **Exception for Confirmed Reversal**:
   - Both the 50% equilibrium rule and the FVG boundaries are overridden (bypassed) if a reversal setup is confirmed via **SMT Divergence** and a **Strength Switch** (such as an alternating sweep forming an **Inverted Roof** or **SS PSP**). In this case, the deeper retracement is validated as part of the accumulation/distribution structure.

## Consequences
- We avoid premature invalidations caused by shallow hourly structure checks when lower timeframe gaps are violated.
- Programmatic logic in Pine Script will need state tracking variables to lock the leg extreme once a C2/C3 reversal signature is identified and confirmed.
