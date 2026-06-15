# HTF FVG display rules

Slice 3 initially drew only unmitigated 4H/1H FVGs overlapping the Previous Day range. Continuation trading needs overhead gaps (e.g. above PDH) visible as retrace holds, but an unbounded history would clutter native HTF charts.

HTF FVGs on the Structural Canvas follow these rules: all unmitigated 4H/1H body-based gaps qualify with no PD overlap or liquidity-sweep gate; only gaps whose formation time falls in the current or previous CME week are drawn, expiring at each Sunday 18:00 ET roll; boxes render on native 4H and 1H charts only (not projected to execution timeframes); uniform teal unless the gap is Session POI, which gets POI emphasis; mitigation removes a gap when price enters the zone on a bar after formation. Session POI auto-selection at 18:00 ET still uses the PD Equilibrium Range — display breadth and POI candidacy are intentionally separate.

**Considered options:** PD-range filter only (Slice 3); expansion-qualified gaps outside PD with sweep gate; project gaps to all timeframes like PDH/PDL; show until mitigated with no week cap.
