# ADR-0009: Continuation POI

## Status
Accepted

## Context
[Session POI](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md) is today's *manipulation watch* — a level where price is expected to sweep and form the daily wick. On directional days it is auto-selected at 18:00 ET from HTF FVGs in the **biased half** of the Previous Day range (above [PD 50% Midpoint](file:///Users/omarhamouda/Projects/NewGxT/CONTEXT.md) when bullish, below when bearish), and per [ADR-0007](0007-htf-fvg-display-rules.md) intraday-formed gaps are explicitly **excluded** from Session POI candidacy. Session POI also never auto-re-selects after mitigation.

A common intraday scenario: the trader sets bearish bias after a bearish expansion day, Session POI sits below PD 50%, but price opens and expands **through** the midpoint. A 4H or 1H **close** above PD 50% flips bias to bullish, kills the bearish wick thesis, and leaves stacked intraday HTF FVGs below price as the react-from levels toward Active DOL (e.g. TP1/PDH). The playbook already executes this (Play C, Continuation Play), but the level engine had no concept to *select and highlight which gap* is the continuation level. Forcing this onto Session POI would break two of its invariants at once (no intraday gaps; no re-selection).

## Decision
We introduce **Continuation POI** as a first-class concept, separate from Session POI:

- **Activation (coupled with bias flip)**: A single event — a **4H or 1H candle closes through PD 50% Midpoint against the live directional bias**. Wick contact through the midpoint does not count; only HTF body closes. This simultaneously (a) flips directional bias to the opposing side, (b) relinquishes any live Session POI, and (c) enters continuation regime with Continuation POI as the sole active watch. There is no separate activation gate after the flip. Rationale: a close *against* the live bias means the pre-session wick thesis at Session POI is dead — e.g. bearish bias with a close above 50% signals travel to the opposing side (PDH), not a bearish wick at the lower-half POI. A close *with* the live bias (e.g. bullish close above 50% while already bullish) is normal expansion and does not re-trigger anything.
- **Empty candidate pool**: If no eligible gap exists at flip time, continuation regime is active with no highlighted POI; the engine re-evaluates each bar until a gap qualifies or bias flips again. Mirrors Session POI deferral when no equilibrium FVG exists at 18:00.
- **Candidate pool**: **Intraday-formed**, unmitigated 4H/1H FVGs in the **new** bias direction from the current expansion move — including gaps that formed before the flip bar during the same leg. Gaps must sit **entirely within the upper 50% of the Expansion Leg** — the gap's far (deeper) boundary must not fall past the 50% retracement of the leg. Deliberate carve-out from [ADR-0007](0007-htf-fvg-display-rules.md) intraday-gap exclusion, which continues to apply to Session POI.
- **Selection / tie-break**: Among eligible gaps, highest timeframe first, then nearest to current price — mirrors Session POI.
- **The Expansion Leg 50% line**: candidacy filter (whole gap must sit above it) and post-entry invalidation (price must not close past it, per the playbook's 50% Equilibrium Rule). One line, two roles.
- **Expansion Leg**: origin = the most recent opposing **1H swing point** preceding the bias-flip close (1H swing low for a bullish leg, high for a bearish leg); terminus = the current extreme in the new bias direction, updating live. Pre-entry leg for POI selection; distinct from the playbook's post-entry, sweep-anchored leg.
- **Relinquish & re-select**: Reverts to standard styling when the gap is mitigated, or is invalidated if price closes past the 50% retracement of the expansion leg. After either, the engine **auto-re-selects** the next eligible gap — unlike Session POI.
- **Hand-off (one active POI at a time)**: The engine never emits Session POI and Continuation POI as active simultaneously.
- **Targets**: Unchanged. Continuation POI is a react-from level, never an Active DOL candidate.

## Considered Options
- **Extend Session POI** with a second intraday phase — rejected: collapses manipulation-watch and continuation-watch semantics.
- **No highlighted level; pure Play C execution trigger** — rejected: trader wants the engine to point at *which* gap to watch.
- **Activation by close through PD 50% in the bias direction** — rejected: fires on normal bullish expansion when already bullish; conflates expansion with hand-off. Correct signal is close *against* live bias.
- **Decoupled activation** (bias flip first, Continuation POI only after a second gate such as failed manipulation or post-flip FVG) — rejected: the flip bar is the hand-off bar; trader is immediately in continuation watch mode.
- **Exclusive candidate pool** (only gaps formed after the flip bar) — rejected: gaps from the same expansion leg before the flip bar are valid react-from levels.

## Consequences
- Session POI candidacy filter in `session-poi.ts` must change from PD Equilibrium Range (25%–75%) to the biased half of PD range (above/below PD 50% Midpoint).
- Two intentional departures from Session POI: Continuation POI uses intraday gaps and auto-re-selects.
- Level engine needs `pdMidpoint` in session context, a Continuation POI selection routine, Expansion Leg computation, and intraday bias-flip tracking (4H/1H close guard, wick-exempt).
- Two distinctly-anchored expansion legs remain (pre-entry 1H-swing for selection; post-entry sweep for management) — unifying them is deferred.
