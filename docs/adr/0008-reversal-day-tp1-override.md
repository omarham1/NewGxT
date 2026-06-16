# ADR-0008: Reversal-Day Daily Open TP1 Override

## Status
Accepted

## Context

Active DOL TP1 defaults to the nearest unmitigated **Relevant Level** in bias direction (slice 7). On large-wick reversal days — when the session has already stretched most of its expected range and a reversal is confirmed — the playbook targets the **18:00 Daily Open** to cap the daily wick instead of the next structural magnet.

`CONTEXT.md` and the daily execution playbook describe this override qualitatively ("ADR nearly consumed", "reversal fires late"). The Level Engine needs a mechanical rule that a trader can toggle once they have confirmed a reversal, without waiting for Visual Dependency Phase 3 (SMT / 2-Stage SMT) automation.

## Decision

TP1 switches from the nearest Relevant Level to **18:00 Daily Open** when **all** of the following are true:

1. **Reversal confirmed (manual input)** — `reversalDayTp1` is enabled by the trader after they confirm a reversal per ADR-0003 / playbook (2-Stage SMT/SS or aggressive-reversal fallback). v1 does not auto-detect reversal confirmation.
2. **ADR largely consumed** — `adrConsumptionPct >= 80`, where consumption is `(current session high − low) / 14-day ADR × 100` (same metric as the Session Context ADR label).
3. **Daily Open in bias direction** — bullish bias requires `dailyOpen > currentPrice`; bearish bias requires `dailyOpen < currentPrice`.

When the override is active, `tp1 = { kind: "daily-open" }`. TP2 resolution is unchanged (furthest Relevant Level within the ADR band).

When any condition fails, TP1 falls back to the slice-7 nearest-Relevant-Level rule.

### Rendering

Daily Open keeps **Session Context** styling (dashed line, gray) and receives a `TP1` badge on the label when the override is active. DOL badge color does not replace the dashed Session Context line style.

### Indicator input

- **Reversal Day TP1** — boolean toggle (default `false`), group "Active DOL". Enables condition (1) above.

## Consequences

- Reversal-day targeting is testable in the Level Engine without SMT state machines.
- The 80% ADR threshold is a mechanical proxy for "large wick / range largely consumed"; it can be revisited if live-session calibration suggests a different cutoff.
- ADR-0003 target-selection language is updated to match `CONTEXT.md`: nearest Relevant Level by default, Daily Open on reversal days only.
