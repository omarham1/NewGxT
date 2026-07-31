# GxtTrades (Garrett / GxT) Model Alignment with NewGxT Docs

**Research date:** 2026-07-14

**Question:** How does the GxtTrades (Garrett / GxT) model define Universal Sequence, 4H Profiling, PSP, SMT, 2-Stage Divergence / 2-Stage SMT, and strength switching with correlated assets — and does NewGxT documentation need changes to align?

---

## Sources consulted

### Primary (first-party Garrett / GxT dialogue)

| Source | URL / path | Role |
|---|---|---|
| GxT \| 4H Profiling (full transcript) | https://sozai.app/transcript/gxt-4h-profiling/ | C1/C2/C3, expansion candles, key levels, session if-then windows, ideal SMT LOD profile |
| The GxT "Universal Sequence" - Structured Approach | https://www.youtube.com/watch?v=oucPinjDdlk | Named Universal Sequence definition, gap-continuation process, SMT fill / PSP at gaps, catch-up strength switch; spoken **"precision swing point"** |
| Strength Switching \| Confirming Expansions With Strength Switch | https://www.youtube.com/watch?v=wVS09HYcp_I | Strength switch types, SSPS / SS PSP, SMT fill as strength switch, 2-stage vs one-stage, APD, hierarchy (draw → profile → cracks) |
| GxT \| Trade Recap \| My Best Trading Day Ever! | https://www.youtube.com/watch?v=l8koW20yh9M | Live use of Universal Sequence, SMT fill, 2-stage SMT, strength switch, PSP confirmation when SMT missing at level |

### Local NewGxT docs (authoritative for “what we claim”)

| File | Role |
|---|---|
| `/Users/omarhamouda/Development/Repos/NewGxT/CONTEXT.md` | Domain glossary |
| `/Users/omarhamouda/Development/Repos/NewGxT/docs/daily_execution_playbook.md` | Day-of execution workflow |
| `/Users/omarhamouda/Development/Repos/NewGxT/docs/adr/0001-reversal-validation-rules.md` | C1/C2/C3 + 50% leg rule |
| `/Users/omarhamouda/Development/Repos/NewGxT/docs/adr/0002-strength-rotation-and-catchup.md` | Catch-up / continuation after SS |
| `/Users/omarhamouda/Development/Repos/NewGxT/docs/adr/0003-daily-bias-and-target-selection.md` | Bias + 2-Stage SMT/SS gate |
| `/Users/omarhamouda/Development/Repos/NewGxT/docs/adr/0004-timeframe-hierarchy-and-triad-specification.md` | HTF / ITF / LTF + triad |
| `/Users/omarhamouda/Development/Repos/NewGxT/docs/adr/0005-2-stage-smt-and-strength-switch.md` | Mechanical 2-Stage SMT |
| `/Users/omarhamouda/Development/Repos/NewGxT/docs/adr/0006-smt-fill-state-machine-and-execution-triggers.md` | SMT Fill state machine |

### Secondary / uncertain (not used as definitional authority)

- AI system prompts and third-party summaries that expand PSP as “Precision Swing Points” without Garrett audio (e.g. docsbot prompt pages).
- ICT / Quarterly Theory “Precision Swing Point” write-ups (different lineage; Studocu / TradingView scripts) — may share the *phrase* but are not GxT first-party.
- YouTube-to-summary pages of 4H Profiling (paraphrase only).

**Repo grep confirmation:** `Universal Sequence` / `universal sequence` — **zero matches** anywhere under NewGxT (confirmed 2026-07-14).

---

## Concept-by-concept

### 1. Universal Sequence

#### GxtTrades definition (primary)

Garrett names the model **“GxT universal sequence”** and frames it as a **mechanical continuation approach using gaps**, built on fractal “universal models” (key level → draw on liquidity):

> “I just call it um DGXT universal sequence. It's essentially using gaps for continuation.”  
> — [Universal Sequence video](https://www.youtube.com/watch?v=oucPinjDdlk)

He also equates “universal model” with framework: price from point A (key level) to point B (DOL), fractal across timeframes (IRL ↔ ERL). Same video.

**Exact step list as taught in that lecture (synthesized from Garrett’s own sequencing; not a slide title list):**

1. **Establish a universal model / framework** — hit a key level (high/low/gap); target opposing DOL (IRL↔ERL or manipulation-range opposite extreme).
2. **Confirm with a swing formation** — one of three: C2 closure, C3 closure, or C2 reversal-to-expansion (small wick).
3. **Set invalidation** — mark equilibrium (EQ) of the prior candle’s relevant range (wick or full body depending on candle type); demand expansion (shallow retrace / small wick).
4. **Refine the key level** — within EQ / close to HTF open, pick an **aligned lower-TF gap** (fractal: weekly→daily gap, daily→4H gap, 4H→1H/30m gap, etc.).
5. **After confirmed reversal, let expansion print gaps** — gaps are evidence the reversal is real (“reversal signature = expand away”).
6. **On retrace into the selected gap, require an SMT sequence** — preferably:
   - **SMT fill** (one asset into gap, correlated asset not), or
   - if both assets hit the gap: **PSP** (difference in closes / swing-point SMT), or
   - strength-switch variants (SMT fill / SS PSP) for catch-up.
7. **Execute continuation** toward the open DOL; prefer the weaker asset when SMT fill is present; use candle logic (small wick → trade now; large wick → wait C2/C3).

Garrett’s **highest-probability packaging** (same video + trade recap):

> Reversal (ideally with SMT / 2-stage) → expansion creates a gap → **SMT in the gap / SMT fill** = Universal Sequence.  
> — [oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk); [l8koW20yh9M](https://www.youtube.com/watch?v=l8koW20yh9M) (“GXT universal sequence the highest probable model… when you have SMT in the gap”)

Continuation SMT fill is **one-stage**; he explicitly says you do **not** need 2-stage SMT again at the continuation gap once the reversal already printed SMT/expansion. ([oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk))

#### NewGxT definition

**Not documented as a named concept.** Closest operational pieces exist piecemeal:

- Key level / POI → DOL framing — `CONTEXT.md` (Relevant Level, POI, DOL); playbook Phases 1–3; ADR-0003.
- SMT Fill as continuation/catch-up trigger — ADR-0006; playbook Plays B/C; ADR-0002.
- C1/C2/C3 — `CONTEXT.md`; ADR-0001.
- No glossary entry, ADR, or playbook section titled Universal Sequence / universal model / IRL–ERL framing as Garrett packages it.

#### Alignment / gap / recommendation

| Status | **Gap (severe)** |
|---|---|
| Alignment | Partial: SMT Fill continuation / catch-up **implements the last legs** of Garrett’s Universal Sequence without naming or framing steps 1–5 as one model. |
| Gap | Missing the named sequence, fractal gap-selection-within-EQ rule, and “SMT-at-reversal → gap → SMT-fill” as the headline high-probability model. |
| Doc change | Add `Universal Sequence` to `CONTEXT.md`; add a playbook section (or ADR) that lists Garrett’s steps and maps them to existing Session POI / SMT Fill / CISD machinery. Cross-link ADR-0006 as the mechanical SMT-fill sub-state of Universal Sequence. |

---

### 2. 4H Profiling

#### GxtTrades definition (primary)

From [GxT 4H Profiling transcript](https://sozai.app/transcript/gxt-4h-profiling/):

- **Purpose:** Profile the 4H candle to time reversals/continuations by trading **only expansion candles** away from key levels.
- **Swing formations (C1/C2/C3):**
  - C2 closure most common: fail to close beyond prior candle extreme → trade next candle.
  - Wick size matters: large opposing wick → candle does **not** support expansion → wait for next candle / C3.
  - C3 closure when no C2: close above C2 body/high → trade candle 4.
  - Candle 2 = manipulation; candle 3 = distribution (Garrett’s wording).
- **Key levels (only three types Garrett says he focuses on):** highs/lows and fair value gaps (order blocks mentioned for continuation).
- **Must hit a key level** before anticipating reversal.
- **LTF confirmation inside 4H wicks:** 1H / 30m swing points; CSD/CISD optional.
- **Session / kill-zone style if-then windows (futures-oriented):**
  - Focus hours around **2:00 / 6:00 / 10:00** a.m. (and FX analogue **1:00 / 5:00 / 9:00**).
  - If earlier 4H manipulates → later 4H should continue; if it doesn’t reverse, roll expectation to next session window.
  - Ideal NY: **6:00 a.m. 4H** paired with 8:30 / 9:30 drivers; often **6:00 manipulation → 10:00 continuation**.
- **Ideal GxT profile:** low/high of day formed from **SMT manipulation** (protected swing / wick) → expansion creates the body → align subsequent **4H expansion candles** away from that LOD/HOD.
- Mark **EQ of previous candle** for continuation.

#### NewGxT definition

- C1 / C2 / C3 and CISD exist in `CONTEXT.md` and ADR-0001 / playbook Play A.
- 4H appears as an **ITF** for POI / FVG / structure (ADR-0004; playbook Step 2–5), and Session POI prefers 4H FVG in biased PD half (`CONTEXT.md` Session POI; ADR-0003).
- **No** dedicated “4H Profiling” concept, expansion-candle wick filter, session if-then kill zones, or “ideal SMT LOD → 4H expansion alignment” narrative.

**Notable divergence:** ADR-0001 states a C2 closure is validated **immediately regardless of wick size** when paired with SMT/SS. Garrett’s 4H Profiling treats large opposing wick as **disqualifying** for trading that candle as expansion (wait for next candle / C3).

#### Alignment / gap / recommendation

| Status | **Partial alignment + gap** |
|---|---|
| Alignment | C1/C2/C3 roles and “key level before reversal” match. 4H FVG as POI is a narrow slice of Garrett’s 4H framework. |
| Gap | Missing expansion-candle filter, session kill-zone if-then map, and SMT-formed daily wick → 4H expansion narrative. ADR-0001 wick rule conflicts with Garrett’s expansion filter. |
| Doc change | Either (a) document intentional NewGxT divergence (SMT/SS overrides wick filter — already implied by ADR-0001), or (b) add 4H Profiling notes to playbook Phase 2 + glossary (“Expansion Candle”, session windows). Do not silently leave both rules without a stated precedence. |

---

### 3. PSP

#### GxtTrades definition (primary)

**Operational definition (strong primary attestation):** PSP is a **cross-asset difference in candle closes** (opposite polarity) used as a crack-in-correlation / swing-point SMT when classic SMT extremes are missing or both assets hit a gap.

Evidence:

- Universal Sequence lecture: if both assets hit the gap (no SMT fill), “you need SMT via swing point. And this is where we have a PSP… **It's a difference in closes**, which is the crack in correlation in itself.” ([oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk))
- Same lecture example narration: “**A precision swing point.** … This 2200 candle is bullish. … on this asset … bearish?” ([oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk)) — Garrett **speaks the expansion “precision swing point”** once while pointing at opposite closes.
- Strength Switching lecture: asset sweeps high but **closes bearish**, correlated asset fails to sweep and **closes bullish** → “PSP strength switch” / **“SSPS” (strength switch PSP)** — highest-probability reversal signature for him. ([wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I))
- Continuation favorite: **third candle that forms the FVG is itself a PSP**, then SMT fill strength switch. (Same video.)
- Trade recap: if no SMT at the key level, confirm with swing point / **PSP**. ([l8koW20yh9M](https://www.youtube.com/watch?v=l8koW20yh9M))

**Acronym expansion:** Primary audio supports **Precision Swing Point** at least once. Garrett never says “Polarized Strength Profile” in the consulted transcripts. He repeatedly uses **PSP** as the short form and defines it by **close polarity divergence**, not by a separate geometric swing-point object.

**Weak / secondary:** Broader ICT “Precision Swing Point” literature and AI prompts — do not treat as GxT-owned definition without Garrett audio.

#### NewGxT definition

`CONTEXT.md`:

> **Polarized Strength Profile (PSP):** A condition where highly correlated assets close higher-timeframe candles (30m, 1h, 90m, 4h) with opposite polarity (one bullish, one bearish).

**Strength Switch PSP (SS PSP):** PSP after SMT where the asset that swept closes in the reversal direction while the correlated asset closes in the trend direction.

Playbook Step 7 / Play A Stage 2 offers **2-Stage PSP** as an alternate Stage 2 confirmation.

#### Alignment / gap / recommendation

| Status | **Mostly aligned operationally; acronym mismatch** |
|---|---|
| Alignment | Opposite-polarity closes + SS PSP semantics match Garrett’s SSPS examples closely. Timeframes (ITF closes) match ADR-0004. |
| Gap | Glossary expands PSP as **Polarized Strength Profile**; Garrett’s spoken expansion is **Precision Swing Point**. Risk of confusing agents/traders who read secondary “Precision Swing Point” material. |
| Doc change | In `CONTEXT.md`, keep the operational definition; either (1) retitle/expand as **Precision Swing Point (PSP)** with “also described here as polarized opposite closes,” or (2) keep Polarized Strength Profile but add a note: “Garrett (GxT) verbalizes this as Precision Swing Point; NewGxT uses Polarized Strength Profile for the same close-polarity condition.” Avoid inventing a third meaning. |

---

### 4. SMT

#### GxtTrades definition (primary)

Across consulted videos, SMT is **crack in correlation** between highly correlated assets:

- One asset sweeps / makes new extreme at a key level; the other fails / stalls / makes higher low or lower high.
- Used at **reversals** (confirm key-level interaction) and at **gaps** (SMT fill = one asset in gap, other not).
- If SMT is absent at the level itself, look for SMT **after the fact** via swing point / PSP. ([l8koW20yh9M](https://www.youtube.com/watch?v=l8koW20yh9M))
- Hierarchy: draw → profile/wick support → **then** cracks in correlation; do not pattern-trade SMT alone. ([wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I))

Garrett does not spell out “SMT = Smart Money Technique/Tool” in the consulted transcripts; he uses **SMT** as established jargon. Expansion is weakly attested here — do not assert from these sources alone.
**(Confirmed negative, 2026-07-31):** Dedicated dive + expanded primary search still find **no** spoken long-form expansion — see `docs/research/garrett-smt-spoken-expansion.md` (issue #34).

#### NewGxT definition

`CONTEXT.md`:

> **SMT Divergence:** A cross-asset discrepancy where highly correlated assets fail to make symmetrical swing highs or lows, revealing hidden institutional divergence.

> **SMT Fill:** A state machine tracking real-time participation of correlated assets as price trades within a Fair Value Gap.

ADR-0006 mechanizes SMT Fill: `Idle` → `SMT_Fill_Active` when 1–2 triad assets enter FVGs; invalid if all 3 enter.

#### Alignment / gap / recommendation

| Status | **Aligned (with useful NewGxT mechanization)** |
|---|---|
| Alignment | Divergence-at-extremes and gap SMT fill match Garrett. Triad (ES/NQ/YM) matches his index examples. |
| Gap | Minor: NewGxT’s “institutional divergence” wording is interpretive; Garrett stresses **crack in correlation** and tradability filters. Acronym expansion confirmed absent in primary set (see Open question #2 / `garrett-smt-spoken-expansion.md`). |
| Doc change | Optional: add “crack in correlation” as preferred synonym in glossary Avoid list / aliases. Leave SMT letters unspecified (no Technique/Tool). No urgent rewrite of ADR-0006. |

---

### 5. 2-Stage Divergence / 2-Stage SMT

#### GxtTrades definition (primary)

Garrett’s **two-stage** (also “two-stage SMT”, “two-stage crack”, sometimes “two-stage PSP”):

- **Stage 1:** Larger-range / relevant SMT at a **key level** (or first crack).
- **Stage 2:** Smaller-range confirming SMT and/or **strength switch** (including SS PSP / alternating roles) — e.g. daily SMT confirmed by 90m SMT; or first SMT then strength-switch PSP. ([l8koW20yh9M](https://www.youtube.com/watch?v=l8koW20yh9M); [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I); [oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk))
- Purpose: makes the **reversal tradable**; absence of 2-stage does **not** mean a LOD/HOD cannot form — it means he won’t take the reversal entry as cleanly. ([wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I))
- Continuation / Universal Sequence gap fills are typically **one-stage** after a prior reversal SMT. ([oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk))
- Must be at a **key level**; hierarchy forbids blind 2-stage pattern trading. ([wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I))

#### NewGxT definition

`CONTEXT.md` **2-Stage SMT:** HTF SMT (Stage 1) → LTF alternating SMT sweep (lagging asset drives through its extreme; leading holds HL/LH) → strength switch.

**ADR-0005:** Stage 2 locked on **LTF** (`15m/5m/3m/1m`) via alternating sweep + any-triad C2/C3; synergy filter on third asset.

**Playbook Step 7 / Play A:** Stage 2 on **“IMT”** (`15m / 30m / 1H / 90m`) as second SMT **or** Strength Switch PSP, **then** drop to LTF for C1→C2→C3 / CISD. Uses undefined label **IMT** (ADR-0004 only defines HTF/ITF/LTF; and places `15m` in LTF).

**ADR-0003:** Reversal bias requires full 2-Stage SMT/SS; aggressive fallback without it.

#### Alignment / gap / recommendation

| Status | **Conceptually aligned; internal NewGxT conflict + Stage-2 TF mismatch** |
|---|---|
| Alignment | HTF crack → confirming lower-range crack / strength switch matches Garrett. Synergy / 2-of-3 triad matches his ES/NQ/YM practice. Fallback when no clean 2-stage echoes Garrett’s “not tradable as reversal” nuance (NewGxT continues via aggressive path). |
| Gap | (1) Playbook vs ADR-0005 disagree on where Stage 2 lives and whether PSP is Stage 2. (2) “IMT” is undocumented. (3) ADR-0005’s alternating-sweep definition is more rigid than Garrett’s broader Stage-2 (any smaller-range SMT / SS PSP). |
| Doc change | Reconcile playbook ↔ ADR-0005 ↔ CONTEXT in one pass; pick Garrett-compatible Stage-2 band (likely ITF confirming HTF, then LTF entry — closer to playbook + Garrett 90m examples). Rename IMT → ITF or define IMT. Soften ADR-0005 if SS PSP alone can complete Stage 2 (as playbook and Garrett allow). |

---

### 6. Strength switching with correlated assets

#### GxtTrades definition (primary)

From [Strength Switching](https://www.youtube.com/watch?v=wVS09HYcp_I) and Universal Sequence / recap:

- **Why:** When one asset has already met an objective (hit high/low) or assets are **decoupled**, a strength switch lets both expand / catch up (tug-of-war resolved when one asset hits a relevant level and stops pulling).
- **Forms of strength switch (primary-attested):**
  - **SSPS / SS PSP** — sweep asset closes reverse polarity; non-sweep closes opposite → roles flip.
  - **SMT fill / gap fill** as strength switch (lagging fills gap / leads continuation).
  - Temporary LTF switches that do **not** permanently redefine HTF lead.
  - Catch-up: leading asset fails to manipulate a level; lagging switches weaker/stronger and runs to the same DOL (Universal Sequence “asset synchronization” section).
- **Trade the stronger asset for clean reversals** after SS; for SMT fill continuations often trade the **weaker** asset into the gap. ([oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk); playbook-compatible)
- Prefer SS between **weakest and strongest** (e.g. YM vs NQ). ([l8koW20yh9M](https://www.youtube.com/watch?v=l8koW20yh9M))
- ES often “byproduct” of NQ/YM when those two decouple. ([wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I))

#### NewGxT definition

`CONTEXT.md` **Strength Switching:** reversal of relative strength/weakness during a structural shift (institutional rotation).

ADR-0002: after SS, all triad assets expected to reach corresponding DOL; trade lead (clean V); catch-up lagging via ITF FVG SMT Fill + LTF CISD; continuation beyond high/low similarly.

Playbook Plays A–C encode the same rotation / catch-up / continuation tree; forbid reversing lagging while lead consolidates without full 2-Stage SMT/SS (ADR-0003).

#### Alignment / gap / recommendation

| Status | **Strongly aligned** |
|---|---|
| Alignment | Catch-up after failed manipulation, SMT fill triggers, trade-lead on reversal, dual-path continuation — map cleanly to Garrett. |
| Gap | NewGxT under-documents **decoupled-market tug-of-war** protocol and “wait until one asset hits a relevant level before SS trade” (Garrett’s 9:30 indices lecture content). APD sequence named by Garrett is absent from NewGxT docs (may be out of scope). |
| Doc change | Add a short “Decoupled strength / asset sync” note to ADR-0002 or playbook Phase 3; optional glossary Avoid: APD until primary step-list is locked. |

---

## Summary table of alignment status

| Concept | GxtTrades primary clarity | NewGxT coverage | Alignment |
|---|---|---|---|
| Universal Sequence | High (dedicated video) | **Absent as named model** | **Gap (severe)** — pieces exist as SMT Fill / continuation |
| 4H Profiling | High (dedicated video) | Partial (4H FVG POI, C1–C3 only) | **Partial** — missing session profile + wick filter conflict |
| PSP | High operationally; acronym = Precision Swing Point (spoken once) | High as Polarized Strength Profile | **Operational align / naming diverge** |
| SMT | High operationally; acronym expansion weak | High + mechanized Fill | **Aligned** |
| 2-Stage SMT | High | High but playbook ≠ ADR-0005 | **Partial** — internal doc conflict |
| Strength switching | High | High (ADR-0002 + playbook) | **Aligned** — minor decoupled-market gap |

---

## Prioritized documentation change recommendations

Do **not** edit these files in this research task; recommendations only.

### P0 — Fix contradictions / severe omissions

1. **`CONTEXT.md` + new ADR or playbook section — Universal Sequence**  
   - Add glossary entry.  
   - Document the 7-step continuation sequence above and map to Session POI / Expansion FVG / SMT Fill (ADR-0006) / CISD.  
   - State explicitly: Universal Sequence is Garrett’s headline continuation model; NewGxT’s Catch-Up / Continuation plays are implementations of its gap+SMT-fill legs.

2. **Reconcile 2-Stage SMT: `docs/adr/0005-…md` ↔ `docs/daily_execution_playbook.md` ↔ `CONTEXT.md`**  
   - Resolve Stage-2 timeframe band (ITF vs LTF).  
   - Decide whether SS PSP alone completes Stage 2 (Garrett + playbook yes; ADR-0005 implies alternating sweep + C2/C3).  
   - Replace undefined **IMT** with ADR-0004 vocabulary (or define IMT).

3. **`CONTEXT.md` — PSP naming note**  
   - Record Garrett’s spoken **Precision Swing Point** vs NewGxT **Polarized Strength Profile** as the same close-polarity condition; pick one canonical expansion for the repo and mention the other as alias.

### P1 — Important alignment

4. **`docs/daily_execution_playbook.md` Phase 2 — 4H Profiling / expansion candles**  
   - Optional but valuable: session if-then windows (2/6/10 ET futures), expansion-candle wick filter, SMT-formed daily wick → trade 4H expansion.  
   - Cross-reference ADR-0001: document that NewGxT **intentionally** allows C2 without wick filter when SMT/SS present (if that remains product intent).

5. **`docs/adr/0002-…md` — decoupled sync**  
   - Add Garrett’s tug-of-war rule: in decoupled opens, wait for one asset to hit a relevant level before treating SS / catch-up as high quality.

### P2 — Polish

6. Glossary aliases: “crack in correlation” ↔ SMT Divergence; “SSPS” ↔ Strength Switch PSP.  
7. ADR-0004: clarify where PSP is evaluated (ITF closes) vs where Stage-2 SMT is evaluated after reconciliation.  
8. Consider a one-page `docs/` map: Universal Sequence (continuation) vs 2-Stage SMT/SS (reversal) vs 4H Profiling (timing filter) — three layers Garrett treats as complementary, NewGxT currently flattens.

---

## Open questions / unresolved ambiguities needing primary confirmation

1. **Official PSP acronym:** Garrett says “precision swing point” once in Universal Sequence; all other primary hits use “PSP” without expansion. Confirm whether he also uses any other expansion in a dedicated PSP video (he tells viewers to “watch my video on it” — that video was not fully located/transcripted in this pass).
   - **Resolved 2026-07-29:** Dedicated first-party video located — [GxT \| Precision Swing Point \| Pt.1](https://www.youtube.com/watch?v=iXRQg-OpO6Y). Spoken expansion is repeatedly **Precision Swing Point** (“PSP for shorts”); no primary attestation of Polarized Strength Profile or any other long form. Doc recommend: **no change** (`CONTEXT.md` already canonical). Full write-up: `docs/research/psp-dedicated-video.md`.
2. **SMT long-form expansion** in Garrett’s own words (Smart Money Technique vs Tool vs other) — not confirmed in consulted transcripts.
   - **Resolved 2026-07-31:** Dedicated first-party SMT lecture located — [A Deeper Dive Into SMT Divergence](https://www.youtube.com/watch?v=eADu2pFnyAU). Garrett asks “what is an SMT?” and answers with **correlated-market divergence / crack in correlation** only; **no** spoken or title/description expansion to Smart Money Technique, Tool, Theory, or other. Same negative finding across expanded primary set (Universal Sequence, PSP Pt.1, Trade Recap, 4H Profiling, Asset Sync Pt.1, TTrades guest). Doc recommend: **leave unspecified** in glossary — do not assert Technique/Tool from ICT secondary sources. Full write-up: `docs/research/garrett-smt-spoken-expansion.md`.
3. **Exact slide title / numbered Universal Sequence checklist** — the YouTube lecture narrates steps continuously; no authoritative slide text was captured. Treat the 7-step list above as research synthesis of his narration, not a verbatim slide dump.
   - **Resolved 2026-07-31:** Full auto-transcript recheck of [The GxT "Universal Sequence"](https://www.youtube.com/watch?v=oucPinjDdlk) — no title/description checklist; spoken numbering only “step one = universal model” then “next step = invalidation (EQ).” Steps 1–7 vs ADR-0012: **no material drift**; optional wording tweaks only (EQ / “universal model” label). Doc recommend: **no reorder / no new step / no Catch-Up–Continuation redesign**. Full write-up: `docs/research/universal-sequence-step-list-recheck.md`.
4. **APD sequence** — named repeatedly in Strength Switching; relationship to Universal Sequence / 2-stage not fully mapped here. Out of NewGxT docs today.
5. **Whether NewGxT should adopt Garrett’s expansion-wick filter as hard law** or keep ADR-0001’s SMT/SS override — product decision, not settled by primary sources alone.
6. **C3 close criterion nuance:** Garrett Universal Sequence says close over C2’s **opening price**; 4H Profiling / NewGxT emphasize close past C2 **body** (and sometimes high). Needs a single rule.
7. **Kill zone / CME vs FX clock** — Garrett mixes FX and futures clocks; NewGxT is CME 18:00 ET–centric. Any 4H Profiling import must remap session windows to CME explicitly.

---

## Method notes

- Prefer quoted / paraphrased primary dialogue over secondary summaries.
- “Aligned” means operational agreement sufficient for indicator/playbook behavior, not identical marketing vocabulary.
- Absence of “Universal Sequence” in-repo was verified by full-workspace grep on 2026-07-14.
