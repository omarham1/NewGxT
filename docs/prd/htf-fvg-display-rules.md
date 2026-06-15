# PRD: HTF FVG Display Rules (Slice 3 revision)

**Status:** Local draft (not published to issue tracker)  
**Domain refs:** `CONTEXT.md` (HTF FVG, Structural Canvas, Session POI), ADR 0007  
**Supersedes:** Slice 3 PD-overlap-only display behavior

---

## Problem Statement

On native 4H and 1H charts, continuation gaps above PDH (or below PDL) are valid retrace holds for expansion trades, but the indicator currently hides them because Slice 3 only draws HTF FVGs overlapping the Previous Day range. A trader reviewing NQ on 1H cannot see an unmitigated gap formed during an expansion leg above PDH, even though that zone is where they expect price to react on pullback. At the same time, showing every unmitigated gap back to chart history would clutter native HTF charts with stale levels that no longer inform today's execution.

## Solution

Revise HTF FVG display on the Structural Canvas so all unmitigated 4H and 1H body-based gaps qualify for drawing — including gaps outside the Previous Day range — with no liquidity-sweep gate. Limit visibility to gaps formed during the **current or immediately previous CME week** (formation-time anchor, expiring at each Sunday 18:00 ET roll). Keep native-timeframe-only rendering (4H gaps on 4H, 1H gaps on 1H). Keep existing mitigation behavior. Use uniform teal styling until Session POI highlighting is available in a later slice.

## User Stories

1. As a futures trader on a 4H chart, I want unmitigated 4H FVGs above PDH to appear as shaded zones, so that I can mark continuation retrace holds during expansion legs.
2. As a futures trader on a 1H chart, I want unmitigated 1H FVGs above PDH to appear as shaded zones, so that I can plan entries on intermediate continuation pullbacks.
3. As a futures trader on a 4H chart, I want unmitigated 4H FVGs below PDL to appear as shaded zones, so that I can see bearish continuation holds during expansion below yesterday's range.
4. As a futures trader on a 1H chart, I want unmitigated 1H FVGs below PDL to appear as shaded zones, so that I can see bearish continuation holds on the execution HTF I monitor.
5. As a futures trader, I want gaps inside the Previous Day range to continue appearing when unmitigated, so that manipulation-watch levels within yesterday's range remain visible alongside overhead continuation gaps.
6. As a futures trader, I want no liquidity sweep required before an out-of-range gap appears, so that I am not blocked from seeing a valid gap while price has not yet taken PDH/PDL.
7. As a futures trader, I want gaps older than two CME weeks to disappear from the canvas even if unmitigated, so that my HTF chart stays focused on recent structure.
8. As a futures trader reviewing charts on Wednesday mid-week, I want to see all unmitigated gaps formed since the current CME week opened (Sunday 18:00 ET) plus all unmitigated gaps from the full prior CME week, so that my lookback window matches how I think about weekly structure.
9. As a futures trader, I want gaps from three or more CME weeks ago removed at the Sunday 18:00 ET week roll, so that stale overhead gaps do not accumulate indefinitely.
10. As a futures trader on a 5m chart, I do not expect HTF FVG boxes to project onto my execution timeframe, so that my entry chart stays uncluttered and I switch to native 4H/1H when reviewing gap structure.
11. As a futures trader on a 15m chart, I do not expect HTF FVG boxes to appear, so that gap review remains a deliberate HTF chart activity.
12. As a futures trader on a Daily chart, I do not expect HTF FVG boxes to appear, so that the Daily view remains rails-focused.
13. As a futures trader, I want an HTF FVG removed when price enters its body-based zone on a bar after formation, so that mitigated gaps do not linger as false targets.
14. As a futures trader, I want the formation bar of a new gap not to immediately mitigate its own zone, so that a gap is visible the moment it forms.
15. As a futures trader, I want bullish and bearish gaps treated equally for display eligibility, so that I see continuation holds in both directions without directional geographic filtering.
16. As a futures trader, I want gap zone boundaries based on candle bodies (not wicks), so that displayed zones match the GxT FVG definition I trade against.
17. As a futures trader, I want all qualifying gaps to use the same teal shading and `"4H FVG"` / `"1H FVG"` labels, so that the canvas has a consistent Structural Canvas appearance.
18. As a futures trader, I want a gap promoted to Session POI to receive POI visual emphasis when that feature ships, so that today's manipulation watch stands out among multiple visible gaps.
19. As a futures trader setting daily bias at 18:00 ET, I want Session POI auto-selection to still prefer 4H then 1H FVGs within the PD Equilibrium Range, so that display breadth does not change how today's primary watch is chosen.
20. As a developer maintaining parity, I want the Level Engine snapshot and Pine indicator to apply the same display eligibility rules, so that tests and chart behavior do not diverge.
21. As a developer writing regression tests, I want week-boundary fixtures using the existing CME weekly session calendar, so that lookback expiry is verified against the same Sunday 18:00 ET → Friday 17:00 ET definition as PWH/PWL.
22. As a developer, I want a gap formed during the Friday close region of the prior CME week to remain visible through the following week until the next Sunday 18:00 ET roll, so that late-week gaps are not dropped prematurely mid-session.
23. As a futures trader, I want gaps formed during the current CME week to remain visible through Friday 17:00 ET, so that the full active week of structure is always on canvas.
24. As a futures trader between CME weekly sessions (Friday 17:00 ET → Sunday 18:00 ET), I want lookback evaluation to use the last completed bar's timestamp, so that week membership remains well-defined when the cash session is closed.
25. As a QA reviewer, I want automated tests proving a gap above PDH is included after this change, so that the original NQ regression (yellow box above PDH) is locked in.
26. As a QA reviewer, I want automated tests proving a gap from three CME weeks ago is excluded while still unmitigated, so that the lookback cap cannot silently regress.
27. As a futures trader using standard candles, I want FVG detection on actual OHLC bodies, so that Heikin Ashi smoothing does not distort gap boundaries (document as operational note; not a code change in this slice unless already enforced).

## Implementation Decisions

### Testing seams (proposed)

Test at the **highest existing seams**; add one small pure helper only if week membership logic would otherwise be duplicated untested.

| Seam | Role | Why here |
|------|------|----------|
| **`computeLevelSnapshot`** | End-to-end Level Engine output consumed by renderers | Highest integration point; asserts `htfFvgs` alongside session context in one call |
| **`computeHtfFvgs`** | Pure HTF FVG detector + eligibility pipeline | Existing unit-test home for detection, mitigation, and filter rules |
| **`getWeeklySessionKey` / session calendar** | CME week membership for a timestamp | Prior art in session-calendar tests; reuse for lookback helper input |
| **Pine FVG lifecycle simulation** | Bar-by-bar state machine mirroring Pine | Prior art in `pine-fvg-lifecycle.test.ts`; extend when Pine adds week expiry |

**New helper (if needed):** a pure function such as `isWithinHtfFvgLookback(formedAtMs, asOfMs)` that returns true when `formedAt` falls in the CME week of `asOf` or the immediately preceding CME week. Lives alongside session calendar or HTF FVG module; tested directly and via `computeHtfFvgs`.

### Level Engine — HTF FVG module

- **Remove** the Previous Day overlap filter as a display eligibility gate. Gaps above PDH, below PDL, and inside the range are treated equally if unmitigated and within the week lookback.
- **Add** CME week lookback filter keyed on **formation time** (timestamp of the confirming bar when the three-candle pattern completes — existing `formedAt` semantics).
- **Add** an `asOf` timestamp to `computeHtfFvgs` input (or derive it from the latest mitigation/bar timestamp) so week membership is deterministic in tests and snapshots.
- **Retain** body-based zone boundaries, bullish/bearish detection, and post-formation mitigation (`bar.time > formedAt` before zone entry counts).
- **Stop requiring** `pdh`/`pdl` for FVG eligibility (they may remain on the snapshot for session context but are not FVG filters).

### Level Engine — Level Snapshot composer

- Pass `asOf` (e.g. latest bar time from supplied bar arrays) into the HTF FVG pipeline.
- Snapshot `htfFvgs` output reflects the revised eligibility rules with no API shape change to `HtfFvg`.

### Pine indicator — Structural Canvas FVG layer

- **Remove** `f_overlaps_pd` gating from add and retention paths (`f_try_add_fvg`, `f_filter_fvgs_by_pd`).
- **Add** CME week lookback filter using the same calendar as PWH/PWL (`f_cme_week_session_key` family), evaluated on each zone's `formedTime` against the current bar's week context.
- **Retain** native-timeframe-only display (`showFvgs` on 4H and 1H charts only).
- **Retain** post-formation mitigation guard (`time > zone.formedTime`).
- **Retain** uniform teal `FVG_COLOR` and timeframe labels until Session POI slice wires POI emphasis.

### Session POI emphasis (deferred hook)

- Domain specifies uniform teal unless promoted to Session POI. Session POI selection is **not implemented** yet (issue #6). This slice delivers uniform styling only; POI emphasis is a follow-on when Session POI exists.

### Parity principle

Level Engine and Pine must agree on: no PD overlap gate, CME two-week formation lookback, post-formation mitigation, body-based zones, native TF scoping. Pine detects on aggregated native bars; Level Engine accepts pre-aggregated `bars4h` / `bars1h` from callers.

### Week lookback shape (decision-rich)

```ts
// formedAt and asOf are epoch ms; week keys from CME calendar (Sun 18:00 ET origin)
function isWithinHtfFvgLookback(formedAt: number, asOf: number): boolean {
  const formedWeek = getWeeklySessionKey(formedAt);
  const asOfWeek = getWeeklySessionKey(asOf);
  if (formedWeek === null || asOfWeek === null) {
    // bars outside Sun–Fri window: resolve using nearest in-session asOf or exclude
    return false; // exact edge policy tested in fixtures
  }
  // true when formedWeek === asOfWeek OR formedWeek is the immediately prior CME week
}
```

Exact handling of timestamps outside the CME weekly window (Friday 17:00–Sunday 18:00 ET) must be fixture-tested; prefer aligning with how `getWeeklySessionKey` already treats out-of-window bars.

## Testing Decisions

### What makes a good test

- Assert **observable outputs**: which gaps appear in `htfFvgs`, zone boundaries, `formedAt`, timeframe, and survival after mitigation or week roll — not internal loop indices or private helpers unless testing the week helper in isolation.
- Use **fixed bar fixtures** with documented ET comments (pattern from `weekly-boundary` and `mid-week-daily-boundary` fixtures).
- Prefer **one behavior per test**; replace the existing "includes only FVGs overlapping PD" test with "includes FVGs outside PD range" and add separate week lookback tests.

### Modules under test

| Module | Tests |
|--------|-------|
| `computeHtfFvgs` | Detection unchanged; outside-PD inclusion; week lookback inclusion/exclusion; mitigation unchanged; no self-mitigation on formation bar |
| `isWithinHtfFvgLookback` (if extracted) | Current week, previous week, two weeks ago, week roll at Sunday 18:00 ET |
| `computeLevelSnapshot` | Integration: snapshot returns outside-PD gap; excludes expired-week gap |
| Pine lifecycle simulation | Update simulator to drop PD gate; add week expiry cases mirroring Pine |

### Prior art

- `htf-fvg.test.ts` — body boundaries, mitigation, formation-bar guard
- `level-snapshot.test.ts` — composed snapshot assertions
- `session-calendar.test.ts` — CME weekly grouping and boundary keys
- `pine-fvg-lifecycle.test.ts` — Pine state-machine parity

## Out of Scope

- Projecting HTF FVG boxes onto execution timeframes (1m–30m) or Daily charts
- Liquidity-sweep or Expansion FVG qualification gates for display
- PD Equilibrium geographic filtering for display (Session POI selection only)
- Session POI auto-selection, badges, and POI emphasis styling (issue #6)
- ITF FVG display (30m / 90m)
- SMT Fill state machine and cross-asset FVG tracking
- TypeScript OHLC resampling to produce `bars4h` / `bars1h` from 1m bars
- Heikin Ashi detection changes (operational guidance only)
- GitHub issue creation / `ready-for-agent` labeling (local PRD per user request)

## Further Notes

- ADR 0007 records the trade-off against Slice 3's PD-only filter.
- The original user regression: NQ 1H gap ~30,370–30,420 with PDH ~30,050 should render after PD filter removal if `formedAt` falls in the two-week window.
- When Session POI ships, the only visual change to this layer should be promoting one eligible gap to POI emphasis — not reintroducing a PD display filter.
- After implementation, update Level Engine README and close or revise GitHub issue #4 acceptance criteria to reflect the new display rules.
