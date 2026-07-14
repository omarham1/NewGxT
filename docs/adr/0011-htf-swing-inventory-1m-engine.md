# ADR-0011: HTF Swing Inventory in the 1m Structural Engine

The GxT Correlated Asset Indicator replays history on every chart load. Profiling and the `pine-load-complexity` model show the remaining per-bar hotspot is HTF swing mitigation: `request.security_lower_tf` fans out every 1m bar inside each chart bar, then the chart TF re-sweeps the full active swing pool. PDH/PDL/PWH/PWL already mitigated inside a single `request.security("1", …)` state machine (ADR-0010 / #25); HTF swings still use the legacy lower-TF path (#29).

We move the **full HTF swing inventory lifecycle** — formation from 4H/1H confirmations, Failure Swing stamping, cross-TF alignment, 1m wick mitigation, and session pruning — into that same 1m structural engine bundle. The chart TF stops iterating 1m sub-bars; it receives a **dirty-gated publish** of swing state only when the inventory mutates. `request.security_lower_tf` is removed once swings no longer depend on it.

**Publish cadence by chart timeframe:** On execution chart timeframes (1m through 5m), inventory changes should appear as soon as the engine records them. On higher chart timeframes (10m and above), changes may appear when the hosting candle completes — the same relaxed cadence as liquidity rails. One rule applies to all inventory mutations (formation, mitigation, suppression, alignment, pruning), not mitigation alone.

**Two contracts:** The **level-engine** always reflects full 1m truth (when the sweep occurred). Pine on 10m+ is a **display optimization** — Session POI and Active DOL may lag up to one hosting candle behind engine truth. Snapshots and parity tests use engine truth; chart-TF display lag on 10m+ is intentional for load.

**Deferred:** Live mitigation and Session POI updates on 10m+ chart timeframes (same immediacy as 1m–5m) are out of scope for this pass; accept brief POI/DOL staleness on higher charts until a follow-up.

## Considered options

- **Chart-side sweep with one aligned 1m OHLC sample** — cheaper but misses intra-period wick sweeps (documented parity gap). Rejected; domain requires full 1m evaluation inside the engine.
- **Second `request.security("1")` call for swings** — duplicates the most expensive security context. Rejected; extend the existing 1m bundle (#24 merge rule).
- **Single contract: level-engine matches Pine on every chart TF** — forces chart-TF-aware snapshots and duplicates relaxed cadence in two places. Rejected.

## Consequences

- Scope is **swings only** this pass; rails and FVG pools are unchanged.
- Success: chart open on 1m–5m with deep history feels clearly faster, and replay is no longer dominated by per-bar swing re-sweeping (relative + mechanism-based verification).
- `#29` acceptance criteria should be read in light of this ADR — especially chart-TF publish cadence and the engine vs display split.
