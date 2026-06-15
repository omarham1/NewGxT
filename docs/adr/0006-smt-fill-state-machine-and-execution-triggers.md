# ADR-0006: SMT Fill State Machine and Execution Triggers

## Status
Accepted

## Context
Tracking real-time participation in Fair Value Gaps (FVGs) and defining entry execution and trade management rules are essential for the mechanical operation of the GxT Correlated Asset Indicator. We need to define how the FVG **SMT Fill** state machine operates, how [CISD](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L56) entry signals are triggered across the triad, and how risk is managed post-entry.

## Decision
We establish the following rules for FVG SMT Fill state tracking, execution triggers, and risk management:

1. **SMT Fill State Machine**:
   - **Initialization**: The state machine initializes when price on **any** asset in the triad (ES, NQ, or YM) retraces and enters an active high-timeframe or intermediate-timeframe (HTF/ITF) FVG.
   - **States**:
     - `Idle`: No assets have entered their respective FVGs.
     - `SMT_Fill_Active`: One or two assets in the triad have entered their FVGs, while the remaining asset(s) have not. This indicates active institutional divergence.
   - **Invalidation**: The `SMT_Fill_Active` state is immediately invalidated and returns to `Idle` if **all three assets** in the triad enter their respective FVGs (meaning the gap is fully and symmetrically filled across the market, resolving the divergence).

2. **Execution & Entry Trigger**:
   - When the state machine is in `SMT_Fill_Active`, we monitor the triad for a [Change in the State of Delivery (CISD)](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L56) confirmation on the execution timeframe (`3m` or `5m`, or `1m` during high volatility) in the trade direction.
   - **CSD Level Definition**: The CSD level is defined as the opening price of the candle (or series of candles of the same color) that created the retracement extreme.
   - **CSD Confirmation**: A CSD is confirmed when a LTF candle (`3m`/`5m`) body-closes past the CSD level. We do *not* execute on a simple cross; price must close past the level.
   - **Asset Selection**: We do not limit entries to the asset that triggered the SMT Fill. We look for a confirmed CSD body close on **any of the three assets**, prioritizing the asset that has an open [Draw on Liquidity (DOL)](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L74) and is closest to it.
   - **Momentum Requirement**: The CSD candle must show institutional momentum (displacement) by either:
     - Leaving a new LTF FVG / Expansion FVG behind, or
     - Showing an exceptionally strong body close in the trade direction.
   - Entry is executed on the candle immediately following the confirmed CSD body close.

3. **Risk Management & Trade Management**:
   - **Stop-Loss (SL) Placement**: The stop-loss is placed at the absolute swing extreme (high/low wick) of the sweep candle that interacted with the POI (the protected swing).
   - **Break-Even (BE) Trigger**: The stop-loss is moved to break-even when the trade reaches a 2R (2:1 risk-to-reward) ratio OR once price breaks the first counter-trend LTF swing point (a lower timeframe [Market Structure Shift (MSS)](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L52)) in the direction of the trade.

## Consequences
- The indicator and dashboard will track SMT Fill state transitions dynamically.
- Programmatic alerts can be customized to trigger when `SMT_Fill_Active` is accompanied by a LTF [CISD](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md#L56) confirmation in the trade direction.
- Risk management is standardized, reducing execution discretion during high-volatility events.
