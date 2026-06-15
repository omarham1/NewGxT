# ADR-0002: Strength Rotation and Catch-up Play Protocol

## Status
Accepted

## Context
In the GxT Correlated Asset Indicator strategy, selecting which asset in the triad to trade is a critical decision. Previously, selection was based on static criteria (DOL proximity and immediate displacement strength). 

To capture the full dynamic of institutional rotation, we need to formalize how we handle shifts in strength *after* an initial reversal setup is formed. This includes defining the relationship between lead assets and lagging assets as they target the same high or low.

## Decision
We establish the following rules for execution vehicle selection and rotation:

1. **Target Matching Expectation**:
   - A confirmed **Strength Switch** (SS) at a swing extreme (high/low) implies that all correlated assets in the triad are expected to eventually reach the corresponding high/low **Draw on Liquidity (DOL)** target.

2. **Primary Selection (Lead Asset)**:
   - The default execution choice is the **stronger asset**—the one displaying the cleanest, highest-momentum displacement (V-shape) leaving the Relevant Level.

3. **Fails to Manipulate Defined**:
   - An asset **fails to manipulate** when it reaches a **Relevant Level** but continues straight past it (expansion) or consolidates/stalls around it, instead of immediately sweeping and reversing out of it.

4. **Secondary Selection ([Catch-Up Play](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L78) to the High/Low)**:
   - When a highly correlated stronger asset (e.g., NQ) **fails to manipulate** its own [PDH/PDL](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L11) target, but a lagging asset (e.g., ES or YM) has not reached its equivalent high/low yet, we can trade the lagging asset up to its own high/low target.
   - **Trigger**: An Intermediate Timeframe (ITF) FVG (`30m`/`1h`/`90m`) [SMT Fill](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L27) on the lagging asset, followed by a Lower Timeframe (LTF) [Change in the State of Delivery (CISD)](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L56) confirmation, requiring a LTF candle (`3m`/`5m`) to body-close past the CSD level in the continuation direction.
   - **Invalidation**: The Catch-Up Play is immediately disabled if the stronger asset prints a counter-trend LTF [CISD](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L56) confirmation (indicating active reversal pressure), as this signals a market-wide reversal risk.

5. **Tertiary Selection ([Continuation Play](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L82) beyond the High/Low)**:
   - If the stronger asset expands past the high/low level, we can trade it to the next Higher Timeframe [Draw on Liquidity (DOL)](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L74), provided the target is within the Average Daily Range (ADR) limit.
   - **Trigger**: An ITF FVG (`30m`/`1h`/`90m`) [SMT Fill](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L27) on any triad asset, followed by a LTF [CISD](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L56) confirmation (LTF candle body-closing past the CSD level).
   - **Asset/Target Preference**:
     - The stronger asset is preferred *only* if it has open HTF DOLs within reasonable reach (within the ADR limit).
     - Otherwise, we prefer to trade the lagging asset to its own [PDH/PDL](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L11) (same high/low target), as it acts as a magnet.

## Consequences
- Traders can dynamically rotate between triad assets depending on which asset offers the highest-probability path.
- The catch-up play provides a clear, rule-based method to buy/sell lagging assets safely when the leading asset shows continued trend expansion.
- Risk of buying the lagging asset before a market-wide reversal is mitigated by disabling the play if the lead asset prints a counter-trend [CISD](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L56) confirmation.
