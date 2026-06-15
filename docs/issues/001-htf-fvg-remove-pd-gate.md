# HTF FVG display — remove PD overlap gate

**Type:** AFK  
**Triage:** ready-for-agent  
**Blocked by:** None — can start immediately

## Parent

Local PRD: `docs/prd/htf-fvg-display-rules.md`  
ADR: `docs/adr/0007-htf-fvg-display-rules.md`

## What to build

Revise HTF FVG display on the Structural Canvas so unmitigated 4H and 1H body-based gaps qualify for drawing regardless of position relative to the Previous Day range. Gaps above PDH, below PDL, and inside `[PDL, PDH]` are treated equally when unmitigated. No liquidity-sweep gate.

Deliver end-to-end through Level Engine and Pine:

- Level Engine stops using PD overlap as an eligibility filter on `computeHtfFvgs` / `computeLevelSnapshot` output.
- Pine stops gating add and retention on Previous Day overlap.
- Native-timeframe-only rendering is unchanged (4H gaps on 4H chart, 1H gaps on 1H chart; no boxes on 5m, 15m, Daily, etc.).
- Mitigation unchanged: remove a gap when price enters the body-based zone on a bar after formation; formation bar must not self-mitigate.
- Uniform teal shading and `"4H FVG"` / `"1H FVG"` labels unchanged.

Session POI auto-selection at 18:00 ET continues to use the PD Equilibrium Range — display breadth and POI candidacy stay separate.

**User stories covered:** 1–6, 10–17, 20, 25

## Acceptance criteria

- [ ] Level Engine includes an unmitigated 4H or 1H FVG in `htfFvgs` when the gap sits entirely above PDH or entirely below PDL (replacing the test that asserted PD-overlap-only inclusion)
- [ ] Level Engine still excludes mitigated gaps and still does not mitigate on the formation bar
- [ ] `computeLevelSnapshot` returns an outside-PD unmitigated gap in `htfFvgs` alongside correct session context
- [ ] Pine draws teal FVG boxes for gaps outside the Previous Day range on native 4H and 1H charts
- [ ] Pine does not draw FVG boxes on non-native timeframes (5m, 15m, Daily, etc.)
- [ ] Pine lifecycle simulation updated to drop the PD overlap gate; existing formation-bar mitigation tests still pass
- [ ] Level Engine README reflects that PD overlap is not a display filter
- [ ] `npm test` in `level-engine` passes

## Blocked by

None — can start immediately
