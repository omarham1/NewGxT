# HTF FVG display — CME two-week lookback

**Type:** AFK  
**Triage:** done  
**Status:** Closed in 814e77e

## Parent

Local PRD: `docs/prd/htf-fvg-display-rules.md`  
ADR: `docs/adr/0007-htf-fvg-display-rules.md`

## What to build

Cap HTF FVG visibility to gaps formed during the **current or immediately previous CME week**, using formation time (confirming bar timestamp when the three-candle pattern completes). Gaps from three or more CME weeks ago are not drawn even if still unmitigated. Week membership uses the same CME calendar as PWH/PWL (Sunday 18:00 ET through Friday 17:00 ET). Eligibility expires at each Sunday 18:00 ET week roll.

Example: on Wednesday of the current CME week, show all unmitigated gaps formed since the current week opened plus all unmitigated gaps from the full prior CME week.

Deliver end-to-end through Level Engine and Pine:

- Add a pure lookback helper (e.g. `isWithinHtfFvgLookback(formedAt, asOf)`) built on `getWeeklySessionKey`, with direct unit tests for current week, previous week, two-weeks-ago exclusion, and week-roll boundary.
- `computeHtfFvgs` accepts an `asOf` timestamp and filters eligible gaps through the lookback helper after detection and mitigation.
- `computeLevelSnapshot` derives `asOf` from supplied bar arrays and passes it through.
- Pine applies the same two-week rule on each zone's `formedTime` using the existing CME week session key logic; prune expired zones on week roll.
- Pine lifecycle simulation extended with week-expiry cases mirroring Pine behavior.

Edge cases outside the CME weekly window (Friday 17:00 ET → Sunday 18:00 ET) must be fixture-tested; align with existing `getWeeklySessionKey` behavior.

**User stories covered:** 7–9, 21–24, 26

## Acceptance criteria

- [x] Lookback helper returns true for formation times in the current CME week and the immediately previous CME week, false for two or more weeks ago
- [x] Week-roll at Sunday 18:00 ET drops gaps from the third week back while still unmitigated
- [x] A gap formed in the Friday close region of the prior CME week remains visible through the following week until the next Sunday 18:00 ET roll
- [x] `computeHtfFvgs` excludes a gap outside the lookback window even when unmitigated and outside PD range
- [x] `computeLevelSnapshot` integration test: includes in-window gap, excludes expired-week gap
- [x] Pine prunes zones that fall outside the two-week lookback; in-window zones still render on native 4H/1H
- [x] Pine lifecycle simulation covers week expiry in addition to mitigation
- [x] Level Engine README documents the CME two-week formation lookback
- [x] `npm test` in `level-engine` passes

## Blocked by

- `docs/issues/001-htf-fvg-remove-pd-gate.md`
