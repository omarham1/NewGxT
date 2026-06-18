# GxT Correlated Asset Indicator

Domain glossary for GxT - a TradingView indicator system designed for high-precision liquidity level tracking and cross-asset correlation analysis.

## Language

**Relevant Levels**:
Any price projected from higher timeframes onto the execution chart where a market reaction is expected.
_Includes_: unmitigated PDH/PDL, unmitigated PWH/PWL, unmitigated 4H and 1H FVGs, and unmitigated HTF swing points that are not failure swings.
_Avoid_: Key zones, target lines

**Point of Interest (POI)**:
A Relevant Level where price interaction is expected to produce a tradeable reaction. Every Relevant Level is a valid POI.
_Avoid_: Setup zone, watch area

**Session POI**:
The single Relevant Level selected as today's primary manipulation watch. On directional days: auto-selected at 18:00 ET per daily bias rules — 4H FVG in the biased half of the Previous Day range (above PD 50% Midpoint when bullish, below when bearish), else 1H in the same half, else deferred until a live swing forms in that half. Tie-break among candidates: highest timeframe first, then nearest to current price. On neutral days: no highlight until PDH or PDL is swept, then the swept level is promoted. Visually emphasized with distinct color, increased line weight or zone opacity, and a POI badge on the label. Mitigation relinquishes Session POI immediately — the level reverts to standard mitigated styling and is no longer eligible as Session POI, Active DOL, or setup logic for the remainder of the session. A 4H or 1H close through PD 50% Midpoint against the live directional bias also relinquishes Session POI: the reversal-wick thesis is dead and the watch hands off to Continuation POI (only one POI is active at a time). No automatic re-selection after mitigation; the session continues without a highlighted POI unless the trader promotes another level manually.
_Avoid_: Active POI, trade level, today's target

**Continuation POI**:
The single unmitigated expansion-direction HTF FVG (4H or 1H) selected as the intraday continuation watch — a gap price is expected to retrace into and continue from, toward the Active DOL. Distinct from Session POI: it is a continuation watch, not a manipulation/reversal watch. Activates in the same moment as an intraday directional-bias flip — when a 4H or 1H candle closes through PD 50% Midpoint against the prior bias (wick contact through the midpoint does not count). That single event flips bias, relinquishes Session POI, and enters continuation regime; there is no separate activation gate. If no eligible gap exists at flip time, continuation regime is active with no highlighted POI until one qualifies; the engine re-evaluates each bar. Candidate pool: intraday-formed gaps in the new bias direction from the current expansion move (including gaps that formed before the flip bar, during the same leg) that sit entirely within the upper 50% of the Expansion Leg (shallow retracements only — a deep gap whose far boundary falls past the 50% retracement is disqualified); among eligible gaps, highest timeframe first, then nearest to current price. Unlike Session POI, its candidate pool is intraday-formed gaps, and it auto-re-selects the next eligible gap after the current one is mitigated or invalidated.
_Avoid_: Continuation zone, retrace POI, gap-fill level

**HTF Swing Point**:
A 4H or 1H swing high or low confirmed by a strict fractal — the extreme must exceed the 3 bars before and after it. Only swings whose price lies within the combined previous-week (PWH/PWL) and current-week range and whose formation falls in the current or immediately previous CME week are drawn. Failure swings are excluded — only the outermost extreme of each kind within proximity tolerance prints, compared across 4H and 1H. Intraday: newly formed swings that qualify may become Session POI. Unmitigated swings project as labeled solid lines from the fractal origin through the current CME daily session close (17:00 ET). Mitigated when price crosses the swing extreme on a bar after fractal confirmation — at or above a swing high, at or below a swing low. A body close through the level is not required; wick contact counts. While mitigated within the current CME session, the swing stays on the Structural Canvas in muted styling, truncated at the crossing bar where price first crosses the extreme rather than projected to session end; it is cleared at the next 18:00 ET session roll.
_Avoid_: Pivot, fractal, relative swing point

**Failure Swing**:
A confirmed HTF swing high or low permanently suppressed from the Structural Canvas and excluded from all downstream logic (Session POI, Active DOL, setup triggers) because a more extreme swing of the same kind on any HTF timeframe (4H or 1H) already exists within a proximity threshold — for highs, a lower peak too close to a higher one; for lows, a higher trough too close to a lower one. Proximity is measured as a fraction of the 14-day ADR (default 12.5%, configurable in indicator settings). The outermost extreme is the Relevant Level; the inner swing is the failure swing. Comparison is across 4H and 1H but never mixes highs with lows. At confirmation, the comparison pool scans four CME weeks of unmitigated HTF swings of the same kind whose price lies within the combined PWH/PWL and current-week range — wider than the two-week display lookback — so aged-out outer extremes can still stamp nearby new swings as failure swings. Classification is stamped at confirmation or retroactively when a more extreme unmitigated peer later confirms within proximity — earlier inner swings in the cluster are then stamped and suppressed. Once a failure swing, always a failure swing; the stamp never reverses.
_Avoid_: Subordinate swing, redundant swing, nested swing, relative swing point

**PD 50% Midpoint**:
The exact midpoint of the Previous Day's wick-to-wick range — PDL plus half the PD range. On directional days, Session POI candidates must sit in the biased half (above when bullish, below when bearish). Directional bias holds while 4H and 1H candles respect this level: wicks may trade through it, but no 4H or 1H close through it against the live bias. A 4H or 1H close through against the live bias flips directional bias and hands off from Session POI to Continuation POI in the same moment.
_Avoid_: Equilibrium level, fair value, PD midpoint line

**PD Equilibrium Range**:
The middle 50% of the Previous Day's wick-to-wick range — from 25% to 75% between PDL and PDH. Drawn as a faint band in Session Context; toggleable in indicator settings. Distinct from PD 50% Midpoint, which gates Session POI candidacy and directional-bias invalidation.
_Avoid_: Equilibrium zone, 50% level, fair value

**Previous Day High / Low (PDH/PDL)**:
High and low of the completed CME daily session (18:00 ET to 17:00 ET next day). Mitigated when price crosses the level on a 1m bar after the current session open — at or above PDH, at or below PDL. Wick contact counts; a body close is not required. While mitigated within the current CME session, the rail stays on the Structural Canvas in muted styling, truncated at the crossing bar rather than projected to session end; PDH/PDL values refresh at the next 18:00 ET session roll.
_Avoid_: Daily high/low, session extremes

**Previous Week High / Low (PWH/PWL)**:
High and low of the completed CME weekly session (Sunday 18:00 ET to Friday 17:00 ET). Mitigated when price crosses the level on a 1m bar after the current CME week open — at or above PWH, at or below PWL. Wick contact counts; a body close is not required. While mitigated within the current CME week, the rail stays on the Structural Canvas in muted styling, truncated at the crossing bar rather than projected to session end; PWH/PWL values refresh at the next Sunday 18:00 ET week roll.
_Avoid_: Weekly extremes, range boundaries

**Fair Value Gap (FVG)**:
A market imbalance identified by a three-candle sequence where the range of the middle candle is not fully overlapped by the outer two candles. Bullish zone: FVG C1 high wick to FVG C3 low wick. Bearish zone: FVG C3 high wick to FVG C1 low wick. The pattern is confirmed only when FVG C3 closes as a complete bar; until then no FVG exists — nothing is drawn, tracked, or eligible for downstream logic. Applies to every gap type in GxT — HTF, ITF, LTF, and Expansion FVG. Mitigated when a bar after formation closes through the gap extreme — below the lower boundary for a bullish FVG, above the upper boundary for a bearish FVG. Wick contact alone does not mitigate.
_Avoid_: Imbalance zone, liquidity void, gap

**FVG C1 / FVG C2 / FVG C3**:
The three bars of a Fair Value Gap pattern. FVG C1 and FVG C3 are the outer candles that define the gap zone; FVG C2 is the middle candle whose range must not be fully overlapped. Confirmation waits for FVG C3 bar close — wick conditions met intrabar on a forming bar do not count.
_Avoid_: C1, C2, C3 alone (those terms refer to the reversal sequence)

**HTF FVG (Relevant Level)**:
An unmitigated 4H or 1H Fair Value Gap shown on the Structural Canvas. All unmitigated gaps qualify regardless of position relative to the Previous Day range; no liquidity sweep is required for display. Eligibility uses the gap's formation time (FVG C3 bar open, at bar-close confirmation) and the CME daily session calendar (18:00 ET to 17:00 ET next day — same boundary as PDH/PDL): gaps formed during the current or immediately previous daily session are eligible for display, Session POI candidacy, and setup logic; older unmitigated gaps expire at each 18:00 ET daily session roll. On the first daily session of the CME week (Monday 18:00 ET, or Tuesday 18:00 ET when Monday is a holiday), eligibility also includes gaps from the prior Friday daily session — the last completed session before the weekend gap (Sunday 18:00 ET opens the Monday daily candle; there is no separate Sunday session). Session POI auto-selection at 18:00 ET still only considers gaps that existed at session open — intraday-formed gaps are visible Relevant Levels but do not auto-promote to Session POI. Rendered on native timeframe charts only — 4H gaps on the 4H chart, 1H gaps on the 1H chart; not projected to other timeframes. Uniform teal shading unless promoted to Session POI, which receives POI emphasis. Once a bar after formation closes through the gap extreme, the FVG is mitigated and removed from the canvas.
_Avoid_: ITF imbalance, displacement zone

**SMT Divergence**:
A cross-asset discrepancy where highly correlated assets fail to make symmetrical swing highs or lows, revealing hidden institutional divergence.
_Avoid_: Correlated divergence, correlation failure

**SMT Fill**:
A state machine tracking the real-time participation of correlated assets as price trades within a Fair Value Gap.
_Avoid_: Divergence fill, correlation tracker

**Strength Switching**:
The reversal of relative strength/weakness profiles between correlated assets during a structural shift, indicating institutional rotation.
_Avoid_: Relative strength flip, asset rotation

**Expansion FVG**:
A Fair Value Gap formed during a high-momentum price move (expansion) away from a swept liquidity level, which must hold to validate trend direction.
_Avoid_: Displacement gap, expansion zone

**2-Stage SMT**:
A structural reversal confirmation sequence starting with a higher-timeframe SMT divergence (Stage 1), validated on lower timeframes by an alternating SMT sweep (Stage 2) where the lagging asset drives through and sweeps its own previous extreme while the leading asset holds a higher low/lower high, followed by a strength switch.
_Avoid_: Alternating sweep, Roof pattern, double SMT


**Polarized Strength Profile (PSP)**:
A condition where highly correlated assets close higher-timeframe candles (30m, 1h, 90m, 4h) with opposite polarity (one bullish, one bearish).
_Avoid_: Opposite close, candle discrepancy

**Strength Switch PSP (SS PSP)**:
A specific PSP occurring after SMT divergence where the asset that swept closes in the reversal direction while the correlated asset closes in the trend direction, indicating a shift in lead strength.
_Avoid_: Divergence close profile

**Market Structure Shift (MSS)**:
A transition in market trend confirmed on the chart when price makes an aggressive displacement that closes past a prior significant swing high or low.
_Avoid_: Change in character, break of structure, trend change

**Change in the State of Delivery (CISD)**:
A shift in price delivery confirmed when price reaches a point of interest, sweeps liquidity to make a new extreme, and then closes back through the opening price of the candle (or series of candles of the same color) that created that new extreme.
_Avoid_: Market structure shift, break of structure, entry trigger

**Candle 1 (C1 / Protraction Candle)**:
The reference candle that first sweeps or trades into a Relevant Level or POI.
_Avoid_: Reference bar, trigger candle

**Candle 2 (C2 / Reversal Candle)**:
The candle that sweeps the extreme of Candle 1 (C1) (or previous range) and body-closes back inside C1's range, initiating a V-shape reversal.
- **Wick Size**: The sweep-side wick of C2 is calculated to analyze immediate expansion potential, but any valid C2 body close back inside C1 constitutes a C2 closure that is validated immediately when paired with other strategy aspects.
_Avoid_: Sweep candle, reversal bar

**Candle 3 (C3 / Confirmation Candle)**:
A candle confirming the reversal when Candle 2 (C2) fails to form a C2 closure (i.e. C2 body-closes outside C1's range).
- **Alternative Reversal (No C2 Closure)**: When C2 sweeps C1 but body-closes outside of C1's range, C3 confirms the reversal by body-closing above the body of C2 (bullish) or below the body of C2 (bearish).
_Avoid_: Confirmation bar, continuation candle

**Daily Bias**:
The session's directional stance: Directional (expansion/reversal, bullish or bearish) or Neutral (consolidation). Set manually by the trader at 18:00 ET; gates Session POI auto-selection logic. On directional days, bias direction holds until a 4H or 1H candle closes through PD 50% Midpoint against it — then bias flips to the opposing direction in the same moment Continuation POI activates. Wicks through the midpoint do not flip bias.
_Avoid_: Day type, market bias, sentiment

**Draw on Liquidity (DOL)**:
The next high-probability target price in the direction of the trade. Every DOL is a Relevant Level except the 18:00 Daily Open, which is a Session Context DOL on reversal days only.
_Avoid_: Target price, profit zone

**Active DOL**:
Directional exit targets highlighted on-chart with DOL badges. TP1 (nearest unmitigated HTF swing, PDH/PDL, or PWH/PWL in bias direction, or Daily Open on reversal days) and final TP (furthest eligible level within the ADR band) are both visible simultaneously as `TP1` and `TP2` badges. HTF FVGs are not Active DOL candidates. Separate from Session POI.
_Avoid_: Target, take profit line

**Catch-Up Play**:
A continuation trade execution on a lagging asset when a highly correlated leading asset has already reached its Draw on Liquidity (DOL) target and is in passive consolidation, expecting the lagging asset to trade to its own equivalent target level.
_Avoid_: Lagging entry, delay trade

**Continuation Play**:
A trade execution in the direction of the dominant expansion trend after a key level has been broken or when a reversal setup fails, targeting the next Higher Timeframe Draw on Liquidity.
_Avoid_: Trend-following, momentum trade

**18:00 Daily Open**:
The opening price of the current CME daily session at 18:00 ET. A session reference price used as TP1 on large-wick reversal days when the daily range is nearly consumed.
_Avoid_: Daily open, session open

**Average Daily Range (ADR)**:
The average range (high minus low) of the last 14 completed CME daily sessions. Rendered as faint dashed lines at Daily Open ± ADR with a consumption label showing how much of today's range has been used.
_Avoid_: Daily range, ATR

**Expansion Leg**:
The directional price move whose 50% retracement gates Continuation POI eligibility and invalidation. Origin: the most recent opposing 1H swing point preceding the bias-flip close through PD 50% Midpoint (a 1H swing low for a bullish leg, a 1H swing high for a bearish leg). Terminus: the current extreme in the bias direction since that origin (highest high for bullish, lowest low for bearish), updating live. Anchoring the origin on the 1H swing keeps the leg tight so only shallow retracements qualify. Distinct from the post-entry, sweep-anchored leg used by the playbook's 50% Equilibrium Rule for trade management.
_Avoid_: Impulse leg, displacement leg, expansion swing

## Indicator

**Visual Dependency Phase**:
A build layer for the TradingView indicator ordered by what must exist on-chart before the next layer can render meaningfully — structural levels first, then session context, then cross-asset signals, then execution triggers, then trade management.
_Avoid_: Playbook phase, workflow step

**Structural Canvas**:
The always-visible foundation layer of the indicator: Relevant Levels at the same prices across monitored chart timeframes (Daily through 1m), with Session POI visually emphasized. PDH/PDL, PWH/PWL, and HTF Swing Points render as labeled solid lines on every timeframe. HTF FVGs render as shaded zones on their native 4H and 1H charts only.
_Avoid_: Background levels, static overlay

**Session Context**:
The always-visible session reference layer sitting above Structural Canvas: 18:00 Daily Open (dashed labeled line), ADR band (faint dashed lines at open ± ADR with consumption label). These are not Relevant Levels and are never Session POI.
_Avoid_: Session markers, time levels
