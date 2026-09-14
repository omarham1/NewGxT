# Garrett NWOG — New Week Opening Gap (Doc Alignment)

**Research date:** 2026-09-14

**Question / goal:** How does Garrett (GxtTrades / GxT / `@GxTradez`) define **NWOG / New Week Opening Gap**, and **what does he use it for**? Map that onto NewGxT’s CME calendar and existing canvas so the product could draw it — without treating ICT / TTrades construction as Garrett’s unless he says it on audio.

**Out of scope:** Editing `CONTEXT.md`, ADRs, Pine, or `level-engine/`. Implementing the overlay. Inventing wick-vs-body mitigation as Garrett’s rule.

**Builds on (do not duplicate wholesale):**

- [`gxttrades-model-alignment.md`](gxttrades-model-alignment.md) — gap continuation / SMT-in-gap / weekly open as wick cap (not NWOG)
- [`garrett-psp-definition-and-use.md`](garrett-psp-definition-and-use.md) — format / method template
- [`4h-profiling-session-windows-cme.md`](4h-profiling-session-windows-cme.md) — 4H Profiling clock; YouTube ID **now recovered** as [`ayW4VPUw2yk`](https://www.youtube.com/watch?v=ayW4VPUw2yk)
- [`indicator-strategy-coverage-audit.md`](indicator-strategy-coverage-audit.md) — Session Context inventory (Daily Open present); **NWOG is not a glossary term**, so it is **absent** from both glossary and indicator
- `CONTEXT.md` — Daily Open, PWH/PWL, Fair Value Gap, HTF FVG, Session Context vs Structural Canvas
- `docs/adr/0007-htf-fvg-display-rules.md` — 3-candle wick FVG; native-TF boxes; Friday→Sunday weekend note is **HTF FVG lookback**, not NWOG
- `docs/adr/0003-daily-bias-and-target-selection.md` — Daily Open TP1 on reversal days
- `level-engine/src/session-calendar.ts` — CME daily 18:00 ET; weekly Sunday 18:00–Friday 17:00; holiday Monday → Tuesday 18:00 week-open
- `level-engine/src/session-rails.ts` — `dailyOpen = currentDaily[0].open`
- `pine/gxt-correlated-asset-indicator.pine` — `showDailyOpen` / draw `"Daily Open"`

---

## Sources consulted

### Primary (first-party Garrett audio / auto-transcript)

| Source | URL | Channel | Role this pass |
|---|---|---|---|
| **GxT \| Asset Synchronization Series: Part 1/3** | https://www.youtube.com/watch?v=G-M-ElP1MOE | Garrett (`@GxTradez`) | **Strongest operational use:** NWOG + NDOG as the **two gap draws he actually uses**; homework to “look at the new week opening gap” vs current week range |
| GxT \| 4H Profiling | https://www.youtube.com/watch?v=ayW4VPUw2yk — full text also https://sozai.app/transcript/gxt-4h-profiling/ | Garrett | One spoken “**new week opening gap**” as **added confluence** inside a worked Asia-reversal example |
| A Deeper Dive Into SMT Divergence… | https://www.youtube.com/watch?v=eADu2pFnyAU | Garrett | SMT **inside** the NWOG = “really high probable signature” |
| Strength Switching \| Confirming Expansions With Strength Switch | https://www.youtube.com/watch?v=wVS09HYcp_I | **erik** (`@eriktrades9`) — Garrett pedagogy (same corpus as prior notes) | Weekend news → “**huge new week opening gap**”; Monday trades back higher as expansion day |
| GxT Invalidations \| Continuations | https://www.youtube.com/watch?v=8COEXpSIXJo | Garrett | NWOG **aligned with a low** + SMT / swing → expansion |
| The GxT Model \| 4H PO3 Made Mechanical | https://www.youtube.com/watch?v=BueHY7EFUx0 | Garrett | Retracement low **formed within** the NWOG; “very sensitive” |
| GxT - How I Traded Everyday This Week | https://www.youtube.com/watch?v=SOiONZ4EtvI | Garrett | **Target:** “Monday **new week opening gap** or the 1,800 high” on all three assets |
| How I Confirm Narrative With Drivers \| GxT | https://www.youtube.com/watch?v=tb0Lo5DMBMM | Garrett | “We’re **in** the new week opening gap” + PDA alignment (ASR: “new **weak** opening gap”) |
| The GxT Model \| Weekly Trading Recaps \| Part 1 | https://www.youtube.com/watch?v=0zL4ACXZCJo | Garrett | Asia wick **rejects** the NWOG; NDOG as resistance after close below |
| GxT \| Community Back-Testing Stream (Hard Price Action) | https://www.youtube.com/watch?v=6YW3KNQ8smE | Garrett | Live: trade into NWOG (self-corrects from “new day”); **resistance**; **bank holiday** chart oddity |
| GxT \| Trade Recap \| My Best Trading Day Ever! | https://www.youtube.com/watch?v=l8koW20yh9M | Garrett | **NDOG** (not NWOG) as a target next to Daily Open |
| GxT \| Trade Recap \| +4R | https://www.youtube.com/watch?v=0Pd_OFaVcQ0 | Garrett | Marks **this** NDOG; says he doesn’t use **previous day’s** NDOG in that failure-swing example |
| The GxT "Universal Sequence" | https://www.youtube.com/watch?v=oucPinjDdlk | Garrett | **No** “new week opening gap”; **weekly open** as wick-cap / range objective (different object) |
| GxT \| Precision Swing Point \| Pt.1 | https://www.youtube.com/watch?v=iXRQg-OpO6Y | Garrett | “Friday closes” / “weekly opens low first” = **candle profiling**, not NWOG construction |
| A Complete Trading Framework… \| GXT (TTrades guest) | https://www.youtube.com/watch?v=3eVxTV_7L2U | TTrades host; **Garrett speaking** | **Zero** NWOG / NDOG / “new week opening gap” hits |
| GxT \| Asset Synchronization Series: Part 2/3 | https://www.youtube.com/watch?v=y-h5e9PlZ9g | Garrett | **Zero** NWOG/NDOG phrase hits |
| GxT \| 4H candle-profile / other recaps searched | `LVnNCUg55m4`, `TkyRqgEhl2c`, `USR-Ii4l9uA` | Garrett | **Zero** NWOG/NDOG phrase hits |
| GxT \| Decoupling Lecture (sozai) | https://sozai.app/transcript/gxt-decoupling-lecture/ | Garrett | **No** NWOG/NDOG (only “Sunday” as stream scheduling) |

**Phrase inventory (this pass, auto-captions + sozai 4H Profiling):** spoken **“new week opening gap”** ≈ **11 distinct uses** across **10 videos** (Asset Sync Pt.1 has two). Spoken **“NWOG” / “NDOG” as letters: 0** in every flat searched. Spoken **“new day opening gap”** is the paired sibling (Asset Sync Pt.1, Best Trading Day, +4R, Weekly Recaps Pt.1, Community Stream, erik `ZTIRoNI8HGs`). `@GxTradez` **video titles: none** contain NWOG, NDOG, “opening gap”, or “weekly gap”.

**Transcript method:** YouTube auto-captions via `python3 -m yt_dlp --write-auto-sub` (2026-09-14), flattened under gitignored `docs/research/_tmp_transcripts/`. 4H Profiling cross-checked against sozai full transcript. **ASR caveat:** “NWOG” never appears as an acronym so there is nothing to normalize; “new **weak** opening gap” = NWOG ([tb0Lo5DMBMM](https://www.youtube.com/watch?v=tb0Lo5DMBMM)); “new **date** opening gap” = NDOG ([0Pd_OFaVcQ0](https://www.youtube.com/watch?v=0Pd_OFaVcQ0)); “sero profile” left uninterpreted ([6YW3KNQ8smE](https://www.youtube.com/watch?v=6YW3KNQ8smE)); “disconlance” ≈ confluence ([BueHY7EFUx0](https://www.youtube.com/watch?v=BueHY7EFUx0)). Quotes below keep obvious ASR in brackets.

### Local NewGxT claims (comparison set — **not Garrett’s definition**)

| File | Role |
|---|---|
| `CONTEXT.md` | No NWOG/NDOG glossary entry. **18:00 Daily Open** = session open print. **PWH/PWL** = Sunday 18:00–Friday 17:00 extremes. **FVG** = 3-candle wick zone; mitigate on later **body close**. **HTF FVG** native 4H/1H only; weekend lookback is Friday session → Sunday 18:00 **for FVG eligibility**, not a weekend true-gap object. Session Context vs Structural Canvas. |
| `docs/adr/0007-htf-fvg-display-rules.md` | Same FVG construction + “no session exists between Friday close and Sunday 18:00 open” |
| `docs/adr/0003-daily-bias-and-target-selection.md` + `0008` | Daily Open as reversal-day TP1, not a gap box |
| `level-engine/src/session-calendar.ts` | Daily 18:00 ET; weekly Sun 18:00–Fri 17:00; holiday Monday → Tuesday 18:00 week-open |
| `level-engine/src/session-rails.ts` | `dailyOpen` = first bar **open** of the current daily session group |
| Pine Session Context | Dashed labeled **Daily Open** line |

### Secondary (discovery / lineage only — **not definitional authority for Garrett**)

| Source | Why secondary |
|---|---|
| ICT mentorship / blogs (e.g. ICT 2024 Lecture 3 notes: Friday ~17:00 NY close → Sunday/Monday ~18:00 reopen; CE 50%; keep multiple historical NWOGs) | **Owns the acronym NWOG** and the two-print construction. Garrett never adopts this lecture on the audio searched. |
| sozai [NWOGS & NDOGS Explained](https://sozai.app/transcript/nwogs-ndogs-explained/) | Bootcamp educator (free Discord, Anchorage TZ, **projected defined ranges**, 25/50/75 inside the gap, “does not turn inversion”, current week only). **Not Garrett.** Construction: last Friday candle **close** vs first Sunday candle **open**; extend all week; skip 1-tick gaps. |
| TTrades / other “NWOG indicator” pages, LuxAlgo, TradingView NWOG scripts | Third-party mechanizations of ICT |
| [Path to Profitability: Advanced Imbalance](https://sozai.app/transcript/path-to-profitability-advanced-imbalance/), [HTF Level Picking](https://sozai.app/transcript/htf-level-picking-key-strategy/) | Speak “new week opening gap”; **not `@GxTradez`** |
| erik `ZTIRoNI8HGs` NDOG+SMT | Supporting live pedagogy adjacent to Garrett; not a construction lecture |

---

## What was found

### 1. Does Garrett own a NWOG **definition**?

**Garrett (primary):** **No construction lecture.** He **uses the long English name** as if the audience already knows the object. He never says “NWOG stands for…”, never “Friday close to Sunday open”, never names the two prints or a clock for this object, never says 3-candle weekly FVG, never says 25/50/75 or consequent encroachment, never says inversion / fill-deletes-the-level.

**Hit honesty:** letters **NWOG = 0**. Phrase **“new week opening gap”** is real but **sparse** — operational asides in recaps and one Asset Sync sentence, not a dedicated video. Closest definitional-adjacent line is *use*, not geometry:

> “I don't really use gaps. I'm not going to lie. I really don't use gaps. I will use like a **new week opening gap**. Uh cuz that is something that really does **get filled** or a **new day opening gap**. … those are really **two draws** that I use.”  
> — [G-M-ElP1MOE](https://www.youtube.com/watch?v=G-M-ElP1MOE)

**NewGxT interpretation:** If NewGxT draws a Friday-close ↔ Sunday-open box, that **geometry is imported from ICT / TTrades lineage**, then **labeled in Garrett’s vocabulary** because he already talks about the object. It is **not** a Garrett-owned spec.

### 2. What he uses it for (spoken)

| Use | Garrett (primary) | Cite |
|---|---|---|
| **Magnet / draw / fill** | One of two gap types he will actually target; “really does get filled” | [G-M-ElP1MOE](https://www.youtube.com/watch?v=G-M-ElP1MOE) |
| **Explicit TP** | Monday NWOG (or 18:00 high) as the day’s target on **all three assets** | [SOiONZ4EtvI](https://www.youtube.com/watch?v=SOiONZ4EtvI) |
| **Confluence / PDA alignment** | “Within” / “in” the NWOG; aligned with a low; “very sensitive” | [ayW4VPUw2yk](https://www.youtube.com/watch?v=ayW4VPUw2yk); [tb0Lo5DMBMM](https://www.youtube.com/watch?v=tb0Lo5DMBMM); [BueHY7EFUx0](https://www.youtube.com/watch?v=BueHY7EFUx0); [8COEXpSIXJo](https://www.youtube.com/watch?v=8COEXpSIXJo) |
| **Resistance / reject** | Asia wick rejects NWOG; live “kind of having some resistance there” | [0zL4ACXZCJo](https://www.youtube.com/watch?v=0zL4ACXZCJo); [6YW3KNQ8smE](https://www.youtube.com/watch?v=6YW3KNQ8smE) |
| **SMT in / at the gap** | SMT **inside** NWOG = high-probability signature; NWOG aligned with swept low + SMT | [eADu2pFnyAU](https://www.youtube.com/watch?v=eADu2pFnyAU); [8COEXpSIXJo](https://www.youtube.com/watch?v=8COEXpSIXJo) |
| **Weekly FVG analog?** | **Not said.** He treats it as a named **opening gap**, not as HTF 3-candle FVG. Universal Sequence “gaps” remain displacement FVGs. | Contrast [oucPinjDdlk](https://www.youtube.com/watch?v=oucPinjDdlk) |
| **Inversion / ignore after fill** | **Not said** for NWOG. He still points at it mid-week as confluence. | — |
| **Ignore / don’t use generic gaps** | He **downranks ordinary FVGs as objectives** and **keeps** NWOG/NDOG as the exceptions | [G-M-ElP1MOE](https://www.youtube.com/watch?v=G-M-ElP1MOE) |

Primary quotes:

> “Go look at the **new week opening gap**. You can use the **current week range**. … I traded that twice.”  
> — [G-M-ElP1MOE](https://www.youtube.com/watch?v=G-M-ElP1MOE)

> “we're also **within that new week opening gap**. … that's **added confluence**, really.”  
> — [ayW4VPUw2yk](https://www.youtube.com/watch?v=ayW4VPUw2yk) (same line on sozai 4H Profiling ~53:17)

> “it's also between or **inside of the new week opening gap**. It's another really **high probable signature**.”  
> — [eADu2pFnyAU](https://www.youtube.com/watch?v=eADu2pFnyAU)

> “we have the **new week opening gap** here **aligned with this low**. So when we hit this low, we also have **SMT**.”  
> — [8COEXpSIXJo](https://www.youtube.com/watch?v=8COEXpSIXJo)

> “the low of this retracement is also formed **within the new week opening gap**. … price reacts around this level. It's **very sensitive**.”  
> — [BueHY7EFUx0](https://www.youtube.com/watch?v=BueHY7EFUx0)

> “price on all three assets will likely hit that **Monday new week opening gap** or the 1,800 high. … this is **my target**.”  
> — [SOiONZ4EtvI](https://www.youtube.com/watch?v=SOiONZ4EtvI)

> “we're opening up **Monday**. I'm pretty sure this is when news dropped like **weekend**, so we got this **huge new week opening gap** and we trade back higher and we're closing this as an **expansion day**.”  
> — [wVS09HYcp_I](https://www.youtube.com/watch?v=wVS09HYcp_I)

> “Asia session … **reject the new week opening Gap**”  
> — [0zL4ACXZCJo](https://www.youtube.com/watch?v=0zL4ACXZCJo)

**Do not confuse with “weekly open”.** Universal Sequence / PSP talk about **weekly open** as the **open of the weekly candle** (wick-cap / “opens low first”). That is **one print**. NWOG, when drawn the ICT way, is a **zone between two prints**. Garrett uses both phrases; they are not interchangeable on his audio.

### 3. NDOG pairing

**Garrett (primary):** He **pairs** NDOG with NWOG as the other “draw that I use.” He marks NDOG on recaps, targets it next to Daily Open, treats a close below it as resistance, and in one recap prefers **this day’s** NDOG over the **previous day’s**.

> “here I'm just targeting the **new day opening gap** here or the **daily open**.”  
> — [l8koW20yh9M](https://www.youtube.com/watch?v=l8koW20yh9M)

> “I'm only marking out **this** new day opening gap. I don't really use the **previous day's** new [day] opening gap”  
> — [0Pd_OFaVcQ0](https://www.youtube.com/watch?v=0Pd_OFaVcQ0)

He still **does not** specify 17:00 vs 18:00 vs TTrades’ 16:45–18:00 halt window.

**NewGxT interpretation:** NDOG = true gap across the **daily** halt (last print of session N vs first print of session N+1). Distinct from the **Daily Open line** (one edge of that gap).

---

## Implementation mapping (NewGxT canvas)

Every subsection answers with **Garrett (primary)** vs **NewGxT interpretation / implementation proposal**. ICT/TTrades rules are cited only as lineage for the proposal, never as Garrett.

### Construction

**Garrett (primary):** Unspecified. Two prints and clock **not spoken**.

**Lineage (secondary, ICT / TTrades bootcamp):** True gap = **Friday last close** vs **Sunday first open**. Not a 3-candle FVG. If there is no gap (or a 1-tick gap), they do not mark it.

**NewGxT interpretation / implementation proposal:** Map that lineage onto the **existing CME calendar**, do not invent a third clock:

| Edge | Proposed print | Already in engine? |
|---|---|---|
| Gap low/high bound A | **Last close** of the completed Friday daily session (session that **ends Friday 17:00 ET** — Thursday 18:00 → Friday 17:00 group) | Not stored as its own rail today; derivable from `groupBarsByDailySession` last bar `.close` of `priorFridayDailySessionKey` |
| Gap bound B | **First open** of the new CME week = **Sunday 18:00 ET** first print = Monday daily candle open | **Yes** — this **is** `dailyOpen` on the first daily session of the week (`session-rails.ts` `currentDaily[0].open`) |
| Holiday week | Week-open **Tuesday 18:00 ET** when Monday is a CME holiday (`session-calendar.ts`) | **NewGxT choice** — Garrett did not specify. Community stream notes a **bank holiday** made the gap “not even showing on the daily chart” ([6YW3KNQ8smE](https://www.youtube.com/watch?v=6YW3KNQ8smE)) without giving a substitute rule. |
| No true gap | If Sunday 18:00 open **equals** Friday 17:00 close (or spread below a min tick threshold), **draw nothing** | **NewGxT choice**, matching TTrades “sometimes there’s not going to be a gap” — **not** spoken by Garrett. Opening **inside Friday’s range** but **off Friday’s close** is still a true NWOG (gap is close↔open, not close↔Friday H/L). |

This is **not** HTF FVG construction (C1 wick–C3 wick, 3 candles, native TF). ADR-0007’s sentence that “no session exists between Friday close and Sunday 18:00 open” is the **same calendar hole**, used today only to keep **Friday 4H/1H FVGs** eligible on Monday — **not** to draw the weekend void.

### Visual

**Garrett (primary):** He **marks it** and **drags it** in recaps (“if I show you here”; “dragged it over” is NDOG in Weekly Recaps). Implies a **zone**, not a single Daily Open rail. No TF restriction spoken. No 25/50/75 spoken.

**NewGxT interpretation / implementation proposal:**

- **Box** (Session Context fill) between the two prices, **or** two dashed rails labeled `Fri Close` / `Week Open` plus optional light fill. Prefer a **box**: Daily Open already occupies the Sunday-open print; a second object that is only that print would duplicate `showDailyOpen`.
- **Charts:** treat like **Daily Open / PWH** — **all execution TFs**, not ADR-0007 native-4H/1H-only. NWOG is a **calendar gap**, not a 4H/1H pattern.
- **Extend** to **Friday 17:00 ET** week close (same `getWeeklySessionKey` window as PWH/PWL). Historical weeks: **NewGxT choice** (Garrett says “current week range” once; TTrades “current week only”; ICT “keep ~4–5”). Default proposal: **current CME week only**, to match his “go look at the new week opening gap / current week range” homework and to avoid canvas clutter.

### Lifecycle

**Garrett (primary):** Still referenced **after** price has traded through it (confluence, resistance, “within”). **No** “mitigate on body close”, **no** “inversion after fill”, **no** “delete when filled”. Fill is why he **likes** it as a draw, not a stated expiry.

**NewGxT interpretation / implementation proposal:**

- **Remain on canvas for the CME week** even after trade-through (Session Context, like Daily Open — Daily Open does not vanish when tagged).
- **Do not** apply FVG body-close mitigation (`CONTEXT.md` Fair Value Gap) unless product later **chooses** a mute-on-fill style — that would be a **NewGxT** rule, not Garrett.
- **Week roll:** drop or replace at next Sunday 18:00 (same roll as PWH/PWL values).
- Wick vs body: **flag as NewGxT choice**; Garrett silent.

### Role vs existing objects

| Object | Distinct? | Proposed role |
|---|---|---|
| **18:00 Daily Open** | Yes — **one price** (Sunday open on Monday’s session). NWOG’s **other** bound is Friday close. On Monday the Daily Open line **is** NWOG edge B. | Keep Daily Open as Session Context TP1 (ADR-0008). NWOG box is additional. |
| **PWH/PWL** | Yes — prior week **extremes**, not weekend void. | Unchanged Relevant Levels. |
| **HTF FVG** | Yes — 3-candle imbalance with SMT Fill states, native TF, daily-session lookback. | Do **not** reuse FVG code path / Idle-Active-Dead unless a later ADR explicitly says so. |
| **Session POI / Active DOL** | Garrett **did** use NWOG as a **target** and as **SMT confluence**, which sounds DOL-like. He did **not** rank it as Session POI (manipulation watch). | **Proposal:** start as **Session Context only** (visible, never auto Session POI). Optional later: eligible **Active DOL / TP** when in bias direction — that would be a **product** expansion of ADR-0003’s candidate set (today: HTF swings, PDH/PDL, PWH/PWL; FVGs excluded; Daily Open reversal-only). Do not silently make NWOG a Relevant Level. |

### Cross-asset

**Garrett (primary):** Yes, lightly: SMT **inside** the NWOG; NWOG **aligned** with a low + SMT; target expected on **all three assets**. Not a separate “SMT-in-NWOG” model — same crack-in-correlation he already teaches at gaps.

**NewGxT interpretation:** No new SMT primitive required to **draw** NWOG. If later DOL/SMT Fill logic is added, treat NWOG like a **level** the triad can tag, not like a 3-candle FVG C3.

### Holidays / true gap vs overlap

**Garrett (primary):** Holiday mentioned as a **display glitch**, not a spec. No “still draw a box if Sunday opens inside Friday’s range.”

**NewGxT interpretation:** No gap → no box. Holiday Monday → use **Tuesday 18:00** first print vs **prior Friday 17:00** close (`isFirstDailySessionOfCmeWeek` already knows this pattern for FVG lookback).

### NDOG (if shipping a sibling)

**Proposal (NewGxT):** box last session **close** (17:00 ET) vs this session **open** (18:00 ET). Daily Open line already shows the open. Lifecycle: current daily session (Garrett: this day’s NDOG in +4R). Halt window: **NewGxT 17:00–18:00**, not TTrades 16:45–18:00, unless futures product specs say otherwise — **product choice**, not Garrett.

---

## Alignment table + recommendations

| Topic | Status | Gap | Recommendation |
|---|---|---|---|
| Acronym NWOG in glossary | **Absent** | Garrett never says the letters; community/ICT does | If adopted: glossary title **New Week Opening Gap**; `_Avoid_: NWOG` optional alias — **or** allow NWOG as short form with credit that letters are ICT-lineage |
| Two-print construction | **Unspecified by Garrett** | Engine has Sunday open, not Friday close rail | **Mechanize from CME calendar** (proposal above); document as **NewGxT + ICT lineage**, not “Garrett said Friday 17:00” |
| Use as draw / confluence / SMT location | **Spoken** | Not in CONTEXT / canvas | Optional Session Context box; SMT stays existing crack logic |
| Distinct from Daily Open / FVG / PWH | **Needed** | Easy to smuggle into HTF FVG | Keep a **separate object**; do not reuse ADR-0007 FVG mitigation |
| 25/50/75, inversion, multi-week history | **Not Garrett** | TTrades/ICT | **Do not** ship unless product explicitly wants ICT extras |
| NDOG | **Paired by Garrett** | Absent | Separate small ADR/research if both ship; don’t bury NDOG inside NWOG |

### Concrete doc actions (do **not** write in this pass)

1. **Keep:** Daily Open, PWH/PWL, HTF FVG rules unchanged until an ADR names NWOG.
2. **If adopting:** `CONTEXT.md` Session Context entry; short ADR (canvas + calendar prints + not-an-FVG); playbook optional “weekend gap as confluence / possible target.”
3. **Defer:** NDOG sibling; Active DOL eligibility; CE/midline; historical NWOG stack.

---

## Explicit answer (for doc owners)

1. **Definition:** Garrett **does not** define NWOG as two prints + a clock. He **names** “new week opening gap” and **uses** it. Geometric authority for a drawable box is **ICT/TTrades lineage**, mapped onto NewGxT CME **Friday 17:00 last close vs Sunday 18:00 first open**.
2. **Uses he actually teaches:** draw/fill magnet, mid-week confluence/sensitivity, PDA alignment with highs/lows, **SMT in/at the gap**, resistance/reject, occasional **explicit target** (including triad). He **pairs NDOG**. He does **not** teach inversion, 3-candle weekly FVG, or CE.
3. **Canvas:** New object, **Session Context box** (not Daily Open duplicate, not HTF FVG). Engine already has week-open print via `dailyOpen`; needs Friday session **close**. No gap → no draw. Holiday week-open = existing Tuesday 18:00 rule as **NewGxT** choice.
4. **Does Garrett own NWOG?** He **owns the use in his model** (rare, but first-party). He **does not own the construction**. Shipping the ICT box **because Garrett says the words** is **importing ICT via him** — say that in the ADR.

**This note:** `docs/research/garrett-nwog-new-week-opening-gap.md`

---

## Open questions

1. Private Discord / paid Q&A construction (if any) not in the public `@GxTradez` + known erik corpus.
2. Min gap size (ticks / ADR fraction) — Garrett silent; TTrades “handful of ticks.”
3. Whether NWOG should ever enter ADR-0003 Active DOL (he targeted it once as “my target”).
4. NDOG halt: 17:00–18:00 vs 16:45–18:00 vs RTH 16:00 — product/futures spec, not Garrett.
5. Twitter “fact check” trades referenced in Asset Sync Pt.1 were not retrieved this pass.

---

## Recommended next docs (do not write those docs in this pass)

1. `CONTEXT.md` Session Context glossary stub **if** the product adopts the box (construction labeled NewGxT mechanization / ICT lineage).
2. A small ADR: NWOG canvas + calendar prints + “not an HTF FVG” + week lifecycle.
3. Optional sibling research: **Garrett NDOG / new day opening gap** (he pairs it more often than he defines NWOG).
4. Playbook one-liner only after glossary/ADR exist.

---

## Method notes

- Prefer `@GxTradez` audio, Garrett-on-TTrades, sozai **GxT \| 4H Profiling**, and the erik Strength Switching corpus already used in prior notes.
- Channel inventory 2026-09-14: `@GxTradez` `/videos` titles scanned; **no** NWOG-titled lecture.
- sozai library search `gxt NWOG` / `gxtradez` / `GxtTrades`: 4H Profiling + Decoupling Lecture only; NWOGS Explained is **another speaker**.
- Quotes from auto-captions (2026-09-14) and sozai 4H Profiling; treat ASR as noted above.
- ICT / TTrades / indicator blogs consulted only to **label lineage** and to propose a drawable mapping — never as Garrett’s column.
- Raw captions left in gitignored `_tmp_transcripts/`; not committed.
